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

export const name = "MCP authoring: D1 categories and catalogues without GitHub";

function stubDraftRepository() {
  return {
    async list() { return []; },
    async get() { throw new Error("unused"); }
  };
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
      category: "Science",
      clusters: [],
      bridges: []
    }
  });

  const publicationCalls = [];
  const server = createHostedMcpAuthoringServer({
    draftRepository: stubDraftRepository(),
    contentService,
    contentDocuments,
    publicationService: {
      async createCatalogue(document) {
        publicationCalls.push(["createCatalogue", document.id]);
        throw new Error("MCP catalogue writes must not open a GitHub pull request");
      },
      async updateCatalogue(document) {
        publicationCalls.push(["updateCatalogue", document.id]);
        throw new Error("MCP catalogue writes must not open a GitHub pull request");
      }
    },
    actor
  });
  const { call, close } = await connect(server);

  try {
    const puzzleList = await call("list_puzzles");
    assert.equal(
      puzzleList.puzzles.find(puzzle => puzzle.id === gitPuzzleId)?.title,
      "D1 primary title"
    );
    const loadedPuzzle = await call("get_puzzle", { puzzle_id: gitPuzzleId });
    assert.equal(loadedPuzzle.document.title, "D1 primary title");

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

    const categories = await call("list_categories");
    assert.ok(
      categories.categories.some(item => item.name === "Lab Subject"),
      "list_categories should include the D1 category working copy"
    );

    const loadedCategory = await call("get_category", { name: "lab-subject" });
    assert.equal(loadedCategory.category.name, "Lab Subject");
    assert.equal(loadedCategory.document.id, "lab-subject");
    assert.equal(loadedCategory.document.title, "Lab Subject");

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
    assert.deepEqual(publicationCalls, []);

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
    assert.deepEqual(publicationCalls, []);

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
    assert.deepEqual(publicationCalls, []);

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
}
