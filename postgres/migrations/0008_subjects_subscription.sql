-- The subjects subscriber's cursor on terminology-mcp's changelog
-- (docs/dev-briefs/subjects-from-terminology-mcp.md). One row per scheme:
-- the changelog id, the last change applied, a JSON map of the scheme's
-- terms as of that change (id -> slug, label, status, broader, replacedBy),
-- and the change it is held at, if any. Deleting the row makes the next run
-- bootstrap again.
CREATE TABLE IF NOT EXISTS subjects_subscription (
  scheme TEXT PRIMARY KEY,
  log TEXT NOT NULL,
  through INTEGER NOT NULL,
  terms TEXT NOT NULL,
  blocked TEXT,
  updated_at TEXT NOT NULL
);
