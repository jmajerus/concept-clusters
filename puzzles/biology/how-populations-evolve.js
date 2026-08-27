// Concept Clusters puzzle: How populations evolve

export default {
  id: "how-populations-evolve",
  title: "How populations evolve",
  category: "Biology",
  large: true,
  subcategories: { Biology: "foundations" },
  tags: ["biology", "evolution", "natural selection", "population genetics", "speciation"],
  info: {
    text: "Evolution is change in populations across generations. Mutation supplies new variants, selection filters heritable differences through reproductive success, and chance or migration can also change allele frequencies.",
    citations: [
      {
        title: "Population Evolution",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/19-1-population-evolution"
      },
      {
        title: "Population Genetics",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/19-2-population-genetics"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Begin with the cellular origin and inheritance of variation, or continue into evolutionary consequences for cooperation." },
    entries: [
      { id: "cell-division-and-inheritance", reason: "Review how meiosis and fertilization transmit and reshuffle alleles." },
      { id: "reading-genetic-variation", reason: "See how genomic differences are detected and interpreted." },
      { id: "evolution-of-cooperation", reason: "Apply evolutionary reasoning to repeated social interaction." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "chance-driven-change",
      prompt: "Which concepts can introduce or amplify evolutionary change without favoring what an organism needs?",
      targets: ["mutation", "genetic drift", "bottleneck effect", "founder effect"],
      explanation: "Mutation does not arise because an organism needs it. Genetic drift, including bottlenecks and founder effects, changes allele frequencies through sampling chance rather than adaptive advantage."
    },
    {
      id: "population-not-individual",
      prompt: "Which concepts make clear that evolution describes populations across generations rather than an individual changing on demand?",
      targets: ["heritable variation", "adaptation", "reproductive isolation", "speciation", "population", "allele frequency"],
      explanation: "Heritable differences can become population-level adaptations as allele frequencies change. Sustained divergence and reproductive isolation can eventually produce speciation; no individual must transform into a new species."
    },
    {
      id: "different-routes-to-frequency-change",
      prompt: "Which mechanisms create, filter, move, or randomly sample alleles in populations?",
      targets: ["mutation", "differential reproductive success", "genetic drift", "gene flow", "natural selection", "allele frequency"],
      explanation: "Mutation creates new alleles, natural selection filters heritable variants through reproductive success, gene flow moves alleles between populations, and drift samples them by chance. All can alter allele frequency."
    },
    {
      id: "from-gene-exchange-to-branching-history",
      prompt: "Which concepts connect gene exchange or its restriction with the branching history of populations?",
      targets: ["gene flow", "reproductive isolation", "speciation", "lineage", "common ancestor", "phylogeny"],
      explanation: "Gene flow can keep populations connected; reproductive isolation reduces that exchange and can permit speciation. The resulting lineages share ancestors, and phylogeny represents hypotheses about their branching history."
    }
  ],
  clusters: [
    {
      name: "Heritable variation",
      color: "teal",
      fact: "Mutation can change genotype and sometimes phenotype; selection can produce evolutionary change only when relevant differences are heritable.",
      info: { link: "wiki:Genetic variation" },
      terms: ["mutation", "genotype", "phenotype", "heritable variation"],
      seeds: ["mutation", "heritable variation"]
    },
    {
      name: "Selection",
      color: "blue",
      fact: "Selection pressures produce differences in fitness; variants associated with greater reproductive success can become more common and contribute to adaptation.",
      info: { link: "wiki:Natural selection" },
      terms: ["selection pressure", "differential reproductive success", "fitness", "adaptation"],
      seeds: ["selection pressure", "adaptation"]
    },
    {
      name: "Genetic drift",
      color: "amber",
      fact: "Genetic drift changes allele frequencies through chance sampling and is stronger at small effective population size, especially after bottlenecks.",
      info: { link: "wiki:Population genetics" },
      terms: ["genetic drift", "bottleneck effect", "effective population size"],
      seeds: ["genetic drift", "bottleneck effect"]
    },
    {
      name: "Gene flow",
      color: "magenta",
      fact: "Migration can move alleles between populations; the resulting gene flow and admixture may counter divergence or introduce variants into a new population.",
      info: { link: "wiki:Gene flow" },
      terms: ["gene flow", "migration", "admixture"],
      seeds: ["gene flow", "migration"]
    },
    {
      name: "Divergence",
      color: "olive",
      fact: "As lineages diverge, reproductive isolation can contribute to speciation; phylogenies represent branching descent from common ancestors.",
      info: { link: "wiki:Speciation" },
      terms: ["reproductive isolation", "speciation", "lineage", "common ancestor", "phylogeny"],
      seeds: ["reproductive isolation", "speciation"]
    }
  ],
  bridges: [
    {
      term: "population",
      clusters: [0, 2],
      relationKind: "foundation",
      fact: "Evolutionary mechanisms act on variation within populations, and population size strongly shapes the importance of genetic drift.",
      idealTerms: ["heritable variation", "genetic drift"],
      info: { link: "wiki:Population" }
    },
    {
      term: "natural selection",
      clusters: [0, 1],
      relationKind: "dynamic",
      fact: "Natural selection requires heritable variation and changes populations when variants differ in survival or reproductive success under prevailing conditions.",
      idealTerms: ["heritable variation", "differential reproductive success"],
      info: { link: "wiki:Natural selection" }
    },
    {
      term: "allele frequency",
      clusters: [1, 2, 3],
      relationKind: "dynamic",
      fact: "Selection, genetic drift, and gene flow can each change allele frequency through a different mechanism: filtering, chance sampling, or movement between populations.",
      idealTerms: ["adaptation", "genetic drift", "gene flow"],
      info: { link: "wiki:Allele frequency" }
    },
    {
      term: "founder effect",
      clusters: [2, 4],
      relationKind: "dynamic",
      fact: "When a small group establishes a new population, chance allele sampling can accelerate divergence from the source population.",
      idealTerms: ["bottleneck effect", "reproductive isolation"],
      info: { link: "wiki:Founder effect" }
    }
  ]
};
