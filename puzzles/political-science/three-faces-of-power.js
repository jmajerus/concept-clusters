// Generated from content/puzzles/three-faces-of-power.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "three-faces-of-power",
  "title": "Three Faces of Power",
  "category": "political-science",
  "categories": [
    "political-science",
    "sociology",
    "critical-theory-cultural-studies"
  ],
  "info": {
    "text": "Steven Lukes' argument that power operates in three progressively less visible ways -- through decisions actually made, through control of which issues ever reach a decision, and through the shaping of what people want in the first place.",
    "links": [
      {
        "href": "wiki:Steven Lukes"
      }
    ],
    "citations": [
      {
        "title": "Power and Poverty: Theory and Practice",
        "author": "Peter Bachrach and Morton S. Baratz",
        "publisher": "Oxford University Press",
        "year": "1970"
      },
      {
        "title": "Power: A Radical View",
        "author": "Steven Lukes",
        "publisher": "Palgrave Macmillan",
        "year": "2005"
      }
    ]
  },
  "clusters": [
    {
      "id": "decision-making-power",
      "name": "The First Face: Decision-Making",
      "color": "teal",
      "fact": "Robert Dahl's pluralist starting point: study power by watching concrete decisions where people's preferences visibly conflict, then simply ask who prevails. If there is no observable conflict, on this view, there is little reason to think anyone has power at all.",
      "terms": [
        "decision-making",
        "observable conflict",
        "who prevails",
        "policy preferences"
      ],
      "seeds": [
        "decision-making",
        "observable conflict"
      ],
      "info": {
        "text": "The pluralist, behavioral starting point for studying power: watch actual decisions, and infer power from who gets their way when preferences visibly conflict.",
        "links": [
          {
            "href": "wiki:Robert Dahl"
          }
        ]
      }
    },
    {
      "id": "non-decision-making-power",
      "name": "The Second Face: Non-Decision-Making",
      "color": "brown",
      "fact": "Bachrach and Baratz argued Dahl missed an entire second face: power exercised before any decision is ever made, by controlling which issues even reach the agenda. A community's whole set of institutional norms and procedures -- its mobilization of bias -- can keep a grievance from ever becoming a visible decision at all.",
      "terms": [
        "agenda-setting",
        "non-decision-making",
        "mobilization of bias"
      ],
      "seeds": [
        "agenda-setting",
        "non-decision-making"
      ],
      "info": "The second face of power: controlling which grievances ever reach the point of decision, rather than winning once they get there."
    },
    {
      "id": "shaping-wants",
      "name": "The Third Face: Shaping Wants",
      "color": "magenta",
      "fact": "Lukes' own radical addition: the most effective form of power prevents conflict from arising in the first place, by shaping what people believe, want, or think is even possible -- so thoroughly that they may actively consent to arrangements that work against their own real interests, the same ideological mechanism Gramsci had already described.",
      "terms": [
        "shaping preferences",
        "latent conflict",
        "real interests"
      ],
      "seeds": [
        "shaping preferences",
        "latent conflict"
      ],
      "info": "Lukes' third and most radical face of power: shaping people's own wants and beliefs so thoroughly that no conflict, latent or otherwise, is left for anyone to notice."
    }
  ],
  "bridges": [
    {
      "id": "bridge-which-issues-arrive",
      "term": "which issues arrive",
      "clusters": [
        1,
        0
      ],
      "fact": "The two views share a decision-centered core: both still look for a conflict of interest, whether at the moment of decision itself or earlier, when non-decision-making determines which issues arrive on the agenda at all. Lukes calls this the second view's chief limitation -- it is only a qualified critique of the first, since it still requires a conflict someone could, in principle, observe.",
      "relationKind": "dynamic",
      "idealTerms": [
        "non-decision-making",
        "decision-making"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "bridge-ideology",
      "term": "ideology",
      "clusters": [
        1,
        2
      ],
      "fact": "Lukes' third dimension absorbs and radicalizes the second: mobilization of bias does not just keep issues off the agenda, it can shape people's very perceptions and preferences so effectively that the grievance never becomes a latent conflict in the first place -- the same ideological mechanism Gramsci had already described as manufacturing consent.",
      "relationKind": "dynamic",
      "idealTerms": [
        "mobilization of bias",
        "shaping preferences"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-invisibility",
      "term": "invisibility",
      "clusters": [
        0,
        2
      ],
      "fact": "Here is the sharpest disagreement in the whole debate: the one-dimensional view assumes that if there is no observable conflict, there is no reason to think power is at work, while Lukes insists the most complete form of power leaves no observable conflict whatsoever -- and may not even require the dominated party's own awareness that it exists.",
      "relationKind": "contrast"
    }
  ],
  "lenses": [
    {
      "id": "still-needs-a-conflict",
      "prompt": "Which of these still require some form of an actual or potential conflict of interest -- even a hidden one -- rather than being compatible with harmony and consent all the way down?",
      "explanation": "The one- and two-dimensional views never actually let go of conflict: Dahl's decision-making needs conflict to be observable, and Bachrach and Baratz's non-decision-making and mobilization of bias still presuppose a real, if suppressed, grievance sitting underneath the surface. Only Lukes' third dimension breaks with this entirely, allowing power to operate so completely that no conflict -- observable or latent -- exists to find.",
      "targets": [
        "observable conflict",
        "non-decision-making",
        "mobilization of bias"
      ],
      "reasons": {
        "mobilization of bias": "A community's norms may suppress a grievance, but the grievance is still there, underneath, to be suppressed.",
        "non-decision-making": "Still presupposes a real grievance that power works to keep off the agenda.",
        "observable conflict": "The first face's entire method depends on conflict being visible enough to study."
      }
    },
    {
      "id": "power-without-a-grievance",
      "prompt": "Which of these describe power operating so completely that the dominated party may not experience anything they would recognize as a grievance at all?",
      "explanation": "This is the heart of Lukes' radical claim, and its biggest controversy: real interests names something a person can be argued to have even if they do not recognize or want it, and shaping preferences and ideology both name mechanisms sophisticated enough to make sure the gap between those real interests and what someone actually wants never even registers as a grievance to begin with.",
      "targets": [
        "shaping preferences",
        "real interests",
        "ideology"
      ],
      "reasons": {
        "ideology": "The same mechanism Gramsci described: a worldview so thoroughly absorbed it no longer feels like anyone's particular interest.",
        "real interests": "A standard for judging domination that does not depend on the dominated party's own felt preferences.",
        "shaping preferences": "The mechanism itself: power exercised by forming what someone wants, rather than overriding what they already want."
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
      "puzzleId": "three-faces-of-power",
      "puzzleRevision": "fnv1a32:b01847b8",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:decision-making": {
          "x": 288.25,
          "y": 317.8,
          "pinned": false
        },
        "term:observable conflict": {
          "x": 387.35,
          "y": 437,
          "pinned": false
        },
        "term:who prevails": {
          "x": 156.45,
          "y": 299.58,
          "pinned": false
        },
        "term:policy preferences": {
          "x": 194.07,
          "y": 437,
          "pinned": false
        },
        "term:agenda-setting": {
          "x": 214.48,
          "y": 23,
          "pinned": false
        },
        "term:non-decision-making": {
          "x": 81.85,
          "y": 96.7,
          "pinned": false
        },
        "term:mobilization of bias": {
          "x": 364.62,
          "y": 61.61,
          "pinned": false
        },
        "term:shaping preferences": {
          "x": 495.82,
          "y": 171.06,
          "pinned": false
        },
        "term:latent conflict": {
          "x": 570.75,
          "y": 35.28,
          "pinned": false
        },
        "term:real interests": {
          "x": 573.9,
          "y": 301.41,
          "pinned": false
        },
        "term:which issues arrive": {
          "x": 230.64,
          "y": 173.84,
          "pinned": false
        },
        "term:ideology": {
          "x": 365.48,
          "y": 197.81,
          "pinned": false
        },
        "term:invisibility": {
          "x": 419.33,
          "y": 295.01,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2386.21,
        "score": 2386.2122706285763
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:20:25.735Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "three-faces-of-power",
      "puzzleRevision": "fnv1a32:b01847b8",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 695.46,
          "y": 378.87,
          "pinned": false
        },
        "cluster:1": {
          "x": 264.54,
          "y": 378.87,
          "pinned": false
        },
        "cluster:2": {
          "x": 480,
          "y": 196.25,
          "pinned": false
        }
      },
      "bridges": {
        "term:which issues arrive": {
          "x": 480,
          "y": 378.87,
          "pinned": false
        },
        "term:ideology": {
          "x": 317.12,
          "y": 232.41,
          "pinned": false
        },
        "term:invisibility": {
          "x": 661.27,
          "y": 214.02,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "decision-making",
          "observable conflict",
          "who prevails",
          "policy preferences"
        ],
        "cluster:1": [
          "agenda-setting",
          "non-decision-making",
          "mobilization of bias"
        ],
        "cluster:2": [
          "shaping preferences",
          "latent conflict",
          "real interests"
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
        "totalLength": 367.22937170959665
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:20:28.711Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "three-faces-of-power",
      "puzzleRevision": "fnv1a32:b01847b8",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:decision-making": {
          "x": 558.95,
          "y": 554.18
        },
        "term:observable conflict": {
          "x": 880.15,
          "y": 339.87
        },
        "term:who prevails": {
          "x": 836.32,
          "y": 501.44
        },
        "term:policy preferences": {
          "x": 726.93,
          "y": 598
        },
        "term:agenda-setting": {
          "x": 98.44,
          "y": 563.18
        },
        "term:non-decision-making": {
          "x": 401.64,
          "y": 578.01
        },
        "term:mobilization of bias": {
          "x": 312.12,
          "y": 195.81
        },
        "term:shaping preferences": {
          "x": 528.04,
          "y": 254.31
        },
        "term:latent conflict": {
          "x": 783.5,
          "y": 22
        },
        "term:real interests": {
          "x": 823.31,
          "y": 159.13
        },
        "term:which issues arrive": {
          "x": 471.41,
          "y": 421.24
        },
        "term:ideology": {
          "x": 401.04,
          "y": 303.63
        },
        "term:invisibility": {
          "x": 700.63,
          "y": 212.52
        },
        "cluster:0": {
          "x": 679.65,
          "y": 398.69
        },
        "cluster:1": {
          "x": 246.25,
          "y": 414.84
        },
        "cluster:2": {
          "x": 597.62,
          "y": 63.64
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:20:31.872Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:20:22.499Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
