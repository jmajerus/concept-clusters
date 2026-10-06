import {
  TOWARD_BRIDGE,
  bridgeArmDirections
} from "./bridgeDirection.js";

// Experimental (board.lensFlowTrace): when a lens's answer is revealed,
// run one pulse along each directed bridge that answer names, in the
// bridge's own direction. It plays a few rounds with the explanation --
// one pass over several edges is too quick to follow -- and then leaves
// the static arrows to carry the meaning, so motion marks the teaching
// moment instead of becoming background.

const TRACED_KINDS = new Set(["through", "outward", "inward"]);
const BEAT_MS = 650;
const TRAVEL_MS = 600;
const COMET = 44;
const REPEATS = 3;
const ROUND_PAUSE_MS = 500;

export function lensFlowTraceEnabled(puzzle) {
  return puzzle?.board?.lensFlowTrace === true;
}

// The words the revealed lens answers with. A quiz's answer is its
// correct option; the other options are comparison evidence, not flow.
function lensAnswerWords(lens) {
  if (lens?.options?.length) {
    return lens.options.find(option => option.correct)?.targets || [];
  }
  return lens?.targets || [];
}

// One leg per animated arm, with the beat it starts on. Bridges are
// directed independently, so a `through` bridge whose source cluster is
// another targeted bridge's destination -- a `through` bridge's `to` or
// any arm of an `outward` one -- waits for that bridge to finish: a chain
// A -> x -> B -> y -> C reads as one path, not two flashes.
// Bidirectional bridges are left alone; a pulse both ways along one arm
// cancels into a flicker. Beats are compacted so a lone outward bridge
// does not idle through an empty inbound beat.
export function lensFlowTracePlan(puzzle, lens) {
  const words = new Set(lensAnswerWords(lens));
  const bridges = (puzzle?.bridges || []).filter(bridge =>
    words.has(bridge.term) && TRACED_KINDS.has(bridge.direction?.kind)
  );
  if (!bridges.length) return [];

  const delivers = (bridge, clusterIndex) => bridge.direction.kind === "through"
    ? bridge.direction.to === clusterIndex
    : bridge.direction.kind === "outward" &&
      (bridge.gs || bridge.clusters || []).includes(clusterIndex);
  const stages = new Map();
  const stageOf = (bridge, visiting = new Set()) => {
    if (stages.has(bridge)) return stages.get(bridge);
    if (bridge.direction.kind !== "through" || visiting.has(bridge)) return 0;
    visiting.add(bridge);
    const predecessors = bridges.filter(other =>
      other !== bridge && delivers(other, bridge.direction.from)
    );
    const stage = predecessors.length
      ? Math.max(...predecessors.map(other => stageOf(other, visiting) + 1))
      : 0;
    stages.set(bridge, stage);
    return stage;
  };

  const legs = bridges.flatMap(bridge => {
    const stage = stageOf(bridge);
    const clusters = bridge.gs || bridge.clusters || [];
    return clusters.flatMap(clusterIndex =>
      bridgeArmDirections(bridge, clusterIndex).map(direction => ({
        term: bridge.term,
        clusterIndex,
        direction,
        beat: stage * 2 + (direction === TOWARD_BRIDGE ? 0 : 1)
      }))
    );
  });
  const beats = [...new Set(legs.map(leg => leg.beat))].sort((a, b) => a - b);
  return legs
    .map(leg => ({ ...leg, beat: beats.indexOf(leg.beat) }))
    .sort((a, b) => a.beat - b.beat);
}

export function clearLensFlowTrace(svg) {
  svg?.selectAll("g.lens-flow-trace").interrupt().remove();
}

// `armSegment(term, clusterIndex)` is the renderer's own geometry for the
// arm its static arrow rides: { bridgePoint, clusterPoint }, or null when
// that arm is not drawn. The overlay sits just above the arrow layer so
// pulses pass under pills, the same as the links they follow.
export function playLensFlowTrace(
  svg,
  legs,
  armSegment,
  { reducedMotion = false, repeats = REPEATS } = {}
) {
  clearLensFlowTrace(svg);
  if (!svg || !legs.length || typeof armSegment !== "function") return;
  const arrows = svg.node()?.querySelector(":scope > g.bridge-directions");
  const layer = svg.insert("g", arrows?.nextSibling ? () => arrows.nextSibling : null)
    .attr("class", "lens-flow-trace")
    .attr("aria-hidden", "true");

  const roundMs = (Math.max(...legs.map(leg => leg.beat)) + 1) * BEAT_MS + ROUND_PAUSE_MS;
  legs.forEach(leg => {
    const segment = armSegment(leg.term, leg.clusterIndex);
    if (!segment) return;
    const toward = leg.direction === TOWARD_BRIDGE;
    const start = toward ? segment.clusterPoint : segment.bridgePoint;
    const end = toward ? segment.bridgePoint : segment.clusterPoint;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (!Number.isFinite(length) || length < 12) return;
    const segmentLine = () => layer.append("line")
      .attr("x1", start.x).attr("y1", start.y)
      .attr("x2", end.x).attr("y2", end.y);

    // Without motion the same legs stay lit for as long as the lens
    // explanation is up: the same information, delivered all at once.
    if (reducedMotion) {
      segmentLine().attr("class", "lens-flow-highlight");
      return;
    }
    for (let round = 0; round < repeats; round++) {
      segmentLine()
        .attr("class", "lens-flow-pulse")
        .attr("stroke-dasharray", `${COMET} ${length + COMET}`)
        .attr("stroke-dashoffset", COMET)
        .style("opacity", 0)
        .transition()
        .delay(round * roundMs + leg.beat * BEAT_MS)
        .duration(0)
        .style("opacity", 1)
        .transition()
        .duration(TRAVEL_MS)
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", -length)
        .transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
    }
  });
}
