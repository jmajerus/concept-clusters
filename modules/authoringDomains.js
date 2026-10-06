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
  MCP_EXCLUDED_ROOT_FIELDS,
  WRITE_ONCE_ROOT_FIELDS,
  CLASSIFICATION_ROOT_FIELDS,
  CLASSIFICATION_STORED_ROOT_FIELDS,
  PEDAGOGY_BRIDGE_FIELDS,
  PEDAGOGY_ROOT_FIELDS,
  PEDAGOGY_STORED_ROOT_FIELDS,
  PROTECTED_ROOT_FIELDS,
  ROOT_FIELD_OWNERSHIP,
  ADMINISTRATION_ROOT_FIELDS,
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

// Empty administration values are dropped rather than stored.
function hasAdministrationValue(value) {
  return Array.isArray(value) ? value.length > 0
    : isObject(value) && Object.keys(value).length > 0;
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
 * MCP agents do not author protected attribution/editorial fields. The
 * storage and human-editor paths may still retain these values, so reject
 * them at the agent write boundary instead of silently accepting edits.
 */
export function assertNoAgentProtectedFields(document, label = "MCP document") {
  if (!isObject(document)) return document;
  for (const key of MCP_EXCLUDED_ROOT_FIELDS) {
    if (hasOwn(document, key)) {
      throw new Error(`${label}.${key} is protected and outside the MCP authoring contract`);
    }
  }
  const introduction = document.learningIntroduction;
  if (isObject(introduction) && hasOwn(introduction, "credit")) {
    throw new Error(
      `${label}.learningIntroduction.credit is human-managed and outside the MCP authoring contract`
    );
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

function stableDocument(value) {
  if (Array.isArray(value)) return value.map(stableDocument);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stableDocument(value[key])])
  );
}

export function sameStoredDocument(left, right) {
  return JSON.stringify(stableDocument(left)) === JSON.stringify(stableDocument(right));
}

