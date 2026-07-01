# 🏝️ 포코피아 (Pokopia)

> 닌텐도 스위치2 게임 「포코피아」의 써드파티 클라우드섬 공유 사이트

**🌐 사이트 주소: https://pokoclouds.com**

사용자가 본인의 클라우드섬 정보를 업로드하면, 다른 사용자가 코드를 보고 접속할 수 있는 간단한 공유 플랫폼입니다.

---

## 🖥️ 서버 관리 (zsh 단축 명령어)

터미널에서 아래 명령어로 서버를 관리할 수 있습니다.

| 명령어 | 설명 |
|--------|------|
| `pokopia-start` | 서버 시작 (이미 실행 중이면 무시) |
| `pokopia-stop` | 서버 즉시 종료 |
| `pokopia-alert` | 종료 예고 배너 ON (사용자에게 사전 안내) |
| `pokopia-status` | 서버 상태, 예고 문구, 활성 게시물 수 확인 |

```bash
# 예시: 서버 종료 전 예고 → 1분 후 종료
pokopia-alert  # 노란 배너 표시
# → 사용자들에게 "잠시 후 서버가 재시작됩니다" 안내
pokopia-stop   # 서버 종료
```

---

## ✨ 주요 기능

- **클라우드섬 업로드** — 제목, 설명, 8자리 클라우드섬 코드를 입력하여 공유
- **만료 시간 선택** — 1분 / 5분 / 30분 / 60분 중 선택
- **자동 만료** — 설정한 시간이 지나면 게시물이 자동으로 삭제됨
- **실시간 목록** — 현재 활성화된 클라우드섬 목록을 실시간으로 확인
- **제목 검색** — 키워드로 게시물 필터링
- **익명 사용** — 별도의 회원가입이나 인증 없이 바로 사용 가능
- **다국어 지원** — 한국어 / English / 日本語
- **모바일 최적화** — 반응형 디자인, 터치 친화적 UI
- **코드 보호** — 코드 클릭 후 30초간 쿨타임 (스크래핑/남용 방지)

---

## 🛠️ 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 패키지 관리 | uv | 0.11.8 |
| Python | CPython | 3.13 |
| 백엔드 | Flask | 3.1.3 |
| 서버 | gunicorn | 26.0.0 |
| 데이터 저장 | 메모리 내장 구조 (Python dict) | — |
| 프론트엔드 | 순수 HTML + CSS + JavaScript | — |
| 외부 접근 | Cloudflare Tunnel | — |

---

## 🚀 실행 방법

### 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/pargame/pocopia.git
cd pocopia

# 의존성 설치 (uv가 가상환경 자동 생성)
uv sync

# 서버 실행 (gunicorn, 4워커)
uv run gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 브라우저에서 접속
# → http://localhost:5000
```

### 프로덕션 (Cloudflare Tunnel)

```bash
# gunicorn 백그라운드 실행
uv run gunicorn -w 4 -b 0.0.0.0:5000 app:app &

# Cloudflare Tunnel 실행
cloudflared tunnel run --token <YOUR_TOKEN>
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
  "code": "1234ABCD",
  "duration": 300
}
```

### 코드 규칙

- 정확히 8자리
- 알파벳 대문자 + 숫자
- **Z, I, O는 제외** (게임 본편 설정)

---

## 📁 프로젝트 구조

```
pokopia/
├── app.py              # Flask 서버
├── pyproject.toml      # 프로젝트 설정
├── uv.lock            # 의존성 lock
├── .gitignore         # 보안: 민감 파일 제외
├── pokopia-plan.md    # 프로젝트 계획서
├── DEVELOPMENT.md     # 개발 가이드
├── README.md          # 이 파일
└── static/
    ├── index.html     # 메인 페이지
    ├── style.css      # 스타일시트 (반응형)
    ├── app.js         # 프론트엔드 로직
    └── i18n.js        # 다국어 지원 (ko/en/ja)
```

---

## ⚠️ 제약사항

| 항목 | 내용 |
|------|------|
| **서버 가동 시간** | 맥북이 켜져 있어야 접속 가능 |
| **데이터 유실** | 서버 재시작 시 모든 게시물 초기화 (의도된 동작) |
| **동시 접속 한도** | 소규모 사용 기준 (10~50명 내외) |

---

## 🔒 보안

- `.gitignore`로 민감 파일(credentials, `.env`, `__pycache__` 등) 제외
- Cloudflare Tunnel로 HTTPS 제공
- 코드 클릭 쿨타임으로 스크래핑 방지
- 입력 유효성 검증으로 스팸 방지

---

## 📄 라이선스

MIT License

---

*작성일: 2026-07-02*  
*버전: 1.3*  
*사이트: https://pokoclouds.com*
