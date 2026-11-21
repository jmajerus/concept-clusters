import { validateCitations, validateLinkList } from "./contentValidation.js";
import { MAX_LESSON_CREDIT_LENGTH } from "./generativeAssistance.js";
import {
  isHttpArticleUrl,
  LEARNING_MEDIA_TYPE,
  LEARNING_REQUIREMENTS,
  MAX_LEARNING_ARTICLE_MINUTES
} from "./learningIntroduction.js";
import { lessonBlockIssues } from "./lessonBlocks.js";

export const MAX_LEARNING_MARKDOWN_BYTES = 128 * 1024;
const ALLOWED_ARTICLE_KEYS = new Set(["url", "title", "summary", "estimatedMinutes"]);

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

function validateLearningArticle(article, fail) {
  if (!article || typeof article !== "object" || Array.isArray(article)) {
    fail("learningIntroduction.article must be an object");
    return;
  }
  for (const key of Object.keys(article)) {
    if (!ALLOWED_ARTICLE_KEYS.has(key)) {
      fail(`learningIntroduction.article.${key} is not a supported field`);
    }
  }
  if (!nonEmptyString(article.url)) {
    fail("learningIntroduction.article.url must be a non-empty http(s) URL");
  } else if (!isHttpArticleUrl(article.url)) {
    fail("learningIntroduction.article.url must be a full http(s) URL");
  }
  for (const field of ["title", "summary"]) {
    if (article[field] !== undefined && !nonEmptyString(article[field])) {
      fail(`learningIntroduction.article.${field} must be a non-empty string when present`);
    }
  }
  if (article.estimatedMinutes !== undefined &&
      (!Number.isInteger(article.estimatedMinutes) ||
        article.estimatedMinutes < 1 ||
        article.estimatedMinutes > MAX_LEARNING_ARTICLE_MINUTES)) {
    fail(
      `learningIntroduction.article.estimatedMinutes must be an integer from 1 to ${MAX_LEARNING_ARTICLE_MINUTES}`
    );
  }
}

export function validateLearningIntroductionStructure(
  puzzle,
  { requireEmbedded = false } = {}
) {
  const introduction = puzzle?.learningIntroduction;
  if (introduction === undefined) return [];
  const errors = [];
  const fail = message => errors.push(message);
  if (!introduction || typeof introduction !== "object" ||
      Array.isArray(introduction)) {
    return ["learningIntroduction must be an object"];
  }
  if (!LEARNING_REQUIREMENTS.has(introduction.requirement)) {
    fail('learningIntroduction.requirement must be "optional", "recommended", or "required"');
  }
  for (const field of ["title", "summary", "credit"]) {
    if (introduction[field] !== undefined &&
        !nonEmptyString(introduction[field])) {
      fail(`learningIntroduction.${field} must be a non-empty string when present`);
    }
  }
  if (typeof introduction.credit === "string" &&
      introduction.credit.length > MAX_LESSON_CREDIT_LENGTH) {
    fail(
      `learningIntroduction.credit must be ${MAX_LESSON_CREDIT_LENGTH} characters or fewer`
    );
  }
  if (introduction.estimatedMinutes !== undefined &&
      (!Number.isInteger(introduction.estimatedMinutes) ||
        introduction.estimatedMinutes < 1 ||
        introduction.estimatedMinutes > 60)) {
    fail("learningIntroduction.estimatedMinutes must be an integer from 1 to 60");
  }
  const content = introduction.content;
  const article = introduction.article;
  const hasContent = content !== undefined;
  const hasArticle = article !== undefined;
  if (!hasContent && !hasArticle) {
    fail("learningIntroduction must provide content, article, or both");
  }
  if (!hasContent && hasArticle && introduction.requirement === "required") {
    fail(
      'learningIntroduction.requirement cannot be "required" when content is omitted; external article lessons must be "optional" or "recommended"'
    );
  }
  if (hasContent) {
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      fail("learningIntroduction.content must be an object");
    } else {
      if (content.mediaType !== LEARNING_MEDIA_TYPE) {
        fail(`learningIntroduction.content.mediaType must be "${LEARNING_MEDIA_TYPE}"`);
      }
      const hasText = content.text !== undefined;
      const hasSrc = content.src !== undefined;
      if (hasText === hasSrc) {
        fail("learningIntroduction.content must provide exactly one of text or src");
      } else if (hasText) {
        if (!nonEmptyString(content.text)) {
          fail("learningIntroduction.content.text must be a non-empty string");
        } else if (new TextEncoder().encode(content.text).byteLength >
            MAX_LEARNING_MARKDOWN_BYTES) {
          fail(`learningIntroduction Markdown exceeds ${MAX_LEARNING_MARKDOWN_BYTES} bytes`);
        } else {
          lessonBlockIssues(content.text).forEach(fail);
        }
      } else {
        if (!nonEmptyString(content.src)) {
          fail("learningIntroduction.content.src must be a non-empty string");
        }
        if (requireEmbedded) {
          fail("hosted drafts must embed learningIntroduction.content.text; packaged src resources are added during repository publication");
        }
      }
    }
  }
  if (hasArticle) {
    validateLearningArticle(article, fail);
  }

  errors.push(
    ...validateLinkList(introduction.links, "learningIntroduction.links"),
    ...validateLinkList(introduction.sources, "learningIntroduction.sources"),
    ...validateCitations(introduction.citations, "learningIntroduction.citations")
  );
  return errors;
}
