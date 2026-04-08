# shop-rag

> 이커머스 셀러를 위한 AI 고객 상담 챗봇 플랫폼

셀러가 상품 정보/FAQ를 업로드하면, 고객 문의에 AI가 자동으로 답변합니다.
LangGraph 기반 멀티에이전트 라우팅과 RAG 파이프라인으로 정확한 답변을 제공합니다.

---

## 주요 기능

### 셀러 (관리자)
- 쇼핑몰 정보 등록 및 문서 업로드 (텍스트 / PDF / URL / FAQ)
- 챗봇 위젯 코드 발급 (`<script>` 한 줄로 쇼핑몰에 삽입)
- 챗봇 데모 페이지 링크 제공

### 고객
- 쇼핑몰 내 챗봇 위젯으로 실시간 문의
- 상품 정보, 사이즈, 정책 등 자연어로 질문

---

## 아키텍처

```
고객 문의
    ↓
라우터 (LangGraph + GPT-4o-mini)
├→ 상품/FAQ 관련  →  RAG 노드 (pgvector 검색 → GPT-4o 응답)
└→ 일반 문의      →  Direct 노드 (GPT-4o 직접 응답)
    ↓
답변 반환 (route 정보 포함 → 위젯에서 📚 / 💬 배지 표시)
```

### 멀티테넌트 구조
- 셀러별 독립된 벡터 스토어 (`seller_id` 기반 분리)
- 위젯 ID로 테넌트 식별 (`data-id="widget_id"`)

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 에이전트 오케스트레이션 | LangGraph |
| 백엔드 | FastAPI |
| 벡터 저장/검색 | Supabase (PostgreSQL + pgvector) |
| LLM | OpenAI GPT-4o |
| 임베딩 | OpenAI text-embedding-3-small |
| 프론트엔드 | React + Tailwind CSS |
| 배포 | Railway (백엔드) + Vercel (프론트엔드) |

---

## 로컬 실행

### 사전 준비
- Docker Desktop
- Anaconda (Python 3.11)
- Node.js

### 백엔드
```bash
# DB 실행
docker compose up -d

# 가상환경 (Windows)
conda create -n shoprag python=3.11 -y
conda activate shoprag

# 패키지 설치 및 실행
cd backend
pip install -r requirements.txt
cp .env.example .env  # .env에 API 키 입력
uvicorn app.main:app --reload
```

### 프론트엔드
```bash
cd frontend/dashboard
npm install
npm run dev
```

- 백엔드: `http://localhost:8000`
- 프론트: `http://localhost:5173`
- API 문서: `http://localhost:8000/docs`

### 환경변수 (backend/.env)
```
DATABASE_URL=postgresql+asyncpg://shoprag:shoprag@localhost:5432/shoprag
OPENAI_API_KEY=sk-...
```

---

## 빌드 현황

- [x] 프로젝트 초기 세팅
- [x] FastAPI + PostgreSQL + pgvector 세팅
- [x] 문서 ingestion 파이프라인 (업로드 → 임베딩 → 저장)
- [x] RAG 검색 + 응답 생성
- [x] LangGraph 라우터 구성
- [x] 셀러 대시보드 UI (React, 다크모드)
- [x] 고객용 챗봇 위젯 (임베더블 script 태그)
- [x] RAG/Direct 답변 시각화 배지
- [x] 챗봇 데모 페이지
- [x] Railway + Vercel 배포
- [ ] 로그인 기능
- [ ] 대화 메모리 (LangGraph)

---

## 데모

**셀러 대시보드**: https://shop-rag.vercel.app

**챗봇 데모**: `https://shop-rag-production.up.railway.app/demo.html?id=위젯ID`

---

**고객:** 이 자켓 M 사이즈 키 175에 맞나요?  
**챗봇:** 해당 제품의 M 사이즈는 어깨 45cm, 총장 68cm로 175cm 기준 정사이즈입니다. 슬림핏을 원하시면 S를 추천드립니다.

---

## 개발자

- **Sejin Lee** · [GitHub](https://github.com/tpwls9494) · [Blog](https://blog.jionc.com)
