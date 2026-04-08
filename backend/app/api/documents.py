import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentResponse, FAQCreate, URLIngest
from app.services.ingestion import ingest_pdf, ingest_url, ingest_faq, ingest_text

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    seller_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    if file.content_type == "application/pdf":
        import io
        doc = await ingest_pdf(db, seller_id, io.BytesIO(content), file.filename)
    else:
        text = content.decode("utf-8", errors="ignore")
        doc = await ingest_text(db, seller_id, text, doc_type="text", filename=file.filename)
    return doc


@router.post("/url", response_model=DocumentResponse, status_code=201)
async def upload_url(body: URLIngest, db: AsyncSession = Depends(get_db)):
    try:
        doc = await ingest_url(db, body.seller_id, body.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"URL 크롤링 실패: {e}")
    return doc


@router.post("/faq", response_model=DocumentResponse, status_code=201)
async def upload_faq(body: FAQCreate, db: AsyncSession = Depends(get_db)):
    doc = await ingest_faq(db, body.seller_id, body.question, body.answer)
    return doc


@router.get("/{seller_id}", response_model=list[DocumentResponse])
async def list_documents(seller_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Document).where(Document.seller_id == seller_id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
    await db.delete(doc)
    await db.commit()
