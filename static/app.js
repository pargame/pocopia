const API_URL = '';
const COOLDOWN_SECONDS = 30;
const COOLDOWN_STORAGE_KEY = 'pocopia-cooldown-end';
const REVEALED_CODES_KEY = 'pocopia-revealed-codes';

// 폼 제출
const form = document.getElementById('islandForm');
const messageEl = document.getElementById('message');
const codeInput = document.getElementById('code');
const codeHint = document.getElementById('code-hint');

// 쿨타임 상태 (localStorage로 세션 유지)
let cooldownEndTime = parseInt(localStorage.getItem(COOLDOWN_STORAGE_KEY) || '0', 10);
let cooldownInterval = null;
let cooldownBanner = null;

// 공개된 코드 목록 (localStorage)
function getRevealedCodes() {
    try {
        return JSON.parse(localStorage.getItem(REVEALED_CODES_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveRevealedCode(id) {
    const revealed = getRevealedCodes();
    revealed[id] = Date.now();
    localStorage.setItem(REVEALED_CODES_KEY, JSON.stringify(revealed));
}

function clearExpiredRevealedCodes() {
    const revealed = getRevealedCodes();
    const now = Date.now();
    let changed = false;
    for (const [id, time] of Object.entries(revealed)) {
        if (now - time > COOLDOWN_SECONDS * 1000) {
            delete revealed[id];
            changed = true;
        }
    }
    if (changed) {
        localStorage.setItem(REVEALED_CODES_KEY, JSON.stringify(revealed));
    }
}

function isCodeRevealed(id) {
    const revealed = getRevealedCodes();
    if (!revealed[id]) return false;
    return (Date.now() - revealed[id]) < COOLDOWN_SECONDS * 1000;
}

// 페이지 로드 시 쿨타임 복원
if (cooldownEndTime > Date.now()) {
    startCooldown();
}

// 만료된 공개 코드 정리
clearExpiredRevealedCodes();

// 실시간으로 공개 코드 만료 체크 (1초 간격)
setInterval(() => {
    const revealed = getRevealedCodes();
    const now = Date.now();
    let changed = false;
    for (const [id, time] of Object.entries(revealed)) {
        if (now - time > COOLDOWN_SECONDS * 1000) {
            delete revealed[id];
            changed = true;
            // DOM에서 해당 코드 다시 블러 처리
            const card = document.querySelector(`.island-card[data-id="${id}"]`);
            if (card) {
                const codeEl = card.querySelector('.code');
                if (codeEl) {
                    codeEl.classList.remove('revealed');
                    codeEl.textContent = t('viewCodeBtn');
                }
                const btn = card.querySelector('.view-code-btn');
                if (btn) btn.disabled = false;
            }
        }
    }
    if (changed) {
        localStorage.setItem(REVEALED_CODES_KEY, JSON.stringify(revealed));
    }
}, 1000);

// ── 언어 선택 ──
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// ── 코드 입력 실시간 필터링 ──
const VALID_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY0123456789';

function showCodeHint(show) {
    if (show) {
        codeHint.textContent = t('codeInputHint');
        codeHint.classList.add('visible');
        codeInput.classList.add('input-error');
    } else {
        codeHint.classList.remove('visible');
        codeInput.classList.remove('input-error');
    }
}

// 허용되지 않는 문자인지 확인 (한글, 특수문자 등만 체크. Z/I/O는 제외된 알파벳이므로 힌트 없음)
function isTrulyInvalidChar(ch) {
    const upper = ch.toUpperCase();
    // 알파벳 A-Z 또는 숫자 0-9 중 하나인지 먼저 확인
    const isAsciiLetter = upper >= 'A' && upper <= 'Z';
    const isDigit = upper >= '0' && upper <= '9';
    if (isAsciiLetter || isDigit) {
        // Z, I, O는 게임 규칙상 제외된 알파벳 → 힌트 없이 조용히 무시
        return false;
    }
    // 그 외 (한글, 특수문자, 소문자 등) → 힌트 표시
    return true;
}

codeInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase();
    let filtered = '';
    let hadTrulyInvalid = false;
    for (const ch of value) {
        if (VALID_CODE_CHARS.includes(ch)) {
            filtered += ch;
        } else if (isTrulyInvalidChar(ch)) {
            hadTrulyInvalid = true;
        }
        // Z, I, O는 여기서 걸러지지만 hadTrulyInvalid에는 포함 안 됨
    }
    // 8자 초과 자르기
    if (filtered.length > 8) {
        filtered = filtered.slice(0, 8);
    }
    e.target.value = filtered;

    // 한글/특수문자 등만 힌트 표시 (Z/I/O는 제외)
    if (hadTrulyInvalid) {
        showCodeHint(true);
        clearTimeout(codeHint._timer);
        codeHint._timer = setTimeout(() => showCodeHint(false), 2000);
    }
});

// ── 코드 입력 키다운 차단 ──
codeInput.addEventListener('keydown', (e) => {
    // 허용: 백스페이스, 삭제, 화살표, 탭, 선택 단축키
    if (
        e.key === 'Backspace' || e.key === 'Delete' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'Tab' || e.key === 'Enter' ||
        (e.ctrlKey || e.metaKey)
    ) {
        return;
    }

    const ch = e.key.toUpperCase();
    // Z, I, O 또는 한글/특수문자 등 차단
    if (!VALID_CODE_CHARS.includes(ch)) {
        e.preventDefault();
        // 한글/특수문자 등만 힌트 표시 (Z/I/O는 조용히 무시)
        if (isTrulyInvalidChar(e.key)) {
            showCodeHint(true);
            clearTimeout(codeHint._timer);
            codeHint._timer = setTimeout(() => showCodeHint(false), 2000);
        }
    }
});

// 포커스 벗어나면 힌트 숨김
codeInput.addEventListener('blur', () => {
    showCodeHint(false);
});

// ── 쿨타임 관리 ──
function startCooldown() {
    if (cooldownEndTime <= Date.now()) {
        cooldownEndTime = Date.now() + COOLDOWN_SECONDS * 1000;
    }
    localStorage.setItem(COOLDOWN_STORAGE_KEY, cooldownEndTime.toString());
    applyCooldownToCards();

    const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
    showCooldownBanner(remaining);

    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
        const currentRemaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
        if (currentRemaining <= 0) {
            endCooldown();
        } else {
            updateCooldownBanner(currentRemaining);
        }
    }, 1000);
}

