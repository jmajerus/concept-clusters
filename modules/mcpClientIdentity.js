// Map MCP call-frame identity to provenance contributor labels.
// Fingerprints stay here; display labels come from authoringHosts.js.
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { authoringHostLabel } from "./authoringHosts.js";
import {
  upsertGenerativeProvenance,
  canonicalizeDocumentProvenance,
  formatGenerativeContributorLabel,
  normalizeReasoningLevel
} from "./authoringProvenance.js";
import {
  assistanceStampScopes,
  buildAssistanceStampRecord
} from "./authoringAssistanceLog.js";

// Match rules are protocol fingerprints. Labels/providers are looked up by id
// from modules/authoringHosts.js (same id keys as labels entries).
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

function codexReasoning(meta) {
  return normalizeReasoningLevel(meta?.["x-codex-turn-metadata"]?.reasoning_effort) || null;
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
    const reasoning = host.id === "codex" ? codexReasoning(meta) : null;
    return {
      system: formatGenerativeContributorLabel(labeled.system, model, settings),
      ...(model ? { model } : {}),
      ...(reasoning ? { reasoning } : {}),
      hostId: host.id,
      clientName: name || title || null
    };
  }

  // Claude-User without matching clientInfo still maps to Claude web.
  if (httpUa === "Claude-User") {
    const labeled = labelFor("claude", settings);
    return {
      system: labeled.system,
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
 * Upsert two-axis provenance from the MCP call frame. Legacy
 * generativeAssistance is folded on read/canonicalize and is not re-stamped.
 * Does not touch learningIntroduction.credit (human-owned). Same host updates
 * in place; a different host becomes an additional contributor.
 */
export function stampDocumentAssistanceFromMcp(document, {
  ctx = null,
  server = null,
  role = "edited",
  date = todayStamp(),
  settings = AUTHORING_SETTINGS,
  log = null
} = {}) {
  if (!document || typeof document !== "object") {
    return { document, stampRecord: null };
  }
  const identity = identifyMcpAssistanceClient({ ctx, server, settings });
  if (!identity?.system) return { document, stampRecord: null };

  const base = canonicalizeDocumentProvenance(document, { settings });
  let provenance = upsertGenerativeProvenance(base.provenance, {
    system: identity.system,
    ...(identity.model ? { model: identity.model } : {})
  });
  if (!provenance) return { document: base, stampRecord: null };

  if (identity.reasoning) {
    provenance = { ...provenance, reasoning: identity.reasoning };
  }

  const next = { ...base, provenance };
  delete next.generativeAssistance;

  const stampRecord = log
    ? buildAssistanceStampRecord({
      identity,
      role,
      date,
      draftId: log.draftId ?? null,
      puzzleId: log.puzzleId ??
        (typeof next.id === "string" ? next.id : null),
      tool: log.tool ?? null,
      transport: log.transport ?? null,
      actor: log.actor ?? null,
      provenance,
      scopes: assistanceStampScopes(next)
    })
    : null;

  return { document: next, stampRecord };
}
