import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.seller import Seller
from app.schemas.seller import SellerCreate, SellerResponse

router = APIRouter()


@router.post("/register", response_model=SellerResponse, status_code=201)
async def register_seller(body: SellerCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Seller).where(Seller.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="이미 등록된 이메일입니다.")

    widget_id = secrets.token_urlsafe(8)
    seller = Seller(
        name=body.name,
        shop_name=body.shop_name,
        email=body.email,
        widget_id=widget_id,
    )
    db.add(seller)
    await db.commit()
    await db.refresh(seller)
    return seller


@router.get("/{seller_id}", response_model=SellerResponse)
async def get_seller(seller_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="셀러를 찾을 수 없습니다.")
    return seller
