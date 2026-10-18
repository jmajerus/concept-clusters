// Generated from content/puzzles/fungal-forms-and-habitats.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "fungal-forms-and-habitats",
  "title": "Hyphae, Yeasts, and Spore Factories — How Fungi Are Built and Multiply",
  "category": "microbiology",
  "subcategories": {
    "microbiology": "mycology"
  },
  "info": {
    "text": "How fungi are built and how they multiply: the growth forms from hyphal network to budding yeast, the wall and membrane chemistry only fungi have, the two great sexual spore factories, the asexual spores that do the daily spreading, and the two partnerships that reshaped life on land.",
    "links": [
      {
        "href": "wiki:Mycology"
      }
    ],
    "citations": [
      {
        "title": "Fungus",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Fungus"
      },
      {
        "title": "Antifungal",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Antifungal"
      }
    ]
  },
  "clusters": [
    {
      "id": "growth-forms",
      "name": "Growth forms",
      "color": "teal",
      "fact": "A fungus is either a weaving of microscopic threads, a single budding cell, or — for the pathogens that infect us — a shapeshifter that switches between the two as conditions change.",
      "terms": [
        "hypha",
        "mycelium",
        "yeast",
        "dimorphic fungus"
      ],
      "seeds": [
        "hypha",
        "yeast"
      ],
      "termInfo": {
        "dimorphic fungus": {
          "text": "A pathogen that grows as a mold in the environment and switches to yeast inside the warm body — Histoplasma, Blastomyces. Temperature flips the switch.",
          "links": [
            {
              "href": "wiki:Dimorphic fungus"
            }
          ]
        },
        "hypha": {
          "text": "A cylindrical filament 2–10 micrometres wide that grows only at its tip, guided by a vesicle cluster called the Spitzenkörper. Septa may divide it into compartments, or it may stay one multinucleate tube.",
          "links": [
            {
              "href": "wiki:Hypha"
            }
          ]
        },
        "mycelium": {
          "text": "The interconnected network of hyphae — the fungus's real body, hidden in soil or food. The visible fuzz on spoiled bread is this network at the surface.",
          "links": [
            {
              "href": "wiki:Mycelium"
            }
          ]
        },
        "yeast": {
          "text": "A unicellular fungus that reproduces by budding or fission instead of growing threads. Saccharomyces brews; Candida infects.",
          "links": [
            {
              "href": "wiki:Yeast"
            }
          ]
        }
      },
      "info": {
        "text": "Fungal bodies come in two plans — filamentous and unicellular — and the threads, not the cells, are the default. The mold on food is not a film of microbes but one woven organism.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      }
    },
    {
      "id": "chemistry",
      "name": "Signature chemistry",
      "color": "blue",
      "fact": "Fungi are set apart by their building materials: walls of chitin and glucans — never cellulose — and membranes built on ergosterol instead of cholesterol. Medicine aims its antifungals at exactly this list.",
      "terms": [
        "chitin",
        "glucan",
        "ergosterol"
      ],
      "seeds": [
        "chitin",
        "ergosterol"
      ],
      "termInfo": {
        "chitin": {
          "text": "The same nitrogen-rich polymer as insect shells, woven into fungal walls for rigidity. Insect exoskeleton chemistry inside a 'plant-like' wall — fungi are neither plant nor animal.",
          "links": [
            {
              "href": "wiki:Chitin"
            }
          ]
        },
        "ergosterol": {
          "text": "The fungal membrane sterol, doing the job cholesterol does in your cells. Amphotericin binds it; azoles block its synthesis — animal cells use cholesterol instead, which is why these drugs work at all.",
          "links": [
            {
              "href": "wiki:Ergosterol"
            }
          ]
        },
        "glucan": {
          "text": "The glucose polymer — beta-1,3-glucan — that stiffens the wall alongside chitin. Echinocandin drugs block its synthesis, the newest class of antifungals.",
          "links": [
            {
              "href": "wiki:Glucan"
            }
          ]
        }
      },
      "info": {
        "text": "Fungi are the only organisms that combine chitin and glucans in their walls, and they build membranes on ergosterol rather than cholesterol — a chemical identity card.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      }
    },
    {
      "id": "sexual-factories",
      "name": "Sexual spore factories",
      "color": "amber",
      "fact": "The two great fungal lineages are named for their sexual machinery: sac fungi, whose asci produce ascospores, and club fungi, whose basidia produce basidiospores — often raised high on a fruiting body for the launch.",
      "terms": [
        "ascus",
        "ascospore",
        "basidium",
        "basidiospore",
        "basidiocarp"
      ],
      "seeds": [
        "ascus",
        "basidium"
      ],
      "termInfo": {
        "ascospore": {
          "text": "A sexual spore formed inside an ascus after two nuclei fuse and undergo meiosis — typically eight per sac, packed like bullets.",
          "links": [
            {
              "href": "wiki:Ascospore"
            }
          ]
        },
        "ascus": {
          "text": "The sac cell of the ascomycetes: meiosis happens inside it, and many asci fire their ascospores simultaneously in a coordinated puff.",
          "links": [
            {
              "href": "wiki:Ascus"
            }
          ]
        },
        "basidiocarp": {
          "text": "The club-fungus fruiting body — the mushroom itself: a spore-producing surface raised into the air so wind can take the crop. Its gills are packed with basidia.",
          "links": [
            {
              "href": "wiki:Basidiocarp"
            }
          ]
        },
        "basidiospore": {
          "text": "A sexual spore grown on the outside of a basidium, usually four per club, and often shot off by a tiny water-droplet catapult.",
          "links": [
            {
              "href": "wiki:Basidiospore"
            }
          ]
        },
        "basidium": {
          "text": "The club cell of the basidiomycetes: after meiosis, spores bud from its surface on tiny stalks.",
          "links": [
            {
              "href": "wiki:Basidium"
            }
          ]
        }
      },
      "info": {
        "text": "Ascomycetes (sac fungi) and basidiomycetes (club fungi) are named for their sexual machinery. Meiosis happens inside the ascus or on the basidium; the fruiting body is the launchpad.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      }
    },
    {
      "id": "asexual-spores",
      "name": "Asexual spores",
      "color": "magenta",
      "fact": "The spores that do the daily spreading need no mating: dry conidia drift on the wind, sporangia hold theirs until they burst, and the chytrids swim theirs around with a flagellum.",
      "terms": [
        "conidium",
        "sporangiospore",
        "zoospore"
      ],
      "seeds": [
        "conidium",
        "sporangiospore"
      ],
      "termInfo": {
        "conidium": {
          "text": "A dry, naked asexual spore budded off specialized hyphae — the dust that puffs from a ripe puffball's asexual cousins, and what Penicillium's green powder is made of.",
          "links": [
            {
              "href": "wiki:Conidium"
            }
          ]
        },
        "sporangiospore": {
          "text": "An asexual spore produced and carried inside a sporangium, a sac at the tip of a stalked hypha, released when the sac breaks.",
          "links": [
            {
              "href": "wiki:Sporangium"
            }
          ]
        },
        "zoospore": {
          "text": "A flagellated swimming spore — the chytrids' trick, and the reason those fungi need water. The amphibian-killing Batrachochytrium swims this way.",
          "links": [
            {
              "href": "wiki:Zoospore"
            }
          ]
        }
      },
      "info": {
        "text": "These are the workhorse propagules — no meiosis, no mating, just fast cloning at spore scale. Molds, mildews, and most plant diseases run on them.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      }
    },
    {
      "id": "partnerships",
      "name": "The great partnerships",
      "color": "olive",
      "fact": "Two partnerships changed the planet: the fungus-root union that feeds most of the plants alive, and the fungus-alga composite that can live on bare rock where neither partner survives alone.",
      "terms": [
        "mycorrhiza",
        "lichen"
      ],
      "seeds": [
        "mycorrhiza"
      ],
      "termInfo": {
        "lichen": {
          "text": "A composite organism: a fungus (usually an ascomycete) farming algae or cyanobacteria inside a layered body it builds itself. Lichens live on bare rock, deserts, and tundra — and some survive space exposure.",
          "links": [
            {
              "href": "wiki:Lichen"
            }
          ]
        },
        "mycorrhiza": {
          "text": "The fungus-root partnership under roughly ninety percent of plant species: the fungus's hyphae extend the root's reach for water and minerals; the plant pays in sugar. Arbuscules are the exchange booths inside root cells.",
          "links": [
            {
              "href": "wiki:Mycorrhiza"
            }
          ]
        }
      },
      "info": {
        "text": "Fungi invented two of evolution's great partnerships. Both reshape the fungus's body and extend its reach far beyond what hyphae alone could do.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "asexual-default",
      "term": "reproduction without sex",
      "clusters": [
        0,
        3
      ],
      "fact": "Sex is optional in fungi: yeasts multiply by simple budding, and the fuzzy coat on old bread is a mycelium raining dry conidia — asexual reproduction does most of the daily work of fungal life.",
      "info": {
        "text": "A single bread-mold colony can release tens of thousands of conidia per hour; that asexual engine is why fungi colonize so fast.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "mycelium",
        "conidium"
      ]
    },
    {
      "id": "antifungal-targets",
      "term": "the antifungal target list",
      "clusters": [
        1,
        0
      ],
      "fact": "Fungi are eukaryotes like us, so medicine aims at their signature chemistry: amphotericin binds ergosterol and azoles starve its synthesis, while echinocandins block the glucan of the wall — selective, but only relatively.",
      "info": {
        "text": "The selectivity is relative: amphotericin can still touch human cholesterol membranes, which is why intravenous use injures kidneys.",
        "links": [
          {
            "href": "wiki:Antifungal"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "ergosterol",
        "yeast"
      ]
    },
    {
      "id": "two-economies",
      "term": "two reproduction economies",
      "clusters": [
        2,
        3
      ],
      "fact": "The same fungus often runs both economies: asexual conidia do the daily spreading, while the elaborate ascus or basidium machinery — and the fruiting body that raises it — appears only when conditions demand a reshuffled generation.",
      "info": {
        "text": "Old mycology books listed the sexual and asexual stages as different species before their life cycles were joined.",
        "links": [
          {
            "href": "wiki:Fungus"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "basidiocarp",
        "conidium"
      ]
    },
    {
      "id": "partnership-reshapes",
      "term": "partnership reshapes the body",
      "clusters": [
        4,
        0
      ],
      "fact": "Symbiosis is visible in the architecture: inside a lichen the fungus builds a wholly different layered body around its algal partner, and inside a plant root mycorrhizal hyphae branch into arbuscules built for nutrient exchange.",
      "info": {
        "text": "Over ninety percent of plant species depend on mycorrhizal partners — the partnership is the norm, not the exception.",
        "links": [
          {
            "href": "wiki:Mycorrhiza"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "mycorrhiza",
        "hypha"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "thread-versus-weave",
      "prompt": "Which term names the whole woven network rather than the single filament it is built from?",
      "explanation": "The hypha is the filament — the unit of construction; the mycelium is the woven network of many hyphae. Yeast never builds threads, and a dimorphic fungus is defined by switching between forms.",
      "targets": [
        "mycelium"
      ],
      "reasons": {
        "mycelium": "The network of many hyphae — the fungus's real body."
      }
    },
    {
      "id": "drug-bullseye",
      "prompt": "Which two signature molecules are the direct targets of antifungal drug classes?",
      "explanation": "Both are antifungal bullseyes: amphotericin binds ergosterol and azoles starve its synthesis; echinocandins block glucan. Chitin stiffens the wall too, but the flagship drug classes aim at ergosterol and glucan.",
      "targets": [
        "ergosterol",
        "glucan"
      ],
      "reasons": {
        "ergosterol": "Amphotericin binds it; azoles starve its synthesis.",
        "glucan": "Echinocandins block its synthesis in the wall."
      }
    },
    {
      "id": "inside-the-sac",
      "prompt": "Which spore forms inside a sac by meiosis — in multiples of eight?",
      "explanation": "Inside an ascus, meiosis yields ascospores — typically eight per sac. Basidiospores form on the outside of a basidium, not inside a sac.",
      "targets": [
        "ascospore"
      ],
      "reasons": {
        "ascospore": "The ascus's internal product — eight bullets per sac."
      }
    },
    {
      "id": "the-launchpad",
      "prompt": "Which structure is the fruiting body built to raise club spores into the wind?",
      "explanation": "The basidiocarp — the mushroom — exists to raise basidium-packed surfaces into the air so the basidiospores can launch. Ascospores fire from their own asci without it.",
      "targets": [
        "basidiocarp"
      ],
      "reasons": {
        "basidiocarp": "The mushroom itself — gills packed with basidia."
      }
    },
    {
      "id": "the-swimmer",
      "prompt": "Which asexual spore swims under its own power?",
      "explanation": "Chytrid zoospores swim with a flagellum — the only fungal spores that do. Conidia ride the wind dry; sporangiospores wait inside a sac until it breaks.",
      "targets": [
        "zoospore"
      ],
      "reasons": {
        "zoospore": "Flagellated — the chytrids' water-dependent trick."
      }
    },
    {
      "id": "no-mate-required",
      "prompt": "Which two terms name structures that multiply a fungus with no mating at all?",
      "explanation": "Budding is asexual cloning, so is conidium production — neither needs a mate. The ascus and basidium are the sex organs: meiosis happens in them and nowhere else on this list.",
      "targets": [
        "conidium",
        "yeast"
      ],
      "reasons": {
        "conidium": "Budded off hyphae by cloning — no meiosis.",
        "yeast": "Budding cells — cloning again, no mating."
      }
    },
    {
      "id": "both-economies",
      "prompt": "Which pairing shows both reproduction economies at once — the spore of daily spreading and the body built for the sexual launch?",
      "explanation": "The two reproduction economies on one board: the conidium is the asexual workhorse of daily spreading, while the basidiocarp — the mushroom — is built only for the sexual launch of basidiospores. The same fungus often runs both.",
      "targets": [
        "conidium",
        "basidiocarp"
      ],
      "reasons": {
        "basidiocarp": "The sexual launchpad — raised into the wind for basidiospores.",
        "conidium": "The asexual workhorse — no mating, daily cloning at spore scale."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "bacterial-architectures",
        "reason": "Batch sibling: the bacterial cell and the fungal cell make the two great eukaryote-versus-prokaryote contrast boards — walls, shapes, and spores on both sides."
      },
      {
        "id": "virus-build-and-takeover",
        "reason": "Batch sibling: the minimal parasite versus the most architecturally ambitious one — both teach spores and takeover from opposite ends."
      },
      {
        "id": "parasite-life-cycles",
        "reason": "Batch sibling: fungi and parasites both run multi-stage life cycles with specialized dispersal forms — cyst and conidium play the same job on different boards."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Fungi are neither plants nor animals, though they were classified as plants for centuries. They build their walls from chitin — insect-shell chemistry — and run their membranes on ergosterol instead of cholesterol. And their bodies are strange: the default fungus is not a cell but a thread, and a mushroom is merely the fruit of a vast hidden weaving.\r\n\r\nThe body comes in two plans. Filamentous fungi grow as hyphae — microscopic tubes that extend only at their tips and weave into a network called a mycelium. Yeasts give up the threads and live as single cells that multiply by budding. Some pathogenic fungi are shapeshifters, growing as molds in the soil and switching to the yeast form inside a warm body.\r\n\r\nReproduction runs on two economies. The asexual economy never stops: dry conidia drift from every mold, sporangia burst, and chytrid spores swim. The sexual economy is rarer and grander — meiosis happens inside an ascus (the sac that names the ascomycetes) or on a basidium (the club that names the basidiomycetes), and the familiar mushroom is a basidiocarp: a launchpad built to raise basidiospores into the wind.\r\n\r\nThat chemistry defines the partnerships too. A mycorrhiza weaves fungal hyphae around and into plant roots — the deal that feeds most of the plants on Earth. A lichen wraps an alga inside a fungus-built body tough enough for bare rock. Both are bodies no single species could build."
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
      "puzzleId": "fungal-forms-and-habitats",
      "puzzleRevision": "fnv1a32:83ffa26a",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:hypha": {
          "x": 810.75,
          "y": 290.07
        },
        "term:mycelium": {
          "x": 658.7,
          "y": 257.39
        },
        "term:yeast": {
          "x": 691.2,
          "y": 161.02
        },
        "term:dimorphic fungus": {
          "x": 886.21,
          "y": 113.67
        },
        "term:chitin": {
          "x": 325.77,
          "y": 22
        },
        "term:glucan": {
          "x": 518.04,
          "y": 22
        },
        "term:ergosterol": {
          "x": 462.45,
          "y": 169.48
        },
        "term:ascus": {
          "x": 83.62,
          "y": 328.89
        },
        "term:ascospore": {
          "x": 76.18,
          "y": 236.98
        },
        "term:basidium": {
          "x": 103.12,
          "y": 147.82
        },
        "term:basidiospore": {
          "x": 194.94,
          "y": 77.11
        },
        "term:basidiocarp": {
          "x": 296.81,
          "y": 296.33
        },
        "term:conidium": {
          "x": 355.23,
          "y": 486.21
        },
        "term:sporangiospore": {
          "x": 289.08,
          "y": 598
        },
        "term:zoospore": {
          "x": 178.12,
          "y": 551.1
        },
        "term:mycorrhiza": {
          "x": 762.07,
          "y": 470.01
        },
        "term:lichen": {
          "x": 754.04,
          "y": 590.98
        },
        "term:reproduction without sex": {
          "x": 494.92,
          "y": 361.74
        },
        "term:the antifungal target list": {
          "x": 674.88,
          "y": 68.67
        },
        "term:two reproduction economies": {
          "x": 208.48,
          "y": 411.25
        },
        "term:partnership reshapes the body": {
          "x": 753.85,
          "y": 382.02
        },
        "cluster:0": {
          "x": 805.17,
          "y": 205.97
        },
        "cluster:1": {
          "x": 414.72,
          "y": 83.76
        },
        "cluster:2": {
          "x": 264.47,
          "y": 211.93
        },
        "cluster:3": {
          "x": 421.79,
          "y": 553.29
        },
        "cluster:4": {
          "x": 646.02,
          "y": 537.83
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T22:00:48.032Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "fungal-forms-and-habitats",
      "puzzleRevision": "fnv1a32:83ffa26a",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 283.59,
          "y": 169.87,
          "pinned": true
        },
        "cluster:1": {
          "x": 764.57,
          "y": 147.77,
          "pinned": true
        },
        "cluster:2": {
          "x": 539.41,
          "y": 488.64,
          "pinned": true
        },
        "cluster:3": {
          "x": 168.06,
          "y": 482.63,
          "pinned": true
        },
        "cluster:4": {
          "x": 828.76,
          "y": 342.17,
          "pinned": true
        }
      },
      "bridges": {
        "term:reproduction without sex": {
          "x": 101.1,
          "y": 324.66,
          "pinned": true
        },
        "term:the antifungal target list": {
          "x": 538.59,
          "y": 53.64,
          "pinned": true
        },
        "term:two reproduction economies": {
          "x": 386.86,
          "y": 335.09,
          "pinned": true
        },
        "term:partnership reshapes the body": {
          "x": 558.44,
          "y": 201.64,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "hypha",
          "mycelium",
          "yeast",
          "dimorphic fungus"
        ],
        "cluster:1": [
          "chitin",
          "glucan",
          "ergosterol"
        ],
        "cluster:2": [
          "ascus",
          "ascospore",
          "basidium",
          "basidiospore",
          "basidiocarp"
        ],
        "cluster:3": [
          "conidium",
          "sporangiospore",
          "zoospore"
        ],
        "cluster:4": [
          "mycorrhiza",
          "lichen"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "yeast",
          "dimorphic fungus",
          "mycelium",
          "hypha"
        ],
        "cluster:1": [
          "glucan",
          "ergosterol",
          "chitin"
        ],
        "cluster:2": [
          "basidium",
          "basidiocarp",
          "basidiospore",
          "ascospore",
          "ascus"
        ],
        "cluster:3": [
          "conidium",
          "sporangiospore",
          "zoospore"
        ],
        "cluster:4": [
          "mycorrhiza",
          "lichen"
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
        "totalLength": 1611.8571718316239
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T22:01:54.434Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "fungal-forms-and-habitats",
      "puzzleRevision": "fnv1a32:83ffa26a",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:hypha": {
          "x": 299.01,
          "y": 56.07,
          "pinned": true
        },
        "term:mycelium": {
          "x": 444.27,
          "y": 161.55,
          "pinned": true
        },
        "term:yeast": {
          "x": 482.52,
          "y": 22,
          "pinned": false
        },
        "term:dimorphic fungus": {
          "x": 454.68,
          "y": 88.14,
          "pinned": true
        },
        "term:chitin": {
          "x": 747.46,
          "y": 298.4,
          "pinned": false
        },
        "term:glucan": {
          "x": 761.73,
          "y": 205.69,
          "pinned": false
        },
        "term:ergosterol": {
          "x": 660.24,
          "y": 237.53,
          "pinned": false
        },
        "term:ascus": {
          "x": 607.35,
          "y": 510.69,
          "pinned": false
        },
        "term:ascospore": {
          "x": 678.27,
          "y": 581.3,
          "pinned": false
        },
        "term:basidium": {
          "x": 696.86,
          "y": 473.39,
          "pinned": false
        },
        "term:basidiospore": {
          "x": 602.23,
          "y": 401.3,
          "pinned": false
        },
        "term:basidiocarp": {
          "x": 512.02,
          "y": 567.94,
          "pinned": true
        },
        "term:conidium": {
          "x": 357.4,
          "y": 376.42,
          "pinned": true
        },
        "term:sporangiospore": {
          "x": 265.57,
          "y": 509.16,
          "pinned": false
        },
        "term:zoospore": {
          "x": 222.46,
          "y": 414.02,
          "pinned": true
        },
        "term:mycorrhiza": {
          "x": 175.47,
          "y": 236.9,
          "pinned": false
        },
        "term:lichen": {
          "x": 222.35,
          "y": 307.89,
          "pinned": true
        },
        "term:reproduction without sex": {
          "x": 428.39,
          "y": 273.31,
          "pinned": true
        },
        "term:the antifungal target list": {
          "x": 693.91,
          "y": 138.45,
          "pinned": true
        },
        "term:two reproduction economies": {
          "x": 445.21,
          "y": 480.07,
          "pinned": false
        },
        "term:partnership reshapes the body": {
          "x": 187.88,
          "y": 141.24,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3147.73,
        "score": 3147.727419745378
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T22:02:32.201Z"
    }
  },
  "board": {
    "lensFlowTrace": true,
    "source": "author",
    "savedAt": "2026-10-15T22:00:11.505Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
