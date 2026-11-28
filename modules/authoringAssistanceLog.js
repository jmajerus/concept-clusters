// MCP assistance stamp audit — scope/role/date detail formerly in
// older attribution arrays. Provenance on the draft document stays the model
// of record; append-only rows live in D1 (draft_assistance_stamps). Hosted MCP
// may also write a summary row to Analytics Engine.

import { AUTHORING_WRITE_DOMAINS } from "./authoringFieldOwnership.js";

function compactActor(actor) {
  if (!actor?.subject) return null;
  return { subject: actor.subject };
}

export function assistanceStampScopes(document, { domain = "complete" } = {}) {
  const scopes = AUTHORING_WRITE_DOMAINS.includes(domain)
    ? [domain]
    : ["puzzle"];
  if (domain === "complete" &&
    document?.learningIntroduction &&
    typeof document.learningIntroduction === "object" &&
    !Array.isArray(document.learningIntroduction)
  ) {
    scopes.push("learningIntroduction");
  }
  return scopes;
}

// `client` is what provenance-mcp's stamping service identified: { system
// (generative-systems slug), hostId (the slug matched before the Claude-family
// rule), via, model, reasoning, clientName }, or { unidentified, clientName }.
// A deferred stamp (service unreachable) carries `deferred: { creditWorthy,
// frame }` for replay; the row that later replays it carries `replayOf`.
export function buildAssistanceStampRecord({
  client,
  role,
  date,
  draftId = null,
  puzzleId = null,
  tool = null,
  transport = null,
  actor = null,
  provenance = null,
  scopes = ["puzzle"],
  deferred = null,
  replayOf = null
}) {
  // An unidentified client still gets a row: no system, no provenance credit,
  // but a durable record that something wrote here and what it called itself.
  if (!client?.system && client?.unidentified !== true) return null;
  return {
    event: "authoring_assistance_stamp",
    stampId: crypto.randomUUID(),
    capturedAt: new Date().toISOString(),
    ...(transport ? { transport } : {}),
    ...(tool ? { tool } : {}),
    ...(draftId ? { draftId } : {}),
    ...(puzzleId ? { puzzleId } : {}),
    role,
    date,
    scopes,
    client: client.system
      ? {
        system: client.system,
        ...(client.hostId ? { hostId: client.hostId } : {}),
        ...(client.via ? { via: client.via } : {}),
        ...(client.model ? { model: client.model } : {}),
        ...(client.reasoning ? { reasoning: client.reasoning } : {}),
        ...(client.clientName ? { clientName: client.clientName } : {})
      }
      : {
        unidentified: true,
        ...(client.clientName ? { clientName: client.clientName } : {})
      },
    ...(deferred ? { deferred } : {}),
    ...(replayOf ? { replayOf } : {}),
    ...(provenance?.collaboration
      ? { provenance: { collaboration: provenance.collaboration } }
      : {}),
    ...(compactActor(actor) ? { actor: compactActor(actor) } : {})
  };
}

export function assistanceStampAnalyticsDataPoint(record) {
  const draftId = String(record.draftId || record.puzzleId || "unknown").slice(0, 64);
  return {
    blobs: [
      "authoring_assistance_stamp",
      String(record.tool || "").slice(0, 64),
      String(record.client?.system
        || (record.deferred ? "deferred" : "")
        || (record.client?.unidentified ? "unidentified" : "")).slice(0, 128),
      String(record.role || "").slice(0, 16),
      (record.scopes || []).join(",").slice(0, 128),
      String(record.date || "").slice(0, 16)
    ],
    doubles: [1],
    indexes: [draftId]
  };
}

export function createMcpStampContext({
  analytics = null,
  transport = null,
  actor = null
} = {}) {
  return function stampLog(tool, draftId, document) {
    return {
      tool,
      draftId: draftId || (typeof document?.id === "string" ? document.id : null),
      puzzleId: typeof document?.id === "string" ? document.id : null,
      analytics,
      transport,
      actor
    };
  };
}

// The document write has already succeeded. The audit row must finish before
// the handler returns: tools/mcp-call.mjs exits as soon as it prints the
// result, and a detached insert is killed with that process. A stamp failure
// still must not fail the authoring call.
export async function persistAuthoringAssistanceStamp(record, {
  analytics = null,
  recordStamp = null
} = {}) {
  if (!record) return null;
  try {
    analytics?.writeDataPoint(assistanceStampAnalyticsDataPoint(record));
  } catch {
    // Ignore — see hostedMcpAuthoringServer track() comment.
  }
  if (typeof recordStamp === "function") {
    try {
      await recordStamp(record);
    } catch {
      // Ignore — attribution on the document already landed.
    }
  }
  return record;
}
