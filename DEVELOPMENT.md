# 포코피아 개발 가이드

> 이 문서는 프로젝트를 처음 접하거나, 개발을 재개할 때 반드시 읽어야 하는 문서입니다.  
> **문서 기반 개발 원칙:** 코드 변경 전 항상 문서를 먼저 업데이트합니다.

---

## 1. 프로젝트 개요

- **프로젝트명:** 포코피아 (Pocopia)
- **설명:** 닌텐도 스위치2 게임 포코피아의 클라우드섬 공유 플랫폼
- **GitHub:** https://github.com/pargame/pocopia
- **개발 상태:** MVP 완료, 도메인 연결 대기 중

---

## 2. 시작하기 (처음부터)

### 2.1 저장소 클론

```bash
git clone https://github.com/pargame/pocopia.git
cd pocopia
```

### 2.2 환경 확인

```bash
# uv 설치 확인
uv --version
# → uv 0.11.8 이상 권장

# Python 버전 확인
cat .python-version
# → 3.13
```

### 2.3 의존성 설치

```bash
# uv가 자동으로 가상환경을 생성하고 의존성을 설치합니다
uv sync
```

### 2.4 서버 실행

```bash
uv run python app.py
```

브라우저에서 http://localhost:5000 접속

---

## 3. 개발 워크플로우

### 3.1 문서 기반 개발 규칙

1. **변경 계획 수립** → `pocopia-plan.md` 또는 `DEVELOPMENT.md` 업데이트
2. **코드 작성** → 계획에 따라 구현
3. **로컬 테스트** → `uv run python app.py`로 검증
4. **문서 최종 확인** → 변경사항 문서에 반영
5. **Git 커밋 & 푸시**

```bash
git add -A
git commit -m "feat: 설명"
git push
```

### 3.2 브랜치 전략

- `main` — 프로덕션 브랜치 (항상 배포 가능한 상태)
- 기능 개발 시 `feature/기능명` 브랜치 생성 후 PR

---

## 4. 프로젝트 구조

```
pocopia/
├── app.py              # Flask 서버 (API + 정적 파일 서빙)
│   ├── GET /islands    # 활성 목록 조회
│   ├── POST /islands   # 클라우드섬 업로드
│   ├── DELETE /islands/<id>  # 수동 삭제
│   └── 정적 파일 서빙  # static/ 폴
│
├── pyproject.toml      # uv 프로젝트 설정, 의존성 목록
├── uv.lock            # lock 파일 (수동 수정 금지)
├── .python-version    # Python 3.13 고정
│
├── static/
│   ├── index.html     # 메인 페이지 (업로드 폼 + 목록 + 언어 선택)
│   ├── style.css      # 반응형 스타일
│   ├── app.js         # 프론트엔드 로직
│   │   ├── 폼 제출 (POST /islands)
│   │   ├── 목록 조회 (GET /islands, 5초 폴리)
│   │   ├── 카운트다운 타이머 (1초 간격)
│   │   ├── 입력 실시간 필터링 (Z/I/O/소문자/한글/특수문자 차단)
│   │   └── 입력 힌트 (한글/특수문자 시 빨간 테두리 + 문구)
│   └── i18n.js        # 다국어 지원 (ko/en/ja)
│       ├── 언어 선택 버튼
│       ├── localStorage 저장
│       └── 동적 텍스트 교체
│
├── pocopia-plan.md    # 프로젝트 계획서 (현황, TODO, 아키텍처)
├── DEVELOPMENT.md     # 이 파일 (개발 가이드)
└── README.md          # 사용자용 프로젝트 소개
```

---

## 5. 핵심 코드 설명

### 5.1 백엔드 (app.py)

**메모리 저장소:**
```python
islands = {}  # {id: island_data}
```

**TTL 자동 삭제:**
```python
def schedule_delete(island_id, delay=60):
    threading.Timer(delay, lambda: islands.pop(island_id, None)).start()
```

**코드 유효성 검증 (Z, I, O 제외):**
```python
re.fullmatch(r"[A-HJ-NP-Y0-9]{8}", code)  # Z, I, O 제외한 8자리
```

**제목 최소 길이 검증:**
```python
if len(title) < 2:
    return jsonify({"error": "제목은 2자 이상 입력해주세요."}), 400
```

### 5.2 프론트엔드 (static/app.js)

