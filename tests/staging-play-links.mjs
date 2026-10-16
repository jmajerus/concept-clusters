import assert from "node:assert/strict";
import { draftBoardQuery, draftPlayQuery, layoutQuery, playQuery, stagingPlayItems } from "../modules/stagingPlayLinks.js";

export const name = "Staging play links: LAN Play, not Cloudflare preview";

export async function run() {
  assert.equal(playQuery("energy-flow"), "/?puzzle=energy-flow");
  assert.equal(playQuery("energy-flow", "sets"), "/?puzzle=energy-flow&mode=sets");
  assert.equal(playQuery("energy-flow", "table"), "/?puzzle=energy-flow&mode=table");
  assert.equal(draftBoardQuery("energy-flow-review"), "/?puzzle=energy-flow-review");
  assert.equal(draftPlayQuery("energy-flow-review"), "/?puzzle=energy-flow-review&play");
  assert.equal(draftPlayQuery("energy-flow-review", "star"), "/?puzzle=energy-flow-review&play&mode=star");
  assert.equal(draftPlayQuery("energy-flow-review", "table", 3), "/?puzzle=energy-flow-review&play&revision=3&mode=table");
  assert.equal(layoutQuery("energy-flow"), "/?puzzle=energy-flow&author=layout");
  assert.equal(layoutQuery("energy-flow-review", "sets"), "/?puzzle=energy-flow-review&author=layout&mode=sets");
  assert.throws(() => layoutQuery("energy-flow", "table"), /Unknown play mode/);
  assert.throws(() => draftBoardQuery("energy-flow-review", "table"), /Unknown play mode/);
  assert.throws(() => playQuery("energy-flow", "unknown"), /Unknown play mode/);
  assert.deepEqual(
    stagingPlayItems("energy-flow").map(([label, href]) => [label, href]),
    [
      ["Play", "/?puzzle=energy-flow"],
      ["Graph", "/?puzzle=energy-flow&mode=graph"],
      ["Star", "/?puzzle=energy-flow&mode=star"],
      ["Sets", "/?puzzle=energy-flow&mode=sets"],
      ["Table", "/?puzzle=energy-flow&mode=table"]
    ]
  );
  assert.deepEqual(stagingPlayItems("Not-A-Slug"), []);
}
