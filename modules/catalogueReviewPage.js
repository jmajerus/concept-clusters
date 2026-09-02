import { authoringAdminNav } from "./authoringAdminIndex.js";
import {
  CUE_FOR_FREEZE_CONFIRM,
  HOLD_FROM_FREEZE_CONFIRM
} from "./contentFreezePlan.js";
import { DOMAINS, RESERVED_DOMAIN_IDS } from "../puzzles/categories.js";

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
  .badge-new { background: #dbeafe; color: #1e3a8a; }
  form.new-catalogue, form.submit-pr, form.category-edit { margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
  form.row-action { margin: 0; padding: 0; border: 0; display: inline; }
  fieldset { border: 1px solid #e5e7eb; border-radius: 8px; margin: 12px 0; padding: 8px 12px; }
  legend { padding: 0 6px; color: #666; }
  label { display: block; margin: 8px 0; }
  input, textarea, select { font: inherit; padding: 6px 8px; width: 100%; max-width: 40rem; box-sizing: border-box; }
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

export function renderFreezeAddBadge(freezeAdd) {
  return freezeAdd
    ? '<span class="badge badge-new">new on next freeze</span>'
    : "";
}

export function renderPublishedFreezeBadges({
  published = false,
  d1Published = false,
  withdrawn = false,
  d1Withdrawn = false,
  freezeAdd = false,
  gitSeedCue = false,
  cuedForFreeze = false,
  readyForFreeze = false
} = {}) {
  if (!(published || d1Published) || withdrawn || d1Withdrawn) return "";
  if (freezeAdd) return renderFreezeAddBadge(true);
  if (gitSeedCue) return "";
  if (!(cuedForFreeze || readyForFreeze)) return '<span class="badge">held</span>';
  return '<span class="badge badge-accent">cued</span>';
}

export function renderFreezeCueForm(action, {
  published = false,
  withdrawn = false,
  cuedForFreeze = false,
  readyForFreeze = false
} = {}) {
  if (!published || withdrawn) return "";
  if (cuedForFreeze || readyForFreeze) {
    return `<form class="submit-pr" method="post" action="${escapeHtml(action)}">
      <input type="hidden" name="confirm" value="${HOLD_FROM_FREEZE_CONFIRM}">
      <h2>Freeze cue</h2>
      <p class="meta">This snapshot is in the next freeze. Hold it to keep it
      in authoring play — including a finished, reviewed board you want to
      ship later with a catalogue or other puzzles.</p>
      <p><button type="submit" class="play-button secondary">Hold</button></p>
    </form>`;
  }
  return `<form class="submit-pr" method="post" action="${escapeHtml(action)}">
    <input type="hidden" name="confirm" value="${CUE_FOR_FREEZE_CONFIRM}">
    <h2>Freeze cue</h2>
    <p class="meta">Cue includes this snapshot in the next freeze. Hold
    (the default after Publish) keeps it in authoring play only. Finished
    or reviewed is not the same as cued.</p>
    <p><button type="submit">Cue</button></p>
  </form>`;
}

export function catalogueAuthorQuery(catalogueId) {
  return `/?catalogue=${encodeURIComponent(catalogueId)}&view=author`;
}

export function catalogueAdminPath(catalogueId) {
  return `/admin/catalogues/${encodeURIComponent(catalogueId)}`;
}

export function isMetaCatalogueDocument(document) {
  return document?.kind === "meta";
}

export function catalogueEditHref(item) {
  return item?.kind === "meta"
    ? catalogueAdminPath(item.id)
    : catalogueAuthorQuery(item.id);
}

function navLinks() {
  return authoringAdminNav();
}

export function renderDocumentLifecycleForms(action, { published = false, withdrawn = false } = {}) {
  const unpublish = published && !withdrawn
    ? `<form class="submit-pr" method="post" action="${escapeHtml(action)}">
      <input type="hidden" name="confirm" value="unpublish">
      <p class="meta">Removes this document from authoring play. Git seed
      will not restore it. Publish again to bring it back. Freeze later
      deletes the corresponding git files.</p>
      <p><button type="submit" class="play-button secondary">Remove from authoring play</button></p>
    </form>`
    : "";
  return `${unpublish}
    <form class="submit-pr" method="post" action="${escapeHtml(action)}">
      <input type="hidden" name="confirm" value="delete-draft">
      <p class="meta">Deletes your working copy. A published or withdrawn
      row is unchanged.</p>
      <p><button type="submit" class="play-button secondary">Delete working copy</button></p>
    </form>`;
}

export function renderContentLifecycleResultPage({
  title,
  message,
  error = null,
  backHref
} = {}) {
  const heading = error ? title || "Could not complete" : title;
  const body = error
    ? `<h1>${escapeHtml(heading)}</h1>
       <p class="validation validation-fail">${escapeHtml(error)}</p>
       <p class="meta"><a href="${escapeHtml(backHref)}">← back</a></p>`
    : `<h1>${escapeHtml(heading)}</h1>
       <p class="validation validation-ok">${escapeHtml(message)}</p>
       <p class="meta"><a href="${escapeHtml(backHref)}">← back</a></p>`;
  return pageShell(heading, body);
}

function catalogueChoiceOptions(choices, excludeIds = []) {
  const skip = new Set(excludeIds);
  return (choices || [])
    .filter(item => item?.id && !skip.has(item.id))
    .sort((left, right) => String(left.title || left.id).localeCompare(String(right.title || right.id)))
    .map(item =>
      `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title || item.id)}</option>`
    )
    .join("");
}

export function renderCatalogueListPage(catalogues) {
  const rows = catalogues.map(item => `<tr>
    <td><a href="${escapeHtml(catalogueEditHref(item))}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    <td>${item.kind === "meta"
      ? '<span class="badge">meta</span>'
      : '<span class="badge">leaf</span>'}</td>
    <td>${item.withdrawn
      ? '<span class="badge">withdrawn</span>'
      : item.published
      ? `<span class="badge badge-ok">published in D1</span> ${renderPublishedFreezeBadges(item)}`
      : '<span class="badge badge-warn">working copy only</span>'}</td>
    <td>${escapeHtml(String(item.entryCount ?? 0))}</td>
    <td>${item.published && !item.withdrawn
      ? `<form class="row-action" method="post" action="${escapeHtml(catalogueAdminPath(item.id))}">
           <input type="hidden" name="confirm" value="unpublish">
           <button type="submit" class="play-button secondary">Remove from play</button>
         </form>`
      : ""}</td>
  </tr>`).join("\n");
  const table = catalogues.length
    ? `<table>
         <thead><tr><th>Title</th><th>Id</th><th>Kind</th><th>Status</th><th>Entries</th><th></th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : "<p>No editable catalogues yet.</p>";
  const body = `<h1>Catalogues</h1>
    <p class="meta">Documents in D1. Leaf catalogues edit as Library cards
    (\`/?catalogue=&amp;view=author\`). Meta catalogues edit here
    (\`/admin/catalogues/&lt;id&gt;\`); their entries are other catalogues.
    <strong>Publish</strong> writes the shared D1 row.
    <strong>Export to player</strong> opens a GitHub pull request for the
    git-bundled player; it is optional. Derived catalogues (All Puzzles,
    New, level-*) stay out of this list.
    <span class="badge badge-new">new on next freeze</span> marks a published
    D1 row that git does not have yet and that you cued. <span class="badge">held</span>
    stays in authoring play until you cue it — including a finished board
    waiting on other puzzles.
    ${navLinks()}</p>
    <form class="new-catalogue" method="post" action="/admin/catalogues">
      <h2>New catalogue</h2>
      <p class="meta">Creates a working copy in D1. Publish makes it the live
      authoring document. Export to player is a separate action.</p>
      <input type="hidden" name="confirm" value="create-catalogue">
      <p><label>id <input name="id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="my-catalogue"></label></p>
      <p><label>title <input name="title" required></label></p>
      <p><label><input type="checkbox" name="kind" value="meta"> Meta catalogue
      (entries are other catalogues)</label></p>
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

function entryFields(entries, { idName, reasonName, removeName }) {
  if (!entries.length) {
    return "<p class=\"meta\">None yet.</p>";
  }
  return entries.map(entry => `<fieldset>
        <legend><code>${escapeHtml(entry.id)}</code></legend>
        <input type="hidden" name="${escapeHtml(idName)}" value="${escapeHtml(entry.id)}">
        <p><label>reason <textarea name="${escapeHtml(reasonName)}">${escapeHtml(entry.reason || "")}</textarea></label></p>
        <p><label><input type="checkbox" name="${escapeHtml(removeName)}" value="${escapeHtml(entry.id)}"> Remove</label></p>
      </fieldset>`).join("\n");
}

export function renderMetaCatalogueEditPage({
  id,
  document,
  revision,
  published = false,
  withdrawn = false,
  cuedForFreeze = false,
  readyForFreeze = false,
  leafCatalogues = [],
  relatedCatalogues = []
} = {}) {
  const entries = Array.isArray(document?.entries) ? document.entries : [];
  const related = Array.isArray(document?.relatedCatalogues?.entries)
    ? document.relatedCatalogues.entries
    : [];
  const taken = new Set([id, ...entries.map(entry => entry.id)]);
  const relatedTaken = new Set([...taken, ...related.map(entry => entry.id)]);
  const addOptions = catalogueChoiceOptions(leafCatalogues, [...taken]);
  const relatedOptions = catalogueChoiceOptions(relatedCatalogues, [...relatedTaken]);
  const body = `<h1>${escapeHtml(document.title || id)}</h1>
    <p class="meta"><code>${escapeHtml(id)}</code>
    · meta catalogue
    · draft revision ${escapeHtml(String(revision))}
    · ${published ? "has a published D1 row" : "working copy only"}
    · ${navLinks()}</p>
    <p class="meta">Entries are other catalogues, one level deep. Nested
    leaves stay off the top-level Library list unless a leaf itself sets
    <code>showInLibrary</code>. Puzzle assignment is not edited here.
    Cue this snapshot, then Freeze on <a href="/admin">Admin</a> to write
    the git module, including <code>kind: meta</code>.</p>
    <form class="category-edit" method="post" action="${escapeHtml(catalogueAdminPath(id))}">
      <input type="hidden" name="confirm" value="save-catalogue">
      <input type="hidden" name="expected_revision" value="${escapeHtml(String(revision))}">
      <p><label>title <input name="title" required value="${escapeHtml(document.title || "")}"></label></p>
      <p><label>blurb <textarea name="info">${escapeHtml(infoTextOf(document.info))}</textarea></label></p>
      <p><label><input type="checkbox" name="ordered" value="true"${
        document.ordered === false ? "" : " checked"
      }> Ordered sequence</label></p>
      <h2>Catalogues in this set</h2>
      ${entryFields(entries, {
        idName: "entry_id",
        reasonName: "entry_reason",
        removeName: "remove_entry"
      })}
      <fieldset>
        <legend>Add catalogue</legend>
        <p><label>id <input name="new_entry_id" list="meta-entry-options" placeholder="leaf-catalogue-id"></label></p>
        <datalist id="meta-entry-options">${addOptions}</datalist>
        <p><label>reason <textarea name="new_entry_reason"></textarea></label></p>
      </fieldset>
      <h2>See also</h2>
      <p class="meta"><code>relatedCatalogues</code> — not nested, no
      breadcrumb. May point at another meta catalogue.</p>
      ${entryFields(related, {
        idName: "related_id",
        reasonName: "related_reason",
        removeName: "remove_related"
      })}
      <fieldset>
        <legend>Add related catalogue</legend>
        <p><label>id <input name="new_related_id" list="meta-related-options" placeholder="catalogue-id"></label></p>
        <datalist id="meta-related-options">${relatedOptions}</datalist>
        <p><label>reason <textarea name="new_related_reason"></textarea></label></p>
      </fieldset>
      <p><button type="submit">Save working copy</button></p>
    </form>
    <form class="submit-pr" method="post" action="${escapeHtml(catalogueAdminPath(id))}">
      <input type="hidden" name="confirm" value="publish">
      <p><button type="submit">Publish</button></p>
    </form>
    ${published
      ? `<form class="submit-pr" method="post" action="${escapeHtml(catalogueAdminPath(id))}">
           <input type="hidden" name="confirm" value="revert-published">
           <p><button type="submit" class="play-button secondary">Revert to published</button></p>
         </form>`
      : ""}
    ${renderFreezeCueForm(catalogueAdminPath(id), {
      published, withdrawn, cuedForFreeze: cuedForFreeze || readyForFreeze
    })}
    ${renderDocumentLifecycleForms(catalogueAdminPath(id), { published, withdrawn })}`;
  return pageShell(document.title || id, body);
}

function subcategoryEntries(document) {
  const subs = document?.subcategories;
  if (!subs || typeof subs !== "object" || Array.isArray(subs)) return [];
  return Object.entries(subs).sort(([left], [right]) => left.localeCompare(right));
}

function infoTextOf(info) {
  return typeof info === "string" ? info : (info?.text || "");
}

function infoLinkOf(info) {
  return typeof info === "object" && info ? (info.link || "") : "";
}

function infoExtraLinkOf(info) {
  return typeof info === "object" && info ? (info.extraLink || "") : "";
}

function domainSelect(selected) {
  const ids = Object.keys(DOMAINS).filter(id => !RESERVED_DOMAIN_IDS.has(id));
  const options = ['<option value="">—</option>'];
  if (selected && !ids.includes(selected)) {
    options.push(
      `<option value="${escapeHtml(selected)}" selected>${escapeHtml(selected)}</option>`
    );
  }
  for (const id of ids) {
    options.push(
      `<option value="${escapeHtml(id)}"${id === selected ? " selected" : ""}>${escapeHtml(DOMAINS[id].title || id)}</option>`
    );
  }
  return `<select name="domain">${options.join("")}</select>`;
}

function subcategoryFieldset(subId, definition) {
  return `<fieldset>
        <legend><code>${escapeHtml(subId)}</code></legend>
        <p><label>title <input name="subcategory.${escapeHtml(subId)}.title" required value="${escapeHtml(definition?.title || "")}"></label></p>
        <p><label>blurb <textarea name="subcategory.${escapeHtml(subId)}.info">${escapeHtml(infoTextOf(definition?.info))}</textarea></label></p>
        <p><label>link <input name="subcategory.${escapeHtml(subId)}.link" value="${escapeHtml(infoLinkOf(definition?.info))}" placeholder="wiki:Topic or https://…"></label></p>
        <p><label>extra link <input name="subcategory.${escapeHtml(subId)}.extraLink" value="${escapeHtml(infoExtraLinkOf(definition?.info))}"></label></p>
        <p><label><input type="checkbox" name="remove_subcategory" value="${escapeHtml(subId)}"> Remove</label></p>
      </fieldset>`;
}

export function renderCategoryListPage(categories) {
  const rows = categories.map(item => `<tr>
    <td><a href="/admin/categories/${encodeURIComponent(item.id)}">${escapeHtml(item.title || item.id)}</a></td>
    <td><code>${escapeHtml(item.id)}</code></td>
    <td>${item.withdrawn
      ? '<span class="badge">withdrawn</span>'
      : item.published
      ? `<span class="badge badge-ok">published in D1</span> ${renderPublishedFreezeBadges(item)}`
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
    <span class="badge badge-new">new on next freeze</span> marks a published
    D1 row that git does not have yet and that you cued.
    <span class="badge">held</span> stays in authoring play until you cue it.
    ${navLinks()}</p>
    <form class="new-catalogue" method="post" action="/admin/categories">
      <h2>New category</h2>
      <p class="meta">Creates a working copy. Publish makes it live in
      authoring play. Membership stays derived from puzzles.</p>
      <input type="hidden" name="confirm" value="create-category">
      <p><label>id <input name="id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="molecular-biology"></label></p>
      <p><label>title <input name="title" required placeholder="Molecular Biology"></label></p>
      <p><label>domain ${domainSelect("")}</label></p>
      <p><label>blurb <textarea name="info"></textarea></label></p>
      <p><button type="submit">Create and open editor</button></p>
    </form>
    ${table}`;
  return pageShell("Categories", body);
}

export function renderCategoryEditPage({
  id,
  document,
  revision,
  published = false,
  withdrawn = false,
  freezeAdd = false,
  cuedForFreeze = false,
  readyForFreeze = false
}) {
  const subcategories = subcategoryEntries(document);
  const subcategoryFields = subcategories.length
    ? subcategories.map(([subId, definition]) => subcategoryFieldset(subId, definition)).join("\n")
    : "<p class=\"meta\">No subcategories registered on this category yet.</p>";
  const body = `<h1>${escapeHtml(document.title || id)}</h1>
    <p class="meta"><code>${escapeHtml(id)}</code>
    · draft revision ${escapeHtml(String(revision))}
    · ${withdrawn
      ? "withdrawn from authoring play"
      : published ? "has a published D1 row" : "working copy only"}
    ${renderPublishedFreezeBadges({
      published, withdrawn, freezeAdd, cuedForFreeze: cuedForFreeze || readyForFreeze
    })}
    · ${navLinks()}</p>
    <form class="category-edit" method="post" action="/admin/categories/${encodeURIComponent(id)}">
      <input type="hidden" name="confirm" value="save-category">
      <input type="hidden" name="expected_revision" value="${escapeHtml(String(revision))}">
      <p><label>title <input name="title" required value="${escapeHtml(document.title || "")}"></label></p>
      <p class="meta">The title is the join string puzzles store as
      <code>category</code>. The id above stays put. Rewording is blocked
      while live puzzles still cite this title; change those puzzles first
      (see AUTHORING-REFERENCE.md, Rewording a category name).</p>
      <p><label>domain ${domainSelect(document.domain || "")}</label></p>
      <p><label>blurb <textarea name="info">${escapeHtml(infoTextOf(document.info))}</textarea></label></p>
      <p><label>link <input name="link" value="${escapeHtml(infoLinkOf(document.info))}" placeholder="wiki:Topic or https://…"></label></p>
      <p><label>extra link <input name="extraLink" value="${escapeHtml(infoExtraLinkOf(document.info))}"></label></p>
      <h2>Subcategories</h2>
      <p class="meta">Registered browse partitions. The id is the stable URL
      slug; titles and blurbs are copy. Puzzle assignment stays on each
      puzzle. Generated All/Other are not stored here.</p>
      ${subcategoryFields}
      <fieldset>
        <legend>Add subcategory</legend>
        <p class="meta">Creates a partition on this working copy. It stays
        empty in the Library until a puzzle names this id.</p>
        <p><label>id <input name="new_subcategory_id" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="molecular-evolution"></label></p>
        <p><label>title <input name="new_subcategory_title"></label></p>
        <p><label>blurb <textarea name="new_subcategory_info"></textarea></label></p>
        <p><label>link <input name="new_subcategory_link" placeholder="wiki:Topic or https://…"></label></p>
      </fieldset>
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
      : ""}
    ${renderFreezeCueForm(`/admin/categories/${encodeURIComponent(id)}`, {
      published, withdrawn, cuedForFreeze: cuedForFreeze || readyForFreeze
    })}
    ${renderDocumentLifecycleForms(`/admin/categories/${encodeURIComponent(id)}`, { published, withdrawn })}`;
  return pageShell(document.title || id, body);
}
