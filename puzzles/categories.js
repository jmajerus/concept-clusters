// Optional metadata for puzzle categories, keyed by the exact category
// string used on puzzle objects. A puzzle keeps `category` as its primary,
// backward-compatible disciplinary home and may add `categories` when more
// than one discipline materially structures the puzzle. The primary category
// should be the first entry in `categories`.
//
// Category metadata is purely additive: an unregistered category still works,
// but has no authored subtitle on its overview screen.
//
// Shape: { slug, info, subcategories }, all optional. Subcategory object keys
// are stable URL ids; their titles are display copy. A puzzle assignment is
// category-relative because the same puzzle may sit differently within each
// of its disciplinary homes.
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
  },
  "Art": {
    info: {
      text: "How visual choices organize perception, transform appearances, and create meanings that change with context and interpretation.",
      link: "wiki:Visual arts"
    },
    subcategories: {
      "visual-form": {
        title: "Visual Form",
        info: {
          text: "How composition, color, spatial relationships, and other formal choices shape what viewers see.",
          link: "wiki:Visual arts"
        }
      },
      "representation-and-interpretation": {
        title: "Representation & Interpretation",
        info: {
          text: "How artworks transform appearances and acquire meaning through artistic choices, evidence, context, and reception.",
          link: "wiki:Representation (arts)"
        }
      }
    }
  }
};

export const GENERATED_SUBCATEGORY_IDS = Object.freeze({
  all: "all",
  other: "other"
});

export const RESERVED_SUBCATEGORY_IDS = new Set(
  Object.values(GENERATED_SUBCATEGORY_IDS)
);

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

export function subcategoryIdForPuzzle(puzzle, category) {
  if (!puzzleBelongsToCategory(puzzle, category)) return null;
  const id = puzzle?.subcategories?.[category];
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export function subcategoryById(category, subcategoryId) {
  const definition = CATEGORIES[category]?.subcategories?.[subcategoryId];
  return definition ? { id: subcategoryId, ...definition } : null;
}

export function subcategoryForPuzzle(puzzle, category) {
  const id = subcategoryIdForPuzzle(puzzle, category);
  return id ? subcategoryById(category, id) : null;
}

export function subcategoriesForCategory(category) {
  return Object.entries(CATEGORIES[category]?.subcategories || {})
    .map(([id, definition]) => ({ id, ...definition }));
}

export function puzzleBelongsToSubcategory(
  puzzle,
  category,
  subcategoryId
) {
  if (!puzzleBelongsToCategory(puzzle, category)) return false;
  if (subcategoryId === GENERATED_SUBCATEGORY_IDS.all) return true;
  const assigned = subcategoryIdForPuzzle(puzzle, category);
  if (subcategoryId === GENERATED_SUBCATEGORY_IDS.other) return !assigned;
  return assigned === subcategoryId;
}

export function puzzlesForSubcategory(puzzles, category, subcategoryId) {
  return puzzles.filter(puzzle =>
    puzzleBelongsToSubcategory(puzzle, category, subcategoryId)
  );
}

// Only definitions represented in the supplied puzzle set are returned.
// This keeps catalogue screens relative to their own membership rather than
// leaking empty subjects from the global registry.
export function subcategoriesForPuzzleSet(puzzles, category) {
  return subcategoriesForCategory(category).flatMap(subcategory => {
    const count = puzzlesForSubcategory(
      puzzles,
      category,
      subcategory.id
    ).length;
    return count ? [{ ...subcategory, count }] : [];
  });
}

export function resolveSubcategory(value, puzzles, category) {
  if (!value || !category) return null;
  const categoryPuzzles = puzzles.filter(puzzle =>
    puzzleBelongsToCategory(puzzle, category)
  );
  const represented = subcategoriesForPuzzleSet(categoryPuzzles, category);
  if (!represented.length) return null;
  if (value === GENERATED_SUBCATEGORY_IDS.all) {
    return GENERATED_SUBCATEGORY_IDS.all;
  }
  if (value === GENERATED_SUBCATEGORY_IDS.other) {
    return categoryPuzzles.some(puzzle =>
      !subcategoryIdForPuzzle(puzzle, category)
    )
      ? GENERATED_SUBCATEGORY_IDS.other
      : null;
  }
  return represented.some(subcategory => subcategory.id === value)
    ? value
    : null;
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
