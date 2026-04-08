from openai import OpenAI

from app.agent.state import AgentState
from app.config import settings

_client = OpenAI(api_key=settings.openai_api_key)

ROUTER_PROMPT = """당신은 고객 문의를 분류하는 라우터입니다.
아래 질문이 상품 정보, 사이즈, 재고, 가격, 배송, 반품·교환 정책 등 쇼핑몰 관련 내용이면 "rag"를,
그 외 일반적인 인사나 잡담이면 "direct"를 답하세요. 한 단어만 출력하세요.

질문: {question}"""


def route(state: AgentState) -> AgentState:
    question = state["messages"][-1].content
    response = _client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=10,
        messages=[{"role": "user", "content": ROUTER_PROMPT.format(question=question)}],
    )
    decision = response.choices[0].message.content.strip().lower()
    route = "rag" if "rag" in decision else "direct"
    return {**state, "route": route}


def decide_route(state: AgentState) -> str:
    return state["route"]
