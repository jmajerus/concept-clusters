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

// Chatbots often put the two-character sequence \n into tool-argument
// strings, as if they were writing JSON source. After structured decode
// those are literal backslash-n, so headings and paragraphs collapse into
// one line. Real Markdown already contains newline characters; leave it
// alone, including mixed files that mention \n in running prose.
export function decodeAuthoredEscapedNewlines(text) {
  if (typeof text !== "string" || !text.includes("\\n")) return text;
  if (/[\n\r]/.test(text)) return text;
  return text.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

export function withDecodedLearningMarkdown(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }
  const text = document.learningIntroduction?.content?.text;
  if (typeof text !== "string") return document;
  const decoded = decodeAuthoredEscapedNewlines(text);
  if (decoded === text) return document;
  return {
    ...document,
    learningIntroduction: {
      ...document.learningIntroduction,
      content: {
        ...document.learningIntroduction.content,
        text: decoded
      }
    }
  };
}

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
      markdown: decodeAuthoredEscapedNewlines(content.text),
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
