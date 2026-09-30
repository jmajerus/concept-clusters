// Generated from content/puzzles/energy-flow.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "energy-flow",
  "title": "Energy flow in living systems",
  "category": "science",
  "clusters": [
    {
      "id": "photosynthesis",
      "name": "Photosynthesis",
      "color": "teal",
      "fact": "Plants turn sunlight, water, and carbon dioxide into food.",
      "terms": [
        "sunlight",
        "chlorophyll",
        "carbon dioxide"
      ],
      "seeds": [
        "sunlight",
        "chlorophyll"
      ],
      "termInfo": {
        "sunlight": {
          "links": [
            {
              "href": "wiki:Sunlight"
            }
          ]
        },
        "chlorophyll": {
          "text": "The green pigment in plant cells that absorbs light energy to power photosynthesis.",
          "links": [
            {
              "href": "wiki:Chlorophyll"
            }
          ]
        },
        "carbon dioxide": {
          "links": [
            {
              "href": "wiki:Carbon dioxide"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Photosynthesis"
          }
        ]
      }
    },
    {
      "id": "cellular-respiration",
      "name": "Cellular respiration",
      "color": "blue",
      "fact": "Cells break down food to release usable energy as ATP.",
      "terms": [
        "mitochondria",
        "ATP",
        "aerobic"
      ],
      "seeds": [
        "mitochondria",
        "ATP"
      ],
      "termInfo": {
        "mitochondria": {
          "text": "The organelle where cellular respiration happens — often called the cell's powerhouse.",
          "links": [
            {
              "href": "wiki:Mitochondrion"
            }
          ]
        },
        "ATP": {
          "text": "Adenosine triphosphate: the molecule cells use to store and spend usable energy.",
          "links": [
            {
              "href": "wiki:Adenosine triphosphate"
            }
          ]
        },
        "aerobic": {
          "text": "Respiration that requires oxygen — most cellular respiration in animals and plants works this way.",
          "links": [
            {
              "href": "wiki:Cellular respiration"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cellular respiration"
          }
        ]
      }
    },
    {
      "id": "ecosystems",
      "name": "Ecosystems",
      "color": "amber",
      "fact": "Energy flows through ecosystems along food chains.",
      "terms": [
        "food chain",
        "consumers",
        "decomposers",
        "trophic level"
      ],
      "seeds": [
        "food chain",
        "consumers"
      ],
      "termInfo": {
        "food chain": {
          "links": [
            {
              "href": "wiki:Food chain"
            }
          ]
        },
        "consumers": {
          "links": [
            {
              "href": "wiki:Consumer (food chain)"
            }
          ]
        },
        "decomposers": {
          "text": "Organisms such as fungi and bacteria that break down dead material and release its nutrients again.",
          "links": [
            {
              "href": "wiki:Decomposer"
            }
          ]
        },
        "trophic level": {
          "text": "An organism's position in a food chain — producers, then the consumers that eat them, and so on up the chain.",
          "links": [
            {
              "href": "wiki:Trophic level"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Ecosystem"
          }
        ]
      }
    }
  ],
  "bridges": [
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
      "id": "glucose",
      "term": "glucose",
      "clusters": [
        0,
        1
      ],
      "fact": "Photosynthesis locks energy into glucose, and respiration takes it apart to release that energy as ATP.",
      "info": {
        "text": "A simple sugar that holds chemical energy in its bonds.",
        "links": [
          {
            "href": "wiki:Glucose"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "ATP"
      ]
    },
    {
      "id": "producers",
      "term": "producers",
      "clusters": [
        0,
        2
      ],
      "fact": "Organisms that photosynthesize are producers — the base of the food chain every other organism feeds from.",
      "info": {
        "text": "An organism that makes its own food from light or chemical energy rather than by eating other organisms.",
        "links": [
          {
            "href": "wiki:Autotroph"
          }
        ]
      },
      "relationKind": "foundation"
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "summary": "Trace how energy is captured, transferred, and passed through living systems.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Living systems transform energy rather than create it. Photosynthesis captures light energy in glucose; cellular respiration transfers that chemical energy to ATP, the immediately usable energy currency of cells.\r\n\r\nAt the ecosystem scale, feeding relationships carry stored energy from each level to the one above it, and whatever is never eaten is broken back down and returned to the soil. Energy flows through these levels and is ultimately dissipated as heat, while matter such as carbon is recycled."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      },
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "high"
      },
      {
        "name": "Codex (GPT-5.6 Luna)",
        "reasoning": "max"
      }
    ]
  }
});
