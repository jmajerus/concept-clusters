// Generated from content/puzzles/power-without-a-center.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "power-without-a-center",
  "title": "Power Without a Center",
  "category": "critical-theory-cultural-studies",
  "categories": [
    "critical-theory-cultural-studies",
    "political-science",
    "philosophy"
  ],
  "subcategories": {
    "philosophy": "political-philosophy"
  },
  "info": {
    "text": "Michel Foucault's account of power as a decentered, productive network rather than a possession held by a sovereign, a class, or a state -- and of resistance as sharing that same dispersed, centerless shape.",
    "links": [
      {
        "href": "wiki:Michel Foucault"
      }
    ]
  },
  "clusters": [
    {
      "id": "not-a-possession",
      "name": "Not a Possession",
      "color": "teal",
      "fact": "Foucault flatly rejects a whole tradition of thinking about power as a possession -- something a sovereign, a class, or a state simply holds, appropriates, or transfers like a piece of wealth. Power is instead exercised through a net-like organization with no single center, reaching capillary-style into the smallest interactions rather than radiating down from one sovereign point.",
      "terms": [
        "exercised, not possessed",
        "no single center",
        "a net-like organization",
        "capillary power"
      ],
      "seeds": [
        "exercised, not possessed",
        "no single center"
      ],
      "info": {
        "text": "Foucault's rejection of power as a possession held by a sovereign, class, or state -- power instead functions as a decentered network with no single point of origin.",
        "links": [
          {
            "href": "wiki:The History of Sexuality"
          }
        ]
      }
    },
    {
      "id": "power-produces",
      "name": "Power Produces",
      "color": "magenta",
      "fact": "Foucault's second major break: power is not fundamentally repressive, a force that only says no. It produces -- it produces knowledge, identities, and the very categories through which people understand themselves, which is exactly what his coinage power/knowledge is meant to capture: the two are not opposed, they constitute each other, generating the regimes of truth and discourse that decide what even counts as a sayable, knowable claim in the first place.",
      "terms": [
        "productive power",
        "power/knowledge",
        "regimes of truth",
        "discourse"
      ],
      "seeds": [
        "productive power",
        "power/knowledge"
      ],
      "info": {
        "text": "Foucault's argument that power is productive rather than purely repressive: it generates knowledge, identities, and the accepted categories of truth, rather than only prohibiting or forbidding.",
        "links": [
          {
            "href": "wiki:The History of Sexuality"
          }
        ]
      }
    },
    {
      "id": "resistance-without-a-center",
      "name": "Resistance Without a Center",
      "color": "cyan",
      "fact": "Resistance gets the same treatment as power itself: Foucault insists that wherever there is power, there is resistance, and that this resistance is never external to power but its constant, odd term -- not one organized opposition (there is, he says, no single locus of great Refusal) but a swarm of mobile, plural points of resistance scattered through the same net-like field power itself occupies.",
      "terms": [
        "points of resistance",
        "coextensive with power",
        "no single locus of revolt",
        "the odd term"
      ],
      "seeds": [
        "points of resistance",
        "coextensive with power"
      ],
      "info": {
        "text": "Foucault's claim that resistance shares power's own decentered structure: never a single organized opposition, but a plurality of mobile points scattered throughout the same network power occupies.",
        "links": [
          {
            "href": "wiki:The History of Sexuality"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-same-shape",
      "term": "the same shape",
      "clusters": [
        0,
        2
      ],
      "fact": "Foucault gives resistance the exact same structure he gives power: just as power has no single center but forms a dense net, the many points of resistance scattered through that net form an equally decentered, dispersed pattern -- there is no more a single seat of resistance than there is a single seat of power.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "no single center",
        "no single locus of revolt"
      ]
    },
    {
      "id": "bridge-immanent",
      "term": "immanent",
      "clusters": [
        0,
        1
      ],
      "fact": "Power's productiveness and its lack of any single center are the same fact seen from two angles: because power is not a possession radiating from one point, it has to work by being immanent in the ordinary relationships -- knowledge, discourse, the professions, the family -- that it also, in the same move, actively produces.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-strategic-codification",
      "term": "strategic codification",
      "clusters": [
        1,
        2
      ],
      "fact": "Discourse and resistance turn out to be the same kind of material for Foucault: just as a regime of truth is assembled from many small, locally produced claims rather than handed down whole, a revolution becomes possible only through what he calls the strategic codification of many small, dispersed points of resistance into something coordinated.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "discourse",
        "points of resistance"
      ]
    }
  ],
  "lenses": [
    {
      "id": "decentered-by-design",
      "prompt": "Which of these describe something with no single center or locus, distributed instead across a dispersed network?",
      "explanation": "A net-like organization and capillary power both describe power's own lack of any single seat -- it does not radiate down from one point but reaches, thread-like, into the smallest interactions everywhere at once. No single locus of revolt says the same thing about resistance: exactly because power has this shape, nothing that opposes it can be gathered into one place either.",
      "targets": [
        "a net-like organization",
        "no single locus of revolt",
        "capillary power"
      ],
      "reasons": {
        "a net-like organization": "Power's own shape: threads reaching everywhere rather than radiating from one point.",
        "capillary power": "The fine-grained reach that follows from having no single center: power gets everywhere because it starts nowhere in particular.",
        "no single locus of revolt": "The same absence of a center, applied to resistance instead of power."
      }
    },
    {
      "id": "what-power-generates",
      "prompt": "Which of these describe something power actively creates, rather than something it simply prohibits or takes away?",
      "explanation": "Productive power and regimes of truth both name something power builds rather than merely forbids: it does not just say no, it manufactures the accepted categories, identities, and truths a society lives by. Capillary power names the reach that makes this possible -- productive power is not a single factory turning out truths from above, it is generated at the smallest, most local points throughout the whole network.",
      "targets": [
        "productive power",
        "regimes of truth",
        "capillary power"
      ],
      "reasons": {
        "capillary power": "The local, small-scale reach through which productive power is actually generated, rather than imposed from above.",
        "productive power": "The core claim: power's main business is manufacturing categories, identities, and truths, not just forbidding things.",
        "regimes of truth": "What productive power actually generates: the accepted, sayable truths a given society lives by."
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
      "puzzleId": "power-without-a-center",
      "puzzleRevision": "fnv1a32:6a91366a",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:exercised, not possessed": {
          "x": 491.78,
          "y": 203.64,
          "pinned": false
        },
        "term:no single center": {
          "x": 334.28,
          "y": 131.01,
          "pinned": false
        },
        "term:a net-like organization": {
          "x": 453.27,
          "y": 23,
          "pinned": false
        },
        "term:capillary power": {
          "x": 570.75,
          "y": 75.98,
          "pinned": false
        },
        "term:productive power": {
          "x": 409.16,
          "y": 357.92,
          "pinned": false
        },
        "term:power/knowledge": {
          "x": 570.75,
          "y": 339.27,
          "pinned": false
        },
        "term:regimes of truth": {
          "x": 514.86,
          "y": 437,
          "pinned": false
        },
        "term:discourse": {
          "x": 330.43,
          "y": 437,
          "pinned": false
        },
        "term:points of resistance": {
          "x": 85,
          "y": 266.95,
          "pinned": false
        },
        "term:coextensive with power": {
          "x": 91.3,
          "y": 437,
          "pinned": false
        },
        "term:no single locus of revolt": {
          "x": 161.42,
          "y": 96.69,
          "pinned": false
        },
        "term:the odd term": {
          "x": 59.8,
          "y": 137.44,
          "pinned": false
        },
        "term:the same shape": {
          "x": 292.79,
          "y": 23,
          "pinned": false
        },
        "term:immanent": {
          "x": 350.59,
          "y": 250.3,
          "pinned": false
        },
        "term:strategic codification": {
          "x": 241.91,
          "y": 342.46,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2750.71,
        "score": 2750.711817998413
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:21:03.323Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "power-without-a-center",
      "puzzleRevision": "fnv1a32:6a91366a",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 720.59,
          "y": 256.53,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 440.94,
          "pinned": false
        },
        "cluster:2": {
          "x": 239.41,
          "y": 256.53,
          "pinned": false
        }
      },
      "bridges": {
        "term:the same shape": {
          "x": 480,
          "y": 256.53,
          "pinned": false
        },
        "term:immanent": {
          "x": 673.84,
          "y": 422.27,
          "pinned": false
        },
        "term:strategic codification": {
          "x": 263.54,
          "y": 444.9,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "exercised, not possessed",
          "no single center",
          "a net-like organization",
          "capillary power"
        ],
        "cluster:1": [
          "productive power",
          "power/knowledge",
          "regimes of truth",
          "discourse"
        ],
        "cluster:2": [
          "points of resistance",
          "coextensive with power",
          "no single locus of revolt",
          "the odd term"
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
        "totalLength": 435.94062826019353
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:21:06.119Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "power-without-a-center",
      "puzzleRevision": "fnv1a32:6a91366a",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:exercised, not possessed": {
          "x": 408.44,
          "y": 22
        },
        "term:no single center": {
          "x": 364.49,
          "y": 193.09
        },
        "term:a net-like organization": {
          "x": 615.83,
          "y": 22
        },
        "term:capillary power": {
          "x": 693.97,
          "y": 174.35
        },
        "term:productive power": {
          "x": 889.6,
          "y": 382.64
        },
        "term:power/knowledge": {
          "x": 892.75,
          "y": 532.26
        },
        "term:regimes of truth": {
          "x": 759.14,
          "y": 598
        },
        "term:discourse": {
          "x": 628.59,
          "y": 598
        },
        "term:points of resistance": {
          "x": 441.26,
          "y": 558.63
        },
        "term:coextensive with power": {
          "x": 261.47,
          "y": 598
        },
        "term:no single locus of revolt": {
          "x": 417.83,
          "y": 366.18
        },
        "term:the odd term": {
          "x": 110.63,
          "y": 547.83
        },
        "term:the same shape": {
          "x": 579.17,
          "y": 294.05
        },
        "term:immanent": {
          "x": 697.74,
          "y": 318.69
        },
        "term:strategic codification": {
          "x": 595.51,
          "y": 458.13
        },
        "cluster:0": {
          "x": 514.18,
          "y": 163.35
        },
        "cluster:1": {
          "x": 760.8,
          "y": 451.94
        },
        "cluster:2": {
          "x": 204.86,
          "y": 400.55
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:21:09.067Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:21:00.455Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
