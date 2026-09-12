// Generated from content/puzzles/philosophy-branches.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "philosophy-branches",
  "title": "Branches of philosophy",
  "category": "philosophy",
  "large": true,
  "clusters": [
    {
      "id": "epistemology",
      "name": "Epistemology",
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
          "links": [
            {
              "href": "wiki:Justification (epistemology)"
            }
          ]
        },
        "skepticism": {
          "links": [
            {
              "href": "wiki:Skepticism"
            }
          ]
        },
        "knowledge": {
          "links": [
            {
              "href": "wiki:Knowledge"
            }
          ]
        },
        "evidence": {
          "links": [
            {
              "href": "wiki:Evidence"
            }
          ]
        }
      },
      "info": {
        "text": "The branch of philosophy concerned with what separates a well-grounded claim from a mere opinion, and what it takes to be warranted in accepting something as true.",
        "links": [
          {
            "href": "wiki:Epistemology"
          }
        ]
      }
    },
    {
      "id": "ethics",
      "name": "Ethics",
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
          "links": [
            {
              "href": "wiki:Virtue"
            }
          ]
        },
        "duty": {
          "links": [
            {
              "href": "wiki:Duty"
            }
          ]
        },
        "consequences": {
          "text": "The ethical view that an action's rightness depends only on its outcomes, not the intentions or rules behind it.",
          "links": [
            {
              "href": "wiki:Consequentialism"
            }
          ]
        },
        "moral agent": {
          "links": [
            {
              "href": "wiki:Moral agency"
            }
          ]
        }
      },
      "info": {
        "text": "The branch of philosophy concerned with how to distinguish right conduct from wrong, and what standards should guide the choices people make.",
        "links": [
          {
            "href": "wiki:Ethics"
          }
        ]
      }
    },
    {
      "id": "metaphysics",
      "name": "Metaphysics",
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
          "links": [
            {
              "href": "wiki:Existence"
            }
          ]
        },
        "causation": {
          "text": "The relationship between cause and effect — what it means for one event to bring about another.",
          "links": [
            {
              "href": "wiki:Causality"
            }
          ]
        },
        "identity": {
          "text": "What makes a thing the same thing over time, even as it changes.",
          "links": [
            {
              "href": "wiki:Identity (philosophy)"
            }
          ]
        },
        "substance": {
          "text": "The idea that beneath a thing's changing properties there's an underlying \"stuff\" that persists and bears them.",
          "links": [
            {
              "href": "wiki:Substance theory"
            }
          ]
        }
      },
      "info": {
        "text": "The branch of philosophy concerned with the ultimate nature of reality: what fundamentally exists, and how the world's most basic building blocks relate to and affect one another.",
        "links": [
          {
            "href": "wiki:Metaphysics"
          }
        ]
      }
    },
    {
      "id": "logic",
      "name": "Logic",
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
          "links": [
            {
              "href": "wiki:Validity (logic)"
            }
          ]
        },
        "syllogism": {
          "text": "A logical argument with two premises and a conclusion that necessarily follows — the classic form: \"All men are mortal; Socrates is a man; therefore Socrates is mortal.\"",
          "links": [
            {
              "href": "wiki:Syllogism"
            }
          ]
        },
        "inference": {
          "links": [
            {
              "href": "wiki:Inference"
            }
          ]
        },
        "soundness": {
          "links": [
            {
              "href": "wiki:Soundness"
            }
          ]
        }
      },
      "info": {
        "text": "The branch of philosophy concerned with the structure of good reasoning — what makes a conclusion genuinely follow from the statements that precede it.",
        "links": [
          {
            "href": "wiki:Logic"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "free-will",
      "term": "free will",
      "clusters": [
        1,
        2
      ],
      "fact": "Free will bridges the two: ethics presupposes that moral agents could have done otherwise, which is itself a metaphysical claim about whether the universe allows genuine choice.",
      "info": {
        "links": [
          {
            "href": "wiki:Free will"
          }
        ]
      },
      "idealTerms": [
        "moral agent",
        "causation"
      ]
    },
    {
      "id": "truth",
      "term": "truth",
      "clusters": [
        0,
        3
      ],
      "fact": "Truth bridges the two: epistemology asks what justifies believing a claim is true, while logic studies what makes an argument's conclusion follow validly, regardless of whether its premises happen to be true.",
      "info": {
        "links": [
          {
            "href": "wiki:Truth"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "knowledge",
        "soundness"
      ]
    },
    {
      "id": "necessity",
      "term": "necessity",
      "clusters": [
        2,
        3
      ],
      "fact": "Necessity bridges the two: logic studies which conclusions must follow given their premises, while metaphysics asks which truths about reality itself could not have been otherwise.",
      "info": {
        "text": "A truth that couldn't have been otherwise, in any possible circumstance — as opposed to one that just happens to be true.",
        "links": [
          {
            "href": "wiki:Metaphysical necessity"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        "validity"
      ]
    }
  ]
});
