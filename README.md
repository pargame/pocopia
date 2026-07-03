# 🏝️ 포코피아 (Pokopia)

> 닌텐도 스위치2 게임 「포코피아」의 써드파티 클라우드섬 공유 사이트

**🌐 사이트 주소: https://pokoclouds.com**

사용자가 본인의 클라우드섬 정보를 업로드하면, 다른 사용자가 코드를 보고 접속할 수 있는 간단한 공유 플랫폼입니다.

---

## 🖥️ 서버 관리 (zsh 단축 명령어)

아래 명령어는 `scripts/pokopia.zsh`에 정의되어 있습니다. `.zshrc`에서 `source`로 불러오거나, 내용을 직접 복사해서 사용하세요.

```bash
# .zshrc 맨 아래에 추가
source $HOME/repos/pocopia/scripts/pokopia.zsh
```

터미널에서 `pokopia-start` 한 번으로 서버와 Cloudflare Tunnel을 백그라운드에서 시작합니다. 노트북을 닫거나 재부팅하면 프로세스가 종료되며, 다시 켜진 후 `pokopia-start`로 시작하면 됩니다.

| 명령어 | 설명 |
|--------|------|
| `pokopia-start` | 서버 + Cloudflare Tunnel 백그라운드 시작 |
| `pokopia-stop` | 서버 + Cloudflare Tunnel 종료 |
| `pokopia-alert` | 종료 예고 배너 ON |
| `pokopia-alert-off` | 종료 예고 배너 OFF |
| `pokopia-status` | 서버/Tunnel 상태, 예고 문구, 활성 게시물 수 확인 |

```bash
# 예시: 서버 종료 전 예고 → 종료
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
- **유명 섬** — 서버 재시작 시 자동 생성되는 고정 클라우드섬 (삭제/만료되지 않음)
  - `모든 템 복사 섬` (LPDXPD6F)
  - `간판 섬` (CS8PGM1V)
- **문의처** — info 패널에서 이메일(001201parg@gmail.com)로 문의 가능

---

## 🛠️ 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 패키지 관리 | uv | 0.11.8 |
| Python | CPython | 3.13 |
| 백엔드 | Flask | 3.1.3 |
| 서버 | gunicorn | 26.0.0 |
| 백그라운드 실행 | zsh alias (`nohup`) | — |
| 데이터 저장 | 메모리 내장 구조 (Python dict) | — |
| 프론트엔드 | 순수 HTML + CSS + JavaScript | — |
| 외부 접근 | Cloudflare Tunnel | — |

---

## 🚀 실행 방법

### 프로덕션 (권장)

터미널에서 zsh alias로 서버와 Cloudflare Tunnel을 백그라운드에서 시작합니다.

```bash
# 저장소 클론
git clone https://github.com/pargame/pocopia.git ~/repos/pocopia
cd ~/repos/pocopia

# 의존성 설치 (uv가 가상환경 자동 생성)
uv sync

# Cloudflare Tunnel 토큰 설정 (운영자 전용)
cp .env.example .env
# .env 파일에 CLOUDFLARE_TUNNEL_TOKEN=your_token_here 추가

# .zshrc에 alias 등록 (최초 1회)
echo 'source $HOME/repos/pocopia/scripts/pokopia.zsh' >> ~/.zshrc
source ~/.zshrc

# 서버 + Cloudflare Tunnel 시작
pokopia-start
```

### 로컬 개발

```bash
uv run python app.py
# → http://localhost:5000
```

### 배포

```bash
# static 파일 캐시 버스팅 자동화 (Git 커밋 해시 기반)
./deploy.sh
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
├── deploy.sh          # 캐시 버스팅 자동 배포 스크립트
├── gunicorn.log       # 서버 로그
├── scripts/           # 개발/운영 보조 스크립트
│   └── pokopia.zsh    # zsh 서버 관리 alias
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
| **데이터 유실** | 서버 재시작 시 모든 게시물 초기화. 단, 유명 섬은 자동으로 재생성됨 |
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
*버전: 2.4*  
*사이트: https://pokoclouds.com*