function endCooldown() {
    cooldownEndTime = 0;
    localStorage.removeItem(COOLDOWN_STORAGE_KEY);
    if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
    }
    removeCooldownFromCards();
    hideCooldownBanner();
}

function isCooldownActive() {
    return Date.now() < cooldownEndTime;
}

function applyCooldownToCards() {
    document.querySelectorAll('.island-card').forEach(card => {
        card.classList.add('cooldown');
    });
}

function removeCooldownFromCards() {
    document.querySelectorAll('.island-card').forEach(card => {
        card.classList.remove('cooldown');
    });
}

function showCooldownBanner(remaining) {
    hideCooldownBanner();
    cooldownBanner = document.createElement('div');
    cooldownBanner.className = 'cooldown-banner';
    cooldownBanner.textContent = `${t('cooldownMsg')}: ${remaining}s`;
    document.body.appendChild(cooldownBanner);
}

function updateCooldownBanner(remaining) {
    if (cooldownBanner) {
        cooldownBanner.textContent = `${t('cooldownMsg')}: ${remaining}s`;
    }
}

function hideCooldownBanner() {
    if (cooldownBanner) {
        cooldownBanner.remove();
        cooldownBanner = null;
    }
}

// ── 코드 보기 버튼 핸들러 ──
function handleViewCode(e, code, islandId) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const card = btn.closest('.island-card');
    const codeEl = card.querySelector('.code');

    // 이미 공개된 코드면 클립보드 복사만
    if (codeEl.classList.contains('revealed')) {
        navigator.clipboard.writeText(code);
        return;
    }

    // 쿨타임 중이면 무시
    if (isCooldownActive()) {
        return;
    }

    // 코드 공개
    codeEl.classList.add('revealed');
    codeEl.textContent = code;
    navigator.clipboard.writeText(code);
    saveRevealedCode(islandId);

    // 버튼 비활성화
    btn.disabled = true;

    // 쿨타임 시작
    startCooldown();
}

