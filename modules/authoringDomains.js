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
  LESSON_ROOT_FIELDS,
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

export const CITATION_UNION_CONFLICT_FLAG_ID = "citation-union-conflict";
export const CITATION_UNION_AMBIGUITY_FLAG_ID = "citation-union-ambiguity";

const CITATION_FIELDS = ["title", "author", "publisher", "year", "pages", "url"];

function normalizedCitationText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedLooseCitationText(value) {
  return normalizedCitationText(value)
    .toLowerCase()
    .replace(/[.,;:!?'"()[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function citationWorkKey(entry) {
  const title = normalizedCitationText(entry?.title);
  if (!title) return null;
  return `${normalizedCitationText(entry?.author)}\0${title}\0${normalizedCitationText(entry?.year)}`;
}

function citationLabel(entry) {
  return normalizedCitationText(entry?.url) || citationWorkKey(entry);
}

function citationsMatch(left, right) {
  const leftUrl = normalizedCitationText(left?.url);
  const rightUrl = normalizedCitationText(right?.url);
  // A URL identifies the entry whenever both sides have one. Different
  // non-empty URLs are different editions even when author, title, and year
  // agree. The work key applies only when at least one side has no URL.
  if (leftUrl && rightUrl) return leftUrl === rightUrl;
  const leftWork = citationWorkKey(left);
  const rightWork = citationWorkKey(right);
  return !!(leftWork && leftWork === rightWork);
}

function formatCitationHeading(entry) {
  const title = normalizedCitationText(entry?.title)
    || normalizedCitationText(entry?.url)
    || "untitled source";
  const year = normalizedCitationText(entry?.year);
  return year ? `"${title}" (${year})` : `"${title}"`;
}

function citationsNearMatchDiscrepancy(contentEntry, lessonEntry) {
  const contentTitle = normalizedLooseCitationText(contentEntry?.title);
  const lessonTitle = normalizedLooseCitationText(lessonEntry?.title);
  if (!contentTitle || contentTitle !== lessonTitle) return null;
  const contentYear = normalizedCitationText(contentEntry?.year);
  const lessonYear = normalizedCitationText(lessonEntry?.year);
  if (contentYear && lessonYear && contentYear !== lessonYear) return null;

  const differences = [];
  const contentUrl = normalizedCitationText(contentEntry?.url);
  const lessonUrl = normalizedCitationText(lessonEntry?.url);
  if (contentUrl && lessonUrl && contentUrl !== lessonUrl) {
    differences.push(`url (${JSON.stringify(contentUrl)} vs ${JSON.stringify(lessonUrl)})`);
  }
  const contentAuthor = normalizedCitationText(contentEntry?.author);
  const lessonAuthor = normalizedCitationText(lessonEntry?.author);
  if (contentAuthor !== lessonAuthor) {
    differences.push(
      `author (${JSON.stringify(contentAuthor || "(omitted)")} vs ${JSON.stringify(lessonAuthor || "(omitted)")})`
    );
  }
  if (!differences.length) {
    const exactContentTitle = normalizedCitationText(contentEntry?.title);
    const exactLessonTitle = normalizedCitationText(lessonEntry?.title);
    if (exactContentTitle !== exactLessonTitle) {
      differences.push(`title (${JSON.stringify(exactContentTitle)} vs ${JSON.stringify(exactLessonTitle)})`);
    } else if (contentYear !== lessonYear) {
      differences.push(
        `year (${JSON.stringify(contentYear || "(omitted)")} vs ${JSON.stringify(lessonYear || "(omitted)")})`
      );
    }
  }
  return differences.length ? differences.join(", ") : null;
}

/**
 * Union content-owned and lesson-owned citations at read/materialization time.
 * Blank fields on a matched content entry are filled by the lesson entry;
 * conflicting non-empty fields preserve the content value deterministically
 * and emit a conflict flag. Near-matching distinct entries stay in the list
 * and emit an ambiguity flag for human review.
 */
export function unionDomainCitations(contentCitations, lessonCitations) {
  const lessonList = Array.isArray(lessonCitations) ? lessonCitations.filter(isObject) : [];
  if (!lessonList.length) {
    return {
      citations: Array.isArray(contentCitations) ? clone(contentCitations) : [],
      flags: []
    };
  }
  const merged = Array.isArray(contentCitations) ? clone(contentCitations) : [];
  const contentCount = merged.length;
  const flags = [];

  for (const lessonEntry of lessonList) {
    const matchIndex = merged.findIndex(
      candidate => isObject(candidate) && citationsMatch(lessonEntry, candidate)
    );
    if (matchIndex >= 0) {
      const target = merged[matchIndex];
      const disagreements = [];
      const keys = [...new Set([...CITATION_FIELDS, ...Object.keys(lessonEntry)])];
      for (const key of keys) {
        const leftValue = normalizedCitationText(target[key]);
        const rightValue = normalizedCitationText(lessonEntry[key]);
        if (!leftValue && rightValue) {
          target[key] = clone(lessonEntry[key]);
        } else if (leftValue && rightValue && leftValue !== rightValue && matchIndex < contentCount) {
          disagreements.push(
            `${key} (${JSON.stringify(leftValue)} vs ${JSON.stringify(rightValue)})`
          );
        }
      }
      if (disagreements.length) {
        flags.push({
          id: CITATION_UNION_CONFLICT_FLAG_ID,
          message:
            `Content and lesson citations for ${formatCitationHeading(target)} disagree on ` +
            `${disagreements.join(", ")}. Edit puzzle citations and save to reconcile.`
        });
      }
      continue;
    }

    const discrepancy = merged
      .slice(0, contentCount)
      .map(candidate => isObject(candidate) ? citationsNearMatchDiscrepancy(candidate, lessonEntry) : null)
      .find(Boolean);
    merged.push(clone(lessonEntry));
    if (discrepancy) {
      flags.push({
        id: CITATION_UNION_AMBIGUITY_FLAG_ID,
        message:
          `Content and lesson domains both cite ${formatCitationHeading(lessonEntry)} with differing ` +
          `${discrepancy}, so both entries appear in info.citations. Edit puzzle citations and save to merge or keep both.`
      });
    }
  }

  return { citations: merged, flags };
}

export function citationUnionFlags(domainCitations) {
  if (!domainCitations || !Array.isArray(domainCitations.lesson) || !domainCitations.lesson.length) {
    return [];
  }
  return unionDomainCitations(domainCitations.content, domainCitations.lesson).flags;
}

function withInfoCitations(info, citations) {
  const list = Array.isArray(citations) && citations.length ? clone(citations) : null;
  if (!list) {
    if (!isObject(info)) return info;
    const next = { ...info };
    delete next.citations;
    return Object.keys(next).length ? next : undefined;
  }
  if (isObject(info)) return { ...info, citations: list };
  if (typeof info === "string" && info) return { text: info, citations: list };
  return { citations: list };
}

/**
 * Split a canonical simplified document into logical authoring domains.
 * `system` is supplied by the repository because its values are database
 * metadata rather than fields in the player-facing puzzle document.
 */
export function partitionAuthoredDocument(document, { system = {}, domainCitations = null } = {}) {
  assertCurrentAuthoredDocument(document, "Authored document");
  const authored = stripSystemAuthoredMetadata(document);
  const content = {};
  const pedagogy = {};
  const classification = {};
  const lesson = {};
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
    } else if (LESSON_ROOT_FIELDS.has(key)) {
      lesson[key] = clone(value);
    } else if (PEDAGOGY_STORED_ROOT_FIELDS.has(key)) {
      pedagogy[key] = clone(value);
    } else {
      // Keep unknown authored fields in content for forward compatibility.
      // Explicitly-known system fields were stripped above and can never be
      // smuggled into a domain projection.
      content[key] = clone(value);
    }
  }

  if (domainCitations && typeof domainCitations === "object") {
    const nextContentInfo = withInfoCitations(content.info, domainCitations.content);
    if (nextContentInfo === undefined) delete content.info;
    else content.info = nextContentInfo;
    if (Array.isArray(domainCitations.lesson) && domainCitations.lesson.length) {
      lesson.info = { citations: clone(domainCitations.lesson) };
    }
  }

  const bridges = splitBridges(authored.bridges);
  if (bridges.content !== undefined) content.bridges = bridges.content;
  if (bridges.pedagogy) pedagogy.bridges = bridges.pedagogy;

  return {
    content,
    pedagogy,
    classification,
    lesson,
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
  lesson = {},
  administration = undefined,
  provenance = undefined
} = {}) {
  assertObject(content, "Content domain");
  assertObject(pedagogy, "Pedagogy domain");
  assertObject(classification, "Classification domain");
  assertObject(lesson, "Lesson domain");
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
  for (const [key, value] of Object.entries(lesson)) {
    if (key === "info") continue;
    document[key] = clone(value);
  }
  if (Array.isArray(lesson.info?.citations) && lesson.info.citations.length) {
    const { citations } = unionDomainCitations(content.info?.citations, lesson.info.citations);
    const nextInfo = withInfoCitations(document.info, citations);
    if (nextInfo === undefined) delete document.info;
    else document.info = nextInfo;
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
  // Legacy rows may still carry the lesson inside the pedagogy blob until
  // the next save moves it. Hide the byline if that copy is still here.
  if (isObject(result.learningIntroduction)) {
    delete result.learningIntroduction.credit;
  }
  return result;
}

function publicLessonDomain(value) {
  const result = publicDomain(value);
  // `learningIntroduction.credit` is a legacy human-owned byline. It is
  // parsed into provenance by the canonicalization path, so it is protected
  // even though its containing learningIntroduction belongs to the lesson.
  if (isObject(result.learningIntroduction)) {
    delete result.learningIntroduction.credit;
  }
  return result;
}

const LESSON_CLUSTER_FIELDS = ["id", "name", "fact", "seeds", "floatingTerms", "terms", "termInfo"];
const LESSON_BRIDGE_FIELDS = ["id", "term", "clusters", "fact"];

function pickFields(source, keys) {
  if (!isObject(source)) return clone(source);
  const result = {};
  for (const key of keys) {
    if (hasOwn(source, key)) result[key] = clone(source[key]);
  }
  return result;
}

// The lesson read is the subject, not the play design. relationKind is the
// one pedagogy annotation the prose needs in order to follow how ideas relate.
// Board citations from content_json appear in read-only context so the lesson
// pass sees sources already on the puzzle while writing its own entries.
function lessonReadContext(domains) {
  const content = domains.content || {};
  const result = {};
  for (const key of ["id", "title", "puzzleKind"]) {
    if (hasOwn(content, key)) result[key] = clone(content[key]);
  }
  if (hasOwn(domains.classification || {}, "category")) {
    result.category = clone(domains.classification.category);
  }
  if (Array.isArray(content.clusters)) {
    result.clusters = content.clusters.map(cluster => pickFields(cluster, LESSON_CLUSTER_FIELDS));
  }
  const annotations = Array.isArray(domains.pedagogy?.bridges) ? domains.pedagogy.bridges : [];
  if (Array.isArray(content.bridges)) {
    result.bridges = content.bridges.map((bridge, index) => {
      const view = pickFields(bridge, LESSON_BRIDGE_FIELDS);
      const annotation = annotations.find((candidate, candidateIndex) =>
        isObject(candidate) && bridgeMatches(bridge, candidate, index, candidateIndex)
      );
      if (annotation && hasOwn(annotation, "relationKind")) {
        view.relationKind = clone(annotation.relationKind);
      }
      return view;
    });
  }
  const contentCitations = content.info?.citations;
  if (Array.isArray(contentCitations) && contentCitations.length) {
    result.info = { citations: clone(contentCitations) };
  }
  return result;
}

function lessonWritableDocument(domains) {
  return publicLessonDomain(domains.lesson);
}

function contentReadContext(domains) {
  const context = publicDomain(domains.classification);
  const lessonCitations = domains.lesson?.info?.citations;
  if (Array.isArray(lessonCitations) && lessonCitations.length) {
    context.info = { citations: clone(lessonCitations) };
  }
  return context;
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

function omitLessonField(domain) {
  if (!isObject(domain) || !hasOwn(domain, "learningIntroduction")) return domain;
  const next = { ...domain };
  delete next.learningIntroduction;
  return next;
}

export function projectionHoldsLearningIntroduction(value) {
  if (value == null || value === "") return false;
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return false;
    }
  }
  return isObject(parsed) && hasOwn(parsed, "learningIntroduction");
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

function parseStoredObject(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isObject(value) ? value : null;
}

export function extractDomainCitations({ content = null, lesson = null } = {}) {
  const lessonObject = parseStoredObject(lesson);
  const lessonCitations = Array.isArray(lessonObject?.info?.citations)
    ? lessonObject.info.citations.filter(isObject)
    : [];
  if (!lessonCitations.length) return null;
  const contentObject = parseStoredObject(content);
  const contentCitations = Array.isArray(contentObject?.info?.citations)
    ? contentObject.info.citations.filter(isObject)
    : [];
  return {
    content: clone(contentCitations),
    lesson: clone(lessonCitations)
  };
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
  // A lesson still stored on the pedagogy (or content) projection has to
  // move in the same write that records lesson_json, or the next read
  // would keep the stale copy.
  const needsLessonMove = projectionHoldsLearningIntroduction(current?.pedagogy)
    || projectionHoldsLearningIntroduction(current?.content);
  const rewriteAll = needsSplit || needsShelfMove || needsLessonMove;
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
    lesson: domain === "lesson" || current?.lesson == null || rewriteAll
      ? next.lesson
      : current.lesson,
    provenance: next.provenance,
    administration: next.administration
  };
}

