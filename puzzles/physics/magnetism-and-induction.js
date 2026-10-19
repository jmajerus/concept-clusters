// Generated from content/puzzles/magnetism-and-induction.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "magnetism-and-induction",
  "title": "Magnetism and Induction — The Moving-Charge Connection",
  "category": "physics",
  "subcategories": {
    "physics": "electromagnetism"
  },
  "info": {
    "text": "Magnetism closes the circle electrostatics opened: moving charge makes magnetic fields, fields push sideways on moving charges, and a changing magnetic flux induces current — Faraday's law, the principle behind generators and transformers. Sorting these terms reconstructs the story of one connection with two directions.",
    "links": [
      {
        "href": "wiki:Magnetism"
      }
    ],
    "citations": [
      {
        "title": "Magnetism -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Magnetism"
      },
      {
        "title": "Magnetic field -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Magnetic_field"
      },
      {
        "title": "Lorentz force -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Lorentz_force"
      },
      {
        "title": "Faraday's law of induction -- Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Faraday%27s_law_of_induction"
      }
    ]
  },
  "clusters": [
    {
      "id": "magnets-and-poles",
      "name": "Magnets and poles",
      "color": "teal",
      "fact": "Every magnet has two poles — like poles repel, unlike attract — and no isolated pole has ever been found: cut a magnet and you get two smaller dipoles. Ferromagnetism explains why: atomic moments align into domains, which line up in a field and lose that alignment at the Curie temperature.",
      "terms": [
        "magnetic pole",
        "ferromagnetism",
        "magnetic domain",
        "curie temperature",
        "magnetic dipole"
      ],
      "seeds": [
        "magnetic pole",
        "ferromagnetism"
      ],
      "termInfo": {
        "magnetic pole": {
          "text": "One of a magnet's two ends — north and south by compass convention; like poles repel, unlike attract, and cutting a magnet always yields both.",
          "links": [
            {
              "href": "wiki:Magnet"
            }
          ]
        },
        "ferromagnetism": {
          "text": "The strong magnetism of iron and its kin, in which atomic moments align with neighbors — the only class that makes permanent magnets ordinary.",
          "links": [
            {
              "href": "wiki:Ferromagnetism"
            }
          ]
        },
        "magnetic domain": {
          "text": "A patch of a ferromagnet whose atomic moments point together; a magnetized material has its domains aligned, an unmagnetized one has them pointing every which way.",
          "links": [
            {
              "href": "wiki:Magnetic domain"
            }
          ]
        },
        "curie temperature": {
          "text": "The temperature above which thermal motion destroys domain alignment and ferromagnetism gives way to mere paramagnetism.",
          "links": [
            {
              "href": "wiki:Curie temperature"
            }
          ]
        },
        "magnetic dipole": {
          "text": "The two-pole object — a bar magnet, a current loop, an atom with spin — that no cutting can split into separate poles.",
          "links": [
            {
              "href": "wiki:Magnetic dipole"
            }
          ]
        }
      },
      "info": {
        "text": "The object-level facts: two poles, no isolated pole, and the domain story of why iron magnets at all.",
        "links": [
          {
            "href": "wiki:Magnetism"
          }
        ]
      }
    },
    {
      "id": "the-field-map",
      "name": "The field map",
      "color": "blue",
      "fact": "The magnetic field is a vector field filling the space around a magnet or a current. Its field lines run in closed loops from pole to pole; a compass traces their direction and iron filings reveal their pattern.",
      "terms": [
        "magnetic field",
        "magnetic field line",
        "compass",
        "iron filings"
      ],
      "seeds": [
        "magnetic field",
        "magnetic field line"
      ],
      "termInfo": {
        "magnetic field": {
          "text": "The vector field B filling the space around a magnet or current, steering other magnets and moving charges; measured in teslas.",
          "links": [
            {
              "href": "wiki:Magnetic field"
            }
          ]
        },
        "magnetic field line": {
          "text": "The picture of the field: curves running in closed loops from pole to pole, tangent everywhere to the field direction.",
          "links": [
            {
              "href": "wiki:Field line"
            }
          ]
        },
        "compass": {
          "text": "A pivoting magnetic needle — a small dipole that points along the local field; Oersted's instrument of discovery.",
          "links": [
            {
              "href": "wiki:Compass"
            }
          ]
        },
        "iron filings": {
          "text": "Sprinkled filings align with the field like tiny compasses, sketching the whole line pattern around a magnet in one glance.",
          "links": [
            {
              "href": "wiki:Magnetic field"
            }
          ]
        }
      },
      "info": {
        "text": "The field-level picture: a vector field around magnets and currents, drawn as closed loops and probed by compass and filings.",
        "links": [
          {
            "href": "wiki:Magnetic field"
          }
        ]
      }
    },
    {
      "id": "currents-make-magnetism",
      "name": "Currents make magnetism",
      "color": "amber",
      "fact": "Moving charge makes magnetism: Oersted's 1820 compass deflection under a wire was the first hint, and a current through a solenoid coil concentrates the effect into an electromagnet you can switch on and off.",
      "terms": [
        "electromagnet",
        "Oersted's discovery",
        "solenoid",
        "moving charge"
      ],
      "seeds": [
        "electromagnet",
        "Oersted's discovery"
      ],
      "termInfo": {
        "electromagnet": {
          "text": "A coil wound on an iron core whose magnetism appears with the current and vanishes without it — strength you can switch.",
          "links": [
            {
              "href": "wiki:Electromagnet"
            }
          ]
        },
        "Oersted's discovery": {
          "text": "Hans Christian Oersted's 1820 observation that a current deflects a nearby compass — the first evidence that electricity makes magnetism.",
          "links": [
            {
              "href": "wiki:Hans Christian Ørsted"
            }
          ]
        },
        "solenoid": {
          "text": "A helical coil whose loops' fields add into a strong, uniform bar-magnet field inside — the geometry behind electromagnets.",
          "links": [
            {
              "href": "wiki:Solenoid"
            }
          ]
        },
        "moving charge": {
          "text": "The unifier: magnetism is what moving charge does. Currents, orbital electrons, spinning atoms — all fields trace back to charge in motion.",
          "links": [
            {
              "href": "wiki:Magnetism"
            }
          ]
        }
      },
      "info": {
        "text": "The first direction: moving charge as the source of every magnetic field, from Oersted's twitch to the switchable electromagnet.",
        "links": [
          {
            "href": "wiki:Electromagnet"
          }
        ]
      }
    },
    {
      "id": "the-magnetic-force",
      "name": "The magnetic force",
      "color": "magenta",
      "fact": "A magnetic field pushes moving charge sideways — the Lorentz force, perpendicular to both velocity and field, sized qvB and remembered through the right-hand rule. Bent sideways at constant speed, the charge runs in a circle: the cyclotron motion that steers particles.",
      "terms": [
        "Lorentz force",
        "right-hand rule",
        "cyclotron motion"
      ],
      "seeds": [
        "Lorentz force",
        "right-hand rule"
      ],
      "termInfo": {
        "Lorentz force": {
          "text": "The combined electric and magnetic force on a charge; its magnetic part, qv×B, pushes sideways — perpendicular to both velocity and field, doing no work.",
          "links": [
            {
              "href": "wiki:Lorentz force"
            }
          ]
        },
        "right-hand rule": {
          "text": "The direction mnemonic: point the fingers along v, curl toward B, and the thumb gives the force on a positive charge.",
          "links": [
            {
              "href": "wiki:Right-hand rule"
            }
          ]
        },
        "cyclotron motion": {
          "text": "The circular path of a charge in a steady magnetic field — the sideways force bends the trajectory at constant speed, the principle of cyclotrons.",
          "links": [
            {
              "href": "wiki:Cyclotron"
            }
          ]
        }
      },
      "info": {
        "text": "The push back: a sideways force on moving charge, its rule of thumb, and the circular motion it produces.",
        "links": [
          {
            "href": "wiki:Lorentz force"
          }
        ]
      }
    },
    {
      "id": "electromagnetic-induction",
      "name": "Electromagnetic induction",
      "color": "olive",
      "fact": "Faraday's law of induction: the emf induced in a loop equals the rate of change of its magnetic flux — the field-line count through it — with Lenz's minus sign demanding the induced current oppose the change. Only change induces; steady fields do nothing.",
      "terms": [
        "Faraday's law of induction",
        "magnetic flux",
        "Lenz's law",
        "electromagnetic induction"
      ],
      "seeds": [
        "Faraday's law of induction",
        "magnetic flux"
      ],
      "termInfo": {
        "Faraday's law of induction": {
          "text": "The induced emf around a loop equals minus the rate of change of magnetic flux through it — Michael Faraday's 1831 result, the law behind every generator.",
          "links": [
            {
              "href": "wiki:Faraday's law of induction"
            }
          ]
        },
        "magnetic flux": {
          "text": "The field-line count through a loop: field strength times area times orientation. Only its CHANGE induces anything.",
          "links": [
            {
              "href": "wiki:Magnetic flux"
            }
          ]
        },
        "Lenz's law": {
          "text": "The direction rule behind Faraday's minus sign: the induced current opposes the change in flux that produced it.",
          "links": [
            {
              "href": "wiki:Lenz's law"
            }
          ]
        },
        "electromagnetic induction": {
          "text": "The phenomenon as a whole: currents induced by changing magnetic fields, discovered by Faraday in 1831 and, independently, by Joseph Henry.",
          "links": [
            {
              "href": "wiki:Electromagnetic induction"
            }
          ]
        }
      },
      "info": {
        "text": "The second direction: changing flux induces emf — Faraday's law, Lenz's minus sign, and the flux bookkeeping underneath.",
        "links": [
          {
            "href": "wiki:Electromagnetic induction"
          }
        ]
      }
    },
    {
      "id": "induction-at-work",
      "name": "Induction at work",
      "color": "brown",
      "fact": "The payoff machines: Faraday's disk generator turned motion into the first continuous induced current, a transformer trades voltage for current through a shared flux, and the galvanometer's twitch was how the whole effect was discovered.",
      "terms": [
        "electric generator",
        "transformer",
        "galvanometer"
      ],
      "seeds": [
        "electric generator",
        "transformer"
      ],
      "termInfo": {
        "electric generator": {
          "text": "Faraday's disk (1831) was the first: motion through a field inducing continuous current. Every power station is this principle at scale.",
          "links": [
            {
              "href": "wiki:Electric generator"
            }
          ]
        },
        "transformer": {
          "text": "Two coils sharing one core's flux: alternating current in one induces current in the other at a traded voltage — up for transmission, down for use.",
          "links": [
            {
              "href": "wiki:Transformer"
            }
          ]
        },
        "galvanometer": {
          "text": "The needle-and-coil detector whose brief deflections in Faraday's iron-ring experiment revealed induction; the instrument that first saw the effect.",
          "links": [
            {
              "href": "wiki:Galvanometer"
            }
          ]
        }
      },
      "info": {
        "text": "The payoff: generate, transform, detect — Faraday's law running the grid.",
        "links": [
          {
            "href": "wiki:Electric generator"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-field-maps-poles",
      "term": "the field the compass maps",
      "clusters": [
        1,
        0
      ],
      "fact": "Every pole pair is a dipole with field lines running pole to pole; the compass needle and iron filings simply trace that map, and domains are the tiny aligned dipoles inside the magnet.",
      "info": {
        "text": "Pole pairs are dipoles; the field-line map is their portrait, traced by compass and filings.",
        "links": [
          {
            "href": "wiki:Magnetic field"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "magnetic field line",
        "magnetic dipole"
      ]
    },
    {
      "id": "bridge-currents-as-sources",
      "term": "currents as field sources",
      "clusters": [
        2,
        1
      ],
      "fact": "Oersted's 1820 deflection showed a current makes a magnetic field; wind the wire into a solenoid and the loops' fields add into an electromagnet — moving charge is the source of the mapped field.",
      "info": {
        "text": "Moving charge is the source: current makes the field the lines map.",
        "links": [
          {
            "href": "wiki:Electromagnet"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "Oersted's discovery",
        "magnetic field"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "bridge-sideways-push",
      "term": "the sideways push",
      "clusters": [
        1,
        3
      ],
      "fact": "The field's force on a moving charge is sideways — perpendicular to both velocity and field, F = qvB — bending the path into a circle: the line map made dynamic.",
      "info": {
        "text": "The field made dynamic: a sideways force on any charge moving through it.",
        "links": [
          {
            "href": "wiki:Lorentz force"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "magnetic field",
        "Lorentz force"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "bridge-flux-counts-lines",
      "term": "flux counts the lines",
      "clusters": [
        4,
        1
      ],
      "fact": "Magnetic flux is the field-line count through a loop, and Faraday's law says its rate of change — not its mere presence — is what induces an emf.",
      "info": {
        "text": "Flux is the line count through a loop; its rate of change is what induces an emf.",
        "links": [
          {
            "href": "wiki:Magnetic flux"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "magnetic flux",
        "magnetic field line"
      ]
    },
    {
      "id": "bridge-reverse-question",
      "term": "the reverse question",
      "clusters": [
        2,
        4
      ],
      "fact": "Oersted showed electricity makes magnetism, and the reverse question — can magnetism make electricity? — defeated every static arrangement until Faraday moved the field in 1831: only change induces current.",
      "info": {
        "text": "Oersted 1820 posed it; Faraday 1831 answered it: only a CHANGING field induces.",
        "links": [
          {
            "href": "wiki:Electromagnetic induction"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "Oersted's discovery",
        "electromagnetic induction"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 4
      }
    },
    {
      "id": "bridge-machines-from-law",
      "term": "machines from the law",
      "clusters": [
        5,
        4
      ],
      "fact": "Faraday's disk, the first generator, turns motion into induced current; a transformer trades voltage for current through a shared flux; the galvanometer's twitch announced the effect. Each machine is Faraday's law wearing a crank or a core.",
      "info": {
        "text": "Generate, transform, detect: Faraday's law embodied in machinery.",
        "links": [
          {
            "href": "wiki:Electric generator"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "electric generator",
        "Faraday's law of induction"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 5
      }
    },
    {
      "id": "bridge-force-converse",
      "term": "force and its converse",
      "clusters": [
        5,
        3
      ],
      "fact": "The motor turns because a magnetic force pushes its currents sideways; the generator works because motion through a field induces current — one connection, two directions.",
      "info": {
        "text": "Motor: force pushes currents. Generator: motion induces current. One connection, two directions.",
        "links": [
          {
            "href": "wiki:Lorentz force"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "electric generator",
        "Lorentz force"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-domain-story",
      "prompt": "Which terms tell the story of a permanent magnet's strength — where it comes from and the heat that destroys it?",
      "explanation": "Domains carry the strength: a magnet is a ferromagnet whose domains all align. The Curie temperature is the undoing — past it, alignment shakes apart. Ferromagnetism is the capability of the material class, not the mechanism or the undoing; magnetic pole is a location, not a source of strength.",
      "targets": [
        "magnetic domain",
        "curie temperature"
      ],
      "reasons": {
        "magnetic domain": "Aligned patches of atomic moments — the strength's mechanism.",
        "curie temperature": "The heat that scrambles alignment and erases the magnet."
      }
    },
    {
      "id": "lens-field-probes",
      "prompt": "Which two tools reveal a magnetic field — one its direction, one its whole pattern?",
      "explanation": "A compass needle, a pivoting dipole, points along the local field; iron filings freeze into the full line pattern at once. The magnetic field and its field lines are what gets revealed, not the revealers.",
      "targets": [
        "compass",
        "iron filings"
      ],
      "reasons": {
        "compass": "Direction, wherever the needle settles.",
        "iron filings": "The entire pattern, sketched in one sprinkle."
      }
    },
    {
      "id": "lens-first-direction",
      "prompt": "Which terms name the 1820 discovery and the coil geometry that turns it into a switchable magnet?",
      "explanation": "Oersted's discovery showed current deflects a compass; the solenoid concentrates that effect into a strong, uniform field. The electromagnet is the finished device this produces, and moving charge is the deeper reason it all works — beyond the discovery and its geometry.",
      "targets": [
        "Oersted's discovery",
        "solenoid"
      ],
      "reasons": {
        "Oersted's discovery": "Electricity makes magnetism — first seen in a twitching needle.",
        "solenoid": "Loop after loop, the fields add."
      }
    },
    {
      "id": "lens-sideways-behavior",
      "prompt": "Which terms describe how the magnetic force behaves on a moving charge?",
      "explanation": "The Lorentz force is the sideways push itself, the right-hand rule remembers its direction, and cyclotron motion is the circular path that results — bend only, never speed-up. The magnetic field is the pusher, not the push's behavior.",
      "targets": [
        "Lorentz force",
        "right-hand rule",
        "cyclotron motion"
      ],
      "reasons": {
        "Lorentz force": "Perpendicular to velocity and field alike — qv×B.",
        "right-hand rule": "Which of the two sideways ways it points.",
        "cyclotron motion": "Sideways-only force means circles at constant speed."
      }
    },
    {
      "id": "lens-only-change",
      "prompt": "A strong magnet sits motionless inside a coil and no current flows. Which terms explain what WOULD make current flow, and which way it would run?",
      "explanation": "What matters is the magnetic flux through the coil and its rate of change — Faraday's law ties induced emf to that rate, and Lenz's law fixes the direction: the induced current opposes the change. Electromagnetic induction names the phenomenon, but the flux, the law, and the minus sign do the explaining.",
      "targets": [
        "magnetic flux",
        "Faraday's law of induction",
        "Lenz's law"
      ],
      "reasons": {
        "magnetic flux": "The quantity that must change — line count through the loop.",
        "Faraday's law of induction": "emf equals the rate of change of flux.",
        "Lenz's law": "Direction chosen to oppose the change."
      }
    },
    {
      "id": "lens-law-wears-machines",
      "prompt": "Which terms are induction's machines rather than its laws or quantities?",
      "explanation": "The generator turns motion into current, the transformer trades voltage against current through shared flux, and the galvanometer detected the effect first. Faraday's law, Lenz's law, and magnetic flux are the principles the machines embody.",
      "targets": [
        "electric generator",
        "transformer",
        "galvanometer"
      ],
      "reasons": {
        "electric generator": "Motion in, continuous current out.",
        "transformer": "Voltage traded for current across a shared core.",
        "galvanometer": "The twitching needle that saw it first."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "electric-charge-and-field",
        "reason": "The first rung: charges, fields, and field lines — this board's magnetic field map is the same idea with the sign of the story flipped.",
        "via": [
          "magnetic field",
          "magnetic field line"
        ]
      },
      {
        "id": "current-and-circuits",
        "reason": "The moving-charge board: the currents this board takes as given were defined there, and the galvanometer twitch that revealed induction IS a current question.",
        "via": [
          "moving charge",
          "galvanometer"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One connection, two directions",
    "summary": "From lodestones and compasses to the law that powers the grid: poles, the field map, current-made magnetism, the sideways force, and induction.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "A magnetized needle floating on water, as the ancients noticed, swings north. Magnetism began as a curiosity about strange stones and became, two thousand years later, the principle behind the electric grid. The story runs through five ideas: what magnets are, the field they fill space with, the discovery that electricity makes magnetism, the force magnetism exerts back on moving charges, and the reverse step — changing magnetism making electricity — that closes the circle.\r\n\r\nStart with the stones. Every magnet has two poles, conventionally north and south: like poles repel, unlike attract, and no one has ever isolated a single pole — cut a bar magnet in half and you hold two complete smaller magnets. The deep reason is that every magnet is a magnetic dipole, a two-pole object all the way down. In iron and a few other ferromagnetic materials, each atom carries a tiny magnetic moment, and neighboring atoms align into patches called domains; a permanent magnet is a material whose domains all point one way. Heat the magnet past its Curie temperature and the alignment shakes apart — the magnetism simply evaporates.\r\n\r\nAround every magnet spreads a magnetic field, a vector field that fills space and steers other magnets and moving charges. We picture it with magnetic field lines, loops that run pole to pole outside the magnet (and continue through its inside). A compass needle is just a small dipole pivoting to point along the local field; iron filings sprinkled on paper above a bar magnet freeze into the full pattern, each filing a tiny compass.\r\n\r\nThe modern story opens in 1820, when Hans Christian Oersted noticed a compass needle twitch whenever current flowed in a nearby wire: electricity makes magnetism. The effect is ordinary moving charge. Wind that wire into a coil — a solenoid — and the loops' fields add into a strong bar-magnet field with the switch still in your hand: the electromagnet, which lifts cars in a scrapyard and clicks in every doorbell.\r\n\r\nA field, in turn, pushes back on moving charges — but sideways. The magnetic part of the Lorentz force acts perpendicular to both the charge's velocity and the field, with size qvB; the right-hand rule remembers its direction. Because the push is always sideways, it can speed nothing up — it only bends the path, holding the charge in a circle: the cyclotron motion that steers particles around accelerators and pins electrons to Earth's field as auroras.\r\n\r\nIf current makes a magnetic field, does magnetism make current? Every static arrangement said no — until Michael Faraday in 1831 moved things. What matters, he found, is change: the emf induced in a loop equals the rate of change of its magnetic flux — the count of field lines through the loop. Move a magnet into a coil and current flows; hold it still and it stops. The minus sign in Faraday's law is Lenz's law: the induced current runs whichever way opposes the change that made it, nature resisting the push.\r\n\r\nThat law, wearing machines, runs the world. Faraday's own disk generator was the first: spin a conductor in a field and induction drives a continuous current — every power station since is that idea at scale. A transformer shares its flux between two coils, trading voltage for current as the grid needs. And the galvanometer, the needle-in-a-coil detector whose twitch announced the effect in Faraday's iron-ring experiment, remains the symbol of the discovery. Electricity and magnetism are one subject: a connection with two directions."
    },
    "links": [
      {
        "href": "wiki:Magnetism"
      },
      {
        "href": "wiki:Magnetic field"
      },
      {
        "href": "wiki:Electromagnetic induction"
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
      "puzzleId": "magnetism-and-induction",
      "puzzleRevision": "fnv1a32:43db5dd9",
      "board": {
        "width": 1310,
        "height": 850
      },
      "nodes": {
        "term:magnetic pole": {
          "x": 732.67,
          "y": 633.36,
          "pinned": true
        },
        "term:ferromagnetism": {
          "x": 699.92,
          "y": 767.87,
          "pinned": true
        },
        "term:magnetic domain": {
          "x": 569.47,
          "y": 699.59,
          "pinned": true
        },
        "term:curie temperature": {
          "x": 864.82,
          "y": 706.95,
          "pinned": true
        },
        "term:magnetic dipole": {
          "x": 566.18,
          "y": 619.01,
          "pinned": false
        },
        "term:magnetic field": {
          "x": 183.09,
          "y": 435.89,
          "pinned": true
        },
        "term:magnetic field line": {
          "x": 414.05,
          "y": 557.33,
          "pinned": true
        },
        "term:compass": {
          "x": 259.03,
          "y": 545.69,
          "pinned": true
        },
        "term:iron filings": {
          "x": 114.54,
          "y": 555.98,
          "pinned": true
        },
        "term:electromagnet": {
          "x": 622.53,
          "y": 293.37,
          "pinned": true
        },
        "term:Oersted's discovery": {
          "x": 524.74,
          "y": 353,
          "pinned": true
        },
        "term:solenoid": {
          "x": 743.22,
          "y": 253.79,
          "pinned": true
        },
        "term:moving charge": {
          "x": 491.09,
          "y": 239.7,
          "pinned": true
        },
        "term:Lorentz force": {
          "x": 636.73,
          "y": 164.68,
          "pinned": true
        },
        "term:right-hand rule": {
          "x": 735.1,
          "y": 74.23,
          "pinned": true
        },
        "term:cyclotron motion": {
          "x": 531.19,
          "y": 73.84,
          "pinned": true
        },
        "term:Faraday's law of induction": {
          "x": 1098.27,
          "y": 612.54,
          "pinned": true
        },
        "term:magnetic flux": {
          "x": 913.64,
          "y": 582.87,
          "pinned": true
        },
        "term:Lenz's law": {
          "x": 1107.87,
          "y": 709.13,
          "pinned": true
        },
        "term:electromagnetic induction": {
          "x": 967.22,
          "y": 501.95,
          "pinned": true
        },
        "term:electric generator": {
          "x": 1065.23,
          "y": 237.74,
          "pinned": true
        },
        "term:transformer": {
          "x": 1193.45,
          "y": 296.55,
          "pinned": true
        },
        "term:galvanometer": {
          "x": 1138.11,
          "y": 167.55,
          "pinned": false
        },
        "term:the field the compass maps": {
          "x": 328.97,
          "y": 678.35,
          "pinned": true
        },
        "term:currents as field sources": {
          "x": 406.98,
          "y": 441.69,
          "pinned": true
        },
        "term:the sideways push": {
          "x": 320.09,
          "y": 147.79,
          "pinned": true
        },
        "term:flux counts the lines": {
          "x": 678.95,
          "y": 475.11,
          "pinned": false
        },
        "term:the reverse question": {
          "x": 851.45,
          "y": 380.43,
          "pinned": true
        },
        "term:machines from the law": {
          "x": 1141.34,
          "y": 415.31,
          "pinned": true
        },
        "term:force and its converse": {
          "x": 870.74,
          "y": 165.04,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6763.4,
        "score": 6763.396974952571
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:56:54.322Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "magnetism-and-induction",
      "puzzleRevision": "fnv1a32:43db5dd9",
      "board": {
        "width": 1310,
        "height": 850
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 399.99,
          "y": 271.88,
          "pinned": true
        },
        "cluster:1": {
          "x": 812.55,
          "y": 181.62,
          "pinned": true
        },
        "cluster:2": {
          "x": 1170.59,
          "y": 390.86,
          "pinned": true
        },
        "cluster:3": {
          "x": 209.67,
          "y": 492.24,
          "pinned": true
        },
        "cluster:4": {
          "x": 895.04,
          "y": 637.06,
          "pinned": true
        },
        "cluster:5": {
          "x": 425.23,
          "y": 698.21,
          "pinned": true
        }
      },
      "bridges": {
        "term:the field the compass maps": {
          "x": 643.61,
          "y": 340.96,
          "pinned": true
        },
        "term:currents as field sources": {
          "x": 960.75,
          "y": 318.28,
          "pinned": true
        },
        "term:the sideways push": {
          "x": 286,
          "y": 64.31,
          "pinned": true
        },
        "term:flux counts the lines": {
          "x": 795.02,
          "y": 423.93,
          "pinned": true
        },
        "term:the reverse question": {
          "x": 1140.37,
          "y": 659.35,
          "pinned": true
        },
        "term:machines from the law": {
          "x": 669.34,
          "y": 722.52,
          "pinned": true
        },
        "term:force and its converse": {
          "x": 487.36,
          "y": 490.73,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "magnetic pole",
          "ferromagnetism",
          "magnetic domain",
          "curie temperature",
          "magnetic dipole"
        ],
        "cluster:1": [
          "magnetic field",
          "magnetic field line",
          "compass",
          "iron filings"
        ],
        "cluster:2": [
          "electromagnet",
          "Oersted's discovery",
          "solenoid",
          "moving charge"
        ],
        "cluster:3": [
          "Lorentz force",
          "right-hand rule",
          "cyclotron motion"
        ],
        "cluster:4": [
          "Faraday's law of induction",
          "magnetic flux",
          "Lenz's law",
          "electromagnetic induction"
        ],
        "cluster:5": [
          "electric generator",
          "transformer",
          "galvanometer"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "magnetic pole",
          "magnetic domain",
          "curie temperature",
          "magnetic dipole",
          "ferromagnetism"
        ],
        "cluster:1": [
          "iron filings",
          "magnetic field",
          "magnetic field line",
          "compass"
        ],
        "cluster:2": [
          "electromagnet",
          "Oersted's discovery",
          "moving charge",
          "solenoid"
        ],
        "cluster:3": [
          "Lorentz force",
          "cyclotron motion",
          "right-hand rule"
        ],
        "cluster:4": [
          "magnetic flux",
          "Faraday's law of induction",
          "electromagnetic induction",
          "Lenz's law"
        ],
        "cluster:5": [
          "transformer",
          "electric generator",
          "galvanometer"
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
        "totalLength": 3159.337487580267
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:46:15.062Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "magnetism-and-induction",
      "puzzleRevision": "fnv1a32:43db5dd9",
      "board": {
        "width": 1310,
        "height": 850
      },
      "nodes": {
        "term:magnetic pole": {
          "x": 649.55,
          "y": 169.69
        },
        "term:ferromagnetism": {
          "x": 347.25,
          "y": 163.43
        },
        "term:magnetic domain": {
          "x": 491.41,
          "y": 196.01
        },
        "term:curie temperature": {
          "x": 291.44,
          "y": 96.94
        },
        "term:magnetic dipole": {
          "x": 649.19,
          "y": 72.24
        },
        "term:magnetic field": {
          "x": 975.23,
          "y": 263.4
        },
        "term:magnetic field line": {
          "x": 1160.99,
          "y": 169.67
        },
        "term:compass": {
          "x": 821.25,
          "y": 188.86
        },
        "term:iron filings": {
          "x": 926.71,
          "y": 123.63
        },
        "term:electromagnet": {
          "x": 659.45,
          "y": 552.63
        },
        "term:Oersted's discovery": {
          "x": 851.14,
          "y": 541.93
        },
        "term:solenoid": {
          "x": 585.81,
          "y": 483.68
        },
        "term:moving charge": {
          "x": 764.91,
          "y": 358.06
        },
        "term:Lorentz force": {
          "x": 447.67,
          "y": 381.48
        },
        "term:right-hand rule": {
          "x": 149.19,
          "y": 396.72
        },
        "term:cyclotron motion": {
          "x": 296.96,
          "y": 440.18
        },
        "term:Faraday's law of induction": {
          "x": 1077.58,
          "y": 780.45
        },
        "term:magnetic flux": {
          "x": 1194.01,
          "y": 562.47
        },
        "term:Lenz's law": {
          "x": 1046.55,
          "y": 588.95
        },
        "term:electromagnetic induction": {
          "x": 924.33,
          "y": 673.04
        },
        "term:electric generator": {
          "x": 341.76,
          "y": 694.63
        },
        "term:transformer": {
          "x": 215.96,
          "y": 542
        },
        "term:galvanometer": {
          "x": 120.15,
          "y": 703.08
        },
        "term:the field the compass maps": {
          "x": 1039.09,
          "y": 72.24
        },
        "term:currents as field sources": {
          "x": 1001.62,
          "y": 436.41
        },
        "term:the sideways push": {
          "x": 689.47,
          "y": 254.68
        },
        "term:flux counts the lines": {
          "x": 1211.01,
          "y": 405.16
        },
        "term:the reverse question": {
          "x": 662.91,
          "y": 677.28
        },
        "term:machines from the law": {
          "x": 669.31,
          "y": 780.49
        },
        "term:force and its converse": {
          "x": 447.51,
          "y": 564.41
        },
        "cluster:0": {
          "x": 473.13,
          "y": 72.24
        },
        "cluster:1": {
          "x": 954.66,
          "y": 196.14
        },
        "cluster:2": {
          "x": 765.03,
          "y": 436
        },
        "cluster:3": {
          "x": 273.83,
          "y": 295.71
        },
        "cluster:4": {
          "x": 1166.07,
          "y": 671.1
        },
        "cluster:5": {
          "x": 212.21,
          "y": 619.44
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T02:57:10.289Z"
    }
  },
  "board": {
    "sizeFactor": 1.25,
    "source": "author",
    "savedAt": "2026-10-19T02:57:12.320Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
