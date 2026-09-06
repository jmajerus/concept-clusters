-- Human-curated additions to the drafts-page model dropdown
-- (authoringModelSuggestions.js keeps the built-in seed list). Editable
-- from /admin/model-suggestions so a newly released model doesn't need a
-- code change and deploy -- additive only, never removes a seed entry.
CREATE TABLE authoring_model_suggestions (
  label TEXT PRIMARY KEY,
  created_by TEXT,
  created_at TEXT NOT NULL
) STRICT;
