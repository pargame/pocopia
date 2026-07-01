# ── Pokopia 서버 관리 zsh alias ──
# 사용법: ~/.zshrc 맨 아래에 아래 한 줄 추가
# source /Users/pargame/repos/pocopia/scripts/pokopia.zsh

_pokopia_gunicorn_start() {
    if ! launchctl print gui/$(id -u)/com.pokopia.gunicorn 2>/dev/null | grep -q "path ="; then
        launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pokopia.gunicorn.plist
    fi
    launchctl start gui/$(id -u)/com.pokopia.gunicorn
}

_pokopia_gunicorn_stop() {
    launchctl bootout gui/$(id -u)/com.pokopia.gunicorn 2>/dev/null || true
}

_pokopia_tunnel_start() {
    if ! launchctl print gui/$(id -u)/com.pokopia.cloudflared 2>/dev/null | grep -q "path ="; then
        launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pokopia.cloudflared.plist
    fi
    launchctl start gui/$(id -u)/com.pokopia.cloudflared
}

_pokopia_tunnel_stop() {
    launchctl bootout gui/$(id -u)/com.pokopia.cloudflared 2>/dev/null || true
}

pokopia-start() {
    _pokopia_gunicorn_start
    _pokopia_tunnel_start
    echo "[Pokopia] 서버와 Tunnel 시작됨 → https://pokoclouds.com"
}

pokopia-stop() {
    _pokopia_gunicorn_stop
    _pokopia_tunnel_stop
    echo "[Pokopia] 서버와 Tunnel 종료됨"
}

pokopia-alert() {
    echo "[Pokopia] 예고 문구를 켜는 중..."
    local res=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/maintenance \
      -H "Content-Type: application/json" \
      -H "X-Admin-Token: pokopia-admin-2026" \
      -d '{"enabled":true}')
    local code=$(echo "$res" | tail -1)
    if [ "$code" = "200" ]; then
        echo "[Pokopia] 예고 문구 ON → 사용자들에게 노란 배너 표시됨"
    else
        echo "[Pokopia] 실패 (HTTP $code)"
        return 1
    fi
}

pokopia-alert-off() {
    echo "[Pokopia] 예고 문구를 끄는 중..."
    local res=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/maintenance \
      -H "Content-Type: application/json" \
      -H "X-Admin-Token: pokopia-admin-2026" \
      -d '{"enabled":false}')
    local code=$(echo "$res" | tail -1)
    if [ "$code" = "200" ]; then
        echo "[Pokopia] 예고 문구 OFF → 배너 사라짐"
    else
        echo "[Pokopia] 실패 (HTTP $code)"
        return 1
    fi
}

pokopia-status() {
    echo "[Pokopia] 서버 상태:"
    launchctl print gui/$(id -u)/com.pokopia.gunicorn 2>/dev/null | grep -E "state =|path =" || echo "  중지됨"
    echo "[Pokopia] Tunnel 상태:"
    launchctl print gui/$(id -u)/com.pokopia.cloudflared 2>/dev/null | grep -E "state =|path =" || echo "  중지됨"
    local maint=$(curl -s http://localhost:5000/maintenance 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print('ON' if d['enabled'] else 'OFF')" 2>/dev/null)
    echo "[Pokopia] 예고 문구: ${maint:-확인 불가}"
    echo "[Pokopia] 활성 게시물: $(curl -s http://localhost:5000/islands 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)개"
}
