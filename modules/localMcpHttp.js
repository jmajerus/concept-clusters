import { Readable } from "node:stream";
import { authenticateAuthoringAccess } from "./accessAuth.js";
import { handleAuthoringMcpRequest } from "./authoringMcpHttp.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";

function jsonError(status, error) {
  return Response.json({ error }, { status });
}

export function isMcpPath(url) {
  const path = typeof url === "string" ? url : "";
  return path === "/mcp" || path.startsWith("/mcp?");
}

async function readNodeBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function nodeRequestToWeb(req) {
  const host = req.headers.host || "localhost";
  const url = `http://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const method = req.method || "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await readNodeBody(req) : undefined;
  return new Request(url, { method, headers, body });
}

export async function sendWebResponse(res, response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    const existing = headers[key];
    headers[key] = existing ? `${existing}, ${value}` : value;
  });
  res.writeHead(response.status, headers);
  if (!response.body) {
    res.end();
    return;
  }
  await new Promise((resolve, reject) => {
    const stream = Readable.fromWeb(response.body);
    stream.on("error", reject);
    res.on("error", reject);
    res.on("finish", resolve);
    stream.pipe(res);
  });
}

export async function handleLocalMcpRequest(req, res, {
  repositoryRoot,
  env = process.env,
  keys = null
} = {}) {
  if (!isMcpPath(req.url || "")) return false;
  const request = await nodeRequestToWeb(req);
  const preflight = request.method === "OPTIONS";
  const authenticated = preflight
    ? {
      actor: { subject: "cors-preflight" },
      authInfo: { token: "cors-preflight", clientId: "cors-preflight", scopes: [] }
    }
    : await authenticateAuthoringAccess(request, env, { keys });
  if (authenticated.error) {
    await sendWebResponse(res, jsonError(authenticated.error.status, authenticated.error.message));
    return true;
  }
  const workspace = await resolveLocalAuthoringWorkspace({ env, repositoryRoot });
  const response = await handleAuthoringMcpRequest(request, {
    draftRepository: workspace.draftRepository,
    contentDocuments: workspace.contentDocuments,
    wikiLinkStore: workspace.wikiLinkStore,
    actor: authenticated.actor,
    authInfo: authenticated.authInfo
  });
  await sendWebResponse(res, response);
  return true;
}
