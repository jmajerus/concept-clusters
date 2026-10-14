// Generated from content/puzzles/acids-bases-and-ph.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "acids-bases-and-ph",
  "title": "Acids, bases, and pH",
  "category": "chemistry",
  "tags": [
    "chemistry",
    "acids",
    "bases",
    "pH"
  ],
  "info": {
    "text": "Acids donate protons and bases accept them; how completely they do so is their strength. In water that transfer sets hydronium and hydroxide concentrations, which pH reports on a logarithmic scale.",
    "citations": [
      {
        "title": "Brønsted-Lowry Acids and Bases",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases"
      },
      {
        "title": "pH and pOH",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh"
      },
      {
        "title": "Relative Strengths of Acids and Bases",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-donating-protons",
      "name": "Donating protons",
      "color": "teal",
      "fact": "An acid is a proton donor; in water the donated hydrogen appears as hydronium. A strong acid donates essentially all its protons to water, a weak acid only a fraction, and the acid ionization constant measures how far the donation goes.",
      "terms": [
        "acid",
        "strong acid",
        "hydronium",
        "weak acid",
        "acid ionization constant"
      ],
      "seeds": [
        "acid",
        "strong acid"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Acid"
          },
          {
            "href": "wiki:Acid strength"
          }
        ]
      }
    },
    {
      "id": "cluster-accepting-protons",
      "name": "Accepting protons",
      "color": "blue",
      "fact": "A base is a proton acceptor; in water that uptake produces hydroxide. A strong base yields hydroxide completely, a weak base only partly, and the base ionization constant measures how far the uptake goes.",
      "terms": [
        "base",
        "strong base",
        "hydroxide",
        "weak base",
        "base ionization constant"
      ],
      "seeds": [
        "base",
        "strong base"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Base (chemistry)"
          }
        ]
      }
    },
    {
      "id": "cluster-ph-scale",
      "name": "The pH scale",
      "color": "amber",
      "fact": "pH uses a logarithmic scale to report hydronium concentration; pOH reports hydroxide the same way, and a neutral solution is the point where those concentrations are equal.",
      "terms": [
        "pH",
        "neutral solution",
        "pOH",
        "logarithmic scale"
      ],
      "seeds": [
        "pH",
        "neutral solution"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:pH"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-conjugate-pair",
      "term": "conjugate pair",
      "clusters": [
        0,
        1
      ],
      "fact": "When an acid donates a proton, the remainder is a base; the protonated base is an acid. The two species that differ by that one proton are a conjugate pair, and their strengths run opposite: Ka × Kb = Kw, so the stronger the acid, the weaker its conjugate base.",
      "info": {
        "links": [
          {
            "href": "wiki:Conjugate acid"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "acid",
        "base"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    },
    {
      "id": "bridge-amphiprotic",
      "term": "amphiprotic",
      "clusters": [
        0,
        1
      ],
      "fact": "Water is amphiprotic: it accepts a proton from an acid to become hydronium and donates a proton to a base to leave hydroxide.",
      "info": {
        "links": [
          {
            "href": "wiki:Amphoterism"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "hydronium",
        "hydroxide"
      ]
    },
    {
      "id": "bridge-ion-product-of-water",
      "term": "ion-product of water",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Water's autoionization gives the ion-product of water, Kw = [H3O+][OH−], which ties hydronium and hydroxide together so that raising one lowers the other and a neutral solution sits where they are equal.",
      "info": {
        "links": [
          {
            "href": "wiki:Self-ionization of water"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "hydronium",
        "hydroxide",
        "neutral solution"
      ]
    }
  ],
  "lenses": [
    {
      "id": "transferring-a-proton",
      "prompt": "Which concepts name the roles when a proton moves from one species to another?",
      "explanation": "An acid is the proton donor and a base is the proton acceptor. Hydronium and hydroxide are the aqueous ions that transfer produces, and strong or weak describes how far it goes, not which role a species plays.",
      "targets": [
        "acid",
        "base"
      ]
    },
    {
      "id": "how-far-the-transfer-goes",
      "prompt": "Which concepts describe how completely an added acid or base reacts with water?",
      "explanation": "Strong and weak name complete versus partial reaction with water, and the acid and base ionization constants put a number on how far it goes. The ion-product of water describes water's own autoionization, not the reaction of an added acid or base.",
      "targets": [
        "strong acid",
        "weak acid",
        "strong base",
        "weak base",
        "acid ionization constant",
        "base ionization constant"
      ]
    },
    {
      "id": "log-of-one-ion",
      "prompt": "Which concepts are the negative logarithm of a single ion's concentration?",
      "explanation": "pH is −log[H3O+] and pOH is −log[OH−]. The ion-product of water multiplies both concentrations instead of taking a logarithm of one. The logarithmic scale is the method, not a value, and a neutral solution is a condition on that scale.",
      "targets": [
        "pH",
        "pOH"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "building-atoms-and-ions",
        "reason": "Review how charge on an ion is counted before treating H+ as a transferred proton."
      },
      {
        "id": "energy-rate-and-equilibrium",
        "reason": "Treat Kw, Ka, and Kb as equilibrium constants that fix how far each proton transfer goes."
      },
      {
        "id": "reading-chemical-reactions",
        "reason": "Write acid and base ionization as balanced equations with hydronium or hydroxide among the products."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "content": {
      "mediaType": "text/markdown",
      "text": "In the Brønsted-Lowry picture, acid-base chemistry is about one thing moving: a proton, a hydrogen ion stripped of its electron. An acid is a proton donor and a base is a proton acceptor. A proton never sits alone in water. When an acid gives one up, a water molecule takes it and becomes hydronium (H3O+). When a base takes a proton from water, the water left behind is hydroxide (OH−). Water can play either part, which makes it amphiprotic. Every transfer pairs the two roles: once an acid has given up its proton, what remains could take it back, so it is a base. The two species that differ by that single proton are a conjugate pair.\r\n\r\nAcids and bases differ in how far that transfer goes. A strong acid such as hydrochloric acid gives up essentially every proton to water. A weak acid such as acetic acid gives up only a small fraction, and the rest stays as intact molecules in equilibrium with its ions. The acid ionization constant, Ka, measures how far an acid's reaction with water goes. The base ionization constant, Kb, does the same for a base. Strength runs opposite across a conjugate pair: the stronger an acid, the weaker its conjugate base.\r\n\r\nWater also transfers protons to itself, a process called autoionization. That sets a fixed relationship: the ion-product of water, Kw = [H3O+][OH−], stays constant at a given temperature, so adding hydronium pushes hydroxide down and the reverse. A neutral solution is the point where the two concentrations are equal. For any conjugate pair, Ka × Kb = Kw.\r\n\r\nThose concentrations span many powers of ten, so chemists report them on a logarithmic scale. pH is the negative logarithm of the hydronium concentration and pOH is the same measure for hydroxide. Each step of one pH unit is a tenfold change in hydronium, and a lower pH means more hydronium, so the solution is more acidic."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Cursor (Grok 4.6)",
        "model": "Cursor Grok 4.6"
      },
      {
        "name": "Claude Code (Claude Opus 5.5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "acids-bases-and-ph",
      "puzzleRevision": "fnv1a32:929cd616",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:acid": {
          "x": 628.8,
          "y": 192.77,
          "pinned": true
        },
        "term:strong acid": {
          "x": 710.98,
          "y": 131.21,
          "pinned": true
        },
        "term:hydronium": {
          "x": 401.57,
          "y": 191.3,
          "pinned": true
        },
        "term:weak acid": {
          "x": 728.01,
          "y": 243.43,
          "pinned": true
        },
        "term:acid ionization constant": {
          "x": 544.28,
          "y": 100,
          "pinned": false
        },
        "term:base": {
          "x": 620.31,
          "y": 426.26,
          "pinned": true
        },
        "term:strong base": {
          "x": 728.32,
          "y": 464.04,
          "pinned": true
        },
        "term:hydroxide": {
          "x": 398.07,
          "y": 428.43,
          "pinned": true
        },
        "term:weak base": {
          "x": 719.55,
          "y": 367.52,
          "pinned": true
        },
        "term:base ionization constant": {
          "x": 555.74,
          "y": 527.66,
          "pinned": true
        },
        "term:pH": {
          "x": 157.3,
          "y": 301.29,
          "pinned": true
        },
        "term:neutral solution": {
          "x": 160.52,
          "y": 213.6,
          "pinned": true
        },
        "term:pOH": {
          "x": 85.35,
          "y": 322,
          "pinned": true
        },
        "term:logarithmic scale": {
          "x": 155.68,
          "y": 397.98,
          "pinned": true
        },
        "term:conjugate pair": {
          "x": 625,
          "y": 317.35,
          "pinned": true
        },
        "term:amphiprotic": {
          "x": 482.69,
          "y": 302.53,
          "pinned": true
        },
        "term:ion-product of water": {
          "x": 305.44,
          "y": 305.74,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2701.14,
        "score": 2701.1374981989147
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:03:17.925Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "acids-bases-and-ph",
      "puzzleRevision": "fnv1a32:929cd616",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 299.66,
          "y": 266.45,
          "pinned": true
        },
        "cluster:1": {
          "x": 789.14,
          "y": 264.25,
          "pinned": true
        },
        "cluster:2": {
          "x": 539.85,
          "y": 610.69,
          "pinned": true
        }
      },
      "bridges": {
        "term:conjugate pair": {
          "x": 549.54,
          "y": 110.09,
          "pinned": true
        },
        "term:amphiprotic": {
          "x": 543.6,
          "y": 307.8,
          "pinned": true
        },
        "term:ion-product of water": {
          "x": 541.18,
          "y": 430.09,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "acid",
          "strong acid",
          "hydronium",
          "weak acid",
          "acid ionization constant"
        ],
        "cluster:1": [
          "base",
          "strong base",
          "hydroxide",
          "weak base",
          "base ionization constant"
        ],
        "cluster:2": [
          "pH",
          "neutral solution",
          "pOH",
          "logarithmic scale"
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
        "totalLength": 922.8917786514559
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:00:00.950Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "acids-bases-and-ph",
      "puzzleRevision": "fnv1a32:929cd616",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:acid": {
          "x": 781.26,
          "y": 484.66
        },
        "term:strong acid": {
          "x": 858.09,
          "y": 429.89
        },
        "term:hydronium": {
          "x": 572.29,
          "y": 331.93
        },
        "term:weak acid": {
          "x": 631.23,
          "y": 457.08
        },
        "term:acid ionization constant": {
          "x": 787.64,
          "y": 325.7
        },
        "term:base": {
          "x": 439.68,
          "y": 592.99
        },
        "term:strong base": {
          "x": 277.62,
          "y": 590.99
        },
        "term:hydroxide": {
          "x": 332.84,
          "y": 343.13
        },
        "term:weak base": {
          "x": 167.13,
          "y": 540.89
        },
        "term:base ionization constant": {
          "x": 141.01,
          "y": 430.19
        },
        "term:pH": {
          "x": 348.03,
          "y": 53.06
        },
        "term:neutral solution": {
          "x": 614.23,
          "y": 166.99
        },
        "term:pOH": {
          "x": 454.75,
          "y": 56.07
        },
        "term:logarithmic scale": {
          "x": 622.86,
          "y": 57.07
        },
        "term:conjugate pair": {
          "x": 592.42,
          "y": 545.38
        },
        "term:amphiprotic": {
          "x": 461.57,
          "y": 427.41
        },
        "term:ion-product of water": {
          "x": 461.89,
          "y": 249.29
        },
        "cluster:0": {
          "x": 705.65,
          "y": 398.03
        },
        "cluster:1": {
          "x": 295.66,
          "y": 492.86
        },
        "cluster:2": {
          "x": 450.04,
          "y": 127.69
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T15:52:43.418Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:36:50.220Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
