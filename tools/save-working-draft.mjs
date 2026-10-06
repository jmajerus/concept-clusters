#!/usr/bin/env node
// Save .concept-clusters/authoring/working/<id>.json. Reads the current
// draft revision and calls save_puzzle_draft. A missing draft is not created.
// A revision conflict is reported and nothing is written.
import { MCP_CALL_FALLBACK_CLIENT_INFO, parseMcpCallInvocation } from "../modules/mcpCallInvocation.js";
import { callAuthoringMcpTool } from "../modules/mcpStdioCall.js";
import {
  SAVE_WORKING_DRAFT_EXIT,
  WorkingDraftSaveError,
  missingBaselineMessage,
  parseSaveWorkingDraftArgs,
  readWorkingDraftBaseline,
  readWorkingDraftDocument,
  saveWorkingDraft,
  writeWorkingDraftBaseline
} from "../modules/saveWorkingDraft.js";

const ANONYMOUS_WRITE_WARNING =
  "[save-working-draft] No client identity was forwarded; this write will be credited to an unnamed generative contributor rather than to a named client, model and reasoning. " +
  "Pass the real envelope with --client-info/--meta (or CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME, CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL, CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO, and CONCEPT_CLUSTERS_MCP_CALL_META).";

function exitFor(error) {
  const code = error instanceof WorkingDraftSaveError ? error.code : "save-failed";
  const payload = {
    ok: false,
    code,
    message: error.message,
    ...(Number.isInteger(error.expectedRevision) ? { expectedRevision: error.expectedRevision } : {}),
    ...(Number.isInteger(error.currentRevision) ? { currentRevision: error.currentRevision } : {})
  };
  console.error(error.message);
  console.log(JSON.stringify(payload, null, 2));
  process.exitCode = SAVE_WORKING_DRAFT_EXIT[code] || 1;
}

let args;
try {
  args = parseSaveWorkingDraftArgs(process.argv.slice(2));
} catch (error) {
  exitFor(error);
  process.exit(process.exitCode || 1);
}

const envelopeArgs = [
  ...(args.clientInfoRaw ? ["--client-info", args.clientInfoRaw] : []),
  ...(args.metaRaw ? ["--meta", args.metaRaw] : []),
  "save_puzzle_draft"
];
let envelope;
try {
  envelope = parseMcpCallInvocation(envelopeArgs);
} catch (error) {
  exitFor(new WorkingDraftSaveError("usage", error.message));
  process.exit(process.exitCode || 1);
}

if (
  envelope.clientInfo.name === MCP_CALL_FALLBACK_CLIENT_INFO.name &&
  envelope.clientInfo.version === MCP_CALL_FALLBACK_CLIENT_INFO.version
) {
  console.error(ANONYMOUS_WRITE_WARNING);
}

try {
  const document = await readWorkingDraftDocument(args.draftId);
  const expectedRevision = Number.isInteger(args.expectedRevision)
    ? args.expectedRevision
    : await readWorkingDraftBaseline(args.draftId);
  if (!Number.isInteger(expectedRevision)) {
    throw new WorkingDraftSaveError("missing-baseline", missingBaselineMessage(args.draftId));
  }
  const saved = await saveWorkingDraft({
    draftId: args.draftId,
    document,
    expectedRevision,
    domain: args.domain,
    repair: args.repair,
    callTool: (toolName, toolArgs) => callAuthoringMcpTool({
      toolName,
      args: toolArgs,
      clientInfo: envelope.clientInfo,
      meta: envelope.meta
    })
  });
  if (Number.isInteger(saved.revision)) {
    await writeWorkingDraftBaseline(args.draftId, saved.revision);
  }
  console.error(`Saved ${saved.draftId}; revision ${saved.revision} (expected ${saved.expectedRevision}).`);
  console.log(JSON.stringify(saved, null, 2));
} catch (error) {
  exitFor(error instanceof WorkingDraftSaveError
    ? error
    : new WorkingDraftSaveError("save-failed", error?.message || String(error)));
}
