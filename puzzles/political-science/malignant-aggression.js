// Generated from content/puzzles/malignant-aggression.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "malignant-aggression",
  "title": "Malignant Aggression",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "psychology"
  ],
  "subcategories": {
    "peace-conflict-studies": "atrocity-genocide",
    "psychology": "moral-psychology"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Erich Fromm's argument that human destructiveness cannot be an inherited drive -- because it is a character orientation, developed over a life, with necrophilia as its extreme diagnostic pole and biophilia as its opposite.",
    "citations": [
      {
        "title": "The Anatomy of Human Destructiveness",
        "author": "Fromm, Erich",
        "publisher": "Holt, Rinehart and Winston",
        "year": "1973"
      }
    ]
  },
  "clusters": [
    {
      "id": "against-instinctivism",
      "name": "Against Instinctivism",
      "color": "blue",
      "fact": "Fromm's book opens as a book-length reply to Konrad Lorenz's On Aggression: the claim that human destructiveness is an inherited biological drive, pressure that accumulates and must be discharged like water building up in a reservoir. Fromm accepts a small kernel of the instinct account -- the biologically-defensive aggression humans share with other animals -- and rejects the rest as a category error that cannot explain what actually needs explaining.",
      "terms": [
        "Konrad Lorenz",
        "benign aggression",
        "instinctivism",
        "hydraulic model"
      ],
      "seeds": [
        "Konrad Lorenz",
        "benign aggression"
      ],
      "termInfo": {
        "Konrad Lorenz": {
          "text": "Austrian ethologist whose On Aggression (1963) framed human destructiveness as an inherited biological drive analogous to those observed in other animals. Fromm's Anatomy is the book-length reply.",
          "links": [
            {
              "href": "wiki:Konrad Lorenz"
            }
          ]
        },
        "benign aggression": "Fromm's category for biologically-defensive, adaptive aggression -- the honest kernel of the instinct account, which serves survival and disappears when the threat does. Distinct from the character-rooted destructiveness that has no such biological function.",
        "hydraulic model": "Lorenz's model of aggression as an internal drive that accumulates over time and requires discharge, like water pressure building up in a reservoir until it must be released.",
        "instinctivism": "Fromm's term for the position, associated with Lorenz and his followers, that human aggression is a species-typical inherited drive that must be discharged like accumulated pressure."
      },
      "info": {
        "text": "The instinct-based account of human aggression Fromm's book is set against, associated with Konrad Lorenz and the ethological tradition of the 1960s.",
        "links": [
          {
            "href": "wiki:On Aggression"
          }
        ]
      }
    },
    {
      "id": "passions-of-destruction",
      "name": "Passions of Destruction",
      "color": "amber",
      "fact": "Fromm's positive account of specifically-human destructiveness: not a drive to be discharged, but a character orientation, developed over a life rather than inherited. Its two major forms are sadism, the passion for absolute control over another living being, and necrophilia, the attraction to death, decay, and the non-alive. Together with narcissism and incestuous-symbiotic fixation, necrophilia forms what Fromm calls the syndrome of decay -- the extreme diagnostic shape of malignant aggression, whose everyday expression is the love of the mechanical.",
      "terms": [
        "necrophilia",
        "sadism",
        "malignant aggression",
        "syndrome of decay",
        "love of the mechanical"
      ],
      "seeds": [
        "necrophilia",
        "sadism"
      ],
      "termInfo": {
        "love of the mechanical": "Fromm's concrete gloss on the necrophilic sensibility -- attraction to machines, cleanliness, systems, and the non-alive, coupled with unease at what is organic, wet, or growing. The everyday face of necrophilia when it isn't producing atrocities.",
        "malignant aggression": "Aggression that is character-rooted rather than instinctual, specifically human, and untied to any biological purpose -- Fromm's umbrella term for the destructive orientations no animal shows.",
        "necrophilia": "Fromm's technical use: a character orientation drawn to death, decay, mechanization, and the non-alive, attracted to what can be controlled precisely because it does not live. Distinct from the clinical sexual disorder that shares the name.",
        "sadism": "Fromm's late-work use: the passion for absolute and unrestricted control over another living being, so complete it turns the other into a thing. In Anatomy Fromm develops this as one of the two major forms of character-rooted destructiveness.",
        "syndrome of decay": "Fromm's clinical syndrome combining necrophilia, malignant narcissism, and incestuous-symbiotic fixation -- three character traits that develop together and reinforce each other into an extreme destructive orientation."
      },
      "info": {
        "text": "Fromm's positive account of character-rooted, specifically human destructiveness: the two orientations, sadism and necrophilia, whose sustained cruelty no instinct account can explain.",
        "links": [
          {
            "href": "wiki:Erich Fromm"
          }
        ]
      }
    },
    {
      "id": "biophilia",
      "name": "Biophilia",
      "color": "teal",
      "fact": "Against necrophilia Fromm sets biophilia: the character oriented toward life, growth, and the integration of what has been separated. Not the mere absence of destructive impulses but a specific developmental achievement, describable as its own clinical syndrome -- the syndrome of growth -- opposite in structure to the syndrome of decay.",
      "terms": [
        "biophilia",
        "syndrome of growth",
        "integration"
      ],
      "seeds": [
        "biophilia",
        "syndrome of growth"
      ],
      "termInfo": {
        "biophilia": "Fromm's term for the character orientation drawn toward life, growth, and the integration of what has been separated; the developmental counter-pole to necrophilia. (Distinct from E. O. Wilson's later 1984 biophilia hypothesis, which borrowed the word and gave it a different meaning.)",
        "integration": "In Fromm's usage, the biophilic tendency to combine and unite what has been separated -- the psyche's own parts, one's relationships with others, one's engagement with the living world. Opposed to necrophilia's tendency toward fragmentation and mechanization.",
        "syndrome of growth": "Fromm's clinical syndrome combining biophilia, independence, and the capacity for reason -- the healthy counter-syndrome to the syndrome of decay."
      },
      "info": {
        "text": "Fromm's affirmative counter-pole to necrophilia: the character orientation drawn toward life, growth, and the integration of what has been separated.",
        "links": [
          {
            "href": "wiki:Erich Fromm"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "adolf-hitler",
      "term": "Adolf Hitler",
      "clusters": [
        0,
        1
      ],
      "fact": "Hitler is Fromm's most extended case study and the evidentiary hinge of the whole book: no instinct account can explain destructiveness of his kind, which was sustained past any biological or defensive purpose, and only a character-based framework -- in which necrophilia is a developed orientation rather than a drive -- can. Hitler is simultaneously the counter-example that discredits the instinct model and the paradigmatic instance of the successor account Fromm builds to replace it.",
      "info": {
        "text": "Fromm's extended clinical case study in the final chapter of Anatomy, offered as the most developed application of his diagnostic framework to a single historical figure and as evidence that no instinct account can explain destructiveness of Hitler's kind.",
        "links": [
          {
            "href": "wiki:Adolf Hitler"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "instinctivism",
        "necrophilia"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "character-orientation",
      "term": "character orientation",
      "clusters": [
        1,
        2
      ],
      "fact": "Necrophilia and biophilia are not moods, feelings, or drives but character orientations: whole developmental patterns of relating to oneself and the world, formed over a life. Fromm's central methodological move is that this concept, borrowed from the psychoanalytic tradition, replaces instinct as the explanatory category for destructiveness and its opposite -- and lets the two poles be diagnosed by their specific syndromes rather than by isolated behaviors.",
      "info": {
        "text": "Fromm's technical concept for how a person relates to the world and themselves as a coherent developmental pattern -- a whole-person structure formed over a life, distinct from personality trait, mood, or drive. The frame in which necrophilia and biophilia are the two poles.",
        "links": [
          {
            "href": "wiki:Erich Fromm"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "necrophilia",
        "biophilia"
      ]
    }
  ],
  "lenses": [
    {
      "id": "what-fromm-rejects",
      "prompt": "Which concepts describe the position Fromm's argument is set against?",
      "explanation": "Fromm's book is a book-length refutation of the instinctivist school associated with Konrad Lorenz's On Aggression -- the claim that human destructiveness is an accumulated biological pressure needing discharge, modelled on a hydraulic system. Recognizing the specific position under attack is the first step to seeing what Fromm's own account is offered to replace.",
      "targets": [
        "Konrad Lorenz",
        "instinctivism",
        "hydraulic model"
      ]
    },
    {
      "id": "character-syndromes",
      "prompt": "Which concepts name Fromm's specific character syndromes -- the diagnostic frame he brings from psychoanalysis to describe whole orientations toward life or death?",
      "explanation": "Fromm's central methodological move is treating destructiveness and life-affirmation as character syndromes: coherent developmental patterns of relating to oneself, others, and the world, rather than isolated behaviors, drives, or moods. The syndromes are the framework; necrophilia and biophilia are the two poles it names.",
      "targets": [
        "syndrome of decay",
        "syndrome of growth",
        "character orientation"
      ]
    },
    {
      "id": "healthy-alternative",
      "prompt": "Which concepts point to what Fromm treats as the healthy alternative to malignant destructiveness?",
      "explanation": "Fromm is not only diagnosing destructiveness; he insists on naming its alternative. The alternative isn't the absence of aggression -- benign aggression remains as biology's honest defensive capacity -- but a positive orientation, biophilia, whose syndrome combines love of life with the integration of what has been separated. Malignant aggression is the departure from this default, not the human norm.",
      "targets": [
        "biophilia",
        "syndrome of growth",
        "integration",
        "benign aggression"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-over-power-to",
        "reason": "Compare late-Fromm's character-rooted sadism (the passion for absolute control) with the earlier Fromm's account of sadism as a flight from aloneness, developed in Escape from Freedom and Man for Himself.",
        "via": [
          "sadism",
          "character orientation"
        ]
      },
      {
        "id": "war-is-a-force-that-gives-us-meaning",
        "reason": "Hedges' cultural-mythic account of war borrows Fromm's necrophilia directly; see the deeper theoretical grounding for the phrase Hedges keeps invoking.",
        "via": [
          "necrophilia"
        ]
      },
      {
        "id": "on-killing",
        "reason": "Grossman's empirical finding of strong inhibitions against killing sits on top of what Fromm calls benign aggression -- what has to be systematically overcome for humans to do what animals will not.",
        "via": [
          "benign aggression"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Fromm's account of destructiveness",
    "summary": "Fromm's argument that human destructiveness is a developed character orientation, not an inherited biological drive -- with necrophilia as its extreme pole and biophilia as its opposite.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "In 1973, Erich Fromm published *The Anatomy of Human Destructiveness*, a book-length reply to Konrad Lorenz's *On Aggression* and a decade of ethological writing that had argued human destructiveness was an inherited biological drive -- accumulated aggressive pressure needing discharge, like water building up in a reservoir. Fromm argued this could not be right. No animal shows what humans do: the sustained, character-rooted cruelty that persists long past any defensive or adaptive purpose. Something specifically human was going on that instinct theory couldn't explain.\r\n\r\nFromm's answer was character. Drawing on the psychoanalytic tradition, he treated destructiveness as an orientation -- a whole way of relating to oneself and the world, developed over a life rather than inherited -- that could be diagnosed by its specific patterns. The extreme form of the destructive orientation he called necrophilia: not the clinical sexual disorder, but a technical term for the character drawn to death, decay, mechanization, and the non-alive. Against this he set biophilia, the character oriented toward life, growth, and integration. The book's most extended case study is Hitler, offered as the evidence that any explanation of human destructiveness has to account for a person like him -- and that no theory of accumulated instinctual pressure ever will."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 4.7)",
        "model": "Claude Opus 4.7",
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
      "puzzleId": "malignant-aggression",
      "puzzleRevision": "fnv1a32:9992c56d",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:Konrad Lorenz": {
          "x": 225.94,
          "y": 141.19,
          "pinned": false
        },
        "term:benign aggression": {
          "x": 78.29,
          "y": 148.17,
          "pinned": false
        },
        "term:instinctivism": {
          "x": 169.08,
          "y": 257.98,
          "pinned": false
        },
        "term:hydraulic model": {
          "x": 158.53,
          "y": 23,
          "pinned": false
        },
        "term:necrophilia": {
          "x": 476.94,
          "y": 197.54,
          "pinned": false
        },
        "term:sadism": {
          "x": 599.1,
          "y": 186.53,
          "pinned": false
        },
        "term:malignant aggression": {
          "x": 555,
          "y": 64.39,
          "pinned": false
        },
        "term:syndrome of decay": {
          "x": 564.45,
          "y": 301.86,
          "pinned": false
        },
        "term:love of the mechanical": {
          "x": 375.8,
          "y": 83.95,
          "pinned": false
        },
        "term:biophilia": {
          "x": 263.22,
          "y": 327.96,
          "pinned": false
        },
        "term:syndrome of growth": {
          "x": 147.47,
          "y": 402.02,
          "pinned": false
        },
        "term:integration": {
          "x": 282.27,
          "y": 437,
          "pinned": false
        },
        "term:Adolf Hitler": {
          "x": 318.29,
          "y": 227.98,
          "pinned": false
        },
        "term:character orientation": {
          "x": 404.8,
          "y": 352.89,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2263.8,
        "score": 2263.802166737811
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:51:27.218Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "malignant-aggression",
      "puzzleRevision": "fnv1a32:9992c56d",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 243.09,
          "y": 255.02,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 443.95,
          "pinned": false
        },
        "cluster:2": {
          "x": 716.91,
          "y": 255.02,
          "pinned": false
        }
      },
      "bridges": {
        "term:Adolf Hitler": {
          "x": 435.09,
          "y": 275.95,
          "pinned": false
        },
        "term:character orientation": {
          "x": 724.1,
          "y": 401.53,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Konrad Lorenz",
          "benign aggression",
          "instinctivism",
          "hydraulic model"
        ],
        "cluster:1": [
          "necrophilia",
          "sadism",
          "malignant aggression",
          "syndrome of decay",
          "love of the mechanical"
        ],
        "cluster:2": [
          "biophilia",
          "syndrome of growth",
          "integration"
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
        "totalLength": 239.27490435394822
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:51:29.948Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "malignant-aggression",
      "puzzleRevision": "fnv1a32:9992c56d",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Konrad Lorenz": {
          "x": 821.85,
          "y": 359.38
        },
        "term:benign aggression": {
          "x": 822.43,
          "y": 505.94
        },
        "term:instinctivism": {
          "x": 547.03,
          "y": 323.9
        },
        "term:hydraulic model": {
          "x": 690.78,
          "y": 583.65
        },
        "term:necrophilia": {
          "x": 442.7,
          "y": 397.12
        },
        "term:sadism": {
          "x": 335.63,
          "y": 554.97
        },
        "term:malignant aggression": {
          "x": 206.58,
          "y": 590.76
        },
        "term:syndrome of decay": {
          "x": 110.24,
          "y": 452.46
        },
        "term:love of the mechanical": {
          "x": 150.01,
          "y": 282.15
        },
        "term:biophilia": {
          "x": 545.94,
          "y": 202.71
        },
        "term:syndrome of growth": {
          "x": 654.06,
          "y": 22
        },
        "term:integration": {
          "x": 764.01,
          "y": 113.93
        },
        "term:Adolf Hitler": {
          "x": 532.3,
          "y": 483.34
        },
        "term:character orientation": {
          "x": 406.88,
          "y": 248.65
        },
        "cluster:0": {
          "x": 674.39,
          "y": 419.06
        },
        "cluster:1": {
          "x": 285.44,
          "y": 420.7
        },
        "cluster:2": {
          "x": 645.32,
          "y": 158.7
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:51:32.320Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:51:24.918Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
