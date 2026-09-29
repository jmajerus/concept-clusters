// Save working/<id>.json through save_puzzle_draft while holding the revision
// lock. The caller edits the puzzle file. This module reads the current
// revision, writes once, and refuses both a missing draft and a stale token.
import { readFile } from "node:fs/promises";
import { authoringWorkspacePaths } from "./authoringWorkspacePaths.js";
import { assertDraftId } from "./draftRepository.js";

const REVISION_CONFLICT =
  /Draft revision conflict: expected (\d+), current revision is (\d+)/;

export class WorkingDraftSaveError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "WorkingDraftSaveError";
    this.code = code;
    Object.assign(this, details);
  }
}

export const SAVE_WORKING_DRAFT_EXIT = Object.freeze({
  usage: 1,
  "invalid-document": 1,
  "document-id-mismatch": 1,
  "missing-draft": 2,
  "revision-conflict": 3,
  "load-failed": 4,
  "save-failed": 4
});

export const SAVE_WORKING_DRAFT_USAGE =
  "Usage: node tools/save-working-draft.mjs [--client-info '<json>'] [--meta '<json>'] [--domain complete|content|pedagogy] [--repair] [--publish-to-authoring] <draft-id>";

function toolErrorMessage(result) {
  if (typeof result?.structured?.error === "string" && result.structured.error) {
    return result.structured.error;
  }
  return result?.message || "MCP call failed";
}

export function parseSaveWorkingDraftArgs(argv) {
  let domain = "complete";
  let repair = false;
  let publishToAuthoring = false;
  let clientInfoRaw = null;
  let metaRaw = null;
  const positionals = [];
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--repair") {
      repair = true;
      continue;
    }
    if (arg === "--publish-to-authoring") {
      publishToAuthoring = true;
      continue;
    }
    if (arg === "--domain" || arg === "--client-info" || arg === "--meta") {
      const value = argv[++index];
      if (!value) throw new WorkingDraftSaveError("usage", `${arg} requires a value. ${SAVE_WORKING_DRAFT_USAGE}`);
      if (arg === "--domain") {
        if (!["complete", "content", "pedagogy"].includes(value)) {
          throw new WorkingDraftSaveError("usage", `--domain must be complete, content, or pedagogy. ${SAVE_WORKING_DRAFT_USAGE}`);
        }
        domain = value;
      } else if (arg === "--client-info") {
        clientInfoRaw = value;
      } else {
        metaRaw = value;
      }
      continue;
    }
    if (arg.startsWith("--")) {
      throw new WorkingDraftSaveError("usage", `Unknown option: ${arg}. ${SAVE_WORKING_DRAFT_USAGE}`);
    }
    positionals.push(arg);
  }
  if (positionals.length !== 1) {
    throw new WorkingDraftSaveError("usage", SAVE_WORKING_DRAFT_USAGE);
  }
  try {
    assertDraftId(positionals[0]);
  } catch (error) {
    throw new WorkingDraftSaveError("usage", `${error.message}. ${SAVE_WORKING_DRAFT_USAGE}`);
  }
  return { draftId: positionals[0], domain, repair, publishToAuthoring, clientInfoRaw, metaRaw };
}

export async function readWorkingDraftDocument(draftId, {
  repositoryRoot,
  env = process.env
} = {}) {
  const path = authoringWorkspacePaths({ repositoryRoot, env }).workingDraftFile(draftId);
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new WorkingDraftSaveError(
        "invalid-document",
        `No working file at ${path}. Write working/${draftId}.json before saving.`
      );
    }
    throw error;
  }
  let document;
  try {
    document = JSON.parse(raw);
  } catch {
    throw new WorkingDraftSaveError("invalid-document", `Working file ${path} is not valid JSON.`);
  }
  if (!document || Array.isArray(document) || typeof document !== "object") {
    throw new WorkingDraftSaveError("invalid-document", `Working file ${path} must contain a JSON object.`);
  }
  return document;
}

export async function saveWorkingDraft({
  draftId,
  document,
  callTool,
  domain = "complete",
  repair = false,
  publishToAuthoring = false
}) {
  assertDraftId(draftId);
  if (!document || Array.isArray(document) || typeof document !== "object") {
    throw new WorkingDraftSaveError("invalid-document", "The working file must contain a JSON object.");
  }
  if (typeof document.id === "string" && document.id !== draftId) {
    throw new WorkingDraftSaveError(
      "document-id-mismatch",
      `Working file id "${document.id}" does not match draft id "${draftId}".`
    );
  }

  const loaded = await callTool("get_puzzle_draft", { draft_id: draftId });
  if (loaded?.isError || loaded?.protocolError) {
    const message = toolErrorMessage(loaded);
    if (message.includes(`Unknown draft: ${draftId}`)) {
      throw new WorkingDraftSaveError(
        "missing-draft",
        `No draft "${draftId}". Call create_puzzle_draft with this document. This helper does not create drafts.`
      );
    }
    throw new WorkingDraftSaveError("load-failed", message);
  }
  const expectedRevision = loaded?.structured?.draft?.revision;
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new WorkingDraftSaveError("load-failed", "get_puzzle_draft did not return a revision.");
  }

  const saveArgs = {
    draft_id: draftId,
    expected_revision: expectedRevision,
    document
  };
  if (domain !== "complete") saveArgs.domain = domain;
  if (repair) saveArgs.repair = true;
  if (publishToAuthoring) saveArgs.publish_to_authoring = true;

  const saved = await callTool("save_puzzle_draft", saveArgs);
  if (saved?.isError || saved?.protocolError) {
    const message = toolErrorMessage(saved);
    const conflict = REVISION_CONFLICT.exec(message);
    if (conflict) {
      throw new WorkingDraftSaveError(
        "revision-conflict",
        `Draft "${draftId}" changed before save. Expected revision ${conflict[1]}, current revision is ${conflict[2]}. Nothing was written. Re-read the draft and merge before saving again.`,
        {
          expectedRevision: Number(conflict[1]),
          currentRevision: Number(conflict[2])
        }
      );
    }
    throw new WorkingDraftSaveError("save-failed", message);
  }

  return {
    ok: true,
    draftId,
    expectedRevision,
    revision: saved?.structured?.draft?.revision ?? null,
    ...(saved?.structured?.repair ? { repair: saved.structured.repair } : {}),
    ...(saved?.structured?.publicationErrors
      ? { publicationErrors: saved.structured.publicationErrors }
      : {}),
    ...(saved?.structured && Object.hasOwn(saved.structured, "published")
      ? { published: saved.structured.published }
      : {})
  };
}
