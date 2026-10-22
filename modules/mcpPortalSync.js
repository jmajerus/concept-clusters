// Choose the LAN authoring server in a Cloudflare MCP portal catalog and
// decide whether a capability sync replaced that catalog.

export const MCP_PORTAL_ORIGIN_HOST = "authoring.majerus.us";

export function mcpServerHost(hostname) {
  if (typeof hostname !== "string" || !hostname) return "";
  try {
    return new URL(hostname).host;
  } catch {
    return "";
  }
}

function isMcpEndpoint(hostname) {
  try {
    const path = new URL(hostname).pathname.replace(/\/+$/, "");
    return path.endsWith("/mcp");
  } catch {
    return false;
  }
}

/** The one portal server whose hostname is the LAN authoring origin. */
export function portalServerForOrigin(servers, originHost = MCP_PORTAL_ORIGIN_HOST) {
  const matches = (Array.isArray(servers) ? servers : []).filter(server =>
    mcpServerHost(server?.hostname) === originHost
  );
  if (matches.length === 1) return matches[0];
  const listed = (Array.isArray(servers) ? servers : [])
    .map(server => server?.hostname)
    .filter(Boolean);
  if (!matches.length) {
    throw new Error(
      `No MCP server for ${originHost}. Found: ${listed.join(", ") || "none"}.`
    );
  }
  const endpoints = matches.filter(server => isMcpEndpoint(server.hostname));
  if (endpoints.length === 1) return endpoints[0];
  throw new Error(
    `Several MCP servers use ${originHost}: ${matches.map(server => server.hostname).join(", ")}.`
  );
}

export function portalSyncReady(body) {
  const result = body?.result;
  return body?.success === true && result?.status === "ready" && !result?.error;
}

export function portalSyncFailure(body) {
  const result = body?.result || {};
  const cause = result.error_details?.cause;
  const parts = [result.status, result.error, cause].filter(Boolean);
  return parts.join(": ") || "portal sync did not report ready";
}
