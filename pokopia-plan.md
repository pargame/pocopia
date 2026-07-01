# 포코피아 (Pokopia) - 프로젝트 계획서

> 닌텐도 스위치2 게임 「포코피아」의 써드파티 클라우드섬 공유 사이트

---

## 1. 프로젝트 현황

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 포코피아 (Pokopia) |
| **설명** | 사용자가 본인의 클라우드섬 정보를 업로드하면, 다른 사용자가 코드를 보고 접속할 수 있는 간단한 공유 플랫폼 |
| **타겟 게임** | 닌텐도 스위치2 - 포코피아 |
| **호스팅** | 개인 맥북 (로컬 서버) + Cloudflare Tunnel |
| **사이트** | https://pokoclouds.com |
| **개발 상태** | ✅ **운영 중** |
| **GitHub** | https://github.com/pargame/pocopia |

---

## 2. 완료된 작업

### 백엔드
- [x] Flask 서버 + gunicorn
- [x] 메모리 기반 저장소
- [x] API 엔드포인트
  - `GET /islands` — 활성 목록
  - `POST /islands` — 업로드 (IP당 2개 제한)
  - `DELETE /islands/<id>` — 본인 게시물만 삭제
  - `GET/DELETE /islands/me` — 내 게시물 조회/삭제
  - `POST /islands/<id>/reveal` — 코드 보기 (30초 쿨타임)
  - `GET/POST /maintenance` — 점검 모드 (POST는 관리자 토큰 필요)
- [x] 입력 유효성 검증 (제목 2~20자, 설명 0~40자, 코드 8자리 Z/I/O 제외)
- [x] 공유 기간 선택 (1분/5분/30분/60분)
- [x] 자동 만료 (요청 시 `clean_expired()` 호출)

### 프론트엔드
- [x] 업로드 폼 + 실시간 목록 + 검색 + 필터
- [x] 코드 보기 (blur 효과, 클릭 시 reveal)
- [x] 1초 카운트다운 타이머
- [x] 5초 폴리 갱신
- [x] 입력 실시간 필터링 + 시각적 힌트
- [x] 다국어 (ko/en/ja)
- [x] 반응형 디자인

### 인프라
- [x] Cloudflare Tunnel + `pokoclouds.com` 도메인
- [x] macOS LaunchAgent (`launchd`)로 백그라운드 실행, 재부팅 후 수동 시작
- [x] 캐시 버스팅 자동화 (`deploy.sh` — Git 해시 기반)
- [x] 정적 파일 `no-cache` 헤더 적용
- [x] zsh 단축 명령어 (launchd 기반 start/stop/alert/status)

---

## 3. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 패키지 관리 | uv | 0.11.8 |
| Python | CPython | 3.13 |
| 백엔드 | Flask | 3.1.3 |
| 서버 | gunicorn | 26.0.0 |
| 데이터 저장 | 메모리 (Python dict) | — |
| 프론트엔드 | 순수 HTML + CSS + JS | — |
| 외부 접근 | Cloudflare Tunnel | — |

---

## 4. 시스템 아키텍처

```
사용자 ──→ https://pokoclouds.com
              │
              ▼
        ┌──────────────┐
        │ Cloudflare   │  ← DNS + Tunnel
        │ Tunnel       │
        └──────┬───────┘
               │ localhost:5000
               ▼
      ┌─────────────────────┐
      │    맥북 로컬 서버    │
      │  Flask + gunicorn   │
      │  메모리 저장소       │
      │  정적 파일 서빙      │
      └─────────────────────┘
```

---

## 5. 파일 구조

```
pocopia/
├── app.py              # Flask 서버
├── pyproject.toml      # 프로젝트 설정
├── uv.lock            # 의존성 lock
├── deploy.sh          # 배포 스크립트 (캐시 버스팅)
├── pokopia-plan.md    # 이 파일
├── DEVELOPMENT.md     # 개발 가이드
├── README.md          # 사용자용 소개
└── static/
    ├── index.html     # 메인 페이지
    ├── style.css      # 스타일시트
    ├── app.js         # 프론트엔드 로직
    └── i18n.js        # 다국어
```

---

## 6. API

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/islands` | 활성 목록 조회 | 없음 |
| `POST` | `/islands` | 새 클라우드섬 업로드 | 없음 (IP당 2개 제한) |
| `DELETE` | `/islands/<id>` | 특정 게시물 삭제 | 작성자 IP |
| `GET` | `/islands/me` | 내 게시물 조회 | IP 기반 |
| `DELETE` | `/islands/me` | 내 게시물 일괄 삭제 | IP 기반 |
| `POST` | `/islands/<id>/reveal` | 코드 보기 | 없음 (30초 쿨타임) |
| `GET` | `/maintenance` | 점검 상태 조회 | 없음 |
| `POST` | `/maintenance` | 점검 모드 설정 | `X-Admin-Token` |

---

## 7. 제약사항

| 항목 | 내용 |
|------|------|
| 서버 가동 시간 | 맥북이 켜져 있어야 접속 가능 |
| 데이터 유실 | 서버 재시작 시 모든 게시물 초기화 (의도된 동작) |
| 동시 접속 | 소규모 사용 기준 (gunicorn -w 1) |
| 메모리 한계 | 장기간 요청 없으면 만료 데이터가 메모리에 남음 |

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-07-01 | 1.0 | 초기 계획서 |
| 2026-07-01 | 1.1 | MVP 완료, uv 도입 |
| 2026-07-02 | 2.0 | 운영 시작, 도메인 연결, 다국어, 캐시 버스팅, 보안 강화 |
| 2026-07-02 | 2.1 | launchd 기반 백그라운드 실행, Safari 타이머 버그 수정, UI 다듬기, 문서 최신화 |

---

*작성일: 2026-07-02*  
*버전: 2.0*
