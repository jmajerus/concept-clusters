// Generated from content/puzzles/cell-division-and-inheritance.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "cell-division-and-inheritance",
  "title": "Cell division and inheritance",
  "category": "biology",
  "subcategories": {
    "biology": "foundations"
  },
  "large": true,
  "tags": [
    "biology",
    "cell cycle",
    "mitosis",
    "meiosis",
    "inheritance"
  ],
  "info": {
    "text": "DNA replication, chromosome separation, and cell division are related but distinct events. Mitosis usually preserves chromosome sets; meiosis halves them and reshuffles inherited variation before fertilization restores the diploid state.",
    "citations": [
      {
        "title": "The Cell Cycle",
        "author": "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
      },
      {
        "title": "The Process of Meiosis",
        "author": "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-preparing-to-divide",
      "name": "Preparing to divide",
      "color": "teal",
      "fact": "During interphase a cell grows through G1, copies its DNA in S phase, and passes regulated checkpoints before division.",
      "terms": [
        "interphase",
        "G1 phase",
        "S phase",
        "cell-cycle checkpoint"
      ],
      "seeds": [
        "interphase",
        "S phase"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Cell cycle"
          }
        ]
      }
    },
    {
      "id": "cluster-mitosis",
      "name": "Mitosis",
      "color": "blue",
      "fact": "Chromosomes condense in prophase, the spindle aligns and separates them through metaphase and anaphase, and cytokinesis partitions the cell.",
      "terms": [
        "mitotic spindle",
        "prophase",
        "metaphase",
        "anaphase",
        "cytokinesis"
      ],
      "seeds": [
        "metaphase",
        "anaphase"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Mitosis"
          }
        ]
      }
    },
    {
      "id": "cluster-meiosis",
      "name": "Meiosis",
      "color": "amber",
      "fact": "Meiosis pairs homologous chromosomes and permits crossing over; meiosis I separates homologs, while meiosis II separates sister chromatids.",
      "terms": [
        "homologous chromosome",
        "crossing over",
        "meiosis I",
        "meiosis II"
      ],
      "seeds": [
        "crossing over",
        "meiosis I"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Meiosis"
          }
        ]
      }
    },
    {
      "id": "cluster-inheritance",
      "name": "Inheritance",
      "color": "magenta",
      "fact": "Alleles inherited through gametes combine into homozygous or heterozygous genotypes; development and environment help produce observable phenotypes.",
      "terms": [
        "allele",
        "genotype",
        "phenotype",
        "homozygous",
        "heterozygous"
      ],
      "seeds": [
        "allele",
        "genotype"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Mendelian inheritance"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-chromosome",
      "term": "chromosome",
      "clusters": [
        0,
        1
      ],
      "fact": "A chromosome is copied before division and then condensed, aligned, and separated by the mitotic machinery.",
      "info": {
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Chromosome"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "S phase",
        "mitotic spindle"
      ]
    },
    {
      "id": "bridge-gamete",
      "term": "gamete",
      "clusters": [
        2,
        3
      ],
      "fact": "Meiosis contributes to forming haploid gametes, which carry one allele at each locus into the next generation.",
      "info": {
        "links": [
          {
            "href": "wiki:Gamete"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "meiosis I",
        "allele"
      ]
    },
    {
      "id": "bridge-genetic-variation",
      "term": "genetic variation",
      "clusters": [
        2,
        3
      ],
      "fact": "Crossing over and the assortment of homologous chromosomes create new allele combinations that inheritance can transmit.",
      "info": {
        "links": [
          {
            "href": "wiki:Genetic variation"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "crossing over",
        "genotype"
      ]
    },
    {
      "id": "bridge-fertilization",
      "term": "fertilization",
      "clusters": [
        2,
        3
      ],
      "fact": "Fertilization joins haploid gametes, restores the diploid chromosome number, and combines parental alleles in one genotype.",
      "info": {
        "links": [
          {
            "href": "wiki:Fertilisation"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "meiosis I",
        "genotype"
      ]
    },
    {
      "id": "bridge-haploid-cell",
      "term": "haploid cell",
      "clusters": [
        2,
        3
      ],
      "fact": "A haploid cell contains one chromosome set; in many life cycles, haploid gametes carry inherited alleles between generations.",
      "info": {
        "links": [
          {
            "href": "wiki:Ploidy"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "meiosis I",
        "allele"
      ]
    }
  ],
  "lenses": [
    {
      "id": "copying-and-separating",
      "prompt": "Which concepts participate directly in copying DNA or separating copied chromosomes into new nuclei?",
      "explanation": "DNA is copied during S phase. The mitotic spindle aligns condensed chromosomes at metaphase and separates sister chromatids during anaphase.",
      "targets": [
        "S phase",
        "mitotic spindle",
        "metaphase",
        "anaphase",
        "chromosome"
      ]
    },
    {
      "id": "halving-chromosome-sets",
      "prompt": "Which concepts are central to producing cells with one chromosome set for sexual reproduction?",
      "explanation": "Meiosis I separates homologous chromosomes, reducing a diploid cell to haploid descendants. Further division and differentiation can produce haploid gametes.",
      "targets": [
        "homologous chromosome",
        "meiosis I",
        "haploid cell",
        "gamete"
      ]
    },
    {
      "id": "sources-and-carriers-of-variation",
      "prompt": "Which concepts connect meiotic reshuffling with inherited differences among offspring?",
      "explanation": "Crossing over reshuffles alleles into new chromosome combinations. Fertilization combines gametes, producing an offspring genotype and contributing to heritable variation.",
      "targets": [
        "crossing over",
        "allele",
        "genotype",
        "fertilization",
        "genetic variation"
      ]
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Connect cell structure to inheritance, then follow inherited variation into population change."
    },
    "entries": [
      {
        "id": "inside-the-cell",
        "reason": "Review the compartments and structures that sustain a cell."
      },
      {
        "id": "how-populations-evolve",
        "reason": "See how inherited variants change in frequency across generations."
      },
      {
        "id": "from-dna-to-gene-expression",
        "reason": "Distinguish transmission of DNA from expression of its information."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
