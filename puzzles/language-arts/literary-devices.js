// Generated from content/puzzles/literary-devices.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "literary-devices",
  "title": "Literary devices",
  "category": "language-arts",
  "clusters": [
    {
      "id": "sound-devices",
      "name": "Sound devices",
      "color": "teal",
      "fact": "Sound devices use the way words sound, not just what they mean, to create rhythm and emphasis.",
      "terms": [
        "alliteration",
        "rhyme",
        "onomatopoeia",
        "assonance"
      ],
      "seeds": [
        "alliteration",
        "rhyme"
      ],
      "termInfo": {
        "alliteration": {
          "links": [
            {
              "href": "wiki:Alliteration"
            }
          ]
        },
        "rhyme": {
          "links": [
            {
              "href": "wiki:Rhyme"
            }
          ]
        },
        "onomatopoeia": {
          "links": [
            {
              "href": "wiki:Onomatopoeia"
            }
          ]
        },
        "assonance": {
          "text": "The repetition of vowel sounds in nearby words, without repeating the consonants around them.",
          "links": [
            {
              "href": "wiki:Assonance"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Literary technique"
          }
        ]
      }
    },
    {
      "id": "comparison-devices",
      "name": "Comparison devices",
      "color": "blue",
      "fact": "Comparison devices link two unlike things to reveal a shared quality.",
      "terms": [
        "simile",
        "metaphor",
        "analogy"
      ],
      "seeds": [
        "simile",
        "metaphor"
      ],
      "termInfo": {
        "simile": {
          "links": [
            {
              "href": "wiki:Simile"
            }
          ]
        },
        "metaphor": {
          "links": [
            {
              "href": "wiki:Metaphor"
            }
          ]
        },
        "analogy": {
          "links": [
            {
              "href": "wiki:Analogy"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Figure of speech"
          }
        ]
      }
    },
    {
      "id": "narrative-devices",
      "name": "Narrative devices",
      "color": "amber",
      "fact": "Narrative devices shape how a story reveals information over time.",
      "terms": [
        "foreshadowing",
        "irony",
        "symbolism",
        "flashback"
      ],
      "seeds": [
        "foreshadowing",
        "irony"
      ],
      "termInfo": {
        "foreshadowing": {
          "links": [
            {
              "href": "wiki:Foreshadowing"
            }
          ]
        },
        "irony": {
          "links": [
            {
              "href": "wiki:Irony"
            }
          ]
        },
        "symbolism": {
          "text": "Using a concrete object, image, or action to represent a deeper, non-literal meaning.",
          "links": [
            {
              "href": "wiki:Artistic symbol"
            }
          ]
        },
        "flashback": {
          "text": "A scene that interrupts the present story to show an earlier event.",
          "links": [
            {
              "href": "wiki:Flashback (narrative)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Literary technique"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "personification",
      "term": "personification",
      "clusters": [
        1,
        2
      ],
      "fact": "Personification bridges the two: it's a comparison device (giving human traits to a thing) that often carries symbolic, narrative weight.",
      "info": {
        "links": [
          {
            "href": "wiki:Personification"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "metaphor",
        "symbolism"
      ]
    },
    {
      "id": "repetition",
      "term": "repetition",
      "clusters": [
        0,
        2
      ],
      "fact": "Repetition bridges the two: a sound device that writers reuse narratively to build foreshadowing or theme.",
      "info": {
        "text": "Reusing a word or phrase deliberately, for emphasis or rhythm rather than by accident.",
        "links": [
          {
            "href": "wiki:Repetition (rhetorical device)"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        "foreshadowing"
      ]
    }
  ]
});
