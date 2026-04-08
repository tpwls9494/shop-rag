from openai import OpenAI
from langchain_core.messages import AIMessage

from app.agent.state import AgentState
from app.config import settings

_client = OpenAI(api_key=settings.openai_api_key)

RAG_SYSTEM = """당신은 쇼핑몰 고객 상담 AI입니다.
아래 참고 정보를 바탕으로 고객 질문에 친절하고 정확하게 답변하세요.
참고 정보에 없는 내용은 모른다고 안내하세요.

참고 정보:
{context}"""

DIRECT_SYSTEM = "당신은 쇼핑몰 고객 상담 AI입니다. 고객의 질문에 친절하게 답변하세요."


def _convert_messages(state_messages):
    role_map = {"human": "user", "ai": "assistant"}
    return [{"role": role_map.get(m.type, m.type), "content": m.content} for m in state_messages]


def rag_node(state: AgentState) -> AgentState:
    context_text = "\n\n".join(state.get("context", []))
    messages = [{"role": "system", "content": RAG_SYSTEM.format(context=context_text)}]
    messages += _convert_messages(state["messages"])
    response = _client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1024,
        temperature=0.3,
        messages=messages,
    )
    answer = response.choices[0].message.content
    return {**state, "messages": [AIMessage(content=answer)]}


def direct_node(state: AgentState) -> AgentState:
    messages = [{"role": "system", "content": DIRECT_SYSTEM}]
    messages += _convert_messages(state["messages"])
    response = _client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1024,
        temperature=0.3,
        messages=messages,
    )
    answer = response.choices[0].message.content
    return {**state, "messages": [AIMessage(content=answer)]}
