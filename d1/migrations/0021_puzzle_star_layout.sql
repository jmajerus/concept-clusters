-- Optional Star-mode presentation override. This is deliberately separate
-- from the authored puzzle document and its revision history: it is a
-- validated rendering artifact associated with the published puzzle row.

ALTER TABLE published_documents ADD COLUMN star_layout_json TEXT;
