// Generated from content/puzzles/consonants-and-vowels.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "consonants-and-vowels",
  "title": "Consonants and Vowels",
  "category": "linguistics",
  "subcategories": {
    "linguistics": "phonetics-phonology"
  },
  "info": {
    "text": "How phonetics describes the raw material of speech: every consonant located by place, manner, and voicing; every vowel by height, backness, and rounding — and the English production detail the sound system ignores.",
    "links": [
      {
        "href": "wiki:Phonetics"
      },
      {
        "href": "wiki:Articulatory phonetics"
      }
    ],
    "citations": [
      {
        "title": "Phonetics",
        "url": "https://en.wikipedia.org/wiki/Phonetics"
      },
      {
        "title": "Place of articulation",
        "url": "https://en.wikipedia.org/wiki/Place_of_articulation"
      },
      {
        "title": "Vowel",
        "url": "https://en.wikipedia.org/wiki/Vowel"
      },
      {
        "title": "Phoneme",
        "url": "https://en.wikipedia.org/wiki/Phoneme"
      }
    ]
  },
  "clusters": [
    {
      "id": "place",
      "name": "Consonant place",
      "color": "teal",
      "fact": "Where in the vocal tract a consonant's constriction is made — from the lips at the front to the glottis deep in the throat.",
      "terms": [
        "bilabial",
        "labiodental",
        "alveolar",
        "palatal",
        "velar",
        "glottal"
      ],
      "seeds": [
        "bilabial",
        "glottal"
      ],
      "termInfo": {
        "alveolar": {
          "text": "Tongue tip or blade at the ridge just behind the upper teeth — /t/, /d/, /s/, /z/, /n/, /l/.",
          "links": [
            {
              "href": "wiki:Alveolar consonant"
            }
          ]
        },
        "bilabial": {
          "text": "Both lips come together — /p/, /b/, /m/.",
          "links": [
            {
              "href": "wiki:Bilabial consonant"
            }
          ]
        },
        "glottal": {
          "text": "Constriction at the glottis itself, the opening between the vocal folds — /h/ and the glottal stop.",
          "links": [
            {
              "href": "wiki:Glottal consonant"
            }
          ]
        },
        "labiodental": {
          "text": "Lower lip against the upper teeth — /f/, /v/.",
          "links": [
            {
              "href": "wiki:Labiodental consonant"
            }
          ]
        },
        "palatal": {
          "text": "Tongue body rises toward the hard palate — /j/ (with /ʃ/, /ʒ/ just behind it).",
          "links": [
            {
              "href": "wiki:Palatal consonant"
            }
          ]
        },
        "velar": {
          "text": "Back of the tongue against the soft palate — /k/, /ɡ/, /ŋ/.",
          "links": [
            {
              "href": "wiki:Velar consonant"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Place of articulation"
          }
        ]
      }
    },
    {
      "id": "manner",
      "name": "Consonant manner",
      "color": "blue",
      "fact": "How the airstream is obstructed at the chosen place — blocked and burst, squeezed into hiss, or let past with room to spare.",
      "terms": [
        "plosive (stop)",
        "fricative",
        "affricate",
        "nasal",
        "approximant",
        "lateral"
      ],
      "seeds": [
        "fricative",
        "nasal"
      ],
      "termInfo": {
        "affricate": {
          "text": "A stop closure released into a fricative at the same place — /tʃ/ as in 'church'.",
          "links": [
            {
              "href": "wiki:Affricate"
            }
          ]
        },
        "approximant": {
          "text": "The articulators come close but not close enough to cause turbulence — /j/, /w/, /ɹ/.",
          "links": [
            {
              "href": "wiki:Approximant"
            }
          ]
        },
        "fricative": {
          "text": "Air forced through a narrow gap, producing continuous turbulent noise — /s/, /z/, /f/, /v/.",
          "links": [
            {
              "href": "wiki:Fricative"
            }
          ]
        },
        "lateral": {
          "text": "The tongue blocks the centerline while air escapes around the sides — /l/ as in 'law'.",
          "links": [
            {
              "href": "wiki:Lateral consonant"
            }
          ]
        },
        "nasal": {
          "text": "Complete oral closure with the velum lowered so air escapes through the nose — /m/, /n/, /ŋ/.",
          "links": [
            {
              "href": "wiki:Nasal consonant"
            }
          ]
        },
        "plosive (stop)": {
          "text": "Complete blockage of the airstream, then a burst release — /p/, /t/, /k/.",
          "links": [
            {
              "href": "wiki:Plosive"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Manner of articulation"
          }
        ]
      }
    },
    {
      "id": "phonation",
      "name": "Voicing & phonation",
      "color": "amber",
      "fact": "The laryngeal parameter: whether the vocal folds vibrate during a sound — and the other things the folds themselves can do.",
      "terms": [
        "voicing",
        "aspiration",
        "glottal stop"
      ],
      "seeds": [
        "voicing",
        "glottal stop"
      ],
      "termInfo": {
        "aspiration": {
          "text": "A puff of air following a voiceless stop's release: strong syllable-initially in English ('pot'), absent after /s/ ('spot') — and contrastive in Thai and Hindi.",
          "links": [
            {
              "href": "wiki:Aspirated consonant"
            }
          ]
        },
        "glottal stop": {
          "text": "Complete closure of the vocal folds themselves — the catch in 'uh-oh'.",
          "links": [
            {
              "href": "wiki:Glottal stop"
            }
          ]
        },
        "voicing": {
          "text": "Whether the vocal folds vibrate during a sound: /z/ is voiced, /s/ voiceless — same place, same manner.",
          "links": [
            {
              "href": "wiki:Voice (phonetics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Phonation"
          }
        ]
      }
    },
    {
      "id": "vowel-quality",
      "name": "Vowel quality",
      "color": "magenta",
      "fact": "The dimensions along which vowels differ — tongue height, tongue backness, lip rounding — plus the glides and reductions vowels undergo.",
      "terms": [
        "vowel height",
        "backness",
        "roundedness",
        "monophthong",
        "diphthong",
        "schwa (reduced vowel)",
        "tenseness"
      ],
      "seeds": [
        "diphthong",
        "schwa (reduced vowel)"
      ],
      "termInfo": {
        "backness": {
          "text": "How far forward or back the tongue body sits: front /i/ as in 'beat', central /ə/, back /u/ as in 'boot'.",
          "links": [
            {
              "href": "wiki:Back vowel"
            }
          ]
        },
        "diphthong": {
          "text": "A vowel that glides from one quality to another within a single syllable — /aɪ/ as in 'price'.",
          "links": [
            {
              "href": "wiki:Diphthong"
            }
          ]
        },
        "monophthong": {
          "text": "A vowel of stable quality throughout its duration — a 'pure' vowel, like the /ɪ/ of 'hit'.",
          "links": [
            {
              "href": "wiki:Monophthong"
            }
          ]
        },
        "roundedness": {
          "text": "Lip posture while voweling: rounded (lips pursed, as in /u/) versus unrounded (spread, as in /i/) — contrastive in French and German.",
          "links": [
            {
              "href": "wiki:Roundedness"
            }
          ]
        },
        "schwa (reduced vowel)": {
          "text": "The mid-central vowel /ə/ of unstressed syllables — the ending of 'sofa' — toward which English reduces unstressed vowels.",
          "links": [
            {
              "href": "wiki:Mid central vowel"
            }
          ]
        },
        "tenseness": {
          "text": "The tense/lax opposition of Germanic languages: tense /i/ in 'seat' versus lax /ɪ/ in 'sit'.",
          "links": [
            {
              "href": "wiki:Tenseness"
            }
          ]
        },
        "vowel height": {
          "text": "How close the tongue body is to the palate: close (high) /i/ and /u/ versus open (low) /a/ as in 'father'.",
          "links": [
            {
              "href": "wiki:Close vowel"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Vowel"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "identifying-a-consonant",
      "term": "identifying a consonant",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A consonant's full description is the product of three independent choices: /p/ vs /t/ differs in place, /p/ vs /f/ in manner, and /p/ vs /b/ in voicing.",
      "info": {
        "text": "The three descriptive parameters behind the IPA consonant chart: every consonant is named by its place, its manner, and its voicing.",
        "links": [
          {
            "href": "wiki:Consonant"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "semivowel",
      "term": "semivowel",
      "clusters": [
        1,
        3
      ],
      "fact": "[j] and [w] are phonetically vowel-like but non-syllabic, so phonology files them with the consonants — syllable position draws the consonant/vowel line.",
      "info": {
        "text": "Why the y in 'yes' and the w in 'wet' count as consonants despite sounding like the vowels /i/ and /u/: they are non-syllabic.",
        "links": [
          {
            "href": "wiki:Semivowel"
          }
        ]
      },
      "idealTerms": [
        "approximant",
        null
      ]
    },
    {
      "id": "aspiration",
      "term": "English aspiration",
      "clusters": [
        1,
        2
      ],
      "fact": "English voiceless stops get a puff of air syllable-initially — aspirated [pʰ] in 'pot' but plain [p] in 'spot' — a production detail the English sound system treats as irrelevant.",
      "info": {
        "text": "The English pattern: voiceless stops take a puff of air at the start of a syllable. Say 'pot' and 'spot' aloud — the puff after the p in 'pot' is absent in 'spot', yet English treats both as the same sound.",
        "links": [
          {
            "href": "wiki:Aspirated consonant"
          }
        ]
      },
      "idealTerms": [
        "plosive (stop)",
        "aspiration"
      ]
    }
  ],
  "lenses": [
    {
      "id": "lip-places",
      "prompt": "Which places of articulation involve the lips?",
      "explanation": "Bilabial sounds use both lips (/p/, /b/, /m/); labiodental ones touch the lower lip to the upper teeth (/f/, /v/). Every other place on this board is made with the tongue or at the glottis, with no lip involvement.",
      "targets": [
        "bilabial",
        "labiodental"
      ]
    },
    {
      "id": "complete-closure",
      "prompt": "Which manners of articulation are made with a complete closure of the vocal tract?",
      "explanation": "A plosive (stop) blocks the airstream entirely and releases it as a burst; an affricate begins with that same closure and releases it into a fricative; a nasal closes the oral tract completely but lets air escape through the nose. Fricatives and approximants never fully close the tract, and a lateral blocks only the centerline while air flows around the sides.",
      "targets": [
        "plosive (stop)",
        "affricate",
        "nasal"
      ]
    },
    {
      "id": "vowel-dimensions",
      "prompt": "Which three dimensions independently locate a vowel's quality?",
      "explanation": "Every vowel quality is pinned down by how high the tongue is, how far forward or back it sits, and whether the lips are rounded. Monophthong, diphthong, and schwa (reduced vowel) describe vowel types and reductions — not dimensions.",
      "targets": [
        "vowel height",
        "backness",
        "roundedness"
      ]
    },
    {
      "id": "category-straddlers",
      "prompt": "Which terms name a consonant defined by straddling two categories at once?",
      "explanation": "An affricate is one consonant that begins as a stop and releases as a fricative; a semivowel is one consonant that is phonetically a vowel but never carries a syllable. Diphthongs straddle vowel qualities too, but they are vowels, not consonants — hence the bounding to consonants.",
      "targets": [
        "affricate",
        "semivowel"
      ]
    },
    {
      "id": "glottal-articulations",
      "prompt": "Which terms name articulations formed at the glottis itself?",
      "explanation": "Both are formed at the glottis itself, the opening between the vocal folds: the glottal place constricts there (as /h/ does), and a glottal stop closes the folds completely. Aspiration is a release-timing detail of stops made higher in the tract, not an articulation at the glottis; voicing is something the folds do, not a place of articulation.",
      "targets": [
        "glottal",
        "glottal stop"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "phonemes-and-patterns",
        "reason": "Play after Consonants and Vowels to see how the sounds described here become a language's system of phonemes, allophones, syllables, and stress."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The Raw Material of Speech",
    "summary": "How speech sounds are physically produced: the three choices that describe any consonant, the dimensions that describe any vowel, and the English detail the sound system ignores.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every spoken word is a sequence of gestures. The tongue, lips, and vocal folds block, squeeze, and release the airstream in patterns that differ minutely from language to language, and **phonetics** is the branch of linguistics that describes those gestures precisely enough to compare any two sounds in any language.\r\n\r\n**Consonants** are described by three independent choices. First, **place of articulation** — where the constriction happens: **bilabial** sounds like /p/ bring both lips together, **labiodental** ones like /f/ touch lip to teeth, **alveolar** ones like /t/ press the tongue just behind the teeth, **palatal** ones like /j/ raise the tongue toward the hard palate, **velar** ones like /k/ contact the soft palate, and **glottal** ones like /h/ form at the vocal folds themselves. Second, **manner of articulation** — how the airstream is obstructed there: a **plosive (stop)** blocks it completely and releases a burst; a **fricative** like /s/ squeezes it into continuous hiss; an **affricate** like the 'ch' in 'church' does one and then the other; a **nasal** like /m/ lets the air escape through the nose; an **approximant** narrows the tract without turbulence; and a **lateral** like /l/ lets air flow around the sides of the tongue. Third, **voicing** — whether the vocal folds vibrate during the sound, the only difference between /z/ and /s/.\r\n\r\nThe folds do more than buzz. A **glottal stop** is a complete closure of the folds themselves — the catch in 'uh-oh' — and **aspiration** is the puff of air that follows a voiceless stop in some positions: hold a hand before your mouth and compare 'pot' with 'spot'.\r\n\r\n**Vowels** involve no constriction at all. A vowel's quality is located by three dimensions: **vowel height** (tongue high as in 'beat' or low as in 'bat'), **backness** (front 'beat' versus back 'boot'), and **roundedness** (lips pursed or spread). A **monophthong** holds one quality steady; a **diphthong** glides between two within a single syllable, as in 'price'; and in unstressed syllables vowels reduce toward the colorless **schwa (reduced vowel)** at the end of 'sofa'. English also pairs tense and lax vowels — 'seat' versus 'sit' — a **tenseness** contrast largely confined to Germanic languages.\r\n\r\nOne boundary case shows how phonetic fact and linguistic classification differ: the **semivowel**. The sounds /j/ and /w/ are phonetically vowel-like, but because they never carry a syllable, languages count them among the consonants. And 'pot' versus 'spot' hides a deeper lesson: English treats that puff of aspiration as irrelevant — but other languages build word meanings on it. How a language decides which sound differences matter is the subject of the companion lesson, *Phonemes and Patterns*."
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
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "consonants-and-vowels",
      "puzzleRevision": "fnv1a32:3f78be13",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:bilabial": {
          "x": 357.28,
          "y": 469.27,
          "pinned": false
        },
        "term:labiodental": {
          "x": 252.66,
          "y": 495.46,
          "pinned": false
        },
        "term:alveolar": {
          "x": 426.42,
          "y": 539.29,
          "pinned": false
        },
        "term:palatal": {
          "x": 272.24,
          "y": 392.61,
          "pinned": false
        },
        "term:velar": {
          "x": 357.15,
          "y": 380.32,
          "pinned": false
        },
        "term:glottal": {
          "x": 333.82,
          "y": 561.59,
          "pinned": false
        },
        "term:plosive (stop)": {
          "x": 626.24,
          "y": 315.56,
          "pinned": false
        },
        "term:fricative": {
          "x": 665.55,
          "y": 429.41,
          "pinned": false
        },
        "term:affricate": {
          "x": 764.5,
          "y": 463.63,
          "pinned": false
        },
        "term:nasal": {
          "x": 605.93,
          "y": 499.6,
          "pinned": false
        },
        "term:approximant": {
          "x": 747.01,
          "y": 354.02,
          "pinned": false
        },
        "term:lateral": {
          "x": 687.8,
          "y": 525.26,
          "pinned": false
        },
        "term:voicing": {
          "x": 385.1,
          "y": 299.2,
          "pinned": false
        },
        "term:aspiration": {
          "x": 371.17,
          "y": 198.61,
          "pinned": false
        },
        "term:glottal stop": {
          "x": 280.48,
          "y": 273,
          "pinned": false
        },
        "term:vowel height": {
          "x": 900.2,
          "y": 194.92,
          "pinned": false
        },
        "term:backness": {
          "x": 632.75,
          "y": 36.03,
          "pinned": true
        },
        "term:roundedness": {
          "x": 750.43,
          "y": 29.34,
          "pinned": false
        },
        "term:monophthong": {
          "x": 867.6,
          "y": 23.72,
          "pinned": false
        },
        "term:diphthong": {
          "x": 813.54,
          "y": 120.66,
          "pinned": false
        },
        "term:schwa (reduced vowel)": {
          "x": 676.1,
          "y": 158.25,
          "pinned": false
        },
        "term:tenseness": {
          "x": 794.4,
          "y": 237.68,
          "pinned": false
        },
        "term:identifying a consonant": {
          "x": 490.41,
          "y": 408.45,
          "pinned": false
        },
        "term:semivowel": {
          "x": 873.77,
          "y": 305.96,
          "pinned": false
        },
        "term:English aspiration": {
          "x": 503.27,
          "y": 231.77,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3565.38,
        "score": 3565.379160972104
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T06:57:58.567Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "consonants-and-vowels",
      "puzzleRevision": "fnv1a32:3f78be13",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 545.68,
          "y": 143.4,
          "pinned": true
        },
        "cluster:1": {
          "x": 409.39,
          "y": 467.25,
          "pinned": true
        },
        "cluster:2": {
          "x": 842.26,
          "y": 403.13,
          "pinned": true
        },
        "cluster:3": {
          "x": 180.61,
          "y": 200.89,
          "pinned": true
        }
      },
      "bridges": {
        "term:identifying a consonant": {
          "x": 633.95,
          "y": 327.46,
          "pinned": true
        },
        "term:semivowel": {
          "x": 142.85,
          "y": 475.79,
          "pinned": true
        },
        "term:English aspiration": {
          "x": 672.36,
          "y": 525.26,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "bilabial",
          "labiodental",
          "alveolar",
          "palatal",
          "velar",
          "glottal"
        ],
        "cluster:1": [
          "plosive (stop)",
          "fricative",
          "affricate",
          "nasal",
          "approximant",
          "lateral"
        ],
        "cluster:2": [
          "voicing",
          "aspiration",
          "glottal stop"
        ],
        "cluster:3": [
          "vowel height",
          "backness",
          "roundedness",
          "monophthong",
          "diphthong",
          "schwa (reduced vowel)",
          "tenseness"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "glottal",
          "alveolar",
          "labiodental",
          "bilabial",
          "palatal",
          "velar"
        ],
        "cluster:1": [
          "lateral",
          "approximant",
          "plosive (stop)",
          "fricative",
          "affricate",
          "nasal"
        ],
        "cluster:2": [
          "voicing",
          "glottal stop",
          "aspiration"
        ],
        "cluster:3": [
          "backness",
          "tenseness",
          "monophthong",
          "schwa (reduced vowel)",
          "vowel height",
          "roundedness",
          "diphthong"
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
        "totalLength": 1049.2341251422738
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T06:57:29.909Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "consonants-and-vowels",
      "puzzleRevision": "fnv1a32:3f78be13",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:bilabial": {
          "x": 759.96,
          "y": 126.37
        },
        "term:labiodental": {
          "x": 815.92,
          "y": 223.1
        },
        "term:alveolar": {
          "x": 902.21,
          "y": 294.26
        },
        "term:palatal": {
          "x": 824.1,
          "y": 355.48
        },
        "term:velar": {
          "x": 816.67,
          "y": 444.98
        },
        "term:glottal": {
          "x": 727.39,
          "y": 435.3
        },
        "term:plosive (stop)": {
          "x": 234.52,
          "y": 440.25
        },
        "term:fricative": {
          "x": 111.8,
          "y": 459.97
        },
        "term:affricate": {
          "x": 124.92,
          "y": 352.07
        },
        "term:nasal": {
          "x": 90.44,
          "y": 262.38
        },
        "term:approximant": {
          "x": 388.15,
          "y": 267.06
        },
        "term:lateral": {
          "x": 160.86,
          "y": 206.92
        },
        "term:voicing": {
          "x": 616,
          "y": 598
        },
        "term:aspiration": {
          "x": 319.77,
          "y": 534.71
        },
        "term:glottal stop": {
          "x": 422.18,
          "y": 598
        },
        "term:vowel height": {
          "x": 217.38,
          "y": 110.53
        },
        "term:backness": {
          "x": 289.28,
          "y": 22
        },
        "term:roundedness": {
          "x": 400.96,
          "y": 22
        },
        "term:monophthong": {
          "x": 554.83,
          "y": 130.01
        },
        "term:diphthong": {
          "x": 515.81,
          "y": 22
        },
        "term:schwa (reduced vowel)": {
          "x": 662.31,
          "y": 22
        },
        "term:tenseness": {
          "x": 663.1,
          "y": 168.15
        },
        "term:identifying a consonant": {
          "x": 540.78,
          "y": 311.92
        },
        "term:semivowel": {
          "x": 312.36,
          "y": 180.53
        },
        "term:English aspiration": {
          "x": 384.63,
          "y": 410.36
        },
        "cluster:0": {
          "x": 712.43,
          "y": 308.04
        },
        "cluster:1": {
          "x": 249.03,
          "y": 294.73
        },
        "cluster:2": {
          "x": 529.98,
          "y": 495.91
        },
        "cluster:3": {
          "x": 428.52,
          "y": 146.05
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T06:57:42.573Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-17T06:29:11.619Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
