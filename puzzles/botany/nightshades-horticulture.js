// Generated from content/puzzles/nightshades-horticulture.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "nightshades-horticulture",
  "title": "Nightshades: The Beautiful Poison",
  "category": "botany",
  "subcategories": {
    "botany": "horticulture"
  },
  "info": {
    "text": "The garden's favorite family is also its most feared: tomato, potato, and pepper came from the same poisonous clan as belladonna and datura. Sort the crops from the alkaloids, and learn where the line between dinner and danger actually runs.",
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Capsaicin",
        "label": "Capsaicin — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Solanine",
        "label": "Solanine — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Tomato",
        "label": "Tomato — Wikipedia"
      }
    ],
    "citations": [
      {
        "title": "Capsaicin",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Capsaicin"
      },
      {
        "title": "Solanine",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Solanine"
      },
      {
        "title": "Tomato",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Tomato"
      },
      {
        "title": "Potato",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Potato"
      },
      {
        "title": "Atropa belladonna",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Atropa_belladonna"
      }
    ]
  },
  "clusters": [
    {
      "id": "summer-fruits",
      "name": "The summer fruit vegetables",
      "color": "teal",
      "fact": "The heat-loving transplants: tomato and eggplant from Solanum, bell pepper from Capsicum, husked tomatillo and ground cherry from Physalis, and goji from the clan's dry-country genus — botanical fruits, every one of them.",
      "terms": [
        "tomato",
        "bell pepper",
        "eggplant",
        "tomatillo",
        "ground cherry",
        "goji berry"
      ],
      "seeds": [
        "tomato",
        "bell pepper"
      ],
      "termInfo": {
        "tomato": {
          "text": "Solanum lycopersicum, the garden's flagship — an Andean wild fruit domesticated in Mesoamerica and now the world's most-grown garden vegetable.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Tomato",
              "label": "Tomato — Wikipedia"
            }
          ]
        },
        "bell pepper": {
          "text": "Capsicum annuum carrying the recessive non-pungent mutation — the heat dial turned to zero.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Bell_pepper",
              "label": "Bell pepper — Wikipedia"
            }
          ]
        },
        "eggplant": {
          "text": "Solanum melongena, the Asian brinjal — a spongy fruit built to soak up oil and flavor.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Eggplant",
              "label": "Eggplant — Wikipedia"
            }
          ]
        },
        "tomatillo": {
          "text": "Physalis philadelphica, the salsa staple wrapped in its papery husk.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Tomatillo",
              "label": "Tomatillo — Wikipedia"
            }
          ]
        },
        "ground cherry": {
          "text": "Physalis pruinosa, a small sweet husked fruit that drops from the plant when ripe.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Physalis_pruinosa",
              "label": "Physalis pruinosa — Wikipedia"
            }
          ]
        },
        "goji berry": {
          "text": "Lycium barbarum, the 'wolfberry' — the family reaching into superfood country from its dry-country genus.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Goji",
              "label": "Goji — Wikipedia"
            }
          ]
        }
      },
      "info": "If it's a warm-season transplant whose fruit you eat, it lives here."
    },
    {
      "id": "capsaicin-line",
      "name": "The capsaicin line",
      "color": "blue",
      "fact": "One genus, one molecule: Capsicum packs capsaicin into the placental tissue around its seeds — a burn that only mammals feel, because bird receptors shrug it off. Birds spread what molars would destroy.",
      "terms": [
        "chile pepper",
        "capsaicin",
        "Scoville scale"
      ],
      "seeds": [
        "chile pepper",
        "capsaicin"
      ],
      "termInfo": {
        "chile pepper": {
          "text": "Capsicum's pungent fruits — heat from placental capsaicin, graded in Scoville heat units from jalapeño to reaper.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Chili_pepper",
              "label": "Chili pepper — Wikipedia"
            }
          ]
        },
        "capsaicin": {
          "text": "The molecule: a mammal-only irritant binding the TRPV1 receptor — a deterrent to seed-grinding molars, invisible to seed-dispersing birds.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Capsaicin",
              "label": "Capsaicin — Wikipedia"
            }
          ]
        },
        "Scoville scale": {
          "text": "The pungency yardstick: zero for a bell pepper, roughly 16 million for pure capsaicin.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Scoville_scale",
              "label": "Scoville scale — Wikipedia"
            }
          ]
        }
      },
      "info": "If the burn is the point, it lives here."
    },
    {
      "id": "staple-side",
      "name": "The staple side",
      "color": "amber",
      "fact": "The family's staple calories: the potato — world's third food crop and the tuber that remade European history — and the tamarillo, the Andean 'tree tomato' growing the same clan's fruit on a tree.",
      "terms": [
        "potato",
        "tamarillo"
      ],
      "seeds": [
        "potato"
      ],
      "termInfo": {
        "potato": {
          "text": "Solanum tuberosum, the Andean tuber — stored dark to keep its light-made alkaloids down.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Potato",
              "label": "Potato — Wikipedia"
            }
          ]
        },
        "tamarillo": {
          "text": "Solanum betaceum, the 'tree tomato' — the same clan's fruit crop on a small Andean tree.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Tamarillo",
              "label": "Tamarillo — Wikipedia"
            }
          ]
        }
      },
      "info": "If the crop feeds nations rather than salads, it lives here."
    },
    {
      "id": "alkaloid-cabinet",
      "name": "The alkaloid cabinet",
      "color": "magenta",
      "fact": "The cabinet of nerve poisons: solanine synthesized in greened potatoes, nicotine in tobacco leaves, atropine in deadly nightshade — molecules aimed at animal nervous systems, and at other doses, at medicine.",
      "terms": [
        "nicotine",
        "solanine",
        "atropine"
      ],
      "seeds": [
        "nicotine",
        "solanine"
      ],
      "termInfo": {
        "solanine": {
          "text": "The potato's glycoalkaloid defense, synthesized under light and concentrated near the skin — bitter where it lurks, and barely touched by boiling.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Solanine",
              "label": "Solanine — Wikipedia"
            }
          ]
        },
        "nicotine": {
          "text": "Tobacco's insecticide and the world's most infamous addiction — a nerve poison on both counts.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Nicotine",
              "label": "Nicotine — Wikipedia"
            }
          ]
        },
        "atropine": {
          "text": "Deadly nightshade's anticholinergic: dilated pupils and racing heart — poison at one dose, an ophthalmologist's tool at another.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Atropine",
              "label": "Atropine — Wikipedia"
            }
          ]
        }
      },
      "info": "The molecules behind the family's fear — and its medicine."
    },
    {
      "id": "deadly-beautiful",
      "name": "The deadly and the beautiful",
      "color": "olive",
      "fact": "The shadow and the ornament share one flower shape: deadly nightshade and datura behind the family's fear, petunia and flowering tobacco in the bedding flats, and angel's trumpet poisoning the gardens it beautifies.",
      "terms": [
        "deadly nightshade",
        "petunia",
        "datura",
        "angel's trumpet",
        "flowering tobacco"
      ],
      "seeds": [
        "deadly nightshade",
        "petunia"
      ],
      "termInfo": {
        "deadly nightshade": {
          "text": "Atropa belladonna — 'beautiful lady,' for the pupils its atropine dilated; every part of the plant genuinely toxic.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Atropa_belladonna",
              "label": "Atropa belladonna — Wikipedia"
            }
          ]
        },
        "petunia": {
          "text": "Petunia hybrida, the bedding-flat staple — the family's friendly face.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Petunia",
              "label": "Petunia — Wikipedia"
            }
          ]
        },
        "datura": {
          "text": "The jimsonweed genus — dramatic trumpet flowers and dangerous seeds; a weed on one continent, a deliberate ornamental on another.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Datura",
              "label": "Datura — Wikipedia"
            }
          ]
        },
        "angel's trumpet": {
          "text": "Brugmansia, the pendulous scented trumpets — ornamental, and toxic through and through.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Brugmansia",
              "label": "Brugmansia — Wikipedia"
            }
          ]
        },
        "flowering tobacco": {
          "text": "Nicotiana alata, the evening-scented bedding annual — nicotine's genus in a flower border.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Nicotiana_alata",
              "label": "Nicotiana alata — Wikipedia"
            }
          ]
        }
      },
      "info": "Gorgeous, poisonous, or both — know which before you touch."
    }
  ],
  "bridges": [
    {
      "id": "heat-dial",
      "term": "The heat dial",
      "clusters": [
        0,
        1
      ],
      "fact": "Bell pepper and chile pepper are both Capsicum at two ends of one capsaicin dial: pungent types pack the placenta with the molecule, sweet types carry the recessive mutation that silences it.",
      "info": "One broken acyltransferase gene at the pun1 locus is much of the difference between dinner and dare.",
      "relationKind": "contrast"
    },
    {
      "id": "greening-warning",
      "term": "Greening",
      "clusters": [
        2,
        3
      ],
      "fact": "Light makes tubers synthesize solanine alongside chlorophyll — the green is harmless chlorophyll, the poison beneath it is not. Store potatoes dark, and trust bitterness over color.",
      "info": "Boiling barely helps; peeling does, because 30–80% of the solanine sits in and near the skin.",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "dose-poison",
      "term": "Dose",
      "clusters": [
        4,
        3
      ],
      "fact": "The deadly kin supply the cabinet: atropine dilated Renaissance beauties' pupils and today's eye-exam patients', nicotine both kills and hooks, datura's scopolamine is poison and medicine — same molecules, the dose decides.",
      "info": "Atropine sits on the WHO essential-medicines list — the poison and the antidote share a shelf.",
      "relationKind": "cross-cutting"
    },
    {
      "id": "look-alikes",
      "term": "Look-alikes",
      "clusters": [
        0,
        4
      ],
      "fact": "The family's edible fruits grow beside toxic doppelgängers — ground cherries near woody-nightshade berries, tomato seedlings near datura volunteers — and telling them apart is a gardener's real skill.",
      "info": "Tomato and potato leaves are themselves mild toxin factories — 'edible plant' never meant 'edible plant part.'",
      "relationKind": "contrast"
    },
    {
      "id": "choosing-attacker",
      "term": "Nerve receptors",
      "clusters": [
        1,
        3
      ],
      "fact": "The family aims its defenses: capsaicin burns only mammalian TRPV1 receptors, leaving the seed-dispersing birds untouched, while the alkaloids hit receptors and membranes across the animal kingdom.",
      "info": "Capsaicin's targets are nociceptors — the same fibers heat and abrasion trigger, which is why the brain reads the burn as burning."
    }
  ],
  "lenses": [
    {
      "id": "the-dial",
      "prompt": "One Capsicum fruit is bred to hold no capsaicin at all; its sibling is bred to hold the maximum. Which two terms are the two ends of the dial?",
      "explanation": "Bell pepper and chile pepper are one genus at two settings: the sweet type carries the recessive mutation that silences capsaicin production, the pungent type packs it into the placenta around the seeds. Birds eat both without noticing — the dial is set for mammal tongues.",
      "targets": [
        "bell pepper",
        "chile pepper"
      ],
      "reasons": {
        "bell pepper": "The dial at zero — the recessive non-pungent mutation.",
        "chile pepper": "The dial at maximum — placental capsaicin, graded in Scoville units."
      }
    },
    {
      "id": "green-potato-warning",
      "prompt": "A green-tinged potato goes straight to the compost. Which two terms together name both the crop and the toxin it built in the light?",
      "explanation": "Light makes the tuber produce chlorophyll and solanine together — the green is only the warning label, the alkaloid underneath is the danger. Cooking barely touches glycoalkaloids, and peeling helps because most of the solanine sits in and near the skin.",
      "targets": [
        "potato",
        "solanine"
      ],
      "reasons": {
        "potato": "The tuber — its skin greens with chlorophyll while solanine accumulates beneath.",
        "solanine": "The glycoalkaloid synthesized under light; bitter, and the reason storage is dark."
      }
    },
    {
      "id": "cosmetic-and-poison",
      "prompt": "One molecule in the cabinet was a Renaissance cosmetic — dropped into eyes to dilate pupils — and its supplier is the family's most infamous namesake. Which two terms?",
      "explanation": "Atropine is deadly nightshade's signature alkaloid: 'belladonna' means beautiful lady for exactly this pupil-widening effect, and the refined molecule still dilates eyes in every ophthalmology clinic — poison at one dose, tool at another.",
      "targets": [
        "atropine",
        "deadly nightshade"
      ],
      "reasons": {
        "atropine": "The anticholinergic that widens pupils — cosmetic, poison, and clinical tool by dose.",
        "deadly nightshade": "Atropa belladonna, the supplier — the family's most infamous namesake."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "legumes-horticulture",
        "reason": "Companion trilogy I: the legume family's nitrogen partnership — the friendly superpower beside this board's chemical warfare."
      },
      {
        "id": "brassicas-horticulture",
        "reason": "Companion trilogy II: the mustard family's oil bomb — irritation where this board poisons, canola where this board grows staples."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The beautiful poison",
    "summary": "The nightshade family gave the world its favorite summer crops and its most infamous poisons — the same alkaloid chemistry runs through both, and a gardener who knows the difference gardens safely.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "No plant family feeds the world's gardens and frightens it in the same breath like the nightshades. Tomato, potato, pepper, and eggplant — four of the most-grown crops on earth — share one flower shape and one family tree with deadly nightshade, datura, and henbane. The botanists' name is Solanaceae; the fear is older than the name.\r\n\r\n## The crops\r\n\r\nAlmost everything edible here is a fruit: tomato and eggplant from the genus Solanum, peppers from Capsicum, the husked tomatillo and ground cherry from Physalis, goji from the dry-country genus Lycium. They are heat-loving transplants — started indoors, planted out after frost, staked or caged through summer. The one great exception is the potato, and it is a giant: an Andean tuber that became the world's third food crop and rewrote European history when it crossed the Atlantic. The tamarillo, the 'tree tomato,' shows the Andean clan's staple side was never only underground.\r\n\r\n## The chemistry\r\n\r\nThe family's fear has a chemistry set. Potatoes defend themselves with solanine, a glycoalkaloid they synthesize faster when light strikes the tuber — which is why a green-tinged potato warns of poison beneath its harmless chlorophyll, and why bitterness is the surer tell. Tobacco makes nicotine. Deadly nightshade makes atropine, the molecule that dilated Renaissance beauties' pupils and still dilates eyes in clinics today — the dose alone separates the cosmetic from the casualty. And then there is the family's most refined weapon: capsaicin, the heat of chile peppers, aimed with uncanny precision. It irritates the receptors of mammals — the seed-crushers — while birds, the seed-dispersers, cannot feel it at all. Breeders turned that dial in both directions: the chile at maximum Scoville, the bell pepper at zero, one broken gene between them.\r\n\r\n## The gardener's literacy\r\n\r\nBecause the delicious and the dangerous grow side by side, this family rewards attention. Volunteer datura appears in compost and fresh ground; woody nightshade's red berries hang where children reach; the glorious angel's trumpet poisons the patio it perfumes. Meanwhile the crops themselves carry mild defenses — tomato leaves are not salad, and a sprouted, greened potato belongs in the compost, not the pot. None of this argues against the nightshade garden; it argues for knowing which nightshade you are holding."
    },
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Solanaceae",
        "label": "Solanaceae — Wikipedia"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  },
  "board": {
    "bridgePreconnect": true,
    "sizeFactor": 0.8
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "nightshades-horticulture",
      "puzzleRevision": "fnv1a32:89afd96c",
      "board": {
        "width": 770,
        "height": 500
      },
      "nodes": {
        "term:tomato": {
          "x": 199.66,
          "y": 143.54
        },
        "term:bell pepper": {
          "x": 360.68,
          "y": 22
        },
        "term:eggplant": {
          "x": 285.5,
          "y": 181.84
        },
        "term:tomatillo": {
          "x": 460.24,
          "y": 22
        },
        "term:ground cherry": {
          "x": 442.31,
          "y": 194.37
        },
        "term:goji berry": {
          "x": 506.38,
          "y": 98.05
        },
        "term:chile pepper": {
          "x": 712.2,
          "y": 148.69
        },
        "term:capsaicin": {
          "x": 709.85,
          "y": 68.46
        },
        "term:Scoville scale": {
          "x": 676.12,
          "y": 313.95
        },
        "term:potato": {
          "x": 550.61,
          "y": 475.97
        },
        "term:tamarillo": {
          "x": 689.04,
          "y": 478
        },
        "term:nicotine": {
          "x": 167.81,
          "y": 475.97
        },
        "term:solanine": {
          "x": 429.01,
          "y": 392.87
        },
        "term:atropine": {
          "x": 268.45,
          "y": 343.59
        },
        "term:deadly nightshade": {
          "x": 73.55,
          "y": 403.8
        },
        "term:petunia": {
          "x": 42.05,
          "y": 282.17
        },
        "term:datura": {
          "x": 217.37,
          "y": 303.6
        },
        "term:angel's trumpet": {
          "x": 170.58,
          "y": 22
        },
        "term:flowering tobacco": {
          "x": 73.55,
          "y": 66.48
        },
        "term:The heat dial": {
          "x": 571.88,
          "y": 37.15
        },
        "term:Greening": {
          "x": 393.17,
          "y": 478
        },
        "term:Dose": {
          "x": 165.47,
          "y": 348.2
        },
        "term:Look-alikes": {
          "x": 341.09,
          "y": 250.12
        },
        "term:Nerve receptors": {
          "x": 469.96,
          "y": 286.47
        },
        "cluster:0": {
          "x": 326.75,
          "y": 79.87
        },
        "cluster:1": {
          "x": 585.22,
          "y": 187.16
        },
        "cluster:2": {
          "x": 596.54,
          "y": 411.81
        },
        "cluster:3": {
          "x": 283.34,
          "y": 427.19
        },
        "cluster:4": {
          "x": 151.05,
          "y": 226.55
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T22:05:39.417Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "nightshades-horticulture",
      "puzzleRevision": "fnv1a32:89afd96c",
      "board": {
        "width": 840,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 162.42,
          "y": 407.97,
          "pinned": true
        },
        "cluster:1": {
          "x": 296.58,
          "y": 130.72,
          "pinned": true
        },
        "cluster:2": {
          "x": 693.53,
          "y": 372.02,
          "pinned": true
        },
        "cluster:3": {
          "x": 704.61,
          "y": 124.35,
          "pinned": true
        },
        "cluster:4": {
          "x": 462.86,
          "y": 428.58,
          "pinned": true
        }
      },
      "bridges": {
        "term:The heat dial": {
          "x": 106.15,
          "y": 191.13,
          "pinned": true
        },
        "term:Greening": {
          "x": 767.61,
          "y": 247.08,
          "pinned": true
        },
        "term:Dose": {
          "x": 590.76,
          "y": 254.31,
          "pinned": true
        },
        "term:Look-alikes": {
          "x": 318.45,
          "y": 278.1,
          "pinned": true
        },
        "term:Nerve receptors": {
          "x": 480.52,
          "y": 194.02,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "tomato",
          "bell pepper",
          "eggplant",
          "tomatillo",
          "ground cherry",
          "goji berry"
        ],
        "cluster:1": [
          "chile pepper",
          "capsaicin",
          "Scoville scale"
        ],
        "cluster:2": [
          "potato",
          "tamarillo"
        ],
        "cluster:3": [
          "nicotine",
          "solanine",
          "atropine"
        ],
        "cluster:4": [
          "deadly nightshade",
          "petunia",
          "datura",
          "angel's trumpet",
          "flowering tobacco"
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
        "totalLength": 912.6586185402725
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T00:52:16.773Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "nightshades-horticulture",
      "puzzleRevision": "fnv1a32:89afd96c",
      "board": {
        "width": 770,
        "height": 500
      },
      "nodes": {
        "term:tomato": {
          "x": 140.85,
          "y": 174.32,
          "pinned": false
        },
        "term:bell pepper": {
          "x": 152.78,
          "y": 275.16,
          "pinned": false
        },
        "term:eggplant": {
          "x": 56.55,
          "y": 323.86,
          "pinned": false
        },
        "term:tomatillo": {
          "x": 156.54,
          "y": 28.47,
          "pinned": false
        },
        "term:ground cherry": {
          "x": 62.95,
          "y": 99.16,
          "pinned": false
        },
        "term:goji berry": {
          "x": 53.5,
          "y": 219.22,
          "pinned": false
        },
        "term:chile pepper": {
          "x": 353.21,
          "y": 156.79,
          "pinned": false
        },
        "term:capsaicin": {
          "x": 325.49,
          "y": 46.04,
          "pinned": false
        },
        "term:Scoville scale": {
          "x": 444.52,
          "y": 64.4,
          "pinned": false
        },
        "term:potato": {
          "x": 569.83,
          "y": 129.88,
          "pinned": false
        },
        "term:tamarillo": {
          "x": 662.2,
          "y": 106.65,
          "pinned": false
        },
        "term:nicotine": {
          "x": 568.71,
          "y": 280.04,
          "pinned": false
        },
        "term:solanine": {
          "x": 599.1,
          "y": 373.62,
          "pinned": false
        },
        "term:atropine": {
          "x": 664.95,
          "y": 300.51,
          "pinned": false
        },
        "term:deadly nightshade": {
          "x": 358.56,
          "y": 335.51,
          "pinned": false
        },
        "term:petunia": {
          "x": 215.75,
          "y": 369.35,
          "pinned": true
        },
        "term:datura": {
          "x": 385.65,
          "y": 468.83,
          "pinned": false
        },
        "term:angel's trumpet": {
          "x": 485.39,
          "y": 413.32,
          "pinned": false
        },
        "term:flowering tobacco": {
          "x": 265.56,
          "y": 459.65,
          "pinned": false
        },
        "term:The heat dial": {
          "x": 232.64,
          "y": 117.72,
          "pinned": false
        },
        "term:Greening": {
          "x": 636.37,
          "y": 206.34,
          "pinned": false
        },
        "term:Dose": {
          "x": 469.02,
          "y": 306.72,
          "pinned": false
        },
        "term:Look-alikes": {
          "x": 263.89,
          "y": 237.59,
          "pinned": false
        },
        "term:Nerve receptors": {
          "x": 479.27,
          "y": 199.36,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3391.44,
        "score": 3391.4358526127608
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T00:54:05.215Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
