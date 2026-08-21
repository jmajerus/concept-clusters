-- Optimistic concurrency token for save_puzzle_draft. One current document
-- per draft (no revision ledger); GitHub PR commits remain publication history.
ALTER TABLE puzzle_drafts ADD COLUMN revision INTEGER NOT NULL DEFAULT 1
  CHECK (revision >= 1);
