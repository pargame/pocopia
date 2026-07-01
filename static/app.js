const API_URL = '';
const COOLDOWN_SECONDS = 30;
const COOLDOWN_KEY = 'pokopia-cooldown-end';
const REVEALED_KEY = 'pokopia-revealed';
const VALID_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY0123456789';

// ── DOM 요소 ──
const form = document.getElementById('islandForm');
const messageEl = document.getElementById('message');
const codeInput = document.getElementById('code');
const codeHint = document.getElementById('code-hint');

// ── 상태 ──
let islandsData = [];
let islandTimers = {};  // { id: clientExpiresAt }
let timerInterval = null;
let cooldownInterval = null;
let searchKeyword = '';
let filterMode = 'pinned';
let cooldownEndTime = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
let cooldownBanner = null;

// ── localStorage 헬퍼 ──
const storage = {
    get: (key, fallback = {}) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

const revealedData = () => storage.get(REVEALED_KEY, {});
const saveRevealed = (id, code) => { const d = revealedData(); d[id] = code; storage.set(REVEALED_KEY, d); };
const isRevealed = (id) => id in revealedData();
const getRevealedCode = (id) => revealedData()[id] || '';

function syncRevealed(serverIds) {
    const d = revealedData();
    const set = new Set(serverIds);
    let changed = false;
    for (const id of Object.keys(d)) {
        if (!set.has(id)) { delete d[id]; changed = true; }
    }
    if (changed) storage.set(REVEALED_KEY, d);
}

// ── 쿨타임 ──
function isCooldownActive() { return Date.now() < cooldownEndTime; }

function startCooldown() {
    if (cooldownEndTime <= Date.now()) cooldownEndTime = Date.now() + COOLDOWN_SECONDS * 1000;
    localStorage.setItem(COOLDOWN_KEY, cooldownEndTime.toString());
    document.querySelectorAll('.island-card').forEach(c => c.classList.add('cooldown'));
    showBanner(Math.ceil((cooldownEndTime - Date.now()) / 1000));
    clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
        const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
        if (remaining <= 0) endCooldown(); else updateBanner(remaining);
    }, 1000);
}

function endCooldown() {
    cooldownEndTime = 0;
    localStorage.removeItem(COOLDOWN_KEY);
    clearInterval(cooldownInterval);
    cooldownInterval = null;
    document.querySelectorAll('.island-card').forEach(c => c.classList.remove('cooldown'));
    hideBanner();
}

function showBanner(sec) {
    hideBanner();
    cooldownBanner = document.createElement('div');
    cooldownBanner.className = 'cooldown-banner';
    cooldownBanner.textContent = `${t('cooldownMsg')}: ${sec}${t('seconds')}`;
    document.body.appendChild(cooldownBanner);
}

function updateBanner(sec) { if (cooldownBanner) cooldownBanner.textContent = `${t('cooldownMsg')}: ${sec}${t('seconds')}`; }
function hideBanner() { if (cooldownBanner) { cooldownBanner.remove(); cooldownBanner = null; } }

if (cooldownEndTime > Date.now()) {
    startCooldown();
}

// ── 코드 입력 필터링 ──
function isInvalidChar(ch) {
    const u = ch.toUpperCase();
    return !((u >= 'A' && u <= 'Z') || (u >= '0' && u <= '9'));
}

function filterCodeInput(value) {
    let filtered = '', invalid = false;
    for (const ch of value.toUpperCase()) {
        if (VALID_CODE_CHARS.includes(ch)) filtered += ch;
        else if (isInvalidChar(ch)) invalid = true;
    }
    return { text: filtered.slice(0, 8), invalid };
}

function showInputHint(show) {
    codeHint.textContent = show ? t('codeInputHint') : '';
    codeHint.classList.toggle('visible', show);
    codeInput.classList.toggle('input-error', show);
}

codeInput.addEventListener('input', (e) => {
    const result = filterCodeInput(e.target.value);
    e.target.value = result.text;
    if (result.invalid) {
        showInputHint(true);
        clearTimeout(codeHint._timer);
        codeHint._timer = setTimeout(() => showInputHint(false), 2000);
    }
});

