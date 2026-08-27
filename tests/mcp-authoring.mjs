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
import { createRepositoryPublicationService } from "../modules/repositoryPublicationService.js";
import { puzzleToSimplified } from "../modules/puzzleSimplified.js";
import { createPuzzleDraftStore } from "../modules/puzzleDraftStore.js";
import { AUTHORING_MCP_SERVER_VERSION } from "../modules/authoringSchemaResource.js";

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
  const publisher = createRepositoryPublicationService({ contentService: content });
  // Plan against the real checkout so preview tokens stay honest; do not
  // apply those writes -- this suite must not leave a fixture puzzle in
  // puzzles/index.js. install_puzzle still has to mark the draft installed
  // after apply succeeds, which is the local parallel of hosted `submitted`.
  const publicationService = {
    planPuzzleFromModel: (...args) => publisher.planPuzzleFromModel(...args),
    planPuzzleImport: (...args) => publisher.planPuzzleImport(...args),
    async applyPuzzleImport(plan, { approvalToken } = {}) {
      if (!approvalToken || approvalToken !== plan.approvalToken) {
        throw new Error(
          "Publication approval token does not match the current preview"
        );
      }
      return {
        installed: true,
        action: plan.action,
        puzzleId: plan.puzzle.id,
        affectedPaths: [...plan.affectedPaths]
      };
    }
  };
  const server = createConceptClustersMcpServer({
    contentService: content,
    draftDirectory: directory,
    publicationService
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
    assert.equal(initialized.result.serverInfo.version, AUTHORING_MCP_SERVER_VERSION);
    await clientTransport.send({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    });

    const listed = await request("tools/list", {});
    const toolNames = listed.result.tools.map(tool => tool.name);
    for (const name of [
      "list_puzzles",
      "list_categories",
      "probe_mcp_client",
      "get_category",
      "get_authoring_guidance",
      "get_authoring_schema",
      "get_workflow_guidance",
      "create_puzzle_draft",
      "save_puzzle_draft",
      "replace_puzzle_draft",
      "delete_puzzle_draft",
      "validate_puzzle_draft",
      "preview_import",
      "install_puzzle",
      "preview_repository_import",
      "submit_puzzle_for_publication",
      "get_publication_status",
      "get_review_feedback",
      "apply_review_suggestion",
      "reply_to_review_comment",
      "resolve_review_feedback",
      "sync_review_changes_to_draft",
      "prepare_human_review_handoff",
      "complete_review_round",
      "reset_review_circuit",
      "get_puzzle",
      "get_catalogue",
      "preview_catalogue_creation",
      "create_catalogue",
      "preview_update_catalogue",
      "update_catalogue"
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
      /no automatic or authored reference links or citations/
    );
    assert.match(
      resourceSchema.properties.large.description,
      /do not drop a distinct term to stay on the standard board/
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
    assert.equal(authoringSchema.result.structuredContent.phase, undefined);

    const phasedSchemas = {};
    for (const phase of ["core", "review", "pedagogy", "publication"]) {
      const response = await request("tools/call", {
        name: "get_authoring_schema",
        arguments: { phase }
      });
      phasedSchemas[phase] = response.result.structuredContent;
      assert.equal(phasedSchemas[phase].phase, phase);
      assert.equal(phasedSchemas[phase].complete, false);
      assert.equal(phasedSchemas[phase].preserveExisting, true);
      assert.match(phasedSchemas[phase].schema.description, /not a standalone puzzle schema/);
    }
    const coreBridgeProperties = phasedSchemas.core.schema.properties.bridges
      .items.properties;
    assert.ok(coreBridgeProperties.termRole);
    assert.equal(coreBridgeProperties.relationKind, undefined);
    assert.equal(phasedSchemas.core.schema.properties.lenses, undefined);
    assert.deepEqual(
      Object.keys(phasedSchemas.core.schema.properties.info.anyOf[1]
        .properties.citations.items.properties),
      ["title", "author", "publisher", "year", "pages", "url"]
    );
    const clusterInfoObject = phasedSchemas.core.schema.properties.clusters.items
      .properties.info.anyOf[1];
    assert.equal(clusterInfoObject.properties.citations, undefined);
    assert.equal(clusterInfoObject.properties.link, undefined);
    assert.equal(clusterInfoObject.properties.extraLink, undefined);
    assert.equal(clusterInfoObject.properties.seeAlso, undefined);
    assert.ok(clusterInfoObject.properties.links);
    assert.ok(phasedSchemas.core.schema.properties.info.anyOf[1].properties.links);
    assert.equal(phasedSchemas.core.schema.properties.info.anyOf[1].properties.link, undefined);
    assert.equal(
      phasedSchemas.pedagogy.schema.properties.learningIntroduction.properties.sources,
      undefined
    );
    assert.ok(phasedSchemas.pedagogy.schema.properties.learningIntroduction.properties.links);
    assert.match(
      phasedSchemas.pedagogy.schema.properties.learningIntroduction.properties.content
        .properties.text.description,
      /real line breaks/
    );
    assert.match(
      phasedSchemas.pedagogy.schema.properties.learningIntroduction.properties
        .credit.description,
      /must not write this field/
    );
    assert.ok(phasedSchemas.core.schema.properties.large);
    assert.ok(phasedSchemas.review.schema.properties.large);
    assert.ok(phasedSchemas.review.schema.properties.bridges.items.properties.relationKind);
    assert.ok(phasedSchemas.review.schema.properties.bridges.items.properties.direction);
    assert.ok(phasedSchemas.review.schema.properties.bridges.items.properties.idealTerms);
    assert.ok(phasedSchemas.pedagogy.schema.properties.lenses);
    assert.ok(phasedSchemas.pedagogy.schema.properties.learningIntroduction);
    assert.ok(phasedSchemas.publication.schema.properties.generativeAssistance);
    assert.ok(phasedSchemas.publication.schema.properties.provenance);
    assert.ok(phasedSchemas.publication.schema.properties.relatedPuzzles);

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
    assert.match(guidance.result.structuredContent.markdown, /appropriate level of granularity/);
    assert.match(guidance.result.structuredContent.markdown, /automatic Wikipedia search is not inferred/);
    assert.match(guidance.result.structuredContent.markdown, /information surfaces stable/);
    assert.match(guidance.result.structuredContent.markdown, /often should.*info\.text/);
    assert.match(guidance.result.structuredContent.markdown, /does not need or want a\s+reference link/);
    assert.match(guidance.result.structuredContent.markdown, /do not give it links, link, extraLink, seeAlso, or citations/);
    assert.match(guidance.result.structuredContent.markdown, /relationKind/);
    assert.match(guidance.result.structuredContent.markdown, /inherited, transmitted, adapted/);
    assert.match(guidance.result.structuredContent.markdown, /through is A -> X -> B/);
    assert.match(guidance.result.structuredContent.markdown, /idealTerms names the canonical endpoint/);
    assert.match(guidance.result.structuredContent.markdown, /directly involved in/);
    assert.match(guidance.result.structuredContent.markdown, /one, two, or three/);
    assert.match(guidance.result.structuredContent.markdown, /not a size to fill/);
    assert.match(guidance.result.structuredContent.markdown, /not a higher grade of lens/);
    assert.match(guidance.result.structuredContent.markdown, /Dutch tilt/);
    assert.match(guidance.result.structuredContent.markdown, /dolly zoom/);
    assert.match(guidance.result.structuredContent.markdown, /geometrically\s+wrong/);
    assert.match(guidance.result.structuredContent.markdown, /wiki:Solid/);
    assert.match(guidance.result.structuredContent.markdown, /binary bridge's optional direction/);
    assert.match(guidance.result.structuredContent.markdown, /lensMode can be "quiz"/);
    assert.match(guidance.result.structuredContent.markdown, /Trivia category specifically leans/);
    assert.match(guidance.result.structuredContent.markdown, /learningIntroduction \("Before You Begin"\)/);
    assert.match(guidance.result.structuredContent.markdown, /real\s+line breaks/);
    assert.match(guidance.result.structuredContent.markdown, /two-character sequence/);
    assert.match(guidance.result.structuredContent.markdown, /learningIntroduction\.credit/);
    assert.match(guidance.result.structuredContent.markdown, /generativeAssistance/);
    assert.match(guidance.result.structuredContent.markdown, /provenance is optional and agent-cheap/);
    assert.match(guidance.result.structuredContent.markdown, /relatedPuzzles is an optional/);
    assert.match(guidance.result.structuredContent.markdown, /register subcategories/);
    assert.match(guidance.result.structuredContent.markdown, /Do not call submit_puzzle_for_publication unless they\s+ask you to/);
    assert.match(guidance.result.structuredContent.markdown, /admin\/drafts/);
    assert.match(guidance.result.structuredContent.markdown, /intended reason to set `large`/);
    assert.match(guidance.result.structuredContent.markdown, /do not hunt for the weakest term to drop/);

    const coreGuidance = await request("tools/call", {
      name: "get_authoring_guidance",
      arguments: { phase: "core" }
    });
    assert.equal(coreGuidance.result.structuredContent.phase, "core");
    assert.equal(coreGuidance.result.structuredContent.preserveExisting, true);
    assert.match(coreGuidance.result.structuredContent.markdown, /one accumulating/);
    assert.match(coreGuidance.result.structuredContent.markdown, /exact citation shape/);
    assert.match(coreGuidance.result.structuredContent.markdown, /do not plan to rediscover/);
    assert.match(coreGuidance.result.structuredContent.markdown, /termRole independently/);
    assert.match(coreGuidance.result.structuredContent.markdown, /appropriate level of granularity/);
    assert.match(coreGuidance.result.structuredContent.markdown, /automatic Wikipedia search is not inferred/);
    assert.match(coreGuidance.result.structuredContent.markdown, /set `large: true` rather than withholding a genuine/);
    const reviewGuidance = await request("tools/call", {
      name: "get_authoring_guidance",
      arguments: { phase: "review" }
    });
    assert.match(reviewGuidance.result.structuredContent.markdown, /conceptId only when/);
    assert.match(reviewGuidance.result.structuredContent.markdown, /grain of the surface/);
    assert.match(reviewGuidance.result.structuredContent.markdown, /intended 17-24 response/);
    assert.match(reviewGuidance.result.structuredContent.markdown, /Do not drop a distinct\s+term to stay on the standard board/);
    assert.match(reviewGuidance.result.structuredContent.markdown, /silently replace text/);
    const pedagogyGuidance = await request("tools/call", {
      name: "get_authoring_guidance",
      arguments: { phase: "pedagogy" }
    });
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /do not have to be authored together/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /preserve those lenses/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /one,\s+two, or three honest answers/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /not a size to fill/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /Dutch tilt/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /dolly zoom/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /geometrically\s+wrong/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /real\s+line breaks/);
    assert.match(pedagogyGuidance.result.structuredContent.markdown, /learningIntroduction\.credit/);
    const reviewWorkflow = await request("tools/call", {
      name: "get_workflow_guidance",
      arguments: { topic: "pull-request-review" }
    });
    assert.equal(
      reviewWorkflow.result.structuredContent.topic,
      "pull-request-review"
    );
    assert.match(
      reviewWorkflow.result.structuredContent.markdown,
      /bounded autonomous loop/
    );
    assert.match(
      reviewWorkflow.result.structuredContent.markdown,
      /prepare_human_review_handoff/
    );
    const completePayloadSize = JSON.stringify(
      authoringSchema.result.structuredContent.schema
    ).length + guidance.result.structuredContent.markdown.length;
    const corePayloadSize = JSON.stringify(phasedSchemas.core.schema).length +
      coreGuidance.result.structuredContent.markdown.length;
    assert.ok(corePayloadSize < completePayloadSize / 2);

    const puzzleList = await request("tools/call", {
      name: "list_puzzles",
      arguments: { category: "Art" }
    });
    assert.ok(puzzleList.result.structuredContent.puzzles.length > 0);
    assert.ok(puzzleList.result.structuredContent.puzzles.every(puzzle =>
      puzzle.category === "Art" || puzzle.categories?.includes("Art")
    ));

    const category = await request("tools/call", {
      name: "get_category",
      arguments: { name: "Art" }
    });
    assert.equal(category.result.structuredContent.category.registered, true);
    assert.equal(category.result.structuredContent.category.name, "Art");

    const probe = await request("tools/call", {
      name: "probe_mcp_client",
      arguments: { label: "concept-clusters-tests" }
    });
    assert.equal(probe.result.structuredContent.probe.label, "concept-clusters-tests");
    assert.equal(probe.result.structuredContent.probe.transport, "stdio");
    assert.equal(probe.result.structuredContent.probe.clientVersion.name,
      "concept-clusters-tests");
    assert.equal(probe.result.structuredContent.probe.mcpReq.method, "tools/call");

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
    assert.equal(created.result.structuredContent.draft.status, "draft");

    const invalid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-service-fixture" }
    });
    assert.equal(invalid.result.structuredContent.valid, false);
    // flags stays a consistently-shaped (empty) array even on this
    // failed-before-conversion path, rather than an absent key.
    assert.deepEqual(invalid.result.structuredContent.flags, []);

    const energy = content.state.puzzles.find(puzzle => puzzle.id === "energy-flow");
    const replacement = {
      ...puzzleToSimplified(energy),
      id: "mcp-service-fixture",
      title: "MCP service fixture"
    };
    const replaced = await request("tools/call", {
      name: "save_puzzle_draft",
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
    // flags are non-blocking symmetry signals, additive to pass/fail --
    // see modules/puzzleSymmetryFlags.js. Only their presence/shape is
    // asserted here; puzzle-symmetry-flags.mjs covers the actual logic.
    assert.ok(Array.isArray(valid.result.structuredContent.flags));

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

    const installed = await request("tools/call", {
      name: "install_puzzle",
      arguments: {
        draft_id: "mcp-service-fixture",
        expected_revision: 2,
        preview_token: preview.result.structuredContent.approvalToken,
        confirm: true
      }
    });
    assert.equal(installed.result.isError, undefined);
    assert.equal(installed.result.structuredContent.installed, true);
    const afterInstall = await request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "mcp-service-fixture" }
    });
    assert.equal(afterInstall.result.structuredContent.draft.status, "installed");
    assert.equal(afterInstall.result.structuredContent.draft.revision, 2);
    assert.ok(afterInstall.result.structuredContent.draft.installedAt);

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
      undefined
    );
    assert.equal(
      simplifiedDraft.result.structuredContent.draft.document.clusters[0].id,
      "alpha"
    );
    assert.equal(
      simplifiedDraft.result.structuredContent.draft.document.bridges[0].termRole,
      "connector"
    );

    // Leftover link fields already in storage fold on get; the stored
    // record is not rewritten until the next save.
    const leftoverStore = createPuzzleDraftStore({ directory });
    await leftoverStore.createDraft({
      draftId: "mcp-legacy-links-fixture",
      document: {
        id: "mcp-legacy-links-fixture",
        title: "Legacy links",
        category: "Science",
        info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
        clusters: [
          { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
          { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
        ],
        bridges: [],
        learningIntroduction: {
          requirement: "optional",
          content: { text: "Body." },
          sources: [{ label: "Handout", href: "https://example.org/handout" }]
        }
      }
    });
    const leftoverLoaded = await request("tools/call", {
      name: "get_puzzle_draft",
      arguments: { draft_id: "mcp-legacy-links-fixture" }
    });
    const leftoverDocument = leftoverLoaded.result.structuredContent.draft.document;
    assert.deepEqual(leftoverDocument.info.links, [
      { href: "wiki:Ethos" },
      { href: "wiki:Pathos" }
    ]);
    assert.equal(leftoverDocument.info.link, undefined);
    assert.equal(leftoverDocument.info.extraLink, undefined);
    assert.deepEqual(leftoverDocument.learningIntroduction.links, [
      { href: "https://example.org/handout", label: "Handout" }
    ]);
    assert.equal(leftoverDocument.learningIntroduction.sources, undefined);
    const leftoverStored = await leftoverStore.getDraft("mcp-legacy-links-fixture");
    assert.equal(leftoverStored.document.info.link, "wiki:Ethos");
    assert.equal(leftoverStored.document.info.extraLink, "wiki:Pathos");
    assert.equal(leftoverStored.revision, leftoverLoaded.result.structuredContent.draft.revision);
    const leftoverValid = await request("tools/call", {
      name: "validate_puzzle_draft",
      arguments: { draft_id: "mcp-legacy-links-fixture" }
    });
    assert.equal(leftoverValid.result.structuredContent.valid, true);
    assert.ok(
      leftoverValid.result.structuredContent.flags.some(flag => flag.id === "save-to-canonicalize")
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

    const deleted = await request("tools/call", {
      name: "delete_puzzle_draft",
      arguments: { draft_id: "mcp-broken-simplified-fixture" }
    });
    assert.equal(deleted.result.structuredContent.deleted, true);

    await verifyStdioEntrypoint();
  } finally {
    await clientTransport.close();
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
}
