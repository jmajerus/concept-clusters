// Generated from content/puzzles/manul-under-pressure.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "manul-under-pressure",
  "title": "The Manul Under Pressure",
  "category": "zoology",
  "info": {
    "text": "Pallas's cat, or manul: how it lives, and what poison, pelts and zoos cost it.",
    "citations": [
      {
        "title": "Pallas's cat — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Pallas%27s_cat"
      },
      {
        "title": "Four new genome sequences of the Pallas's cat (Otocolobus manul): an insight into the patterns of within-species variability",
        "author": "J. Bubenikova, M. Plasil, P. A. Burger, P. Horin",
        "publisher": "Frontiers in Genetics",
        "year": "2024",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39720181/"
      },
      {
        "title": "Wild Cats: Status Survey and Conservation Action Plan",
        "author": "K. Nowell & P. Jackson",
        "publisher": "IUCN/SSC Cat Specialist Group",
        "year": "1996"
      },
      {
        "title": "Exploring the ecologic basis for extreme susceptibility of Pallas' cats (Otocolobus manul) to fatal toxoplasmosis",
        "author": "M. Brown, M. R. Lappin, J. L. Brown, B. Munkhtsog, W. F. Swanson",
        "publisher": "Journal of Wildlife Diseases",
        "year": "2005",
        "url": "https://pubmed.ncbi.nlm.nih.gov/16456157/"
      },
      {
        "title": "Use of clindamycin in Pallas' cats [Otocolobus (Felis) manul] to reduce juvenile toxoplasmosis-associated mortality rates",
        "author": "S. J. Girling, R. Pizzi, A. D. Naylor, et al.",
        "publisher": "Journal of Zoo and Wildlife Medicine",
        "year": "2020",
        "url": "https://pubmed.ncbi.nlm.nih.gov/32212544/"
      }
    ]
  },
  "clusters": [
    {
      "id": "genus-of-one",
      "name": "A genus of one",
      "color": "teal",
      "fact": "One ancient species alone in its genus — named by Pallas in 1776 and long misfiled among the domestic cats it doesn't resemble.",
      "terms": [
        "Otocolobus manul",
        "Peter Simon Pallas",
        "Miocene split from the leopard cats"
      ],
      "seeds": [
        "Otocolobus manul",
        "Peter Simon Pallas"
      ],
      "termInfo": {
        "Otocolobus manul": "The manul's scientific binomial. Its genus, Otocolobus (Brandt, 1841), contains this single species — Pocock studied its odd skull in 1907 and still considered it an aberrant form of Felis. Its everyday name, manul, is Mongolian (manol in Kyrgyz).",
        "Peter Simon Pallas": "The German naturalist described Felis manul in 1776 from a cat he encountered near the Dzhida River southeast of Lake Baikal; William Thomas Blanford later coined the common name 'Pallas's cat' in his honor.",
        "Miocene split from the leopard cats": "Nuclear-DNA phylogenies place the manul with the leopard-cat genus Prionailurus in the Leopard Cat lineage, one of the eight lineages of modern Felidae. The manul's line branched off in the late Miocene, about 8.6–4.8 million years ago, and has evolved alone ever since."
      },
      "info": "Naming and phylogeny from the Wikipedia species account; lineage placement confirmed by genome work in Bubenikova et al. (2024)."
    },
    {
      "id": "short-summer",
      "name": "Racing the short summer",
      "color": "blue",
      "fact": "The whole reproductive year compresses into a few weeks of courtship and a single litter — kits must be hunting before the steppe freezes again.",
      "terms": [
        "one spring litter a year",
        "a fertile window of a day or two",
        "first hunt at five months"
      ],
      "seeds": [
        "one spring litter a year",
        "a fertile window of a day or two"
      ],
      "termInfo": {
        "one spring litter a year": "Wild females give birth to 2–6 kittens once a year between late April and late May, after a 66–75-day gestation, in dens among rocks or in taken-over marmot burrows.",
        "a fertile window of a day or two": "Estrus lasts only 26–42 hours: the female is fertile for barely a day or two a year, and missing that window means waiting a whole year for the next litter. Males run a matching seasonal testosterone surge.",
        "first hunt at five months": "Kittens start hunting at about five months and reach adult size at six to seven months — full growth earned before their first winter."
      },
      "info": "Estrus, gestation, and development from the Wikipedia species account (Schauenberg 1978; Mellen 1989; Swanson et al. 1996)."
    },
    {
      "id": "solitary-wide",
      "name": "Solitary and wide-ranging",
      "color": "amber",
      "fact": "A low-density loner over enormous shared ranges — seen mostly at dusk and dawn, and never for long in one den.",
      "terms": [
        "solitary adults",
        "huge, overlapping home ranges",
        "a new den every few days",
        "active at dusk and dawn"
      ],
      "seeds": [
        "solitary adults",
        "huge, overlapping home ranges"
      ],
      "termInfo": {
        "solitary adults": "Adults live and hunt alone; the only lasting social bond is a female with her current litter.",
        "huge, overlapping home ranges": "Mongolian radio-telemetry found female ranges of 7.4–125.2 km² and male ranges up to 207 km², overlapping one another — enormous areas for a 2.5–4.5 kg cat.",
        "a new den every few days": "Twenty-nine collared cats used 101 dens in two years of study, staying 2–28 days apiece — winter dens near ravines, summer dens in cool rocky habitat.",
        "active at dusk and dawn": "In central Mongolia the cats were mainly crepuscular from May to August but increasingly active by day from September to November; livestock presence pushes activity toward the night."
      },
      "info": "Den, range, and activity findings from the Wikipedia species account (Ross et al. 2010, 2012; Anile et al. 2021)."
    },
    {
      "id": "under-pressure",
      "name": "A specialist under pressure",
      "color": "magenta",
      "fact": "Globally Least Concern because the range is vast — yet locally ground down by poisoned prey, pelts, dogs, and fragmentation.",
      "terms": [
        "globally Least Concern",
        "pika poisoning",
        "Endangered in China",
        "the pelt trade",
        "herding dogs and traps"
      ],
      "seeds": [
        "globally Least Concern",
        "pika poisoning"
      ],
      "termInfo": {
        "globally Least Concern": "The 2020 IUCN global assessment rests on the species's huge range and assumed large population — a label about breadth, not about local abundance.",
        "pika poisoning": "On the Tibetan Plateau, 54,147 km² of grassland were poisoned against pikas between 2005 and 2009, erasing an estimated 50,000–80,000 tonnes of pika biomass; Mongolian rodent control relied on the rodenticide bromadiolone.",
        "Endangered in China": "National lists tell the local story the global label hides: Endangered in China, Near Threatened in Mongolia since 2006, and proposed Critically Endangered in Turkmenistan.",
        "the pelt trade": "More than 10,000 skins were taken annually during the 20th-century fur trade; Mongolia exported 9,185 skins in 1987 before international trade ceased in 1988 — though domestic trade for medicine continues there.",
        "herding dogs and traps": "Free-roaming herding dogs kill manuls in Iran, Kazakhstan, and the Altai; traps set for small mammals and Transbaikal poaching add local losses. Hunting is prohibited in every range country except Mongolia."
      },
      "info": "Status and threats from the Wikipedia species account (Wu & Wang 2017; Nowell & Jackson 1996; IUCN Red List assessment 2020)."
    },
    {
      "id": "fragile-in-zoos",
      "name": "Fragile far from home",
      "color": "olive",
      "fact": "Zoos have bred manuls in managed programmes since the 1980s to keep a reserve population, but far from the steppe the manul meets a parasite its home rarely exposes it to, and breeding becomes a decades-long struggle.",
      "terms": [
        "deadly toxoplasmosis",
        "high zoo kitten mortality",
        "first artificial insemination"
      ],
      "seeds": [
        "deadly toxoplasmosis",
        "high zoo kitten mortality"
      ],
      "termInfo": {
        "deadly toxoplasmosis": "Toxoplasma gondii, spread by domestic cats and their prey, is rare where wild manuls live: a Mongolian study found it in 2 of 15 wild manuls and in none of the local house cats or prey tested, while every zoo manul tested had been exposed. Meeting it first in captivity proved deadly, demanding serology testing, strict hygiene, and clindamycin trials.",
        "high zoo kitten mortality": "North American zoos lost about 60% of newborn kittens, mostly to toxoplasmosis — the worst first-month record of any small wild cat; European collections recorded 71.6% first-year mortality from all causes in 2006–2016.",
        "first artificial insemination": "The first manul kittens from artificial insemination were born at the Cincinnati Zoo in 2011 after a 69-day gestation — the product of decades of reproductive research on an intractable species."
      },
      "info": "Breeding programmes and the 2011 insemination first from the Wikipedia species account; toxoplasmosis exposure and zoo mortality from Brown et al. (2005) and Girling et al. (2020)."
    }
  ],
  "bridges": [
    {
      "id": "spread-thin",
      "term": "spread thin",
      "clusters": [
        2,
        3
      ],
      "fact": "Solitary cats spread thinly across home ranges of up to ~207 km² are easy to disrupt and hard to count — global Least Concern rests on breadth of range, not local abundance.",
      "info": "A species can be everywhere and still be rare somewhere; the global label summarizes the map, not any single valley.",
      "idealTerms": [
        "huge, overlapping home ranges",
        "globally Least Concern"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "a-calendar-zoos-cant-fake",
      "term": "a calendar zoos can't fake",
      "clusters": [
        1,
        4
      ],
      "fact": "The same hours-long, tightly seasonal estrus that synchronizes wild kits makes captive breeding and assisted reproduction hard — the first artificial insemination success came only in 2011, after decades of work.",
      "info": "Wild timing is everything: one short window, one litter, no second chances — which is precisely what makes assisted reproduction difficult.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "a fertile window of a day or two",
        "first artificial insemination"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 4
      }
    }
  ],
  "lenses": [
    {
      "id": "collateral-damage",
      "prompt": "In the wild, which pressures harm the manul without anyone aiming at it?",
      "explanation": "Poison is laid for pikas and rodents, the manul's food. Herding dogs attack it as just another animal near the flock, and the traps that catch it were set for small mammals. The pelt trade is the exception: it hunted the manul on purpose, and international trade ended in 1988. Hunting is now banned in every range country except Mongolia, yet poison, dogs and traps go on killing manuls, because most of the pressure today is a side effect of herding and pest control.",
      "label": "Collateral damage",
      "targets": [
        "pika poisoning",
        "herding dogs and traps"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "manul-cold-steppe-cat",
        "reason": "Play the prequel: the cold steppe built this cat — its coat, its silhouette, its pika hunt. This board is about what that specialization costs.",
        "via": [
          "a calendar zoos can't fake"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "What specialization costs",
    "summary": "How the manul lives, why it is hard to count and hard to keep, and what people's pressures cost it.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "**Pallas's cat** (*Otocolobus manul*), or manul, is a small wild cat of the cold, high steppes of Central Asia. The steppe shaped its body; this lesson is about the rest of its life: an unusual family history, a breeding year squeezed into a few weeks, a solitary life spread across huge ranges, and what happens when people press in on all of that.\r\n\r\n## A cat with no close relatives\r\n\r\nPeter Simon Pallas described the manul in 1776 as *Felis manul*, and for a long time it was filed with the small cats of the genus *Felis*. Even Reginald Pocock, who studied its unusual skull in 1907, still treated it as an odd form of *Felis*. It is now placed alone in its own genus, *Otocolobus*. Its nearest living relatives are the leopard cats of the genus *Prionailurus*, and the two lines split somewhere between about 8.6 and 4.8 million years ago.\r\n\r\n## A year in a few weeks\r\n\r\nThe manul breeds once a year, and the female is fertile for only 26 to 42 hours. Males are just as seasonal: in the breeding season their testosterone runs about three times higher than the rest of the year. After a gestation of 66 to 75 days, two to six kittens are born between late April and late May. They start hunting at about five months, so they are nearly grown before their first winter.\r\n\r\n## Alone across huge ranges\r\n\r\nAdult manuls live alone; the only lasting bond is a mother with her kittens. In Mongolia, radio-collared females used home ranges of 7.4 to 125 km² and males up to 207 km², overlapping their neighbours'. The cats moved between many dens, staying a few days to a few weeks in each. They were mostly active at dusk and dawn in summer and more active by day in autumn.\r\n\r\n## Common on the map, scarce on the ground\r\n\r\nSince 2020 the IUCN has listed the manul as Least Concern worldwide, because its range is enormous. National lists tell a different story: it is Endangered in China and has been Near Threatened in Mongolia since 2006. A cat that lives alone at low density across huge ranges is hard to count, and it can disappear from one valley without changing the global picture.\r\n\r\nThe pressures are local and human. Between 2005 and 2009, 54,147 km² of Tibetan grassland was poisoned to kill pikas, the manul's main prey; in Mongolia, rodent control used the poison bromadiolone. The fur trade once took more than 10,000 skins a year, and Mongolia alone exported 9,185 in 1987, before international trade ended in 1988. Herding dogs kill manuls in Iran, Kazakhstan and the Altai, and others die in traps set for small mammals.\r\n\r\n## Fragile in captivity\r\n\r\nZoos in North America and Europe have run managed breeding programmes for the manul since the 1980s, tracked in an international studbook, to keep a genetically healthy reserve population. They have found it unusually hard to keep. In North American zoos about 60% of newborn kittens died, mainly from toxoplasmosis, a parasitic disease spread by domestic cats. In the wild, manuls seem to meet the parasite rarely: a study in Mongolia found it in only 2 of 15 wild manuls and in none of the local house cats or prey animals tested, while every zoo manul tested had been exposed. Why the species is so vulnerable is not fully known, but cats that grow up without the parasite meet it for the first time in captivity. Some European zoos have sharply cut kitten deaths by giving kittens the antibiotic clindamycin.\r\n\r\nBreeding is hard too, because a fertile window of a day or two leaves very little room for error. The first manul kittens conceived by artificial insemination were born at the Cincinnati Zoo in 2011, after decades of research.\r\n\r\n## What specialization costs\r\n\r\nThe manul's way of life suits the steppe: a short, tightly timed breeding season, thin populations spread over vast ranges, and little contact with the diseases of house cats. The same traits make it hard to count, easy to lose locally, and difficult to keep and breed in zoos."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "high"
      },
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "manul-under-pressure",
      "puzzleRevision": "fnv1a32:b02845b3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:Otocolobus manul": {
          "x": 812.12,
          "y": 505.49,
          "pinned": false
        },
        "term:Peter Simon Pallas": {
          "x": 965.82,
          "y": 484.43,
          "pinned": false
        },
        "term:Miocene split from the leopard cats": {
          "x": 853.71,
          "y": 301.04,
          "pinned": false
        },
        "term:one spring litter a year": {
          "x": 116.52,
          "y": 451.37,
          "pinned": false
        },
        "term:a fertile window of a day or two": {
          "x": 311.53,
          "y": 562.39,
          "pinned": false
        },
        "term:first hunt at five months": {
          "x": 102.93,
          "y": 653.26,
          "pinned": false
        },
        "term:solitary adults": {
          "x": 669.15,
          "y": 210.68,
          "pinned": false
        },
        "term:huge, overlapping home ranges": {
          "x": 489.47,
          "y": 260.94,
          "pinned": false
        },
        "term:a new den every few days": {
          "x": 579.02,
          "y": 65.53,
          "pinned": false
        },
        "term:active at dusk and dawn": {
          "x": 774.52,
          "y": 80.24,
          "pinned": false
        },
        "term:globally Least Concern": {
          "x": 296.54,
          "y": 181.5,
          "pinned": false
        },
        "term:pika poisoning": {
          "x": 156.6,
          "y": 100.15,
          "pinned": false
        },
        "term:Endangered in China": {
          "x": 273.93,
          "y": 357.18,
          "pinned": false
        },
        "term:the pelt trade": {
          "x": 268.54,
          "y": 23,
          "pinned": false
        },
        "term:herding dogs and traps": {
          "x": 126.65,
          "y": 258.74,
          "pinned": false
        },
        "term:deadly toxoplasmosis": {
          "x": 714.44,
          "y": 645.13,
          "pinned": false
        },
        "term:high zoo kitten mortality": {
          "x": 903.8,
          "y": 657,
          "pinned": false
        },
        "term:first artificial insemination": {
          "x": 627.32,
          "y": 462.5,
          "pinned": false
        },
        "term:spread thin": {
          "x": 424.47,
          "y": 99.52,
          "pinned": false
        },
        "term:a calendar zoos can't fake": {
          "x": 521.91,
          "y": 657,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4089.86,
        "score": 4089.856509295662
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:29:33.096Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "manul-under-pressure",
      "puzzleRevision": "fnv1a32:b02845b3",
      "board": {
        "width": 1160,
        "height": 860
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 915.61,
          "y": 277.31,
          "pinned": false
        },
        "cluster:1": {
          "x": 451.81,
          "y": 698,
          "pinned": false
        },
        "cluster:2": {
          "x": 165.16,
          "y": 438,
          "pinned": false
        },
        "cluster:3": {
          "x": 451.81,
          "y": 178,
          "pinned": false
        },
        "cluster:4": {
          "x": 915.61,
          "y": 598.69,
          "pinned": false
        }
      },
      "bridges": {
        "term:spread thin": {
          "x": 253.33,
          "y": 252.85,
          "pinned": false
        },
        "term:a calendar zoos can't fake": {
          "x": 713.56,
          "y": 720.4,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Otocolobus manul",
          "Peter Simon Pallas",
          "Miocene split from the leopard cats"
        ],
        "cluster:1": [
          "one spring litter a year",
          "a fertile window of a day or two",
          "first hunt at five months"
        ],
        "cluster:2": [
          "solitary adults",
          "huge, overlapping home ranges",
          "a new den every few days",
          "active at dusk and dawn"
        ],
        "cluster:3": [
          "globally Least Concern",
          "pika poisoning",
          "Endangered in China",
          "the pelt trade",
          "herding dogs and traps"
        ],
        "cluster:4": [
          "deadly toxoplasmosis",
          "high zoo kitten mortality",
          "first artificial insemination"
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
        "totalLength": 322.90105446517066
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T02:29:36.264Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "manul-under-pressure",
      "puzzleRevision": "fnv1a32:b02845b3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:Otocolobus manul": {
          "x": 797.59,
          "y": 22
        },
        "term:Peter Simon Pallas": {
          "x": 983.3,
          "y": 22
        },
        "term:Miocene split from the leopard cats": {
          "x": 445.93,
          "y": 203.81
        },
        "term:one spring litter a year": {
          "x": 918.4,
          "y": 658
        },
        "term:a fertile window of a day or two": {
          "x": 731.36,
          "y": 208.82
        },
        "term:first hunt at five months": {
          "x": 961.25,
          "y": 203.93
        },
        "term:solitary adults": {
          "x": 751.03,
          "y": 658
        },
        "term:huge, overlapping home ranges": {
          "x": 558.62,
          "y": 658
        },
        "term:a new den every few days": {
          "x": 360.46,
          "y": 607.19
        },
        "term:active at dusk and dawn": {
          "x": 715.88,
          "y": 521.32
        },
        "term:globally Least Concern": {
          "x": 89.3,
          "y": 658
        },
        "term:pika poisoning": {
          "x": 191.6,
          "y": 586.37
        },
        "term:Endangered in China": {
          "x": 263.5,
          "y": 287.3
        },
        "term:the pelt trade": {
          "x": 64.1,
          "y": 251.26
        },
        "term:herding dogs and traps": {
          "x": 295.39,
          "y": 462.05
        },
        "term:deadly toxoplasmosis": {
          "x": 374.97,
          "y": 22
        },
        "term:high zoo kitten mortality": {
          "x": 655.05,
          "y": 96.72
        },
        "term:first artificial insemination": {
          "x": 192.33,
          "y": 203.81
        },
        "term:spread thin": {
          "x": 308.39,
          "y": 658
        },
        "term:a calendar zoos can't fake": {
          "x": 640.08,
          "y": 325.51
        },
        "cluster:0": {
          "x": 852.18,
          "y": 91.04
        },
        "cluster:1": {
          "x": 828,
          "y": 261.36
        },
        "cluster:2": {
          "x": 491.24,
          "y": 456.93
        },
        "cluster:3": {
          "x": 105.05,
          "y": 421.85
        },
        "cluster:4": {
          "x": 554.15,
          "y": 22
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T02:29:39.372Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "auto",
    "savedAt": "2026-10-08T02:29:29.848Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
