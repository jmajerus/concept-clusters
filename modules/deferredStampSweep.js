// Replay deferred provenance stamps on drafts nobody writes to again.
//
// A stamp is deferred when provenance-mcp's stamping service cannot be
// reached (mcpClientIdentity.js). A draft's next MCP write replays its
// deferred rows, but a draft created while the service was down and never
// touched again would keep no provenance: an AI-written board defaulting to
// human authorship, the shadow-draft failure mode. This sweep closes that
// gap on the LAN authoring server, at startup and then hourly.
import { AUTHORING_SETTINGS } from "./authoringSettings.js";
import { canonicalizeDocumentProvenance } from "./authoringProvenance.js";
import { buildAssistanceStampRecord } from "./authoringAssistanceLog.js";
import { projectAuthoredDocument } from "./authoringDomains.js";
import { pendingDeferredStamps, replayDeferredStamps } from "./mcpClientIdentity.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { provenanceStampServiceFromEnv } from "./provenanceStampService.js";

const HOUR_MS = 60 * 60 * 1000;

/**
 * One pass over every owner's drafts with unreplayed deferred stamps. The
 * replayed provenance is written as a classification save that keeps the
 * shelf as it is, so it takes the normal revision and history path; a draft
 * whose revision moved underneath is left for its own next write or the next
 * pass. Replay rows are written only after the provenance lands.
 */
export async function sweepDeferredStamps({
  draftRepository,
  stampService,
  settings = AUTHORING_SETTINGS
} = {}) {
  const summary = { drafts: 0, replayed: 0, updated: 0, skipped: 0 };
  if (!stampService || typeof draftRepository?.listDraftsWithDeferredStamps !== "function") {
    return summary;
  }
  const drafts = await draftRepository.listDraftsWithDeferredStamps();
  for (const { draftId, ownerSubject } of drafts) {
    summary.drafts += 1;
    const actor = { subject: ownerSubject };
    try {
      const pending = pendingDeferredStamps(
        await draftRepository.listAssistanceStamps({ draftId, actor })
      );
      if (!pending.length) continue;
      const draft = await draftRepository.get({ draftId, actor });
      const base = canonicalizeDocumentProvenance(draft.document, { settings });
      const replayed = await replayDeferredStamps(base.provenance, pending, {
        stampService,
        recordFor: fields => buildAssistanceStampRecord({
          draftId,
          puzzleId: typeof base.id === "string" ? base.id : null,
          transport: "sweep",
          actor,
          ...fields
        })
      });
      // Still unreachable: stop the pass, the next one tries again.
      if (!replayed.reachable && !replayed.stampRecords.length) break;
      if (JSON.stringify(replayed.provenance ?? null) !== JSON.stringify(base.provenance ?? null)) {
        await draftRepository.saveDomain({
          draftId,
          domain: "classification",
          projection: projectAuthoredDocument(draft.document, "classification").document,
          provenance: replayed.provenance,
          expectedRevision: draft.revision,
          actor
        });
        summary.updated += 1;
      }
      for (const record of replayed.stampRecords) {
        await draftRepository.recordAssistanceStamp({ record, actor });
        summary.replayed += 1;
      }
      if (!replayed.reachable) break;
    } catch (error) {
      summary.skipped += 1;
      console.warn(JSON.stringify({
        message: "deferred stamp replay skipped",
        draftId,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  }
  return summary;
}

export function startDeferredStampSweep({
  repositoryRoot,
  env = process.env,
  enabled = true,
  intervalMs = HOUR_MS
} = {}) {
  if (!enabled) return () => {};
  const stampService = provenanceStampServiceFromEnv(env);
  if (!stampService) return () => {};
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      const { draftRepository } = await resolveLocalAuthoringWorkspace({ repositoryRoot, env });
      const summary = await sweepDeferredStamps({ draftRepository, stampService });
      if (summary.replayed || summary.skipped) {
        console.log(`Deferred stamp sweep: ${JSON.stringify(summary)}`);
      }
    } catch (error) {
      console.error("Deferred stamp sweep failed", error);
    } finally {
      running = false;
    }
  }

  const timer = setInterval(() => {
    tick().catch(error => console.error("Deferred stamp sweep failed", error));
  }, intervalMs);
  timer.unref?.();
  tick().catch(error => console.error("Deferred stamp sweep failed", error));
  return () => clearInterval(timer);
}
