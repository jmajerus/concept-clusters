// Generated from content/puzzles/thermodynamics.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "thermodynamics",
  "title": "Thermodynamics: energy, limits, and engines",
  "category": "physics",
  "large": true,
  "info": {
    "text": "Thermodynamics describes a system's thermal state, constrains every energy conversion by four laws, and shows how engines turn gradients into work.",
    "links": [
      {
        "href": "wiki:Thermodynamics"
      }
    ],
    "citations": [
      {
        "title": "Thermodynamic state -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Thermodynamic_state"
      },
      {
        "title": "Laws of thermodynamics -- Simple English Wikipedia",
        "url": "https://simple.wikipedia.org/wiki/Laws_of_thermodynamics"
      },
      {
        "title": "3.4 Thermodynamic Processes -- University Physics Volume 2",
        "url": "https://pressbooks.online.ucf.edu/osuniversityphysics2/chapter/thermodynamic-processes/"
      },
      {
        "title": "Carnot's Perfect Heat Engine -- OpenBooks (MSU College Physics)",
        "url": "https://openbooks.lib.msu.edu/collegephysics/chapter/carnots-perfect-heat-engine-the-second-law-of-thermodynamics-restated/"
      }
    ]
  },
  "clusters": [
    {
      "id": "describe-the-state",
      "name": "Describe the state",
      "color": "teal",
      "fact": "A system's thermal condition is fixed by macroscopic state quantities: temperature sets hotness, pressure and volume set mechanical state, and internal energy totals the stored microscopic energy.",
      "terms": [
        "temperature",
        "pressure",
        "volume",
        "internal energy"
      ],
      "seeds": [
        "temperature",
        "pressure"
      ],
      "termInfo": {
        "internal energy": {
          "text": "The total microscopic energy stored in a system, changed only by heat and work.",
          "links": [
            {
              "href": "wiki:Internal energy"
            }
          ]
        },
        "pressure": {
          "text": "Force per unit area exerted by a system; with volume it fixes mechanical state.",
          "links": [
            {
              "href": "wiki:Pressure"
            }
          ]
        },
        "temperature": {
          "text": "The state quantity measuring hotness; equal in systems in thermal equilibrium.",
          "links": [
            {
              "href": "wiki:Temperature"
            }
          ]
        },
        "volume": {
          "text": "The space a system occupies; work is done when it changes against pressure.",
          "links": [
            {
              "href": "wiki:Volume (thermodynamics)"
            }
          ]
        }
      },
      "info": {
        "text": "State quantities fix what condition a system is in; every later claim about heat, work, or efficiency refers back to them.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Thermodynamic_state"
          }
        ]
      }
    },
    {
      "id": "state-the-limits",
      "name": "State the limits",
      "color": "blue",
      "fact": "Four laws constrain every thermal process: equilibrium defines temperature, energy is conserved, the entropy of an isolated system never decreases, and absolute zero stays unreachable.",
      "terms": [
        "zeroth law",
        "first law",
        "second law",
        "third law",
        "entropy"
      ],
      "seeds": [
        "second law",
        "entropy"
      ],
      "termInfo": {
        "entropy": {
          "text": "The state quantity measuring energy dispersal; it never decreases in an isolated system.",
          "links": [
            {
              "href": "wiki:Entropy"
            }
          ]
        },
        "first law": {
          "text": "Energy is conserved: a closed system's internal energy changes only by heat in and work done.",
          "links": [
            {
              "href": "wiki:First law of thermodynamics"
            }
          ]
        },
        "second law": {
          "text": "The entropy of an isolated system never decreases; heat will not flow uphill by itself.",
          "links": [
            {
              "href": "wiki:Second law of thermodynamics"
            }
          ]
        },
        "third law": {
          "text": "Absolute zero cannot be reached in finitely many steps; a perfect crystal has zero entropy there.",
          "links": [
            {
              "href": "wiki:Third law of thermodynamics"
            }
          ]
        },
        "zeroth law": {
          "text": "Systems each in equilibrium with a third are in equilibrium with each other -- defining temperature.",
          "links": [
            {
              "href": "wiki:Zeroth law of thermodynamics"
            }
          ]
        }
      },
      "info": {
        "text": "The four laws say what no process and no device can escape, whatever the mechanism.",
        "links": [
          {
            "href": "https://simple.wikipedia.org/wiki/Laws_of_thermodynamics"
          }
        ]
      }
    },
    {
      "id": "move-energy",
      "name": "Move energy across boundaries",
      "color": "amber",
      "fact": "Energy crosses boundaries as heat or work along idealized paths -- isothermal at constant temperature, adiabatic with no heat flow -- by conduction, convection, or radiation.",
      "terms": [
        "heat",
        "work",
        "isothermal process",
        "adiabatic process",
        "conduction",
        "convection",
        "radiation"
      ],
      "seeds": [
        "heat",
        "work"
      ],
      "termInfo": {
        "adiabatic process": {
          "text": "An idealized path with no heat flow, so work comes entirely from internal energy.",
          "links": [
            {
              "href": "wiki:Adiabatic process"
            }
          ]
        },
        "conduction": {
          "text": "Heat transfer through direct contact within a material.",
          "links": [
            {
              "href": "wiki:Thermal conduction"
            }
          ]
        },
        "convection": {
          "text": "Heat transfer by bulk motion of a fluid.",
          "links": [
            {
              "href": "wiki:Convection"
            }
          ]
        },
        "heat": {
          "text": "Energy crossing a boundary because of a temperature difference.",
          "links": [
            {
              "href": "wiki:Heat"
            }
          ]
        },
        "isothermal process": {
          "text": "An idealized path at constant temperature, with heat flow sustaining work output.",
          "links": [
            {
              "href": "wiki:Isothermal process"
            }
          ]
        },
        "radiation": {
          "text": "Heat transfer by electromagnetic waves, needing no medium.",
          "links": [
            {
              "href": "wiki:Thermal radiation"
            }
          ]
        },
        "work": {
          "text": "Energy crossing a boundary as organized macroscopic transfer, as when volume changes against pressure.",
          "links": [
            {
              "href": "wiki:Work (thermodynamics)"
            }
          ]
        }
      },
      "info": {
        "text": "Heat and work are not stored substances but crossings; the named paths and mechanisms say how each crossing happens.",
        "links": [
          {
            "href": "https://pressbooks.online.ucf.edu/osuniversityphysics2/chapter/thermodynamic-processes/"
          }
        ]
      }
    },
    {
      "id": "run-engines",
      "name": "Turn gradients into work",
      "color": "magenta",
      "fact": "Cyclic devices turn temperature differences into work (heat engines, bounded by the Carnot cycle) or spend work to move heat uphill (refrigerators).",
      "terms": [
        "heat engine",
        "Carnot cycle",
        "refrigerator"
      ],
      "seeds": [
        "heat engine",
        "refrigerator"
      ],
      "termInfo": {
        "Carnot cycle": {
          "text": "The ideal reversible cycle setting the maximum efficiency between two reservoirs.",
          "links": [
            {
              "href": "wiki:Carnot cycle"
            }
          ]
        },
        "heat engine": {
          "text": "A cyclic device turning heat flowing downhill into work.",
          "links": [
            {
              "href": "wiki:Heat engine"
            }
          ]
        },
        "refrigerator": {
          "text": "A cyclic device spending work to move heat from cold to hot.",
          "links": [
            {
              "href": "wiki:Refrigerator"
            }
          ]
        }
      },
      "info": {
        "text": "Cycles return to their start, so every engine is judged by what goes in, what comes out as work, and what must be rejected.",
        "links": [
          {
            "href": "https://openbooks.lib.msu.edu/collegephysics/chapter/carnots-perfect-heat-engine-the-second-law-of-thermodynamics-restated/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-thermal-equilibrium",
      "term": "thermal equilibrium",
      "clusters": [
        0,
        1
      ],
      "fact": "Thermal equilibrium is where state and law meet: the zeroth law defines temperature as the quantity shared by systems in equilibrium with one another.",
      "info": {
        "text": "Systems sharing the same temperature, with no net heat flow between them.",
        "links": [
          {
            "href": "wiki:Thermodynamic equilibrium"
          }
        ]
      },
      "termRole": "reference",
      "idealTerms": [
        "temperature",
        "zeroth law"
      ]
    },
    {
      "id": "bridge-absolute-zero",
      "term": "absolute zero",
      "clusters": [
        0,
        1
      ],
      "fact": "Absolute zero is the unreachable floor of the temperature scale: the third law forbids reaching it in any finite number of steps.",
      "info": {
        "text": "The zero of the absolute temperature scale, unreachable in finite steps.",
        "links": [
          {
            "href": "wiki:Absolute zero"
          }
        ]
      },
      "termRole": "reference",
      "idealTerms": [
        "temperature",
        "third law"
      ]
    },
    {
      "id": "bridge-carnot-efficiency",
      "term": "Carnot efficiency",
      "clusters": [
        3,
        1
      ],
      "fact": "Carnot efficiency is the second law expressed as a number: no engine working between two reservoirs can beat one minus the ratio of their absolute temperatures.",
      "info": {
        "text": "The maximum fraction of heat convertible to work between two reservoirs.",
        "links": [
          {
            "href": "wiki:Carnot cycle"
          }
        ]
      },
      "termRole": "reference",
      "idealTerms": [
        "Carnot cycle",
        "second law"
      ]
    },
    {
      "id": "bridge-waste-heat",
      "term": "waste heat",
      "clusters": [
        2,
        3
      ],
      "fact": "Waste heat is the price of every cycle: because no engine converts all incoming heat to work, each engine must reject heat to its cold reservoir.",
      "info": {
        "text": "The heat every cyclic engine must reject to its cold reservoir.",
        "links": [
          {
            "href": "wiki:Waste heat"
          }
        ]
      },
      "termRole": "reference",
      "idealTerms": [
        "heat",
        "heat engine"
      ]
    }
  ],
  "lenses": [
    {
      "id": "paths-not-crossings",
      "prompt": "Which terms name idealized paths that constrain how heat and work trade off?",
      "explanation": "Only the two named paths constrain how heat and work trade off along a crossing. Heat and work are the crossings themselves, not paths; conduction, convection, and radiation are mechanisms, not paths.",
      "targets": [
        "adiabatic process",
        "isothermal process"
      ],
      "reasons": {
        "adiabatic process": "No heat flows, so all work comes from internal energy.",
        "isothermal process": "Temperature stays constant while heat flow sustains work."
      }
    },
    {
      "id": "what-engines-must-live-with",
      "prompt": "Which spanning concepts name something every heat engine must live with?",
      "explanation": "Carnot efficiency states the cap and waste heat names what the cap forces every engine to reject. Thermal equilibrium and absolute zero link state to law but constrain no engine.",
      "targets": [
        "Carnot efficiency",
        "waste heat"
      ],
      "reasons": {
        "Carnot efficiency": "No engine between two reservoirs can beat this limit.",
        "waste heat": "Every cycle must reject heat to its cold reservoir."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Energy Has Rules",
    "summary": "Separate a system's condition, the universal limits on processes, and the movement and conversion of energy.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Everything warm is a system holding energy, and thermodynamics is the accounting of what that energy can do. This puzzle separates three questions: what condition a system is in, what universal limits every process obeys, and how energy moves and gets converted.\r\n\r\nKeep the crossings apart from the constraints: heat and work describe single passages of energy, while the laws -- especially the second -- decide which passages are possible at all."
    }
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
