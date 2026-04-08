import uuid

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentChunk
from app.services.embedding import embed_text

TOP_K = 5


async def search(db: AsyncSession, seller_id: uuid.UUID, query: str) -> list[str]:
    """seller_id 범위 내에서 쿼리와 가장 유사한 청크 반환."""
    query_embedding = await embed_text(query)

    stmt = (
        select(DocumentChunk.content)
        .where(DocumentChunk.seller_id == seller_id)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(TOP_K)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result.fetchall()]
