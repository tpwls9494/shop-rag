import uuid
from typing import Annotated
from typing_extensions import TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    seller_id: uuid.UUID
    messages: Annotated[list, add_messages]
    route: str          # "rag" | "direct"
    context: list[str]  # RAG 검색 결과 청크
