-- Layout overrides are mode-neutral presentation data. Existing rows keep
-- their JSON and are read as legacy Star-only envelopes by the repository.

ALTER TABLE published_documents RENAME COLUMN star_layout_json TO layout_json;
ALTER TABLE puzzle_drafts RENAME COLUMN star_layout_json TO layout_json;
