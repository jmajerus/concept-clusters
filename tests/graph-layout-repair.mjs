import assert from "node:assert/strict";
import { repairGraphLayout, scoreGraphGeometry } from "../modules/graphLayout.js";

export const name = "graph layout repair: single-pill moves clear local defects";

const pill = (id, x, y, extra = {}) => ({ id, word: id, w: 80, gs: [0], x, y, ...extra });

export async function run() {
  const width = 640, height = 460;
  const positionsOf = nodes => new Map(nodes.map(node => [node.id, { x: node.x, y: node.y }]));

  // Two pills stacked on each other: one moves aside.
  const stacked = [pill("a", 300, 200), pill("b", 310, 205)];
  const before = scoreGraphGeometry(stacked.map(node => ({ ...node })), [], width, height);
  assert.ok(before.hardOverlaps > 0);
  const separated = repairGraphLayout({ nodes: stacked, links: [], width, height, positions: positionsOf(stacked) });
  assert.equal(separated.metrics.hardOverlaps, 0);

  // A line running straight through an unrelated pill: the pill moves off it.
  const crossed = [pill("p", 100, 200), pill("q", 500, 200), pill("r", 300, 200)];
  const links = [{ source: "p", target: "q" }];
  const throughBefore = scoreGraphGeometry(crossed.map(node => ({ ...node })), links.map(link => ({
    source: crossed.find(node => node.id === link.source),
    target: crossed.find(node => node.id === link.target)
  })), width, height);
  assert.ok(throughBefore.edgeNodeIntersections > 0);
  const cleared = repairGraphLayout({ nodes: crossed, links, width, height, positions: positionsOf(crossed) });
  assert.equal(cleared.metrics.edgeNodeIntersections, 0);
  assert.equal(cleared.metrics.hardOverlaps, 0);

  // Pinned pills never move.
  const pinned = [pill("a", 300, 200, { fx: 300, fy: 200 }), pill("b", 310, 205, { fx: 310, fy: 205 })];
  const held = repairGraphLayout({ nodes: pinned, links: [], width, height, positions: positionsOf(pinned) });
  assert.deepEqual(held.positions.get("a"), { x: 300, y: 200 });
  assert.deepEqual(held.positions.get("b"), { x: 310, y: 205 });
}
