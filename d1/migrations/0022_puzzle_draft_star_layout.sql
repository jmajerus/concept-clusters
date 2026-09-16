-- Optional Star-mode presentation override for an unpublished working copy.
-- It is separate from the authored puzzle document and its revision history:
-- authors can confirm the board before publishing the puzzle itself.

ALTER TABLE puzzle_drafts ADD COLUMN star_layout_json TEXT;
