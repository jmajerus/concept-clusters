// Generated from content/puzzles/cities-and-urbanization.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "cities-and-urbanization",
  "title": "Cities and Urbanization — Humanity Concentrates",
  "category": "human-geography",
  "subcategories": {
    "human-geography": "urban-geography"
  },
  "info": {
    "text": "How geographers explain the city: why humanity concentrated, where cities spring up and why there, how size and spacing are patterned across a region, what sorts land uses inside as cities grow, and the costs that growth spills outward.",
    "links": [
      {
        "href": "wiki:Urbanization",
        "label": "Urbanization (Wikipedia)"
      },
      {
        "href": "wiki:Urban geography",
        "label": "Urban geography (Wikipedia)"
      },
      {
        "href": "wiki:Central place theory",
        "label": "Central place theory (Wikipedia)"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-shift",
      "name": "The Concentration Itself",
      "color": "teal",
      "fact": "The concentration itself: humanity’s move from countryside to city, how much and how fast, and the settlements at the extreme of the size range.",
      "terms": [
        "urbanization",
        "megacity",
        "urban growth",
        "counter-urbanization"
      ],
      "seeds": [
        "urbanization",
        "megacity"
      ],
      "termInfo": {
        "urbanization": {
          "text": "The rising share of a population living in urban places — the curve that has carried humanity from a few percent urban in 1800 to over half today.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        },
        "urban growth": {
          "text": "The absolute increase in a city’s or the world’s urban population — distinct from urbanization, which is a share; a country can urbanize while its cities shrink.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        },
        "counter-urbanization": {
          "text": "The reversal: net movement away from large cities toward small towns and the countryside, seen in the developed world since the 1970s.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        },
        "megacity": {
          "text": "An urban agglomeration of more than ten million people — Tokyo, Delhi, Shanghai — the extreme of the size range, and mostly a developing-world phenomenon now.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The big shift: from rural to urban, measured and named.",
        "links": [
          {
            "href": "wiki:Urbanization",
            "label": "Urbanization (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "founding-logic",
      "name": "Where Cities Spring Up",
      "color": "blue",
      "fact": "Where cities spring up: what the ground itself offers, what the location connects to, and the clustering logic that rewards density.",
      "terms": [
        "site",
        "situation",
        "agglomeration economies"
      ],
      "seeds": [
        "site",
        "situation"
      ],
      "termInfo": {
        "site": {
          "text": "The actual ground a city occupies — its harbor, river crossing, defensible hill, or water supply — the physical character of the location itself.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "situation": {
          "text": "A city’s position relative to the world around it — what it connects to: trade routes, hinterlands, other cities. Singapore’s site is modest; its situation is superb.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "agglomeration economies": {
          "text": "The savings and advantages that come from density itself — shared labor pools, suppliers, markets, and infrastructure — the reason activity clusters instead of spreading.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The founding layer: site, situation, and the economics of clustering.",
        "links": [
          {
            "href": "wiki:Urban geography",
            "label": "Urban geography (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "the-urban-system",
      "name": "Size and Spacing Across the Map",
      "color": "amber",
      "fact": "Size and spacing across the map: one dominant giant or a rank-size cascade, and Christaller’s market geometry of central places.",
      "terms": [
        "central place theory",
        "primate city",
        "rank-size rule",
        "range of a good",
        "threshold population"
      ],
      "seeds": [
        "central place theory",
        "primate city"
      ],
      "termInfo": {
        "central place theory": {
          "text": "Walter Christaller’s 1933 model of town spacing: settlements exist to serve surrounding markets, and their size and spacing form a regular hierarchy of hexagonal market areas.",
          "links": [
            {
              "href": "wiki:Central place theory",
              "label": "Wikipedia"
            }
          ]
        },
        "primate city": {
          "text": "A country’s largest city, outstripping the second city many times over — Bangkok, Buenos Aires, Lagos — dominating the nation’s urban hierarchy.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "rank-size rule": {
          "text": "The regularity in which the n-th largest city is about 1/n the size of the largest — a rank-size cascade, contrasted with primacy.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "range of a good": {
          "text": "How far a customer will travel for a good or service — short for bread, long for specialist surgery — which sets the size of a central place’s market area.",
          "links": [
            {
              "href": "wiki:Central place theory",
              "label": "Wikipedia"
            }
          ]
        },
        "threshold population": {
          "text": "The minimum number of customers needed to keep a good or service profitable — why a village has a bakery but not an opera house.",
          "links": [
            {
              "href": "wiki:Central place theory",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The system layer: how a constellation of cities is patterned.",
        "links": [
          {
            "href": "wiki:Central place theory",
            "label": "Central place theory (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "the-interior",
      "name": "Inside the Growing City",
      "color": "magenta",
      "fact": "Inside the growing city: land use sorted by what location is worth, the shift to car-age peripheries, and the street patterns that record the city’s age.",
      "terms": [
        "suburbanization",
        "urban sprawl",
        "bid-rent theory",
        "grid plan",
        "organic street pattern"
      ],
      "seeds": [
        "suburbanization",
        "urban sprawl"
      ],
      "termInfo": {
        "bid-rent theory": {
          "text": "Land goes to whoever outbids the rest: retailers outbid offices near the center, which outbid housing, which outbid farms — land use ordered by the bid-rent curve’s fall with distance.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "suburbanization": {
          "text": "The outward shift of population to the metropolitan edge — the car-age periphery — emptying central cities in some decades and refilling them in others.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "urban sprawl": {
          "text": "Low-density, automobile-dependent expansion at the fringe — leapfrog development and edge cities — consuming farmland faster than population grows.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "grid plan": {
          "text": "Streets laid out in repeating blocks — the planned signature of new towns and land speculators, efficient to survey and parcel.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        },
        "organic street pattern": {
          "text": "Streets that grew by accretion — winding lanes, irregular blocks — recording centuries of unplanned growth in the old cores of European and Asian cities.",
          "links": [
            {
              "href": "wiki:Urban geography",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The internal layer: what goes where, and why, within the built-up area.",
        "links": [
          {
            "href": "wiki:Urban geography",
            "label": "Urban geography (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "the-costs",
      "name": "What Growth Spills",
      "color": "olive",
      "fact": "What growth spills: environmental strain, trapped heat and pollution, and the informal settlements where the newest arrivals concentrate.",
      "terms": [
        "urban heat island",
        "informal settlement",
        "environmental impact of urbanization"
      ],
      "seeds": [
        "urban heat island",
        "informal settlement"
      ],
      "termInfo": {
        "environmental impact of urbanization": {
          "text": "The bill for concentration: altered water cycles, habitat loss, waste loads, and emissions — though dense urban living can also lower per-capita footprints.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        },
        "urban heat island": {
          "text": "Concrete, asphalt, and waste heat keep cities several degrees warmer than their rural surroundings — the trapped-heat signature of the built environment.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        },
        "informal settlement": {
          "text": "Housing built without legal title or formal services — slums and shantytowns, called favelas in Brazil — where rapid-growth megacities house their newest arrivals.",
          "links": [
            {
              "href": "wiki:Urbanization",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The cost ledger: what rapid urban growth charges the environment and the newcomers.",
        "links": [
          {
            "href": "wiki:Urbanization",
            "label": "Urbanization (Wikipedia)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-advantages-concentrate-people",
      "term": "advantages concentrate people",
      "clusters": [
        1,
        0
      ],
      "fact": "Agglomeration economies — shared labor, markets, and infrastructure — are the engine behind the urbanization curve itself: the advantages of density are why the urban share keeps climbing.",
      "relationKind": "dynamic",
      "idealTerms": [
        "agglomeration economies",
        "urbanization"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "bridge-systems-sort-the-giants",
      "term": "systems sort the giants",
      "clusters": [
        2,
        0
      ],
      "fact": "Whether a country’s urban hierarchy has one dominant primate city or follows the rank-size rule describes the shape of the urbanization a nation has experienced.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "urbanization"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "bridge-land-value-sorts-the-interior",
      "term": "land value sorts the interior",
      "clusters": [
        2,
        3
      ],
      "fact": "Central place logic and bid-rent are the same auction at two scales: what a location is worth falls with distance from the center, ordering both a region’s towns and a city’s inner land uses.",
      "relationKind": "continuity",
      "idealTerms": [
        "central place theory",
        "bid-rent theory"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "bridge-the-edge-pays-for-the-core",
      "term": "the edge pays for the core",
      "clusters": [
        3,
        4
      ],
      "fact": "Sprawl’s low-density periphery is where concrete and asphalt spread the heat island and where infrastructure must stretch — the outward push of growth is also its environmental bill.",
      "relationKind": "dynamic",
      "idealTerms": [
        "urban sprawl",
        "urban heat island"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 4
      }
    },
    {
      "id": "bridge-growth-meets-its-newcomers",
      "term": "growth meets its newcomers",
      "clusters": [
        0,
        4
      ],
      "fact": "Rapid urban growth in the developing world outpaces formal housing, so the newest arrivals settle informally — the megacity’s expansion is written in its informal settlements.",
      "relationKind": "dynamic",
      "idealTerms": [
        "megacity",
        "informal settlement"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 4
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-two-dials",
      "prompt": "Which two terms are the operational dials of central place theory — how far buyers travel, and how many buyers are needed?",
      "explanation": "Range and threshold together determine whether a good can be offered at a place and how wide its market area reaches.",
      "targets": [
        "range of a good",
        "threshold population"
      ],
      "reasons": {
        "range of a good": "The distance a customer will go — the market area’s radius.",
        "threshold population": "The minimum customer base — the market area’s floor."
      }
    },
    {
      "id": "lens-pattern-vs-process",
      "prompt": "Which two terms describe a national urban hierarchy’s shape — one a single giant, one a regular cascade?",
      "explanation": "Primacy and the rank-size rule are the two canonical shapes of a country’s city-size distribution; megacity is one big settlement, not a shape.",
      "targets": [
        "primate city",
        "rank-size rule"
      ],
      "reasons": {
        "primate city": "One dominant giant at the top of the hierarchy.",
        "rank-size rule": "Sizes falling in a regular 1/n cascade."
      }
    },
    {
      "id": "lens-street-signatures",
      "prompt": "Which two street patterns record how a city was made — one by a surveyor, one by centuries of accretion?",
      "explanation": "The grid is drawn before building; the organic pattern accumulates. Both are legible today as the city’s age.",
      "targets": [
        "grid plan",
        "organic street pattern"
      ],
      "reasons": {
        "grid plan": "Repeating blocks, drawn first — the surveyor’s signature.",
        "organic street pattern": "Winding lanes grown by accretion — time’s signature."
      }
    },
    {
      "id": "lens-dosage-of-density",
      "prompt": "Which three terms are costs or reversals of concentration, rather than measures or advantages of it?",
      "explanation": "Heat islands, informal settlements, and counter-urbanization are on the cost-and-reversal side of the ledger; urbanization and agglomeration are the measures and advantages.",
      "targets": [
        "urban heat island",
        "informal settlement",
        "counter-urbanization"
      ],
      "reasons": {
        "urban heat island": "The built environment’s trapped heat — a cost of density.",
        "informal settlement": "Housing arriving faster than formality — a cost of growth.",
        "counter-urbanization": "The reversal — people voting with their feet against concentration."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "migration-geography",
        "reason": "The rural–urban flow and counter-urbanization are migration events; this board takes the urban destinations, the sibling board the moves themselves.",
        "via": [
          "suburbanization",
          "counter-urbanization"
        ]
      },
      {
        "id": "population-geography",
        "reason": "Megacity growth is population growth concentrated; the sibling board explains where the numbers come from and why they keep rising.",
        "via": [
          "urban growth",
          "megacity"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Reading the City",
    "summary": "From curve to street: why humanity concentrated, where cities spring up, how towns are spaced across a region, what sorts land uses inside them, and the costs growth spills.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "In 1800, about one person in fifty lived in a city. Today it is more than one in two. That reversal — from a rural species to an urban one — is urbanization: the rising share of humanity in urban places. Geography reads it alongside its cousin, urban growth, the absolute increase in urban numbers — a distinction that matters, because a country’s cities can grow while its urban share barely moves, and since the 1970s parts of the developed world have seen counter-urbanization, a net drift back toward small towns and the countryside. At the extreme of the range sit the megacities, agglomerations of more than ten million people — Tokyo, Delhi, Shanghai — increasingly a developing-world phenomenon.\r\n\r\nWhy did concentration happen at all? Partly because of where cities can exist. A city’s site is the ground itself — harbor, river crossing, defensible hill, water supply — while its situation is what the location connects to: trade routes, hinterlands, other cities. Singapore’s site is modest; its situation is superb. And partly because density pays: agglomeration economies — shared labor pools, suppliers, customers, and infrastructure — make each additional arrival more productive, which is the engine behind the whole urbanization curve.\r\n\r\nZoom out, and cities form systems across the map. Walter Christaller’s central place theory models towns as market servers: each settlement offers goods whose range — how far buyers will travel — and threshold — how many customers a service needs — set the size of its market area, and the result is a regular hierarchy of central places with hexagonal hinterlands. Real national systems bend that geometry toward one of two shapes: a primate city, where the largest city outstrips the second many times over, or the rank-size rule’s regular cascade, in which the n-th city is about 1/n the size of the first. Which shape a country has says a great deal about its urbanization history.\r\n\r\nZoom in, and the same logic sorts land inside the city. Bid-rent theory is the auction: retailers outbid offices for central sites, offices outbid housing, housing outbid farms, and land use falls into rings along the bid-rent curve’s decline with distance. Growth then pushes outward — suburbanization fills the car-age periphery, and its low-density, leapfrogging expansion is urban sprawl. The city’s age is legible in its streets: the grid plan of surveyors and speculators, and the organic street pattern of lanes that accumulated over centuries in old cores.\r\n\r\nConcentration has a bill. The environmental impacts of urbanization run from altered water cycles to waste and emissions — though density can also lower per-capita footprints. The built environment traps heat: concrete, asphalt, and waste heat keep cities several degrees warmer than their surroundings, the urban heat island. And where growth outruns formality, the newest arrivals house themselves in informal settlements — slums, shantytowns, favelas — the shadow ledger of the megacity’s rise."
    },
    "links": [
      {
        "href": "wiki:Urbanization",
        "label": "Urbanization (Wikipedia)"
      },
      {
        "href": "wiki:Urban geography",
        "label": "Urban geography (Wikipedia)"
      },
      {
        "href": "wiki:Central place theory",
        "label": "Central place theory (Wikipedia)"
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
      "puzzleId": "cities-and-urbanization",
      "puzzleRevision": "fnv1a32:b200deb8",
      "board": {
        "width": 1160,
        "height": 760
      },
      "nodes": {
        "term:urbanization": {
          "x": 777.58,
          "y": 588.9,
          "pinned": false
        },
        "term:megacity": {
          "x": 741.22,
          "y": 484.02,
          "pinned": false
        },
        "term:urban growth": {
          "x": 791.54,
          "y": 713.26,
          "pinned": false
        },
        "term:counter-urbanization": {
          "x": 918.72,
          "y": 636.03,
          "pinned": false
        },
        "term:site": {
          "x": 323.93,
          "y": 503.15,
          "pinned": false
        },
        "term:situation": {
          "x": 274.64,
          "y": 577.2,
          "pinned": false
        },
        "term:agglomeration economies": {
          "x": 422.66,
          "y": 592.34,
          "pinned": false
        },
        "term:central place theory": {
          "x": 948.93,
          "y": 284.25,
          "pinned": false
        },
        "term:primate city": {
          "x": 864.24,
          "y": 161.9,
          "pinned": false
        },
        "term:rank-size rule": {
          "x": 1093.9,
          "y": 229.54,
          "pinned": false
        },
        "term:range of a good": {
          "x": 994,
          "y": 132.55,
          "pinned": false
        },
        "term:threshold population": {
          "x": 1063.08,
          "y": 415.56,
          "pinned": false
        },
        "term:suburbanization": {
          "x": 487.68,
          "y": 137.42,
          "pinned": false
        },
        "term:urban sprawl": {
          "x": 419.91,
          "y": 23,
          "pinned": false
        },
        "term:bid-rent theory": {
          "x": 563.92,
          "y": 257.8,
          "pinned": false
        },
        "term:grid plan": {
          "x": 534,
          "y": 23,
          "pinned": false
        },
        "term:organic street pattern": {
          "x": 651.25,
          "y": 109.13,
          "pinned": false
        },
        "term:urban heat island": {
          "x": 391.94,
          "y": 252.03,
          "pinned": false
        },
        "term:informal settlement": {
          "x": 403.8,
          "y": 413,
          "pinned": false
        },
        "term:environmental impact of urbanization": {
          "x": 195.33,
          "y": 338.96,
          "pinned": false
        },
        "term:advantages concentrate people": {
          "x": 619.87,
          "y": 669.6,
          "pinned": false
        },
        "term:systems sort the giants": {
          "x": 884.12,
          "y": 455.88,
          "pinned": false
        },
        "term:land value sorts the interior": {
          "x": 730.02,
          "y": 323.32,
          "pinned": true
        },
        "term:the edge pays for the core": {
          "x": 276.37,
          "y": 109.56,
          "pinned": false
        },
        "term:growth meets its newcomers": {
          "x": 613.61,
          "y": 434.55,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4670.01,
        "score": 4670.008836282263
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T07:50:29.779Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "cities-and-urbanization",
      "puzzleRevision": "fnv1a32:b200deb8",
      "board": {
        "width": 1160,
        "height": 760
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 580,
          "y": 165.72,
          "pinned": false
        },
        "cluster:1": {
          "x": 990.86,
          "y": 319.31,
          "pinned": false
        },
        "cluster:2": {
          "x": 169.14,
          "y": 319.31,
          "pinned": false
        },
        "cluster:3": {
          "x": 326.07,
          "y": 567.83,
          "pinned": false
        },
        "cluster:4": {
          "x": 833.93,
          "y": 567.83,
          "pinned": false
        }
      },
      "bridges": {
        "term:advantages concentrate people": {
          "x": 767.57,
          "y": 290.29,
          "pinned": false
        },
        "term:systems sort the giants": {
          "x": 394.37,
          "y": 262.31,
          "pinned": false
        },
        "term:land value sorts the interior": {
          "x": 432.38,
          "y": 367.03,
          "pinned": false
        },
        "term:the edge pays for the core": {
          "x": 580,
          "y": 619.83,
          "pinned": false
        },
        "term:growth meets its newcomers": {
          "x": 654.96,
          "y": 366.77,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "urbanization",
          "megacity",
          "urban growth",
          "counter-urbanization"
        ],
        "cluster:1": [
          "site",
          "situation",
          "agglomeration economies"
        ],
        "cluster:2": [
          "central place theory",
          "primate city",
          "rank-size rule",
          "range of a good",
          "threshold population"
        ],
        "cluster:3": [
          "suburbanization",
          "urban sprawl",
          "bid-rent theory",
          "grid plan",
          "organic street pattern"
        ],
        "cluster:4": [
          "urban heat island",
          "informal settlement",
          "environmental impact of urbanization"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "urban growth",
          "counter-urbanization",
          "urbanization",
          "megacity"
        ],
        "cluster:1": [
          "site",
          "agglomeration economies",
          "situation"
        ],
        "cluster:2": [
          "primate city",
          "range of a good",
          "central place theory",
          "threshold population",
          "rank-size rule"
        ],
        "cluster:3": [
          "grid plan",
          "bid-rent theory",
          "organic street pattern",
          "suburbanization",
          "urban sprawl"
        ],
        "cluster:4": [
          "informal settlement",
          "environmental impact of urbanization",
          "urban heat island"
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
        "totalLength": 1648.160432198695
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:36:57.050Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "cities-and-urbanization",
      "puzzleRevision": "fnv1a32:b200deb8",
      "board": {
        "width": 1160,
        "height": 760
      },
      "nodes": {
        "term:urbanization": {
          "x": 656.56,
          "y": 258.99
        },
        "term:megacity": {
          "x": 498.04,
          "y": 313.09
        },
        "term:urban growth": {
          "x": 716.09,
          "y": 56.7
        },
        "term:counter-urbanization": {
          "x": 527.29,
          "y": 51.13
        },
        "term:site": {
          "x": 1077.54,
          "y": 235.18
        },
        "term:situation": {
          "x": 1111.65,
          "y": 312.2
        },
        "term:agglomeration economies": {
          "x": 1011.35,
          "y": 119.12
        },
        "term:central place theory": {
          "x": 779.3,
          "y": 714.45
        },
        "term:primate city": {
          "x": 927.07,
          "y": 685.91
        },
        "term:rank-size rule": {
          "x": 1063.42,
          "y": 716.19
        },
        "term:range of a good": {
          "x": 1072.98,
          "y": 431.06
        },
        "term:threshold population": {
          "x": 1056.83,
          "y": 593.48
        },
        "term:suburbanization": {
          "x": 427.02,
          "y": 727.53
        },
        "term:urban sprawl": {
          "x": 432.08,
          "y": 455.28
        },
        "term:bid-rent theory": {
          "x": 601.47,
          "y": 478.98
        },
        "term:grid plan": {
          "x": 242.13,
          "y": 609.23
        },
        "term:organic street pattern": {
          "x": 224.51,
          "y": 703.35
        },
        "term:urban heat island": {
          "x": 73.55,
          "y": 384.69
        },
        "term:informal settlement": {
          "x": 318.83,
          "y": 371.69
        },
        "term:environmental impact of urbanization": {
          "x": 133.4,
          "y": 133.34
        },
        "term:advantages concentrate people": {
          "x": 798.94,
          "y": 172.12
        },
        "term:systems sort the giants": {
          "x": 728.57,
          "y": 379.34
        },
        "term:land value sorts the interior": {
          "x": 626.17,
          "y": 573.71
        },
        "term:the edge pays for the core": {
          "x": 211.12,
          "y": 527.8
        },
        "term:growth meets its newcomers": {
          "x": 370.75,
          "y": 211.55
        },
        "cluster:0": {
          "x": 580.53,
          "y": 180.61
        },
        "cluster:1": {
          "x": 961.3,
          "y": 311.37
        },
        "cluster:2": {
          "x": 858.28,
          "y": 509.89
        },
        "cluster:3": {
          "x": 412.07,
          "y": 588.33
        },
        "cluster:4": {
          "x": 174.53,
          "y": 270.39
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T07:50:08.722Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-19T07:50:05.037Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
