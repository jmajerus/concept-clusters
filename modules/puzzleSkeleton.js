// Empty simplified draft used when create_puzzle_draft omits `document`.
// Zod-free so contentInterchangeService can import it on the JSON-LD CLI
// path that must not load simplifiedPuzzleSchema.
export function createPuzzleSkeleton({ id, title, category }) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("puzzle id must be a non-empty string");
  }
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("puzzle title must be a non-empty string");
  }
  if (typeof category !== "string" || !category.trim()) {
    throw new Error("puzzle category must be a non-empty string");
  }
  return {
    id,
    title,
    category,
    clusters: [],
    bridges: []
  };
}
