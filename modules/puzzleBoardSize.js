// Layout is derived from the puzzle and the play mode. `large` is not stored.
// Play and the Library badge both call derivedLarge on the node count, so a
// later change to that threshold applies to every puzzle.
//
// The one-board ceiling is 32 nodes. It is the only size agents are told.
// Canvas floors below it are derived here and are not authoring choices.
// Canvas size starts from the node-count floor below, then grows when the
// board is heavier than the floors were tuned for. The extra signal is how
// many edges the solved board has to route, and how much label text the
// terms carry. A 30-node board of short labels and few bridges can stay on
// the wide canvas; the same node count with long terms or a dense bridge
// graph gets a larger one. Total characters are not enough on their own:
// a handful of very wide pills crowds a cluster the way a longer list of
// ordinary words does not, so surplus pill width past the wide floor
// grows the canvas too.

import { pillWidth } from "./puzzleGraph.js";

export const NODE_CAP_STANDARD = 16;
export const NODE_CAP_XLARGE = 32;

export function puzzleNodeCount(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  return puzzle.clusters.reduce((sum, cluster) => {
    const terms = Array.isArray(cluster?.terms) && cluster.terms.length
      ? cluster.terms
      : [...(cluster?.seeds || []), ...(cluster?.floatingTerms || [])];
    return sum + terms.length;
  }, 0) + puzzle.bridges.length;
}

// Solved-board segments the canvas has to keep apart: a spanning link
// inside each cluster, plus one arm for every cluster a bridge joins.
export function puzzleEdgeCount(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  const inCluster = puzzle.clusters.reduce((sum, cluster) => {
    const terms = Array.isArray(cluster?.terms) ? cluster.terms.length : 0;
    return sum + Math.max(0, terms - 1);
  }, 0);
  const bridgeArms = puzzle.bridges.reduce((sum, bridge) => {
    const span = Array.isArray(bridge?.clusters) ? bridge.clusters.length : 0;
    return sum + span;
  }, 0);
  return inCluster + bridgeArms;
}

export function puzzleTermCharacters(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  const clusterChars = puzzle.clusters.reduce((sum, cluster) => {
    if (!Array.isArray(cluster?.terms)) return sum;
    return sum + cluster.terms.reduce(
      (inner, term) => inner + String(term ?? "").length,
      0
    );
  }, 0);
  const bridgeChars = puzzle.bridges.reduce(
    (sum, bridge) => sum + String(bridge?.term ?? "").length,
    0
  );
  return clusterChars + bridgeChars;
}

export function derivedLarge(nodeCount) {
  return nodeCount > NODE_CAP_STANDARD;
}

export function largeField(nodeCount) {
  return derivedLarge(nodeCount) ? { large: true } : {};
}

// ViewBox units, not CSS pixels. The board is width:100% of its container,
// so a taller viewBox is a taller page and a longer reach to the lens
// controls under it. Compact puzzles stay on the short canvas. Crowded
// ones — many nodes, or several clusters whose links can cross — take a
// wider canvas, and Circle's densest boards take the extra-tall one.
// These four are floors. boardCanvas grows past them when boardLoad
// exceeds the reference the wide floors were tuned against.
export const BOARD_CANVAS = {
  compact: { width: 640, height: 420 },
  standard: { width: 640, height: 460 },
  wide: { width: 960, height: 620 },
  circleWide: { width: 1050, height: 780 }
};

// The wide floors were tuned against the densest published boards: about
// 24 nodes, 25 routed edges, and 450 characters of term text. Weights sum
// to 1, so that reference has load 1 and does not grow. Nodes dominate
// because each pill needs area; edges and label bulk push a board that is
// tangled or wordy past a board with the same count.
const LOAD_REFERENCE = { nodes: 24, edges: 25, chars: 450 };
const LOAD_WEIGHTS = { nodes: 0.5, edges: 0.2, chars: 0.3 };
// pillWidth of a 24-character term. The wide floor was packed with labels
// around that length. Width beyond it is the part that collides.
const COMFORT_PILL_WIDTH = 180;
// The busiest published board is under this much excess, and the wide
// floor already holds it. Only the surplus above that grows the canvas.
const LABEL_EXCESS_ABSORBED = 280;
// One unit of load per 560px of that surplus. A 17-node board whose pills
// are mostly past the comfort width then clears the wide floor.
const LABEL_SURPLUS_REFERENCE = 560;

export function puzzleLabelExcess(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  const add = (sum, term) => sum + Math.max(0, pillWidth(String(term ?? "")) - COMFORT_PILL_WIDTH);
  const clusterExcess = puzzle.clusters.reduce((sum, cluster) => {
    if (!Array.isArray(cluster?.terms)) return sum;
    return cluster.terms.reduce(add, sum);
  }, 0);
  return puzzle.bridges.reduce((sum, bridge) => add(sum, bridge?.term), clusterExcess);
}

export function boardLoad(puzzle) {
  const nodes = puzzleNodeCount(puzzle);
  if (nodes <= 0) return 0;
  const surplus = Math.max(0, puzzleLabelExcess(puzzle) - LABEL_EXCESS_ABSORBED);
  return (
    LOAD_WEIGHTS.nodes * (nodes / LOAD_REFERENCE.nodes) +
    LOAD_WEIGHTS.edges * (puzzleEdgeCount(puzzle) / LOAD_REFERENCE.edges) +
    LOAD_WEIGHTS.chars * (puzzleTermCharacters(puzzle) / LOAD_REFERENCE.chars) +
    surplus / LABEL_SURPLUS_REFERENCE
  );
}

