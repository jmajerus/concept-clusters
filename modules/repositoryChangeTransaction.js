// Shared write/validate/rollback transaction, extracted from three
// independent copies in contentFreezeApply.js and
// repositoryPublicationService.js (the latter had two of its own,
// applyPuzzleImport and applyPuzzleUninstall). See docs/dev-briefs/
// separate-authoring-from-generated-puzzle-artifacts.md.
//
// A change is `{ path, relativePath, content, original, deleted? }`.
// `content === null` means delete. `deleted` is an optional marker a
// caller can set on its own delete entries; revertChanges treats a
// change as delete-only-rollback (unlink, not restore) when either
// `original` was already null (a genuinely new file, nothing to
// restore) OR `deleted` is set -- callers that never set `deleted`
// (repositoryPublicationService.js's callers) get the simpler
// `original == null` rule alone, which is exactly their prior
// behavior; contentFreezeApply.js sets `deleted: true` on its own
// delete entries to preserve its own prior (always-unlink-on-delete)
// rollback behavior exactly. See applyChangesAndValidate's callers for
// which is which -- this file does not judge between them.
import { mkdir, rmdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function applyOneChange(change) {
  if (change.content === null) {
    try {
      await unlink(change.path);
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
    if (change.relativePath?.startsWith("puzzles/") && change.relativePath.endsWith(".js")) {
      await rmdir(dirname(change.path)).catch(() => {});
    }
    return true;
  }
  await mkdir(dirname(change.path), { recursive: true });
  await writeFile(change.path, change.content, "utf8");
  return true;
}

export async function revertChanges(written) {
  for (const change of [...written].reverse()) {
    if (change.original == null || change.deleted) {
      await unlink(change.path).catch(() => {});
    } else {
      await mkdir(dirname(change.path), { recursive: true });
      await writeFile(change.path, change.original, "utf8");
    }
  }
}

export async function applyChangesAndValidate({ changes, validateRepository, repositoryRoot }) {
  const written = [];
  try {
    for (const change of changes) {
      if (await applyOneChange(change)) written.push(change);
    }
    await validateRepository(repositoryRoot);
  } catch (error) {
    await revertChanges(written);
    throw error;
  }
  return written;
}
