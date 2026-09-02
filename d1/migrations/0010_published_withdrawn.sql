-- Tombstone for published documents. Authoring play omits withdrawn rows.
-- Git seed uses INSERT OR IGNORE and must not recreate them. Publish again
-- clears withdrawn_at. Freeze later deletes the corresponding git files.

ALTER TABLE published_documents ADD COLUMN withdrawn_at TEXT;
