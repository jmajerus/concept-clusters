// Copy the LAN authoring server's tool list into the Cloudflare MCP portal.
// GitHub Actions runs this with CLOUDFLARE_MCP_PORTAL_TOKEN. The MCP
// status-bar menu dispatches that workflow.
import { basename } from "node:path";

import {
  MCP_PORTAL_ORIGIN_HOST,
  portalServerForOrigin,
  portalSyncFailure,
  portalSyncReady
} from "../modules/mcpPortalSync.js";

const API = "https://api.cloudflare.com/client/v4";

function cloudflareError(body, status) {
  const messages = (body?.errors || []).map(error => error.message).filter(Boolean);
  return messages.join("; ") || `HTTP ${status}`;
}

async function cloudflare(path, token, { method = "GET" } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(`${method} ${path} failed: ${cloudflareError(body, response.status)}`);
  }
  return body;
}

export async function listMcpServers(accountId, token) {
  const servers = [];
  for (let page = 1; page <= 20; page += 1) {
    const body = await cloudflare(
      `/accounts/${accountId}/access/ai-controls/mcp/servers?page=${page}&per_page=50`,
      token
    );
    servers.push(...(body.result || []));
    const totalPages = body.result_info?.total_pages || 1;
    if (page >= totalPages) break;
  }
  return servers;
}

export async function syncMcpPortalCatalog({
  accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
  token = process.env.CLOUDFLARE_MCP_PORTAL_TOKEN,
  originHost = MCP_PORTAL_ORIGIN_HOST
} = {}) {
  if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is required.");
  if (!token) throw new Error("CLOUDFLARE_MCP_PORTAL_TOKEN is required.");
  const servers = await listMcpServers(accountId, token);
  const server = portalServerForOrigin(servers, originHost);
  console.log(`Syncing ${server.name} (${server.id}) at ${server.hostname}.`);
  const body = await cloudflare(
    `/accounts/${accountId}/access/ai-controls/mcp/servers/${server.id}/sync`,
    token,
    { method: "POST" }
  );
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
