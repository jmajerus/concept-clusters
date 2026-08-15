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
    assert.equal(initialized.result.serverInfo.version, "1.1.0");
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
      "get_authoring_schema",
      "create_puzzle_draft",
      "replace_puzzle_draft",
      "validate_puzzle_draft",
      "preview_import",
      "install_puzzle"
    ]) {
      assert.ok(toolNames.includes(name), `${name} should be registered`);
    }
    // JSON-LD interchange stays available through npm run content:export/
    // import/check, not through the MCP tool surface (see docs/JSON-LD.md).
    for (const name of [
      "get_puzzle_jsonld", "export_puzzle_jsonld", "export_catalogue_bundle"
    ]) {
      assert.ok(!toolNames.includes(name), `${name} should not be registered`);
    }
    const installTool = listed.result.tools.find(tool => tool.name === "install_puzzle");
    assert.equal(installTool.annotations.destructiveHint, true);
    assert.equal(
      listed.result.tools.find(tool => tool.name === "preview_import")
        .annotations.readOnlyHint,
      true
    );
    assert.match(
      listed.result.tools.find(tool => tool.name === "create_puzzle_draft")
        .description,
      /get_authoring_schema/
    );

    const resourceList = await request("resources/list", {});
    const schemaResource = resourceList.result.resources.find(resource =>
      resource.uri === "concept-clusters://schemas/simplified-puzzle-v1"
    );
    assert.ok(schemaResource, "versioned simplified schema resource should be registered");
    assert.equal(schemaResource.mimeType, "application/schema+json");

    const resourceRead = await request("resources/read", {
      uri: schemaResource.uri
    });
    const resourceSchema = JSON.parse(resourceRead.result.contents[0].text);
    assert.deepEqual(
      resourceSchema.properties.bridges.items.properties.termRole.enum,
      ["reference", "connector"]
    );
    assert.match(
      resourceSchema.properties.bridges.items.properties.termRole.description,
      /intended object of learning/
    );
    assert.match(
      resourceSchema.properties.bridges.items.properties.termRole.description,
      /prefer a verified direct resource/
    );
    assert.match(
      resourceSchema.properties.bridges.items.properties.termRole.description,
      /no automatic or authored reference links/
    );
    assert.ok(!resourceSchema.required.includes("bridges"));

    const authoringSchema = await request("tools/call", {
      name: "get_authoring_schema",
      arguments: {}
    });
    assert.equal(authoringSchema.result.structuredContent.version, "1");
    assert.equal(
      authoringSchema.result.structuredContent.resourceUri,
      schemaResource.uri
    );
    assert.deepEqual(
      authoringSchema.result.structuredContent.schema.properties.bridges.items
        .properties.termRole.enum,
      ["reference", "connector"]
    );
    assert.ok(
      !authoringSchema.result.structuredContent.schema.required.includes("bridges")
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
    assert.match(guidance.result.structuredContent.markdown, /optional termRole/);
    assert.match(guidance.result.structuredContent.markdown, /pedagogical classification/);
    assert.match(guidance.result.structuredContent.markdown, /tracheotomy/);
    assert.match(guidance.result.structuredContent.markdown, /Do not use article existence/);
    assert.match(guidance.result.structuredContent.markdown, /prefer\s+a verified direct resource/);
    assert.match(guidance.result.structuredContent.markdown, /productive exploration surface/);
    assert.match(guidance.result.structuredContent.markdown, /often should.*info\.text/);
    assert.match(guidance.result.structuredContent.markdown, /does not need or want a\s+reference link/);
    assert.match(guidance.result.structuredContent.markdown, /relationKind/);
    assert.match(guidance.result.structuredContent.markdown, /inherited, transmitted, adapted/);
    assert.match(guidance.result.structuredContent.markdown, /through is A -> X -> B/);
    assert.match(guidance.result.structuredContent.markdown, /idealTerms names the one term/);
    assert.match(guidance.result.structuredContent.markdown, /directly involved in/);
    assert.match(guidance.result.structuredContent.markdown, /wiki:Solid/);
    assert.match(guidance.result.structuredContent.markdown, /binary bridge's optional direction/);
    assert.match(guidance.result.structuredContent.markdown, /lensMode can be "quiz"/);
    assert.match(guidance.result.structuredContent.markdown, /Trivia category specifically leans/);
    assert.match(guidance.result.structuredContent.markdown, /learningIntroduction \("Before You Begin"\)/);
    assert.match(guidance.result.structuredContent.markdown, /generativeAssistance/);
    assert.match(guidance.result.structuredContent.markdown, /relatedPuzzles is an optional/);
    assert.match(guidance.result.structuredContent.markdown, /register subcategories/);

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

    // create_puzzle_draft accepts the simplified format directly and stores
    // it unchanged -- everything downstream (here, validate_puzzle_draft)
    // works from that same document.
    const simplifiedCreated = await request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "mcp-simplified-fixture",
        document: {
          id: "mcp-simplified-fixture",
          title: "MCP simplified fixture",
          category: "Science",
          clusters: [
            {
              id: "alpha",
              name: "Alpha",
              fact: "Alpha fact.",
              seeds: ["alpha one", "alpha two"],
              floatingTerms: ["alpha three"]
            },
            {
              id: "beta",
              name: "Beta",
              fact: "Beta fact.",
              seeds: ["beta one", "beta two"],
              floatingTerms: ["beta three"]
            }
          ],
          bridges: [
            {
              term: "shared idea",
              termRole: "connector",
              clusters: ["alpha", "beta"],
              fact: "Bridges alpha and beta."
            }
          ]
        }
      }
    });
    assert.equal(simplifiedCreated.result.structuredContent.normalization, undefined);
    const simplifiedDraft = await request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "mcp-simplified-fixture" }
    });
    assert.equal(
      simplifiedDraft.result.structuredContent.draft.document["@context"],
      "https://concept-clusters.org/context/v1"
    );
    assert.equal(
      simplifiedDraft.result.structuredContent.draft.document.clusters[0]["@id"],
      "#alpha"
    );
    assert.equal(
      simplifiedDraft.result.structuredContent.draft.document.bridges[0].termRole,
      "connector"
    );
    const simplifiedValid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-simplified-fixture" }
    });
    assert.equal(simplifiedValid.result.structuredContent.valid, true);

    // A broken simplified document (missing a required cluster field) is
    // stored exactly as given -- not rejected, not partially converted --
    // and validation reports a plain, field-scoped message, not JSON-LD
    // profile noise like "@context must be...".
    const brokenCreated = await request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "mcp-broken-simplified-fixture",
        document: {
          id: "mcp-broken-simplified-fixture",
          title: "Broken",
          category: "Science",
          clusters: [
            { id: "alpha", name: "Alpha", seeds: ["a", "b"], floatingTerms: ["c"] },
            { id: "beta", name: "Beta", fact: "f", seeds: ["d", "e"], floatingTerms: ["f"] }
          ],
          bridges: []
        }
      }
    });
    assert.equal(brokenCreated.result.structuredContent.normalization.applied, false);
    assert.ok(brokenCreated.result.structuredContent.normalization.errors.some(e => e.includes("fact")));
    const brokenDraft = await request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "mcp-broken-simplified-fixture" }
    });
    assert.equal(brokenDraft.result.structuredContent.draft.document["@context"], undefined);
    const brokenValid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-broken-simplified-fixture" }
    });
    assert.equal(brokenValid.result.structuredContent.valid, false);
    assert.ok(brokenValid.result.structuredContent.errors.some(e => e.includes("fact")));
    assert.ok(!brokenValid.result.structuredContent.errors.some(e => e.includes("@context")));

    await verifyStdioEntrypoint();
  } finally {
    await clientTransport.close();
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
}
