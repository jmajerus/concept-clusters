// Generated from content/puzzles/after-the-click.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "after-the-click",
  "title": "After the Click",
  "category": "psychology",
  "categories": [
    "psychology",
    "computer-science",
    "science-technology-society"
  ],
  "subcategories": {
    "computer-science": "computing-and-society",
    "psychology": "social-psychology",
    "science-technology-society": "persuasive-deceptive-design"
  },
  "info": {
    "text": "How recognizing that a digital choice was engineered can transform an unwanted outcome into regret, self-blame, perceived betrayal, and lasting defensive behavior. Research on fraud victimization is used cautiously to illuminate deception-related aftermath, not to equate every dark pattern with fraud.",
    "links": [
      {
        "href": "https://doi.org/10.1145/3479516"
      },
      {
        "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
      }
    ]
  },
  "clusters": [
    {
      "id": "recognition-and-reappraisal",
      "name": "Recognition and reappraisal",
      "color": "teal",
      "fact": "The psychological aftermath begins when a result, condition, or fabricated signal reveals that the person's recorded action did not faithfully express the choice they believed they were making.",
      "terms": [
        "unexpected outcome",
        "concealed condition discovered",
        "fabricated signal exposed",
        "manipulation recognized",
        "intention mismatch"
      ],
      "seeds": [
        "unexpected outcome",
        "manipulation recognized"
      ],
      "termInfo": {
        "unexpected outcome": {
          "text": "A charge, enrollment, disclosure, purchase, or other result that differs materially from what the person expected the action to produce.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3479516"
            }
          ]
        },
        "concealed condition discovered": {
          "text": "Later awareness of a fee, recurring term, data practice, or restriction that was not adequately visible when the choice was made.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3479516"
            }
          ]
        },
        "fabricated signal exposed": {
          "text": "Discovery that a countdown, scarcity claim, testimonial, activity notice, or other persuasive cue was false or materially misleading.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3461778.3462086"
            }
          ]
        },
        "manipulation recognized": {
          "text": "Understanding that the interface was designed to steer behavior in a way that served the business and conflicted with the person's own purposes.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3461778.3462086"
            }
          ]
        },
        "intention mismatch": {
          "text": "A gap between the action registered by the system and the outcome the person knowingly meant to authorize.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3479516"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://doi.org/10.1145/3461778.3462086"
          }
        ]
      }
    },
    {
      "id": "self-directed-aftermath",
      "name": "Self-directed aftermath",
      "color": "blue",
      "fact": "Recognition may be turned inward as regret, repeated mental replay, self-blame, humiliation, or reduced confidence in one's own ability to make safe decisions.",
      "terms": [
        "decision regret",
        "self-blame",
        "shame or humiliation",
        "rumination",
        "loss of self-trust"
      ],
      "seeds": [
        "decision regret",
        "self-blame"
      ],
      "termInfo": {
        "decision regret": {
          "text": "A painful comparison between the actual outcome and the choice the person believes they would have made with clearer or fairer information.",
          "links": [
            {
              "href": "https://doi.org/10.1086/339925"
            }
          ]
        },
        "self-blame": {
          "text": "Attributing the harmful outcome to one's own failure to notice, understand, resist, or verify the deceptive presentation.",
          "links": [
            {
              "href": "https://doi.org/10.1177/0146167210393532"
            }
          ]
        },
        "shame or humiliation": {
          "text": "A negative judgment about the self, such as feeling foolish, gullible, careless, or exposed, rather than only regretting a particular action.",
          "links": [
            {
              "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
            }
          ]
        },
        "rumination": {
          "text": "Repeatedly replaying the interaction, missed cue, or alternative decision after the immediate event has ended.",
          "links": [
            {
              "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
            }
          ]
        },
        "loss of self-trust": {
          "text": "Reduced confidence in one's own judgment and ability to recognize or resist manipulation in future decisions.",
          "links": [
            {
              "href": "https://doi.org/10.1177/0146167210393532"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
          }
        ]
      }
    },
    {
      "id": "response-toward-the-business",
      "name": "Response toward the business",
      "color": "amber",
      "fact": "The same recognition may be directed outward as anger, perceived betrayal, lost credibility, complaint, departure, or an effort to warn other people.",
      "terms": [
        "anger",
        "perceived betrayal",
        "credibility loss",
        "complaint or exit",
        "warning others"
      ],
      "seeds": [
        "perceived betrayal",
        "credibility loss"
      ],
      "termInfo": {
        "anger": {
          "text": "An emotional response to being treated unfairly or intentionally steered into an unwanted outcome.",
          "links": [
            {
              "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
            }
          ]
        },
        "perceived betrayal": {
          "text": "The judgment that a business exploited an expectation of honesty, fair dealing, or care for the user's interests.",
          "links": [
            {
              "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
            }
          ]
        },
        "credibility loss": {
          "text": "Reduced willingness to accept the business's future prices, claims, recommendations, or interface signals as trustworthy.",
          "links": [
            {
              "href": "https://doi.org/10.1007/978-3-030-77750-0_10"
            }
          ]
        },
        "complaint or exit": {
          "text": "Seeking redress, cancelling, switching businesses, or ending the relationship after the manipulation is recognized.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3479516"
            }
          ]
        },
        "warning others": {
          "text": "Sharing the experience so that other people can recognize the tactic, avoid the business, or protect themselves.",
          "links": [
            {
              "href": "https://doi.org/10.1145/3479516"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://doi.org/10.1007/978-3-030-77750-0_10"
          }
        ]
      }
    },
    {
      "id": "lasting-adaptation",
      "name": "Lasting adaptation",
      "color": "magenta",
      "fact": "A deceptive encounter can change future behavior: people inspect more, assume greater risk, avoid businesses, generalize suspicion, or participate less in services they might otherwise use.",
      "terms": [
        "defensive vigilance",
        "avoidance",
        "generalized suspicion",
        "trust erosion",
        "reduced participation"
      ],
      "seeds": [
        "defensive vigilance",
        "trust erosion"
      ],
      "termInfo": {
        "defensive vigilance": {
          "text": "Increased checking, verification, and monitoring motivated by the expectation that an interface may conceal or distort something important.",
          "links": [
            {
              "href": "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
            }
          ]
        },
        "avoidance": {
          "text": "Reducing contact with a business, platform, transaction type, or digital service to prevent another manipulative encounter.",
          "links": [
            {
              "href": "https://doi.org/10.1177/0146167210393532"
            }
          ]
        },
        "generalized suspicion": {
          "text": "Extending distrust from the original business or tactic to other interface signals and organizations that may be honest.",
          "links": [
            {
              "href": "https://doi.org/10.1177/0146167210393532"
            }
          ]
        },
        "trust erosion": {
          "text": "A gradual weakening of confidence that businesses and interfaces will present choices honestly and respect the person's intentions.",
          "links": [
            {
              "href": "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
            }
          ]
        },
        "reduced participation": {
          "text": "Withdrawing from useful transactions, services, or forms of digital engagement because vigilance and perceived risk have become too costly.",
          "links": [
            {
              "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "retrospective-reappraisal",
      "term": "retrospective reappraisal",
      "clusters": [
        0,
        1
      ],
      "fact": "Once manipulation or intention mismatch is recognized, the person reinterprets the earlier choice in light of information that was absent, hidden, or misunderstood at the time.",
      "info": {
        "text": "Revising the meaning of a past decision after learning something that changes how the action and responsibility are understood.",
        "links": [
          {
            "href": "https://doi.org/10.1086/339925"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "manipulation recognized",
        "decision regret"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "violated-trust",
      "term": "violated trust",
      "clusters": [
        0,
        2
      ],
      "fact": "Discovery becomes betrayal when the person concludes that ordinary reliance on the business's presentation was deliberately used to produce an unwanted outcome.",
      "info": {
        "text": "The realization that an expectation of honest dealing was not merely disappointed but used as leverage.",
        "links": [
          {
            "href": "https://doi.org/10.3389/fpsyg.2026.1805536"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "concealed condition discovered",
        "perceived betrayal"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "trust-tax",
      "term": "trust tax",
      "clusters": [
        2,
        3
      ],
      "fact": "Lost credibility in one encounter increases the verification, suspicion, and avoidance required in later interactions, imposing costs even when the next interface is honest.",
      "info": {
        "text": "The additional time, attention, and lost opportunity created when trust can no longer function as a reasonable starting assumption.",
        "links": [
          {
            "href": "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "credibility loss",
        "defensive vigilance"
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
      "id": "post-deception-regret",
      "prompt": "Which concepts distinguish post-deception regret from ordinary buyer's remorse?",
      "explanation": "Ordinary buyer's remorse can follow an honest purchase. Post-deception regret begins when the person reinterprets the decision after recognizing that the interface helped produce an action inconsistent with their intention. The mind may repeatedly revisit the moment in search of what was missed and what should have happened instead.",
      "targets": [
        "manipulation recognized",
        "intention mismatch",
        "retrospective reappraisal",
        "decision regret",
        "rumination"
      ],
      "reasons": {
        "manipulation recognized": "The later emotion is tied to discovering that the choice environment was deliberately engineered rather than merely disappointing.",
        "intention mismatch": "The recorded click or purchase does not accurately express what the person understood or wanted.",
        "retrospective reappraisal": "New information changes the meaning assigned to the earlier decision.",
        "decision regret": "The person compares the actual outcome with the choice they believe they would have made under fairer conditions.",
        "rumination": "The interaction may be mentally replayed in an effort to locate the missed cue or prevent repetition."
      }
    },
    {
      "id": "blaming-the-target",
      "prompt": "Which concepts show responsibility being internalized by the person who was manipulated?",
      "explanation": "Deceptive design can shift responsibility psychologically from the institution that engineered the choice to the person whose ordinary attention, trust, or decision limits were exploited. The person may interpret successful manipulation as evidence of personal foolishness and become less confident in future decisions.",
      "targets": [
        "manipulation recognized",
        "self-blame",
        "shame or humiliation",
        "loss of self-trust",
        "defensive vigilance"
      ],
      "reasons": {
        "manipulation recognized": "The person understands that the outcome was produced through influence rather than a simple accidental error.",
        "self-blame": "Responsibility is directed inward through thoughts such as 'I should have noticed.'",
        "shame or humiliation": "A specific mistake becomes a negative judgment about the self as foolish, careless, or easily exploited.",
        "loss of self-trust": "Confidence in one's own judgment declines after the experience.",
        "defensive vigilance": "Future interactions demand extra checking because ordinary confidence no longer feels sufficient."
      }
    },
    {
      "id": "perceived-betrayal",
      "prompt": "Which concepts form the dominant signature of perceived betrayal after deceptive design?",
      "explanation": "Betrayal differs from simple dissatisfaction because the business is understood to have used a relationship of expected honesty against the person. Discovering a concealed condition can therefore produce anger and a broader judgment that the business's claims and interface signals are no longer credible.",
      "targets": [
        "concealed condition discovered",
        "violated trust",
        "anger",
        "perceived betrayal",
        "credibility loss"
      ],
      "reasons": {
        "concealed condition discovered": "The person learns that material information was withheld, obscured, or delayed.",
        "violated trust": "The discovery reveals that ordinary reliance on the business's presentation was used as leverage.",
        "anger": "The emotional response is directed toward an actor perceived to have imposed the harm intentionally or unfairly.",
        "perceived betrayal": "The business is judged to have violated an expectation of honest dealing.",
        "credibility loss": "Future claims from the business are treated as less believable because prior signals proved unreliable."
      }
    },
    {
      "id": "trust-tax",
      "prompt": "Which concepts show how one deceptive encounter can burden later digital participation?",
      "explanation": "Once deception becomes plausible, future interactions require additional verification, suspicion, and contingency planning. The person may avoid businesses, abandon useful services, or participate less fully. These costs persist even when later interfaces are honest.",
      "targets": [
        "credibility loss",
        "trust tax",
        "defensive vigilance",
        "avoidance",
        "trust erosion",
        "reduced participation"
      ],
      "reasons": {
        "credibility loss": "The original business can no longer rely on ordinary confidence in its representations.",
        "trust tax": "Additional effort must be spent verifying signals that once could be accepted provisionally.",
        "defensive vigilance": "The person approaches later interfaces expecting possible manipulation.",
        "avoidance": "Avoiding a business or category becomes a way to reduce exposure to another deceptive encounter.",
        "trust erosion": "Confidence declines not only in one message but in the relationship that made reliance possible.",
        "reduced participation": "The person may withdraw from useful transactions or services because the perceived cost of engagement has risen."
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
      "puzzleId": "after-the-click",
      "puzzleRevision": "fnv1a32:85595fab",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:unexpected outcome": {
          "x": 697.13,
          "y": 378.31,
          "pinned": false
        },
        "term:concealed condition discovered": {
          "x": 843.5,
          "y": 243.28,
          "pinned": false
        },
        "term:fabricated signal exposed": {
          "x": 859.25,
          "y": 463.95,
          "pinned": false
        },
        "term:manipulation recognized": {
          "x": 550.69,
          "y": 477.95,
          "pinned": false
        },
        "term:intention mismatch": {
          "x": 705.55,
          "y": 563.95,
          "pinned": false
        },
        "term:decision regret": {
          "x": 185.75,
          "y": 471.26,
          "pinned": false
        },
        "term:self-blame": {
          "x": 134.88,
          "y": 587.35,
          "pinned": false
        },
        "term:shame or humiliation": {
          "x": 85,
          "y": 349.36,
          "pinned": false
        },
        "term:rumination": {
          "x": 63,
          "y": 502.78,
          "pinned": false
        },
        "term:loss of self-trust": {
          "x": 270.72,
          "y": 597,
          "pinned": false
        },
        "term:anger": {
          "x": 538.5,
          "y": 183.71,
          "pinned": false
        },
        "term:perceived betrayal": {
          "x": 658.21,
          "y": 170.28,
          "pinned": false
        },
        "term:credibility loss": {
          "x": 566.25,
          "y": 295.14,
          "pinned": false
        },
        "term:complaint or exit": {
          "x": 538.84,
          "y": 66.38,
          "pinned": false
        },
        "term:warning others": {
          "x": 677.8,
          "y": 23,
          "pinned": false
        },
        "term:defensive vigilance": {
          "x": 314.24,
          "y": 251.74,
          "pinned": false
        },
        "term:avoidance": {
          "x": 224.03,
          "y": 353.76,
          "pinned": false
        },
        "term:generalized suspicion": {
          "x": 153.18,
          "y": 185.92,
          "pinned": false
        },
        "term:trust erosion": {
          "x": 431.08,
          "y": 159.61,
          "pinned": false
        },
        "term:reduced participation": {
          "x": 298,
          "y": 78.51,
          "pinned": false
        },
        "term:retrospective reappraisal": {
          "x": 356.21,
          "y": 434.92,
          "pinned": false
        },
        "term:violated trust": {
          "x": 808.84,
          "y": 59.93,
          "pinned": false
        },
        "term:trust tax": {
          "x": 439.87,
          "y": 304.32,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4141.58,
        "score": 4141.580109389491
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:42.215Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "after-the-click",
      "puzzleRevision": "fnv1a32:85595fab",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 586.11,
          "pinned": false
        },
        "cluster:1": {
          "x": 218.85,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 209.89,
          "pinned": false
        },
        "cluster:3": {
          "x": 831.15,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:retrospective reappraisal": {
          "x": 216.71,
          "y": 556.35,
          "pinned": false
        },
        "term:violated trust": {
          "x": 499.13,
          "y": 387.28,
          "pinned": false
        },
        "term:trust tax": {
          "x": 751.61,
          "y": 230.41,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "unexpected outcome",
          "concealed condition discovered",
          "fabricated signal exposed",
          "manipulation recognized",
          "intention mismatch"
        ],
        "cluster:1": [
          "decision regret",
          "self-blame",
          "shame or humiliation",
          "rumination",
          "loss of self-trust"
        ],
        "cluster:2": [
          "anger",
          "perceived betrayal",
          "credibility loss",
          "complaint or exit",
          "warning others"
        ],
        "cluster:3": [
          "defensive vigilance",
          "avoidance",
          "generalized suspicion",
          "trust erosion",
          "reduced participation"
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
        "totalLength": 351.5118109272904
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:37:44.173Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "after-the-click",
      "puzzleRevision": "fnv1a32:85595fab",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:unexpected outcome": {
          "x": 416.29,
          "y": 80.73
        },
        "term:concealed condition discovered": {
          "x": 222.23,
          "y": 215.62
        },
        "term:fabricated signal exposed": {
          "x": 331.89,
          "y": 146.75
        },
        "term:manipulation recognized": {
          "x": 635.21,
          "y": 110.87
        },
        "term:intention mismatch": {
          "x": 542.33,
          "y": 22
        },
        "term:decision regret": {
          "x": 746.04,
          "y": 314.34
        },
        "term:self-blame": {
          "x": 908.5,
          "y": 71.32
        },
        "term:shame or humiliation": {
          "x": 877,
          "y": 268.7
        },
        "term:rumination": {
          "x": 908.5,
          "y": 138.01
        },
        "term:loss of self-trust": {
          "x": 883.3,
          "y": 22
        },
        "term:anger": {
          "x": 684.24,
          "y": 501.44
        },
        "term:perceived betrayal": {
          "x": 412.15,
          "y": 280.8
        },
        "term:credibility loss": {
          "x": 493.83,
          "y": 579.57
        },
        "term:complaint or exit": {
          "x": 775.04,
          "y": 596.57
        },
        "term:warning others": {
          "x": 630.25,
          "y": 598
        },
        "term:defensive vigilance": {
          "x": 79.85,
          "y": 262.19
        },
        "term:avoidance": {
          "x": 48.35,
          "y": 558.92
        },
        "term:generalized suspicion": {
          "x": 142.61,
          "y": 598
        },
        "term:trust erosion": {
          "x": 300.95,
          "y": 597.22
        },
        "term:reduced participation": {
          "x": 86.15,
          "y": 436.57
        },
        "term:retrospective reappraisal": {
          "x": 658.11,
          "y": 178.13
        },
        "term:violated trust": {
          "x": 374.64,
          "y": 374.24
        },
        "term:trust tax": {
          "x": 368.67,
          "y": 503.28
        },
        "cluster:0": {
          "x": 453.78,
          "y": 215.62
        },
        "cluster:1": {
          "x": 765.87,
          "y": 60.89
        },
        "cluster:2": {
          "x": 532.58,
          "y": 476.62
        },
        "cluster:3": {
          "x": 245.83,
          "y": 486.8
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:37:46.159Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:37:40.257Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
