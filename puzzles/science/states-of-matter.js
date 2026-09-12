// Generated from content/puzzles/states-of-matter.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "states-of-matter",
  "title": "States of matter",
  "category": "science",
  "clusters": [
    {
      "id": "solid",
      "name": "Solid",
      "color": "teal",
      "fact": "Solids have a fixed shape and volume because particles are packed tightly and can only vibrate.",
      "terms": [
        "fixed shape",
        "crystal",
        "rigid"
      ],
      "seeds": [
        "fixed shape",
        "crystal"
      ],
      "termInfo": {
        "fixed shape": {
          "text": "A solid's particles are packed too tightly to move past one another, so the material holds its shape without a container.",
          "links": [
            {
              "href": "wiki:Solid"
            }
          ]
        },
        "crystal": {
          "links": [
            {
              "href": "wiki:Crystal"
            }
          ]
        },
        "rigid": {
          "text": "How strongly a material resists changing shape under an applied force.",
          "links": [
            {
              "href": "wiki:Stiffness"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Solid"
          }
        ]
      }
    },
    {
      "id": "liquid",
      "name": "Liquid",
      "color": "blue",
      "fact": "Liquids take the shape of their container while keeping a fixed volume.",
      "terms": [
        "surface tension",
        "viscosity",
        "flow"
      ],
      "seeds": [
        "surface tension",
        "viscosity"
      ],
      "termInfo": {
        "surface tension": {
          "links": [
            {
              "href": "wiki:Surface tension"
            }
          ]
        },
        "viscosity": {
          "links": [
            {
              "href": "wiki:Viscosity"
            }
          ]
        },
        "flow": {
          "text": "The study of how liquids and gases move — what lets a liquid flow to take its container's shape.",
          "links": [
            {
              "href": "wiki:Fluid dynamics"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Liquid"
          }
        ]
      }
    },
    {
      "id": "gas",
      "name": "Gas",
      "color": "amber",
      "fact": "Gases expand to fill any container because their particles move freely and far apart.",
      "terms": [
        "pressure",
        "expansion",
        "compressible",
        "diffusion"
      ],
      "seeds": [
        "pressure",
        "expansion"
      ],
      "termInfo": {
        "pressure": {
          "links": [
            {
              "href": "wiki:Pressure"
            }
          ]
        },
        "expansion": {
          "text": "A material's tendency to increase in volume as it's heated — gases expand far more than solids or liquids.",
          "links": [
            {
              "href": "wiki:Thermal expansion"
            }
          ]
        },
        "compressible": {
          "links": [
            {
              "href": "wiki:Compressibility"
            }
          ]
        },
        "diffusion": {
          "text": "The gradual spreading of gas particles from an area of high concentration to low, without any outside push.",
          "links": [
            {
              "href": "wiki:Diffusion"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Gas"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "melting-point",
      "term": "melting point",
      "clusters": [
        0,
        1
      ],
      "fact": "Melting point bridges the two: it is the exact temperature where solid and liquid coexist — the same boundary in both directions.",
      "info": {
        "links": [
          {
            "href": "wiki:Melting point"
          }
        ]
      },
      "relationKind": "dynamic"
    },
    {
      "id": "boiling-point",
      "term": "boiling point",
      "clusters": [
        1,
        2
      ],
      "fact": "Boiling point bridges the two: it marks where liquid and gas are in equilibrium, and pressure shifts where that line falls.",
      "info": {
        "links": [
          {
            "href": "wiki:Boiling point"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "pressure"
      ]
    }
  ]
});
