// Generated from content/puzzles/brassicas-horticulture.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "brassicas-horticulture",
  "title": "Brassicas: One Family, Every Organ",
  "category": "botany",
  "subcategories": {
    "botany": "horticulture"
  },
  "info": {
    "text": "The mustard family, bred in every direction: one wild species became six vegetables by organ selection, while its relatives became turnips, oils, condiments, and cover crops. Underneath runs one two-part chemical weapon — the mustard-oil bomb — that flavors the condiments, bittered the sprouts, and now fumigates the soil.",
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Brassica_oleracea",
        "label": "Brassica oleracea — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Glucosinolate",
        "label": "Glucosinolate — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Cover_crop",
        "label": "Cover crop — Wikipedia"
      }
    ],
    "citations": [
      {
        "title": "Brassica oleracea",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Brassica_oleracea"
      },
      {
        "title": "Glucosinolate",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Glucosinolate"
      },
      {
        "title": "Cover crop",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Cover_crop"
      },
      {
        "title": "Turnip",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Turnip"
      },
      {
        "title": "Rapeseed",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Rapeseed"
      }
    ]
  },
  "clusters": [
    {
      "id": "oleracea-line",
      "name": "One species, many organs",
      "color": "teal",
      "fact": "One wild cabbage, six vegetables: selection for leaves bred kale, for the terminal bud cabbage, for the swollen stem kohlrabi, for lateral buds Brussels sprouts, and for young inflorescences broccoli and cauliflower — each group emerging in its own century and country.",
      "terms": [
        "cabbage",
        "broccoli",
        "kale",
        "cauliflower",
        "Brussels sprouts",
        "kohlrabi"
      ],
      "seeds": [
        "cabbage",
        "broccoli"
      ],
      "termInfo": {
        "cabbage": {
          "text": "B. oleracea bred for a single dense terminal bud — the head — a form selected by the first century AD.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Brassica_oleracea",
              "label": "Brassica oleracea — Wikipedia"
            }
          ]
        },
        "broccoli": {
          "text": "B. oleracea eaten as young inflorescences before the yellow four-petal flowers open; heading types recorded in southern Italy by the 15th century.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Broccoli",
              "label": "Broccoli — Wikipedia"
            }
          ]
        },
        "kale": {
          "text": "B. oleracea kept in its open, non-heading leafy form — the Acephala group, closest to the wild plant.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Kale",
              "label": "Kale — Wikipedia"
            }
          ]
        },
        "cauliflower": {
          "text": "B. oleracea bred to arrest its flower buds into a single dense curd of meristem tissue.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Cauliflower",
              "label": "Cauliflower — Wikipedia"
            }
          ]
        },
        "Brussels sprouts": {
          "text": "B. oleracea bred for the lateral buds along the stem — selected in Belgium in the 18th century.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Brussels_sprout",
              "label": "Brussels sprout — Wikipedia"
            }
          ]
        },
        "kohlrabi": {
          "text": "B. oleracea bred for a swollen, turnip-like stem held above ground — the Gongylodes group.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Kohlrabi",
              "label": "Kohlrabi — Wikipedia"
            }
          ]
        }
      },
      "info": "Same species, six vegetables — the question is which organ got selected."
    },
    {
      "id": "table-crops",
      "name": "Other species, other tables",
      "color": "blue",
      "fact": "Beyond oleracea, the family's other species feed the table: turnip and bok choy are two directions of Brassica rapa, rutabaga is Brassica napus grown for its root, and the radish brings its own fast-growing genus to the spring garden.",
      "terms": [
        "turnip",
        "radish",
        "bok choy",
        "rutabaga"
      ],
      "seeds": [
        "turnip",
        "radish"
      ],
      "termInfo": {
        "turnip": {
          "text": "Brassica rapa grown for its storage root — one of the oldest cultivated vegetables.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Turnip",
              "label": "Turnip — Wikipedia"
            }
          ]
        },
        "bok choy": {
          "text": "Brassica rapa's other direction: the same species bred for dark rosettes and crisp white petioles instead of a root.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Bok_choy",
              "label": "Bok choy — Wikipedia"
            }
          ]
        },
        "rutabaga": {
          "text": "Brassica napus grown for its swollen root — literally the same species as canola, selected for a different organ.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Rutabaga",
              "label": "Rutabaga — Wikipedia"
            }
          ]
        },
        "radish": {
          "text": "Raphanus sativus, the fast spring root — from round red globes to long daikon.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Radish",
              "label": "Radish — Wikipedia"
            }
          ]
        }
      },
      "info": "The family's other species, bred in two directions each."
    },
    {
      "id": "pungency-line",
      "name": "The pungency line",
      "color": "amber",
      "fact": "Grown for the burn: mustard ground from pungent seeds, wasabi and horseradish grated from rhizomes whose heat volatilizes within seconds, arugula and watercress eaten leaf by leaf for their pepper.",
      "terms": [
        "wasabi",
        "mustard",
        "horseradish",
        "arugula",
        "watercress"
      ],
      "seeds": [
        "wasabi",
        "mustard"
      ],
      "termInfo": {
        "wasabi": {
          "text": "Eutrema japonicum, a streamside family member whose grated rhizome releases allyl isothiocyanate — a heat that volatilizes, hitting the nose and fading in seconds.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Wasabi",
              "label": "Wasabi — Wikipedia"
            }
          ]
        },
        "mustard": {
          "text": "Pungent Brassica seeds (B. juncea, B. nigra, B. alba) ground into the condiment; the same crops serve as cover crops and green manure.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Mustard_plant",
              "label": "Mustard plant — Wikipedia"
            }
          ]
        },
        "horseradish": {
          "text": "Armoracia rusticana, a rampant perennial root — the same isothiocyanate chemistry as wasabi, but with heavier compounds that linger.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Horseradish",
              "label": "Horseradish — Wikipedia"
            }
          ]
        },
        "arugula": {
          "text": "Eruca vesicaria, the peppery salad leaf — glucosinolate bite in a tender annual.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Arugula",
              "label": "Arugula — Wikipedia"
            }
          ]
        },
        "watercress": {
          "text": "Nasturtium officinale, a streamside cress — peppery, and the family's only holder of the Nasturtium genus name.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Watercress",
              "label": "Watercress — Wikipedia"
            }
          ]
        }
      },
      "info": "If you grow it for the burn, it lives here."
    },
    {
      "id": "field-scale",
      "name": "The family at field scale",
      "color": "magenta",
      "fact": "At agronomic scale the family is grown for the press and the soil: canola — the low-acid oilseed form of Brassica napus — is the world's second oilseed after soy, camelina returns as a rediscovered oilseed, and tillage radish drills through compaction and scavenges nitrogen as a cover crop.",
      "terms": [
        "canola",
        "tillage radish",
        "camelina"
      ],
      "seeds": [
        "canola",
        "tillage radish"
      ],
      "termInfo": {
        "canola": {
          "text": "Brassica napus bred for low erucic acid and low-glucosinolate meal — the world's second oilseed after soy, and rutabaga's same species grown for oil instead of root.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Rapeseed",
              "label": "Rapeseed — Wikipedia"
            }
          ]
        },
        "tillage radish": {
          "text": "A daikon-type radish grown not for the table but as a cover crop — drilling compaction pans and scavenging nitrogen, then dying with the first hard freeze.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Cover_crop",
              "label": "Cover crop — Wikipedia"
            }
          ]
        },
        "camelina": {
          "text": "Camelina sativa, 'false flax' — a Brassicaceae oilseed re-emerging in low-input rotations.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Camelina_sativa",
              "label": "Camelina sativa — Wikipedia"
            }
          ]
        }
      },
      "info": "Nobody eats these off a plate: the product is oil in a tank or roots left in the soil."
    },
    {
      "id": "mustard-oil-machinery",
      "name": "The mustard-oil machinery",
      "color": "olive",
      "fact": "The family's weapon is a two-part bomb: glucosinolates stored in one compartment, the enzyme myrosinase in another. Chew, cut, or freeze a leaf and the two meet, flooding the wound with isothiocyanates — mustard oil.",
      "terms": [
        "glucosinolates",
        "myrosinase"
      ],
      "seeds": [
        "glucosinolates"
      ],
      "termInfo": {
        "glucosinolates": {
          "text": "The stored precursors: sulfur-and-nitrogen compounds kept safely apart from the enzyme that activates them — about 132 known across the order.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Glucosinolate",
              "label": "Glucosinolate — Wikipedia"
            }
          ]
        },
        "myrosinase": {
          "text": "The enzyme held in separate cells; only when tissue is chewed, cut, or frozen does it meet the glucosinolates and set off the mustard-oil bomb.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Myrosinase",
              "label": "Myrosinase — Wikipedia"
            }
          ]
        }
      },
      "info": "Two parts, one bomb — the family's whole character follows from this separation."
    },
    {
      "id": "ornamental-cross",
      "name": "The ornamental cross",
      "color": "brown",
      "fact": "The family's flowers carry the same four-petal signature: sweet alyssum edging paths, stock and wallflower bred for scent, honesty for its silvery coin seedpods, candytuft for its spring whites.",
      "terms": [
        "sweet alyssum",
        "honesty",
        "stock",
        "wallflower",
        "candytuft"
      ],
      "seeds": [
        "sweet alyssum",
        "honesty"
      ],
      "termInfo": {
        "sweet alyssum": {
          "text": "Lobularia maritima, the honey-scented white edging annual of the family's ornamental wing.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Lobularia_maritima",
              "label": "Lobularia maritima — Wikipedia"
            }
          ]
        },
        "honesty": {
          "text": "Lunaria annua, grown for its silvery disc seedpods — 'money plant.'",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Lunaria_annua",
              "label": "Lunaria annua — Wikipedia"
            }
          ]
        },
        "stock": {
          "text": "Matthiola incana, the spicy-scented cut flower of spring beds.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Matthiola_incana",
              "label": "Matthiola incana — Wikipedia"
            }
          ]
        },
        "wallflower": {
          "text": "Erysimum cheiri, the old wall-clinging spring biennial.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Erysimum_cheiri",
              "label": "Erysimum cheiri — Wikipedia"
            }
          ]
        },
        "candytuft": {
          "text": "Iberis sempervirens, the white spring carpet — its name a corruption of Candia, Crete.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Iberis_sempervirens",
              "label": "Iberis sempervirens — Wikipedia"
            }
          ]
        }
      },
      "info": "Same four petals, different purpose."
    }
  ],
  "bridges": [
    {
      "id": "mustard-oils",
      "term": "Mustard oils",
      "clusters": [
        4,
        2
      ],
      "fact": "Chewing or grating the pungent crops mixes myrosinase with glucosinolates and the tissue floods with isothiocyanates — mustard oils. Wasabi's vanishing heat and horseradish's lingering one are those compounds evaporating at different rates.",
      "info": "Isothiocyanates are the active products; sinigrin becoming allyl isothiocyanate is the classic pairing in mustard and wasabi.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 2
      }
    },
    {
      "id": "biofumigation",
      "term": "Biofumigation",
      "clusters": [
        4,
        3
      ],
      "fact": "Mustards and radishes grown as cover crops are terminated and turned in so their glucosinolate breakdown products suppress soilborne pests and diseases — the family's defense chemistry, farmed on purpose.",
      "info": "Field practice: chop and incorporate the green mustard biomass quickly, before the volatile products escape.",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "bred-down-heat",
      "term": "Bitterness",
      "clusters": [
        4,
        0
      ],
      "fact": "The cabbage line carries the bomb at low volume: sinigrin is the documented bitterness of cooked cauliflower and Brussels sprouts, and the TAS2R38 taste receptor decides who tastes it strongly — selection bred the burn down to bitterness, not out.",
      "info": "Blanching and breeding both lower glucosinolate loads — modern sprouts are far milder than their 1980s reputation.",
      "relationKind": "contrast",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 0
      }
    },
    {
      "id": "cultivar-groups",
      "term": "Cultivar groups",
      "clusters": [
        0,
        1,
        3
      ],
      "fact": "One genus, bred in every direction: B. oleracea by organ (terminal bud to cabbage, lateral buds to sprouts, stem to kohlrabi), B. rapa by root and leaf (turnip, bok choy), and B. napus by root and seed — rutabaga and canola are the same species at two destinies.",
      "info": "Kew counts eight cultivar groups within B. oleracea alone.",
      "relationKind": "foundation"
    },
    {
      "id": "four-petal-cross",
      "term": "Four-petal cross",
      "clusters": [
        5,
        0
      ],
      "fact": "The old family name Crucifera means cross-bearing, after the four-petaled flower — the one unifying feature beyond taste. Every gardener has seen it on sweet alyssum and on bolted broccoli alike.",
      "info": "Four petals, six stamens — two short, four long — is the family's other quick signature."
    }
  ],
  "lenses": [
    {
      "id": "organ-map",
      "prompt": "Each oleracea vegetable is a different organ gone big. Which two are BUDS — one the stem's single terminal bud, the other the rows of lateral buds along it?",
      "explanation": "Cabbage is the plant's single terminal bud; each Brussels sprout is a lateral bud. Kohlrabi is swollen stem tissue, kale is open leaves, and broccoli and cauliflower are inflorescences — flower parts, not buds.",
      "targets": [
        "cabbage",
        "Brussels sprouts"
      ],
      "reasons": {
        "cabbage": "The terminal bud, selected into one dense head.",
        "Brussels sprouts": "The lateral buds, selected into rows of little heads along the stalk."
      }
    },
    {
      "id": "same-species-two-destinies",
      "prompt": "Two board terms are the very same species selected in opposite directions — one for a swelling root, the other for the oil in its seed. Which two?",
      "explanation": "Rutabaga and canola are both Brassica napus — the species bred downward into a root and onward into an oilseed, the family's one-species-several-crops pattern at its starkest. Turnip is B. rapa, and tillage radish belongs to a different genus entirely.",
      "targets": [
        "rutabaga",
        "canola"
      ],
      "reasons": {
        "rutabaga": "Brassica napus selected for a swollen root.",
        "canola": "Brassica napus selected for low-acid oil in the seed."
      }
    },
    {
      "id": "where-the-heat-lives",
      "prompt": "The burn comes from different plant parts. Which two deliver theirs from underground storage organs — one a root whose heat lingers, the other a rhizome whose heat vanishes?",
      "explanation": "Horseradish stores its heat in a perennial root, wasabi in a rhizome — the same isothiocyanate chemistry with different volatility. Arugula and watercress deliver their pepper from leaves, and mustard from ground seeds.",
      "targets": [
        "horseradish",
        "wasabi"
      ],
      "reasons": {
        "horseradish": "A perennial root whose heavier isothiocyanates linger on the tongue.",
        "wasabi": "A rhizome whose allyl isothiocyanate volatilizes — the burn rises into the nose and fades."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "legumes-horticulture",
        "reason": "The companion board: rotation partners since the four-course era — the legume family's nitrogen partnership against the mustard family's oil bomb, with oilseed and cover-crop parallels on both."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One family, bred in every direction",
    "summary": "The mustard family carries a two-part chemical weapon; horticulture bred it into vegetables by the organ, condiments by the burn, oil by the tonne — and stamped every member with the same four-petal cross.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "The mustard family is the cross-bearers — Cruciferae, the old name, after the four petals arranged like a cross in every flower the family makes. Botanists now call it Brassicaceae, and few plant families have been pulled and pushed by breeders harder: sea-cliff cabbages became kohlrabi, oil became canola, and a streamside herb became wasabi.\r\n\r\n## The species that became six vegetables\r\n\r\nOn limestone cliffs of the eastern Mediterranean grows a scraggly rosette: wild cabbage, Brassica oleracea. Every vegetable in the cabbage line descends from it, each bred by privileging a different organ. Prefer the open leaves and over centuries you get kale. Prefer the single terminal bud and it swells into a cabbage head. Swell the stem and kohlrabi appears; blow up the lateral buds along the stalk and you have Brussels sprouts, a Belgian selection of the eighteenth century. Eat the young inflorescence and you are growing broccoli and cauliflower, recorded in southern Italy by the fifteenth century. Six vegetables, one species — a masterclass in what selection can do without ever leaving a gene pool.\r\n\r\n## The family's chemical weapon\r\n\r\nWhat unifies the family below the table is a two-part bomb. Its cells store sulfur-rich compounds called glucosinolates in one compartment and an enzyme, myrosinase, in another. Damage a leaf — bite it, grate it, freeze it — and the barrier breaks: enzyme meets precursor and the tissue floods with isothiocyanates, the mustard oils. That explosion is the family's defense against insects and disease, and horticulture has taken it in three directions at once. Bred down, it survives as the bitterness of cooked sprouts and cauliflower, felt more or less keenly depending on your taste receptors. Bred up, it is the condiment line: mustard seed, wasabi, horseradish, arugula, watercress. And farmed deliberately, it becomes biofumigation — mustard cover crops turned into the soil so their chemistry suppresses the pests and diseases of the crop that follows.\r\n\r\n## From field to border\r\n\r\nAt field scale the same genus feeds the press: canola is Brassica napus bred for its seed oil, while the very same species grown for a swollen root is the rutabaga — one species, two destinies, the family's signature move. Turnips and bok choy play the same trick within Brassica rapa, and the radish family drills compacted soil as a cover crop when no one is harvesting it. Meanwhile the family never abandoned the border: stock and wallflower for scent, honesty for its silver coin pods, candytuft for spring whites, sweet alyssum edging the path — all bearing the same four petals as the broccoli left too long in the bed."
    },
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Brassica_oleracea",
        "label": "Brassica oleracea — Wikipedia"
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
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "brassicas-horticulture",
      "puzzleRevision": "fnv1a32:47f7ce67",
      "board": {
        "width": 1190,
        "height": 770
      },
      "nodes": {
        "term:cabbage": {
          "x": 866.67,
          "y": 183.52
        },
        "term:broccoli": {
          "x": 954.69,
          "y": 229.41
        },
        "term:kale": {
          "x": 1043.84,
          "y": 240.25
        },
        "term:cauliflower": {
          "x": 1002.67,
          "y": 330.54
        },
        "term:Brussels sprouts": {
          "x": 1071.69,
          "y": 429.63
        },
        "term:kohlrabi": {
          "x": 909.55,
          "y": 440.52
        },
        "term:turnip": {
          "x": 970.08,
          "y": 535.54
        },
        "term:radish": {
          "x": 1014.7,
          "y": 613.45
        },
        "term:bok choy": {
          "x": 928.91,
          "y": 656.72
        },
        "term:rutabaga": {
          "x": 836.76,
          "y": 702.56
        },
        "term:wasabi": {
          "x": 402.18,
          "y": 670.71
        },
        "term:mustard": {
          "x": 309.3,
          "y": 673.78
        },
        "term:horseradish": {
          "x": 246.29,
          "y": 585.21
        },
        "term:arugula": {
          "x": 172.04,
          "y": 505.83
        },
        "term:watercress": {
          "x": 240.86,
          "y": 425.85
        },
        "term:canola": {
          "x": 719.8,
          "y": 735.38
        },
        "term:tillage radish": {
          "x": 605.66,
          "y": 748
        },
        "term:camelina": {
          "x": 484.78,
          "y": 738.08
        },
        "term:glucosinolates": {
          "x": 211.72,
          "y": 239.76
        },
        "term:myrosinase": {
          "x": 270.61,
          "y": 126.48
        },
        "term:sweet alyssum": {
          "x": 405.73,
          "y": 69.36
        },
        "term:honesty": {
          "x": 509.56,
          "y": 22
        },
        "term:stock": {
          "x": 599.26,
          "y": 22.96
        },
        "term:wallflower": {
          "x": 698.49,
          "y": 22
        },
        "term:candytuft": {
          "x": 780.5,
          "y": 97.81
        },
        "term:Mustard oils": {
          "x": 360.52,
          "y": 406.35
        },
        "term:Biofumigation": {
          "x": 487.37,
          "y": 438.11
        },
        "term:Bitterness": {
          "x": 607.79,
          "y": 303.23
        },
        "term:Cultivar groups": {
          "x": 676.55,
          "y": 419.42
        },
        "term:Four-petal cross": {
          "x": 711.2,
          "y": 208.62
        },
        "cluster:0": {
          "x": 840.47,
          "y": 330.87
        },
        "cluster:1": {
          "x": 814.28,
          "y": 541.9
        },
        "cluster:2": {
          "x": 381.46,
          "y": 548.06
        },
        "cluster:3": {
          "x": 590.59,
          "y": 575.32
        },
        "cluster:4": {
          "x": 386.58,
          "y": 239.94
        },
        "cluster:5": {
          "x": 557.36,
          "y": 148.44
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T08:07:32.169Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "brassicas-horticulture",
      "puzzleRevision": "fnv1a32:47f7ce67",
      "board": {
        "width": 1190,
        "height": 770
      },
      "nodes": {
        "term:cabbage": {
          "x": 540.66,
          "y": 201.82,
          "pinned": false
        },
        "term:broccoli": {
          "x": 445.89,
          "y": 83.31,
          "pinned": true
        },
        "term:kale": {
          "x": 620.94,
          "y": 76.96,
          "pinned": true
        },
        "term:cauliflower": {
          "x": 728.44,
          "y": 80.04,
          "pinned": true
        },
        "term:Brussels sprouts": {
          "x": 668.94,
          "y": 201.05,
          "pinned": false
        },
        "term:kohlrabi": {
          "x": 553.06,
          "y": 29.38,
          "pinned": false
        },
        "term:turnip": {
          "x": 768.07,
          "y": 277.73,
          "pinned": false
        },
        "term:radish": {
          "x": 858.22,
          "y": 195.43,
          "pinned": true
        },
        "term:bok choy": {
          "x": 924.42,
          "y": 250.94,
          "pinned": true
        },
        "term:rutabaga": {
          "x": 851.81,
          "y": 332.53,
          "pinned": false
        },
        "term:wasabi": {
          "x": 843.82,
          "y": 661.69,
          "pinned": true
        },
        "term:mustard": {
          "x": 847.9,
          "y": 441.08,
          "pinned": true
        },
        "term:horseradish": {
          "x": 990.49,
          "y": 661.28,
          "pinned": true
        },
        "term:arugula": {
          "x": 939.1,
          "y": 588.19,
          "pinned": true
        },
        "term:watercress": {
          "x": 911.22,
          "y": 495.61,
          "pinned": true
        },
        "term:canola": {
          "x": 564.47,
          "y": 471.15,
          "pinned": true
        },
        "term:tillage radish": {
          "x": 690.9,
          "y": 473.95,
          "pinned": true
        },
        "term:camelina": {
          "x": 695.43,
          "y": 560.76,
          "pinned": true
        },
        "term:glucosinolates": {
          "x": 344.76,
          "y": 660.25,
          "pinned": true
        },
        "term:myrosinase": {
          "x": 280,
          "y": 574.6,
          "pinned": true
        },
        "term:sweet alyssum": {
          "x": 303.76,
          "y": 319.65,
          "pinned": false
        },
        "term:honesty": {
          "x": 267.79,
          "y": 432.98,
          "pinned": false
        },
        "term:stock": {
          "x": 201.43,
          "y": 366.76,
          "pinned": false
        },
        "term:wallflower": {
          "x": 279.14,
          "y": 193.57,
          "pinned": false
        },
        "term:candytuft": {
          "x": 189.92,
          "y": 267.37,
          "pinned": false
        },
        "term:Mustard oils": {
          "x": 656.2,
          "y": 665.13,
          "pinned": true
        },
        "term:Biofumigation": {
          "x": 515.8,
          "y": 570.98,
          "pinned": true
        },
        "term:Bitterness": {
          "x": 498.65,
          "y": 330.84,
          "pinned": false
        },
        "term:Cultivar groups": {
          "x": 631.98,
          "y": 350.19,
          "pinned": false
        },
        "term:Four-petal cross": {
          "x": 409.05,
          "y": 221.99,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5536.53,
        "score": 5536.5309414182075
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T08:09:00.878Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "brassicas-horticulture",
      "puzzleRevision": "fnv1a32:47f7ce67",
      "board": {
        "width": 1190,
        "height": 770
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 672.67,
          "y": 154.85,
          "pinned": true
        },
        "cluster:1": {
          "x": 1038.85,
          "y": 324.71,
          "pinned": true
        },
        "cluster:2": {
          "x": 987.07,
          "y": 623.61,
          "pinned": true
        },
        "cluster:3": {
          "x": 667.69,
          "y": 529.58,
          "pinned": true
        },
        "cluster:4": {
          "x": 266.66,
          "y": 616.64,
          "pinned": true
        },
        "cluster:5": {
          "x": 194.96,
          "y": 198.24,
          "pinned": true
        }
      },
      "bridges": {
        "term:Mustard oils": {
          "x": 643.26,
          "y": 705.96,
          "pinned": true
        },
        "term:Biofumigation": {
          "x": 515.8,
          "y": 570.98,
          "pinned": false
        },
        "term:Bitterness": {
          "x": 498.65,
          "y": 330.84,
          "pinned": false
        },
        "term:Cultivar groups": {
          "x": 782.35,
          "y": 361.14,
          "pinned": true
        },
        "term:Four-petal cross": {
          "x": 409.05,
          "y": 221.99,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "cabbage",
          "broccoli",
          "kale",
          "cauliflower",
          "Brussels sprouts",
          "kohlrabi"
        ],
        "cluster:1": [
          "turnip",
          "radish",
          "bok choy",
          "rutabaga"
        ],
        "cluster:2": [
          "wasabi",
          "mustard",
          "horseradish",
          "arugula",
          "watercress"
        ],
        "cluster:3": [
          "canola",
          "tillage radish",
          "camelina"
        ],
        "cluster:4": [
          "glucosinolates",
          "myrosinase"
        ],
        "cluster:5": [
          "sweet alyssum",
          "honesty",
          "stock",
          "wallflower",
          "candytuft"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "cabbage",
          "kohlrabi",
          "Brussels sprouts",
          "cauliflower",
          "broccoli",
          "kale"
        ],
        "cluster:1": [
          "radish",
          "rutabaga",
          "bok choy",
          "turnip"
        ],
        "cluster:2": [
          "wasabi",
          "arugula",
          "horseradish",
          "watercress",
          "mustard"
        ],
        "cluster:3": [
          "canola",
          "tillage radish",
          "camelina"
        ],
        "cluster:4": [
          "glucosinolates",
          "myrosinase"
        ],
        "cluster:5": [
          "stock",
          "candytuft",
          "sweet alyssum",
          "wallflower",
          "honesty"
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
        "totalLength": 1786.6568266382435
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T08:10:51.199Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-17T08:09:07.154Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
