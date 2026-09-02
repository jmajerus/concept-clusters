import assert from "node:assert/strict";
import {
  createMemoryContentDocumentRepository
} from "../modules/contentDocumentRepository.js";
import {
  categoryDocumentFromRegistry,
  existingPuzzleOptions,
  listPuzzleCorpusRows,
  openPuzzleWorkingCopy,
  seedPublishedCatalogues,
  upsertCatalogueDraft,
  upsertCategoryDraft
} from "../modules/contentDocumentSeed.js";
import { DraftNotFoundError } from "../modules/draftRepository.js";
import { createCatalogueSkeleton } from "../modules/catalogueAuthorEngine.js";

export const name = "content documents: memory published row, history, revert";

export async function run() {
  const repo = createMemoryContentDocumentRepository();
  const actor = { subject: "author-1" };
  const skeleton = createCatalogueSkeleton({ id: "lab-docs", title: "Lab docs" });
  const created = await repo.createDraft({
    kind: "catalogue",
    id: "lab-docs",
    document: skeleton,
    actor
  });
  assert.equal(created.revision, 1);

  const saved = await repo.saveDraft({
    kind: "catalogue",
    id: "lab-docs",
    document: { ...skeleton, title: "Lab docs revised" },
    actor,
    expectedRevision: 1
  });
  assert.equal(saved.revision, 2);
  assert.equal(saved.document.title, "Lab docs revised");

  const published = await repo.publish({
    kind: "catalogue",
    id: "lab-docs",
    document: saved.document,
    actor
  });
  assert.equal(published.revision, 1);
  assert.equal(published.publishedBy, "author-1");
  assert.equal(published.cuedForFreezeAt, null);

  const marked = await repo.setFreezeCue({
    kind: "catalogue",
    id: "lab-docs",
    actor,
    cued: true
  });
  assert.ok(marked.cuedForFreezeAt);
  assert.equal(marked.cuedForFreezeBy, "author-1");
  const republished = await repo.publish({
    kind: "catalogue",
    id: "lab-docs",
    document: saved.document,
    actor
  });
  assert.equal(republished.cuedForFreezeAt, null);

  await repo.saveDraft({
    kind: "catalogue",
    id: "lab-docs",
    document: { ...saved.document, title: "typo" },
    actor,
    expectedRevision: 2
  });
  const reverted = await repo.revertDraft({ kind: "catalogue", id: "lab-docs", actor });
  assert.equal(reverted.document.title, "Lab docs revised");

  const category = categoryDocumentFromRegistry("Science", { domain: "sciences-mathematics" });
  await repo.seedPublishedIfAbsent({
    kind: "category",
    id: category.id,
    document: category
  });
  const again = await repo.seedPublishedIfAbsent({
    kind: "category",
    id: category.id,
    document: { ...category, title: "Should not overwrite" }
  });
  assert.equal(again.document.title, "Science");
  assert.equal(again.cuedForFreezeBy, "git-seed");

  const upserted = await upsertCatalogueDraft(repo, {
    document: { ...skeleton, id: "mcp-catalogue", title: "From MCP" },
    actor
  });
  assert.equal(upserted.document.title, "From MCP");
  const upsertedAgain = await upsertCatalogueDraft(repo, {
    document: { ...skeleton, id: "mcp-catalogue", title: "From MCP again" },
    actor
  });
  assert.equal(upsertedAgain.document.title, "From MCP again");

  const categoryDraft = await upsertCategoryDraft(repo, {
    document: { id: "lab-subject", title: "Lab Subject", info: { text: "Lab" } },
    actor
  });
  assert.equal(categoryDraft.document.title, "Lab Subject");
  const categoryAgain = await upsertCategoryDraft(repo, {
    document: { id: "lab-subject", title: "Lab Subject revised", info: { text: "Lab" } },
    actor
  });
  assert.equal(categoryAgain.document.title, "Lab Subject revised");

  let seededIds = [];
  const innerSeedMany = repo.seedPublishedManyIfAbsent.bind(repo);
  repo.seedPublishedManyIfAbsent = async items => {
    seededIds = items.map(item => item.id);
    return innerSeedMany(items);
  };
  await seedPublishedCatalogues(repo, [
    { id: "all", title: "All", entries: [] },
    { id: "leaf-one", title: "Leaf one", entries: [] },
    { id: "leaf-two", title: "Leaf two", kind: "meta", entries: [] },
    { id: "leaf-one", title: "Should not duplicate", entries: [] }
  ]);
  assert.deepEqual(seededIds, ["leaf-one", "leaf-two"]);
  assert.equal(
    (await repo.getPublished({ kind: "catalogue", id: "leaf-two" })).document.kind,
    "meta"
  );
  seededIds = ["not-called"];
  await seedPublishedCatalogues(repo, [
    { id: "leaf-one", title: "Changed title must not overwrite", entries: [] },
    { id: "leaf-three", title: "Leaf three", entries: [] }
  ]);
  assert.deepEqual(seededIds, ["leaf-three"]);
  assert.equal((await repo.getPublished({ kind: "catalogue", id: "leaf-one" })).title, "Leaf one");

  const withdrawn = await repo.unpublish({
    kind: "catalogue",
    id: "leaf-one",
    actor
  });
  assert.ok(withdrawn.withdrawnAt);
  assert.deepEqual(
    (await repo.listPublished({ kind: "catalogue" })).map(row => row.id).sort(),
    ["lab-docs", "leaf-three", "leaf-two"]
  );
  assert.ok(
    (await repo.listPublished({ kind: "catalogue", includeWithdrawn: true }))
      .some(row => row.id === "leaf-one" && row.withdrawnAt)
  );
  seededIds = ["not-called"];
  await seedPublishedCatalogues(repo, [
    { id: "leaf-one", title: "Must not resurrect", entries: [] }
  ]);
  assert.deepEqual(seededIds, ["not-called"]);
  assert.ok((await repo.getPublished({ kind: "catalogue", id: "leaf-one" })).withdrawnAt);

  const restored = await repo.publish({
    kind: "catalogue",
    id: "leaf-one",
    document: { id: "leaf-one", title: "Leaf one restored", entries: [] },
    actor
  });
  assert.equal(restored.withdrawnAt, null);
  assert.equal(restored.title, "Leaf one restored");

  await repo.deleteDraft({ kind: "catalogue", id: "lab-docs", actor });
  await assert.rejects(
    () => repo.getDraft({ kind: "catalogue", id: "lab-docs", actor }),
    error => error.name === "DraftNotFoundError"
  );

  const publishedPuzzle = {
    id: "old-git-puzzle",
    title: "Published Title",
    category: "Science",
    clusters: [],
    bridges: []
  };
  await repo.seedPublishedIfAbsent({
    kind: "puzzle",
    id: "old-git-puzzle",
    document: publishedPuzzle
  });
  const drafts = new Map();
  const getDraft = async draftId => {
    const row = drafts.get(draftId);
    if (!row) throw new DraftNotFoundError(draftId);
    return row;
  };
  const createDraft = async ({ draftId, document }) => {
    if (drafts.has(draftId)) throw new Error(`Draft "${draftId}" already exists`);
    const row = { draftId, document, revision: 1 };
    drafts.set(draftId, row);
    return row;
  };
  const opened = await openPuzzleWorkingCopy({
    getDraft,
    createDraft,
    contentDocuments: repo,
    contentService: {
      getPuzzleDocument() {
        throw new Error("should not hit git when published exists");
      }
    },
    puzzleId: "old-git-puzzle"
  });
  assert.equal(opened.created, true);
  assert.equal(opened.draft.document.title, "Published Title");

  const reused = await openPuzzleWorkingCopy({
    getDraft,
    createDraft,
    contentDocuments: repo,
    contentService: { getPuzzleDocument: () => null },
    puzzleId: "old-git-puzzle"
  });
  assert.equal(reused.created, false);
  assert.equal(reused.draft.revision, 1);

  const fromGit = await openPuzzleWorkingCopy({
    getDraft,
    createDraft,
    contentDocuments: repo,
    contentService: {
      getPuzzleDocument(id) {
        if (id !== "git-only") throw new Error(`Unknown puzzle: ${id}`);
        return { id: "git-only", title: "Git Only", category: "Science" };
      },
      listPuzzles() {
        return [
          { id: "git-only", title: "Git Only" },
          { id: "old-git-puzzle", title: "Git Title" }
        ];
      }
    },
    puzzleId: "git-only"
  });
  assert.equal(fromGit.created, true);
  assert.equal(
    (await repo.getPublished({ kind: "puzzle", id: "git-only" })).document.title,
    "Git Only"
  );

  await assert.rejects(
    () => openPuzzleWorkingCopy({
      getDraft,
      createDraft,
      contentDocuments: repo,
      contentService: { getPuzzleDocument() { throw new Error("missing"); } },
      puzzleId: "does-not-exist"
    }),
    error => error.status === 404 && /Unknown puzzle/.test(error.message)
  );

  const options = existingPuzzleOptions({
    contentService: {
      listPuzzles() {
        return [
          { id: "git-only", title: "Git Only" },
          { id: "old-git-puzzle", title: "Git Title" }
        ];
      }
    },
    publishedRows: [{ id: "old-git-puzzle", document: { title: "Published Title" } }]
  });
  assert.deepEqual(options.map(item => item.id), ["git-only", "old-git-puzzle"]);
  assert.equal(options.find(item => item.id === "old-git-puzzle").title, "Published Title");

  const corpus = listPuzzleCorpusRows({
    gitPuzzles: [
      { id: "git-only", title: "Git Only", category: "Science" },
      { id: "old-git-puzzle", title: "Git Title", category: "Science" }
    ],
    publishedRows: [{
      id: "old-git-puzzle",
      document: { title: "Published Title", category: "Science" }
    }],
    drafts: [{
      draftId: "old-git-puzzle-wip",
      puzzleId: "old-git-puzzle",
      document: { id: "old-git-puzzle", title: "Working Title", category: "Science" },
      title: "Working Title",
      status: "draft",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }]
  });
  const overlay = corpus.find(item => item.id === "old-git-puzzle");
  const gitOnly = corpus.find(item => item.id === "git-only");
  assert.equal(corpus.length, 2);
  assert.equal(overlay.hasWorkingCopy, true);
  assert.equal(overlay.draftId, "old-git-puzzle-wip");
  assert.equal(overlay.title, "Working Title");
  assert.equal(overlay.published, true);
  assert.equal(gitOnly.hasWorkingCopy, false);
  assert.equal(gitOnly.inGit, true);
}
