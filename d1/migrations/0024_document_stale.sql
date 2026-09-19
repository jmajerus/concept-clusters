-- Deferred materialization for puzzle drafts: domain columns are the durable
-- authored state; `document` is a cache refreshed on complete saves and
-- explicit materialize. Focused domain saves set document_stale=1 and leave
-- the previous document blob untouched.

ALTER TABLE puzzle_drafts ADD COLUMN document_stale INTEGER NOT NULL DEFAULT 0;
