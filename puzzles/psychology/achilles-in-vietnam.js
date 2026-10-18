// Generated from content/puzzles/achilles-in-vietnam.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "achilles-in-vietnam",
  "title": "Achilles in Vietnam",
  "category": "psychology",
  "categories": [
    "psychology",
    "history-society",
    "peace-conflict-studies"
  ],
  "subcategories": {
    "peace-conflict-studies": "war-militarism",
    "psychology": "moral-psychology"
  },
  "tags": [
    "book",
    "war"
  ],
  "info": {
    "text": "Jonathan Shay's argument, built from Vietnam veterans' testimony read against Homer's Iliad, that the deepest wound of combat is not fear but the betrayal of a soldier's sense of what's right by those who hold legitimate authority over him.",
    "links": [
      {
        "href": "wiki:Moral injury"
      }
    ],
    "citations": [
      {
        "title": "Achilles in Vietnam: Combat Trauma and the Undoing of Character",
        "author": "Shay, Jonathan",
        "publisher": "Atheneum",
        "year": "1994"
      }
    ]
  },
  "clusters": [
    {
      "id": "betrayal-of-whats-right",
      "name": "Betrayal of What's Right",
      "color": "magenta",
      "fact": "Shay defines moral injury as a betrayal of themis -- the Homeric Greek word for 'what's right,' the customary moral order a fighting unit lives inside -- and insists the betrayer must hold legitimate authority over the soldier for the wound to be moral rather than merely tragic; Agamemnon's seizure of Achilles' rightfully won prize provokes not the berserk fury to come, but a colder, more dignified indignant rage.",
      "terms": [
        "themis",
        "legitimate authority",
        "indignant rage"
      ],
      "seeds": [
        "themis",
        "legitimate authority"
      ],
      "termInfo": {
        "indignant rage": {
          "text": "Shay's preferred translation of the Homeric word usually rendered 'wrath' -- a controlled, dignity-driven anger at being wronged by a legitimate authority, distinct from the uncontrolled fury of the berserk state to come."
        },
        "themis": {
          "text": "The Homeric Greek word for custom, or 'what's right' -- the shared, unwritten standard of proper conduct that binds a fighting unit together.",
          "links": [
            {
              "href": "wiki:Themis"
            }
          ]
        }
      },
      "info": {
        "text": "The book's central diagnostic claim: a wound Shay calls moral injury, which requires someone holding legitimate authority to betray a fighting unit's shared sense of what's right.",
        "links": [
          {
            "href": "wiki:Moral injury"
          }
        ]
      }
    },
    {
      "id": "shrinkage-of-the-moral-horizon",
      "name": "Shrinkage of the Moral Horizon",
      "color": "teal",
      "fact": "Once betrayed, a soldier's circle of trust and care shrinks from the whole army down to a handful of special comrades who alone remain reliable; when one of them dies, especially where military culture forbids visible mourning, the resulting interrupted grief becomes fuel for what follows.",
      "terms": [
        "special comrade",
        "moral horizon",
        "interrupted grief"
      ],
      "seeds": [
        "special comrade",
        "moral horizon"
      ],
      "termInfo": {
        "interrupted grief": {
          "text": "Mourning for a dead comrade that combat culture prevents a soldier from completing -- grief with nowhere sanctioned to go."
        }
      },
      "info": {
        "text": "How a soldier's sense of who is worth protecting and mourning narrows, under the pressure of betrayal and combat, down to a small circle of trusted comrades."
      }
    },
    {
      "id": "the-berserk-state",
      "name": "The Berserk State",
      "color": "brown",
      "fact": "Grief for a special comrade can curdle into a berserk state -- a documented, almost trance-like fury in which fear disappears and restraint collapses -- and Achilles' days-long desecration of Hector's corpse is Shay's paradigm case of the dishonoring of the enemy that so often follows.",
      "terms": [
        "berserk state",
        "loss of restraint",
        "dishonoring the enemy"
      ],
      "seeds": [
        "berserk state",
        "loss of restraint"
      ],
      "termInfo": {
        "berserk state": {
          "text": "A documented, extreme combat state -- an almost trance-like fury in which fear, exhaustion, and restraint fall away -- that Shay finds equally in Homer's Achilles and in his Vietnam veteran patients."
        },
        "dishonoring the enemy": {
          "text": "Treating a defeated enemy's body with deliberate contempt -- refusing burial, mutilating the corpse -- rather than the minimal respect a soldier's own side would expect in death."
        },
        "loss of restraint": {
          "text": "The disappearance, in the berserk state, of the normal inner checks that distinguish a disciplined combatant from an indiscriminate killer."
        }
      },
      "info": {
        "text": "The extreme combat state at the center of both Homer's Iliad and Shay's Vietnam veteran patients' testimony: total fury, loss of restraint, and indifference to one's own survival."
      }
    },
    {
      "id": "the-undoing-of-character",
      "name": "The Undoing of Character",
      "color": "cyan",
      "fact": "Once character has been undone by combat, the capacity for basic social trust often does not return on its own; Shay borrows philosophers' term moral luck to insist that whether a particular soldier's character held or broke depended heavily on circumstances no one controls, not on some soldiers simply being better people.",
      "terms": [
        "loss of trust",
        "moral luck",
        "social withdrawal"
      ],
      "seeds": [
        "loss of trust",
        "moral luck"
      ],
      "termInfo": {
        "moral luck": {
          "text": "The philosophical claim, associated with Bernard Williams and Thomas Nagel, that circumstances beyond a person's control can affect how we judge them morally -- Shay applies it to insist that surviving combat with one's character intact is partly a matter of luck, not virtue.",
          "links": [
            {
              "href": "wiki:Moral luck"
            }
          ]
        }
      },
      "info": {
        "text": "The lasting damage combat trauma does to a person's basic capacity for trust and connection -- the book's subtitle names this its central concern."
      }
    },
    {
      "id": "healing-and-griefwork",
      "name": "Healing and Griefwork",
      "color": "amber",
      "fact": "Shay's proposed path back runs through communalization -- telling the story of what happened to a community able to hear and accept it without turning away -- and through griefwork, an officially sanctioned mourning for the dead that Vietnam-era individual rotation policies made especially difficult to complete; stable, long-serving units with strong unit cohesion make both more possible.",
      "terms": [
        "communalization",
        "griefwork",
        "unit cohesion"
      ],
      "seeds": [
        "communalization",
        "griefwork"
      ],
      "termInfo": {
        "griefwork": {
          "text": "Freud's term for the psychological labor of mourning a loss, which Shay argues combat units and military institutions must officially sanction and make time for, not merely permit.",
          "links": [
            {
              "href": "wiki:Mourning and Melancholia"
            }
          ]
        },
        "unit cohesion": {
          "text": "The bonding that keeps a military unit reliable under stress; Shay blames Vietnam-era individual, rather than unit, rotation policies for breaking exactly the cohesion that helps protect against moral injury.",
          "links": [
            {
              "href": "wiki:Unit cohesion"
            }
          ]
        }
      },
      "info": {
        "text": "Shay's proposed path back from moral injury: officially sanctioned mourning, and a community able to hear a veteran's story without flinching from it."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-moral-community",
      "term": "moral community",
      "clusters": [
        0,
        1
      ],
      "fact": "Shay's argument opens by insisting an army is fundamentally a moral community, not just a fighting force; betrayal by legitimate authority breaks that wider community, and what's left of trust re-forms at the smaller scale of a soldier's special comrades.",
      "relationKind": "dynamic",
      "idealTerms": [
        "themis",
        "special comrade"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-complicated-grief",
      "term": "complicated grief",
      "clusters": [
        1,
        2
      ],
      "fact": "When mourning for a special comrade is blocked and has nowhere sanctioned to go, that unresolved loss -- clinically documented today as complicated grief -- doesn't simply fade; in Shay's account it curdles instead into the fury of the berserk state.",
      "relationKind": "dynamic",
      "idealTerms": [
        "interrupted grief",
        "berserk state"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-bearing-witness",
      "term": "bearing witness",
      "clusters": [
        3,
        4
      ],
      "fact": "Recovery, in Shay's account, isn't spontaneous: it requires someone able to bear witness to a veteran's story without flinching or rushing to judge it -- exactly the capacity that unanswered social withdrawal forecloses.",
      "relationKind": "dynamic",
      "idealTerms": [
        "social withdrawal",
        "communalization"
      ]
    }
  ],
  "lenses": [
    {
      "id": "the-relational-axis",
      "prompt": "Which concepts describe the state of a soldier's bonds and relationships with other people, rather than something happening inside one person's own mind?",
      "explanation": "The injury and the cure turn out to share the same scale: what breaks in 'Shrinkage of the Moral Horizon' is a bond between people, and what Shay proposes to rebuild in 'Healing and Griefwork' is also a bond between people -- a community able to hold a veteran's story. Neither is a purely private, internal event.",
      "targets": [
        "special comrade",
        "moral horizon",
        "unit cohesion",
        "communalization"
      ]
    },
    {
      "id": "the-interior-axis",
      "prompt": "Which concepts describe something that happens within a single soldier's own mind and body, rather than in the bonds between him and other people?",
      "explanation": "These six concepts track what combat trauma changes inside one person -- an emotional state, a physiological fury, a philosophical claim about responsibility, a damaged capacity -- distinct from the interpersonal bonds the first lens isolates. Shay's book insists both scales matter: an injury that starts inside a moral community ends up doing its lasting damage inside one mind.",
      "targets": [
        "indignant rage",
        "berserk state",
        "loss of restraint",
        "moral luck",
        "loss of trust",
        "social withdrawal"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "exit-voice-and-loyalty",
        "reason": "Shay's soldier can't simply exit a combat unit when authority betrays him; Hirschman's framework for what people do when exit is costly or impossible -- voice, or a loyalty that curdles into something else -- names the trap Shay's veterans are caught inside.",
        "via": [
          "betrayal",
          "loyalty"
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
      "puzzleId": "achilles-in-vietnam",
      "puzzleRevision": "fnv1a32:6472a60c",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:themis": {
          "x": 572.29,
          "y": 597,
          "pinned": false
        },
        "term:legitimate authority": {
          "x": 552.09,
          "y": 468.85,
          "pinned": false
        },
        "term:indignant rage": {
          "x": 461.33,
          "y": 594.61,
          "pinned": false
        },
        "term:special comrade": {
          "x": 828.91,
          "y": 594.14,
          "pinned": false
        },
        "term:moral horizon": {
          "x": 897.05,
          "y": 476.22,
          "pinned": false
        },
        "term:interrupted grief": {
          "x": 755.03,
          "y": 464.98,
          "pinned": false
        },
        "term:berserk state": {
          "x": 682.54,
          "y": 342.3,
          "pinned": false
        },
        "term:loss of restraint": {
          "x": 725.48,
          "y": 206.42,
          "pinned": false
        },
        "term:dishonoring the enemy": {
          "x": 562.17,
          "y": 244.5,
          "pinned": false
        },
        "term:loss of trust": {
          "x": 441.03,
          "y": 79.15,
          "pinned": false
        },
        "term:moral luck": {
          "x": 327.59,
          "y": 38.64,
          "pinned": false
        },
        "term:social withdrawal": {
          "x": 332.59,
          "y": 171.59,
          "pinned": false
        },
        "term:communalization": {
          "x": 320.61,
          "y": 319.91,
          "pinned": false
        },
        "term:griefwork": {
          "x": 296.26,
          "y": 441.09,
          "pinned": false
        },
        "term:unit cohesion": {
          "x": 197.4,
          "y": 377.97,
          "pinned": false
        },
        "term:moral community": {
          "x": 686.44,
          "y": 597,
          "pinned": false
        },
        "term:complicated grief": {
          "x": 824.12,
          "y": 326.12,
          "pinned": false
        },
        "term:bearing witness": {
          "x": 201.41,
          "y": 241.83,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2844.09,
        "score": 2844.0913318497333
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:26:48.591Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "achilles-in-vietnam",
      "puzzleRevision": "fnv1a32:6472a60c",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 634.91,
          "y": 169.65,
          "pinned": false
        },
        "cluster:1": {
          "x": 880.67,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 634.91,
          "y": 626.35,
          "pinned": false
        },
        "cluster:3": {
          "x": 237.26,
          "y": 539.13,
          "pinned": false
        },
        "cluster:4": {
          "x": 237.26,
          "y": 256.87,
          "pinned": false
        }
      },
      "bridges": {
        "term:moral community": {
          "x": 685.73,
          "y": 313.67,
          "pinned": false
        },
        "term:complicated grief": {
          "x": 829.85,
          "y": 542.03,
          "pinned": false
        },
        "term:bearing witness": {
          "x": 237.26,
          "y": 398,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "themis",
          "legitimate authority",
          "indignant rage"
        ],
        "cluster:1": [
          "special comrade",
          "moral horizon",
          "interrupted grief"
        ],
        "cluster:2": [
          "berserk state",
          "loss of restraint",
          "dishonoring the enemy"
        ],
        "cluster:3": [
          "loss of trust",
          "moral luck",
          "social withdrawal"
        ],
        "cluster:4": [
          "communalization",
          "griefwork",
          "unit cohesion"
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
        "totalLength": 321.018853867068
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:26:51.798Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "achilles-in-vietnam",
      "puzzleRevision": "fnv1a32:6472a60c",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:themis": {
          "x": 505.77,
          "y": 74.5
        },
        "term:legitimate authority": {
          "x": 481.09,
          "y": 206.7
        },
        "term:indignant rage": {
          "x": 286.05,
          "y": 22
        },
        "term:special comrade": {
          "x": 801.51,
          "y": 55.44
        },
        "term:moral horizon": {
          "x": 822.19,
          "y": 181.21
        },
        "term:interrupted grief": {
          "x": 711.73,
          "y": 297.43
        },
        "term:berserk state": {
          "x": 480.77,
          "y": 552.25
        },
        "term:loss of restraint": {
          "x": 786.82,
          "y": 598
        },
        "term:dishonoring the enemy": {
          "x": 756.89,
          "y": 436.68
        },
        "term:loss of trust": {
          "x": 202.2,
          "y": 598
        },
        "term:moral luck": {
          "x": 365.44,
          "y": 598
        },
        "term:social withdrawal": {
          "x": 142.44,
          "y": 348.64
        },
        "term:communalization": {
          "x": 123.44,
          "y": 196.68
        },
        "term:griefwork": {
          "x": 235.56,
          "y": 126.95
        },
        "term:unit cohesion": {
          "x": 334.15,
          "y": 181.96
        },
        "term:moral community": {
          "x": 635.15,
          "y": 42.32
        },
        "term:complicated grief": {
          "x": 583.96,
          "y": 403.01
        },
        "term:bearing witness": {
          "x": 129.97,
          "y": 263.61
        },
        "cluster:0": {
          "x": 459.47,
          "y": 22
        },
        "cluster:1": {
          "x": 691.16,
          "y": 230.52
        },
        "cluster:2": {
          "x": 629.1,
          "y": 557.51
        },
        "cluster:3": {
          "x": 290.73,
          "y": 461.6
        },
        "cluster:4": {
          "x": 295.37,
          "y": 263.61
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:26:54.834Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:26:45.966Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
