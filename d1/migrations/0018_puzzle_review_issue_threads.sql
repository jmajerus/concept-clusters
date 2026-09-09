-- Completed reviews are independent of unresolved authoring handoffs. An
-- issue id connects events in one handoff thread without making a later
-- completed review imply that every outstanding issue has been resolved.
ALTER TABLE puzzle_review_events ADD COLUMN issue_id TEXT;
ALTER TABLE puzzle_review_events ADD COLUMN event_type TEXT NOT NULL DEFAULT 'review';

CREATE INDEX IF NOT EXISTS puzzle_review_events_by_puzzle_issue_and_date
  ON puzzle_review_events(puzzle_id, issue_id, reviewed_at ASC, id ASC);
