// Generated from content/puzzles/the-manufactured-desire.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-manufactured-desire",
  "title": "The Manufactured Desire",
  "category": "critical-theory-cultural-studies",
  "categories": [
    "critical-theory-cultural-studies",
    "philosophy",
    "psychology",
    "sociology"
  ],
  "subcategories": {
    "philosophy": "political-philosophy",
    "psychology": "psychoanalysis",
    "sociology": "culture-socialization"
  },
  "tags": [
    "catalogue:wholeness-and-its-discontents"
  ],
  "info": {
    "text": "How the Frankfurt School, Situationism, and structural Marxism each describe modern capitalism turning private psychological anxiety into a permanent engine of consumption.",
    "links": [
      {
        "href": "wiki:Critical theory"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-culture-industry-mass-standardization",
      "name": "Culture Industry & Mass Standardization",
      "color": "teal",
      "fact": "Adorno and Horkheimer describe an industrial capitalism that produces standardized cultural goods on factory logic, while offering just enough cosmetic variation to make mass-produced sameness feel like personal choice.",
      "terms": [
        "culture industry",
        "pseudo-individualization",
        "mass standardization",
        "false needs",
        "instrumental rationality"
      ],
      "seeds": [
        "culture industry",
        "pseudo-individualization"
      ],
      "termInfo": {
        "culture industry": {
          "text": "Adorno and Horkheimer's term for art, media, and entertainment produced and distributed on the logic of a factory.",
          "links": [
            {
              "href": "wiki:Culture industry"
            }
          ]
        },
        "false needs": "Desires manufactured by advertising and social pressure that promise psychological relief but leave the underlying void untouched.",
        "instrumental rationality": {
          "text": "A logic that reduces everything, including culture, to efficiency and calculation toward profit.",
          "links": [
            {
              "href": "wiki:Instrumental and value rationality"
            }
          ]
        },
        "mass standardization": "The underlying condition pseudo-individualization is designed to disguise: cultural goods produced to predictable, repeatable formulas.",
        "pseudo-individualization": "Minor, cosmetic variation added to standardized products so mass sameness can be experienced as personal choice."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Culture industry"
          }
        ]
      }
    },
    {
      "id": "cluster-spectacular-society-hyperreal-commodities",
      "name": "Spectacular Society & Hyperreal Commodities",
      "color": "blue",
      "fact": "Debord and Baudrillard track a mutation in late capitalism: commodities stop being valued for use or exchange and start circulating as pure image and sign, until the image itself becomes more convincing than whatever it was supposed to represent.",
      "terms": [
        "society of the spectacle",
        "sign-value",
        "simulacra and simulation",
        "hyperreality",
        "commodification of experience"
      ],
      "seeds": [
        "society of the spectacle",
        "sign-value"
      ],
      "termInfo": {
        "commodification of experience": "Even memory, travel, and relationship converted into displayable, purchasable content.",
        "hyperreality": {
          "text": "A condition where media representations and models feel more real, and more meaningful, than the physical reality they were drawn from.",
          "links": [
            {
              "href": "wiki:Hyperreality"
            }
          ]
        },
        "sign-value": "Baudrillard's term for value derived from what an object signals about status or identity, distinct from its use or exchange value.",
        "simulacra and simulation": {
          "text": "The point where a copy of something no longer refers to any original, and circulates as more convincing than reality itself.",
          "links": [
            {
              "href": "wiki:Simulacra and Simulation"
            }
          ]
        },
        "society of the spectacle": {
          "text": "Debord's claim that authentic social relationship has been replaced by a mediated collection of images.",
          "links": [
            {
              "href": "wiki:The Society of the Spectacle"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Jean Baudrillard"
          }
        ]
      }
    },
    {
      "id": "cluster-ideological-apparatus-performative-authenticity",
      "name": "Ideological Apparatus & Performative Authenticity",
      "color": "amber",
      "fact": "Althusser's structural account of how institutions shape belief without direct force extends naturally into digital capitalism, where the same 'hailing' becomes a demand to build a marketable, positive, curated self.",
      "terms": [
        "ideological state apparatus",
        "interpellation",
        "performative authenticity",
        "curated lifestyle",
        "compulsory positivity"
      ],
      "seeds": [
        "ideological state apparatus",
        "interpellation"
      ],
      "termInfo": {
        "compulsory positivity": "A cultural doctrine that reframes doubt, dissatisfaction, or structural complaint as a personal attitude defect.",
        "curated lifestyle": "Personality, hobbies, and emotional life reshaped into a coherent, purchasable, displayable identity.",
        "ideological state apparatus": {
          "text": "Althusser's term for institutions -- schools, media, family, religion -- that shape belief and behavior without physical coercion.",
          "links": [
            {
              "href": "wiki:Ideology and Ideological State Apparatuses"
            }
          ]
        },
        "interpellation": {
          "text": "The moment ideology addresses, or 'hails,' an individual as a specific kind of subject, and the individual recognizes and accepts that address.",
          "links": [
            {
              "href": "wiki:Interpellation (philosophy)"
            }
          ]
        },
        "performative authenticity": "Authenticity itself pressured into becoming something visibly performed and maintained, rather than simply lived."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Louis Althusser"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-manufactured-solace",
      "term": "manufactured solace",
      "clusters": [
        0,
        2
      ],
      "fact": "Standardized media and structural ideology offer the same basic service through different channels: pre-packaged emotional comfort designed to soothe systemic anxiety before it turns into genuine protest.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "false needs",
        "compulsory positivity"
      ]
    },
    {
      "id": "bridge-substitution-of-image-for-need",
      "term": "substitution of image for need",
      "clusters": [
        0,
        1
      ],
      "fact": "The culture industry's standardized products evolve, under Debord and Baudrillard's later diagnosis, from goods with real use into purely symbolic spectacles -- manufactured desire is what makes the leap into image-as-satisfaction possible in the first place.",
      "relationKind": "dynamic",
      "idealTerms": [
        "false needs",
        "sign-value"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-commodified-subjectivity",
      "term": "commodified subjectivity",
      "clusters": [
        1,
        2
      ],
      "fact": "When symbolic codes and structural ideology combine, identity itself becomes a market product: interpellation supplies the subject position, and the sign economy supplies what that position has to be seen buying.",
      "relationKind": "dynamic",
      "idealTerms": [
        "hyperreality",
        "curated lifestyle"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "illusion-of-choice-and-uniqueness",
      "prompt": "Which concepts describe a mechanism for making standardized, mass-produced offerings feel deeply personal and authentic to the person choosing them?",
      "explanation": "A minor stylistic variant, a performed sincerity, a lifestyle assembled from signals, and a copy that has stopped referring to any original are four different technologies for the same illusion: that a standardized offering is actually a personal, authentic choice.",
      "targets": [
        "pseudo-individualization",
        "performative authenticity",
        "curated lifestyle",
        "simulacra and simulation"
      ],
      "reasons": {
        "curated lifestyle": "A personality assembled and displayed as a coherent, purchasable aesthetic.",
        "performative authenticity": "Authenticity itself, packaged as something to be visibly performed rather than simply lived.",
        "pseudo-individualization": "Cosmetic variation added to standardized products specifically to manufacture a sense of unique choice.",
        "simulacra and simulation": "The point where the copy of a thing becomes more convincing, and more consumed, than any original it once referred to."
      }
    },
    {
      "id": "systemic-control-mechanisms",
      "prompt": "Which concepts are institutional or structural forces that organize a whole society toward passive compliance, rather than techniques an individual notices themselves using?",
      "explanation": "Scale is the tell here: these aren't personal coping strategies, they're the machinery operating above the individual -- an industry standardizing culture, a spectacle replacing lived experience with image, an apparatus of institutions shaping belief, a moment of being addressed and accepting the address, and a logic of efficiency governing all of it.",
      "targets": [
        "culture industry",
        "society of the spectacle",
        "ideological state apparatus",
        "interpellation",
        "instrumental rationality"
      ],
      "reasons": {
        "culture industry": "Adorno and Horkheimer's name for entertainment and media organized on factory logic.",
        "ideological state apparatus": "Althusser's institutions -- schools, media, family -- that shape belief without direct coercion.",
        "instrumental rationality": "The efficiency-first logic the culture industry runs on, reducing culture to calculation.",
        "interpellation": "The specific moment ideology 'hails' an individual into a subject position, and the individual answers to it.",
        "society of the spectacle": "Debord's claim that mediated image has displaced direct lived and social relationship."
      }
    },
    {
      "id": "simulated-solutions-for-internal-voids",
      "prompt": "Which concepts are market-generated substitutes offered specifically to patch psychological alienation or dissatisfaction?",
      "explanation": "Each of these promises relief for a void it did not create but profits from keeping open: a manufactured desire standing in for a real one, prestige purchased rather than felt, even memory and connection repackaged as purchasable content, and negative feeling itself rebranded as a personal defect with a commercial fix.",
      "targets": [
        "false needs",
        "sign-value",
        "commodification of experience",
        "compulsory positivity"
      ],
      "reasons": {
        "commodification of experience": "Even memory, travel, and relationship converted into displayable, purchasable content.",
        "compulsory positivity": "A cultural mandate that recasts existential doubt or dissatisfaction as an attitude problem, sellable back as a wellness product.",
        "false needs": "Desires manufactured by advertising and social pressure that promise relief while leaving the underlying void untouched.",
        "sign-value": "Status and identity purchased through what an object signals, not what it does."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Selling a Cure for a Wound It Needs Open",
    "summary": "See how three strands of critical theory each describe capitalism converting psychological anxiety into consumption, before organizing their vocabulary in this puzzle.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "# Selling a cure for a wound it needs open\r\n\r\nHaving watched Freud map the drive and Jung confront the shadow, a different question opens up: what happens when an entire economic system gets access to that same internal void -- and finds a way to profit from it?\r\n\r\n## An industry for culture itself\r\n\r\nWriting in the mid-twentieth century, two critical theorists argued that art and entertainment had been absorbed into factory logic: cultural products designed to reach the widest possible audience with the least possible friction. To keep audiences from noticing how uniform the results actually were, the system leans on a specific trick -- small, cosmetic variation dressed up as personal choice, so a mass-produced object can still feel like *your* object.\r\n\r\n## When the image outruns the thing\r\n\r\nA later generation of theorists tracked what happens as this logic keeps developing. Commodities stop being valued mainly for what they do, and start being valued for what they signal -- status, identity, belonging. Eventually the signals detach from anything they were originally standing in for, and the image itself becomes more persuasive, and more consumed, than whatever reality it was supposed to represent.\r\n\r\n## Being addressed, and answering\r\n\r\nA third strand asks how any of this gets a person to go along willingly. Institutions -- media, schools, advertising, family -- do not usually need force. They address a person as a particular kind of subject (\"as a successful professional,\" \"as a conscious consumer\"), and the person, recognizing the address, answers to it and starts acting accordingly. In a media environment built for constant self-presentation, that address increasingly asks for a curated, positive, marketable self -- and treats anything short of that as a personal failing rather than a reasonable reaction to real conditions.\r\n\r\n## A question to hold onto\r\n\r\nNone of these three traditions claim capitalism invented human anxiety. Their shared claim is narrower and, in a way, more unsettling: that a real internal void gets identified, and then kept carefully open, because keeping it open is what keeps the whole system in business.\r\n\r\n> **Reflection:** If a felt need can be manufactured, how would you go about telling a manufactured need apart from a need that simply, and independently, happens to exist?\r\n"
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Gemini"
      },
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "the-manufactured-desire",
      "puzzleRevision": "fnv1a32:e4866ea0",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:culture industry": {
          "x": 204.68,
          "y": 246.44,
          "pinned": false
        },
        "term:pseudo-individualization": {
          "x": 97.6,
          "y": 109.58,
          "pinned": false
        },
        "term:mass standardization": {
          "x": 85,
          "y": 354.37,
          "pinned": false
        },
        "term:false needs": {
          "x": 253.78,
          "y": 122.88,
          "pinned": false
        },
        "term:instrumental rationality": {
          "x": 262.65,
          "y": 410.49,
          "pinned": false
        },
        "term:society of the spectacle": {
          "x": 663.43,
          "y": 391.41,
          "pinned": false
        },
        "term:sign-value": {
          "x": 564.8,
          "y": 271.92,
          "pinned": false
        },
        "term:simulacra and simulation": {
          "x": 460.19,
          "y": 436.17,
          "pinned": false
        },
        "term:hyperreality": {
          "x": 761.39,
          "y": 519.68,
          "pinned": false
        },
        "term:commodification of experience": {
          "x": 602.22,
          "y": 597,
          "pinned": false
        },
        "term:ideological state apparatus": {
          "x": 718.88,
          "y": 23,
          "pinned": false
        },
        "term:interpellation": {
          "x": 893.9,
          "y": 23,
          "pinned": false
        },
        "term:performative authenticity": {
          "x": 859.25,
          "y": 189.64,
          "pinned": false
        },
        "term:curated lifestyle": {
          "x": 679.79,
          "y": 205.31,
          "pinned": false
        },
        "term:compulsory positivity": {
          "x": 523.71,
          "y": 62.08,
          "pinned": false
        },
        "term:manufactured solace": {
          "x": 354.38,
          "y": 23,
          "pinned": false
        },
        "term:substitution of image for need": {
          "x": 396.62,
          "y": 227.59,
          "pinned": false
        },
        "term:commodified subjectivity": {
          "x": 862.4,
          "y": 391.97,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3753.5,
        "score": 3753.4979116947798
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:07:50.479Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-manufactured-desire",
      "puzzleRevision": "fnv1a32:e4866ea0",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 573.04,
          "pinned": false
        },
        "cluster:1": {
          "x": 265.9,
          "y": 310.48,
          "pinned": false
        },
        "cluster:2": {
          "x": 784.1,
          "y": 310.48,
          "pinned": false
        }
      },
      "bridges": {
        "term:manufactured solace": {
          "x": 558.47,
          "y": 401.96,
          "pinned": false
        },
        "term:substitution of image for need": {
          "x": 269.8,
          "y": 493.81,
          "pinned": false
        },
        "term:commodified subjectivity": {
          "x": 525,
          "y": 310.48,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "culture industry",
          "pseudo-individualization",
          "mass standardization",
          "false needs",
          "instrumental rationality"
        ],
        "cluster:1": [
          "society of the spectacle",
          "sign-value",
          "simulacra and simulation",
          "hyperreality",
          "commodification of experience"
        ],
        "cluster:2": [
          "ideological state apparatus",
          "interpellation",
          "performative authenticity",
          "curated lifestyle",
          "compulsory positivity"
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
        "totalLength": 463.79644073987834
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:07:52.494Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-manufactured-desire",
      "puzzleRevision": "fnv1a32:e4866ea0",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:culture industry": {
          "x": 70.4,
          "y": 168.67
        },
        "term:pseudo-individualization": {
          "x": 709.26,
          "y": 22
        },
        "term:mass standardization": {
          "x": 574.48,
          "y": 72.81
        },
        "term:false needs": {
          "x": 239.6,
          "y": 162.86
        },
        "term:instrumental rationality": {
          "x": 95.6,
          "y": 22
        },
        "term:society of the spectacle": {
          "x": 673.39,
          "y": 598
        },
        "term:sign-value": {
          "x": 743.98,
          "y": 207.61
        },
        "term:simulacra and simulation": {
          "x": 864.4,
          "y": 484.25
        },
        "term:hyperreality": {
          "x": 682.41,
          "y": 246.56
        },
        "term:commodification of experience": {
          "x": 848.65,
          "y": 98.14
        },
        "term:ideological state apparatus": {
          "x": 105.05,
          "y": 388.78
        },
        "term:interpellation": {
          "x": 462.58,
          "y": 488.37
        },
        "term:performative authenticity": {
          "x": 98.75,
          "y": 598
        },
        "term:curated lifestyle": {
          "x": 442.11,
          "y": 598
        },
        "term:compulsory positivity": {
          "x": 199.64,
          "y": 346.13
        },
        "term:manufactured solace": {
          "x": 149.87,
          "y": 215.22
        },
        "term:substitution of image for need": {
          "x": 482.54,
          "y": 180.91
        },
        "term:commodified subjectivity": {
          "x": 596.81,
          "y": 431.6
        },
        "cluster:0": {
          "x": 336.51,
          "y": 61.82
        },
        "cluster:1": {
          "x": 804.55,
          "y": 369.12
        },
        "cluster:2": {
          "x": 302.86,
          "y": 431.6
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:07:54.768Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:07:48.264Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
