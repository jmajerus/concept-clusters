import assert from "node:assert/strict";
import {
  applyAuthoredDomain,
  applyAuthoredDomainPatch,
  assembleAuthoredDocument,
  assembleAuthoredDocumentFromDraftRow,
  assembleStoredDomainDocuments,
  domainColumnsForSave,
  partitionAuthoredDocument,
  projectAuthoredDocument,
  storedDomainDocuments
} from "../modules/authoringDomains.js";
import { assistanceStampScopes } from "../modules/authoringAssistanceLog.js";

export const name = "Authoring domains: focused projections, protected merges, and materialization";

const document = {
  id: "domain-fixture",
  title: "Domain fixture",
  category: "science",
  puzzleKind: "vocabulary-context",
  info: { text: "Core information" },
  clusters: [{
    id: "alpha",
    name: "Alpha",
    color: "teal",
    fact: "Alpha fact",
    seeds: ["one", "two"],
    floatingTerms: ["three"]
  }, {
    id: "beta",
    name: "Beta",
    color: "blue",
    fact: "Beta fact",
    seeds: ["four", "five"],
    floatingTerms: ["six"]
  }],
  bridges: [{
    id: "shared",
    term: "Shared",
    clusters: ["alpha", "beta"],
    fact: "Shared fact",
    relationKind: "contrast",
    direction: { kind: "outward" },
    idealTerms: { alpha: "one" }
  }],
  lenses: [{ id: "lens", prompt: "Prompt", explanation: "Explanation" }],
  learningIntroduction: {
    requirement: "optional",
    credit: "By Jane Doe",
    content: { text: "Introduction" }
  },
  creator: "Human creator",
  license: "CC-BY-4.0",
  derivedFrom: "source-puzzle",
  language: "en",
  provenance: {
    collaboration: "aiPrimary",
    contributors: ["Codex", "Jane Doe"]
  }
};