/**
 * Remove repository-owned metadata from a simplified authoring document.
 *
 * Old drafts and generated puzzle files can be read once. A newly saved
 * document cannot make an agent reproduce revision tokens or file stamps.
 * `dateCreated` and `dateModified` are those stamps: they live on the
 * published row (`first_published_at`, `published_at`) and are dropped here.
 * `large` is derived at read time and is never stored.
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
  if (hasOwn(next, "large")) {
    if (next === document) next = { ...document };
    delete next.large;
  }
  const introduction = next.learningIntroduction;
  if (isObject(introduction) && hasOwn(introduction, "revision")) {
    if (next === document) next = { ...document };
    next.learningIntroduction = { ...introduction };
    delete next.learningIntroduction.revision;
  }
  return next;
}

export function publicationDocument(kind, document) {
  assertCurrentAuthoredDocument(document, `${kind} document`);
  const stripped = stripSystemAuthoredMetadata(document);
  // Puzzle documents use `domain` for authoring-partition metadata, so the
  // strip removes it. On a category document the same key is the subject
  // domain and must survive publication.
  if (kind === "category" && typeof document.domain === "string" && document.domain) {
    return { ...stripped, domain: document.domain };
  }
  return stripped;
}

export function puzzleDocumentFromStorage(document) {
  return stripSystemAuthoredMetadata(document);
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
  const classification = {};
  let provenance;
  let administration;

  for (const [key, value] of Object.entries(authored)) {
    if (key === "bridges") continue;
    if (key === "provenance") {
      provenance = clone(value);
    } else if (ADMINISTRATION_ROOT_FIELDS.has(key)) {
      // Split this off before the content fallback. An unknown key would
      // otherwise become content, and a content save could replace it.
      if (hasAdministrationValue(value)) {
        administration ||= {};
        administration[key] = clone(value);
      }
    } else if (CLASSIFICATION_STORED_ROOT_FIELDS.has(key)) {
      classification[key] = clone(value);
    } else if (PEDAGOGY_STORED_ROOT_FIELDS.has(key)) {
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
    classification,
    administration,
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
  classification = {},
  administration = undefined,
  provenance = undefined
} = {}) {
  assertObject(content, "Content domain");
  assertObject(pedagogy, "Pedagogy domain");
  assertObject(classification, "Classification domain");
  const document = clone(content);
  if (hasOwn(content, "bridges")) {
    document.bridges = assembleBridges(content.bridges, pedagogy.bridges);
  }
  for (const [key, value] of Object.entries(pedagogy)) {
    if (key === "bridges") continue;
    document[key] = clone(value);
  }
  for (const [key, value] of Object.entries(classification)) {
    document[key] = clone(value);
  }
  if (administration !== undefined && administration !== null) {
    assertObject(administration, "Administration domain");
  }
  if (isObject(administration) && Object.keys(administration).length) {
    // Local draft files written before the envelope stored board flags as the
    // whole projection; they take the envelope shape on their next write.
    if (Object.keys(administration).some(key => ADMINISTRATION_ROOT_FIELDS.has(key))) {
      const unknownEnvelopeKeys = Object.keys(administration)
        .filter(key => !ADMINISTRATION_ROOT_FIELDS.has(key));
      if (unknownEnvelopeKeys.length) {
        throw new Error(
          `Administration envelope contains unsupported field${unknownEnvelopeKeys.length === 1 ? "" : "s"}: ${unknownEnvelopeKeys.join(", ")}`
        );
      }
      for (const [key, value] of Object.entries(administration)) {
        if (hasAdministrationValue(value)) document[key] = clone(value);
      }
    } else {
      document.board = clone(administration);
    }
  } else {
    for (const key of ADMINISTRATION_ROOT_FIELDS) delete document[key];
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

function contextForDomain(source, domainName) {
  const result = {};
  if (!isObject(source)) return result;
  for (const [key, meta] of Object.entries(ROOT_FIELD_OWNERSHIP)) {
    if (!meta.contextFor?.includes(domainName) || !hasOwn(source, key)) continue;
    result[key] = clone(source[key]);
  }
  return result;
}

function omitClassificationFields(domain) {
  if (!isObject(domain)) return domain;
  const next = { ...domain };
  for (const key of CLASSIFICATION_STORED_ROOT_FIELDS) delete next[key];
  return next;
}

// tags and level joined classification after classification_json already
// existed, so older rows still store them on the pedagogy projection.
const LEGACY_PEDAGOGY_SHELF_FIELDS = ["tags", "level"];

function adoptLegacyShelfFields(classification, sources) {
  // A non-object projection is invalid stored data. Leave it untouched so
  // assembleAuthoredDocument rejects it instead of silently normalizing it
  // to an empty shelf that a later save could overwrite.
  if (!isObject(classification)) return classification;
  const next = { ...classification };
  for (const key of LEGACY_PEDAGOGY_SHELF_FIELDS) {
    if (hasOwn(next, key)) continue;
    for (const source of sources) {
      if (isObject(source) && hasOwn(source, key)) {
        next[key] = clone(source[key]);
        break;
      }
    }
  }
  return next;
}

export function projectionHoldsLegacyShelfFields(value) {
  if (value == null || value === "") return false;
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return false;
    }
  }
  if (!isObject(parsed)) return false;
  return LEGACY_PEDAGOGY_SHELF_FIELDS.some(key => hasOwn(parsed, key));
}

/**
 * Choose which stored domain columns a focused save should write.
 * A missing classification column, or tags/level still stored on a sibling
 * projection, rewrites every column from the freshly partitioned document
 * so those shelf fields are not kept twice and a later clear can stick.
 */
export function domainColumnsForSave(current, domain, next) {
  const needsSplit = current?.classification == null;
  const needsShelfMove = !needsSplit && (
    projectionHoldsLegacyShelfFields(current?.pedagogy) ||
    projectionHoldsLegacyShelfFields(current?.content)
  );
  const rewriteAll = needsSplit || needsShelfMove;
  return {
    content: domain === "content" || current?.content == null || rewriteAll
      ? next.content
      : current.content,
    pedagogy: domain === "pedagogy" || current?.pedagogy == null || rewriteAll
      ? next.pedagogy
      : current.pedagogy,
    classification: domain === "classification" || rewriteAll
      ? next.classification
      : current.classification,
    provenance: next.provenance,
    administration: next.administration
  };
}

