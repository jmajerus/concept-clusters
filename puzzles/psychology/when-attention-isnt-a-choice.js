// Generated from content/puzzles/when-attention-isnt-a-choice.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "when-attention-isnt-a-choice",
  "title": "When Attention Isn't a Choice",
  "category": "psychology",
  "categories": [
    "psychology",
    "economics"
  ],
  "subcategories": {
    "economics": "microeconomics",
    "psychology": "cognitive-psychology"
  },
  "info": {
    "text": "Behavioral economics research showing that scarcity itself depletes the cognitive bandwidth available for attention and self-control -- evidence used to challenge theories that treat attentional discipline as equally available to everyone, regardless of material circumstances.",
    "links": [
      {
        "href": "wiki:Scarcity: Why Having Too Little Means So Much"
      }
    ],
    "citations": [
      {
        "title": "Poverty Impedes Cognitive Function",
        "author": "Mani, Anandi, Mullainathan, Sendhil, Shafir, Eldar, and Zhao, Jiaying",
        "publisher": "Science, 341(6149)",
        "year": "2013",
        "pages": "976-980"
      },
      {
        "title": "Scarcity: Why Having Too Little Means So Much",
        "author": "Mullainathan, Sendhil, and Shafir, Eldar",
        "publisher": "Henry Holt and Co.",
        "year": "2013"
      },
      {
        "title": "Review: Flow -- The Psychology of Optimal Experience",
        "author": "Covington, Nick",
        "publisher": "Human Restoration Project",
        "year": "2021",
        "url": "https://www.humanrestorationproject.org/writing/review-flow-the-psychology-of-optimal-experience"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-bandwidth-tax",
      "name": "The Bandwidth Tax",
      "color": "amber",
      "fact": "Testing the same Tamil Nadu sugarcane farmers before and after harvest, Mani, Mullainathan, Shafir, and Zhao found that being poor -- not being a different kind of person -- cost their fluid intelligence, measured with Raven's matrices, an amount comparable to losing a full night's sleep.",
      "terms": [
        "cognitive bandwidth",
        "sugarcane farmers",
        "pre-harvest scarcity",
        "fluid intelligence"
      ],
      "seeds": [
        "cognitive bandwidth",
        "sugarcane farmers"
      ],
      "info": {
        "text": "The 2013 study and the broader research program on scarcity's cognitive costs that grew out of it.",
        "links": [
          {
            "href": "wiki:Scarcity: Why Having Too Little Means So Much"
          }
        ]
      }
    },
    {
      "id": "tunneling",
      "name": "Tunneling",
      "color": "blue",
      "fact": "Mullainathan and Shafir describe scarcity as producing a 'tunnel': the pressing shortage captures attention so completely that other obligations and opportunities, however important, fall outside the tunnel's edge and go unattended -- not from carelessness, but because there is no spare bandwidth left to notice them.",
      "terms": [
        "tunneling",
        "financial preoccupation",
        "narrowed focus",
        "neglected tasks"
      ],
      "seeds": [
        "tunneling",
        "financial preoccupation"
      ],
      "info": {
        "text": "The book-length elaboration of the bandwidth-tax finding, extended to time, food, and loneliness as well as money.",
        "links": [
          {
            "href": "wiki:Scarcity: Why Having Too Little Means So Much"
          }
        ]
      }
    },
    {
      "id": "limits-of-attentional-control",
      "name": "The Limits of Attentional Control",
      "color": "brown",
      "fact": "Csikszentmihalyi argued that attention is 'ours to do with as we please,' and that psychic entropy is chiefly a failure of discipline. Critics reply that this reverses the arrow he needed: scarcity itself depletes the bandwidth available for that discipline, so two people are never starting the exercise of attentional control from the same place.",
      "terms": [
        "disciplined attention",
        "material conditions",
        "reversed causal arrow",
        "unequal starting bandwidth"
      ],
      "seeds": [
        "disciplined attention",
        "material conditions"
      ],
      "info": {
        "text": "The theory this cluster directly challenges: that attentional discipline is a freely available choice, independent of a person's material circumstances.",
        "links": [
          {
            "href": "wiki:Flow (psychology)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-finite-bandwidth",
      "term": "finite bandwidth",
      "clusters": [
        0,
        1
      ],
      "fact": "Both concepts describe the same finite resource under strain: the bandwidth tax measures how much cognitive capacity scarcity actually removes, while tunneling describes what the remaining capacity does under pressure -- narrowing around the shortage itself.",
      "relationKind": "foundation",
      "idealTerms": [
        "cognitive bandwidth",
        "tunneling"
      ]
    },
    {
      "id": "bridge-evidence-against-free-attention",
      "term": "evidence against free attention",
      "clusters": [
        0,
        2
      ],
      "fact": "The sugarcane farmer result is the evidence the critique invokes directly: if the same farmer's fluid intelligence and self-control measurably improve after harvest with nothing else in their life changed except money, attentional discipline cannot be the free-standing variable Csikszentmihalyi described -- it is downstream of how much bandwidth scarcity has already taken.",
      "relationKind": "evaluation",
      "idealTerms": [
        "sugarcane farmers",
        "material conditions"
      ]
    }
  ],
  "lenses": [
    {
      "id": "observed-not-theorized",
      "prompt": "Which concepts describe something actually measured, felt, or observed in real people, rather than the theoretical construct used to name or explain it?",
      "explanation": "These six are the raw phenomena: real farmers, a real season of scarcity, a measured drop in fluid intelligence, and the felt experience of a mind pulled toward one preoccupation while other tasks slip. 'Cognitive bandwidth' and 'tunneling' are the theoretical vocabulary built to explain these observations -- and the third cluster is a further step removed again, using both to argue against a rival theory.",
      "targets": [
        "sugarcane farmers",
        "pre-harvest scarcity",
        "fluid intelligence",
        "financial preoccupation",
        "narrowed focus",
        "neglected tasks"
      ],
      "reasons": {
        "fluid intelligence": "This is the specific capacity Raven's matrices measured -- an observed drop, not the explanatory construct (cognitive bandwidth) built to account for it.",
        "neglected tasks": "This names what a tunneled person actually failed to do, not the tunneling mechanism itself."
      }
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "when-attention-isnt-a-choice",
      "puzzleRevision": "fnv1a32:79f04417",
      "board": {
        "width": 670,
        "height": 480
      },
      "nodes": {
        "term:cognitive bandwidth": {
          "x": 463.17,
          "y": 23,
          "pinned": false
        },
        "term:sugarcane farmers": {
          "x": 455.93,
          "y": 165.58,
          "pinned": false
        },
        "term:pre-harvest scarcity": {
          "x": 585,
          "y": 258.9,
          "pinned": false
        },
        "term:fluid intelligence": {
          "x": 591.3,
          "y": 92.23,
          "pinned": false
        },
        "term:tunneling": {
          "x": 233.62,
          "y": 165.66,
          "pinned": false
        },
        "term:financial preoccupation": {
          "x": 94.45,
          "y": 181.12,
          "pinned": false
        },
        "term:narrowed focus": {
          "x": 66.1,
          "y": 23,
          "pinned": false
        },
        "term:neglected tasks": {
          "x": 197.84,
          "y": 23,
          "pinned": false
        },
        "term:disciplined attention": {
          "x": 225.91,
          "y": 306.17,
          "pinned": false
        },
        "term:material conditions": {
          "x": 399.52,
          "y": 316.57,
          "pinned": false
        },
        "term:reversed causal arrow": {
          "x": 310.05,
          "y": 457,
          "pinned": false
        },
        "term:unequal starting bandwidth": {
          "x": 103.9,
          "y": 457,
          "pinned": false
        },
        "term:finite bandwidth": {
          "x": 328.53,
          "y": 84.37,
          "pinned": false
        },
        "term:evidence against free attention": {
          "x": 544.76,
          "y": 457,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2838,
        "score": 2838.001279742817
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:17:20.394Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "when-attention-isnt-a-choice",
      "puzzleRevision": "fnv1a32:79f04417",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 505,
          "y": 472.2,
          "pinned": false
        },
        "cluster:1": {
          "x": 756.15,
          "y": 263.4,
          "pinned": false
        },
        "cluster:2": {
          "x": 253.85,
          "y": 263.4,
          "pinned": false
        }
      },
      "bridges": {
        "term:finite bandwidth": {
          "x": 726.66,
          "y": 407.6,
          "pinned": false
        },
        "term:evidence against free attention": {
          "x": 253.78,
          "y": 419.85,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "cognitive bandwidth",
          "sugarcane farmers",
          "pre-harvest scarcity",
          "fluid intelligence"
        ],
        "cluster:1": [
          "tunneling",
          "financial preoccupation",
          "narrowed focus",
          "neglected tasks"
        ],
        "cluster:2": [
          "disciplined attention",
          "material conditions",
          "reversed causal arrow",
          "unequal starting bandwidth"
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
        "totalLength": 270.5416001804784
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:17:23.156Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "when-attention-isnt-a-choice",
      "puzzleRevision": "fnv1a32:79f04417",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:cognitive bandwidth": {
          "x": 347.7,
          "y": 275.1
        },
        "term:sugarcane farmers": {
          "x": 360.36,
          "y": 439.99
        },
        "term:pre-harvest scarcity": {
          "x": 247.52,
          "y": 565.27
        },
        "term:fluid intelligence": {
          "x": 96.08,
          "y": 484.26
        },
        "term:tunneling": {
          "x": 600.12,
          "y": 247.25
        },
        "term:financial preoccupation": {
          "x": 615.62,
          "y": 22
        },
        "term:narrowed focus": {
          "x": 783.24,
          "y": 39.6
        },
        "term:neglected tasks": {
          "x": 796.84,
          "y": 182.31
        },
        "term:disciplined attention": {
          "x": 923.85,
          "y": 323.84
        },
        "term:material conditions": {
          "x": 500.8,
          "y": 352.85
        },
        "term:reversed causal arrow": {
          "x": 903.6,
          "y": 507.06
        },
        "term:unequal starting bandwidth": {
          "x": 744.74,
          "y": 628
        },
        "term:finite bandwidth": {
          "x": 484.22,
          "y": 187.46
        },
        "term:evidence against free attention": {
          "x": 523.13,
          "y": 561.25
        },
        "cluster:0": {
          "x": 215.56,
          "y": 374.49
        },
        "cluster:1": {
          "x": 670.48,
          "y": 164.53
        },
        "cluster:2": {
          "x": 712.86,
          "y": 392.97
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:17:26.181Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "auto",
    "savedAt": "2026-10-08T01:17:17.042Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
