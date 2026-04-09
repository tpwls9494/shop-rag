import uuid
from datetime import datetime
from pydantic import BaseModel


class SellerCreate(BaseModel):
    name: str
    shop_name: str
    email: str


class SellerLogin(BaseModel):
    email: str


class SellerResponse(BaseModel):
    id: uuid.UUID
    name: str
    shop_name: str
    email: str
    widget_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
