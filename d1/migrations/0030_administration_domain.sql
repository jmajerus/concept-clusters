-- Administration is its own draft projection: experimental play flags a
-- person sets before a feature is a normal authoring surface. Existing rows
-- leave the column null until the next save. Published puzzle rows stay one
-- document. This is not an agent write domain and not provenance.

ALTER TABLE puzzle_drafts ADD COLUMN administration_json TEXT;
