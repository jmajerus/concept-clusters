// Generated from content/puzzles/when-systems-stop-seeing-people.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "when-systems-stop-seeing-people",
  "title": "When systems stop seeing people",
  "category": "history-society",
  "large": true,
  "info": {
    "text": "How administrative representations, institutional roles, and procedural routines can obscure human consequences—and how corrective capacity restores judgment.",
    "links": [
      {
        "href": "wiki:Dehumanization"
      }
    ]
  },
  "clusters": [
    {
      "id": "administrative-abstraction",
      "name": "Administrative abstraction",
      "color": "teal",
      "fact": "Administrative representations make large systems manageable, but they become dehumanizing when the representation is mistaken for the person and omitted circumstances no longer matter.",
      "terms": [
        "case number",
        "eligibility category",
        "performance metric",
        "population aggregate"
      ],
      "seeds": [
        "case number",
        "performance metric"
      ],
      "termInfo": {
        "case number": {
          "text": "An identifier that lets an institution track a matter without repeatedly naming or describing the people involved.",
          "links": [
            {
              "href": "wiki:Unique identifier"
            }
          ]
        },
        "eligibility category": {
          "text": "A classification used to decide who qualifies for a benefit, service, status, or process.",
          "links": [
            {
              "href": "wiki:Administrative law"
            }
          ]
        },
        "performance metric": {
          "text": "A selected quantitative measure used to evaluate activity, output, or success.",
          "links": [
            {
              "href": "wiki:Performance indicator"
            }
          ]
        },
        "population aggregate": {
          "text": "A summary measure describing a group rather than the distinct circumstances of its members.",
          "links": [
            {
              "href": "wiki:Aggregate data"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Abstraction"
          }
        ]
      }
    },
    {
      "id": "role-insulation",
      "name": "Role insulation",
      "color": "blue",
      "fact": "Institutional roles coordinate complex work, but they can also insulate participants from the full consequences of what the organization does.",
      "terms": [
        "assigned duty",
        "chain of command",
        "divided responsibility",
        "professional detachment"
      ],
      "seeds": [
        "assigned duty",
        "chain of command"
      ],
      "termInfo": {
        "assigned duty": {
          "text": "A task understood primarily as an obligation attached to one's position.",
          "links": [
            {
              "href": "wiki:Role theory"
            }
          ]
        },
        "chain of command": {
          "text": "A hierarchy that assigns authority and channels instructions through successive levels.",
          "links": [
            {
              "href": "wiki:Chain of command"
            }
          ]
        },
        "divided responsibility": {
          "text": "A distribution of tasks in which each participant performs only part of the action producing the final outcome.",
          "links": [
            {
              "href": "wiki:Diffusion of responsibility"
            }
          ]
        },
        "professional detachment": {
          "text": "Emotional distance cultivated to support consistent performance, which can become moral distance when treated as indifference.",
          "links": [
            {
              "href": "wiki:Professional ethics"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Role theory"
          }
        ]
      }
    },
    {
      "id": "procedural-dominance",
      "name": "Procedural dominance",
      "color": "amber",
      "fact": "Procedure becomes dominant when completing the approved process substitutes for judging whether the result is humane, proportionate, and justified.",
      "terms": [
        "rule compliance",
        "checklist completion",
        "standardized treatment",
        "documentation requirement"
      ],
      "seeds": [
        "rule compliance",
        "checklist completion"
      ],
      "termInfo": {
        "rule compliance": {
          "text": "Conformity with an established instruction or requirement.",
          "links": [
            {
              "href": "wiki:Regulatory compliance"
            }
          ]
        },
        "checklist completion": {
          "text": "Verification that a predefined series of required steps or items has been addressed.",
          "links": [
            {
              "href": "wiki:Checklist"
            }
          ]
        },
        "standardized treatment": {
          "text": "A uniform response applied according to a common protocol rather than individually redesigned each time.",
          "links": [
            {
              "href": "wiki:Standardization"
            }
          ]
        },
        "documentation requirement": {
          "text": "A rule requiring actions, facts, or decisions to be recorded in a specified form.",
          "links": [
            {
              "href": "wiki:Documentation"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Bureaucracy"
          }
        ]
      }
    },
    {
      "id": "corrective-capacity",
      "name": "Corrective capacity",
      "color": "magenta",
      "fact": "A corrigible institution can receive evidence of harm, protect challenge, reconsider a decision, and change practice rather than defending the first result at all costs.",
      "terms": [
        "appeal process",
        "protected dissent",
        "discretionary review",
        "feedback loop"
      ],
      "seeds": [
        "appeal process",
        "feedback loop"
      ],
      "termInfo": {
        "appeal process": {
          "text": "A formal route for asking that a decision be reconsidered by another authority.",
          "links": [
            {
              "href": "wiki:Appeal"
            }
          ]
        },
        "protected dissent": {
          "text": "Safeguards that allow people to question policy, report wrongdoing, or disagree without retaliation.",
          "links": [
            {
              "href": "wiki:Dissent"
            }
          ]
        },
        "discretionary review": {
          "text": "Case-specific reconsideration that permits judgment rather than automatic application of a general rule.",
          "links": [
            {
              "href": "wiki:Discretion"
            }
          ]
        },
        "feedback loop": {
          "text": "A process in which information about consequences is returned to influence later decisions or behavior.",
          "links": [
            {
              "href": "wiki:Feedback"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Accountability"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "moral-distance",
      "term": "moral distance",
      "clusters": [
        0,
        1
      ],
      "fact": "Administrative abstraction and role insulation can jointly create moral distance: the person appears as a representation, while no participant remains close to the whole human consequence.",
      "info": {
        "text": "Distance from the people and consequences affected by one's decisions or actions.",
        "links": [
          {
            "href": "wiki:Moral disengagement"
          }
        ]
      },
      "conceptId": "moral-distance",
      "relationKind": "dynamic",
      "idealTerms": [
        "population aggregate",
        "professional detachment"
      ]
    },
    {
      "id": "proceduralized-moral-abdication",
      "term": "proceduralized moral abdication",
      "clusters": [
        1,
        2
      ],
      "fact": "Role insulation becomes proceduralized moral abdication when participants treat assigned duties and approved procedures as substitutes for their own responsibility to judge foreseeable harm.",
      "info": {
        "text": "The displacement of moral judgment onto roles, rules, or processes that still depend on human choices.",
        "links": [
          {
            "href": "wiki:Moral responsibility"
          }
        ]
      },
      "conceptId": "proceduralized-moral-abdication",
      "relationKind": "dynamic",
      "idealTerms": [
        "divided responsibility",
        "rule compliance"
      ]
    },
    {
      "id": "accountability",
      "term": "accountability",
      "clusters": [
        2,
        3
      ],
      "fact": "Accountability connects procedure with correction by asking both whether the process was followed and whether its outcome was justified, reviewable, and repaired when necessary.",
      "info": {
        "text": "An obligation to explain decisions, answer for consequences, and participate in correction.",
        "links": [
          {
            "href": "wiki:Accountability"
          }
        ]
      },
      "conceptId": "accountability",
      "relationKind": "evaluation",
      "idealTerms": [
        "documentation requirement",
        "discretionary review"
      ]
    }
  ],
  "lenses": [
    {
      "id": "standardization-and-abstraction",
      "prompt": "Which concepts can replace particular circumstances with standardized representations or responses?",
      "explanation": "Institutions need categories and standards, but those tools can hide relevant differences when the representation or routine is treated as the whole person or situation.",
      "label": "Standardization and abstraction",
      "definition": "Particular people or circumstances are represented through categories, measures, or uniform procedures.",
      "targets": [
        "eligibility category",
        "performance metric",
        "population aggregate",
        "checklist completion",
        "standardized treatment"
      ],
      "reasons": {
        "eligibility category": "A category sorts people according to predefined criteria rather than their full circumstances.",
        "performance metric": "A metric compresses complex activity into a selected measure.",
        "population aggregate": "An aggregate describes a group statistically while omitting individual variation.",
        "checklist completion": "A checklist standardizes attention around predetermined items.",
        "standardized treatment": "A common response can disregard circumstances that call for adaptation."
      }
    },
    {
      "id": "displaced-responsibility",
      "prompt": "Which concepts can distance an actor from personal responsibility for an outcome?",
      "explanation": "Responsibility becomes harder to locate when authority is layered, tasks are divided, detachment is valorized, and following procedure is treated as sufficient justification.",
      "label": "Displaced responsibility",
      "definition": "Personal judgment is distanced or shifted onto roles, rules, hierarchies, or divided tasks.",
      "targets": [
        "chain of command",
        "divided responsibility",
        "professional detachment",
        "rule compliance",
        "proceduralized moral abdication"
      ],
      "reasons": {
        "chain of command": "An actor may defer judgment upward to authorized superiors.",
        "divided responsibility": "No single participant experiences the whole outcome as their own action.",
        "professional detachment": "Emotional distance can become distance from moral consequence.",
        "rule compliance": "Following a rule may be offered as a complete defense of the result.",
        "proceduralized moral abdication": "The process itself is made to carry responsibility that still belongs to human agents."
      }
    },
    {
      "id": "institutional-corrigibility",
      "prompt": "Which concepts help an institution detect harm, reconsider a decision, and change course?",
      "explanation": "A corrigible institution needs channels for challenge, protected truth-telling, authority to reconsider exceptional cases, feedback about consequences, and responsibility for repair.",
      "label": "Institutional corrigibility",
      "definition": "An institution can receive challenge, reconsider decisions, and respond to harmful consequences.",
      "targets": [
        "appeal process",
        "protected dissent",
        "discretionary review",
        "feedback loop",
        "accountability"
      ],
      "reasons": {
        "appeal process": "An affected person can ask another decision-maker to review the original result.",
        "protected dissent": "People can report error or harm without retaliation.",
        "discretionary review": "A reviewer can examine whether a general rule fits a particular case.",
        "feedback loop": "Consequences return as information that can alter future action.",
        "accountability": "Decision-makers must answer for outcomes and participate in correction."
      }
    }
  ],
  "lensMode": "assignment",
  "relatedPuzzles": {
    "info": {
      "text": "Continue from institutional mechanisms to the broader diagnostic framework and its restorative alternatives."
    },
    "entries": [
      {
        "id": "distortion-and-magnification",
        "reason": "Place institutional blindness within a wider framework of distorted judgment and social magnification.",
        "via": [
          "institutional magnification",
          "moral distance"
        ]
      },
      {
        "id": "restorative-patterns",
        "reason": "Explore practices that preserve recognition, review, restraint, and repair.",
        "via": [
          "accountability",
          "corrective capacity"
        ]
      }
    ]
  }
});
