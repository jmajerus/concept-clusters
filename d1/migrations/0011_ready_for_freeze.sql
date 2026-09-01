-- Author-owned freeze cue. Publish puts a snapshot on authoring play;
-- freeze only ships ids the author cued. Cue is not "finished" or
-- "reviewed": hold a complete board until other puzzles (a new catalogue,
-- for example) can ship together. Reviewers are not asked to sign off.
-- Git-seeded rows are already production, so they start cued. A later
-- Publish clears the cue until the author sets it again.

ALTER TABLE published_documents ADD COLUMN cued_for_freeze_at TEXT;
ALTER TABLE published_documents ADD COLUMN cued_for_freeze_by TEXT;

UPDATE published_documents
SET cued_for_freeze_at = published_at,
    cued_for_freeze_by = published_by
WHERE published_by = 'git-seed'
  AND withdrawn_at IS NULL
  AND cued_for_freeze_at IS NULL;
