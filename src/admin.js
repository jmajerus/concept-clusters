/**
 * Admin dashboard handler — mirrors the pattern from the author's other
 * project, Letter Punk (src/admin.js there), adapted to this project's
 * event schema (puzzle_load / puzzle_completed / link_health_*).
 *
 * Auth flow:
 *   1. GET /admin?key=SECRET  → validates key, sets HttpOnly session cookie,
 *      redirects to /admin (key never stays in URL bar).
 *   2. GET /admin             → validates session cookie, renders dashboard HTML.
 *   3. POST /admin/logout     → clears cookie, redirects to /admin.
 *
 * Required Worker secrets / vars:
 *   ADMIN_KEY   (secret)  — arbitrary passphrase set via `wrangler secret put ADMIN_KEY`
 *   ACCOUNT_ID  (var)     — Cloudflare account ID, set in wrangler.jsonc
 *   API_TOKEN   (secret)  — Cloudflare API token with Account Analytics Read permission
 *
 * The dashboard queries the Analytics Engine SQL API from within the
 * Worker, so no browser-side API token is ever exposed.
 */

const COOKIE_NAME = "cc_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours
const ANALYTICS_DATASET = "concept_clusters_events";

// ---------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------

// crypto.subtle.timingSafeEqual (a Workers-specific extension, not
// standard Web Crypto) returns a plain boolean synchronously -- it is
// not a Promise, so it must never be awaited or .catch()'d directly.
function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.length !== bBytes.length) {
    // Still run a comparison of matching length to avoid leaking length via timing.
    const dummy = new Uint8Array(aBytes.length);
    crypto.subtle.timingSafeEqual(aBytes, dummy);
    return false;
  }

  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function parseCookies(cookieHeader) {
  const cookies = {};
  for (const pair of (cookieHeader || "").split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join("=").trim());
  }
  return cookies;
}

function sessionCookieHeader(value, maxAge = COOKIE_MAX_AGE) {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/admin; HttpOnly; Secure; SameSite=Strict`;
}

async function isAuthenticated(request, env) {
  if (!env.ADMIN_KEY) return false;
  const cookies = parseCookies(request.headers.get("Cookie"));
  return timingSafeEqual(cookies[COOKIE_NAME] || "", env.ADMIN_KEY);
}

// ---------------------------------------------------------------------
// Analytics Engine queries
// ---------------------------------------------------------------------

async function queryAnalytics(sql, env, errors) {
  if (!env.ACCOUNT_ID || !env.API_TOKEN) return null;

  const url = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.API_TOKEN}` },
    body: sql
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Analytics Engine query failed:", response.status, text);
    if (errors && errors.length === 0) errors.push(`HTTP ${response.status}: ${text.slice(0, 300)}`);
    return null;
  }

  const json = await response.json();
  return json.data ?? [];
}

