import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  SAVE_WORKING_DRAFT_EXIT,
  WorkingDraftSaveError,
  parseSaveWorkingDraftArgs,
  readWorkingDraftBaseline,
  readWorkingDraftDocument,
  saveWorkingDraft,
  writeWorkingDraftBaseline
} from "../modules/saveWorkingDraft.js";

export const name = "Save working draft: revision lock stays with the helper";

function loaded(revision) {
  return { isError: false, structured: { draft: { revision } } };
}

export async function run() {
  const parsed = parseSaveWorkingDraftArgs([
    "--domain", "content",
    "--repair",
    "--client-info", "{\"name\":\"kilo\"}",
    "--expected-revision", "2",
    "chirality-isomer-classes"
  ]);
  assert.equal(parsed.draftId, "chirality-isomer-classes");
  assert.equal(parsed.domain, "content");
  assert.equal(parsed.repair, true);
  assert.equal(parsed.expectedRevision, 2);
  assert.throws(
    () => parseSaveWorkingDraftArgs(["--publish-to-authoring", "chirality-isomer-classes"]),
    error => error instanceof WorkingDraftSaveError && error.code === "usage"
      && /cannot publish a puzzle/.test(error.message)
  );
  assert.equal(parsed.clientInfoRaw, "{\"name\":\"kilo\"}");
  assert.throws(
    () => parseSaveWorkingDraftArgs(["--expected-revision", "0", "chirality-isomer-classes"]),
    error => error instanceof WorkingDraftSaveError && error.code === "usage"
  );
  assert.throws(
    () => parseSaveWorkingDraftArgs(["Not A Slug"]),
    error => error instanceof WorkingDraftSaveError && error.code === "usage"
  );

  const root = mkdtempSync(join(tmpdir(), "cc-save-working-"));
  try {
    const missing = spawnSync(process.execPath, [
      "tools/save-working-draft.mjs",
      "missing-board"
    ], {
      encoding: "utf8",
      env: { ...process.env, AUTHORING_DATA_DIR: root }
    });
    assert.equal(missing.status, SAVE_WORKING_DRAFT_EXIT["invalid-document"]);
    assert.match(missing.stderr, /No working file/);
    const missingPayload = JSON.parse(missing.stdout);
    assert.equal(missingPayload.ok, false);
    assert.equal(missingPayload.code, "invalid-document");

    const working = join(root, "working");
    mkdirSync(working, { recursive: true });
    writeFileSync(join(working, "chirality-isomer-classes.json"), "{\"id\":\"chirality-isomer-classes\",\"title\":\"Mirror\"}\n");
    const document = await readWorkingDraftDocument("chirality-isomer-classes", {
      env: { AUTHORING_DATA_DIR: root }
    });
    assert.equal(document.title, "Mirror");
    assert.equal(await readWorkingDraftBaseline("chirality-isomer-classes", {
      env: { AUTHORING_DATA_DIR: root }
    }), null);
    const noBaseline = spawnSync(process.execPath, [
      "tools/save-working-draft.mjs",
      "chirality-isomer-classes"
    ], {
      encoding: "utf8",
      env: { ...process.env, AUTHORING_DATA_DIR: root }
    });
    assert.equal(noBaseline.status, SAVE_WORKING_DRAFT_EXIT["missing-baseline"]);
    assert.match(noBaseline.stderr, /Refusing to adopt the current revision/);
    await writeWorkingDraftBaseline("chirality-isomer-classes", 2, {
      env: { AUTHORING_DATA_DIR: root }
    });
    assert.equal(await readWorkingDraftBaseline("chirality-isomer-classes", {
      env: { AUTHORING_DATA_DIR: root }
    }), 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  let calls = 0;
  await assert.rejects(
    () => saveWorkingDraft({
      draftId: "chirality-isomer-classes",
      document: { id: "chirality-isomer-classes" },
      expectedRevision: 1,
      callTool: async name => {
        calls += 1;
        assert.equal(name, "get_puzzle_draft");
        return {
          isError: true,
          structured: { error: "Unknown draft: chirality-isomer-classes" }
        };
      }
    }),
    error => error instanceof WorkingDraftSaveError && error.code === "missing-draft"
  );
  assert.equal(calls, 1);

  calls = 0;
  await assert.rejects(
    () => saveWorkingDraft({
      draftId: "chirality-isomer-classes",
      document: { id: "other-board" },
      expectedRevision: 1,
      callTool: async () => {
        calls += 1;
        return loaded(1);
      }
    }),
    error => error.code === "document-id-mismatch"
  );
  assert.equal(calls, 0);

  calls = 0;
  await assert.rejects(
    () => saveWorkingDraft({
      draftId: "chirality-isomer-classes",
      document: { id: "chirality-isomer-classes", title: "Next" },
      expectedRevision: 2,
      callTool: async (name, args) => {
        calls += 1;
        if (name === "get_puzzle_draft") return loaded(2);
        assert.equal(name, "save_puzzle_draft");
        assert.equal(args.expected_revision, 2);
        assert.equal(args.document.title, "Next");
        return {
          isError: true,
          structured: { error: "Draft revision conflict: expected 2, current revision is 3" }
        };
      }
    }),
    error => error.code === "revision-conflict" &&
      error.expectedRevision === 2 &&
      error.currentRevision === 3
  );
  assert.equal(calls, 2);

  calls = 0;
  await assert.rejects(
    () => saveWorkingDraft({
      draftId: "chirality-isomer-classes",
      document: { id: "chirality-isomer-classes", title: "Stale" },
      expectedRevision: 1,
      callTool: async name => {
        calls += 1;
        assert.equal(name, "get_puzzle_draft");
        return loaded(2);
      }
    }),
    error => error.code === "revision-conflict" &&
      error.expectedRevision === 1 &&
      error.currentRevision === 2
  );
  assert.equal(calls, 1);

  await assert.rejects(
    () => saveWorkingDraft({
      draftId: "chirality-isomer-classes",
      document: { id: "chirality-isomer-classes" },
      callTool: async () => {
        throw new Error("must not load the current revision without a baseline");
      }
    }),
    error => error.code === "missing-baseline"
  );

  const saved = await saveWorkingDraft({
    draftId: "chirality-isomer-classes",
    document: { id: "chirality-isomer-classes", clusters: [] },
    expectedRevision: 4,
    domain: "content",
    repair: true,
    callTool: async (name, args) => {
      if (name === "get_puzzle_draft") return loaded(4);
      assert.equal(args.domain, "content");
      assert.equal(args.repair, true);
      assert.equal(args.publish_to_authoring, undefined);
      assert.equal(args.expected_revision, 4);
      return {
        isError: false,
        structured: {
          draft: { revision: 5 },
          repair: { applied: false, changes: [] },
          publicationErrors: ["layout"],
          published: null
        }
      };
    }
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.expectedRevision, 4);
  assert.equal(saved.revision, 5);
  assert.deepEqual(saved.publicationErrors, ["layout"]);
  assert.equal(saved.published, null);
}
