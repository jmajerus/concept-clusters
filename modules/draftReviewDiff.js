// Published-vs-draft marks for /admin/drafts. The review page still shows
// the draft as the document; this only says where it diverges from the
// published simplified puzzle. Authoring metadata (dates, generative
// assistance) is ignored so a review pass is not a changelog of tooling.
// Link-field folds (`link` vs `links`) are compared as the same destination
// list so a draft migration does not look like a wording change.

import { authoredLinks, authoredLearningLinks, hoistDocumentCitations } from "./termInfo.js";

const INFO_LINK_KEYS = ["links", "link", "linkLabel", "extraLink", "seeAlso"];

const SKIP_KEYS = new Set([
  "provenance",
  "dateCreated",
  "dateModified",
  "creator",
  "license",
  "derivedFrom",
  "language",
  "version"
]);

function foldInfoLinkKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  if (!INFO_LINK_KEYS.some(key => Object.prototype.hasOwnProperty.call(value, key))) {
    return value;
  }
  const next = { ...value };
  for (const key of INFO_LINK_KEYS) delete next[key];
  const links = authoredLinks(value);
  if (links.length) next.links = links;
  return next;
}

function foldLearningLinkKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  if (!Object.prototype.hasOwnProperty.call(value, "sources")) return value;
  const next = { ...value };
  delete next.sources;
  const links = authoredLearningLinks(value);
  if (links.length) next.links = links;
  else delete next.links;
  return next;
}

function canon(value) {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value.map(canon);
  if (typeof value === "object") {
    const source = foldLearningLinkKeys(foldInfoLinkKeys(value));
    const out = {};
    for (const key of Object.keys(source).sort()) {
      if (SKIP_KEYS.has(key)) continue;
      const next = canon(source[key]);
      if (next === null) continue;
      out[key] = next;
    }
    return out;
  }
  return value;
}

export function valuesEqual(left, right) {
  return JSON.stringify(canon(left)) === JSON.stringify(canon(right));
}

function fieldChange(before, after) {
  if (valuesEqual(before, after)) return null;
  return { before: before ?? null, after: after ?? null };
}

function infoTextValue(info) {
  if (info == null) return null;
  if (typeof info === "string") return info;
  return info.text ?? null;
}

function infoCitationsValue(info) {
  if (!info || typeof info !== "object" || Array.isArray(info)) return null;
  return Array.isArray(info.citations) ? info.citations : null;
}

/** Per-slot diff marks for info.text, info.links, and info.citations. */
export function infoSubfieldChanges(publishedInfo, draftInfo) {
  const changes = {};
  const text = fieldChange(infoTextValue(publishedInfo), infoTextValue(draftInfo));
  if (text) changes["info.text"] = text;
  const links = fieldChange(authoredLinks(publishedInfo), authoredLinks(draftInfo));
  if (links) changes["info.links"] = links;
  const citations = fieldChange(
    infoCitationsValue(publishedInfo),
    infoCitationsValue(draftInfo)
  );
  if (citations) changes["info.citations"] = citations;
  return changes;
}

function applyInfoSubfieldChanges(fields, counts, publishedInfo, draftInfo) {
  for (const [name, change] of Object.entries(
    infoSubfieldChanges(publishedInfo, draftInfo)
  )) {
    fields[name] = change;
    bump(counts, "changed");
  }
}

