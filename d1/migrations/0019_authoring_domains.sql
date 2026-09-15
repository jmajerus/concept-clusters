-- Logical authoring domains for puzzle drafts. The `document` column remains
-- the materialized canonical snapshot used by existing publication, rendering,
-- and Freeze paths; these columns are the persisted domain projections used by
-- focused MCP reads and writes. Database metadata columns remain the system
-- domain and are not duplicated into JSON.

ALTER TABLE puzzle_drafts ADD COLUMN content_json TEXT;
ALTER TABLE puzzle_drafts ADD COLUMN pedagogy_json TEXT;
ALTER TABLE puzzle_drafts ADD COLUMN provenance_json TEXT;
