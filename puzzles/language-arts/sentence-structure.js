// Concept Clusters puzzle: English sentence structure
// Category: Language Arts
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "sentence-structure",
  "title": "English sentence structure",
  "category": "Language Arts",
  "clusters": [
    {
      "name": "Nouns",
      "info": {
        "link": "wiki:Noun"
      },
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
          "link": "wiki:Subject (grammar)"
        },
        "object": {
          "text": "The part of a sentence that receives the verb's action.",
          "link": "wiki:Object (grammar)"
        },
        "pronoun": {
          "link": "wiki:Pronoun"
        }
      }
    },
    {
      "name": "Verbs",
      "info": {
        "link": "wiki:Verb"
      },
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
          "link": "wiki:Grammatical tense"
        },
        "predicate": {
          "text": "Everything in a sentence besides the subject — usually built around the verb.",
          "link": "wiki:Predicate (grammar)"
        },
        "auxiliary verb": {
          "text": "A helping verb (like \"have\" or \"will\") that combines with a main verb to show tense, mood, or voice.",
          "link": "wiki:Auxiliary verb"
        },
        "infinitive": {
          "link": "wiki:Infinitive"
        }
      }
    },
    {
      "name": "Modifiers",
      "info": {
        "link": "wiki:Grammatical modifier"
      },
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
          "link": "wiki:Adjective"
        },
        "adverb": {
          "link": "wiki:Adverb"
        },
        "clause": {
          "link": "wiki:Clause"
        },
        "prepositional phrase": {
          "text": "A group of words starting with a preposition (like \"in the garden\") that modifies another part of the sentence.",
          "link": "wiki:Adpositional phrase"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "agreement",
      "clusters": [
        0,
        1
      ],
      "fact": "Agreement bridges the two: subject and verb must match in number, tying nouns and verbs into a grammatical unit.",
      "idealTerms": [
        "subject",
        "predicate"
      ],
      "info": {
        "text": "The rule that a sentence's parts must match in form — like a subject and verb agreeing in number.",
        "link": "wiki:Agreement (linguistics)"
      }
    },
    {
      "term": "phrase",
      "clusters": [
        0,
        2
      ],
      "fact": "Phrase bridges the two: a noun phrase pairs a noun with its modifiers, showing how the two word classes build meaning together.",
      "idealTerms": [
        null,
        "adjective"
      ],
      "info": {
        "link": "wiki:Phrase"
      }
    }
  ]
};
