// In-process record of /mcp on this authoring server. It resets when the
// process restarts. Stdio servers on other machines are not visible here.

const state = {
  accepted: 0,
  rejected: 0,
  lastAccepted: null,
  lastRejected: null
};

function clipLabel(value) {
  if (typeof value !== "string") return null;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  return text || null;
}

export function mcpRejectionReason(status, message = "") {
  if (status === 413) return "body too large";
  if (status === 503) return "Access not configured";
  if (status === 401 && /invalid/i.test(String(message))) return "invalid token";
  if (status === 401) return "no token";
  if (status === 400) return "invalid request";
  return "rejected";
}

// Method and client name only. Tool arguments, tokens, and emails stay out.
export function summarizeMcpBody(body) {
  let parsed;
  try {
    const text = Buffer.isBuffer(body) ? body.toString("utf8") : String(body ?? "");
    parsed = JSON.parse(text);
  } catch {
    return { method: null, client: null };
  }
  const messages = Array.isArray(parsed) ? parsed : [parsed];
  let method = null;
  let client = null;
  for (const message of messages) {
    if (!message || typeof message !== "object") continue;
    const clientName = clipLabel(message.params?.clientInfo?.name);
    if (!client && clientName) client = clientName;
    if (typeof message.method !== "string") continue;
    const tool = message.method === "tools/call" ? clipLabel(message.params?.name) : null;
    const label = tool ? `tools/call ${tool}` : clipLabel(message.method);
    if (message.method === "initialize") {
      method = label;
      if (clientName) client = clientName;
    } else if (!method) {
      method = label;
    }
  }
  return { method, client };
}

export function recordAuthoringMcpAccepted({
  method = null,
  client = null,
  at = new Date().toISOString()
} = {}) {
  state.accepted += 1;
  state.lastAccepted = {
    at,
    method: clipLabel(method),
    client: clipLabel(client)
  };
}

export function recordAuthoringMcpRejected({
  reason,
  at = new Date().toISOString()
} = {}) {
  state.rejected += 1;
  state.lastRejected = {
    at,
    reason: clipLabel(reason) || "rejected"
  };
}

export function authoringMcpHealth(env = process.env) {
  const team = typeof env?.TEAM_DOMAIN === "string" ? env.TEAM_DOMAIN.trim() : "";
  const audience = typeof env?.POLICY_AUD === "string" ? env.POLICY_AUD.trim() : "";
  return {
    accessConfigured: Boolean(team && audience),
    accepted: state.accepted,
    rejected: state.rejected,
    lastAccepted: state.lastAccepted ? { ...state.lastAccepted } : null,
    lastRejected: state.lastRejected ? { ...state.lastRejected } : null
  };
}
