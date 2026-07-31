// Concept Clusters puzzle: When systems stop seeing people
// Manuscript-derived catalogue: The Struggle Against Dehumanization

export default {
  "id": "when-systems-stop-seeing-people",
  "title": "When systems stop seeing people",
  "category": "History & Society",
  "large": true,
  "info": {
    "text": "How administrative representations, institutional roles, and procedural routines can obscure human consequences—and how corrective capacity restores judgment.",
    "link": "wiki:Dehumanization"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Continue from institutional mechanisms to the broader diagnostic framework and its restorative alternatives."
    },
    "entries": [
      {
        "id": "distortion-and-magnification",
        "via": ["institutional magnification", "moral distance"],
        "reason": "Place institutional blindness within a wider framework of distorted judgment and social magnification."
      },
      {
        "id": "restorative-patterns",
        "via": ["accountability", "corrective capacity"],
        "reason": "Explore practices that preserve recognition, review, restraint, and repair."
      }
    ]
  },
  "lenses": [
    {
      "id": "standardization-and-abstraction",
      "prompt": "Which concepts can replace particular circumstances with standardized representations or responses?",
      "targets": ["eligibility category", "performance metric", "population aggregate", "checklist completion", "standardized treatment"],
      "explanation": "Institutions need categories and standards, but those tools can hide relevant differences when the representation or routine is treated as the whole person or situation.",
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
      "targets": ["chain of command", "divided responsibility", "professional detachment", "rule compliance", "proceduralized moral abdication"],
      "explanation": "Responsibility becomes harder to locate when authority is layered, tasks are divided, detachment is valorized, and following procedure is treated as sufficient justification.",
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
      "targets": ["appeal process", "protected dissent", "discretionary review", "feedback loop", "accountability"],
      "explanation": "A corrigible institution needs channels for challenge, protected truth-telling, authority to reconsider exceptional cases, feedback about consequences, and responsibility for repair.",
      "reasons": {
        "appeal process": "An affected person can ask another decision-maker to review the original result.",
        "protected dissent": "People can report error or harm without retaliation.",
        "discretionary review": "A reviewer can examine whether a general rule fits a particular case.",
        "feedback loop": "Consequences return as information that can alter future action.",
        "accountability": "Decision-makers must answer for outcomes and participate in correction."
      }
    }
  ],
  "clusters": [
    {
      "name": "Administrative abstraction",
      "color": "teal",
      "fact": "Administrative representations make large systems manageable, but they become dehumanizing when the representation is mistaken for the person and omitted circumstances no longer matter.",
      "terms": ["case number", "eligibility category", "performance metric", "population aggregate"],
      "seeds": ["case number", "performance metric"],
      "termInfo": {
        "case number": {"text": "An identifier that lets an institution track a matter without repeatedly naming or describing the people involved.", "link": "wiki:Unique identifier"},
        "eligibility category": {"text": "A classification used to decide who qualifies for a benefit, service, status, or process.", "link": "wiki:Administrative law"},
        "performance metric": {"text": "A selected quantitative measure used to evaluate activity, output, or success.", "link": "wiki:Performance indicator"},
        "population aggregate": {"text": "A summary measure describing a group rather than the distinct circumstances of its members.", "link": "wiki:Aggregate data"}
      },
      "info": {"link": "wiki:Abstraction"}
    },
    {
      "name": "Role insulation",
      "color": "blue",
      "fact": "Institutional roles coordinate complex work, but they can also insulate participants from the full consequences of what the organization does.",
      "terms": ["assigned duty", "chain of command", "divided responsibility", "professional detachment"],
      "seeds": ["assigned duty", "chain of command"],
      "termInfo": {
        "assigned duty": {"text": "A task understood primarily as an obligation attached to one's position.", "link": "wiki:Role theory"},
        "chain of command": {"text": "A hierarchy that assigns authority and channels instructions through successive levels.", "link": "wiki:Chain of command"},
        "divided responsibility": {"text": "A distribution of tasks in which each participant performs only part of the action producing the final outcome.", "link": "wiki:Diffusion of responsibility"},
        "professional detachment": {"text": "Emotional distance cultivated to support consistent performance, which can become moral distance when treated as indifference.", "link": "wiki:Professional ethics"}
      },
      "info": {"link": "wiki:Role theory"}
    },
    {
      "name": "Procedural dominance",
      "color": "amber",
      "fact": "Procedure becomes dominant when completing the approved process substitutes for judging whether the result is humane, proportionate, and justified.",
      "terms": ["rule compliance", "checklist completion", "standardized treatment", "documentation requirement"],
      "seeds": ["rule compliance", "checklist completion"],
      "termInfo": {
        "rule compliance": {"text": "Conformity with an established instruction or requirement.", "link": "wiki:Regulatory compliance"},
        "checklist completion": {"text": "Verification that a predefined series of required steps or items has been addressed.", "link": "wiki:Checklist"},
        "standardized treatment": {"text": "A uniform response applied according to a common protocol rather than individually redesigned each time.", "link": "wiki:Standardization"},
        "documentation requirement": {"text": "A rule requiring actions, facts, or decisions to be recorded in a specified form.", "link": "wiki:Documentation"}
      },
      "info": {"link": "wiki:Bureaucracy"}
    },
    {
      "name": "Corrective capacity",
      "color": "magenta",
      "fact": "A corrigible institution can receive evidence of harm, protect challenge, reconsider a decision, and change practice rather than defending the first result at all costs.",
      "terms": ["appeal process", "protected dissent", "discretionary review", "feedback loop"],
      "seeds": ["appeal process", "feedback loop"],
      "termInfo": {
        "appeal process": {"text": "A formal route for asking that a decision be reconsidered by another authority.", "link": "wiki:Appeal"},
        "protected dissent": {"text": "Safeguards that allow people to question policy, report wrongdoing, or disagree without retaliation.", "link": "wiki:Dissent"},
        "discretionary review": {"text": "Case-specific reconsideration that permits judgment rather than automatic application of a general rule.", "link": "wiki:Discretion"},
        "feedback loop": {"text": "A process in which information about consequences is returned to influence later decisions or behavior.", "link": "wiki:Feedback"}
      },
      "info": {"link": "wiki:Accountability"}
    }
  ],
  "bridges": [
    {
      "term": "moral distance",
      "conceptId": "moral-distance",
      "clusters": [0, 1],
      "relationKind": "dynamic",
      "fact": "Administrative abstraction and role insulation can jointly create moral distance: the person appears as a representation, while no participant remains close to the whole human consequence.",
      "idealTerms": ["population aggregate", "professional detachment"],
      "info": {"text": "Distance from the people and consequences affected by one's decisions or actions.", "link": "wiki:Moral disengagement"}
    },
    {
      "term": "proceduralized moral abdication",
      "conceptId": "proceduralized-moral-abdication",
      "clusters": [1, 2],
      "relationKind": "dynamic",
      "fact": "Role insulation becomes proceduralized moral abdication when participants treat assigned duties and approved procedures as substitutes for their own responsibility to judge foreseeable harm.",
      "idealTerms": ["divided responsibility", "rule compliance"],
      "info": {"text": "The displacement of moral judgment onto roles, rules, or processes that still depend on human choices.", "link": "wiki:Moral responsibility"}
    },
    {
      "term": "accountability",
      "conceptId": "accountability",
      "clusters": [2, 3],
      "relationKind": "evaluation",
      "fact": "Accountability connects procedure with correction by asking both whether the process was followed and whether its outcome was justified, reviewable, and repaired when necessary.",
      "idealTerms": ["documentation requirement", "discretionary review"],
      "info": {"text": "An obligation to explain decisions, answer for consequences, and participate in correction.", "link": "wiki:Accountability"}
    }
  ]
};