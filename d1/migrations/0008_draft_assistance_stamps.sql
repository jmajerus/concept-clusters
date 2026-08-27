-- Append-only MCP assistance stamp audit (scope/role/date detail formerly in
-- generativeAssistance). Provenance on puzzle_drafts stays the model of record.
PRAGMA foreign_keys = ON;

CREATE TABLE draft_assistance_stamps (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  owner_subject TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  record_json TEXT NOT NULL
) STRICT;

CREATE INDEX draft_assistance_stamps_draft_captured
  ON draft_assistance_stamps(draft_id, captured_at DESC);

CREATE INDEX draft_assistance_stamps_owner_captured
  ON draft_assistance_stamps(owner_subject, captured_at DESC);
