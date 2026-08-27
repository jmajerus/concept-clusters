// Published-vs-draft marks for /admin/drafts. The review page still shows
// the draft as the document; this only says where it diverges from the
// published simplified puzzle. Authoring metadata (dates, generative
// assistance) is ignored so a review pass is not a changelog of tooling.
// Link-field folds (`link` vs `links`) are compared as the same destination
// list so a draft migration does not look like a wording change.

import { authoredLinks, authoredLearningLinks, hoistDocumentCitations } from "./termInfo.js";

const INFO_LINK_KEYS = ["links", "link", "linkLabel", "extraLink", "seeAlso"];

const SKIP_KEYS = new Set([
  "generativeAssistance",
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
    const change = fieldChange(published?.termInfo?.[term], draft?.termInfo?.[term]);
    if (change) info[term] = change;
  }
  const fields = {};
  for (const name of ["name", "color", "fact", "info"]) {
    const change = fieldChange(published?.[name], draft?.[name]);
    if (change) fields[name] = change;
  }
  const empty = !added.length && !removed.length && !seedChanged.length
    && !Object.keys(info).length && !Object.keys(fields).length;
  if (empty) return null;
  return { fields, terms: { added, removed, seedChanged, info } };
}

function bridgeMark(published, draft) {
  const fields = {};
  for (const name of [
    "term", "clusters", "fact", "info", "relationKind", "termRole",
    "conceptId", "direction", "idealTerms"
  ]) {
    const change = fieldChange(published?.[name], draft?.[name]);
    if (change) fields[name] = change;
  }
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
    "level", "info", "lensMode", "preSolve", "relatedPuzzles",
    "learningIntroduction"
  ]) {
    const change = fieldChange(published[name], draft[name]);
    if (change) {
      fields[name] = change;
      bump(counts, "changed");
    }
  }
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
