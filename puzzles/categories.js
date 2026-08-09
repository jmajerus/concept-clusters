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
    domain: "sciences-mathematics",
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  },
  "Math": {
    domain: "sciences-mathematics",
    info: { text: "The patterns and structures underneath numbers, shapes, and chance.", link: "wiki:Mathematics" }
  },
  "Computer Science": {
    domain: "computing-engineering",
    info: {
      text: "How computation is represented, constrained, and made usable—and what each layer of abstraction enables, hides, or sacrifices.",
      link: "wiki:Computer science"
    },
    subcategories: {
      "computing-and-society": {
        title: "Computing & Society",
        info: {
          text: "How computing systems shape human choice, power, responsibility, privacy, trust, and participation in society.",
          link: "wiki:Computer ethics"
        }
      },
      "programming-languages": {
        title: "Programming Languages",
        info: {
          text: "How languages differ in types, execution, memory, and other design commitments—and how those choices show up when you write and run programs.",
          link: "wiki:Programming language"
        }
      }
    }
  },
  "Business & Organizations": {
    domain: "business-management",
    info: {
      text: "How organizations set goals, distribute authority, design incentives, create value, and meet responsibilities to workers, customers, and society.",
      link: "wiki:Business ethics",
      extraLink: "wiki:Organizational behavior"
    }
  },
  "Engineering": {
    domain: "computing-engineering",
    info: {
      text: "How designed systems sense conditions, make decisions, act on the world, and remain dependable under real constraints.",
      link: "wiki:Engineering"
    }
  },
  "History & Society": {
    // Provisional: spans History and Political Science/Sociology, and is
    // expected to split along those lines once puzzle counts justify it.
    // See docs/TAXONOMY-ROADMAP.md.
    domain: "humanities",
    info: { text: "How people have built, governed, and upended their own societies.", link: "wiki:History" }
  },
  "Language Arts": {
    domain: "language-literacy",
    info: { text: "How language is built, and the craft of using it well.", link: "wiki:Language arts" }
  },
  "Literary Theory & Poetics": {
    domain: "literature-classics",
    info: {
      text: "How narrative, drama, and poetic form are theorized—from classical poetics and epic convention to later frameworks for plot, genre, and reading.",
      link: "wiki:Literary theory"
    }
  },
  "Humanities": {
    domain: "humanities",
    info: {
      text: "How people create, preserve, and interpret meaning through art, texts, traditions, and cultural memory.",
      link: "wiki:Humanities"
    }
  },
  "Philosophy & Social Science": {
    // Provisional: spans Philosophy, Psychology, Sociology, and Economics,
    // and is expected to split along those lines once puzzle counts justify
    // it. See docs/TAXONOMY-ROADMAP.md.
    domain: "social-sciences",
    info: { text: "How people think, believe, and make sense of each other.", link: "wiki:Philosophy" }
  },
  "Media & Information Literacy": {
    domain: "communication-media",
    info: { text: "Telling apart what's real, sourced, and trustworthy online.", link: "wiki:Media literacy" }
  },
  "Physiology & Medicine": {
    domain: "health-medicine",
    info: { text: "How the body is built, and what keeps it running.", link: "wiki:Physiology" }
  },
  "Public Health": {
    domain: "health-medicine",
    info: {
      text: "How communities understand health risks, prevent harm, protect populations, and build the conditions in which people can thrive.",
      link: "wiki:Public health"
    }
  },
  "Geography": {
    domain: "earth-environment",
    info: {
      text: "How location, environment, movement, and human activity create spatial patterns and distinctive regions.",
      link: "wiki:Geography"
    }
  },
  "Art": {
    domain: "art-design",
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
  },
  "Music": {
    domain: "art-design",
    slug: "music",
    info: {
      text: "How music is organized: in time, in pitch, and in combination.",
      link: "wiki:Music theory"
    }
  },
  "Data Science": {
    domain: "computing-engineering",
    slug: "data-science",
    info: {
      text: "How raw data becomes something you can trust, describe, and use to predict.",
      link: "wiki:Data science"
    }
  },
  "Film": {
    domain: "art-design",
    info: {
      text: "How shots, editing, and sound combine to construct meaning on screen.",
      link: "wiki:Film theory"
    }
  },
  // Deliberately domain-less, unlike every other entry above: trivia cuts
  // across every discipline rather than belonging to one, so this
  // permanently lives in the "Other subjects" bucket on the browse screen
  // rather than being a placeholder awaiting a home the way Film and Data
  // Science briefly, accidentally were.
  //
  // Puzzles here also lean toward a preferred shape -- preSolve: true and
  // lensMode: "quiz" -- since trivia is usually about testing specific
  // recall rather than discovering how terms cluster. See
  // modules/authoringDesignGuidance.js: a lean for an author to weigh,
  // not a constraint this registry enforces.
  "Trivia": {
    info: {
      text: "Specific, memorable facts worth knowing on their own, not organized under any one discipline.",
      link: "wiki:Trivia"
    }
  },
  Psychology: {
    domain: "social-sciences",
    slug: "psychology",
    info: {
      text: "How the mind develops, perceives, defends itself, and sometimes works against its own interests.",
      link: "wiki:Psychology"
    }
  }
};

