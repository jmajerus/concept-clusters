// Generated from content/puzzles/the-hidden-transaction.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-hidden-transaction",
  "title": "The Hidden Transaction",
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
    "text": "How a transaction can appear to offer one product, price, or payment arrangement while relevant costs, add-ons, or recurring obligations remain hidden until after the user has committed. The resulting harms can include lost money, time, attention, peace of mind, and control over one's own commitments.",
    "links": [
      {
        "href": "https://deceptive.design/book/contents/chapter-14/"
      },
      {
        "href": "https://deceptive.design/types/sneaking/"
      }
    ]
  },
  "clusters": [
    {
      "id": "visible-offer",
      "name": "Visible offer",
      "color": "teal",
      "fact": "People form a working model of a transaction from the visible price, the item they selected, and the payment arrangement presented at the point of choice.",
      "terms": [
        "advertised price",
        "chosen product",
        "one-off expectation",
        "free trial"
      ],
      "seeds": [
        "advertised price",
        "chosen product"
      ],
      "termInfo": {
        "advertised price": {
          "text": "The price made salient when the user first evaluates whether to begin a purchase.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-costs/"
            }
          ]
        },
        "chosen product": {
          "text": "The item or service the user deliberately selected before any undisclosed addition altered the transaction.",
          "links": [
            {
              "href": "https://deceptive.design/types/sneaking/"
            }
          ]
        },
        "one-off expectation": {
          "text": "The user's understanding that an action creates a single payment or commitment rather than an ongoing subscription.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        },
        "free trial": {
          "text": "Temporary access offered without an immediate service fee, sometimes while collecting payment details for later billing.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-14/"
          }
        ]
      }
    },
    {
      "id": "concealed-terms",
      "name": "Concealed terms",
      "color": "blue",
      "fact": "Sneaking changes the meaning of a transaction by hiding, delaying, or silently applying information that would matter to an informed choice.",
      "terms": [
        "delayed disclosure",
        "undisclosed add-on",
        "obscured recurring terms",
        "silent enrollment"
      ],
      "seeds": [
        "delayed disclosure",
        "undisclosed add-on"
      ],
      "termInfo": {
        "delayed disclosure": {
          "text": "Withholding a material cost or condition until the user is well into the transaction.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-costs/"
            }
          ]
        },
        "undisclosed add-on": {
          "text": "An additional product, service, donation, or protection plan inserted without the user's explicit request.",
          "links": [
            {
              "href": "https://deceptive.design/types/sneaking/"
            }
          ]
        },
        "obscured recurring terms": {
          "text": "Subscription language hidden, deemphasized, or separated from the action that creates the recurring obligation.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        },
        "silent enrollment": {
          "text": "Creating a subscription or payment plan without a clear interface moment in which the user knowingly chooses to enroll.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/types/sneaking/"
          }
        ]
      }
    },
    {
      "id": "leverage-after-entry",
      "name": "Leverage after entry",
      "color": "amber",
      "fact": "Concealment becomes more effective after the user has invested effort, progressed through checkout, supplied payment authority, or stopped receiving information that would reveal later charges.",
      "terms": [
        "checkout progress",
        "time invested",
        "stored payment method",
        "missing notification"
      ],
      "seeds": [
        "checkout progress",
        "time invested"
      ],
      "termInfo": {
        "checkout progress": {
          "text": "The sequence of forms, selections, account steps, and confirmations already completed before a hidden term appears.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-costs/"
            }
          ]
        },
        "time invested": {
          "text": "The effort already spent locating, configuring, and preparing a purchase, which makes abandoning it and starting over less attractive.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-costs/"
            }
          ]
        },
        "stored payment method": {
          "text": "Payment credentials retained by the business so later charges can occur without a new entry of card or account details.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        },
        "missing notification": {
          "text": "The absence of a clear reminder, receipt, or warning that would draw attention to a continuing subscription or newly incurred charge.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-14/"
          }
        ]
      }
    },
    {
      "id": "consequences-for-the-person",
      "name": "Consequences for the person",
      "color": "magenta",
      "fact": "The harm is not exhausted by the charge: a hidden transaction can impose an unwanted item or recurring obligation, consume time and attention, create psychological strain, and reduce the person's control over their own commitments.",
      "terms": [
        "unexpected fee",
        "unwanted item",
        "recurring charge",
        "time and attention loss",
        "psychological strain",
        "impaired autonomy"
      ],
      "seeds": [
        "unexpected fee",
        "impaired autonomy"
      ],
      "termInfo": {
        "unexpected fee": {
          "text": "A charge added after the user evaluated an earlier, incomplete price.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-costs/"
            }
          ]
        },
        "unwanted item": {
          "text": "A product or service included in an order even though the user did not affirmatively choose it.",
          "links": [
            {
              "href": "https://deceptive.design/types/sneaking/"
            }
          ]
        },
        "recurring charge": {
          "text": "A payment collected repeatedly under an ongoing obligation rather than as a single transaction.",
          "links": [
            {
              "href": "https://deceptive.design/types/hidden-subscription/"
            }
          ]
        },
        "time and attention loss": {
          "text": "Personal effort spent detecting, understanding, disputing, reversing, or preventing consequences that should not have been imposed.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
            }
          ]
        },
        "psychological strain": {
          "text": "Anxiety, frustration, embarrassment, vigilance, or self-doubt produced by an unexpected charge or obligation and the effort required to correct it.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
            }
          ]
        },
        "impaired autonomy": {
          "text": "Reduced ability to understand and control what one is buying, authorizing, or remaining committed to.",
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
            "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "sneaking",
      "term": "sneaking",
      "clusters": [
        0,
        1
      ],
      "fact": "The visible offer draws the user into a transaction whose pertinent costs, additions, or recurring obligations are hidden, delayed, or silently applied.",
      "info": {
        "text": "Withholding or obscuring information relevant to a transaction so the user acts on false or incomplete premises.",
        "links": [
          {
            "href": "https://deceptive.design/types/sneaking/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "advertised price",
        "delayed disclosure"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "commitment-leverage",
      "term": "commitment leverage",
      "clusters": [
        1,
        2
      ],
      "fact": "A concealed term gains practical force when disclosure is delayed until the user has completed several steps, invested time, or supplied a payment method that can be charged later.",
      "info": {
        "text": "Using a person's prior effort or established payment authority to increase the chance that an undisclosed condition will be accepted or remain unnoticed.",
        "links": [
          {
            "href": "https://deceptive.design/types/hidden-costs/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "delayed disclosure",
        "time invested"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "unintended-transaction",
      "term": "unintended transaction",
      "clusters": [
        2,
        3
      ],
      "fact": "Checkout investment, stored payment authority, and absent notifications allow hidden terms to become actual fees, unwanted purchases, or continuing obligations, followed by the work and stress of discovering and correcting them.",
      "info": {
        "text": "A charge, purchase, or continuing obligation that does not reflect the transaction the person understood themselves to be authorizing.",
        "links": [
          {
            "href": "https://deceptive.design/book/contents/chapter-22/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "stored payment method",
        "recurring charge"
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
      "id": "sneaking",
      "prompt": "Which concepts form the shared signature of the Sneaking dark-pattern family?",
      "explanation": "Sneaking withholds or delays information that would materially affect a transaction. Once the user has invested effort or supplied payment authority, the concealed term can become an unintended purchase or obligation. The harm is not exhausted by the amount charged: the pattern also displaces the person's control over what they are agreeing to.",
      "targets": [
        "sneaking",
        "time invested",
        "unintended transaction",
        "impaired autonomy"
      ],
      "reasons": {
        "sneaking": "The visible offer leads into a transaction whose pertinent terms are hidden, delayed, or silently applied.",
        "time invested": "Late disclosure gains leverage after the person has already spent effort completing the transaction.",
        "unintended transaction": "The hidden term becomes an outcome that does not match the transaction the person understood themselves to be authorizing.",
        "impaired autonomy": "The resulting commitment reflects concealed business choices more than the user's informed intention."
      }
    },
    {
      "id": "hidden-costs",
      "prompt": "Which concepts form the dominant signature of the Hidden Costs dark pattern?",
      "explanation": "Hidden Costs advertise an incomplete price and reveal additional fees only after the user has progressed through checkout. The delayed disclosure can produce both a higher charge and a separate loss of time and attention, whether the person accepts the fee or abandons the transaction and starts over.",
      "targets": [
        "advertised price",
        "delayed disclosure",
        "checkout progress",
        "time invested",
        "unexpected fee",
        "time and attention loss"
      ],
      "reasons": {
        "advertised price": "The initial price attracts the user while omitting charges that materially change the total.",
        "delayed disclosure": "Additional costs are withheld until a late stage of the purchasing journey.",
        "checkout progress": "The user reaches the fee only after completing several transaction steps.",
        "time invested": "Starting again elsewhere would require discarding work already spent on the purchase.",
        "unexpected fee": "The final amount includes a charge that was not made salient when the offer was evaluated.",
        "time and attention loss": "Even rejecting the higher price can leave the person having spent effort on a transaction presented under incomplete terms."
      }
    },
    {
      "id": "sneak-into-basket",
      "prompt": "Which concepts form the dominant signature of the Sneak into Basket dark pattern?",
      "explanation": "Sneak into Basket preserves the appearance that the user is buying a chosen product while an additional item or service is inserted without an explicit request. Unless the user notices and removes it, the basket no longer represents their decision, even when the added item's price is small.",
      "targets": [
        "chosen product",
        "undisclosed add-on",
        "checkout progress",
        "unwanted item",
        "impaired autonomy"
      ],
      "reasons": {
        "chosen product": "The user begins with a specific item they actually meant to buy.",
        "undisclosed add-on": "Another product or service is inserted without an affirmative request.",
        "checkout progress": "The added item may become visible only when the user reviews or completes the basket.",
        "unwanted item": "The completed order contains something the user did not select.",
        "impaired autonomy": "The transaction has been altered by the business rather than constructed from the user's own choices."
      }
    },
    {
      "id": "hidden-subscription",
      "prompt": "Which concepts form the dominant signature of the Hidden Subscription dark pattern?",
      "explanation": "Hidden Subscription makes a one-time action appear complete while quietly creating an ongoing payment obligation. Stored payment authority allows recurring charges to continue without a fresh decision, while the concealed commitment reduces the person's continuing control over the relationship.",
      "targets": [
        "one-off expectation",
        "obscured recurring terms",
        "silent enrollment",
        "stored payment method",
        "recurring charge",
        "impaired autonomy"
      ],
      "reasons": {
        "one-off expectation": "The user believes the transaction or action creates only a single charge or commitment.",
        "obscured recurring terms": "The ongoing billing condition is hidden, poorly disclosed, or detached from the action that triggers it.",
        "silent enrollment": "The interface creates the subscription without a clear, explicit enrollment decision.",
        "stored payment method": "The business can collect later payments without asking the user to authorize each one.",
        "recurring charge": "The hidden term results in repeated payments rather than the one-off transaction the user expected.",
        "impaired autonomy": "An ongoing relationship is imposed without the informed and continuing choice that should authorize it."
      }
    },
    {
      "id": "beyond-financial-loss",
      "prompt": "Which concepts show harms that remain even when the monetary loss is small?",
      "explanation": "Hidden transactions can consume attention, require corrective work, create anxiety or frustration, and undermine confidence in one's own control over commitments. A narrow focus on the amount charged therefore misses harms to time, mental well-being, and agency.",
      "targets": [
        "time invested",
        "missing notification",
        "time and attention loss",
        "psychological strain",
        "impaired autonomy"
      ],
      "reasons": {
        "time invested": "The person may have to repeat work, dispute a charge, cancel an obligation, or reconstruct what happened.",
        "missing notification": "Keeping the commitment out of view can prolong uncertainty and delay corrective action.",
        "time and attention loss": "Detection and reversal consume finite personal resources even when reimbursement is eventually obtained.",
        "psychological strain": "Unexpected obligations can produce anxiety, frustration, embarrassment, or self-doubt.",
        "impaired autonomy": "The central injury is that the resulting commitment did not arise from an informed choice aligned with the person's own purposes."
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
      "puzzleId": "the-hidden-transaction",
      "puzzleRevision": "fnv1a32:92832010",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:advertised price": {
          "x": 887.6,
          "y": 455.91,
          "pinned": false
        },
        "term:chosen product": {
          "x": 881.66,
          "y": 313.55,
          "pinned": false
        },
        "term:one-off expectation": {
          "x": 750.39,
          "y": 534.59,
          "pinned": false
        },
        "term:free trial": {
          "x": 880.06,
          "y": 585.58,
          "pinned": false
        },
        "term:delayed disclosure": {
          "x": 738.64,
          "y": 272.48,
          "pinned": false
        },
        "term:undisclosed add-on": {
          "x": 860.19,
          "y": 166.3,
          "pinned": false
        },
        "term:obscured recurring terms": {
          "x": 566.06,
          "y": 220.29,
          "pinned": false
        },
        "term:silent enrollment": {
          "x": 709.87,
          "y": 116.85,
          "pinned": false
        },
        "term:checkout progress": {
          "x": 471.2,
          "y": 597,
          "pinned": false
        },
        "term:time invested": {
          "x": 601.69,
          "y": 539.97,
          "pinned": false
        },
        "term:stored payment method": {
          "x": 417.59,
          "y": 438.3,
          "pinned": false
        },
        "term:missing notification": {
          "x": 306.71,
          "y": 593.18,
          "pinned": false
        },
        "term:unexpected fee": {
          "x": 226.53,
          "y": 204.64,
          "pinned": false
        },
        "term:unwanted item": {
          "x": 350.54,
          "y": 156.41,
          "pinned": false
        },
        "term:recurring charge": {
          "x": 336.64,
          "y": 295.06,
          "pinned": false
        },
        "term:time and attention loss": {
          "x": 238.22,
          "y": 40.52,
          "pinned": false
        },
        "term:psychological strain": {
          "x": 85,
          "y": 141.34,
          "pinned": false
        },
        "term:impaired autonomy": {
          "x": 118.59,
          "y": 302.41,
          "pinned": false
        },
        "term:sneaking": {
          "x": 779.69,
          "y": 395.73,
          "pinned": false
        },
        "term:commitment leverage": {
          "x": 626.97,
          "y": 393.33,
          "pinned": false
        },
        "term:unintended transaction": {
          "x": 234.42,
          "y": 428.01,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3655.6,
        "score": 3655.6026493075733
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:36:47.385Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-hidden-transaction",
      "puzzleRevision": "fnv1a32:92832010",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 257.81,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 226.8,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 569.2,
          "pinned": false
        },
        "cluster:3": {
          "x": 792.19,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:sneaking": {
          "x": 336.25,
          "y": 257.24,
          "pinned": false
        },
        "term:commitment leverage": {
          "x": 525,
          "y": 398,
          "pinned": false
        },
        "term:unintended transaction": {
          "x": 754.76,
          "y": 579.77,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "advertised price",
          "chosen product",
          "one-off expectation",
          "free trial"
        ],
        "cluster:1": [
          "delayed disclosure",
          "undisclosed add-on",
          "obscured recurring terms",
          "silent enrollment"
        ],
        "cluster:2": [
          "checkout progress",
          "time invested",
          "stored payment method",
          "missing notification"
        ],
        "cluster:3": [
          "unexpected fee",
          "unwanted item",
          "recurring charge",
          "time and attention loss",
          "psychological strain",
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
        "totalLength": 280.86582624089897
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:36:49.536Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-hidden-transaction",
      "puzzleRevision": "fnv1a32:92832010",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:advertised price": {
          "x": 492.48,
          "y": 146.75
        },
        "term:chosen product": {
          "x": 291.42,
          "y": 67
        },
        "term:one-off expectation": {
          "x": 575.58,
          "y": 22
        },
        "term:free trial": {
          "x": 160.03,
          "y": 22
        },
        "term:delayed disclosure": {
          "x": 564.98,
          "y": 192.23
        },
        "term:undisclosed add-on": {
          "x": 803.15,
          "y": 363.01
        },
        "term:obscured recurring terms": {
          "x": 864.4,
          "y": 173.79
        },
        "term:silent enrollment": {
          "x": 886.45,
          "y": 22
        },
        "term:checkout progress": {
          "x": 716.6,
          "y": 491.88
        },
        "term:time invested": {
          "x": 493.97,
          "y": 414.4
        },
        "term:stored payment method": {
          "x": 395.56,
          "y": 598
        },
        "term:missing notification": {
          "x": 605.89,
          "y": 598
        },
        "term:unexpected fee": {
          "x": 218.47,
          "y": 121.17
        },
        "term:unwanted item": {
          "x": 60.95,
          "y": 367.68
        },
        "term:recurring charge": {
          "x": 346.17,
          "y": 168.69
        },
        "term:time and attention loss": {
          "x": 92.45,
          "y": 201
        },
        "term:psychological strain": {
          "x": 83,
          "y": 521.17
        },
        "term:impaired autonomy": {
          "x": 249.58,
          "y": 526.08
        },
        "term:sneaking": {
          "x": 634.89,
          "y": 80.43
        },
        "term:commitment leverage": {
          "x": 631.47,
          "y": 349.85
        },
        "term:unintended transaction": {
          "x": 448,
          "y": 305.45
        },
        "cluster:0": {
          "x": 423.55,
          "y": 22
        },
        "cluster:1": {
          "x": 708.09,
          "y": 215.55
        },
        "cluster:2": {
          "x": 515.62,
          "y": 480.96
        },
        "cluster:3": {
          "x": 241.29,
          "y": 331.51
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:36:51.469Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:36:45.424Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
