// Concept Clusters puzzle: Why atoms bond

export default {
  id: "why-atoms-bond",
  title: "Why atoms bond",
  category: "Chemistry",
  large: true,
  tags: ["chemistry", "bonding", "molecules", "polarity"],
  info: {
    text: "Bonding begins with valence electrons, but the resulting structures operate at several scales: bonds join atoms, geometry shapes molecules, and attractions between particles influence bulk properties.",
    link: "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity",
    citations: [
      {
        title: "Molecular Structure and Polarity",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity"
      },
      {
        title: "Chemical Formulas",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/2-4-chemical-formulas"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Place bonding between atomic structure and full chemical equations." },
    entries: [
      { id: "building-atoms-and-ions", reason: "Review the electrons and ions from which bonding starts." },
      { id: "reading-chemical-reactions", reason: "See how bonded substances are represented as reactants and products." },
      { id: "energy-rate-and-equilibrium", reason: "Connect bond rearrangement with energy change and reaction behavior." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "within-a-substance",
      prompt: "Which concepts describe how atoms are joined or arranged within a substance rather than attractions between separate molecules?",
      targets: ["crystal lattice", "shared electron pair", "multiple bond", "molecular geometry", "polar covalent bond"],
      explanation: "Ionic lattices, covalent electron pairs, bond multiplicity, and molecular geometry describe internal structure. A polar covalent bond is still a bond within a molecule, even though it separates charge unevenly."
    },
    {
      id: "uneven-charge",
      prompt: "Which concepts express full or partial separation of electrical charge?",
      targets: ["cation", "anion", "electronegativity", "polar covalent bond", "molecular polarity"],
      explanation: "Cations and anions carry whole-number charges. Electronegativity differences can produce partial charges in a polar bond, and molecular geometry determines whether those bond dipoles combine into molecular polarity."
    },
    {
      id: "from-structure-to-properties",
      prompt: "Which concepts connect microscopic arrangement or attraction to observable material properties?",
      targets: ["molecular geometry", "hydrogen bond", "dipole-dipole attraction", "London dispersion", "boiling point", "solubility"],
      explanation: "Molecular shape affects how particles orient toward one another. Hydrogen bonding, dipole-dipole attraction, and dispersion forces are the three intermolecular attractions that, together, influence how much energy is needed to separate particles -- observable as boiling point and solubility."
    }
  ],
  clusters: [
    {
      name: "Ionic compounds",
      color: "teal",
      fact: "Oppositely charged ions attract throughout an extended crystal lattice; a formula unit gives the simplest whole-number ratio of ions rather than naming an isolated molecule.",
      info: { link: "wiki:Ionic bonding" },
      terms: ["cation", "anion", "crystal lattice", "formula unit"],
      seeds: ["cation", "anion"]
    },
    {
      name: "Covalent molecules",
      color: "blue",
      fact: "Covalent bonds concentrate shared electron pairs between atoms. Single and multiple bonds connect atoms within molecules, relationships a structural formula can display.",
      info: { link: "wiki:Covalent bond" },
      terms: ["shared electron pair", "molecule", "single bond", "multiple bond", "structural formula"],
      seeds: ["shared electron pair", "molecule"]
    },
    {
      name: "Shape and bond polarity",
      color: "amber",
      fact: "Electronegativity affects how unevenly a bond shares electrons, while lone pairs and bonding regions determine molecular geometry and characteristic bond angles.",
      info: { link: "wiki:Molecular geometry" },
      terms: ["electronegativity", "molecular geometry", "lone pair", "bond angle"],
      seeds: ["electronegativity", "molecular geometry"]
    },
    {
      name: "Between molecules",
      color: "magenta",
      fact: "Hydrogen bonding, dipole-dipole attraction, and London dispersion act between particles and strongly influence solubility, condensation, and boiling point.",
      info: { link: "wiki:Intermolecular force" },
      terms: ["hydrogen bond", "dipole-dipole attraction", "London dispersion", "boiling point", "solubility"],
      seeds: ["hydrogen bond", "boiling point"]
    }
  ],
  bridges: [
    {
      term: "valence electron",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "Ionic and covalent bonding are both consequences of interactions involving atoms' outermost, or valence, electrons.",
      idealTerms: ["cation", "shared electron pair"],
      info: { link: "wiki:Valence electron" }
    },
    {
      term: "polar covalent bond",
      clusters: [1, 2],
      relationKind: "cross-cutting",
      fact: "A polar covalent bond remains a shared-electron bond, but electronegativity makes that sharing unequal and creates a bond dipole.",
      idealTerms: ["shared electron pair", "electronegativity"],
      info: { link: "wiki:Chemical polarity" }
    },
    {
      term: "molecular polarity",
      clusters: [2, 3],
      relationKind: "foundation",
      fact: "Molecular polarity depends on both bond dipoles and their three-dimensional arrangement, then influences the attractions between molecules.",
      idealTerms: ["molecular geometry", "hydrogen bond"],
      info: { link: "wiki:Chemical polarity" }
    }
  ]
};
