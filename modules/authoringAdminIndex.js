import {
  emptyContentFreezePlan,
  FREEZE_CONFIRM,
  freezePlanIsEmpty,
  freezePlanSummary,
  parseFreezeConfirm
} from "./contentFreezePlan.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 920px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  .meta { color: #666; font-size: 14px; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 10px 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .freeze { margin: 28px 0; padding: 16px; border: 1px solid #dbeafe; background: #f8fbff; border-radius: 8px; }
  .freeze h2 { margin: 0 0 8px; font-size: 18px; }
  .freeze-kind { margin: 12px 0 0; }
  .freeze-kind h3 { margin: 0 0 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
  .freeze-kind ul { margin: 0; padding-left: 1.2em; }
  .freeze-count { font-weight: 600; margin: 12px 0 8px; }
  .freeze .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; align-items: center; }
  .freeze .actions form { margin: 0; }
  button, .play-button {
    font: inherit; padding: 8px 14px; border-radius: 6px; border: 0;
    background: #2563eb; color: #fff; cursor: pointer;
  }
  button:disabled { background: #94a3b8; cursor: not-allowed; }
  button.secondary { background: #fff; color: #2563eb; border: 1px solid #2563eb; }
`;

export function isAuthoringAdminIndexPath(pathname) {
  return pathname === "/admin" || pathname === "/admin/";
}

export function authoringAdminNav() {
  return `<a href="/admin">Admin</a>
    · <a href="/admin/drafts">Puzzles</a>
    · <a href="/admin/catalogues">Catalogues</a>
    · <a href="/admin/categories">Categories</a>`;
}

function freezeKindList(label, ids = []) {
  if (!ids.length) return "";
  const items = ids.map(id => `<li><code>${escapeHtml(id)}</code></li>`).join("");
  return `<div class="freeze-kind">
    <h3>${escapeHtml(label)}</h3>
    <ul>${items}</ul>
  </div>`;
}

export function renderFreezePlanLists(plan = emptyContentFreezePlan()) {
  const kinds = [
    ["Puzzles add", plan.puzzles?.add],
    ["Puzzles update", plan.puzzles?.update],
    ["Puzzles remove", plan.puzzles?.remove],
    ["Catalogues add", plan.catalogues?.add],
    ["Catalogues update", plan.catalogues?.update],
    ["Catalogues remove", plan.catalogues?.remove],
    ["Categories add", plan.categories?.add],
    ["Categories update", plan.categories?.update],
    ["Categories remove", plan.categories?.remove],
    ["Puzzles published, not cued", plan.held?.puzzles],
    ["Catalogues published, not cued", plan.held?.catalogues],
    ["Categories published, not cued", plan.held?.categories]
  ];
  return kinds.map(([label, ids]) => freezeKindList(label, ids)).join("");
}

function renderFreezeSection({
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false
} = {}) {
  const empty = freezePlanIsEmpty(freezePlan);
  const summary = freezePlanSummary(freezePlan);
  const lists = renderFreezePlanLists(freezePlan) ||
    `<p class="meta">No cued adds, updates, or removals.</p>`;
  const applyHint = canApplyFreeze
    ? "This writes git files in this checkout for every cued snapshot, and deletes withdrawn or git-only files. It does not write GitHub."
    : "This plan is what LAN Freeze would write. The hosted Worker has no git checkout — run <code>npm run dev</code> and freeze there.";
  let controls;
  if (empty) {
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>
      <p><button type="button" disabled>Freeze</button></p>`;
  } else if (canApplyFreeze) {
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>
      <p id="freeze-prepare-wrap" hidden>
        <button type="button" id="freeze-prepare">Freeze</button>
      </p>
      <div id="freeze-confirm">
        <div class="actions">
          <form method="post" action="/admin">
            <button type="submit" name="confirm" value="${FREEZE_CONFIRM}">Confirm</button>
          </form>
          <button type="button" class="secondary" id="freeze-cancel">Cancel</button>
        </div>
      </div>
      <script>
        (function () {
          var prepare = document.getElementById("freeze-prepare");
          var prepareWrap = document.getElementById("freeze-prepare-wrap");
          var confirm = document.getElementById("freeze-confirm");
          var cancel = document.getElementById("freeze-cancel");
          if (!prepare || !prepareWrap || !confirm || !cancel) return;
          prepareWrap.hidden = false;
          confirm.hidden = true;
          prepare.addEventListener("click", function () {
            prepareWrap.hidden = true;
            confirm.hidden = false;
          });
          cancel.addEventListener("click", function () {
            confirm.hidden = true;
            prepareWrap.hidden = false;
          });
        })();
      </script>`;
  } else {
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>`;
  }
  return `<section class="freeze">
    <h2>Freeze</h2>
    <p class="meta">Cue snapshots on each document, then freeze them into git
    together. Held published boards stay in authoring play only.
    ${applyHint} Git-seeded snapshots already in this checkout stay out of
    the count until you Cue them.</p>
    ${lists}
    ${controls}
  </section>`;
}

