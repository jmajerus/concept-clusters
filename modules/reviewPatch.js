// A review proposal is a list of field changes against the working copy,
// not a second copy of the puzzle. Each change keeps the value it started
// from, so a later edit conflicts only where it touches the same field.
// The draft revision recorded beside the patch is a hint that the working
// copy has moved; the before-values are what accept compares.

import { diffPublishedDraft, valuesEqual } from "./draftReviewDiff.js";
import { authoredLinks } from "./termInfo.js";

export const REVIEW_PATCH_ENVELOPE = "review-patch";

const COLLECTION_KEYS = Object.freeze({
  clusters: ["id", "name"],
  bridges: ["id", "term"],
  lenses: ["id", "prompt"]
});

function clone(value) {
  if (value === undefined || value === null) return null;
  return JSON.parse(JSON.stringify(value));
}

function keyFor(item, keys) {
  if (!item || typeof item !== "object") return null;
  for (const field of keys) {
    const value = item[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function findItem(items, key, keys) {
  return (Array.isArray(items) ? items : []).find(item => keyFor(item, keys) === key) || null;
}

function infoPart(info, part) {
  if (part === "text") {
    if (info == null) return null;
    if (typeof info === "string") return info;
    return info.text ?? null;
  }
  if (part === "links") return authoredLinks(info);
  if (!info || typeof info !== "object" || Array.isArray(info)) return null;
  return Array.isArray(info.citations) ? info.citations : null;
}

function termPlacement(cluster) {
  if (!cluster || typeof cluster !== "object") return null;
  return {
    seeds: Array.isArray(cluster.seeds) ? clone(cluster.seeds) : [],
    floatingTerms: Array.isArray(cluster.floatingTerms) ? clone(cluster.floatingTerms) : [],
    terms: Array.isArray(cluster.terms) ? clone(cluster.terms) : null
  };
}

function parsePath(path) {
  const collection = /^(clusters|bridges|lenses)\[([^\]]+)\](?:\.(.+))?$/.exec(path);
  if (collection) {
    const [, name, key, rest] = collection;
    if (!rest) return { scope: "item", collection: name, key };
    const termInfo = /^termInfo\[([^\]]+)\]\.(info\.(?:text|links|citations))$/.exec(rest);
    if (termInfo) {
      return {
        scope: "term-info",
        collection: name,
        key,
        term: termInfo[1],
        field: termInfo[2]
      };
    }
    if (rest === "terms") return { scope: "terms", collection: name, key };
    return { scope: "item-field", collection: name, key, field: rest };
  }
  if (path === "info.text" || path === "info.links" || path === "info.citations") {
    return { scope: "root-info", field: path };
  }
  return { scope: "root", field: path };
}

function readChange(document, change) {
  const parsed = parsePath(change.path);
  if (parsed.scope === "root") {
    if (!document || !Object.prototype.hasOwnProperty.call(document, parsed.field)) return null;
    return document[parsed.field] ?? null;
  }
  if (parsed.scope === "root-info") {
    return infoPart(document?.info, parsed.field.slice("info.".length));
  }
  const item = findItem(document?.[parsed.collection], parsed.key, COLLECTION_KEYS[parsed.collection]);
  if (parsed.scope === "item") return item;
  if (!item) return null;
  if (parsed.scope === "terms") return termPlacement(item);
  if (parsed.scope === "term-info") {
    return infoPart(item.termInfo?.[parsed.term], parsed.field.slice("info.".length));
  }
  if (parsed.field.startsWith("info.")) return infoPart(item.info, parsed.field.slice("info.".length));
  if (!Object.prototype.hasOwnProperty.call(item, parsed.field)) return null;
  return item[parsed.field] ?? null;
}

function writeInfoPart(target, part, value) {
  let info = target.info;
  if (typeof info === "string") info = { text: info };
  if (!info || typeof info !== "object" || Array.isArray(info)) info = {};
  if (value == null) delete info[part];
  else info[part] = clone(value);
  if (Object.keys(info).length) target.info = info;
  else delete target.info;
}

function writeChange(document, change) {
  const parsed = parsePath(change.path);
  const after = clone(change.after);
  if (parsed.scope === "root") {
    if (after == null) delete document[parsed.field];
    else document[parsed.field] = after;
    return true;
  }
  if (parsed.scope === "root-info") {
    writeInfoPart(document, parsed.field.slice("info.".length), after);
    return true;
  }
  const keys = COLLECTION_KEYS[parsed.collection];
  const items = Array.isArray(document[parsed.collection]) ? document[parsed.collection] : [];
  document[parsed.collection] = items;
  const index = items.findIndex(item => keyFor(item, keys) === parsed.key);
  if (parsed.scope === "item") {
    if (after == null) {
      if (index >= 0) items.splice(index, 1);
      return true;
    }
    if (index >= 0) items[index] = after;
    else items.push(after);
    return true;
  }
  if (index < 0) return false;
  const item = items[index];
  if (parsed.scope === "terms") {
    if (!after) return false;
    if (Array.isArray(after.seeds)) item.seeds = after.seeds;
    if (Array.isArray(after.floatingTerms)) item.floatingTerms = after.floatingTerms;
    else delete item.floatingTerms;
    if (Array.isArray(after.terms)) item.terms = after.terms;
    else delete item.terms;
    return true;
  }
  if (parsed.scope === "term-info") {
    if (!item.termInfo || typeof item.termInfo !== "object") item.termInfo = {};
    const holder = {};
    holder.info = item.termInfo[parsed.term];
    writeInfoPart(holder, parsed.field.slice("info.".length), after);
    if (holder.info === undefined) delete item.termInfo[parsed.term];
    else item.termInfo[parsed.term] = holder.info;
    if (!Object.keys(item.termInfo).length) delete item.termInfo;
    return true;
  }
  if (parsed.field.startsWith("info.")) {
    writeInfoPart(item, parsed.field.slice("info.".length), after);
    return true;
  }
  if (after == null) delete item[parsed.field];
  else item[parsed.field] = after;
  return true;
}

function changeRecord(path, before, after, op = "change") {
  return { path, op, before: clone(before), after: clone(after) };
}

function flattenCollection(beforeDoc, afterDoc, name, section) {
  if (!section) return [];
  const keys = COLLECTION_KEYS[name];
  const changes = [];
  for (const key of section.added || []) {
    changes.push(changeRecord(`${name}[${key}]`, null, findItem(afterDoc?.[name], key, keys), "add"));
  }
  for (const item of section.removed || []) {
    const key = keyFor(item, keys);
    if (!key) continue;
    changes.push(changeRecord(`${name}[${key}]`, item, null, "remove"));
  }
  for (const [key, mark] of Object.entries(section.changed || {})) {
    for (const [field, change] of Object.entries(mark.fields || {})) {
      changes.push(changeRecord(`${name}[${key}].${field}`, change.before, change.after));
    }
    const terms = mark.terms;
    if (terms && (terms.added?.length || terms.removed?.length || terms.seedChanged?.length)) {
      changes.push(changeRecord(
        `${name}[${key}].terms`,
        termPlacement(findItem(beforeDoc?.[name], key, keys)),
        termPlacement(findItem(afterDoc?.[name], key, keys))
      ));
    }
    for (const [term, sub] of Object.entries(terms?.info || {})) {
      for (const [field, change] of Object.entries(sub)) {
        changes.push(changeRecord(
          `${name}[${key}].termInfo[${term}].${field}`,
          change.before,
          change.after
        ));
      }
    }
  }
  return changes;
}

/** Field changes between two puzzle documents, using the review diff's identity. */
export function fieldChanges(before, after) {
  const diff = diffPublishedDraft(before, after);
  if (!diff || diff.total === 0) return [];
  const changes = [];
  for (const [path, change] of Object.entries(diff.fields || {})) {
    if (!change) continue;
    changes.push(changeRecord(path, change.before, change.after));
  }
  changes.push(...flattenCollection(before, after, "clusters", diff.clusters));
  changes.push(...flattenCollection(before, after, "bridges", diff.bridges));
  changes.push(...flattenCollection(before, after, "lenses", diff.lenses));
  return changes;
}

export function isReviewPatch(proposal) {
  return Boolean(proposal && proposal.envelope === REVIEW_PATCH_ENVELOPE && Array.isArray(proposal.changes));
}

export function reviewPatchDocument(baseDraftRevision, changes, { stacksOn = null } = {}) {
  return {
    envelope: REVIEW_PATCH_ENVELOPE,
    baseDraftRevision: Number.isInteger(baseDraftRevision) ? baseDraftRevision : null,
    stacksOn: Number.isInteger(stacksOn) ? stacksOn : null,
    changes: (changes || []).map(change => changeRecord(change.path, change.before, change.after, change.op))
  };
}

/**
 * Stored patch changes, or the changes a legacy whole-document proposal
 * makes against an anchor (the published puzzle, or the working copy).
 */
export function proposalChanges(proposal, legacyAnchor = null) {
  if (!proposal || typeof proposal !== "object") return [];
  if (isReviewPatch(proposal)) return proposal.changes.map(change => ({ ...change }));
  if (!legacyAnchor) return [];
  return fieldChanges(legacyAnchor, proposal);
}

export function pathsOverlap(left, right) {
  if (left === right) return true;
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  if (!longer.startsWith(shorter)) return false;
  const boundary = longer[shorter.length];
  return boundary === undefined || boundary === ".";
}

export function overlappingPaths(leftChanges, rightChanges) {
  const paths = [];
  for (const left of leftChanges || []) {
    if ((rightChanges || []).some(right => pathsOverlap(left.path, right.path))) paths.push(left.path);
  }
  return paths;
}

function retargetReviewChanges(changes, stackedBase) {
  return (changes || []).flatMap(change => {
    const current = readChange(stackedBase, change);
    if (valuesEqual(current, change.after)) return [];
    if (valuesEqual(current, change.before)) return [change];
    return [changeRecord(change.path, current, change.after, change.op)];
  });
}

function overlapError(changes, proposals, baseline, { stacking = false } = {}) {
  for (const event of proposals || []) {
    const paths = overlappingPaths(changes, proposalChanges(event?.proposal, baseline));
    if (!paths.length) continue;
    const sample = paths.slice(0, 4).join(", ");
    throw new Error(stacking
      ? `This proposal also changes ${sample}, which another open proposal changes. Accept or reject that proposal before stacking.`
      : `This proposal changes ${sample}, which an open proposal also changes. Pass stack_on true to build on the preceding proposal.`);
  }
}

function proposalAncestry(proposal, proposals) {
  const byId = new Map();
  for (const event of proposals || []) {
    if (Number.isInteger(event?.id) && event.proposal) byId.set(event.id, event.proposal);
  }
  const chain = [];
  const seen = new Set();
  let current = proposal;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    const parentId = isReviewPatch(current) ? current.stacksOn : null;
    if (!Number.isInteger(parentId)) break;
    const parent = byId.get(parentId);
    if (!parent || seen.has(parent)) break;
    current = parent;
  }
  return chain.reverse();
}

