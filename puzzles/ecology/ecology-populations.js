// Generated from content/puzzles/ecology-populations.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "ecology-populations",
  "title": "How Populations Grow — and Why They Stop",
  "category": "ecology",
  "info": {
    "text": "How ecologists measure a population, model its growth with and without limits, explain what actually stops it in the wild, and read the reproductive strategy evolution wrote into it.",
    "links": [
      {
        "href": "https://openstax.org/books/biology-2e/pages/45-introduction",
        "label": "OpenStax Biology 2e, Chapter 45: Population and Community Ecology"
      }
    ],
    "citations": [
      {
        "title": "Biology 2e, §45.1 Population Demography",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/45-1-population-demography"
      },
      {
        "title": "Biology 2e, §45.2 Life Histories and Natural Selection",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/45-2-life-histories-and-natural-selection"
      },
      {
        "title": "Biology 2e, §45.3 Environmental Limits to Population Growth",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth"
      },
      {
        "title": "Biology 2e, §45.4 Population Dynamics and Regulation",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/45-4-population-dynamics-and-regulation"
      }
    ]
  },
  "clusters": [
    {
      "id": "describing-population",
      "name": "Describing a Population",
      "color": "teal",
      "fact": "Every growth story starts with a count: ecologists estimate how many individuals share an area, map how those individuals are spaced, and tabulate who survives to each age.",
      "terms": [
        "population density",
        "clumped dispersion",
        "quadrat",
        "mark-and-recapture",
        "uniform dispersion",
        "random dispersion",
        "life table"
      ],
      "seeds": [
        "population density",
        "clumped dispersion"
      ],
      "termInfo": {
        "population density": "The number of individuals per unit area or volume. Ecologists rarely count everyone, so density is what sampling tools estimate.",
        "clumped dispersion": "Individuals grouped in patches — oak trees seeding near the parent, elephants in herds. The most common spacing pattern in nature.",
        "quadrat": "A marked-off square plot (a square meter for daffodils, 100 m² for giant redwoods) used to sample immobile or slow-moving organisms and scale up to a density estimate.",
        "mark-and-recapture": "Tag a captured sample, release it to mix, then recapture: population ≈ (marked first catch × total second catch) ÷ marked second catch.",
        "uniform dispersion": "Individuals evenly spaced — territorial penguins, or plants like Salvia leucophylla that chemically suppress their neighbors (allelopathy).",
        "random dispersion": "No predictable pattern; individuals end up where chance puts them, as wind-dispersed dandelion seeds do.",
        "life table": "An insurance-style table dividing a population into age classes and computing the chance of dying before the next birthday — the data behind the Type I–III survivorship curves."
      },
      "info": {
        "text": "Demography is the statistical study of a population's birth rates, death rates, and life expectancies. Before asking why a population grows or shrinks, ecologists must measure how many individuals live in an area, how they are spread across it, and how long members of each age group live.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-1-population-demography",
            "label": "OpenStax Biology 2e §45.1"
          }
        ]
      }
    },
    {
      "id": "unlimited-growth",
      "name": "Growth Without Limits",
      "color": "blue",
      "fact": "With unlimited resources, a population multiplies at its species' own maximum rate and the numbers explode in a J — the benchmark against which all real growth is measured.",
      "terms": [
        "exponential growth",
        "biotic potential",
        "J-shaped curve"
      ],
      "seeds": [
        "exponential growth",
        "biotic potential"
      ],
      "termInfo": {
        "exponential growth": "Growth with unlimited resources: the increase itself accelerates, because ever more individuals are each adding offspring.",
        "biotic potential": "A species' maximum per-capita growth rate under ideal conditions, rmax. Bacteria and humans differ enormously in theirs.",
        "J-shaped curve": "The graph of exponential growth: a slow start, then numbers exploding skyward."
      },
      "info": {
        "text": "The exponential model asks what a population would do with unlimited resources: growth accelerates as more individuals each add more offspring. The species' maximum per-capita growth rate under ideal conditions is its biotic potential, rmax — vastly different for bacteria than for humans.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth",
            "label": "OpenStax Biology 2e §45.3"
          }
        ]
      }
    },
    {
      "id": "limited-growth",
      "name": "Growth With Limits",
      "color": "amber",
      "fact": "Real environments run out: as a population nears the size its resources can sustain, growth slows and levels off in an S — the logistic model's ceiling.",
      "terms": [
        "carrying capacity",
        "logistic growth",
        "S-shaped curve",
        "intraspecific competition"
      ],
      "seeds": [
        "carrying capacity",
        "logistic growth"
      ],
      "termInfo": {
        "carrying capacity": "K — the maximum population size a particular environment can sustain, set by its resources. It varies year to year as the environment changes.",
        "logistic growth": "The resource-limited model: population expansion slows as resources grow scarce and levels off at K.",
        "S-shaped curve": "The graph of logistic growth: near-exponential early rise, slowdown as resources thin, plateau at the ceiling.",
        "intraspecific competition": "Competition among members of the same species for the same resources — the crowding effect that strengthens as N approaches K and brakes the logistic curve."
      },
      "info": {
        "text": "The logistic model adds the brake the exponential model lacks: expansion slows as resources become scarce and levels off at the carrying capacity (K), the maximum population size the environment can support. What intensifies near K is intraspecific competition — members of the same species fighting over those resources.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth",
            "label": "OpenStax Biology 2e §45.3"
          }
        ]
      }
    },
    {
      "id": "environmental-regulation",
      "name": "Regulation in the Wild",
      "color": "magenta",
      "fact": "What stops wild populations splits by mechanism: some effects strengthen with crowding, while weather and disasters strike regardless of how many individuals are there.",
      "terms": [
        "density-dependent factor",
        "density-independent factor",
        "waste accumulation",
        "disease",
        "weather"
      ],
      "seeds": [
        "density-dependent factor",
        "density-independent factor"
      ],
      "termInfo": {
        "density-dependent factor": "A factor whose effect depends on the population's density at the time — competition, predation, disease, waste accumulation. Mostly biotic; the denser the population, the greater the mortality.",
        "density-independent factor": "A factor that influences mortality regardless of density — typically physical or chemical (abiotic): cold weather, fires, storms.",
        "waste accumulation": "A biotic density-dependent effect: the denser the population, the faster its own waste builds up. Yeast in a test tube famously poisons itself with its own alcohol.",
        "disease": "Density-dependent: parasites and pathogens spread faster in crowds. In dense populations of the roundworm Ascaris lumbricoides, females produce fewer eggs each.",
        "weather": "The classic density-independent killer: a hard winter strikes a sparse population exactly as hard as a packed one."
      },
      "info": {
        "text": "Density-dependent factors — mostly biotic, like competition, predation, disease, and accumulating waste — bite harder the denser the population. Density-independent factors — typically physical or chemical, like cold weather, fires, or storms — kill the same fraction whether the population is packed or sparse.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-4-population-dynamics-and-regulation",
            "label": "OpenStax Biology 2e §45.4"
          }
        ]
      }
    },
    {
      "id": "life-history-tradeoffs",
      "name": "Life-History Tradeoffs",
      "color": "olive",
      "fact": "A finite energy budget forces a strategy: make many offspring and leave them to fate, or make few and invest — the tradeoffs natural selection balances.",
      "terms": [
        "fecundity",
        "parental care",
        "semelparity",
        "iteroparity",
        "r-selected species",
        "K-selected species"
      ],
      "seeds": [
        "parental care",
        "fecundity"
      ],
      "termInfo": {
        "fecundity": "An individual's potential reproductive capacity — the offspring it could produce at maximum rate. High-fecundity species give little care per offspring, and vice versa.",
        "parental care": "Investment in each offspring's survival, made at the expense of producing more offspring — the other half of the fecundity tradeoff.",
        "semelparity": "Reproducing once and dying: Chinook salmon and bamboo exhaust their energy reserves in a single reproductive effort.",
        "iteroparity": "Reproducing repeatedly across a lifetime, as seasonal breeders like pronghorn antelope and primates do.",
        "r-selected species": "The rate-maximizing pole: many small offspring, early maturity, short life, little parental care — suited to unpredictable environments (jellyfish, dandelions). Named for r, the per-capita growth rate.",
        "K-selected species": "The ceiling-specialist pole: few large offspring, late maturity, long life, heavy parental care — suited to stable environments near carrying capacity (primates, elephants, oaks). Named for K."
      },
      "info": {
        "text": "A species' life history is how it allocates energy across growth, maintenance, and reproduction. Fecundity (potential reproductive capacity) trades off against parental care per offspring; reproduction can be a single fatal burst (semelparity, like Chinook salmon) or repeated across life (iteroparity, like primates). The strategy poles are r-selected (many, small, unprovisioned offspring) and K-selected (few, large, cared-for offspring).",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-2-life-histories-and-natural-selection",
            "label": "OpenStax Biology 2e §45.2"
          },
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-4-population-dynamics-and-regulation",
            "label": "OpenStax Biology 2e §45.4"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "br-scarce-resources",
      "term": "competition for scarce resources",
      "clusters": [
        1,
        2
      ],
      "fact": "The logistic model is the exponential model with a brake: its factor (K − N)/K shrinks the growth rate as N approaches carrying capacity, because intraspecific competition for scarce resources gets fiercer the more crowded the population becomes.",
      "info": {
        "text": "OpenStax derives dN/dT = rmax·N·(K − N)/K and names intraspecific competition as the mechanism that strengthens near K.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth",
            "label": "OpenStax Biology 2e §45.3"
          }
        ]
      }
    },
    {
      "id": "br-survivorship-strategy",
      "term": "survivorship records strategy",
      "clusters": [
        0,
        4
      ],
      "fact": "A life table's survivorship curve is the demographic signature of a life-history strategy: Type I curves (humans, primates) record few, well-cared-for offspring dying late; Type III curves (trees, most fishes) record many unprovisioned offspring with very few surviving youth.",
      "info": {
        "text": "OpenStax 45.1 defines the three survivorship types; 45.2 explains the fecundity–parental-care tradeoff they record.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-1-population-demography",
            "label": "OpenStax Biology 2e §45.1"
          },
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-2-life-histories-and-natural-selection",
            "label": "OpenStax Biology 2e §45.2"
          }
        ]
      }
    },
    {
      "id": "br-ceiling-moves",
      "term": "the ceiling moves",
      "clusters": [
        2,
        3
      ],
      "fact": "Carrying capacity is not a constant: density-dependent factors hold a population near K, while density-independent events — fires, cold winters, storms — lower or reset K from one year to the next, which is why real logistic curves wobble instead of flattening cleanly.",
      "info": {
        "text": "OpenStax 45.4 notes K varies annually and can be altered by natural events such as fires.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-4-population-dynamics-and-regulation",
            "label": "OpenStax Biology 2e §45.4"
          }
        ]
      }
    },
    {
      "id": "br-potential-by-life-history",
      "term": "potential set by life history",
      "clusters": [
        1,
        4
      ],
      "fact": "A species' biotic potential (rmax) is itself a life-history outcome: fecundity, age at first reproduction, and parental care determine how fast a species can multiply when nothing limits it — and the r-selected strategy is the extreme high-rmax pole.",
      "info": {
        "text": "OpenStax 45.3 notes rmax differs inherently between species (bacteria vs. humans); 45.2 supplies the life-history traits behind the difference.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth",
            "label": "OpenStax Biology 2e §45.3"
          },
          {
            "href": "https://openstax.org/books/biology-2e/pages/45-2-life-histories-and-natural-selection",
            "label": "OpenStax Biology 2e §45.2"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-dispersion-trio",
      "prompt": "Population ecologists recognize three ways individuals can be spaced across a habitat. Which three board terms name those spacings?",
      "explanation": "The three dispersion terms are the board's only spacing-pattern vocabulary; every other term names a measure, a method, a data table, a model, a parameter, or a strategy.",
      "targets": [
        "clumped dispersion",
        "uniform dispersion",
        "random dispersion"
      ],
      "reasons": {
        "clumped dispersion": "Grouped patches — offspring near parents, herds.",
        "random dispersion": "Position set by chance — wind-dispersed seeds.",
        "uniform dispersion": "Even spacing — territory or allelopathy keeps neighbors apart."
      }
    },
    {
      "id": "lens-ceiling",
      "prompt": "Exactly one board term names the ceiling itself — the maximum population size an environment can sustain. Which?",
      "explanation": "Carrying capacity is the board's only ceiling-sized concept. Biotic potential is a maximum rate, not a maximum size, so the bounded wording excludes it.",
      "targets": [
        "carrying capacity"
      ],
      "reasons": {
        "carrying capacity": "K is defined as the maximum population size the environment can support."
      }
    },
    {
      "id": "lens-abiotic-strike",
      "prompt": "Three concrete culprits appear on this board. Which one kills the same share of a population whether that population is crowded or sparse?",
      "explanation": "A bounded classification check: waste accumulation and disease are density-dependent biotic effects; weather is the abiotic one that strikes regardless of density.",
      "targets": [
        "weather"
      ],
      "reasons": {
        "weather": "Cold winters, fires, and storms are density-independent — the classic abiotic strike."
      }
    },
    {
      "id": "lens-reproduction-schedules",
      "prompt": "Two board terms name reproduction schedules: one species breeds a single time and dies, the other breeds again and again through its life. Which two?",
      "explanation": "The two schedule terms pair as the board's only once-versus-repeatedly reproduction strategies; fecundity and parental care are tradeoff quantities, not schedules.",
      "targets": [
        "semelparity",
        "iteroparity"
      ],
      "reasons": {
        "iteroparity": "Repeated reproduction across a lifetime.",
        "semelparity": "One reproductive effort, then death — salmon and bamboo."
      }
    },
    {
      "id": "lens-rk-poles",
      "prompt": "The board's two strategy poles are named after the two growth models' parameters: one maximizes the rate of increase, the other is tuned to life near the ceiling. Which two terms?",
      "explanation": "The board's synthesis lens: the r/K names come from the growth models' parameters — rmax and K — so answering it reconnects the models to the strategies.",
      "targets": [
        "r-selected species",
        "K-selected species"
      ],
      "reasons": {
        "K-selected species": "Named for K — few, large, cared-for offspring in stable environments near the ceiling.",
        "r-selected species": "Named for r — many small offspring maximizing the per-capita growth rate."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Why populations can't grow forever",
    "summary": "From counting individuals to reading their strategies: what demography measures, how the exponential and logistic models work, what regulates real populations, and why life histories trade offspring number against care.",
    "estimatedMinutes": 9,
    "content": {
      "mediaType": "text/markdown",
      "text": "Ecology asks how living things make a living in a world of limits, and its population chapter begins with a deceptively simple question: how many individuals of one species live in a place? That count is the population's size; per unit of area or volume it is the **population density**. Counting every organism is usually impossible, so ecologists estimate — a **quadrat** (a marked-off sampling square) works for immobile organisms like daffodils, while **mark-and-recapture** (tag a sample, release it, recapture later) estimates mobile ones. Individuals are also spaced in characteristic ways: **uniform dispersion** when territory or chemicals keep neighbors apart, **clumped dispersion** when offspring stay near the parent, and **random dispersion** when chance decides, as with wind-blown dandelion seeds. A **life table** rounds out the portrait, dividing the population into age classes and recording how long each is likely to survive.\r\n\r\nGiven a count, the next question is where it is heading. Start from the species' side: every species has a **biotic potential** — a maximum per-capita growth rate, rmax — set by its own physiology and behavior. In a world of unlimited resources, growth follows that potential and accelerates without end: **exponential growth**, tracing a **J-shaped curve**. Bacteria in a fresh test tube do exactly this, for a while.\r\n\r\nReal worlds run out. The **logistic** model adds the brake: as a population grows, each new individual faces stiffer **intraspecific competition** — same-species rivals for the same food, space, and light. Growth slows and levels off at the **carrying capacity** (K), the maximum population size the environment can sustain, tracing an **S-shaped curve**. The brake is built into the model as the factor (K − N)/K: nearly 1 when the population is small (growth is effectively exponential), approaching zero as N nears K.\r\n\r\nWhy does growth really stop? The mechanisms split by a single test: does the effect depend on how crowded the population is? **Density-dependent factors** — competition, predation, disease, accumulating waste — bite harder in a crowded population, and most are biotic. **Density-independent factors** — a hard freeze, a fire, a flood — kill the same share whether the population is packed or sparse, and are typically physical. Real populations answer to both, which is why the carrying capacity wobbles from year to year instead of holding still.\r\n\r\nThe deepest answer is that every species carries an evolved strategy for this world of limits. Its **life history** allocates a finite energy budget across growth, maintenance, and reproduction. **Fecundity** — the potential to produce offspring — trades off against **parental care** per offspring: orchids make millions of dust-like seeds that fend for themselves; a coconut palm makes one energy-rich seed. Reproduction can be a single fatal effort (**semelparity**, as in Chinook salmon and bamboo) or a lifelong rhythm (**iteroparity**, as in primates). Ecologists compress these strategies into two poles: **r-selected species**, which maximize rate — many small, unprovisioned offspring for unpredictable environments — and **K-selected species**, which specialize near the ceiling — few large, well-cared-for offspring in stable ones. The tradeoffs show up in death as well as birth: a Type I survivorship curve (humans) records few offspring dying old; a Type III curve (trees, most fishes) records thousands dying young and a stubborn few living long. Population ecology, in the end, is the study of how birth, death, and strategy meet the world's limits — measured, modeled, and explained."
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
      "puzzleId": "ecology-populations",
      "puzzleRevision": "fnv1a32:ec1aad61",
      "board": {
        "width": 1180,
        "height": 770
      },
      "nodes": {
        "term:population density": {
          "x": 449.96,
          "y": 22
        },
        "term:clumped dispersion": {
          "x": 709.29,
          "y": 22
        },
        "term:quadrat": {
          "x": 573.44,
          "y": 22
        },
        "term:mark-and-recapture": {
          "x": 676.17,
          "y": 242.23
        },
        "term:uniform dispersion": {
          "x": 776.58,
          "y": 130.83
        },
        "term:random dispersion": {
          "x": 475.45,
          "y": 247.78
        },
        "term:life table": {
          "x": 851.74,
          "y": 22
        },
        "term:exponential growth": {
          "x": 956.5,
          "y": 161.31
        },
        "term:biotic potential": {
          "x": 1047.72,
          "y": 246.6
        },
        "term:J-shaped curve": {
          "x": 833.4,
          "y": 380.3
        },
        "term:carrying capacity": {
          "x": 1106.45,
          "y": 610.86
        },
        "term:logistic growth": {
          "x": 1077.12,
          "y": 748
        },
        "term:S-shaped curve": {
          "x": 865.53,
          "y": 748
        },
        "term:intraspecific competition": {
          "x": 792.31,
          "y": 596.36
        },
        "term:density-dependent factor": {
          "x": 487.21,
          "y": 731.17
        },
        "term:density-independent factor": {
          "x": 251.52,
          "y": 730.18
        },
        "term:waste accumulation": {
          "x": 383,
          "y": 502.46
        },
        "term:disease": {
          "x": 603.96,
          "y": 611.36
        },
        "term:weather": {
          "x": 267.23,
          "y": 599.5
        },
        "term:fecundity": {
          "x": 73.52,
          "y": 382.37
        },
        "term:parental care": {
          "x": 387.38,
          "y": 350.77
        },
        "term:semelparity": {
          "x": 160.45,
          "y": 125.78
        },
        "term:iteroparity": {
          "x": 234.67,
          "y": 445.77
        },
        "term:r-selected species": {
          "x": 76.7,
          "y": 242.12
        },
        "term:K-selected species": {
          "x": 76.7,
          "y": 522.91
        },
        "term:competition for scarce resources": {
          "x": 990.93,
          "y": 467.77
        },
        "term:survivorship records strategy": {
          "x": 337.55,
          "y": 166.02
        },
        "term:the ceiling moves": {
          "x": 695.78,
          "y": 710.95
        },
        "term:potential set by life history": {
          "x": 596.78,
          "y": 441.59
        },
        "cluster:0": {
          "x": 586.02,
          "y": 127.38
        },
        "cluster:1": {
          "x": 873.46,
          "y": 266.5
        },
        "cluster:2": {
          "x": 966.32,
          "y": 654.49
        },
        "cluster:3": {
          "x": 429.6,
          "y": 608.59
        },
        "cluster:4": {
          "x": 221.35,
          "y": 347.75
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T07:23:34.695Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "ecology-populations",
      "puzzleRevision": "fnv1a32:ec1aad61",
      "board": {
        "width": 1180,
        "height": 770
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 590.27,
          "y": 165.27,
          "pinned": true
        },
        "cluster:1": {
          "x": 907.09,
          "y": 303.3,
          "pinned": true
        },
        "cluster:2": {
          "x": 849.67,
          "y": 618.57,
          "pinned": true
        },
        "cluster:3": {
          "x": 407.55,
          "y": 637.38,
          "pinned": true
        },
        "cluster:4": {
          "x": 207.57,
          "y": 369.63,
          "pinned": true
        }
      },
      "bridges": {
        "term:competition for scarce resources": {
          "x": 1010.73,
          "y": 470.74,
          "pinned": true
        },
        "term:survivorship records strategy": {
          "x": 266.28,
          "y": 158.1,
          "pinned": true
        },
        "term:the ceiling moves": {
          "x": 633.42,
          "y": 721.84,
          "pinned": true
        },
        "term:potential set by life history": {
          "x": 594.8,
          "y": 410.9,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "population density",
          "clumped dispersion",
          "quadrat",
          "mark-and-recapture",
          "uniform dispersion",
          "random dispersion",
          "life table"
        ],
        "cluster:1": [
          "exponential growth",
          "biotic potential",
          "J-shaped curve"
        ],
        "cluster:2": [
          "carrying capacity",
          "logistic growth",
          "S-shaped curve",
          "intraspecific competition"
        ],
        "cluster:3": [
          "density-dependent factor",
          "density-independent factor",
          "waste accumulation",
          "disease",
          "weather"
        ],
        "cluster:4": [
          "fecundity",
          "parental care",
          "semelparity",
          "iteroparity",
          "r-selected species",
          "K-selected species"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "quadrat",
          "random dispersion",
          "mark-and-recapture",
          "uniform dispersion",
          "clumped dispersion",
          "population density",
          "life table"
        ],
        "cluster:1": [
          "J-shaped curve",
          "exponential growth",
          "biotic potential"
        ],
        "cluster:2": [
          "logistic growth",
          "intraspecific competition",
          "carrying capacity",
          "S-shaped curve"
        ],
        "cluster:3": [
          "disease",
          "waste accumulation",
          "density-independent factor",
          "density-dependent factor",
          "weather"
        ],
        "cluster:4": [
          "semelparity",
          "parental care",
          "r-selected species",
          "K-selected species",
          "iteroparity",
          "fecundity"
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
        "totalLength": 1160.3480893009446
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T07:24:34.770Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "ecology-populations",
      "puzzleRevision": "fnv1a32:ec1aad61",
      "board": {
        "width": 1180,
        "height": 770
      },
      "nodes": {
        "term:population density": {
          "x": 458.87,
          "y": 96.25,
          "pinned": true
        },
        "term:clumped dispersion": {
          "x": 709.29,
          "y": 33.88,
          "pinned": true
        },
        "term:quadrat": {
          "x": 556.61,
          "y": 24.97,
          "pinned": true
        },
        "term:mark-and-recapture": {
          "x": 679.14,
          "y": 238.27,
          "pinned": true
        },
        "term:uniform dispersion": {
          "x": 714.21,
          "y": 151.62,
          "pinned": true
        },
        "term:random dispersion": {
          "x": 475.45,
          "y": 247.78,
          "pinned": false
        },
        "term:life table": {
          "x": 851.74,
          "y": 86.35,
          "pinned": true
        },
        "term:exponential growth": {
          "x": 916.9,
          "y": 319.7,
          "pinned": true
        },
        "term:biotic potential": {
          "x": 1084.35,
          "y": 200.07,
          "pinned": true
        },
        "term:J-shaped curve": {
          "x": 928.43,
          "y": 214.98,
          "pinned": true
        },
        "term:carrying capacity": {
          "x": 1000.53,
          "y": 567.31,
          "pinned": true
        },
        "term:logistic growth": {
          "x": 1070.19,
          "y": 727.21,
          "pinned": true
        },
        "term:S-shaped curve": {
          "x": 908.1,
          "y": 726.22,
          "pinned": true
        },
        "term:intraspecific competition": {
          "x": 812.11,
          "y": 670.61,
          "pinned": true
        },
        "term:density-dependent factor": {
          "x": 460.48,
          "y": 698.5,
          "pinned": true
        },
        "term:density-independent factor": {
          "x": 186.19,
          "y": 686.62,
          "pinned": true
        },
        "term:waste accumulation": {
          "x": 415.67,
          "y": 543.04,
          "pinned": true
        },
        "term:disease": {
          "x": 523.78,
          "y": 595.52,
          "pinned": true
        },
        "term:weather": {
          "x": 267.23,
          "y": 599.5,
          "pinned": false
        },
        "term:fecundity": {
          "x": 86.39,
          "y": 385.34,
          "pinned": true
        },
        "term:parental care": {
          "x": 387.38,
          "y": 350.77,
          "pinned": false
        },
        "term:semelparity": {
          "x": 174.31,
          "y": 240.61,
          "pinned": true
        },
        "term:iteroparity": {
          "x": 284.17,
          "y": 474.47,
          "pinned": true
        },
        "term:r-selected species": {
          "x": 86.6,
          "y": 310.43,
          "pinned": true
        },
        "term:K-selected species": {
          "x": 111.35,
          "y": 474.41,
          "pinned": true
        },
        "term:competition for scarce resources": {
          "x": 997.86,
          "y": 443.02,
          "pinned": true
        },
        "term:survivorship records strategy": {
          "x": 266.28,
          "y": 158.1,
          "pinned": false
        },
        "term:the ceiling moves": {
          "x": 730.43,
          "y": 579.29,
          "pinned": true
        },
        "term:potential set by life history": {
          "x": 642.31,
          "y": 346.55,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 7430.16,
        "score": 7430.155874102253
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T07:26:57.274Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-14T07:22:38.949Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
