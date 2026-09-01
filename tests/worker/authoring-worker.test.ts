import { createExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";
import worker from "../../src/authoring-worker";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import {
  definePuzzle,
  resolvePuzzleResourceUrl
} from "../../modules/puzzleManifest.js";
import { AUTHORING_MCP_SERVER_VERSION } from "../../modules/authoringSchemaResource.js";

async function rpc(body: object, extraHeaders: Record<string, string> = {}) {
  const request = new Request("http://localhost:8788/mcp", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/event-stream",
      "Content-Type": "application/json",
      "Host": "localhost:8788",
      "MCP-Protocol-Version": LATEST_PROTOCOL_VERSION,
      ...extraHeaders
    },
    body: JSON.stringify(body)
  });
  return worker.fetch(request, env, createExecutionContext());
}

async function rpcJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (response.headers.get("content-type")?.includes("application/json")) {
    return JSON.parse(text);
  }
  const data = text.split("\n")
    .find(line => line.startsWith("data: "))
    ?.slice(6);
  if (!data) throw new Error(`MCP response contained no JSON data: ${text}`);
  return JSON.parse(data);
}

describe("hosted authoring Worker", () => {
  it("normalizes production-style module identifiers", () => {
    const puzzle = definePuzzle("puzzles/example/example.js", {
      id: "example"
    });
    expect(resolvePuzzleResourceUrl(puzzle, "./example.intro.md").href)
      .toBe("https://worker.invalid/puzzles/example/example.intro.md");
  });

  it("rejects direct unauthenticated non-local requests", async () => {
    const response = await worker.fetch(
      new Request("https://concept-clusters-authoring.jmajerus.workers.dev/mcp", {
        method: "POST",
        body: "{}"
      }),
      env,
      createExecutionContext()
    );
    expect(response.status).toBe(401);

    const unexpectedHost = await worker.fetch(
      new Request("https://unrelated-worker.workers.dev/mcp", {
        method: "POST",
        body: "{}"
      }),
      env,
      createExecutionContext()
    );
    expect(unexpectedHost.status).toBe(421);
  });

  it("serves stateless MCP tools locally with the explicit dev identity", async () => {
    const initialized = await rpc({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "worker-test", version: "1.0.0" }
      }
    });
    expect(initialized.status).toBe(200);
    const initialization = await rpcJson(initialized) as {
      result: { serverInfo: { name: string; version: string } };
    };
    expect(initialization.result.serverInfo.name)
      .toBe("concept-clusters-hosted-authoring");
    expect(initialization.result.serverInfo.version).toBe(AUTHORING_MCP_SERVER_VERSION);

    const listed = await rpc({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    });
    expect(listed.status).toBe(200);
    const listing = await rpcJson(listed) as {
      result: {
        tools: Array<{
          name: string;
          description?: string;
          annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
        }>;
      };
    };
    const names = listing.result.tools.map(tool => tool.name);
    expect(names).toContain("create_puzzle_draft");
    expect(names).toContain("delete_puzzle_draft");
    expect(names).toContain("list_categories");
    expect(names).toContain("probe_mcp_client");
    expect(names).toContain("get_category");
    expect(names).not.toContain("compare_draft_revisions");
    expect(names).toContain("get_authoring_guidance");
    expect(names).toContain("get_authoring_schema");
    expect(names).toContain("get_workflow_guidance");
    expect(names).toContain("preview_repository_import");
    expect(names).toContain("submit_puzzle_for_publication");
    expect(names).toContain("get_publication_status");
    expect(names).toContain("get_review_feedback");
    expect(names).toContain("apply_review_suggestion");
    expect(names).toContain("reply_to_review_comment");
    expect(names).toContain("resolve_review_feedback");
    expect(names).toContain("sync_review_changes_to_draft");
    expect(names).toContain("prepare_human_review_handoff");
    expect(names).toContain("complete_review_round");
    expect(names).toContain("reset_review_circuit");
    expect(names).toContain("list_catalogues");
    expect(names).toContain("preview_catalogue_creation");
    expect(names).toContain("create_catalogue");
    expect(names).toContain("preview_update_catalogue");
    expect(names).toContain("update_catalogue");
    expect(names).not.toContain("publish_directly_to_main");
    expect(listing.result.tools.find(tool => tool.name === "list_puzzle_drafts")
      ?.annotations?.readOnlyHint).toBe(true);
    expect(listing.result.tools.find(tool => tool.name === "validate_puzzle_draft")
      ?.annotations?.readOnlyHint).toBe(false);
    expect(listing.result.tools.find(tool => tool.name === "delete_puzzle_draft")
      ?.annotations?.destructiveHint).toBe(true);
    expect(listing.result.tools.find(tool => tool.name === "create_puzzle_draft")
      ?.description).toMatch(/get_authoring_schema/);

    const probeResponse = await rpc({
      jsonrpc: "2.0",
      id: 23,
      method: "tools/call",
      params: {
        name: "probe_mcp_client",
        arguments: { label: "worker-test" }
      }
    }, { "User-Agent": "concept-clusters-worker-test/1.0" });
    expect(probeResponse.status).toBe(200);
    const probePayload = await rpcJson(probeResponse) as {
      result: {
        structuredContent: {
          probe: {
            transport: string;
            label: string;
            mcpReq: {
              method: string | null;
              envelope: Record<string, unknown> | null;
              meta: Record<string, unknown> | null;
            };
            http: { "user-agent"?: string } | null;
          };
        };
      };
    };
    const probe = probePayload.result.structuredContent.probe;
    expect(probe.transport).toBe("hosted");
    expect(probe.label).toBe("worker-test");
    // track/safe must forward ServerContext so hosted HTTP probes see the
    // Request and JSON-RPC method. Without that, http and mcpReq stay null.
    expect(probe.mcpReq.method).toBe("tools/call");
    expect(probe.http?.["user-agent"]).toBe("concept-clusters-worker-test/1.0");

    const resourceListResponse = await rpc({
      jsonrpc: "2.0",
      id: 21,
      method: "resources/list",
      params: {}
    });
    const resourceList = await rpcJson(resourceListResponse) as {
      result: { resources: Array<{ uri: string; mimeType?: string }> };
    };
    const schemaResource = resourceList.result.resources.find(resource =>
      resource.uri === "concept-clusters://schemas/simplified-puzzle-v1"
    );
    expect(schemaResource).toBeDefined();
    expect(schemaResource?.mimeType).toBe("application/schema+json");

    const resourceReadResponse = await rpc({
      jsonrpc: "2.0",
      id: 22,
      method: "resources/read",
      params: { uri: schemaResource?.uri }
    });
    const resourceRead = await rpcJson(resourceReadResponse) as {
      result: { contents: Array<{ text: string }> };
    };
    const resourceSchema = JSON.parse(resourceRead.result.contents[0].text);
    expect(resourceSchema.properties.bridges.items.properties.termRole.enum)
      .toEqual(["reference", "connector"]);
    expect(resourceSchema.properties.bridges.items.properties.termRole.description)
      .toMatch(/intended object of learning/);
    expect(resourceSchema.properties.bridges.items.properties.termRole.description)
      .toMatch(/prefer a verified direct resource/);
    expect(resourceSchema.properties.bridges.items.properties.termRole.description)
      .toMatch(/no automatic or authored reference links or citations/);
    expect(resourceSchema.properties.large.description)
      .toMatch(/Derived from node count on save/);
    expect(resourceSchema.properties.large.description)
      .toMatch(/exceed 16/);
    expect(resourceSchema.properties.large.description)
      .toMatch(/do not drop a distinct term to stay on the standard board/);
    expect(resourceSchema.required).not.toContain("bridges");

    const authoringSchemaResponse = await rpc({
      jsonrpc: "2.0",
      id: 23,
      method: "tools/call",
      params: { name: "get_authoring_schema", arguments: {} }
    });
    const authoringSchema = await rpcJson(authoringSchemaResponse) as {
      result: {
        structuredContent: {
          version: string;
          resourceUri: string;
          schema: {
            required: string[];
            properties: {
              bridges: { items: { properties: { termRole: { enum: string[] } } } };
            };
          };
        };
      };
    };
    expect(authoringSchema.result.structuredContent.version).toBe("1");
    expect(authoringSchema.result.structuredContent.resourceUri)
      .toBe(schemaResource?.uri);
    expect(authoringSchema.result.structuredContent.schema.properties.bridges
      .items.properties.termRole.enum).toEqual(["reference", "connector"]);
    expect(authoringSchema.result.structuredContent.schema.required)
      .not.toContain("bridges");

    type PhaseSchemaContent = {
      phase: string;
      complete: boolean;
      preserveExisting: boolean;
      schema: {
        description: string;
        properties: Record<string, {
          items?: { properties: Record<string, unknown> };
        }>;
      };
    };
    const phaseSchemas: Record<string, PhaseSchemaContent> = {};
    for (const phase of ["core", "review", "pedagogy", "publication"]) {
      const response = await rpc({
        jsonrpc: "2.0",
        id: `schema-${phase}`,
        method: "tools/call",
        params: { name: "get_authoring_schema", arguments: { phase } }
      });
      const body = await rpcJson(response) as {
        result: { structuredContent: PhaseSchemaContent };
      };
      phaseSchemas[phase] = body.result.structuredContent;
      expect(phaseSchemas[phase].phase).toBe(phase);
      expect(phaseSchemas[phase].preserveExisting).toBe(true);
      expect(phaseSchemas[phase].schema.description)
        .toMatch(/not a standalone puzzle schema/);
    }
    expect(phaseSchemas.core.schema.properties.bridges.items?.properties.termRole)
      .toBeDefined();
    expect(phaseSchemas.core.schema.properties.bridges.items?.properties.relationKind)
      .toBeUndefined();
    expect(phaseSchemas.core.schema.properties.large).toBeUndefined();
    expect(phaseSchemas.review.schema.properties.large).toBeUndefined();
    expect(phaseSchemas.review.schema.properties.bridges.items?.properties.relationKind)
      .toBeDefined();
    expect(phaseSchemas.pedagogy.schema.properties.lenses).toBeDefined();
    expect(phaseSchemas.publication.schema.properties.generativeAssistance).toBeDefined();

    const created = await rpc({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "worker-mcp-fixture",
          puzzle_id: "worker-mcp-fixture",
          title: "Worker MCP fixture",
          category: "Science"
        }
      }
    });
    const creation = await rpcJson(created) as {
      result: { structuredContent: { draft: { contentHash: string } } };
    };
    expect(creation.result.structuredContent.draft.contentHash).toMatch(/^sha256:/);

    const validated = await rpc({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "validate_puzzle_draft",
        arguments: { draft_id: "worker-mcp-fixture" }
      }
    });
    const validation = await rpcJson(validated) as {
      result: { structuredContent: { valid: boolean; errors: string[] } };
    };
    expect(validation.result.structuredContent.valid).toBe(false);
    expect(validation.result.structuredContent.errors.length).toBeGreaterThan(0);

    // A draft that passes validate_puzzle_draft can still be a bad puzzle --
    // this is the only guidance channel a hosted client has at all (no
    // filesystem/Git tool is exposed), so it has to carry real design
    // judgment, not just schema mechanics.
    const guided = await rpc({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "get_authoring_guidance", arguments: {} }
    });
    const guidance = await rpcJson(guided) as {
      result: { structuredContent: { markdown: string } };
    };
    expect(guidance.result.structuredContent.markdown).toMatch(/No trap words/);
    expect(guidance.result.structuredContent.markdown).toMatch(/Seed pairs are the orienting clue/);
    expect(guidance.result.structuredContent.markdown).toMatch(/wrong link is worse/);
    expect(guidance.result.structuredContent.markdown).toMatch(/optional termRole/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/pedagogical classification/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/tracheotomy/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/Do not use article existence/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/prefer\s+a verified direct resource/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/appropriate level of granularity/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/automatic Wikipedia search is not inferred/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/information surfaces stable/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/often should.*info\.text/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/does not need or want a\s+reference link/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/do not give it links, link, extraLink, seeAlso, or citations/);
    expect(guidance.result.structuredContent.markdown).toMatch(/relationKind/);
    expect(guidance.result.structuredContent.markdown).toMatch(/inherited, transmitted, adapted/);
    expect(guidance.result.structuredContent.markdown).toMatch(/through is A -> X -> B/);
    expect(guidance.result.structuredContent.markdown).toMatch(/idealTerms names the canonical endpoint/);
    expect(guidance.result.structuredContent.markdown).toMatch(/directly involved in/);
    expect(guidance.result.structuredContent.markdown).toMatch(/one, two, or three/);
    expect(guidance.result.structuredContent.markdown).toMatch(/not a size to fill/);
    expect(guidance.result.structuredContent.markdown).toMatch(/not a higher grade of lens/);
    expect(guidance.result.structuredContent.markdown).toMatch(/Dutch tilt/);
    expect(guidance.result.structuredContent.markdown).toMatch(/dolly zoom/);
    expect(guidance.result.structuredContent.markdown).toMatch(/geometrically\s+wrong/);
    expect(guidance.result.structuredContent.markdown).toMatch(/wiki:Solid/);
    expect(guidance.result.structuredContent.markdown).toMatch(/binary bridge's optional direction/);
    expect(guidance.result.structuredContent.markdown).toMatch(/lensMode can be "quiz"/);
    expect(guidance.result.structuredContent.markdown).toMatch(/Trivia category specifically leans/);
    expect(guidance.result.structuredContent.markdown).toMatch(/learningIntroduction \("Before You Begin"\)/);
    expect(guidance.result.structuredContent.markdown).toMatch(/real\s+line breaks/);
    expect(guidance.result.structuredContent.markdown).toMatch(/two-character sequence/);
    expect(guidance.result.structuredContent.markdown).toMatch(/learningIntroduction\.credit/);
    expect(guidance.result.structuredContent.markdown).toMatch(/generativeAssistance/);
    expect(guidance.result.structuredContent.markdown).toMatch(/relatedPuzzles is an optional/);
    expect(guidance.result.structuredContent.markdown).toMatch(/register subcategories/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/Do not call\s+submit_puzzle_for_publication unless they\s+ask you to/);
    expect(guidance.result.structuredContent.markdown).toMatch(/admin\/drafts/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/do not hunt for the weakest term to drop/);

    const coreGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-core",
      method: "tools/call",
      params: { name: "get_authoring_guidance", arguments: { phase: "core" } }
    });
    const coreGuidance = await rpcJson(coreGuided) as {
      result: {
        structuredContent: {
          phase: string;
          preserveExisting: boolean;
          markdown: string;
        };
      };
    };
    expect(coreGuidance.result.structuredContent.phase).toBe("core");
    expect(coreGuidance.result.structuredContent.preserveExisting).toBe(true);
    expect(coreGuidance.result.structuredContent.markdown).toMatch(/one accumulating/);
    expect(coreGuidance.result.structuredContent.markdown).toMatch(/exact citation shape/);
    expect(coreGuidance.result.structuredContent.markdown)
      .toMatch(/do not plan to rediscover/);
    expect(coreGuidance.result.structuredContent.markdown)
      .toMatch(/Carry approved inventory connections/);
    const reviewGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-review",
      method: "tools/call",
      params: { name: "get_authoring_guidance", arguments: { phase: "review" } }
    });
    const reviewGuidance = await rpcJson(reviewGuided) as {
      result: { structuredContent: { markdown: string } };
    };
    expect(reviewGuidance.result.structuredContent.markdown)
      .toMatch(/Canvas size is derived/);
    expect(reviewGuidance.result.structuredContent.markdown)
      .toMatch(/Do not drop a distinct\s+term to stay on\s+the standard board/);
    expect(reviewGuidance.result.structuredContent.markdown)
      .toMatch(/silently replace text/);
    const pedagogyGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-pedagogy",
      method: "tools/call",
      params: { name: "get_authoring_guidance", arguments: { phase: "pedagogy" } }
    });
    const pedagogyGuidance = await rpcJson(pedagogyGuided) as {
      result: { structuredContent: { markdown: string } };
    };
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/one,\s+two, or three honest answers/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/not a size to fill/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/Dutch tilt/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/dolly zoom/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/real\s+line breaks/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/learningIntroduction\.credit/);
    const completePayloadSize = JSON.stringify(
      authoringSchema.result.structuredContent.schema
    ).length + guidance.result.structuredContent.markdown.length;
    const corePayloadSize = JSON.stringify(phaseSchemas.core.schema).length +
      coreGuidance.result.structuredContent.markdown.length;
    expect(corePayloadSize).toBeLessThan(completePayloadSize / 2);

    // create_puzzle_draft accepts the simplified format (no @context) and
    // stores that document unchanged -- validate_puzzle_draft sees the same
    // simplified shape.
    const simplifiedCreated = await rpc({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "worker-simplified-fixture",
          document: {
            id: "worker-simplified-fixture",
            title: "Worker simplified fixture",
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
      }
    });
    const simplifiedCreation = await rpcJson(simplifiedCreated) as {
      result: { structuredContent: { normalization?: unknown } };
    };
    expect(simplifiedCreation.result.structuredContent.normalization).toBeUndefined();

    const simplifiedValidated = await rpc({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "validate_puzzle_draft",
        arguments: { draft_id: "worker-simplified-fixture" }
      }
    });
    const simplifiedValidation = await rpcJson(simplifiedValidated) as {
      result: { structuredContent: { valid: boolean; errors: string[]; flags: unknown[] } };
    };
    expect(simplifiedValidation.result.structuredContent.valid).toBe(true);
    // flags are non-blocking symmetry signals, additive to pass/fail --
    // see modules/puzzleSymmetryFlags.js.
    expect(Array.isArray(simplifiedValidation.result.structuredContent.flags)).toBe(true);

    // A broken simplified document (missing a required cluster field) is
    // stored exactly as given -- not rejected -- and validation reports a
    // plain, field-scoped message, not JSON-LD profile noise.
    const brokenCreated = await rpc({
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "worker-broken-simplified-fixture",
          document: {
            id: "worker-broken-simplified-fixture",
            title: "Broken",
            category: "Science",
            clusters: [
              { id: "alpha", name: "Alpha", seeds: ["a", "b"], floatingTerms: ["c"] },
              { id: "beta", name: "Beta", fact: "f", seeds: ["d", "e"], floatingTerms: ["f"] }
            ],
            bridges: []
          }
        }
      }
    });
    const brokenCreation = await rpcJson(brokenCreated) as {
      result: { structuredContent: { normalization: { applied: boolean; errors: string[] } } };
    };
    expect(brokenCreation.result.structuredContent.normalization.applied).toBe(false);
    expect(brokenCreation.result.structuredContent.normalization.errors.some(e => e.includes("fact")))
      .toBe(true);

    const brokenValidated = await rpc({
      jsonrpc: "2.0",
      id: 9,
      method: "tools/call",
      params: {
        name: "validate_puzzle_draft",
        arguments: { draft_id: "worker-broken-simplified-fixture" }
      }
    });
    const brokenValidation = await rpcJson(brokenValidated) as {
      result: { structuredContent: { valid: boolean; errors: string[]; flags: unknown[] } };
    };
    expect(brokenValidation.result.structuredContent.valid).toBe(false);
    expect(brokenValidation.result.structuredContent.errors.some(e => e.includes("fact"))).toBe(true);
    expect(brokenValidation.result.structuredContent.errors.some(e => e.includes("@context"))).toBe(false);
    // flags stays a consistently-shaped (empty) array even on this
    // failed-before-conversion path, rather than an absent key.
    expect(brokenValidation.result.structuredContent.flags).toEqual([]);
  });

  it("serves a read-only admin draft review page", async () => {
    const created = await rpc({
      jsonrpc: "2.0",
      id: 30,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "admin-review-fixture",
          document: {
            id: "admin-review-fixture",
            title: "Admin Review Fixture",
            category: "Science",
            clusters: [
              { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
              { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
            ],
            bridges: [
              { term: "link", clusters: ["alpha", "beta"], fact: "Bridges alpha and beta." }
            ]
          }
        }
      }
    });
    expect(created.status).toBe(200);

    const listResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts"),
      env,
      createExecutionContext()
    );
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.text();
    expect(listBody).toContain("Admin Review Fixture");
    expect(listBody).toContain("admin-review-fixture");
    expect(listBody).not.toContain("Open existing puzzle");
    expect(listBody).not.toContain("New puzzle");
    expect(listBody).toContain("<h1>Puzzles</h1>");
    expect(listBody).toContain("Working copies");
    expect(listBody).toContain("Recent");
    expect(listBody).toContain("energy-flow");
    expect(listBody).toContain('href="/admin/drafts/energy-flow"');

    const detailResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture"),
      env,
      createExecutionContext()
    );
    expect(detailResponse.status).toBe(200);
    const detailBody = await detailResponse.text();
    expect(detailBody).toContain("Alpha fact.");
    expect(detailBody).toContain("Beta fact.");
    expect(detailBody).toContain("Bridges alpha and beta.");
    expect(detailBody).toContain("Alpha ↔ Beta");
    expect(detailBody).toContain("Actions");
    expect(detailBody).toContain('value="publish"');
    expect(detailBody).not.toContain('value="unpublish"');
    expect(detailBody).not.toContain('value="revert-published"');
    expect(detailBody).toContain('value="delete-draft"');
    expect(detailBody).toContain("<copy-field>");
    expect(detailBody).toContain("save-field");
    expect(detailBody).not.toContain("Use published wording");
    expect(detailBody).not.toContain("Export to player");
    expect(detailBody).not.toContain("Open a pull request");
    expect(detailBody).not.toContain("Install in this checkout");
    expect(detailBody).not.toContain("Uninstall leftover checkout files");
    expect(detailBody).not.toContain('class="play-button"');
    expect(detailBody).not.toContain('href="/?draft=');

    const csrf = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://evil.example"
        },
        body: "confirm=open-pull-request"
      }),
      env,
      createExecutionContext()
    );
    expect(csrf.status).toBe(403);

    const csrfList = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://evil.example"
        },
        body: "confirm=open-existing-draft&id=energy-flow"
      }),
      env,
      createExecutionContext()
    );
    expect(csrfList.status).toBe(403);

    const openedExisting = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=open-existing-draft&id=energy-flow"
      }),
      env,
      createExecutionContext()
    );
    expect(openedExisting.status).toBe(303);
    expect(openedExisting.headers.get("Location")).toBe("/admin/drafts/energy-flow");

    const openedPage = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/energy-flow"),
      env,
      createExecutionContext()
    );
    expect(openedPage.status).toBe(200);
    expect(await openedPage.text()).toContain("energy-flow");

    const missingConfirm = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "foo=bar"
      }),
      env,
      createExecutionContext()
    );
    expect(missingConfirm.status).toBe(400);

    const hostedInstall = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=install-checkout"
      }),
      env,
      createExecutionContext()
    );
    expect(hostedInstall.status).toBe(400);
    expect(await hostedInstall.text()).toContain("no git checkout");

    const hostedInstallAndPlay = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=install-and-play"
      }),
      env,
      createExecutionContext()
    );
    expect(hostedInstallAndPlay.status).toBe(400);
    expect(await hostedInstallAndPlay.text()).toContain("Missing submit confirmation");

    const hostedPlayJson = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture/play.json"),
      env,
      createExecutionContext()
    );
    expect(hostedPlayJson.status).toBe(404);

    const hostedDocumentJson = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture/document.json"),
      env,
      createExecutionContext()
    );
    expect(hostedDocumentJson.status).toBe(404);

    const hostedUninstall = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=uninstall-checkout"
      }),
      env,
      createExecutionContext()
    );
    expect(hostedUninstall.status).toBe(400);
    expect(await hostedUninstall.text()).toContain("no git checkout");

    const published = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=publish"
      }),
      env,
      createExecutionContext()
    );
    expect(published.status).toBe(200);
    expect(await published.text()).toContain("Published");

    const unpublished = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=unpublish"
      }),
      env,
      createExecutionContext()
    );
    expect(unpublished.status).toBe(200);
    expect(await unpublished.text()).toContain("Withdrew admin-review-fixture");

    const deleted = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=delete-draft"
      }),
      env,
      createExecutionContext()
    );
    expect(deleted.status).toBe(200);
    expect(await deleted.text()).toContain("Working copy deleted");

    const missingResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/does-not-exist"),
      env,
      createExecutionContext()
    );
    expect(missingResponse.status).toBe(404);

    const unauthResponse = await worker.fetch(
      new Request("https://concept-clusters-authoring.jmajerus.workers.dev/admin/drafts"),
      env,
      createExecutionContext()
    );
    expect(unauthResponse.status).toBe(401);
  });

  it("serves an authoring admin index of drafts, catalogues, and categories", async () => {
    const index = await worker.fetch(
      new Request("http://localhost:8788/admin"),
      env,
      createExecutionContext()
    );
    expect(index.status).toBe(200);
    const body = await index.text();
    expect(body).toContain("Puzzles");
    expect(body).toContain("/admin/catalogues");
    expect(body).toContain("/admin/categories");
    expect(body).toContain("Freeze");
    expect(body).toContain("freeze-count");
    expect(body).toContain("GitHub production");
    expect(body).not.toContain('value="refresh-github-production"');
    expect(body).not.toContain("Yes, freeze");
    expect(body).not.toContain("freeze-dialog");

    const slash = await worker.fetch(
      new Request("http://localhost:8788/admin/"),
      env,
      createExecutionContext()
    );
    expect(slash.status).toBe(302);
    expect(slash.headers.get("Location")).toBe("/admin");

    const unauthIndex = await worker.fetch(
      new Request("https://concept-clusters-authoring.jmajerus.workers.dev/admin"),
      env,
      createExecutionContext()
    );
    expect(unauthIndex.status).toBe(401);
  });

  it("serves D1 catalogue and category admin lists and publishes a working copy", async () => {
    const catalogues = await worker.fetch(
      new Request("http://localhost:8788/admin/catalogues"),
      env,
      createExecutionContext()
    );
    expect(catalogues.status).toBe(200);
    const catalogueBody = await catalogues.text();
    expect(catalogueBody).toContain("getting-started");
    expect(catalogueBody).toContain("holding-it-together");
    expect(catalogueBody).toContain("published in D1");

    const categories = await worker.fetch(
      new Request("http://localhost:8788/admin/categories"),
      env,
      createExecutionContext()
    );
    expect(categories.status).toBe(200);
    expect(await categories.text()).toContain("science");

    const created = await worker.fetch(
      new Request("http://localhost:8788/admin/catalogues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:8788"
        },
        body: JSON.stringify({
          confirm: "create-catalogue",
          id: "worker-catalogue-fixture",
          title: "Worker catalogue fixture"
        })
      }),
      env,
      createExecutionContext()
    );
    expect(created.status).toBe(201);
    const createdPayload = await created.json() as { catalogueId: string };
    expect(createdPayload.catalogueId).toBe("worker-catalogue-fixture");

    const published = await worker.fetch(
      new Request("http://localhost:8788/admin/catalogues/worker-catalogue-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:8788"
        },
        body: JSON.stringify({ confirm: "publish" })
      }),
      env,
      createExecutionContext()
    );
    expect(published.status).toBe(200);
    const publishedPayload = await published.json() as {
      revision: number;
      document: { id: string };
    };
    expect(publishedPayload.revision).toBe(1);
    expect(publishedPayload.document.id).toBe("worker-catalogue-fixture");

    const freezeList = await worker.fetch(
      new Request("http://localhost:8788/admin/catalogues"),
      env,
      createExecutionContext()
    );
    expect(freezeList.status).toBe(200);
    const freezeBody = await freezeList.text();
    expect(freezeBody).toContain("worker-catalogue-fixture");
    expect(freezeBody).toContain("new on next freeze");

    const unpublished = await worker.fetch(
      new Request("http://localhost:8788/admin/catalogues/worker-catalogue-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:8788"
        },
        body: JSON.stringify({ confirm: "unpublish" })
      }),
      env,
      createExecutionContext()
    );
    expect(unpublished.status).toBe(200);
    expect(await unpublished.text()).toContain("Withdrew worker-catalogue-fixture");
  });

  it("saves a copy field from the admin draft page", async () => {
    const created = await rpc({
      jsonrpc: "2.0",
      id: 32,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "admin-copy-edit-fixture",
          document: {
            id: "admin-copy-edit-fixture",
            title: "Admin Copy Edit Fixture",
            category: "Science",
            clusters: [
              { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
              { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
            ],
            bridges: []
          }
        }
      }
    });
    expect(created.status).toBe(200);

    const saved = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: new URLSearchParams({
          confirm: "save-field",
          expected_revision: "1",
          section: "puzzle",
          field: "title",
          value: "Edited hosted title"
        }).toString()
      }),
      env,
      createExecutionContext()
    );
    expect(saved.status).toBe(303);
    expect(saved.headers.get("Location")).toBe("/admin/drafts/admin-copy-edit-fixture");

    const after = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture"),
      env,
      createExecutionContext()
    );
    expect(after.status).toBe(200);
    expect(await after.text()).toContain("Edited hosted title");

    const unknown = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: new URLSearchParams({
          confirm: "save-field",
          expected_revision: "2",
          section: "puzzle",
          field: "<img src=x onerror=alert(1)>",
          value: "nope"
        }).toString()
      }),
      env,
      createExecutionContext()
    );
    expect(unknown.status).toBe(400);
    const unknownBody = await unknown.text();
    expect(unknownBody).toContain("Unknown field");
    expect(unknownBody).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(unknownBody).not.toMatch(/<img\s/i);

    const conflict = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: new URLSearchParams({
          confirm: "save-field",
          expected_revision: "1",
          section: "puzzle",
          field: "title",
          value: "Stale title"
        }).toString()
      }),
      env,
      createExecutionContext()
    );
    expect(conflict.status).toBe(409);
  });

  it("canonicalizes leftover link fields when get_puzzle_draft loads a stored draft", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    await repository.create({
      draftId: "legacy-links-mcp-fixture",
      actor: { subject: "local-author" },
      document: {
        id: "legacy-links-mcp-fixture",
        title: "Legacy links",
        category: "Science",
        info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" },
        clusters: [
          { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
          { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
        ],
        bridges: []
      }
    });

    const loaded = await rpc({
      jsonrpc: "2.0",
      id: 40,
      method: "tools/call",
      params: {
        name: "get_puzzle_draft",
        arguments: { draft_id: "legacy-links-mcp-fixture" }
      }
    });
    expect(loaded.status).toBe(200);
    const payload = await rpcJson(loaded) as {
      result: {
        structuredContent: {
          draft: {
            revision: number;
            document: {
              info?: {
                links?: Array<{ href: string }>;
                link?: string;
                extraLink?: string;
              };
            };
          };
        };
      };
    };
    expect(payload.result.structuredContent.draft.document.info).toEqual({
      text: "Note.",
      links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
    });

    const stored = await repository.get({
      draftId: "legacy-links-mcp-fixture",
      actor: { subject: "local-author" }
    });
    expect(stored.document.info.link).toBe("wiki:Ethos");
    expect(stored.document.info.extraLink).toBe("wiki:Pathos");
    expect(stored.revision).toBe(payload.result.structuredContent.draft.revision);

    const validated = await rpc({
      jsonrpc: "2.0",
      id: 41,
      method: "tools/call",
      params: {
        name: "validate_puzzle_draft",
        arguments: { draft_id: "legacy-links-mcp-fixture" }
      }
    });
    expect(validated.status).toBe(200);
    const validation = await rpcJson(validated) as {
      result: { structuredContent: { valid: boolean; flags: Array<{ id: string }> } };
    };
    expect(validation.result.structuredContent.valid).toBe(true);
    expect(validation.result.structuredContent.flags.some(flag => flag.id === "save-to-canonicalize"))
      .toBe(true);

    const page = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/legacy-links-mcp-fixture"),
      env,
      createExecutionContext()
    );
    expect(page.status).toBe(200);
    const pageBody = await page.text();
    expect(pageBody).toContain("Save it to persist the current schema");
    expect(pageBody).toContain("Save canonical form");
  });

  it("doesn't show Worker-bundle or submitted badges when a submitted draft's puzzle_id is null", async () => {
    // d1DraftRepository.js recomputes puzzle_id from the current document
    // on every save, independent of status -- a draft can stay submitted
    // and later have puzzle_id go back to null if a subsequent save
    // carries a document without a valid string `id`.
    // Simulated directly against D1 (not through a real publish + bad
    // edit) since reproducing that sequence through the real flow would
    // need a fake GitHub PR merge just to set status.
    const created = await rpc({
      jsonrpc: "2.0",
      id: 31,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "null-puzzle-id-fixture",
          document: {
            id: "null-puzzle-id-fixture",
            title: "Null Puzzle Id Fixture",
            category: "Science",
            clusters: [
              { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
              { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
            ],
            bridges: []
          }
        }
      }
    });
    expect(created.status).toBe(200);
    await env.AUTHORING_DB.prepare(
      "UPDATE puzzle_drafts SET status = 'submitted', puzzle_id = NULL WHERE id = ?"
    ).bind("null-puzzle-id-fixture").run();

    const detailResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/null-puzzle-id-fixture"),
      env,
      createExecutionContext()
    );
    expect(detailResponse.status).toBe(200);
    const detailBody = await detailResponse.text();
    expect(detailBody).not.toContain("live in this Worker");
    expect(detailBody).not.toContain("not yet visible in this Worker");
    expect(detailBody).not.toContain(">submitted<");

    const listResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts"),
      env,
      createExecutionContext()
    );
    const listBody = await listResponse.text();
    expect(listBody).toContain("Null Puzzle Id Fixture");
  });
});
