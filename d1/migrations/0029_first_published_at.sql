-- Keep first-publication order stable when a published document is revised.
-- Older revision snapshots may have been purged; use the earliest retained
-- revision when available and otherwise the current publication timestamp.
ALTER TABLE published_documents ADD COLUMN first_published_at TEXT;

UPDATE published_documents
SET first_published_at = COALESCE(
  (SELECT MIN(revision.published_at)
   FROM published_document_revisions AS revision
   WHERE revision.kind = published_documents.kind
     AND revision.id = published_documents.id),
  published_at
);

CREATE INDEX published_documents_first_published
  ON published_documents(kind, withdrawn_at, first_published_at);
