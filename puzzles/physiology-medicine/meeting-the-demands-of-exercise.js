// Generated from content/puzzles/meeting-the-demands-of-exercise.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "meeting-the-demands-of-exercise",
  "title": "Meeting the demands of exercise",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "integrative"
  },
  "info": {
    "text": "How the whole body meets the oxygen and fuel demands of working muscle: the limits on oxygen uptake, the shifting fuel mix, the cardiovascular response, and what training changes.",
    "links": [
      {
        "href": "wiki:Exercise physiology"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed.",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "pages": "ch. 85 (Sports Physiology)"
      },
      {
        "title": "Endurance exercise performance: the physiology of champions",
        "author": "Michael J. Joyner, Edward F. Coyle",
        "publisher": "The Journal of Physiology 586(1)",
        "year": "2008",
        "pages": "35-44",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17901124/"
      },
      {
        "title": "Balance of carbohydrate and lipid utilization during exercise: the \"crossover\" concept",
        "author": "George A. Brooks, Jacques Mercier",
        "publisher": "Journal of Applied Physiology 76(6)",
        "year": "1994",
        "pages": "2253-2261",
        "url": "https://pubmed.ncbi.nlm.nih.gov/7928844/"
      },
      {
        "title": "Adaptations of skeletal muscle to endurance exercise and their metabolic consequences",
        "author": "John O. Holloszy, Edward F. Coyle",
        "publisher": "Journal of Applied Physiology 56(4)",
        "year": "1984",
        "pages": "831-838",
        "url": "https://pubmed.ncbi.nlm.nih.gov/6373687/"
      }
    ]
  },
  "clusters": [
    {
      "id": "oxygen-uptake",
      "name": "Oxygen uptake",
      "color": "teal",
      "fact": "Oxygen uptake rises with exercise intensity until it levels off at VO₂ max. At the start of exercise uptake lags behind demand, an oxygen deficit covered by phosphocreatine and anaerobic glycolysis; after exercise it stays above resting while phosphocreatine is rebuilt and lactate is cleared.",
      "terms": [
        "VO₂ max",
        "excess post-exercise oxygen consumption",
        "oxygen deficit"
      ],
      "seeds": [
        "VO₂ max",
        "excess post-exercise oxygen consumption"
      ],
      "termInfo": {
        "VO₂ max": {
          "text": "The highest rate at which the body can take up and use oxygen, reached when uptake stops rising as work gets harder; the standard measure of aerobic capacity.",
          "links": [
            {
              "href": "wiki:VO2 max"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/17901124/"
            }
          ]
        },
        "excess post-exercise oxygen consumption": {
          "text": "EPOC: oxygen uptake that stays above resting after exercise ends, while phosphocreatine and oxygen stores are restored and lactate is cleared. Guyton calls it the oxygen debt.",
          "links": [
            {
              "href": "wiki:Excess post-exercise oxygen consumption"
            }
          ]
        },
        "oxygen deficit": "The shortfall in oxygen uptake during the first minutes of exercise, before delivery catches up with demand; stored phosphocreatine and anaerobic glycolysis cover the gap."
      },
      "info": {
        "links": [
          {
            "href": "wiki:VO2 max"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/17901124/"
          }
        ]
      }
    },
    {
      "id": "fuel-selection",
      "name": "Fuel selection",
      "color": "blue",
      "fact": "Working muscle burns a mix of carbohydrate and fat. As intensity rises the mix shifts toward carbohydrate, a shift the respiratory exchange ratio tracks. Muscle glycogen is a limited store, so prolonged hard exercise falters when it runs out, and carbohydrate loading beforehand enlarges it.",
      "terms": [
        "muscle glycogen",
        "fatty acids",
        "respiratory exchange ratio",
        "crossover point",
        "glycogen depletion",
        "carbohydrate loading"
      ],
      "seeds": [
        "muscle glycogen",
        "fatty acids"
      ],
      "termInfo": {
        "carbohydrate loading": {
          "text": "Eating extra carbohydrate while tapering training for several days before an endurance event, which raises muscle glycogen well above its usual level.",
          "links": [
            {
              "href": "wiki:Carbohydrate loading"
            }
          ]
        },
        "crossover point": {
          "text": "The exercise intensity above which carbohydrate supplies more of the energy than fat (Brooks and Mercier's crossover concept).",
          "links": [
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/7928844/"
            }
          ]
        },
        "fatty acids": {
          "text": "Fuel released from fat tissue and from fat droplets inside muscle: plentiful, but oxidized more slowly than carbohydrate and only with oxygen.",
          "links": [
            {
              "href": "wiki:Fatty acid metabolism"
            }
          ]
        },
        "glycogen depletion": {
          "text": "Exhaustion of muscle glycogen late in prolonged hard exercise, which forces the pace down; endurance athletes call it hitting the wall.",
          "links": [
            {
              "href": "wiki:Hitting the wall"
            }
          ]
        },
        "muscle glycogen": {
          "text": "Glucose stored inside muscle fibers, the main fuel of hard exercise; the body's muscles hold only a few hundred grams.",
          "links": [
            {
              "href": "wiki:Glycogen"
            }
          ]
        },
        "respiratory exchange ratio": {
          "text": "Carbon dioxide output divided by oxygen uptake, measured in expired air: near 0.7 when fat is the fuel and near 1.0 for carbohydrate.",
          "links": [
            {
              "href": "wiki:Respiratory quotient"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/7928844/"
          }
        ]
      }
    },
    {
      "id": "cardiovascular-response",
      "name": "Cardiovascular response",
      "color": "amber",
      "fact": "In exercise, cardiac output rises several-fold and is redistributed: vessels in the gut, kidneys, and inactive muscle narrow while working muscle dilates. Central command from the brain and the exercise pressor reflex from working muscle raise sympathetic drive, and the skeletal muscle pump speeds venous blood back to the heart.",
      "terms": [
        "cardiac output",
        "redistribution of blood flow",
        "central command",
        "exercise pressor reflex",
        "skeletal muscle pump"
      ],
      "seeds": [
        "cardiac output",
        "redistribution of blood flow"
      ],
      "termInfo": {
        "cardiac output": {
          "text": "Blood pumped by the heart each minute: about 5 liters at rest, rising several-fold in hard exercise.",
          "links": [
            {
              "href": "wiki:Cardiac output"
            }
          ]
        },
        "central command": "Signals from the brain's motor areas that raise heart rate, arterial pressure, and breathing alongside the command to the muscles, before feedback from the muscles arrives.",
        "exercise pressor reflex": "Feedback from mechanical and chemical receptors in working muscle that raises sympathetic drive, heart rate, and arterial pressure.",
        "redistribution of blood flow": "The shift of cardiac output toward working muscle, which can take most of it in hard exercise, as sympathetic constriction narrows vessels in the gut, kidneys, and inactive muscle.",
        "skeletal muscle pump": {
          "text": "Rhythmic squeezing of veins by contracting muscle, which with the venous valves drives blood back toward the heart.",
          "links": [
            {
              "href": "wiki:Skeletal muscle pump"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cardiac output"
          }
        ]
      }
    },
    {
      "id": "training-adaptations",
      "name": "Training adaptations",
      "color": "magenta",
      "fact": "Endurance training enlarges the heart's chambers, multiplies mitochondria and capillaries in trained muscle, and expands plasma volume, so the resting heart can beat more slowly. Resistance training instead enlarges the muscle fibers themselves.",
      "terms": [
        "athlete's heart",
        "muscle hypertrophy",
        "mitochondrial biogenesis",
        "capillary density",
        "plasma volume expansion",
        "resting bradycardia"
      ],
      "seeds": [
        "athlete's heart",
        "muscle hypertrophy"
      ],
      "termInfo": {
        "athlete's heart": {
          "text": "Training-induced enlargement of the heart, chiefly of the left ventricle's chamber after endurance training: a healthy adaptation.",
          "links": [
            {
              "href": "wiki:Athletic heart syndrome"
            }
          ]
        },
        "capillary density": {
          "text": "The number of capillaries around each muscle fiber; endurance training raises it, shortening the path for oxygen and fuel.",
          "links": [
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/6373687/"
            }
          ]
        },
        "mitochondrial biogenesis": {
          "text": "Production of new mitochondria in trained muscle, raising its capacity to oxidize fat and carbohydrate.",
          "links": [
            {
              "href": "wiki:Mitochondrial biogenesis"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/6373687/"
            }
          ]
        },
        "muscle hypertrophy": {
          "text": "Growth of muscle fibers through added contractile protein, the main adaptation to resistance training.",
          "links": [
            {
              "href": "wiki:Muscle hypertrophy"
            }
          ]
        },
        "plasma volume expansion": "A rise in plasma volume within days of starting endurance training, which helps fill the heart and supplies water for sweating.",
        "resting bradycardia": {
          "text": "A resting heart rate below 60 beats a minute in a trained endurance athlete, reflecting a larger stroke volume and stronger vagal tone.",
          "links": [
            {
              "href": "wiki:Bradycardia"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/6373687/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "fick-principle",
      "term": "Fick principle",
      "clusters": [
        2,
        0
      ],
      "fact": "By the Fick principle, oxygen uptake equals cardiac output times the oxygen extracted from each liter of blood. Below maximum, rising oxygen demand drives cardiac output up in step with it; at maximum, the heart's output caps how much oxygen the body can take up.",
      "info": {
        "text": "The relation of oxygen uptake to blood flow and the arteriovenous oxygen difference; in a healthy person, maximal cardiac output is the main limit on VO₂ max.",
        "links": [
          {
            "href": "wiki:Fick principle"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "cardiac output",
        "VO₂ max"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    },
    {
      "id": "lactate-threshold",
      "term": "lactate threshold",
      "clusters": [
        0,
        1
      ],
      "fact": "Above the lactate threshold, glycolysis of muscle glycogen makes lactate faster than the body clears it, and blood lactate climbs; expressed as a percentage of VO₂ max, the threshold sets the fastest pace an endurance athlete can hold.",
      "info": {
        "text": "The exercise intensity at which blood lactate begins to rise steeply; also called the anaerobic threshold, and close to the ventilatory threshold.",
        "links": [
          {
            "href": "wiki:Lactate threshold"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/17901124/"
          }
        ]
      },
      "idealTerms": [
        "VO₂ max",
        "muscle glycogen"
      ]
    },
    {
      "id": "stroke-volume",
      "term": "stroke volume",
      "clusters": [
        3,
        2
      ],
      "fact": "Endurance training enlarges the left ventricle and expands plasma volume, raising stroke volume. Maximal heart rate does not rise with training, so the larger stroke volume is what raises maximal cardiac output, and at rest it lets the same output come from fewer beats.",
      "info": {
        "text": "The blood ejected by the left ventricle with each beat.",
        "links": [
          {
            "href": "wiki:Stroke volume"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "athlete's heart",
        "cardiac output"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "glycogen-sparing",
      "term": "glycogen sparing",
      "clusters": [
        3,
        1
      ],
      "fact": "Trained muscle, with more mitochondria and capillaries, burns more fat and less glycogen at the same pace, so its glycogen lasts longer and the wall comes later.",
      "info": {
        "text": "Slower use of muscle glycogen at a given workload, the main metabolic payoff of endurance training.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/6373687/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "mitochondrial biogenesis",
        "muscle glycogen"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "uptake-out-of-step",
      "prompt": "Which concepts describe oxygen uptake out of step with the work being done?",
      "explanation": "Oxygen uptake takes minutes to adjust. The deficit at the start is borrowed from phosphocreatine and anaerobic glycolysis, and part of the raised uptake afterward pays those stores back.",
      "targets": [
        "oxygen deficit",
        "excess post-exercise oxygen consumption"
      ],
      "reasons": {
        "excess post-exercise oxygen consumption": "After the work stops, uptake stays above what rest requires.",
        "oxygen deficit": "At the start, uptake lags behind the demand of the new workload."
      }
    },
    {
      "id": "fick-link",
      "prompt": "Which relationship ties the body's oxygen uptake to the heart's output?",
      "explanation": "The link runs both ways: below maximum, demand for oxygen pulls cardiac output up with it; at maximum, cardiac output caps VO₂ max.",
      "targets": [
        "Fick principle"
      ],
      "reasons": {
        "Fick principle": "Uptake equals cardiac output times the oxygen extracted from each liter of blood."
      }
    },
    {
      "id": "sustainable-pace",
      "prompt": "Which marker, expressed as a fraction of VO₂ max, sets the fastest pace an endurance athlete can hold?",
      "explanation": "Two athletes with the same VO₂ max can race at very different speeds; the one whose lactate threshold sits at a higher fraction of VO₂ max can hold the faster pace.",
      "targets": [
        "lactate threshold"
      ],
      "reasons": {
        "lactate threshold": "Above it, blood lactate climbs steadily and the pace cannot be held for long."
      }
    },
    {
      "id": "fat-to-carbohydrate",
      "prompt": "Which concepts express the shift from fat toward carbohydrate as exercise grows harder?",
      "explanation": "At low intensity fat supplies most of the energy. Harder work recruits more fast-twitch fibers and more glycolysis, and the fuel mix moves toward carbohydrate.",
      "targets": [
        "respiratory exchange ratio",
        "crossover point"
      ],
      "reasons": {
        "crossover point": "It marks the intensity where carbohydrate becomes the larger share.",
        "respiratory exchange ratio": "It climbs from near 0.7 toward 1.0 as carbohydrate takes over."
      }
    },
    {
      "id": "pre-race-diet",
      "prompt": "Which pre-race dietary strategy postpones glycogen depletion?",
      "explanation": "Guyton reports that endurance time on a high-carbohydrate diet is several times longer than on a high-fat diet, because the glycogen store sets how long hard work can last.",
      "targets": [
        "carbohydrate loading"
      ],
      "reasons": {
        "carbohydrate loading": "Days of high carbohydrate intake with tapered training raise muscle glycogen above its usual level."
      }
    },
    {
      "id": "training-delays-wall",
      "prompt": "Which consequence of endurance training postpones glycogen depletion at a given pace?",
      "explanation": "Carbohydrate loading enlarges the store before a race; training slows how fast the store is spent.",
      "targets": [
        "glycogen sparing"
      ],
      "reasons": {
        "glycogen sparing": "Trained muscle meets more of the same workload from fat, so its glycogen runs down more slowly."
      }
    },
    {
      "id": "sparing-adaptations",
      "prompt": "Which muscle adaptations let trained muscle burn more fat at the same pace?",
      "explanation": "With greater oxidative capacity and supply, trained muscle meets more of a given workload from fat, which is what spares its glycogen.",
      "targets": [
        "mitochondrial biogenesis",
        "capillary density"
      ],
      "reasons": {
        "capillary density": "More capillaries deliver more oxygen and fatty acids to each fiber.",
        "mitochondrial biogenesis": "More mitochondria raise the muscle's capacity to oxidize fatty acids."
      }
    },
    {
      "id": "resistance-adaptation",
      "prompt": "Which skeletal muscle adaptation comes mainly from resistance training?",
      "explanation": "Endurance training multiplies mitochondria and capillaries with little change in fiber size; resistance training adds contractile protein and enlarges the fibers.",
      "targets": [
        "muscle hypertrophy"
      ],
      "reasons": {
        "muscle hypertrophy": "Heavy loads drive the synthesis of contractile protein, enlarging each fiber."
      }
    },
    {
      "id": "slow-resting-pulse",
      "prompt": "Which concepts explain why an endurance athlete's heart can beat slowly at rest?",
      "explanation": "Resting cardiac output barely changes with training. A larger stroke volume delivers it with fewer beats, aided by stronger vagal tone.",
      "targets": [
        "stroke volume",
        "athlete's heart",
        "plasma volume expansion"
      ],
      "reasons": {
        "athlete's heart": "The enlarged left ventricle holds and ejects more blood per beat.",
        "plasma volume expansion": "A larger blood volume fills the heart more fully between beats.",
        "stroke volume": "Each beat ejects more blood, so fewer beats give the same resting output."
      }
    },
    {
      "id": "sympathetic-drive",
      "prompt": "Which signals raise sympathetic drive to the heart during exercise?",
      "explanation": "Central command acts in advance, as exercise begins; the exercise pressor reflex adjusts the response to what the muscles are actually doing.",
      "targets": [
        "central command",
        "exercise pressor reflex"
      ],
      "reasons": {
        "central command": "The brain's motor areas raise sympathetic drive as they command the muscles.",
        "exercise pressor reflex": "Receptors in working muscle report contraction and metabolites, raising drive further."
      }
    },
    {
      "id": "flow-to-muscle",
      "prompt": "Which response lets working muscle receive most of the cardiac output?",
      "explanation": "Sympathetic constriction elsewhere and local dilation in active muscle steer the raised output to where oxygen is being used.",
      "targets": [
        "redistribution of blood flow"
      ],
      "reasons": {
        "redistribution of blood flow": "Vessels in the gut, kidneys, and inactive muscle narrow while those in working muscle dilate."
      }
    },
    {
      "id": "refilling-the-heart",
      "prompt": "Which mechanism of running helps return blood to the heart?",
      "explanation": "Without the muscle pump, blood would pool in the legs of an upright runner, and the heart could not fill fast enough to sustain a high stroke volume.",
      "targets": [
        "skeletal muscle pump"
      ],
      "reasons": {
        "skeletal muscle pump": "Each contraction squeezes the leg veins, and their valves let blood move only toward the heart."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "muscular-system",
        "reason": "See the three ATP routes and the fiber types that the whole-body fuel mix depends on."
      },
      {
        "id": "setting-and-defending-core-temperature",
        "reason": "Follow the heat that hard exercise produces, and why skin blood flow then competes with working muscle."
      },
      {
        "id": "control-of-breathing",
        "reason": "See how breathing rises to match exercise, keeping blood gases nearly steady."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body meets the demands of exercise",
    "summary": "What limits oxygen uptake, which fuels working muscle burns, how circulation delivers them, and what training changes.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Hard exercise can raise the body's energy use twentyfold. No single organ can meet that demand. The lungs, heart, blood vessels, muscles, and fuel stores all change together, which is why exercise is a central topic of integrative physiology.\n\n## Oxygen uptake and its limits\n\nOxygen uptake rises with the intensity of exercise until it levels off at **VO₂ max**, the highest rate at which the body can take up and use oxygen. When exercise begins, uptake takes a few minutes to catch up with demand. This **oxygen deficit** is covered by stored phosphocreatine and by anaerobic glycolysis. After exercise ends, uptake stays raised for a while: **excess post-exercise oxygen consumption** (EPOC; Guyton calls it the oxygen debt) restores phosphocreatine and clears lactate.\n\nThe **Fick principle** ties oxygen uptake to circulation: uptake equals cardiac output multiplied by the oxygen extracted from each liter of blood. The relationship runs both ways. Below maximum, rising oxygen demand drives cardiac output up in step with it. At maximum, the heart's output becomes the main limit on VO₂ max.\n\n## Fuel selection\n\nWorking muscle burns **fatty acids** and carbohydrate, chiefly **muscle glycogen**, in a mix that changes with intensity. At easy paces fat supplies most of the energy. As work gets harder the mix shifts toward carbohydrate. Above the **crossover point**, carbohydrate supplies more than fat. The **respiratory exchange ratio**, carbon dioxide output divided by oxygen uptake, tracks the shift, rising from near 0.7 toward 1.0.\n\nAbove the **lactate threshold**, glycolysis makes lactate faster than the body clears it, and blood lactate climbs. The threshold, expressed as a percentage of VO₂ max, sets the fastest pace an endurance athlete can hold for long. Muscle glycogen is a limited store, and **glycogen depletion** late in a long race forces the pace down. Endurance athletes call it hitting the wall. **Carbohydrate loading** in the days before an event raises the store and postpones it.\n\n## The cardiovascular response\n\n**Cardiac output** rises several-fold, and **redistribution of blood flow** sends most of it to working muscle while vessels in the gut, kidneys, and inactive muscle narrow. Two signals raise sympathetic drive to the heart and vessels. **Central command** comes from the brain's motor areas as they order the muscles to contract. The **exercise pressor reflex** comes from receptors in the working muscle itself. Meanwhile the **skeletal muscle pump** squeezes the veins with every contraction, returning blood to the heart fast enough to keep it filled.\n\n## Training adaptations\n\nEndurance training produces **athlete's heart**, a healthy enlargement of the left ventricle, and **plasma volume expansion**. Both raise **stroke volume**, the blood ejected with each beat. Maximal heart rate does not rise with training, so the larger stroke volume is what raises maximal cardiac output and VO₂ max. At rest the same output needs fewer beats, producing **resting bradycardia**.\n\nInside trained muscle, **mitochondrial biogenesis** and a higher **capillary density** increase the capacity to burn fat. The result is **glycogen sparing**: at the same pace, trained muscle uses less glycogen, so the wall comes later. Resistance training works differently. It produces **muscle hypertrophy**, the growth of fibers through added contractile protein."
    }
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
      "puzzleId": "meeting-the-demands-of-exercise",
      "puzzleRevision": "fnv1a32:c68af2e3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:VO₂ max": {
          "x": 511.3,
          "y": 472.24
        },
        "term:excess post-exercise oxygen consumption": {
          "x": 600.62,
          "y": 632.95
        },
        "term:oxygen deficit": {
          "x": 360.91,
          "y": 631.95
        },
        "term:muscle glycogen": {
          "x": 379.71,
          "y": 399.28
        },
        "term:fatty acids": {
          "x": 143.04,
          "y": 456.32
        },
        "term:respiratory exchange ratio": {
          "x": 101.9,
          "y": 332.36
        },
        "term:crossover point": {
          "x": 76.27,
          "y": 217.79
        },
        "term:glycogen depletion": {
          "x": 116.37,
          "y": 117.18
        },
        "term:carbohydrate loading": {
          "x": 264.51,
          "y": 161.33
        },
        "term:cardiac output": {
          "x": 674.07,
          "y": 428.15
        },
        "term:redistribution of blood flow": {
          "x": 943.08,
          "y": 266.88
        },
        "term:central command": {
          "x": 992.75,
          "y": 365.85
        },
        "term:exercise pressor reflex": {
          "x": 962,
          "y": 487.52
        },
        "term:skeletal muscle pump": {
          "x": 880.71,
          "y": 582.86
        },
        "term:athlete's heart": {
          "x": 822.02,
          "y": 183
        },
        "term:muscle hypertrophy": {
          "x": 401.84,
          "y": 102.14
        },
        "term:mitochondrial biogenesis": {
          "x": 425.27,
          "y": 215.05
        },
        "term:capillary density": {
          "x": 511.99,
          "y": 34.28
        },
        "term:plasma volume expansion": {
          "x": 693.1,
          "y": 27.01
        },
        "term:resting bradycardia": {
          "x": 815.74,
          "y": 89.13
        },
        "term:Fick principle": {
          "x": 712.43,
          "y": 512.09
        },
        "term:lactate threshold": {
          "x": 319.17,
          "y": 508.4
        },
        "term:stroke volume": {
          "x": 643.69,
          "y": 314.4
        },
        "term:glycogen sparing": {
          "x": 468.65,
          "y": 313.3
        },
        "cluster:0": {
          "x": 509.77,
          "y": 556.14
        },
        "cluster:1": {
          "x": 275.29,
          "y": 324.15
        },
        "cluster:2": {
          "x": 832.26,
          "y": 367.38
        },
        "cluster:3": {
          "x": 634.08,
          "y": 192.56
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T03:43:54.006Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "meeting-the-demands-of-exercise",
      "puzzleRevision": "fnv1a32:c68af2e3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:VO₂ max": {
          "x": 750.82,
          "y": 318.45,
          "pinned": false
        },
        "term:excess post-exercise oxygen consumption": {
          "x": 579.06,
          "y": 402.59,
          "pinned": true
        },
        "term:oxygen deficit": {
          "x": 576.68,
          "y": 315.39,
          "pinned": true
        },
        "term:muscle glycogen": {
          "x": 849.28,
          "y": 579.29,
          "pinned": false
        },
        "term:fatty acids": {
          "x": 727.73,
          "y": 511.98,
          "pinned": true
        },
        "term:respiratory exchange ratio": {
          "x": 690.56,
          "y": 657,
          "pinned": true
        },
        "term:crossover point": {
          "x": 960.29,
          "y": 370.02,
          "pinned": true
        },
        "term:glycogen depletion": {
          "x": 979.82,
          "y": 657,
          "pinned": false
        },
        "term:carbohydrate loading": {
          "x": 977,
          "y": 524.49,
          "pinned": true
        },
        "term:cardiac output": {
          "x": 618.93,
          "y": 150.25,
          "pinned": false
        },
        "term:redistribution of blood flow": {
          "x": 759.51,
          "y": 43.04,
          "pinned": true
        },
        "term:central command": {
          "x": 557.06,
          "y": 38.03,
          "pinned": true
        },
        "term:exercise pressor reflex": {
          "x": 446.7,
          "y": 143.29,
          "pinned": false
        },
        "term:skeletal muscle pump": {
          "x": 659.63,
          "y": 231.83,
          "pinned": true
        },
        "term:athlete's heart": {
          "x": 223.35,
          "y": 433.51,
          "pinned": false
        },
        "term:muscle hypertrophy": {
          "x": 218.59,
          "y": 281.62,
          "pinned": false
        },
        "term:mitochondrial biogenesis": {
          "x": 349.77,
          "y": 506.72,
          "pinned": true
        },
        "term:capillary density": {
          "x": 231.79,
          "y": 612.92,
          "pinned": true
        },
        "term:plasma volume expansion": {
          "x": 94.45,
          "y": 551.72,
          "pinned": false
        },
        "term:resting bradycardia": {
          "x": 81.85,
          "y": 371.9,
          "pinned": false
        },
        "term:Fick principle": {
          "x": 840.51,
          "y": 147.56,
          "pinned": true
        },
        "term:lactate threshold": {
          "x": 825.95,
          "y": 416.5,
          "pinned": false
        },
        "term:stroke volume": {
          "x": 401.3,
          "y": 294.02,
          "pinned": true
        },
        "term:glycogen sparing": {
          "x": 529.75,
          "y": 576.35,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4945.24,
        "score": 4945.235322836177
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T03:45:07.797Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "meeting-the-demands-of-exercise",
      "puzzleRevision": "fnv1a32:c68af2e3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 887.14,
          "y": 366.03,
          "pinned": true
        },
        "cluster:1": {
          "x": 530,
          "y": 510.42,
          "pinned": false
        },
        "cluster:2": {
          "x": 546.03,
          "y": 187.58,
          "pinned": true
        },
        "cluster:3": {
          "x": 171.85,
          "y": 363.03,
          "pinned": true
        }
      },
      "bridges": {
        "term:Fick principle": {
          "x": 807.48,
          "y": 107.58,
          "pinned": true
        },
        "term:lactate threshold": {
          "x": 800.69,
          "y": 591.93,
          "pinned": true
        },
        "term:stroke volume": {
          "x": 272.55,
          "y": 112.59,
          "pinned": true
        },
        "term:glycogen sparing": {
          "x": 253.07,
          "y": 592.44,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "VO₂ max",
          "excess post-exercise oxygen consumption",
          "oxygen deficit"
        ],
        "cluster:1": [
          "muscle glycogen",
          "fatty acids",
          "respiratory exchange ratio",
          "crossover point",
          "glycogen depletion",
          "carbohydrate loading"
        ],
        "cluster:2": [
          "cardiac output",
          "redistribution of blood flow",
          "central command",
          "exercise pressor reflex",
          "skeletal muscle pump"
        ],
        "cluster:3": [
          "athlete's heart",
          "muscle hypertrophy",
          "mitochondrial biogenesis",
          "capillary density",
          "plasma volume expansion",
          "resting bradycardia"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "VO₂ max",
          "excess post-exercise oxygen consumption",
          "oxygen deficit"
        ],
        "cluster:1": [
          "crossover point",
          "glycogen depletion",
          "respiratory exchange ratio",
          "carbohydrate loading",
          "muscle glycogen",
          "fatty acids"
        ],
        "cluster:2": [
          "cardiac output",
          "skeletal muscle pump",
          "redistribution of blood flow",
          "exercise pressor reflex",
          "central command"
        ],
        "cluster:3": [
          "athlete's heart",
          "mitochondrial biogenesis",
          "plasma volume expansion",
          "resting bradycardia",
          "muscle hypertrophy",
          "capillary density"
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
        "totalLength": 1787.9254318529277
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T03:46:39.952Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-15T03:46:45.779Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
