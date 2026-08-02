import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  LEARNING_MEDIA_TYPE,
  LEARNING_REQUIREMENTS
} from "./learningIntroduction.js";
import { resolvePuzzleResourceUrl } from "./puzzleManifest.js";

const MAX_MARKDOWN_BYTES = 128 * 1024;
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function nonEmptyString(value) {
  return typeof value === "string" && !!value.trim();
}

async function validateMarkdownAssets(puzzle, markdown, markdownUrl, fail) {
  for (const match of markdown.matchAll(IMAGE_PATTERN)) {
    if (!match[1].trim()) fail("Markdown images require non-empty alt text");
    try {
      const assetUrl = resolvePuzzleResourceUrl(puzzle, match[2], markdownUrl);
      if (assetUrl.protocol !== "file:") {
        fail(`image "${match[2]}" is not a local packaged resource`);
        continue;
      }
      await access(fileURLToPath(assetUrl));
    } catch (error) {
      fail(`image "${match[2]}" is invalid or missing: ${error.message}`);
    }
  }
}

export async function validateLearningIntroduction(puzzle) {
  const introduction = puzzle?.learningIntroduction;
  if (introduction === undefined) return [];
  const errors = [];
  const fail = message => errors.push(message);
  if (!introduction || typeof introduction !== "object" || Array.isArray(introduction)) {
    return ["learningIntroduction must be an object"];
  }
  if (!LEARNING_REQUIREMENTS.has(introduction.requirement)) {
    fail('learningIntroduction.requirement must be "optional", "recommended", or "required"');
  }
  for (const field of ["title", "summary"]) {
    if (introduction[field] !== undefined && !nonEmptyString(introduction[field])) {
      fail(`learningIntroduction.${field} must be a non-empty string when present`);
    }
  }
  if (introduction.estimatedMinutes !== undefined &&
      (!Number.isInteger(introduction.estimatedMinutes) ||
        introduction.estimatedMinutes < 1 || introduction.estimatedMinutes > 60)) {
    fail("learningIntroduction.estimatedMinutes must be an integer from 1 to 60");
  }
  if (introduction.revision !== undefined &&
      !nonEmptyString(String(introduction.revision))) {
    fail("learningIntroduction.revision must be a non-empty string or number");
  }

  const content = introduction.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    fail("learningIntroduction.content must be an object");
    return errors;
  }
  if (content.mediaType !== LEARNING_MEDIA_TYPE) {
    fail(`learningIntroduction.content.mediaType must be "${LEARNING_MEDIA_TYPE}"`);
  }
  const hasText = content.text !== undefined;
  const hasSrc = content.src !== undefined;
  if (hasText === hasSrc) {
    fail("learningIntroduction.content must provide exactly one of text or src");
    return errors;
  }

  let markdown = "";
  let markdownUrl = null;
  if (hasText) {
    if (!nonEmptyString(content.text)) {
      fail("learningIntroduction.content.text must be a non-empty string");
      return errors;
    }
    markdown = content.text;
    try {
      markdownUrl = resolvePuzzleResourceUrl(puzzle, `./${puzzle.id}.inline.md`);
    } catch (error) {
      fail(`inline learning content requires a defined puzzle module origin: ${error.message}`);
      return errors;
    }
  } else {
    try {
      const resourceUrl = resolvePuzzleResourceUrl(puzzle, content.src);
      if (resourceUrl.protocol !== "file:" || !resourceUrl.pathname.endsWith(".md")) {
        fail("learningIntroduction.content.src must reference a local Markdown file");
        return errors;
      }
      const bytes = await readFile(fileURLToPath(resourceUrl));
      if (bytes.byteLength > MAX_MARKDOWN_BYTES) {
        fail(`learningIntroduction Markdown exceeds ${MAX_MARKDOWN_BYTES} bytes`);
        return errors;
      }
      markdown = bytes.toString("utf8");
      markdownUrl = resourceUrl;
      if (!markdown.trim()) fail("learningIntroduction Markdown file is empty");
    } catch (error) {
      fail(`learningIntroduction.content.src is invalid or missing: ${error.message}`);
      return errors;
    }
  }
  await validateMarkdownAssets(puzzle, markdown, markdownUrl, fail);

  if (introduction.sources !== undefined) {
    if (!Array.isArray(introduction.sources)) {
      fail("learningIntroduction.sources must be an array when present");
    } else {
      introduction.sources.forEach((source, index) => {
        if (!source || typeof source !== "object" || Array.isArray(source) ||
            !nonEmptyString(source.label)) {
          fail(`learningIntroduction.sources[${index}] requires a non-empty label`);
        }
        try {
          const url = new URL(source?.href);
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          fail(`learningIntroduction.sources[${index}].href must be an http(s) URL`);
        }
      });
    }
  }
  return errors;
}
