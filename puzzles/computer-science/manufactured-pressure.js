// Generated from content/puzzles/manufactured-pressure.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "manufactured-pressure",
  "title": "Manufactured Pressure",
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
    "text": "How fabricated time limits, scarcity claims, and social signals create pressure that narrows deliberation and steers people toward choices they might not otherwise make.",
    "links": [
      {
        "href": "https://deceptive.design/book/contents/chapter-8/"
      },
      {
        "href": "https://deceptive.design/types/"
      }
    ]
  },
  "clusters": [
    {
      "id": "fabricated-conditions",
      "name": "Fabricated conditions",
      "color": "teal",
      "fact": "Manufactured pressure begins by falsely representing when an opportunity ends, how scarce it is, how many people want it, or who endorses it.",
      "terms": [
        "false deadline",
        "artificial scarcity",
        "invented demand",
        "invented endorsement"
      ],
      "seeds": [
        "false deadline",
        "artificial scarcity"
      ],
      "termInfo": {
        "false deadline": {
          "text": "A claimed expiration time that does not correspond to a genuine end of the offer, often because it resets or remains available afterward.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-urgency/"
            }
          ]
        },
        "artificial scarcity": {
          "text": "A false or misleading representation that a product, service, seat, or opportunity is in unusually limited supply.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-scarcity/"
            }
          ]
        },
        "invented demand": {
          "text": "A fabricated or exaggerated claim that many other people are viewing, buying, or competing for the same offer.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-social-proof/"
            }
          ]
        },
        "invented endorsement": {
          "text": "Approval attributed to a customer, reviewer, or authority whose identity, experience, or praise is fabricated or materially misrepresented.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-social-proof/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-8/"
          }
        ]
      }
    },
    {
      "id": "interface-signals",
      "name": "Interface signals",
      "color": "blue",
      "fact": "Countdowns, limited-time messages, stock warnings, activity notices, and testimonials make an asserted condition visible and emotionally immediate.",
      "terms": [
        "countdown timer",
        "limited-time message",
        "low-stock warning",
        "activity notification",
        "testimonial"
      ],
      "seeds": [
        "countdown timer",
        "low-stock warning"
      ],
      "termInfo": {
        "countdown timer": {
          "text": "A clock displayed as counting toward the end of an offer or opportunity.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-15/"
            }
          ]
        },
        "limited-time message": {
          "text": "A statement that an offer, price, or opportunity will expire soon, without necessarily showing a moving timer.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-15/"
            }
          ]
        },
        "low-stock warning": {
          "text": "A message claiming that only a small number of products, seats, rooms, or opportunities remain.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-scarcity/"
            }
          ]
        },
        "activity notification": {
          "text": "A pop-up or message claiming that another person recently viewed, bought, booked, or otherwise acted on an offer.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-social-proof/"
            }
          ]
        },
        "testimonial": {
          "text": "A statement presented as praise or recommendation from a customer, reviewer, expert, or other endorser.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-17/"
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
      "id": "psychological-leverage",
      "name": "Psychological leverage",
      "color": "amber",
      "fact": "Time limits, apparent rarity, and other people's supposed behavior exploit ordinary ways of making decisions under uncertainty and limited attention.",
      "terms": [
        "time pressure",
        "scarcity bias",
        "social proof",
        "fear of missing out"
      ],
      "seeds": [
        "time pressure",
        "social proof"
      ],
      "termInfo": {
        "time pressure": {
          "text": "The felt need to decide quickly because delay appears likely to remove an opportunity.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-8/"
            }
          ]
        },
        "scarcity bias": {
          "text": "The tendency to value an option more highly or pursue it more urgently when it appears rare or difficult to obtain.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-scarcity/"
            }
          ]
        },
        "social proof": {
          "text": "The tendency to use other people's apparent choices and judgments as evidence about what is safe, valuable, or appropriate.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-17/"
            }
          ]
        },
        "fear of missing out": {
          "text": "Anxiety or anticipated regret arising from the possibility that an opportunity will disappear or be taken by others.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-8/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-6/"
          }
        ]
      }
    },
    {
      "id": "pressured-decisions",
      "name": "Pressured decisions",
      "color": "magenta",
      "fact": "Manufactured pressure harms decision quality by reducing deliberation and comparison, accelerating purchases, misplacing trust, and creating anxiety or stress.",
      "terms": [
        "compressed deliberation",
        "reduced comparison",
        "hasty purchase",
        "misplaced trust",
        "psychological strain"
      ],
      "seeds": [
        "compressed deliberation",
        "misplaced trust"
      ],
      "termInfo": {
        "compressed deliberation": {
          "text": "A shortened or subjectively narrowed opportunity to understand an offer and consider whether it serves one's goals.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-8/"
            }
          ]
        },
        "reduced comparison": {
          "text": "Less willingness or practical opportunity to inspect competing products, prices, evidence, or alternatives before acting.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-8/"
            }
          ]
        },
        "hasty purchase": {
          "text": "A transaction completed before the person has fully evaluated need, price, credibility, or alternatives.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-urgency/"
            }
          ]
        },
        "misplaced trust": {
          "text": "Confidence assigned to an offer because fabricated popularity, activity, or endorsement appears to validate it.",
          "links": [
            {
              "href": "https://deceptive.design/types/fake-social-proof/"
            }
          ]
        },
        "psychological strain": {
          "text": "Anxiety, stress, frustration, or emotional burden imposed by an artificially urgent or competitive decision environment.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/chapter-22/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-22/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "manufactured-evidence",
      "term": "manufactured evidence",
      "clusters": [
        0,
        1
      ],
      "fact": "A fabricated deadline, shortage, demand signal, or endorsement is converted into a visible interface cue that appears to provide evidence about the opportunity.",
      "info": {
        "text": "Interface content presented as evidence for a condition that has been invented, exaggerated, or detached from reality.",
        "links": [
          {
            "href": "https://deceptive.design/types/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "false deadline",
        "countdown timer"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "pressure-cue",
      "term": "pressure cue",
      "clusters": [
        1,
        2
      ],
      "fact": "Visible timers, scarcity warnings, activity messages, and testimonials translate asserted conditions into time pressure, fear of missing out, and reliance on social proof.",
      "info": {
        "text": "A signal designed to make an asserted deadline, shortage, or social judgment feel immediately relevant to the user's choice.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-8/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "low-stock warning",
        "scarcity bias"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "decision-compression",
      "term": "decision compression",
      "clusters": [
        2,
        3
      ],
      "fact": "Time pressure, scarcity bias, social proof, and fear of missing out can narrow attention and shorten deliberation, making hurried or insufficiently verified choices more likely.",
      "info": {
        "text": "The narrowing of time, attention, and perceived options available for reflective decision-making.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-8/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "time pressure",
        "compressed deliberation"
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
      "id": "fake-urgency",
      "prompt": "Which concepts form the dominant signature of the Fake Urgency dark pattern?",
      "explanation": "Fake Urgency presents a time limit that is false, exaggerated, or repeatedly reset. The apparent deadline creates time pressure, leaving less room to evaluate the offer and increasing stress around the decision.",
      "targets": [
        "false deadline",
        "countdown timer",
        "limited-time message",
        "time pressure",
        "compressed deliberation",
        "psychological strain"
      ],
      "reasons": {
        "false deadline": "The claimed closing time does not reflect a genuine limit on the offer.",
        "countdown timer": "A prominent moving clock makes the supposed deadline immediate and difficult to ignore.",
        "limited-time message": "Static language can also claim that an opportunity will disappear soon.",
        "time pressure": "The user is made to feel that delaying for further thought risks losing the opportunity.",
        "compressed deliberation": "The perceived deadline reduces the time available to inspect terms and weigh alternatives.",
        "psychological strain": "A closing window can produce anxiety or stress even when the user ultimately resists it."
      }
    },
    {
      "id": "fake-scarcity",
      "prompt": "Which concepts form the dominant signature of the Fake Scarcity dark pattern?",
      "explanation": "Fake Scarcity falsely presents a product or opportunity as difficult to obtain. Low-stock claims activate scarcity bias and fear of missing out, encouraging the person to stop comparing options and purchase before the supposed supply disappears.",
      "targets": [
        "artificial scarcity",
        "low-stock warning",
        "scarcity bias",
        "fear of missing out",
        "reduced comparison",
        "hasty purchase"
      ],
      "reasons": {
        "artificial scarcity": "The claimed shortage is created or misrepresented rather than reflecting actual supply.",
        "low-stock warning": "The interface announces that only a small number of items or places remain.",
        "scarcity bias": "Things presented as rare can seem more valuable or urgent than they otherwise would.",
        "fear of missing out": "The person anticipates regret if someone else obtains the supposedly scarce opportunity first.",
        "reduced comparison": "Attention shifts from evaluating alternatives to securing the threatened item immediately.",
        "hasty purchase": "The decision is completed before the person has fully considered need, price, or competing offers."
      }
    },
    {
      "id": "fake-social-proof",
      "prompt": "Which concepts form the dominant signature of the Fake Social Proof dark pattern?",
      "explanation": "Fake Social Proof fabricates or exaggerates the apparent behavior and approval of other people. Activity messages and testimonials borrow credibility from a crowd or endorser that may not exist, causing trust to rest on manufactured evidence.",
      "targets": [
        "invented demand",
        "invented endorsement",
        "activity notification",
        "testimonial",
        "social proof",
        "misplaced trust"
      ],
      "reasons": {
        "invented demand": "The business claims that many other people are viewing, buying, or competing for the offer without a truthful basis.",
        "invented endorsement": "Approval is attributed to customers or reviewers whose support is fabricated or materially misrepresented.",
        "activity notification": "A pop-up or counter presents supposed real-time behavior by other users.",
        "testimonial": "A statement of praise is presented as evidence from a satisfied customer or authority.",
        "social proof": "People reasonably use others' behavior as a shortcut when judging uncertain choices.",
        "misplaced trust": "Confidence is transferred to the offer on the basis of social evidence that was not genuine."
      }
    },
    {
      "id": "decision-compression",
      "prompt": "Which concepts show how manufactured pressure narrows a person's decision process?",
      "explanation": "Across urgency, scarcity, and social-proof patterns, the interface creates a reason to act before the person feels able to pause. The resulting pressure can reduce comparison, accelerate commitment, and impose psychological strain even when no purchase occurs.",
      "targets": [
        "pressure cue",
        "fear of missing out",
        "compressed deliberation",
        "reduced comparison",
        "hasty purchase",
        "psychological strain"
      ],
      "reasons": {
        "pressure cue": "The visible signal converts a fabricated condition into an immediate felt reason to act.",
        "fear of missing out": "Anticipated loss makes delay feel dangerous rather than prudent.",
        "compressed deliberation": "The decision window is experienced as too narrow for careful evaluation.",
        "reduced comparison": "The person is discouraged from checking alternatives or verifying the claim.",
        "hasty purchase": "Action occurs before ordinary reflection and comparison have been completed.",
        "psychological strain": "Pressure consumes emotional and cognitive resources whether or not it succeeds."
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
      "puzzleId": "manufactured-pressure",
      "puzzleRevision": "fnv1a32:2575a5d0",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:false deadline": {
          "x": 715.7,
          "y": 210.77,
          "pinned": false
        },
        "term:artificial scarcity": {
          "x": 574.24,
          "y": 155.31,
          "pinned": false
        },
        "term:invented demand": {
          "x": 704.96,
          "y": 71.84,
          "pinned": false
        },
        "term:invented endorsement": {
          "x": 850.47,
          "y": 134.04,
          "pinned": false
        },
        "term:countdown timer": {
          "x": 681.72,
          "y": 469.36,
          "pinned": false
        },
        "term:limited-time message": {
          "x": 830.7,
          "y": 522.73,
          "pinned": false
        },
        "term:low-stock warning": {
          "x": 572,
          "y": 569.87,
          "pinned": false
        },
        "term:activity notification": {
          "x": 790.56,
          "y": 350.2,
          "pinned": false
        },
        "term:testimonial": {
          "x": 705.46,
          "y": 597,
          "pinned": false
        },
        "term:time pressure": {
          "x": 293.59,
          "y": 440.59,
          "pinned": false
        },
        "term:scarcity bias": {
          "x": 405.64,
          "y": 374.9,
          "pinned": false
        },
        "term:social proof": {
          "x": 248.62,
          "y": 559.1,
          "pinned": false
        },
        "term:fear of missing out": {
          "x": 394.01,
          "y": 550.39,
          "pinned": false
        },
        "term:compressed deliberation": {
          "x": 228.37,
          "y": 292.96,
          "pinned": false
        },
        "term:reduced comparison": {
          "x": 380.03,
          "y": 201.42,
          "pinned": false
        },
        "term:hasty purchase": {
          "x": 66.1,
          "y": 319.93,
          "pinned": false
        },
        "term:misplaced trust": {
          "x": 100.18,
          "y": 184.83,
          "pinned": false
        },
        "term:psychological strain": {
          "x": 239.54,
          "y": 109.86,
          "pinned": false
        },
        "term:manufactured evidence": {
          "x": 607.36,
          "y": 326.12,
          "pinned": false
        },
        "term:pressure cue": {
          "x": 511.75,
          "y": 444.23,
          "pinned": false
        },
        "term:decision compression": {
          "x": 142.33,
          "y": 454.98,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3659.18,
        "score": 3659.180593898714
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:08.228Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "manufactured-pressure",
      "puzzleRevision": "fnv1a32:2575a5d0",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 790.65,
          "y": 227.51,
          "pinned": false
        },
        "cluster:1": {
          "x": 790.65,
          "y": 568.49,
          "pinned": false
        },
        "cluster:2": {
          "x": 259.35,
          "y": 568.49,
          "pinned": false
        },
        "cluster:3": {
          "x": 259.35,
          "y": 227.51,
          "pinned": false
        }
      },
      "bridges": {
        "term:manufactured evidence": {
          "x": 764.78,
          "y": 387.28,
          "pinned": false
        },
        "term:pressure cue": {
          "x": 525,
          "y": 568.49,
          "pinned": false
        },
        "term:decision compression": {
          "x": 285.22,
          "y": 408.72,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "false deadline",
          "artificial scarcity",
          "invented demand",
          "invented endorsement"
        ],
        "cluster:1": [
          "countdown timer",
          "limited-time message",
          "low-stock warning",
          "activity notification",
          "testimonial"
        ],
        "cluster:2": [
          "time pressure",
          "scarcity bias",
          "social proof",
          "fear of missing out"
        ],
        "cluster:3": [
          "compressed deliberation",
          "reduced comparison",
          "hasty purchase",
          "misplaced trust",
          "psychological strain"
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
        "totalLength": 375.88230738795926
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:10.140Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "manufactured-pressure",
      "puzzleRevision": "fnv1a32:2575a5d0",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:false deadline": {
          "x": 812.73,
          "y": 130.25
        },
        "term:artificial scarcity": {
          "x": 484.28,
          "y": 183.18
        },
        "term:invented demand": {
          "x": 753.27,
          "y": 22
        },
        "term:invented endorsement": {
          "x": 410.18,
          "y": 22
        },
        "term:countdown timer": {
          "x": 557.1,
          "y": 333.58
        },
        "term:limited-time message": {
          "x": 877,
          "y": 449.16
        },
        "term:low-stock warning": {
          "x": 739.94,
          "y": 533.82
        },
        "term:activity notification": {
          "x": 873.85,
          "y": 267.31
        },
        "term:testimonial": {
          "x": 861.87,
          "y": 598
        },
        "term:time pressure": {
          "x": 481.86,
          "y": 449.08
        },
        "term:scarcity bias": {
          "x": 506.53,
          "y": 551.11
        },
        "term:social proof": {
          "x": 329.86,
          "y": 467.69
        },
        "term:fear of missing out": {
          "x": 604.73,
          "y": 598
        },
        "term:compressed deliberation": {
          "x": 248.66,
          "y": 102.18
        },
        "term:reduced comparison": {
          "x": 76.7,
          "y": 363.04
        },
        "term:hasty purchase": {
          "x": 72.97,
          "y": 518.05
        },
        "term:misplaced trust": {
          "x": 203.88,
          "y": 451.05
        },
        "term:psychological strain": {
          "x": 83,
          "y": 189.08
        },
        "term:manufactured evidence": {
          "x": 665.77,
          "y": 205.68
        },
        "term:pressure cue": {
          "x": 614.13,
          "y": 458.57
        },
        "term:decision compression": {
          "x": 396.11,
          "y": 334.89
        },
        "cluster:0": {
          "x": 589.44,
          "y": 35.42
        },
        "cluster:1": {
          "x": 729.39,
          "y": 366.78
        },
        "cluster:2": {
          "x": 397.49,
          "y": 598
        },
        "cluster:3": {
          "x": 224.02,
          "y": 288.16
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:37:12.060Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:37:06.293Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
