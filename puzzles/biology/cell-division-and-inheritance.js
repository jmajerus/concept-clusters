// Concept Clusters puzzle: Cell division and inheritance

export default {
  id: "cell-division-and-inheritance",
  title: "Cell division and inheritance",
  category: "Biology",
  large: true,
  subcategories: { Biology: "foundations" },
  tags: ["biology", "cell cycle", "mitosis", "meiosis", "inheritance"],
  info: {
    text: "DNA replication, chromosome separation, and cell division are related but distinct events. Mitosis usually preserves chromosome sets; meiosis halves them and reshuffles inherited variation before fertilization restores the diploid state.",
    citations: [
      {
        title: "The Cell Cycle",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
      },
      {
        title: "The Process of Meiosis",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Connect cell structure to inheritance, then follow inherited variation into population change." },
    entries: [
      { id: "inside-the-cell", reason: "Review the compartments and structures that sustain a cell." },
      { id: "how-populations-evolve", reason: "See how inherited variants change in frequency across generations." },
      { id: "from-dna-to-gene-expression", reason: "Distinguish transmission of DNA from expression of its information." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "copying-and-separating",
      prompt: "Which concepts participate directly in copying DNA or separating copied chromosomes into new nuclei?",
      targets: ["S phase", "mitotic spindle", "metaphase", "anaphase", "chromosome"],
      explanation: "DNA is copied during S phase. The mitotic spindle aligns condensed chromosomes at metaphase and separates sister chromatids during anaphase."
    },
    {
      id: "halving-chromosome-sets",
      prompt: "Which concepts are central to producing cells with one chromosome set for sexual reproduction?",
      targets: ["homologous chromosome", "meiosis I", "haploid cell", "gamete"],
      explanation: "Meiosis I separates homologous chromosomes, reducing a diploid cell to haploid descendants. Further division and differentiation can produce haploid gametes."
    },
    {
      id: "sources-and-carriers-of-variation",
      prompt: "Which concepts connect meiotic reshuffling with inherited differences among offspring?",
      targets: ["crossing over", "allele", "genotype", "fertilization", "genetic variation"],
      explanation: "Crossing over reshuffles alleles into new chromosome combinations. Fertilization combines gametes, producing an offspring genotype and contributing to heritable variation."
    }
  ],
  clusters: [
    {
      name: "Preparing to divide",
      color: "teal",
      fact: "During interphase a cell grows through G1, copies its DNA in S phase, and passes regulated checkpoints before division.",
      info: { link: "wiki:Cell cycle" },
      terms: ["interphase", "G1 phase", "S phase", "cell-cycle checkpoint"],
      seeds: ["interphase", "S phase"]
    },
    {
      name: "Mitosis",
      color: "blue",
      fact: "Chromosomes condense in prophase, the spindle aligns and separates them through metaphase and anaphase, and cytokinesis partitions the cell.",
      info: { link: "wiki:Mitosis" },
      terms: ["mitotic spindle", "prophase", "metaphase", "anaphase", "cytokinesis"],
      seeds: ["metaphase", "anaphase"]
    },
    {
      name: "Meiosis",
      color: "amber",
      fact: "Meiosis pairs homologous chromosomes and permits crossing over; meiosis I separates homologs, while meiosis II separates sister chromatids.",
      info: { link: "wiki:Meiosis" },
      terms: ["homologous chromosome", "crossing over", "meiosis I", "meiosis II"],
      seeds: ["crossing over", "meiosis I"]
    },
    {
      name: "Inheritance",
      color: "magenta",
      fact: "Alleles inherited through gametes combine into homozygous or heterozygous genotypes; development and environment help produce observable phenotypes.",
      info: { link: "wiki:Mendelian inheritance" },
      terms: ["allele", "genotype", "phenotype", "homozygous", "heterozygous"],
      seeds: ["allele", "genotype"]
    }
  ],
  bridges: [
    {
      term: "chromosome",
      clusters: [0, 1],
      relationKind: "dynamic",
      fact: "A chromosome is copied before division and then condensed, aligned, and separated by the mitotic machinery.",
      idealTerms: ["S phase", "mitotic spindle"],
      info: { link: "https://www.genome.gov/genetics-glossary/Chromosome" }
    },
    {
      term: "gamete",
      clusters: [2, 3],
      relationKind: "dynamic",
      fact: "Meiosis contributes to forming haploid gametes, which carry one allele at each locus into the next generation.",
      idealTerms: ["meiosis I", "allele"],
      info: { link: "wiki:Gamete" }
    },
    {
      term: "genetic variation",
      clusters: [2, 3],
      relationKind: "foundation",
      fact: "Crossing over and the assortment of homologous chromosomes create new allele combinations that inheritance can transmit.",
      idealTerms: ["crossing over", "genotype"],
      info: { link: "wiki:Genetic variation" }
    },
    {
      term: "fertilization",
      clusters: [2, 3],
      relationKind: "dynamic",
      fact: "Fertilization joins haploid gametes, restores the diploid chromosome number, and combines parental alleles in one genotype.",
      idealTerms: ["meiosis I", "genotype"],
      info: { link: "wiki:Fertilisation" }
    },
    {
      term: "haploid cell",
      clusters: [2, 3],
      relationKind: "foundation",
      fact: "A haploid cell contains one chromosome set; in many life cycles, haploid gametes carry inherited alleles between generations.",
      idealTerms: ["meiosis I", "allele"],
      info: { link: "wiki:Ploidy" }
    }
  ]
};
