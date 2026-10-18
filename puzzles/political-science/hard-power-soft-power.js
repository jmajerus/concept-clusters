// Generated from content/puzzles/hard-power-soft-power.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "hard-power-soft-power",
  "title": "Hard Power vs Soft Power",
  "category": "political-science",
  "subcategories": {
    "political-science": "international-relations"
  },
  "info": {
    "text": "Why coercion and purchased compliance are brittle, and why attraction endures: Nye's hard, soft, smart, and sharp power, taught through the instruments states actually use.",
    "links": [
      {
        "href": "https://www.belfercenter.org/publication/joseph-nye-smart-power-iran-us-relations"
      },
      {
        "href": "https://www.nature.com/articles/palcomms20178"
      }
    ],
    "citations": [
      {
        "title": "Soft Power: The Means to Success in World Politics",
        "author": "Joseph S. Nye Jr.",
        "publisher": "PublicAffairs",
        "year": "2004"
      },
      {
        "title": "The Future of Power",
        "author": "Joseph S. Nye Jr.",
        "publisher": "PublicAffairs",
        "year": "2011"
      },
      {
        "title": "Sharp Power: Rising Authoritarian Influence",
        "author": "Christopher Walker and Jessica Ludwig",
        "publisher": "National Endowment for Democracy",
        "year": "2017"
      }
    ]
  },
  "clusters": [
    {
      "id": "coercion-by-force",
      "name": "Coercion by military force",
      "color": "teal",
      "fact": "Military coercion compels compliance through violence or its threat: intervention, deployments, blockades, buildups, and diplomacy conducted with force behind it. Nye counts this, with economic pressure, as hard power — outcomes got through coercion or payment.",
      "terms": [
        "military intervention",
        "troop deployment",
        "threat of force",
        "naval blockade",
        "coercive diplomacy",
        "arms buildup"
      ],
      "seeds": [
        "military intervention",
        "troop deployment"
      ],
      "termInfo": {
        "arms buildup": "Accumulating weapons to intimidate rivals or prepare war; capacity displayed as leverage.",
        "coercive diplomacy": "Negotiation with force behind it: demands backed by a threatened escalation if they are refused.",
        "military intervention": "Armed force sent into another state to compel an outcome — Nye's paradigmatic hard-power stick, and the costliest instrument on this board.",
        "naval blockade": "Sealing a coastline to strangle trade and supplies; siege warfare conducted through ships.",
        "threat of force": "Compellence by announced violence — compliance extracted from what the other side believes you will do.",
        "troop deployment": "Stationing forces abroad to signal resolve or prepare action; posture that threatens without yet striking."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Hard power"
          }
        ]
      }
    },
    {
      "id": "payment-and-pressure",
      "name": "Payment and economic leverage",
      "color": "blue",
      "fact": "Economic statecraft buys or pressures compliance without firing a shot: sanctions, trade terms, alliance offers, protection promises, payments, and conditioned loans. Bloodless only by comparison — it still coerces, through deprivation and dependence.",
      "terms": [
        "economic sanctions",
        "alliance offer",
        "trade barrier reduction",
        "promise of military protection",
        "payments and bribes",
        "loans conditioned on compliance"
      ],
      "seeds": [
        "economic sanctions",
        "alliance offer"
      ],
      "termInfo": {
        "alliance offer": "Promising partnership — and the protection and status inside it — to buy another state's alignment.",
        "economic sanctions": "Withholding trade, finance, or aid to punish a target into compliance; pressure through deprivation.",
        "loans conditioned on compliance": "Credit extended with political strings — dependence structured into the terms.",
        "payments and bribes": "Cash or favors for compliance, from aboveboard aid conditions to covert payoffs.",
        "promise of military protection": "Pledging to defend another state; security supplied in exchange for loyalty.",
        "trade barrier reduction": "Easing tariffs or quotas as a reward; the carrot form of trade leverage."
      },
      "info": {
        "links": [
          {
            "href": "https://www.belfercenter.org/publication/joseph-nye-smart-power-iran-us-relations"
          }
        ]
      }
    },
    {
      "id": "attraction",
      "name": "Attraction through culture, values, and legitimate policy",
      "color": "amber",
      "fact": "Soft power attracts instead of compelling: films and exchanges that fascinate, values a country actually lives up to, a protected free press, multilateral habits, and aid others judge legitimate. It works only where the audience finds it attractive.",
      "terms": [
        "Hollywood films",
        "student exchanges",
        "democratic values lived up to at home",
        "free press protection",
        "multilateral consultation",
        "legitimate development assistance"
      ],
      "seeds": [
        "Hollywood films",
        "student exchanges"
      ],
      "termInfo": {
        "Hollywood films": "American commercial cinema with global audiences, among Nye's purest examples of cultural attraction.",
        "democratic values lived up to at home": "Liberty, equality, and the rule of law as actually practiced; values attract only when a country visibly honors them.",
        "free press protection": "Safeguarding independent journalism at home and abroad; credibility no censored system can borrow.",
        "legitimate development assistance": "Aid judged generous and fair by its recipients — the same money as foreign aid, experienced as admiration rather than purchase.",
        "multilateral consultation": "Working through institutions and consulting others before acting; the habit that makes policies look legitimate.",
        "student exchanges": "Study abroad that builds lasting affinity for a host country in future elites — attraction with a decades-long fuse."
      },
      "info": {
        "links": [
          {
            "href": "https://www.nature.com/articles/palcomms20178"
          }
        ]
      }
    },
    {
      "id": "combination-and-corruption",
      "name": "Combining and corrupting the logics",
      "color": "magenta",
      "fact": "Strategists combine the logics or corrupt them: smart power weds coercion and attraction, public diplomacy courts foreign publics, and sharp power pierces open societies with censorship and manipulated information.",
      "terms": [
        "smart power strategy",
        "public diplomacy campaign",
        "sharp power operations",
        "outward-facing censorship",
        "Confucius Institutes controversy",
        "cyber-enabled influence operation"
      ],
      "seeds": [
        "smart power strategy",
        "public diplomacy campaign"
      ],
      "termInfo": {
        "Confucius Institutes controversy": "The debate over Chinese state-funded language institutes on Western campuses: cultural exchange to defenders, vectors of censorship and self-censorship to critics.",
        "cyber-enabled influence operation": "Covert digital campaigns — hacks, leaks, bot networks — that manipulate what a target public sees and believes.",
        "outward-facing censorship": "Suppressing critical voices beyond one's borders — the information control sharp power exports.",
        "public diplomacy campaign": "A state courting foreign publics directly — broadcasts, exchanges, messaging — to be admired rather than merely obeyed.",
        "sharp power operations": "Walker and Ludwig's category for authoritarian influence that pierces open societies instead of attracting them.",
        "smart power strategy": "Nye's doctrine of combining hard and soft power so each covers the other's failures; force alone, the evidence says, does not persuade."
      },
      "info": {
        "links": [
          {
            "href": "https://www.demdigest.org/advancing-or-retarding-democracy-soft-power-is-out-sharp-power-is-in/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "foreign-aid",
      "term": "foreign aid",
      "clusters": [
        1,
        2
      ],
      "fact": "The same aid package works twice: as a bargained payment that buys compliance, and as attraction when recipients judge it legitimate and generous — which is why Nye's framework lets one instrument speak both logics.",
      "info": {
        "text": "Aid as both bargain and admiration: the instrument Nye's framework lets speak two logics at once.",
        "links": [
          {
            "href": "https://www.belfercenter.org/publication/joseph-nye-smart-power-iran-us-relations"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "payments and bribes",
        "legitimate development assistance"
      ]
    },
    {
      "id": "smart-power",
      "term": "smart power",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Nye's smart power is the deliberate combination of coercion and payment with attraction, on the evidence that hard power alone does not translate into lasting influence — the hinge the whole board turns on.",
      "info": {
        "text": "Nye's combination doctrine: coercion and payment wedded to attraction, because force alone does not persuade.",
        "links": [
          {
            "href": "https://www.the-american-interest.com/2007/11/01/smart-power/"
          }
        ]
      }
    },
    {
      "id": "information-manipulation",
      "term": "information manipulation",
      "clusters": [
        2,
        3
      ],
      "fact": "Walker and Ludwig's sharp-power critique: authoritarian manipulation pierces the open information environments that soft power depends on, corroding the very attraction it mimics.",
      "info": {
        "text": "Walker and Ludwig's corruption critique: manipulation that pierces open societies instead of attracting them.",
        "links": [
          {
            "href": "https://www.demdigest.org/advancing-or-retarding-democracy-soft-power-is-out-sharp-power-is-in/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "sharp power operations"
      ]
    }
  ],
  "lenses": [
    {
      "id": "culture-that-fascinates",
      "prompt": "Which concepts are cultural exports that fascinate foreign publics — admired and adopted for their own sake, rather than forced, bought, or campaigned for?",
      "explanation": "Each is a cultural export admired for its own sake — films watched and exchanges remembered fondly years later. A public diplomacy campaign is state-directed persuasion machinery, not an export that fascinates on its own, and the Confucius Institutes controversy names a debate about a vehicle, not the fascination itself.",
      "targets": [
        "Hollywood films",
        "student exchanges"
      ],
      "reasons": {
        "Hollywood films": "Commercial cinema with global audiences who choose it freely.",
        "student exchanges": "Study abroad that builds affinity in future elites over decades."
      }
    },
    {
      "id": "short-of-attack",
      "prompt": "Which concepts threaten, display, or impose costs without yet striking — pressure applied short of actual attack?",
      "explanation": "Every one of these positions force or cost without yet using it to strike: threats announced, ships and troops displayed, arsenals accumulated, negotiations backed by escalation, sanctions imposed. Military intervention is the strike itself and is excluded — as are all the carrots, payments, and attractions.",
      "targets": [
        "threat of force",
        "naval blockade",
        "troop deployment",
        "arms buildup",
        "coercive diplomacy",
        "economic sanctions"
      ],
      "reasons": {
        "arms buildup": "Capacity accumulated as leverage, not yet used.",
        "coercive diplomacy": "Demands backed by threatened escalation, not yet carried out.",
        "economic sanctions": "Deprivation imposed without any violence.",
        "naval blockade": "Strangulation positioned at sea, short of invasion.",
        "threat of force": "Announced violence that has not happened.",
        "troop deployment": "Forces stationed as signal, not yet engaged."
      }
    },
    {
      "id": "both-logics-at-once",
      "prompt": "Which concepts work through two logics at once — payment and attraction in the same instrument, or doctrines that deliberately combine them?",
      "explanation": "Each of these speaks two logics in one breath: aid as both purchase and admiration, and the doctrines that deliberately combine coercion with attraction. An alliance offer or a protection promise buys alignment with security goods but claims no admiration of its own, so neither answers.",
      "targets": [
        "foreign aid",
        "legitimate development assistance",
        "smart power",
        "smart power strategy"
      ],
      "reasons": {
        "foreign aid": "One package, two readings: bargained payment and admired generosity.",
        "legitimate development assistance": "The same money as foreign aid, experienced as admiration.",
        "smart power": "The combination doctrine itself, spanning all three logics.",
        "smart power strategy": "The deliberate wedding of coercion to attraction."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "three-faces-of-power",
        "reason": "The theory behind the board: Lukes' three faces show power working through decisions, agenda control, and shaped wants — the deeper account of what coercion, payment, and attraction each exploit."
      },
      {
        "id": "witness-without-a-sword",
        "reason": "The converse lesson: humanitarian witnesses with plenty of naming power and none of the compelling kind — what influence looks like when coercion is entirely absent."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Why force alone fails",
    "summary": "Nye's hard, soft, smart, and sharp power: how states coerce, pay, attract — and corrupt.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "## Coercion, payment, and attraction\r\n\r\nJoseph Nye's distinction starts from a simple observation: states get others to comply in three different ways. Hard power coerces or pays — military intervention and naval blockades on one side, economic sanctions and conditioned loans on the other. Soft power attracts instead: Hollywood films and student exchanges that fascinate, democratic values a country actually lives up to, and foreign policies others judge legitimate. The same instrument can speak both logics — foreign aid buys compliance and, when seen as generous, admiration too.\r\n\r\nNye's further lesson is the one this puzzle turns on: hard power alone does not translate into lasting influence. Smart power is his name for combining coercion with attraction, and its mirror image is sharp power — Walker and Ludwig's term for authoritarian operations that pierce open societies with censorship and manipulated information, corroding the very attraction they mimic. As you play, notice which instruments purchase compliance and which earn admiration — and what each purchase costs."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
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
    "star": {
      "schemaVersion": 1,
      "puzzleId": "hard-power-soft-power",
      "puzzleRevision": "fnv1a32:5e3bcb74",
      "board": {
        "width": 1130,
        "height": 740
      },
      "nodes": {
        "term:military intervention": {
          "x": 457.54,
          "y": 42
        },
        "term:troop deployment": {
          "x": 1034.6,
          "y": 42
        },
        "term:threat of force": {
          "x": 546.1,
          "y": 113.99
        },
        "term:naval blockade": {
          "x": 391.08,
          "y": 103.81
        },
        "term:coercive diplomacy": {
          "x": 820.11,
          "y": 98.84
        },
        "term:arms buildup": {
          "x": 611.54,
          "y": 190.97
        },
        "term:economic sanctions": {
          "x": 1028.3,
          "y": 427.32
        },
        "term:alliance offer": {
          "x": 1044.87,
          "y": 541.16
        },
        "term:trade barrier reduction": {
          "x": 1011.56,
          "y": 341.61
        },
        "term:promise of military protection": {
          "x": 851.43,
          "y": 166.66
        },
        "term:payments and bribes": {
          "x": 1025.15,
          "y": 698
        },
        "term:loans conditioned on compliance": {
          "x": 987.35,
          "y": 223.99
        },
        "term:Hollywood films": {
          "x": 642.11,
          "y": 631.19
        },
        "term:student exchanges": {
          "x": 398,
          "y": 330.52
        },
        "term:democratic values lived up to at home": {
          "x": 330.97,
          "y": 698
        },
        "term:free press protection": {
          "x": 580.5,
          "y": 335.35
        },
        "term:multilateral consultation": {
          "x": 565.55,
          "y": 698
        },
        "term:legitimate development assistance": {
          "x": 812.78,
          "y": 698
        },
        "term:smart power strategy": {
          "x": 108,
          "y": 209.86
        },
        "term:public diplomacy campaign": {
          "x": 107.88,
          "y": 351.35
        },
        "term:sharp power operations": {
          "x": 337.37,
          "y": 397.28
        },
        "term:outward-facing censorship": {
          "x": 401.01,
          "y": 204.43
        },
        "term:Confucius Institutes controversy": {
          "x": 161.76,
          "y": 125.77
        },
        "term:cyber-enabled influence operation": {
          "x": 151.93,
          "y": 481.03
        },
        "term:foreign aid": {
          "x": 848.34,
          "y": 562.23
        },
        "term:smart power": {
          "x": 747.59,
          "y": 276.22
        },
        "term:information manipulation": {
          "x": 356.65,
          "y": 548.86
        },
        "cluster:0": {
          "x": 672.06,
          "y": 42
        },
        "cluster:1": {
          "x": 799.32,
          "y": 411.6
        },
        "cluster:2": {
          "x": 586.55,
          "y": 472.86
        },
        "cluster:3": {
          "x": 274.99,
          "y": 267.95
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T03:22:07.745Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "hard-power-soft-power",
      "puzzleRevision": "fnv1a32:5e3bcb74",
      "board": {
        "width": 1130,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 568.97,
          "y": 187.41,
          "pinned": true
        },
        "cluster:1": {
          "x": 940.83,
          "y": 362.13,
          "pinned": true
        },
        "cluster:2": {
          "x": 565,
          "y": 541.8,
          "pinned": false
        },
        "cluster:3": {
          "x": 210,
          "y": 378,
          "pinned": false
        }
      },
      "bridges": {
        "term:foreign aid": {
          "x": 797.18,
          "y": 554.99,
          "pinned": true
        },
        "term:smart power": {
          "x": 703.13,
          "y": 358.2,
          "pinned": false
        },
        "term:information manipulation": {
          "x": 268.71,
          "y": 578.69,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "military intervention",
          "troop deployment",
          "threat of force",
          "naval blockade",
          "coercive diplomacy",
          "arms buildup"
        ],
        "cluster:1": [
          "economic sanctions",
          "alliance offer",
          "trade barrier reduction",
          "promise of military protection",
          "payments and bribes",
          "loans conditioned on compliance"
        ],
        "cluster:2": [
          "Hollywood films",
          "student exchanges",
          "democratic values lived up to at home",
          "free press protection",
          "multilateral consultation",
          "legitimate development assistance"
        ],
        "cluster:3": [
          "smart power strategy",
          "public diplomacy campaign",
          "sharp power operations",
          "outward-facing censorship",
          "Confucius Institutes controversy",
          "cyber-enabled influence operation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "naval blockade",
          "troop deployment",
          "military intervention",
          "coercive diplomacy",
          "threat of force",
          "arms buildup"
        ],
        "cluster:1": [
          "economic sanctions",
          "trade barrier reduction",
          "loans conditioned on compliance",
          "promise of military protection",
          "payments and bribes",
          "alliance offer"
        ],
        "cluster:2": [
          "student exchanges",
          "multilateral consultation",
          "democratic values lived up to at home",
          "legitimate development assistance",
          "free press protection",
          "Hollywood films"
        ],
        "cluster:3": [
          "smart power strategy",
          "outward-facing censorship",
          "cyber-enabled influence operation",
          "Confucius Institutes controversy",
          "public diplomacy campaign",
          "sharp power operations"
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
        "totalLength": 755.3083912646
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T03:21:16.465Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "hard-power-soft-power",
      "puzzleRevision": "fnv1a32:5e3bcb74",
      "board": {
        "width": 1130,
        "height": 740
      },
      "nodes": {
        "term:military intervention": {
          "x": 215.44,
          "y": 546.69,
          "pinned": false
        },
        "term:troop deployment": {
          "x": 72.4,
          "y": 640.1,
          "pinned": false
        },
        "term:threat of force": {
          "x": 306.19,
          "y": 680.01,
          "pinned": false
        },
        "term:naval blockade": {
          "x": 66.1,
          "y": 497.96,
          "pinned": false
        },
        "term:coercive diplomacy": {
          "x": 160.87,
          "y": 384.94,
          "pinned": false
        },
        "term:arms buildup": {
          "x": 179.8,
          "y": 717,
          "pinned": false
        },
        "term:economic sanctions": {
          "x": 457.95,
          "y": 174.03,
          "pinned": true
        },
        "term:alliance offer": {
          "x": 370.62,
          "y": 57.69,
          "pinned": false
        },
        "term:trade barrier reduction": {
          "x": 136.12,
          "y": 180.44,
          "pinned": true
        },
        "term:promise of military protection": {
          "x": 249.84,
          "y": 262.88,
          "pinned": true
        },
        "term:payments and bribes": {
          "x": 517.49,
          "y": 23,
          "pinned": false
        },
        "term:loans conditioned on compliance": {
          "x": 175.22,
          "y": 103.36,
          "pinned": true
        },
        "term:Hollywood films": {
          "x": 573.6,
          "y": 577.46,
          "pinned": false
        },
        "term:student exchanges": {
          "x": 410.72,
          "y": 606.95,
          "pinned": true
        },
        "term:democratic values lived up to at home": {
          "x": 910.69,
          "y": 652.83,
          "pinned": false
        },
        "term:free press protection": {
          "x": 683.96,
          "y": 695.4,
          "pinned": false
        },
        "term:multilateral consultation": {
          "x": 475.17,
          "y": 717,
          "pinned": false
        },
        "term:legitimate development assistance": {
          "x": 508.65,
          "y": 389.65,
          "pinned": false
        },
        "term:smart power strategy": {
          "x": 851.98,
          "y": 191.92,
          "pinned": false
        },
        "term:public diplomacy campaign": {
          "x": 913.68,
          "y": 385.79,
          "pinned": true
        },
        "term:sharp power operations": {
          "x": 714.13,
          "y": 307.87,
          "pinned": false
        },
        "term:outward-facing censorship": {
          "x": 1029.25,
          "y": 248.55,
          "pinned": false
        },
        "term:Confucius Institutes controversy": {
          "x": 726.14,
          "y": 23,
          "pinned": false
        },
        "term:cyber-enabled influence operation": {
          "x": 988.23,
          "y": 23,
          "pinned": false
        },
        "term:foreign aid": {
          "x": 632.77,
          "y": 179.72,
          "pinned": false
        },
        "term:smart power": {
          "x": 328.77,
          "y": 438.99,
          "pinned": false
        },
        "term:information manipulation": {
          "x": 725.05,
          "y": 500.38,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6239.48,
        "score": 6239.481697468288
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T03:22:14.783Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-17T03:19:38.583Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
