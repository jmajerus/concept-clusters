import assert from "node:assert/strict";
import {
  AUTHORING_PHASE_PASSES,
  AUTHORING_WRITE_DOMAINS,
  BRIDGE_FIELD_OWNERSHIP,
  BRIDGE_IDENTITY_FIELDS,
  CONTENT_BRIDGE_FIELDS,
  DERIVED_ROOT_FIELDS,
  MCP_EXCLUDED_ROOT_FIELDS,
  PEDAGOGY_BRIDGE_FIELDS,
  PEDAGOGY_ROOT_FIELDS,
  PEDAGOGY_STORED_ROOT_FIELDS,
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
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.ok(PROTECTED_ROOT_FIELDS.has(field));
    assert.ok(MCP_EXCLUDED_ROOT_FIELDS.has(field));
    assert.ok(PEDAGOGY_STORED_ROOT_FIELDS.has(field));
    assert.ok(!PEDAGOGY_ROOT_FIELDS.has(field));
    assert.equal(ROOT_FIELD_OWNERSHIP[field].kind, "protected");
  }
  assert.ok(MCP_EXCLUDED_ROOT_FIELDS.has("provenance"));
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
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.ok(!AUTHORING_PHASE_PASSES.publication.root.includes(field));
  }
  assert.ok(AUTHORING_PHASE_PASSES.publication.root.includes("language"));
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
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.equal(publication.schema.properties[field], undefined);
  }
  assert.ok(publication.schema.properties.language);
  assert.ok(publication.schema.properties.relatedPuzzles);
  assert.ok(publication.schema.properties.categories);
  assert.match(publication.schema.description, /write domain "pedagogy"/);

  const review = simplifiedPuzzleSchemaResult("review");
  assert.equal(review.domain, undefined);
  assert.ok(review.schema.properties.bridges.items.properties.relationKind);
  assert.ok(review.schema.properties.bridges.items.properties.fact);
  assert.match(review.schema.description, /domain=pedagogy/);
  assert.match(review.schema.description, /cross-domain/);

  const completeSchema = simplifiedPuzzleSchemaResult("complete").schema;
  for (const field of ["provenance", "creator", "license", "derivedFrom"]) {
    assert.equal(completeSchema.properties[field], undefined);
  }
  for (const field of [
    "dateCreated", "dateModified", "version", "createdAt", "updatedAt",
    "validatedAt", "publicationState", "owner", "revision"
  ]) {
    assert.equal(completeSchema.properties[field], undefined);
  }
  assert.ok(completeSchema.properties.language);
  assert.equal(
    completeSchema.properties.learningIntroduction.properties.credit,
    undefined
  );
  assert.equal(
    completeSchema.properties.learningIntroduction.properties.revision,
    undefined
  );
  assert.match(completeSchema.properties.puzzleKind.description, /Omit for the default topic-based kind/);

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
    creator: "Human creator",
    license: "CC-BY-4.0",
    derivedFrom: "source-puzzle",
    language: "en",
    provenance: { contributors: ["Test"] }
  };
  const pedagogyProjection = projectAuthoredDocument(document, "pedagogy");
  const contentEdit = applyAuthoredDomain(document, "content", {
    ...projectAuthoredDocument(document, "content").document,
    title: "Edited content"
  });
  const pedagogyEdit = applyAuthoredDomain(document, "pedagogy", {
    ...pedagogyProjection.document,
    tags: ["updated"]
  });
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.equal(pedagogyProjection.document[field], undefined);
  }
  assert.equal(pedagogyProjection.document.language, "en");
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

  // Protected attribution/editorial fields remain outside focused writes,
  // but their stored values survive either authored-domain replacement.
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogyProjection.document,
      provenance: document.provenance
    }),
    /provenance is protected/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogyProjection.document,
      license: "MIT"
    }),
    /license is protected/
  );
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.equal(contentEdit[field], document[field]);
    assert.equal(pedagogyEdit[field], document[field]);
  }

  assert.deepEqual([...AUTHORING_WRITE_DOMAINS], ["content", "pedagogy"]);
}
