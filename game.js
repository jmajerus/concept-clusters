// ============================================================
// Concept Clusters — game logic
// ------------------------------------------------------------
// Reads PUZZLES (puzzles.js), renders a D3 force-directed graph.
// Mechanic: tap a gray term, then tap a node in the cluster it
// belongs to. Seed pairs are pre-connected as the orienting clue.
// Bridge terms belong to two clusters and need a link into each.
// ============================================================

/* global d3, PUZZLES */

const svg = d3.select("#board");
// Board coordinate space (viewBox units, not CSS px). Large puzzles get
// a bigger space plus the .wrap.wide CSS class, which only actually widens
// the layout on viewports large enough for the extra room to matter.
const BOARD_SIZE = { standard: [640, 460], wide: [960, 620] };
let W, H;
const wrapEl = document.querySelector(".wrap");
const msgEl = document.getElementById("message");
const countEl = document.getElementById("progress");
const factsEl = document.getElementById("facts");
const pickerEl = document.getElementById("puzzle-picker");
const titleEl = document.getElementById("puzzle-title");
const largeBadgeEl = document.getElementById("large-badge");

let sim = null;
let state = null; // { nodes, links, selected, made, need }
let currentIndex = 0;

// ---------- rendering mode ----------
// Two independent rendering/interaction pathways over the same shared
// game state (nodes, links, connected arrays never differ by mode) —
// "traditional" is the original per-term force-directed board,
// "sets" renders clusters as circles containing their terms. The
// player's choice is remembered across visits.
let mode = localStorage.getItem("ccMode") === "sets" ? "sets" : "traditional";
const modeTraditionalBtn = document.getElementById("mode-traditional");
const modeSetsBtn = document.getElementById("mode-sets");
modeTraditionalBtn.setAttribute("aria-pressed", String(mode === "traditional"));
modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));

function setMode(newMode) {
  mode = newMode;
  localStorage.setItem("ccMode", mode);
  modeTraditionalBtn.setAttribute("aria-pressed", String(mode === "traditional"));
  modeSetsBtn.setAttribute("aria-pressed", String(mode === "sets"));
  if (state) {
    // Board size depends on `mode` too (see applyBoardSize), so switching
    // modes mid-game can change W/H — recompute rather than reuse a
    // cached sets-mode layout sized for the board's previous dimensions.
    applyBoardSize(state.puzzle);
    state.setLayout = null;
    // Whichever mode we're switching TO just cleared the whole SVG itself
    // (buildGraph and buildSetGraph are both self-contained about this) —
    // so any previously-created sets-mode layers are now stale DOM
    // references. Force them to be recreated fresh next time sets mode
    // runs, rather than silently rendering into detached elements.
    state.setLayersReady = false;
    (mode === "traditional" ? buildGraph : buildSetGraph)();
  }
}
modeTraditionalBtn.addEventListener("click", () => setMode("traditional"));
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
// showSolution() replays real taps, and state.paint (set below by whichever
// build function is active) is mode-aware — so this single call already
// produces the right result whether the player is in traditional or sets
// mode, with no branching needed here.
document.getElementById("show-solution").addEventListener("click", () => showSolution());

// ---------- helpers ----------
const isBridge = n => n.gs.length === 2;
const isDone = n => n.connected.length === n.gs.length;
const pillWidth = word => word.length * 7.5 + 26;

function setMessage(text, tone) {
  msgEl.textContent = text || "";
  msgEl.dataset.tone = tone || "";
}

function addFactCard(kind, title, fact) {
  const card = document.createElement("div");
  card.className = `fact-card ${kind}`;
  card.innerHTML = `<strong>${title}</strong><span>${fact}</span>`;
  factsEl.appendChild(card);
}

