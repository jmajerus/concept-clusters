function dirname(path) {
  const index = path.lastIndexOf("/");
  return index < 0 ? "." : path.slice(0, index) || ".";
}

function relative(from, to) {
  const fromParts = from.split("/").filter(part => part && part !== ".");
  const toParts = to.split("/").filter(part => part && part !== ".");
  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }
  return [...fromParts.map(() => ".."), ...toParts].join("/") || ".";
}

export function formattedJson(document) {
  return `${JSON.stringify(document, null, 2)}\n`;
}

function variableName(id) {
  const words = id.split("-");
  return words[0] + words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join("");
}

export function generatedPuzzleModule(
  puzzle,
  canonicalRelativePath,
  moduleRelativePath
) {
  let manifestImport = relative(
    dirname(moduleRelativePath),
    "modules/puzzleManifest.js"
  );
  if (!manifestImport.startsWith(".")) manifestImport = `./${manifestImport}`;
  return `// Generated from ${canonicalRelativePath}.\n` +
    "// Edit the JSON-LD source and re-import it rather than editing this file directly.\n\n" +
    `import { definePuzzle } from "${manifestImport}";\n\n` +
    `export default definePuzzle(import.meta.url, ${JSON.stringify(puzzle, null, 2)});\n`;
}

// A brand-new catalogues/<id>.js file's full source, in the same
// bare-key-where-valid style serializeObjectLiteral already produces for
// spliced-in category and catalogue-entry registrations, so this matches
// hand-authored files like catalogues/concept-lenses.js.
export function generatedCatalogueModule(catalogue) {
  return `export default ${serializeObjectLiteral(catalogue)};\n`;
}

export function registerPuzzleSource(registry, puzzle, moduleRelativePath) {
  const variable = variableName(puzzle.id);
  const importPath = `./${relative("puzzles", moduleRelativePath)}`;
  const commentMarker = "\n// Cross-disciplinary membership";
  const importLine = `import ${variable} from "${importPath}";`;
  const markerIndex = registry.indexOf(commentMarker);
  if (markerIndex < 0) {
    throw new Error("Could not locate puzzle registry import boundary");
  }
  const withImport = `${registry.slice(0, markerIndex)}\n${importLine}${registry.slice(markerIndex)}`;
  const arrayStart = withImport.indexOf("export const PUZZLES = [");
  const arrayEnd = withImport.indexOf("\n];", arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) {
    throw new Error("Could not locate PUZZLES registry array");
  }
  // The new last element keeps a trailing comma (valid in an array
  // literal), so this splice only ever inserts a line -- it never rewrites
  // the previous last element the way a `before,\n  ${variable}` splice
  // would. Two puzzle PRs that both append here produce non-overlapping
  // insertions, which is what lets `puzzles/index.js merge=union` in
  // .gitattributes auto-merge concurrent registrations on GitHub instead
  // of conflicting. Strip any existing trailing comma first so re-running
  // this against an already-comma-terminated array doesn't double it.
  const before = withImport.slice(0, arrayEnd).trimEnd().replace(/,$/, "");
  return `${before},\n  ${variable},${withImport.slice(arrayEnd)}`;
}

// catalogues/index.js has no marker comment the way puzzles/index.js does
// (nothing analogous to "// Cross-disciplinary membership") -- it's just
// imports, a blank line, then the array export -- so this anchors on that
// blank-line-then-declaration boundary instead of a comment.
export function registerCatalogueSource(source, catalogueId, moduleRelativePath) {
  const variable = variableName(catalogueId);
  const importPath = `./${relative("catalogues", moduleRelativePath)}`;
  const importLine = `import ${variable} from "${importPath}";`;
  const arrayMarker = "\n\nexport const CATALOGUES = [";
  const markerIndex = source.indexOf(arrayMarker);
  if (markerIndex < 0) {
    throw new Error("Could not locate catalogue registry import boundary");
  }
  const withImport = `${source.slice(0, markerIndex)}\n${importLine}${source.slice(markerIndex)}`;
  const arrayStart = withImport.indexOf("export const CATALOGUES = [");
  const arrayEnd = withImport.indexOf("\n];", arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) {
    throw new Error("Could not locate CATALOGUES registry array");
  }
  const before = withImport.slice(0, arrayEnd).trimEnd();
  return `${before},\n  ${variable}${withImport.slice(arrayEnd)}`;
}

const IDENTIFIER_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// puzzles/categories.js and catalogues/*.js are hand-authored with bare
// keys wherever they're valid identifiers (only a display name containing
// spaces or "&", like a category's own name, needs quoting) -- generating
// spliced-in entries via plain JSON.stringify quoted every key instead,
// visibly inconsistent with the surrounding file (flagged in a PR review
// on the first new_category submission). This mirrors JSON.stringify's
// object/array/indent shape but emits a bare key whenever one is valid.
function serializeObjectLiteral(value, indent = "") {
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const inner = `${indent}  `;
    const items = value.map(item => `${inner}${serializeObjectLiteral(item, inner)}`);
    return `[\n${items.join(",\n")}\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    const inner = `${indent}  `;
    const items = keys.map(key => {
      const keyText = IDENTIFIER_KEY.test(key) ? key : JSON.stringify(key);
      return `${inner}${keyText}: ${serializeObjectLiteral(value[key], inner)}`;
    });
    return `{\n${items.join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

export function addCatalogueEntrySource(source, entry) {
  const closing = source.lastIndexOf("\n  ]\n};");
  if (closing < 0) {
    throw new Error("Could not locate catalogue entries array");
  }
  const block = `    ${serializeObjectLiteral(entry, "    ")}`;
  return `${source.slice(0, closing).trimEnd()},\n${block}${source.slice(closing)}`;
}

export function registerCategorySource(source, { name, metadata }) {
  // Anchored to CATEGORIES's own closing brace, not to whatever export
  // happens to follow it -- that used to be GENERATED_SUBCATEGORY_IDS
  // directly, until DOMAINS was inserted between them and a marker
  // anchored on the following export silently spliced new categories into
  // the end of DOMAINS instead (caught via a malformed live PR).
  const categoriesStart = source.indexOf("export const CATEGORIES");
  if (categoriesStart < 0) {
    throw new Error("Could not locate category registry boundary");
  }
  const boundary = source.indexOf("\n};\n", categoriesStart);
  if (boundary < 0) {
    throw new Error("Could not locate category registry boundary");
  }
  const keyText = IDENTIFIER_KEY.test(name) ? name : JSON.stringify(name);
  const entry = `  ${keyText}: ${serializeObjectLiteral(metadata, "  ")}`;
  const before = source.slice(0, boundary).trimEnd();
  const separator = before.endsWith("{") ? "\n" : ",\n";
  return `${before}${separator}${entry}${source.slice(boundary)}`;
}

export async function publicationApprovalToken({
  baseCommitSha = null,
  changes,
  options = {}
}) {
  const payload = JSON.stringify({
    baseCommitSha,
    options,
    changes: changes.map(change => ({
      path: change.relativePath,
      original: change.original === null ? null : change.original,
      content: change.content
    }))
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload)
  );
  return `sha256:${[...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
