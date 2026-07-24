// Concept Clusters puzzle: Fundamental forces of physics
// Category: Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "fundamental-forces",
  "title": "Fundamental forces of physics",
  "category": "Science",
  "large": true,
  "clusters": [
    {
      "name": "Gravity",
      "info": {
        "link": "wiki:Gravity"
      },
      "color": "green",
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
          "link": "wiki:Mass"
        },
        "spacetime curvature": {
          "link": "wiki:Curved spacetime"
        },
        "universal attraction": {
          "text": "Newton's own term for gravity: the idea that every mass pulls on every other mass, without exception.",
          "link": "wiki:Newton's law of universal gravitation"
        },
        "escape velocity": {
          "link": "wiki:Escape velocity"
        }
      }
    },
    {
      "name": "Electromagnetism",
      "info": {
        "link": "wiki:Electromagnetism"
      },
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
          "link": "wiki:Electric charge"
        },
        "photon": {
          "link": "wiki:Photon"
        },
        "magnetic field": {
          "link": "wiki:Magnetic field"
        },
        "Coulomb's law": {
          "text": "The law describing the force between two electric charges — stronger when the charges are larger, weaker as the distance between them grows.",
          "link": "wiki:Coulomb's law"
        }
      }
    },
    {
      "name": "Strong nuclear force",
      "info": {
        "link": "wiki:Strong interaction"
      },
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
          "link": "wiki:Quark"
        },
        "gluons": {
          "link": "wiki:Gluon"
        },
        "nuclear binding energy": {
          "link": "wiki:Nuclear binding energy"
        },
        "confinement": {
          "text": "The rule that quarks are never observed alone — the strong force grows stronger with distance, permanently trapping them inside particles like protons.",
          "link": "wiki:Color confinement"
        }
      }
    },
    {
      "name": "Weak nuclear force",
      "info": {
        "link": "wiki:Weak interaction"
      },
      "color": "rose",
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
          "link": "wiki:Beta decay"
        },
        "neutrino": {
          "link": "wiki:Neutrino"
        },
        "radioactive decay": {
          "link": "wiki:Radioactive decay"
        },
        "flavor change": {
          "text": "In particle physics, a quark or lepton transforming into a different type (\"flavor\") of itself — exactly what the weak force alone can make happen.",
          "link": "wiki:Flavour (particle physics)"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "field",
      "clusters": [
        0,
        1
      ],
      "fact": "Field bridges the two: gravity and electromagnetism are both classically described as continuous fields reaching across all of space, unlike the short-range strong and weak forces confined to the nucleus.",
      "idealTerms": [
        "spacetime curvature",
        "magnetic field"
      ],
      "info": {
        "text": "A quantity with a value at every point in space — how forces like gravity and electromagnetism are classically described as reaching across distance.",
        "link": "wiki:Field (physics)"
      }
    },
    {
      "term": "the atomic nucleus",
      "clusters": [
        2,
        3
      ],
      "fact": "The atomic nucleus bridges the two: both forces act only within it — the strong force binds it together, and the weak force can transform particles inside it, triggering radioactive decay.",
      "idealTerms": [
        "nuclear binding energy",
        "radioactive decay"
      ],
      "info": {
        "text": "The dense core of protons and neutrons at the center of an atom.",
        "link": "wiki:Atomic nucleus"
      }
    },
    {
      "term": "electroweak unification",
      "clusters": [
        1,
        3
      ],
      "fact": "Electroweak unification bridges the two: at extremely high energies, the electromagnetic and weak forces merge into a single force, as shown by the Standard Model of particle physics.",
      "idealTerms": [
        "photon",
        "flavor change"
      ],
      "info": {
        "link": "wiki:Electroweak interaction"
      }
    }
  ]
};
