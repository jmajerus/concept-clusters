-- Draft storage no longer converts every document to JSON-LD before
-- writing (see docs/JSON-LD.md); a stored draft is kept exactly as the
-- author sent it, almost always the simplified authoring format now. The
-- column name is renamed to match -- no data migration needed, since
-- existing rows are read through the same JSON.parse either way and
-- modules/simplifiedPuzzleSchema.js's puzzleFromAuthoredDocument() still
-- accepts pre-existing JSON-LD-shaped rows as a read-compatibility path.
ALTER TABLE puzzle_drafts RENAME COLUMN document_jsonld TO document;
