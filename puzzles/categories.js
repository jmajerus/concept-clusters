// Optional metadata for puzzle categories, keyed by display title. Persisted
// puzzle documents use the metadata's stable slug in `category`/`categories`;
// the helpers below accept either ids or legacy titles. A puzzle keeps
// `category` as its primary disciplinary home and may add `categories` when
// more than one discipline materially structures it.
//
// In the live authoring store, a published category-editor document is what
// registers a category. This Git registry remains the production/legacy
// snapshot; checkout-aware compatibility helpers may still infer registration
// from a published puzzle reference when they explicitly use that mode.
//
// Shape: { slug, info, subcategories }, all optional. Subcategory object keys
// are stable category ids; their titles are display copy. A puzzle assignment
// is category-relative because the same puzzle may sit differently within
// each of its disciplinary homes.
// Domain definitions are code-owned in their own module; these re-exports
// keep existing consumers compatible while Freeze edits this file's
// D1-backed category registry.
export { DOMAINS, GENERATED_DOMAIN_IDS, RESERVED_DOMAIN_IDS } from "./domains.js";

export const CATEGORIES = {
  "Science": {
    domain: "sciences-mathematics",
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  },
  Chemistry: {
    slug: "chemistry",
    domain: "sciences-mathematics",
    info: {
      text: "How matter is built from atoms, how atomic structure produces bonding and properties, and how substances transform through chemical reactions.",
      link: "wiki:Chemistry"
    },
    subcategories: {
      "organic-chemistry": {
        title: "Organic Chemistry",
        info: {
          text: "Organic Chemistry is the scientific study of the structure, properties, composition, reactions, and synthesis of carbon-containing compounds.",
          link: "wiki:Organic_chemistry"
        }
      }
    }
  },
  "Physics": {
    domain: "sciences-mathematics",
    info: {
      text: "How matter and energy behave — from classical motion and waves to quantum descriptions of light and particles.",
      link: "wiki:Physics"
    }
  },
  Biology: {
    slug: "biology",
    domain: "life-sciences",
    info: {
      text: "How living systems store information, build and regulate themselves, reproduce, vary, and change over time.",
      link: "wiki:Biology"
    },
    subcategories: {
      bioinformatics: {
        title: "Bioinformatics",
        info: {
          text: "How biological observations become structured data, how algorithms compare them, and how computational analyses remain interpretable and reproducible.",
          link: "wiki:Bioinformatics"
        }
      },
      epigenomics: {
        title: "Epigenomics",
        info: {
          text: "How chemical modifications to DNA and its packaging turn genes on and off without changing the underlying sequence.",
          link: "wiki:Epigenomics"
        }
      },
      foundations: {
        title: "Foundations",
        info: {
          text: "How cells organize life, reproduce and transmit variation, and how populations change across generations.",
          link: "wiki:Biology"
        }
      },
      genomics: {
        title: "Genomics",
        info: {
          text: "How whole genomes are organized, read, assembled, compared, and interpreted—and what their variation can and cannot tell us.",
          link: "https://www.genome.gov/genetics-glossary/genomics"
        }
      },
      metabolomics: {
        title: "Metabolomics",
        info: {
          text: "How small-molecule metabolites are measured and interpreted as the downstream readout of an organism's biochemistry.",
          link: "wiki:Metabolomics"
        }
      },
      multiomics: {
        title: "Multiomics",
        info: {
          text: "How combining two or more molecular layers—genomic, epigenomic, transcriptomic, proteomic, or metabolomic—reveals a connected system that no single layer shows alone.",
          link: "wiki:Multiomics"
        }
      },
      phenomics: {
        title: "Phenomics",
        info: {
          text: "How observable traits are systematically measured at scale and linked back to their genetic and molecular causes.",
          link: "wiki:Phenomics"
        }
      },
      proteomics: {
        title: "Proteomics",
        info: {
          text: "How the full set of proteins a cell or organism produces is identified, measured, and interpreted.",
          link: "wiki:Proteomics"
        }
      },
      transcriptomics: {
        title: "Transcriptomics",
        info: {
          text: "How genes are transcribed into RNA and processed—and how measuring which transcripts are present reveals what a cell is actually doing.",
          link: "wiki:Transcriptomics"
        }
      }
    }
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
      "artificial-intelligence": {
        title: "Artificial Intelligence",
        info: {
          text: "How machines learn from examples, represent patterns, make predictions, and generate new outputs—and how those systems are evaluated.",
          link: "wiki:Artificial intelligence"
        }
      },
      "bioinformatics": {
        title: "Bioinformatics",
        info: {
          text: "How biological observations become structured data, how algorithms compare them, and how computational analyses remain interpretable and reproducible.",
          link: "wiki:Bioinformatics"
        }
      },
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
    },
    subcategories: {
      "electronics": {
        title: "Electronics",
        info: {
          text: "How circuits represent, transform, store, and control electrical energy and information—from basic network laws to embedded systems.",
          link: "wiki:Electronics"
        }
      }
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
  "Philosophy": {
    domain: "humanities",
    slug: "philosophy",
    info: {
      text: "How people reason about what's true, what's real, and what's right.",
      link: "wiki:Philosophy"
    },
    subcategories: {
      "political-philosophy": {
        title: "Political Philosophy",
        info: {
          text: "How power, authority, justice, and the state ought to be organized and justified, as distinct from how they actually operate.",
          link: "wiki:Political philosophy"
        }
      }
    }
  },
  Psychology: {
    slug: "psychology",
    domain: "social-sciences",
    info: {
      text: "How the mind develops, perceives, defends itself, and sometimes works against its own interests.",
      link: "wiki:Psychology"
    },
    subcategories: {
      psychoanalysis: {
        title: "Psychoanalysis",
        info: {
          text: "How the mind is shaped by drive, defense, and lack, from Freud and Jung through Lacan, Winnicott, and Bion.",
          link: "wiki:Psychoanalysis"
        }
      },
      "moral-psychology": {
        title: "Moral Psychology",
        info: {
          text: "How ordinary people come to do, permit, or excuse harm, and what it takes to refuse.",
          link: "wiki:Moral psychology"
        }
      }
    }
  },
  "Sociology": {
    domain: "social-sciences",
    slug: "sociology",
    info: {
      text: "How groups, institutions, and social structures shape belief and behavior.",
      link: "wiki:Sociology"
    }
  },
  "Economics": {
    domain: "social-sciences",
    slug: "economics",
    info: {
      text: "How people and institutions allocate scarce resources, and what that reveals about incentive and behavior.",
      link: "wiki:Economics"
    }
  },
  "Media & Information Literacy": {
    slug: "media-information-literacy",
    domain: "communication-media",
    info: {
      text: "Telling apart what's real, sourced, and trustworthy online.",
      link: "wiki:Media literacy"
    },
    subcategories: {
      "propaganda-disinformation": {
        title: "Propaganda & Disinformation",
        info: {
          text: "How organized campaigns produce, launder, and amplify misleading belief, and whose interests they serve.",
          link: "wiki:Disinformation"
        }
      },
      "verification-fact-checking": {
        title: "Verification & Fact-Checking",
        info: {
          text: "How a reader checks a claim, source, image, or figure against its origin and against independent evidence.",
          link: "wiki:Fact-checking"
        }
      }
    }
  },
  Physiology: {
    slug: "physiology-medicine",
    domain: "health-medicine",
    info: {
      text: "How the human body's cells, tissues, and organ systems work, and how they coordinate to keep internal conditions stable.",
      link: "wiki:Physiology"
    },
    subcategories: {
      "blood-hemostasis": {
        title: "Blood & Hemostasis",
        info: {
          text: "How blood's cells and plasma carry and defend, how they are produced, and how clotting stops bleeding.",
          link: "wiki:Blood",
          extraLink: "wiki:Hemostasis"
        }
      },
      cardiovascular: {
        title: "Cardiovascular Physiology",
        info: {
          text: "How the heart pumps, how vessels distribute flow and pressure, and how circulation is regulated.",
          link: "wiki:Cardiovascular physiology"
        }
      },
      "cellular-membrane": {
        title: "Cellular & Membrane Physiology",
        info: {
          text: "How membranes, transporters, and ion gradients set the conditions every cell, nerve, and muscle depends on.",
          link: "wiki:Cell physiology"
        }
      },
      "endocrine-reproductive": {
        title: "Endocrine & Reproductive Physiology",
        info: {
          text: "How hormones carry signals between organs and regulate metabolism, growth, and reproduction.",
          link: "wiki:Endocrinology",
          extraLink: "wiki:Reproductive physiology"
        }
      },
      gastrointestinal: {
        title: "Gastrointestinal Physiology",
        info: {
          text: "How the gut moves, secretes, digests, and absorbs, and how those functions are controlled.",
          link: "wiki:Gastrointestinal physiology"
        }
      },
      integrative: {
        title: "Integrative Physiology",
        info: {
          text: "How systems work together to maintain homeostasis, regulate temperature, and respond to exercise and stress.",
          link: "wiki:Homeostasis"
        }
      },
      muscle: {
        title: "Muscle Physiology",
        info: {
          text: "How skeletal, cardiac, and smooth muscle convert chemical energy into force, and how contraction is triggered and graded.",
          link: "wiki:Muscle contraction"
        }
      },
      neurophysiology: {
        title: "Neurophysiology",
        info: {
          text: "How neurons generate and transmit signals, and how neural circuits sense, integrate, and command.",
          link: "wiki:Neurophysiology"
        }
      },
      renal: {
        title: "Renal Physiology",
        info: {
          text: "How the kidneys filter, reabsorb, and secrete to regulate body fluids, electrolytes, and acid–base balance.",
          link: "wiki:Renal physiology"
        }
      },
      respiratory: {
        title: "Respiratory Physiology",
        info: {
          text: "How ventilation, gas exchange, and gas transport move oxygen in and carbon dioxide out, and how breathing is controlled.",
          link: "wiki:Respiratory physiology"
        }
      }
    },
    previousTitles: [
      "Physiology & Medicine",
      "Anatomy & Physiology"
    ]
  },
  "Bioethics": {
    domain: "health-medicine",
    info: {
      text: "How medical care raises questions of consent, vulnerability, trust, and harm that clinical facts alone don't settle.",
      link: "wiki:Bioethics"
    }
  },
  "Public Health": {
    slug: "public-health",
    domain: "health-medicine",
    info: {
      text: "How communities understand health risks, prevent harm, protect populations, and build the conditions in which people can thrive.",
      link: "wiki:Public health"
    },
    subcategories: {
      epidemiology: {
        title: "Epidemiology",
        info: {
          text: "Epidemiology is the scientific study of how often diseases occur in different groups of people and why, serving as the basic foundation of public health.",
          link: "wiki:Epidemiology"
        }
      },
      biostatistics: {
        title: "Biostatistics",
        info: {
          text: "The application of math and statistics to collect, analyze, and interpret health and medical data.",
          link: "wiki:Biostatistics"
        }
      },
      "environmental-health": {
        title: "Environmental Health",
        info: {
          text: "The study of how surroundings—such as air, water, and chemicals—affect human health.",
          link: "wiki:Environmental Health"
        }
      },
      "health-policy": {
        title: "Health Policy and Management",
        info: {
          text: "The administration, laws, and planning involved in making healthcare systems efficient, fair, and accessible.",
          link: "wiki:Health Policy"
        }
      }
    }
  },
  "Physical Geography": {
    slug: "geography",
    domain: "earth-environment",
    info: {
      text: "How location, environment, movement, and human activity create spatial patterns and distinctive regions.",
      link: "wiki:Geography"
    },
    subcategories: {
      hydrology: {
        title: "Hydrology",
        info: {
          text: "How water moves through the Earth system: where it is stored, how it flows underground and over land, and how the invisible reservoir connects to every stream and well.",
          link: "wiki:Hydrology"
        }
      }
    },
    previousTitles: [
      "Geography"
    ]
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
  // Deliberately domain-less: cross-disciplinary fact collections need a
  // browse home, currently the "Other subjects" bucket. This is a taxonomy
  // convention, not a puzzle type or a placeholder awaiting a discipline.
  //
  // This is the current cross-disciplinary browse convention, not a puzzle
  // type selector. Quiz-led puzzles use the explicit trivia-quiz authoring
  // profile whether they live here or under a more specific category.
  "Trivia": {
    info: {
      text: "Specific, memorable facts worth knowing on their own, not organized under any one discipline.",
      link: "wiki:Trivia"
    }
  },
  // Deliberately domain-less alongside Trivia: Vocabulary focuses on words
  // in context and the distinctions between their uses, rather than on one
  // disciplinary home. Vocabulary lenses use the existing sequential lens
  // flow; this is authoring guidance, not a registry-enforced mode.
  "Vocabulary": {
    info: {
      text: "How context, usage, and neighboring meanings determine what a word means.",
      link: "wiki:Vocabulary"
    }
  },
  "Political Science": {
    domain: "social-sciences",
    info: {
      text: "How societies organize power, govern themselves, and settle disputes over authority and rights.",
      link: "wiki:Political science"
    }
  },
  Anthropology: {
    domain: "social-sciences",
    info: {
      text: "How human beings vary and cohere across evolutionary history, culture, and social organization -- and what that variation reveals about human nature.",
      link: "wiki:Anthropology"
    }
  },
  Architecture: {
    slug: "architecture",
    domain: "art-design",
    info: {
      text: "How built form organizes space, structure, use, and experience — from rooms and materials to cities.",
      link: "wiki:Architecture"
    },
    subcategories: {
      "form-and-space": {
        title: "Form & Space",
        info: {
          text: "How enclosure, sequence, light, and proportion shape how people move through and read buildings.",
          link: "wiki:Architectural design"
        }
      },
      "structure-and-materials": {
        title: "Structure & Materials",
        info: {
          text: "How load paths and material properties constrain what can be built and how it stands.",
          link: "wiki:Structural engineering"
        }
      }
    }
  },
  Linguistics: {
    slug: "linguistics",
    domain: "language-literacy",
    info: {
      text: "How language is structured, how meaning is built and communicated, and how linguistic expressions relate to the world.",
      link: "wiki:Linguistics"
    }
  },
  "Atmospheric Science": {
    slug: "atmospheric-science",
    domain: "earth-environment",
    info: {
      text: "Atmospheric Scientists mainly study the Earth's atmosphere (mainly the troposphere) with a focus on understanding and forecasting the processes that give rise to our weather."
    },
    subcategories: {
      meteorology: {
        title: "Meteorology",
        info: {
          text: "the scientific study of the Earth's atmosphere and the physical processes that drive our weather and daily atmospheric conditions.",
          link: "https://www.ebsco.com/research-starters/earth-and-atmospheric-sciences/meteorology"
        }
      },
      hydrology: {
        title: "Hydrology",
        info: {}
      },
      climatology: {
        title: "Climatology",
        info: {
          text: "the scientific study of Earth's climate and long-term weather patterns averaged over extended periods, typically 30 years or more.",
          link: "https://drought.unl.edu/Education/DroughtIn-depth/WhatisClimatology.aspx"
        }
      }
    }
  },
  Religion: {
    slug: "religion",
    domain: "humanities",
    info: {
      text: "How communities make meaning through belief, practice, text, and institution — and how those forms shape ethics and identity.",
      link: "wiki:Religious studies"
    },
    subcategories: {
      "ritual-and-practice": {
        title: "Ritual & Practice",
        info: {
          text: "How embodied practices — worship, pilgrimage, observance — structure religious life beyond belief alone.",
          link: "wiki:Ritual"
        }
      },
      "sacred-texts": {
        title: "Sacred Texts",
        info: {
          text: "How religious communities read, interpret, and authorize texts as scripture.",
          link: "wiki:Religious text"
        }
      }
    }
  },
  Geology: {
    slug: "geology",
    domain: "earth-environment",
    info: {
      text: "Geology is the scientific study of the Earth, its solid materials, its structure, and the processes that change it over time.",
      link: "wiki:Geography"
    }
  },
  "Literary History & Canons": {
    slug: "literary-history",
    domain: "literature-classics",
    info: {
      text: "How distinct historical eras, regional movements, and language traditions forge unique literary identities and redefine what literature can do."
    }
  },
  Botany: {
    slug: "botany",
    info: {
      text: "The scientific branch of biology that focuses on the study of plants, including their structure, growth, reproduction, metabolism, and interactions with the environment.",
      link: "wiki:Biology"
    },
    subcategories: {
      horticulture: {
        title: "Horticulture",
        info: {
          text: "Horticulture involves the cultivation of garden plants, fruits, vegetables, and ornamental plants.",
          link: "wiki:Horticulture"
        }
      }
    }
  },
  Microbiology: {
    slug: "microbiology",
    domain: "life-sciences",
    info: {
      text: "How organisms and particles too small to see with the naked eye are built, multiply, and interact with their hosts and environments.",
      link: "wiki:Microbiology"
    },
    subcategories: {
      bacteriology: {
        title: "Bacteriology",
        info: {
          text: "How bacteria are structured, identified, and classified, and how they grow, exchange genes, and resist antibiotics.",
          link: "wiki:Bacteriology"
        }
      },
      mycology: {
        title: "Mycology",
        info: {
          text: "How fungi, from yeasts to molds, grow, reproduce, and interact with plants, animals, and people.",
          link: "wiki:Mycology"
        }
      },
      parasitology: {
        title: "Parasitology",
        info: {
          text: "How protozoan and animal parasites live in and on their hosts, and how their life cycles spread infection.",
          link: "wiki:Parasitology"
        }
      },
      virology: {
        title: "Virology",
        info: {
          text: "Virology is the scientific study of biological viruses, their structure, classification, evolution, and how they infect host cells.",
          link: "wiki:Virology"
        }
      }
    },
    previousTitles: [
      "microbiology"
    ]
  },
  Zoology: {
    slug: "zoology",
    domain: "life-sciences",
    info: {
      text: "Zoology is the branch of biology that studies the scientific and structural aspects of animals, including their behavior, classification, and ecosystems.",
      link: "wiki:Zoology"
    }
  },
  Astronomy: {
    slug: "astronomy",
    domain: "sciences-mathematics",
    info: {
      text: "How stars, planets, moons, and the systems they form arise, behave, and evolve.",
      link: "wiki:Astronomy"
    },
    subcategories: {
      "solar-system": {
        title: "Solar System",
        info: {
          text: "How one star and the worlds orbiting it - planets, dwarfs, moons, and leftover debris - were sorted into place.",
          link: "wiki:Solar_System"
        }
      }
    }
  },
  Ecology: {
    slug: "ecology",
    domain: "life-sciences",
    info: {
      text: "How organisms interact with each other and their surroundings — the flows of energy and matter that link populations, communities, and the places they live.",
      link: "wiki:Ecology"
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

// `level` is optional and opt-in, deliberately -- unlike category (usually
// obvious from subject matter) or the append-position-derived "new" badge
// (zero judgment either way), "introductory" vs. "advanced" is a genuine,
// recurring editorial call. Forcing it onto every puzzle would mean
// classifying the entire existing corpus retroactively and every puzzle
// after it, just to make a level-based auto-catalogue work -- so it stays
// unset by default, an author adds it only when confident, and a level
// with zero puzzles simply doesn't appear as a catalogue at all (see
// catalogueRegistry.js's levelCatalogue). A small fixed vocabulary, not a
// free-form field like tags -- it has to be a controlled, ordered set for
// "which level catalogues exist" to be answerable at all.
export const PUZZLE_LEVELS = ["introductory", "intermediate", "advanced"];

export function puzzleLevel(puzzle) {
  return PUZZLE_LEVELS.includes(puzzle?.level) ? puzzle.level : null;
}

// Category references in persisted puzzle documents are stable identifiers,
// while the registry remains title-keyed for the player-facing metadata and
// for compatibility with the original hand-authored modules.  These helpers
// deliberately accept either representation so a rollout can read old
// documents while every migration/publication writer emits ids.
export const CATEGORY_REFERENCE_SCHEMA_VERSION = 2;

function categoryEntries(registry = CATEGORIES) {
  if (!registry || typeof registry !== "object") return [];
  return Object.entries(registry).map(([key, metadata]) => ({
    key,
    metadata: metadata && typeof metadata === "object" ? metadata : {},
    id: metadata?.slug || slugify(key),
    title: typeof metadata?.title === "string" && metadata.title.trim()
      ? metadata.title.trim()
      : key
  }));
}

export function categoryIdFor(value, registry = CATEGORIES) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input) return null;
  const entries = categoryEntries(registry);
  const exactKey = entries.find(entry => entry.key.trim() === input);
  if (exactKey) return exactKey.id;
  const exactId = entries.find(entry => entry.id === input);
  if (exactId) return exactId.id;
  const title = entries.find(entry => entry.title === input);
  if (title) return title.id;
  const alias = entries.find(entry =>
    Array.isArray(entry.metadata.previousTitles) &&
    entry.metadata.previousTitles.some(previous =>
      typeof previous === "string" && previous.trim() === input
    )
  );
  if (alias) return alias.id;
  return slugify(input) || input;
}

export function categoryTitleFor(value, registry = CATEGORIES) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input) return null;
  const entries = categoryEntries(registry);
  const exactKey = entries.find(entry => entry.key.trim() === input);
  if (exactKey) return exactKey.title;
  const match = entries.find(entry =>
    entry.id === input || entry.title === input ||
    slugify(entry.key) === input ||
    (Array.isArray(entry.metadata.previousTitles) &&
      entry.metadata.previousTitles.some(previous =>
        typeof previous === "string" && previous.trim() === input
      ))
  );
  return match?.title || input;
}

// Whether a value is explicitly represented by the supplied registry as a
// current title/key, stable id, or retired title alias. Migration tools use
// this to distinguish a legacy title that needs a registry mapping from an
// already-canonical (but not yet registered locally) id that should be left
// untouched rather than guessed via slugification.
export function categoryReferenceKnown(value, registry = CATEGORIES) {
  if (typeof value !== "string") return false;
  const input = value.trim();
  if (!input) return false;
  return categoryEntries(registry).some(entry =>
    entry.key.trim() === input
    || entry.id === input
    || entry.title === input
    || (Array.isArray(entry.metadata.previousTitles) &&
      entry.metadata.previousTitles.some(previous =>
        typeof previous === "string" && previous.trim() === input
      ))
  );
}

export function categoryMetadataFor(value, registry = CATEGORIES) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input) return null;
  const entry = categoryEntries(registry).find(item =>
    item.key.trim() === input || item.id === input || item.title === input ||
    slugify(item.key) === input ||
    (Array.isArray(item.metadata.previousTitles) &&
      item.metadata.previousTitles.some(previous =>
        typeof previous === "string" && previous.trim() === input
      ))
  );
  return entry?.metadata || null;
}

