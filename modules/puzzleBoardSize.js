// Layout is derived from the puzzle and the play mode. Authors and agents
// omit renderer flags; conversion/save may retain the legacy `large` field
// for runtime compatibility, and play derives the same choice from the count.
//
// The one-board ceiling is 32 nodes. It is the only size agents are told.
// Canvas floors below it are derived here and are not authoring choices.
// Canvas size starts from the node-count floor below, then grows when the
// board is heavier than the floors were tuned for. The extra signal is how
// many edges the solved board has to route, and how much label text the
// terms carry. A 30-node board of short labels and few bridges can stay on
// the wide canvas; the same node count with long terms or a dense bridge
// graph gets a larger one.

export const NODE_CAP_STANDARD = 16;
export const NODE_CAP_XLARGE = 32;

export function puzzleNodeCount(puzzle) {
  if (!Array.isArray(puzzle?.clusters) || !Array.isArray(puzzle?.bridges)) {
    return 0;
  }
  return puzzle.clusters.reduce(
    (sum, cluster) => sum + (Array.isArray(cluster?.terms) ? cluster.terms.length : 0),
    0
  ) + puzzle.bridges.length;
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

export function boardLoad(puzzle) {
  const nodes = puzzleNodeCount(puzzle);
  if (nodes <= 0) return 0;
  return (
    LOAD_WEIGHTS.nodes * (nodes / LOAD_REFERENCE.nodes) +
    LOAD_WEIGHTS.edges * (puzzleEdgeCount(puzzle) / LOAD_REFERENCE.edges) +
    LOAD_WEIGHTS.chars * (puzzleTermCharacters(puzzle) / LOAD_REFERENCE.chars)
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

export function boardCanvas(puzzle, mode) {
  const nodes = puzzleNodeCount(puzzle);
  const clusters = Array.isArray(puzzle?.clusters) ? puzzle.clusters.length : 0;
  let canvas = BOARD_CANVAS.standard;
  if (nodes > 0 && nodes <= COMPACT_NODE_CAP) canvas = BOARD_CANVAS.compact;
  else if (derivedLarge(nodes)) {
    canvas = mode === "sets" ? BOARD_CANVAS.circleWide : BOARD_CANVAS.wide;
  } else if (mode !== "graph" && clusters >= 2) canvas = BOARD_CANVAS.wide;
  return growCanvas(canvas, boardLoad(puzzle));
}

// Null keeps the stylesheet default: 680px, or 1000px once .wrap.wide is on.
// A grown canvas sets an explicit frame so the extra viewBox is real width.
export function boardFrameMaxWidth(canvas) {
  if (!canvas || canvas.width <= BOARD_CANVAS.standard.width) return null;
  if (
    canvas.width === BOARD_CANVAS.wide.width ||
    canvas.width === BOARD_CANVAS.circleWide.width
  ) {
    return null;
  }
  return Math.round(canvas.width * WIDE_FRAME_RATIO);
}
