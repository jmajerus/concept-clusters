// Local authoring scratch that must not live in git: review cadence,
// inventories, split plans, loss ledgers, proposal files, and the
// GitHub production snapshot (Refresh from GitHub or Freeze). Override
// the root with AUTHORING_DATA_DIR (a Proxmox volume, a LAN share, etc.).
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const DEFAULT_AUTHORING_DATA_RELATIVE = ".concept-clusters/authoring";
export const GITHUB_PRODUCTION_MANIFEST_FILE = "github-production-manifest.json";
export const LEGACY_REVIEW_LOG_RELATIVE =
  ".agents/skills/review-puzzle/review-log.json";

export function resolveAuthoringDataDir({
  repositoryRoot = DEFAULT_ROOT,
  env = process.env
} = {}) {
  const fromEnv = typeof env.AUTHORING_DATA_DIR === "string"
    ? env.AUTHORING_DATA_DIR.trim()
    : "";
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : resolve(repositoryRoot, fromEnv);
  }
  return join(repositoryRoot, DEFAULT_AUTHORING_DATA_RELATIVE);
}

export function authoringWorkspacePaths({
  repositoryRoot = DEFAULT_ROOT,
  env = process.env
} = {}) {
  const root = resolveAuthoringDataDir({ repositoryRoot, env });
  return {
    root,
    reviewLog: join(root, "review-log.json"),
    inventories: join(root, "inventories"),
    plans: join(root, "plans"),
    ledgers: join(root, "ledgers"),
    working: join(root, "working"),
    catalogues: join(root, "catalogues"),
    proposals: join(root, "proposals"),
    githubProductionManifest: join(root, GITHUB_PRODUCTION_MANIFEST_FILE),
    inventoryFile: id => join(root, "inventories", `${id}.json`),
    splitPlanFile: id => join(root, "plans", `${id}-split-plan.json`),
    ledgerFile: id => join(root, "ledgers", `${id}-fit.json`),
    workingDraftFile: id => join(root, "working", `${id}.json`),
    catalogueDraftFile: id => join(root, "catalogues", `${id}.json`)
  };
}

export function ensureAuthoringWorkspace({
  repositoryRoot = DEFAULT_ROOT,
  env = process.env
} = {}) {
  const paths = authoringWorkspacePaths({ repositoryRoot, env });
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.inventories, { recursive: true });
  mkdirSync(paths.plans, { recursive: true });
  mkdirSync(paths.ledgers, { recursive: true });
  mkdirSync(paths.working, { recursive: true });
  mkdirSync(paths.catalogues, { recursive: true });
  mkdirSync(paths.proposals, { recursive: true });
  migrateLegacyReviewLog(paths.reviewLog, {
    repositoryRoot,
    env
  });
  return paths;
}

function migrateLegacyReviewLog(dest, { repositoryRoot }) {
  if (existsSync(dest)) return;
  const legacy = join(repositoryRoot, LEGACY_REVIEW_LOG_RELATIVE);
  if (!existsSync(legacy)) return;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(legacy, dest);
}

export function authoringWorkspaceSnapshot({
  repositoryRoot = DEFAULT_ROOT,
  env = process.env,
  draftReviewUrl
} = {}) {
  const paths = authoringWorkspacePaths({ repositoryRoot, env });
  return {
    dataDir: paths.root,
    reviewLog: paths.reviewLog,
    inventoriesDir: paths.inventories,
    plansDir: paths.plans,
    ledgersDir: paths.ledgers,
    workingDir: paths.working,
    cataloguesDir: paths.catalogues,
    proposalsDir: paths.proposals,
    draftReviewUrl
  };
}
