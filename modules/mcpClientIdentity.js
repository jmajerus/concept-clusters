// Stamp a draft's provenance from the MCP call frame.
//
// provenance-mcp's stamping service identifies the client and upserts the
// contributor (provenanceStampService.js). This module keeps what is Concept
// Clusters' own: which calls earn credit, the frame it sends, and the
// draft_assistance_stamps audit, including stamps deferred while the service
// is unreachable.
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { CREDITED_WRITE_DOMAINS } from "./authoringChangeScore.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";
import {
  assistanceStampScopes,
  buildAssistanceStampRecord
} from "./authoringAssistanceLog.js";
import {
  buildStampFrame,
  frameClientName,
  mcpClientInfo
} from "./provenanceStampService.js";

/**
 * The raw client label a host presented, for the audit trail only. A write
 * with no attribution at all is worse than one attributed to "something we
 * did not recognize": before unidentified rows existed, an unrecognized
 * client could create drafts leaving no stamp, which is why the shadow-draft
 * incident could not be attributed afterwards. See
 * docs/dev-briefs/shadow-draft-incident-postmortem.md.
 */
export function observedMcpClientLabel({ ctx = null, server = null } = {}) {
  const info = mcpClientInfo(ctx, server);
  const name = typeof info?.name === "string" ? info.name.trim() : "";
  const title = typeof info?.title === "string" ? info.title.trim() : "";
  const httpUa = ctx?.http?.req?.headers?.get?.("user-agent") || null;
  return name || title || (typeof httpUa === "string" && httpUa.trim()
    ? httpUa.trim()
    : null);
}

/**
 * Concept Clusters' credit policy. Role "drafted" (create_puzzle_draft)
 * always earns credit: it is the one unambiguous moment an MCP client
 * originated a puzzle's content. Role "edited" (save_puzzle_draft) earns it
 * only for a substantial change -- computed upstream from computeChangeScore /
 * isSubstantialChange (authoringChangeScore.js) against what was stored --
 * confined to a credited write domain. A trivial save (a one-field fix, a
 * metadata tweak) is the same act as a human editing the working copy on
 * /admin/drafts, which never credits a contributor; a classification or
 * administration save never does, whatever the caller scored.
 */
export function isCreditWorthyStamp({ role = "edited", substantial = false, domain = "complete" } = {}) {
  const creditedDomain = domain === "complete" || CREDITED_WRITE_DOMAINS.includes(domain);
  return role === "drafted" || (role === "edited" && substantial === true && creditedDomain);
}

/**
 * Deferred stamps on a draft that no later row has replayed, oldest first.
 * Takes the draft repository's listAssistanceStamps output.
 */
export function pendingDeferredStamps(stamps = []) {
  const rows = Array.isArray(stamps) ? stamps : [];
  const replayed = new Set(rows.map(row => row?.replayOf).filter(Boolean));
  return rows.filter(row =>
    row?.deferred && typeof row.stampId === "string" && !replayed.has(row.stampId)
  );
}

function clientFromService(client) {
  if (!client || typeof client !== "object") return null;
  if (!client.system) {
    return { unidentified: true, clientName: client.clientName ?? null };
  }
  return {
    system: client.system,
    ...(client.matched ? { hostId: client.matched } : {}),
    ...(client.via ? { via: client.via } : {}),
    ...(client.model ? { model: client.model } : {}),
    ...(client.reasoning ? { reasoning: client.reasoning } : {}),
    ...(client.clientName ? { clientName: client.clientName } : {})
  };
}

async function callService(stampService, request) {
  if (!stampService || typeof stampService.stamp !== "function") return null;
  try {
    return await stampService.stamp(request);
  } catch (error) {
    console.warn(JSON.stringify({
      message: "provenance stamp deferred",
      tool: request.tool ?? null,
      error: error instanceof Error ? error.message : String(error)
    }));
    return null;
  }
}

