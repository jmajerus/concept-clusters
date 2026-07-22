// Cloudflare Worker serving the static site (env.ASSETS, same as the
// former Pages deployment) plus two small additions that need a
// backend: gameplay analytics and a weekly Wikipedia link-health check.
// Both write to the same Analytics Engine dataset, discriminated by an
// event-type blob — mirroring the pattern already proven out in the
// author's other project (Letter Punk's src/worker.js).
//
// Analytics is opt-out-safe by construction, not by a user setting:
// every write path is wrapped so a missing binding, a malformed
// payload, or a network hiccup degrades to a no-op rather than an
// error surfaced to a player or breaking the scheduled run.

import linkManifest from "./link-manifest.json";

const USER_AGENT = "concept-clusters-worker/1.0 (https://concept-clusters.jmajerus.workers.dev)";
const ALLOWED_EVENTS = new Set(["puzzle_load"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/event") {
      return handleEvent(request, env);
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkLinkHealth(env));
  }
};

// ---- gameplay analytics: which puzzles/modes are actually played ----
// Deliberately just load events, not every connect/move — the ask was
// "which puzzles are being played", not a full interaction trace.

async function handleEvent(request, env) {
  try {
    const { event, data = {} } = await request.json();
    if (ALLOWED_EVENTS.has(event) && env.ANALYTICS) {
      const dataPoint = buildDataPoint(event, data);
      if (dataPoint) env.ANALYTICS.writeDataPoint(dataPoint);
    }
  } catch {
    // Malformed payload — discard rather than error; this must never
    // be something a player can observe or break the page over.
  }
  return new Response(null, { status: 204 });
}

function buildDataPoint(event, data) {
  if (event === "puzzle_load") {
    const puzzleId = String(data.puzzleId ?? "").slice(0, 64);
    const mode = String(data.mode ?? "").slice(0, 16);
    return {
      blobs: ["puzzle_load", puzzleId, mode],
      doubles: [1],
      // indexed on puzzleId — AE samples/groups per distinct index
      // value at volume, and "which puzzle" is exactly the dimension
      // worth keeping precise here.
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
