// Generated from content/puzzles/morphemes-and-sentences.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "morphemes-and-sentences",
  "title": "Morphemes and Sentences",
  "category": "linguistics",
  "subcategories": {
    "linguistics": "morphology-syntax"
  },
  "info": {
    "text": "How language builds meaning at two levels: morphology assembles words from morphemes — deriving new words or inflecting old ones — and syntax assembles those words into hierarchical phrases and clauses, with agreement as the seam between the levels.",
    "links": [
      {
        "href": "wiki:Morphology (linguistics)"
      },
      {
        "href": "wiki:Syntax"
      }
    ],
    "citations": [
      {
        "title": "Morpheme",
        "url": "https://en.wikipedia.org/wiki/Morpheme"
      },
      {
        "title": "Inflection",
        "url": "https://en.wikipedia.org/wiki/Inflection"
      },
      {
        "title": "Constituent (linguistics)",
        "url": "https://en.wikipedia.org/wiki/Constituent_(linguistics)"
      },
      {
        "title": "Syntax",
        "url": "https://en.wikipedia.org/wiki/Syntax"
      }
    ]
  },
  "clusters": [
    {
      "id": "morpheme-kinds",
      "name": "The morpheme & its kinds",
      "color": "teal",
      "fact": "Words decompose into minimal meaningful units: some stand alone as words, others attach to a word's core.",
      "terms": [
        "morpheme",
        "free morpheme",
        "bound morpheme",
        "root",
        "stem",
        "affix",
        "prefix",
        "suffix"
      ],
      "seeds": [
        "morpheme",
        "suffix"
      ],
      "termInfo": {
        "affix": {
          "text": "A bound morpheme attached to a root or stem — the general category over prefixes and suffixes.",
          "links": [
            {
              "href": "wiki:Affix"
            }
          ]
        },
        "bound morpheme": {
          "text": "A morpheme that occurs only attached to another form — un-, -s, -tion.",
          "links": [
            {
              "href": "wiki:Bound and free morphemes"
            }
          ]
        },
        "free morpheme": {
          "text": "A morpheme that can stand alone as a word — dog, town, break.",
          "links": [
            {
              "href": "wiki:Bound and free morphemes"
            }
          ]
        },
        "morpheme": {
          "text": "The smallest meaningful unit of a language: 'unbreakable' is three of them (un- + break + -able).",
          "links": [
            {
              "href": "wiki:Morpheme"
            }
          ]
        },
        "prefix": {
          "text": "An affix attached before the root: un- in 'unkind'.",
          "links": [
            {
              "href": "wiki:Prefix"
            }
          ]
        },
        "root": {
          "text": "The core morpheme carrying a word's basic meaning: 'quirk' in 'quirkiness'.",
          "links": [
            {
              "href": "wiki:Root (linguistics)"
            }
          ]
        },
        "stem": {
          "text": "The base an affix attaches to, which may already contain a root plus earlier affixes: 'quirky' is the stem of 'quirkiness'.",
          "links": [
            {
              "href": "wiki:Word stem"
            }
          ]
        },
        "suffix": {
          "text": "An affix attached after the root: -ness in 'happiness'.",
          "links": [
            {
              "href": "wiki:Suffix"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Morpheme"
          }
        ]
      }
    },
    {
      "id": "word-formation",
      "name": "Derivation & inflection",
      "color": "blue",
      "fact": "Two ways words grow: derivational affixes build new dictionary words, inflectional affixes mark grammar on the word already there.",
      "terms": [
        "derivation",
        "inflection",
        "compounding",
        "allomorph",
        "lexeme"
      ],
      "seeds": [
        "inflection",
        "derivation"
      ],
      "termInfo": {
        "allomorph": {
          "text": "A variant form of one morpheme: the English plural -s surfaces as /s/ in 'cats', /z/ in 'dogs', /ɪz/ in 'dishes'.",
          "links": [
            {
              "href": "wiki:Allomorph"
            }
          ]
        },
        "compounding": {
          "text": "Joining complete words into a single new word: 'dog catcher', 'blackboard'.",
          "links": [
            {
              "href": "wiki:Compound (linguistics)"
            }
          ]
        },
        "derivation": {
          "text": "Word formation that creates a new lexeme, often changing part of speech: happy → happiness, kind → unkind.",
          "links": [
            {
              "href": "wiki:Morphological derivation"
            }
          ]
        },
        "inflection": {
          "text": "Marking grammatical categories — tense, number, person, case — without creating a new word: dog → dogs, wait → waited.",
          "links": [
            {
              "href": "wiki:Inflection"
            }
          ]
        },
        "lexeme": {
          "text": "The dictionary word underlying all its inflected forms: EAT covers 'eat', 'eats', 'ate', 'eaten'.",
          "links": [
            {
              "href": "wiki:Lexeme"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Inflection"
          }
        ]
      }
    },
    {
      "id": "constituents",
      "name": "Constituents & their tests",
      "color": "amber",
      "fact": "Sentences organize hierarchically: words group into phrases that act as single units, and diagnostics reveal which strings do.",
      "terms": [
        "constituent",
        "phrase",
        "head",
        "noun phrase",
        "verb phrase",
        "constituency test",
        "substitution",
        "topicalization (movement)"
      ],
      "seeds": [
        "noun phrase",
        "constituent"
      ],
      "termInfo": {
        "constituency test": {
          "text": "A diagnostic that reveals whether a string acts as one unit; the article catalogs fifteen, from coordination to clefting — no single test is decisive, so apply several.",
          "links": [
            {
              "href": "wiki:Constituent (linguistics)"
            }
          ]
        },
        "constituent": {
          "text": "A word or group of words functioning as a single unit within the sentence's hierarchy — the node of a tree diagram plus everything it dominates.",
          "links": [
            {
              "href": "wiki:Constituent (linguistics)"
            }
          ]
        },
        "head": {
          "text": "The central word a phrase is built around: the noun in 'the customers', the verb in 'put off the customers'.",
          "links": [
            {
              "href": "wiki:Head (linguistics)"
            }
          ]
        },
        "noun phrase": {
          "text": "A phrase headed by a noun, typically naming something: 'the customers' in 'we put off the customers'.",
          "links": [
            {
              "href": "wiki:Noun phrase"
            }
          ]
        },
        "phrase": {
          "text": "A sequence of one or more words built around a head and functioning as a unit — most constituents are phrases.",
          "links": [
            {
              "href": "wiki:Phrase"
            }
          ]
        },
        "substitution": {
          "text": "Replace the string with a stand-in — 'it', 'them', 'do so' — and see whether the sentence survives; the replacement marks the unit.",
          "links": [
            {
              "href": "wiki:Constituent (linguistics)"
            }
          ]
        },
        "topicalization (movement)": {
          "text": "Front the string as a block — 'The customers, we put off' — only constituents survive the move intact.",
          "links": [
            {
              "href": "wiki:Topicalization"
            }
          ]
        },
        "verb phrase": {
          "text": "A phrase headed by a verb, typically expressing the predicate: 'put off the customers'.",
          "links": [
            {
              "href": "wiki:Verb phrase"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Constituent (linguistics)"
          }
        ]
      }
    },
    {
      "id": "clause",
      "name": "Sentence architecture",
      "color": "magenta",
      "fact": "Phrases combine into clauses with jobs to do — a rule like S → NP VP names the division of labor.",
      "terms": [
        "phrase structure rule",
        "subject",
        "object",
        "agreement",
        "word order",
        "recursion"
      ],
      "seeds": [
        "subject",
        "agreement"
      ],
      "termInfo": {
        "agreement": {
          "text": "The requirement that related words match their inflection: 'the man jumpS' but 'the men jump' — the verb's ending copies the subject's number.",
          "links": [
            {
              "href": "wiki:Agreement (linguistics)"
            }
          ]
        },
        "object": {
          "text": "The grammatical relation naming what the verb acts on: 'the customers' in 'put off the customers'.",
          "links": [
            {
              "href": "wiki:Object (grammar)"
            }
          ]
        },
        "phrase structure rule": {
          "text": "A formula naming how a unit expands: S → NP VP divides every sentence into a subject noun phrase and a predicate verb phrase.",
          "links": [
            {
              "href": "wiki:Phrase structure rules"
            }
          ]
        },
        "recursion": {
          "text": "The capacity of phrases to contain phrases of the same type without limit — 'the dog [that chased the cat [that caught the rat]]'.",
          "links": [
            {
              "href": "wiki:Recursion"
            }
          ]
        },
        "subject": {
          "text": "The grammatical relation naming what the sentence is about — the noun phrase the verb agrees with: 'the man' in 'the man jumps'.",
          "links": [
            {
              "href": "wiki:Subject (grammar)"
            }
          ]
        },
        "word order": {
          "text": "A language's canonical sequencing of subject, verb, and object: English is SVO ('dogs chase cats'), and over 85% of languages are SVO or SOV.",
          "links": [
            {
              "href": "wiki:Word order"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Syntax"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "affixation",
      "term": "affixation",
      "clusters": [
        0,
        1
      ],
      "fact": "Both derivational and inflectional affixes attach to roots and stems: happy → happiness builds a new noun, while dog → dogs merely marks the plural on the noun already there.",
      "info": {
        "text": "Derivation and inflection are both affixation at work; the difference lies in what the new form counts as — a new word, or the same word marked for grammar.",
        "links": [
          {
            "href": "wiki:Affix"
          }
        ]
      },
      "idealTerms": [
        "affix",
        null
      ]
    },
    {
      "id": "morphosyntax",
      "term": "morphosyntax",
      "clusters": [
        1,
        3
      ],
      "fact": "Agreement is where syntax drives morphology: the grammatical relation between subject and verb forces an inflectional choice — 'the man jumpS', but 'the men jump'.",
      "info": {
        "text": "Agreement is the classic morphosyntactic phenomenon: a syntactic relation — being the subject — is signaled morphologically, by the -s on the verb.",
        "links": [
          {
            "href": "wiki:Agreement (linguistics)"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "inflection",
        "agreement"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    },
    {
      "id": "clause-structure",
      "term": "clause structure",
      "clusters": [
        2,
        3
      ],
      "fact": "The clause is built from phrase-level units: the rule S → NP VP says a sentence divides into a subject noun phrase and a predicate verb phrase.",
      "info": {
        "text": "Phrase structure rules like S → NP VP are the recipes the sentence hierarchy is written in.",
        "links": [
          {
            "href": "wiki:Phrase structure grammar"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "noun phrase",
        "phrase structure rule"
      ]
    },
    {
      "id": "the-word",
      "term": "the word",
      "clusters": [
        0,
        2
      ],
      "fact": "A free morpheme can stand alone as a word, and words are exactly what syntax combines into phrases — morphology hands off to syntax at the word boundary.",
      "info": {
        "text": "The word is the largest unit morphology builds and the smallest unit syntax moves.",
        "links": [
          {
            "href": "wiki:Word"
          }
        ]
      },
      "idealTerms": [
        "free morpheme",
        null
      ]
    }
  ],
  "lenses": [
    {
      "id": "cannot-stand-alone",
      "prompt": "Which terms name units that cannot stand alone as words?",
      "explanation": "Bound morphemes by definition only occur attached, and affix, prefix, and suffix are bound morphemes or their positions. Roots can go either way (dog is a free root; cran- in cranberry is bound), so root is excluded, and stems like quirky are themselves words that stand alone.",
      "targets": [
        "bound morpheme",
        "affix",
        "prefix",
        "suffix"
      ]
    },
    {
      "id": "dictionary-entries",
      "prompt": "Which word-formation processes create forms a dictionary would list as separate entries?",
      "explanation": "Derivation and compounding create new lexemes, which is why dictionaries list 'readable', 'readability', and 'dog catcher' as their own entries. Inflected forms like 'dogs' or 'waited' are not listed apart from their headwords — they are variants of one lexeme, not new words. Allomorph and lexeme name units and variants, not formation processes.",
      "targets": [
        "derivation",
        "compounding"
      ]
    },
    {
      "id": "constituency-diagnostics",
      "prompt": "Which terms name diagnostics that reveal whether a string acts as a single unit?",
      "explanation": "Constituency test names the class of diagnostics, and substitution and topicalization (movement) are its two canonical exemplars: only constituents can be replaced by a proform or moved to the front as a block. Noun phrase and verb phrase are the things the tests examine, not the tests themselves.",
      "targets": [
        "constituency test",
        "substitution",
        "topicalization (movement)"
      ]
    },
    {
      "id": "phrase-jobs",
      "prompt": "Which terms name what a noun phrase can do in a clause?",
      "explanation": "Subject and object are the grammatical relations a noun phrase can bear in a clause. Agreement is a matching requirement between words rather than a function of a phrase, word order is an ordering fact, recursion is a structural property, and phrase structure rule is the format of the rules, not a role a phrase plays.",
      "targets": [
        "subject",
        "object"
      ]
    },
    {
      "id": "agreement-hinge",
      "prompt": "Which terms name the matching requirement and the morphology it governs?",
      "explanation": "Agreement is the matching requirement itself, and inflection is the morphology it governs — the -s that appears on the verb when the subject is singular. Subject is the trigger of the matching, not the matching or the morphology, and derivation changes word identity rather than marking the relation.",
      "targets": [
        "agreement",
        "inflection"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Two Machines for Making Meaning",
    "summary": "How English builds words from morphemes — deriving new words or inflecting old ones — and then builds sentences from words, with agreement as the hinge between the two levels.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Language combines meaning twice. Inside the word, **morphology** assembles minimal meaningful units called **morphemes**: *unbreakable* is three of them — *un-* plus *break* plus *-able*. Above the word, **syntax** assembles words into phrases and sentences. The two levels have their own units, their own rules, and a famous hinge where they meet.\r\n\r\nMorphemes come in two kinds. A **free morpheme** can stand alone as a word — *dog*, *town*, *break* — while a **bound morpheme**, like *un-* or the plural *-s*, only occurs attached to something else. Inside a complex word, the **root** carries the core meaning (*quirk* in *quirkiness*), and the **stem** is whatever an affix attaches to — *quirky*, not just *quirk*, is the stem of *quirkiness*. An **affix** is any bound morpheme so attached: a **prefix** goes before the root (*unkind*), a **suffix** after it (*happiness*). Affixes do two very different jobs. **Derivation** builds a new dictionary word, often changing its part of speech: *happy* becomes *happiness*, *kind* becomes *unkind*. **Inflection** marks grammar without creating a new word: *dog*/*dogs*, *wait*/*waited* are one word, not two. The difference explains dictionary practice — *readable* and *readability* get their own entries, but *books* does not. Languages pack grammar differently: English spreads its inflections thinly, while Latin *ducam* ('I will lead') folds person, number, and tense into a single ending. One morpheme can even change shape depending on its surroundings: the plural **allomorph** is /s/ in *cats*, /z/ in *dogs*, /ɪz/ in *dishes*. And whole words can fuse directly in **compounding** (*dog catcher*).\r\n\r\nSyntax begins from a simple observation: sentences are not flat strings of words. Words group into **constituents** — units that act together — and phrases are constituents built around a **head**: a **noun phrase** like *the customers* is centered on its noun, a **verb phrase** like *put off the customers* on its verb. How do we know a string is a unit? **Constituency tests**: a **substitution** replaces the string with *it* or *them* and the sentence survives; **topicalization** moves the string to the front as a block, as in *The customers, we put off*. The largest architecture follows the **phrase structure rule** S → NP VP: every sentence divides into a subject noun phrase and a predicate verb phrase, whose grammatical relations — **subject** and **object** — name who does and what is acted on. Languages order those roles differently (**word order**: English is SVO, and over 85% of languages choose SVO or SOV), and phrases nest inside phrases of the same kind without limit — **recursion**, the property that lets one sentence embed another.\r\n\r\nThe hinge between the levels is **agreement**: *the man jumps* but *the men jump*. Nothing in the meaning requires that *-s*; the syntactic relation between subject and verb forces an inflectional choice. That is the whole architecture in miniature: free morphemes stand alone as words, and words are exactly what syntax moves — two machines, one handing off to the other."
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
  },
  "boardLimitWaivers": [
    {
      "waiverType": "cluster-term-count",
      "puzzleId": "morphemes-and-sentences",
      "targetId": "constituents",
      "approvedCount": 8,
      "reason": "The constituents cluster carries eight genuinely distinct ideas, each sourced from the Constituent (linguistics) article: the structural unit itself (constituent), the head-centered unit (phrase), what phrases are built around (head), the two clause-critical phrase types (noun phrase, verb phrase), and the diagnostics that reveal constituency (constituency test as the category, with substitution and topicalization/movement as the two canonical exemplars — the article catalogs fifteen tests and these two are the most-used contrastive pair). No two terms do one job; the board total (31 nodes including bridges) is within the 32-node ceiling, so only the per-cluster count needs approval.",
      "grantedBy": "f7f08663-aecc-5415-8e02-383a6bb9b480",
      "grantedAt": "2026-10-16T19:34:17.983Z"
    },
    {
      "waiverType": "cluster-term-count",
      "puzzleId": "morphemes-and-sentences",
      "targetId": "morpheme-kinds",
      "approvedCount": 8,
      "reason": "The morpheme-and-its-kinds cluster carries eight genuinely distinct units, each doing a different job on the board: the minimal unit itself (morpheme), its two distribution classes (free vs bound morpheme), the word's core (root), the attachment base (stem — root plus derivational material, distinct in 'quirkiness'), and the attachment machinery (affix, with prefix and suffix as the two positions English uses). Dropping any one loses a distinction the inventory sourced from the Morpheme article; the board total (31 nodes including bridges) is within the 32-node ceiling, so only the per-cluster count needs approval.",
      "grantedBy": "f7f08663-aecc-5415-8e02-383a6bb9b480",
      "grantedAt": "2026-10-16T19:34:29.066Z"
    }
  ]
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "morphemes-and-sentences",
      "puzzleRevision": "fnv1a32:8ac5be6f",
      "board": {
        "width": 1210,
        "height": 780
      },
      "nodes": {
        "term:morpheme": {
          "x": 886.25,
          "y": 249.31
        },
        "term:free morpheme": {
          "x": 770.06,
          "y": 334.34
        },
        "term:bound morpheme": {
          "x": 1005.78,
          "y": 270.08
        },
        "term:root": {
          "x": 1059.29,
          "y": 364.67
        },
        "term:stem": {
          "x": 1031.57,
          "y": 436.71
        },
        "term:affix": {
          "x": 780.3,
          "y": 467.33
        },
        "term:prefix": {
          "x": 993.5,
          "y": 511.03
        },
        "term:suffix": {
          "x": 911.41,
          "y": 547.54
        },
        "term:derivation": {
          "x": 827.75,
          "y": 678.3
        },
        "term:inflection": {
          "x": 475.03,
          "y": 642.09
        },
        "term:compounding": {
          "x": 720.26,
          "y": 745.11
        },
        "term:allomorph": {
          "x": 575.55,
          "y": 749.07
        },
        "term:lexeme": {
          "x": 471.49,
          "y": 727.38
        },
        "term:constituent": {
          "x": 255.97,
          "y": 209.22
        },
        "term:phrase": {
          "x": 169.67,
          "y": 144.56
        },
        "term:head": {
          "x": 211.95,
          "y": 84.99
        },
        "term:noun phrase": {
          "x": 415.31,
          "y": 257.6
        },
        "term:verb phrase": {
          "x": 276.89,
          "y": 34.89
        },
        "term:constituency test": {
          "x": 418.26,
          "y": 22
        },
        "term:substitution": {
          "x": 567.61,
          "y": 22
        },
        "term:topicalization (movement)": {
          "x": 662.84,
          "y": 94.02
        },
        "term:phrase structure rule": {
          "x": 447.11,
          "y": 379.96
        },
        "term:subject": {
          "x": 248.47,
          "y": 564.71
        },
        "term:object": {
          "x": 141.86,
          "y": 477.73
        },
        "term:agreement": {
          "x": 379.19,
          "y": 501.62
        },
        "term:word order": {
          "x": 127.55,
          "y": 376.33
        },
        "term:recursion": {
          "x": 239.73,
          "y": 319.4
        },
        "term:affixation": {
          "x": 772.93,
          "y": 560.1
        },
        "term:morphosyntax": {
          "x": 552.83,
          "y": 533.83
        },
        "term:clause structure": {
          "x": 594.39,
          "y": 309.7
        },
        "term:the word": {
          "x": 711.32,
          "y": 242.24
        },
        "cluster:0": {
          "x": 895.76,
          "y": 401.88
        },
        "cluster:1": {
          "x": 650.96,
          "y": 628.72
        },
        "cluster:2": {
          "x": 465.42,
          "y": 181.11
        },
        "cluster:3": {
          "x": 268.79,
          "y": 426.01
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T19:37:45.268Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "morphemes-and-sentences",
      "puzzleRevision": "fnv1a32:8ac5be6f",
      "board": {
        "width": 1210,
        "height": 780
      },
      "nodes": {
        "term:morpheme": {
          "x": 527.55,
          "y": 675.31,
          "pinned": false
        },
        "term:free morpheme": {
          "x": 577.65,
          "y": 572.75,
          "pinned": false
        },
        "term:bound morpheme": {
          "x": 652.43,
          "y": 682.79,
          "pinned": false
        },
        "term:root": {
          "x": 490.57,
          "y": 752.73,
          "pinned": false
        },
        "term:stem": {
          "x": 444.28,
          "y": 696.02,
          "pinned": false
        },
        "term:affix": {
          "x": 478.89,
          "y": 537.99,
          "pinned": false
        },
        "term:prefix": {
          "x": 569.95,
          "y": 757,
          "pinned": false
        },
        "term:suffix": {
          "x": 455.94,
          "y": 617.39,
          "pinned": false
        },
        "term:derivation": {
          "x": 215.69,
          "y": 311.54,
          "pinned": false
        },
        "term:inflection": {
          "x": 308.98,
          "y": 371.68,
          "pinned": false
        },
        "term:compounding": {
          "x": 208.28,
          "y": 425.44,
          "pinned": false
        },
        "term:allomorph": {
          "x": 305.24,
          "y": 479.47,
          "pinned": false
        },
        "term:lexeme": {
          "x": 306.36,
          "y": 273.32,
          "pinned": false
        },
        "term:constituent": {
          "x": 933.6,
          "y": 433.17,
          "pinned": true
        },
        "term:phrase": {
          "x": 944.66,
          "y": 276.5,
          "pinned": false
        },
        "term:head": {
          "x": 873.55,
          "y": 240.99,
          "pinned": false
        },
        "term:noun phrase": {
          "x": 760.29,
          "y": 391.43,
          "pinned": false
        },
        "term:verb phrase": {
          "x": 716.55,
          "y": 500.27,
          "pinned": false
        },
        "term:constituency test": {
          "x": 760.3,
          "y": 255.23,
          "pinned": false
        },
        "term:substitution": {
          "x": 981.88,
          "y": 374.35,
          "pinned": false
        },
        "term:topicalization (movement)": {
          "x": 877.93,
          "y": 501.91,
          "pinned": false
        },
        "term:phrase structure rule": {
          "x": 609.94,
          "y": 180.68,
          "pinned": false
        },
        "term:subject": {
          "x": 490.54,
          "y": 115.16,
          "pinned": false
        },
        "term:object": {
          "x": 403.22,
          "y": 132.11,
          "pinned": false
        },
        "term:agreement": {
          "x": 470.82,
          "y": 211.56,
          "pinned": false
        },
        "term:word order": {
          "x": 562.1,
          "y": 43.12,
          "pinned": false
        },
        "term:recursion": {
          "x": 456.14,
          "y": 23,
          "pinned": false
        },
        "term:affixation": {
          "x": 406.74,
          "y": 443.01,
          "pinned": false
        },
        "term:morphosyntax": {
          "x": 405.99,
          "y": 305.51,
          "pinned": false
        },
        "term:clause structure": {
          "x": 636.33,
          "y": 343.09,
          "pinned": false
        },
        "term:the word": {
          "x": 614.7,
          "y": 464.79,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4442.89,
        "score": 4442.885379140145
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T19:38:17.218Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "morphemes-and-sentences",
      "puzzleRevision": "fnv1a32:8ac5be6f",
      "board": {
        "width": 1210,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 644.67,
          "y": 566.81,
          "pinned": true
        },
        "cluster:1": {
          "x": 1026.24,
          "y": 400.98,
          "pinned": true
        },
        "cluster:2": {
          "x": 243.27,
          "y": 398,
          "pinned": false
        },
        "cluster:3": {
          "x": 661.53,
          "y": 198.44,
          "pinned": true
        }
      },
      "bridges": {
        "term:affixation": {
          "x": 817.22,
          "y": 383.33,
          "pinned": true
        },
        "term:morphosyntax": {
          "x": 918.73,
          "y": 246.68,
          "pinned": true
        },
        "term:clause structure": {
          "x": 407.15,
          "y": 169.41,
          "pinned": true
        },
        "term:the word": {
          "x": 486.74,
          "y": 383.84,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "morpheme",
          "free morpheme",
          "bound morpheme",
          "root",
          "stem",
          "affix",
          "prefix",
          "suffix"
        ],
        "cluster:1": [
          "derivation",
          "inflection",
          "compounding",
          "allomorph",
          "lexeme"
        ],
        "cluster:2": [
          "constituent",
          "phrase",
          "head",
          "noun phrase",
          "verb phrase",
          "constituency test",
          "substitution",
          "topicalization (movement)"
        ],
        "cluster:3": [
          "phrase structure rule",
          "subject",
          "object",
          "agreement",
          "word order",
          "recursion"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "root",
          "free morpheme",
          "affix",
          "bound morpheme",
          "morpheme",
          "suffix",
          "prefix",
          "stem"
        ],
        "cluster:1": [
          "lexeme",
          "inflection",
          "compounding",
          "derivation",
          "allomorph"
        ],
        "cluster:2": [
          "phrase",
          "noun phrase",
          "substitution",
          "topicalization (movement)",
          "constituency test",
          "constituent",
          "verb phrase",
          "head"
        ],
        "cluster:3": [
          "subject",
          "phrase structure rule",
          "word order",
          "agreement",
          "recursion",
          "object"
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
        "totalLength": 1178.3629149828785
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T19:38:59.640Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-16T19:37:53.796Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
