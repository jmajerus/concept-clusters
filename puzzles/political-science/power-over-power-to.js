// Generated from content/puzzles/power-over-power-to.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "power-over-power-to",
  "title": "Power Over, Power To",
  "category": "critical-theory-cultural-studies",
  "categories": [
    "critical-theory-cultural-studies",
    "political-science",
    "psychology"
  ],
  "subcategories": {
    "psychology": "psychoanalysis"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Erich Fromm's argument that \"power\" names two unrelated things easily mistaken for each other -- and his separate account of what actually makes an authority legitimate, exploitative, or invisible.",
    "citations": [
      {
        "title": "Escape from Freedom",
        "author": "Erich Fromm",
        "publisher": "Farrar & Rinehart",
        "year": "1941"
      },
      {
        "title": "Man for Himself: An Inquiry into the Psychology of Ethics",
        "author": "Erich Fromm",
        "publisher": "Rinehart & Company",
        "year": "1947"
      }
    ]
  },
  "clusters": [
    {
      "id": "power-to",
      "name": "Power To",
      "color": "teal",
      "fact": "Fromm insisted that power names two entirely different things easily confused with each other. Power to do something -- the capacity to act, to realize one's own faculties, what he called productiveness -- has nothing to do with dominating anyone else. It is potency and mastery in the sense of ability, not control, and it doesn't require another person's submission to exist at all.",
      "terms": [
        "potency",
        "mastery",
        "productiveness",
        "self-realization"
      ],
      "seeds": [
        "potency",
        "mastery"
      ],
      "termInfo": {
        "productiveness": "Fromm's term, from Man for Himself, for the healthy exercise of a person's own faculties -- thinking, loving, working -- as ends in themselves, not as transactions with anyone else.",
        "self-realization": "Growth in a person's own capacities, independent of anyone else's submission, authority, or control."
      },
      "info": {
        "text": "Power as capacity and ability -- what a person can actually do, exercised for its own sake rather than over anyone else."
      }
    },
    {
      "id": "power-over",
      "name": "Power Over",
      "color": "amber",
      "fact": "The other sense of power, domination over another person, Fromm traced to weakness rather than strength: the drive to dominate substitutes for a genuine selfhood someone lacks, a way of escaping the anxiety of being a separate, isolated individual by fusing with -- and controlling -- someone else instead. Sadism, in his account, is this same escape for aloneness carried to its most destructive form.",
      "terms": [
        "domination",
        "exploitation",
        "sadism",
        "flight from aloneness"
      ],
      "seeds": [
        "domination",
        "exploitation"
      ],
      "termInfo": {
        "flight from aloneness": "Fromm's claim, from Escape from Freedom, that the drive to dominate is rooted in weakness, not strength -- an attempt to escape the anxiety of individual separateness by fusing with and controlling another person.",
        "sadism": "For Fromm, the most destructive form the flight from aloneness can take: needing another person's submission not incidentally but as the whole point."
      },
      "info": {
        "text": "Power as domination -- control over another person, which Fromm read as compensation for a lack rather than an expression of real strength."
      }
    },
    {
      "id": "kinds-of-authority",
      "name": "Kinds of Authority",
      "color": "blue",
      "fact": "Fromm distinguished authority by what sustains it. Rational authority rests on demonstrated competence, holds between people who remain fundamentally equal, and is supposed to diminish as the less experienced party grows -- a teacher's authority over a student, ideally. Irrational authority requires the other person's submission to survive at all, exploits rather than develops them, and has to be continually fed. Anonymous authority is the newest and hardest to resist: no one gives an order, and unspoken conformity to what everyone else is already doing enforces itself instead.",
      "terms": [
        "rational authority",
        "irrational authority",
        "anonymous authority",
        "conformity"
      ],
      "seeds": [
        "rational authority",
        "irrational authority"
      ],
      "termInfo": {
        "anonymous authority": {
          "text": "Authority with no visible source -- no person, office, or law giving an order -- exercised instead through unspoken pressure to conform to what everyone else already seems to be doing or believing.",
          "links": [
            {
              "href": "wiki:Erich Fromm"
            }
          ]
        },
        "conformity": "The outcome anonymous authority produces: adjustment to the group not because anyone commanded it, but because standing apart starts to feel unthinkable.",
        "irrational authority": {
          "links": [
            {
              "href": "wiki:Traditional authority"
            }
          ]
        },
        "rational authority": {
          "links": [
            {
              "href": "wiki:Rational-legal authority"
            }
          ]
        }
      },
      "info": {
        "text": "Fromm's classification of authority by what actually sustains obedience to it -- competence, extracted submission, or invisible conformity."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-competence",
      "term": "competence",
      "clusters": [
        0,
        2
      ],
      "fact": "Rational authority is legitimate specifically because it rests on the same thing as power to: real, demonstrated mastery. A teacher's authority over a student is rational exactly to the extent it tracks actual competence, and is supposed to dissolve as the student's own mastery catches up.",
      "relationKind": "foundation",
      "idealTerms": [
        "mastery",
        "rational authority"
      ]
    },
    {
      "id": "bridge-submission",
      "term": "submission",
      "clusters": [
        1,
        2
      ],
      "fact": "Irrational authority and domination are, for Fromm, close to the same phenomenon seen from two sides: an irrational authority survives only by continually extracting submission, and a drive to dominate needs someone submitting to it just as continually. Neither is a stable possession; both must be constantly re-secured.",
      "relationKind": "foundation",
      "idealTerms": [
        "domination",
        "irrational authority"
      ]
    },
    {
      "id": "bridge-freedom",
      "term": "freedom",
      "clusters": [
        0,
        1
      ],
      "fact": "These are not two points on one scale but opposite responses to the same condition: power to is what free, developed capacity actually looks like, while power over is what Fromm argued people reach for specifically to escape the anxiety of being free and separate in the first place.",
      "relationKind": "contrast",
      "idealTerms": [
        "self-realization",
        "flight from aloneness"
      ]
    }
  ],
  "lenses": [
    {
      "id": "needs-feeding",
      "prompt": "Which of these must be continually re-secured through another person's submission, rather than being a stable possession?",
      "explanation": "None of these can simply be achieved and then held. Domination has to keep dominating; sadism has to keep controlling to relieve the isolation it covers for; irrational authority has to keep extracting submission or it collapses. Power to, by contrast, is a capacity a person actually has, whether or not anyone else is involved at all.",
      "targets": [
        "domination",
        "sadism",
        "irrational authority"
      ],
      "reasons": {
        "domination": "Requires an ongoing relationship of control, not a one-time achievement.",
        "irrational authority": "Survives only by continually extracting submission; it has no independent basis.",
        "sadism": "The underlying isolation it defends against returns the moment control lapses."
      }
    },
    {
      "id": "aimed-at-independence",
      "prompt": "Which of these are meant to leave a person more capable and independent, rather than more dependent on someone else?",
      "explanation": "Rational authority is unusual among the forms of authority here because it is designed to shrink: a good teacher's authority over a student is supposed to diminish as the student's own competence grows, which is exactly the direction productiveness and self-realization already point on their own -- toward a person's own capacities, not toward continued reliance on someone else.",
      "targets": [
        "rational authority",
        "productiveness",
        "self-realization"
      ],
      "reasons": {
        "productiveness": "The exercise of a person's own faculties, not a transaction with anyone else.",
        "rational authority": "Explicitly meant to diminish as the other person's own competence grows.",
        "self-realization": "Growth in one's own capacity, independent of anyone else's submission or authority."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-authority-and-the-state",
        "reason": "Compare Weber's legitimacy-based authority and French and Raven's five power bases against Fromm's own two-part reading of power, and his separate account of what makes an authority rational, irrational, or anonymous.",
        "via": [
          "legitimacy",
          "obedience"
        ]
      }
    ]
  },
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
      "puzzleId": "power-over-power-to",
      "puzzleRevision": "fnv1a32:5250038c",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:potency": {
          "x": 284.35,
          "y": 256.81,
          "pinned": false
        },
        "term:mastery": {
          "x": 192.98,
          "y": 268.32,
          "pinned": false
        },
        "term:productiveness": {
          "x": 251.71,
          "y": 366.19,
          "pinned": false
        },
        "term:self-realization": {
          "x": 386.65,
          "y": 320.39,
          "pinned": false
        },
        "term:domination": {
          "x": 576.7,
          "y": 128.59,
          "pinned": false
        },
        "term:exploitation": {
          "x": 494.79,
          "y": 40.9,
          "pinned": false
        },
        "term:sadism": {
          "x": 599.1,
          "y": 32.79,
          "pinned": false
        },
        "term:flight from aloneness": {
          "x": 551.85,
          "y": 275.04,
          "pinned": false
        },
        "term:rational authority": {
          "x": 189.39,
          "y": 23,
          "pinned": false
        },
        "term:irrational authority": {
          "x": 345.51,
          "y": 84.16,
          "pinned": false
        },
        "term:anonymous authority": {
          "x": 93.06,
          "y": 156.45,
          "pinned": false
        },
        "term:conformity": {
          "x": 53.5,
          "y": 23,
          "pinned": false
        },
        "term:competence": {
          "x": 231.75,
          "y": 169.95,
          "pinned": false
        },
        "term:submission": {
          "x": 468.98,
          "y": 155.32,
          "pinned": false
        },
        "term:freedom": {
          "x": 483.06,
          "y": 392.58,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2310.31,
        "score": 2310.310680412277
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:16:36.645Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "power-over-power-to",
      "puzzleRevision": "fnv1a32:5250038c",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480,
          "y": 196.57,
          "pinned": false
        },
        "cluster:1": {
          "x": 708.38,
          "y": 378.72,
          "pinned": false
        },
        "cluster:2": {
          "x": 251.62,
          "y": 378.72,
          "pinned": false
        }
      },
      "bridges": {
        "term:competence": {
          "x": 292.27,
          "y": 214.1,
          "pinned": false
        },
        "term:submission": {
          "x": 480,
          "y": 378.72,
          "pinned": false
        },
        "term:freedom": {
          "x": 667.73,
          "y": 214.1,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "potency",
          "mastery",
          "productiveness",
          "self-realization"
        ],
        "cluster:1": [
          "domination",
          "exploitation",
          "sadism",
          "flight from aloneness"
        ],
        "cluster:2": [
          "rational authority",
          "irrational authority",
          "anonymous authority",
          "conformity"
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
        "totalLength": 370.2316586400926
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:16:39.029Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "power-over-power-to",
      "puzzleRevision": "fnv1a32:5250038c",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:potency": {
          "x": 662.59,
          "y": 23.09
        },
        "term:mastery": {
          "x": 541.37,
          "y": 122.36
        },
        "term:productiveness": {
          "x": 756.18,
          "y": 95.24
        },
        "term:self-realization": {
          "x": 577.23,
          "y": 241.54
        },
        "term:domination": {
          "x": 563.14,
          "y": 455.01
        },
        "term:exploitation": {
          "x": 802.98,
          "y": 438.32
        },
        "term:sadism": {
          "x": 740.89,
          "y": 527.55
        },
        "term:flight from aloneness": {
          "x": 736.3,
          "y": 297.34
        },
        "term:rational authority": {
          "x": 377.33,
          "y": 300.34
        },
        "term:irrational authority": {
          "x": 415.42,
          "y": 469.77
        },
        "term:anonymous authority": {
          "x": 200.9,
          "y": 570.55
        },
        "term:conformity": {
          "x": 117.19,
          "y": 440.17
        },
        "term:competence": {
          "x": 456.12,
          "y": 184.46
        },
        "term:submission": {
          "x": 506.34,
          "y": 354.99
        },
        "term:freedom": {
          "x": 611.67,
          "y": 361.26
        },
        "cluster:0": {
          "x": 640.17,
          "y": 130.63
        },
        "cluster:1": {
          "x": 680.87,
          "y": 440.96
        },
        "cluster:2": {
          "x": 254.25,
          "y": 410.66
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:16:41.618Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:16:33.572Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
