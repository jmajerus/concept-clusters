import assert from "node:assert/strict";
import {
  auditPuzzleClusterCase,
  auditPuzzleNodeCase,
  classifyNodeCase
} from "../modules/nodeCaseAudit.js";

export const name = "node-case audit: unambiguous majority styles only";

export async function run() {
  assert.equal(classifyNodeCase("the public sphere"), "lower");
  assert.equal(classifyNodeCase("The public sphere"), "sentence");
  assert.equal(classifyNodeCase("The Public Sphere"), "title");
  assert.equal(classifyNodeCase("Democracy"), null);
  assert.equal(classifyNodeCase("BSCT"), null);

  const audited = auditPuzzleNodeCase({
    id: "case-fixture",
    category: "Test",
    clusters: [{ terms: ["The public sphere", "The civic sphere"] }],
    bridges: [{ term: "legitimacy" }]
  });
  assert.equal(audited.total, 3);
  assert.equal(audited.counts.sentence, 2);
  assert.equal(audited.matches.sentence, true);
  assert.equal(audited.matches.lower, false);
  assert.equal(audited.matches.title, false);

  const clusterAudit = auditPuzzleClusterCase({
    id: "cluster-case-fixture",
    category: "Test",
    clusters: [{ name: "The Public Sphere" }, { name: "Civil Society" }]
  });
  assert.equal(clusterAudit.total, 2);
  assert.equal(clusterAudit.matches.title, true);
}
