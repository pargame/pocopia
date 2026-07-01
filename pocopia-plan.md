# 포코피아 (Pocopia) - 프로젝트 계획서

> 닌텐도 스위치2 게임 「포코피아」의 써드파티 클라우드섬 공유 사이트

---

## 1. 프로젝트 현황

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 포코피아 (Pocopia) |
| **설명** | 사용자가 본인의 클라우드섬 정보를 업로드하면, 다른 사용자가 코드를 보고 접속할 수 있는 간단한 공유 플랫폼 |
| **타겟 게임** | 닌텐도 스위치2 - 포코피아 |
| **호스팅** | 개인 맥북 (로컬 서버) + 외부 접근용 터널 |
| **예산** | 물리 서버 및 클라우드 인프라 비용 0원 (도메인만 유료) |
| **개발 상태** | ✅ **MVP 완료** - 로컬 서버 및 프론트엔드 구현 완료 |
| **GitHub** | https://github.com/pargame/pocopia |

---

## 2. 완료된 작업

### 2.1 백엔드 (app.py)
- [x] Flask 서버 구축
- [x] 메모리 기반 저장소 (Python dict)
- [x] API 엔드포인트 구현
  - `GET /islands` — 활성 목록 조회
  - `POST /islands` — 새 클라우드섬 업로드
  - `DELETE /islands/<id>` — 수동 삭제
- [x] 60초 TTL 자동 삭제 (threading.Timer)
- [x] 입력 유효성 검증
- [x] 정적 파일 서빙

### 2.2 프론트엔드
- [x] index.html — 페이지 구조
- [x] style.css — 반응형 스타일링
- [x] app.js — API 연동, 폼 제출, 실시간 목록, 카운트다운

### 2.3 프로젝트 관리
- [x] uv 프로젝트 초기화
- [x] Flask 의존성 추가
- [x] GitHub public 저장소 생성
- [x] 로컬 테스트 완료

---

## 3. 남은 작업 (TODO)

### 3.1 도메인 및 외부 접근 (사용자가 직접 진행 필요)
- [ ] `pocloudpia.com` 도메인 구매
  - 추천: 후이즈(~12,000원/년) 또는 가비아(~15,000원/년)
- [ ] Cloudflare 계정 생성 및 도메인 등록
- [ ] Cloudflare Tunnel 설치 및 설정
- [ ] `https://pocloudpia.com` 로컬 서버 연결

### 3.2 선택적 개선사항
- [ ] ngrok 대안으로 Cloudflare Tunnel 완전 전환
- [ ] 게시물 만료 전 수동 삭제 버튼 (UI에 추가)
- [ ] 업로드 시 카테고리/태그 추가
- [ ] "좋아요" 또는 "신고" 기능
- [ ] WebSocket으로 실시간 업데이트 (폴리 대체)
- [ ] 게시물 만료 시간 커스텀 (30초, 60초, 120초)
- [ ] 간단한 관리자 페이지
- [ ] Rate Limiting (스팸 방지)

---

## 4. 기술 스택

| 구분 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| **패키지 관리** | uv | 0.11.8 | 빠른 의존성 관리, 가상환경 자동 생성 |
| **Python** | CPython | 3.13.13 | 최신 안정 버전 |
| **백엔드** | Flask | 3.1.3 | 설치 간편, 코드 간결, 문서 풍부 |
| **데이터 저장** | 메모리 내장 구조 (Python dict) | — | 60초 TTL 관리에 최적, DB 불필요 |
| **프론트엔드** | 순수 HTML + CSS + JavaScript | — | 빌드 도구 불필요, 가장 가벼움 |
| **외부 접근 (예정)** | Cloudflare Tunnel | — | 묣 고정 URL, 도메인 연동 가능 |
| **TTL 관리** | Python threading.Timer | — | 간단한 타이머 기반 자동 삭제 |

---

## 5. 시스템 아키텍처

