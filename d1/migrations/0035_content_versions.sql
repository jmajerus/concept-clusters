-- Content versions: one counter per watched table, bumped by a trigger on
-- every insert, update, and delete, whoever the writer is (the local
-- authoring server, the hosted MCP worker, a tools/ script, or wrangler d1
-- execute). The local authoring server's read cache (modules/d1ReadCache.js)
-- reuses a cached result only while every table it read from still has the
-- version it had when the result was fetched.
CREATE TABLE IF NOT EXISTS content_versions (
  table_name TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 0
) STRICT;

INSERT OR IGNORE INTO content_versions (table_name) VALUES
  ('published_documents'),
  ('puzzle_drafts'),
  ('content_drafts'),
  ('wiki_link_checks');

CREATE TRIGGER IF NOT EXISTS content_versions_published_documents_insert
AFTER INSERT ON published_documents BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'published_documents';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_published_documents_update
AFTER UPDATE ON published_documents BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'published_documents';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_published_documents_delete
AFTER DELETE ON published_documents BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'published_documents';
END;

CREATE TRIGGER IF NOT EXISTS content_versions_puzzle_drafts_insert
AFTER INSERT ON puzzle_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'puzzle_drafts';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_puzzle_drafts_update
AFTER UPDATE ON puzzle_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'puzzle_drafts';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_puzzle_drafts_delete
AFTER DELETE ON puzzle_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'puzzle_drafts';
END;

CREATE TRIGGER IF NOT EXISTS content_versions_content_drafts_insert
AFTER INSERT ON content_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'content_drafts';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_content_drafts_update
AFTER UPDATE ON content_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'content_drafts';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_content_drafts_delete
AFTER DELETE ON content_drafts BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'content_drafts';
END;

CREATE TRIGGER IF NOT EXISTS content_versions_wiki_link_checks_insert
AFTER INSERT ON wiki_link_checks BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'wiki_link_checks';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_wiki_link_checks_update
AFTER UPDATE ON wiki_link_checks BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'wiki_link_checks';
END;
CREATE TRIGGER IF NOT EXISTS content_versions_wiki_link_checks_delete
AFTER DELETE ON wiki_link_checks BEGIN
  UPDATE content_versions SET version = version + 1 WHERE table_name = 'wiki_link_checks';
END;
