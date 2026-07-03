# ── Pokopia 서버 관리 zsh alias ──
# 사용법: ~/.zshrc 맨 아래에 아래 한 줄 추가
# source $HOME/repos/pocopia/scripts/pokopia.zsh

POKOPIA_DIR="$HOME/repos/pocopia"

# .env에서 Cloudflare Tunnel 토큰 로드
if [ -f "$POKOPIA_DIR/.env" ]; then
    export $(grep -v '^#' "$POKOPIA_DIR/.env" | xargs)
fi

_pokopia_gunicorn_start() {
    # 실제 HTTP 응답까지 확인해서 좀비 프로세스로 인한 오인식 방지
    if pgrep -f "gunicorn.*app:app" > /dev/null && curl -s -o /dev/null http://127.0.0.1:5000/islands; then
        echo "[Pokopia] 서버가 이미 실행 중입니다"
        return 0
    fi

    # 잔여/좀비 프로세스 정리
    pkill -f "gunicorn.*app:app" 2>/dev/null || true
    sleep 1

    cd "$POKOPIA_DIR" && nohup "$POKOPIA_DIR/.venv/bin/gunicorn" \
        -w 1 -b 127.0.0.1:5000 \
        --access-logfile "$POKOPIA_DIR/gunicorn.log" \
        --error-logfile "$POKOPIA_DIR/gunicorn.log" \
        app:app > /dev/null 2>&1 &
    echo "[Pokopia] 서버 시작 중..."

    # 서버가 실제로 응답할 때까지 최대 10초 대기
    for i in {1..10}; do
        if curl -s -o /dev/null http://127.0.0.1:5000/islands; then
            return 0
        fi
        sleep 1
    done

    echo "[Pokopia] 서버 시작 실패"
    return 1
}

_pokopia_gunicorn_stop() {
    pkill -f "gunicorn.*app:app" 2>/dev/null || true
}

_pokopia_tunnel_start() {
    if pgrep -f "cloudflared tunnel run.*pokoclouds" > /dev/null; then
        echo "[Pokopia] Tunnel이 이미 실행 중입니다"
        return 0
    fi
    if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
        echo "[Pokopia] CLOUDFLARE_TUNNEL_TOKEN이 설정되지 않았습니다. .env 파일을 확인하세요."
        return 1
    fi
    cd "$POKOPIA_DIR" && nohup /opt/homebrew/bin/cloudflared tunnel run \
        --token "$CLOUDFLARE_TUNNEL_TOKEN" \
        pokoclouds > "$POKOPIA_DIR/cloudflared.log" 2>&1 &
    echo "[Pokopia] Tunnel 시작 중..."
}

_pokopia_tunnel_stop() {
    pkill -f "cloudflared tunnel run.*pokoclouds" 2>/dev/null || true
}

pokopia-start() {
    _pokopia_gunicorn_start
    sleep 1
    _pokopia_tunnel_start
    sleep 2
    echo "[Pokopia] 서버와 Tunnel 시작됨 → https://pokoclouds.com"
}

pokopia-stop() {
    _pokopia_gunicorn_stop
    sleep 1
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
    if pgrep -f "gunicorn.*app:app" > /dev/null; then
        echo "[Pokopia] 서버 상태: 실행 중"
    else
        echo "[Pokopia] 서버 상태: 중지됨"
    fi
    if pgrep -f "cloudflared tunnel run.*pokoclouds" > /dev/null; then
        echo "[Pokopia] Tunnel 상태: 실행 중"
    else
        echo "[Pokopia] Tunnel 상태: 중지됨"
    fi
    local maint=$(curl -s http://localhost:5000/maintenance 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print('ON' if d['enabled'] else 'OFF')" 2>/dev/null)
    echo "[Pokopia] 예고 문구: ${maint:-확인 불가}"
    echo "[Pokopia] 활성 게시물: $(curl -s http://localhost:5000/islands 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)개"
}
