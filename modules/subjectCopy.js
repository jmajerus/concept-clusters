// Player copy for subjects terminology-mcp owns (docs/dev-briefs/
// subjects-from-terminology-mcp.md, "The category editor"). Structure --
// titles, domains, which subcategories exist -- comes from the published
// row the subscriber writes; the editor and its working copy carry only the
// `info` of a category or domain and of each subcategory. Applying that copy
// onto the current published row is how it is saved and published, so a
// working copy opened before a synced change can never undo it.

import { keyOf } from "./subjectsSubscriber.js";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// { info?, subcategories: { id: info } } -- only what a person writes here.
export function copyOf(document) {
  const subcategories = {};
  for (const [id, definition] of Object.entries(document?.subcategories || {})) {
    if (definition?.info) subcategories[id] = clone(definition.info);
  }
  return { ...(document?.info ? { info: clone(document.info) } : {}), subcategories };
}

// The structure document with this copy on it. Copy for a subcategory the
// structure no longer has is dropped; one the structure gained keeps its own.
export function applyCopy(structure, copy) {
  const next = clone(structure);
  if (copy?.info) next.info = clone(copy.info);
  else delete next.info;
  for (const [id, definition] of Object.entries(next.subcategories || {})) {
    const info = copy?.subcategories?.[id];
    if (info) definition.info = clone(info);
    else delete definition.info;
  }
  return next;
}

export function copyDiffers(left, right) {
  return JSON.stringify(copyOf(left)) !== JSON.stringify(copyOf(right));
}

// Which ids the subjects mirror holds, with their terminology-mcp term ids
// for links: { domains: Map, categories: Map, subcategories: Map("cat--sub") }.
// Null without a mirror (no subscriber cursor yet).
export function subjectIndex(terms) {
  if (!terms) return null;
  const index = { domains: new Map(), categories: new Map(), subcategories: new Map() };
  for (const [termId, term] of Object.entries(terms)) {
    if (term.status === "retired") continue;
    const key = keyOf(terms, termId);
    if (key?.depth === 0) index.domains.set(key.domain, termId);
    else if (key?.depth === 1) index.categories.set(key.category, termId);
    else if (key?.depth === 2) index.subcategories.set(`${key.category}--${key.sub}`, termId);
  }
  return index;
}

// Subjects a player would see without a blurb: the category or domain
// itself and each subcategory, as { id, sub?, title }.
export function missingCopy(document) {
  const missing = [];
  if (!document?.info?.text?.trim()) missing.push({ id: document.id, title: document.title || document.id });
  for (const [sub, definition] of Object.entries(document?.subcategories || {})) {
    if (!definition?.info?.text?.trim()) missing.push({ id: document.id, sub, title: definition?.title || sub });
  }
  return missing;
}

export function terminologyTermHref(baseUrl, termId) {
  return `${baseUrl}/?scheme=cc-subjects#${encodeURIComponent(termId)}`;
}
