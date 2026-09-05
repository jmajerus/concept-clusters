import assert from "node:assert/strict";
import {
  CHANGE_SCORE_CHAR_THRESHOLD,
  CHANGE_SCORE_FIELD_THRESHOLD,
  computeChangeScore,
  isSubstantialChange
} from "../modules/authoringChangeScore.js";

export const name = "Authoring change score (mechanical MCP-save auto-credit trigger)";

export async function run() {
  const before = {
    id: "demo",
    title: "Demo",
    category: "Science",
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Intro body." },
      summary: ""
    },
    clusters: [
      { id: "a", name: "A", fact: "Fact A." }
    ]
  };

  // A one-field validation fix (this session's real-world case: filling a
  // required-but-blank summary) stays well under both thresholds.
  const trivial = {
    ...before,
    learningIntroduction: {
      ...before.learningIntroduction,
      summary: "A short one-line summary."
    }
  };
  const trivialScore = computeChangeScore(before, trivial);
  assert.equal(trivialScore.fieldsChanged, 1);
  assert.equal(trivialScore.charsAdded, "A short one-line summary.".length);
  assert.equal(trivialScore.charsChanged, "A short one-line summary.".length);
  assert.equal(isSubstantialChange(trivialScore), false);

  // Many small field touches (no single long string) crosses the field
  // threshold even though no individual edit is long.
  const manyFields = {
    ...before,
    title: "Demo!",
    category: "History & Society",
    clusters: [
      { id: "a", name: "A!", fact: "Fact A!" }
    ]
  };
  const manyFieldsScore = computeChangeScore(before, manyFields);
  assert.ok(manyFieldsScore.fieldsChanged >= CHANGE_SCORE_FIELD_THRESHOLD);
  assert.equal(isSubstantialChange(manyFieldsScore), true);

  // One long rewritten field crosses the char threshold even though only
  // one field changed.
  const oneLongField = {
    ...before,
    learningIntroduction: {
      ...before.learningIntroduction,
      // net increase (charsAdded), not raw length, must cross the
      // threshold -- pad past the existing "Intro body." baseline too.
      content: { text: "X".repeat(before.learningIntroduction.content.text.length + CHANGE_SCORE_CHAR_THRESHOLD + 1) }
    }
  };
  const oneLongFieldScore = computeChangeScore(before, oneLongField);
  assert.equal(oneLongFieldScore.fieldsChanged, 1);
  assert.ok(oneLongFieldScore.charsAdded >= CHANGE_SCORE_CHAR_THRESHOLD);
  assert.equal(isSubstantialChange(oneLongFieldScore), true);

  // A large rewrite can retain exactly the same length. It is still a real
  // editorial pass and must not be lost merely because net character growth
  // is zero.
  const sameLengthRewrite = {
    ...before,
    learningIntroduction: {
      ...before.learningIntroduction,
      content: { text: "X".repeat(CHANGE_SCORE_CHAR_THRESHOLD + 1) }
    }
  };
  const sameLengthBefore = {
    ...before,
    learningIntroduction: {
      ...before.learningIntroduction,
      content: { text: "Y".repeat(CHANGE_SCORE_CHAR_THRESHOLD + 1) }
    }
  };
  const rewriteScore = computeChangeScore(sameLengthBefore, sameLengthRewrite);
  assert.equal(rewriteScore.fieldsChanged, 1);
  assert.equal(rewriteScore.charsAdded, 0);
  assert.equal(rewriteScore.charsChanged, CHANGE_SCORE_CHAR_THRESHOLD + 1);
  assert.equal(isSubstantialChange(rewriteScore), true);

  // A real drafting/pedagogy pass -- new clusters, a long intro, a new
  // lens -- is unambiguously substantial.
  const substantialDraft = {
    ...before,
    clusters: [
      { id: "a", name: "A", fact: "Fact A." },
      {
        id: "b",
        name: "B",
        fact: "A brand new second cluster with a fully composed fact sentence."
      }
    ],
    lenses: [
      {
        id: "lens-one",
        prompt: "A freshly authored prompt asking players to compare two concepts.",
        explanation: "A freshly authored explanation walking through why the grouping holds."
      }
    ]
  };
  const substantialScore = computeChangeScore(before, substantialDraft);
  assert.equal(isSubstantialChange(substantialScore), true);

  // provenance / generativeAssistance are excluded from the diff -- an
  // otherwise-trivial save that also happens to carry a provenance edit
  // (e.g. a human's own model-specificity edit round-tripping through the
  // same document) must not itself trip the trigger.
  const provenanceOnly = {
    ...before,
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Claude", model: "Claude Sonnet 4.6" }]
    }
  };
  const provenanceOnlyScore = computeChangeScore(before, provenanceOnly);
  assert.equal(provenanceOnlyScore.fieldsChanged, 0);
  assert.equal(provenanceOnlyScore.charsAdded, 0);
  assert.equal(isSubstantialChange(provenanceOnlyScore), false);

  // A removed field counts as a change too.
  const removedField = { id: "demo", title: "Demo", category: "Science" };
  const removedScore = computeChangeScore(before, removedField);
  assert.ok(removedScore.fieldsChanged >= 1);

  // Custom thresholds are honored.
  assert.equal(
    isSubstantialChange({ fieldsChanged: 1, charsAdded: 10 }, { fieldThreshold: 1 }),
    true
  );
  assert.equal(
    isSubstantialChange({ fieldsChanged: 1, charsAdded: 10 }, { charThreshold: 10 }),
    true
  );
  assert.equal(isSubstantialChange(null), false);
}
