// Generated from content/puzzles/building-atoms-and-ions.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "building-atoms-and-ions",
  "title": "Building atoms and ions",
  "category": "chemistry",
  "large": true,
  "tags": [
    "chemistry",
    "atoms",
    "elements",
    "ions",
    "periodic table"
  ],
  "info": {
    "text": "Atomic structure separates three questions that are often blurred together: what fixes an element's identity, what contributes most of its mass, and what gives an atom a net charge.",
    "citations": [
      {
        "title": "Atomic Structure and Symbolism",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-inside-the-nucleus",
      "name": "Inside the nucleus",
      "color": "teal",
      "fact": "A tiny nucleus contains positively charged protons and uncharged neutrons; together they contribute nearly all atomic mass, while proton count sets the nucleus's positive charge.",
      "terms": [
        "proton",
        "neutron",
        "mass number",
        "nuclear charge"
      ],
      "seeds": [
        "proton",
        "neutron"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Atomic nucleus"
          }
        ]
      }
    },
    {
      "id": "cluster-arranging-electrons",
      "name": "Arranging electrons",
      "color": "blue",
      "fact": "Electron configuration describes how negatively charged electrons occupy shells around the nucleus, with the outermost valence electrons most directly involved in bonding.",
      "terms": [
        "electron",
        "electron shell",
        "valence electron",
        "electron configuration"
      ],
      "seeds": [
        "electron",
        "valence electron"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Electron configuration"
          }
        ]
      }
    },
    {
      "id": "cluster-identifying-an-element",
      "name": "Identifying an element",
      "color": "amber",
      "fact": "Atomic number counts protons and uniquely identifies an element; symbols and periodic groups organize those identities and recurring properties.",
      "terms": [
        "atomic number",
        "element symbol",
        "periodic group"
      ],
      "seeds": [
        "atomic number",
        "element symbol"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Chemical element"
          }
        ]
      }
    },
    {
      "id": "cluster-isotopes-and-atomic-mass",
      "name": "Isotopes and atomic mass",
      "color": "magenta",
      "fact": "Isotopes of one element vary in neutron number; their natural abundances determine the weighted average atomic mass reported on a periodic table.",
      "terms": [
        "isotope",
        "isotopic abundance",
        "average atomic mass"
      ],
      "seeds": [
        "isotope",
        "average atomic mass"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Isotope"
          }
        ]
      }
    },
    {
      "id": "cluster-ions-and-charge",
      "name": "Ions and charge",
      "color": "olive",
      "fact": "Ions vary in electron count: losing electrons makes a positive cation, while gaining electrons makes a negative anion.",
      "terms": [
        "ion",
        "cation",
        "anion",
        "net charge"
      ],
      "seeds": [
        "cation",
        "anion"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Ion"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-atom",
      "term": "atom",
      "clusters": [
        0,
        1
      ],
      "fact": "An atom joins a compact nucleus to a much larger electron cloud; these parts jointly determine its mass, charge, and interactions.",
      "info": {
        "links": [
          {
            "href": "wiki:Atom"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "proton",
        "electron"
      ]
    },
    {
      "id": "bridge-element",
      "term": "element",
      "clusters": [
        0,
        2
      ],
      "fact": "An element is defined by its proton count, the same quantity recorded as atomic number in the periodic table.",
      "info": {
        "links": [
          {
            "href": "wiki:Chemical element"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "proton",
        "atomic number"
      ]
    },
    {
      "id": "bridge-electron-count",
      "term": "electron count",
      "clusters": [
        1,
        4
      ],
      "fact": "Gaining or losing electrons changes electron count and therefore net charge, producing an ion without changing the element.",
      "info": {
        "text": "The number of electrons associated with an atom or ion; compared with proton count, it determines net charge."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "electron",
        "ion"
      ]
    },
    {
      "id": "bridge-isotopic-composition",
      "term": "isotopic composition",
      "clusters": [
        0,
        3
      ],
      "fact": "Isotopic composition connects neutron-level differences to a sample's average atomic mass by recording the relative abundance of each isotope.",
      "info": {
        "links": [
          {
            "href": "wiki:Isotopic signature"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "neutron",
        "isotopic abundance"
      ]
    }
  ],
  "lenses": [
    {
      "id": "fixing-element-identity",
      "prompt": "Which concepts determine or communicate which element an atom belongs to?",
      "explanation": "The number of protons is the atomic number, which fixes the element's identity; an element symbol communicates that identity. Changing neutrons or electrons does not create a different element.",
      "targets": [
        "proton",
        "atomic number",
        "element symbol",
        "element"
      ]
    },
    {
      "id": "accounting-for-mass",
      "prompt": "Which concepts help account for the mass and nuclear variants of an atom?",
      "explanation": "Protons and neutrons supply nearly all atomic mass. Their total is the mass number, while isotopes of one element differ in neutron count.",
      "targets": [
        "proton",
        "neutron",
        "mass number",
        "isotope",
        "atom"
      ]
    },
    {
      "id": "charge-and-chemical-behavior",
      "prompt": "Which concepts connect electron arrangement with charge or recurring chemical behavior?",
      "explanation": "Valence electrons strongly influence chemical behavior, which recurs within periodic groups. A mismatch between proton and electron counts gives an ion its net charge.",
      "targets": [
        "valence electron",
        "periodic group",
        "ion",
        "net charge",
        "electron count"
      ]
    },
    {
      "id": "same-element-different-particles",
      "prompt": "Which concepts explain how atoms can remain the same element while differing in neutrons or electrons?",
      "explanation": "Atomic number fixes elemental identity. Changing neutron count creates an isotope, while changing electron count creates an ion; neither change by itself creates a different element.",
      "targets": [
        "atomic number",
        "element",
        "neutron",
        "isotope",
        "ion",
        "electron count"
      ]
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Continue from atomic structure to bonding and then to transformations of substances."
    },
    "entries": [
      {
        "id": "why-atoms-bond",
        "reason": "Use valence electrons to explain how atoms form compounds."
      },
      {
        "id": "reading-chemical-reactions",
        "reason": "Track atoms and quantities through chemical change."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
