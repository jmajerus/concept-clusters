// Mode-neutral layout authoring UI: the ?author=layout panel (prepare,
// local drafts, validated save) and the working-copy board experiments
// (free-term strip and bridge pre-connect).
//
// Production and the authoring-server player both gate the actions with
// ?admin so a reviewer at `/` sees the same chrome as production.
// Experiment toggles save only when a working copy is open. Public play
// keeps metadata and stats and cannot change the published record.

import { LAYOUT_MODES, layoutDocumentForMode, layoutForMode } from "./layoutDocument.js";
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
import { layoutIsFixed } from "./layoutHints.js";
import {
  boardSizeFactor,
  canonicalBoardSizeFactor
} from "./puzzleBoardSize.js";

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
  getDraftId = () => null,
  previewBoardSize = null
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
  const layoutAuthoringFixedEl = document.getElementById("layout-authoring-fixed");
  const layoutAuthoringFixedInput = document.getElementById("layout-authoring-fixed-input");
  const adminLayoutActionsEl = document.getElementById("admin-layout-actions");
  const layoutAuthorBtn = document.getElementById("layout-author-btn");
  const starFreeStripBtn = document.getElementById("star-free-strip-btn");
  const starBridgePreconnectBtn = document.getElementById("star-bridge-preconnect-btn");
  const boardSizeFactorEl = document.getElementById("board-size-factor");
  const boardSizeFactorInput = document.getElementById("board-size-factor-input");
  const boardSizeFactorReadout = document.getElementById("board-size-factor-readout");
  const adminLayoutHintEl = document.getElementById("admin-layout-hint");
  let savedSizeFactor = 1;
  const savesToAuthoringServer = typeof saveLayout === "function";
  let savingLayout = false;

  layoutAuthoringEl.hidden = !layoutAuthoringMode;
  // Published layout overrides belong to the D1 authoring server. Static
  // player pages can still preview and keep a browser-local draft, but must
  // not present a file-export path that authors could mistake for publishing.
  layoutAuthoringSaveLayoutBtn.hidden = !savesToAuthoringServer;
  if (layoutAuthoringFixedEl) layoutAuthoringFixedEl.hidden = !savesToAuthoringServer;
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
    // A working copy keeps whichever URL opened it; rewriting puzzle= to
    // the published id would silently leave the draft.
    if (state?.puzzle?.id && !params.get("draft") && !getDraftId()) {
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

  // Mode names as the player's mode buttons label them.
  const MODE_LABELS = { star: "Star", graph: "Graph", sets: "Circle" };

  // Save Layout writes to the open working copy when one is loaded and to
  // the published row otherwise. Only the published row reaches players.
  function savedLayoutState(state) {
    const modes = LAYOUT_MODES.filter(mode => layoutForMode(state.puzzle?.layout, mode));
    if (!modes.length) return null;
    const where = getDraftId() ? "draft" : "published";
    const names = modes.map(mode => layoutIsFixed(layoutForMode(state.puzzle.layout, mode))
      ? MODE_LABELS[mode]
      : `${MODE_LABELS[mode]} (hint)`);
    return `Saved on ${where}: ${names.join(", ")}`;
  }

  function savedLayoutMessage(mode, fixed) {
    const draftId = getDraftId();
    const kind = fixed ? "layout (fixed positions)" : "layout as a hint";
    return draftId
      ? `${MODE_LABELS[mode]} ${kind} saved to draft "${draftId}". Publish the draft to show it to players.`
      : `${MODE_LABELS[mode]} ${kind} saved to the published puzzle. Live for players.`;
  }

  // Graph and Circle can use a saved layout as a hint (layoutHints.js);
  // Star always applies its saved layout exactly for now.
  function modeSupportsHints(mode = getMode()) {
    return mode === "graph" || mode === "sets";
  }

  // The checkbox shows the saved layout's kind; with nothing saved, a new
  // save defaults to a hint.
  function syncFixedCheckbox(state) {
    if (!layoutAuthoringFixedInput) return;
    const saved = layoutForMode(state?.puzzle?.layout, getMode());
    const hints = modeSupportsHints();
    layoutAuthoringFixedInput.disabled = !hints;
    layoutAuthoringFixedInput.checked = !hints || (saved ? layoutIsFixed(saved) : false);
    layoutAuthoringFixedEl.title = hints
      ? "Checked: players get these exact positions. Unchecked: the layout engine keeps this arrangement but recomputes positions, so the layout survives puzzle edits and board-size changes."
      : "Star layouts always use exact positions for now.";
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
    const localState = draft ? "Local draft saved" : "No local draft";
    const savedState = savesToAuthoringServer ? savedLayoutState(state) : null;
    layoutAuthoringDraftStateEl.textContent = savedState
      ? `${savedState} · ${localState}`
      : localState;

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

  function savedModeLayout(state) {
    return layoutForMode(state?.puzzle?.layout, getMode()) || null;
  }

  // Solving the board runs each renderer's polish pass, which already
  // prefers the saved layout when it validates (Star also needs it
  // uncrossed at this size). Report which one the author got, and when the
  // polish passed it over, still show it for repair if it fits the terms.
  // Graph and Circle report how they used the saved layout (see
  // state.layoutSource in their renderers).
  function hintSourceMessage(preparingState, saved, label) {
    const source = preparingState.layoutSource || { kind: "generated" };
    if (source.kind === "fixed") return { text: `Loaded saved ${label} layout (fixed positions)`, tone: "good" };
    const outdated = source.fixedErrors?.length
      ? `Fixed ${label} layout no longer fits (${source.fixedErrors.join("; ")}); `
      : "";
    if (source.kind === "hint") {
      return {
        text: outdated
          ? `${outdated}used it as a hint (arrangement kept, positions recomputed)`
          : `Loaded saved ${label} layout as a hint (arrangement kept, positions recomputed)`,
        tone: outdated ? "error" : "good"
      };
    }
    return {
      text: source.hintRejected
        ? `${outdated}saved ${label} arrangement gave more crossings or overlaps here than a fresh search; generated one instead`
        : `${outdated}saved ${label} layout could not be read as a hint; generated one instead`,
      tone: "error"
    };
  }

  async function reconcileSavedLayout(preparingState, saved) {
    const label = MODE_LABELS[getMode()];
    if (modeSupportsHints()) {
      const message = hintSourceMessage(preparingState, saved, label);
      return { ...message, text: message.text.charAt(0).toUpperCase() + message.text.slice(1) };
    }
    const strict = validateAuthorLayout(saved);
    const polishUsedSaved = getMode() === "star"
      ? preparingState.prettyPrintStats?.source === "curated"
      : strict.valid;
    if (polishUsedSaved) return { text: `Loaded saved ${label} layout`, tone: "good" };
    const loose = strict.valid ? strict : validateAuthorLayout(saved, { allowUnsafe: true });
    if (!loose.valid) {
      return {
        text: `Saved ${label} layout no longer fits this board (${loose.errors.join("; ")}); generated one instead`,
        tone: "error"
      };
    }
    const applied = await preparingState.layoutAdapter.apply(saved, {
      purpose: "authoring",
      allowUnsafe: !strict.valid,
      ...boardSize()
    });
    if (getState() !== preparingState) return null;
    if (!applied?.valid) {
      return {
        text: `Saved ${label} layout could not be applied (${(applied?.errors || []).join("; ")}); generated one instead`,
        tone: "error"
      };
    }
    const problems = strict.valid
      ? "it has line crossings at this size"
      : strict.errors.join("; ");
    return {
      text: `Loaded saved ${label} layout, but players get a generated one until it is repaired and saved: ${problems}`,
      tone: "error"
    };
  }

  async function prepareLayoutAuthoringBoard() {
    const preparingState = getState();
    if (!layoutAuthoringMode || !preparingState) return;
    const label = MODE_LABELS[getMode()];
    const saved = savedModeLayout(preparingState);
    // Only a fresh solve starts from the saved layout. Prepare on an
    // already-solved board is the explicit "generate a new one" request.
    const fromSaved = Boolean(saved) && preparingState.made !== preparingState.need;
    layoutAuthoringPrepareBtn.disabled = true;
    setLayoutAuthoringStatus(fromSaved ? `Loading saved ${label} layout…` : "Generating a layout…");
    try {
      let generatedLayoutPromise = null;
      if (preparingState.made !== preparingState.need) {
        showSolution();
      } else {
        // An explicit regenerate: renderers skip the saved layout for it.
        preparingState.ignoreSavedLayout = true;
        if (preparingState.layoutAdapter?.autoLayout) {
          generatedLayoutPromise = preparingState.layoutAdapter.autoLayout();
        } else if (preparingState.detangle) {
          generatedLayoutPromise = preparingState.detangle();
        }
      }
      try {
        if (generatedLayoutPromise?.then) await generatedLayoutPromise;
      } finally {
        preparingState.ignoreSavedLayout = false;
      }
      if (preparingState.detanglePromise) await preparingState.detanglePromise;
      if (preparingState.prettyPrintPromise) await preparingState.prettyPrintPromise;
      if (getState() !== preparingState) return;
      if (preparingState.solutionLayout === "animated" && preparingState.prettyPrint) {
        await preparingState.prettyPrint();
      }
      if (getState() !== preparingState) return;
      const source = fromSaved
        ? await reconcileSavedLayout(preparingState, saved)
        : saved
          ? { text: `Generated a new layout; the saved ${label} layout stays until you save over it`, tone: "good" }
          : { text: `No saved ${label} layout; generated one`, tone: "good" };
      if (!source || getState() !== preparingState) return;
      setLayoutAuthoringStatus(`${source.text}. Drag any node to edit it.`, source.tone);
      updateLayoutAuthoringPanel();
      if (source.tone === "good" && authoringPrepared()) {
        const metrics = layoutMetrics();
        const validation = validateAuthorLayout(captureAuthorLayout());
        if (!validation.valid) {
          setLayoutAuthoringStatus(
            `${source.text}. ${validation.errors.join("; ")} Drag to repair the layout before saving.`,
            "error"
          );
        } else if (metricTotal(metrics, [
          "edgeNodeIntersections",
          "edgeTitleIntersections",
          "lineHeadingIntersections",
          "lineCircleIntersections"
        ]) > 0 || metricTotal(metrics, ["overlaps", "hardOverlaps"]) > 0) {
          setLayoutAuthoringStatus(
            `${source.text}. Overlaps/through-pills are advisory; drag to tidy if you want, or save when it looks right.`,
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
    // A hint only needs to describe the arrangement; exact positions must
    // pass the renderer's full check.
    const fixed = !modeSupportsHints() || !!layoutAuthoringFixedInput?.checked;
    if (layout && modeSupportsHints()) layout.fixed = fixed;
    const validation = validateAuthorLayout(layout, { allowUnsafe: !fixed });
    if (!validation.valid) {
      setLayoutAuthoringStatus(validation.errors.join("; "), "error");
      updateLayoutAuthoringPanel();
      return;
    }
    if (!savesToAuthoringServer) return;
    savingLayout = true;
    updateLayoutAuthoringPanel();
    const mode = getMode();
    setLayoutAuthoringStatus(getDraftId() ? "Saving layout to draft…" : "Saving layout to published puzzle…");
    try {
      const saved = await saveLayout({ puzzleId: state.puzzle.id, mode, layout });
      const savedModeLayout = layoutForMode(saved, mode) || layout;
      state.puzzle.layout = saved || layoutDocumentForMode(mode, layout);
      if (mode === "star") {
        state.puzzle.starLayout = savedModeLayout;
        state.lastSavedStarLayout = savedModeLayout;
      }
      state.lastSavedLayout = savedModeLayout;
      setLayoutAuthoringStatus(savedLayoutMessage(mode, fixed), "good");
      syncFixedCheckbox(state);
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
      "Final layout: Prepare → drag → Save Layout on the authoring server; cue the puzzle for the next Freeze when it is ready for production. Free-term strip, bridge pre-connect, and board size save on the open working copy.";
  }

  function setBoardControlsDisabled(disabled) {
    if (starFreeStripBtn) starFreeStripBtn.disabled = disabled;
    if (starBridgePreconnectBtn) starBridgePreconnectBtn.disabled = disabled;
    if (boardSizeFactorInput) boardSizeFactorInput.disabled = disabled;
  }

  function sizeReadout(factor, size) {
    const percent = Math.round((factor - 1) * 100);
    const label = percent === 0 ? "0%" : `${percent > 0 ? "+" : ""}${percent}%`;
    if (!size?.width || !size?.height) return label;
    return `${label} · ${size.width}×${size.height}`;
  }

  function syncBoardSizeControl() {
    const state = getState();
    const canWrite = workingCopyCanWriteBoard();
    if (boardSizeFactorEl) boardSizeFactorEl.hidden = !canWrite;
    if (!boardSizeFactorInput || !state?.puzzle || !canWrite) return;
    const factor = boardSizeFactor(state.puzzle);
    savedSizeFactor = factor;
    boardSizeFactorInput.value = String(factor);
    if (boardSizeFactorReadout) {
      boardSizeFactorReadout.textContent = sizeReadout(factor, getBoard());
    }
  }

  async function persistBoardFlag(key, value, reload) {
    const state = getState();
    if (!state?.puzzle || !workingCopyCanWriteBoard()) return;
    const board = boardWithFlag(state.puzzle, key, value);
    setBoardControlsDisabled(true);
    try {
      await saveBoardFlags({ board });
      if (key === "sizeFactor") savedSizeFactor = typeof value === "number" && value !== 1 ? value : 1;
      if (typeof reload === "function") reload();
      else setBoardControlsDisabled(false);
    } catch (error) {
      setBoardFlagStatus(error instanceof Error ? error.message : String(error));
      setBoardControlsDisabled(false);
      if (key === "sizeFactor") {
        boardSizeFactorInput.value = String(savedSizeFactor);
        previewBoardSize?.(savedSizeFactor, { rebuild: "now" });
        syncBoardSizeControl();
      }
    }
  }

  function syncStarFreeStripButtons() {
    const state = getState();
    const canWrite = workingCopyCanWriteBoard();
    if (starFreeStripBtn) starFreeStripBtn.hidden = !canWrite;
    if (starBridgePreconnectBtn) starBridgePreconnectBtn.hidden = !canWrite;
    syncBoardSizeControl();
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

    boardSizeFactorInput?.addEventListener("input", () => {
      const factor = canonicalBoardSizeFactor(boardSizeFactorInput.value);
      if (factor == null || typeof previewBoardSize !== "function") return;
      const size = previewBoardSize(factor);
      if (boardSizeFactorReadout && size) {
        boardSizeFactorReadout.textContent = sizeReadout(factor, size);
      }
    });
    boardSizeFactorInput?.addEventListener("change", () => {
      const factor = canonicalBoardSizeFactor(boardSizeFactorInput.value);
      if (factor == null) return;
      previewBoardSize?.(factor, { rebuild: "now" });
      const size = getBoard();
      if (boardSizeFactorReadout) {
        boardSizeFactorReadout.textContent = sizeReadout(factor, size);
      }
      persistBoardFlag("sizeFactor", factor !== 1 ? factor : undefined, null);
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
    syncFixedCheckbox(state);
    updateLayoutAuthoringPanel();
    // Start from the saved override when there is one, rather than an
    // unsolved board that hides it until Prepare.
    if (savedModeLayout(state) && state.made !== state.need) {
      setTimeout(() => {
        if (getState() === state) prepareLayoutAuthoringBoard();
      }, 0);
    }
  }

  return {
    onPuzzleLoaded,
    syncStarFreeStripButtons,
    reloadBoard
  };
}
