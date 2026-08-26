import { appendFileSync } from "node:fs";
import { join } from "node:path";

export const MCP_CLIENT_PROBE_LOG = ".mcp-client-probes.jsonl";

function compactActor(actor) {
  if (!actor?.subject) return null;
  return {
    subject: actor.subject,
    ...(typeof actor.email === "string" && actor.email.trim()
      ? { email: actor.email.trim() }
      : {}),
    ...(typeof actor.name === "string" && actor.name.trim()
      ? { name: actor.name.trim() }
      : {})
  };
}

function compactHttp(ctx) {
  const req = ctx?.http?.req;
  if (!req?.headers) return null;
  const headers = {};
  for (const name of [
    "user-agent",
    "mcp-protocol-version",
    "x-forwarded-for",
    "cf-access-authenticated-user-email"
  ]) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  return Object.keys(headers).length ? headers : null;
}

export function buildMcpClientProbeRecord({
  transport,
  ctx,
  server,
  actor,
  label = null
}) {
  const lowLevel = server?.server;
  return {
    capturedAt: new Date().toISOString(),
    transport,
    ...(label ? { label } : {}),
    actor: compactActor(actor),
    mcpReq: {
      method: ctx?.mcpReq?.method ?? null,
      envelope: ctx?.mcpReq?.envelope ?? null,
      meta: ctx?.mcpReq?._meta ?? null,
      sessionId: ctx?.sessionId ?? null
    },
    clientVersion: typeof lowLevel?.getClientVersion === "function"
      ? lowLevel.getClientVersion() ?? null
      : null,
    clientCapabilities: typeof lowLevel?.getClientCapabilities === "function"
      ? lowLevel.getClientCapabilities() ?? null
      : null,
    http: compactHttp(ctx)
  };
}

export function emitMcpClientProbe(record, { logRoot = null } = {}) {
  const line = JSON.stringify(record);
  console.error(`[mcp-client-probe] ${line}`);
  if (logRoot) {
    appendFileSync(join(logRoot, MCP_CLIENT_PROBE_LOG), `${line}\n`, "utf8");
  }
  return record;
}
