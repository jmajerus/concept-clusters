-- The learning introduction is its own draft projection. Existing rows keep
-- it inside pedagogy_json until the next save rewrites the projections.
-- Published puzzle rows stay one document.

ALTER TABLE puzzle_drafts ADD COLUMN lesson_json TEXT;
ALTER TABLE puzzle_draft_history ADD COLUMN lesson_json TEXT;
