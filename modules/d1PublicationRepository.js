import {
  DraftNotFoundError,
  normalizeDraftActor
} from "./draftRepository.js";

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

function publication(row) {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    contentHash: row.content_hash,
    approvalToken: row.approval_token,
    baseCommitSha: row.base_commit_sha,
    githubBranch: row.github_branch,
    githubCommitSha: row.github_commit_sha,
    githubPrNumber: row.github_pr_number,
    githubPrUrl: row.github_pr_url,
    error: row.error_message,
    requestedAt: row.requested_at,
    updatedAt: row.updated_at
  };
}

function branchName(puzzleId, requestId) {
  const safePuzzle = String(puzzleId || "puzzle")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "puzzle";
  return `authoring/${safePuzzle}-${requestId.slice(0, 8)}`;
}

export class D1PublicationRepository {
  constructor(database) {
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async ownedRow(requestId, actor) {
    const owner = normalizeDraftActor(actor).subject;
    return this.database.prepare(`
      SELECT p.* FROM publication_requests p
      JOIN puzzle_drafts d ON d.id = p.draft_id
      WHERE p.id = ? AND d.owner_subject = ?
    `).bind(requestId, owner).first();
  }

  async get({ requestId, actor }) {
    const row = await this.ownedRow(requestId, actor);
    if (!row) {
      throw new Error(
        `Unknown publication request: ${requestId}. Request ids come from ` +
        "submit_puzzle_for_publication's response and are scoped to the " +
        "account that created them -- double check the id, or that this is " +
        "the same authenticated account that submitted it."
      );
    }
    return publication(row);
  }

  // The most recently touched open publication request for a draft, if
  // any -- used by submit() to decide whether a resubmission should
  // amend an existing pull request instead of opening a new one.
  // Nothing has ever enforced "at most one open request per draft" (only
  // approval_token is unique, not draft_id), so ORDER BY ... LIMIT 1 is
  // load-bearing, not defensive: a draft resubmitted with different
  // options in the past could already have more than one
  // 'pull-request-open' row. This picks the most recently touched one as
  // "the" active one going forward; any older ones stay independently
  // reachable via their own request id, not broken, just untracked here.
  async findActiveRequest({ draftId, actor }) {
    const owner = normalizeDraftActor(actor).subject;
    const row = await this.database.prepare(`
      SELECT p.* FROM publication_requests p
      JOIN puzzle_drafts d ON d.id = p.draft_id
      WHERE p.draft_id = ? AND d.owner_subject = ? AND p.status = 'pull-request-open'
      ORDER BY p.updated_at DESC LIMIT 1
    `).bind(draftId, owner).first();
    return row ? publication(row) : null;
  }

  async reserve({
    draftId,
    contentHash,
    approvalToken,
    baseCommitSha,
    puzzleId,
    actor
  }) {
    const owner = normalizeDraftActor(actor).subject;
    const existing = await this.database.prepare(`
      SELECT p.* FROM publication_requests p
      JOIN puzzle_drafts d ON d.id = p.draft_id
      WHERE p.approval_token = ? AND d.owner_subject = ?
    `).bind(approvalToken, owner).first();
    if (existing) return publication(existing);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      INSERT INTO publication_requests (
        id, draft_id, status, content_hash, requested_by,
        requested_at, updated_at, approval_token, base_commit_sha,
        github_branch
      )
      SELECT ?, d.id, 'requested', ?, ?, ?, ?, ?, ?, ?
      FROM puzzle_drafts d
      WHERE d.id = ? AND d.owner_subject = ? AND d.content_hash = ?
      ON CONFLICT(approval_token) DO NOTHING
    `).bind(
      id,
      contentHash,
      owner,
      now,
      now,
      approvalToken,
      baseCommitSha,
      branchName(puzzleId, id),
      draftId,
      owner,
      contentHash
    ).run();
    if (changes(result) !== 1) {
      const raced = await this.database.prepare(`
        SELECT p.* FROM publication_requests p
        JOIN puzzle_drafts d ON d.id = p.draft_id
        WHERE p.approval_token = ? AND d.owner_subject = ?
      `).bind(approvalToken, owner).first();
      if (raced) return publication(raced);
      throw new DraftNotFoundError(draftId);
    }
    return this.get({ requestId: id, actor });
  }

  async updateOwned(requestId, actor, sql, bindings) {
    const owner = normalizeDraftActor(actor).subject;
    const result = await this.database.prepare(sql).bind(
      ...bindings,
      new Date().toISOString(),
      requestId,
      owner
    ).run();
    if (changes(result) !== 1) {
      throw new Error(`Unknown publication request: ${requestId}`);
    }
    return this.get({ requestId, actor });
  }

  recordCommit({ requestId, commitSha, actor }) {
    return this.updateOwned(requestId, actor, `
      UPDATE publication_requests
      SET github_commit_sha = ?, status = 'requested', error_message = NULL,
          updated_at = ?
      WHERE id = ? AND EXISTS (
        SELECT 1 FROM puzzle_drafts d
        WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
      )
    `, [commitSha]);
  }

  async recordPullRequest({ requestId, commitSha, pullRequest, actor }) {
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const results = await this.database.batch([
      this.database.prepare(`
        UPDATE publication_requests
        SET github_commit_sha = ?, github_pr_number = ?, github_pr_url = ?,
            status = 'pull-request-open', error_message = NULL, updated_at = ?
        WHERE id = ? AND EXISTS (
          SELECT 1 FROM puzzle_drafts d
          WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
        )
      `).bind(commitSha, pullRequest.number, pullRequest.url, now, requestId, owner),
      this.database.prepare(`
        UPDATE puzzle_drafts SET status = 'submitted', updated_at = ?
        WHERE id = (SELECT draft_id FROM publication_requests WHERE id = ?)
          AND owner_subject = ?
          AND content_hash = (
            SELECT content_hash FROM publication_requests WHERE id = ?
          )
      `).bind(now, requestId, owner, requestId)
    ]);
    if (changes(results[0]) !== 1) {
      throw new Error(`Unknown publication request: ${requestId}`);
    }
    return this.get({ requestId, actor });
  }

  // Records a force-pushed amend onto an already-open request's existing
  // branch/PR -- github_branch/github_pr_number/github_pr_url are
  // deliberately never touched here, only the content-identifying
  // columns. approval_token and base_commit_sha are overwritten (not
  // just content_hash/github_commit_sha) so a *second* amend's no-op
  // short-circuit in submit() compares against this fresh token, not a
  // permanently stale original one. The status = 'pull-request-open'
  // guard defends against a race where this row got reconciled to
  // merged/rejected between submit()'s check and this write; if that
  // happens, changes(...) !== 1 and this throws -- submit() must not
  // call markFailed() on that, since the PR itself is untouched and
  // still perfectly resumable on the next call.
  async recordAmendedCommit({ requestId, contentHash, approvalToken, baseCommitSha, commitSha, actor }) {
    const owner = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    const results = await this.database.batch([
      this.database.prepare(`
        UPDATE publication_requests
        SET content_hash = ?, approval_token = ?, base_commit_sha = ?,
            github_commit_sha = ?, error_message = NULL, updated_at = ?
        WHERE id = ? AND status = 'pull-request-open' AND EXISTS (
          SELECT 1 FROM puzzle_drafts d
          WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
        )
      `).bind(contentHash, approvalToken, baseCommitSha, commitSha, now, requestId, owner),
      this.database.prepare(`
        UPDATE puzzle_drafts SET status = 'submitted', updated_at = ?
        WHERE id = (SELECT draft_id FROM publication_requests WHERE id = ?)
          AND owner_subject = ? AND content_hash = ?
      `).bind(now, requestId, owner, contentHash)
    ]);
    if (changes(results[0]) !== 1) {
      throw new Error(`Unknown or no-longer-open publication request: ${requestId}`);
    }
    return this.get({ requestId, actor });
  }

  // A directly-applied review suggestion changes the GitHub branch but not
  // the authored D1 draft, so only the recorded remote head advances here.
  // Keeping content_hash/approval_token untouched is deliberate: an actual
  // later draft edit still produces a different plan and supersedes the PR
  // branch through submit(), while resubmitting an unchanged draft remains a
  // no-op and does not erase the accepted review commit.
  recordReviewSuggestionCommit({ requestId, commitSha, actor }) {
    return this.updateOwned(requestId, actor, `
      UPDATE publication_requests
      SET github_commit_sha = ?, error_message = NULL, updated_at = ?
      WHERE id = ? AND status = 'pull-request-open' AND EXISTS (
        SELECT 1 FROM puzzle_drafts d
        WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
      )
    `, [commitSha]);
  }

  markFailed({ requestId, message, actor }) {
    return this.updateOwned(requestId, actor, `
      UPDATE publication_requests
      SET status = 'failed', error_message = ?, updated_at = ?
      WHERE id = ? AND EXISTS (
        SELECT 1 FROM puzzle_drafts d
        WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
      )
    `, [String(message).slice(0, 1000)]);
  }

  async reconcile({ requestId, pullRequest, actor }) {
    const owner = normalizeDraftActor(actor).subject;
    const status = pullRequest.merged
      ? "merged"
      : pullRequest.state === "open" ? "pull-request-open" : "rejected";
    const now = new Date().toISOString();
    const results = await this.database.batch([
      this.database.prepare(`
        UPDATE publication_requests
        SET status = ?, github_pr_url = ?,
            github_commit_sha = COALESCE(?, github_commit_sha), updated_at = ?
        WHERE id = ? AND EXISTS (
          SELECT 1 FROM puzzle_drafts d
          WHERE d.id = publication_requests.draft_id AND d.owner_subject = ?
        )
      `).bind(
        status,
        pullRequest.url,
        pullRequest.merged ? pullRequest.mergeCommitSha : null,
        now,
        requestId,
        owner
      ),
      this.database.prepare(`
        UPDATE puzzle_drafts SET status = ?, updated_at = ?
        WHERE id = (SELECT draft_id FROM publication_requests WHERE id = ?)
          AND owner_subject = ?
          AND content_hash = (
            SELECT content_hash FROM publication_requests WHERE id = ?
          )
      `).bind(
        status === "merged" ? "published" : status === "rejected" ? "review" : "submitted",
        now,
        requestId,
        owner,
        requestId
      )
    ]);
    if (changes(results[0]) !== 1) {
      throw new Error(`Unknown publication request: ${requestId}`);
    }
    return this.get({ requestId, actor });
  }
}

export default D1PublicationRepository;
