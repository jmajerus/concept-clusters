// Cloudflare Worker serving the static site (env.ASSETS from site/) plus
// gameplay analytics and an admin dashboard over them. Analytics writes are
// opt-out-safe: a missing binding, malformed payload, or network hiccup
// degrades to a no-op. The weekly Wikipedia link-health check lives in the
// authoring Worker (src/authoring-worker.ts), which has the D1 binding the
// published corpus is read from.
//
// Local MCP /admin/drafts and the authoring /admin index are not handled
// here. `npm run dev -- --worker` serves those routes from Node in front
// of this Worker so they can use the same D1 HTTP client and Access owner
// as stdio MCP. Player analytics /admin remains this Worker's dashboard.

import { handleAdmin } from "./admin.js";

const ALLOWED_EVENTS = new Set(["puzzle_load", "puzzle_completed"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/event") {
      return handleEvent(request, env);
    }
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdmin(request, env);
    }
    return env.ASSETS.fetch(request);
  },

};

// ---- gameplay analytics ----
// puzzle_load: which puzzles/modes are actually played. puzzle_completed:
// a difficulty signal — wrong-guess count, time taken, and whether Show
// Solution was a cold click or a genuine give-up after trying. Neither
// is a full interaction trace (no per-move event) — see game.js's
// trackPuzzleCompleted for exactly what's counted as "incorrect".

async function handleEvent(request, env) {
  try {
    const { event, data = {} } = await request.json();
    if (ALLOWED_EVENTS.has(event) && env.ANALYTICS) {
      // request.cf is populated by Cloudflare's edge, not the client --
      // this geo data can't be spoofed by a player the way a body field
      // could be. Aggregate counts only, no per-user tracking.
      const geo = { country: request.cf?.country, region: request.cf?.region, city: request.cf?.city };
      const dataPoint = buildDataPoint(event, data, geo);
      if (dataPoint) env.ANALYTICS.writeDataPoint(dataPoint);
    }
  } catch {
    // Malformed payload — discard rather than error; this must never
    // be something a player can observe or break the page over.
  }
  return new Response(null, { status: 204 });
}

// Schema (both events): blob1 = event name, blob2 = puzzleId, blob3 = mode.
// puzzle_load: blob4 = country (ISO 3166-1 alpha-2), blob5 = region,
// blob6 = city (both from request.cf, Cloudflare's GeoIP inference),
// double1 = 1 (a plain count column for SUM()-based totals).
// puzzle_completed: double1 = incorrectMoveCount, double2 = elapsedSeconds,
// double3 = usedShowSolution (1/0), double4 = hadProgressBeforeShowSolution (1/0).
function buildDataPoint(event, data, geo) {
  const puzzleId = String(data.puzzleId ?? "").slice(0, 64);
  const mode = String(data.mode ?? "").slice(0, 16);
  // indexed on puzzleId for both event types — AE samples/groups per
  // distinct index value at volume, and "which puzzle" is exactly the
  // dimension worth keeping precise here.

  if (event === "puzzle_load") {
    return {
      blobs: ["puzzle_load", puzzleId, mode, geo.country || "unknown", geo.region || "unknown", geo.city || "unknown"],
      doubles: [1],
      indexes: [puzzleId || "unknown"]
    };
  }

  if (event === "puzzle_completed") {
    const incorrectMoveCount = Number.isFinite(data.incorrectMoveCount) ? Number(data.incorrectMoveCount) : 0;
    const elapsedSeconds = Number.isFinite(data.elapsedMs) ? Math.round(Number(data.elapsedMs) / 1000) : 0;
    return {
      blobs: ["puzzle_completed", puzzleId, mode],
      doubles: [
        incorrectMoveCount,
        elapsedSeconds,
        data.usedShowSolution === true ? 1 : 0,
        data.hadProgressBeforeShowSolution === true ? 1 : 0
      ],
      indexes: [puzzleId || "unknown"]
    };
  }

  return null;
}
