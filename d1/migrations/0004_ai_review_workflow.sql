-- Support an AI-led review loop without losing concurrent human or agent
-- changes. The final handoff is tied to an exact PR head and thread snapshot.
ALTER TABLE publication_requests ADD COLUMN draft_commit_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_sync_head_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_sync_content_hash TEXT;
ALTER TABLE publication_requests ADD COLUMN publication_options_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_head_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_json TEXT;
ALTER TABLE publication_requests ADD COLUMN review_handoff_at TEXT;

UPDATE publication_requests
SET draft_commit_sha = github_commit_sha
WHERE draft_commit_sha IS NULL;
