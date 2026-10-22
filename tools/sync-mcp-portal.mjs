// Copy the LAN authoring server's tool list into the Cloudflare MCP portal.
// GitHub Actions runs this with CLOUDFLARE_MCP_PORTAL_TOKEN. The MCP
// status-bar menu dispatches that workflow.
import { basename } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import {
  MCP_PORTAL_ORIGIN_HOST,
  portalServerForOrigin,
  portalSyncFailure,
  portalSyncReady
} from "../modules/mcpPortalSync.js";

const API = "https://api.cloudflare.com/client/v4";
const PAGE_LIMIT = 20;
const POLL_INTERVAL_MS = 2000;
const POLL_LIMIT = 15;

function cloudflareError(body, status) {
  const messages = (body?.errors || []).map(error => error.message).filter(Boolean);
  return messages.join("; ") || `HTTP ${status}`;
}

async function cloudflare(path, token, { method = "GET", fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(`${method} ${path} failed: ${cloudflareError(body, response.status)}`);
  }
  return body;
}

function syncView(body) {
  const result = body?.result || {};
  return {
    success: body?.success,
    result: {
      status: result.status,
      error: result.error,
      error_details: result.error_details
    }
  };
}

export async function listMcpServers(accountId, token, { fetchImpl = fetch } = {}) {
  const servers = [];
  for (let page = 1; page <= PAGE_LIMIT; page += 1) {
    const body = await cloudflare(
      `/accounts/${accountId}/access/ai-controls/mcp/servers?page=${page}&per_page=50`,
      token,
      { fetchImpl }
    );
    servers.push(...(body.result || []));
    const totalPages = body.result_info?.total_pages || 1;
    if (page >= totalPages) return servers;
    if (page === PAGE_LIMIT) {
      throw new Error(`MCP server list has ${totalPages} pages, past the limit of ${PAGE_LIMIT}.`);
    }
  }
  return servers;
}

export async function syncMcpPortalCatalog({
  accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
  token = process.env.CLOUDFLARE_MCP_PORTAL_TOKEN,
  originHost = MCP_PORTAL_ORIGIN_HOST,
  fetchImpl = fetch,
  sleep = delay,
  pollIntervalMs = POLL_INTERVAL_MS,
  pollLimit = POLL_LIMIT
} = {}) {
  if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is required.");
  if (!token) throw new Error("CLOUDFLARE_MCP_PORTAL_TOKEN is required.");
  const servers = await listMcpServers(accountId, token, { fetchImpl });
  const server = portalServerForOrigin(servers, originHost);
  const serverPath = `/accounts/${accountId}/access/ai-controls/mcp/servers/${server.id}`;
  console.log(`Syncing ${server.name} (${server.id}) at ${server.hostname}.`);
  let body = syncView(await cloudflare(`${serverPath}/sync`, token, { method: "POST", fetchImpl }));
  for (let attempt = 0; !portalSyncReady(body) && body.result.status === "waiting" && attempt < pollLimit; attempt += 1) {
    await sleep(pollIntervalMs);
    body = syncView(await cloudflare(serverPath, token, { fetchImpl }));
  }
  if (!portalSyncReady(body)) {
    throw new Error(`Portal catalog sync failed: ${portalSyncFailure(body)}`);
  }
  console.log(`Portal catalog sync is ${body.result.status}.`);
  return body.result;
}

const invokedDirectly = process.argv[1]
  && basename(process.argv[1]) === "sync-mcp-portal.mjs";

if (invokedDirectly) {
  syncMcpPortalCatalog().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