const COMPACT_NODE_CAP = 8;
// .wrap.wide is 1000px for a 960-wide viewBox. Grown canvases keep that
// same CSS-pixel-per-unit ratio so longer labels stay the size they are
// on the wide floor instead of shrinking into a fixed frame.
const WIDE_FRAME_RATIO = 1000 / BOARD_CANVAS.wide.width;

function growCanvas(canvas, load) {
  if (!(load > 1)) return canvas;
  const linear = Math.sqrt(load);
  const width = Math.max(canvas.width, Math.round((canvas.width * linear) / 10) * 10);
  const height = Math.max(canvas.height, Math.round((canvas.height * linear) / 10) * 10);
  if (width === canvas.width && height === canvas.height) return canvas;
  return { width, height };
}

// Administrative adjustment on top of the derived canvas. 1 leaves the
// heuristic alone. Each step is 5%, from a quarter smaller to a quarter larger.
export const BOARD_SIZE_FACTOR_MIN = 0.75;
export const BOARD_SIZE_FACTOR_MAX = 1.25;
export const BOARD_SIZE_FACTOR_STEP = 0.05;

export function canonicalBoardSizeFactor(value) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  const steps = Math.round((number - BOARD_SIZE_FACTOR_MIN) / BOARD_SIZE_FACTOR_STEP);
  const snapped = Math.round((BOARD_SIZE_FACTOR_MIN + steps * BOARD_SIZE_FACTOR_STEP) * 100) / 100;
  if (Math.abs(number - snapped) > 0.001) return null;
  if (snapped < BOARD_SIZE_FACTOR_MIN || snapped > BOARD_SIZE_FACTOR_MAX) return null;
  return snapped;
}

export function boardSizeFactorChoices() {
  const choices = [];
  const count = Math.round((BOARD_SIZE_FACTOR_MAX - BOARD_SIZE_FACTOR_MIN) / BOARD_SIZE_FACTOR_STEP);
  for (let step = 0; step <= count; step += 1) {
    const value = Math.round((BOARD_SIZE_FACTOR_MIN + step * BOARD_SIZE_FACTOR_STEP) * 100) / 100;
    if (value !== 1) choices.push(value);
  }
  return choices;
}

export function boardSizeFactor(puzzle) {
  const factor = canonicalBoardSizeFactor(puzzle?.board?.sizeFactor);
  return factor == null ? 1 : factor;
}

function scaleCanvas(canvas, factor) {
  if (!(factor > 0) || factor === 1) return canvas;
  const width = Math.round((canvas.width * factor) / 10) * 10;
  const height = Math.round((canvas.height * factor) / 10) * 10;
  if (width < 10 || height < 10) return canvas;
  if (width === canvas.width && height === canvas.height) return canvas;
  return { width, height };
}

function baseCanvas(puzzle, mode) {
  const nodes = puzzleNodeCount(puzzle);
  const clusters = Array.isArray(puzzle?.clusters) ? puzzle.clusters.length : 0;
  let canvas = BOARD_CANVAS.standard;
  if (nodes > 0 && nodes <= COMPACT_NODE_CAP) canvas = BOARD_CANVAS.compact;
  else if (derivedLarge(nodes)) {
    canvas = mode === "sets" ? BOARD_CANVAS.circleWide : BOARD_CANVAS.wide;
  } else if (mode !== "graph" && clusters >= 2) canvas = BOARD_CANVAS.wide;
  return growCanvas(canvas, boardLoad(puzzle));
}

export function boardCanvas(puzzle, mode) {
  return scaleCanvas(baseCanvas(puzzle, mode), boardSizeFactor(puzzle));
}

// Node text is 12.5px in board units, and the board fills .wrap. The
// frame scales with the size factor so a label stays the same size on
// screen. Derived growth still leaves the stylesheet floor alone.
const STANDARD_FRAME = 680;

export function boardDisplayFrame(puzzle, mode) {
  const grown = baseCanvas(puzzle, mode);
  const fitted = boardFrameMaxWidth(grown);
  const factor = boardSizeFactor(puzzle);
  if (factor === 1) return fitted;
  const natural = fitted ?? (
    grown.width <= BOARD_CANVAS.standard.width ? STANDARD_FRAME : WIDE_FRAME_FLOOR
  );
  return Math.round(natural * factor);
}

// Null keeps the stylesheet default: 680px, or 1000px once .wrap.wide is on.
// A grown canvas sets an explicit frame so the extra viewBox is real width.
// .wrap.wide's default is 1000px, so a computed frame below that would
// shrink the page. Leave the default in place until the canvas is wide
// enough to need more than that.
const WIDE_FRAME_FLOOR = 1000;

export function boardFrameMaxWidth(canvas) {
  if (!canvas || canvas.width <= BOARD_CANVAS.standard.width) return null;
  if (
    canvas.width === BOARD_CANVAS.wide.width ||
    canvas.width === BOARD_CANVAS.circleWide.width
  ) {
    return null;
  }
  const frame = Math.round(canvas.width * WIDE_FRAME_RATIO);
  if (frame <= WIDE_FRAME_FLOOR) return null;
  return frame;
}
