import uuid
from typing import Sequence

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.state import AgentState
from app.agent.router import route, decide_route
from app.agent.nodes import rag_node, direct_node
from app.services.retrieval import search

# 그래프 빌드
builder = StateGraph(AgentState)

builder.add_node("router", route)
builder.add_node("rag", rag_node)
builder.add_node("direct", direct_node)

builder.set_entry_point("router")
builder.add_conditional_edges("router", decide_route, {"rag": "rag", "direct": "direct"})
builder.add_edge("rag", END)
builder.add_edge("direct", END)

graph = builder.compile()


async def run(
    db: AsyncSession,
    seller_id: uuid.UUID,
    question: str,
    history: Sequence[BaseMessage] = (),
) -> dict:
    """RAG 검색 후 LangGraph 실행, 최종 응답 및 라우트 반환."""
    context = await search(db, seller_id, question)

    initial_state: AgentState = {
        "seller_id": seller_id,
        "messages": [*history, HumanMessage(content=question)],
        "route": "",
        "context": context,
    }

    result = await graph.ainvoke(initial_state)
    return {
        "content": result["messages"][-1].content,
        "route": result["route"],
    }