async function fetchStats(env) {
  // Shared across the parallel queries below so one failure (almost
  // always all of them, same token/account for every call) surfaces
  // once instead of not at all -- a bad API_TOKEN previously looked
  // identical to "no data yet", which is exactly what made that bug
  // hard to tell apart from a real empty dataset.
  const errors = [];
  const queryFn = sql => queryAnalytics(sql, env, errors);
  const [
    overview, puzzleActivity, difficulty, recentCompletions, modeSplit, geoDistribution, linkHealthLatest, linkHealthIssues
  ] = await Promise.all([
    // Totals by event type, last 30 days.
    queryFn(`
      SELECT blob1 AS event, count() AS n
      FROM ${ANALYTICS_DATASET}
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
      GROUP BY event
      ORDER BY n DESC
    `),

    // Which puzzles are actually being played, last 30 days.
    queryFn(`
      SELECT
        blob2 AS puzzle_id,
        countIf(blob1 = 'puzzle_load') AS loads,
        countIf(blob1 = 'puzzle_completed') AS completions
      FROM ${ANALYTICS_DATASET}
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
        AND blob1 IN ('puzzle_load', 'puzzle_completed')
        AND blob2 != ''
      GROUP BY puzzle_id
      ORDER BY loads DESC
      LIMIT 20
    `),

    // Difficulty signals per puzzle, from completions only. The
    // "gave up after trying" percentage is deliberately SUM/SUM, not
    // AVG(double4) -- double4 (hadProgressBeforeShowSolution) is only
    // meaningful relative to double3 (usedShowSolution): the question
    // is "of the times Show Solution was used, how often was there
    // progress first", not "of all completions". The division itself
    // happens in JS, not SQL -- Analytics Engine's SQL dialect is a
    // restricted subset that doesn't support NULLIF (confirmed via a
    // live 422 "unknown function call: NULLIF"), so the divide-by-zero
    // guard has to live outside the query.
    queryFn(`
      SELECT
        blob2 AS puzzle_id,
        count() AS completions,
        ROUND(AVG(double1), 1) AS avg_incorrect_moves,
        ROUND(AVG(double2)) AS avg_seconds,
        SUM(double3) AS show_solution_uses,
        SUM(double4) AS progress_before_uses
      FROM ${ANALYTICS_DATASET}
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
        AND blob1 = 'puzzle_completed'
      GROUP BY puzzle_id
      ORDER BY completions DESC
      LIMIT 20
    `),

    // Raw recent completions, unfiltered by date -- useful right after
    // a fix like this one, when "30 days" would still be mostly empty.
    // Note: "timestamp" must stay double-quoted whenever it's aliased
    // with AS, and once aliased, ORDER BY must use the alias (e.g.
    // completed_at) rather than the raw name -- confirmed live that
    // ORDER BY timestamp (quoted or not) fails with "unable to find
    // type of column" the moment the SELECT list also aliases it.
    queryFn(`
      SELECT
        blob2 AS puzzle_id,
        blob3 AS mode,
        double1 AS incorrect_moves,
        double2 AS seconds,
        double3 AS used_show_solution,
        double4 AS had_progress_first,
        "timestamp" AS completed_at
      FROM ${ANALYTICS_DATASET}
      WHERE blob1 = 'puzzle_completed'
      ORDER BY completed_at DESC
      LIMIT 20
    `),

    // Traditional vs. Sets, last 30 days.
    queryFn(`
      SELECT blob3 AS mode, count() AS n
      FROM ${ANALYTICS_DATASET}
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
        AND blob1 = 'puzzle_load'
      GROUP BY mode
      ORDER BY n DESC
    `),

    // Player geography, last 30 days -- blob4/5/6 (country/region/city)
    // are set from request.cf, Cloudflare's own edge GeoIP inference,
    // not anything client-supplied. Aggregate counts only.
    queryFn(`
      SELECT blob4 AS country, blob5 AS region, blob6 AS city, count() AS n
      FROM ${ANALYTICS_DATASET}
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
        AND blob1 = 'puzzle_load'
      GROUP BY country, region, city
      ORDER BY n DESC
      LIMIT 30
    `),

    // Most recent weekly link-health cron run.
    queryFn(`
      SELECT double1 AS checked, double2 AS issues_found, "timestamp" AS ran_at
      FROM ${ANALYTICS_DATASET}
      WHERE blob1 = 'link_health_run'
      ORDER BY ran_at DESC
      LIMIT 1
    `),

    // Individual link-health findings, last 30 days.
    queryFn(`
      SELECT blob2 AS title, blob3 AS status, "timestamp" AS found_at
      FROM ${ANALYTICS_DATASET}
      WHERE blob1 = 'link_health_issue'
        AND timestamp >= NOW() - INTERVAL '30' DAY
      ORDER BY found_at DESC
      LIMIT 30
    `)
  ]);

  const difficultyWithPct = (difficulty || []).map(row => {
    const uses = Number(row.show_solution_uses);
    const progressFirst = Number(row.progress_before_uses);
    return {
      ...row,
      pct_tried_before_giving_up: uses > 0 ? Math.round((progressFirst / uses) * 100) : "—"
    };
  });

  return {
    overview, puzzleActivity, recentCompletions, modeSplit, geoDistribution, linkHealthLatest, linkHealthIssues,
    difficulty: difficultyWithPct,
    queryError: errors[0] || null
  };
}

