import assert from "node:assert/strict";
import {
  DraftFieldError,
  applyDraftFieldEdit,
  applyDraftFieldValue,
  parseFieldEditForm,
  persistDraftFieldEdit
} from "../modules/draftReviewEdit.js";

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

  const withLink = applyDraftFieldValue(document, {
    section: "puzzle", field: "info.link"
  }, "https://example.org/info");
  assert.deepEqual(withLink.info, {
    text: "String info.",
    link: "https://example.org/info"
  });

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
}
