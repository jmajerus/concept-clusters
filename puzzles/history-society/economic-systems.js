// Concept Clusters puzzle: Economic systems
// Category: History & Society
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "economic-systems",
  "title": "Economic systems",
  "category": "History & Society",
  "clusters": [
    {
      "name": "Capitalism",
      "info": {
        "link": "wiki:Capitalism"
      },
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
          "link": "wiki:Private property"
        },
        "competition": {
          "link": "wiki:Competition"
        },
        "profit": {
          "text": "The money left over after a business's costs are subtracted from its revenue.",
          "link": "wiki:Profit (economics)"
        },
        "supply and demand": {
          "text": "The market forces that set prices: how much of something is available, and how much people want it.",
          "link": "wiki:Supply and demand"
        }
      }
    },
    {
      "name": "Socialism",
      "info": {
        "link": "wiki:Socialism"
      },
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
          "link": "wiki:Collective ownership"
        },
        "central planning": {
          "link": "wiki:Planned economy"
        },
        "public services": {
          "link": "wiki:Public service"
        },
        "means of production": {
          "text": "The factories, land, and tools used to produce goods — socialism holds these should be collectively or state owned rather than privately.",
          "link": "wiki:Means of production"
        }
      }
    },
    {
      "name": "Mixed economy",
      "info": {
        "link": "wiki:Mixed economy"
      },
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
          "link": "wiki:Regulation"
        },
        "welfare state": {
          "link": "wiki:Welfare state"
        },
        "public-private": {
          "link": "wiki:Public–private partnership"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "markets",
      "clusters": [
        0,
        2
      ],
      "fact": "Markets bridge the two: mixed economies keep capitalism's competitive markets but layer regulation on top.",
      "idealTerms": [
        "competition",
        "regulation"
      ],
      "info": {
        "text": "A system where buyers and sellers exchange goods, coordinated through prices rather than central planning.",
        "link": "wiki:Market (economics)"
      }
    },
    {
      "term": "taxation",
      "clusters": [
        1,
        2
      ],
      "relationKind": "cross-cutting",
      "fact": "Taxation bridges the two: it funds socialism's public services and a mixed economy's welfare state alike.",
      "idealTerms": [
        "public services",
        "welfare state"
      ],
      "info": {
        "link": "wiki:Tax"
      }
    }
  ]
};
