-- A review opened from a published puzzle can be discarded without leaving
-- the working copy in the drafts list. The rejected proposal is kept on the
-- review event, against the published revision it was written from. An
-- accepted review points at the published revision it became.
--
-- review_baseline_json is the document at the moment a review pass began,
-- so an already-open draft can be restored in one step. It is session
-- state on the draft, not the chronicle.

ALTER TABLE puzzle_drafts ADD COLUMN opened_from_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE puzzle_drafts ADD COLUMN review_baseline_json TEXT;

ALTER TABLE puzzle_review_events ADD COLUMN proposal_json TEXT;
ALTER TABLE puzzle_review_events ADD COLUMN base_published_revision INTEGER;
ALTER TABLE puzzle_review_events ADD COLUMN published_revision INTEGER;