codeInput.addEventListener('keydown', (e) => {
    if (['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Enter'].includes(e.key) || e.ctrlKey || e.metaKey) return;
    const ch = e.key.toUpperCase();
    if (!VALID_CODE_CHARS.includes(ch)) {
        e.preventDefault();
        if (isInvalidChar(e.key)) {
            showInputHint(true);
            clearTimeout(codeHint._timer);
            codeHint._timer = setTimeout(() => showInputHint(false), 2000);
        }
    }
});

codeInput.addEventListener('blur', () => showInputHint(false));

// ── 코드 보기 ──
async function handleViewCode(btn) {
    const islandId = btn.dataset.islandId;
    const card = btn.closest('.island-card');
    const codeEl = card.querySelector('.code');
    try {
        const res = await fetch(`${API_URL}/islands/${islandId}/reveal`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) { showMessage(data.error || t('errorServer'), 'error'); return; }
        codeEl.classList.add('revealed');
        codeEl.textContent = data.code;
        saveRevealed(islandId, data.code);
        btn.disabled = true;
        startCooldown();
    } catch { showMessage(t('errorServer'), 'error'); }
}

document.getElementById('islands').addEventListener('click', (e) => {
    const btn = e.target.closest('.view-code-btn');
    if (!btn) return;
    const card = btn.closest('.island-card');
    if (card.querySelector('.code').classList.contains('revealed')) return;
    if (isCooldownActive()) return;
    handleViewCode(btn);
});

