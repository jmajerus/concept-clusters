import assert from "node:assert/strict";
import {
  DraftFieldError,
  applyDraftFieldEdit,
  applyDraftFieldValue,
  parseFieldEditForm,
  persistDraftFieldEdit,
  persistDraftCanonicalForm
} from "../modules/draftReviewEdit.js";
import { resolveLessonByline } from "../modules/authoringProvenance.js";

export const name = "draft review edit: field addressing, revert, and OCC persist";

const document = {
  id: "edit-fixture",
  title: "Old title",
  info: "String info.",
  generativeAssistance: [{ system: "Cursor", date: "2026-08-01" }],
  clusters: [{
    id: "alpha",
    name: "Alpha",
    fact: "Alpha fact.",
    termInfo: { a: "term note" },
    terms: ["a"]
  }],
  bridges: [{ id: "link", term: "link", fact: "Bridge fact." }],
  lenses: [{
    id: "lens-1",
    prompt: "Prompt?",
    explanation: "Because.",
    reasons: { a: "reason a" }
  }],
  learningIntroduction: {
    title: "Intro",
    summary: "Sum",
    content: { text: "Body" }
  }
};

const published = {
  ...document,
  title: "Published title",
  info: "Published info.",
  clusters: [{
    ...document.clusters[0],
    fact: "Published fact."
  }]
};

