// Generated from content/puzzles/language-in-society.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "language-in-society",
  "title": "Language in Society",
  "category": "linguistics",
  "subcategories": {
    "linguistics": "sociolinguistics"
  },
  "info": {
    "text": "How sociolinguistics reads speech as social signal: who you are (dialect to idiolect), what you are doing (register and style), how prestige ranks every choice in two directions at once, and how communities are united by shared judgments rather than shared speech.",
    "links": [
      {
        "href": "wiki:Sociolinguistics"
      },
      {
        "href": "wiki:Prestige (sociolinguistics)"
      }
    ],
    "citations": [
      {
        "title": "Dialect",
        "url": "https://en.wikipedia.org/wiki/Dialect"
      },
      {
        "title": "Register (sociolinguistics)",
        "url": "https://en.wikipedia.org/wiki/Register_(sociolinguistics)"
      },
      {
        "title": "Prestige (sociolinguistics)",
        "url": "https://en.wikipedia.org/wiki/Prestige_(sociolinguistics)"
      },
      {
        "title": "Speech community",
        "url": "https://en.wikipedia.org/wiki/Speech_community"
      }
    ]
  },
  "clusters": [
    {
      "id": "user-varieties",
      "name": "Varieties by the user",
      "color": "teal",
      "fact": "Who you are shows in how you speak: every speaker carries a dialect, an accent, a social variety, and a personal one.",
      "terms": [
        "dialect",
        "sociolect",
        "accent",
        "idiolect",
        "standard language",
        "vernacular"
      ],
      "seeds": [
        "dialect",
        "accent"
      ],
      "termInfo": {
        "accent": {
          "text": "Variation in pronunciation only — many linguists treat accent differences as a subset of dialect differences.",
          "links": [
            {
              "href": "wiki:Accent (sociolinguistics)"
            }
          ]
        },
        "dialect": {
          "text": "Any variety of a language shared by a group — 'everybody speaks a dialect', including standard speakers.",
          "links": [
            {
              "href": "wiki:Dialect"
            }
          ]
        },
        "idiolect": {
          "text": "The unique variety of one individual — no two people speak exactly alike.",
          "links": [
            {
              "href": "wiki:Idiolect"
            }
          ]
        },
        "standard language": {
          "text": "The institutionally backed variety — taught in schools, codified in dictionaries and grammars.",
          "links": [
            {
              "href": "wiki:Standard language"
            }
          ]
        },
        "sociolect": {
          "text": "The variety associated with a social class or group — class markers in vocabulary and grammar.",
          "links": [
            {
              "href": "wiki:Sociolect"
            }
          ]
        },
        "vernacular": {
          "text": "The everyday, non-codified variety people actually grow up speaking.",
          "links": [
            {
              "href": "wiki:Vernacular"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Dialect"
          }
        ]
      }
    },
    {
      "id": "use-varieties",
      "name": "Varieties by the situation",
      "color": "blue",
      "fact": "What you are doing shapes how you speak just as much: the same speaker selects a variety for the occasion and tunes it to the audience.",
      "terms": [
        "register",
        "style-shifting",
        "audience design",
        "jargon",
        "slang"
      ],
      "seeds": [
        "register",
        "slang"
      ],
      "termInfo": {
        "audience design": {
          "text": "Adjusting speech for who is listening — the professor version and the friend version of the same story.",
          "links": [
            {
              "href": "wiki:Audience design"
            }
          ]
        },
        "jargon": {
          "text": "The specialized vocabulary of a profession or activity — opaque to outsiders, efficient for insiders.",
          "links": [
            {
              "href": "wiki:Jargon"
            }
          ]
        },
        "register": {
          "text": "A variety selected for a purpose or situation — legal language, lab talk, text-message style.",
          "links": [
            {
              "href": "wiki:Register (sociolinguistics)"
            }
          ]
        },
        "slang": {
          "text": "Informal in-group vocabulary that marks belonging and dates quickly.",
          "links": [
            {
              "href": "wiki:Slang"
            }
          ]
        },
        "style-shifting": {
          "text": "Moving along the formality spectrum as the occasion changes — 'walking' on stage, 'walkin'' among friends.",
          "links": [
            {
              "href": "wiki:Register (sociolinguistics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Register (sociolinguistics)"
          }
        ]
      }
    },
    {
      "id": "prestige",
      "name": "Prestige & evaluation",
      "color": "amber",
      "fact": "Varieties are ranked not by linguistic merit but by the status of their speakers — and the ranking runs in two directions at once.",
      "terms": [
        "prestige",
        "overt prestige",
        "covert prestige",
        "hypercorrection"
      ],
      "seeds": [
        "prestige",
        "covert prestige"
      ],
      "termInfo": {
        "covert prestige": {
          "text": "The value of vernacular features — solidarity, authenticity, belonging — which is why stigmatized dialects persist.",
          "links": [
            {
              "href": "wiki:Covert prestige"
            }
          ]
        },
        "hypercorrection": {
          "text": "Overapplying a prestigious feature — adding r where none belongs to sound more standard; Labov heard it in self-conscious department-store speech.",
          "links": [
            {
              "href": "wiki:Hypercorrection"
            }
          ]
        },
        "overt prestige": {
          "text": "The status of standard, formal features — the currency of authority, education, and power.",
          "links": [
            {
              "href": "wiki:Prestige (sociolinguistics)"
            }
          ]
        },
        "prestige": {
          "text": "The social standing of a variety — a reflection of its speakers' status, not of linguistic merit; all dialects are linguistically equal.",
          "links": [
            {
              "href": "wiki:Prestige (sociolinguistics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Prestige (sociolinguistics)"
          }
        ]
      }
    },
    {
      "id": "community",
      "name": "Community norms & navigation",
      "color": "magenta",
      "fact": "Communities are united by shared judgments about language, not by one way of speaking — and speakers move between codes to fit situations and mark who they are.",
      "terms": [
        "speech community",
        "code-switching",
        "diglossia",
        "community of practice"
      ],
      "seeds": [
        "speech community",
        "code-switching"
      ],
      "termInfo": {
        "code-switching": {
          "text": "Alternating between languages or varieties within a single interaction — between sentences, inside them, even inside words; the most fluent bilinguals do it most.",
          "links": [
            {
              "href": "wiki:Code-switching"
            }
          ]
        },
        "diglossia": {
          "text": "A community assigning two varieties to separate domains — Standard Arabic for news and religion, Egyptian Arabic at home.",
          "links": [
            {
              "href": "wiki:Diglossia"
            }
          ]
        },
        "speech community": {
          "text": "A group sharing norms and expectations about language — members may speak different dialects yet judge variants alike, and the shared judgments mark membership.",
          "links": [
            {
              "href": "wiki:Speech community"
            }
          ]
        },
        "community of practice": {
          "text": "A group defined by shared activity rather than location or class — a team, a workshop — whose joint work breeds its own speech norms.",
          "links": [
            {
              "href": "wiki:Community of practice"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Speech community"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "user-vs-use",
      "term": "user vs use",
      "clusters": [
        0,
        1
      ],
      "fact": "Dialect reflects the speaker's background while register reflects the speaker's activity — one person carries both dimensions at once and shifts along the situational axis without ever changing dialects.",
      "info": {
        "text": "The two axes cross in every speaker: your dialect is fixed by your history, your register by your errand.",
        "links": [
          {
            "href": "wiki:Register (sociolinguistics)"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "dialect",
        "register"
      ]
    },
    {
      "id": "evaluation-of-varieties",
      "term": "evaluation of varieties",
      "clusters": [
        0,
        2
      ],
      "fact": "Prestige attaches to the varieties themselves: the standard earns overt prestige as the voice of authority, the vernacular earns covert prestige as the badge of belonging — and hypercorrection shows speakers chasing the ranking.",
      "info": {
        "text": "Overt prestige is what schools grade; covert prestige is what friends confer.",
        "links": [
          {
            "href": "wiki:Prestige (sociolinguistics)"
          }
        ]
      },
      "idealTerms": [
        "standard language",
        "overt prestige"
      ]
    },
    {
      "id": "situation-selects",
      "term": "situation selects the code",
      "clusters": [
        1,
        3
      ],
      "fact": "Code-switching and diglossia are the community-scale version of register choice: domains and audiences conventionally determine which language or variety is used at all.",
      "info": {
        "text": "What register choice is for an individual, diglossia and code-switching are for a whole community: the situation, not the speaker alone, picks the code.",
        "links": [
          {
            "href": "wiki:Diglossia"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "register",
        "diglossia"
      ]
    },
    {
      "id": "shared-norms",
      "term": "shared norms, not shared speech",
      "clusters": [
        0,
        3
      ],
      "fact": "A speech community is defined by shared norms and judgments, not a single dialect — New Yorkers speak differently by class yet agree on which pronunciations are prestigious, and those shared judgments mark membership.",
      "info": {
        "text": "Judge the same sentences the same way and you belong — whatever your accent.",
        "links": [
          {
            "href": "wiki:Speech community"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "speech community"
      ]
    }
  ],
  "lenses": [
    {
      "id": "population-scale",
      "prompt": "Which three terms form a scale from a whole community's speech down to one individual's?",
      "explanation": "The three form a population scale: a dialect belongs to a region or community, a sociolect to a social group within it, and an idiolect to a single person. Accent is a pronunciation dimension rather than a population level, and standard language and vernacular name positions relative to institutions, not sizes of speech community.",
      "targets": [
        "dialect",
        "sociolect",
        "idiolect"
      ]
    },
    {
      "id": "adjustment-mechanics",
      "prompt": "Which terms name the mechanics of adjusting speech to the situation?",
      "explanation": "Style-shifting is the movement itself and audience design is its steering principle — adjusting for the listener. Register is the variety selected rather than the selecting, and jargon and slang are the vocabularies at particular ends of the range rather than the adjusting.",
      "targets": [
        "style-shifting",
        "audience design"
      ]
    },
    {
      "id": "two-prestiges",
      "prompt": "Which two kinds of prestige pull a speaker in opposite directions?",
      "explanation": "Overt prestige rewards standard, formal features with authority and status; covert prestige rewards vernacular features with solidarity and belonging — the two pull speakers in opposite directions at once. Prestige names the ranking itself, and hypercorrection is a symptom of chasing it, not one of the directions.",
      "targets": [
        "overt prestige",
        "covert prestige"
      ]
    },
    {
      "id": "department-store-story",
      "prompt": "Which term names what self-conscious department-store employees did when repeating 'fourth floor'?",
      "explanation": "In Labov's New York study, clerks said 'fourth floor' with more r's at Saks than at Macy's — and when asked to repeat themselves, self-conscious speakers reached for the prestige form, with lower-paid staff overshooting into r's where none belonged: prestige chased past the standard itself.",
      "targets": [
        "hypercorrection"
      ]
    },
    {
      "id": "moving-between-codes",
      "prompt": "Which terms name a speaker moving between varieties in real time?",
      "explanation": "Both name real-time movement between varieties: style-shifting moves along a register spectrum for one speaker, code-switching moves between languages or dialects within a conversation. Diglossia is a community-wide assignment of varieties to domains rather than a speaker's movement, and community of practice and audience design define groups and steering, not movement.",
      "targets": [
        "code-switching",
        "style-shifting"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Every Voice a Fingerprint",
    "summary": "How language varies by speaker and by situation, why every variety is priced in two directions at once, and how communities are held together by shared judgments rather than shared speech.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Linguists like to say that everybody speaks a dialect. In the technical sense, a **dialect** is simply any variety of a language shared by a group — and that includes the **standard language**, the institutionally backed variety taught in schools and codified in dictionaries. What the standard has that other varieties lack is institutional support, not linguistic merit. Max Weinreich put it in a famous line attributed to an auditor at his lectures: a language is 'a dialect with an army and navy'. Alongside dialects, a **sociolect** marks a social class, an **accent** is variation in pronunciation alone, an **idiolect** is the unique speech of one individual, and a **vernacular** is the everyday, non-codified variety people actually grow up speaking.\r\n\r\nWho you are is only half the story; what you are doing shapes speech just as much. A **register** is the variety selected for a purpose or situation — the same person says *father* in a job interview and *dad* at home, *walking* on stage and *walkin'* among friends. **Jargon** is the specialized vocabulary of a profession, **slang** the playful vocabulary of an in-group. Speakers move along this spectrum constantly (**style-shifting**), and they tune it to the listener — a principle called **audience design**: the professor version and the friend version of the same story differ because the audiences differ.\r\n\r\nEvery one of these choices is socially priced. **Prestige** is the standing of a variety, and it reflects the status of its speakers rather than any linguistic merit. It pulls in two directions at once. **Overt prestige** is the currency of the standard — authority, education, power. **Covert prestige** is the currency of the vernacular — solidarity, toughness, belonging, which is why stigmatized dialects persist among speakers who can describe them as 'inferior'. William Labov's New York department-store study made the pressure visible: clerks pronounced the *r* in 'fourth floor' more often at Saks than at Macy's, and more at Macy's than at a discount store — and when asked to repeat the phrase, self-conscious speakers reached for the prestigious form, with some overshooting into **hypercorrection**, adding *r* where none belonged. Working-class men in Norwich, meanwhile, claimed to speak less standard English than they actually did — the covert prestige of local speech at work.\r\n\r\nNone of this is random, because communities organize it. A **speech community** is united by shared norms and judgments, not by one way of speaking: New Yorkers of every class pronounce *r* differently yet agree on which pronunciation counts as prestigious — and those shared judgments are the real membership badge. **Diglossia** assigns two varieties to separate domains of life, as with Standard Arabic for news and religion beside Egyptian Arabic at home. **Code-switching** moves between languages or varieties within a single conversation — a skill of the most fluent bilinguals, used for solidarity, emphasis, and privacy. And **communities of practice** — groups defined by shared activity rather than geography, like a sports team or a workshop — breed their own norms as they work.\r\n\r\nThe axes interlock: your dialect locates you socially, your register locates the moment, prestige prices every choice in two directions at once, and the community's shared judgments are what make the pricing real."
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
      "puzzleId": "language-in-society",
      "puzzleRevision": "fnv1a32:15575f11",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:dialect": {
          "x": 432.62,
          "y": 524.46,
          "pinned": false
        },
        "term:sociolect": {
          "x": 377.97,
          "y": 606.27,
          "pinned": false
        },
        "term:accent": {
          "x": 520,
          "y": 541.02,
          "pinned": false
        },
        "term:idiolect": {
          "x": 478.11,
          "y": 623.04,
          "pinned": false
        },
        "term:standard language": {
          "x": 312.87,
          "y": 493.87,
          "pinned": false
        },
        "term:vernacular": {
          "x": 271.02,
          "y": 620.15,
          "pinned": false
        },
        "term:register": {
          "x": 702.27,
          "y": 501.81,
          "pinned": false
        },
        "term:style-shifting": {
          "x": 633.24,
          "y": 596.64,
          "pinned": false
        },
        "term:audience design": {
          "x": 820.15,
          "y": 477.09,
          "pinned": false
        },
        "term:jargon": {
          "x": 822.29,
          "y": 591.21,
          "pinned": false
        },
        "term:slang": {
          "x": 740.13,
          "y": 582.3,
          "pinned": false
        },
        "term:prestige": {
          "x": 230.06,
          "y": 189.56,
          "pinned": false
        },
        "term:overt prestige": {
          "x": 346.09,
          "y": 206.71,
          "pinned": false
        },
        "term:covert prestige": {
          "x": 115.18,
          "y": 225.7,
          "pinned": false
        },
        "term:hypercorrection": {
          "x": 284.08,
          "y": 81.92,
          "pinned": false
        },
        "term:speech community": {
          "x": 482.11,
          "y": 164.2,
          "pinned": false
        },
        "term:code-switching": {
          "x": 500.65,
          "y": 23,
          "pinned": false
        },
        "term:diglossia": {
          "x": 584.87,
          "y": 238.38,
          "pinned": false
        },
        "term:community of practice": {
          "x": 635.76,
          "y": 105.29,
          "pinned": false
        },
        "term:user vs use": {
          "x": 597.26,
          "y": 475.12,
          "pinned": false
        },
        "term:evaluation of varieties": {
          "x": 242.65,
          "y": 334.67,
          "pinned": false
        },
        "term:situation selects the code": {
          "x": 700.19,
          "y": 346.74,
          "pinned": false
        },
        "term:shared norms, not shared speech": {
          "x": 459.4,
          "y": 358.92,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3612.04,
        "score": 3612.043955137496
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:37:17.837Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "language-in-society",
      "puzzleRevision": "fnv1a32:15575f11",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 418.51,
          "y": 191.61,
          "pinned": false
        },
        "cluster:1": {
          "x": 591.49,
          "y": 474.39,
          "pinned": false
        },
        "cluster:2": {
          "x": 182.21,
          "y": 370.89,
          "pinned": false
        },
        "cluster:3": {
          "x": 827.79,
          "y": 295.11,
          "pinned": false
        }
      },
      "bridges": {
        "term:user vs use": {
          "x": 461.49,
          "y": 359.61,
          "pinned": false
        },
        "term:evaluation of varieties": {
          "x": 174.71,
          "y": 229.2,
          "pinned": false
        },
        "term:situation selects the code": {
          "x": 864.85,
          "y": 449.04,
          "pinned": false
        },
        "term:shared norms, not shared speech": {
          "x": 675.19,
          "y": 117.71,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "dialect",
          "sociolect",
          "accent",
          "idiolect",
          "standard language",
          "vernacular"
        ],
        "cluster:1": [
          "register",
          "style-shifting",
          "audience design",
          "jargon",
          "slang"
        ],
        "cluster:2": [
          "prestige",
          "overt prestige",
          "covert prestige",
          "hypercorrection"
        ],
        "cluster:3": [
          "speech community",
          "code-switching",
          "diglossia",
          "community of practice"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "accent",
          "sociolect",
          "vernacular",
          "standard language",
          "idiolect",
          "dialect"
        ],
        "cluster:1": [
          "jargon",
          "register",
          "audience design",
          "style-shifting",
          "slang"
        ],
        "cluster:2": [
          "overt prestige",
          "covert prestige",
          "hypercorrection",
          "prestige"
        ],
        "cluster:3": [
          "code-switching",
          "speech community",
          "community of practice",
          "diglossia"
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
        "totalLength": 1033.7994920632934
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:37:18.571Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "language-in-society",
      "puzzleRevision": "fnv1a32:15575f11",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:dialect": {
          "x": 309.42,
          "y": 535.51
        },
        "term:sociolect": {
          "x": 683.52,
          "y": 628
        },
        "term:accent": {
          "x": 586.92,
          "y": 628
        },
        "term:idiolect": {
          "x": 493.51,
          "y": 628
        },
        "term:standard language": {
          "x": 621.35,
          "y": 513.77
        },
        "term:vernacular": {
          "x": 353.46,
          "y": 628
        },
        "term:register": {
          "x": 379.2,
          "y": 276.08
        },
        "term:style-shifting": {
          "x": 227.01,
          "y": 619.25
        },
        "term:audience design": {
          "x": 95.02,
          "y": 563.29
        },
        "term:jargon": {
          "x": 56.17,
          "y": 451.59
        },
        "term:slang": {
          "x": 106.13,
          "y": 308.05
        },
        "term:prestige": {
          "x": 882.95,
          "y": 155.69
        },
        "term:overt prestige": {
          "x": 725.98,
          "y": 406.91
        },
        "term:covert prestige": {
          "x": 942.75,
          "y": 264.39
        },
        "term:hypercorrection": {
          "x": 869.52,
          "y": 390.6
        },
        "term:speech community": {
          "x": 643.74,
          "y": 151.16
        },
        "term:code-switching": {
          "x": 311.48,
          "y": 22
        },
        "term:diglossia": {
          "x": 433.24,
          "y": 188.63
        },
        "term:community of practice": {
          "x": 745.54,
          "y": 22
        },
        "term:user vs use": {
          "x": 369.9,
          "y": 385.01
        },
        "term:evaluation of varieties": {
          "x": 811.59,
          "y": 552.15
        },
        "term:situation selects the code": {
          "x": 248.79,
          "y": 187.89
        },
        "term:shared norms, not shared speech": {
          "x": 546.78,
          "y": 324.93
        },
        "cluster:0": {
          "x": 447.68,
          "y": 516.63
        },
        "cluster:1": {
          "x": 205.34,
          "y": 419.88
        },
        "cluster:2": {
          "x": 778.03,
          "y": 253.24
        },
        "cluster:3": {
          "x": 495.5,
          "y": 32.07
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T06:55:16.379Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "auto",
    "savedAt": "2026-10-17T06:37:16.916Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
