import assert from "node:assert/strict";
import { taxonomySnapshot } from "../modules/taxonomySnapshot.js";

export const name = "Taxonomy snapshot: published domains, categories, and subcategories as JSON";

export async function run() {
  const registry = {
    Psychology: { slug: "psychology", domain: "social-sciences", registered: true, subcategories: {
      "social-psychology": { title: "Social Psychology" },
      cognition: { title: "Cognition" }
    } },
    Trivia: { slug: "trivia", domain: "", registered: true },
    "Draft Only": { slug: "draft-only", domain: "humanities", registered: false }
  };
  const snapshot = taxonomySnapshot(registry);
  assert.deepEqual(snapshot.domains.find(domain => domain.slug === "social-sciences"),
    { slug: "social-sciences", name: "Social Sciences" });
  // Unpublished working copies are left out; a category without a domain says so.
  assert.deepEqual(snapshot.categories, [
    { slug: "psychology", name: "Psychology", domain: "social-sciences", subcategories: [
      { id: "cognition", title: "Cognition" }, { id: "social-psychology", title: "Social Psychology" }] },
    { slug: "trivia", name: "Trivia", domain: null, subcategories: [] }
  ]);
  assert.throws(() => taxonomySnapshot({ ...registry, "U.S. History": { slug: "us-history", domain: "humanities", registered: true,
    subcategories: { civil: { title: "Civil War Era" } } } }), /may not contain "\."[^]*category us-history$/);
}
