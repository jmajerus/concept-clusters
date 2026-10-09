import assert from "node:assert/strict";
import {
  chooseMemberOrder,
  compactMemberOrder,
  interiorLength,
  pillAnchor,
  stackFitRadius
} from "../modules/circleMemberOrder.js";

export const name = "circle member order: ideal lines reach their term without passing under other pills";

const center = { x: 0, y: 0 };
const terms = ["t0", "t1", "t2", "t3", "t4", "t5"];
// Six uniform rows, 36px apart, centred on the circle.
const rowOffsets = order => new Map(order.map((term, i) => [term, -90 + 36 * i]));

function choose({ arms, current = null, r = 140, width = 120 }) {
  return chooseMemberOrder({
    terms,
    current,
    arms,
    center,
    r,
    rowOffsets,
    pillWidth: () => width
  });
}

export async function run() {
  // No connected ideal line: keep the display (hash) order.
  assert.equal(choose({ arms: [] }), null);
  assert.equal(choose({ arms: [], current: ["t5", "t0", "t1", "t2", "t3", "t4"] }), null);

  // Entry from above or below seats the target in the nearest end row.
  assert.equal(choose({ arms: [{ term: "t3", point: { x: 0, y: -400 } }] })[0], "t3");
  assert.equal(choose({ arms: [{ term: "t1", point: { x: 0, y: 400 } }] })[5], "t1");

  // Two targets entering from opposite ends take opposite end rows.
  const both = choose({
    arms: [
      { term: "t2", point: { x: 0, y: -400 } },
      { term: "t3", point: { x: 0, y: 400 } }
    ]
  });
  assert.equal(both[0], "t2");
  assert.equal(both[5], "t3");

  // Wide pills, side entry at the target's own row height: the line is
  // already clear, so the target must stay put. Scoring from the pill's
  // centre counted its hidden half-width and moved it to the bottom row,
  // adding an occlusion.
  const sideArm = [{ term: "t3", point: { x: 600, y: 18 } }];
  const kept = choose({ arms: sideArm, r: 260, width: 475.3 });
  assert.ok(kept === null || kept.indexOf("t3") === 3, `side-entry target moved: ${kept}`);
  const fromRow = row => ({ x: 0, y: -90 + 36 * row });
  assert.ok(
    interiorLength(fromRow(5), sideArm[0].point, center, 260) <
      interiorLength(fromRow(3), sideArm[0].point, center, 260),
    "fixture no longer distinguishes centre-based from edge-based scoring"
  );
  // From the pill's facing end only the ~22px out to the circle is inside it.
  const sideEnd = pillAnchor(fromRow(3), sideArm[0].point, { halfW: 475.3 / 2, halfH: 15 });
  assert.equal(sideEnd.side, "right");
  assert.ok(interiorLength(sideEnd, sideArm[0].point, center, 260) < 30);

  // Anchors: a side end faces a bridge that is more beside than above or
  // below; top or bottom centre faces one more above or below, but only
  // from an end row, and a bottom anchor clears the caption row.
  const pill = { x: 0, y: 0 };
  const size = { halfW: 50, halfH: 15, below: 14 };
  assert.deepEqual(pillAnchor(pill, { x: -300, y: 40 }, size), { x: -50, y: 0, side: "left" });
  assert.deepEqual(pillAnchor(pill, { x: 20, y: -300 }, { ...size, top: true }), { x: 0, y: -15, side: "top" });
  assert.deepEqual(pillAnchor(pill, { x: 20, y: 300 }, { ...size, bottom: true }), { x: 0, y: 29, side: "bottom" });
  assert.equal(pillAnchor(pill, { x: 20, y: -300 }, size).side, "right", "a middle row leaves from its side end");
  assert.equal(pillAnchor(pill, { x: -20, y: 300 }, { ...size, top: true }).side, "left", "the top row does not leave downwards");

  // Compact order: widest in the middle, tapering both ways.
  const widths = { a: 40, bb: 60, ccc: 80, dddd: 100, eeeee: 120 };
  const width = term => widths[term];
  const compact = compactMemberOrder(Object.keys(widths), width, (x, y) => x.localeCompare(y));
  assert.deepEqual(compact, ["a", "ccc", "eeeee", "dddd", "bb"]);
  const metrics = { width, height: () => 30, gap: 6, pillHeight: 30, pad: 16 };
  const fitCompact = stackFitRadius(compact, metrics);
  assert.ok(fitCompact < stackFitRadius(["eeeee", "a", "bb", "ccc", "dddd"], metrics));

  // A circle fits its compact stack only. A target whose line would need
  // an end row the circle cannot fit stays put and leaves from a side end:
  // the wide middle term does not fit at an end, so it is not moved there.
  const compactFit = order => stackFitRadius(order, metrics) <= fitCompact + 0.5;
  const rows = order => new Map(order.map((term, i) => [term, -72 + 36 * i]));
  const seated = chooseMemberOrder({
    terms: compact, arms: [{ term: "eeeee", point: { x: 0, y: -400 } }], center, r: fitCompact,
    rowOffsets: rows, pillWidth: width, fits: compactFit
  });
  assert.ok(seated === null || seated[0] !== "eeeee", `wide term forced into an end row: ${seated}`);

  // Orders that would overflow the circle are never chosen.
  const topArm = [{ term: "t3", point: { x: 0, y: -400 } }];
  assert.equal(choose({ arms: topArm })[0], "t3");
  const fenced = chooseMemberOrder({
    terms, arms: topArm, center, r: 140, rowOffsets, pillWidth: () => 120,
    fits: order => order[0] !== "t3"
  });
  assert.ok(fenced === null || fenced[0] !== "t3", `overflowing order chosen: ${fenced}`);

  // Hysteresis: a shown order that is almost as good is kept.
  const shown = ["t3", "t0", "t1", "t2", "t4", "t5"];
  const nearlyVertical = [{ term: "t3", point: { x: 2, y: -400 } }];
  assert.equal(choose({ arms: nearlyVertical, current: shown }), shown);
}
