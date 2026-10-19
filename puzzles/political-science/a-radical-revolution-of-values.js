// Generated from content/puzzles/a-radical-revolution-of-values.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "a-radical-revolution-of-values",
  "title": "A Radical Revolution of Values",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "history-society"
  ],
  "subcategories": {
    "peace-conflict-studies": "nonviolence-civil-resistance",
    "political-science": "political-behavior"
  },
  "info": {
    "text": "Martin Luther King Jr.'s final year: an argument that racism, militarism, and poverty were one interlocking structure -- the giant triplets, in his own phrase -- that required nothing less than a radical revolution of values to dismantle, tested directly in his last campaign for economic justice before his assassination in Memphis.",
    "links": [
      {
        "href": "wiki:Martin Luther King Jr."
      }
    ]
  },
  "clusters": [
    {
      "id": "the-triple-evils",
      "name": "The Triple Evils",
      "color": "brown",
      "fact": "On April 4, 1967, exactly one year before his assassination, King stood in Riverside Church and broke with many of his own civil rights allies to deliver Beyond Vietnam, naming racism, militarism, and extreme materialism as the giant triplets no single-issue reform could conquer on its own, and calling for nothing less than a radical revolution of values away from a thing-oriented society.",
      "terms": [
        "the giant triplets",
        "Beyond Vietnam",
        "a radical revolution of values",
        "a thing-oriented society"
      ],
      "seeds": [
        "the giant triplets",
        "Beyond Vietnam"
      ],
      "info": {
        "text": "King's 1967 Riverside Church speech naming racism, militarism, and extreme materialism as one interlocking structure -- a speech many of his own allies called a mistake.",
        "links": [
          {
            "href": "wiki:Beyond Vietnam: A Time to Break Silence"
          }
        ]
      }
    },
    {
      "id": "the-beloved-community",
      "name": "The Beloved Community",
      "color": "magenta",
      "fact": "King's ultimate goal was never simply to win: agape, the kind of love that seeks nothing in return, aims to convert an opponent into a friend rather than defeat an enemy, absorbing redemptive suffering without retaliation on the way to what he called the Beloved Community -- an actually integrated society built on justice, not merely proximity.",
      "terms": [
        "the Beloved Community",
        "agape",
        "redemptive suffering",
        "reconciliation, not defeat"
      ],
      "seeds": [
        "the Beloved Community",
        "agape"
      ],
      "info": {
        "text": "The theological and philosophical core of King's nonviolence: love that seeks to convert rather than defeat an opponent, aimed at an integrated, justly reconciled society rather than a won argument.",
        "links": [
          {
            "href": "wiki:Martin Luther King Jr."
          }
        ]
      }
    },
    {
      "id": "the-poor-peoples-campaign",
      "name": "The Poor People's Campaign",
      "color": "olive",
      "fact": "In his final months King redirected the movement toward economic justice directly: he made the Memphis sanitation workers' strike -- fought under the banner I Am a Man -- part of the larger Poor People's Campaign, a planned multiracial encampment in Washington that became Resurrection City after his assassination in Memphis cut his own involvement short.",
      "terms": [
        "the Memphis sanitation strike",
        "the Poor People's Campaign",
        "I Am a Man",
        "Resurrection City"
      ],
      "seeds": [
        "the Memphis sanitation strike",
        "the Poor People's Campaign"
      ],
      "info": {
        "text": "King's final organizing campaign: a planned multiracial march and encampment demanding economic justice, cut short by his assassination while supporting Memphis's striking sanitation workers.",
        "links": [
          {
            "href": "wiki:Poor People's Campaign"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-what-replaces-it",
      "term": "what replaces it",
      "clusters": [
        0,
        1
      ],
      "fact": "Naming the giant triplets was only half of King's argument: the shift from a thing-oriented to a person-oriented society he called for in Beyond Vietnam was not an abstract slogan but a description of exactly what the Beloved Community, built on agape rather than acquisition, would actually look like in practice.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-put-into-practice",
      "term": "put into practice",
      "clusters": [
        1,
        2
      ],
      "fact": "The Poor People's Campaign was the Beloved Community's economic test case: a deliberately multiracial coalition of poor Appalachian whites, Latino farmworkers, Native Americans, and Black Americans, organized on the theory that poverty itself -- not any single group's particular grievance -- was the injustice reconciliation had to address.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-the-same-crisis-two-scales",
      "term": "the same crisis, two scales",
      "clusters": [
        0,
        2
      ],
      "fact": "The connection King drew between militarism and poverty in Beyond Vietnam was not abstract: a year later he was in Memphis making the identical argument at the scale of a single city, standing with sanitation workers whose demand for a living wage was, in his telling, the same fight against the same giant triplets, fought street by street instead of nation by nation.",
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "diagnosis-and-values",
      "prompt": "Which of these are the diagnosis King named in Beyond Vietnam, or the transformation he said it demanded — rather than the speech itself?",
      "explanation": "The giant triplets and a thing-oriented society name what King said was wrong in his Riverside speech, and a radical revolution of values names the transformation he said it required — three conceptual tools from one speech, not the speech title itself and not the later campaigns or philosophy of love.",
      "targets": [
        "the giant triplets",
        "a radical revolution of values",
        "a thing-oriented society"
      ],
      "reasons": {
        "a radical revolution of values": "The transformation King argued the giant triplets demanded, not a specific program.",
        "a thing-oriented society": "King's shorthand for what was wrong: a society oriented around things rather than people.",
        "the giant triplets": "The structural diagnosis itself: racism, militarism, and extreme materialism as one interlocking system."
      }
    },
    {
      "id": "enacted-and-grounded",
      "prompt": "Which of these name something that was physically built, occupied, or enacted in a specific place — rather than a vision, a philosophy, or a national argument?",
      "explanation": "These four terms name things that happened in a specific place with specific people: a strike in Memphis, a multiracial coalition that marched on Washington, the slogan workers carried on signs, and the encampment they built on the Mall. The Beloved Community, agape, the giant triplets — those are the vision and the diagnosis. These are where King and the movement showed up.",
      "targets": [
        "the Memphis sanitation strike",
        "the Poor People's Campaign",
        "I Am a Man",
        "Resurrection City"
      ],
      "reasons": {
        "I Am a Man": "The slogan carried on signs by striking workers — grounded in that strike's physical presence.",
        "Resurrection City": "A literal city of tents built on the Washington Mall — the most physically specific node on the board.",
        "the Memphis sanitation strike": "A labor action by specific workers in a specific city — the most local and concrete node on the board.",
        "the Poor People's Campaign": "A named coalition with an actual march and encampment, not an aspiration."
      }
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      },
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "a-radical-revolution-of-values",
      "puzzleRevision": "fnv1a32:05846fe3",
      "board": {
        "width": 670,
        "height": 480
      },
      "nodes": {
        "term:the giant triplets": {
          "x": 272.33,
          "y": 457,
          "pinned": false
        },
        "term:Beyond Vietnam": {
          "x": 108.53,
          "y": 381.96,
          "pinned": false
        },
        "term:a radical revolution of values": {
          "x": 553.5,
          "y": 457,
          "pinned": false
        },
        "term:a thing-oriented society": {
          "x": 97.6,
          "y": 457,
          "pinned": false
        },
        "term:the Beloved Community": {
          "x": 288.9,
          "y": 155.71,
          "pinned": false
        },
        "term:agape": {
          "x": 139.85,
          "y": 125.25,
          "pinned": false
        },
        "term:redemptive suffering": {
          "x": 85,
          "y": 23,
          "pinned": false
        },
        "term:reconciliation, not defeat": {
          "x": 103.9,
          "y": 190.29,
          "pinned": false
        },
        "term:the Memphis sanitation strike": {
          "x": 437.49,
          "y": 23,
          "pinned": false
        },
        "term:the Poor People's Campaign": {
          "x": 566.1,
          "y": 250.61,
          "pinned": false
        },
        "term:I Am a Man": {
          "x": 596.92,
          "y": 23,
          "pinned": false
        },
        "term:Resurrection City": {
          "x": 594.45,
          "y": 76.27,
          "pinned": false
        },
        "term:what replaces it": {
          "x": 195.69,
          "y": 341.46,
          "pinned": false
        },
        "term:put into practice": {
          "x": 246.06,
          "y": 23,
          "pinned": false
        },
        "term:the same crisis, two scales": {
          "x": 378.88,
          "y": 331.78,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3556.1,
        "score": 3556.1043468889998
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:25:50.622Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "a-radical-revolution-of-values",
      "puzzleRevision": "fnv1a32:05846fe3",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 723.04,
          "y": 271.01,
          "pinned": false
        },
        "cluster:1": {
          "x": 505,
          "y": 456.99,
          "pinned": false
        },
        "cluster:2": {
          "x": 286.96,
          "y": 271.01,
          "pinned": false
        }
      },
      "bridges": {
        "term:what replaces it": {
          "x": 710.19,
          "y": 460.16,
          "pinned": false
        },
        "term:put into practice": {
          "x": 299.81,
          "y": 460.16,
          "pinned": false
        },
        "term:the same crisis, two scales": {
          "x": 505,
          "y": 167.01,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "the giant triplets",
          "Beyond Vietnam",
          "a radical revolution of values",
          "a thing-oriented society"
        ],
        "cluster:1": [
          "the Beloved Community",
          "agape",
          "redemptive suffering",
          "reconciliation, not defeat"
        ],
        "cluster:2": [
          "the Memphis sanitation strike",
          "the Poor People's Campaign",
          "I Am a Man",
          "Resurrection City"
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
        "totalLength": 491.4539396980639
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:25:53.608Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "a-radical-revolution-of-values",
      "puzzleRevision": "fnv1a32:05846fe3",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:the giant triplets": {
          "x": 379.7,
          "y": 628
        },
        "term:Beyond Vietnam": {
          "x": 227.73,
          "y": 628
        },
        "term:a radical revolution of values": {
          "x": 114.5,
          "y": 481.89
        },
        "term:a thing-oriented society": {
          "x": 230.95,
          "y": 294.68
        },
        "term:the Beloved Community": {
          "x": 106.94,
          "y": 145.98
        },
        "term:agape": {
          "x": 142.67,
          "y": 22
        },
        "term:redemptive suffering": {
          "x": 273.28,
          "y": 22
        },
        "term:reconciliation, not defeat": {
          "x": 512.49,
          "y": 22
        },
        "term:the Memphis sanitation strike": {
          "x": 896.73,
          "y": 277.24
        },
        "term:the Poor People's Campaign": {
          "x": 908.1,
          "y": 502.64
        },
        "term:I Am a Man": {
          "x": 801.23,
          "y": 628
        },
        "term:Resurrection City": {
          "x": 668.16,
          "y": 595.7
        },
        "term:what replaces it": {
          "x": 404.07,
          "y": 334.84
        },
        "term:put into practice": {
          "x": 553.87,
          "y": 290.71
        },
        "term:the same crisis, two scales": {
          "x": 510.47,
          "y": 488.77
        },
        "cluster:0": {
          "x": 311.11,
          "y": 456.05
        },
        "cluster:1": {
          "x": 378.09,
          "y": 168.84
        },
        "cluster:2": {
          "x": 714.4,
          "y": 409.08
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:25:56.309Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "auto",
    "savedAt": "2026-10-08T01:25:47.746Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
