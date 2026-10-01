-- Classification is its own draft projection: primary category, membership,
-- and subcategory placement. Existing rows keep those fields inside
-- content_json and pedagogy_json until the next save or materialize rewrites
-- the three projections together. Published puzzle rows stay one document.

ALTER TABLE puzzle_drafts ADD COLUMN classification_json TEXT;
