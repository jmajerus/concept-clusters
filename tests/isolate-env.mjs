// Imported first by run.mjs, before any test or tool module loads: tests
// must never reach live services through the developer's gitignored .env.
// Each variable that .env defines is set to an empty string, which
// process.loadEnvFile (loadProjectEnv) will not override, so a module that
// loads .env on import still sees no database URL, token, or password. A
// test that needs one of these sets it itself.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
// Live endpoints blanked even when .env does not name them.
const ALWAYS = ["AUTHORING_DATABASE_URL", "ZOTERO_MCP_URL"];

const path = join(root, ".env");
const fromFile = existsSync(path)
  ? readFileSync(path, "utf8").split("\n")
    .map(line => line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1])
    .filter(Boolean)
  : [];

for (const name of new Set([...ALWAYS, ...fromFile])) process.env[name] = "";
