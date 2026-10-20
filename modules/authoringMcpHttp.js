import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createMcpHandler } from "agents/mcp/server";
import { createHostedAuthoringContentService } from "./hostedAuthoringContentService.js";
import { createHostedMcpAuthoringServer } from "./hostedMcpAuthoringServer.js";

const LEARNING_INTRODUCTION_URL = new URL(
  "../puzzles/public-health/from-evidence-to-action.intro.md",
  import.meta.url
);

let learningIntroductionText;

async function learningIntroduction() {
  if (learningIntroductionText !== undefined) return learningIntroductionText;
  try {
    learningIntroductionText = readFileSync(fileURLToPath(LEARNING_INTRODUCTION_URL), "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    const imported = await import("../puzzles/public-health/from-evidence-to-action.intro.md");
    learningIntroductionText = imported.default;
  }
  return learningIntroductionText;
}

const MAX_MCP_REQUEST_BYTES = 1_600_000;

function jsonError(status, error) {
  return Response.json({ error }, { status });
}

async function createHostedContentService() {
  return createHostedAuthoringContentService({
    learningContentByPuzzle: new Map([
      ["from-evidence-to-action", await learningIntroduction()]
    ])
  });
}

async function readBoundedJson(request) {
  if (!request.body) throw new Error("MCP POST request has no body");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_MCP_REQUEST_BYTES) {
      await reader.cancel("request too large");
      throw new RangeError(`MCP request exceeds ${MAX_MCP_REQUEST_BYTES} bytes`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * @param {Request} request
 * @param {{
 *   draftRepository: object,
 *   contentDocuments: object,
 *   wikiLinkStore?: object | null,
 *   actor: { subject: string },
 *   authInfo: { token: string, clientId: string, scopes: string[] },
 *   analytics?: object | null,
 *   serverName?: string
 * }} options
 */
export async function handleAuthoringMcpRequest(request, {
  draftRepository,
  contentDocuments,
  wikiLinkStore = null,
  actor,
  authInfo,
  analytics = null,
  serverName
}) {
  const url = new URL(request.url);
  try {
    const contentService = await createHostedContentService();
    const handler = createMcpHandler(
      () => createHostedMcpAuthoringServer({
        draftRepository,
        contentDocuments,
        contentService,
        actor,
        analytics,
        wikiLinkStore,
        ...(serverName ? { serverName } : {})
      }),
      {
        route: "/mcp",
        legacy: "stateless",
        allowedHostnames: [url.hostname],
        allowedOriginHostnames: [url.hostname, "localhost", "127.0.0.1"],
        onerror: error => console.error(JSON.stringify({
          message: "MCP handler error",
          error: error instanceof Error ? error.message : String(error)
        }))
      }
    );
    const parsedBody = request.method === "POST"
      ? await readBoundedJson(request)
      : undefined;
    return handler.fetch(request, {
      authInfo,
      ...(parsedBody === undefined ? {} : { parsedBody })
    });
  } catch (error) {
    const tooLarge = error instanceof RangeError;
    console.error(JSON.stringify({
      message: "Authoring request failed",
      error: error instanceof Error ? error.message : String(error),
      path: url.pathname
    }));
    return jsonError(tooLarge ? 413 : 400, tooLarge
      ? "MCP request is too large"
      : "Invalid MCP request");
  }
}
