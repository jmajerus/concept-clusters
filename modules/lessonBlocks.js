// IASP fenced blocks a learning introduction may use. Lesson Markdown is
// rendered by safeMarkdown.js, not Pandoc, so only this small allowlist
// renders as a styled block; any other fence renders its contents as plain
// text flow and fails draft validation. Syntax follows IASP: brace form
// `::: {.note .insight}` or shorthand `::: note.insight`, closed by `:::`.
// DOM-free so validation can share it.

export const LESSON_BLOCKS = Object.freeze([
  Object.freeze({ kind: "epigraph", classes: ["epigraph"], label: null }),
  Object.freeze({ kind: "insight", classes: ["note", "insight"], label: "Insight" }),
  Object.freeze({ kind: "definition", classes: ["note", "definition"], label: "Definition" }),
  Object.freeze({ kind: "example", classes: ["sidebar", "example"], label: "Example" })
]);

export const LESSON_BLOCK_NAMES = LESSON_BLOCKS.map(block => block.classes.join("."));

// Layout-only classes IASP pairs with a sidebar; they do not change the kind.
const NEUTRAL_CLASSES = new Set(["sidebar-block"]);

const FENCE_OPEN = /^:::+\s*(\S.*)$/;
const FENCE_CLOSE = /^:::+\s*$/;

export function fenceOpenSpec(line) {
  const match = FENCE_OPEN.exec(line.trim());
  return match ? match[1].trim() : null;
}

export function isFenceClose(line) {
  return FENCE_CLOSE.test(line.trim());
}

export function fenceClasses(spec) {
  if (spec.startsWith("{")) {
    const inner = spec.replace(/^\{|\}$/g, "");
    return [...inner.matchAll(/(?:^|\s)\.([A-Za-z][\w-]*)/g)].map(match => match[1]);
  }
  return spec.split(/\s+/)[0].split(".").filter(Boolean);
}

export function lessonBlockFor(classes) {
  const present = new Set(classes.filter(name => !NEUTRAL_CLASSES.has(name)));
  return LESSON_BLOCKS.find(block =>
    block.classes.length === present.size &&
    block.classes.every(name => present.has(name))) || null;
}

// Index of the `:::` line that closes the fence opened at `start` (nested
// fences balanced), or -1 when it is never closed.
export function fenceCloseIndex(lines, start) {
  let depth = 1;
  for (let index = start + 1; index < lines.length; index++) {
    if (fenceOpenSpec(lines[index]) !== null) depth++;
    else if (isFenceClose(lines[index]) && --depth === 0) return index;
  }
  return -1;
}

export function lessonBlockIssues(markdown, field = "learningIntroduction.content.text") {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const issues = [];
  let depth = 0;
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const spec = fenceOpenSpec(line);
    if (spec !== null) {
      depth++;
      if (!lessonBlockFor(fenceClasses(spec))) {
        issues.push(
          `${field}: block "::: ${spec}" is not a lesson block; use one of ` +
          `${LESSON_BLOCK_NAMES.join(", ")}`);
      }
    } else if (isFenceClose(line)) {
      if (depth === 0) issues.push(`${field}: ":::" closes no open block`);
      else depth--;
    }
  }
  if (depth > 0) issues.push(`${field}: ${depth} ":::" block(s) left unclosed`);
  return issues;
}
