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
      result: {
        serverInfo: { name: string; version: string };
        instructions?: string;
      };
    };
    expect(initialization.result.serverInfo.name)
      .toBe("concept-clusters-hosted-authoring");
    expect(initialization.result.serverInfo.version).toBe(AUTHORING_MCP_SERVER_VERSION);
    expect(initialization.result.instructions).toMatch(/one integrated cycle/);

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
    // The whole per-puzzle GitHub-PR path (submit/preview and the
    // review-comment loop built on it) was retired once D1 Publish + Cue +
    // Freeze fully covered a single puzzle draft's path to production too.
    expect(names).not.toContain("preview_repository_import");
    expect(names).not.toContain("submit_puzzle_for_publication");
    expect(names).not.toContain("get_publication_status");
    expect(names).not.toContain("get_review_feedback");
    expect(names).not.toContain("apply_review_suggestion");
    expect(names).not.toContain("reply_to_review_comment");
    expect(names).not.toContain("resolve_review_feedback");
    expect(names).not.toContain("sync_review_changes_to_draft");
    expect(names).not.toContain("prepare_human_review_handoff");
    expect(names).not.toContain("complete_review_round");
    expect(names).not.toContain("reset_review_circuit");
    expect(names).toContain("list_catalogues");
    expect(names).toContain("preview_catalogue_creation");
    expect(names).toContain("create_catalogue");
    expect(names).toContain("preview_update_catalogue");
    expect(names).toContain("update_catalogue");
    expect(names).toContain("create_category");
    expect(names).toContain("update_category");
    expect(names).not.toContain("publish_directly_to_main");
    expect(listing.result.tools.find(tool => tool.name === "list_puzzle_drafts")
      ?.annotations?.readOnlyHint).toBe(true);
    expect(listing.result.tools.find(tool => tool.name === "validate_puzzle_draft")
      ?.annotations?.readOnlyHint).toBe(false);
    expect(listing.result.tools.find(tool => tool.name === "delete_puzzle_draft")
      ?.annotations?.destructiveHint).toBe(true);
    expect(listing.result.tools.find(tool => tool.name === "create_puzzle_draft")
      ?.description).toMatch(/complete document/);

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
    for (const field of ["provenance", "creator", "license", "derivedFrom"]) {
      expect(resourceSchema.properties[field]).toBeUndefined();
    }
    for (const field of [
      "dateCreated", "dateModified", "version", "createdAt", "updatedAt",
      "validatedAt", "publicationState", "owner", "revision"
    ]) {
      expect(resourceSchema.properties[field]).toBeUndefined();
    }
    expect(resourceSchema.properties.language).toBeDefined();
    expect(resourceSchema.properties.learningIntroduction.properties.credit)
      .toBeUndefined();
    expect(resourceSchema.properties.learningIntroduction.properties.revision)
      .toBeUndefined();
    expect(resourceSchema.properties.bridges.items.properties.termRole)
      .toBeUndefined();
    expect(resourceSchema.properties.large)
      .toBeUndefined();
    expect(JSON.stringify(resourceSchema)).toMatch(/25/);
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
            properties: Record<string, unknown> & {
              bridges: { items: { properties: Record<string, unknown> } };
              learningIntroduction: { properties: Record<string, unknown> };
            };
          };
        };
      };
    };
    expect(authoringSchema.result.structuredContent.version).toBe("1");
    expect(authoringSchema.result.structuredContent.resourceUri)
      .toBe(schemaResource?.uri);
    expect(authoringSchema.result.structuredContent.schema.properties.bridges
      .items.properties.termRole).toBeUndefined();
    for (const field of ["provenance", "creator", "license", "derivedFrom"]) {
      expect(authoringSchema.result.structuredContent.schema.properties[field])
        .toBeUndefined();
    }
    expect(authoringSchema.result.structuredContent.schema.properties.language)
      .toBeDefined();
    expect(authoringSchema.result.structuredContent.schema.properties.learningIntroduction
      .properties.credit).toBeUndefined();
    expect(authoringSchema.result.structuredContent.schema.required)
      .not.toContain("bridges");

    type PhaseSchemaContent = {
      phase: string;
      complete: boolean;
      preserveExisting: boolean;
      domain?: string;
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
      .toBeUndefined();
    expect(phaseSchemas.core.schema.properties.bridges.items?.properties.relationKind)
      .toBeUndefined();
    expect(phaseSchemas.core.schema.properties.large).toBeUndefined();
    expect(phaseSchemas.review.schema.properties.large).toBeUndefined();
    expect(phaseSchemas.review.schema.properties.bridges.items?.properties.relationKind)
      .toBeDefined();
    expect(phaseSchemas.pedagogy.schema.properties.lenses).toBeDefined();
    expect(phaseSchemas.publication.schema.properties.provenance).toBeUndefined();
    for (const field of ["creator", "license", "derivedFrom"]) {
      expect(phaseSchemas.publication.schema.properties[field]).toBeUndefined();
    }
    expect(phaseSchemas.publication.schema.properties.language).toBeDefined();
    expect(phaseSchemas.publication.domain).toBe("pedagogy");
    expect(phaseSchemas.core.domain).toBe("content");
    expect(phaseSchemas.core.schema.properties.puzzleKind).toBeDefined();
    expect(phaseSchemas.review.domain).toBeUndefined();

    const vocabularySchemaResponse = await rpc({
      jsonrpc: "2.0",
      id: "schema-vocabulary-context",
      method: "tools/call",
      params: {
        name: "get_authoring_schema",
        arguments: { phase: "pedagogy", profile: "vocabulary-context" }
      }
    });
    const vocabularySchema = await rpcJson(vocabularySchemaResponse) as {
      result: {
        structuredContent: {
          profile: string;
          profileMode: string;
          profileStorageDomains: string[];
          profileSummary: string;
          domain: string;
          schema: { properties: Record<string, unknown> };
        };
      };
    };
    expect(vocabularySchema.result.structuredContent.profile)
      .toBe("vocabulary-context");
    expect(vocabularySchema.result.structuredContent.profileMode).toBe("advisory");
    expect(vocabularySchema.result.structuredContent.profileStorageDomains)
      .toEqual(["content", "pedagogy"]);
    expect(vocabularySchema.result.structuredContent.profileSummary)
      .toMatch(/near-synonym clusters/i);
    expect(vocabularySchema.result.structuredContent.domain).toBe("pedagogy");
    expect(vocabularySchema.result.structuredContent.schema.properties.lenses)
      .toBeDefined();

    const completeVocabularySchemaResponse = await rpc({
      jsonrpc: "2.0",
      id: "schema-vocabulary-context-complete",
      method: "tools/call",
      params: {
        name: "get_authoring_schema",
        arguments: { profile: "vocabulary-context" }
      }
    });
    const completeVocabularySchema = await rpcJson(completeVocabularySchemaResponse) as {
      result: {
        structuredContent: {
          schema: {
            properties: { clusters: { minItems: number } };
            allOf: Array<{
              if?: { properties?: {
                puzzleKind?: { const?: string };
                clusters?: { maxItems?: number };
              } };
              then?: { properties?: {
                clusters?: { minItems?: number; items?: { required?: string[] } };
                bridges?: { maxItems?: number };
              }; not?: { required?: string[] } };
              else?: { properties?: {
                clusters?: { minItems?: number; items?: { required?: string[] } };
              } };
            }>;
          };
        };
      };
    };
    expect(completeVocabularySchema.result.structuredContent.schema.properties.clusters.minItems)
      .toBe(1);
    const vocabularyClusterRule = completeVocabularySchema.result.structuredContent.schema.allOf
      .find(rule => rule.if?.properties?.puzzleKind?.const === "vocabulary-context");
    const vocabularyShapeRule = completeVocabularySchema.result.structuredContent.schema.allOf
      .find(rule => rule.if?.properties?.clusters?.maxItems === 1);
    expect(vocabularyClusterRule?.then?.properties?.clusters?.minItems).toBe(1);
    expect(vocabularyClusterRule?.else?.properties?.clusters?.minItems).toBe(2);
    expect(vocabularyShapeRule?.then?.properties?.clusters?.items?.required)
      .toEqual(["terms"]);
    expect(vocabularyShapeRule?.then?.not?.required).toEqual(["preSolve"]);
    expect(vocabularyShapeRule?.then?.properties?.bridges?.maxItems).toBe(0);
    expect(vocabularyShapeRule?.else?.properties?.clusters?.items?.required)
      .toEqual(["seeds", "floatingTerms"]);

    const triviaSchemaResponse = await rpc({
      jsonrpc: "2.0",
      id: "schema-trivia-quiz",
      method: "tools/call",
      params: {
        name: "get_authoring_schema",
        arguments: { phase: "core", profile: "trivia-quiz" }
      }
    });
    const triviaSchema = await rpcJson(triviaSchemaResponse) as {
      result: {
        structuredContent: {
          profile: string;
          profileMode: string;
          profileStorageDomains: string[];
          profileSummary: string;
          domain: string;
          schema: { properties: Record<string, unknown> };
        };
      };
    };
    expect(triviaSchema.result.structuredContent.profile).toBe("trivia-quiz");
    expect(triviaSchema.result.structuredContent.profileMode).toBe("advisory");
    expect(triviaSchema.result.structuredContent.profileStorageDomains)
      .toEqual(["content", "pedagogy"]);
    expect(triviaSchema.result.structuredContent.profileSummary)
      .toMatch(/Co-designed clusters and board terms/);
    expect(triviaSchema.result.structuredContent.domain).toBe("content");
    expect(triviaSchema.result.structuredContent.schema.properties.clusters)
      .toBeDefined();
    expect(
      (triviaSchema.result.structuredContent.schema.properties.puzzleKind as {
        enum?: string[];
      }).enum
    ).toEqual(["topic-based", "vocabulary-context", "trivia-quiz"]);
    expect(triviaSchema.result.structuredContent.schema.properties.profile)
      .toBeUndefined();

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
    expect(creation.result.structuredContent.draft.contentHash).toMatch(/^fnv1a64:/);

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
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/ordinary authored concepts/);
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/termRole|reference\/connector/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/prefer\s+a verified direct resource/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/appropriate level of granularity/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/automatic Wikipedia search is not inferred/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/information surfaces stable/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/concise bridge info/);
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
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/Trivia category specifically leans|trivia-quiz|quiz-led puzzle type/);
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/Vocabulary-in-context|lexical-disambiguation|near-synonym/);
    expect(guidance.result.structuredContent.markdown).toMatch(/learningIntroduction \("Before You Begin"\)/);
    expect(guidance.result.structuredContent.markdown).toMatch(/real\s+line breaks/);
    expect(guidance.result.structuredContent.markdown).toMatch(/two-character sequence/);
    expect(guidance.result.structuredContent.markdown).toMatch(/learningIntroduction\.credit/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/Do not submit.*provenance.*creator.*license.*derivedFrom/s);
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/provenance is optional structured authoring attribution/);
    expect(guidance.result.structuredContent.markdown).toMatch(/relatedPuzzles is an optional/);
    expect(guidance.result.structuredContent.markdown).toMatch(/register subcategories/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/publish_to_authoring=true/);
    expect(guidance.result.structuredContent.markdown).toMatch(/confirmed final edit/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/Cue and Freeze are outside MCP/);
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/admin\/drafts|Open board|click Publish/);
    expect(guidance.result.structuredContent.markdown)
      .toMatch(/hunt for the weakest\s+term to drop/);
    expect(guidance.result.structuredContent.markdown)
      .not.toMatch(/\b(?:standard|large|wide)\b|\b16(?:-node)?\b/i);

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
    expect(coreGuidance.result.structuredContent.markdown).toMatch(/puzzleKind/);
    expect(coreGuidance.result.structuredContent.markdown).toMatch(/exact citation shape/);
    expect(coreGuidance.result.structuredContent.markdown)
      .toMatch(/do not plan to rediscover/);
    expect(coreGuidance.result.structuredContent.markdown)
      .toMatch(/Carry approved inventory connections/);
    expect(coreGuidance.result.structuredContent.markdown)
      .not.toMatch(/\b(?:standard|large|wide)\b|\b16(?:-node)?\b/i);
    expect(coreGuidance.result.structuredContent.markdown)
      .not.toMatch(/Vocabulary-in-context|lexical-disambiguation|near-synonym/);
    expect(coreGuidance.result.structuredContent.markdown)
      .not.toMatch(/trivia-quiz|quiz-led puzzle type/);
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
      .toMatch(/more than 25 nodes/);
    expect(reviewGuidance.result.structuredContent.markdown)
      .not.toMatch(/\b(?:standard|large|wide)\b|\b16(?:-node)?\b/i);
    expect(reviewGuidance.result.structuredContent.markdown)
      .not.toMatch(/Vocabulary-in-context|lexical-disambiguation|near-synonym/);
    expect(reviewGuidance.result.structuredContent.markdown)
      .not.toMatch(/trivia-quiz|quiz-led puzzle type/);
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
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .not.toMatch(/Vocabulary-in-context|lexical-disambiguation|near-synonym/);
    expect(pedagogyGuidance.result.structuredContent.markdown)
      .not.toMatch(/trivia-quiz|quiz-led puzzle type/);

    const vocabularyCompleteGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-vocabulary-complete",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { profile: "vocabulary-context" }
      }
    });
    const vocabularyCompleteGuidance = await rpcJson(vocabularyCompleteGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(vocabularyCompleteGuidance.result.structuredContent.profile)
      .toBe("vocabulary-context");
    expect(vocabularyCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/Vocabulary-in-context profile/);
    expect(vocabularyCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/one integrated design cycle/);
    expect(vocabularyCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/permits one cluster/);
    expect(vocabularyCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/Request profile=vocabulary-context with phase=core/);
    expect(vocabularyCompleteGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Vocabulary-in-context core pass|## Design judgment|Dutch tilt/);

    const vocabularyCoreGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-vocabulary-core",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "core", profile: "vocabulary-context" }
      }
    });
    const vocabularyCoreGuidance = await rpcJson(vocabularyCoreGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(vocabularyCoreGuidance.result.structuredContent.profile)
      .toBe("vocabulary-context");
    expect(vocabularyCoreGuidance.result.structuredContent.markdown)
      .toMatch(/shared semantic center/);
    expect(vocabularyCoreGuidance.result.structuredContent.markdown)
      .toMatch(/overlap is the material/);
    expect(vocabularyCoreGuidance.result.structuredContent.markdown)
      .toMatch(/puzzleKind to "vocabulary-context"/);
    expect(vocabularyCoreGuidance.result.structuredContent.markdown)
      .toMatch(/single cluster is valid/);
    expect(vocabularyCoreGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Design judgment|search_puzzles|Dutch tilt/);

    const vocabularyReviewGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-vocabulary-review",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "review", profile: "vocabulary-context" }
      }
    });
    const vocabularyReviewGuidance = await rpcJson(vocabularyReviewGuided) as {
      result: { structuredContent: { markdown: string } };
    };
    expect(vocabularyReviewGuidance.result.structuredContent.markdown)
      .toMatch(/one most\s+natural or precise fit/);
    expect(vocabularyReviewGuidance.result.structuredContent.markdown)
      .toMatch(/two equally good\s+answers/);
    expect(vocabularyReviewGuidance.result.structuredContent.markdown)
      .toMatch(/every playable board term/);
    expect(vocabularyReviewGuidance.result.structuredContent.markdown)
      .toMatch(/after the candidate lenses have been drafted/);

    const vocabularyPedagogyGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-vocabulary-pedagogy",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "pedagogy", profile: "vocabulary-context" }
      }
    });
    const vocabularyPedagogyGuidance = await rpcJson(vocabularyPedagogyGuided) as {
      result: { structuredContent: { markdown: string } };
    };
    expect(vocabularyPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/contextual usage decision/);
    expect(vocabularyPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/one blank and one target term/);
    expect(vocabularyPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/single-cluster board is automatically pre-solved/);
    expect(vocabularyPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/For multi-cluster Vocabulary boards, leave preSolve as a per-puzzle\s+judgment/);

    const triviaCompleteGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-trivia-quiz-complete",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { profile: "trivia-quiz" }
      }
    });
    const triviaCompleteGuidance = await rpcJson(triviaCompleteGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(triviaCompleteGuidance.result.structuredContent.profile)
      .toBe("trivia-quiz");
    expect(triviaCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/Trivia-quiz profile/);
    expect(triviaCompleteGuidance.result.structuredContent.markdown)
      .toMatch(/Request profile=trivia-quiz with phase=core/);
    expect(triviaCompleteGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Trivia-quiz core pass|## Design judgment|Dutch tilt|Vocabulary-in-context/);

    const triviaCoreGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-trivia-quiz-core",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "core", profile: "trivia-quiz" }
      }
    });
    const triviaCoreGuidance = await rpcJson(triviaCoreGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(triviaCoreGuidance.result.structuredContent.profile)
      .toBe("trivia-quiz");
    expect(triviaCoreGuidance.result.structuredContent.markdown)
      .toMatch(/Inventory question-worthy facts and relationships alongside candidate\s+board terms/);
    expect(triviaCoreGuidance.result.structuredContent.markdown)
      .toMatch(/Do not build an arbitrary sort and append unrelated recall/);
    expect(triviaCoreGuidance.result.structuredContent.markdown)
      .toMatch(/puzzleKind to "trivia-quiz"/);
    expect(triviaCoreGuidance.result.structuredContent.markdown)
      .toMatch(/does not require category=trivia/);
    expect(triviaCoreGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Design judgment|Dutch tilt|Vocabulary-in-context/);

    const triviaReviewGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-trivia-quiz-review",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "review", profile: "trivia-quiz" }
      }
    });
    const triviaReviewGuidance = await rpcJson(triviaReviewGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(triviaReviewGuidance.result.structuredContent.profile)
      .toBe("trivia-quiz");
    expect(triviaReviewGuidance.result.structuredContent.markdown)
      .toMatch(/exactly one defensible correct answer/);
    expect(triviaReviewGuidance.result.structuredContent.markdown)
      .toMatch(/Verify every factual premise/);
    expect(triviaReviewGuidance.result.structuredContent.markdown)
      .toMatch(/If preSolve is enabled/);
    expect(triviaReviewGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Design judgment|Dutch tilt|Vocabulary-in-context/);

    const triviaPedagogyGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-trivia-quiz-pedagogy",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "pedagogy", profile: "trivia-quiz" }
      }
    });
    const triviaPedagogyGuidance = await rpcJson(triviaPedagogyGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(triviaPedagogyGuidance.result.structuredContent.profile)
      .toBe("trivia-quiz");
    expect(triviaPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/Use lensMode=quiz for the quiz-led profile/);
    expect(triviaPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/Choose preSolve per puzzle/);
    expect(triviaPedagogyGuidance.result.structuredContent.markdown)
      .toMatch(/Map each option's targets to every and only board term/);
    expect(triviaPedagogyGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Design judgment|Dutch tilt|Vocabulary-in-context/);

    const triviaPublicationGuided = await rpc({
      jsonrpc: "2.0",
      id: "guidance-trivia-quiz-publication",
      method: "tools/call",
      params: {
        name: "get_authoring_guidance",
        arguments: { phase: "publication", profile: "trivia-quiz" }
      }
    });
    const triviaPublicationGuidance = await rpcJson(triviaPublicationGuided) as {
      result: { structuredContent: { profile: string; markdown: string } };
    };
    expect(triviaPublicationGuidance.result.structuredContent.profile)
      .toBe("trivia-quiz");
    expect(triviaPublicationGuidance.result.structuredContent.markdown)
      .toMatch(/Trivia is the current domain-less category convention/);
    expect(triviaPublicationGuidance.result.structuredContent.markdown)
      .toMatch(/Do not infer or require profile=trivia-quiz from\s+category=trivia/);
    expect(triviaPublicationGuidance.result.structuredContent.markdown)
      .not.toMatch(/## Design judgment|Dutch tilt|Vocabulary-in-context/);

    const completePayloadSize = JSON.stringify(
      authoringSchema.result.structuredContent.schema
    ).length + guidance.result.structuredContent.markdown.length;
    const corePayloadSize = JSON.stringify(phaseSchemas.core.schema).length +
      coreGuidance.result.structuredContent.markdown.length;
    expect(corePayloadSize).toBeLessThan(completePayloadSize / 2);

    // create_puzzle_draft accepts the simplified format (no @context) and
    // stores the current canonical shape; legacy bridge fields are folded at
    // the boundary before validate_puzzle_draft sees the document.
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
      result: {
        structuredContent: {
          normalization?: unknown;
          draft: { revision: number; document: { category: string } };
        };
      };
    };
    expect(simplifiedCreation.result.structuredContent.normalization).toBeUndefined();
    expect(simplifiedCreation.result.structuredContent.draft.revision).toBe(1);
    expect(simplifiedCreation.result.structuredContent.draft.document.category).toBe("science");

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

  it("hides protected metadata from MCP and preserves it when an MCP save replaces content", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const document = {
      id: "retained-provenance-fixture",
      title: "Retained provenance fixture",
      category: "Science",
      clusters: [
        { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
        { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
      ],
      bridges: [],
      learningIntroduction: {
        requirement: "optional",
        content: { text: "A short human-authored introduction." },
        credit: "Curriculum team acknowledgement"
      },
      creator: "Human creator",
      license: "CC-BY-4.0",
      derivedFrom: "source-puzzle",
      language: "en",
      provenance: { collaboration: "ai", contributors: [{ name: "Claude" }] }
    };
    await repository.create({
      draftId: "retained-provenance-fixture",
      document,
      actor: { subject: "local-author" }
    });

    const rejectedCreate = await rpc({
      jsonrpc: "2.0",
      id: "reject-protected-create",
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "mcp-protected-create-fixture",
          document: {
            id: "mcp-protected-create-fixture",
            title: "Protected create fixture",
            category: "Science",
            clusters: [],
            bridges: [],
            license: "MIT"
          }
        }
      }
    });
    const rejectedCreatePayload = await rpcJson(rejectedCreate) as {
      result: { isError?: boolean; content: Array<{ text: string }> };
    };
    expect(rejectedCreatePayload.result.isError).toBe(true);
    expect(rejectedCreatePayload.result.content[0].text).toContain("license");

    const loaded = await rpc({
      jsonrpc: "2.0",
      id: 29,
      method: "tools/call",
      params: {
        name: "get_puzzle_draft",
        arguments: { draft_id: "retained-provenance-fixture" }
      }
    });
    type AgentDocument = Record<string, unknown> & {
      learningIntroduction: Record<string, unknown>;
    };
    const loadedPayload = await rpcJson(loaded) as {
      result: { structuredContent: { draft: { revision: number; document: AgentDocument } } };
    };
    const loadedDraft = loadedPayload.result.structuredContent.draft;
    for (const field of ["provenance", "creator", "license", "derivedFrom"]) {
      expect(loadedDraft.document[field]).toBeUndefined();
    }
    expect(loadedDraft.document.language).toBe("en");
    expect(loadedDraft.document.learningIntroduction.credit).toBeUndefined();

    const protectedFields: Array<[string, unknown]> = [
      ["provenance", document.provenance],
      ["creator", document.creator],
      ["license", document.license],
      ["derivedFrom", document.derivedFrom]
    ];
    for (const [field, value] of protectedFields) {
      const rejected = await rpc({
        jsonrpc: "2.0",
        id: `reject-${field}`,
        method: "tools/call",
        params: {
          name: "save_puzzle_draft",
          arguments: {
            draft_id: "retained-provenance-fixture",
            expected_revision: loadedDraft.revision,
            document: { ...loadedDraft.document, [field]: value }
          }
        }
      });
      const rejectedPayload = await rpcJson(rejected) as {
        result: { isError?: boolean; content: Array<{ text: string }> };
      };
      expect(rejectedPayload.result.isError).toBe(true);
      expect(rejectedPayload.result.content[0].text).toContain(field);
    }
    const rejectedCredit = await rpc({
      jsonrpc: "2.0",
      id: "reject-credit",
      method: "tools/call",
      params: {
        name: "save_puzzle_draft",
        arguments: {
          draft_id: "retained-provenance-fixture",
          expected_revision: loadedDraft.revision,
          document: {
            ...loadedDraft.document,
            learningIntroduction: {
              ...loadedDraft.document.learningIntroduction,
              credit: "By an agent"
            }
          }
        }
      }
    });
    const rejectedCreditPayload = await rpcJson(rejectedCredit) as {
      result: { isError?: boolean; content: Array<{ text: string }> };
    };
    expect(rejectedCreditPayload.result.isError).toBe(true);
    expect(rejectedCreditPayload.result.content[0].text)
      .toContain("learningIntroduction.credit");

    const saved = await rpc({
      jsonrpc: "2.0",
      id: 31,
      method: "tools/call",
      params: {
        name: "save_puzzle_draft",
        arguments: {
          draft_id: "retained-provenance-fixture",
          expected_revision: loadedDraft.revision,
          document: { ...loadedDraft.document, title: "Saved without protected metadata" }
        }
      }
    });
    expect(saved.status).toBe(200);
    const payload = await rpcJson(saved) as {
      result: { structuredContent: { draft: { document: AgentDocument } } };
    };
    const returnedDocument = payload.result.structuredContent.draft.document;
    for (const field of ["provenance", "creator", "license", "derivedFrom"]) {
      expect(returnedDocument[field]).toBeUndefined();
    }
    expect(returnedDocument.learningIntroduction.credit).toBeUndefined();
    expect(returnedDocument.language).toBe("en");

    const stored = await repository.get({
      draftId: "retained-provenance-fixture",
      actor: { subject: "local-author" }
    });
    expect(stored.document.creator).toBe("Human creator");
    expect(stored.document.license).toBe("CC-BY-4.0");
    expect(stored.document.derivedFrom).toBe("source-puzzle");
    expect(stored.document.provenance).toEqual(document.provenance);
    expect(stored.document.learningIntroduction.credit)
      .toBe("Curriculum team acknowledgement");
    expect(stored.document.language).toBe("en");
  });

  it("materializes authoring domains, reads legacy simplified rows, and rejects JSON-LD", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const document = {
      id: "domain-projection-fixture",
      title: "Domain projection fixture",
      category: "Science",
      puzzleKind: "trivia-quiz",
      info: { text: "Core information." },
      clusters: [
        { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
        { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
      ],
      bridges: [{
        id: "shared",
        term: "shared idea",
        clusters: ["alpha", "beta"],
        fact: "Shared fact.",
        relationKind: "contrast"
      }],
      lenses: [{ id: "lens", prompt: "Prompt", explanation: "Explanation" }],
      learningIntroduction: {
        requirement: "optional",
        content: { text: "A short introduction." }
      },
      provenance: { collaboration: "ai", contributors: [{ name: "Claude" }] }
    };
    const legacyDocument = {
      ...document,
      dateCreated: "2026-01-01",
      dateModified: "2026-01-02",
      version: 7,
      learningIntroduction: {
        ...document.learningIntroduction,
        revision: 4
      }
    };
    await repository.create({
      draftId: "domain-projection-fixture",
      document: legacyDocument,
      actor: { subject: "local-author" }
    });

    const row = await env.AUTHORING_DB.prepare(
      "SELECT content_json, pedagogy_json, provenance_json FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as {
      content_json: string;
      pedagogy_json: string;
      provenance_json: string;
    };
    const content = JSON.parse(row.content_json);
    const pedagogy = JSON.parse(row.pedagogy_json);
    const stored = JSON.parse((await env.AUTHORING_DB.prepare(
      "SELECT document FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as { document: string }).document);
    expect(content.clusters).toHaveLength(2);
    expect(content.puzzleKind).toBe("trivia-quiz");
    expect(content.bridges[0].relationKind).toBeUndefined();
    expect(pedagogy.lenses).toHaveLength(1);
    expect(pedagogy.bridges[0].relationKind).toBe("contrast");
    expect(JSON.parse(row.provenance_json)).toEqual(document.provenance);
    expect(stored.dateCreated).toBeUndefined();
    expect(stored.dateModified).toBeUndefined();
    expect(stored.version).toBeUndefined();
    expect(stored.learningIntroduction.revision).toBeUndefined();

    const populated = await repository.get({
      draftId: "domain-projection-fixture",
      actor: { subject: "local-author" }
    });
    expect(populated.document).toEqual(document);

    const beforeDomainSave = await env.AUTHORING_DB.prepare(
      "SELECT document, document_stale FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as {
      document: string;
      document_stale: number;
    };
    expect(Number(beforeDomainSave.document_stale || 0)).toBe(0);
    const contentProjection = JSON.parse(row.content_json);
    await repository.saveDomain({
      draftId: "domain-projection-fixture",
      domain: "content",
      projection: { ...contentProjection, title: "Domain column retitled" },
      actor: { subject: "local-author" },
      expectedRevision: populated.revision
    });
    const afterDomainSave = await env.AUTHORING_DB.prepare(
      "SELECT document, document_stale, content_json FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as {
      document: string;
      document_stale: number;
      content_json: string;
    };
    expect(Number(afterDomainSave.document_stale)).toBe(1);
    expect(afterDomainSave.document).toBe(beforeDomainSave.document);
    expect(JSON.parse(afterDomainSave.content_json).title).toBe("Domain column retitled");
    const assembled = await repository.get({
      draftId: "domain-projection-fixture",
      actor: { subject: "local-author" }
    });
    expect(assembled.document.title).toBe("Domain column retitled");
    expect(assembled.document.lenses).toHaveLength(1);
    expect(assembled.documentStale).toBe(true);
    const materialized = await repository.materialize({
      draftId: "domain-projection-fixture",
      actor: { subject: "local-author" }
    });
    expect(materialized.documentStale).toBe(false);
    expect(materialized.document.title).toBe("Domain column retitled");
    const afterMaterialize = await env.AUTHORING_DB.prepare(
      "SELECT document, document_stale FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as {
      document: string;
      document_stale: number;
    };
    expect(Number(afterMaterialize.document_stale)).toBe(0);
    expect(JSON.parse(afterMaterialize.document).title).toBe("Domain column retitled");

    // Restore a fresh create-shaped row for the legacy-null-projection cases.
    await repository.save({
      draftId: "domain-projection-fixture",
      document,
      actor: { subject: "local-author" },
      expectedRevision: materialized.revision
    });

    // A row written before migration 0019 has no projections. The complete
    // legacy simplified blob remains sufficient to reconstruct the same
    // authored document.
    await env.AUTHORING_DB.prepare(`
      UPDATE puzzle_drafts
      SET content_json = NULL, pedagogy_json = NULL, provenance_json = NULL
      WHERE id = ?
    `).bind("domain-projection-fixture").run();
    const legacy = await repository.get({
      draftId: "domain-projection-fixture",
      actor: { subject: "local-author" }
    });
    expect(legacy.document).toEqual(document);

    // First focused save on a pre-domain row must seed sibling columns so
    // marking document_stale does not drop pedagogy when the cache is ignored.
    await repository.saveDomain({
      draftId: "domain-projection-fixture",
      domain: "content",
      projection: {
        id: document.id,
        title: "Legacy domain seed",
        category: document.category,
        clusters: document.clusters,
        bridges: document.bridges.map(({ id, term, clusters, fact }) => ({
          id, term, clusters, fact
        }))
      },
      actor: { subject: "local-author" },
      expectedRevision: legacy.revision
    });
    const seededRow = await env.AUTHORING_DB.prepare(
      "SELECT document_stale, content_json, pedagogy_json FROM puzzle_drafts WHERE id = ?"
    ).bind("domain-projection-fixture").first() as {
      document_stale: number;
      content_json: string;
      pedagogy_json: string;
    };
    expect(Number(seededRow.document_stale)).toBe(1);
    expect(JSON.parse(seededRow.content_json).title).toBe("Legacy domain seed");
    expect(JSON.parse(seededRow.pedagogy_json).lenses).toHaveLength(1);
    const seededAssembled = await repository.get({
      draftId: "domain-projection-fixture",
      actor: { subject: "local-author" }
    });
    expect(seededAssembled.document.title).toBe("Legacy domain seed");
    expect(seededAssembled.document.lenses).toHaveLength(1);

    // JSON-LD rows are not a compatibility case. They must be canonicalized
    // before this Worker is released, so a stray row fails closed rather than
    // becoming an uneditable draft through the nullable-column fallback.
    const originalRow = await env.AUTHORING_DB.prepare(`
      SELECT document, content_hash FROM puzzle_drafts
      WHERE id = ? AND owner_subject = ?
    `).bind("domain-projection-fixture", "local-author").first() as {
      document: string;
      content_hash: string;
    };
    try {
      await env.AUTHORING_DB.prepare(`
        UPDATE puzzle_drafts
        SET document = ?, content_json = NULL, pedagogy_json = NULL,
            provenance_json = NULL, document_stale = 0
        WHERE id = ? AND owner_subject = ?
      `).bind(
        JSON.stringify({
          "@context": "https://concept-clusters.org/context/v1",
          id: "domain-projection-fixture",
          title: "Legacy JSON-LD row"
        }),
        "domain-projection-fixture",
        "local-author"
      ).run();
      await expect(repository.get({
        draftId: "domain-projection-fixture",
        actor: { subject: "local-author" }
      })).rejects.toThrow(/JSON-LD.*simplified/);
    } finally {
      await env.AUTHORING_DB.prepare(`
        UPDATE puzzle_drafts
        SET document = ?, content_hash = ?, content_json = NULL,
            pedagogy_json = NULL, provenance_json = NULL, document_stale = 0
        WHERE id = ? AND owner_subject = ?
      `).bind(
        originalRow.document,
        originalRow.content_hash,
        "domain-projection-fixture",
        "local-author"
      ).run();
    }
  });

  it("surfaces lens-reasons-coverage without retired bridge-role flags", async () => {
    // Lens reason coverage is cheap and actionable for both the authoring
    // agent and the human review page. Bridge term-role regularity is retired
    // as too noisy, and legacy role fields are folded away on save. See
    // modules/puzzleSymmetryFlags.js and modules/simplifiedPuzzleSchema.js.
    const created = await rpc({
      jsonrpc: "2.0",
      id: 31,
      method: "tools/call",
      params: {
        name: "create_puzzle_draft",
        arguments: {
          draft_id: "uniform-term-role-fixture",
          document: {
            id: "uniform-term-role-fixture",
            title: "Uniform Term Role Fixture",
            category: "Science",
            clusters: [
              { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a", "b"], floatingTerms: ["c"] },
              { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["d", "e"], floatingTerms: ["f"] }
            ],
            bridges: [
              { term: "link-1", clusters: ["alpha", "beta"], fact: "Link one.", termRole: "connector" },
              { term: "link-2", clusters: ["alpha", "beta"], fact: "Link two.", termRole: "connector" },
              { term: "link-3", clusters: ["alpha", "beta"], fact: "Link three.", termRole: "connector" }
            ],
            lenses: [
              {
                id: "why-alpha",
                prompt: "Why alpha?",
                explanation: "Explains alpha.",
                targets: ["a", "b"],
                reasons: { a: "a is a seed term." }
              }
            ]
          }
        }
      }
    });
    const lensCreation = await rpcJson(created) as {
      result: { structuredContent: { draft: { draftId: string } } };
    };
    expect(created.status).toBe(200);
    expect(lensCreation.result.structuredContent.draft.draftId)
      .toBe("uniform-term-role-fixture");

    const validated = await rpc({
      jsonrpc: "2.0",
      id: 32,
      method: "tools/call",
      params: {
        name: "validate_puzzle_draft",
        arguments: { draft_id: "uniform-term-role-fixture" }
      }
    });
    const validation = await rpcJson(validated) as {
      result: { structuredContent: { valid: boolean; flags: Array<{ id: string }> } };
    };
    expect(
      validation.result.structuredContent.flags.some(flag => flag.id === "bridge-term-role")
    ).toBe(false);
    expect(
      validation.result.structuredContent.flags.some(flag => flag.id === "lens-reasons-coverage")
    ).toBe(true);

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
    const adminCreation = await rpcJson(created) as {
      result: { structuredContent: { draft: { draftId: string } } };
    };
    expect(created.status).toBe(200);
    expect(adminCreation.result.structuredContent.draft.draftId)
      .toBe("admin-review-fixture");

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
    expect(listBody).toContain("Drafts");
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
    expect(detailBody).not.toContain('value="revert-working-copy"');
    expect(detailBody).toContain('value="delete-draft"');
    expect(detailBody).toContain("<copy-field>");
    expect(detailBody).toContain("save-working-copy");
    expect(detailBody).not.toContain("save-field");
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

    // install-checkout/uninstall-checkout used to get a hosted-specific
    // "no git checkout" message; the whole checkout-install feature is
    // gone now, so these are just unrecognized confirm values like any
    // other -- same generic error as install-and-play below, not
    // special-cased.
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
    expect(await hostedInstall.text()).toContain("Unrecognized action");

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
    expect(await hostedInstallAndPlay.text()).toContain("Unrecognized action");

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
    expect(await hostedUninstall.text()).toContain("Unrecognized action");

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
    expect(published.status).toBe(303);
    expect(published.headers.get("Location"))
      .toBe("/admin/drafts/admin-review-fixture?notice=published&puzzle_id=admin-review-fixture&revision=1");

    const publishedPage = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture?notice=published&puzzle_id=admin-review-fixture&revision=1"),
      env,
      createExecutionContext()
    );
    expect(publishedPage.status).toBe(200);
    const publishedBody = await publishedPage.text();
    expect(publishedBody).toContain('role="status"');
    expect(publishedBody).toMatch(/Published[\s\S]*admin-review-fixture[\s\S]*D1 revision/);
    expect(publishedBody).toContain("git-bundled production player is unchanged");
    expect(publishedBody).not.toContain("<h1>Puzzles</h1>");
    expect(publishedBody).toContain(">Cue</button>");
    expect(publishedBody).toContain("authoring play");
    expect(publishedBody).toContain(">held</span>");

    const cued = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-review-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=cue-for-freeze"
      }),
      env,
      createExecutionContext()
    );
    expect(cued.status).toBe(303);
    expect(cued.headers.get("Location"))
      .toBe("/admin/drafts?notice=cued&puzzle_id=admin-review-fixture&cued=1");

    const cuedPage = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts?notice=cued&puzzle_id=admin-review-fixture&cued=1"),
      env,
      createExecutionContext()
    );
    expect(cuedPage.status).toBe(200);
    const cuedBody = await cuedPage.text();
    expect(cuedBody).toContain("<h1>Puzzles</h1>");
    expect(cuedBody).toMatch(/Cued[\s\S]*admin-review-fixture[\s\S]*D1 revision 1/);

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
    const copyCreation = await rpcJson(created) as {
      result: { structuredContent: { draft: { draftId: string } } };
    };
    expect(created.status).toBe(200);
    expect(copyCreation.result.structuredContent.draft.draftId)
      .toBe("admin-copy-edit-fixture");

    const saved = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: new URLSearchParams({
          confirm: "save-working-copy",
          expected_revision: "1",
          "c0.section": "puzzle",
          "c0.field": "title",
          "c0.value": "Edited hosted title"
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
    const afterBody = await after.text();
    expect(afterBody).toContain("Edited hosted title");
    expect(afterBody).toContain('value="revert-working-copy"');

    const unknown = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: new URLSearchParams({
          confirm: "save-working-copy",
          expected_revision: "2",
          "c0.section": "puzzle",
          "c0.field": "<img src=x onerror=alert(1)>",
          "c0.value": "nope"
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
          confirm: "save-working-copy",
          expected_revision: "1",
          "c0.section": "puzzle",
          "c0.field": "title",
          "c0.value": "Stale title"
        }).toString()
      }),
      env,
      createExecutionContext()
    );
    expect(conflict.status).toBe(409);

    const reverted = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost:8788"
        },
        body: "confirm=revert-working-copy"
      }),
      env,
      createExecutionContext()
    );
    expect(reverted.status).toBe(303);
    expect(reverted.headers.get("Location")).toBe("/admin/drafts/admin-copy-edit-fixture");

    const restored = await worker.fetch(
      new Request("http://localhost:8788/admin/drafts/admin-copy-edit-fixture"),
      env,
      createExecutionContext()
    );
    expect(restored.status).toBe(200);
    const restoredBody = await restored.text();
    expect(restoredBody).toContain("Admin Copy Edit Fixture");
    expect(restoredBody).not.toContain("Edited hosted title");
    expect(restoredBody).not.toContain('value="revert-working-copy"');
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
