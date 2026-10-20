import { affectedRows, uniqueViolation, withTransaction } from "./postgresPool.js";

function record(row) {
  return {
    id: row.id,
    status: row.status,
    planHash: row.plan_hash,
    plan: JSON.parse(row.plan_json),
    githubBranch: row.github_branch,
    githubCommitSha: row.github_commit_sha || null,
    githubPrNumber: row.github_pr_number == null ? null : Number(row.github_pr_number),
    githubPrUrl: row.github_pr_url || null,
    summary: row.summary,
    additionalContext: row.additional_context || "",
    error: row.error_message || null,
    requestedAt: row.requested_at,
    updatedAt: row.updated_at,
    reconciledAt: row.reconciled_at || null
  };
}

export class PostgresFreezePublicationRepository {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async get(id) {
    const { rows } = await this.pool.query(
      "SELECT * FROM freeze_requests WHERE id = $1",
      [id]
    );
    if (!rows[0]) throw new Error(`Unknown freeze request: ${id}`);
    return record(rows[0]);
  }

  async findActive() {
    const { rows } = await this.pool.query(`
      SELECT * FROM freeze_requests
      WHERE status IN ('requested', 'pull-request-open')
      ORDER BY updated_at DESC LIMIT 1
    `);
    return rows[0] ? record(rows[0]) : null;
  }

  async reserve({ planHash, plan, summary, additionalContext = "" }) {
    const active = await this.findActive();
    if (active) return { ...active, reserved: false };
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const branch = `authoring/freeze-${id.slice(0, 8)}`;
    try {
      await withTransaction(this.pool, client => client.query(`
        INSERT INTO freeze_requests (
          id, status, plan_hash, plan_json, github_branch, summary, additional_context,
          requested_at, updated_at
        ) VALUES ($1, 'requested', $2, $3, $4, $5, $6, $7, $8)
      `, [id, planHash, JSON.stringify(plan), branch, summary, additionalContext, now, now]));
    } catch (error) {
      if (!uniqueViolation(error)) throw error;
      const raced = await this.findActive();
      if (raced) return { ...raced, reserved: false };
      throw error;
    }
    return { ...(await this.get(id)), reserved: true };
  }

  async recordPullRequest({ id, commitSha, pullRequest }) {
    const now = new Date().toISOString();
    const result = await this.pool.query(`
      UPDATE freeze_requests
      SET status = 'pull-request-open', github_commit_sha = $1,
          github_pr_number = $2, github_pr_url = $3, error_message = NULL,
          updated_at = $4
      WHERE id = $5
    `, [commitSha, pullRequest.number, pullRequest.url, now, id]);
    if (affectedRows(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async recordAmendedCommit({ id, planHash, plan, summary, additionalContext, commitSha }) {
    const now = new Date().toISOString();
    const result = await this.pool.query(`
      UPDATE freeze_requests
      SET plan_hash = $1, plan_json = $2, summary = $3, additional_context = $4,
          github_commit_sha = $5, error_message = NULL, updated_at = $6
      WHERE id = $7 AND status = 'pull-request-open'
    `, [planHash, JSON.stringify(plan), summary, additionalContext, commitSha, now, id]);
    if (affectedRows(result) !== 1) throw new Error(`Freeze request ${id} is no longer open`);
    return this.get(id);
  }

  async reconcile({ id, pullRequest }) {
    const status = pullRequest.merged
      ? "merged"
      : pullRequest.state === "open" ? "pull-request-open" : "closed";
    const result = await this.pool.query(`
      UPDATE freeze_requests
      SET status = $1, github_commit_sha = COALESCE($2, github_commit_sha),
          updated_at = $3
      WHERE id = $4
    `, [status, pullRequest.headCommitSha || null, new Date().toISOString(), id]);
    if (affectedRows(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async markFailed({ id, message }) {
    const result = await this.pool.query(`
      UPDATE freeze_requests
      SET status = 'failed', error_message = $1, updated_at = $2
      WHERE id = $3
    `, [message, new Date().toISOString(), id]);
    if (affectedRows(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async findUnreconciledMerges() {
    const { rows } = await this.pool.query(`
      SELECT * FROM freeze_requests
      WHERE status = 'merged' AND reconciled_at IS NULL
      ORDER BY updated_at ASC
    `);
    return rows.map(record);
  }

  async markReconciled(id) {
    const now = new Date().toISOString();
    const result = await this.pool.query(`
      UPDATE freeze_requests
      SET reconciled_at = $1, updated_at = $2
      WHERE id = $3 AND status = 'merged' AND reconciled_at IS NULL
    `, [now, now, id]);
    if (affectedRows(result) !== 1) {
      throw new Error(`Freeze request ${id} is not awaiting reconciliation`);
    }
    return this.get(id);
  }
}
