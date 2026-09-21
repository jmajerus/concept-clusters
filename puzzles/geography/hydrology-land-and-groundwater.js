// Generated from content/puzzles/hydrology-land-and-groundwater.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "hydrology-land-and-groundwater",
  "title": "Catchments & Groundwater: how land holds and routes water",
  "category": "geography",
  "subcategories": {
    "geography": "hydrology"
  },
  "info": {
    "text": "The structure beneath the cycle: how ridgelines fence drainage basins and tributaries build branching networks — and how rock below the water table stores water like a sponge, lets it flow where pores connect, and leaks it back to daylight in springs.",
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Drainage_basin",
        "label": "Wikipedia: Drainage basin"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Aquifer",
        "label": "Wikipedia: Aquifer"
      }
    ],
    "citations": [
      {
        "title": "Drainage basin — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Drainage_basin"
      },
      {
        "title": "Aquifer — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Aquifer"
      }
    ]
  },
  "clusters": [
    {
      "id": "catchments",
      "name": "Catchments — how land routes water",
      "color": "teal",
      "fact": "Every drop that falls lands inside a drainage basin: ridgeline divides wall it off, tributaries merge into a branching network, and in closed basins the water never reaches the sea at all.",
      "terms": [
        "drainage basin",
        "tributary",
        "drainage divide",
        "confluence",
        "stream order",
        "floodplain",
        "endorheic basin"
      ],
      "seeds": [
        "drainage basin",
        "tributary"
      ],
      "termInfo": {
        "drainage basin": "All the land whose surface water converges to a single outlet — also called a watershed or catchment.",
        "tributary": "A stream that feeds a larger one, building the drainage network's branching tree.",
        "drainage divide": "The line of high ground separating one basin's water from the next — the catchment's boundary.",
        "confluence": "The point where two streams join into one.",
        "stream order": "A channel's rank in the network's hierarchy: headwater streams are order 1, and the order grows where streams join.",
        "floodplain": "Flat land beside a channel, built from the river's own deposits and regularly drowned when the river overflows.",
        "endorheic basin": "A closed basin with no outlet to the ocean — water leaves only by evaporation or by sinking underground."
      }
    },
    {
      "id": "subsurface",
      "name": "Groundwater — rock as sponge and pipe",
      "color": "blue",
      "fact": "Below the water table, rock and sediment hold water in their pores like a sponge: porous, permeable layers store it as aquifers, caves in soluble rock drain it fast, and springs are where the sponge leaks daylight.",
      "terms": [
        "aquifer",
        "water table",
        "groundwater",
        "porosity",
        "permeability",
        "spring",
        "karst"
      ],
      "seeds": [
        "aquifer",
        "water table"
      ],
      "termInfo": {
        "aquifer": "A rock or sediment layer that stores and yields usable water — the world's underground sponge.",
        "water table": "The surface below which the ground is saturated — the level where water stands in an unpumped well.",
        "groundwater": "Water filling the pores and fractures below Earth's surface — about 30% of the world's fresh water.",
        "porosity": "The fraction of the rock that is open space — how much water the rock can hold.",
        "permeability": "How easily water moves through connected pores — how well the rock lets water flow.",
        "spring": "A place where groundwater emerges naturally at the surface.",
        "karst": "Landscape of soluble limestone riddled with caves and sinkholes, where groundwater travels through fast conduits."
      }
    }
  ],
  "bridges": [
    {
      "id": "baseflow",
      "term": "baseflow",
      "clusters": [
        0,
        1
      ],
      "fact": "Between storms, rivers keep flowing on baseflow: aquifers leak slowly into the channel network through springs and streambeds, so the groundwater sponge feeds the catchment's rivers long after the rain stops.",
      "info": {
        "text": "A gaining stream sits lower than the water table, so groundwater seeps into the channel; where the water table drops below the channel, the stream loses water to the ground instead.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Baseflow",
            "label": "Wikipedia: Baseflow"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Aquifer",
            "label": "Wikipedia: Aquifer (gaining-stream cross-section)"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "boundary-and-junction",
      "prompt": "One term names the boundary of a drainage basin, one names where two streams join. Which are they?",
      "explanation": "The divide is the ridge line that splits one basin's water from the next; the confluence is the junction where streams merge. Tributaries are the streams themselves — neither the fence nor the meeting point.",
      "targets": [
        "drainage divide",
        "confluence"
      ]
    },
    {
      "id": "two-rock-properties",
      "prompt": "Two rock properties together decide whether a layer can be a good aquifer: how much water it can hold, and how easily water moves through it. Which are they?",
      "explanation": "Porosity is the storage fraction — open space per volume; permeability is the flow property — how connected those spaces are. A rock can hold much (porous chalk) yet yield little if permeability is low.",
      "targets": [
        "porosity",
        "permeability"
      ]
    },
    {
      "id": "nowhere-to-the-sea",
      "prompt": "Which term names a basin whose water never reaches the ocean?",
      "explanation": "Endorheic basins are closed: evaporation and underground loss are the only exits, which is why their lakes turn salty. Every other drainage basin term here assumes an outlet.",
      "targets": [
        "endorheic basin"
      ]
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "optional",
    "summary": "Reading the terrain and the rock as one water system.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Every river begins on a slope, and every slope belongs to a basin. Water writes the land: divides fence the catchments, tributaries branch like trees, and floodplains record where the river has wandered. The landscape is the plumbing.\r\n\r\nBelow it all sits the invisible reserve. Rock holds water in its pores, moves it along connected cracks, and hands it back at springs — which is why some wells run for a century and some hillsides weep after every rain."
    }
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
