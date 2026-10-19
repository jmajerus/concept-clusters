// Generated from content/puzzles/population-geography.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "population-geography",
  "title": "Population Geography — Where People Live and How Numbers Change",
  "category": "human-geography",
  "subcategories": {
    "human-geography": "population-geography"
  },
  "info": {
    "text": "How geographers read human populations: where people concentrate and what limits them, how counts and vital rates are taken, how the demographic transition reshaped births and deaths, and how a population's age structure carries its growth into the future.",
    "links": [
      {
        "href": "wiki:Population geography",
        "label": "Population geography (Wikipedia)"
      },
      {
        "href": "wiki:Demographic transition",
        "label": "Demographic transition (Wikipedia)"
      },
      {
        "href": "wiki:Population pyramid",
        "label": "Population pyramid (Wikipedia)"
      }
    ]
  },
  "clusters": [
    {
      "id": "where-people-live",
      "name": "Where People Live",
      "color": "teal",
      "fact": "Where people live: how populations spread across the surface, how tightly they pack, and the classical limits — land, food, capacity — that check growth.",
      "terms": [
        "population density",
        "overpopulation",
        "population distribution",
        "carrying capacity",
        "Malthusianism"
      ],
      "seeds": [
        "population density",
        "overpopulation"
      ],
      "termInfo": {
        "population density": "Average number of people per unit area (people per km²) — a census count spread over land, the simplest measure of how tightly a population packs its territory.",
        "overpopulation": "The condition when a population exceeds what its environment can sustainably support — numbers pressing past the land's capacity.",
        "population distribution": {
          "text": "The pattern of where people actually live — clustered on coasts, rivers, and fertile plains, sparse in deserts and mountains — before any averaging.",
          "links": [
            {
              "href": "wiki:Population geography",
              "label": "Wikipedia"
            }
          ]
        },
        "carrying capacity": "The maximum population an environment can sustain indefinitely given its resources — the balance point in any population–land accounting.",
        "Malthusianism": {
          "text": "The doctrine, from Thomas Malthus, that population grows faster than food supply, so famine, disease, and restraint act as checks holding population near subsistence.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The map-level half of population geography: distribution, density, and what stops growth.",
        "links": [
          {
            "href": "wiki:Population geography",
            "label": "Population geography (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "counting-people",
      "name": "Counting People",
      "color": "blue",
      "fact": "Counting people: a census enumerates the population, and its change is expressed as comparable rates — births and deaths per thousand, births per woman.",
      "terms": [
        "census",
        "total fertility rate",
        "crude birth rate",
        "crude death rate"
      ],
      "seeds": [
        "census",
        "total fertility rate"
      ],
      "termInfo": {
        "census": "An official, periodic count of a population and its characteristics — age, sex, housing — the baseline every map and rate on this board is built from.",
        "total fertility rate": {
          "text": "The average number of children a woman would bear over a lifetime at current age-specific rates; about 2.1 is the replacement level.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "crude birth rate": {
          "text": "Live births per 1,000 people per year — \"crude\" because the denominator is everyone, not just women of childbearing age.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "crude death rate": {
          "text": "Deaths per 1,000 people per year; its fall — faster than any fall in births — drives the transition's explosive middle stage.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The measurement layer: the census and the vital rates demographers compare across places.",
        "links": [
          {
            "href": "wiki:Demographic transition",
            "label": "Demographic transition (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "the-transition",
      "name": "The Demographic Transition",
      "color": "amber",
      "fact": "The demographic transition: the modelled historical shift from high birth and death rates to low, with its signature consequences — explosion, dividend, and trap.",
      "terms": [
        "demographic transition model",
        "population explosion",
        "demographic dividend",
        "demographic trap"
      ],
      "seeds": [
        "demographic transition model",
        "population explosion"
      ],
      "termInfo": {
        "demographic transition model": {
          "text": "The modelled historical shift from high birth and death rates to low, told in four or five stages; observed by Warren Thompson (1929) and named by Frank Notestein.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "population explosion": {
          "text": "The surge of natural increase when death rates fall faster than birth rates — stage 2 of the transition, when populations can double in decades.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "demographic dividend": {
          "text": "The growth bonus when falling fertility shrinks the dependent-child share relative to the working-age share, freeing resources for investment — East Asia's postwar boom is the classic case.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "demographic trap": {
          "text": "The bind when a country stalls in stage 2: mortality low, fertility still high, so population keeps growing until Malthusian checks — famine, conflict — return.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The explanatory core: how populations moved from the Malthusian regime to low birth and death rates, stage by stage.",
        "links": [
          {
            "href": "wiki:Demographic transition",
            "label": "Demographic transition (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "age-sex-structure",
      "name": "Reading the Age-Sex Structure",
      "color": "magenta",
      "fact": "Reading the age-sex structure: the pyramid exposes a population's makeup at a glance, and the patterns it reveals — the burden of dependents, the swollen cohorts, the aging top.",
      "terms": [
        "population pyramid",
        "population aging",
        "dependency ratio",
        "youth bulge"
      ],
      "seeds": [
        "population pyramid",
        "population aging"
      ],
      "termInfo": {
        "population pyramid": {
          "text": "The paired-bar graph of population by age and sex; its silhouette — expansive, stationary, or constrictive — summarizes a population's past and projects its future.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        },
        "population aging": {
          "text": "The rising share of older people as fertility and mortality fall — the constrictive pyramid's story, and the pension-and-care challenge that follows it.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        },
        "dependency ratio": {
          "text": "Dependents (children plus the old) per working-age adult — a burden measure read straight from the pyramid's shape.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        },
        "youth bulge": {
          "text": "An unusually large young cohort in the pyramid's base — momentum in the making, historically linked to instability when work is scarce.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The structure layer: what the age-sex pyramid shows and the shapes that matter.",
        "links": [
          {
            "href": "wiki:Population pyramid",
            "label": "Population pyramid (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "momentum-futures",
      "name": "Momentum and Futures",
      "color": "olive",
      "fact": "Momentum and futures: why today's age structure constrains tomorrow's numbers — built-in growth, time to double, and the fertility level that ends growth.",
      "terms": [
        "doubling time",
        "replacement fertility",
        "population momentum"
      ],
      "seeds": [
        "doubling time",
        "replacement fertility"
      ],
      "termInfo": {
        "doubling time": {
          "text": "Years for a population to double at its current growth rate — roughly 70 divided by the growth rate in percent.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        },
        "replacement fertility": {
          "text": "The fertility level at which each generation exactly replaces itself — about 2.1 children per woman in low-mortality settings.",
          "links": [
            {
              "href": "wiki:Demographic transition",
              "label": "Wikipedia"
            }
          ]
        },
        "population momentum": {
          "text": "Continued growth after fertility reaches replacement, because large cohorts are still entering parenthood; below replacement, the same momentum carries a population toward decline.",
          "links": [
            {
              "href": "wiki:Population pyramid",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The futures layer: growth written into the age distribution, and the threshold that closes it.",
        "links": [
          {
            "href": "wiki:Population pyramid",
            "label": "Population pyramid (Wikipedia)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-density-from-census",
      "term": "density from the census",
      "clusters": [
        1,
        0
      ],
      "fact": "Density is a census number spread over land: divide the enumerated population of an area by its size, and the distribution map becomes a density comparison.",
      "relationKind": "foundation",
      "idealTerms": [
        "census",
        "population density"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "bridge-rate-of-natural-increase",
      "term": "rate of natural increase",
      "clusters": [
        1,
        2
      ],
      "fact": "Subtract the crude death rate from the crude birth rate and you get the rate of natural increase — the growth engine whose level and trend define each stage of the demographic transition.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-stages-redraw-pyramid",
      "term": "stages redraw the pyramid",
      "clusters": [
        2,
        3
      ],
      "fact": "Each stage of the demographic transition leaves a signature in the age-sex pyramid: a broad base while fertility is high, rounding sides as births fall, and a top-heavy profile once births and deaths are both low.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "population pyramid"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "bridge-structure-carries-momentum",
      "term": "structure carries momentum",
      "clusters": [
        3,
        4
      ],
      "fact": "A pyramid with a broad base keeps growing even after fertility falls, because huge cohorts are still moving into their childbearing years — that built-in growth is population momentum, and the growth rate sets the doubling time.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "population momentum"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 4
      }
    },
    {
      "id": "bridge-replacement-threshold",
      "term": "the replacement threshold",
      "clusters": [
        2,
        4
      ],
      "fact": "Replacement fertility — roughly 2.1 children per woman — is the transition's finish line: reach it and growth levels off; slip below it and momentum turns toward aging and decline.",
      "relationKind": "continuity",
      "idealTerms": [
        null,
        "replacement fertility"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 4
      }
    },
    {
      "id": "bridge-escaping-malthusian-world",
      "term": "escaping the Malthusian world",
      "clusters": [
        0,
        2
      ],
      "fact": "Stage 1 of the transition is the Malthusian world: population pinned near the food supply, checked by famine and disease. The transition is the historical escape from that check.",
      "relationKind": "continuity",
      "idealTerms": [
        "carrying capacity",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-natural-increase-pair",
      "prompt": "Two vital rates on this board combine — subtract one from the other — to give a population's rate of natural increase. Which two?",
      "explanation": "Natural increase is the crude birth rate minus the crude death rate; the total fertility rate is a level per woman, not part of the subtraction.",
      "targets": [
        "crude birth rate",
        "crude death rate"
      ],
      "reasons": {
        "crude birth rate": "Births per 1,000 — the positive side of natural increase.",
        "crude death rate": "Deaths per 1,000 — subtracted away to leave natural increase."
      }
    },
    {
      "id": "lens-transition-consequences",
      "prompt": "Which three terms name consequences the demographic transition produces — outcomes of its stages, not the model or its stages themselves?",
      "explanation": "The explosion, the dividend, and the trap are all outcomes of the stage dynamics; the model is the frame around them, not a consequence.",
      "targets": [
        "population explosion",
        "demographic dividend",
        "demographic trap"
      ],
      "reasons": {
        "population explosion": "Stage 2's surge of natural increase — the transition's most famous consequence.",
        "demographic dividend": "The investment bonus when the transition shrinks the child share.",
        "demographic trap": "The stalled-stage-2 outcome where growth invites Malthusian checks back."
      }
    },
    {
      "id": "lens-pyramid-reads",
      "prompt": "Which three patterns could you read directly off the silhouette of an age-sex pyramid?",
      "explanation": "Shape exposes the dependency burden, bulges, and aging; the pyramid itself is the instrument, and the rates that built it are not shapes.",
      "targets": [
        "dependency ratio",
        "youth bulge",
        "population aging"
      ],
      "reasons": {
        "dependency ratio": "Dependents per worker — set by how wide the base and top are relative to the middle.",
        "youth bulge": "A swollen young cohort — visible as an extra-wide base.",
        "population aging": "A top-heavy pyramid — the constrictive profile of long lives and few births."
      }
    },
    {
      "id": "lens-quotient-measures",
      "prompt": "Three of these measures are quotients — a count over an area, dependents over workers, 70 over the growth rate. Which three?",
      "explanation": "Density, the dependency ratio, and doubling time are each a division; the fertility measures are per-woman levels, not quotients of other board numbers.",
      "targets": [
        "population density",
        "dependency ratio",
        "doubling time"
      ],
      "reasons": {
        "population density": "Census count divided by land area.",
        "dependency ratio": "Dependents divided by the working-age population.",
        "doubling time": "About 70 divided by the percentage growth rate."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "migration-geography",
        "reason": "Migration is the third demographic process this board deliberately excludes — the transition model's own note says so; the sibling board picks up the movers.",
        "via": [
          "rate of natural increase"
        ]
      },
      {
        "id": "cities-and-urbanization",
        "reason": "Concentration on the map is this board's density; the sibling board takes the city — the fullest expression of that concentration — as its subject.",
        "via": [
          "population density"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Reading Populations",
    "summary": "From the map to the pyramid: where people live, how their numbers are counted, why the transition reshaped births and deaths, and how age structure carries growth forward.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Population geography asks a deceptively simple question — where do people live, and why do their numbers rise and fall?\r\n\r\nStart with the map. Population distribution is the pattern of settlement itself: people cluster on coasts, rivers, and fertile plains and thin out across deserts and mountains. Average that pattern over an area and you get population density — people per square kilometer, a census count spread over land. Density raises the classical question of limits. Every environment has a carrying capacity, the population its land and resources can sustain indefinitely; when numbers press past it, geographers speak of overpopulation. The oldest theory of that squeeze is Malthusianism: Thomas Malthus's claim that population grows faster than food supply, so famine and disease act as checks pinning population near subsistence.\r\n\r\nNone of these claims get anywhere without counting. The census enumerates a population and its characteristics — age, sex, housing — and every rate on this board is built on counts like it. Change is expressed as rates so places can be compared: the crude birth rate and the crude death rate count births and deaths per thousand people per year, while the total fertility rate projects how many children the average woman will bear.\r\n\r\nPut those curves together across history and you get the demographic transition model: the modelled shift, in four or five stages, from a world of high births and high deaths to one of low births and low deaths. In stage 1, Malthusian checks hold population flat. In stage 2, deaths fall first — sanitation, vaccines, food — while births stay high; the gap between the curves is the population explosion. In stage 3, fertility falls as children survive, cities grow, and education spreads. The model's signature consequences have their own names: the demographic dividend, when a shrinking child share leaves a large working-age share free for investment; and the demographic trap, when a country stalls in stage 2 — mortality low, fertility high — growing until Malthusian checks return.\r\n\r\nThe transition is visible in a population's very shape. The population pyramid — paired bars of males and females by age — lays out the age-sex structure. Broad-based expansive pyramids record high fertility; rounding sides record its fall; top-heavy constrictive profiles record few births and long lives. From the same shape you read the dependency ratio — dependents per worker — and spot a youth bulge, the swollen young cohort that fuels both growth and, sometimes, instability. When births stay low for decades, the pyramid ages from the top: population aging.\r\n\r\nAnd that shape constrains the future, because structure carries momentum. Population momentum is the growth that continues even after fertility reaches replacement — about 2.1 children per woman — simply because huge cohorts are still young enough to parent. The growth rate converts to a doubling time: roughly 70 divided by the percentage growth rate. Reach replacement and growth levels off; slip below it, and the same momentum carries a population toward aging, then decline."
    },
    "links": [
      {
        "href": "wiki:Population geography",
        "label": "Population geography (Wikipedia)"
      },
      {
        "href": "wiki:Demographic transition",
        "label": "Demographic transition (Wikipedia)"
      },
      {
        "href": "wiki:Population pyramid",
        "label": "Population pyramid (Wikipedia)"
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
      "puzzleId": "population-geography",
      "puzzleRevision": "fnv1a32:3703f9f4",
      "board": {
        "width": 1100,
        "height": 720
      },
      "nodes": {
        "term:population density": {
          "x": 161.87,
          "y": 169.26,
          "pinned": false
        },
        "term:overpopulation": {
          "x": 97.67,
          "y": 35.03,
          "pinned": false
        },
        "term:population distribution": {
          "x": 273.74,
          "y": 35.95,
          "pinned": true
        },
        "term:carrying capacity": {
          "x": 329.03,
          "y": 183.43,
          "pinned": false
        },
        "term:Malthusianism": {
          "x": 79.56,
          "y": 289.41,
          "pinned": false
        },
        "term:census": {
          "x": 235.99,
          "y": 489.45,
          "pinned": false
        },
        "term:total fertility rate": {
          "x": 108.85,
          "y": 462.8,
          "pinned": false
        },
        "term:crude birth rate": {
          "x": 267.84,
          "y": 602.34,
          "pinned": false
        },
        "term:crude death rate": {
          "x": 120.6,
          "y": 623.76,
          "pinned": false
        },
        "term:demographic transition model": {
          "x": 585.21,
          "y": 503.42,
          "pinned": false
        },
        "term:population explosion": {
          "x": 441.55,
          "y": 641.48,
          "pinned": false
        },
        "term:demographic dividend": {
          "x": 739.76,
          "y": 629.93,
          "pinned": false
        },
        "term:demographic trap": {
          "x": 593.03,
          "y": 697,
          "pinned": false
        },
        "term:population pyramid": {
          "x": 786.57,
          "y": 149.89,
          "pinned": false
        },
        "term:population aging": {
          "x": 688.46,
          "y": 30.97,
          "pinned": true
        },
        "term:dependency ratio": {
          "x": 631.61,
          "y": 156.41,
          "pinned": false
        },
        "term:youth bulge": {
          "x": 858.63,
          "y": 30.63,
          "pinned": false
        },
        "term:doubling time": {
          "x": 1037.05,
          "y": 553.21,
          "pinned": false
        },
        "term:replacement fertility": {
          "x": 915.79,
          "y": 649.83,
          "pinned": false
        },
        "term:population momentum": {
          "x": 1018.15,
          "y": 405.63,
          "pinned": false
        },
        "term:density from the census": {
          "x": 235.7,
          "y": 330.27,
          "pinned": false
        },
        "term:rate of natural increase": {
          "x": 376.63,
          "y": 466.56,
          "pinned": false
        },
        "term:stages redraw the pyramid": {
          "x": 708.62,
          "y": 315.94,
          "pinned": false
        },
        "term:structure carries momentum": {
          "x": 956.9,
          "y": 226.05,
          "pinned": false
        },
        "term:the replacement threshold": {
          "x": 843.44,
          "y": 471.03,
          "pinned": false
        },
        "term:escaping the Malthusian world": {
          "x": 492.64,
          "y": 285.61,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5550.3,
        "score": 5550.30306374433
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-19T03:33:39.684Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "population-geography",
      "puzzleRevision": "fnv1a32:3703f9f4",
      "board": {
        "width": 1100,
        "height": 720
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 766.2,
          "y": 176.23,
          "pinned": false
        },
        "cluster:1": {
          "x": 972.94,
          "y": 414.04,
          "pinned": false
        },
        "cluster:2": {
          "x": 260.67,
          "y": 203.44,
          "pinned": false
        },
        "cluster:3": {
          "x": 154.99,
          "y": 458.07,
          "pinned": false
        },
        "cluster:4": {
          "x": 595.2,
          "y": 588.23,
          "pinned": false
        }
      },
      "bridges": {
        "term:density from the census": {
          "x": 995.22,
          "y": 243.09,
          "pinned": false
        },
        "term:rate of natural increase": {
          "x": 544.75,
          "y": 278.89,
          "pinned": false
        },
        "term:stages redraw the pyramid": {
          "x": 392.61,
          "y": 407.29,
          "pinned": false
        },
        "term:structure carries momentum": {
          "x": 364.38,
          "y": 549.02,
          "pinned": false
        },
        "term:the replacement threshold": {
          "x": 483.09,
          "y": 340.68,
          "pinned": false
        },
        "term:escaping the Malthusian world": {
          "x": 502.72,
          "y": 215.7,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "population density",
          "overpopulation",
          "population distribution",
          "carrying capacity",
          "Malthusianism"
        ],
        "cluster:1": [
          "census",
          "total fertility rate",
          "crude birth rate",
          "crude death rate"
        ],
        "cluster:2": [
          "demographic transition model",
          "population explosion",
          "demographic dividend",
          "demographic trap"
        ],
        "cluster:3": [
          "population pyramid",
          "population aging",
          "dependency ratio",
          "youth bulge"
        ],
        "cluster:4": [
          "doubling time",
          "replacement fertility",
          "population momentum"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "overpopulation",
          "population density",
          "population distribution",
          "carrying capacity",
          "Malthusianism"
        ],
        "cluster:1": [
          "census",
          "total fertility rate",
          "crude death rate",
          "crude birth rate"
        ],
        "cluster:2": [
          "demographic dividend",
          "demographic transition model",
          "population explosion",
          "demographic trap"
        ],
        "cluster:3": [
          "dependency ratio",
          "population pyramid",
          "population aging",
          "youth bulge"
        ],
        "cluster:4": [
          "doubling time",
          "replacement fertility",
          "population momentum"
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
        "totalLength": 2030.5327560800542
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T02:43:24.954Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "population-geography",
      "puzzleRevision": "fnv1a32:3703f9f4",
      "board": {
        "width": 1100,
        "height": 720
      },
      "nodes": {
        "term:population density": {
          "x": 614.87,
          "y": 237.8
        },
        "term:overpopulation": {
          "x": 343.57,
          "y": 139.92
        },
        "term:population distribution": {
          "x": 440.88,
          "y": 64.51
        },
        "term:carrying capacity": {
          "x": 390.53,
          "y": 236.74
        },
        "term:Malthusianism": {
          "x": 591.52,
          "y": 32.96
        },
        "term:census": {
          "x": 785.95,
          "y": 163.02
        },
        "term:total fertility rate": {
          "x": 1010.03,
          "y": 32.96
        },
        "term:crude birth rate": {
          "x": 973.01,
          "y": 234.76
        },
        "term:crude death rate": {
          "x": 1023.62,
          "y": 158.9
        },
        "term:demographic transition model": {
          "x": 798.3,
          "y": 666.12
        },
        "term:population explosion": {
          "x": 701.08,
          "y": 575.15
        },
        "term:demographic dividend": {
          "x": 979.14,
          "y": 608.51
        },
        "term:demographic trap": {
          "x": 1021.63,
          "y": 515.05
        },
        "term:population pyramid": {
          "x": 361.73,
          "y": 497.85
        },
        "term:population aging": {
          "x": 192.9,
          "y": 696.01
        },
        "term:dependency ratio": {
          "x": 96.31,
          "y": 627.02
        },
        "term:youth bulge": {
          "x": 500.38,
          "y": 576.73
        },
        "term:doubling time": {
          "x": 426.23,
          "y": 340.45
        },
        "term:replacement fertility": {
          "x": 260.43,
          "y": 424.41
        },
        "term:population momentum": {
          "x": 156.25,
          "y": 202.98
        },
        "term:density from the census": {
          "x": 696.48,
          "y": 106.83
        },
        "term:rate of natural increase": {
          "x": 860.92,
          "y": 289.59
        },
        "term:stages redraw the pyramid": {
          "x": 583.18,
          "y": 497.85
        },
        "term:structure carries momentum": {
          "x": 160.72,
          "y": 538.86
        },
        "term:the replacement threshold": {
          "x": 548.54,
          "y": 422.67
        },
        "term:escaping the Malthusian world": {
          "x": 713.63,
          "y": 344.48
        },
        "cluster:0": {
          "x": 503.18,
          "y": 168.14
        },
        "cluster:1": {
          "x": 894.71,
          "y": 91.98
        },
        "cluster:2": {
          "x": 852.25,
          "y": 474.98
        },
        "cluster:3": {
          "x": 400.96,
          "y": 663.13
        },
        "cluster:4": {
          "x": 258.86,
          "y": 354.42
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T03:33:19.926Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "auto",
    "savedAt": "2026-10-19T02:43:23.479Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
