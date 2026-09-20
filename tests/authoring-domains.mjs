import assert from "node:assert/strict";
import {
  applyAuthoredDomain,
  assembleAuthoredDocument,
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
  large: true,
  info: { text: "Core information" },
  clusters: [{
    id: "alpha",
    name: "Alpha",
    color: "teal",
    fact: "Alpha fact",
    seeds: ["one", "two"],
    floatingTerms: ["three"]
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

  const content = projectAuthoredDocument(document, "content");
  assert.equal(content.document.provenance, undefined);
  assert.equal(content.document.lenses, undefined);
  assert.equal(content.document.large, undefined);
  assert.equal(content.document.puzzleKind, "vocabulary-context");
  assert.equal(content.document.bridges[0].direction, undefined);

  const pedagogy = projectAuthoredDocument(document, "pedagogy");
  assert.equal(pedagogy.document.provenance, undefined);
  assert.equal(pedagogy.document.bridges[0].fact, undefined);
  assert.equal(pedagogy.document.bridges[0].relationKind, "contrast");
  assert.equal(pedagogy.document.learningIntroduction.credit, undefined);
  assert.equal(pedagogy.context.provenance, undefined);
  assert.equal(pedagogy.context.puzzleKind, "vocabulary-context");
  assert.equal(pedagogy.context.bridges[0].fact, "Shared fact");

  const contentEdit = applyAuthoredDomain(document, "content", {
    ...content.document,
    title: "Edited content"
  });
  assert.equal(contentEdit.title, "Edited content");
  assert.equal(contentEdit.puzzleKind, "vocabulary-context");
  assert.deepEqual(contentEdit.provenance, document.provenance);
  assert.equal(contentEdit.bridges[0].relationKind, "contrast");

  const pedagogyEdit = applyAuthoredDomain(document, "pedagogy", {
    ...pedagogy.document,
    lenses: []
  });
  assert.deepEqual(pedagogyEdit.clusters, document.clusters);
  assert.deepEqual(pedagogyEdit.provenance, document.provenance);
  assert.deepEqual(pedagogyEdit.lenses, []);
  assert.equal(pedagogyEdit.bridges[0].relationKind, "contrast");
  assert.equal(pedagogyEdit.learningIntroduction.credit, "By Jane Doe");
  assert.equal(contentEdit.large, true);

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
    /learningIntroduction\.credit is protected/
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
  assert.equal(typeof stored.provenance, "string");
  assert.deepEqual(assistanceStampScopes(document, { domain: "content" }), ["content"]);
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
}