```
사용자 (스위치2) ──→ https://pocloudpia.com (예정)
                           │
                           ▼
                    ┌──────────────┐
                    │ Cloudflare   │  ← DNS + Tunnel
                    │ Tunnel       │
                    └──────┬───────┘
                           │ localhost:5000
                           ▼
              ┌────────────────────────────┐
              │      맥북 로컬 서버         │
              │  ┌──────────────────────┐  │
              │  │   Flask 웹 서버       │  │
              │  │   - POST /islands    │  │ ← 클라우드섬 업로드
              │  │   - GET  /islands    │  │ ← 활성 목록 조회
              │  │   - 메모리 저장소     │  │ ← {id: {title, desc, code, expires_at}}
              │  │   - TTL 타이머        │  │ ← 60초 후 자동 삭제
              │  └──────────────────────┘  │
              │  ┌──────────────────────┐  │
              │  │   정적 파일 서빙      │  │
              │  │   - index.html       │  │
              │  │   - style.css        │  │
              │  │   - app.js           │  │
              │  └──────────────────────┘  │
              └────────────────────────────┘
```

---

## 6. 파일 구조

```
pocopia/
├── app.py                 # Flask 서버 (API + 정적 파일 서빙)
├── pyproject.toml         # uv 프로젝트 설정
├── uv.lock               # 의존성 lock 파일
├── .python-version       # Python 버전 고정
├── pocopia-plan.md       # 이 파일 (프로젝트 계획서)
├── README.md             # 프로젝트 소개
├── DEVELOPMENT.md        # 개발 재개 가이드
└── static/
    ├── index.html        # 메인 페이지
    ├── style.css         # 스타일시트
    └── app.js            # 프론트엔드 로직
```

---

## 7. API 설계

### 7.1 엔드포인트

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|-----------|------|
| `GET` | `/islands` | 활성화된 클라우드섬 목록 조회 | — | `[{id, title, description, code, created_at, expires_at, remaining_seconds}]` |
| `POST` | `/islands` | 새 클라우드섬 업로드 | `{"title": "...", "description": "...", "code": "1234ABCD"}` | `{id, title, description, code, created_at, expires_at, remaining_seconds}` |
| `DELETE` | `/islands/<id>` | 특정 클라우드섬 수동 삭제 | — | `{"success": true}` |

### 7.2 데이터 모델

```python
island = {
    "id": "uuid-string",           # 고유 식별자 (8자리)
    "title": "string",              # 제목 (최대 50자)
    "description": "string",        # 설명 (최대 200자, 선택)
    "code": "string",               # 8자리 클라우드섬 코드 (알파벳 대문자 + 숫자)
    "created_at": "ISO-8601",       # 생성 시각 (KST)
    "expires_at": "ISO-8601",       # 만료 시각 (created_at + 60초)
}
```

### 7.3 유효성 검증

- `title`: 필수, 1~50자
- `description`: 선택, 0~200자
- `code`: 필수, 정확히 8자리 (알파벳 대문자 + 숫자)

---

## 8. 실행 방법

### 8.1 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/pargame/pocopia.git
cd pocopia

# 2. 서버 실행 (uv가 가상환경 자동 생성)
uv run python app.py

# 3. 브라우저에서 접속
# → http://localhost:5000
```

### 8.2 외부 접근 (Cloudflare Tunnel — 도메인 구매 후)

```bash
# 1. cloudflared 설치
brew install cloudflared

# 2. Cloudflare 계정 로그인
cloudflared tunnel login

# 3. 터널 생성
cloudflared tunnel create pocopia

# 4. 설정 파일 수정 (~/.cloudflared/config.yml)
#    ingress 설정에 localhost:5000 매핑

# 5. 터널 실행
cloudflared tunnel run pocopia

# 6. https://pocloudpia.com 에서 접속 가능
```

---

## 9. 제약사항 및 고려사항

| 항목 | 내용 |
|------|------|
| **서버 가동 시간** | 맥북이 켜져 있어야 접속 가능 |
| **데이터 유실** | 서버 재시작 시 모든 게시물 초기화 (의도된 동작) |
| **동시 접속 한도** | 소규모 사용 기준 (10~50명 내외) |
| **보안** | 익명 업로드로 인한 스팸 가능성 → 필요시 Rate Limiting 추가 |
| **Flask 개발 서버** | 프로덕션 사용 시 gunicorn 등 WSGI 서버 권장 |

---

## 10. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-07-01 | 1.0 | 초기 계획서 작성 |
| 2026-07-01 | 1.1 | MVP 완료, uv 도입, 문서 기반 개발 체계 수립 |

---

*작성일: 2026-07-01*  
*버전: 1.1*  
*문서 기반 개발 원칙: 모든 변경은 문서화 우선, 코드는 문서를 따름*