export function categoryIdsForPuzzle(puzzle, registry = CATEGORIES) {
  const authored = Array.isArray(puzzle?.categories)
    ? puzzle.categories
    : [puzzle?.category];
  return [...new Set(authored
    .map(value => categoryIdFor(value, registry))
    .filter(Boolean))];
}

// Convert a puzzle/document to the persisted category-reference contract.
// The operation is pure and keeps the current category assignment when a
// document happens to contain both a retired title and its canonical id.
export function canonicalizePuzzleCategoryReferences(
  document,
  registry = CATEGORIES
) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }
  const category = typeof document.category === "string"
    ? (categoryIdFor(document.category, registry) ?? document.category)
    : document.category;
  const categories = Array.isArray(document.categories)
    ? [...new Set(document.categories.map(value =>
      categoryIdFor(value, registry) ?? value
    ))]
    : undefined;
  const subcategories = document.subcategories &&
    typeof document.subcategories === "object" && !Array.isArray(document.subcategories)
    ? document.subcategories
    : undefined;
  let canonicalSubcategories;
  if (subcategories) {
    canonicalSubcategories = {};
    for (const [key, value] of Object.entries(subcategories)) {
      const id = categoryIdFor(key, registry) ?? key;
      // If both title and id occur, the already-canonical id wins.
      if (Object.hasOwn(canonicalSubcategories, id) && key !== id) continue;
      canonicalSubcategories[id] = value;
    }
  }
  const next = { ...document };
  let changed = false;
  if (category !== document.category) {
    next.category = category;
    changed = true;
  }
  if (categories && JSON.stringify(categories) !== JSON.stringify(document.categories)) {
    next.categories = categories;
    changed = true;
  }
  if (canonicalSubcategories && JSON.stringify(canonicalSubcategories) !== JSON.stringify(subcategories)) {
    next.subcategories = canonicalSubcategories;
    changed = true;
  }
  return changed ? next : document;
}

