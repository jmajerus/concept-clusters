// Logical authoring domains. These are deliberately separate from the
// simplified puzzle document that the player and publication paths consume.
// A domain projection reduces an agent's context and write payload; the
// canonical document is materialized again at the infrastructure boundary.
//
// Field membership comes from authoringFieldOwnership.js so domain
// projections and phase schemas stay aligned.

import {
  AUTHORING_DOMAINS,
  AUTHORING_READ_DOMAINS,
  AUTHORING_WRITE_DOMAINS,
  DERIVED_ROOT_FIELDS,
  PEDAGOGY_BRIDGE_FIELDS,
  PEDAGOGY_ROOT_FIELDS,
  PROTECTED_ROOT_FIELDS,
  RETIRED_ROOT_FIELDS,
  SYSTEM_ROOT_FIELDS
} from "./authoringFieldOwnership.js";

export {
  AUTHORING_DOMAINS,
  AUTHORING_READ_DOMAINS,
  AUTHORING_WRITE_DOMAINS,
  SYSTEM_ROOT_FIELDS
};

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

/**
 * Retired authoring fields are hard errors. Invalid intermediate drafts are
 * otherwise intentionally writable, but allowing this field through would
 * quietly resurrect an attribution model that no longer exists.
 */
export function assertNoRetiredAuthoringFields(document, label = "Authored document") {
  if (!isObject(document)) return document;
  for (const key of RETIRED_ROOT_FIELDS) {
    if (hasOwn(document, key)) {
      throw new Error(`${label} contains retired field ${key}; remove it before continuing`);
    }
  }
  return document;
}

/**
 * Documents stored by the current authoring workflow are simplified JSON,
 * never JSON-LD. JSON-LD remains available through the explicit interchange
 * adapter, but a row or domain projection containing @context is corrupt for
 * this repository contract and must fail closed.
 */
export function assertCurrentAuthoredDocument(document, label = "Authored document") {
  assertObject(document, label);
  if (hasOwn(document, "@context")) {
    throw new Error(
      `${label} contains JSON-LD; current authoring/storage rows require the simplified format`
    );
  }
  return assertNoRetiredAuthoringFields(document, label);
}

/**
 * Remove repository-owned metadata from a simplified authoring document.
 *
 * This is deliberately a compatibility fold rather than a JSON-LD fold:
 * JSON-LD remains allowed to carry its own publication metadata at the
 * explicit interchange boundary.  Old drafts and generated puzzle files can
 * therefore be read once, while newly saved authoring documents cannot make
 * an agent reproduce timestamps or revision tokens.
 */
export function stripSystemAuthoredMetadata(document) {
  if (!isObject(document) || Object.hasOwn(document, "@context")) return document;
  assertNoRetiredAuthoringFields(document);
  let next = document;
  for (const key of SYSTEM_ROOT_FIELDS) {
    if (!hasOwn(document, key)) continue;
    if (next === document) next = { ...document };
    delete next[key];
  }
  const introduction = document.learningIntroduction;
  if (isObject(introduction) && hasOwn(introduction, "revision")) {
    if (next === document) next = { ...document };
    next.learningIntroduction = { ...introduction };
    delete next.learningIntroduction.revision;
  }
  return next;
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
  assertCurrentAuthoredDocument(document, "Authored document");
  const authored = stripSystemAuthoredMetadata(document);
  const content = {};
  const pedagogy = {};
  let provenance;

  for (const [key, value] of Object.entries(authored)) {
    if (key === "bridges") continue;
    if (key === "provenance") {
      provenance = clone(value);
    } else if (PEDAGOGY_ROOT_FIELDS.has(key)) {
      pedagogy[key] = clone(value);
    } else {
      // Keep unknown authored fields in content for forward compatibility.
      // Explicitly-known system fields were stripped above and can never be
      // smuggled into a domain projection.
      content[key] = clone(value);
    }
  }

  const bridges = splitBridges(authored.bridges);
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
  return assertCurrentAuthoredDocument(
    stripSystemAuthoredMetadata(document),
    "Assembled authored document"
  );
}

