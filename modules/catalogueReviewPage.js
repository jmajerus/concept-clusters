import { authoringAdminNav } from "./authoringAdminIndex.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 920px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  .meta { color: #666; font-size: 14px; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 10px 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .badge { display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #e5e7eb; }
  .badge-ok { background: #dcfce7; }
  .badge-warn { background: #fef3c7; }
  form.new-catalogue, form.submit-pr, form.category-edit { margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
  fieldset { border: 1px solid #e5e7eb; border-radius: 8px; margin: 12px 0; padding: 8px 12px; }
  legend { padding: 0 6px; color: #666; }
  label { display: block; margin: 8px 0; }
  input, textarea { font: inherit; padding: 6px 8px; width: 100%; max-width: 40rem; box-sizing: border-box; }
  textarea { min-height: 6em; }
  button, .play-button {
    font: inherit; padding: 8px 14px; border-radius: 6px; border: 0;
    background: #2563eb; color: #fff; cursor: pointer; text-decoration: none; display: inline-block;
  }
  .play-button.secondary { background: #fff; color: #2563eb; border: 1px solid #2563eb; }
  .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
  .validation-ok { background: #dcfce7; }
  .validation-fail { background: #fee2e2; white-space: pre-wrap; }
`;

function pageShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

export function catalogueAuthorQuery(catalogueId) {
  return `/?catalogue=${encodeURIComponent(catalogueId)}&view=author`;
}

function navLinks() {
  return authoringAdminNav();
}

export function renderCatalogueListPage(catalogues) {
  const rows = catalogues.map(item => `<tr>
    <td><a href="${escapeHtml(catalogueAuthorQuery(item.id))}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    <td>${item.published
      ? '<span class="badge badge-ok">published in D1</span>'
      : '<span class="badge badge-warn">working copy only</span>'}</td>
    <td>${escapeHtml(String(item.entryCount ?? 0))}</td>
  </tr>`).join("\n");
  const table = catalogues.length
    ? `<table>
         <thead><tr><th>Title</th><th>Id</th><th>Status</th><th>Entries</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : "<p>No editable catalogues yet.</p>";
  const body = `<h1>Catalogues</h1>
    <p class="meta">Documents in D1. Edit as Library cards
    (\`/?catalogue=&amp;view=author\`), then <strong>Publish</strong> to the
    shared D1 row. <strong>Export to player</strong> opens a GitHub pull
    request for the git-bundled player; it is optional. Derived catalogues
    (All Puzzles, New, level-*) and meta catalogues stay out of this list.
    ${navLinks()}</p>
    <form class="new-catalogue" method="post" action="/admin/catalogues">
      <h2>New catalogue</h2>
      <p class="meta">Creates a working copy in D1. Publish makes it the live
      authoring document. Export to player is a separate action.</p>
      <input type="hidden" name="confirm" value="create-catalogue">
      <p><label>id <input name="id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="my-catalogue"></label></p>
      <p><label>title <input name="title" required></label></p>
      <p><button type="submit">Create and open editor</button></p>
    </form>
    ${table}`;
  return pageShell("Catalogues", body);
}

export function renderCatalogueSubmitResultPage({
  catalogueId,
  publication = null,
  error = null
} = {}) {
  const editor = catalogueAuthorQuery(catalogueId);
  const title = error ? "Could not export to player" : "Export to player";
  const body = error
    ? `<h1>Could not export to player</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="${escapeHtml(editor)}">← back to catalogue editor</a>
       · <a href="/admin/catalogues">Catalogues</a></p>`
    : `<h1>Export to player</h1>
       <p class="validation validation-ok">Opened
         <a href="${escapeHtml(publication.githubPrUrl)}">PR #${escapeHtml(String(publication.githubPrNumber))}</a>
         for <code>${escapeHtml(catalogueId)}</code>.</p>
       <p>That updates the git-bundled player after merge. D1 publish is separate.
       This checkout is unchanged.</p>
       <p class="meta"><a href="${escapeHtml(editor)}">← back to catalogue editor</a>
       · <a href="/admin/catalogues">Catalogues</a></p>`;
  return pageShell(title, body);
}

export function renderContentPublishResultPage({
  kind,
  id,
  published = null,
  error = null,
  backHref
} = {}) {
  const label = kind === "puzzle" ? "puzzle" : kind === "category" ? "category" : "catalogue";
  const title = error ? `Could not publish ${label}` : `Published ${label}`;
  const body = error
    ? `<h1>Could not publish</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="${escapeHtml(backHref)}">← back</a></p>`
    : `<h1>Published</h1>
       <p class="validation validation-ok">Published <code>${escapeHtml(id)}</code>
       as D1 revision ${escapeHtml(String(published.revision))}.</p>
       <p class="meta">The git-bundled production player is unchanged until you
       export to player. <a href="${escapeHtml(backHref)}">← back</a></p>`;
  return pageShell(title, body);
}

function subcategoryEntries(document) {
  const subs = document?.subcategories;
  if (!subs || typeof subs !== "object" || Array.isArray(subs)) return [];
  return Object.entries(subs).sort(([left], [right]) => left.localeCompare(right));
}

export function renderCategoryListPage(categories) {
  const rows = categories.map(item => `<tr>
    <td><a href="/admin/categories/${encodeURIComponent(item.id)}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    <td>${item.published
      ? '<span class="badge badge-ok">published in D1</span>'
      : '<span class="badge badge-warn">working copy only</span>'}</td>
    <td>${escapeHtml(String(item.subcategoryCount ?? 0))}</td>
  </tr>`).join("\n");
  const table = categories.length
    ? `<table>
         <thead><tr><th>Title</th><th>Id</th><th>Status</th><th>Subcategories</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : "<p>No categories yet.</p>";
  const body = `<h1>Categories</h1>
    <p class="meta">Shared taxonomy documents in D1. Title, domain, blurb, and
    registered subcategories. Puzzle membership stays derived.
    ${navLinks()}</p>
    ${table}`;
  return pageShell("Categories", body);
}

export function renderCategoryEditPage({ id, document, revision, published = false }) {
  const infoText = typeof document.info === "string"
    ? document.info
    : (document.info?.text || "");
  const subcategories = subcategoryEntries(document);
  const subcategoryFields = subcategories.length
    ? subcategories.map(([subId, definition]) => {
      const blurb = typeof definition?.info === "string"
        ? definition.info
        : (definition?.info?.text || "");
      return `<fieldset>
        <legend><code>${escapeHtml(subId)}</code></legend>
        <p><label>title <input name="subcategory.${escapeHtml(subId)}.title" required value="${escapeHtml(definition?.title || "")}"></label></p>
        <p><label>blurb <textarea name="subcategory.${escapeHtml(subId)}.info">${escapeHtml(blurb)}</textarea></label></p>
      </fieldset>`;
    }).join("\n")
    : "<p class=\"meta\">No subcategories registered on this category.</p>";
  const body = `<h1>${escapeHtml(document.title || id)}</h1>
    <p class="meta"><code>${escapeHtml(id)}</code>
    · draft revision ${escapeHtml(String(revision))}
    · ${published ? "has a published D1 row" : "working copy only"}
    · ${navLinks()}</p>
    <form class="category-edit" method="post" action="/admin/categories/${encodeURIComponent(id)}">
      <input type="hidden" name="confirm" value="save-category">
      <input type="hidden" name="expected_revision" value="${escapeHtml(String(revision))}">
      <p><label>title <input name="title" required value="${escapeHtml(document.title || "")}"></label></p>
      <p><label>domain <input name="domain" value="${escapeHtml(document.domain || "")}"></label></p>
      <p><label>blurb <textarea name="info">${escapeHtml(infoText)}</textarea></label></p>
      <h2>Subcategories</h2>
      <p class="meta">Registered browse partitions. Puzzle assignment stays on
      each puzzle. Generated All/Other are not stored here.</p>
      ${subcategoryFields}
      <p><button type="submit">Save working copy</button></p>
    </form>
    <form class="submit-pr" method="post" action="/admin/categories/${encodeURIComponent(id)}">
      <input type="hidden" name="confirm" value="publish">
      <p><button type="submit">Publish</button></p>
    </form>
    ${published
      ? `<form class="submit-pr" method="post" action="/admin/categories/${encodeURIComponent(id)}">
           <input type="hidden" name="confirm" value="revert-published">
           <p><button type="submit" class="play-button secondary">Revert to published</button></p>
         </form>`
      : ""}`;
  return pageShell(document.title || id, body);
}
