# 포코피아 개발 가이드

> 이 문서는 프로젝트를 처음 접하거나, 개발을 재개할 때 반드시 읽어야 하는 문서입니다.

---

## 1. 프로젝트 개요

- **프로젝트명:** 포코피아 (Pokopia)
- **설명:** 닌텐도 스위치2 게임 포코피아의 클라우드섬 공유 플랫폼
- **GitHub:** https://github.com/pargame/pocopia
- **사이트:** https://pokoclouds.com
- **개발 상태:** 운영 중 (MVP 완료, 도메인 연결 완료)

---

## 2. 시작하기

### 로컬 개발

```bash
git clone https://github.com/pargame/pocopia.git
cd pocopia
uv sync
uv run python app.py
# → http://localhost:5000
```

### 프로덕션 실행 (LaunchAgent)

```bash
# LaunchAgent 등록 (최초 1회)
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pokopia.gunicorn.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pokopia.cloudflared.plist

# 서버 시작/종료
pokopia-start
pokopia-stop

# Tunnel 시작/종료
pokopia-tunnel-start
pokopia-tunnel-stop
```

---

## 3. 프로젝트 구조

```
pocopia/
├── app.py              # Flask 서버 (API + 정적 파일 서빙)
├── pyproject.toml      # uv 프로젝트 설정
├── uv.lock            # 의존성 lock
├── deploy.sh          # 캐시 버스팅 자동 배포 스크립트
├── scripts/           # 개발/운영 보조 스크립트
│   └── pokopia.zsh    # zsh 서버 관리 alias
├── pokopia-plan.md    # 프로젝트 계획서
├── DEVELOPMENT.md     # 이 파일
├── README.md          # 사용자용 소개
└── static/
    ├── index.html     # 메인 페이지
    ├── style.css      # 반응형 스타일
    ├── app.js         # 프론트엔드 로직
    └── i18n.js        # 다국어 (ko/en/ja)
```

---

## 4. 핵심 기능 (현재 구현)

### 백엔드 (app.py)
- 메모리 저장소 (Python dict) — 서버 재시작 시 초기화
- API 엔드포인트
  - `GET /islands` — 활성 목록 조회
  - `POST /islands` — 클라우드섬 업로드
  - `DELETE /islands/<id>` — **본인 게시물만** 삭제
  - `GET/DELETE /islands/me` — 내 게시물 조회/일괄 삭제
  - `POST /islands/<id>/reveal` — 코드 보기 (30초 쿨타임)
  - `GET /maintenance` — 점검 상태 조회
  - `POST /maintenance` — 점검 모드 ON/OFF (**관리자 토큰 필요**)
- 제한 사항
  - IP당 최대 2개 동시 게시물
  - 코드 보기 30초 쿨타임
  - 제목 2~20자, 설명 0~40자
  - 코드: Z/I/O 제외한 8자리 알파벳 대문자+숫자
  - 공유 기간: 1분/5분/30분/60분 선택

### 프론트엔드
- 5초 폴리로 목록 갱신
- 1초 카운트다운 타이머 (브라우저 측 `Date.now()` 기반)
- 입력 실시간 필터링 (Z/I/O/소문자/한글/특수문자 차단)
- 다국어 지원 (한국어/English/日本語)
- 반응형 디자인
- 정적 파일 캐시 버스팅 (`?v=<git-hash>`)

---

## 5. 배포

### 캐시 버스팅 자동화
```bash
./deploy.sh
```
- `static/index.html`의 `?v=`를 현재 Git 커밋 해시로 자동 치환
- 변경 시 커밋 & 푸시까지 한 번에 처리

### 프로덕션 실행
macOS LaunchAgent로 등록하여 실행합니다.

```bash
# 최초 등록
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pokopia.gunicorn.plist

# 시작 / 종료
launchctl start gui/$(id -u)/com.pokopia.gunicorn
launchctl bootout gui/$(id -u)/com.pokopia.gunicorn
```

### zsh 단축 명령어
`scripts/pokopia.zsh`에 정의되어 있습니다. `.zshrc`에서 `source /Users/pargame/repos/pocopia/scripts/pokopia.zsh`로 불러오거나, 내용을 직접 복사해서 사용하세요.

| 명령어 | 설명 |
|--------|------|
| `pokopia-start` | 서버 시작 (launchd) |
| `pokopia-stop` | 서버 종료 (launchd) |
| `pokopia-tunnel-start` | Cloudflare Tunnel 시작 (launchd) |
| `pokopia-tunnel-stop` | Cloudflare Tunnel 종료 |
| `pokopia-alert` | 종료 예고 배너 ON |
| `pokopia-alert-off` | 종료 예고 배너 OFF |
| `pokopia-status` | 서버/Tunnel 상태 확인 (launchd + API) |

---

## 6. 보안

| 항목 | 상태 |
|------|------|
| DELETE 인증 | ✅ 작성자 IP 일치 확인 |
| maintenance | ✅ `X-Admin-Token` 헤더 필요 (토큰: `pokopia-admin-2026`) |
| IP 스푸핑 | Cloudflare Tunnel 환경에서는 무시 가능 |

---

## 7. 문제 해결

| 문제 | 해결 |
|------|------|
| `ModuleNotFoundError: flask` | `uv sync` |
| 포트 5000 사용 중 | `lsof -i :5000` 후 종료 |
| 캐시 문제 | `./deploy.sh` 실행. 정적 파일에 `Cache-Control: no-cache` 헤더 적용 |
| 한글 깨짐 | 터미널 UTF-8 설정 확인 |

---

*작성일: 2026-07-02*  
*버전: 2.2*
