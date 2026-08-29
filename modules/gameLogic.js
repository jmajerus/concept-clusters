// The gameplay rules engine: interpreting a tap, connecting a term to
// its cluster, detecting cluster/puzzle completion, and fast-forwarding
// to the canonical authored solution. Mirrors the factory convention from the
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
import { RELATION_KINDS } from "./puzzleGraph.js";
import { bridgeDirectionText } from "./bridgeDirection.js";

export function createGameEngine({
  getState, getMode, isDone, isBridge, showTermInfo, setMessage, addFactCard, trackPuzzleCompleted,
  showRelatedPuzzles
}) {
  // Arity-neutral progress phrasing for a partially-connected bridge --
  // "1 of 2 clusters connected; 1 remains" reads identically whether the
  // bridge is an ordinary binary one or the ternary pilot, so this is the
  // one place that needs to know N rather than assume 2.
  function bridgeProgressText(node) {
    const remaining = node.gs.length - node.connected.length;
    return `${node.connected.length} of ${node.gs.length} clusters connected; `
      + `${remaining} ${remaining === 1 ? "remains" : "remain"}`;
  }

  // A tap on any finished member selects its cluster; it does not get to
  // rewrite the authored graph. A bridge side with an ideal term resolves to
  // that canonical node as soon as the node itself has been placed. Until
  // then it uses the cluster's first seed as a deterministic, already-visible
  // proxy, avoiding both a spoiler and a player-authored endpoint.
  function bridgeEndpoint(state, bridge, clusterIndex, tappedNode) {
    const side = bridge.gs.indexOf(clusterIndex);
    const word = bridge.idealTerms && bridge.idealTerms[side];
    const canonicalTarget = word
      ? state.nodes.find(node => node.word === word)
      : null;
    const clusterSeed = state.nodes.find(node =>
      node.gs.length === 1 &&
      node.gs[0] === clusterIndex &&
      node.word === state.puzzle.clusters[clusterIndex].seeds[0]
    );
    return {
      canonicalTarget,
      initialTarget: canonicalTarget && isDone(canonicalTarget)
        ? tappedNode
        : (clusterSeed || tappedNode)
    };
  }

  // Promote every now-available canonical endpoint in one pass. The
  // renderer sees the proxy endpoint first, then the target mutation with a
  // short-lived class that animates the line and pulses the authored node.
  // Session replay and Show Solution skip the flourish but commit the same
  // state.
  function resolveCanonicalBridgeLinks(state) {
    const resolutions = state.links.flatMap(link => {
      if (!link.bridge || link.ideal || !link.canonicalTarget ||
          !isDone(link.canonicalTarget)) return [];
      return [{ link, target: link.canonicalTarget }];
    });
    if (!resolutions.length) return;

    const animate = !state.restoringSession && !state.completedViaShowSolution &&
      !(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    if (animate) state.prepareCanonicalResolution?.(resolutions);
    resolutions.forEach(({ link, target }) => {
      link.target = target;
      link.ideal = true;
      link.canonicalResolving = animate;
      target.canonicalArriving = animate;
    });
    state.onLinkAdded();
    state.paint();

    if (animate) {
      const resolvedState = state;
      globalThis.setTimeout(() => {
        if (getState() !== resolvedState) return;
        resolutions.forEach(({ link, target }) => {
          link.canonicalResolving = false;
          target.canonicalArriving = false;
        });
        state.drawLinks();
        state.paint();
      }, 240);
    }
  }

  function canonicalBridgeHit(bridge, clusterIndex, tappedNode) {
    const side = bridge.gs.indexOf(clusterIndex);
    return !!(bridge.idealTerms && bridge.idealTerms[side] === tappedNode.word);
  }

  function canonicalHistoryTarget(state, source, clusterIndex, tappedNode) {
    if (!isBridge(source)) return tappedNode;
    return state.nodes.find(node =>
      node.gs.length === 1 &&
      node.gs[0] === clusterIndex &&
      node.word === state.puzzle.clusters[clusterIndex].seeds[0]
    ) || tappedNode;
  }

  function canonicalBridgeLink(state, bridge, clusterIndex, tappedNode) {
    const endpoint = bridgeEndpoint(state, bridge, clusterIndex, tappedNode);
    return {
      source: bridge,
      target: endpoint.initialTarget,
      clusterIndex,
      bridge: true,
      ideal: false,
      canonicalTarget: endpoint.canonicalTarget
    };
  }

  function ordinaryLink(source, target, clusterIndex) {
    return {
      source,
      target,
      clusterIndex,
      bridge: false,
      ideal: false,
      canonicalTarget: null
    };
  }

  function addCanonicalLink(state, source, target, clusterIndex) {
    state.links.push(isBridge(source)
      ? canonicalBridgeLink(state, source, clusterIndex, target)
      : ordinaryLink(source, target, clusterIndex));
  }

  function handleTap(d) {
    const state = getState();
    if (state.phase === "lens-assigning") {
      if (!state.openLensAssignment?.(d)) showTermInfo(d);
      return;
    }
    if (state.phase === "lens-selecting") {
      state.toggleLensSelection?.(d);
      return;
    }
    if (state.phase?.startsWith("lens-")) return;
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
        ? `"${d.word}" is a bridge — it belongs to ${d.gs.length} clusters.`
        : `"${d.word}" belongs to the ${state.puzzle.clusters[d.gs[0]].name} cluster.`);
      return;
    }

    // Select / reselect / deselect a free or partially connected node
    if (!isDone(d) && d !== s) {
      state.selected = d;
      setMessage(isBridge(d) && d.connected.length
        ? `"${d.word}" is a bridge — ${bridgeProgressText(d)}.`
        : `Now tap a node in a cluster where "${d.word}" belongs.`);
      state.paint();
      return;
    }
    if (d === s) { state.selected = null; setMessage(""); state.paint(); return; }

    // Attempt a connection: selected free node -> tapped finished node
    if (s && isDone(d)) {
      let madeProgress = false;
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
        const historyTarget = canonicalHistoryTarget(state, s, gi, d);
        state.moveHistory.push({ source: s.id, target: historyTarget.id });
        madeProgress = true;

        // Tapping any finished member selects the right cluster. A tap on
        // the authored endpoint earns extra praise, but the stored line is
        // canonical either way; if that endpoint is still unplaced, the
        // deterministic cluster proxy remains visible until it can resolve
        // without spoiling the term's membership.
        const idealHit = isBridge(s) && canonicalBridgeHit(s, gi, d);
        addCanonicalLink(state, s, d, gi);
        state.onLinkAdded();
        resolveCanonicalBridgeLinks(state);
        state.reconcileManualOffset(s, preservedOffset);

        if (isDone(s)) {
          if (isBridge(s)) {
            setMessage(idealHit ? `Bridge complete — and "${d.word}" was exactly the authored endpoint.` : "Bridge complete.", "good");
            addFactCard(
              "bridge",
              `Bridge: ${s.word}`,
              s.fact,
              RELATION_KINDS[s.relationKind],
              bridgeDirectionText(s, state.puzzle)
            );
          } else {
            setMessage(`Connected — "${s.word}" joins the cluster.`, "good");
          }
          checkClusterCompletion();
        } else {
          setMessage(idealHit
            ? `Sharp choice — "${d.word}" is the canonical endpoint here. ${bridgeProgressText(s)}.`
            : `"${s.word}" is a bridge — ${bridgeProgressText(s)}.`, "good");
        }
        if (state.made === state.need) {
          const hasLenses = !!state.puzzle.lenses?.length;
          setMessage(
            hasLenses
              ? "Map complete. Now examine it through a different lens."
              : "Concept map complete. Well done.",
            "good"
          );
          // Two separate optional hooks, not one, because they answer
          // different questions and modes need to answer them
          // independently:
          //
          // onPuzzleSolved fires on every completion, organic or via Show
          // Solution alike -- for reactions that aren't overriding
          // anything the player built, just responding to the board now
          // being finished (Circle mode reclaims its now-empty free strip
          // either way, see reclaimStripOnSolve in setRenderer.js).
          //
          // detangle fires for Show Solution, and for a live player
          // completion that is about to freeze for lenses. The last
          // connection is a mid-simulation snapshot, not a finished
          // layout; without a pass, freezeForLenses would lock in
          // whatever crossings were on screen. Session restore skips it
          // so a saved layout is not raced by a new search. Star keeps
          // the player's arrangement and only uncrosses; Graph and
          // Circle's detangle alias is their pretty-printer.
          state.onPuzzleSolved?.();
          const freezeForLenses = hasLenses && !state.restoringSession;
          if (state.completedViaShowSolution || freezeForLenses) state.detangle?.();
          if (hasLenses) {
            if (state.restoringSession) state.lensStartPending = true;
            else state.beginLensSequence?.();
          } else {
            state.phase = "complete";
            if (!state.restoringSession) {
              trackPuzzleCompleted(state.puzzle.id, getMode(), state);
            }
            showRelatedPuzzles(state.puzzle);
          }
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
      if (madeProgress) state.onProgressChanged?.();
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
  // Fast-forwards to the authored solution for sharing/screenshots. Normal
  // play already canonicalizes bridge endpoints, so this only fills missing
  // memberships; it never needs to repair a second, player-authored graph.
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
        }
      });
    });

    state.onLinkAdded();
    setMessage(
      puzzle.bridges.length
        ? "Solution shown — every bridge connected to its canonical term where one exists."
        : "Solution shown — every term placed in its cluster.",
      "good"
    );
    state.paint();
    state.onProgressChanged?.();
  }

  return { handleTap, checkClusterCompletion, showSolution };
}
