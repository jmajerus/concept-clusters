// ============================================================
// Concept Clusters — game logic
// ------------------------------------------------------------
// Reads PUZZLES (puzzles.js), renders a D3 force-directed graph.
// Mechanic: tap a gray term, then tap a node in the cluster it
// belongs to. Seed pairs are pre-connected as the orienting clue.
// Bridge terms belong to two clusters and need a link into each.
// ============================================================

/* global d3, PUZZLES */
import { encodeMoves, decodeMoves } from "./modules/shareLink.js";
import { searchLink, linkLabel } from "./modules/termInfo.js";
import { trackPuzzleLoad, trackPuzzleCompleted } from "./modules/analyticsClient.js";
import { buildNodesAndLinks } from "./modules/puzzleGraph.js";
import { createGameEngine } from "./modules/gameLogic.js";
import { createGraphRenderer } from "./modules/graphRenderer.js";
import { createStarRenderer } from "./modules/starRenderer.js";
import { createSetRenderer } from "./modules/setRenderer.js";

const svg = d3.select("#board");
// Board coordinate space (viewBox units, not CSS px). Large puzzles get
// a bigger space plus the .wrap.wide CSS class, which only actually widens
// the layout on viewports large enough for the extra room to matter.
const BOARD_SIZE = { standard: [640, 460], wide: [960, 620] };
let W, H;
const wrapEl = document.querySelector(".wrap");
const msgEl = document.getElementById("message");
const termInfoEl = document.getElementById("term-info");
const countEl = document.getElementById("progress");
const factsEl = document.getElementById("facts");
const pickerEl = document.getElementById("puzzle-picker");
const titleEl = document.getElementById("puzzle-title");
const largeBadgeEl = document.getElementById("large-badge");
const showSolutionBtn = document.getElementById("show-solution");
const shareBtn = document.getElementById("share-puzzle");
const shareStatusEl = document.getElementById("share-status");

let sim = null;
let state = null; // { nodes, links, selected, made, need }
let currentIndex = 0;

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
// "graph" unaffected, no migration needed.
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
const urlMode = new URLSearchParams(location.search).get("mode");
let mode = VALID_MODES.includes(urlMode)
  ? urlMode
  : (VALID_MODES.includes(localStorage.getItem("ccMode")) ? localStorage.getItem("ccMode") : "graph");
const modeGraphBtn = document.getElementById("mode-graph");
const modeStarBtn = document.getElementById("mode-star");
const modeSetsBtn = document.getElementById("mode-sets");
const dragHintEl = document.getElementById("drag-hint");
modeGraphBtn.setAttribute("aria-pressed", String(mode === "graph"));
modeStarBtn.setAttribute("aria-pressed", String(mode === "star"));
modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));

// What's draggable genuinely differs by mode — every node in Graph and
// Star modes, but only circles and bridge pills in Sets (a docked term
// travels with its circle, not on its own).
function updateDragHint() {
  dragHintEl.textContent = mode === "sets"
    ? "Drag a circle or a bridge to rearrange the layout."
    : "Drag any node to untangle the graph.";
}
updateDragHint();

function setMode(newMode) {
  mode = newMode;
  localStorage.setItem("ccMode", mode);
  modeGraphBtn.setAttribute("aria-pressed", String(mode === "graph"));
  modeStarBtn.setAttribute("aria-pressed", String(mode === "star"));
  modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));
  updateDragHint();
  if (state) {
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
    // Whichever mode we're switching TO just cleared the whole SVG itself
    // (buildGraph/buildStarGraph/buildSetGraph are all self-contained
    // about this) — so any previously-created sets-mode layers are now
    // stale DOM references. Force them to be recreated fresh next time
    // sets mode runs, rather than silently rendering into detached
    // elements.
    state.setLayersReady = false;
    buildForMode();
  }
}
modeGraphBtn.addEventListener("click", () => setMode("graph"));
modeStarBtn.addEventListener("click", () => setMode("star"));
modeSetsBtn.addEventListener("click", () => setMode("sets"));

// ---------- setup: puzzle picker ----------
// Puzzles are grouped into <optgroup> sections by category, in the order
// each category first appears — same-category puzzles don't need to be
// adjacent in PUZZLES for this to group them correctly. Puzzles flagged
// `large` get a suffix in their option text (the board itself gets more
// room for them — see loadPuzzle). This is purely a node-count/board-size
// signal, not a claim about conceptual difficulty.
const pickerGroups = new Map();
PUZZLES.forEach((p, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = p.large ? `${p.title} (Large)` : p.title;
  let group = pickerGroups.get(p.category);
  if (!group) {
    group = document.createElement("optgroup");
    group.label = p.category;
    pickerGroups.set(p.category, group);
    pickerEl.appendChild(group);
  }
  group.appendChild(opt);
});

pickerEl.addEventListener("change", () => loadPuzzle(+pickerEl.value));
document.getElementById("reset").addEventListener("click", () => loadPuzzle(currentIndex));

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
let shareStatusTimer = null;
shareBtn.addEventListener("click", async () => {
  const params = new URLSearchParams({ puzzle: state.puzzle.id });
  if (state.made === state.need) {
    params.set("solved", "1");
  } else if (state.moveHistory.length) {
    params.set("moves", encodeMoves(state.moveHistory));
  }
  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  clearTimeout(shareStatusTimer);
  try {
    await navigator.clipboard.writeText(url);
    shareStatusEl.textContent = "Link copied!";
  } catch {
    shareStatusEl.textContent = url;
  }
  shareStatusTimer = setTimeout(() => { shareStatusEl.textContent = ""; }, 4000);
});
// showSolution() replays real taps, and state.paint (set below by whichever
// build function is active) is mode-aware — so this single call already
// produces the right result whether the player is in graph or sets
// mode, with no branching needed here.
showSolutionBtn.addEventListener("click", () => showSolution());

