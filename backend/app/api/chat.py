import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.seller import Seller
from app.models.chat import ChatSession, Message
from app.schemas.chat import SessionCreate, SessionResponse, MessageCreate
from app.agent.graph import run

router = APIRouter()


@router.post("/session", response_model=SessionResponse, status_code=201)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Seller).where(Seller.widget_id == body.widget_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="유효하지 않은 위젯 ID입니다.")

    session = ChatSession(seller_id=seller.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/message")
async def send_message(body: MessageCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChatSession).where(ChatSession.id == body.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")

    # 사용자 메시지 저장
    user_msg = Message(session_id=session.id, role="user", content=body.content)
    db.add(user_msg)
    await db.flush()

    # LangGraph 실행
    result = await run(db, session.seller_id, body.content)

    # AI 응답 저장
    ai_msg = Message(session_id=session.id, role="assistant", content=result["content"])
    db.add(ai_msg)
    await db.commit()

    return {"role": "assistant", "content": result["content"], "route": result["route"]}