/**
 * Return an agent-facing projection. Pedagogy receives content as read-only
 * context because annotations reference clusters and bridges. Content and
 * pedagogy also receive classification as read-only context. Classification
 * receives id and title. Only the returned `document` is writable.
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
    return {
      domain,
      document: publicDomain(domains.content),
      context: publicDomain(domains.classification)
    };
  }
  if (domain === "classification") {
    return {
      domain,
      document: publicDomain(domains.classification),
      context: contextForDomain(domains.content, "classification")
    };
  }
  return {
    domain,
    document: publicPedagogyDomain(domains.pedagogy),
    context: {
      ...publicDomain(domains.content),
      ...publicDomain(domains.classification)
    }
  };
}

/**
 * A write-once field is set when the draft is born and never moved by a save.
 * Enforced here, against the stored document, because the ownership map is
 * where "who may write this" is declared and this is the one rule that needs
 * the previous value to check. Dropping the field counts as moving it: the
 * repository recomputes storage keys from the document, so an omitted id
 * nulls `puzzle_id` while the row stays keyed by `draft_id` -- the two halves
 * of an identity pulling apart, which is what this exists to prevent.
 *
 * A field still absent from the stored document is not yet set, so a draft
 * mid-authoring can still acquire one. `allowAbsent` is for partial payloads
 * (domain projections), where silence about a field is not a claim about it.
 */
/**
 * Carries `status` so the admin JSON routes, which already map a 400-shaped
 * error to a client error, report this as one rather than rethrowing it as an
 * unhandled fault.
 */
export class WriteOnceFieldError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "WriteOnceFieldError";
    this.status = 400;
    this.field = field;
  }
}

export function assertNoWriteOnceDrift(
  currentDocument,
  incoming,
  label = "MCP document",
  { allowAbsent = false } = {}
) {
  if (!incoming || typeof incoming !== "object") return;
  for (const key of WRITE_ONCE_ROOT_FIELDS) {
    const current = currentDocument?.[key];
    if (current === undefined) continue;
    const next = incoming[key];
    if (next === current) continue;
    // A domain projection is partial by design: a pedagogy payload does not
    // carry the id and is not dropping it by staying silent. A complete save
    // that omits it is a different act, and is drift.
    if (next === undefined && allowAbsent) continue;
    const attempted = next === undefined
      ? "the save dropped it"
      : `the save supplied ${JSON.stringify(next)}`;
    throw new WriteOnceFieldError(
      `${label}: ${key} is set when a draft is created and cannot change on a `
      + `save. This draft's ${key} is ${JSON.stringify(current)} and ${attempted}. `
      + "Changing it is a deliberate human action on the drafts page "
      + "(Puzzle id -> Rename puzzle), which checks the new id is free and "
      + "moves the working copy to it.",
      key
    );
  }
}

