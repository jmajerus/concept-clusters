-- Durable corpus-review scheduling.  Existing puzzles start at their last
-- publication/update time; subsequent review passes update only this field.
ALTER TABLE published_documents ADD COLUMN last_reviewed_at TEXT;

UPDATE published_documents
SET last_reviewed_at = updated_at
WHERE kind = 'puzzle' AND last_reviewed_at IS NULL;

CREATE INDEX IF NOT EXISTS published_documents_puzzle_last_reviewed_idx
  ON published_documents(kind, last_reviewed_at);
