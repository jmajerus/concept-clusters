// Logical authoring domains. These are deliberately separate from the
// simplified puzzle document that the player and publication paths consume.
// A domain projection reduces an agent's context and write payload; the
// canonical document is materialized again at the infrastructure boundary.

export const AUTHORING_DOMAINS = Object.freeze([
  "content",
  "pedagogy",
  "provenance",
  "system"
]);

// `complete` is the backwards-compatible whole-document contract. The other
// two values are the only agent-facing write domains. Provenance and system
// remain infrastructure/human controlled and are never accepted as agent
// domains.
export const AUTHORING_READ_DOMAINS = Object.freeze([
  "complete",
  "content",
  "pedagogy"
]);
export const AUTHORING_WRITE_DOMAINS = Object.freeze(["content", "pedagogy"]);

const PEDAGOGY_ROOT_FIELDS = new Set([
  "categories",
  "subcategories",
  "tags",
  "level",
  "lenses",
  "lensMode",
  "preSolve",
  "relatedPuzzles",
  "learningIntroduction",
  "creator",
  "license",
  "derivedFrom",
  "dateCreated",
  "dateModified",
  "language",
  "version"
]);

// These are relationship annotations layered onto a bridge's authored core.
// The agent-facing pedagogy projection keeps the familiar `bridges` shape but
// contains only identity plus these fields. The storage/domain boundary does
// not duplicate bridge facts or cluster membership.
const PEDAGOGY_BRIDGE_FIELDS = new Set([
  "conceptId",
  "relationKind",
  "direction",
  "idealTerms"
]);

const PROTECTED_ROOT_FIELDS = new Set([
  "provenance",
  "schemaVersion",
  "publicationState",
  "validatedAt",
  "createdAt",
  "updatedAt",
  "owner",
  "ownerSubject",
  "owner_subject",
  "revision",
  "contentHash",
  "content_hash",
  "system",
  "context",
  "domains",
  "domain",
  "draftId",
  "draft_id",
  "status",
  "validation",
  "workingCopyHistoryCount",
  "installedContentHash",
  "baseCommitSha"
]);

