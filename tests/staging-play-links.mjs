import assert from "node:assert/strict";
import { draftBoardQuery, draftPlayQuery, playQuery, stagingPlayItems } from "../modules/stagingPlayLinks.js";

export const name = "Staging play links: LAN Play, not Cloudflare preview";

export async function run() {
  assert.equal(playQuery("energy-flow"), "/?puzzle=energy-flow");
  assert.equal(playQuery("energy-flow", "sets"), "/?puzzle=energy-flow&mode=sets");
  assert.equal(draftBoardQuery("energy-flow-review"), "/?draft=energy-flow-review");
  assert.equal(draftPlayQuery("energy-flow-review"), "/?draft=energy-flow-review&view=play");
  assert.equal(draftPlayQuery("energy-flow-review", "star"), "/?draft=energy-flow-review&view=play&mode=star");
  assert.deepEqual(
    stagingPlayItems("energy-flow").map(([label, href]) => [label, href]),
    [
      ["Play", "/?puzzle=energy-flow"],
      ["Graph", "/?puzzle=energy-flow&mode=graph"],
      ["Star", "/?puzzle=energy-flow&mode=star"],
      ["Sets", "/?puzzle=energy-flow&mode=sets"]
    ]
  );
  assert.deepEqual(stagingPlayItems("Not-A-Slug"), []);
}