function stackedBaseDocument(baseline, preceding, openProposals) {
  if (!preceding?.proposal) return baseline;
  return documentForProposal(baseline, preceding.proposal, openProposals);
}

/** The still-open proposal this one builds on, if its accept has to come first. */
export function openStackPredecessor(event, openProposals) {
  const parentId = isReviewPatch(event?.proposal) ? event.proposal.stacksOn : null;
  if (!Number.isInteger(parentId)) return null;
  return (openProposals || []).find(item => item?.id === parentId) || null;
}

/**
 * The patch to file from a review's baseline and the edited working copy.
 * Overlap with an open proposal requires stack_on. Stacking takes the
 * overlapping before-values from the preceding proposal's after-values.
 */
export function fileReviewProposal({
  baseline,
  edited,
  openProposals = [],
  stackOn = false,
  stackLoaded = false,
  baseDraftRevision = null
}) {
  if (!baseline || typeof baseline !== "object" || !edited || typeof edited !== "object") {
    throw new Error("A review proposal needs the baseline and the edited draft.");
  }
  const preceding = openProposals.length ? openProposals[openProposals.length - 1] : null;
  if (stackOn && !preceding) throw new Error("There is no preceding review to stack on.");

  let changes;
  let stacksOn = null;
  let composed = edited;
  if (stackOn) {
    const precedingChanges = proposalChanges(preceding.proposal, baseline);
    const stackedBase = stackedBaseDocument(baseline, preceding, openProposals);
    changes = stackLoaded
      ? fieldChanges(stackedBase, edited)
      : retargetReviewChanges(fieldChanges(baseline, edited), stackedBase);
    if (!changes.length) {
      throw new Error("This draft matches the preceding review; add a change or file an independent review.");
    }
    if (overlappingPaths(changes, precedingChanges).length && Number.isInteger(preceding.id)) {
      stacksOn = preceding.id;
    }
    composed = applyReviewChanges(stackedBase, changes, { force: true }).document;
    overlapError(changes, openProposals.slice(0, -1), baseline, { stacking: true });
  } else {
    changes = fieldChanges(baseline, edited);
    if (!changes.length) throw new Error("This draft matches the review baseline; nothing to propose.");
    overlapError(changes, openProposals, baseline);
  }
  return {
    patch: reviewPatchDocument(baseDraftRevision, changes, { stacksOn }),
    document: composed
  };
}

