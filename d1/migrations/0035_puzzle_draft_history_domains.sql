-- Undo snapshots are copied from the live draft inside the save batch.
-- Domain columns are that copy. `document` remains for snapshots taken
-- before this migration; new snapshots leave it null so a stale cache blob
-- is not what undo restores.

PRAGMA foreign_keys = OFF;

CREATE TABLE puzzle_draft_history_new (
  draft_id TEXT NOT NULL,
  seq INTEGER NOT NULL CHECK (seq >= 1),
  document TEXT,
  content_json TEXT,
  pedagogy_json TEXT,
  classification_json TEXT,
  provenance_json TEXT,
  administration_json TEXT,
  content_hash TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (draft_id, seq),
  FOREIGN KEY (draft_id) REFERENCES puzzle_drafts(id) ON DELETE CASCADE
) STRICT;

INSERT INTO puzzle_draft_history_new (
  draft_id, seq, document, content_hash, saved_at
)
SELECT draft_id, seq, document, content_hash, saved_at
FROM puzzle_draft_history;

DROP TABLE puzzle_draft_history;
ALTER TABLE puzzle_draft_history_new RENAME TO puzzle_draft_history;

CREATE INDEX puzzle_draft_history_draft_seq
  ON puzzle_draft_history(draft_id, seq DESC);

PRAGMA foreign_keys = ON;
