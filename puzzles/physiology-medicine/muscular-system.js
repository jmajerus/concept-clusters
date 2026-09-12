// Generated from content/puzzles/muscular-system.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "muscular-system",
  "title": "The muscular system",
  "category": "physiology-medicine",
  "large": true,
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
      "id": "sarcoplasmic-calcium-release",
      "term": "sarcoplasmic calcium release",
      "clusters": [
        1,
        0
      ],
      "fact": "Sarcoplasmic calcium release links command to machine because the muscle action potential opens calcium stores, and calcium-bound troponin exposes actin for cross-bridges.",
      "info": "Bulk calcium release turning an electrical command into exposed actin sites.",
      "termRole": "connector",
      "idealTerms": [
        "muscle action potential",
        "calcium ions"
      ]
    },
    {
      "id": "atp-driven-power-stroke",
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
      "termRole": "reference",
      "idealTerms": [
        "myosin",
        "ATP"
      ]
    },
    {
      "id": "oxygen-reserve",
      "term": "oxygen reserve",
      "clusters": [
        2,
        3
      ],
      "fact": "The oxygen reserve links fiber construction to fuel choice because myoglobin's stored oxygen feeds the oxidative phosphorylation slow fibers live on.",
      "info": "Stored oxygen linking fiber construction to fuel choice.",
      "termRole": "connector",
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
        "id": "nervous-system",
        "reason": "See where the order comes from: the motor neuron behind the motor unit and the action potential behind the muscle pulse."
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
      }
    ]
  }
});
