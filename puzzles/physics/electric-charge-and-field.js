// Generated from content/puzzles/electric-charge-and-field.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "electric-charge-and-field",
  "title": "Electric Charge and the Field — Physics at a Distance",
  "category": "physics",
  "subcategories": {
    "physics": "electromagnetism"
  },
  "info": {
    "text": "Electrostatics is the foundation everything electrical builds on: charge as a two-signed, quantized, conserved property of matter; the inverse-square force between charges; the electric field that replaces action at a distance; the potential landscape that stores energy per charge; and the conductor–insulator behavior that decides where charge can go. Sorting these terms reconstructs the ladder, one idea earning the next.",
    "links": [
      {
        "href": "wiki:Electric charge"
      }
    ],
    "citations": [
      {
        "title": "Electric charge -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electric_charge"
      },
      {
        "title": "Electric field -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electric_field"
      },
      {
        "title": "Electric potential -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electric_potential"
      },
      {
        "title": "Electrostatic induction -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Electrostatic_induction"
      },
      {
        "title": "Coulomb's law -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Coulomb%27s_law"
      }
    ]
  },
  "clusters": [
    {
      "id": "what-charge-is",
      "name": "What charge is",
      "color": "teal",
      "fact": "Charge is matter's two-signed bookkeeping property: it comes only in whole multiples of the elementary charge, and an isolated system's total never changes. An atom carrying extra or missing charge is an ion; net zero is neutral.",
      "terms": [
        "electric charge",
        "ion",
        "elementary charge",
        "conservation of charge",
        "electrically neutral"
      ],
      "seeds": [
        "electric charge",
        "ion"
      ],
      "termInfo": {
        "electric charge": {
          "text": "Matter's two-signed physical property, measured in coulombs: what makes charges repel or attract and what every electrical quantity keeps track of.",
          "links": [
            {
              "href": "wiki:Electric charge"
            }
          ]
        },
        "ion": {
          "text": "An atom or molecule with a net charge from gaining electrons (negative anion) or losing them (positive cation).",
          "links": [
            {
              "href": "wiki:Ion"
            }
          ]
        },
        "elementary charge": {
          "text": "The quantum of charge, e ≈ 1.602×10⁻¹⁹ coulomb, the magnitude one electron or proton carries; all charge comes in integer multiples of it. Its size was measured by Millikan's oil-drop experiment.",
          "links": [
            {
              "href": "wiki:Elementary charge"
            }
          ]
        },
        "conservation of charge": {
          "text": "The total charge of an isolated system never changes: rubbing, ionizing, and current only move charge around, never create or destroy it.",
          "links": [
            {
              "href": "wiki:Charge conservation"
            }
          ]
        },
        "electrically neutral": {
          "text": "Net charge of zero — positive and negative charge exactly balanced. Neutral objects still respond to nearby charges by polarizing.",
          "links": [
            {
              "href": "wiki:Electric charge"
            }
          ]
        }
      },
      "info": {
        "text": "The bookkeeping layer: what charge is, that it is quantized and conserved, and the words for an object's net amount — ion on one side, neutral at zero.",
        "links": [
          {
            "href": "wiki:Electric charge"
          }
        ]
      }
    },
    {
      "id": "coulomb-force",
      "name": "The Coulomb force",
      "color": "blue",
      "fact": "Two charges push or pull along the line between them with a force proportional to the product of their charges and to the inverse square of their separation — like repels like, opposites attract. Coulomb measured it with a torsion balance.",
      "terms": [
        "Coulomb's law",
        "electrostatic force",
        "inverse-square law",
        "torsion balance"
      ],
      "seeds": [
        "Coulomb's law",
        "electrostatic force"
      ],
      "termInfo": {
        "Coulomb's law": {
          "text": "The law relating two point charges: force along the line between them, proportional to the product of the charges, inversely proportional to the square of the distance. Published by Charles-Augustin de Coulomb in 1785.",
          "links": [
            {
              "href": "wiki:Coulomb's law"
            }
          ]
        },
        "electrostatic force": {
          "text": "The push or pull between stationary charges — also called the Coulomb force; repulsive between like signs, attractive between unlike.",
          "links": [
            {
              "href": "wiki:Coulomb's law"
            }
          ]
        },
        "inverse-square law": {
          "text": "A force that weakens with the square of the distance: double the separation, one quarter the force. Gravity follows the same pattern, a resemblance the sources draw explicitly.",
          "links": [
            {
              "href": "wiki:Inverse-square law"
            }
          ]
        },
        "torsion balance": {
          "text": "Coulomb's instrument: a bar suspended by a thin fiber whose twist measures the tiny repulsion between charged spheres.",
          "links": [
            {
              "href": "wiki:Coulomb's law"
            }
          ]
        }
      },
      "info": {
        "text": "The quantitative law of attraction and repulsion, the inverse-square shape it shares with gravity, and the instrument that first pinned it down.",
        "links": [
          {
            "href": "wiki:Coulomb's law"
          }
        ]
      }
    },
    {
      "id": "the-field-idea",
      "name": "The field idea",
      "color": "amber",
      "fact": "A charge fills the space around it with an electric field: the force a vanishingly small test charge would feel, per unit of its charge. Fields from several charges add vectorially, and field lines trace the direction a positive charge would be pushed.",
      "terms": [
        "electric field",
        "field line",
        "test charge",
        "superposition principle"
      ],
      "seeds": [
        "electric field",
        "field line"
      ],
      "termInfo": {
        "electric field": {
          "text": "The force per unit charge at each point of space, in volts per meter: a property of space set by the charges that are there. Measured in V/m, equivalent to N/C.",
          "links": [
            {
              "href": "wiki:Electric field"
            }
          ]
        },
        "field line": {
          "text": "A drawn curve tangent to the field everywhere, pointing the way a positive charge would be pushed; introduced by Faraday as lines of force. Line density shows strength.",
          "links": [
            {
              "href": "wiki:Field line"
            }
          ]
        },
        "test charge": {
          "text": "The idealized vanishingly small charge used to probe a field without disturbing it — the q in E = F/q.",
          "links": [
            {
              "href": "wiki:Test particle"
            }
          ]
        },
        "superposition principle": {
          "text": "Fields from several charges add as vectors: the net field at a point is the vector sum of what each source contributes alone.",
          "links": [
            {
              "href": "wiki:Superposition principle"
            }
          ]
        }
      },
      "info": {
        "text": "The field reframes force-at-a-distance as a condition of space: defined per unit charge, probed with a test charge, drawn as field lines, combined by superposition.",
        "links": [
          {
            "href": "wiki:Electric field"
          }
        ]
      }
    },
    {
      "id": "charge-in-matter",
      "name": "Charge in matter",
      "color": "magenta",
      "fact": "Conductors hold electrons free to roam; insulators hold their charge fixed in place. Rubbing two materials together can transfer charge — the triboelectric effect — leaving an object with motionless net charge: static electricity.",
      "terms": [
        "conductor",
        "insulator",
        "static electricity",
        "triboelectric effect"
      ],
      "seeds": [
        "conductor",
        "insulator"
      ],
      "termInfo": {
        "conductor": {
          "text": "A material — metal, saltwater, graphite — with charges free to move through it; excess charge spreads over its surface and drains to any contact. The word was coined by John Desaguliers after Stephen Gray's conduction experiments.",
          "links": [
            {
              "href": "wiki:Electrical conductor"
            }
          ]
        },
        "insulator": {
          "text": "A material whose charges are bound in place — glass, rubber, plastic — so it can hold a separated or excess charge indefinitely. Desaguliers' name for Gray's non-conductors.",
          "links": [
            {
              "href": "wiki:Insulator (electricity)"
            }
          ]
        },
        "static electricity": {
          "text": "The phenomenon of nonzero net charge at rest on a surface: the crackle of a sweater, the spark from a doorknob. 'Static' because the charge is not flowing.",
          "links": [
            {
              "href": "wiki:Static electricity"
            }
          ]
        },
        "triboelectric effect": {
          "text": "Charge transfer between two materials pressed and separated — the ancient amber-on-wool observation that gives electricity its name (ēlektron, amber).",
          "links": [
            {
              "href": "wiki:Triboelectric effect"
            }
          ]
        }
      },
      "info": {
        "text": "Where charge can and cannot move: the two material classes, how rubbing transfers charge, and why stuck-on charge stays stuck.",
        "links": [
          {
            "href": "wiki:Static electricity"
          }
        ]
      }
    },
    {
      "id": "polarization-and-induction",
      "name": "Polarization and induction",
      "color": "olive",
      "fact": "A nearby charge redistributes charge in a neutral object without touching it: free electrons shift in a conductor, molecules stretch into tiny dipoles in an insulator. The near side ends up with opposite charge — which is why charged things attract uncharged ones.",
      "terms": [
        "electric polarization",
        "electrostatic induction",
        "electric dipole"
      ],
      "seeds": [
        "electric polarization",
        "electrostatic induction"
      ],
      "termInfo": {
        "electric polarization": {
          "text": "The slight separation of positive and negative charge within an object — negative shifted toward a nearby positive charge, positive away — so the object stays neutral overall but acts charged locally.",
          "links": [
            {
              "href": "wiki:Polarization density"
            }
          ]
        },
        "electrostatic induction": {
          "text": "Redistribution of charge in an object caused by a nearby charge, without contact. Ground the object meanwhile and it can be left with a real net charge of the opposite sign — charging by induction, found by Stephen Gray.",
          "links": [
            {
              "href": "wiki:Electrostatic induction"
            }
          ]
        },
        "electric dipole": {
          "text": "A pair of equal and opposite charges separated by a small distance — the stretched-molecule state an insulator's molecules take in a field.",
          "links": [
            {
              "href": "wiki:Electric dipole moment"
            }
          ]
        }
      },
      "info": {
        "text": "The contactless response: how a nearby charge polarizes a neutral object and induces charge separation — the mechanism behind charged-attracts-neutral.",
        "links": [
          {
            "href": "wiki:Electrostatic induction"
          }
        ]
      }
    },
    {
      "id": "potential-and-voltage",
      "name": "Potential and voltage",
      "color": "brown",
      "fact": "Electric potential is potential energy per unit charge at a point, measured against a reference. Voltage is the difference in potential between two points, and equipotential surfaces connect points at the same potential.",
      "terms": [
        "electric potential",
        "voltage",
        "equipotential"
      ],
      "seeds": [
        "electric potential",
        "voltage"
      ],
      "termInfo": {
        "electric potential": {
          "text": "Potential energy per unit charge at a point, in volts (joules per coulomb), measured against a reference such as infinity; a positive charge slides from high potential to low, like a ball down a hill.",
          "links": [
            {
              "href": "wiki:Electric potential"
            }
          ]
        },
        "voltage": {
          "text": "The difference in electric potential between two points — what '12 volts' across a battery terminal pair means; it is volts, not a stored substance.",
          "links": [
            {
              "href": "wiki:Voltage"
            }
          ]
        },
        "equipotential": {
          "text": "A surface of constant potential: no work is done moving a charge along it, and field lines meet it at right angles.",
          "links": [
            {
              "href": "wiki:Equipotential"
            }
          ]
        }
      },
      "info": {
        "text": "The energy view: potential as a value at each point, voltage as the difference between two points, equipotentials as level surfaces where no work is done.",
        "links": [
          {
            "href": "wiki:Electric potential"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-electric-force",
      "term": "electric force",
      "clusters": [
        0,
        1
      ],
      "fact": "The two signs of charge are what Coulomb's law quantifies: the electric force between charges — push for like signs, pull for unlike — grows with the product of the charges and falls with the square of the distance.",
      "info": {
        "text": "The push or pull between stationary charges; also called the electrostatic or Coulomb force.",
        "links": [
          {
            "href": "wiki:Coulomb's law"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "electric charge",
        "Coulomb's law"
      ]
    },
    {
      "id": "bridge-force-per-unit-charge",
      "term": "force per unit charge",
      "clusters": [
        1,
        2
      ],
      "fact": "The field is defined by dividing the electrostatic force on a test charge by that charge, E = F/q — so the field of a point charge follows straight from Coulomb's law, replacing action at a distance with a condition of space itself.",
      "info": {
        "text": "The defining division behind the field: force on a test charge divided by that charge.",
        "links": [
          {
            "href": "wiki:Electric field"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "electrostatic force",
        "electric field"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-potential-gradient",
      "term": "potential gradient",
      "clusters": [
        2,
        5
      ],
      "fact": "The field points down the potential hill (E = −∇φ): equipotential surfaces cut field lines at right angles, and moving a charge along one takes no work at all.",
      "info": {
        "text": "The rate at which potential changes with position — the slope of the potential hill the field follows.",
        "links": [
          {
            "href": "wiki:Electric field"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "field line",
        "equipotential"
      ]
    },
    {
      "id": "bridge-electrical-conduction",
      "term": "electrical conduction",
      "clusters": [
        0,
        3
      ],
      "fact": "Whether an object keeps a net charge depends on its material: conduction lets charge flow away or spread through a conductor, while an insulator traps charge in place — which is exactly what makes static electricity stick around.",
      "info": {
        "text": "The movement of charge through a material — free in conductors, blocked in insulators.",
        "links": [
          {
            "href": "wiki:Electrical conductor"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "electric charge",
        "static electricity"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 0
      }
    },
    {
      "id": "bridge-charged-attracts-neutral",
      "term": "why charged attracts neutral",
      "clusters": [
        2,
        4
      ],
      "fact": "No contact is needed: the charged object's field polarizes a neutral one, pulling opposite charge to the near side — an induced attraction strong enough to lift paper or stick a rubbed balloon to the wall.",
      "info": {
        "text": "The field does the touching: polarization by a field creates opposite-sign charge on the near side, and unlike charges attract.",
        "links": [
          {
            "href": "wiki:Electrostatic induction"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "electric field",
        "electric polarization"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 4
      }
    },
    {
      "id": "bridge-free-and-bound-charge",
      "term": "free and bound charge",
      "clusters": [
        3,
        4
      ],
      "fact": "Conductors and insulators answer a nearby charge in their own ways: conductors relocate free electrons across the whole object, while insulators only shift bound charge within each molecule — two limits of the same induction mechanism.",
      "info": {
        "text": "The two forms charge takes in matter: free charge that roams (conduction electrons) and bound charge fixed to atoms and molecules.",
        "links": [
          {
            "href": "wiki:Electric charge"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "conductor",
        "electric polarization"
      ]
    },
    {
      "id": "bridge-work-against-force",
      "term": "work against the electric force",
      "clusters": [
        5,
        1
      ],
      "fact": "Potential is defined by the work per charge of moving against the electric force; the potential of a point charge is Coulomb's law integrated over distance — the same interaction in energy language.",
      "info": {
        "text": "Pushing a charge against the electric force stores energy: work per unit charge is exactly what potential measures.",
        "links": [
          {
            "href": "wiki:Electric potential"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "electric potential",
        "electrostatic force"
      ]
    }
  ],
  "lenses": [
    {
      "id": "lens-bookkeeping",
      "prompt": "Which terms are statements about how much charge sits somewhere — the unit packet, a charged atom, or net zero?",
      "explanation": "These three pin down amounts: the indivisible packet (e), an atom carrying extra or missing charge, and perfect balance. Conservation of charge is a law about totals never changing, not an amount; electric charge is the property itself, not a specific quantity present.",
      "targets": [
        "elementary charge",
        "ion",
        "electrically neutral"
      ],
      "reasons": {
        "elementary charge": "The quantum e — the smallest amount that can sit anywhere.",
        "ion": "An atom whose proton–electron balance is off by whole units of e.",
        "electrically neutral": "Net amount exactly zero."
      }
    },
    {
      "id": "lens-law-shape",
      "prompt": "Coulomb's law is the full relation. Which two terms name its distance-falloff pattern and the apparatus that first measured it?",
      "explanation": "The pattern is the inverse-square law (double the distance, quarter the force); the instrument was Coulomb's torsion balance. Coulomb's law itself is the whole equation — charges and distance together — and the electrostatic force is the quantity it computes, not the pattern or the device.",
      "targets": [
        "inverse-square law",
        "torsion balance"
      ],
      "reasons": {
        "inverse-square law": "The falloff shape shared with Newtonian gravity.",
        "torsion balance": "The twisted-fiber apparatus of Coulomb's 1785 measurement."
      }
    },
    {
      "id": "lens-field-toolkit",
      "prompt": "Which terms belong to working with a field — probing it, drawing it, combining many sources?",
      "explanation": "The toolkit: a test charge probes without disturbing, field lines draw, superposition combines. The electric field itself is the thing being probed, drawn, and summed — not one of the ways of working with it.",
      "targets": [
        "test charge",
        "field line",
        "superposition principle"
      ],
      "reasons": {
        "test charge": "The vanishingly small probe behind E = F/q.",
        "field line": "Faraday's picture of direction and strength.",
        "superposition principle": "The vector-addition rule for multiple source charges."
      }
    },
    {
      "id": "lens-static-story",
      "prompt": "Which terms explain how an object becomes statically charged and why the charge stays put?",
      "explanation": "Rubbing transfers charge (triboelectric effect), the excess sits as motionless net charge (static electricity), and it stays put because an insulator's charges are bound — a conductor would drain it away. Conductor is the excluded opposite: it is what static charge could NOT sit on.",
      "targets": [
        "triboelectric effect",
        "static electricity",
        "insulator"
      ],
      "reasons": {
        "triboelectric effect": "The rubbing that transfers electrons between materials.",
        "static electricity": "The motionless net charge that results.",
        "insulator": "Bound charges: the reason excess charge cannot leave."
      }
    },
    {
      "id": "lens-induction-steps",
      "prompt": "A charged rod lifts neutral paper without touching it. Which terms name the steps of that trick?",
      "explanation": "First the rod's electric field reaches across the gap; then induction redistributes charge in the paper; polarization is the resulting separation — opposite charge nearer the rod — so the net attraction follows. The electric dipole is the shape the paper's molecules take, not a step in the mechanism, and the electrostatic force is the final attraction, not how it is achieved.",
      "targets": [
        "electric field",
        "electrostatic induction",
        "electric polarization"
      ],
      "reasons": {
        "electric field": "Reaches across the gap — no contact needed.",
        "electrostatic induction": "Charge redistributes in the neutral object.",
        "electric polarization": "Opposite charge ends up on the near side; unlike charges attract."
      }
    },
    {
      "id": "lens-comparing-potential",
      "prompt": "Potential has a value at every point. Which terms compare that value across locations rather than define it at one?",
      "explanation": "Voltage is the difference between two points; an equipotential joins points sharing the same value, so the difference across it is zero. Electric potential itself is the at-a-point definition — the quantity the other two compare.",
      "targets": [
        "voltage",
        "equipotential"
      ],
      "reasons": {
        "voltage": "Potential difference between two points — a battery's job to maintain.",
        "equipotential": "All points equal: zero difference, zero work moving along it."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "current-and-circuits",
        "reason": "Next rung of the ladder: the charges this board introduces at rest become the currents that do work — this board's conductors and potential carry straight over.",
        "via": [
          "conductor",
          "voltage"
        ]
      },
      {
        "id": "magnetism-and-induction",
        "reason": "The board that closes the circle: moving charge — currents — turns out to be the source of all magnetism, and changing fields push back.",
        "via": [
          "conservation of charge",
          "electric field"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Physics at a distance",
    "summary": "Trace electrostatics from charge as a conserved property to the field, induction, and the potential landscape — the ladder every electrical idea stands on.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Rub a balloon on your hair and it will stick to a wall. Nothing touched the wall. The explanation runs through the ideas this subject teaches, in a strict order: what charge is, how charges push and pull, how a charge fills space with a field, what charge does inside materials, and how the whole story can be retold in the language of energy.\r\n\r\nStart with charge itself. It is not a substance or a fluid; it is a property that matter carries, in two signs that Benjamin Franklin named positive and negative. Two facts make charge easy to bookkeep. First, it is quantized: every bit of charge is a whole-number multiple of the elementary charge, the tiny amount one electron or proton carries. Rubbing does not create charge — it transfers electrons between surfaces, the triboelectric effect, discovered when the ancients rubbed amber and it attracted lint. Second, it is conserved: the total charge of an isolated system never changes. An object with extra charge is negatively charged, one with a deficit is positive, an atom that gained or lost electrons is an ion, and an object with exactly equal positive and negative charge is electrically neutral — net zero. A charged object's stuck-on excess is static electricity, and it stays put only on insulators, because a conductor would let it drain away.\r\n\r\nHow strongly do two charges interact? Coulomb's law answers with a force along the line between them, proportional to the product of the two charges and to the inverse square of the separation — the same inverse-square pattern gravity follows, which is why an inverse-square law is a family resemblance among forces. Coulomb confirmed it in 1785 with a torsion balance, measuring the twist of a suspended bar pushed by repulsion. Like signs repel, opposite signs attract: that asymmetry between the two signs is what the law quantifies.\r\n\r\nCoulomb's law, though, describes a force reaching across empty space — action at a distance, which physicists found philosophically uncomfortable. The field idea replaces it. Each charge fills the space around it with an electric field, defined as the force per unit charge that a vanishingly small test charge would feel at each point. The field is a property of space itself: it exists whether or not another charge is around to feel it. Fields from several charges add vectorially — the superposition principle — and field lines draw the picture, their direction the way a positive charge would be pushed, their density the field's strength. Bring a charged object near a neutral one and its field does something remarkable: it polarizes the neutral object, shifting free electrons through a conductor or stretching each molecule into a tiny electric dipole in an insulator. The near side acquires opposite charge, so the two attract — no contact required. That is electrostatic induction, and it is why the balloon holds the wall.\r\n\r\nFinally, the energy retelling. Force describes pushes; potential describes hills. The electric potential at a point is the potential energy per unit charge a small charge would have there, measured against a reference like infinity. A voltage — the word from the fact that potential is measured in volts — is the difference in potential between two points, the thing a battery maintains between its terminals. Equipotential surfaces connect points of equal potential, cutting field lines at right angles, and moving a charge along one takes no work. The field, it turns out, always points down the potential hill.\r\n\r\nCharge, force, field, matter, potential: five rungs, one ladder. Every electrical device — wire, battery, motor, radio — stands on it."
    },
    "links": [
      {
        "href": "wiki:Electric charge"
      },
      {
        "href": "wiki:Electric field"
      },
      {
        "href": "wiki:Electric potential"
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
      "puzzleId": "electric-charge-and-field",
      "puzzleRevision": "fnv1a32:1284f980",
      "board": {
        "width": 1170,
        "height": 750
      },
      "nodes": {
        "term:electric charge": {
          "x": 809.5,
          "y": 525.95,
          "pinned": true
        },
        "term:ion": {
          "x": 992.86,
          "y": 513.59,
          "pinned": true
        },
        "term:elementary charge": {
          "x": 661.28,
          "y": 634.65,
          "pinned": true
        },
        "term:conservation of charge": {
          "x": 1006.03,
          "y": 592.23,
          "pinned": true
        },
        "term:electrically neutral": {
          "x": 835.32,
          "y": 646.15,
          "pinned": true
        },
        "term:Coulomb's law": {
          "x": 492.35,
          "y": 406.14,
          "pinned": true
        },
        "term:electrostatic force": {
          "x": 575.97,
          "y": 330.46,
          "pinned": true
        },
        "term:inverse-square law": {
          "x": 347.43,
          "y": 435.11,
          "pinned": true
        },
        "term:torsion balance": {
          "x": 398.33,
          "y": 334.68,
          "pinned": true
        },
        "term:electric field": {
          "x": 784.93,
          "y": 161.03,
          "pinned": true
        },
        "term:field line": {
          "x": 900.86,
          "y": 246.21,
          "pinned": true
        },
        "term:test charge": {
          "x": 969.56,
          "y": 44.8,
          "pinned": true
        },
        "term:superposition principle": {
          "x": 811.55,
          "y": 48.96,
          "pinned": true
        },
        "term:conductor": {
          "x": 151.33,
          "y": 620.97,
          "pinned": true
        },
        "term:insulator": {
          "x": 242.24,
          "y": 512.21,
          "pinned": true
        },
        "term:static electricity": {
          "x": 359.54,
          "y": 664.11,
          "pinned": true
        },
        "term:triboelectric effect": {
          "x": 304.85,
          "y": 586.2,
          "pinned": true
        },
        "term:electric polarization": {
          "x": 306.23,
          "y": 155.87,
          "pinned": true
        },
        "term:electrostatic induction": {
          "x": 271.97,
          "y": 83.02,
          "pinned": true
        },
        "term:electric dipole": {
          "x": 388.56,
          "y": 228.62,
          "pinned": true
        },
        "term:electric potential": {
          "x": 1033.53,
          "y": 330.18,
          "pinned": true
        },
        "term:voltage": {
          "x": 1085.02,
          "y": 436.37,
          "pinned": true
        },
        "term:equipotential": {
          "x": 1090.08,
          "y": 254.9,
          "pinned": true
        },
        "term:electric force": {
          "x": 603.34,
          "y": 482.11,
          "pinned": true
        },
        "term:force per unit charge": {
          "x": 702.29,
          "y": 249,
          "pinned": true
        },
        "term:potential gradient": {
          "x": 1001.33,
          "y": 169.72,
          "pinned": true
        },
        "term:electrical conduction": {
          "x": 540.23,
          "y": 564.41,
          "pinned": true
        },
        "term:why charged attracts neutral": {
          "x": 587.46,
          "y": 105.29,
          "pinned": true
        },
        "term:free and bound charge": {
          "x": 148.18,
          "y": 311.84,
          "pinned": true
        },
        "term:work against the electric force": {
          "x": 830.96,
          "y": 415.98,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6103.86,
        "score": 6103.856047910081
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:17:03.069Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "electric-charge-and-field",
      "puzzleRevision": "fnv1a32:1284f980",
      "board": {
        "width": 1170,
        "height": 750
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 396.77,
          "y": 146.75,
          "pinned": true
        },
        "cluster:1": {
          "x": 1021.43,
          "y": 182.34,
          "pinned": true
        },
        "cluster:2": {
          "x": 417.54,
          "y": 597.77,
          "pinned": true
        },
        "cluster:3": {
          "x": 143.58,
          "y": 462.86,
          "pinned": true
        },
        "cluster:4": {
          "x": 724.68,
          "y": 259.1,
          "pinned": true
        },
        "cluster:5": {
          "x": 958.28,
          "y": 611.72,
          "pinned": true
        }
      },
      "bridges": {
        "term:electric force": {
          "x": 645.35,
          "y": 59.17,
          "pinned": true
        },
        "term:force per unit charge": {
          "x": 775.67,
          "y": 514.96,
          "pinned": true
        },
        "term:potential gradient": {
          "x": 676.78,
          "y": 652.77,
          "pinned": true
        },
        "term:electrical conduction": {
          "x": 237.22,
          "y": 300.99,
          "pinned": true
        },
        "term:why charged attracts neutral": {
          "x": 656.17,
          "y": 427.92,
          "pinned": true
        },
        "term:free and bound charge": {
          "x": 434.83,
          "y": 408.2,
          "pinned": true
        },
        "term:work against the electric force": {
          "x": 989.6,
          "y": 420.74,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "electric charge",
          "ion",
          "elementary charge",
          "conservation of charge",
          "electrically neutral"
        ],
        "cluster:1": [
          "Coulomb's law",
          "electrostatic force",
          "inverse-square law",
          "torsion balance"
        ],
        "cluster:2": [
          "electric field",
          "field line",
          "test charge",
          "superposition principle"
        ],
        "cluster:3": [
          "conductor",
          "insulator",
          "static electricity",
          "triboelectric effect"
        ],
        "cluster:4": [
          "electric polarization",
          "electrostatic induction",
          "electric dipole"
        ],
        "cluster:5": [
          "electric potential",
          "voltage",
          "equipotential"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "ion",
          "elementary charge",
          "conservation of charge",
          "electrically neutral",
          "electric charge"
        ],
        "cluster:1": [
          "Coulomb's law",
          "inverse-square law",
          "electrostatic force",
          "torsion balance"
        ],
        "cluster:2": [
          "test charge",
          "electric field",
          "superposition principle",
          "field line"
        ],
        "cluster:3": [
          "insulator",
          "static electricity",
          "triboelectric effect",
          "conductor"
        ],
        "cluster:4": [
          "electric dipole",
          "electrostatic induction",
          "electric polarization"
        ],
        "cluster:5": [
          "voltage",
          "electric potential",
          "equipotential"
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
        "totalLength": 3211.596012331625
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:22:00.987Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "electric-charge-and-field",
      "puzzleRevision": "fnv1a32:1284f980",
      "board": {
        "width": 1170,
        "height": 750
      },
      "nodes": {
        "term:electric charge": {
          "x": 863.33,
          "y": 278.91
        },
        "term:ion": {
          "x": 845.8,
          "y": 104.18
        },
        "term:elementary charge": {
          "x": 961.98,
          "y": 49.95
        },
        "term:conservation of charge": {
          "x": 1060.73,
          "y": 103.72
        },
        "term:electrically neutral": {
          "x": 1042.28,
          "y": 281.17
        },
        "term:Coulomb's law": {
          "x": 988.66,
          "y": 437.11
        },
        "term:electrostatic force": {
          "x": 823.32,
          "y": 473.5
        },
        "term:inverse-square law": {
          "x": 1089.16,
          "y": 504.6
        },
        "term:torsion balance": {
          "x": 1073.5,
          "y": 664.37
        },
        "term:electric field": {
          "x": 358.96,
          "y": 476.08
        },
        "term:field line": {
          "x": 434.62,
          "y": 544.48
        },
        "term:test charge": {
          "x": 157.01,
          "y": 636.86
        },
        "term:superposition principle": {
          "x": 143.36,
          "y": 488.27
        },
        "term:conductor": {
          "x": 501.1,
          "y": 157.05
        },
        "term:insulator": {
          "x": 588.66,
          "y": 32.98
        },
        "term:static electricity": {
          "x": 598.1,
          "y": 252.43
        },
        "term:triboelectric effect": {
          "x": 764.8,
          "y": 32.98
        },
        "term:electric polarization": {
          "x": 346.26,
          "y": 280.47
        },
        "term:electrostatic induction": {
          "x": 132.21,
          "y": 117.66
        },
        "term:electric dipole": {
          "x": 307.19,
          "y": 102.86
        },
        "term:electric potential": {
          "x": 742.85,
          "y": 724.01
        },
        "term:voltage": {
          "x": 609.3,
          "y": 679.08
        },
        "term:equipotential": {
          "x": 485.3,
          "y": 713.71
        },
        "term:electric force": {
          "x": 843.57,
          "y": 369.47
        },
        "term:force per unit charge": {
          "x": 592.24,
          "y": 402.1
        },
        "term:potential gradient": {
          "x": 425.93,
          "y": 627.16
        },
        "term:electrical conduction": {
          "x": 764.61,
          "y": 201.7
        },
        "term:why charged attracts neutral": {
          "x": 212.63,
          "y": 367.93
        },
        "term:free and bound charge": {
          "x": 439.29,
          "y": 42.96
        },
        "term:work against the electric force": {
          "x": 847.88,
          "y": 646.14
        },
        "cluster:0": {
          "x": 922.49,
          "y": 166.2
        },
        "cluster:1": {
          "x": 946.84,
          "y": 581.84
        },
        "cluster:2": {
          "x": 254.38,
          "y": 567.03
        },
        "cluster:3": {
          "x": 629.25,
          "y": 101.82
        },
        "cluster:4": {
          "x": 243.68,
          "y": 210.72
        },
        "cluster:5": {
          "x": 645.56,
          "y": 577.01
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T02:19:09.111Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-19T02:22:29.486Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
