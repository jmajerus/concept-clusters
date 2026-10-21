-- Marks authoring_model_suggestions as the complete vocabulary Freeze
-- projects. An empty database stays unmarked so Freeze does not treat a
-- missing list as a request to remove every frozen model.
CREATE TABLE IF NOT EXISTS authoring_model_suggestion_catalog (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL
);
