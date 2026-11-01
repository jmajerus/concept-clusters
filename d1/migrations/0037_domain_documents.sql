-- Domains become published documents like categories ({ id, title, info? };
-- docs/dev-briefs/subjects-from-terminology-mcp.md, "Domains are data").
-- SQLite cannot alter a CHECK constraint, so published_documents is rebuilt
-- with the same columns. Dropping a parent that rows still reference counts
-- as a foreign-key violation even when the replacement satisfies them, so
-- published_document_revisions is set aside first and restored after.

CREATE TABLE published_document_revisions_copy AS
  SELECT * FROM published_document_revisions;
DROP TABLE published_document_revisions;

CREATE TABLE published_documents_new (
  kind TEXT NOT NULL CHECK (kind IN ('puzzle', 'catalogue', 'category', 'domain')),
  id TEXT NOT NULL,
  title TEXT,
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  withdrawn_at TEXT,
  cued_for_freeze_at TEXT,
  cued_for_freeze_by TEXT,
  last_agent_reviewed_at TEXT,
  last_human_reviewed_at TEXT,
  layout_json TEXT,
  first_published_at TEXT,
  content_revised_at TEXT,
  PRIMARY KEY (kind, id)
) STRICT;

INSERT INTO published_documents_new (
  kind, id, title, document, content_hash, revision, published_by,
  published_at, updated_at, withdrawn_at, cued_for_freeze_at,
  cued_for_freeze_by, last_agent_reviewed_at, last_human_reviewed_at,
  layout_json, first_published_at, content_revised_at
)
SELECT
  kind, id, title, document, content_hash, revision, published_by,
  published_at, updated_at, withdrawn_at, cued_for_freeze_at,
  cued_for_freeze_by, last_agent_reviewed_at, last_human_reviewed_at,
  layout_json, first_published_at, content_revised_at
FROM published_documents;

DROP TABLE published_documents;
ALTER TABLE published_documents_new RENAME TO published_documents;

CREATE INDEX published_documents_puzzle_last_agent_reviewed_idx
  ON published_documents(kind, last_agent_reviewed_at);
CREATE INDEX published_documents_first_published
  ON published_documents(kind, withdrawn_at, first_published_at);

CREATE TABLE published_document_revisions (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  content_revised_at TEXT,
  PRIMARY KEY (kind, id, revision),
  FOREIGN KEY (kind, id) REFERENCES published_documents(kind, id)
) STRICT;

INSERT INTO published_document_revisions (
  kind, id, revision, document, content_hash, published_by, published_at,
  content_revised_at
)
SELECT
  kind, id, revision, document, content_hash, published_by, published_at,
  content_revised_at
FROM published_document_revisions_copy;

DROP TABLE published_document_revisions_copy;
