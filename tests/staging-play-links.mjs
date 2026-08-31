import assert from "node:assert/strict";
import { renderDraftInstallResultPage } from "../modules/draftReviewSubmit.js";
import { playQuery, stagingPlayItems } from "../modules/stagingPlayLinks.js";

export const name = "Staging play links: LAN Install, not Cloudflare preview";

export async function run() {
  assert.equal(playQuery("energy-flow"), "/?puzzle=energy-flow");
  assert.equal(playQuery("energy-flow", "sets"), "/?puzzle=energy-flow&mode=sets");
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

  const page = renderDraftInstallResultPage({
    draftId: "energy-flow-review",
    result: { puzzleId: "energy-flow", action: "create", affectedPaths: [] }
  });
  assert.match(page, /LAN staging/);
  assert.match(page, /href="\/\?puzzle=energy-flow"/);
  assert.match(page, /href="\/\?puzzle=energy-flow&amp;mode=graph"/);
  assert.doesNotMatch(page, /workers\.dev/);
}
