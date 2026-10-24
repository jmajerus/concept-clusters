-- Zotero is the editable bibliography during authoring. These rows mirror
-- selected works and retain immutable metadata versions for publication.
-- Puzzle citation links and published bindings follow in a later migration.

CREATE TABLE IF NOT EXISTS citation_sources (
  id TEXT PRIMARY KEY,
  zotero_library TEXT NOT NULL,
  zotero_item_key TEXT NOT NULL,
  zotero_collection_key TEXT NOT NULL,
  citekey TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  year TEXT,
  doi TEXT,
  url TEXT,
  current_revision INTEGER NOT NULL CHECK (current_revision >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (zotero_library, zotero_item_key),
  UNIQUE (zotero_library, citekey)
);

CREATE INDEX IF NOT EXISTS citation_sources_title_search
  ON citation_sources (LOWER(title));
CREATE INDEX IF NOT EXISTS citation_sources_author_search
  ON citation_sources (LOWER(author));
CREATE INDEX IF NOT EXISTS citation_sources_doi_search
  ON citation_sources (LOWER(doi));

CREATE TABLE IF NOT EXISTS citation_source_revisions (
  source_id TEXT NOT NULL REFERENCES citation_sources(id) ON DELETE RESTRICT,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  metadata_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  PRIMARY KEY (source_id, revision)
);
