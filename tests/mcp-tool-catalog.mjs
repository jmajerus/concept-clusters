import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import {
  MCP_TOOL_CATALOG_TOOL,
  catalogIdFromDescription,
  toolCatalogDescription,
  toolCatalogId,
  toolCatalogReport
} from "../modules/mcpToolCatalog.js";

export const name = "MCP tool catalog: a live call reports a stale tool list";

const SAMPLE = [
  {
    name: "list_puzzles",
    title: "List puzzles",
    description: "List the corpus.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true }
  },
  {
    name: MCP_TOOL_CATALOG_TOOL,
    title: "Get tool catalog",
    description: toolCatalogDescription("fnv1a64:ignored"),
    inputSchema: { type: "object", properties: { catalogId: { type: "string" } } },
    annotations: { readOnlyHint: true }
  }
];

async function listedCatalog(server) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  clientTransport.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params) => new Promise(resolve => {
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
  try {
    await request("initialize", {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "catalog-test", version: "1.0.0" }
    });
    await clientTransport.send({ jsonrpc: "2.0", method: "notifications/initialized" });
    const listed = await request("tools/list", {});
    const tool = listed.result.tools.find(entry => entry.name === MCP_TOOL_CATALOG_TOOL);
    const catalogId = catalogIdFromDescription(tool.description);
    const current = await request("tools/call", {
      name: MCP_TOOL_CATALOG_TOOL,
      arguments: { catalogId }
    });
    const stale = await request("tools/call", {
      name: MCP_TOOL_CATALOG_TOOL,
      arguments: { catalogId: "fnv1a64:0000000000000000" }
    });
    return {
      tools: listed.result.tools,
      catalogId,
      current: current.result.structuredContent,
      currentText: current.result.content[0].text,
      stale: stale.result.structuredContent,
      staleText: stale.result.content[0].text
    };
  } finally {
    await clientTransport.close();
    await server.close();
  }
}

export async function run() {
  const unchanged = toolCatalogId(SAMPLE);
  assert.equal(toolCatalogId(SAMPLE.map(tool => (
    tool.name === MCP_TOOL_CATALOG_TOOL
      ? { ...tool, description: toolCatalogDescription("fnv1a64:other") }
      : tool
  ))), unchanged);
  assert.notEqual(toolCatalogId(SAMPLE.map(tool => (
    tool.name === "list_puzzles"
      ? { ...tool, description: "List the corpus. Now with a new sentence." }
      : tool
  ))), unchanged);

  const mismatch = toolCatalogReport("fnv1a64:old", "fnv1a64:new");
  assert.equal(mismatch.output.interfaceCurrent, false);
  assert.match(mismatch.summary, /older tool list/);
  assert.match(mismatch.summary, /refresh the connector tool list/);
  const match = toolCatalogReport("fnv1a64:new", "fnv1a64:new");
  assert.equal(match.output.interfaceCurrent, true);

  const server = createHostedMcpAuthoringServer({
    draftRepository: {},
    contentService: {},
    actor: { subject: "catalog-test" },
    contentDocumentsConfigured: false
  });
  const listed = await listedCatalog(server);
  assert.equal(listed.catalogId, toolCatalogId(listed.tools));
  assert.equal(listed.current.interfaceCurrent, true);
  assert.equal(listed.current.catalogId, listed.catalogId);
  assert.match(listed.currentText, /matches the server/);
  assert.equal(listed.stale.interfaceCurrent, false);
  assert.equal(listed.stale.catalogId, listed.catalogId);
  assert.match(listed.staleText, /start a new chat/);
}
