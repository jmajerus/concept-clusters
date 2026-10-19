// Generated from content/puzzles/gradual-institutional-change.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "gradual-institutional-change",
  "title": "How Institutions Change Gradually",
  "category": "sociology",
  "subcategories": {
    "sociology": "social-change"
  },
  "info": {
    "text": "Institutions can endure while changing in subtle ways. Historical institutionalists study how past choices shape later options and how rules, their enforcement, and their effects shift incrementally.",
    "citations": [
      {
        "title": "A Theory of Gradual Institutional Change",
        "author": "James Mahoney and Kathleen Thelen",
        "publisher": "Cambridge University Press",
        "year": "2010",
        "pages": "1-37",
        "url": "https://www.cambridge.org/core/books/abs/explaining-institutional-change/theory-of-gradual-institutional-change/3197D231F22005DBE6463E056A44BF49"
      },
      {
        "title": "Increasing Returns, Path Dependence, and the Study of Politics",
        "author": "Paul Pierson",
        "publisher": "American Political Science Review",
        "year": "2000",
        "pages": "251-267",
        "url": "https://www.cambridge.org/core/journals/american-political-science-review/article/abs/increasing-returns-path-dependence-and-the-study-of-politics/AC2137B913363E33D97FC5CEC17CC75D"
      },
      {
        "title": "How Institutions Evolve: The Political Economy of Skills in Germany, Britain, the United States, and Japan",
        "author": "Kathleen Thelen",
        "publisher": "Cambridge University Press",
        "year": "2004",
        "url": "https://www.cambridge.org/core/books/how-institutions-evolve/41C3108269725FA3AF2C4AE87A50685E"
      },
      {
        "title": "Drift and Conversion: Hidden Faces of Institutional Change",
        "author": "Jacob S. Hacker, Paul Pierson, and Kathleen Thelen",
        "publisher": "Cambridge University Press",
        "year": "2015",
        "url": "https://www.cambridge.org/core/books/abs/advances-in-comparativehistorical-analysis/drift-and-conversion-hidden-faces-of-institutional-change/6484F82F28B944279F239F14722C07AF"
      },
      {
        "title": "History Meets Social Science",
        "author": "Thomas Fetzer",
        "publisher": "Contemporary European History",
        "year": "2013",
        "pages": "527-536",
        "url": "https://www.cambridge.org/core/journals/contemporary-european-history/article/history-meets-social-science/E7C2E18CB8D17768932E952C652614BB"
      }
    ]
  },
  "clusters": [
    {
      "id": "historical-pathways",
      "name": "Historical Pathways and Persistence",
      "color": "teal",
      "fact": "Path-dependent development occurs when earlier choices shape and sometimes reinforce later options. Increasing returns can make a chosen path more advantageous to continue, while critical junctures are periods when several alternatives become more consequential. Institutions can also persist through routines and policy feedback, but persistence does not make them permanent.",
      "terms": [
        "path dependence",
        "critical juncture",
        "increasing returns",
        "institutional reproduction",
        "policy feedback"
      ],
      "seeds": [
        "path dependence",
        "critical juncture"
      ],
      "termInfo": {
        "path dependence": "A process in which earlier choices shape later possibilities, often because following an established path becomes easier or more rewarding.",
        "critical juncture": "A period of heightened contingency when choices among alternatives can redirect a longer institutional trajectory.",
        "increasing returns": "A dynamic in which the benefits of continuing along a chosen path grow as that path is used or reinforced.",
        "institutional reproduction": "The practices, incentives, expectations, and resources that sustain an institutional arrangement over time.",
        "policy feedback": "Ways an existing policy reshapes later political resources, incentives, group identities, or choices about policy."
      }
    },
    {
      "id": "gradual-change-modes",
      "name": "Modes of Gradual Institutional Change",
      "color": "blue",
      "fact": "A four-mode framework distinguishes layering, drift, conversion, and displacement. Layering adds rules alongside existing ones; drift changes a rule's effects as its context shifts; conversion redirects existing rules toward new purposes; displacement replaces existing rules. These are analytic distinctions, and real cases may combine modes.",
      "terms": [
        "layering",
        "drift",
        "conversion",
        "displacement"
      ],
      "seeds": [
        "layering",
        "drift"
      ],
      "termInfo": {
        "layering": "Adding new rules alongside existing rules, which can gradually change how the institution works without removing its older parts.",
        "drift": "A change in the effects of formal rules because the surrounding context changes while the rules themselves remain in place.",
        "conversion": "Redirecting existing rules or institutions toward new purposes through actors' interpretation or use.",
        "displacement": "Replacing existing rules or arrangements with new ones; the pace of replacement can vary."
      }
    },
    {
      "id": "rules-interpretation-and-power",
      "name": "Rules, Interpretation, and Power",
      "color": "amber",
      "fact": "Institutional change depends partly on how clearly rules specify action, how much discretion actors have in interpreting and enforcing them, and whether powerful players can block formal change. Those features shape opportunities for strategies such as layering or conversion but do not mechanically determine an outcome.",
      "terms": [
        "rule ambiguity",
        "veto player",
        "interpretive discretion",
        "enforcement discretion",
        "distributional conflict"
      ],
      "seeds": [
        "rule ambiguity",
        "veto player"
      ],
      "termInfo": {
        "rule ambiguity": "A feature of a rule whose wording or application allows more than one plausible interpretation.",
        "interpretive discretion": "The latitude an actor has to decide how an institutional rule should be understood or applied.",
        "enforcement discretion": "The latitude actors have in monitoring, enforcing, or responding to compliance with a rule.",
        "veto player": "An actor whose agreement is required for a formal change under a particular decision process, giving them the ability to block it.",
        "distributional conflict": "A struggle over how institutional rules allocate benefits, resources, or costs among groups."
      }
    }
  ],
  "bridges": [
    {
      "id": "cumulative-transformation",
      "term": "cumulative transformation",
      "clusters": [
        1,
        0
      ],
      "fact": "A series of incremental changes can cumulatively transform an institution's form or effects, even when parts of the earlier arrangement persist. The sequence of small changes can therefore redirect a longer historical pathway.",
      "relationKind": "dynamic",
      "idealTerms": [
        "layering",
        "path dependence"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "endogenous-change",
      "term": "endogenous change",
      "clusters": [
        2,
        1
      ],
      "fact": "Endogenous change arises through processes within an existing institution, including actors' struggles, interpretation of rules, and enforcement choices. It can unfold without a single external shock, although surrounding conditions still matter.",
      "relationKind": "dynamic",
      "idealTerms": [
        "interpretive discretion",
        "conversion"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "drift-or-conversion",
      "prompt": "Which mode changes an institution's effects when its context shifts while the rules stay fixed, and which redirects existing rules toward new purposes?",
      "explanation": "Drift works through changing context around rules that remain formally in place. Conversion changes how existing rules are used by redirecting their purpose.",
      "targets": [
        "drift",
        "conversion"
      ],
      "reasons": {
        "drift": "The formal rules stay in place while changing conditions alter their effects.",
        "conversion": "Actors use existing rules or arrangements for new purposes."
      }
    },
    {
      "id": "add-or-replace",
      "prompt": "Which mode adds rules alongside existing ones, and which replaces existing rules with new ones?",
      "explanation": "Layering preserves older rules while adding new ones. Displacement replaces older rules; replacement may happen quickly or through a longer transition.",
      "targets": [
        "layering",
        "displacement"
      ],
      "reasons": {
        "layering": "New rules are added without removing the older ones.",
        "displacement": "Existing rules or arrangements are replaced."
      }
    },
    {
      "id": "path-and-turning-points",
      "prompt": "Which concepts name a self-shaping historical process, growing benefits from continuing a path, and a period when choices can redirect that path?",
      "explanation": "Path dependence concerns how earlier choices shape later possibilities; increasing returns can reinforce continuation; a critical juncture is a period when alternative choices become especially consequential.",
      "targets": [
        "path dependence",
        "increasing returns",
        "critical juncture"
      ],
      "reasons": {
        "path dependence": "Earlier choices affect the options and outcomes that follow.",
        "increasing returns": "Continuing a path becomes more advantageous as it is reinforced.",
        "critical juncture": "A period of heightened contingency in which choices can redirect a trajectory."
      }
    },
    {
      "id": "rule-meaning-and-enforcement",
      "prompt": "Which terms distinguish an open-to-interpretation rule from actors' latitude to interpret or enforce it?",
      "explanation": "Ambiguity is a property of the rule; interpretive discretion is latitude over its meaning or application; enforcement discretion concerns how compliance is monitored or pursued.",
      "targets": [
        "rule ambiguity",
        "interpretive discretion",
        "enforcement discretion"
      ],
      "reasons": {
        "rule ambiguity": "The rule itself admits multiple plausible readings.",
        "interpretive discretion": "An actor has latitude in understanding or applying a rule.",
        "enforcement discretion": "An actor has latitude in monitoring or responding to compliance."
      }
    },
    {
      "id": "blocking-and-distribution",
      "prompt": "Which concept names an actor able to block a formal change, and which names conflict over who benefits or pays under the rules?",
      "explanation": "A veto player can prevent a proposed change under particular decision rules. Distributional conflict concerns the unequal benefits and costs that can motivate struggles over institutions.",
      "targets": [
        "veto player",
        "distributional conflict"
      ],
      "reasons": {
        "veto player": "An actor whose agreement is needed and who can block a formal change.",
        "distributional conflict": "A dispute over how institutional arrangements allocate benefits and costs."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Persistence, adaptation, and accumulated change",
    "summary": "See how institutions endure, how gradual processes alter their rules and effects, and why the mechanisms depend on power and interpretation.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Institutions are relatively durable rules, norms, and procedures that shape behavior. Their durability does not mean they never change. A constitution, policy, or routine can preserve familiar features while people alter how it is interpreted, enforced, or combined with new rules. Sociologists and political scientists use historical institutionalism to study those processes over time.\r\n\r\n## Why an institution persists\r\n\r\nPath dependence describes how earlier choices shape later possibilities. When a path becomes established, people may build skills, expectations, organizations, and resources around it. Increasing returns can make continuation more advantageous as those investments accumulate. Policy feedback occurs when an existing policy reshapes later political resources, incentives, or group identities. These processes can reproduce an institution, but they do not make it permanent or inevitable.\r\n\r\nA critical juncture is a period when choices among alternatives have unusual consequences for a longer trajectory. It helps explain how a path begins or changes direction. Gradual change can also happen between such periods, during more settled times. A history of institutional change therefore need not be a chain of long stasis interrupted by dramatic breaks.\r\n\r\n## Four ways an institution can change gradually\r\n\r\nLayering adds new rules alongside older ones. The original arrangement remains, but the new layer can gradually change what actors do and which parts of the institution matter most. Drift occurs when formal rules stay the same but the surrounding environment changes their effects. For example, a wage floor that is not adjusted as prices rise can lose purchasing power even though its stated amount does not change.\r\n\r\nConversion occurs when actors redirect existing rules toward new purposes. The wording may remain, but the way people interpret or use it shifts. Displacement replaces existing rules or arrangements with new ones. Displacement can be abrupt, but replacement can also unfold across a longer transition. The four labels distinguish processes; they do not guarantee that every case fits only one category.\r\n\r\n## Rules, actors, and power\r\n\r\nThe same rules can leave different amounts of room for interpretation or enforcement. Rule ambiguity means that more than one reading is plausible. Interpretive discretion is an actor's latitude to choose how a rule applies; enforcement discretion is latitude in monitoring or responding to compliance. Veto players can block formal changes when a decision process requires their agreement. These conditions shape the strategies available, including efforts to add rules, redirect existing ones, or let their effects shift.\r\n\r\nInstitutional rules also distribute resources and costs, so conflicts over who benefits can shape their maintenance or transformation. A useful explanation therefore asks what changed, who could interpret or enforce the rules, who had power to block formal revision, and how earlier decisions constrained later choices.\r\n\r\nSlow changes can accumulate into a substantial transformation while parts of an older institution remain recognizable. Historical institutionalist categories help organize that evidence, but scholars debate how well any one typology captures a particular case. Use the labels to compare mechanisms, then check the case's history and context."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (gpt-6-luna)",
        "reasoning": "max"
      }
    ]
  },
  "language": "en"
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "gradual-institutional-change",
      "puzzleRevision": "fnv1a32:88e12959",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:path dependence": {
          "x": 286.88,
          "y": 285.29,
          "pinned": false
        },
        "term:critical juncture": {
          "x": 420.42,
          "y": 350.9,
          "pinned": false
        },
        "term:increasing returns": {
          "x": 287.79,
          "y": 437.24,
          "pinned": false
        },
        "term:institutional reproduction": {
          "x": 122.36,
          "y": 350.93,
          "pinned": false
        },
        "term:policy feedback": {
          "x": 185.31,
          "y": 185.34,
          "pinned": false
        },
        "term:layering": {
          "x": 557.58,
          "y": 111.17,
          "pinned": false
        },
        "term:drift": {
          "x": 591.62,
          "y": 29,
          "pinned": false
        },
        "term:conversion": {
          "x": 660.91,
          "y": 94.35,
          "pinned": false
        },
        "term:displacement": {
          "x": 490.26,
          "y": 23,
          "pinned": false
        },
        "term:rule ambiguity": {
          "x": 559.61,
          "y": 393.82,
          "pinned": false
        },
        "term:veto player": {
          "x": 465.98,
          "y": 479.25,
          "pinned": false
        },
        "term:interpretive discretion": {
          "x": 622.26,
          "y": 241.68,
          "pinned": false
        },
        "term:enforcement discretion": {
          "x": 600.48,
          "y": 549.96,
          "pinned": false
        },
        "term:distributional conflict": {
          "x": 723.74,
          "y": 405.71,
          "pinned": false
        },
        "term:cumulative transformation": {
          "x": 417.74,
          "y": 170.63,
          "pinned": false
        },
        "term:endogenous change": {
          "x": 776.25,
          "y": 160.67,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2539.64,
        "score": 2539.64272195039
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:43:13.042Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "gradual-institutional-change",
      "puzzleRevision": "fnv1a32:88e12959",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 717.1,
          "y": 252.51,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 448.97,
          "pinned": false
        },
        "cluster:2": {
          "x": 242.9,
          "y": 252.51,
          "pinned": false
        }
      },
      "bridges": {
        "term:cumulative transformation": {
          "x": 694.72,
          "y": 446.91,
          "pinned": false
        },
        "term:endogenous change": {
          "x": 457.53,
          "y": 310.94,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "path dependence",
          "critical juncture",
          "increasing returns",
          "institutional reproduction",
          "policy feedback"
        ],
        "cluster:1": [
          "layering",
          "drift",
          "conversion",
          "displacement"
        ],
        "cluster:2": [
          "rule ambiguity",
          "veto player",
          "interpretive discretion",
          "enforcement discretion",
          "distributional conflict"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "policy feedback",
          "increasing returns",
          "institutional reproduction",
          "critical juncture",
          "path dependence"
        ],
        "cluster:1": [
          "drift",
          "conversion",
          "displacement",
          "layering"
        ],
        "cluster:2": [
          "rule ambiguity",
          "enforcement discretion",
          "distributional conflict",
          "interpretive discretion",
          "veto player"
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
        "edgeNodeIntersections": 0,
        "totalLength": 527.1359007222923
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:43:13.724Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "gradual-institutional-change",
      "puzzleRevision": "fnv1a32:88e12959",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:path dependence": {
          "x": 472.51,
          "y": 371.34
        },
        "term:critical juncture": {
          "x": 886.45,
          "y": 280.27
        },
        "term:increasing returns": {
          "x": 883.3,
          "y": 441.96
        },
        "term:institutional reproduction": {
          "x": 797.72,
          "y": 598
        },
        "term:policy feedback": {
          "x": 615.76,
          "y": 597.95
        },
        "term:layering": {
          "x": 361.48,
          "y": 417.23
        },
        "term:drift": {
          "x": 163.39,
          "y": 598
        },
        "term:conversion": {
          "x": 214.18,
          "y": 226.85
        },
        "term:displacement": {
          "x": 57.8,
          "y": 592.76
        },
        "term:rule ambiguity": {
          "x": 445.54,
          "y": 22
        },
        "term:veto player": {
          "x": 672.48,
          "y": 23.41
        },
        "term:interpretive discretion": {
          "x": 314.06,
          "y": 107.41
        },
        "term:enforcement discretion": {
          "x": 870.7,
          "y": 22
        },
        "term:distributional conflict": {
          "x": 752.27,
          "y": 170.06
        },
        "term:cumulative transformation": {
          "x": 445.4,
          "y": 547.08
        },
        "term:endogenous change": {
          "x": 348.39,
          "y": 282.91
        },
        "cluster:0": {
          "x": 679.58,
          "y": 393.88
        },
        "cluster:1": {
          "x": 168.35,
          "y": 418.83
        },
        "cluster:2": {
          "x": 527.07,
          "y": 179.55
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-19T03:43:14.392Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-19T03:43:12.345Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
