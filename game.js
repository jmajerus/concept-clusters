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
const W = 640, H = 460;
const msgEl = document.getElementById("message");
const countEl = document.getElementById("progress");
const factsEl = document.getElementById("facts");
const pickerEl = document.getElementById("puzzle-picker");
const titleEl = document.getElementById("puzzle-title");

let sim = null;
let state = null; // { nodes, links, selected, made, need }

// ---------- setup: puzzle picker ----------
// Puzzles are grouped into <optgroup> sections by category, in the
// order each category first appears — same-category puzzles don't
// need to be adjacent in PUZZLES for this to group them correctly.
const pickerGroups = new Map();
PUZZLES.forEach((p, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = p.title;
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
document.getElementById("reset").addEventListener("click", () => loadPuzzle(+pickerEl.value));

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

// ---------- load / reset ----------
function loadPuzzle(index) {
  const puzzle = PUZZLES[index];
  titleEl.textContent = puzzle.title;
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
      connected: [], w: pillWidth(b.term), fact: b.fact
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

  buildGraph();
}

// ---------- graph ----------
function buildGraph() {
  const { nodes, links } = state;
  const linkLayer = svg.append("g");
  const nodeLayer = svg.append("g");

  sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(75).strength(0.8))
    .force("charge", d3.forceManyBody().strength(-240))
    .force("center", d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide().radius(d => d.w / 2 + 14))
    .force("x", d3.forceX(W / 2).strength(0.05))
    .force("y", d3.forceY(H / 2).strength(0.07));

  state.drawLinks = () => {
    linkLayer.selectAll("line").data(links).join("line")
      .attr("class", d => d.bridge ? "link bridge-link" : "link");
  };
  state.drawLinks();

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
      state.links.push({ source: s, target: d, bridge: isBridge(s) });
      state.drawLinks();
      sim.force("link").links(state.links);
      sim.alpha(0.6).restart();

      if (isDone(s)) {
        if (isBridge(s)) {
          setMessage("Bridge complete.", "good");
          addFactCard("bridge", `Bridge: ${s.word}`, s.fact);
        } else {
          setMessage(`Connected — "${s.word}" joins the cluster.`, "good");
        }
        checkClusterCompletion();
      } else {
        setMessage(`"${s.word}" is a bridge — it still needs its second cluster.`, "good");
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

// ---------- go ----------
loadPuzzle(0);