// Return every authored category for a puzzle, normalized to a unique list.
// Existing puzzles that only define `category` continue to work unchanged.
export function categoriesForPuzzle(puzzle, registry = CATEGORIES) {
  const authored = Array.isArray(puzzle?.categories)
    ? puzzle.categories
    : [puzzle?.category];
  return [...new Set(authored
    .filter(name => typeof name === "string" && name.trim())
    .map(name => categoryTitleFor(name, registry)))];
}

export function primaryCategoryForPuzzle(puzzle, registry = CATEGORIES) {
  return categoriesForPuzzle(puzzle, registry)[0] || null;
}

export function puzzleBelongsToCategory(puzzle, category, registry = CATEGORIES) {
  const id = categoryIdFor(category, registry);
  return !!id && categoryIdsForPuzzle(puzzle, registry).includes(id);
}

export function subcategoryIdForPuzzle(puzzle, category, registry = CATEGORIES) {
  if (!puzzleBelongsToCategory(puzzle, category, registry)) return null;
  const categoryId = categoryIdFor(category, registry);
  const values = puzzle?.subcategories;
  if (!values || typeof values !== "object" || Array.isArray(values)) return null;
  // Transitional documents can contain both a canonical id key and a retired
  // title key. The canonical key is authoritative regardless of object order.
  const key = Object.hasOwn(values, categoryId)
    ? categoryId
    : Object.keys(values).find(candidate =>
      categoryIdFor(candidate, registry) === categoryId
    );
  const id = key !== undefined ? values[key] : null;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export function subcategoryById(category, subcategoryId, registry = CATEGORIES) {
  const metadata = categoryMetadataFor(category, registry);
  const definition = metadata?.subcategories?.[subcategoryId];
  return definition ? { id: subcategoryId, ...definition } : null;
}

// null for a category without authored metadata (e.g. "Film") -- that's
// expected, not an error; see the "Other subjects" bucket in overviewRenderer.js.
export function domainForCategory(category, registry = CATEGORIES) {
  return categoryMetadataFor(category, registry)?.domain || null;
}

export function subcategoryForPuzzle(puzzle, category, registry = CATEGORIES) {
  const id = subcategoryIdForPuzzle(puzzle, category, registry);
  return id ? subcategoryById(category, id, registry) : null;
}

export function subcategoriesForCategory(category, registry = CATEGORIES) {
  return Object.entries(categoryMetadataFor(category, registry)?.subcategories || {})
    .map(([id, definition]) => ({ id, ...definition }));
}

export function puzzleBelongsToSubcategory(
  puzzle,
  category,
  subcategoryId,
  registry = CATEGORIES
) {
  if (!puzzleBelongsToCategory(puzzle, category, registry)) return false;
  if (subcategoryId === GENERATED_SUBCATEGORY_IDS.all) return true;
  const assigned = subcategoryIdForPuzzle(puzzle, category, registry);
  if (subcategoryId === GENERATED_SUBCATEGORY_IDS.other) return !assigned;
  return assigned === subcategoryId;
}

export function puzzlesForSubcategory(puzzles, category, subcategoryId, registry = CATEGORIES) {
  return puzzles.filter(puzzle =>
    puzzleBelongsToSubcategory(puzzle, category, subcategoryId, registry)
  );
}

// Only definitions represented in the supplied puzzle set are returned.
// This keeps catalogue screens relative to their own membership rather than
// leaking empty subjects from the global registry.
export function subcategoriesForPuzzleSet(puzzles, category, registry = CATEGORIES) {
  return subcategoriesForCategory(category, registry).flatMap(subcategory => {
    const count = puzzlesForSubcategory(
      puzzles,
      category,
      subcategory.id,
      registry
    ).length;
    return count ? [{ ...subcategory, count }] : [];
  });
}

export function resolveSubcategory(value, puzzles, category, registry = CATEGORIES) {
  if (!value || !category) return null;
  const categoryPuzzles = puzzles.filter(puzzle =>
    puzzleBelongsToCategory(puzzle, category, registry)
  );
  const represented = subcategoriesForPuzzleSet(categoryPuzzles, category, registry);
  if (!represented.length) return null;
  if (value === GENERATED_SUBCATEGORY_IDS.all) {
    return GENERATED_SUBCATEGORY_IDS.all;
  }
  if (value === GENERATED_SUBCATEGORY_IDS.other) {
    return categoryPuzzles.some(puzzle =>
      !subcategoryIdForPuzzle(puzzle, category, registry)
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
  return categoryIdFor(name, CATEGORIES);
}

// Authoring play replaces this in-place so slug/subcategory helpers keep
// closing over the same object. Production never calls this.
export function replaceCategoriesRegistry(next) {
  for (const key of Object.keys(CATEGORIES)) delete CATEGORIES[key];
  if (next && typeof next === "object") Object.assign(CATEGORIES, next);
  return CATEGORIES;
}

export default CATEGORIES;
