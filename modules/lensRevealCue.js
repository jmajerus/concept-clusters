import { lensAnswerWords } from "./lensFlowTrace.js";

// Lens reveal cue: a short effect as a lens's answer is revealed, so the
// answer pills are quick to find on a dense board. Ripple sends rings out
// from each answer pill; spotlight dims the rest of the board for a moment;
// both does the two together. The static green and red reveal stays the
// resting state. The cue only points at it.
//
// Which cue plays, highest first: reduced motion turns it off; the
// player's own preference (not offered yet); the puzzle's
// board.lensRevealCue; the site setting (modules/siteSettings.js); none.

export const LENS_REVEAL_CUES = ["none", "ripple", "spotlight", "both"];

export const LENS_REVEAL_CUE_LABELS = {
  none: "None",
  ripple: "Ripple",
  spotlight: "Spotlight",
  both: "Ripple + spotlight"
};

export function isLensRevealCue(value) {
  return LENS_REVEAL_CUES.includes(value);
}

export function puzzleLensRevealCue(puzzle) {
  const cue = puzzle?.board?.lensRevealCue;
  return isLensRevealCue(cue) ? cue : null;
}

export function globalLensRevealCue(settings) {
  const cue = settings?.lensRevealCue;
  return isLensRevealCue(cue) ? cue : "none";
}

export function lensRevealHoverPingEnabled(settings) {
  return settings?.lensRevealHoverPing === true;
}

export function resolveLensRevealCue({
  puzzle = null,
  settings = null,
  playerPreference = null,
  reducedMotion = false
} = {}) {
  if (reducedMotion) return "none";
  if (isLensRevealCue(playerPreference)) return playerPreference;
  return puzzleLensRevealCue(puzzle) ?? globalLensRevealCue(settings);
}

// One entry per answer word. A pill the player picked rings once; one they
// missed rings twice, since that is the one they could not find. Without
// selections (a quiz, or the layout view's Try) every answer is one to find.
export function lensRevealTargets(lens, selections = null) {
  return [...new Set(lensAnswerWords(lens))].map(word => ({
    word,
    rounds: selections?.has?.(word) ? 1 : 2
  }));
}

const RING_START_PAD = 1;
const RING_END_PAD = 16;
const RING_MS = 700;
const ROUND_GAP_MS = 380;
const STAGGER_MS = 70;
const MAX_STAGGER_MS = 560;
const HOLE_PAD = 6;
const SHADE_OPACITY = 0.78;
const SHADE_IN_MS = 180;
const SHADE_HOLD_MS = 900;
const SHADE_OUT_MS = 450;
// With both, the rings start once the board has begun to dim.
const RIPPLE_LEAD_MS = 120;
const STILL_RING_MS = 1200;

const running = new WeakMap();
let maskCount = 0;

function pillShape(group) {
  return group.querySelector(".bridge-shape") || group.querySelector(".pill-shape");
}

// Answer pill boxes in the overlay's own coordinates, so the overlay lines
// up in every mode however the renderer nests and moves its groups.
function pillBoxes(svgNode, layerNode, words) {
  const toLayer = layerNode.getScreenCTM?.()?.inverse();
  const boxes = new Map();
  if (!toLayer) return boxes;
  svgNode.querySelectorAll("g.node").forEach(group => {
    const word = d3.select(group).datum()?.word;
    if (!words.has(word) || boxes.has(word)) return;
    const shape = pillShape(group);
    const toScreen = shape?.getScreenCTM?.();
    if (!toScreen) return;
    const box = shape.getBBox();
    if (!box.width || !box.height) return;
    const matrix = toLayer.multiply(toScreen);
    const point = (x, y) => ({
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f
    });
    const start = point(box.x, box.y);
    const end = point(box.x + box.width, box.y + box.height);
    boxes.set(word, {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
      element: group
    });
  });
  return boxes;
}

// A capsule `pad` outside the pill. Works on a selection or a transition.
function padded(target, box, pad) {
  return target
    .attr("x", box.x - pad)
    .attr("y", box.y - pad)
    .attr("width", box.width + pad * 2)
    .attr("height", box.height + pad * 2)
    .attr("rx", box.height / 2 + pad);
}

// Returns how long the rings run after `delay`.
function ripple(layer, box, { delay = 0, rounds = 1 }) {
  for (let round = 0; round < rounds; round++) {
    const ring = padded(layer.append("rect"), box, RING_START_PAD)
      .attr("class", "lens-cue-ring")
      .style("opacity", 0);
    padded(
      ring.transition()
        .delay(delay + round * ROUND_GAP_MS)
        .duration(0)
        .style("opacity", 1)
        .transition()
        .duration(RING_MS)
        .ease(d3.easeCubicOut)
        .style("opacity", 0)
        .style("stroke-width", "1px"),
      box,
      RING_END_PAD
    );
  }
  return (rounds - 1) * ROUND_GAP_MS + RING_MS;
}

function framed(target, frame) {
  return target
    .attr("x", frame.x)
    .attr("y", frame.y)
    .attr("width", frame.width)
    .attr("height", frame.height);
}

