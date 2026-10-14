// Generated from content/puzzles/membranes-set-cell-conditions.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "membranes-set-cell-conditions",
  "title": "How membranes set the cell's conditions",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cellular-membrane"
  },
  "info": {
    "text": "One ATP-driven pump builds the cell's sodium and potassium gradients, and most of cellular physiology spends them: to move solutes, to hold cell volume against osmosis, and to set the resting voltage that nerve and muscle later exploit.",
    "links": [
      {
        "href": "wiki:Membrane transport"
      }
    ],
    "citations": [
      {
        "title": "Anatomy and Physiology 2e, §3.1 The Cell Membrane",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/3-1-the-cell-membrane"
      },
      {
        "title": "Anatomy and Physiology 2e, §12.4 The Action Potential",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential"
      }
    ]
  },
  "clusters": [
    {
      "id": "solute-diffusion",
      "name": "Solute diffusion",
      "color": "teal",
      "fact": "Solutes diffuse down their concentration gradient without spending energy: small nonpolar molecules cross the bilayer directly, while ions pass through ion channels and polar molecules such as glucose ride uniporters by facilitated diffusion.",
      "terms": [
        "diffusion",
        "ion channel",
        "facilitated diffusion",
        "uniporter",
        "concentration gradient"
      ],
      "seeds": [
        "diffusion",
        "ion channel"
      ],
      "termInfo": {
        "concentration gradient": "A difference in a solute's concentration between two sides of a membrane, the store of potential energy that diffusion runs down.",
        "diffusion": {
          "text": "Net movement of a solute from higher to lower concentration, driven by random thermal motion rather than metabolic energy.",
          "links": [
            {
              "href": "wiki:Diffusion"
            }
          ]
        },
        "facilitated diffusion": {
          "text": "Passive movement across the membrane that still requires a protein, because the solute cannot cross the lipid bilayer on its own.",
          "links": [
            {
              "href": "wiki:Facilitated diffusion"
            }
          ]
        },
        "ion channel": {
          "text": "A membrane protein forming a gated, water-filled pore through which specific ions flow down their gradients.",
          "links": [
            {
              "href": "wiki:Ion channel"
            }
          ]
        },
        "uniporter": {
          "text": "A carrier that binds one solute and changes shape to move it down its gradient, such as the GLUT glucose transporters.",
          "links": [
            {
              "href": "wiki:Uniporter"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/3-1-the-cell-membrane"
          }
        ]
      }
    },
    {
      "id": "water-movement",
      "name": "Water movement",
      "color": "blue",
      "fact": "Water crosses membranes by osmosis, largely through aquaporins, moving toward the side with higher osmolarity; tonicity describes how a solution's impermeant solutes will make a cell swell or shrink.",
      "terms": [
        "osmosis",
        "aquaporin",
        "osmolarity",
        "tonicity"
      ],
      "seeds": [
        "osmosis",
        "aquaporin"
      ],
      "termInfo": {
        "aquaporin": {
          "text": "A water-selective channel protein that greatly speeds osmotic water flow across membranes; water, not ions, is its cargo.",
          "links": [
            {
              "href": "wiki:Aquaporin"
            }
          ]
        },
        "osmolarity": {
          "text": "The total concentration of dissolved solute particles per liter of solution, which sets the direction of osmotic water flow.",
          "links": [
            {
              "href": "wiki:Osmotic concentration"
            }
          ]
        },
        "osmosis": {
          "text": "Net diffusion of water across a selectively permeable membrane toward the side with more dissolved particles.",
          "links": [
            {
              "href": "wiki:Osmosis"
            }
          ]
        },
        "tonicity": {
          "text": "A solution's effect on cell volume, determined by the solutes that cannot cross the membrane: hypotonic swells cells, hypertonic shrinks them.",
          "links": [
            {
              "href": "wiki:Tonicity"
            }
          ]
        }
      }
    },
    {
      "id": "primary-active-transport",
      "name": "Primary active transport",
      "color": "amber",
      "fact": "Primary active transporters hydrolyze ATP to move ions against their gradients: the sodium–potassium pump exports three Na⁺ and imports two K⁺ per ATP, while calcium and proton pumps keep their own ions concentrated where the cell needs them.",
      "terms": [
        "sodium–potassium pump",
        "ATP hydrolysis",
        "calcium pump",
        "proton pump"
      ],
      "seeds": [
        "sodium–potassium pump",
        "ATP hydrolysis"
      ],
      "termInfo": {
        "ATP hydrolysis": {
          "text": "Splitting ATP to ADP and phosphate, releasing the energy a pump uses to push ions uphill.",
          "links": [
            {
              "href": "wiki:ATP hydrolysis"
            }
          ]
        },
        "calcium pump": {
          "text": "A Ca²⁺-ATPase that keeps cytosolic calcium very low, exporting it from the cell or loading it into stores such as the sarcoplasmic reticulum.",
          "links": [
            {
              "href": "wiki:Calcium ATPase"
            }
          ]
        },
        "proton pump": {
          "text": "An ATP-driven H⁺ transporter, such as the V-type ATPase that acidifies lysosomes by pumping protons in alone, with no ion exchanged back.",
          "links": [
            {
              "href": "wiki:Proton pump"
            },
            {
              "href": "wiki:V-ATPase"
            }
          ]
        },
        "sodium–potassium pump": {
          "text": "Na⁺/K⁺-ATPase: exports 3 Na⁺ and imports 2 K⁺ per ATP, building the gradients most other transport depends on.",
          "links": [
            {
              "href": "wiki:Sodium–potassium pump"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Active transport"
          }
        ]
      }
    },
    {
      "id": "secondary-active-transport",
      "name": "Secondary active transport",
      "color": "magenta",
      "fact": "Secondary active transporters spend no ATP themselves: they couple one solute's uphill movement to Na⁺ flowing down its gradient, either in the same direction (symporters such as the sodium–glucose cotransporter) or the opposite one (antiporters such as the sodium–calcium exchanger).",
      "terms": [
        "symporter",
        "antiporter",
        "sodium–glucose cotransporter",
        "sodium–calcium exchanger"
      ],
      "seeds": [
        "symporter",
        "antiporter"
      ],
      "termInfo": {
        "antiporter": {
          "text": "An exchanger that moves two solutes across the membrane in opposite directions.",
          "links": [
            {
              "href": "wiki:Antiporter"
            }
          ]
        },
        "sodium–calcium exchanger": {
          "text": "NCX: lets three Na⁺ in to push one Ca²⁺ out, a major route for clearing calcium from heart cells.",
          "links": [
            {
              "href": "wiki:Sodium-calcium exchanger"
            }
          ]
        },
        "sodium–glucose cotransporter": {
          "text": "SGLT: pulls glucose into intestinal and kidney tubule cells against its gradient by letting Na⁺ in alongside it.",
          "links": [
            {
              "href": "wiki:Sodium-glucose transport proteins"
            }
          ]
        },
        "symporter": {
          "text": "A cotransporter that moves two solutes across the membrane in the same direction.",
          "links": [
            {
              "href": "wiki:Symporter"
            }
          ]
        }
      }
    },
    {
      "id": "resting-membrane-potential",
      "name": "Resting membrane potential",
      "color": "olive",
      "fact": "Each ion has an equilibrium potential, given by the Nernst equation, at which its electrical and chemical forces balance; the Goldman equation weights those potentials by permeability, so a resting membrane dominated by potassium leak channels sits near −70 mV, close to potassium's own equilibrium.",
      "terms": [
        "resting membrane potential",
        "equilibrium potential",
        "Nernst equation",
        "Goldman equation",
        "potassium leak channel"
      ],
      "seeds": [
        "resting membrane potential",
        "equilibrium potential"
      ],
      "termInfo": {
        "Goldman equation": {
          "text": "Calculates the membrane voltage when several ions are permeant at once, weighting each by its permeability.",
          "links": [
            {
              "href": "wiki:Goldman equation"
            }
          ]
        },
        "Nernst equation": {
          "text": "Calculates one ion's equilibrium potential from its concentrations on the two sides of the membrane.",
          "links": [
            {
              "href": "wiki:Nernst equation"
            }
          ]
        },
        "equilibrium potential": {
          "text": "The voltage at which one ion's electrical pull exactly balances its concentration gradient, so it has no net flow.",
          "links": [
            {
              "href": "wiki:Reversal potential"
            }
          ]
        },
        "potassium leak channel": {
          "text": "A K⁺ channel that stays open at rest, making the resting membrane mostly permeable to potassium and pulling its voltage toward potassium's equilibrium.",
          "links": [
            {
              "href": "wiki:Potassium channel"
            }
          ]
        },
        "resting membrane potential": {
          "text": "The steady voltage across an unstimulated cell's membrane, inside negative, about −70 mV in a typical neuron.",
          "links": [
            {
              "href": "wiki:Resting potential"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "sodium-gradient",
      "term": "sodium gradient",
      "clusters": [
        2,
        3
      ],
      "fact": "The sodium gradient is the currency that links the two kinds of active transport: the sodium–potassium pump spends ATP to keep intracellular Na⁺ low, and symporters and antiporters spend that inward Na⁺ gradient to move glucose, calcium, and other solutes uphill.",
      "info": "Low Na⁺ inside, high Na⁺ outside: stored energy built by one pump and spent by many cotransporters.",
      "relationKind": "dynamic",
      "idealTerms": [
        "sodium–potassium pump",
        "symporter"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "electrochemical-gradient",
      "term": "electrochemical gradient",
      "clusters": [
        0,
        4
      ],
      "fact": "Ions flowing through channels respond to an electrochemical gradient, not concentration alone: the membrane voltage pushes or pulls on their charge, and an ion stops flowing net only at its equilibrium potential.",
      "info": {
        "text": "The combined chemical and electrical driving force on a charged solute.",
        "links": [
          {
            "href": "wiki:Electrochemical gradient"
          }
        ]
      },
      "idealTerms": [
        "ion channel",
        "equilibrium potential"
      ]
    },
    {
      "id": "pump-leak-balance",
      "term": "pump–leak balance",
      "clusters": [
        2,
        4
      ],
      "fact": "The resting potential is a pump–leak balance: potassium leak channels let K⁺ escape and generate most of the voltage, while the sodium–potassium pump continually restores the gradients those leaks run down and adds a few millivolts of its own.",
      "info": "Leaks spend the gradients; the pump keeps rebuilding them, so the voltage holds steady.",
      "idealTerms": [
        "sodium–potassium pump",
        "potassium leak channel"
      ]
    },
    {
      "id": "cell-volume",
      "term": "cell volume",
      "clusters": [
        2,
        1
      ],
      "fact": "Cell volume depends on the pump: by exporting Na⁺ as fast as it leaks in, the sodium–potassium pump keeps sodium effectively outside the cell, balancing the osmotic pull of trapped intracellular solutes; block the pump and water follows sodium in until the cell swells.",
      "info": "The pump does osmotic housekeeping as well as electrical work.",
      "idealTerms": [
        "sodium–potassium pump",
        "osmosis"
      ]
    }
  ],
  "lenses": [
    {
      "id": "two-routes-for-glucose",
      "prompt": "Glucose crosses cell membranes two ways: downhill wherever cells need it, and against its gradient in the gut and kidney tubule. Which two specific transporters carry it?",
      "explanation": "The uniporter (the GLUT family) carries glucose down its gradient; the sodium–glucose cotransporter pulls it uphill by spending the sodium gradient. Facilitated diffusion is the process the uniporter performs rather than a transporter, and symporter is the general class the cotransporter belongs to.",
      "targets": [
        "uniporter",
        "sodium–glucose cotransporter"
      ],
      "reasons": {
        "sodium–glucose cotransporter": "It moves glucose against its gradient by letting Na⁺ in alongside it, in intestinal and kidney tubule cells.",
        "uniporter": "GLUT transporters are uniporters: they carry glucose passively, down its gradient."
      }
    },
    {
      "id": "opposite-directions",
      "prompt": "Which transporters move two different ions in opposite directions at the same time?",
      "explanation": "An antiporter is defined by opposite-direction coupling, and the sodium–calcium exchanger is one. The sodium–potassium pump is an exchanger too, though its name doesn't say so: every cycle sends Na⁺ out and brings K⁺ in. Symporters move their cargoes in the same direction; uniporters and channels move one solute at a time.",
      "targets": [
        "sodium–potassium pump",
        "antiporter",
        "sodium–calcium exchanger"
      ],
      "reasons": {
        "antiporter": "Opposite-direction coupling is what defines an antiporter.",
        "sodium–calcium exchanger": "It brings three Na⁺ in while pushing one Ca²⁺ out.",
        "sodium–potassium pump": "Each cycle exports three Na⁺ while importing two K⁺."
      }
    },
    {
      "id": "calculating-voltage",
      "prompt": "Which concepts let you calculate the voltage a membrane moves toward when its potassium permeability rises?",
      "explanation": "The Nernst equation gives potassium's equilibrium potential, the voltage it pulls toward; the Goldman equation shows why raising K⁺ permeability gives that pull more weight. The resting potential is the quantity that shifts, and the leak channel is the cause, not the calculation.",
      "targets": [
        "equilibrium potential",
        "Nernst equation",
        "Goldman equation"
      ],
      "reasons": {
        "Goldman equation": "It weights each ion's pull by permeability, so more K⁺ permeability moves the result toward potassium's equilibrium.",
        "Nernst equation": "It calculates potassium's equilibrium potential from its inside and outside concentrations.",
        "equilibrium potential": "It is the target voltage: where potassium's net flow would stop."
      }
    },
    {
      "id": "digoxin-chain",
      "prompt": "Digoxin partly blocks the sodium–potassium pump, and heart muscle contracts more forcefully. Which two concepts carry the effect from the pump to the heart's calcium?",
      "explanation": "With the pump slowed, intracellular sodium rises and the sodium gradient shrinks; the sodium–calcium exchanger, which runs on that gradient, clears less calcium, so more is available for each contraction. The calcium pump also clears calcium, but it runs on ATP, not the sodium gradient, so it does not carry digoxin's effect.",
      "targets": [
        "sodium gradient",
        "sodium–calcium exchanger"
      ],
      "reasons": {
        "sodium gradient": "Slowing the pump lets intracellular Na⁺ rise, shrinking the gradient the exchanger spends.",
        "sodium–calcium exchanger": "With less sodium gradient to spend, it pushes out less Ca²⁺, leaving more for contraction."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "inside-the-cell",
        "reason": "Start with the survey of the plasma membrane and organelles before the transport and voltage details here."
      },
      {
        "id": "how-the-kidney-forms-urine",
        "reason": "See the sodium–glucose cotransporter at work: tubular glucose reabsorption runs on the sodium gradient.",
        "via": [
          "sodium–glucose cotransporter",
          "sodium gradient"
        ]
      },
      {
        "id": "muscular-system",
        "reason": "See calcium pumps and membrane excitation put to work in muscle contraction.",
        "via": [
          "calcium pump",
          "resting membrane potential"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Gradients built, gradients spent",
    "summary": "How one ATP-driven pump builds the ion gradients that cells spend to move solutes, hold their volume, and set a resting voltage.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every cell keeps its inside chemically different from its outside. Potassium is concentrated inside; sodium and calcium are concentrated outside; and the inside sits at a negative voltage. None of this is at equilibrium. Left alone, ions would leak until the differences vanished, and the cell would lose the stored energy it runs on.\r\n\r\n## Downhill: diffusion and osmosis\r\n\r\nSolutes move down their concentration gradient by **diffusion**. Small nonpolar molecules slip straight through the lipid bilayer, but ions and polar molecules need proteins: **ion channels**, which are gated pores, and carriers such as **uniporters**, which bind one solute and change shape to release it on the far side. Protein-assisted movement down a gradient is called **facilitated diffusion**.\r\n\r\nWater follows its own rule. In **osmosis**, water moves toward the side with higher **osmolarity**, the total concentration of dissolved particles, often through water channels called **aquaporins**. **Tonicity** names the practical result, whether a solution makes a cell swell or shrink, and it depends only on the solutes that cannot cross the membrane.\r\n\r\n## Uphill: pumps and the sodium gradient\r\n\r\nMoving a solute against its gradient costs energy. **Primary active transporters** pay with ATP directly, through **ATP hydrolysis**. The most important is the **sodium–potassium pump** (Na⁺/K⁺-ATPase), which exports three sodium ions and imports two potassium ions for each ATP it splits. **Calcium pumps** and **proton pumps** do similar work for their own ions.\r\n\r\n**Secondary active transporters** spend no ATP of their own. They let sodium flow back into the cell down the gradient the pump created, and harness that flow to move a second solute uphill. A **symporter** moves both in the same direction, as the **sodium–glucose cotransporter** does when the intestine and kidney absorb glucose. An **antiporter** moves them in opposite directions, as the **sodium–calcium exchanger** does when it clears calcium from heart cells.\r\n\r\nThe pump also protects cell volume. Cells are full of proteins and other solutes that cannot leave. By keeping sodium out, the pump balances their osmotic pull; stop the pump, and sodium and then water flow in until the cell swells.\r\n\r\n## Voltage from gradients\r\n\r\nBecause ions carry charge, their movement is governed by an **electrochemical gradient**: concentration and voltage together. For any single ion there is an **equilibrium potential**, the voltage at which its electrical and chemical forces cancel, calculated by the **Nernst equation**. For potassium it is about −90 mV.\r\n\r\nA real membrane is permeable to several ions at once. The **Goldman equation** combines their pulls, weighting each ion by its permeability. At rest, open **potassium leak channels** make the membrane far more permeable to K⁺ than to Na⁺, so the **resting membrane potential** settles near −70 mV, close to potassium's equilibrium. The leaks keep running the gradients down; the pump keeps rebuilding them, and it adds a few millivolts directly, because it moves three charges out for every two it brings in.\r\n\r\nThat steady negative voltage is stored readiness. Nerve and muscle cells spend it when they fire."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "membranes-set-cell-conditions",
      "puzzleRevision": "fnv1a32:838452ee",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:diffusion": {
          "x": 667.37,
          "y": 230.57,
          "pinned": false
        },
        "term:ion channel": {
          "x": 557.7,
          "y": 213.52,
          "pinned": false
        },
        "term:facilitated diffusion": {
          "x": 800.45,
          "y": 179.61,
          "pinned": false
        },
        "term:uniporter": {
          "x": 738.12,
          "y": 307.73,
          "pinned": false
        },
        "term:concentration gradient": {
          "x": 642.02,
          "y": 87.14,
          "pinned": false
        },
        "term:osmosis": {
          "x": 817.6,
          "y": 396.07,
          "pinned": false
        },
        "term:aquaporin": {
          "x": 861.87,
          "y": 308.2,
          "pinned": false
        },
        "term:osmolarity": {
          "x": 922.3,
          "y": 397.52,
          "pinned": false
        },
        "term:tonicity": {
          "x": 859.75,
          "y": 481.48,
          "pinned": false
        },
        "term:sodium–potassium pump": {
          "x": 599.8,
          "y": 510.61,
          "pinned": false
        },
        "term:ATP hydrolysis": {
          "x": 755.97,
          "y": 536.16,
          "pinned": false
        },
        "term:calcium pump": {
          "x": 695.12,
          "y": 650.91,
          "pinned": false
        },
        "term:proton pump": {
          "x": 574.85,
          "y": 657,
          "pinned": false
        },
        "term:symporter": {
          "x": 375.28,
          "y": 505.32,
          "pinned": false
        },
        "term:antiporter": {
          "x": 466.22,
          "y": 447.38,
          "pinned": false
        },
        "term:sodium–glucose cotransporter": {
          "x": 226.79,
          "y": 434.45,
          "pinned": false
        },
        "term:sodium–calcium exchanger": {
          "x": 295.64,
          "y": 634.74,
          "pinned": false
        },
        "term:resting membrane potential": {
          "x": 253.62,
          "y": 218.01,
          "pinned": false
        },
        "term:equilibrium potential": {
          "x": 273.03,
          "y": 23,
          "pinned": false
        },
        "term:Nernst equation": {
          "x": 127.79,
          "y": 93.31,
          "pinned": false
        },
        "term:Goldman equation": {
          "x": 73.64,
          "y": 228.51,
          "pinned": false
        },
        "term:potassium leak channel": {
          "x": 434.21,
          "y": 302.06,
          "pinned": false
        },
        "term:sodium gradient": {
          "x": 461.52,
          "y": 593.84,
          "pinned": false
        },
        "term:electrochemical gradient": {
          "x": 445.57,
          "y": 101.88,
          "pinned": false
        },
        "term:pump–leak balance": {
          "x": 600.1,
          "y": 342.92,
          "pinned": false
        },
        "term:cell volume": {
          "x": 714.87,
          "y": 416.27,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4351.86,
        "score": 4351.8585598377795
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:42:08.746Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "membranes-set-cell-conditions",
      "puzzleRevision": "fnv1a32:838452ee",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 901.68,
          "y": 472.2,
          "pinned": true
        },
        "cluster:1": {
          "x": 124.25,
          "y": 442.14,
          "pinned": true
        },
        "cluster:2": {
          "x": 286.15,
          "y": 149.62,
          "pinned": true
        },
        "cluster:3": {
          "x": 722.75,
          "y": 143.61,
          "pinned": true
        },
        "cluster:4": {
          "x": 484.91,
          "y": 513.4,
          "pinned": true
        }
      },
      "bridges": {
        "term:sodium gradient": {
          "x": 509.96,
          "y": 218.75,
          "pinned": true
        },
        "term:electrochemical gradient": {
          "x": 734.27,
          "y": 609.42,
          "pinned": true
        },
        "term:pump–leak balance": {
          "x": 346.96,
          "y": 330.51,
          "pinned": true
        },
        "term:cell volume": {
          "x": 164.27,
          "y": 288.86,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "diffusion",
          "ion channel",
          "facilitated diffusion",
          "uniporter",
          "concentration gradient"
        ],
        "cluster:1": [
          "osmosis",
          "aquaporin",
          "osmolarity",
          "tonicity"
        ],
        "cluster:2": [
          "sodium–potassium pump",
          "ATP hydrolysis",
          "calcium pump",
          "proton pump"
        ],
        "cluster:3": [
          "symporter",
          "antiporter",
          "sodium–glucose cotransporter",
          "sodium–calcium exchanger"
        ],
        "cluster:4": [
          "resting membrane potential",
          "equilibrium potential",
          "Nernst equation",
          "Goldman equation",
          "potassium leak channel"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "diffusion",
          "facilitated diffusion",
          "concentration gradient",
          "ion channel",
          "uniporter"
        ],
        "cluster:1": [
          "osmosis",
          "osmolarity",
          "aquaporin",
          "tonicity"
        ],
        "cluster:2": [
          "calcium pump",
          "sodium–potassium pump",
          "ATP hydrolysis",
          "proton pump"
        ],
        "cluster:3": [
          "antiporter",
          "sodium–glucose cotransporter",
          "sodium–calcium exchanger",
          "symporter"
        ],
        "cluster:4": [
          "Goldman equation",
          "equilibrium potential",
          "potassium leak channel",
          "resting membrane potential",
          "Nernst equation"
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
        "totalLength": 1382.8455828972676
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:41:12.520Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "membranes-set-cell-conditions",
      "puzzleRevision": "fnv1a32:838452ee",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:diffusion": {
          "x": 249.15,
          "y": 99.13
        },
        "term:ion channel": {
          "x": 364.3,
          "y": 178.7
        },
        "term:facilitated diffusion": {
          "x": 370.41,
          "y": 22
        },
        "term:uniporter": {
          "x": 519.67,
          "y": 22
        },
        "term:concentration gradient": {
          "x": 668.82,
          "y": 22
        },
        "term:osmosis": {
          "x": 225.23,
          "y": 338.42
        },
        "term:aquaporin": {
          "x": 128,
          "y": 306.55
        },
        "term:osmolarity": {
          "x": 89.3,
          "y": 202.12
        },
        "term:tonicity": {
          "x": 143.98,
          "y": 108.15
        },
        "term:sodium–potassium pump": {
          "x": 538.56,
          "y": 479.66
        },
        "term:ATP hydrolysis": {
          "x": 968.71,
          "y": 658
        },
        "term:calcium pump": {
          "x": 834.8,
          "y": 658
        },
        "term:proton pump": {
          "x": 655.8,
          "y": 658
        },
        "term:symporter": {
          "x": 424.52,
          "y": 568.14
        },
        "term:antiporter": {
          "x": 371.16,
          "y": 658
        },
        "term:sodium–glucose cotransporter": {
          "x": 200.15,
          "y": 658
        },
        "term:sodium–calcium exchanger": {
          "x": 113.06,
          "y": 461.17
        },
        "term:resting membrane potential": {
          "x": 861.71,
          "y": 76.48
        },
        "term:equilibrium potential": {
          "x": 647.09,
          "y": 197.07
        },
        "term:Nernst equation": {
          "x": 992.75,
          "y": 198.03
        },
        "term:Goldman equation": {
          "x": 989.6,
          "y": 347.01
        },
        "term:potassium leak channel": {
          "x": 928.02,
          "y": 502.78
        },
        "term:sodium gradient": {
          "x": 523.44,
          "y": 658
        },
        "term:electrochemical gradient": {
          "x": 483.93,
          "y": 311.46
        },
        "term:pump–leak balance": {
          "x": 654.42,
          "y": 367.75
        },
        "term:cell volume": {
          "x": 323.59,
          "y": 291.26
        },
        "cluster:0": {
          "x": 492.5,
          "y": 133.75
        },
        "cluster:1": {
          "x": 215.57,
          "y": 218.71
        },
        "cluster:2": {
          "x": 733.41,
          "y": 530.78
        },
        "cluster:3": {
          "x": 322.55,
          "y": 459.52
        },
        "cluster:4": {
          "x": 824.65,
          "y": 289.22
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-11T17:41:31.386Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "starFreeStrip": true,
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
