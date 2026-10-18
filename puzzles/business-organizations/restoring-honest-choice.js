// Generated from content/puzzles/restoring-honest-choice.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "restoring-honest-choice",
  "title": "Restoring Honest Choice",
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
    "text": "How professional commitments, ethical formation, organizational safeguards, and public accountability can work together to protect honest choice. The puzzle treats these remedies as complementary layers rather than interchangeable solutions.",
    "links": [
      {
        "href": "https://www.acm.org/code-of-ethics",
        "label": "ACM Code of Ethics"
      },
      {
        "href": "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule",
        "label": "FTC negative-option rule"
      },
      {
        "href": "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement",
        "label": "FTC enforcement"
      },
      {
        "href": "https://www.aacsb.edu/educators/global-standards",
        "label": "AACSB business-education standards"
      }
    ]
  },
  "clusters": [
    {
      "id": "professional-commitments",
      "name": "Professional commitments",
      "color": "teal",
      "fact": "Professional ethics asks computing practitioners and leaders to define success through human well-being, avoidance of harm, honesty, privacy, and careful evaluation of impacts, not solely through technical performance or business metrics.",
      "terms": [
        "public good",
        "avoid harm",
        "honesty and trustworthiness",
        "respect for privacy",
        "impact and risk evaluation"
      ],
      "seeds": [
        "public good",
        "avoid harm"
      ],
      "termInfo": {
        "public good": {
          "text": "The ACM Code places the public good at the center of computing work and treats all people as stakeholders in computing.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "avoid harm": {
          "text": "A professional duty to prevent or mitigate significant unjust consequences arising from computing systems and decisions.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "honesty and trustworthiness": {
          "text": "The duty to represent systems, capabilities, incentives, terms, and limitations without deception or misleading omission.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "respect for privacy": {
          "text": "The duty to understand and protect privacy rights, use personal information for legitimate ends, and support informed consent.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "impact and risk evaluation": {
          "text": "Comprehensive assessment of a system's foreseeable benefits, harms, limitations, and effects on people and society.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://www.acm.org/code-of-ethics",
            "label": "ACM Code of Ethics"
          }
        ]
      }
    },
    {
      "id": "education-and-formation",
      "name": "Education and formation",
      "color": "blue",
      "fact": "Education can build the concepts, habits, and professional identity needed to recognize manipulation, analyze stakeholders, reason from cases, and treat ethical judgment as part of competent practice.",
      "terms": [
        "business ethics",
        "computing ethics",
        "stakeholder analysis",
        "case-based reasoning",
        "professional identity"
      ],
      "seeds": [
        "business ethics",
        "stakeholder analysis"
      ],
      "termInfo": {
        "business ethics": {
          "text": "Study of the responsibilities, values, institutions, and conflicts that shape business decisions and their effects on stakeholders and society.",
          "links": [
            {
              "href": "https://www.aacsb.edu/educators/global-standards"
            }
          ]
        },
        "computing ethics": {
          "text": "Study and practice of ethical responsibility in the design, development, deployment, governance, and use of computing systems.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "stakeholder analysis": {
          "text": "Identifying who affects or is affected by a decision, what interests and risks they carry, and whose interests may be omitted from the chosen metric.",
          "links": [
            {
              "href": "https://www.aacsb.edu/educators/global-standards"
            }
          ]
        },
        "case-based reasoning": {
          "text": "Learning through concrete situations that reveal competing duties, incentives, rationalizations, consequences, and possible interventions.",
          "links": [
            {
              "href": "https://www.aacsb.edu/educators/global-standards"
            }
          ]
        },
        "professional identity": {
          "text": "A person's understanding that ethical judgment, public responsibility, and willingness to raise concerns belong to competent professional work.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        }
      },
      "info": {
        "text": "AACSB's 2026 standards emphasize ethical judgment, responsible use of technology, human judgment, and societal impact across business curricula.",
        "links": [
          {
            "href": "https://www.aacsb.edu/educators/global-standards",
            "label": "AACSB global standards"
          }
        ]
      }
    },
    {
      "id": "organizational-safeguards",
      "name": "Organizational safeguards",
      "color": "amber",
      "fact": "Organizations make ethical restraint credible by changing incentives, reviewing high-risk designs, testing the integrity of choices, escalating complaints, and protecting people who challenge harmful objectives or practices.",
      "terms": [
        "ethics review",
        "incentive redesign",
        "autonomy testing",
        "complaint escalation",
        "protected dissent"
      ],
      "seeds": [
        "ethics review",
        "protected dissent"
      ],
      "termInfo": {
        "ethics review": {
          "text": "A structured examination of foreseeable impacts, stakeholder interests, conflicts, alternatives, and safeguards before or during deployment.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "incentive redesign": {
          "text": "Changing targets, rewards, evaluation criteria, and decision rights so that protecting users is not punished as failure to optimize.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        },
        "autonomy testing": {
          "text": "A proposed design practice that tests whether people can understand, refuse, revise, and exit a choice without misleading pressure or disproportionate friction.",
          "links": [
            {
              "href": "https://www.ftc.gov/reports/bringing-dark-patterns-light"
            }
          ]
        },
        "complaint escalation": {
          "text": "A process that treats recurring objections and harms as evidence requiring review by people with authority to change the product or policy.",
          "links": [
            {
              "href": "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement"
            }
          ]
        },
        "protected dissent": {
          "text": "Credible permission and protection for workers to question, refuse, or escalate practices that conflict with professional or public responsibilities.",
          "links": [
            {
              "href": "https://www.acm.org/code-of-ethics"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://www.acm.org/code-of-ethics",
            "label": "ACM Code of Ethics"
          },
          {
            "href": "https://www.ftc.gov/reports/bringing-dark-patterns-light",
            "label": "FTC dark-patterns report"
          }
        ]
      }
    },
    {
      "id": "public-accountability",
      "name": "Public accountability",
      "color": "magenta",
      "fact": "Public institutions establish minimum protections through enforcement, disclosure requirements, fair cancellation expectations, legislation, and independent oversight when voluntary or internal safeguards prove inadequate.",
      "terms": [
        "FTC enforcement",
        "clear disclosure",
        "cancellation parity",
        "statutory protection",
        "independent oversight"
      ],
      "seeds": [
        "FTC enforcement",
        "clear disclosure"
      ],
      "termInfo": {
        "FTC enforcement": {
          "text": "Investigation and legal action by the Federal Trade Commission against practices within its authority that are unfair, deceptive, or otherwise unlawful.",
          "links": [
            {
              "href": "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement"
            }
          ]
        },
        "clear disclosure": {
          "text": "Presentation of material terms in language, timing, and visual form that people can reasonably notice and understand before committing.",
          "links": [
            {
              "href": "https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule"
            }
          ]
        },
        "cancellation parity": {
          "text": "A policy and design principle that ending a recurring relationship should not be made substantially more difficult than entering it.",
          "links": [
            {
              "href": "https://www.ftc.gov/policy/public-comments/rule-concerning-use-prenotification-negative-option-plans-2"
            }
          ]
        },
        "statutory protection": {
          "text": "Rights, duties, remedies, and enforcement powers established through legislation rather than left solely to voluntary practice.",
          "links": [
            {
              "href": "https://www.ftc.gov/legal-library/browse/statutes"
            }
          ]
        },
        "independent oversight": {
          "text": "Review by institutions outside the immediate product and incentive chain, such as regulators, courts, auditors, or consumer-protection bodies.",
          "links": [
            {
              "href": "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection"
            }
          ]
        }
      },
      "info": {
        "text": "The FTC continues to use enforcement and rulemaking processes to address unfair or deceptive negative-option practices, including difficult cancellation and inadequate consent or disclosure.",
        "links": [
          {
            "href": "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule",
            "label": "FTC negative-option rule"
          },
          {
            "href": "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement",
            "label": "FTC enforcement"
          },
          {
            "href": "https://www.ftc.gov/legal-library/browse/statutes",
            "label": "FTC-administered statutes"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "professional-obligation",
      "term": "professional obligation",
      "clusters": [
        0,
        2
      ],
      "fact": "Professional commitments become effective when they shape organizational review, incentives, testing, escalation, and the authority to refuse or revise harmful designs.",
      "info": {
        "text": "The movement from ethical principle to concrete professional and organizational action.",
        "links": [
          {
            "href": "https://www.acm.org/code-of-ethics"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "impact and risk evaluation",
        "ethics review"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "institutionalized-restraint",
      "term": "institutionalized restraint",
      "clusters": [
        1,
        2
      ],
      "fact": "Ethical education has durable effect when organizations supply procedures, incentives, authority, and protection that allow trained judgment to influence real decisions.",
      "info": {
        "text": "Restraint made repeatable and supported through organizational structures rather than left to isolated individual courage.",
        "links": [
          {
            "href": "https://www.aacsb.edu/educators/global-standards"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "professional identity",
        "protected dissent"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "enforceable-floor",
      "term": "enforceable floor",
      "clusters": [
        3,
        2
      ],
      "fact": "Law, regulation, and external oversight establish minimum expectations that organizations must translate into policies, review processes, escalation routes, and product requirements.",
      "info": {
        "text": "A minimum level of protection that does not depend solely on voluntary ethics or internal business judgment.",
        "links": [
          {
            "href": "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "statutory protection",
        "ethics review"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "acm-code-in-practice",
      "prompt": "Which concepts translate the ACM Code of Ethics into responsibilities relevant to dark patterns?",
      "explanation": "The ACM Code asks computing professionals to consider the public good, avoid harm, act honestly, respect privacy, and evaluate systems and their impacts thoroughly. Professional obligation connects those commitments to concrete organizational practices rather than leaving them as personal aspirations.",
      "targets": [
        "public good",
        "avoid harm",
        "honesty and trustworthiness",
        "respect for privacy",
        "impact and risk evaluation",
        "professional obligation"
      ],
      "reasons": {
        "public good": "The interests of people affected by a system belong inside the definition of professional success.",
        "avoid harm": "Manipulative design can impose financial, psychological, privacy, time, and autonomy harms even when it improves a business metric.",
        "honesty and trustworthiness": "Interfaces should represent choices, prices, consequences, and conditions without concealment or strategic ambiguity.",
        "respect for privacy": "Consent and data collection should not be obtained through coercion, obstruction, or misleading defaults.",
        "impact and risk evaluation": "Professionals should assess foreseeable effects on users and society before and after deployment.",
        "professional obligation": "Ethical commitments must shape review, escalation, and design decisions within the organization."
      }
    },
    {
      "id": "ethics-before-launch",
      "prompt": "Which concepts help ethical judgment affect a product before manipulative design becomes routine?",
      "explanation": "Ethics becomes preventive when people learn to recognize recurring conflicts, examine who bears costs and benefits, test whether choices remain understandable and voluntary, and have protected channels for raising concerns before launch. Institutionalized restraint turns that judgment into repeatable organizational practice.",
      "targets": [
        "stakeholder analysis",
        "case-based reasoning",
        "ethics review",
        "autonomy testing",
        "protected dissent",
        "institutionalized restraint"
      ],
      "reasons": {
        "stakeholder analysis": "It identifies affected people whose interests may be absent from the chosen performance metric.",
        "case-based reasoning": "Concrete cases help professionals recognize recurring mechanisms, rationalizations, and consequences.",
        "ethics review": "A structured checkpoint can surface concerns before a design becomes an operational default.",
        "autonomy testing": "Testing asks whether people can understand, refuse, revise, or exit without disproportionate pressure or friction.",
        "protected dissent": "Workers need credible protection when professional judgment conflicts with an assigned target or approved design.",
        "institutionalized restraint": "Education matters most when organizations give ethical judgment procedures, authority, and durable support."
      }
    },
    {
      "id": "regulatory-backstop",
      "prompt": "Which concepts form the public accountability backstop when voluntary safeguards fail?",
      "explanation": "Public accountability supplies a minimum enforceable floor where market incentives or internal safeguards are insufficient. Enforcement, disclosure duties, fair cancellation, legislation, and independent review can deter practices, provide remedies, and make basic protections less dependent on voluntary restraint.",
      "targets": [
        "FTC enforcement",
        "clear disclosure",
        "cancellation parity",
        "statutory protection",
        "independent oversight",
        "enforceable floor"
      ],
      "reasons": {
        "FTC enforcement": "The agency can investigate and act against unfair or deceptive practices under its legal authorities.",
        "clear disclosure": "Material terms should be presented plainly and before a person is committed or charged.",
        "cancellation parity": "Ending a service should not be made substantially harder than entering it through avoidable procedural friction.",
        "statutory protection": "Legislatures can establish rights, duties, remedies, and enforcement authority beyond voluntary codes.",
        "independent oversight": "External review reduces reliance on the organization judging its own incentives and conduct.",
        "enforceable floor": "Law and regulation establish minimum protections even where professional or organizational ethics fail."
      }
    },
    {
      "id": "complementary-layers",
      "prompt": "Which concepts show why no single remedy can restore honest choice by itself?",
      "explanation": "Honest choice depends on reinforcing layers. Ethical commitments orient judgment; education shapes professional identity; incentive redesign changes what organizations reward; professional obligation turns values into action; and enforcement supplies a floor when internal restraint fails. Removing any layer leaves predictable gaps for the others to carry.",
      "targets": [
        "public good",
        "professional identity",
        "incentive redesign",
        "FTC enforcement",
        "professional obligation",
        "enforceable floor"
      ],
      "reasons": {
        "public good": "A substantive ethical aim is needed to judge whether optimization serves or exploits affected people.",
        "professional identity": "People must understand ethical judgment as part of competent professional practice, not an optional personal concern.",
        "incentive redesign": "Workers cannot reliably protect users when rewards and penalties consistently favor manipulation.",
        "FTC enforcement": "External authority is needed where firms ignore harms, complaints, or voluntary commitments.",
        "professional obligation": "Values require a pathway into actual product and governance decisions.",
        "enforceable floor": "Minimum protections cannot depend entirely on the goodwill or courage of individual actors."
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
      "puzzleId": "restoring-honest-choice",
      "puzzleRevision": "fnv1a32:1da4fa85",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:public good": {
          "x": 734.79,
          "y": 162.08,
          "pinned": false
        },
        "term:avoid harm": {
          "x": 688.44,
          "y": 44.25,
          "pinned": false
        },
        "term:honesty and trustworthiness": {
          "x": 852.95,
          "y": 43.13,
          "pinned": false
        },
        "term:respect for privacy": {
          "x": 860,
          "y": 235.9,
          "pinned": false
        },
        "term:impact and risk evaluation": {
          "x": 570.44,
          "y": 154.35,
          "pinned": false
        },
        "term:business ethics": {
          "x": 221.66,
          "y": 377.06,
          "pinned": false
        },
        "term:computing ethics": {
          "x": 100.52,
          "y": 457.95,
          "pinned": false
        },
        "term:stakeholder analysis": {
          "x": 85,
          "y": 297.31,
          "pinned": false
        },
        "term:case-based reasoning": {
          "x": 242.95,
          "y": 533.86,
          "pinned": false
        },
        "term:professional identity": {
          "x": 377.57,
          "y": 418.72,
          "pinned": false
        },
        "term:ethics review": {
          "x": 750.47,
          "y": 464.59,
          "pinned": false
        },
        "term:incentive redesign": {
          "x": 690.29,
          "y": 597,
          "pinned": false
        },
        "term:autonomy testing": {
          "x": 874.75,
          "y": 401.58,
          "pinned": false
        },
        "term:complaint escalation": {
          "x": 856.31,
          "y": 573.61,
          "pinned": false
        },
        "term:protected dissent": {
          "x": 607.98,
          "y": 462.07,
          "pinned": false
        },
        "term:FTC enforcement": {
          "x": 247.56,
          "y": 165.29,
          "pinned": false
        },
        "term:clear disclosure": {
          "x": 216.62,
          "y": 23,
          "pinned": false
        },
        "term:cancellation parity": {
          "x": 97.3,
          "y": 126.9,
          "pinned": false
        },
        "term:statutory protection": {
          "x": 386.08,
          "y": 241.78,
          "pinned": false
        },
        "term:independent oversight": {
          "x": 375.71,
          "y": 64.95,
          "pinned": false
        },
        "term:professional obligation": {
          "x": 696.75,
          "y": 312.42,
          "pinned": false
        },
        "term:institutionalized restraint": {
          "x": 474.68,
          "y": 592.64,
          "pinned": false
        },
        "term:enforceable floor": {
          "x": 523.83,
          "y": 331.78,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4178.32,
        "score": 4178.319061775205
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:15.780Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "restoring-honest-choice",
      "puzzleRevision": "fnv1a32:1da4fa85",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 819.48,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 571.2,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 224.8,
          "pinned": false
        },
        "cluster:3": {
          "x": 230.52,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:professional obligation": {
          "x": 768.41,
          "y": 215.23,
          "pinned": false
        },
        "term:institutionalized restraint": {
          "x": 525,
          "y": 398,
          "pinned": false
        },
        "term:enforceable floor": {
          "x": 281.59,
          "y": 215.23,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "public good",
          "avoid harm",
          "honesty and trustworthiness",
          "respect for privacy",
          "impact and risk evaluation"
        ],
        "cluster:1": [
          "business ethics",
          "computing ethics",
          "stakeholder analysis",
          "case-based reasoning",
          "professional identity"
        ],
        "cluster:2": [
          "ethics review",
          "incentive redesign",
          "autonomy testing",
          "complaint escalation",
          "protected dissent"
        ],
        "cluster:3": [
          "FTC enforcement",
          "clear disclosure",
          "cancellation parity",
          "statutory protection",
          "independent oversight"
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
        "totalLength": 334.75982978449224
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:17.843Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "restoring-honest-choice",
      "puzzleRevision": "fnv1a32:1da4fa85",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:public good": {
          "x": 194.17,
          "y": 127.11
        },
        "term:avoid harm": {
          "x": 283.01,
          "y": 173.09
        },
        "term:honesty and trustworthiness": {
          "x": 447.56,
          "y": 162.9
        },
        "term:respect for privacy": {
          "x": 109.94,
          "y": 22
        },
        "term:impact and risk evaluation": {
          "x": 525.75,
          "y": 22
        },
        "term:business ethics": {
          "x": 892.75,
          "y": 505.88
        },
        "term:computing ethics": {
          "x": 634.74,
          "y": 154.16
        },
        "term:stakeholder analysis": {
          "x": 713.09,
          "y": 22
        },
        "term:case-based reasoning": {
          "x": 877,
          "y": 22
        },
        "term:professional identity": {
          "x": 703.63,
          "y": 208.35
        },
        "term:ethics review": {
          "x": 487.67,
          "y": 345.09
        },
        "term:incentive redesign": {
          "x": 602.04,
          "y": 598
        },
        "term:autonomy testing": {
          "x": 811.58,
          "y": 598
        },
        "term:complaint escalation": {
          "x": 434.09,
          "y": 598
        },
        "term:protected dissent": {
          "x": 753.42,
          "y": 500.04
        },
        "term:FTC enforcement": {
          "x": 239.17,
          "y": 598
        },
        "term:clear disclosure": {
          "x": 202.08,
          "y": 262.45
        },
        "term:cancellation parity": {
          "x": 79.85,
          "y": 174.43
        },
        "term:statutory protection": {
          "x": 295.35,
          "y": 406.26
        },
        "term:independent oversight": {
          "x": 86.15,
          "y": 488.79
        },
        "term:professional obligation": {
          "x": 582.17,
          "y": 274.58
        },
        "term:institutionalized restraint": {
          "x": 687.05,
          "y": 330.12
        },
        "term:enforceable floor": {
          "x": 351.52,
          "y": 515.15
        },
        "cluster:0": {
          "x": 304.76,
          "y": 22
        },
        "cluster:1": {
          "x": 817.42,
          "y": 166.68
        },
        "cluster:2": {
          "x": 519.7,
          "y": 461.5
        },
        "cluster:3": {
          "x": 192.99,
          "y": 446.56
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:38:19.736Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:38:13.846Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
