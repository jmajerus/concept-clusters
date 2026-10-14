// How hard the solved-layout searches try. "standard" is what a player's
// board runs live and must stay quick enough for Show Solution. "extended"
// is for the offline layout pass (tools/layouts-auto.mjs), which can spend
// far longer per board because it runs once and saves the result.
//
// The searches are synchronous, so a long one freezes the page until the
// browser offers to stop it. "standard" therefore gives up after
// timeLimitMs, under the browsers' hang warnings, and leaves the board as
// it was; "extended" runs headless and has no limit.

const BUDGETS = {
  standard: {
    timeLimitMs: 5000,
    graph: { clusterCap: 7, rotations: 12, scales: [0.88, 1] },
    circle: { rotationsPerCluster: 4, minRotations: 8, scaleSteps: [0.82, 0.92, 1, 1.15, 1.3, 1.45, 1.6, 1.75] },
    star: { exhaustiveClusters: 5, rotationsPerSlot: 1, offsetFractions: [-0.7, -0.35, 0.35, 0.7], repairMoves: 8 }
  },
  extended: {
    graph: { clusterCap: 8, rotations: 36, scales: [0.8, 0.88, 0.94, 1, 1.06], repair: true },
    circle: { rotationsPerCluster: 12, minRotations: 24, scaleSteps: [0.78, 0.82, 0.87, 0.92, 0.96, 1, 1.07, 1.15, 1.22, 1.3, 1.45, 1.6, 1.75, 1.9] },
    star: { exhaustiveClusters: 7, rotationsPerSlot: 4, offsetFractions: [-0.85, -0.7, -0.5, -0.35, -0.2, 0.2, 0.35, 0.5, 0.7, 0.85], repairMoves: 24 }
  }
};

export const LAYOUT_BUDGETS = Object.freeze(Object.keys(BUDGETS));

export function layoutBudget(name) {
  return BUDGETS[name] || BUDGETS.standard;
}

/** Thrown by a layoutDeadline check once the search has run too long. */
export class LayoutTimeLimit extends Error {
  constructor(ms) {
    super(`Layout search stopped after ${ms / 1000} seconds`);
    this.name = "LayoutTimeLimit";
    this.ms = ms;
  }

  /** What the player or author is told when polishing gives up. */
  get advice() {
    return `Polishing stopped after ${this.ms / 1000} seconds to keep the page responsive; the board is left as it is. Drag to tidy it.`;
  }
}

/**
 * A check to call inside a layout search loop. It throws LayoutTimeLimit
 * once the budget's time limit has passed since this call, and never
 * throws under a budget without one.
 */
export function layoutDeadline(name) {
  const ms = layoutBudget(name).timeLimitMs;
  if (!ms) return () => {};
  const end = performance.now() + ms;
  return () => {
    if (performance.now() > end) throw new LayoutTimeLimit(ms);
  };
}