// Sets mode draws containers *and* the terms inside them, so it needs more
// room than the traditional per-term board regardless of whether the
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
  titleEl.textContent = puzzle.title;
  largeBadgeEl.classList.toggle("shown", !!puzzle.large);
  applyBoardSize(puzzle);
  factsEl.innerHTML = "";
  setMessage("Tap a gray term to begin.");
  if (sim) sim.stop();
  svg.selectAll("*").remove();

  // Build nodes: single-cluster terms + bridges
  const nodes = [];
  puzzle.clusters.forEach((c, ci) => {
    c.terms.forEach(term => {
      nodes.push({
        id: nodes.length, word: term, gs: [ci],
        connected: c.seeds.includes(term) ? [ci] : [],
        w: pillWidth(term)
      });
    });
  });
  puzzle.bridges.forEach(b => {
    nodes.push({
      id: nodes.length, word: b.term, gs: b.clusters.slice(),
      connected: [], w: pillWidth(b.term), fact: b.fact, idealTerms: b.idealTerms
    });
  });

  // Seed links (the visible partial clusters)
  const links = [];
  puzzle.clusters.forEach((c, ci) => {
    const seeds = nodes.filter(n => n.gs.length === 1 && n.gs[0] === ci && n.connected.length);
    if (seeds.length === 2) links.push({ source: seeds[0].id, target: seeds[1].id, bridge: false });
  });

  const need = nodes.reduce((sum, n) => sum + (n.gs.length - n.connected.length), 0);
  state = { puzzle, nodes, links, selected: null, made: 0, need };
  countEl.textContent = `0 of ${need} links`;

  (mode === "traditional" ? buildGraph : buildSetGraph)();
}

// ---------- graph ----------
function buildGraph() {
  const { nodes, links, puzzle } = state;
  // Self-contained, like buildSetGraph's own layer setup — this used to
  // rely on loadPuzzle having already cleared the SVG, which was true
  // when it was the only caller, but setMode() now calls buildGraph()
  // directly on a mode switch without clearing first, which left sets
  // mode's circles/pills still in the DOM underneath the new board.
  if (sim) sim.stop();
  svg.selectAll("*").remove();
  const linkLayer = svg.append("g");
  const nodeLayer = svg.append("g");

  // Give each cluster its own anchor point on the board, arranged in a
  // ring. Nodes only get pulled toward their anchor AFTER the player has
  // connected them there (anchorStrength is 0 for anything still free) —
  // the board tidies up as a reward for correct answers already given,
  // never as a spatial hint toward answers not yet given. A bridge with
  // one confirmed side anchors toward that cluster; once both sides are
  // confirmed, it anchors to the midpoint between them.
  const nClusters = puzzle.clusters.length;
  const ringR = Math.min(W, H) * 0.33;
  const anchors = Array.from({ length: nClusters }, (_, i) => {
    const angle = (i / nClusters) * 2 * Math.PI - Math.PI / 2;
    return [W / 2 + ringR * Math.cos(angle), H / 2 + ringR * Math.sin(angle)];
  });
  const anchorOf = d => {
    if (d.gs.length === 2 && d.connected.length === 2) {
      const [a, b] = d.gs.map(i => anchors[i]);
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    }
    if (d.gs.length === 2 && d.connected.length === 1) return anchors[d.connected[0]];
    return anchors[d.gs[0]];
  };
  const anchorStrength = d => d.connected.length > 0 ? 0.25 : 0;

  sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(75).strength(0.8))
    .force("charge", d3.forceManyBody().strength(-240))
    .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14))
    .force("x", d3.forceX(d => anchorOf(d)[0]).strength(anchorStrength))
    .force("y", d3.forceY(d => anchorOf(d)[1]).strength(anchorStrength));

  state.drawLinks = () => {
    linkLayer.selectAll("line").data(links).join("line")
      .attr("class", d => d.bridge ? (d.ideal ? "link bridge-link ideal" : "link bridge-link") : "link");
  };
  state.drawLinks();

  // handleTap calls this right after pushing a new link — this mode needs
  // to redraw the line, hand the new link array to the force simulation,
  // recompute anchor targets/strengths (forceX/Y only recompute those when
  // the accessor is re-set, not on every tick), and nudge the simulation
  // awake again.
  state.onLinkAdded = () => {
    state.drawLinks();
    sim.force("link").links(state.links);
    sim.force("x").x(d => anchorOf(d)[0]).strength(anchorStrength);
    sim.force("y").y(d => anchorOf(d)[1]).strength(anchorStrength);
    sim.alpha(0.6).restart();
  };

  const nodeG = nodeLayer.selectAll("g").data(nodes).join("g")
    .attr("class", "node")
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", d => d.word)
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  nodeG.append("rect")
    .attr("rx", 15).attr("height", 30)
    .attr("width", d => d.w).attr("x", d => -d.w / 2).attr("y", -15);
  nodeG.append("text").attr("dy", 4).text(d => d.word);

  nodeG.on("click", (e, d) => handleTap(d));
  nodeG.on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTap(d); } });

  state.paint = () => {
    nodeG.attr("class", d => {
      if (d === state.selected) return "node selected";
      if (isDone(d)) return isBridge(d) ? "node done bridge" : `node done c-${state.puzzle.clusters[d.gs[0]].color}`;
      if (d.connected.length) return "node partial";
      return "node free";
    });
    countEl.textContent = `${state.made} of ${state.need} links`;
  };
  state.paint();

  sim.on("tick", () => {
    nodes.forEach(n => {
      n.x = Math.max(n.w / 2 + 6, Math.min(W - n.w / 2 - 6, n.x));
      n.y = Math.max(22, Math.min(H - 22, n.y));
    });
    linkLayer.selectAll("line")
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
  });
}

