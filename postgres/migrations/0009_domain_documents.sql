-- Domains become published documents like categories ({ id, title, info? };
-- docs/dev-briefs/subjects-from-terminology-mcp.md, "Domains are data").
ALTER TABLE published_documents DROP CONSTRAINT IF EXISTS published_documents_kind_check;
ALTER TABLE published_documents ADD CONSTRAINT published_documents_kind_check
  CHECK (kind IN ('puzzle', 'catalogue', 'category', 'domain'));
ALTER TABLE published_replica_queue DROP CONSTRAINT IF EXISTS published_replica_queue_kind_check;
ALTER TABLE published_replica_queue ADD CONSTRAINT published_replica_queue_kind_check
  CHECK (kind IN ('puzzle', 'catalogue', 'category', 'domain', 'site_settings'));
