import assert from "node:assert/strict";
import {
  DraftFieldError,
  applyDraftFieldEdit,
  applyDraftFieldValue,
  parseFieldEditForm,
  persistDraftFieldEdit,
  persistDraftWorkingCopy,
  persistDraftCanonicalForm
} from "../modules/draftReviewEdit.js";
import {
  resolveLessonByline,
  UNIDENTIFIED_GENERATIVE_SYSTEM
} from "../modules/authoringProvenance.js";

export const name = "draft review edit: field addressing, revert, and OCC persist";

const document = {
  id: "edit-fixture",
  title: "Old title",
  info: "String info.",
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

  const clearedSummary = applyDraftFieldValue(document, {
    section: "learning", field: "summary"
  }, "");
  assert.equal(clearedSummary.learningIntroduction.summary, undefined);

  const clearedTitle = applyDraftFieldValue(document, {
    section: "learning", field: "title"
  }, "   ");
  assert.equal(clearedTitle.learningIntroduction.title, undefined);

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
  assert.equal(saved.document.provenance, undefined);
  assert.equal(document.title, "Old title");

  let batchSaved = null;
  await persistDraftWorkingCopy({
    draft: { document, revision: 3 },
    expectedRevision: 3,
    params: new URLSearchParams([
      ["confirm", "save-working-copy"],
      ["expected_revision", "3"],
      ["c0.section", "puzzle"],
      ["c0.field", "title"],
      ["c0.value", "Batch title"],
      ["c1.section", "cluster"],
      ["c1.id", "alpha"],
      ["c1.field", "fact"],
      ["c1.value", "Batch fact."]
    ]),
    saveDraft: ({ document: next, expectedRevision }) => {
      batchSaved = { document: next, expectedRevision };
    }
  });
  assert.equal(batchSaved.expectedRevision, 3);
  assert.equal(batchSaved.document.title, "Batch title");
  assert.equal(batchSaved.document.clusters[0].fact, "Batch fact.");
  assert.equal(batchSaved.document.clusters[0].name, "Alpha");

  // The working-copy form submits every rendered copy control. Clearing an
  // optional lesson summary must remove its property rather than storing
  // `summary: ""`, which the strict draft schema correctly rejects.
  let clearedLessonSummary = null;
  await persistDraftWorkingCopy({
    draft: { document, revision: 3 },
    expectedRevision: 3,
    params: new URLSearchParams([
      ["confirm", "save-working-copy"],
      ["expected_revision", "3"],
      ["c0.section", "learning"],
      ["c0.field", "summary"],
      ["c0.value", ""]
    ]),
    saveDraft: ({ document: next }) => {
      clearedLessonSummary = next;
    }
  });
  assert.equal(clearedLessonSummary.learningIntroduction.summary, undefined);

  let renamedBatch = null;
  await persistDraftWorkingCopy({
    draft: {
      document: { ...document, category: "Geography", categories: ["Geography"] },
      revision: 3
    },
    categoryRegistry: {
      "Physical Geography": { slug: "geography", previousTitles: ["Geography"] }
    },
    expectedRevision: 3,
    params: new URLSearchParams(),
    saveDraft: ({ document: next }) => {
      renamedBatch = next;
    }
  });
  assert.equal(renamedBatch.category, "geography");
  assert.deepEqual(renamedBatch.categories, ["geography"]);

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
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    },
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
  assert.equal(
    resolveLessonByline({ provenance: modelSet.provenance }),
    "Drafted with Cursor (auto)"
  );

  // Naming the unnamed generative placeholder through the provenance editor.
  // The blank stands for an agent we know ran but could not name, so filling
  // it in must replace that entry rather than add a second agent beside it.
  const unnamedDocument = {
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }]
    }
  };
  const identified = applyDraftFieldValue(unnamedDocument, {
    section: "provenance",
    field: "editor",
    id: "",
    term: "",
    identifyHost: "Claude",
    // The placeholder's own row posts its model and reasoning alongside the
    // chosen client; both belong to the run now being named.
    models: [{ host: UNIDENTIFIED_GENERATIVE_SYSTEM, model: "Opus 5" }],
    reasonings: [{ host: UNIDENTIFIED_GENERATIVE_SYSTEM, value: "high" }],
    switches: []
  }, "");
  assert.equal(identified.provenance.contributors.length, 1);
  assert.equal(identified.provenance.contributors[0].name, "Claude (Opus 5)");
  assert.equal(identified.provenance.contributors[0].reasoning, "high");

  // Choosing a client on the add row while the blank is still the only agent
  // fills the blank too. Before this, that path produced a puzzle claiming two
  // agents made it, with no way to remove either.
  const addedWhileUnnamed = applyDraftFieldValue(unnamedDocument, {
    section: "provenance",
    field: "editor",
    id: "",
    term: "",
    models: [{ host: "Claude Code", model: "" }],
    reasonings: [],
    switches: []
  }, "");
  assert.deepEqual(
    addedWhileUnnamed.provenance.contributors,
    [{ name: "Claude Code" }]
  );

  // Once an agent is named, a genuinely second one still adds as a second.
  const secondAgent = applyDraftFieldValue(addedWhileUnnamed, {
    section: "provenance",
    field: "editor",
    id: "",
    term: "",
    models: [{ host: "Codex", model: "" }],
    reasonings: [],
    switches: []
  }, "");
  assert.deepEqual(
    secondAgent.provenance.contributors.map(entry => entry.name),
    ["Claude Code", "Codex"]
  );

  // The select is offered on the blank's row whenever the blank exists, so the
  // save path has to honour it in that state too. It previously keyed on the
  // blank being the *only* agent, which meant a document holding both a named
  // client and the blank rendered a control that silently did nothing -- the
  // one state where the blank most needed filling in.
  const blankBesideNamed = applyDraftFieldValue({
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Codex" }, { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }]
    }
  }, {
    section: "provenance",
    field: "editor",
    id: "",
    term: "",
    identifyHost: "Cursor",
    models: [],
    reasonings: [],
    switches: []
  }, "");
  assert.deepEqual(
    blankBesideNamed.provenance.contributors.map(entry => entry.name),
    ["Codex", "Cursor"]
  );

  const reasoningSet = applyDraftFieldValue({
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    }
  }, {
    section: "provenance",
    field: "reasoning",
    id: "Cursor"
  }, "extraHigh");
  assert.equal(reasoningSet.provenance.contributors[0].reasoning, "extraHigh");
  assert.equal(reasoningSet.provenance.contributors[0].switch, undefined);
  assert.equal(
    resolveLessonByline({ provenance: reasoningSet.provenance }),
    "Drafted with Cursor (Extra High)"
  );

  const switchRetarget = applyDraftFieldValue({
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 High Fast)", reasoning: "high", switch: "fast" }]
    }
  }, {
    section: "provenance",
    field: "switch",
    id: "Cursor"
  }, "thinking");
  assert.equal(switchRetarget.provenance.contributors[0].switch, "thinking");
  assert.equal(
    resolveLessonByline({ provenance: switchRetarget.provenance }),
    "Drafted with Cursor (Grok 4.6 High Thinking)"
  );

  const editorForm = parseFieldEditForm(new URLSearchParams([
    ["confirm", "save-field"],
    ["expected_revision", "1"],
    ["section", "provenance"],
    ["field", "editor"],
    ["authorName", "Jane Doe"],
    ["modelHost", "Cursor"],
    ["modelValue", "Grok 4.6"],
    ["reasoningHost", "Cursor"],
    ["reasoningValue", "high"],
    ["switchHost", "Cursor"],
    ["switchValue", "fast"],
    ["collaboration", "ai"],
    ["reviewedBy", "Jane Expertsmith"]
  ]));
  const editorSaved = applyDraftFieldValue({
    ...document,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    }
  }, editorForm, "");
  assert.deepEqual(editorSaved.provenance.contributors, [
    { name: "Cursor (Grok 4.6)", reasoning: "high", switch: "fast" }
  ]);
  assert.equal(editorSaved.provenance.reviewedBy, "Jane Expertsmith");
  assert.equal(
    resolveLessonByline({ provenance: editorSaved.provenance }),
    "Drafted with Cursor (Grok 4.6 High Fast); reviewed by Jane Expertsmith"
  );

  // The always-visible provenance editor must be safe to save unchanged on a
  // browser-created draft, then be able to recover known agent attribution.
  const blankEditorForm = parseFieldEditForm(new URLSearchParams([
    ["confirm", "save-field"],
    ["expected_revision", "1"],
    ["section", "provenance"],
    ["field", "editor"],
    ["authorName", "Jane Doe"],
    ["modelHost", ""],
    ["modelValue", ""],
    ["collaboration", ""],
    ["reviewedBy", ""]
  ]));
  const unchangedProvenance = applyDraftFieldValue(document, blankEditorForm, "");
  assert.equal(unchangedProvenance.provenance, undefined);
  const recoveredProvenance = applyDraftFieldValue(document, {
    ...blankEditorForm,
    models: [{ host: "Muse Code", model: "Spark 1.3" }],
    reasonings: [{ host: "Muse Code", value: "high" }]
  }, "");
  assert.deepEqual(recoveredProvenance.provenance, {
    collaboration: "ai",
    contributors: [{ name: "Muse Code (Spark 1.3)", reasoning: "high" }]
  });

}
