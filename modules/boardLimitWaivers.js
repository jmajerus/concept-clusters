/**
 * Trusted registry of exceptional numeric board limits.
 *
 * A waiver type is deliberately a policy object, not a caller-supplied number.
 * To add another kind, register its normal/hard limits, target enumeration,
 * value reader, scope snapshot and snapshot validator here. The request, human
 * review, persistence and validation paths consume this same registry.
 */
function hasDistinctNonEmptyTerms(terms, count) {
  return Array.isArray(terms) && terms.length === count &&
    terms.every(term => typeof term === "string" && term.trim()) &&
    new Set(terms).size === count;
}

export const BOARD_LIMIT_WAIVER_REGISTRY = Object.freeze([
  Object.freeze({
    type: "cluster-term-count",
    label: "Cluster term count",
    scopeType: "cluster",
    normalLimit: 7,
    approvedLimit: 8,
    minimumReasonLength: 20,
    targetLabel: cluster => cluster?.name || cluster?.id || "cluster",
    targets: puzzle => Array.isArray(puzzle?.clusters) ? puzzle.clusters : [],
    targetId: cluster => cluster?.id,
    value: cluster => Array.isArray(cluster?.terms) ? cluster.terms.length : 0,
    captureScope: cluster => ({
      terms: [...(Array.isArray(cluster?.terms) ? cluster.terms : [])].sort()
    }),
    validScope: (scope, policy) => hasDistinctNonEmptyTerms(scope?.terms, policy.approvedLimit),
    scopeMatches: (cluster, scope, policy) => {
      const current = Array.isArray(cluster?.terms) ? [...cluster.terms].sort() : [];
      return hasDistinctNonEmptyTerms(current, policy.approvedLimit) &&
        JSON.stringify(current) === JSON.stringify(scope?.terms);
    },
    requestable: (cluster, policy) => hasDistinctNonEmptyTerms(cluster?.terms, policy.approvedLimit),
    requestGuidance: "Explain why all eight terms do distinct work and why splitting weakens the lesson."
  })
]);

export const BOARD_LIMIT_WAIVER_TYPES = Object.freeze(
  BOARD_LIMIT_WAIVER_REGISTRY.map(({ type }) => type)
);

export function boardLimitWaiverPolicy(type) {
  return BOARD_LIMIT_WAIVER_REGISTRY.find(policy => policy.type === type) || null;
}

export function boardLimitWaiverTypeSummaries() {
  return BOARD_LIMIT_WAIVER_REGISTRY.map(policy => ({
    type: policy.type,
    label: policy.label,
    scopeType: policy.scopeType,
    normalLimit: policy.normalLimit,
    approvedLimit: policy.approvedLimit,
    minimumReasonLength: policy.minimumReasonLength,
    requestGuidance: policy.requestGuidance
  }));
}

export function boardLimitWaiverTargets(puzzle, type) {
  const policy = boardLimitWaiverPolicy(type);
  if (!policy) return [];
  return policy.targets(puzzle).map(target => ({
    target,
    targetId: policy.targetId(target),
    targetLabel: policy.targetLabel(target),
    value: policy.value(target),
    scope: policy.captureScope(target),
    requestable: policy.requestable(target, policy)
  }));
}

export function boardLimitWaiverMatches(puzzle, target, grant) {
  const policy = boardLimitWaiverPolicy(grant?.waiverType);
  if (!policy || !puzzle || !target || !grant ||
      grant.puzzleId !== puzzle.id ||
      grant.targetId !== policy.targetId(target) ||
      grant.approvedLimit !== policy.approvedLimit ||
      !policy.validScope(grant.approvedScope, policy)) {
    return false;
  }
  return policy.value(target) === policy.approvedLimit &&
    policy.scopeMatches(target, grant.approvedScope, policy);
}

