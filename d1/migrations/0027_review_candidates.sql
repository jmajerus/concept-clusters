-- Competing reviews are alternatives against one published revision.
-- A proposed event stores that agent's document and the client identity
-- copied from the authorship stamp. A later accepted or rejected event
-- points at it with source_event_id; the proposal stays open until then.

ALTER TABLE puzzle_review_events ADD COLUMN client_system TEXT;
ALTER TABLE puzzle_review_events ADD COLUMN client_model TEXT;
ALTER TABLE puzzle_review_events ADD COLUMN client_name TEXT;
ALTER TABLE puzzle_review_events ADD COLUMN source_event_id INTEGER;
