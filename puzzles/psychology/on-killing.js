// Generated from content/puzzles/on-killing.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "on-killing",
  "title": "On Killing",
  "category": "psychology",
  "categories": [
    "psychology",
    "political-science",
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
    "text": "Dave Grossman's argument that human beings carry a deep, documented resistance to killing their own kind -- and what it costs, psychologically, to train a soldier out of it.",
    "links": [
      {
        "href": "wiki:On Killing"
      }
    ],
    "citations": [
      {
        "title": "On Killing: The Psychological Cost of Learning to Kill in War and Society",
        "author": "Grossman, Dave",
        "publisher": "Back Bay Books",
        "year": "1996"
      }
    ]
  },
  "clusters": [
    {
      "id": "resistance-to-killing",
      "name": "The Resistance to Killing",
      "color": "olive",
      "fact": "Across military history, most participants in close, face-to-face combat did not fire to kill -- an instinctive resistance to killing one's own kind so strong that, like the posturing and submission signals that let animals of the same species fight without dying, much of what looks like combat is aimed at avoiding a kill, not accomplishing one.",
      "terms": [
        "instinctive resistance",
        "posturing",
        "ratio of fire",
        "submission signals"
      ],
      "seeds": [
        "instinctive resistance",
        "posturing"
      ],
      "termInfo": {
        "posturing": {
          "text": "Displaying aggression -- size, noise, threat -- without actually attacking, the way many animals, and much of historical hand-to-hand combat, settle contests without a kill.",
          "links": [
            {
              "href": "wiki:Agonistic behaviour"
            }
          ]
        },
        "ratio of fire": {
          "text": "S. L. A. Marshall's contested claim that as few as 15 to 20 percent of World War II riflemen in a position to fire on the enemy actually did so."
        }
      },
      "info": {
        "text": "The documented reluctance most human beings feel toward killing another person, especially at close range.",
        "links": [
          {
            "href": "wiki:Agonistic behaviour"
          }
        ]
      }
    },
    {
      "id": "mechanisms-of-distance",
      "name": "Mechanisms of Distance",
      "color": "blue",
      "fact": "The emotional cost of killing falls as the distance from the victim grows -- whether that distance is physical range, a perceived cultural gulf, a belief in the cause's moral legitimacy, or a scope, screen, or machine standing between the killer and the target.",
      "terms": [
        "physical distance",
        "cultural distance",
        "moral distance",
        "mechanical distance"
      ],
      "seeds": [
        "physical distance",
        "cultural distance"
      ],
      "termInfo": {
        "cultural distance": {
          "text": "Framing an enemy as racially, ethnically, or culturally other -- making them feel less like a specific person and more like a category.",
          "links": [
            {
              "href": "wiki:Dehumanization"
            }
          ]
        },
        "mechanical distance": {
          "text": "A sight, screen, or intervening machine -- a rifle scope, a bomber's altitude -- that turns a person into a technical target."
        },
        "moral distance": {
          "text": "A belief that the killing is sanctioned -- required by a just cause, a legitimate authority, or the rules of war -- which can matter as much to a killer's willingness as literal range.",
          "links": [
            {
              "href": "wiki:Just war theory"
            }
          ]
        }
      },
      "info": {
        "text": "How range, perceived cultural difference, belief in a cause's rightness, and intervening technology each let a person put figurative or literal space between themselves and someone they kill."
      }
    },
    {
      "id": "training-to-overcome-resistance",
      "name": "Training to Overcome Resistance",
      "color": "amber",
      "fact": "Twentieth-century militaries replaced static bullseye targets with realistic, human-shaped targets that dropped when hit, drilling soldiers through operant conditioning to fire reflexively; repeated exposure produced desensitization, and a legitimate chain of command gave soldiers authorization to fire without individually weighing each shot.",
      "terms": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "target discrimination"
      ],
      "seeds": [
        "operant conditioning",
        "desensitization"
      ],
      "termInfo": {
        "authorization": {
          "text": "Acting against one's own resistance simply because a legitimate authority gave the order -- the same dynamic Stanley Milgram documented in his obedience experiments.",
          "links": [
            {
              "href": "wiki:Milgram experiment"
            }
          ]
        },
        "desensitization": {
          "text": "A diminished emotional response to a distressing stimulus after repeated exposure to it.",
          "links": [
            {
              "href": "wiki:Desensitization (psychology)"
            }
          ]
        },
        "operant conditioning": {
          "text": "Learning a behavior by repeatedly pairing it with a consequence, until the response becomes automatic rather than deliberated.",
          "links": [
            {
              "href": "wiki:Operant conditioning"
            }
          ]
        },
        "target discrimination": {
          "text": "Training with realistic, human-shaped targets that fall when hit, instead of abstract bullseyes, so the body learns to fire on a human silhouette without conscious deliberation."
        }
      },
      "info": {
        "text": "The specific training techniques twentieth-century militaries developed to raise the historically low rate at which soldiers actually fired on the enemy.",
        "links": [
          {
            "href": "wiki:Operant conditioning"
          }
        ]
      }
    },
    {
      "id": "the-cost-of-killing",
      "name": "The Cost of Killing",
      "color": "brown",
      "fact": "Grossman traces a predictable emotional sequence after killing -- exhilaration, then guilt, then rationalization and acceptance -- that plays out even in soldiers who believe the killing was justified, and that across a fighting force shows up as psychiatric casualties: breakdowns caused not by wounds but by killing and its aftermath.",
      "terms": [
        "guilt",
        "exhilaration",
        "rationalization",
        "psychiatric casualties"
      ],
      "seeds": [
        "guilt",
        "exhilaration"
      ],
      "termInfo": {
        "guilt": {
          "text": "A moral emotion that occurs when a person believes they have violated their own or a shared standard of conduct.",
          "links": [
            {
              "href": "wiki:Guilt (emotion)"
            }
          ]
        },
        "psychiatric casualties": {
          "text": "Combatants unable to continue fighting because of psychological breakdown rather than physical wounds.",
          "links": [
            {
              "href": "wiki:Psychiatric casualty"
            }
          ]
        },
        "rationalization": {
          "text": "Constructing a seemingly logical reason for an act after the fact, to defend against guilt and protect one's own self-image.",
          "links": [
            {
              "href": "wiki:Rationalization (psychology)"
            }
          ]
        }
      },
      "info": {
        "text": "The emotional and psychological toll that killing exacts on the person who does it, independent of whether the killing was necessary or justified."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-close-combat",
      "term": "close combat",
      "clusters": [
        0,
        1
      ],
      "fact": "Resistance to killing peaks in close, face-to-face combat -- the exact circumstance that growing physical, cultural, moral, and mechanical distance is designed to escape.",
      "relationKind": "dynamic",
      "idealTerms": [
        "instinctive resistance",
        null
      ]
    },
    {
      "id": "bridge-training-simulators",
      "term": "training simulators",
      "clusters": [
        1,
        2
      ],
      "fact": "The same technological remove that creates mechanical distance in real combat is deliberately recreated in training simulators, so a soldier's very first reflexive shots are already fired at a screen, not a person.",
      "relationKind": "foundation",
      "idealTerms": [
        "mechanical distance",
        "operant conditioning"
      ]
    },
    {
      "id": "bridge-rising-firing-rates",
      "term": "rising firing rates",
      "clusters": [
        2,
        3
      ],
      "fact": "As twentieth-century training raised the share of soldiers who would actually fire on the enemy from roughly 15 to 20 percent in World War II to over 90 percent in Vietnam, the rate of psychiatric breakdown rose in step -- suppressing the resistance did not remove its cost, it postponed it.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "psychiatric casualties"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "engineered-to-override",
      "prompt": "Which concepts describe a specific method built into modern military training itself -- a drill, a chain of command, or a training technology -- rather than a broader cultural or moral belief that surrounds the war?",
      "explanation": "Each of these is a lever a twentieth-century military could pull on purpose -- a drill, a legitimizing chain of command, or a piece of training technology -- to raise the historically low rate at which soldiers actually fired to kill. Cultural and moral distance can also be cultivated, but they work through belief and narrative, not through a specific training apparatus.",
      "targets": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "target discrimination",
        "mechanical distance"
      ],
      "reasons": {
        "authorization": "A legitimizing chain of command built into the military structure itself, not a moral conviction a soldier holds independently.",
        "desensitization": "A measurable effect of repeated training exposure, not a belief about the enemy or the cause.",
        "mechanical distance": "Training simulators recreate the same screen-and-sight remove found in real combat technology, so the conditioned reflex is first practiced on a target, not a person.",
        "operant conditioning": "The specific conditioning technique itself -- pairing a reflexive action with a consequence until it no longer requires deliberation.",
        "target discrimination": "A specific drill -- human-shaped, fall-when-hit targets -- engineered to bypass conscious deliberation."
      }
    },
    {
      "id": "relocating-responsibility",
      "prompt": "Which concepts work by relocating the moral responsibility or justification for a kill onto something other than the killer's own individual choice -- the enemy's supposed otherness, the cause's rightness, a superior's order, or a story told afterward -- rather than simply by making the act feel more distant or less vivid?",
      "explanation": "Distance and technology change how vivid a kill feels in the moment; these four instead work on what it means -- letting a killer locate the moral weight of the act in the enemy's difference, the cause's justice, a superior's order, or a story told afterward, anywhere but in a single unshared choice.",
      "targets": [
        "cultural distance",
        "moral distance",
        "authorization",
        "rationalization"
      ],
      "reasons": {
        "authorization": "The same displacement Stanley Milgram's obedience experiments demonstrated in a laboratory: moral responsibility migrates to whoever gave the order.",
        "cultural distance": "Locates the weight of the act in the enemy's supposed otherness rather than in the killer's own choice to fire.",
        "moral distance": "Locates the weight of the act in the cause's presumed rightness rather than in the individual decision to kill.",
        "rationalization": "Locates the weight of the act in a story told afterward, constructed specifically to protect the killer's own self-image."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-and-violence",
        "reason": "Grossman documents the individual psychology that has to be overridden before violence becomes possible; Arendt asks what violence is for at the political level once that threshold is crossed.",
        "via": [
          "violence",
          "instrumentality"
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
      "puzzleId": "on-killing",
      "puzzleRevision": "fnv1a32:b13e05bf",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:instinctive resistance": {
          "x": 341.19,
          "y": 338.33,
          "pinned": false
        },
        "term:posturing": {
          "x": 328.45,
          "y": 483.42,
          "pinned": false
        },
        "term:ratio of fire": {
          "x": 219.62,
          "y": 439.66,
          "pinned": false
        },
        "term:submission signals": {
          "x": 170.94,
          "y": 302.39,
          "pinned": false
        },
        "term:physical distance": {
          "x": 407.47,
          "y": 175.36,
          "pinned": false
        },
        "term:cultural distance": {
          "x": 300.36,
          "y": 63.21,
          "pinned": false
        },
        "term:moral distance": {
          "x": 443.08,
          "y": 34.14,
          "pinned": false
        },
        "term:mechanical distance": {
          "x": 562.03,
          "y": 128.68,
          "pinned": false
        },
        "term:operant conditioning": {
          "x": 688.27,
          "y": 261.42,
          "pinned": false
        },
        "term:desensitization": {
          "x": 838.24,
          "y": 210.92,
          "pinned": false
        },
        "term:authorization": {
          "x": 736.98,
          "y": 117.5,
          "pinned": false
        },
        "term:target discrimination": {
          "x": 826.71,
          "y": 371.93,
          "pinned": false
        },
        "term:guilt": {
          "x": 494.54,
          "y": 597,
          "pinned": false
        },
        "term:exhilaration": {
          "x": 595.57,
          "y": 587.93,
          "pinned": false
        },
        "term:rationalization": {
          "x": 383.62,
          "y": 594.03,
          "pinned": false
        },
        "term:psychiatric casualties": {
          "x": 488.03,
          "y": 465.26,
          "pinned": false
        },
        "term:close combat": {
          "x": 270.38,
          "y": 200.34,
          "pinned": false
        },
        "term:training simulators": {
          "x": 520.02,
          "y": 291.02,
          "pinned": false
        },
        "term:rising firing rates": {
          "x": 661.69,
          "y": 430.19,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3313.1,
        "score": 3313.101733095397
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:27:32.028Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "on-killing",
      "puzzleRevision": "fnv1a32:b13e05bf",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 805.14,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 569.6,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 226.4,
          "pinned": false
        },
        "cluster:3": {
          "x": 244.86,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:close combat": {
          "x": 738.61,
          "y": 557.34,
          "pinned": false
        },
        "term:training simulators": {
          "x": 525,
          "y": 398,
          "pinned": false
        },
        "term:rising firing rates": {
          "x": 311.39,
          "y": 238.66,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "instinctive resistance",
          "posturing",
          "ratio of fire",
          "submission signals"
        ],
        "cluster:1": [
          "physical distance",
          "cultural distance",
          "moral distance",
          "mechanical distance"
        ],
        "cluster:2": [
          "operant conditioning",
          "desensitization",
          "authorization",
          "target discrimination"
        ],
        "cluster:3": [
          "guilt",
          "exhilaration",
          "rationalization",
          "psychiatric casualties"
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
        "totalLength": 326.8941216678958
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:27:34.640Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "on-killing",
      "puzzleRevision": "fnv1a32:b13e05bf",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:instinctive resistance": {
          "x": 421.99,
          "y": 342.65
        },
        "term:posturing": {
          "x": 137.64,
          "y": 520.45
        },
        "term:ratio of fire": {
          "x": 60.95,
          "y": 429.19
        },
        "term:submission signals": {
          "x": 76.7,
          "y": 280.53
        },
        "term:physical distance": {
          "x": 109.24,
          "y": 113.49
        },
        "term:cultural distance": {
          "x": 239.31,
          "y": 22
        },
        "term:moral distance": {
          "x": 388.44,
          "y": 22
        },
        "term:mechanical distance": {
          "x": 541.15,
          "y": 35.43
        },
        "term:operant conditioning": {
          "x": 699.37,
          "y": 109.03
        },
        "term:desensitization": {
          "x": 855.11,
          "y": 155
        },
        "term:authorization": {
          "x": 899.05,
          "y": 286.07
        },
        "term:target discrimination": {
          "x": 873.85,
          "y": 470.7
        },
        "term:guilt": {
          "x": 599.31,
          "y": 598
        },
        "term:exhilaration": {
          "x": 483.78,
          "y": 598
        },
        "term:rationalization": {
          "x": 235.51,
          "y": 598
        },
        "term:psychiatric casualties": {
          "x": 560.02,
          "y": 471.57
        },
        "term:close combat": {
          "x": 203.34,
          "y": 220.61
        },
        "term:training simulators": {
          "x": 542.64,
          "y": 207.29
        },
        "term:rising firing rates": {
          "x": 719.19,
          "y": 558.32
        },
        "cluster:0": {
          "x": 227,
          "y": 387.14
        },
        "cluster:1": {
          "x": 353.13,
          "y": 167.11
        },
        "cluster:2": {
          "x": 718.79,
          "y": 320.7
        },
        "cluster:3": {
          "x": 369.09,
          "y": 514.55
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:27:37.198Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-18T06:08:24.483Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