/**
 * Return an agent-facing projection. Pedagogy receives content as read-only
 * context because annotations reference clusters and bridges. Content and
 * pedagogy also receive classification as read-only context. Classification
 * receives id and title. The lesson receives the subject (clusters, bridge
 * facts, relationKind, and any board citations) and writes the introduction
 * plus its own citations. Only the returned `document` is writable.
 */
export function projectAuthoredDocument(document, domain = "complete", {
  domainCitations = null
} = {}) {
  if (domain === "complete") {
    return { domain, document: stripSystemAuthoredMetadata(clone(document)) };
  }
  if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
    throw new Error(`Unknown agent authoring domain: ${domain}`);
  }
  const domains = partitionAuthoredDocument(document, { domainCitations });
  if (domain === "content") {
    return {
      domain,
      document: publicDomain(domains.content),
      context: contentReadContext(domains)
    };
  }
  if (domain === "classification") {
    return {
      domain,
      document: publicDomain(domains.classification),
      context: contextForDomain(domains.content, "classification")
    };
  }
  if (domain === "lesson") {
    return {
      domain,
      document: lessonWritableDocument(domains),
      context: lessonReadContext(domains)
    };
  }
  const assembledDomains = domainCitations ? partitionAuthoredDocument(document) : domains;
  return {
    domain,
    document: publicPedagogyDomain(domains.pedagogy),
    context: {
      ...publicDomain(assembledDomains.content),
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

function ownerOfRootField(key) {
  if (LESSON_ROOT_FIELDS.has(key)) return "lesson";
  if (PEDAGOGY_ROOT_FIELDS.has(key)) return "pedagogy";
  if (CLASSIFICATION_ROOT_FIELDS.has(key)) return "classification";
  return "content";
}

function assertLessonInfo(info) {
  if (!isObject(info)) {
    throw new Error("lesson domain info must be an object of citations");
  }
  for (const key of Object.keys(info)) {
    if (key !== "citations") {
      throw new Error(`info.${key} belongs to the content domain`);
    }
  }
  if (hasOwn(info, "citations") && info.citations !== null && !Array.isArray(info.citations)) {
    throw new Error("info.citations must be a list");
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
    if (domain === "content" && ownerOfRootField(key) !== "content") {
      throw new Error(`${key} belongs to the ${ownerOfRootField(key)} domain`);
    }
    if (domain === "classification" && !CLASSIFICATION_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the ${ownerOfRootField(key)} domain`);
    }
    if (domain === "pedagogy" && key !== "bridges" && CLASSIFICATION_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the classification domain`);
    }
    if (domain === "pedagogy" && key !== "bridges" && !PEDAGOGY_ROOT_FIELDS.has(key)) {
      throw new Error(`${key} belongs to the ${ownerOfRootField(key)} domain`);
    }
    if (domain === "lesson" && key !== "learningIntroduction" && key !== "info") {
      throw new Error(`${key} belongs to the ${ownerOfRootField(key)} domain`);
    }
  }
  if (domain === "lesson" && hasOwn(incoming, "info") && incoming.info !== null) {
    assertLessonInfo(incoming.info);
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
        if (key !== "id" && key !== "term" && key !== "$patch" &&
            !PEDAGOGY_BRIDGE_FIELDS.has(key)) {
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

function applyDomainProjectionToObjects(currentDomains, previousDocument, domain, incoming) {
  if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
    throw new Error(`Only ${AUTHORING_WRITE_DOMAINS.join(" and ")} are agent-writable domains`);
  }
  assertDomainPayload(domain, incoming);
  assertNoWriteOnceDrift(
    previousDocument,
    incoming,
    `${domain} domain document`,
    { allowAbsent: true }
  );
  if (domain === "pedagogy") {
    assertPedagogyBridgeIdentities(currentDomains.content.bridges, incoming.bridges);
  }
  const next = {
    content: currentDomains.content,
    pedagogy: currentDomains.pedagogy,
    classification: currentDomains.classification,
    lesson: currentDomains.lesson,
    administration: currentDomains.administration,
    provenance: currentDomains.provenance
  };
  if (domain === "content") {
    // A focused payload is the complete selected projection. Replacing it
    // makes omission meaningful (for example, removing an optional info
    // field), while the other logical domains remain untouched.
    next.content = clone(incoming);
  } else if (domain === "classification") {
    next.classification = clone(incoming);
  } else if (domain === "lesson") {
    next.lesson = lessonProjectionFromPayload(currentDomains.lesson, incoming);
  } else {
    const preservedProtected = Object.fromEntries(
      [...PEDAGOGY_STORED_ROOT_FIELDS]
        .filter(key => PROTECTED_ROOT_FIELDS.has(key) && hasOwn(currentDomains.pedagogy, key))
        .map(key => [key, clone(currentDomains.pedagogy[key])])
    );
    next.pedagogy = { ...clone(incoming), ...preservedProtected };
    if (hasOwn(incoming, "bridges")) {
      next.pedagogy.bridges = splitDomainBridges(incoming.bridges);
    }
  }
  return next;
}

/**
 * Apply one domain replacement to the current canonical document. The
 * protected domains are copied from the current document and can therefore
 * not be erased by a focused agent save.
 */
export function applyAuthoredDomain(currentDocument, domain, incoming, {
  domainCitations = null
} = {}) {
  assertObject(currentDocument, "Current authored document");
  const current = partitionAuthoredDocument(currentDocument, { domainCitations });
  const next = applyDomainProjectionToObjects(current, currentDocument, domain, incoming);
  return assembleAuthoredDocument(next);
}

function lessonProjectionFromPayload(currentLesson, incoming) {
  const result = {};
  const currentIntroduction = currentLesson?.learningIntroduction;
  if (hasOwn(incoming, "learningIntroduction") && incoming.learningIntroduction !== null) {
    let introduction = clone(incoming.learningIntroduction);
    if (isObject(currentIntroduction) && hasOwn(currentIntroduction, "credit") &&
        isObject(introduction)) {
      introduction = { ...introduction, credit: clone(currentIntroduction.credit) };
    }
    result.learningIntroduction = introduction;
  }
  const citations = hasOwn(incoming, "info") && isObject(incoming.info)
    && Array.isArray(incoming.info.citations) && incoming.info.citations.length
    ? clone(incoming.info.citations)
    : null;
  if (citations) {
    result.info = { citations };
  }
  return result;
}

// Lists of items with a stable identity merge item by item, the way
// Kubernetes strategic merge patch treats lists with a merge key. The first
// key is the id; the second is the field an id is derived from when omitted.
// info.citations merges by url or author + title + year on both content and
// lesson saves. Every other list (terms, tags, categories, links) replaces
// whole, as in RFC 7396.
const KEYED_LISTS = Object.freeze({
  clusters: ["id", "name"],
  bridges: ["id", "term"],
  lenses: ["id"],
  "lenses[].options": ["id"],
  "relatedPuzzles.entries": ["id"]
});

const PATCH_DIRECTIVE = "$patch";

function keyedItemsMatch(keys, patchItem, baseItem) {
  const [primary, secondary] = keys;
  if (!isObject(patchItem) || !isObject(baseItem)) return false;
  if (patchItem[primary] && baseItem[primary]) {
    return patchItem[primary] === baseItem[primary];
  }
  return !!secondary && !!patchItem[secondary] &&
    patchItem[secondary] === baseItem[secondary];
}

function keyedLabel(keys, item) {
  return keys.map(key => item?.[key]).find(value => typeof value === "string" && value);
}

function withoutDirective(item) {
  const { [PATCH_DIRECTIVE]: _directive, ...rest } = item;
  return rest;
}

// Both content and lesson saves merge info.citations item by item within
// their own domain projection: url identifies an entry when both sides have
// one, otherwise author + title + year. Entries the patch does not mention
// stay; read-time union combines both domains onto the assembled puzzle.
function mergeCitationList(base, patch, siblingCitations = [], domain = "") {
  if (patch.some(item => isObject(item) && item[PATCH_DIRECTIVE] === "replace")) {
    return patch
      .filter(item => !(isObject(item) && item[PATCH_DIRECTIVE] === "replace"))
      .map(item => withoutDirective(item));
  }
  const result = Array.isArray(base) ? clone(base) : [];
  const otherDomain = domain === "lesson" ? "content" : "lesson";
  patch.forEach((item, index) => {
    if (!isObject(item) || !citationLabel(item)) {
      throw new Error(`info.citations[${index}] must name a url or a title`);
    }
    const directive = item[PATCH_DIRECTIVE];
    if (directive !== undefined && directive !== "delete") {
      throw new Error(
        `info.citations[${index}].$patch must be "delete" on an entry or "replace" as its own list entry`
      );
    }
    const target = result.findIndex(candidate => citationsMatch(item, candidate));
    if (directive === "delete") {
      if (target >= 0) {
        result.splice(target, 1);
      } else if (
        domain &&
        Array.isArray(siblingCitations) &&
        siblingCitations.some(candidate => isObject(candidate) && citationsMatch(item, candidate))
      ) {
        throw new Error(
          `info.citations[${index}] belongs to the ${otherDomain} domain and cannot be deleted from the ${domain} domain`
        );
      }
      return;
    }
    const clean = withoutDirective(item);
    if (target < 0) {
      if (!normalizedCitationText(clean.title)) {
        throw new Error(`info.citations[${index}] must include a title`);
      }
      result.push(clean);
      return;
    }
    result[target] = mergePatch(result[target], clean, "info.citations[]");
  });
  return result;
}

function patchWithMergedCitations(base, patch, siblingCitations = [], domain = "") {
  if (!isObject(patch?.info) || !Array.isArray(patch.info.citations)) return patch;
  return {
    ...patch,
    info: {
      ...patch.info,
      citations: mergeCitationList(
        base?.info?.citations,
        patch.info.citations,
        siblingCitations,
        domain
      )
    }
  };
}

function mergeKeyedList(base, patch, path, keys) {
  if (patch.some(item => isObject(item) && item[PATCH_DIRECTIVE] === "replace")) {
    return patch
      .filter(item => !(isObject(item) && item[PATCH_DIRECTIVE] === "replace"))
      .map(item => mergePatch(undefined, withoutDirective(item), `${path}[]`));
  }
  const result = Array.isArray(base) ? clone(base) : [];
  patch.forEach((item, index) => {
    if (!isObject(item) || !keyedLabel(keys, item)) {
      throw new Error(
        `${path}[${index}] must name its item by ${keys.join(" or ")}`
      );
    }
    const directive = item[PATCH_DIRECTIVE];
    if (directive !== undefined && directive !== "delete") {
      throw new Error(
        `${path}[${index}].$patch must be "delete" on an item or "replace" as its own list entry`
      );
    }
    const target = result.findIndex(candidate => keyedItemsMatch(keys, item, candidate));
    if (directive === "delete") {
      if (target >= 0) result.splice(target, 1);
      return;
    }
    if (target < 0) result.push(mergePatch(undefined, item, `${path}[]`));
    else result[target] = mergePatch(result[target], item, `${path}[]`);
  });
  return result;
}

// RFC 7396 JSON Merge Patch: null removes a member, an object merges
// recursively, and a value replaces the target. Arrays listed in KEYED_LISTS
// merge by item identity instead of replacing.
function mergePatch(target, patch, path = "") {
  if (KEYED_LISTS[path] && !Array.isArray(patch)) {
    throw new Error(`${path} must be a list of items, or null to remove it`);
  }
  if (Array.isArray(patch)) {
    const keys = KEYED_LISTS[path];
    if (keys) return mergeKeyedList(target, patch, path, keys);
    if (patch.some(item => isObject(item) && hasOwn(item, PATCH_DIRECTIVE))) {
      throw new Error(`${path} replaces whole; $patch applies only to keyed lists`);
    }
    return clone(patch);
  }
  if (!isObject(patch)) return clone(patch);
  if (hasOwn(patch, PATCH_DIRECTIVE) && !path.endsWith("[]")) {
    throw new Error(`${path || "document"}.$patch applies only to items of keyed lists`);
  }
  const result = isObject(target) ? clone(target) : {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === PATCH_DIRECTIVE) continue;
    const childPath = path ? `${path}.${key}` : key;
    if (value === null) delete result[key];
    else result[key] = mergePatch(result[key], value, childPath);
  }
  return result;
}

function clusterTermSet(cluster) {
  return new Set([
    ...(Array.isArray(cluster?.seeds) ? cluster.seeds : []),
    ...(Array.isArray(cluster?.floatingTerms) ? cluster.floatingTerms : []),
    ...(Array.isArray(cluster?.terms) ? cluster.terms : [])
  ]);
}

// A merged cluster keeps termInfo the patch did not mention, so a term the
// patch moved off a cluster would leave its note behind. Drop those notes
// unless the patch set them on purpose; `cleared` reports each one.
function pruneRemovedTermInfo(base, merged, patch) {
  if (!Array.isArray(base?.clusters) || !Array.isArray(merged?.clusters)) return;
  const keys = KEYED_LISTS.clusters;
  const patchClusters = Array.isArray(patch?.clusters) ? patch.clusters : [];
  for (const cluster of merged.clusters) {
    if (!isObject(cluster?.termInfo)) continue;
    const before = base.clusters.find(candidate => keyedItemsMatch(keys, cluster, candidate));
    if (!before) continue;
    const explicit = patchClusters.find(candidate => keyedItemsMatch(keys, candidate, cluster));
    const after = clusterTermSet(cluster);
    for (const term of clusterTermSet(before)) {
      if (after.has(term) || !hasOwn(cluster.termInfo, term)) continue;
      if (isObject(explicit?.termInfo) && hasOwn(explicit.termInfo, term)) continue;
      delete cluster.termInfo[term];
    }
    if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
  }
}

// Keyed lists the patch named mostly but not wholly. Leaving an item out of a
// keyed list keeps it, so this is usually an agent expecting omission to
// delete; the response says which items stayed and how to remove them.
function keptKeyedItems(base, patch, path = "") {
  const kept = [];
  if (!isObject(base) || !isObject(patch)) return kept;
  for (const [key, value] of Object.entries(patch)) {
    const childPath = path ? `${path}.${key}` : key;
    if (childPath === "info.citations" && Array.isArray(value) && Array.isArray(base[key])) {
      if (!value.some(item => isObject(item) && hasOwn(item, PATCH_DIRECTIVE))) {
        const omitted = base[key].filter(item =>
          isObject(item) &&
          !value.some(candidate => isObject(candidate) && citationsMatch(candidate, item))
        );
        const named = base[key].length - omitted.length;
        if (omitted.length && named > base[key].length / 2) {
          kept.push(...omitted.map(item => `${childPath}[${citationPathKey(item)}]`));
        }
      }
      continue;
    }
    const keys = KEYED_LISTS[childPath];
    if (isObject(value) && isObject(base[key])) {
      kept.push(...keptKeyedItems(base[key], value, childPath));
      continue;
    }
    if (!keys || !Array.isArray(value) || !Array.isArray(base[key])) continue;
    if (value.some(item => isObject(item) && hasOwn(item, PATCH_DIRECTIVE))) continue;
    const omitted = base[key].filter(item =>
      !value.some(candidate => keyedItemsMatch(keys, candidate, item))
    );
    const named = base[key].length - omitted.length;
    if (omitted.length && named > base[key].length / 2) {
      kept.push(...omitted.map(item => `${childPath}[${keyedLabel(keys, item)}]`));
    }
  }
  return kept;
}

// Array items are compared by their identity key so a reordered or edited
// item is not reported as removed. Keyless items fall back to deep equality.
const ITEM_KEYS = ["id", "term", "name", "url"];

function itemKey(item) {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (!isObject(item)) return null;
  for (const key of ITEM_KEYS) {
    if (typeof item[key] === "string" && item[key]) return item[key];
  }
  return null;
}

function itemMatches(left, right) {
  if (!isObject(left) || !isObject(right)) return left === right;
  return ITEM_KEYS.some(key =>
    typeof left[key] === "string" && left[key] && left[key] === right[key]
  );
}

function citationPathKey(item) {
  return normalizedCitationText(item?.url) || normalizedCitationText(item?.title) || null;
}

function removedPaths(before, after, prefix = "") {
  const removed = [];
  if (Array.isArray(before)) {
    const next = Array.isArray(after) ? after : [];
    const isCitations = prefix === "info.citations";
    before.forEach((item, index) => {
      const key = isCitations ? citationPathKey(item) : itemKey(item);
      const path = `${prefix}[${key ?? index}]`;
      const match = isCitations && isObject(item)
        ? next.find(candidate => isObject(candidate) && citationsMatch(item, candidate))
        : key === null
          ? next.find(candidate => sameStoredDocument(candidate, item))
          : next.find(candidate => itemMatches(item, candidate));
      if (match === undefined) removed.push(path);
      else if (isObject(item)) removed.push(...removedPaths(item, match, path));
    });
    return removed;
  }
  if (!isObject(before)) return removed;
  for (const [key, value] of Object.entries(before)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!isObject(after) || !hasOwn(after, key)) {
      removed.push(path);
    } else if (isObject(value) || Array.isArray(value)) {
      removed.push(...removedPaths(value, after[key], path));
    }
  }
  return removed;
}

/**
 * Everything a domain save removed, as readable paths: fields
 * (`info.citations`), array items by their id, term, name, or value
 * (`clusters[alpha]`, `clusters[alpha].seeds[two]`, `tags[book]`), and
 * fields inside matched items (`bridges[shared].idealTerms`). A save
 * response lists them so an agent never has to guess whether a write
 * dropped data, including when it sent a partial array.
 */
export function clearedDomainFields(previousDocument, nextDocument, domain, {
  beforeDomainCitations = null,
  afterDomainCitations = null
} = {}) {
  const before = projectAuthoredDocument(previousDocument, domain, {
    domainCitations: beforeDomainCitations
  }).document;
  const after = projectAuthoredDocument(nextDocument, domain, {
    domainCitations: afterDomainCitations
  }).document;
  // Presentational colors are server-settled, never agent-authored.
  const withoutColors = projection => Array.isArray(projection.clusters)
    ? {
      ...projection,
      clusters: projection.clusters.map(cluster => {
        if (!isObject(cluster)) return cluster;
        const { color: _color, ...rest } = cluster;
        return rest;
      })
    }
    : projection;
  return removedPaths(withoutColors(before), withoutColors(after));
}

/**
 * Apply an agent's focused domain save. Every focused domain payload is a
 * JSON Merge Patch (RFC 7396) over that domain's current projection:
 * omitted fields are kept, `null` removes a field, and objects merge. Lists
 * of identified items (clusters, bridges, lenses, lens options, related-
 * puzzle entries, and info.citations) merge item by item by identity, as in
 * a Kubernetes strategic merge patch: `{ ..., "$patch": "delete" }` removes
 * an item and a `{ "$patch": "replace" }` entry replaces that domain's list.
 * Every other list replaces whole.
 *
 * Returns the next document, the updated per-domain citation split (when
 * lesson owns citations), the authored paths the save removed, and keyed
 * items it kept although the payload named most of their list.
 */
export function applyAuthoredDomainPatch(currentDocument, domain, patch, {
  domainCitations = null
} = {}) {
  if (!AUTHORING_WRITE_DOMAINS.includes(domain)) {
    throw new Error(`Only ${AUTHORING_WRITE_DOMAINS.join(" and ")} are agent-writable domains`);
  }
  assertObject(currentDocument, "Current authored document");
  assertDomainPayload(domain, patch);
  const currentDomains = partitionAuthoredDocument(currentDocument, { domainCitations });
  const base = projectAuthoredDocument(currentDocument, domain, { domainCitations }).document;
  const siblingCitations = domain === "content"
    ? currentDomains.lesson?.info?.citations || []
    : domain === "lesson"
      ? currentDomains.content?.info?.citations || []
      : [];
  const merged = mergePatch(
    base,
    (domain === "content" || domain === "lesson")
      ? patchWithMergedCitations(base, patch, siblingCitations, domain)
      : patch
  );
  if (domain === "content") pruneRemovedTermInfo(base, merged, patch);
  // `merged` is the complete projection, so an absent write-once field here
  // means the patch removed it with null rather than leaving it unsaid.
  assertNoWriteOnceDrift(currentDocument, merged, `${domain} domain document`, {
    allowAbsent: domain !== "content"
  });
  const nextDomains = applyDomainProjectionToObjects(
    currentDomains,
    currentDocument,
    domain,
    merged
  );
  const document = assembleAuthoredDocument(nextDomains);
  const nextDomainCitations = extractDomainCitations(nextDomains);
  return {
    document,
    domainCitations: nextDomainCitations,
    cleared: clearedDomainFields(currentDocument, document, domain, {
      beforeDomainCitations: domainCitations,
      afterDomainCitations: nextDomainCitations
    }),
    kept: keptKeyedItems(base, patch)
  };
}

function serializeDomainObjects(domains) {
  return {
    content: JSON.stringify(domains.content),
    pedagogy: JSON.stringify(domains.pedagogy),
    classification: JSON.stringify(domains.classification),
    lesson: JSON.stringify(domains.lesson),
    provenance: domains.provenance === undefined
      ? null
      : JSON.stringify(domains.provenance),
    administration: domains.administration === undefined
      ? null
      : JSON.stringify(domains.administration)
  };
}

export function storedDomainDocuments(document, { domainCitations = null } = {}) {
  return serializeDomainObjects(partitionAuthoredDocument(document, { domainCitations }));
}

function resolveStoredDomainObjects({
  document,
  content = null,
  pedagogy = null,
  classification = null,
  lesson = null,
  provenance = null,
  administration = null
} = {}) {
  const fallback = document ? partitionAuthoredDocument(document) : null;
  // A stored classification column is authoritative, including when it omits
  // a field. Legacy rows leave the column null and still carry those fields
  // inside the content and pedagogy blobs. tags and level that still sit on
  // a sibling projection are adopted when the classification column lacks
  // that key, then stripped, so a read does not drop them.
  // A stored lesson column is likewise authoritative. While it is null, a
  // learningIntroduction still sitting on the pedagogy blob is the lesson.
  const classificationProvided = classification !== null && classification !== undefined;
  const lessonProvided = lesson !== null && lesson !== undefined;
  const contentSource = content ?? fallback?.content ?? {};
  const pedagogySource = pedagogy ?? fallback?.pedagogy ?? {};
  let storedContent = contentSource;
  let storedPedagogy = pedagogySource;
  if (classificationProvided) {
    storedContent = omitClassificationFields(storedContent);
    storedPedagogy = omitClassificationFields(storedPedagogy);
  }
  if (lessonProvided) {
    storedContent = omitLessonField(storedContent);
    storedPedagogy = omitLessonField(storedPedagogy);
  }
  return {
    content: storedContent,
    pedagogy: storedPedagogy,
    classification: classificationProvided
      ? adoptLegacyShelfFields(classification, [pedagogySource, contentSource])
      : (fallback?.classification ?? {}),
    lesson: lessonProvided ? lesson : (fallback?.lesson ?? {}),
    provenance: provenance ?? fallback?.provenance,
    administration: administration ?? fallback?.administration
  };
}

export function assembleStoredDomainDocuments(parts = {}) {
  return assembleAuthoredDocument(resolveStoredDomainObjects(parts));
}

/**
 * Prepare a single-column focused save against the current stored projections.
 * Content and lesson each keep their own citation entries in their own column,
 * while the materialized document unions both lists at read time.
 */
export function prepareDomainSave({
  rawColumns = {},
  document = undefined,
  content = null,
  pedagogy = null,
  classification = null,
  lesson = null,
  provenance = null,
  administration = null
} = {}, domain, projection, { nextProvenance = undefined } = {}) {
  const currentDomains = resolveStoredDomainObjects({
    document,
    content: content ?? parseStoredObject(rawColumns.content),
    pedagogy: pedagogy ?? parseStoredObject(rawColumns.pedagogy),
    classification: classification ?? parseStoredObject(rawColumns.classification),
    lesson: lesson ?? parseStoredObject(rawColumns.lesson),
    provenance: provenance ?? parseStoredObject(rawColumns.provenance),
    administration: administration ?? parseStoredObject(rawColumns.administration)
  });
  const previousDocument = assembleAuthoredDocument(currentDomains);
  const nextDomains = applyDomainProjectionToObjects(
    currentDomains,
    previousDocument,
    domain,
    projection
  );
  if (nextProvenance !== undefined) {
    nextDomains.provenance = clone(nextProvenance);
  }
  const materialized = assembleAuthoredDocument(nextDomains);
  const serializedNext = serializeDomainObjects(nextDomains);
  const columns = domainColumnsForSave(rawColumns, domain, serializedNext);
  return {
    previousDocument,
    materialized,
    columns,
    domainCitations: extractDomainCitations(nextDomains)
  };
}

export function extractDomainCitationsFromDraftRow(row, {
  parseJson = (text, label) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`${label} contains invalid JSON: ${error.message}`);
    }
  }
} = {}) {
  if (!row || typeof row !== "object") return null;
  if (row.lesson_json == null) return null;
  const lesson = parseJson(row.lesson_json, "Stored lesson domain");
  const content = row.content_json == null
    ? null
    : parseJson(row.content_json, "Stored content domain");
  return extractDomainCitations({ content, lesson });
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
  const lesson = row.lesson_json == null
    ? null
    : parseJson(row.lesson_json, "Stored lesson domain");
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
      lesson,
      provenance,
      administration
    });
  }
  if (content != null || pedagogy != null || classification != null || lesson != null || provenance != null || administration != null) {
    return assembleStoredDomainDocuments({
      document: row.document == null
        ? undefined
        : (typeof row.document === "string"
          ? parseJson(row.document, "Stored draft")
          : row.document),
      content,
      pedagogy,
      classification,
      lesson,
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
  CITATION_UNION_CONFLICT_FLAG_ID,
  CITATION_UNION_AMBIGUITY_FLAG_ID,
  assertNoRetiredAuthoringFields,
  assertCurrentAuthoredDocument,
  unionDomainCitations,
  citationUnionFlags,
  extractDomainCitations,
  extractDomainCitationsFromDraftRow,
  partitionAuthoredDocument,
  assembleAuthoredDocument,
  projectAuthoredDocument,
  applyAuthoredDomain,
  applyAuthoredDomainPatch,
  clearedDomainFields,
  storedDomainDocuments,
  assembleStoredDomainDocuments,
  prepareDomainSave,
  assembleAuthoredDocumentFromDraftRow,
  stripSystemAuthoredMetadata,
  publicationDocument,
  puzzleDocumentFromStorage
};
