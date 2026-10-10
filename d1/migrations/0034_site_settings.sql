-- Site settings: play settings a person sets once for every puzzle
-- (modules/siteSettings.js). Public play and the authoring server's play
-- corpus read them. One row per setting; a missing row is the built-in
-- default, and a puzzle's own board flags override a row.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
