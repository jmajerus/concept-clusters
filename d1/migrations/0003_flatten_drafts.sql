PRAGMA foreign_keys = OFF;

-- Drafts become a single mutable row: last write wins, no revision ledger.
-- Real version history lives in Git once a draft is published.
CREATE TABLE publication_requests_new (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('requested', 'pull-request-open', 'merged', 'rejected', 'failed')
  ),
  content_hash TEXT NOT NULL,
  approval_token TEXT,
  base_commit_sha TEXT,
  github_branch TEXT,
  github_commit_sha TEXT,
  github_pr_number INTEGER,
  github_pr_url TEXT,
  error_message TEXT,
  requested_by TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

INSERT INTO publication_requests_new (
  id, draft_id, status, content_hash, approval_token, base_commit_sha,
  github_branch, github_commit_sha, github_pr_number, github_pr_url,
  error_message, requested_by, requested_at, updated_at
)
SELECT
  id, draft_id, status, content_hash, approval_token, base_commit_sha,
  github_branch, github_commit_sha, github_pr_number, github_pr_url,
  error_message, requested_by, requested_at, updated_at
FROM publication_requests;

DROP TABLE publication_requests;
ALTER TABLE publication_requests_new RENAME TO publication_requests;

CREATE UNIQUE INDEX publication_requests_approval_token
  ON publication_requests(approval_token);
CREATE INDEX publication_requests_draft_updated
  ON publication_requests(draft_id, updated_at DESC);

CREATE TABLE puzzle_drafts_new (
  id TEXT PRIMARY KEY,
  puzzle_id TEXT,
  owner_subject TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'review', 'submitted', 'published', 'archived')
  ),
  document_jsonld TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  validation_json TEXT,
  base_commit_sha TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

INSERT INTO puzzle_drafts_new (
  id, puzzle_id, owner_subject, title, status,
  document_jsonld, content_hash, validation_json,
  base_commit_sha, created_at, updated_at
)
SELECT
  d.id, d.puzzle_id, d.owner_subject, d.title, d.status,
  r.document_jsonld, r.content_hash, r.validation_json,
  d.base_commit_sha, d.created_at, d.updated_at
FROM puzzle_drafts d
JOIN puzzle_draft_revisions r
  ON r.draft_id = d.id AND r.revision = d.head_revision;

DROP TABLE validation_runs;
DROP TABLE puzzle_draft_revisions;

DROP TABLE puzzle_drafts;
ALTER TABLE puzzle_drafts_new RENAME TO puzzle_drafts;

CREATE INDEX puzzle_drafts_owner_updated
  ON puzzle_drafts(owner_subject, updated_at DESC);
CREATE INDEX puzzle_drafts_owner_status_updated
  ON puzzle_drafts(owner_subject, status, updated_at DESC);

PRAGMA foreign_keys = ON;
