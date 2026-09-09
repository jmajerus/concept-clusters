-- 0015 established the agent-review clock. Keep its applied history intact,
-- then make the two independent review events explicit.
ALTER TABLE published_documents
  RENAME COLUMN last_reviewed_at TO last_agent_reviewed_at;

ALTER TABLE published_documents
  ADD COLUMN last_human_reviewed_at TEXT;

DROP INDEX IF EXISTS published_documents_puzzle_last_reviewed_idx;

CREATE INDEX IF NOT EXISTS published_documents_puzzle_last_agent_reviewed_idx
  ON published_documents(kind, last_agent_reviewed_at);