/** Apply after-values. A change whose before-value no longer matches is left in `stale` unless force is set. */
export function applyReviewChanges(document, changes, { force = false } = {}) {
  const next = document && typeof document === "object" ? clone(document) : {};
  const stale = [];
  const applied = [];
  for (const change of changes || []) {
    const current = readChange(next, change);
    const fresh = valuesEqual(current, change.before);
    if (!fresh && !force) {
      stale.push({ ...change, current: clone(current) });
      continue;
    }
    if (!writeChange(next, change)) {
      stale.push({ ...change, current: clone(current) });
      continue;
    }
    applied.push(change.path);
  }
  return { document: next, stale, applied };
}

export function staleReviewChanges(document, changes) {
  return (changes || []).flatMap(change => {
    const current = readChange(document, change);
    if (valuesEqual(current, change.before)) return [];
    return [{ ...change, current: clone(current) }];
  });
}

/**
 * The puzzle a proposal describes, for checks that still need a document.
 * A stacked patch includes its ancestors, oldest first, so a field an
 * ancestor changed and this patch left alone is still present.
 */
export function documentForProposal(baseline, proposal, proposals = []) {
  const chain = proposalAncestry(proposal, proposals);
  if (chain.length === 1 && !isReviewPatch(chain[0])) return chain[0];
  let document = baseline && typeof baseline === "object" ? clone(baseline) : {};
  for (const item of chain) {
    if (isReviewPatch(item)) {
      document = applyReviewChanges(document, item.changes, { force: true }).document;
    } else if (item && typeof item === "object") {
      document = clone(item);
    }
  }
  return document;
}

