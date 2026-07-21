// ============================================================
// Concept Clusters — puzzle definitions
// ============================================================
// Puzzles are plain data. To author a new puzzle, add an object
// to this array. No game-code changes are required.
//
// Schema:
//   id       unique string, used in the puzzle picker
//   title    shown to the player
//   clusters array of 2–4 clusters:
//     name   revealed when the cluster is completed
//     color  one of: "green" | "blue" | "amber"  (maps to CSS)
//     fact   one-line teaching payoff shown on completion
//     terms  ALL single-cluster terms (3–5 recommended)
//     seeds  exactly two entries from `terms`, pre-connected
//            as the orienting clue
//   bridges  array (may be empty) of terms that belong to TWO
//            clusters and must be connected to both:
//     term     the bridge term (not listed in any cluster's terms)
//     clusters [i, j] indices into the clusters array
//     fact     explains WHY it spans both — the key teaching moment
//
// Design rules (see README):
//   - No trap words. Every term belongs unambiguously to its
//     declared cluster(s). Ambiguity is noise, not challenge.
//   - Bridges are the relationship layer: use them to encode how
//     concept groups connect, not to trick the player.
// ============================================================

const PUZZLES = [
  {
    id: "energy-flow",
    title: "Energy flow in living systems",
    clusters: [
      {
        name: "Photosynthesis",
        color: "green",
        fact: "Plants turn sunlight, water, and carbon dioxide into food.",
        terms: ["sunlight", "chlorophyll", "carbon dioxide"],
        seeds: ["sunlight", "chlorophyll"]
      },
      {
        name: "Cellular respiration",
        color: "blue",
        fact: "Cells break down food to release usable energy as ATP.",
        terms: ["mitochondria", "ATP", "aerobic"],
        seeds: ["mitochondria", "ATP"]
      },
      {
        name: "Ecosystems",
        color: "amber",
        fact: "Energy flows through ecosystems along food chains.",
        terms: ["food chain", "consumers", "decomposers"],
        seeds: ["food chain", "consumers"]
      }
    ],
    bridges: [
      {
        term: "oxygen",
        clusters: [0, 1],
        fact: "Oxygen bridges the two: photosynthesis releases it, respiration consumes it."
      },
      {
        term: "producers",
        clusters: [0, 2],
        fact: "Producers bridge the two: organisms that photosynthesize form the base of every ecosystem."
      }
    ]
  },
  {
    id: "math-foundations",
    title: "Math foundations",
    clusters: [
      {
        name: "Number systems",
        color: "green",
        fact: "Integers, fractions, and decimals are different ways of writing quantity.",
        terms: ["integers", "fractions", "decimals"],
        seeds: ["integers", "fractions"]
      },
      {
        name: "Geometry",
        color: "blue",
        fact: "Geometry studies shapes and the space they occupy.",
        terms: ["angles", "polygons", "circles"],
        seeds: ["angles", "polygons"]
      },
      {
        name: "Measurement",
        color: "amber",
        fact: "Measurement assigns numbers to real-world quantities using units.",
        terms: ["length", "mass", "time"],
        seeds: ["length", "mass"]
      }
    ],
    bridges: [
      {
        term: "pi",
        clusters: [0, 1],
        fact: "Pi bridges the two: an irrational number that defines every circle."
      },
      {
        term: "area",
        clusters: [1, 2],
        fact: "Area bridges the two: measuring the space inside a shape links geometry to measurement."
      }
    ]
  },
  {
    id: "states-of-matter",
    title: "States of matter",
    clusters: [
      {
        name: "Solid",
        color: "green",
        fact: "Solids have a fixed shape and volume because particles are packed tightly and can only vibrate.",
        terms: ["fixed shape", "crystal", "rigid"],
        seeds: ["fixed shape", "crystal"]
      },
      {
        name: "Liquid",
        color: "blue",
        fact: "Liquids take the shape of their container while keeping a fixed volume.",
        terms: ["surface tension", "viscosity", "flow"],
        seeds: ["surface tension", "viscosity"]
      },
      {
        name: "Gas",
        color: "amber",
        fact: "Gases expand to fill any container because their particles move freely and far apart.",
        terms: ["pressure", "expansion", "compressible"],
        seeds: ["pressure", "expansion"]
      }
    ],
    bridges: [
      {
        term: "melting point",
        clusters: [0, 1],
        fact: "Melting point bridges the two: it is the exact temperature where solid and liquid coexist — the same boundary in both directions."
      },
      {
        term: "boiling point",
        clusters: [1, 2],
        fact: "Boiling point bridges the two: it marks where liquid and gas are in equilibrium, and pressure shifts where that line falls."
      }
    ]
  },
  {
    id: "democracy-history",
    title: "Democracy through history",
    clusters: [
      {
        name: "Ancient Athens",
        color: "green",
        fact: "Athens invented direct democracy, where citizens voted on laws themselves in the assembly.",
        terms: ["agora", "citizens", "assembly"],
        seeds: ["agora", "citizens"]
      },
      {
        name: "Roman Republic",
        color: "blue",
        fact: "Rome pioneered representative government with elected magistrates and a powerful Senate.",
        terms: ["Senate", "consuls", "tribunes"],
        seeds: ["Senate", "consuls"]
      },
      {
        name: "Modern democracy",
        color: "amber",
        fact: "Modern democracies blend direct and representative elements, protected by written constitutions.",
        terms: ["elections", "constitution", "rights"],
        seeds: ["elections", "constitution"]
      }
    ],
    bridges: [
      {
        term: "veto",
        clusters: [1, 2],
        fact: "Veto bridges the two: Roman tribunes invented it to block unjust laws; modern governments still use it as a check on power."
      },
      {
        term: "civic duty",
        clusters: [0, 2],
        fact: "Civic duty bridges the two: the Athenian ideal that citizens must participate runs directly to modern expectations of voters and jurors."
      }
    ]
  },
  {
    id: "sentence-structure",
    title: "English sentence structure",
    clusters: [
      {
        name: "Nouns",
        color: "green",
        fact: "Nouns name people, places, things, and ideas — they are the anchors of every sentence.",
        terms: ["subject", "object", "pronoun"],
        seeds: ["subject", "object"]
      },
      {
        name: "Verbs",
        color: "blue",
        fact: "Verbs express actions, states, or occurrences and give a sentence its energy.",
        terms: ["tense", "predicate", "infinitive"],
        seeds: ["tense", "predicate"]
      },
      {
        name: "Modifiers",
        color: "amber",
        fact: "Modifiers — adjectives and adverbs — add detail and precision by describing other words.",
        terms: ["adjective", "adverb", "clause"],
        seeds: ["adjective", "adverb"]
      }
    ],
    bridges: [
      {
        term: "agreement",
        clusters: [0, 1],
        fact: "Agreement bridges the two: subject and verb must match in number, tying nouns and verbs into a grammatical unit."
      },
      {
        term: "phrase",
        clusters: [0, 2],
        fact: "Phrase bridges the two: a noun phrase pairs a noun with its modifiers, showing how the two word classes build meaning together."
      }
    ]
  }
];
