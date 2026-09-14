import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";

export const name = "MCP authoring domains: focused reads and scoped saves";

async function sessionFor(server) {
  const [client, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  client.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params = undefined) => new Promise(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    client.send({
      jsonrpc: "2.0",
      id,
      method,
      ...(params === undefined ? {} : { params })
    });
  });
  await server.connect(serverTransport);
  await client.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "domain-test", version: "1.0.0" }
  });
  await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  return {
    request,
    async close() {
      await client.close();
      await server.close();
    }
  };
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-domains-"));
  const server = createConceptClustersMcpServer({
    contentService: createContentInterchangeService(),
    draftDirectory: directory
  });
  const session = await sessionFor(server);
  try {
    const created = await session.request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "domain-mcp",
        document: {
          id: "domain-mcp",
          title: "Domain MCP",
          category: "Science",
          clusters: [
            { id: "alpha", name: "Alpha", fact: "Alpha", seeds: ["a", "b"], floatingTerms: ["c"] },
            { id: "beta", name: "Beta", fact: "Beta", seeds: ["d", "e"], floatingTerms: ["f"] }
          ],
          bridges: [{
            id: "shared",
            term: "Shared",
            clusters: ["alpha", "beta"],
            fact: "Shared fact",
            relationKind: "contrast"
          }],
          lenses: [{ id: "lens", prompt: "Prompt", explanation: "Explanation" }],
          provenance: { contributors: ["Jane Doe"] }
        }
      }
    });
    assert.equal(created.result.isError, undefined);

    const contentRead = await session.request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "domain-mcp", domain: "content" }
    });
    const contentDraft = contentRead.result.structuredContent.draft;
    assert.deepEqual(
      Object.keys(contentDraft).sort(),
      ["document", "domain", "draftId", "revision"]
    );
    assert.equal(contentDraft.domain, "content");
    assert.equal(contentDraft.document.provenance, undefined);
    assert.equal(contentDraft.document.lenses, undefined);
    assert.equal(contentDraft.document.bridges[0].relationKind, undefined);

    const pedagogyRead = await session.request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "domain-mcp", domain: "pedagogy" }
    });
    const pedagogyDraft = pedagogyRead.result.structuredContent.draft;
    assert.deepEqual(
      Object.keys(pedagogyDraft).sort(),
      ["context", "document", "domain", "draftId", "revision"]
    );
    assert.equal(pedagogyDraft.document.provenance, undefined);
    assert.equal(pedagogyDraft.document.bridges[0].relationKind, "contrast");
    assert.equal(pedagogyDraft.context.clusters[0].name, "Alpha");
    assert.equal(pedagogyDraft.context.provenance, undefined);

    const contentSave = await session.request("tools/call", {
      name: "save_puzzle_draft",
      arguments: {
        draft_id: "domain-mcp",
        expected_revision: contentDraft.revision,
        domain: "content",
        document: { ...contentDraft.document, title: "Content-edited MCP" }
      }
    });
    assert.equal(contentSave.result.isError, undefined);
    const contentSaved = contentSave.result.structuredContent.draft;
    assert.equal(contentSaved.document.title, "Content-edited MCP");

    const pedagogySave = await session.request("tools/call", {
      name: "save_puzzle_draft",
      arguments: {
        draft_id: "domain-mcp",
        expected_revision: contentSaved.revision,
        domain: "pedagogy",
        document: {
          ...pedagogyDraft.document,
          bridges: [{ ...pedagogyDraft.document.bridges[0], relationKind: "continuity" }]
        }
      }
    });
    assert.equal(pedagogySave.result.isError, undefined);

    const completeRead = await session.request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "domain-mcp" }
    });
    const complete = completeRead.result.structuredContent.draft.document;
    assert.equal(complete.title, "Content-edited MCP");
    assert.equal(complete.bridges[0].fact, "Shared fact");
    assert.equal(complete.bridges[0].relationKind, "continuity");
    assert.equal(complete.provenance.collaboration, "human");

    const rejected = await session.request("tools/call", {
      name: "save_puzzle_draft",
      arguments: {
        draft_id: "domain-mcp",
        expected_revision: pedagogySave.result.structuredContent.draft.revision,
        domain: "pedagogy",
        document: { ...pedagogyDraft.document, clusters: [] }
      }
    });
    assert.equal(rejected.result.isError, true);
    assert.match(rejected.result.content[0].text, /belongs to the content domain/);
  } finally {
    await session.close();
    await rm(directory, { recursive: true, force: true });
  }
}
