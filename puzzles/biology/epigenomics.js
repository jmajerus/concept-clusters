// Generated from content/puzzles/epigenomics.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "epigenomics",
  "title": "The Epigenome",
  "category": "Biology",
  "subcategories": {
    "Biology": "multiomics"
  },
  "large": true,
  "info": {
    "text": "The epigenome is chemical marks and DNA packaging that tell the same genome which genes to use in which cells, without changing the DNA letters.",
    "links": [
      {
        "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
        "label": "NHGRI epigenomics fact sheet"
      }
    ],
    "citations": [
      {
        "title": "Epigenomics Fact Sheet",
        "author": "National Human Genome Research Institute",
        "year": "2020",
        "url": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet"
      },
      {
        "title": "Genetic Imprinting and X Inactivation",
        "author": "Nature Education / Scitable",
        "url": "https://www.nature.com/scitable/topicpage/genetic-imprinting-and-x-inactivation-1066/"
      }
    ]
  },
  "clusters": [
    {
      "id": "dna-tags",
      "name": "Tags on the DNA",
      "color": "teal",
      "fact": "A methyl group on cytosine — often in a CpG island — is a chemical tag on the DNA itself that can keep a gene unused without changing its letters.",
      "terms": [
        "DNA methylation",
        "5-methylcytosine",
        "CpG island"
      ],
      "seeds": [
        "DNA methylation",
        "5-methylcytosine"
      ],
      "termInfo": {
        "5-methylcytosine": {
          "text": "The modified cytosine base that carries the methyl tag; the chemical form DNA methylation usually refers to in animals.",
          "links": [
            "wiki:5-Methylcytosine"
          ]
        },
        "CpG island": {
          "text": "A short stretch of DNA dense in cytosine–guanine pairs, often near gene starts, where methylation can have a strong effect on whether the gene is used.",
          "links": [
            "wiki:CpG island"
          ]
        },
        "DNA methylation": {
          "text": "The addition of a methyl group to DNA, most often at cytosine in a CpG pair, without changing the underlying sequence.",
          "links": [
            "wiki:DNA methylation"
          ]
        }
      },
      "info": {
        "text": "These marks sit on the DNA molecule. They are not mutations in the sequence, and they are not tags on the proteins DNA wraps around.",
        "links": [
          {
            "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
            "label": "NHGRI: what makes up the epigenome"
          }
        ]
      }
    },
    {
      "id": "histone-packaging",
      "name": "Packaging around histones",
      "color": "blue",
      "fact": "DNA wraps around histones in nucleosomes; histone modifications help open or close chromatin so a region can be used or ignored.",
      "terms": [
        "histone",
        "nucleosome",
        "histone modification",
        "open chromatin",
        "closed chromatin"
      ],
      "seeds": [
        "histone",
        "nucleosome"
      ],
      "termInfo": {
        "closed chromatin": {
          "text": "Tightly packed DNA that is hard to use; often called heterochromatin in textbooks."
        },
        "histone": {
          "text": "A protein that DNA wraps around in the nucleus, forming the spool of chromatin packaging.",
          "links": [
            "wiki:Histone"
          ]
        },
        "histone modification": {
          "text": "A chemical tag on a histone (for example an acetyl or methyl group) that helps other proteins treat nearby DNA as usable or ignored.",
          "links": [
            "wiki:Histone"
          ]
        },
        "nucleosome": {
          "text": "The basic packing unit of chromatin: a stretch of DNA wound around a histone core.",
          "links": [
            "wiki:Nucleosome"
          ]
        },
        "open chromatin": {
          "text": "Loosely packed DNA that transcription machinery can reach; often called euchromatin in textbooks."
        }
      },
      "info": {
        "text": "These terms are about how DNA is spooled and how tightly that spool is packed — a second kind of instruction, not a change to the genetic letters.",
        "links": [
          {
            "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
            "label": "NHGRI: histone modification"
          }
        ]
      }
    },
    {
      "id": "writers-readers-erasers",
      "name": "Writers, readers, and erasers",
      "color": "amber",
      "fact": "Proteins write, read, and erase epigenomic marks, so the instructions are reversible rather than a permanent stain.",
      "terms": [
        "writer",
        "eraser",
        "reader"
      ],
      "seeds": [
        "writer",
        "eraser"
      ],
      "termInfo": {
        "eraser": {
          "text": "An enzyme that removes an epigenomic mark, so a previously tagged region can be used differently."
        },
        "reader": {
          "text": "A protein that recognizes an epigenomic mark and recruits machinery that treats that DNA as usable or ignored."
        },
        "writer": {
          "text": "An enzyme that attaches an epigenomic mark, such as a methyl or acetyl group, to DNA or to a histone."
        }
      },
      "info": {
        "text": "The same marks can be added, noticed, and taken off. That is why cell identity can be stable and still, in principle, reversible.",
        "links": [
          {
            "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
            "label": "NHGRI: proteins that read and write marks"
          }
        ]
      }
    },
    {
      "id": "cell-identity",
      "name": "One genome, many cell types",
      "color": "magenta",
      "fact": "The same genome becomes many cell identities because development writes epigenetic memory, including which parental copy to use and which X to silence.",
      "terms": [
        "cell identity",
        "development",
        "epigenetic memory",
        "reprogramming",
        "genomic imprinting",
        "X-chromosome inactivation"
      ],
      "seeds": [
        "cell identity",
        "development"
      ],
      "termInfo": {
        "X-chromosome inactivation": {
          "text": "In XX cells, one X chromosome is largely silenced so gene dose matches XY cells.",
          "links": [
            "wiki:X-inactivation"
          ]
        },
        "cell identity": {
          "text": "The stable specialized state of a cell — muscle, blood, neuron, and so on — despite sharing essentially the same genome with other cells."
        },
        "development": {
          "text": "The process that turns one fertilized genome into many specialized tissues by laying down different epigenomic instructions in different lineages.",
          "links": [
            "wiki:Developmental biology"
          ]
        },
        "epigenetic memory": {
          "text": "The persistence of those instructions through cell division, so a liver cell's daughters remain liver cells."
        },
        "genomic imprinting": {
          "text": "A parent-of-origin program: for some genes, only the copy from the mother or only the copy from the father is used.",
          "links": [
            "wiki:Genomic imprinting"
          ]
        },
        "reprogramming": {
          "text": "Wiping or rewriting epigenomic marks so a specialized cell can regain a more open developmental potential, as in making induced pluripotent stem cells.",
          "links": [
            "wiki:Induced pluripotent stem cell"
          ]
        }
      },
      "info": {
        "text": "This is why the marks exist: muscle, blood, and brain keep the same DNA and stay different — including which parental copy or which X is used.",
        "links": [
          {
            "href": "https://www.nature.com/scitable/topicpage/genetic-imprinting-and-x-inactivation-1066/",
            "label": "Scitable: imprinting and X inactivation"
          }
        ]
      }
    },
    {
      "id": "change-and-disease",
      "name": "Marks that change — and fail",
      "color": "olive",
      "fact": "Surroundings can shift epigenomic marks, and when those instructions misfire the result can be cancer or an imprinting disorder.",
      "terms": [
        "cancer",
        "environmental exposure",
        "imprinting disorder"
      ],
      "seeds": [
        "cancer",
        "environmental exposure"
      ],
      "termInfo": {
        "cancer": {
          "text": "Uncontrolled cell growth that can involve epigenomic as well as genetic change — for example shutting down genes that would otherwise limit growth.",
          "links": [
            "wiki:Cancer"
          ]
        },
        "environmental exposure": {
          "text": "Outside influences such as diet, smoke, or infection that can prompt chemical responses and shift epigenomic marks during a lifetime."
        },
        "imprinting disorder": {
          "text": "A disease that results when the parental stamp on an imprinted gene is missing, duplicated, or applied to the wrong copy — for example Prader–Willi or Angelman syndrome.",
          "links": [
            "wiki:Genomic imprinting"
          ]
        }
      },
      "info": {
        "text": "The overlay is not fixed at birth. Surroundings can move it, and when the instructions misfire the result can be disease.",
        "links": [
          {
            "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
            "label": "NHGRI: epigenome, environment, and cancer"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "mitotic-memory",
      "term": "mitotic memory",
      "clusters": [
        0,
        3
      ],
      "fact": "DNA methylation is one way a specialized cell remembers, through division, which genes stay off.",
      "info": "The copying of epigenomic marks through cell division, so a specialized cell's daughters keep the same instructions. That is how epigenetic memory is physically transmitted, not a third kind of chemical tag.",
      "termRole": "connector",
      "relationKind": "foundation",
      "idealTerms": [
        "DNA methylation",
        "epigenetic memory"
      ]
    },
    {
      "id": "cell-type-chromatin",
      "term": "cell-type chromatin",
      "clusters": [
        1,
        3
      ],
      "fact": "Open versus closed chromatin is how the same genome is physically available in one cell type and packed away in another.",
      "info": {
        "text": "This names packaging that differs by cell type, not a separate chemical tag on the DNA letters."
      },
      "termRole": "connector",
      "relationKind": "foundation",
      "idealTerms": [
        "open chromatin",
        "cell identity"
      ]
    },
    {
      "id": "harmful-silencing",
      "term": "harmful silencing",
      "clusters": [
        0,
        4
      ],
      "fact": "Cancer can use DNA methylation to shut down genes that would otherwise limit growth.",
      "info": {
        "text": "This names the same kind of DNA tag used in the wrong place: methylation that silences genes that should still limit growth."
      },
      "termRole": "connector",
      "relationKind": "dynamic",
      "idealTerms": [
        "DNA methylation",
        "cancer"
      ]
    }
  ],
  "lenses": [
    {
      "id": "tag-on-the-dna-molecule",
      "prompt": "Which two terms name the chemical tag attached to the DNA molecule itself — not a genomic neighborhood, and not a tag on packing proteins?",
      "explanation": "DNA methylation is the process of attaching that tag, and 5-methylcytosine is the modified base that carries it. A CpG island is a place where that tag often matters; a histone modification is a tag on the packing proteins, not on the DNA letters.",
      "targets": [
        "DNA methylation",
        "5-methylcytosine"
      ],
      "reasons": {
        "5-methylcytosine": "It is the chemically tagged cytosine base.",
        "DNA methylation": "It names adding a methyl tag to DNA itself."
      }
    },
    {
      "id": "taking-marks-off",
      "prompt": "Which term names the proteins that take epigenomic marks off, rather than adding them or noticing them?",
      "explanation": "Writers attach marks and readers recognize them. Erasers remove marks, which is why the instructions are reversible rather than a permanent stain.",
      "targets": [
        "eraser"
      ],
      "reasons": {
        "eraser": "It removes an existing mark so the region can be used differently."
      }
    },
    {
      "id": "which-copy-is-used",
      "prompt": "Which two programs use epigenomic marks to choose which copy of a gene or chromosome is used?",
      "explanation": "Genomic imprinting chooses the maternal or paternal copy of certain genes. X-chromosome inactivation silences one entire X in XX cells. Reprogramming resets identity rather than choosing a parental or X copy; cell identity is the outcome of many such programs, not a copy-choice mechanism.",
      "targets": [
        "genomic imprinting",
        "X-chromosome inactivation"
      ],
      "reasons": {
        "X-chromosome inactivation": "It uses marks to silence one of the two X chromosomes.",
        "genomic imprinting": "It uses parental marks to choose which allele is expressed."
      }
    },
    {
      "id": "when-instructions-fail",
      "prompt": "Which two terms name diseases in which epigenomic instructions have gone wrong?",
      "explanation": "Cancer can involve marks that silence genes that should limit growth. An imprinting disorder is a failed parental stamp. Environmental exposure can shift marks, but it is a cause of change rather than a disease name.",
      "targets": [
        "cancer",
        "imprinting disorder"
      ],
      "reasons": {
        "cancer": "It can result when epigenomic marks shut down or activate the wrong growth genes.",
        "imprinting disorder": "It results when a parental methylation stamp is missing, duplicated, or applied to the wrong copy."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Same genome, different instructions",
    "summary": "The epigenome is chemical marks and packaging on DNA that tell each cell which genes to use, without rewriting the sequence.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "A muscle cell and a neuron keep essentially the same genome. What differs is which genes are available to use. The epigenome is the set of chemical marks and DNA packaging that carry those instructions. The marks do not change the DNA letters; they change how a cell reads them.\n\nSome tags attach to the DNA itself — most famously a methyl group on cytosine. Others attach to histones, the proteins DNA wraps around, and help open or close a region. Proteins add, notice, and remove those tags, so the overlay can be stable through cell division and still, in principle, reversible. Development uses that system to make many cell types from one genome. Surroundings can shift the marks later, and when the instructions misfire the result can be disease."
    },
    "links": [
      {
        "href": "https://www.genome.gov/about-genomics/fact-sheets/Epigenomics-Fact-Sheet",
        "label": "NHGRI epigenomics fact sheet"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Cursor (Grok 4.6)"
      }
    ],
    "reasoning": "high"
  }
});
