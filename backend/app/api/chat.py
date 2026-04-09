import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.seller import Seller
from app.models.chat import ChatSession, Message
from app.schemas.chat import SessionCreate, SessionResponse, MessageCreate
from app.agent.graph import run

router = APIRouter()

_openai = AsyncOpenAI(api_key=settings.openai_api_key)
HISTORY_LIMIT = 5


async def _build_history(msgs: list[Message]) -> list:
    """최근 5개는 그대로, 초과분은 LLM으로 요약해 SystemMessage로 압축."""
    if len(msgs) <= HISTORY_LIMIT:
        return [
            HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)
            for m in msgs
        ]

    old, recent = msgs[:-HISTORY_LIMIT], msgs[-HISTORY_LIMIT:]

    conversation = "\n".join(
        f"{'사용자' if m.role == 'user' else 'AI'}: {m.content}" for m in old
    )
    resp = await _openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "아래 대화를 3문장 이내로 요약하세요. 핵심 질문과 답변 위주로."},
            {"role": "user", "content": conversation},
        ],
        max_tokens=200,
    )
    summary = resp.choices[0].message.content

    return [
        SystemMessage(content=f"[이전 대화 요약] {summary}"),
        *[
            HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)
            for m in recent
        ],
    ]


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

    # 이전 대화 내역 조회 및 압축
    history_result = await db.execute(
        select(Message)
        .where(Message.session_id == session.id)
        .order_by(Message.created_at)
    )
    history_msgs = history_result.scalars().all()
    history = await _build_history(history_msgs)

    # 사용자 메시지 저장
    user_msg = Message(session_id=session.id, role="user", content=body.content)
    db.add(user_msg)
    await db.flush()

    # LangGraph 실행 (이전 대화 포함)
    result = await run(db, session.seller_id, body.content, history=history)

    # AI 응답 저장
    ai_msg = Message(session_id=session.id, role="assistant", content=result["content"])
    db.add(ai_msg)
    await db.commit()

    return {"role": "assistant", "content": result["content"], "route": result["route"]}
