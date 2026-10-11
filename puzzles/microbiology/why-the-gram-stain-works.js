// Generated from content/puzzles/why-the-gram-stain-works.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "why-the-gram-stain-works",
  "title": "Why the Gram stain works",
  "category": "microbiology",
  "tags": [
    "bacteria",
    "cell wall",
    "antibiotics",
    "lab methods"
  ],
  "info": {
    "text": "Why one 1884 staining trick still sorts the bacterial world in two, and what that split decides about which drugs can reach their target.",
    "citations": [
      {
        "title": "The bacterial cell envelope",
        "author": "Silhavy, Thomas J.; Kahne, Daniel; Walker, Suzanne",
        "publisher": "Cold Spring Harbor Perspectives in Biology 2(5): a000414",
        "year": "2010",
        "url": "https://doi.org/10.1101/cshperspect.a000414"
      },
      {
        "title": "Über die isolierte Färbung der Schizomyceten in Schnitt- und Trockenpräparaten",
        "author": "Gram, Hans Christian",
        "publisher": "Fortschritte der Medizin 2",
        "year": "1884",
        "pages": "185–189"
      }
    ]
  },
  "clusters": [
    {
      "id": "gram-positive",
      "name": "Gram-positive",
      "color": "teal",
      "fact": "A Gram-positive wall can be 20 to 80 nanometres thick, up to forty layers of peptidoglycan with teichoic acids threaded through it. There is nothing outside that wall: it faces the world directly.",
      "terms": [
        "thick peptidoglycan",
        "teichoic acids",
        "Staphylococcus aureus",
        "Streptococcus"
      ],
      "seeds": [
        "thick peptidoglycan",
        "teichoic acids"
      ],
      "termInfo": {
        "thick peptidoglycan": "Dozens of stacked layers of the same mesh a Gram-negative cell has one or two of.",
        "teichoic acids": {
          "text": "Long negatively charged polymers threaded through the Gram-positive wall; some (lipoteichoic acids) anchor down into the membrane.",
          "links": [
            {
              "href": "wiki:Teichoic acid"
            }
          ]
        },
        "Staphylococcus aureus": {
          "text": "Grape-like clusters of cocci; the classic Gram-positive of skin and wound infections.",
          "links": [
            {
              "href": "wiki:Staphylococcus aureus"
            }
          ]
        },
        "Streptococcus": "Chains of cocci; strep throat and scarlet fever."
      },
      "info": {
        "text": "One membrane, then a thick wall. Stains purple.",
        "links": [
          {
            "href": "wiki:Gram-positive bacteria"
          }
        ]
      }
    },
    {
      "id": "gram-negative",
      "name": "Gram-negative",
      "color": "blue",
      "fact": "A Gram-negative wall is one or two layers thick and sits in the periplasm, sandwiched between the cytoplasmic membrane and an outer membrane whose outward face is lipopolysaccharide rather than phospholipid.",
      "terms": [
        "outer membrane",
        "lipopolysaccharide",
        "porins",
        "periplasm",
        "thin peptidoglycan",
        "Escherichia coli"
      ],
      "seeds": [
        "outer membrane",
        "lipopolysaccharide"
      ],
      "termInfo": {
        "outer membrane": "A second lipid bilayer outside the wall, found only in Gram-negatives.",
        "lipopolysaccharide": {
          "text": "The outer leaflet of the outer membrane. Its lipid A anchor is endotoxin, the trigger for septic shock when Gram-negative cells break apart in the bloodstream.",
          "links": [
            {
              "href": "wiki:Lipopolysaccharide"
            }
          ]
        },
        "porins": {
          "text": "Barrel-shaped channels through the outer membrane that let small water-soluble molecules pass: nutrients, and some antibiotics.",
          "links": [
            {
              "href": "wiki:Porin (protein)"
            }
          ]
        },
        "periplasm": {
          "text": "The compartment between the two membranes, where the thin wall sits and where beta-lactamases wait for incoming antibiotics.",
          "links": [
            {
              "href": "wiki:Periplasm"
            }
          ]
        },
        "thin peptidoglycan": "One or two layers, enough to hold shape but not enough to trap a dye.",
        "Escherichia coli": {
          "text": "The gut rod every microbiology lab keeps as its Gram-negative reference.",
          "links": [
            {
              "href": "wiki:Escherichia coli"
            }
          ]
        }
      },
      "info": {
        "text": "Two membranes with a thin wall between them. Stains pink.",
        "links": [
          {
            "href": "wiki:Gram-negative bacteria"
          }
        ]
      }
    },
    {
      "id": "staining-procedure",
      "name": "The staining procedure",
      "color": "amber",
      "fact": "Every cell takes up crystal violet and iodine. What the procedure really tests is whether a cell can hold onto them through the alcohol wash; the counterstain only makes the cells that could not visible again.",
      "terms": [
        "crystal violet",
        "safranin",
        "Gram's iodine",
        "heat-fixed smear"
      ],
      "seeds": [
        "crystal violet",
        "safranin"
      ],
      "termInfo": {
        "crystal violet": {
          "text": "The primary stain. Every cell takes it up.",
          "links": [
            {
              "href": "wiki:Crystal violet"
            }
          ]
        },
        "safranin": {
          "text": "The counterstain, applied last; only cells the decolorizer emptied show its pink.",
          "links": [
            {
              "href": "wiki:Safranin"
            }
          ]
        },
        "Gram's iodine": {
          "text": "The mordant. Iodine binds crystal violet into a larger complex that is harder to wash out.",
          "links": [
            {
              "href": "wiki:Lugol's iodine"
            }
          ]
        },
        "heat-fixed smear": {
          "text": "Cells dried onto a slide and passed through a flame so they stay put through four washes.",
          "links": [
            {
              "href": "wiki:Fixation (histology)"
            }
          ]
        }
      },
      "info": {
        "text": "Hans Christian Gram's 1884 method, still the first test run on almost any bacterial sample.",
        "links": [
          {
            "href": "wiki:Gram stain"
          }
        ]
      }
    },
    {
      "id": "envelope-agents",
      "name": "Agents that attack the envelope",
      "color": "magenta",
      "fact": "None of these agents can tell Gram-positive from Gram-negative. What differs is access: a thick wall standing in the open, or a thin one hidden behind a second membrane.",
      "terms": [
        "penicillin",
        "lysozyme",
        "vancomycin",
        "polymyxin"
      ],
      "seeds": [
        "penicillin",
        "lysozyme"
      ],
      "termInfo": {
        "penicillin": {
          "text": "Blocks the enzymes that cross-link new peptidoglycan; a growing wall without cross-links bursts.",
          "links": [
            {
              "href": "wiki:Penicillin"
            }
          ]
        },
        "lysozyme": {
          "text": "An enzyme in tears, saliva, and egg white that cuts the sugar backbone of peptidoglycan.",
          "links": [
            {
              "href": "wiki:Lysozyme"
            }
          ]
        },
        "vancomycin": {
          "text": "Binds the tail of peptidoglycan building blocks so they cannot be added to the wall. Far too large to pass a porin.",
          "links": [
            {
              "href": "wiki:Vancomycin"
            }
          ]
        },
        "polymyxin": {
          "text": "A last-resort antibiotic that binds lipid A and tears open the outer membrane. Useless against bacteria that have no outer membrane.",
          "links": [
            {
              "href": "wiki:Polymyxin"
            }
          ]
        }
      },
      "info": {
        "text": "Antibiotics and enzymes whose target is the envelope itself, and whose reach depends on which envelope they meet.",
        "links": [
          {
            "href": "wiki:Bacterial cell structure"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "term": "peptidoglycan",
      "clusters": [
        0,
        1
      ],
      "fact": "Both envelopes are held in shape by the same mesh: sugar chains cross-linked by short peptides. The difference is dosage, dozens of layers in one and one or two in the other, and that difference is what the stain reads.",
      "info": {
        "text": "The polymer that gives nearly all bacteria their shape and keeps them from bursting under their own osmotic pressure.",
        "links": [
          {
            "href": "wiki:Peptidoglycan"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "thick peptidoglycan",
        "thin peptidoglycan"
      ]
    },
    {
      "term": "alcohol decolorizer",
      "clusters": [
        2,
        0,
        1
      ],
      "fact": "The decisive step. Alcohol dissolves the outer membrane's lipids and pulls the crystal violet–iodine complex out through the thin Gram-negative wall, leaving the cell colourless for safranin. The thick Gram-positive wall dehydrates and tightens around the complex instead, and the cell stays purple.",
      "relationKind": "evaluation",
      "idealTerms": [
        "crystal violet",
        "thick peptidoglycan",
        "outer membrane"
      ]
    },
    {
      "term": "permeability barrier",
      "clusters": [
        1,
        3
      ],
      "fact": "The outer membrane is a second gate. Bulky molecules such as lysozyme and vancomycin cannot get through it to the wall behind, which is why they work poorly on Gram-negatives. Polymyxin works precisely because it attacks that gate's lipopolysaccharide directly.",
      "relationKind": "dynamic",
      "idealTerms": [
        "outer membrane",
        "vancomycin"
      ]
    },
    {
      "term": "exposed cell wall",
      "clusters": [
        0,
        3
      ],
      "fact": "With no outer membrane in the way, the thick Gram-positive wall is reachable from outside: by lysozyme in tears and saliva, by penicillin blocking its cross-links, by vancomycin capping its building blocks. Fleming's mould worked first against staphylococci for exactly this reason.",
      "relationKind": "dynamic",
      "idealTerms": [
        "thick peptidoglycan",
        "penicillin"
      ]
    }
  ],
  "lenses": [
    {
      "id": "retained-dyes",
      "prompt": "Which reagents is a Gram-positive cell still holding when the procedure ends?",
      "explanation": "The crystal violet–iodine complex is trapped in the thick, alcohol-tightened wall. Safranin is applied afterwards and does bind, but the darker purple masks it. The heat-fixed smear is the preparation, not a reagent.",
      "targets": [
        "crystal violet",
        "Gram's iodine"
      ],
      "reasons": {
        "crystal violet": "The primary stain, locked in once iodine enlarges it.",
        "Gram's iodine": "The mordant that made the complex too big to wash out."
      }
    },
    {
      "id": "wall-targets",
      "prompt": "Which agents act on peptidoglycan itself?",
      "explanation": "Lysozyme cuts the sugar backbone, penicillin blocks the peptide cross-links, and vancomycin caps the precursors before they can be added. Polymyxin never touches peptidoglycan; its target is the lipopolysaccharide of the outer membrane.",
      "targets": [
        "penicillin",
        "lysozyme",
        "vancomycin"
      ],
      "reasons": {
        "penicillin": "Stops cross-linking, so the wall is built but never braced.",
        "lysozyme": "Cuts the glycan chains directly.",
        "vancomycin": "Blocks the building blocks from being incorporated."
      }
    },
    {
      "id": "too-large-for-porins",
      "prompt": "Which agents are too large to fit through a porin?",
      "explanation": "Lysozyme is a protein and vancomycin a bulky glycopeptide; neither fits a porin, so an intact outer membrane keeps both away from the wall. Penicillin's family is small enough that many members pass through porins, which is why ampicillin works on E. coli even though penicillin G barely does. Polymyxin does not need to get past the outer membrane: the outer membrane is its target.",
      "targets": [
        "lysozyme",
        "vancomycin"
      ],
      "reasons": {
        "lysozyme": "A 14-kilodalton protein; porins pass molecules a twentieth that size.",
        "vancomycin": "A glycopeptide of about 1,450 daltons, well above the porin cutoff."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "optional",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "In 1884 Hans Christian Gram, working in a Berlin morgue, was trying to make bacteria visible in lung tissue and noticed that some kept his violet dye through an alcohol rinse while others let it go. He thought the method incomplete. It turned out to be the most durable test in microbiology, because the dye's behaviour tracks a deep divide in how bacteria build their outer layers.\r\n\r\nThat divide matters far beyond the microscope. It decides which antibiotics can reach their target, which bacteria release endotoxin when they die, and why the first question a clinical lab asks about an isolate is still whether it is Gram-positive or Gram-negative."
    },
    "links": [
      {
        "href": "wiki:Hans Christian Gram"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "extraHigh"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "why-the-gram-stain-works",
      "puzzleRevision": "fnv1a32:7f5f03ed",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:thick peptidoglycan": {
          "x": 405.52,
          "y": 355.65,
          "pinned": false
        },
        "term:teichoic acids": {
          "x": 302.79,
          "y": 467.6,
          "pinned": false
        },
        "term:Staphylococcus aureus": {
          "x": 497.72,
          "y": 503.21,
          "pinned": false
        },
        "term:Streptococcus": {
          "x": 365.81,
          "y": 584.77,
          "pinned": false
        },
        "term:outer membrane": {
          "x": 630.1,
          "y": 205.53,
          "pinned": false
        },
        "term:lipopolysaccharide": {
          "x": 719.68,
          "y": 86.73,
          "pinned": false
        },
        "term:porins": {
          "x": 690.42,
          "y": 298.71,
          "pinned": false
        },
        "term:periplasm": {
          "x": 750.07,
          "y": 216.25,
          "pinned": false
        },
        "term:thin peptidoglycan": {
          "x": 481.38,
          "y": 209.62,
          "pinned": false
        },
        "term:Escherichia coli": {
          "x": 564.79,
          "y": 78.87,
          "pinned": false
        },
        "term:crystal violet": {
          "x": 704.66,
          "y": 422.11,
          "pinned": false
        },
        "term:safranin": {
          "x": 746.13,
          "y": 531.83,
          "pinned": false
        },
        "term:Gram's iodine": {
          "x": 795.13,
          "y": 324.56,
          "pinned": false
        },
        "term:heat-fixed smear": {
          "x": 843.22,
          "y": 455.34,
          "pinned": false
        },
        "term:penicillin": {
          "x": 187.69,
          "y": 213.87,
          "pinned": false
        },
        "term:lysozyme": {
          "x": 124.24,
          "y": 297.15,
          "pinned": false
        },
        "term:vancomycin": {
          "x": 260.65,
          "y": 130.22,
          "pinned": false
        },
        "term:polymyxin": {
          "x": 80.16,
          "y": 205.67,
          "pinned": false
        },
        "term:peptidoglycan": {
          "x": 336.43,
          "y": 223.84,
          "pinned": false
        },
        "term:alcohol decolorizer": {
          "x": 572.96,
          "y": 346.33,
          "pinned": false
        },
        "term:permeability barrier": {
          "x": 404.42,
          "y": 60.64,
          "pinned": false
        },
        "term:exposed cell wall": {
          "x": 245.61,
          "y": 333.65,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3957.52,
        "score": 3957.519712633985
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:17:19.615Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "why-the-gram-stain-works",
      "puzzleRevision": "fnv1a32:7f5f03ed",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 198.96,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 597.04,
          "pinned": false
        },
        "cluster:2": {
          "x": 841.56,
          "y": 398,
          "pinned": false
        },
        "cluster:3": {
          "x": 208.44,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:peptidoglycan": {
          "x": 474,
          "y": 398,
          "pinned": false
        },
        "term:alcohol decolorizer": {
          "x": 630.52,
          "y": 398,
          "pinned": false
        },
        "term:permeability barrier": {
          "x": 241.07,
          "y": 549.56,
          "pinned": false
        },
        "term:exposed cell wall": {
          "x": 421.88,
          "y": 353.64,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "thick peptidoglycan",
          "teichoic acids",
          "Staphylococcus aureus",
          "Streptococcus"
        ],
        "cluster:1": [
          "outer membrane",
          "lipopolysaccharide",
          "porins",
          "periplasm",
          "thin peptidoglycan",
          "Escherichia coli"
        ],
        "cluster:2": [
          "crystal violet",
          "safranin",
          "Gram's iodine",
          "heat-fixed smear"
        ],
        "cluster:3": [
          "penicillin",
          "lysozyme",
          "vancomycin",
          "polymyxin"
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
        "totalLength": 700.9735871794317
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:17:22.275Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "why-the-gram-stain-works",
      "puzzleRevision": "fnv1a32:7f5f03ed",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:thick peptidoglycan": {
          "x": 382.16,
          "y": 214.67
        },
        "term:teichoic acids": {
          "x": 464.63,
          "y": 39.04
        },
        "term:Staphylococcus aureus": {
          "x": 688.55,
          "y": 107.23
        },
        "term:Streptococcus": {
          "x": 624.15,
          "y": 35.03
        },
        "term:outer membrane": {
          "x": 721.04,
          "y": 530.78
        },
        "term:lipopolysaccharide": {
          "x": 883.3,
          "y": 383.99
        },
        "term:porins": {
          "x": 848.23,
          "y": 151.48
        },
        "term:periplasm": {
          "x": 802.59,
          "y": 447
        },
        "term:thin peptidoglycan": {
          "x": 629.35,
          "y": 210.77
        },
        "term:Escherichia coli": {
          "x": 694.34,
          "y": 299.12
        },
        "term:crystal violet": {
          "x": 456.48,
          "y": 449.6
        },
        "term:safranin": {
          "x": 255.57,
          "y": 459.84
        },
        "term:Gram's iodine": {
          "x": 382.39,
          "y": 320.58
        },
        "term:heat-fixed smear": {
          "x": 353.69,
          "y": 504.81
        },
        "term:penicillin": {
          "x": 51.5,
          "y": 191.1
        },
        "term:lysozyme": {
          "x": 45.2,
          "y": 343.96
        },
        "term:vancomycin": {
          "x": 86.2,
          "y": 430.03
        },
        "term:polymyxin": {
          "x": 168.67,
          "y": 169.29
        },
        "term:peptidoglycan": {
          "x": 555.66,
          "y": 277.09
        },
        "term:alcohol decolorizer": {
          "x": 566.02,
          "y": 368.56
        },
        "term:permeability barrier": {
          "x": 323.38,
          "y": 583.57
        },
        "term:exposed cell wall": {
          "x": 199.81,
          "y": 67.09
        },
        "cluster:0": {
          "x": 508.71,
          "y": 143.1
        },
        "cluster:1": {
          "x": 799.69,
          "y": 210.51
        },
        "cluster:2": {
          "x": 320.7,
          "y": 380.64
        },
        "cluster:3": {
          "x": 198.27,
          "y": 272.09
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T20:31:35.409Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T02:17:16.895Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
