-- Content documents: catalogues and categories as data, plus a shared
-- published row for puzzles/catalogues/categories. Drafts stay
-- owner-scoped; published ids are global. History of published revisions
-- lives here, not in git.

PRAGMA foreign_keys = ON;

CREATE TABLE content_drafts (
  kind TEXT NOT NULL CHECK (kind IN ('catalogue', 'category')),
  id TEXT NOT NULL,
  owner_subject TEXT NOT NULL,
  title TEXT,
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind, id, owner_subject)
) STRICT;

CREATE INDEX content_drafts_owner_updated
  ON content_drafts(owner_subject, kind, updated_at DESC);

CREATE TABLE published_documents (
  kind TEXT NOT NULL CHECK (kind IN ('puzzle', 'catalogue', 'category')),
  id TEXT NOT NULL,
  title TEXT,
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind, id)
) STRICT;

CREATE TABLE published_document_revisions (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (kind, id, revision),
  FOREIGN KEY (kind, id) REFERENCES published_documents(kind, id)
) STRICT;
