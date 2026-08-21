// HTML rendering for /admin/drafts -- a human-skimmable view of a draft's
// actual text content (facts, term notes, bridge descriptions, the learning
// introduction), which is where authoring disagreements actually concentrate,
// as opposed to board mechanics the game engine already validates
// structurally. Corrections still flow back through the authoring
// conversation. Opening a GitHub pull request (gameplay review) happens
// from the draft page after that reading pass. Local variant also offers
// checkout install without a PR.
//
// Used by the hosted authoring Worker (D1 drafts) and by the local
// `npm run dev` server (the same D1 drafts stdio MCP uses).
// Pass variant: "local" for checkout-oriented copy; the default "hosted"
// keeps Worker/PR wording so src/authoring-worker.ts needs no change.

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function badge(label, tone = "neutral") {
  if (label === undefined || label === null || label === "") return "";
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}

// Every info-shaped field (puzzle/cluster/bridge/termInfo entries) accepts
// either a plain string or {text?, link?, extraLink?, seeAlso?, citations?}
// -- matches validateInfo() in modules/contentValidation.js.
function renderInfo(info) {
  if (!info) return "";
  if (typeof info === "string") return `<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info)}</p>`;
  const parts = [];
  if (info.text) parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info.text)}</p>`);
  if (info.link) parts.push(`<p class="info-link"><span class="field-label">link:</span> ${escapeHtml(info.link)}</p>`);
  if (info.extraLink) parts.push(`<p class="info-link"><span class="field-label">extra link:</span> ${escapeHtml(info.extraLink)}</p>`);
  if (info.seeAlso) {
    const seeAlso = Array.isArray(info.seeAlso)
      ? info.seeAlso.map(entry => `${escapeHtml(entry.label)}: ${escapeHtml(entry.href)}`).join("; ")
      : escapeHtml(info.seeAlso);
    parts.push(`<p class="info-link"><span class="field-label">see also:</span> ${seeAlso}</p>`);
  }
  if (Array.isArray(info.citations)) {
    const citations = info.citations.map(citation => {
      const bits = [citation.title, citation.author, citation.publisher, citation.year]
        .filter(Boolean).map(escapeHtml).join(", ");
      return `<li>${bits}${citation.url ? ` (${escapeHtml(citation.url)})` : ""}</li>`;
    }).join("");
    parts.push(`<ul class="citations">${citations}</ul>`);
  }
  return parts.join("\n");
}

function renderCluster(cluster) {
  const seeds = new Set(cluster.seeds || []);
  const terms = (cluster.terms && cluster.terms.length ? cluster.terms
    : [...(cluster.seeds || []), ...(cluster.floatingTerms || [])]);
  const termList = terms.map(term => {
    const info = cluster.termInfo?.[term];
    return `<li>
      <span class="term ${seeds.has(term) ? "term-seed" : ""}">${escapeHtml(term)}</span>
      ${seeds.has(term) ? badge("seed", "accent") : ""}
      ${info ? `<div class="term-info">${renderInfo(info)}</div>` : ""}
    </li>`;
  }).join("\n");
  return `<section class="cluster" style="border-left-color: var(--color-${escapeHtml(cluster.color || "neutral")}, #999)">
    <h3>${escapeHtml(cluster.name)} ${badge(cluster.color)}</h3>
    <p class="fact"><span class="field-label">fact:</span> ${escapeHtml(cluster.fact)}</p>
    <ul class="terms">${termList}</ul>
    ${renderInfo(cluster.info)}
  </section>`;
}

function renderBridge(bridge, clusterNameById) {
  const connects = (bridge.clusters || [])
    .map(id => escapeHtml(clusterNameById.get(id) || id))
    .join(" ↔ ");
  const idealTerms = bridge.idealTerms && !Array.isArray(bridge.idealTerms)
    ? Object.entries(bridge.idealTerms).filter(([, term]) => term)
      .map(([clusterId, term]) =>
        `<li>${escapeHtml(clusterNameById.get(clusterId) || clusterId)}: <strong>${escapeHtml(term)}</strong></li>`)
      .join("")
    : "";
  return `<section class="bridge">
    <h3>${escapeHtml(bridge.term)}</h3>
    <p class="connects">connects: ${connects}</p>
    <p class="fact"><span class="field-label">fact:</span> ${escapeHtml(bridge.fact)}</p>
    <p class="badges">
      ${badge(bridge.relationKind, "accent")}
      ${badge(bridge.termRole)}
      ${bridge.conceptId ? badge(`concept: ${bridge.conceptId}`) : ""}
      ${bridge.direction ? badge(`direction: ${bridge.direction.kind}`) : ""}
    </p>
    ${idealTerms ? `<p>ideal terms:</p><ul>${idealTerms}</ul>` : ""}
    ${renderInfo(bridge.info)}
  </section>`;
}

function renderLens(lens) {
  const targets = lens.targets ? `<p>targets: ${lens.targets.map(escapeHtml).join(", ")}</p>` : "";
  const reasons = lens.reasons
    ? `<ul>${Object.entries(lens.reasons).map(([target, reason]) =>
        `<li><strong>${escapeHtml(target)}</strong>: ${escapeHtml(reason)}</li>`).join("")}</ul>`
    : "";
  const options = lens.options
    ? `<ul>${lens.options.map(option =>
        `<li>${option.correct ? "✓ " : ""}${escapeHtml(option.label)}${
          option.targets ? ` (${option.targets.map(escapeHtml).join(", ")})` : ""}</li>`).join("")}</ul>`
    : "";
  return `<section class="lens">
    <h3>${escapeHtml(lens.prompt)}</h3>
    <p class="fact"><span class="field-label">explanation:</span> ${escapeHtml(lens.explanation)}</p>
    ${targets}
    ${reasons}
    ${options}
  </section>`;
}

function renderValidation(validation, variant = "hosted") {
  if (!validation) {
    return variant === "local"
      ? `<p class="validation validation-unknown">Not yet validated.</p>`
      : `<p class="validation validation-unknown">Not yet validated -- call validate_puzzle_draft before treating this as final.</p>`;
  }
  if (validation.valid) {
    return variant === "local"
      ? `<p class="validation validation-ok">✓ Validation passed.</p>`
      : `<p class="validation validation-ok">✓ Last validation passed.</p>`;
  }
  const errors = (validation.errors || []).map(error => `<li>${escapeHtml(error)}</li>`).join("");
  const heading = variant === "local"
    ? "✗ Validation failed:"
    : "✗ Last validation failed:";
  return `<div class="validation validation-fail">
    <p>${heading}</p>
    <ul>${errors}</ul>
  </div>`;
}

// Non-blocking, distinct from renderValidation above: these are prompts to
// double-check (intra-puzzle symmetry, whole-cluster lens recitation),
// never a pass/fail verdict -- see puzzleSymmetryFlags.js. Absent entirely
// when there's nothing to flag, same convention as every other optional
// section on this page.
function renderFlags(flags) {
  if (!Array.isArray(flags) || flags.length === 0) return "";
  const items = flags.map(flag => `<li>${escapeHtml(flag.message)}</li>`).join("");
  return `<div class="validation validation-flags">
    <p>⚑ ${flags.length} authoring flag${flags.length === 1 ? "" : "s"} -- worth a look, not necessarily a problem:</p>
    <ul>${items}</ul>
  </div>`;
}

const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  h1 { margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; background: #eee; margin-right: 4px; }
  .badge-accent { background: #dbeafe; }
  .badge-ok { background: #dcfce7; }
  .badge-warn { background: #fef9c3; }
  .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
  .validation-ok { background: #dcfce7; }
  .validation-fail { background: #fee2e2; }
  .validation-unknown { background: #fef9c3; }
  .validation-flags { background: #fef3c7; }
  .validation-flags ul { margin: 4px 0 0; }
  section.cluster, section.bridge, section.lens { border: 1px solid #e5e5e5; border-left: 4px solid #999; border-radius: 6px; padding: 12px 16px; margin: 14px 0; }
  .fact { color: #333; }
  .field-label { color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
  .terms { list-style: none; padding: 0; }
  .terms li { padding: 4px 0; border-bottom: 1px dashed #eee; }
  .term-seed { font-weight: 600; }
  .term-info { color: #555; font-size: 14px; margin: 2px 0 4px 0; }
  .info-text { color: #444; }
  .info-link { color: #666; font-size: 13px; }
  .connects { font-weight: 600; }
  pre.learning-content { white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; }
  details.raw { margin-top: 32px; }
  details.raw pre { white-space: pre-wrap; font-size: 12px; background: #fafafa; padding: 12px; border-radius: 6px; overflow-x: auto; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  td, th { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
  .submit-pr { border: 1px solid #dbeafe; background: #f8fbff; border-radius: 6px; padding: 12px 16px; margin: 20px 0 28px; }
  .submit-pr h2 { margin: 0 0 8px; font-size: 18px; }
  .submit-pr .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .submit-pr button { font: inherit; padding: 8px 14px; border-radius: 6px; border: 0; background: #2563eb; color: #fff; cursor: pointer; }
  .submit-pr button:disabled { background: #94a3b8; cursor: not-allowed; }
  .submit-pr button.secondary { background: #fff; color: #2563eb; border: 1px solid #2563eb; }
  .submit-pr button.secondary:disabled { background: #f1f5f9; color: #94a3b8; border-color: #cbd5e1; }
  .submit-pr.uninstall { border-color: #fecaca; background: #fff8f8; }
  .submit-pr.uninstall button { background: #fff; color: #b91c1c; border: 1px solid #b91c1c; }
  .submit-pr label { display: block; margin: 10px 0; font-size: 14px; color: #444; }
`;

