// Generated from content/puzzles/regulating-blood-glucose.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "regulating-blood-glucose",
  "title": "Regulating blood glucose",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "endocrine-reproductive"
  },
  "info": {
    "text": "The pancreatic islets hold blood glucose in a narrow range: insulin stores fuel after meals, glucagon releases it between meals, and backup hormones defend against a fall. The brain takes up glucose without needing insulin, so that range protects its supply.",
    "links": [
      {
        "href": "wiki:Blood sugar regulation"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed.",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "pages": "ch. 79"
      },
      {
        "title": "Anatomy and Physiology 2e, §17.9 The Endocrine Pancreas",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-9-the-endocrine-pancreas"
      }
    ]
  },
  "clusters": [
    {
      "id": "pancreatic-islets",
      "name": "Pancreatic islets",
      "color": "teal",
      "fact": "Beta cells take up glucose and phosphorylate it with glucokinase; the rising ATP closes ATP-sensitive potassium channels, depolarizing the cell and releasing insulin, while alpha cells release glucagon as glucose falls.",
      "terms": [
        "islets of Langerhans",
        "beta cells",
        "alpha cells",
        "delta cells",
        "glucokinase",
        "ATP-sensitive potassium channels"
      ],
      "seeds": [
        "islets of Langerhans",
        "beta cells"
      ],
      "termInfo": {
        "ATP-sensitive potassium channels": {
          "text": "Beta-cell channels that close as ATP rises, depolarizing the cell so calcium enters and triggers insulin release.",
          "links": [
            {
              "href": "wiki:ATP-sensitive potassium channel"
            }
          ]
        },
        "alpha cells": {
          "text": "The islet cells that secrete glucagon when blood glucose falls.",
          "links": [
            {
              "href": "wiki:Alpha cell"
            }
          ]
        },
        "beta cells": {
          "text": "The islet cells that secrete insulin when blood glucose rises.",
          "links": [
            {
              "href": "wiki:Beta cell"
            }
          ]
        },
        "delta cells": {
          "text": "The islet cells that secrete somatostatin, which locally restrains both insulin and glucagon release.",
          "links": [
            {
              "href": "wiki:Delta cell"
            }
          ]
        },
        "glucokinase": {
          "text": "The beta cell's glucose sensor: it phosphorylates glucose entering through GLUT2 at a rate set by blood glucose.",
          "links": [
            {
              "href": "wiki:Glucokinase"
            }
          ]
        },
        "islets of Langerhans": {
          "text": "Clusters of endocrine cells scattered through the pancreas, about 1–2 percent of its mass.",
          "links": [
            {
              "href": "wiki:Pancreatic islets"
            }
          ]
        }
      },
      "info": "Where blood glucose is sensed and the hormone response is set."
    },
    {
      "id": "insulin-fed-state",
      "name": "Insulin's fed-state actions",
      "color": "blue",
      "fact": "After a meal insulin moves GLUT4 transporters into muscle and fat cell membranes and directs the excess fuel into storage as glycogen and fat; it also drives potassium into cells.",
      "terms": [
        "insulin",
        "GLUT4",
        "glycogenesis",
        "lipogenesis",
        "potassium uptake"
      ],
      "seeds": [
        "insulin",
        "GLUT4"
      ],
      "termInfo": {
        "GLUT4": {
          "text": "The insulin-responsive glucose transporter, moved to the membrane of muscle and fat cells when insulin binds.",
          "links": [
            {
              "href": "wiki:GLUT4"
            }
          ]
        },
        "glycogenesis": {
          "text": "Building glycogen from glucose for storage, chiefly in liver and muscle.",
          "links": [
            {
              "href": "wiki:Glycogenesis"
            }
          ]
        },
        "insulin": {
          "text": "The beta-cell hormone of the fed state: it lowers blood glucose by promoting uptake and storage.",
          "links": [
            {
              "href": "wiki:Insulin"
            }
          ]
        },
        "lipogenesis": {
          "text": "Converting excess glucose into fatty acids and storing them as fat.",
          "links": [
            {
              "href": "wiki:Lipogenesis"
            }
          ]
        },
        "potassium uptake": {
          "text": "Insulin stimulates the sodium–potassium pump, shifting potassium from plasma into cells.",
          "links": [
            {
              "href": "wiki:Sodium–potassium pump"
            }
          ]
        }
      },
      "info": "How insulin moves fuel out of the blood and into storage."
    },
    {
      "id": "fasting-fuel-release",
      "name": "Fasting fuel release",
      "color": "amber",
      "fact": "Between meals glucagon makes the liver break down glycogen and build new glucose, while low insulin lets fat stores break down; fatty acids reaching the liver feed ketogenesis, an alternative fuel for the brain in prolonged fasting.",
      "terms": [
        "glucagon",
        "glycogenolysis",
        "gluconeogenesis",
        "lipolysis",
        "ketogenesis"
      ],
      "seeds": [
        "glucagon",
        "glycogenolysis"
      ],
      "termInfo": {
        "glucagon": {
          "text": "The alpha-cell hormone of fasting: it raises blood glucose by acting chiefly on the liver.",
          "links": [
            {
              "href": "wiki:Glucagon"
            }
          ]
        },
        "gluconeogenesis": {
          "text": "New glucose made by the liver from amino acids, lactate, and glycerol, driven here by glucagon.",
          "links": [
            {
              "href": "wiki:Gluconeogenesis"
            }
          ]
        },
        "glycogenolysis": {
          "text": "Breaking down stored glycogen into glucose; the liver releases it into the blood.",
          "links": [
            {
              "href": "wiki:Glycogenolysis"
            }
          ]
        },
        "ketogenesis": {
          "text": "Liver conversion of fatty acids into ketone bodies, which the brain can burn when glucose is scarce.",
          "links": [
            {
              "href": "wiki:Ketogenesis"
            }
          ]
        },
        "lipolysis": {
          "text": "Breakdown of stored fat into fatty acids and glycerol, released as insulin falls.",
          "links": [
            {
              "href": "wiki:Lipolysis"
            }
          ]
        }
      },
      "info": "How stored fuel is released when no meal is coming in."
    },
    {
      "id": "counterregulatory-backup",
      "name": "Counterregulatory backup",
      "color": "magenta",
      "fact": "When glucose falls, epinephrine acts within minutes, and cortisol and growth hormone over hours, each raising glucose output or limiting its use.",
      "terms": [
        "epinephrine",
        "cortisol",
        "growth hormone"
      ],
      "seeds": [
        "epinephrine",
        "cortisol"
      ],
      "termInfo": {
        "cortisol": {
          "text": "The adrenocortical hormone: over hours it raises gluconeogenesis and reduces glucose use.",
          "links": [
            {
              "href": "wiki:Cortisol"
            }
          ]
        },
        "epinephrine": {
          "text": "The adrenal medullary hormone: the fastest backup, it raises liver glucose output and lipolysis.",
          "links": [
            {
              "href": "wiki:Adrenaline"
            }
          ]
        },
        "growth hormone": {
          "text": "The anterior pituitary hormone: over hours it shifts tissues from glucose toward fat as fuel.",
          "links": [
            {
              "href": "wiki:Growth hormone"
            }
          ]
        }
      },
      "info": {
        "text": "Hormones beyond glucagon that defend against low blood glucose.",
        "links": [
          {
            "href": "wiki:Counterregulatory hormone"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "liver-glycogen",
      "term": "liver glycogen",
      "clusters": [
        1,
        2
      ],
      "fact": "Liver glycogen links the fed and fasting states because one store is filled by insulin-driven glycogenesis after meals and emptied by glucagon-driven glycogenolysis between them.",
      "info": {
        "text": "The liver's glucose reserve, enough to cover roughly a day without food.",
        "links": [
          {
            "href": "wiki:Glycogen"
          }
        ]
      },
      "idealTerms": [
        "glycogenesis",
        "glycogenolysis"
      ]
    },
    {
      "id": "insulin-resistance",
      "term": "insulin resistance",
      "clusters": [
        1,
        3
      ],
      "fact": "Insulin resistance links insulin's actions to the backup hormones because cortisol and growth hormone blunt tissue responses to insulin, holding glucose up.",
      "info": {
        "text": "Reduced tissue response to insulin, induced by cortisol and growth hormone and central to type 2 diabetes.",
        "links": [
          {
            "href": "wiki:Insulin resistance"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "insulin",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    },
    {
      "id": "hypoglycemia",
      "term": "hypoglycemia",
      "clusters": [
        0,
        3
      ],
      "fact": "Hypoglycemia links the islets to the backup hormones because a falling glucose level first stops insulin release and triggers glucagon from the alpha cells, then calls in epinephrine, cortisol, and growth hormone.",
      "info": {
        "text": "Abnormally low blood glucose, dangerous because the brain depends on it.",
        "links": [
          {
            "href": "wiki:Hypoglycemia"
          }
        ]
      },
      "idealTerms": [
        "alpha cells",
        null
      ]
    }
  ],
  "lenses": [
    {
      "id": "brain-at-risk",
      "prompt": "Which condition threatens the brain within minutes?",
      "explanation": "Protecting the brain's supply is why the body keeps several hormones in reserve to defend against a fall, but only one to lower glucose.",
      "targets": [
        "hypoglycemia"
      ],
      "reasons": {
        "hypoglycemia": "The brain burns glucose continuously and stores almost none, so a fall in blood glucose starves it quickly."
      }
    },
    {
      "id": "raise-falling-glucose",
      "prompt": "Which hormones raise blood glucose when it falls too low?",
      "explanation": "Glucagon is the first line; epinephrine follows within minutes, and cortisol and growth hormone sustain the defense over hours.",
      "targets": [
        "glucagon",
        "epinephrine",
        "cortisol",
        "growth hormone"
      ],
      "reasons": {
        "cortisol": "Over hours it raises gluconeogenesis and reduces glucose use.",
        "epinephrine": "It acts within minutes to raise liver glucose output.",
        "glucagon": "The alpha cells release it as glucose falls, turning on liver glucose output.",
        "growth hormone": "Over hours it shifts tissues away from burning glucose."
      }
    },
    {
      "id": "glucose-to-insulin",
      "prompt": "Which concepts link a rise in blood glucose to insulin release?",
      "explanation": "Glucose metabolism inside the beta cell is itself the signal: more glucose means more ATP, which closes K-ATP channels and opens the way for calcium-triggered insulin release. Sulfonylurea drugs work by closing these same channels.",
      "targets": [
        "beta cells",
        "glucokinase",
        "ATP-sensitive potassium channels"
      ],
      "reasons": {
        "ATP-sensitive potassium channels": "Rising ATP closes them, depolarizing the cell to trigger release.",
        "beta cells": "They are the cells that sense glucose and secrete insulin.",
        "glucokinase": "Its rate tracks blood glucose, setting how much ATP the cell makes."
      }
    },
    {
      "id": "one-store",
      "prompt": "Which store does insulin fill after a meal and glucagon empty between meals?",
      "explanation": "Muscle glycogen fuels only the muscle that holds it; the liver's store is the one that can return glucose to the blood, covering roughly a day without food.",
      "targets": [
        "liver glycogen"
      ],
      "reasons": {
        "liver glycogen": "Glycogenesis fills it in the fed state, and glycogenolysis releases it as glucose during fasting."
      }
    },
    {
      "id": "insulin-and-potassium",
      "prompt": "Which concepts explain why an insulin dose lowers plasma potassium?",
      "explanation": "Insulin stimulates the sodium–potassium pump, moving potassium into cells; clinicians use this to treat dangerously high potassium, and must watch for low potassium when giving insulin.",
      "targets": [
        "insulin",
        "potassium uptake"
      ],
      "reasons": {
        "insulin": "It stimulates the pump that moves potassium into cells.",
        "potassium uptake": "The shift of potassium from plasma into cells is what lowers the plasma level."
      }
    },
    {
      "id": "ketoacidosis",
      "prompt": "Which concepts produce ketoacidosis when insulin is absent?",
      "explanation": "Without insulin, fat breakdown runs unrestrained and unopposed glucagon drives the liver to turn the flood of fatty acids into ketoacids faster than they can be used.",
      "targets": [
        "glucagon",
        "lipolysis",
        "ketogenesis"
      ],
      "reasons": {
        "glucagon": "Unopposed by insulin, it pushes the liver toward ketone production.",
        "ketogenesis": "It converts those fatty acids into the ketoacids that lower blood pH.",
        "lipolysis": "Unrestrained by insulin, it floods the liver with fatty acids."
      }
    },
    {
      "id": "type-2-hyperglycemia",
      "prompt": "Which concepts explain persistent hyperglycemia in type 2 diabetes?",
      "explanation": "Type 2 diabetes begins with tissues that respond poorly to insulin; glucose stays high once the beta cells can no longer secrete enough extra insulin to compensate.",
      "targets": [
        "insulin resistance",
        "beta cells"
      ],
      "reasons": {
        "beta cells": "Their compensatory secretion eventually falls short, so glucose stays high.",
        "insulin resistance": "Tissues take up and store less glucose for a given amount of insulin."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "hypothalamic-pituitary-axes",
        "reason": "See how cortisol and growth hormone secretion is controlled, and where their insulin resistance comes from."
      },
      {
        "id": "how-the-kidney-forms-urine",
        "reason": "Follow glucose through the kidney, where it spills into urine once blood levels exceed what the tubules can reabsorb."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Storing and releasing fuel",
    "summary": "How insulin, glucagon, and backup hormones hold blood glucose in a narrow range between meals.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Blood glucose stays in a narrow range even though meals arrive only a few times a day. The brain is the reason this matters: it burns glucose continuously and takes it up without needing insulin, so a fall in blood glucose, hypoglycemia, threatens it within minutes.\r\n\r\nThe control center is the islets of Langerhans in the pancreas. Beta cells secrete insulin, alpha cells secrete glucagon, and delta cells secrete somatostatin, which restrains both. Beta cells sense glucose directly: glucose entering the cell is phosphorylated by glucokinase, the rising ATP closes ATP-sensitive potassium channels, and the cell depolarizes and releases insulin.\r\n\r\nAfter a meal, insulin moves GLUT4 transporters into the membranes of muscle and fat cells so they can take up glucose. It drives glycogenesis, filling liver glycogen and muscle glycogen, and lipogenesis, storing extra fuel as fat. It also causes potassium uptake into cells. Between meals the pattern reverses. Glucagon makes the liver release glucose through glycogenolysis and gluconeogenesis, and falling insulin allows lipolysis. In prolonged fasting the liver turns fatty acids into ketone bodies by ketogenesis.\r\n\r\nGlucagon is not the only defense against a fall. Epinephrine acts within minutes, and cortisol and growth hormone act over hours. Cortisol and growth hormone also cause insulin resistance, which is likewise the starting point of type 2 diabetes."
    },
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-9-the-endocrine-pancreas",
        "label": "OpenStax: the endocrine pancreas"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5.5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "regulating-blood-glucose",
      "puzzleRevision": "fnv1a32:83f341ef",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:islets of Langerhans": {
          "x": 831.94,
          "y": 176.85
        },
        "term:beta cells": {
          "x": 958.5,
          "y": 244.55
        },
        "term:alpha cells": {
          "x": 689.9,
          "y": 129.97
        },
        "term:delta cells": {
          "x": 925.02,
          "y": 349
        },
        "term:glucokinase": {
          "x": 955.35,
          "y": 456.28
        },
        "term:ATP-sensitive potassium channels": {
          "x": 809.63,
          "y": 508.11
        },
        "term:insulin": {
          "x": 650.66,
          "y": 415.45
        },
        "term:GLUT4": {
          "x": 619.94,
          "y": 618.98
        },
        "term:glycogenesis": {
          "x": 456.33,
          "y": 428.23
        },
        "term:lipogenesis": {
          "x": 460.96,
          "y": 615.98
        },
        "term:potassium uptake": {
          "x": 276.9,
          "y": 610.97
        },
        "term:glucagon": {
          "x": 160.02,
          "y": 459.29
        },
        "term:glycogenolysis": {
          "x": 395.97,
          "y": 291.01
        },
        "term:gluconeogenesis": {
          "x": 88.72,
          "y": 382.02
        },
        "term:lipolysis": {
          "x": 126.83,
          "y": 256.03
        },
        "term:ketogenesis": {
          "x": 221.67,
          "y": 189.68
        },
        "term:epinephrine": {
          "x": 349.13,
          "y": 41.04
        },
        "term:cortisol": {
          "x": 508.14,
          "y": 38.03
        },
        "term:growth hormone": {
          "x": 656.49,
          "y": 38.03
        },
        "term:liver glycogen": {
          "x": 300.52,
          "y": 486.51
        },
        "term:insulin resistance": {
          "x": 540.87,
          "y": 344.04
        },
        "term:hypoglycemia": {
          "x": 633.54,
          "y": 246.34
        },
        "cluster:0": {
          "x": 766.11,
          "y": 331.53
        },
        "cluster:1": {
          "x": 548.38,
          "y": 537.47
        },
        "cluster:2": {
          "x": 244.76,
          "y": 337.5
        },
        "cluster:3": {
          "x": 509.39,
          "y": 162.61
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T04:31:47.698Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "regulating-blood-glucose",
      "puzzleRevision": "fnv1a32:83f341ef",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 175.72,
          "y": 333,
          "pinned": false
        },
        "cluster:1": {
          "x": 510.01,
          "y": 179.38,
          "pinned": true
        },
        "cluster:2": {
          "x": 845.3,
          "y": 334,
          "pinned": true
        },
        "cluster:3": {
          "x": 534.06,
          "y": 510.67,
          "pinned": true
        }
      },
      "bridges": {
        "term:liver glycogen": {
          "x": 639.79,
          "y": 334.26,
          "pinned": false
        },
        "term:insulin resistance": {
          "x": 485.2,
          "y": 352.8,
          "pinned": false
        },
        "term:hypoglycemia": {
          "x": 368.36,
          "y": 403.8,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "islets of Langerhans",
          "beta cells",
          "alpha cells",
          "delta cells",
          "glucokinase",
          "ATP-sensitive potassium channels"
        ],
        "cluster:1": [
          "insulin",
          "GLUT4",
          "glycogenesis",
          "lipogenesis",
          "potassium uptake"
        ],
        "cluster:2": [
          "glucagon",
          "glycogenolysis",
          "gluconeogenesis",
          "lipolysis",
          "ketogenesis"
        ],
        "cluster:3": [
          "epinephrine",
          "cortisol",
          "growth hormone"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "delta cells",
          "glucokinase",
          "ATP-sensitive potassium channels",
          "islets of Langerhans",
          "alpha cells",
          "beta cells"
        ],
        "cluster:1": [
          "GLUT4",
          "lipogenesis",
          "potassium uptake",
          "glycogenesis",
          "insulin"
        ],
        "cluster:2": [
          "glucagon",
          "ketogenesis",
          "gluconeogenesis",
          "glycogenolysis",
          "lipolysis"
        ],
        "cluster:3": [
          "cortisol",
          "growth hormone",
          "epinephrine"
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
        "totalLength": 702.9839655706091
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T04:32:19.898Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "regulating-blood-glucose",
      "puzzleRevision": "fnv1a32:83f341ef",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:islets of Langerhans": {
          "x": 771.7,
          "y": 480.27,
          "pinned": true
        },
        "term:beta cells": {
          "x": 921.5,
          "y": 437.84,
          "pinned": true
        },
        "term:alpha cells": {
          "x": 673.65,
          "y": 378.61,
          "pinned": true
        },
        "term:delta cells": {
          "x": 872.1,
          "y": 556.68,
          "pinned": true
        },
        "term:glucokinase": {
          "x": 739.37,
          "y": 582.91,
          "pinned": true
        },
        "term:ATP-sensitive potassium channels": {
          "x": 825.76,
          "y": 307.82,
          "pinned": true
        },
        "term:insulin": {
          "x": 274.77,
          "y": 461.29,
          "pinned": false
        },
        "term:GLUT4": {
          "x": 337.47,
          "y": 534.57,
          "pinned": true
        },
        "term:glycogenesis": {
          "x": 230.37,
          "y": 354.72,
          "pinned": true
        },
        "term:lipogenesis": {
          "x": 208.57,
          "y": 555.17,
          "pinned": true
        },
        "term:potassium uptake": {
          "x": 140.44,
          "y": 453.33,
          "pinned": true
        },
        "term:glucagon": {
          "x": 468.19,
          "y": 154.57,
          "pinned": false
        },
        "term:glycogenolysis": {
          "x": 418.41,
          "y": 261.29,
          "pinned": true
        },
        "term:gluconeogenesis": {
          "x": 353.05,
          "y": 119.2,
          "pinned": false
        },
        "term:lipolysis": {
          "x": 556.24,
          "y": 103.99,
          "pinned": false
        },
        "term:ketogenesis": {
          "x": 461.01,
          "y": 46.96,
          "pinned": false
        },
        "term:epinephrine": {
          "x": 543.68,
          "y": 401.37,
          "pinned": true
        },
        "term:cortisol": {
          "x": 608.33,
          "y": 481.96,
          "pinned": true
        },
        "term:growth hormone": {
          "x": 488.11,
          "y": 524.13,
          "pinned": true
        },
        "term:liver glycogen": {
          "x": 266,
          "y": 228.02,
          "pinned": false
        },
        "term:insulin resistance": {
          "x": 384.72,
          "y": 398.26,
          "pinned": false
        },
        "term:hypoglycemia": {
          "x": 581.72,
          "y": 280.48,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3166.19,
        "score": 3166.1863351602697
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T04:34:21.505Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-14T04:30:17.147Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
