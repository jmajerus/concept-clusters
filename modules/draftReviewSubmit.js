// Shared POST contract for /admin/drafts/<id>. The page is the design-copy
// review surface. Publish writes the shared D1 document. LAN Play overlays
// the D1 draft in the player without writing the working tree. Nothing but
// Admin Freeze writes the checkout -- puzzle drafts show no Export, Install,
// Uninstall, or per-puzzle pull-request action; that path was retired once
// D1 Publish + Cue + Freeze covered a single puzzle's path to production too.

import {
  CUE_FOR_FREEZE_CONFIRM,
  HOLD_FROM_FREEZE_CONFIRM,
  parseFreezeCueConfirm
} from "./contentFreezePlan.js";
import {
  REVERT_FIELD_CONFIRM,
  SAVE_CANONICAL_CONFIRM,
  SAVE_FIELD_CONFIRM,
  SAVE_WORKING_COPY_CONFIRM
} from "./draftReviewEdit.js";

export const PUBLISH_CONFIRM = "publish";
export const REVERT_PUBLISHED_CONFIRM = "revert-published";
export const REVERT_WORKING_COPY_CONFIRM = "revert-working-copy";
export const UNPUBLISH_CONFIRM = "unpublish";
export const DELETE_DRAFT_CONFIRM = "delete-draft";
export { CUE_FOR_FREEZE_CONFIRM, HOLD_FROM_FREEZE_CONFIRM };
export { SAVE_FIELD_CONFIRM, SAVE_WORKING_COPY_CONFIRM, REVERT_FIELD_CONFIRM, SAVE_CANONICAL_CONFIRM };

export function isSameOriginRequest({ origin, referer, host } = {}) {
  const expected = String(host || "").toLowerCase();
  if (!expected) return false;
  const candidate = origin || referer;
  if (!candidate) return false;
  try {
    return new URL(candidate).host.toLowerCase() === expected;
  } catch {
    return false;
  }
}

export function parseSubmitForm(params) {
  const confirm = params.get("confirm");
  return {
    confirm,
    replace: params.get("replace") === "1",
    isPublish: confirm === PUBLISH_CONFIRM,
    isRevertPublished: confirm === REVERT_PUBLISHED_CONFIRM,
    isRevertWorkingCopy: confirm === REVERT_WORKING_COPY_CONFIRM,
    isUnpublish: confirm === UNPUBLISH_CONFIRM,
    isDeleteDraft: confirm === DELETE_DRAFT_CONFIRM,
    isCueForFreeze: parseFreezeCueConfirm(confirm) === true,
    isHoldFromFreeze: parseFreezeCueConfirm(confirm) === false,
    isSaveField: confirm === SAVE_FIELD_CONFIRM,
    isSaveWorkingCopy: confirm === SAVE_WORKING_COPY_CONFIRM,
    isRevertField: confirm === REVERT_FIELD_CONFIRM,
    isSaveCanonical: confirm === SAVE_CANONICAL_CONFIRM
  };
}

export async function readNodeUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}
