PRAGMA foreign_keys = ON;

CREATE TABLE puzzle_drafts (
  id TEXT PRIMARY KEY,
  puzzle_id TEXT,
  owner_subject TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'review', 'submitted', 'published', 'archived')
  ),
  head_revision INTEGER NOT NULL CHECK (head_revision >= 1),
  base_commit_sha TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE INDEX puzzle_drafts_owner_updated
  ON puzzle_drafts(owner_subject, updated_at DESC);
CREATE INDEX puzzle_drafts_owner_status_updated
  ON puzzle_drafts(owner_subject, status, updated_at DESC);

CREATE TABLE puzzle_draft_revisions (
  draft_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  document_jsonld TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  validation_json TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (draft_id, revision),
  FOREIGN KEY (draft_id) REFERENCES puzzle_drafts(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE validation_runs (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  valid INTEGER NOT NULL CHECK (valid IN (0, 1)),
  errors_json TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (draft_id, revision)
    REFERENCES puzzle_draft_revisions(draft_id, revision) ON DELETE CASCADE
) STRICT;

CREATE INDEX validation_runs_draft_revision
  ON validation_runs(draft_id, revision, created_at DESC);

CREATE TABLE publication_requests (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('requested', 'pull-request-open', 'merged', 'rejected', 'failed')
  ),
  github_pr_number INTEGER,
  github_commit_sha TEXT,
  content_hash TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (draft_id, revision)
    REFERENCES puzzle_draft_revisions(draft_id, revision)
) STRICT;
