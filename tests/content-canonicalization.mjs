import assert from "node:assert/strict";
import { canonicalizePuzzleDocument, unsupportedJsonLdFields } from "../modules/contentCanonicalization.js";
import {
  documentForEditor,
  documentForStorage
} from "../modules/authoredPuzzleDocument.js";
import { planRows } from "../tools/canonicalize-content.mjs";

export const name = "content canonicalization: simplified storage and JSON-LD conversion are lossless";

function registry() {
  return {
    "Current Subject": {
      slug: "subject",
      previousTitles: ["Old Subject"],
      subcategories: { basics: { title: "Basics" } }
    },
    Art: {
      slug: "art",
      subcategories: { "visual-form": { title: "Visual Form" } }
    }
  };
}

function puzzleDocument(overrides = {}) {
  return {
    id: "canonicalization-fixture",
    title: "Canonicalization Fixture",
    category: "Old Subject",
    categories: ["Old Subject", "Art"],
    subcategories: { "Old Subject": "basics", Art: "visual-form" },
    info: {
      text: "Puzzle help.",
      link: "wiki:Example",
      seeAlso: [{ href: "https://example.org/reading", label: "Reading" }]
    },
    clusters: [
      {
        id: "one",
        name: "One",
        fact: "One fact.",
        seeds: ["a", "b"],
        floatingTerms: ["c", "d"],
        info: { text: "Cluster help.", extraLink: "https://example.org/cluster" }
      },
      {
        id: "two",
        name: "Two",
        fact: "Two fact.",
        seeds: ["e", "f"],
        floatingTerms: ["g", "h"]
      }
    ],
    bridges: [],
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Lesson text." },
      sources: [{ href: "https://example.org/lesson", label: "Lesson" }]
    },
    ...overrides
  };
}

function jsonLdFixture() {
  return {
    "@context": "https://concept-clusters.org/context/v1",
    "@id": "urn:concept-clusters:puzzle:canonicalization-fixture",
    "@type": "Puzzle",
    schemaVersion: "1.0",
    id: "canonicalization-fixture",
    title: "Canonicalization Fixture",
    category: "Political Science",
    categories: ["Political Science", "Philosophy"],
    info: { text: "Puzzle help.", link: "wiki:Example" },
    clusters: [
      {
        "@id": "#one",
        "@type": "Cluster",
        id: "one",
        name: "One",
        color: "teal",
        fact: "One fact.",
        terms: ["a", "b", "c", "d"],
        seeds: ["a", "b"],
        info: { text: "Cluster help.", link: "https://example.org/cluster" }
      },
      {
        "@id": "#two",
        "@type": "Cluster",
        id: "two",
        name: "Two",
        color: "blue",
        fact: "Two fact.",
        terms: ["e", "f", "g", "h"],
        seeds: ["e", "f"]
      }
    ],
    bridges: [{
      "@id": "#bridge",
      "@type": "Bridge",
      id: "bridge",
      term: "shared idea",
      clusters: [{ "@id": "#one" }, { "@id": "#two" }],
      fact: "A shared idea connects the clusters."
    }],
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Lesson text.", mediaType: "text/markdown" },
      citations: [{
        title: "Lesson source",
        author: "Author",
        year: "2026"
      }]
    }
  };
}

