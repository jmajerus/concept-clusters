ALTER TABLE publication_requests ADD COLUMN approval_token TEXT;
ALTER TABLE publication_requests ADD COLUMN base_commit_sha TEXT;
ALTER TABLE publication_requests ADD COLUMN github_branch TEXT;
ALTER TABLE publication_requests ADD COLUMN github_pr_url TEXT;
ALTER TABLE publication_requests ADD COLUMN error_message TEXT;

CREATE UNIQUE INDEX publication_requests_approval_token
  ON publication_requests(approval_token);
CREATE INDEX publication_requests_draft_updated
  ON publication_requests(draft_id, updated_at DESC);
