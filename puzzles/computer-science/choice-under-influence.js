// Generated from content/puzzles/choice-under-influence.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "choice-under-influence",
  "title": "Choice Under Influence",
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
    "text": "How interface presentation, defaults, wording, and emotional framing can steer people away from choices that reflect their own goals. The source uses deceptive patterns for practices also widely known as dark patterns.",
    "links": [
      {
        "href": "https://deceptive.design/book/contents/part-1/"
      },
      {
        "href": "https://deceptive.design/types/"
      }
    ]
  },
  "clusters": [
    {
      "id": "perceptual-presentation",
      "name": "Perceptual presentation",
      "color": "teal",
      "fact": "Visual hierarchy, contrast, familiar interface cues, and ordinary scan-reading habits shape which options are noticed and what a control appears to mean.",
      "terms": [
        "visual prominence",
        "low contrast",
        "familiar interface cues",
        "scan reading"
      ],
      "seeds": [
        "visual prominence",
        "low contrast"
      ],
      "termInfo": {
        "visual prominence": {
          "text": "The use of size, color, position, spacing, or emphasis to make one element command attention before others.",
          "links": [
            {
              "href": "https://deceptive.design/types/visual-interference/"
            }
          ]
        },
        "low contrast": {
          "text": "A small visual difference between text or controls and their background, making important information harder to notice or read.",
          "links": [
            {
              "href": "https://deceptive.design/types/visual-interference/"
            }
          ]
        },
        "familiar interface cues": {
          "text": "Visual forms that users already interpret as controls or native content, such as download buttons, navigation links, or related articles.",
          "links": [
            {
              "href": "https://deceptive.design/types/disguised-ads/"
            }
          ]
        },
        "scan reading": {
          "text": "The ordinary online reading strategy of sampling headings, labels, and prominent words rather than closely reading every sentence.",
          "links": [
            {
              "href": "https://deceptive.design/types/trick-wording/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/types/visual-interference/"
          }
        ]
      }
    },
    {
      "id": "choice-framing",
      "name": "Choice framing",
      "color": "blue",
      "fact": "A business can steer a formally available choice by selecting the default, obscuring an alternative, using ambiguous language, or attaching an emotional judgment to refusal.",
      "terms": [
        "preselected default",
        "obscured alternative",
        "ambiguous wording",
        "loaded refusal"
      ],
      "seeds": [
        "preselected default",
        "ambiguous wording"
      ],
      "termInfo": {
        "preselected default": {
          "text": "An option chosen in advance by the business so that accepting it requires no additional action from the user.",
          "links": [
            {
              "href": "https://deceptive.design/types/preselection/"
            }
          ]
        },
        "obscured alternative": {
          "text": "A meaningful option that remains technically present but is hidden, deemphasized, disguised, or placed where it is difficult to find.",
          "links": [
            {
              "href": "https://deceptive.design/types/visual-interference/"
            }
          ]
        },
        "ambiguous wording": {
          "text": "Language whose apparent or expected meaning differs from the action it actually authorizes.",
          "links": [
            {
              "href": "https://deceptive.design/types/trick-wording/"
            }
          ]
        },
        "loaded refusal": {
          "text": "A decline option written to express guilt, foolishness, selfishness, or another negative judgment about the person choosing it.",
          "links": [
            {
              "href": "https://deceptive.design/types/confirmshaming/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-16/"
          }
        ]
      }
    },
    {
      "id": "human-heuristics",
      "name": "Human heuristics",
      "color": "amber",
      "fact": "People reasonably rely on defaults, selective attention, familiar conventions, and self-image to navigate complex interfaces; manipulation converts those coping strategies into leverage.",
      "terms": [
        "default effect",
        "limited attention",
        "expectation matching",
        "self-image pressure"
      ],
      "seeds": [
        "default effect",
        "limited attention"
      ],
      "termInfo": {
        "default effect": {
          "text": "The tendency to retain an option that has already been selected rather than expend effort replacing it.",
          "links": [
            {
              "href": "https://deceptive.design/types/preselection/"
            }
          ]
        },
        "limited attention": {
          "text": "The practical inability to inspect every word, control, consequence, and competing signal in a complex interface.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/part-1/"
            }
          ]
        },
        "expectation matching": {
          "text": "The habit of interpreting a familiar-looking label or control according to its usual meaning and role.",
          "links": [
            {
              "href": "https://deceptive.design/types/trick-wording/"
            }
          ]
        },
        "self-image pressure": {
          "text": "Influence that works by threatening how a person wishes to understand or present their own character and values.",
          "links": [
            {
              "href": "https://deceptive.design/types/confirmshaming/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-13/"
          }
        ]
      }
    },
    {
      "id": "choice-consequences",
      "name": "Choice consequences",
      "color": "magenta",
      "fact": "When interface steering produces an action that conflicts with the person's purposes, a visible click may conceal mistaken action, unwanted consent, unintended spending, or impaired autonomy.",
      "terms": [
        "mistaken click",
        "unwanted consent",
        "unintended purchase",
        "impaired autonomy"
      ],
      "seeds": [
        "unwanted consent",
        "impaired autonomy"
      ],
      "termInfo": {
        "mistaken click": {
          "text": "Activating an element under a false understanding of what it is or what it will do.",
          "links": [
            {
              "href": "https://deceptive.design/types/disguised-ads/"
            }
          ]
        },
        "unwanted consent": {
          "text": "An apparent agreement to communication, data use, or another condition that the person meant to decline or did not understand.",
          "links": [
            {
              "href": "https://deceptive.design/book/contents/part-1/"
            }
          ]
        },
        "unintended purchase": {
          "text": "A commercial transaction or added charge that does not reflect what the person set out to buy.",
          "links": [
            {
              "href": "https://deceptive.design/types/preselection/"
            }
          ]
        },
        "impaired autonomy": {
          "text": "Reduced ability to understand available choices and act according to one's own goals rather than an external steering objective.",
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
            "href": "https://deceptive.design/book/contents/part-1/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "perceptual-steering",
      "term": "perceptual steering",
      "clusters": [
        0,
        1
      ],
      "fact": "Hierarchy, contrast, placement, and familiar visual cues can make the business's preferred option feel obvious while another option becomes easy to miss or misinterpret.",
      "info": {
        "text": "The deliberate direction of attention and interpretation through visual presentation.",
        "links": [
          {
            "href": "https://deceptive.design/types/visual-interference/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "visual prominence",
        "obscured alternative"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "exploited-heuristics",
      "term": "exploited heuristics",
      "clusters": [
        2,
        1
      ],
      "fact": "Defaults, selective attention, expectations, and self-image are ordinary ways of coping with complexity; choice framing becomes manipulative when it deliberately turns them against the person's own goals.",
      "info": {
        "text": "Normal mental shortcuts and coping strategies treated as opportunities for behavioral control.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-13/"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "manufactured-consent",
      "term": "manufactured consent",
      "clusters": [
        1,
        3
      ],
      "fact": "A technically available choice is not meaningfully autonomous when presentation or wording materially steers a person into agreement they did not understand or intend.",
      "info": {
        "text": "Apparent agreement produced by steering the conditions of choice rather than supporting informed, voluntary decision-making.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/part-1/"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "preselection",
      "prompt": "Which concepts form the dominant signature of the Preselection dark pattern?",
      "explanation": "Preselection chooses an option before the user acts and relies on the default effect, together with the chance that the choice will not be noticed or reconsidered. The result may be a formally reversible selection that was never meaningfully chosen.",
      "targets": [
        "preselected default",
        "default effect",
        "limited attention",
        "impaired autonomy"
      ],
      "reasons": {
        "preselected default": "The business has already selected the option it wants the user to retain.",
        "default effect": "People tend to accept an existing selection rather than actively replace it.",
        "limited attention": "A preselected option only works unnoticed when people do not inspect every control and consequence.",
        "impaired autonomy": "The resulting action may reflect the business's initial choice more than the user's own intention."
      }
    },
    {
      "id": "trick-wording",
      "prompt": "Which concepts form the dominant signature of the Trick Wording dark pattern?",
      "explanation": "Trick Wording makes language appear to mean what a hurried reader expects while its actual effect points elsewhere. Ambiguity, scan-reading, and familiar verbal expectations can therefore produce agreement the person did not understand or intend.",
      "targets": [
        "ambiguous wording",
        "scan reading",
        "expectation matching",
        "unwanted consent",
        "impaired autonomy"
      ],
      "reasons": {
        "ambiguous wording": "The action is described through language that is confusing, reversible, or easy to misread.",
        "scan reading": "The pattern takes advantage of the ordinary habit of reading online text selectively rather than word by word.",
        "expectation matching": "The wording is shaped to resemble the instruction or option the user expects to encounter.",
        "unwanted consent": "The misleading language can cause the person to accept communication, data use, or another condition they meant to refuse.",
        "impaired autonomy": "The visible selection does not reliably express an informed understanding of the choice."
      }
    },
    {
      "id": "visual-interference",
      "prompt": "Which concepts form the dominant signature of the Visual Interference dark pattern?",
      "explanation": "Visual Interference uses prominence, contrast, placement, or clutter to make the business's preferred action easy to perceive and an alternative difficult to find or interpret. The choice may remain technically present while becoming practically unequal.",
      "targets": [
        "visual prominence",
        "low contrast",
        "obscured alternative",
        "limited attention",
        "perceptual steering",
        "impaired autonomy"
      ],
      "reasons": {
        "visual prominence": "Size, color, position, or emphasis can make one action dominate the page.",
        "low contrast": "Important information or a refusal option can be made difficult to notice or read.",
        "obscured alternative": "A meaningful option is hidden, disguised, or placed where users are unlikely to expect it.",
        "limited attention": "The pattern depends on people allocating attention selectively in a visually complex environment.",
        "perceptual steering": "Visual design actively directs notice and interpretation toward the business's preferred choice.",
        "impaired autonomy": "A nominally available alternative may no longer support a genuinely informed decision."
      }
    },
    {
      "id": "confirmshaming",
      "prompt": "Which concepts form the dominant signature of the Confirmshaming dark pattern?",
      "explanation": "Confirmshaming turns an ordinary refusal into a negative statement about the user's values, intelligence, generosity, or self-image. The person is pushed toward compliance not by new reasons, but by the emotional cost attached to saying no.",
      "targets": [
        "loaded refusal",
        "self-image pressure",
        "manufactured consent",
        "impaired autonomy"
      ],
      "reasons": {
        "loaded refusal": "The decline option is worded as a belittling, guilt-inducing, or socially undesirable statement.",
        "self-image pressure": "The interface threatens how the person wishes to see themselves or be seen by others.",
        "manufactured consent": "Agreement is made easier by artificially increasing the emotional cost of refusal.",
        "impaired autonomy": "The decision is steered by shame or guilt rather than the person's considered purposes."
      }
    },
    {
      "id": "disguised-ads",
      "prompt": "Which concepts form the dominant signature of the Disguised Ads dark pattern?",
      "explanation": "Disguised Ads borrow the appearance of native content or interface controls so that users act on the wrong interpretation. Familiar cues and visual steering convert an expected navigation or download action into an advertising click with possible commercial consequences.",
      "targets": [
        "familiar interface cues",
        "expectation matching",
        "perceptual steering",
        "mistaken click"
      ],
      "reasons": {
        "familiar interface cues": "The advertisement imitates a download button, navigation control, related item, or other trusted interface element.",
        "expectation matching": "Its appearance is designed to fit what the person expects the genuine control or content to look like.",
        "perceptual steering": "Presentation directs attention toward the disguised commercial element.",
        "mistaken click": "The user activates the advertisement while believing they selected something else."
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
      "puzzleId": "choice-under-influence",
      "puzzleRevision": "fnv1a32:9d053f6f",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:visual prominence": {
          "x": 509.97,
          "y": 151.32,
          "pinned": false
        },
        "term:low contrast": {
          "x": 456.9,
          "y": 23,
          "pinned": false
        },
        "term:familiar interface cues": {
          "x": 337.73,
          "y": 126.62,
          "pinned": false
        },
        "term:scan reading": {
          "x": 580.36,
          "y": 31.06,
          "pinned": false
        },
        "term:preselected default": {
          "x": 535.97,
          "y": 455.08,
          "pinned": false
        },
        "term:obscured alternative": {
          "x": 592.21,
          "y": 293.81,
          "pinned": false
        },
        "term:ambiguous wording": {
          "x": 630.44,
          "y": 585.93,
          "pinned": false
        },
        "term:loaded refusal": {
          "x": 482.83,
          "y": 597,
          "pinned": false
        },
        "term:default effect": {
          "x": 747.25,
          "y": 290.24,
          "pinned": false
        },
        "term:limited attention": {
          "x": 846.95,
          "y": 184.06,
          "pinned": false
        },
        "term:expectation matching": {
          "x": 686.5,
          "y": 147.54,
          "pinned": false
        },
        "term:self-image pressure": {
          "x": 878.15,
          "y": 367.28,
          "pinned": false
        },
        "term:mistaken click": {
          "x": 132.47,
          "y": 369.32,
          "pinned": false
        },
        "term:unwanted consent": {
          "x": 274.74,
          "y": 361.01,
          "pinned": false
        },
        "term:unintended purchase": {
          "x": 188.75,
          "y": 228.18,
          "pinned": false
        },
        "term:impaired autonomy": {
          "x": 204.64,
          "y": 495.83,
          "pinned": false
        },
        "term:perceptual steering": {
          "x": 421.46,
          "y": 286.31,
          "pinned": false
        },
        "term:exploited heuristics": {
          "x": 706.13,
          "y": 439.78,
          "pinned": false
        },
        "term:manufactured consent": {
          "x": 369.14,
          "y": 491.92,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3429.64,
        "score": 3429.6431184890935
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:36:35.839Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "choice-under-influence",
      "puzzleRevision": "fnv1a32:9d053f6f",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 241.13,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 222.76,
          "pinned": false
        },
        "cluster:2": {
          "x": 808.87,
          "y": 398,
          "pinned": false
        },
        "cluster:3": {
          "x": 525,
          "y": 573.24,
          "pinned": false
        }
      },
      "bridges": {
        "term:perceptual steering": {
          "x": 309.53,
          "y": 236.84,
          "pinned": false
        },
        "term:exploited heuristics": {
          "x": 593.4,
          "y": 383.92,
          "pinned": false
        },
        "term:manufactured consent": {
          "x": 525,
          "y": 426,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "visual prominence",
          "low contrast",
          "familiar interface cues",
          "scan reading"
        ],
        "cluster:1": [
          "preselected default",
          "obscured alternative",
          "ambiguous wording",
          "loaded refusal"
        ],
        "cluster:2": [
          "default effect",
          "limited attention",
          "expectation matching",
          "self-image pressure"
        ],
        "cluster:3": [
          "mistaken click",
          "unwanted consent",
          "unintended purchase",
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
        "totalLength": 379.5691621869449
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:36:37.760Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "choice-under-influence",
      "puzzleRevision": "fnv1a32:9d053f6f",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:visual prominence": {
          "x": 819.49,
          "y": 111.99
        },
        "term:low contrast": {
          "x": 534.05,
          "y": 22
        },
        "term:familiar interface cues": {
          "x": 553.71,
          "y": 147.34
        },
        "term:scan reading": {
          "x": 883.94,
          "y": 22
        },
        "term:preselected default": {
          "x": 752.68,
          "y": 556.07
        },
        "term:obscured alternative": {
          "x": 877,
          "y": 294.4
        },
        "term:ambiguous wording": {
          "x": 886.45,
          "y": 467.87
        },
        "term:loaded refusal": {
          "x": 713.48,
          "y": 303.73
        },
        "term:default effect": {
          "x": 257.49,
          "y": 598
        },
        "term:limited attention": {
          "x": 410.35,
          "y": 598
        },
        "term:expectation matching": {
          "x": 587.06,
          "y": 598
        },
        "term:self-image pressure": {
          "x": 330.26,
          "y": 459.65
        },
        "term:mistaken click": {
          "x": 336.93,
          "y": 161.92
        },
        "term:unwanted consent": {
          "x": 92.99,
          "y": 297.28
        },
        "term:unintended purchase": {
          "x": 173.87,
          "y": 150.36
        },
        "term:impaired autonomy": {
          "x": 163.34,
          "y": 441.74
        },
        "term:perceptual steering": {
          "x": 721.17,
          "y": 211.31
        },
        "term:exploited heuristics": {
          "x": 566.1,
          "y": 372.56
        },
        "term:manufactured consent": {
          "x": 478.73,
          "y": 279.73
        },
        "cluster:0": {
          "x": 695.78,
          "y": 26.1
        },
        "cluster:1": {
          "x": 757.05,
          "y": 370.7
        },
        "cluster:2": {
          "x": 485.01,
          "y": 486.17
        },
        "cluster:3": {
          "x": 260.53,
          "y": 303.02
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:36:39.730Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:36:33.934Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
