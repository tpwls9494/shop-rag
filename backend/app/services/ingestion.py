import io
import uuid
from typing import BinaryIO

import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentChunk
from app.services.embedding import embed_texts

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


def _chunk_text(text: str) -> list[str]:
    """텍스트를 고정 크기 청크로 분할 (overlap 포함)."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c for c in chunks if c.strip()]


def _parse_pdf(file: BinaryIO) -> str:
    reader = PdfReader(file)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


async def _fetch_url(url: str) -> str:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url)
        resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


async def ingest_text(
    db: AsyncSession,
    seller_id: uuid.UUID,
    text: str,
    doc_type: str,
    filename: str | None = None,
) -> Document:
    doc = Document(seller_id=seller_id, doc_type=doc_type, filename=filename, status="processing")
    db.add(doc)
    await db.flush()

    chunks = _chunk_text(text)
    embeddings = await embed_texts(chunks)

    for content, embedding in zip(chunks, embeddings):
        db.add(DocumentChunk(
            seller_id=seller_id,
            document_id=doc.id,
            content=content,
            embedding=embedding,
        ))

    doc.status = "done"
    await db.commit()
    await db.refresh(doc)
    return doc


async def ingest_pdf(db: AsyncSession, seller_id: uuid.UUID, file: BinaryIO, filename: str) -> Document:
    text = _parse_pdf(file)
    return await ingest_text(db, seller_id, text, doc_type="pdf", filename=filename)


async def ingest_url(db: AsyncSession, seller_id: uuid.UUID, url: str) -> Document:
    text = await _fetch_url(url)
    return await ingest_text(db, seller_id, text, doc_type="url", filename=url)


def _chunk_faq(question: str, answer: str) -> list[str]:
    """FAQ 청킹: 첫 청크에 Q 포함, 이후 청크도 Q 접두어 유지."""
    q_prefix = f"Q: {question}\nA: "
    remaining = CHUNK_SIZE - len(q_prefix)

    chunks = []
    start = 0
    while start < len(answer):
        if start == 0:
            chunk = q_prefix + answer[:remaining]
            start = remaining
        else:
            body = answer[start: start + CHUNK_SIZE - len(q_prefix)]
            chunk = q_prefix + f"[이어서] " + body
            start += CHUNK_SIZE - len(q_prefix)
        chunks.append(chunk)
    return chunks


async def ingest_faq(db: AsyncSession, seller_id: uuid.UUID, question: str, answer: str) -> Document:
    doc = Document(seller_id=seller_id, doc_type="faq", filename=None, status="processing")
    db.add(doc)
    await db.flush()

    chunks = _chunk_faq(question, answer)
    embeddings = await embed_texts(chunks)

    for content, embedding in zip(chunks, embeddings):
        db.add(DocumentChunk(
            seller_id=seller_id,
            document_id=doc.id,
            content=content,
            embedding=embedding,
        ))

    doc.status = "done"
    await db.commit()
    await db.refresh(doc)
    return doc
