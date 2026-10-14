// Generated from content/puzzles/ecology-energy-flow.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "ecology-energy-flow",
  "title": "Where the Energy Goes — Feeding an Ecosystem",
  "category": "ecology",
  "info": {
    "text": "How energy enters an ecosystem through autotrophs, who eats whom across trophic levels, why each transfer loses most of the energy — and why that taper concentrates toxins at the top.",
    "links": [
      {
        "href": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems",
        "label": "OpenStax Biology 2e §46.2 Energy Flow through Ecosystems"
      }
    ],
    "citations": [
      {
        "title": "Biology 2e, §46.1 Ecology of Ecosystems",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems"
      },
      {
        "title": "Biology 2e, §46.2 Energy Flow through Ecosystems",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems"
      }
    ]
  },
  "clusters": [
    {
      "id": "making-food",
      "name": "The Base: Making Food",
      "color": "teal",
      "fact": "Every ecosystem's energy enters through organisms that build their own food — from sunlight almost everywhere, or from chemistry in the dark — and only part of what they capture stays available.",
      "terms": [
        "autotroph",
        "photoautotroph",
        "chemoautotroph",
        "gross primary productivity",
        "net primary productivity"
      ],
      "seeds": [
        "autotroph",
        "photoautotroph"
      ],
      "termInfo": {
        "autotroph": "An organism that makes its own organic food from inorganic sources — literally ‘self-feeder’. Every ecosystem's energy budget starts with them.",
        "photoautotroph": "An autotroph powered by sunlight: plants, algae, and cyanobacteria. Phytoplankton alone do about 40% of Earth's photosynthesis.",
        "chemoautotroph": "An autotroph powered by chemical bonds instead of light — bacteria at deep-sea hydrothermal vents, 2.5 km down, run whole communities without a photon.",
        "gross primary productivity": "All the energy autotrophs capture per unit time — the ecosystem's gross income.",
        "net primary productivity": "What remains of gross productivity after the autotrophs' own respiration — the actual budget available to every consumer above them."
      },
      "info": {
        "text": "Autotrophs make organic compounds from inorganic sources: photoautotrophs — plants, algae, cyanobacteria — use sunlight (about 40% of Earth's photosynthesis is done by phytoplankton); chemoautotrophs run on chemical bonds at hydrothermal vents, 2.5 km down where no light reaches. Gross primary productivity is everything they capture; net primary productivity is what remains after their own respiration — the budget every consumer lives on.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems",
            "label": "OpenStax Biology 2e §46.2"
          },
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems",
            "label": "OpenStax Biology 2e §46.1"
          }
        ]
      }
    },
    {
      "id": "eating-roles",
      "name": "Everyone Else: Eating to Live",
      "color": "blue",
      "fact": "Heterotrophs get their energy by eating others — plants, animals, both, or what's already dead — and each role is a different way of living off the producers' budget.",
      "terms": [
        "heterotroph",
        "herbivore",
        "carnivore",
        "omnivore",
        "decomposer"
      ],
      "seeds": [
        "herbivore",
        "carnivore"
      ],
      "termInfo": {
        "heterotroph": "An organism that must eat other organisms for energy — literally ‘other-feeder’. Every other role here is a heterotroph's specialty.",
        "herbivore": "Eats plants or algae — the primary consumer, the first bite of the producers' work.",
        "carnivore": "Eats other animals — the secondary and higher consumers of a chain.",
        "omnivore": "Eats both plants and animals; the opossum shrimp eats phytoplankton and copepods alike — which is exactly why food webs, not chains, tell the truth.",
        "decomposer": "Feeds on decaying matter, breaking down dead organisms and wastes (openly, alongside fellow detritivores). The base of the detrital food web."
      },
      "info": {
        "text": "Heterotrophs cannot make their own food. Herbivores eat plants (the primary consumers), carnivores eat other animals, omnivores — like the opossum shrimp — eat both. Decomposers (with their fellow detritivores) feed on decaying matter, breaking down dead organisms and wastes; without them every ecosystem would drown in its own detritus.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems",
            "label": "OpenStax Biology 2e §46.2"
          },
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems",
            "label": "OpenStax Biology 2e §46.1"
          }
        ]
      }
    },
    {
      "id": "feeding-structure",
      "name": "Mapping Who Eats Whom",
      "color": "amber",
      "fact": "A single line of who-eats-whom is a chain; the tangled reality is a web; each rung of either is a trophic level — and real omnivory is why the web wins.",
      "terms": [
        "food chain",
        "food web",
        "trophic level",
        "grazing food web",
        "detrital food web",
        "apex consumer"
      ],
      "seeds": [
        "food chain",
        "food web"
      ],
      "termInfo": {
        "food chain": "One linear who-eats-whom sequence: phytoplankton → copepod → fish → squid → shark.",
        "food web": "The holistic network of every chain in an ecosystem — what reality looks like once omnivores feed across levels.",
        "trophic level": "One rung of the feeding structure — primary producers, primary consumers, and so on — the unit the pyramids count.",
        "grazing food web": "The web built on living tissue, rooted in plants or other photosynthesizers.",
        "detrital food web": "The web built on decaying matter, based on decomposers and detritivores; most grazing webs have one as a twin.",
        "apex consumer": "The carnivore at the top of the chain that nothing else eats."
      },
      "info": {
        "text": "A food chain is one linear sequence — phytoplankton to copepod to fish to squid to shark. A food web is the holistic map of all chains, because organisms like omnivores feed at several levels. Each position is a trophic level. Grazing food webs start from living plants or photosynthesizers; detrital food webs start from decaying matter — most ecosystems have both, running side by side. The top rung is the apex consumer, the carnivore nothing else eats.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems",
            "label": "OpenStax Biology 2e §46.1"
          }
        ]
      }
    },
    {
      "id": "energy-accounting",
      "name": "Why Energy Runs Out",
      "color": "magenta",
      "fact": "Each trophic level keeps only a fraction of the last one's energy — so pyramids of energy can never flip, and toxins that don't leave the body climb the same staircase in ever-higher doses.",
      "terms": [
        "ecological pyramid",
        "trophic level transfer efficiency",
        "biomass",
        "biomagnification"
      ],
      "seeds": [
        "biomass",
        "ecological pyramid"
      ],
      "termInfo": {
        "ecological pyramid": "A chart of amounts across trophic levels — of numbers, of biomass, or of energy; only the energy version is always upright.",
        "trophic level transfer efficiency": "The share of one level's energy that the next level actually receives — about 14.8% from producers to primary consumers at Silver Springs; roughly 10% is the rule of thumb.",
        "biomass": "The total mass of living or recently living tissue per unit area — the currency the biomass pyramid weighs.",
        "biomagnification": "Persistent toxins concentrate with each step up the chain: DDT rose from water to apex birds and thinned their eggshells."
      },
      "info": {
        "text": "An ecological pyramid shows the amounts at each trophic level — of numbers, of biomass (the mass of living and recently living tissue), or of energy. Only the energy pyramid is always upright, because transfers lose most of what they receive: trophic level transfer efficiency at Silver Springs, Florida ran about 14.8% from producers to primary consumers, and roughly 10% is the rule of thumb. By the tertiary consumers, 20,810 kcal/m²/yr had dwindled to 21. Biomagnification is the shadow side: persistent toxins like DDT don't dissolve away, so each level concentrates what the level below ate — apex predators inherit the largest dose.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems",
            "label": "OpenStax Biology 2e §46.2"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "br-base-of-web",
      "term": "every web starts at the producers",
      "clusters": [
        0,
        2
      ],
      "fact": "The bottom rung of every food chain and grazing food web is photosynthetic organisms — the primary producers — which is why a web can't be drawn until someone names what makes the food: phytoplankton, grass, or the chemosynthetic bacteria of a vent community.",
      "info": {
        "text": "OpenStax 46.1: the base of many food chains consists of photosynthetic organisms; grazing webs have plants or other photosynthesizers at their base.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems",
            "label": "OpenStax Biology 2e §46.1"
          }
        ]
      }
    },
    {
      "id": "br-two-webs",
      "term": "two webs run side by side",
      "clusters": [
        1,
        2
      ],
      "fact": "Ecosystems generally show two overlapping webs: the grazing food web, built from living tissue and starting at producers, and the detrital food web, built from decaying matter and based on decomposers and detritivores — most grazing webs have a detrital twin, and the two share many consumers.",
      "info": {
        "text": "OpenStax 46.1: most grazing food webs have an associated detrital food web whose base is decomposers and detritivores.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems",
            "label": "OpenStax Biology 2e §46.1"
          }
        ]
      }
    },
    {
      "id": "br-counted-lost",
      "term": "counted by level, lost per transfer",
      "clusters": [
        2,
        3
      ],
      "fact": "Trophic levels are where the pyramid counts — and each transfer between them is where the count falls: with transfer efficiency near 10%, energy shrinks about tenfold per rung, which is why food chains rarely pass four to six transfers and why nothing outranks the apex consumer for long.",
      "info": {
        "text": "OpenStax 46.2: Silver Springs producers held 20,810 kcal/m²/yr; tertiary consumers held 21 — a trophic level transfer efficiency of about 14.8% for that first step.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems",
            "label": "OpenStax Biology 2e §46.2"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-energy-sources",
      "prompt": "Two board terms name the two kinds of autotroph by energy source. Which two?",
      "explanation": "The two source-specialists; autotroph itself is the umbrella over them, so the bounded wording 'kinds by energy source' excludes it.",
      "targets": [
        "photoautotroph",
        "chemoautotroph"
      ],
      "reasons": {
        "chemoautotroph": "Runs on chemical bonds — vent communities.",
        "photoautotroph": "Runs on sunlight — plants, algae, cyanobacteria."
      }
    },
    {
      "id": "lens-diet-trio",
      "prompt": "Three board terms name eating roles that differ only by what living thing they eat — plants, animals, or both. Which three?",
      "explanation": "Bounded by living food: decomposer eats what's already dead and heterotroph is the umbrella, so only the three diet roles answer.",
      "targets": [
        "herbivore",
        "carnivore",
        "omnivore"
      ],
      "reasons": {
        "carnivore": "Eats other animals.",
        "herbivore": "Eats plants and algae.",
        "omnivore": "Eats both — which is why webs beat chains."
      }
    },
    {
      "id": "lens-twin-webs",
      "prompt": "Two board terms name an ecosystem's twin maps — one built on living tissue, one on decaying matter. Which two?",
      "explanation": "The twin webs are the only terms built on where the web's matter comes from; chain and web are general structures, not matter-based halves.",
      "targets": [
        "grazing food web",
        "detrital food web"
      ],
      "reasons": {
        "detrital food web": "Rooted in decomposers feeding on decaying matter.",
        "grazing food web": "Rooted in living plants and photosynthesizers."
      }
    },
    {
      "id": "lens-tenth-survives",
      "prompt": "Which board term names the measure of how much energy survives one step up the chain?",
      "explanation": "Net primary productivity measures the base, not a step; biomass is a stock, not a ratio; only TLTE is the per-transfer measure.",
      "targets": [
        "trophic level transfer efficiency"
      ],
      "reasons": {
        "trophic level transfer efficiency": "About 10% rule of thumb; 14.8% at Silver Springs' first step."
      }
    },
    {
      "id": "lens-climbing-toxins",
      "prompt": "Which board term names the process by which a persistent toxin grows more concentrated at each step up the chain?",
      "explanation": "The taper's shadow side: biomagnification is the only term about concentration rather than energy quantity.",
      "targets": [
        "biomagnification"
      ],
      "reasons": {
        "biomagnification": "DDT concentrated upward until it thinned apex birds' eggshells."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Where the energy goes",
    "summary": "How energy enters ecosystems through autotrophs, passes along eating roles and web structures, and why ~10% transfer efficiency shapes pyramids, chains, and toxins alike.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "Trace any meal back far enough and you arrive at sunlight — or, in a few strange places, at chemistry. Energy flow through an ecosystem is the story of that trace: where energy enters, who passes it along, and why so little of it survives the trip.\r\n\r\nThe story starts with the autotrophs — literally \"self-feeders\" — organisms that build organic food from inorganic raw materials. Almost all of them are **photoautotrophs**: plants, algae, and cyanobacteria running on sunlight; drifting phytoplankton alone account for roughly 40 percent of Earth's photosynthesis. In the dark a mile and a half under the ocean, **chemoautotrophs** do the same job with chemical bonds instead of light, anchoring whole communities at hydrothermal vents. Ecologists measure what the base makes: **gross primary productivity** is everything captured; **net primary productivity** is what remains after the producers run their own metabolism — the only part of the budget anyone else can spend.\r\n\r\nEveryone above the base is a **heterotroph** — an \"other-feeder\" — and each plays a role defined by what it eats. **Herbivores** eat plants (they are a chain's primary consumers); **carnivores** eat animals; **omnivores** eat both; and **decomposers** — with their fellow detritivores — feed on what's already dead, breaking down remains and wastes that would otherwise bury the world.\r\n\r\nThese roles connect into structures. A **food chain** is one straight line of who-eats-whom: phytoplankton → copepod → fish → squid → shark. Reality is rarely straight, because omnivores like the opossum shrimp feed on both phytoplankton and copepods, so ecologists draw the **food web** — every chain at once. Each position in either picture is a **trophic level**, and ecosystems generally run two webs side by side: the **grazing food web**, built on living tissue and rooted in photosynthesizers, and the **detrital food web**, built on decaying matter and based on decomposers. At the very top sits the **apex consumer**, the predator nothing else eats.\r\n\r\nHere is the cruel arithmetic: every transfer up the staircase loses most of the energy it carries. Some of what an animal eats is never digested; most of what is digested becomes heat through respiration, because organisms are warm, busy machines. The **trophic level transfer efficiency** — about 15 percent at Howard Odum's famous Silver Springs study, and near 10 percent as a rule of thumb — means only a tenth of each rung's energy reaches the next. At Silver Springs the producers held 20,810 kilocalories per square meter per year; the tertiary consumers held 21. That arithmetic is why **ecological pyramids** of energy are always upright, why food chains rarely run more than four to six transfers, why apex predators are rare — and why a grassland can carry millions of rabbits but only a handful of hawks.\r\n\r\nThe taper has a darker echo. A persistent toxin like DDT doesn't leave the body, so each level's consumers collect everything the level below ever ate: the poison **biomagnifies**, and the apex predator — already the rarest animal on the staircase — inherits the largest dose of all."
    }
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
    "star": {
      "schemaVersion": 1,
      "puzzleId": "ecology-energy-flow",
      "puzzleRevision": "fnv1a32:9455179e",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:autotroph": {
          "x": 229.43,
          "y": 153.08
        },
        "term:photoautotroph": {
          "x": 602.61,
          "y": 48.02
        },
        "term:chemoautotroph": {
          "x": 314.51,
          "y": 257.76
        },
        "term:gross primary productivity": {
          "x": 230.94,
          "y": 48.02
        },
        "term:net primary productivity": {
          "x": 431.04,
          "y": 45.02
        },
        "term:heterotroph": {
          "x": 662.42,
          "y": 111.08
        },
        "term:herbivore": {
          "x": 901.69,
          "y": 37
        },
        "term:carnivore": {
          "x": 936.65,
          "y": 224.67
        },
        "term:omnivore": {
          "x": 780.88,
          "y": 62.05
        },
        "term:decomposer": {
          "x": 933.5,
          "y": 111.03
        },
        "term:food chain": {
          "x": 645.18,
          "y": 605.99
        },
        "term:food web": {
          "x": 759.02,
          "y": 603.98
        },
        "term:trophic level": {
          "x": 517.18,
          "y": 508
        },
        "term:grazing food web": {
          "x": 894.93,
          "y": 576.92
        },
        "term:detrital food web": {
          "x": 508.39,
          "y": 583.94
        },
        "term:apex consumer": {
          "x": 924.05,
          "y": 508.3
        },
        "term:ecological pyramid": {
          "x": 101.7,
          "y": 573.92
        },
        "term:trophic level transfer efficiency": {
          "x": 168.99,
          "y": 346.67
        },
        "term:biomass": {
          "x": 67.05,
          "y": 425.16
        },
        "term:biomagnification": {
          "x": 274.88,
          "y": 570.91
        },
        "term:every web starts at the producers": {
          "x": 600.45,
          "y": 288.46
        },
        "term:two webs run side by side": {
          "x": 856.98,
          "y": 336.24
        },
        "term:counted by level, lost per transfer": {
          "x": 423.41,
          "y": 413.13
        },
        "cluster:0": {
          "x": 409.44,
          "y": 172.63
        },
        "cluster:1": {
          "x": 763.26,
          "y": 188.93
        },
        "cluster:2": {
          "x": 749.17,
          "y": 477.34
        },
        "cluster:3": {
          "x": 182.83,
          "y": 471.04
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T17:38:05.751Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "ecology-energy-flow",
      "puzzleRevision": "fnv1a32:9455179e",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 505,
          "y": 496.72,
          "pinned": false
        },
        "cluster:1": {
          "x": 152.51,
          "y": 333,
          "pinned": false
        },
        "cluster:2": {
          "x": 498.99,
          "y": 168.27,
          "pinned": true
        },
        "cluster:3": {
          "x": 857.49,
          "y": 333,
          "pinned": false
        }
      },
      "bridges": {
        "term:every web starts at the producers": {
          "x": 505,
          "y": 333,
          "pinned": false
        },
        "term:two webs run side by side": {
          "x": 230.17,
          "y": 159.56,
          "pinned": true
        },
        "term:counted by level, lost per transfer": {
          "x": 791.44,
          "y": 149.96,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "autotroph",
          "photoautotroph",
          "chemoautotroph",
          "gross primary productivity",
          "net primary productivity"
        ],
        "cluster:1": [
          "heterotroph",
          "herbivore",
          "carnivore",
          "omnivore",
          "decomposer"
        ],
        "cluster:2": [
          "food chain",
          "food web",
          "trophic level",
          "grazing food web",
          "detrital food web",
          "apex consumer"
        ],
        "cluster:3": [
          "ecological pyramid",
          "trophic level transfer efficiency",
          "biomass",
          "biomagnification"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "autotroph",
          "photoautotroph",
          "gross primary productivity",
          "net primary productivity",
          "chemoautotroph"
        ],
        "cluster:1": [
          "omnivore",
          "carnivore",
          "heterotroph",
          "decomposer",
          "herbivore"
        ],
        "cluster:2": [
          "food chain",
          "apex consumer",
          "detrital food web",
          "grazing food web",
          "trophic level",
          "food web"
        ],
        "cluster:3": [
          "biomagnification",
          "trophic level transfer efficiency",
          "ecological pyramid",
          "biomass"
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
        "totalLength": 480.0704206346404
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T17:38:50.812Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "ecology-energy-flow",
      "puzzleRevision": "fnv1a32:9455179e",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:autotroph": {
          "x": 359.52,
          "y": 424.73,
          "pinned": true
        },
        "term:photoautotroph": {
          "x": 317.56,
          "y": 307.46,
          "pinned": true
        },
        "term:chemoautotroph": {
          "x": 462.58,
          "y": 487.07,
          "pinned": false
        },
        "term:gross primary productivity": {
          "x": 317.4,
          "y": 582.94,
          "pinned": false
        },
        "term:net primary productivity": {
          "x": 205.28,
          "y": 410.73,
          "pinned": false
        },
        "term:heterotroph": {
          "x": 194.98,
          "y": 115.84,
          "pinned": false
        },
        "term:herbivore": {
          "x": 309.83,
          "y": 104.91,
          "pinned": false
        },
        "term:carnivore": {
          "x": 374,
          "y": 187.63,
          "pinned": false
        },
        "term:omnivore": {
          "x": 249.84,
          "y": 23,
          "pinned": false
        },
        "term:decomposer": {
          "x": 267.41,
          "y": 204.06,
          "pinned": false
        },
        "term:food chain": {
          "x": 771.86,
          "y": 151.67,
          "pinned": false
        },
        "term:food web": {
          "x": 702.68,
          "y": 254.13,
          "pinned": true
        },
        "term:trophic level": {
          "x": 651.5,
          "y": 152.1,
          "pinned": false
        },
        "term:grazing food web": {
          "x": 930.64,
          "y": 107.23,
          "pinned": false
        },
        "term:detrital food web": {
          "x": 804.36,
          "y": 23,
          "pinned": false
        },
        "term:apex consumer": {
          "x": 661.86,
          "y": 23,
          "pinned": false
        },
        "term:ecological pyramid": {
          "x": 831.13,
          "y": 605.96,
          "pinned": true
        },
        "term:trophic level transfer efficiency": {
          "x": 658.05,
          "y": 536.24,
          "pinned": true
        },
        "term:biomass": {
          "x": 820.98,
          "y": 480.19,
          "pinned": false
        },
        "term:biomagnification": {
          "x": 937.6,
          "y": 508.78,
          "pinned": false
        },
        "term:every web starts at the producers": {
          "x": 532.61,
          "y": 303.97,
          "pinned": false
        },
        "term:two webs run side by side": {
          "x": 502.43,
          "y": 75.25,
          "pinned": false
        },
        "term:counted by level, lost per transfer": {
          "x": 877.72,
          "y": 309.04,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3941.05,
        "score": 3941.0505422060073
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T17:39:27.919Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-14T17:37:59.795Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
