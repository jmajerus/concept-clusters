// Cloudflare Worker serving the static site (env.ASSETS, same as the
// former Pages deployment) plus three small additions that need a
// backend: gameplay analytics, a weekly Wikipedia link-health check,
// and an admin dashboard to actually see both. All three revolve
// around the same Analytics Engine dataset, discriminated by an
// event-type blob — mirroring the pattern already proven out in the
// author's other project (Letter Punk's src/worker.js and src/admin.js).
//
// Analytics is opt-out-safe by construction, not by a user setting:
// every write path is wrapped so a missing binding, a malformed
// payload, or a network hiccup degrades to a no-op rather than an
// error surfaced to a player or breaking the scheduled run.

import linkManifest from "./link-manifest.json";
import { handleAdmin } from "./admin.js";

const USER_AGENT = "concept-clusters-worker/1.0 (https://concept-clusters.jmajerus.workers.dev)";
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

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkLinkHealth(env));
  }
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

// ---- weekly link-health check ----
// The same forward-resolution + disambiguation-detection logic as
// tools/check-wiki-links.mjs (see that file for the reasoning behind
// each step — this is a direct port, not a reimplementation), run
// against link-manifest.json instead of puzzles.js directly, since a
// Worker can't eval() the authoring-format source at runtime. Only
// titles that have drifted since the manifest was last regenerated —
// a Wikipedia rename, merge, or new disambiguation — get logged;
// there's no cache to update here, just week-over-week drift detection.

async function checkLinkHealth(env) {
  const BATCH_SIZE = 50;
  let checked = 0;
  const issues = [];

  for (let i = 0; i < linkManifest.length; i += BATCH_SIZE) {
    const batch = linkManifest.slice(i, i + BATCH_SIZE);
    try {
      const results = await queryExistence(batch);
      checked += batch.length;
      for (const [title, r] of Object.entries(results)) {
        if (!r.exists || r.disambiguation) {
          issues.push({ title, status: r.exists ? "disambiguation" : "missing" });
        }
      }
    } catch (err) {
      writeDataPoint(env, {
        blobs: ["link_health_error", String(err?.message ?? err).slice(0, 200)],
        doubles: [0],
        indexes: ["link_health"]
      });
    }
  }

  for (const issue of issues) {
    writeDataPoint(env, {
      blobs: ["link_health_issue", issue.title.slice(0, 200), issue.status],
      doubles: [1],
      indexes: [issue.title.slice(0, 96)]
    });
  }

  // A heartbeat every run, issues or not — so "no issues logged" and
  // "the cron silently stopped firing" don't look identical from the
  // Analytics Engine side.
  writeDataPoint(env, {
    blobs: ["link_health_run"],
    doubles: [checked, issues.length],
    indexes: ["link_health"]
  });
}

function writeDataPoint(env, dataPoint) {
  if (env.ANALYTICS) env.ANALYTICS.writeDataPoint(dataPoint);
}

async function queryExistence(titles) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join("|"))}&redirects=1&prop=pageprops&format=json&formatversion=2`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Wikipedia API returned HTTP ${res.status}`);
  const data = await res.json();
  const q = data.query || {};
  const normalizedTo = new Map((q.normalized || []).map(n => [n.from, n.to]));
  const redirectTo = new Map((q.redirects || []).map(r => [r.from, r.to]));
  const pageByTitle = new Map(Object.values(q.pages || {}).map(p => [p.title, p]));

  const results = {};
  for (const title of titles) {
    const afterNormalize = normalizedTo.get(title) ?? title;
    const finalTitle = redirectTo.get(afterNormalize) ?? afterNormalize;
    const page = pageByTitle.get(finalTitle);
    results[title] = page
      ? { exists: !page.missing, disambiguation: !!(page.pageprops && "disambiguation" in page.pageprops) }
      : { exists: false, disambiguation: false };
  }
  return results;
}
