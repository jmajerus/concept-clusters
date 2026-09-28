// Session state beside the review baseline. Older rows stored the puzzle
// document itself; new rows wrap it so a stack-on load can be remembered
// without a schema change.

const ENVELOPE = "review-baseline";

export function serializeReviewBaseline(document, { stackLoaded = false } = {}) {
  return JSON.stringify({
    envelope: ENVELOPE,
    stackLoaded: stackLoaded === true,
    document
  });
}

export function parseReviewBaseline(value) {
  if (value == null || value === "") return null;
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  if (parsed.envelope === ENVELOPE && parsed.document && typeof parsed.document === "object") {
    return {
      document: parsed.document,
      stackLoaded: parsed.stackLoaded === true
    };
  }
  return { document: parsed, stackLoaded: false };
}
