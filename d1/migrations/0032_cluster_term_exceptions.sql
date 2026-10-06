-- Move the legacy flat board-settings object into the current administration
-- envelope. Readers still accept flat local draft files until they are saved.
UPDATE puzzle_drafts
SET administration_json = json_object('board', json(administration_json))
WHERE administration_json IS NOT NULL
  AND json_valid(administration_json)
  AND json_type(CASE WHEN json_valid(administration_json) THEN administration_json ELSE '{}' END) = 'object'
  AND json_type(CASE WHEN json_valid(administration_json) THEN administration_json ELSE '{}' END, '$.board') IS NULL
  AND json_type(CASE WHEN json_valid(administration_json) THEN administration_json ELSE '{}' END, '$.clusterTermExceptions') IS NULL;

CREATE TABLE IF NOT EXISTS puzzle_cluster_term_exception_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  terms_json TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'granted', 'declined', 'superseded', 'replaced', 'revoked')),
  requested_by TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  requested_revision INTEGER NOT NULL,
  decided_by TEXT,
  decided_at TEXT,
  decision_note TEXT
);

CREATE INDEX IF NOT EXISTS cluster_term_exception_requests_by_draft
  ON puzzle_cluster_term_exception_requests(draft_id, status, requested_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS cluster_term_exception_one_pending_per_scope
  ON puzzle_cluster_term_exception_requests(draft_id, cluster_id, terms_json)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS puzzle_cluster_term_exception_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puzzle_id TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('granted', 'replaced', 'revoked')),
  actor TEXT NOT NULL,
  event_at TEXT NOT NULL,
  approved_terms_json TEXT NOT NULL,
  reason TEXT,
  draft_id TEXT,
  draft_revision INTEGER
);

CREATE INDEX IF NOT EXISTS cluster_term_exception_events_by_puzzle
  ON puzzle_cluster_term_exception_events(puzzle_id, cluster_id, event_at DESC, id DESC);