function keyFor(item, ...fields) {
  if (!item || typeof item !== "object") return null;
  for (const field of fields) {
    const value = item[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function indexItems(items, ...fields) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyFor(item, ...fields);
    if (key) map.set(key, item);
  }
  return map;
}

function collectKeys(publishedMap, draftMap) {
  return [...new Set([...publishedMap.keys(), ...draftMap.keys()])];
}

function bump(counts, kind) {
  counts[kind] += 1;
}

function clusterTermMark(published, draft) {
  const publishedTerms = published?.terms || [
    ...(published?.seeds || []),
    ...(published?.floatingTerms || [])
  ];
  const draftTerms = draft?.terms || [
    ...(draft?.seeds || []),
    ...(draft?.floatingTerms || [])
  ];
  const publishedSet = new Set(publishedTerms);
  const draftSet = new Set(draftTerms);
  const added = draftTerms.filter(term => !publishedSet.has(term));
  const removed = publishedTerms.filter(term => !draftSet.has(term));
  const publishedSeeds = new Set(published?.seeds || []);
  const draftSeeds = new Set(draft?.seeds || []);
  const seedChanged = [...new Set([...publishedSeeds, ...draftSeeds])]
    .filter(term => publishedSeeds.has(term) !== draftSeeds.has(term));
  const info = {};
  for (const term of draftTerms) {
    const sub = infoSubfieldChanges(
      published?.termInfo?.[term],
      draft?.termInfo?.[term]
    );
    if (Object.keys(sub).length) info[term] = sub;
  }
  const fields = {};
  for (const name of ["name", "color", "fact"]) {
    const change = fieldChange(published?.[name], draft?.[name]);
    if (change) fields[name] = change;
  }
  Object.assign(fields, infoSubfieldChanges(published?.info, draft?.info));
  const empty = !added.length && !removed.length && !seedChanged.length
    && !Object.keys(info).length && !Object.keys(fields).length;
  if (empty) return null;
  return { fields, terms: { added, removed, seedChanged, info } };
}

function bridgeMark(published, draft) {
  const fields = {};
  for (const name of [
    "term", "clusters", "fact", "relationKind",
    "conceptId", "direction", "idealTerms"
  ]) {
    const change = fieldChange(published?.[name], draft?.[name]);
    if (change) fields[name] = change;
  }
  Object.assign(fields, infoSubfieldChanges(published?.info, draft?.info));
  return Object.keys(fields).length ? { fields } : null;
}

function lensMark(published, draft) {
  const fields = {};
  for (const name of ["id", "prompt", "explanation", "targets", "reasons", "options", "color"]) {
    const change = fieldChange(published?.[name], draft?.[name]);
    if (change) fields[name] = change;
  }
  return Object.keys(fields).length ? { fields } : null;
}

function collectionDiff(publishedItems, draftItems, keyFields, markPair, counts) {
  const publishedMap = indexItems(publishedItems, ...keyFields);
  const draftMap = indexItems(draftItems, ...keyFields);
  const added = [];
  const removed = [];
  const changed = {};
  for (const key of collectKeys(publishedMap, draftMap)) {
    const published = publishedMap.get(key);
    const draft = draftMap.get(key);
    if (published && !draft) {
      removed.push(published);
      bump(counts, "removed");
      continue;
    }
    if (!published && draft) {
      added.push(key);
      bump(counts, "added");
      continue;
    }
    const mark = markPair(published, draft);
    if (mark) {
      changed[key] = mark;
      bump(counts, "changed");
    }
  }
  return { added, removed, changed };
}

export function diffPublishedDraft(published, draft) {
  if (!published || !draft) return null;
  published = hoistDocumentCitations(published);
  draft = hoistDocumentCitations(draft);
  const counts = { changed: 0, added: 0, removed: 0 };
  const fields = {};
  for (const name of [
    "title", "category", "categories", "subcategories", "large", "tags",
    "level", "lensMode", "preSolve", "relatedPuzzles",
    "learningIntroduction"
  ]) {
    const change = fieldChange(published[name], draft[name]);
    if (change) {
      fields[name] = change;
      bump(counts, "changed");
    }
  }
  applyInfoSubfieldChanges(fields, counts, published.info, draft.info);
  const clusters = collectionDiff(
    published.clusters,
    draft.clusters,
    ["id", "name"],
    clusterTermMark,
    counts
  );
  const bridges = collectionDiff(
    published.bridges,
    draft.bridges,
    ["id", "term"],
    bridgeMark,
    counts
  );
  const lenses = collectionDiff(
    published.lenses,
    draft.lenses,
    ["id", "prompt"],
    lensMark,
    counts
  );
  const total = counts.changed + counts.added + counts.removed;
  return { counts, total, fields, clusters, bridges, lenses };
}

/**
 * Provenance is kept out of the field-level marks (see SKIP_KEYS) so a review
 * pass is not a changelog of tooling: an MCP stamp lands on its own and should
 * not litter a copy review. But provenance is authored now -- an editor names
 * the drafting client by hand -- so a provenance-only edit must still register
 * as a difference, or the page reports "No changes" over a real edit and
 * Publish treats the draft as already live.
 *
 * Reported as its own flag beside layoutDiffersFromPublished rather than as a
 * field mark, which keeps both properties.
 *
 * @param {{ provenance?: unknown } | null | undefined} published
 * @param {{ provenance?: unknown } | null | undefined} draft
 * @returns {boolean}
 */
export function provenanceDiffersFromPublished(published, draft) {
  if (!published || !draft) return false;
  return !valuesEqual(published.provenance ?? null, draft.provenance ?? null);
}

/**
 * Does this working copy descend from the published board, or is it a
 * different document filed under the same id?
 *
 * Measured as how much of the published board's identity survives into the
 * draft: clusters, bridges and lenses that are still there under the same
 * key. An edit keeps nearly all of them and changes their contents -- even a
 * heavy edit is recognizably the same board. A document written from scratch
 * under a live id keeps almost none, because its nodes were never derived
 * from the published ones. That is the shadow case in
 * docs/dev-briefs/shadow-draft-incident-postmortem.md, where a fresh board
 * kept 1 of the published board's 9 nodes.
 *
 * Deliberately expressed through the same diff the review page already
 * renders rather than a second notion of "different", and deliberately
 * structural rather than "revision 1 and differs at all": a second working
 * copy of a published puzzle can legitimately sit at revision 1 with a field
 * or two changed, and must not be accused of shadowing it.
 *
 * Evidence, not proof. It answers "does this still look like that board?",
 * so a rewrite so total that it replaces every node will read as a shadow
 * whether it was one or not.
 *
 * @param {{
 *   published?: object|null,
 *   draft?: object|null,
 *   publishedDiff?: object|null,
 *   threshold?: number
 * }} [options]
 * @returns {boolean}
 */
export function draftShadowsPublished({
  published = null,
  draft = null,
  publishedDiff = undefined,
  threshold = 0.5
} = {}) {
  if (!published) return false;
  const diff = publishedDiff === undefined
    ? diffPublishedDraft(published, draft)
    : publishedDiff;
  if (!diff) return false;
  const nodes = ["clusters", "bridges", "lenses"];
  const total = nodes.reduce(
    (sum, name) => sum + (Array.isArray(published[name]) ? published[name].length : 0),
    0
  );
  if (!total) return false;
  const removed = nodes.reduce(
    (sum, name) => sum + (diff[name]?.removed?.length || 0),
    0
  );
  return (total - removed) / total < threshold;
}

/**
 * Every fact the review page derives from a (published, draft) pair, in one
 * place.
 *
 * Both request paths -- the LAN authoring server's mapDraftDetail and the
 * hosted Worker's draft route -- assemble their own renderDraftPage payload,
 * and each used to compute these three separately. That is where two bugs of
 * the same shape landed: provenance was added to one path and not the other,
 * and neither the page-renderer test nor the local mapping test could see the
 * gap. A flag added here reaches both callers at once, so the next one cannot
 * be half-wired.
 *
 * Deliberately pure and baseline-agnostic. Choosing the baseline is genuinely
 * environment-specific (the Worker prefers the D1 published row and falls back
 * to the content service; the LAN server prefers an explicitly supplied
 * published document and falls back to git), so it stays with the caller.
 * Facts that only one environment can produce -- layoutDiffersFromPublished,
 * which needs a layout editor the hosted side does not have -- stay with the
 * caller too, rather than being faked here as always-false.
 *
 * @param {{ published?: object|null, draft?: object|null }} [options]
 */
export function deriveDraftComparison({ published = null, draft = null } = {}) {
  // One diff, read three times. Recomputing would canonicalize and walk the
  // whole board again for each question.
  const publishedDiff = published ? diffPublishedDraft(published, draft) : null;
  return {
    publishedDiff,
    shadowsPublished: draftShadowsPublished({ published, publishedDiff }),
    provenanceDiffersFromPublished: provenanceDiffersFromPublished(published, draft)
  };
}

export function publishedDocumentFromService(contentService, puzzleId) {
  if (!contentService || typeof puzzleId !== "string") return null;
  if (typeof contentService.getPuzzleDocument !== "function") return null;
  try {
    return contentService.getPuzzleDocument(puzzleId);
  } catch {
    return null;
  }
}

export default diffPublishedDraft;
