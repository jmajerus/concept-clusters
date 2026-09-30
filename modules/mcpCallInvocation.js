// Parse the one-shot MCP helper invocation without making the helper pretend
// to be the client that launched it. A caller may explicitly forward its
// original clientInfo and call _meta; otherwise the helper remains mcp-call.
// Two host-surface exceptions identify the launcher without a forwarded
// envelope, and neither claims a model or per-call metadata: Kilo Code's
// VS Code backend markers, and Codex's shell-tool thread id. Arbitrary
// environment names are never inferred.

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
 * Kilo's VS Code backend marks child processes with a product marker and one
 * of its transport markers. Keep this check shared with authoring planners so
 * they choose the same native-vs-fallback behavior as the helper.
 */
export function isKiloCodeEnvironment(env = process.env) {
  const appName = String(env.KILO_APP_NAME || "").trim().toLowerCase();
  const feature = String(env.KILOCODE_FEATURE || "").trim().toLowerCase();
  const client = String(env.KILO_CLIENT || "").trim().toLowerCase();

  return appName === "kilo-code" &&
    (feature === "vscode-extension" || client === "vscode");
}

function clientInfoFromKiloEnvironment(env) {
  if (!isKiloCodeEnvironment(env)) return null;

  const version = String(
    env.KILO_APP_VERSION || env.KILOCODE_VERSION || ""
  ).trim();
  return { name: "kilo", version: version || "unknown" };
}

/**
 * Codex injects CODEX_THREAD_ID into every model-reachable shell command.
 * A UUID is the thread id it actually writes; a bare or arbitrary value is
 * not treated as Codex. This is a surface-only fallback: no model and no
 * turn metadata. Native MCP calls and an explicit forwarded envelope still
 * win, and they are the only path that can carry the model.
 */
export function isCodexEnvironment(env = process.env) {
  const threadId = String(env.CODEX_THREAD_ID || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(threadId);
}

function clientInfoFromCodexEnvironment(env) {
  if (!isCodexEnvironment(env)) return null;
  return { name: "codex-mcp-client", title: "Codex", version: "unknown" };
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
 * there is no host to attach a bare model claim to otherwise. If no explicit
 * forwarding is supplied, Kilo's process markers and Codex's shell thread id
 * are recognized as surface-only fallbacks; arbitrary environment names are
 * never inferred.
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
  const explicitClientInfo = clientInfoRaw
    ? normalizeClientInfo(clientInfoRaw)
    : clientName
      ? clientInfoFromName(clientName, clientModel)
      : null;
  const kiloClientInfo = explicitClientInfo ? null : clientInfoFromKiloEnvironment(env);
  const codexClientInfo = explicitClientInfo || kiloClientInfo
    ? null
    : clientInfoFromCodexEnvironment(env);

  return {
    toolName,
    args: argsRaw ? parseJsonObject(argsRaw, "Tool arguments") : {},
    clientInfo: explicitClientInfo || kiloClientInfo || codexClientInfo || MCP_CALL_FALLBACK_CLIENT_INFO,
    meta: metaRaw ? parseJsonObject(metaRaw, "Call metadata") : null
  };
}
