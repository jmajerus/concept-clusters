// Generated from content/puzzles/the-scaffold-and-the-timetable.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-scaffold-and-the-timetable",
  "title": "The Scaffold and the Timetable",
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
    "text": "Michel Foucault's account of the shift from sovereign power's spectacular violence on the body to disciplinary power's quiet, constant arrangement of time, space, and observation -- illustrated by the two scenes he sets side by side at the start of Discipline and Punish.",
    "links": [
      {
        "href": "wiki:Discipline and Punish"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-scaffold",
      "name": "The Scaffold",
      "color": "brown",
      "fact": "Foucault opens Discipline and Punish with the 1757 public execution of Damiens: publicly staged, deliberately excessive violence on the body of the condemned, meant to be witnessed by a crowd as living proof of the sovereign's power to destroy whoever defied it.",
      "terms": [
        "public torture",
        "the spectacle of punishment",
        "the sovereign's vengeance",
        "the condemned body"
      ],
      "seeds": [
        "public torture",
        "the spectacle of punishment"
      ],
      "info": {
        "text": "The pre-modern regime of punishment Foucault uses to open his history: violent, public, and staged as a reassertion of the sovereign's own power rather than a calculated correction of the offender.",
        "links": [
          {
            "href": "wiki:Discipline and Punish"
          }
        ]
      }
    },
    {
      "id": "the-timetable",
      "name": "The Timetable",
      "color": "olive",
      "fact": "Eighty years after Damiens, Foucault sets a very different document beside it: a plain timetable regulating a young prisoner's day hour by hour. Discipline works through techniques like this one: hierarchical observation arranges people so they can always potentially be watched, normalizing judgment measures them against a norm rather than a law, and the examination fuses both into a documented, comparable record of who someone is.",
      "terms": [
        "the timetable",
        "hierarchical observation",
        "normalizing judgment",
        "the examination"
      ],
      "seeds": [
        "the timetable",
        "hierarchical observation"
      ],
      "info": {
        "text": "The disciplinary techniques Foucault identifies as replacing spectacular punishment: fine-grained control of time, space, and activity, aimed at producing a certain kind of person rather than simply displaying a punishment.",
        "links": [
          {
            "href": "wiki:Discipline and Punish"
          }
        ]
      }
    },
    {
      "id": "the-panopticon",
      "name": "The Panopticon",
      "color": "cyan",
      "fact": "Bentham's unbuilt prison design became Foucault's diagram for how discipline actually works: a central tower makes every cell permanently visible while the watcher stays unseen, so the person being watched can never confirm whether anyone is actually looking -- and eventually starts supervising themselves, producing exactly what discipline is after: a docile body, obedient and useful without needing constant force at all.",
      "terms": [
        "the panopticon",
        "visibility",
        "self-surveillance",
        "docile bodies"
      ],
      "seeds": [
        "the panopticon",
        "visibility"
      ],
      "info": {
        "text": "Bentham's architectural design, taken up by Foucault as the general model of disciplinary power: permanent visibility that eventually makes external enforcement unnecessary.",
        "links": [
          {
            "href": "wiki:Panopticon"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-economy-of-power",
      "term": "economy of power",
      "clusters": [
        0,
        1
      ],
      "fact": "Foucault frames the whole shift as a change in the economy of power rather than a softening of it: the goal moves from punishing spectacularly but occasionally to correcting constantly and universally, inserting the power to control more deeply into the social body even as its visible violence disappears.",
      "relationKind": "contrast"
    },
    {
      "id": "bridge-internalization",
      "term": "internalization",
      "clusters": [
        2,
        1
      ],
      "fact": "The panopticon is what makes hierarchical observation cheap: instead of needing an actual supervisor watching at all times, permanent visibility lets the mere possibility of being watched do the work, until the watched person internalizes it and keeps applying normalizing judgment to themselves even when no one is there.",
      "relationKind": "dynamic",
      "idealTerms": [
        "visibility",
        "hierarchical observation"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "bridge-who-is-seen",
      "term": "who is seen",
      "clusters": [
        0,
        2
      ],
      "fact": "The scaffold makes the sovereign's power spectacularly visible while the crowd watching it remains an anonymous mass; the panopticon inverts this completely, making the watched person permanently and individually visible while the observer -- who may not even be present -- becomes invisible and unverifiable.",
      "relationKind": "contrast"
    }
  ],
  "lenses": [
    {
      "id": "mechanisms-of-visibility",
      "prompt": "Which of these work specifically by putting a subject under actual or potential observation, rather than by physically marking or restraining their body?",
      "explanation": "Discipline's real innovation over the scaffold isn't gentleness, it's a different mechanism entirely: instead of marking a body once in public, it arranges people so they can always potentially be seen. Hierarchical observation formalizes who watches whom, the panopticon's visibility makes that watching structurally permanent even without an actual watcher, and self-surveillance is what happens once a person internalizes the possibility of being watched and starts policing themselves in the watcher's absence.",
      "targets": [
        "hierarchical observation",
        "visibility",
        "self-surveillance"
      ],
      "reasons": {
        "hierarchical observation": "Arranges people so that a superior can always potentially see what a subordinate is doing.",
        "self-surveillance": "What a subject does once they have internalized the possibility of being watched, whether or not anyone actually is.",
        "visibility": "The panopticon's core architectural trick: the watched can never confirm whether they are actually being watched."
      }
    },
    {
      "id": "effects-not-mechanisms",
      "prompt": "Which of these name what a subject becomes as a result of a given form of power, rather than the technique used to produce that result?",
      "explanation": "The condemned body, docile bodies, and self-surveillance are all end states rather than tools: public torture produces a body publicly marked and broken as proof of the sovereign's power, discipline as a whole aims at docile bodies -- obedient and useful without needing constant force -- and self-surveillance is what a disciplined subject actually does once the panopticon's visibility has done its work.",
      "targets": [
        "the condemned body",
        "docile bodies",
        "self-surveillance"
      ],
      "reasons": {
        "docile bodies": "What discipline as a whole aims at: bodies made obedient and useful without needing constant force.",
        "self-surveillance": "What a disciplined subject actually does, once external observation has been internalized.",
        "the condemned body": "What sovereign punishment produces: a body publicly marked and broken as proof of the sovereign's power."
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
      "puzzleId": "the-scaffold-and-the-timetable",
      "puzzleRevision": "fnv1a32:eb9f6c5d",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:public torture": {
          "x": 336.14,
          "y": 287.06,
          "pinned": false
        },
        "term:the spectacle of punishment": {
          "x": 197.11,
          "y": 437,
          "pinned": false
        },
        "term:the sovereign's vengeance": {
          "x": 408.45,
          "y": 437,
          "pinned": false
        },
        "term:the condemned body": {
          "x": 561.3,
          "y": 359.41,
          "pinned": false
        },
        "term:the timetable": {
          "x": 95.88,
          "y": 142.8,
          "pinned": false
        },
        "term:hierarchical observation": {
          "x": 230.85,
          "y": 23,
          "pinned": false
        },
        "term:normalizing judgment": {
          "x": 85,
          "y": 292.29,
          "pinned": false
        },
        "term:the examination": {
          "x": 69.25,
          "y": 23,
          "pinned": false
        },
        "term:the panopticon": {
          "x": 442.18,
          "y": 149.31,
          "pinned": false
        },
        "term:visibility": {
          "x": 321.32,
          "y": 144.83,
          "pinned": false
        },
        "term:self-surveillance": {
          "x": 564.45,
          "y": 201.63,
          "pinned": false
        },
        "term:docile bodies": {
          "x": 550.67,
          "y": 58.82,
          "pinned": false
        },
        "term:economy of power": {
          "x": 213.21,
          "y": 216.84,
          "pinned": false
        },
        "term:internalization": {
          "x": 401.77,
          "y": 23,
          "pinned": false
        },
        "term:who is seen": {
          "x": 461.7,
          "y": 275.1,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2812.27,
        "score": 2812.271248669353
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:20:24.859Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-scaffold-and-the-timetable",
      "puzzleRevision": "fnv1a32:eb9f6c5d",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 712.61,
          "y": 377.77,
          "pinned": false
        },
        "cluster:1": {
          "x": 247.39,
          "y": 377.77,
          "pinned": false
        },
        "cluster:2": {
          "x": 480,
          "y": 198.45,
          "pinned": false
        }
      },
      "bridges": {
        "term:economy of power": {
          "x": 480,
          "y": 377.77,
          "pinned": false
        },
        "term:internalization": {
          "x": 290.16,
          "y": 214.57,
          "pinned": false
        },
        "term:who is seen": {
          "x": 669.84,
          "y": 214.57,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "public torture",
          "the spectacle of punishment",
          "the sovereign's vengeance",
          "the condemned body"
        ],
        "cluster:1": [
          "the timetable",
          "hierarchical observation",
          "normalizing judgment",
          "the examination"
        ],
        "cluster:2": [
          "the panopticon",
          "visibility",
          "self-surveillance",
          "docile bodies"
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
        "totalLength": 417.2123547882412
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:20:27.289Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-scaffold-and-the-timetable",
      "puzzleRevision": "fnv1a32:eb9f6c5d",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:public torture": {
          "x": 196.38,
          "y": 221.79
        },
        "term:the spectacle of punishment": {
          "x": 105.05,
          "y": 65.58
        },
        "term:the sovereign's vengeance": {
          "x": 316.21,
          "y": 22
        },
        "term:the condemned body": {
          "x": 502.87,
          "y": 38.93
        },
        "term:the timetable": {
          "x": 823.26,
          "y": 333.14
        },
        "term:hierarchical observation": {
          "x": 557.22,
          "y": 469.89
        },
        "term:normalizing judgment": {
          "x": 802.46,
          "y": 487.72
        },
        "term:the examination": {
          "x": 680.1,
          "y": 594.26
        },
        "term:the panopticon": {
          "x": 294.58,
          "y": 561.64
        },
        "term:visibility": {
          "x": 399,
          "y": 486.37
        },
        "term:self-surveillance": {
          "x": 157.79,
          "y": 500.96
        },
        "term:docile bodies": {
          "x": 162.15,
          "y": 354.53
        },
        "term:economy of power": {
          "x": 532.65,
          "y": 256.01
        },
        "term:internalization": {
          "x": 423.1,
          "y": 357.91
        },
        "term:who is seen": {
          "x": 306.81,
          "y": 291.49
        },
        "cluster:0": {
          "x": 366.82,
          "y": 182.53
        },
        "cluster:1": {
          "x": 695.79,
          "y": 373.93
        },
        "cluster:2": {
          "x": 289.35,
          "y": 421.07
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:20:30.121Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:20:22.120Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
