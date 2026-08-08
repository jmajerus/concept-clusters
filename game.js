// ============================================================
// Concept Clusters — game logic
// ------------------------------------------------------------
// Reads PUZZLES (puzzles/index.js), renders a D3 force-directed graph.
// Mechanic: tap a gray term, then tap a node in the cluster it
// belongs to. Seed pairs are pre-connected as the orienting clue.
// Bridge terms normally belong to two clusters; an experimental
// ternary bridge belongs to three and needs a link into each.
// ============================================================

/* global d3 */
import { PUZZLES } from "./puzzles/index.js";
import { categorySlugFor } from "./puzzles/categories.js";
import { CATALOGUES } from "./catalogues/index.js";
import { SHOWCASE_PUZZLE_IDS } from "./puzzles/showcase.js";
import { encodeMoves, decodeMoves } from "./modules/shareLink.js";
import { searchLinkForTerm, linkLabel, normalizeInfo, formatCitation } from "./modules/termInfo.js";
import { trackPuzzleLoad, trackPuzzleCompleted } from "./modules/analyticsClient.js";
import { buildNodesAndLinks } from "./modules/puzzleGraph.js";
import { createGameEngine } from "./modules/gameLogic.js";
import { createGraphRenderer } from "./modules/graphRenderer.js";
import { createStarRenderer } from "./modules/starRenderer.js";
import { createSetRenderer } from "./modules/setRenderer.js";
import { createOverviewRenderer } from "./modules/overviewRenderer.js";
import { createAppNavigation } from "./modules/appNavigation.js";
import {
  repositoryStarFreeStrip,
  starFreeStripEnabled,
  STAR_FREE_STRIP_STORAGE_KEY
} from "./modules/starLayoutRepository.js";
import "./modules/lensAssignmentElement.js";
import "./modules/learningIntroductionElement.js";
import {
  learningIntroductionGate,
  normalizedLearningIntroduction
} from "./modules/learningIntroduction.js";
import {
  loadLearningIntroductionStatus,
  saveLearningIntroductionStatus
} from "./modules/learningIntroductionStore.js";
import { validateStarLayoutDocument } from "./modules/starLayoutSchema.js";
import {
  clearStarLayoutDraft,
  loadStarLayoutDraft,
  saveStarLayoutDraft
} from "./modules/starLayoutStore.js";
import {
  clearPlayerSession,
  loadPlayerSession,
  savePlayerSession
} from "./modules/playerSessionStore.js";
import {
  assignmentConceptWords,
  currentLens,
  lensAssignmentResult,
  lensAssignmentSummary,
  lensPhaseActive,
  lensQuizResult,
  lensResult,
  normalizedLensMode,
  quizOptionForNode,
  quizOptionsForDisplay
} from "./modules/lensEngine.js";

const svg = d3.select("#board");
// Board coordinate space (viewBox units, not CSS px). Large puzzles get
// a bigger space plus the .wrap.wide CSS class, which only actually widens
// the layout on viewports large enough for the extra room to matter. A puzzle
// explicitly marked `large` keeps the expanded coordinate space even when the
// SVG has to scale it down responsively: replacing it with the standard canvas
// does not make labels more legible if the resulting geometry overlaps.
const BOARD_SIZE = {
  standard: [640, 460],
  wide: [960, 620],
  // A dense "large" puzzle (several clusters, each with several long
  // terms) can need more room than 960x720 has: computePrettyCircleLayout's
  // own placement search is a discrete order/rotation/scale search over
  // that fixed canvas, and for two real puzzles -- control-and-exit (4
  // clusters, 5-6 terms each, some 20+ characters) and after-the-click (4
  // clusters, 5 terms each, one circle notably larger than the rest) --
  // no candidate anywhere in that search fits without at least one hard
  // overlap, confirmed exhaustively for the first and by direct
  // measurement for the second. 960x720 doesn't have enough room for
  // those circle sizes at once, regardless of ordering or rotation --
  // one puzzle's failure was a circle-circle collision, the other's was
  // a bridge squeezed between two large opposing circles, so the fix is
  // the same underlying one (more room), not a per-symptom patch. This
  // is the smallest size confirmed to resolve both (960->1050,
  // 720->780, ~9%); #board renders at width:100% of its container, so
  // more viewBox units without a matching container change does make
  // everything marginally smaller on screen, but at this size that
  // wasn't visually distinguishable in a direct comparison.
  circleWide: [1050, 780]
};
let W, H;
const wrapEl = document.querySelector(".wrap");
const msgEl = document.getElementById("message");
const termInfoEl = document.getElementById("term-info");
const countEl = document.getElementById("progress");
const factsEl = document.getElementById("facts");
const relatedPuzzlesEl = document.getElementById("related-puzzles");
const pickerEl = document.getElementById("puzzle-picker");
const titleEl = document.getElementById("puzzle-title");
const largeBadgeEl = document.getElementById("large-badge");
const lensesBadgeEl = document.getElementById("lenses-badge");
const puzzleInfoEl = document.getElementById("puzzle-info");
const puzzleCatalogueSuggestionEl = document.getElementById("puzzle-catalogue-suggestion");
const puzzleMetaEl = document.getElementById("puzzle-meta");
const puzzleStatsBtn = document.getElementById("puzzle-stats-btn");
const adminLayoutActionsEl = document.getElementById("admin-layout-actions");
const starLayoutAuthorBtn = document.getElementById("star-layout-author-btn");
const starFreeStripBtn = document.getElementById("star-free-strip-btn");
const starFreeStripExportBtn = document.getElementById("star-free-strip-export-btn");
const puzzleStatsReportEl = document.getElementById("puzzle-stats-report");
const showSolutionBtn = document.getElementById("show-solution");
const shareBtn = document.getElementById("share-puzzle");
const shareStatusEl = document.getElementById("share-status");
const puzzleControlsEl = document.getElementById("puzzle-controls");
const browsePuzzlesBtn = document.getElementById("browse-puzzles");
const contextNavEl = document.getElementById("context-nav");
const breadcrumbsEl = document.getElementById("breadcrumbs");
const backToCatalogueBtn = document.getElementById("back-to-catalogue");
const overviewShareRowEl = document.querySelector(".overview-share");
const puzzleViewEl = document.getElementById("puzzle-view");
const overviewEl = document.getElementById("puzzle-overview");
const overviewTitleEl = document.getElementById("overview-title");
const overviewSubtitleEl = document.getElementById("overview-subtitle");
const overviewProgressEl = document.getElementById("overview-progress");
const overviewSearchEl = document.getElementById("overview-search");
const overviewSearchInputEl = document.getElementById("overview-search-input");
const overviewListEl = document.getElementById("overview-list");
const overviewShareBtn = document.getElementById("overview-share-btn");
const overviewShareStatusEl = document.getElementById("overview-share-status");
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
const lensPanelEl = document.getElementById("lens-panel");
const learningIntroductionEl = document.getElementById("learning-introduction");
const learningReviewBtn = document.getElementById("learning-review");
const lensAssignmentEl = document.getElementById("lens-assignment");
const lensProgressEl = document.getElementById("lens-progress");
const lensPromptEl = document.getElementById("lens-prompt");
const lensQuizOptionsEl = document.getElementById("lens-quiz-options");
const lensCheckBtn = document.getElementById("lens-check");
const lensNextBtn = document.getElementById("lens-next");
const lensResultEl = document.getElementById("lens-result");
const lensExplanationEl = document.getElementById("lens-explanation");

let sim = null;
let state = null; // { nodes, links, selected, made, need }
let currentIndex = 0;
let playerLayoutSaveTimer = null;
const pageParams = new URLSearchParams(location.search);
const layoutAuthoringMode = pageParams.get("author") === "layout";
// Undocumented, admin-only: reveals #puzzle-meta (raw optional puzzle
// fields -- tags, dateCreated/dateModified once populated, etc.) below
// the puzzle title. Not linked from anywhere in the UI.
const adminMode = pageParams.has("admin");
let appNavigation;
let overviewRenderer;
let pendingInitialSharedParams = null;

// trackEvent/trackPuzzleLoad/trackPuzzleCompleted now live in
// modules/analyticsClient.js -- see src/worker.js for what happens to
// these server-side. Called below as trackPuzzleLoad(id, mode) /
// trackPuzzleCompleted(id, mode, state), passing this file's own
// mode/state explicitly rather than the module closing over them.

// ---------- rendering mode ----------
// Three independent rendering/interaction pathways over the same shared
// game state (nodes, links, connected arrays never differ by mode) —
// full graph mode (mode value: "graph") is the original per-term
// force-directed board, connecting each term to whichever specific
// already-placed sibling the player tapped; "star" is the same board,
// but every connection is drawn (and physically pulled) toward its
// cluster's own title node instead — a more legible read of the same
// state at the cost of a bit of the original's challenge (no cluster
// names shown, longer tangled chains); "sets" renders clusters as
// circles containing their terms. Called "full graph mode" rather than
// plain "graph" wherever it could be confused with "star" (also a
// node-link board), since sharing the "graph" name for both would be
// ambiguous. The player's choice is remembered across visits — and
// since this only special-cases "sets"/"star", a visitor whose
// localStorage still has the old "traditional" value falls through to
// the default mode unaffected, no migration needed.
//
// A manually-added &mode=graph, &mode=star, or &mode=sets in the URL
// overrides that stored preference for this page view only -- for a
// personal bookmark list where a particular puzzle is preferred in a
// particular mode. Deliberately read-only and not written back to
// localStorage: unlike &puzzle=/&moves=/&solved (which the Share button
// generates), this param is meant to be added by hand to one's own
// saved links, not something the Share button should start forcing on
// other people who open a shared link -- see the note above the Share
// handler.
const VALID_MODES = ["graph", "star", "sets"];
const urlMode = pageParams.get("mode");
let mode = layoutAuthoringMode
  ? "star"
  : VALID_MODES.includes(urlMode)
    ? urlMode
    : (VALID_MODES.includes(localStorage.getItem("ccMode")) ? localStorage.getItem("ccMode") : "star");