export async function run() {
  const domains = partitionAuthoredDocument(document);
  assert.deepEqual(assembleAuthoredDocument(domains), document);
  assert.equal(domains.content.bridges[0].relationKind, undefined);
  assert.equal(domains.pedagogy.bridges[0].fact, undefined);
  assert.deepEqual(domains.provenance, document.provenance);
  assert.equal(domains.content.puzzleKind, "vocabulary-context");
  assert.equal(domains.content.category, undefined);
  assert.equal(domains.classification.category, "science");
  assert.equal(domains.pedagogy.categories, undefined);

  const flagged = {
    ...document,
    board: { starFreeStrip: false, bridgePreconnect: true, sizeFactor: 1.2 }
  };
  const flaggedDomains = partitionAuthoredDocument(flagged);
  assert.equal(flaggedDomains.content.board, undefined);
  assert.deepEqual(flaggedDomains.administration, { board: flagged.board });
  assert.deepEqual(assembleAuthoredDocument(flaggedDomains), flagged);
  assert.equal(projectAuthoredDocument(flagged, "content").document.board, undefined);
  assert.equal(projectAuthoredDocument(flagged, "pedagogy").document.board, undefined);
  assert.equal(projectAuthoredDocument(flagged, "classification").document.board, undefined);
  assert.throws(
    () => applyAuthoredDomain(flagged, "content", {
      ...flaggedDomains.content,
      board: { bridgePreconnect: false }
    }),
    /board is protected/
  );
  const edited = applyAuthoredDomain(flagged, "content", flaggedDomains.content);
  assert.deepEqual(edited.board, flagged.board);
  assert.equal(
    storedDomainDocuments(edited).administration,
    JSON.stringify({ board: flagged.board })
  );
  const preserved = assembleAuthoredDocumentFromDraftRow({
    document_stale: 1,
    content_json: storedDomainDocuments(edited).content,
    pedagogy_json: storedDomainDocuments(edited).pedagogy,
    classification_json: storedDomainDocuments(edited).classification,
    provenance_json: storedDomainDocuments(edited).provenance,
    administration_json: storedDomainDocuments(edited).administration
  });
  assert.deepEqual(preserved.board, flagged.board);

  const shelfDocument = { ...document, tags: ["book"], level: "advanced" };
  const shelfDomains = partitionAuthoredDocument(shelfDocument);
  assert.deepEqual(shelfDomains.classification.tags, ["book"]);
  assert.equal(shelfDomains.classification.level, "advanced");
  assert.equal(shelfDomains.pedagogy.tags, undefined);
  assert.equal(shelfDomains.pedagogy.level, undefined);
  assert.throws(
    () => applyAuthoredDomain(shelfDocument, "pedagogy", {
      ...projectAuthoredDocument(shelfDocument, "pedagogy").document,
      tags: ["book"]
    }),
    /tags belongs to the classification domain/
  );
  const clearedLevel = applyAuthoredDomain(shelfDocument, "classification", {
    category: "science",
    tags: ["book"]
  });
  assert.deepEqual(clearedLevel.tags, ["book"]);
  assert.equal(clearedLevel.level, undefined);
  assert.equal(clearedLevel.language, "en");

  const fresh = storedDomainDocuments(shelfDocument);
  const legacyPedagogy = JSON.parse(fresh.pedagogy);
  const legacyClassification = JSON.parse(fresh.classification);
  legacyPedagogy.tags = legacyClassification.tags;
  legacyPedagogy.level = legacyClassification.level;
  delete legacyClassification.tags;
  delete legacyClassification.level;
  const lifted = assembleStoredDomainDocuments({
    content: JSON.parse(fresh.content),
    pedagogy: legacyPedagogy,
    classification: legacyClassification
  });
  assert.deepEqual(lifted.tags, ["book"]);
  assert.equal(lifted.level, "advanced");
  const preferred = assembleStoredDomainDocuments({
    content: JSON.parse(fresh.content),
    pedagogy: legacyPedagogy,
    classification: { ...legacyClassification, tags: ["kept"] }
  });
  assert.deepEqual(preferred.tags, ["kept"]);
  assert.equal(preferred.level, "advanced");
  const clearedStore = assembleStoredDomainDocuments({
    content: JSON.parse(fresh.content),
    pedagogy: { ...JSON.parse(fresh.pedagogy) },
    classification: legacyClassification
  });
  assert.equal(clearedStore.tags, undefined);
  assert.equal(clearedStore.level, undefined);
  assert.throws(
    () => assembleStoredDomainDocuments({
      content: JSON.parse(fresh.content),
      pedagogy: legacyPedagogy,
      classification: []
    }),
    /Classification domain must be a JSON object/
  );
  const rewritten = domainColumnsForSave({
    content: fresh.content,
    pedagogy: JSON.stringify(legacyPedagogy),
    classification: JSON.stringify(legacyClassification)
  }, "pedagogy", fresh);
  assert.deepEqual(JSON.parse(rewritten.classification).tags, ["book"]);
  assert.equal(JSON.parse(rewritten.classification).level, "advanced");
  assert.equal(JSON.parse(rewritten.pedagogy).tags, undefined);
  assert.equal(JSON.parse(rewritten.pedagogy).level, undefined);
  const stable = domainColumnsForSave({
    content: fresh.content,
    pedagogy: fresh.pedagogy,
    classification: fresh.classification
  }, "pedagogy", storedDomainDocuments({ ...shelfDocument, tags: ["other"] }));
  assert.deepEqual(JSON.parse(stable.classification).tags, ["book"]);

  const content = projectAuthoredDocument(document, "content");
  assert.equal(content.document.provenance, undefined);
  assert.equal(content.document.lenses, undefined);
  assert.equal(content.document.large, undefined);
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.equal(content.document[field], undefined);
  }
  assert.equal(content.document.language, undefined);
  assert.equal(content.document.puzzleKind, "vocabulary-context");
  assert.equal(content.document.category, undefined);
  assert.equal(content.context.category, "science");
  assert.equal(content.document.bridges[0].direction, undefined);

  const pedagogy = projectAuthoredDocument(document, "pedagogy");
  assert.equal(pedagogy.document.provenance, undefined);
  assert.equal(pedagogy.document.bridges[0].fact, undefined);
  assert.equal(pedagogy.document.bridges[0].relationKind, "contrast");
  assert.equal(pedagogy.document.learningIntroduction.credit, undefined);
  for (const field of ["creator", "license", "derivedFrom"]) {
    assert.equal(pedagogy.document[field], undefined);
  }
  assert.equal(pedagogy.document.language, "en");
  assert.equal(pedagogy.context.provenance, undefined);
  assert.equal(pedagogy.context.puzzleKind, "vocabulary-context");
  assert.equal(pedagogy.context.category, "science");
  assert.equal(pedagogy.context.bridges[0].fact, "Shared fact");

  const contentEdit = applyAuthoredDomain(document, "content", {
    ...content.document,
    title: "Edited content"
  });
  assert.equal(contentEdit.title, "Edited content");
  assert.equal(contentEdit.category, "science");
  assert.equal(contentEdit.puzzleKind, "vocabulary-context");
  assert.deepEqual(contentEdit.provenance, document.provenance);
  assert.equal(contentEdit.bridges[0].relationKind, "contrast");
  for (const field of ["creator", "license", "derivedFrom", "language"]) {
    assert.equal(contentEdit[field], document[field]);
  }

  const pedagogyEdit = applyAuthoredDomain(document, "pedagogy", {
    ...pedagogy.document,
    lenses: []
  });
  assert.deepEqual(pedagogyEdit.clusters, document.clusters);
  assert.deepEqual(pedagogyEdit.provenance, document.provenance);
  assert.deepEqual(pedagogyEdit.lenses, []);
  assert.equal(pedagogyEdit.bridges[0].relationKind, "contrast");
  assert.equal(pedagogyEdit.learningIntroduction.credit, "By Jane Doe");
  for (const field of ["creator", "license", "derivedFrom", "language"]) {
    assert.equal(pedagogyEdit[field], document[field]);
  }
  assert.equal(contentEdit.large, undefined);

  const classification = projectAuthoredDocument(document, "classification");
  assert.equal(classification.document.category, "science");
  assert.equal(classification.document.lenses, undefined);
  assert.equal(classification.context.id, "domain-fixture");
  assert.equal(classification.context.title, "Domain fixture");
  assert.equal(classification.context.clusters, undefined);
  const classified = applyAuthoredDomain(document, "classification", {
    category: "biology",
    categories: ["biology", "science"],
    subcategories: { biology: "foundations" }
  });
  assert.equal(classified.category, "biology");
  assert.deepEqual(classified.categories, ["biology", "science"]);
  assert.deepEqual(classified.subcategories, { biology: "foundations" });
  assert.deepEqual(classified.lenses, document.lenses);
  assert.equal(classified.title, document.title);
  const cleared = applyAuthoredDomain(classified, "classification", {
    category: "biology"
  });
  assert.equal(cleared.categories, undefined);
  assert.equal(cleared.subcategories, undefined);
  assert.equal(cleared.category, "biology");
  assert.deepEqual(cleared.lenses, document.lenses);
  assert.throws(
    () => applyAuthoredDomain(document, "content", {
      ...content.document,
      category: "biology"
    }),
    /category belongs to the classification domain/
  );

  const { info: _contentInfo, ...contentWithoutInfo } = content.document;
  assert.equal(
    applyAuthoredDomain(document, "content", contentWithoutInfo).info,
    undefined
  );
  const { lenses: _pedagogyLenses, ...pedagogyWithoutLenses } = pedagogy.document;
  assert.equal(
    applyAuthoredDomain(document, "pedagogy", pedagogyWithoutLenses).lenses,
    undefined
  );

  assert.throws(
    () => applyAuthoredDomain(document, "content", {
      ...content.document,
      provenance: document.provenance
    }),
    /provenance is protected/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "content", {
      ...content.document,
      generativeAssistance: [{ system: "Codex" }]
    }),
    /retired field generativeAssistance/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "content", {
      ...content.document,
      bridges: [{ ...content.document.bridges[0], relationKind: "contrast" }]
    }),
    /belongs to the pedagogy domain/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogy.document,
      clusters: document.clusters
    }),
    /belongs to the content domain/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogy.document,
      puzzleKind: "trivia-quiz"
    }),
    /puzzleKind belongs to the content domain/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogy.document,
      bridges: [{ ...pedagogy.document.bridges[0], term: "Renamed bridge" }]
    }),
    /term belongs to the content domain/
  );
  assert.throws(
    () => applyAuthoredDomain(document, "pedagogy", {
      ...pedagogy.document,
      learningIntroduction: {
        ...pedagogy.document.learningIntroduction,
        credit: "By an untrusted editor"
      }
    }),
    /learningIntroduction\.credit is human-managed/
  );

  const withUnannotatedBridge = {
    ...document,
    bridges: [
      document.bridges[0],
      {
        id: "plain",
        term: "Plain",
        clusters: ["alpha", "beta"],
        fact: "Plain fact"
      }
    ]
  };
  const unannotatedPedagogy = projectAuthoredDocument(withUnannotatedBridge, "pedagogy");
  assert.equal(unannotatedPedagogy.document.bridges.length, 2);
  assert.equal(unannotatedPedagogy.document.bridges[1].term, "Plain");
  assert.equal(
    applyAuthoredDomain(withUnannotatedBridge, "pedagogy", unannotatedPedagogy.document)
      .bridges[1].fact,
    "Plain fact"
  );

  const stored = storedDomainDocuments(document);
  assert.equal(typeof stored.content, "string");
  assert.equal(typeof stored.pedagogy, "string");
  assert.equal(typeof stored.classification, "string");
  assert.equal(typeof stored.provenance, "string");
  assert.deepEqual(assistanceStampScopes(document, { domain: "content" }), ["content"]);
  assert.deepEqual(assistanceStampScopes(document, { domain: "classification" }), ["classification"]);
  assert.deepEqual(assistanceStampScopes(document, { domain: "pedagogy" }), ["pedagogy"]);
  assert.deepEqual(assistanceStampScopes(document), ["puzzle", "learningIntroduction"]);

  const legacyMetadata = {
    ...document,
    dateCreated: "2026-01-01",
    dateModified: "2026-01-02",
    version: 3,
    learningIntroduction: {
      ...document.learningIntroduction,
      revision: 9
    }
  };
  const legacyDomains = partitionAuthoredDocument(legacyMetadata);
  assert.equal(legacyDomains.content.dateCreated, undefined);
  assert.equal(legacyDomains.pedagogy.dateModified, undefined);
  assert.equal(legacyDomains.pedagogy.learningIntroduction.revision, undefined);
  assert.equal(assembleAuthoredDocument(legacyDomains).version, undefined);

  // Agent domain saves: pedagogy and classification are RFC 7396 merge
  // patches, so a pass-shaped payload cannot erase another pass's fields.
  const lensOnly = applyAuthoredDomainPatch(document, "pedagogy", {
    lenses: [{ id: "lens", prompt: "New prompt", explanation: "Explanation" }]
  });
  assert.equal(lensOnly.document.lenses[0].prompt, "New prompt");
  assert.equal(lensOnly.document.bridges[0].relationKind, "contrast");
  assert.deepEqual(lensOnly.document.bridges[0].idealTerms, { alpha: "one" });
  assert.equal(lensOnly.document.language, "en");
  assert.equal(lensOnly.document.learningIntroduction.credit, "By Jane Doe");
  assert.deepEqual(lensOnly.cleared, []);

  const twoBridges = {
    ...document,
    bridges: [document.bridges[0], {
      id: "plain",
      term: "Plain",
      clusters: ["alpha", "beta"],
      fact: "Plain fact",
      relationKind: "foundation"
    }]
  };
  const annotated = applyAuthoredDomainPatch(twoBridges, "pedagogy", {
    bridges: [{ term: "Plain", relationKind: "dynamic" }, { id: "shared", idealTerms: null }]
  });
  assert.equal(annotated.document.bridges[1].relationKind, "dynamic");
  assert.equal(annotated.document.bridges[1].fact, "Plain fact");
  assert.equal(annotated.document.bridges[0].relationKind, "contrast");
  assert.equal(annotated.document.bridges[0].idealTerms, undefined);
  assert.deepEqual(annotated.document.lenses, document.lenses);
  assert.deepEqual(annotated.cleared, ["bridges[shared].idealTerms"]);

  const unannotated = applyAuthoredDomainPatch(twoBridges, "pedagogy", { bridges: null });
  assert.equal(unannotated.document.bridges[0].relationKind, undefined);
  assert.equal(unannotated.document.bridges[1].fact, "Plain fact");
  assert.deepEqual(unannotated.cleared, [
    "bridges[shared].relationKind",
    "bridges[shared].direction",
    "bridges[shared].idealTerms",
    "bridges[plain].relationKind"
  ]);

  const lessonEdit = applyAuthoredDomainPatch(document, "pedagogy", {
    learningIntroduction: { content: { text: "Rewritten" } },
    language: null
  });
  assert.equal(lessonEdit.document.learningIntroduction.content.text, "Rewritten");
  assert.equal(lessonEdit.document.learningIntroduction.requirement, "optional");
  assert.equal(lessonEdit.document.learningIntroduction.credit, "By Jane Doe");
  assert.equal(lessonEdit.document.language, undefined);
  assert.deepEqual(lessonEdit.cleared, ["language"]);

  assert.throws(
    () => applyAuthoredDomainPatch(document, "pedagogy", {
      bridges: [{ term: "Missing", relationKind: "dynamic" }]
    }),
    /must identify an existing content bridge/
  );
  assert.throws(
    () => applyAuthoredDomainPatch(document, "pedagogy", {
      bridges: [{ relationKind: "dynamic" }]
    }),
    /must name its item by id or term/
  );
  assert.throws(
    () => applyAuthoredDomainPatch(document, "pedagogy", {
      bridges: [{ id: "shared", fact: null }]
    }),
    /fact belongs to the content domain/
  );

  const shelved = {
    ...document,
    categories: ["science", "biology"],
    subcategories: { science: "foundations", biology: "genomics" },
    tags: ["book"]
  };
  const shelf = applyAuthoredDomainPatch(shelved, "classification", {
    subcategories: { biology: null },
    tags: null
  });
  assert.equal(shelf.document.category, "science");
  assert.deepEqual(shelf.document.categories, ["science", "biology"]);
  assert.deepEqual(shelf.document.subcategories, { science: "foundations" });
  assert.equal(shelf.document.tags, undefined);
  assert.deepEqual(shelf.cleared, ["subcategories.biology", "tags"]);
  assert.throws(
    () => applyAuthoredDomainPatch(shelved, "classification", { lenses: null }),
    /lenses belongs to the pedagogy domain/
  );

  // Content follows the same rule: a one-field save keeps the board.
  const retitled = applyAuthoredDomainPatch(document, "content", { title: "Retitled" });
  assert.equal(retitled.document.title, "Retitled");
  assert.deepEqual(retitled.document.clusters.map(cluster => cluster.id), ["alpha", "beta"]);
  assert.equal(retitled.document.bridges[0].fact, "Shared fact");
  assert.equal(retitled.document.bridges[0].relationKind, "contrast");
  assert.equal(retitled.document.info.text, "Core information");
  assert.deepEqual(retitled.cleared, []);

  const noInfo = applyAuthoredDomainPatch(document, "content", { info: null });
  assert.equal(noInfo.document.info, undefined);
  assert.deepEqual(noInfo.cleared, ["info"]);

  // Keyed lists merge by item identity; a partial list keeps the rest.
  const contentClusters = projectAuthoredDocument(document, "content").document.clusters;
  const partial = applyAuthoredDomainPatch(document, "content", {
    clusters: [{ id: "alpha", seeds: ["one"], floatingTerms: ["three", "two"] }]
  });
  assert.deepEqual(partial.document.clusters.map(cluster => cluster.id), ["alpha", "beta"]);
  assert.equal(partial.document.clusters[0].fact, "Alpha fact");
  assert.deepEqual(partial.cleared, ["clusters[alpha].seeds[two]"]);
  assert.deepEqual(partial.kept, []);

  const byName = applyAuthoredDomainPatch(document, "content", {
    clusters: [{ name: "Beta", fact: "New beta fact" }],
    bridges: [{ term: "Shared", fact: "New shared fact" }]
  });
  assert.equal(byName.document.clusters[1].fact, "New beta fact");
  assert.equal(byName.document.bridges[0].fact, "New shared fact");
  assert.equal(byName.document.bridges[0].relationKind, "contrast");

  const deleted = applyAuthoredDomainPatch(document, "content", {
    clusters: [{ id: "beta", $patch: "delete" }]
  });
  assert.deepEqual(deleted.document.clusters.map(cluster => cluster.id), ["alpha"]);
  assert.deepEqual(deleted.cleared, ["clusters[beta]"]);
  assert.equal(JSON.stringify(deleted.document).includes("$patch"), false);

  const reordered = applyAuthoredDomainPatch(document, "content", {
    clusters: [{ $patch: "replace" }, contentClusters[1], contentClusters[0]]
  });
  assert.deepEqual(reordered.document.clusters.map(cluster => cluster.id), ["beta", "alpha"]);
  assert.deepEqual(reordered.cleared, []);

  const added = applyAuthoredDomainPatch(document, "content", {
    clusters: [{ id: "gamma", name: "Gamma", fact: "Gamma fact", seeds: ["g1", "g2"] }]
  });
  assert.deepEqual(added.document.clusters.map(cluster => cluster.id), ["alpha", "beta", "gamma"]);

  // A term the patch moves off a cluster takes its termInfo with it, unless
  // the patch sets that note on purpose.
  const noted = {
    ...document,
    clusters: [
      { ...document.clusters[0], termInfo: { one: "Note one", three: "Note three" } },
      document.clusters[1]
    ]
  };
  const moved = applyAuthoredDomainPatch(noted, "content", {
    clusters: [{ id: "alpha", floatingTerms: ["seven"] }]
  });
  assert.deepEqual(moved.document.clusters[0].termInfo, { one: "Note one" });
  assert.deepEqual(moved.cleared, [
    "clusters[alpha].floatingTerms[three]",
    "clusters[alpha].termInfo.three"
  ]);
  const keptNote = applyAuthoredDomainPatch(noted, "content", {
    clusters: [{ id: "alpha", floatingTerms: ["seven"], termInfo: { three: "Still here" } }]
  });
  assert.equal(keptNote.document.clusters[0].termInfo.three, "Still here");

  // Naming most of a keyed list but not all of it is reported as kept.
  const threeLenses = {
    ...document,
    lenses: [
      { id: "l1", prompt: "One", explanation: "E" },
      { id: "l2", prompt: "Two", explanation: "E" },
      { id: "l3", prompt: "Three", explanation: "E" }
    ]
  };
  const mostly = applyAuthoredDomainPatch(threeLenses, "pedagogy", {
    lenses: [{ id: "l1", prompt: "Uno" }, { id: "l2", prompt: "Dos" }]
  });
  assert.deepEqual(mostly.document.lenses.map(lens => lens.prompt), ["Uno", "Dos", "Three"]);
  assert.deepEqual(mostly.kept, ["lenses[l3]"]);

  assert.throws(
    () => applyAuthoredDomainPatch(document, "classification", {
      tags: [{ $patch: "replace" }]
    }),
    /tags replaces whole/
  );
  assert.throws(
    () => applyAuthoredDomainPatch(document, "content", {
      info: { $patch: "replace", text: "x" }
    }),
    /info\.\$patch applies only to items of keyed lists/
  );
  assert.throws(
    () => applyAuthoredDomainPatch(document, "content", {
      clusters: [{ id: "alpha", $patch: "merge" }]
    }),
    /must be "delete" on an item or "replace"/
  );

  assert.throws(
    () => applyAuthoredDomainPatch(document, "content", { id: null }),
    /id is set when a draft is created/
  );
  assert.throws(
    () => applyAuthoredDomainPatch(document, "content", { lenses: [] }),
    /lenses belongs to the pedagogy domain/
  );
}
