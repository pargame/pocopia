import os
import hmac
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime, timedelta, timezone
import uuid
import re
import threading
import time

# .env 파일 로드 (환경변수 미설정 시 기본 로드)
env_file = Path(__file__).resolve().parent / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

app = Flask(__name__, static_folder="static")

# ── 설정 ──
MAX_TITLE_LEN = 20
MAX_DESC_LEN = 40
MAX_ISLANDS_PER_IP = 2
COOLDOWN_SECONDS = 30
VALID_DURATIONS = {60, 300, 1800, 3600}
CODE_PATTERN = re.compile(r"^[A-HJ-NP-Y0-9]{8}$")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

# ── 고정 클라우드섬 ──
PINNED_ISLANDS = [
    {
        "id": "pinned-0",
        "title": "모든 템 복사 섬",
        "description": "원하는 템을 찍어서 복사할 수 있는 곳입니다.",
        "code": "LPDXPD6F",
        "duration": 3600,
    },
    {
        "id": "pinned-1",
        "title": "간판 섬",
        "description": "포켓몬 게임에 실제 등장했던 간판을 찍을 수 있습니다.",
        "code": "CS8PGM1V",
        "duration": 3600,
    },
    {
        "id": "pinned-2",
        "title": "포켓몬 정보국 타운",
        "description": "공식 포켓몬 정보국의 커뮤니티 타운입니다.",
        "code": "PXQCG03S",
        "duration": 3600,
    },
    {
        "id": "pinned-3",
        "title": "PokemonXP & Worlds",
        "description": "세계대회 기념 한정 가구와 트로피가 전시된 곳입니다.",
        "code": "JW7MXKP2",
        "duration": 3600,
    },
    {
        "id": "pinned-4",
        "title": "코로코로 섬",
        "description": "코로코로 코믹 공식 콜라보 한정 가구 섬입니다.",
        "code": "MJ6XPRMQ",
        "duration": 3600,
    },
    {
        "id": "pinned-5",
        "title": "YUMMYYUMMY 섬",
        "description": "카페와 레스토랑 테마의 음식 소품이 가득한 섬입니다.",
        "code": "03X3H83D",
        "duration": 3600,
    },
    {
        "id": "pinned-6",
        "title": "EIKO 시티",
        "description": "방송인 에이코 카노와의 공식 콜라보 도시 섬입니다.",
        "code": "QBRK7FVM",
        "duration": 3600,
    },
    {
        "id": "pinned-7",
        "title": "모든 자연 지형 섬",
        "description": "사막, 설원 등 모든 지형의 자연물이 모인 섬입니다.",
        "code": "H2745335",
        "duration": 3600,
    },
]

# ── 메모리 저장소 ──
islands = {}           # {id: island_data}
reveal_cooldown = {}   # {ip: timestamp}
maintenance_mode = False

MAINTENANCE_MESSAGE = {
    "ko": "잠시 후 서버가 재시작됩니다. 게시물은 초기화되니 필요한 코드는 미리 복사해주세요!",
    "en": "Server will restart soon. Please copy any codes you need before the reset!",
    "ja": "まもなくサーバーが再起動されます。必要なコードは事前にコピーしてください！",
}


def now_kst():
    return datetime.now(timezone(timedelta(hours=9)))


def start_background_cleaner():
    """1분마다 만료 게시물과 쿨다운을 정리하는 백그라운드 스레드"""
    def cleaner():
        while True:
            time.sleep(60)
            clean_expired()
            clean_expired_cooldown()
    threading.Thread(target=cleaner, daemon=True).start()


def get_client_ip():
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def clean_expired():
    now = now_kst()
    for k in [k for k, v in islands.items() if v.get("creator_ip") != "pinned" and v["expires_at"] < now]:
        islands.pop(k, None)


def init_pinned_islands():
    """서버 시작 시 고정 클라우드섬이 없으면 생성"""
    if any(v.get("creator_ip") == "pinned" for v in islands.values()):
        return
    now = now_kst()
    expires_at = now + timedelta(days=365*100)
    for item in PINNED_ISLANDS:
        islands[item["id"]] = {
            "id": item["id"],
            "title": item["title"],
            "description": item["description"],
            "code": item["code"],
            "created_at": now,
            "expires_at": expires_at,
            "duration": item["duration"],
            "creator_ip": "pinned",
        }


def clean_expired_cooldown():
    now_ts = datetime.now().timestamp()
    for ip in [ip for ip, ts in reveal_cooldown.items() if now_ts - ts >= COOLDOWN_SECONDS]:
        reveal_cooldown.pop(ip, None)


