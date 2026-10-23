-- Which Zotero item each cited work became (citationWorkKey.js groups
-- citations into works). The backfill records a row as soon as it files or
-- creates the item, so a rerun never creates a second copy, and the usage
-- index can link citations to items before Better BibTeX assigns a citekey.
CREATE TABLE IF NOT EXISTS citation_work_items (
  work_key TEXT PRIMARY KEY,
  zotero_library TEXT NOT NULL,
  zotero_item_key TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('created', 'matched')),
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS citation_work_items_by_item
  ON citation_work_items (zotero_library, zotero_item_key);

-- Generated browse subcollections under the Concept Clusters collection, one
-- per domain, category, or large-category subcategory. The sync owns these
-- collections' membership; path_key is the taxonomy node, so a renamed
-- category renames its collection instead of creating another.
CREATE TABLE IF NOT EXISTS citation_zotero_collections (
  path_key TEXT PRIMARY KEY,
  zotero_collection_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_path_key TEXT,
  recorded_at TEXT NOT NULL
);
