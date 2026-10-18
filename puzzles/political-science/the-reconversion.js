// Generated from content/puzzles/the-reconversion.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-reconversion",
  "title": "The Reconversion",
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
    "text": "A.J. Muste -- Dutch-American minister, Lawrence strike organizer, and for a time the leader of an actual Trotskyist party -- until a 1936 religious reconversion sent him back to Christian pacifism for good, and into three more decades leading the Fellowship of Reconciliation, training Bayard Rustin's generation in nonviolent direct action, and traveling to Hanoi at eighty-one to try to end the Vietnam War.",
    "links": [
      {
        "href": "wiki:A. J. Muste"
      }
    ],
    "citations": [
      {
        "title": "Nonviolence in an Aggressive World",
        "author": "A. J. Muste",
        "publisher": "Harper & Brothers",
        "year": "1940"
      }
    ]
  },
  "clusters": [
    {
      "id": "from-pulpit-to-picket-line",
      "name": "From Pulpit to Picket Line",
      "color": "teal",
      "fact": "Muste helped found the Fellowship of Reconciliation in 1915 as a young pacifist minister; two years later, when the United States entered the war, his refusal to abandon that same pacifism cost him his Massachusetts pulpit. In 1919 he found himself elected executive secretary of the strike committee during a bitter Lawrence textile strike, beaten by police on the picket line, and from there spent over a decade directing Brookwood Labor College, training organizers for the industrial-union movement.",
      "terms": [
        "the Lawrence strike",
        "a forced resignation",
        "the Fellowship of Reconciliation",
        "Brookwood Labor College"
      ],
      "seeds": [
        "the Lawrence strike",
        "a forced resignation"
      ],
      "termInfo": {
        "the Fellowship of Reconciliation": {
          "links": [
            {
              "href": "wiki:Fellowship of Reconciliation"
            }
          ]
        }
      },
      "info": {
        "text": "Muste's first political conversion: from a Massachusetts pulpit lost over WWI pacifism, into a decade of labor organizing and union education.",
        "links": [
          {
            "href": "wiki:A. J. Muste"
          }
        ]
      }
    },
    {
      "id": "the-trotskyist-interlude",
      "name": "The Trotskyist Interlude",
      "color": "brown",
      "fact": "By 1933 Muste was leading the American Workers Party, nicknamed the Musteites, which merged with the Trotskyists the following year, briefly making him the leader of an actual Trotskyist party. He helped introduce the sit-down strike to American labor at Akron's 1936 Goodyear strike, and then, while traveling in Europe that same year, underwent a religious reconversion that sent him back to Christian pacifism for the rest of his life.",
      "terms": [
        "the American Workers Party",
        "a religious reconversion",
        "the sit-down strike",
        "Musteites"
      ],
      "seeds": [
        "the American Workers Party",
        "a religious reconversion"
      ],
      "info": {
        "text": "Muste's decade as a revolutionary Marxist, culminating in his brief leadership of an actual Trotskyist party -- and the sudden 1936 religious experience that ended it for good.",
        "links": [
          {
            "href": "wiki:American Workers Party"
          }
        ]
      }
    },
    {
      "id": "elder-of-the-movement",
      "name": "Elder of the Movement",
      "color": "magenta",
      "fact": "Muste spent his last three decades rebuilding the very movement he had once left behind: executive director of the Fellowship of Reconciliation from 1940, author of Nonviolence in an Aggressive World that same year, and mentor to the generation -- Bayard Rustin among them -- who carried nonviolent direct action into the civil rights movement. At eighty-one, chairing the new Spring Mobilization Committee to End the War in Vietnam, he traveled to Hanoi to meet North Vietnamese leaders directly; he died within months of returning.",
      "terms": [
        "training a new generation",
        "the Hanoi trip",
        "Nonviolence in an Aggressive World",
        "the Spring Mobilization Committee"
      ],
      "seeds": [
        "training a new generation",
        "the Hanoi trip"
      ],
      "info": {
        "text": "Muste's final three decades: rebuilding the Fellowship of Reconciliation, mentoring the activists who carried nonviolent direct action into the civil rights movement, and organizing against the Vietnam War until his death.",
        "links": [
          {
            "href": "wiki:A. J. Muste"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-further-left",
      "term": "further left",
      "clusters": [
        0,
        1
      ],
      "fact": "Lawrence taught Muste that mass, disciplined labor action could actually win; when the broader labor movement kept losing through the 1920s against entrenched capital, that same conviction pushed him further left still, from labor organizing and Brookwood's classrooms toward full revolutionary Marxism and, eventually, leadership of an actual Trotskyist party.",
      "relationKind": "dynamic",
      "idealTerms": [
        "the Lawrence strike",
        "the American Workers Party"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-what-came-back",
      "term": "what came back",
      "clusters": [
        1,
        2
      ],
      "fact": "The 1936 reconversion was not a brief detour: everything Muste did for the next three decades -- rebuilding the Fellowship of Reconciliation, training Rustin's generation in nonviolent direct action, and traveling to Hanoi at eighty-one to try to end a war -- flowed directly from the pacifism he recommitted to that year and never left again.",
      "relationKind": "dynamic",
      "idealTerms": [
        "a religious reconversion",
        "training a new generation"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-the-same-fellowship-decades-later",
      "term": "the same fellowship, decades later",
      "clusters": [
        0,
        2
      ],
      "fact": "Muste helped found the Fellowship of Reconciliation in 1915, well before his own pacifism cost him his pulpit; two decades, one full Marxist detour, and one religious reconversion later, he came back to lead that very same organization as its executive director, and used it to train the activists who would carry nonviolent direct action into the civil rights movement.",
      "relationKind": "continuity",
      "idealTerms": [
        "the Fellowship of Reconciliation",
        "training a new generation"
      ]
    }
  ],
  "lenses": [
    {
      "id": "institutions-not-events",
      "prompt": "Which of these are organizations Muste helped found or lead, rather than a single event or personal experience?",
      "explanation": "The Fellowship of Reconciliation, the American Workers Party, and the Spring Mobilization Committee were all organizations Muste helped found or lead, spanning three completely different phases and ideologies of his career -- Christian pacifist, Marxist revolutionary, and antiwar coalition-builder -- proof that institution-building, not any single ideology, was the real constant in his working life.",
      "targets": [
        "the Fellowship of Reconciliation",
        "the American Workers Party",
        "the Spring Mobilization Committee"
      ],
      "reasons": {
        "the American Workers Party": "The Marxist party Muste led before its 1934 merger with the Trotskyists.",
        "the Fellowship of Reconciliation": "Co-founded in 1915 as a young pacifist minister, and later led as its executive director from 1940.",
        "the Spring Mobilization Committee": "The antiwar coalition he chaired at the very end of his life, organizing against the Vietnam War."
      }
    },
    {
      "id": "personal-turning-points",
      "prompt": "Which of these mark a moment where Muste's own convictions visibly changed his course, rather than an organization he built?",
      "explanation": "A forced resignation, a religious reconversion, and the Hanoi trip mark three moments where Muste's own convictions visibly changed his course, rather than an organization he was busy building: losing his pulpit over pacifism in WWI, breaking from Trotskyism back to Christian nonviolence in 1936, and, at eighty-one, traveling into a wartime capital to see whether personal diplomacy could still do what marches and speeches hadn't.",
      "targets": [
        "a forced resignation",
        "a religious reconversion",
        "the Hanoi trip"
      ],
      "reasons": {
        "a forced resignation": "Losing his pulpit over pacifism during WWI, which sent him toward the labor movement instead of the church.",
        "a religious reconversion": "A 1936 experience in Europe that ended his Marxist period and returned him to Christian pacifism for good.",
        "the Hanoi trip": "At eighty-one, traveling into a wartime capital to see whether personal diplomacy could do what marches and speeches hadn't."
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
      "puzzleId": "the-reconversion",
      "puzzleRevision": "fnv1a32:1ffc4610",
      "board": {
        "width": 770,
        "height": 550
      },
      "nodes": {
        "term:the Lawrence strike": {
          "x": 569.83,
          "y": 171.18,
          "pinned": false
        },
        "term:a forced resignation": {
          "x": 501.32,
          "y": 23,
          "pinned": false
        },
        "term:the Fellowship of Reconciliation": {
          "x": 125.26,
          "y": 23,
          "pinned": false
        },
        "term:Brookwood Labor College": {
          "x": 675.55,
          "y": 23,
          "pinned": false
        },
        "term:the American Workers Party": {
          "x": 666.1,
          "y": 322.3,
          "pinned": false
        },
        "term:a religious reconversion": {
          "x": 502.71,
          "y": 382.89,
          "pinned": false
        },
        "term:the sit-down strike": {
          "x": 605.76,
          "y": 527,
          "pinned": false
        },
        "term:Musteites": {
          "x": 719.65,
          "y": 475.92,
          "pinned": false
        },
        "term:training a new generation": {
          "x": 302.91,
          "y": 385.21,
          "pinned": false
        },
        "term:the Hanoi trip": {
          "x": 318.87,
          "y": 527,
          "pinned": false
        },
        "term:Nonviolence in an Aggressive World": {
          "x": 129.1,
          "y": 527,
          "pinned": false
        },
        "term:the Spring Mobilization Committee": {
          "x": 125.95,
          "y": 265.99,
          "pinned": false
        },
        "term:further left": {
          "x": 710.2,
          "y": 159.11,
          "pinned": false
        },
        "term:what came back": {
          "x": 454.7,
          "y": 527,
          "pinned": false
        },
        "term:the same fellowship, decades later": {
          "x": 340.45,
          "y": 155.55,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3579.8,
        "score": 3579.803305131706
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:25:02.917Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-reconversion",
      "puzzleRevision": "fnv1a32:1ffc4610",
      "board": {
        "width": 1150,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 301.08,
          "y": 302.15,
          "pinned": false
        },
        "cluster:1": {
          "x": 575,
          "y": 529.7,
          "pinned": false
        },
        "cluster:2": {
          "x": 848.92,
          "y": 302.15,
          "pinned": false
        }
      },
      "bridges": {
        "term:further left": {
          "x": 364.5,
          "y": 489.46,
          "pinned": false
        },
        "term:what came back": {
          "x": 808.13,
          "y": 512.09,
          "pinned": false
        },
        "term:the same fellowship, decades later": {
          "x": 575,
          "y": 198.15,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "the Lawrence strike",
          "a forced resignation",
          "the Fellowship of Reconciliation",
          "Brookwood Labor College"
        ],
        "cluster:1": [
          "the American Workers Party",
          "a religious reconversion",
          "the sit-down strike",
          "Musteites"
        ],
        "cluster:2": [
          "training a new generation",
          "the Hanoi trip",
          "Nonviolence in an Aggressive World",
          "the Spring Mobilization Committee"
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
        "totalLength": 488.6110972997256
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:25:05.680Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-reconversion",
      "puzzleRevision": "fnv1a32:1ffc4610",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:the Lawrence strike": {
          "x": 285.12,
          "y": 311.43
        },
        "term:a forced resignation": {
          "x": 237.49,
          "y": 665.64
        },
        "term:the Fellowship of Reconciliation": {
          "x": 459.78,
          "y": 698.81
        },
        "term:Brookwood Labor College": {
          "x": 133.47,
          "y": 506.21
        },
        "term:the American Workers Party": {
          "x": 445.57,
          "y": 203.07
        },
        "term:a religious reconversion": {
          "x": 701.67,
          "y": 152.63
        },
        "term:the sit-down strike": {
          "x": 360.84,
          "y": 24.23
        },
        "term:Musteites": {
          "x": 702.74,
          "y": 22
        },
        "term:training a new generation": {
          "x": 808.49,
          "y": 327.94
        },
        "term:the Hanoi trip": {
          "x": 965.49,
          "y": 415.67
        },
        "term:Nonviolence in an Aggressive World": {
          "x": 1022.9,
          "y": 654.98
        },
        "term:the Spring Mobilization Committee": {
          "x": 747.03,
          "y": 718
        },
        "term:further left": {
          "x": 459.47,
          "y": 374.29
        },
        "term:what came back": {
          "x": 599.57,
          "y": 290.07
        },
        "term:the same fellowship, decades later": {
          "x": 617.4,
          "y": 492.49
        },
        "cluster:0": {
          "x": 339.6,
          "y": 497.23
        },
        "cluster:1": {
          "x": 548.25,
          "y": 22
        },
        "cluster:2": {
          "x": 842.56,
          "y": 520.75
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:25:08.726Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "auto",
    "savedAt": "2026-10-08T01:24:59.689Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
