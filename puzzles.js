// ============================================================
// Concept Clusters — puzzle definitions
// ============================================================
// Puzzles are plain data. To author a new puzzle, add an object
// to this array. No game-code changes are required.
//
// Schema:
//   id       unique string, used in the puzzle picker
//   title    shown to the player
//   category subject grouping shown as an <optgroup> label in the
//            puzzle picker (e.g. "Science", "Math"); puzzles sharing
//            a category are grouped together regardless of array order
//   large    (optional, boolean) marks a larger-format puzzle: shown
//            with a "(Large)" suffix in the picker and switches the
//            board to the bigger `wide` viewBox/layout (falls back
//            to standard size on small screens automatically — see
//            loadPuzzle in game.js). Purely about node count/board
//            size, not conceptual difficulty — still lives in its
//            normal `category` group either way.
//   clusters array of 2–4 clusters:
//     name   revealed when the cluster is completed
//     color  one of: "green" | "blue" | "amber" | "rose"  (maps to CSS)
//     fact   one-line teaching payoff shown on completion
//     terms  ALL single-cluster terms (3–5 recommended)
//     seeds  exactly two entries from `terms`, pre-connected
//            as the orienting clue
//   bridges  array (may be empty) of terms that belong to TWO
//            clusters and must be connected to both:
//     term     the bridge term (not listed in any cluster's terms)
//     clusters [i, j] indices into the clusters array
//     fact     explains WHY it spans both — the key teaching moment
//     idealTerms  (optional) [termForClusterI, termForClusterJ], either
//            entry may be null. Names the specific term within a
//            cluster that this bridge conceptually connects to best —
//            e.g. "veto" bridges Roman Republic, and `tribunes` is the
//            actual answer, not `Senate` or `consuls`. Connecting to
//            ANY completed node in the right cluster still counts as
//            correct (never rejected — that would recreate a trap-word
//            guessing game between cluster-mates); landing on the
//            named term just adds a bit of extra praise in the
//            feedback message. Leave an entry (or the whole field)
//            omitted/null when no single term is genuinely the best
//            fit — many bridges are whole-cluster relationships and
//            forcing an anchor there would be manufacturing precision
//            that isn't real.
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
    category: "Science",
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
        fact: "Oxygen bridges the two: photosynthesis releases it, respiration consumes it.",
        idealTerms: ["chlorophyll", "aerobic"]
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
    category: "Math",
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
        fact: "Pi bridges the two: an irrational number that defines every circle.",
        idealTerms: [null, "circles"]
      },
      {
        term: "area",
        clusters: [1, 2],
        fact: "Area bridges the two: measuring the space inside a shape links geometry to measurement.",
        idealTerms: [null, "length"]
      }
    ]
  },
  {
    id: "states-of-matter",
    title: "States of matter",
    category: "Science",
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
        fact: "Boiling point bridges the two: it marks where liquid and gas are in equilibrium, and pressure shifts where that line falls.",
        idealTerms: [null, "pressure"]
      }
    ]
  },
  {
    id: "democracy-history",
    title: "Democracy through history",
    category: "History & Society",
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
        fact: "Veto bridges the two: Roman tribunes invented it to block unjust laws; modern governments still use it as a check on power.",
        idealTerms: ["tribunes", "constitution"]
      },
      {
        term: "civic duty",
        clusters: [0, 2],
        fact: "Civic duty bridges the two: the Athenian ideal that citizens must participate runs directly to modern expectations of voters and jurors.",
        idealTerms: ["citizens", "elections"]
      }
    ]
  },
  {
    id: "sentence-structure",
    title: "English sentence structure",
    category: "Language Arts",
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
        fact: "Agreement bridges the two: subject and verb must match in number, tying nouns and verbs into a grammatical unit.",
        idealTerms: ["subject", "predicate"]
      },
      {
        term: "phrase",
        clusters: [0, 2],
        fact: "Phrase bridges the two: a noun phrase pairs a noun with its modifiers, showing how the two word classes build meaning together.",
        idealTerms: [null, "adjective"]
      }
    ]
  },
  {
    id: "body-systems",
    title: "Human body systems",
    category: "Science",
    clusters: [
      {
        name: "Circulatory",
        color: "green",
        fact: "The circulatory system pumps blood carrying oxygen and nutrients to every cell.",
        terms: ["heart", "blood vessels", "pulse"],
        seeds: ["heart", "blood vessels"]
      },
      {
        name: "Respiratory",
        color: "blue",
        fact: "The respiratory system exchanges oxygen and carbon dioxide between the air and the blood.",
        terms: ["lungs", "alveoli", "diaphragm"],
        seeds: ["lungs", "alveoli"]
      },
      {
        name: "Digestive",
        color: "amber",
        fact: "The digestive system breaks food into nutrients the body can absorb and use.",
        terms: ["stomach", "enzymes", "intestines"],
        seeds: ["stomach", "enzymes"]
      }
    ],
    bridges: [
      {
        term: "oxygen",
        clusters: [0, 1],
        fact: "Oxygen bridges the two: the lungs load it into the blood, and the heart pumps it everywhere the body needs it.",
        idealTerms: ["heart", "lungs"]
      },
      {
        term: "nutrients",
        clusters: [0, 2],
        fact: "Nutrients bridge the two: digestion breaks food down, and circulation carries the nutrients to every cell.",
        idealTerms: ["blood vessels", "intestines"]
      }
    ]
  },
  {
    id: "algebra-basics",
    title: "Algebra basics",
    category: "Math",
    clusters: [
      {
        name: "Variables",
        color: "green",
        fact: "Variables are symbols that stand in for unknown or changing quantities.",
        terms: ["unknown", "coefficient", "term"],
        seeds: ["unknown", "coefficient"]
      },
      {
        name: "Equations",
        color: "blue",
        fact: "Equations state that two expressions are equal, and stay balanced under the same operation on both sides.",
        terms: ["balance", "inverse operation", "solution"],
        seeds: ["balance", "inverse operation"]
      },
      {
        name: "Functions",
        color: "amber",
        fact: "Functions map every input to exactly one output, describing how one quantity depends on another.",
        terms: ["input", "output", "domain"],
        seeds: ["input", "output"]
      }
    ],
    bridges: [
      {
        term: "solving for x",
        clusters: [0, 1],
        fact: "Solving for x bridges the two: it's the act of isolating a variable by keeping an equation balanced.",
        idealTerms: ["unknown", "inverse operation"]
      },
      {
        term: "graph",
        clusters: [1, 2],
        fact: "A graph bridges the two: it's the visual picture of both an equation's solutions and a function's input-output pairs.",
        idealTerms: ["solution", null]
      }
    ]
  },
  {
    id: "data-probability",
    title: "Data & probability",
    category: "Math",
    clusters: [
      {
        name: "Statistics",
        color: "green",
        fact: "Statistics summarizes data using measures like mean, median, and range.",
        terms: ["mean", "median", "range"],
        seeds: ["mean", "median"]
      },
      {
        name: "Probability",
        color: "blue",
        fact: "Probability measures how likely an event is, from impossible to certain.",
        terms: ["outcome", "event", "likelihood"],
        seeds: ["outcome", "event"]
      },
      {
        name: "Graphs & charts",
        color: "amber",
        fact: "Graphs and charts turn raw numbers into a picture that's easier to read at a glance.",
        terms: ["bar chart", "histogram", "scatter plot"],
        seeds: ["bar chart", "histogram"]
      }
    ],
    bridges: [
      {
        term: "sample",
        clusters: [0, 1],
        fact: "Sample bridges the two: statistics describes a sample, and probability predicts how well it represents the whole population."
      },
      {
        term: "distribution",
        clusters: [1, 2],
        fact: "Distribution bridges the two: it's a probability idea that's almost always shown as a graph, like a histogram's shape.",
        idealTerms: ["likelihood", "histogram"]
      }
    ]
  },
  {
    id: "ancient-civilizations",
    title: "Ancient civilizations",
    category: "History & Society",
    clusters: [
      {
        name: "Mesopotamia",
        color: "green",
        fact: "Mesopotamia, between the Tigris and Euphrates, gave rise to the first cities and the earliest writing.",
        terms: ["cuneiform", "ziggurat", "Tigris-Euphrates"],
        seeds: ["cuneiform", "ziggurat"]
      },
      {
        name: "Ancient Egypt",
        color: "blue",
        fact: "Ancient Egypt built a civilization along the Nile, unified under pharaohs and famous for monumental architecture.",
        terms: ["pharaoh", "Nile", "pyramid"],
        seeds: ["pharaoh", "Nile"]
      },
      {
        name: "Indus Valley",
        color: "amber",
        fact: "The Indus Valley civilization built precisely planned cities with advanced sanitation, long before most of the ancient world.",
        terms: ["Mohenjo-daro", "standardized weights", "drainage"],
        seeds: ["Mohenjo-daro", "standardized weights"]
      }
    ],
    bridges: [
      {
        term: "writing system",
        clusters: [0, 1],
        fact: "Writing systems bridge the two: cuneiform and hieroglyphics both emerged as river-valley civilizations needed to track trade and law.",
        idealTerms: ["cuneiform", null]
      },
      {
        term: "trade",
        clusters: [1, 2],
        fact: "Trade bridges the two: Egyptian and Indus Valley merchants exchanged goods across the Arabian Sea, linking two of the era's great river civilizations.",
        idealTerms: [null, "standardized weights"]
      }
    ]
  },
  {
    id: "economic-systems",
    title: "Economic systems",
    category: "History & Society",
    clusters: [
      {
        name: "Capitalism",
        color: "green",
        fact: "Capitalism relies on private property and competitive markets to decide what gets produced.",
        terms: ["private property", "competition", "profit"],
        seeds: ["private property", "competition"]
      },
      {
        name: "Socialism",
        color: "blue",
        fact: "Socialism emphasizes collective or state ownership of resources to reduce inequality.",
        terms: ["collective ownership", "central planning", "public services"],
        seeds: ["collective ownership", "central planning"]
      },
      {
        name: "Mixed economy",
        color: "amber",
        fact: "A mixed economy combines private markets with government regulation and public programs.",
        terms: ["regulation", "welfare state", "public-private"],
        seeds: ["regulation", "welfare state"]
      }
    ],
    bridges: [
      {
        term: "markets",
        clusters: [0, 2],
        fact: "Markets bridge the two: mixed economies keep capitalism's competitive markets but layer regulation on top.",
        idealTerms: ["competition", "regulation"]
      },
      {
        term: "taxation",
        clusters: [1, 2],
        fact: "Taxation bridges the two: it funds socialism's public services and a mixed economy's welfare state alike.",
        idealTerms: ["public services", "welfare state"]
      }
    ]
  },
  {
    id: "literary-devices",
    title: "Literary devices",
    category: "Language Arts",
    clusters: [
      {
        name: "Sound devices",
        color: "green",
        fact: "Sound devices use the way words sound, not just what they mean, to create rhythm and emphasis.",
        terms: ["alliteration", "rhyme", "onomatopoeia"],
        seeds: ["alliteration", "rhyme"]
      },
      {
        name: "Comparison devices",
        color: "blue",
        fact: "Comparison devices link two unlike things to reveal a shared quality.",
        terms: ["simile", "metaphor", "analogy"],
        seeds: ["simile", "metaphor"]
      },
      {
        name: "Narrative devices",
        color: "amber",
        fact: "Narrative devices shape how a story reveals information over time.",
        terms: ["foreshadowing", "irony", "symbolism"],
        seeds: ["foreshadowing", "irony"]
      }
    ],
    bridges: [
      {
        term: "personification",
        clusters: [1, 2],
        fact: "Personification bridges the two: it's a comparison device (giving human traits to a thing) that often carries symbolic, narrative weight.",
        idealTerms: ["metaphor", "symbolism"]
      },
      {
        term: "repetition",
        clusters: [0, 2],
        fact: "Repetition bridges the two: a sound device that writers reuse narratively to build foreshadowing or theme.",
        idealTerms: [null, "foreshadowing"]
      }
    ]
  },
  {
    id: "poetic-forms",
    title: "Poetic forms",
    category: "Language Arts",
    clusters: [
      {
        name: "Sonnet",
        color: "green",
        fact: "A sonnet is a 14-line poem, traditionally in iambic pentameter, often turning on a final couplet or volta.",
        terms: ["14 lines", "volta", "iambic pentameter"],
        seeds: ["14 lines", "volta"]
      },
      {
        name: "Haiku",
        color: "blue",
        fact: "A haiku is a three-line Japanese form built on a 5-7-5 syllable pattern, often capturing a single moment in nature.",
        terms: ["5-7-5 syllables", "kigo", "single image"],
        seeds: ["5-7-5 syllables", "kigo"]
      },
      {
        name: "Free verse",
        color: "amber",
        fact: "Free verse abandons fixed meter and rhyme, letting rhythm follow the natural cadence of the language.",
        terms: ["no fixed meter", "line breaks", "natural cadence"],
        seeds: ["no fixed meter", "line breaks"]
      }
    ],
    bridges: [
      {
        term: "meter",
        clusters: [0, 2],
        fact: "Meter bridges the two: the sonnet is built on strict meter, while free verse is defined by deliberately rejecting it.",
        idealTerms: ["iambic pentameter", "no fixed meter"]
      },
      {
        term: "imagery",
        clusters: [1, 2],
        fact: "Imagery bridges the two: haiku relies on a single vivid image, and free verse borrowed that same concentrated imagery when it broke from fixed forms.",
        idealTerms: ["single image", null]
      }
    ]
  },
  {
    id: "authoritarian-regimes",
    title: "20th-century authoritarian regimes",
    category: "History & Society",
    clusters: [
      {
        name: "Fascist Italy",
        color: "green",
        fact: "Mussolini's Fascist Italy fused ultranationalism with a single-party corporatist state and militarist expansion into Ethiopia, providing a template later regimes adapted.",
        terms: ["Blackshirts", "Il Duce", "March on Rome"],
        seeds: ["Blackshirts", "Il Duce"]
      },
      {
        name: "Nazi Germany",
        color: "blue",
        fact: "Nazi Germany combined totalitarian control with a racial ideology that justified genocide and aggressive territorial conquest.",
        terms: ["Gestapo", "Führer", "Nuremberg Laws"],
        seeds: ["Gestapo", "Führer"]
      },
      {
        name: "Stalinist USSR",
        color: "amber",
        fact: "Stalin's USSR used forced collectivization, mass terror, and state control over science itself to remake Soviet society by command.",
        terms: ["Gulag", "Five-Year Plan", "Lysenkoism"],
        seeds: ["Gulag", "Five-Year Plan"]
      }
    ],
    bridges: [
      {
        term: "propaganda",
        clusters: [0, 1],
        fact: "Propaganda bridges the two: both regimes built cults of personality and mass rallies to manufacture unanimous public support.",
        idealTerms: ["Il Duce", "Führer"]
      },
      {
        term: "secret police",
        clusters: [1, 2],
        fact: "Secret police bridge the two: the Gestapo and NKVD each gave the state power to surveil, arrest, and eliminate anyone deemed disloyal, without independent oversight.",
        idealTerms: ["Gestapo", null]
      }
    ]
  },
  {
    id: "psychology-schools",
    title: "Schools of psychology",
    category: "Philosophy & Social Science",
    clusters: [
      {
        name: "Behaviorism",
        color: "green",
        fact: "Behaviorism studies only observable behavior, explaining it through conditioning and reinforcement rather than inner mental states.",
        terms: ["conditioning", "reinforcement", "Pavlov"],
        seeds: ["conditioning", "reinforcement"]
      },
      {
        name: "Psychoanalysis",
        color: "blue",
        fact: "Psychoanalysis holds that unconscious drives and conflicts, often repressed, shape behavior without a person's awareness.",
        terms: ["id", "repression", "Freud"],
        seeds: ["id", "repression"]
      },
      {
        name: "Humanistic psychology",
        color: "amber",
        fact: "Humanistic psychology focuses on conscious growth toward self-actualization, treating people as active authors of their own development.",
        terms: ["self-actualization", "hierarchy of needs", "Maslow"],
        seeds: ["self-actualization", "hierarchy of needs"]
      }
    ],
    bridges: [
      {
        term: "determinism",
        clusters: [0, 1],
        fact: "Determinism bridges the two: behaviorism explains action as shaped by external conditioning, and psychoanalysis explains it as driven by unconscious forces — both deny that people simply choose freely.",
        idealTerms: ["conditioning", "id"]
      },
      {
        term: "the unconscious",
        clusters: [1, 2],
        fact: "The unconscious bridges the two: psychoanalysis built its entire model on hidden unconscious drives, while humanistic psychology arose specifically to reject that determinism in favor of conscious self-direction.",
        idealTerms: ["id", null]
      }
    ]
  },
  {
    id: "sociology-paradigms",
    title: "Sociological paradigms",
    category: "Philosophy & Social Science",
    clusters: [
      {
        name: "Structural functionalism",
        color: "green",
        fact: "Structural functionalism sees society as a system of interdependent parts that work together to maintain stability and cohesion.",
        terms: ["social cohesion", "manifest function", "latent function"],
        seeds: ["social cohesion", "manifest function"]
      },
      {
        name: "Conflict theory",
        color: "blue",
        fact: "Conflict theory sees society as an arena of competition, where groups struggle over scarce resources and power.",
        terms: ["class struggle", "power", "inequality"],
        seeds: ["class struggle", "power"]
      },
      {
        name: "Symbolic interactionism",
        color: "amber",
        fact: "Symbolic interactionism studies how individuals create meaning through everyday symbols and face-to-face interaction.",
        terms: ["meaning-making", "symbols", "micro-level interaction"],
        seeds: ["meaning-making", "symbols"]
      }
    ],
    bridges: [
      {
        term: "socialization",
        clusters: [0, 1],
        fact: "Socialization bridges the two: functionalists see it as teaching shared norms that hold society together, while conflict theorists see the same process as reproducing existing inequality across generations.",
        idealTerms: ["social cohesion", "inequality"]
      },
      {
        term: "deviance",
        clusters: [1, 2],
        fact: "Deviance bridges the two: conflict theorists see who gets labeled deviant as a reflection of who holds power, while interactionists focus on how that labeling itself, through everyday interaction, shapes a person's identity.",
        idealTerms: ["power", "meaning-making"]
      }
    ]
  },
  {
    id: "epistemology-schools",
    title: "Theories of knowledge",
    category: "Philosophy & Social Science",
    clusters: [
      {
        name: "Rationalism",
        color: "green",
        fact: "Rationalism holds that reason alone, independent of the senses, can access certain truths — for Descartes, even one's own existence.",
        terms: ["innate ideas", "cogito ergo sum", "Descartes"],
        seeds: ["innate ideas", "cogito ergo sum"]
      },
      {
        name: "Empiricism",
        color: "blue",
        fact: "Empiricism holds that all knowledge comes from sensory experience; the mind begins as a blank slate with nothing innate.",
        terms: ["tabula rasa", "sense-data", "Locke"],
        seeds: ["tabula rasa", "sense-data"]
      },
      {
        name: "Existentialism",
        color: "amber",
        fact: "Existentialism holds that humans have no fixed nature or purpose — we are radically free, and must create meaning through our own choices.",
        terms: ["radical freedom", "authenticity", "Sartre"],
        seeds: ["radical freedom", "authenticity"]
      }
    ],
    bridges: [
      {
        term: "a priori knowledge",
        clusters: [0, 1],
        fact: "A priori knowledge bridges the two: rationalists insist some truths can be known independent of experience, while empiricists insist every idea ultimately traces back to something first sensed.",
        idealTerms: ["innate ideas", "sense-data"]
      },
      {
        term: "human nature",
        clusters: [0, 2],
        fact: "Human nature bridges the two: rationalists like Descartes assumed a fixed rational essence common to all humans, while existentialists deny any such fixed nature — for Sartre, existence precedes essence, so we define ourselves through our choices instead of discovering a nature already given.",
        idealTerms: ["innate ideas", "radical freedom"]
      }
    ]
  },
  {
    id: "fundamental-forces",
    title: "Fundamental forces of physics",
    category: "Science",
    large: true,
    clusters: [
      {
        name: "Gravity",
        color: "green",
        fact: "Gravity is the weakest fundamental force, yet it dominates at cosmic scale because mass is never negative — its pull always adds up.",
        terms: ["mass", "spacetime curvature", "universal attraction", "escape velocity"],
        seeds: ["mass", "spacetime curvature"]
      },
      {
        name: "Electromagnetism",
        color: "blue",
        fact: "Electromagnetism governs every interaction between charged particles, from lightning to the chemical bonds holding molecules together.",
        terms: ["electric charge", "photon", "magnetic field", "Coulomb's law"],
        seeds: ["electric charge", "photon"]
      },
      {
        name: "Strong nuclear force",
        color: "amber",
        fact: "The strong force binds quarks into protons and neutrons, and holds the nucleus together against the electric repulsion of its own protons.",
        terms: ["quarks", "gluons", "nuclear binding energy", "confinement"],
        seeds: ["quarks", "gluons"]
      },
      {
        name: "Weak nuclear force",
        color: "rose",
        fact: "The weak force lets one type of particle transform into another, making it the force responsible for radioactive decay.",
        terms: ["beta decay", "neutrino", "radioactive decay", "flavor change"],
        seeds: ["beta decay", "neutrino"]
      }
    ],
    bridges: [
      {
        term: "field",
        clusters: [0, 1],
        fact: "Field bridges the two: gravity and electromagnetism are both classically described as continuous fields reaching across all of space, unlike the short-range strong and weak forces confined to the nucleus.",
        idealTerms: ["spacetime curvature", "magnetic field"]
      },
      {
        term: "the atomic nucleus",
        clusters: [2, 3],
        fact: "The atomic nucleus bridges the two: both forces act only within it — the strong force binds it together, and the weak force can transform particles inside it, triggering radioactive decay.",
        idealTerms: ["nuclear binding energy", "radioactive decay"]
      },
      {
        term: "electroweak unification",
        clusters: [1, 3],
        fact: "Electroweak unification bridges the two: at extremely high energies, the electromagnetic and weak forces merge into a single force, as shown by the Standard Model of particle physics.",
        idealTerms: ["photon", "flavor change"]
      }
    ]
  },
  {
    id: "philosophy-branches",
    title: "Branches of philosophy",
    category: "Philosophy & Social Science",
    large: true,
    clusters: [
      {
        name: "Epistemology",
        color: "green",
        fact: "Epistemology studies what knowledge is and what justifies believing something is true.",
        terms: ["justified belief", "skepticism", "knowledge", "evidence"],
        seeds: ["justified belief", "skepticism"]
      },
      {
        name: "Ethics",
        color: "blue",
        fact: "Ethics asks what makes an action right or wrong, and what we owe to one another.",
        terms: ["virtue", "duty", "consequences", "moral agent"],
        seeds: ["virtue", "duty"]
      },
      {
        name: "Metaphysics",
        color: "amber",
        fact: "Metaphysics studies the fundamental nature of reality — what exists, and what it means for one thing to cause another.",
        terms: ["being", "causation", "identity", "substance"],
        seeds: ["being", "causation"]
      },
      {
        name: "Logic",
        color: "rose",
        fact: "Logic studies what makes an argument valid — whether its conclusion truly follows from its premises.",
        terms: ["validity", "syllogism", "inference", "soundness"],
        seeds: ["validity", "syllogism"]
      }
    ],
    bridges: [
      {
        term: "free will",
        clusters: [1, 2],
        fact: "Free will bridges the two: ethics presupposes that moral agents could have done otherwise, which is itself a metaphysical claim about whether the universe allows genuine choice.",
        idealTerms: ["moral agent", "causation"]
      },
      {
        term: "truth",
        clusters: [0, 3],
        fact: "Truth bridges the two: epistemology asks what justifies believing a claim is true, while logic studies what makes an argument's conclusion follow validly, regardless of whether its premises happen to be true.",
        idealTerms: ["knowledge", "soundness"]
      },
      {
        term: "necessity",
        clusters: [2, 3],
        fact: "Necessity bridges the two: logic studies which conclusions must follow given their premises, while metaphysics asks which truths about reality itself could not have been otherwise.",
        idealTerms: [null, "validity"]
      }
    ]
  },
  {
    id: "revolutions-modern-world",
    title: "Revolutions of the modern world",
    category: "History & Society",
    large: true,
    clusters: [
      {
        name: "American Revolution",
        color: "green",
        fact: "The American Revolution overthrew British colonial rule in the name of natural rights and self-governance, founding a republic.",
        terms: ["independence", "natural rights", "republic", "taxation"],
        seeds: ["independence", "natural rights"]
      },
      {
        name: "French Revolution",
        color: "blue",
        fact: "The French Revolution overthrew the monarchy in the name of liberty and equality, but its radical phase descended into mass executions.",
        terms: ["Estates-General", "guillotine", "Reign of Terror", "Declaration of the Rights of Man"],
        seeds: ["Estates-General", "guillotine"]
      },
      {
        name: "Haitian Revolution",
        color: "amber",
        fact: "The Haitian Revolution was the only successful slave revolt to found a nation, ending slavery in Saint-Domingue and establishing Haiti.",
        terms: ["enslaved rebellion", "Toussaint Louverture", "Haitian independence", "Saint-Domingue"],
        seeds: ["enslaved rebellion", "Toussaint Louverture"]
      },
      {
        name: "Russian Revolution",
        color: "rose",
        fact: "The Russian Revolution toppled the Tsar and, months later, brought the Bolsheviks to power, founding the world's first communist state.",
        terms: ["Bolsheviks", "Tsar", "Lenin", "October Revolution"],
        seeds: ["Bolsheviks", "Tsar"]
      }
    ],
    bridges: [
      {
        term: "Enlightenment ideals",
        clusters: [0, 1],
        fact: "Enlightenment ideals bridge the two: both revolutions drew on the same philosophy of natural rights and popular sovereignty, even as they produced very different outcomes.",
        idealTerms: ["natural rights", "Declaration of the Rights of Man"]
      },
      {
        term: "abolition of slavery",
        clusters: [1, 2],
        fact: "Abolition of slavery bridges the two: enslaved Haitians invoked the French Revolution's own Declaration of the Rights of Man to demand freedom, and the French Convention briefly abolished slavery in response in 1794.",
        idealTerms: ["Declaration of the Rights of Man", "enslaved rebellion"]
      },
      {
        term: "provisional government",
        clusters: [1, 3],
        fact: "Provisional government bridges the two: both revolutions passed through an initial moderate government before radicals — Jacobins in France, Bolsheviks in Russia — overthrew it and seized full control.",
        idealTerms: [null, "Bolsheviks"]
      }
    ]
  }
];