export async function run() {
  const patched = applyDraftFieldValue(document, {
    section: "puzzle", field: "title"
  }, "New title");
  assert.equal(patched.title, "New title");
  assert.equal(document.title, "Old title");
  assert.deepEqual(patched.generativeAssistance, document.generativeAssistance);

  const infoText = applyDraftFieldValue(document, {
    section: "puzzle", field: "info.text"
  }, "Still a string.");
  assert.equal(infoText.info, "Still a string.");

  const withLinks = applyDraftFieldValue(document, {
    section: "puzzle", field: "info.links"
  }, [{ href: "https://example.org/info" }, { href: "https://example.org/related", label: "Related" }]);
  assert.deepEqual(withLinks.info, {
    text: "String info.",
    links: [
      { href: "https://example.org/info" },
      { href: "https://example.org/related", label: "Related" }
    ]
  });

  const withCitations = applyDraftFieldValue(document, {
    section: "puzzle", field: "info.citations"
  }, [{ title: "Source", author: "Ada", url: "https://example.org/source" }]);
  assert.deepEqual(withCitations.info, {
    text: "String info.",
    citations: [{ title: "Source", author: "Ada", url: "https://example.org/source" }]
  });

  const folded = applyDraftFieldValue({
    ...document,
    info: {
      text: "String info.",
      link: "https://example.org/old",
      extraLink: "https://example.org/extra",
      citations: [{ title: "Source" }]
    }
  }, {
    section: "puzzle", field: "info.links"
  }, [{ href: "https://example.org/related", label: "Related" }]);
  assert.equal(folded.info.citations.length, 1);
  assert.deepEqual(folded.info.links, [{ href: "https://example.org/related", label: "Related" }]);
  assert.equal(folded.info.link, undefined);
  assert.equal(folded.info.extraLink, undefined);

  const publishedLinked = {
    ...published,
    info: { text: "Published info.", link: "wiki:Published" }
  };
  const revertedLinks = applyDraftFieldEdit({
    ...document,
    info: { text: "String info.", links: [{ href: "https://example.org/draft" }] }
  }, {
    isRevertField: true,
    confirm: "revert-field",
    section: "puzzle",
    field: "info.links"
  }, { publishedDocument: publishedLinked });
  assert.deepEqual(revertedLinks.info, {
    text: "String info.",
    links: [{ href: "wiki:Published" }]
  });
  assert.equal(revertedLinks.info.link, undefined);

  const linkForm = parseFieldEditForm(new URLSearchParams([
    ["confirm", "save-field"],
    ["expected_revision", "3"],
    ["section", "puzzle"],
    ["field", "info.links"],
    ["label", ""],
    ["href", "wiki:Ethos"],
    ["label", "Related"],
    ["href", "https://example.org/related"],
    ["label", ""],
    ["href", ""]
  ]));
  assert.deepEqual(linkForm.items, [
    { href: "wiki:Ethos" },
    { href: "https://example.org/related", label: "Related" }
  ]);

  assert.throws(
    () => parseFieldEditForm(new URLSearchParams([
      ["confirm", "save-field"],
      ["section", "puzzle"],
      ["field", "info.links"],
      ["label", "Orphan"],
      ["href", ""]
    ])),
    DraftFieldError
  );

  const cleared = applyDraftFieldValue(withCitations, {
    section: "puzzle", field: "info.citations"
  }, []);
  assert.equal(cleared.info, "String info.");

  const listForm = parseFieldEditForm(new URLSearchParams([
    ["confirm", "save-field"],
    ["expected_revision", "3"],
    ["section", "puzzle"],
    ["field", "info.citations"],
    ["title", "First"],
    ["author", "Ada"],
    ["publisher", ""],
    ["year", "2020"],
    ["pages", ""],
    ["url", "https://example.org/a"],
    ["title", ""],
    ["author", ""],
    ["publisher", ""],
    ["year", ""],
    ["pages", ""],
    ["url", ""]
  ]));
  assert.deepEqual(listForm.items, [
    { title: "First", author: "Ada", year: "2020", url: "https://example.org/a" }
  ]);

  assert.throws(
    () => parseFieldEditForm(new URLSearchParams([
      ["confirm", "save-field"],
      ["section", "puzzle"],
      ["field", "info.citations"],
      ["title", ""],
      ["author", "Ada"]
    ])),
    DraftFieldError
  );

  const publishedCited = {
    ...published,
    info: {
      text: "Published info.",
      citations: [{ title: "Published source" }]
    }
  };
  const revertedCitations = applyDraftFieldEdit({
    ...document,
    info: { text: "String info.", citations: [{ title: "Draft source" }] }
  }, {
    isRevertField: true,
    confirm: "revert-field",
    section: "puzzle",
    field: "info.citations"
  }, { publishedDocument: publishedCited });
  assert.deepEqual(revertedCitations.info.citations, [{ title: "Published source" }]);

  const introLinks = applyDraftFieldValue(document, {
    section: "learning", field: "links"
  }, [{ href: "https://example.org/handout", label: "Handout" }]);
  assert.deepEqual(introLinks.learningIntroduction.links, [
    { href: "https://example.org/handout", label: "Handout" }
  ]);
  assert.equal(introLinks.learningIntroduction.sources, undefined);

  const decodedLesson = applyDraftFieldValue(document, {
    section: "learning", field: "content.text"
  }, "# Title\\n\\n## Section\\nBody.");
  assert.equal(
    decodedLesson.learningIntroduction.content.text,
    "# Title\n\n## Section\nBody."
  );

  const credited = applyDraftFieldValue(document, {
    section: "learning", field: "credit"
  }, "By Jane Doe, with assistance from Gemini 3.1 Pro");
  assert.equal(
    credited.learningIntroduction.credit,
    "By Jane Doe, with assistance from Gemini 3.1 Pro"
  );

  const leftoverPublished = {
    ...published,
    learningIntroduction: {
      requirement: "optional",
      title: "Intro",
      content: { text: "Body." },
      sources: [{ label: "Handout", href: "https://example.org/handout" }]
    }
  };
  const revertedIntroLinks = applyDraftFieldEdit({
    ...document,
    learningIntroduction: {
      requirement: "optional",
      title: "Intro",
      content: { text: "Body." },
      links: [{ href: "https://example.org/other" }]
    }
  }, {
    isRevertField: true,
    confirm: "revert-field",
    section: "learning",
    field: "links"
  }, { publishedDocument: leftoverPublished });
  assert.deepEqual(revertedIntroLinks.learningIntroduction.links, [
    { href: "https://example.org/handout", label: "Handout" }
  ]);
  assert.equal(revertedIntroLinks.learningIntroduction.sources, undefined);

  const editedNote = applyDraftFieldValue({
    ...document,
    info: {
      text: "String info.",
      link: "wiki:Ethos",
      extraLink: "https://example.org/extra"
    }
  }, {
    section: "puzzle", field: "info.text"
  }, "Updated note.");
  assert.deepEqual(editedNote.info, {
    text: "Updated note.",
    link: "wiki:Ethos",
    extraLink: "https://example.org/extra"
  });

  const titleOnly = applyDraftFieldValue({
    ...document,
    info: { text: "String info.", link: "wiki:Ethos" }
  }, {
    section: "puzzle", field: "title"
  }, "New title");
  assert.equal(titleOnly.title, "New title");
  assert.deepEqual(titleOnly.info, { text: "String info.", link: "wiki:Ethos" });

  const clusterFact = applyDraftFieldValue(document, {
    section: "cluster", id: "alpha", field: "fact"
  }, "Edited fact.");
  assert.equal(clusterFact.clusters[0].fact, "Edited fact.");

  assert.throws(
    () => applyDraftFieldValue(document, { section: "cluster", id: "missing", field: "fact" }, "x"),
    DraftFieldError
  );
  assert.throws(
    () => applyDraftFieldValue(document, { section: "puzzle", field: "bogus" }, "x"),
    DraftFieldError
  );

  const reverted = applyDraftFieldEdit(document, {
    isRevertField: true,
    confirm: "revert-field",
    section: "cluster",
    id: "alpha",
    field: "fact"
  }, { publishedDocument: published });
  assert.equal(reverted.clusters[0].fact, "Published fact.");
  assert.equal(document.clusters[0].fact, "Alpha fact.");

  assert.throws(
    () => applyDraftFieldEdit(document, {
      isRevertField: true,
      confirm: "revert-field",
      section: "puzzle",
      field: "title"
    }, { publishedDocument: null }),
    DraftFieldError
  );

  const form = parseFieldEditForm(new URLSearchParams({
    confirm: "save-field",
    expected_revision: "3",
    section: "puzzle",
    field: "title",
    value: "Hi"
  }));
  assert.equal(form.isSaveField, true);
  assert.equal(form.expectedRevision, 3);

  let saved = null;
  await persistDraftFieldEdit({
    draft: { document, revision: 3 },
    form,
    saveDraft: ({ document: next, expectedRevision }) => {
      saved = { document: next, expectedRevision };
    }
  });
  assert.equal(saved.expectedRevision, 3);
  assert.equal(saved.document.title, "Hi");
  assert.deepEqual(saved.document.generativeAssistance, document.generativeAssistance);
  assert.equal(document.title, "Old title");

  let migratedSave = null;
  await persistDraftFieldEdit({
    draft: {
      document: {
        ...document,
        info: { text: "String info.", link: "wiki:Ethos", seeAlso: ["wiki:Pathos"] }
      },
      revision: 3
    },
    form,
    saveDraft: ({ document: next, expectedRevision }) => {
      migratedSave = { document: next, expectedRevision };
    }
  });
  assert.deepEqual(migratedSave.document.info, {
    text: "String info.",
    links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
  });
  assert.equal(migratedSave.document.info.link, undefined);
  assert.equal(migratedSave.document.info.seeAlso, undefined);

  let canonicalSave = null;
  const legacyDocument = {
    id: "canonical-save-fixture",
    title: "Canonical save",
    info: { text: "Note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" }
  };
  const canonicalResult = await persistDraftCanonicalForm({
    draft: { document: legacyDocument, revision: 2 },
    expectedRevision: 2,
    saveDraft: ({ document: next, expectedRevision }) => {
      canonicalSave = { document: next, expectedRevision };
      return { revision: 3 };
    }
  });
  assert.equal(canonicalResult.unchanged, false);
  assert.deepEqual(canonicalSave.document.info, {
    text: "Note.",
    links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
  });

  const unchanged = await persistDraftCanonicalForm({
    draft: { document: canonicalSave.document, revision: 3 },
    expectedRevision: 3,
    saveDraft: () => {
      throw new Error("should not save unchanged canonical document");
    }
  });
  assert.equal(unchanged.unchanged, true);

  await assert.rejects(
    () => persistDraftFieldEdit({
      draft: { document, revision: 3 },
      form: { ...form, expectedRevision: 1 },
      saveDraft: () => {
        throw new Error("Draft revision conflict: expected 1, current revision is 3");
      }
    }),
    /revision conflict/i
  );

  const collaboration = applyDraftFieldValue({
    ...document,
    generativeAssistance: [
      { system: "Codex (GPT-5.6 Sol)", provider: "OpenAI", scope: "puzzle" },
      { system: "Cursor", provider: "Cursor", scope: "puzzle" }
    ],
    provenance: {
      collaboration: "aiPrimary",
      contributors: [
        { kind: "generative", name: "Codex (GPT-5.6 Sol)", provider: "OpenAI" },
        { kind: "generative", name: "Cursor", provider: "Cursor" }
      ]
    },
    learningIntroduction: {
      ...document.learningIntroduction,
      credit: "Drafted with Codex (GPT-5.6 Sol) and Cursor"
    }
  }, {
    section: "provenance",
    field: "collaboration",
    authorName: "John Majerus"
  }, "humanPrimary");
  assert.equal(collaboration.provenance.collaboration, "humanPrimary");
  assert.equal(collaboration.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({
      provenance: collaboration.provenance,
      introduction: collaboration.learningIntroduction
    }),
    "By Codex (GPT-5.6 Sol) and Cursor, with editorial direction by John Majerus"
  );

  const modelSet = applyDraftFieldValue({
    ...document,
    generativeAssistance: [{ system: "Cursor", provider: "Cursor", scope: "puzzle" }],
    learningIntroduction: {
      ...document.learningIntroduction,
      content: { text: "Body." }
    }
  }, {
    section: "provenance",
    field: "generativeModel",
    id: "Cursor"
  }, "auto");
  assert.deepEqual(modelSet.provenance.contributors, [{ name: "Cursor (auto)" }]);
  assert.equal(modelSet.generativeAssistance, undefined);
  assert.equal(
    resolveLessonByline({ provenance: modelSet.provenance }),
    "Drafted with Cursor (auto)"
  );

  const reasoningSet = applyDraftFieldValue({
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    }
  }, {
    section: "provenance",
    field: "reasoning"
  }, "extraHigh");
  assert.equal(reasoningSet.provenance.reasoning, "extraHigh");
  assert.equal(reasoningSet.provenance.speed, undefined);
}
