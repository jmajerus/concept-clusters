// Client for provenance-mcp's stamping service (POST /api/stamp, and
// POST /api/identify for a lookup that writes no stamp).
//
// provenance-mcp owns client identification (the generative-systems match
// table) and the contributor upsert. Concept Clusters keeps its own credit
// policy (creditWorthy), the draft_assistance_stamps audit, and the editors.
// See provenance-mcp docs/DESIGN.md, "Stamping service".
//
// Only the LAN authoring server makes this call: the public Worker answers
// 410 at /mcp, so MCP always terminates on the LAN.

export const DEFAULT_PROVENANCE_STAMP_URL =
  "http://provenance-mcp.localdomain:8000/api/stamp";
export const PROVENANCE_STAMP_APP = "concept-clusters";
const DEFAULT_TIMEOUT_MS = 2000;
// Codex puts its model and reasoning effort here. The service reads no other
// _meta value, so no other value is sent.
const CODEX_TURN_METADATA = "x-codex-turn-metadata";

function text(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

export function mcpClientInfo(ctx, server) {
  const envelopeInfo =
    ctx?.mcpReq?.envelope?.["io.modelcontextprotocol/clientInfo"] || null;
  const version = typeof server?.server?.getClientVersion === "function"
    ? server.server.getClientVersion()
    : null;
  return envelopeInfo || version || null;
}

/**
 * The client-describing part of an MCP call, as the service's Frame type
 * expects it. Never carries the user: no Access subject, email, session id,
 * IP, or request content.
 */
export function buildStampFrame({ ctx = null, server = null, actor = null } = {}) {
  const info = plainObject(mcpClientInfo(ctx, server));
  const meta = plainObject(ctx?.mcpReq?._meta);
  const userAgent = text(ctx?.http?.req?.headers?.get?.("user-agent"));
  const turn = plainObject(meta?.[CODEX_TURN_METADATA]);
  const oauth = plainObject(actor?.oauth);
  const clientInfo = info
    ? Object.fromEntries(
      ["name", "title", "version", "model"]
        .map(key => [key, text(info[key])])
        .filter(([, value]) => value)
    )
    : null;
  return {
    ...(clientInfo && Object.keys(clientInfo).length ? { clientInfo } : {}),
    ...(userAgent ? { userAgent } : {}),
    ...(meta ? { metaKeys: Object.keys(meta) } : {}),
    ...(turn ? { meta: { [CODEX_TURN_METADATA]: turn } } : {}),
    ...(oauth && (text(oauth.clientId) || text(oauth.redirectUri))
      ? {
        oauth: {
          ...(text(oauth.clientId) ? { clientId: text(oauth.clientId) } : {}),
          ...(text(oauth.redirectUri) ? { redirectUri: text(oauth.redirectUri) } : {})
        }
      }
      : {})
  };
}

/** What the client called itself, from a frame, for an audit row the service never saw. */
export function frameClientName(frame) {
  return text(frame?.clientInfo?.name) || text(frame?.clientInfo?.title) ||
    text(frame?.userAgent);
}

export function createProvenanceStampService({
  url = DEFAULT_PROVENANCE_STAMP_URL,
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetch is required");
  const identifyUrl = new URL("./identify", url).href;
  async function post(target, body) {
    const response = await fetchImpl(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) {
      throw new Error(`provenance stamp service answered ${response.status}`);
    }
    return response.json();
  }
  return {
    url,
    identifyUrl,
    // Who the frame is, with no provenance and no stamp row. An unrecognized
    // name still reaches the service's sightings queue.
    async identify({ frame = {} } = {}) {
      const result = await post(identifyUrl, { frame });
      if (!plainObject(result?.client)) {
        throw new Error("provenance identify returned no client");
      }
      return result;
    },
    async stamp({ tool = null, creditWorthy, provenance = null, frame = {} }) {
      const result = await post(url, {
        app: PROVENANCE_STAMP_APP,
        ...(tool ? { tool } : {}),
        creditWorthy: Boolean(creditWorthy),
        mixedDefault: "aiPrimary",
        modelForm: "label",
        provenance: plainObject(provenance),
        frame
      });
      if (!plainObject(result?.client) || !plainObject(result?.provenance)) {
        throw new Error("provenance stamp service returned no client or provenance");
      }
      return result;
    }
  };
}

/**
 * The LAN server's stamping client. PROVENANCE_STAMP_URL overrides the
 * service address; "off" turns stamping off, so every write is deferred.
 */
export function provenanceStampServiceFromEnv(env = process.env, { fetch: fetchImpl } = {}) {
  const configured = text(env?.PROVENANCE_STAMP_URL);
  if (configured === "off") return null;
  return createProvenanceStampService({
    url: configured || DEFAULT_PROVENANCE_STAMP_URL,
    ...(fetchImpl ? { fetch: fetchImpl } : {})
  });
}
