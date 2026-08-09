// Concept Clusters puzzle: Branches of philosophy
// Category: Philosophy
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "philosophy-branches",
  "title": "Branches of philosophy",
  "category": "Philosophy",
  "large": true,
  "clusters": [
    {
      "name": "Epistemology",
      "info": {
        "text": "The branch of philosophy concerned with what separates a well-grounded claim from a mere opinion, and what it takes to be warranted in accepting something as true.",
        "link": "wiki:Epistemology"
      },
      "color": "teal",
      "fact": "Epistemology studies what knowledge is and what justifies believing something is true.",
      "terms": [
        "justified belief",
        "skepticism",
        "knowledge",
        "evidence"
      ],
      "seeds": [
        "justified belief",
        "skepticism"
      ],
      "termInfo": {
        "justified belief": {
          "text": "The traditional core requirement for knowledge: a belief must not just be true, but backed by adequate reasons or evidence.",
          "link": "wiki:Justification (epistemology)"
        },
        "skepticism": {
          "link": "wiki:Skepticism"
        },
        "knowledge": {
          "link": "wiki:Knowledge"
        },
        "evidence": {
          "link": "wiki:Evidence"
        }
      }
    },
    {
      "name": "Ethics",
      "info": {
        "text": "The branch of philosophy concerned with how to distinguish right conduct from wrong, and what standards should guide the choices people make.",
        "link": "wiki:Ethics"
      },
      "color": "blue",
      "fact": "Ethics asks what makes an action right or wrong, and what we owe to one another.",
      "terms": [
        "virtue",
        "duty",
        "consequences",
        "moral agent"
      ],
      "seeds": [
        "virtue",
        "duty"
      ],
      "termInfo": {
        "virtue": {
          "link": "wiki:Virtue"
        },
        "duty": {
          "link": "wiki:Duty"
        },
        "consequences": {
          "text": "The ethical view that an action's rightness depends only on its outcomes, not the intentions or rules behind it.",
          "link": "wiki:Consequentialism"
        },
        "moral agent": {
          "link": "wiki:Moral agency"
        }
      }
    },
    {
      "name": "Metaphysics",
      "info": {
        "text": "The branch of philosophy concerned with the ultimate nature of reality: what fundamentally exists, and how the world's most basic building blocks relate to and affect one another.",
        "link": "wiki:Metaphysics"
      },
      "color": "amber",
      "fact": "Metaphysics studies the fundamental nature of reality — what exists, and what it means for one thing to cause another.",
      "terms": [
        "being",
        "causation",
        "identity",
        "substance"
      ],
      "seeds": [
        "being",
        "causation"
      ],
      "termInfo": {
        "being": {
          "link": "wiki:Existence"
        },
        "causation": {
          "text": "The relationship between cause and effect — what it means for one event to bring about another.",
          "link": "wiki:Causality"
        },
        "identity": {
          "text": "What makes a thing the same thing over time, even as it changes.",
          "link": "wiki:Identity (philosophy)"
        },
        "substance": {
          "text": "The idea that beneath a thing's changing properties there's an underlying \"stuff\" that persists and bears them.",
          "link": "wiki:Substance theory"
        }
      }
    },
    {
      "name": "Logic",
      "info": {
        "text": "The branch of philosophy concerned with the structure of good reasoning — what makes a conclusion genuinely follow from the statements that precede it.",
        "link": "wiki:Logic"
      },
      "color": "magenta",
      "fact": "Logic studies what makes an argument valid — whether its conclusion truly follows from its premises.",
      "terms": [
        "validity",
        "syllogism",
        "inference",
        "soundness"
      ],
      "seeds": [
        "validity",
        "syllogism"
      ],
      "termInfo": {
        "validity": {
          "text": "An argument is valid when its conclusion truly follows from its premises — regardless of whether the premises are actually true.",
          "link": "wiki:Validity (logic)"
        },
        "syllogism": {
          "text": "A logical argument with two premises and a conclusion that necessarily follows — the classic form: \"All men are mortal; Socrates is a man; therefore Socrates is mortal.\"",
          "link": "wiki:Syllogism"
        },
        "inference": {
          "link": "wiki:Inference"
        },
        "soundness": {
          "link": "wiki:Soundness"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "free will",
      "clusters": [
        1,
        2
      ],
      "fact": "Free will bridges the two: ethics presupposes that moral agents could have done otherwise, which is itself a metaphysical claim about whether the universe allows genuine choice.",
      "idealTerms": [
        "moral agent",
        "causation"
      ],
      "info": {
        "link": "wiki:Free will"
      }
    },
    {
      "term": "truth",
      "clusters": [
        0,
        3
      ],
      "relationKind": "cross-cutting",
      "fact": "Truth bridges the two: epistemology asks what justifies believing a claim is true, while logic studies what makes an argument's conclusion follow validly, regardless of whether its premises happen to be true.",
      "idealTerms": [
        "knowledge",
        "soundness"
      ],
      "info": {
        "link": "wiki:Truth"
      }
    },
    {
      "term": "necessity",
      "clusters": [
        2,
        3
      ],
      "relationKind": "cross-cutting",
      "fact": "Necessity bridges the two: logic studies which conclusions must follow given their premises, while metaphysics asks which truths about reality itself could not have been otherwise.",
      "idealTerms": [
        null,
        "validity"
      ],
      "info": {
        "text": "A truth that couldn't have been otherwise, in any possible circumstance — as opposed to one that just happens to be true.",
        "link": "wiki:Metaphysical necessity"
      }
    }
  ]
};