// ---------------------------------------------------------------------
// HTML rendering
// ---------------------------------------------------------------------

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable(rows, columns, labels = columns) {
  if (!rows || rows.length === 0) return '<p class="empty">No data yet.</p>';
  const header = labels.map(l => `<th>${escapeHtml(l)}</th>`).join("");
  const body = rows.map(row => {
    const cells = columns.map(c => `<td>${escapeHtml(row[c])}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderLinkHealthLatest(rows) {
  const row = rows?.[0];
  if (!row) return '<p class="empty">No cron run recorded yet (runs weekly, Monday 06:00 UTC).</p>';
  const issues = Number(row.issues_found);
  const tone = issues > 0 ? "warn-text" : "ok-text";
  return `<p class="stat-line">Last run <strong>${escapeHtml(row.ran_at)}</strong> — checked ${escapeHtml(row.checked)} titles, found
    <span class="${tone}">${issues} issue${issues === 1 ? "" : "s"}</span>.</p>`;
}

function renderDashboard(stats, warningMissing) {
  const warning = warningMissing
    ? `<div class="warn">⚠ ACCOUNT_ID or API_TOKEN is not configured. <code>wrangler secret put API_TOKEN</code> (and confirm ACCOUNT_ID in wrangler.jsonc) to enable queries.</div>`
    : stats?.queryError
    ? `<div class="warn">⚠ Analytics Engine query failed — ${escapeHtml(stats.queryError)}. An HTTP 401/403 usually means API_TOKEN is invalid, expired, or missing "Account Analytics" read permission (re-check the token, re-run <code>wrangler secret put API_TOKEN</code>). Other codes (e.g. 422) mean one of the SQL queries itself is malformed — a code bug in <code>src/admin.js</code>, not a config problem.</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Concept Clusters · Admin</title>
  <style>
    :root { color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font: 15px/1.6 system-ui, sans-serif; background: #14171c; color: #e7e9ee; }
    h1 { margin: 0 0 4px; font-size: 1.5rem; color: #8fb4ff; }
    h2 { margin: 32px 0 10px; font-size: 1.05rem; color: #9cc8d5; text-transform: uppercase; letter-spacing: .1em; }
    .meta { color: #7c8794; font-size: .85rem; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    th { background: #1c212a; color: #9cc8d5; text-align: left; padding: 8px 12px; font-weight: 600; letter-spacing: .06em; font-size: .8rem; text-transform: uppercase; }
    td { padding: 7px 12px; border-bottom: 1px solid #232a35; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #191f28; }
    .section { background: #191e26; border: 1px solid #232c39; border-radius: 10px; padding: 20px; margin-bottom: 20px; overflow-x: auto; }
    .empty { color: #5b6673; margin: 0; font-style: italic; }
    .stat-line { margin: 0; font-size: 1rem; }
    .ok-text { color: #7fd99a; }
    .warn-text { color: #eab86a; }
    .warn { background: #2a220a; border: 1px solid #7a5f10; color: #eab86a; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: .9rem; }
    .logout { display: inline-block; margin-top: 24px; padding: 8px 18px; background: #1c212a; border: 1px solid #2c3644; border-radius: 6px; color: #9cc8d5; text-decoration: none; font-size: .85rem; cursor: pointer; }
    .logout:hover { background: #232c39; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>Concept Clusters · Admin</h1>
  <p class="meta">Last 30 days (recent completions unfiltered) · All times UTC</p>
  ${warning}

  <h2>Event overview</h2>
  <div class="section">
    ${renderTable(stats?.overview, ["event", "n"])}
  </div>

  <h2>Link health</h2>
  <div class="section">
    ${renderLinkHealthLatest(stats?.linkHealthLatest)}
    ${stats?.linkHealthIssues?.length ? renderTable(stats.linkHealthIssues, ["title", "status", "found_at"]) : ""}
  </div>

  <div class="grid">
    <div>
      <h2>Mode split</h2>
      <div class="section">
        ${renderTable(stats?.modeSplit, ["mode", "n"])}
      </div>
    </div>
    <div>
      <h2>Puzzle activity (top 20)</h2>
      <div class="section">
        ${renderTable(stats?.puzzleActivity, ["puzzle_id", "loads", "completions"])}
      </div>
    </div>
  </div>

  <h2>Player geography (top 30)</h2>
  <div class="section">
    ${renderTable(stats?.geoDistribution, ["country", "region", "city", "n"], ["Country", "Region", "City", "Loads"])}
  </div>

  <h2>Difficulty by puzzle</h2>
  <div class="section">
    ${renderTable(
      stats?.difficulty,
      ["puzzle_id", "completions", "avg_incorrect_moves", "avg_seconds", "show_solution_uses", "pct_tried_before_giving_up"],
      ["Puzzle", "Completions", "Avg. wrong guesses", "Avg. seconds", "Show Solution uses", "% tried first, then gave up"]
    )}
  </div>

  <h2>Recent completions</h2>
  <div class="section">
    ${renderTable(
      stats?.recentCompletions,
      ["puzzle_id", "mode", "incorrect_moves", "seconds", "used_show_solution", "had_progress_first", "completed_at"],
      ["Puzzle", "Mode", "Wrong guesses", "Seconds", "Used Show Solution", "Had progress first", "Completed at"]
    )}
  </div>

  <form method="POST" action="/admin/logout" style="display:inline">
    <button class="logout" type="submit">Sign out</button>
  </form>
</body>
</html>`;
}

function renderLoginPage(message = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Concept Clusters · Admin Login</title>
  <style>
    :root { color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; min-height: 100dvh; display: flex; align-items: center; justify-content: center; font: 15px/1.6 system-ui, sans-serif; background: #14171c; color: #e7e9ee; }
    .box { background: #191e26; border: 1px solid #232c39; border-radius: 14px; padding: 36px 40px; width: min(100%, 380px); }
    h1 { margin: 0 0 24px; font-size: 1.25rem; color: #8fb4ff; }
    label { display: block; margin-bottom: 6px; font-size: .85rem; color: #9cc8d5; }
    input { width: 100%; padding: 9px 12px; border-radius: 7px; border: 1px solid #2c3644; background: #14171c; color: #e7e9ee; font-size: .95rem; }
    input:focus { outline: 2px solid #8fb4ff; outline-offset: 1px; }
    button { margin-top: 16px; width: 100%; padding: 10px; border-radius: 7px; background: #8fb4ff; border: none; color: #0e1420; font-weight: 700; font-size: 1rem; cursor: pointer; }
    button:hover { background: #a7c4ff; }
    .err { margin-top: 14px; color: #ea7a74; font-size: .85rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Admin Access</h1>
    <form method="GET" action="/admin">
      <label for="key">Access key</label>
      <input id="key" name="key" type="password" autofocus autocomplete="current-password">
      <button type="submit">Enter</button>
    </form>
    ${message ? `<p class="err">${escapeHtml(message)}</p>` : ""}
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------
// Request handler (imported into worker.js)
// ---------------------------------------------------------------------

export async function handleAdmin(request, env) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/admin/logout") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin", "Set-Cookie": sessionCookieHeader("", 0) }
    });
  }

  const keyParam = url.searchParams.get("key");
  if (keyParam !== null) {
    if (!env.ADMIN_KEY) {
      return new Response("ADMIN_KEY secret is not configured.", { status: 503 });
    }
    const valid = await timingSafeEqual(keyParam, env.ADMIN_KEY);
    if (!valid) {
      return new Response(renderLoginPage("Incorrect access key."), {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin", "Set-Cookie": sessionCookieHeader(env.ADMIN_KEY) }
    });
  }

  if (!(await isAuthenticated(request, env))) {
    return new Response(renderLoginPage(), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
    });
  }

  const warningMissing = !env.ACCOUNT_ID || !env.API_TOKEN;
  const stats = warningMissing ? null : await fetchStats(env);

  return new Response(renderDashboard(stats, warningMissing), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
}