export async function run() {
  const categories = registry();
  const legacy = puzzleDocument();
  const result = canonicalizePuzzleDocument(legacy, { categoryRegistry: categories });
  assert.deepEqual(result.errors, []);
  assert.equal(result.sourceFormat, "simplified");
  assert.equal(result.targetFormat, "simplified");
  assert.equal(result.changed, true);
  assert.ok(result.reasons.includes("authored-fields"));
  assert.ok(result.reasons.includes("category-identifiers"));
  assert.equal(result.document.category, "subject");
  assert.deepEqual(result.document.categories, ["subject", "art"]);
  assert.deepEqual(result.document.subcategories, { subject: "basics", art: "visual-form" });
  assert.deepEqual(result.document.info.links, [
    { href: "wiki:Example" },
    { href: "https://example.org/reading", label: "Reading" }
  ]);
  assert.equal("link" in result.document.info, false);
  assert.equal("seeAlso" in result.document.info, false);
  assert.deepEqual(result.document.learningIntroduction.links, [
    { href: "https://example.org/lesson", label: "Lesson" }
  ]);
  assert.equal("sources" in result.document.learningIntroduction, false);

  const second = canonicalizePuzzleDocument(result.document, { categoryRegistry: categories });
  assert.deepEqual(second.errors, []);
  assert.equal(second.changed, false);
  assert.deepEqual(second.document, result.document);

  // JSON-LD conversion must hoist citations before puzzleToSimplified drops
  // the interchange-only learningIntroduction.citations location.
  const jsonLd = jsonLdFixture();
  const converted = canonicalizePuzzleDocument(jsonLd, { categoryRegistry: {
    "Political Science": { slug: "political-science" },
    Philosophy: { slug: "philosophy" }
  } });
  assert.deepEqual(converted.errors, []);
  assert.equal(converted.sourceFormat, "jsonld");
  assert.equal(converted.targetFormat, "simplified");
  assert.ok(converted.reasons.includes("jsonld-to-simplified"));
  assert.equal(converted.document["@context"], undefined);
  assert.equal(converted.document.category, "political-science");
  assert.equal(converted.document.info.citations.length, 1);
  assert.equal(converted.document.learningIntroduction.citations, undefined);
  const convertedAgain = canonicalizePuzzleDocument(converted.document, {
    categoryRegistry: {
      "Political Science": { slug: "political-science" },
      Philosophy: { slug: "philosophy" }
    }
  });
  assert.deepEqual(convertedAgain.errors, []);
  assert.equal(convertedAgain.changed, false);

  // A handful of legacy JSON-LD drafts used a `cluster-` prefix in the local
  // fragment and in bridge references, but omitted it from the node's bare
  // id.  The migration keeps those already-published fragments and repairs
  // the bare ids instead of guessing a new identity or rewriting references.
  const driftedJsonLd = jsonLdFixture();
  driftedJsonLd.clusters = driftedJsonLd.clusters.map(cluster => ({
    ...cluster,
    "@id": `#cluster-${cluster.id}`
  }));
  driftedJsonLd.bridges = driftedJsonLd.bridges.map(bridge => ({
    ...bridge,
    clusters: bridge.clusters.map(reference => ({
      "@id": `#cluster-${reference["@id"].slice(1)}`
    }))
  }));
  const repairedDrift = canonicalizePuzzleDocument(driftedJsonLd, {
    categoryRegistry: {
      "Political Science": { slug: "political-science" },
      Philosophy: { slug: "philosophy" }
    }
  });
  assert.deepEqual(repairedDrift.errors, []);
  assert.ok(repairedDrift.reasons.includes("jsonld-id-drift"));
  assert.deepEqual(
    repairedDrift.document.clusters.map(cluster => cluster.id),
    ["cluster-one", "cluster-two"]
  );
  assert.deepEqual(repairedDrift.document.bridges[0].clusters, [
    "cluster-one",
    "cluster-two"
  ]);

  const assistedJsonLd = {
    ...jsonLd,
    generativeAssistance: [{
      system: "A drafting system",
      scope: "puzzle",
      provider: "Example",
      role: "drafted"
    }]
  };
  const assisted = canonicalizePuzzleDocument(assistedJsonLd, {
    categoryRegistry: {
      "Political Science": { slug: "political-science" },
      Philosophy: { slug: "philosophy" }
    }
  });
  assert.deepEqual(assisted.errors, []);
  assert.equal(assisted.document.generativeAssistance, undefined);
  assert.equal(assisted.document.provenance.collaboration, "ai");
  assert.equal(assisted.document.provenance.contributors[0].name, "A drafting system");

  const escapedLesson = {
    ...jsonLd,
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "First paragraph\\n\\nSecond paragraph", mediaType: "text/markdown" }
    }
  };
  const decoded = canonicalizePuzzleDocument(escapedLesson, {
    categoryRegistry: {
      "Political Science": { slug: "political-science" },
      Philosophy: { slug: "philosophy" }
    }
  });
  assert.deepEqual(decoded.errors, []);
  assert.equal(decoded.document.learningIntroduction.content.text, "First paragraph\n\nSecond paragraph");

  const unsupported = {
    ...jsonLd,
    layouts: { star: {} }
  };
  assert.match(
    unsupportedJsonLdFields(unsupported).join("; "),
    /layouts.*not representable/
  );
  const rejected = canonicalizePuzzleDocument(unsupported, { categoryRegistry: categories });
  assert.equal(rejected.document, null);
  assert.match(rejected.errors[0], /layouts/);

  const unknownEnvelopeField = { ...jsonLd, "@vendorNote": "do not drop" };
  assert.match(
    unsupportedJsonLdFields(unknownEnvelopeField).join("; "),
    /@vendorNote.*unknown top-level JSON-LD field/
  );
  const rejectedUnknown = canonicalizePuzzleDocument(unknownEnvelopeField, {
    categoryRegistry: categories
  });
  assert.equal(rejectedUnknown.document, null);
  assert.match(rejectedUnknown.errors[0], /@vendorNote/);

  const externalLesson = {
    ...jsonLd,
    learningIntroduction: {
      requirement: "recommended",
      content: { src: "lesson.md" }
    }
  };
  assert.match(
    unsupportedJsonLdFields(externalLesson).join("; "),
    /learningIntroduction\.content\.src.*materialized/
  );

  const unknownNodeMetadata = {
    ...jsonLd,
    clusters: jsonLd.clusters.map((cluster, index) =>
      index === 0 ? { ...cluster, "@vendorNote": "do not drop" } : cluster
    )
  };
  assert.match(
    unsupportedJsonLdFields(unknownNodeMetadata).join("; "),
    /clusters\[0\].@vendorNote.*metadata/
  );

  const colonTerm = {
    ...jsonLd,
    clusters: jsonLd.clusters.map((cluster, index) =>
      index === 0
        ? {
            ...cluster,
            termInfo: {
              ...cluster.termInfo,
              "cause:effect": { text: "A valid authored term label." }
            }
          }
        : cluster
    )
  };
  assert.deepEqual(unsupportedJsonLdFields(colonTerm), []);

  const malformed = canonicalizePuzzleDocument(
    puzzleDocument({ clusters: [
      {
        id: "one",
        name: "One",
        fact: "One fact.",
        seeds: ["a", "b"],
        floatingTerms: ["This term is intentionally much longer than forty characters"]
      },
      puzzleDocument().clusters[1]
    ] }),
    { categoryRegistry: categories }
  );
  assert.equal(malformed.document, null);
  assert.match(malformed.errors[0], /40 characters or fewer/);

  const planned = planRows([
    {
      source: "d1:puzzle_drafts",
      table: "puzzle_drafts",
      kind: "puzzle",
      id: legacy.id,
      row: { id: legacy.id, owner_subject: "author", revision: 1 },
      document: legacy
    },
    {
      source: "d1:content_drafts",
      table: "content_drafts",
      kind: "catalogue",
      id: "catalogue",
      document: { id: "catalogue", title: "Catalogue" }
    }
  ], categories);
  assert.equal(planned.changes.length, 1);
  assert.equal(planned.skipped.catalogue, 1);
  assert.deepEqual(planned.unresolved, []);

  const variantDraft = planRows([{
    source: "d1:puzzle_drafts",
    table: "puzzle_drafts",
    kind: "puzzle",
    id: "canonicalization-review-copy",
    row: { id: "canonicalization-review-copy", owner_subject: "author", revision: 1 },
    document: { ...legacy, category: "subject", categories: ["subject", "art"] }
  }], categories);
  assert.equal(variantDraft.unresolved.length, 0);
  assert.equal(variantDraft.changes.length, 1);

  // The read/storage boundary uses the same citation-safe JSON-LD conversion
  // as the migration, so opening an old draft cannot drop its bibliography.
  const stored = documentForStorage(jsonLd, { categoryRegistry: {
    "Political Science": { slug: "political-science" },
    Philosophy: { slug: "philosophy" }
  } });
  assert.equal(stored.info.citations.length, 1);
  assert.equal(documentForEditor(jsonLd).category, "Political Science");
}
