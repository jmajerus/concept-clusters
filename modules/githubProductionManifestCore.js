// Worker-safe GitHub production manifest helpers. Keep this module free of
// Node built-ins and local-workspace imports: the hosted authoring Worker
// imports it while its local counterpart uses githubProductionManifest.js for
// filesystem-backed snapshot persistence.

export function puzzleIdsFromRegistrySource(source) {
  const ids = new Set();
  if (typeof source !== "string" || !source) return ids;
  for (const match of source.matchAll(/from\s+["']\.\/[^"']+\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  for (const match of source.matchAll(/from\s+["']\.\/([^/"']+)\.js["']/g)) {
    ids.add(match[1]);
  }
  return ids;
}

export function puzzleIdsFromManifestSource(source) {
  if (typeof source !== "string" || !source) return [];
  const ids = [];
  const seen = new Set();
  for (const match of source.matchAll(/"id": "([^"]+)",\s*\n\s+"module":/g)) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function parseGithubProductionSource(source, { path = "puzzles/manifest.js" } = {}) {
  if (typeof source !== "string" || !source.trim()) return [];
  if (path.endsWith("manifest.js")) {
    const fromManifest = puzzleIdsFromManifestSource(source);
    if (fromManifest.length) return fromManifest;
  }
  return [...puzzleIdsFromRegistrySource(source)].sort();
}

export function inGithubProduction(snapshot, puzzleId) {
  if (!snapshot || !Array.isArray(snapshot.ids) || !snapshot.ids.length) {
    return null;
  }
  if (typeof puzzleId !== "string" || !puzzleId) return null;
  return snapshot.ids.includes(puzzleId);
}

export function withGithubProduction(row, snapshot) {
  const puzzleId = row?.id || row?.puzzleId || null;
  return {
    ...row,
    inGithubProduction: inGithubProduction(snapshot, puzzleId)
  };
}

export function projectGithubProductionIds(originIds, freezePlan = null) {
  const ids = new Set(
    (Array.isArray(originIds) ? originIds : []).filter(
      id => typeof id === "string" && id
    )
  );
  const puzzles = freezePlan?.puzzles || {};
  for (const id of [...(puzzles.add || []), ...(puzzles.update || [])]) {
    if (typeof id === "string" && id) ids.add(id);
  }
  for (const id of puzzles.remove || []) {
    if (typeof id === "string" && id) ids.delete(id);
  }
  return [...ids].sort();
}

// Same snapshot shape from the GitHub API (the hosted Worker has no local
// origin fetch or workspace file).
export async function snapshotGithubProductionManifestFromClient(github) {
  if (!github?.getBranchHead || !github?.readFile) {
    throw new Error("github client is required");
  }
  const branch = github.baseBranch || "main";
  const { commitSha } = await github.getBranchHead(branch);
  let sourcePath = "puzzles/manifest.js";
  let source = await github.readFile(sourcePath, commitSha);
  let ids = parseGithubProductionSource(source || "", { path: sourcePath });
  if (!ids.length) {
    sourcePath = "puzzles/index.js";
    source = await github.readFile(sourcePath, commitSha);
    ids = parseGithubProductionSource(source || "", { path: sourcePath });
  }
  return {
    fetchedAt: new Date().toISOString(),
    ref: branch,
    sha: commitSha || "",
    source: sourcePath,
    ids: [...ids].sort()
  };
}
