-- The learning introduction is its own draft projection. Existing rows keep
-- it inside pedagogy_json until the next save rewrites the projections.

ALTER TABLE puzzle_drafts ADD COLUMN IF NOT EXISTS lesson_json TEXT;
ALTER TABLE puzzle_draft_history ADD COLUMN IF NOT EXISTS lesson_json TEXT;
