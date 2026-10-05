// Mode-neutral layout authoring UI: the ?author=layout panel (prepare,
// local drafts, validated save) and the working-copy board experiments
// (free-term strip and bridge pre-connect).
//
// Production and the authoring-server player both gate the actions with
// ?admin so a reviewer at `/` sees the same chrome as production.
// Experiment toggles save only when a working copy is open. Public play
// keeps metadata and stats and cannot change the published record.

import { layoutDocumentForMode, layoutForMode } from "./layoutDocument.js";
import {
  clearLayoutDraft,
  loadLayoutDraft,
  saveLayoutDraft
} from "./layoutStore.js";
import {
  starFreeStripEnabled,
  starFreeStripCapacityNeeded,
  starBridgePreconnectEnabled,
  boardWithFlag
} from "./starLayoutRepository.js";

export function createLayoutAuthoringController({
  layoutAuthoringMode,
  adminMode,
  storage,
  getState,
  getMode,
  getBoard,
  showSolution,
  saveLayout = null,
  saveBoardFlags = null,
  getDraftId = () => null
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
  const layoutAuthoringSaveLayoutBtn = document.getElementById("layout-authoring-save-layout");
  const layoutAuthoringClearBtn = document.getElementById("layout-authoring-clear");
  const adminLayoutActionsEl = document.getElementById("admin-layout-actions");
  const layoutAuthorBtn = document.getElementById("layout-author-btn");
  const starFreeStripBtn = document.getElementById("star-free-strip-btn");
  const starBridgePreconnectBtn = document.getElementById("star-bridge-preconnect-btn");
  const adminLayoutHintEl = document.getElementById("admin-layout-hint");
  const savesToAuthoringServer = typeof saveLayout === "function";
  let savingLayout = false;

  layoutAuthoringEl.hidden = !layoutAuthoringMode;
  // Published layout overrides belong to the D1 authoring server. Static
  // player pages can still preview and keep a browser-local draft, but must
  // not present a file-export path that authors could mistake for publishing.
  layoutAuthoringSaveLayoutBtn.hidden = !savesToAuthoringServer;
  layoutAuthoringSaveLayoutBtn.textContent = "Save Layout";

  function isConstructView() {
    return !!globalThis.document?.body?.classList.contains("authoring-construct");
  }

  function syncLayoutActionVisibility() {
    adminLayoutActionsEl.hidden = !adminMode || layoutAuthoringMode || isConstructView();
  }

  syncLayoutActionVisibility();

  function reloadBoard(nextMode = getMode()) {
    const params = new URLSearchParams(location.search);
    params.set("mode", nextMode);
    const state = getState();
    if (state?.puzzle?.id && !params.get("draft")) {
      params.set("puzzle", state.puzzle.id);
    }
    location.assign(`${location.pathname}?${params.toString()}`);
  }

  function reloadStarBoard() {
    reloadBoard("star");
  }

  function boardSize() {
    const board = getBoard();
    return { width: board.width, height: board.height };
  }

  function currentAdapter() {
    const state = getState();
    const adapter = state?.layoutAdapter;
    return adapter?.mode === getMode() ? adapter : null;
  }

  function captureAuthorLayout() {
    return currentAdapter()?.capture?.({ purpose: "authoring" }) || null;
  }

  function validateAuthorLayout(layout, { allowUnsafe = false } = {}) {
    return currentAdapter()?.validate?.(layout, {
      purpose: "authoring",
      allowUnsafe,
      ...boardSize()
    }) || { valid: false, errors: ["The selected renderer cannot validate layouts"] };
  }

  function layoutMetrics() {
    return currentAdapter()?.metrics?.() || null;
  }

  function metricTotal(metrics, names) {
    return names.reduce((total, name) => total + (Number(metrics?.[name]) || 0), 0);
  }

  function localDraftFor(state) {
    const { width, height } = boardSize();
    return loadLayoutDraft(
      storage,
      state.puzzle,
      getMode(),
      width,
      height,
      { validate: currentAdapter()?.validate }
    );
  }

  function authoringPrepared() {
    const state = getState();
    return layoutAuthoringMode &&
      state &&
      state.made === state.need &&
      !!currentAdapter() &&
      typeof currentAdapter().capture === "function";
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
    const draft = localDraftFor(state);
    const metrics = prepared ? layoutMetrics() : null;
    const lineObstructions = metrics && metricTotal(metrics, [
      "edgeNodeIntersections",
      "edgeTitleIntersections",
      "lineHeadingIntersections",
      "lineCircleIntersections"
    ]);
    const overlaps = metrics?.overlaps ?? metrics?.hardOverlaps ?? 0;

    layoutMetricCrossingsEl.textContent = metrics ? metrics.lineCrossings : "—";
    layoutMetricPillCrossingsEl.textContent = metrics ? lineObstructions : "—";
    if (!metrics) {
      layoutMetricOverlapsEl.textContent = "—";
    } else if (overlaps > 0 && metrics.overlappingPairs?.length) {
      layoutMetricOverlapsEl.textContent =
        `${overlaps} (${metrics.overlappingPairs.join("; ")})`;
    } else {
      layoutMetricOverlapsEl.textContent = String(overlaps);
    }
    layoutAuthoringDraftStateEl.textContent = savesToAuthoringServer && layoutForMode(state.puzzle?.layout, getMode())
      ? "D1 layout saved"
      : draft
        ? "Local draft saved"
        : "No local draft";

    layoutAuthoringSaveBtn.disabled = !prepared;
    layoutAuthoringLoadBtn.disabled = !prepared || !draft;
    layoutAuthoringClearBtn.disabled = !draft;
    // Metrics are advisory. Curated authoring exists because automated
    // geometry (especially the padded overlap pad) is not the final word —
    // save when the author is ready; the selected renderer's schema
    // validation remains the final save guard.
    layoutAuthoringSaveLayoutBtn.disabled = !prepared || savingLayout;
  }

  function captureAndSaveAuthorDraft({ announce = false } = {}) {
    if (!authoringPrepared()) return null;
    const state = getState();
    const { width, height } = boardSize();
    const layout = captureAuthorLayout();
    const result = saveLayoutDraft(
      storage,
      layout,
      state.puzzle,
      getMode(),
      width,
      height,
      { validate: currentAdapter()?.validate }
    );
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
      let generatedLayoutPromise = null;
      if (preparingState.made !== preparingState.need) {
        showSolution();
      } else if (preparingState.layoutAdapter?.autoLayout) {
        generatedLayoutPromise = preparingState.layoutAdapter.autoLayout();
      } else if (preparingState.detangle) {
        generatedLayoutPromise = preparingState.detangle();
      }
      if (generatedLayoutPromise?.then) await generatedLayoutPromise;
      if (preparingState.detanglePromise) await preparingState.detanglePromise;
      if (preparingState.prettyPrintPromise) await preparingState.prettyPrintPromise;
      if (getState() !== preparingState) return;
      if (preparingState.solutionLayout === "animated" && preparingState.prettyPrint) {
        await preparingState.prettyPrint();
      }
      if (getState() !== preparingState) return;
      setLayoutAuthoringStatus("Generated layout ready — drag any node to edit it.", "good");
      updateLayoutAuthoringPanel();
      if (authoringPrepared()) {
        const metrics = layoutMetrics();
        const validation = validateAuthorLayout(captureAuthorLayout());
        if (!validation.valid) {
          setLayoutAuthoringStatus(
            `Generated layout ready — ${validation.errors.join("; ")} Drag to repair the layout before saving.`,
            "error"
          );
        } else if (metricTotal(metrics, [
          "edgeNodeIntersections",
          "edgeTitleIntersections",
          "lineHeadingIntersections",
          "lineCircleIntersections"
        ]) > 0 || metricTotal(metrics, ["overlaps", "hardOverlaps"]) > 0) {
          setLayoutAuthoringStatus(
            "Generated layout ready — overlaps/through-pills are advisory; drag to tidy if you want, or save when it looks right.",
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
    const layout = localDraftFor(state);
    if (!layout) {
      setLayoutAuthoringStatus("No compatible local draft was found.", "error");
      updateLayoutAuthoringPanel();
      return;
    }
    // Local drafts are scratch space, so preserve the Star-era behavior of
    // allowing an author to load an in-progress crossing and repair it on
    // the board. The explicit D1 Save Layout validation remains strict.
    const result = await state.layoutAdapter.apply(layout, {
      purpose: "authoring",
      allowUnsafe: true
    });
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
    const cleared = clearLayoutDraft(storage, state.puzzle, getMode(), width, height);
    setLayoutAuthoringStatus(cleared ? "Local draft cleared." : "Draft could not be cleared.");
    updateLayoutAuthoringPanel();
  });
  layoutAuthoringSaveLayoutBtn.addEventListener("click", async () => {
    if (!authoringPrepared()) return;
    const state = getState();
    const layout = captureAuthorLayout();
    const validation = validateAuthorLayout(layout);
    if (!validation.valid) {
      setLayoutAuthoringStatus(validation.errors.join("; "), "error");
      updateLayoutAuthoringPanel();
      return;
    }
    if (!savesToAuthoringServer) return;
    savingLayout = true;
    updateLayoutAuthoringPanel();
    setLayoutAuthoringStatus("Saving layout to D1…");
    try {
      const mode = getMode();
      const saved = await saveLayout({ puzzleId: state.puzzle.id, mode, layout });
      const savedModeLayout = layoutForMode(saved, mode) || layout;
      state.puzzle.layout = saved || layoutDocumentForMode(mode, layout);
      if (mode === "star") {
        state.puzzle.starLayout = savedModeLayout;
        state.lastSavedStarLayout = savedModeLayout;
      }
      state.lastSavedLayout = savedModeLayout;
      setLayoutAuthoringStatus("Layout saved to D1.", "good");
    } catch (error) {
      setLayoutAuthoringStatus(`Could not save layout: ${error.message}`, "error");
    } finally {
      savingLayout = false;
      updateLayoutAuthoringPanel();
    }
  });

  function workingCopyCanWriteBoard() {
    return adminMode && typeof saveBoardFlags === "function" && Boolean(getDraftId());
  }

  function setBoardFlagStatus(text) {
    if (!adminLayoutHintEl) return;
    adminLayoutHintEl.textContent = text ||
      "Final layout: Prepare → drag → Save Layout on the authoring server; cue the puzzle for the next Freeze when it is ready for production. Free-term strip and bridge pre-connect save on the open working copy.";
  }

  async function persistBoardFlag(key, value, reload) {
    const state = getState();
    if (!state?.puzzle || !workingCopyCanWriteBoard()) return;
    const board = boardWithFlag(state.puzzle, key, value);
    starFreeStripBtn.disabled = true;
    starBridgePreconnectBtn.disabled = true;
    try {
      await saveBoardFlags({ board });
      reload();
    } catch (error) {
      setBoardFlagStatus(error instanceof Error ? error.message : String(error));
      starFreeStripBtn.disabled = false;
      starBridgePreconnectBtn.disabled = false;
    }
  }

  function syncStarFreeStripButtons() {
    const state = getState();
    const canWrite = workingCopyCanWriteBoard();
    if (starFreeStripBtn) starFreeStripBtn.hidden = !canWrite;
    if (starBridgePreconnectBtn) starBridgePreconnectBtn.hidden = !canWrite;
    if (!state?.puzzle || !canWrite) return;
    const board = boardSize();
    const enabled = starFreeStripEnabled(state.puzzle, board);
    starFreeStripBtn.textContent = enabled
      ? "Clear free-term strip"
      : "Use free-term strip";
    const preconnect = starBridgePreconnectEnabled(state.puzzle);
    starBridgePreconnectBtn.textContent = preconnect
      ? "Clear bridge pre-connect"
      : "Pre-connect bridges";
  }

  if (adminMode && !layoutAuthoringMode) {
    layoutAuthorBtn?.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const params = new URLSearchParams(location.search);
      params.set("author", "layout");
      params.set("mode", getMode());
      // Layout authoring is its own mode; drop &admin so the meta dump does
      // not compete with the authoring panel. Catalogue context stays so the
      // admin can return to the same collection afterward. A draft overlay
      // keeps the D1 route and enters Play so the board is compiled.
      params.delete("admin");
      if (params.get("draft")) params.set("view", "play");
      else params.set("puzzle", state.puzzle.id);
      location.assign(`${location.pathname}?${params.toString()}`);
    });

    starFreeStripBtn?.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const size = boardSize();
      const next = !starFreeStripEnabled(state.puzzle, size);
      const heuristic = starFreeStripCapacityNeeded(state.puzzle, size.width, size.height);
      persistBoardFlag("starFreeStrip", next === heuristic ? undefined : next, reloadStarBoard);
    });
    starBridgePreconnectBtn?.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const next = !starBridgePreconnectEnabled(state.puzzle);
      persistBoardFlag("bridgePreconnect", next ? true : undefined, () => reloadBoard());
    });
  }

  function onPuzzleLoaded() {
    const state = getState();
    syncLayoutActionVisibility();
    syncStarFreeStripButtons();
    if (!layoutAuthoringMode || !state) return;
    // The renderer calls this after generated/curated placement and after
    // every literal author drag. Local storage is draft-only; the explicit
    // save action is the publication step when this is the D1 player.
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