export function renderAdminIndexPage({
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false
} = {}) {
  const body = `<h1>Admin</h1>
    <p class="meta">Authoring documents in D1. Publish writes the shared live
    row. Freeze writes cued snapshots into this git checkout.
    ${authoringAdminNav()}</p>
    ${renderFreezeSection({ freezePlan, canApplyFreeze })}
    <table>
      <thead><tr><th>Page</th><th>What it is</th></tr></thead>
      <tbody>
        <tr>
          <td><a href="/admin/drafts">Puzzles</a></td>
          <td>Published authoring play plus your working copies, grouped by
          category. Design-copy review, Publish, Cue or Hold for the next
          freeze. LAN Open board is <code>/?draft=</code>.</td>
        </tr>
        <tr>
          <td><a href="/admin/catalogues">Catalogues</a></td>
          <td>Leaf catalogues. Edit as Library cards
          (<code>/?catalogue=&amp;view=author</code>). Meta catalogues
          edit at <code>/admin/catalogues/&lt;id&gt;</code>.</td>
        </tr>
        <tr>
          <td><a href="/admin/categories">Categories</a></td>
          <td>Taxonomy documents: title, domain, blurb. Membership stays
          derived from puzzles.</td>
        </tr>
        <tr>
          <td><a href="/">Play this server</a></td>
          <td>Same Library / catalogue / puzzle navigation as production,
          loaded from published D1 documents. Draft overlay remains
          <code>/?draft=</code>.</td>
        </tr>
      </tbody>
    </table>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

function freezeResultShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

export function renderFreezeResultPage({ result = null, error = null } = {}) {
  if (error) {
    return freezeResultShell("Could not freeze", `<h1>Could not freeze</h1>
      <p class="meta">${escapeHtml(error)}</p>
      <p class="meta"><a href="/admin">← Admin</a></p>`);
  }
  const paths = Array.isArray(result?.affectedPaths) ? result.affectedPaths : [];
  const pathList = paths.length
    ? `<ul>${paths.map(path => `<li><code>${escapeHtml(path)}</code></li>`).join("")}</ul>`
    : "";
  const snapshot = result?.githubProduction;
  const idCount = Array.isArray(snapshot?.ids) ? snapshot.ids.length : 0;
  const originCount = Array.isArray(snapshot?.originIds) ? snapshot.originIds.length : null;
  const githubNote = result?.githubProductionError
    ? `<p class="meta">Wrote the freeze, but could not refresh the GitHub
      production snapshot: ${escapeHtml(result.githubProductionError)}</p>`
    : snapshot?.projectedFromFreeze
      ? `<p class="meta">Projected GitHub production as origin
        <code>${escapeHtml(snapshot.ref || "origin")}</code>
        joined with this freeze
        (${idCount} id${idCount === 1 ? "" : "s"}${
          originCount == null ? "" : `, ${originCount} already on origin`
        }).
        Newly frozen ids show as in GitHub production until the next freeze.
        That assumes this freeze merges; origin itself updates when it does.</p>`
      : snapshot
      ? `<p class="meta">Refreshed GitHub production snapshot
        (${idCount} id${idCount === 1 ? "" : "s"} from
        <code>${escapeHtml(snapshot.ref || "origin")}</code>).
        Puzzles list uses this until the next freeze.</p>`
      : "";
  return freezeResultShell("Frozen", `<h1>Frozen</h1>
    <p>Wrote cued D1 snapshots into this checkout. Commit and push when you
    want that git copy on GitHub. Authoring play is unchanged until the next
    freeze.</p>
    ${pathList}
    ${githubNote}
    <p class="meta"><a href="/admin">← Admin</a></p>`);
}

async function readUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

export async function handleAuthoringAdminIndex(req, res, {
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false,
  applyFreeze = null,
  loadFreezePlan = null
} = {}) {
  const urlPath = (req.url || "").split("?")[0];
  if (!isAuthoringAdminIndexPath(urlPath)) return false;
  if (urlPath === "/admin/") {
    res.writeHead(302, {
      Location: "/admin",
      "Cache-Control": "no-store"
    });
    res.end();
    return true;
  }
  if (req.method === "POST") {
    if (typeof applyFreeze !== "function") {
      res.writeHead(405, {
        Allow: "GET, HEAD",
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end("Method Not Allowed");
      return true;
    }
    let params;
    try {
      params = await readUrlEncoded(req);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Could not read form");
      return true;
    }
    if (!parseFreezeConfirm(params.get("confirm"))) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Missing freeze confirmation");
      return true;
    }
    try {
      const result = await applyFreeze();
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(renderFreezeResultPage({ result }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.writeHead(error.code === "ERR_FREEZE_EMPTY" ? 400 : 500, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(renderFreezeResultPage({ error: message }));
    }
    return true;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      Allow: typeof applyFreeze === "function" ? "GET, HEAD, POST" : "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end("Method Not Allowed");
    return true;
  }
  const plan = loadFreezePlan ? await loadFreezePlan() : freezePlan;
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(req.method === "HEAD" ? "" : renderAdminIndexPage({
    freezePlan: plan,
    canApplyFreeze
  }));
  return true;
}

export default renderAdminIndexPage;
