from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime, timedelta, timezone
import uuid
import threading
import re
import os

app = Flask(__name__, static_folder="static")

# 메모리 저장소: {id: island_data}
islands = {}

# 코드 공개 쿨타임: {ip: timestamp}
reveal_cooldown = {}
COOLDOWN_SECONDS = 30


def now_kst():
    return datetime.now(timezone(timedelta(hours=9)))


def clean_expired():
    """만료된 섬 제거"""
    now = now_kst()
    expired = [k for k, v in islands.items() if v["expires_at"] < now]
    for k in expired:
        islands.pop(k, None)


def schedule_delete(island_id, delay=60):
    """delay 초 후 자동 삭제"""
    def _delete():
        islands.pop(island_id, None)
    threading.Timer(delay, _delete).start()


@app.route("/islands", methods=["GET"])
def get_islands():
    clean_expired()
    now = now_kst()
    result = []
    for island in sorted(islands.values(), key=lambda x: x["created_at"], reverse=True):
        item = {
            "id": island["id"],
            "title": island["title"],
            "description": island["description"],
            "code": island["code"],
            "created_at": island["created_at"].isoformat(),
            "expires_at": island["expires_at"].isoformat(),
            "remaining_seconds": max(0, int((island["expires_at"] - now).total_seconds())),
            "duration": island.get("duration", 60),
            "code": None,  # 코드는 별도 API로 조회
        }
        result.append(item)
    return jsonify(result)


@app.route("/islands", methods=["POST"])
def create_island():
    data = request.get_json() or {}

    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    code = (data.get("code") or "").strip().upper()

    # 유효성 검증
    if len(title) < 2:
        return jsonify({"error": "제목은 2자 이상 입력해주세요."}), 400
    if len(title) > 50:
        return jsonify({"error": "제목은 50자 이하여야 합니다."}), 400
    if len(description) > 200:
        return jsonify({"error": "설명은 200자 이하여야 합니다."}), 400
    if not re.fullmatch(r"[A-HJ-NP-Y0-9]{8}", code):
        return jsonify({"error": "코드는 정확히 8자리의 Z, I, O를 제외한 알파벳 대문자 또는 숫자여야 합니다."}), 400

    # duration 검증 (초 단위)
    duration = data.get("duration", 60)
    VALID_DURATIONS = {60, 300, 1800, 3600}
    if duration not in VALID_DURATIONS:
        duration = 60

    island_id = str(uuid.uuid4())[:8]
    now = now_kst()
    expires = now + timedelta(seconds=duration)

    island = {
        "id": island_id,
        "title": title,
        "description": description,
        "code": code,
        "created_at": now,
        "expires_at": expires,
        "duration": duration,
    }
    islands[island_id] = island
    schedule_delete(island_id, delay=duration)

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
    """코드 공개 (서버 사이드 쿨타임 적용)"""
    clean_expired()

    if island_id not in islands:
        return jsonify({"error": "해당 클라우드섬을 찾을 수 없습니다."}), 404

    # IP 기반 쿨타임 체크
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr).split(",")[0].strip()
    now_ts = datetime.now().timestamp()

    if client_ip in reveal_cooldown:
        elapsed = now_ts - reveal_cooldown[client_ip]
        if elapsed < COOLDOWN_SECONDS:
            remaining = int(COOLDOWN_SECONDS - elapsed)
            return jsonify({"error": f"쿨타임 중입니다. {remaining}초 후 다시 시도해주세요.", "cooldown_remaining": remaining}), 429

    # 쿨타임 기록
    reveal_cooldown[client_ip] = now_ts

    island = islands[island_id]
    return jsonify({
        "id": island_id,
        "code": island["code"],
        "title": island["title"],
    })


@app.route("/islands/<island_id>", methods=["DELETE"])
def delete_island(island_id):
    if island_id in islands:
        islands.pop(island_id)
        return jsonify({"success": True})
    return jsonify({"error": "해당 클라우드섬을 찾을 수 없습니다."}), 404


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("static", path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
