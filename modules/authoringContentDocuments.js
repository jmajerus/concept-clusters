import { DraftNotFoundError } from "./draftRepository.js";

// Working copies live in Postgres. Published rows, including the review
// stamp players do not read but Freeze and the draft page do, stay on D1.
export function createSplitContentDocuments({
  drafts,
  published,
  reviewEvents,
  modelSuggestions = null,
  freezeRepository = null
}) {
  if (!drafts || !published || !reviewEvents) {
    throw new Error("Split content documents need drafts, published rows, and review events");
  }

  async function recordPuzzleReviewEvent(input) {
    const eventType = input.eventType || "review";
    if (eventType !== "review") {
      const event = await reviewEvents.insert(input);
      return eventType === "proposed" ? event : null;
    }
    await published.getPublished({ kind: "puzzle", id: input.id });
    const reviewedAt = input.reviewedAt || new Date().toISOString();
    await reviewEvents.insert({ ...input, eventType: "review", reviewedAt });
    await published.touchPublishedReviewStamp({
      id: input.id,
      reviewerKind: input.reviewerKind,
      reviewedAt
    });
    return published.getPublished({ kind: "puzzle", id: input.id });
  }

  return {
    database: published.database,
    modelSuggestions,
    freezeRepository,
    getDraft: input => drafts.getDraft(input),
    createDraft: input => drafts.createDraft(input),
    saveDraft: input => drafts.saveDraft(input),
    listDrafts: input => drafts.listDrafts(input),
    deleteDraft: input => drafts.deleteDraft(input),
    revertDraft: async ({ kind, id, actor }) => {
      const publishedRow = await published.getPublished({ kind, id });
      try {
        const current = await drafts.getDraft({ kind, id, actor });
        return drafts.saveDraft({
          kind,
          id,
          document: publishedRow.document,
          actor,
          expectedRevision: current.revision
        });
      } catch (error) {
        if (!(error instanceof DraftNotFoundError)) throw error;
        return drafts.createDraft({
          kind,
          id,
          document: publishedRow.document,
          actor
        });
      }
    },
    getPublished: input => published.getPublished(input),
    getPublishedAtRevision: input => published.getPublishedAtRevision(input),
    listPublished: input => published.listPublished(input),
    seedPublishedIfAbsent: input => published.seedPublishedIfAbsent(input),
    seedPublishedManyIfAbsent: input => published.seedPublishedManyIfAbsent(input),
    unpublish: input => published.unpublish(input),
    setFreezeCue: input => published.setFreezeCue(input),
    saveLayout: input => published.saveLayout(input),
    clearLayout: input => published.clearLayout(input),
    publish: async input => {
      const publishedRow = await published.publish({
        ...input,
        reviewDecisions: null
      });
      if (input.reviewDecisions?.length) {
        await reviewEvents.insertDecisions(
          input.id,
          input.reviewDecisions,
          publishedRow.revision
        );
      }
      return published.getPublished({ kind: input.kind, id: input.id });
    },
    recordPuzzleReviewEvent,
    recordPuzzleAgentReview: input => recordPuzzleReviewEvent({ ...input, reviewerKind: "agent" }),
    recordPuzzleHumanReview: input => recordPuzzleReviewEvent({ ...input, reviewerKind: "human" }),
    listPuzzleReviewEvents: input => reviewEvents.listPuzzleReviewEvents(input),
    listOpenReviewProposals: input => reviewEvents.listOpenReviewProposals(input),
    listPuzzleIdsWithOpenReviewProposals: () => reviewEvents.listPuzzleIdsWithOpenReviewProposals(),
    getPuzzleReviewEvent: input => reviewEvents.getPuzzleReviewEvent(input),
    listPuzzleReviewIssues: input => reviewEvents.listPuzzleReviewIssues(input),
    getPuzzleReviewIssue: input => reviewEvents.getPuzzleReviewIssue(input)
  };
}
