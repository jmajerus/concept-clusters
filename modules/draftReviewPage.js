// HTML rendering for /admin/drafts -- a human-skimmable view of a draft's
// actual text content (facts, term notes, bridge descriptions, the learning
// introduction), which is where authoring disagreements actually concentrate,
// as opposed to board mechanics the game engine already validates
// structurally. Copy fields can be edited in place (or restored to the
// published wording). Structure is authored on the LAN construct canvas
// (`/?draft=`) or via optional MCP. Freeze on `/admin` writes cued D1
// snapshots into git. Publish writes the shared D1 row.

import { lessonCreditSuggestionHint } from "./authoringSettings.js";
import { authoringAdminNav, GITHUB_REFRESH_CONFIRM } from "./authoringAdminIndex.js";
import { renderFreezeCueForm, renderPublishedFreezeBadges } from "./catalogueReviewPage.js";
import { COPY_FIELD_ELEMENT_SCRIPT } from "./copyFieldElement.js";
import {
  SAVE_CANONICAL_CONFIRM,
  SAVE_WORKING_COPY_CONFIRM,
  WORKING_COPY_FORM_ID
} from "./draftReviewEdit.js";
import { SAVE_TO_CANONICALIZE_FLAG_ID } from "./authoredPuzzleDocument.js";
import { suggestLessonCredit } from "./generativeAssistance.js";
import { draftBoardQuery, draftPlayQuery, playQuery } from "./stagingPlayLinks.js";
import { CATEGORIES } from "../puzzles/categories.js";
import {
  AUTHORING_PROVENANCE_COLLABORATION,
  AUTHORING_PROVENANCE_REASONING_LABELS,
  AUTHORING_PROVENANCE_REASONING_LEVELS,
  AUTHORING_PROVENANCE_REVIEWED_BY_MAX,
  AUTHORING_PROVENANCE_SWITCH_LABELS,
  AUTHORING_PROVENANCE_SWITCHES,
  listGenerativeContributorsForEdit,
  resolveLessonByline,
  renderProvenanceL1,
  renderProvenanceL2
} from "./authoringProvenance.js";
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { modelSuggestionsForHost } from "./authoringModelSuggestions.js";
import { REPEATABLE_LIST_ELEMENT_SCRIPT } from "./repeatableListElement.js";
import { authoredLinks, authoredLearningLinks, authoredLinksExcludingCitationUrls } from "./termInfo.js";
import { VALID_TERM_ROLES } from "./contentValidation.js";

