import assert from "node:assert/strict";
import {
  singleClusterCircleHome,
  singleClusterTermHome
} from "../modules/lensLayout.js";

export const name = "single-cluster layout: lone clusters rest in the lower left";

export async function run() {
  const term = singleClusterTermHome(640, 460);
  assert.ok(term.x < 320, `term hub x ${term.x} should be left of center`);
  assert.ok(term.y > 230, `term hub y ${term.y} should be below center`);
  assert.ok(term.x > 80 && term.y < 420, "term hub should stay on the board");

  const circle = singleClusterCircleHome(90, 640, 460, 40);
  assert.ok(circle.x < 320, `circle x ${circle.x} should be left of center`);
  assert.ok(circle.y > 230, `circle y ${circle.y} should be below center`);
  assert.ok(circle.x - 90 >= 20, "circle should clear the left edge");
  assert.ok(circle.y + 90 <= 444, "circle should clear the bottom edge");

  // A circle that cannot sit in the corner stays on the board and does
  // not get pushed to the right side.
  const huge = singleClusterCircleHome(220, 640, 460, 40);
  assert.ok(huge.x <= 320, `oversized circle x ${huge.x} should not sit on the right`);
  assert.ok(huge.x > 40 && huge.x < 600 && huge.y > 40 && huge.y < 420);
}
