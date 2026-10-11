// Generated from content/puzzles/legumes-horticulture.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "legumes-horticulture",
  "title": "Legumes: One Family, Many Garden Jobs",
  "category": "botany",
  "subcategories": {
    "botany": "horticulture"
  },
  "info": {
    "text": "One botanical family, sorted by what the grower takes from it: fresh pods, dry staples, oil, forage, and soil. The same nitrogen-fixing partnership runs under every group — and two lines, harvest stage and the oil press, explain why grocery names and botany disagree.",
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Legume",
        "label": "Legume — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Cover_crop",
        "label": "Cover crop — Wikipedia"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Root_nodule",
        "label": "Root nodule — Wikipedia"
      }
    ],
    "citations": [
      {
        "title": "Legume",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Legume"
      },
      {
        "title": "Root nodule",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Root_nodule"
      },
      {
        "title": "Cover crop",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Cover_crop"
      },
      {
        "title": "Phaseolus vulgaris",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Phaseolus_vulgaris"
      },
      {
        "title": "Peanut",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Peanut"
      }
    ]
  },
  "clusters": [
    {
      "id": "fresh-pods",
      "name": "Fresh pod vegetables",
      "color": "teal",
      "fact": "Grown to be eaten young: flat or fleshy pods and fresh shelled seeds taken before maturity. The FAO classes green beans and green peas as vegetable crops rather than pulses for exactly this reason — they are picked green.",
      "terms": [
        "garden pea",
        "green bean",
        "snow pea",
        "edamame"
      ],
      "seeds": [
        "garden pea",
        "green bean"
      ],
      "termInfo": {
        "garden pea": {
          "text": "Pisum sativum picked while plump and green and shelled fresh — the vegetable side of the harvest-stage split; dried, the same seed becomes split pea.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Pea",
              "label": "Pea — Wikipedia"
            }
          ]
        },
        "green bean": {
          "text": "The immature pod of Phaseolus vulgaris, eaten whole; the same species dried gives the kidney, pinto, and navy beans on FAO's pulse list.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Green_bean",
              "label": "Green bean — Wikipedia"
            }
          ]
        },
        "snow pea": {
          "text": "A pea harvested for its flat, immature pod and eaten pod-and-all before the seeds swell.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Pea",
              "label": "Pea — Wikipedia"
            }
          ]
        },
        "edamame": {
          "text": "Immature soybean pods, steamed or boiled green — the soft-picked twin of the dry oilseed crop.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Edamame",
              "label": "Edamame — Wikipedia"
            }
          ]
        }
      },
      "info": "If you eat the pod or the fresh seed within days of picking, it lives here."
    },
    {
      "id": "pulses",
      "name": "Pulses: the dry staples",
      "color": "amber",
      "fact": "Left to dry on the plant so the seed stores for months — the protein staples that pair with cereals. FAO reserves the word pulse for legumes harvested solely for the dry seed, and recognizes eleven primary pulse crops.",
      "terms": [
        "lentil",
        "chickpea",
        "faba bean",
        "cowpea",
        "pigeon pea"
      ],
      "seeds": [
        "lentil",
        "chickpea"
      ],
      "termInfo": {
        "lentil": {
          "text": "Lens culinaris, among the oldest crops on earth; a cool-season pulse that often precedes wheat in dryland rotations.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Lentil",
              "label": "Lentil — Wikipedia"
            }
          ]
        },
        "chickpea": {
          "text": "Cicer arietinum, the garbanzo — a FAO primary pulse and the Mediterranean's dry staple.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Chickpea",
              "label": "Chickpea — Wikipedia"
            }
          ]
        },
        "faba bean": {
          "text": "Vicia faba, the broad bean — an Old World pulse that doubles as a soil-building cover in mild-winter gardens.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Vicia_faba",
              "label": "Vicia faba — Wikipedia"
            }
          ]
        },
        "cowpea": {
          "text": "Vigna unguiculata, the black-eyed pea — a hot-weather pulse that tolerates poor soils.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Cowpea",
              "label": "Cowpea — Wikipedia"
            }
          ]
        },
        "pigeon pea": {
          "text": "Cajanus cajan, a woody tropical pulse grown across South Asia and Africa.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Pigeon_pea",
              "label": "Pigeon pea — Wikipedia"
            }
          ]
        }
      },
      "info": "If it ships dry in a sack and keeps for a year, it lives here."
    },
    {
      "id": "oilseeds",
      "name": "Oilseed legumes",
      "color": "blue",
      "fact": "Grown for the crusher: oil for food and industry, protein-rich meal for feed. FAO excludes both from the pulse list for that reason — and the peanut obligingly ripens its pod underground, where it stays closed.",
      "terms": [
        "soybean",
        "peanut"
      ],
      "seeds": [
        "soybean"
      ],
      "termInfo": {
        "soybean": {
          "text": "Glycine max — the world's dominant oilseed legume, crushed for oil and high-protein meal, and FAO's headline exclusion from the pulse list.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Soybean",
              "label": "Soybean — Wikipedia"
            }
          ]
        },
        "peanut": {
          "text": "Arachis hypogaea sets its pod underground after flowering and keeps it closed — an indehiscent legume grown mainly for oil.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Peanut",
              "label": "Peanut — Wikipedia"
            }
          ]
        }
      },
      "info": "If the seed is worth more crushed than cooked, it lives here."
    },
    {
      "id": "soil-and-feed",
      "name": "Forage & cover crops",
      "color": "olive",
      "fact": "Grown for the whole plant and never for a seed crop: cut or grazed where the harvest is feed, killed in place where it is soil. Either way, the nitrogen these plants fixed stays in the farming system.",
      "terms": [
        "alfalfa",
        "white clover",
        "birdsfoot trefoil",
        "hairy vetch",
        "sunn hemp",
        "sweet clover"
      ],
      "seeds": [
        "alfalfa",
        "white clover"
      ],
      "termInfo": {
        "alfalfa": {
          "text": "Medicago sativa, the 'queen of forages' — cut several times a season for high-protein hay.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Alfalfa",
              "label": "Alfalfa — Wikipedia"
            }
          ]
        },
        "white clover": {
          "text": "Trifolium repens, the low stoloniferous legume of pastures and lawns — grazed, and quietly fixing nitrogen.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/White_clover",
              "label": "White clover — Wikipedia"
            }
          ]
        },
        "birdsfoot trefoil": {
          "text": "Lotus corniculatus, a non-bloating forage legume for pasture and hay.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Lotus_corniculatus",
              "label": "Lotus corniculatus — Wikipedia"
            }
          ]
        },
        "hairy vetch": {
          "text": "Vicia villosa, the hardy winter-annual cover crop — killed in spring to release its nitrogen to the crop that follows.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Vicia_villosa",
              "label": "Vicia villosa — Wikipedia"
            }
          ]
        },
        "sunn hemp": {
          "text": "Crotalaria juncea, a fast tropical green manure that builds nitrogen and suppresses weeds before it is turned in.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Crotalaria_juncea",
              "label": "Crotalaria juncea — Wikipedia"
            }
          ]
        },
        "sweet clover": {
          "text": "Melilotus officinalis, the deep-rooted biennial green manure whose residues suppress weeds after termination.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Melilotus_officinalis",
              "label": "Melilotus officinalis — Wikipedia"
            }
          ]
        }
      },
      "info": "If nobody harvests a seed crop — the whole plant is the product — it lives here."
    },
    {
      "id": "nitrogen-fixing",
      "name": "The nitrogen-fixing machinery",
      "color": "brown",
      "fact": "Rhizobia housed in root nodules turn atmospheric nitrogen into plant food; when the plant dies, that nitrogen feeds the soil. Growers match bacterial strain to crop by inoculating seed before planting.",
      "terms": [
        "root nodule",
        "nitrogen fixation",
        "rhizobia",
        "seed inoculation"
      ],
      "seeds": [
        "root nodule",
        "nitrogen fixation"
      ],
      "termInfo": {
        "rhizobia": {
          "text": "The soil bacteria that trade fixed nitrogen for plant sugar — each legume species partners with specific strains.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Rhizobia",
              "label": "Rhizobia — Wikipedia"
            }
          ]
        },
        "root nodule": {
          "text": "The root organ the plant builds to house its rhizobia — pink inside, where leghemoglobin keeps oxygen in check.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Root_nodule",
              "label": "Root nodule — Wikipedia"
            }
          ]
        },
        "nitrogen fixation": {
          "text": "The conversion of atmospheric N2 into ammonia — the reaction that powers every other cluster on this board.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Root_nodule",
              "label": "Root nodule — Wikipedia"
            }
          ]
        },
        "seed inoculation": "Coating seed with a host-specific rhizobial strain before planting, so the right partner is present from the start."
      },
      "info": "The partnership every other cluster on this board quietly runs on."
    },
    {
      "id": "climbing",
      "name": "Climbing architecture",
      "color": "magenta",
      "fact": "Peas ascend by tendrils and pole beans by twining stems, while breeders compressed both strategies into self-supporting bush forms — the choice that decides whether a planting needs a trellis at all.",
      "terms": [
        "tendril",
        "bush habit",
        "twining stem"
      ],
      "seeds": [
        "tendril",
        "bush habit"
      ],
      "termInfo": {
        "tendril": {
          "text": "A modified leaf or stem tip that coils around supports — the pea's climbing tool.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Tendril",
              "label": "Tendril — Wikipedia"
            }
          ]
        },
        "twining stem": {
          "text": "The whole shoot winds helically up its support, as pole beans do — no special organ, just spiral growth.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Phaseolus_vulgaris",
              "label": "Phaseolus vulgaris — Wikipedia"
            }
          ]
        },
        "bush habit": {
          "text": "The bred, self-supporting form — determinate plants 20–60 cm tall that skip the trellis.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Phaseolus_vulgaris",
              "label": "Phaseolus vulgaris — Wikipedia"
            }
          ]
        }
      },
      "info": "How the plant gets vertical — and what you have to build for it."
    }
  ],
  "bridges": [
    {
      "id": "nitrogen-sharing",
      "term": "Nitrogen sharing",
      "clusters": [
        4,
        3
      ],
      "fact": "A living forage legume feeds its companion grasses: fixed nitrogen moves underground while both grow, which is why mixed grass–legume swards out-perform grass alone.",
      "info": "Pasture managers seed clover into living grass for exactly this — the legume pays the nitrogen bill while both grow.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "green-manure",
      "term": "Green manure",
      "clusters": [
        4,
        3
      ],
      "fact": "Terminated and turned in, a cover-crop legume releases its fixed nitrogen to the crop that follows — in good stands, enough to replace much of the fertilizer that crop would otherwise need.",
      "info": "Agronomists call the payoff the fertilizer replacement value: what the next crop needs, minus what the killed legume supplies.",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "crop-rotation",
      "term": "Crop rotation",
      "clusters": [
        4,
        1
      ],
      "fact": "A pulse returns its nitrogen to the soil when it dies or is harvested, which is why lentils or peas so often precede wheat — fertilizer credit and a break from cereal pests in one rotation.",
      "info": "Before synthetic fertilizer, this credit was the point of the old four-course rotation — a clover year, then wheat.",
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 1
      }
    },
    {
      "id": "harvest-stage",
      "term": "Harvest stage",
      "clusters": [
        0,
        1
      ],
      "fact": "One species, two crops: picked soft it is a vegetable — garden pea, edamame, green bean — dried down it is a pulse. FAO's pulse line is drawn at harvest stage, not at species.",
      "info": "The freezer aisle hides it: frozen edamame and dried soybeans are one species at two moments, sold under two names.",
      "relationKind": "contrast"
    },
    {
      "id": "trellis",
      "term": "Trellis",
      "clusters": [
        0,
        5
      ],
      "fact": "Tendrils and twining stems made peas and pole beans the classic vertical garden; a bush form exists for each, so the same crop can be grown with or without the support.",
      "info": "Supports must match the grip: tendrils want thin mesh or twine to coil around; twining stems want a pole thick enough to wind on."
    },
    {
      "id": "oil-extraction",
      "term": "Oil extraction",
      "clusters": [
        1,
        2
      ],
      "fact": "What separates a pulse from an oilseed is the press: soybeans and peanuts are excluded from FAO's pulse list because they are grown mainly for their oil.",
      "info": "One crush, two products: the oil for kitchens and industry, the protein meal for livestock feed.",
      "relationKind": "contrast"
    }
  ],
  "lenses": [
    {
      "id": "killed-in-place",
      "prompt": "Inside the whole-plant cluster, some species exist to be killed in place — their nitrogen turned under for the next crop — while the rest are cut or grazed for feed. Which three are the kill-in-place cover crops?",
      "explanation": "Hairy vetch, sunn hemp, and sweet clover are grown to be terminated into the soil. Alfalfa, white clover, and birdsfoot trefoil are the forage half of the cluster — their harvest is the living plant itself, cut or grazed.",
      "color": "olive",
      "targets": [
        "hairy vetch",
        "sunn hemp",
        "sweet clover"
      ],
      "reasons": {
        "hairy vetch": "The hardy winter-annual cover: mowed or turned under in spring to feed the crop that follows.",
        "sunn hemp": "A fast tropical green manure, terminated long before seed to bank nitrogen.",
        "sweet clover": "The deep-rooted biennial green manure, whose residues keep suppressing weeds after termination."
      }
    },
    {
      "id": "one-species-two-crops",
      "prompt": "One species on this board is sold in two lives: picked green and steamed in the pod — and dried down for oil and feed meal. Which two terms are those two lives?",
      "explanation": "Edamame and soybean are one species (Glycine max) at two harvest stages: soft-picked it is a vegetable, dried down it is an oilseed. Peanut fails both halves — it is never steamed green in the pod, and it was always an oilseed — and garden pea's dry twin (split pea) never joined this board.",
      "color": "cyan",
      "targets": [
        "edamame",
        "soybean"
      ],
      "reasons": {
        "edamame": "The immature soybean: harvested green and steamed or boiled in the pod as a vegetable.",
        "soybean": "The same species left to dry on the plant — the world's dominant oilseed, crushed for oil and meal."
      }
    },
    {
      "id": "the-partner",
      "prompt": "Every plant on this board — fresh pod, dry pulse, oilseed, or hay — runs the same underground partnership. Which term names the partner itself, rather than the organ it lives in or the reaction it runs?",
      "explanation": "Rhizobia are the partner: soil bacteria that trade fixed nitrogen for plant sugar. The root nodule is the organ the plant builds to house them, nitrogen fixation is the reaction they run inside it, and seed inoculation is how growers make sure the right strain is waiting at planting.",
      "color": "brown",
      "targets": [
        "rhizobia"
      ],
      "reasons": {
        "rhizobia": "The partner itself — strain-matched bacteria whose nitrogen the plant host feeds for sugar."
      }
    },
    {
      "id": "leaving-the-ground",
      "prompt": "Two of these terms name the plant's own climbing tools — the pea's gripper and the bean's whole-stem strategy. Which two?",
      "explanation": "The tendril is the pea's tool: a modified tip that coils around anything thin enough to grip. The twining stem is the pole bean's strategy: the whole shoot winds helically up its support. Bush habit is the bred answer that skips climbing altogether, and the root nodule is an underground structure with nothing to do with support.",
      "color": "magenta",
      "targets": [
        "tendril",
        "twining stem"
      ],
      "reasons": {
        "tendril": "A modified leaf or stem tip that coils around thin supports — the pea's grip.",
        "twining stem": "The whole shoot winds helically up a pole — the pole bean's grip."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "flower-pollination-fruit",
        "reason": "See the machinery upstream of every pod on this board: how the flower that made each legume fruit actually works."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One family, six jobs",
    "summary": "Legumes fix nitrogen through an underground partnership; growers sort the family by what they harvest — fresh pods, dry staples, oil, feed, and soil — and the climbing habit decides whether you build a trellis.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every legume is a member of Fabaceae, the pea family — the third-largest family of flowering plants, and the one human cultivation leaned on hardest before synthetic fertilizer existed. The family's namesake is its fruit: a single pod, built from one carpel, that splits along two seams when dry. Everything growers do with legumes starts from that pod and from a second, invisible trait the family carries underground.\r\n\r\n## The partnership under every crop\r\n\r\nMost legumes host soil bacteria called rhizobia. The roots send out chemical invitations; compatible bacteria move in, and the plant builds tiny organs around them — root nodules, pink inside where an oxygen-buffering protein keeps the reaction safe. Inside these nodules the bacteria run a reaction no animal and almost no other crop plant can manage: they take atmospheric nitrogen — utterly inert N2 — and convert it into ammonia, the raw stock of amino acids and protein. The plant pays in sugar; the bacteria pay in nitrogen. It is the closest thing agriculture has to free fertility.\r\n\r\nAnd the credit does not stay on the legume's own books. When the plant dies — after harvest, after termination, after a winter kill — its nitrogen-rich tissues break down and return to the soil, available to whatever is planted next. That single fact explains the family's outsized role in rotations, in pastures, and in the old four-course systems that fed Europe before synthetic nitrogen existed.\r\n\r\n## Sorting by harvest, not by botany\r\n\r\nHorticulture divides the family by what the grower takes. Pick the pod soft and you are growing vegetables: green beans, snow peas, edamame. Let the same kinds of plants dry down and you have pulses — lentils, chickpeas, faba beans, cowpeas — the dry, storable staples that pair with cereals in the kitchen and precede them in the rotation. Grow for the crusher instead and you are in oilseed country: soybean and peanut, excluded from the pulse list precisely because their seed is worth more as oil and meal than as pantry stock. And when nobody harvests a seed crop at all, the whole plant is the product: alfalfa and the clovers cut or grazed as high-protein forage; hairy vetch and its relatives killed in place as green manure, their nitrogen turned under for the crop that follows — what agronomists tally as a fertilizer replacement value.\r\n\r\nThe lines between these groups are lines of harvest and use, not of species. Green bean and dry bean are one plant at two moments; edamame and the oilseed soybean likewise; split peas are simply mature garden peas.\r\n\r\n## The habit that shapes the garden\r\n\r\nOne more family trait shapes every planting: most of these crops climb. Peas grip with tendrils, pole beans wind their whole stem upward, and breeders have compressed both strategies into self-supporting bush forms — which is why seed catalogs offer the same crop two ways, and why the gardener's first real decision is whether to build a trellis."
    },
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Legume",
        "label": "Legume — Wikipedia"
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
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "legumes-horticulture",
      "puzzleRevision": "fnv1a32:257fec00",
      "board": {
        "width": 990,
        "height": 640
      },
      "nodes": {
        "term:garden pea": {
          "x": 301.08,
          "y": 444.66,
          "pinned": false
        },
        "term:green bean": {
          "x": 193.15,
          "y": 470.59,
          "pinned": false
        },
        "term:snow pea": {
          "x": 226.36,
          "y": 371.3,
          "pinned": false
        },
        "term:edamame": {
          "x": 266.98,
          "y": 540.31,
          "pinned": false
        },
        "term:lentil": {
          "x": 310.42,
          "y": 197.49,
          "pinned": false
        },
        "term:chickpea": {
          "x": 241.61,
          "y": 258.69,
          "pinned": false
        },
        "term:faba bean": {
          "x": 198.2,
          "y": 166.89,
          "pinned": false
        },
        "term:cowpea": {
          "x": 150.02,
          "y": 249.05,
          "pinned": false
        },
        "term:pigeon pea": {
          "x": 284.72,
          "y": 102.51,
          "pinned": false
        },
        "term:soybean": {
          "x": 409.99,
          "y": 23,
          "pinned": false
        },
        "term:peanut": {
          "x": 491.37,
          "y": 58.88,
          "pinned": false
        },
        "term:alfalfa": {
          "x": 655.56,
          "y": 120.3,
          "pinned": false
        },
        "term:white clover": {
          "x": 592.73,
          "y": 32.65,
          "pinned": false
        },
        "term:birdsfoot trefoil": {
          "x": 731.75,
          "y": 23,
          "pinned": false
        },
        "term:hairy vetch": {
          "x": 845.68,
          "y": 97.64,
          "pinned": false
        },
        "term:sunn hemp": {
          "x": 748.78,
          "y": 151.76,
          "pinned": false
        },
        "term:sweet clover": {
          "x": 782.81,
          "y": 260.72,
          "pinned": false
        },
        "term:root nodule": {
          "x": 564.02,
          "y": 295.47,
          "pinned": false
        },
        "term:nitrogen fixation": {
          "x": 680.46,
          "y": 366.15,
          "pinned": false
        },
        "term:rhizobia": {
          "x": 647.86,
          "y": 488.63,
          "pinned": false
        },
        "term:seed inoculation": {
          "x": 541.01,
          "y": 426.5,
          "pinned": false
        },
        "term:tendril": {
          "x": 447.94,
          "y": 502.98,
          "pinned": false
        },
        "term:bush habit": {
          "x": 534.42,
          "y": 556.23,
          "pinned": false
        },
        "term:twining stem": {
          "x": 429.81,
          "y": 609.29,
          "pinned": false
        },
        "term:Nitrogen sharing": {
          "x": 543.33,
          "y": 164.04,
          "pinned": false
        },
        "term:Green manure": {
          "x": 663.67,
          "y": 227.82,
          "pinned": false
        },
        "term:Crop rotation": {
          "x": 444.65,
          "y": 263.42,
          "pinned": false
        },
        "term:Harvest stage": {
          "x": 332.09,
          "y": 328.27,
          "pinned": false
        },
        "term:Trellis": {
          "x": 358.32,
          "y": 528.53,
          "pinned": false
        },
        "term:Oil extraction": {
          "x": 403.43,
          "y": 136.92,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4257.95,
        "score": 4257.949328132565
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:35:50.360Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "legumes-horticulture",
      "puzzleRevision": "fnv1a32:257fec00",
      "board": {
        "width": 1090,
        "height": 810
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 288.56,
          "y": 258.05,
          "pinned": false
        },
        "cluster:1": {
          "x": 638.86,
          "y": 201.33,
          "pinned": false
        },
        "cluster:2": {
          "x": 895.31,
          "y": 356.28,
          "pinned": false
        },
        "cluster:3": {
          "x": 451.14,
          "y": 624.67,
          "pinned": false
        },
        "cluster:4": {
          "x": 801.44,
          "y": 567.95,
          "pinned": false
        },
        "cluster:5": {
          "x": 194.69,
          "y": 469.72,
          "pinned": false
        }
      },
      "bridges": {
        "term:Nitrogen sharing": {
          "x": 626.29,
          "y": 518.31,
          "pinned": false
        },
        "term:Green manure": {
          "x": 646.19,
          "y": 644.35,
          "pinned": false
        },
        "term:Crop rotation": {
          "x": 720.15,
          "y": 384.64,
          "pinned": false
        },
        "term:Harvest stage": {
          "x": 453,
          "y": 255.56,
          "pinned": false
        },
        "term:Trellis": {
          "x": 313.69,
          "y": 393.73,
          "pinned": false
        },
        "term:Oil extraction": {
          "x": 815.13,
          "y": 258.91,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "garden pea",
          "green bean",
          "snow pea",
          "edamame"
        ],
        "cluster:1": [
          "lentil",
          "chickpea",
          "faba bean",
          "cowpea",
          "pigeon pea"
        ],
        "cluster:2": [
          "soybean",
          "peanut"
        ],
        "cluster:3": [
          "alfalfa",
          "white clover",
          "birdsfoot trefoil",
          "hairy vetch",
          "sunn hemp",
          "sweet clover"
        ],
        "cluster:4": [
          "root nodule",
          "nitrogen fixation",
          "rhizobia",
          "seed inoculation"
        ],
        "cluster:5": [
          "tendril",
          "bush habit",
          "twining stem"
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
        "totalLength": 809.6762225430233
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:35:52.797Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "legumes-horticulture",
      "puzzleRevision": "fnv1a32:257fec00",
      "board": {
        "width": 990,
        "height": 640
      },
      "nodes": {
        "term:garden pea": {
          "x": 707.1,
          "y": 118.15
        },
        "term:green bean": {
          "x": 863.78,
          "y": 108.04
        },
        "term:snow pea": {
          "x": 927.65,
          "y": 196.18
        },
        "term:edamame": {
          "x": 897.69,
          "y": 325.39
        },
        "term:lentil": {
          "x": 805.95,
          "y": 369.59
        },
        "term:chickpea": {
          "x": 877.23,
          "y": 433.3
        },
        "term:faba bean": {
          "x": 841.11,
          "y": 532.39
        },
        "term:cowpea": {
          "x": 765.66,
          "y": 596.89
        },
        "term:pigeon pea": {
          "x": 665.93,
          "y": 618
        },
        "term:soybean": {
          "x": 560.75,
          "y": 614.42
        },
        "term:peanut": {
          "x": 468.84,
          "y": 618
        },
        "term:alfalfa": {
          "x": 381.38,
          "y": 595.54
        },
        "term:white clover": {
          "x": 272.6,
          "y": 618
        },
        "term:birdsfoot trefoil": {
          "x": 130.79,
          "y": 599.1
        },
        "term:hairy vetch": {
          "x": 54.65,
          "y": 482.28
        },
        "term:sunn hemp": {
          "x": 165.76,
          "y": 454.43
        },
        "term:sweet clover": {
          "x": 80.21,
          "y": 361.13
        },
        "term:root nodule": {
          "x": 54.65,
          "y": 239.92
        },
        "term:nitrogen fixation": {
          "x": 155.87,
          "y": 145.17
        },
        "term:rhizobia": {
          "x": 120.56,
          "y": 22
        },
        "term:seed inoculation": {
          "x": 252.39,
          "y": 22.02
        },
        "term:tendril": {
          "x": 420.97,
          "y": 22
        },
        "term:bush habit": {
          "x": 658.69,
          "y": 22
        },
        "term:twining stem": {
          "x": 779.63,
          "y": 22
        },
        "term:Nitrogen sharing": {
          "x": 217.45,
          "y": 334.37
        },
        "term:Green manure": {
          "x": 414.08,
          "y": 359.22
        },
        "term:Crop rotation": {
          "x": 517.5,
          "y": 261.38
        },
        "term:Harvest stage": {
          "x": 656.63,
          "y": 309.66
        },
        "term:Trellis": {
          "x": 637.94,
          "y": 197.37
        },
        "term:Oil extraction": {
          "x": 550.43,
          "y": 394.23
        },
        "cluster:0": {
          "x": 793.51,
          "y": 236.3
        },
        "cluster:1": {
          "x": 702.47,
          "y": 468.2
        },
        "cluster:2": {
          "x": 467.34,
          "y": 510.96
        },
        "cluster:3": {
          "x": 310.03,
          "y": 471.23
        },
        "cluster:4": {
          "x": 347.29,
          "y": 190.84
        },
        "cluster:5": {
          "x": 536.45,
          "y": 100.78
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T02:35:55.273Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T02:35:47.582Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
