-- Human claim that a puzzle publish changed the words the player reads.
-- Null until a person checks the mark on Publish. Unmarked publishes and
-- shelf-only publishes leave the previous stamp in place. No backfill:
-- existing rows stay "First published" until a later publish is marked.
ALTER TABLE published_documents ADD COLUMN content_revised_at TEXT;
ALTER TABLE published_document_revisions ADD COLUMN content_revised_at TEXT;