def build_item(island, now):
    is_pinned = island.get("creator_ip") == "pinned"
    return {
        "id": island["id"],
        "title": island["title"],
        "description": island["description"],
        "created_at": island["created_at"].isoformat(),
        "expires_at": island["expires_at"].isoformat(),
        "remaining_seconds": max(0, int((island["expires_at"] - now).total_seconds())),
        "duration": island.get("duration", 60),
        "code": island["code"] if is_pinned else None,
        "is_pinned": is_pinned,
    }


# ── API 엔드포인트 ──

@app.route("/islands", methods=["GET"])
def get_islands():
    clean_expired()
    now = now_kst()
    result = [build_item(v, now) for v in sorted(islands.values(), key=lambda x: x["created_at"], reverse=True)]
    return jsonify(result)


@app.route("/islands", methods=["POST"])
def create_island():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    code = (data.get("code") or "").strip().upper()

    if len(title) < 2:
        return jsonify({"error": "title_min"}), 400
    if len(title) > MAX_TITLE_LEN:
        return jsonify({"error": "title_max"}), 400
    if len(description) > MAX_DESC_LEN:
        return jsonify({"error": "desc_max"}), 400
    if not CODE_PATTERN.fullmatch(code):
        return jsonify({"error": "code_invalid"}), 400

    duration = data.get("duration", 60)
    if duration not in VALID_DURATIONS:
        duration = 60

    client_ip = get_client_ip()
    clean_expired()
    active_count = sum(1 for v in islands.values() if v.get("creator_ip") == client_ip)
    if active_count >= MAX_ISLANDS_PER_IP:
        return jsonify({"error": "ip_limit"}), 429

    island_id = str(uuid.uuid4())[:8]
    now = now_kst()
    expires = now + timedelta(seconds=duration)

    islands[island_id] = {
        "id": island_id,
        "title": title,
        "description": description,
        "code": code,
        "created_at": now,
        "expires_at": expires,
        "duration": duration,
        "creator_ip": client_ip,
    }

    return jsonify({
        "id": island_id,
        "title": title,
        "description": description,
        "code": code,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "remaining_seconds": duration,
        "duration": duration,
    }), 201


@app.route("/islands/<island_id>/reveal", methods=["POST"])
def reveal_code(island_id):
    clean_expired()
    if island_id not in islands:
        return jsonify({"error": "not_found"}), 404

    client_ip = get_client_ip()
    now_ts = datetime.now().timestamp()
    clean_expired_cooldown()

    if client_ip in reveal_cooldown:
        elapsed = now_ts - reveal_cooldown[client_ip]
        if elapsed < COOLDOWN_SECONDS:
            return jsonify({"error": "cooldown", "cooldown_remaining": int(COOLDOWN_SECONDS - elapsed)}), 429

    reveal_cooldown[client_ip] = now_ts
    island = islands[island_id]
    return jsonify({"id": island_id, "code": island["code"], "title": island["title"]})


@app.route("/islands/<island_id>", methods=["DELETE"])
def delete_island(island_id):
    if island_id not in islands:
        return jsonify({"error": "not_found"}), 404
    if islands[island_id].get("creator_ip") == "pinned":
        return jsonify({"error": "forbidden"}), 403
    if islands[island_id].get("creator_ip") != get_client_ip():
        return jsonify({"error": "forbidden"}), 403
    islands.pop(island_id)
    return jsonify({"success": True})


@app.route("/islands/me", methods=["GET"])
def get_my_islands():
    clean_expired()
    client_ip = get_client_ip()
    now = now_kst()
    result = [build_item(v, now) for v in sorted(islands.values(), key=lambda x: x["created_at"], reverse=True)
              if v.get("creator_ip") == client_ip]
    return jsonify(result)


@app.route("/islands/me", methods=["DELETE"])
def delete_all_my_islands():
    clean_expired()
    client_ip = get_client_ip()
    deleted = [k for k, v in list(islands.items()) if v.get("creator_ip") == client_ip]
    for k in deleted:
        islands.pop(k, None)
    return jsonify({"success": True, "deleted_count": len(deleted), "deleted_ids": deleted})


@app.route("/maintenance", methods=["GET"])
def get_maintenance():
    return jsonify({"enabled": maintenance_mode, "message": MAINTENANCE_MESSAGE})


@app.route("/maintenance", methods=["POST"])
def set_maintenance():
    token = request.headers.get("X-Admin-Token") or ""
    if not ADMIN_TOKEN or not hmac.compare_digest(token, ADMIN_TOKEN):
        return jsonify({"error": "unauthorized"}), 403
    global maintenance_mode
    maintenance_mode = bool((request.get_json() or {}).get("enabled", False))
    return jsonify({"enabled": maintenance_mode})


@app.route("/")
def index():
    response = send_from_directory("static", "index.html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.route("/<path:path>")
def static_files(path):
    response = send_from_directory("static", path)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ── 백그라운드 정리 스레드 시작 ──
start_background_cleaner()


# ── 고정 클라우드섬 초기화 ──
init_pinned_islands()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
