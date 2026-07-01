# 🏝️ 포코피아 (Pocopia)

> 닌텐도 스위치2 게임 「포코피아」의 써드파티 클라우드섬 공유 사이트

사용자가 본인의 클라우드섬 정보를 업로드하면, 다른 사용자가 코드를 보고 접속할 수 있는 간단한 공유 플랫폼입니다.

---

## ✨ 주요 기능

- **큐우드섬 업로드** — 제목, 설명, 8자리 클라우드섬 코드를 입력하여 공유
- **자동 만료** — 업로드 후 **60초**가 지나면 게시물이 자동으로 삭제됨
- **실시간 목록** — 현재 활성화된 클라우드섬 목록을 실시간으로 확인
- **익명 사용** — 별도의 회원가입이나 인증 없이 바로 사용 가능

---

## 🛠️ 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 패키지 관리 | uv | 0.11.8 |
| Python | CPython | 3.13 |
| 백엔드 | Flask | 3.1.3 |
| 데이터 저장 | 메모리 내장 구조 (Python dict) | — |
| 프론트엔드 | 순수 HTML + CSS + JavaScript | — |
| 외부 접근 (예정) | Cloudflare Tunnel | — |

---

## 🚀 실행 방법

### 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/pargame/pocopia.git
cd pocopia

# 의존성 설치 (uv가 가상환경 자동 생성)
uv sync

# 서버 실행
uv run python app.py

# 브라우저에서 접속
# → http://localhost:5000
```

### 외부 접근 (Cloudflare Tunnel — 도메인 구매 후)

```bash
# cloudflared 설치
brew install cloudflared

# Cloudflare 계정 로그인
cloudflared tunnel login

# 터널 생성 및 실행
cloudflared tunnel create pocopia
cloudflared tunnel run pocopia

# https://pocloudpia.com 에서 접속 가능
```

---

## 📡 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/islands` | 활성화된 클라우드섬 목록 조회 |
| `POST` | `/islands` | 새 클라우드섬 업로드 |
| `DELETE` | `/islands/<id>` | 특정 클라우드섬 수동 삭제 |

### POST /islands 요청 예시

```json
{
  "title": "볼트의 섬",
  "description": "볼트를 많이 잡을 수 있는 섬입니다!",
  "code": "1234ABCD"
}
```

---

## 📁 프로젝트 구조

```
pocopia/
├── app.py              # Flask 서버
├── pyproject.toml      # 프로젝트 설정
├── uv.lock            # 의존성 lock
├── pocopia-plan.md    # 프로젝트 계획서
├── DEVELOPMENT.md     # 개발 가이드
├── README.md          # 이 파일
└── static/
    ├── index.html     # 메인 페이지
    ├── style.css      # 스타일시트
    └── app.js         # 프론트엔드 로직
```

---

## ⚠️ 제약사항

| 항목 | 내용 |
|------|------|
| **서버 가동 시간** | 맥북이 켜져 있어야 접속 가능 |
| **데이터 유실** | 서버 재시작 시 모든 게시물 초기화 (의도된 동작) |
| **동시 접속 한도** | 소규모 사용 기준 (10~50명 내외) |

---

## 📄 라이선스

MIT License

---

*작성일: 2026-07-01*  
*버전: 1.1*
