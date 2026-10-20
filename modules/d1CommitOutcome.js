// A lost HTTP response, a non-JSON body, and D1's own "internal error" can
// arrive after the statement has already committed. Constraint failures,
// missing columns, and any other D1 message that names a definite rejection
// do not match. The HTTP client sets `outcomeUnknown` on the error; the
// hosted D1 binding throws `D1_ERROR: ...` with no such property, so callers
// on both transports use this helper.

const OUTCOME_UNKNOWN_MESSAGE =
  /D1_ERROR:\s*internal error\b|fetch failed|response was not JSON/i;

export function d1CommitOutcomeUnknown(error) {
  if (error && typeof error === "object" && error.outcomeUnknown === true) return true;
  const message = typeof error === "string"
    ? error
    : (error instanceof Error ? error.message : String(error ?? ""));
  return OUTCOME_UNKNOWN_MESSAGE.test(message);
}
