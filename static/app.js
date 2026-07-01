const API_URL = '';

// 폼 제출
const form = document.getElementById('islandForm');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.className = 'message';
    messageEl.textContent = '';

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const codeInput = document.getElementById('code');
    const code = codeInput.value.trim().toUpperCase();
    codeInput.value = code;  // 입력창도 대문자로 강제 변환

    try {
        const res = await fetch(`${API_URL}/islands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, code }),
        });

        const data = await res.json();

        if (!res.ok) {
            showMessage(data.error || '오류가 발생했습니다.', 'error');
            return;
        }

        showMessage('클우드섬이 공유되었습니다! (60초 후 자동 삭제)', 'success');
        form.reset();
        fetchIslands();
    } catch (err) {
        showMessage('서버 연결에 실패했습니다.', 'error');
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

// 섬 목록 가져오기
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

    countEl.textContent = `(${data.length}개)`;

    if (data.length === 0) {
        container.innerHTML = '<p class="empty">아직 공유된 클라우드섬이 없습니다.</p>';
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
                <span class="timer" data-remaining="${island.remaining_seconds}">남은 시간: ${island.remaining_seconds}초</span>
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
                timer.textContent = '만료됨';
                hasExpired = true;
            } else {
                timer.textContent = `남은 시간: ${remaining}초`;
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

// 초기 로드 및 주기적 갱신
fetchIslands();
setInterval(fetchIslands, 5000);
