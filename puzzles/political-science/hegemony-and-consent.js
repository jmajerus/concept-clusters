// Generated from content/puzzles/hegemony-and-consent.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "hegemony-and-consent",
  "title": "Hegemony and Consent",
  "category": "critical-theory-cultural-studies",
  "categories": [
    "critical-theory-cultural-studies",
    "political-science",
    "sociology"
  ],
  "subcategories": {
    "sociology": "culture-socialization"
  },
  "info": {
    "text": "Antonio Gramsci's account of how a ruling class secures its dominance mainly by diffusing consent across civil society, with direct coercion held in reserve rather than doing most of the work -- and what contesting that dominance would actually require.",
    "links": [
      {
        "href": "wiki:Antonio Gramsci"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-integral-state",
      "name": "The Integral State",
      "color": "blue",
      "fact": "Gramsci's own formula was blunt: the state equals political society plus civil society, or hegemony protected by the armour of coercion. Political society is the narrowly coercive apparatus -- army, police, courts, prisons -- while civil society is the vast web of schools, churches, media, and unions where a class's worldview gets lived out as everyone's common sense.",
      "terms": [
        "coercion",
        "consent",
        "political society",
        "civil society"
      ],
      "seeds": [
        "coercion",
        "consent"
      ],
      "info": {
        "text": "Gramsci's expanded definition of the state as coercion and consent working together, rather than the narrower, purely coercive state other theorists describe.",
        "links": [
          {
            "href": "wiki:Antonio Gramsci"
          }
        ]
      }
    },
    {
      "id": "winning-consent",
      "name": "Winning Consent",
      "color": "amber",
      "fact": "Hegemony is what happens when a ruling class doesn't just dominate but leads: organic intellectuals -- thinkers who emerge from within a class and articulate its own outlook -- do the patient work of turning that class's particular worldview into everyone's shared common sense, aided by traditional intellectuals who present themselves as neutral even while serving the existing order.",
      "terms": [
        "common sense",
        "organic intellectuals",
        "traditional intellectuals",
        "intellectual and moral leadership"
      ],
      "seeds": [
        "common sense",
        "organic intellectuals"
      ],
      "info": {
        "text": "The cultural mechanism by which a class's own outlook becomes lived, unquestioned reality for everyone else -- Gramsci's answer to why exploited groups so often consent to their own exploitation.",
        "links": [
          {
            "href": "wiki:Cultural hegemony"
          }
        ]
      }
    },
    {
      "id": "strategies-of-struggle",
      "name": "Strategies of Struggle",
      "color": "olive",
      "fact": "Gramsci drew a strategic lesson from comparing Russia and Western Europe: where the state dominates and civil society is thin, a frontal war of maneuver can succeed, as in 1917; where civil society is dense and well organized, only a slower war of position -- a sustained struggle for ground within civil society itself -- has any chance, and an old order can absorb a challenge through passive revolution, granting just enough reform to head off deeper change.",
      "terms": [
        "war of position",
        "war of maneuver",
        "passive revolution"
      ],
      "seeds": [
        "war of position",
        "war of maneuver"
      ],
      "info": {
        "text": "Gramsci's strategic vocabulary for how political struggle actually has to be fought, depending on how developed a society's civil society already is.",
        "links": [
          {
            "href": "wiki:Prison Notebooks"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-diffusion",
      "term": "diffusion",
      "clusters": [
        0,
        1
      ],
      "fact": "Civil society is the terrain where consent actually gets manufactured: organic intellectuals do the work of diffusing a class's outlook until it no longer feels like anyone's particular interest, but simply everyone's common sense.",
      "relationKind": "dynamic",
      "idealTerms": [
        "civil society",
        "common sense"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-terrain",
      "term": "terrain",
      "clusters": [
        0,
        2
      ],
      "fact": "Which strategy makes sense depends on the very balance the integral state describes: where political society dominates and civil society is thin, a frontal war of maneuver can work, but where civil society is dense and well-organized, only the slower war of position -- fighting for ground within civil society itself -- has any real chance.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-counter-hegemony",
      "term": "counter-hegemony",
      "clusters": [
        1,
        2
      ],
      "fact": "A war of position is fought with exactly the tools hegemony itself relies on: a rising class builds its own organic intellectuals and contests the terrain of common sense directly, aiming to build a counter-hegemony rather than simply seizing the machinery of the state.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "organic intellectuals",
        "war of position"
      ]
    }
  ],
  "lenses": [
    {
      "id": "the-civil-register",
      "prompt": "Which of these operate primarily through civil society's own institutions, rather than through the state's directly coercive apparatus?",
      "explanation": "Civil society, common sense, and organic intellectuals all belong to the register Gramsci distinguished from naked coercion: schools, churches, unions, and the media are where a class's worldview gets diffused and normalized as everyone's shared common sense, with organic intellectuals doing the actual work of articulating and spreading it. None of this requires police or prisons to function -- that is precisely Gramsci's point about how consent, not force, does most of the work in a developed state.",
      "targets": [
        "civil society",
        "common sense",
        "organic intellectuals"
      ],
      "reasons": {
        "civil society": "The institutional half of the integral state that operates through culture and persuasion rather than direct coercion.",
        "common sense": "What a class's worldview becomes once it has been diffused widely enough to feel like plain, unquestionable reality.",
        "organic intellectuals": "The class-specific thinkers who do the actual work of articulating and diffusing that worldview."
      }
    },
    {
      "id": "tools-for-a-challenger",
      "prompt": "Which of these name a strategy or resource available to a class trying to build a new hegemony, not just defend an existing one?",
      "explanation": "Gramsci's vocabulary is symmetric: the same tools that build a ruling class's hegemony -- organic intellectuals doing patient cultural work, contesting the terrain of common sense -- are exactly what a rising class needs to mount a war of position and build a counter-hegemony of its own. Nothing here belongs exclusively to whoever currently holds power.",
      "targets": [
        "war of position",
        "counter-hegemony",
        "organic intellectuals"
      ],
      "reasons": {
        "counter-hegemony": "The explicit goal of that strategy: not seizing the state directly, but building an alternative worldview capable of replacing the ruling one.",
        "organic intellectuals": "The same class-specific thinkers who build any hegemony -- ruling or challenging -- by articulating a class's own worldview.",
        "war of position": "The slow, civil-society-based strategy Gramsci thought a challenger needed wherever an existing hegemony was well dug in."
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
      "puzzleId": "hegemony-and-consent",
      "puzzleRevision": "fnv1a32:736df690",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:coercion": {
          "x": 232.65,
          "y": 128.38,
          "pinned": false
        },
        "term:consent": {
          "x": 79.75,
          "y": 138.58,
          "pinned": false
        },
        "term:political society": {
          "x": 127.53,
          "y": 24.6,
          "pinned": false
        },
        "term:civil society": {
          "x": 269.97,
          "y": 23,
          "pinned": false
        },
        "term:common sense": {
          "x": 377.64,
          "y": 287.11,
          "pinned": false
        },
        "term:organic intellectuals": {
          "x": 395.18,
          "y": 437,
          "pinned": false
        },
        "term:traditional intellectuals": {
          "x": 539.25,
          "y": 311.32,
          "pinned": false
        },
        "term:intellectual and moral leadership": {
          "x": 445.4,
          "y": 101.12,
          "pinned": false
        },
        "term:war of position": {
          "x": 207.42,
          "y": 293.56,
          "pinned": false
        },
        "term:war of maneuver": {
          "x": 69.25,
          "y": 262,
          "pinned": false
        },
        "term:passive revolution": {
          "x": 78.7,
          "y": 413.57,
          "pinned": false
        },
        "term:diffusion": {
          "x": 295.98,
          "y": 207.34,
          "pinned": false
        },
        "term:terrain": {
          "x": 158.23,
          "y": 186.94,
          "pinned": false
        },
        "term:counter-hegemony": {
          "x": 230.79,
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
        "totalLength": 2510.78,
        "score": 2510.782623223013
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:19:45.666Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "hegemony-and-consent",
      "puzzleRevision": "fnv1a32:736df690",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480,
          "y": 436.95,
          "pinned": false
        },
        "cluster:1": {
          "x": 222.25,
          "y": 258.52,
          "pinned": false
        },
        "cluster:2": {
          "x": 737.75,
          "y": 258.52,
          "pinned": false
        }
      },
      "bridges": {
        "term:diffusion": {
          "x": 311.33,
          "y": 443.82,
          "pinned": false
        },
        "term:terrain": {
          "x": 645.64,
          "y": 384.51,
          "pinned": false
        },
        "term:counter-hegemony": {
          "x": 480,
          "y": 258.52,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "coercion",
          "consent",
          "political society",
          "civil society"
        ],
        "cluster:1": [
          "common sense",
          "organic intellectuals",
          "traditional intellectuals",
          "intellectual and moral leadership"
        ],
        "cluster:2": [
          "war of position",
          "war of maneuver",
          "passive revolution"
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
        "totalLength": 426.244783916504
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:19:48.649Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "hegemony-and-consent",
      "puzzleRevision": "fnv1a32:736df690",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:coercion": {
          "x": 365.5,
          "y": 22
        },
        "term:consent": {
          "x": 464.75,
          "y": 22
        },
        "term:political society": {
          "x": 614.83,
          "y": 22
        },
        "term:civil society": {
          "x": 360.84,
          "y": 166.53
        },
        "term:common sense": {
          "x": 262.52,
          "y": 252.64
        },
        "term:organic intellectuals": {
          "x": 413.61,
          "y": 514.28
        },
        "term:traditional intellectuals": {
          "x": 235.13,
          "y": 597.31
        },
        "term:intellectual and moral leadership": {
          "x": 123.95,
          "y": 390.61
        },
        "term:war of position": {
          "x": 578.72,
          "y": 506.47
        },
        "term:war of maneuver": {
          "x": 836.55,
          "y": 422.72
        },
        "term:passive revolution": {
          "x": 732.04,
          "y": 538.5
        },
        "term:diffusion": {
          "x": 410.09,
          "y": 277.47
        },
        "term:terrain": {
          "x": 570.24,
          "y": 260.02
        },
        "term:counter-hegemony": {
          "x": 504.99,
          "y": 372.5
        },
        "cluster:0": {
          "x": 508.81,
          "y": 144.6
        },
        "cluster:1": {
          "x": 326.4,
          "y": 373.79
        },
        "cluster:2": {
          "x": 676.67,
          "y": 369.31
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:19:51.599Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:19:42.829Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
