import { validateCitations, validateLinkList } from "./contentValidation.js";
import { MAX_LESSON_CREDIT_LENGTH } from "./generativeAssistance.js";
import {
  LEARNING_MEDIA_TYPE,
  LEARNING_REQUIREMENTS
} from "./learningIntroduction.js";

export const MAX_LEARNING_MARKDOWN_BYTES = 128 * 1024;

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
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
  if (introduction.revision !== undefined &&
      !nonEmptyString(String(introduction.revision))) {
    fail("learningIntroduction.revision must be a non-empty string or number");
  }

  const content = introduction.content;
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

  errors.push(
    ...validateLinkList(introduction.links, "learningIntroduction.links"),
    ...validateLinkList(introduction.sources, "learningIntroduction.sources"),
    ...validateCitations(introduction.citations, "learningIntroduction.citations")
  );
  return errors;
}
