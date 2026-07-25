// ============================================================
// Concept Clusters — game logic
// ------------------------------------------------------------
// Reads PUZZLES (puzzles/index.js), renders a D3 force-directed graph.
// Mechanic: tap a gray term, then tap a node in the cluster it
// belongs to. Seed pairs are pre-connected as the orienting clue.
// Bridge terms belong to two clusters and need a link into each.
// ============================================================

/* global d3 */
import { PUZZLES } from "./puzzles/index.js";
import { CATEGORIES, categorySlugFor } from "./puzzles/categories.js";
import { SHOWCASE_PUZZLE_IDS } from "./puzzles/showcase.js";
import { encodeMoves, decodeMoves } from "./modules/shareLink.js";
import { searchLink, linkLabel, normalizeInfo } from "./modules/termInfo.js";
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
const relatedPuzzlesEl = document.getElementById("related-puzzles");
const pickerEl = document.getElementById("puzzle-picker");
const titleEl = document.getElementById("puzzle-title");
const largeBadgeEl = document.getElementById("large-badge");
const puzzleInfoEl = document.getElementById("puzzle-info");
const showSolutionBtn = document.getElementById("show-solution");
const shareBtn = document.getElementById("share-puzzle");
const shareStatusEl = document.getElementById("share-status");
const puzzleControlsEl = document.getElementById("puzzle-controls");
const browsePuzzlesBtn = document.getElementById("browse-puzzles");
const overviewShareRowEl = document.querySelector(".overview-share");
const puzzleViewEl = document.getElementById("puzzle-view");
const overviewEl = document.getElementById("puzzle-overview");
const overviewTitleEl = document.getElementById("overview-title");
const overviewSubtitleEl = document.getElementById("overview-subtitle");
const overviewListEl = document.getElementById("overview-list");
const overviewShareBtn = document.getElementById("overview-share-btn");
const overviewShareStatusEl = document.getElementById("overview-share-status");

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

function addFactCard(kind, title, fact) {
  const card = document.createElement("div");
  card.className = `fact-card ${kind}`;
  card.innerHTML = `<strong>${title}</strong><span>${fact}</span>`;
  factsEl.appendChild(card);
}

// Renders an optional info blurb (text + a link, same normalizeInfo
// shape as termInfo/cluster info) into `container`, plainly and always
// visible rather than hover-gated -- shared by the puzzle subtitle and
// the overview screen's own subtitle, both single coarse per-view units
// rather than one of many small pills on a crowded board, so a
// permanent line reads better here than a tooltip would. Hides the
// container entirely (not just empty) when there's no info at all,
// rather than a container that renders present but with nothing in it.
// `fallbackSearchWord` is what an absent `link` falls back to searching
// -- the same "every explicitly-info'd entity gets at least a link"
// rule termInfo/cluster info already follow.
function renderInfoLine(container, rawInfo, fallbackSearchWord) {
  container.innerHTML = "";
  const info = normalizeInfo(rawInfo);
  if (!info) { container.classList.remove("shown"); return; }
  if (info.text) {
    const span = document.createElement("span");
    span.textContent = info.text + " ";
    container.appendChild(span);
  }
  const href = info.link || searchLink(fallbackSearchWord);
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = `${linkLabel(href)} ↗`;
  container.appendChild(a);
  if (info.extraLink) {
    container.appendChild(document.createTextNode(" "));
    const a2 = document.createElement("a");
    a2.href = info.extraLink;
    a2.target = "_blank";
    a2.rel = "noopener noreferrer";
    a2.textContent = `${linkLabel(info.extraLink)} ↗`;
    container.appendChild(a2);
  }
  container.classList.add("shown");
}

