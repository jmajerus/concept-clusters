// Generated from content/puzzles/cellular-energy.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "cellular-energy",
  "title": "How a cell captures and spends energy",
  "category": "biology",
  "subcategories": {
    "biology": "foundations"
  },
  "large": true,
  "info": {
    "text": "The two processes at the centre of a cell's energy budget — building sugar from light, and taking it apart again — and the molecules that carry energy between them.",
    "citations": [
      {
        "title": "Biology 2e, 8.1: Overview of Photosynthesis",
        "publisher": "OpenStax, Rice University",
        "url": "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis"
      },
      {
        "title": "Biology 2e, Chapter 7: Cellular Respiration",
        "publisher": "OpenStax, Rice University",
        "url": "https://openstax.org/books/biology-2e/pages/7-chapter-summary"
      }
    ]
  },
  "clusters": [
    {
      "id": "capturing-light",
      "name": "Capturing light",
      "color": "teal",
      "fact": "Light energy is absorbed by a pigment and used to build sugar from air and water.",
      "terms": [
        "sunlight",
        "chlorophyll",
        "chloroplast",
        "thylakoid",
        "light-dependent reactions",
        "Calvin cycle",
        "stomata"
      ],
      "seeds": [
        "sunlight",
        "chlorophyll"
      ],
      "termInfo": {
        "sunlight": {
          "text": "The energy source for nearly all life on Earth, arriving as light that a pigment can absorb.",
          "links": [
            {
              "href": "wiki:Sunlight"
            }
          ]
        },
        "chlorophyll": {
          "text": "The green pigment that absorbs light energy and starts the whole process.",
          "links": [
            {
              "href": "wiki:Chlorophyll"
            }
          ]
        },
        "chloroplast": {
          "text": "The organelle this all happens inside, with its own folded internal membranes.",
          "links": [
            {
              "href": "wiki:Chloroplast"
            }
          ]
        },
        "thylakoid": {
          "text": "The stacked internal membrane where light is actually absorbed and the first energy captured.",
          "links": [
            {
              "href": "wiki:Thylakoid"
            }
          ]
        },
        "light-dependent reactions": "The first stage: light is absorbed and its energy loaded onto carrier molecules.",
        "Calvin cycle": {
          "text": "The second stage: that captured energy is spent building sugar, with no light needed directly.",
          "links": [
            {
              "href": "wiki:Calvin cycle"
            }
          ]
        },
        "stomata": {
          "text": "Adjustable pores on a leaf's surface that let gases pass in and out.",
          "links": [
            {
              "href": "wiki:Stoma"
            }
          ]
        }
      },
      "info": {
        "text": "Capture happens in two stages: one that needs light, and one that spends what the first stage stored.",
        "links": [
          {
            "href": "wiki:Photosynthesis"
          }
        ]
      }
    },
    {
      "id": "releasing-energy",
      "name": "Releasing stored energy",
      "color": "blue",
      "fact": "Food is dismantled in stages, and how much energy is recovered depends on whether oxygen is available.",
      "terms": [
        "mitochondria",
        "fermentation",
        "glycolysis",
        "citric acid cycle",
        "oxidative phosphorylation",
        "aerobic",
        "anaerobic"
      ],
      "seeds": [
        "mitochondria",
        "fermentation"
      ],
      "termInfo": {
        "mitochondria": {
          "text": "The organelle where the oxygen-using stages take place — often called the cell's powerhouse.",
          "links": [
            {
              "href": "wiki:Mitochondria"
            }
          ]
        },
        "fermentation": {
          "text": "Getting energy from food without oxygen, at a far lower yield — what makes bread rise and milk sour.",
          "links": [
            {
              "href": "wiki:Fermentation"
            }
          ]
        },
        "glycolysis": {
          "text": "The opening stage, splitting sugar out in the cell fluid; it needs no oxygen at all.",
          "links": [
            {
              "href": "wiki:Glycolysis"
            }
          ]
        },
        "citric acid cycle": {
          "text": "The stage that strips the remaining energy off what the first stage left, loading it onto carriers.",
          "links": [
            {
              "href": "wiki:Citric acid cycle"
            }
          ]
        },
        "oxidative phosphorylation": {
          "text": "The final stage, where those carriers are unloaded and most of the energy is actually captured.",
          "links": [
            {
              "href": "wiki:Oxidative phosphorylation"
            }
          ]
        },
        "aerobic": {
          "text": "Requiring oxygen — by far the higher-yield route, and the one most cells use when they can.",
          "links": [
            {
              "href": "wiki:Cellular respiration"
            }
          ]
        },
        "anaerobic": {
          "text": "Proceeding without oxygen — the fallback when none is available.",
          "links": [
            {
              "href": "wiki:Anaerobic respiration"
            }
          ]
        }
      },
      "info": "Release happens in steps rather than one burst, because letting a sugar's energy go all at once would lose most of it as heat."
    },
    {
      "id": "energy-carriers",
      "name": "What carries the energy",
      "color": "amber",
      "fact": "A cell does not move energy loose; it moves molecules that hold it and hand it on.",
      "terms": [
        "ADP",
        "redox reaction",
        "electron carrier"
      ],
      "seeds": [
        "ADP",
        "redox reaction"
      ],
      "termInfo": {
        "ADP": {
          "text": "The spent form, waiting to be recharged once its energy has been handed over.",
          "links": [
            {
              "href": "wiki:Adenosine diphosphate"
            }
          ]
        },
        "redox reaction": {
          "text": "A transfer of electrons from one molecule to another — how energy actually moves at this scale.",
          "links": [
            {
              "href": "wiki:Redox"
            }
          ]
        },
        "electron carrier": "A molecule that picks up high-energy electrons at one step and drops them off at another."
      },
      "info": "Energy never travels loose through a cell. It is always held by a molecule, handed on, and eventually spent."
    }
  ],
  "bridges": [
    {
      "id": "glucose",
      "term": "glucose",
      "clusters": [
        0,
        1
      ],
      "fact": "Photosynthesis locks energy into glucose, and respiration takes it apart to release that energy again.",
      "info": {
        "text": "A simple sugar that holds chemical energy in its bonds.",
        "links": [
          {
            "href": "wiki:Glucose"
          }
        ]
      },
      "relationKind": "dynamic"
    },
    {
      "id": "oxygen",
      "term": "oxygen",
      "clusters": [
        0,
        1
      ],
      "fact": "Photosynthesis releases oxygen as a by-product, and aerobic respiration consumes it to get energy out of food.",
      "info": {
        "text": "A gas made of two bonded oxygen atoms (O2) — about a fifth of the air.",
        "links": [
          {
            "href": "wiki:Oxygen"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "aerobic"
      ]
    },
    {
      "id": "carbon-dioxide",
      "term": "carbon dioxide",
      "clusters": [
        0,
        1
      ],
      "fact": "The return leg of the same trade: carbon dioxide is built into sugar by the Calvin cycle and released again when food is broken down.",
      "info": {
        "text": "A gas of one carbon atom bonded to two oxygen atoms, and the source of the carbon in every sugar a plant builds.",
        "links": [
          {
            "href": "wiki:Carbon dioxide"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Calvin cycle",
        null
      ]
    },
    {
      "id": "atp",
      "term": "ATP",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Both processes end by loading energy onto the same molecule, and it is what every other part of the cell actually spends.",
      "info": {
        "text": "Adenosine triphosphate: the molecule cells use to store and spend usable energy.",
        "links": [
          {
            "href": "wiki:Adenosine triphosphate"
          }
        ]
      },
      "relationKind": "foundation"
    }
  ],
  "lenses": [
    {
      "id": "places-not-processes",
      "prompt": "Which terms name a physical structure you could point to, rather than a process that happens?",
      "explanation": "Three of these are structures inside a cell and one is a pore on a leaf's surface, but all four are things with a location. The rest name processes: the light-dependent reactions, the Calvin cycle, glycolysis, the citric acid cycle and oxidative phosphorylation are all sequences of events, and fermentation is a route rather than a place. Sorting structure from process first makes the stages much easier to keep straight, because each process then has somewhere to happen.",
      "targets": [
        "chloroplast",
        "thylakoid",
        "stomata",
        "mitochondria"
      ]
    },
    {
      "id": "no-oxygen-needed",
      "prompt": "Which terms name a stage or route that proceeds with no oxygen at all?",
      "explanation": "Glycolysis runs in the cell fluid and needs no oxygen, which is why every kind of cell can do it; fermentation is what follows when there is no oxygen to continue with, at a fraction of the energy yield. The citric acid cycle and oxidative phosphorylation both depend on oxygen at the end of the line. Anaerobic is excluded on purpose: it names the condition of having no oxygen rather than a stage or route that runs under it.",
      "targets": [
        "glycolysis",
        "fermentation"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "summary": "How a cell captures energy from light, how it releases energy from food, and why the two are near-opposites.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Two processes sit at the centre of a cell's energy budget, and they are close to exact opposites. One uses light to build sugar out of air and water. The other takes sugar apart to get that energy back out.\r\n\r\nThat symmetry is easy to misread. Releasing energy from food is not the animal counterpart of capturing it from light — it is what nearly every living cell does, constantly, including every cell in a leaf. What differs between organisms is not whether they spend energy but whether they can also capture it. A plant does both at once; an animal only ever spends.\r\n\r\nBoth work in stages rather than in a single step. Letting a sugar's energy go all at once would lose most of it as heat, so each stage hands what it recovers to a molecule built to hold it, and those molecules hand it on again until the energy reaches a form the rest of the cell can actually spend."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "high"
      }
    ]
  }
});