const DERIVED_ROOT_FIELDS = new Set(["large"]);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function assertObject(value, label) {
  if (!isObject(value)) throw new Error(`${label} must be a JSON object`);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function bridgeIdentity(bridge) {
  const identity = {};
  if (typeof bridge?.id === "string" && bridge.id.trim()) {
    identity.id = bridge.id;
  }
  if (typeof bridge?.term === "string" && bridge.term.trim()) {
    identity.term = bridge.term;
  }
  return identity;
}

function bridgeMatches(left, right, index, candidateIndex) {
  if (left?.id && right?.id && left.id === right.id) return true;
  if (left?.term && right?.term && left.term === right.term) return true;
  return !left?.id && !left?.term && !right?.id && !right?.term
    && candidateIndex === index;
}

function splitBridges(bridges) {
  if (!Array.isArray(bridges)) return { content: bridges, pedagogy: undefined };
  const content = [];
  const pedagogy = [];
  for (const bridge of bridges) {
    if (!isObject(bridge)) {
      content.push(clone(bridge));
      continue;
    }
    const contentBridge = {};
    const pedagogyBridge = {};
    for (const [key, value] of Object.entries(bridge)) {
      if (PEDAGOGY_BRIDGE_FIELDS.has(key)) pedagogyBridge[key] = clone(value);
      else contentBridge[key] = clone(value);
    }
    content.push(contentBridge);
    const identity = bridgeIdentity(bridge);
    if (Object.keys(pedagogyBridge).length || Object.keys(identity).length) {
      Object.assign(pedagogyBridge, identity);
      pedagogy.push(pedagogyBridge);
    }
  }
  return {
    content,
    ...(pedagogy.length ? { pedagogy } : {})
  };
}

function splitDomainBridges(bridges) {
  if (!Array.isArray(bridges)) return bridges;
  return bridges.map(bridge => {
    if (!isObject(bridge)) return clone(bridge);
    const result = {};
    for (const [key, value] of Object.entries(bridge)) {
      if (key === "id" || key === "term" || PEDAGOGY_BRIDGE_FIELDS.has(key)) {
        result[key] = clone(value);
      }
    }
    return result;
  });
}

function assembleBridges(contentBridges, pedagogyBridges) {
  if (!Array.isArray(contentBridges)) return clone(contentBridges);
  const annotations = Array.isArray(pedagogyBridges) ? pedagogyBridges : [];
  const used = new Set();
  return contentBridges.map((bridge, index) => {
    if (!isObject(bridge)) return clone(bridge);
    const annotationIndex = annotations.findIndex((candidate, candidateIndex) => {
      if (used.has(candidateIndex) || !isObject(candidate)) return false;
      return bridgeMatches(
        { ...bridgeIdentity(bridge), index },
        { ...bridgeIdentity(candidate), index: candidateIndex },
        index,
        candidateIndex
      );
    });
    if (annotationIndex < 0) return clone(bridge);
    used.add(annotationIndex);
    const annotation = annotations[annotationIndex];
    const result = clone(bridge);
    for (const key of PEDAGOGY_BRIDGE_FIELDS) {
      if (hasOwn(annotation, key)) result[key] = clone(annotation[key]);
    }
    return result;
  });
}

/**
 * Split a canonical simplified document into logical authoring domains.
 * `system` is supplied by the repository because its values are database
 * metadata rather than fields in the player-facing puzzle document.
 */
export function partitionAuthoredDocument(document, { system = {} } = {}) {
  assertObject(document, "Authored document");
  const content = {};
  const pedagogy = {};
  let provenance;

  for (const [key, value] of Object.entries(document)) {
    if (key === "bridges") continue;
    if (key === "provenance") {
      provenance = clone(value);
    } else if (PEDAGOGY_ROOT_FIELDS.has(key)) {
      pedagogy[key] = clone(value);
    } else {
      // Keep unknown authored fields in content for forward compatibility.
      // Explicitly-known protected fields are not expected in a simplified
      // document, but preserving them here avoids silent data loss when old
      // stored rows are read before their next canonical save.
      content[key] = clone(value);
    }
  }

  const bridges = splitBridges(document.bridges);
  if (bridges.content !== undefined) content.bridges = bridges.content;
  if (bridges.pedagogy) pedagogy.bridges = bridges.pedagogy;

  return {
    content,
    pedagogy,
    provenance,
    system: clone(system) || {}
  };
}

/**
 * Materialize the complete simplified document consumed by validation,
 * rendering, publication, and Freeze. System-domain metadata intentionally
 * remains outside this document.
 */
export function assembleAuthoredDocument({
  content = {},
  pedagogy = {},
  provenance = undefined
} = {}) {
  assertObject(content, "Content domain");
  assertObject(pedagogy, "Pedagogy domain");
  const document = clone(content);
  if (hasOwn(content, "bridges")) {
    document.bridges = assembleBridges(content.bridges, pedagogy.bridges);
  }
  for (const [key, value] of Object.entries(pedagogy)) {
    if (key === "bridges") continue;
    document[key] = clone(value);
  }
  if (provenance !== undefined && provenance !== null) {
    document.provenance = clone(provenance);
  } else {
    delete document.provenance;
  }
  return document;
}

function publicDomain(value) {
  const result = clone(value) || {};
  // `large` is derived at the canonical boundary and is never useful in an
  // agent's context or write payload.
  delete result.large;
  // These are either repository envelope fields or protected document
  // metadata. Keep them out of focused domain projections even when an old
  // stored row happens to contain them inside its document blob.
  for (const key of PROTECTED_ROOT_FIELDS) delete result[key];
  return result;
}

/**
 * Return an agent-facing projection. Pedagogy receives content as read-only
 * context because annotations reference clusters and bridges, but only the
 * returned `document` is writable.
 */
export function projectAuthoredDocument(document, domain = "complete") {
  if (domain === "complete") {
    return { domain, document: clone(document) };
  }
  if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
    throw new Error(`Unknown agent authoring domain: ${domain}`);
  }
  const domains = partitionAuthoredDocument(document);
  if (domain === "content") {
    return { domain, document: publicDomain(domains.content) };
  }
  return {
    domain,
    document: publicDomain(domains.pedagogy),
    context: publicDomain(domains.content)
  };
}

