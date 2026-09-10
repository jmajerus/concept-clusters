// Parse the one-shot MCP helper invocation without making the helper pretend
// to be the client that launched it. A caller may explicitly forward its
// original clientInfo and call _meta; otherwise the helper remains mcp-call.

export const MCP_CALL_FALLBACK_CLIENT_INFO = Object.freeze({
  name: "mcp-call",
  version: "1"
});

export class McpCallInvocationError extends Error {}

function parseJsonObject(raw, label) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new McpCallInvocationError(`${label} must be valid JSON.`);
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new McpCallInvocationError(`${label} must be a JSON object.`);
  }
  return value;
}

function normalizeClientInfo(raw) {
  const info = parseJsonObject(raw, "Client info");
  const name = typeof info.name === "string" ? info.name.trim() : "";
  if (!name) {
    throw new McpCallInvocationError("Client info must include a non-empty name.");
  }
  const version = typeof info.version === "string" ? info.version.trim() : "";
  return { ...info, name, version: version || "unknown" };
}

function clientInfoFromName(name, model) {
  const normalized = typeof name === "string" ? name.trim() : "";
  if (!normalized) {
    throw new McpCallInvocationError("Client name must be non-empty.");
  }
  // The helper needs a protocol version, but this placeholder is not used for
  // contributor attribution and is never persisted as a model/version claim.
  const trimmedModel = typeof model === "string" ? model.trim() : "";
  return { name: normalized, version: "unknown", ...(trimmedModel ? { model: trimmedModel } : {}) };
}

/**
 * Parse `tools/mcp-call.mjs` arguments.
 *
 * --client-info and --meta take precedence over their environment equivalents:
 * CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO and CONCEPT_CLUSTERS_MCP_CALL_META.
 * A host can set the simpler CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME when it
 * only needs a stable client surface such as "muse-code", and pair it with
 * CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL when it also knows its own model
 * (e.g. a fixed-model host with no per-call model in its protocol frame).
 * CLIENT_MODEL is ignored unless CLIENT_NAME (or --client-info, where the
 * caller can just include "model" in that JSON directly) is also set --
 * there is no host to attach a bare model claim to otherwise.
 */
export function parseMcpCallInvocation(argv, env = process.env) {
  let clientInfoRaw = env.CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO || null;
  const clientName = env.CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME || null;
  const clientModel = env.CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL || null;
  let metaRaw = env.CONCEPT_CLUSTERS_MCP_CALL_META || null;
  let index = 0;

  while (argv[index]?.startsWith("--")) {
    const flag = argv[index++];
    if (flag !== "--client-info" && flag !== "--meta") {
      throw new McpCallInvocationError(`Unknown option: ${flag}`);
    }
    const value = argv[index++];
    if (!value) throw new McpCallInvocationError(`${flag} requires a JSON object.`);
    if (flag === "--client-info") clientInfoRaw = value;
    else metaRaw = value;
  }

  const toolName = argv[index++];
  if (!toolName) throw new McpCallInvocationError("A tool name is required.");
  if (index + 1 < argv.length) {
    throw new McpCallInvocationError("Expected a tool name and at most one JSON arguments object.");
  }
  const argsRaw = argv[index];

  return {
    toolName,
    args: argsRaw ? parseJsonObject(argsRaw, "Tool arguments") : {},
    clientInfo: clientInfoRaw
      ? normalizeClientInfo(clientInfoRaw)
      : clientName
        ? clientInfoFromName(clientName, clientModel)
        : MCP_CALL_FALLBACK_CLIENT_INFO,
    meta: metaRaw ? parseJsonObject(metaRaw, "Call metadata") : null
  };
}
