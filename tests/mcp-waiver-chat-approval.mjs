import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { seededMcpContentDocuments } from "./mcp-fixtures.mjs";

export const name = "MCP waiver chat approval: both protocol eras, decline, cancel, no elicitation";

const reason = "Every one of these terms marks a distinct usage boundary.";

function document(id) {
  return {
    id,
    title: "Waiver chat",
    category: "Science",
    clusters: [
      { id: "alpha", name: "Alpha", fact: "Alpha fact.", seeds: ["a1", "a2"],
        floatingTerms: ["a3", "a4", "a5", "a6", "a7", "a8"] },
      { id: "beta", name: "Beta", fact: "Beta fact.", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
    ],
    bridges: []
  };
}

// Served the way tools/mcp-server.mjs serves it, so the opening exchange
// picks the protocol era exactly as it does for a real client.
async function connect(factory, { mode, elicit }) {
  const client = new Client(
    { name: "waiver-test", title: "Waiver Test Client", version: "1.0.0" },
    {
      capabilities: elicit ? { elicitation: { form: {} } } : {},
      versionNegotiation: { mode }
    }
  );
  const prompts = [];
  if (elicit) {
    client.setRequestHandler("elicitation/create", async request => {
      prompts.push(request.params.message);
      return elicit(request.params);
    });
  }
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const handle = serveStdio(factory, { transport: serverTransport });
  await client.connect(clientTransport);
  return { client, prompts, handle };
}

function text(result) {
  return result.content.map(part => part.text).join("\n");
}

async function scenario(content, contentDocuments, directory, { draftId, mode, elicit }) {
  const factory = () => createConceptClustersMcpServer({
    contentService: content,
    contentDocuments,
    draftDirectory: directory
  });
  const { client, prompts, handle } = await connect(factory, { mode, elicit });
  try {
    const created = await client.callTool({
      name: "create_puzzle_draft",
      arguments: { draft_id: draftId, document: document(draftId) }
    });
    assert.equal(created.isError, undefined, text(created));
    const revision = created.structuredContent.draft.revision;
    const result = await client.callTool({
      name: "request_board_limit_waiver",
      arguments: {
        draft_id: draftId, expected_revision: revision,
        waiver_type: "cluster-term-count", target_id: "alpha", reason
      }
    });
    assert.equal(result.isError, undefined, text(result));
    const read = await client.callTool({ name: "get_puzzle_draft", arguments: { draft_id: draftId } });
    return {
      era: client.getProtocolEra?.(),
      prompts,
      message: text(result),
      structured: result.structuredContent,
      summary: read.structuredContent.boardLimitWaivers.scopes.find(scope => scope.targetId === "alpha")
    };
  } finally {
    await client.close();
    await handle.close();
  }
}

export async function run() {
  const directory = await mkdtemp(join(tmpdir(), "cc-waiver-chat-"));
  const content = createContentInterchangeService();
  const contentDocuments = await seededMcpContentDocuments(content, { puzzleIds: [] });
  const run = options => scenario(content, contentDocuments, directory, options);
  try {
    // 2026-07-28: the server answers input_required; the client asks its
    // user and retries the same call with the answer.
    const modern = await run({
      draftId: "waiver-modern", mode: { pin: "2026-07-28" },
      elicit: () => ({ action: "accept", content: { note: "Fine for this lesson." } })
    });
    assert.equal(modern.era, "modern");
    assert.equal(modern.prompts.length, 1);
    assert.match(modern.prompts[0], /Alpha.*8.*ordinary limit 7/s);
    assert.match(modern.prompts[0], /distinct usage boundary/);
    assert.equal(modern.structured.decision, "granted");
    assert.equal(modern.summary.status, "granted");
    assert.match(modern.summary.requestReason, /distinct usage boundary/);

    // 2025 era over a bidirectional transport: a pushed elicitation.
    const legacy = await run({
      draftId: "waiver-legacy", mode: "legacy",
      elicit: () => ({ action: "decline" })
    });
    assert.equal(legacy.era, "legacy");
    assert.equal(legacy.prompts.length, 1);
    assert.equal(legacy.structured.decision, "declined");
    assert.match(legacy.message, /declined/);
    assert.equal(legacy.summary.status, "stale-review-request");

    // Cancel leaves the request pending for the review page.
    const cancelled = await run({
      draftId: "waiver-cancel", mode: { pin: "2026-07-28" },
      elicit: () => ({ action: "cancel" })
    });
    assert.match(cancelled.message, /still pending/);
    assert.equal(cancelled.summary.status, "pending-review");

    // No elicitation capability: the old behavior, plus where to decide it.
    const plain = await run({ draftId: "waiver-plain", mode: { pin: "2026-07-28" } });
    assert.equal(plain.prompts.length, 0);
    assert.match(plain.message, /draft review page: http.*\/admin\/drafts\/waiver-plain/);
    assert.equal(plain.summary.status, "pending-review");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
