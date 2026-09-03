CREATE TABLE freeze_requests (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  plan_hash TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  github_branch TEXT NOT NULL,
  github_commit_sha TEXT,
  github_pr_number INTEGER,
  github_pr_url TEXT,
  summary TEXT NOT NULL,
  additional_context TEXT,
  error_message TEXT,
  requested_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  reconciled_at TEXT
);

CREATE UNIQUE INDEX freeze_requests_one_active
  ON freeze_requests(status)
  WHERE status IN ('requested', 'pull-request-open');