// Renders one .related-card button per entry into `container` -- shared
// by the completion screen's "Related puzzles" section and the overview
// screen's own list, the two places a "here's a set of puzzles, pick
// one" list appears. `entries` is [{ id, reason? }]; `onPick(index)` is
// called with the chosen puzzle's index into PUZZLES. The "Play ▶"
// badge exists for a recipient with no other context for this screen
// -- a shared &puzzles= link's recipient in particular, who may land
// here with no idea what these buttons even do.
function renderPuzzleCards(container, entries, onPick) {
  container.innerHTML = "";
  entries.forEach(entry => {
    const targetIndex = PUZZLES.findIndex(p => p.id === entry.id);
    // validate.mjs already catches a dangling relatedPuzzles id at
    // authoring time; a &puzzles= share link can't be validated ahead of
    // time the same way, so this is a live-page safety net either way,
    // not the primary check -- silently drop, don't crash the page.
    if (targetIndex === -1) return;
    const target = PUZZLES[targetIndex];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "related-card";
    card.innerHTML = `<span class="card-main"><strong>${target.title}</strong>${entry.reason ? `<span>${entry.reason}</span>` : ""}</span><span class="card-play">Play ▶</span>`;
    card.addEventListener("click", () => onPick(targetIndex));
    container.appendChild(card);
  });
}

// Shown once the whole puzzle is solved -- gameLogic.js calls this from
// the single `state.made === state.need` check in handleTap, the one
// choke point every completion path (live play, Show Solution, and the
// &solved/&moves bootstrap replays, since those all replay real taps
// through handleTap too) already passes through, so this never needs a
// second trigger site. Direct navigation, not just a hint: a related
// puzzle's `reason` already explains why it's worth playing next, so
// making the player then go find it in the picker themselves would just
// be friction this feature exists to remove.
function showRelatedPuzzles(puzzle) {
  relatedPuzzlesEl.innerHTML = "";
  const related = puzzle.relatedPuzzles?.entries || [];
  if (!related.length) return;
  const heading = document.createElement("div");
  heading.className = "related-heading";
  heading.textContent = "Related puzzles";
  relatedPuzzlesEl.appendChild(heading);
  const subtitleEl = document.createElement("div");
  subtitleEl.className = "related-subtitle";
  relatedPuzzlesEl.appendChild(subtitleEl);
  renderInfoLine(subtitleEl, puzzle.relatedPuzzles.info, puzzle.title);
  const listEl = document.createElement("div");
  relatedPuzzlesEl.appendChild(listEl);
  renderPuzzleCards(listEl, related, loadPuzzle);

  // Shares the *set* -- this puzzle plus each of its listed related ones
  // -- as one &puzzles= link, opening the overview screen for whoever
  // receives it rather than dropping them straight into a single puzzle
  // (see showOverview).
  const shareLink = document.createElement("button");
  shareLink.type = "button";
  shareLink.className = "related-share-link";
  shareLink.textContent = "Share these related puzzles";
  const shareStatus = document.createElement("span");
  shareStatus.setAttribute("role", "status");
  shareLink.addEventListener("click", () => {
    const ids = [puzzle.id, ...related.map(r => r.id)];
    const params = new URLSearchParams({ puzzles: ids.join(",") });
    copyLink(`${location.origin}${location.pathname}?${params.toString()}`, shareStatus);
  });
  relatedPuzzlesEl.appendChild(shareLink);
  relatedPuzzlesEl.appendChild(shareStatus);
}

function puzzlesInCategory(category) {
  return PUZZLES.filter(p => p.category === category);
}

// Resolves an incoming ?category= value back to a real category name --
// the encode side (showCategoryOverview's shareParams) always emits
// categorySlugFor(category), but the decode side has to handle two
// cases: a slug (the normal case going forward), matched against every
// category actually in use via the same categorySlugFor an unregistered
// category still gets one automatically; or, for backward compatibility
// with any link already shared before this change, the raw category
// name itself. Neither matching means an unrecognized value, same as
// any other bad param -- falls through to default-landing below, not
// an error. Checked fresh against live PUZZLES each time, not cached,
// so a category added or renamed after a link was shared is picked up
// correctly without needing a page reload of anything but this script.
function resolveCategoryParam(value) {
  if (!value) return null;
  const categoryNames = [...new Set(PUZZLES.map(p => p.category))];
  return categoryNames.find(name => categorySlugFor(name) === value)
    || categoryNames.find(name => name === value)
    || null;
}

