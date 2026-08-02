const PUZZLE_SOURCE_URL = Symbol("concept-clusters:puzzle-source-url");

function normalizedModuleUrl(moduleUrl) {
  try {
    return new URL(moduleUrl);
  } catch {
    // Cloudflare's production bundler may expose import.meta.url as a module
    // identifier rather than an absolute URL while validating the bundle.
    // Preserve its path semantics; hosted authoring embeds packaged resources.
    const path = String(moduleUrl).replaceAll("\\", "/");
    return new URL(
      path.startsWith("/") ? path : `/${path}`,
      "https://worker.invalid"
    );
  }
}

// Resource-bearing puzzles opt into this wrapper so a manifest can retain
// readable `./introduction.md` references without making source-location
// metadata part of its serializable puzzle schema.
export function definePuzzle(moduleUrl, puzzle) {
  Object.defineProperty(puzzle, PUZZLE_SOURCE_URL, {
    value: normalizedModuleUrl(moduleUrl),
    enumerable: false,
    configurable: false,
    writable: false
  });
  return puzzle;
}

export function puzzleSourceUrl(puzzle) {
  return puzzle?.[PUZZLE_SOURCE_URL] || null;
}

function flatPackagePrefix(puzzle, sourceUrl) {
  const filename = sourceUrl.pathname.split("/").pop() || "";
  return filename === `${puzzle.id}.js` ? `${puzzle.id}.` : null;
}

// Flat puzzle files may use sibling resources prefixed with their puzzle id
// (`energy-flow.intro.md`, `energy-flow.assets/...`). A future directory-style
// package (`energy-flow/puzzle.js`) may use anything within that directory.
// In both cases, URL normalization plus this scope check rejects traversal.
export function resolvePuzzleResourceUrl(puzzle, relativeSrc, relativeTo = null) {
  if (typeof relativeSrc !== "string" || !relativeSrc.trim()) {
    throw new Error("Puzzle resource paths must be non-empty strings.");
  }
  const sourceUrl = puzzleSourceUrl(puzzle);
  if (!sourceUrl) {
    throw new Error(`Puzzle "${puzzle?.id || "unknown"}" has no module origin.`);
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(relativeSrc) || relativeSrc.startsWith("//")) {
    throw new Error("Puzzle resources must use local relative paths.");
  }
  const packageBase = new URL(".", sourceUrl);
  const resolved = new URL(relativeSrc, relativeTo || packageBase);
  if (resolved.origin !== packageBase.origin ||
      !resolved.pathname.startsWith(packageBase.pathname)) {
    throw new Error("Puzzle resource paths cannot escape their package.");
  }
  const prefix = flatPackagePrefix(puzzle, sourceUrl);
  if (prefix) {
    const packageRelative = decodeURIComponent(
      resolved.pathname.slice(packageBase.pathname.length)
    );
    if (!packageRelative.startsWith(prefix)) {
      throw new Error(
        `Flat puzzle resources must begin with "${prefix}".`
      );
    }
  }
  return resolved;
}
