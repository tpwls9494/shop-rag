import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


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

    @field_validator("question")
    @classmethod
    def question_length(cls, v: str) -> str:
        if len(v) > 200:
            raise ValueError("질문은 200자 이하로 입력해주세요.")
        return v


class URLIngest(BaseModel):
    seller_id: uuid.UUID
    url: str