// Renders one .related-card button per category name into `container` --
// the top-level browse view's own list, parallel to renderPuzzleCards
// but keyed by category name instead of puzzle id, with a category's own
// `info.text` (puzzles/categories.js) standing in for a puzzle card's
// `reason`. `onPick(name)` is called with the chosen category's name.
// Both card kinds carry a right-aligned label now (see renderPuzzleCards'
// "Play ▶"), so the `.card-count` label here is what tells them apart --
// muted/informational rather than the puzzle card's bold "Play", since a
// click here opens another list, not a puzzle board.
// Hover/focus shows the same #term-info popup a term, a cluster title,
// or the puzzle title does (same showTermInfo path, same automatic
// Search-link fallback) -- now that every category has real authored
// info (puzzles/categories.js), its link is otherwise reachable only
// after already clicking into that category's own overview. A fresh
// node-like object per card, not a single shared one the way the
// puzzle title uses -- these buttons are recreated from scratch on
// every render (container.innerHTML = "" above), so there's no
// persistent element to keep a single object in sync with the way
// loadPuzzle keeps titlePopoverNode in sync.
function renderCategoryCards(container, categoryNames, onPick) {
  container.innerHTML = "";
  categoryNames.forEach(name => {
    const info = normalizeInfo(CATEGORIES[name]?.info);
    const count = puzzlesInCategory(name).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "related-card category-card";
    card.innerHTML = `<span class="card-main"><strong>${name}</strong>${info && info.text ? `<span>${info.text}</span>` : ""}</span><span class="card-count">${count} ${count === 1 ? "puzzle" : "puzzles"} →</span>`;
    card.addEventListener("click", () => onPick(name));
    const hoverNode = { word: name, info };
    card.addEventListener("mouseenter", () => { if (!focusedInfoNode) showTermInfo(hoverNode); });
    card.addEventListener("mouseleave", () => { if (!focusedInfoNode) clearTermInfo(); });
    card.addEventListener("focus", () => focusTermInfo(hoverNode));
    card.addEventListener("blur", () => blurTermInfo(hoverNode));
    container.appendChild(card);
  });
}

// A second top-level view, toggled opposite #puzzle-view -- shown for a
// ?category=/&puzzles= share link (see the bootstrap below) or the
// "Browse puzzles" button, instead of dropping straight into a single
// puzzle the way ?puzzle= does. Modeled on a course's module list, not
// a locked lesson sequence: there's no defined order across a
// category's puzzles (or a relatedPuzzles set, which isn't even
// necessarily reciprocal), so this only ever presents a set to choose
// from, never auto-enters one on the visitor's behalf.
// `shareParams` is whatever the overview's own Share button should
// encode to reproduce this exact view -- stored on the element itself
// (not a module-scope variable) so it's always read fresh at click time;
// null/omitted (the top-level categories list has no single link worth
// sharing) hides that button entirely rather than leaving a dead click.
// `info`/`fallbackSearchWord` feed the same renderInfoLine helper the
// puzzle subtitle uses. `renderList(container)` populates the card list
// -- a puzzle-cards closure for a category's own overview, a
// category-cards closure for the top-level browse view -- since the two
// need different card renderers and click behavior, not just different data.
// Relocates termInfoEl into this view (right below the card list, above
// the Share row) rather than leaving it wherever it last sat in
// #puzzle-view -- a single shared element, since term/cluster-title/
// puzzle-title hover and category-card hover all populate the exact
// same panel, just needs to actually sit inside whichever view is
// currently visible (see the comment above hideOverview's own move).
function showOverview({ title, info, fallbackSearchWord, renderList, shareParams }) {
  puzzleViewEl.classList.add("hidden");
  puzzleControlsEl.classList.add("hidden");
  overviewEl.insertBefore(termInfoEl, overviewShareRowEl);
  overviewTitleEl.textContent = title;
  renderInfoLine(overviewSubtitleEl, info, fallbackSearchWord || title);
  renderList(overviewListEl);
  overviewEl._shareParams = shareParams || null;
  overviewShareRowEl.classList.toggle("hidden", !shareParams);
  overviewEl.classList.add("shown");
}

