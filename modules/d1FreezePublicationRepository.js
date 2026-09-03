function changes(result) {
  return Number(result?.meta?.changes || 0);
}

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

export class D1FreezePublicationRepository {
  constructor(database) {
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async get(id) {
    const row = await this.database.prepare(
      "SELECT * FROM freeze_requests WHERE id = ?"
    ).bind(id).first();
    if (!row) throw new Error(`Unknown freeze request: ${id}`);
    return record(row);
  }

  async findActive() {
    const row = await this.database.prepare(`
      SELECT * FROM freeze_requests
      WHERE status IN ('requested', 'pull-request-open')
      ORDER BY updated_at DESC LIMIT 1
    `).first();
    return row ? record(row) : null;
  }

  async reserve({ planHash, plan, summary, additionalContext = "" }) {
    const active = await this.findActive();
    if (active) return { ...active, reserved: false };
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const branch = `authoring/freeze-${id.slice(0, 8)}`;
    try {
      await this.database.prepare(`
        INSERT INTO freeze_requests (
          id, status, plan_hash, plan_json, github_branch, summary, additional_context,
          requested_at, updated_at
        ) VALUES (?, 'requested', ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, planHash, JSON.stringify(plan), branch, summary, additionalContext, now, now
      ).run();
    } catch (error) {
      if (!String(error?.message || error).includes("UNIQUE constraint failed")) throw error;
      const raced = await this.findActive();
      if (raced) return { ...raced, reserved: false };
      throw error;
    }
    return { ...(await this.get(id)), reserved: true };
  }

  async recordPullRequest({ id, commitSha, pullRequest }) {
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE freeze_requests
      SET status = 'pull-request-open', github_commit_sha = ?,
          github_pr_number = ?, github_pr_url = ?, error_message = NULL,
          updated_at = ?
      WHERE id = ?
    `).bind(commitSha, pullRequest.number, pullRequest.url, now, id).run();
    if (changes(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async recordAmendedCommit({ id, planHash, plan, summary, additionalContext, commitSha }) {
    const now = new Date().toISOString();
    const result = await this.database.prepare(`
      UPDATE freeze_requests
      SET plan_hash = ?, plan_json = ?, summary = ?, additional_context = ?,
          github_commit_sha = ?, error_message = NULL, updated_at = ?
      WHERE id = ? AND status = 'pull-request-open'
    `).bind(planHash, JSON.stringify(plan), summary, additionalContext, commitSha, now, id).run();
    if (changes(result) !== 1) throw new Error(`Freeze request ${id} is no longer open`);
    return this.get(id);
  }

  async reconcile({ id, pullRequest }) {
    const status = pullRequest.merged
      ? "merged"
      : pullRequest.state === "open" ? "pull-request-open" : "closed";
    const result = await this.database.prepare(`
      UPDATE freeze_requests
      SET status = ?, github_commit_sha = COALESCE(?, github_commit_sha),
          updated_at = ?
      WHERE id = ?
    `).bind(status, pullRequest.headCommitSha || null, new Date().toISOString(), id).run();
    if (changes(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async markFailed({ id, message }) {
    const result = await this.database.prepare(`
      UPDATE freeze_requests
      SET status = 'failed', error_message = ?, updated_at = ?
      WHERE id = ?
    `).bind(message, new Date().toISOString(), id).run();
    if (changes(result) !== 1) throw new Error(`Unknown freeze request: ${id}`);
    return this.get(id);
  }

  async findUnreconciledMerges() {
    const result = await this.database.prepare(`
      SELECT * FROM freeze_requests
      WHERE status = 'merged' AND reconciled_at IS NULL
      ORDER BY updated_at ASC
    `).all();
    return (result.results || []).map(record);
  }

  async markReconciled(id) {
    const result = await this.database.prepare(`
      UPDATE freeze_requests
      SET reconciled_at = ?, updated_at = ?
      WHERE id = ? AND status = 'merged' AND reconciled_at IS NULL
    `).bind(new Date().toISOString(), new Date().toISOString(), id).run();
    if (changes(result) !== 1) throw new Error(`Freeze request ${id} is not awaiting reconciliation`);
    return this.get(id);
  }
}

export default D1FreezePublicationRepository;
