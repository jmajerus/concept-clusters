// Generated from content/puzzles/migration-geography.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "migration-geography",
  "title": "Migration — Why People Move and Where They Go",
  "category": "human-geography",
  "subcategories": {
    "human-geography": "migration-geography"
  },
  "info": {
    "text": "How geographers read human movement: the choice and compulsion behind moves, the legal names states give the displaced, the flows and corridors migrants carve, the classic laws that predict where movement goes, and what movers leave behind and send back.",
    "links": [
      {
        "href": "wiki:Human migration",
        "label": "Human migration (Wikipedia)"
      }
    ]
  },
  "clusters": [
    {
      "id": "why-people-move",
      "name": "The Will to Move",
      "color": "teal",
      "fact": "Why people move: motives run from free choice among opportunities to the compulsion of disaster and persecution, and push and pull factors aim each move.",
      "terms": [
        "push factor",
        "forced migration",
        "voluntary migration",
        "pull factor"
      ],
      "seeds": [
        "push factor",
        "forced migration"
      ],
      "termInfo": {
        "push factor": {
          "text": "A condition at the origin that drives people out — drought, famine, joblessness, persecution — the natal side of Lee’s model.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "pull factor": {
          "text": "A condition at the destination that draws people in — jobs, safety, family already settled — the destination side of Lee’s model.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "voluntary migration": {
          "text": "Movement by choice — economic migration above all — where the mover weighs costs and benefits and keeps the option to return.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "forced migration": {
          "text": "Movement under compulsion — conflict, disaster, persecution — where staying is not a real option; the article notes its motives are correlated with, not separate from, voluntary moves.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The motive spectrum of migration, from choice to compulsion.",
        "links": [
          {
            "href": "wiki:Human migration",
            "label": "Human migration (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "legal-statuses",
      "name": "Flight and Its Legal Names",
      "color": "blue",
      "fact": "Flight and its legal names: the statuses that separate those recognized as refugees, those still asking, those who never crossed a border, and those sent back.",
      "terms": [
        "refugee",
        "asylum seeker",
        "internally displaced person",
        "repatriation"
      ],
      "seeds": [
        "refugee",
        "asylum seeker"
      ],
      "termInfo": {
        "refugee": {
          "text": "A person outside their country who cannot return owing to a well-founded fear of persecution — a recognized legal status, not a mood.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "asylum seeker": {
          "text": "Someone claiming refugee status whose claim is still being decided — a refugee in law’s waiting room.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "internally displaced person": {
          "text": "Someone forced from home who never crossed an international border — a refugee in every way but the legal one.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "repatriation": {
          "text": "Being returned to the origin country, usually against one’s will, when entry or continued residence is refused — distinct from voluntary return migration.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "What states call the displaced — and why the labels matter.",
        "links": [
          {
            "href": "wiki:Human migration",
            "label": "Human migration (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "flows",
      "name": "The Geometry of Flows",
      "color": "amber",
      "fact": "The geometry of flows: moves within and between countries, the concentrated corridors they carve, the balance they leave, and the counterflow home.",
      "terms": [
        "internal migration",
        "international migration",
        "migration corridor",
        "net migration rate",
        "return migration"
      ],
      "seeds": [
        "internal migration",
        "international migration"
      ],
      "termInfo": {
        "internal migration": {
          "text": "Movement within a country’s borders — the dominant form worldwide, from rural–urban shifts to everyday relocating.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "international migration": {
          "text": "Movement across national borders, the smaller but politically louder form — the source of remittances, visas, and corridors.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "migration corridor": {
          "text": "A heavily trafficked route between an origin and a destination — Mexico–US, Bangladesh–India, the Gulf systems — where flows concentrate.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "net migration rate": {
          "text": "Immigrants minus emigrants per 1,000 people per year — the balance that grows or shrinks a population after natural increase is set aside.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "return migration": {
          "text": "Migrants moving back home — Ravenstein’s counterflow — voluntary in intent, unlike repatriation.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "Migration as a mapped phenomenon: volumes, directions, and concentrations.",
        "links": [
          {
            "href": "wiki:Human migration",
            "label": "Human migration (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "laws-models",
      "name": "Laws and Models of Movement",
      "color": "magenta",
      "fact": "Laws and models of movement: Ravenstein's classic generalizations, the gravity mathematics of distance, rerouting by opportunity, and stepwise journeys.",
      "terms": [
        "gravity model of migration",
        "friction of distance",
        "Ravenstein's laws of migration",
        "intervening opportunities",
        "step migration"
      ],
      "seeds": [
        "gravity model of migration",
        "friction of distance"
      ],
      "termInfo": {
        "gravity model of migration": {
          "text": "Migration between two places rises with their populations and falls with the distance between them — Newton’s law applied to people.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "friction of distance": {
          "text": "The dampening effect of distance on interaction — every additional kilometer costs time, money, and information, so most moves stay short.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "intervening opportunities": {
          "text": "Stouffer’s correction to gravity: movers settle at the nearest acceptable opportunity, so what reroutes a flow is not distance itself but what lies in between.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "step migration": {
          "text": "Long-distance movement achieved in stages — village to town, town to city — each step short enough to manage.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "Ravenstein's laws of migration": {
          "text": "E. G. Ravenstein’s 1880s generalizations: most migrants move short distances, long moves aim at big cities, each flow breeds a counterflow, and movement proceeds by steps.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The predictive layer: how far, how many, and by what route.",
        "links": [
          {
            "href": "wiki:Human migration",
            "label": "Human migration (Wikipedia)"
          }
        ]
      }
    },
    {
      "id": "origins-destinations",
      "name": "Left Behind, Sent Back, Settled",
      "color": "olive",
      "fact": "What movers leave behind and send back: money and skills draining from origins, and the scattered, settled communities that keep a homeland alive abroad.",
      "terms": [
        "remittance",
        "diaspora",
        "brain drain",
        "ethnic enclave"
      ],
      "seeds": [
        "remittance",
        "diaspora"
      ],
      "termInfo": {
        "remittance": {
          "text": "Money a migrant sends home — an economic staple for origin countries (India, the Philippines, Mexico top the tables), and with “social remittances,” ideas and practices travel too.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "brain drain": {
          "text": "The emigration of skilled professionals — human capital flight — that an origin loses precisely when its workforce is most trained.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        },
        "diaspora": {
          "text": "A scattered population living outside an ancestral homeland but keeping links to it — communities that persist across generations.",
          "links": [
            {
              "href": "wiki:Diaspora",
              "label": "Wikipedia"
            }
          ]
        },
        "ethnic enclave": {
          "text": "A dense immigrant neighborhood — Chinatowns are the classic case — where newcomers find jobs, housing, and language in the destination.",
          "links": [
            {
              "href": "wiki:Human migration",
              "label": "Wikipedia"
            }
          ]
        }
      },
      "info": {
        "text": "The consequence layer: origins lose, destinations fill, both stay linked.",
        "links": [
          {
            "href": "wiki:Human migration",
            "label": "Human migration (Wikipedia)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-from-push-to-flight",
      "term": "from push to flight",
      "clusters": [
        0,
        1
      ],
      "fact": "The voluntary–forced line is famously hard to draw — motives are correlated — and refugees and asylum seekers are the legal faces of the pushed end of the spectrum.",
      "relationKind": "continuity",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-why-corridors-form",
      "term": "why corridors form",
      "clusters": [
        3,
        2
      ],
      "fact": "Ravenstein's laws and the gravity model explain the observed geometry: most moves are short, long moves aim at big cities, and every flow breeds a counterflow — so traffic concentrates into a handful of great corridors.",
      "relationKind": "foundation",
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "bridge-factors-aim-the-flows",
      "term": "factors aim the flows",
      "clusters": [
        0,
        2
      ],
      "fact": "Push and pull factors are defined relative to origin and destination, so a corridor is simply a realized pairing of pushes with pulls — Mexico–US, Bangladesh–India.",
      "relationKind": "dynamic",
      "idealTerms": [
        "pull factor",
        "migration corridor"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-displacement-routes",
      "term": "displacement routes",
      "clusters": [
        1,
        2
      ],
      "fact": "Flight carves the era’s great corridors — Ukraine, Syria — while the internally displaced are by definition internal migrants who never crossed a border.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-money-flows-home",
      "term": "money flows home",
      "clusters": [
        2,
        4
      ],
      "fact": "Remittances travel the corridor in reverse — India, the Philippines, and Mexico top the recipient tables — and brain drain measures what the origin side loses when movers stay.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "remittance"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 4
      }
    },
    {
      "id": "bridge-networks-build-enclaves",
      "term": "networks build enclaves",
      "clusters": [
        3,
        4
      ],
      "fact": "Relatives and earlier migrants lower the costs of the next move — the network effect behind chain settlement — and the neighborhoods they fill are the enclaves where diaspora life concentrates.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "ethnic enclave"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 4
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-legal-status-ladder",
      "prompt": "Which three terms are legal or administrative statuses assigned to people on the move, rather than descriptions of the move itself?",
      "explanation": "Refugee, asylum seeker, and internally displaced person are statuses; internal and international migration describe the geometry of the move.",
      "targets": [
        "refugee",
        "asylum seeker",
        "internally displaced person"
      ],
      "reasons": {
        "refugee": "A recognized status for those outside their country with a well-founded fear of persecution.",
        "asylum seeker": "A status pending — the claim not yet decided.",
        "internally displaced person": "A status for the displaced who never crossed a border."
      }
    },
    {
      "id": "lens-distance-dampeners",
      "prompt": "Which three concepts each say distance — or something standing between origin and destination — reshapes a flow?",
      "explanation": "Gravity, friction of distance, and intervening opportunities all bend movement by what lies between; Ravenstein’s laws summarize patterns rather than dampening them.",
      "targets": [
        "gravity model of migration",
        "friction of distance",
        "intervening opportunities"
      ],
      "reasons": {
        "gravity model of migration": "Flows fall with distance, as masses do.",
        "friction of distance": "Every kilometer costs, so near wins.",
        "intervening opportunities": "The nearest acceptable opportunity captures the mover before the far one can."
      }
    },
    {
      "id": "lens-origin-side-ledger",
      "prompt": "Which two terms describe what the origin country experiences when its people migrate out?",
      "explanation": "Remittances are what flows home; brain drain is what the origin loses. Enclaves and diasporas live on the destination side.",
      "targets": [
        "remittance",
        "brain drain"
      ],
      "reasons": {
        "remittance": "The origin’s gain — money sent home on the corridor’s return lane.",
        "brain drain": "The origin’s loss — skilled workers who do not come back."
      }
    },
    {
      "id": "lens-direction-of-terms",
      "prompt": "Which two terms each name a movement relative to a border — one that stays inside it, one that crosses it?",
      "explanation": "Internal and international migration are the two geometries of movement; the statuses describe the mover, not the geometry.",
      "targets": [
        "internal migration",
        "international migration"
      ],
      "reasons": {
        "internal migration": "Movement within a country’s borders — the dominant form worldwide.",
        "international migration": "Movement across a border — the smaller, louder form."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "population-geography",
        "reason": "The net migration rate completes the population picture that board's rate of natural increase begins: growth plus migration equals change.",
        "via": [
          "net migration rate"
        ]
      },
      {
        "id": "cities-and-urbanization",
        "reason": "The dominant internal flow is rural–urban migration; this board supplies the movement, the sibling board the destination.",
        "via": [
          "internal migration",
          "migration corridor"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Reading Movement",
    "summary": "From motive to map: why people move, what states call them, the flows and corridors they form, the laws that predict them, and the money and communities left in motion’s wake.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "To change residence across a significant distance, with the intention of settling, is to migrate — and it is one of the oldest human behaviors. Geography reads movement on three levels: why people move, where the movement goes, and what it leaves behind.\r\n\r\nStart with why. Everett Lee’s model sorts every motive into push factors at the origin — drought, famine, joblessness, persecution — and pull factors at the destination: jobs, safety, family already settled. Moves sit on a spectrum from voluntary migration, where the mover weighs costs and benefits freely, to forced migration, where staying is not a real option. The line is famously hard to draw, because motives are correlated: a family may flee a war and follow jobs in the same journey.\r\n\r\nThe forced end of the spectrum carries its own vocabulary, and the labels are legal, not descriptive. A refugee is outside their country and cannot return for a well-founded fear of persecution. An asylum seeker has made that claim and is waiting for the decision. An internally displaced person was forced from home but never crossed an international border — a refugee in every way but the law’s. And when entry or residence is refused, migrants face repatriation: return, usually against their will.\r\n\r\nNow look at the map. Internal migration — within a country — is the dominant form worldwide; international migration across borders is smaller but politically louder. Movement does not spread evenly: it concentrates in corridors like Mexico–US and Bangladesh–India, and its balance is the net migration rate, immigrants minus emigrants per thousand. Some movers come home — return migration, the counterflow every stream breeds.\r\n\r\nWhy this shape? Because movement obeys generalizations first stated by E. G. Ravenstein in the 1880s: most migrants move short distances; long moves aim at big cities; every flow produces a counterflow; movement often proceeds by steps — village to town, town to city. The gravity model puts mathematics to it: flows rise with the populations of origin and destination and fall with the distance between them, dampened by the friction of distance. Stouffer added the correction that matters: movers settle at the nearest acceptable opportunity, so it is intervening opportunities, not distance alone, that reroutes a flow. And relatives and earlier migrants lower the cost of every next move — the network effect behind chain settlement.\r\n\r\nFinally, follow what moves without people. Remittances — money sent home — have become an economic staple for origin countries; India, the Philippines, and Mexico top the recipient tables, and along with money travel social remittances: ideas, expectations, practices. What flows back the other way is brain drain, the loss of skilled professionals precisely when they are most trained. On the destination side, settlement thickens into ethnic enclaves — Chinatowns are the classic case — and into diasporas: scattered communities that keep a homeland alive abroad for generations."
    },
    "links": [
      {
        "href": "wiki:Human migration",
        "label": "Human migration (Wikipedia)"
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
      "puzzleId": "migration-geography",
      "puzzleRevision": "fnv1a32:0a2c3a1e",
      "board": {
        "width": 1120,
        "height": 730
      },
      "nodes": {
        "term:push factor": {
          "x": 826.25,
          "y": 166.93,
          "pinned": false
        },
        "term:forced migration": {
          "x": 851.16,
          "y": 36.25,
          "pinned": false
        },
        "term:voluntary migration": {
          "x": 966.91,
          "y": 144.15,
          "pinned": false
        },
        "term:pull factor": {
          "x": 725.23,
          "y": 79.14,
          "pinned": false
        },
        "term:refugee": {
          "x": 850,
          "y": 416.95,
          "pinned": false
        },
        "term:asylum seeker": {
          "x": 960.67,
          "y": 425.35,
          "pinned": false
        },
        "term:internally displaced person": {
          "x": 865.81,
          "y": 571.22,
          "pinned": false
        },
        "term:repatriation": {
          "x": 760.14,
          "y": 357.38,
          "pinned": false
        },
        "term:internal migration": {
          "x": 525.23,
          "y": 509.72,
          "pinned": false
        },
        "term:international migration": {
          "x": 627.32,
          "y": 654.47,
          "pinned": false
        },
        "term:migration corridor": {
          "x": 586.65,
          "y": 360.48,
          "pinned": false
        },
        "term:net migration rate": {
          "x": 450.28,
          "y": 660.39,
          "pinned": false
        },
        "term:return migration": {
          "x": 371.13,
          "y": 527.03,
          "pinned": false
        },
        "term:gravity model of migration": {
          "x": 259.54,
          "y": 216,
          "pinned": false
        },
        "term:friction of distance": {
          "x": 261.2,
          "y": 408.87,
          "pinned": false
        },
        "term:Ravenstein's laws of migration": {
          "x": 482.49,
          "y": 190.67,
          "pinned": false
        },
        "term:intervening opportunities": {
          "x": 338.36,
          "y": 23,
          "pinned": false
        },
        "term:step migration": {
          "x": 172.83,
          "y": 65.15,
          "pinned": false
        },
        "term:remittance": {
          "x": 168.48,
          "y": 618.55,
          "pinned": false
        },
        "term:diaspora": {
          "x": 241.64,
          "y": 543.66,
          "pinned": false
        },
        "term:brain drain": {
          "x": 56.65,
          "y": 595.8,
          "pinned": false
        },
        "term:ethnic enclave": {
          "x": 131,
          "y": 493.17,
          "pinned": false
        },
        "term:from push to flight": {
          "x": 891.18,
          "y": 293.77,
          "pinned": false
        },
        "term:why corridors form": {
          "x": 426.69,
          "y": 381.89,
          "pinned": false
        },
        "term:factors aim the flows": {
          "x": 688.57,
          "y": 223.35,
          "pinned": false
        },
        "term:displacement routes": {
          "x": 692.57,
          "y": 486.4,
          "pinned": false
        },
        "term:money flows home": {
          "x": 295.26,
          "y": 655.03,
          "pinned": false
        },
        "term:networks build enclaves": {
          "x": 94.45,
          "y": 332.77,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5413.87,
        "score": 5413.8690505858585
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:03:52.150Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "migration-geography",
      "puzzleRevision": "fnv1a32:0a2c3a1e",
      "board": {
        "width": 1120,
        "height": 730
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 966.8,
          "y": 307.28,
          "pinned": false
        },
        "cluster:1": {
          "x": 811.41,
          "y": 545.06,
          "pinned": false
        },
        "cluster:2": {
          "x": 560,
          "y": 160.32,
          "pinned": false
        },
        "cluster:3": {
          "x": 153.2,
          "y": 307.28,
          "pinned": false
        },
        "cluster:4": {
          "x": 308.59,
          "y": 545.06,
          "pinned": false
        }
      },
      "bridges": {
        "term:from push to flight": {
          "x": 1014.75,
          "y": 478.22,
          "pinned": false
        },
        "term:why corridors form": {
          "x": 367.32,
          "y": 259.67,
          "pinned": false
        },
        "term:factors aim the flows": {
          "x": 783.2,
          "y": 214,
          "pinned": false
        },
        "term:displacement routes": {
          "x": 685.71,
          "y": 352.69,
          "pinned": false
        },
        "term:money flows home": {
          "x": 434.29,
          "y": 352.69,
          "pinned": false
        },
        "term:networks build enclaves": {
          "x": 105.25,
          "y": 478.22,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "push factor",
          "forced migration",
          "voluntary migration",
          "pull factor"
        ],
        "cluster:1": [
          "refugee",
          "asylum seeker",
          "internally displaced person",
          "repatriation"
        ],
        "cluster:2": [
          "internal migration",
          "international migration",
          "migration corridor",
          "net migration rate",
          "return migration"
        ],
        "cluster:3": [
          "gravity model of migration",
          "friction of distance",
          "Ravenstein's laws of migration",
          "intervening opportunities",
          "step migration"
        ],
        "cluster:4": [
          "remittance",
          "diaspora",
          "brain drain",
          "ethnic enclave"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "pull factor",
          "voluntary migration",
          "forced migration",
          "push factor"
        ],
        "cluster:1": [
          "repatriation",
          "internally displaced person",
          "asylum seeker",
          "refugee"
        ],
        "cluster:2": [
          "migration corridor",
          "net migration rate",
          "international migration",
          "internal migration",
          "return migration"
        ],
        "cluster:3": [
          "step migration",
          "intervening opportunities",
          "Ravenstein's laws of migration",
          "gravity model of migration",
          "friction of distance"
        ],
        "cluster:4": [
          "remittance",
          "ethnic enclave",
          "brain drain",
          "diaspora"
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
        "totalLength": 1276.5002556378124
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:03:53.010Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "migration-geography",
      "puzzleRevision": "fnv1a32:0a2c3a1e",
      "board": {
        "width": 1120,
        "height": 730
      },
      "nodes": {
        "term:push factor": {
          "x": 364.44,
          "y": 22
        },
        "term:forced migration": {
          "x": 544.84,
          "y": 22
        },
        "term:voluntary migration": {
          "x": 751.72,
          "y": 22
        },
        "term:pull factor": {
          "x": 505.35,
          "y": 231.21
        },
        "term:refugee": {
          "x": 866.96,
          "y": 89.73
        },
        "term:asylum seeker": {
          "x": 973.56,
          "y": 46.78
        },
        "term:internally displaced person": {
          "x": 1014.95,
          "y": 218.57
        },
        "term:repatriation": {
          "x": 1062.2,
          "y": 388.17
        },
        "term:internal migration": {
          "x": 1043.3,
          "y": 533.05
        },
        "term:international migration": {
          "x": 994.88,
          "y": 707.29
        },
        "term:migration corridor": {
          "x": 757.31,
          "y": 433.84
        },
        "term:net migration rate": {
          "x": 814.91,
          "y": 708
        },
        "term:return migration": {
          "x": 710.84,
          "y": 606.27
        },
        "term:gravity model of migration": {
          "x": 556.69,
          "y": 708
        },
        "term:friction of distance": {
          "x": 320.74,
          "y": 708
        },
        "term:Ravenstein's laws of migration": {
          "x": 114.5,
          "y": 708
        },
        "term:intervening opportunities": {
          "x": 98.75,
          "y": 471.86
        },
        "term:step migration": {
          "x": 238.47,
          "y": 570.13
        },
        "term:remittance": {
          "x": 389.73,
          "y": 250.24
        },
        "term:diaspora": {
          "x": 69.39,
          "y": 126.07
        },
        "term:brain drain": {
          "x": 108.06,
          "y": 22
        },
        "term:ethnic enclave": {
          "x": 128.16,
          "y": 301.21
        },
        "term:from push to flight": {
          "x": 630.54,
          "y": 142.85
        },
        "term:why corridors form": {
          "x": 602.89,
          "y": 492.26
        },
        "term:factors aim the flows": {
          "x": 624.6,
          "y": 320.14
        },
        "term:displacement routes": {
          "x": 918.18,
          "y": 387.54
        },
        "term:money flows home": {
          "x": 463.13,
          "y": 359.89
        },
        "term:networks build enclaves": {
          "x": 288.28,
          "y": 374.55
        },
        "cluster:0": {
          "x": 441.19,
          "y": 117.41
        },
        "cluster:1": {
          "x": 803.34,
          "y": 231.54
        },
        "cluster:2": {
          "x": 874.82,
          "y": 559.76
        },
        "cluster:3": {
          "x": 415.62,
          "y": 541.3
        },
        "cluster:4": {
          "x": 243.12,
          "y": 145.51
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-19T03:03:53.831Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-19T03:34:56.375Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