// ── 폼 제출 ──
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.className = 'message';
    messageEl.textContent = '';

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const code = codeInput.value.trim();

    // 클라이언트 사이드 검증
    if (title.length < 2) {
        showMessage(t('errorTitleMin'), 'error');
        return;
    }
    if (code.length !== 8) {
        showMessage(t('errorCodeLength'), 'error');
        return;
    }

    const duration = parseInt(document.querySelector('input[name="duration"]:checked').value, 10);

    try {
        const res = await fetch(`${API_URL}/islands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, code, duration }),
        });

        const data = await res.json();

        if (!res.ok) {
            showMessage(data.error || t('errorServer'), 'error');
            return;
        }

        showMessage(t('successMsg'), 'success');
        form.reset();
        document.querySelector('input[name="duration"][value="60"]').checked = true;
        fetchIslands();
    } catch (err) {
        showMessage(t('errorServer'), 'error');
    }
});

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.className = 'message';
        messageEl.textContent = '';
    }, 4000);
}

// ── 섬 목록 가져오기 ──
async function fetchIslands() {
    try {
        const res = await fetch(`${API_URL}/islands`);
        const data = await res.json();
        renderIslands(data);
    } catch (err) {
        console.error('목록 불러오기 실패:', err);
    }
}

let islandsData = [];
let countdownInterval = null;

function renderIslands(data) {
    islandsData = data;
    const container = document.getElementById('islands');
    const countEl = document.getElementById('count');

    countEl.textContent = `(${data.length})`;

    if (data.length === 0) {
        container.innerHTML = `<p class="empty">${escapeHtml(t('emptyMsg'))}</p>`;
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        return;
    }

    container.innerHTML = data.map(island => {
        const revealed = isCodeRevealed(island.id);
        const isCooling = isCooldownActive();
        return `
        <div class="island-card" data-id="${island.id}">
            <div class="title">🏝️ ${escapeHtml(island.title)}</div>
            ${island.description ? `<div class="description">${escapeHtml(island.description)}</div>` : ''}
            <div class="meta">
                <span class="code ${revealed ? 'revealed' : ''}">${revealed ? escapeHtml(island.code) : ''}</span>
                <button class="view-code-btn" onclick="handleViewCode(event, '${island.code}', '${island.id}')" ${revealed || isCooling ? 'disabled' : ''}>${escapeHtml(t('viewCodeBtn'))}</button>
                <span class="timer" data-remaining="${island.remaining_seconds}">${t('remaining')}: ${island.remaining_seconds}${t('seconds')}</span>
            </div>
        </div>
    `}).join('');

    // 쿨타임 중이면 새로 렌더링된 카드에도 적용
    if (isCooldownActive()) {
        applyCooldownToCards();
    }

    startCountdown();
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const timers = document.querySelectorAll('.timer');
        let hasExpired = false;

        timers.forEach(timer => {
            let remaining = parseInt(timer.dataset.remaining, 10);
            remaining -= 1;
            timer.dataset.remaining = remaining;

            if (remaining <= 0) {
                timer.textContent = t('expired');
                hasExpired = true;
            } else {
                timer.textContent = `${t('remaining')}: ${remaining}${t('seconds')}`;
            }
        });

        if (hasExpired) {
            fetchIslands();
        }
    }, 1000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── 초기화 ──
applyTranslations();
fetchIslands();
setInterval(fetchIslands, 5000);
