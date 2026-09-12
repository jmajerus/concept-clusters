// Generated from content/puzzles/poetic-forms.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "poetic-forms",
  "title": "Poetic forms",
  "category": "language-arts",
  "clusters": [
    {
      "id": "sonnet",
      "name": "Sonnet",
      "color": "teal",
      "fact": "A sonnet is a 14-line poem, traditionally in iambic pentameter, often turning on a final couplet or volta.",
      "terms": [
        "14 lines",
        "volta",
        "iambic pentameter",
        "rhyme scheme"
      ],
      "seeds": [
        "14 lines",
        "volta"
      ],
      "termInfo": {
        "14 lines": {
          "text": "The defining structural feature of a sonnet — no other fixed poetic form is exactly this length.",
          "links": [
            {
              "href": "wiki:Sonnet"
            }
          ]
        },
        "volta": {
          "text": "The turn — a shift in argument, tone, or perspective partway through a sonnet, often right before the final couplet.",
          "links": [
            {
              "href": "wiki:Volta (literature)"
            }
          ]
        },
        "rhyme scheme": {
          "text": "The pattern of end rhymes across a poem's lines — a sonnet's varies by tradition (Shakespearean, Petrarchan, and so on).",
          "links": [
            {
              "href": "wiki:Rhyme scheme"
            }
          ]
        },
        "iambic pentameter": {
          "links": [
            {
              "href": "wiki:Iambic pentameter"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sonnet"
          }
        ]
      }
    },
    {
      "id": "haiku",
      "name": "Haiku",
      "color": "blue",
      "fact": "A haiku is a three-line Japanese form built on a 5-7-5 syllable pattern, often capturing a single moment in nature.",
      "terms": [
        "5-7-5 syllables",
        "kigo",
        "single image"
      ],
      "seeds": [
        "5-7-5 syllables",
        "kigo"
      ],
      "termInfo": {
        "5-7-5 syllables": {
          "text": "The traditional syllable count across a haiku's three lines: five, then seven, then five.",
          "links": [
            {
              "href": "wiki:Haiku"
            }
          ]
        },
        "kigo": {
          "text": "A word or phrase that signals a specific season — a required element of traditional haiku.",
          "links": [
            {
              "href": "wiki:Kigo"
            }
          ]
        },
        "single image": {
          "text": "A haiku typically centers on one concrete image or moment, rather than developing an idea across several.",
          "links": [
            {
              "href": "wiki:Haiku"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Haiku"
          }
        ]
      }
    },
    {
      "id": "free-verse",
      "name": "Free verse",
      "color": "amber",
      "fact": "Free verse abandons fixed meter and rhyme, letting rhythm follow the natural cadence of the language.",
      "terms": [
        "no fixed meter",
        "line breaks",
        "natural cadence"
      ],
      "seeds": [
        "no fixed meter",
        "line breaks"
      ],
      "termInfo": {
        "no fixed meter": {
          "text": "Free verse's defining trait: it isn't built on a repeating pattern of stressed and unstressed syllables the way metered poetry is.",
          "links": [
            {
              "href": "wiki:Free verse"
            }
          ]
        },
        "line breaks": {
          "text": "Where a line of poetry ends — in free verse, a deliberate choice rather than one forced by meter or rhyme.",
          "links": [
            {
              "href": "wiki:Line (poetry)"
            }
          ]
        },
        "natural cadence": {
          "text": "The rhythm of ordinary spoken language — what free verse follows instead of a fixed metrical pattern.",
          "links": [
            {
              "href": "wiki:Prosody (linguistics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Free verse"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "meter",
      "term": "meter",
      "clusters": [
        0,
        2
      ],
      "fact": "Meter bridges the two: the sonnet is built on strict meter, while free verse is defined by deliberately rejecting it.",
      "info": {
        "links": [
          {
            "href": "wiki:Metre (poetry)"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "iambic pentameter",
        "no fixed meter"
      ]
    },
    {
      "id": "imagery",
      "term": "imagery",
      "clusters": [
        1,
        2
      ],
      "fact": "Imagery bridges the two: haiku relies on a single vivid image, and free verse borrowed that same concentrated imagery when it broke from fixed forms.",
      "info": {
        "links": [
          {
            "href": "wiki:Imagery"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "single image",
        null
      ]
    }
  ]
});