**폴리 간격:** 5초 (`setInterval(fetchIslands, 5000)`)

**카운트다운:** 1초 간격 DOM 업데이트, 만료 시 서버 재조회

**입력 필터링:**
```javascript
const VALID_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY0123456789';

// input 이벤트: 허용 문자만 남기고 자동 대문자 변환
// keydown 이벤트: 한글/특수문자 차단 + 힌트 표시
// Z/I/O는 조용히 무시 (힌트 없음)
```

**API 기본 URL:** `const API_URL = ''` (같은 오리진)

### 5.3 다국어 (static/i18n.js)

```javascript
const i18n = {
    ko: { /* 한국어 텍스트 */ },
    en: { /* English text */ },
    ja: { /* 日本語テキスト */ },
};

function t(key) { /* 현재 언어의 텍스트 반환 */ }
function setLang(lang) { /* 언어 변경 + localStorage 저장 */ }
function applyTranslations() { /* DOM 텍스트 전체 교체 */ }
```

---

## 6. 테스트 방법

### 6.1 로컬 테스트

```bash
# 터미널 1: 서버 실행
uv run python app.py

# 터미널 2: API 테스트
curl -X POST http://localhost:5000/islands \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 섬","code":"ABCD1234"}'

curl http://localhost:5000/islands
```

### 6.2 브라우저 테스트

1. http://localhost:5000 접속
2. 폼에 제목/코드 입력 후 제출
3. 목록에 표시되는지 확인
4. 60초 후 자동 삭제되는지 확인
5. **언어 전환** (상단 버튼) → 전체 UI 번역 확인
6. **입력 필터링 테스트:**
   - `abcd` 입력 → `ABCD`로 자동 변환
   - `z`, `i`, `o` 입력 → 조용히 무시
   - `한글`, `!@#` 입력 → 빨간 테두리 + 힌트 2초 표시
   - 모바일 개발자 도구로 반응형 확인

---

## 7. 배포 체크리스트

### 7.1 도메인 연결 (Cloudflare Tunnel)

- [ ] `pocloudpia.com` 도메인 구매
- [ ] Cloudflare 계정 생성
- [ ] 도메인 Cloudflare 네임서버로 변경
- [ ] `cloudflared` 설치 (`brew install cloudflared`)
- [ ] `cloudflared tunnel login`
- [ ] `cloudflared tunnel create pocopia`
- [ ] `~/.cloudflared/config.yml` 설정
- [ ] `cloudflared tunnel route dns pocopia pocloudpia.com`
- [ ] `cloudflared tunnel run pocopia`
- [ ] https://pocloudpia.com 접속 테스트

### 7.2 맥북 백그라운드 실행

```bash
# launchd plist 작성 또는
# screen/tmux 사용
cloudflared tunnel run pocopia &
uv run python app.py &
```

---

## 8. 문제 해결

| 문제 | 원인 | 해결 |
|------|------|------|
| `ModuleNotFoundError: flask` | 가상환경 미생성 | `uv sync` 실행 |
| 포트 5000 사용 중 | 다른 프로세스 점유 | `lsof -i :5000` 후 종료 |
| 한글 깨짐 | 터미널 인코딩 | UTF-8 설정 확인 |
| 60초 후에도 목록에 남음 | 타이머/클린업 불일치 | `clean_expired()` 수동 호출 확인 |
| 언어 전환 안 됨 | i18n.js 로드 실패 | 콘솔 에러 확인, `i18n.js`가 `app.js`보다 먼저 로드되는지 확인 |

---

## 9. 의존성 관리

### 9.1 패키지 추가

```bash
uv add <패키지명>
```

### 9.2 패키지 제거

```bash
uv remove <패키지명>
```

### 9.3 의존성 동기화

```bash
uv sync
```

---

## 10. 문서 업데이트 가이드

| 변경 유형 | 업데이트 대상 |
|-----------|--------------|
| 기능 추가/변경 | `pocopia-plan.md` (TODO, API, 아키텍처) |
| 개발 환경 변경 | `DEVELOPMENT.md` (시작하기, 워크플로우) |
| 사용자 안내 변경 | `README.md` (실행 방법, 기능 소개) |
| 버전/날짜 변경 | 모든 문서 하단 변경 이렐 |

---

*작성일: 2026-07-01*  
*버전: 1.1*  
*원칙: 문서 없는 코드 변경은 금지*