function pageShell(title, body) {
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

// `inCurrentBundle` is null for a draft that's never been submitted (not
// applicable -- of course it isn't in the bundle). Once a draft has been
// submitted at least once, true/false is a live, always-accurate answer
// to "can list_puzzles/get_puzzle see this puzzle right now" -- but the
// false case deliberately doesn't claim "published" as a fact: the
// underlying pull request could still be open and unmerged, not just
// merged-and-undeployed, and this check can't tell those apart without
// asking GitHub directly (see get_publication_status for that).
function renderBundleStatus(inCurrentBundle, variant = "hosted") {
  if (inCurrentBundle === null || inCurrentBundle === undefined) return "";
  if (variant === "local") {
    return inCurrentBundle
      ? '<span class="badge badge-ok">✓ installed in this checkout</span>'
      : '<span class="badge badge-warn">⚠ not in this checkout</span>';
  }
  return inCurrentBundle
    ? '<span class="badge badge-ok">✓ live in this Worker</span>'
    : '<span class="badge badge-warn">⚠ not yet visible in this Worker</span>';
}

function listIntro(variant) {
  return variant === "local"
    ? `Most recently updated first. These are the same D1 drafts hosted MCP uses.
       Review design copy on a draft's page, then open a GitHub pull request
       or install into this checkout from that page. Uninstall undoes a
       local install that has not been committed. Gameplay review on a PR
       happens on the branch; merging stays in GitHub. Checkout install stays
       in this working tree until you push. The Checkout badge checks the
       canonical puzzle file on disk, not the process that started npm run
       dev.`
    : `Most recently updated first. Review design copy on a draft's page,
       then open a GitHub pull request from that page. Gameplay review
       happens on the PR branch. Hosted authoring has no git checkout and
       this repo does not auto-deploy the player-facing Worker on push.
       "Live" only applies once a draft has been submitted at least once --
       it checks whether this Worker can actually see the puzzle right now,
       live, regardless of what this row's own Status column says (that
       field only updates when something explicitly asks GitHub, so it's
       often stale).`;
}

export function renderDraftListPage(drafts, { variant = "hosted" } = {}) {
  const bundleColumn = variant === "local" ? "Checkout" : "Live";
  const rows = drafts.map(draft => `<tr>
    <td><a href="/admin/drafts/${encodeURIComponent(draft.draftId)}">${escapeHtml(draft.title || draft.draftId)}</a></td>
    <td><code>${escapeHtml(draft.draftId)}</code></td>
    <td>${escapeHtml(draft.status)}</td>
    <td>${renderBundleStatus(draft.inCurrentBundle, variant)}</td>
    <td>${escapeHtml(draft.updatedAt)}</td>
  </tr>`).join("\n");
  const body = drafts.length
    ? `<h1>Your drafts</h1>
       <p class="meta">${listIntro(variant)}</p>
       <table>
         <thead><tr><th>Title</th><th>Draft id</th><th>Status</th><th>${bundleColumn}</th><th>Updated</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : `<h1>Your drafts</h1><p>No drafts yet.</p>`;
  return pageShell("Drafts", body);
}

function renderSubmitForm(draft, variant = "hosted") {
  const draftId = draft.draftId;
  const valid = draft.validation?.valid === true;
  const submitted = draft.status && draft.status !== "draft";
  const label = submitted ? "Update pull request" : "Open pull request";
  const disabled = valid ? "" : " disabled";
  const heading = submitted ? "Update the pull request" : "Open a pull request";
  const hint = variant === "local"
    ? (valid
      ? `This page is for design copy. Open a pull request for gameplay
         review on GitHub — that does not write main. Install in this
         checkout writes the working tree so you can play it here without
         a PR; it stays local until you push. Uninstall appears when this
         puzzle’s checkout files differ from git HEAD. Catalogue membership
         still uses the MCP submit tool.`
      : `Fix validation errors (through the authoring conversation) before
         installing or opening a pull request.`)
    : (valid
      ? `This page is for design copy. The pull request is for gameplay
         review: play the branch, then merge in GitHub. Opening a PR does
         not write main. Hosted authoring has no git checkout and this
         repo does not auto-deploy the player-facing Worker on push, so
         there is no install-to-production button here. Catalogue
         membership still uses the MCP submit tool.`
      : `Fix validation errors (through the authoring conversation) before
         opening a pull request.`);
  const installButton = variant === "local"
    ? `<button type="submit" name="confirm" value="install-checkout" class="secondary"${disabled}>Install in this checkout</button>`
    : "";
  const uninstall = variant === "local" && draft.canUninstall
    ? `<section class="submit-pr uninstall">
    <h2>Uninstall from this checkout</h2>
    <p class="meta">Removes this puzzle’s local files, or restores the last
       committed versions if this install replaced a published puzzle.
       Does not close a pull request or write GitHub. Committed puzzles
       that match HEAD cannot be uninstalled from this page.</p>
    <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
      <div class="actions">
        <button type="submit" name="confirm" value="uninstall-checkout">Uninstall from this checkout</button>
      </div>
    </form>
  </section>`
    : "";
  return `<section class="submit-pr">
    <h2>${heading}</h2>
    <p class="meta">${hint}</p>
    <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
      <label>
        <input type="checkbox" name="replace" value="1">
        Replace the published puzzle with this id
      </label>
      <div class="actions">
        <button type="submit" name="confirm" value="open-pull-request"${disabled}>${label}</button>
        ${installButton}
      </div>
    </form>
  </section>
  ${uninstall}`;
}

export function renderDraftPage(draft, { variant = "hosted" } = {}) {
  const document = draft.document || {};
  const clusters = document.clusters || [];
  const bridges = document.bridges || [];
  const clusterNameById = new Map(clusters.map(cluster => [cluster.id, cluster.name]));
  const intro = document.learningIntroduction;

  const body = `
    <p class="meta"><a href="/admin/drafts">← all drafts</a></p>
    <h1>${escapeHtml(document.title || draft.title || draft.draftId)}</h1>
    <p class="meta">
      <code>${escapeHtml(draft.draftId)}</code>
      ${badge(draft.status)}
      ${renderBundleStatus(draft.inCurrentBundle, variant)}
      updated ${escapeHtml(draft.updatedAt)}
    </p>
    ${renderValidation(draft.validation, variant)}
    ${renderFlags(draft.validation?.flags)}
    ${renderSubmitForm(draft, variant)}
    <p class="meta">
      ${badge(document.category, "accent")}
      ${(document.categories || []).filter(name => name !== document.category).map(name => badge(name)).join("")}
      ${(document.tags || []).map(tag => badge(tag)).join("")}
      ${document.large ? badge("large") : ""}
    </p>
    ${renderInfo(document.info)}

    <h2>Clusters (${clusters.length})</h2>
    ${clusters.map(renderCluster).join("\n") || "<p>None yet.</p>"}

    <h2>Bridges (${bridges.length})</h2>
    ${bridges.map(bridge => renderBridge(bridge, clusterNameById)).join("\n") || "<p>None yet.</p>"}

    ${document.lenses?.length ? `<h2>Lenses (${document.lensMode || "sequential"})</h2>
      ${document.lenses.map(renderLens).join("\n")}` : ""}

    ${document.relatedPuzzles?.entries?.length ? `<h2>Related puzzles</h2>
      ${renderInfo(document.relatedPuzzles.info)}
      <ul>${document.relatedPuzzles.entries.map(entry =>
        `<li><strong>${escapeHtml(entry.id)}</strong>: ${escapeHtml(entry.reason)}${
          entry.via ? ` <span class="meta">(via ${entry.via.map(escapeHtml).join(", ")})</span>` : ""}</li>`
      ).join("")}</ul>` : ""}

    ${intro ? `<h2>Learning introduction</h2>
      <p class="meta">
        ${badge(intro.requirement, "accent")}
        ${intro.estimatedMinutes ? badge(`${intro.estimatedMinutes} min`) : ""}
      </p>
      ${intro.title ? `<h3>${escapeHtml(intro.title)}</h3>` : ""}
      ${intro.summary ? `<p class="fact"><span class="field-label">summary:</span> ${escapeHtml(intro.summary)}</p>` : ""}
      <pre class="learning-content">${escapeHtml(intro.content?.text || "")}</pre>
      ${intro.sources?.length ? `<p>Sources: ${intro.sources.map(source =>
        `<a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>`).join(", ")}</p>` : ""}
    ` : ""}

    <details class="raw">
      <summary>Raw document JSON</summary>
      <pre>${escapeHtml(JSON.stringify(document, null, 2))}</pre>
    </details>
  `;
  return pageShell(document.title || draft.draftId, body);
}
