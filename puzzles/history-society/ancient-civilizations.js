// Concept Clusters puzzle: Ancient civilizations
// Category: History & Society
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "ancient-civilizations",
  "title": "Ancient civilizations",
  "category": "History & Society",
  "clusters": [
    {
      "name": "Mesopotamia",
      "info": {
        "link": "wiki:Mesopotamia"
      },
      "color": "green",
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
          "link": "wiki:Cuneiform"
        },
        "ziggurat": {
          "link": "wiki:Ziggurat"
        },
        "Tigris-Euphrates": {
          "link": "wiki:Tigris–Euphrates river system"
        },
        "Hammurabi's Code": {
          "text": "One of the earliest written law codes, carved in stone under the Babylonian king Hammurabi around 1750 BCE.",
          "link": "wiki:Code of Hammurabi"
        }
      }
    },
    {
      "name": "Ancient Egypt",
      "info": {
        "link": "wiki:Ancient Egypt"
      },
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
          "link": "wiki:Pharaoh"
        },
        "Nile": {
          "link": "wiki:Nile"
        },
        "pyramid": {
          "link": "wiki:Pyramid"
        },
        "hieroglyphics": {
          "text": "Ancient Egypt's writing system, combining pictorial and phonetic symbols.",
          "link": "wiki:Egyptian hieroglyphs"
        }
      }
    },
    {
      "name": "Indus Valley",
      "info": {
        "link": "wiki:Indus Valley Civilisation"
      },
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
          "link": "wiki:Mohenjo-daro"
        },
        "standardized weights": {
          "text": "Uniform stone weights found across Indus Valley sites, suggesting a shared system of trade and measurement spanning the whole civilization.",
          "link": "wiki:Indus Valley Civilisation"
        },
        "drainage": {
          "link": "wiki:Drainage"
        },
        "Indus script": {
          "text": "The Indus Valley's system of symbols, found on seals and pottery — still undeciphered today.",
          "link": "wiki:Indus script"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "writing system",
      "clusters": [
        0,
        1
      ],
      "fact": "Writing systems bridge the two: cuneiform and hieroglyphics both emerged as river-valley civilizations needed to track trade and law.",
      "idealTerms": [
        "cuneiform",
        null
      ],
      "info": {
        "link": "wiki:Writing system"
      }
    },
    {
      "term": "trade",
      "clusters": [
        1,
        2
      ],
      "fact": "Trade bridges the two: Egyptian and Indus Valley merchants exchanged goods across the Arabian Sea, linking two of the era's great river civilizations.",
      "idealTerms": [
        null,
        "standardized weights"
      ],
      "info": {
        "link": "wiki:Trade"
      }
    }
  ]
};