// ---------- interaction ----------
function handleTap(d) {
  const s = state.selected;

  // Tapping a finished node with nothing selected: gentle orientation
  if (isDone(d) && !s) {
    setMessage(isBridge(d)
      ? `"${d.word}" is a bridge — it belongs to two clusters.`
      : "Pick a gray or dashed term first.");
    return;
  }

  // Select / reselect / deselect a free or partially connected node
  if (!isDone(d) && d !== s) {
    state.selected = d;
    setMessage(isBridge(d) && d.connected.length
      ? `"${d.word}" needs one more cluster — tap it.`
      : `Now tap a node in a cluster where "${d.word}" belongs.`);
    state.paint();
    return;
  }
  if (d === s) { state.selected = null; setMessage(""); state.paint(); return; }

  // Attempt a connection: selected free node -> tapped finished node
  if (s && isDone(d)) {
    if (isBridge(d)) { setMessage("Connect to a solid-colored cluster node instead."); return; }
    const gi = d.gs[0];

    if (s.gs.includes(gi) && !s.connected.includes(gi)) {
      s.connected.push(gi);
      state.made++;

      // A bridge's ideal anchor (when the puzzle names one) is never
      // required — any completed node in the right cluster still counts —
      // but landing on it earns a bit of extra praise in the message and
      // a small highlight on the link itself. Marking the target node's
      // own idealHitConfirmed flag (rather than deriving "is this term
      // ideal for some bridge" from static puzzle data) matters in sets
      // mode specifically: a term must only show as an ideal target once
      // its bridge has actually been solved, not the moment it joins its
      // own cluster — otherwise it leaks which bridge it'll matter to
      // before that connection has actually been earned.
      const idealHit = isBridge(s) && s.idealTerms && s.idealTerms[s.gs.indexOf(gi)] === d.word;
      if (idealHit) d.idealHitConfirmed = true;

      state.links.push({ source: s, target: d, bridge: isBridge(s), ideal: idealHit });
      state.onLinkAdded();

      if (isDone(s)) {
        if (isBridge(s)) {
          setMessage(idealHit ? `Bridge complete — and "${d.word}" was exactly the right term to land on.` : "Bridge complete.", "good");
          addFactCard("bridge", `Bridge: ${s.word}`, s.fact);
        } else {
          setMessage(`Connected — "${s.word}" joins the cluster.`, "good");
        }
        checkClusterCompletion();
      } else {
        setMessage(idealHit
          ? `Sharp choice — "${d.word}" is the ideal link here. "${s.word}" still needs its second cluster.`
          : `"${s.word}" is a bridge — it still needs its second cluster.`, "good");
      }
      if (state.made === state.need) setMessage("Concept map complete. Well done.", "good");
    } else if (s.connected.includes(gi)) {
      setMessage(`Already linked there — "${s.word}" needs a different cluster.`);
    } else {
      // Diagnostic, not punitive: point back at the concept
      setMessage(`"${s.word}" belongs somewhere else — think about what those terms share.`);
    }
    state.selected = null;
    state.paint();
  }
}

function checkClusterCompletion() {
  state.puzzle.clusters.forEach((c, ci) => {
    if (c._shown) return;
    const members = state.nodes.filter(n => !isBridge(n) && n.gs[0] === ci);
    if (members.every(isDone)) {
      c._shown = true;
      addFactCard(`c-${c.color}`, `${c.name} — complete`, c.fact);
    }
  });
}

