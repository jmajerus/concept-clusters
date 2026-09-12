// Generated from content/puzzles/economic-systems.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "economic-systems",
  "title": "Economic systems",
  "category": "history-society",
  "clusters": [
    {
      "id": "capitalism",
      "name": "Capitalism",
      "color": "teal",
      "fact": "Capitalism relies on private property and competitive markets to decide what gets produced.",
      "terms": [
        "private property",
        "competition",
        "profit",
        "supply and demand"
      ],
      "seeds": [
        "private property",
        "competition"
      ],
      "termInfo": {
        "private property": {
          "links": [
            {
              "href": "wiki:Private property"
            }
          ]
        },
        "competition": {
          "links": [
            {
              "href": "wiki:Competition"
            }
          ]
        },
        "profit": {
          "text": "The money left over after a business's costs are subtracted from its revenue.",
          "links": [
            {
              "href": "wiki:Profit (economics)"
            }
          ]
        },
        "supply and demand": {
          "text": "The market forces that set prices: how much of something is available, and how much people want it.",
          "links": [
            {
              "href": "wiki:Supply and demand"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Capitalism"
          }
        ]
      }
    },
    {
      "id": "socialism",
      "name": "Socialism",
      "color": "blue",
      "fact": "Socialism emphasizes collective or state ownership of resources to reduce inequality.",
      "terms": [
        "collective ownership",
        "central planning",
        "public services",
        "means of production"
      ],
      "seeds": [
        "collective ownership",
        "central planning"
      ],
      "termInfo": {
        "collective ownership": {
          "links": [
            {
              "href": "wiki:Collective ownership"
            }
          ]
        },
        "central planning": {
          "links": [
            {
              "href": "wiki:Planned economy"
            }
          ]
        },
        "public services": {
          "links": [
            {
              "href": "wiki:Public service"
            }
          ]
        },
        "means of production": {
          "text": "The factories, land, and tools used to produce goods — socialism holds these should be collectively or state owned rather than privately.",
          "links": [
            {
              "href": "wiki:Means of production"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Socialism"
          }
        ]
      }
    },
    {
      "id": "mixed-economy",
      "name": "Mixed economy",
      "color": "amber",
      "fact": "A mixed economy combines private markets with government regulation and public programs.",
      "terms": [
        "regulation",
        "welfare state",
        "public-private"
      ],
      "seeds": [
        "regulation",
        "welfare state"
      ],
      "termInfo": {
        "regulation": {
          "links": [
            {
              "href": "wiki:Regulation"
            }
          ]
        },
        "welfare state": {
          "links": [
            {
              "href": "wiki:Welfare state"
            }
          ]
        },
        "public-private": {
          "links": [
            {
              "href": "wiki:Public–private partnership"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Mixed economy"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "markets",
      "term": "markets",
      "clusters": [
        0,
        2
      ],
      "fact": "Markets bridge the two: mixed economies keep capitalism's competitive markets but layer regulation on top.",
      "info": {
        "text": "A system where buyers and sellers exchange goods, coordinated through prices rather than central planning.",
        "links": [
          {
            "href": "wiki:Market (economics)"
          }
        ]
      },
      "idealTerms": [
        "competition",
        "regulation"
      ]
    },
    {
      "id": "taxation",
      "term": "taxation",
      "clusters": [
        1,
        2
      ],
      "fact": "Taxation bridges the two: it funds socialism's public services and a mixed economy's welfare state alike.",
      "info": {
        "links": [
          {
            "href": "wiki:Tax"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "public services",
        "welfare state"
      ]
    }
  ]
});
