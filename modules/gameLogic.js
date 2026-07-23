// The gameplay rules engine: interpreting a tap, connecting a term to
// its cluster, detecting cluster/puzzle completion, and fast-forwarding
// to the ideal solution. Mirrors the factory convention from the
// author's other project, Letter Punk (public/modules/gameLogic.js's
// createGameEngine) -- dependencies are passed in explicitly rather
// than closed over as module-scope globals, since `state` and `mode`
// are reassigned (a fresh object per loadPuzzle call, a new string per
// setMode call) and this module has no DOM elements of its own to
// anchor a stable closure to the way game.js itself does.
//
// Two rendering modes (Graph, Sets) each need to react to a connection
// being made differently, but this module has no idea which one is
// active -- it only ever calls hooks the active renderer has already
// set on `state` itself (state.paint/drawLinks/onLinkAdded, plus
// state.captureManualOffset/reconcileManualOffset for Sets mode's
// manual-drag-position preservation). See buildGraph/buildSetGraph in
// game.js for what each hook actually does.
export function createGameEngine({
  getState, getMode, isDone, isBridge, showTermInfo, setMessage, addFactCard, trackPuzzleCompleted
}) {
  // Records that `node` is the ideal landing term for `bridgeWord`. Stored
  // as a list (not a boolean) because two different bridges can both name
  // the same cluster's term as ideal, or — the case that actually motivated
  // this — two different bridges can each have their own, different ideal
  // term in the same cluster; the caption this drives is what tells them
  // apart, since both would otherwise render as an identical purple highlight.
  function markIdealFor(node, bridgeWord) {
    node.idealFor = node.idealFor || [];
    if (!node.idealFor.includes(bridgeWord)) node.idealFor.push(bridgeWord);
  }

  // True once any bridge is fully connected but landed on a valid,
  // non-ideal term where an ideal one was defined — the signal Show
  // Solution now has more to offer than a rearrangement. Deliberately not
  // surfaced anywhere on the board itself (no per-bridge "wrong" marker) —
  // only as a quiet highlight on the button, since idealTerms are meant as
  // praise-when-earned, never a correction of a valid choice.
  function hasBetterSolution() {
    const state = getState();
    return state.puzzle.bridges.some(b => {
      const n = state.nodes.find(x => x.word === b.term);
      return b.clusters.some((ci, k) => {
        const ideal = b.idealTerms && b.idealTerms[k];
        if (!ideal || !n.connected.includes(ci)) return false;
        const link = state.links.find(l => l.source === n && l.target.gs[0] === ci);
        return link && !link.ideal;
      });
    });
  }

  function handleTap(d) {
    const state = getState();
    const s = state.selected;
    // A tap always surfaces a node's info as a side effect, regardless of
    // what else the tap does — the only way this reaches touch devices,
    // which have no hover state. Deliberately unconditional (not gated by
    // which branch below fires) so it works the same whether the tap
    // selects, connects, or just orients on an already-finished node.
    showTermInfo(d);

    // Tapping a finished node with nothing selected: plain orientation
    // about the node itself — not an instruction ("pick a gray term
    // instead"), which presumes the tap was a failed attempt at more
    // progress when tapping a done node to check its info is just as
    // likely, especially once the puzzle is solved and nothing else is
    // even possible. A statement of fact about the tapped node is true
    // and useful regardless of why it was tapped or how much of the
    // puzzle remains, which also means it never goes stale sitting in
    // #message the way a leftover reply to a *different* node would.
    if (isDone(d) && !s) {
      setMessage(isBridge(d)
        ? `"${d.word}" is a bridge — it belongs to two clusters.`
        : `"${d.word}" belongs to the ${state.puzzle.clusters[d.gs[0]].name} cluster.`);
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
        // Sets mode may need to preserve a manually-dragged bridge's
        // on-screen position across this connection (its base-position
        // formula changes with connection count) -- see the
        // captureManualOffset/reconcileManualOffset hooks (set in
        // buildGraph/buildSetGraph) for why this goes through a hook
        // rather than a direct, mode-specific call from here.
        const preservedOffset = state.captureManualOffset(s);

        s.connected.push(gi);
        state.made++;
        state.moveHistory.push({ source: s.id, target: d.id });

        // A bridge's ideal anchor (when the puzzle names one) is never
        // required — any completed node in the right cluster still counts —
        // but landing on it earns a bit of extra praise in the message and
        // a small highlight on the link itself. Marking the target node's
        // own idealFor flag (rather than deriving "is this term
        // ideal for some bridge" from static puzzle data) matters in sets
        // mode specifically: a term must only show as an ideal target once
        // its bridge has actually been solved, not the moment it joins its
        // own cluster — otherwise it leaks which bridge it'll matter to
        // before that connection has actually been earned.
        const idealHit = isBridge(s) && s.idealTerms && s.idealTerms[s.gs.indexOf(gi)] === d.word;
        if (idealHit) markIdealFor(d, s.word);

        state.links.push({ source: s, target: d, bridge: isBridge(s), ideal: idealHit });
        state.onLinkAdded();
        state.reconcileManualOffset(s, preservedOffset);

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
        if (state.made === state.need) {
          setMessage("Concept map complete. Well done.", "good");
          trackPuzzleCompleted(state.puzzle.id, getMode(), state);
        }
      } else if (s.connected.includes(gi)) {
        setMessage(`Already linked there — "${s.word}" needs a different cluster.`);
      } else {
        // A genuine wrong guess — gi isn't one of s's valid clusters at
        // all, unlike the "already linked there" case above, which is
        // just a redundant re-tap of an already-correct choice. Only this
        // branch reflects the player actually misjudging where a term
        // belongs, so it's the one that counts toward the difficulty
        // signal in trackPuzzleCompleted.
        state.incorrectMoveCount++;
        // Diagnostic, not punitive: point back at the concept
        setMessage(`"${s.word}" belongs somewhere else — think about what those terms share.`);
      }
      state.selected = null;
      state.paint();
    }
  }

  function checkClusterCompletion() {
    const state = getState();
    state.puzzle.clusters.forEach((c, ci) => {
      if (state.shownClusters.has(ci)) return;
      const members = state.nodes.filter(n => !isBridge(n) && n.gs[0] === ci);
      if (members.every(isDone)) {
        state.shownClusters.add(ci);
        addFactCard(`c-${c.color}`, `${c.name} — complete`, c.fact);
      }
    });
  }

  // ---------- show solution ----------
  // Fast-forwards to the actual ideal solution for sharing/screenshots —
  // its job is to show the optimum, not merely to fill in whatever gaps
  // remain. Bridges land on their `idealTerms` where one is defined,
  // falling back to a seed otherwise. A bridge already connected to a
  // valid-but-non-ideal term gets rewired to its ideal term, exactly as if
  // the player had connected it there directly — nothing about the display
  // is left in a suboptimal state. Cluster terms the player already placed
  // correctly are left alone (there's only ever one right cluster for
  // those, so nothing to optimize).
  function showSolution() {
    const state = getState();
    const { puzzle, nodes } = state;
    const findNode = word => nodes.find(n => n.word === word);

    // Captured before the simulated taps below change state.made — this
    // is what distinguishes "clicked Show Solution cold, out of
    // curiosity" from "tried, got stuck, gave up", for trackPuzzleCompleted.
    state.completedViaShowSolution = true;
    state.hadProgressBeforeShowSolution = state.made > 0;

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
        const ideal = b.idealTerms && b.idealTerms[k];
        if (!n.connected.includes(ci)) {
          const target = ideal || puzzle.clusters[ci].seeds[0];
          handleTap(n);
          handleTap(findNode(target));
        } else if (ideal) {
          const link = state.links.find(l => l.source === n && l.target.gs[0] === ci);
          if (link && !link.ideal) {
            link.target = findNode(ideal);
            link.ideal = true;
            markIdealFor(findNode(ideal), n.word);
          }
        }
      });
    });

    state.onLinkAdded();
    setMessage("Solution shown — every bridge connected to its ideal term where one exists.", "good");
    state.paint();
  }

  return { handleTap, checkClusterCompletion, showSolution, hasBetterSolution, markIdealFor };
}