const AUTHORING_MODEL_DATALIST_ID = "authoring-model-suggestions";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function formatWas(value) {
  if (value == null || value === "") return "(empty)";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(item => {
      if (item && typeof item === "object") {
        return item.href || item.title || JSON.stringify(item);
      }
      return String(item);
    }).join(", ");
  }
  if (typeof value === "object") {
    if ("text" in value || "link" in value || "links" in value) {
      const hrefs = Array.isArray(value.links)
        ? value.links.map(entry => (typeof entry === "string" ? entry : entry?.href)).filter(Boolean)
        : [value.link];
      return [value.text, ...hrefs].filter(Boolean).join(" · ") || "(empty)";
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

function renderCopyField({
  edit,
  section,
  id = "",
  term = "",
  field,
  value = "",
  change = null,
  multiline = true,
  label = "copy",
  controlId = ""
}) {
  if (!edit?.draftId) return "";
  const slot = copyHidden(edit, { section, id, term, field });
  const control = multiline
    ? `<textarea${slot.form} name="${slot.prefix}value" rows="4"${controlId ? ` id="${escapeHtml(controlId)}"` : ""} data-copy-control>${escapeHtml(value ?? "")}</textarea>`
    : `<input${slot.form} type="text" name="${slot.prefix}value" value="${escapeHtml(value ?? "")}"${controlId ? ` id="${escapeHtml(controlId)}"` : ""} data-copy-control>`;
  const hasPublished = change && Object.prototype.hasOwnProperty.call(change, "before");
  const revert = hasPublished
    ? `<button type="button" class="copy-field-restore" data-restore-published>Use published wording</button>`
    : "";
  const summary = (typeof value === "string" && value.trim()) || change
    ? `Edit ${label}`
    : `Add ${label}`;
  const publishedAttr = hasPublished
    ? ` data-kind="text" data-published="${escapeHtml(JSON.stringify(change.before ?? ""))}"`
    : "";
  return `<copy-field${publishedAttr}>
    <details>
      <summary>${escapeHtml(summary)}</summary>
      ${slot.hidden}
      ${control}
    </details>
    ${revert}
  </copy-field>`;
}

function allocateCopySlot(edit) {
  const index = Number.isInteger(edit.copySlot) ? edit.copySlot : 0;
  edit.copySlot = index + 1;
  return index;
}

function copyFormAttr() {
  return ` form="${WORKING_COPY_FORM_ID}"`;
}

function copyHidden(edit, { section, id = "", term = "", field }) {
  const index = allocateCopySlot(edit);
  const form = copyFormAttr();
  const prefix = `c${index}.`;
  return {
    index,
    prefix,
    form,
    hidden: `
    <input${form} type="hidden" name="${prefix}section" value="${escapeHtml(section)}">
    <input${form} type="hidden" name="${prefix}id" value="${escapeHtml(id)}">
    <input${form} type="hidden" name="${prefix}term" value="${escapeHtml(term)}">
    <input${form} type="hidden" name="${prefix}field" value="${escapeHtml(field)}">
  `
  };
}

function labeledInput(name, value, label, { form = "", fieldName = name } = {}) {
  return `<label>${escapeHtml(label)} <input${form} type="text" name="${escapeHtml(fieldName)}" value="${escapeHtml(value || "")}" data-row-key="${escapeHtml(name)}"></label>`;
}

function renderLinkRow(row = {}, { optionalLabel = false, form = "", prefix = "" } = {}) {
  return `<fieldset data-row class="repeatable-row">
    <legend>Link</legend>
    ${labeledInput("label", row.label, optionalLabel ? "Label (optional)" : "Label", { form, fieldName: `${prefix}label` })}
    ${labeledInput("href", row.href, "URL", { form, fieldName: `${prefix}href` })}
    <button type="button" data-remove-row>Remove</button>
  </fieldset>`;
}

function renderCitationRow(row = {}, { form = "", prefix = "" } = {}) {
  return `<fieldset data-row class="repeatable-row">
    <legend>Citation</legend>
    ${labeledInput("title", row.title, "Title", { form, fieldName: `${prefix}title` })}
    ${labeledInput("author", row.author, "Author", { form, fieldName: `${prefix}author` })}
    ${labeledInput("publisher", row.publisher, "Publisher", { form, fieldName: `${prefix}publisher` })}
    ${labeledInput("year", row.year, "Year", { form, fieldName: `${prefix}year` })}
    ${labeledInput("pages", row.pages, "Pages", { form, fieldName: `${prefix}pages` })}
    ${labeledInput("url", row.url, "URL", { form, fieldName: `${prefix}url` })}
    <button type="button" data-remove-row>Remove</button>
  </fieldset>`;
}

function renderRepeatableField({
  edit,
  section,
  id = "",
  term = "",
  field,
  rows = [],
  change = null,
  kind,
  label
}) {
  if (!edit?.draftId) return "";
  const slot = copyHidden(edit, { section, id, term, field });
  const optionalLabel = field === "info.links";
  const rowOpts = { form: slot.form, prefix: slot.prefix, optionalLabel };
  const renderRow = kind === "citations"
    ? (row = {}) => renderCitationRow(row, rowOpts)
    : (row = {}) => renderLinkRow(row, rowOpts);
  const emptyRow = renderRow({});
  const existing = rows.map(renderRow).join("");
  const hasPublished = change && Object.prototype.hasOwnProperty.call(change, "before");
  const revert = hasPublished
    ? `<button type="button" class="copy-field-restore" data-restore-published>Use published wording</button>`
    : "";
  const summary = rows.length || change ? `Edit ${label}` : `Add ${label}`;
  const addLabel = kind === "citations" ? "Add citation" : "Add link";
  const publishedAttr = hasPublished
    ? ` data-kind="${escapeHtml(kind)}" data-published="${escapeHtml(JSON.stringify(change.before ?? []))}"`
    : ` data-kind="${escapeHtml(kind)}"`;
  return `<copy-field${publishedAttr}>
    <details>
      <summary>${escapeHtml(summary)}</summary>
      ${slot.hidden}
      <repeatable-list>
        <div data-rows>${existing}${emptyRow}</div>
        <template>${emptyRow}</template>
        <button type="button" data-add-row>${escapeHtml(addLabel)}</button>
      </repeatable-list>
    </details>
    ${revert}
  </copy-field>`;
}

function renderInfoEditors({
  edit,
  section,
  id = "",
  term = "",
  info,
  linkChange = null,
  citationChange = null,
  includeCitations = false
}) {
  const object = info && typeof info === "object" && !Array.isArray(info) ? info : {};
  const parts = [
    renderRepeatableField({
      edit, section, id, term, field: "info.links",
      rows: authoredLinks(info), change: linkChange, kind: "links", label: "links"
    })
  ];
  if (includeCitations) {
    parts.push(renderRepeatableField({
      edit, section, id, term, field: "info.citations",
      rows: Array.isArray(object.citations) ? object.citations : [],
      change: citationChange, kind: "citations", label: "citations"
    }));
  }
  return parts.join("\n");
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

function renderLinkList(links) {
  if (!Array.isArray(links) || !links.length) return "";
  return links.map(entry => {
    const href = escapeHtml(entry.href || "");
    return entry.label ? `${escapeHtml(entry.label)} (${href})` : href;
  }).join("; ");
}

function renderReferences(info, { always = false, hideLinksOverlappingCitations = false } = {}) {
  const object = info && typeof info === "object" && !Array.isArray(info) ? info : {};
  const parts = [];
  const links = hideLinksOverlappingCitations
    ? authoredLinksExcludingCitationUrls(info)
    : authoredLinks(info);
  const linkText = renderLinkList(links);
  if (linkText) parts.push(labeledLine("links", linkText));
  else if (always) parts.push(labeledLine("links", emptyValue()));
  const citations = renderCitationList(object.citations);
  if (citations) parts.push(citations);
  else if (always) parts.push(labeledLine("citations", emptyValue()));
  return parts.join("\n");
}

// Every info-shaped field (puzzle/cluster/bridge/termInfo entries) accepts
// either a plain string or {text?, links?, citations?} -- plus the legacy
// link/extraLink/seeAlso fields that authoredLinks() still folds in.
// Puzzle-level review always shows links and citations so a human can see
// the whole agent-editable record, even when those slots are empty.
// Cluster/term/bridge info still omits empty optional slots.
function renderInfo(info, { alwaysShowReferences = false, hideLinksOverlappingCitations = false } = {}) {
  const parts = [];
  if (typeof info === "string") {
    parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info)}</p>`);
  } else if (info && typeof info === "object") {
    if (info.text) parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info.text)}</p>`);
  }
  parts.push(renderReferences(info, {
    always: alwaysShowReferences,
    hideLinksOverlappingCitations
  }));
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
      ${renderWas(infoChange?.["info.text"])}
      ${renderCopyField({
        edit, section: "term", id: clusterId, term, field: "info.text",
        value: infoText(info), change: infoChange?.["info.text"], label: "term note"
      })}
      ${renderInfoEditors({
        edit, section: "term", id: clusterId, term, info,
        linkChange: infoChange?.["info.links"]
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
    ${renderWas(mark?.fields?.["info.text"])}
    ${renderCopyField({
      edit, section: "cluster", id: clusterId, field: "info.text",
      value: infoText(cluster.info), change: mark?.fields?.["info.text"], label: "cluster info"
    })}
    ${renderWas(mark?.fields?.["info.links"])}
    ${renderInfoEditors({
      edit, section: "cluster", id: clusterId, info: cluster.info,
      linkChange: mark?.fields?.["info.links"]
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

function renderBridgeTermRole({ edit, bridge, bridgeId }) {
  if (!edit?.draftId) return "";
  const slot = copyHidden(edit, {
    section: "bridge", id: bridgeId, term: "", field: "termRole"
  });
  const current = VALID_TERM_ROLES.has(bridge.termRole) ? bridge.termRole : "reference";
  const selectId = `bridge-term-role-${String(bridgeId).replace(/\s+/g, "-").toLowerCase()}`;
  const options = [...VALID_TERM_ROLES].map(role => {
    const selected = role === current ? " selected" : "";
    return `<option value="${escapeHtml(role)}"${selected}>${escapeHtml(role)}</option>`;
  }).join("");
  return `<div class="bridge-term-role">
    ${slot.hidden}
    <label class="field-label" for="${escapeHtml(selectId)}">Term role</label>
    <select${slot.form} id="${escapeHtml(selectId)}" name="${slot.prefix}value">${options}</select>
    <p class="meta">reference when this displayed term is something the lesson sets out to teach; connector when it only names a local mechanism.</p>
  </div>`;
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
      ${edit?.draftId ? "" : badge(bridge.termRole || "reference")}
      ${bridge.conceptId ? badge(`concept: ${bridge.conceptId}`) : ""}
      ${bridge.direction ? badge(`direction: ${bridge.direction.kind}`) : ""}
    </p>
    ${renderBridgeTermRole({ edit, bridge, bridgeId })}
    ${renderWas(mark?.fields?.relationKind)}
    ${renderWas(mark?.fields?.termRole)}
    ${renderWas(mark?.fields?.direction)}
    ${renderWas(mark?.fields?.idealTerms)}
    ${idealTerms ? `<p>ideal terms:</p><ul>${idealTerms}</ul>` : ""}
    ${renderInfo(bridge.info)}
    ${renderWas(mark?.fields?.["info.text"])}
    ${renderCopyField({
      edit, section: "bridge", id: bridgeId, field: "info.text",
      value: infoText(bridge.info), change: mark?.fields?.["info.text"], label: "bridge info"
    })}
    ${renderWas(mark?.fields?.["info.links"])}
    ${bridge.termRole === "connector" ? "" : renderInfoEditors({
      edit, section: "bridge", id: bridgeId, info: bridge.info,
      linkChange: mark?.fields?.["info.links"]
    })}
  </section>`;
}

function renderLens(lens, collection, edit) {
  const { kind, mark } = collectionMark(collection, lens, "id", "prompt");
  const lensId = lens.id || lens.prompt || "";
  const targets = lens.targets ? `<p>targets: ${lens.targets.map(escapeHtml).join(", ")}</p>` : "";
  const reasons = lens.reasons
    ? `<ul>${Object.entries(lens.reasons).map(([target, reason]) =>
        `<li><strong>${escapeHtml(target)}</strong>: ${escapeHtml(reason)}
         ${renderCopyField({
           edit, section: "lens", id: lensId, term: target, field: "reason",
           value: reason, change: mark?.fields?.reasons, label: "reason"
         })}</li>`).join("")}</ul>`
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
function renderFlags(flags, edit = null) {
  if (!Array.isArray(flags) || flags.length === 0) return "";
  const items = flags.map(flag => `<li>${escapeHtml(flag.message)}</li>`).join("");
  const needsCanonical = flags.some(flag => flag.id === SAVE_TO_CANONICALIZE_FLAG_ID);
  const canonicalSave = needsCanonical && edit?.draftId
    ? `<form method="post" action="/admin/drafts/${encodeURIComponent(edit.draftId)}" class="canonical-save">
         <input type="hidden" name="expected_revision" value="${escapeHtml(String(edit.revision ?? ""))}">
         <input type="hidden" name="confirm" value="${SAVE_CANONICAL_CONFIRM}">
         <button type="submit">Save canonical form</button>
       </form>`
    : "";
  return `<div class="validation validation-flags">
    <p>⚑ ${flags.length} authoring flag${flags.length === 1 ? "" : "s"} -- worth a look, not necessarily a problem:</p>
    <ul>${items}</ul>
    ${canonicalSave}
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
  .badge-new { background: #dbeafe; color: #1e3a8a; }
  .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
  .validation-ok { background: #dcfce7; }
  .validation-fail { background: #fee2e2; }
  .validation-unknown { background: #fef9c3; }
  .validation-flags { background: #fef3c7; }
  .validation-flags ul { margin: 4px 0 0; }
  .validation-flags .canonical-save { margin-top: 10px; }
  .validation-flags .canonical-save button {
    font: inherit; padding: 6px 12px; border-radius: 4px; border: 1px solid #2563eb;
    background: #2563eb; color: #fff; cursor: pointer;
  }
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
  .submit-pr .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; align-items: center; }
  .submit-pr .actions form { margin: 0; display: flex; gap: 8px; flex-wrap: wrap; }
  .submit-pr button { font: inherit; padding: 8px 14px; border-radius: 6px; border: 0; background: #2563eb; color: #fff; cursor: pointer; }
  .submit-pr button:disabled { background: #94a3b8; cursor: not-allowed; }
  .submit-pr button.secondary { background: #fff; color: #2563eb; border: 1px solid #2563eb; }
  .submit-pr button.secondary:disabled { background: #f1f5f9; color: #94a3b8; border-color: #cbd5e1; }
  .submit-pr .play-button {
    display: inline-block; font: inherit; padding: 8px 14px; border-radius: 6px;
    border: 0; background: #15803d; color: #fff; text-decoration: none; cursor: pointer;
  }
  .submit-pr button.play-button:disabled { background: #94a3b8; cursor: not-allowed; }
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
  copy-field button.copy-field-restore {
    font: inherit; padding: 6px 12px; margin: 8px 8px 0 0; border-radius: 4px;
    border: 1px solid #9a3412; background: #fff; color: #9a3412; cursor: pointer;
  }
  .working-copy-save-foot { margin: 24px 0 8px; }
  .working-copy-save-foot button {
    font: inherit; padding: 8px 14px; border-radius: 6px; border: 0;
    background: #2563eb; color: #fff; cursor: pointer;
  }
  repeatable-list { display: block; }
  .repeatable-row {
    border: 1px solid #e5e5e5; border-radius: 6px; padding: 8px 10px; margin: 8px 0;
  }
  .repeatable-row legend { font-size: 12px; color: #666; padding: 0 4px; }
  .repeatable-row label { display: block; font-size: 12px; color: #666; margin: 6px 0; }
  .repeatable-row input {
    display: block; width: 100%; box-sizing: border-box; font: inherit;
    padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 4px;
  }
  copy-field [data-add-row], copy-field [data-remove-row] {
    background: #fff; color: #2563eb; border-color: #2563eb;
  }
  copy-field [data-remove-row] { color: #9a3412; border-color: #9a3412; }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }
  .provenance-override .inline-edit { margin: 10px 0; }
  .provenance-override .inline-edit button {
    font: inherit; padding: 6px 12px; border-radius: 4px; border: 1px solid #2563eb;
    background: #2563eb; color: #fff; cursor: pointer;
  }
  .provenance-form .provenance-field { margin: 10px 0; }
  .provenance-form select {
    font: inherit; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; margin: 0 8px;
  }
  .provenance-model-row { margin: 8px 0; }
  .provenance-host {
    display: inline-block;
    min-width: 5.5em;
    color: #1a1a1a;
    font-weight: 600;
  }
  .provenance-model-row input[type="text"] {
    font: inherit; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; margin: 0 8px;
  }
  .bridge-term-role { margin: 10px 0; }
  .bridge-term-role select {
    font: inherit; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; margin: 0 8px;
  }
  form.new-puzzle {
    margin: 16px 0 24px; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px;
  }
  form.new-puzzle h2 { margin: 0 0 8px; font-size: 1.1rem; }
  form.new-puzzle label { display: inline-block; min-width: 5em; }
  form.new-puzzle input { font: inherit; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; }
  a.play-button.secondary {
    background: #fff; color: #2563eb; border: 1px solid #2563eb;
  }
  body:has(.puzzle-corpus) { max-width: 980px; }
  .corpus-toolbar { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: end; margin: 0 0 16px; }
  .corpus-toolbar label { display: block; font-size: 13px; color: #666; }
  .corpus-toolbar input[type="search"] {
    font: inherit; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 16rem;
  }
  .corpus-scopes { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 14px; }
  .corpus-scopes label { display: inline; color: #1a1a1a; }
  .corpus-scope-label { color: #666; font-size: 13px; margin-right: 2px; }
  .corpus-group { margin: 20px 0 8px; }
  .corpus-group h2 { margin: 0 0 6px; font-size: 1.05rem; }
  .corpus-group .meta { margin: 0 0 8px; }
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
<script>${REPEATABLE_LIST_ELEMENT_SCRIPT}</script>
</body>
</html>`;
}

// `inGithubProduction` is null when there is no snapshot (Refresh from
// GitHub / Freeze has not written one yet, or the hosted GitHub fetch
// failed). Do not treat that as "not in GitHub production". Status follows
// the publish path: working copy → authoring play (held | cued | new on
// next freeze) → GitHub.
function renderGithubProductionStatus(inGithubProduction) {
  if (inGithubProduction === null || inGithubProduction === undefined) return "";
  return inGithubProduction
    ? '<span class="badge badge-ok">in GitHub production</span>'
    : '<span class="badge">not in GitHub production</span>';
}

function renderPuzzlePathBadges(item, { detail = false } = {}) {
  if (item.withdrawn === true || item.d1Withdrawn === true) {
    return '<span class="badge">withdrawn</span>';
  }
  const published = item.published === true || item.d1Published === true;
  if (published) {
    return `<span class="badge badge-ok">authoring play</span> ${renderPublishedFreezeBadges(item)}`.trim();
  }
  const hasWorkingCopy = item.hasWorkingCopy === true
    || (detail && Boolean(item.draftId || item.status || item.document));
  if (hasWorkingCopy || detail) {
    return '<span class="badge badge-warn">working copy</span>';
  }
  if (item.inGit) return '<span class="badge">in git</span>';
  return "";
}

function listIntro(variant) {
  return variant === "local"
    ? `One path: working copy → Publish (authoring play, held) → Cue → Freeze on
       <a href="/admin">Admin</a> (git) → GitHub production. Status is
       where this id sits on that path. GitHub is origin’s
       <code>puzzles/manifest.js</code> joined with the last freeze patch.
       Refresh from GitHub on Admin fills that column without freezing.
       Show <strong>Working copies</strong> is the working copy badge: not
       yet in authoring play. <strong>Drafts</strong> is never in GitHub
       production (needs a GitHub snapshot). <strong>Published only</strong>
       is authoring play with no private draft. By category browses the
       corpus. Recent gathers working copies by last
       update. Open a row to review copy; that starts a working copy if you
       do not already have one. New puzzle opens a blank board. Play
       unpublished boards on this server (\`/?draft=\`). Catalogues are edited at
       <a href="/admin/catalogues">/admin/catalogues</a>.`
    : `One path: working copy → Publish (authoring play, held) → Cue → LAN
       Freeze (git) → GitHub production. Status is where this id sits on that
       path. Hosted GitHub is origin only. Show Working copies is the working
       copy badge; Drafts is never in GitHub production; Published only is
       authoring play with no private draft. By category browses the corpus.
       Recent gathers working copies by last update. Open a row to review
       copy; that starts a working copy if you do not already have one.
       Play unpublished boards on the LAN authoring checkout, not here.`
}

function renderGithubRefreshForm(snapshot) {
  const hasSnapshot = Array.isArray(snapshot?.ids) && snapshot.ids.length;
  const status = hasSnapshot
    ? `GitHub column from <code>${escapeHtml(snapshot.ref || "origin")}</code>
       (${snapshot.ids.length} id${snapshot.ids.length === 1 ? "" : "s"})${
         snapshot.fetchedAt ? `, fetched ${escapeHtml(snapshot.fetchedAt)}` : ""
       }.`
    : `GitHub column is empty until you fetch origin. Freeze is not required.`;
  return `<section class="submit-pr">
    <p class="meta">${status}</p>
    <div class="actions">
      <form method="post" action="/admin">
        <button type="submit" name="confirm" value="${GITHUB_REFRESH_CONFIRM}" class="secondary">Refresh GitHub column</button>
      </form>
    </div>
  </section>`;
}

function renderNewPuzzleForm() {
  const options = Object.keys(CATEGORIES).map(name =>
    `<option value="${escapeHtml(name)}"></option>`
  ).join("");
  return `<form class="new-puzzle" method="post" action="/admin/drafts">
    <h2>New puzzle</h2>
    <p class="meta">Creates a blank draft and opens the construct board. No MCP required.</p>
    <input type="hidden" name="confirm" value="create-draft">
    <p><label>id <input name="id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="my-puzzle"></label></p>
    <p><label>title <input name="title" required></label></p>
    <p><label>category <input name="category" required list="new-puzzle-categories"></label></p>
    <datalist id="new-puzzle-categories">${options}</datalist>
    <p><button type="submit">Create and open board</button></p>
  </form>`;
}

function isWorkingCopyStatus(item) {
  return item.withdrawn !== true
    && item.published !== true
    && item.hasWorkingCopy === true;
}

function githubProductionAttr(inGithubProduction) {
  if (inGithubProduction === true) return "1";
  if (inGithubProduction === false) return "0";
  return "";
}

function normalizeCorpusItem(item) {
  const id = item.id || item.puzzleId || item.draftId;
  const hasWorkingCopy = item.hasWorkingCopy === true
    || (item.hasWorkingCopy !== false && Boolean(item.draftId || item.status));
  return {
    ...item,
    id,
    draftId: item.draftId || (hasWorkingCopy ? id : null),
    title: item.title || id,
    category: item.category || item.document?.category || "Uncategorized",
    hasWorkingCopy,
    published: item.published === true || item.d1Published === true,
    withdrawn: item.withdrawn === true || item.d1Withdrawn === true,
    inGit: item.inGit === true
  };
}

function recencyKey(updatedAt, now = new Date()) {
  const then = Date.parse(updatedAt);
  if (!Number.isFinite(then)) return "undated";
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (then >= startOfToday.getTime()) return "today";
  const weekAgo = startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000;
  if (then >= weekAgo) return "week";
  const monthAgo = startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000;
  if (then >= monthAgo) return "month";
  return "older";
}

const RECENCY_ORDER = ["today", "week", "month", "older", "undated"];
const RECENCY_LABELS = {
  today: "Today",
  week: "Past week",
  month: "Past month",
  older: "Older",
  undated: "No date"
};

function groupRecentWorkingCopies(items, now = new Date()) {
  const groups = new Map(RECENCY_ORDER.map(key => [key, []]));
  for (const item of items.filter(row => row.hasWorkingCopy)) {
    groups.get(recencyKey(item.updatedAt, now)).push(item);
  }
  for (const key of RECENCY_ORDER) {
    groups.get(key).sort((left, right) =>
      String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""))
      || String(left.title).localeCompare(String(right.title))
    );
  }
  return RECENCY_ORDER
    .filter(key => groups.get(key).length)
    .map(key => ({ title: RECENCY_LABELS[key], rows: groups.get(key) }));
}

function publishedOnlyRows(items) {
  return items
    .filter(item => !item.hasWorkingCopy)
    .sort((left, right) => String(left.title).localeCompare(String(right.title)));
}

function corpusTableHead(variant, { includeCategory = false } = {}) {
  const playColumn = variant === "local" ? "<th>Play</th>" : "";
  const categoryColumn = includeCategory ? "<th>Category</th>" : "";
  return `<thead><tr><th>Title</th><th>Id</th>${categoryColumn}<th>Status</th><th>GitHub</th>${playColumn}<th>Updated</th></tr></thead>`;
}

function renderCorpusRow(item, variant, { includeCategory = false } = {}) {
  const hrefId = item.draftId || item.id;
  const playCell = renderCorpusPlayCell(item, variant);
  const filter = [item.title, item.id, item.draftId, item.category].filter(Boolean).join(" ");
  const categoryCell = includeCategory
    ? `<td>${escapeHtml(item.category || "")}</td>`
    : "";
  return `<tr data-puzzle-id="${escapeHtml(item.id)}" data-draft-id="${escapeHtml(item.draftId || "")}" data-has-draft="${item.hasWorkingCopy ? "1" : "0"}" data-working-copy="${isWorkingCopyStatus(item) ? "1" : "0"}" data-github="${githubProductionAttr(item.inGithubProduction)}" data-updated-at="${escapeHtml(item.updatedAt || "")}" data-filter="${escapeHtml(filter)}">
    <td><a href="/admin/drafts/${encodeURIComponent(hrefId)}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    ${categoryCell}
    <td>${renderPuzzlePathBadges(item)}</td>
    <td>${renderGithubProductionStatus(item.inGithubProduction)}</td>
    ${playCell}
    <td>${escapeHtml(item.updatedAt || "")}</td>
  </tr>`;
}

function renderCorpusGroup({ title, rows, variant, includeCategory = false }) {
  if (!rows.length) return "";
  return `<section class="corpus-group">
      <h2>${escapeHtml(title)}</h2>
      <p class="meta">${rows.length} puzzle${rows.length === 1 ? "" : "s"}</p>
      <table>
        ${corpusTableHead(variant, { includeCategory })}
        <tbody>${rows.map(item => renderCorpusRow(item, variant, { includeCategory })).join("\n")}</tbody>
      </table>
    </section>`;
}

function groupPuzzleCorpusRows(items) {
  const groups = new Map();
  for (const item of items) {
    const category = item.category || "Uncategorized";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  }
  const categories = [...groups.keys()].sort((left, right) => left.localeCompare(right));
  for (const category of categories) {
    groups.get(category).sort((left, right) => {
      if (left.hasWorkingCopy !== right.hasWorkingCopy) {
        return left.hasWorkingCopy ? -1 : 1;
      }
      if (left.hasWorkingCopy) {
        return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""))
          || String(left.title).localeCompare(String(right.title));
      }
      return String(left.title).localeCompare(String(right.title));
    });
  }
  return categories.map(category => ({ category, rows: groups.get(category) }));
}

function renderCorpusPlayCell(item, variant) {
  if (variant !== "local") return "";
  try {
    if (item.hasWorkingCopy && item.draftId) {
      return `<td><a href="${escapeHtml(draftPlayQuery(item.draftId))}">Play</a></td>`;
    }
    if (item.published && item.id) {
      return `<td><a href="${escapeHtml(playQuery(item.id))}">Play</a></td>`;
    }
  } catch {
    return "<td></td>";
  }
  return "<td></td>";
}

const CORPUS_FILTER_SCRIPT = `
(function () {
  var root = document.querySelector(".puzzle-corpus");
  if (!root) return;
  var search = root.querySelector("#puzzle-corpus-search");
  var scopeRadios = root.querySelectorAll("input[name=puzzle-corpus-scope]");
  var arrangeRadios = root.querySelectorAll("input[name=puzzle-corpus-arrange]");
  var byCategory = root.querySelector("#corpus-by-category");
  var byRecent = root.querySelector("#corpus-by-recent");
  function selectedValue(name, fallback) {
    var checked = root.querySelector("input[name=" + name + "]:checked");
    return checked ? checked.value : fallback;
  }
  function setArrange(arrange) {
    var radio = root.querySelector("input[name=puzzle-corpus-arrange][value=" + arrange + "]");
    if (radio) radio.checked = true;
  }
  function syncHash(arrange) {
    var next = arrange === "recent" ? "#recent" : "";
    if ((location.hash || "") === next) return;
    history.replaceState(null, "", location.pathname + location.search + next);
  }
  function apply() {
    var query = ((search && search.value) || "").trim().toLowerCase();
    var scope = selectedValue("puzzle-corpus-scope", "all");
    var arrange = selectedValue("puzzle-corpus-arrange", "category");
    if (byCategory) byCategory.hidden = arrange !== "category";
    if (byRecent) byRecent.hidden = arrange !== "recent";
    syncHash(arrange);
    root.querySelectorAll("tr[data-puzzle-id]").forEach(function (row) {
      var hay = (row.getAttribute("data-filter") || "").toLowerCase();
      var hasDraft = row.getAttribute("data-has-draft") === "1";
      var working = row.getAttribute("data-working-copy") === "1";
      var github = row.getAttribute("data-github");
      var matchQuery = !query || hay.indexOf(query) !== -1;
      var matchScope = scope === "all"
        || (scope === "working" && working)
        || (scope === "drafts" && github === "0")
        || (scope === "published" && !hasDraft);
      row.hidden = !(matchQuery && matchScope);
    });
    root.querySelectorAll(".corpus-group").forEach(function (group) {
      group.hidden = group.querySelectorAll("tr[data-puzzle-id]:not([hidden])").length === 0;
    });
  }
  if (location.hash === "#recent") setArrange("recent");
  if (search) search.addEventListener("input", apply);
  scopeRadios.forEach(function (radio) { radio.addEventListener("change", apply); });
  arrangeRadios.forEach(function (radio) { radio.addEventListener("change", apply); });
  window.addEventListener("hashchange", function () {
    setArrange(location.hash === "#recent" ? "recent" : "category");
    apply();
  });
  apply();
})();
`;

/**
 * @param {object[]} rows
 * @param {{ variant?: string, githubProduction?: object | null }} [options]
 */
export function renderDraftListPage(rows, { variant = "hosted", githubProduction = null } = {}) {
  const items = (rows || []).map(normalizeCorpusItem);
  const workingCount = items.filter(isWorkingCopyStatus).length;
  const neverGithubCount = items.filter(item => item.inGithubProduction === false).length;
  const categoryGroups = groupPuzzleCorpusRows(items).map(({ category, rows: groupRows }) =>
    renderCorpusGroup({ title: category, rows: groupRows, variant })
  ).join("\n");
  const recentWorking = groupRecentWorkingCopies(items).map(group =>
    renderCorpusGroup({ ...group, variant, includeCategory: true })
  ).join("\n");
  const publishedOnly = publishedOnlyRows(items);
  const recentPublished = publishedOnly.length
    ? renderCorpusGroup({
      title: "Published only",
      rows: publishedOnly,
      variant,
      includeCategory: true
    })
    : "";
  const forms = variant === "local" ? renderNewPuzzleForm() : "";
  const githubRefresh = variant === "local" ? renderGithubRefreshForm(githubProduction) : "";
  const empty = items.length
    ? ""
    : "<p>No puzzles in authoring play yet.</p>";
  const body = `<div class="puzzle-corpus">
       <h1>Puzzles</h1>
       <p class="meta">${authoringAdminNav()}</p>
       <p class="meta">${listIntro(variant)}</p>
       ${githubRefresh}
       <p class="meta">${items.length} puzzle${items.length === 1 ? "" : "s"}
         · ${workingCount} working cop${workingCount === 1 ? "y" : "ies"}${
           neverGithubCount
             ? ` · ${neverGithubCount} not in GitHub production`
             : ""
         }</p>
       ${forms}
       <div class="corpus-toolbar">
         <p><label for="puzzle-corpus-search">Filter</label>
           <input id="puzzle-corpus-search" type="search" placeholder="Title, id, or category"></p>
         <p class="corpus-scopes">
           <span class="corpus-scope-label">Show</span>
           <label><input type="radio" name="puzzle-corpus-scope" value="all" checked> All</label>
           <label title="Not yet in authoring play — the working copy badge"><input type="radio" name="puzzle-corpus-scope" value="working"> Working copies</label>
           <label title="Never in GitHub production"><input type="radio" name="puzzle-corpus-scope" value="drafts"> Drafts</label>
           <label title="In authoring play, no private draft"><input type="radio" name="puzzle-corpus-scope" value="published"> Published only</label>
         </p>
         <p class="corpus-scopes">
           <span class="corpus-scope-label">Arrange</span>
           <label><input type="radio" name="puzzle-corpus-arrange" value="category" checked> By category</label>
           <label><input type="radio" name="puzzle-corpus-arrange" value="recent"> Recent</label>
         </p>
       </div>
       <div id="corpus-by-category">${categoryGroups}</div>
       <div id="corpus-by-recent" hidden>${recentWorking}${recentPublished}</div>
       ${empty}
     </div>
     <script>${CORPUS_FILTER_SCRIPT}</script>`;
  return pageShell("Puzzles", body);
}

function renderPlayAction(draft, { valid }) {
  const draftId = typeof draft.draftId === "string" ? draft.draftId : "";
  if (!draftId) return "";
  let boardHref;
  let playHref;
  try {
    boardHref = draftBoardQuery(draftId);
    playHref = draftPlayQuery(draftId);
  } catch {
    return "";
  }
  const board = `<a class="play-button secondary" href="${escapeHtml(boardHref)}">Open board</a>`;
  if (!valid) {
    return `${board}<button type="button" class="play-button" disabled>Play</button>`;
  }
  return `${board}<a class="play-button" href="${escapeHtml(playHref)}">Play</a>`;
}

function submitHint(variant, { valid, alreadyAuthoringPlay = false }) {
  if (!valid) {
    return `Fix validation errors on this page or through the authoring
       conversation before publishing.`;
  }
  if (alreadyAuthoringPlay) {
    return variant === "local"
      ? `This working copy is the authoring-play snapshot. Cue or Hold the
         freeze gate. Publish again after you edit.`
      : `This working copy is the authoring-play snapshot. Cue or Hold the
         freeze gate. Publish again after you edit. Play unpublished boards
         on the LAN authoring checkout, not here.`;
  }
  if (variant === "local") {
    return `This page is for design copy. Open board loads
       <code>/?draft=</code> in Construct. Play is a clean player preview
       (<code>/?draft=&amp;view=play</code>), the same chrome as
       <code>/</code>; add <code>&amp;admin</code> for layout tools.
       Publish writes the shared D1 row. Cue that snapshot on this page
       when it should join the next freeze; Freeze on
       <a href="/admin">Admin</a> is the only thing that writes git.`;
  }
  return `This page is for design copy. Play unpublished boards on the LAN
     authoring checkout (<code>/?draft=</code>), not on Cloudflare. Publish
     writes the shared D1 row. Cue that snapshot when it should join the
     next freeze; Freeze on the LAN Admin page writes git. Hosted authoring
     has no git checkout.`;
}

function renderSubmitForm(draft, variant = "hosted") {
  const draftId = draft.draftId;
  const valid = draft.validation?.valid === true;
  const d1Published = draft.d1Published === true && draft.d1Withdrawn !== true;
  const differsFromPublished = d1Published && Number(draft.publishedDiff?.total) > 0;
  const alreadyAuthoringPlay = d1Published && !differsFromPublished;
  const canPublish = valid && !alreadyAuthoringPlay;
  const disabled = canPublish ? "" : " disabled";
  const hint = submitHint(variant, { valid, alreadyAuthoringPlay });
  const playButton = variant === "local" ? renderPlayAction(draft, { valid }) : "";
  const revert = differsFromPublished
    ? `<button type="submit" name="confirm" value="revert-published" class="secondary">Revert to published</button>`
    : "";
  const revertWorking = Number(draft.workingCopyHistoryCount) > 0
    ? `<button type="submit" name="confirm" value="revert-working-copy" class="secondary">Revert to last working copy</button>`
    : "";
  const unpublish = d1Published
    ? `<button type="submit" name="confirm" value="unpublish" class="secondary">Remove from authoring play</button>`
    : "";
  const workingMeta = [
    "Copy edits on this page stay in the browser until you Save working copy. Construct auto-saves board structure.",
    Number(draft.workingCopyHistoryCount) > 0
      ? "Revert to last working copy restores the previous save. Each click goes back one save."
      : "",
    differsFromPublished ? "Revert to published restores the last D1 published document." : "",
    d1Published
      ? "Remove from authoring play withdraws the published row (Freeze later deletes git files)."
      : "",
    "Delete working copy removes only this draft."
  ].filter(Boolean).join(" ");
  return `<section class="submit-pr">
    <h2>Actions</h2>
    <p class="meta">${hint}</p>
    <div class="actions">
      ${playButton}
      <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
        <button type="submit" name="confirm" value="publish"${disabled}>Publish</button>
      </form>
    </div>
  </section>
  ${renderFreezeCueForm(`/admin/drafts/${encodeURIComponent(draftId)}`, {
    published: draft.d1Published === true,
    withdrawn: draft.d1Withdrawn === true,
    cuedForFreeze: draft.cuedForFreeze === true || draft.readyForFreeze === true
  })}
  <section class="submit-pr">
    <h2>Working copy</h2>
    <p class="meta">${workingMeta}</p>
    <form id="${WORKING_COPY_FORM_ID}" method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
      <input type="hidden" name="confirm" value="${SAVE_WORKING_COPY_CONFIRM}">
      <input type="hidden" name="expected_revision" value="${escapeHtml(String(draft.revision ?? ""))}">
      <div class="actions">
        <button type="submit">Save working copy</button>
      </div>
    </form>
    <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
      <div class="actions">
        ${revertWorking}
        ${revert}
        ${unpublish}
        <button type="submit" name="confirm" value="delete-draft" class="secondary">Delete working copy</button>
      </div>
    </form>
  </section>`;
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
      const bits = [entry.system, entry.role, entry.scope, entry.date]
        .filter(Boolean)
        .map(escapeHtml)
        .join(" · ");
      return `<li>${bits || escapeHtml(JSON.stringify(entry))}</li>`;
    }).join("");
    parts.push(`<p class="field-label">generative assistance:</p><ul>${items}</ul>`);
  }
  const provenanceL2 = renderProvenanceL2(document.provenance);
  if (provenanceL2) {
    parts.push(labeledLine("provenance", escapeHtml(provenanceL2)));
  }
  return parts.join("\n");
}

function renderProvenanceOverride({ edit, document, actor }) {
  if (!edit?.draftId) return "";
  const hasAssistance = Array.isArray(document?.generativeAssistance)
    && document.generativeAssistance.length > 0;
  const hasProvenance = Array.isArray(document?.provenance?.contributors)
    && document.provenance.contributors.length > 0;
  if (!hasAssistance && !hasProvenance) return "";

  const current = document?.provenance?.collaboration || "";
  const author = authorDisplayName(actor) || AUTHORING_SETTINGS.credit?.defaultAuthorName || "";
  const l2 = renderProvenanceL2(document?.provenance);
  const l1 = renderProvenanceL1(document?.provenance);
  const slot = copyHidden(edit, { section: "provenance", id: "", term: "", field: "editor" });
  const form = slot.form;
  const prefix = slot.prefix;
  const options = AUTHORING_PROVENANCE_COLLABORATION.map(mode => {
    const selected = mode === current ? " selected" : "";
    return `<option value="${escapeHtml(mode)}"${selected}>${escapeHtml(mode)}</option>`;
  }).join("");
  const generativeHosts = listGenerativeContributorsForEdit(document);
  const modelSuggestions = modelSuggestionsForHost();
  const modelDatalist = modelSuggestions.length
    ? `<datalist id="${AUTHORING_MODEL_DATALIST_ID}">${modelSuggestions.map(option =>
      `<option value="${escapeHtml(option)}">`
    ).join("")}</datalist>`
    : "";
  const modelFields = generativeHosts.map(({ host, model }) => {
    const inputId = `provenance-model-${host.replace(/\s+/g, "-").toLowerCase()}`;
    return `<div class="provenance-model-row">
      <span class="provenance-host">${escapeHtml(host)}</span>
      <input${form} type="hidden" name="${prefix}modelHost" value="${escapeHtml(host)}">
      <label class="visually-hidden" for="${escapeHtml(inputId)}">model for ${escapeHtml(host)}</label>
      <input${form} type="text" id="${escapeHtml(inputId)}" name="${prefix}modelValue" value="${escapeHtml(model)}" placeholder="optional, e.g. auto" size="24" autocomplete="off"${modelSuggestions.length ? ` list="${AUTHORING_MODEL_DATALIST_ID}"` : ""}>
    </div>`;
  }).join("");

  function renderClientSettingSelect({ field, label, levels, labels, current }) {
    const selectId = `provenance-${field}`;
    const options = [
      `<option value="">(not set)</option>`,
      ...levels.map(level => {
        const selected = level === current ? " selected" : "";
        return `<option value="${escapeHtml(level)}"${selected}>${escapeHtml(labels[level])}</option>`;
      })
    ].join("");
    return `<div class="provenance-field">
      <label class="field-label" for="${selectId}">${escapeHtml(label)}</label>
      <select${form} id="${selectId}" name="${prefix}${escapeHtml(field)}">${options}</select>
    </div>`;
  }

  const reasoningCurrent = document?.provenance?.reasoning || "";
  const switchCurrent = document?.provenance?.switch ||
    (document?.provenance?.speed === "fast" ? "fast" : "");
  const clientSettingFields = [
    renderClientSettingSelect({
      field: "reasoning",
      label: "Reasoning",
      levels: AUTHORING_PROVENANCE_REASONING_LEVELS,
      labels: AUTHORING_PROVENANCE_REASONING_LABELS,
      current: reasoningCurrent
    }),
    renderClientSettingSelect({
      field: "switch",
      label: "Switch",
      levels: AUTHORING_PROVENANCE_SWITCHES,
      labels: AUTHORING_PROVENANCE_SWITCH_LABELS,
      current: switchCurrent
    })
  ].join("");

  return `<aside class="provenance-override">
    <h2>Provenance</h2>
    <p class="meta">Override collaboration when you have taken editorial lead (or restore AI-primary after agent drafting). The lesson byline is derived from provenance (read-only).</p>
    ${l2 ? `<p class="fact"><span class="field-label">current:</span> ${escapeHtml(l2)}</p>` : ""}
    ${l1 ? `<p class="fact"><span class="field-label">byline (derived):</span> ${escapeHtml(l1)}</p>` : ""}
    <div class="inline-edit provenance-form">
      ${slot.hidden}
      <input${form} type="hidden" name="${prefix}authorName" value="${escapeHtml(author)}">
      ${modelFields ? `<div class="provenance-models">
        <p class="meta">Optional model per drafting host (stored as <code>Host (model)</code>). Use <code>auto</code> when the client chose the model and you do not know which one ran.</p>
        <p class="field-label">Model</p>
        ${modelDatalist}
        ${modelFields}
      </div>` : ""}
      <div class="provenance-client-settings">
        <p class="meta">Optional client settings for how the draft was produced. Reasoning and an enabled UI switch concatenate into the derived byline after the model (for example Grok 4.6 High Fast). Leave switch unset when the client default applied (no toggle on).</p>
        ${clientSettingFields}
      </div>
      <div class="provenance-field">
        <label class="field-label" for="provenance-collaboration">collaboration</label>
        <select${form} id="provenance-collaboration" name="${prefix}collaboration">${options}</select>
      </div>
      <div class="provenance-field">
        <label class="field-label" for="provenance-reviewedBy">Reviewed by</label>
        <input${form} type="text" id="provenance-reviewedBy" name="${prefix}reviewedBy" value="${escapeHtml(document?.provenance?.reviewedBy || "")}" placeholder="optional" maxlength="${AUTHORING_PROVENANCE_REVIEWED_BY_MAX}" autocomplete="name" size="32">
      </div>
      <p class="meta">Optional reviewer name for the lesson byline (for example, reviewed by Jane Expertsmith). This is your attribution, not a sign-off the reviewer has to click. Leave blank when no one reviewed. Saved with Save working copy.</p>
    </div>
  </aside>`;
}

function authorDisplayName(actor) {
  if (!actor || typeof actor !== "object") return null;
  if (typeof actor.name === "string" && actor.name.trim()) return actor.name.trim();
  if (typeof actor.email === "string" && actor.email.trim()) {
    const local = actor.email.trim().split("@")[0];
    return local || null;
  }
  return null;
}

function renderCreditSuggestion({ edit, intro, document, actor, allowApply = true }) {
  if (!edit?.draftId) return "";
  // When provenance can derive L1, byline is read-only — no credit apply.
  if (renderProvenanceL1(document?.provenance)) return "";
  const current = typeof intro?.credit === "string" ? intro.credit.trim() : "";
  const suggested = suggestLessonCredit(
    intro?.credit,
    document?.generativeAssistance,
    { authorName: authorDisplayName(actor) }
  );
  if (!suggested || suggested === current) return "";
  const apply = allowApply
    ? `<button type="button" data-fill-control="copy-learning-credit" data-fill-value="${escapeHtml(suggested)}">Apply legacy byline</button>`
    : `<p class="meta">Legacy byline apply needs a Learning introduction when provenance is not yet available.</p>`;
  return `<aside class="credit-suggestion">
    <p><span class="field-label">legacy byline suggestion:</span> ${escapeHtml(suggested)}</p>
    <p class="meta">${escapeHtml(lessonCreditSuggestionHint())}</p>
    ${apply}
  </aside>`;
}

function renderCreditsSection({ edit, intro, document, actor, diff }) {
  const hasAssistance = Array.isArray(document?.generativeAssistance)
    && document.generativeAssistance.length > 0;
  const derived = resolveLessonByline({
    introduction: intro,
    provenance: document?.provenance,
    generativeAssistance: document?.generativeAssistance
  });
  const hasDerivedProvenance = Boolean(renderProvenanceL1(document?.provenance));
  if (intro) {
    return `<h2>Learning introduction</h2>
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
      ${derived
        ? `<p class="fact"><span class="field-label">${hasDerivedProvenance ? "byline (derived):" : "credit:"}</span> ${escapeHtml(derived)}</p>`
        : ""}
      ${hasDerivedProvenance
        ? `<p class="meta">Byline is derived from provenance. Change it in Provenance above, then Save working copy; it is not stored on the lesson.</p>`
        : `${renderCreditSuggestion({ edit, intro, document, actor })}
      ${renderCopyField({
        edit, section: "learning", field: "credit",
        value: intro.credit || "", change: diff?.fields?.learningIntroduction, multiline: false, label: "credit (legacy)",
        controlId: "copy-learning-credit"
      })}`}
      ${renderLearningReferences(intro)}
      ${renderRepeatableField({
        edit, section: "learning", field: "links",
        rows: authoredLearningLinks(intro),
        change: diff?.fields?.learningIntroduction, kind: "links", label: "links"
      })}
      <p class="meta">Bibliographic references are edited on puzzle info citations (one list for the puzzle and lesson).</p>
      ${renderWas(diff?.fields?.learningIntroduction)}`;
  }
  if (!hasAssistance && !edit?.draftId) return "";
  return `<h2>Credits</h2>
    <p class="meta">The player-visible byline is derived from provenance when present. This draft has no learning introduction yet.</p>
    ${derived ? `<p class="fact"><span class="field-label">byline (derived):</span> ${escapeHtml(derived)}</p>` : ""}
    ${renderCreditSuggestion({ edit, intro: null, document, actor, allowApply: false })}`;
}

function renderLearningReferences(intro) {
  const links = renderLinkList(authoredLearningLinks(intro));
  return labeledLine("links", links || emptyValue());
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
    <p class="meta">Amber is an edit, green is new, struck red was removed. “was:” is the published text. Copy can be edited here; Save working copy writes the private draft. Structure is authored on the construct board or via optional MCP.</p>
  </aside>`;
}

export function renderDraftPage(draft, { variant = "hosted", actor = null } = {}) {
  const document = draft.document || {};
  const clusters = document.clusters || [];
  const bridges = document.bridges || [];
  const clusterNameById = new Map(clusters.map(cluster => [cluster.id, cluster.name]));
  const intro = document.learningIntroduction;
  const diff = draft.publishedDiff || null;
  const titleChange = diff?.fields?.title;
  const edit = { draftId: draft.draftId, revision: draft.revision };

  const body = `
    <p class="meta">${authoringAdminNav()}</p>
    <h1>${escapeHtml(document.title || draft.title || draft.draftId)}</h1>
    ${renderWas(titleChange)}
    ${renderCopyField({
      edit, section: "puzzle", field: "title",
      value: document.title || "", change: titleChange, multiline: false, label: "title"
    })}
    <p class="meta">
      <code>${escapeHtml(draft.draftId)}</code>
      ${renderPuzzlePathBadges(draft, { detail: true })}
      ${renderGithubProductionStatus(draft.inGithubProduction)}
      updated ${escapeHtml(draft.updatedAt)}
    </p>
    ${renderDiffSummary(diff)}
    ${renderValidation(draft.validation, variant)}
    ${renderFlags(draft.validation?.flags, edit)}
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
    ${renderProvenanceOverride({ edit, document, actor })}
    ${renderInfo(document.info, {
      alwaysShowReferences: true,
      hideLinksOverlappingCitations: true
    })}
    ${renderWas(diff?.fields?.["info.text"])}
    ${renderCopyField({
      edit, section: "puzzle", field: "info.text",
      value: infoText(document.info), change: diff?.fields?.["info.text"], label: "puzzle info"
    })}
    ${renderWas(diff?.fields?.["info.links"])}
    ${renderWas(diff?.fields?.["info.citations"])}
    ${renderInfoEditors({
      edit, section: "puzzle", info: document.info,
      linkChange: diff?.fields?.["info.links"],
      citationChange: diff?.fields?.["info.citations"],
      includeCitations: true
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

    ${renderCreditsSection({ edit, intro, document, actor, diff })}

    ${edit.draftId ? `<p class="working-copy-save-foot">
      <button type="submit" form="${WORKING_COPY_FORM_ID}">Save working copy</button>
    </p>` : ""}

    <details class="raw">
      <summary>Raw document JSON</summary>
      <pre>${escapeHtml(JSON.stringify(document, null, 2))}</pre>
    </details>
  `;
  return pageShell(document.title || draft.draftId, body);
}
