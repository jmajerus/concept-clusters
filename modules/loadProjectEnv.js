import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Loads gitignored `.env` from the repository root into process.env.
// Existing variables win, so a client that already injected env is unchanged.
// Missing `.env` is a no-op: CI and hosts without a local file still start.
export function loadProjectEnv({
  repositoryRoot = DEFAULT_ROOT,
  filename = ".env"
} = {}) {
  const path = join(repositoryRoot, filename);
  if (!existsSync(path)) return { path, loaded: false };
  process.loadEnvFile(path);
  return { path, loaded: true };
}

export default loadProjectEnv;
