import assert from "node:assert/strict";
import {
  createMemoryContentDocumentRepository
} from "../modules/contentDocumentRepository.js";
import {
  categoryDocumentFromRegistry,
  upsertCatalogueDraft
} from "../modules/contentDocumentSeed.js";
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
}
