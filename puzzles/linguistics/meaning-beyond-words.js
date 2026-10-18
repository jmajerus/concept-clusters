// Generated from content/puzzles/meaning-beyond-words.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "meaning-beyond-words",
  "title": "Meaning Beyond Words",
  "category": "linguistics",
  "subcategories": {
    "linguistics": "semantics-pragmatics"
  },
  "info": {
    "text": "How pragmatics explains the gap between what sentences say and what speakers communicate: inference from assumed cooperation, utterances as actions, reference anchored to the moment of speaking, and the background that rides along unasserted.",
    "links": [
      {
        "href": "wiki:Pragmatics"
      },
      {
        "href": "wiki:Implicature"
      }
    ],
    "citations": [
      {
        "title": "Pragmatics",
        "url": "https://en.wikipedia.org/wiki/Pragmatics"
      },
      {
        "title": "Implicature",
        "url": "https://en.wikipedia.org/wiki/Implicature"
      },
      {
        "title": "Deixis",
        "url": "https://en.wikipedia.org/wiki/Deixis"
      },
      {
        "title": "Presupposition",
        "url": "https://en.wikipedia.org/wiki/Presupposition"
      }
    ]
  },
  "clusters": [
    {
      "id": "implicature",
      "name": "Implicature & the maxims",
      "color": "teal",
      "fact": "Hearers infer what speakers leave unsaid by assuming the speaker is being cooperative — informative, truthful, and relevant.",
      "terms": [
        "implicature",
        "cooperative principle",
        "maxim of quantity",
        "maxim of quality",
        "maxim of relation",
        "scalar implicature",
        "cancellability"
      ],
      "seeds": [
        "implicature",
        "cooperative principle"
      ],
      "termInfo": {
        "cancellability": {
          "text": "The test that marks an implicature: 'Some of the cookies are gone — in fact, all of them' cancels the inference without contradiction.",
          "links": [
            {
              "href": "wiki:Implicature"
            }
          ]
        },
        "cooperative principle": {
          "text": "Grice's assumption that participants contribute as the exchange requires — the engine that makes unstated meaning recoverable.",
          "links": [
            {
              "href": "wiki:Cooperative principle"
            }
          ]
        },
        "implicature": {
          "text": "Content a speaker conveys without stating it — 'There's a gas station round the corner' can mean 'you can refuel there'.",
          "links": [
            {
              "href": "wiki:Implicature"
            }
          ]
        },
        "maxim of quality": {
          "text": "Be truthful — don't say what you believe false or lack evidence for.",
          "links": [
            {
              "href": "wiki:Cooperative principle"
            }
          ]
        },
        "maxim of quantity": {
          "text": "Be as informative as required, and no more — saying 'some' when you know 'all' withholds strength the hearer will notice.",
          "links": [
            {
              "href": "wiki:Cooperative principle"
            }
          ]
        },
        "maxim of relation": {
          "text": "Be relevant — an out-of-the-way reply still counts as an answer if relevance explains it.",
          "links": [
            {
              "href": "wiki:Cooperative principle"
            }
          ]
        },
        "scalar implicature": {
          "text": "Choosing a weaker term on a scale implies the stronger does not hold: 'some' implies 'not all'.",
          "links": [
            {
              "href": "wiki:Scalar implicature"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Implicature"
          }
        ]
      }
    },
    {
      "id": "speech-act",
      "name": "Speech acts",
      "color": "blue",
      "fact": "Utterances act on the world: there is the saying, the act performed in saying, and the effect on the hearer — and some sentences succeed or fail like moves in a game.",
      "terms": [
        "speech act",
        "locutionary act",
        "illocutionary act",
        "perlocutionary act",
        "performative",
        "felicity conditions",
        "indirect speech act"
      ],
      "seeds": [
        "speech act",
        "performative"
      ],
      "termInfo": {
        "felicity conditions": {
          "text": "The requirements a performative must meet to succeed — the right person, authority, and circumstances; a marriage pronouncement from a passerby fails.",
          "links": [
            {
              "href": "wiki:Felicity (pragmatics)"
            }
          ]
        },
        "illocutionary act": {
          "text": "The act performed in saying it — the warning, the promise, the order the utterance counts as.",
          "links": [
            {
              "href": "wiki:Illocutionary act"
            }
          ]
        },
        "indirect speech act": {
          "text": "An utterance whose form and force differ: a question in form ('Can you pass the salt?') that works as a request.",
          "links": [
            {
              "href": "wiki:Speech act"
            }
          ]
        },
        "locutionary act": {
          "text": "The bare act of saying something meaningful — producing the sounds and sense.",
          "links": [
            {
              "href": "wiki:Illocutionary act"
            }
          ]
        },
        "perlocutionary act": {
          "text": "The effect achieved by saying it — convincing, frightening, amusing the hearer.",
          "links": [
            {
              "href": "wiki:Illocutionary act"
            }
          ]
        },
        "performative": {
          "text": "An utterance that performs the very act it describes — 'I apologize' is not about apologizing; it is one.",
          "links": [
            {
              "href": "wiki:Performative utterance"
            }
          ]
        },
        "speech act": {
          "text": "An utterance as an action — warning, promising, apologizing, ordering.",
          "links": [
            {
              "href": "wiki:Speech act"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Speech act"
          }
        ]
      }
    },
    {
      "id": "deixis",
      "name": "Deixis & the deictic center",
      "color": "amber",
      "fact": "Words like I, here, and now refer to nothing until anchored to the utterance itself — and the anchor point can move.",
      "terms": [
        "deixis",
        "person deixis",
        "spatial deixis",
        "temporal deixis",
        "deictic center",
        "indexical"
      ],
      "seeds": [
        "deixis",
        "person deixis"
      ],
      "termInfo": {
        "deictic center": {
          "text": "The anchor point — usually speaker, here, now — from which every deictic word takes its value; it moves on the phone and inside stories.",
          "links": [
            {
              "href": "wiki:Deixis"
            }
          ]
        },
        "deixis": {
          "text": "Words whose reference is fixed only by the utterance situation — I, here, now, this, tomorrow.",
          "links": [
            {
              "href": "wiki:Deixis"
            }
          ]
        },
        "indexical": {
          "text": "The broader property: any expression whose reference shifts with the context of use.",
          "links": [
            {
              "href": "wiki:Indexicality"
            }
          ]
        },
        "person deixis": {
          "text": "I, you, we — reference to the participants of the utterance.",
          "links": [
            {
              "href": "wiki:Deixis"
            }
          ]
        },
        "spatial deixis": {
          "text": "Here, there, this, that — locations graded by distance from the speaker.",
          "links": [
            {
              "href": "wiki:Deixis"
            }
          ]
        },
        "temporal deixis": {
          "text": "Now, then, tomorrow, and tense itself — times fixed relative to the moment of speaking.",
          "links": [
            {
              "href": "wiki:Deixis"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Deixis"
          }
        ]
      }
    },
    {
      "id": "presupposition",
      "name": "Presupposition & entailment",
      "color": "magenta",
      "fact": "One sentence carries several layers: what it claims, what it takes for granted, and what follows if it is true — each layer behaves differently under negation.",
      "terms": [
        "presupposition",
        "assertion",
        "entailment",
        "presupposition trigger",
        "accommodation",
        "definite description"
      ],
      "seeds": [
        "presupposition",
        "entailment"
      ],
      "termInfo": {
        "accommodation": {
          "text": "The hearer's silent acceptance of an unshared presupposition — 'my cousin's wedding', and you simply add the cousin.",
          "links": [
            {
              "href": "wiki:Presupposition"
            }
          ]
        },
        "assertion": {
          "text": "The claimed content of the sentence — the part that flips under negation: 'she left' versus 'she didn't leave'.",
          "links": [
            {
              "href": "wiki:Presupposition"
            }
          ]
        },
        "definite description": {
          "text": "'The X' — presupposes exactly one such thing exists: 'the king of France' presumes a king.",
          "links": [
            {
              "href": "wiki:Definite description"
            }
          ]
        },
        "entailment": {
          "text": "What follows from the sentence being true — 'the president was assassinated' entails 'the president is dead'; negate the sentence and it falls.",
          "links": [
            {
              "href": "wiki:Logical consequence"
            }
          ]
        },
        "presupposition": {
          "text": "Background the utterance treats as given: 'Have you stopped copying?' treats 'you copy' as settled — and it survives negation.",
          "links": [
            {
              "href": "wiki:Presupposition"
            }
          ]
        },
        "presupposition trigger": {
          "text": "Wording that smuggles in background: 'again' (a prior occasion), 'stop' (a prior state), 'the' (an existing referent).",
          "links": [
            {
              "href": "wiki:Presupposition"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Presupposition"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "indirectness",
      "term": "indirectness under cooperation",
      "clusters": [
        0,
        1
      ],
      "fact": "The cooperative principle powers indirect speech acts: 'Can you pass the salt?' is literally a question about ability, but assuming relevance recovers the request.",
      "info": {
        "text": "Indirect speech acts are read through the maxims: assume relevance, and a strange answer becomes a helpful one.",
        "links": [
          {
            "href": "wiki:Implicature"
          }
        ]
      },
      "idealTerms": [
        "cooperative principle",
        null
      ]
    },
    {
      "id": "layer-tests",
      "term": "cancellation vs projection",
      "clusters": [
        0,
        3
      ],
      "fact": "Cancellability and negation sort the layers: 'John ate some of the cookies — in fact, all of them' cancels the implicature without contradiction, 'John didn't stop smoking' still presupposes he once smoked, and an entailment falls the moment the sentence is negated.",
      "info": {
        "text": "Implicature cancels, presupposition projects under negation, entailment falls with it — three signatures for three layers.",
        "links": [
          {
            "href": "wiki:Presupposition"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "cancellability",
        "entailment"
      ]
    },
    {
      "id": "anchoring",
      "term": "anchoring the act",
      "clusters": [
        1,
        2
      ],
      "fact": "A speech act succeeds only relative to its situation, and the deictic center supplies who, where, and when: 'I now pronounce you married' binds I, now, and you to the utterance.",
      "info": {
        "text": "Felicity conditions are deictic conditions: the right person, in the right place, at the right moment — the deictic center certifies the act.",
        "links": [
          {
            "href": "wiki:Deixis"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "felicity conditions",
        "deictic center"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "utterance-side",
      "term": "utterance-side meaning",
      "clusters": [
        2,
        3
      ],
      "fact": "'You're doing it again tomorrow' presupposes a prior occasion while you, again, and tomorrow all anchor to the speaker's here-and-now — change the utterance situation and both layers change with it.",
      "info": {
        "text": "The utterance, not the sentence, is the unit: its situation fixes reference and background alike.",
        "links": [
          {
            "href": "wiki:Deixis"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        "presupposition trigger"
      ]
    }
  ],
  "lenses": [
    {
      "id": "hearer-assumptions",
      "prompt": "Which terms name the assumptions hearers make about speakers?",
      "explanation": "All four name assumptions hearers make about speakers: that the contribution fits the exchange (cooperative principle), that it is informative enough but not more (quantity), that it is truthful (quality), and that it is relevant (relation). Scalar implicature is an inference those assumptions generate, and cancellability is the property that marks it — neither is itself an assumption.",
      "targets": [
        "cooperative principle",
        "maxim of quantity",
        "maxim of quality",
        "maxim of relation"
      ]
    },
    {
      "id": "three-acts",
      "prompt": "Which terms distinguish the layers of a single utterance's action?",
      "explanation": "The three acts are the layers of one utterance's action: the saying (locutionary), the act performed in saying it (illocutionary), and the effect on the hearer (perlocutionary). Speech act names the umbrella, performative is the special saying-is-doing case, and felicity conditions are the success requirements rather than layers.",
      "targets": [
        "locutionary act",
        "illocutionary act",
        "perlocutionary act"
      ]
    },
    {
      "id": "deictic-categories",
      "prompt": "Which terms name the three categories of context-bound words?",
      "explanation": "Person, spatial, and temporal deixis are the three categories of context-bound words — I/you, here/there, now/tomorrow. Indexical names the general property of shifting with context rather than one of the categories, and the deictic center is the anchor point the categories are fixed relative to, not one of them.",
      "targets": [
        "person deixis",
        "spatial deixis",
        "temporal deixis"
      ]
    },
    {
      "id": "negation-contrast",
      "prompt": "Which two terms name layers that differ precisely in whether they survive negation?",
      "explanation": "Presupposition survives negation — 'John didn't stop smoking' still presupposes he once smoked — while entailment falls with the negated sentence. Assertion flips rather than survives, accommodation is the hearer's response to an unshared presupposition, and triggers are the wording that generates them.",
      "targets": [
        "presupposition",
        "entailment"
      ]
    },
    {
      "id": "background-smuggling",
      "prompt": "Which term names what a hearer does when an utterance presupposes something never established?",
      "explanation": "Accommodation is the hearer silently folding an unshared presupposition into the common ground — 'my cousin's wedding' simply adds the cousin. It is the move that keeps the background layer gliding past unnoticed, and it presupposes the trigger already did its work.",
      "targets": [
        "accommodation"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The Unsaid",
    "summary": "How speakers mean more than they say, and how hearers recover it: implicature from assumed cooperation, utterances as actions, context-anchored reference, and presupposed background.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "A sentence on the page means the same thing wherever it appears. An utterance — made by someone, somewhere, to someone — means far more than its words. **Pragmatics** is the study of that difference, and it runs on four discoveries: speakers imply more than they say, utterances act on the world, reference is anchored to the moment of speaking, and background assumptions ride along unasserted.\r\n\r\nThe first discovery is **implicature**. H. Paul Grice observed that conversation works only if participants are cooperative, and he spelled cooperation out as maxims: be as **informative as required** (the **maxim of quantity**), be truthful (the **maxim of quality**), and be relevant (the **maxim of relation**). Hearers exploit those assumptions to recover meaning no one stated. Told 'Some of the cookies are gone', you infer not all are — choosing the weaker term on a scale is a way of communicating that the stronger does not hold. That is a **scalar implicature**, and its signature is **cancellability**: 'Some of the cookies are gone — in fact, all of them' is a correction, not a contradiction. Push the assumptions further and you get irony ('A fine friend you are'), metaphor, and tautologies like 'war is war', where blatantly ignoring a maxim invites the hearer to find the point one level up.\r\n\r\nThe second discovery is that saying is doing. In 'I apologize', saying the words *is* the apologizing — a **performative**. J. L. Austin split every utterance's action into three layers: the **locutionary act** (the saying itself), the **illocutionary act** (what is done in saying it — the warning, the promise, the order), and the **perlocutionary act** (the effect on the hearer — convinced, frightened, amused). Performatives succeed or fail like moves in a game: their **felicity conditions** demand the right person, the right authority, the right circumstances, which is why 'I now pronounce you married' works from an officiant and not from a passerby. And utterances often act indirectly — a **speech act** can be a question in form and a request in force.\r\n\r\nThe third discovery concerns words like **I**, *here*, and *now*: they refer to nothing until anchored to the utterance itself. That anchoring is **deixis**, organized around a **deictic center** — usually the speaker, here, now. **Person deixis** fixes who is talking and addressed; **spatial deixis** grades *here* and *there*; **temporal deixis** fixes *now* and *tomorrow*, along with tense itself. The center moves: telephoning from New York, a Londoner says both 'we're leaving next week' and 'we're coming next week', and inside a novel the anchor can jump into a character's shoes.\r\n\r\nThe fourth discovery is what an utterance takes for granted. Asked 'Have you stopped copying?', the verb *stop* smuggles in an assumption — you copied — and the assumption **survives negation**: 'I haven't stopped' still treats it as settled. That is a **presupposition**, triggered by wording like *again*, *stop*, or *the* (a **definite description** presumes its referent exists). It contrasts with the **assertion**, the claimed content that flips under negation, and with **entailment**, what follows from truth and falls the moment the sentence is denied. When a speaker presupposes something never shared — 'my cousin's wedding' and you never knew of a cousin — hearers simply **accommodate**, folding the new background in without protest.\r\n\r\nSaid, implied, presupposed: three layers, each with its own test — cancellation for implicatures, negation for presuppositions and entailments. Together with deixis and speech acts they explain how, in every conversation, the unsaid is communicated all the same."
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
      "puzzleId": "meaning-beyond-words",
      "puzzleRevision": "fnv1a32:227e1458",
      "board": {
        "width": 1250,
        "height": 800
      },
      "nodes": {
        "term:implicature": {
          "x": 745.17,
          "y": 37
        },
        "term:cooperative principle": {
          "x": 719.07,
          "y": 166.54
        },
        "term:maxim of quantity": {
          "x": 599.23,
          "y": 237.72
        },
        "term:maxim of quality": {
          "x": 776.71,
          "y": 103.19
        },
        "term:maxim of relation": {
          "x": 420.14,
          "y": 118.63
        },
        "term:scalar implicature": {
          "x": 485.46,
          "y": 182.23
        },
        "term:cancellability": {
          "x": 324.05,
          "y": 46.94
        },
        "term:speech act": {
          "x": 1044.41,
          "y": 318.35
        },
        "term:locutionary act": {
          "x": 854.95,
          "y": 522.54
        },
        "term:illocutionary act": {
          "x": 819.12,
          "y": 420.34
        },
        "term:perlocutionary act": {
          "x": 978.58,
          "y": 587.09
        },
        "term:performative": {
          "x": 1108.16,
          "y": 379.66
        },
        "term:felicity conditions": {
          "x": 848.07,
          "y": 305.91
        },
        "term:indirect speech act": {
          "x": 1100.71,
          "y": 524.79
        },
        "term:deixis": {
          "x": 668.44,
          "y": 746.73
        },
        "term:person deixis": {
          "x": 512.83,
          "y": 742.13
        },
        "term:spatial deixis": {
          "x": 421.48,
          "y": 659.48
        },
        "term:temporal deixis": {
          "x": 824.95,
          "y": 650.4
        },
        "term:deictic center": {
          "x": 657.85,
          "y": 520.28
        },
        "term:indexical": {
          "x": 798.82,
          "y": 734.18
        },
        "term:presupposition": {
          "x": 102.16,
          "y": 367.16
        },
        "term:assertion": {
          "x": 423.68,
          "y": 328.46
        },
        "term:entailment": {
          "x": 291.89,
          "y": 284.22
        },
        "term:presupposition trigger": {
          "x": 226.42,
          "y": 603.07
        },
        "term:accommodation": {
          "x": 139.89,
          "y": 280.21
        },
        "term:definite description": {
          "x": 116.94,
          "y": 516.91
        },
        "term:indirectness under cooperation": {
          "x": 966.8,
          "y": 206.51
        },
        "term:cancellation vs projection": {
          "x": 263.62,
          "y": 193.18
        },
        "term:anchoring the act": {
          "x": 641.04,
          "y": 397.35
        },
        "term:utterance-side meaning": {
          "x": 467.71,
          "y": 512.89
        },
        "cluster:0": {
          "x": 585.96,
          "y": 37
        },
        "cluster:1": {
          "x": 981.83,
          "y": 428.1
        },
        "cluster:2": {
          "x": 609.2,
          "y": 614.77
        },
        "cluster:3": {
          "x": 285.5,
          "y": 438.61
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T20:07:19.935Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "meaning-beyond-words",
      "puzzleRevision": "fnv1a32:227e1458",
      "board": {
        "width": 1250,
        "height": 800
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 625,
          "y": 213.25,
          "pinned": false
        },
        "cluster:1": {
          "x": 1063.8,
          "y": 408,
          "pinned": true
        },
        "cluster:2": {
          "x": 625,
          "y": 602.75,
          "pinned": false
        },
        "cluster:3": {
          "x": 212.04,
          "y": 408,
          "pinned": true
        }
      },
      "bridges": {
        "term:indirectness under cooperation": {
          "x": 924.67,
          "y": 214.46,
          "pinned": false
        },
        "term:cancellation vs projection": {
          "x": 347.96,
          "y": 237.09,
          "pinned": false
        },
        "term:anchoring the act": {
          "x": 774.84,
          "y": 454.69,
          "pinned": true
        },
        "term:utterance-side meaning": {
          "x": 476.65,
          "y": 450.22,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "implicature",
          "cooperative principle",
          "maxim of quantity",
          "maxim of quality",
          "maxim of relation",
          "scalar implicature",
          "cancellability"
        ],
        "cluster:1": [
          "speech act",
          "locutionary act",
          "illocutionary act",
          "perlocutionary act",
          "performative",
          "felicity conditions",
          "indirect speech act"
        ],
        "cluster:2": [
          "deixis",
          "person deixis",
          "spatial deixis",
          "temporal deixis",
          "deictic center",
          "indexical"
        ],
        "cluster:3": [
          "presupposition",
          "assertion",
          "entailment",
          "presupposition trigger",
          "accommodation",
          "definite description"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "implicature",
          "maxim of quality",
          "maxim of quantity",
          "cooperative principle",
          "scalar implicature",
          "maxim of relation",
          "cancellability"
        ],
        "cluster:1": [
          "speech act",
          "locutionary act",
          "perlocutionary act",
          "felicity conditions",
          "indirect speech act",
          "illocutionary act",
          "performative"
        ],
        "cluster:2": [
          "indexical",
          "deictic center",
          "temporal deixis",
          "spatial deixis",
          "person deixis",
          "deixis"
        ],
        "cluster:3": [
          "entailment",
          "presupposition",
          "presupposition trigger",
          "definite description",
          "accommodation",
          "assertion"
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
        "totalLength": 1255.8118105073831
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T19:45:11.137Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "meaning-beyond-words",
      "puzzleRevision": "fnv1a32:227e1458",
      "board": {
        "width": 1250,
        "height": 800
      },
      "nodes": {
        "term:implicature": {
          "x": 196.16,
          "y": 433.5,
          "pinned": false
        },
        "term:cooperative principle": {
          "x": 318.61,
          "y": 349.04,
          "pinned": false
        },
        "term:maxim of quantity": {
          "x": 75.55,
          "y": 496.46,
          "pinned": false
        },
        "term:maxim of quality": {
          "x": 189.79,
          "y": 596.5,
          "pinned": false
        },
        "term:maxim of relation": {
          "x": 94.77,
          "y": 342.57,
          "pinned": false
        },
        "term:scalar implicature": {
          "x": 200.92,
          "y": 225.21,
          "pinned": false
        },
        "term:cancellability": {
          "x": 299.99,
          "y": 506.17,
          "pinned": false
        },
        "term:speech act": {
          "x": 675.44,
          "y": 258.02,
          "pinned": false
        },
        "term:locutionary act": {
          "x": 785.17,
          "y": 194.62,
          "pinned": false
        },
        "term:illocutionary act": {
          "x": 653.63,
          "y": 125.07,
          "pinned": false
        },
        "term:perlocutionary act": {
          "x": 800.64,
          "y": 345.77,
          "pinned": false
        },
        "term:performative": {
          "x": 906.14,
          "y": 249.99,
          "pinned": false
        },
        "term:felicity conditions": {
          "x": 643.2,
          "y": 393.57,
          "pinned": false
        },
        "term:indirect speech act": {
          "x": 790.54,
          "y": 39.62,
          "pinned": false
        },
        "term:deixis": {
          "x": 967.33,
          "y": 579.75,
          "pinned": false
        },
        "term:person deixis": {
          "x": 1027.23,
          "y": 490.06,
          "pinned": false
        },
        "term:spatial deixis": {
          "x": 1115.37,
          "y": 589.72,
          "pinned": false
        },
        "term:temporal deixis": {
          "x": 1013.07,
          "y": 684.33,
          "pinned": false
        },
        "term:deictic center": {
          "x": 894.33,
          "y": 496.14,
          "pinned": false
        },
        "term:indexical": {
          "x": 959.09,
          "y": 394.59,
          "pinned": false
        },
        "term:presupposition": {
          "x": 516.98,
          "y": 640.45,
          "pinned": false
        },
        "term:assertion": {
          "x": 415.86,
          "y": 776.85,
          "pinned": false
        },
        "term:entailment": {
          "x": 608.29,
          "y": 557.14,
          "pinned": false
        },
        "term:presupposition trigger": {
          "x": 669.69,
          "y": 692.67,
          "pinned": false
        },
        "term:accommodation": {
          "x": 533.07,
          "y": 772.52,
          "pinned": false
        },
        "term:definite description": {
          "x": 362.1,
          "y": 648.29,
          "pinned": false
        },
        "term:indirectness under cooperation": {
          "x": 501.68,
          "y": 248.95,
          "pinned": false
        },
        "term:cancellation vs projection": {
          "x": 470.73,
          "y": 472.72,
          "pinned": false
        },
        "term:anchoring the act": {
          "x": 749.87,
          "y": 514.69,
          "pinned": false
        },
        "term:utterance-side meaning": {
          "x": 851.76,
          "y": 651.82,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5319.13,
        "score": 5319.13297149206
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:38:54.453Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-16T19:46:04.449Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
