-- Generalize the one-off cluster term exception workflow into typed board
-- limit waivers. Keep the original tables as migration history; all new
-- requests and events use the policy-neutral tables below.
CREATE TABLE IF NOT EXISTS puzzle_board_limit_waiver_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  waiver_type TEXT NOT NULL,
  scope_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  requested_value INTEGER NOT NULL,
  scope_json TEXT NOT NULL,
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
  ON puzzle_board_limit_waiver_requests(draft_id, waiver_type, target_id, scope_json)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS puzzle_board_limit_waiver_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puzzle_id TEXT NOT NULL,
  waiver_type TEXT NOT NULL,
  scope_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('granted', 'replaced', 'revoked')),
  actor TEXT NOT NULL,
  event_at TEXT NOT NULL,
  approved_value INTEGER NOT NULL,
  approved_scope_json TEXT NOT NULL,
  reason TEXT,
  draft_id TEXT,
  draft_revision INTEGER
);

CREATE INDEX IF NOT EXISTS board_limit_waiver_events_by_puzzle
  ON puzzle_board_limit_waiver_events(puzzle_id, waiver_type, target_id, event_at DESC, id DESC);

-- Convert protected grants from the first waiver type to the generic record
-- shape while preserving the rest of the administration envelope.
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
        'approvedLimit', json_extract(item.value, '$.maxTerms'),
        'approvedScope', json_object('terms', json(json_extract(item.value, '$.approvedTerms'))),
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

-- Carry request and audit history forward without changing identities or
-- timestamps. The exact approved/requested term set is now a typed scope JSON.
INSERT INTO puzzle_board_limit_waiver_requests (
  id, draft_id, puzzle_id, waiver_type, scope_type, target_id, requested_value,
  scope_json, reason, status, requested_by, requested_at, requested_revision,
  decided_by, decided_at, decision_note
)
SELECT
  id, draft_id, puzzle_id, 'cluster-term-count', 'cluster', cluster_id, 8,
  json_object('terms', json(terms_json)), reason, status, requested_by,
  requested_at, requested_revision, decided_by, decided_at, decision_note
FROM puzzle_cluster_term_exception_requests;

INSERT INTO puzzle_board_limit_waiver_events (
  id, puzzle_id, waiver_type, scope_type, target_id, event_type, actor,
  event_at, approved_value, approved_scope_json, reason, draft_id, draft_revision
)
SELECT
  id, puzzle_id, 'cluster-term-count', 'cluster', cluster_id, event_type, actor,
  event_at, 8, json_object('terms', json(approved_terms_json)), reason,
  draft_id, draft_revision
FROM puzzle_cluster_term_exception_events;