/**
 * Saves that would make a still-fresh proposal stale. A proposal that is
 * already stale on those fields does not interrupt again.
 */
export function freshProposalOverlaps(beforeDocument, afterDocument, proposals, legacyAnchor = null) {
  const saved = fieldChanges(beforeDocument, afterDocument);
  if (!saved.length) return [];
  const hits = [];
  for (const event of proposals || []) {
    const anchor = typeof legacyAnchor === "function" ? legacyAnchor(event) : legacyAnchor;
    if (!isReviewPatch(event?.proposal) && anchor == null && typeof legacyAnchor === "function") continue;
    const changes = proposalChanges(event?.proposal, anchor || beforeDocument);
    const paths = [];
    for (const change of changes) {
      if (!saved.some(item => pathsOverlap(item.path, change.path))) continue;
      if (!valuesEqual(readChange(beforeDocument, change), change.before)) continue;
      paths.push(change.path);
    }
    if (paths.length) hits.push({ event, paths });
  }
  return hits;
}

function snippet(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    const text = value.content?.text || value.fact || value.prompt || value.text;
    if (typeof text === "string" && text.trim()) return text.trim();
  }
  return "";
}

export function reviewChangeSummary(change) {
  const text = snippet(change?.after);
  const clipped = text.length > 160 ? `${text.slice(0, 159)}…` : text;
  if (change?.op === "remove") return `Remove ${change.path}`;
  if (change?.op === "add") return clipped ? `Add ${change.path}: ${clipped}` : `Add ${change.path}`;
  return clipped ? `${change.path}: ${clipped}` : `${change.path} changed`;
}

export function formatReviewValue(value) {
  if (value == null) return "(absent)";
  const text = snippet(value);
  if (text) return text.length > 240 ? `${text.slice(0, 239)}…` : text;
  const json = JSON.stringify(value);
  return json.length > 240 ? `${json.slice(0, 239)}…` : json;
}
