# shop-rag Project

쇼핑몰 판매자가 상품 문서를 업로드하면 RAG 기반으로 고객 질문에 답변해주는 챗봇 서비스.

## 아키텍처

```
shop-rag/
├── backend/          # FastAPI (Python)
│   └── app/
│       ├── api/      # 라우터: seller, documents, chat
│       ├── agent/    # LangGraph 에이전트: graph, nodes, state, router
│       ├── models/   # SQLAlchemy ORM 모델
│       ├── schemas/  # Pydantic 스키마
│       ├── services/ # 비즈니스 로직: embedding, ingestion, retrieval
│       ├── config.py
│       ├── database.py
│       └── main.py
└── frontend/
    └── dashboard/    # React + TypeScript + Vite + Tailwind + Radix UI
```

## 기술 스택

**Backend**
- FastAPI + uvicorn (async)
- PostgreSQL + pgvector (벡터 검색)
- SQLAlchemy 2.0 (async)
- LangGraph + LangChain (에이전트 오케스트레이션)
- Anthropic Claude + OpenAI (LLM)
- pypdf, beautifulsoup4 (문서 파싱)

**Frontend**
- React 18 + TypeScript
- Vite (빌드)
- TailwindCSS + Radix UI (UI)
- TanStack Query (서버 상태 관리)
- axios (HTTP)

## 개발 서버 실행

```bash
# Backend
cd backend
source shoprag-env/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend/dashboard
npm run dev
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/seller | 판매자 등록 |
| POST | /api/documents/upload | 문서 업로드 및 임베딩 |
| POST | /api/chat | 챗봇 질의응답 |
| GET  | /health | 헬스 체크 |

## 주요 규칙

- DB 작업은 항상 async/await 사용 (asyncpg 기반)
- 새 API 엔드포인트 추가 시: `api/` 라우터 → `schemas/` → `services/` 순서로 작성
- 벡터 임베딩은 `services/embedding.py`에서 중앙 관리
- LangGraph 에이전트 수정 시 `agent/state.py`의 State 타입 먼저 확인
- `.env`의 환경변수는 `config.py`의 Settings 클래스를 통해서만 접근
