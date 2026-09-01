// LAN construct canvas on /?draft=: inspectors, Construct/Play toggle,
// and persist-after-gesture. Production player does not load this panel.

import { IDENTITY_COLOR_KEYS } from "./colorPalette.js";
import {
  addClusterWithTerm,
  addTerm,
  createAuthorEngine,
  deleteBridge,
  deleteCluster,
  deleteLens,
  deleteTerm,
  describeNode,
  interpretAuthorClusterTap,
  interpretAuthorTap,
  prepareDocumentForSave,
  promoteUnplacedToCluster,
  renameCluster,
  renameTerm,
  setBridgeDirection,
  setBridgeFact,
  setBridgeTermRole,
  setClusterColor,
  setClusterFact,
  setIdealTerm,
  setLearningIntroduction,
  setPuzzleChrome,
  setRelatedPuzzles,
  setTermInfoText,
  toggleSeed,
  upsertLens
} from "./authorEngine.js";
import { CATEGORIES } from "../puzzles/categories.js";
import { renderSafeMarkdown } from "./safeMarkdown.js";

const engine = createAuthorEngine();
const DIRECTION_KINDS = ["undirected", "through", "bidirectional", "outward", "inward"];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function field(name, value, { label, multiline = false } = {}) {
  const safe = escapeHtml(value ?? "");
  if (multiline) {
    return `<label>${escapeHtml(label || name)}<textarea data-field="${escapeHtml(name)}">${safe}</textarea></label>`;
  }
  return `<label>${escapeHtml(label || name)}<input data-field="${escapeHtml(name)}" value="${safe}"></label>`;
}

