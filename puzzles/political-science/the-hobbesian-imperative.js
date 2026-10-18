// Generated from content/puzzles/the-hobbesian-imperative.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-hobbesian-imperative",
  "title": "The Hobbesian Imperative",
  "category": "political-science",
  "categories": [
    "political-science",
    "philosophy"
  ],
  "subcategories": {
    "philosophy": "political-philosophy",
    "political-science": "international-relations"
  },
  "tags": [
    "realism",
    "international relations"
  ],
  "info": {
    "text": "Three foundational texts that ground politics in power rather than moral aspiration: Machiavelli's princely necessity, Hobbes's lawless state of nature, and Morgenthau's realist doctrine of national interest.",
    "links": [
      {
        "href": "wiki:Realism (international relations)"
      }
    ],
    "citations": [
      {
        "title": "The Prince",
        "author": "Machiavelli, Niccolò",
        "year": "1532"
      },
      {
        "title": "Leviathan",
        "author": "Hobbes, Thomas",
        "year": "1651"
      },
      {
        "title": "Politics Among Nations: The Struggle for Power and Peace",
        "author": "Morgenthau, Hans J.",
        "publisher": "Alfred A. Knopf",
        "year": "1948"
      }
    ]
  },
  "clusters": [
    {
      "id": "machiavellis-prince",
      "name": "Machiavelli's Prince",
      "color": "teal",
      "fact": "Machiavelli severs statecraft from conventional morality entirely: a ruler's necessità to preserve the state can require actions no private person's virtue would permit.",
      "terms": [
        "feared rather than loved",
        "virtù",
        "fortuna",
        "necessità",
        "the lion and the fox"
      ],
      "seeds": [
        "feared rather than loved",
        "virtù"
      ],
      "termInfo": {
        "feared rather than loved": {
          "text": "Machiavelli's judgment that a prince who cannot be both should prefer being feared, since fear is a stabler foundation for obedience than love."
        },
        "fortuna": {
          "text": "The unpredictable turn of circumstance a ruler cannot control but must anticipate and bend toward advantage."
        },
        "necessità": {
          "text": "The plea of necessity that licenses a ruler to act against conventional morality when the survival of the state is at stake."
        },
        "the lion and the fox": {
          "text": "Machiavelli's image for the two capacities a ruler must combine: the fox's cunning to recognize traps, the lion's force to frighten off threats."
        },
        "virtù": {
          "text": "The distinct set of capacities — decisiveness, adaptability, controlled ruthlessness — a ruler needs to seize and hold power, deliberately distinct from private moral virtue.",
          "links": [
            {
              "href": "wiki:Virtù"
            }
          ]
        }
      }
    },
    {
      "id": "hobbes-leviathan",
      "name": "Hobbes's Leviathan",
      "color": "blue",
      "fact": "Hobbes reasons from a lawless state of nature to the conclusion that only a single, absolute sovereign — created and authorized by a social contract — can make peace possible at all.",
      "terms": [
        "state of nature",
        "social contract",
        "sovereign"
      ],
      "seeds": [
        "state of nature",
        "social contract"
      ],
      "termInfo": {
        "social contract": {
          "text": "The mutual agreement by which individuals in the state of nature surrender their right to self-governance to a common sovereign in exchange for peace and protection.",
          "links": [
            {
              "href": "wiki:Social contract"
            }
          ]
        },
        "sovereign": {
          "text": "The single, absolute authority Hobbes argues must hold undivided power for the social contract's peace to actually hold."
        },
        "state of nature": {
          "text": "Hobbes's hypothetical condition of humanity with no common power to keep everyone in awe — the baseline his politics reasons from.",
          "links": [
            {
              "href": "wiki:State of nature"
            }
          ]
        }
      }
    },
    {
      "id": "morgenthaus-realism",
      "name": "Morgenthau's Realism",
      "color": "amber",
      "fact": "Morgenthau formalizes realpolitik into a discipline: a nation's interest, defined specifically as power rather than ideology or morality, is what actually explains its foreign policy — and a stable balance of power is the closest substitute for a missing world sovereign.",
      "terms": [
        "balance of power",
        "six principles of realism",
        "interest defined as power"
      ],
      "seeds": [
        "balance of power",
        "six principles of realism"
      ],
      "termInfo": {
        "balance of power": {
          "text": "A distribution of power among states such that no single one can dominate the rest — realism's substitute for a missing sovereign above the state system.",
          "links": [
            {
              "href": "wiki:Balance of power (international relations)"
            }
          ]
        },
        "interest defined as power": {
          "text": "Morgenthau's key analytic move: read every state's action as a bid to acquire, maintain, or demonstrate power, rather than take its stated ideals at face value."
        },
        "six principles of realism": {
          "text": "Morgenthau's own six-point definition of political realism, laid out in Politics Among Nations, distinguishing it from moralistic and legalistic approaches to foreign policy."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-anarchy",
      "term": "anarchy",
      "clusters": [
        1,
        2
      ],
      "fact": "Realist international-relations theory borrows Hobbes's state of nature wholesale: with no common power standing above sovereign states, Morgenthau treats the international system itself as permanently anarchic, and a self-help balance of power as the nearest thing to Hobbes's absent sovereign.",
      "relationKind": "foundation",
      "idealTerms": [
        "state of nature",
        "balance of power"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-human-nature",
      "term": "human nature",
      "clusters": [
        0,
        1
      ],
      "fact": "Both thinkers start from the same pessimistic premise — that people are fundamentally self-interested and competitive — and refuse to found politics on any nobler assumption. Machiavelli builds a ruler's necessità on it; Hobbes builds an entire social order on preventing its worst consequences.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-raison-d-tat",
      "term": "raison d'état",
      "clusters": [
        0,
        2
      ],
      "fact": "Machiavelli's insistence that a prince may set aside conventional morality when the state's survival requires it becomes, four centuries later, Morgenthau's formal doctrine that a nation's interest — defined as power — is what actually governs its conduct, not its professed ideals.",
      "relationKind": "continuity",
      "idealTerms": [
        "necessità",
        "interest defined as power"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "absence-of-a-common-power",
      "prompt": "Which concepts describe what happens once there's no sovereign or common authority able to enforce order?",
      "explanation": "Hobbes derives the state of nature directly from the absence of a common power; the anarchy bridge names that same absence once it's projected onto relations between states, and Morgenthau's balance of power is realism's closest substitute for the missing sovereign — a self-help order improvised because no world government exists to impose one.",
      "targets": [
        "state of nature",
        "anarchy",
        "balance of power"
      ],
      "reasons": {
        "anarchy": "Names the same absence of common power once it's read onto the relations between states.",
        "balance of power": "Realism's improvised substitute for a sovereign that doesn't exist at the international level.",
        "state of nature": "The direct consequence, for Hobbes, of no one holding authority over anyone else."
      }
    },
    {
      "id": "necessity-over-conventional-morality",
      "prompt": "Which concepts assert that a ruler's or a nation's practical survival can override ordinary moral judgment?",
      "explanation": "Machiavelli's necessità and his preference for being feared over loved both license the prince to act against ordinary virtue when holding the state requires it. Morgenthau's interest defined as power makes the identical move at the level of nations, and the raison d'état bridge names the direct line connecting the two: a prince's necessity, formalized four centuries later into a nation's interest.",
      "targets": [
        "necessità",
        "feared rather than loved",
        "interest defined as power",
        "raison d'état"
      ],
      "reasons": {
        "feared rather than loved": "A concrete case of that override: obedience secured by fear rather than moral affection.",
        "interest defined as power": "Morgenthau's equivalent override at the level of the nation-state.",
        "necessità": "Machiavelli's own name for the plea that licenses acting against conventional morality.",
        "raison d'état": "Names the historical throughline from Machiavelli's necessity to Morgenthau's formalized doctrine."
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
      "puzzleId": "the-hobbesian-imperative",
      "puzzleRevision": "fnv1a32:98ca0549",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:feared rather than loved": {
          "x": 440.4,
          "y": 272.17,
          "pinned": false
        },
        "term:virtù": {
          "x": 404.37,
          "y": 406.78,
          "pinned": false
        },
        "term:fortuna": {
          "x": 579.74,
          "y": 314.55,
          "pinned": false
        },
        "term:necessità": {
          "x": 298.87,
          "y": 327.41,
          "pinned": false
        },
        "term:the lion and the fox": {
          "x": 527.78,
          "y": 437,
          "pinned": false
        },
        "term:state of nature": {
          "x": 489.35,
          "y": 94.7,
          "pinned": false
        },
        "term:social contract": {
          "x": 366.24,
          "y": 23,
          "pinned": false
        },
        "term:sovereign": {
          "x": 589.65,
          "y": 23,
          "pinned": false
        },
        "term:balance of power": {
          "x": 278.33,
          "y": 202.38,
          "pinned": false
        },
        "term:six principles of realism": {
          "x": 126.64,
          "y": 110.9,
          "pinned": false
        },
        "term:interest defined as power": {
          "x": 142.28,
          "y": 315.8,
          "pinned": false
        },
        "term:anarchy": {
          "x": 380.9,
          "y": 139.24,
          "pinned": false
        },
        "term:human nature": {
          "x": 580.2,
          "y": 191.76,
          "pinned": false
        },
        "term:raison d'état": {
          "x": 257.9,
          "y": 437,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2518.87,
        "score": 2518.867097803211
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:29:28.449Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-hobbesian-imperative",
      "puzzleRevision": "fnv1a32:98ca0549",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 690.49,
          "y": 375.86,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 202.28,
          "pinned": false
        },
        "cluster:2": {
          "x": 269.51,
          "y": 375.86,
          "pinned": false
        }
      },
      "bridges": {
        "term:anarchy": {
          "x": 301.22,
          "y": 215.53,
          "pinned": false
        },
        "term:human nature": {
          "x": 658.78,
          "y": 215.53,
          "pinned": false
        },
        "term:raison d'état": {
          "x": 480,
          "y": 375.86,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "feared rather than loved",
          "virtù",
          "fortuna",
          "necessità",
          "the lion and the fox"
        ],
        "cluster:1": [
          "state of nature",
          "social contract",
          "sovereign"
        ],
        "cluster:2": [
          "balance of power",
          "six principles of realism",
          "interest defined as power"
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
        "totalLength": 363.3333204921483
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:29:31.108Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-hobbesian-imperative",
      "puzzleRevision": "fnv1a32:98ca0549",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:feared rather than loved": {
          "x": 286.28,
          "y": 598
        },
        "term:virtù": {
          "x": 156.89,
          "y": 536.61
        },
        "term:fortuna": {
          "x": 141.48,
          "y": 448.15
        },
        "term:necessità": {
          "x": 393.36,
          "y": 485.08
        },
        "term:the lion and the fox": {
          "x": 122.58,
          "y": 312.35
        },
        "term:state of nature": {
          "x": 458.55,
          "y": 231.89
        },
        "term:social contract": {
          "x": 185.54,
          "y": 127.81
        },
        "term:sovereign": {
          "x": 255.39,
          "y": 22
        },
        "term:balance of power": {
          "x": 608.06,
          "y": 231.01
        },
        "term:six principles of realism": {
          "x": 809.6,
          "y": 527.9
        },
        "term:interest defined as power": {
          "x": 552.31,
          "y": 480.47
        },
        "term:anarchy": {
          "x": 531.39,
          "y": 328.99
        },
        "term:human nature": {
          "x": 325.59,
          "y": 265.05
        },
        "term:raison d'état": {
          "x": 423.06,
          "y": 367.46
        },
        "cluster:0": {
          "x": 272.54,
          "y": 408.25
        },
        "cluster:1": {
          "x": 349.38,
          "y": 120.61
        },
        "cluster:2": {
          "x": 706.86,
          "y": 363.63
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:29:33.446Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:29:25.344Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
