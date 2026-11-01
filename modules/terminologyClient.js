// Thin client for terminology-mcp's REST API on the LAN: the scheme
// snapshot, the numbered changelog, and subscriber progress reports
// (terminology-mcp docs/following-changes.md). LAN requests are
// unauthenticated, so this never sends credentials. Runtime-neutral: fetch
// only.

export const DEFAULT_TERMINOLOGY_BASE = "http://terminology-mcp.localdomain:8000";
export const SUBJECTS_SCHEME_ID = "cc-subjects";
export const SUBSCRIBER_ID = "concept-clusters";

// TERMINOLOGY_BASE=off turns the client off; unset means the LAN server.
export function terminologyConfig(env = {}) {
  const raw = typeof env.TERMINOLOGY_BASE === "string" ? env.TERMINOLOGY_BASE.trim() : "";
  if (raw.toLowerCase() === "off") return null;
  const timeout = Number(env.TERMINOLOGY_TIMEOUT_MS);
  return {
    baseUrl: (raw || DEFAULT_TERMINOLOGY_BASE).replace(/\/+$/, ""),
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000
  };
}

export class TerminologyError extends Error {
  constructor(status, message, body = null) {
    super(message);
    this.name = "TerminologyError";
    // 0 when the server could not be reached.
    this.status = status;
    this.body = body;
  }
}

export function createTerminologyClient({ baseUrl, timeoutMs = 10_000, fetchImpl = fetch }) {
  async function request(method, path, payload) {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: payload === undefined ? {} : { "Content-Type": "application/json" },
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch (error) {
      throw new TerminologyError(0, `terminology-mcp unreachable at ${baseUrl}: ${error?.message || error}`);
    }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body?.error || body?.message || "";
      throw new TerminologyError(
        response.status,
        `terminology-mcp ${method} ${path.split("?")[0]} answered ${response.status}${detail ? `: ${detail}` : ""}`,
        body
      );
    }
    return body;
  }
  const scheme = encodeURIComponent(SUBJECTS_SCHEME_ID);
  return {
    baseUrl,
    state: () => request("GET", `/api/state?scheme=${scheme}`),
    changes: since => request("GET", `/api/changes?since=${since}&scheme=${scheme}`),
    reportProgress: report => request("POST", `/api/subscribers/${SUBSCRIBER_ID}/progress`, report)
  };
}
