// Follow terminology-mcp's cc-subjects changelog by hand. The authoring
// server's drain loop does this on every tick when SUBJECTS_SYNC=on.
//
//   npm run subjects:sync                     # dry run: what the next pass would apply, and where it would stop
//   npm run subjects:sync -- --apply          # apply now and report progress to terminology-mcp
//   npm run subjects:sync -- --accept <n>     # change n was handled by hand; move the cursor past it
//   npm run subjects:sync -- --rebootstrap    # forget the cursor; the next pass bootstraps from the snapshot
//
// Needs AUTHORING_DATABASE_URL; TERMINOLOGY_BASE overrides the default server.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { PostgresPublishedRepository } from "../modules/postgresPublishedRepository.js";
import {
  acceptHeldChange,
  createSubscriptionStore,
  reportProgress,
  runSubjectsSync
} from "../modules/subjectsSubscriber.js";
import { createTerminologyClient, terminologyConfig } from "../modules/terminologyClient.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv({ repositoryRoot });

const config = terminologyConfig(process.env);
if (!config) {
  console.error("TERMINOLOGY_BASE is off; nothing to sync.");
  process.exit(1);
}
if (!authoringDatabaseUrl()) {
  console.error("AUTHORING_DATABASE_URL is required.");
  process.exit(1);
}

const args = process.argv.slice(2);
const acceptAt = args.indexOf("--accept");
const pool = getAuthoringPool();
const client = createTerminologyClient(config);
const store = createSubscriptionStore(pool);
const repository = new PostgresPublishedRepository(pool);

function print(label, lines) {
  if (!lines?.length) return;
  console.log(label);
  for (const line of lines) console.log(`  ${typeof line === "string" ? line : `${line.code}: ${line.reason}`}`);
}

try {
  if (args.includes("--rebootstrap")) {
    await store.clear();
    console.log("Cursor cleared; the next pass bootstraps from terminology-mcp's snapshot.");
  } else if (acceptAt !== -1) {
    const n = Number(args[acceptAt + 1]);
    if (!Number.isInteger(n)) throw new Error("--accept needs a change number.");
    const result = await acceptHeldChange({ client, store, n });
    await reportProgress(client, result);
    console.log(`Accepted change ${n} (${result.change.kind}); the cursor is at ${n}. The next pass continues after it.`);
  } else {
    const apply = args.includes("--apply");
    const result = await runSubjectsSync({ client, store, repository, apply });
    console.log(`Subjects sync ${apply ? "" : "(dry run) "}${result.outcome} against ${config.baseUrl}: through ${result.through}, head ${result.head ?? "?"}`);
    print("Would apply:", result.planned);
    print("Applied:", result.applied);
    print("Problems (reported, not applied):", result.problems);
    if (result.blocked) console.log(`Held at change ${result.blocked.at} (${result.blocked.code}): ${result.blocked.reason}`);
    if (result.hold) console.log(`Bootstrap held (${result.hold.code}): ${result.hold.reason}`);
    if (apply && !["rebuilt", "bootstrap-held"].includes(result.outcome)) await reportProgress(client, result);
  }
} finally {
  await pool.end();
}
