import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { mergeCategoryRegistry } from "../modules/authoringMcpTaxonomy.js";
import { validateCategoryDocument } from "../modules/categoryValidation.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";
import {
  expectedStarLayoutNodeKeys,
  starLayoutRevision
} from "../modules/starLayoutSchema.js";
import { layoutDocumentForMode } from "../modules/layoutDocument.js";
import {
  seedPublishedCatalogues,
  seedPublishedCategories
} from "../modules/contentDocumentSeed.js";

export const name = "MCP authoring: D1 categories and catalogues without GitHub";

function stubDraftRepository() {
  return {
    async list() { return []; },
    async get({ draftId }) { throw new Error(`Unknown draft: ${draftId}`); }
  };
}

// Minimal in-memory draft repository, just for exercising
// save_puzzle_draft's publish_to_authoring flag below -- the file's other
// server uses stubDraftRepository (list/get only; no puzzle draft tool is
// called against it).
function inMemoryDraftRepository(seed) {
  const drafts = new Map(Object.entries(seed));
  return {
    async list() { return [...drafts.values()].map(row => ({ ...row })); },
    async get({ draftId }) {
      const row = drafts.get(draftId);
      if (!row) throw new Error(`Unknown draft: ${draftId}`);
      return { ...row };
    },
    async save({ draftId, expectedRevision, document }) {
      const row = drafts.get(draftId);
      if (!row) throw new Error(`Unknown draft: ${draftId}`);
      if (row.revision !== expectedRevision) {
        throw new Error(
          `Draft revision conflict: expected ${expectedRevision}, current revision is ${row.revision}`
        );
      }
      const next = {
        ...row,
        document,
        revision: row.revision + 1,
        puzzleId: typeof document?.id === "string" ? document.id : row.puzzleId
      };
      drafts.set(draftId, next);
      return { ...next };
    }
  };
}

function starLayoutFor(document) {
  const { puzzle, errors } = puzzleFromAuthoredDocument(document);
  assert.equal(errors.length, 0, errors.join("; "));
  return layoutDocumentForMode("star", {
    schemaVersion: 1,
    puzzleId: puzzle.id,
    puzzleRevision: starLayoutRevision(puzzle),
    board: { width: 1000, height: 500 },
    nodes: Object.fromEntries(expectedStarLayoutNodeKeys(puzzle).map((key, index) => [
      key,
      {
        x: 40 + (index % 20) * 40,
        y: 40 + Math.floor(index / 20) * 40
      }
    ])),
    metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 }
  });
}

async function connect(server) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  clientTransport.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params = undefined) => new Promise(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    clientTransport.send({
      jsonrpc: "2.0",
      id,
      method,
      ...(params === undefined ? {} : { params })
    });
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "mcp-taxonomy-tests", version: "1.0.0" }
  });
  await clientTransport.send({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  });
  return {
    request,
    call: async (name, args = {}) => {
      const response = await request("tools/call", { name, arguments: args });
      return response.result.structuredContent;
    },
    close: () => clientTransport.close()
  };
}

