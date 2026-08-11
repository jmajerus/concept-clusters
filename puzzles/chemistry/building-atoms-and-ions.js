// Concept Clusters puzzle: Building atoms and ions

export default {
  id: "building-atoms-and-ions",
  title: "Building atoms and ions",
  category: "Chemistry",
  large: true,
  tags: ["chemistry", "atoms", "elements", "ions", "periodic table"],
  info: {
    text: "Atomic structure separates three questions that are often blurred together: what fixes an element's identity, what contributes most of its mass, and what gives an atom a net charge.",
    link: "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism",
    citations: [
      {
        title: "Atomic Structure and Symbolism",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Continue from atomic structure to bonding and then to transformations of substances." },
    entries: [
      { id: "why-atoms-bond", reason: "Use valence electrons to explain how atoms form compounds." },
      { id: "reading-chemical-reactions", reason: "Track atoms and quantities through chemical change." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "fixing-element-identity",
      prompt: "Which concepts determine or communicate which element an atom belongs to?",
      targets: ["proton", "atomic number", "element symbol", "element"],
      explanation: "The number of protons is the atomic number, which fixes the element's identity; an element symbol communicates that identity. Changing neutrons or electrons does not create a different element."
    },
    {
      id: "accounting-for-mass",
      prompt: "Which concepts help account for the mass and nuclear variants of an atom?",
      targets: ["proton", "neutron", "mass number", "isotope", "atom"],
      explanation: "Protons and neutrons supply nearly all atomic mass. Their total is the mass number, while isotopes of one element differ in neutron count."
    },
    {
      id: "charge-and-chemical-behavior",
      prompt: "Which concepts connect electron arrangement with charge or recurring chemical behavior?",
      targets: ["valence electron", "periodic group", "ion", "net charge", "electron count"],
      explanation: "Valence electrons strongly influence chemical behavior, which recurs within periodic groups. A mismatch between proton and electron counts gives an ion its net charge."
    },
    {
      id: "same-element-different-particles",
      prompt: "Which concepts explain how atoms can remain the same element while differing in neutrons or electrons?",
      targets: ["atomic number", "element", "neutron", "isotope", "ion", "electron count"],
      explanation: "Atomic number fixes elemental identity. Changing neutron count creates an isotope, while changing electron count creates an ion; neither change by itself creates a different element."
    }
  ],
  clusters: [
    {
      name: "Inside the nucleus",
      color: "teal",
      fact: "A tiny nucleus contains positively charged protons and uncharged neutrons; together they contribute nearly all atomic mass, while proton count sets the nucleus's positive charge.",
      info: { link: "wiki:Atomic nucleus" },
      terms: ["proton", "neutron", "mass number", "nuclear charge"],
      seeds: ["proton", "neutron"]
    },
    {
      name: "Arranging electrons",
      color: "blue",
      fact: "Electron configuration describes how negatively charged electrons occupy shells around the nucleus, with the outermost valence electrons most directly involved in bonding.",
      info: { link: "wiki:Electron configuration" },
      terms: ["electron", "electron shell", "valence electron", "electron configuration"],
      seeds: ["electron", "valence electron"]
    },
    {
      name: "Identifying an element",
      color: "amber",
      fact: "Atomic number counts protons and uniquely identifies an element; symbols and periodic groups organize those identities and recurring properties.",
      info: { link: "wiki:Chemical element" },
      terms: ["atomic number", "element symbol", "periodic group"],
      seeds: ["atomic number", "element symbol"]
    },
    {
      name: "Isotopes and atomic mass",
      color: "magenta",
      fact: "Isotopes of one element vary in neutron number; their natural abundances determine the weighted average atomic mass reported on a periodic table.",
      info: { link: "wiki:Isotope" },
      terms: ["isotope", "isotopic abundance", "average atomic mass"],
      seeds: ["isotope", "average atomic mass"]
    },
    {
      name: "Ions and charge",
      color: "olive",
      fact: "Ions vary in electron count: losing electrons makes a positive cation, while gaining electrons makes a negative anion.",
      info: { link: "wiki:Ion" },
      terms: ["ion", "cation", "anion", "net charge"],
      seeds: ["cation", "anion"]
    }
  ],
  bridges: [
    {
      term: "atom",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "An atom joins a compact nucleus to a much larger electron cloud; these parts jointly determine its mass, charge, and interactions.",
      idealTerms: ["proton", "electron"],
      info: { link: "wiki:Atom" }
    },
    {
      term: "element",
      clusters: [0, 2],
      relationKind: "foundation",
      fact: "An element is defined by its proton count, the same quantity recorded as atomic number in the periodic table.",
      idealTerms: ["proton", "atomic number"],
      info: { link: "wiki:Chemical element" }
    },
    {
      term: "electron count",
      clusters: [1, 4],
      relationKind: "dynamic",
      fact: "Gaining or losing electrons changes electron count and therefore net charge, producing an ion without changing the element.",
      idealTerms: ["electron", "ion"],
      info: { text: "The number of electrons associated with an atom or ion; compared with proton count, it determines net charge." }
    },
    {
      term: "isotopic composition",
      clusters: [0, 3],
      relationKind: "foundation",
      fact: "Isotopic composition connects neutron-level differences to a sample's average atomic mass by recording the relative abundance of each isotope.",
      idealTerms: ["neutron", "isotopic abundance"],
      info: { link: "wiki:Isotopic signature" }
    }
  ]
};
