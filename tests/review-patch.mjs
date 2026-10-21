import assert from "node:assert/strict";
import {
  applyReviewChanges,
  documentForProposal,
  fieldChanges,
  fileReviewProposal,
  freshProposalOverlaps,
  openStackPredecessor,
  pathsOverlap,
  REVIEW_PATCH_ENVELOPE,
  staleReviewChanges
} from "../modules/reviewPatch.js";

export const name = "review patch: field proposals on the working copy";

const baseline = {
  id: "review-patch",
  title: "Review patch",
  category: "Science",
  clusters: [{
    id: "alpha",
    name: "Alpha",
    fact: "Alpha fact.",
    seeds: ["a"],
    terms: ["a"]
  }],
  bridges: [],
  lenses: [{
    id: "which-alpha",
    prompt: "Which term is alpha?",
    explanation: "The seed."
  }]
};

function withFact(fact) {
  return {
    ...baseline,
    clusters: [{ ...baseline.clusters[0], fact }]
  };
}

function withLesson(text) {
  return {
    ...baseline,
    learningIntroduction: {
      requirement: "recommended",
      content: { text }
    }
  };
}

function withPrompt(prompt) {
  return {
    ...baseline,
    lenses: [{ ...baseline.lenses[0], prompt }]
  };
}

export async function run() {
  const lesson = fieldChanges(baseline, withLesson("Start here."));
  const prompt = fieldChanges(baseline, withPrompt("Which seed is alpha?"));
  assert.deepEqual(lesson.map(change => change.path), ["learningIntroduction"]);
  assert.deepEqual(prompt.map(change => change.path), ["lenses[which-alpha].prompt"]);
  assert.equal(pathsOverlap(lesson[0].path, prompt[0].path), false);
  assert.equal(pathsOverlap("lenses[which-alpha]", "lenses[which-alpha].prompt"), true);
  assert.equal(pathsOverlap("lenses[which-alpha]", "lenses[which-alphabet].prompt"), false);

  const applied = applyReviewChanges(withPrompt("Kept."), lesson);
  assert.equal(applied.stale.length, 0);
  assert.equal(applied.document.lenses[0].prompt, "Kept.");
  assert.equal(applied.document.learningIntroduction.content.text, "Start here.");

  const moved = withFact("A human edit.");
  const proposal = fileReviewProposal({
    baseline,
    edited: withFact("An agent edit."),
    openProposals: [],
    baseDraftRevision: 4
  });
  assert.equal(proposal.patch.envelope, REVIEW_PATCH_ENVELOPE);
  assert.equal(proposal.patch.baseDraftRevision, 4);
  assert.equal(proposal.patch.stacksOn, null);
  const stale = staleReviewChanges(moved, proposal.patch.changes);
  assert.equal(stale.length, 1);
  assert.equal(stale[0].current, "A human edit.");
  assert.equal(stale[0].after, "An agent edit.");
  const forced = applyReviewChanges(moved, proposal.patch.changes, { force: true });
  assert.equal(forced.document.clusters[0].fact, "An agent edit.");

  const open = [{ id: 7, proposal: proposal.patch }];
  assert.throws(
    () => fileReviewProposal({
      baseline,
      edited: withFact("Another agent."),
      openProposals: open
    }),
    /Pass stack_on true/
  );
  const stacked = fileReviewProposal({
    baseline,
    edited: withFact("Another agent."),
    openProposals: open,
    stackOn: true
  });
  assert.equal(stacked.patch.stacksOn, 7);
  assert.equal(stacked.patch.changes[0].before, "An agent edit.");
  assert.equal(stacked.patch.changes[0].after, "Another agent.");

  const disjoint = fileReviewProposal({
    baseline,
    edited: withLesson("A lesson beside the fact proposal."),
    openProposals: open
  });
  assert.deepEqual(disjoint.patch.changes.map(change => change.path), ["learningIntroduction"]);

  const saved = freshProposalOverlaps(baseline, withFact("Typed."), open, baseline);
  assert.deepEqual(saved.map(hit => hit.paths), [["clusters[alpha].fact"]]);
  const alreadyStale = freshProposalOverlaps(
    moved,
    withFact("Typed over the human edit."),
    open,
    baseline
  );
  assert.deepEqual(alreadyStale, []);

  const first = fileReviewProposal({
    baseline,
    edited: {
      ...withFact("An agent edit."),
      learningIntroduction: {
        requirement: "recommended",
        content: { text: "From the first review." }
      }
    },
    openProposals: []
  });
  const firstEvent = { id: 7, proposal: first.patch };
  const second = fileReviewProposal({
    baseline,
    edited: withFact("Another agent."),
    openProposals: [firstEvent],
    stackOn: true
  });
  const secondEvent = { id: 8, proposal: second.patch };
  const chain = [firstEvent, secondEvent];
  const composed = documentForProposal(baseline, second.patch, chain);
  assert.equal(composed.clusters[0].fact, "Another agent.");
  assert.equal(composed.learningIntroduction.content.text, "From the first review.");
  assert.equal(openStackPredecessor(secondEvent, chain)?.id, 7);
  assert.equal(openStackPredecessor(secondEvent, [secondEvent]), null);

  const third = fileReviewProposal({
    baseline,
    edited: {
      ...composed,
      lenses: [{ ...composed.lenses[0], prompt: "Stacked prompt." }]
    },
    openProposals: chain,
    stackOn: true,
    stackLoaded: true
  });
  assert.deepEqual(third.patch.changes.map(change => change.path), ["lenses[which-alpha].prompt"]);
  assert.equal(third.document.learningIntroduction.content.text, "From the first review.");
  assert.equal(third.document.clusters[0].fact, "Another agent.");

  const anchored = freshProposalOverlaps(baseline, withFact("Typed."), open, () => baseline);
  assert.deepEqual(anchored.map(hit => hit.paths), [["clusters[alpha].fact"]]);
  const missingSnapshot = freshProposalOverlaps(baseline, withFact("Typed."), [{
    id: 1,
    proposal: withFact("An agent edit.")
  }], () => null);
  assert.deepEqual(missingSnapshot, []);
}