// A small, fixed vocabulary of broad subject groupings above category --
// see docs/TAXONOMY-ROADMAP.md for the reasoning and staged rollout. Not
// yet navigation (no ?domain= route); currently used only to group the
// category-browse screen's cards under readable headings, alphabetically
// by title -- declaration order here is not display order, and carries no
// meaning of its own.
export const DOMAINS = {
  // Sciences, Mathematics, Computer Science, Engineering, and Data Science
  // were originally five separate domains -- far finer-grained than
  // Social Sciences, Humanities, or Art & Design, each of which already
  // spans several comparably distinct fields under one domain. Consolidated
  // into two broader domains for parity; split back out once real content
  // (not just the vocabulary) justifies the finer grain again. See
  // docs/TAXONOMY-ROADMAP.md.
  "sciences-mathematics": {
    title: "Sciences & Mathematics",
    info: { text: "The natural and formal sciences: biology, physics, chemistry, astronomy, and the mathematics and methods common to them." }
  },
  "computing-engineering": {
    title: "Computing & Engineering",
    info: { text: "Computation, algorithms, and software; designed systems, materials, control, and robotics; and the data science and analytics running through both." }
  },
  "earth-environment": {
    title: "Earth & Environment",
    info: { text: "Geology, climate, oceanography, ecology, geography, environmental policy." }
  },
  "health-medicine": {
    title: "Health & Medicine",
    info: { text: "Anatomy, physiology, clinical reasoning, nutrition, and population health." }
  },
  "humanities": {
    title: "Humanities",
    info: { text: "Literature, history, philosophy, religion, and cultural interpretation." }
  },
  "language-literacy": {
    title: "Language & Literacy",
    info: { text: "How language is built and used well: grammar, rhetoric, composition, second-language learning." }
  },
  "communication-media": {
    title: "Communication & Media",
    info: { text: "Journalism, media studies, information literacy, evidence and sourcing." }
  },
  "art-design": {
    title: "Art & Design",
    info: { text: "Visual arts, music, film, graphic and product design, media production." }
  },
  "business-management": {
    title: "Business & Management",
    info: { text: "Marketing, finance, accounting, leadership, organizational design." }
  },
  "literature-classics": {
    title: "Literature & Classics",
    info: { text: "Narrative theory, classical epics and mythology, drama and poetics, literary criticism, and canonical texts across historical traditions." }
  },
  "social-sciences": {
    title: "Social Sciences",
    info: { text: "Psychology and learning sciences, sociology, anthropology, behavioral economics, politics, and educational theory." }
  }
};

export const GENERATED_SUBCATEGORY_IDS = Object.freeze({
  all: "all",
  other: "other"
});

export const RESERVED_SUBCATEGORY_IDS = new Set(
  Object.values(GENERATED_SUBCATEGORY_IDS)
);

export const GENERATED_DOMAIN_IDS = Object.freeze({
  other: "other"
});

export const RESERVED_DOMAIN_IDS = new Set(
  Object.values(GENERATED_DOMAIN_IDS)
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

// null for an unregistered category (e.g. "Film") -- that's expected, not
// an error; see the "Other subjects" bucket in overviewRenderer.js.
export function domainForCategory(category) {
  return CATEGORIES[category]?.domain || null;
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
