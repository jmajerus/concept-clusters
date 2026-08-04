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
    expect(names).toContain("preview_repository_import");
    expect(names).toContain("submit_puzzle_for_publication");
    expect(names).toContain("get_publication_status");
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
  });
});
