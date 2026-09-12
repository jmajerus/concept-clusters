// Generated from content/puzzles/fundamental-forces.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "fundamental-forces",
  "title": "Fundamental forces of physics",
  "category": "science",
  "large": true,
  "clusters": [
    {
      "id": "gravity",
      "name": "Gravity",
      "color": "teal",
      "fact": "Gravity is the weakest fundamental force, yet it dominates at cosmic scale because mass is never negative — its pull always adds up.",
      "terms": [
        "mass",
        "spacetime curvature",
        "universal attraction",
        "escape velocity"
      ],
      "seeds": [
        "mass",
        "spacetime curvature"
      ],
      "termInfo": {
        "mass": {
          "links": [
            {
              "href": "wiki:Mass"
            }
          ]
        },
        "spacetime curvature": {
          "links": [
            {
              "href": "wiki:Curved spacetime"
            }
          ]
        },
        "universal attraction": {
          "text": "Newton's own term for gravity: the idea that every mass pulls on every other mass, without exception.",
          "links": [
            {
              "href": "wiki:Newton's law of universal gravitation"
            }
          ]
        },
        "escape velocity": {
          "links": [
            {
              "href": "wiki:Escape velocity"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Gravity"
          }
        ]
      }
    },
    {
      "id": "electromagnetism",
      "name": "Electromagnetism",
      "color": "blue",
      "fact": "Electromagnetism governs every interaction between charged particles, from lightning to the chemical bonds holding molecules together.",
      "terms": [
        "electric charge",
        "photon",
        "magnetic field",
        "Coulomb's law"
      ],
      "seeds": [
        "electric charge",
        "photon"
      ],
      "termInfo": {
        "electric charge": {
          "links": [
            {
              "href": "wiki:Electric charge"
            }
          ]
        },
        "photon": {
          "links": [
            {
              "href": "wiki:Photon"
            }
          ]
        },
        "magnetic field": {
          "links": [
            {
              "href": "wiki:Magnetic field"
            }
          ]
        },
        "Coulomb's law": {
          "text": "The law describing the force between two electric charges — stronger when the charges are larger, weaker as the distance between them grows.",
          "links": [
            {
              "href": "wiki:Coulomb's law"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Electromagnetism"
          }
        ]
      }
    },
    {
      "id": "strong-nuclear-force",
      "name": "Strong nuclear force",
      "color": "amber",
      "fact": "The strong force binds quarks into protons and neutrons, and holds the nucleus together against the electric repulsion of its own protons.",
      "terms": [
        "quarks",
        "gluons",
        "nuclear binding energy",
        "confinement"
      ],
      "seeds": [
        "quarks",
        "gluons"
      ],
      "termInfo": {
        "quarks": {
          "links": [
            {
              "href": "wiki:Quark"
            }
          ]
        },
        "gluons": {
          "links": [
            {
              "href": "wiki:Gluon"
            }
          ]
        },
        "nuclear binding energy": {
          "links": [
            {
              "href": "wiki:Nuclear binding energy"
            }
          ]
        },
        "confinement": {
          "text": "The rule that quarks are never observed alone — the strong force grows stronger with distance, permanently trapping them inside particles like protons.",
          "links": [
            {
              "href": "wiki:Color confinement"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Strong interaction"
          }
        ]
      }
    },
    {
      "id": "weak-nuclear-force",
      "name": "Weak nuclear force",
      "color": "magenta",
      "fact": "The weak force lets one type of particle transform into another, making it the force responsible for radioactive decay.",
      "terms": [
        "beta decay",
        "neutrino",
        "radioactive decay",
        "flavor change"
      ],
      "seeds": [
        "beta decay",
        "neutrino"
      ],
      "termInfo": {
        "beta decay": {
          "links": [
            {
              "href": "wiki:Beta decay"
            }
          ]
        },
        "neutrino": {
          "links": [
            {
              "href": "wiki:Neutrino"
            }
          ]
        },
        "radioactive decay": {
          "links": [
            {
              "href": "wiki:Radioactive decay"
            }
          ]
        },
        "flavor change": {
          "text": "In particle physics, a quark or lepton transforming into a different type (\"flavor\") of itself — exactly what the weak force alone can make happen.",
          "links": [
            {
              "href": "wiki:Flavour (particle physics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Weak interaction"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "field",
      "term": "field",
      "clusters": [
        0,
        1
      ],
      "fact": "Field bridges the two: gravity and electromagnetism are both classically described as continuous fields reaching across all of space, unlike the short-range strong and weak forces confined to the nucleus.",
      "info": {
        "text": "A quantity with a value at every point in space — how forces like gravity and electromagnetism are classically described as reaching across distance.",
        "links": [
          {
            "href": "wiki:Field (physics)"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "spacetime curvature",
        "magnetic field"
      ]
    },
    {
      "id": "the-atomic-nucleus",
      "term": "the atomic nucleus",
      "clusters": [
        2,
        3
      ],
      "fact": "The atomic nucleus bridges the two: both forces act only within it — the strong force binds it together, and the weak force can transform particles inside it, triggering radioactive decay.",
      "info": {
        "text": "The dense core of protons and neutrons at the center of an atom.",
        "links": [
          {
            "href": "wiki:Atomic nucleus"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "nuclear binding energy",
        "radioactive decay"
      ]
    },
    {
      "id": "electroweak-unification",
      "term": "electroweak unification",
      "clusters": [
        1,
        3
      ],
      "fact": "Electroweak unification bridges the two: at extremely high energies, the electromagnetic and weak forces merge into a single force, as shown by the Standard Model of particle physics.",
      "info": {
        "links": [
          {
            "href": "wiki:Electroweak interaction"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "photon",
        "flavor change"
      ]
    }
  ]
});
