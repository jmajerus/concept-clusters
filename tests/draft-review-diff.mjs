import assert from "node:assert/strict";
import { diffPublishedDraft } from "../modules/draftReviewDiff.js";

export const name = "draft review diff: published vs draft marks";

const published = {
  id: "classical-narrative-architecture",
  title: "Classical narrative architecture",
  category: "Literary Theory & Poetics",
  clusters: [{
    id: "cluster-homeric-epic-conventions",
    name: "Homeric epic conventions",
    color: "blue",
    fact: "Epic fact.",
    seeds: ["in medias res", "invocation of the Muse"],
    floatingTerms: ["dactylic hexameter"],
    terms: ["in medias res", "invocation of the Muse", "dactylic hexameter"]
  }],
  bridges: [{
    id: "bridge-katabasis",
    term: "katabasis",
    clusters: ["cluster-homeric-epic-conventions"],
    fact: "Descent fact."
  }],
  lenses: [{
    id: "epic-craft-and-framing",
    prompt: "Which concepts belong to Homeric epic?",
    explanation: "The whole cluster.",
    targets: ["in medias res", "invocation of the Muse", "dactylic hexameter"]
  }],
  generativeAssistance: [{ system: "Cursor", date: "2026-08-07" }]
};

export async function run() {
  const identical = diffPublishedDraft(published, {
    ...published,
    generativeAssistance: [{ system: "Cursor", date: "2026-08-21" }]
  });
  assert.equal(identical.total, 0);

  const lensCut = {
    ...published,
    lenses: [{
      ...published.lenses[0],
      prompt: "Which concepts are specifically about how a classical epic begins?",
      explanation: "An invocation and in medias res.",
      targets: ["invocation of the Muse", "in medias res"]
    }]
  };
  const lensDiff = diffPublishedDraft(published, lensCut);
  assert.equal(lensDiff.total, 1);
  assert.equal(lensDiff.counts.changed, 1);
  const lensMark = lensDiff.lenses.changed["epic-craft-and-framing"];
  assert.ok(lensMark.fields.prompt);
  assert.ok(lensMark.fields.targets);
  assert.deepEqual(lensMark.fields.targets.after, [
    "invocation of the Muse",
    "in medias res"
  ]);

  const addedTerm = {
    ...published,
    clusters: [{
      ...published.clusters[0],
      floatingTerms: ["dactylic hexameter", "Telemachy"],
      terms: [
        "in medias res",
        "invocation of the Muse",
        "dactylic hexameter",
        "Telemachy"
      ]
    }]
  };
  const termDiff = diffPublishedDraft(published, addedTerm);
  assert.deepEqual(
    termDiff.clusters.changed["cluster-homeric-epic-conventions"].terms.added,
    ["Telemachy"]
  );

  const droppedBridge = { ...published, bridges: [] };
  const removed = diffPublishedDraft(published, droppedBridge);
  assert.equal(removed.counts.removed, 1);
  assert.equal(removed.bridges.removed[0].term, "katabasis");

  const publishedLinked = {
    ...published,
    info: { text: "A note.", link: "wiki:Ethos", extraLink: "wiki:Pathos" }
  };
  const draftLinked = {
    ...publishedLinked,
    info: {
      text: "A note.",
      links: [{ href: "wiki:Ethos" }, { href: "wiki:Pathos" }]
    }
  };
  const linkFold = diffPublishedDraft(publishedLinked, draftLinked);
  assert.equal(linkFold.total, 0);

  const publishedLesson = {
    ...published,
    learningIntroduction: {
      requirement: "optional",
      title: "Intro",
      content: { text: "Body." },
      sources: [{ label: "Handout", href: "https://example.org/handout" }]
    }
  };
  const draftLesson = {
    ...publishedLesson,
    learningIntroduction: {
      requirement: "optional",
      title: "Intro",
      content: { text: "Body." },
      links: [{ href: "https://example.org/handout", label: "Handout" }]
    }
  };
  const lessonFold = diffPublishedDraft(publishedLesson, draftLesson);
  assert.equal(lessonFold.total, 0);

  const publishedCited = {
    ...published,
    clusters: [{
      ...published.clusters[0],
      info: { citations: [{ title: "Poetics", author: "Aristotle" }] }
    }]
  };
  const draftCited = {
    ...published,
    info: { citations: [{ title: "Poetics", author: "Aristotle" }] }
  };
  const citationFold = diffPublishedDraft(publishedCited, draftCited);
  assert.equal(citationFold.total, 0);

  assert.equal(diffPublishedDraft(null, published), null);
}
