// Generated from content/puzzles/distortion-and-magnification.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "distortion-and-magnification",
  "title": "Distortion and magnification",
  "category": "sociology",
  "categories": [
    "sociology",
    "psychology",
    "philosophy"
  ],
  "subcategories": {
    "psychology": "moral-psychology",
    "sociology": "institutions-organizations"
  },
  "info": {
    "text": "A diagnostic map separating distorted perception and moral judgment from the institutional and identity structures that can amplify them.",
    "links": [
      {
        "href": "wiki:Dehumanization"
      }
    ]
  },
  "clusters": [
    {
      "id": "epistemic-distortion",
      "name": "Epistemic distortion",
      "color": "teal",
      "fact": "Epistemic distortion weakens access to shared reality by narrowing information, misreading threats, circulating falsehoods, or stripping claims from the context needed to judge them.",
      "terms": [
        "information isolation",
        "threat misperception",
        "misinformation",
        "loss of context"
      ],
      "seeds": [
        "misinformation",
        "threat misperception"
      ],
      "termInfo": {
        "information isolation": {
          "text": "A condition in which relevant evidence and competing interpretations are absent or systematically excluded.",
          "links": [
            {
              "href": "wiki:Echo chamber (media)"
            }
          ]
        },
        "threat misperception": {
          "text": "An inaccurate judgment about the source, scale, likelihood, or meaning of danger.",
          "links": [
            {
              "href": "wiki:Risk perception"
            }
          ]
        },
        "misinformation": {
          "text": "False or misleading information, whether or not it was created with an intention to deceive.",
          "links": [
            {
              "href": "wiki:Misinformation"
            }
          ]
        },
        "loss of context": {
          "text": "Removal of the surrounding circumstances that determine how a statement, image, event, or action should be understood.",
          "links": [
            {
              "href": "wiki:Context (language use)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Epistemology"
          }
        ]
      }
    },
    {
      "id": "moral-distortion",
      "name": "Moral distortion",
      "color": "blue",
      "fact": "Moral distortion changes the terms of regard by making dignity conditional, excluding people from moral concern, collapsing proportionality, or disengaging responsibility from harmful conduct.",
      "terms": [
        "conditional dignity",
        "moral exclusion",
        "proportionality collapse",
        "moral disengagement"
      ],
      "seeds": [
        "moral exclusion",
        "moral disengagement"
      ],
      "termInfo": {
        "conditional dignity": {
          "text": "The treatment of human worth as something that can be earned, lost, or withheld according to identity, conduct, status, or usefulness.",
          "links": [
            {
              "href": "wiki:Dignity"
            }
          ]
        },
        "moral exclusion": {
          "text": "Placing people outside the boundary within which ordinary rules of fairness, rights, and concern are understood to apply.",
          "links": [
            {
              "href": "wiki:Moral exclusion"
            }
          ]
        },
        "proportionality collapse": {
          "text": "A failure to distinguish levels of severity, responsibility, or consequence when judging what response is justified.",
          "links": [
            {
              "href": "wiki:Proportionality (law)"
            }
          ]
        },
        "moral disengagement": {
          "text": "Cognitive and social mechanisms that permit harmful conduct without corresponding self-condemnation.",
          "links": [
            {
              "href": "wiki:Moral disengagement"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Moral psychology"
          }
        ]
      }
    },
    {
      "id": "institutional-magnification",
      "name": "Institutional magnification",
      "color": "amber",
      "fact": "Institutions magnify orientations by adding authority, repetition, technical language, and divided roles that extend decisions beyond any one person's judgment.",
      "terms": [
        "role authority",
        "procedural repetition",
        "technical framing",
        "diffusion of responsibility"
      ],
      "seeds": [
        "role authority",
        "diffusion of responsibility"
      ],
      "termInfo": {
        "role authority": {
          "text": "Power or deference attached to an institutional position rather than only to the individual who occupies it.",
          "links": [
            {
              "href": "wiki:Authority"
            }
          ]
        },
        "procedural repetition": {
          "text": "The recurrence of an approved routine until its assumptions and effects appear ordinary.",
          "links": [
            {
              "href": "wiki:Normalization (sociology)"
            }
          ]
        },
        "technical framing": {
          "text": "Presentation of a contested human choice as a neutral matter of administration, measurement, or specialized expertise.",
          "links": [
            {
              "href": "wiki:Framing (social sciences)"
            }
          ]
        },
        "diffusion of responsibility": {
          "text": "Reduced personal responsibility when many people participate in, witness, or authorize an outcome.",
          "links": [
            {
              "href": "wiki:Diffusion of responsibility"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Institution"
          }
        ]
      }
    },
    {
      "id": "identity-magnification",
      "name": "Identity magnification",
      "color": "magenta",
      "fact": "Group identity magnifies judgments when loyalty, betrayal, stereotypes, and fused identity make agreement a condition of belonging and opposition a threat to the self.",
      "terms": [
        "in-group loyalty",
        "betrayal framing",
        "out-group homogeneity",
        "identity fusion"
      ],
      "seeds": [
        "in-group loyalty",
        "betrayal framing"
      ],
      "termInfo": {
        "in-group loyalty": {
          "text": "Preferential commitment to the welfare, norms, and judgments of one's own group.",
          "links": [
            {
              "href": "wiki:In-group and out-group"
            }
          ]
        },
        "betrayal framing": {
          "text": "Interpretation of criticism, dissent, or departure as disloyalty to the group.",
          "links": [
            {
              "href": "wiki:Betrayal"
            }
          ]
        },
        "out-group homogeneity": {
          "text": "The tendency to perceive members of another group as more alike than members of one's own group.",
          "links": [
            {
              "href": "wiki:Out-group homogeneity"
            }
          ]
        },
        "identity fusion": {
          "text": "A strong alignment of personal and group identity in which threats to the group are experienced as threats to the self.",
          "links": [
            {
              "href": "wiki:Identity fusion"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Social identity theory"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "threat-narrative",
      "term": "threat narrative",
      "clusters": [
        0,
        3
      ],
      "fact": "A threat narrative converts epistemic distortion into identity pressure when uncertain or misleading claims portray an out-group or dissenter as an existential danger to the community.",
      "info": {
        "text": "A story that organizes events and identities around a claimed danger requiring collective response.",
        "links": [
          {
            "href": "wiki:Moral panic"
          }
        ]
      },
      "conceptId": "threat-narrative",
      "relationKind": "dynamic",
      "idealTerms": [
        "threat misperception",
        "betrayal framing"
      ]
    },
    {
      "id": "normalization",
      "term": "normalization",
      "clusters": [
        1,
        2
      ],
      "fact": "Institutional repetition can normalize moral distortion by making conditional dignity, exclusion, or disproportionate treatment appear routine rather than exceptional.",
      "info": {
        "text": "The process by which a practice or judgment becomes familiar, expected, and treated as ordinary.",
        "links": [
          {
            "href": "wiki:Normalization (sociology)"
          }
        ]
      },
      "conceptId": "normalization",
      "relationKind": "dynamic",
      "idealTerms": [
        "conditional dignity",
        "procedural repetition"
      ]
    },
    {
      "id": "legitimacy",
      "term": "legitimacy",
      "clusters": [
        2,
        3
      ],
      "fact": "Institutional authority and group loyalty can reinforce legitimacy: official endorsement validates the group's commitments, while group identification supplies consent and social enforcement.",
      "info": {
        "text": "The recognized rightfulness of an authority, institution, rule, or social order.",
        "links": [
          {
            "href": "wiki:Legitimacy (political)"
          }
        ]
      },
      "conceptId": "legitimacy",
      "relationKind": "foundation",
      "idealTerms": [
        "role authority",
        "in-group loyalty"
      ]
    }
  ],
  "lenses": [
    {
      "id": "distorting-judgment",
      "prompt": "Which concepts directly alter what people perceive, believe, or treat as morally relevant?",
      "explanation": "Epistemic and moral distortions change the inputs or standards of judgment: what evidence is available, what danger is perceived, whose dignity counts, and what response seems proportionate.",
      "targets": [
        "information isolation",
        "threat misperception",
        "misinformation",
        "loss of context",
        "conditional dignity",
        "proportionality collapse"
      ],
      "reasons": {
        "information isolation": "Relevant evidence and alternative interpretations are kept outside the person's information environment.",
        "threat misperception": "Risk is exaggerated, displaced, or attached to the wrong target.",
        "misinformation": "False or misleading claims alter the factual basis for judgment.",
        "loss of context": "A fragment is interpreted without the circumstances needed to understand it.",
        "conditional dignity": "Human worth is treated as dependent on status, conduct, identity, or usefulness.",
        "proportionality collapse": "Differences in severity and consequence no longer constrain the response."
      }
    },
    {
      "id": "magnifying-structures",
      "prompt": "Which concepts can amplify an existing orientation through institutions or group identity?",
      "explanation": "Magnifying structures may not originate a distorted belief or value, but they can increase its reach, durability, legitimacy, and behavioral force.",
      "targets": [
        "role authority",
        "procedural repetition",
        "technical framing",
        "diffusion of responsibility",
        "in-group loyalty",
        "betrayal framing"
      ],
      "reasons": {
        "role authority": "An institutional position gives decisions additional force and presumed legitimacy.",
        "procedural repetition": "Repeated routines make an orientation ordinary and self-reproducing.",
        "technical framing": "Moral choices can be presented as neutral matters of expertise or administration.",
        "diffusion of responsibility": "Distributed action reduces each participant's felt responsibility.",
        "in-group loyalty": "Commitment to the group strengthens conformity with its judgments.",
        "betrayal framing": "Disagreement is recast as disloyalty, raising the cost of correction."
      }
    },
    {
      "id": "barriers-to-correction",
      "prompt": "Which concepts can make evidence, dissent, or moral reconsideration harder to receive?",
      "explanation": "Correction becomes difficult when contrary evidence cannot enter, authority discourages challenge, group loyalty punishes dissent, and repeated practices acquire the appearance of normality and legitimacy.",
      "targets": [
        "information isolation",
        "role authority",
        "in-group loyalty",
        "betrayal framing",
        "normalization",
        "legitimacy"
      ],
      "reasons": {
        "information isolation": "Corrective evidence may never reach the group or decision-maker.",
        "role authority": "Challenges can be dismissed as improper resistance to an authorized role.",
        "in-group loyalty": "Belonging becomes tied to accepting the group's account.",
        "betrayal framing": "Criticism is interpreted as treachery rather than possible correction.",
        "normalization": "Repeated harm becomes familiar and therefore less visible as a problem.",
        "legitimacy": "Practices accepted as rightful receive deference even when their effects warrant review."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Apply the diagnostic framework to institutional blindness, then examine practices that interrupt its pathways."
    },
    "entries": [
      {
        "id": "when-systems-stop-seeing-people",
        "reason": "See how authority, roles, and procedures can magnify distance from particular people.",
        "via": [
          "institutional magnification",
          "moral distance"
        ]
      },
      {
        "id": "restorative-patterns",
        "reason": "Turn from diagnosis toward recognition, restraint, accountability, and repair.",
        "via": [
          "moral judgment",
          "corrective practices"
        ]
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "distortion-and-magnification",
      "puzzleRevision": "fnv1a32:de5c6e97",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:information isolation": {
          "x": 167.56,
          "y": 242.59,
          "pinned": false
        },
        "term:threat misperception": {
          "x": 198.5,
          "y": 417.01,
          "pinned": false
        },
        "term:misinformation": {
          "x": 310.76,
          "y": 309.99,
          "pinned": false
        },
        "term:loss of context": {
          "x": 312.04,
          "y": 170.66,
          "pinned": false
        },
        "term:conditional dignity": {
          "x": 675.5,
          "y": 23,
          "pinned": false
        },
        "term:moral exclusion": {
          "x": 606.3,
          "y": 161.79,
          "pinned": false
        },
        "term:proportionality collapse": {
          "x": 492.42,
          "y": 34.42,
          "pinned": false
        },
        "term:moral disengagement": {
          "x": 460.64,
          "y": 215.08,
          "pinned": false
        },
        "term:role authority": {
          "x": 667.04,
          "y": 287.24,
          "pinned": false
        },
        "term:procedural repetition": {
          "x": 771.32,
          "y": 168.22,
          "pinned": false
        },
        "term:technical framing": {
          "x": 657.67,
          "y": 432.58,
          "pinned": false
        },
        "term:diffusion of responsibility": {
          "x": 829.08,
          "y": 358.85,
          "pinned": false
        },
        "term:in-group loyalty": {
          "x": 506.31,
          "y": 445.79,
          "pinned": false
        },
        "term:betrayal framing": {
          "x": 357.52,
          "y": 444.6,
          "pinned": false
        },
        "term:out-group homogeneity": {
          "x": 430.75,
          "y": 591.96,
          "pinned": false
        },
        "term:identity fusion": {
          "x": 589.89,
          "y": 565.05,
          "pinned": false
        },
        "term:threat narrative": {
          "x": 267.37,
          "y": 562.98,
          "pinned": false
        },
        "term:normalization": {
          "x": 825.58,
          "y": 23,
          "pinned": false
        },
        "term:legitimacy": {
          "x": 548.75,
          "y": 323.03,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3378.69,
        "score": 3378.690878357596
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:50.138Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "distortion-and-magnification",
      "puzzleRevision": "fnv1a32:de5c6e97",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 248.7,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 801.3,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 561.55,
          "pinned": false
        },
        "cluster:3": {
          "x": 525,
          "y": 234.45,
          "pinned": false
        }
      },
      "bridges": {
        "term:threat narrative": {
          "x": 313.31,
          "y": 242.69,
          "pinned": false
        },
        "term:normalization": {
          "x": 759.31,
          "y": 575.94,
          "pinned": false
        },
        "term:legitimacy": {
          "x": 525,
          "y": 398,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "information isolation",
          "threat misperception",
          "misinformation",
          "loss of context"
        ],
        "cluster:1": [
          "conditional dignity",
          "moral exclusion",
          "proportionality collapse",
          "moral disengagement"
        ],
        "cluster:2": [
          "role authority",
          "procedural repetition",
          "technical framing",
          "diffusion of responsibility"
        ],
        "cluster:3": [
          "in-group loyalty",
          "betrayal framing",
          "out-group homogeneity",
          "identity fusion"
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
        "totalLength": 301.8393691825126
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:38:52.210Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "distortion-and-magnification",
      "puzzleRevision": "fnv1a32:de5c6e97",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:information isolation": {
          "x": 393.02,
          "y": 598
        },
        "term:threat misperception": {
          "x": 572.29,
          "y": 584.35
        },
        "term:misinformation": {
          "x": 207.18,
          "y": 598
        },
        "term:loss of context": {
          "x": 67.25,
          "y": 598
        },
        "term:conditional dignity": {
          "x": 421.67,
          "y": 334.52
        },
        "term:moral exclusion": {
          "x": 117.64,
          "y": 465.88
        },
        "term:proportionality collapse": {
          "x": 95.6,
          "y": 293.89
        },
        "term:moral disengagement": {
          "x": 116.68,
          "y": 108.66
        },
        "term:role authority": {
          "x": 598.07,
          "y": 280.23
        },
        "term:procedural repetition": {
          "x": 340.69,
          "y": 153.42
        },
        "term:technical framing": {
          "x": 249.7,
          "y": 22
        },
        "term:diffusion of responsibility": {
          "x": 714.19,
          "y": 22
        },
        "term:in-group loyalty": {
          "x": 723.96,
          "y": 207
        },
        "term:betrayal framing": {
          "x": 735.03,
          "y": 554.86
        },
        "term:out-group homogeneity": {
          "x": 873.85,
          "y": 274.03
        },
        "term:identity fusion": {
          "x": 884.38,
          "y": 440.76
        },
        "term:threat narrative": {
          "x": 558.22,
          "y": 420.22
        },
        "term:normalization": {
          "x": 491.81,
          "y": 199.03
        },
        "term:legitimacy": {
          "x": 605.1,
          "y": 147.51
        },
        "cluster:0": {
          "x": 279.95,
          "y": 464.29
        },
        "cluster:1": {
          "x": 263.71,
          "y": 299.69
        },
        "cluster:2": {
          "x": 492.07,
          "y": 22
        },
        "cluster:3": {
          "x": 725.93,
          "y": 383.43
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:38:54.444Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:38:48.200Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
