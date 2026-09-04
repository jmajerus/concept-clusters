// MCP assistance stamp audit — scope/role/date detail formerly in
// generativeAssistance. Provenance on the draft document stays the model of
// record; append-only rows live in D1 (draft_assistance_stamps). Hosted MCP
// may also write a summary row to Analytics Engine.

function compactActor(actor) {
  if (!actor?.subject) return null;
  return { subject: actor.subject };
}

export function assistanceStampScopes(document) {
  const scopes = ["puzzle"];
  if (
    document?.learningIntroduction &&
    typeof document.learningIntroduction === "object" &&
    !Array.isArray(document.learningIntroduction)
  ) {
    scopes.push("learningIntroduction");
  }
  return scopes;
}

export function buildAssistanceStampRecord({
  identity,
  role,
  date,
  draftId = null,
  puzzleId = null,
  tool = null,
  transport = null,
  actor = null,
  provenance = null,
  scopes = ["puzzle"]
}) {
  if (!identity?.system) return null;
  return {
    event: "authoring_assistance_stamp",
    capturedAt: new Date().toISOString(),
    ...(transport ? { transport } : {}),
    ...(tool ? { tool } : {}),
    ...(draftId ? { draftId } : {}),
    ...(puzzleId ? { puzzleId } : {}),
    role,
    date,
    scopes,
    client: {
      system: identity.system,
      ...(identity.model ? { model: identity.model } : {}),
      ...(identity.hostId ? { hostId: identity.hostId } : {}),
      ...(identity.clientName ? { clientName: identity.clientName } : {})
    },
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
      String(record.client?.system || "").slice(0, 128),
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

// Fire-and-forget — must never break an authoring call.
export function persistAuthoringAssistanceStamp(record, {
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
    Promise.resolve(recordStamp(record)).catch(() => {});
  }
  return record;
}
