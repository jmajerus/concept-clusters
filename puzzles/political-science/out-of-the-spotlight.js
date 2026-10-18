// Generated from content/puzzles/out-of-the-spotlight.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "out-of-the-spotlight",
  "title": "Out of the Spotlight",
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
    "text": "Bayard Rustin, raised Quaker, the chief organizer behind the 1963 March on Washington and the man who brought Gandhian nonviolence into the American civil rights movement, whose Communist youth, wartime draft resistance, and open homosexuality were repeatedly turned into weapons to keep him out of the movement's own spotlight.",
    "links": [
      {
        "href": "wiki:Bayard Rustin"
      }
    ]
  },
  "clusters": [
    {
      "id": "building-nonviolent-practice",
      "name": "Building Nonviolent Practice",
      "color": "teal",
      "fact": "Rustin's nonviolent method was assembled, not inherited whole: refusing to report for WWII military service earned him 28 months in a federal penitentiary, where he organized a Free India Committee and read deeply in Krishnalal Shridharani's War Without Violence. Released in 1946, he and George Houser tested a Supreme Court desegregation ruling directly with the 1947 Journey of Reconciliation, an early rehearsal for the Freedom Rides fourteen years later.",
      "terms": [
        "refusing to report",
        "the Journey of Reconciliation",
        "War Without Violence",
        "the Free India Committee"
      ],
      "seeds": [
        "refusing to report",
        "the Journey of Reconciliation"
      ],
      "termInfo": {
        "refusing to report": {
          "links": [
            {
              "href": "wiki:Conscientious objector"
            }
          ]
        }
      },
      "info": {
        "text": "Rustin's two-decade apprenticeship in nonviolent direct action, built through prison organizing, close study of Gandhian theory, and a direct 1947 test of interstate bus desegregation.",
        "links": [
          {
            "href": "wiki:Journey of Reconciliation"
          }
        ]
      }
    },
    {
      "id": "organizing-the-march",
      "name": "Organizing the March",
      "color": "olive",
      "fact": "In 1963 Randolph tapped Rustin, by then a twenty-year veteran organizer, to build the March on Washington from the ground up: transportation, sound, marshals, permits, sanitation, all coordinated with such meticulous logistics that colleagues later said he seemed to be everywhere on the march at once, turning it into the biggest demonstration the country had yet seen.",
      "terms": [
        "A. Philip Randolph",
        "the March on Washington",
        "meticulous logistics",
        "the biggest demonstration yet"
      ],
      "seeds": [
        "A. Philip Randolph",
        "the March on Washington"
      ],
      "termInfo": {
        "A. Philip Randolph": {
          "links": [
            {
              "href": "wiki:A. Philip Randolph"
            }
          ]
        }
      },
      "info": {
        "text": "Rustin's organizational masterpiece: building the largest demonstration the country had yet seen in under two months, at Randolph's direct request.",
        "links": [
          {
            "href": "wiki:March on Washington for Jobs and Freedom"
          }
        ]
      }
    },
    {
      "id": "visibility-and-its-costs",
      "name": "Visibility and Its Costs",
      "color": "magenta",
      "fact": "Rustin's biography kept being turned into ammunition against the movement he helped build: a youthful stint in the Young Communist League, broken off once it prioritized the Soviet Union over civil rights, an arrest on a 1953 morals charge, and Congressman Adam Clayton Powell's 1960 threat to falsely claim Rustin and King were lovers -- which got Rustin forced to resign from the SCLC -- became separate reasons for the same result: keeping the movement's most effective organizer out of its own spotlight.",
      "terms": [
        "the 1953 morals charge",
        "forced to resign",
        "Powell's threat",
        "Thurmond's floor speech",
        "the Young Communist League"
      ],
      "seeds": [
        "the 1953 morals charge",
        "forced to resign"
      ],
      "info": {
        "text": "The recurring cost of Rustin's visibility: his sexuality, his broken-off Communist youth, and the political attacks both repeatedly enabled, even from within the movement he helped lead.",
        "links": [
          {
            "href": "wiki:Bayard Rustin"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-one-attack-three-facts",
      "term": "one attack, three facts",
      "clusters": [
        0,
        2
      ],
      "fact": "When Strom Thurmond rose on the Senate floor to call Rustin 'a homosexual, a draft-dodger, and a member of the Communist Party,' he fused three separate, otherwise unconnected facts about Rustin's life -- his wartime refusal to report for service, his sexuality, and his broken-off youth in the Young Communist League -- into a single calculated smear, aimed less at Rustin's actual biography than at discrediting the march he had just built.",
      "relationKind": "cross-cutting"
    },
    {
      "id": "bridge-twenty-years-of-practice",
      "term": "twenty years of practice",
      "clusters": [
        0,
        1
      ],
      "fact": "The march's meticulous logistics were not improvised: Rustin brought twenty years of organizing craft to it, going back through the Journey of Reconciliation to the prison organizing that came even before that -- practical experience accumulated over two decades before it was ever put to use on the biggest stage of his career.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-credit-not-given",
      "term": "credit not given",
      "clusters": [
        2,
        1
      ],
      "fact": "Even at his career's high point, the same vulnerabilities shaped how the march itself was staged: Randolph, not Rustin, received the public credit and visibility, a direct consequence of the Communist past, morals charge, and Powell's threat that had already forced Rustin out of the spotlight once before.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "what-he-did",
      "prompt": "Which of these are specific actions Rustin chose to take, rather than something that happened to him or was said about him?",
      "explanation": "Refusing to report for military service, launching the Journey of Reconciliation, and organizing the March on Washington are all things Rustin actively did -- decisions and actions he chose and carried out -- rather than things that happened to him or accusations made against him by someone else.",
      "targets": [
        "refusing to report",
        "the Journey of Reconciliation",
        "the March on Washington"
      ],
      "reasons": {
        "refusing to report": "A deliberate choice to refuse military service, not something imposed on him.",
        "the Journey of Reconciliation": "A direct action he and George Houser designed and carried out to test a Supreme Court ruling.",
        "the March on Washington": "The demonstration he built, logistical detail by logistical detail, over months of organizing."
      }
    },
    {
      "id": "what-was-done-to-him",
      "prompt": "Which of these were imposed on Rustin by others, rather than something he chose or did himself?",
      "explanation": "Powell's threat, the 1953 morals charge, and credit not given were all imposed on Rustin by others, not choices he made: an arrest used against him, a congressman's threat that forced his resignation, and a march where his own central role was deliberately kept out of the spotlight even as it succeeded.",
      "targets": [
        "Powell's threat",
        "the 1953 morals charge",
        "credit not given"
      ],
      "reasons": {
        "Powell's threat": "A threat made against him by someone else, not something he chose or did.",
        "credit not given": "The public visibility Randolph received instead of Rustin, a consequence of others' choices, not his own.",
        "the 1953 morals charge": "An arrest and prosecution imposed on him by the state."
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
      "puzzleId": "out-of-the-spotlight",
      "puzzleRevision": "fnv1a32:915f88a2",
      "board": {
        "width": 770,
        "height": 550
      },
      "nodes": {
        "term:refusing to report": {
          "x": 310.51,
          "y": 184.55,
          "pinned": false
        },
        "term:the Journey of Reconciliation": {
          "x": 116.41,
          "y": 210.56,
          "pinned": false
        },
        "term:War Without Violence": {
          "x": 85,
          "y": 23,
          "pinned": false
        },
        "term:the Free India Committee": {
          "x": 97.6,
          "y": 422.61,
          "pinned": false
        },
        "term:A. Philip Randolph": {
          "x": 521.68,
          "y": 164.81,
          "pinned": false
        },
        "term:the March on Washington": {
          "x": 675.55,
          "y": 230.74,
          "pinned": false
        },
        "term:meticulous logistics": {
          "x": 448.31,
          "y": 23,
          "pinned": false
        },
        "term:the biggest demonstration yet": {
          "x": 655.68,
          "y": 23,
          "pinned": false
        },
        "term:the 1953 morals charge": {
          "x": 564.1,
          "y": 376.41,
          "pinned": false
        },
        "term:forced to resign": {
          "x": 697.6,
          "y": 434.39,
          "pinned": false
        },
        "term:Powell's threat": {
          "x": 615.99,
          "y": 527,
          "pinned": false
        },
        "term:Thurmond's floor speech": {
          "x": 236.97,
          "y": 527,
          "pinned": false
        },
        "term:the Young Communist League": {
          "x": 438.91,
          "y": 527,
          "pinned": false
        },
        "term:one attack, three facts": {
          "x": 269.64,
          "y": 355.55,
          "pinned": false
        },
        "term:twenty years of practice": {
          "x": 261.73,
          "y": 23,
          "pinned": false
        },
        "term:credit not given": {
          "x": 425.15,
          "y": 284.79,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3940.67,
        "score": 3940.6677551698804
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:24:30.261Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "out-of-the-spotlight",
      "puzzleRevision": "fnv1a32:915f88a2",
      "board": {
        "width": 1150,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 575,
          "y": 541.29,
          "pinned": false
        },
        "cluster:1": {
          "x": 307.76,
          "y": 296.36,
          "pinned": false
        },
        "cluster:2": {
          "x": 842.24,
          "y": 296.36,
          "pinned": false
        }
      },
      "bridges": {
        "term:one attack, three facts": {
          "x": 804.7,
          "y": 458.62,
          "pinned": false
        },
        "term:twenty years of practice": {
          "x": 345.3,
          "y": 458.62,
          "pinned": false
        },
        "term:credit not given": {
          "x": 575,
          "y": 296.36,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "refusing to report",
          "the Journey of Reconciliation",
          "War Without Violence",
          "the Free India Committee"
        ],
        "cluster:1": [
          "A. Philip Randolph",
          "the March on Washington",
          "meticulous logistics",
          "the biggest demonstration yet"
        ],
        "cluster:2": [
          "the 1953 morals charge",
          "forced to resign",
          "Powell's threat",
          "Thurmond's floor speech",
          "the Young Communist League"
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
        "totalLength": 571.033379505703
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:24:33.075Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "out-of-the-spotlight",
      "puzzleRevision": "fnv1a32:915f88a2",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:refusing to report": {
          "x": 357.85,
          "y": 210.32
        },
        "term:the Journey of Reconciliation": {
          "x": 422.16,
          "y": 22
        },
        "term:War Without Violence": {
          "x": 630.79,
          "y": 22
        },
        "term:the Free India Committee": {
          "x": 765.56,
          "y": 155.44
        },
        "term:A. Philip Randolph": {
          "x": 901.55,
          "y": 491.24
        },
        "term:the March on Washington": {
          "x": 990.76,
          "y": 648.93
        },
        "term:meticulous logistics": {
          "x": 818.03,
          "y": 718
        },
        "term:the biggest demonstration yet": {
          "x": 611.08,
          "y": 717.71
        },
        "term:the 1953 morals charge": {
          "x": 387.35,
          "y": 697.69
        },
        "term:forced to resign": {
          "x": 216.07,
          "y": 686.15
        },
        "term:Powell's threat": {
          "x": 67.25,
          "y": 690.88
        },
        "term:Thurmond's floor speech": {
          "x": 92.45,
          "y": 521.09
        },
        "term:the Young Communist League": {
          "x": 192.69,
          "y": 340.86
        },
        "term:one attack, three facts": {
          "x": 426.71,
          "y": 377.66
        },
        "term:twenty years of practice": {
          "x": 623.22,
          "y": 413.79
        },
        "term:credit not given": {
          "x": 506.66,
          "y": 548.12
        },
        "cluster:0": {
          "x": 556.51,
          "y": 209.06
        },
        "cluster:1": {
          "x": 744.52,
          "y": 560.27
        },
        "cluster:2": {
          "x": 291.99,
          "y": 525.41
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:24:36.130Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "auto",
    "savedAt": "2026-10-08T01:24:27.412Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
