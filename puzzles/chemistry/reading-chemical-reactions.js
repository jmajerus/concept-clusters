// Concept Clusters puzzle: Reading and balancing chemical equations

export default {
  id: "reading-chemical-reactions",
  title: "Reading and balancing chemical equations",
  category: "Chemistry",
  tags: ["chemistry", "chemical equations", "stoichiometry", "conservation of mass"],
  info: {
    text: "A balanced chemical equation preserves substance identities while recording the relative quantities in which reactants are consumed and products form.",
    citations: [
      {
        title: "Writing and Balancing Chemical Equations",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        url: "https://openstax.org/books/chemistry/pages/4-1-writing-and-balancing-chemical-equations"
      },
      {
        title: "Reaction Yields",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Place equation reading between the structure of substances and the conditions governing reaction behavior." },
    entries: [
      { id: "building-atoms-and-ions", reason: "Review how atomic identity and charge are represented." },
      { id: "why-atoms-bond", reason: "Review the substances and bonds rearranged during reactions." },
      { id: "energy-rate-and-equilibrium", reason: "Continue from what an equation states to energy change, speed, and equilibrium." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "reading-the-written-equation",
      prompt: "Which concepts can be read from a properly written and balanced chemical equation before performing the reaction?",
      targets: ["reactant", "product", "coefficient", "state symbol", "balanced equation", "mole ratio"],
      explanation: "The equation identifies reactants and products, records physical states, and uses coefficients to show relative particle or mole amounts. Balance confirms that atom counts agree across the arrow."
    },
    {
      id: "balancing-without-changing-identity",
      prompt: "Which concepts balance quantities without changing the chemical identity written in each formula?",
      targets: ["coefficient", "balanced equation", "atom count", "mole ratio", "stoichiometry"],
      explanation: "Balancing changes coefficients, not the subscripts within formulas. The resulting atom counts match across the arrow, and the coefficients supply mole ratios used in stoichiometry."
    },
    {
      id: "from-ratio-to-yield",
      prompt: "Which concepts connect equation coefficients to the maximum quantity of product a given mixture can form?",
      targets: ["coefficient", "mole ratio", "limiting reactant", "theoretical yield", "percent yield", "stoichiometry"],
      explanation: "Stoichiometry uses coefficient-derived mole ratios to compare available reactants. The reactant exhausted first is limiting and sets the theoretical yield; percent yield compares that maximum with the amount actually obtained."
    }
  ],
  clusters: [
    {
      name: "Writing the change",
      color: "teal",
      fact: "A chemical equation places reactants before an arrow and products after it, using coefficients for relative amounts and state symbols for physical form.",
      info: { link: "wiki:Chemical equation" },
      terms: ["reactant", "product", "coefficient", "state symbol"],
      seeds: ["reactant", "product"]
    },
    {
      name: "Conserving atoms",
      color: "blue",
      fact: "A balanced equation expresses conservation of mass by preserving the count of every kind of atom across the reaction arrow.",
      info: { link: "wiki:Conservation of mass" },
      terms: ["balanced equation", "atom count", "conservation of mass"],
      seeds: ["balanced equation", "conservation of mass"]
    },
    {
      name: "Stoichiometric quantities",
      color: "amber",
      fact: "Mole ratios identify limiting and excess reactants and predict theoretical yield; comparing actual with theoretical yield gives percent yield.",
      info: { link: "wiki:Stoichiometry" },
      terms: ["mole ratio", "limiting reactant", "excess reactant", "theoretical yield", "actual yield", "percent yield"],
      seeds: ["mole ratio", "limiting reactant"]
    }
  ],
  bridges: [
    {
      term: "chemical formula",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "A chemical formula fixes which elements and how many atoms make up each substance; balancing preserves those formulas and changes only coefficients.",
      idealTerms: ["coefficient", "atom count"],
      info: { link: "wiki:Chemical formula" }
    },
    {
      term: "stoichiometry",
      clusters: [0, 2],
      relationKind: "foundation",
      fact: "Stoichiometry turns the identities and coefficients in a balanced equation into quantitative relationships between reactants and products.",
      idealTerms: ["coefficient", "mole ratio"],
      info: { link: "wiki:Stoichiometry" }
    }
  ]
};
