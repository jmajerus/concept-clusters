// Generated from content/puzzles/evolution-of-cooperation.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "evolution-of-cooperation",
  "title": "The evolution of cooperation",
  "category": "economics",
  "categories": [
    "economics",
    "political-science",
    "peace-conflict-studies"
  ],
  "subcategories": {
    "economics": "microeconomics",
    "peace-conflict-studies": "conflict-resolution-peacebuilding",
    "political-science": "international-relations"
  },
  "info": {
    "text": "How cooperation can get started among players who have no reason to trust each other, no way to make promises, and no authority to enforce anything.",
    "links": [
      {
        "href": "wiki:The Evolution of Cooperation"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-dilemma",
      "name": "The one-shot dilemma",
      "color": "teal",
      "fact": "Played once, the dilemma has a clean answer: whatever the other side does, you score better by defecting. Both sides reason identically, both defect, and both end up worse off than if they had cooperated. That result is what everything else here is trying to escape.",
      "terms": [
        "prisoner's dilemma",
        "dominant strategy",
        "temptation payoff",
        "sucker's payoff"
      ],
      "seeds": [
        "prisoner's dilemma",
        "dominant strategy"
      ],
      "termInfo": {
        "dominant strategy": {
          "text": "A move that scores better than the alternative no matter what the other player does — which, in a single round of this game, is defection.",
          "links": [
            {
              "href": "wiki:Strategic dominance"
            }
          ]
        },
        "prisoner's dilemma": {
          "text": "The standard two-player setup where each side chooses to cooperate or defect, and mutual defection pays both less than mutual cooperation would have.",
          "links": [
            {
              "href": "wiki:Prisoner's dilemma"
            }
          ]
        },
        "sucker's payoff": {
          "text": "What you are left holding after cooperating with someone who defected: the smallest of the four payoffs, and the reason cooperation feels risky.",
          "links": [
            {
              "href": "wiki:Prisoner's dilemma"
            }
          ]
        },
        "temptation payoff": {
          "text": "What you collect by defecting against someone who cooperated: the largest of the four payoffs, and the reason defection tempts.",
          "links": [
            {
              "href": "wiki:Prisoner's dilemma"
            }
          ]
        }
      },
      "info": {
        "text": "The situation where each side's individually best move leaves both sides worse off than another pair of moves would have.",
        "links": [
          {
            "href": "wiki:Prisoner's dilemma"
          }
        ]
      }
    },
    {
      "id": "cluster-strategy",
      "name": "What made a strategy score well",
      "color": "blue",
      "fact": "Across both of Axelrod's tournaments the high scorers shared a shape: never the first to defect, quick to drop a grudge once the other side came back, and simple enough that an opponent could work out what they were doing. None of them ever beat a single opponent head to head.",
      "terms": [
        "niceness",
        "forgiveness",
        "clarity"
      ],
      "seeds": [
        "niceness",
        "forgiveness"
      ],
      "termInfo": {
        "clarity": {
          "text": "Being simple enough that the other player can work out your rule and see that cooperating with you pays. An unreadable strategy invites being treated as unresponsive.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        },
        "forgiveness": {
          "text": "Returning to cooperation once the other side does, rather than punishing indefinitely for a defection already answered.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        },
        "niceness": {
          "text": "Never being the first to defect. Every high-scoring entry in both of Axelrod's tournaments had this property; every low-scoring one lacked it.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        }
      },
      "info": {
        "text": "The traits that separated the high-scoring entries from the low-scoring ones when strategies were played against each other in bulk.",
        "links": [
          {
            "href": "wiki:The Evolution of Cooperation"
          }
        ]
      }
    },
    {
      "id": "cluster-breakdown",
      "name": "How cooperation unravels",
      "color": "amber",
      "fact": "None of this requires malice. A garbled move, a deadline both sides can see, or the urge to beat your partner rather than the field is enough to turn a working relationship into a long run of mutual punishment that neither side chose.",
      "terms": [
        "echo effect",
        "misperception",
        "known last round",
        "envy"
      ],
      "seeds": [
        "misperception",
        "envy"
      ],
      "termInfo": {
        "echo effect": {
          "text": "One defection copied back and forth, so a single move reverberates through many rounds of alternating retaliation.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        },
        "envy": {
          "text": "Measuring your score against your partner's rather than against the whole field. The comparison is what makes players defect their way to a worse absolute result.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        },
        "known last round": {
          "text": "When both sides know exactly when the relationship ends, there is no future left to protect on the final move — and that reasoning walks backwards through every earlier move too.",
          "links": [
            {
              "href": "wiki:Backward induction"
            }
          ]
        },
        "misperception": {
          "text": "A move received as something other than what was sent — noise, error, or a signal read wrong.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        }
      },
      "info": {
        "text": "The ways a working relationship comes apart without either side deciding to end it.",
        "links": [
          {
            "href": "wiki:The Evolution of Cooperation"
          }
        ]
      }
    },
    {
      "id": "cluster-spread",
      "name": "How cooperation takes hold",
      "color": "magenta",
      "fact": "Cooperation does not need everyone to convert at once. A small group of reciprocators that mostly meets itself can outscore a surrounding world of defectors — and once established, that pattern is very hard for defectors to break back into.",
      "terms": [
        "clustering",
        "evolutionary stability",
        "territoriality",
        "live and let live"
      ],
      "seeds": [
        "live and let live",
        "evolutionary stability"
      ],
      "termInfo": {
        "clustering": {
          "text": "A small group of reciprocators interacting mostly with each other can outscore a defecting majority, even while heavily outnumbered.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        },
        "evolutionary stability": {
          "text": "Once a reciprocating population is established, a small group of defectors entering it cannot do better than the natives, so it cannot take over.",
          "links": [
            {
              "href": "wiki:Evolutionarily stable strategy"
            }
          ]
        },
        "live and let live": {
          "text": "The tacit restraint that grew up between opposing trenches in the First World War, where units facing the same enemy day after day quietly stopped trying to kill each other.",
          "links": [
            {
              "href": "wiki:Live and let live (World War I)"
            }
          ]
        },
        "territoriality": {
          "text": "When players interact only with immediate neighbors rather than with everyone at random, cooperation can hold ground it could not hold in a fully mixed population.",
          "links": [
            {
              "href": "wiki:The Evolution of Cooperation"
            }
          ]
        }
      },
      "info": {
        "text": "How a cooperative pattern gets a foothold in a population that does not already have one, and then keeps it.",
        "links": [
          {
            "href": "wiki:The Evolution of Cooperation"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-tit-for-tat",
      "term": "tit for tat",
      "clusters": [
        1,
        3
      ],
      "fact": "Anatol Rapoport's winning entry was the shortest one submitted: cooperate on the first move, then copy whatever the other player just did. The same four-line rule that topped the tournament is also what lets a handful of neighbors get cooperation started in a world that has none.",
      "info": {
        "text": "Cooperate on the first move, then repeat whatever the other player did last.",
        "links": [
          {
            "href": "wiki:Tit for tat"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        "clustering"
      ]
    },
    {
      "id": "bridge-provocability",
      "term": "provocability",
      "clusters": [
        1,
        2
      ],
      "fact": "Answering a defection immediately is what keeps a cooperative strategy from being farmed by exploiters — a nice rule without it is simply prey. Unchanged, it is also the mechanism that converts one garbled move into a long alternating run of retaliation neither side wanted.",
      "info": {
        "text": "Retaliating promptly for a defection rather than absorbing it.",
        "links": [
          {
            "href": "wiki:The Evolution of Cooperation"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "niceness",
        "echo effect"
      ]
    },
    {
      "id": "bridge-shadow",
      "term": "shadow of the future",
      "clusters": [
        0,
        3
      ],
      "fact": "How much the next encounter matters is what decides whether the single-round logic applies at all. Stretch the expected relationship long enough and the move that wins one round stops being the move that wins — which is the opening cooperation needs to establish itself.",
      "info": {
        "text": "Axelrod's term for how heavily the prospect of future encounters with the same player weighs on the present one.",
        "links": [
          {
            "href": "wiki:The Evolution of Cooperation"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "dominant strategy",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "reasons-to-defect",
      "prompt": "Which concepts give a player a positive reason to defect on this move, rather than a reason to fear being defected on?",
      "explanation": "Each of these pushes toward defection from a different direction: the payoff table, the logic of a single round, the calendar, and the wrong comparison. The sucker's payoff is deliberately excluded — it is the cost of being exploited, which produces fear rather than temptation, and fear alone does not tell you to move first.",
      "targets": [
        "temptation payoff",
        "dominant strategy",
        "known last round",
        "envy"
      ],
      "reasons": {
        "dominant strategy": "In one round, defection scores better regardless of the other player's move.",
        "envy": "Wanting to out-score your partner specifically, rather than score well overall, argues for defecting on someone doing fine.",
        "known last round": "With no future left to protect, the final move has nothing holding it in place.",
        "temptation payoff": "The largest payoff in the table is collected by defecting against a cooperator."
      }
    },
    {
      "id": "when-a-move-is-misread",
      "prompt": "Which concepts are directly concerned with a move being misread, mistaken, or hard to interpret?",
      "explanation": "A tournament run without noise hides an entire failure mode. Once moves can be garbled, the cause, the amplifier, the consequence, and the two partial remedies all live on this board — and note that the amplifier and one of the remedies are the same trait tuned differently. Niceness is excluded: it governs the opening move, before there is any signal to misread.",
      "targets": [
        "misperception",
        "echo effect",
        "clarity",
        "forgiveness",
        "provocability"
      ],
      "reasons": {
        "clarity": "Being legible reduces how often your moves are misread in the first place.",
        "echo effect": "What a single misread move becomes once both sides answer in kind.",
        "forgiveness": "Returning to cooperation is what actually breaks an echo already running.",
        "misperception": "The originating error: a move received as something other than what was sent.",
        "provocability": "Immediate retaliation is what turns one misread move into a sustained run."
      }
    },
    {
      "id": "without-an-enforcer",
      "prompt": "Which concepts help explain how cooperation could arise among players who cannot communicate, promise, or enforce anything?",
      "explanation": "This is the book's central claim: cooperation does not require a central authority, a contract, or even trust — only repeated contact and a rule simple enough to be read from behavior alone. Evolutionary stability is excluded on purpose, and the distinction matters: it explains why a cooperative population resists invasion once it exists, not how it got started with none.",
      "targets": [
        "live and let live",
        "clustering",
        "territoriality",
        "tit for tat",
        "shadow of the future"
      ],
      "reasons": {
        "clustering": "A minority of reciprocators can gain a foothold without converting anyone first.",
        "live and let live": "Enemy soldiers with every official incentive to shoot arrived at restraint with no agreement at all.",
        "shadow of the future": "Expected repetition is the one condition that has to hold; nothing else on this list works without it.",
        "territoriality": "Interacting only with neighbors supplies the repetition that a random population would not.",
        "tit for tat": "A rule readable purely from behavior needs no communication to be understood."
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
      "puzzleId": "evolution-of-cooperation",
      "puzzleRevision": "fnv1a32:cb8dc82e",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:prisoner's dilemma": {
          "x": 671.6,
          "y": 23,
          "pinned": false
        },
        "term:dominant strategy": {
          "x": 599.46,
          "y": 163.79,
          "pinned": false
        },
        "term:temptation payoff": {
          "x": 754.89,
          "y": 157.53,
          "pinned": false
        },
        "term:sucker's payoff": {
          "x": 823.52,
          "y": 25.51,
          "pinned": false
        },
        "term:niceness": {
          "x": 282.53,
          "y": 236.08,
          "pinned": false
        },
        "term:forgiveness": {
          "x": 334.48,
          "y": 141.57,
          "pinned": false
        },
        "term:clarity": {
          "x": 230.79,
          "y": 156.1,
          "pinned": false
        },
        "term:echo effect": {
          "x": 300.77,
          "y": 392.17,
          "pinned": false
        },
        "term:misperception": {
          "x": 339.47,
          "y": 509.55,
          "pinned": false
        },
        "term:known last round": {
          "x": 202.83,
          "y": 482.22,
          "pinned": false
        },
        "term:envy": {
          "x": 262.52,
          "y": 575.81,
          "pinned": false
        },
        "term:clustering": {
          "x": 466.77,
          "y": 173.75,
          "pinned": false
        },
        "term:evolutionary stability": {
          "x": 582.03,
          "y": 454.92,
          "pinned": false
        },
        "term:territoriality": {
          "x": 427.15,
          "y": 409.47,
          "pinned": false
        },
        "term:live and let live": {
          "x": 518.73,
          "y": 296.23,
          "pinned": false
        },
        "term:tit for tat": {
          "x": 388.38,
          "y": 256.73,
          "pinned": false
        },
        "term:provocability": {
          "x": 202.38,
          "y": 317.36,
          "pinned": false
        },
        "term:shadow of the future": {
          "x": 683.01,
          "y": 305.54,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2812.76,
        "score": 2812.7587115851566
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:02:13.541Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "evolution-of-cooperation",
      "puzzleRevision": "fnv1a32:cb8dc82e",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 296.93,
          "y": 245.28,
          "pinned": false
        },
        "cluster:1": {
          "x": 753.07,
          "y": 550.72,
          "pinned": false
        },
        "cluster:2": {
          "x": 753.07,
          "y": 245.28,
          "pinned": false
        },
        "cluster:3": {
          "x": 296.93,
          "y": 550.72,
          "pinned": false
        }
      },
      "bridges": {
        "term:tit for tat": {
          "x": 525,
          "y": 550.72,
          "pinned": false
        },
        "term:provocability": {
          "x": 753.07,
          "y": 398,
          "pinned": false
        },
        "term:shadow of the future": {
          "x": 296.93,
          "y": 398,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "prisoner's dilemma",
          "dominant strategy",
          "temptation payoff",
          "sucker's payoff"
        ],
        "cluster:1": [
          "niceness",
          "forgiveness",
          "clarity"
        ],
        "cluster:2": [
          "echo effect",
          "misperception",
          "known last round",
          "envy"
        ],
        "cluster:3": [
          "clustering",
          "evolutionary stability",
          "territoriality",
          "live and let live"
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
        "totalLength": 373.35310675987176
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:02:15.917Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "evolution-of-cooperation",
      "puzzleRevision": "fnv1a32:cb8dc82e",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:prisoner's dilemma": {
          "x": 475.19,
          "y": 22
        },
        "term:dominant strategy": {
          "x": 502.34,
          "y": 184.31
        },
        "term:temptation payoff": {
          "x": 792.78,
          "y": 22
        },
        "term:sucker's payoff": {
          "x": 867.94,
          "y": 153.77
        },
        "term:niceness": {
          "x": 584.32,
          "y": 392.1
        },
        "term:forgiveness": {
          "x": 900.63,
          "y": 283.72
        },
        "term:clarity": {
          "x": 851.23,
          "y": 385.57
        },
        "term:echo effect": {
          "x": 587.04,
          "y": 502.43
        },
        "term:misperception": {
          "x": 670.7,
          "y": 598
        },
        "term:known last round": {
          "x": 493.89,
          "y": 598
        },
        "term:envy": {
          "x": 361.1,
          "y": 598
        },
        "term:clustering": {
          "x": 394.76,
          "y": 267.65
        },
        "term:evolutionary stability": {
          "x": 116.72,
          "y": 481.35
        },
        "term:territoriality": {
          "x": 64.1,
          "y": 296.36
        },
        "term:live and let live": {
          "x": 141.08,
          "y": 157.53
        },
        "term:tit for tat": {
          "x": 497.6,
          "y": 324.07
        },
        "term:provocability": {
          "x": 710.28,
          "y": 469.77
        },
        "term:shadow of the future": {
          "x": 342.45,
          "y": 131.21
        },
        "cluster:0": {
          "x": 635.91,
          "y": 82.42
        },
        "cluster:1": {
          "x": 716.38,
          "y": 279.27
        },
        "cluster:2": {
          "x": 398.43,
          "y": 452.48
        },
        "cluster:3": {
          "x": 237.75,
          "y": 318.04
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:02:17.972Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:02:11.457Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
