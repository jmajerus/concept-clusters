// Generated from content/puzzles/golden-shields.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "golden-shields",
  "title": "Golden Shields",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science"
  ],
  "subcategories": {
    "peace-conflict-studies": "war-militarism",
    "political-science": "political-institutions-regimes"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "How executive-branch legal memos manufactured impunity for a secret detention and interrogation program -- and how that permissive legal culture spilled into the undisciplined abuse at Abu Ghraib.",
    "citations": [
      {
        "title": "The Dark Side: The Inside Story of How the War on Terror Turned Into a War on American Ideals",
        "author": "Mayer, Jane",
        "publisher": "Doubleday",
        "year": "2008"
      }
    ]
  },
  "clusters": [
    {
      "id": "legal-machinery",
      "name": "The Legal Machinery",
      "color": "teal",
      "fact": "Executive branch lawyers redefined torture in a formal legal opinion, granting the president authority to authorize coercive interrogation and stripping detainees of the legal status that would have entitled them to Geneva protections.",
      "terms": [
        "Bybee Memo",
        "Unlawful Enemy Combatant",
        "John Yoo",
        "Office of Legal Counsel",
        "Unitary Executive Theory"
      ],
      "seeds": [
        "Bybee Memo",
        "Unlawful Enemy Combatant"
      ],
      "termInfo": {
        "Bybee Memo": {
          "text": "The August 2002 Justice Department opinion, drafted by John Yoo and signed by Jay Bybee, that narrowed the legal definition of torture.",
          "links": [
            {
              "href": "wiki:Torture Memos"
            }
          ]
        },
        "John Yoo": {
          "text": "The Office of Legal Counsel attorney who drafted the memos authorizing coercive interrogation.",
          "links": [
            {
              "href": "wiki:John Yoo"
            }
          ]
        },
        "Office of Legal Counsel": {
          "text": "The Justice Department office whose legal opinions are treated as binding on the rest of the executive branch.",
          "links": [
            {
              "href": "wiki:Office of Legal Counsel"
            }
          ]
        },
        "Unitary Executive Theory": {
          "text": "The doctrine that the president holds essentially unchecked control over the executive branch, invoked to justify the interrogation program.",
          "links": [
            {
              "href": "wiki:Unitary executive theory"
            }
          ]
        },
        "Unlawful Enemy Combatant": {
          "text": "A legal classification placing a detainee outside the categories that would guarantee Geneva Convention protections or judicial review.",
          "links": [
            {
              "href": "wiki:Unlawful combatant"
            }
          ]
        }
      }
    },
    {
      "id": "detention-network",
      "name": "The Detention Network",
      "color": "amber",
      "fact": "The state built a network of offshore and foreign-soil facilities and covert transfer routes specifically chosen to keep detainees outside the reach of domestic courts and international monitors.",
      "terms": [
        "Guantanamo Bay Detention Camp",
        "CIA Black Sites",
        "Extraordinary Rendition",
        "Incommunicado Detention"
      ],
      "seeds": [
        "Guantanamo Bay Detention Camp",
        "CIA Black Sites"
      ],
      "termInfo": {
        "CIA Black Sites": {
          "text": "Secret CIA-operated prisons located outside the United States, used to hold detainees beyond the reach of any court.",
          "links": [
            {
              "href": "wiki:Black site"
            }
          ]
        },
        "Extraordinary Rendition": {
          "text": "The covert transfer of a detainee to another country's custody, circumventing extradition law and often enabling torture by proxy.",
          "links": [
            {
              "href": "wiki:Extraordinary rendition"
            }
          ]
        },
        "Guantanamo Bay Detention Camp": {
          "text": "The U.S. military prison at Guantanamo Bay, Cuba, chosen partly because its offshore status was argued to place it outside domestic legal jurisdiction.",
          "links": [
            {
              "href": "wiki:Guantanamo Bay detention camp"
            }
          ]
        },
        "Incommunicado Detention": {
          "text": "Holding a detainee with no outside contact and no acknowledgment of their whereabouts -- the same mechanism international law treats as enforced disappearance.",
          "links": [
            {
              "href": "wiki:Enforced disappearance"
            }
          ]
        }
      }
    },
    {
      "id": "interrogation-program",
      "name": "The Interrogation Program",
      "color": "blue",
      "fact": "The program's techniques were reverse-engineered from military training designed to help soldiers resist torture, then repurposed as memo-authorized methods for extracting confessions from detainees.",
      "terms": [
        "Enhanced Interrogation Techniques",
        "Waterboarding",
        "Walling",
        "SERE Program",
        "Sleep Deprivation"
      ],
      "seeds": [
        "Enhanced Interrogation Techniques",
        "Waterboarding"
      ],
      "termInfo": {
        "Enhanced Interrogation Techniques": {
          "text": "The euphemism for the CIA's memo-authorized set of coercive methods, including waterboarding, walling, and prolonged sleep deprivation.",
          "links": [
            {
              "href": "wiki:Enhanced interrogation techniques"
            }
          ]
        },
        "SERE Program": {
          "text": "Military training designed to help personnel resist interrogation if captured; its techniques were reverse-engineered for offensive use against detainees.",
          "links": [
            {
              "href": "wiki:Survival, Evasion, Resistance and Escape"
            }
          ]
        },
        "Sleep Deprivation": {
          "text": "Prolonged forced wakefulness, authorized for up to 180 hours at a time as an interrogation technique.",
          "links": [
            {
              "href": "wiki:Sleep deprivation"
            }
          ]
        },
        "Walling": {
          "text": "A technique in which a detainee's neck is encircled by a collar and used to slam them against a wall.",
          "links": [
            {
              "href": "wiki:Walling"
            }
          ]
        },
        "Waterboarding": {
          "text": "A technique simulating drowning, the most publicly notorious of the authorized methods.",
          "links": [
            {
              "href": "wiki:Waterboarding"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "golden-shield",
      "term": "Golden Shield",
      "clusters": [
        0,
        1
      ],
      "fact": "The OLC memos functioned as advance legal cover -- 'golden shields' -- that CIA personnel relied on before conducting renditions and running black sites, letting field officers act without individual criminal exposure.",
      "info": {
        "text": "Mayer's own term for how OLC legal opinions functioned: as advance immunity for anyone who acted on their authorization.",
        "links": [
          {
            "href": "wiki:Torture Memos"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "ghost-detainees",
      "term": "Ghost Detainees",
      "clusters": [
        1,
        2
      ],
      "fact": "Detainees were kept off official rolls and hidden from the Red Cross specifically to allow extended, unmonitored interrogation without legal or medical oversight.",
      "info": {
        "text": "A detainee held off official registries and hidden from the Red Cross, specifically to keep their interrogation outside any accountability structure.",
        "links": [
          {
            "href": "wiki:Ghost detainee"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "abu-ghraib",
      "term": "Abu Ghraib",
      "clusters": [
        0,
        2
      ],
      "fact": "Abu Ghraib's abuse was undisciplined military-police conduct downstream of the legal permissiveness the memos created -- not the CIA's own authorized program, but its cultural runoff.",
      "info": {
        "text": "The Iraqi military prison where photographs of military-police abuse became public in 2004, revealing conduct distinct from -- but enabled by -- the CIA's own memo-authorized program.",
        "links": [
          {
            "href": "wiki:Abu Ghraib torture and prisoner abuse"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "concealment-from-oversight",
      "prompt": "Which concepts describe mechanisms built specifically to prevent outside legal or humanitarian oversight?",
      "explanation": "Each of these functions to remove a detainee, a practice, or a decision from the reach of courts, the Red Cross, or public accountability -- concealment was not incidental to the program, it was engineered into its legal and physical design.",
      "targets": [
        "Unlawful Enemy Combatant",
        "CIA Black Sites",
        "Incommunicado Detention",
        "Golden Shield",
        "Ghost Detainees"
      ],
      "reasons": {
        "Golden Shield": "The memos existed to remove individual legal exposure before the fact, not to explain conduct after it.",
        "Unlawful Enemy Combatant": "This classification was created specifically to place detainees outside the legal categories that would guarantee judicial review."
      }
    },
    {
      "id": "memo-to-method",
      "prompt": "Which concepts trace a specific legal authorization directly into a specific interrogation practice?",
      "explanation": "This is the direct pipeline from doctrine to practice: a legal opinion authorized a category of techniques, provided the cover to use them, and those techniques were themselves borrowed wholesale from a military program designed to resist -- not inflict -- coercion.",
      "targets": [
        "Bybee Memo",
        "Golden Shield",
        "Enhanced Interrogation Techniques",
        "Waterboarding",
        "SERE Program"
      ],
      "reasons": {
        "SERE Program": "The techniques were not invented for interrogation; they were repurposed from a program built to train resistance to them."
      }
    },
    {
      "id": "permissiveness-cascade",
      "prompt": "Which concepts show legal permissiveness producing consequences that went beyond what the interrogation program itself formally authorized?",
      "explanation": "The memos didn't just authorize a bounded program -- they created a legal climate that CIA personnel used to hide detainees and that produced undisciplined abuse at Abu Ghraib, well outside what any memo specifically sanctioned. The lesson isn't that these are the same program; it's that permissiveness cascades past its own stated limits.",
      "targets": [
        "Unitary Executive Theory",
        "Golden Shield",
        "Abu Ghraib",
        "Ghost Detainees"
      ],
      "reasons": {
        "Abu Ghraib": "Abu Ghraib is the clearest evidence that the memos' permissiveness exceeded its own intended scope, not proof that it was the same thing as the CIA's program."
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
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:2d443593",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Bybee Memo": {
          "x": 691.73,
          "y": 188.66,
          "pinned": false
        },
        "term:Unlawful Enemy Combatant": {
          "x": 815.13,
          "y": 282.59,
          "pinned": false
        },
        "term:John Yoo": {
          "x": 588.68,
          "y": 207.15,
          "pinned": false
        },
        "term:Office of Legal Counsel": {
          "x": 611.21,
          "y": 59.82,
          "pinned": false
        },
        "term:Unitary Executive Theory": {
          "x": 805.82,
          "y": 83.61,
          "pinned": false
        },
        "term:Guantanamo Bay Detention Camp": {
          "x": 486.69,
          "y": 374.76,
          "pinned": false
        },
        "term:CIA Black Sites": {
          "x": 662.24,
          "y": 438.06,
          "pinned": false
        },
        "term:Extraordinary Rendition": {
          "x": 562.22,
          "y": 572.65,
          "pinned": false
        },
        "term:Incommunicado Detention": {
          "x": 370.46,
          "y": 551.82,
          "pinned": false
        },
        "term:Enhanced Interrogation Techniques": {
          "x": 317.11,
          "y": 200.29,
          "pinned": false
        },
        "term:Waterboarding": {
          "x": 241.62,
          "y": 23,
          "pinned": false
        },
        "term:Walling": {
          "x": 169.9,
          "y": 107.48,
          "pinned": false
        },
        "term:SERE Program": {
          "x": 184.44,
          "y": 335.97,
          "pinned": false
        },
        "term:Sleep Deprivation": {
          "x": 112.25,
          "y": 216.8,
          "pinned": false
        },
        "term:Golden Shield": {
          "x": 651.78,
          "y": 302.27,
          "pinned": false
        },
        "term:Ghost Detainees": {
          "x": 301.67,
          "y": 398.89,
          "pinned": false
        },
        "term:Abu Ghraib": {
          "x": 495.81,
          "y": 158.81,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3541.57,
        "score": 3541.570384046002
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:33:05.036Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:2d443593",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 572.26,
          "pinned": false
        },
        "cluster:1": {
          "x": 754.04,
          "y": 310.87,
          "pinned": false
        },
        "cluster:2": {
          "x": 295.96,
          "y": 310.87,
          "pinned": false
        }
      },
      "bridges": {
        "term:Golden Shield": {
          "x": 591.48,
          "y": 421.66,
          "pinned": false
        },
        "term:Ghost Detainees": {
          "x": 525,
          "y": 310.87,
          "pinned": false
        },
        "term:Abu Ghraib": {
          "x": 458.52,
          "y": 421.66,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Bybee Memo",
          "Unlawful Enemy Combatant",
          "John Yoo",
          "Office of Legal Counsel",
          "Unitary Executive Theory"
        ],
        "cluster:1": [
          "Guantanamo Bay Detention Camp",
          "CIA Black Sites",
          "Extraordinary Rendition",
          "Incommunicado Detention"
        ],
        "cluster:2": [
          "Enhanced Interrogation Techniques",
          "Waterboarding",
          "Walling",
          "SERE Program",
          "Sleep Deprivation"
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
        "totalLength": 389.43239208144547
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:33:07.727Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:2d443593",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Bybee Memo": {
          "x": 769.2,
          "y": 261.16
        },
        "term:Unlawful Enemy Combatant": {
          "x": 608.1,
          "y": 198.31
        },
        "term:John Yoo": {
          "x": 857.78,
          "y": 22
        },
        "term:Office of Legal Counsel": {
          "x": 867.55,
          "y": 150.13
        },
        "term:Unitary Executive Theory": {
          "x": 537.56,
          "y": 22
        },
        "term:Guantanamo Bay Detention Camp": {
          "x": 392.08,
          "y": 598
        },
        "term:CIA Black Sites": {
          "x": 211.76,
          "y": 531.4
        },
        "term:Extraordinary Rendition": {
          "x": 611.96,
          "y": 598
        },
        "term:Incommunicado Detention": {
          "x": 544.19,
          "y": 417.1
        },
        "term:Enhanced Interrogation Techniques": {
          "x": 123.95,
          "y": 345.79
        },
        "term:Waterboarding": {
          "x": 295.32,
          "y": 22
        },
        "term:Walling": {
          "x": 397.5,
          "y": 51.98
        },
        "term:SERE Program": {
          "x": 57.8,
          "y": 162.14
        },
        "term:Sleep Deprivation": {
          "x": 159.11,
          "y": 58.96
        },
        "term:Golden Shield": {
          "x": 697.17,
          "y": 352.26
        },
        "term:Ghost Detainees": {
          "x": 461.68,
          "y": 270.33
        },
        "term:Abu Ghraib": {
          "x": 454.21,
          "y": 137.39
        },
        "cluster:0": {
          "x": 721.31,
          "y": 40.91
        },
        "cluster:1": {
          "x": 350.56,
          "y": 392.21
        },
        "cluster:2": {
          "x": 295.11,
          "y": 187.54
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:33:10.238Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:33:02.511Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