// ---------- show solution ----------
// Fast-forwards to a fully-solved state for sharing/screenshots, by
// replaying the exact same tap-then-tap flow a player would use — so it
// reveals fact cards and settles the layout identically to real play.
// Bridges land on their `idealTerms` where one is defined, falling back
// to a seed otherwise. Anything already connected is left as-is, so
// mid-game progress (even non-ideal bridge connections) isn't undone.
function showSolution() {
  const { puzzle, nodes } = state;
  const findNode = word => nodes.find(n => n.word === word);

  state.selected = null;

  puzzle.clusters.forEach(c => {
    c.terms.forEach(term => {
      const n = findNode(term);
      if (!isDone(n)) {
        handleTap(n);
        handleTap(findNode(c.seeds[0]));
      }
    });
  });

  puzzle.bridges.forEach(b => {
    const n = findNode(b.term);
    b.clusters.forEach((ci, k) => {
      if (!n.connected.includes(ci)) {
        const target = (b.idealTerms && b.idealTerms[k]) || puzzle.clusters[ci].seeds[0];
        handleTap(n);
        handleTap(findNode(target));
      }
    });
  });

  setMessage("Solution shown — every bridge connected to its ideal term where one exists.", "good");
  state.paint();
}

// ---------- set-graph view ----------
// A second, complete rendering/interaction pathway over the exact same
// game state as buildGraph: clusters render as circles containing their
// terms, and bridges render as edges between circle boundaries — never
// crossing into the interior — instead of the traditional board's
// per-term node-link graph. This mode is "tap-only, snap into place":
// no drag, no continuous physics once the puzzle loads, so it only has
// to compute layout once per puzzle rather than keep resettling it.
//
// The one thing the old static-only version never had to solve: WHERE a
// free (not-yet-connected) node sits, and what a half-connected bridge
// looks like. Both matter for fairness, not just looks — a bridge that's
// confirmed on one side must never hint at the other, unconfirmed side,
// the same rule the anchor force in buildGraph already follows.