export function createAuthoringStudio({
  root,
  setMessage,
  applyConstructBoard,
  applyPlayPuzzle,
  onHide
}) {
  let draftId = null;
  let draftDocument = null;
  let revision = 0;
  let mode = "construct";
  let selected = null;
  let selectedClusterId = null;
  let playErrors = [];
  let playReady = false;
  let statusText = "";
  let saving = false;

  function isConstruct() {
    return Boolean(draftId && mode === "construct");
  }

  function selectedNode() {
    return selected;
  }

  function show() {
    if (root) root.hidden = false;
    globalThis.document?.body?.classList.toggle("authoring-construct", isConstruct());
    globalThis.document?.querySelector("#puzzle-view")?.classList.toggle("authoring-construct", isConstruct());
  }

  function hide() {
    draftId = null;
    draftDocument = null;
    selected = null;
    selectedClusterId = null;
    mode = "construct";
    playErrors = [];
    playReady = false;
    if (root) root.hidden = true;
    globalThis.document?.body?.classList.remove("authoring-construct");
    globalThis.document?.querySelector("#puzzle-view")?.classList.remove("authoring-construct");
    onHide?.();
  }

  async function readPlayStatus() {
    if (!draftId) return;
    const response = await fetch(
      `/admin/drafts/${encodeURIComponent(draftId)}/play.json`,
      { cache: "no-store" }
    );
    const body = await response.json().catch(() => ({}));
    playReady = response.ok && Boolean(body.puzzle);
    playErrors = playReady ? [] : (Array.isArray(body.errors) ? body.errors : [body.error || "Not playable yet"]);
    return body.puzzle || null;
  }

  function paintBoard(focusWord = selected?.word) {
    applyConstructBoard(draftDocument, {
      draftId,
      revision,
      selectedWord: focusWord,
      selectedClusterId
    });
  }

  async function persist(nextDocument, {
    message = "",
    selectWord,
    selectClusterId,
    clearSelection = false
  } = {}) {
    if (!draftId) return;
    const payload = prepareDocumentForSave(nextDocument);
    saving = true;
    render();
    try {
      const response = await fetch(
        `/admin/drafts/${encodeURIComponent(draftId)}/document`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expected_revision: revision,
            document: payload
          })
        }
      );
      const body = await response.json().catch(() => ({}));
      if (response.status === 409) {
        await reload({ message: "Someone else saved first. Reloaded the current document." });
        return;
      }
      if (!response.ok) {
        throw new Error(body.error || body.detail || `Save failed (${response.status})`);
      }
      draftDocument = body.document;
      revision = body.revision;
      if (clearSelection) {
        selected = null;
        selectedClusterId = null;
      } else {
        if (selectWord) selected = { word: selectWord };
        if (selectClusterId) selectedClusterId = selectClusterId;
      }
      statusText = message || "Saved.";
      await readPlayStatus();
      paintBoard(selected?.word);
      if (message) setMessage(message);
    } catch (error) {
      statusText = error instanceof Error ? error.message : String(error);
      setMessage(statusText, "error");
    } finally {
      saving = false;
      render();
    }
  }

  async function mutate(fn, extras = {}) {
    try {
      const next = fn(draftDocument);
      await persist(next, extras);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      statusText = text;
      setMessage(text, "error");
      render();
    }
  }

  async function reload({ message = "" } = {}) {
    const response = await fetch(
      `/admin/drafts/${encodeURIComponent(draftId)}/document.json`,
      { cache: "no-store" }
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || body.detail || `HTTP ${response.status}`);
    draftDocument = body.document;
    revision = body.revision;
    await readPlayStatus();
    if (message) {
      statusText = message;
      setMessage(message);
    }
    paintBoard();
    render();
  }

  async function load(nextDraftId) {
    draftId = nextDraftId;
    selected = null;
    selectedClusterId = null;
    mode = "construct";
    show();
    await reload();
    statusText = "Construct: add a term, or tap an unplaced term then a cluster member to join.";
    setMessage(statusText);
    render();
  }

  async function setMode(nextMode) {
    if (nextMode === mode) return;
    if (nextMode === "play") {
      const puzzle = await readPlayStatus();
      if (!playReady || !puzzle) {
        statusText = "Play needs a valid puzzle. Errors are listed below.";
        setMessage(statusText, "error");
        render();
        return;
      }
      mode = "play";
      show();
      applyPlayPuzzle(puzzle, { draftId });
      render();
      return;
    }
    mode = "construct";
    show();
    paintBoard();
    render();
  }

  async function restart() {
    selected = null;
    selectedClusterId = null;
    if (!draftId || !draftDocument) return;
    if (isConstruct()) {
      paintBoard();
      statusText = "Construct: add a term, or tap an unplaced term then a cluster member to join.";
      setMessage(statusText);
      render();
      return;
    }
    const puzzle = await readPlayStatus();
    if (!playReady || !puzzle) {
      statusText = "Play needs a valid puzzle. Errors are listed below.";
      setMessage(statusText, "error");
      render();
      return;
    }
    applyPlayPuzzle(puzzle, { draftId });
    render();
  }

  async function handleTap(node, event = null) {
    if (!isConstruct() || !node) return;
    if (event?.altKey || event?.metaKey) {
      const kind = describeNode(draftDocument, node).kind;
      if (kind === "bridge") {
        await mutate(current => deleteBridge(current, node.word), {
          message: `Deleted bridge "${node.word}".`
        });
      } else {
        await mutate(current => deleteTerm(current, node.word), {
          message: `Deleted "${node.word}".`,
          clearSelection: true
        });
      }
      return;
    }
    const result = interpretAuthorTap(draftDocument, selected, node);
    if (result.document !== draftDocument) {
      await persist(result.document, { message: result.message, clearSelection: true });
      return;
    }
    selected = result.selected;
    selectedClusterId = describeNode(draftDocument, selected).cluster?.id || null;
    paintBoard(selected?.word);
    if (result.message) setMessage(result.message);
    render();
  }

  async function handleClusterTap(clusterId, event = null) {
    if (!isConstruct() || !clusterId) return;
    if (event?.altKey || event?.metaKey) {
      await mutate(current => deleteCluster(current, clusterId), {
        message: "Cluster removed; its terms are unplaced.",
        clearSelection: true
      });
      return;
    }
    const result = interpretAuthorClusterTap(draftDocument, selected, clusterId);
    if (result.document !== draftDocument) {
      await persist(result.document, { message: result.message, clearSelection: true });
      return;
    }
    selected = result.selected;
    selectedClusterId = result.selectedClusterId || clusterId;
    paintBoard(selected?.word);
    if (result.message) setMessage(result.message);
    render();
  }

  function handleBackgroundClick() {
    if (!isConstruct()) return;
    const word = window.prompt("New term");
    if (!word) return;
    mutate(current => addTerm(current, word), {
      message: `Added "${word.trim()}".`,
      selectWord: word.trim()
    });
  }

  function termInfoText(word, cluster) {
    const info = cluster?.termInfo?.[word];
    if (!info) return "";
    return typeof info === "string" ? info : (info.text || "");
  }

  function inspectorHtml() {
    if (!draftDocument) return "";
    const clusters = Array.isArray(draftDocument.clusters) ? draftDocument.clusters : [];
    const described = selected ? describeNode(draftDocument, selected) : { kind: "none" };
    const cluster = selectedClusterId
      ? clusters.find(item => item.id === selectedClusterId)
      : described.cluster;
    const chips = clusters.map(item =>
      `<button type="button" class="authoring-chip${item.id === cluster?.id ? " selected" : ""}" data-select-cluster="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`
    ).join("");

    let body = `<div class="authoring-chips">${chips || "<span class=\"meta\">No clusters yet.</span>"}</div>`;

    if (described.kind === "unplaced") {
      body += `<h3>Unplaced term</h3>
        ${field("rename", described.word, { label: "name" })}
        <p class="meta">Tap a placed term to join a cluster, or make this its own cluster.</p>
        <button type="button" data-action="promote">New cluster from this term</button>
        <button type="button" data-action="delete-term">Delete</button>`;
    } else if (described.kind === "term" && described.cluster) {
      body += `<h3>Term</h3>
        ${field("rename", described.word, { label: "name" })}
        <label class="authoring-check"><input type="checkbox" data-action="toggle-seed"${described.seed ? " checked" : ""}> Seed</label>
        ${field("term-info", termInfoText(described.word, described.cluster), { label: "info", multiline: true })}
        <button type="button" data-action="delete-term">Delete</button>`;
    } else if (described.kind === "bridge" && described.bridge) {
      const bridge = described.bridge;
      const idealRows = (bridge.clusters || []).map(id => {
        const name = clusters.find(item => item.id === id)?.name || id;
        return field(`ideal:${id}`, bridge.idealTerms?.[id] || "", { label: `ideal term (${name})` });
      }).join("");
      body += `<h3>Bridge</h3>
        ${field("rename", bridge.term, { label: "term" })}
        ${field("bridge-fact", bridge.fact || "", { label: "fact", multiline: true })}
        <label>term role
          <select data-field="term-role">
            <option value="reference"${bridge.termRole !== "connector" ? " selected" : ""}>reference</option>
            <option value="connector"${bridge.termRole === "connector" ? " selected" : ""}>connector</option>
          </select>
        </label>
        <label>direction
          <select data-field="direction">
            ${DIRECTION_KINDS.map(kind =>
              `<option value="${kind}"${(bridge.direction?.kind || "undirected") === kind ? " selected" : ""}>${kind}</option>`
            ).join("")}
          </select>
        </label>
        ${idealRows}
        <p class="meta">Tap a term in another cluster to extend this pill (n-ary, max three).</p>
        <button type="button" data-action="delete-bridge">Delete</button>`;
    }

    if (cluster) {
      const colors = IDENTITY_COLOR_KEYS.map(color =>
        `<option value="${color}"${cluster.color === color ? " selected" : ""}>${color}</option>`
      ).join("");
      body += `<h3>Cluster</h3>
        ${field("cluster-name", cluster.name, { label: "name" })}
        <label>color<select data-field="cluster-color">${colors}</select></label>
        ${field("cluster-fact", cluster.fact || "", { label: "fact", multiline: true })}
        <button type="button" data-action="delete-cluster">Delete cluster</button>`;
    }

    const related = (draftDocument.relatedPuzzles?.entries || []).map((entry, index) =>
      `<div class="authoring-related" data-related="${index}">
        ${field(`related-id:${index}`, entry.id, { label: "related id" })}
        ${field(`related-reason:${index}`, entry.reason, { label: "reason" })}
      </div>`
    ).join("");
    const relatedCount = draftDocument.relatedPuzzles?.entries?.length || 0;
    body += `<h3>Puzzle</h3>
      ${field("puzzle-id", draftDocument.id || "", { label: "id" })}
      ${field("puzzle-title", draftDocument.title || "", { label: "title" })}
      <label>category
        <input data-field="puzzle-category" list="authoring-categories" value="${escapeHtml(draftDocument.category || "")}">
      </label>
      ${field("puzzle-info", draftDocument.info?.text || "", { label: "info", multiline: true })}
      ${related}
      <button type="button" data-action="add-related">Add related puzzle</button>
      ${relatedCount ? `<button type="button" data-action="save-related">Save related</button>` : ""}`;

    const lenses = Array.isArray(draftDocument.lenses) ? draftDocument.lenses : [];
    const lensRows = lenses.map(lens =>
      `<div class="authoring-lens" data-lens="${escapeHtml(lens.id)}">
        <p><strong>${escapeHtml(lens.id)}</strong></p>
        ${field(`lens-prompt:${lens.id}`, lens.prompt || "", { label: "prompt", multiline: true })}
        ${field(`lens-explanation:${lens.id}`, lens.explanation || "", { label: "explanation", multiline: true })}
        ${field(`lens-targets:${lens.id}`, (lens.targets || []).join(", "), { label: "targets (comma-separated)" })}
        <button type="button" data-action="save-lens" data-lens-id="${escapeHtml(lens.id)}">Save lens</button>
        <button type="button" data-action="delete-lens" data-lens-id="${escapeHtml(lens.id)}">Delete lens</button>
      </div>`
    ).join("");
    body += `<h3>Lenses</h3>
      ${lensRows || "<p class=\"meta\">None yet.</p>"}
      ${field("new-lens-id", "", { label: "new lens id" })}
      ${field("new-lens-prompt", "", { label: "prompt", multiline: true })}
      ${field("new-lens-explanation", "", { label: "explanation", multiline: true })}
      <button type="button" data-action="add-lens">Add lens</button>`;

    const intro = draftDocument.learningIntroduction || {};
    body += `<h3>Learning introduction</h3>
      <label>requirement
        <select data-field="lesson-requirement">
          <option value="required"${intro.requirement !== "optional" ? " selected" : ""}>required</option>
          <option value="optional"${intro.requirement === "optional" ? " selected" : ""}>optional</option>
        </select>
      </label>
      ${field("lesson-title", intro.title || "", { label: "title" })}
      ${field("lesson-summary", intro.summary || "", { label: "summary" })}
      <label>markdown
        <textarea data-field="lesson-text" class="authoring-markdown" spellcheck="true">${escapeHtml(intro.content?.text || "")}</textarea>
      </label>
      <div class="authoring-lesson-files">
        <label class="authoring-file">Import .md<input type="file" accept=".md,text/markdown,text/plain" data-import-lesson></label>
        <button type="button" data-action="export-lesson">Download .md</button>
      </div>
      <p class="meta">Edit here, or write the lesson in another editor and import the file. Preview is the saved markdown.</p>
      <div class="authoring-lesson-preview" data-lesson-preview></div>
      <button type="button" data-action="save-lesson">Save lesson</button>
      <button type="button" data-action="clear-lesson">Clear lesson</button>`;

    return body;
  }

  function errorListHtml() {
    if (playReady) {
      return `<p class="authoring-play-ok">Play is available. The document compiles.</p>`;
    }
    const items = playErrors.map(error => {
      const clusterMatch = /clusters\[(\d+)\]/.exec(error);
      const bridgeMatch = /bridges\[(\d+)\]/.exec(error);
      const cluster = clusterMatch && draftDocument?.clusters?.[Number(clusterMatch[1])];
      const bridge = bridgeMatch && draftDocument?.bridges?.[Number(bridgeMatch[1])];
      const anchor = cluster
        ? ` data-error-cluster="${escapeHtml(cluster.id)}"`
        : bridge
          ? ` data-error-bridge="${escapeHtml(bridge.term)}"`
          : "";
      return `<li${anchor}>${escapeHtml(error)}</li>`;
    }).join("");
    return `<ul class="authoring-errors">${items}</ul>`;
  }

  function render() {
    if (!root) return;
    if (!draftId || !draftDocument) {
      root.hidden = true;
      return;
    }
    root.hidden = false;
    const categoryOptions = Object.keys(CATEGORIES).map(name =>
      `<option value="${escapeHtml(name)}"></option>`
    ).join("");
    root.innerHTML = `
      <div class="authoring-studio-heading">
        <strong>Board authoring</strong>
        <span class="authoring-status">${escapeHtml(saving ? "Saving…" : statusText)}</span>
      </div>
      <div class="authoring-studio-actions">
        <button type="button" data-mode="construct" ${mode === "construct" ? "aria-pressed=\"true\"" : ""}>Construct</button>
        <button type="button" data-mode="play" ${mode === "play" ? "aria-pressed=\"true\"" : ""} ${playReady ? "" : "disabled"}>Play</button>
        <a href="/admin/drafts/${encodeURIComponent(draftId)}">Drafts page</a>
      </div>
      <div class="authoring-add">
        <input id="authoring-add-term" placeholder="Add term" ${mode === "construct" ? "" : "disabled"}>
        <button type="button" data-action="add-term" ${mode === "construct" ? "" : "disabled"}>Add term</button>
        <button type="button" data-action="add-cluster" ${mode === "construct" ? "" : "disabled"}>New cluster</button>
      </div>
      ${errorListHtml()}
      <div class="authoring-inspector" ${mode === "construct" ? "" : "hidden"}>
        ${inspectorHtml()}
      </div>
      <datalist id="authoring-categories">${categoryOptions}</datalist>
      <p class="meta">Star titles show cluster membership. Tap a title to select that cluster, or tap it after selecting an unplaced term to join. Alt-click a pill to delete it. Empty-board click adds a term.</p>
    `;
    const previewHost = root.querySelector("[data-lesson-preview]");
    if (previewHost) {
      const markdown = draftDocument.learningIntroduction?.content?.text;
      if (markdown && markdown.trim()) {
        previewHost.replaceChildren(renderSafeMarkdown(markdown, {}));
      } else {
        previewHost.textContent = "No lesson markdown yet.";
      }
    }
  }

  function valueOf(fieldName) {
    const el = root.querySelector(`[data-field="${fieldName}"]`);
    return el ? el.value : "";
  }

  root?.addEventListener("click", event => {
    const modeBtn = event.target.closest?.("[data-mode]");
    if (modeBtn) {
      setMode(modeBtn.getAttribute("data-mode"));
      return;
    }
    const clusterBtn = event.target.closest?.("[data-select-cluster]");
    if (clusterBtn) {
      selectedClusterId = clusterBtn.getAttribute("data-select-cluster");
      selected = null;
      paintBoard();
      render();
      return;
    }
    const errorCluster = event.target.closest?.("[data-error-cluster]");
    if (errorCluster) {
      selectedClusterId = errorCluster.getAttribute("data-error-cluster");
      selected = null;
      paintBoard();
      render();
      return;
    }
    const errorBridge = event.target.closest?.("[data-error-bridge]");
    if (errorBridge) {
      selected = { word: errorBridge.getAttribute("data-error-bridge") };
      paintBoard(selected.word);
      render();
      return;
    }
    const action = event.target.closest?.("[data-action]")?.getAttribute("data-action");
    if (!action) return;
    const described = selected ? describeNode(draftDocument, selected) : { kind: "none" };
    if (action === "add-term") {
      const word = root.querySelector("#authoring-add-term")?.value || "";
      mutate(current => addTerm(current, word), {
        message: `Added "${word.trim()}".`,
        selectWord: word.trim()
      });
    } else if (action === "add-cluster") {
      if (described.kind === "unplaced") {
        mutate(current => promoteUnplacedToCluster(current, described.word), {
          message: `Started a cluster with "${described.word}".`,
          selectWord: described.word
        });
      } else {
        const word = root.querySelector("#authoring-add-term")?.value
          || window.prompt("First term for the new cluster");
        if (!word) return;
        mutate(current => addClusterWithTerm(current, word), {
          message: `Added a cluster around "${word.trim()}".`,
          selectWord: word.trim()
        });
      }
    } else if (action === "promote") {
      mutate(current => promoteUnplacedToCluster(current, described.word), {
        message: `Started a cluster with "${described.word}".`,
        selectWord: described.word
      });
    } else if (action === "delete-term" && described.word) {
        mutate(current => deleteTerm(current, described.word), {
          message: `Deleted "${described.word}".`,
          clearSelection: true
        });
    } else if (action === "delete-bridge" && described.word) {
        mutate(current => deleteBridge(current, described.word), {
          message: `Deleted bridge "${described.word}".`,
          clearSelection: true
        });
    } else if (action === "delete-cluster" && selectedClusterId) {
        mutate(current => deleteCluster(current, selectedClusterId), {
          message: "Cluster removed; its terms are unplaced.",
          clearSelection: true
        });
    } else if (action === "add-related") {
      const entries = [...(draftDocument.relatedPuzzles?.entries || []), { id: "", reason: "" }];
      mutate(current => setRelatedPuzzles(current, entries));
    } else if (action === "save-related") {
      const entries = [...root.querySelectorAll(".authoring-related")].map((row, index) => ({
        id: valueOf(`related-id:${index}`),
        reason: valueOf(`related-reason:${index}`)
      }));
      mutate(current => setRelatedPuzzles(current, entries), { message: "Related puzzles saved." });
    } else if (action === "add-lens") {
      mutate(current => upsertLens(current, {
        id: valueOf("new-lens-id"),
        prompt: valueOf("new-lens-prompt"),
        explanation: valueOf("new-lens-explanation")
      }), { message: "Lens added." });
    } else if (action === "save-lens") {
      const id = event.target.closest("[data-action]").getAttribute("data-lens-id");
      mutate(current => upsertLens(current, {
        id,
        prompt: valueOf(`lens-prompt:${id}`),
        explanation: valueOf(`lens-explanation:${id}`),
        targets: valueOf(`lens-targets:${id}`).split(",").map(item => item.trim()).filter(Boolean)
      }), { message: "Lens saved." });
    } else if (action === "delete-lens") {
      const id = event.target.closest("[data-action]").getAttribute("data-lens-id");
      mutate(current => deleteLens(current, id), { message: "Lens deleted." });
    } else if (action === "export-lesson") {
      const text = draftDocument.learningIntroduction?.content?.text || "";
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement("a");
      link.href = url;
      link.download = `${draftDocument.id || "lesson"}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (action === "save-lesson") {
      mutate(current => setLearningIntroduction(current, {
        requirement: valueOf("lesson-requirement") || "required",
        title: valueOf("lesson-title"),
        summary: valueOf("lesson-summary"),
        text: valueOf("lesson-text")
      }), { message: "Lesson saved." });
    } else if (action === "clear-lesson") {
      mutate(current => setLearningIntroduction(current, { text: "" }), {
        message: "Lesson cleared."
      });
    } else if (action === "toggle-seed" && described.word) {
      mutate(current => toggleSeed(current, described.word), {
        selectWord: described.word,
        message: "Seed updated."
      });
    }
  });

  root?.addEventListener("change", event => {
    if (event.target?.hasAttribute?.("data-import-lesson")) {
      const input = event.target;
      const file = input.files?.[0];
      input.value = "";
      if (!file || !isConstruct() || !draftDocument) return;
      file.text().then(text => {
        mutate(current => setLearningIntroduction(current, {
          requirement: valueOf("lesson-requirement") || "required",
          title: valueOf("lesson-title"),
          summary: valueOf("lesson-summary"),
          text
        }), { message: `Imported ${file.name}.` });
      }).catch(error => {
        const text = error instanceof Error ? error.message : String(error);
        setMessage(text, "error");
      });
      return;
    }
    if (!isConstruct() || !draftDocument) return;
    const fieldName = event.target.getAttribute?.("data-field");
    if (!fieldName) return;
    const described = selected ? describeNode(draftDocument, selected) : { kind: "none" };
    if (fieldName === "rename" && described.word) {
      mutate(current => renameTerm(current, described.word, event.target.value), {
        selectWord: event.target.value.trim(),
        message: "Renamed."
      });
    } else if (fieldName === "term-info" && described.word) {
      mutate(current => setTermInfoText(current, described.word, event.target.value), {
        selectWord: described.word
      });
    } else if (fieldName === "toggle-seed" && described.word) {
      mutate(current => toggleSeed(current, described.word), { selectWord: described.word });
    } else if (fieldName === "bridge-fact" && described.word) {
      mutate(current => setBridgeFact(current, described.word, event.target.value), {
        selectWord: described.word
      });
    } else if (fieldName === "term-role" && described.word) {
      mutate(current => setBridgeTermRole(current, described.word, event.target.value), {
        selectWord: described.word
      });
    } else if (fieldName === "direction" && described.word) {
      mutate(current => setBridgeDirection(current, described.word, { kind: event.target.value }), {
        selectWord: described.word
      });
    } else if (fieldName.startsWith("ideal:") && described.word) {
      const clusterId = fieldName.slice("ideal:".length);
      mutate(current => setIdealTerm(current, described.word, clusterId, event.target.value), {
        selectWord: described.word
      });
    } else if (fieldName === "cluster-name" && selectedClusterId) {
      mutate(current => renameCluster(current, selectedClusterId, event.target.value), {
        selectClusterId: selectedClusterId
      });
    } else if (fieldName === "cluster-color" && selectedClusterId) {
      mutate(current => setClusterColor(current, selectedClusterId, event.target.value), {
        selectClusterId: selectedClusterId
      });
    } else if (fieldName === "cluster-fact" && selectedClusterId) {
      mutate(current => setClusterFact(current, selectedClusterId, event.target.value), {
        selectClusterId: selectedClusterId
      });
    } else if (fieldName === "puzzle-id" || fieldName === "puzzle-title" || fieldName === "puzzle-category" || fieldName === "puzzle-info") {
      mutate(current => setPuzzleChrome(current, {
        id: valueOf("puzzle-id"),
        title: valueOf("puzzle-title"),
        category: valueOf("puzzle-category"),
        infoText: valueOf("puzzle-info")
      }));
    }
  });

  root?.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.target.id !== "authoring-add-term") return;
    event.preventDefault();
    root.querySelector("[data-action='add-term']")?.click();
  });

  return {
    load,
    hide,
    restart,
    handleTap,
    handleClusterTap,
    handleBackgroundClick,
    isConstruct,
    selectedNode,
    getDocument: () => draftDocument,
    engine
  };
}
