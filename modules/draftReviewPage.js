// HTML rendering for /admin/drafts -- a human-skimmable view of a draft's
// actual text content (facts, term notes, bridge descriptions, the learning
// introduction), which is where authoring disagreements actually concentrate,
// as opposed to board mechanics the game engine already validates
// structurally. Copy fields can be edited in place (or restored to the
// published wording). Structure is authored on the LAN construct canvas
// (`/?puzzle=`) or via optional MCP. Freeze on `/admin` writes cued D1
// snapshots into git. Publish makes the D1 snapshot available to public play
// after the cache refreshes.

import { derivedLarge, puzzleNodeCount } from "./puzzleBoardSize.js";
import { layoutSource, normalizeLayoutDocument } from "./layoutDocument.js";
import { layoutIsFixed } from "./layoutHints.js";
import { authoringAdminNav, GITHUB_REFRESH_CONFIRM } from "./authoringAdminIndex.js";
import {
  PUBLIC_PLAY_PUBLICATION_NOTE,
  renderFreezeCueForm,
  renderPublishedFreezeBadges
} from "./catalogueReviewPage.js";
import { COPY_FIELD_ELEMENT_SCRIPT } from "./copyFieldElement.js";
import { RENAME_DRAFT_CONFIRM } from "./draftIdRename.js";
import {
  SAVE_CANONICAL_CONFIRM,
  SAVE_WORKING_COPY_CONFIRM,
  WORKING_COPY_FORM_ID
} from "./draftReviewEdit.js";
import { SAVE_TO_CANONICALIZE_FLAG_ID } from "./authoredPuzzleDocument.js";
import { diffPublishedDraft } from "./draftReviewDiff.js";
import {
  formatReviewValue,
  isReviewPatch,
  proposalChanges,
  reviewChangeSummary,
  staleReviewChanges
} from "./reviewPatch.js";
import { revisedLessonLabel, revisedMarkChangesLessonLine } from "./playerFacingRevision.js";
import { draftBoardQuery, draftPlayQuery, draftProposalPlayQuery, layoutQuery, playQuery } from "./stagingPlayLinks.js";
import {
  RECENCY_ORDER,
  hasUnpublishedChanges,
  isPublishedLive,
  isWorkingCopyStatus,
  recencyKey
} from "./puzzleCorpusStatus.js";
import {
  CATEGORIES,
  categoryIdFor,
  categoryMetadataFor,
  categoryTitleFor,
  primaryCategoryForPuzzle,
  PUZZLE_LEVELS,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import {
  AUTHORING_PROVENANCE_COLLABORATION,
  AUTHORING_PROVENANCE_REASONING_LABELS,
  AUTHORING_PROVENANCE_REASONING_LEVELS,
  AUTHORING_PROVENANCE_REVIEWED_BY_MAX,
  AUTHORING_PROVENANCE_SWITCH_LABELS,
  AUTHORING_PROVENANCE_SWITCHES,
  generativeHostKey,
  isClaudeFamilyContributor,
  UNIDENTIFIED_GENERATIVE_SYSTEM,
  listGenerativeContributorsForEdit,
  resolveLessonByline,
  renderProvenanceL1,
  renderProvenanceL2
} from "./authoringProvenance.js";
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { modelSuggestionsForHost } from "./authoringModelSuggestions.js";
import { REPEATABLE_LIST_ELEMENT_SCRIPT } from "./repeatableListElement.js";
import { CLASSIFICATION_EDITOR_SCRIPT } from "./classificationEditorElement.js";
import { PROVENANCE_CLIENTS_TAG, PROVENANCE_LAST_USED_SCRIPT } from "./provenanceLastUsedElement.js";
import { authoredLinks, authoredLearningLinks, authoredLinksExcludingCitationUrls } from "./termInfo.js";
import {
  boardLimitWaiverMatches,
  boardLimitWaiverTargets,
  boardLimitWaiverTypeSummaries
} from "./boardLimitWaivers.js";

function knownGenerativeHostSystems() {
  const labels = AUTHORING_SETTINGS.hosts?.labels || {};
  return [...new Set(Object.values(labels)
    .map(label => typeof label?.system === "string" ? label.system.trim() : "")
    .filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
}

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

function levelLabel(level) {
  if (!level) return "";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

// At-a-glance badges for renderClassificationEditor's own per-category
// subcategory selection just below -- same badge treatment category/tags
// already get, at-a-glance and next to where it's actually edited, rather
// than a static line in renderPuzzleMeta's block of genuinely immutable
// fields (creator, license, language, ...) that have no editor on this
// page at all. Shows the subcategory's title, not its raw id, matching the
// editor's own dropdown labels.
// Shared by the at-a-glance badges and the diff "was:" line -- "Category:
// Title" per entry, title resolved the same way the editor's own dropdown
// labels are, so a diff never shows a raw id the badges wouldn't.
// categoryRegistry is required, deliberately no git-only default: in the
// authoring environment D1 is the upstream source of truth and the first,
// overriding choice, never a fallback. A default here would let a future
// call site silently render against stale/incomplete Git data if it forgot to
// thread the live D1 category-document registry
// through -- the same failure mode this whole function exists to fix, just
// deferred and invisible until it happened again.
function subcategoryLabels(subcategories, categoryRegistry) {
  if (!subcategories || typeof subcategories !== "object") return [];
  return Object.entries(subcategories).map(([category, id]) =>
    `${categoryTitleFor(category, categoryRegistry)}: ${categoryMetadataFor(category, categoryRegistry)?.subcategories?.[id]?.title || id}`
  );
}

// Secondary memberships as titles, primary excluded. The corpus list groups
// and sorts on the primary only (one row per puzzle); this is the only
// place the list shows the other categories a puzzle belongs to.
function secondaryCategoryLabels(primary, categories, categoryRegistry) {
  if (!Array.isArray(categories)) return [];
  const primaryId = categoryIdFor(primary, categoryRegistry);
  return [...new Set(categories
    .filter(value => typeof value === "string" && value.trim())
    .filter(value => categoryIdFor(value, categoryRegistry) !== primaryId)
    .map(value => categoryTitleFor(value, categoryRegistry)))];
}

function subcategoryBadges(subcategories, categoryRegistry) {
  return subcategoryLabels(subcategories, categoryRegistry).map(label => badge(label)).join("");
}

function renderSubcategoriesWas(change, categoryRegistry) {
  if (!change) return "";
  const labels = subcategoryLabels(change.before, categoryRegistry);
  return `<p class="diff-was">was: ${escapeHtml(labels.length ? labels.join("; ") : "(empty)")}</p>`;
}

function emptyValue() {
  return `<span class="empty">(none)</span>`;
}

function labeledLine(label, inner) {
  return `<p class="info-link"><span class="field-label">${escapeHtml(label)}:</span> ${inner}</p>`;
}

// Where a citation stands in the Zotero pilot (citationSourceStatus.js).
// Statuses are absent off the Postgres workspace; the list then renders as
// before.
function renderCitationSource(status) {
  if (!status) return "";
  if (status.state === "zotero") {
    const title = status.citekey ? "" : ' title="Citekey appears after desktop Zotero syncs and the mirror is refreshed (authoring:citations:sync-zotero)."';
    const links = status.links
      ? ` <a href="${escapeHtml(status.links.desktop)}">open in Zotero</a> · <a href="${escapeHtml(status.links.web)}" target="_blank" rel="noopener">web</a>`
      : "";
    return ` <span class="citation-source"${title}>${badge("Zotero", "ok")}`
      + `${status.citekey ? `<code>${escapeHtml(status.citekey)}</code>` : `<code>${escapeHtml(status.itemKey)}</code>`}`
      + `${status.itemType ? ` ${escapeHtml(status.itemType)}` : ""}${links}</span>`;
  }
  if (status.state === "unfiled") {
    return ` <span class="citation-source" title="A scholarly work the backfill has not filed in the Concept Clusters Zotero collection yet.">${badge("not in Zotero", "warn")}</span>`;
  }
  return ` <span class="citation-source" title="${escapeHtml(status.reason || "")}">${badge("inline only")}</span>`;
}

function renderCitationList(citations, statuses = null) {
  if (!Array.isArray(citations) || citations.length === 0) return "";
  const items = citations.map((citation, index) => {
    const bits = [citation.title, citation.author, citation.publisher, citation.year]
      .filter(Boolean).map(escapeHtml).join(", ");
    return `<li>${bits}${citation.url ? ` (${escapeHtml(citation.url)})` : ""}`
      + `${renderCitationSource(statuses?.[index])}</li>`;
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

function renderReferences(info, {
  always = false,
  hideLinksOverlappingCitations = false,
  citationSources = null
} = {}) {
  const object = info && typeof info === "object" && !Array.isArray(info) ? info : {};
  const parts = [];
  const links = hideLinksOverlappingCitations
    ? authoredLinksExcludingCitationUrls(info)
    : authoredLinks(info);
  const linkText = renderLinkList(links);
  if (linkText) parts.push(labeledLine("links", linkText));
  else if (always) parts.push(labeledLine("links", emptyValue()));
  const citations = renderCitationList(object.citations, citationSources);
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
function renderInfo(info, {
  alwaysShowReferences = false,
  hideLinksOverlappingCitations = false,
  citationSources = null
} = {}) {
  const parts = [];
  if (typeof info === "string") {
    parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info)}</p>`);
  } else if (info && typeof info === "object") {
    if (info.text) parts.push(`<p class="info-text"><span class="field-label">info:</span> ${escapeHtml(info.text)}</p>`);
  }
  parts.push(renderReferences(info, {
    always: alwaysShowReferences,
    hideLinksOverlappingCitations,
    citationSources
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
      ${bridge.conceptId ? badge(`concept: ${bridge.conceptId}`) : ""}
      ${bridge.direction ? badge(`direction: ${bridge.direction.kind}`) : ""}
    </p>
    ${renderWas(mark?.fields?.relationKind)}
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
    ${renderInfoEditors({
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
const LINK_FLAG_PREFIXES = ["wiki-link-", "web-link-"];

function renderFlags(flags, edit = null) {
  if (!Array.isArray(flags) || flags.length === 0) return "";
  const isLinkFlag = flag => typeof flag.id === "string"
    && LINK_FLAG_PREFIXES.some(prefix => flag.id.startsWith(prefix));
  const linkFlags = flags.filter(flag => flag.pageOnly && isLinkFlag(flag));
  const structuralNotes = flags.filter(flag => flag.pageOnly && !isLinkFlag(flag));
  const authoringFlags = flags.filter(flag => !flag.pageOnly);
  const items = authoringFlags.map(flag =>
    `<li>${escapeHtml(flag.message)}</li>`
  ).join("");
  const needsCanonical = authoringFlags.some(flag => flag.id === SAVE_TO_CANONICALIZE_FLAG_ID);
  const canonicalSave = needsCanonical && edit?.draftId
    ? `<form method="post" action="/admin/drafts/${encodeURIComponent(edit.draftId)}" class="canonical-save">
         <input type="hidden" name="expected_revision" value="${escapeHtml(String(edit.revision ?? ""))}">
         <input type="hidden" name="confirm" value="${SAVE_CANONICAL_CONFIRM}">
         <button type="submit">Save canonical form</button>
       </form>`
    : "";
  const structuralNoteBlock = structuralNotes.length
    ? `<details class="structural-notes">
         <summary>Structural note${structuralNotes.length === 1 ? "" : "s"} (${structuralNotes.length})</summary>
         <ul>${structuralNotes.map(flag => `<li>${escapeHtml(flag.message)}</li>`).join("")}</ul>
         <p class="meta">These optional observations appear only on this review page; they are not validation failures or MCP flags.</p>
       </details>`
    : "";
  const authoringFlagBlock = authoringFlags.length
    ? `<div class="validation validation-flags">
         <p>⚑ ${authoringFlags.length} authoring flag${authoringFlags.length === 1 ? "" : "s"} -- worth a look, not necessarily a problem:</p>
         <ul>${items}</ul>
         ${canonicalSave}
       </div>`
    : "";
  // Link problems are shown open, not folded into the structural notes: a
  // missing article or a disambiguation page is a defect the player will
  // hit, and a redirect is a one-line fix worth seeing once.
  const linkFlagBlock = linkFlags.length
    ? `<div class="validation validation-flags validation-links">
         <p>🔗 ${linkFlags.length} link${linkFlags.length === 1 ? "" : "s"} to look at (checked live for this page; not an MCP flag):</p>
         <ul>${linkFlags.map(flag => `<li>${escapeHtml(flag.message)}</li>`).join("")}</ul>
       </div>`
    : "";
  return `${authoringFlagBlock}${linkFlagBlock}${structuralNoteBlock}`;
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
  .layout-chips { white-space: nowrap; }
  .layout-chip { margin-right: 2px; padding: 2px 6px; }
  .layout-chip-author { background: #dcfce7; }
  .layout-chip-auto { background: #dbeafe; }
  .layout-chip-none { background: #eee; color: #666; }
  .layout-chip-repair { box-shadow: inset 0 0 0 1.5px #dc2626; color: #991b1b; font-weight: 600; }
  .corpus-pending { border-left: 3px solid #94a3b8; padding-left: 10px; }
  .corpus-pending h2 { color: #475569; }
  .layout-auto-pass { background: transparent; box-shadow: inset 0 0 0 1px #94a3b8; color: #475569; white-space: nowrap; }
  .layout-auto-pass[data-auto-layout="done"] { box-shadow: inset 0 0 0 1px #2563eb; color: #1d4ed8; }
  .layout-auto-pass[data-auto-layout="failed"] { box-shadow: inset 0 0 0 1px #dc2626; color: #991b1b; }
  .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
  .validation-ok { background: #dcfce7; }
  .validation-fail { background: #fee2e2; }
  .validation-unknown { background: #fef9c3; }
  .validation-flags { background: #fef3c7; }
  .validation-links { background: #e0f2fe; }
  .validation-flags ul { margin: 4px 0 0; }
  .validation-flags .canonical-save { margin-top: 10px; }
  .structural-notes { color: #555; font-size: 14px; margin: 16px 0; }
  .structural-notes summary { color: #555; cursor: pointer; }
  .structural-notes ul { margin: 8px 0; }
  .structural-notes .meta { margin: 8px 0 0; }
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
  .citation-source { font-size: 12px; white-space: nowrap; }
  .citation-source code { margin-right: 4px; }
  .connects { font-weight: 600; }
  pre.learning-content { white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; }
  details.raw { margin-top: 32px; }
  details.raw pre { white-space: pre-wrap; font-size: 12px; background: #fafafa; padding: 12px; border-radius: 6px; overflow-x: auto; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  td, th { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
  .submit-pr { border: 1px solid #dbeafe; background: #f8fbff; border-radius: 6px; padding: 12px 16px; margin: 20px 0 28px; }
  .submit-pr h2 { margin: 0 0 8px; font-size: 18px; }
  .submit-pr fieldset.lesson-choice { border: 0; margin: 8px 0 0; padding: 0; }
  .submit-pr fieldset.lesson-choice legend { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.03em; padding: 0; }
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
  classification-editor { display: block; }
  .secondary-categories {
    border: 1px solid #e5e5e5; border-radius: 6px; padding: 6px 10px 8px; margin: 8px 0;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2px 12px;
  }
  .secondary-categories legend { font-size: 12px; color: #666; padding: 0 4px; }
  .secondary-category { font-size: 13px; display: flex; align-items: center; gap: 6px; }
  .secondary-category.is-primary { color: #999; }
  .subcategory-rows label { display: block; margin: 4px 0; }
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
  .provenance-client-row { margin: 8px 0; }
  provenance-clients { display: block; }
  .provenance-override .inline-edit button.provenance-use-last {
    padding: 3px 10px; border-radius: 999px; border: 1px solid #93c5fd;
    background: #eff6ff; color: #1d4ed8; font-size: 0.9em;
  }
  .provenance-host {
    display: inline-block;
    min-width: 5.5em;
    color: #1a1a1a;
    font-weight: 600;
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
  .review-note { white-space: pre-wrap; }
  .review-issues-form textarea {
    display: block; width: 100%; min-height: 8em; box-sizing: border-box;
    font: inherit; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 8px 0;
  }
  .review-issues-form select { font: inherit; padding: 6px 8px; margin-left: 6px; }
`;

// Publish sends the saved working copy, not this page's unsaved edits. The
// working-copy form (and every field tied to it with form=) is snapshotted
// once the page has loaded; publishing with a changed form asks first.
const PUBLISH_UNSAVED_GUARD_SCRIPT = `(() => {
  const form = document.getElementById(${JSON.stringify(WORKING_COPY_FORM_ID)});
  const publish = document.querySelector("form[data-publish-guard]");
  if (!form || !publish) return;
  const snapshot = () => JSON.stringify([...new FormData(form)].filter(([, value]) => typeof value === "string"));
  let saved = null;
  addEventListener("load", () => { saved = snapshot(); });
  publish.addEventListener("submit", event => {
    if (saved === null || snapshot() === saved) return;
    if (!confirm("This page has edits that are not saved to the working copy, and publishing leaves them out. Publish anyway? Cancel, then Save working copy, to include them.")) {
      event.preventDefault();
    }
  });
})();`;

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
<script>${CLASSIFICATION_EDITOR_SCRIPT}</script>
<script>${PROVENANCE_LAST_USED_SCRIPT}</script>
<script>${PUBLISH_UNSAVED_GUARD_SCRIPT}</script>
</body>
</html>`;
}

// `inGithubProduction` is null when there is no snapshot (Refresh from
// GitHub / Freeze has not written one yet, or the hosted GitHub fetch
// failed). It describes membership in the static snapshot, independently
// of publication in D1 and availability to public play.
function renderGithubSnapshotStatus(inGithubProduction) {
  if (inGithubProduction === null || inGithubProduction === undefined) return "";
  return inGithubProduction
    ? '<span class="badge badge-ok">in GitHub snapshot</span>'
    : '<span class="badge">not in GitHub snapshot</span>';
}

// A shadow working copy is otherwise indistinguishable from a legitimate one
// in this list: same id, same "published" row, same working-copy badge.
// That invisibility is what let one sit unnoticed beside a finished board.
const SHADOW_BADGE = '<span class="badge badge-warn" title="Almost none of the published puzzle survives in this working copy: it is a separate document under the same id, not an edit of the live board. Publishing it would replace the live puzzle.">shadow</span>';

function renderPendingReviewBadge(count) {
  if (!(count > 0)) return "";
  const label = count === 1 ? "review pending" : `${count} reviews pending`;
  return ` <span class="badge badge-warn" title="Agent review proposals are pending changes to the working copy. Open the puzzle to accept, reject, or defer them.">${label}</span>`;
}

function renderPuzzlePathBadges(item, { detail = false } = {}) {
  // Computed before the withdrawn branch returns: a withdrawn row's id is
  // still spoken for (puzzleIdIsLive treats it as live), so a shadow over one
  // is exactly as worth flagging as a shadow over a live row.
  const shadow = item.shadowsPublished === true ? ` ${SHADOW_BADGE}` : "";
  if (item.withdrawn === true || item.d1Withdrawn === true) {
    return `<span class="badge">withdrawn</span>${shadow}`;
  }
  const published = item.published === true || item.d1Published === true;
  if (published) {
    const unpublished = detail && hasUnpublishedChanges(item)
      ? ' <span class="badge badge-warn">unpublished changes</span>'
      : "";
    const lag = item.replicaPending
      ? ' <span class="badge badge-warn" title="On the LAN. Not yet on the public site.">not on the public site</span>'
      : "";
    return `<span class="badge badge-ok">published</span> ${renderPublishedFreezeBadges(item)}${lag}${unpublished}${shadow}`.trim();
  }
  const hasWorkingCopy = item.hasWorkingCopy === true
    || (detail && Boolean(item.draftId || item.status || item.document));
  if (hasWorkingCopy || detail) {
    return `<span class="badge badge-warn">working copy</span>${shadow}`;
  }
  if (item.inGit) return '<span class="badge">git snapshot only</span>';
  return "";
}

function listIntro(variant) {
  const snapshotSource = variant === "local"
    ? `The GitHub snapshot column is origin’s <code>puzzles/index.js</code>
       joined with the last freeze patch (assuming it merges).
       Refresh from GitHub on Admin updates that column.`
    : `The GitHub snapshot column is origin’s <code>puzzles/index.js</code>.`;
  const playHelp = variant === "local"
    ? `New puzzle opens a blank board. Play opens the working-copy preview.
       Layout opens layout authoring with the board settings. Catalogues are edited at
       <a href="/admin/catalogues">/admin/catalogues</a>.`
    : `Play unpublished working copies on the LAN authoring checkout.`;
  return `Publish makes the D1 snapshot available to public play after the
       cache refreshes. Cue and Freeze refresh the static copy in git.
       Published puzzles remain available when they are not cued for freeze.
       ${snapshotSource}
       Show <strong>Working copies</strong> selects unpublished puzzles.
       <strong>Not in GitHub</strong> selects ids absent from that snapshot;
       they may already be published in D1. <strong>Modified</strong> selects
       working copies of unpublished puzzles and published snapshots changed
       since the last Freeze. <strong>Unpublished changes</strong> selects saved
       working copies that differ from their published D1 snapshot, including
       content, classification, pedagogy, admin settings, provenance, or layout.
       Badges in the Unpublished Changes column identify the changed domains. <strong>Cued</strong>
       selects explicit freeze cues. <strong>Review pending</strong> selects
       puzzles with agent review proposals waiting for a decision.
       <strong>Published only</strong> selects published puzzles with no private
       working copy. By category browses the corpus; Recent groups working
       copies by last update. Open a row to edit its working copy, creating
       one from the published snapshot if needed. ${playHelp}`;
}

function renderGithubRefreshForm(snapshot) {
  const hasSnapshot = Array.isArray(snapshot?.ids) && snapshot.ids.length;
  const status = hasSnapshot
    ? `GitHub snapshot column from <code>${escapeHtml(snapshot.ref || "origin")}</code>
       (${snapshot.ids.length} id${snapshot.ids.length === 1 ? "" : "s"})${
         snapshot.fetchedAt ? `, fetched ${escapeHtml(snapshot.fetchedAt)}` : ""
       }.`
    : `GitHub snapshot column is empty until you fetch origin. Freeze is not required.`;
  return `<section class="submit-pr">
    <p class="meta">${status}</p>
    <div class="actions">
      <form method="post" action="/admin">
        <button type="submit" name="confirm" value="${GITHUB_REFRESH_CONFIRM}" class="secondary">Refresh GitHub snapshot column</button>
      </form>
    </div>
  </section>`;
}

function categoryIsRegistered(name, categoryRegistry) {
  const metadata = categoryRegistry?.[name];
  return !!metadata && metadata.registered !== false && metadata.inferred !== true;
}

function registeredCategoryNames(categoryRegistry) {
  return Object.keys(categoryRegistry || {})
    .filter(name => categoryIsRegistered(name, categoryRegistry))
    .sort((left, right) => left.localeCompare(right));
}

function categoryNamesForDocument(document, categoryRegistry) {
  return [...new Set([
    primaryCategoryForPuzzle(document, categoryRegistry),
    ...(Array.isArray(document?.categories) ? document.categories : [])
  ].map(value => categoryTitleFor(value, categoryRegistry)).filter(Boolean))];
}

function categoryChoiceLabel(name, categoryRegistry) {
  return categoryIsRegistered(name, categoryRegistry)
    ? name
    : `${name} (not registered)`;
}

function renderNewPuzzleForm(categoryRegistry = CATEGORIES) {
  const options = registeredCategoryNames(categoryRegistry).map(name =>
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

// Show-scope predicates live in puzzleCorpusStatus.js. A published row
// carries the freeze flags from contentFreezePlan.js: gitSeedCue means the
// published snapshot is exactly what the last Freeze shipped (no freeze
// badge); otherwise it is uncued, cued, or new to git -- all "modified since
// the last freeze". An unpublished working copy is modified too.

const UNPUBLISHED_DOMAIN_LABELS = {
  content: "Content",
  classification: "Classification",
  pedagogy: "Pedagogy",
  administration: "Admin",
  provenance: "Provenance",
  layout: "Layout"
};

function renderUnpublishedDomains(item) {
  if (!isPublishedLive(item)) return emptyValue();
  const domains = item.unpublishedChangeDomains || [];
  return Object.entries(UNPUBLISHED_DOMAIN_LABELS)
    .filter(([domain]) => domains.includes(domain))
    .map(([domain, label]) => `<span class="badge badge-warn" data-change-domain="${domain}" title="${label} differs from the published D1 snapshot">${label}</span>`)
    .join(" ") || emptyValue();
}

// One chip per mode, in mode-button order (Graph, Star, Circle). Colour is
// who made the saved layout (author or the automatic pass); the text is how
// the board uses it: fixed positions or a hint. Star layouts are always
// fixed, adapted to the board when they no longer match. "–" means nothing
// is saved, so the board runs live search. Rows describe the working copy
// when there is one.
const LAYOUT_CHIP_MODES = [
  ["graph", "G", "Graph"],
  ["star", "S", "Star"],
  ["sets", "C", "Circle"]
];

function savedLayoutModes(item) {
  // Normalize once per row; layoutForMode would normalize again per mode.
  const layout = normalizeLayoutDocument(item.savedLayout || null);
  return LAYOUT_CHIP_MODES.map(([mode, letter, name]) => {
    const saved = layout?.modes?.[mode] || null;
    if (!saved) return { mode, letter, name, saved: null };
    const source = layoutSource(saved);
    const use = mode === "star" || layoutIsFixed(saved) ? "fixed" : "hint";
    return { mode, letter, name, saved: { source, use }, repair: repairReason(mode, use, item.layoutAttention?.[mode]) };
  });
}

const DEFECT_LABELS = {
  lineCrossings: ["line crossing", "line crossings"],
  edgeNodeIntersections: ["line through a pill", "lines through pills"],
  edgeTitleIntersections: ["line through a title", "lines through titles"],
  edgeIntersections: ["line through a pill or title", "lines through pills or titles"],
  lineHeadingIntersections: ["line through a heading", "lines through headings"],
  lineCircleIntersections: ["line through a circle", "lines through circles"],
  hardOverlaps: ["overlap", "overlaps"],
  boundsViolations: ["item too close to the board edge", "items too close to the board edge"],
  overlaps: ["overlap", "overlaps"]
};

// Why a saved layout needs a person, or null. An outdated fixed layout's
// saved metrics no longer describe the board players get, so staleness is
// the whole reason then. A hint's metrics describe its starting point, not
// the board searched from it.
function repairReason(mode, use, attention) {
  if (!attention) return null;
  if (attention.stale) {
    const fallback = mode === "star" ? "adapted" : "as a hint";
    return `the puzzle or board size changed since it was saved; players get it ${fallback}, unchecked`;
  }
  const defects = attention.defects || {};
  if (!(defects.total > 0)) return null;
  const listed = Object.entries(defects)
    .filter(([key]) => key !== "total" && DEFECT_LABELS[key])
    .map(([key, count]) => `${count} ${DEFECT_LABELS[key][count === 1 ? 0 : 1]}`)
    .join(", ");
  return use === "hint"
    ? `its saved starting point had ${listed}; players get a fresh search from it`
    : `${listed} when saved`;
}

function renderSavedLayouts(modes) {
  return `<span class="layout-chips">${modes.map(({ mode, letter, name, saved, repair }) => {
    if (!saved) {
      return `<span class="badge layout-chip layout-chip-none" data-layout-mode="${mode}" data-layout-source="none" title="${name}: no saved layout (live search)">${letter} –</span>`;
    }
    const who = saved.source === "auto" ? "the automatic layout pass" : "an author";
    const how = saved.use === "hint" ? "used as a hint" : "fixed positions";
    const repairClass = repair ? " layout-chip-repair" : "";
    const repairAttr = repair ? ` data-layout-repair="1"` : "";
    const repairNote = repair ? `. Needs repair: ${repair}` : "";
    return `<span class="badge layout-chip layout-chip-${saved.source}${repairClass}" data-layout-mode="${mode}" data-layout-source="${saved.source}" data-layout-use="${saved.use}"${repairAttr} title="${escapeHtml(`${name}: saved by ${who}, ${how}${repairNote}`)}">${letter} ${saved.use}${repair ? " !" : ""}</span>`;
  }).join("")}</span>`;
}

const AUTO_LAYOUT_MODE_NAMES = { graph: "Graph", sets: "Circle", star: "Star" };
const formatWhen = iso => {
  const time = Date.parse(iso || "");
  return Number.isFinite(time) ? new Date(time).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "";
};

// The automatic layout pass's marker after the mode chips, on working copies
// the pass is watching (autoLayoutWatcher.js).
function renderAutoLayoutBadge(status) {
  if (!status) return "";
  const { state } = status;
  let mark, title;
  if (state === "running") {
    mark = "▶";
    title = `Automatic layout pass running since ${formatWhen(status.since)}`;
  } else if (state === "pending") {
    mark = "…";
    title = `Board changed since the last automatic layout pass; it runs once the board has settled${status.expectedAt ? `, from about ${formatWhen(status.expectedAt)}` : ""}`;
  } else if (state === "done") {
    mark = "✓";
    const modes = Object.entries(status.defects || {})
      .map(([mode, total]) => `${AUTO_LAYOUT_MODE_NAMES[mode] || mode} ${total === 0 ? "clean" : total == null ? "kept" : `${total} problem${total === 1 ? "" : "s"}`}`);
    title = `Automatic layout pass finished ${formatWhen(status.at)} on the current board${modes.length ? `: ${modes.join(", ")}` : ""}`;
  } else {
    mark = "✗";
    title = `Automatic layout pass failed ${formatWhen(status.at)}: ${status.error || "unknown error"}. It runs again when the board changes, or use Run layout pass.`;
  }
  return ` <span class="badge layout-chip layout-auto-pass" data-auto-layout="${state}" title="${escapeHtml(title)}">auto ${mark}</span>`;
}

// Layout work: a mode to fix, an automatic pass still to come or failed, or
// one finished on layouts not yet published, waiting for a person to look.
// Publishing ends the last; the others end when the layouts are sound.
function autoLayoutNeedsLook(item) {
  const state = item.autoLayout?.state;
  if (!state) return false;
  if (state !== "done") return true;
  return !isPublishedLive(item)
    || (item.unpublishedChangeDomains || []).includes("layout")
    || item.layoutDiffersFromPublished === true;
}

function isCuedStatus(item) {
  return isPublishedLive(item) && item.cuedForFreeze === true;
}

function isModifiedStatus(item) {
  if (isWorkingCopyStatus(item)) return true;
  return isPublishedLive(item) && item.gitSeedCue !== true;
}

function githubProductionAttr(inGithubProduction) {
  if (inGithubProduction === true) return "1";
  if (inGithubProduction === false) return "0";
  return "";
}

function normalizeCorpusItem(item, categoryRegistry = CATEGORIES) {
  const id = item.id || item.puzzleId || item.draftId;
  const hasWorkingCopy = item.hasWorkingCopy === true
    || (item.hasWorkingCopy !== false && Boolean(item.draftId || item.status));
  const subcategories = item.subcategories ?? item.document?.subcategories ?? null;
  const primary = item.category || item.document?.category || "Uncategorized";
  const categories = item.categories ?? item.document?.categories ?? null;
  return {
    ...item,
    id,
    draftId: item.draftId || (hasWorkingCopy ? id : null),
    title: item.title || id,
    category: categoryTitleFor(primary, categoryRegistry),
    categories,
    secondaryCategoryLabels: secondaryCategoryLabels(primary, categories, categoryRegistry),
    subcategories,
    subcategoryLabels: subcategoryLabels(subcategories, categoryRegistry),
    hasWorkingCopy,
    published: item.published === true || item.d1Published === true,
    withdrawn: item.withdrawn === true || item.d1Withdrawn === true,
    inGit: item.inGit === true
  };
}

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
    .filter(item => !item.hasWorkingCopy && isPublishedLive(item))
    .sort((left, right) => String(left.title).localeCompare(String(right.title)));
}

function corpusTableHead(variant, { includeCategory = false } = {}) {
  const playColumn = variant === "local" ? "<th>Play</th>" : "";
  const layoutsColumn = variant === "local"
    ? `<th title="Saved layout per mode. Green: author. Blue: automatic pass. Grey –: none (live search). Red outline and !: needs repair (see the chip's tooltip).">Layouts</th>`
    : "";
  const categoryColumn = includeCategory ? "<th>Category</th>" : "";
  return `<thead><tr><th>Title</th><th>Id</th>${categoryColumn}<th>Secondary categories</th><th>Subcategories</th><th>Status</th><th>Unpublished Changes</th>${layoutsColumn}<th>GitHub snapshot</th>${playColumn}<th>Updated</th></tr></thead>`;
}

function renderCorpusRow(item, variant, { includeCategory = false } = {}) {
  const hrefId = item.draftId || item.id;
  const playCell = renderCorpusPlayCell(item, variant);
  const subcategoryText = item.subcategoryLabels?.length
    ? item.subcategoryLabels.join("; ")
    : "(none)";
  const filter = [
    item.title,
    item.id,
    item.draftId,
    item.category,
    ...(item.secondaryCategoryLabels || []),
    ...item.subcategoryLabels
  ].filter(Boolean).join(" ");
  const categoryCell = includeCategory
    ? `<td>${escapeHtml(item.category || "")}</td>`
    : "";
  const secondaryCategoryCell = item.secondaryCategoryLabels?.length
    ? escapeHtml(item.secondaryCategoryLabels.join(", "))
    : emptyValue();
  const subcategoryCell = item.subcategoryLabels?.length
    ? escapeHtml(subcategoryText)
    : emptyValue();
  const local = variant === "local";
  const layoutModes = local ? savedLayoutModes(item) : [];
  const layoutsCell = local ? `<td>${renderSavedLayouts(layoutModes)}${renderAutoLayoutBadge(item.autoLayout)}</td>` : "";
  const layoutToFix = layoutModes.some(entry => !entry.saved || entry.repair) ? "1" : "0";
  const layoutWork = layoutToFix === "1" || autoLayoutNeedsLook(item) ? "1" : "0";
  return `<tr data-puzzle-id="${escapeHtml(item.id)}" data-draft-id="${escapeHtml(item.draftId || "")}" data-has-draft="${item.hasWorkingCopy ? "1" : "0"}" data-working-copy="${isWorkingCopyStatus(item) ? "1" : "0"}" data-published-live="${isPublishedLive(item) ? "1" : "0"}" data-modified="${isModifiedStatus(item) ? "1" : "0"}" data-unpublished-changes="${hasUnpublishedChanges(item) ? "1" : "0"}" data-cued="${isCuedStatus(item) ? "1" : "0"}" data-layout-fix="${layoutToFix}" data-layout-work="${layoutWork}" data-auto-pending="${["pending", "running"].includes(item.autoLayout?.state) ? "1" : "0"}" data-review-pending="${item.pendingReviewCount > 0 ? "1" : "0"}" data-github="${githubProductionAttr(item.inGithubProduction)}" data-updated-at="${escapeHtml(item.updatedAt || "")}" data-filter="${escapeHtml(filter)}">
    <td><a href="/admin/drafts/${encodeURIComponent(hrefId)}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    ${categoryCell}
    <td>${secondaryCategoryCell}</td>
    <td>${subcategoryCell}</td>
    <td>${renderPuzzlePathBadges(item)}${renderPendingReviewBadge(item.pendingReviewCount)}</td>
    <td>${renderUnpublishedDomains(item)}</td>
    ${layoutsCell}
    <td>${renderGithubSnapshotStatus(item.inGithubProduction)}</td>
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

// Layout work's Pending section, at the top of each arrangement: working
// copies whose automatic layout pass has not finished. The filter script
// moves their rows in while Layout work is shown, and back afterwards.
function renderPendingSection(variant, { includeCategory = false } = {}) {
  if (variant !== "local") return "";
  return `<section class="corpus-group corpus-pending" data-pending-section hidden>
      <h2>Pending</h2>
      <p class="meta"><span data-pending-count></span> · automatic layout pass not finished yet; reload to see progress</p>
      <table>
        ${corpusTableHead(variant, { includeCategory })}
        <tbody></tbody>
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
      return `<td><a href="${escapeHtml(draftPlayQuery(item.draftId))}">Play</a>
        · <a href="${escapeHtml(layoutQuery(item.draftId))}">Layout</a></td>`;
    }
    if (item.published && item.id) {
      return `<td><a href="${escapeHtml(playQuery(item.id))}">Play</a>
        · <a href="${escapeHtml(layoutQuery(item.id))}">Layout</a></td>`;
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
    var next = arrange === "category" ? "#category" : "";
    if ((location.hash || "") === next) return;
    history.replaceState(null, "", location.pathname + location.search + next);
  }
  // Under Layout work, rows whose automatic pass has not finished move into
  // their arrangement's Pending section, newest first; a placeholder keeps
  // each row's own place for when another filter is chosen.
  function placePending(pendingShown) {
    root.querySelectorAll("tr[data-auto-pending='1']").forEach(function (row) {
      if (pendingShown && !row.__placeholder) {
        var section = row.closest(".corpus-arrangement").querySelector("[data-pending-section] tbody");
        row.__placeholder = document.createComment("pending row");
        row.parentNode.insertBefore(row.__placeholder, row);
        section.appendChild(row);
      } else if (!pendingShown && row.__placeholder) {
        row.__placeholder.parentNode.replaceChild(row, row.__placeholder);
        row.__placeholder = null;
      }
    });
    root.querySelectorAll("[data-pending-section] tbody").forEach(function (body) {
      Array.prototype.slice.call(body.children)
        .sort(function (a, b) {
          return (b.getAttribute("data-updated-at") || "").localeCompare(a.getAttribute("data-updated-at") || "");
        })
        .forEach(function (row) { body.appendChild(row); });
    });
  }
  function apply() {
    var query = ((search && search.value) || "").trim().toLowerCase();
    var scope = selectedValue("puzzle-corpus-scope", "all");
    var arrange = selectedValue("puzzle-corpus-arrange", "recent");
    if (byCategory) byCategory.hidden = arrange !== "category";
    if (byRecent) byRecent.hidden = arrange !== "recent";
    syncHash(arrange);
    placePending(scope === "layouts");
    root.querySelectorAll("tr[data-puzzle-id]").forEach(function (row) {
      var hay = (row.getAttribute("data-filter") || "").toLowerCase();
      var hasDraft = row.getAttribute("data-has-draft") === "1";
      var working = row.getAttribute("data-working-copy") === "1";
      var publishedLive = row.getAttribute("data-published-live") === "1";
      var modified = row.getAttribute("data-modified") === "1";
      var unpublished = row.getAttribute("data-unpublished-changes") === "1";
      var cued = row.getAttribute("data-cued") === "1";
      var layoutWork = row.getAttribute("data-layout-work") === "1";
      var reviewPending = row.getAttribute("data-review-pending") === "1";
      var github = row.getAttribute("data-github");
      var matchQuery = !query || hay.indexOf(query) !== -1;
      var matchScope = scope === "all"
        || (scope === "working" && working)
        || (scope === "drafts" && github === "0")
        || (scope === "modified" && modified)
        || (scope === "unpublished" && unpublished)
        || (scope === "cued" && cued)
        || (scope === "layouts" && layoutWork)
        || (scope === "review" && reviewPending)
        || (scope === "published" && publishedLive && !hasDraft);
      row.hidden = !(matchQuery && matchScope);
    });
    root.querySelectorAll(".corpus-group").forEach(function (group) {
      var shown = group.querySelectorAll("tr[data-puzzle-id]:not([hidden])").length;
      group.hidden = shown === 0;
      // Counts follow the filter, and Pending's moved rows.
      var count = group.querySelector("[data-pending-count]") || group.querySelector(":scope > p.meta");
      if (count) count.textContent = shown + (shown === 1 ? " puzzle" : " puzzles");
    });
  }
  if (location.hash === "#category") setArrange("category");
  if (search) search.addEventListener("input", apply);
  scopeRadios.forEach(function (radio) { radio.addEventListener("change", apply); });
  arrangeRadios.forEach(function (radio) { radio.addEventListener("change", apply); });
  window.addEventListener("hashchange", function () {
    setArrange(location.hash === "#category" ? "category" : "recent");
    apply();
  });
  apply();
})();
`;

/**
 * @param {object[]} rows
 * @param {{
 *   variant?: string,
 *   githubProduction?: object | null,
 *   categoryRegistry?: Record<string, any>,
 *   notice?: object | null
 * }} [options]
 */
export function renderDraftListPage(rows, {
  variant = "hosted",
  githubProduction = null,
  categoryRegistry = CATEGORIES,
  notice = null
} = {}) {
  const items = (rows || []).map(item => normalizeCorpusItem(item, categoryRegistry));
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
  const recentInactive = renderCorpusGroup({
    title: "Unpublished without a working copy",
    rows: items.filter(item => !item.hasWorkingCopy && !isPublishedLive(item)),
    variant,
    includeCategory: true
  });
  const forms = variant === "local" ? renderNewPuzzleForm(categoryRegistry) : "";
  const githubRefresh = variant === "local" ? renderGithubRefreshForm(githubProduction) : "";
  const empty = items.length
    ? ""
    : "<p>No puzzles or working copies yet.</p>";
  const body = `<div class="puzzle-corpus">
       <h1>Puzzles</h1>
       ${renderPublicationNotice(notice)}
       <p class="meta">${authoringAdminNav()}</p>
       <p class="meta">${listIntro(variant)}</p>
       ${githubRefresh}
       <p class="meta">${items.length} puzzle${items.length === 1 ? "" : "s"}
         · ${workingCount} working cop${workingCount === 1 ? "y" : "ies"}${
           neverGithubCount
             ? ` · ${neverGithubCount} not in GitHub snapshot`
             : ""
         }</p>
       ${forms}
       <div class="corpus-toolbar">
         <p><label for="puzzle-corpus-search">Filter</label>
           <input id="puzzle-corpus-search" type="search" placeholder="Title, id, category, or subcategory"></p>
         <p class="corpus-scopes">
           <span class="corpus-scope-label">Show</span>
           <label><input type="radio" name="puzzle-corpus-scope" value="all" checked> All</label>
           <label title="No active D1 publication — an unpublished working copy"><input type="radio" name="puzzle-corpus-scope" value="working"> Working copies</label>
           <label title="Id absent from the GitHub snapshot; may already be published for public play"><input type="radio" name="puzzle-corpus-scope" value="drafts"> Not in GitHub</label>
           <label title="Unpublished puzzles or published snapshots changed since the last Freeze; this is a static snapshot status"><input type="radio" name="puzzle-corpus-scope" value="modified"> Modified</label>
           <label title="Saved content, board settings, provenance, or layout differs from the published D1 snapshot"><input type="radio" name="puzzle-corpus-scope" value="unpublished"> Unpublished changes</label>
           <label title="Published D1 snapshot explicitly cued for the next Freeze into git"><input type="radio" name="puzzle-corpus-scope" value="cued"> Cued</label>
           <label title="Agent review proposals waiting for a person to publish one or keep the published puzzle"><input type="radio" name="puzzle-corpus-scope" value="review"> Review pending</label>
           <label title="Published in D1 with no private working copy (the Published only group under Recent)"><input type="radio" name="puzzle-corpus-scope" value="published"> Published only</label>
           ${variant === "local" ? `<label title="Layouts that need a person: a mode with no saved layout or one that needs repair (! on its chip), an automatic layout pass still to come or failed (auto … ▶ ✗), or one finished on layouts not yet published (auto ✓). Newest first under Recent."><input type="radio" name="puzzle-corpus-scope" value="layouts"> Layout work</label>` : ""}
         </p>
         <p class="corpus-scopes">
           <span class="corpus-scope-label">Arrange</span>
           <label><input type="radio" name="puzzle-corpus-arrange" value="category"> By category</label>
           <label><input type="radio" name="puzzle-corpus-arrange" value="recent" checked> Recent</label>
         </p>
       </div>
       <div id="corpus-by-category" class="corpus-arrangement" hidden>${renderPendingSection(variant)}${categoryGroups}</div>
       <div id="corpus-by-recent" class="corpus-arrangement">${renderPendingSection(variant, { includeCategory: true })}${recentWorking}${recentPublished}${recentInactive}</div>
       ${empty}
     </div>
     <script>${CORPUS_FILTER_SCRIPT}</script>`;
  return pageShell("Puzzles", body);
}

function renderOpenBoardButton(draft) {
  const draftId = typeof draft.draftId === "string" ? draft.draftId : "";
  if (!draftId) return "";
  let href;
  try {
    href = draftBoardQuery(draftId);
  } catch {
    return "";
  }
  // New tab: copy edits on this page stay in the browser until Save working
  // copy, so leaving this document would drop them.
  return `<a class="play-button secondary" href="${escapeHtml(href)}" target="_blank" rel="noopener" data-draft-preview aria-disabled="true">Open board</a>`;
}

function renderPlayAction(draft, { valid }) {
  const draftId = typeof draft.draftId === "string" ? draft.draftId : "";
  if (!draftId) return "";
  let playHref;
  try {
    // Normal preview follows the current working copy. A revision-pinned URL
    // remains supported for diagnostics, but would make a refreshed Play tab
    // ignore an edit just saved in another tab.
    playHref = draftPlayQuery(draftId);
  } catch {
    return "";
  }
  const gate = ` data-draft-preview`;
  const board = renderOpenBoardButton(draft);
  // Layout view for this working copy, in a new tab like Open board: the
  // author comes back here to save the working copy and publish.
  const layout = `<a class="play-button secondary" href="${escapeHtml(layoutQuery(draftId))}" target="_blank" rel="noopener"${gate} aria-disabled="true">Layout</a>`;
  if (!valid) {
    return `${board}<button type="button" class="play-button" disabled>Play</button><button type="button" class="play-button secondary" disabled>Layout</button>`;
  }
  return `${board}<a class="play-button" href="${escapeHtml(playHref)}"${gate} aria-disabled="true">Play</a>${layout}`;
}

function renderDraftFreshness(draft, variant) {
  if (variant !== "local" || !draft?.draftId || !Number.isInteger(draft.revision)) return "";
  const id = escapeHtml(draft.draftId);
  const revision = Number(draft.revision);
  return `<p id="draft-freshness" class="meta" data-draft-id="${id}" data-revision="${revision}">Checking whether this is the latest revision…</p>
  <script>
  (() => {
    const status = document.getElementById("draft-freshness");
    if (!status) return;
    const expected = Number(status.dataset.revision);
    const links = [...document.querySelectorAll("[data-draft-preview]")];
    const setEnabled = enabled => links.forEach(link => {
      link.style.pointerEvents = enabled ? "" : "none";
      link.setAttribute("aria-disabled", String(!enabled));
      link.style.opacity = enabled ? "" : "0.55";
    });
    setEnabled(false);
    fetch("/admin/drafts/" + encodeURIComponent(status.dataset.draftId) + "/document.json", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(current => {
        if (current.revision === expected) {
          status.textContent = "You are viewing the latest revision (" + expected + ").";
          setEnabled(true);
        } else {
          status.textContent = "You are viewing revision " + expected + "; the latest is revision " + current.revision + ". Reload before playing.";
          const reload = document.createElement("button");
          reload.type = "button";
          reload.textContent = "Reload";
          reload.addEventListener("click", () => location.reload());
          status.append(" ", reload);
        }
      })
      .catch(() => { status.textContent = "Could not check whether a newer revision exists. Reload before playing."; });
  })();
  </script>`;
}

function submitHint(variant, { valid, alreadyPublished = false }) {
  if (!valid) {
    return `Fix validation errors on this page or through the authoring
       conversation before publishing.`;
  }
  if (alreadyPublished) {
    return `This working copy is the published D1 snapshot. Publish again after
       you edit. Cue for freeze marks the published snapshot for the next
       freeze into git. Clearing the cue keeps it published for public play.`;
  }
  if (variant === "local") {
    return `This page is for design copy. Open board opens
       <code>/?puzzle=</code> in a new tab, in Construct, and leaves this
       page as it is. Play is a clean player preview
       (<code>/?puzzle=&amp;play</code>). Layout opens layout authoring
       with the board settings in a new tab, so you can come back here to save
       and publish; the puzzle list has the same link beside Play.
       Publish makes the D1 snapshot available to public play after the cache
       refreshes. Cue for freeze marks it for the next static snapshot and
       returns to the list; Freeze on
       <a href="/admin">Admin</a> is the only thing that writes git.`;
  }
  return `This page is for design copy. Play unpublished boards on the LAN
     authoring checkout (<code>/?puzzle=</code>), not on Cloudflare. Publish
     makes the D1 snapshot available to public play after the cache refreshes.
     Cue for freeze marks it for the next static snapshot and returns to the
     list; Freeze on the LAN Admin page writes git. Hosted authoring
     has no git checkout.`;
}

function reviewClientSystem(event) {
  return typeof event?.clientSystem === "string" ? event.clientSystem.trim() : "";
}

function reviewClientName(event) {
  return typeof event?.clientName === "string" ? event.clientName.trim() : "";
}

// clientSystem is set only when the call frame matched a known agent.
// A raw clientInfo name such as "mcp-client" is the protocol default, not
// that agent, so it must not be shown as who reviewed.
function reviewCandidateLabel(event) {
  const system = reviewClientSystem(event);
  if (system) return system;
  if (reviewClientName(event)) return "Unidentified agent";
  return "Unnamed agent";
}

function unidentifiedClientPhrase(event) {
  const name = reviewClientSystem(event) ? "" : reviewClientName(event);
  return name ? `an unidentified agent's proposal (client name ${name})` : null;
}

function publishedWinnerPhrase(winnerSource, loserSource) {
  if (!winnerSource) return "Another proposal";
  const label = reviewCandidateLabel(winnerSource);
  const rawName = reviewClientSystem(winnerSource) ? "" : reviewClientName(winnerSource);
  const sameAgent = Boolean(loserSource)
    && reviewCandidateLabel(loserSource) === label
    && reviewClientName(loserSource) === reviewClientName(winnerSource);
  if (rawName) {
    const kind = sameAgent ? "other proposal" : "proposal";
    return `an unidentified agent's ${kind} (client name ${rawName})`;
  }
  return sameAgent ? `${label}'s other proposal` : `${label}'s proposal`;
}

function reviewActorLabel(event) {
  if (event?.reviewerKind === "human") return "human";
  const stamped = reviewCandidateLabel(event);
  return stamped === "Unnamed agent" ? "agent" : stamped;
}

function reviewChoiceCandidates(draft) {
  return (Array.isArray(draft.reviewCandidates) ? draft.reviewCandidates : [])
    .filter(event => event?.eventType === "proposed" && event.proposal);
}

function truncateReviewText(value, limit = 160) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function reviewItemLabel(item) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    return item.id || item.name || item.term || item.prompt || "item";
  }
  return "item";
}

function reviewCandidateLines(diff) {
  if (!diff) return [];
  const lines = [];
  for (const [name, change] of Object.entries(diff.fields || {})) {
    if (change?.after != null && typeof change.after !== "object") {
      lines.push(`${name}: ${truncateReviewText(change.after)}`);
    } else {
      lines.push(`${name} changed`);
    }
  }
  for (const [label, section] of [
    ["cluster", diff.clusters],
    ["bridge", diff.bridges],
    ["lens", diff.lenses]
  ]) {
    for (const key of section?.added || []) lines.push(`Added ${label} ${key}`);
    for (const item of section?.removed || []) lines.push(`Removed ${label} ${reviewItemLabel(item)}`);
    for (const [key, mark] of Object.entries(section?.changed || {})) {
      const fact = mark.fields?.fact;
      if (typeof fact?.after === "string") lines.push(`${key}: ${truncateReviewText(fact.after)}`);
      else lines.push(`${key} changed`);
    }
  }
  return lines;
}

function legacyAnchorFor(draft, event) {
  if (isReviewPatch(event?.proposal)) return draft.document;
  const revision = event?.basePublishedRevision;
  if (Number.isInteger(revision)) {
    if (draft.reviewBaseSnapshots?.[revision]) return draft.reviewBaseSnapshots[revision];
    if (draft.currentPublishedRevision === revision) {
      return draft.reviewAnchorDocument || draft.document;
    }
    return null;
  }
  return draft.reviewAnchorDocument || draft.document;
}

function changesForCandidate(draft, event) {
  const anchor = legacyAnchorFor(draft, event);
  if (!anchor) return [];
  return proposalChanges(event?.proposal, anchor);
}

function proposalPlayLink(draftId, event, variant, unresolvedLegacy) {
  if (variant !== "local" || unresolvedLegacy || !Number.isInteger(event?.id)) return "";
  let href;
  try {
    href = draftProposalPlayQuery(draftId, event.id);
  } catch {
    return "";
  }
  return `<a class="play-button" href="${escapeHtml(href)}" target="_blank" rel="noopener">Play</a>`;
}

function renderReviewChoice(draft, variant = "hosted") {
  const candidates = reviewChoiceCandidates(draft);
  if (!candidates.length) return "";
  const draftId = draft.draftId;
  const action = `/admin/drafts/${encodeURIComponent(draftId)}`;
  const expected = escapeHtml(String(draft.revision ?? ""));
  const cards = candidates.map(event => {
    const unresolvedLegacy = !isReviewPatch(event?.proposal)
      && Number.isInteger(event?.basePublishedRevision)
      && !legacyAnchorFor(draft, event);
    const predecessorOpen = candidates.some(item => item.id === event.proposal?.stacksOn);
    const changes = changesForCandidate(draft, event);
    const stale = new Set(staleReviewChanges(draft.document, changes).map(change => change.path));
    const shown = changes.slice(0, 8);
    const list = shown.length
      ? `<ul>${shown.map(change => {
          const mark = stale.has(change.path) ? ` <span class="badge badge-warn">stale</span>` : "";
          return `<li>${escapeHtml(reviewChangeSummary(change))}${mark}</li>`;
        }).join("")}</ul>`
      : `<p class="meta">No field changes in this proposal.</p>`;
    const more = changes.length > shown.length
      ? `<p class="meta">${changes.length - shown.length} more changes are in the proposal.</p>`
      : "";
    const staleNote = stale.size
      ? `<p class="validation-flags">The working copy has changed ${stale.size === 1 ? "a field" : "fields"} this proposal also changes. Accept shows those side by side.</p>`
      : "";
    const stacked = Number.isInteger(event.proposal?.stacksOn)
      ? predecessorOpen
        ? `<p class="meta">Builds on an earlier proposal. Accept that proposal before this one.</p>`
        : `<p class="meta">Builds on an earlier proposal.</p>`
      : "";
    const missingRevision = unresolvedLegacy
      ? `<p class="validation-flags">This proposal was filed against published revision ${escapeHtml(String(event.basePublishedRevision))}, which is no longer available.</p>`
      : "";
    const accept = predecessorOpen || unresolvedLegacy
      ? ""
      : `<button type="submit" name="confirm" value="accept-review">Accept</button>`;
    const play = proposalPlayLink(draftId, event, variant, unresolvedLegacy);
    const proposalId = escapeHtml(String(event.id));
    const rawName = reviewClientSystem(event) ? "" : reviewClientName(event);
    const heading = rawName
      ? `${reviewCandidateLabel(event)} (${rawName})`
      : reviewCandidateLabel(event);
    return `<article class="review-candidate">
      <h3>${escapeHtml(heading)}</h3>
      ${event.comments ? `<p class="review-note">${escapeHtml(event.comments)}</p>` : ""}
      ${stacked}
      ${missingRevision}
      ${staleNote}
      ${list}
      ${more}
      <form method="post" action="${action}">
        <input type="hidden" name="proposal_id" value="${proposalId}">
        <input type="hidden" name="expected_revision" value="${expected}">
        <div class="actions">
          ${play}
          ${accept}
          <button type="submit" name="confirm" value="reject-review" class="secondary">Reject</button>
          <a class="play-button secondary" href="#${WORKING_COPY_FORM_ID}">Defer</a>
        </div>
      </form>
    </article>`;
  }).join("\n");
  const playNote = variant === "local"
    ? " Play opens one proposal in a new tab and leaves the working copy as it is."
    : "";
  return `<section class="submit-pr">
    <h2>Pending proposals</h2>
    <p class="meta">These proposals are pending changes to the working copy. Accept applies one proposal's fields. Reject leaves the working copy as it is. Defer decides later. Two proposals on different fields can both be accepted. Publish warns while a proposal is still open.${playNote}</p>
    ${cards}
  </section>`;
}

function hiddenReviewFields(params) {
  return [...params.entries()]
    .filter(([key]) => key !== "acknowledge_review_overlap" && key !== "acknowledge_open_proposals")
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`)
    .join("\n");
}

export function renderReviewOverlapPage({ draftId, hits, params }) {
  const action = `/admin/drafts/${encodeURIComponent(draftId)}`;
  const items = (hits || []).map(hit => {
    const paths = (hit.paths || []).map(path => `<li>${escapeHtml(path)}</li>`).join("");
    return `<article class="review-candidate"><h3>${escapeHtml(reviewCandidateLabel(hit.event))}</h3><ul>${paths}</ul></article>`;
  }).join("");
  return pageShell("Decide on the proposal", `
    <p class="meta">${authoringAdminNav()}</p>
    <h1>This save changes a pending proposal</h1>
    <p>The fields below are also in an open proposal. Decide on that proposal first, or save anyway and leave the proposal stale.</p>
    ${items}
    <form method="post" action="${action}">
      ${hiddenReviewFields(params)}
      <input type="hidden" name="acknowledge_review_overlap" value="1">
      <div class="actions">
        <button type="submit">Save anyway</button>
        <a class="play-button secondary" href="${action}">Decide on the proposal first</a>
      </div>
    </form>`);
}

export function renderStaleReviewPage({
  draftId,
  proposalId,
  expectedRevision,
  stale,
  pendingCount = 0
}) {
  const action = `/admin/drafts/${encodeURIComponent(draftId)}`;
  const rows = (stale || []).map(change => `<li>
      <strong>${escapeHtml(change.path)}</strong>
      <p>Proposal started from: ${escapeHtml(formatReviewValue(change.before))}</p>
      <p>Proposal would set: ${escapeHtml(formatReviewValue(change.after))}</p>
      <p>Working copy now: ${escapeHtml(formatReviewValue(change.current))}</p>
    </li>`).join("");
  const rest = pendingCount > (stale || []).length
    ? `<p class="meta">The other ${pendingCount - stale.length} field${pendingCount - stale.length === 1 ? "" : "s"} in this proposal still match and will be applied too.</p>`
    : "";
  const id = escapeHtml(String(proposalId));
  const revision = escapeHtml(String(expectedRevision ?? ""));
  return pageShell("Proposal overlaps your edit", `
    <p class="meta">${authoringAdminNav()}</p>
    <h1>This proposal overlaps an edit</h1>
    <p>Accepting it applies the proposal's wording on these fields.</p>
    <ul>${rows}</ul>
    ${rest}
    <form method="post" action="${action}">
      <input type="hidden" name="confirm" value="accept-review">
      <input type="hidden" name="proposal_id" value="${id}">
      <input type="hidden" name="expected_revision" value="${revision}">
      <input type="hidden" name="confirm_stale" value="1">
      <div class="actions"><button type="submit">Apply the proposal's values</button></div>
    </form>
    <form method="post" action="${action}">
      <input type="hidden" name="confirm" value="reject-review">
      <input type="hidden" name="proposal_id" value="${id}">
      <input type="hidden" name="expected_revision" value="${revision}">
      <div class="actions"><button type="submit" class="secondary">Reject this proposal</button></div>
    </form>
    <p><a href="${action}">Back to the draft</a></p>`);
}

export function renderUndecidedProposalsPage({ draftId, proposals, params }) {
  const action = `/admin/drafts/${encodeURIComponent(draftId)}`;
  const items = (proposals || []).map(event =>
    `<li>${escapeHtml(reviewCandidateLabel(event))}${event.comments ? `: ${escapeHtml(event.comments)}` : ""}</li>`
  ).join("");
  return pageShell("Proposals still open", `
    <p class="meta">${authoringAdminNav()}</p>
    <h1>Proposals are still undecided</h1>
    <p>Publishing does not accept or reject them. A proposal whose fields this publish does not change stays applicable afterward.</p>
    <ul>${items}</ul>
    <form method="post" action="${action}">
      ${hiddenReviewFields(params)}
      <input type="hidden" name="acknowledge_open_proposals" value="1">
      <div class="actions"><button type="submit">Publish anyway</button></div>
    </form>
    <p><a href="${action}">Back to the draft</a></p>`);
}

// Board-limit waiver decisions, shown inside the Review section beside
// review issues: both are things about this puzzle awaiting a person.
function renderBoardLimitWaiverReview(draft) {
  const document = draft.document || {};
  const requests = draft.boardLimitWaiverRequests || [];
  const grants = Array.isArray(document.boardLimitWaivers)
    ? document.boardLimitWaivers.filter(grant => grant && typeof grant === "object" && !Array.isArray(grant))
    : [];
  const policies = boardLimitWaiverTypeSummaries();
  const targets = policies.flatMap(policy => boardLimitWaiverTargets(document, policy.type)
    .map(entry => ({ ...entry, policy })));
  const targetByKey = new Map(targets.map(entry => [`${entry.policy.type}\u0000${entry.targetId}`, entry]));
  const revision = escapeHtml(String(draft.revision ?? ""));
  const action = `/admin/drafts/${encodeURIComponent(draft.draftId)}`;
  const pending = requests.filter(request => request.status === "pending");
  const cards = pending.map(request => {
    const entry = targetByKey.get(`${request.waiverType}\u0000${request.targetId}`);
    const current = entry?.requestable && entry.value === request.count;
    return `<article class="review-candidate">
      <h3>${escapeHtml(entry?.targetLabel || request.targetId)} · ${escapeHtml(request.waiverType)}</h3>
      <p class="meta">Requested by ${escapeHtml(request.requestedBy || "author")} · ${escapeHtml(request.requestedAt || "")}</p>
      <p><strong>Requested size:</strong> ${escapeHtml(String(request.count))}</p>
      <p>${escapeHtml(request.reason)}</p>
      ${current ? "" : `<p class="validation-flags">The target's size changed after this request. Refresh and request review for the current board state.</p>`}
      <form method="post" action="${action}">
        <input type="hidden" name="expected_revision" value="${revision}">
        <input type="hidden" name="request_id" value="${escapeHtml(String(request.id))}">
        <label>Decision note <textarea name="decision_note" rows="2"></textarea></label>
        <div class="actions">
          ${current ? `<button type="submit" name="confirm" value="grant-board-limit-waiver">Grant waiver</button>` : ""}
          <button type="submit" name="confirm" value="decline-board-limit-waiver" class="secondary">Decline</button>
        </div>
      </form>
    </article>`;
  }).join("");
  const granted = grants.map(grant => {
    const entry = targetByKey.get(`${grant.waiverType}\u0000${grant.targetId}`);
    const active = entry && boardLimitWaiverMatches(document, entry.target, grant);
    return `<article class="review-candidate">
      <h3>${escapeHtml(entry?.targetLabel || grant.targetId)} · ${active ? "waiver active" : "unused grant"}</h3>
      <p><strong>Waiver:</strong> ${escapeHtml(grant.waiverType)}</p>
      <p><strong>Approved size:</strong> up to ${escapeHtml(String(grant.approvedCount))}</p>
      <p>${escapeHtml(grant.reason)}</p>
      <p class="meta">Granted by ${escapeHtml(grant.grantedBy)} · ${escapeHtml(grant.grantedAt)}</p>
      <form method="post" action="${action}">
        <input type="hidden" name="expected_revision" value="${revision}">
        <input type="hidden" name="waiver_type" value="${escapeHtml(grant.waiverType)}">
        <input type="hidden" name="target_id" value="${escapeHtml(grant.targetId)}">
        <label>Revocation note <textarea name="decision_note" rows="2"></textarea></label>
        <button type="submit" name="confirm" value="revoke-board-limit-waiver" class="secondary">Revoke waiver</button>
      </form>
    </article>`;
  }).join("");
  const direct = targets.filter(entry => entry.requestable &&
    !grants.some(grant => grant.waiverType === entry.policy.type &&
      grant.targetId === entry.targetId && boardLimitWaiverMatches(document, entry.target, grant)) &&
    !pending.some(request => request.waiverType === entry.policy.type &&
      request.targetId === entry.targetId && request.count === entry.value)
  ).map(entry => {
    return `<article class="review-candidate">
      <h3>${escapeHtml(entry.targetLabel)} · ${escapeHtml(entry.policy.label)}</h3>
      <p><strong>Current / ceiling:</strong> ${escapeHtml(String(entry.value))} / ${escapeHtml(String(entry.policy.approvedLimit))}</p>
      ${entry.target?.detail ? `<p>${escapeHtml(entry.target.detail)}</p>` : ""}
      <form method="post" action="${action}">
        <input type="hidden" name="expected_revision" value="${revision}">
        <input type="hidden" name="waiver_type" value="${escapeHtml(entry.policy.type)}">
        <input type="hidden" name="target_id" value="${escapeHtml(entry.targetId)}">
        <label>Reason for this waiver<textarea name="reason" rows="3" minlength="${escapeHtml(String(entry.policy.minimumReasonLength))}" required></textarea></label>
        <button type="submit" name="confirm" value="grant-board-limit-waiver">Grant waiver</button>
      </form>
    </article>`;
  }).join("");
  const closed = requests.filter(request => request.status !== "pending");
  const history = closed.length ? `<details><summary>Previous requests (${closed.length})</summary><ul>${closed.map(request =>
    `<li>${escapeHtml(request.status)} · ${escapeHtml(request.waiverType)} · ${escapeHtml(request.targetId)} · size ${escapeHtml(String(request.count))} · ${escapeHtml(request.reason)}${request.decisionNote ? ` · ${escapeHtml(request.decisionNote)}` : ""}</li>`
  ).join("")}</ul></details>` : "";
  // Requests that still describe the board; a stale one no longer blocks publishing.
  const blocking = pending.filter(request => {
    const entry = targetByKey.get(`${request.waiverType}\u0000${request.targetId}`);
    return entry?.requestable && entry.value === request.count &&
      !grants.some(grant => boardLimitWaiverMatches(document, entry.target, grant));
  }).length;
  if (!pending.length && !granted && !direct && !history) return { pending: 0, blocking: 0, html: "" };
  const supported = policies.map(policy =>
    `${escapeHtml(policy.label)}: ${escapeHtml(String(policy.normalLimit))} ordinary, ${escapeHtml(String(policy.approvedLimit))} by waiver`
  ).join("; ");
  return {
    pending: pending.length,
    blocking,
    html: `<h3>Board limits</h3>
    <p class="meta">${supported}. A waiver lets one target reach its approved size, whichever terms fill it. This board has ${puzzleNodeCount(document)} total nodes.</p>
    ${pending.length ? `<h4>Awaiting decision</h4>${cards}` : ""}
    ${direct ? `<h4>Grant a waiver</h4>${direct}` : ""}
    ${granted ? `<h4>Current grants</h4>${granted}` : ""}
    ${history}`
  };
}

function renderRevisedCheckbox(show, { hidden = false } = {}) {
  if (!show) return "";
  const hiddenAttr = hidden ? " hidden" : "";
  return `<p class="meta revised-mark"${hiddenAttr}><label><input type="checkbox" name="show_as_revised" value="1"> Show “${escapeHtml(revisedLessonLabel())}” on the lesson</label></p>`;
}

function renderSubmitForm(draft, variant = "hosted") {
  const draftId = draft.draftId;
  const valid = draft.validation?.valid === true;
  const d1Published = draft.d1Published === true && draft.d1Withdrawn !== true;
  const documentDiffersFromPublished = Number(draft.publishedDiff?.total) > 0;
  const layoutDiffersFromPublished = draft.layoutDiffersFromPublished === true;
  // Provenance is excluded from the field-level diff, so without this a
  // provenance-only edit counted as "already in authoring play" and Publish
  // was withheld, stranding the edit in the working copy.
  const provenanceDiffers = draft.provenanceDiffersFromPublished === true;
  const differsFromPublished = d1Published && (
    documentDiffersFromPublished || layoutDiffersFromPublished || provenanceDiffers
  );
  const alreadyPublished = d1Published && !differsFromPublished;
  const canPublish = valid && !alreadyPublished;
  const disabled = canPublish ? "" : " disabled";
  const hint = submitHint(variant, { valid, alreadyPublished });
  const playButton = variant === "local" ? renderPlayAction(draft, { valid }) : "";
  const choosingReview = reviewChoiceCandidates(draft).length > 0;
  const reviewOpenedDraft = !choosingReview && draft.openedFromPublished === true;
  const undoReview = !choosingReview && !reviewOpenedDraft && draft.hasReviewBaseline === true;
  const revert = !reviewOpenedDraft && !undoReview && !choosingReview && differsFromPublished
    ? `<button type="submit" name="confirm" value="revert-published" class="secondary">Revert to published</button>`
    : "";
  const revertWorking = !choosingReview && !reviewOpenedDraft && !undoReview && Number(draft.workingCopyHistoryCount) > 0
    ? `<button type="submit" name="confirm" value="revert-working-copy" class="secondary">Revert to last working copy</button>`
    : "";
  const discardReview = reviewOpenedDraft
    ? `<button type="submit" name="confirm" value="discard-review" class="secondary">Discard review</button>`
    : "";
  const undoReviewButton = undoReview
    ? `<button type="submit" name="confirm" value="undo-review" class="secondary">Undo review</button>`
    : "";
  const unpublish = d1Published
    ? `<button type="submit" name="confirm" value="unpublish" class="secondary">Unpublish</button>`
    : "";
  const workingMeta = [
    "Copy edits on this page stay in the browser until you Save working copy. Construct auto-saves board structure.",
    choosingReview
      ? "Open proposals are pending changes. Accept applies one. Saving a field a proposal also changes asks you to decide or to leave that proposal stale."
      : "",
    reviewOpenedDraft
      ? "This working copy was opened for review. Publish records the review as accepted. Discard review deletes the working copy and keeps the proposal on the review record."
      : "",
    undoReview
      ? "Undo review restores the draft from before this review and keeps the proposal on the review record."
      : "",
    !choosingReview && !reviewOpenedDraft && !undoReview && Number(draft.workingCopyHistoryCount) > 0
      ? "Revert to last working copy restores the previous save. Each click goes back one save."
      : "",
    !choosingReview && !reviewOpenedDraft && !undoReview && differsFromPublished
      ? `Revert to published restores the last D1 published document${layoutDiffersFromPublished ? " and layout" : ""}.`
      : "",
    d1Published
      ? "Unpublish withdraws the D1 snapshot from public play after the cache refreshes. Freeze later deletes the static files."
      : "",
    choosingReview ? "" : "Delete working copy removes only this draft."
  ].filter(Boolean).join(" ");
  const reviewIssues = Array.isArray(draft.reviewIssues) ? draft.reviewIssues : [];
  const openReviewIssues = reviewIssues.filter(issue => issue.status === "open");
  const reviewLink = `/admin/drafts/${encodeURIComponent(draftId)}/review-issues`;
  const waivers = renderBoardLimitWaiverReview(draft);
  const waiverCount = waivers.pending
    ? ` · ${waivers.pending} waiver request${waivers.pending === 1 ? "" : "s"} awaiting decision`
    : "";
  const reviewSummary = `<section class="submit-pr">
    <h2>Review</h2>
    <p class="meta">Agent review: ${escapeHtml(draft.lastAgentReviewedAt || "not recorded")} · Human review: ${escapeHtml(draft.lastHumanReviewedAt || "not recorded")} · ${openReviewIssues.length} open issue handoff${openReviewIssues.length === 1 ? "" : "s"}${waiverCount}.</p>
    <a class="play-button secondary" href="${reviewLink}">Review issues</a>
    ${waivers.html}
  </section>`;
  const proposals = renderReviewChoice(draft, variant);
  const publishSection = `<section class="submit-pr">
    <h2>Actions</h2>
    <p class="meta">${hint}${waivers.blocking
      ? ` ${waivers.blocking} board-limit waiver request${waivers.blocking === 1 ? " is" : "s are"} awaiting decision under Review; validation blocks publishing until ${waivers.blocking === 1 ? "it is" : "they are"} granted or the board is restructured.`
      : ""}</p>
    <div class="actions">
      ${playButton}
      <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}" data-publish-guard>
        ${renderRevisedCheckbox(canPublish && draft.playerTextDiffersFromPublished
          && revisedMarkChangesLessonLine(draft.firstPublishedAt))}
        <button type="submit" name="confirm" value="publish"${disabled}>Publish</button>
        <button type="submit" name="confirm" value="publish-and-cue" class="secondary"${disabled}
          title="Publish for public play and cue the snapshot for the next freeze into git.">Publish &amp; Cue</button>
      </form>
    </div>
  </section>`;
  const deleteWorkingCopy = choosingReview
    ? ""
    : `<button type="submit" name="confirm" value="delete-draft" class="secondary">Delete working copy</button>`;
  return `${proposals}
  ${publishSection}
  ${reviewSummary}
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
        ${undoReviewButton}
        ${discardReview}
        ${revertWorking}
        ${revert}
        ${unpublish}
        ${deleteWorkingCopy}
      </div>
    </form>
  </section>
  ${renderRenameDraftForm(draft)}`;
}

// Fixing a puzzle id is rare and human: an agent chose an over-long slug, or
// the title it was given was misspelled and the slug inherited the typo.
// Only offered before the puzzle is published, because an id that is live in
// public play or git is an identity other rows may point at.
//
// `puzzleIdIsLive` is the server's own answer to that question, computed with
// the same helper the rename POST uses, so the form is never offered for an
// id the POST would refuse. It counts withdrawn rows and git-only ids as
// live, which the page's own publication flags do not.
function renderRenameDraftForm(draft) {
  const draftId = draft.draftId;
  const currentId = typeof draft.document?.id === "string" ? draft.document.id : draftId;
  if (draft.puzzleIdIsLive === true
    || draft.d1Published === true
    || draft.inGithubProduction === true) {
    return `<section class="submit-pr">
      <h2>Puzzle id</h2>
      <p class="meta"><code>${escapeHtml(currentId)}</code> has been published, so other
        puzzles and catalogues may point at it. Its id cannot be renamed here,
        even after unpublishing. Changing it requires a migration.</p>
    </section>`;
  }
  return `<section class="submit-pr">
    <h2>Puzzle id</h2>
    <p class="meta">This puzzle has never been published, so its id can still
      change. The working copy moves to the new id and its saved-copy history
      is discarded, so Revert to last working copy will have nothing to go
      back to. Editing the title does not change the id.</p>
    <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
      <input type="hidden" name="confirm" value="${RENAME_DRAFT_CONFIRM}">
      <p><label>id <input name="new_id" required
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        value="${escapeHtml(currentId)}"></label></p>
      <div class="actions">
        <button type="submit" class="secondary">Rename puzzle</button>
      </div>
    </form>
  </section>`;
}

function reviewEventTimeOrder(left, right) {
  const byTime = String(left.reviewedAt || "").localeCompare(String(right.reviewedAt || ""));
  if (byTime) return byTime;
  return (Number(left.id) || 0) - (Number(right.id) || 0);
}

// A decision row carries no text of its own: what the agent did lives on the
// proposal it decided, so the row borrows that proposal's notes and diff.
function decisionEventDetail(event, publishedSnapshots, events = []) {
  const source = Number.isInteger(event.sourceEventId)
    ? events.find(item => item.id === event.sourceEventId)
    : null;
  const unidentified = source ? unidentifiedClientPhrase(source) : null;
  const candidate = unidentified || (source ? `${reviewCandidateLabel(source)}'s proposal` : null);
  const notes = source?.comments || null;
  const snapshot = revision => publishedSnapshots?.[revision] || null;
  if (event.eventType === "proposed") {
    const against = event.basePublishedRevision
      ? ` against published revision ${event.basePublishedRevision}`
      : "";
    return { summary: `Proposed by ${reviewCandidateLabel(event)}${against}.`, notes: null, diff: null };
  }
  if (event.eventType === "accepted") {
    const revision = event.publishedRevision;
    if (!Number.isInteger(revision)) {
      return {
        summary: candidate
          ? `Accepted ${candidate} onto the working copy.`
          : "Accepted onto the working copy.",
        notes,
        diff: null
      };
    }
    const before = snapshot(revision - 1);
    const after = snapshot(revision);
    return {
      summary: candidate
        ? `Accepted ${candidate} as published revision ${revision}.`
        : `Accepted as published revision ${revision}.`,
      notes,
      diff: before && after ? diffPublishedDraft(before, after) : null,
      diffLabel: `Changes from published revision ${revision - 1}`
    };
  }
  if (event.eventType !== "rejected") return null;
  if (isReviewPatch(event.proposal)) {
    const against = event.basePublishedRevision
      ? ` against published revision ${event.basePublishedRevision}`
      : "";
    return {
      summary: candidate
        ? `Rejected ${candidate}, kept${against}.`
        : `Rejected proposal kept${against}.`,
      notes,
      changes: event.proposal.changes,
      diff: null,
      diffLabel: "Proposed fields"
    };
  }
  const baseline = snapshot(event.basePublishedRevision);
  const diff = baseline && event.proposal
    ? diffPublishedDraft(baseline, event.proposal)
    : null;
  // Publish records the losing proposals in the same write as the winner, so
  // they share its timestamp. Only Keep published leaves the live revision
  // in place.
  const winner = events.find(item =>
    item.eventType === "accepted" && item.reviewedAt === event.reviewedAt);
  const winnerSource = winner && Number.isInteger(winner.sourceEventId)
    ? events.find(item => item.id === winner.sourceEventId)
    : null;
  const diffLabel = event.basePublishedRevision
    ? `Proposed changes to published revision ${event.basePublishedRevision}`
    : "Proposed changes";
  if (winner) {
    const chosen = publishedWinnerPhrase(winnerSource, source);
    return {
      summary: `Not chosen: ${chosen} was published as revision ${winner.publishedRevision}.`,
      notes,
      diff,
      diffLabel
    };
  }
  const against = event.basePublishedRevision
    ? ` against published revision ${event.basePublishedRevision}`
    : "";
  return {
    summary: candidate
      ? `Rejected ${candidate}, kept${against}.`
      : `Rejected proposal kept${against}.`,
    notes,
    diff,
    diffLabel
  };
}

function renderDecisionChanges(detail) {
  if (detail?.changes?.length) {
    const lines = detail.changes.map(change => reviewChangeSummary(change));
    return `<details class="review-note"><summary>${escapeHtml(detail.diffLabel || "Proposed fields")}: ${lines.length}</summary>
      <ul>${lines.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
    </details>`;
  }
  if (!detail?.diff) return "";
  const lines = reviewCandidateLines(detail.diff);
  if (!lines.length) return "";
  const { changed, added, removed } = detail.diff.counts;
  return `<details class="review-note"><summary>${escapeHtml(detail.diffLabel)}: ${changed} changed, ${added} added, ${removed} removed</summary>
    <ul>${lines.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
  </details>`;
}

export function renderPuzzleReviewIssuesPage({
  draft,
  issues = [],
  events = [],
  lastAgentReviewedAt = null,
  lastHumanReviewedAt = null,
  publishedSnapshots = null,
  chronicleOnly = false
}) {
  const draftId = draft.draftId;
  const action = `/admin/drafts/${encodeURIComponent(draftId)}/review-issues`;
  const issueEvents = issue => (issue.events || []).map(event => `<li><strong>${escapeHtml(reviewActorLabel(event))}</strong> · ${escapeHtml(event.reviewedAt)} · ${escapeHtml(event.eventType)}${event.draftRevision ? ` · draft revision ${escapeHtml(event.draftRevision)}` : ""}${event.comments ? `<p class="review-note">${escapeHtml(event.comments)}</p>` : ""}</li>`).join("");
  const issueRevisionEvidence = issue => {
    if (!issue.draftRevisedSinceOpening) return "";
    return `Draft revised from revision ${issue.openingRevision} to ${issue.lastRecordedRevision} while this issue was open.`;
  };
  const issueHeading = issue => Number.isInteger(issue.number)
    ? `Issue ${issue.number}`
    : (issue.status === "open" ? "Open issue" : "Resolved issue");
  const issueHandle = issue => Number.isInteger(issue.number) ? String(issue.number) : issue.issueId;
  const issueCard = issue => `<section class="submit-pr">
    <h2>${escapeHtml(issueHeading(issue))}</h2>
    <p class="meta">${escapeHtml(issue.status === "open" ? "Open" : "Resolved")} · opened by ${escapeHtml(reviewActorLabel((issue.events || [])[0] || { reviewerKind: issue.openedBy }))} · ${escapeHtml(issue.openedAt)} · last activity ${escapeHtml(issue.lastActivityAt)}</p>
    <p class="review-note">${escapeHtml(issue.summary || "")}</p>
    ${issueRevisionEvidence(issue) ? `<p class="meta">${escapeHtml(issueRevisionEvidence(issue))}</p>` : ""}
    <ol class="review-events">${issueEvents(issue)}</ol>
    ${chronicleOnly ? "" : `<form class="review-issues-form" method="post" action="${action}">
      <input type="hidden" name="issue_id" value="${escapeHtml(issueHandle(issue))}">
      <label>Update this issue
        <select name="issue_action">
          ${issue.status === "open" ? '<option value="note">Add note</option><option value="resolve">Mark resolved</option>' : '<option value="reopen">Reopen</option>'}
        </select>
      </label>
      <textarea name="comments" rows="3" maxlength="10000" required placeholder="What changed, remains uncertain, or resolves this issue"></textarea>
      <button type="submit" name="confirm" value="review-issue" class="secondary">Save issue update</button>
    </form>`}
  </section>`;
  const completedEvents = events
    .filter(event => !event.issueId && event.eventType !== "proposed")
    .sort(reviewEventTimeOrder);
  const body = `
    <p class="meta">${authoringAdminNav()} · ${chronicleOnly
      ? `<a href="/admin/drafts">Back to puzzles</a>`
      : `<a href="/admin/drafts/${encodeURIComponent(draftId)}">Back to draft</a>`}</p>
    <h1>Review issues: ${escapeHtml(draft.document?.title || draft.title || draftId)}</h1>
    <p class="meta">Agent review: ${escapeHtml(lastAgentReviewedAt || "not recorded")} · Human review: ${escapeHtml(lastHumanReviewedAt || "not recorded")}</p>
    ${chronicleOnly ? "" : `<section class="submit-pr">
      <h2>Open a new issue</h2>
      <p class="meta">Use one issue for one independently resolvable concern.</p>
      <form class="review-issues-form" method="post" action="${action}">
        <input type="hidden" name="issue_action" value="open">
        <textarea name="comments" rows="3" maxlength="10000" required placeholder="Describe the unresolved issue and what a later reviewer should do"></textarea>
        <button type="submit" name="confirm" value="review-issue">Open issue</button>
      </form>
    </section>`}
    <h2>Open issues (${issues.filter(issue => issue.status === "open").length})</h2>
    ${issues.filter(issue => issue.status === "open").map(issueCard).join("\n") || '<p class="meta">No open issues.</p>'}
    <h2>Resolved issues (${issues.filter(issue => issue.status === "resolved").length})</h2>
    ${issues.filter(issue => issue.status === "resolved").map(issueCard).join("\n") || '<p class="meta">No resolved issues.</p>'}
    <h2>Completed review history</h2>
    ${completedEvents.length ? `<ol class="review-events">${completedEvents.map(event => {
      const decision = decisionEventDetail(event, publishedSnapshots, events);
      return `<li><strong>${escapeHtml(reviewActorLabel(event))}</strong> · ${escapeHtml(event.reviewedAt)} · ${escapeHtml(event.eventType)}${event.outcome ? ` · ${escapeHtml(event.outcome)}` : ""}${decision ? ` · ${escapeHtml(decision.summary)}` : ""}${!decision && event.draftRevision ? event.outcome === "changed" ? ` · changes recorded in draft revision ${escapeHtml(event.draftRevision)}` : ` · reviewed draft revision ${escapeHtml(event.draftRevision)}` : ""}${decision?.notes ? `<p class="review-note">${escapeHtml(decision.notes)}</p>` : ""}${renderDecisionChanges(decision)}${event.comments ? `<p class="review-note">${escapeHtml(event.comments)}</p>` : ""}</li>`;
    }).join("")}</ol>` : '<p class="meta">No completed reviews recorded.</p>'}
    ${chronicleOnly ? `<p class="meta">This working copy was discarded. Accepted and rejected reviews remain on this record.</p>` : `<section class="submit-pr">
      <h2>Human review</h2>
      <form class="review-issues-form" method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
        <label for="human-review-comments">Review notes (optional)</label>
        <textarea id="human-review-comments" name="comments" rows="3" maxlength="10000" placeholder="Fixes applied, unresolved issues, or questions"></textarea>
        <button type="submit" name="confirm" value="mark-human-reviewed" class="secondary">Mark reviewed by human</button>
      </form>
    </section>`}`;
  return pageShell(`Review issues: ${draft.document?.title || draft.title || draftId}`, body);
}

function renderPuzzleMeta(document, provenanceSettings = AUTHORING_SETTINGS) {
  const parts = [];
  if (document.preSolve) parts.push(badge("pre-solve", "accent"));
  if (document.lensMode) parts.push(badge(`lens: ${document.lensMode}`));
  const provenance = [
    ["creator", document.creator],
    ["license", document.license],
    ["derived from", document.derivedFrom],
    ["language", document.language],
    ["version", document.version]
  ].filter(([, value]) => typeof value === "string" && value.trim());
  for (const [label, value] of provenance) {
    parts.push(labeledLine(label, escapeHtml(value)));
  }
  const provenanceL2 = renderProvenanceL2(document.provenance, provenanceSettings);
  if (provenanceL2) {
    parts.push(labeledLine("provenance", escapeHtml(provenanceL2)));
  }
  return parts.join("\n");
}

function renderClassificationEditor({
  edit,
  document,
  relatedPuzzleOptions = [],
  categoryRegistry
}) {
  if (!edit?.draftId) return "";
  if (!categoryRegistry) {
    throw new Error(
      "renderClassificationEditor requires the live categoryRegistry (D1-published category " +
      "documents plus preserved current values) -- in the authoring environment D1 is the " +
      "upstream source of truth and must never be silently skipped in favor of the static " +
      "git-only CATEGORIES import."
    );
  }
  const slot = copyHidden(edit, { section: "puzzle", field: "classification" });
  // A puzzle may authored with only `categories` (array) and no singular
  // `category` at all -- primaryCategoryForPuzzle resolves that the same
  // way the game itself does. Matching document.category directly left no
  // option "selected" for such a puzzle, so the browser silently defaulted
  // to the first alphabetical <option> ("Anthropology") -- and because
  // every field on this page saves together in one shared form, ANY save
  // (even one touching an unrelated field) then submitted that wrong
  // default as the puzzle's new category, silently overwriting the real
  // one. See also the badge row in renderDraftPage, same fix.
  //
  // categoryRegistry must be the live D1 registry that localDraftReview.js
  // already computes for validation. Published category documents are the
  // only new choices; a draft or unresolved value already on this puzzle is
  // kept visible so saving another field cannot silently erase it.
  const primaryCategory = categoryTitleFor(
    primaryCategoryForPuzzle(document, categoryRegistry),
    categoryRegistry
  );
  const registeredNames = registeredCategoryNames(categoryRegistry);
  const currentNames = categoryNamesForDocument(document, categoryRegistry);
  const categoryNames = [...new Set([...registeredNames, ...currentNames])]
    .sort((left, right) => left.localeCompare(right));
  const options = categoryNames.map(name =>
    `<option value="${escapeHtml(name)}"${name === primaryCategory ? " selected" : ""}>${escapeHtml(categoryChoiceLabel(name, categoryRegistry))}</option>`
  ).join("");
  // Checkboxes, not <select multiple>: a plain click on a native multi-select
  // *replaces* the selection, so an already-selected secondary could only
  // be cleared with Ctrl/Cmd-click (and not at all on touch).
  const secondary = categoryNames.map(name => {
    const isPrimary = name === primaryCategory;
    const checked = !isPrimary && (document.categories || [])
      .some(value => categoryIdFor(value, categoryRegistry) === categoryIdFor(name, categoryRegistry));
    return `<label class="secondary-category${isPrimary ? " is-primary" : ""}"><input${slot.form} type="checkbox" name="${slot.prefix}categories" value="${escapeHtml(name)}"${checked ? " checked" : ""}${isPrimary ? " disabled" : ""} data-secondary-category> ${escapeHtml(categoryChoiceLabel(name, categoryRegistry))}</label>`;
  }).join("");
  // One selector per registry category that defines subcategories; the
  // <classification-editor> element shows only those for the primary and
  // ticked secondaries, live, so a subcategory can be chosen in the same
  // save as the category change instead of after a round-trip. Selectors
  // for unselected categories are disabled server-side too, so a no-JS
  // submit posts the same pairs the pre-JS page did.
  const selectedCategories = new Set([primaryCategory, ...(document.categories || [])]
    .map(value => categoryTitleFor(value, categoryRegistry))
    .filter(Boolean));
  const subcategoryRowCategories = new Set();
  const subcategoryRows = [...new Set([...registeredNames, ...currentNames])].map(category => {
    const registered = categoryIsRegistered(category, categoryRegistry);
    const allEntries = Object.entries(categoryMetadataFor(category, categoryRegistry)?.subcategories || {});
    const chosen = subcategoryIdForPuzzle(document, category, categoryRegistry) || "";
    // For an unregistered category, or an assignment no longer present in
    // the published document, expose only the current value. It can be
    // preserved or cleared, but it cannot turn an unpublished/stale value
    // into a new selectable assignment.
    const entries = registered
      ? allEntries
      : allEntries.filter(([id]) => id === chosen);
    if (chosen && !entries.some(([id]) => id === chosen)) {
      entries.push([chosen, { title: `${chosen} (not registered)` }]);
    }
    if (!entries.length) return "";
    subcategoryRowCategories.add(category);
    const active = selectedCategories.has(category);
    const disabled = active ? "" : " disabled";
    return `<label data-subcategory-for="${escapeHtml(category)}"${active ? "" : " hidden"}>${escapeHtml(categoryChoiceLabel(category, categoryRegistry))} subcategory <select${slot.form} name="${slot.prefix}subcategoryId"${disabled}>
      <option value="">None</option>${entries.map(([id, item]) =>
        `<option value="${escapeHtml(id)}"${id === chosen ? " selected" : ""}>${escapeHtml(item.title)}</option>`
      ).join("")}</select><input${slot.form} type="hidden" name="${slot.prefix}subcategoryCategory" value="${escapeHtml(category)}"${disabled}></label>`;
  }).join("");
  const anySubcategoryActive = [...selectedCategories].some(category =>
    subcategoryRowCategories.has(category)
  );
  const related = document.relatedPuzzles?.entries || [];
  const relatedListId = `related-puzzles-${escapeHtml(edit.draftId)}`;
  const relatedOptions = relatedPuzzleOptions.filter(id => id && id !== document.id).sort()
    .map(id => `<option value="${escapeHtml(id)}"></option>`).join("");
  const relatedRow = (entry = {}) => `<fieldset data-row class="repeatable-row">
    <legend>Related puzzle</legend>
    <label>puzzle <input${slot.form} list="${relatedListId}" name="${slot.prefix}relatedId" value="${escapeHtml(entry.id || "")}"></label>
    <label>reason <input${slot.form} name="${slot.prefix}relatedReason" value="${escapeHtml(entry.reason || "")}"></label>
    <label>via (comma-separated) <input${slot.form} name="${slot.prefix}relatedVia" value="${escapeHtml((entry.via || []).join(", "))}"></label>
    <button type="button" data-remove-row>Remove</button>
  </fieldset>`;
  const rows = [...related, {}].map(relatedRow).join("");
  const currentLevel = typeof document.level === "string" ? document.level : "";
  const levelOptions = [
    `<option value=""${currentLevel ? "" : " selected"}>Unset</option>`,
    ...PUZZLE_LEVELS.map(level =>
      `<option value="${level}"${level === currentLevel ? " selected" : ""}>${levelLabel(level)}</option>`
    ),
    currentLevel && !PUZZLE_LEVELS.includes(currentLevel)
      ? `<option value="${escapeHtml(currentLevel)}" selected>${escapeHtml(currentLevel)} (unrecognized)</option>`
      : ""
  ].join("");
  return `<h2>Classification &amp; relationships</h2><copy-field><details><summary>Edit classification, tags, level, and related puzzles</summary>
    ${slot.hidden}
    <classification-editor>
    <p><label>Primary category <select${slot.form} name="${slot.prefix}category" required data-primary-category>${options}</select></label></p>
    ${subcategoryRows ? `<p class="meta" data-subcategory-note${anySubcategoryActive ? "" : " hidden"}>Subcategories apply within their named category.</p><p class="subcategory-rows">${subcategoryRows}</p>` : ""}
    <fieldset class="secondary-categories"><legend>Secondary categories</legend>${secondary}</fieldset>
    </classification-editor>
    <p><label>Tags (comma-separated)<input${slot.form} name="${slot.prefix}tags" value="${escapeHtml((document.tags || []).join(", "))}"></label></p>
    <p><label>Level <select${slot.form} name="${slot.prefix}level">${levelOptions}</select></label></p>
    <datalist id="${relatedListId}">${relatedOptions}</datalist><repeatable-list><div data-rows>${rows}</div><template>${relatedRow()}</template><button type="button" data-add-row>Add related puzzle</button></repeatable-list>
  </details></copy-field>`;
}

// What the MCP frame reported for Claude-family calls on this draft, grouped
// by raw client name: "Anthropic/ClaudeAI ×4 (10-14) · claude-code ×1 (10-15)".
// Shown as reported, for the editor to weigh; never stored in the puzzle.
const CLAUDE_FAMILY_HOST_IDS = new Set(["claude", "claude-code"]);

function claudeReportedBySummary(stamps = []) {
  const groups = new Map();
  for (const stamp of Array.isArray(stamps) ? stamps : []) {
    if (!CLAUDE_FAMILY_HOST_IDS.has(stamp?.hostId)) continue;
    const name = stamp.clientName || stamp.hostId;
    const day = typeof stamp.capturedAt === "string" ? stamp.capturedAt.slice(5, 10) : "";
    const group = groups.get(name) || { count: 0, first: day, last: day };
    group.count += 1;
    if (day && (!group.first || day < group.first)) group.first = day;
    if (day && day > group.last) group.last = day;
    groups.set(name, group);
  }
  return [...groups].map(([name, { count, first, last }]) => {
    const days = first && last && first !== last ? `${first}–${last}` : first;
    return `<code>${escapeHtml(name)}</code> ×${count}${days ? ` (${escapeHtml(days)})` : ""}`;
  }).join(" · ");
}

function unidentifiedClientNames(events = [], stamps = []) {
  const names = [];
  const add = name => {
    const text = typeof name === "string" ? name.trim() : "";
    if (text && !names.includes(text)) names.push(text);
  };
  for (const event of Array.isArray(events) ? events : []) {
    if (reviewClientSystem(event)) continue;
    add(reviewClientName(event));
  }
  for (const stamp of Array.isArray(stamps) ? stamps : []) {
    if (stamp?.system || stamp?.hostId) continue;
    add(stamp?.clientName);
  }
  return names;
}

function unidentifiedReviewNote(events, stamps, hasUnnamed) {
  const names = unidentifiedClientNames(events, stamps);
  if (!names.length) return "";
  const called = names.map(name => `<code>${escapeHtml(name)}</code>`).join(", ");
  const where = hasUnnamed
    ? "Choose that agent on the drafting client row when you know which one ran."
    : "Add that agent as a drafting client when you know which one ran.";
  return `<p class="meta">A client that wrote or reviewed this draft called itself ${called}. The server does not recognize that name as an agent, so the review is not stamped from it. ${where}</p>`;
}

function renderProvenanceOverride({
  edit,
  document,
  actor,
  customModelSuggestions = null,
  assistanceStamps = [],
  reviewEvents = []
}) {
  if (!edit?.draftId) return "";

  const provenanceSettings = Array.isArray(customModelSuggestions)
    ? { ...AUTHORING_SETTINGS, modelSuggestions: customModelSuggestions }
    : AUTHORING_SETTINGS;
  const current = document?.provenance?.collaboration || "";
  const author = authorDisplayName(actor) || AUTHORING_SETTINGS.credit?.defaultAuthorName || "";
  const l2 = renderProvenanceL2(document?.provenance, provenanceSettings);
  const l1 = renderProvenanceL1(document?.provenance, provenanceSettings);
  const slot = copyHidden(edit, { section: "provenance", id: "", term: "", field: "editor" });
  const form = slot.form;
  const prefix = slot.prefix;
  const options = AUTHORING_PROVENANCE_COLLABORATION.map(mode => {
    const selected = mode === current ? " selected" : "";
    return `<option value="${escapeHtml(mode)}"${selected}>${escapeHtml(mode)}</option>`;
  }).join("");
  const generativeHosts = listGenerativeContributorsForEdit(document, provenanceSettings);
  const modelSuggestions = modelSuggestionsForHost(customModelSuggestions, {
    authoritative: Array.isArray(customModelSuggestions)
  });

  // A drafting client is confirmed by the MCP probe (or added here); model
  // names come from the complete D1 list, or the frozen snapshot offline.
  function modelSelectOptions(current) {
    const trimmed = typeof current === "string" ? current.trim() : "";
    const trimmedLower = trimmed.toLowerCase();
    const known = modelSuggestions.some(option => option.toLowerCase() === trimmedLower);
    const extra = trimmed && !known ? [trimmed] : [];
    return [
      `<option value="">(unspecified)</option>`,
      ...modelSuggestions.map(option => {
        // Case-insensitive match: a stored model differing only by case from
        // a canonical suggestion (e.g. an MCP-reported slug) still lands on
        // that option selected, rather than matching "known" above yet
        // rendering with nothing selected.
        const selected = option.toLowerCase() === trimmedLower ? " selected" : "";
        return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
      }),
      // A value already on the document that isn't in the shared list yet
      // (e.g. a model newer than the last suggestions update) stays selected
      // and visible rather than silently disappearing.
      ...extra.map(option =>
        `<option value="${escapeHtml(option)}" selected>${escapeHtml(option)} (not in list)</option>`
      )
    ].join("");
  }

  function levelSelectOptions(levels, labels, current) {
    return [
      `<option value="">(not set)</option>`,
      ...levels.map(level => {
        const selected = level === current ? " selected" : "";
        return `<option value="${escapeHtml(level)}"${selected}>${escapeHtml(labels[level])}</option>`;
      })
    ].join("");
  }

  // Which "use last" memory a row reads and writes (provenanceLastUsedElement.js).
  function lastUsedKey(host) {
    return isClaudeFamilyContributor(host) ? "claude" : generativeHostKey(host);
  }
  function hostOption(host) {
    return `<option value="${escapeHtml(host)}" data-host-key="${escapeHtml(lastUsedKey(host))}">${escapeHtml(host)}</option>`;
  }
  const useLastButton = `<button type="button" class="provenance-use-last" data-provenance-use-last hidden></button>`;

  function clientRow({ host, rowKey, model, reasoning, switch: switchValue }) {
    // A Claude row posts its full name (rowKey): one puzzle may credit Claude
    // with several models, so the host alone cannot say which row to edit.
    const key = rowKey || host;
    // host comes from stored provenance (a contributor name), not a fixed
    // vocabulary -- escape before it lands in an id/for attribute, same as
    // the value attributes below.
    const slugId = escapeHtml(key.replace(/\s+/g, "-").toLowerCase());
    const modelId = `provenance-model-${slugId}`;
    const reasoningId = `provenance-reasoning-${slugId}`;
    const switchId = `provenance-switch-${slugId}`;
    // The unnamed placeholder is a blank, not a contributor: an agent we know
    // ran but could not name. It is the one host that can be filled in here,
    // because naming it completes a record rather than overwriting something a
    // client actually presented.
    const unnamed = generativeHostKey(host) ===
      generativeHostKey(UNIDENTIFIED_GENERATIVE_SYSTEM);
    const hostCell = unnamed
      ? `<label class="field-label" for="provenance-identify">drafting client</label>
      <select${form} id="provenance-identify" name="${prefix}identifyHost" data-provenance-host-select>${[
        `<option value="">${escapeHtml(UNIDENTIFIED_GENERATIVE_SYSTEM)} (not identified)</option>`,
        ...knownGenerativeHostSystems().map(hostOption)
      ].join("")}</select>`
      : `<span class="provenance-host">${escapeHtml(host)}</span>`;
    const hostKeyAttr = unnamed ? "" : ` data-host-key="${escapeHtml(lastUsedKey(host))}"`;
    return `<div class="provenance-client-row${unnamed ? " provenance-client-unnamed" : ""}" data-provenance-row${hostKeyAttr}>
      ${hostCell}
      <input${form} type="hidden" name="${prefix}modelHost" value="${escapeHtml(key)}">
      <input${form} type="hidden" name="${prefix}reasoningHost" value="${escapeHtml(key)}">
      <input${form} type="hidden" name="${prefix}switchHost" value="${escapeHtml(key)}">
      <label class="field-label" for="${modelId}">model</label>
      <select${form} id="${modelId}" name="${prefix}modelValue" data-provenance-field="model">${modelSelectOptions(model)}</select>
      <label class="field-label" for="${reasoningId}">reasoning</label>
      <select${form} id="${reasoningId}" name="${prefix}reasoningValue" data-provenance-field="reasoning">${levelSelectOptions(AUTHORING_PROVENANCE_REASONING_LEVELS, AUTHORING_PROVENANCE_REASONING_LABELS, reasoning)}</select>
      <label class="field-label" for="${switchId}">switch</label>
      <select${form} id="${switchId}" name="${prefix}switchValue" data-provenance-field="switch">${levelSelectOptions(AUTHORING_PROVENANCE_SWITCHES, AUTHORING_PROVENANCE_SWITCH_LABELS, switchValue)}</select>${rowKey ? claudeCodeToggle(host, key, slugId) : ""}
      ${useLastButton}
    </div>`;
  }
  // The MCP frame credits every Claude surface as "Claude"; only the editor
  // knows when it was Claude Code.
  const claudeReportedBy = claudeReportedBySummary(assistanceStamps);
  const claudeCodeKey = generativeHostKey(
    AUTHORING_SETTINGS.hosts?.labels?.["claude-code"]?.system || "Claude Code");
  function claudeCodeToggle(host, key, slugId) {
    const checked = generativeHostKey(host) === claudeCodeKey ? " checked" : "";
    const toggleId = `provenance-claude-code-${slugId}`;
    return `
      <input${form} type="hidden" name="${prefix}claudeSurfaceHost" value="${escapeHtml(key)}">
      <label class="field-label" for="${toggleId}"><input${form} type="checkbox" id="${toggleId}" name="${prefix}claudeCodeHost" value="${escapeHtml(key)}" data-provenance-field="claudeCode"${checked}> Claude Code</label>`;
  }
  const clientRows = generativeHosts.map(clientRow).join("");
  // Once Claude is credited, a further Claude model is added here rather than
  // through the general add row. Left blank, it adds nothing; a model the
  // existing row already has merges into it. The frame's hint sits here, once.
  const creditsClaude = generativeHosts.some(({ rowKey }) => rowKey);
  const addClaudeRow = creditsClaude ? `<div class="provenance-client-row provenance-client-add-claude" data-provenance-row data-provenance-add data-host-key="claude">
      <label class="field-label" for="provenance-add-claude-model">another Claude model</label>
      <select${form} id="provenance-add-claude-model" name="${prefix}addClaudeModel" data-provenance-field="model">${modelSelectOptions("")}</select>
      <label class="field-label" for="provenance-add-claude-code"><input${form} type="checkbox" id="provenance-add-claude-code" name="${prefix}addClaudeCode" value="1" data-provenance-field="claudeCode"> Claude Code</label>
      ${useLastButton}${claudeReportedBy ? `
      <span class="meta provenance-reported-by">reported by: ${claudeReportedBy}</span>` : ""}
    </div>` : "";

  // Only offer hosts that don't already have a row above -- a host already
  // stamped (by MCP or a prior manual add) is tuned in place there, not
  // re-added here as a second, redundant path to the same fields.
  const listedHostKeys = new Set(generativeHosts.map(({ host }) => generativeHostKey(host)));
  const unlistedHosts = knownGenerativeHostSystems()
    .filter(host => !listedHostKeys.has(generativeHostKey(host)))
    .filter(host => !(creditsClaude && isClaudeFamilyContributor(host)));
  // While the blank is unfilled there is one way to name the agent -- the
  // select on its own row. Offering the add row too would present naming the
  // known agent and inventing a second one as the same gesture.
  const hasUnnamed = generativeHosts.some(({ host }) =>
    generativeHostKey(host) === generativeHostKey(UNIDENTIFIED_GENERATIVE_SYSTEM));
  // Reasoning/switch aren't offered on the add row itself -- they tune a
  // specific client's row, which this one becomes only once added and saved.
  const addClientRow = unlistedHosts.length && !hasUnnamed ? `<div class="provenance-client-row provenance-client-add" data-provenance-row data-provenance-add>
      <label class="field-label" for="provenance-add-host">add drafting client</label>
      <select${form} id="provenance-add-host" name="${prefix}modelHost" data-provenance-host-select>${[
        `<option value="">(choose a drafting client)</option>`,
        ...unlistedHosts.map(hostOption)
      ].join("")}</select>
      <label class="field-label" for="provenance-add-model">model</label>
      <select${form} id="provenance-add-model" name="${prefix}modelValue" data-provenance-field="model">${modelSelectOptions("")}</select>
      ${useLastButton}
    </div>` : "";

  return `<aside class="provenance-override">
    <h2>Provenance</h2>
    <p class="meta">${l2
      ? "Override collaboration when you have taken editorial lead (or restore AI-primary after agent drafting)."
      : "No provenance has been recorded for this draft. Add a drafting client only when you know one actually authored it."} The lesson byline is derived from provenance (read-only).</p>
    ${l2 ? `<p class="fact"><span class="field-label">current:</span> ${escapeHtml(l2)}</p>` : ""}
    ${l1 ? `<p class="fact"><span class="field-label">byline (derived):</span> ${escapeHtml(l1)}</p>` : ""}
    <div class="inline-edit provenance-form">
      ${slot.hidden}
      <input${form} type="hidden" name="${prefix}authorName" value="${escapeHtml(author)}">
      <${PROVENANCE_CLIENTS_TAG} class="provenance-clients" data-form="${WORKING_COPY_FORM_ID}">
        <p class="field-label">Drafting client</p>
        <p class="meta">Confirmed by the MCP probe when a client identifies itself, or added here. Model, reasoning, and switch are optional -- set them only when you're confident what ran; they concatenate into the derived byline after the model (for example Grok 4.6 High Fast). A "use last" button fills a row's blank fields with what you last saved for that client in this browser; nothing is filled until you click it.</p>${hasUnnamed ? `<p class="meta">This puzzle records an agent that could not be named when it was written. Choosing a drafting client above fills that blank in place -- it does not add a second contributor. Leave it unidentified unless you have evidence of which client ran. A client the MCP probe confirmed is not editable here; correcting one of those is a removal, not a rename.</p>` : ""}${unidentifiedReviewNote(reviewEvents, assistanceStamps, hasUnnamed)}
        ${clientRows}
        ${addClaudeRow}
        ${addClientRow}
      </${PROVENANCE_CLIENTS_TAG}>
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

function renderCreditsSection({ edit, intro, document, diff, provenanceSettings = AUTHORING_SETTINGS }) {
  const derived = resolveLessonByline({
    introduction: intro,
    provenance: document?.provenance,
    settings: provenanceSettings
  });
  const hasDerivedProvenance = Boolean(renderProvenanceL1(document?.provenance, provenanceSettings));
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
        : `${renderCopyField({
        edit, section: "learning", field: "credit",
        value: intro.credit || "", change: diff?.fields?.learningIntroduction, multiline: false, label: "credit",
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
  if (!edit?.draftId) return "";
  return `<h2>Credits</h2>
    <p class="meta">The player-visible byline is derived from provenance when present. This draft has no learning introduction yet.</p>
    ${derived ? `<p class="fact"><span class="field-label">byline (derived):</span> ${escapeHtml(derived)}</p>` : ""}`;
}

function renderLearningReferences(intro) {
  const links = renderLinkList(authoredLearningLinks(intro));
  return labeledLine("links", links || emptyValue());
}

function renderDiffSummary(diff, {
  layoutDiffersFromPublished = false,
  provenanceDiffersFromPublished = false,
  shadowsPublished = false
} = {}) {
  if (!diff) return "";
  const total = Number(diff.total || 0) +
    (layoutDiffersFromPublished ? 1 : 0) +
    (provenanceDiffersFromPublished ? 1 : 0);
  if (!total) {
    return `<aside class="diff-summary diff-summary-none">No changes from the published puzzle.</aside>`;
  }
  // A shadow reads the same marks as an ordinary edit, so the summary has to
  // say what they actually mean here: not an edit history, but the gap
  // between two unrelated boards filed under one id.
  if (shadowsPublished) {
    return `<aside class="diff-summary diff-summary-shadow">
      <strong>This working copy was not opened from the published puzzle</strong>
      <span class="meta">${total} difference${total === 1 ? "" : "s"} · almost none of the published board survives here</span>
      <p class="meta">Nearly every cluster, bridge and lens of the published
      puzzle is missing from this working copy, so this is a separate document
      written under the same id rather than an edit of the live one. The marks
      below are not an edit history — they are the gap between two different
      boards, and Publish would replace the live puzzle with this. Revert to
      published discards this and starts from the live board instead. (A
      rewrite thorough enough to replace every node reads the same way.)</p>
    </aside>`;
  }
  const bits = [];
  if (diff.counts.changed) bits.push(`${diff.counts.changed} changed`);
  if (diff.counts.added) bits.push(`${diff.counts.added} added`);
  if (diff.counts.removed) bits.push(`${diff.counts.removed} removed`);
  if (layoutDiffersFromPublished) bits.push("layout override changed");
  if (provenanceDiffersFromPublished) bits.push("provenance changed");
  return `<aside class="diff-summary">
    <strong>${total} change${total === 1 ? "" : "s"} from the published puzzle</strong>
    <span class="meta">${escapeHtml(bits.join(" · "))}</span>
    <p class="meta">Amber is an edit, green is new, struck red was removed. “was:” is the published text. Copy can be edited here; Save working copy writes the private draft. Structure is authored on the construct board or via optional MCP.</p>
  </aside>`;
}

function renderPublicationNotice(notice) {
  if (!notice || notice.kind !== "puzzle" || !notice.id ||
      !Number.isInteger(notice.revision)) {
    return "";
  }
  const action = notice.action || "published";
  const cued = notice.cued || action === "cued";
  const revisionLabel = notice.replicaPending ? "revision" : "D1 revision";
  const message = action === "cued"
    ? `<strong>Cued</strong> <code>${escapeHtml(notice.id)}</code>
    as ${revisionLabel} ${escapeHtml(String(notice.revision))} for the next freeze.`
    : `<strong>Published</strong> <code>${escapeHtml(notice.id)}</code>
    as ${revisionLabel} ${escapeHtml(String(notice.revision))}.${cued ? " Cued for the next freeze." : ""}`;
  const modeNames = { star: "Star", graph: "Graph", sets: "Circle" };
  const kept = (notice.layoutKept || []).map(mode => modeNames[mode]).filter(Boolean);
  const keptNote = kept.length
    ? `<p class="meta">Kept the newer ${escapeHtml(kept.join(" and "))} layout already saved on the published puzzle; this working copy's older copy was not published.</p>`
    : "";
  const fallback = notice.layoutFallback || [];
  const fallbackNote = fallback.length
    ? `<p class="meta">Saved layouts this edit no longer matches exactly: ${escapeHtml(fallback
      .filter(mode => modeNames[mode])
      .map(mode => `${modeNames[mode]} (players get it ${mode === "star" ? "adapted to the edit" : "as a hint: same arrangement, positions recomputed"})`)
      .join("; "))}. Re-save in layout authoring to fix positions again.</p>`
    : "";
  return `<div class="validation validation-ok" role="status">
    ${message}
    ${keptNote}
    ${fallbackNote}
    ${notice.replicaPending ? "<p class=\"meta\">On the LAN. Not yet on the public site.</p>" : ""}
    <p class="meta">${escapeHtml(PUBLIC_PLAY_PUBLICATION_NOTE)}</p>
  </div>
  <script>
    if (window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("notice");
          cleanUrl.searchParams.delete("cued");
          cleanUrl.searchParams.delete("puzzle_id");
          cleanUrl.searchParams.delete("revision");
          cleanUrl.searchParams.delete("layout_kept");
          cleanUrl.searchParams.delete("layout_fallback");
          window.history.replaceState(null, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    }
  </script>`;
}

export function renderDraftPage(draft, {
  variant = "hosted",
  actor = null,
  customModelSuggestions = null,
  relatedPuzzleOptions = [],
  categoryRegistry,
  notice = null,
  // Per-citation Zotero status for document.info.citations, by position.
  citationSources = null
} = {}) {
  // No git-only default: in the authoring environment D1 is the upstream
  // source of truth and the first, overriding choice, never a fallback.
  // See renderClassificationEditor.
  if (!categoryRegistry) {
    throw new Error(
      "renderDraftPage requires the live categoryRegistry (D1-published category documents plus preserved current values)."
    );
  }
  const document = draft.document || {};
  const provenanceSettings = Array.isArray(customModelSuggestions)
    ? { ...AUTHORING_SETTINGS, modelSuggestions: customModelSuggestions }
    : AUTHORING_SETTINGS;
  const clusters = document.clusters || [];
  const bridges = document.bridges || [];
  const clusterNameById = new Map(clusters.map(cluster => [cluster.id, cluster.name]));
  const intro = document.learningIntroduction;
  const diff = draft.publishedDiff || null;
  const titleChange = diff?.fields?.title;
  const edit = { draftId: draft.draftId, revision: draft.revision };
  // See the matching comment in renderClassificationEditor: a puzzle
  // authored with only `categories` (no singular `category`) has no
  // primary badge without this.
  const primaryCategory = primaryCategoryForPuzzle(document, categoryRegistry);
  const primaryCategoryId = categoryIdFor(primaryCategory, categoryRegistry);

  const body = `
    <p class="meta">${authoringAdminNav()}</p>
    <h1>${escapeHtml(document.title || draft.title || draft.draftId)}</h1>
    ${renderPublicationNotice(notice)}
    ${renderWas(titleChange)}
    ${renderCopyField({
      edit, section: "puzzle", field: "title",
      value: document.title || "", change: titleChange, multiline: false, label: "title"
    })}
    <p class="meta">
      <code>${escapeHtml(draft.draftId)}</code>
      ${renderPuzzlePathBadges(draft, { detail: true })}
      ${renderGithubSnapshotStatus(draft.inGithubProduction)}
      working copy updated ${escapeHtml(draft.updatedAt)}
    </p>
    ${draft.replicaPending ? "<p class=\"meta\">On the LAN. Not yet on the public site.</p>" : ""}
    <p class="meta">${escapeHtml(PUBLIC_PLAY_PUBLICATION_NOTE)}
      Working copy edits stay private until you publish.</p>
    ${renderDiffSummary(diff, {
      layoutDiffersFromPublished: draft.layoutDiffersFromPublished,
      provenanceDiffersFromPublished: draft.provenanceDiffersFromPublished === true,
      shadowsPublished: draft.shadowsPublished === true
    })}
    ${renderDraftFreshness(draft, variant)}
    ${renderValidation(draft.validation, variant)}
    ${renderFlags(draft.validation?.flags, edit)}
    ${renderSubmitForm(draft, variant)}
    <p class="meta">
      ${badge(primaryCategory, "accent")}
      ${(document.categories || [])
        .filter(name => categoryIdFor(name, categoryRegistry) !== primaryCategoryId)
        .map(name => badge(categoryTitleFor(name, categoryRegistry))).join("")}
      ${subcategoryBadges(document.subcategories, categoryRegistry)}
      ${badge(levelLabel(document.level))}
      ${(document.tags || []).map(tag => badge(tag)).join("")}
      ${derivedLarge(puzzleNodeCount(document)) ? badge("large") : ""}
    </p>
    ${renderWas(diff?.fields?.category)}
    ${renderSubcategoriesWas(diff?.fields?.subcategories, categoryRegistry)}
    ${renderWas(diff?.fields?.tags)}
    ${renderWas(diff?.fields?.level)}
    ${renderPuzzleMeta(document, provenanceSettings)}
    ${renderClassificationEditor({ edit, document, relatedPuzzleOptions, categoryRegistry })}
    ${renderProvenanceOverride({
      edit,
      document,
      actor,
      customModelSuggestions,
      assistanceStamps: draft.assistanceStamps,
      reviewEvents: draft.reviewEvents
    })}
    ${renderInfo(document.info, {
      alwaysShowReferences: true,
      hideLinksOverlappingCitations: true,
      citationSources
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

    ${renderCreditsSection({ edit, intro, document, diff, provenanceSettings })}

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
