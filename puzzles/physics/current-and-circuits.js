// Generated from content/puzzles/current-and-circuits.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "current-and-circuits",
  "title": "Current and Circuits — Making Charge Do Work",
  "category": "physics",
  "subcategories": {
    "physics": "electromagnetism"
  },
  "info": {
    "text": "Charge at rest makes sparks; charge in motion does work. This board teaches the moving-charge story: what an electric current is, what drives it, what opposes it, the law tying push, opposition, and flow together, how series and parallel arrangements divide them, and the two conservation rules that make every circuit solvable.",
    "links": [
      {
        "href": "wiki:Electric current"
      }
    ],
    "citations": [
      {
        "title": "Electric current -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electric_current"
      },
      {
        "title": "Electric battery -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electric_battery"
      },
      {
        "title": "Ohm's law -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Ohm%27s_law"
      },
      {
        "title": "Series and parallel circuits -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Series_and_parallel_circuits"
      },
      {
        "title": "Kirchhoff's circuit laws -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Kirchhoff%27s_circuit_laws"
      }
    ]
  },
  "clusters": [
    {
      "id": "what-current-is",
      "name": "What current is",
      "color": "teal",
      "fact": "An electric current is charge in motion through a conductor: one ampere means one coulomb passing each second. Conventional current points the way positive charge would move — opposite to the electrons — and the carriers themselves drift surprisingly slowly.",
      "terms": [
        "electric current",
        "ampere",
        "conventional current",
        "drift velocity"
      ],
      "seeds": [
        "electric current",
        "ampere"
      ],
      "termInfo": {
        "electric current": {
          "text": "Charge in motion through a conductor — a flow rate, measured in amperes. Named and measured by Andre-Marie Ampere.",
          "links": [
            {
              "href": "wiki:Electric current"
            }
          ]
        },
        "ampere": {
          "text": "The SI unit of current: one coulomb of charge passing a point each second.",
          "links": [
            {
              "href": "wiki:Ampere"
            }
          ]
        },
        "conventional current": {
          "text": "The direction convention: current drawn as positive charge would move, opposite to the electron flow in metals.",
          "links": [
            {
              "href": "wiki:Electric current"
            }
          ]
        },
        "drift velocity": {
          "text": "The electrons' actual slow crawl through the lattice, a fraction of a millimeter per second — the signal travels fast, the carriers do not.",
          "links": [
            {
              "href": "wiki:Drift velocity"
            }
          ]
        }
      },
      "info": {
        "text": "The flow itself: what counts as current, its unit, the direction convention, and the slow reality of the carriers.",
        "links": [
          {
            "href": "wiki:Electric current"
          }
        ]
      }
    },
    {
      "id": "the-source",
      "name": "The source",
      "color": "blue",
      "fact": "A battery converts chemical energy into electrical energy, maintaining a potential difference across its terminals — an emf degraded by internal resistance. Volta's 1800 pile was the first; a short circuit, which drops that push through almost no resistance, is the failure mode that overheats or explodes batteries.",
      "terms": [
        "battery",
        "short circuit",
        "electromotive force",
        "internal resistance",
        "voltaic pile"
      ],
      "seeds": [
        "battery",
        "short circuit"
      ],
      "termInfo": {
        "battery": {
          "text": "One or more electrochemical cells converting chemical energy to electrical energy, maintaining a potential difference across terminals. Volta's 1800 voltaic pile was the first.",
          "links": [
            {
              "href": "wiki:Electric battery"
            }
          ]
        },
        "electromotive force": {
          "text": "The emf: the energy given per unit charge by the source, the rated push before any losses — measured in volts despite the name.",
          "links": [
            {
              "href": "wiki:Electromotive force"
            }
          ]
        },
        "internal resistance": {
          "text": "The battery's own resistance, which drops the terminal voltage below the emf whenever real current flows.",
          "links": [
            {
              "href": "wiki:Internal resistance"
            }
          ]
        },
        "voltaic pile": {
          "text": "Volta's stacked-zinc-and-copper first battery (1800) — the first source of steady current, built from alternating discs.",
          "links": [
            {
              "href": "wiki:Voltaic pile"
            }
          ]
        },
        "short circuit": {
          "text": "An accidental near-zero-resistance path: current skyrockets, heat and hydrogen can build, and batteries can overheat or explode.",
          "links": [
            {
              "href": "wiki:Short circuit"
            }
          ]
        }
      },
      "info": {
        "text": "Where steady current comes from: chemical energy converted to electrical push, the pile that started it, the imperfection that degrades it, and the failure mode.",
        "links": [
          {
            "href": "wiki:Electric battery"
          }
        ]
      }
    },
    {
      "id": "resistance-and-ohms-law",
      "name": "Resistance and Ohm's law",
      "color": "amber",
      "fact": "Resistance opposes the flow, and Ohm's law relates all three quantities: V = IR, the proportionality Georg Ohm found in 1827. A resistor supplies resistance on purpose; resistivity is the material property that fixes a conductor's resistance before shape enters.",
      "terms": [
        "resistance",
        "Ohm's law",
        "resistor",
        "resistivity"
      ],
      "seeds": [
        "resistance",
        "Ohm's law"
      ],
      "termInfo": {
        "resistance": {
          "text": "The opposition a conductor offers to current, R = V/I in ohms; its inverse is conductance.",
          "links": [
            {
              "href": "wiki:Electrical resistance and conductance"
            }
          ]
        },
        "Ohm's law": {
          "text": "The 1827 proportionality V = IR: current through a conductor between two points is directly proportional to the voltage across them.",
          "links": [
            {
              "href": "wiki:Ohm's law"
            }
          ]
        },
        "resistor": {
          "text": "A component built to supply a chosen resistance — the workhorse of circuit design.",
          "links": [
            {
              "href": "wiki:Resistor"
            }
          ]
        },
        "resistivity": {
          "text": "The material property, independent of shape, that sets how strongly a substance opposes current; geometry turns it into resistance.",
          "links": [
            {
              "href": "wiki:Electrical resistivity and conductivity"
            }
          ]
        }
      },
      "info": {
        "text": "The opposing side: the property, the component, the material constant, and the 1827 law that ties push, opposition, and flow together.",
        "links": [
          {
            "href": "wiki:Ohm's law"
          }
        ]
      }
    },
    {
      "id": "series-and-parallel",
      "name": "Series and parallel",
      "color": "magenta",
      "fact": "Two ways to connect components: series shares one current and divides voltage; parallel shares one voltage and divides current. That is exactly why the ammeter, which reads current, sits in series, and the voltmeter, which reads voltage, sits in parallel.",
      "terms": [
        "series circuit",
        "parallel circuit",
        "ammeter",
        "voltmeter"
      ],
      "seeds": [
        "series circuit",
        "parallel circuit"
      ],
      "termInfo": {
        "series circuit": {
          "text": "Components connected end to end: one path, so all share the same current while voltage divides among them; resistances add.",
          "links": [
            {
              "href": "wiki:Series and parallel circuits"
            }
          ]
        },
        "parallel circuit": {
          "text": "Components connected across the same two nodes: all share the same voltage while current divides among branches; conductances add.",
          "links": [
            {
              "href": "wiki:Series and parallel circuits"
            }
          ]
        },
        "ammeter": {
          "text": "The current meter — a very low resistance that must sit in series so the flow it measures passes through it.",
          "links": [
            {
              "href": "wiki:Ammeter"
            }
          ]
        },
        "voltmeter": {
          "text": "The voltage meter — a very high resistance that sits in parallel so it senses the difference without diverting the flow.",
          "links": [
            {
              "href": "wiki:Voltmeter"
            }
          ]
        }
      },
      "info": {
        "text": "The two arrangements and the two meters whose placement teaches them.",
        "links": [
          {
            "href": "wiki:Series and parallel circuits"
          }
        ]
      }
    },
    {
      "id": "kirchhoffs-rules",
      "name": "Kirchhoff's rules",
      "color": "olive",
      "fact": "The two conservation rules that make any circuit solvable: the junction rule — current in equals current out at a node, because charge cannot pile up — and the loop rule — the directed sum of voltage changes around any closed loop is zero.",
      "terms": [
        "junction rule",
        "loop rule"
      ],
      "seeds": [
        "junction rule"
      ],
      "termInfo": {
        "junction rule": {
          "text": "Kirchhoff's current law: at any node, current in equals current out — conservation of charge applied to a flow.",
          "links": [
            {
              "href": "wiki:Kirchhoff's circuit laws"
            }
          ]
        },
        "loop rule": {
          "text": "Kirchhoff's voltage law: the directed sum of voltage changes around any closed loop is zero — conservation of energy.",
          "links": [
            {
              "href": "wiki:Kirchhoff's circuit laws"
            }
          ]
        }
      },
      "info": {
        "text": "The conservation pair: charge bookkeeping at nodes, energy bookkeeping around loops — what makes circuits solvable.",
        "links": [
          {
            "href": "wiki:Kirchhoff's circuit laws"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-chem-to-flow",
      "term": "chemical energy to charge flow",
      "clusters": [
        1,
        0
      ],
      "fact": "The battery's chemical reactions maintain its terminal voltage, and that maintained push drives a continuous current around the circuit — steady flow instead of a one-time static spark.",
      "info": {
        "text": "Energy conversion in the source: chemical reactions maintain the terminal voltage that drives the flow.",
        "links": [
          {
            "href": "wiki:Electric battery"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "electromotive force",
        "electric current"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "bridge-voltage",
      "term": "voltage",
      "clusters": [
        0,
        2
      ],
      "fact": "A voltage across a resistance drives a proportional current through it, V = IR: more push, more flow; more opposition, less. Ohm found the proportionality in 1827.",
      "info": {
        "text": "The potential difference across a resistance — the push in V = IR.",
        "links": [
          {
            "href": "wiki:Ohm's law"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "electric current",
        "Ohm's law"
      ]
    },
    {
      "id": "bridge-combining",
      "term": "combining resistances",
      "clusters": [
        2,
        3
      ],
      "fact": "Resistances combine predictably: in series they add; in parallel their conductances add — so any ladder of resistors behaves as one equivalent resistance.",
      "info": {
        "text": "How resistances add under each arrangement; the result is the equivalent resistance.",
        "links": [
          {
            "href": "wiki:Series and parallel circuits"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "resistance",
        null
      ]
    },
    {
      "id": "bridge-solving",
      "term": "solving a circuit",
      "clusters": [
        3,
        4
      ],
      "fact": "The rules turn a tangle of branches into algebra: the junction rule counts current at nodes, the loop rule sums voltages around loops, and with Ohm's law the result is a solvable linear system.",
      "info": {
        "text": "Kirchhoff's rules with Ohm's law turn any network into a solvable linear system.",
        "links": [
          {
            "href": "wiki:Kirchhoff's circuit laws"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "bridge-junction-conservation",
      "term": "charge conservation at a node",
      "clusters": [
        4,
        0
      ],
      "fact": "The junction rule is conservation of charge applied to a flow: charge cannot pile up in a wire, so whatever current flows into a node must flow out.",
      "info": {
        "text": "Charge cannot pile up in a wire: the junction rule is conservation of charge for a flow.",
        "links": [
          {
            "href": "wiki:Kirchhoff's circuit laws"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "junction rule",
        "electric current"
      ]
    },
    {
      "id": "bridge-equal-quantity",
      "term": "same current or same voltage",
      "clusters": [
        3,
        0
      ],
      "fact": "What series and parallel MEAN: components in series are forced to share the same current; components in parallel are forced to share the same voltage. Each arrangement holds one quantity equal and divides the other.",
      "info": {
        "text": "The definitional contrast: series forces equal current, parallel forces equal voltage.",
        "links": [
          {
            "href": "wiki:Series and parallel circuits"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "series circuit",
        "electric current"
      ]
    }
  ],
  "lenses": [
    {
      "id": "lens-flow-rate",
      "prompt": "Current is a flow rate. Which terms give that rate its unit and describe how the carriers themselves move?",
      "explanation": "The unit is the ampere (coulombs per second); the carriers' motion is the drift velocity — a slow crawl even though the signal races. Electric current is the rate itself, not its unit or the carriers' speed, and conventional current is a direction convention, not a speed or size.",
      "targets": [
        "ampere",
        "drift velocity"
      ],
      "reasons": {
        "ampere": "One coulomb passing per second — the unit of the rate.",
        "drift velocity": "How slowly the electrons actually progress through the conductor."
      }
    },
    {
      "id": "lens-push-under-load",
      "prompt": "Which terms belong to the story of a battery's push under load — the rated push itself, what degrades it, and the near-zero-resistance disaster?",
      "explanation": "The electromotive force is the rated push; internal resistance degrades it whenever current flows; a short circuit is the extreme case where almost no resistance turns the full push into dangerous current. The battery is the story's owner, not one of its steps.",
      "targets": [
        "electromotive force",
        "internal resistance",
        "short circuit"
      ],
      "reasons": {
        "electromotive force": "The emf — energy delivered per unit charge before losses.",
        "internal resistance": "Why terminal voltage droops below the emf under load.",
        "short circuit": "Nearly zero resistance: current, heat, and explosion risk spike."
      }
    },
    {
      "id": "lens-forced-equal",
      "prompt": "Which terms are DEFINED by components being forced to share one identical quantity?",
      "explanation": "Series means sharing one current; parallel means sharing one voltage — each arrangement is its equality. The junction rule also states an equality (current in equals out), but it is a conservation law about a point, not a way of wiring components.",
      "targets": [
        "series circuit",
        "parallel circuit"
      ],
      "reasons": {
        "series circuit": "One path: the same current through everything on it.",
        "parallel circuit": "Same two nodes: the same voltage across every branch."
      }
    },
    {
      "id": "lens-meter-placement",
      "prompt": "Which terms are meters, and which placement does each demand?",
      "explanation": "An ammeter reads current, so it must sit in series; a voltmeter reads voltage, so it sits in parallel. Series and parallel circuits are the arrangements themselves, not the meters that exploit them.",
      "targets": [
        "ammeter",
        "voltmeter"
      ],
      "reasons": {
        "ammeter": "Reads the flow it sits inside — series, by definition.",
        "voltmeter": "Reads a difference it bridges — parallel, never in series."
      }
    },
    {
      "id": "lens-conservation-pair",
      "prompt": "Which terms are conservation statements — one about charge at a meeting point, one about energy around a cycle?",
      "explanation": "The junction rule is charge conservation at a node; the loop rule is energy conservation around a loop. Ohm's law is an empirical proportionality between push, opposition, and flow — material behavior, not a conservation principle.",
      "targets": [
        "junction rule",
        "loop rule"
      ],
      "reasons": {
        "junction rule": "Current in = current out: charge cannot pile up.",
        "loop rule": "Voltage changes around a closed loop sum to zero: energy is conserved."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "electric-charge-and-field",
        "reason": "The ground floor: what charge is, the field idea, and potential/voltage — the push this board spends in circuits was defined there.",
        "via": [
          "voltage",
          "resistance"
        ]
      },
      {
        "id": "magnetism-and-induction",
        "reason": "What current is good for beyond Ohm's law: current makes magnetism, changing flux induces emf — generators and transformers follow.",
        "via": [
          "electric current",
          "loop rule"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From sparks to workhorses",
    "summary": "Turn the static picture into motion: what drives a current, what opposes it, how arrangements divide the push and the flow, and the conservation rules that solve any circuit.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "A static charge on a balloon holds a tiny, motionless surplus. The moment you give it a conducting path, that surplus rushes away in a single crack — useful for a spark, useless for a lamp. The difference between a spark and a lamp is this subject: keeping charge in steady, controlled motion.\r\n\r\nThe keeper of the motion is the battery. Inside it, chemical reactions separate charge and maintain a potential difference across its terminals — a push called the electromotive force. Connect a wire between the terminals and the push drives a continuous flow: an electric current, measured in amperes — one coulomb of charge passing per second. The flow is conventional current, pointed the way positive charge would move, which is opposite to what the electrons are actually doing. And the electrons themselves drift astonishingly slowly, a fraction of a millimeter per second — their drift velocity — even though the signal races around the circuit at near light speed, like a wave in a already-full pipe of water.\r\n\r\nNothing moves freely forever. Resistance opposes the current: the property of a conductor, measured in ohms, that turns pushed charge into heat. Georg Ohm found in 1827 that the three quantities lock together in a simple proportionality — Ohm's law, V = IR. Double the push, double the flow; double the opposition, halve it. A resistor is resistance on purpose, a component sized to deliver a chosen opposition, and resistivity is the material property that sets resistance before shape and size enter. The battery itself is not exempt: its internal resistance is why a real terminal voltage droops under heavy load, and why a short circuit — a path with almost no resistance at all — converts the full push into dangerous current, heat, and sometimes explosion.\r\n\r\nComponents can be wired two ways, and the two arrangements are defined by what they force to be equal. Components in series share one current, and the push divides among them; components in parallel share one voltage, and the flow divides among them. The meters take sides: an ammeter reads current, so it must sit in series and let the same flow pass through it; a voltmeter reads voltage, so it sits in parallel, sensing the difference across a component without diverting the flow. Combine resistors and the arithmetic follows the arrangement — series resistances add, parallel conductances add — so any ladder of them behaves as one equivalent resistance.\r\n\r\nFinally, the two rules that make any circuit, however tangled, solvable. Gustav Kirchhoff's junction rule says current in equals current out at every node — charge conservation, applied to a flow, the same conservation that kept the balloon's total constant. His loop rule says the directed voltage changes around any closed loop sum to zero — energy conservation for charges going around. With Ohm's law these become simultaneous equations; solving them is how engineers compute what every branch of a network will do.\r\n\r\nFlow, push, opposition, arrangement, conservation: five ideas, one working circuit."
    },
    "links": [
      {
        "href": "wiki:Electric current"
      },
      {
        "href": "wiki:Electric battery"
      },
      {
        "href": "wiki:Ohm's law"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
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
      "puzzleId": "current-and-circuits",
      "puzzleRevision": "fnv1a32:cbf2b3a5",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:electric current": {
          "x": 580.04,
          "y": 247.38,
          "pinned": false
        },
        "term:ampere": {
          "x": 695.87,
          "y": 265.78,
          "pinned": false
        },
        "term:conventional current": {
          "x": 696.52,
          "y": 135.67,
          "pinned": false
        },
        "term:drift velocity": {
          "x": 805.16,
          "y": 246.36,
          "pinned": false
        },
        "term:battery": {
          "x": 836.33,
          "y": 526.36,
          "pinned": false
        },
        "term:short circuit": {
          "x": 947.05,
          "y": 518.51,
          "pinned": false
        },
        "term:electromotive force": {
          "x": 736.98,
          "y": 610.06,
          "pinned": false
        },
        "term:internal resistance": {
          "x": 860.41,
          "y": 397.56,
          "pinned": false
        },
        "term:voltaic pile": {
          "x": 881.63,
          "y": 627,
          "pinned": false
        },
        "term:resistance": {
          "x": 407.71,
          "y": 480.83,
          "pinned": false
        },
        "term:Ohm's law": {
          "x": 511.87,
          "y": 508.75,
          "pinned": false
        },
        "term:resistor": {
          "x": 335.24,
          "y": 556.49,
          "pinned": false
        },
        "term:resistivity": {
          "x": 437.39,
          "y": 591.05,
          "pinned": false
        },
        "term:series circuit": {
          "x": 215.42,
          "y": 284.82,
          "pinned": false
        },
        "term:parallel circuit": {
          "x": 73.65,
          "y": 299.13,
          "pinned": false
        },
        "term:ammeter": {
          "x": 137.68,
          "y": 401.14,
          "pinned": false
        },
        "term:voltmeter": {
          "x": 133.92,
          "y": 187.64,
          "pinned": false
        },
        "term:junction rule": {
          "x": 330.04,
          "y": 23,
          "pinned": false
        },
        "term:loop rule": {
          "x": 212.74,
          "y": 23,
          "pinned": false
        },
        "term:chemical energy to charge flow": {
          "x": 659.68,
          "y": 423.06,
          "pinned": false
        },
        "term:voltage": {
          "x": 497.45,
          "y": 395.53,
          "pinned": false
        },
        "term:combining resistances": {
          "x": 270.02,
          "y": 433.35,
          "pinned": false
        },
        "term:solving a circuit": {
          "x": 256.67,
          "y": 145.14,
          "pinned": false
        },
        "term:charge conservation at a node": {
          "x": 502.97,
          "y": 74.01,
          "pinned": false
        },
        "term:same current or same voltage": {
          "x": 395.44,
          "y": 274.55,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4325.92,
        "score": 4325.917807466211
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:26:14.112Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "current-and-circuits",
      "puzzleRevision": "fnv1a32:cbf2b3a5",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 505,
          "y": 144.89,
          "pinned": false
        },
        "cluster:1": {
          "x": 863.5,
          "y": 274.87,
          "pinned": false
        },
        "cluster:2": {
          "x": 146.5,
          "y": 274.87,
          "pinned": false
        },
        "cluster:3": {
          "x": 283.43,
          "y": 485.18,
          "pinned": false
        },
        "cluster:4": {
          "x": 726.57,
          "y": 485.18,
          "pinned": false
        }
      },
      "bridges": {
        "term:chemical energy to charge flow": {
          "x": 780.42,
          "y": 113.71,
          "pinned": false
        },
        "term:voltage": {
          "x": 315.03,
          "y": 184.01,
          "pinned": false
        },
        "term:combining resistances": {
          "x": 89.32,
          "y": 432.07,
          "pinned": false
        },
        "term:solving a circuit": {
          "x": 505,
          "y": 485.18,
          "pinned": false
        },
        "term:charge conservation at a node": {
          "x": 615.78,
          "y": 367.04,
          "pinned": false
        },
        "term:same current or same voltage": {
          "x": 394.22,
          "y": 315.04,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "electric current",
          "ampere",
          "conventional current",
          "drift velocity"
        ],
        "cluster:1": [
          "battery",
          "short circuit",
          "electromotive force",
          "internal resistance",
          "voltaic pile"
        ],
        "cluster:2": [
          "resistance",
          "Ohm's law",
          "resistor",
          "resistivity"
        ],
        "cluster:3": [
          "series circuit",
          "parallel circuit",
          "ammeter",
          "voltmeter"
        ],
        "cluster:4": [
          "junction rule",
          "loop rule"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "drift velocity",
          "conventional current",
          "electric current",
          "ampere"
        ],
        "cluster:1": [
          "voltaic pile",
          "internal resistance",
          "electromotive force",
          "short circuit",
          "battery"
        ],
        "cluster:2": [
          "Ohm's law",
          "resistivity",
          "resistance",
          "resistor"
        ],
        "cluster:3": [
          "voltmeter",
          "parallel circuit",
          "series circuit",
          "ammeter"
        ],
        "cluster:4": [
          "junction rule",
          "loop rule"
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
        "edgeNodeIntersections": 0,
        "totalLength": 1781.5415277895477
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:25:30.083Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "current-and-circuits",
      "puzzleRevision": "fnv1a32:cbf2b3a5",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:electric current": {
          "x": 453.67,
          "y": 22
        },
        "term:ampere": {
          "x": 584.68,
          "y": 22
        },
        "term:conventional current": {
          "x": 714.84,
          "y": 22
        },
        "term:drift velocity": {
          "x": 636.58,
          "y": 138.08
        },
        "term:battery": {
          "x": 826.03,
          "y": 278.81
        },
        "term:short circuit": {
          "x": 808.32,
          "y": 519.23
        },
        "term:electromotive force": {
          "x": 699.43,
          "y": 345.63
        },
        "term:internal resistance": {
          "x": 929.75,
          "y": 212
        },
        "term:voltaic pile": {
          "x": 940,
          "y": 540.02
        },
        "term:resistance": {
          "x": 770.16,
          "y": 628
        },
        "term:Ohm's law": {
          "x": 578.91,
          "y": 439.73
        },
        "term:resistor": {
          "x": 488.59,
          "y": 499.24
        },
        "term:resistivity": {
          "x": 694.36,
          "y": 455.11
        },
        "term:series circuit": {
          "x": 353.33,
          "y": 447.23
        },
        "term:parallel circuit": {
          "x": 70.4,
          "y": 544.79
        },
        "term:ammeter": {
          "x": 181.78,
          "y": 591.93
        },
        "term:voltmeter": {
          "x": 331.87,
          "y": 529.59
        },
        "term:junction rule": {
          "x": 177.92,
          "y": 278
        },
        "term:loop rule": {
          "x": 48.35,
          "y": 256.85
        },
        "term:chemical energy to charge flow": {
          "x": 639.62,
          "y": 247.19
        },
        "term:voltage": {
          "x": 523.65,
          "y": 358.92
        },
        "term:combining resistances": {
          "x": 421.57,
          "y": 628
        },
        "term:solving a circuit": {
          "x": 101.56,
          "y": 377.61
        },
        "term:charge conservation at a node": {
          "x": 303.85,
          "y": 136.7
        },
        "term:same current or same voltage": {
          "x": 358.97,
          "y": 365.79
        },
        "cluster:0": {
          "x": 602.86,
          "y": 82.51
        },
        "cluster:1": {
          "x": 840.93,
          "y": 406.8
        },
        "cluster:2": {
          "x": 617.67,
          "y": 566.7
        },
        "cluster:3": {
          "x": 167.27,
          "y": 489.86
        },
        "cluster:4": {
          "x": 105.85,
          "y": 144.13
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T02:26:02.863Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-19T02:26:24.866Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
