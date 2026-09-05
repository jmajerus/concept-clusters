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

// Match rules are protocol fingerprints. Client-surface labels are looked up
// by id from modules/authoringHosts.js (same id keys as labels entries).
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
    // The observed terminal/IDE contributor identifies itself as
    // "muse-spark-1.3-contributor · high". Treat that coding surface as
    // Muse Code; generic Muse clients remain a separate canonical surface.
    id: "muse-code",
    match: ({ name }) =>
      name === "muse-code" || /^muse-(?:.+-)?contributor(?:\s*·\s*.+)?$/i.test(name || "")
  },
  {
    id: "muse",
    match: ({ name }) => name === "muse" || /^muse(?:[-/\s]|$)/i.test(name || "")
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

/**
 * Muse's observed contributor client puts model and reasoning in clientInfo
 * rather than separate metadata: "muse-spark-1.3-contributor · high".
 * This is deliberately a narrow parser: unknown Muse names still identify
 * the client surface but do not invent model or reasoning details.
 */
function museContributorDetails(name) {
  const match = typeof name === "string" && name.match(
    /^muse-(.+?)-contributor(?:\s*·\s*(.+))?$/i
  );
  if (!match) return { model: null, reasoning: null };
  const rawModel = match[1].trim();
  const model = rawModel
    ? rawModel.split(/[-_]+/).filter(Boolean).map(part =>
      `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`
    ).join(" ")
    : null;
  return {
    model,
    reasoning: normalizeReasoningLevel(match[2]) || null
  };
}

function labelFor(hostId, settings = AUTHORING_SETTINGS) {
  return authoringHostLabel(hostId, settings) || {
    system: hostId
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
    const museDetails = host.id === "muse-code" ? museContributorDetails(name) : null;
    const model = host.id === "codex"
      ? codexModel(meta)
      : museDetails?.model || null;
    const reasoning = host.id === "codex"
      ? codexReasoning(meta)
      : museDetails?.reasoning || null;
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
 * Upsert two-axis provenance from the MCP call frame -- but only when this
 * call is credit-worthy: role "drafted" (create_puzzle_draft) always is, the
 * one unambiguous moment an MCP client originated a puzzle's content. A role
 * "edited" save (save_puzzle_draft) only auto-credits when the caller passes
 * `substantial: true` -- computed upstream from computeChangeScore /
 * isSubstantialChange (authoringChangeScore.js) against what was previously
 * stored. A trivial edited save (a one-field validation fix, a metadata
 * tweak) is functionally the same act as a human editing the working copy on
 * /admin/drafts, which never auto-credits a contributor either -- so it must
 * not auto-credit the calling MCP client just for having touched the
 * document. A substantial edited save (a real drafting/pedagogy pass) does
 * auto-credit, same as "drafted" -- that is the case automated provenance
 * exists for, so an agent doing real authoring through save_puzzle_draft is
 * never required to hand-write its own provenance.contributors entry to get
 * credit (though it still may, e.g. to name a specific model up front).
 *
 * The audit trail (buildAssistanceStampRecord, D1 draft_assistance_stamps /
 * Analytics Engine) is unaffected by this distinction -- every stamped call
 * is still logged there for internal telemetry regardless of role or
 * substantiality, since that log is not player- or contributor-facing.
 *
 * Legacy generativeAssistance is folded on read/canonicalize and is not
 * re-stamped. Does not touch learningIntroduction.credit (human-owned). Same
 * host updates in place; a different host becomes an additional contributor.
 */
export function stampDocumentAssistanceFromMcp(document, {
  ctx = null,
  server = null,
  role = "edited",
  substantial = false,
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
  let next = base;

  const creditWorthy = role === "drafted" || (role === "edited" && substantial);
  if (creditWorthy) {
    let provenance = upsertGenerativeProvenance(base.provenance, {
      system: identity.system,
      ...(identity.model ? { model: identity.model } : {})
    });
    if (provenance) {
      if (identity.reasoning) {
        provenance = { ...provenance, reasoning: identity.reasoning };
      }
      next = { ...base, provenance };
      delete next.generativeAssistance;
    }
  }

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
      provenance: next.provenance ?? null,
      scopes: assistanceStampScopes(next)
    })
    : null;

  return { document: next, stampRecord };
}
