import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";

export const name = "MCP authoring: tools, drafts, validation, and approval-gated preview";

async function verifyStdioEntrypoint() {
  const child = spawn(process.execPath, ["tools/mcp-server.mjs"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"]
  });
  let stdout = "";
  let stderr = "";
  child.stderr.on("data", chunk => { stderr += chunk; });
  const response = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("stdio MCP response timed out")), 5000);
    child.stdout.on("data", chunk => {
      stdout += chunk;
      const line = stdout.split("\n").find(candidate => candidate.trim());
      if (!line) return;
      clearTimeout(timeout);
      try {
        resolve(JSON.parse(line));
      } catch (error) {
        reject(new Error(`stdout contained non-protocol data: ${line} (${error.message})`));
      }
    });
  });
  child.stdin.write(`${JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "stdio-test", version: "1.0.0" }
    }
  })}\n`);
  try {
    const message = await response;
    assert.equal(message.result.serverInfo.name, "concept-clusters-authoring");
    assert.match(stderr, /ready on stdio/i);
  } finally {
    child.kill("SIGINT");
    await once(child, "exit");
  }
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "concept-clusters-mcp-"));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const content = createContentInterchangeService();
  const server = createConceptClustersMcpServer({
    contentService: content,
    draftDirectory: directory
  });
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

  try {
    await server.connect(serverTransport);
    await clientTransport.start();
    const initialized = await request("initialize", {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "concept-clusters-tests", version: "1.0.0" }
    });
    assert.equal(initialized.result.serverInfo.name, "concept-clusters-authoring");
    await clientTransport.send({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    });

    const listed = await request("tools/list", {});
    const toolNames = listed.result.tools.map(tool => tool.name);
    for (const name of [
      "list_puzzles",
      "list_categories",
      "get_category",
      "get_authoring_guidance",
      "get_puzzle_jsonld",
      "create_puzzle_draft",
      "replace_puzzle_draft",
      "validate_puzzle_draft",
      "export_puzzle_jsonld",
      "preview_import",
      "install_puzzle",
      "export_catalogue_bundle"
    ]) {
      assert.ok(toolNames.includes(name), `${name} should be registered`);
    }
    const installTool = listed.result.tools.find(tool => tool.name === "install_puzzle");
    assert.equal(installTool.annotations.destructiveHint, true);
    assert.equal(
      listed.result.tools.find(tool => tool.name === "preview_import")
        .annotations.readOnlyHint,
      true
    );

    // A draft that passes validate_puzzle_draft can still be a bad puzzle --
    // the guidance has to carry the design judgment (not just schema facts)
    // for that to mean anything to an authoring AI with no other way to
    // read docs/AUTHORING.md.
    const guidance = await request("tools/call", {
      name: "get_authoring_guidance",
      arguments: {}
    });
    assert.match(guidance.result.structuredContent.markdown, /No trap words/);
    assert.match(guidance.result.structuredContent.markdown, /Seed pairs are the orienting clue/);
    assert.match(guidance.result.structuredContent.markdown, /wrong link is worse/);

    const puzzleList = await request("tools/call", {
      name: "list_puzzles",
      arguments: { category: "Art" }
    });
    assert.equal(puzzleList.result.structuredContent.puzzles.length, 4);

    const categoryList = await request("tools/call", {
      name: "list_categories",
      arguments: {}
    });
    assert.ok(
      categoryList.result.structuredContent.categories.some(category =>
        category.name === "Art" && category.puzzleCount === 4
      )
    );
    const category = await request("tools/call", {
      name: "get_category",
      arguments: { name: "Art" }
    });
    assert.equal(category.result.structuredContent.category.registered, true);
    assert.equal(category.result.structuredContent.category.name, "Art");

    const created = await request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "mcp-service-fixture",
        puzzle_id: "mcp-service-fixture",
        title: "MCP service fixture",
        category: "Science"
      }
    });
    assert.equal(created.result.structuredContent.draft.revision, 1);

    const invalid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-service-fixture" }
    });
    assert.equal(invalid.result.structuredContent.valid, false);

    const energy = await content.getPuzzleJsonLd("energy-flow");
    const replacement = {
      ...energy,
      "@id": "urn:concept-clusters:puzzle:mcp-service-fixture",
      id: "mcp-service-fixture",
      title: "MCP service fixture"
    };
    const replaced = await request("tools/call", {
      name: "replace_puzzle_draft",
      arguments: {
        draft_id: "mcp-service-fixture",
        expected_revision: 1,
        document: replacement
      }
    });
    assert.equal(replaced.result.structuredContent.draft.revision, 2);

    const valid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-service-fixture" }
    });
    assert.equal(valid.result.structuredContent.valid, true);

    const preview = await request("tools/call", {
      name: "preview_import",
      arguments: { draft_id: "mcp-service-fixture" }
    });
    assert.equal(preview.result.structuredContent.action, "create");
    assert.match(preview.result.structuredContent.approvalToken, /^sha256:/);
    assert.ok(
      preview.result.structuredContent.affectedPaths.includes(
        "puzzles/science/mcp-service-fixture.js"
      )
    );

    const unsafeInstall = await request("tools/call", {
      name: "install_puzzle",
      arguments: {
        draft_id: "mcp-service-fixture",
        expected_revision: 2,
        preview_token: preview.result.structuredContent.approvalToken
      }
    });
    assert.ok(
      unsafeInstall.error || unsafeInstall.result?.isError,
      "confirm=true must be required by the schema"
    );

    const catalogue = await request("tools/call", {
      name: "export_catalogue_bundle",
      arguments: { catalogue_id: "getting-started" }
    });
    assert.equal(
      catalogue.result.structuredContent.document["@type"],
      "CatalogueBundle"
    );
    await verifyStdioEntrypoint();
  } finally {
    await clientTransport.close();
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
}