// A single category's own overview (its puzzles, listed) -- shared by
// the ?category= bootstrap branch and each card in the top-level browse
// view below, rather than duplicating this object literal in both places.
// shareParams encodes categorySlugFor(category), not the raw name --
// see puzzles/categories.js -- so the Share button produces
// ?category=media-information-literacy rather than
// ?category=Media+%26+Information+Literacy.
function showCategoryOverview(category) {
  showOverview({
    title: category,
    info: CATEGORIES[category]?.info,
    renderList: container => renderPuzzleCards(container, puzzlesInCategory(category).map(p => ({ id: p.id })), loadPuzzle),
    shareParams: { category: categorySlugFor(category) }
  });
}

// Every category, not any one puzzle or category in particular -- for a
// visitor who wants to pick a specific *subject* rather than take
// whatever goToDefaultLanding happens to load next. Reached only via
// the "Browse puzzles" button itself, never automatically -- a
// root-URL visit always lands on a live, running puzzle (see the
// arcade-machines framing above goToDefaultLanding), not this
// drill-down list. No shareParams: browsing the whole catalog isn't
// really a "set" worth a dedicated link the way one category or one
// relatedPuzzles group is.
function showCategoriesOverview() {
  const categoryNames = [...new Set(PUZZLES.map(p => p.category))];
  showOverview({
    title: "Browse puzzles",
    renderList: container => renderCategoryCards(container, categoryNames, showCategoryOverview)
  });
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

// Called from loadPuzzle itself, not just the overview's own card clicks
// -- the picker's change handler calls loadPuzzle directly, bypassing
// the overview entirely, so hiding it has to live in the one place every
// path into a puzzle already goes through, not in a wrapper some of
// those paths could skip. Per the earlier design discussion, finishing a
// puzzle reached via the overview hands off to the normal
// completion-screen "Related puzzles" section rather than returning
// here, so this is a one-way door, not a "back" destination to preserve.
// Relocates termInfoEl back to its home in #puzzle-view (between
// #message and #facts, right below the board) -- it was living inside
// #puzzle-overview if the visitor arrived here from an overview screen
// (see showOverview), and simply toggling #puzzle-view's own
// display:none back off wouldn't move an element that isn't inside it
// in the first place.
function hideOverview() {
  overviewEl.classList.remove("shown");
  puzzleViewEl.insertBefore(termInfoEl, factsEl);
  puzzleViewEl.classList.remove("hidden");
  puzzleControlsEl.classList.remove("hidden");
}

overviewShareBtn.addEventListener("click", () => {
  if (!overviewEl._shareParams) return;
  const params = new URLSearchParams(overviewEl._shareParams);
  copyLink(`${location.origin}${location.pathname}?${params.toString()}`, overviewShareStatusEl);
});

// Always available, not gated on a puzzle being loaded -- the whole
// point (see the design discussion this responds to): the old version
// of this button only ever showed the *current* puzzle's own category,
// which meant reaching any category overview required first already
// being inside some specific puzzle, a backwards, bottom-up path for
// what should be top-down navigation. This is additive alongside the
// picker, not a replacement for it -- picking a specific puzzle
// directly is still one click away either way.
browsePuzzlesBtn.addEventListener("click", showCategoriesOverview);

// getState/getMode are accessors, not one-time values, since both
// `state` and `mode` are reassigned after this call (a fresh state
// object per loadPuzzle, a new mode string per setMode) -- the engine
// always needs whatever's current, not a stale snapshot from whenever
// createGameEngine happened to run.
const { handleTap, checkClusterCompletion, showSolution, hasBetterSolution, markIdealFor } = createGameEngine({
  getState: () => state,
  getMode: () => mode,
  isDone, isBridge, showTermInfo, setMessage, addFactCard, trackPuzzleCompleted, showRelatedPuzzles
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
  hideOverview();
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
  // n.info.text/.link/.extraLink directly (every other node reaching it
  // is pre-normalized by puzzleGraph.js), so a raw "wiki:" shorthand or
  // plain-string info here would render broken (an unresolved wiki:
  // href, or missing text) the moment a puzzle actually authors it that
  // way -- untriggered so far only because no puzzle has authored info
  // yet, not because it was actually handled.
  titlePopoverNode.info = normalizeInfo(puzzle.info);
  largeBadgeEl.classList.toggle("shown", !!puzzle.large);
  renderInfoLine(puzzleInfoEl, puzzle.info, puzzle.title);
  applyBoardSize(puzzle);
  factsEl.innerHTML = "";
  relatedPuzzlesEl.innerHTML = "";
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
  SHOWCASE_PUZZLE_IDS,
  categorySlugFor
};

// ---------- go ----------
const initialParams = new URLSearchParams(location.search);
const sharedPuzzleId = initialParams.get("puzzle");
const sharedCategory = resolveCategoryParam(initialParams.get("category"));
const sharedPuzzlesList = initialParams.get("puzzles");

// An explicit ?puzzle= always wins -- most specific intent, and it's
// what keeps every existing single-puzzle share link (&solved/&moves
// replay, &mode= override, below) working exactly as before. Only when
// there's no single puzzle named does either group param get a chance
// to show an overview; an invalid or empty group (unknown category, no
// valid ids) falls through to the same default-landing logic an
// unrecognized/absent ?puzzle= does (see goToDefaultLanding below).
const groupCategoryPuzzles = sharedCategory ? puzzlesInCategory(sharedCategory) : [];
const groupPuzzleIds = sharedPuzzlesList
  ? sharedPuzzlesList.split(",").map(s => s.trim()).filter(id => PUZZLES.some(p => p.id === id))
  : [];

if (!sharedPuzzleId && groupCategoryPuzzles.length) {
  showCategoryOverview(sharedCategory);
} else if (!sharedPuzzleId && groupPuzzleIds.length) {
  // The first id is always the "anchor" puzzle -- the one whose own
  // relatedPuzzles.info (if any) describes the set as a whole -- by
  // construction of the only two things that ever produce a &puzzles=
  // link: the completion screen's "Share these related puzzles" (built
  // as [justFinishedPuzzle.id, ...related ids]) and the overview's own
  // Share button (which just re-encodes whatever it's currently
  // showing, preserving this property transitively).
  const anchorPuzzle = PUZZLES.find(p => p.id === groupPuzzleIds[0]);
  showOverview({
    title: "Related puzzles",
    info: anchorPuzzle?.relatedPuzzles?.info,
    fallbackSearchWord: anchorPuzzle?.title,
    renderList: container => renderPuzzleCards(container, groupPuzzleIds.map(id => ({ id })), loadPuzzle),
    shareParams: { puzzles: groupPuzzleIds.join(",") }
  });
} else {
  const sharedIndex = sharedPuzzleId ? PUZZLES.findIndex(p => p.id === sharedPuzzleId) : -1;
  if (sharedIndex >= 0) {
    loadPuzzle(sharedIndex);
  } else {
    // No explicit puzzle at all, or a stale/typo'd id -- goToDefaultLanding
    // picks this visitor's next puzzle (a remembered puzzle's related
    // entry, or a random one) rather than always landing on whatever
    // happens to be array index 0 (see the design discussion above
    // goToDefaultLanding).
    goToDefaultLanding();
  }

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
}