const modeGraphBtn = document.getElementById("mode-graph");
const modeStarBtn = document.getElementById("mode-star");
const modeSetsBtn = document.getElementById("mode-sets");
const dragHintEl = document.getElementById("drag-hint");
modeGraphBtn.setAttribute("aria-pressed", String(mode === "graph"));
modeStarBtn.setAttribute("aria-pressed", String(mode === "star"));
modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));
layoutAuthoringEl.hidden = !layoutAuthoringMode;
puzzleMetaEl.hidden = !adminMode;
puzzleStatsBtn.hidden = !adminMode;
adminLayoutActionsEl.hidden = !adminMode || layoutAuthoringMode;
if (adminMode) puzzleStatsBtn.addEventListener("click", () => overviewRenderer.togglePuzzleStats());
if (adminMode && !layoutAuthoringMode) {
  starLayoutAuthorBtn.addEventListener("click", () => {
    if (!state?.puzzle) return;
    const params = new URLSearchParams(location.search);
    params.set("puzzle", state.puzzle.id);
    params.set("author", "layout");
    params.set("mode", "star");
    // Layout authoring is its own mode; drop &admin so the meta dump does
    // not compete with the authoring panel. Catalogue context stays so the
    // admin can return to the same collection afterward.
    params.delete("admin");
    location.assign(`${location.pathname}?${params.toString()}`);
  });

  const syncStarFreeStripButtons = () => {
    if (!state?.puzzle) return;
    const enabled = starFreeStripEnabled(state.puzzle);
    starFreeStripBtn.textContent = enabled
      ? "Clear free-term strip"
      : "Use free-term strip";
    starFreeStripExportBtn.hidden = !enabled;
  };
  starFreeStripBtn.addEventListener("click", () => {
    if (!state?.puzzle) return;
    const id = state.puzzle.id;
    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem(STAR_FREE_STRIP_STORAGE_KEY) || "{}");
    } catch {
      overrides = {};
    }
    const next = !starFreeStripEnabled(state.puzzle);
    overrides[id] = next;
    // If the local try matches the committed registry, drop the override
    // so the sparse file remains the source of truth.
    if (next === repositoryStarFreeStrip(state.puzzle)) delete overrides[id];
    localStorage.setItem(STAR_FREE_STRIP_STORAGE_KEY, JSON.stringify(overrides));
    const params = new URLSearchParams(location.search);
    params.set("puzzle", id);
    params.set("mode", "star");
    params.set("admin", "");
    location.assign(`${location.pathname}?${params.toString()}`);
  });
  starFreeStripExportBtn.addEventListener("click", () => {
    if (!state?.puzzle) return;
    const doc = {
      schemaVersion: 1,
      kind: "star-free-strip",
      puzzleId: state.puzzle.id,
      freeStrip: true
    };
    const blob = new Blob([`${JSON.stringify(doc, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${state.puzzle.id}-star-free-strip.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
  // Refreshed after each puzzle load via the paint path below.
  window.__ccSyncStarFreeStripButtons = syncStarFreeStripButtons;
}
if (layoutAuthoringMode) {
  modeGraphBtn.disabled = true;
  modeSetsBtn.disabled = true;
}

// What's draggable genuinely differs by mode — every node in Graph and
// Star modes, but only circles and bridge pills in Sets (a docked term
// travels with its circle, not on its own).
function updateDragHint() {
  if (lensPhaseActive(state)) {
    dragHintEl.textContent = state.phase === "lens-assigning"
      ? "Activate any badged term to choose its best-fitting lens."
      : state.phase === "lens-selecting"
        ? "Select terms on the completed map that fit the current lens."
        : "The completed layout stays fixed while you examine it.";
    return;
  }
  dragHintEl.textContent = mode === "sets"
    ? "Drag a circle or a bridge to rearrange the layout."
    : "Drag any node to untangle the graph.";
}
updateDragHint();

function updateModeControls() {
  // The short preparation transition still owns the renderer while it
  // awaits the just-completed map's layout. Once a lens is actually being
  // selected or reviewed, however, switching representation is useful:
  // the same answer set can be examined as a Graph, Star, or Circle map.
  const lensPreparing = state?.phase === "lens-preparing";
  const layoutBusy = !!state &&
    (state.modeSwitchPolishing ||
      state.solutionLayout === "animating" ||
      state.solutionLayout === "polishing");
  modeGraphBtn.setAttribute("aria-pressed", String(mode === "graph"));
  modeStarBtn.setAttribute("aria-pressed", String(mode === "star"));
  modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));
  modeGraphBtn.disabled = layoutAuthoringMode || lensPreparing || layoutBusy;
  modeStarBtn.disabled = lensPreparing || layoutBusy;
  modeSetsBtn.disabled = layoutAuthoringMode || lensPreparing || layoutBusy;
  updateDragHint();
}

function polishedLayoutMessage(layoutMode = mode) {
  const label = layoutMode === "sets"
    ? "Circle"
    : layoutMode === "star"
      ? "Star"
      : "Graph";
  return `Solution shown — ${label} layout polished.`;
}

async function finishSolvedLayoutAfterModeSwitch(switchState, switchMode) {
  switchState.modeSwitchPolishing = true;
  updateSolutionHint();
  try {
    if (switchState.prettyPrint) {
      return await switchState.prettyPrint();
    }
    // Star creates its final pretty-print function as part of the
    // human-like detangler setup. Run that first pass, then continue
    // straight into the final pass without returning control to the
    // button between them.
    if (switchState.detangle) {
      await switchState.detangle();
      if (state !== switchState || mode !== switchMode) return { cancelled: true };
      if (switchState.prettyPrint && switchState.solutionLayout !== "pretty") {
        return await switchState.prettyPrint();
      }
      return switchState.detangleStats || { cancelled: false };
    }
    if (switchState.layoutAdapter?.autoLayout) {
      return await switchState.layoutAdapter.autoLayout();
    }
    return { cancelled: true };
  } finally {
    if (state === switchState && mode === switchMode) {
      switchState.modeSwitchPolishing = false;
      updateSolutionHint();
      persistPlayerSession({ captureLayout: true });
    }
  }
}

async function finishLensLayoutAfterModeSwitch(
  switchState,
  switchMode
) {
  try {
    if (switchState.solutionLayout !== "pretty") {
      await finishSolvedLayoutAfterModeSwitch(switchState, switchMode);
    }
  } finally {
    if (state !== switchState || mode !== switchMode) return;
    // Every renderer publishes this hook. Stop any residual simulation
    // after its final layout pass so the lens answer highlights remain on
    // a stable map, just as they did before the representation changed.
    switchState.freezeForLenses?.();
    switchState.paint?.();
    if (switchState.phase === "lens-assigning") {
      const assigned = switchState.lensAssignments.size;
      const total = assignmentConceptWords(switchState.puzzle).length;
      setMessage(
        assigned
          ? `${assigned} of ${total} concepts assigned.`
          : "Assign any badged concepts you recognize, then check your work.",
        "good"
      );
    } else if (switchState.phase === "lens-selecting") {
      const count = switchState.lensSelections.size;
      setMessage(
        count
          ? `${count} ${count === 1 ? "concept" : "concepts"} selected.`
          : "Select every concept that fits this lens, then check your selections.",
        "good"
      );
    } else if (switchState.phase === "lens-quiz-answering") {
      setMessage(
        switchState.lensQuizSelection
          ? "Answer chosen — check it when you're ready."
          : "Choose the answer you think is correct, then check it.",
        "good"
      );
    } else if (switchState.phase === "lens-revealed") {
      setMessage("Review the highlighted answer set and explanation.", "good");
    } else if (switchState.phase === "complete" &&
        switchState.lensMode === "assignment") {
      setMessage(
        `Lens assignment complete — ${lensAssignmentSummary(switchState.lensAssignmentResult)}`,
        "good"
      );
    } else if (switchState.phase === "complete") {
      setMessage(
        `You completed the map and examined it through ${switchState.puzzle.lenses.length} cross-cutting lenses.`,
        "good"
      );
    }
    updateLensInterface();
    persistPlayerSession({ captureLayout: true });
  }
}

function semanticMovesForState(currentState) {
  return currentState.moveHistory.flatMap(move => {
    const source = currentState.nodes[move.source];
    const target = currentState.nodes[move.target];
    return source && target ? [{ source: source.word, target: target.word }] : [];
  });
}

function persistPlayerSession({ captureLayout = false } = {}) {
  if (!state || state.restoringSession || layoutAuthoringMode) return false;
  const previous = loadPlayerSession(localStorage, state.puzzle);
  const layouts = { ...(previous?.layouts || {}) };
  if (captureLayout &&
      state.layoutAdapter?.mode === mode &&
      typeof state.layoutAdapter.capture === "function") {
    layouts[mode] = state.layoutAdapter.capture();
  }
  return savePlayerSession(localStorage, state.puzzle, {
    // A hand-authored ?mode= remains a view-only override. If the player
    // explicitly clicks a mode button, setMode updates persistedMode.
    currentMode: state.persistedMode,
    moves: semanticMovesForState(state),
    layouts,
    completed: state.phase === "complete",
    lens: captureLensSession()
  });
}

function schedulePlayerLayoutSave() {
  if (!state || layoutAuthoringMode) return;
  const scheduledState = state;
  clearTimeout(playerLayoutSaveTimer);
  playerLayoutSaveTimer = setTimeout(() => {
    if (state === scheduledState) persistPlayerSession({ captureLayout: true });
  }, 700);
}

function replaySemanticMoves(moves) {
  if (!Array.isArray(moves)) return;
  state.restoringSession = true;
  try {
    for (const move of moves) {
      const source = state.nodes.find(node => node.word === move.source);
      const target = state.nodes.find(node => node.word === move.target);
      if (source && target && !isDone(source)) {
        handleTap(source);
        handleTap(target);
      }
    }
  } finally {
    state.restoringSession = false;
    state.selected = null;
  }
}

function restorePlayerSession(session) {
  if (!session) return;
  replaySemanticMoves(session.moves);
  const layout = session.layouts[mode];
  if (layout &&
      state.layoutAdapter?.mode === mode &&
      typeof state.layoutAdapter.apply === "function") {
    state.layoutAdapter.apply(layout);
  }
  if (state.made === state.need && state.puzzle.lenses?.length) {
    restoreLensSession(session.lens);
    state.paint();
    return;
  }
  setMessage(
    state.made === state.need
      ? "Saved completed puzzle restored."
      : state.made
        ? "Saved progress restored — continue where you left off."
        : "Tap a gray term to begin.",
    state.made === state.need ? "good" : undefined
  );
  state.paint();
}

function setMode(newMode) {
  if (layoutAuthoringMode && newMode !== "star") return;
  if (state?.phase === "lens-preparing") return;
  const switchingLensPhase = lensPhaseActive(state);
  clearTimeout(playerLayoutSaveTimer);
  if (state) persistPlayerSession({ captureLayout: true });
  mode = newMode;
  localStorage.setItem("ccMode", mode);
  updateModeControls();
  if (state) {
    state.persistedMode = mode;
    // Stop whichever renderer was active before this switch (Sets mode's
    // own live simulation in particular -- see setRenderer.js) before its
    // state gets torn down below, rather than abandoning it to keep
    // ticking a now-orphaned node array in the background.
    if (state.stopRenderer) state.stopRenderer();
    // Board size depends on `mode` too (see applyBoardSize), so switching
    // modes mid-game can change W/H — recompute rather than reuse a
    // cached sets-mode layout sized for the board's previous dimensions.
    applyBoardSize(state.puzzle);
    state.setLayout = null;
    state.solutionLayout = null;
    state.prettyPrint = null;
    state.prettyPrintPromise = null;
    // Whichever mode we're switching TO just cleared the whole SVG itself
    // (buildGraph/buildStarGraph/buildSetGraph are all self-contained
    // about this) — so any previously-created sets-mode layers are now
    // stale DOM references. Force them to be recreated fresh next time
    // sets mode runs, rather than silently rendering into detached
    // elements.
    state.setLayersReady = false;
    buildForMode();
    const session = loadPlayerSession(localStorage, state.puzzle);
    const layout = session?.layouts?.[mode];
    if (layout &&
        state.layoutAdapter?.mode === mode &&
        typeof state.layoutAdapter.apply === "function") {
      state.layoutAdapter.apply(layout);
    }
    // "Show solution" is a decision about the puzzle, not just the
    // renderer that happened to be visible when it was clicked. A newly
    // selected mode still needs its own geometry, so immediately run that
    // renderer's final layout pass instead of exposing a crossed solved
    // board and making the player press the same control again.
    if (switchingLensPhase) {
      state.modeSwitchLayoutPromise = finishLensLayoutAfterModeSwitch(
        state,
        mode
      );
    } else if (state.solutionLayout === "pretty") {
      updateSolutionHint();
      setMessage(polishedLayoutMessage(mode), "good");
    } else if (state.completedViaShowSolution &&
        state.made === state.need &&
        state.solutionLayout !== "pretty") {
      state.modeSwitchLayoutPromise = finishSolvedLayoutAfterModeSwitch(state, mode);
    } else {
      updateSolutionHint();
    }
    persistPlayerSession();
  }
}
modeGraphBtn.addEventListener("click", () => setMode("graph"));
modeStarBtn.addEventListener("click", () => setMode("star"));
modeSetsBtn.addEventListener("click", () => setMode("sets"));

// ---------- setup: puzzle picker ----------
// Puzzles are grouped into <optgroup> sections by category, in the order
// each category first appears — same-category puzzles don't need to be
// adjacent in PUZZLES for this to group them correctly. Native <option>
// elements cannot reliably render styled badges, so compact symbols mark
// large boards and Concept Lenses; a disabled key explains them at the
// top of the open picker. The browse cards and active-puzzle heading use
// full styled labels instead.
// Disabled, so it's never a choice the picker can be changed *to* --
// only ever what it defaults to showing before any puzzle has actually
// loaded (browsing an overview screen on first load, before loadPuzzle
// ever sets .value). Without this, a bare <select> auto-selects its
// first real option instead, which looked like "Energy flow in living
// systems" was somehow the active puzzle while looking at an unrelated
// category's overview.
const placeholderOpt = document.createElement("option");
placeholderOpt.value = "";
placeholderOpt.textContent = "Choose a puzzle…";
placeholderOpt.disabled = true;
// A disabled option doesn't reliably become the default selection on
// its own -- Chromium skips straight to the first *enabled* option
// instead (confirmed live: selectedIndex landed on 1, not 0, without
// this). Forcing it explicitly is what actually makes it the default.
placeholderOpt.selected = true;
pickerEl.appendChild(placeholderOpt);

const pickerKeyOpt = document.createElement("option");
pickerKeyOpt.textContent = "▣ Large board · ◉ Concept Lenses · ▤ Learning introduction";
pickerKeyOpt.disabled = true;
pickerEl.appendChild(pickerKeyOpt);

// Groups are built first and appended after, in alphabetical order by
// label -- not PUZZLES' own authoring order, which is otherwise whatever
// category a puzzle happened to be added under first and has no
// browsing value of its own. Options within a group still follow
// PUZZLES order.
const pickerGroups = new Map();
PUZZLES.forEach((p, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  const markers = [
    p.large ? "▣" : "",
    p.lenses?.length ? "◉" : "",
    p.learningIntroduction ? "▤" : ""
  ]
    .filter(Boolean)
    .join(" ");
  opt.textContent = markers ? `${p.title}  ${markers}` : p.title;
  let group = pickerGroups.get(p.category);
  if (!group) {
    group = document.createElement("optgroup");
    group.label = p.category;
    pickerGroups.set(p.category, group);
  }
  group.appendChild(opt);
});
[...pickerGroups.keys()]
  .sort((a, b) => a.localeCompare(b))
  .forEach(category => pickerEl.appendChild(pickerGroups.get(category)));

// Curated catalogues get their own group, alphabetical by title, so the
// same picker can jump straight to a catalogue's own overview -- not just
// individual puzzles -- while browsing one. Values are prefixed
// ("catalogue:<id>") to stay unambiguous against puzzle options, whose
// values are plain PUZZLES array indices. Synthetic All/New Puzzles and
// Library aren't real catalogue objects, so they're deliberately left out.
const catalogueGroup = document.createElement("optgroup");
catalogueGroup.label = "Catalogues";
[...CATALOGUES]
  .sort((a, b) => a.title.localeCompare(b.title))
  .forEach(catalogue => {
    const opt = document.createElement("option");
    opt.value = `catalogue:${catalogue.id}`;
    opt.textContent = catalogue.title;
    catalogueGroup.appendChild(opt);
  });
pickerEl.appendChild(catalogueGroup);

pickerEl.addEventListener("change", () => {
  if (pickerEl.value.startsWith("catalogue:")) {
    appNavigation.navigateTo({
      kind: "catalogue",
      catalogueId: pickerEl.value.slice("catalogue:".length)
    });
    return;
  }
  const index = +pickerEl.value;
  appNavigation.openPuzzle(index, { preserveCatalogue: true });
});

// Keeps the picker's selection in sync with the active catalogue whenever
// one is being browsed (overview, category, subcategory, or its flat
// puzzle list) -- without this, the picker kept showing whichever puzzle
// was last loaded even while looking at an unrelated catalogue. Puzzle
// routes are deliberately left alone here: loadPuzzle sets the picker to
// that puzzle's own option right after this fires (see appNavigation's
// setContext, called before loadPuzzle on every puzzle route).
const CATALOGUE_PICKER_VIEW_KINDS = new Set([
  "catalogue", "catalogue-puzzles", "catalogue-category", "catalogue-subcategory"
]);
function syncPickerToContext(kind, catalogue) {
  if (kind === "puzzle") return;
  // A category/subcategory route can carry the *synthetic* All Puzzles
  // catalogue -- legacy `?category=` links, and `?catalogue=all&category=`,
  // both resolve that way (see parseCatalogueRoute in
  // catalogueNavigation.js). The picker only has options for real,
  // curated CATALOGUES entries, so that id would match no <option> and
  // silently leave the select with nothing selected instead of falling
  // back to the placeholder. Require the id to actually be a curated
  // catalogue before using it.
  const isCuratedCatalogue = !!catalogue &&
    CATALOGUES.some(entry => entry.id === catalogue.id);
  pickerEl.value = CATALOGUE_PICKER_VIEW_KINDS.has(kind) && isCuratedCatalogue
    ? `catalogue:${catalogue.id}`
    : "";
}
document.getElementById("reset").addEventListener("click", () => {
  clearTimeout(playerLayoutSaveTimer);
  if (state) clearPlayerSession(localStorage, state.puzzle);
  loadPuzzle(currentIndex, { restoreSession: false, saveCurrent: false });
});

// ---------- sharing a specific puzzle (and, optionally, its progress) ----------
// A URL like ?puzzle=energy-flow selects that puzzle on load, falling
// back to the default (index 0) if the id is missing or unrecognized
// — a stale/typo'd link should degrade to "just opens the game", not
// an error. Mode isn't part of the link: it's a per-visitor display
// preference (see `mode` above, persisted via localStorage), not
// something the sharer should force on whoever opens the link.
//
// If any connections have been made, the same link also carries
// &moves=<encoded>, letting two people hand a partly-solved board back
// and forth: each connection is a (source, target) pair of node ids
// (state.moveHistory, appended to in handleTap's connect branch), and
// on load those pairs are replayed as simulated taps through handleTap
// itself — the exact same mechanism showSolution() already uses —
// rather than reconstructing board state some other way. Node ids are
// a stable per-puzzle ordering (see loadPuzzle's node-building loop),
// so this only round-trips correctly for the same puzzle content on
// both ends; an edited puzzle after a link was shared is the one case
// this doesn't gracefully handle, same tradeoff as sharing any
// content-addressed link elsewhere.
//
// A fully-completed puzzle shares &solved instead of &moves — a plain
// flag, no node ids at all. It re-runs showSolution() on load, which
// already recomputes the ideal solution fresh from whatever the
// current puzzle data is rather than replaying anything id-based, so
// (unlike &moves) a solved link keeps working even after the puzzle
// itself gets revised later. The encoding itself lives in
// modules/shareLink.js -- pure functions, no game-state dependency.
// Shared by every "copy a link" button (the puzzle Share button, the
// overview screen's own Share button, and the completion screen's
// "Share these related puzzles" link) -- each status element gets its
// own timer, tracked on the element itself (a plain DOM property, not a
// module-scope variable) so two of these buttons can be mid-feedback at
// once without stepping on each other's timeout.
async function copyLink(url, statusEl) {
  clearTimeout(statusEl._clearTimer);
  try {
    await navigator.clipboard.writeText(url);
    statusEl.textContent = "Link copied!";
  } catch {
    statusEl.textContent = url;
  }
  statusEl._clearTimer = setTimeout(() => { statusEl.textContent = ""; }, 4000);
}

shareBtn.addEventListener("click", () => {
  const params = new URLSearchParams({ puzzle: state.puzzle.id });
  const context = appNavigation.validNavigationContextForPuzzle(state.puzzle);
  if (context) {
    if (context.catalogue.id !== "all") {
      params.set("catalogue", context.catalogue.id);
    }
    if (context.originCategory) {
      params.set("category", categorySlugFor(context.originCategory));
    }
    if (context.originSubcategory) {
      params.set("subcategory", context.originSubcategory);
    }
  }
  if (state.made === state.need) {
    params.set("solved", "1");
  } else if (state.moveHistory.length) {
    params.set("moves", encodeMoves(state.moveHistory));
  }
  copyLink(`${location.origin}${location.pathname}?${params.toString()}`, shareStatusEl);
});
// showSolution() replays real taps, and state.paint (set below by whichever
// build function is active) is mode-aware — so this single call already
// produces the right result whether the player is in graph or sets
// mode, with no branching needed here.
showSolutionBtn.addEventListener("click", () => {
  // Native disabled buttons do not dispatch ordinary pointer clicks, but
  // retain the guard as the state-machine boundary too (for synthetic
  // events and future callers): a busy or finished solution control is
  // never actionable.
  if (showSolutionBtn.disabled) return;
  if (mode === "star" && state && state.made === state.need) {
    if (state.solutionLayout === "animated" && state.prettyPrint) {
      state.prettyPrint();
    } else if (!state.solutionLayout && state.detangle) {
      state.detangle();
    } else {
      showSolution();
    }
  } else if ((mode === "graph" || mode === "sets") &&
             state && state.made === state.need &&
             state.layoutAdapter?.autoLayout &&
             !["polishing", "pretty"].includes(state.solutionLayout)) {
    // An organically completed board may still contain valid but
    // non-ideal bridge endpoints. Preserve Show Solution's semantic job
    // first, then pretty-print the resulting ideal topology.
    showSolution();
    state.layoutAdapter.autoLayout();
  } else {
    showSolution();
  }
});

// ---------- helpers ----------
const isBridge = n => n.gs.length > 1;
const isDone = n => n.connected.length === n.gs.length;
// pillWidth (modules/puzzleGraph.js) and rectEdgeDist/segmentDistToPoint
// (modules/geometry.js) are pure functions of plain data -- game.js no
// longer imports them directly, since their only callers (computeSetLayout
// and friends) now live in modules/setRenderer.js, which imports them
// itself. TAG_H/mayCarryIdealTag moved there too, for the same reason.

// markIdealFor/hasBetterSolution/handleTap/checkClusterCompletion/
// showSolution now live in modules/gameLogic.js's createGameEngine
// factory (called below, once its DOM-touching dependencies exist) --
// the gameplay rules engine, decoupled from which rendering mode is
// currently active via hooks the active renderer sets on `state`
// itself (see buildGraph/buildSetGraph).

function updateSolutionHint() {
  const stage = state
    ? state.solutionLayout
    : null;
  const modeSwitchPolishing = !!state?.modeSwitchPolishing && stage !== "pretty";
  const usingLenses = !!state?.puzzle?.lenses?.length &&
    state.made === state.need &&
    state.phase !== "complete";
  if (usingLenses) {
    const preparing = state.phase === "lens-preparing";
    const busy = preparing || modeSwitchPolishing;
    showSolutionBtn.classList.remove("has-better");
    showSolutionBtn.disabled = true;
    showSolutionBtn.setAttribute("aria-busy", String(busy));
    showSolutionBtn.textContent = modeSwitchPolishing
      ? "Polishing…"
      : preparing
        ? "Preparing lenses…"
        : "Map complete";
    updateModeControls();
    return;
  }
  showSolutionBtn.classList.toggle("has-better", hasBetterSolution());
  const busy = modeSwitchPolishing || stage === "animating" || stage === "polishing";
  showSolutionBtn.disabled = busy || stage === "pretty";
  showSolutionBtn.setAttribute("aria-busy", String(busy));
  showSolutionBtn.textContent = stage === "animating"
    ? "Untangling…"
    : modeSwitchPolishing
      ? "Polishing…"
      : stage === "animated"
      ? "Polish layout"
      : stage === "polishing"
        ? "Polishing…"
        : stage === "pretty"
          ? "Layout polished"
          : "Show solution";
  updateModeControls();
}

function setMessage(text, tone) {
  msgEl.textContent = text || "";
  msgEl.dataset.tone = tone || "";
}

function updateLearningIntroduction() {
  const introduction = state?.learningIntroduction || null;
  const gated = !layoutAuthoringMode && learningIntroductionGate(
    introduction,
    state?.learningIntroductionStatus
  );
  if (state) state.learningGated = gated;
  wrapEl.classList.toggle("learning-gated", gated);
  puzzleViewEl.classList.toggle("learning-gated", gated);
  learningIntroductionEl.hidden = !introduction;
  learningReviewBtn.hidden = !introduction || gated;
  const reviewLabel = state?.learningIntroductionStatus === "read"
    ? "Review introduction"
    : "Read the learning introduction";
  learningReviewBtn.title = reviewLabel;
  learningReviewBtn.setAttribute("aria-label", reviewLabel);
  learningIntroductionEl.model = introduction ? {
    puzzle: state.puzzle,
    introduction,
    gate: gated,
    status: state.learningIntroductionStatus
  } : null;
}

function recordLearningIntroductionStatus(status, puzzleId) {
  if (!state?.learningIntroduction || state.puzzle.id !== puzzleId) return;
  const wasGated = state.learningGated;
  saveLearningIntroductionStatus(localStorage, state.puzzle, status);
  state.learningIntroductionStatus = status;
  updateLearningIntroduction();
  if (wasGated && !state.learningGated) {
    setMessage(
      status === "read"
        ? "Introduction complete. Organize the ideas on the board."
        : "Introduction skipped. You can review it at any time.",
      "good"
    );
    titleEl.focus();
    if (pendingInitialSharedParams) {
      const params = pendingInitialSharedParams;
      pendingInitialSharedParams = null;
      replayInitialSharedState(params);
    }
  }
}

learningIntroductionEl.addEventListener("learning-introduction-status", event => {
  recordLearningIntroductionStatus(event.detail?.status, event.detail?.puzzleId);
});
learningReviewBtn.addEventListener("click", event => {
  learningIntroductionEl.openLesson(event.currentTarget);
});

function captureLensSession() {
  if (!state?.puzzle?.lenses?.length || state.made !== state.need) return null;
  if (state.lensMode === "assignment") {
    return {
      phase: state.phase,
      assignments: [...state.lensAssignments]
    };
  }
  return {
    index: state.lensIndex || 0,
    phase: state.phase,
    selections: [...(state.lensSelections || [])],
    selection: state.lensQuizSelection ?? null
  };
}

function chooseLensForNode(node, lensId) {
  if (state?.phase !== "lens-assigning" ||
      !node?.word ||
      !assignmentConceptWords(state.puzzle).includes(node.word)) {
    return;
  }
  if (lensId) state.lensAssignments.set(node.word, lensId);
  else state.lensAssignments.delete(node.word);
  const assigned = state.lensAssignments.size;
  const total = assignmentConceptWords(state.puzzle).length;
  setMessage(
    assigned === total
      ? "Every badged concept has a lens. Review your assignments, then check them."
      : `${assigned} of ${total} concepts assigned.`,
    "good"
  );
  updateLensInterface();
  persistPlayerSession();
}

function openLensAssignment(node) {
  if (state?.phase !== "lens-assigning" ||
      !node?.word ||
      !assignmentConceptWords(state.puzzle).includes(node.word)) {
    return false;
  }
  return lensAssignmentEl.openChooser(node.word, document.activeElement);
}

function chooseLensQuizOption(optionId) {
  if (state?.phase !== "lens-quiz-answering") return;
  state.lensQuizSelection = optionId;
  updateLensInterface();
  persistPlayerSession();
}

function renderLensQuizOptions(lens) {
  lensQuizOptionsEl.replaceChildren();
  if (!lens) return;
  const revealed = state.phase === "lens-revealed";
  for (const option of quizOptionsForDisplay(state.puzzle, lens)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lens-quiz-option";
    button.textContent = option.label;
    button.disabled = revealed;
    const selected = state.lensQuizSelection === option.id;
    button.setAttribute("aria-pressed", String(selected));
    if (selected) button.classList.add("selected");
    if (revealed) button.classList.add(option.correct ? "correct" : "incorrect");
    button.addEventListener("click", () => chooseLensQuizOption(option.id));
    lensQuizOptionsEl.appendChild(button);
  }
}

function renderLensExplanation(lens) {
  lensExplanationEl.replaceChildren();
  if (!lens) return;
  const explanation = document.createElement("div");
  explanation.textContent = lens.explanation;
  lensExplanationEl.appendChild(explanation);
  if (!lens.reasons) return;
  const list = document.createElement("ul");
  lens.targets.forEach(word => {
    if (!lens.reasons[word]) return;
    const item = document.createElement("li");
    const term = document.createElement("strong");
    term.textContent = `${word}: `;
    item.append(term, lens.reasons[word]);
    list.appendChild(item);
  });
  if (list.children.length) lensExplanationEl.appendChild(list);
}

function updateLensInterface({ paint = true } = {}) {
  svg.classed(
    "lens-assignment-focus",
    state?.lensMode === "assignment" && state.phase !== "assembling"
  );
  if (!state?.puzzle?.lenses?.length || state.phase === "assembling") {
    lensPanelEl.hidden = true;
    lensAssignmentEl.hidden = true;
    return;
  }
  const lenses = state.puzzle.lenses;
  const lens = currentLens(state);

  if (state.lensMode === "assignment") {
    lensPanelEl.hidden = true;
    lensAssignmentEl.hidden = false;
    let result = null;
    if (state.phase === "lens-preparing") {
      state.progressLabel = "Preparing lenses…";
    } else if (state.phase === "lens-assigning") {
      state.progressLabel =
        `${state.lensAssignments.size} of ${assignmentConceptWords(state.puzzle).length} assigned`;
    } else if (state.phase === "complete") {
      result = state.lensAssignmentResult ||
        lensAssignmentResult(state.puzzle, state.lensAssignments);
      state.lensAssignmentResult = result;
      state.progressLabel = "Lens assignment complete";
    }
    lensAssignmentEl.model = {
      puzzle: state.puzzle,
      assignments: state.lensAssignments,
      phase: state.phase,
      result
    };
    updateModeControls();
    updateSolutionHint();
    if (paint) state.paint?.();
    return;
  }

  const quizMode = state.lensMode === "quiz";
  lensPanelEl.hidden = false;
  lensAssignmentEl.hidden = true;
  lensCheckBtn.hidden = true;
  lensCheckBtn.disabled = false;
  lensCheckBtn.textContent = quizMode ? "Check answer" : "Check selections";
  lensNextBtn.hidden = true;
  lensResultEl.textContent = "";
  lensExplanationEl.replaceChildren();
  lensQuizOptionsEl.hidden = !quizMode;
  if (!quizMode) lensQuizOptionsEl.replaceChildren();

  if (state.phase === "lens-preparing") {
    lensProgressEl.textContent = "Concept lenses";
    lensPromptEl.textContent = "Preparing the completed map…";
    state.progressLabel = "Preparing lenses…";
  } else if (state.phase === "complete") {
    lensProgressEl.textContent = "Lenses complete";
    lensPromptEl.textContent =
      `You completed the map and examined it through ${lenses.length} cross-cutting lenses.`;
    state.progressLabel = `${lenses.length} lenses complete`;
  } else if (lens) {
    lensProgressEl.textContent = `Lens ${state.lensIndex + 1} of ${lenses.length}`;
    lensPromptEl.textContent = lens.prompt;
    state.progressLabel = `Lens ${state.lensIndex + 1} of ${lenses.length}`;
    if (quizMode) {
      renderLensQuizOptions(lens);
      if (state.phase === "lens-quiz-answering") {
        lensCheckBtn.hidden = false;
        lensCheckBtn.disabled = !state.lensQuizSelection;
      } else if (state.phase === "lens-revealed") {
        const result = lensQuizResult(lens, state.lensQuizSelection);
        lensResultEl.textContent = result.correct
          ? `Correct — ${result.correctOption?.label}.`
          : `Not quite — the correct answer was ${result.correctOption?.label}.`;
        renderLensExplanation(lens);
        lensNextBtn.hidden = false;
        lensNextBtn.textContent = state.lensIndex === lenses.length - 1
          ? "Finish lenses"
          : "Next lens";
      }
    } else if (state.phase === "lens-selecting") {
      lensCheckBtn.hidden = false;
    } else if (state.phase === "lens-revealed") {
      const result = lensResult(lens, state.lensSelections);
      const extra = result.extra.length;
      lensResultEl.textContent =
        `You identified ${result.correct.length} of ${result.targetCount}.` +
        (extra ? ` ${extra} extra ${extra === 1 ? "selection" : "selections"}.` : "");
      renderLensExplanation(lens);
      lensNextBtn.hidden = false;
      lensNextBtn.textContent = state.lensIndex === lenses.length - 1
        ? "Finish lenses"
        : "Next lens";
    }
  }
  updateModeControls();
  updateSolutionHint();
  if (paint) state.paint?.();
}

async function beginLensSequence() {
  if (!state?.puzzle?.lenses?.length || state.made !== state.need) return;
  if (lensPhaseActive(state) && state.phase !== "lens-preparing") return;
  const lensState = state;
  state.phase = "lens-preparing";
  state.lensIndex = 0;
  state.lensSelections = new Set();
  state.lensQuizSelection = null;
  state.lensAssignments = new Map();
  state.lensAssignmentResult = null;
  state.selected = null;
  updateLensInterface();
  const pendingLayout = state.detanglePromise || state.prettyPrintPromise;
  if (pendingLayout) {
    try {
      await pendingLayout;
    } catch {
      // A readable, frozen live layout is still a valid stage if optional
      // polish fails; the lens activity itself should remain available.
    }
  }
  if (state !== lensState) return;
  // Ordinary solved puzzles can expose a second "Polish layout" click
  // after the human-like Star detangler. Lenses take over that control,
  // so automatically supply the final aesthetic pass for layouts made
  // by Show Solution. A player's organically completed layout has no
  // generated solution stage and is still preserved as-is.
  if (state.completedViaShowSolution &&
      state.solutionLayout !== "pretty" &&
      typeof state.prettyPrint === "function") {
    try {
      await state.prettyPrint();
    } catch {
      // The stable detangled layout remains usable if optional polish
      // fails; lens selection should not be lost over presentation.
    }
  }
  if (state !== lensState) return;
  state.freezeForLenses?.();
  state.phase = state.lensMode === "assignment"
    ? "lens-assigning"
    : state.lensMode === "quiz"
      ? "lens-quiz-answering"
      : "lens-selecting";
  setMessage(
    state.lensMode === "assignment"
      ? "Map complete. Assign any badged concepts you recognize, then check your work."
      : state.lensMode === "quiz"
        ? "Map complete. Choose the answer you think is correct, then check it."
        : "Select every concept that fits this lens, then check your selections.",
    "good"
  );
  updateLensInterface();
  persistPlayerSession({ captureLayout: true });
}

function restoreLensSession(savedLens) {
  if (!state.puzzle.lenses?.length) return;
  const count = state.puzzle.lenses.length;
  state.lensStartPending = false;
  if (!savedLens) {
    beginLensSequence();
    return;
  }
  if (state.lensMode === "assignment") {
    state.lensAssignments = new Map(savedLens.assignments || []);
    state.lensAssignmentResult = null;
    state.selected = null;
    state.freezeForLenses?.();
    if (savedLens.phase === "complete") {
      state.phase = "complete";
      state.lensAssignmentResult = lensAssignmentResult(
        state.puzzle,
        state.lensAssignments
      );
      overviewRenderer.showRelatedPuzzles(state.puzzle);
      setMessage("Saved completed lens assignment restored.", "good");
    } else {
      state.phase = "lens-assigning";
      setMessage("Saved lens assignments restored — continue classifying the map.", "good");
    }
    updateLensInterface();
    if (state.solutionLayout === "animated") {
      state.modeSwitchLayoutPromise = finishLensLayoutAfterModeSwitch(state, mode);
    }
    return;
  }
  state.lensIndex = Math.max(0, Math.min(count - 1, Number(savedLens.index) || 0));
  state.lensSelections = new Set(savedLens.selections || []);
  state.lensQuizSelection = savedLens.selection ?? null;
  state.selected = null;
  state.freezeForLenses?.();
  const quizMode = state.lensMode === "quiz";
  if (savedLens.phase === "complete") {
    state.phase = "complete";
    overviewRenderer.showRelatedPuzzles(state.puzzle);
    setMessage(`Saved completed puzzle restored — ${count} lenses complete.`, "good");
  } else {
    state.phase = savedLens.phase === "lens-revealed"
      ? "lens-revealed"
      : quizMode ? "lens-quiz-answering" : "lens-selecting";
    setMessage(
      state.phase === "lens-revealed"
        ? "Saved lens result restored."
        : quizMode
          ? "Saved lens progress restored — continue choosing your answer."
          : "Saved lens progress restored — continue your selections.",
      "good"
    );
  }
  updateLensInterface();
  // A session saved before the automatic final pass may contain the
  // detangler's "animated" Star layout. Upgrade only that generated
  // state on restore; a player's organically completed custom layout
  // has no solutionLayout marker and remains untouched.
  if (state.solutionLayout === "animated") {
    state.modeSwitchLayoutPromise = finishLensLayoutAfterModeSwitch(state, mode);
  }
}

function finishLensSequence() {
  if (!state?.puzzle?.lenses?.length) return;
  state.phase = "complete";
  state.lensSelections = new Set();
  state.lensQuizSelection = null;
  state.freezeForLenses?.();
  setMessage(
    `You completed the map and examined it through ${state.puzzle.lenses.length} cross-cutting lenses.`,
    "good"
  );
  overviewRenderer.showRelatedPuzzles(state.puzzle);
  trackPuzzleCompleted(state.puzzle.id, mode, state);
  updateLensInterface();
  persistPlayerSession({ captureLayout: true });
}

function finishLensAssignment() {
  if (state?.phase !== "lens-assigning") return;
  lensAssignmentEl.closeChooser();
  state.lensAssignmentResult = lensAssignmentResult(
    state.puzzle,
    state.lensAssignments
  );
  state.phase = "complete";
  state.freezeForLenses?.();
  setMessage(
    `Lens assignment complete — ${lensAssignmentSummary(state.lensAssignmentResult)}`,
    "good"
  );
  overviewRenderer.showRelatedPuzzles(state.puzzle);
  trackPuzzleCompleted(state.puzzle.id, mode, state);
  updateLensInterface();
  persistPlayerSession({ captureLayout: true });
}

lensAssignmentEl.addEventListener("lens-assignment-change", event => {
  const node = state?.nodes.find(candidate => candidate.word === event.detail?.word);
  chooseLensForNode(node, event.detail?.lensId || null);
});

lensAssignmentEl.addEventListener("lens-assignment-check", () => {
  finishLensAssignment();
});

lensCheckBtn.addEventListener("click", () => {
  if (state?.phase === "lens-quiz-answering") {
    if (!state.lensQuizSelection) return;
    state.phase = "lens-revealed";
    setMessage("Review the highlighted answer and explanation.", "good");
    updateLensInterface();
    persistPlayerSession();
    return;
  }
  if (state?.phase !== "lens-selecting") return;
  state.phase = "lens-revealed";
  setMessage("Review the highlighted answer set and explanation.", "good");
  updateLensInterface();
  persistPlayerSession();
});

lensNextBtn.addEventListener("click", () => {
  if (state?.phase !== "lens-revealed") return;
  if (state.lensIndex >= state.puzzle.lenses.length - 1) {
    finishLensSequence();
    return;
  }
  state.lensIndex++;
  if (state.lensMode === "quiz") {
    state.lensQuizSelection = null;
    state.phase = "lens-quiz-answering";
    setMessage("Choose the answer you think is correct for the next lens.", "good");
  } else {
    state.lensSelections = new Set();
    state.phase = "lens-selecting";
    setMessage("Apply the next lens to the same completed map.", "good");
  }
  updateLensInterface();
  persistPlayerSession();
});

// Purely a display side effect, kept in its own line rather than folded
// into #message — it must never clobber (or be clobbered by) the game's
// own status text, since a hover can happen at any point mid-interaction.
// resolveLink/normalizeInfo/searchLink/linkLabel now live in
// modules/termInfo.js -- pure functions, no game-state dependency.

// A node's info can include real links, so simply clearing on
// mouseleave would yank them out from under the pointer the instant it
// moves from the node down toward #term-info to click one — this grace
// period, canceled if the pointer actually reaches the panel (see the
// mouseenter/mouseleave wiring on termInfoEl below), is what makes that
// trip possible. Deliberately not gated behind any dwell/intent delay on
// the *show* side, even though a busy board can put another info node
// on the direct path down to the panel: the common case is a player
// sweeping across several nodes to read them in quick succession, and
// that has to stay instant.
//
// A busy board can still put another info node on the direct path down
// to the panel, which — since hover has to stay instant for the common
// case above — would otherwise hijack the display the moment the
// pointer merely passes over it en route. Clicking (or tab-focusing) a
// node already draws a visible focus ring around it for free, with no
// extra state to invent — reusing exactly that as a lock is what
// resolves this without costing hover any latency: while some node is
// focused, further hover events are ignored entirely (see
// focusedInfoNode below), so the display only changes when focus itself
// moves to a different node. Plain mouse-only browsing, with nothing
// ever clicked, is completely unaffected and stays instant throughout.
let clearInfoTimer = null;
let focusedInfoNode = null;
// Every reference node gets at least a Search link, authored termInfo or
// not. Connector bridges intentionally do not: their contextual phrasing is
// useful on this board but predictably poor as a standalone search query.
// text and link used to be bundled as one all-or-nothing unit, so a
// term nobody had gotten around to writing a definition for showed
// literally nothing on hover, even though a free, zero-authoring-effort
// search link was one line away the whole time. The info-dot marks
// nodes with hand-written text specifically (see the filter at its
// definition) — not just any termInfo entry, since a link-only override
// with no note shouldn't visually stand out from a plain auto-search node.
function appendInfoAnchor(container, href, label = null) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = `${label || linkLabel(href)} ↗`;
  container.appendChild(anchor);
}

// A citation renders as its own small block, one line per citation,
// distinct from the inline "See also: ↗ · ↗" run above it -- a formal
// footnote reads as reference text, not another clickable chip. Only
// linked (target="_blank", like every other outbound link here) when
// the citation actually carries a url; otherwise it's plain text.
function renderCitationsList(citations) {
  const list = document.createElement("ul");
  list.className = "citations";
  citations.forEach(citation => {
    const item = document.createElement("li");
    const formatted = formatCitation(citation);
    if (citation.url) {
      const anchor = document.createElement("a");
      anchor.href = citation.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = `${formatted} ↗`;
      item.appendChild(anchor);
    } else {
      item.textContent = formatted;
    }
    list.appendChild(item);
  });
  return list;
}

// Quiz mode's comparative reveal can put up to three different incorrect
// options' evidence on the board at once, all sharing the identical dotted
// style (see lens-quiz-incorrect in styles.css) -- nothing about the board
// itself says which option a given dotted node belongs to. Hovering already
// works unconditionally, in every phase, on every node (see the renderers'
// mouseenter wiring), so this rides that existing path rather than adding a
// new interaction just for quiz mode.
function quizEvidenceNote(n) {
  if (!state || state.phase !== "lens-revealed" ||
      normalizedLensMode(state.puzzle) !== "quiz") {
    return null;
  }
  const option = quizOptionForNode(n, currentLens(state));
  if (!option) return null;
  return option.correct
    ? `Evidence for ${option.label}, the correct answer. `
    : `Evidence for ${option.label}, not the correct answer. `;
}

function showTermInfo(n) {
  clearTimeout(clearInfoTimer);
  termInfoEl.textContent = "";
  const info = n.info || {};
  // A single inline wrapper, not multiple direct children of the flex
  // container — otherwise the text and each link become separate flex
  // items laid out in a row instead of wrapping together as one
  // paragraph (confirmed: the links floated off to the side instead of
  // following the wrapped text).
  const inner = document.createElement("span");
  const quizNote = quizEvidenceNote(n);
  const primaryHref = info.link || searchLinkForTerm(n.word, n.termRole);
  const hasContent = !!(
    quizNote || info.text || primaryHref || info.seeAlso?.length ||
    info.citations?.length
  );
  if (!hasContent) {
    termInfoEl.classList.remove("visible");
    return;
  }
  if (quizNote) inner.append(quizNote);
  inner.append(info.text ? `${n.word}: ${info.text} ` : `${n.word} `);
  if (primaryHref) appendInfoAnchor(inner, primaryHref, info.linkLabel);
  if (info.seeAlso?.length) {
    inner.append(" See also: ");
    info.seeAlso.forEach((entry, index) => {
      if (index) inner.append(" · ");
      appendInfoAnchor(inner, entry.href, entry.label);
    });
  }
  termInfoEl.append(inner);
  if (info.citations?.length) termInfoEl.append(renderCitationsList(info.citations));
  termInfoEl.classList.add("visible");
}
function clearTermInfo() {
  clearTimeout(clearInfoTimer);
  // Only smooths over brief gaps in pure mouse-only browsing now (a
  // small jitter between adjacent elements) — reaching a link reliably
  // is the focus lock's job (see focusTermInfo/blurTermInfo below), not
  // this timer's, so it no longer has to cover a full trip down to the
  // panel the way it once did.
  clearInfoTimer = setTimeout(() => termInfoEl.classList.remove("visible"), 300);
}
// The pointer's trip from the node down to a link inside the panel
// passes through here — canceling the pending clear on arrival is what
// keeps it open for that trip; leaving again just resumes the same
// grace-period clear as leaving the node itself.
termInfoEl.addEventListener("mouseenter", () => clearTimeout(clearInfoTimer));
termInfoEl.addEventListener("mouseleave", () => clearTermInfo());

// Clicking (or tab-focusing) a node already draws a visible focus ring
// around it — reusing that as the "this display is locked" signal (see
// the comment above clearInfoTimer) rather than inventing a parallel
// selected/pinned concept of our own.
function focusTermInfo(n) {
  focusedInfoNode = n;
  showTermInfo(n);
}
function blurTermInfo(n) {
  if (focusedInfoNode !== n) return;
  focusedInfoNode = null;
  clearTermInfo();
}

// The puzzle title above the board gets the exact same hover/tap info
// popup a term or (in Star mode) a cluster title does -- same
// showTermInfo/focusTermInfo path, same "at least a Search link, even
// unauthored" fallback (see the comment above showTermInfo). A single
// stable object, not a fresh one per hover, both for the focus-lock
// identity check in blurTermInfo (see its comment) and so this wiring
// only needs to happen once here rather than redone on every puzzle
// load -- loadPuzzle just updates its word/info in place.
const titlePopoverNode = { word: "", info: null };
titleEl.addEventListener("mouseenter", () => { if (!focusedInfoNode) showTermInfo(titlePopoverNode); });
titleEl.addEventListener("mouseleave", () => { if (!focusedInfoNode) clearTermInfo(); });
titleEl.addEventListener("focus", () => focusTermInfo(titlePopoverNode));
titleEl.addEventListener("blur", () => blurTermInfo(titlePopoverNode));

// `relation` (optional, bridges only) is { label, description } from
// RELATION_KINDS. `direction` is the earned source → bridge → destination
// reading for a directed bridge. Both remain secondary lines on the same
// card and appear at the exact moment the bridge fact itself does.
function addFactCard(kind, title, fact, relation, direction) {
  const card = document.createElement("div");
  card.className = `fact-card ${kind}`;
  card.innerHTML = `<strong>${title}</strong><span>${fact}</span>`;
  if (relation) {
    const line = document.createElement("span");
    line.className = "relation-kind";
    line.innerHTML = `<strong>${relation.label}.</strong> ${relation.description}`;
    card.appendChild(line);
  }
  if (direction) {
    const line = document.createElement("span");
    line.className = "bridge-direction";
    line.innerHTML = `<strong>Direction.</strong> ${direction}`;
    card.appendChild(line);
  }
  factsEl.appendChild(card);
}

// Where a root-URL visit with no specific puzzle named lands -- used by
// the bootstrap below both for a truly param-less visit and for a
// stale/typo'd ?puzzle= id, since neither has any better claim on
// "which puzzle" than the other. Per the arcade-machines framing (see
// the design discussion this responds to): a puzzle is always loaded,
// live and ready to play, never a blank/idle state -- what varies is
// *which* one.
//
// - A remembered last-played puzzle (localStorage.ccLastPuzzle, set by
//   loadPuzzle) that itself lists a relatedPuzzles entry advances to
//   that entry -- the one deliberately-authored "what's next" signal
//   this catalog has, so a returning visitor with one available moves
//   forward through it rather than replaying the same puzzle again.
// - Everything else -- a genuinely first-time visitor, cleared storage,
//   or a remembered puzzle with no relatedPuzzles to advance into --
//   picks a random puzzle from puzzles/showcase.js's SHOWCASE_PUZZLE_IDS,
//   a short hand-picked sample rather than the whole catalog -- see that
//   file's own comment. Falls back to the whole catalog if that pool is
//   somehow empty, so this never dead-ends the page.
//
// Both lookups are fresh, not trusted blindly, in case the puzzle or
// its listed relatedPuzzles entry has since been removed from the
// catalog.
function goToDefaultLanding() {
  const lastId = localStorage.getItem("ccLastPuzzle");
  const lastPuzzle = lastId ? PUZZLES.find(p => p.id === lastId) : null;
  const nextId = lastPuzzle?.relatedPuzzles?.entries?.[0]?.id;
  const nextIndex = nextId ? PUZZLES.findIndex(p => p.id === nextId) : -1;
  if (nextIndex >= 0) {
    loadPuzzle(nextIndex);
    return;
  }
  const pool = PUZZLES.filter(p => SHOWCASE_PUZZLE_IDS.has(p.id));
  const candidates = pool.length ? pool : PUZZLES;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  loadPuzzle(PUZZLES.indexOf(chosen));
}

overviewRenderer = createOverviewRenderer({
  puzzles: PUZZLES,
  catalogues: CATALOGUES,
  storage: localStorage,
  layoutAuthoringMode,
  adminMode,
  elements: {
    termInfoEl,
    factsEl,
    relatedPuzzlesEl,
    puzzleInfoEl,
    puzzleCatalogueSuggestionEl,
    puzzleMetaEl,
    puzzleStatsReportEl,
    puzzleViewEl,
    puzzleControlsEl,
    browsePuzzlesBtn,
    contextNavEl,
    breadcrumbsEl,
    backToCatalogueBtn,
    overviewEl,
    overviewTitleEl,
    overviewSubtitleEl,
    overviewProgressEl,
    overviewSearchEl,
    overviewSearchInputEl,
    overviewListEl,
    overviewShareRowEl,
    overviewShareBtn,
    overviewShareStatusEl
  },
  getNavigationContext: () => appNavigation.getContext(),
  navigateTo: (...args) => appNavigation.navigateTo(...args),
  openPuzzle: (...args) => appNavigation.openPuzzle(...args),
  persistCurrentPuzzle: () => {
    if (state) persistPlayerSession({ captureLayout: true });
  },
  copyLink,
  showTermInfo,
  clearTermInfo,
  focusTermInfo,
  blurTermInfo,
  getFocusedInfoNode: () => focusedInfoNode,
  shareUrlForRoute: route => appNavigation.shareUrlForRoute(route)
});

appNavigation = createAppNavigation({
  puzzles: PUZZLES,
  catalogues: CATALOGUES,
  layoutAuthoringMode,
  validModes: VALID_MODES,
  browsePuzzlesBtn,
  getState: () => state,
  persistCurrentPuzzle: () => {
    if (state) persistPlayerSession({ captureLayout: true });
  },
  loadPuzzle,
  goToDefaultLanding,
  views: overviewRenderer,
  onContextChange: syncPickerToContext
});

// getState/getMode are accessors, not one-time values, since both
// `state` and `mode` are reassigned after this call (a fresh state
// object per loadPuzzle, a new mode string per setMode) -- the engine
// always needs whatever's current, not a stale snapshot from whenever
// createGameEngine happened to run.
const { handleTap, checkClusterCompletion, showSolution, hasBetterSolution, markIdealFor } = createGameEngine({
  getState: () => state,
  getMode: () => mode,
  isDone,
  isBridge,
  showTermInfo,
  setMessage,
  addFactCard,
  trackPuzzleCompleted,
  showRelatedPuzzles: overviewRenderer.showRelatedPuzzles
});

const { buildGraph } = createGraphRenderer({
  svg,
  getState: () => state,
  getW: () => W,
  getH: () => H,
  getSim: () => sim,
  setSim: newSim => { sim = newSim; },
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode: () => focusedInfoNode,
  updateSolutionHint, countEl, setMessage
});

const { buildStarGraph } = createStarRenderer({
  svg,
  getState: () => state,
  getW: () => W,
  getH: () => H,
  getSim: () => sim,
  setSim: newSim => { sim = newSim; },
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode: () => focusedInfoNode,
  updateSolutionHint, countEl, setMessage
});

const { buildSetGraph } = createSetRenderer({
  svg,
  getState: () => state,
  getW: () => W,
  getH: () => H,
  getSim: () => sim,
  isDone, isBridge, handleTap, showTermInfo, clearTermInfo, focusTermInfo, blurTermInfo,
  getFocusedInfoNode: () => focusedInfoNode,
  updateSolutionHint, countEl, setMessage
});

// Single dispatch point for "build whatever the current `mode` is",
// used by both loadPuzzle and setMode rather than repeating the same
// three-way branch in each.
function buildForMode() {
  (mode === "graph" ? buildGraph : mode === "star" ? buildStarGraph : buildSetGraph)();
}

function authoringPrepared() {
  return layoutAuthoringMode &&
    mode === "star" &&
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
  if (!layoutAuthoringMode || !state) return;
  const prepared = authoringPrepared();
  const draft = loadStarLayoutDraft(localStorage, state.puzzle, W, H);
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
  const layout = state.captureStarLayout();
  const result = saveStarLayoutDraft(localStorage, layout, state.puzzle, W, H);
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
  if (!layoutAuthoringMode || !state) return;
  const preparingState = state;
  layoutAuthoringPrepareBtn.disabled = true;
  setLayoutAuthoringStatus("Preparing the generated solution…");
  try {
    if (state.made !== state.need) {
      showSolution();
    } else if (!state.captureStarLayout && state.detangle) {
      state.detangle();
    }
    if (state.detanglePromise) await state.detanglePromise;
    if (state !== preparingState) return;
    if (state.solutionLayout === "animated" && state.prettyPrint) {
      await state.prettyPrint();
    }
    if (state !== preparingState) return;
    setLayoutAuthoringStatus("Generated layout ready — drag any node to edit it.", "good");
    updateLayoutAuthoringPanel();
    if (authoringPrepared()) {
      const metrics = state.getStarLayoutMetrics();
      if (metrics.lineCrossings > 0 ||
          metrics.edgeNodeIntersections > 0 ||
          metrics.overlaps > 0) {
        setLayoutAuthoringStatus(
          "Generated layout ready — metrics flag residual issues; drag to tidy if you want, or export when it looks right.",
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
  const layout = loadStarLayoutDraft(localStorage, state.puzzle, W, H);
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
  if (!state) return;
  const cleared = clearStarLayoutDraft(localStorage, state.puzzle, W, H);
  setLayoutAuthoringStatus(cleared ? "Local draft cleared." : "Draft could not be cleared.");
  updateLayoutAuthoringPanel();
});
layoutAuthoringExportBtn.addEventListener("click", () => {
  if (!authoringPrepared()) return;
  const layout = state.captureStarLayout();
  const validation = validateStarLayoutDocument(
    layout,
    state.puzzle,
    { width: W, height: H }
  );
  if (!validation.valid) {
    setLayoutAuthoringStatus(validation.errors.join("; "), "error");
    updateLayoutAuthoringPanel();
    return;
  }
  const blob = new Blob([`${JSON.stringify(layout, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.puzzle.id}-star-layout.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  state.lastExportedStarLayout = layout;
  setLayoutAuthoringStatus("Repository-ready JSON exported.", "good");
});

// Sets mode draws containers *and* the terms inside them, and Star mode
// routes every connection through a cluster's title hub rather than
// point-to-point (so a bridge fans one line into each of its cluster
// hubs) -- both need more room than
// Graph mode's per-term board regardless of whether the puzzle itself
// is flagged `large`, and for different reasons from each other, not
// the same one. The `wide` class only actually widens the layout when
// the viewport has room for it (max-width is a ceiling) -- measure
// rather than assume, so a small screen falls back to the standard
// coordinate space instead of rendering things at a cramped scale.
// Graph mode never requests it on its own (only via `puzzle.large`) --
// its one-line-per-node layout stays comfortable at the standard size
// regardless of bridge count, and it's deliberately left as the mode
// that works everywhere, on every puzzle, even on the narrowest screen
// that can't fit the wide board at all -- switching modes, not hunting
// for a puzzle-by-puzzle size metric, is the fallback for that visitor.
// An explicit puzzle.large flag is different: it records an author/layout
// requirement, so preserve that canvas at every viewport instead of
// invalidating the reason the puzzle was marked large.
function applyBoardSize(puzzle) {
  const wantsWide = puzzle.large || mode === "sets" || mode === "star";
  wrapEl.classList.toggle("wide", wantsWide);
  const gotWideRoom = wantsWide && wrapEl.getBoundingClientRect().width >= 900;
  const useExpandedCanvas = puzzle.large || gotWideRoom;
  [W, H] = useExpandedCanvas
    ? (mode === "sets" ? BOARD_SIZE.circleWide : BOARD_SIZE.wide)
    : BOARD_SIZE.standard;
  svg.attr("viewBox", `0 0 ${W} ${H}`);
}

// ---------- load / reset ----------
function loadPuzzle(index, {
  restoreSession = true,
  saveCurrent = true,
  persistInitial = true,
  focus = false
} = {}) {
  clearTimeout(playerLayoutSaveTimer);
  if (state && saveCurrent) persistPlayerSession({ captureLayout: true });
  const puzzle = PUZZLES[index];
  if (state && state.puzzle.id !== puzzle.id) pendingInitialSharedParams = null;
  const learningIntroduction = normalizedLearningIntroduction(puzzle);
  const learningIntroductionStatus = learningIntroduction
    ? loadLearningIntroductionStatus(localStorage, puzzle)
    : null;
  const learningGated = !layoutAuthoringMode && learningIntroductionGate(
    learningIntroduction,
    learningIntroductionStatus
  );
  wrapEl.classList.toggle("learning-gated", learningGated);
  puzzleViewEl.classList.toggle("learning-gated", learningGated);
  learningIntroductionEl.closeLesson();
  appNavigation.notePuzzleLoaded();
  browsePuzzlesBtn.disabled = false;
  const savedSession = !layoutAuthoringMode && restoreSession
    ? loadPlayerSession(localStorage, puzzle)
    : null;
  if (!layoutAuthoringMode && !VALID_MODES.includes(urlMode) && savedSession) {
    mode = savedSession.currentMode;
    updateModeControls();
  }
  overviewRenderer.hideOverview();
  currentIndex = index;
  pickerEl.value = index;
  // Remembered so a later root-URL visit with no params can pick up
  // where this visitor left off, instead of always landing on whatever
  // happens to be array index 0 -- see the bootstrap below for why that
  // default stopped making sense once the catalog covers genuinely
  // unrelated subjects (a visitor here for one topic has no reason to
  // want a random other one first). Every path into a puzzle goes
  // through this function, so this is the one place that needs it.
  localStorage.setItem("ccLastPuzzle", puzzle.id);
  trackPuzzleLoad(puzzle.id, mode);
  titleEl.textContent = puzzle.title;
  titlePopoverNode.word = puzzle.title;
  // Normalized, not the raw puzzle.info -- showTermInfo reads
  // n.info.text/.link/.linkLabel/.seeAlso directly (every other node reaching it
  // is pre-normalized by puzzleGraph.js), so a raw "wiki:" shorthand or
  // plain-string info here would render broken (an unresolved wiki:
  // href, or missing text) the moment a puzzle actually authors it that
  // way -- untriggered so far only because no puzzle has authored info
  // yet, not because it was actually handled.
  titlePopoverNode.info = normalizeInfo(puzzle.info);
  largeBadgeEl.classList.toggle("shown", !!puzzle.large);
  lensesBadgeEl.classList.toggle("shown", !!puzzle.lenses?.length);
  overviewRenderer.showPuzzleInfo(puzzle);
  overviewRenderer.showPuzzleCatalogueSuggestion(puzzle);
  overviewRenderer.showPuzzleMeta(puzzle);
  window.__ccSyncStarFreeStripButtons?.();
  applyBoardSize(puzzle);
  factsEl.innerHTML = "";
  relatedPuzzlesEl.innerHTML = "";
  svg.classed("lens-assignment-focus", false);
  lensPanelEl.hidden = true;
  lensAssignmentEl.hidden = true;
  lensAssignmentEl.closeChooser();
  lensAssignmentEl.model = null;
  lensProgressEl.textContent = "";
  lensPromptEl.textContent = "";
  lensResultEl.textContent = "";
  lensExplanationEl.replaceChildren();
  setMessage("Tap a gray term to begin.");
  if (sim) sim.stop();
  // Stop the previous puzzle's own renderer-specific state too (Sets
  // mode's live simulation in particular) before it's replaced below --
  // otherwise switching puzzles (or hitting Start Over) while in Sets
  // mode would leave the old puzzle's simulation ticking in the
  // background against now-detached DOM.
  if (state && state.stopRenderer) state.stopRenderer();
  svg.selectAll("*").remove();

  const { nodes, links, need } = buildNodesAndLinks(puzzle);
  state = {
    puzzle, nodes, links, selected: null, made: 0, need, shownClusters: new Set(),
    // Difficulty-signal tracking for trackPuzzleCompleted.
    incorrectMoveCount: 0,
    startedAt: Date.now(),
    completedViaShowSolution: false,
    hadProgressBeforeShowSolution: false,
    solutionLayout: null,
    prettyPrint: null,
    prettyPrintPromise: null,
    modeSwitchPolishing: false,
    modeSwitchLayoutPromise: null,
    layoutAuthoring: layoutAuthoringMode,
    restoringSession: false,
    learningIntroduction,
    learningIntroductionStatus,
    learningGated,
    phase: "assembling",
    lensMode: normalizedLensMode(puzzle),
    lensIndex: 0,
    lensSelections: new Set(),
    lensQuizSelection: null,
    lensAssignments: new Map(),
    lensAssignmentResult: null,
    lensStartPending: false,
    progressLabel: null,
    persistedMode: VALID_MODES.includes(urlMode)
      ? (savedSession?.currentMode ||
        (VALID_MODES.includes(localStorage.getItem("ccMode")) ? localStorage.getItem("ccMode") : "star"))
      : mode,
    // Every successful connection, in order, as (source, target) node ids
    // — see handleTap's connect branch. This is exactly what a shared
    // "current progress" link encodes (see encodeMoves/decodeMoves
    // below), so it's ok that showSolution's simulated taps append here
    // too: sharing a link right after Show Solution faithfully replays
    // that too, rather than needing a special case.
    moveHistory: []
  };
  countEl.textContent = `0 of ${need} links`;

  buildForMode();
  state.beginLensSequence = beginLensSequence;
  state.openLensAssignment = openLensAssignment;
  state.assignLens = chooseLensForNode;
  state.toggleLensSelection = node => {
    if (state.phase !== "lens-selecting" || !node?.word) return;
    if (state.lensSelections.has(node.word)) state.lensSelections.delete(node.word);
    else state.lensSelections.add(node.word);
    setMessage(
      state.lensSelections.size
        ? `${state.lensSelections.size} ${state.lensSelections.size === 1 ? "concept" : "concepts"} selected.`
        : "Select every concept that fits this lens, then check your selections."
    );
    updateLensInterface();
    persistPlayerSession();
  };
  state.onProgressChanged = () => persistPlayerSession();
  state.onPlayerLayoutChanged = () => schedulePlayerLayoutSave();
  updateModeControls();
  updateSolutionHint();
  updateLearningIntroduction();
  restorePlayerSession(savedSession);
  // preSolve: true is a rare, explicit authoring choice -- not a player
  // action, so it only ever applies to a puzzle with no saved session yet
  // (a returning player's own progress, however partial, is never
  // overridden). Reuses exactly the mechanism &solved links already use
  // (see replayInitialSharedState): showSolution() under restoringSession
  // to suppress the intermediate progress messages a real click would
  // produce, then hand off to whichever lens sequence the puzzle defines.
  if (!savedSession && puzzle.preSolve && state.made !== state.need) {
    state.restoringSession = true;
    try {
      showSolution();
    } finally {
      state.restoringSession = false;
    }
    if (state.lensStartPending) {
      state.lensStartPending = false;
      beginLensSequence();
    }
  }
  if (persistInitial && !savedSession) persistPlayerSession();
  if (layoutAuthoringMode) {
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
  overviewRenderer.renderPuzzleBreadcrumb(puzzle);
  if (focus) titleEl.focus();
}

window.addEventListener("pagehide", () => {
  clearTimeout(playerLayoutSaveTimer);
  persistPlayerSession({ captureLayout: true });
});

// ---------- graph ----------
// buildGraph lives in modules/graphRenderer.js (see the
// createGraphRenderer call above); buildStarGraph lives in
// modules/starRenderer.js (see the createStarRenderer call above).

// ---------- interaction ----------
// handleTap/checkClusterCompletion/showSolution live in
// modules/gameLogic.js (see the createGameEngine call above).

// ---------- set-graph view ----------
// buildSetGraph and its helpers (computeSetLayout, pillClass,
// clusterPos, safePartialOffset, pillBasePosition, pillTarget,
// keepOutsideCircles, bridgeLineSegments, bridgeLineObstructed,
// renderBridgeLines) all live in modules/setRenderer.js (see the
// createSetRenderer call above).

// ---------- test/debug hooks ----------
// A module's top-level scope doesn't leak onto `window` the way the old
// classic <script> did -- this is the one deliberate, documented
// exception, so tests/*.mjs can still read live game state via
// page.evaluate(() => CC.state...) and devtools can poke at it by hand.
// Getters, not a one-time snapshot, since `state`/`mode` are reassigned
// (a fresh object per loadPuzzle call, a new string per setMode call).
// PUZZLES itself is included here for the same reason -- it used to be
// a genuine bare global (puzzles.js was a classic <script>, sharing the
// page's script-scope with every other classic script on it), but now
// that it's imported like everything else, it's just as private to
// this module as `state`/`mode` are, and every tests/*.mjs reference to
// bare `PUZZLES` had to move to `CC.PUZZLES` accordingly.
window.CC = {
  get state() { return state; },
  get mode() { return mode; },
  isDone,
  isBridge,
  handleTap,
  showSolution,
  PUZZLES,
  CATALOGUES,
  SHOWCASE_PUZZLE_IDS,
  categorySlugFor,
  get activeCatalogue() { return appNavigation.getContext().catalogue; },
  get activeViewKind() { return appNavigation.getContext().viewKind; }
};

// Shared moves/solved are intentionally replayed exactly once, after
// the initial route has selected a puzzle. Same-document navigation and
// popstate only call renderCurrentRoute, so Back/Forward cannot replay
// stale one-time state.
function replayInitialSharedState(initialParams) {
  if (!state || (!initialParams.has("solved") && !initialParams.has("moves"))) return;
  if (state.learningGated) {
    pendingInitialSharedParams = new URLSearchParams(initialParams);
    return;
  }
  if (initialParams.has("solved")) {
    state.restoringSession = true;
    try {
      showSolution();
    } finally {
      state.restoringSession = false;
    }
    if (state.lensStartPending) {
      state.lensStartPending = false;
      beginLensSequence();
    }
    persistPlayerSession();
  } else {
    const sharedMoves = decodeMoves(initialParams.get("moves"), state.nodes.length);
    if (sharedMoves) {
      state.restoringSession = true;
      try {
        for (const m of sharedMoves) {
          const source = state.nodes[m.source];
          const target = state.nodes[m.target];
          if (source && target && !isDone(source)) {
            handleTap(source);
            handleTap(target);
          }
        }
      } catch {
        // Corrupt or incompatible move list (e.g. shared from a puzzle
        // that's since been edited) -- leave whatever partial state got
        // reconstructed rather than failing the whole page load over it.
      } finally {
        state.restoringSession = false;
      }
      state.selected = null;
      if (state.lensStartPending) {
        state.lensStartPending = false;
        beginLensSequence();
      } else {
        setMessage(state.made === state.need ? "Concept map complete. Well done." : "Tap a gray term to continue.");
        state.paint();
      }
      persistPlayerSession();
    }
  }
}

appNavigation.renderCurrentRoute({ initial: true });
replayInitialSharedState(pageParams);
