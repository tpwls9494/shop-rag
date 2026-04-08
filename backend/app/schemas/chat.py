import uuid
from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    widget_id: str


class SessionResponse(BaseModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    session_id: uuid.UUID
    content: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
