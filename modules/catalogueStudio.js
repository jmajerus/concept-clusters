import {
  addCatalogueEntry,
  moveCatalogueEntry,
  removeCatalogueEntry,
  setCatalogueEntryReason,
  setCatalogueInfoText,
  setCatalogueOrdered,
  setCatalogueTitle
} from "./catalogueAuthorEngine.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

export function createCatalogueStudio({
  root,
  puzzles = [],
  setMessage,
  paintOverview,
  onHide
}) {
  let catalogueId = null;
  let document = null;
  let revision = 0;
  let published = false;
  let selectedId = null;
  let statusText = "";
  let saving = false;

  function selectedEntry() {
    return (document?.entries || []).find(entry => entry.id === selectedId) || null;
  }

  function hide() {
    catalogueId = null;
    document = null;
    selectedId = null;
    if (root) root.hidden = true;
    onHide?.();
  }

  function puzzleTitle(id) {
    return puzzles.find(item => item.id === id)?.title || id;
  }

  function availablePuzzleIds() {
    const taken = new Set((document?.entries || []).map(entry => entry.id));
    return puzzles.filter(item => !taken.has(item.id));
  }

  function inspectorHtml() {
    if (!document) return "";
    const entry = selectedEntry();
    const options = availablePuzzleIds().map(item =>
      `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`
    ).join("");
    const infoText = typeof document.info === "string"
      ? document.info
      : (document.info?.text || "");
    let body = `
      <div class="authoring-inspector">
        <h3>Catalogue</h3>
        <label>title <input data-field="title" value="${escapeHtml(document.title || "")}"></label>
        <label>blurb <textarea data-field="info">${escapeHtml(infoText)}</textarea></label>
        <label class="authoring-check"><input type="checkbox" data-field="ordered"${
          document.ordered === false ? "" : " checked"
        }> Ordered sequence</label>
      </div>
      <div class="authoring-add">
        <input list="catalogue-puzzle-options" id="catalogue-add-puzzle" placeholder="Add puzzle id" ${
          options ? "" : "disabled"
        }>
        <datalist id="catalogue-puzzle-options">${options}</datalist>
        <button type="button" data-action="add-entry" ${options ? "" : "disabled"}>Add puzzle</button>
      </div>`;
    if (entry) {
      body += `
        <div class="authoring-inspector">
          <h3>${escapeHtml(puzzleTitle(entry.id))}</h3>
          <p class="meta"><code>${escapeHtml(entry.id)}</code></p>
          <label>reason
            <textarea data-field="reason">${escapeHtml(entry.reason || "")}</textarea>
          </label>
          <button type="button" data-action="remove-entry">Remove from catalogue</button>
        </div>`;
    } else {
      body += `<p class="meta">Tap a card to edit its reason, or drag cards to reorder.</p>`;
    }
    body += `
      <form method="post" action="/admin/catalogues/${encodeURIComponent(catalogueId)}">
        <input type="hidden" name="confirm" value="publish">
        <p><button type="submit">Publish</button></p>
      </form>
      ${published
        ? `<form method="post" action="/admin/catalogues/${encodeURIComponent(catalogueId)}">
             <input type="hidden" name="confirm" value="revert-published">
             <p><button type="submit" class="play-button secondary">Revert to published</button></p>
           </form>`
        : ""}
      <form method="post" action="/admin/catalogues/${encodeURIComponent(catalogueId)}">
        <input type="hidden" name="confirm" value="open-pull-request">
        <p><button type="submit" class="play-button secondary"${
          (document.entries || []).length ? "" : " disabled"
        }>Export to player</button></p>
      </form>
      <p class="meta"><a href="/admin/catalogues">All catalogues</a>
      · Publish writes the shared D1 row. Export to player opens a GitHub
      pull request for the git-bundled player. Does not write this checkout.</p>`;
    return body;
  }

  function render() {
    if (!root) return;
    if (!catalogueId || !document) {
      root.hidden = true;
      return;
    }
    root.hidden = false;
    root.innerHTML = `
      <div class="authoring-studio-heading">
        <strong>Catalogue authoring</strong>
        <span class="authoring-status">${escapeHtml(saving ? "Saving…" : statusText)}</span>
      </div>
      ${inspectorHtml()}`;
  }

  async function persist(next, { message = "", selectId = selectedId } = {}) {
    if (!catalogueId) return;
    saving = true;
    render();
    try {
      const response = await fetch(
        `/admin/catalogues/${encodeURIComponent(catalogueId)}/document`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expected_revision: revision,
            document: next
          })
        }
      );
      const body = await response.json().catch(() => ({}));
      if (response.status === 409) {
        await load(catalogueId, { message: "Someone else saved first. Reloaded." });
        return;
      }
      if (!response.ok) throw new Error(body.error || `Save failed (${response.status})`);
      document = body.document;
      revision = body.revision;
      selectedId = selectId && (document.entries || []).some(entry => entry.id === selectId)
        ? selectId
        : null;
      statusText = message || "Saved.";
      if (message) setMessage(message);
      paintOverview(document, { selectedId, onSelect: selectEntry });
    } catch (error) {
      statusText = error instanceof Error ? error.message : String(error);
      setMessage(statusText, "error");
    } finally {
      saving = false;
      render();
    }
  }

  function mutate(fn, extras = {}) {
    try {
      return persist(fn(document), extras);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      statusText = text;
      setMessage(text, "error");
      render();
    }
  }

  function selectEntry(puzzleId) {
    selectedId = puzzleId;
    paintOverview(document, { selectedId, onSelect: selectEntry });
    render();
  }

  async function load(nextId, { message = "" } = {}) {
    catalogueId = nextId;
    selectedId = null;
    const response = await fetch(
      `/admin/catalogues/${encodeURIComponent(nextId)}/document.json`,
      { cache: "no-store" }
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
    document = body.document;
    revision = body.revision;
    published = Boolean(body.published);
    statusText = message || "Add puzzles, write reasons, drag to order.";
    if (message) setMessage(message);
    else setMessage(statusText);
    paintOverview(document, { selectedId, onSelect: selectEntry });
    render();
  }

  root?.addEventListener("click", event => {
    const action = event.target.closest?.("[data-action]")?.getAttribute("data-action");
    if (!action || !document) return;
    if (action === "add-entry") {
      const input = root.querySelector("#catalogue-add-puzzle");
      const id = input?.value?.trim();
      if (!id) return;
      mutate(current => addCatalogueEntry(current, id), {
        message: `Added ${puzzleTitle(id)}.`,
        selectId: id
      });
      return;
    }
    if (action === "remove-entry" && selectedId) {
      const id = selectedId;
      mutate(current => removeCatalogueEntry(current, id), {
        message: `Removed ${puzzleTitle(id)}.`,
        selectId: null
      });
    }
  });

  root?.addEventListener("change", event => {
    const field = event.target.getAttribute?.("data-field");
    if (!field || !document) return;
    if (field === "title") {
      mutate(current => setCatalogueTitle(current, event.target.value));
    } else if (field === "info") {
      mutate(current => setCatalogueInfoText(current, event.target.value));
    } else if (field === "ordered") {
      mutate(current => setCatalogueOrdered(current, event.target.checked), {
        message: event.target.checked ? "Marked ordered." : "Marked unordered."
      });
    } else if (field === "reason" && selectedId) {
      mutate(current => setCatalogueEntryReason(current, selectedId, event.target.value), {
        selectId: selectedId
      });
    }
  });

  return {
    load,
    hide,
    isActive: () => Boolean(catalogueId),
    getDocument: () => document,
    move(fromIndex, toIndex) {
      if (!document) return;
      mutate(current => moveCatalogueEntry(current, fromIndex, toIndex), {
        message: "Reordered.",
        selectId: selectedId
      });
    }
  };
}

export function bindCatalogueCardDrag(listEl, {
  getEntries,
  onMove
}) {
  if (!listEl) return;
  let fromId = null;
  listEl.addEventListener("dragstart", event => {
    const card = event.target.closest?.("[data-puzzle-id]");
    if (!card) return;
    fromId = card.getAttribute("data-puzzle-id");
    event.dataTransfer?.setData("text/plain", fromId);
    event.dataTransfer.effectAllowed = "move";
  });
  listEl.addEventListener("dragover", event => {
    if (!fromId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  listEl.addEventListener("drop", event => {
    event.preventDefault();
    const card = event.target.closest?.("[data-puzzle-id]");
    const toId = card?.getAttribute("data-puzzle-id");
    const entries = getEntries() || [];
    const fromIndex = entries.findIndex(entry => entry.id === fromId);
    const toIndex = entries.findIndex(entry => entry.id === toId);
    fromId = null;
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    onMove(fromIndex, toIndex);
  });
  listEl.addEventListener("dragend", () => {
    fromId = null;
  });
}
