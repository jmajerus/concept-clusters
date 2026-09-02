-- Working-copy undo stack for puzzle drafts. Each distinct save pushes the
-- previous document; "Revert to last working copy" pops the latest. The
-- integer on puzzle_drafts.revision stays an OCC token, not this seq.
-- Existing drafts start with an empty stack until the next save.

PRAGMA foreign_keys = ON;

CREATE TABLE puzzle_draft_history (
  draft_id TEXT NOT NULL,
  seq INTEGER NOT NULL CHECK (seq >= 1),
  document TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (draft_id, seq),
  FOREIGN KEY (draft_id) REFERENCES puzzle_drafts(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX puzzle_draft_history_draft_seq
  ON puzzle_draft_history(draft_id, seq DESC);
