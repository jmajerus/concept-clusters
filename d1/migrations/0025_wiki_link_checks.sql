-- Wikipedia title resolutions, one row per title ever asked about. The
-- authoring worker's weekly cron refreshes every title the published corpus
-- references; the draft page, check_puzzle_links, and the CLI read fresh rows
-- from here and only ask Wikipedia for what is missing or stale, writing
-- back what they learn. Replaces the bundled src/link-manifest.json snapshot
-- (which went stale whenever nobody regenerated it) and the CLI's private
-- JSON cache.
--
-- page_exists rather than exists: EXISTS is a keyword.

CREATE TABLE wiki_link_checks (
  title TEXT PRIMARY KEY,
  page_exists INTEGER NOT NULL CHECK (page_exists IN (0, 1)),
  disambiguation INTEGER NOT NULL DEFAULT 0 CHECK (disambiguation IN (0, 1)),
  resolved_title TEXT,
  checked_at TEXT NOT NULL
) STRICT;

CREATE INDEX wiki_link_checks_checked_at ON wiki_link_checks(checked_at);
