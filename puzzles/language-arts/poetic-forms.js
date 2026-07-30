// Concept Clusters puzzle: Poetic forms
// Category: Language Arts
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "poetic-forms",
  "title": "Poetic forms",
  "category": "Language Arts",
  "clusters": [
    {
      "name": "Sonnet",
      "info": {
        "link": "wiki:Sonnet"
      },
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
          "link": "wiki:Sonnet"
        },
        "volta": {
          "text": "The turn — a shift in argument, tone, or perspective partway through a sonnet, often right before the final couplet.",
          "link": "wiki:Volta (literature)"
        },
        "rhyme scheme": {
          "text": "The pattern of end rhymes across a poem's lines — a sonnet's varies by tradition (Shakespearean, Petrarchan, and so on).",
          "link": "wiki:Rhyme scheme"
        },
        "iambic pentameter": {
          "link": "wiki:Iambic pentameter"
        }
      }
    },
    {
      "name": "Haiku",
      "info": {
        "link": "wiki:Haiku"
      },
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
          "link": "wiki:Haiku"
        },
        "kigo": {
          "text": "A word or phrase that signals a specific season — a required element of traditional haiku.",
          "link": "wiki:Kigo"
        },
        "single image": {
          "text": "A haiku typically centers on one concrete image or moment, rather than developing an idea across several.",
          "link": "wiki:Haiku"
        }
      }
    },
    {
      "name": "Free verse",
      "info": {
        "link": "wiki:Free verse"
      },
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
          "link": "wiki:Free verse"
        },
        "line breaks": {
          "text": "Where a line of poetry ends — in free verse, a deliberate choice rather than one forced by meter or rhyme.",
          "link": "wiki:Line (poetry)"
        },
        "natural cadence": {
          "text": "The rhythm of ordinary spoken language — what free verse follows instead of a fixed metrical pattern.",
          "link": "wiki:Prosody (linguistics)"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "meter",
      "clusters": [
        0,
        2
      ],
      "relationKind": "contrast",
      "fact": "Meter bridges the two: the sonnet is built on strict meter, while free verse is defined by deliberately rejecting it.",
      "idealTerms": [
        "iambic pentameter",
        "no fixed meter"
      ],
      "info": {
        "link": "wiki:Metre (poetry)"
      }
    },
    {
      "term": "imagery",
      "clusters": [
        1,
        2
      ],
      "relationKind": "continuity",
      "fact": "Imagery bridges the two: haiku relies on a single vivid image, and free verse borrowed that same concentrated imagery when it broke from fixed forms.",
      "idealTerms": [
        "single image",
        null
      ],
      "info": {
        "link": "wiki:Imagery"
      }
    }
  ]
};
