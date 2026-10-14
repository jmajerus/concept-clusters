// Generated from content/puzzles/muscular-system.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "muscular-system",
  "title": "The muscular system",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "muscle"
  },
  "info": {
    "text": "Nerve orders become sliding-filament force: acetylcholine fires the fiber, calcium exposes actin, myosin ratchets, and three fuel routes pay in sequence.",
    "links": [
      {
        "href": "wiki:Muscular system"
      }
    ],
    "citations": [
      {
        "title": "10.3 Muscle Fiber Contraction and Relaxation (Anatomy and Physiology 2e)",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation"
      },
      {
        "title": "Skeletal muscle metabolism (Basic Human Physiology)",
        "publisher": "Indiana University Pressbooks",
        "url": "https://iu.pressbooks.pub/humanphys/chapter/skeletal-muscle-metabolism/"
      },
      {
        "title": "MuscleTraining: slow and fast twitch fibers (Bio102)",
        "publisher": "University of Connecticut",
        "url": "http://hydrodictyon.eeb.uconn.edu/courses/bio102/MuscleTraining.pdf"
      }
    ]
  },
  "clusters": [
    {
      "id": "sarcomere-machine",
      "name": "Sarcomere machine",
      "color": "teal",
      "fact": "Thin actin and thick myosin filaments ratchet past each other: calcium-bound troponin exposes actin's sites, myosin cross-bridges grab on, and power strokes shorten each sarcomere.",
      "terms": [
        "actin",
        "myosin",
        "sarcomere",
        "cross-bridge",
        "troponin",
        "calcium ions"
      ],
      "seeds": [
        "actin",
        "myosin"
      ],
      "termInfo": {
        "actin": {
          "text": "The thin filament offering binding sites for myosin heads.",
          "links": [
            {
              "href": "wiki:Actin"
            }
          ]
        },
        "myosin": {
          "text": "The thick filament whose heads grab actin and pull.",
          "links": [
            {
              "href": "wiki:Myosin"
            }
          ]
        },
        "sarcomere": {
          "text": "The repeating contractile unit shortening with every power stroke.",
          "links": [
            {
              "href": "wiki:Sarcomere"
            }
          ]
        },
        "cross-bridge": "The bound myosin head mid-pull on actin.",
        "troponin": {
          "text": "The calcium sensor shifting tropomyosin off actin's sites.",
          "links": [
            {
              "href": "wiki:Troponin"
            }
          ]
        },
        "calcium ions": {
          "text": "The trigger: released in bulk, they expose actin for binding.",
          "links": [
            {
              "href": "wiki:Calcium"
            }
          ]
        }
      },
      "info": {
        "text": "Thin and thick filaments ratcheting under calcium control.",
        "links": [
          {
            "href": "wiki:Sarcomere"
          }
        ]
      }
    },
    {
      "id": "excitation-command",
      "name": "Excitation command",
      "color": "blue",
      "fact": "One motor neuron plus its muscle fibers form a motor unit, fired when acetylcholine crosses the neuromuscular junction and triggers a muscle action potential.",
      "terms": [
        "motor unit",
        "neuromuscular junction",
        "acetylcholine",
        "muscle action potential",
        "muscle fiber"
      ],
      "seeds": [
        "motor unit",
        "neuromuscular junction"
      ],
      "termInfo": {
        "motor unit": {
          "text": "One motor neuron plus all the fibers it fires as a team.",
          "links": [
            {
              "href": "wiki:Motor unit"
            }
          ]
        },
        "neuromuscular junction": {
          "text": "The synapse where nerve meets fiber, crossed by acetylcholine.",
          "links": [
            {
              "href": "wiki:Neuromuscular junction"
            }
          ]
        },
        "acetylcholine": {
          "text": "The junction's neurotransmitter triggering fiber depolarization.",
          "links": [
            {
              "href": "wiki:Acetylcholine"
            }
          ]
        },
        "muscle action potential": "The depolarization wave sweeping the fiber to open calcium stores.",
        "muscle fiber": {
          "text": "The long multinucleated cell packed with sarcomeres.",
          "links": [
            {
              "href": "wiki:Skeletal muscle"
            }
          ]
        }
      },
      "info": {
        "text": "One motor neuron, its fibers, and the junction that fires them.",
        "links": [
          {
            "href": "wiki:Neuromuscular junction"
          }
        ]
      }
    },
    {
      "id": "fiber-types",
      "name": "Fiber types",
      "color": "amber",
      "fact": "Slow-twitch fibers burn oxygen steadily with myoglobin and mitochondria, resisting fatigue; fast-twitch fibers contract powerfully and tire quickly.",
      "terms": [
        "slow-twitch fibers",
        "fast-twitch fibers",
        "myoglobin",
        "mitochondria",
        "fatigue"
      ],
      "seeds": [
        "slow-twitch fibers",
        "fast-twitch fibers"
      ],
      "termInfo": {
        "slow-twitch fibers": "Oxidative endurers: myoglobin-rich, mitochondrial, fatigue-resistant.",
        "fast-twitch fibers": "Powerful sprinters: glycolytic, fast-firing, quick to tire.",
        "myoglobin": {
          "text": "The oxygen-storing protein tinting slow fibers red.",
          "links": [
            {
              "href": "wiki:Myoglobin"
            }
          ]
        },
        "mitochondria": {
          "text": "Aerobic ATP plants, dense in fibers built to last.",
          "links": [
            {
              "href": "wiki:Mitochondria"
            }
          ]
        },
        "fatigue": {
          "text": "Force fading when ATP supply or chemistry can no longer keep up.",
          "links": [
            {
              "href": "wiki:Fatigue"
            }
          ]
        }
      },
      "info": {
        "text": "Enduring slow fibers versus powerful fast ones.",
        "links": [
          {
            "href": "wiki:Skeletal muscle"
          }
        ]
      }
    },
    {
      "id": "fuel-supply",
      "name": "Fuel supply",
      "color": "magenta",
      "fact": "Contraction is paid three ways in sequence: creatine phosphate for seconds, glycolysis of glycogen for minutes, oxidative phosphorylation for sustained work, all delivering ATP.",
      "terms": [
        "ATP",
        "creatine phosphate",
        "glycogen",
        "glycolysis",
        "oxidative phosphorylation"
      ],
      "seeds": [
        "ATP",
        "creatine phosphate"
      ],
      "termInfo": {
        "ATP": {
          "text": "The energy currency every power stroke spends.",
          "links": [
            {
              "href": "wiki:Adenosine triphosphate"
            }
          ]
        },
        "creatine phosphate": {
          "text": "Seconds-fast ATP backup, spent first.",
          "links": [
            {
              "href": "wiki:Phosphocreatine"
            }
          ]
        },
        "glycogen": {
          "text": "Stored glucose feeding glycolysis for minutes of work.",
          "links": [
            {
              "href": "wiki:Glycogen"
            }
          ]
        },
        "glycolysis": {
          "text": "Fast ATP from glucose without oxygen, tiring quickly.",
          "links": [
            {
              "href": "wiki:Glycolysis"
            }
          ]
        },
        "oxidative phosphorylation": {
          "text": "Slow, high-yield ATP from mitochondria for sustained work.",
          "links": [
            {
              "href": "wiki:Oxidative phosphorylation"
            }
          ]
        }
      },
      "info": {
        "text": "Three ATP routes for seconds, minutes, and sustained work.",
        "links": [
          {
            "href": "wiki:Adenosine triphosphate"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "term": "sarcoplasmic calcium release",
      "clusters": [
        1,
        0
      ],
      "fact": "Sarcoplasmic calcium release links command to machine because the muscle action potential opens calcium stores, and calcium-bound troponin exposes actin for cross-bridges.",
      "info": "Bulk calcium release turning an electrical command into exposed actin sites.",
      "idealTerms": [
        "muscle action potential",
        "calcium ions"
      ]
    },
    {
      "term": "ATP-driven power stroke",
      "clusters": [
        0,
        3
      ],
      "fact": "The ATP-driven power stroke links machine to fuel because each myosin cross-bridge cycle burns one ATP, binding the ratchet to the supply routes.",
      "info": {
        "text": "One ATP spent per myosin pull: the machine's energy currency made visible.",
        "links": [
          {
            "href": "wiki:Muscle contraction"
          }
        ]
      },
      "idealTerms": [
        "myosin",
        "ATP"
      ]
    },
    {
      "term": "oxygen reserve",
      "clusters": [
        2,
        3
      ],
      "fact": "The oxygen reserve links fiber construction to fuel choice because myoglobin's stored oxygen feeds the oxidative phosphorylation slow fibers live on.",
      "info": "Stored oxygen linking fiber construction to fuel choice.",
      "idealTerms": [
        "myoglobin",
        "oxidative phosphorylation"
      ]
    }
  ],
  "lenses": [
    {
      "id": "order-into-fiber",
      "prompt": "Which concepts carry the nerve's order into the fiber?",
      "explanation": "The delivery chain: the unit, the junction, the messenger, and the wave it starts.",
      "targets": [
        "motor unit",
        "neuromuscular junction",
        "acetylcholine",
        "muscle action potential"
      ],
      "reasons": {
        "motor unit": "The team that must pull together on one neuron's order.",
        "neuromuscular junction": "The crossing point from nerve to fiber.",
        "acetylcholine": "The messenger crossing that junction.",
        "muscle action potential": "The wave the messenger starts, sweeping toward calcium stores."
      }
    },
    {
      "id": "fuel-ladder",
      "prompt": "Which concepts supply ATP for contraction, fastest route first?",
      "explanation": "ATP is the currency; the other three are supply routes ordered by speed: seconds, minutes, sustained.",
      "targets": [
        "ATP",
        "creatine phosphate",
        "glycolysis",
        "oxidative phosphorylation"
      ],
      "reasons": {
        "ATP": "The currency every power stroke spends.",
        "creatine phosphate": "Seconds-fast backup, spent first.",
        "glycolysis": "Minutes-fast ATP from glucose without oxygen.",
        "oxidative phosphorylation": "Slow, high-yield supply for sustained work."
      }
    },
    {
      "id": "slow-fiber-endurance",
      "prompt": "Which concepts give slow fibers their endurance?",
      "explanation": "Endurance is construction: oxygen storage plus aerobic plants in the fiber built to last.",
      "targets": [
        "slow-twitch fibers",
        "myoglobin",
        "mitochondria"
      ],
      "reasons": {
        "slow-twitch fibers": "The endurers themselves, built oxidative.",
        "myoglobin": "Stored oxygen on site for steady burning.",
        "mitochondria": "Dense aerobic plants keeping ATP flowing."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-neurons-fire-and-signal",
        "reason": "See where the order comes from: how the motor neuron fires an action potential and releases acetylcholine across a synapse."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Orders into force",
    "summary": "How nerve orders become sliding-filament force, tuned by fiber type and paid by three fuel routes.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Muscle is where the body's fast signaling finally does something visible. A nerve pulse too small to see becomes a contraction strong enough to lift you, through a molecular ratchet repeated billions of times across the fiber.\r\n\r\nThree ideas organize the system. First the machine: filaments sliding under calcium control. Then the delivery: how a nerve order reaches every fiber that must pull together. Finally the economics: three fuel routes, each tuned to a different duration of work, matched by fibers built for endurance or power."
    },
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation",
        "label": "OpenStax: muscle fiber contraction and relaxation"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
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
    "star": {
      "schemaVersion": 1,
      "puzzleId": "muscular-system",
      "puzzleRevision": "fnv1a32:e4f0acca",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:actin": {
          "x": 175.1,
          "y": 53.06
        },
        "term:myosin": {
          "x": 207.19,
          "y": 116.61
        },
        "term:sarcomere": {
          "x": 501.69,
          "y": 22
        },
        "term:cross-bridge": {
          "x": 297.49,
          "y": 22
        },
        "term:troponin": {
          "x": 609.96,
          "y": 32.04
        },
        "term:calcium ions": {
          "x": 344.23,
          "y": 155.44
        },
        "term:motor unit": {
          "x": 706.57,
          "y": 87.6
        },
        "term:neuromuscular junction": {
          "x": 858.75,
          "y": 58.63
        },
        "term:acetylcholine": {
          "x": 899.05,
          "y": 343.87
        },
        "term:muscle action potential": {
          "x": 739.69,
          "y": 378
        },
        "term:muscle fiber": {
          "x": 902.2,
          "y": 210.38
        },
        "term:slow-twitch fibers": {
          "x": 470.61,
          "y": 581.97
        },
        "term:fast-twitch fibers": {
          "x": 642.51,
          "y": 549.85
        },
        "term:myoglobin": {
          "x": 566.52,
          "y": 285.68
        },
        "term:mitochondria": {
          "x": 691.77,
          "y": 486.9
        },
        "term:fatigue": {
          "x": 382.56,
          "y": 520.84
        },
        "term:ATP": {
          "x": 222.13,
          "y": 362.12
        },
        "term:creatine phosphate": {
          "x": 128.03,
          "y": 505.68
        },
        "term:glycogen": {
          "x": 382.74,
          "y": 409.22
        },
        "term:glycolysis": {
          "x": 114.83,
          "y": 412.6
        },
        "term:oxidative phosphorylation": {
          "x": 379.17,
          "y": 323.51
        },
        "term:sarcoplasmic calcium release": {
          "x": 599.69,
          "y": 193.8
        },
        "term:ATP-driven power stroke": {
          "x": 151.06,
          "y": 280.09
        },
        "term:oxygen reserve": {
          "x": 415.5,
          "y": 255.38
        },
        "cluster:0": {
          "x": 457.3,
          "y": 92.64
        },
        "cluster:1": {
          "x": 755.78,
          "y": 261.32
        },
        "cluster:2": {
          "x": 526.77,
          "y": 481.23
        },
        "cluster:3": {
          "x": 252.57,
          "y": 446.89
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-07T23:31:29.394Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "muscular-system",
      "puzzleRevision": "fnv1a32:e4f0acca",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 799.87,
          "y": 202.28,
          "pinned": true
        },
        "cluster:1": {
          "x": 719.86,
          "y": 580.57,
          "pinned": true
        },
        "cluster:2": {
          "x": 364.12,
          "y": 600.3,
          "pinned": true
        },
        "cluster:3": {
          "x": 226.02,
          "y": 218.72,
          "pinned": true
        }
      },
      "bridges": {
        "term:sarcoplasmic calcium release": {
          "x": 921.53,
          "y": 410.06,
          "pinned": true
        },
        "term:ATP-driven power stroke": {
          "x": 525,
          "y": 213.24,
          "pinned": true
        },
        "term:oxygen reserve": {
          "x": 208.05,
          "y": 439.4,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "actin",
          "myosin",
          "sarcomere",
          "cross-bridge",
          "troponin",
          "calcium ions"
        ],
        "cluster:1": [
          "motor unit",
          "neuromuscular junction",
          "acetylcholine",
          "muscle action potential",
          "muscle fiber"
        ],
        "cluster:2": [
          "slow-twitch fibers",
          "fast-twitch fibers",
          "myoglobin",
          "mitochondria",
          "fatigue"
        ],
        "cluster:3": [
          "ATP",
          "creatine phosphate",
          "glycogen",
          "glycolysis",
          "oxidative phosphorylation"
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
        "totalLength": 612.5705514974961
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-08T13:07:42.080Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "muscular-system",
      "puzzleRevision": "fnv1a32:e4f0acca",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:actin": {
          "x": 304.8,
          "y": 101.9,
          "pinned": false
        },
        "term:myosin": {
          "x": 225.94,
          "y": 126.59,
          "pinned": false
        },
        "term:sarcomere": {
          "x": 355.04,
          "y": 24.71,
          "pinned": false
        },
        "term:cross-bridge": {
          "x": 240.9,
          "y": 23,
          "pinned": false
        },
        "term:troponin": {
          "x": 392.01,
          "y": 119.29,
          "pinned": false
        },
        "term:calcium ions": {
          "x": 302.99,
          "y": 203.42,
          "pinned": false
        },
        "term:motor unit": {
          "x": 599.33,
          "y": 159.72,
          "pinned": false
        },
        "term:neuromuscular junction": {
          "x": 741.39,
          "y": 115.47,
          "pinned": false
        },
        "term:acetylcholine": {
          "x": 502.01,
          "y": 88.77,
          "pinned": false
        },
        "term:muscle action potential": {
          "x": 673.16,
          "y": 292.52,
          "pinned": false
        },
        "term:muscle fiber": {
          "x": 613.27,
          "y": 28.07,
          "pinned": false
        },
        "term:slow-twitch fibers": {
          "x": 561.73,
          "y": 430.24,
          "pinned": false
        },
        "term:fast-twitch fibers": {
          "x": 723.67,
          "y": 480.5,
          "pinned": true
        },
        "term:myoglobin": {
          "x": 428.7,
          "y": 430.31,
          "pinned": false
        },
        "term:mitochondria": {
          "x": 515.08,
          "y": 564.88,
          "pinned": false
        },
        "term:fatigue": {
          "x": 620.58,
          "y": 542.51,
          "pinned": false
        },
        "term:ATP": {
          "x": 144.43,
          "y": 420.53,
          "pinned": false
        },
        "term:creatine phosphate": {
          "x": 161.76,
          "y": 535.67,
          "pinned": false
        },
        "term:glycogen": {
          "x": 47.2,
          "y": 474.57,
          "pinned": false
        },
        "term:glycolysis": {
          "x": 69.67,
          "y": 372.34,
          "pinned": false
        },
        "term:oxidative phosphorylation": {
          "x": 277.96,
          "y": 393.73,
          "pinned": false
        },
        "term:sarcoplasmic calcium release": {
          "x": 466.7,
          "y": 262.36,
          "pinned": false
        },
        "term:ATP-driven power stroke": {
          "x": 148.43,
          "y": 242.4,
          "pinned": false
        },
        "term:oxygen reserve": {
          "x": 371.82,
          "y": 536.49,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3553.84,
        "score": 3553.8446410595384
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-08T13:08:23.455Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