function assertDomainPayload(domain, incoming) {
  assertObject(incoming, `${domain} domain document`);
  for (const key of Object.keys(incoming)) {
    if (PROTECTED_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} is protected and cannot be written through the ${domain} domain`);
    }
    if (DERIVED_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} is derived and cannot be written through the ${domain} domain`);
    }
    if (domain === "content" && PEDAGOGY_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the pedagogy domain`);
    }
    if (domain === "pedagogy" && key !== "bridges" && !PEDAGOGY_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the content domain`);
    }
  }

  if (domain === "content" && Array.isArray(incoming.bridges)) {
    incoming.bridges.forEach((bridge, index) => {
      if (!isObject(bridge)) return;
      for (const key of PEDAGOGY_BRIDGE_FIELDS) {
        if (hasOwn(bridge, key)) {
          throw new Error(`bridges[${index}].${key} belongs to the pedagogy domain`);
        }
      }
    });
  }
  if (domain === "pedagogy" && Array.isArray(incoming.bridges)) {
    incoming.bridges.forEach((bridge, index) => {
      if (!isObject(bridge)) return;
      for (const key of Object.keys(bridge)) {
        if (key !== "id" && key !== "term" && !PEDAGOGY_BRIDGE_FIELDS.has(key)) {
          throw new Error(`bridges[${index}].${key} belongs to the content domain`);
        }
      }
    });
  }
}

function assertPedagogyBridgeIdentities(contentBridges, incomingBridges) {
  if (!Array.isArray(incomingBridges)) return;
  const currentBridges = Array.isArray(contentBridges) ? contentBridges : [];
  incomingBridges.forEach((bridge, index) => {
    if (!isObject(bridge)) return;
    const currentIndex = currentBridges.findIndex((candidate, candidateIndex) =>
      isObject(candidate) && bridgeMatches(candidate, bridge, index, candidateIndex)
    );
    if (currentIndex < 0) {
      throw new Error(
        `bridges[${index}] must identify an existing content bridge in the pedagogy domain`
      );
    }
    const current = currentBridges[currentIndex];
    for (const key of ["id", "term"]) {
      if (hasOwn(bridge, key) && bridge[key] !== current[key]) {
        throw new Error(
          `bridges[${index}].${key} belongs to the content domain and must match the current bridge`
        );
      }
    }
  });
}

/**
 * Apply one domain replacement to the current canonical document. The
 * protected domains are copied from the current document and can therefore
 * not be erased by a focused agent save.
 */
export function applyAuthoredDomain(currentDocument, domain, incoming) {
  if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
    throw new Error(`Only ${AUTHORING_WRITE_DOMAINS.join(" and ")} are agent-writable domains`);
  }
  assertObject(currentDocument, "Current authored document");
  assertDomainPayload(domain, incoming);
  const current = partitionAuthoredDocument(currentDocument);
  if (domain === "pedagogy") {
    assertPedagogyBridgeIdentities(current.content.bridges, incoming.bridges);
  }
  const next = {
    content: current.content,
    pedagogy: current.pedagogy,
    provenance: current.provenance
  };
  if (domain === "content") {
    next.content = { ...current.content, ...clone(incoming) };
  } else {
    next.pedagogy = {
      ...current.pedagogy,
      ...clone(incoming),
      ...(hasOwn(incoming, "bridges")
        ? { bridges: splitDomainBridges(incoming.bridges) }
        : {})
    };
  }
  return assembleAuthoredDocument(next);
}

export function storedDomainDocuments(document) {
  const domains = partitionAuthoredDocument(document);
  return {
    content: JSON.stringify(domains.content),
    pedagogy: JSON.stringify(domains.pedagogy),
    provenance: domains.provenance === undefined
      ? null
      : JSON.stringify(domains.provenance)
  };
}

export function assembleStoredDomainDocuments({
  document,
  content = null,
  pedagogy = null,
  provenance = null
} = {}) {
  const fallback = document ? partitionAuthoredDocument(document) : null;
  return assembleAuthoredDocument({
    content: content ?? fallback?.content ?? {},
    pedagogy: pedagogy ?? fallback?.pedagogy ?? {},
    provenance: provenance ?? fallback?.provenance
  });
}

export default {
  AUTHORING_DOMAINS,
  AUTHORING_READ_DOMAINS,
  AUTHORING_WRITE_DOMAINS,
  partitionAuthoredDocument,
  assembleAuthoredDocument,
  projectAuthoredDocument,
  applyAuthoredDomain,
  storedDomainDocuments,
  assembleStoredDomainDocuments
};
