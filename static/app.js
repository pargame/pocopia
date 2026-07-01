const API_URL = '';

// 폼 제출
const form = document.getElementById('islandForm');
const messageEl = document.getElementById('message');
const codeInput = document.getElementById('code');

// ── 언어 선택 ──
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// ── 코드 입력 실시간 필터링 ──
const VALID_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY0123456789';

codeInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase();
    let filtered = '';
    for (const ch of value) {
        if (VALID_CODE_CHARS.includes(ch)) {
            filtered += ch;
        }
    }
    // 8자 초과 자르기
    if (filtered.length > 8) {
        filtered = filtered.slice(0, 8);
    }
    e.target.value = filtered;
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
    // 한글/특수문자/소문자 등 차단
    if (!VALID_CODE_CHARS.includes(ch)) {
        e.preventDefault();
    }
});

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

    try {
        const res = await fetch(`${API_URL}/islands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, code }),
        });

        const data = await res.json();

        if (!res.ok) {
            showMessage(data.error || t('errorServer'), 'error');
            return;
        }

        showMessage(t('successMsg'), 'success');
        form.reset();
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

    countEl.textContent = `(${data.length}${t('countSuffix')})`;

    if (data.length === 0) {
        container.innerHTML = `<p class="empty">${escapeHtml(t('emptyMsg'))}</p>`;
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        return;
    }

    container.innerHTML = data.map(island => `
        <div class="island-card" data-id="${island.id}">
            <div class="title">🏝️ ${escapeHtml(island.title)}</div>
            ${island.description ? `<div class="description">${escapeHtml(island.description)}</div>` : ''}
            <div class="meta">
                <span class="code">${escapeHtml(island.code)}</span>
                <span class="timer" data-remaining="${island.remaining_seconds}">${t('remaining')}: ${island.remaining_seconds}${t('seconds')}</span>
            </div>
        </div>
    `).join('');

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
