import assert from "node:assert/strict";
import {
  diffPublishedDraft,
  unpublishedChangeDomains,
  documentForChosenProposal,
  documentKeepingProvenance,
  documentWithLesson,
  draftShadowsPublished,
  independentReviewDocument,
  stackedReviewDocument,
  provenanceDiffersFromPublished,
  samePlayablePuzzle
} from "../modules/draftReviewDiff.js";

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
};

export async function run() {
  const identical = diffPublishedDraft(published, {
    ...published,
  });
  assert.equal(identical.total, 0);
  assert.deepEqual(unpublishedChangeDomains(published, published), []);
  const domainCases = [
    [{ title: "New title" }, ["content"]],
    [{ category: "Science" }, ["classification"]],
    [{ tags: ["new tag"] }, ["classification"]],
    [{ learningIntroduction: { markdown: "New lesson" } }, ["pedagogy"]],
    [{ language: "fr" }, ["pedagogy"]],
    [{ board: { bridgePreconnect: true } }, ["administration"]],
    [{ provenance: { collaboration: "human" } }, ["provenance"]],
    [{ updatedAt: "2026-10-06", dateModified: "2026-10-06" }, []],
    [{ bridges: [...published.bridges, { id: "new", term: "new", clusters: [] }] }, ["content"]],
    [{ bridges: [{ ...published.bridges[0], fact: "New bridge fact" }] }, ["content"]],
    [{ bridges: [{ ...published.bridges[0], relationKind: "causes" }] }, ["pedagogy"]],
    [{ bridges: [{ ...published.bridges[0], fact: "New fact", relationKind: "causes" }] }, ["content", "pedagogy"]],
    [{ title: "New title", tags: ["new"], lensMode: "guided" }, ["content", "classification", "pedagogy"]]
  ];
  for (const [patch, expected] of domainCases) {
    assert.deepEqual(unpublishedChangeDomains(published, { ...published, ...patch }), expected);
  }
  assert.deepEqual(unpublishedChangeDomains(published, published, {
    publishedLayout: { nodes: { a: { x: 1, y: 2 } } }
  }), ["layout"], "clearing a live layout is a layout change");
  assert.deepEqual(unpublishedChangeDomains(null, published), []);
  assert.equal(diffPublishedDraft(published, { ...published, language: "fr" }).total, 1,
    "language-only edits must also enable publication");
  const boardChanged = { ...published, board: { bridgePreconnect: true } };
  assert.equal(diffPublishedDraft(published, boardChanged).total, 1);
  assert.ok(diffPublishedDraft(published, boardChanged).fields.board);
  assert.equal(samePlayablePuzzle(published, boardChanged), false);

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

  const publishedInfo = {
    ...published,
    info: {
      text: "Same note.",
      citations: [{ title: "Poetics", author: "Aristotle", url: "https://example.org/poetics" }]
    }
  };
  const draftWithLinks = {
    ...published,
    info: {
      text: "Same note.",
      links: [
        { href: "https://example.org/poetics", label: "Poetics" },
        { href: "https://example.org/extra", label: "Extra" }
      ],
      citations: [{ title: "Poetics", author: "Aristotle", url: "https://example.org/poetics" }]
    }
  };
  const infoSub = diffPublishedDraft(publishedInfo, draftWithLinks);
  assert.equal(infoSub.total, 1);
  assert.ok(!infoSub.fields["info.text"], "unchanged text should not be marked");
  assert.ok(infoSub.fields["info.links"], "added board links should be marked");
  assert.ok(!infoSub.fields["info.citations"], "matching citations should not be marked");

  assert.equal(diffPublishedDraft(null, published), null);

  // Shadow detection reads the same diff: how much of the published board's
  // identity survives into the draft. An edit keeps its nodes; a document
  // written from scratch under a live id keeps almost none.
  const liveBoard = {
    id: "short-lived-words",
    title: "Here and Gone",
    clusters: [{ id: "short-lived", name: "Short-lived", fact: "Shared sense.", terms: ["a", "b"] }],
    bridges: [],
    lenses: [
      { id: "lapse-instant", prompt: "A ___ lapse.", explanation: "Because." },
      { id: "mayfly-evening", prompt: "Mayflies are ___.", explanation: "Because." },
      { id: "harvest-workers", prompt: "The ___ population.", explanation: "Because." },
      { id: "dusk-gold", prompt: "The gold was ___.", explanation: "Because." }
    ]
  };

  // A heavy but genuine edit: every node rewritten, none replaced.
  const editedHeavily = {
    ...liveBoard,
    title: "A different title entirely",
    clusters: [{ id: "short-lived", name: "Renamed", fact: "Rewritten fact.", terms: ["a", "c"] }],
    lenses: liveBoard.lenses.map(lens => ({ ...lens, prompt: `${lens.prompt} rewritten` }))
  };
  assert.ok(diffPublishedDraft(liveBoard, editedHeavily).total > 0, "a heavy edit still diffs");
  assert.equal(
    draftShadowsPublished({ published: liveBoard, draft: editedHeavily }),
    false,
    "rewriting every node's contents is still recognizably the same board"
  );

  // The incident's shape: a fresh board under the same id. It reused the
  // cluster id, so 1 of 5 nodes survives -- and the lenses, which carried the
  // board's actual work, are all gone.
  const shadow = {
    id: "short-lived-words",
    title: "Built from scratch",
    clusters: [{ id: "short-lived", name: "Short-lived", fact: "Different fact.", terms: ["a", "b"] }],
    bridges: [],
    lenses: []
  };
  assert.equal(
    draftShadowsPublished({ published: liveBoard, draft: shadow }),
    true,
    "a board that keeps 1 of 5 published nodes is a shadow, not an edit"
  );

  // A one-field change on a second working copy -- the legitimate case that a
  // naive "revision 1 and differs at all" rule would have accused.
  const lightlyEdited = {
    ...liveBoard,
    clusters: [{ ...liveBoard.clusters[0], fact: "Slightly reworded fact." }]
  };
  assert.equal(draftShadowsPublished({ published: liveBoard, draft: lightlyEdited }), false);

  // An already-computed diff is reused rather than recomputed.
  assert.equal(
    draftShadowsPublished({
      published: liveBoard,
      publishedDiff: diffPublishedDraft(liveBoard, shadow)
    }),
    true
  );
  // Nothing to compare against is not a shadow.
  assert.equal(draftShadowsPublished({ published: null, draft: shadow }), false);
  assert.equal(
    draftShadowsPublished({ published: { id: "x", clusters: [], bridges: [], lenses: [] }, draft: shadow }),
    false,
    "an empty published board has no identity to lose"
  );

  // Provenance is deliberately outside the field-level marks, so the diff
  // itself reports nothing for a provenance-only edit...
  const beforeProvenance = {
    id: "p", clusters: [], bridges: [], lenses: [],
    provenance: { collaboration: "ai", contributors: [{ name: "Claude" }] }
  };
  const afterProvenance = {
    ...beforeProvenance,
    provenance: { collaboration: "ai", contributors: [{ name: "Claude (Sonnet 5)" }] }
  };
  assert.equal(
    diffPublishedDraft(beforeProvenance, afterProvenance).total,
    0,
    "provenance stays out of the field-level marks"
  );
  assert.equal(samePlayablePuzzle(beforeProvenance, afterProvenance), true);
  assert.equal(samePlayablePuzzle(
    { id: "p", clusters: [], puzzleKind: "topic-based" },
    { id: "p", clusters: [], puzzleKind: "trivia-quiz" }
  ), false);
  const chosen = {
    id: "p",
    title: "Chosen",
    provenance: { collaboration: "ai", contributors: [{ name: "Codex" }] }
  };
  const later = {
    id: "p",
    title: "Later",
    provenance: { collaboration: "ai", contributors: [{ name: "Claude" }] }
  };
  const chosenDocument = documentForChosenProposal(chosen, later, [
    { proposal: chosen },
    { proposal: later }
  ]);
  assert.equal(chosenDocument.title, "Chosen");
  assert.deepEqual(chosenDocument.provenance, chosen.provenance);
  const humanEdit = documentForChosenProposal(
    chosen,
    { provenance: { collaboration: "human", contributors: [{ name: "Ada" }] } },
    [{ proposal: chosen }, { proposal: later }]
  );
  assert.equal(humanEdit.title, "Chosen");
  assert.deepEqual(humanEdit.provenance, { collaboration: "human", contributors: [{ name: "Ada" }] });
  assert.equal(samePlayablePuzzle(beforeProvenance, {
    ...afterProvenance,
    clusters: [{ id: "added", name: "Added", fact: "New." }]
  }), false);
  const kept = documentKeepingProvenance(
    { id: "p", title: "Baseline", provenance: { collaboration: "ai" } },
    { provenance: { collaboration: "human" } }
  );
  assert.equal(kept.title, "Baseline");
  assert.deepEqual(kept.provenance, { collaboration: "human" });
  // ...which is why it is reported separately. Without this the review page
  // said "No changes from the published puzzle" over a real edit, and worse,
  // the draft counted as already-in-authoring-play so Publish was withheld
  // and the edit could not leave the working copy.
  assert.equal(provenanceDiffersFromPublished(beforeProvenance, afterProvenance), true);
  assert.equal(provenanceDiffersFromPublished(beforeProvenance, beforeProvenance), false);
  // Naming a client on a puzzle that had none is still a difference.
  assert.equal(
    provenanceDiffersFromPublished(
      { id: "p", clusters: [] },
      { id: "p", clusters: [], provenance: { collaboration: "ai", contributors: [{ name: "Codex" }] } }
    ),
    true
  );
  assert.equal(provenanceDiffersFromPublished(null, afterProvenance), false);

  const baseline = {
    id: "energy-flow",
    title: "Energy flow",
    clusters: [
      { id: "photosynthesis", name: "Photosynthesis", fact: "Plants store light.", terms: ["sunlight"] },
      { id: "cellular-respiration", name: "Cellular respiration", fact: "Cells release energy.", terms: ["atp"] }
    ],
    bridges: []
  };
  const firstProposal = {
    ...baseline,
    clusters: [
      baseline.clusters[0],
      { ...baseline.clusters[1], fact: "Cells release energy from food." }
    ],
    bridges: [{ term: "glucose", clusters: ["photosynthesis", "cellular-respiration"], fact: "Sugar carries the energy." }]
  };
  const stacked = {
    ...firstProposal,
    learningIntroduction: { text: "Energy moves from light to heat.", audience: "recommended" }
  };
  const independent = independentReviewDocument(baseline, [{ proposal: firstProposal }], stacked);
  assert.equal(independent.learningIntroduction.text, "Energy moves from light to heat.");
  assert.deepEqual(independent.bridges, []);
  assert.equal(independent.clusters[1].fact, "Cells release energy.");
  assert.equal(samePlayablePuzzle(independent, stacked), false);
  const furtherEdit = {
    ...firstProposal,
    clusters: [
      firstProposal.clusters[0],
      { ...firstProposal.clusters[1], fact: "A different respiration fact." }
    ]
  };
  const keptEdit = independentReviewDocument(baseline, [{ proposal: firstProposal }], furtherEdit);
  assert.equal(keptEdit.clusters[1].fact, "A different respiration fact.");
  assert.deepEqual(keptEdit.bridges, []);

  const ownDelta = {
    ...baseline,
    learningIntroduction: { text: "Energy moves from light to heat.", audience: "recommended" }
  };
  const merged = stackedReviewDocument(baseline, { proposal: firstProposal }, ownDelta);
  assert.equal(merged.learningIntroduction.text, "Energy moves from light to heat.");
  assert.equal(merged.clusters[1].fact, "Cells release energy from food.");
  assert.equal(merged.bridges[0].term, "glucose");
  const removedGlucose = {
    ...firstProposal,
    bridges: [],
    learningIntroduction: ownDelta.learningIntroduction
  };
  const filed = stackedReviewDocument(baseline, { proposal: firstProposal }, removedGlucose);
  assert.deepEqual(filed.bridges, []);
  assert.equal(filed.clusters[1].fact, "Cells release energy from food.");

  const termsOnly = {
    ...baseline,
    clusters: [
      baseline.clusters[0],
      { ...baseline.clusters[1], fact: "Cells release energy from food.", terms: ["atp", "heat"] }
    ]
  };
  const strippedFields = independentReviewDocument(baseline, [{ proposal: firstProposal }], termsOnly);
  assert.equal(strippedFields.clusters[1].fact, "Cells release energy.");
  assert.deepEqual(strippedFields.clusters[1].terms, ["atp", "heat"]);
  const termsFromBaseline = {
    ...baseline,
    clusters: [
      baseline.clusters[0],
      { ...baseline.clusters[1], terms: ["atp", "heat"] }
    ]
  };
  const overlaid = stackedReviewDocument(baseline, { proposal: firstProposal }, termsFromBaseline);
  assert.equal(overlaid.clusters[1].fact, "Cells release energy from food.");
  assert.deepEqual(overlaid.clusters[1].terms, ["atp", "heat"]);
  assert.equal(overlaid.bridges[0].term, "glucose");

  const bridgeOnly = {
    ...baseline,
    bridges: [{ term: "glucose", clusters: ["photosynthesis", "cellular-respiration"], fact: "Sugar carries the energy." }]
  };
  const deletedBridge = {
    ...baseline,
    learningIntroduction: { text: "Energy moves from light to heat.", audience: "recommended" }
  };
  const resurrected = stackedReviewDocument(baseline, { proposal: bridgeOnly }, deletedBridge);
  assert.equal(resurrected.bridges[0].term, "glucose");
  const keptDeletion = stackedReviewDocument(baseline, { proposal: bridgeOnly }, deletedBridge, { loaded: true });
  assert.deepEqual(keptDeletion.bridges, []);
  assert.equal(keptDeletion.learningIntroduction.text, "Energy moves from light to heat.");

  const board = {
    ...baseline,
    learningIntroduction: { requirement: "optional", credit: "Editor", revision: 2, content: { text: "Old lesson." } }
  };
  const donor = {
    learningIntroduction: {
      requirement: "recommended",
      credit: "Other agent",
      revision: 9,
      content: { text: "Start from the light." }
    }
  };
  const picked = documentWithLesson(board, donor);
  assert.equal(picked.learningIntroduction.content.text, "Start from the light.");
  assert.equal(picked.learningIntroduction.requirement, "recommended");
  assert.equal(picked.learningIntroduction.credit, "Editor");
  assert.equal(picked.learningIntroduction.revision, 2);
  assert.equal(picked.clusters[1].fact, "Cells release energy.");
}
