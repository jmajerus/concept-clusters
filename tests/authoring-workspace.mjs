import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localAuthoringGuidance,
  localDraftReviewHint,
  localDraftReviewUrl,
  LOCAL_DRAFT_REVIEW_URL
} from "../modules/authoringDesignGuidance.js";
import {
  authoringWorkspacePaths,
  ensureAuthoringWorkspace,
  LEGACY_REVIEW_LOG_RELATIVE
} from "../modules/authoringWorkspacePaths.js";
import { parseListenHost, parseLocalDevOptions } from "../modules/localDevHttp.js";
import { runSuggest } from "../.agents/skills/review-puzzle/scripts/suggest-review.mjs";

export const name = "Authoring workspace: data dir, review URL, LAN bind, review log";

export async function run() {
  const env = {};
  assert.equal(localDraftReviewUrl(env), LOCAL_DRAFT_REVIEW_URL);
  assert.equal(localDraftReviewHint(env), " (needs npm run dev)");
  assert.equal(
    localDraftReviewUrl({ AUTHORING_DRAFT_REVIEW_URL: "http://authoring.lan:8787" }),
    "http://authoring.lan:8787/admin/drafts"
  );
  assert.equal(
    localDraftReviewUrl({
      AUTHORING_DRAFT_REVIEW_URL: "http://authoring.lan:8787/admin/drafts/"
    }),
    "http://authoring.lan:8787/admin/drafts"
  );
  assert.equal(localDraftReviewHint({ AUTHORING_DRAFT_REVIEW_URL: "http://x/admin/drafts" }), "");
  assert.match(
    localAuthoringGuidance({ AUTHORING_DRAFT_REVIEW_URL: "http://authoring.lan:8787" }),
    /http:\/\/authoring\.lan:8787\/admin\/drafts\/<draftId>/
  );
  assert.doesNotMatch(
    localAuthoringGuidance({ AUTHORING_DRAFT_REVIEW_URL: "http://authoring.lan:8787" }),
    /needs npm run dev/
  );

  const defaults = parseLocalDevOptions([], {});
  assert.equal(defaults.host, "127.0.0.1");
  assert.equal(parseLocalDevOptions(["--host", "0.0.0.0"], {}).host, "0.0.0.0");
  assert.equal(parseLocalDevOptions(["--host=0.0.0.0", "8790"], {}).port, 8790);
  assert.equal(
    parseLocalDevOptions([], { AUTHORING_LISTEN_HOST: "192.168.1.9" }).host,
    "192.168.1.9"
  );
  assert.throws(() => parseListenHost(""), { code: "ERR_INVALID_HOST" });
  assert.throws(() => parseLocalDevOptions(["--host"], {}), { code: "ERR_INVALID_HOST" });

  const root = mkdtempSync(join(tmpdir(), "cc-authoring-ws-"));
  try {
    const defaultPaths = authoringWorkspacePaths({ repositoryRoot: root, env: {} });
    assert.equal(defaultPaths.root, join(root, ".concept-clusters/authoring"));
    const override = join(root, "data");
    const paths = ensureAuthoringWorkspace({
      repositoryRoot: root,
      env: { AUTHORING_DATA_DIR: override }
    });
    assert.equal(paths.root, override);
    assert.ok(paths.inventories.endsWith("/inventories"));
    assert.ok(paths.working.endsWith("/working"));
    assert.ok(paths.catalogues.endsWith("/catalogues"));

    const legacyDir = join(root, ".agents/skills/review-puzzle");
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(
      join(root, LEGACY_REVIEW_LOG_RELATIVE),
      `${JSON.stringify({ puzzles: { migrated: { reviewedAt: "2026-01-01T00:00:00.000Z", outcome: "authored", guidance: { major: 1, minor: 0 } } } }, null, 2)}\n`
    );
    const emptyData = join(root, "empty-data");
    const migrated = ensureAuthoringWorkspace({
      repositoryRoot: root,
      env: { AUTHORING_DATA_DIR: emptyData }
    });
    const copied = JSON.parse(readFileSync(migrated.reviewLog, "utf8"));
    assert.ok(copied.puzzles.migrated);

    const recordDir = join(root, "record-data");
    const previous = process.env.AUTHORING_DATA_DIR;
    process.env.AUTHORING_DATA_DIR = recordDir;
    try {
      const recorded = runSuggest({
        record: "energy-flow",
        authored: true
      });
      assert.equal(recorded.wrote, true);
      assert.equal(recorded.path, join(recordDir, "review-log.json"));
      const log = JSON.parse(readFileSync(recorded.path, "utf8"));
      assert.equal(log.puzzles["energy-flow"].outcome, "authored");
    } finally {
      if (previous === undefined) delete process.env.AUTHORING_DATA_DIR;
      else process.env.AUTHORING_DATA_DIR = previous;
    }

    // A guidance-major bump makes an already-reviewed board due again. This
    // is how new structural review bars reach legacy puzzles rather than
    // treating historical commonality as an exemption.
    const staleDir = join(root, "stale-data");
    mkdirSync(staleDir, { recursive: true });
    writeFileSync(
      join(staleDir, "review-log.json"),
      `${JSON.stringify({ puzzles: { "energy-flow": {
        reviewedAt: "2026-09-01T00:00:00.000Z",
        outcome: "unchanged",
        guidance: { major: 4, minor: 9 }
      } } }, null, 2)}\n`
    );
    const previousStale = process.env.AUTHORING_DATA_DIR;
    process.env.AUTHORING_DATA_DIR = staleDir;
    try {
      const due = runSuggest({ due: true });
      assert.ok(due.stale >= 1);
      assert.ok(due.due.some(item => item.id === "energy-flow" && item.due === "stale"));
    } finally {
      if (previousStale === undefined) delete process.env.AUTHORING_DATA_DIR;
      else process.env.AUTHORING_DATA_DIR = previousStale;
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  const printed = spawnSync(process.execPath, ["tools/authoring-workspace.mjs"], {
    encoding: "utf8",
    env: {
      ...process.env,
      AUTHORING_DATA_DIR: join(tmpdir(), "cc-authoring-print"),
      AUTHORING_DRAFT_REVIEW_URL: "http://box.lan:8787/admin/drafts"
    }
  });
  assert.equal(printed.status, 0, printed.stderr);
  const snapshot = JSON.parse(printed.stdout);
  assert.equal(snapshot.draftReviewUrl, "http://box.lan:8787/admin/drafts");
  assert.match(snapshot.reviewLog, /review-log\.json$/);

  const reviewPlan = spawnSync(process.execPath, [
    ".agents/skills/review-puzzle/scripts/plan-review.mjs",
    "energy-flow",
    "--continue"
  ], { encoding: "utf8", env: { ...process.env } });
  assert.equal(reviewPlan.status, 0, reviewPlan.stderr);
  const plan = JSON.parse(reviewPlan.stdout);
  assert.equal(plan.chunk[0].mcpBudget, 7);
  assert.ok(plan.steps.some(step => step.includes("expected_revision")));
  assert.ok(plan.steps.some(step => step.includes("structural-regularity-combination")));
}
