// Optional metadata for puzzle categories, keyed by the exact `category`
// string used on puzzle objects (see puzzles/index.js and each puzzle
// file). A category is otherwise just an implied grouping -- any string
// a puzzle uses for `category` is a valid category, registered here or
// not -- so this is purely additive: an unregistered category (the
// common case today) simply shows no subtitle on its overview screen
// (see showOverview in game.js), never an error.
//
// Shape: { slug, info: { text, link, extraLink } }, both optional.
// `info` is the same shape as a cluster's (see AUTHORING.md's "Cluster
// info & links" and "Category info" sections). `text` is genuinely
// useful here (unlike a cluster, a category has no other reveal
// mechanism -- nothing plays the role `fact` does), and is shown as the
// overview screen's subtitle when browsing that category
// (?category=<slug> or the "Browse puzzles" button).
//
// `slug` is what a ?category= link actually encodes -- see slugify/
// categorySlugFor below. Registering one here pins it permanently,
// independent of this category's display name, the same way a puzzle's
// own `id` stays stable even if its `title` is later reworded. Leaving
// it unset is fine: categorySlugFor falls back to auto-deriving one
// from the name, which is enough on its own to keep a share link out of
// the "?category=Media+%26+Information+Literacy" business -- the
// tradeoff is that an auto-derived slug moves if the name does, where a
// pinned one doesn't.
//
// Example:
//   "Science": {
//     info: { text: "Where things come from and how they work.", link: "wiki:Science" }
//   }
export const CATEGORIES = {
  "Science": {
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  },
  "Math": {
    info: { text: "The patterns and structures underneath numbers, shapes, and chance.", link: "wiki:Mathematics" }
  },
  "History & Society": {
    info: { text: "How people have built, governed, and upended their own societies.", link: "wiki:History" }
  },
  "Language Arts": {
    info: { text: "How language is built, and the craft of using it well.", link: "wiki:Language arts" }
  },
  "Humanities": {
    info: {
      text: "How people create, preserve, and interpret meaning through art, texts, traditions, and cultural memory.",
      link: "wiki:Humanities"
    }
  },
  "Philosophy & Social Science": {
    info: { text: "How people think, believe, and make sense of each other.", link: "wiki:Philosophy" }
  },
  "Media & Information Literacy": {
    info: { text: "Telling apart what's real, sourced, and trustworthy online.", link: "wiki:Media literacy" }
  },
  "Physiology & Medicine": {
    info: { text: "How the body is built, and what keeps it running.", link: "wiki:Physiology" }
  }
};

// Lowercase, "&" dropped rather than spelled out (so "History & Society"
// and a hypothetical "History and Society" wouldn't collide), every
// other run of non-alphanumeric characters collapsed to one hyphen, no
// leading/trailing hyphen. Not a general-purpose slugifier -- just
// enough to turn this project's own category strings into something
// clean, and it happens to already match the puzzles/ directory names
// this project has used from the start (e.g. "Media & Information
// Literacy" -> "media-information-literacy", the same as puzzles/
// media-information-literacy/) -- an existing convention this reuses
// rather than a new one invented for URLs specifically.
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// What a ?category= link actually encodes for `name` -- an explicit
// CATEGORIES[name].slug if one's registered (permanent, independent of
// the display name), otherwise slugify(name) itself (automatic, but
// moves if the name later does -- see the file comment above).
export function categorySlugFor(name) {
  return CATEGORIES[name]?.slug || slugify(name);
}

export default CATEGORIES;
