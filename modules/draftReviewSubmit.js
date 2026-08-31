// Shared POST contract for /admin/drafts/<id>. The page is the design-copy
// review surface. Local checkout install is LAN gameplay staging. Opening a
// GitHub PR is the production ship path; Cloudflare serves production after
// merge. MCP submit/install tools remain for catalogue extras and for
// clients that are not looking at this page.

import { stagingPlayItems } from "./stagingPlayLinks.js";
import {
  REVERT_FIELD_CONFIRM,
  SAVE_CANONICAL_CONFIRM,
  SAVE_FIELD_CONFIRM
} from "./draftReviewEdit.js";

export const SUBMIT_CONFIRM = "open-pull-request";
export const INSTALL_CONFIRM = "install-checkout";
export const INSTALL_AND_PLAY_CONFIRM = "install-and-play";
export const UNINSTALL_CONFIRM = "uninstall-checkout";
export { SAVE_FIELD_CONFIRM, REVERT_FIELD_CONFIRM, SAVE_CANONICAL_CONFIRM };

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
    isSubmit: confirm === SUBMIT_CONFIRM,
    isInstall: confirm === INSTALL_CONFIRM || confirm === INSTALL_AND_PLAY_CONFIRM,
    isInstallAndPlay: confirm === INSTALL_AND_PLAY_CONFIRM,
    isUninstall: confirm === UNINSTALL_CONFIRM,
    isSaveField: confirm === SAVE_FIELD_CONFIRM,
    isRevertField: confirm === REVERT_FIELD_CONFIRM,
    isSaveCanonical: confirm === SAVE_CANONICAL_CONFIRM
  };
}