// A board-colored veil with a hole over each answer pill.
function spotlight(layer, svgNode, boxes) {
  const view = svgNode.viewBox?.baseVal;
  const frame = view?.width
    ? { x: view.x, y: view.y, width: view.width, height: view.height }
    : { x: 0, y: 0, width: svgNode.clientWidth, height: svgNode.clientHeight };
  const id = `lens-cue-mask-${++maskCount}`;
  const mask = framed(layer.append("defs").append("mask"), frame)
    .attr("id", id)
    .attr("maskUnits", "userSpaceOnUse");
  framed(mask.append("rect"), frame).attr("fill", "white");
  boxes.forEach(box => padded(mask.append("rect"), box, HOLE_PAD).attr("fill", "black"));
  framed(layer.append("rect"), frame)
    .attr("class", "lens-cue-shade")
    .attr("mask", `url(#${id})`)
    .style("opacity", 0)
    .transition()
    .duration(SHADE_IN_MS)
    .style("opacity", SHADE_OPACITY)
    .transition()
    .delay(SHADE_HOLD_MS)
    .duration(SHADE_OUT_MS)
    .style("opacity", 0);
  return SHADE_IN_MS + SHADE_HOLD_MS + SHADE_OUT_MS;
}

export function clearLensRevealCue(svg) {
  const svgNode = svg?.node?.();
  const run = svgNode && running.get(svgNode);
  if (run) {
    run.timer?.stop();
    run.observer?.disconnect();
    running.delete(svgNode);
  }
  svg?.selectAll("g.lens-reveal-cue").interrupt().remove();
}

// Plays `cue` over the answer pills once at least one of them is on
// screen: the lens panel sits under the board, so on a tall board the check
// that reveals an answer can leave its pills scrolled out of view. `onDone`
// runs when the cue has finished, or at once when there is nothing to play,
// so a flow trace can follow the cue instead of competing with it. A clear
// before then cancels it.
export function playLensRevealCue(svg, { cue, targets = [], onDone = null } = {}) {
  clearLensRevealCue(svg);
  const svgNode = svg?.node?.();
  const finish = () => onDone?.();
  if (!svgNode || !targets.length || !isLensRevealCue(cue) || cue === "none") {
    finish();
    return;
  }
  const layer = svg.append("g")
    .attr("class", "lens-reveal-cue")
    .attr("aria-hidden", "true");
  const boxes = pillBoxes(svgNode, layer.node(), new Set(targets.map(target => target.word)));
  if (!boxes.size) {
    layer.remove();
    finish();
    return;
  }
  const run = { started: false, timer: null, observer: null };
  running.set(svgNode, run);

  const start = () => {
    if (run.started || running.get(svgNode) !== run) return;
    run.started = true;
    run.observer?.disconnect();
    run.observer = null;
    let duration = 0;
    if (cue === "spotlight" || cue === "both") {
      duration = spotlight(layer, svgNode, [...boxes.values()]);
    }
    if (cue === "ripple" || cue === "both") {
      const lead = cue === "both" ? RIPPLE_LEAD_MS : 0;
      const stagger = Math.min(STAGGER_MS, MAX_STAGGER_MS / Math.max(1, boxes.size - 1));
      targets.filter(target => boxes.has(target.word)).forEach((target, index) => {
        const delay = lead + index * stagger;
        duration = Math.max(
          duration,
          delay + ripple(layer, boxes.get(target.word), { delay, rounds: target.rounds })
        );
      });
    }
    run.timer = d3.timeout(() => {
      if (running.get(svgNode) !== run) return;
      running.delete(svgNode);
      layer.remove();
      finish();
    }, duration);
  };

  const Observer = globalThis.IntersectionObserver;
  if (typeof Observer !== "function") {
    start();
    return;
  }
  run.observer = new Observer(entries => {
    if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5)) start();
  }, { threshold: [0.5] });
  boxes.forEach(box => run.observer.observe(box.element));
}

// The explanation names each answer; pointing at a name pings its pill.
// Reduced motion keeps the ring still and only lets it fade.
export function pingLensTerm(svg, word, { reducedMotion = false } = {}) {
  const svgNode = svg?.node?.();
  if (!svgNode || !word) return;
  svg.selectAll("g.lens-term-ping").interrupt().remove();
  const layer = svg.append("g")
    .attr("class", "lens-term-ping")
    .attr("aria-hidden", "true");
  const box = pillBoxes(svgNode, layer.node(), new Set([word])).get(word);
  if (!box) {
    layer.remove();
    return;
  }
  let duration;
  if (reducedMotion) {
    padded(layer.append("rect"), box, HOLE_PAD)
      .attr("class", "lens-cue-ring")
      .transition()
      .delay(STILL_RING_MS - 300)
      .duration(300)
      .style("opacity", 0);
    duration = STILL_RING_MS;
  } else {
    duration = ripple(layer, box, { rounds: 2 });
  }
  d3.timeout(() => layer.remove(), duration);
}
