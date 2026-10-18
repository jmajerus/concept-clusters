// Generated from content/puzzles/control-and-exit.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "control-and-exit",
  "title": "Control and Exit",
  "category": "science-technology-society",
  "categories": [
    "science-technology-society",
    "computer-science"
  ],
  "subcategories": {
    "computer-science": "computing-and-society",
    "science-technology-society": "persuasive-deceptive-design"
  },
  "info": {
    "text": "How interfaces make access conditional, refuse to accept a clear no, and create asymmetric paths in which compliance and entry are easy while privacy protection and exit are costly. This puzzle examines Forced Action, Nagging, Obstruction, and Hard to Cancel.",
    "links": [
      {
        "href": "https://deceptive.design/types/forced-action/"
      },
      {
        "href": "https://deceptive.design/types/obstruction/"
      }
    ]
  },
  "clusters": [
    {
      "id": "person-s-intended-action",
      "name": "Person's intended action",
      "color": "teal",
      "fact": "People approach an interface with purposes of their own: to use a service, decline a request, protect personal information, or end a relationship they no longer want.",
      "terms": [
        "access desired service",
        "use core feature",
        "decline request",
        "end subscription",
        "control personal data"
      ],
      "seeds": [
        "access desired service",
        "end subscription"
      ],
      "termInfo": {
        "access desired service": {
          "text": "The product, information, confirmation, or capability the person originally came to obtain.",
          "links": [
            {
              "href": "https://deceptive.design/types/forced-action/"
            }
          ]
        },
        "use core feature": {
          "text": "Performing the central function of a product without being diverted into an unrelated registration, installation, or permission flow.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-20/"
            }
          ]
        },
        "decline request": {
          "text": "Refusing a business's invitation to enable notifications, share data, subscribe, install an app, or take another optional action.",
          "links": [
            {
              "href": "https://deceptive.design/types/nagging/"
            }
          ]
        },
        "end subscription": {
          "text": "Terminating an ongoing service, membership, or recurring-payment relationship.",
          "links": [
            {
              "href": "https://deceptive.design/types/hard-to-cancel/"
            }
          ]
        },
        "control personal data": {
          "text": "Choosing whether personal information is collected, shared, retained, or used for purposes beyond the requested service.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-20/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/types/"
          }
        ]
      }
    },
    {
      "id": "business-imposed-action",
      "name": "Business-imposed action",
      "color": "blue",
      "fact": "A business can condition access on registration, disclosure, installation, marketing consent, or payment authority that serves its own interests more than the person's immediate goal.",
      "terms": [
        "create account",
        "disclose personal data",
        "install app",
        "accept marketing",
        "provide payment details"
      ],
      "seeds": [
        "create account",
        "disclose personal data"
      ],
      "termInfo": {
        "create account": {
          "text": "Registering an ongoing identity and relationship with the business before completing a task that may not inherently require one.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-20/"
            }
          ]
        },
        "disclose personal data": {
          "text": "Supplying contact, identity, location, address-book, behavioral, or other information as a condition of access.",
          "links": [
            {
              "href": "https://deceptive.design/types/forced-action/"
            }
          ]
        },
        "install app": {
          "text": "Downloading dedicated software before receiving information or completing an action that could otherwise be handled through the current channel.",
          "links": [
            {
              "href": "https://deceptive.design/types/forced-action/"
            }
          ]
        },
        "accept marketing": {
          "text": "Agreeing to promotional communication, targeting, or data use as part of a bundled or apparently mandatory step.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-20/"
            }
          ]
        },
        "provide payment details": {
          "text": "Supplying a reusable payment method before accessing a trial, document, or service advertised as free or immediately available.",
          "links": [
            {
              "href": "https://deceptive.design/types/forced-action/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/types/forced-action/"
          }
        ]
      }
    },
    {
      "id": "asymmetric-pathways",
      "name": "Asymmetric pathways",
      "color": "amber",
      "fact": "Business-favorable actions are made immediate and prominent, while refusal and exit are interrupted, hidden, lengthened, or displaced into less convenient channels.",
      "terms": [
        "repeated prompt",
        "easy enrollment",
        "hidden cancellation",
        "extra steps",
        "channel switching"
      ],
      "seeds": [
        "repeated prompt",
        "hidden cancellation"
      ],
      "termInfo": {
        "repeated prompt": {
          "text": "A request that returns after refusal because the interface offers only a temporary dismissal such as 'Not now'.",
          "links": [
            {
              "href": "https://deceptive.design/types/nagging/"
            }
          ]
        },
        "easy enrollment": {
          "text": "A short, prominent, and low-effort path into a subscription, account, permission, or continuing relationship.",
          "links": [
            {
              "href": "https://deceptive.design/types/hard-to-cancel/"
            }
          ]
        },
        "hidden cancellation": {
          "text": "An exit option buried in menus, visually deemphasized, ambiguously labeled, or omitted from the channel where enrollment occurred.",
          "links": [
            {
              "href": "https://deceptive.design/types/hard-to-cancel/"
            }
          ]
        },
        "extra steps": {
          "text": "Additional pages, confirmations, surveys, retention offers, or explanations inserted before the person's goal is allowed to complete.",
          "links": [
            {
              "href": "https://deceptive.design/types/obstruction/"
            }
          ]
        },
        "channel switching": {
          "text": "Requiring the person to move from web or app to telephone, mail, desktop, or live support to complete refusal or exit.",
          "links": [
            {
              "href": "https://deceptive.design/types/hard-to-cancel/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-19/"
          }
        ]
      }
    },
    {
      "id": "consequences-for-agency",
      "name": "Consequences for agency",
      "color": "magenta",
      "fact": "Conditional access, repeated interruption, and obstructed exit consume personal resources and can leave people sharing data, remaining enrolled, or accepting conditions they did not freely choose.",
      "terms": [
        "interrupted task",
        "time and attention loss",
        "fatigue",
        "privacy loss",
        "forced persistence",
        "impaired autonomy"
      ],
      "seeds": [
        "time and attention loss",
        "impaired autonomy"
      ],
      "termInfo": {
        "interrupted task": {
          "text": "The person's original activity is paused or displaced by a request serving the business's objective.",
          "links": [
            {
              "href": "https://deceptive.design/types/nagging/"
            }
          ]
        },
        "time and attention loss": {
          "text": "Personal resources consumed by repeated prompts, unnecessary navigation, waiting, searching, or explaining a decision already made.",
          "links": [
            {
              "href": "https://deceptive.design/types/nagging/"
            }
          ]
        },
        "fatigue": {
          "text": "Mental and emotional depletion produced by friction, repetition, confusion, or prolonged effort.",
          "links": [
            {
              "href": "https://deceptive.design/types/obstruction/"
            }
          ]
        },
        "privacy loss": {
          "text": "Personal information or permission surrendered because access was conditioned on disclosure rather than supported by freely chosen consent.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-20/"
            }
          ]
        },
        "forced persistence": {
          "text": "Continued enrollment, payment, permission, or participation caused by the burden of reversing it rather than a renewed desire to continue.",
          "links": [
            {
              "href": "https://deceptive.design/types/hard-to-cancel/"
            }
          ]
        },
        "impaired autonomy": {
          "text": "Reduced practical ability to pursue one's own goal, maintain a refusal, protect information, or leave an unwanted relationship.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/part-1/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/types/obstruction/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "conditional-access",
      "term": "conditional access",
      "clusters": [
        0,
        1
      ],
      "fact": "The business places an additional action between the person and the service or feature they intended to use, turning access into leverage for registration, disclosure, installation, marketing, or payment authority.",
      "info": {
        "text": "Making one desired action contingent on another action selected by the business.",
        "links": [
          {
            "href": "https://deceptive.design/types/forced-action/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "access desired service",
        "create account"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "asymmetric-friction",
      "term": "asymmetric friction",
      "clusters": [
        0,
        2
      ],
      "fact": "The interface changes difficulty according to whose interests an action serves: joining, accepting, and sharing are streamlined, while declining, protecting privacy, and leaving encounter persistence or barriers.",
      "info": {
        "text": "Unequal effort deliberately assigned to equivalent choices according to whether they benefit or disadvantage the business.",
        "links": [
          {
            "href": "https://deceptive.design/types/hard-to-cancel/"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "end subscription",
        "hidden cancellation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "resource-depletion",
      "term": "resource depletion",
      "clusters": [
        2,
        3
      ],
      "fact": "Repeated prompts and obstructive pathways consume time, attention, and patience until the person complies, gives up, or remains in a relationship they intended to change.",
      "info": {
        "text": "Using friction and interruption to exhaust the resources required to maintain refusal or complete an unwanted but legitimate exit.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-19/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "extra steps",
        "fatigue"
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
      "id": "forced-action",
      "prompt": "Which concepts form the dominant signature of the Forced Action dark pattern?",
      "explanation": "Forced Action makes something the person wants conditional on another action the business wants. The condition becomes deceptive when it is unexpected, unnecessary, bundled with unrelated consent, or designed to extract data or commitment rather than enable the requested service.",
      "targets": [
        "access desired service",
        "create account",
        "disclose personal data",
        "conditional access",
        "privacy loss",
        "impaired autonomy"
      ],
      "reasons": {
        "access desired service": "The person begins with a goal of their own rather than a desire to satisfy the business's additional demand.",
        "create account": "Registration may be imposed even when the requested task does not inherently require a continuing account relationship.",
        "disclose personal data": "Access can be made conditional on surrendering information beyond what the task reasonably needs.",
        "conditional access": "The desired action is withheld until the user performs the business-selected exchange.",
        "privacy loss": "The compelled exchange may expose personal information or permit uses the person did not freely choose.",
        "impaired autonomy": "The person's practical choices are narrowed by tying one goal to an unwanted condition."
      }
    },
    {
      "id": "nagging",
      "prompt": "Which concepts form the dominant signature of the Nagging dark pattern?",
      "explanation": "Nagging treats a refusal as temporary rather than final. Repeated prompts interrupt the person's actual task and impose a continuing tax on time and attention until giving in seems easier than protecting the original choice.",
      "targets": [
        "decline request",
        "repeated prompt",
        "interrupted task",
        "time and attention loss",
        "fatigue"
      ],
      "reasons": {
        "decline request": "The person has already indicated that they do not want the requested action or permission.",
        "repeated prompt": "The same request returns because the interface does not provide or respect a durable refusal.",
        "interrupted task": "The business inserts its own objective into the activity the person was trying to complete.",
        "time and attention loss": "Each interruption consumes cognitive and temporal resources even when the person continues to refuse.",
        "fatigue": "Accumulated interruptions can wear down resistance and make compliance feel less costly than continued refusal."
      }
    },
    {
      "id": "obstruction",
      "prompt": "Which concepts form the dominant signature of the Obstruction dark pattern?",
      "explanation": "Obstruction deliberately places hurdles between a person and a goal that conflicts with the business's interests. Hidden controls, extra steps, and forced movement between channels consume resources and increase the chance that the person will abandon the attempt.",
      "targets": [
        "end subscription",
        "hidden cancellation",
        "extra steps",
        "channel switching",
        "resource depletion",
        "time and attention loss"
      ],
      "reasons": {
        "end subscription": "Cancellation is a user goal whose completion may reduce the business's revenue or retention metrics.",
        "hidden cancellation": "The route to the desired action is difficult to locate or deliberately deemphasized.",
        "extra steps": "The person must complete more actions than the task reasonably requires.",
        "channel switching": "An online relationship may be made cancellable only by phone, mail, or another less convenient channel.",
        "resource depletion": "The obstacles work by consuming enough effort, patience, or attention to produce abandonment.",
        "time and attention loss": "The person pays a non-financial cost simply to exercise a choice that should remain available."
      }
    },
    {
      "id": "hard-to-cancel",
      "prompt": "Which concepts form the dominant signature of the Hard to Cancel or Roach Motel pattern?",
      "explanation": "Hard to Cancel creates a lifecycle asymmetry: joining takes seconds, while leaving requires searching, repeated confirmations, or movement to a less convenient channel. The resulting persistence reflects imposed friction rather than continuing preference.",
      "targets": [
        "end subscription",
        "easy enrollment",
        "hidden cancellation",
        "channel switching",
        "forced persistence",
        "asymmetric friction"
      ],
      "reasons": {
        "end subscription": "The person is trying to terminate an ongoing service or payment relationship.",
        "easy enrollment": "The business minimizes effort when the action increases acquisition or recurring revenue.",
        "hidden cancellation": "The exit control is made harder to find than the entry control.",
        "channel switching": "Cancellation may require a phone call, live agent, postal request, or desktop flow even when signup was immediate and online.",
        "forced persistence": "The relationship continues because leaving is burdensome, not because the person affirmatively wishes to remain.",
        "asymmetric friction": "The effort required depends on whether the person's goal serves or conflicts with the business's interests."
      }
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "control-and-exit",
      "puzzleRevision": "fnv1a32:369b1e78",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:access desired service": {
          "x": 230.67,
          "y": 364.63,
          "pinned": false
        },
        "term:use core feature": {
          "x": 72.4,
          "y": 313.12,
          "pinned": false
        },
        "term:decline request": {
          "x": 88.73,
          "y": 457.67,
          "pinned": false
        },
        "term:end subscription": {
          "x": 363.69,
          "y": 466.56,
          "pinned": false
        },
        "term:control personal data": {
          "x": 221.55,
          "y": 549.33,
          "pinned": false
        },
        "term:create account": {
          "x": 287.01,
          "y": 141.55,
          "pinned": false
        },
        "term:disclose personal data": {
          "x": 177.61,
          "y": 23,
          "pinned": false
        },
        "term:install app": {
          "x": 329.55,
          "y": 23,
          "pinned": false
        },
        "term:accept marketing": {
          "x": 152.53,
          "y": 188.61,
          "pinned": false
        },
        "term:provide payment details": {
          "x": 458.3,
          "y": 108.65,
          "pinned": false
        },
        "term:repeated prompt": {
          "x": 686.25,
          "y": 108.56,
          "pinned": false
        },
        "term:easy enrollment": {
          "x": 846.31,
          "y": 165.49,
          "pinned": false
        },
        "term:hidden cancellation": {
          "x": 590.88,
          "y": 230.84,
          "pinned": false
        },
        "term:extra steps": {
          "x": 733.35,
          "y": 229.59,
          "pinned": false
        },
        "term:channel switching": {
          "x": 807.29,
          "y": 23,
          "pinned": false
        },
        "term:interrupted task": {
          "x": 598.89,
          "y": 597,
          "pinned": false
        },
        "term:time and attention loss": {
          "x": 663.76,
          "y": 439.87,
          "pinned": false
        },
        "term:fatigue": {
          "x": 756.46,
          "y": 331.66,
          "pinned": false
        },
        "term:privacy loss": {
          "x": 490.6,
          "y": 515.6,
          "pinned": false
        },
        "term:forced persistence": {
          "x": 844.17,
          "y": 469.93,
          "pinned": false
        },
        "term:impaired autonomy": {
          "x": 750.71,
          "y": 597,
          "pinned": false
        },
        "term:conditional access": {
          "x": 372.22,
          "y": 263.47,
          "pinned": false
        },
        "term:asymmetric friction": {
          "x": 497.52,
          "y": 370.13,
          "pinned": false
        },
        "term:resource depletion": {
          "x": 881.3,
          "y": 313.06,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4374.85,
        "score": 4374.84909150133
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:26.603Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "control-and-exit",
      "puzzleRevision": "fnv1a32:369b1e78",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 578.82,
          "pinned": false
        },
        "cluster:1": {
          "x": 807.78,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 217.18,
          "pinned": false
        },
        "cluster:3": {
          "x": 242.22,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:conditional access": {
          "x": 762.55,
          "y": 584.58,
          "pinned": false
        },
        "term:asymmetric friction": {
          "x": 525,
          "y": 398,
          "pinned": false
        },
        "term:resource depletion": {
          "x": 287.45,
          "y": 211.42,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "access desired service",
          "use core feature",
          "decline request",
          "end subscription",
          "control personal data"
        ],
        "cluster:1": [
          "create account",
          "disclose personal data",
          "install app",
          "accept marketing",
          "provide payment details"
        ],
        "cluster:2": [
          "repeated prompt",
          "easy enrollment",
          "hidden cancellation",
          "extra steps",
          "channel switching"
        ],
        "cluster:3": [
          "interrupted task",
          "time and attention loss",
          "fatigue",
          "privacy loss",
          "forced persistence",
          "impaired autonomy"
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
        "totalLength": 319.5369095560503
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:28.563Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "control-and-exit",
      "puzzleRevision": "fnv1a32:369b1e78",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:access desired service": {
          "x": 505,
          "y": 195
        },
        "term:use core feature": {
          "x": 295.9,
          "y": 281.56
        },
        "term:decline request": {
          "x": 373.37,
          "y": 22
        },
        "term:end subscription": {
          "x": 433.58,
          "y": 273.61
        },
        "term:control personal data": {
          "x": 546.54,
          "y": 22
        },
        "term:create account": {
          "x": 895.9,
          "y": 447.37
        },
        "term:disclose personal data": {
          "x": 710.88,
          "y": 257.93
        },
        "term:install app": {
          "x": 791.41,
          "y": 322.5
        },
        "term:accept marketing": {
          "x": 889.6,
          "y": 22
        },
        "term:provide payment details": {
          "x": 772.29,
          "y": 109.09
        },
        "term:repeated prompt": {
          "x": 635.97,
          "y": 393.6
        },
        "term:easy enrollment": {
          "x": 679.47,
          "y": 524.45
        },
        "term:hidden cancellation": {
          "x": 446.55,
          "y": 430.35
        },
        "term:extra steps": {
          "x": 410.23,
          "y": 543.45
        },
        "term:channel switching": {
          "x": 513.45,
          "y": 598
        },
        "term:interrupted task": {
          "x": 249.21,
          "y": 189.94
        },
        "term:time and attention loss": {
          "x": 92.45,
          "y": 149.52
        },
        "term:fatigue": {
          "x": 363.09,
          "y": 349.32
        },
        "term:privacy loss": {
          "x": 57.8,
          "y": 425.29
        },
        "term:forced persistence": {
          "x": 76.7,
          "y": 568.36
        },
        "term:impaired autonomy": {
          "x": 230.04,
          "y": 577.58
        },
        "term:conditional access": {
          "x": 629.89,
          "y": 298.12
        },
        "term:asymmetric friction": {
          "x": 498.78,
          "y": 346.3
        },
        "term:resource depletion": {
          "x": 304.93,
          "y": 474.04
        },
        "cluster:0": {
          "x": 378.05,
          "y": 145.1
        },
        "cluster:1": {
          "x": 867.55,
          "y": 164.09
        },
        "cluster:2": {
          "x": 498.27,
          "y": 477.51
        },
        "cluster:3": {
          "x": 181.59,
          "y": 349.32
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:37:30.498Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:37:24.417Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