// Cluster circle sizing + positions, and a stable "free area" scatter
// position for every node that can start (or remain) unconnected. Both
// are computed once per puzzle and cached on state, so repeated repaints
// during play don't reshuffle anything that's already on screen.
function computeSetLayout(puzzle, nodes) {
  const PILL_H = 30, PILL_GAP = 6, HEAD_H = 22, PAD = 16;

  // Free (not-yet-connected) nodes are packed into a reserved strip along
  // the top of the board, left-to-right with simple row wrapping — a
  // deterministic layout that can't fail to converge or leave two pills
  // overlapping, unlike trying to force-simulate an unbounded number of
  // free items into whatever gaps happen to remain around the cluster
  // circles (which measurably failed to fully resolve on busier puzzles).
  // Order is shuffled by a stable hash of each word, not authoring order —
  // otherwise a player who plays many puzzles could learn that earlier
  // list positions tend to belong to earlier clusters.
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const freeNodes = nodes
    .filter(n => !(n.gs.length === 1 && n.connected.length))
    .map(n => ({ id: n.id, w: n.w, word: n.word }))
    .sort((a, b) => hash(a.word) - hash(b.word));

  const STRIP_MARGIN = 16, ROW_GAP = 10;
  const stripInnerWidth = W - STRIP_MARGIN * 2;
  const freePositions = new Map();
  let rowX = 0, rowY = STRIP_MARGIN + PILL_H / 2;
  freeNodes.forEach(n => {
    if (rowX > 0 && rowX + n.w > stripInnerWidth) {
      rowX = 0;
      rowY += PILL_H + ROW_GAP;
    }
    freePositions.set(n.id, { x: STRIP_MARGIN + rowX + n.w / 2, y: rowY });
    rowX += n.w + ROW_GAP;
  });
  const stripHeight = freeNodes.length ? rowY + PILL_H / 2 + STRIP_MARGIN : STRIP_MARGIN;

  // Headings render OUTSIDE the circle (see below), so — unlike an
  // earlier version of this — their text width must NOT count toward the
  // circle's size, or a puzzle with long cluster names gets needlessly
  // oversized circles that then can't help but overlap.
  const clusterBoxes = puzzle.clusters.map(c => {
    const contentW = Math.max(...c.terms.map(pillWidth)) + PAD * 2;
    const contentH = HEAD_H + c.terms.length * (PILL_H + PILL_GAP) - PILL_GAP + PAD * 2;
    return { r: Math.hypot(contentW, contentH) / 2 };
  });

  const csNodes = puzzle.clusters.map((c, i) => ({ id: i, r: clusterBoxes[i].r }));
  const csLinks = puzzle.bridges.map(b => ({ source: b.clusters[0], target: b.clusters[1] }));
  const csSim = d3.forceSimulation(csNodes)
    .force("link", d3.forceLink(csLinks).id(d => d.id).distance(d => d.source.r + d.target.r + 70))
    .force("charge", d3.forceManyBody().strength(-200))
    // Multiple relaxation passes per tick (not the default 1) resolve
    // tight packing — like one oversized circle bridged to three others
    // at once — much more reliably than just running more ticks.
    .force("collide", d3.forceCollide().radius(d => d.r + 16).iterations(4))
    .force("center", d3.forceCenter(W / 2, (H + stripHeight) / 2))
    .stop();
  // Clamping inside the tick loop (not once at the end) matters: applied
  // only after the simulation settles, a clamp can shove an already-
  // separated circle straight into a neighbor with no chance to react.
  // Clamping every tick lets the collide force keep resolving overlaps
  // the clamp itself introduces near the board's edges — including the
  // reserved free-node strip along the top, which circles must clear.
  for (let i = 0; i < 300; i++) {
    csSim.tick();
    csNodes.forEach(n => {
      // Extra margin on the sides/bottom for the heading, which can land
      // anywhere around the circle (see headingPositions below).
      n.x = Math.max(n.r + 24, Math.min(W - n.r - 24, n.x));
      n.y = Math.max(stripHeight + 24 + n.r, Math.min(H - n.r - 24, n.y));
    });
  }

  // Final safety net: an awkward topology — e.g. one oversized circle
  // bridging three others at once, so nothing directly enforces *their*
  // mutual separation — can leave the simulation stuck in a configuration
  // with a real residual overlap, no matter how many ticks it gets or how
  // good the collision parameters are (confirmed by testing: doubling
  // ticks and adding collision sub-iterations left it unchanged). This
  // directly and deterministically resolves any pair still overlapping by
  // pushing both circles apart along their connecting line. Deliberately
  // NOT re-clamping to board bounds between passes here — clamping while
  // still resolving overlaps is what limited the previous version to a
  // partial fix, since a clamp can shove a just-separated circle right
  // back into a neighbor. Overlap gets priority; a final single clamp
  // afterward only nudges things back on-board, and a short second
  // resolve pass (still unclamped) cleans up anything that reopens.
  const resolveOverlaps = passes => {
    for (let pass = 0; pass < passes; pass++) {
      let anyOverlap = false;
      for (let i = 0; i < csNodes.length; i++) {
        for (let j = i + 1; j < csNodes.length; j++) {
          const a = csNodes[i], b = csNodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minDist = a.r + b.r + 30;
          if (dist < minDist) {
            anyOverlap = true;
            const push = (minDist - dist) / 2;
            const ux = dx / dist, uy = dy / dist;
            a.x -= ux * push; a.y -= uy * push;
            b.x += ux * push; b.y += uy * push;
          }
        }
      }
      if (!anyOverlap) return true;
    }
    return false;
  };
  resolveOverlaps(50);
  csNodes.forEach(n => {
    n.x = Math.max(n.r + 24, Math.min(W - n.r - 24, n.x));
    n.y = Math.max(stripHeight + 24 + n.r, Math.min(H - n.r - 24, n.y));
  });
  resolveOverlaps(20);

  // Point each cluster's heading away from its own bridges — a fixed
  // "always north" heading collides with whichever bridge line happens
  // to approach from that side, since a bridge can leave a circle at
  // any angle depending on where its partner cluster landed. Computed
  // here (not per-render) so buildSetGraph reuses these exact positions
  // instead of recomputing (and risking drift from) its own.
  const headingWidth = name => name.length * 8 + 16;
  const bridgeDirs = puzzle.clusters.map(() => []);
  puzzle.bridges.forEach(b => {
    const [i, j] = b.clusters;
    const a = csNodes[i], z = csNodes[j];
    const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
    bridgeDirs[i].push([dx / len, dy / len]);
    bridgeDirs[j].push([-dx / len, -dy / len]);
  });
  const headingPositions = puzzle.clusters.map((c, ci) => {
    const dirs = bridgeDirs[ci];
    let idealHx = 0, idealHy = -1;
    if (dirs.length) {
      const sx = dirs.reduce((s, d) => s + d[0], 0), sy = dirs.reduce((s, d) => s + d[1], 0);
      const len = Math.hypot(sx, sy);
      if (len > 0.1) { idealHx = -sx / len; idealHy = -sy / len; }
    }
    const { x: cx, y: cy, r } = csNodes[ci];
    const halfW = headingWidth(c.name) / 2;
    const dist = r + 12;

    // Only true cardinal directions are candidates, deliberately excluding
    // diagonals. `r` is sized to the content box's half-*diagonal*, so an
    // offset of r+12 along a pure axis is guaranteed to clear the box's
    // near edge — but the same offset along a diagonal only guarantees
    // Euclidean distance from the center, which can still clip the box's
    // corner (confirmed: a diagonal "ideal" direction visually overlapped
    // a cluster's own top term despite passing the radial-distance check).
    // A board-edge clamp on the ideal direction can also pull the heading
    // back toward its own circle, so pick whichever cardinal direction
    // both fits the board and stays closest to the bridge-avoiding ideal,
    // rather than force-fitting a single direction that has no valid spot.
    const candidates = [[0, -1], [0, 1], [1, 0], [-1, 0]];
    let best = null, bestScore = -Infinity;
    for (const [hx, hy] of candidates) {
      const x = cx + hx * dist, y = cy + hy * dist;
      const fits = x >= halfW && x <= W - halfW && y >= stripHeight + 14 && y <= H - 10;
      if (!fits) continue;
      const score = hx * idealHx + hy * idealHy; // higher = closer to the ideal direction
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    // If truly nothing fits (only possible if the board is smaller than
    // the circle itself, which shouldn't happen), fall back to the
    // clamped ideal position rather than leaving it undefined.
    if (!best) {
      best = {
        x: Math.max(halfW, Math.min(W - halfW, cx + idealHx * dist)),
        y: Math.max(stripHeight + 14, Math.min(H - 10, cy + idealHy * dist))
      };
    }
    return { x: best.x, y: best.y, halfW };
  });

  return { clusterBoxes, csNodes, freePositions, headingPositions };
}

function pillClass(n, extra) {
  if (n === state.selected) return "node selected";
  let cls = "node";
  if (isDone(n)) cls += isBridge(n) ? " done bridge" : ` done c-${state.puzzle.clusters[n.gs[0]].color}`;
  else if (n.connected.length) cls += " partial";
  else cls += " free";
  return extra ? `${cls} ${extra}` : cls;
}

// A cluster's circle (and its own docked terms) can be dragged as one
// unit, and any individual pill can also be dragged out on its own —
// "put what they want where." Both need real DOM elements that persist
// across repaints (not destroyed and recreated every time a connection
// changes something) so that (a) CSS can animate a position change
// smoothly via `transition: transform`, and (b) a drag isn't immediately
// wiped out by the next repaint. A dragged pill is stored as an offset
// from its cluster (see pillTarget/pillBasePosition below) rather than
// an absolute point — "sticky note on a poster," not "pulled off the
// poster entirely" — so nudging a term still lets it travel along if its
// cluster is dragged later, instead of leaving it stranded behind.
function clusterPos(ci) {
  return state.dragPos.clusters[ci] || state.setLayout.csNodes[ci];
}

// The position a pill would sit at from the automatic layout alone —
// exactly today's default computation, with no manual dragging involved.
// This doubles as the "attachment point" a manual drag offset (see
// pillTarget) is measured from, which is what makes a dragged term
// still travel with its cluster if the cluster moves later, instead of
// detaching into a fixed absolute position.
function pillBasePosition(n) {
  const { freePositions } = state.setLayout;
  if (n.gs.length === 1) {
    if (!isDone(n)) return freePositions.get(n.id);
    const ci = n.gs[0];
    const c = clusterPos(ci);
    const { r } = state.setLayout.clusterBoxes[ci];
    const ti = state.puzzle.clusters[ci].terms.indexOf(n.word);
    const startY = -r + HEAD_CONST + PAD_CONST - 4;
    return { x: c.x, y: c.y + startY + ti * (PILL_H_CONST + PILL_GAP_CONST) + PILL_H_CONST / 2 };
  }
  // Bridge
  if (n.connected.length === 2) {
    const a = clusterPos(n.gs[0]), z = clusterPos(n.gs[1]);
    const ra = state.setLayout.clusterBoxes[n.gs[0]].r, rz = state.setLayout.clusterBoxes[n.gs[1]].r;
    const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = a.x + ux * ra, y1 = a.y + uy * ra, x2 = z.x - ux * rz, y2 = z.y - uy * rz;
    const bi = state.puzzle.bridges.findIndex(b => b.term === n.word);
    const t = 0.5 + (bi % 2 === 0 ? -0.12 : 0.12);
    return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
  }
  if (n.connected.length === 1) {
    const a = clusterPos(n.connected[0]);
    const r = state.setLayout.clusterBoxes[n.connected[0]].r;
    const free = freePositions.get(n.id) || { x: a.x, y: a.y - r - 40 };
    const dx = free.x - a.x, dy = free.y - a.y, len = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / len) * (r + 20), y: a.y + (dy / len) * (r + 20) };
  }
  return freePositions.get(n.id);
}

