// Concept Clusters puzzle: Energy, rate, and equilibrium

export default {
  id: "energy-rate-and-equilibrium",
  title: "Energy, rate, and equilibrium",
  category: "Chemistry",
  tags: ["chemistry", "thermochemistry", "kinetics", "equilibrium"],
  info: {
    text: "Energy change, reaction speed, and equilibrium answer different questions: whether heat is absorbed or released, how quickly change occurs, and what composition a reversible system approaches.",
    citations: [
      {
        title: "Energy Basics",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/5-1-energy-basics"
      },
      {
        title: "Factors Affecting Reaction Rates",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/12-2-factors-affecting-reaction-rates"
      },
      {
        title: "Chemical Equilibria",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria"
      },
      {
        title: "Equilibrium Constants",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants"
      },
      {
        title: "Shifting Equilibria: Le Châtelier's Principle",
        author: "Paul Flowers et al.",
        publisher: "OpenStax",
        year: "2019",
        url: "https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Start with the equation itself, or return to the bonds whose rearrangement underlies its energy change." },
    entries: [
      { id: "reading-chemical-reactions", reason: "Review what a balanced equation does and does not state." },
      { id: "why-atoms-bond", reason: "Connect reaction energy with the breaking and forming of bonds." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "changing-reaction-speed",
      prompt: "Which concepts can describe or influence how quickly a reaction proceeds?",
      targets: ["activation energy", "concentration", "catalyst", "temperature", "reaction rate"],
      explanation: "Reaction rate responds to collision frequency and to the fraction of collisions able to cross the activation barrier. Concentration, temperature, and catalysts can therefore change speed."
    },
    {
      id: "direction-and-energy",
      prompt: "Which concepts distinguish energy change from the direction in which a reaction proceeds?",
      targets: ["exothermic", "endothermic", "dynamic equilibrium", "reversible reaction", "temperature"],
      explanation: "Exothermic and endothermic classify heat transfer. Reversibility and dynamic equilibrium concern opposing reaction directions; temperature can affect molecular energy and the equilibrium position."
    },
    {
      id: "catalyst-does-not-move-equilibrium",
      prompt: "Which concepts explain why a catalyst reaches equilibrium faster without changing the equilibrium composition?",
      targets: ["activation energy", "catalyst", "reaction rate", "dynamic equilibrium", "equilibrium constant"],
      explanation: "A catalyst lowers the activation barrier and speeds both forward and reverse reactions. It shortens the time required to reach dynamic equilibrium but does not change the equilibrium constant or final equilibrium composition."
    },
    {
      id: "responding-to-an-equilibrium-disturbance",
      prompt: "Which concepts help predict how an equilibrium mixture responds after conditions change?",
      targets: ["concentration", "temperature", "reaction quotient", "equilibrium position", "Le Châtelier's principle"],
      explanation: "A concentration or temperature change can disturb an equilibrium. The reaction quotient diagnoses the mixture's current state, and Le Châtelier's principle predicts the direction in which the equilibrium position responds."
    }
  ],
  clusters: [
    {
      name: "Reaction energy",
      color: "teal",
      fact: "Reactions cross an activation barrier; the net enthalpy change may release heat to the surroundings or absorb heat from them.",
      info: { link: "wiki:Thermochemistry" },
      terms: ["activation energy", "exothermic", "endothermic", "enthalpy change"],
      seeds: ["exothermic", "endothermic"]
    },
    {
      name: "Reaction kinetics",
      color: "blue",
      fact: "Concentration and exposed surface area affect collision frequency, while catalysts provide a different pathway; all can change reaction speed.",
      info: { link: "wiki:Chemical kinetics" },
      terms: ["concentration", "surface area", "collision frequency", "catalyst"],
      seeds: ["concentration", "catalyst"]
    },
    {
      name: "Chemical equilibrium",
      color: "amber",
      fact: "At dynamic equilibrium opposing rates are equal. The reaction quotient locates the current composition relative to equilibrium, and Le Châtelier's principle predicts responses to disturbances.",
      info: { link: "wiki:Chemical equilibrium" },
      terms: ["dynamic equilibrium", "equilibrium constant", "reaction quotient", "equilibrium position", "Le Châtelier's principle"],
      seeds: ["dynamic equilibrium", "equilibrium constant"]
    }
  ],
  bridges: [
    {
      term: "temperature",
      clusters: [0, 1, 2],
      relationKind: "dynamic",
      fact: "Temperature changes molecular energy and collision success, often changing reaction rate; it can also shift the equilibrium composition.",
      idealTerms: ["activation energy", "concentration", "equilibrium position"],
      info: { link: "wiki:Temperature" }
    },
    {
      term: "reaction rate",
      clusters: [0, 1],
      relationKind: "dynamic",
      fact: "Reaction rate measures how quickly reactants are consumed or products formed, reflecting both the activation barrier and conditions affecting successful collisions.",
      idealTerms: ["activation energy", "concentration"],
      info: { link: "wiki:Reaction rate" }
    },
    {
      term: "reversible reaction",
      clusters: [0, 2],
      relationKind: "dynamic",
      fact: "A reversible reaction proceeds in both directions; dynamic equilibrium occurs when its forward and reverse rates match.",
      idealTerms: ["enthalpy change", "dynamic equilibrium"],
      info: { link: "wiki:Reversible reaction" }
    }
  ]
};
