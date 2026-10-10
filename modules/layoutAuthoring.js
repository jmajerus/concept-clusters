// Mode-neutral layout authoring UI: the ?author=layout panel (prepare,
// local drafts, validated save) and the working-copy board experiments
// (free-term strip, bridge pre-connect, lens flow trace, lens reveal cue)
// and the site settings card.
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
import { lensFlowTraceEnabled } from "./lensFlowTrace.js";
import {
  globalLensRevealCue,
  lensRevealHoverPingEnabled,
  LENS_REVEAL_CUE_LABELS,
  LENS_REVEAL_CUES,
  puzzleLensRevealCue,
  resolveLensRevealCue
} from "./lensRevealCue.js";
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
  saveLayoutBoard = null,
  layoutPass = null,
  getDraftId = () => null,
  previewBoardSize = null,
  previewLensRevealCue = null,
  getSiteSettings = () => ({}),
  saveSiteSettings = null
}) {
  const layoutAuthoringEl = document.getElementById("layout-authoring");
  const layoutAuthoringDraftStateEl = document.getElementById("layout-authoring-draft-state");
  const layoutAuthoringStatusEl = document.getElementById("layout-authoring-status");
  const layoutMetricCrossingsEl = document.getElementById("layout-metric-crossings");
  const layoutMetricPillCrossingsEl = document.getElementById("layout-metric-pill-crossings");
  const layoutMetricOverlapsEl = document.getElementById("layout-metric-overlaps");
  const layoutMetricNearEdgeEl = document.getElementById("layout-metric-near-edge");
  const layoutAuthoringPrepareBtn = document.getElementById("layout-authoring-prepare");
  const layoutAuthoringSaveBtn = document.getElementById("layout-authoring-save");
  const layoutAuthoringLoadBtn = document.getElementById("layout-authoring-load");
  const layoutAuthoringSaveLayoutBtn = document.getElementById("layout-authoring-save-layout");
  const layoutAuthoringClearBtn = document.getElementById("layout-authoring-clear");
  const layoutAuthoringFixedEl = document.getElementById("layout-authoring-fixed");
  const runPassBtn = document.getElementById("layout-authoring-run-pass");
  const savePassBtn = document.getElementById("layout-authoring-save-pass");
  const passEl = document.getElementById("layout-authoring-pass");
  // The progress area redraws every poll; only state changes are announced.
  const passAnnounceEl = document.getElementById("layout-authoring-pass-announce");
  let lastAnnounced = null;
  const announcePass = (key, text) => {
    if (!passAnnounceEl || key === lastAnnounced) return;
    lastAnnounced = key;
    passAnnounceEl.textContent = text;
  };
  const layoutAuthoringFixedInput = document.getElementById("layout-authoring-fixed-input");
  const adminLayoutActionsEl = document.getElementById("admin-layout-actions");
  const layoutAuthorBtn = document.getElementById("layout-author-btn");
  const starFreeStripBtn = document.getElementById("star-free-strip-btn");
  const starBridgePreconnectBtn = document.getElementById("star-bridge-preconnect-btn");
  const boardSizeFactorEl = document.getElementById("board-size-factor");
  const boardSizeFactorInput = document.getElementById("board-size-factor-input");
  const boardSizeFactorReadout = document.getElementById("board-size-factor-readout");
  const layoutSideEl = document.querySelector(".layout-side");
  const lensFlowTraceBtn = document.getElementById("lens-flow-trace-btn");
  const lensRevealControlsEl = document.getElementById("lens-reveal-controls");
  const lensRevealCueSelect = document.getElementById("lens-reveal-cue-select");
  const lensRevealTryCue = document.getElementById("lens-reveal-try-cue");
  const lensRevealTryLens = document.getElementById("lens-reveal-try-lens");
  const lensRevealTryBtn = document.getElementById("lens-reveal-try-btn");
  const siteSettingsEl = document.getElementById("site-settings");
  const siteLensRevealCue = document.getElementById("site-lens-reveal-cue");
  const siteLensHoverPing = document.getElementById("site-lens-hover-ping");
  const siteSettingsStatusEl = document.getElementById("site-settings-status");
  const siteSettingsNote = siteSettingsStatusEl?.textContent.trim() || "";
  // Each side card reports its own saves; the note it opens with returns
  // once an error clears.
  const flagStatusEls = {
    layout: document.getElementById("board-settings-status"),
    copy: document.getElementById("board-experiments-status")
  };
  const flagStatusNotes = Object.fromEntries(Object.entries(flagStatusEls)
    .map(([key, el]) => [key, el?.textContent.trim() || ""]));
  let savedSizeFactor = 1;
  const savesToAuthoringServer = typeof saveLayout === "function";
  let savingLayout = false;

  layoutAuthoringEl.hidden = !layoutAuthoringMode;
  // In the layout view the cards follow the board directly rather than the
  // lens, fact and related-puzzle sections; on a wide screen they become a
  // column beside it (styles.css, .layout-authoring-view).
  if (layoutAuthoringMode) {
    const cardsEl = layoutAuthoringEl.closest(".layout-authoring-row");
    document.getElementById("board-stage")?.after(cardsEl);
    document.querySelector(".wrap")?.classList.add("layout-authoring-view");
  }
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
    const names = modes.map(mode => {
      const layout = layoutForMode(state.puzzle.layout, mode);
      const tags = [
        layout.source === "auto" ? "auto" : null,
        layoutIsFixed(layout) ? null : "hint"
      ].filter(Boolean);
      return tags.length ? `${MODE_LABELS[mode]} (${tags.join(" ")})` : MODE_LABELS[mode];
    });
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

  // Every counted defect outlined in red on the board, drawn over it and
  // never in the way of a drag; redrawn with the panel.
  const SVG_NS = "http://www.w3.org/2000/svg";
  function drawDefectMarks(marks) {
    const board = document.getElementById("board");
    if (!board) return;
    board.querySelector("g.layout-defect-marks")?.remove();
    if (!Array.isArray(marks) || !marks.length) return;
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "layout-defect-marks");
    group.setAttribute("aria-hidden", "true");
    const make = (tag, attributes) => {
      const element = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
      group.append(element);
    };
    marks.forEach(mark => {
      if (mark.kind === "circle") make("circle", { cx: mark.x, cy: mark.y, r: mark.r + 4 });
      else if (mark.kind === "rect") {
        make("rect", {
          x: mark.left - 3,
          y: mark.top - 3,
          width: mark.right - mark.left + 6,
          height: mark.bottom - mark.top + 6,
          rx: 6
        });
      } else if (mark.kind === "line") make("line", { x1: mark.x1, y1: mark.y1, x2: mark.x2, y2: mark.y2 });
    });
    board.append(group);
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
    const { overlaps, nearEdge } = overlapCounts(metrics);
    layoutMetricNearEdgeEl.textContent = !metrics || nearEdge == null
      ? "—"
      : nearEdge > 0 && metrics.nearEdgeItems?.length
        ? `${nearEdge} (${metrics.nearEdgeItems.join("; ")})`
        : String(nearEdge);
    drawDefectMarks(metrics?.defectMarks);

    layoutMetricCrossingsEl.textContent = metrics ? metrics.lineCrossings : "—";
    // Graph and Circle name each obstruction, and outline it on the board.
    layoutMetricPillCrossingsEl.textContent = !metrics
      ? "—"
      : lineObstructions > 0 && metrics.obstructions?.length
        ? `${lineObstructions} (${metrics.obstructions.join("; ")})`
        : String(lineObstructions);
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
  // Defects the shown layout still has, for the author's attention. A
  // saved layout is shown with them rather than replaced.
  // Graph and Circle count items near the board's edge (boundsViolations)
  // into hardOverlaps; they are reported as near the edge, not as overlaps.
  // nearEdge is null for Star, which keeps every item on the board.
  function overlapCounts(metrics) {
    const edge = Number(metrics?.boundsViolations);
    const nearEdge = Number.isFinite(edge) ? edge : null;
    const overlaps = metrics?.overlaps ??
      Math.max(0, (Number(metrics?.hardOverlaps) || 0) - (nearEdge || 0));
    return { overlaps: Number(overlaps) || 0, nearEdge };
  }

  function defectSummary(metrics) {
    if (!metrics) return null;
    const crossings = Number(metrics.lineCrossings) || 0;
    const { overlaps, nearEdge } = overlapCounts(metrics);
    const parts = [
      crossings ? `${crossings} line crossing${crossings === 1 ? "" : "s"}` : null,
      overlaps ? `${overlaps} overlap${overlaps === 1 ? "" : "s"}` : null,
      nearEdge ? `${nearEdge} item${nearEdge === 1 ? "" : "s"} too close to the board edge` : null
    ].filter(Boolean);
    return parts.length ? parts.join(" and ") : null;
  }

  // Every renderer reports how it used the saved layout in
  // state.layoutSource: exactly ("fixed"), as an arrangement ("hint",
  // Graph and Circle), or scaled and matched to an edited puzzle
  // ("adapted", Star). It never swaps a saved layout for a fresh one.
  async function reconcileSavedLayout(preparingState) {
    const saved = layoutForMode(preparingState.puzzle?.layout, getMode());
    // Automatic layouts come from tools/layouts-auto.mjs, not an author.
    const label = saved?.source === "auto"
      ? `automatic ${MODE_LABELS[getMode()]}`
      : MODE_LABELS[getMode()];
    const source = preparingState.layoutSource || { kind: "generated" };
    const outdated = source.fixedErrors?.length ? source.fixedErrors.join("; ") : null;
    let text;
    if (source.kind === "fixed") {
      text = `Loaded saved ${label} layout (fixed positions)`;
    } else if (source.kind === "hint") {
      text = outdated
        ? `Fixed ${label} layout no longer fits (${outdated}); kept its arrangement as a hint`
        : `Loaded saved ${label} layout as a hint (arrangement kept, positions recomputed)`;
    } else if (source.kind === "adapted") {
      const placed = source.placed
        ? `, placing ${source.placed} item${source.placed === 1 ? "" : "s"} it did not have`
        : "";
      text = `Saved ${label} layout no longer matches exactly (${outdated || "board or puzzle changed"}); adapted it to this board${placed}`;
    } else {
      return {
        text: `Saved ${label} layout could not be read (wrong puzzle or no usable positions); generated one instead`,
        tone: "error"
      };
    }
    const defects = defectSummary(layoutMetrics());
    if (defects) {
      return {
        text: `${text}. Still at this size: ${defects}. Players see this layout as is until it is repaired and saved`,
        tone: "error"
      };
    }
    return { text, tone: outdated || source.kind === "adapted" ? "error" : "good" };
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
        ? await reconcileSavedLayout(preparingState)
        : saved
          ? { text: `Generated a new layout; the saved ${label} layout stays until you save over it`, tone: "good" }
          : { text: `No saved ${label} layout; generated one`, tone: "good" };
      if (!source || getState() !== preparingState) return;
      reportPreparedLayout(source);
    } catch (error) {
      setLayoutAuthoringStatus(`Could not prepare layout: ${error.message}`, "error");
    } finally {
      layoutAuthoringPrepareBtn.disabled = false;
      updateLayoutAuthoringPanel();
    }
  }

  // The status line once a layout is on the board, after Prepare or a mode
  // switch: what loaded, then whether it needs repair before saving.
  function reportPreparedLayout(source) {
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
      ]) > 0 || overlapCounts(metrics).overlaps > 0 || overlapCounts(metrics).nearEdge > 0) {
        setLayoutAuthoringStatus(
          `${source.text}. Overlaps, through-pills and items near the edge are advisory; drag to tidy if you want, or save when it looks right.`,
          "good"
        );
      }
    }
  }

  // A board-size change rebuilt the board (game.js rebuildBoardForSize).
  // A prepared arrangement comes back re-centred, so the change adds or
  // removes margin all round; an unprepared board waits for Prepare.
  function onBoardResized({ restored = false } = {}) {
    if (!layoutAuthoringMode || !getState()) return;
    syncStarFreeStripButtons();
    if (restored) {
      const board = getBoard();
      reportPreparedLayout({ text: `Board resized to ${board.width}×${board.height}; your arrangement is re-centred on it`, tone: "good" });
    } else {
      updateLayoutAuthoringPanel();
    }
  }

  // A mode switch rebuilt the board in place (game.js setMode): either this
  // visit's arrangement for the mode came back, or the solved board is
  // polishing from the mode's saved layout. An unsolved board prepares as
  // it does on load.
  async function onModeSwitched({ restored = false, layoutPromise = null } = {}) {
    const state = getState();
    if (!layoutAuthoringMode || !state) return;
    const switchedMode = getMode();
    const label = MODE_LABELS[switchedMode];
    syncLayoutActionVisibility();
    syncStarFreeStripButtons();
    syncFixedCheckbox(state);
    if (state.made !== state.need) {
      setLayoutAuthoringStatus("");
      updateLayoutAuthoringPanel();
      if (savedModeLayout(state)) prepareLayoutAuthoringBoard();
      return;
    }
    if (restored) {
      reportPreparedLayout({ text: `Back to this visit's ${label} arrangement, unsaved drags included`, tone: "good" });
      return;
    }
    const saved = savedModeLayout(state);
    setLayoutAuthoringStatus(saved ? `Loading saved ${label} layout…` : "Generating a layout…");
    updateLayoutAuthoringPanel();
    try {
      await layoutPromise;
    } catch (error) {
      setLayoutAuthoringStatus(`Could not lay out ${label}: ${error.message}`, "error");
      return;
    }
    if (getState() !== state || getMode() !== switchedMode) return;
    const source = saved
      ? await reconcileSavedLayout(state)
      : { text: `No saved ${label} layout; generated one`, tone: "good" };
    if (!source || getState() !== state || getMode() !== switchedMode) return;
    reportPreparedLayout(source);
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
    if (layout) layout.source = "author";
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

  // The cards beside the layout card. Board settings (size, the Star
  // free-term strip) save with the layout, to the open working copy or else
  // the published puzzle. Experiments (bridge pre-connect, lens flow trace)
  // change play, so they save on the working copy only.
  const LAYOUT_BOARD_FLAGS = new Set(["sizeFactor", "starFreeStrip"]);
  function layoutCanWriteBoard() {
    return layoutAuthoringMode && typeof saveLayoutBoard === "function";
  }

  function workingCopyCanWriteBoard() {
    return layoutAuthoringMode && typeof saveBoardFlags === "function" && Boolean(getDraftId());
  }

  if (layoutSideEl) layoutSideEl.hidden = !layoutCanWriteBoard();

  function setBoardFlagStatus(key, text) {
    const card = LAYOUT_BOARD_FLAGS.has(key) ? "layout" : "copy";
    const el = flagStatusEls[card];
    if (!el) return;
    el.textContent = text || flagStatusNotes[card];
    if (text) el.dataset.tone = "error";
    else delete el.dataset.tone;
  }

  function setBoardControlsDisabled(disabled) {
    const noCopy = !workingCopyCanWriteBoard();
    if (starFreeStripBtn) starFreeStripBtn.disabled = disabled;
    if (starBridgePreconnectBtn) starBridgePreconnectBtn.disabled = disabled || noCopy;
    if (lensFlowTraceBtn) lensFlowTraceBtn.disabled = disabled || noCopy;
    if (lensRevealCueSelect) lensRevealCueSelect.disabled = disabled || noCopy;
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
    const canWrite = layoutCanWriteBoard();
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
    const viaLayout = LAYOUT_BOARD_FLAGS.has(key);
    if (!state?.puzzle || !(viaLayout ? layoutCanWriteBoard() : workingCopyCanWriteBoard())) return;
    setBoardControlsDisabled(true);
    try {
      if (viaLayout) {
        // An explicit value, even the default (null), records the author's
        // choice so the automatic layout pass leaves it alone.
        state.puzzle.layout = await saveLayoutBoard({
          puzzleId: state.puzzle.id,
          board: { [key]: value === undefined ? null : value }
        });
      } else {
        await saveBoardFlags({ board: boardWithFlag(state.puzzle, key, value) });
      }
      if (key === "sizeFactor") savedSizeFactor = typeof value === "number" ? value : 1;
      if (typeof reload === "function") reload();
      else setBoardControlsDisabled(false);
    } catch (error) {
      setBoardFlagStatus(key, error instanceof Error ? error.message : String(error));
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
    const canWriteLayout = layoutCanWriteBoard();
    const canWriteCopy = workingCopyCanWriteBoard();
    // The free-term strip is Star's alone.
    if (starFreeStripBtn) starFreeStripBtn.hidden = !canWriteLayout || getMode() !== "star";
    const copyTitle = name => canWriteCopy
      ? "Changes play; saves on the open working copy"
      : `Open a working copy to change ${name}`;
    if (starBridgePreconnectBtn) {
      starBridgePreconnectBtn.hidden = !canWriteLayout;
      starBridgePreconnectBtn.disabled = !canWriteCopy;
      starBridgePreconnectBtn.title = copyTitle("bridge pre-connect");
    }
    // The trace plays when a lens's answer is revealed, so it is offered
    // only where there are lenses.
    if (lensFlowTraceBtn) {
      lensFlowTraceBtn.hidden = !canWriteLayout || !state?.puzzle?.lenses?.length;
      lensFlowTraceBtn.disabled = !canWriteCopy;
      lensFlowTraceBtn.title = copyTitle("the lens flow trace");
    }
    syncBoardSizeControl();
    syncLensRevealControls();
    if (!state?.puzzle) return;
    if (canWriteLayout && starFreeStripBtn) {
      const enabled = starFreeStripEnabled(state.puzzle, boardSize());
      starFreeStripBtn.textContent = enabled
        ? "Clear free-term strip"
        : "Use free-term strip";
    }
    if (canWriteLayout && lensFlowTraceBtn) {
      lensFlowTraceBtn.textContent = lensFlowTraceEnabled(state.puzzle)
        ? "Turn off lens flow trace"
        : "Turn on lens flow trace";
    }
    if (canWriteLayout && starBridgePreconnectBtn) {
      const preconnect = starBridgePreconnectEnabled(state.puzzle);
      starBridgePreconnectBtn.textContent = preconnect
        ? "Clear bridge pre-connect"
        : "Pre-connect bridges";
    }
  }

  // Lens reveal cue (modules/lensRevealCue.js). This puzzle's choice saves
  // on the working copy; Try plays a cue on one lens's answers and saves
  // nothing; the Site settings card saves for every puzzle. Assignment
  // lenses have no reveal, so they are offered none of it.
  const TRY_CUES = LENS_REVEAL_CUES.filter(cue => cue !== "none");
  const cueOption = cue => [cue, LENS_REVEAL_CUE_LABELS[cue]];

  function setOptions(select, entries, value) {
    if (!select) return;
    select.replaceChildren(...entries.map(([optionValue, label]) => new Option(label, optionValue)));
    select.value = entries.some(([optionValue]) => optionValue === value) ? value : entries[0]?.[0] ?? "";
  }

  function siteSettingsCanWrite() {
    return layoutAuthoringMode && typeof saveSiteSettings === "function";
  }

  function syncLensRevealControls() {
    const state = getState();
    const settings = getSiteSettings() || {};
    const lenses = state?.puzzle?.lenses || [];
    const offered = layoutCanWriteBoard() && lenses.length > 0 && state.lensMode !== "assignment";
    if (lensRevealControlsEl) lensRevealControlsEl.hidden = !offered;
    if (offered) {
      const canWriteCopy = workingCopyCanWriteBoard();
      setOptions(lensRevealCueSelect, [
        ["", `Use site setting (${LENS_REVEAL_CUE_LABELS[globalLensRevealCue(settings)]})`],
        ...LENS_REVEAL_CUES.map(cueOption)
      ], puzzleLensRevealCue(state.puzzle) || "");
      if (lensRevealCueSelect) {
        lensRevealCueSelect.disabled = !canWriteCopy;
        lensRevealCueSelect.title = canWriteCopy
          ? "Changes play; saves on the open working copy"
          : "Open a working copy to change this puzzle's lens reveal";
      }
      const effective = resolveLensRevealCue({ puzzle: state.puzzle, settings });
      const tryCue = TRY_CUES.includes(lensRevealTryCue?.value) ? lensRevealTryCue.value
        : effective === "none" ? "ripple" : effective;
      setOptions(lensRevealTryCue, TRY_CUES.map(cueOption), tryCue);
      setOptions(
        lensRevealTryLens,
        lenses.map((lens, index) => [String(index), String(index + 1)]),
        lensRevealTryLens?.value || String(state.lensIndex || 0)
      );
    }
    const siteOffered = siteSettingsCanWrite();
    if (siteSettingsEl) siteSettingsEl.hidden = !siteOffered;
    if (siteOffered) {
      setOptions(siteLensRevealCue, LENS_REVEAL_CUES.map(cueOption), globalLensRevealCue(settings));
      if (siteLensHoverPing) siteLensHoverPing.checked = lensRevealHoverPingEnabled(settings);
    }
  }

  function setSiteSettingsStatus(text) {
    if (!siteSettingsStatusEl) return;
    siteSettingsStatusEl.textContent = text || siteSettingsNote;
    if (text) siteSettingsStatusEl.dataset.tone = "error";
    else delete siteSettingsStatusEl.dataset.tone;
  }

  async function persistSiteSettings(patch) {
    if (!siteSettingsCanWrite()) return;
    for (const control of [siteLensRevealCue, siteLensHoverPing]) {
      if (control) control.disabled = true;
    }
    try {
      await saveSiteSettings(patch);
      setSiteSettingsStatus("");
    } catch (error) {
      setSiteSettingsStatus(error instanceof Error ? error.message : String(error));
    } finally {
      for (const control of [siteLensRevealCue, siteLensHoverPing]) {
        if (control) control.disabled = false;
      }
      syncLensRevealControls();
    }
  }

  lensRevealTryBtn?.addEventListener("click", () => {
    previewLensRevealCue?.({
      cue: lensRevealTryCue?.value,
      lensIndex: Number(lensRevealTryLens?.value) || 0
    });
  });
  siteLensRevealCue?.addEventListener("change", () => {
    persistSiteSettings({ lensRevealCue: siteLensRevealCue.value });
  });
  siteLensHoverPing?.addEventListener("change", () => {
    persistSiteSettings({ lensRevealHoverPing: siteLensHoverPing.checked });
  });

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
      // A working copy keeps whichever puzzle= opened it, as reloadBoard does.
      if (params.get("draft")) params.set("view", "play");
      else if (!getDraftId()) params.set("puzzle", state.puzzle.id);
      location.assign(`${location.pathname}?${params.toString()}`);
    });
  }

  if (layoutCanWriteBoard()) {
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
    lensFlowTraceBtn?.addEventListener("click", () => {
      const state = getState();
      if (!state?.puzzle) return;
      const next = !lensFlowTraceEnabled(state.puzzle);
      persistBoardFlag("lensFlowTrace", next ? true : undefined, () => reloadBoard());
    });
    // Only a reveal reads the cue, so the board and the lens progress stay
    // as they are.
    lensRevealCueSelect?.addEventListener("change", async () => {
      const state = getState();
      if (!state?.puzzle) return;
      const value = lensRevealCueSelect.value || undefined;
      await persistBoardFlag("lensRevealCue", value, () => {
        state.puzzle.board = boardWithFlag(state.puzzle, "lensRevealCue", value);
        setBoardFlagStatus("lensRevealCue", "");
        setBoardControlsDisabled(false);
      });
      syncLensRevealControls();
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
      setBoardFlagStatus("sizeFactor");
      // The rebuild reports back through onBoardResized.
      previewBoardSize?.(factor, { rebuild: "now" });
      const size = getBoard();
      if (boardSizeFactorReadout) {
        boardSizeFactorReadout.textContent = sizeReadout(factor, size);
      }
      persistBoardFlag("sizeFactor", factor, null);
    });
  }

  // ---------- automatic layout pass ----------
  // Run layout pass is a dry run of tools/layouts-auto.mjs for this
  // published puzzle on the local authoring server; Save automatic layouts
  // runs it again with --write. Neither touches an author's own layouts or
  // board size, and both report per mode.
  const passAvailable = !!layoutPass && layoutAuthoringMode;
  let passPoll = null;
  let passPuzzleId = null;

  const percent = size => {
    const value = Math.round(((Number(size) || 1) - 1) * 100);
    return value === 0 ? "0%" : `${value > 0 ? "+" : ""}${value}%`;
  };
  const elapsed = startedAt => {
    const seconds = Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };
  const escapeText = text => String(text ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
  })[char]);

  function describeDefects(defects) {
    if (!defects || defects.total === 0) return "clean";
    const { total, ...kinds } = defects;
    return Object.entries(kinds).map(([kind, count]) => `${kind} ${count}`).join(", ");
  }

  function renderPassReport(job) {
    const result = job.result || {};
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const size = result.sizeOwner === "auto"
      ? `Board size ${percent(result.size)}${job.write ? (result.sizeAction ? ` (${result.sizeAction})` : "") : ""}`
      : `Board size kept at ${percent(result.size)} (set by ${result.sizeOwner === "author" ? "an author" : "an author's layouts"})` +
        (result.suggestedSize != null ? `; the board would be clean at ${percent(result.suggestedSize)}` : "");
    // The pass reports a refused or invalid save as a "not saved (…)"
    // action, not as a failure, so a write run is only a success when none
    // of its saves, including the board size, was refused.
    const notSaved = action => typeof action === "string" && action.startsWith("not saved");
    const unsaved = job.write
      ? rows.filter(row => notSaved(row.action)).length + (notSaved(result.sizeAction) ? 1 : 0)
      : 0;
    const items = rows.map(row => {
      const label = MODE_LABELS[row.mode] || row.mode;
      const how = row.action === "author layout kept"
        ? "your layout, kept"
        : job.write ? row.action : row.strategy;
      const tone = notSaved(row.action) || row.defects?.total !== 0 ? "error" : "good";
      return `<li data-tone="${tone}">${escapeText(label)}: ${escapeText(describeDefects(row.defects))} — ${escapeText(how)}</li>`;
    }).join("");
    const heading = !job.write
      ? "Dry run finished; nothing saved yet."
      : unsaved
        ? `Automatic layouts saved with ${unsaved} not saved; see below.`
        : "Automatic layouts saved.";
    passEl.innerHTML = `<div${unsaved ? ' data-tone="error"' : ""}>${escapeText(heading)} ${escapeText(size)}.</div><ul>${items}</ul>`;
    announcePass(`${job.startedAt}:done`, heading);
    passEl.hidden = false;
    // Saving is worth offering only when the dry run found something the
    // pass may write: a mode without an author's layout.
    savePassBtn.hidden = job.write || !rows.some(row => row.action !== "author layout kept");
  }

  function renderPassJob(job) {
    if (!passAvailable) return;
    const running = job.status === "running";
    runPassBtn.disabled = running || !!getDraftId();
    savePassBtn.disabled = running || !!getDraftId();
    if (job.status === "none") {
      passEl.hidden = true;
      savePassBtn.hidden = true;
      return;
    }
    if (running) {
      passEl.hidden = false;
      passEl.textContent = `${job.write ? "Saving automatic layouts" : "Running layout pass"}… ${elapsed(job.startedAt)} (each mode, then larger boards if needed; usually under a few minutes)`;
      announcePass(`${job.startedAt}:running`, job.write ? "Saving automatic layouts." : "Layout pass running.");
      return;
    }
    if (job.status === "failed") {
      passEl.hidden = false;
      passEl.innerHTML = `<div data-tone="error">Layout pass failed: ${escapeText(job.error)}</div>`;
      savePassBtn.hidden = true;
      announcePass(`${job.startedAt}:failed`, `Layout pass failed: ${job.error}`);
      return;
    }
    renderPassReport(job);
  }

  function pollPass(puzzleId, { reloadWhenSaved = false } = {}) {
    clearTimeout(passPoll);
    passPoll = setTimeout(async () => {
      if (puzzleId !== passPuzzleId) return;
      let job;
      try {
        job = await layoutPass.status({ puzzleId });
      } catch (error) {
        passEl.hidden = false;
        passEl.innerHTML = `<div data-tone="error">${escapeText(error.message)}</div>`;
        return;
      }
      if (puzzleId !== passPuzzleId) return;
      renderPassJob(job);
      if (job.status === "running") pollPass(puzzleId, { reloadWhenSaved });
      else if (reloadWhenSaved && job.status === "done" && job.write) {
        // Show the saved layouts: the board reads them as it loads.
        location.reload();
      }
    }, 2000);
  }

  async function startPass(write) {
    const state = getState();
    if (!state?.puzzle || getDraftId()) return;
    if (write && !window.confirm(
      "Save automatic layouts to the published puzzle? Players see them at once. " +
      "Your own saved layouts and board size are never replaced."
    )) return;
    const puzzleId = state.puzzle.id;
    try {
      const job = await layoutPass.start({ puzzleId, write });
      // Another puzzle may have loaded while the request was in flight;
      // its panel must not show this puzzle's run.
      if (puzzleId !== passPuzzleId) return;
      renderPassJob(job);
      pollPass(puzzleId, { reloadWhenSaved: write });
    } catch (error) {
      if (puzzleId !== passPuzzleId) return;
      passEl.hidden = false;
      passEl.innerHTML = `<div data-tone="error">${escapeText(error.message)}</div>`;
    }
  }

  if (passAvailable) {
    runPassBtn.hidden = false;
    runPassBtn.addEventListener("click", () => startPass(false));
    savePassBtn.addEventListener("click", () => startPass(true));
  }

  async function syncPassForPuzzle(state) {
    if (!passAvailable || !state?.puzzle) return;
    passPuzzleId = state.puzzle.id;
    if (getDraftId()) {
      runPassBtn.disabled = true;
      savePassBtn.hidden = true;
      passEl.hidden = false;
      passEl.textContent = "The layout pass runs on the published puzzle. Open the puzzle without a working copy to run it.";
      return;
    }
    try {
      const job = await layoutPass.status({ puzzleId: state.puzzle.id });
      if (passPuzzleId !== state.puzzle.id) return;
      renderPassJob(job);
      if (job.status === "running") pollPass(state.puzzle.id);
    } catch {
      // The status route is optional; the buttons still work.
    }
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
    syncPassForPuzzle(state);
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
    onModeSwitched,
    onBoardResized,
    syncStarFreeStripButtons,
    reloadBoard
  };
}
