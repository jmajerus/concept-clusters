// Concept Clusters puzzle: Literary devices
// Category: Language Arts
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "literary-devices",
  "title": "Literary devices",
  "category": "Language Arts",
  "clusters": [
    {
      "name": "Sound devices",
      "info": {
        "link": "wiki:Literary technique"
      },
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
          "link": "wiki:Alliteration"
        },
        "rhyme": {
          "link": "wiki:Rhyme"
        },
        "onomatopoeia": {
          "link": "wiki:Onomatopoeia"
        },
        "assonance": {
          "text": "The repetition of vowel sounds in nearby words, without repeating the consonants around them.",
          "link": "wiki:Assonance"
        }
      }
    },
    {
      "name": "Comparison devices",
      "info": {
        "link": "wiki:Figure of speech"
      },
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
          "link": "wiki:Simile"
        },
        "metaphor": {
          "link": "wiki:Metaphor"
        },
        "analogy": {
          "link": "wiki:Analogy"
        }
      }
    },
    {
      "name": "Narrative devices",
      "info": {
        "link": "wiki:Literary technique"
      },
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
          "link": "wiki:Foreshadowing"
        },
        "irony": {
          "link": "wiki:Irony"
        },
        "symbolism": {
          "text": "Using a concrete object, image, or action to represent a deeper, non-literal meaning.",
          "link": "wiki:Artistic symbol"
        },
        "flashback": {
          "text": "A scene that interrupts the present story to show an earlier event.",
          "link": "wiki:Flashback (narrative)"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "personification",
      "clusters": [
        1,
        2
      ],
      "relationKind": "cross-cutting",
      "fact": "Personification bridges the two: it's a comparison device (giving human traits to a thing) that often carries symbolic, narrative weight.",
      "idealTerms": [
        "metaphor",
        "symbolism"
      ],
      "info": {
        "link": "wiki:Personification"
      }
    },
    {
      "term": "repetition",
      "clusters": [
        0,
        2
      ],
      "relationKind": "cross-cutting",
      "fact": "Repetition bridges the two: a sound device that writers reuse narratively to build foreshadowing or theme.",
      "idealTerms": [
        null,
        "foreshadowing"
      ],
      "info": {
        "text": "Reusing a word or phrase deliberately, for emphasis or rhythm rather than by accident.",
        "link": "wiki:Repetition (rhetorical device)"
      }
    }
  ]
};
