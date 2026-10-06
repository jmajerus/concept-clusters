import assert from "node:assert/strict";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import {
  contentRevisedStamp,
  lessonPublicationLine,
  samePlayerFacingProjection
} from "../modules/playerFacingRevision.js";

export const name = "player-facing revision mark";

const actor = { subject: "author-1" };

function puzzle(overrides = {}) {
  return {
    id: "revised-mark",
    title: "Revised mark",
    category: "Science",
    clusters: [{ id: "a", name: "A", terms: ["one", "two"] }],
    bridges: [],
    ...overrides
  };
}

export async function run() {
  assert.equal(lessonPublicationLine({
    firstPublishedAt: "2026-01-15T00:00:00.000Z"
  }), "First published January 2026");
  assert.equal(lessonPublicationLine({
    firstPublishedAt: "2026-01-15T00:00:00.000Z",
    contentRevisedAt: "2026-01-20T00:00:00.000Z"
  }), "First published January 2026");
  assert.equal(lessonPublicationLine({
    firstPublishedAt: "2026-01-15T00:00:00.000Z",
    contentRevisedAt: "2026-03-02T00:00:00.000Z"
  }), "Revised March 2026");
  assert.equal(samePlayerFacingProjection(
    puzzle({ category: "History", tags: ["shelf"] }),
    puzzle()
  ), true);
  assert.equal(samePlayerFacingProjection(
    puzzle(),
    puzzle({ learningIntroduction: { requirement: "optional", content: { text: "New lesson." } } })
  ), false);

  const repo = createMemoryContentDocumentRepository();
  const first = await repo.publish({
    kind: "puzzle",
    id: "revised-mark",
    document: puzzle(),
    actor,
    markRevised: true
  });
  assert.equal(first.contentRevisedAt, null);

  const typo = await repo.publish({
    kind: "puzzle",
    id: "revised-mark",
    document: puzzle({ title: "Revised mark." }),
    actor
  });
  assert.equal(typo.contentRevisedAt, null);

  const marked = await repo.publish({
    kind: "puzzle",
    id: "revised-mark",
    document: puzzle({
      title: "Revised mark.",
      learningIntroduction: { requirement: "optional", content: { text: "New lesson." } }
    }),
    actor,
    markRevised: true
  });
  assert.ok(marked.contentRevisedAt);

  const shelf = await repo.publish({
    kind: "puzzle",
    id: "revised-mark",
    document: puzzle({
      title: "Revised mark.",
      category: "History",
      tags: ["shelf"],
      learningIntroduction: { requirement: "optional", content: { text: "New lesson." } }
    }),
    actor,
    markRevised: true
  });
  assert.equal(shelf.contentRevisedAt, marked.contentRevisedAt);

  const ignored = contentRevisedStamp({
    kind: "puzzle",
    previousDocument: puzzle(),
    nextDocument: puzzle({ category: "History" }),
    markRevised: true,
    now: "2026-05-01T00:00:00.000Z",
    previousStamp: "2026-03-01T00:00:00.000Z"
  });
  assert.equal(ignored.marked, false);
  assert.equal(ignored.live, "2026-03-01T00:00:00.000Z");
}
