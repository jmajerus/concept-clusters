// Generated from content/puzzles/from-reads-to-a-genome.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "from-reads-to-a-genome",
  "title": "From reads to a genome",
  "category": "biology",
  "subcategories": {
    "biology": "genomics"
  },
  "tags": [
    "biology",
    "genomics",
    "DNA sequencing",
    "bioinformatics"
  ],
  "info": {
    "text": "Sequencers usually measure fragments, not an intact chromosome from end to end. Reconstructing a useful genome therefore joins sample preparation and base calling to computational assembly, quality evidence, and biological annotation.",
    "citations": [
      {
        "title": "DNA Sequencing Fact Sheet",
        "author": "National Human Genome Research Institute",
        "url": "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Fact-Sheet"
      },
      {
        "title": "Long-Read DNA Sequencing",
        "author": "National Human Genome Research Institute",
        "url": "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing"
      },
      {
        "title": "The NCBI Genome assembly data model",
        "author": "National Center for Biotechnology Information",
        "url": "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/"
      }
    ]
  },
  "clusters": [
    {
      "id": "preparing-dna-fragments",
      "name": "Preparing DNA fragments",
      "color": "teal",
      "fact": "DNA is extracted, fragmented when needed, and joined to platform-specific adapters to create a sequencing library that an instrument can read.",
      "terms": [
        "DNA extraction",
        "fragmentation",
        "adapter",
        "library preparation"
      ],
      "seeds": [
        "DNA extraction",
        "library preparation"
      ],
      "termInfo": {
        "DNA extraction": {
          "text": "The isolation of DNA from cells or other biological material for downstream measurement.",
          "links": [
            {
              "href": "wiki:DNA extraction"
            }
          ]
        },
        "fragmentation": {
          "text": "Breaking DNA into a size distribution suitable for a sequencing method or library design.",
          "links": [
            {
              "href": "wiki:DNA sequencing"
            }
          ]
        },
        "adapter": {
          "text": "A designed oligonucleotide joined to sample DNA so fragments can be amplified, identified, or read by a sequencing platform.",
          "links": [
            {
              "href": "wiki:Adapter (genetics)"
            }
          ]
        },
        "library preparation": {
          "text": "Preparing DNA fragments, often with platform-specific adapters, so they can be sequenced.",
          "links": [
            {
              "href": "wiki:DNA sequencing#Basic methods"
            }
          ]
        }
      }
    },
    {
      "id": "reading-instrument-signals",
      "name": "Reading instrument signals",
      "color": "blue",
      "fact": "A sequencing instrument detects signals from prepared molecules, base calling translates those signals into nucleotide letters, and quality scores retain uncertainty in each call.",
      "terms": [
        "sequencing instrument",
        "base calling",
        "base quality"
      ],
      "seeds": [
        "base calling",
        "base quality"
      ],
      "termInfo": {
        "sequencing instrument": {
          "text": "A platform that measures physical or chemical signals associated with nucleotide sequence.",
          "links": [
            {
              "href": "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Fact-Sheet"
            }
          ]
        },
        "base calling": {
          "text": "The computational conversion of instrument signals into proposed nucleotide bases.",
          "links": [
            {
              "href": "wiki:Base calling"
            }
          ]
        },
        "base quality": {
          "text": "A score expressing estimated confidence in a nucleotide call, commonly represented on a Phred scale.",
          "links": [
            {
              "href": "wiki:Phred quality score"
            }
          ]
        }
      }
    },
    {
      "id": "reconstructing-longer-sequence",
      "name": "Reconstructing longer sequence",
      "color": "amber",
      "fact": "Assembly algorithms use overlaps and other linking evidence to form continuous contigs, order them into scaffolds, and estimate a consensus sequence despite repeats and gaps.",
      "terms": [
        "read overlap",
        "contig",
        "scaffold",
        "consensus sequence"
      ],
      "seeds": [
        "read overlap",
        "contig"
      ],
      "termInfo": {
        "read overlap": {
          "text": "A matching sequence shared by reads that can support their placement relative to one another.",
          "links": [
            {
              "href": "wiki:Sequence assembly"
            }
          ]
        },
        "contig": {
          "text": "A continuous assembled sequence with no internal gaps in its consensus representation.",
          "links": [
            {
              "href": "wiki:Contig"
            }
          ]
        },
        "scaffold": {
          "text": "An ordered and oriented set of contigs whose intervening sequence may remain unresolved.",
          "links": [
            {
              "href": "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/"
            }
          ]
        },
        "consensus sequence": {
          "text": "A sequence estimate formed by combining evidence from multiple aligned or overlapping observations.",
          "links": [
            {
              "href": "wiki:Consensus sequence"
            }
          ]
        }
      }
    },
    {
      "id": "annotating-biological-features",
      "name": "Annotating biological features",
      "color": "magenta",
      "fact": "Annotation adds hypotheses and evidence about genes, repeats, and function to assembled coordinates; a genome browser presents those layers without making them identical to the sequence itself.",
      "terms": [
        "gene model",
        "repeat annotation",
        "functional annotation",
        "genome browser"
      ],
      "seeds": [
        "gene model",
        "functional annotation"
      ],
      "termInfo": {
        "gene model": {
          "text": "A representation of a gene's predicted or supported exon, transcript, and coding structure on an assembly.",
          "links": [
            {
              "href": "wiki:Gene prediction"
            }
          ]
        },
        "repeat annotation": {
          "text": "The identification and classification of repeated sequence elements in an assembled genome.",
          "links": [
            {
              "href": "wiki:Interspersed repeat"
            }
          ]
        },
        "functional annotation": {
          "text": "Associating genes or other features with evidence about products, roles, pathways, or homology.",
          "links": [
            {
              "href": "wiki:DNA annotation"
            }
          ]
        },
        "genome browser": {
          "text": "An interface for viewing sequence coordinates together with annotations and experimental evidence tracks.",
          "links": [
            {
              "href": "wiki:Genome browser"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "sequencing-read",
      "term": "sequencing read",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A sequencing read is the fragmentary sequence record passed from signal interpretation into alignment or assembly.",
      "info": {
        "text": "A nucleotide sequence inferred from one DNA fragment or molecule during a sequencing run.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "library preparation",
        "base calling",
        "read overlap"
      ]
    },
    {
      "id": "coverage",
      "term": "coverage",
      "clusters": [
        1,
        2
      ],
      "fact": "Coverage measures how much sequence evidence supports genomic positions; adequate depth helps distinguish a reproducible consensus from isolated measurement error.",
      "info": {
        "text": "The amount of sequencing data covering a nucleotide or genome, often summarized as average depth.",
        "links": [
          {
            "href": "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "base quality",
        "consensus sequence"
      ]
    },
    {
      "id": "long-read",
      "term": "long read",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Long-read technologies generate longer fragments that can span repeats and reduce ambiguity during assembly, though read length is only one dimension of data quality.",
      "info": {
        "text": "A sequencing read thousands to hundreds of thousands of nucleotides long, depending on the technology and experiment.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "library preparation",
        "sequencing instrument",
        "scaffold"
      ]
    },
    {
      "id": "genome-assembly",
      "term": "genome assembly",
      "clusters": [
        2,
        3
      ],
      "fact": "The assembly provides the sequence and coordinate framework on which gene, repeat, and functional annotations are placed.",
      "info": {
        "text": "A representation of an organism's genome reconstructed from sequence data, at contig, scaffold, chromosome, or complete-genome level.",
        "links": [
          {
            "href": "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "scaffold",
        "gene model"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "measured-versus-inferred",
      "prompt": "Which concepts are direct or near-direct instrument outputs, and which are computational reconstructions built from them?",
      "explanation": "Base calls and their quality scores form sequencing reads. Contigs, scaffolds, and the assembly are inferred by combining evidence across many reads.",
      "targets": [
        "base calling",
        "base quality",
        "sequencing read",
        "contig",
        "scaffold",
        "genome assembly"
      ],
      "reasons": {
        "base calling": "It converts the instrument signal into proposed nucleotide identities.",
        "base quality": "It expresses confidence in an individual proposed base call.",
        "sequencing read": "It is the fragmentary sequence record produced by the sequencing workflow.",
        "contig": "It is a continuous consensus sequence reconstructed from overlapping evidence.",
        "scaffold": "It orders and orients contigs while allowing unresolved gaps.",
        "genome assembly": "It is the larger reconstruction assembled from sequence evidence."
      }
    },
    {
      "id": "why-more-data-can-help",
      "prompt": "Which concepts explain why repeated and longer observations can make reconstruction more reliable?",
      "explanation": "Overlaps and repeated coverage support a consensus, while long reads can span repeats that short fragments may not place uniquely.",
      "targets": [
        "long read",
        "read overlap",
        "coverage",
        "consensus sequence",
        "scaffold"
      ],
      "reasons": {
        "long read": "A longer fragment can bridge sequence contexts separated by a repeat.",
        "read overlap": "Shared sequence provides evidence that fragments belong together.",
        "coverage": "Repeated observations provide redundancy for consensus and confidence.",
        "consensus sequence": "It combines evidence across reads rather than trusting one measurement alone.",
        "scaffold": "Longer-range evidence helps order and orient contigs across unresolved sequence."
      }
    },
    {
      "id": "sequence-is-not-interpretation",
      "prompt": "Which concepts turn reconstructed letters into hypotheses about biological structure or function?",
      "explanation": "An assembly supplies coordinates and sequence. Annotation predicts or records features and functions, while a genome browser lets evidence layers be inspected together.",
      "targets": [
        "gene model",
        "repeat annotation",
        "functional annotation",
        "genome browser"
      ],
      "reasons": {
        "gene model": "It proposes the exon, transcript, and coding structure of a gene.",
        "repeat annotation": "It marks repeated sequence families and their locations.",
        "functional annotation": "It associates a genomic feature with evidence about biological role.",
        "genome browser": "It displays sequence, annotations, and evidence tracks in their genomic context."
      }
    },
    {
      "id": "evidence-accumulates-across-scales",
      "prompt": "Which concepts carry or summarize uncertainty as individual measurements become a genome interpretation?",
      "explanation": "Base quality describes individual calls, reads carry those calls, and coverage supplies repeated evidence. Consensus sequences and scaffolds summarize reconstruction, while a gene model adds a further evidence-based biological hypothesis.",
      "targets": [
        "base quality",
        "sequencing read",
        "coverage",
        "consensus sequence",
        "scaffold",
        "gene model"
      ],
      "reasons": {
        "base quality": "It quantifies uncertainty in an individual nucleotide call.",
        "sequencing read": "It packages a series of measured base calls as one fragmentary observation.",
        "coverage": "It summarizes how much repeated read evidence supports genomic positions.",
        "consensus sequence": "It combines multiple observations into a sequence estimate.",
        "scaffold": "It represents longer-range order while retaining unresolved gaps.",
        "gene model": "It interprets assembled coordinates as a possible biological feature."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "from-dna-to-gene-expression",
        "reason": "Review what genomic sequences encode and how cells selectively use them."
      },
      {
        "id": "reading-genetic-variation",
        "reason": "Use reads and reference sequences to reason about genomic differences."
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
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "from-reads-to-a-genome",
      "puzzleRevision": "fnv1a32:71c159ef",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:DNA extraction": {
          "x": 719.05,
          "y": 261.5,
          "pinned": true
        },
        "term:fragmentation": {
          "x": 632.66,
          "y": 194.45,
          "pinned": true
        },
        "term:adapter": {
          "x": 771.19,
          "y": 190.75,
          "pinned": true
        },
        "term:library preparation": {
          "x": 722.28,
          "y": 344.5,
          "pinned": true
        },
        "term:sequencing instrument": {
          "x": 726.83,
          "y": 464.64,
          "pinned": true
        },
        "term:base calling": {
          "x": 538.13,
          "y": 465.23,
          "pinned": true
        },
        "term:base quality": {
          "x": 586.23,
          "y": 533.26,
          "pinned": true
        },
        "term:read overlap": {
          "x": 554.1,
          "y": 122.3,
          "pinned": true
        },
        "term:contig": {
          "x": 409.17,
          "y": 185.82,
          "pinned": true
        },
        "term:scaffold": {
          "x": 830.75,
          "y": 124.87,
          "pinned": true
        },
        "term:consensus sequence": {
          "x": 414.64,
          "y": 264.69,
          "pinned": true
        },
        "term:gene model": {
          "x": 380.53,
          "y": 48.05,
          "pinned": true
        },
        "term:repeat annotation": {
          "x": 259.5,
          "y": 159.29,
          "pinned": true
        },
        "term:functional annotation": {
          "x": 193.73,
          "y": 111.69,
          "pinned": true
        },
        "term:genome browser": {
          "x": 178.08,
          "y": 54.9,
          "pinned": true
        },
        "term:sequencing read": {
          "x": 540.25,
          "y": 341.74,
          "pinned": true
        },
        "term:coverage": {
          "x": 410.83,
          "y": 532.86,
          "pinned": true
        },
        "term:long read": {
          "x": 880.06,
          "y": 298.95,
          "pinned": true
        },
        "term:genome assembly": {
          "x": 664.49,
          "y": 47.96,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4279.8,
        "score": 4279.8006987919925
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:23:47.418Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "from-reads-to-a-genome",
      "puzzleRevision": "fnv1a32:71c159ef",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 584.21,
          "pinned": false
        },
        "cluster:1": {
          "x": 212.15,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 211.79,
          "pinned": false
        },
        "cluster:3": {
          "x": 837.85,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:sequencing read": {
          "x": 420.72,
          "y": 398,
          "pinned": false
        },
        "term:coverage": {
          "x": 331.8,
          "y": 268.12,
          "pinned": false
        },
        "term:long read": {
          "x": 556.72,
          "y": 398,
          "pinned": false
        },
        "term:genome assembly": {
          "x": 736.58,
          "y": 249.74,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "DNA extraction",
          "fragmentation",
          "adapter",
          "library preparation"
        ],
        "cluster:1": [
          "sequencing instrument",
          "base calling",
          "base quality"
        ],
        "cluster:2": [
          "read overlap",
          "contig",
          "scaffold",
          "consensus sequence"
        ],
        "cluster:3": [
          "gene model",
          "repeat annotation",
          "functional annotation",
          "genome browser"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 809.8680061495154
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:56:25.265Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "from-reads-to-a-genome",
      "puzzleRevision": "fnv1a32:71c159ef",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:DNA extraction": {
          "x": 701.81,
          "y": 233.44
        },
        "term:fragmentation": {
          "x": 668.6,
          "y": 93.25
        },
        "term:adapter": {
          "x": 520.55,
          "y": 86.56
        },
        "term:library preparation": {
          "x": 524.76,
          "y": 236.45
        },
        "term:sequencing instrument": {
          "x": 840.71,
          "y": 27.58
        },
        "term:base calling": {
          "x": 722.71,
          "y": 355.61
        },
        "term:base quality": {
          "x": 866.07,
          "y": 389.52
        },
        "term:read overlap": {
          "x": 642.89,
          "y": 429.83
        },
        "term:contig": {
          "x": 507.02,
          "y": 593.23
        },
        "term:scaffold": {
          "x": 359.82,
          "y": 204.29
        },
        "term:consensus sequence": {
          "x": 657.02,
          "y": 590.99
        },
        "term:gene model": {
          "x": 271.4,
          "y": 288.93
        },
        "term:repeat annotation": {
          "x": 180.7,
          "y": 387.25
        },
        "term:functional annotation": {
          "x": 105.19,
          "y": 465.6
        },
        "term:genome browser": {
          "x": 376.32,
          "y": 459.57
        },
        "term:sequencing read": {
          "x": 548.09,
          "y": 334.13
        },
        "term:coverage": {
          "x": 797.29,
          "y": 521.64
        },
        "term:long read": {
          "x": 397.59,
          "y": 26.81
        },
        "term:genome assembly": {
          "x": 376.73,
          "y": 386.72
        },
        "cluster:0": {
          "x": 607.14,
          "y": 163.58
        },
        "cluster:1": {
          "x": 847.06,
          "y": 284.53
        },
        "cluster:2": {
          "x": 573.35,
          "y": 507.97
        },
        "cluster:3": {
          "x": 274.08,
          "y": 554.43
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T20:18:01.092Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:56:18.470Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
