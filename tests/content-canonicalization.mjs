import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalizePuzzleDocument, unsupportedJsonLdFields } from "../modules/contentCanonicalization.js";
import {
  documentForEditor,
  documentForStorage
} from "../modules/authoredPuzzleDocument.js";
import {
  applyGitPlan,
  planGit,
  planRows
} from "../tools/canonicalize-content.mjs";
import { formattedJson, generatedPuzzleModule } from "../modules/publicationArtifacts.js";
import { puzzleFromAuthoredDocument } from "../modules/simplifiedPuzzleSchema.js";

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
    },
    "Political Science": { slug: "political-science" },
    Philosophy: { slug: "philosophy" }
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

async function makeGitFixture({ bothSources = false, conflictingCanonical = false } = {}) {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "concept-clusters-canonicalization-test-"));
  const contentDir = join(repositoryRoot, "content", "puzzles");
  const puzzleDir = join(repositoryRoot, "puzzles", "fixture");
  const modulesDir = join(repositoryRoot, "modules");
  await Promise.all([
    mkdir(contentDir, { recursive: true }),
    mkdir(puzzleDir, { recursive: true }),
    mkdir(modulesDir, { recursive: true })
  ]);
  await writeFile(join(modulesDir, "puzzleManifest.js"),
    "export function definePuzzle(_url, puzzle) { return puzzle; }\n");
  await writeFile(join(repositoryRoot, "puzzles", "index.js"),
    "export const PUZZLES = [\n];\n");
  const categories = {
    "Political Science": { slug: "political-science" },
    Philosophy: { slug: "philosophy" }
  };
  const interchange = jsonLdFixture();
  const canonical = canonicalizePuzzleDocument(interchange, {
    categoryRegistry: categories
  }).document;
  const modulePath = join(puzzleDir, "canonicalization-fixture.js");
  const { puzzle } = puzzleFromAuthoredDocument(canonical, {
    categoryRegistry: categories
  });
  await writeFile(modulePath, generatedPuzzleModule(
    puzzle,
    "content/puzzles/canonicalization-fixture.ccpuzzle.json",
    "puzzles/fixture/canonicalization-fixture.js"
  ));
  const manifestEntry = {
    id: "canonicalization-fixture",
    module: "./fixture/canonicalization-fixture.js"
  };
  await writeFile(join(repositoryRoot, "puzzles", "manifest.js"),
    `export const PUZZLE_MANIFEST = ${JSON.stringify([manifestEntry])};\n` +
    "export const PUZZLE_MANIFEST_FAILURES = [];\n");
  const jsonLdPath = join(contentDir, "canonicalization-fixture.ccpuzzle.jsonld");
  const canonicalPath = join(contentDir, "canonicalization-fixture.ccpuzzle.json");
  await writeFile(jsonLdPath, formattedJson(interchange));
  if (bothSources) {
    const document = conflictingCanonical
      ? { ...canonical, title: "Conflicting canonical source" }
      : canonical;
    await writeFile(canonicalPath, formattedJson(document));
  }
  return {
    repositoryRoot,
    categories,
    interchange,
    canonical,
    jsonLdPath,
    canonicalPath,
    modulePath,
    manifestPath: join(repositoryRoot, "puzzles", "manifest.js")
  };
}

