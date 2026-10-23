-- Derived pilot index. A separate refresh reads existing published puzzle
-- documents; authoring saves and publication do not depend on these rows.

CREATE TABLE IF NOT EXISTS citation_usage_observations (
  puzzle_id TEXT NOT NULL,
  citation_index INTEGER NOT NULL CHECK (citation_index >= 0),
  citation_json TEXT NOT NULL,
  citation_hash TEXT NOT NULL,
  source_id TEXT REFERENCES citation_sources(id) ON DELETE SET NULL,
  match_basis TEXT,
  match_status TEXT NOT NULL CHECK (match_status IN ('inferred', 'ambiguous', 'unmatched')),
  puzzle_title TEXT,
  citation_title TEXT NOT NULL,
  citation_author TEXT,
  citation_year TEXT,
  citation_url TEXT,
  indexed_at TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, citation_index)
);

CREATE INDEX IF NOT EXISTS citation_usage_by_source
  ON citation_usage_observations (source_id, puzzle_id);
CREATE INDEX IF NOT EXISTS citation_usage_by_title
  ON citation_usage_observations (LOWER(citation_title));

CREATE TABLE IF NOT EXISTS citation_usage_topics (
  puzzle_id TEXT NOT NULL,
  citation_index INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  is_primary INTEGER NOT NULL CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (puzzle_id, citation_index, category_id),
  FOREIGN KEY (puzzle_id, citation_index)
    REFERENCES citation_usage_observations(puzzle_id, citation_index)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS citation_usage_topics_lookup
  ON citation_usage_topics (category_id, subcategory_id, puzzle_id);

CREATE TABLE IF NOT EXISTS citation_usage_index_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  indexed_at TEXT NOT NULL,
  puzzle_count INTEGER NOT NULL,
  observation_count INTEGER NOT NULL
);
