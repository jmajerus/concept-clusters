// Generated from content/puzzles/typography.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "typography",
  "title": "Typography: letterforms, families, and spacing",
  "category": "art",
  "large": true,
  "info": {
    "text": "Typography is the visual craft of language: letters are built from repeatable parts, faces fall into historical families, and spacing turns characters into readable lines.",
    "links": [
      {
        "href": "wiki:Typography"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-letter-anatomy",
      "name": "Letterform anatomy",
      "color": "teal",
      "fact": "Each part of a glyph does distinct work: the baseline anchors letters, x-height sets the body of lowercase letters, ascenders and descenders extend beyond it, and the counter, stem, and bowl shape each character's skeleton.",
      "terms": [
        "baseline",
        "x-height",
        "ascender",
        "descender",
        "counter",
        "stem",
        "bowl"
      ],
      "seeds": [
        "baseline",
        "x-height"
      ],
      "termInfo": {
        "ascender": {
          "text": "The part of a lowercase letter that rises above the x-height, as in b, d, or h.",
          "links": [
            {
              "href": "wiki:Ascender (typography)"
            }
          ]
        },
        "baseline": {
          "text": "The invisible line on which most letters rest and to which consecutive lines register.",
          "links": [
            {
              "href": "wiki:Baseline (typography)"
            }
          ]
        },
        "bowl": {
          "text": "The rounded stroke that encloses a counter, as in b, d, or o.",
          "links": [
            {
              "href": "wiki:Bowl (typography)"
            }
          ]
        },
        "counter": {
          "text": "The enclosed or partly enclosed white space inside a letter, as in o or e.",
          "links": [
            {
              "href": "wiki:Counter (typography)"
            }
          ]
        },
        "descender": {
          "text": "The part of a lowercase letter that drops below the baseline, as in p, q, or y.",
          "links": [
            {
              "href": "wiki:Descender (typography)"
            }
          ]
        },
        "stem": {
          "text": "The main vertical or diagonal stroke of a letter.",
          "links": [
            {
              "href": "wiki:Stem (typography)"
            }
          ]
        },
        "x-height": {
          "text": "The height of lowercase letters without ascenders or descenders, measured by the letter x.",
          "links": [
            {
              "href": "wiki:X-height"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Typeface anatomy"
          }
        ]
      }
    },
    {
      "id": "cluster-type-families",
      "name": "Type families",
      "color": "blue",
      "fact": "Type families group faces by stroke character and construction: bracketed old-style serifs, heavy slab serifs, unadorned sans-serifs, calligraphic scripts, broken blackletters, and fixed-width monospace.",
      "terms": [
        "sans-serif",
        "script",
        "old-style serif",
        "slab serif",
        "blackletter",
        "monospace"
      ],
      "seeds": [
        "sans-serif",
        "script"
      ],
      "termInfo": {
        "blackletter": {
          "text": "A family of broken, angular scripts descended from medieval manuscript hands.",
          "links": [
            {
              "href": "wiki:Blackletter"
            }
          ]
        },
        "monospace": {
          "text": "A family in which every character occupies the same horizontal width.",
          "links": [
            {
              "href": "wiki:Monospaced font"
            }
          ]
        },
        "old-style serif": {
          "text": "A serif family with bracketed serifs and moderate stroke contrast, rooted in Renaissance printing.",
          "links": [
            {
              "href": "wiki:Old-style serif"
            }
          ]
        },
        "sans-serif": {
          "text": "A type family without terminal strokes, built from plain, even letterforms.",
          "links": [
            {
              "href": "wiki:Sans-serif"
            }
          ]
        },
        "script": {
          "text": "A type family imitating handwriting or calligraphy, often with joining strokes.",
          "links": [
            {
              "href": "wiki:Script typeface"
            }
          ]
        },
        "slab serif": {
          "text": "A serif family with heavy, block-like serifs and even stroke weight.",
          "links": [
            {
              "href": "wiki:Slab serif"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Vox-ATypI classification"
          }
        ]
      }
    },
    {
      "id": "cluster-setting-spacing",
      "name": "Setting and spacing",
      "color": "amber",
      "fact": "Setting type means controlling size and white space: point size scales glyphs, leading opens the lines, kerning and tracking adjust the space between letters, and justification aligns lines to a measure.",
      "terms": [
        "point size",
        "justification",
        "leading",
        "kerning",
        "tracking"
      ],
      "seeds": [
        "point size",
        "justification"
      ],
      "termInfo": {
        "justification": {
          "text": "Aligning lines of text to a common measure, typically flush on both margins.",
          "links": [
            {
              "href": "wiki:Text alignment"
            }
          ]
        },
        "kerning": {
          "text": "Adjusting the space between specific pairs of letters.",
          "links": [
            {
              "href": "wiki:Kerning"
            }
          ]
        },
        "leading": {
          "text": "The vertical distance from one baseline to the next; the line spacing of a text.",
          "links": [
            {
              "href": "wiki:Leading"
            }
          ]
        },
        "point size": {
          "text": "The relative measure of type size, expressed in points.",
          "links": [
            {
              "href": "wiki:Point (typography)"
            }
          ]
        },
        "tracking": {
          "text": "Applying uniform spacing across a run of letters.",
          "links": [
            {
              "href": "wiki:Letter-spacing"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Typography"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-baseline-grid",
      "term": "baseline grid",
      "clusters": [
        0,
        2
      ],
      "fact": "A baseline grid uses the baseline as a shared registration line: leading sets the distance from one baseline to the next and justification aligns each line to the same measure, keeping consecutive lines even.",
      "info": {
        "text": "A layout framework that registers every line to a shared baseline rhythm.",
        "links": [
          {
            "href": "wiki:Grid (graphic design)"
          }
        ]
      },
      "idealTerms": [
        "baseline",
        "leading"
      ]
    },
    {
      "id": "bridge-legibility",
      "term": "legibility",
      "clusters": [
        0,
        2
      ],
      "fact": "Legibility links letter structure with spacing: open counters and a generous x-height keep small glyphs distinguishable, while leading and tracking give them room to breathe.",
      "info": {
        "text": "How easily individual letters and words can be distinguished in running text.",
        "links": [
          {
            "href": "wiki:Legibility"
          }
        ]
      },
      "idealTerms": [
        "counter",
        "leading"
      ]
    },
    {
      "id": "bridge-stroke-contrast",
      "term": "stroke contrast",
      "clusters": [
        0,
        1
      ],
      "fact": "Stroke contrast is the thick-thin variation within a glyph's stems: low contrast marks sans-serif and monospace faces, while higher contrast marks old-style serif, slab serif, script, and blackletter faces.",
      "info": "The degree of thick-thin variation among a face's strokes.",
      "idealTerms": [
        "stem",
        "sans-serif"
      ]
    }
  ],
  "lenses": [
    {
      "id": "extends-beyond-the-body",
      "prompt": "Which letter parts extend beyond the body of a lowercase letter?",
      "explanation": "Ascenders rise above the x-height and descenders drop below the baseline. The baseline and x-height are measures, not extensions, and the counter, stem, and bowl sit within the body of the letter.",
      "targets": [
        "ascender",
        "descender"
      ],
      "reasons": {
        "ascender": "An ascender is defined by rising above the x-height.",
        "descender": "A descender is defined by dropping below the baseline."
      }
    },
    {
      "id": "space-between-letters",
      "prompt": "Which spacing controls adjust the horizontal space between letters?",
      "explanation": "Kerning adjusts individual letter pairs while tracking applies uniform spacing across a run. Leading is vertical distance between lines, justification aligns lines to a measure, and point size scales glyphs.",
      "targets": [
        "kerning",
        "tracking"
      ],
      "reasons": {
        "kerning": "Kerning adjusts the space between specific pairs of letters.",
        "tracking": "Tracking applies uniform spacing across a run of letters."
      }
    },
    {
      "id": "structure-meets-layout",
      "prompt": "Which concepts connect the structure of letters to the layout of lines?",
      "explanation": "The baseline grid registers lines to a shared baseline and legibility joins letter structure with spacing. Stroke contrast instead connects letter structure to family classification, not to line layout.",
      "targets": [
        "baseline grid",
        "legibility"
      ],
      "reasons": {
        "baseline grid": "The grid uses the baseline as the registration line that leading and justification align to.",
        "legibility": "Legibility joins counters and x-height with leading and tracking to keep text distinguishable."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Letters Are Built Before They Are Read",
    "summary": "Separate the parts of a letter, the families of faces, and the spacing of lines before organizing the puzzle.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Fluent reading hides its own machinery. By the time words reach you, thousands of small decisions have already been made about the shape of each letter, the family of faces on the page, and the white space holding the lines together.\r\n\r\nIt helps to separate three questions that blur together in finished text. First, what parts is a letter made of: the lines it rests on, the heights it reaches, and the strokes and spaces that give it a skeleton. Second, how faces group into families with recognizable manners, from bracketed serifs to plain sans-serifs to broken blackletter hands. Third, how size and spacing turn isolated characters into lines a reader can follow.\r\n\r\nKeep those three questions apart as you play, and notice which one each term answers."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      },
      {
        "name": "Claude (Sonnet 4.6)",
        "model": "Claude Sonnet 4.6",
        "reasoning": "high"
      }
    ]
  }
});