// ── 폼 제출 ──
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.className = 'message';
    messageEl.textContent = '';

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const code = codeInput.value.trim();

    if (title.length < 2) { showMessage(t('errorTitleMin'), 'error'); return; }
    if (code.length !== 8) { showMessage(t('errorCodeLength'), 'error'); return; }

    const duration = parseInt(document.querySelector('input[name="duration"]:checked').value, 10);

    try {
        const res = await fetch(`${API_URL}/islands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, code, duration }),
        });
        const data = await res.json();
        if (!res.ok) {
            const map = { ip_limit:'errorIpLimit', title_min:'errorTitleMin', title_max:'errorTitleMax', desc_max:'errorDescMax', code_invalid:'errorCodeInvalid', cooldown:'errorCooldown', not_found:'errorNotFound' };
            showMessage(t(map[data.error]) || data.error || t('errorServer'), 'error');
            return;
        }
        showMessage(t('successMsg'), 'success');
        form.reset();
        document.querySelector('input[name="duration"][value="60"]').checked = true;
        fetchIslands();
    } catch { showMessage(t('errorServer'), 'error'); }
});

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    setTimeout(() => { messageEl.className = 'message'; messageEl.textContent = ''; }, 4000);
}

// ── 목록 ──
async function fetchIslands() {
    const endpoint = filterMode === 'mine' ? `${API_URL}/islands/me` : `${API_URL}/islands`;
    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        syncRevealed(data.map(i => i.id));
        if (!dataEqual(islandsData, data)) renderIslands(data);
    } catch (err) { console.error('fetch failed:', err); }
}

function dataEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id || a[i].title !== b[i].title || a[i].description !== b[i].description || a[i].remaining_seconds !== b[i].remaining_seconds) return false;
    }
    return true;
}

function renderIslands(data) {
    islandsData = data;
    islandTimers = {};
    data.forEach(island => {
        islandTimers[island.id] = Date.now() + island.remaining_seconds * 1000;
    });

    const container = document.getElementById('islands');
    const countEl = document.getElementById('count');
    let filtered;
    if (filterMode === 'pinned') {
        filtered = data.filter(i => i.is_pinned);
    } else if (filterMode === 'mine') {
        filtered = data;
    } else {
        const base = data.filter(i => !i.is_pinned);
        filtered = searchKeyword ? base.filter(i => i.title.toLowerCase().includes(searchKeyword.toLowerCase())) : base;
    }
    const cooling = isCooldownActive();

    countEl.textContent = `(${filtered.length})`;

    if (!data.length) {
        container.innerHTML = `<p class="empty">${esc(t(filterMode === 'mine' ? 'emptyMyMsg' : 'emptyMsg'))}</p>`;
        clearInterval(timerInterval);
        timerInterval = null;
        return;
    }

    container.innerHTML = filtered.map(island => {
        const revealed = isRevealed(island.id);
        const revealedCode = revealed ? getRevealedCode(island.id) : '';
        return `<div class="island-card" data-id="${island.id}">
            <div class="title">🏝️ ${esc(island.title)}</div>
            ${island.description ? `<div class="description">${esc(island.description)}</div>` : ''}
            <div class="meta">
                <span class="code ${revealed ? 'revealed' : ''}">${revealed ? esc(revealedCode) : ''}</span>
                <button class="view-code-btn" data-island-id="${island.id}" ${revealed || cooling ? 'disabled' : ''}>${esc(t('viewCodeBtn'))}</button>
                ${island.is_pinned
                ? `<span class="timer pinned" data-id="${island.id}">${t('permanent')}</span>`
                : `<span class="timer" data-id="${island.id}">${t('remaining')}: ${fmtTime(island.remaining_seconds)}</span>`}
            </div>
        </div>`;
    }).join('');

    if (cooling) document.querySelectorAll('.island-card').forEach(c => c.classList.add('cooldown'));
    startCountdown();
}

function reRenderFromCache() {
    if (islandsData.length > 0) renderIslands(islandsData);
    else fetchIslands();
}

function startCountdown() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        try {
            let expired = false;
            const now = Date.now();
            document.querySelectorAll('.timer').forEach(el => {
                const id = el.dataset.id;
                if (el.classList.contains('pinned')) {
                    el.textContent = t('permanent');
                    return;
                }
                const expiresAt = islandTimers[id];
                const r = Math.floor((expiresAt - now) / 1000);

                el.textContent = r <= 0 ? (expired = true, t('expired')) : `${t('remaining')}: ${fmtTime(r)}`;
            });
            if (expired) fetchIslands();
        } catch (err) {
            console.error('countdown tick error:', err);
        }
    }, 1000);
}

function fmtTime(sec) {
    if (sec <= 0) return t('expired');
    const m = Math.floor(sec / 60), s = sec % 60;
    return m > 0 ? `${m}${t('minutes')} ${s}${t('seconds')}` : `${s}${t('seconds')}`;
}

function esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// ── 검색 ──
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    searchKeyword = e.target.value.trim();
    renderIslands(islandsData);
});

// ── 필터 ──
const filterAllBtn = document.getElementById('filterAll');
const filterMineBtn = document.getElementById('filterMine');
const filterPinnedBtn = document.getElementById('filterPinned');
const deleteAllBtn = document.getElementById('deleteAllMineBtn');

function setFilter(mode) {
    filterMode = mode;
    filterAllBtn?.classList.toggle('active', mode === 'all');
    filterMineBtn?.classList.toggle('active', mode === 'mine');
    filterPinnedBtn?.classList.toggle('active', mode === 'pinned');
    if (deleteAllBtn) deleteAllBtn.style.display = mode === 'mine' ? 'inline-block' : 'none';
    fetchIslands();
}

filterAllBtn?.addEventListener('click', () => setFilter('all'));
filterMineBtn?.addEventListener('click', () => setFilter('mine'));
filterPinnedBtn?.addEventListener('click', () => setFilter('pinned'));

deleteAllBtn?.addEventListener('click', async () => {
    if (!confirm(t('deleteAllMine') + '?')) return;
    try {
        const res = await fetch(`${API_URL}/islands/me`, { method: 'DELETE' });
        const data = await res.json();
        showMessage(res.ok ? t('deleteSuccess') : (data.error || t('errorServer')), res.ok ? 'success' : 'error');
        if (res.ok) fetchIslands();
    } catch { showMessage(t('errorServer'), 'error'); }
});

// ── 배너 ──
async function checkMaintenance() {
    try {
        const res = await fetch(`${API_URL}/maintenance`);
        const data = await res.json();
        const banner = document.getElementById('maintenanceBanner');
        if (!banner) return;
        if (data.enabled) { banner.textContent = '⚠️ ' + (data.message[currentLang] || data.message['ko']); banner.style.display = 'block'; }
        else banner.style.display = 'none';
    } catch { /* ignore */ }
}

// ── 언어 선택 ──
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// ── 정보 패널 토글 ──
document.getElementById('infoToggle')?.addEventListener('click', () => {
    const panel = document.getElementById('infoPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

// ── 초기화 ──
applyTranslations();
checkMaintenance();
if (deleteAllBtn) deleteAllBtn.style.display = 'none';
fetchIslands();
setInterval(fetchIslands, 5000);
