// Concept Clusters puzzle: Interpreting a text
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Humanities starter set drafted July 2026.

export default {
  "id": "interpreting-a-text",
  "title": "Interpreting a text",
  "category": "Humanities",
  "info": {
    "text": "Humanistic interpretation combines close attention to a text with knowledge of its setting and a reasoned argument about what it means.",
    "link": "wiki:Literary criticism"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Compare how interpretation works across written, visual, and symbolic forms."
    },
    "entries": [
      {
        "id": "reading-a-painting",
        "via": [
          "interpretation",
          "context"
        ],
        "reason": "Apply the same movement from observable details to contextual interpretation in a visual work."
      },
      {
        "id": "literary-devices",
        "via": [
          "imagery",
          "structure"
        ],
        "reason": "Review the devices writers use before treating those features as evidence in an interpretation."
      }
    ]
  },
  "clusters": [
    {
      "name": "Features of the text",
      "color": "green",
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
          "link": "wiki:Diction"
        },
        "imagery": {
          "text": "Language that evokes sensory experience or creates a vivid mental picture.",
          "link": "wiki:Imagery"
        },
        "structure": {
          "text": "The arrangement of parts—such as scenes, sections, chronology, or shifts in viewpoint—that shapes how a text unfolds.",
          "link": "wiki:Narrative structure"
        },
        "recurring motif": {
          "text": "An image, phrase, object, situation, or idea that returns across a work and helps develop its themes or mood.",
          "link": "wiki:Motif (narrative)"
        }
      },
      "info": {
        "link": "wiki:Literary criticism"
      }
    },
    {
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
          "link": "wiki:Historicism"
        },
        "genre": {
          "text": "A recognized kind of work whose conventions shape what readers expect and how particular choices function.",
          "link": "wiki:Literary genre"
        },
        "authorship": {
          "text": "The circumstances of who created the text, including questions of identity, collaboration, attribution, and authorial role.",
          "link": "wiki:Author"
        },
        "intended audience": {
          "text": "The readers or listeners a work appears to address, whose knowledge and expectations may differ from those of later audiences.",
          "link": "wiki:Audience"
        }
      },
      "info": {
        "link": "wiki:Historicism"
      }
    },
    {
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
          "link": "wiki:Thesis statement"
        },
        "textual evidence": {
          "text": "Specific words, passages, patterns, or formal features cited to support an interpretation.",
          "link": "wiki:Close reading"
        },
        "inference": {
          "text": "A reasoned step from what the text shows to a conclusion about its meaning, effect, or significance.",
          "link": "wiki:Inference"
        },
        "counterreading": {
          "text": "A plausible alternative interpretation that tests whether an argument explains the evidence better than competing accounts.",
          "link": "wiki:Literary criticism"
        }
      },
      "info": {
        "link": "wiki:Argument"
      }
    }
  ],
  "bridges": [
    {
      "term": "close reading",
      "clusters": [
        0,
        2
      ],
      "relationKind": "evaluation",
      "fact": "Close reading turns details such as diction, imagery, and structure into evidence for an interpretive argument.",
      "idealTerms": [
        "diction",
        "textual evidence"
      ],
      "info": {
        "text": "Careful, sustained attention to how a short passage's language and form produce meaning.",
        "link": "wiki:Close reading"
      }
    },
    {
      "term": "contextualization",
      "clusters": [
        1,
        2
      ],
      "relationKind": "evaluation",
      "fact": "Contextualization tests an interpretation by relating the text to its historical setting, genre, authorship, and audience without replacing evidence from the text itself.",
      "idealTerms": [
        "historical setting",
        "thesis"
      ],
      "info": {
        "text": "Placing a work within relevant historical and cultural circumstances so those circumstances can inform its interpretation.",
        "link": "wiki:Historicism"
      }
    }
  ]
};
