-- Citekeys are agent search aliases, kept outside puzzle documents. The
-- identity uniqueness constraint starts with library, so global lookup needs
-- its own case-insensitive index.
CREATE INDEX IF NOT EXISTS citation_sources_citekey_lookup
  ON citation_sources (LOWER(citekey));
