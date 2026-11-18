const MAX_TITLE_LEN = 20;
const MAX_DESC_LEN = 40;
const MAX_ISLANDS_PER_IP = 2;
const COOLDOWN_SECONDS = 30;
const VALID_DURATIONS = new Set([60, 300, 1800, 3600]);
const CODE_PATTERN = /^[A-HJ-NP-Y0-9]{8}$/;

const ISLANDS_KEY = "islands_store";
const MAINTENANCE_KEY = "maintenance_mode";

const PINNED_ISLANDS = [
  {
    id: "pinned-0",
    title: "모든 템 복사 섬",
    description: "원하는 템을 찍어서 복사할 수 있는 곳입니다.",
    code: "LPDXPD6F",
    duration: 3600,
  },
  {
    id: "pinned-1",
    title: "간판 섬",
    description: "포켓몬 게임에 실제 등장했던 간판을 찍을 수 있습니다.",
    code: "CS8PGM1V",
    duration: 3600,
  },
  {
    id: "pinned-2",
    title: "포켓몬 정보국 타운",
    description: "공식 포켓몬 정보국의 커뮤니티 타운입니다.",
    code: "PXQCG03S",
    duration: 3600,
  },
  {
    id: "pinned-3",
    title: "PokemonXP & Worlds",
    description: "세계대회 기념 한정 가구와 트로피가 전시된 곳입니다.",
    code: "JW7MXKP2",
    duration: 3600,
  },
  {
    id: "pinned-4",
    title: "코로코로 섬",
    description: "코로코로 코믹 공식 콜라보 한정 가구 섬입니다.",
    code: "MJ6XPRMQ",
    duration: 3600,
  },
  {
    id: "pinned-5",
    title: "YUMMYYUMMY 섬",
    description: "카페와 레스토랑 테마의 음식 소품이 가득한 섬입니다.",
    code: "03X3H83D",
    duration: 3600,
  },
  {
    id: "pinned-6",
    title: "EIKO 시티",
    description: "방송인 에이코 카노와의 공식 콜라보 도시 섬입니다.",
    code: "QBRK7FVM",
    duration: 3600,
  },
  {
    id: "pinned-7",
    title: "모든 자연 지형 섬",
    description: "사막, 설원 등 모든 지형의 자연물이 모인 섬입니다.",
    code: "H2745335",
    duration: 3600,
  },
];

const MAINTENANCE_MESSAGE = {
  ko: "잠시 후 서버가 재시작됩니다. 게시물은 초기화되니 필요한 코드는 미리 복사해주세요!",
  en: "Server will restart soon. Please copy any codes you need before the reset!",
  ja: "まもなくサーバーが再起動されます。必要なコードは事前にコピーしてください！",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getClientIp(request) {
  const cfIp = request.headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function buildPinnedItems(nowMs) {
  const createdIso = new Date(nowMs).toISOString();
  const expiresMs = nowMs + 100 * 365 * 24 * 60 * 60 * 1000;
  const expiresIso = new Date(expiresMs).toISOString();
  return PINNED_ISLANDS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    created_at: createdIso,
    expires_at: expiresIso,
    remaining_seconds: Math.floor((expiresMs - nowMs) / 1000),
    duration: item.duration,
    code: item.code,
    is_pinned: true,
  }));
}

function buildUserItem(island, nowMs) {
  return {
    id: island.id,
    title: island.title,
    description: island.description,
    created_at: new Date(island.created_at).toISOString(),
    expires_at: new Date(island.expires_at).toISOString(),
    remaining_seconds: Math.max(0, Math.floor((island.expires_at - nowMs) / 1000)),
    duration: island.duration || 60,
    code: null,
    is_pinned: false,
  };
}

