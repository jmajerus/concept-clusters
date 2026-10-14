// Generated from content/puzzles/from-dna-to-gene-expression.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "from-dna-to-gene-expression",
  "title": "From DNA to gene expression",
  "category": "biology",
  "subcategories": {
    "biology": "transcriptomics"
  },
  "tags": [
    "biology",
    "genomics",
    "gene expression",
    "molecular biology"
  ],
  "info": {
    "text": "A genome is not a simple list of protein recipes. DNA is packaged and regulated; selected regions are transcribed into RNA; and some RNAs are translated into proteins while others act in different cellular roles.",
    "citations": [
      {
        "title": "Deoxyribonucleic Acid (DNA) Fact Sheet",
        "author": "National Human Genome Research Institute",
        "url": "https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet"
      },
      {
        "title": "Transcriptome Fact Sheet",
        "author": "National Human Genome Research Institute",
        "url": "https://www.genome.gov/about-genomics/fact-sheets/Transcriptome-Fact-Sheet"
      }
    ]
  },
  "clusters": [
    {
      "id": "organizing-genomic-information",
      "name": "Organizing genomic information",
      "color": "teal",
      "fact": "DNA is packaged into chromosomes, and a genome contains genes alongside regulatory and other noncoding sequences.",
      "terms": [
        "DNA",
        "chromosome",
        "regulatory sequence",
        "noncoding sequence"
      ],
      "seeds": [
        "DNA",
        "chromosome"
      ],
      "termInfo": {
        "DNA": {
          "text": "The nucleic-acid molecule whose base sequence stores genomic information in cellular life.",
          "links": [
            {
              "href": "https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet"
            }
          ]
        },
        "chromosome": {
          "text": "A packaged DNA molecule, together with associated proteins, that carries genomic information.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Chromosome"
            }
          ]
        },
        "noncoding sequence": {
          "text": "Genomic DNA that does not encode a protein; many such regions have regulatory, structural, or other functions.",
          "links": [
            {
              "href": "wiki:Non-coding DNA"
            }
          ]
        },
        "regulatory sequence": {
          "text": "A DNA region that influences when, where, or how strongly a gene is expressed.",
          "links": [
            {
              "href": "wiki:Regulatory sequence"
            }
          ]
        }
      }
    },
    {
      "id": "transcribing-dna",
      "name": "Transcribing DNA",
      "color": "blue",
      "fact": "RNA polymerase binds with the help of promoter and regulatory context, then transcribes a DNA template into a primary RNA transcript.",
      "terms": [
        "promoter",
        "RNA polymerase",
        "transcription"
      ],
      "seeds": [
        "promoter",
        "transcription"
      ],
      "termInfo": {
        "RNA polymerase": {
          "text": "An enzyme that builds an RNA strand using DNA as its template.",
          "links": [
            {
              "href": "wiki:RNA polymerase"
            }
          ]
        },
        "promoter": {
          "text": "A regulatory DNA region where the transcription machinery assembles to begin transcription.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Promoter"
            }
          ]
        },
        "transcription": {
          "text": "The synthesis of an RNA molecule from a DNA template.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Transcription"
            }
          ]
        }
      }
    },
    {
      "id": "processing-and-using-rna",
      "name": "Processing and using RNA",
      "color": "cyan",
      "fact": "A primary transcript may be capped, cleaved, and spliced into a mature RNA; some mature RNAs carry protein-coding messages, while others function without translation.",
      "terms": [
        "primary transcript",
        "RNA processing",
        "RNA splicing",
        "mature RNA",
        "noncoding RNA"
      ],
      "seeds": [
        "RNA processing",
        "noncoding RNA"
      ],
      "termInfo": {
        "RNA processing": {
          "text": "Changes to a primary RNA transcript, such as capping, splicing, or cleavage, that help produce mature RNA.",
          "links": [
            {
              "href": "wiki:Post-transcriptional modification"
            }
          ]
        },
        "RNA splicing": {
          "text": "The removal of introns and joining of selected exons in an RNA transcript.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/RNA-Splicing"
            }
          ]
        },
        "mature RNA": {
          "text": "An RNA molecule after the processing steps needed for its cellular role have been completed.",
          "links": [
            {
              "href": "wiki:Post-transcriptional modification"
            }
          ]
        },
        "noncoding RNA": {
          "text": "An RNA molecule whose functional product is RNA rather than a translated protein.",
          "links": [
            {
              "href": "wiki:Non-coding RNA"
            }
          ]
        },
        "primary transcript": {
          "text": "The initial RNA product copied from DNA before any post-transcriptional processing is completed.",
          "links": [
            {
              "href": "wiki:Primary transcript"
            }
          ]
        }
      }
    },
    {
      "id": "building-a-protein",
      "name": "Building a protein",
      "color": "amber",
      "fact": "A ribosome reads codons during translation while transfer RNAs deliver amino acids, producing a chain that can fold into a protein.",
      "terms": [
        "ribosome",
        "codon",
        "transfer RNA",
        "amino acid"
      ],
      "seeds": [
        "ribosome",
        "codon"
      ],
      "termInfo": {
        "amino acid": {
          "text": "One of the molecular building blocks joined into polypeptide chains.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Amino-Acids"
            }
          ]
        },
        "codon": {
          "text": "A three-nucleotide unit in a coding sequence that specifies an amino acid or a stop signal.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Codon"
            }
          ]
        },
        "ribosome": {
          "text": "The RNA-and-protein cellular machine that reads messenger RNA and synthesizes a polypeptide.",
          "links": [
            {
              "href": "https://www.genome.gov/genetics-glossary/Ribosome"
            }
          ]
        },
        "transfer RNA": {
          "text": "An adaptor RNA that pairs an anticodon with a corresponding amino acid during translation.",
          "links": [
            {
              "href": "wiki:Transfer RNA"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "gene",
      "term": "gene",
      "clusters": [
        0,
        1
      ],
      "fact": "A gene bridges stored sequence and RNA production: it is a genomic region whose expression produces a functional RNA, sometimes one that is later translated.",
      "info": {
        "text": "A basic unit of inheritance comprising a DNA sequence that contributes to a functional product.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Gene"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "regulatory sequence",
        "transcription"
      ]
    },
    {
      "id": "messenger-rna",
      "term": "messenger RNA",
      "clusters": [
        2,
        3
      ],
      "fact": "Messenger RNA carries a processed protein-coding transcript from transcription to the ribosome, where its codons are translated.",
      "info": {
        "text": "An RNA transcript whose nucleotide sequence can be translated into a protein.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Messenger-RNA"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "RNA processing",
        "ribosome"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "gene-expression",
      "term": "gene expression",
      "clusters": [
        0,
        1,
        3
      ],
      "fact": "Gene expression spans regulated access to DNA, transcription and RNA processing, and—when the product is a protein—translation.",
      "info": {
        "text": "The regulated process by which information in a gene produces a functional RNA or protein product.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Gene-Expression"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "regulatory sequence",
        "transcription",
        "ribosome"
      ]
    },
    {
      "id": "translation",
      "term": "translation",
      "clusters": [
        2,
        3
      ],
      "fact": "Translation connects an RNA message to protein synthesis by decoding its codons into an amino-acid sequence.",
      "info": {
        "text": "The ribosome-mediated synthesis of a polypeptide using messenger RNA as the template.",
        "links": [
          {
            "href": "https://www.genome.gov/genetics-glossary/Translation"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "RNA processing",
        "codon"
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
      "id": "stored-versus-expressed",
      "prompt": "Which concepts distinguish information stored in a genome from the selective process of using it?",
      "explanation": "Chromosomes store packaged DNA, while regulatory sequences and promoters help determine which regions are used. Gene expression names the selective process, not merely the presence of a gene.",
      "targets": [
        "chromosome",
        "regulatory sequence",
        "gene",
        "gene expression"
      ],
      "reasons": {
        "chromosome": "It packages a long DNA molecule containing many genomic regions.",
        "gene": "It is a particular genomic region that can be selectively expressed.",
        "gene expression": "It is the regulated use of genomic information to produce functional RNA or protein.",
        "regulatory sequence": "It can influence when, where, or how strongly a gene is used."
      }
    },
    {
      "id": "rna-is-more-than-a-messenger",
      "prompt": "Which concepts show that RNA has processing, structural, and regulatory roles—not only a temporary copy of a protein recipe?",
      "explanation": "RNA is synthesized, often processed, and can function without encoding a protein. Transfer RNA and ribosomal RNA are themselves working parts of translation.",
      "targets": [
        "RNA polymerase",
        "RNA processing",
        "noncoding RNA",
        "transfer RNA",
        "ribosome"
      ],
      "reasons": {
        "RNA polymerase": "It synthesizes RNA from a DNA template.",
        "RNA processing": "It changes a primary transcript into one or more mature RNA products.",
        "noncoding RNA": "It functions as RNA rather than serving as a protein-coding message.",
        "ribosome": "Its RNA-and-protein machinery performs translation.",
        "transfer RNA": "It carries amino acids and matches them to codons during translation."
      }
    },
    {
      "id": "following-information-flow",
      "prompt": "Which concepts trace the usual path from a DNA region to an amino-acid chain?",
      "explanation": "A gene is transcribed into messenger RNA, which the ribosome reads during translation, joining the corresponding amino acids.",
      "targets": [
        "gene",
        "transcription",
        "messenger RNA",
        "ribosome",
        "translation",
        "amino acid"
      ],
      "reasons": {
        "amino acid": "It is a building block joined into the emerging protein.",
        "gene": "It is the genomic region whose information is being used.",
        "messenger RNA": "It carries a protein-coding transcript to the translation machinery.",
        "ribosome": "It is the machinery that reads messenger RNA and carries out translation.",
        "transcription": "It copies information from DNA into RNA.",
        "translation": "It converts the nucleotide message into an amino-acid sequence."
      }
    },
    {
      "id": "different-fates-for-rna",
      "prompt": "Which concepts show the different paths an RNA transcript can take after it is made?",
      "explanation": "A primary transcript is spliced into a mature RNA. Some mature RNAs function directly as noncoding RNA, while messenger RNA can instead become the template for translation.",
      "targets": [
        "primary transcript",
        "RNA splicing",
        "mature RNA",
        "noncoding RNA",
        "messenger RNA",
        "translation"
      ],
      "reasons": {
        "RNA splicing": "It is the specific processing step that removes introns and joins exons to produce a mature transcript.",
        "mature RNA": "It is the processed molecule ready for a cellular role.",
        "messenger RNA": "It carries a coding sequence to the translation machinery.",
        "noncoding RNA": "Its functional product remains RNA rather than becoming protein.",
        "primary transcript": "It is the initial RNA product before processing is complete.",
        "translation": "It is the path by which a coding RNA directs polypeptide synthesis."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "from-reads-to-a-genome",
        "reason": "See how laboratory measurements and computation reconstruct genomic sequence."
      },
      {
        "id": "reading-genetic-variation",
        "reason": "Explore how differences from a reference are detected and interpreted."
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
      "puzzleId": "from-dna-to-gene-expression",
      "puzzleRevision": "fnv1a32:0dc7982f",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:DNA": {
          "x": 749.22,
          "y": 259.42,
          "pinned": true
        },
        "term:chromosome": {
          "x": 844.13,
          "y": 187.41,
          "pinned": true
        },
        "term:regulatory sequence": {
          "x": 826.88,
          "y": 374.85,
          "pinned": true
        },
        "term:noncoding sequence": {
          "x": 905.18,
          "y": 292.76,
          "pinned": true
        },
        "term:promoter": {
          "x": 449.18,
          "y": 454.08,
          "pinned": true
        },
        "term:RNA polymerase": {
          "x": 478.36,
          "y": 535.11,
          "pinned": false
        },
        "term:transcription": {
          "x": 590.17,
          "y": 463,
          "pinned": false
        },
        "term:primary transcript": {
          "x": 130.69,
          "y": 303.46,
          "pinned": true
        },
        "term:RNA processing": {
          "x": 306.59,
          "y": 276.66,
          "pinned": true
        },
        "term:RNA splicing": {
          "x": 198.25,
          "y": 176.81,
          "pinned": true
        },
        "term:mature RNA": {
          "x": 381.14,
          "y": 384.85,
          "pinned": false
        },
        "term:noncoding RNA": {
          "x": 262.64,
          "y": 406.38,
          "pinned": false
        },
        "term:ribosome": {
          "x": 603.4,
          "y": 223.11,
          "pinned": true
        },
        "term:codon": {
          "x": 480.51,
          "y": 190.19,
          "pinned": true
        },
        "term:transfer RNA": {
          "x": 680.64,
          "y": 135.89,
          "pinned": true
        },
        "term:amino acid": {
          "x": 541.58,
          "y": 113.58,
          "pinned": true
        },
        "term:gene": {
          "x": 761.21,
          "y": 473.91,
          "pinned": true
        },
        "term:messenger RNA": {
          "x": 468.7,
          "y": 282.5,
          "pinned": true
        },
        "term:gene expression": {
          "x": 613.33,
          "y": 334.24,
          "pinned": true
        },
        "term:translation": {
          "x": 326.03,
          "y": 141.94,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3490.24,
        "score": 3490.241138660725
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-12T17:09:07.631Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "from-dna-to-gene-expression",
      "puzzleRevision": "fnv1a32:0dc7982f",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 649.06,
          "y": 153.02,
          "pinned": false
        },
        "cluster:1": {
          "x": 823.44,
          "y": 437.78,
          "pinned": true
        },
        "cluster:2": {
          "x": 238.56,
          "y": 228.17,
          "pinned": true
        },
        "cluster:3": {
          "x": 460.03,
          "y": 553,
          "pinned": true
        }
      },
      "bridges": {
        "term:gene": {
          "x": 759.11,
          "y": 301.61,
          "pinned": false
        },
        "term:messenger RNA": {
          "x": 276.72,
          "y": 432.02,
          "pinned": true
        },
        "term:gene expression": {
          "x": 589.56,
          "y": 365.21,
          "pinned": true
        },
        "term:translation": {
          "x": 398.82,
          "y": 375.26,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "DNA",
          "chromosome",
          "regulatory sequence",
          "noncoding sequence"
        ],
        "cluster:1": [
          "promoter",
          "RNA polymerase",
          "transcription"
        ],
        "cluster:2": [
          "primary transcript",
          "RNA processing",
          "RNA splicing",
          "mature RNA",
          "noncoding RNA"
        ],
        "cluster:3": [
          "ribosome",
          "codon",
          "transfer RNA",
          "amino acid"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "chromosome",
          "noncoding sequence",
          "regulatory sequence",
          "DNA"
        ],
        "cluster:1": [
          "transcription",
          "RNA polymerase",
          "promoter"
        ],
        "cluster:2": [
          "RNA splicing",
          "noncoding RNA",
          "primary transcript",
          "RNA processing",
          "mature RNA"
        ],
        "cluster:3": [
          "codon",
          "transfer RNA",
          "amino acid",
          "ribosome"
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
        "totalLength": 1556.2970514839444
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:51:25.806Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "from-dna-to-gene-expression",
      "puzzleRevision": "fnv1a32:0dc7982f",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:DNA": {
          "x": 894.36,
          "y": 207.88
        },
        "term:chromosome": {
          "x": 946.75,
          "y": 352.35
        },
        "term:regulatory sequence": {
          "x": 700.65,
          "y": 447.09
        },
        "term:noncoding sequence": {
          "x": 880.64,
          "y": 480.86
        },
        "term:promoter": {
          "x": 423.63,
          "y": 640.97
        },
        "term:RNA polymerase": {
          "x": 289.65,
          "y": 641.46
        },
        "term:transcription": {
          "x": 487.23,
          "y": 444.42
        },
        "term:primary transcript": {
          "x": 178.65,
          "y": 536.49
        },
        "term:RNA processing": {
          "x": 309.09,
          "y": 217.28
        },
        "term:RNA splicing": {
          "x": 121.91,
          "y": 401.39
        },
        "term:mature RNA": {
          "x": 118.84,
          "y": 280.16
        },
        "term:noncoding RNA": {
          "x": 180.02,
          "y": 171.79
        },
        "term:ribosome": {
          "x": 608.9,
          "y": 219.51
        },
        "term:codon": {
          "x": 453.8,
          "y": 215.88
        },
        "term:transfer RNA": {
          "x": 470.75,
          "y": 22
        },
        "term:amino acid": {
          "x": 687.4,
          "y": 22
        },
        "term:gene": {
          "x": 591.02,
          "y": 554.6
        },
        "term:messenger RNA": {
          "x": 442.48,
          "y": 323.17
        },
        "term:gene expression": {
          "x": 602.27,
          "y": 331.43
        },
        "term:translation": {
          "x": 394.11,
          "y": 118.33
        },
        "cluster:0": {
          "x": 801.56,
          "y": 304.59
        },
        "cluster:1": {
          "x": 388.39,
          "y": 533.31
        },
        "cluster:2": {
          "x": 286.65,
          "y": 387.25
        },
        "cluster:3": {
          "x": 582.72,
          "y": 114.75
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-11T17:49:29.276Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
