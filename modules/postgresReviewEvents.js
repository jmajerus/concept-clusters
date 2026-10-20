import { assertDraftId } from "./draftRepository.js";
import {
  limitReviewIssues,
  reviewEventInput,
  reviewEventRecord,
  reviewIssueThreads
} from "./contentDocumentRepository.js";

const INSERT_SQL = `
  INSERT INTO puzzle_review_events (
    puzzle_id, reviewer_kind, reviewed_at, comments, outcome,
    draft_revision, guidance_major, guidance_minor, issue_id, event_type,
    proposal_json, base_published_revision, published_revision,
    client_system, client_model, client_name, source_event_id
  ) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13,
    $14, $15, $16, $17
  )
  RETURNING *
`;

function insertValues(puzzleId, reviewedAt, event) {
  return [
    puzzleId,
    event.reviewerKind,
    reviewedAt,
    event.comments,
    event.outcome,
    event.draftRevision,
    event.guidance?.major ?? null,
    event.guidance?.minor ?? null,
    event.issueId,
    event.eventType,
    event.proposalJson,
    event.basePublishedRevision,
    event.publishedRevision,
    event.clientSystem,
    event.clientModel,
    event.clientName,
    event.sourceEventId
  ];
}

export class PostgresReviewEventStore {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async insert(input) {
    const reviewedAt = input.reviewedAt || new Date().toISOString();
    if (typeof reviewedAt !== "string" || Number.isNaN(Date.parse(reviewedAt))) {
      throw new Error("reviewedAt must be an ISO timestamp");
    }
    const event = reviewEventInput({ ...input, reviewedAt });
    const { rows } = await this.pool.query(
      INSERT_SQL,
      insertValues(input.id, reviewedAt, event)
    );
    return reviewEventRecord(rows[0]);
  }

  async insertDecisions(puzzleId, decisions, publishedRevision, reviewedAt = new Date().toISOString()) {
    for (const decision of decisions || []) {
      const event = reviewEventInput({
        reviewerKind: "human",
        eventType: decision.eventType,
        draftRevision: decision.draftRevision ?? null,
        proposal: decision.proposal ?? null,
        basePublishedRevision: decision.basePublishedRevision ?? null,
        publishedRevision: decision.eventType === "accepted" ? publishedRevision : null,
        sourceEventId: decision.sourceEventId ?? null
      });
      await this.pool.query(INSERT_SQL, insertValues(puzzleId, reviewedAt, event));
    }
  }

  async listPuzzleReviewEvents({ id, limit = 20 }) {
    assertDraftId(id);
    const cappedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = $1
      ORDER BY reviewed_at DESC, id DESC
      LIMIT $2
    `, [id, cappedLimit]);
    return rows.map(reviewEventRecord);
  }

  async listOpenReviewProposals({ id }) {
    assertDraftId(id);
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = $1 AND event_type = 'proposed'
        AND id NOT IN (
          SELECT source_event_id FROM puzzle_review_events
          WHERE puzzle_id = $1 AND source_event_id IS NOT NULL
        )
      ORDER BY reviewed_at ASC, id ASC
    `, [id]);
    return rows.map(reviewEventRecord);
  }

  async listPuzzleIdsWithOpenReviewProposals() {
    const { rows } = await this.pool.query(`
      SELECT DISTINCT proposed.puzzle_id AS puzzle_id
      FROM puzzle_review_events AS proposed
      WHERE proposed.event_type = 'proposed'
        AND NOT EXISTS (
          SELECT 1 FROM puzzle_review_events AS decision
          WHERE decision.puzzle_id = proposed.puzzle_id
            AND decision.source_event_id = proposed.id
        )
    `);
    return rows.map(row => row.puzzle_id);
  }

  async getPuzzleReviewEvent({ id, eventId }) {
    assertDraftId(id);
    if (!Number.isInteger(eventId) || eventId < 1) {
      throw new Error("eventId must be a positive integer");
    }
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_review_events WHERE puzzle_id = $1 AND id = $2
    `, [id, eventId]);
    return rows[0] ? reviewEventRecord(rows[0]) : null;
  }

  async listPuzzleReviewIssues({ id, limit = 50, includeResolved = false, uncapped = false }) {
    assertDraftId(id);
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = $1 AND issue_id IS NOT NULL
      ORDER BY reviewed_at ASC, id ASC
    `, [id]);
    return limitReviewIssues(reviewIssueThreads(rows.map(reviewEventRecord)), {
      limit,
      includeResolved,
      uncapped
    });
  }

  async getPuzzleReviewIssue({ id, issueId }) {
    assertDraftId(id);
    const event = reviewEventInput({
      reviewerKind: "agent",
      issueId,
      eventType: "note",
      comments: "lookup"
    });
    const { rows } = await this.pool.query(`
      SELECT * FROM puzzle_review_events
      WHERE puzzle_id = $1 AND issue_id = $2
      ORDER BY reviewed_at ASC, id ASC
    `, [id, event.issueId]);
    return reviewIssueThreads(rows.map(reviewEventRecord))[0] || null;
  }
}
