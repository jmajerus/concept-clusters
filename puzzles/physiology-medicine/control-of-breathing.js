// Generated from content/puzzles/control-of-breathing.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "control-of-breathing",
  "title": "Control of breathing",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "respiratory"
  },
  "info": {
    "text": "Breathing runs as a feedback loop: brainstem neurons generate the rhythm, sensors in the blood, brain, and lungs report on its results, and the respiratory muscles carry out the command. The loop keeps arterial carbon dioxide, oxygen, and pH within narrow limits at rest, in exercise, and at altitude.",
    "links": [
      {
        "href": "wiki:Control of ventilation"
      }
    ],
    "citations": [
      {
        "title": "West's Respiratory Physiology: The Essentials, 11th ed., ch. 8, \"Control of Ventilation\"",
        "author": "John B. West and Andrew M. Luks",
        "publisher": "Wolters Kluwer",
        "year": "2020",
        "url": "https://shop.lww.com/West-s-Respiratory-Physiology/p/9781975139186"
      },
      {
        "title": "Respiratory center",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Respiratory_center"
      },
      {
        "title": "Peripheral chemoreceptor",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Peripheral_chemoreceptor"
      },
      {
        "title": "Muscles of respiration",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Muscles_of_respiration"
      }
    ]
  },
  "clusters": [
    {
      "id": "central-controller",
      "name": "Central controller",
      "color": "teal",
      "fact": "Groups of neurons in the medulla generate the automatic rhythm of breathing, a pontine center shapes it, and the cerebral cortex can override it within limits.",
      "terms": [
        "dorsal respiratory group",
        "ventral respiratory group",
        "pre-Bötzinger complex",
        "pneumotaxic center",
        "cerebral cortex"
      ],
      "seeds": [
        "dorsal respiratory group",
        "ventral respiratory group"
      ],
      "termInfo": {
        "cerebral cortex": {
          "text": "The source of voluntary breathing control — speech, singing, breath-holding, deliberate deep breaths — which can temporarily override the brainstem.",
          "links": [
            {
              "href": "wiki:Cerebral cortex"
            }
          ]
        },
        "dorsal respiratory group": "Mainly inspiratory neurons in the dorsal medulla, near the nucleus tractus solitarius, where sensory fibers from the lungs and carotid bodies arrive.",
        "pneumotaxic center": "Neurons in the upper pons (now often called the pontine respiratory group) that switch off inspiration, adjusting breath volume and rate.",
        "pre-Bötzinger complex": {
          "text": "A small cluster of neurons within the ventral respiratory group, identified in 1991 as the generator of the inspiratory rhythm.",
          "links": [
            {
              "href": "wiki:Pre-Bötzinger complex"
            }
          ]
        },
        "ventral respiratory group": "A column of medullary neurons with both inspiratory and expiratory cells; its expiratory neurons stay quiet in quiet breathing and fire when breathing is forced."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Respiratory center"
          }
        ]
      }
    },
    {
      "id": "chemoreceptors",
      "name": "Chemoreceptors",
      "color": "blue",
      "fact": "Central chemoreceptors in the medulla track carbon dioxide through the acidity of brain fluid, while peripheral chemoreceptors in the carotid and aortic bodies sample arterial blood and are the only sensors that detect low oxygen.",
      "terms": [
        "central chemoreceptors",
        "carotid bodies",
        "aortic bodies",
        "glomus cells"
      ],
      "seeds": [
        "central chemoreceptors",
        "carotid bodies"
      ],
      "termInfo": {
        "aortic bodies": {
          "text": "Peripheral chemoreceptors on the arch of the aorta; in humans they contribute far less to breathing than the carotid bodies.",
          "links": [
            {
              "href": "wiki:Aortic body"
            }
          ]
        },
        "carotid bodies": {
          "text": "Tiny sensory organs at the fork of each common carotid artery that respond quickly to low arterial oxygen, high carbon dioxide, and low pH.",
          "links": [
            {
              "href": "wiki:Carotid body"
            }
          ]
        },
        "central chemoreceptors": {
          "text": "Cells near the ventral surface of the medulla that respond to hydrogen ions in the surrounding fluid; they account for most of the breathing response to a rise in carbon dioxide.",
          "links": [
            {
              "href": "wiki:Central chemoreceptor"
            }
          ]
        },
        "glomus cells": {
          "text": "The oxygen-sensing (type I) cells inside the carotid body; low oxygen makes them release neurotransmitters onto sensory nerve endings.",
          "links": [
            {
              "href": "wiki:Glomus cell"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Peripheral chemoreceptor"
          }
        ]
      }
    },
    {
      "id": "lung-receptors",
      "name": "Lung and airway receptors",
      "color": "amber",
      "fact": "Sensors in the airways and lung walls report stretch, irritation, and congestion, triggering reflexes that adjust breathing and protect the airways.",
      "terms": [
        "pulmonary stretch receptors",
        "irritant receptors",
        "J receptors",
        "Hering–Breuer reflex"
      ],
      "seeds": [
        "pulmonary stretch receptors",
        "irritant receptors"
      ],
      "termInfo": {
        "Hering–Breuer reflex": {
          "text": "The inflation reflex carried by stretch receptors: a large lung inflation cuts inspiration short. In adults it acts mainly at large breath volumes; it is stronger in newborns.",
          "links": [
            {
              "href": "wiki:Hering–Breuer reflex"
            }
          ]
        },
        "J receptors": "Juxtacapillary receptors in the alveolar walls beside the capillaries; fluid and congestion in the lung stimulate them, producing rapid, shallow breathing.",
        "irritant receptors": {
          "text": "Rapidly adapting sensors between airway lining cells, stimulated by smoke, dust, noxious gases, and cold air; they trigger coughing and airway narrowing.",
          "links": [
            {
              "href": "wiki:Cough reflex"
            }
          ]
        },
        "pulmonary stretch receptors": {
          "text": "Slowly adapting sensors in airway smooth muscle that fire as the lungs inflate.",
          "links": [
            {
              "href": "wiki:Pulmonary stretch receptor"
            }
          ]
        }
      }
    },
    {
      "id": "respiratory-muscles",
      "name": "Respiratory muscles",
      "color": "magenta",
      "fact": "The diaphragm and external intercostals drive quiet inspiration; exhalation is passive at rest, and the accessory, abdominal, and internal intercostal muscles join only when breathing must be harder or faster.",
      "terms": [
        "diaphragm",
        "external intercostals",
        "accessory muscles",
        "abdominal muscles",
        "internal intercostals"
      ],
      "seeds": [
        "diaphragm",
        "external intercostals"
      ],
      "termInfo": {
        "abdominal muscles": {
          "text": "The muscles of the abdominal wall, which push the diaphragm upward to force air out in exercise, coughing, and straining.",
          "links": [
            {
              "href": "wiki:Abdominal wall"
            }
          ]
        },
        "accessory muscles": "Neck muscles such as the scalenes and sternocleidomastoids, which lift the upper ribs and breastbone during heavy breathing.",
        "diaphragm": {
          "text": "The main muscle of inspiration; contracting, it flattens downward and enlarges the chest cavity.",
          "links": [
            {
              "href": "wiki:Thoracic diaphragm"
            }
          ]
        },
        "external intercostals": {
          "text": "Muscles between the ribs that pull the ribs upward and outward during inspiration.",
          "links": [
            {
              "href": "wiki:External intercostal muscles"
            }
          ]
        },
        "internal intercostals": {
          "text": "Muscles between the ribs that pull the ribs downward and inward during active, forced expiration.",
          "links": [
            {
              "href": "wiki:Internal intercostal muscles"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Muscles of respiration"
          }
        ]
      }
    },
    {
      "id": "integrated-responses",
      "name": "Integrated responses",
      "color": "olive",
      "fact": "Exercise, altitude, and acid–base disturbances each reset breathing through the same loop; when feedback is delayed, the loop itself can oscillate.",
      "terms": [
        "exercise hyperpnea",
        "altitude acclimatization",
        "Kussmaul breathing",
        "Cheyne–Stokes breathing"
      ],
      "seeds": [
        "exercise hyperpnea",
        "altitude acclimatization"
      ],
      "termInfo": {
        "Cheyne–Stokes breathing": {
          "text": "Breathing that waxes and wanes in cycles separated by pauses, seen in heart failure, in sleep at high altitude, and after some brain injuries.",
          "links": [
            {
              "href": "wiki:Cheyne–Stokes respiration"
            }
          ]
        },
        "Kussmaul breathing": {
          "text": "Deep, labored breathing in severe metabolic acidosis, such as diabetic ketoacidosis, which lowers carbon dioxide to offset the acid.",
          "links": [
            {
              "href": "wiki:Kussmaul breathing"
            }
          ]
        },
        "altitude acclimatization": {
          "text": "The days-long adjustment to thin air: breathing keeps rising as brain-fluid bicarbonate falls and the carotid bodies grow more sensitive.",
          "links": [
            {
              "href": "wiki:Effects of high altitude on humans"
            }
          ]
        },
        "exercise hyperpnea": {
          "text": "The rise in breathing during exercise, which tracks carbon dioxide production so closely that arterial gases barely change in moderate work; its full mechanism is still unsettled.",
          "links": [
            {
              "href": "wiki:Hyperpnea"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "phrenic-nerve",
      "term": "phrenic nerve",
      "clusters": [
        0,
        3
      ],
      "fact": "The brainstem rhythm descends to motor neurons in the cervical spinal cord (C3–C5), whose phrenic nerves carry each breath's command to the diaphragm.",
      "info": {
        "text": "The motor nerve of the diaphragm, arising from cervical spinal segments C3–C5.",
        "links": [
          {
            "href": "wiki:Phrenic nerve"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "diaphragm"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "vagus-nerve",
      "term": "vagus nerve",
      "clusters": [
        2,
        0
      ],
      "fact": "Stretch, irritant, and J receptor signals all travel up the vagus nerve to the dorsal respiratory group, so cutting the vagi removes the lungs' reflex input to breathing.",
      "info": {
        "text": "The tenth cranial nerve, which carries sensory fibers from the lungs and airways (and the aortic bodies) to the medulla.",
        "links": [
          {
            "href": "wiki:Vagus nerve"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "dorsal respiratory group"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "glossopharyngeal-nerve",
      "term": "glossopharyngeal nerve",
      "clusters": [
        1,
        0
      ],
      "fact": "Carotid body signals travel through the carotid sinus nerve into the glossopharyngeal nerve and on to the dorsal respiratory group.",
      "info": {
        "text": "The ninth cranial nerve, which carries carotid body and carotid sinus signals to the medulla.",
        "links": [
          {
            "href": "wiki:Glossopharyngeal nerve"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "carotid bodies",
        "dorsal respiratory group"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "breath-hold-breaking-point",
      "term": "breath-hold breaking point",
      "clusters": [
        0,
        1
      ],
      "fact": "A voluntary breath-hold ends when rising carbon dioxide and falling oxygen drive the chemoreceptors past the cortex's override; hyperventilating first lowers carbon dioxide and delays the break, at the risk of fainting underwater.",
      "info": {
        "text": "The moment a held breath can no longer be sustained, set mainly by arterial carbon dioxide and oxygen.",
        "links": [
          {
            "href": "wiki:Apnea"
          }
        ]
      },
      "idealTerms": [
        "cerebral cortex",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "hypoxic-ventilatory-response",
      "term": "hypoxic ventilatory response",
      "clusters": [
        1,
        4
      ],
      "fact": "Breathing rises only modestly until arterial oxygen falls to about 50–60 mmHg; in humans this response depends on the peripheral chemoreceptors, chiefly the carotid bodies, and it starts the hyperventilation of high altitude.",
      "info": {
        "text": "The increase in breathing caused by low arterial oxygen.",
        "links": [
          {
            "href": "wiki:Hypoxic ventilatory response"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "carotid bodies",
        "altitude acclimatization"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 4
      }
    }
  ],
  "lenses": [
    {
      "id": "low-oxygen-sensors",
      "prompt": "Which sensors detect a fall in arterial oxygen?",
      "explanation": "Only the peripheral chemoreceptors sense oxygen. The central chemoreceptors respond to hydrogen ions in the brain's fluid, so they track carbon dioxide and are blind to hypoxia.",
      "targets": [
        "carotid bodies",
        "aortic bodies",
        "glomus cells"
      ],
      "reasons": {
        "aortic bodies": "Peripheral chemoreceptors that also respond to low oxygen, though they matter less for breathing in humans.",
        "carotid bodies": "The dominant oxygen sensors in humans, sampling arterial blood at the carotid fork.",
        "glomus cells": "The oxygen-sensing cells inside the carotid body; they release transmitter onto nerve endings when oxygen falls."
      }
    },
    {
      "id": "idle-at-rest",
      "prompt": "Which muscles stay inactive during quiet breathing at rest?",
      "explanation": "Quiet inspiration needs only the diaphragm and external intercostals, and quiet exhalation is the passive recoil of lungs and chest wall. The remaining muscles are held in reserve for exercise, coughing, and labored breathing.",
      "targets": [
        "accessory muscles",
        "abdominal muscles",
        "internal intercostals"
      ],
      "reasons": {
        "abdominal muscles": "They force air out by pushing the diaphragm upward, which quiet exhalation does not need.",
        "accessory muscles": "The scalenes and sternocleidomastoids lift the upper ribs only when breathing must be heavy.",
        "internal intercostals": "They pull the ribs down and in during forced expiration only."
      }
    },
    {
      "id": "sensory-nerves",
      "prompt": "Which nerves carry sensory signals into the brainstem?",
      "explanation": "Both cranial nerves bring reports to the dorsal respiratory group. The phrenic nerve runs the other way, carrying the motor command from the spinal cord to the diaphragm.",
      "targets": [
        "vagus nerve",
        "glossopharyngeal nerve"
      ],
      "reasons": {
        "glossopharyngeal nerve": "It carries carotid body signals, by way of the carotid sinus nerve.",
        "vagus nerve": "It carries signals from the stretch, irritant, and J receptors, along with the aortic bodies."
      }
    },
    {
      "id": "vagal-disconnection",
      "prompt": "Which sensors lose their link to the brainstem when both vagus nerves are cut?",
      "explanation": "Cutting the vagi silences every lung and airway sensor plus the aortic bodies. The carotid bodies and their glomus cells keep reporting through the glossopharyngeal nerve, and the central chemoreceptors sit inside the brainstem itself, so the chemical control of breathing survives.",
      "targets": [
        "pulmonary stretch receptors",
        "irritant receptors",
        "J receptors",
        "aortic bodies"
      ],
      "reasons": {
        "J receptors": "Their signals from the alveolar walls travel in the vagus.",
        "aortic bodies": "Their chemoreceptor signals travel in the vagus, unlike those of the carotid bodies.",
        "irritant receptors": "Their airway signals travel in the vagus.",
        "pulmonary stretch receptors": "Their inflation signals travel in the vagus, so cutting it abolishes the Hering–Breuer reflex."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How breathing is controlled",
    "summary": "How the brainstem sets each breath, which sensors adjust it, and how the system responds to exercise, altitude, and acid in the blood.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Breathing is one of the few vital functions that runs automatically yet can be taken over at will. Every breath is set by a control system with three parts: a central controller in the brain that generates the rhythm, sensors that report how well breathing is doing its job, and muscles that move air. Nerves carry signals among them, and the arrangement works as a negative feedback loop: when arterial carbon dioxide rises, or oxygen or pH falls, breathing increases until those values move back toward normal.\r\n\r\nThe aim of this lesson is to let you trace a change in the blood from the sensor that detects it, along the nerve that reports it, to the controller that responds and the muscles that carry the response out.\r\n\r\n## The central controller\r\n\r\nThe automatic rhythm comes from the brainstem. In the medulla, the **dorsal respiratory group** contains mainly inspiratory neurons and receives incoming sensory fibers. The **ventral respiratory group** is a column of neurons with both inspiratory and expiratory cells; its expiratory neurons stay quiet in ordinary breathing and fire when breathing must be forced. Within it lies the **pre-Bötzinger complex**, a small group of neurons identified in 1991 as the generator of the inspiratory rhythm. Higher in the brainstem, the **pneumotaxic center** in the upper pons switches off inspiration, adjusting the size and rate of breaths.\r\n\r\nAbove the brainstem, the **cerebral cortex** provides voluntary control, used in speaking, singing, and holding the breath. That override has limits. During a breath-hold, carbon dioxide accumulates and oxygen falls until the chemical drive overwhelms the will; the moment the hold can no longer be sustained is the **breath-hold breaking point**. Hyperventilating beforehand lowers carbon dioxide and postpones that moment, which is why it is dangerous before swimming underwater: oxygen can fall low enough to cause unconsciousness before the urge to breathe returns.\r\n\r\n## Chemical sensors\r\n\r\nChemoreceptors measure the chemistry of body fluids. **Central chemoreceptors** lie near the ventral surface of the medulla and respond to hydrogen ions in the surrounding fluid. Carbon dioxide crosses the blood–brain barrier readily, while hydrogen and bicarbonate ions cross it slowly, so a rise in arterial carbon dioxide acidifies the brain's fluid and stimulates these receptors. Under ordinary conditions they account for most of the minute-to-minute control of breathing.\r\n\r\nPeripheral chemoreceptors sample arterial blood directly. The **carotid bodies**, at the fork of each common carotid artery, respond quickly to low oxygen, high carbon dioxide, and low pH. Their oxygen-sensing elements are the **glomus cells**, which release neurotransmitters onto sensory nerve endings when oxygen falls. The **aortic bodies** on the arch of the aorta play a smaller part in humans. The peripheral chemoreceptors are the only sensors that respond to low oxygen, and their signals reach the brainstem by two routes: carotid body signals pass through the carotid sinus nerve into the **glossopharyngeal nerve**, and aortic body signals travel in the **vagus nerve**.\r\n\r\nThe increase in breathing caused by low oxygen, the **hypoxic ventilatory response**, stays modest until arterial oxygen falls to about 50–60 mmHg. At sea level, then, carbon dioxide sets the pace of breathing; oxygen takes over as a driver in thin air and in disease.\r\n\r\n## Sensors in the lungs\r\n\r\nThe lungs report on their own state. **Pulmonary stretch receptors** in airway smooth muscle fire as the lungs inflate, and they mediate the **Hering–Breuer reflex**, in which a large inflation cuts inspiration short. In adults the reflex acts mainly at large breath volumes; it is stronger in newborns. **Irritant receptors** lie between the cells lining the airways and respond to smoke, dust, noxious gases, and cold air, triggering coughing and narrowing of the airways. **J receptors** (juxtacapillary receptors) sit in the alveolar walls beside the capillaries; congestion and fluid in the lung stimulate them, producing rapid, shallow breathing. All three report through the vagus nerve.\r\n\r\n## The respiratory muscles\r\n\r\nThe controller's command descends to motor neurons in the cervical spinal cord, segments C3 to C5, whose fibers form the **phrenic nerve** to the **diaphragm**, the main muscle of inspiration. The **external intercostals** between the ribs help lift and widen the rib cage. In quiet breathing, exhalation takes no muscular effort: the lungs and chest wall simply recoil. When breathing must be harder or faster, more muscles are recruited. The **accessory muscles** of the neck, such as the scalenes and sternocleidomastoids, lift the upper ribs; the **abdominal muscles** push the diaphragm upward to force air out; and the **internal intercostals** pull the ribs down and in.\r\n\r\n## The loop under challenge\r\n\r\nSeveral situations show the system working as a whole. In **exercise hyperpnea**, breathing rises so closely in step with carbon dioxide production that arterial gases barely change during moderate exercise; exactly how the controller achieves this match is still unsettled. On arrival at high altitude, low oxygen triggers the hypoxic ventilatory response through the carotid bodies. Over the following days, **altitude acclimatization** raises breathing further as bicarbonate falls in the brain's fluid and the carotid bodies grow more sensitive. In metabolic acidosis, such as diabetic ketoacidosis, the peripheral chemoreceptors drive deep, labored **Kussmaul breathing**, which lowers carbon dioxide to offset the excess acid.\r\n\r\nFeedback loops can also become unstable. In **Cheyne–Stokes breathing**, breathing waxes and wanes in cycles separated by pauses. It appears in heart failure, where slow circulation delays the signal between the lungs and the sensors; during sleep at high altitude; and after some brain injuries.\r\n\r\n## Further reading\r\n\r\nThe standard concise account is chapter 8, \"Control of Ventilation,\" in John B. West and Andrew M. Luks, *West's Respiratory Physiology: The Essentials*."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      },
      {
        "name": "Claude Code"
      }
    ]
  },
  "board": {
    "lensFlowTrace": true,
    "sizeFactor": 1.2
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "control-of-breathing",
      "puzzleRevision": "fnv1a32:76e65bdf",
      "board": {
        "width": 1160,
        "height": 760
      },
      "nodes": {
        "term:dorsal respiratory group": {
          "x": 578.16,
          "y": 253.73,
          "pinned": false
        },
        "term:ventral respiratory group": {
          "x": 574.94,
          "y": 51.43,
          "pinned": false
        },
        "term:pre-Bötzinger complex": {
          "x": 393.07,
          "y": 115.67,
          "pinned": false
        },
        "term:pneumotaxic center": {
          "x": 400.87,
          "y": 286.33,
          "pinned": false
        },
        "term:cerebral cortex": {
          "x": 637.85,
          "y": 413.78,
          "pinned": false
        },
        "term:central chemoreceptors": {
          "x": 497.27,
          "y": 738,
          "pinned": false
        },
        "term:carotid bodies": {
          "x": 438.28,
          "y": 601.76,
          "pinned": false
        },
        "term:aortic bodies": {
          "x": 662.16,
          "y": 738,
          "pinned": false
        },
        "term:glomus cells": {
          "x": 351.66,
          "y": 698.55,
          "pinned": false
        },
        "term:pulmonary stretch receptors": {
          "x": 811.53,
          "y": 462.3,
          "pinned": false
        },
        "term:irritant receptors": {
          "x": 975.27,
          "y": 558.19,
          "pinned": false
        },
        "term:J receptors": {
          "x": 852.89,
          "y": 624.82,
          "pinned": false
        },
        "term:Hering–Breuer reflex": {
          "x": 994.39,
          "y": 391.59,
          "pinned": false
        },
        "term:diaphragm": {
          "x": 856.37,
          "y": 128.24,
          "pinned": false
        },
        "term:external intercostals": {
          "x": 997.5,
          "y": 148.03,
          "pinned": false
        },
        "term:accessory muscles": {
          "x": 905.34,
          "y": 22,
          "pinned": false
        },
        "term:abdominal muscles": {
          "x": 755.19,
          "y": 46.79,
          "pinned": false
        },
        "term:internal intercostals": {
          "x": 865.14,
          "y": 270.45,
          "pinned": false
        },
        "term:exercise hyperpnea": {
          "x": 76.7,
          "y": 267.77,
          "pinned": false
        },
        "term:altitude acclimatization": {
          "x": 224.66,
          "y": 324.52,
          "pinned": false
        },
        "term:Kussmaul breathing": {
          "x": 167.57,
          "y": 153.51,
          "pinned": false
        },
        "term:Cheyne–Stokes breathing": {
          "x": 92.45,
          "y": 444.22,
          "pinned": false
        },
        "term:phrenic nerve": {
          "x": 728.46,
          "y": 186.76,
          "pinned": false
        },
        "term:vagus nerve": {
          "x": 723.55,
          "y": 316.2,
          "pinned": false
        },
        "term:glossopharyngeal nerve": {
          "x": 475.97,
          "y": 443.28,
          "pinned": false
        },
        "term:breath-hold breaking point": {
          "x": 611.8,
          "y": 588.99,
          "pinned": false
        },
        "term:hypoxic ventilatory response": {
          "x": 272.52,
          "y": 530.84,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5426.43,
        "score": 5426.432874858594
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:35:04.210Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "control-of-breathing",
      "puzzleRevision": "fnv1a32:76e65bdf",
      "board": {
        "width": 1160,
        "height": 760
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 471.82,
          "y": 591.19,
          "pinned": true
        },
        "cluster:1": {
          "x": 904.83,
          "y": 546.11,
          "pinned": false
        },
        "cluster:2": {
          "x": 151.67,
          "y": 351.25,
          "pinned": true
        },
        "cluster:3": {
          "x": 450.96,
          "y": 153.03,
          "pinned": true
        },
        "cluster:4": {
          "x": 817.43,
          "y": 178.25,
          "pinned": true
        }
      },
      "bridges": {
        "term:phrenic nerve": {
          "x": 455.93,
          "y": 388,
          "pinned": false
        },
        "term:vagus nerve": {
          "x": 269.17,
          "y": 535.82,
          "pinned": false
        },
        "term:glossopharyngeal nerve": {
          "x": 688.38,
          "y": 428.68,
          "pinned": true
        },
        "term:breath-hold breaking point": {
          "x": 771.75,
          "y": 725.53,
          "pinned": true
        },
        "term:hypoxic ventilatory response": {
          "x": 967.45,
          "y": 367.93,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "dorsal respiratory group",
          "ventral respiratory group",
          "pre-Bötzinger complex",
          "pneumotaxic center",
          "cerebral cortex"
        ],
        "cluster:1": [
          "central chemoreceptors",
          "carotid bodies",
          "aortic bodies",
          "glomus cells"
        ],
        "cluster:2": [
          "pulmonary stretch receptors",
          "irritant receptors",
          "J receptors",
          "Hering–Breuer reflex"
        ],
        "cluster:3": [
          "diaphragm",
          "external intercostals",
          "accessory muscles",
          "abdominal muscles",
          "internal intercostals"
        ],
        "cluster:4": [
          "exercise hyperpnea",
          "altitude acclimatization",
          "Kussmaul breathing",
          "Cheyne–Stokes breathing"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "pneumotaxic center",
          "ventral respiratory group",
          "dorsal respiratory group",
          "pre-Bötzinger complex",
          "cerebral cortex"
        ],
        "cluster:1": [
          "aortic bodies",
          "carotid bodies",
          "central chemoreceptors",
          "glomus cells"
        ],
        "cluster:2": [
          "irritant receptors",
          "pulmonary stretch receptors",
          "Hering–Breuer reflex",
          "J receptors"
        ],
        "cluster:3": [
          "abdominal muscles",
          "internal intercostals",
          "external intercostals",
          "accessory muscles",
          "diaphragm"
        ],
        "cluster:4": [
          "Kussmaul breathing",
          "Cheyne–Stokes breathing",
          "altitude acclimatization",
          "exercise hyperpnea"
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
        "totalLength": 1487.8680642353124
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:34:55.466Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "control-of-breathing",
      "puzzleRevision": "fnv1a32:76e65bdf",
      "board": {
        "width": 1160,
        "height": 760
      },
      "nodes": {
        "term:dorsal respiratory group": {
          "x": 726.48,
          "y": 308.8
        },
        "term:ventral respiratory group": {
          "x": 996.26,
          "y": 78.09
        },
        "term:pre-Bötzinger complex": {
          "x": 1073.85,
          "y": 257.86
        },
        "term:pneumotaxic center": {
          "x": 1083.3,
          "y": 432.39
        },
        "term:cerebral cortex": {
          "x": 878.61,
          "y": 394.02
        },
        "term:central chemoreceptors": {
          "x": 1012.75,
          "y": 738
        },
        "term:carotid bodies": {
          "x": 605.06,
          "y": 425.66
        },
        "term:aortic bodies": {
          "x": 850.96,
          "y": 738
        },
        "term:glomus cells": {
          "x": 649.88,
          "y": 738
        },
        "term:pulmonary stretch receptors": {
          "x": 205.47,
          "y": 392.99
        },
        "term:irritant receptors": {
          "x": 76.7,
          "y": 287.94
        },
        "term:J receptors": {
          "x": 161.74,
          "y": 206.2
        },
        "term:Hering–Breuer reflex": {
          "x": 147.88,
          "y": 88.79
        },
        "term:diaphragm": {
          "x": 662.24,
          "y": 166.63
        },
        "term:external intercostals": {
          "x": 323.9,
          "y": 46.62
        },
        "term:accessory muscles": {
          "x": 489.89,
          "y": 22
        },
        "term:abdominal muscles": {
          "x": 646.29,
          "y": 33.6
        },
        "term:internal intercostals": {
          "x": 815.85,
          "y": 22
        },
        "term:exercise hyperpnea": {
          "x": 441.05,
          "y": 738
        },
        "term:altitude acclimatization": {
          "x": 433.09,
          "y": 429.78
        },
        "term:Kussmaul breathing": {
          "x": 276.05,
          "y": 738
        },
        "term:Cheyne–Stokes breathing": {
          "x": 168.57,
          "y": 609.84
        },
        "term:phrenic nerve": {
          "x": 836.64,
          "y": 159.29
        },
        "term:vagus nerve": {
          "x": 526.11,
          "y": 325
        },
        "term:glossopharyngeal nerve": {
          "x": 762.32,
          "y": 499.94
        },
        "term:breath-hold breaking point": {
          "x": 944.89,
          "y": 562.14
        },
        "term:hypoxic ventilatory response": {
          "x": 553.21,
          "y": 570.05
        },
        "cluster:0": {
          "x": 902.7,
          "y": 240.44
        },
        "cluster:1": {
          "x": 745.17,
          "y": 668.27
        },
        "cluster:2": {
          "x": 348.54,
          "y": 241.76
        },
        "cluster:3": {
          "x": 522.66,
          "y": 164.24
        },
        "cluster:4": {
          "x": 359.62,
          "y": 605.46
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-11T17:34:41.114Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-11T17:32:31.443Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
