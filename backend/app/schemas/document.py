import uuid
from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    filename: str | None
    doc_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FAQCreate(BaseModel):
    seller_id: uuid.UUID
    question: str
    answer: str


class URLIngest(BaseModel):
    seller_id: uuid.UUID
    url: str
