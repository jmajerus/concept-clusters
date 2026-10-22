import { Readable } from "node:stream";
import { authenticateAuthoringAccess } from "./accessAuth.js";
import { handleAuthoringMcpRequest, MAX_MCP_REQUEST_BYTES } from "./authoringMcpHttp.js";
import {
  mcpRejectionReason,
  recordAuthoringMcpAccepted,
  recordAuthoringMcpRejected,
  summarizeMcpBody
} from "./authoringMcpHealth.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";

function jsonError(status, error) {
  return Response.json({ error }, { status });
}

export function isMcpPath(url) {
  const path = typeof url === "string" ? url : "";
  return path === "/mcp" || path.startsWith("/mcp?");
}

function declaredContentLength(headers) {
  const raw = headers?.["content-length"];
  if (raw == null || Array.isArray(raw)) return null;
  const declared = Number(raw);
  return Number.isFinite(declared) ? declared : null;
}

export function mcpContentLengthExceeded(headers, maxBytes = MAX_MCP_REQUEST_BYTES) {
  const declared = declaredContentLength(headers);
  return declared != null && declared > maxBytes;
}

function destroyRequest(req) {
  if (typeof req.destroy === "function") req.destroy();
  else if (typeof req.resume === "function") req.resume();
}

async function readNodeBody(req, maxBytes) {
  if (mcpContentLengthExceeded(req.headers, maxBytes)) {
    destroyRequest(req);
    throw new RangeError(`MCP request exceeds ${maxBytes} bytes`);
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      destroyRequest(req);
      throw new RangeError(`MCP request exceeds ${maxBytes} bytes`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function nodeRequestToWeb(req, { includeBody = true, maxBytes = MAX_MCP_REQUEST_BYTES } = {}) {
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
  const hasBody = includeBody && method !== "GET" && method !== "HEAD";
  const body = hasBody ? await readNodeBody(req, maxBytes) : undefined;
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
  const method = req.method || "GET";
  const preflight = method === "OPTIONS";
  const hasBody = method !== "GET" && method !== "HEAD" && !preflight;
  if (hasBody && mcpContentLengthExceeded(req.headers)) {
    recordAuthoringMcpRejected({ reason: "body too large" });
    await sendWebResponse(res, jsonError(413, `MCP request exceeds ${MAX_MCP_REQUEST_BYTES} bytes`));
    destroyRequest(req);
    return true;
  }
  const headerRequest = await nodeRequestToWeb(req, { includeBody: false });
  const authenticated = preflight
    ? {
      actor: { subject: "cors-preflight" },
      authInfo: { token: "cors-preflight", clientId: "cors-preflight", scopes: [] }
    }
    : await authenticateAuthoringAccess(headerRequest, env, {
      keys,
      peerAddress: req.socket?.remoteAddress || null
    });
  if (authenticated.error) {
    if (!preflight) {
      recordAuthoringMcpRejected({
        reason: mcpRejectionReason(authenticated.error.status, authenticated.error.message)
      });
    }
    await sendWebResponse(res, jsonError(authenticated.error.status, authenticated.error.message));
    destroyRequest(req);
    return true;
  }
  let request = headerRequest;
  let summary = { method: method === "GET" ? "GET" : null, client: null };
  if (hasBody) {
    try {
      const raw = await readNodeBody(req);
      summary = summarizeMcpBody(raw);
      request = new Request(headerRequest.url, {
        method,
        headers: headerRequest.headers,
        body: raw
      });
    } catch (error) {
      destroyRequest(req);
      if (error instanceof RangeError) {
        recordAuthoringMcpRejected({ reason: "body too large" });
        await sendWebResponse(res, jsonError(413, error.message));
        return true;
      }
      throw error;
    }
  }
  const workspace = await resolveLocalAuthoringWorkspace({ env, repositoryRoot });
  const response = await handleAuthoringMcpRequest(request, {
    draftRepository: workspace.draftRepository,
    contentDocuments: workspace.contentDocuments,
    wikiLinkStore: workspace.wikiLinkStore,
    actor: authenticated.actor,
    authInfo: authenticated.authInfo
  });
  if (!preflight) {
    if (response.status >= 400) {
      recordAuthoringMcpRejected({ reason: mcpRejectionReason(response.status) });
    } else {
      recordAuthoringMcpAccepted(summary);
    }
  }
  await sendWebResponse(res, response);
  return true;
}
