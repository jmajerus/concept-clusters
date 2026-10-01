// Save working/<id>.json through save_puzzle_draft while holding the revision
// lock. The caller edits the puzzle file and supplies the revision that file
// was based on (--expected-revision, or working/<id>.revision after a prior
// successful save). This module submits that token. It does not adopt the
// draft's current revision, so a stale working file fails closed.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
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
  "missing-baseline": 1,
  "missing-draft": 2,
  "revision-conflict": 3,
  "load-failed": 4,
  "save-failed": 4
});

export const SAVE_WORKING_DRAFT_USAGE =
  "Usage: node tools/save-working-draft.mjs [--client-info '<json>'] [--meta '<json>'] [--domain complete|content|classification|pedagogy] [--repair] [--publish-to-authoring] [--expected-revision <n>] <draft-id>";

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
  let expectedRevision = null;
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
    if (arg === "--domain" || arg === "--client-info" || arg === "--meta" || arg === "--expected-revision") {
      const value = argv[++index];
      if (!value) throw new WorkingDraftSaveError("usage", `${arg} requires a value. ${SAVE_WORKING_DRAFT_USAGE}`);
      if (arg === "--domain") {
        if (!["complete", "content", "classification", "pedagogy"].includes(value)) {
          throw new WorkingDraftSaveError("usage", `--domain must be complete, content, classification, or pedagogy. ${SAVE_WORKING_DRAFT_USAGE}`);
        }
        domain = value;
      } else if (arg === "--expected-revision") {
        if (!/^[1-9]\d*$/.test(value)) {
          throw new WorkingDraftSaveError("usage", `--expected-revision must be a positive integer. ${SAVE_WORKING_DRAFT_USAGE}`);
        }
        expectedRevision = Number(value);
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
  return {
    draftId: positionals[0],
    domain,
    repair,
    publishToAuthoring,
    expectedRevision,
    clientInfoRaw,
    metaRaw
  };
}

export function workingDraftRevisionFile(draftId, {
  repositoryRoot,
  env = process.env
} = {}) {
  assertDraftId(draftId);
  return join(authoringWorkspacePaths({ repositoryRoot, env }).working, `${draftId}.revision`);
}

export async function readWorkingDraftBaseline(draftId, options = {}) {
  const path = workingDraftRevisionFile(draftId, options);
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  const text = raw.trim();
  if (!/^[1-9]\d*$/.test(text)) {
    throw new WorkingDraftSaveError(
      "missing-baseline",
      `Baseline file ${path} must contain the positive integer revision this working file was based on.`
    );
  }
  return Number(text);
}

export async function writeWorkingDraftBaseline(draftId, revision, options = {}) {
  if (!Number.isInteger(revision) || revision < 1) {
    throw new WorkingDraftSaveError("save-failed", "Cannot record a baseline without a positive revision.");
  }
  await writeFile(workingDraftRevisionFile(draftId, options), `${revision}\n`);
}

export function missingBaselineMessage(draftId) {
  return `No baseline revision for "${draftId}". Pass --expected-revision with the draft.revision this working file was based on. Refusing to adopt the current revision.`;
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
  expectedRevision,
  callTool,
  domain = "complete",
  repair = false,
  publishToAuthoring = false
}) {
  assertDraftId(draftId);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new WorkingDraftSaveError("missing-baseline", missingBaselineMessage(draftId));
  }
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
  const currentRevision = loaded?.structured?.draft?.revision;
  if (!Number.isInteger(currentRevision) || currentRevision < 1) {
    throw new WorkingDraftSaveError("load-failed", "get_puzzle_draft did not return a revision.");
  }
  if (currentRevision !== expectedRevision) {
    throw new WorkingDraftSaveError(
      "revision-conflict",
      `Draft "${draftId}" is at revision ${currentRevision}, but this working file is based on revision ${expectedRevision}. Nothing was written. Re-read the draft and merge before saving again.`,
      { expectedRevision, currentRevision }
    );
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
