// Human-facing editor for the drafts-page model dropdown's D1-backed
// additions -- see authoringModelSuggestions.js for the built-in seed list
// this is additive to, and d1ModelSuggestionRepository.js for storage.

import { authoringAdminNav } from "./authoringAdminIndex.js";
import { AUTHORING_MODEL_SUGGESTIONS } from "./authoringModelSuggestions.js";
import { D1ModelSuggestionRepository } from "./d1ModelSuggestionRepository.js";
import { isSameOriginRequest } from "./draftReviewSubmit.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";

export const ADD_MODEL_SUGGESTION_CONFIRM = "add-model-suggestion";
export const REMOVE_MODEL_SUGGESTION_CONFIRM = "remove-model-suggestion";
export const MODEL_SUGGESTIONS_ADMIN_PATH = "/admin/model-suggestions";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  .meta { color: #666; font-size: 14px; }
  a { color: #2563eb; }
  ul { padding-left: 1.2em; }
  li { margin: 4px 0; }
  .error { color: #b91c1c; }
  form.add-model { display: flex; gap: 8px; margin: 16px 0; }
  form.add-model input[type="text"] { flex: 1; font: inherit; padding: 8px 10px; border: 1px solid #ddd; border-radius: 4px; }
  form.remove-model { display: inline; margin-left: 8px; }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }
  button, .play-button {
    font: inherit; padding: 8px 14px; border-radius: 6px; border: 0;
    background: #2563eb; color: #fff; cursor: pointer;
  }
  button.secondary { background: #fff; color: #b91c1c; border: 1px solid #b91c1c; padding: 2px 8px; font-size: 13px; }
`;

/**
 * @param {{ customLabels?: string[], error?: string|null }} options
 */
export function renderModelSuggestionsAdminPage({ customLabels = [], error = null } = {}) {
  const seedItems = AUTHORING_MODEL_SUGGESTIONS
    .filter(label => label !== "Custom Model")
    .map(label => `<li>${escapeHtml(label)}</li>`)
    .join("");
  const customItems = customLabels.length
    ? customLabels.map(label => `<li>${escapeHtml(label)}
        <form class="remove-model" method="post" action="${MODEL_SUGGESTIONS_ADMIN_PATH}">
          <input type="hidden" name="confirm" value="${REMOVE_MODEL_SUGGESTION_CONFIRM}">
          <input type="hidden" name="label" value="${escapeHtml(label)}">
          <button type="submit" class="secondary">Remove</button>
        </form>
      </li>`).join("")
    : `<li class="meta">None added yet.</li>`;

  const body = `<h1>Model suggestions</h1>
    <p class="meta">${authoringAdminNav()}</p>
    <p class="meta">Options offered on the <code>/admin/drafts</code> model
    dropdown for each drafting client. Add a newly released model here --
    no code change or deploy needed; it's available immediately.</p>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <form class="add-model" method="post" action="${MODEL_SUGGESTIONS_ADMIN_PATH}">
      <input type="hidden" name="confirm" value="${ADD_MODEL_SUGGESTION_CONFIRM}">
      <label class="visually-hidden" for="model-suggestion-label">model name</label>
      <input type="text" id="model-suggestion-label" name="label" placeholder="e.g. Claude Opus 6" required autocomplete="off">
      <button type="submit">Add</button>
    </form>
    <h2>Added here</h2>
    <ul>${customItems}</ul>
    <h2>Built in</h2>
    <ul>${seedItems}</ul>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Model suggestions</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

export function isModelSuggestionsAdminPath(pathname) {
  return pathname === MODEL_SUGGESTIONS_ADMIN_PATH;
}

export function parseModelSuggestionForm(params) {
  return {
    confirm: params.get("confirm") || "",
    label: params.get("label") || ""
  };
}

async function readUrlEncoded(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function html(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

/**
 * Local (Node HTTP) counterpart to the hosted Worker's
 * /admin/model-suggestions route -- same table, reached through the local
 * D1 workspace's HTTP-proxied binding (see localAuthoringWorkspace.js)
 * instead of a native Worker binding.
 */
export async function handleLocalModelSuggestions(req, res, { repositoryRoot, env = process.env } = {}) {
  const urlPath = (req.url || "").split("?")[0];
  if (!isModelSuggestionsAdminPath(urlPath)) return false;
  if (req.method !== "GET" && req.method !== "POST") {
    html(res, "Method Not Allowed", 405);
    return true;
  }

  let database = null;
  try {
    const resolved = await resolveLocalAuthoringWorkspace({ env, repositoryRoot });
    database = resolved.contentDocuments?.database || null;
  } catch {
    database = null;
  }
  if (!database) {
    html(res, renderModelSuggestionsAdminPage({
      error: "No D1 database configured for this local workspace -- " +
        "add models from the hosted site's /admin/model-suggestions instead."
    }), 503);
    return true;
  }
  const repository = new D1ModelSuggestionRepository(database);

  if (req.method === "POST") {
    const sameOrigin = isSameOriginRequest({
      origin: req.headers?.origin || req.headers?.Origin,
      referer: req.headers?.referer || req.headers?.Referer,
      host: req.headers?.host || req.headers?.Host
    });
    if (!sameOrigin) {
      html(res, "<p>Cross-origin submit is not allowed.</p>", 403);
      return true;
    }
    const params = await readUrlEncoded(req);
    const form = parseModelSuggestionForm(params);
    let error = null;
    try {
      if (form.confirm === ADD_MODEL_SUGGESTION_CONFIRM) {
        await repository.add(form.label);
      } else if (form.confirm === REMOVE_MODEL_SUGGESTION_CONFIRM) {
        await repository.remove(form.label);
      } else {
        error = "Missing or unknown confirmation.";
      }
    } catch (submitError) {
      error = submitError instanceof Error ? submitError.message : String(submitError);
    }
    if (!error) {
      res.writeHead(303, { Location: MODEL_SUGGESTIONS_ADMIN_PATH, "Cache-Control": "no-store" });
      res.end();
      return true;
    }
    html(res, renderModelSuggestionsAdminPage({ customLabels: await repository.list(), error }), 400);
    return true;
  }

  html(res, renderModelSuggestionsAdminPage({ customLabels: await repository.list() }));
  return true;
}