function assertDomainPayload(domain, incoming) {
  assertObject(incoming, `${domain} domain document`);
  assertNoAgentProtectedFields(incoming, `${domain} domain document`);
  assertNoRetiredAuthoringFields(incoming, `${domain} domain document`);
  for (const key of Object.keys(incoming)) {
    if (PROTECTED_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} is protected and cannot be written through the ${domain} domain`);
    }
    if (DERIVED_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} is derived and cannot be written through the ${domain} domain`);
    }
    if (domain === "content" && CLASSIFICATION_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the classification domain`);
    }
    if (domain === "content" && PEDAGOGY_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the pedagogy domain`);
    }
    if (domain === "classification" && !CLASSIFICATION_ROOT_FIELDS.has(key)) {
      const owner = PEDAGOGY_ROOT_FIELDS.has(key) ? "pedagogy" : "content";
      throw new Error(`${key} belongs to the ${owner} domain`);
    }
    if (domain === "pedagogy" && key !== "bridges" && CLASSIFICATION_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the classification domain`);
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
  assertNoWriteOnceDrift(
    currentDocument,
    incoming,
    `${domain} domain document`,
    { allowAbsent: true }
  );
  const current = partitionAuthoredDocument(currentDocument);
  if (domain === "pedagogy") {
    assertPedagogyBridgeIdentities(current.content.bridges, incoming.bridges);
  }
  const next = {
    content: current.content,
    pedagogy: current.pedagogy,
    classification: current.classification,
    administration: current.administration,
    provenance: current.provenance
  };
  if (domain === "content") {
    // A focused payload is the complete selected projection. Replacing it
    // makes omission meaningful (for example, removing an optional info
    // field), while the other logical domains remain untouched.
    next.content = clone(incoming);
  } else if (domain === "classification") {
    next.classification = clone(incoming);
  } else {
    const preservedProtected = Object.fromEntries(
      [...PEDAGOGY_STORED_ROOT_FIELDS]
        .filter(key => PROTECTED_ROOT_FIELDS.has(key) && hasOwn(current.pedagogy, key))
        .map(key => [key, clone(current.pedagogy[key])])
    );
    next.pedagogy = { ...clone(incoming), ...preservedProtected };
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
  return assembleAuthoredDocument(next);
}

export function storedDomainDocuments(document) {
  const domains = partitionAuthoredDocument(document);
  return {
    content: JSON.stringify(domains.content),
    pedagogy: JSON.stringify(domains.pedagogy),
    classification: JSON.stringify(domains.classification),
    provenance: domains.provenance === undefined
      ? null
      : JSON.stringify(domains.provenance),
    administration: domains.administration === undefined
      ? null
      : JSON.stringify(domains.administration)
  };
}

export function assembleStoredDomainDocuments({
  document,
  content = null,
  pedagogy = null,
  classification = null,
  provenance = null,
  administration = null
} = {}) {
  const fallback = document ? partitionAuthoredDocument(document) : null;
  // A stored classification column is authoritative, including when it omits
  // a field. Legacy rows leave the column null and still carry those fields
  // inside the content and pedagogy blobs. tags and level that still sit on
  // a sibling projection are adopted when the classification column lacks
  // that key, then stripped, so a read does not drop them.
  const classificationProvided = classification !== null && classification !== undefined;
  const contentSource = content ?? fallback?.content ?? {};
  const pedagogySource = pedagogy ?? fallback?.pedagogy ?? {};
  return assembleAuthoredDocument({
    content: classificationProvided
      ? omitClassificationFields(contentSource)
      : contentSource,
    pedagogy: classificationProvided
      ? omitClassificationFields(pedagogySource)
      : pedagogySource,
    classification: classificationProvided
      ? adoptLegacyShelfFields(classification, [pedagogySource, contentSource])
      : (fallback?.classification ?? {}),
    provenance: provenance ?? fallback?.provenance,
    administration: administration ?? fallback?.administration
  });
}

/**
 * Assemble the authored puzzle from a raw puzzle_drafts row. Domain columns
 * are authoritative when present; a stale `document` cache is ignored as a
 * source of truth so maintenance tools do not rewrite from an outdated blob.
 * Stale rows must carry both durable write-domain projections; the legacy
 * document fallback is reserved for non-stale (pre-domain or synchronized) rows.
 */
export function assembleAuthoredDocumentFromDraftRow(row, {
  parseJson = (text, label) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`${label} contains invalid JSON: ${error.message}`);
    }
  }
} = {}) {
  if (!row || typeof row !== "object") {
    throw new Error("Draft row must be an object");
  }
  const content = row.content_json == null
    ? null
    : parseJson(row.content_json, "Stored content domain");
  const pedagogy = row.pedagogy_json == null
    ? null
    : parseJson(row.pedagogy_json, "Stored pedagogy domain");
  const classification = row.classification_json == null
    ? null
    : parseJson(row.classification_json, "Stored classification domain");
  const provenance = row.provenance_json == null
    ? null
    : parseJson(row.provenance_json, "Stored provenance domain");
  const administration = row.administration_json == null
    ? null
    : parseJson(row.administration_json, "Stored administration domain");
  const stale = Number(row.document_stale || 0) === 1;
  if (stale) {
    if (content == null || pedagogy == null) {
      throw new Error(
        "Stale draft row is missing durable content/pedagogy projections"
      );
    }
    return assembleStoredDomainDocuments({
      document: undefined,
      content,
      pedagogy,
      classification,
      provenance,
      administration
    });
  }
  if (content != null || pedagogy != null || classification != null || provenance != null || administration != null) {
    return assembleStoredDomainDocuments({
      document: row.document == null
        ? undefined
        : (typeof row.document === "string"
          ? parseJson(row.document, "Stored draft")
          : row.document),
      content,
      pedagogy,
      classification,
      provenance,
      administration
    });
  }
  if (row.document == null) {
    throw new Error("Draft row has neither domain columns nor a document");
  }
  return assembleStoredDomainDocuments({
    document: typeof row.document === "string"
      ? parseJson(row.document, "Stored draft")
      : row.document
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
  assembleAuthoredDocumentFromDraftRow,
  stripSystemAuthoredMetadata,
  publicationDocument,
  puzzleDocumentFromStorage
};
