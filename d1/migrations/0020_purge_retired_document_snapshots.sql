-- Current drafts and published documents are the source of truth. Retained
-- snapshots are disposable and may contain formats retired by the canonical
-- authoring migration, so clear them once before the simplified contract is
-- enforced everywhere.

PRAGMA foreign_keys = ON;

DELETE FROM published_document_revisions;
DELETE FROM puzzle_draft_history;
