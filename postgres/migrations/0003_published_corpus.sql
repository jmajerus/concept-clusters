-- Published corpus the LAN reads and writes. D1 keeps a replica of the
-- current public rows; published_replica_queue is the one pending sync per
-- kind and id. A later edit replaces the earlier one. content_hash here is
-- the public snapshot hash (document hash, layout, withdrawal, and the
-- public timestamps), not the document hash alone.

CREATE TABLE IF NOT EXISTS published_documents (
  kind TEXT NOT NULL CHECK (kind IN ('puzzle', 'catalogue', 'category')),
  id TEXT NOT NULL,
  title TEXT,
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  first_published_at TEXT,
  content_revised_at TEXT,
  updated_at TEXT NOT NULL,
  last_agent_reviewed_at TEXT,
  last_human_reviewed_at TEXT,
  withdrawn_at TEXT,
  cued_for_freeze_at TEXT,
  cued_for_freeze_by TEXT,
  layout_json TEXT,
  PRIMARY KEY (kind, id)
);

CREATE INDEX IF NOT EXISTS published_documents_first_published
  ON published_documents(kind, withdrawn_at, first_published_at);

CREATE TABLE IF NOT EXISTS published_document_revisions (
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
);

CREATE TABLE IF NOT EXISTS published_replica_queue (
  kind TEXT NOT NULL CHECK (kind IN ('puzzle', 'catalogue', 'category', 'site_settings')),
  id TEXT NOT NULL,
  generation TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  enqueued_at TEXT NOT NULL,
  PRIMARY KEY (kind, id)
);

CREATE INDEX IF NOT EXISTS published_replica_queue_enqueued
  ON published_replica_queue(enqueued_at, kind, id);
