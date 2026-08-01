// Optional metadata for puzzle categories, keyed by the exact category
// string used on puzzle objects. A puzzle keeps `category` as its primary,
// backward-compatible disciplinary home and may add `categories` when more
// than one discipline materially structures the puzzle. The primary category
// should be the first entry in `categories`.
//
// Category metadata is purely additive: an unregistered category still works,
// but has no authored subtitle on its overview screen.
//
// Shape: { slug, info: { text, link, extraLink } }, both optional.
export const CATEGORIES = {
  "Science": {
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  },
  "Math": {
    info: { text: "The patterns and structures underneath numbers, shapes, and chance.", link: "wiki:Mathematics" }
  },
  "Computer Science": {
    info: {
      text: "How computation is represented, constrained, and made usable—and what each layer of abstraction enables, hides, or sacrifices.",
      link: "wiki:Computer science"
    }
  },
  "Business & Organizations": {
    info: {
      text: "How organizations set goals, distribute authority, design incentives, create value, and meet responsibilities to workers, customers, and society.",
      link: "wiki:Business ethics",
      extraLink: "wiki:Organizational behavior"
    }
  },
  "Engineering": {
    info: {
      text: "How designed systems sense conditions, make decisions, act on the world, and remain dependable under real constraints.",
      link: "wiki:Engineering"
    }
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
  },
  "Public Health": {
    info: {
      text: "How communities understand health risks, prevent harm, protect populations, and build the conditions in which people can thrive.",
      link: "wiki:Public health"
    }
  },
  "Geography": {
    info: {
      text: "How location, environment, movement, and human activity create spatial patterns and distinctive regions.",
      link: "wiki:Geography"
    }
  }
};

// Return every authored category for a puzzle, normalized to a unique list.
// Existing puzzles that only define `category` continue to work unchanged.
export function categoriesForPuzzle(puzzle) {
  const authored = Array.isArray(puzzle?.categories)
    ? puzzle.categories
    : [puzzle?.category];
  return [...new Set(authored.filter(name =>
    typeof name === "string" && name.trim()
  ))];
}

export function primaryCategoryForPuzzle(puzzle) {
  return categoriesForPuzzle(puzzle)[0] || null;
}

export function puzzleBelongsToCategory(puzzle, category) {
  return !!category && categoriesForPuzzle(puzzle).includes(category);
}

// Lowercase, "&" dropped rather than spelled out, every other run of
// non-alphanumeric characters collapsed to one hyphen, no leading/trailing
// hyphen. This intentionally matches the repository's category-folder style.
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// What a ?category= link encodes for `name`: an explicit pinned slug when
// registered, otherwise the automatically derived form.
export function categorySlugFor(name) {
  return CATEGORIES[name]?.slug || slugify(name);
}

export default CATEGORIES;