/**
 * Who called, as the service identifies the frame, without touching any
 * provenance. For audit rows that are not a draft write (agent reviews).
 * Null when the service is unreachable.
 */
export async function identifyMcpClientViaService({
  ctx = null,
  server = null,
  actor = null,
  tool = null,
  stampService = null
} = {}) {
  const result = await callService(stampService, {
    tool,
    creditWorthy: false,
    provenance: null,
    frame: buildStampFrame({ ctx, server, actor })
  });
  return result ? clientFromService(result.client) : null;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Stamp one MCP write. Returns the document to store and the audit rows to
 * persist once the write lands (`stampRecords`, the current call's last).
 *
 * Whether the call earns credit is decided here (isCreditWorthyStamp); the
 * service only identifies the client and upserts the contributor. Its
 * returned provenance is stored as is.
 *
 * If the service fails or times out, provenance stays as it was and the call
 * is recorded as a deferred row carrying its filtered frame. Never "generative
 * assistance" as a fallback. Deferred rows passed in `pendingStamps` (this
 * draft's, from pendingDeferredStamps) are replayed first, oldest first, so a
 * draft catches up on its next write once the service is back. A stamp never
 * fails the authoring call.
 */
export async function stampDocumentAssistanceFromMcp(document, {
  ctx = null,
  server = null,
  actor = null,
  role = "edited",
  substantial = false,
  domain = "complete",
  date = todayStamp(),
  settings = AUTHORING_SETTINGS,
  log = null,
  stampService = null,
  pendingStamps = []
} = {}) {
  if (!document || typeof document !== "object") {
    return { document, stampRecord: null, stampRecords: [] };
  }
  const base = canonicalizeDocumentProvenance(document, { settings });
  let provenance = base.provenance ?? null;
  const stampRecords = [];
  const recordFor = (fields) => log
    ? buildAssistanceStampRecord({
      draftId: log.draftId ?? null,
      puzzleId: log.puzzleId ?? (typeof base.id === "string" ? base.id : null),
      tool: log.tool ?? null,
      transport: log.transport ?? null,
      actor: log.actor ?? null,
      ...fields
    })
    : null;

  let reachable = Boolean(stampService);
  for (const pending of pendingStamps) {
    if (!reachable) break;
    const result = await callService(stampService, {
      tool: pending.tool ?? null,
      creditWorthy: pending.deferred?.creditWorthy === true,
      provenance,
      frame: pending.deferred?.frame || {}
    });
    if (!result) {
      reachable = false;
      break;
    }
    if (result.changed !== false) provenance = result.provenance;
    const replay = recordFor({
      client: clientFromService(result.client),
      role: pending.role ?? "edited",
      date: pending.date ?? date,
      tool: pending.tool ?? null,
      replayOf: pending.stampId,
      provenance,
      scopes: Array.isArray(pending.scopes) ? pending.scopes : ["puzzle"]
    });
    if (replay) stampRecords.push(replay);
  }

  const creditWorthy = isCreditWorthyStamp({ role, substantial, domain });
  const frame = buildStampFrame({ ctx, server, actor });
  const result = reachable
    ? await callService(stampService, {
      tool: log?.tool ?? null,
      creditWorthy,
      provenance,
      frame
    })
    : null;
  // "changed: false" keeps CC's own copy, so a draft with no provenance does
  // not gain an empty one.
  if (result && result.changed !== false) provenance = result.provenance;

  const next = provenance ? { ...base, provenance } : base;
  const stampRecord = recordFor({
    client: result
      ? clientFromService(result.client)
      : {
        unidentified: true,
        clientName: frameClientName(frame) || observedMcpClientLabel({ ctx, server })
      },
    ...(result ? {} : { deferred: { creditWorthy, frame } }),
    role,
    date,
    provenance: next.provenance ?? null,
    scopes: assistanceStampScopes(next, { domain })
  });
  if (stampRecord) stampRecords.push(stampRecord);
  return { document: next, stampRecord, stampRecords };
}
