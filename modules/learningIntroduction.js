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
export const MAX_LEARNING_ARTICLE_MINUTES = 120;

export function isHttpArticleUrl(raw) {
  if (typeof raw !== "string" || !raw.trim()) return false;
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasEmbeddedLearningContent(introduction) {
  if (!introduction || typeof introduction !== "object" || Array.isArray(introduction)) {
    return false;
  }
  const content = introduction.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  return (typeof content.text === "string" && !!content.text.trim()) ||
    (typeof content.src === "string" && !!content.src.trim());
}

export function normalizedLearningArticle(introduction) {
  const article = introduction?.article;
  if (!article || typeof article !== "object" || Array.isArray(article)) return null;
  if (!isHttpArticleUrl(article.url)) return null;
  const normalized = { url: article.url.trim() };
  if (typeof article.title === "string" && article.title.trim()) {
    normalized.title = article.title.trim();
  }
  if (typeof article.summary === "string" && article.summary.trim()) {
    normalized.summary = article.summary.trim();
  }
  if (Number.isInteger(article.estimatedMinutes) &&
      article.estimatedMinutes >= 1 &&
      article.estimatedMinutes <= MAX_LEARNING_ARTICLE_MINUTES) {
    normalized.estimatedMinutes = article.estimatedMinutes;
  }
  return normalized;
}

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

// Reading-progress invalidation is derived from the lesson content rather
// than maintained as an authored field. This keeps the cache key useful to
// the player without asking an authoring agent to remember to bump metadata.
export function learningIntroductionFingerprint(puzzle) {
  const introduction = puzzle?.learningIntroduction;
  if (!introduction) return "none";
  const { revision: _legacyRevision, ...authoredIntroduction } = introduction;
  const serialized = JSON.stringify(authoredIntroduction);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `content-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function normalizedLearningIntroduction(puzzle) {
  const introduction = puzzle?.learningIntroduction;
  if (!introduction) return null;
  const { revision: _legacyRevision, ...authoredIntroduction } = introduction;
  const article = normalizedLearningArticle(introduction);
  return {
    ...authoredIntroduction,
    ...(article ? { article } : {}),
    requirement: LEARNING_REQUIREMENTS.has(introduction.requirement)
      ? introduction.requirement
      : "optional",
    title: introduction.title || article?.title || "Before You Begin"
  };
}

export function learningIntroductionGate(introduction, status) {
  if (!introduction) return false;
  if (introduction.requirement === "required") {
    // External-only article lessons open in another tab and cannot verify
    // completion; never let one hard-lock the board even if hand-edited.
    const articleOnly = !hasEmbeddedLearningContent(introduction) &&
      Boolean(normalizedLearningArticle(introduction));
    if (articleOnly) return !status;
    return status !== "read";
  }
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
