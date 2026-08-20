// Generated from content/puzzles/acids-bases-and-ph.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "acids-bases-and-ph",
  "title": "Acids, bases, and pH",
  "category": "Chemistry",
  "tags": [
    "chemistry",
    "acids",
    "bases",
    "pH"
  ],
  "info": {
    "text": "Acids donate protons and bases accept them; in water that transfer sets hydronium and hydroxide concentrations, which pH reports on a logarithmic scale.",
    "link": "https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases",
    "citations": [
      {
        "title": "Brønsted-Lowry Acids and Bases",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases"
      },
      {
        "title": "pH and pOH",
        "author": "Paul Flowers et al.",
        "publisher": "OpenStax",
        "year": "2019",
        "url": "https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh"
      }
    ]
  },
  "relatedPuzzles": {
    "info": {
      "text": "Place proton transfer between the ions that move and the equilibrium constant that constrains them in water."
    },
    "entries": [
      {
        "id": "building-atoms-and-ions",
        "reason": "Review how charge on an ion is counted before treating H+ as a transferred proton."
      },
      {
        "id": "energy-rate-and-equilibrium",
        "reason": "Treat Kw as an equilibrium constant that keeps [H3O+] and [OH−] inversely paired."
      },
      {
        "id": "reading-chemical-reactions",
        "reason": "Write acid and base ionization as balanced equations with hydronium or hydroxide among the products."
      }
    ]
  },
  "lenses": [
    {
      "id": "transferring-a-proton",
      "prompt": "Which concepts name the roles and aqueous ions when a proton moves from an acid to a base?",
      "explanation": "An acid is a proton donor and a base is a proton acceptor. In water the donated hydrogen appears as hydronium and the complementary ion as hydroxide.",
      "targets": [
        "acid",
        "hydronium",
        "proton donor",
        "base",
        "hydroxide",
        "proton acceptor"
      ]
    },
    {
      "id": "reporting-ion-concentrations",
      "prompt": "Which concepts belong in an account of what pH and pOH measure, and of why a neutral solution has equal ion concentrations?",
      "explanation": "pH and pOH are logarithmic reports of hydronium and hydroxide molarity. The ion-product of water keeps those concentrations inversely paired, so a neutral solution is the point where they are equal rather than a property of the acid or base that was added.",
      "targets": [
        "pH",
        "pOH",
        "neutral solution",
        "hydronium",
        "hydroxide",
        "ion-product of water"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-donating-protons",
      "name": "Donating protons",
      "color": "teal",
      "fact": "An acid is a proton donor; in water the donated hydrogen appears as hydronium.",
      "terms": [
        "acid",
        "hydronium",
        "proton donor"
      ],
      "seeds": [
        "acid",
        "hydronium"
      ],
      "info": {
        "link": "wiki:Acid"
      }
    },
    {
      "id": "cluster-accepting-protons",
      "name": "Accepting protons",
      "color": "blue",
      "fact": "A base is a proton acceptor; in water that uptake produces hydroxide.",
      "terms": [
        "base",
        "hydroxide",
        "proton acceptor"
      ],
      "seeds": [
        "base",
        "hydroxide"
      ],
      "info": {
        "link": "wiki:Base (chemistry)"
      }
    },
    {
      "id": "cluster-ph-scale",
      "name": "The pH scale",
      "color": "amber",
      "fact": "pH uses a logarithmic scale to report hydronium concentration; pOH reports hydroxide the same way, and a neutral solution is the point where those concentrations are equal.",
      "terms": [
        "pH",
        "neutral solution",
        "pOH",
        "logarithmic scale"
      ],
      "seeds": [
        "pH",
        "neutral solution"
      ],
      "info": {
        "link": "wiki:pH"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-conjugate-pair",
      "term": "conjugate pair",
      "clusters": [
        0,
        1
      ],
      "fact": "When an acid donates a proton, the remainder is a base; the protonated base is an acid. The two species that differ by that one proton are a conjugate pair.",
      "termRole": "reference",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Conjugate acid"
      },
      "idealTerms": [
        "proton donor",
        "proton acceptor"
      ]
    },
    {
      "id": "bridge-ion-product-of-water",
      "term": "ion-product of water",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "The ion-product of water, Kw = [H3O+][OH−], ties hydronium and hydroxide together so that raising one lowers the other and a neutral solution sits where they are equal.",
      "termRole": "reference",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Self-ionization of water"
      },
      "idealTerms": [
        "hydronium",
        "hydroxide",
        "neutral solution"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Cursor",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "SpaceXAI",
      "date": "2026-08-20"
    },
    {
      "system": "Cursor",
      "scope": "lenses",
      "role": "edited",
      "provider": "SpaceXAI",
      "date": "2026-08-20"
    }
  ]
});
