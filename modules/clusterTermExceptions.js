// Compatibility exports for older internal callers. New code should import
// the policy-neutral API from boardLimitWaivers.js.
export {
  CLUSTER_TERM_LIMIT,
  CLUSTER_TERM_EXCEPTION_LIMIT,
  isEightDistinctTerms,
  preserveCurrentClusterTermExceptions,
  clusterTermExceptionMatches,
  clusterTermExceptionErrors,
  grantClusterTermException,
  revokeClusterTermException
} from "./boardLimitWaivers.js";
