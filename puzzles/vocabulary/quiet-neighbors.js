// Generated from content/puzzles/quiet-neighbors.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "quiet-neighbors",
  "title": "Saying Little",
  "category": "vocabulary",
  "puzzleKind": "vocabulary-context",
  "tags": [
    "synonyms",
    "usage",
    "adjectives"
  ],
  "level": "intermediate",
  "info": {
    "text": "Four near-synonyms for saying little, discriminated along the lines of Merriam-Webster's synonym notes: all describe the quiet, but each is quiet for a different reason — temperament, privacy, caution, or brevity.",
    "links": [
      {
        "href": "https://www.merriam-webster.com/dictionary/taciturn"
      },
      {
        "href": "https://www.merriam-webster.com/dictionary/reserved"
      }
    ]
  },
  "clusters": [
    {
      "id": "saying-little",
      "name": "Saying Little",
      "color": "teal",
      "fact": "All four adjectives describe people who say little. They differ in why the words stay unsaid: taciturn is a temperamental disinclination to speech; reticent is reluctance to speak out, especially about one's own affairs; reserved is reticence restrained further by caution or formality; laconic is brevity itself — using few words where others would use many.",
      "terms": [
        "taciturn",
        "reticent",
        "reserved",
        "laconic"
      ],
      "seeds": [
        "taciturn",
        "reticent"
      ],
      "termInfo": {
        "laconic": "Using few words; concise to the point of seeming abrupt. Alone in this set, it describes speech and writing as well as people.",
        "reserved": "Reticence restrained further by caution or formality; holding back from easy informal exchange, often for reasons of role or propriety.",
        "reticent": "Reluctant to speak out or at length, especially about one's own affairs, feelings, or plans.",
        "taciturn": "A temperamental disinclination to speech; habitually uncommunicative, usually connoting unsociability."
      },
      "info": "All four words describe saying little. Tell them apart by why the words stay unsaid: temperament, privacy, caution, or bare brevity."
    }
  ],
  "bridges": [],
  "lenses": [
    {
      "id": "taciturn-keeper",
      "prompt": "The lighthouse keeper was famously ____; supply crews learned not to expect more than a nod and the manifest.",
      "explanation": "A settled disposition toward unsociability is taciturn's boundary: the crews learn over time to expect nothing, which is temperament, not a topic being withheld. Reticent would need the keeper to be guarding his affairs, reserved would need caution or formality, and laconic describes brief speech rather than a habit of near-silence.",
      "targets": [
        "taciturn"
      ],
      "reasons": {
        "taciturn": "Temperamental disinclination to speech is exactly what the learned-over-time unsociability tests."
      }
    },
    {
      "id": "reticent-diagnosis",
      "prompt": "She was ____ about the diagnosis, deflecting every question about how she felt.",
      "explanation": "Withholding one's own inner life is reticent's home ground: the cue is the diagnosis and how she felt, i.e. her affairs. Laconic is the meaningful near-miss — her answers are short — but the sentence foregrounds reluctance to speak about herself, not brevity of style. Reserved would need caution or formality, taciturn a settled unsociable temperament.",
      "targets": [
        "reticent"
      ],
      "reasons": {
        "reticent": "Reluctance to speak about one's own affairs is the distinction this deflection context activates."
      }
    },
    {
      "id": "reserved-ambassador",
      "prompt": "The ambassador remained politely ____ on the border question, offering procedure instead of opinion.",
      "explanation": "Caution and formality checking informal exchange is reserved's signature: the ambassador's role demands procedure instead of opinion. Reticent would need personal affairs at stake rather than a public brief, taciturn a temperamental unsociability no diplomat could afford, and laconic mere brevity rather than role-bound restraint.",
      "targets": [
        "reserved"
      ],
      "reasons": {
        "reserved": "Restraint by caution and formality is reserved's discriminating clause."
      }
    },
    {
      "id": "laconic-dispatch",
      "prompt": "His dispatch from the front was ____ to a fault: 'Arrived. Seeing little. Hold position.'",
      "explanation": "Brevity of the message itself is laconic's boundary, and it alone in this set describes a text: the dispatch says everything in six words. The other three describe a speaker's disposition toward speech — taciturn temperament, reticent privacy, reserved caution — and none of them can characterize a dispatch.",
      "targets": [
        "laconic"
      ],
      "reasons": {
        "laconic": "Using few words is laconic's extended sense, reaching speech and writing."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": true,
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      }
    ]
  }
});
