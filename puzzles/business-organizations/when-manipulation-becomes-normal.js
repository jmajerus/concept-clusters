// Generated from content/puzzles/when-manipulation-becomes-normal.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "when-manipulation-becomes-normal",
  "title": "When Manipulation Becomes Normal",
  "category": "business-organizations",
  "categories": [
    "business-organizations",
    "computer-science",
    "science-technology-society"
  ],
  "subcategories": {
    "computer-science": "computing-and-society",
    "science-technology-society": "persuasive-deceptive-design"
  },
  "info": {
    "text": "How strategic targets, experimentation, incentives, and organizational routines can turn an initially questionable tactic into standard practice, while distributing responsibility and eroding trust. Normalization of deviance is used here as an organizational lens, not to equate dark patterns with safety disasters.",
    "links": [
      {
        "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
      },
      {
        "href": "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "strategic-incentives",
      "name": "Strategic incentives",
      "color": "teal",
      "fact": "Organizations define what counts as success through targets, rewards, and oversight. Those choices determine which outcomes become visible, whose interests are prioritized, and what pressures flow downward.",
      "terms": [
        "conversion target",
        "retention target",
        "data growth target",
        "executive compensation",
        "board oversight"
      ],
      "seeds": [
        "conversion target",
        "board oversight"
      ],
      "termInfo": {
        "conversion target": {
          "text": "A goal for increasing the share of users who purchase, subscribe, consent, register, or complete another business-valued action.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
            }
          ]
        },
        "retention target": {
          "text": "A goal for keeping users enrolled, engaged, paying, or active, sometimes without distinguishing willing continuation from persistence produced by friction.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
            }
          ]
        },
        "data growth target": {
          "text": "A goal for increasing the volume, scope, or reuse of personal and behavioral data collected from users.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
            }
          ]
        },
        "executive compensation": {
          "text": "Pay, bonuses, equity, or advancement linked to organizational performance measures that can intensify pressure to achieve selected outcomes.",
          "links": [
            {
              "href": "https://doi.org/10.5465/ambpp.2007.26533588"
            }
          ]
        },
        "board oversight": {
          "text": "The governing responsibility to supervise strategy, risk, executive incentives, and whether organizational conduct remains consistent with legal and ethical obligations.",
          "links": [
            {
              "href": "https://doi.org/10.1023/A:1025992813613"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
          }
        ]
      }
    },
    {
      "id": "optimization-machinery",
      "name": "Optimization machinery",
      "color": "blue",
      "fact": "Strategic goals become operational through dashboards, experiments, cascading KPIs, and rollout processes that can select effective behavior without asking whether the behavior should be produced.",
      "terms": [
        "analytics dashboard",
        "A/B experiment",
        "winning variant",
        "KPI cascade",
        "rapid rollout"
      ],
      "seeds": [
        "analytics dashboard",
        "A/B experiment"
      ],
      "termInfo": {
        "analytics dashboard": {
          "text": "A display that makes selected outcomes continuously visible while leaving unmeasured harms or externalities comparatively obscure.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers"
            }
          ]
        },
        "A/B experiment": {
          "text": "A controlled comparison of interface variants used to determine which version produces more of a selected user behavior.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
            }
          ]
        },
        "winning variant": {
          "text": "The version judged superior because it improves the chosen metric, whether or not the evaluation captures autonomy, comprehension, trust, or longer-term harm.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-takes-action-stop-credit-karma-tricking-consumers-allegedly-false-pre-approved-credit-offers"
            }
          ]
        },
        "KPI cascade": {
          "text": "The translation of high-level targets into linked performance indicators for business units, teams, and individual roles.",
          "links": [
            {
              "href": "https://doi.org/10.5465/ambpp.2007.26533588"
            }
          ]
        },
        "rapid rollout": {
          "text": "Expanding a locally successful design across products, populations, or markets before slower evidence about complaints, trust, or cumulative harm is fully considered.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
          }
        ]
      }
    },
    {
      "id": "organizational-normalization",
      "name": "Organizational normalization",
      "color": "amber",
      "fact": "Repeated performance gains, survivable complaints, prior precedent, competitor behavior, and divided roles can gradually make a questionable tactic feel routine rather than exceptional.",
      "terms": [
        "tolerated complaint rate",
        "successful precedent",
        "ethical fading",
        "competitor imitation",
        "responsibility diffusion"
      ],
      "seeds": [
        "successful precedent",
        "responsibility diffusion"
      ],
      "termInfo": {
        "tolerated complaint rate": {
          "text": "A level of user objection treated as an acceptable cost of achieving business targets rather than a reason to reconsider the practice.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
            }
          ]
        },
        "successful precedent": {
          "text": "An earlier deployment interpreted as validation because it improved performance and did not trigger a decisive internal, legal, or market response.",
          "links": [
            {
              "href": "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
            }
          ]
        },
        "ethical fading": {
          "text": "A process in which the moral dimensions of a decision recede as the situation is framed primarily in operational, competitive, or financial terms.",
          "links": [
            {
              "href": "https://doi.org/10.1023/B:SORE.0000027411.35832.53"
            }
          ]
        },
        "competitor imitation": {
          "text": "Adoption of a tactic because rival firms use it successfully, making restraint appear commercially disadvantageous or unusually demanding.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
            }
          ]
        },
        "responsibility diffusion": {
          "text": "The weakening of felt accountability when strategy, research, design, implementation, approval, and deployment are divided among many people and units.",
          "links": [
            {
              "href": "https://doi.org/10.1023/A:1025992813613"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://doi.org/10.1023/B:SORE.0000027411.35832.53"
          }
        ]
      }
    },
    {
      "id": "business-and-market-consequences",
      "name": "Business and market consequences",
      "color": "magenta",
      "fact": "Manipulative practices can damage relationships inside and outside the firm through customer distrust, employee ethical strain, reputational harm, regulatory exposure, and suspicion that spreads across the wider market.",
      "terms": [
        "customer distrust",
        "employee ethical strain",
        "reputational damage",
        "regulatory exposure",
        "market-wide distrust"
      ],
      "seeds": [
        "customer distrust",
        "employee ethical strain"
      ],
      "termInfo": {
        "customer distrust": {
          "text": "Reduced confidence that a business's prices, claims, controls, and disclosures can be relied upon without defensive verification.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
            }
          ]
        },
        "employee ethical strain": {
          "text": "Conflict or distress experienced when organizational expectations pressure workers to act against professional judgment or personal ethical commitments.",
          "links": [
            {
              "href": "https://pure.psu.edu/en/publications/the-dark-patterns-side-of-ux-design/"
            }
          ]
        },
        "reputational damage": {
          "text": "Loss of public credibility and goodwill after customers, employees, journalists, or advocates identify manipulative conduct.",
          "links": [
            {
              "href": "https://www.oecd.org/en/publications/dark-commercial-patterns_44f5e846-en.html"
            }
          ]
        },
        "regulatory exposure": {
          "text": "Risk of investigation, orders, redress, penalties, or litigation when manipulative design is judged deceptive, unfair, or otherwise unlawful.",
          "links": [
            {
              "href": "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-takes-action-stop-credit-karma-tricking-consumers-allegedly-false-pre-approved-credit-offers"
            }
          ]
        },
        "market-wide distrust": {
          "text": "Generalized suspicion that burdens honest businesses and weakens confidence and competition across digital markets.",
          "links": [
            {
              "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
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
      "id": "authorized-priorities",
      "term": "authorized priorities",
      "clusters": [
        0,
        1
      ],
      "fact": "Targets, incentives, and governance choices authorize what the optimization system should pursue, determining which user behaviors become experimental objectives and performance evidence.",
      "info": {
        "text": "Strategic choices translated into operational permission and pressure to optimize selected outcomes.",
        "links": [
          {
            "href": "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "conversion target",
        "A/B experiment"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "normalization-of-deviance",
      "term": "normalization of deviance",
      "clusters": [
        1,
        2
      ],
      "fact": "When experimental departures from expected standards repeatedly improve metrics without producing an immediately decisive failure, they can become accepted precedent and eventually routine practice.",
      "info": {
        "text": "Diane Vaughan's term for an organizational process in which repeated departures from an expected norm become accepted as normal. Its use here is an analytical transfer, not an equivalence between dark patterns and catastrophic safety failures.",
        "links": [
          {
            "href": "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "winning variant",
        "successful precedent"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "erosion-of-trust",
      "term": "erosion of trust",
      "clusters": [
        2,
        3
      ],
      "fact": "As manipulative practices become routine and spread across firms, customers learn to treat ordinary commercial signals as potentially adversarial, weakening confidence in both the business and the wider market.",
      "info": {
        "text": "The gradual weakening of confidence that organizations and markets will represent choices honestly and respect people's interests.",
        "links": [
          {
            "href": "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "competitor imitation",
        "market-wide distrust"
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
      "id": "metric-becomes-mandate",
      "prompt": "Which concepts show a business metric becoming an organizational mandate?",
      "explanation": "A metric becomes a mandate when leaders define success numerically, attach rewards to it, and cascade it through teams. An experiment that improves the chosen number can then move rapidly from local evidence to an expected operating baseline, even when the measurement omits harm to users.",
      "targets": [
        "conversion target",
        "executive compensation",
        "KPI cascade",
        "winning variant",
        "rapid rollout"
      ],
      "reasons": {
        "conversion target": "A selected outcome becomes the visible definition of success.",
        "executive compensation": "Personal rewards can intensify pressure to achieve the target and protect gains.",
        "KPI cascade": "The strategic objective is translated into subordinate goals for product, design, marketing, and engineering teams.",
        "winning variant": "The design is treated as superior because it performs better on the chosen metric.",
        "rapid rollout": "Once the result is accepted, deployment can outpace broader ethical review or learning from complaints."
      }
    },
    {
      "id": "no-immediate-disaster",
      "prompt": "Which concepts show how questionable practice can become normal without an immediate crisis?",
      "explanation": "A questionable practice may become normalized because each use appears successful and produces no immediately decisive failure. Favorable metrics, survivable complaints, and repeated precedent gradually redefine the practice as ordinary, while its ethical meaning fades behind operational language.",
      "targets": [
        "A/B experiment",
        "winning variant",
        "tolerated complaint rate",
        "successful precedent",
        "ethical fading",
        "normalization of deviance"
      ],
      "reasons": {
        "A/B experiment": "The practice enters as a bounded test rather than an announced change in ethical standards.",
        "winning variant": "Short-term performance supplies evidence for continuing the practice.",
        "tolerated complaint rate": "Complaints are treated as an acceptable operating cost rather than a signal that the design may be wrongful.",
        "successful precedent": "Earlier deployment without decisive sanction makes repetition easier to justify.",
        "ethical fading": "The decision is framed as optimization, growth, or retention, causing its moral dimensions to recede.",
        "normalization of deviance": "Repeated departures from an expected norm become accepted as normal after apparent success."
      }
    },
    {
      "id": "distributed-work-unequal-responsibility",
      "prompt": "Which concepts show distributed work without equal responsibility?",
      "explanation": "Many people may contribute to a dark pattern, but responsibility is not evenly distributed. Those who set priorities, control incentives, receive the largest benefits, possess broader information, and have greater authority to intervene bear greater responsibility than workers implementing a narrowly assigned task.",
      "targets": [
        "board oversight",
        "executive compensation",
        "KPI cascade",
        "responsibility diffusion",
        "employee ethical strain",
        "regulatory exposure"
      ],
      "reasons": {
        "board oversight": "Boards possess governance authority over strategy, risk, executive incentives, and organizational conduct.",
        "executive compensation": "Senior leaders may benefit directly from targets that reward manipulation while shaping the conditions under which others work.",
        "KPI cascade": "Teams inherit goals defined higher in the organization and may have limited power to revise them.",
        "responsibility diffusion": "Divided roles can make each participant feel that final responsibility belongs elsewhere.",
        "employee ethical strain": "Workers may experience conflict between professional judgment, personal values, job security, and assigned objectives.",
        "regulatory exposure": "The organization remains accountable even when the disputed practice emerged through many distributed decisions."
      }
    },
    {
      "id": "private-gain-shared-loss",
      "prompt": "Which concepts show private gains producing shared losses?",
      "explanation": "One firm can capture the immediate gain from higher retention or conversion while distrust spreads beyond the original interaction. Competitors may imitate the successful tactic, and users may begin treating ordinary interface signals across the market as potentially adversarial.",
      "targets": [
        "retention target",
        "winning variant",
        "competitor imitation",
        "erosion of trust",
        "customer distrust",
        "market-wide distrust"
      ],
      "reasons": {
        "retention target": "The business receives a measurable benefit when more users remain enrolled or engaged.",
        "winning variant": "The local performance gain encourages continued use and provides a model others may copy.",
        "competitor imitation": "A successful tactic can spread as firms try to avoid a perceived competitive disadvantage.",
        "erosion of trust": "Repeated manipulation weakens confidence that businesses will represent choices honestly.",
        "customer distrust": "The originating firm loses credibility with the people it directly affected.",
        "market-wide distrust": "Suspicion can generalize to honest businesses and reduce confidence in digital commerce more broadly."
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
      "puzzleId": "when-manipulation-becomes-normal",
      "puzzleRevision": "fnv1a32:d2bd2487",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:conversion target": {
          "x": 700.46,
          "y": 445.45,
          "pinned": false
        },
        "term:retention target": {
          "x": 603.3,
          "y": 562.26,
          "pinned": false
        },
        "term:data growth target": {
          "x": 858.67,
          "y": 442.27,
          "pinned": false
        },
        "term:executive compensation": {
          "x": 779.18,
          "y": 597,
          "pinned": false
        },
        "term:board oversight": {
          "x": 774.01,
          "y": 316.1,
          "pinned": false
        },
        "term:analytics dashboard": {
          "x": 726.49,
          "y": 23,
          "pinned": false
        },
        "term:A/B experiment": {
          "x": 637.09,
          "y": 145.83,
          "pinned": false
        },
        "term:winning variant": {
          "x": 571.4,
          "y": 23,
          "pinned": false
        },
        "term:KPI cascade": {
          "x": 857.27,
          "y": 79.56,
          "pinned": false
        },
        "term:rapid rollout": {
          "x": 768.64,
          "y": 165.7,
          "pinned": false
        },
        "term:tolerated complaint rate": {
          "x": 195.06,
          "y": 23.76,
          "pinned": false
        },
        "term:successful precedent": {
          "x": 293.99,
          "y": 181.99,
          "pinned": false
        },
        "term:ethical fading": {
          "x": 227.05,
          "y": 321.9,
          "pinned": false
        },
        "term:competitor imitation": {
          "x": 469.83,
          "y": 198.24,
          "pinned": false
        },
        "term:responsibility diffusion": {
          "x": 108.6,
          "y": 203.2,
          "pinned": false
        },
        "term:customer distrust": {
          "x": 289.2,
          "y": 453.61,
          "pinned": false
        },
        "term:employee ethical strain": {
          "x": 387.63,
          "y": 597,
          "pinned": false
        },
        "term:reputational damage": {
          "x": 128.43,
          "y": 439.47,
          "pinned": false
        },
        "term:regulatory exposure": {
          "x": 207.39,
          "y": 592.72,
          "pinned": false
        },
        "term:market-wide distrust": {
          "x": 482.38,
          "y": 439.99,
          "pinned": false
        },
        "term:authorized priorities": {
          "x": 613.21,
          "y": 302.26,
          "pinned": false
        },
        "term:normalization of deviance": {
          "x": 397.4,
          "y": 23,
          "pinned": false
        },
        "term:erosion of trust": {
          "x": 369.5,
          "y": 324.63,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4296.89,
        "score": 4296.891314921038
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:00.454Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "when-manipulation-becomes-normal",
      "puzzleRevision": "fnv1a32:d2bd2487",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 844.39,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 585.58,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 210.42,
          "pinned": false
        },
        "cluster:3": {
          "x": 205.61,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:authorized priorities": {
          "x": 758.23,
          "y": 565.33,
          "pinned": false
        },
        "term:normalization of deviance": {
          "x": 525,
          "y": 398,
          "pinned": false
        },
        "term:erosion of trust": {
          "x": 291.77,
          "y": 230.67,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "conversion target",
          "retention target",
          "data growth target",
          "executive compensation",
          "board oversight"
        ],
        "cluster:1": [
          "analytics dashboard",
          "A/B experiment",
          "winning variant",
          "KPI cascade",
          "rapid rollout"
        ],
        "cluster:2": [
          "tolerated complaint rate",
          "successful precedent",
          "ethical fading",
          "competitor imitation",
          "responsibility diffusion"
        ],
        "cluster:3": [
          "customer distrust",
          "employee ethical strain",
          "reputational damage",
          "regulatory exposure",
          "market-wide distrust"
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
        "totalLength": 342.00764683584504
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:02.425Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "when-manipulation-becomes-normal",
      "puzzleRevision": "fnv1a32:d2bd2487",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:conversion target": {
          "x": 538.63,
          "y": 62.19
        },
        "term:retention target": {
          "x": 533.73,
          "y": 254.64
        },
        "term:data growth target": {
          "x": 318.71,
          "y": 22
        },
        "term:executive compensation": {
          "x": 502.44,
          "y": 22
        },
        "term:board oversight": {
          "x": 567.63,
          "y": 133.09
        },
        "term:analytics dashboard": {
          "x": 733.9,
          "y": 173.47
        },
        "term:A/B experiment": {
          "x": 769.71,
          "y": 91.41
        },
        "term:winning variant": {
          "x": 795.74,
          "y": 363.72
        },
        "term:KPI cascade": {
          "x": 905.35,
          "y": 22
        },
        "term:rapid rollout": {
          "x": 899.05,
          "y": 283.13
        },
        "term:tolerated complaint rate": {
          "x": 612.57,
          "y": 551.72
        },
        "term:successful precedent": {
          "x": 852.37,
          "y": 598
        },
        "term:ethical fading": {
          "x": 664.97,
          "y": 288.07
        },
        "term:competitor imitation": {
          "x": 395.36,
          "y": 533.99
        },
        "term:responsibility diffusion": {
          "x": 465.27,
          "y": 598
        },
        "term:customer distrust": {
          "x": 73.55,
          "y": 73.72
        },
        "term:employee ethical strain": {
          "x": 261.5,
          "y": 598
        },
        "term:reputational damage": {
          "x": 233.17,
          "y": 194.66
        },
        "term:regulatory exposure": {
          "x": 79.85,
          "y": 598
        },
        "term:market-wide distrust": {
          "x": 296.48,
          "y": 355.61
        },
        "term:authorized priorities": {
          "x": 692.87,
          "y": 22
        },
        "term:normalization of deviance": {
          "x": 766.23,
          "y": 442.22
        },
        "term:erosion of trust": {
          "x": 356.8,
          "y": 465.67
        },
        "cluster:0": {
          "x": 362.1,
          "y": 105.72
        },
        "cluster:1": {
          "x": 870.7,
          "y": 135
        },
        "cluster:2": {
          "x": 545.25,
          "y": 428.97
        },
        "cluster:3": {
          "x": 169.97,
          "y": 415.56
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:38:04.572Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:37:58.374Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
