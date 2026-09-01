// Star-mode layout authoring UI: the ?author=layout panel (prepare,
// local drafts, validated export) and the layout actions (jump into
// authoring, local free-strip / seed-beside-title tries).
//
// On the LAN authoring server these actions are always available. The
// production player still gates them with ?admin.
//
// Schema, draft storage, and committed overrides live in
// starLayoutSchema.js / starLayoutStore.js / starLayoutRepository.js.
// This module is the browser controller over those, using the same
// factory-with-injected-dependencies convention as createOverviewRenderer
// and createAppNavigation. Player-loop policy (force Star, skip sessions,
// skip the learning gate, disable Graph/Sets) stays in game.js.

import { validateStarLayoutDocument } from "./starLayoutSchema.js";
import {
  clearStarLayoutDraft,
  loadStarLayoutDraft,
  saveStarLayoutDraft
} from "./starLayoutStore.js";
import {
  repositoryStarFreeStrip,
  starFreeStripEnabled,
  starFreeStripCapacityNeeded,
  STAR_FREE_STRIP_STORAGE_KEY,
  starSeedBesideTitleEnabled,
  STAR_SEED_BESIDE_TITLE_STORAGE_KEY
} from "./starLayoutRepository.js";

function readJsonObject(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function createLayoutAuthoringController({
  layoutAuthoringMode,
  adminMode,
  storage,
  getState,
  getMode,
  getBoard,
  showSolution
}) {
  const layoutAuthoringEl = document.getElementById("layout-authoring");
  const layoutAuthoringDraftStateEl = document.getElementById("layout-authoring-draft-state");
  const layoutAuthoringStatusEl = document.getElementById("layout-authoring-status");
  const layoutMetricCrossingsEl = document.getElementById("layout-metric-crossings");
  const layoutMetricPillCrossingsEl = document.getElementById("layout-metric-pill-crossings");
  const layoutMetricOverlapsEl = document.getElementById("layout-metric-overlaps");
  const layoutAuthoringPrepareBtn = document.getElementById("layout-authoring-prepare");
  const layoutAuthoringSaveBtn = document.getElementById("layout-authoring-save");
  const layoutAuthoringLoadBtn = document.getElementById("layout-authoring-load");
  const layoutAuthoringExportBtn = document.getElementById("layout-authoring-export");
  const layoutAuthoringClearBtn = document.getElementById("layout-authoring-clear");
  const adminLayoutActionsEl = document.getElementById("admin-layout-actions");
  const starLayoutAuthorBtn = document.getElementById("star-layout-author-btn");
  const starFreeStripBtn = document.getElementById("star-free-strip-btn");
  const starFreeStripExportBtn = document.getElementById("star-free-strip-export-btn");
  const starSeedBesideTitleBtn = document.getElementById("star-seed-beside-title-btn");

  layoutAuthoringEl.hidden = !layoutAuthoringMode;

  function isConstructView() {
    return !!globalThis.document?.body?.classList.contains("authoring-construct");
  }

  function syncLayoutActionVisibility() {
    adminLayoutActionsEl.hidden = !adminMode || layoutAuthoringMode || isConstructView();
  }

  syncLayoutActionVisibility();

  function reloadStarBoard() {
    const params = new URLSearchParams(location.search);
    params.set("mode", "star");
    const state = getState();
    if (state?.puzzle?.id && !params.get("draft")) {
      params.set("puzzle", state.puzzle.id);
    }
    location.assign(`${location.pathname}?${params.toString()}`);
  }

  function boardSize() {
    const board = getBoard();
    return { width: board.width, height: board.height };
  }

  function authoringPrepared() {
    const state = getState();
    return layoutAuthoringMode &&
      getMode() === "star" &&
      state &&
      state.made === state.need &&
      typeof state.captureStarLayout === "function";
  }

  function setLayoutAuthoringStatus(text, tone = "") {
    if (!layoutAuthoringMode) return;
    layoutAuthoringStatusEl.textContent = text;
    layoutAuthoringStatusEl.dataset.tone = tone;
  }

  function updateLayoutAuthoringPanel() {
    const state = getState();
    if (!layoutAuthoringMode || !state) return;
    const prepared = authoringPrepared();
    const { width, height } = boardSize();
    const draft = loadStarLayoutDraft(storage, state.puzzle, width, height);
    const metrics = prepared ? state.getStarLayoutMetrics() : null;

    layoutMetricCrossingsEl.textContent = metrics ? metrics.lineCrossings : "—";
    layoutMetricPillCrossingsEl.textContent = metrics ? metrics.edgeNodeIntersections : "—";
    if (!metrics) {
      layoutMetricOverlapsEl.textContent = "—";
    } else if (metrics.overlaps > 0 && metrics.overlappingPairs?.length) {
      layoutMetricOverlapsEl.textContent =
        `${metrics.overlaps} (${metrics.overlappingPairs.join("; ")})`;
    } else {
      layoutMetricOverlapsEl.textContent = String(metrics.overlaps);
    }
    layoutAuthoringDraftStateEl.textContent = draft ? "Local draft saved" : "No local draft";

    layoutAuthoringSaveBtn.disabled = !prepared;
    layoutAuthoringLoadBtn.disabled = !prepared || !draft;
    layoutAuthoringClearBtn.disabled = !draft;
    // Metrics are advisory. Curated authoring exists because automated
    // geometry (especially the padded overlap pad) is not the final word —
    // export when the author is ready; only true line crossings still fail
    // schema validation on click.
    layoutAuthoringExportBtn.disabled = !prepared;
  }

  function captureAndSaveAuthorDraft({ announce = false } = {}) {
    if (!authoringPrepared()) return null;
    const state = getState();
    const { width, height } = boardSize();
    const layout = state.captureStarLayout();
    const result = saveStarLayoutDraft(storage, layout, state.puzzle, width, height);
    if (announce) {
      setLayoutAuthoringStatus(
        result.valid ? "Draft saved locally." : result.errors.join("; "),
        result.valid ? "good" : "error"
      );
    }
    updateLayoutAuthoringPanel();
    return result.valid ? layout : null;
  }

  async function prepareLayoutAuthoringBoard() {
    const preparingState = getState();
    if (!layoutAuthoringMode || !preparingState) return;
    layoutAuthoringPrepareBtn.disabled = true;
    setLayoutAuthoringStatus("Preparing the generated solution…");
    try {
      if (preparingState.made !== preparingState.need) {
        showSolution();
      } else if (!preparingState.captureStarLayout && preparingState.detangle) {
        preparingState.detangle();
      }
      if (preparingState.detanglePromise) await preparingState.detanglePromise;
      if (getState() !== preparingState) return;
      if (preparingState.solutionLayout === "animated" && preparingState.prettyPrint) {
        await preparingState.prettyPrint();
      }
      if (getState() !== preparingState) return;
      setLayoutAuthoringStatus("Generated layout ready — drag any node to edit it.", "good");
      updateLayoutAuthoringPanel();
      if (authoringPrepared()) {
        const metrics = preparingState.getStarLayoutMetrics();
        if (metrics.lineCrossings > 0) {
          setLayoutAuthoringStatus(
            "Generated layout ready — line crossings block export; drag to clear them before exporting.",
            "error"
          );
        } else if (metrics.edgeNodeIntersections > 0 || metrics.overlaps > 0) {
          setLayoutAuthoringStatus(
            "Generated layout ready — overlaps/through-pills are advisory; drag to tidy if you want, or export when it looks right.",
            "good"
          );
        }
      }
    } catch (error) {
      setLayoutAuthoringStatus(`Could not prepare layout: ${error.message}`, "error");
    } finally {
      layoutAuthoringPrepareBtn.disabled = false;
      updateLayoutAuthoringPanel();
    }
  }

  layoutAuthoringPrepareBtn.addEventListener("click", prepareLayoutAuthoringBoard);
  layoutAuthoringSaveBtn.addEventListener("click", () => captureAndSaveAuthorDraft({ announce: true }));
  layoutAuthoringLoadBtn.addEventListener("click", async () => {
    if (!authoringPrepared()) return;
    const state = getState();
    const { width, height } = boardSize();
    const layout = loadStarLayoutDraft(storage, state.puzzle, width, height);
    if (!layout) {
      setLayoutAuthoringStatus("No compatible local draft was found.", "error");
      updateLayoutAuthoringPanel();
      return;
    }
    const result = await state.applyStarLayout(layout);
    setLayoutAuthoringStatus(
      result.valid ? "Local draft loaded." : result.errors.join("; "),
      result.valid ? "good" : "error"
    );
    updateLayoutAuthoringPanel();
  });
  layoutAuthoringClearBtn.addEventListener("click", () => {
    const state = getState();
    if (!state) return;
    const { width, height } = boardSize();
    const cleared = clearStarLayoutDraft(storage, state.puzzle, width, height);
    setLayoutAuthoringStatus(cleared ? "Local draft cleared." : "Draft could not be cleared.");
    updateLayoutAuthoringPanel();
  });
  layoutAuthoringExportBtn.addEventListener("click", () => {
    if (!authoringPrepared()) return;
    const state = getState();
    const { width, height } = boardSize();
    const layout = state.captureStarLayout();
    const validation = validateStarLayoutDocument(
      layout,
      state.puzzle,
      { width, height }
    );
    if (!validation.valid) {
      setLayoutAuthoringStatus(validation.errors.join("; "), "error");
      updateLayoutAuthoringPanel();
      return;
    }
    downloadJson(`${state.puzzle.id}-star-layout.json`, layout);
    state.lastExportedStarLayout = layout;
    setLayoutAuthoringStatus("Repository-ready JSON exported.", "good");
  });

  function syncStarFreeStripButtons() {
    const state = getState();
    if (!state?.puzzle) return;
    const board = boardSize();
    const enabled = starFreeStripEnabled(state.puzzle, board);
    const repoEnabled = repositoryStarFreeStrip(state.puzzle);
    const seedEnabled = starSeedBesideTitleEnabled(state.puzzle, board);
    // Strip implies seed-beside-title; the seed button still reflects the
    // local override when strip is off.
    const overrides = readJsonObject(storage, STAR_SEED_BESIDE_TITLE_STORAGE_KEY);
    const seedOverride = overrides[state.puzzle.id] === true;
    starFreeStripBtn.textContent = enabled
      ? "Clear free-term strip"
      : "Use free-term strip";
    // Show export only when the effective setting would change the sparse
    // registry (capacity auto-on with no lock still differs from repo).
    starFreeStripExportBtn.hidden = enabled === repoEnabled;
    starFreeStripExportBtn.textContent = enabled
      ? "Export strip flag"
      : "Export clear-strip flag";
    starSeedBesideTitleBtn.textContent = seedOverride
      ? "Clear seed-beside-title"
      : "Seed beside titles";
    starSeedBesideTitleBtn.disabled = enabled;
    starSeedBesideTitleBtn.title = enabled
      ? "Implied by free-term strip"
      : seedEnabled
        ? "Local try: connected seeds start beside their titles"
        : "Local try: place connected seeds beside titles on cold start";
  }

  if (adminMode && !layoutAuthoringMode) {
    starLayoutAuthorBtn.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const params = new URLSearchParams(location.search);
      params.set("author", "layout");
      params.set("mode", "star");
      // Layout authoring is its own mode; drop &admin so the meta dump does
      // not compete with the authoring panel. Catalogue context stays so the
      // admin can return to the same collection afterward. A draft overlay
      // keeps `draft=` and enters Play so the board is the compiled puzzle.
      params.delete("admin");
      if (params.get("draft")) params.set("view", "play");
      else params.set("puzzle", state.puzzle.id);
      location.assign(`${location.pathname}?${params.toString()}`);
    });

    starFreeStripBtn.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const id = state.puzzle.id;
      const board = boardSize();
      const overrides = readJsonObject(storage, STAR_FREE_STRIP_STORAGE_KEY);
      const next = !starFreeStripEnabled(state.puzzle, board);
      overrides[id] = next;
      // Drop the override only when it matches the non-override default
      // (repo lock or capacity heuristic). A forced-off against capacity
      // must keep override:false or the heuristic would turn strip back on.
      const defaultOn = repositoryStarFreeStrip(state.puzzle) ||
        starFreeStripCapacityNeeded(state.puzzle, board.width, board.height);
      if (next === defaultOn) delete overrides[id];
      storage.setItem(STAR_FREE_STRIP_STORAGE_KEY, JSON.stringify(overrides));
      reloadStarBoard();
    });
    starFreeStripExportBtn.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const freeStrip = starFreeStripEnabled(state.puzzle, boardSize());
      downloadJson(`${state.puzzle.id}-star-free-strip.json`, {
        schemaVersion: 1,
        kind: "star-free-strip",
        puzzleId: state.puzzle.id,
        freeStrip
      });
    });
    starSeedBesideTitleBtn.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle || starFreeStripEnabled(state.puzzle, boardSize())) return;
      const id = state.puzzle.id;
      const overrides = readJsonObject(storage, STAR_SEED_BESIDE_TITLE_STORAGE_KEY);
      if (overrides[id] === true) delete overrides[id];
      else overrides[id] = true;
      storage.setItem(STAR_SEED_BESIDE_TITLE_STORAGE_KEY, JSON.stringify(overrides));
      reloadStarBoard();
    });
  }

  function onPuzzleLoaded() {
    const state = getState();
    syncLayoutActionVisibility();
    syncStarFreeStripButtons();
    if (!layoutAuthoringMode || !state) return;
    // The renderer calls this after generated/curated placement and after
    // every literal author drag. Local storage is draft-only; repository
    // publication still requires the explicit validated export/import step.
    state.onAuthorLayoutChanged = reason => {
      if (reason === "drag") captureAndSaveAuthorDraft();
      else updateLayoutAuthoringPanel();
    };
    setLayoutAuthoringStatus("");
    updateLayoutAuthoringPanel();
  }

  return {
    onPuzzleLoaded,
    syncStarFreeStripButtons
  };
}
