/**
 * Trusted registry of numeric board limits that a human may waive.
 *
 * Every limit here is the size of some collection on the board: the terms in a
 * cluster, the clusters in a puzzle, and so on. A policy only says where those
 * collections are and how big each is (`collections`), what size is ordinary
 * (`normalLimit`), and the most a human may approve (`approvedLimit`).
 * Requests, review, matching and validation are shared and know nothing about
 * any one policy. A waiver is a layout allowance, not a content approval: it
 * names a target and a size, and holds while that target stays within the
 * approved size, whichever items fill it.
 *
 * Registering a limit here does not change what a renderer or schema can
 * hold; do that first, then register the policy.
 */
function clusterItems(cluster) {
  if (Array.isArray(cluster?.terms)) return cluster.terms;
  return [
    ...(Array.isArray(cluster?.seeds) ? cluster.seeds : []),
    ...(Array.isArray(cluster?.floatingTerms) ? cluster.floatingTerms : [])
  ];
}

export const BOARD_LIMIT_WAIVER_REGISTRY = Object.freeze([
  Object.freeze({
    type: "cluster-term-count",
    label: "Terms per cluster",
    normalLimit: 7,
    approvedLimit: 8,
    collections: puzzle => (Array.isArray(puzzle?.clusters) ? puzzle.clusters : [])
      .map(cluster => ({
        id: cluster?.id,
        label: cluster?.name || cluster?.id || "cluster",
        detail: cluster?.fact,
        size: clusterItems(cluster).length
      }))
  })
]);

export const BOARD_LIMIT_WAIVER_TYPES = Object.freeze(
  BOARD_LIMIT_WAIVER_REGISTRY.map(({ type }) => type)
);

export const MINIMUM_WAIVER_REASON_LENGTH = 20;
export const WAIVER_REQUEST_GUIDANCE =
  "Explain why the larger size serves the lesson better than restructuring the board.";

export function boardLimitWaiverPolicy(type) {
  return BOARD_LIMIT_WAIVER_REGISTRY.find(policy => policy.type === type) || null;
}

/** The registered limits for one type; throws so a typo cannot silently unbound a schema. */
export function boardLimit(type) {
  const policy = boardLimitWaiverPolicy(type);
  if (!policy) throw new Error(`Unknown board limit: ${type}`);
  return { normalLimit: policy.normalLimit, approvedLimit: policy.approvedLimit };
}

export function boardLimitWaiverTypeSummaries() {
  return BOARD_LIMIT_WAIVER_REGISTRY.map(({ type, label, normalLimit, approvedLimit }) => ({
    type, label, normalLimit, approvedLimit,
    minimumReasonLength: MINIMUM_WAIVER_REASON_LENGTH,
    requestGuidance: WAIVER_REQUEST_GUIDANCE
  }));
}

/** One sentence per registered limit, for authoring guidance and schema text. */
export function describeBoardLimits() {
  return BOARD_LIMIT_WAIVER_REGISTRY.map(policy =>
    `${policy.label}: ${policy.normalLimit} is the ordinary maximum; up to ${policy.approvedLimit} with a human-granted waiver (${policy.type}); more is invalid.`
  ).join(" ");
}

function waivable(policy, size) {
  return Number.isInteger(size) &&
    size > policy.normalLimit && size <= policy.approvedLimit;
}

export function boardLimitWaiverTargets(puzzle, type) {
  const policy = boardLimitWaiverPolicy(type);
  if (!policy) return [];
  return policy.collections(puzzle).map(collection => ({
    target: collection,
    targetId: collection.id,
    targetLabel: collection.label,
    value: collection.size,
    requestable: waivable(policy, collection.size)
  }));
}

export function boardLimitWaiverMatches(puzzle, target, grant) {
  const policy = boardLimitWaiverPolicy(grant?.waiverType);
  return Boolean(policy && puzzle && target && grant &&
    grant.puzzleId === puzzle.id &&
    grant.targetId === target.id &&
    waivable(policy, grant.approvedCount) &&
    target.size <= grant.approvedCount);
}

function grantShapeErrors(grants) {
  const errors = [];
  const seen = new Set();
  for (const [index, grant] of grants.entries()) {
    const policy = boardLimitWaiverPolicy(grant?.waiverType);
    if (!policy || typeof grant.puzzleId !== "string" || !grant.puzzleId.trim() ||
        typeof grant.targetId !== "string" || !grant.targetId.trim() ||
        !waivable(policy, grant.approvedCount) ||
        typeof grant.reason !== "string" || !grant.reason.trim() ||
        typeof grant.grantedBy !== "string" || !grant.grantedBy.trim() ||
        typeof grant.grantedAt !== "string" || !grant.grantedAt.trim()) {
      errors.push(`[board-limit-waiver-invalid] boardLimitWaivers[${index}] is malformed or uses an unsupported waiver type.`);
      continue;
    }
    const key = `${grant.waiverType}\u0000${grant.puzzleId}\u0000${grant.targetId}`;
    if (seen.has(key)) {
      errors.push(`[board-limit-waiver-invalid] duplicate ${grant.waiverType} grant for ${grant.targetId} at boardLimitWaivers[${index}].`);
    }
    seen.add(key);
  }
  return errors;
}