export async function readNodeUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function actionResultShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
    .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
    .validation-ok { background: #dcfce7; }
    .validation-fail { background: #fee2e2; white-space: pre-wrap; }
    .meta { color: #666; font-size: 14px; }
    a { color: #2563eb; }
    .play a + a::before { content: " · "; color: #666; }
    button { font: inherit; padding: 8px 14px; border-radius: 6px; border: 0; background: #2563eb; color: #fff; cursor: pointer; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function stagingPlayLinksHtml(puzzleId) {
  const items = stagingPlayItems(puzzleId);
  if (!items.length) return "";
  const links = items.map(([label, href]) =>
    `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
  ).join("");
  return `<p class="play">${links}</p>`;
}

export function submitOutcomeCopy(publication) {
  const number = publication?.githubPrNumber;
  const url = publication?.githubPrUrl;
  const label = number ? `#${number}` : "pull request";
  const link = url
    ? `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`
    : escapeHtml(label);
  const outcome = publication?.submissionOutcome;
  if (outcome === "amended") return `Updated pull request ${link} with a new commit.`;
  if (outcome === "unchanged") {
    return `Pull request ${link} already reflects this draft; nothing to push.`;
  }
  return `Opened pull request ${link}.`;
}

/** @param {{ draftId?: string, publication?: any, error?: string | null }} [opts] */
export function renderDraftSubmitResultPage({
  draftId,
  publication = null,
  error = null
} = {}) {
  const title = error ? "Could not open pull request" : "Pull request";
  const body = error
    ? `<h1>Could not open pull request</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>
       <p class="meta">If the puzzle id already exists on GitHub, retry as
       an update to those files. Catalogue membership still uses the MCP
       submit tool.</p>
       <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
         <input type="hidden" name="replace" value="1">
         <p><button type="submit" name="confirm" value="open-pull-request">Retry as an update</button></p>
       </form>`
    : `<h1>Pull request</h1>
       <p class="validation validation-ok">${submitOutcomeCopy(publication)}</p>
       <p>That opened a production ship path on GitHub. Play unpublished
       boards with <strong>Install in this checkout</strong> on the LAN
       authoring server, not on Cloudflare. Merging stays a separate
       action in GitHub.</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>`;
  return actionResultShell(title, body);
}

function installOutcomeCopy(result) {
  const id = result?.puzzleId || "puzzle";
  const action = result?.action || "install";
  const paths = Array.isArray(result?.affectedPaths) && result.affectedPaths.length
    ? ` Wrote ${result.affectedPaths.map(escapeHtml).join(", ")}.`
    : "";
  return `Installed ${escapeHtml(id)} (${escapeHtml(action)}).${paths}`;
}

export function renderDraftInstallResultPage({
  draftId,
  result = null,
  error = null
} = {}) {
  const title = error ? "Could not install puzzle" : "Installed in this checkout";
  const body = error
    ? `<h1>Could not install puzzle</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>
       <p class="meta">If the puzzle id already exists in this checkout, retry
       as an update to those files. Catalogue membership still uses the MCP
       install tool.</p>
       <form method="post" action="/admin/drafts/${encodeURIComponent(draftId)}">
         <input type="hidden" name="replace" value="1">
         <p><button type="submit" name="confirm" value="install-checkout">Retry as an update</button></p>
       </form>`
    : `<h1>Installed in this checkout</h1>
       <p class="validation validation-ok">${installOutcomeCopy(result)}</p>
       <p>This is LAN staging. It did not open a pull request and did not
       write GitHub. Open a pull request only when the board is ready to
       ship to production.</p>
       ${stagingPlayLinksHtml(result?.puzzleId)}
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>`;
  return actionResultShell(title, body);
}

export async function installDraftFromReview({
  installDraft,
  draftId,
  replace = false
}) {
  if (typeof installDraft !== "function") {
    const error = new Error(
      "Checkout install is not available on this drafts server."
    );
    error.code = "ERR_INSTALL_UNAVAILABLE";
    throw error;
  }
  return installDraft({ draftId, replace });
}

function uninstallOutcomeCopy(result) {
  const id = result?.puzzleId || "puzzle";
  const action = result?.action === "restore" ? "restored" : "removed";
  const paths = Array.isArray(result?.affectedPaths) && result.affectedPaths.length
    ? ` Touched ${result.affectedPaths.map(escapeHtml).join(", ")}.`
    : "";
  return `Uninstalled ${escapeHtml(id)} (${escapeHtml(action)}).${paths}`;
}

export function renderDraftUninstallResultPage({
  draftId,
  result = null,
  error = null
} = {}) {
  const title = error ? "Could not uninstall puzzle" : "Uninstalled from this checkout";
  const body = error
    ? `<h1>Could not uninstall puzzle</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>`
    : `<h1>Uninstalled from this checkout</h1>
       <p class="validation validation-ok">${uninstallOutcomeCopy(result)}</p>
       <p>The draft is unchanged. This did not close a pull request or write
       GitHub. If this was a new puzzle, its files are gone; if it replaced a
       committed puzzle, the last committed files are back.</p>
       <p class="meta"><a href="/admin/drafts/${encodeURIComponent(draftId)}">← back to draft</a></p>`;
  return actionResultShell(title, body);
}

export async function uninstallDraftFromReview({
  uninstallDraft,
  draftId
}) {
  if (typeof uninstallDraft !== "function") {
    const error = new Error(
      "Checkout uninstall is not available on this drafts server."
    );
    error.code = "ERR_UNINSTALL_UNAVAILABLE";
    throw error;
  }
  return uninstallDraft({ draftId });
}

/**
 * @param {{
 *   submitDraft: (args: any) => any,
 *   draftId: string,
 *   actor?: object,
 *   replace?: boolean
 * }} args
 */
export async function submitDraftFromReview({
  submitDraft,
  draftId,
  actor,
  replace = false
}) {
  if (typeof submitDraft !== "function") {
    const error = new Error(
      "GitHub publication is not configured on this drafts server."
    );
    error.code = "ERR_SUBMIT_UNAVAILABLE";
    throw error;
  }
  return submitDraft({
    draftId,
    actor,
    replace,
    catalogueId: null,
    reason: null,
    newCategory: null
  });
}

export default submitDraftFromReview;
