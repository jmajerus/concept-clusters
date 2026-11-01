// Domains are published documents ({ id, title, info? }), the top terms of
// terminology-mcp's cc-subjects scheme. puzzles/domains.js is the snapshot
// Freeze writes; the live rows replace it in place, so every reader of
// DOMAINS sees them: the player from the play corpus or public index, the
// authoring server from Postgres.

import { DOMAINS, RESERVED_DOMAIN_IDS } from "../puzzles/domains.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// The git snapshot as loaded, before live rows replace DOMAINS: the player
// copy a domain's first published row starts from.
export const DOMAINS_SNAPSHOT = Object.freeze(clone(DOMAINS));

// Published domain documents → the DOMAINS shape, keyed by id. The
// generated `other` domain is never published.
export function domainsRegistryFromDocuments(documents = []) {
  const domains = {};
  for (const document of documents) {
    const id = typeof document?.id === "string" ? document.id : "";
    const title = typeof document?.title === "string" ? document.title.trim() : "";
    if (!id || !title || RESERVED_DOMAIN_IDS.has(id)) continue;
    domains[id] = { title, ...(document.info ? { info: clone(document.info) } : {}) };
  }
  return domains;
}

// An empty registry (no domain rows yet) keeps the snapshot.
export function replaceDomainsRegistry(next) {
  if (!next || typeof next !== "object" || !Object.keys(next).length) return DOMAINS;
  for (const key of Object.keys(DOMAINS)) delete DOMAINS[key];
  Object.assign(DOMAINS, next);
  return DOMAINS;
}

// Server side: load the published domain rows and install them. Returns the
// registry in use.
export async function refreshDomainsRegistry(repository) {
  if (typeof repository?.listPublished !== "function") return DOMAINS;
  const rows = await repository.listPublished({ kind: "domain" });
  return replaceDomainsRegistry(domainsRegistryFromDocuments(rows.map(row => row.document)));
}

// A domain document as it is published: { id, title, info? }.
export function validateDomainDocument(raw) {
  const errors = [];
  const id = typeof raw?.id === "string" ? raw.id : "";
  const title = typeof raw?.title === "string" ? raw.title.trim() : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(`domain id "${id}" must be a URL-safe slug`);
  if (RESERVED_DOMAIN_IDS.has(id)) errors.push(`domain id "${id}" is reserved`);
  if (!title) errors.push("domain title must be a non-empty string");
  if (raw?.info !== undefined && (typeof raw.info?.text !== "string" || !raw.info.text.trim())) {
    errors.push("domain info must be an object with non-empty text");
  }
  return {
    valid: errors.length === 0,
    errors,
    document: errors.length ? null : { id, title, ...(raw.info ? { info: clone(raw.info) } : {}) }
  };
}