async function loadActiveUserIslands(kv, nowMs) {
  const raw = await kv.get(ISLANDS_KEY, "json");
  if (!Array.isArray(raw)) return { list: [], changed: false };
  const active = raw.filter((item) => item && item.expires_at > nowMs);
  return { list: active, changed: active.length !== raw.length };
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const kv = env.POCOPIA_KV;
    const nowMs = Date.now();

    if (path === "/islands" && method === "GET") {
      const { list } = await loadActiveUserIslands(kv, nowMs);
      const userItems = list
        .slice()
        .sort((a, b) => b.created_at - a.created_at)
        .map((item) => buildUserItem(item, nowMs));
      const pinnedItems = buildPinnedItems(nowMs);
      return jsonResponse([...userItems, ...pinnedItems]);
    }

    if (path === "/islands" && method === "POST") {
      let data = {};
      try {
        data = (await request.json()) || {};
      } catch {
        data = {};
      }
      const title = String(data.title || "").trim();
      const description = String(data.description || "").trim();
      const code = String(data.code || "").trim().toUpperCase();

      if (title.length < 2) return jsonResponse({ error: "title_min" }, 400);
      if (title.length > MAX_TITLE_LEN) return jsonResponse({ error: "title_max" }, 400);
      if (description.length > MAX_DESC_LEN) return jsonResponse({ error: "desc_max" }, 400);
      if (!CODE_PATTERN.test(code)) return jsonResponse({ error: "code_invalid" }, 400);

      const duration = VALID_DURATIONS.has(data.duration) ? data.duration : 60;
      const clientIp = getClientIp(request);

      const { list } = await loadActiveUserIslands(kv, nowMs);
      const activeCount = list.filter((v) => v.creator_ip === clientIp).length;
      if (activeCount >= MAX_ISLANDS_PER_IP) {
        return jsonResponse({ error: "ip_limit" }, 429);
      }

      const islandId = crypto.randomUUID().slice(0, 8);
      const expiresMs = nowMs + duration * 1000;
      const newIsland = {
        id: islandId,
        title,
        description,
        code,
        created_at: nowMs,
        expires_at: expiresMs,
        duration,
        creator_ip: clientIp,
      };
      list.push(newIsland);
      await kv.put(ISLANDS_KEY, JSON.stringify(list));

      return jsonResponse(
        {
          id: islandId,
          title,
          description,
          code,
          created_at: new Date(nowMs).toISOString(),
          expires_at: new Date(expiresMs).toISOString(),
          remaining_seconds: duration,
          duration,
        },
        201
      );
    }

    if (path === "/islands/me" && method === "GET") {
      const clientIp = getClientIp(request);
      const { list } = await loadActiveUserIslands(kv, nowMs);
      const myItems = list
        .filter((v) => v.creator_ip === clientIp)
        .sort((a, b) => b.created_at - a.created_at)
        .map((v) => buildUserItem(v, nowMs));
      return jsonResponse(myItems);
    }

    if (path === "/islands/me" && method === "DELETE") {
      const clientIp = getClientIp(request);
      const { list } = await loadActiveUserIslands(kv, nowMs);
      const deletedIds = list.filter((v) => v.creator_ip === clientIp).map((v) => v.id);
      const remaining = list.filter((v) => v.creator_ip !== clientIp);
      await kv.put(ISLANDS_KEY, JSON.stringify(remaining));
      return jsonResponse({
        success: true,
        deleted_count: deletedIds.length,
        deleted_ids: deletedIds,
      });
    }

    const revealMatch = path.match(/^\/islands\/([^/]+)\/reveal$/);
    if (revealMatch && method === "POST") {
      const islandId = revealMatch[1];
      const pinned = PINNED_ISLANDS.find((p) => p.id === islandId);
      const { list } = await loadActiveUserIslands(kv, nowMs);
      const target = pinned || list.find((v) => v.id === islandId);
      if (!target) return jsonResponse({ error: "not_found" }, 404);

      const clientIp = getClientIp(request);
      const cooldownKey = `cooldown:${clientIp}`;
      const lastTs = await kv.get(cooldownKey);
      if (lastTs) {
        const elapsed = (nowMs - Number(lastTs)) / 1000;
        if (elapsed < COOLDOWN_SECONDS) {
          return jsonResponse(
            {
              error: "cooldown",
              cooldown_remaining: Math.floor(COOLDOWN_SECONDS - elapsed),
            },
            429
          );
        }
      }

      await kv.put(cooldownKey, String(nowMs), { expirationTtl: 60 });
      return jsonResponse({
        id: islandId,
        code: target.code,
        title: target.title,
      });
    }

    const deleteMatch = path.match(/^\/islands\/([^/]+)$/);
    if (deleteMatch && method === "DELETE") {
      const islandId = deleteMatch[1];
      if (PINNED_ISLANDS.some((p) => p.id === islandId)) {
        return jsonResponse({ error: "forbidden" }, 403);
      }
      const { list } = await loadActiveUserIslands(kv, nowMs);
      const target = list.find((v) => v.id === islandId);
      if (!target) return jsonResponse({ error: "not_found" }, 404);
      if (target.creator_ip !== getClientIp(request)) {
        return jsonResponse({ error: "forbidden" }, 403);
      }
      const remaining = list.filter((v) => v.id !== islandId);
      await kv.put(ISLANDS_KEY, JSON.stringify(remaining));
      return jsonResponse({ success: true });
    }

    if (path === "/maintenance" && method === "GET") {
      const val = await kv.get(MAINTENANCE_KEY);
      return jsonResponse({
        enabled: val === "true",
        message: MAINTENANCE_MESSAGE,
      });
    }

    if (path === "/maintenance" && method === "POST") {
      const token = request.headers.get("X-Admin-Token") || "";
      if (!env.ADMIN_TOKEN || !constantTimeEqual(token, env.ADMIN_TOKEN)) {
        return jsonResponse({ error: "unauthorized" }, 403);
      }
      let data = {};
      try {
        data = (await request.json()) || {};
      } catch {
        data = {};
      }
      const enabled = Boolean(data.enabled);
      await kv.put(MAINTENANCE_KEY, enabled ? "true" : "false");
      return jsonResponse({ enabled });
    }

    const assetRes = await env.ASSETS.fetch(request);
    const headers = new Headers(assetRes.headers);
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return new Response(assetRes.body, {
      status: assetRes.status,
      statusText: assetRes.statusText,
      headers,
    });
  },
};
