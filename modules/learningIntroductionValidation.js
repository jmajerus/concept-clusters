import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  MAX_LEARNING_MARKDOWN_BYTES,
  validateLearningIntroductionStructure
} from "./learningIntroductionValidationCore.js";
import { resolvePuzzleResourceUrl } from "./puzzleManifest.js";

const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

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
  const errors = validateLearningIntroductionStructure(puzzle);
  const fail = message => errors.push(message);
  if (errors.length) return errors;

  const content = introduction.content;
  const hasText = content.text !== undefined;
  let markdown = "";
  let markdownUrl = null;
  if (hasText) {
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
      if (bytes.byteLength > MAX_LEARNING_MARKDOWN_BYTES) {
        fail(`learningIntroduction Markdown exceeds ${MAX_LEARNING_MARKDOWN_BYTES} bytes`);
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
  return errors;
}
