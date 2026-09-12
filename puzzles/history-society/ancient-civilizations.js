// Generated from content/puzzles/ancient-civilizations.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "ancient-civilizations",
  "title": "Ancient civilizations",
  "category": "history-society",
  "clusters": [
    {
      "id": "mesopotamia",
      "name": "Mesopotamia",
      "color": "teal",
      "fact": "Mesopotamia, between the Tigris and Euphrates, gave rise to the first cities and the earliest writing.",
      "terms": [
        "cuneiform",
        "ziggurat",
        "Tigris-Euphrates",
        "Hammurabi's Code"
      ],
      "seeds": [
        "cuneiform",
        "ziggurat"
      ],
      "termInfo": {
        "cuneiform": {
          "links": [
            {
              "href": "wiki:Cuneiform"
            }
          ]
        },
        "ziggurat": {
          "links": [
            {
              "href": "wiki:Ziggurat"
            }
          ]
        },
        "Tigris-Euphrates": {
          "links": [
            {
              "href": "wiki:Tigris–Euphrates river system"
            }
          ]
        },
        "Hammurabi's Code": {
          "text": "One of the earliest written law codes, carved in stone under the Babylonian king Hammurabi around 1750 BCE.",
          "links": [
            {
              "href": "wiki:Code of Hammurabi"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Mesopotamia"
          }
        ]
      }
    },
    {
      "id": "ancient-egypt",
      "name": "Ancient Egypt",
      "color": "blue",
      "fact": "Ancient Egypt built a civilization along the Nile, unified under pharaohs and famous for monumental architecture.",
      "terms": [
        "pharaoh",
        "Nile",
        "pyramid",
        "hieroglyphics"
      ],
      "seeds": [
        "pharaoh",
        "Nile"
      ],
      "termInfo": {
        "pharaoh": {
          "links": [
            {
              "href": "wiki:Pharaoh"
            }
          ]
        },
        "Nile": {
          "links": [
            {
              "href": "wiki:Nile"
            }
          ]
        },
        "pyramid": {
          "links": [
            {
              "href": "wiki:Pyramid"
            }
          ]
        },
        "hieroglyphics": {
          "text": "Ancient Egypt's writing system, combining pictorial and phonetic symbols.",
          "links": [
            {
              "href": "wiki:Egyptian hieroglyphs"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Ancient Egypt"
          }
        ]
      }
    },
    {
      "id": "indus-valley",
      "name": "Indus Valley",
      "color": "amber",
      "fact": "The Indus Valley civilization built precisely planned cities with advanced sanitation, long before most of the ancient world.",
      "terms": [
        "Mohenjo-daro",
        "standardized weights",
        "drainage",
        "Indus script"
      ],
      "seeds": [
        "Mohenjo-daro",
        "standardized weights"
      ],
      "termInfo": {
        "Mohenjo-daro": {
          "links": [
            {
              "href": "wiki:Mohenjo-daro"
            }
          ]
        },
        "standardized weights": {
          "text": "Uniform stone weights found across Indus Valley sites, suggesting a shared system of trade and measurement spanning the whole civilization.",
          "links": [
            {
              "href": "wiki:Indus Valley Civilisation"
            }
          ]
        },
        "drainage": {
          "links": [
            {
              "href": "wiki:Drainage"
            }
          ]
        },
        "Indus script": {
          "text": "The Indus Valley's system of symbols, found on seals and pottery — still undeciphered today.",
          "links": [
            {
              "href": "wiki:Indus script"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Indus Valley Civilisation"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "writing-system",
      "term": "writing system",
      "clusters": [
        0,
        1
      ],
      "fact": "Writing systems bridge the two: cuneiform and hieroglyphics both emerged as river-valley civilizations needed to track trade and law.",
      "info": {
        "links": [
          {
            "href": "wiki:Writing system"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "cuneiform",
        null
      ]
    },
    {
      "id": "trade",
      "term": "trade",
      "clusters": [
        1,
        2
      ],
      "fact": "Trade bridges the two: Egyptian and Indus Valley merchants exchanged goods across the Arabian Sea, linking two of the era's great river civilizations.",
      "info": {
        "links": [
          {
            "href": "wiki:Trade"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "standardized weights"
      ]
    }
  ]
});
