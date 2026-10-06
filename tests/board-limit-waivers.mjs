import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  boardLimit,
  boardLimitWaiverErrors
} from "../modules/boardLimitWaivers.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";

export const name = "board limit waivers: count-based request, grant, revoke, schema drift";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const draftId = "waiver-board";
const reviewer = { subject: "human", name: "Reviewer" };
const reason = "Every one of these terms marks a distinct usage boundary.";

function terms(count, prefix = "t") {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

function puzzleWith(clusterTerms) {
  return {
    id: draftId,
    title: "Waiver board",
    category: "Science",
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Claude", model: "Claude Opus 5.5", reasoning: "high" }]
    },
    clusters: [
      { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: clusterTerms.slice(0, 2), floatingTerms: clusterTerms.slice(2) },
      { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
    ],
    bridges: []
  };
}

function codes(document) {
  return boardLimitWaiverErrors(document).map(error => error.match(/^\[([^\]]+)\]/)[1]);
}

async function staticSchemaDrift() {
  const { normalLimit, approvedLimit } = boardLimit("cluster-term-count");
  const simplified = JSON.parse(await readFile(join(root, "content/schemas/simplified-puzzle-schema-v1.json"), "utf8"));
  const stored = JSON.parse(await readFile(join(root, "content/schemas/puzzle-v1.schema.json"), "utf8"));
  const zodText = await readFile(join(root, "content/schemas/simplified-zod-puzzle-schema.ts"), "utf8");
  const cluster = JSON.stringify(simplified);
  assert.match(cluster, new RegExp(`"floatingTerms":\\{"type":"array","minItems":1,"maxItems":${approvedLimit - 2}`));
  assert.match(cluster, new RegExp(`"terms":\\{"type":"array","minItems":2,"maxItems":${approvedLimit},`));
  assert.match(JSON.stringify(stored), new RegExp(`"terms":\\{"type":"array","minItems":2,"maxItems":${approvedLimit},`));
  assert.match(zodText, new RegExp(`floatingTerms: z\\.array\\(TermSchema\\)\\.min\\(1\\)\\.max\\(${approvedLimit - 2}\\)`));
  assert.match(zodText, new RegExp(`terms: z\\.array\\(TermSchema\\)\\.min\\(2\\)\\.max\\(${approvedLimit}\\)`));
  assert.ok(normalLimit < approvedLimit);
}

export async function run() {
  await staticSchemaDrift();

  const { normalLimit, approvedLimit } = boardLimit("cluster-term-count");
  assert.deepEqual(codes(puzzleWith(terms(normalLimit))), []);
  assert.deepEqual(codes(puzzleWith(terms(approvedLimit))), ["board-limit-waiver-required"]);
  assert.deepEqual(codes(puzzleWith(terms(approvedLimit + 1))), ["board-limit-hard-limit"]);

  const directory = await mkdtemp(join(tmpdir(), "cc-board-limit-waivers-"));
  try {
    const store = createPuzzleDraftStore({ directory });
    let draft = await store.createDraft({ draftId, document: puzzleWith(terms(approvedLimit)) });

    await assert.rejects(
      store.requestBoardLimitWaiver({
        draftId, waiverType: "cluster-term-count", targetId: "beta",
        reason, expectedRevision: draft.revision, actor: reviewer
      }),
      /must hold more than/
    );

    const request = await store.requestBoardLimitWaiver({
      draftId, waiverType: "cluster-term-count", targetId: "alpha",
      reason, expectedRevision: draft.revision, actor: reviewer
    });
    assert.equal(request.count, approvedLimit);

    draft = await store.decideBoardLimitWaiver({
      draftId, requestId: request.id, decision: "granted",
      expectedRevision: draft.revision, actor: reviewer
    });
    const [grant] = draft.document.boardLimitWaivers;
    assert.deepEqual(Object.keys(grant).sort(), [
      "approvedCount", "grantedAt", "grantedBy", "puzzleId", "reason", "targetId", "waiverType"
    ]);
    assert.equal(grant.approvedCount, approvedLimit);
    assert.deepEqual(codes(draft.document), []);

    // The grant is a layout allowance: swapping a term or shrinking keeps it.
    const swapped = puzzleWith([...terms(approvedLimit - 1), "a much longer replacement term"]);
    assert.deepEqual(codes({ ...swapped, boardLimitWaivers: [grant] }), []);
    assert.deepEqual(codes({ ...puzzleWith(terms(normalLimit)), boardLimitWaivers: [grant] }), []);
    const moved = { ...swapped, clusters: swapped.clusters.map(cluster =>
      cluster.id === "alpha" ? { ...cluster, id: "gamma" } : cluster) };
    assert.deepEqual(codes({ ...moved, boardLimitWaivers: [grant] }), ["board-limit-waiver-required"]);

    // A full-document save keeps the human's grant; it cannot drop or supply one.
    draft = await store.replaceDraft({
      draftId, document: swapped, expectedRevision: draft.revision
    });
    assert.deepEqual(draft.document.boardLimitWaivers, [grant]);
    assert.deepEqual(codes(draft.document), []);

    draft = await store.revokeBoardLimitWaiver({
      draftId, waiverType: "cluster-term-count", targetId: "alpha",
      expectedRevision: draft.revision, actor: reviewer
    });
    assert.equal(draft.document.boardLimitWaivers, undefined);
    const history = await store.listBoardLimitWaiverRequests(draftId);
    assert.deepEqual(history.map(item => item.status), ["revoked"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
