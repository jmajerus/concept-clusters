import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";

export const name = "MCP authoring: local and hosted shared contract parity";

const LOCAL_EXTENSIONS = new Set([
  "preview_import",
  "install_puzzle"
]);

async function inspect(server, clientName) {
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
  try {
    await request("initialize", {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: clientName, version: "1.0.0" }
    });
    await clientTransport.send({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    });
    const tools = await request("tools/list", {});
    const resources = await request("resources/list", {});
    const call = async (name, args = {}) => {
      const response = await request("tools/call", {
        name,
        arguments: args
      });
      return response.result.structuredContent;
    };
    return {
      tools: tools.result.tools,
      resources: resources.result.resources,
      samples: {
        puzzles: await call("list_puzzles"),
        categories: await call("list_categories"),
        catalogues: await call("list_catalogues"),
        coreGuidance: await call("get_authoring_guidance", { phase: "core" }),
        coreSchema: await call("get_authoring_schema", { phase: "core" }),
        reviewWorkflow: await call("get_workflow_guidance", {
          topic: "pull-request-review"
        })
      }
    };
  } finally {
    await clientTransport.close();
    await server.close();
  }
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-contract-"));
  try {
    const local = await inspect(createConceptClustersMcpServer({
      draftDirectory: directory
    }), "local-contract-test");
    const hosted = await inspect(createHostedMcpAuthoringServer({
      draftRepository: {},
      contentService: createHostedAuthoringContentService(),
      publicationService: {},
      actor: { subject: "hosted-contract-test" }
    }), "hosted-contract-test");

    const localShared = local.tools
      .filter(tool => !LOCAL_EXTENSIONS.has(tool.name))
      .sort((left, right) => left.name.localeCompare(right.name));
    const hostedShared = [...hosted.tools]
      .sort((left, right) => left.name.localeCompare(right.name));
    assert.deepEqual(localShared, hostedShared);

    assert.deepEqual(
      local.resources.map(resource => resource.uri).sort(),
      hosted.resources.map(resource => resource.uri).sort()
    );
    assert.deepEqual(local.samples, hosted.samples);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
