import {
  emptyContentFreezePlan,
  FREEZE_CONFIRM,
  freezePlanHasMissingDependencies,
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
  .link-health-warn strong { color: #b45309; }
  .link-health-ok strong { color: #15803d; }
  .link-issues > li { margin: 10px 0; }
  .link-issues ul { margin: 2px 0 0 0; }
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 920px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  .meta { color: #666; font-size: 14px; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 10px 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .server-revision { margin: 20px 0; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
  .server-revision h2 { margin: 0 0 4px; font-size: 18px; }
  .server-revision p { margin: 4px 0; }
  .server-revision-stale { border-color: #f59e0b; background: #fffbeb; }
  .server-revision-stale strong { color: #b45309; }
  .freeze, .github-prod { margin: 28px 0; padding: 16px; border: 1px solid #dbeafe; background: #f8fbff; border-radius: 8px; }
  .freeze h2, .github-prod h2 { margin: 0 0 8px; font-size: 18px; }
  .github-prod .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; align-items: center; }
  .github-prod .actions form { margin: 0; }
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

export const GITHUB_REFRESH_CONFIRM = "refresh-github-production";
export const CUE_ALL_PUBLISHED_CONFIRM = "cue-all-published";

export function parseGithubRefreshConfirm(confirm) {
  return confirm === GITHUB_REFRESH_CONFIRM;
}

export function parseCueAllPublishedConfirm(confirm) {
  return confirm === CUE_ALL_PUBLISHED_CONFIRM;
}

export function isAuthoringAdminIndexPath(pathname) {
  return pathname === "/admin" || pathname === "/admin/";
}

export function authoringAdminNav() {
  return `<a href="/admin">Admin</a>
    · <a href="/admin/drafts">Puzzles</a>
    · <a href="/admin/catalogues">Catalogues</a>
    · <a href="/admin/categories">Categories</a>
    · <a href="/admin/link-health">Link health</a>
    · <a href="/admin/model-suggestions">Model suggestions</a>`;
}

// ---- Wikipedia link health (wikiLinkCheck.js loadWikiLinkHealth) ----
// The index carries one line; the detail lives on /admin/link-health so a
// bad week (dozens of titles across many puzzles) never swamps the page
// people open to freeze.

const LINK_STATUS_LABEL = Object.freeze({
  missing: "no article at that title",
  disambiguation: "disambiguation page",
  redirect: "redirects"
});

function wikipediaHref(title) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

function renderLinkHealthSummary(health) {
  if (!health) return "";
  if (!health.checked) {
    return `<h2>Wikipedia links</h2>
    <p class="meta">${health.titles} titles referenced by ${health.puzzles} published puzzles, none checked yet.
    The weekly run (Monday 06:00 UTC), a draft page render, or <code>check_puzzle_links</code> fills this in.</p>`;
  }
  const { counts } = health;
  const problems = counts.missing + counts.disambiguation;
  const tone = problems ? "warn" : "ok";
  const detail = health.issues.length
    ? ` — <a href="/admin/link-health">review ${health.issues.length} title${health.issues.length === 1 ? "" : "s"} across ${health.affectedPuzzles} puzzle${health.affectedPuzzles === 1 ? "" : "s"}</a>`
    : "";
  return `<h2>Wikipedia links</h2>
    <p class="meta link-health link-health-${tone}">${health.checked} of ${health.titles} titles checked across ${health.puzzles} published puzzles,
    latest ${escapeHtml(String(health.latestCheckedAt || "").slice(0, 10))}${health.unchecked ? ` (${health.unchecked} not yet checked)` : ""}:
    <strong>${counts.missing} missing · ${counts.disambiguation} disambiguation</strong> · ${counts.redirect} redirect · ${counts.ok} ok${detail}.</p>`;
}

function renderLinkHealthIssue(issue) {
  const target = issue.status === "redirect" && issue.resolvedTitle
    ? ` → <a href="${wikipediaHref(issue.resolvedTitle)}">${escapeHtml(issue.resolvedTitle)}</a>`
    : "";
  const references = issue.references.map(ref =>
    `<li><a href="/admin/drafts/${encodeURIComponent(ref.puzzleId)}">${escapeHtml(ref.puzzleTitle)}</a>
      <span class="meta">${escapeHtml(ref.where)} · <code>${escapeHtml(ref.link)}</code></span></li>`
  ).join("");
  return `<li class="link-issue">
    <a href="${wikipediaHref(issue.title)}">${escapeHtml(issue.title)}</a>${target}
    <span class="meta">checked ${escapeHtml(String(issue.checkedAt || "").slice(0, 10))}</span>
    <ul>${references}</ul>
  </li>`;
}

export function renderLinkHealthPage(health) {
  const groups = ["missing", "disambiguation", "redirect"].map(status => {
    const issues = (health?.issues || []).filter(issue => issue.status === status);
    if (!issues.length) return "";
    return `<h2>${escapeHtml(LINK_STATUS_LABEL[status])} (${issues.length})</h2>
      <ul class="link-issues">${issues.map(renderLinkHealthIssue).join("")}</ul>`;
  }).join("");
  const body = `<h1>Wikipedia link health</h1>
    <p class="meta">${authoringAdminNav()}</p>
    ${renderLinkHealthSummary(health).replace(/<h2>Wikipedia links<\/h2>/, "")}
    <p class="meta">A missing title or a disambiguation page is a link the player will hit and get nothing useful from;
    fix the title, zoom out to the containing topic, or drop the link. A redirect still works, but the title it lands on is the
    better link. Each puzzle link opens its draft page, where the same findings appear as flags.</p>
    ${groups || "<p class=\"meta\">Every checked link resolves to its own article.</p>"}`;
  return freezeResultShell("Wikipedia link health", body);
}

function shortCommit(commit) {
  return escapeHtml(String(commit || "").slice(0, 7));
}

function commitCount(count) {
  return `${count} commit${count === 1 ? "" : "s"}`;
}

/** Status from authoringServerRevision.js loadServerRevisionStatus; empty when absent. */
export function renderServerRevisionSection(status) {
  if (!status?.running) return "";
  const { running, checkout } = status;
  const problems = [];
  if (status.behindBase > 0) {
    problems.push(running.branch === status.baseRef.replace(/^origin\//, "")
      ? `${commitCount(status.behindBase)} behind <code>${escapeHtml(status.baseRef)}</code>`
      : `missing ${commitCount(status.behindBase)} from <code>${escapeHtml(status.baseRef)}</code>`);
  }
  if (status.behindUpstream > 0) {
    problems.push(`${commitCount(status.behindUpstream)} behind <code>${escapeHtml(status.upstreamRef)}</code>`);
  }
  if (status.checkoutMoved) {
    problems.push(`the checkout has moved to <code>${escapeHtml(checkout.branch || "detached HEAD")}</code>
      @ <code>${shortCommit(checkout.commit)}</code> since this server started`);
  }
  const comparison = status.behindBase == null
    ? `<code>${escapeHtml(status.baseRef)}</code> is not available in this checkout`
    : problems.length
      ? `<strong>${problems.join("; ")}</strong>`
      : `Up to date with <code>${escapeHtml(status.upstreamRef || status.baseRef)}</code>${
        status.upstreamRef ? ` and includes <code>${escapeHtml(status.baseRef)}</code>` : ""}`;
  const fix = problems.length
    ? `<p class="meta">Pages may show stale results (for example false layout markers on Puzzles).
      Redeploy from a workstation: <code>npm run authoring:deploy</code> brings this branch up to date,
      <code>-- --main</code> switches to <code>${escapeHtml(status.baseRef.replace(/^origin\//, ""))}</code>,
      and <code>-- --pr &lt;number&gt;</code> switches to a pull request.</p>`
    : "";
  const fetchNote = status.fetchError
    ? `<p class="meta">Could not fetch origin (${escapeHtml(status.fetchError)}); compared with the last fetched refs.</p>`
    : "";
  return `<section class="server-revision${problems.length ? " server-revision-stale" : ""}">
    <h2>Authoring server</h2>
    <p>Running <code>${escapeHtml(running.branch || "detached HEAD")}</code>
      @ <code>${shortCommit(running.commit)}</code>
      <span class="meta">${escapeHtml(running.subject)}</span></p>
    <p class="meta">${comparison}.</p>
    ${fix}
    ${fetchNote}
  </section>`;
}

function freezePuzzleItem(id, detail) {
  if (!detail) return `<li><code>${escapeHtml(id)}</code></li>`;
  const title = detail.title ? ` — ${escapeHtml(detail.title)}` : "";
  const category = detail.category
    ? escapeHtml(detail.category)
    : "(unassigned)";
  const subcategories = Array.isArray(detail.subcategories) && detail.subcategories.length
    ? detail.subcategories.map(escapeHtml).join("; ")
    : "(none)";
  return `<li><code>${escapeHtml(id)}</code>${title}
    <span class="freeze-puzzle-details">category: ${category} · subcategories: ${subcategories}</span></li>`;
}

function freezeKindList(label, ids = [], { puzzleDetails = null } = {}) {
  if (!ids.length) return "";
  const items = ids.map(id => puzzleDetails
    ? freezePuzzleItem(id, puzzleDetails[id])
    : `<li><code>${escapeHtml(id)}</code></li>`).join("");
  return `<div class="freeze-kind">
    <h3>${escapeHtml(label)}</h3>
    <ul>${items}</ul>
  </div>`;
}

function dependencyList(label, dependencies = []) {
  if (!dependencies.length) return "";
  const items = dependencies.map(dependency => {
    const parents = Array.isArray(dependency.requiredBy)
      ? dependency.requiredBy
      : dependency.requiredBy ? [dependency.requiredBy] : [];
    const requiredBy = parents.length
      ? ` — required by ${parents.map(parent =>
        `${escapeHtml(parent.kind)} <code>${escapeHtml(parent.id)}</code>`
      ).join(", ")}`
      : "";
    return `<li>${escapeHtml(dependency.kind)} <code>${escapeHtml(dependency.id)}</code>${requiredBy}</li>`;
  }).join("");
  return `<div class="freeze-kind">
    <h3>${escapeHtml(label)}</h3>
    <ul>${items}</ul>
  </div>`;
}

export function renderFreezePlanLists(plan = emptyContentFreezePlan()) {
  const puzzleDetails = plan.puzzleDetails || null;
  const kinds = [
    ["Puzzles add", plan.puzzles?.add, puzzleDetails],
    ["Puzzles update", plan.puzzles?.update, puzzleDetails],
    ["Puzzles remove", plan.puzzles?.remove, puzzleDetails],
    ["Catalogues add", plan.catalogues?.add],
    ["Catalogues update", plan.catalogues?.update],
    ["Catalogues remove", plan.catalogues?.remove],
    ["Categories add", plan.categories?.add],
    ["Categories update", plan.categories?.update],
    ["Categories remove", plan.categories?.remove],
    ["Puzzles published, not cued", plan.held?.puzzles, puzzleDetails],
    ["Catalogues published, not cued", plan.held?.catalogues],
    ["Categories published, not cued", plan.held?.categories]
  ];
  return kinds.map(([label, ids, details]) => freezeKindList(label, ids, {
    puzzleDetails: details
  })).join("")
    + dependencyList("Automatically cued supporting documents", plan.dependencies?.automatic)
    + dependencyList("Missing supporting documents — freeze is blocked", plan.dependencies?.missing)
    + freezeKindList(
      "Categories shipping empty — no published puzzle uses them yet (fine; invisible in play until one does)",
      plan.emptyCategories
    );
}

function renderCueAllPublishedButton({
  canCueAllPublished = false,
  heldPuzzleCount = 0
} = {}) {
  if (!canCueAllPublished) return "";
  const disabled = heldPuzzleCount > 0 ? "" : " disabled";
  return `<form method="post" action="/admin">
      <button type="submit" name="confirm" value="${CUE_ALL_PUBLISHED_CONFIRM}"${disabled}>Cue Published</button>
    </form>`;
}

function renderFreezeSection({
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false,
  canCueAllPublished = false
} = {}) {
  const empty = freezePlanIsEmpty(freezePlan);
  const blocked = freezePlanHasMissingDependencies(freezePlan);
  const summary = freezePlanSummary(freezePlan);
  const lists = renderFreezePlanLists(freezePlan) ||
    `<p class="meta">No cued adds, updates, or removals.</p>`;
  const applyHint = canApplyFreeze
    ? "This validates generated git files for every cued snapshot, then creates or updates one GitHub release pull request without leaving this checkout modified."
    : "This plan is what LAN Freeze would validate and submit. The hosted Worker has no git checkout — run <code>npm run dev</code> and freeze there.";
  const heldPuzzleCount = freezePlan.held?.puzzles?.length || 0;
  const cueAllButton = renderCueAllPublishedButton({ canCueAllPublished, heldPuzzleCount });
  let controls;
  if (empty || blocked) {
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>
      <div class="actions">
        <button type="button" disabled>Freeze</button>
        ${cueAllButton}
      </div>`;
  } else if (canApplyFreeze) {
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>
      <div id="freeze-prepare-wrap" class="actions" hidden>
        <button type="button" id="freeze-prepare">Freeze</button>
        ${cueAllButton}
      </div>
      <div id="freeze-confirm">
        <form method="post" action="/admin">
          <label class="meta" for="freeze-additional-context">Additional PR context (optional)</label>
          <textarea id="freeze-additional-context" name="additional_context" rows="4" maxlength="4000"
            placeholder="Why this release matters, review notes, or deployment context."></textarea>
          <div class="actions">
            <button type="submit" name="confirm" value="${FREEZE_CONFIRM}">Confirm</button>
            <button type="button" class="secondary" id="freeze-cancel">Cancel</button>
          </div>
        </form>
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
    controls = `<p class="freeze-count">${escapeHtml(summary)}</p>
      <div class="actions">${cueAllButton}</div>`;
  }
  return `<section class="freeze">
    <h2>Freeze</h2>
    <p class="meta">Cue snapshots on each document, then freeze them into one
    release pull request together. Missing forward dependencies are automatically cued when D1 has
    a published snapshot not yet in git. A category already in git is cued too when a shipping
    puzzle names a subcategory that the published category registers and this checkout does not.
    A missing, withdrawn, or git-only dependency blocks Freeze. Published boards
    remain available to public play without a freeze cue.
    Puzzle entries below show their category and subcategory assignments;
    <code>(none)</code> means the puzzle document has no subcategory assignment.
    ${applyHint} Git-seeded snapshots already in this checkout stay out of
    the count until you Cue them.</p>
    ${lists}
    ${controls}
  </section>`;
}

export function githubProductionSnapshotLabel(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.ids) || !snapshot.ids.length) {
    return "No GitHub snapshot yet. The Puzzles GitHub column stays blank until you fetch origin. Freeze is not required.";
  }
  const idCount = snapshot.ids.length;
  const ref = snapshot.ref || "origin";
  const fetched = snapshot.fetchedAt ? `, fetched ${snapshot.fetchedAt}` : "";
  const projected = snapshot.projectedFromFreeze === true
    ? " Includes the last freeze projection (assumes that freeze merges). Refresh replaces it with origin membership."
    : "";
  const cached = snapshot.fetchedFromCache === true
    ? ` Used already-fetched origin refs (${snapshot.originFetchError || "git fetch could not update them"}).`
    : snapshot.fetchedVia === "github-api"
      ? " Read from the GitHub API."
      : "";
  return `${idCount} id${idCount === 1 ? "" : "s"} from ${ref}${fetched}.${projected}${cached}`;
}

function renderGithubProductionSection({
  githubProduction = null,
  canRefreshGithubProduction = false
} = {}) {
  if (!canRefreshGithubProduction) {
    return `<section class="github-prod">
      <h2>GitHub snapshot</h2>
      <p class="meta">The Puzzles GitHub column on this Worker is origin’s
      <code>puzzles/manifest.js</code>, fetched per isolate. Refresh the
      local snapshot on the LAN authoring checkout
      (<code>npm run dev</code>).</p>
    </section>`;
  }
  const status = githubProductionSnapshotLabel(githubProduction);
  return `<section class="github-prod">
    <h2>GitHub snapshot</h2>
    <p class="meta">The Puzzles GitHub column reads a local snapshot of origin’s
    <code>puzzles/manifest.js</code>. Freeze also refreshes it (joined with the
    freeze patch) when something is cued. Use this when Freeze is locked
    because nothing is cued. Fetch does not write puzzle files.</p>
    <p class="meta">${escapeHtml(status)}</p>
    <div class="actions">
      <form method="post" action="/admin">
        <button type="submit" name="confirm" value="${GITHUB_REFRESH_CONFIRM}">Refresh from GitHub</button>
      </form>
    </div>
  </section>`;
}

/**
 * @param {{
 *   freezePlan?: object,
 *   canApplyFreeze?: boolean,
 *   canCueAllPublished?: boolean,
 *   githubProduction?: object | null,
 *   canRefreshGithubProduction?: boolean,
 *   linkHealth?: Awaited<ReturnType<import("./wikiLinkCheck.js").loadWikiLinkHealth>> | null,
 *   serverRevision?: Awaited<ReturnType<import("./authoringServerRevision.js").loadServerRevisionStatus>>
 * }} [options]
 */
export function renderAdminIndexPage({
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false,
  canCueAllPublished = canApplyFreeze,
  githubProduction = null,
  canRefreshGithubProduction = canApplyFreeze,
  linkHealth = null,
  serverRevision = null
} = {}) {
  const body = `<h1>Admin</h1>
    <p class="meta">Authoring documents in D1. Publish writes the shared live
    row. Freeze validates cued snapshots and creates one release PR.
    ${authoringAdminNav()}</p>
    ${renderServerRevisionSection(serverRevision)}
    ${renderFreezeSection({ freezePlan, canApplyFreeze, canCueAllPublished })}
    ${renderGithubProductionSection({ githubProduction, canRefreshGithubProduction })}
    ${renderLinkHealthSummary(linkHealth)}
    <table>
      <thead><tr><th>Page</th><th>What it is</th></tr></thead>
      <tbody>
        <tr>
          <td><a href="/admin/drafts">Puzzles</a></td>
          <td>Published D1 puzzles plus your working copies, grouped by
          category. Design-copy review, Publish for public play, and Cue for the next
          freeze. LAN Open board is <code>/?puzzle=</code>.</td>
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
          <code>/?puzzle=</code>.</td>
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
      snapshot: ${escapeHtml(result.githubProductionError)}</p>`
    : snapshot?.projectedFromFreeze
      ? `<p class="meta">Projected GitHub snapshot as origin
        <code>${escapeHtml(snapshot.ref || "origin")}</code>
        joined with this freeze
        (${idCount} id${idCount === 1 ? "" : "s"}${
          originCount == null ? "" : `, ${originCount} already on origin`
        }).
        Newly frozen ids show as in the GitHub snapshot until the next freeze.
        That assumes this freeze merges; origin itself updates when it does.
        Public play reads publication in D1 independently of this column.</p>`
      : snapshot
      ? `<p class="meta">Refreshed GitHub snapshot
        (${idCount} id${idCount === 1 ? "" : "s"} from
        <code>${escapeHtml(snapshot.ref || "origin")}</code>).
        Puzzles list uses this until the next freeze.</p>`
      : "";
  const publication = result?.publication;
  const releaseSubmitted = ["opened", "updated", "unchanged"].includes(publication?.outcome);
  const pullRequest = publication?.request?.githubPrUrl
    ? `<p>Release PR: <a href="${escapeHtml(publication.request.githubPrUrl)}">#${escapeHtml(publication.request.githubPrNumber)}</a>
      (${escapeHtml(publication.outcome)}).</p>`
    : "";
  return freezeResultShell("Frozen", `<h1>Frozen</h1>
    <p>Validated cued D1 snapshots and ${releaseSubmitted
      ? "created or updated the release pull request"
      : publication?.outcome === "pending"
        ? "found another Freeze that is still opening the release pull request"
        : "prepared them for release"}. Cues remain in place until that PR merges.</p>
    ${pullRequest}
    ${pathList}
    ${githubNote}
    <p class="meta"><a href="/admin">← Admin</a></p>`);
}

export function renderGithubRefreshResultPage({ result = null, error = null } = {}) {
  if (error) {
    return freezeResultShell("Could not refresh GitHub snapshot",
      `<h1>Could not refresh GitHub snapshot</h1>
      <p class="meta">${escapeHtml(error)}</p>
      <p class="meta"><a href="/admin">← Admin</a>
      · <a href="/admin/drafts">Puzzles</a></p>`);
  }
  const snapshot = result?.githubProduction || result;
  const idCount = Array.isArray(snapshot?.ids) ? snapshot.ids.length : 0;
  const ref = snapshot?.ref || "origin";
  const how = snapshot?.fetchedVia === "github-api"
    ? `Read <code>puzzles/manifest.js</code> from GitHub
      (<code>${escapeHtml(ref)}</code>)`
    : `Read origin <code>${escapeHtml(ref)}</code>`;
  return freezeResultShell("GitHub snapshot",
    `<h1>GitHub snapshot</h1>
    <p>${how}
    (${idCount} id${idCount === 1 ? "" : "s"}). The Puzzles GitHub column
    uses this file until Freeze or another refresh.</p>
    ${snapshot?.fetchedFromCache === true
      ? `<p class="meta">git fetch could not update origin
        (${escapeHtml(snapshot.originFetchError || "permission denied")}).
        This snapshot is the last origin ref this checkout already had.</p>`
      : ""}
    <p class="meta">${escapeHtml(githubProductionSnapshotLabel(snapshot))}</p>
    <p class="meta"><a href="/admin">← Admin</a>
    · <a href="/admin/drafts">Puzzles</a></p>`);
}

async function readUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

export const LINK_HEALTH_PATH = "/admin/link-health";
// Machine-readable twin of the Authoring server section, for
// tools/authoring-status.mjs. Behind the same admin login as /admin.
export const SERVER_REVISION_PATH = "/admin/server-revision.json";
// Server-Sent Events: the same status on connect, then on every change.
export const SERVER_REVISION_EVENTS_PATH = "/admin/server-revision/events";
// Emitted on the http.Server before close() so open event streams end;
// otherwise close() waits on them and a restart hangs until killed.
export const SERVER_SHUTDOWN_EVENT = "concept-clusters:shutdown";
const EVENT_STREAM_HEARTBEAT_MS = 30000;

function streamServerRevision(req, res, { loadServerRevision, subscribeServerRevision }) {
  const server = req.socket?.server;
  // close() stops new connections but still serves requests on open
  // keep-alive ones, so a client reconnecting during shutdown would get a
  // fresh stream from the dying process and hold it open.
  if (server && server.listening === false) {
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8", Connection: "close" });
    res.end("Shutting down");
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
    // Ending a stream ends its connection: a reconnect must open a new one,
    // which reaches whichever process is listening now.
    Connection: "close",
    "X-Accel-Buffering": "no"
  });
  res.flushHeaders?.();
  let lastSent = "";
  const send = status => {
    if (!status || res.writableEnded) return;
    const data = JSON.stringify(status);
    if (data === lastSent) return;
    lastSent = data;
    res.write(`data: ${data}\n\n`);
  };
  const unsubscribe = subscribeServerRevision(send);
  // Comments keep idle proxies from closing the stream and let clients
  // notice a dead connection.
  const heartbeat = setInterval(() => res.write(": ping\n\n"), EVENT_STREAM_HEARTBEAT_MS);
  const end = () => res.end();
  server?.once?.(SERVER_SHUTDOWN_EVENT, end);
  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    server?.off?.(SERVER_SHUTDOWN_EVENT, end);
  });
  Promise.resolve()
    .then(() => loadServerRevision())
    .then(send, () => {});
}

export async function handleAuthoringAdminIndex(req, res, {
  freezePlan = emptyContentFreezePlan(),
  canApplyFreeze = false,
  applyFreeze = null,
  loadFreezePlan = null,
  githubProduction = null,
  loadGithubProduction = null,
  refreshGithubProduction = null,
  cueAllPublished = null,
  loadLinkHealth = null,
  loadServerRevision = null,
  subscribeServerRevision = null
} = {}) {
  const urlPath = (req.url || "").split("?")[0];
  if (urlPath === LINK_HEALTH_PATH) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("Method Not Allowed");
      return true;
    }
    const health = loadLinkHealth ? await loadLinkHealth() : null;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? "" : renderLinkHealthPage(health));
    return true;
  }
  if (urlPath === SERVER_REVISION_EVENTS_PATH && loadServerRevision && subscribeServerRevision) {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET", "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("Method Not Allowed");
      return true;
    }
    streamServerRevision(req, res, { loadServerRevision, subscribeServerRevision });
    return true;
  }
  if (urlPath === SERVER_REVISION_PATH && loadServerRevision) {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET", "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("Method Not Allowed");
      return true;
    }
    let status = null;
    let error = null;
    try {
      status = await loadServerRevision();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }
    res.writeHead(status ? 200 : 503, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(status || { error: error || "This server is not running from a git checkout." }));
    return true;
  }
  if (!isAuthoringAdminIndexPath(urlPath)) return false;
  if (urlPath === "/admin/") {
    res.writeHead(302, {
      Location: "/admin",
      "Cache-Control": "no-store"
    });
    res.end();
    return true;
  }
  const canPost = typeof applyFreeze === "function"
    || typeof refreshGithubProduction === "function"
    || typeof cueAllPublished === "function";
  if (req.method === "POST") {
    if (!canPost) {
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
    const confirm = params.get("confirm");
    if (parseGithubRefreshConfirm(confirm)) {
      if (typeof refreshGithubProduction !== "function") {
        res.writeHead(405, {
          Allow: "GET, HEAD, POST",
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end("Method Not Allowed");
        return true;
      }
      try {
        const snapshot = await refreshGithubProduction();
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(renderGithubRefreshResultPage({
          result: { githubProduction: snapshot }
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.writeHead(500, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(renderGithubRefreshResultPage({ error: message }));
      }
      return true;
    }
    if (parseCueAllPublishedConfirm(confirm)) {
      if (typeof cueAllPublished !== "function") {
        res.writeHead(405, {
          Allow: "GET, HEAD, POST",
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end("Method Not Allowed");
        return true;
      }
      try {
        await cueAllPublished();
        res.writeHead(303, {
          Location: "/admin",
          "Cache-Control": "no-store"
        });
        res.end();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.writeHead(500, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(freezeResultShell("Could not cue published puzzles", `<h1>Could not cue published puzzles</h1>
          <p class="validation validation-fail">${escapeHtml(message)}</p>
          <p class="meta"><a href="/admin">← Admin</a></p>`));
      }
      return true;
    }
    if (!parseFreezeConfirm(confirm)) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Missing freeze confirmation");
      return true;
    }
    if (typeof applyFreeze !== "function") {
      res.writeHead(405, {
        Allow: "GET, HEAD, POST",
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end("Method Not Allowed");
      return true;
    }
    try {
      const result = await applyFreeze({
        additionalContext: params.get("additional_context") || ""
      });
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
      Allow: canPost ? "GET, HEAD, POST" : "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end("Method Not Allowed");
    return true;
  }
  const plan = loadFreezePlan ? await loadFreezePlan() : freezePlan;
  let linkHealth = null;
  if (loadLinkHealth) {
    try {
      linkHealth = await loadLinkHealth();
    } catch {
      linkHealth = null;
    }
  }
  let snapshot = githubProduction;
  if (loadGithubProduction) {
    try {
      snapshot = await loadGithubProduction();
    } catch {
      snapshot = null;
    }
  }
  let serverRevision = null;
  if (loadServerRevision && req.method !== "HEAD") {
    try {
      serverRevision = await loadServerRevision();
    } catch {
      serverRevision = null;
    }
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(req.method === "HEAD" ? "" : renderAdminIndexPage({
    freezePlan: plan,
    canApplyFreeze,
    canCueAllPublished: typeof cueAllPublished === "function",
    githubProduction: snapshot,
    canRefreshGithubProduction: typeof refreshGithubProduction === "function",
    linkHealth,
    serverRevision
  }));
  return true;
}

export default renderAdminIndexPage;
