import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

export const name = "loadProjectEnv: repo-root .env without overriding existing vars";

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-env-"));
  const keys = [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
    "AUTHORING_OWNER_SUBJECT",
    "LOAD_PROJECT_ENV_TEST_ONLY"
  ];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    await writeFile(join(directory, ".env"), [
      "CLOUDFLARE_ACCOUNT_ID=account-from-file",
      "CLOUDFLARE_API_TOKEN=token-from-file",
      "AUTHORING_OWNER_SUBJECT=owner-from-file",
      "LOAD_PROJECT_ENV_TEST_ONLY=from-file"
    ].join("\n") + "\n");

    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.AUTHORING_OWNER_SUBJECT;
    process.env.LOAD_PROJECT_ENV_TEST_ONLY = "already-set";

    const missing = loadProjectEnv({
      repositoryRoot: join(directory, "does-not-exist")
    });
    assert.equal(missing.loaded, false);

    const loaded = loadProjectEnv({ repositoryRoot: directory });
    assert.equal(loaded.loaded, true);
    assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, "account-from-file");
    assert.equal(process.env.CLOUDFLARE_API_TOKEN, "token-from-file");
    assert.equal(process.env.AUTHORING_OWNER_SUBJECT, "owner-from-file");
    assert.equal(process.env.LOAD_PROJECT_ENV_TEST_ONLY, "already-set");
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await rm(directory, { recursive: true, force: true });
  }
}
