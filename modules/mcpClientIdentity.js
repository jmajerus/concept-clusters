// Map MCP call-frame identity to generativeAssistance system labels.
// Fingerprints stay here; display labels come from authoringSettings.
import {
  AUTHORING_SETTINGS,
  authoringHostLabel
} from "./authoringSettings.js";
import {
  upsertGenerativeAssistance
} from "./generativeAssistance.js";
import { upsertGenerativeProvenance } from "./authoringProvenance.js";

// Match rules are protocol fingerprints. Labels/providers are looked up by id
// from AUTHORING_SETTINGS.hosts.labels.
const HOST_FINGERPRINTS = Object.freeze([
  {
    id: "cursor",
    match: ({ name }) => name === "cursor-vscode" || /^cursor\b/i.test(name)
  },
  {
    id: "claude-code",
    match: ({ name }) => name === "claude-code" || /^claude-code\b/i.test(name)
  },
  {
    id: "claude",
    match: ({ name }) => name === "Anthropic/ClaudeAI" || /ClaudeAI/i.test(name)
  },
  {
    id: "copilot",
    match: ({ name, meta }) =>
      name === "Visual Studio Code" ||
      (typeof name === "string" && /visual studio code/i.test(name)) ||
      Boolean(meta?.["vscode.conversationId"] || meta?.["vscode.requestId"])
  },
  {
    id: "gemini-cli",
    match: ({ name }) =>
      name === "gemini-cli-mcp-client" || /gemini-cli/i.test(name || "")
  },
  {
    id: "codex",
    match: ({ name, title }) =>
      name === "codex-mcp-client" ||
      title === "Codex" ||
      /^codex\b/i.test(name || "")
  }
]);

function clientInfoFrom(ctx, server) {
  const envelopeInfo =
    ctx?.mcpReq?.envelope?.["io.modelcontextprotocol/clientInfo"] || null;
  const version = typeof server?.server?.getClientVersion === "function"
    ? server.server.getClientVersion()
    : null;
  return envelopeInfo || version || null;
}

function codexModel(meta) {
  const turn = meta?.["x-codex-turn-metadata"];
  const model = typeof turn?.model === "string" ? turn.model.trim() : "";
  return model || null;
}

function labelFor(hostId, settings = AUTHORING_SETTINGS) {
  return authoringHostLabel(hostId, settings) || {
    system: hostId,
    provider: undefined
  };
}

export function identifyMcpAssistanceClient({
  ctx = null,
  server = null,
  settings = AUTHORING_SETTINGS
} = {}) {
  const info = clientInfoFrom(ctx, server);
  const meta = ctx?.mcpReq?._meta || null;
  const name = typeof info?.name === "string" ? info.name.trim() : "";
  const title = typeof info?.title === "string" ? info.title.trim() : "";
  const httpUa = ctx?.http?.req?.headers?.get?.("user-agent") || null;

  for (const host of HOST_FINGERPRINTS) {
    if (!host.match({ name, title, meta, httpUa })) continue;
    const labeled = labelFor(host.id, settings);
    const model = host.id === "codex" ? codexModel(meta) : null;
    const includeModel = settings.hosts?.includeModelInLabel !== false;
    return {
      system: model && includeModel
        ? `${labeled.system} (${model})`
        : labeled.system,
      ...(labeled.provider ? { provider: labeled.provider } : {}),
      ...(model ? { model } : {}),
      hostId: host.id,
      clientName: name || title || null
    };
  }

  // Claude-User without matching clientInfo still maps to Claude web.
  if (httpUa === "Claude-User") {
    const labeled = labelFor("claude", settings);
    return {
      system: labeled.system,
      ...(labeled.provider ? { provider: labeled.provider } : {}),
      hostId: "claude",
      clientName: name || "Claude-User"
    };
  }
  return null;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Upsert generativeAssistance and two-axis provenance from the MCP call frame.
 * Does not touch learningIntroduction.credit (human-owned). Same host updates
 * in place; a different host becomes an additional entry.
 */
export function stampDocumentAssistanceFromMcp(document, {
  ctx = null,
  server = null,
  role = "edited",
  date = todayStamp(),
  settings = AUTHORING_SETTINGS
} = {}) {
  if (!document || typeof document !== "object") return document;
  const identity = identifyMcpAssistanceClient({ ctx, server, settings });
  if (!identity?.system) return document;

  const base = {
    system: identity.system,
    role,
    date,
    ...(identity.provider ? { provider: identity.provider } : {})
  };
  let list = document.generativeAssistance;
  list = upsertGenerativeAssistance(list, { ...base, scope: "puzzle" });
  if (document.learningIntroduction) {
    list = upsertGenerativeAssistance(list, {
      ...base,
      scope: "learningIntroduction"
    });
  }
  const provenance = upsertGenerativeProvenance(document.provenance, {
    system: identity.system
  });
  return {
    ...document,
    generativeAssistance: list,
    ...(provenance ? { provenance } : {})
  };
}
