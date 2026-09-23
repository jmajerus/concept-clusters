import assert from "node:assert/strict";
import {
  centeredRect,
  rectsOverlap,
  segmentFromPoints,
  segmentRectIntersectionPoint
} from "../modules/geometry.js";
import {
  loneClusterStarFan,
  singleClusterCircleHome,
  singleClusterTermHome
} from "../modules/lensLayout.js";
import { pillWidth } from "../modules/puzzleGraph.js";

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

  const width = 640;
  const height = 420;
  const title = {
    word: "Lasting or Staying Only a Short Time",
    w: pillWidth("Lasting or Staying Only a Short Time"),
    isTitle: true
  };
  const terms = ["transient", "transitory", "ephemeral", "momentary", "fugitive", "fleeting", "evanescent"]
    .map(word => ({ word, w: pillWidth(word) }));
  const near = loneClusterStarFan(
    { word: "Near Synonyms", w: pillWidth("Near Synonyms"), isTitle: true },
    ["innate", "intrinsic", "inherent"].map(word => ({ word, w: pillWidth(word) })),
    width,
    height
  );
  const nearTerms = [...near].filter(([node]) => !node.isTitle);
  const nearX = nearTerms.reduce((sum, [, point]) => sum + point.x, 0) / nearTerms.length;
  const nearY = nearTerms.reduce((sum, [, point]) => sum + point.y, 0) / nearTerms.length;
  assert.ok(nearX < width / 2 && nearY > height / 2, `small fan centroid (${nearX}, ${nearY}) should rest lower-left`);

  const fan = loneClusterStarFan(title, terms, width, height);
  const placed = [...fan].map(([node, point]) => ({ ...node, ...point }));
  const hub = fan.get(title);
  assert.ok(hub.x < width / 2, `fan hub x ${hub.x} should stay left of center`);
  assert.ok(hub.y > height / 2, `fan hub y ${hub.y} should stay below center`);
  for (const node of placed) {
    assert.ok(node.x - node.w / 2 >= 8 && node.x + node.w / 2 <= width - 8, `${node.word} leaves the board horizontally`);
    assert.ok(node.y >= 24 && node.y <= height - 24, `${node.word} is pinned to the vertical edge at ${node.y}`);
  }
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      assert.equal(
        rectsOverlap(centeredRect(placed[i], placed[i].w, 30, 4), centeredRect(placed[j], placed[j].w, 30, 4)),
        false,
        `${placed[i].word} overlaps ${placed[j].word}`
      );
    }
  }
  for (const term of placed) {
    if (term === placed.find(node => node.isTitle)) continue;
    for (const other of placed) {
      if (other === term || other.isTitle) continue;
      assert.equal(
        segmentRectIntersectionPoint(
          segmentFromPoints(term, hub),
          centeredRect(other, other.w, 30),
          4
        ),
        null,
        `${term.word}'s spoke cuts ${other.word}`
      );
    }
  }
}
