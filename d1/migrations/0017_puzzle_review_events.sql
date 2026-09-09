CREATE TABLE IF NOT EXISTS puzzle_review_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puzzle_id TEXT NOT NULL,
  reviewer_kind TEXT NOT NULL CHECK (reviewer_kind IN ('agent', 'human')),
  reviewed_at TEXT NOT NULL,
  comments TEXT,
  outcome TEXT,
  draft_revision INTEGER,
  guidance_major INTEGER,
  guidance_minor INTEGER
);

CREATE INDEX IF NOT EXISTS puzzle_review_events_by_puzzle_and_date
  ON puzzle_review_events(puzzle_id, reviewed_at DESC, id DESC);
