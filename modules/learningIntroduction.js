import {
  puzzleSourceUrl,
  resolvePuzzleResourceUrl
} from "./puzzleManifest.js";

export const LEARNING_REQUIREMENTS = new Set([
  "optional",
  "recommended",
  "required"
]);

export const LEARNING_MEDIA_TYPE = "text/markdown";

export function normalizedLearningIntroduction(puzzle) {
  const introduction = puzzle?.learningIntroduction;
  if (!introduction) return null;
  return {
    ...introduction,
    requirement: LEARNING_REQUIREMENTS.has(introduction.requirement)
      ? introduction.requirement
      : "optional",
    title: introduction.title || "Before You Begin",
    revision: String(introduction.revision ?? 1)
  };
}

export function learningIntroductionGate(introduction, status) {
  if (!introduction) return false;
  if (introduction.requirement === "required") return status !== "read";
  if (introduction.requirement === "recommended") return !status;
  return false;
}

export async function loadLearningIntroduction(
  puzzle,
  { fetchImpl = fetch, signal } = {}
) {
  const introduction = normalizedLearningIntroduction(puzzle);
  if (!introduction) throw new Error("This puzzle has no learning introduction.");
  const { content } = introduction;
  if (typeof content?.text === "string") {
    const sourceUrl = puzzleSourceUrl(puzzle);
    return {
      markdown: content.text,
      baseUrl: sourceUrl ? new URL(".", sourceUrl).href : document.baseURI
    };
  }
  const resourceUrl = resolvePuzzleResourceUrl(puzzle, content?.src);
  const response = await fetchImpl(resourceUrl, { signal });
  if (!response.ok) {
    throw new Error(`The lesson could not be loaded (${response.status}).`);
  }
  return {
    markdown: await response.text(),
    baseUrl: resourceUrl.href
  };
}