// A manual drag is stored as an OFFSET from the base position, not an
// absolute point — "sticky note on a poster," not "pulled off the
// poster entirely." A term you nudged still travels with its cluster
// (or a bridge with its circle(s)) if that moves later; only its
// position *within* that frame of reference is manually adjusted.
// Unconnected/free pills have no cluster to be relative to, so their
// offset is effectively an absolute placement, same as before.
function pillTarget(n) {
  const base = pillBasePosition(n);
  const offset = state.dragPos.pills[n.id];
  return offset ? { x: base.x + offset.dx, y: base.y + offset.dy } : base;
}

// Bridge line endpoints (only rendered once both sides are connected)
// depend on the same live, drag-overridable cluster positions.
function bridgeLineCoords(b) {
  const a = clusterPos(b.clusters[0]), z = clusterPos(b.clusters[1]);
  const ra = state.setLayout.clusterBoxes[b.clusters[0]].r, rz = state.setLayout.clusterBoxes[b.clusters[1]].r;
  const dx = z.x - a.x, dy = z.y - a.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  return { x1: a.x + ux * ra, y1: a.y + uy * ra, x2: z.x - ux * rz, y2: z.y - uy * rz };
}

const PILL_H_CONST = 30, PILL_GAP_CONST = 6, HEAD_CONST = 22, PAD_CONST = 16;

