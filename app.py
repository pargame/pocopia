from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime, timedelta, timezone
import uuid
import threading
import re
import os

app = Flask(__name__, static_folder="static")

# 메모리 저장소: {id: island_data}
islands = {}


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

    island_id = str(uuid.uuid4())[:8]
    now = now_kst()
    expires = now + timedelta(seconds=60)

    island = {
        "id": island_id,
        "title": title,
        "description": description,
        "code": code,
        "created_at": now,
        "expires_at": expires,
    }
    islands[island_id] = island
    schedule_delete(island_id, delay=60)

    return jsonify({
        "id": island_id,
        "title": title,
        "description": description,
        "code": code,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "remaining_seconds": 60,
    }), 201


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
