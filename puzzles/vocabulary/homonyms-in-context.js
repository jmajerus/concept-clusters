// Generated from content/puzzles/homonyms-in-context.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "homonyms-in-context",
  "title": "Homonyms in Context",
  "category": "vocabulary",
  "info": {
    "text": "Use the surrounding sentence to distinguish two unrelated meanings of the same spelling."
  },
  "clusters": [
    {
      "id": "river-edge",
      "name": "River Edge",
      "color": "teal",
      "fact": "These terms describe the land and structures alongside a river, where water meets or reshapes the ground.",
      "terms": [
        "shore",
        "levee",
        "floodplain",
        "embankment"
      ],
      "seeds": [
        "shore",
        "levee"
      ]
    },
    {
      "id": "financial-institution",
      "name": "Financial Institution",
      "color": "blue",
      "fact": "These terms describe money placed with, borrowed from, charged by, or maintained at a financial institution.",
      "terms": [
        "deposit",
        "loan",
        "interest",
        "account"
      ],
      "seeds": [
        "deposit",
        "loan"
      ]
    }
  ],
  "bridges": [
    {
      "id": "bank",
      "term": "bank",
      "clusters": [
        0,
        1
      ],
      "fact": "Bank names both the sloping land beside a river and an institution that holds or lends money: one spelling, two unrelated senses.",
      "info": {
        "text": "Context selects the sense. A river bank is terrain; a bank handles deposits, loans, and accounts."
      }
    }
  ],
  "lenses": [
    {
      "id": "river-sense",
      "prompt": "After the river rose, the hikers climbed onto the grassy ______ above the water.",
      "explanation": "Here bank means the sloping land at a river's edge. The surrounding terms describe related river-edge features, not the financial sense.",
      "targets": [
        "bank"
      ],
      "reasons": {
        "bank": "The sentence places the word beside a river, so bank means its raised or sloping edge."
      }
    },
    {
      "id": "financial-sense",
      "prompt": "The small business asked its ______ for a loan to repair the storefront.",
      "explanation": "Here bank means a financial institution. Deposits, loans, interest, and accounts belong to this sense.",
      "targets": [
        "bank"
      ],
      "reasons": {
        "bank": "A business asks a financial institution for a loan, not a river feature."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": true
});
