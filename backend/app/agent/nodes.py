import anthropic
from langchain_core.messages import AIMessage

from app.agent.state import AgentState
from app.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

RAG_SYSTEM = """당신은 쇼핑몰 고객 상담 AI입니다.
아래 참고 정보를 바탕으로 고객 질문에 친절하고 정확하게 답변하세요.
참고 정보에 없는 내용은 모른다고 안내하세요.

참고 정보:
{context}"""

DIRECT_SYSTEM = "당신은 쇼핑몰 고객 상담 AI입니다. 고객의 질문에 친절하게 답변하세요."


def rag_node(state: AgentState) -> AgentState:
    context_text = "\n\n".join(state.get("context", []))
    messages = [{"role": m.type, "content": m.content} for m in state["messages"]]
    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=RAG_SYSTEM.format(context=context_text),
        messages=messages,
    )
    answer = response.content[0].text
    return {**state, "messages": [AIMessage(content=answer)]}


def direct_node(state: AgentState) -> AgentState:
    messages = [{"role": m.type, "content": m.content} for m in state["messages"]]
    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=DIRECT_SYSTEM,
        messages=messages,
    )
    answer = response.content[0].text
    return {**state, "messages": [AIMessage(content=answer)]}
