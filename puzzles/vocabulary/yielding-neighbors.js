// Generated from content/puzzles/yielding-neighbors.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "yielding-neighbors",
  "title": "Learning to Yield",
  "category": "vocabulary",
  "puzzleKind": "vocabulary-context",
  "tags": [
    "synonyms",
    "usage",
    "adjectives"
  ],
  "level": "intermediate",
  "info": {
    "text": "Five near-synonyms for giving way, discriminated along the lines of Merriam-Webster's synonym notes: all describe willingness to yield, but each answers to something different — control, handling, suggestion, rules, or silence.",
    "links": [
      {
        "href": "https://www.merriam-webster.com/dictionary/tractable"
      },
      {
        "href": "https://www.merriam-webster.com/dictionary/docile"
      }
    ]
  },
  "clusters": [
    {
      "id": "learning-to-yield",
      "name": "Learning to Yield",
      "color": "teal",
      "fact": "All five adjectives describe willingness to yield to others. They differ in what the yielding answers to: docile submits readily to control or guidance; tractable has a character that permits easy handling or managing; amenable yields out of agreeableness or open-mindedness; compliant conforms to rules, requests, or standards; acquiescent accepts passively, without protest.",
      "terms": [
        "amenable",
        "acquiescent",
        "compliant",
        "docile",
        "tractable"
      ],
      "seeds": [
        "amenable",
        "acquiescent"
      ],
      "termInfo": {
        "acquiescent": "Accepting passively, without protest or objection; going along with what others decide rather than engaging with it.",
        "amenable": "Willing to yield or cooperate out of agreeableness or natural open-mindedness; open to suggestion, advice, or reason.",
        "compliant": "Ready to conform to rules, requests, or standards; yielding to requirements rather than to persuasion.",
        "docile": "Predisposed to submit readily to control or guidance; ready to be led or taught.",
        "tractable": "Having a character that permits easy handling or managing; uniquely also describes problems, materials, or situations that can be managed."
      },
      "info": "All five words describe yielding to others. Tell them apart by what the yielding answers to: guidance, handling, suggestion, rules, or simply the path of least resistance."
    }
  ],
  "bridges": [],
  "lenses": [
    {
      "id": "amenable-reason",
      "prompt": "Unlike his predecessor, the new chair was ____ to moving the deadline once the data team showed him the backlog.",
      "explanation": "Openness to reasons is amenable's boundary: the chair engages with the backlog evidence and moves the deadline. Compliant would point to conformity with a rule, acquiescent to passive caving without engagement, docile to submitting to control, and tractable to being easy to manage — none of which fits a chair persuaded by data.",
      "targets": [
        "amenable"
      ],
      "reasons": {
        "amenable": "Willingness to yield out of open-mindedness is exactly what the persuaded-by-evidence context tests."
      }
    },
    {
      "id": "acquiescent-silence",
      "prompt": "Nobody loved the seating plan, but the committee was ____ enough to let it stand rather than reopen the debate.",
      "explanation": "Acceptance without protest is acquiescent's home ground: nobody loves the plan, but no one reopens the debate. Amenable would imply engaged open-mindedness rather than mere going-along, compliant would need a rule or authority to conform to, docile a habit of submission, and tractable someone doing the managing.",
      "targets": [
        "acquiescent"
      ],
      "reasons": {
        "acquiescent": "Passive acceptance without protest is the distinction this going-along context activates."
      }
    },
    {
      "id": "compliant-rules",
      "prompt": "The startup stayed ____ with the data-retention rules even after the fines made headlines elsewhere.",
      "explanation": "Conformity to standing requirements is compliant's signature: the cue is the data-retention rules, which a company follows rather than debates. Acquiescent would need a decision being passively accepted, amenable a proposal on the table, docile a creature submitting to guidance, and tractable a situation being managed.",
      "targets": [
        "compliant"
      ],
      "reasons": {
        "compliant": "Ready conformity to rules and standards is compliant's discriminating clause."
      }
    },
    {
      "id": "tractable-dispute",
      "prompt": "Of the three inherited lawsuits, the licensing dispute was the most ____, settling in a single mediation.",
      "explanation": "Being easily managed is tractable's boundary, and it alone extends naturally to non-persons: the dispute settles in one mediation because it can be handled. Compliant would need rules to conform to, amenable an open mind the dispute does not have, docile a creature submitting to guidance, and acquiescent a passive acceptance no party offers.",
      "targets": [
        "tractable"
      ],
      "reasons": {
        "tractable": "A character or situation that permits easy handling is tractable's extended sense."
      }
    },
    {
      "id": "docile-reins",
      "prompt": "The riding school assigns beginners its most ____ ponies: animals that submit readily to an unsure hand on the reins.",
      "explanation": "Ready submission to guidance is docile's clause: the cue is the unsure hand on the reins, i.e. control being exercised gently. Tractable is the meaningful near-miss — the ponies are easy to handle — but the sentence foregrounds submitting to control, not manageability. Amenable would need open-mindedness, compliant rule-conformity, and acquiescent passive acceptance of a decision.",
      "targets": [
        "docile"
      ],
      "reasons": {
        "docile": "Predisposition to submit readily to control or guidance is exactly what the reins context tests."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": true,
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      }
    ]
  }
});
