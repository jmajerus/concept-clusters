import assert from "node:assert/strict";
import {
  AUTHORING_PHASE_PASSES,
  AUTHORING_WRITE_DOMAINS,
  BRIDGE_FIELD_OWNERSHIP,
  BRIDGE_IDENTITY_FIELDS,
  CONTENT_BRIDGE_FIELDS,
  DERIVED_ROOT_FIELDS,
  PEDAGOGY_BRIDGE_FIELDS,
  PEDAGOGY_ROOT_FIELDS,
  PROTECTED_ROOT_FIELDS,
  ROOT_FIELD_OWNERSHIP,
  RETIRED_ROOT_FIELDS,
  SYSTEM_ROOT_FIELDS,
  assertPhasePassesConsistent
} from "../modules/authoringFieldOwnership.js";
import { simplifiedPuzzleSchemaResult } from "../modules/authoringSchemaResource.js";
import {
  applyAuthoredDomain,
  projectAuthoredDocument
} from "../modules/authoringDomains.js";

export const name =
  "Authoring field ownership: map, phase binding, and schema alignment";

export async function run() {
  assert.equal(assertPhasePassesConsistent(), true);
  assert.ok(PEDAGOGY_ROOT_FIELDS.has("lenses"));
  assert.ok(PEDAGOGY_ROOT_FIELDS.has("categories"));
  assert.ok(PEDAGOGY_BRIDGE_FIELDS.has("relationKind"));
  assert.ok(CONTENT_BRIDGE_FIELDS.has("fact"));
  assert.ok(!CONTENT_BRIDGE_FIELDS.has("relationKind"));
  assert.ok(BRIDGE_IDENTITY_FIELDS.has("id"));
  assert.ok(BRIDGE_IDENTITY_FIELDS.has("term"));
  assert.ok(PROTECTED_ROOT_FIELDS.has("provenance"));
  assert.ok(SYSTEM_ROOT_FIELDS.has("revision"));
  assert.ok(DERIVED_ROOT_FIELDS.has("large"));
  assert.ok(RETIRED_ROOT_FIELDS.has("generativeAssistance"));
  assert.equal(ROOT_FIELD_OWNERSHIP.provenance.kind, "protected");
  assert.equal(BRIDGE_FIELD_OWNERSHIP.relationKind.domain, "pedagogy");

  assert.equal(AUTHORING_PHASE_PASSES.core.writeDomain, "content");
  assert.equal(AUTHORING_PHASE_PASSES.pedagogy.writeDomain, "pedagogy");
  assert.equal(AUTHORING_PHASE_PASSES.publication.writeDomain, "pedagogy");
  assert.equal(AUTHORING_PHASE_PASSES.review.writeDomain, null);
  assert.ok(!AUTHORING_PHASE_PASSES.publication.root.includes("provenance"));
  assert.ok(!AUTHORING_PHASE_PASSES.core.bridges.includes("relationKind"));
  assert.ok(AUTHORING_PHASE_PASSES.review.bridges.includes("relationKind"));

  const core = simplifiedPuzzleSchemaResult("core");
  assert.equal(core.domain, "content");
  assert.equal(core.preserveExisting, true);
  assert.equal(core.schema.properties.lenses, undefined);
  assert.equal(core.schema.properties.bridges.items.properties.relationKind, undefined);
  assert.match(core.schema.description, /write domain "content"/);

  const pedagogy = simplifiedPuzzleSchemaResult("pedagogy");
  assert.equal(pedagogy.domain, "pedagogy");
  assert.ok(pedagogy.schema.properties.lenses);
  assert.ok(pedagogy.schema.properties.learningIntroduction);
  assert.equal(pedagogy.schema.properties.categories, undefined);
  assert.match(pedagogy.schema.description, /write domain "pedagogy"/);

  const publication = simplifiedPuzzleSchemaResult("publication");
  assert.equal(publication.domain, "pedagogy");
  assert.equal(publication.schema.properties.provenance, undefined);
  assert.ok(publication.schema.properties.relatedPuzzles);
  assert.ok(publication.schema.properties.categories);
  assert.match(publication.schema.description, /write domain "pedagogy"/);

  const review = simplifiedPuzzleSchemaResult("review");
  assert.equal(review.domain, undefined);
  assert.ok(review.schema.properties.bridges.items.properties.relationKind);
  assert.ok(review.schema.properties.bridges.items.properties.fact);
  assert.match(review.schema.description, /domain=pedagogy/);
  assert.match(review.schema.description, /cross-domain/);

  // Phase-advertised pedagogy fields must be accepted by a pedagogy domain save.
  const document = {
    id: "ownership-align",
    title: "Ownership align",
    category: "science",
    clusters: [{
      id: "a",
      name: "A",
      fact: "A fact",
      seeds: ["one", "two"],
      floatingTerms: ["three"]
    }],
    bridges: [{
      id: "b",
      term: "Bridge",
      clusters: ["a"],
      fact: "Bridge fact",
      relationKind: "contrast"
    }],
    lenses: [{ id: "lens", prompt: "P", explanation: "E" }],
    categories: ["science"],
    tags: ["demo"],
    provenance: { contributors: ["Test"] }
  };
  const pedagogyProjection = projectAuthoredDocument(document, "pedagogy");
  for (const field of AUTHORING_PHASE_PASSES.pedagogy.root) {
    assert.ok(
      Object.hasOwn(pedagogyProjection.document, field) ||
        pedagogyProjection.document[field] === undefined,
      `pedagogy domain projection must own phase field ${field}`
    );
    assert.ok(
      PEDAGOGY_ROOT_FIELDS.has(field),
      `phase pedagogy field ${field} must be pedagogy-owned`
    );
  }
  for (const field of AUTHORING_PHASE_PASSES.publication.root) {
    assert.ok(PEDAGOGY_ROOT_FIELDS.has(field));
  }

  // Provenance remains rejected on focused domain writes.
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogyProjection.document,
      provenance: document.provenance
    }),
    /provenance is protected/
  );

  assert.deepEqual([...AUTHORING_WRITE_DOMAINS], ["content", "pedagogy"]);
}