function publicDomain(value) {
  const result = stripSystemAuthoredMetadata(clone(value) || {}) || {};
  // `large` is derived at the canonical boundary and is never useful in an
  // agent's context or write payload.
  delete result.large;
  // These are either repository envelope fields or protected document
  // metadata. Keep them out of focused domain projections even when an old
  // stored row happens to contain them inside its document blob.
  for (const key of PROTECTED_ROOT_FIELDS) delete result[key];
  if (isObject(result.learningIntroduction)) {
    delete result.learningIntroduction.revision;
  }
  return result;
}

function publicPedagogyDomain(value) {
  const result = publicDomain(value);
  // `learningIntroduction.credit` is a legacy human-owned byline. It is
  // parsed into provenance by the canonicalization path, so it is protected
  // even though its containing learningIntroduction belongs to pedagogy.
  if (isObject(result.learningIntroduction)) {
    delete result.learningIntroduction.credit;
  }
  return result;
}

/**
 * Return an agent-facing projection. Pedagogy receives content as read-only
 * context because annotations reference clusters and bridges, but only the
 * returned `document` is writable.
 */
export function projectAuthoredDocument(document, domain = "complete") {
  if (domain === "complete") {
    return { domain, document: stripSystemAuthoredMetadata(clone(document)) };
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
    document: publicPedagogyDomain(domains.pedagogy),
    context: publicDomain(domains.content)
  };
}

function assertDomainPayload(domain, incoming) {
  assertObject(incoming, `${domain} domain document`);
  assertNoRetiredAuthoringFields(incoming, `${domain} domain document`);
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

  if (isObject(incoming.learningIntroduction) &&
      hasOwn(incoming.learningIntroduction, "revision")) {
    throw new Error(
      "learningIntroduction.revision is system-managed and cannot be written through " +
      `the ${domain} domain`
    );
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

  if (domain === "pedagogy" && isObject(incoming.learningIntroduction) &&
      hasOwn(incoming.learningIntroduction, "credit")) {
    throw new Error(
      "learningIntroduction.credit is protected and cannot be written through the pedagogy domain"
    );
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
    // A focused payload is the complete selected projection. Replacing it
    // makes omission meaningful (for example, removing an optional info
    // field), while the other logical domains remain untouched.
    next.content = clone(incoming);
  } else {
    next.pedagogy = clone(incoming);
    if (hasOwn(incoming, "bridges")) {
      next.pedagogy.bridges = splitDomainBridges(incoming.bridges);
    }
    // The focused projection omits this legacy field. Preserve it when the
    // lesson itself remains present; deleting the whole lesson remains a
    // legitimate pedagogy-domain replacement and cannot feed credit back
    // through canonicalization.
    const currentIntroduction = current.pedagogy.learningIntroduction;
    const incomingIntroduction = next.pedagogy.learningIntroduction;
    if (isObject(currentIntroduction) && hasOwn(currentIntroduction, "credit") &&
        isObject(incomingIntroduction)) {
      next.pedagogy.learningIntroduction = {
        ...incomingIntroduction,
        credit: clone(currentIntroduction.credit)
      };
    }
  }
  const assembled = assembleAuthoredDocument(next);
  // `large` is derived and absent from focused payloads, but preserving an
  // existing value keeps the complete materialized snapshot stable until the
  // normal canonical boundary recomputes it.
  if (hasOwn(currentDocument, "large")) {
    assembled.large = clone(currentDocument.large);
  }
  return assembled;
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
  SYSTEM_ROOT_FIELDS,
  assertNoRetiredAuthoringFields,
  assertCurrentAuthoredDocument,
  partitionAuthoredDocument,
  assembleAuthoredDocument,
  projectAuthoredDocument,
  applyAuthoredDomain,
  storedDomainDocuments,
  assembleStoredDomainDocuments,
  stripSystemAuthoredMetadata
};
