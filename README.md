# shop-rag

> 이커머스 셀러를 위한 AI 고객 상담 챗봇 플랫폼

셀러가 상품 정보/FAQ를 업로드하면, 고객 문의에 AI가 자동으로 답변합니다.
LangGraph 기반 멀티에이전트 라우팅과 RAG 파이프라인으로 정확한 답변을 제공합니다.

---

## 주요 기능

### 셀러 (관리자)
- 쇼핑몰 정보 등록 및 문서 업로드 (텍스트 / PDF / URL)
- FAQ, 반품·교환 정책 입력
- 챗봇 위젯 코드 발급 (`<script>` 한 줄로 쇼핑몰에 삽입)

### 고객
- 쇼핑몰 내 챗봇 위젯으로 실시간 문의
- 상품 정보, 사이즈, 정책 등 자연어로 질문

---

## 아키텍처

```
고객 문의
    ↓
라우터 (LangGraph)
├→ 상품/FAQ 관련  →  RAG 노드 (pgvector 검색 → Claude)
└→ 일반 문의      →  Direct 노드 (Claude 직접 응답)
    ↓
답변 반환
```

### 멀티테넌트 구조
- 셀러별 독립된 벡터 스토어 (`tenant_id` 기반 분리)
- 위젯 ID로 테넌트 식별 (`?id=abc123`)

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 에이전트 오케스트레이션 | LangGraph |
| 백엔드 | FastAPI |
| 벡터 저장/검색 | PostgreSQL + pgvector |
| LLM | Claude API (Anthropic) |
| 임베딩 | OpenAI Embeddings / HuggingFace |
| 프론트엔드 | React |
| 배포 | Railway |

---

## 빌드 순서

- [x] 프로젝트 초기 세팅
- [ ] FastAPI + PostgreSQL + pgvector 세팅
- [ ] 문서 ingestion 파이프라인 (업로드 → 임베딩 → 저장)
- [ ] RAG 검색 + 응답 생성
- [ ] LangGraph 라우터 구성
- [ ] 셀러 대시보드 UI (React)
- [ ] 고객용 챗봇 위젯 (임베더블)
- [ ] Railway 배포

---

## 로컬 실행

```bash
# 추후 작성 예정
```

---

## 데모

> 가상의 의류 쇼핑몰 시나리오로 시연합니다.

**고객:** 이 자켓 M 사이즈 키 175에 맞나요?  
**챗봇:** 해당 제품의 M 사이즈는 어깨 45cm, 총장 68cm로 175cm 기준 정사이즈입니다. 슬림핏을 원하시면 S를 추천드립니다.

---

## 개발자

- **Sejin Lee** · [GitHub](https://github.com/tpwls9494) · [Blog](https://blog.jionc.com)
