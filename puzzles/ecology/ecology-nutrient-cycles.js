// Generated from content/puzzles/ecology-nutrient-cycles.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "ecology-nutrient-cycles",
  "title": "Nothing Is Wasted — How Nutrients Cycle",
  "category": "ecology",
  "info": {
    "text": "How matter — unlike energy — is recycled: the shared machinery of reservoirs and residence times, the four canonical routes (water, carbon, nitrogen, phosphorus), and what overload does to them.",
    "links": [
      {
        "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
        "label": "OpenStax Biology 2e §46.3 Biogeochemical Cycles"
      }
    ],
    "citations": [
      {
        "title": "Biology 2e, §46.3 Biogeochemical Cycles",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles"
      }
    ]
  },
  "clusters": [
    {
      "id": "cycle-machinery",
      "name": "The Shared Machinery",
      "color": "teal",
      "fact": "Matter is never used up — it is recycled between living organisms and their environment, waiting in stores and measured by how long the wait lasts.",
      "terms": [
        "biogeochemical cycle",
        "reservoir",
        "residence time"
      ],
      "seeds": [
        "biogeochemical cycle",
        "reservoir"
      ],
      "termInfo": {
        "biogeochemical cycle": "The recycling of inorganic matter between living organisms and their environment — bio for life, geo for the geology that stores it, chemical for the forms it takes.",
        "reservoir": "A store where a nutrient waits on its way around — the atmosphere, an ocean, a limestone formation.",
        "residence time": "The average time an individual molecule stays in a particular reservoir — about a year for water in the atmosphere, up to 100,000 years for a phosphate ion in the ocean."
      },
      "info": {
        "text": "A biogeochemical cycle is the recycling of inorganic matter between living organisms and their environment — 'bio' for life, 'geo' for the geology that stores it, 'chemical' for the forms it takes. A reservoir is a store where the matter waits; residence time is the average wait of an individual molecule in that reservoir — a year in the atmosphere, centuries in the deep ocean, up to 100,000 years for a phosphate ion.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "water-cycle",
      "name": "The Water Cycle",
      "color": "blue",
      "fact": "Water loops from sky to surface and back — vaporizing, drifting as clouds, falling, and flowing — parking in oceans, ice, and rock along the way.",
      "terms": [
        "hydrosphere",
        "evaporation",
        "condensation",
        "precipitation",
        "sublimation",
        "surface runoff"
      ],
      "seeds": [
        "evaporation",
        "precipitation"
      ],
      "termInfo": {
        "hydrosphere": "Everywhere on Earth where water moves and is stored. It is lopsided: 97.5% of Earth's water is salt, and of the fresh remainder 99% is underground or ice.",
        "evaporation": "Liquid surface water converted to water vapor — the loop's exit from oceans and lakes.",
        "condensation": "Water vapor forming clouds as liquid or frozen droplets — the drift back toward rain.",
        "precipitation": "Rain or snow returning water to Earth's surface.",
        "sublimation": "Frozen water converting directly to vapor — the shortcut that skips the liquid phase entirely.",
        "surface runoff": "The flow of fresh water from rain or melting ice over the land toward the ocean (its underground twin is subsurface flow)."
      },
      "info": {
        "text": "The hydrosphere is everywhere water moves and is stored — and it is lopsided: 97.5% of Earth's water is salt; of the fresh remainder, 99% is underground or ice. Water leaves the surface by evaporation (or straight from ice by sublimation), gathers into clouds by condensation, returns as precipitation, and flows back to the sea overland as surface runoff or beneath it as subsurface flow.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "carbon-cycle",
      "name": "The Carbon Cycle",
      "color": "amber",
      "fact": "Carbon has a fast biological half and a slow geological half — from today's air through living things into the ocean's chemistry, ancient shells, and buried forests.",
      "terms": [
        "bicarbonate",
        "limestone",
        "fossil fuel",
        "subduction"
      ],
      "seeds": [
        "fossil fuel",
        "limestone"
      ],
      "termInfo": {
        "bicarbonate": "The dissolved form carbon dioxide takes in water (via carbonic acid) — over 90% of the ocean's carbon.",
        "limestone": "Calcium carbonate shells of marine organisms pressed together over geologic time — the largest carbon reservoir on Earth.",
        "fossil fuel": "The anaerobically decomposed remains of ancient plants, formed over millions of years — a nonrenewable resource, returned to the air in decades.",
        "subduction": "The movement of one tectonic plate beneath another, carrying carbon sediments down into Earth's interior."
      },
      "info": {
        "text": "Carbon dioxide dissolving in the ocean becomes carbonic acid, then bicarbonate — over 90% of ocean carbon — which marine organisms build into calcium carbonate shells; pressed together over geologic time those shells become limestone, the largest carbon reservoir on Earth. Fossil fuel is the anaerobically decomposed remains of ancient plants, formed over millions of years — a nonrenewable resource we now return to the air in decades. Subduction carries some carbon sediments down into Earth's interior with a sinking tectonic plate.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "nitrogen-cycle",
      "name": "The Nitrogen Cycle",
      "color": "magenta",
      "fact": "Nitrogen gas is 78% of the atmosphere but almost unusable — only bacteria can crack it into life's molecules, and only bacteria hand it back.",
      "terms": [
        "nitrogen fixation",
        "nitrogen-fixing bacteria",
        "ammonification",
        "nitrification",
        "denitrification"
      ],
      "seeds": [
        "nitrogen fixation",
        "nitrogen-fixing bacteria"
      ],
      "termInfo": {
        "nitrogen fixation": "Cracking the N2 triple bond to make atmospheric nitrogen available to living things — the cycle's gatekeeping step.",
        "nitrogen-fixing bacteria": "The only organisms that fix nitrogen: cyanobacteria in water, Azotobacter free in soil, and Rhizobium symbiotic in the root nodules of legumes like peas and peanuts.",
        "ammonification": "Bacteria and fungi converting nitrogenous waste and dead remains into ammonium.",
        "nitrification": "Nitrifying bacteria such as Nitrosomonas converting ammonium to nitrites, then to nitrates — the form plants take up.",
        "denitrification": "Soil bacteria such as Pseudomonas and Clostridium converting nitrates back into nitrogen gas — closing the loop."
      },
      "info": {
        "text": "N2's triple bond makes atmospheric nitrogen nearly inert. Nitrogen-fixing bacteria — cyanobacteria in water, Rhizobium in the root nodules of legumes — perform nitrogen fixation, making N2 available to living things. Bacteria and fungi then run ammonification (waste and remains to ammonium), nitrifying bacteria run nitrification (ammonium to nitrites, then nitrates), and denitrifying bacteria such as Pseudomonas close the loop, turning nitrates back into nitrogen gas.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "phosphorus-cycle",
      "name": "The Phosphorus Cycle",
      "color": "olive",
      "fact": "No gas phase, no hurry: phosphorus rides weathered rock into water, and the little that arrives decides how much can live there.",
      "terms": [
        "weathering",
        "limiting nutrient"
      ],
      "seeds": [
        "weathering"
      ],
      "termInfo": {
        "weathering": "The leaching of phosphate (PO₄³⁻) from phosphate-containing rock into soil, rivers, and oceans — phosphorus's main entrance into life's economy.",
        "limiting nutrient": "The nutrient whose scarce supply caps an ecosystem's growth; in aquatic systems that is often phosphorus."
      },
      "info": {
        "text": "Phosphorus has no significant gaseous phase — it cycles through rock, sediment, and geologic uplift, with a phosphate ion's ocean residence time running 20,000 to 100,000 years. Weathering leaches phosphates from rock into soil and water, and because so little is available, phosphorus is often the limiting nutrient of aquatic ecosystems: the nutrient whose supply caps growth.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "cycle-overload",
      "name": "When Cycles Overload",
      "color": "brown",
      "fact": "Flood the loops and the damage compounds: fertilized water blooms and suffocates, and rain that fell through combustion exhaust burns what it lands on.",
      "terms": [
        "eutrophication",
        "dead zone",
        "acid rain"
      ],
      "seeds": [
        "acid rain",
        "dead zone"
      ],
      "termInfo": {
        "eutrophication": "Excess nutrient runoff causing explosive microorganism growth that depletes dissolved oxygen and kills ecosystem fauna.",
        "dead zone": "An area suffocated by eutrophication, depleted of its normal flora and fauna — over 400 existed by 2008; the Gulf of Mexico's exceeded 8,463 square miles.",
        "acid rain": "Rain that fell through sulfur dioxide and nitrogen-oxide pollution and turned acidic — polluted precipitation, not a stage of the pure-water loop — acidifying lakes and eating stone."
      },
      "info": {
        "text": "Eutrophication is what excess nutrient runoff — fertilizer's nitrogen and phosphate — does to water: microorganisms grow explosively, deplete the dissolved oxygen, and kill the fauna. The suffocating result is a dead zone — over 400 existed by 2008, the Gulf of Mexico's exceeding 8,463 square miles. Acid rain forms when rain falls through sulfur dioxide and nitrogen-oxide pollution (a note: it is polluted precipitation — a consequence of overloaded cycles, not a stage of the pure-water loop), acidifying lakes and eating stone.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "br-odd-one-out",
      "term": "the odd one out",
      "clusters": [
        0,
        4
      ],
      "fact": "Water, carbon, nitrogen, and sulfur all pass through the atmosphere in gaseous forms — phosphorus does not, cycling instead through rock, sediment, and uplift, which is why its residence time is counted in tens of thousands of years and why the shared machinery of reservoirs applies to it most starkly.",
      "info": {
        "text": "OpenStax 46.3 contrasts the atmospheric cycles with phosphorus's geological route and reports phosphate ocean residence times of 20,000–100,000 years.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "br-water-carries",
      "term": "water carries the overload",
      "clusters": [
        1,
        5
      ],
      "fact": "The movement of water is critical for the leaching of nitrogen and phosphate: surface runoff from fertilized fields delivers both nutrients to waterways — which is exactly where eutrophication begins and dead zones follow.",
      "info": {
        "text": "OpenStax 46.3 names water movement as critical to nitrogen and phosphate leaching; runoff delivers fertilizer nutrients to aquatic systems.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    },
    {
      "id": "br-fixation-both-ways",
      "term": "fixation cut both ways",
      "clusters": [
        3,
        5
      ],
      "fact": "The nitrogen cycle's gatekeeping step — cracking the N2 triple bond — used to belong to bacteria alone; industrial fertilizer now fixes nitrogen on the same terms, and the surplus runs off into eutrophication, while combustion's nitrogen oxides fall as acid rain.",
      "info": {
        "text": "OpenStax 46.3 lists artificial fertilizers, fossil-fuel combustion, and acid rain (nitric acid) among human impacts on the nitrogen cycle.",
        "links": [
          {
            "href": "https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles",
            "label": "OpenStax Biology 2e §46.3"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "lens-water-vapor-stages",
      "prompt": "Three board terms name the vapor stages of the water loop — liquid to vapor, vapor to cloud, cloud to ground. Which three?",
      "explanation": "The three vapor stages of the pure-water loop; sublimation is excluded by the 'liquid to vapor' start because it runs from ice.",
      "targets": [
        "evaporation",
        "condensation",
        "precipitation"
      ],
      "reasons": {
        "condensation": "Vapor gathers into clouds as droplets.",
        "evaporation": "Liquid surface water becomes vapor.",
        "precipitation": "Rain or snow returns water to the surface."
      }
    },
    {
      "id": "lens-carbon-vaults",
      "prompt": "Two board terms name solid reservoirs where carbon waits on geological timescales. Which two?",
      "explanation": "Bicarbonate is dissolved, subduction is a route rather than a store; only limestone and fossil fuel are solid geological reservoirs.",
      "targets": [
        "limestone",
        "fossil fuel"
      ],
      "reasons": {
        "fossil fuel": "Ancient buried plant remains, millions of years in the making.",
        "limestone": "Pressed shells — the largest carbon reservoir on Earth."
      }
    },
    {
      "id": "lens-loop-closer",
      "prompt": "Which board term names the step that closes the nitrogen loop — turning nitrates back into nitrogen gas?",
      "explanation": "The loop-closer: ammonification and nitrification move nitrogen toward life, denitrification is the step that returns it to the sky.",
      "targets": [
        "denitrification"
      ],
      "reasons": {
        "denitrification": "Pseudomonas and Clostridium hand the nitrogen back."
      }
    },
    {
      "id": "lens-phosphorus-entrance",
      "prompt": "Which board term names the slow entrance by which phosphorus finally joins the living economy?",
      "explanation": "Limiting nutrient is about scarcity's effect, not entry; weathering is phosphorus's only entrance from rock into the living economy.",
      "targets": [
        "weathering"
      ],
      "reasons": {
        "weathering": "Phosphate leached from rock into soil and water."
      }
    },
    {
      "id": "lens-blooming-trap",
      "prompt": "Which board term names the process that begins when fertilizer nutrients flood a waterway and ends in a dead zone?",
      "explanation": "Eutrophication is the process; the dead zone is its endpoint and acid rain a different pathway entirely.",
      "targets": [
        "eutrophication"
      ],
      "reasons": {
        "eutrophication": "Nutrient runoff → explosive microorganism growth → oxygen depleted."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Nothing is wasted, only borrowed",
    "summary": "Why matter, unlike energy, is recycled: the shared machinery of reservoirs and residence times, four canonical cycles, and what overload turns them into.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "Energy passes through an ecosystem once and is gone; matter is different — it is never used up, only borrowed. The elements life is made of (carbon, nitrogen, hydrogen, oxygen, phosphorus, sulfur) are recycled between living organisms and their environment in **biogeochemical cycles** — \"bio\" for life, \"geo\" for the geology that stores them, \"chemical\" for the forms they take. Every cycle is told with the same machinery: **reservoirs**, the stores where the element waits, and **residence time**, how long an individual molecule waits there — about a year for water in the atmosphere, up to a hundred thousand years for a phosphate ion in the deep ocean.\r\n\r\nThe **water cycle** is the one everyone can watch. The **hydrosphere** — everywhere water moves and is stored — is strangely lopsided: 97.5 percent of Earth's water is salt, and of the fresh remainder, 99 percent is locked underground or in ice. Water leaves oceans and lakes by **evaporation** (or straight from ice by **sublimation**), gathers into clouds by **condensation**, falls as **precipitation**, and flows back to the sea overland as **surface runoff** or beneath it as subsurface flow.\r\n\r\nThe **carbon cycle** runs on two clocks. Its fast half is biological — photosynthesis takes carbon dioxide in, respiration lets it back out. Its slow half is geological: carbon dioxide dissolving in the ocean becomes **bicarbonate** (over 90 percent of the ocean's carbon), which marine organisms build into shells that press into **limestone**, the largest carbon reservoir on Earth. Some carbon is subducted into Earth's interior with sinking tectonic plates; some became **fossil fuel** — ancient plants buried without oxygen millions of years ago, a nonrenewable resource that we now return to the air within decades of digging it up.\r\n\r\nThe **nitrogen cycle** is a bacterial monopoly. Nitrogen gas makes up 78 percent of the atmosphere, but its triple bond makes it almost inert. **Nitrogen-fixing bacteria** — cyanobacteria in water, Rhizobium in the root nodules of legumes — are nearly the only living things that can crack it, in the step called **nitrogen fixation**. Further bacteria keep the element moving: **ammonification** turns waste and remains into ammonium, **nitrification** converts ammonium into nitrites and then nitrates, and **denitrification** hands nitrogen back to the sky as gas.\r\n\r\n**Phosphorus** is the odd cycle: it has no significant gaseous phase, so it travels by geology — **weathering** leaches phosphate from rock into soils and waters, ocean sediments wait twenty thousand to a hundred thousand years, and uplift raises them back to land. Because so little is available at any moment, phosphorus is often the **limiting nutrient** of aquatic ecosystems — the nutrient whose shortage caps how much life the water can carry.\r\n\r\nAnd when humans overload these loops, the recycling turns against us. Fertilizer's nitrogen and phosphates wash into waterways where **eutrophication** follows: microorganisms bloom, drain the dissolved oxygen, and suffocate the fauna — leaving **dead zones**, of which more than 400 existed by 2008, the Gulf of Mexico's exceeding 8,463 square miles. Combustion adds its own insults: sulfur dioxide and nitrogen oxides turn falling rain into **acid rain** that kills lake life and eats stone. The cycles are patient — they will recycle everything, including our mistakes."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Highspeed)",
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
      "puzzleId": "ecology-nutrient-cycles",
      "puzzleRevision": "fnv1a32:4ebe4b81",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:biogeochemical cycle": {
          "x": 95.11,
          "y": 47.04
        },
        "term:reservoir": {
          "x": 68.28,
          "y": 166.83
        },
        "term:residence time": {
          "x": 241.44,
          "y": 114.05
        },
        "term:hydrosphere": {
          "x": 837.29,
          "y": 272.95
        },
        "term:evaporation": {
          "x": 945.73,
          "y": 150.23
        },
        "term:condensation": {
          "x": 708.95,
          "y": 286.68
        },
        "term:precipitation": {
          "x": 949.05,
          "y": 52
        },
        "term:sublimation": {
          "x": 955.35,
          "y": 254.21
        },
        "term:surface runoff": {
          "x": 817.04,
          "y": 52
        },
        "term:bicarbonate": {
          "x": 367.87,
          "y": 585.92
        },
        "term:limestone": {
          "x": 495.76,
          "y": 593.94
        },
        "term:fossil fuel": {
          "x": 327.49,
          "y": 422.98
        },
        "term:subduction": {
          "x": 495.62,
          "y": 421.9
        },
        "term:nitrogen fixation": {
          "x": 746.56,
          "y": 588.93
        },
        "term:nitrogen-fixing bacteria": {
          "x": 935.84,
          "y": 588.93
        },
        "term:ammonification": {
          "x": 921.46,
          "y": 492.3
        },
        "term:nitrification": {
          "x": 903.88,
          "y": 395.4
        },
        "term:denitrification": {
          "x": 622.41,
          "y": 531.1
        },
        "term:weathering": {
          "x": 228.13,
          "y": 613.74
        },
        "term:limiting nutrient": {
          "x": 102.51,
          "y": 570.46
        },
        "term:eutrophication": {
          "x": 620.19,
          "y": 214.31
        },
        "term:dead zone": {
          "x": 459.04,
          "y": 153.48
        },
        "term:acid rain": {
          "x": 374.54,
          "y": 196.13
        },
        "term:the odd one out": {
          "x": 203.27,
          "y": 359.73
        },
        "term:water carries the overload": {
          "x": 597.23,
          "y": 65.71
        },
        "term:fixation cut both ways": {
          "x": 663.73,
          "y": 384.08
        },
        "cluster:0": {
          "x": 206.22,
          "y": 251.73
        },
        "cluster:1": {
          "x": 790.9,
          "y": 161.97
        },
        "cluster:2": {
          "x": 422.38,
          "y": 488.98
        },
        "cluster:3": {
          "x": 764.92,
          "y": 470.93
        },
        "cluster:4": {
          "x": 200.92,
          "y": 488.77
        },
        "cluster:5": {
          "x": 483.49,
          "y": 296.14
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T17:46:07.782Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "ecology-nutrient-cycles",
      "puzzleRevision": "fnv1a32:4ebe4b81",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:biogeochemical cycle": {
          "x": 95.11,
          "y": 47.04,
          "pinned": false
        },
        "term:reservoir": {
          "x": 68.28,
          "y": 166.83,
          "pinned": false
        },
        "term:residence time": {
          "x": 241.44,
          "y": 114.05,
          "pinned": false
        },
        "term:hydrosphere": {
          "x": 804.23,
          "y": 289.98,
          "pinned": true
        },
        "term:evaporation": {
          "x": 945.73,
          "y": 150.23,
          "pinned": false
        },
        "term:condensation": {
          "x": 774.07,
          "y": 194.5,
          "pinned": true
        },
        "term:precipitation": {
          "x": 949.05,
          "y": 52,
          "pinned": false
        },
        "term:sublimation": {
          "x": 971.38,
          "y": 303.3,
          "pinned": true
        },
        "term:surface runoff": {
          "x": 817.04,
          "y": 52,
          "pinned": false
        },
        "term:bicarbonate": {
          "x": 304.75,
          "y": 581.91,
          "pinned": true
        },
        "term:limestone": {
          "x": 457.69,
          "y": 577.9,
          "pinned": true
        },
        "term:fossil fuel": {
          "x": 300.44,
          "y": 421.98,
          "pinned": true
        },
        "term:subduction": {
          "x": 458.55,
          "y": 411.88,
          "pinned": true
        },
        "term:nitrogen fixation": {
          "x": 746.56,
          "y": 588.93,
          "pinned": false
        },
        "term:nitrogen-fixing bacteria": {
          "x": 935.84,
          "y": 588.93,
          "pinned": false
        },
        "term:ammonification": {
          "x": 921.46,
          "y": 492.3,
          "pinned": false
        },
        "term:nitrification": {
          "x": 903.88,
          "y": 395.4,
          "pinned": false
        },
        "term:denitrification": {
          "x": 594.36,
          "y": 513.07,
          "pinned": true
        },
        "term:weathering": {
          "x": 118.92,
          "y": 453.43,
          "pinned": true
        },
        "term:limiting nutrient": {
          "x": 102.51,
          "y": 570.46,
          "pinned": false
        },
        "term:eutrophication": {
          "x": 574.1,
          "y": 237.35,
          "pinned": true
        },
        "term:dead zone": {
          "x": 408.94,
          "y": 134.44,
          "pinned": true
        },
        "term:acid rain": {
          "x": 404.6,
          "y": 244.22,
          "pinned": true
        },
        "term:the odd one out": {
          "x": 180.23,
          "y": 280.58,
          "pinned": true
        },
        "term:water carries the overload": {
          "x": 597.23,
          "y": 65.71,
          "pinned": false
        },
        "term:fixation cut both ways": {
          "x": 663.73,
          "y": 384.08,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5131.62,
        "score": 5131.618089914513
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T17:46:58.385Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "ecology-nutrient-cycles",
      "puzzleRevision": "fnv1a32:4ebe4b81",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 161.3,
          "y": 156.82,
          "pinned": true
        },
        "cluster:1": {
          "x": 883.81,
          "y": 187.03,
          "pinned": true
        },
        "cluster:2": {
          "x": 414.07,
          "y": 534.24,
          "pinned": true
        },
        "cluster:3": {
          "x": 879.67,
          "y": 499.11,
          "pinned": true
        },
        "cluster:4": {
          "x": 146.08,
          "y": 506.71,
          "pinned": true
        },
        "cluster:5": {
          "x": 587.89,
          "y": 241.97,
          "pinned": true
        }
      },
      "bridges": {
        "term:the odd one out": {
          "x": 154.18,
          "y": 320.65,
          "pinned": true
        },
        "term:water carries the overload": {
          "x": 620.27,
          "y": 98.77,
          "pinned": true
        },
        "term:fixation cut both ways": {
          "x": 634.68,
          "y": 396.1,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "biogeochemical cycle",
          "reservoir",
          "residence time"
        ],
        "cluster:1": [
          "hydrosphere",
          "evaporation",
          "condensation",
          "precipitation",
          "sublimation",
          "surface runoff"
        ],
        "cluster:2": [
          "bicarbonate",
          "limestone",
          "fossil fuel",
          "subduction"
        ],
        "cluster:3": [
          "nitrogen fixation",
          "nitrogen-fixing bacteria",
          "ammonification",
          "nitrification",
          "denitrification"
        ],
        "cluster:4": [
          "weathering",
          "limiting nutrient"
        ],
        "cluster:5": [
          "eutrophication",
          "dead zone",
          "acid rain"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "reservoir",
          "biogeochemical cycle",
          "residence time"
        ],
        "cluster:1": [
          "evaporation",
          "condensation",
          "surface runoff",
          "precipitation",
          "sublimation",
          "hydrosphere"
        ],
        "cluster:2": [
          "subduction",
          "fossil fuel",
          "bicarbonate",
          "limestone"
        ],
        "cluster:3": [
          "nitrification",
          "denitrification",
          "nitrogen-fixing bacteria",
          "nitrogen fixation",
          "ammonification"
        ],
        "cluster:4": [
          "limiting nutrient",
          "weathering"
        ],
        "cluster:5": [
          "acid rain",
          "eutrophication",
          "dead zone"
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
        "totalLength": 563.2890750848104
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T17:48:27.614Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-14T17:42:57.256Z",
    "bridgePreconnect": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
