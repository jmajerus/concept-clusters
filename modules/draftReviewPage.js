// HTML rendering for /admin/drafts -- a human-skimmable view of a draft's
// actual text content (facts, term notes, bridge descriptions, the learning
// introduction), which is where authoring disagreements actually concentrate,
// as opposed to board mechanics the game engine already validates
// structurally. Copy fields can be edited in place (or restored to the
// published wording). Structural changes still go through the authoring
// conversation. Opening a GitHub pull request (gameplay review) happens
// from the draft page after that reading pass. Local variant also offers
// checkout install without a PR.
//
// Used by the hosted authoring Worker (D1 drafts) and by the local
// `npm run dev` server (the same D1 drafts stdio MCP uses).
// Pass variant: "local" for checkout-oriented copy; the default "hosted"
// keeps Worker/PR wording so src/authoring-worker.ts needs no change.

import { COPY_FIELD_ELEMENT_SCRIPT } from "./copyFieldElement.js";
import { REVERT_FIELD_CONFIRM, SAVE_FIELD_CONFIRM } from "./draftReviewEdit.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function formatWas(value) {
  if (value == null || value === "") return "(empty)";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    if ("text" in value || "link" in value) {
      return [value.text, value.link].filter(Boolean).join(" · ") || "(empty)";
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function renderWas(change) {
  if (!change) return "";
  return `<p class="diff-was">was: ${escapeHtml(formatWas(change.before))}</p>`;
}

function infoText(info) {
  if (info == null) return "";
  return typeof info === "string" ? info : (info.text || "");
}

function infoLink(info) {
  if (!info || typeof info === "string") return "";
  return info.link || "";
}

function renderCopyField({
  edit,
  section,
  id = "",
  term = "",
  field,
  value = "",
  change = null,
  multiline = true,
  label = "copy"
}) {
  if (!edit?.draftId) return "";
  const action = `/admin/drafts/${encodeURIComponent(edit.draftId)}`;
  const hidden = `
    <input type="hidden" name="expected_revision" value="${escapeHtml(String(edit.revision ?? ""))}">
    <input type="hidden" name="section" value="${escapeHtml(section)}">
    <input type="hidden" name="id" value="${escapeHtml(id)}">
    <input type="hidden" name="term" value="${escapeHtml(term)}">
    <input type="hidden" name="field" value="${escapeHtml(field)}">
  `;
  const control = multiline
    ? `<textarea name="value" rows="4">${escapeHtml(value ?? "")}</textarea>`
    : `<input type="text" name="value" value="${escapeHtml(value ?? "")}">`;
  const revert = change && Object.prototype.hasOwnProperty.call(change, "before")
    ? `<form method="post" action="${action}" class="copy-field-revert">
         <input type="hidden" name="confirm" value="${REVERT_FIELD_CONFIRM}">
         ${hidden}
         <button type="submit">Use published wording</button>
       </form>`
    : "";
  const summary = (typeof value === "string" && value.trim()) || change
    ? `Edit ${label}`
    : `Add ${label}`;
  return `<copy-field>
    <details>
      <summary>${escapeHtml(summary)}</summary>
      <form method="post" action="${action}">
        <input type="hidden" name="confirm" value="${SAVE_FIELD_CONFIRM}">
        ${hidden}
        ${control}
        <button type="submit">Save</button>
      </form>
    </details>
    ${revert}
  </copy-field>`;
}

function itemKey(item, ...fields) {
  for (const field of fields) {
    const value = item?.[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function collectionMark(collection, item, ...fields) {
  if (!collection) return { kind: "", mark: null };
  const key = itemKey(item, ...fields);
  if (collection.added?.includes(key)) return { kind: "added", mark: null };
  const mark = collection.changed?.[key] || null;
  return { kind: mark ? "changed" : "", mark };
}

function badge(label, tone = "neutral") {
  if (label === undefined || label === null || label === "") return "";
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}

function emptyValue() {
  return `<span class="empty">(none)</span>`;
}

function labeledLine(label, inner) {
  return `<p class="info-link"><span class="field-label">${escapeHtml(label)}:</span> ${inner}</p>`;
}

function renderCitationList(citations) {
  if (!Array.isArray(citations) || citations.length === 0) return "";
  const items = citations.map(citation => {
    const bits = [citation.title, citation.author, citation.publisher, citation.year]
      .filter(Boolean).map(escapeHtml).join(", ");
    return `<li>${bits}${citation.url ? ` (${escapeHtml(citation.url)})` : ""}</li>`;
  }).join("");
  return `<p class="field-label">citations:</p><ul class="citations">${items}</ul>`;
}

function renderSeeAlso(seeAlso) {
  if (!seeAlso) return "";
  if (Array.isArray(seeAlso)) {
    return seeAlso.map(entry => `${escapeHtml(entry.label)}: ${escapeHtml(entry.href)}`).join("; ");
  }
  return escapeHtml(seeAlso);
}

function renderReferences(info, { always = false } = {}) {
  const object = info && typeof info === "object" && !Array.isArray(info) ? info : {};
  const parts = [];
  if (object.extraLink) parts.push(labeledLine("extra link", escapeHtml(object.extraLink)));
  else if (always) parts.push(labeledLine("extra link", emptyValue()));
  const seeAlso = renderSeeAlso(object.seeAlso);
  if (seeAlso) parts.push(labeledLine("see also", seeAlso));
  else if (always) parts.push(labeledLine("see also", emptyValue()));
  const citations = renderCitationList(object.citations);
  if (citations) parts.push(citations);
  else if (always) parts.push(labeledLine("citations", emptyValue()));
  return parts.join("\n");
}

// Every info-shaped field (puzzle/cluster/bridge/termInfo entries) accepts
// either a plain string or {text?, link?, extraLink?, seeAlso?, citations?}
// -- matches validateInfo() in modules/contentValidation.js.
// Puzzle-level review always shows extra link / see also / citations so a
// human can see the whole agent-editable record, even when those slots are
// empty. Cluster/term/bridge info still omits empty optional slots.
function renderInfo(info, { alwaysShowReferences = false } = {}) {
  const parts = [];
  if (typeof info === "string") {
    parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info)}</p>`);
  } else if (info && typeof info === "object") {
    if (info.text) parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info.text)}</p>`);
    if (info.link) parts.push(`<p class="info-link"><span class="field-label">link:</span> ${escapeHtml(info.link)}</p>`);
  }
  parts.push(renderReferences(info, { always: alwaysShowReferences }));
  return parts.filter(Boolean).join("\n");
}

function renderCluster(cluster, collection, edit) {
  const { kind, mark } = collectionMark(collection, cluster, "id", "name");
  const clusterId = cluster.id || cluster.name || "";
  const seeds = new Set(cluster.seeds || []);
  const terms = (cluster.terms && cluster.terms.length ? cluster.terms
    : [...(cluster.seeds || []), ...(cluster.floatingTerms || [])]);
  const addedTerms = new Set(mark?.terms?.added || []);
  const seedChanged = new Set(mark?.terms?.seedChanged || []);
  const termList = terms.map(term => {
    const info = cluster.termInfo?.[term];
    const infoChange = mark?.terms?.info?.[term];
    const termClass = [
      "term",
      seeds.has(term) ? "term-seed" : "",
      addedTerms.has(term) ? "diff-term-added" : ""
    ].filter(Boolean).join(" ");
    return `<li>
      <span class="${termClass}">${escapeHtml(term)}</span>
      ${seeds.has(term) ? badge("seed", "accent") : ""}
      ${addedTerms.has(term) ? badge("added", "ok") : ""}
      ${seedChanged.has(term) ? badge(seeds.has(term) ? "now a seed" : "no longer a seed", "warn") : ""}
      ${info ? `<div class="term-info">${renderInfo(info)}</div>` : ""}
      ${renderWas(infoChange)}
      ${renderCopyField({
        edit, section: "term", id: clusterId, term, field: "info.text",
        value: infoText(info), change: infoChange, label: "term note"
      })}
      ${renderCopyField({
        edit, section: "term", id: clusterId, term, field: "info.link",
        value: infoLink(info), change: infoChange, multiline: false, label: "term link"
      })}
    </li>`;
  }).join("\n");
  const removedTerms = (mark?.terms?.removed || []).map(term =>
    `<li><span class="term diff-term-removed">${escapeHtml(term)}</span> ${badge("removed", "warn")}</li>`
  ).join("\n");
  return `<section class="cluster${kind ? ` diff-${kind}` : ""}" style="border-left-color: var(--color-${escapeHtml(cluster.color || "neutral")}, #999)">
    <h3>${escapeHtml(cluster.name)} ${badge(cluster.color)}${kind ? badge(kind, kind === "added" ? "ok" : "warn") : ""}</h3>
    ${renderCopyField({
      edit, section: "cluster", id: clusterId, field: "name",
      value: cluster.name, change: mark?.fields?.name, multiline: false, label: "cluster name"
    })}
    <p class="fact"><span class="field-label">fact:</span> ${escapeHtml(cluster.fact)}</p>
    ${renderWas(mark?.fields?.fact)}
    ${renderCopyField({
      edit, section: "cluster", id: clusterId, field: "fact",
      value: cluster.fact, change: mark?.fields?.fact, label: "fact"
    })}
    ${renderInfo(cluster.info)}
    ${renderWas(mark?.fields?.info)}
    ${renderCopyField({
      edit, section: "cluster", id: clusterId, field: "info.text",
      value: infoText(cluster.info), change: mark?.fields?.info, label: "cluster info"
    })}
    ${renderCopyField({
      edit, section: "cluster", id: clusterId, field: "info.link",
      value: infoLink(cluster.info), change: mark?.fields?.info, multiline: false, label: "cluster link"
    })}
    <ul class="terms">${termList}${removedTerms}</ul>
  </section>`;
}

function renderRemoved(kind, title, detail) {
  return `<section class="${kind} diff-removed">
    <h3>${escapeHtml(title)} ${badge("removed", "warn")}</h3>
    ${detail ? `<p class="diff-was">${escapeHtml(detail)}</p>` : ""}
  </section>`;
}

function renderBridge(bridge, clusterNameById, collection, edit) {
  const { kind, mark } = collectionMark(collection, bridge, "id", "term");
  const bridgeId = bridge.id || bridge.term || "";
  const connects = (bridge.clusters || [])
    .map(id => escapeHtml(clusterNameById.get(id) || id))
    .join(" ↔ ");
  const idealTerms = bridge.idealTerms && !Array.isArray(bridge.idealTerms)
    ? Object.entries(bridge.idealTerms).filter(([, term]) => term)
      .map(([clusterId, term]) =>
        `<li>${escapeHtml(clusterNameById.get(clusterId) || clusterId)}: <strong>${escapeHtml(term)}</strong></li>`)
      .join("")
    : "";
  return `<section class="bridge${kind ? ` diff-${kind}` : ""}">
    <h3>${escapeHtml(bridge.term)}${kind ? ` ${badge(kind, kind === "added" ? "ok" : "warn")}` : ""}</h3>
    ${renderCopyField({
      edit, section: "bridge", id: bridgeId, field: "term",
      value: bridge.term, change: mark?.fields?.term, multiline: false, label: "bridge term"
    })}
    <p class="connects">connects: ${connects}</p>
    ${renderWas(mark?.fields?.clusters)}
    <p class="fact"><span class="field-label">fact:</span> ${escapeHtml(bridge.fact)}</p>
    ${renderWas(mark?.fields?.fact)}
    ${renderCopyField({
      edit, section: "bridge", id: bridgeId, field: "fact",
      value: bridge.fact, change: mark?.fields?.fact, label: "fact"
    })}
    <p class="badges">
      ${badge(bridge.relationKind, "accent")}
      ${badge(bridge.termRole)}
      ${bridge.conceptId ? badge(`concept: ${bridge.conceptId}`) : ""}
      ${bridge.direction ? badge(`direction: ${bridge.direction.kind}`) : ""}
    </p>
    ${renderWas(mark?.fields?.relationKind)}
    ${renderWas(mark?.fields?.termRole)}
    ${renderWas(mark?.fields?.direction)}
    ${renderWas(mark?.fields?.idealTerms)}
    ${idealTerms ? `<p>ideal terms:</p><ul>${idealTerms}</ul>` : ""}
    ${renderInfo(bridge.info)}
    ${renderWas(mark?.fields?.info)}
    ${renderCopyField({
      edit, section: "bridge", id: bridgeId, field: "info.text",
      value: infoText(bridge.info), change: mark?.fields?.info, label: "bridge info"
    })}
    ${renderCopyField({
      edit, section: "bridge", id: bridgeId, field: "info.link",
      value: infoLink(bridge.info), change: mark?.fields?.info, multiline: false, label: "bridge link"
    })}
  </section>`;
}

function renderLens(lens, collection, edit) {
  const { kind, mark } = collectionMark(collection, lens, "id", "prompt");
  const lensId = lens.id || lens.prompt || "";
  const targets = lens.targets ? `<p>targets: ${lens.targets.map(escapeHtml).join(", ")}</p>` : "";
  const reasons = lens.reasons
    ? `<ul>${Object.entries(lens.reasons).map(([target, reason]) =>
        `<li><strong>${escapeHtml(target)}</strong>: ${escapeHtml(reason)}</li>
         ${renderCopyField({
           edit, section: "lens", id: lensId, term: target, field: "reason",
           value: reason, change: mark?.fields?.reasons, label: "reason"
         })}`).join("")}</ul>`
    : "";
  const options = lens.options
    ? `<ul>${lens.options.map(option =>
        `<li>${option.correct ? "✓ " : ""}${escapeHtml(option.label)}${
          option.targets ? ` (${option.targets.map(escapeHtml).join(", ")})` : ""}</li>`).join("")}</ul>`
    : "";
  return `<section class="lens${kind ? ` diff-${kind}` : ""}">
    <h3>${escapeHtml(lens.prompt)}${kind ? ` ${badge(kind, kind === "added" ? "ok" : "warn")}` : ""}</h3>
    ${renderWas(mark?.fields?.prompt)}
    ${renderCopyField({
      edit, section: "lens", id: lensId, field: "prompt",
      value: lens.prompt, change: mark?.fields?.prompt, label: "prompt"
    })}
    <p class="fact"><span class="field-label">explanation:</span> ${escapeHtml(lens.explanation)}</p>
    ${renderWas(mark?.fields?.explanation)}
    ${renderCopyField({
      edit, section: "lens", id: lensId, field: "explanation",
      value: lens.explanation, change: mark?.fields?.explanation, label: "explanation"
    })}
    ${targets}
    ${renderWas(mark?.fields?.targets)}
    ${reasons}
    ${renderWas(mark?.fields?.reasons)}
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
  .empty { color: #999; font-style: italic; }
  .citations { margin: 4px 0 12px 1.2em; }
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
  .diff-summary { padding: 10px 14px; border-radius: 6px; margin: 16px 0 20px; background: #fffbeb; border: 1px solid #fde68a; }
  .diff-summary-none { background: #f8fafc; border-color: #e2e8f0; }
  .diff-summary .meta { margin: 4px 0 0; }
  .diff-changed { background: #fffbeb; }
  .diff-added { background: #f0fdf4; }
  .diff-removed { background: #fef2f2; }
  .diff-was { color: #9a3412; font-size: 13px; margin: 0 0 8px; }
  .diff-term-added { background: #dcfce7; border-radius: 4px; padding: 0 4px; }
  .diff-term-removed { text-decoration: line-through; color: #b91c1c; }
  copy-field { display: block; margin: 4px 0 10px; }
  copy-field details { font-size: 13px; }
  copy-field summary { cursor: pointer; color: #2563eb; width: fit-content; }
  copy-field textarea, copy-field input[type="text"] {
    display: block; width: 100%; box-sizing: border-box; font: inherit;
    padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 8px 0 0;
  }
  copy-field button { font: inherit; padding: 6px 12px; margin: 8px 8px 0 0; border-radius: 4px; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; }
  copy-field form.copy-field-revert { display: inline; }
  copy-field form.copy-field-revert button { background: #fff; color: #9a3412; border-color: #9a3412; }
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
<body>${body}
<script>${COPY_FIELD_ELEMENT_SCRIPT}</script>
</body>
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
      ? '<span class="badge badge-ok">✓ this draft is in this checkout</span>'
      : '<span class="badge badge-warn">⚠ this draft is not in this checkout</span>';
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
       in this working tree until you push. Status here follows this draft
       revision: installed (uncommitted), committed (at HEAD, unpushed), or
       published (at HEAD and not ahead of upstream). A pull-request status
       still wins when one exists. The Checkout badge means this revision is
       the canonical file on disk, not merely that the puzzle id already
       exists.`
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

function alreadyPublished(draft) {
  return draft.alreadyPublished === true || draft.inCurrentBundle === true;
}

function submitHint(variant, { valid, submitted, published }) {
  if (!valid) {
    return variant === "local"
      ? `Fix validation errors on this page or through the authoring
         conversation before installing or opening a pull request.`
      : `Fix validation errors on this page or through the authoring
         conversation before opening a pull request.`;
  }
  const githubNote = submitted
    ? (published
      ? `This id is already published. Updating the pull request amends that
         branch; it does not write main.`
      : `Updating the pull request appends a commit for gameplay review on
         GitHub; it does not write main.`)
    : (published
      ? `This id is already published. Open a pull request to update those
         files for gameplay review on GitHub; it does not write main.`
      : `Open a pull request for gameplay review on GitHub — that does not
         write main.`);
  if (variant === "local") {
    const installNote = published
      ? `Install in this checkout overwrites the working-tree files so you
         can play it here without a PR; it stays local until you push.`
      : `Install in this checkout writes the working tree so you can play it
         here without a PR; it stays local until you push.`;
    return `This page is for design copy. You can edit any field here, or
       restore published wording on a marked change. ${githubNote} ${installNote}
       Uninstall appears when this puzzle’s checkout files differ from git
       HEAD. Catalogue membership still uses the MCP submit tool.`;
  }
  return `This page is for design copy. You can edit any field here, or
     restore published wording on a marked change. ${githubNote} Hosted
     authoring has no git checkout and this repo does not auto-deploy the
     player-facing Worker on push, so there is no install-to-production
     button here. Catalogue membership still uses the MCP submit tool.`;
}

function pullRequestOpened(draft) {
  const ledger = draft.publicationStatus
    || (draft.status === "submitted" || draft.status === "review"
      || draft.status === "published" || draft.status === "archived"
      ? draft.status
      : "draft");
  return ledger === "submitted" || ledger === "review"
    || ledger === "published" || ledger === "archived";
}

function renderSubmitForm(draft, variant = "hosted") {
  const draftId = draft.draftId;
  const valid = draft.validation?.valid === true;
  const submitted = pullRequestOpened(draft);
  const published = alreadyPublished(draft);
  const label = submitted ? "Update pull request" : "Open pull request";
  const disabled = valid ? "" : " disabled";
  const heading = submitted ? "Update the pull request" : "Open a pull request";
  const hint = submitHint(variant, { valid, submitted, published });
  const replaceField = published
    ? `<input type="hidden" name="replace" value="1">`
    : "";
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
      ${replaceField}
      <div class="actions">
        <button type="submit" name="confirm" value="open-pull-request"${disabled}>${label}</button>
        ${installButton}
      </div>
    </form>
  </section>
  ${uninstall}`;
}

function renderPuzzleMeta(document) {
  const parts = [];
  if (document.preSolve) parts.push(badge("pre-solve", "accent"));
  if (document.lensMode) parts.push(badge(`lens: ${document.lensMode}`));
  const subcategories = document.subcategories && typeof document.subcategories === "object"
    ? Object.entries(document.subcategories).map(([category, id]) => `${category}: ${id}`).join("; ")
    : "";
  if (subcategories) parts.push(labeledLine("subcategories", escapeHtml(subcategories)));
  const provenance = [
    ["creator", document.creator],
    ["license", document.license],
    ["derived from", document.derivedFrom],
    ["created", document.dateCreated],
    ["modified", document.dateModified],
    ["language", document.language],
    ["version", document.version]
  ].filter(([, value]) => typeof value === "string" && value.trim());
  for (const [label, value] of provenance) {
    parts.push(labeledLine(label, escapeHtml(value)));
  }
  if (Array.isArray(document.generativeAssistance) && document.generativeAssistance.length) {
    const items = document.generativeAssistance.map(entry => {
      const bits = [entry.system, entry.model, entry.date].filter(Boolean).map(escapeHtml).join(", ");
      return `<li>${bits || escapeHtml(JSON.stringify(entry))}</li>`;
    }).join("");
    parts.push(`<p class="field-label">generative assistance:</p><ul>${items}</ul>`);
  }
  return parts.join("\n");
}

function renderLearningReferences(intro) {
  const sources = Array.isArray(intro.sources) && intro.sources.length
    ? intro.sources.map(source =>
        `<a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>`).join(", ")
    : "";
  const parts = [
    labeledLine("sources", sources || emptyValue())
  ];
  const citations = renderCitationList(intro.citations);
  parts.push(citations || labeledLine("citations", emptyValue()));
  return parts.join("\n");
}

function renderDiffSummary(diff) {
  if (!diff) return "";
  if (!diff.total) {
    return `<aside class="diff-summary diff-summary-none">No changes from the published puzzle.</aside>`;
  }
  const bits = [];
  if (diff.counts.changed) bits.push(`${diff.counts.changed} changed`);
  if (diff.counts.added) bits.push(`${diff.counts.added} added`);
  if (diff.counts.removed) bits.push(`${diff.counts.removed} removed`);
  return `<aside class="diff-summary">
    <strong>${diff.total} change${diff.total === 1 ? "" : "s"} from the published puzzle</strong>
    <span class="meta">${escapeHtml(bits.join(" · "))}</span>
    <p class="meta">Amber is an edit, green is new, struck red was removed. “was:” is the published text. Copy can be edited here. Structure, citations, and other agent-authored fields are shown for review; restore published wording on a marked change.</p>
  </aside>`;
}

export function renderDraftPage(draft, { variant = "hosted" } = {}) {
  const document = draft.document || {};
  const clusters = document.clusters || [];
  const bridges = document.bridges || [];
  const clusterNameById = new Map(clusters.map(cluster => [cluster.id, cluster.name]));
  const intro = document.learningIntroduction;
  const diff = draft.publishedDiff || null;
  const titleChange = diff?.fields?.title;
  const edit = { draftId: draft.draftId, revision: draft.revision };

  const body = `
    <p class="meta"><a href="/admin/drafts">← all drafts</a></p>
    <h1>${escapeHtml(document.title || draft.title || draft.draftId)}</h1>
    ${renderWas(titleChange)}
    ${renderCopyField({
      edit, section: "puzzle", field: "title",
      value: document.title || "", change: titleChange, multiline: false, label: "title"
    })}
    <p class="meta">
      <code>${escapeHtml(draft.draftId)}</code>
      ${badge(draft.status)}
      ${renderBundleStatus(draft.inCurrentBundle, variant)}
      updated ${escapeHtml(draft.updatedAt)}
    </p>
    ${renderDiffSummary(diff)}
    ${renderValidation(draft.validation, variant)}
    ${renderFlags(draft.validation?.flags)}
    ${renderSubmitForm(draft, variant)}
    <p class="meta">
      ${badge(document.category, "accent")}
      ${(document.categories || []).filter(name => name !== document.category).map(name => badge(name)).join("")}
      ${(document.tags || []).map(tag => badge(tag)).join("")}
      ${document.large ? badge("large") : ""}
    </p>
    ${renderWas(diff?.fields?.category)}
    ${renderWas(diff?.fields?.tags)}
    ${renderWas(diff?.fields?.large)}
    ${renderPuzzleMeta(document)}
    ${renderInfo(document.info, { alwaysShowReferences: true })}
    ${renderWas(diff?.fields?.info)}
    ${renderCopyField({
      edit, section: "puzzle", field: "info.text",
      value: infoText(document.info), change: diff?.fields?.info, label: "puzzle info"
    })}
    ${renderCopyField({
      edit, section: "puzzle", field: "info.link",
      value: infoLink(document.info), change: diff?.fields?.info, multiline: false, label: "puzzle link"
    })}

    <h2>Clusters (${clusters.length})</h2>
    ${clusters.map(cluster => renderCluster(cluster, diff?.clusters, edit)).join("\n") || "<p>None yet.</p>"}
    ${(diff?.clusters?.removed || []).map(cluster =>
      renderRemoved("cluster", cluster.name, cluster.fact)).join("\n")}

    <h2>Bridges (${bridges.length})</h2>
    ${bridges.map(bridge => renderBridge(bridge, clusterNameById, diff?.bridges, edit)).join("\n") || "<p>None yet.</p>"}
    ${(diff?.bridges?.removed || []).map(bridge =>
      renderRemoved("bridge", bridge.term, bridge.fact)).join("\n")}

    ${document.lenses?.length || diff?.lenses?.removed?.length ? `<h2>Lenses (${document.lensMode || "sequential"})</h2>
      ${(document.lenses || []).map(lens => renderLens(lens, diff?.lenses, edit)).join("\n")}
      ${(diff?.lenses?.removed || []).map(lens =>
        renderRemoved("lens", lens.prompt, lens.explanation)).join("\n")}` : ""}

    ${document.relatedPuzzles?.entries?.length ? `<h2>Related puzzles</h2>
      ${renderInfo(document.relatedPuzzles.info)}
      <ul>${document.relatedPuzzles.entries.map(entry =>
        `<li><strong>${escapeHtml(entry.id)}</strong>: ${escapeHtml(entry.reason)}${
          entry.via ? ` <span class="meta">(via ${entry.via.map(escapeHtml).join(", ")})</span>` : ""}</li>`
      ).join("")}</ul>
      ${renderWas(diff?.fields?.relatedPuzzles)}` : ""}

    ${intro ? `<h2>Learning introduction</h2>
      <p class="meta">
        ${badge(intro.requirement, "accent")}
        ${intro.estimatedMinutes ? badge(`${intro.estimatedMinutes} min`) : ""}
      </p>
      ${intro.title ? `<h3>${escapeHtml(intro.title)}</h3>` : ""}
      ${renderCopyField({
        edit, section: "learning", field: "title",
        value: intro.title || "", change: diff?.fields?.learningIntroduction, multiline: false, label: "introduction title"
      })}
      ${intro.summary ? `<p class="fact"><span class="field-label">summary:</span> ${escapeHtml(intro.summary)}</p>` : ""}
      ${renderCopyField({
        edit, section: "learning", field: "summary",
        value: intro.summary || "", change: diff?.fields?.learningIntroduction, label: "summary"
      })}
      <pre class="learning-content">${escapeHtml(intro.content?.text || "")}</pre>
      ${renderCopyField({
        edit, section: "learning", field: "content.text",
        value: intro.content?.text || "", change: diff?.fields?.learningIntroduction, label: "introduction"
      })}
      ${renderLearningReferences(intro)}
      ${renderWas(diff?.fields?.learningIntroduction)}
    ` : ""}

    <details class="raw">
      <summary>Raw document JSON</summary>
      <pre>${escapeHtml(JSON.stringify(document, null, 2))}</pre>
    </details>
  `;
  return pageShell(document.title || draft.draftId, body);
}
