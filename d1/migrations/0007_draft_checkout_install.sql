-- Marks which draft revision was last written into a git checkout.
-- Local /admin/drafts derives installed/committed/published from this
-- plus the canonical file and git; D1 status stays the pull-request ledger.
ALTER TABLE puzzle_drafts ADD COLUMN installed_content_hash TEXT;
