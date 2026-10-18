// Generated from content/puzzles/phonemes-and-patterns.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "phonemes-and-patterns",
  "title": "Phonemes and Patterns",
  "category": "linguistics",
  "subcategories": {
    "linguistics": "phonetics-phonology"
  },
  "info": {
    "text": "How phonology turns raw sound into a system: the phoneme as a language's unit of contrast, the allophones it varies through, and the syllable patterns and melodic layers that organize them.",
    "links": [
      {
        "href": "wiki:Phonology"
      },
      {
        "href": "wiki:Phoneme"
      }
    ],
    "citations": [
      {
        "title": "Phonology",
        "url": "https://en.wikipedia.org/wiki/Phonology"
      },
      {
        "title": "Phoneme",
        "url": "https://en.wikipedia.org/wiki/Phoneme"
      }
    ]
  },
  "clusters": [
    {
      "id": "phoneme",
      "name": "The phoneme & its variants",
      "color": "teal",
      "fact": "The machinery by which a language sorts continuously varying sounds into a small set of meaning-distinguishing categories.",
      "terms": [
        "phoneme",
        "phone",
        "allophone",
        "minimal pair",
        "complementary distribution",
        "free variation"
      ],
      "seeds": [
        "phoneme",
        "allophone"
      ],
      "termInfo": {
        "allophone": {
          "text": "A context-determined variant of a phoneme whose substitution never changes meaning: English [pʰ] in 'pot' and [p] in 'spot' are allophones of /p/.",
          "links": [
            {
              "href": "wiki:Allophone"
            }
          ]
        },
        "complementary distribution": {
          "text": "Two related sounds never occur in the same environment — English aspirated [pʰ] only syllable-initially, plain [p] elsewhere — so the position selects the variant.",
          "links": [
            {
              "href": "wiki:Complementary distribution"
            }
          ]
        },
        "free variation": {
          "text": "Two sounds occur in the same environment without changing meaning; the choice follows the speaker or habit, as with released versus unreleased final stops.",
          "links": [
            {
              "href": "wiki:Free variation"
            }
          ]
        },
        "minimal pair": {
          "text": "Two words identical except for one sound with different meanings — 'ship' versus 'sheep' — the standard evidence that two sounds are separate phonemes.",
          "links": [
            {
              "href": "wiki:Minimal pair"
            }
          ]
        },
        "phone": {
          "text": "Any actual speech sound produced, written in square brackets: [pʰ] and [p] are two distinct phones.",
          "links": [
            {
              "href": "wiki:Phone (phonetics)"
            }
          ]
        },
        "phoneme": {
          "text": "A family of sounds speakers treat as one unit; swapping it for a different phoneme changes word meaning — /p/ versus /b/ in 'pat'/'bat'.",
          "links": [
            {
              "href": "wiki:Phoneme"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Phoneme"
          }
        ]
      }
    },
    {
      "id": "syllable",
      "name": "Syllable & position",
      "color": "blue",
      "fact": "How a language strings sounds into syllables with named parts — and the positional rules about which sounds may go where.",
      "terms": [
        "syllable structure",
        "onset",
        "rime",
        "coda",
        "phonotactics"
      ],
      "seeds": [
        "syllable structure",
        "onset"
      ],
      "termInfo": {
        "coda": {
          "text": "The consonant or consonants after the syllable's vowel — the /k/ at the end of 'sock'. English phonotactics forbids /h/ and /ŋ/ from certain positions: /ŋ/ occurs only in the coda.",
          "links": [
            {
              "href": "wiki:Syllable"
            }
          ]
        },
        "onset": {
          "text": "The consonant or cluster before the syllable's vowel — the /t/ in 'tea' or /str/ in 'string'.",
          "links": [
            {
              "href": "wiki:Syllable"
            }
          ]
        },
        "phonotactics": {
          "text": "A language's positional rules for sound sequences: English allows 'str-' to open a word but never /ŋ/, which appears only at syllable ends.",
          "links": [
            {
              "href": "wiki:Phonotactics"
            }
          ]
        },
        "rime": {
          "text": "The vowel plus any closing consonants — the part that rhymes: /aɪt/ in 'light' and 'night'.",
          "links": [
            {
              "href": "wiki:Syllable"
            }
          ]
        },
        "syllable structure": {
          "text": "The organization of speech into syllables with a vowel nucleus and consonal margins — the beats stress and timing count.",
          "links": [
            {
              "href": "wiki:Syllable"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Syllable"
          }
        ]
      }
    },
    {
      "id": "melody",
      "name": "Stress, tone & intonation",
      "color": "amber",
      "fact": "Meaning-bearing melody layered over the string of segments: loudness, pitch, and tune doing grammatical and attitudinal work.",
      "terms": [
        "stress",
        "tone",
        "intonation"
      ],
      "seeds": [
        "stress",
        "tone"
      ],
      "termInfo": {
        "intonation": {
          "text": "The tune of a whole utterance — rising in questions, falling in statements — carrying sentence mood and attitude rather than word identity.",
          "links": [
            {
              "href": "wiki:Intonation (linguistics)"
            }
          ]
        },
        "stress": {
          "text": "Relative prominence on one syllable, contrastive in English: 'PERmit' (noun) versus 'perMIT' (verb).",
          "links": [
            {
              "href": "wiki:Stress (linguistics)"
            }
          ]
        },
        "tone": {
          "text": "Contrastive pitch on a syllable that distinguishes words — Mandarin mā 'mother' versus mà 'scold' differ only in pitch.",
          "links": [
            {
              "href": "wiki:Tone (linguistics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Prosody (linguistics)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "phonological-environment",
      "term": "phonological environment",
      "clusters": [
        0,
        1
      ],
      "fact": "Both complementary distribution and phonotactics are positional claims: English /ŋ/ (as in 'sing') never begins a syllable, so where a sound may occur is what selects it.",
      "info": {
        "text": "Where a sound may occur is a fact about the language's system, not the vocal tract: complementary distribution states it for one phoneme's variants; phonotactics states it for the whole language.",
        "links": [
          {
            "href": "wiki:Phonotactics"
          }
        ]
      },
      "idealTerms": [
        "complementary distribution",
        "phonotactics"
      ]
    },
    {
      "id": "suprasegmental-contrast",
      "term": "suprasegmental contrast",
      "clusters": [
        0,
        2
      ],
      "fact": "Stress and tone distinguish words exactly as consonants and vowels do — English reCORD (verb) vs RECord (noun), Mandarin mā 'mother' vs mà 'scold'.",
      "info": {
        "text": "The phoneme principle — swap this, change the meaning — holds for pitch and loudness too, not just consonants and vowels.",
        "links": [
          {
            "href": "wiki:Stress (linguistics)"
          }
        ]
      },
      "relationKind": "continuity"
    },
    {
      "id": "syllable-as-carrier",
      "term": "syllable as carrier",
      "clusters": [
        1,
        2
      ],
      "fact": "Stress and tone attach to syllables, not segments: English stress picks one syllable of a word, and the vowels of unstressed syllables reduce toward schwa.",
      "info": {
        "text": "Melody rides on syllables: stress chooses among a word's syllables, tone rides each syllable's vowel, and the unstressed ones are where vowels reduce to schwa.",
        "links": [
          {
            "href": "wiki:Vowel reduction"
          }
        ]
      },
      "idealTerms": [
        null,
        "stress"
      ]
    }
  ],
  "lenses": [
    {
      "id": "non-contrastive-relationships",
      "prompt": "Which terms describe relationships in which swapping one sound for another never changes a word's meaning?",
      "explanation": "In all three relationships, substituting one sound for the other never changes a word's meaning: allophones are a phoneme's context-determined variants, complementary distribution places them where the other never occurs, and free variation lets either appear unpredictably. A minimal pair is the opposite — the one swap that does change meaning — and phone names a single produced sound, not a relationship.",
      "targets": [
        "allophone",
        "complementary distribution",
        "free variation"
      ]
    },
    {
      "id": "word-level-melody",
      "prompt": "Which melodic terms distinguish individual words rather than shaping whole utterances?",
      "explanation": "Stress distinguishes words from one another ('PERmit' vs 'perMIT') and tone distinguishes words in Mandarin (mā vs mà). Intonation is different: it is the tune of a whole utterance — questions rise, statements fall — and does not distinguish individual words.",
      "targets": [
        "stress",
        "tone"
      ]
    },
    {
      "id": "syllable-anatomy",
      "prompt": "Which terms name positions within a syllable?",
      "explanation": "Onset, rime, and coda are the named positions within a syllable: onset before the vowel, rime as the vowel-plus-coda rhyming part, coda after the vowel. Syllable structure names the whole organization, and phonotactics states which sounds may fill which sequences — rules, not positions.",
      "targets": [
        "onset",
        "rime",
        "coda"
      ]
    },
    {
      "id": "positional-claims",
      "prompt": "Which terms are statements about where a sound may occur?",
      "explanation": "Both are claims about where a sound may occur: complementary distribution is that claim made about one phoneme's variants (English [pʰ] only syllable-initially, plain [p] elsewhere), and phonotactics is the same kind of claim at the language level (/ŋ/ never begins a syllable). Free variation is the opposite — no positional rule at all — and onset and coda are positions themselves, not claims about them.",
      "targets": [
        "complementary distribution",
        "phonotactics"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "consonants-and-vowels",
        "reason": "Play first: the contrasts organized on this board are built from the consonants and vowels described in Consonants and Vowels."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From Sound to System",
    "summary": "How languages sort raw sound into contrast: the phoneme and its allophones, the syllable templates that position sounds, and the melodic layers of stress, tone, and intonation.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "The previous lesson described speech sounds as physical gestures — place, manner, voicing, vowel dimensions. This lesson asks a different question: which of the infinitely many possible sound differences does a language actually treat as meaningful? English ignores the puff of air after the p in 'pot'; Thai builds word meanings on exactly that puff. Each language sorts the continuous stream of sound into a small inventory of contrastive categories, and each category is a **phoneme**.\r\n\r\nAny actual sound a speaker produces is a **phone**. English speakers treat [pʰ] of 'pot' and plain [p] of 'spot' as the same thing — the phoneme /p/ — and its two contextual variants are **allophones**. How do linguists discover a language's phonemes? Two tools do most of the work. A **minimal pair** — two words identical except for one sound, like 'ship' and 'sheep' — proves the two sounds are separate phonemes, because swapping them changes the meaning. And when no meaning ever changes, the sounds belong to one phoneme: English [pʰ] and [p] stand in **complementary distribution**, each appearing only where the other never does. When either sound may occur in the same spot with no change in meaning, the choice is **free variation**, down to the individual speaker. Crucially, the sorting differs by language: [n] and [ŋ] are separate phonemes in English ('sin' vs 'sing') but variants of one phoneme in Spanish, while aspiration is a full phoneme in Thai.\r\n\r\nSounds are also positioned. **Syllable structure** gives every utterance a rhythm of beats: each syllable has an **onset** (its opening consonant or cluster), a vowel nucleus, and optionally a **coda** (its closing consonant); the vowel-plus-coda part is the **rime**, the part that rhymes. On top of the template sit **phonotactics**, a language's positional rules: English allows 'str-' to open a word but never /ŋ/, which appears only in the coda, as in 'sing'. Where a sound may occur is a fact about the language's system, not about the human vocal tract.\r\n\r\nFinally, melody rides above the segments. **Stress** makes one syllable of a word more prominent, and in English that choice alone distinguishes nouns from verbs — 'PERmit' versus 'perMIT'. **Tone** gives each syllable a contrastive pitch, so Mandarin mā ('mother') and mà ('scold') differ only in melody. **Intonation** is the tune of a whole utterance, rising in questions and falling in statements. Stress and tone do for melody exactly what phonemes do for segments: swapping them changes what a word means.\r\n\r\nTogether, the two lessons give the full picture of the sound level of language: how speech sounds are produced, and how each language organizes them into the contrasts and patterns that carry meaning."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "phonemes-and-patterns",
      "puzzleRevision": "fnv1a32:8994de81",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:phoneme": {
          "x": 816.22,
          "y": 358.97
        },
        "term:phone": {
          "x": 877.17,
          "y": 424.81
        },
        "term:allophone": {
          "x": 829.16,
          "y": 508.06
        },
        "term:minimal pair": {
          "x": 752.79,
          "y": 575.81
        },
        "term:complementary distribution": {
          "x": 756.84,
          "y": 229.64
        },
        "term:free variation": {
          "x": 604.32,
          "y": 579.96
        },
        "term:syllable structure": {
          "x": 306.73,
          "y": 22.81
        },
        "term:onset": {
          "x": 430.23,
          "y": 22
        },
        "term:rime": {
          "x": 524.82,
          "y": 22
        },
        "term:coda": {
          "x": 602.02,
          "y": 22
        },
        "term:phonotactics": {
          "x": 612.41,
          "y": 135.69
        },
        "term:stress": {
          "x": 396.23,
          "y": 352.15
        },
        "term:tone": {
          "x": 139.73,
          "y": 532.03
        },
        "term:intonation": {
          "x": 111.28,
          "y": 365.04
        },
        "term:phonological environment": {
          "x": 522.65,
          "y": 276.83
        },
        "term:suprasegmental contrast": {
          "x": 443.84,
          "y": 511.64
        },
        "term:syllable as carrier": {
          "x": 313.75,
          "y": 250.5
        },
        "cluster:0": {
          "x": 682.62,
          "y": 439.19
        },
        "cluster:1": {
          "x": 395.46,
          "y": 136.82
        },
        "cluster:2": {
          "x": 258.45,
          "y": 436.48
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T08:11:24.179Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "phonemes-and-patterns",
      "puzzleRevision": "fnv1a32:8994de81",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:phoneme": {
          "x": 381.34,
          "y": 506.22,
          "pinned": false
        },
        "term:phone": {
          "x": 428.14,
          "y": 419.39,
          "pinned": true
        },
        "term:allophone": {
          "x": 453.02,
          "y": 583.97,
          "pinned": true
        },
        "term:minimal pair": {
          "x": 285.82,
          "y": 456.15,
          "pinned": false
        },
        "term:complementary distribution": {
          "x": 536.5,
          "y": 491.2,
          "pinned": false
        },
        "term:free variation": {
          "x": 299.08,
          "y": 585.37,
          "pinned": false
        },
        "term:syllable structure": {
          "x": 674.67,
          "y": 110.95,
          "pinned": false
        },
        "term:onset": {
          "x": 765.67,
          "y": 189.87,
          "pinned": false
        },
        "term:rime": {
          "x": 698.32,
          "y": 225.83,
          "pinned": false
        },
        "term:coda": {
          "x": 791.74,
          "y": 118.11,
          "pinned": false
        },
        "term:phonotactics": {
          "x": 600.15,
          "y": 232.4,
          "pinned": false
        },
        "term:stress": {
          "x": 352.04,
          "y": 168.19,
          "pinned": false
        },
        "term:tone": {
          "x": 303.08,
          "y": 105.57,
          "pinned": false
        },
        "term:intonation": {
          "x": 251.71,
          "y": 182.01,
          "pinned": false
        },
        "term:phonological environment": {
          "x": 696.31,
          "y": 362.02,
          "pinned": false
        },
        "term:suprasegmental contrast": {
          "x": 338.31,
          "y": 306.86,
          "pinned": false
        },
        "term:syllable as carrier": {
          "x": 502.8,
          "y": 124.07,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2605.9,
        "score": 2605.9041136716623
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T08:12:02.559Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "phonemes-and-patterns",
      "puzzleRevision": "fnv1a32:8994de81",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 727.45,
          "y": 234.31,
          "pinned": true
        },
        "cluster:1": {
          "x": 241.57,
          "y": 256.36,
          "pinned": true
        },
        "cluster:2": {
          "x": 460.96,
          "y": 463.33,
          "pinned": true
        }
      },
      "bridges": {
        "term:phonological environment": {
          "x": 480,
          "y": 179.36,
          "pinned": false
        },
        "term:suprasegmental contrast": {
          "x": 664.74,
          "y": 421.86,
          "pinned": false
        },
        "term:syllable as carrier": {
          "x": 464.89,
          "y": 308.52,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "phoneme",
          "phone",
          "allophone",
          "minimal pair",
          "complementary distribution",
          "free variation"
        ],
        "cluster:1": [
          "syllable structure",
          "onset",
          "rime",
          "coda",
          "phonotactics"
        ],
        "cluster:2": [
          "stress",
          "tone",
          "intonation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "phoneme",
          "minimal pair",
          "complementary distribution",
          "free variation",
          "allophone",
          "phone"
        ],
        "cluster:1": [
          "rime",
          "phonotactics",
          "syllable structure",
          "onset",
          "coda"
        ],
        "cluster:2": [
          "stress",
          "intonation",
          "tone"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 731.2596956386479
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T08:12:31.799Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