function grantShapeErrors(grants) {
  const errors = [];
  const seen = new Set();
  for (const [index, grant] of grants.entries()) {
    const policy = boardLimitWaiverPolicy(grant?.waiverType);
    if (!policy || typeof grant.puzzleId !== "string" || !grant.puzzleId.trim() ||
        typeof grant.targetId !== "string" || !grant.targetId.trim() ||
        grant.approvedLimit !== policy.approvedLimit ||
        !policy.validScope(grant.approvedScope, policy) ||
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
    for (const target of policy.targets(puzzle)) {
      const value = policy.value(target);
      if (value <= policy.normalLimit) continue;
      const targetId = policy.targetId(target) || "unknown target";
      const targetLabel = policy.targetLabel(target);
      if (value > policy.approvedLimit) {
        errors.push(`[board-limit-hard-limit] ${targetLabel}: ${value} exceeds the absolute ${policy.label.toLowerCase()} limit of ${policy.approvedLimit}.`);
        continue;
      }
      const matching = grants.some(grant => boardLimitWaiverMatches(puzzle, target, grant));
      if (!matching) {
        const stale = grants.find(grant => grant?.waiverType === policy.type &&
          grant?.puzzleId === puzzle?.id && grant?.targetId === targetId);
        errors.push(
          `[board-limit-waiver-required] ${targetLabel}: ${value} exceeds the ordinary limit of ${policy.normalLimit} and requires human approval for ${policy.type}.` +
          (stale ? " The existing waiver covers a different scope." : "")
        );
      }
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
  if (!entry || !entry.requestable || entry.value !== policy.approvedLimit) {
    throw new Error(`Target ${targetId} must be eligible for the ${policy.label.toLowerCase()} waiver.`);
  }
  if (typeof reason !== "string" || reason.trim().length < policy.minimumReasonLength) {
    throw new Error(`${policy.requestGuidance} (At least ${policy.minimumReasonLength} characters.)`);
  }
  return {
    waiverType: policy.type,
    scopeType: policy.scopeType,
    targetId,
    requestedValue: entry.value,
    scope: entry.scope,
    reason: reason.trim()
  };
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
  const policy = boardLimitWaiverPolicy(type);
  const grantedBy = typeof actor === "string"
    ? actor
    : actor?.name || actor?.email || actor?.subject;
  if (typeof grantedBy !== "string" || !grantedBy.trim()) {
    throw new Error("A human reviewer identity is required.");
  }
  const grant = {
    waiverType: policy.type,
    puzzleId: puzzle.id,
    targetId,
    approvedLimit: policy.approvedLimit,
    approvedScope: request.scope,
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

export function canonicalBoardLimitWaivers(value) {
  if (!Array.isArray(value)) return value;
  return value.map(grant => {
    if (!grant || typeof grant !== "object" || Array.isArray(grant) ||
        grant.waiverType || !Object.hasOwn(grant, "clusterId")) return grant;
    return {
      waiverType: "cluster-term-count",
      puzzleId: grant.puzzleId,
      targetId: grant.clusterId,
      approvedLimit: grant.maxTerms,
      approvedScope: { terms: Array.isArray(grant.approvedTerms)
        ? [...grant.approvedTerms].sort() : grant.approvedTerms },
      reason: grant.reason,
      grantedBy: grant.grantedBy,
      grantedAt: grant.grantedAt
    };
  });
}

// Constants used by the structural schema for this registered policy.
export const CLUSTER_TERM_LIMIT = boardLimitWaiverPolicy("cluster-term-count").normalLimit;
export const CLUSTER_TERM_EXCEPTION_LIMIT = boardLimitWaiverPolicy("cluster-term-count").approvedLimit;
export function isEightDistinctTerms(terms) {
  return hasDistinctNonEmptyTerms(terms, CLUSTER_TERM_EXCEPTION_LIMIT);
}
export const preserveCurrentClusterTermExceptions = preserveCurrentBoardLimitWaivers;
export const clusterTermExceptionMatches = boardLimitWaiverMatches;
export const clusterTermExceptionErrors = boardLimitWaiverErrors;
export function grantClusterTermException(puzzle, clusterId, reason, actor, grantedAt) {
  return grantBoardLimitWaiver(puzzle, "cluster-term-count", clusterId, reason, actor, grantedAt);
}
export function revokeClusterTermException(puzzle, clusterId) {
  return revokeBoardLimitWaiver(puzzle, "cluster-term-count", clusterId);
}