function buildSetGraph() {
  const { puzzle, nodes } = state;
  if (sim) sim.stop();

  if (!state.setLayout) state.setLayout = computeSetLayout(puzzle, nodes);
  if (!state.dragPos) state.dragPos = { clusters: {}, pills: {} };

  // Full clear + persistent layers are set up once per puzzle/mode-entry
  // (loadPuzzle resets state.setLayersReady by creating a fresh `state`;
  // setMode resets it explicitly on a mode switch) — NOT on every repaint,
  // since repaints need to reuse existing elements for both dragging and
  // CSS transform transitions to work.
  if (!state.setLayersReady) {
    svg.selectAll("*").remove();
    state.setLayers = {
      clusterLayer: svg.append("g").attr("class", "set-clusters"),
      lineLayer: svg.append("g").attr("class", "set-lines"),
      pillLayer: svg.append("g").attr("class", "set-pills")
    };
    state.setLayersReady = true;
  }
  const { clusterLayer, lineLayer, pillLayer } = state.setLayers;
  const { clusterBoxes, headingPositions } = state.setLayout;

  // ---- clusters: circle + heading, draggable as one unit ----
  const clusterDrag = d3.drag()
    .subject((e, d) => clusterPos(d.ci))
    .on("start", function () { d3.select(this).raise().classed("dragging", true); })
    .on("drag", (e, d) => {
      state.dragPos.clusters[d.ci] = { x: e.x, y: e.y };
      repositionAll();
    })
    .on("end", function () { d3.select(this).classed("dragging", false); });

  clusterLayer.selectAll("g.set-cluster")
    .data(puzzle.clusters.map((c, ci) => ({ c, ci })), d => d.ci)
    .join(enter => {
      const g = enter.append("g").attr("class", "set-cluster").call(clusterDrag);
      g.append("circle").attr("class", d => `set-circle c-${d.c.color}`).attr("r", d => clusterBoxes[d.ci].r);
      const head = g.append("text").attr("class", "set-heading");
      head.each(function (d) {
        const h = headingPositions[d.ci], c0 = state.setLayout.csNodes[d.ci];
        d3.select(this).attr("data-hx", h.x - c0.x).attr("data-hy", h.y - c0.y + 4);
      });
      return g;
    })
    .each(function (d) {
      const p = clusterPos(d.ci);
      d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
      const head = d3.select(this).select("text.set-heading");
      head.attr("x", head.attr("data-hx")).attr("y", head.attr("data-hy")).text(d.c.name);
    });

  // ---- bridge lines (only once both sides are connected) ----
  lineLayer.selectAll("line.bridge-link")
    .data(puzzle.bridges.filter(b => nodes.find(n => n.word === b.term).connected.length === 2), b => b.term)
    .join(enter => enter.append("line").attr("class", "link bridge-link"))
    .each(function (b) {
      const { x1, y1, x2, y2 } = bridgeLineCoords(b);
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });

  // ---- every pill (free, docked term, or bridge in any state), one flat,
  // keyed layer so a status change reuses the same element and animates
  // via CSS rather than popping into a different position instantly ----
  // Only bridges get individual drag — a regular term is always placed by
  // a deterministic, already non-overlapping algorithm (row-packed in the
  // free strip, or a fixed slot inside its circle, which drags along with
  // that circle as a whole), so there's little to gain from nudging one
  // by hand. A bridge, sitting adjacent to or between circles rather than
  // absorbed into one, is the piece that actually benefits from it.
  // A drag behavior calls preventDefault() on pointerdown (it has to, to
  // suppress the browser's native drag/text-selection) — which, as a side
  // effect, suppresses the browser's own click event afterward entirely,
  // even when there was no actual movement (confirmed: a plain click on a
  // draggable bridge fired pointerdown/mousedown/pointerup but never
  // mouseup or click). So a bridge still needs to be tap-selectable, and
  // that can't rely on the separate .on("click") listener below — instead,
  // track total movement through the gesture and treat anything under a
  // few px as a tap, calling handleTap directly from "end".
  const pillDrag = d3.drag()
    .subject((e, d) => pillTarget(d))
    .on("start", function (e, d) {
      d3.select(this).raise().classed("dragging", true);
      d._dragMoved = 0;
    })
    .on("drag", function (e, d) {
      d._dragMoved += Math.abs(e.dx) + Math.abs(e.dy);
      // Recompute the base fresh each tick (not just at drag start) — if
      // this pill's cluster is itself being carried by an earlier drag,
      // the offset needs to be measured against where the base actually
      // is right now, not a stale value from before.
      const base = pillBasePosition(d);
      state.dragPos.pills[d.id] = { dx: e.x - base.x, dy: e.y - base.y };
      d3.select(this).attr("transform", `translate(${e.x},${e.y})`);
    })
    .on("end", function (e, d) {
      d3.select(this).classed("dragging", false);
      if (d._dragMoved < 4) {
        delete state.dragPos.pills[d.id]; // discard the sub-pixel "offset" from a tap, not a real drag
        handleTap(d);
      }
    });

  pillLayer.selectAll("g.node")
    .data(nodes, n => n.id)
    .join(enter => {
      const g = enter.append("g")
        .attr("class", n => pillClass(n))
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", n => n.word)
        .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTap(d); } });
      // Regular terms: plain click, same as always — nothing else is
      // attached to interfere with it.
      g.filter(n => !isBridge(n)).on("click", (e, d) => handleTap(d));
      // Bridges: the drag behavior's own "end" handler is the ONLY tap
      // path (see pillDrag above) — deliberately not also a separate
      // click listener. Whether the browser's click event still fires
      // once a drag behavior has prevented pointerdown's default turns
      // out to be unreliable (confirmed: it fired in some cases and not
      // others), and handling both double-invokes handleTap — select,
      // then immediately deselect on the same physical click.
      g.filter(n => isBridge(n)).call(pillDrag);
      g.append("rect").attr("rx", 15).attr("height", 30).attr("width", n => n.w).attr("x", n => -n.w / 2).attr("y", -15);
      g.append("text").attr("dy", 4).text(n => n.word);
      return g;
    })
    .each(function (n) {
      const isIdeal = n.gs.length === 1 && n.idealHitConfirmed;
      d3.select(this).attr("class", pillClass(n, isIdeal ? "ideal-target" : ""));
      if (!d3.select(this).classed("dragging")) {
        const p = pillTarget(n);
        d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
      }
    });

  // Recomputes every dependent position (docked pills, bridge lines/pills
  // touching a cluster) after a cluster drag moves it — called on every
  // drag tick, so it needs to be cheap; with a handful of nodes per
  // puzzle this is negligible.
  function repositionAll() {
    clusterLayer.selectAll("g.set-cluster").attr("transform", d => {
      const p = clusterPos(d.ci);
      return `translate(${p.x},${p.y})`;
    });
    lineLayer.selectAll("line.bridge-link").each(function (b) {
      const { x1, y1, x2, y2 } = bridgeLineCoords(b);
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    pillLayer.selectAll("g.node").each(function (n) {
      if (d3.select(this).classed("dragging")) return;
      const p = pillTarget(n);
      d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
    });
  }

  countEl.textContent = `${state.made} of ${state.need} links`;
  state.paint = () => buildSetGraph();
  state.drawLinks = () => {};
  state.onLinkAdded = () => {};
}

// ---------- go ----------
loadPuzzle(0);
