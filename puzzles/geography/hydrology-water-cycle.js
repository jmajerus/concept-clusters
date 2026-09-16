// Generated from content/puzzles/hydrology-water-cycle.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "hydrology-water-cycle",
  "title": "The Water Cycle: pools and fluxes",
  "category": "geography",
  "info": {
    "text": "The engine room of hydrology: where Earth's water parks — oceans, ice, soil, and air — and the powered transfers that never let it stay parked, from evaporation skyward to percolation downward.",
    "links": [
      {
        "href": "https://www.usgs.gov/special-topics/water-science-school/science/water-cycle",
        "label": "USGS Water Science School: Water cycle"
      }
    ],
    "citations": [
      {
        "title": "Water cycle — U.S. Geological Survey Water Science School",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
      }
    ]
  },
  "clusters": [
    {
      "id": "pools",
      "name": "Pools — where water sits",
      "color": "teal",
      "fact": "Earth's water parks in reservoirs of every phase: the oceans hold 96% of it as salt water, ice and snow lock freshwater in place, and what is left sits in lakes, soil, air, and rock.",
      "terms": [
        "ocean",
        "lake",
        "glacier",
        "snowpack",
        "soil moisture",
        "water vapor",
        "permafrost"
      ],
      "seeds": [
        "ocean",
        "lake"
      ],
      "termInfo": {
        "ocean": "Holds 96% of Earth's water — saline, and the engine of evaporation that drives the whole cycle.",
        "lake": "A pool of standing water in a depression, refilled by rivers and precipitation and drained by outflow and evaporation.",
        "glacier": "A mass of persistent land ice — Earth's largest freshwater store, releasing meltwater each warm season.",
        "snowpack": "Seasonal snow accumulated at elevation and latitude, storing winter precipitation until it melts into streams.",
        "soil moisture": "Water held between grains in the upper soil — the pool plants drink from between rains.",
        "water vapor": "Water as gas in the atmosphere — a small store, but the fastest-turning one.",
        "permafrost": "Ground frozen for two or more consecutive years, locking water — and carbon — in place; thaw releases both."
      }
    },
    {
      "id": "fluxes",
      "name": "Fluxes — how water moves",
      "color": "blue",
      "fact": "Water never stays parked: the sun lifts it skyward as vapor, clouds return it as precipitation, and gravity carries it across and into the ground — every pool is drained and refilled by these transfers.",
      "terms": [
        "precipitation",
        "evaporation",
        "transpiration",
        "condensation",
        "infiltration",
        "runoff",
        "percolation"
      ],
      "seeds": [
        "precipitation",
        "evaporation"
      ],
      "termInfo": {
        "precipitation": "Water falling from clouds as rain, snow, sleet, or hail — the cycle's delivery step.",
        "evaporation": "The phase change from liquid to vapor at a water or land surface, powered by the sun.",
        "transpiration": "Evaporation through plants: roots draw up soil water and leaves release it as vapor.",
        "condensation": "Vapor turning into liquid droplets as air cools — how clouds form.",
        "infiltration": "Water entering the soil at the surface — the first step on the way underground.",
        "runoff": "Water flowing over the land toward channels when rain arrives faster than the ground can absorb it.",
        "percolation": "Water moving down through soil and rock past the root zone toward the water table."
      }
    }
  ],
  "bridges": [
    {
      "id": "water-cycle",
      "term": "water cycle",
      "clusters": [
        0,
        1
      ],
      "fact": "The cycle is the pools and fluxes as one system: the sun evaporates water from oceans and land, winds carry the vapor, condensation builds clouds, precipitation refills lakes and snowpack, and gravity runs the rest downhill — every pool is a snapshot of a moving system.",
      "info": {
        "text": "Solar energy and gravity drive the continual movement of water between its stores; human water use and climate change alter both sides of the system.",
        "links": [
          {
            "href": "https://www.usgs.gov/special-topics/water-science-school/science/water-cycle",
            "label": "USGS Water Science School: Water cycle"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "frozen-pools",
      "prompt": "Three pools hold water as a solid. Which are they?",
      "explanation": "Glacier and snowpack freeze from above; permafrost is ground frozen solid for years. Lakes, oceans, and soil moisture hold liquid water, and water vapor is a gas.",
      "targets": [
        "glacier",
        "snowpack",
        "permafrost"
      ]
    },
    {
      "id": "downward-fluxes",
      "prompt": "Two fluxes carry water downward into the ground. Which are they?",
      "explanation": "Infiltration crosses the soil surface; percolation continues down through soil and rock toward the water table. Runoff travels across the surface, and precipitation falls from the sky but has not entered the ground.",
      "targets": [
        "infiltration",
        "percolation"
      ]
    },
    {
      "id": "vapor-liftoff",
      "prompt": "Which flux turns liquid water into vapor over seas, lakes, and bare soil?",
      "explanation": "Evaporation is the sun-powered liquid-to-vapor change at any surface. Transpiration is its plant-mediated cousin — the vapor exits through leaves, not off open water and soil.",
      "targets": [
        "evaporation"
      ]
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "hydrology-land-and-groundwater",
        "reason": "Continue from the cycle to the structure it flows through: drainage networks on the surface and aquifers beneath them."
      },
      {
        "id": "hydrology-human-water",
        "reason": "Finish with the human science: gauges and water budgets, floods and droughts, dams and overdraft."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "optional",
    "summary": "Earth's water is always moving between resting places.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Seen from space, Earth is the water planet: oceans, ice, clouds, and green river valleys — all of it one substance changing address. The water cycle is the set of paths that never close. The sun lifts water out of seas and soil, winds carry the vapor, clouds deliver it as rain and snow, and gravity walks it downhill toward the sea again.\r\n\r\nWhere the water parks — and how fast it moves between parking spots — decides which landscapes bloom and which go dry. That is the whole subject in one loop."
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