export async function run() {
  const created = validateCategoryDocument({
    id: "lab-subject",
    title: "Lab Subject",
    domain: "sciences-mathematics",
    info: { text: "A lab-only subject for MCP tests." }
  }, { existing: [{ id: "science", title: "Science" }], mode: "create" });
  assert.equal(created.valid, true);
  const duplicate = validateCategoryDocument({
    id: "science",
    title: "Science",
    info: { text: "Already registered." }
  }, { existing: [{ id: "science", title: "Science" }], mode: "create" });
  assert.equal(duplicate.valid, false);

  const registry = mergeCategoryRegistry(
    { Science: { slug: "science" } },
    [{ document: { id: "lab-subject", title: "Lab Subject", info: { text: "Lab" } } }]
  );
  assert.equal(registry["Lab Subject"].slug, "lab-subject");
  assert.equal(registry.Science.slug, "science");

  const actor = { subject: "taxonomy-author" };
  const contentDocuments = createMemoryContentDocumentRepository();
  const contentService = createHostedAuthoringContentService();
  await seedPublishedCatalogues(contentDocuments, contentService.catalogues);
  await seedPublishedCategories(contentDocuments, contentService.categories);
  await contentDocuments.publish({
    kind: "category",
    id: "botany",
    document: {
      id: "botany",
      title: "Botany",
      domain: "life-sciences",
      info: { text: "The study of plants." }
    },
    actor
  });
  const gitPuzzleId = contentService.puzzles[0].id;
  const gitPuzzle = contentService.puzzles[0];
  await contentDocuments.seedPublishedIfAbsent({
    kind: "puzzle",
    id: gitPuzzleId,
    document: { ...gitPuzzle, title: "D1 primary title" }
  });
  await contentDocuments.seedPublishedIfAbsent({
    kind: "puzzle",
    id: "d1-only-board",
    document: {
      id: "d1-only-board",
      title: "D1 only",
      category: "zoology",
      clusters: [],
      bridges: []
    }
  });

  const server = createHostedMcpAuthoringServer({
    draftRepository: stubDraftRepository(),
    contentService,
    contentDocuments,
    actor
  });
  const { request, call, close } = await connect(server);

  try {
    const puzzleList = await call("list_puzzles");
    assert.deepEqual(
      new Set(puzzleList.puzzles.map(puzzle => puzzle.id)),
      new Set([gitPuzzleId, "d1-only-board"]),
      "MCP puzzle discovery must not leak Git-only puzzles"
    );
    assert.equal(
      puzzleList.puzzles.find(puzzle => puzzle.id === gitPuzzleId)?.title,
      "D1 primary title"
    );
    const loadedPuzzle = await call("get_puzzle", { puzzle_id: gitPuzzleId });
    assert.equal(loadedPuzzle.document.title, "D1 primary title");

    const resources = await request("resources/list", {});
    const puzzleResource = resources.result.resources.find(resource =>
      resource.uri === `concept-clusters://puzzles/${gitPuzzleId}`
    );
    assert.ok(puzzleResource, "published puzzle resources should enumerate D1 rows");
    const resourceRead = await request("resources/read", { uri: puzzleResource.uri });
    assert.equal(JSON.parse(resourceRead.result.contents[0].text).title, "D1 primary title");

    const gitOnlyId = contentService.puzzles.find(puzzle => puzzle.id !== gitPuzzleId).id;
    const gitOnly = await call("get_puzzle", { puzzle_id: gitOnlyId });
    assert.equal(gitOnly.error.includes("published D1 puzzle document"), true);
    assert.match(gitOnly.error, /does not fall back to Git/i);
    const gitOnlySeed = await call("create_puzzle_draft", {
      draft_id: gitOnlyId,
      puzzle_id: gitOnlyId,
      seed_from_published: true
    });
    assert.match(gitOnlySeed.error, /published D1 puzzle document/i);
    assert.match(gitOnlySeed.error, /does not fall back to Git/i);

    const createdCategory = await call("create_category", {
      id: "lab-subject",
      title: "Lab Subject",
      domain: "sciences-mathematics",
      info: { text: "A lab-only subject for MCP tests." },
      publish_to_authoring: true
    });
    assert.equal(createdCategory.valid, true);
    assert.equal(createdCategory.category.document.title, "Lab Subject");
    assert.equal(createdCategory.published.id, "lab-subject");
    assert.equal(createdCategory.published.cuedForFreezeAt, null);

    const unpublishedCategory = await call("create_category", {
      id: "draft-only-subject",
      title: "Draft Only Subject",
      domain: "sciences-mathematics",
      info: { text: "Not registered until its category document is published." }
    });
    assert.equal(unpublishedCategory.valid, true);
    assert.equal(unpublishedCategory.published, null);

    const categories = await call("list_categories");
    const botany = categories.categories.find(item => item.name === "Botany");
    assert.ok(
      botany,
      "list_categories must include a category published by the category editor before any puzzle references it"
    );
    assert.equal(botany.slug, "botany");
    assert.equal(botany.registered, true);
    assert.equal(botany.puzzleCount, 0);
    const draftOnly = categories.categories.find(item => item.name === "Draft Only Subject");
    assert.ok(draftOnly, "list_categories should expose the owner's D1 working copy");
    assert.equal(draftOnly.registered, false);
    assert.ok(
      categories.categories.some(item => item.name === "Lab Subject"),
      "list_categories should include the D1 category working copy"
    );
    const zoology = categories.categories.find(item => item.name === "zoology");
    assert.ok(zoology, "a published puzzle reference should expose an unresolved category");
    assert.equal(zoology.registered, false);
    assert.equal(zoology.slug, "zoology");
    const inferredCategory = await call("get_category", { name: "zoology" });
    assert.equal(inferredCategory.category.name, "zoology");
    assert.equal(inferredCategory.category.registered, false);
    assert.deepEqual(inferredCategory.document, {
      id: "zoology",
      title: "zoology"
    });

    const loadedCategory = await call("get_category", { name: "lab-subject" });
    assert.equal(loadedCategory.category.name, "Lab Subject");
    assert.equal(loadedCategory.document.id, "lab-subject");
    assert.equal(loadedCategory.document.title, "Lab Subject");

    const publishedCategory = await call("get_category", { name: "botany" });
    assert.equal(publishedCategory.category.name, "Botany");
    assert.equal(publishedCategory.category.registered, true);
    assert.equal(publishedCategory.document.id, "botany");
    assert.equal(publishedCategory.document.title, "Botany");

    const updatedCategory = await call("update_category", {
      ...loadedCategory.document,
      info: { text: "Published from one MCP write." },
      publish_to_authoring: true
    });
    assert.equal(updatedCategory.valid, true);
    assert.equal(updatedCategory.published.revision, 2);
    assert.equal(updatedCategory.published.cuedForFreezeAt, null);

    const createdCatalogue = await call("create_catalogue", {
      id: "mcp-taxonomy-lab",
      title: "MCP taxonomy lab",
      info: { text: "Membership for a D1-published board." },
      entries: [
        { id: gitPuzzleId, reason: "Already in git." },
        { id: "d1-only-board", reason: "Published to authoring play only." }
      ]
    });
    assert.equal(createdCatalogue.valid, true);
    assert.equal(createdCatalogue.catalogue.id, "mcp-taxonomy-lab");
    assert.equal(createdCatalogue.published, null);

    const listed = await call("list_catalogues");
    const row = listed.catalogues.find(item => item.id === "mcp-taxonomy-lab");
    assert.equal(row.source, "draft");
    assert.equal(row.entryCount, 2);

    const loaded = await call("get_catalogue", { catalogue_id: "mcp-taxonomy-lab" });
    assert.equal(loaded.source, "draft");
    assert.equal(loaded.document.entries.length, 2);
    assert.equal(loaded.document.ordered, undefined);

    const updated = await call("update_catalogue", {
      ...loaded.document,
      entries: loaded.document.entries.slice(0, 1),
      publish_to_authoring: true
    });
    assert.equal(updated.valid, true);
    assert.equal(updated.catalogue.document.entries.length, 1);
    assert.equal(updated.published.id, "mcp-taxonomy-lab");
    assert.equal(updated.published.cuedForFreezeAt, null);

    const listedWithMeta = await call("list_catalogues");
    assert.equal(
      listedWithMeta.catalogues.find(item => item.id === "anatomy-of-coercion-and-conscience").kind,
      "meta"
    );
    const loadedMeta = await call("get_catalogue", {
      catalogue_id: "anatomy-of-coercion-and-conscience"
    });
    assert.equal(loadedMeta.document.kind, "meta");
    assert.equal(loadedMeta.document.ordered, true);
    assert.ok(loadedMeta.document.relatedCatalogues);
    const updatedMeta = await call("update_meta_catalogue", {
      ...loadedMeta.document,
      title: "Anatomy of Coercion & Conscience (edited)",
      publish_to_authoring: true
    });
    assert.equal(updatedMeta.valid, true);
    assert.equal(updatedMeta.catalogue.document.kind, "meta");
    assert.equal(updatedMeta.catalogue.document.title, "Anatomy of Coercion & Conscience (edited)");
    assert.equal(updatedMeta.published.id, "anatomy-of-coercion-and-conscience");
    assert.equal(updatedMeta.published.cuedForFreezeAt, null);

    const clearedRelated = await call("update_meta_catalogue", {
      ...updatedMeta.catalogue.document,
      relatedCatalogues: null
    });
    assert.equal(clearedRelated.valid, true);
    assert.equal(clearedRelated.catalogue.document.relatedCatalogues, undefined);

    const leafAsMeta = await call("update_meta_catalogue", {
      ...loaded.document,
      kind: "meta"
    });
    assert.equal(leafAsMeta.valid, false);
    assert.ok(leafAsMeta.errors.some(error => /not a meta catalogue/.test(error)));

    const unknown = await call("create_catalogue", {
      id: "mcp-taxonomy-missing",
      title: "Missing puzzle",
      info: { text: "Should fail." },
      entries: [{ id: "no-such-puzzle-id" }]
    });
    assert.equal(unknown.valid, false);
    assert.ok(unknown.errors.some(error => /no-such-puzzle-id/.test(error)));
  } finally {
    await close();
  }

  const noD1Server = createHostedMcpAuthoringServer({
    draftRepository: stubDraftRepository(),
    contentService,
    actor: { subject: "no-d1-author" }
  });
  const noD1Session = await connect(noD1Server);
  try {
    const noD1List = await noD1Session.call("list_puzzles");
    assert.match(noD1List.error, /requires the D1 content-document repository/i);
    assert.match(noD1List.error, /not a runtime fallback|not.*fallback/i);
  } finally {
    await noD1Session.close();
    await noD1Server.close();
  }

  // save_puzzle_draft's publish_to_authoring flag promotes a confirmed final
  // edit to the same held D1 authoring snapshot as the human workflow.
  // Superseded submit_puzzle_for_publication and preview_repository_import.
  const publishFixtureId = "mcp-taxonomy-publish-fixture";
  const publishFixtureDocument = {
    ...puzzleToSimplified(gitPuzzle),
    id: publishFixtureId,
    title: "Publish fixture"
  };
  const publishFixtureLayout = starLayoutFor(publishFixtureDocument);
  const publishServer = createHostedMcpAuthoringServer({
    draftRepository: inMemoryDraftRepository({
      [publishFixtureId]: {
        document: publishFixtureDocument,
        layout: publishFixtureLayout,
        revision: 1,
        puzzleId: publishFixtureId,
        status: "draft"
      }
    }),
    contentService,
    contentDocuments,
    actor
  });
  const { call: publishCall, close: closePublish } = await connect(publishServer);
  try {
    const saved = await publishCall("save_puzzle_draft", {
      draft_id: publishFixtureId,
      expected_revision: 1,
      document: publishFixtureDocument,
      publish_to_authoring: true
    });
    assert.equal(saved.draft.revision, 2);
    assert.equal(saved.published.id, publishFixtureId);
    assert.equal(saved.published.cuedForFreezeAt, null);
    assert.equal(saved.publicationErrors, null);
    assert.deepEqual(
      (await contentDocuments.getPublished({ kind: "puzzle", id: publishFixtureId })).layout,
      publishFixtureLayout
    );

    // A document edit still saves (drafts stay permissive) but does not
    // publish when its previously confirmed layout is stale.
    const changedFixtureDocument = {
      ...publishFixtureDocument,
      clusters: publishFixtureDocument.clusters.map((cluster, index) =>
        index === 0 ? { ...cluster, name: `${cluster.name} revised` } : cluster
      )
    };
    const invalidLayoutSaved = await publishCall("save_puzzle_draft", {
      draft_id: publishFixtureId,
      expected_revision: 2,
      document: changedFixtureDocument,
      publish_to_authoring: true
    });
    assert.equal(invalidLayoutSaved.draft.revision, 3);
    assert.equal(invalidLayoutSaved.published, null);
    assert.ok(invalidLayoutSaved.publicationErrors.some(error => /reconfirmed/i.test(error)));
    assert.equal(
      (await contentDocuments.getPublished({ kind: "puzzle", id: publishFixtureId })).revision,
      1
    );

    // An invalid document still saves but does not publish either.
    const invalidDocumentSaved = await publishCall("save_puzzle_draft", {
      draft_id: publishFixtureId,
      expected_revision: 3,
      document: { ...changedFixtureDocument, clusters: [] },
      publish_to_authoring: true
    });
    assert.equal(invalidDocumentSaved.draft.revision, 4);
    assert.equal(invalidDocumentSaved.published, null);
    assert.ok(invalidDocumentSaved.publicationErrors.length > 0);

    // Without the flag, a save never touches authoring play.
    const plainSaved = await publishCall("save_puzzle_draft", {
      draft_id: publishFixtureId,
      expected_revision: 4,
      document: publishFixtureDocument
    });
    assert.equal(plainSaved.draft.revision, 5);
    assert.equal(plainSaved.published, undefined);
    assert.equal(plainSaved.publicationErrors, undefined);
  } finally {
    await closePublish();
  }
}
