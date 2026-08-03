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
  const before = withImport.slice(0, arrayEnd).trimEnd();
  return `${before},\n  ${variable}${withImport.slice(arrayEnd)}`;
}

export function addCatalogueEntrySource(source, entry) {
  const closing = source.lastIndexOf("\n  ]\n};");
  if (closing < 0) {
    throw new Error("Could not locate catalogue entries array");
  }
  const block = JSON.stringify(entry, null, 2)
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");
  return `${source.slice(0, closing).trimEnd()},\n${block}${source.slice(closing)}`;
}

export function registerCategorySource(source, { name, metadata }) {
  const marker = "\n};\n\nexport const GENERATED_SUBCATEGORY_IDS";
  const boundary = source.indexOf(marker);
  if (boundary < 0) {
    throw new Error("Could not locate category registry boundary");
  }
  const entry = JSON.stringify({ [name]: metadata }, null, 2)
    .split("\n")
    .slice(1, -1)
    .join("\n");
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
