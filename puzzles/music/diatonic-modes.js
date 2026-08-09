// Generated from content/puzzles/diatonic-modes.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "diatonic-modes",
  "title": "Diatonic modes",
  "category": "Music",
  "info": {
    "link": "wiki:Mode (music)",
    "text": "The seven scales you get by starting on each different note of the major scale, each with its own distinctive sound."
  },
  "lenses": [
    {
      "explanation": "The circle-of-fifths brightness order ranks the seven modes by how many sharps their key signature needs relative to Ionian: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian. These four outrank the natural minor scale itself — notice that Dorian makes the cut even though its third is minor, because brightness tracks the key signature as a whole, not any single scale degree.",
      "id": "brightness-order",
      "prompt": "Which modes rank brighter than the natural minor scale in the circle-of-fifths brightness order?",
      "reasons": {
        "Dorian": "Its raised sixth degree outweighs its minor third, placing it ahead of Aeolian despite belonging to the minor-third family.",
        "Ionian": "The major scale itself sits at the exact midpoint between raised and lowered degrees — the brightness baseline.",
        "Lydian": "The brightest mode; its one sharp relative to Ionian is the raised fourth.",
        "Mixolydian": "One flat relative to Ionian keeps it just brighter than the natural minor scale."
      },
      "targets": [
        "Lydian",
        "Ionian",
        "Mixolydian",
        "Dorian"
      ]
    },
    {
      "explanation": "Four modes sit exactly one half-step alteration away from an unaltered scale: Lydian raises the major scale's fourth, Mixolydian lowers its seventh, Dorian raises the natural minor's sixth, and Phrygian lowers its second. Ionian and Aeolian make no alteration at all, and Locrian makes two — a lowered second and a lowered fifth — which is why it stands apart from this otherwise tidy, symmetrical pattern.",
      "id": "one-altered-degree",
      "prompt": "Which modes differ from their nearest unaltered parent scale — the major scale or the natural minor scale — by exactly one raised or lowered degree?",
      "reasons": {
        "Dorian": "Raises the natural minor scale's sixth degree by one half step.",
        "Lydian": "Raises the major scale's fourth degree by one half step.",
        "Mixolydian": "Lowers the major scale's seventh degree by one half step.",
        "Phrygian": "Lowers the natural minor scale's second degree by one half step."
      },
      "targets": [
        "Lydian",
        "Mixolydian",
        "Dorian",
        "Phrygian"
      ]
    }
  ],
  "learningIntroduction": {
    "content": {
      "mediaType": "text/markdown",
      "text": "## Seven scales, one set of notes\n\nPlay only the white keys on a piano, but start on a different one each time, and you get seven different-sounding scales — the same seven pitches, rearranged around a different home note, or tonic. Each starting point is a **mode**: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian.\n\nTwo of them are already familiar under other names. Starting on C gives the ordinary major scale; starting on A gives the natural minor scale. The other five sit at various points in between, each with a personality of its own — brighter than major, darker than minor, or somewhere in the shifting middle.\n\nMusic theorists often rank the seven modes from brightest to darkest by counting how far each one strays from the major scale's pattern of whole and half steps. As you sort the terms below, listen for whether a mode's most distinctive quality comes from its third scale degree — the one that decides whether a scale sounds major or minor in the first place — or from somewhere else entirely."
    },
    "estimatedMinutes": 3,
    "requirement": "recommended",
    "revision": 1,
    "summary": "The same seven pitches, rearranged around a different home note.",
    "title": "What Is a Mode?"
  },
  "clusters": [
    {
      "id": "cluster-major-third",
      "name": "Modes with a major third",
      "color": "blue",
      "fact": "Three of the seven modes have a major third above the tonic, the brighter half of the family: Ionian is the major scale itself, Mixolydian lowers its seventh, and Lydian — the brightest of all seven — raises its fourth.",
      "terms": [
        "Ionian",
        "Lydian",
        "Mixolydian"
      ],
      "seeds": [
        "Ionian",
        "Mixolydian"
      ],
      "termInfo": {
        "Ionian": {
          "link": "wiki:Ionian mode",
          "text": "The major scale itself, renamed as the first mode — no scale degree is altered, so it's the brightness baseline every other mode is measured against."
        },
        "Lydian": {
          "link": "wiki:Lydian mode",
          "text": "A major scale with the fourth degree raised a half step, making it the single brightest of the seven modes."
        },
        "Mixolydian": {
          "link": "wiki:Mixolydian mode",
          "text": "A major scale with the seventh degree lowered a half step, common in blues and rock."
        }
      },
      "info": {
        "link": "wiki:Major third",
        "text": "Modes whose third scale degree is a major third above the tonic — the brighter half of the seven."
      }
    },
    {
      "id": "cluster-minor-third",
      "name": "Modes with a minor third",
      "color": "magenta",
      "fact": "Four of the seven modes have a minor third above the tonic, the darker half of the family: Aeolian is the natural minor scale itself, Dorian raises its sixth, Phrygian lowers its second, and Locrian — the darkest of all seven — lowers both its second and fifth.",
      "terms": [
        "Dorian",
        "Aeolian",
        "Phrygian",
        "Locrian"
      ],
      "seeds": [
        "Aeolian",
        "Dorian"
      ],
      "termInfo": {
        "Aeolian": {
          "link": "wiki:Aeolian mode",
          "text": "The natural minor scale itself, renamed as a mode — the darkness baseline the other minor-third modes are measured against."
        },
        "Dorian": {
          "link": "wiki:Dorian mode",
          "text": "A natural minor scale with the sixth degree raised a half step, giving it a brighter, jazzier color than plain minor."
        },
        "Locrian": {
          "link": "wiki:Locrian mode",
          "text": "A natural minor scale with both the second and fifth degrees lowered — the only mode whose tonic triad is itself diminished."
        },
        "Phrygian": {
          "link": "wiki:Phrygian mode",
          "text": "A natural minor scale with the second degree lowered a half step, giving it a Spanish or Middle Eastern color."
        }
      },
      "info": {
        "link": "wiki:Minor third",
        "text": "Modes whose third scale degree is a minor third above the tonic — the darker half of the seven."
      }
    },
    {
      "id": "cluster-relationships",
      "name": "How modes relate to one another",
      "color": "amber",
      "fact": "Modes can be compared two different ways: sharing a tonic but not a note collection (parallel), or sharing a note collection but not a tonic (relative). Ranking all seven by brightness gives a third way to compare them, and the single scale degree that sets a mode apart from its nearest neighbor in that ranking is its characteristic note.",
      "terms": [
        "parallel key",
        "relative key",
        "characteristic note",
        "brightness order"
      ],
      "seeds": [
        "parallel key",
        "relative key"
      ],
      "termInfo": {
        "brightness order": {
          "link": "wiki:Circle of fifths",
          "text": "Ranking the seven modes from brightest to darkest by counting how many sharps each needs relative to Ionian: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian."
        },
        "characteristic note": {
          "text": "The one scale degree that distinguishes a mode from its nearest neighbor in the brightness order — Lydian's raised fourth, or Phrygian's lowered second."
        },
        "parallel key": {
          "link": "wiki:Parallel key",
          "text": "Two scales, or modes, sharing the same tonic but a different pattern of steps — C Ionian and C Aeolian are parallel."
        },
        "relative key": {
          "link": "wiki:Relative key",
          "text": "Two scales, or modes, sharing the same set of pitches and key signature but a different tonic — C Ionian and A Aeolian are relative."
        }
      },
      "info": {
        "link": "wiki:Mode (music)",
        "text": "Concepts for comparing modes to one another, rather than describing any single mode alone."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-tritone",
      "term": "tritone above the tonic",
      "clusters": [
        0,
        1
      ],
      "fact": "Lydian's raised fourth and Locrian's lowered fifth are the only two of the seven modes where a scale degree sits a tritone above the tonic — the same unstable interval, pulling Lydian's sound upward toward brightness while leaving Locrian's tonic triad diminished and unresolved.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Tritone",
        "text": "An interval of three whole steps — an augmented fourth or a diminished fifth — that splits the octave exactly in half."
      },
      "idealTerms": [
        "Lydian",
        "Locrian"
      ]
    },
    {
      "id": "bridge-one-alteration",
      "term": "one altered degree",
      "clusters": [
        0,
        1
      ],
      "fact": "Four of the seven modes differ from their nearest unaltered scale — the major scale for Lydian and Mixolydian, the natural minor for Dorian and Phrygian — by exactly one raised or lowered degree. Only Ionian and Aeolian make no alteration at all, and Locrian makes two.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        null
      ]
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-09",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    },
    {
      "date": "2026-08-09",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "learningIntroduction",
      "system": "Claude"
    },
    {
      "date": "2026-08-09",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "lenses",
      "system": "Claude"
    }
  ]
});
