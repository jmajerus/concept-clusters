// Generated from content/puzzles/sentence-structure.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "sentence-structure",
  "title": "English sentence structure",
  "category": "language-arts",
  "clusters": [
    {
      "id": "nouns",
      "name": "Nouns",
      "color": "teal",
      "fact": "Nouns name people, places, things, and ideas — they are the anchors of every sentence.",
      "terms": [
        "subject",
        "object",
        "pronoun"
      ],
      "seeds": [
        "subject",
        "object"
      ],
      "termInfo": {
        "subject": {
          "text": "The part of a sentence that performs the verb's action, or that the sentence is about.",
          "links": [
            {
              "href": "wiki:Subject (grammar)"
            }
          ]
        },
        "object": {
          "text": "The part of a sentence that receives the verb's action.",
          "links": [
            {
              "href": "wiki:Object (grammar)"
            }
          ]
        },
        "pronoun": {
          "links": [
            {
              "href": "wiki:Pronoun"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Noun"
          }
        ]
      }
    },
    {
      "id": "verbs",
      "name": "Verbs",
      "color": "blue",
      "fact": "Verbs express actions, states, or occurrences and give a sentence its energy.",
      "terms": [
        "tense",
        "predicate",
        "infinitive",
        "auxiliary verb"
      ],
      "seeds": [
        "tense",
        "predicate"
      ],
      "termInfo": {
        "tense": {
          "text": "How a verb shows when an action happens — past, present, or future.",
          "links": [
            {
              "href": "wiki:Grammatical tense"
            }
          ]
        },
        "predicate": {
          "text": "Everything in a sentence besides the subject — usually built around the verb.",
          "links": [
            {
              "href": "wiki:Predicate (grammar)"
            }
          ]
        },
        "auxiliary verb": {
          "text": "A helping verb (like \"have\" or \"will\") that combines with a main verb to show tense, mood, or voice.",
          "links": [
            {
              "href": "wiki:Auxiliary verb"
            }
          ]
        },
        "infinitive": {
          "links": [
            {
              "href": "wiki:Infinitive"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Verb"
          }
        ]
      }
    },
    {
      "id": "modifiers",
      "name": "Modifiers",
      "color": "amber",
      "fact": "Modifiers — adjectives and adverbs — add detail and precision by describing other words.",
      "terms": [
        "adjective",
        "adverb",
        "clause",
        "prepositional phrase"
      ],
      "seeds": [
        "adjective",
        "adverb"
      ],
      "termInfo": {
        "adjective": {
          "links": [
            {
              "href": "wiki:Adjective"
            }
          ]
        },
        "adverb": {
          "links": [
            {
              "href": "wiki:Adverb"
            }
          ]
        },
        "clause": {
          "links": [
            {
              "href": "wiki:Clause"
            }
          ]
        },
        "prepositional phrase": {
          "text": "A group of words starting with a preposition (like \"in the garden\") that modifies another part of the sentence.",
          "links": [
            {
              "href": "wiki:Adpositional phrase"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Grammatical modifier"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "agreement",
      "term": "agreement",
      "clusters": [
        0,
        1
      ],
      "fact": "Agreement bridges the two: subject and verb must match in number, tying nouns and verbs into a grammatical unit.",
      "info": {
        "text": "The rule that a sentence's parts must match in form — like a subject and verb agreeing in number.",
        "links": [
          {
            "href": "wiki:Agreement (linguistics)"
          }
        ]
      },
      "idealTerms": [
        "subject",
        "predicate"
      ]
    },
    {
      "id": "phrase",
      "term": "phrase",
      "clusters": [
        0,
        2
      ],
      "fact": "Phrase bridges the two: a noun phrase pairs a noun with its modifiers, showing how the two word classes build meaning together.",
      "info": {
        "links": [
          {
            "href": "wiki:Phrase"
          }
        ]
      },
      "idealTerms": [
        null,
        "adjective"
      ]
    }
  ]
});
