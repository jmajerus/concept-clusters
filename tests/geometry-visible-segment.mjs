import assert from "node:assert/strict";
import { visibleSegmentLengthOutsidePills } from "../modules/geometry.js";

export const name = "geometry: visible segment length outside pills";

export async function run() {
  // Two 160-wide pills centers 177 apart horizontally leave only ~17px of
  // connector — the Birth of the Drive failure mode before Star clearance.
  const left = { x: 0, y: 0, w: 160 };
  const right = { x: 177, y: 0, w: 160 };
  assert.ok(
    visibleSegmentLengthOutsidePills(left, right) < 20,
    "wide horizontal neighbors should report a short visible gap"
  );

  const farther = { x: 240, y: 0, w: 160 };
  assert.ok(
    visibleSegmentLengthOutsidePills(left, farther) >= 36,
    "centers far enough apart should clear the Star min-visible threshold"
  );

  const stacked = { x: 0, y: 50, w: 160 };
  assert.equal(
    Math.round(visibleSegmentLengthOutsidePills(left, stacked)),
    20,
    "vertical stack uses pill height, not width"
  );
}