// ---------- helpers ----------
const isBridge = n => n.gs.length === 2;
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
  showSolutionBtn.classList.toggle("has-better", hasBetterSolution());
}

function setMessage(text, tone) {
  msgEl.textContent = text || "";
  msgEl.dataset.tone = tone || "";
}

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
// Every node gets at least a Search link, authored termInfo or not —
// text and link used to be bundled as one all-or-nothing unit, so a
// term nobody had gotten around to writing a definition for showed
// literally nothing on hover, even though a free, zero-authoring-effort
// search link was one line away the whole time. The info-dot marks
// nodes with hand-written text specifically (see the filter at its
// definition) — not just any termInfo entry, since a link-only override
// with no note shouldn't visually stand out from a plain auto-search node.
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
  inner.append(info.text ? `${n.word}: ${info.text} ` : `${n.word} `);
  const hrefs = [info.link || searchLink(n.word)];
  if (info.extraLink) hrefs.push(info.extraLink);
  hrefs.forEach(href => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${linkLabel(href)} ↗`;
    inner.append(a, " ");
  });
  termInfoEl.append(inner);
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

function addFactCard(kind, title, fact) {
  const card = document.createElement("div");
  card.className = `fact-card ${kind}`;
  card.innerHTML = `<strong>${title}</strong><span>${fact}</span>`;
  factsEl.appendChild(card);
}

// getState/getMode are accessors, not one-time values, since both
// `state` and `mode` are reassigned after this call (a fresh state
// object per loadPuzzle, a new mode string per setMode) -- the engine
// always needs whatever's current, not a stale snapshot from whenever
// createGameEngine happened to run.
const { handleTap, checkClusterCompletion, showSolution, hasBetterSolution, markIdealFor } = createGameEngine({
  getState: () => state,
  getMode: () => mode,
  isDone, isBridge, showTermInfo, setMessage, addFactCard, trackPuzzleCompleted
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
  updateSolutionHint, countEl
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
  updateSolutionHint, countEl
});

// Single dispatch point for "build whatever the current `mode` is",
// used by both loadPuzzle and setMode rather than repeating the same
// three-way branch in each.
function buildForMode() {
  (mode === "graph" ? buildGraph : mode === "star" ? buildStarGraph : buildSetGraph)();
}

// Sets mode draws containers *and* the terms inside them, so it needs more
// room than Graph mode's per-term board regardless of whether the
// puzzle itself is flagged `large` — the two are different reasons to
// want space, not the same one. The `wide` class only actually widens the
// layout when the viewport has room for it (max-width is a ceiling) —
// measure rather than assume, so a small screen falls back to the
// standard coordinate space instead of rendering things at a cramped scale.
function applyBoardSize(puzzle) {
  const wantsWide = puzzle.large || mode === "sets";
  wrapEl.classList.toggle("wide", wantsWide);
  const gotWideRoom = wantsWide && wrapEl.getBoundingClientRect().width >= 900;
  [W, H] = gotWideRoom ? BOARD_SIZE.wide : BOARD_SIZE.standard;
  svg.attr("viewBox", `0 0 ${W} ${H}`);
}

// ---------- load / reset ----------
function loadPuzzle(index) {
  const puzzle = PUZZLES[index];
  currentIndex = index;
  pickerEl.value = index;
  trackPuzzleLoad(puzzle.id, mode);
  titleEl.textContent = puzzle.title;
  largeBadgeEl.classList.toggle("shown", !!puzzle.large);
  applyBoardSize(puzzle);
  factsEl.innerHTML = "";
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
}

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
window.CC = {
  get state() { return state; },
  get mode() { return mode; },
  isDone,
  isBridge,
  handleTap,
  showSolution
};

// ---------- go ----------
const initialParams = new URLSearchParams(location.search);
const sharedPuzzleId = initialParams.get("puzzle");
const sharedIndex = sharedPuzzleId ? PUZZLES.findIndex(p => p.id === sharedPuzzleId) : -1;
loadPuzzle(sharedIndex >= 0 ? sharedIndex : 0);

// Replaying shared progress is a one-time bootstrap step, deliberately
// not folded into loadPuzzle itself — Start Over and the puzzle picker
// both call loadPuzzle too, and neither should ever re-apply a URL's
// moves/solved state after the player has started fresh or switched
// puzzles. &solved takes priority over &moves (our own Share button
// only ever sets one or the other, but if both were somehow present,
// "solved" is the simpler, more robust intent).
if (initialParams.has("solved")) {
  showSolution();
} else {
  const sharedMoves = decodeMoves(initialParams.get("moves"), state.nodes.length);
  if (sharedMoves) {
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
    }
    state.selected = null;
    setMessage(state.made === state.need ? "Concept map complete. Well done." : "Tap a gray term to continue.");
    state.paint();
  }
}
