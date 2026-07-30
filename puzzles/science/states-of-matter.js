// Concept Clusters puzzle: States of matter
// Category: Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "states-of-matter",
  "title": "States of matter",
  "category": "Science",
  "clusters": [
    {
      "name": "Solid",
      "info": {
        "link": "wiki:Solid"
      },
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
          "link": "wiki:Solid"
        },
        "crystal": {
          "link": "wiki:Crystal"
        },
        "rigid": {
          "text": "How strongly a material resists changing shape under an applied force.",
          "link": "wiki:Stiffness"
        }
      }
    },
    {
      "name": "Liquid",
      "info": {
        "link": "wiki:Liquid"
      },
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
          "link": "wiki:Surface tension"
        },
        "viscosity": {
          "link": "wiki:Viscosity"
        },
        "flow": {
          "text": "The study of how liquids and gases move — what lets a liquid flow to take its container's shape.",
          "link": "wiki:Fluid dynamics"
        }
      }
    },
    {
      "name": "Gas",
      "info": {
        "link": "wiki:Gas"
      },
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
          "link": "wiki:Pressure"
        },
        "expansion": {
          "text": "A material's tendency to increase in volume as it's heated — gases expand far more than solids or liquids.",
          "link": "wiki:Thermal expansion"
        },
        "compressible": {
          "link": "wiki:Compressibility"
        },
        "diffusion": {
          "text": "The gradual spreading of gas particles from an area of high concentration to low, without any outside push.",
          "link": "wiki:Diffusion"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "melting point",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Melting point bridges the two: it is the exact temperature where solid and liquid coexist — the same boundary in both directions.",
      "info": {
        "link": "wiki:Melting point"
      }
    },
    {
      "term": "boiling point",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Boiling point bridges the two: it marks where liquid and gas are in equilibrium, and pressure shifts where that line falls.",
      "idealTerms": [
        null,
        "pressure"
      ],
      "info": {
        "link": "wiki:Boiling point"
      }
    }
  ]
};
