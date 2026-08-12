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
      result: { serverInfo: { name: string } };
    };
    expect(initialization.result.serverInfo.name)
      .toBe("concept-clusters-hosted-authoring");

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
    expect(names).not.toContain("publish_directly_to_main");
    expect(listing.result.tools.find(tool => tool.name === "list_puzzle_drafts")
      ?.annotations?.readOnlyHint).toBe(true);
    expect(listing.result.tools.find(tool => tool.name === "validate_puzzle_draft")
      ?.annotations?.readOnlyHint).toBe(false);
    expect(listing.result.tools.find(tool => tool.name === "delete_puzzle_draft")
      ?.annotations?.destructiveHint).toBe(true);

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

    // create_puzzle_draft accepts the simplified format (no @context) and
    // stores canonical JSON-LD -- validate_puzzle_draft sees exactly what
    // it would for hand-authored JSON-LD.
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
              { term: "shared idea", clusters: ["alpha", "beta"], fact: "Bridges alpha and beta." }
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
      result: { structuredContent: { valid: boolean; errors: string[] } };
    };
    expect(simplifiedValidation.result.structuredContent.valid).toBe(true);

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
      result: { structuredContent: { valid: boolean; errors: string[] } };
    };
    expect(brokenValidation.result.structuredContent.valid).toBe(false);
    expect(brokenValidation.result.structuredContent.errors.some(e => e.includes("fact"))).toBe(true);
    expect(brokenValidation.result.structuredContent.errors.some(e => e.includes("@context"))).toBe(false);
  });
});
