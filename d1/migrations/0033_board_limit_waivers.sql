-- Board limit waivers: one request table and one audit table for every
-- registered limit (modules/boardLimitWaivers.js). A waiver is a layout
-- allowance: a target and the size approved for it.
--
-- This also reverses the cluster-only tables from 0032, which shipped before
-- the registry existed. Any rows they hold are carried forward first, then
-- those tables are dropped. 0032's administration envelope ({ board }) is
-- general and stays.
CREATE TABLE IF NOT EXISTS puzzle_board_limit_waiver_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  waiver_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  requested_count INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'granted', 'declined', 'superseded', 'replaced', 'revoked')),
  requested_by TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  requested_revision INTEGER NOT NULL,
  decided_by TEXT,
  decided_at TEXT,
  decision_note TEXT
);

CREATE INDEX IF NOT EXISTS board_limit_waiver_requests_by_draft
  ON puzzle_board_limit_waiver_requests(draft_id, status, requested_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS board_limit_waiver_one_pending_per_scope
  ON puzzle_board_limit_waiver_requests(draft_id, waiver_type, target_id, requested_count)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS puzzle_board_limit_waiver_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puzzle_id TEXT NOT NULL,
  waiver_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('granted', 'replaced', 'revoked')),
  actor TEXT NOT NULL,
  event_at TEXT NOT NULL,
  approved_count INTEGER NOT NULL,
  reason TEXT,
  draft_id TEXT,
  draft_revision INTEGER
);

CREATE INDEX IF NOT EXISTS board_limit_waiver_events_by_puzzle
  ON puzzle_board_limit_waiver_events(puzzle_id, waiver_type, target_id, event_at DESC, id DESC);

-- Reverse 0032: carry its rows forward, keeping ids and timestamps.
INSERT INTO puzzle_board_limit_waiver_requests (
  id, draft_id, puzzle_id, waiver_type, target_id, requested_count, reason, status,
  requested_by, requested_at, requested_revision, decided_by, decided_at, decision_note
)
SELECT
  id, draft_id, puzzle_id, 'cluster-term-count', cluster_id, json_array_length(terms_json), reason, status,
  requested_by, requested_at, requested_revision, decided_by, decided_at, decision_note
FROM puzzle_cluster_term_exception_requests;

INSERT INTO puzzle_board_limit_waiver_events (
  id, puzzle_id, waiver_type, target_id, event_type, actor, event_at,
  approved_count, reason, draft_id, draft_revision
)
SELECT
  id, puzzle_id, 'cluster-term-count', cluster_id, event_type, actor, event_at,
  json_array_length(approved_terms_json), reason, draft_id, draft_revision
FROM puzzle_cluster_term_exception_events;

UPDATE puzzle_drafts
SET administration_json = json_remove(
  json_set(
    administration_json,
    '$.boardLimitWaivers',
    json(COALESCE((
      SELECT json_group_array(json_object(
        'waiverType', 'cluster-term-count',
        'puzzleId', json_extract(item.value, '$.puzzleId'),
        'targetId', json_extract(item.value, '$.clusterId'),
        'approvedCount', json_array_length(json_extract(item.value, '$.approvedTerms')),
        'reason', json_extract(item.value, '$.reason'),
        'grantedBy', json_extract(item.value, '$.grantedBy'),
        'grantedAt', json_extract(item.value, '$.grantedAt')
      ))
      FROM json_each(administration_json, '$.clusterTermExceptions') AS item
    ), '[]'))
  ),
  '$.clusterTermExceptions'
)
WHERE administration_json IS NOT NULL
  AND json_valid(administration_json)
  AND json_type(administration_json, '$.clusterTermExceptions') = 'array';

DROP INDEX IF EXISTS cluster_term_exception_requests_by_draft;
DROP INDEX IF EXISTS cluster_term_exception_one_pending_per_scope;
DROP INDEX IF EXISTS cluster_term_exception_events_by_puzzle;
DROP TABLE IF EXISTS puzzle_cluster_term_exception_requests;
DROP TABLE IF EXISTS puzzle_cluster_term_exception_events;
