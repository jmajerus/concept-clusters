-- Support an AI-led review loop without losing concurrent human or agent
-- changes. The final handoff is tied to an exact PR head and thread snapshot.
ALTER TABLE publication_requests ADD COLUMN draft_commit_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_sync_head_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_sync_content_hash TEXT;
ALTER TABLE publication_requests ADD COLUMN publication_options_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_head_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_at TEXT;
ALTER TABLE publication_requests ADD COLUMN review_round_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE publication_requests ADD COLUMN review_write_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE publication_requests ADD COLUMN review_stagnant_rounds INTEGER NOT NULL DEFAULT 0;
ALTER TABLE publication_requests ADD COLUMN review_last_fingerprint TEXT;
ALTER TABLE publication_requests ADD COLUMN review_last_burden INTEGER;
ALTER TABLE publication_requests ADD COLUMN review_fingerprint_history_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_round_history_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_last_round_write_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE publication_requests ADD COLUMN review_loop_started_at TEXT;
ALTER TABLE publication_requests ADD COLUMN review_circuit_open_at TEXT;
ALTER TABLE publication_requests ADD COLUMN review_circuit_reason TEXT;
ALTER TABLE publication_requests ADD COLUMN review_circuit_report_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_circuit_reset_at TEXT;
ALTER TABLE publication_requests ADD COLUMN review_circuit_reset_reason TEXT;

UPDATE publication_requests
SET draft_commit_sha = github_commit_sha
WHERE draft_commit_sha IS NULL;