async function removeGitFixture(fixture) {
  await rm(fixture.repositoryRoot, { recursive: true, force: true });
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

  // Category canonicalization must never invent a slug for an unknown
  // display title, and a retired alias shared by two categories must remain
  // unresolved rather than choosing one arbitrarily.
  const unknownCategory = canonicalizePuzzleDocument({
    ...legacy,
    category: "D1 Only Subject"
  }, { categoryRegistry: categories });
  assert.equal(unknownCategory.document, null);
  assert.match(unknownCategory.errors[0], /refusing slug fallback/);
  const ambiguousCategoryRegistry = {
    ...categories,
    "Other Subject": {
      slug: "other-subject",
      previousTitles: ["Old Subject"]
    }
  };
  const ambiguousCategory = canonicalizePuzzleDocument(legacy, {
    categoryRegistry: ambiguousCategoryRegistry
  });
  assert.equal(ambiguousCategory.document, null);
  assert.match(ambiguousCategory.errors[0], /more than one current category/);

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

  // Two older JSON-LD drafts used `related.entries[].puzzleId` under the
  // nonstandard top-level `related` key.  Preserve the relationship while
  // translating it to the current JSON-LD shape before conversion.
  const legacyRelated = jsonLdFixture();
  legacyRelated.related = {
    entries: [{
      puzzleId: "related-puzzle",
      reason: "A related lesson."
    }]
  };
  const repairedRelated = canonicalizePuzzleDocument(legacyRelated, {
    categoryRegistry: {
      "Political Science": { slug: "political-science" },
      Philosophy: { slug: "philosophy" }
    }
  });
  assert.deepEqual(repairedRelated.errors, []);
  assert.ok(repairedRelated.reasons.includes("jsonld-related-shape"));
  assert.deepEqual(repairedRelated.document.relatedPuzzles, {
    entries: [{ id: "related-puzzle", reason: "A related lesson." }]
  });
  assert.equal(repairedRelated.document.related, undefined);

  // A legacy simplified draft can retain JSON-LD's Markdown annotation too;
  // it is metadata, not authored content, so remove only the known value.
  const legacyMediaType = puzzleDocument({
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Lesson text.", mediaType: "text/markdown" }
    }
  });
  const repairedMediaType = canonicalizePuzzleDocument(legacyMediaType, {
    categoryRegistry: categories
  });
  assert.deepEqual(repairedMediaType.errors, []);
  assert.ok(repairedMediaType.reasons.includes("learning-media-type"));
  assert.equal(repairedMediaType.document.learningIntroduction.content.mediaType, undefined);

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

  const unsupportedMediaType = {
    ...jsonLd,
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Lesson text.", mediaType: "text/html" }
    }
  };
  assert.match(
    unsupportedJsonLdFields(unsupportedMediaType).join("; "),
    /learningIntroduction\.content\.mediaType.*text\/markdown/
  );
  const rejectedMediaType = canonicalizePuzzleDocument(unsupportedMediaType, {
    categoryRegistry: categories
  });
  assert.equal(rejectedMediaType.document, null);

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

  const unknownPlainNodeField = {
    ...jsonLd,
    clusters: jsonLd.clusters.map((cluster, index) =>
      index === 0 ? { ...cluster, vendorNote: "do not drop" } : cluster
    )
  };
  assert.match(
    unsupportedJsonLdFields(unknownPlainNodeField).join("; "),
    /clusters\[0\]\.vendorNote.*unknown cluster field/
  );
  const rejectedPlainNodeField = canonicalizePuzzleDocument(unknownPlainNodeField, {
    categoryRegistry: categories
  });
  assert.equal(rejectedPlainNodeField.document, null);

  const unknownLensField = {
    ...jsonLd,
    lensMode: "assignment",
    lenses: [{
      "@id": "#lens-example",
      "@type": "Lens",
      id: "example",
      prompt: "Choose.",
      explanation: "This explains the choice.",
      vendorNote: "do not drop"
    }]
  };
  assert.match(
    unsupportedJsonLdFields(unknownLensField).join("; "),
    /lenses\[0\]\.vendorNote.*unknown lens field/
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

  const splitRelated = planRows([{
    source: "d1:puzzle_drafts",
    table: "puzzle_drafts",
    kind: "puzzle",
    id: legacy.id,
    row: { id: legacy.id, owner_subject: "author", revision: 1 },
    document: {
      ...legacy,
      relatedPuzzles: {
        entries: [{ id: "missing-puzzle", reason: "Not in this corpus." }]
      }
    }
  }], categories, { knownPuzzleIds: new Set([legacy.id]) });
  assert.equal(splitRelated.changes.length, 1);
  assert.deepEqual(splitRelated.unresolved, []);

  const selfRelated = planRows([{
    source: "d1:puzzle_drafts",
    table: "puzzle_drafts",
    kind: "puzzle",
    id: legacy.id,
    row: { id: legacy.id, owner_subject: "author", revision: 1 },
    document: {
      ...legacy,
      relatedPuzzles: {
        entries: [{ id: legacy.id, reason: "Self-link should still fail." }]
      }
    }
  }], categories, { knownPuzzleIds: new Set([legacy.id]) });
  assert.equal(selfRelated.changes.length, 0);
  assert.match(selfRelated.unresolved[0].reason, /lists itself/);

  const unknownCategoryPlan = planRows([{
    source: "d1:puzzle_drafts",
    table: "puzzle_drafts",
    kind: "puzzle",
    id: legacy.id,
    row: { id: legacy.id, owner_subject: "author", revision: 1 },
    document: { ...legacy, category: "D1 Only Subject" }
  }], categories);
  assert.equal(unknownCategoryPlan.changes.length, 0);
  assert.match(unknownCategoryPlan.unresolved[0].reason, /refusing slug fallback/);

  const unknownGitFixture = await makeGitFixture();
  try {
    const unknownGitPlan = await planGit([{
      source: "git:content/puzzles",
      table: "git",
      kind: "puzzle",
      id: unknownGitFixture.canonical.id,
      sourceId: unknownGitFixture.canonical.id,
      path: unknownGitFixture.canonicalPath,
      document: { ...unknownGitFixture.canonical, category: "D1 Only Subject" }
    }], unknownGitFixture.categories, {
      repositoryRoot: unknownGitFixture.repositoryRoot,
      knownPuzzleIds: new Set([unknownGitFixture.canonical.id])
    });
    assert.equal(unknownGitPlan.changes.length, 0);
    assert.match(unknownGitPlan.unresolved[0].reason, /refusing slug fallback/);
  } finally {
    await removeGitFixture(unknownGitFixture);
  }

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

  // A JSON-LD replacement is planned as an add+delete pair and can be
  // applied transactionally in an isolated repository.
  const replacementFixture = await makeGitFixture();
  try {
    // Force the generated-artifact side of the plan so the dry-run manifest
    // preview is exercised as well as the JSON-LD source replacement.
    await writeFile(replacementFixture.modulePath, "// stale generated module\n");
    const replacementPlan = await planGit([{
      source: "git-interchange:content/puzzles",
      table: "git-interchange",
      kind: "puzzle",
      id: replacementFixture.canonical.id,
      sourceId: replacementFixture.canonical.id,
      path: replacementFixture.jsonLdPath,
      document: replacementFixture.interchange
    }], replacementFixture.categories, {
      repositoryRoot: replacementFixture.repositoryRoot
    });
    assert.deepEqual(replacementPlan.unresolved, []);
    assert.ok(replacementPlan.changes.some(change =>
      change.relativePath.endsWith(".ccpuzzle.json") && change.content !== null
    ));
    assert.ok(replacementPlan.changes.some(change =>
      change.relativePath.endsWith(".ccpuzzle.jsonld") && change.content === null
    ));
    assert.equal(replacementPlan.manifestPlanned, true);
    const originalManifest = await readFile(replacementFixture.manifestPath, "utf8");
    await applyGitPlan(replacementPlan, {
      validate: async () => {},
      buildManifest: async ({ repositoryRoot }) => {
        await writeFile(join(repositoryRoot, "puzzles", "manifest.js"),
          `${originalManifest}// rebuilt\n`);
      },
      repositoryRoot: replacementFixture.repositoryRoot
    });
    assert.equal(await readFile(replacementFixture.jsonLdPath, "utf8").catch(() => null), null);
    assert.equal(
      JSON.parse(await readFile(replacementFixture.canonicalPath, "utf8")).id,
      replacementFixture.canonical.id
    );
  } finally {
    await removeGitFixture(replacementFixture);
  }

  // A duplicate left by an interrupted run is resumable only when the
  // canonical target already equals the planned content.
  const resumedFixture = await makeGitFixture({ bothSources: true });
  try {
    const rows = [
      {
        source: "git:content/puzzles",
        table: "git",
        kind: "puzzle",
        id: resumedFixture.canonical.id,
        sourceId: resumedFixture.canonical.id,
        path: resumedFixture.canonicalPath,
        document: resumedFixture.canonical
      },
      {
        source: "git-interchange:content/puzzles",
        table: "git-interchange",
        kind: "puzzle",
        id: resumedFixture.canonical.id,
        sourceId: resumedFixture.canonical.id,
        path: resumedFixture.jsonLdPath,
        document: resumedFixture.interchange
      }
    ];
    const resumedPlan = await planGit(rows, resumedFixture.categories, {
      repositoryRoot: resumedFixture.repositoryRoot
    });
    assert.deepEqual(resumedPlan.unresolved, []);
    assert.ok(resumedPlan.changes.some(change =>
      change.relativePath.endsWith(".ccpuzzle.jsonld") &&
      change.reasons.includes("jsonld-source-resumed")
    ));

    const conflictingFixture = await makeGitFixture({
      bothSources: true,
      conflictingCanonical: true
    });
    try {
      const conflictPlan = await planGit([
        { ...rows[0], path: conflictingFixture.canonicalPath },
        { ...rows[1], path: conflictingFixture.jsonLdPath }
      ], conflictingFixture.categories, {
        repositoryRoot: conflictingFixture.repositoryRoot
      });
      assert.match(conflictPlan.unresolved[0].reason, /disagree|different content/);
    } finally {
      await removeGitFixture(conflictingFixture);
    }
  } finally {
    await removeGitFixture(resumedFixture);
  }

  const mismatchFixture = await makeGitFixture();
  try {
    const mismatchPlan = await planGit([{
      source: "git:content/puzzles",
      table: "git",
      kind: "puzzle",
      id: mismatchFixture.canonical.id,
      sourceId: "wrong-filename",
      path: mismatchFixture.canonicalPath,
      document: mismatchFixture.canonical
    }], mismatchFixture.categories, {
      repositoryRoot: mismatchFixture.repositoryRoot
    });
    assert.match(mismatchPlan.unresolved[0].reason, /source filename id/);
  } finally {
    await removeGitFixture(mismatchFixture);
  }

  // The stale guard covers unchanged inputs too, not only files scheduled for
  // replacement.  Mutating the manifest after planning must abort before any
  // write occurs.
  const staleFixture = await makeGitFixture();
  try {
    const stalePlan = await planGit([{
      source: "git-interchange:content/puzzles",
      table: "git-interchange",
      kind: "puzzle",
      id: staleFixture.canonical.id,
      sourceId: staleFixture.canonical.id,
      path: staleFixture.jsonLdPath,
      document: staleFixture.interchange
    }], staleFixture.categories, {
      repositoryRoot: staleFixture.repositoryRoot
    });
    const manifestBefore = await readFile(staleFixture.manifestPath, "utf8");
    await writeFile(staleFixture.manifestPath, `${manifestBefore}// changed\n`);
    await assert.rejects(
      applyGitPlan(stalePlan, {
        validate: async () => {},
        buildManifest: async () => {},
        repositoryRoot: staleFixture.repositoryRoot
      }),
      /plan is stale.*manifest\.js/
    );
    assert.equal(await readFile(staleFixture.jsonLdPath, "utf8"), formattedJson(staleFixture.interchange));
  } finally {
    await removeGitFixture(staleFixture);
  }

  // Validation failure after the writes rolls back source, generated module,
  // and manifest changes as one transaction.
  const rollbackFixture = await makeGitFixture();
  try {
    const rollbackPlan = await planGit([{
      source: "git-interchange:content/puzzles",
      table: "git-interchange",
      kind: "puzzle",
      id: rollbackFixture.canonical.id,
      sourceId: rollbackFixture.canonical.id,
      path: rollbackFixture.jsonLdPath,
      document: rollbackFixture.interchange
    }], rollbackFixture.categories, {
      repositoryRoot: rollbackFixture.repositoryRoot
    });
    const moduleBefore = await readFile(rollbackFixture.modulePath, "utf8");
    const manifestBefore = await readFile(rollbackFixture.manifestPath, "utf8");
    await assert.rejects(
      applyGitPlan(rollbackPlan, {
        validate: async () => { throw new Error("intentional validation failure"); },
        buildManifest: async ({ repositoryRoot }) => {
          await writeFile(join(repositoryRoot, "puzzles", "manifest.js"),
            `${manifestBefore}// rebuilt\n`);
        },
        repositoryRoot: rollbackFixture.repositoryRoot
      }),
      /intentional validation failure/
    );
    assert.equal(await readFile(rollbackFixture.jsonLdPath, "utf8"), formattedJson(rollbackFixture.interchange));
    assert.equal(await readFile(rollbackFixture.modulePath, "utf8"), moduleBefore);
    assert.equal(await readFile(rollbackFixture.manifestPath, "utf8"), manifestBefore);
  } finally {
    await removeGitFixture(rollbackFixture);
  }
}
