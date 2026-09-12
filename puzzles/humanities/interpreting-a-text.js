// Generated from content/puzzles/interpreting-a-text.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "interpreting-a-text",
  "title": "Interpreting a text",
  "category": "humanities",
  "info": {
    "text": "Humanistic interpretation combines close attention to a text with knowledge of its setting and a reasoned argument about what it means.",
    "links": [
      {
        "href": "wiki:Literary criticism"
      }
    ]
  },
  "clusters": [
    {
      "id": "features-of-the-text",
      "name": "Features of the text",
      "color": "teal",
      "fact": "Interpretation begins with features that can be pointed to in the text itself: diction, imagery, structure, and recurring motifs.",
      "terms": [
        "diction",
        "imagery",
        "structure",
        "recurring motif"
      ],
      "seeds": [
        "diction",
        "imagery"
      ],
      "termInfo": {
        "diction": {
          "text": "A writer's choice of words, including their level of formality, connotations, sound, and associations.",
          "links": [
            {
              "href": "wiki:Diction"
            }
          ]
        },
        "imagery": {
          "text": "Language that evokes sensory experience or creates a vivid mental picture.",
          "links": [
            {
              "href": "wiki:Imagery"
            }
          ]
        },
        "structure": {
          "text": "The arrangement of parts—such as scenes, sections, chronology, or shifts in viewpoint—that shapes how a text unfolds.",
          "links": [
            {
              "href": "wiki:Narrative structure"
            }
          ]
        },
        "recurring motif": {
          "text": "An image, phrase, object, situation, or idea that returns across a work and helps develop its themes or mood.",
          "links": [
            {
              "href": "wiki:Motif (narrative)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Literary criticism"
          }
        ]
      }
    },
    {
      "id": "historical-and-cultural-context",
      "name": "Historical and cultural context",
      "color": "blue",
      "fact": "A text was produced within a particular historical setting, genre, authorship situation, and relationship to an expected audience.",
      "terms": [
        "historical setting",
        "genre",
        "authorship",
        "intended audience"
      ],
      "seeds": [
        "historical setting",
        "intended audience"
      ],
      "termInfo": {
        "historical setting": {
          "text": "The events, institutions, assumptions, and conditions surrounding the text's production and earliest reception.",
          "links": [
            {
              "href": "wiki:Historicism"
            }
          ]
        },
        "genre": {
          "text": "A recognized kind of work whose conventions shape what readers expect and how particular choices function.",
          "links": [
            {
              "href": "wiki:Literary genre"
            }
          ]
        },
        "authorship": {
          "text": "The circumstances of who created the text, including questions of identity, collaboration, attribution, and authorial role.",
          "links": [
            {
              "href": "wiki:Author"
            }
          ]
        },
        "intended audience": {
          "text": "The readers or listeners a work appears to address, whose knowledge and expectations may differ from those of later audiences.",
          "links": [
            {
              "href": "wiki:Audience"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Historicism"
          }
        ]
      }
    },
    {
      "id": "interpretive-argument",
      "name": "Interpretive argument",
      "color": "amber",
      "fact": "An interpretation becomes an argument when it states a thesis, supports it with textual evidence, explains its inferences, and addresses plausible alternatives.",
      "terms": [
        "thesis",
        "textual evidence",
        "inference",
        "counterreading"
      ],
      "seeds": [
        "thesis",
        "textual evidence"
      ],
      "termInfo": {
        "thesis": {
          "text": "The central interpretive claim an analysis asks the reader to accept.",
          "links": [
            {
              "href": "wiki:Thesis statement"
            }
          ]
        },
        "textual evidence": {
          "text": "Specific words, passages, patterns, or formal features cited to support an interpretation.",
          "links": [
            {
              "href": "wiki:Close reading"
            }
          ]
        },
        "inference": {
          "text": "A reasoned step from what the text shows to a conclusion about its meaning, effect, or significance.",
          "links": [
            {
              "href": "wiki:Inference"
            }
          ]
        },
        "counterreading": {
          "text": "A plausible alternative interpretation that tests whether an argument explains the evidence better than competing accounts.",
          "links": [
            {
              "href": "wiki:Literary criticism"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Argument"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "close-reading",
      "term": "close reading",
      "clusters": [
        0,
        2
      ],
      "fact": "Close reading turns details such as diction, imagery, and structure into evidence for an interpretive argument.",
      "info": {
        "text": "Careful, sustained attention to how a short passage's language and form produce meaning.",
        "links": [
          {
            "href": "wiki:Close reading"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "diction",
        "textual evidence"
      ]
    },
    {
      "id": "contextualization",
      "term": "contextualization",
      "clusters": [
        1,
        2
      ],
      "fact": "Contextualization tests an interpretation by relating the text to its historical setting, genre, authorship, and audience without replacing evidence from the text itself.",
      "info": {
        "text": "Placing a work within relevant historical and cultural circumstances so those circumstances can inform its interpretation.",
        "links": [
          {
            "href": "wiki:Historicism"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "historical setting",
        "thesis"
      ]
    }
  ],
  "lenses": [
    {
      "id": "direct-textual-evidence",
      "prompt": "Which concepts can function as evidence cited directly from the text?",
      "explanation": "Direct textual evidence includes the specific language and formal patterns a reader can point to, along with the practice of citing those observations as evidence.",
      "targets": [
        "diction",
        "imagery",
        "structure",
        "recurring motif",
        "textual evidence"
      ],
      "reasons": {
        "diction": "Particular word choices can be quoted and analyzed.",
        "imagery": "Sensory language is observable in the text itself.",
        "structure": "The order and arrangement of a text's parts provide formal evidence.",
        "recurring motif": "A repeated element becomes evidence when its recurrence can be demonstrated.",
        "textual evidence": "This is the broader category for details cited directly from the work."
      }
    },
    {
      "id": "support-and-test-claims",
      "prompt": "Which concepts name steps or components used to formulate, support, or test an interpretive claim?",
      "explanation": "An interpretive argument moves from a thesis through evidence and inference, while close reading and contextualization support it and counterreadings test its strength.",
      "targets": [
        "thesis",
        "textual evidence",
        "inference",
        "counterreading",
        "close reading",
        "contextualization"
      ],
      "reasons": {
        "thesis": "The thesis states the interpretation to be supported.",
        "textual evidence": "Evidence gives the argument an observable basis.",
        "inference": "Inference explains how the evidence supports the claim.",
        "counterreading": "A counterreading tests the claim against a plausible alternative.",
        "close reading": "Close reading produces and analyzes detailed textual support.",
        "contextualization": "Relevant context can refine or test an interpretation."
      }
    },
    {
      "id": "beyond-the-text",
      "prompt": "Which concepts require knowledge of circumstances beyond the text's words and formal features?",
      "explanation": "These concepts situate the work in circumstances that are not fully contained in its words and form, even though the interpretation must still remain accountable to textual evidence.",
      "targets": [
        "historical setting",
        "genre",
        "authorship",
        "intended audience",
        "contextualization"
      ],
      "reasons": {
        "historical setting": "Historical conditions must be learned from sources beyond the work itself.",
        "genre": "Genre depends on conventions shared across works and communities.",
        "authorship": "Knowledge about a work's maker comes from attribution and historical evidence.",
        "intended audience": "The original audience must be reconstructed from contextual evidence.",
        "contextualization": "Contextualization explicitly relates the work to relevant outside circumstances."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Compare how interpretation works across written, visual, and symbolic forms."
    },
    "entries": [
      {
        "id": "reading-a-painting",
        "reason": "Apply the same movement from observable details to contextual interpretation in a visual work.",
        "via": [
          "interpretation",
          "context"
        ]
      },
      {
        "id": "literary-devices",
        "reason": "Review the devices writers use before treating those features as evidence in an interpretation.",
        "via": [
          "imagery",
          "structure"
        ]
      }
    ]
  }
});
