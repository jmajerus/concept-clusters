import { createExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";
import worker from "../../src/authoring-worker";
import {
  definePuzzle,
  resolvePuzzleResourceUrl
} from "../../modules/puzzleManifest.js";

async function rpc(body: object) {
  const request = new Request("http://localhost:8788/mcp", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/event-stream",
      "Content-Type": "application/json",
      "Host": "localhost:8788",
      "MCP-Protocol-Version": LATEST_PROTOCOL_VERSION
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
    expect(initialization.result.serverInfo.version).toBe("1.3.0");

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
    expect(names).toContain("get_category");
    expect(names).not.toContain("compare_draft_revisions");
    expect(names).toContain("get_authoring_guidance");
    expect(names).toContain("get_authoring_schema");
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
      .toMatch(/often should.*info\.text/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/does not need or want a\s+reference link/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/do not give it link, extraLink, seeAlso, or citations/);
    expect(guidance.result.structuredContent.markdown).toMatch(/relationKind/);
    expect(guidance.result.structuredContent.markdown).toMatch(/inherited, transmitted, adapted/);
    expect(guidance.result.structuredContent.markdown).toMatch(/through is A -> X -> B/);
    expect(guidance.result.structuredContent.markdown).toMatch(/idealTerms names the one term/);
    expect(guidance.result.structuredContent.markdown).toMatch(/directly involved in/);
    expect(guidance.result.structuredContent.markdown).toMatch(/wiki:Solid/);
    expect(guidance.result.structuredContent.markdown).toMatch(/binary bridge's optional direction/);
    expect(guidance.result.structuredContent.markdown).toMatch(/lensMode can be "quiz"/);
    expect(guidance.result.structuredContent.markdown).toMatch(/Trivia category specifically leans/);
    expect(guidance.result.structuredContent.markdown).toMatch(/learningIntroduction \("Before You Begin"\)/);
    expect(guidance.result.structuredContent.markdown).toMatch(/generativeAssistance/);
    expect(guidance.result.structuredContent.markdown).toMatch(/relatedPuzzles is an optional/);
    expect(guidance.result.structuredContent.markdown).toMatch(/register subcategories/);

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

  it("doesn't show a misleading bundle-freshness badge when a submitted draft's puzzle_id is null", async () => {
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

    const listResponse = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts"),
      env,
      createExecutionContext()
    );
    const listBody = await listResponse.text();
    expect(listBody).toContain("Null Puzzle Id Fixture");
  });
});
