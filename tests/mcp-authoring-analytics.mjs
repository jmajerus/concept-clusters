import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { DraftNotFoundError } from "../modules/draftRepository.js";

export const name = "MCP authoring analytics: one tracked data point per tool call";

function fakeDependencies() {
  return {
    draftRepository: {
      async get() { throw new DraftNotFoundError("missing-draft"); }
    },
    contentService: {
      puzzles: [],
      listPuzzles: () => [{ id: "energy-flow" }]
    },
    publicationService: {}
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
    clientInfo: { name: "concept-clusters-analytics-tests", version: "1.0.0" }
  });
  await clientTransport.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  return { request, close: () => clientTransport.close() };
}

export async function run() {
  const dataPoints = [];
  const analytics = { writeDataPoint: dp => dataPoints.push(dp) };
  const server = createHostedMcpAuthoringServer({
    ...fakeDependencies(),
    actor: { subject: "test-author" },
    analytics
  });
  const { request, close } = await connect(server);

  try {
    const listed = await request("tools/call", {
      name: "list_puzzles",
      arguments: {}
    });
    assert.equal(listed.result.isError, undefined);
    assert.equal(dataPoints.length, 1);
    const [first] = dataPoints;
    assert.deepEqual(first.blobs, ["mcp_tool_call", "list_puzzles"]);
    assert.deepEqual(first.doubles, [1]);
    assert.deepEqual(first.indexes, ["list_puzzles"]);

    // A failing call is still a call -- this counts endpoint usage, not
    // success, so it must be recorded exactly the same as the one above.
    const failed = await request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "missing-draft" }
    });
    assert.equal(failed.result.isError, true);
    assert.equal(dataPoints.length, 2);
    const [, second] = dataPoints;
    assert.deepEqual(second.blobs, ["mcp_tool_call", "get_puzzle_draft"]);
    assert.deepEqual(second.indexes, ["get_puzzle_draft"]);
  } finally {
    await close();
    await server.close();
  }

  // No analytics binding (e.g. local dev without one configured) must
  // never break a tool call -- it's a silent no-op, not an error path.
  const bare = createHostedMcpAuthoringServer({
    ...fakeDependencies(),
    actor: { subject: "test-author" }
  });
  const bareClient = await connect(bare);
  try {
    const listed = await bareClient.request("tools/call", {
      name: "list_puzzles",
      arguments: {}
    });
    assert.equal(listed.result.isError, undefined);
  } finally {
    await bareClient.close();
    await bare.close();
  }
}
