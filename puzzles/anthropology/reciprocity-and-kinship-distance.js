// Generated from content/puzzles/reciprocity-and-kinship-distance.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "reciprocity-and-kinship-distance",
  "title": "Reciprocity and Kinship Distance",
  "category": "anthropology",
  "info": {
    "text": "Marshall Sahlins argued that non-market giving is structured by kinship distance: the closer the relationship, the less anyone keeps accounts, and the farther the relationship, the more each party tries to come out ahead.",
    "links": [
      {
        "href": "wiki:Reciprocity (cultural anthropology)"
      }
    ],
    "citations": [
      {
        "title": "Stone Age Economics",
        "author": "Marshall Sahlins",
        "publisher": "Aldine-Atherton",
        "year": "1972",
        "pages": "185–204"
      },
      {
        "title": "Argonauts of the Western Pacific",
        "author": "Bronisław Malinowski",
        "publisher": "Routledge & Kegan Paul",
        "year": "1922"
      }
    ]
  },
  "clusters": [
    {
      "id": "generalized-reciprocity",
      "name": "Generalized Reciprocity",
      "color": "teal",
      "fact": "Sahlins described generalized reciprocity as putatively altruistic giving in which the material match is repressed: among close kin, especially in household food sharing, the obligation to return is left vague in time, quantity, and quality, and a failure to reciprocate does not stop the giving.",
      "terms": [
        "food sharing",
        "close kin",
        "vague obligation"
      ],
      "seeds": [
        "food sharing",
        "close kin"
      ],
      "termInfo": {
        "food sharing": "The everyday movement of food inside a household or camp, treated as a social duty rather than as a matchable transaction.",
        "close kin": "The people nearest in the kinship field -- typically household and lineage intimates -- among whom Sahlins located this mode of giving.",
        "vague obligation": "A return may come someday, in some form, or not in any matched way -- and the relationship does not turn on tallying it."
      }
    },
    {
      "id": "balanced-reciprocity",
      "name": "Balanced Reciprocity",
      "color": "blue",
      "fact": "Balanced reciprocity is exchange between parties who remain distinct and expect a customary equivalent: the material match is reckoned, and the classic ethnographic case is the Kula ring, in which a partner is owed a counterpart valuable of matching rank.",
      "terms": [
        "Kula ring",
        "equivalent return",
        "exchange partner"
      ],
      "seeds": [
        "Kula ring",
        "equivalent return"
      ],
      "termInfo": {
        "Kula ring": {
          "text": "A ceremonial circuit of shell necklaces and armbands among island communities of the Massim archipelago, recorded by Malinowski, in which a partner is owed a counterpart valuable rather than an open-ended favor.",
          "links": [
            {
              "href": "wiki:Kula ring"
            }
          ]
        },
        "equivalent return": "A counter-gift or counter-payment meant to match what was given, in kind or in customary value, so that neither side remains openly indebted.",
        "exchange partner": "A lasting counterpart in dyadic exchange -- not a household intimate, not a stranger to be fleeced -- with whom equivalence is the point of the relationship."
      }
    },
    {
      "id": "negative-reciprocity",
      "name": "Negative Reciprocity",
      "color": "amber",
      "fact": "Negative reciprocity is the attempt to get something for nothing with impunity -- the most impersonal extreme, from haggling to raiding -- typical of dealings with strangers and other outsiders beyond the moral reach of kinship.",
      "terms": [
        "haggling",
        "raiding",
        "something for nothing",
        "strangers"
      ],
      "seeds": [
        "haggling",
        "raiding"
      ],
      "termInfo": {
        "haggling": "Hard bargaining in which each side tries to win a material advantage, rather than to match a customary equivalent or to leave the return unreckoned.",
        "raiding": "Taking goods by force from people treated as outsiders or enemies, the violent pole of trying to gain without a fair return.",
        "something for nothing": "Sahlins' compressed definition of this mode: gain sought with impunity, without a morally binding return.",
        "strangers": "People outside the kinship-moral field, with whom Sahlins located impersonal, self-interested taking rather than sharing or matched exchange."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-kinship-distance",
      "term": "kinship distance",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Sahlins argued that the three modes are a continuum of kinship distance, not a random typology: generalized reciprocity inside the household-kin group, balanced reciprocity among more distant community partners, and negative reciprocity with strangers and enemies.",
      "info": {
        "text": "In societies organized primarily by kinship, moral obligation tracks how close someone stands in that field: near kin are not supposed to keep accounts; strangers sit outside the ethic of matching gifts.",
        "links": [
          {
            "href": "wiki:Reciprocity (cultural anthropology)"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "close kin",
        "exchange partner",
        "strangers"
      ]
    }
  ],
  "lenses": [
    {
      "id": "who-the-giving-is-with",
      "prompt": "Which terms name who the giving or taking is with, rather than a practice, a mechanism, or the distance scale itself?",
      "explanation": "Sahlins indexes the typology by social position: close kin at the near pole, exchange partners in the middle, and strangers at the far pole. Food sharing, the Kula ring, haggling, and raiding are things people do; vague obligation, equivalent return, and something for nothing describe how return is treated; kinship distance is the scale that orders those positions.",
      "targets": [
        "close kin",
        "exchange partner",
        "strangers"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "evolution-of-cooperation",
        "reason": "That puzzle treats reciprocity as a strategy among anonymous players. This one treats it as a kinship-moral continuum of giving -- same everyday word, different lesson."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Grok (Cursor Grok 4.6)",
        "kind": "generative",
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
      "puzzleId": "reciprocity-and-kinship-distance",
      "puzzleRevision": "fnv1a32:c97b17f4",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:food sharing": {
          "x": 192.64,
          "y": 171.8,
          "pinned": false
        },
        "term:close kin": {
          "x": 228.46,
          "y": 63.4,
          "pinned": false
        },
        "term:vague obligation": {
          "x": 101.9,
          "y": 70.23,
          "pinned": false
        },
        "term:Kula ring": {
          "x": 394.31,
          "y": 251.09,
          "pinned": false
        },
        "term:equivalent return": {
          "x": 387.67,
          "y": 380.81,
          "pinned": false
        },
        "term:exchange partner": {
          "x": 271.58,
          "y": 282.78,
          "pinned": false
        },
        "term:haggling": {
          "x": 508.44,
          "y": 23,
          "pinned": false
        },
        "term:raiding": {
          "x": 595.95,
          "y": 60.31,
          "pinned": false
        },
        "term:something for nothing": {
          "x": 505.73,
          "y": 162.26,
          "pinned": false
        },
        "term:strangers": {
          "x": 410.53,
          "y": 49.83,
          "pinned": false
        },
        "term:kinship distance": {
          "x": 326.03,
          "y": 144.31,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 1584.43,
        "score": 1584.4318147592217
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:35:25.281Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "reciprocity-and-kinship-distance",
      "puzzleRevision": "fnv1a32:c97b17f4",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 696.15,
          "y": 253.06,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 447.88,
          "pinned": false
        },
        "cluster:2": {
          "x": 263.85,
          "y": 253.06,
          "pinned": false
        }
      },
      "bridges": {
        "term:kinship distance": {
          "x": 454.13,
          "y": 307.28,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "food sharing",
          "close kin",
          "vague obligation"
        ],
        "cluster:1": [
          "Kula ring",
          "equivalent return",
          "exchange partner"
        ],
        "cluster:2": [
          "haggling",
          "raiding",
          "something for nothing",
          "strangers"
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
        "totalLength": 256.6753553981433
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:35:27.566Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "reciprocity-and-kinship-distance",
      "puzzleRevision": "fnv1a32:c97b17f4",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:food sharing": {
          "x": 191.43,
          "y": 554.18
        },
        "term:close kin": {
          "x": 388.16,
          "y": 309.5
        },
        "term:vague obligation": {
          "x": 126.58,
          "y": 429.65
        },
        "term:Kula ring": {
          "x": 678.54,
          "y": 22
        },
        "term:equivalent return": {
          "x": 792.89,
          "y": 90.35
        },
        "term:exchange partner": {
          "x": 486.87,
          "y": 223.96
        },
        "term:haggling": {
          "x": 803.42,
          "y": 372.81
        },
        "term:raiding": {
          "x": 789.34,
          "y": 485.81
        },
        "term:something for nothing": {
          "x": 701.13,
          "y": 595.98
        },
        "term:strangers": {
          "x": 596.78,
          "y": 294.82
        },
        "term:kinship distance": {
          "x": 498.18,
          "y": 380.3
        },
        "cluster:0": {
          "x": 301.36,
          "y": 434.87
        },
        "cluster:1": {
          "x": 638.59,
          "y": 157.8
        },
        "cluster:2": {
          "x": 670.54,
          "y": 417.48
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:35:29.808Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:35:22.856Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