export function boardLimitWaiverErrors(puzzle) {
  const grants = Array.isArray(puzzle?.boardLimitWaivers) ? puzzle.boardLimitWaivers : [];
  const errors = [];
  for (const policy of BOARD_LIMIT_WAIVER_REGISTRY) {
    for (const target of policy.collections(puzzle)) {
      const value = target.size;
      if (value <= policy.normalLimit) continue;
      if (value > policy.approvedLimit) {
        errors.push(`[board-limit-hard-limit] ${target.label}: ${value} exceeds the absolute ${policy.label.toLowerCase()} limit of ${policy.approvedLimit}.`);
        continue;
      }
      if (grants.some(grant => boardLimitWaiverMatches(puzzle, target, grant))) continue;
      const smaller = grants.find(grant => grant?.waiverType === policy.type &&
        grant?.puzzleId === puzzle?.id && grant?.targetId === target.id);
      errors.push(
        `[board-limit-waiver-required] ${target.label}: ${value} exceeds the ordinary limit of ${policy.normalLimit} and requires human approval for ${policy.type}.` +
        (smaller ? ` The existing waiver allows ${smaller.approvedCount}.` : "")
      );
    }
  }
  errors.push(...grantShapeErrors(grants));
  return errors;
}

export function makeBoardLimitWaiverRequest(puzzle, type, targetId, reason) {
  const policy = boardLimitWaiverPolicy(type);
  if (!policy) throw new Error(`Unsupported board limit waiver type: ${type}`);
  const entry = boardLimitWaiverTargets(puzzle, type)
    .find(candidate => candidate.targetId === targetId);
  if (!entry?.requestable) {
    throw new Error(
      `Target ${targetId} must hold more than ${policy.normalLimit} and at most ${policy.approvedLimit} to request a ${policy.label.toLowerCase()} waiver.`
    );
  }
  if (typeof reason !== "string" || reason.trim().length < MINIMUM_WAIVER_REASON_LENGTH) {
    throw new Error(`${WAIVER_REQUEST_GUIDANCE} (At least ${MINIMUM_WAIVER_REASON_LENGTH} characters.)`);
  }
  return {
    waiverType: policy.type,
    targetId,
    count: entry.value,
    reason: reason.trim()
  };
}

/** Whether a stored request still asks for the size the board needs now. */
export function boardLimitWaiverRequestIsCurrent(puzzle, request) {
  const entry = boardLimitWaiverTargets(puzzle, request?.waiverType)
    .find(candidate => candidate.targetId === request?.targetId);
  return Boolean(entry?.requestable && entry.value === request.count);
}

export function grantBoardLimitWaiver(
  puzzle,
  type,
  targetId,
  reason,
  actor,
  grantedAt = new Date().toISOString()
) {
  if (typeof puzzle?.id !== "string" || !puzzle.id.trim()) {
    throw new Error("The puzzle needs a stable id before a waiver can be granted.");
  }
  const request = makeBoardLimitWaiverRequest(puzzle, type, targetId, reason);
  const grantedBy = typeof actor === "string"
    ? actor
    : actor?.name || actor?.email || actor?.subject;
  if (typeof grantedBy !== "string" || !grantedBy.trim()) {
    throw new Error("A human reviewer identity is required.");
  }
  const grant = {
    waiverType: request.waiverType,
    puzzleId: puzzle.id,
    targetId,
    approvedCount: request.count,
    reason: request.reason,
    grantedBy: grantedBy.trim(),
    grantedAt
  };
  const current = Array.isArray(puzzle.boardLimitWaivers) ? puzzle.boardLimitWaivers : [];
  const retained = current.filter(item =>
    item?.waiverType !== type || item?.targetId !== targetId
  );
  return { ...puzzle, boardLimitWaivers: [...retained, grant] };
}

export function revokeBoardLimitWaiver(puzzle, type, targetId) {
  const grants = Array.isArray(puzzle?.boardLimitWaivers) ? puzzle.boardLimitWaivers : [];
  const nextGrants = grants.filter(grant =>
    grant?.waiverType !== type || grant?.targetId !== targetId
  );
  if (nextGrants.length === grants.length) return puzzle;
  const next = { ...puzzle };
  if (nextGrants.length) next.boardLimitWaivers = nextGrants;
  else delete next.boardLimitWaivers;
  return next;
}

export function preserveCurrentBoardLimitWaivers(current, next) {
  const document = { ...next };
  if (current && Object.hasOwn(current, "boardLimitWaivers") &&
      current.boardLimitWaivers !== undefined) {
    document.boardLimitWaivers = JSON.parse(JSON.stringify(current.boardLimitWaivers));
  } else {
    delete document.boardLimitWaivers;
  }
  return document;
}
