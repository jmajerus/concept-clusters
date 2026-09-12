// Generated from content/puzzles/tropical-cyclone-machine.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "tropical-cyclone-machine",
  "title": "The Tropical Cyclone Machine",
  "category": "atmospheric-science",
  "subcategories": {
    "atmospheric-science": "meteorology"
  },
  "large": true,
  "info": {
    "text": "How a tropical cyclone works from the inside out: the environmental gatekeepers that let one form, the ocean-fueled heat engine that drives it, the ring anatomy it builds, and the official stages of its rise and transformation.",
    "citations": [
      {
        "title": "Tropical cyclone",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Tropical_cyclone"
      },
      {
        "title": "Tropical cyclogenesis",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Tropical_cyclogenesis"
      }
    ]
  },
  "clusters": [
    {
      "id": "genesis-gatekeepers",
      "name": "Genesis Gatekeepers",
      "color": "teal",
      "fact": "Before any tropical cyclone exists, the environment must supply warm water, deep moisture, mild winds aloft, and spin from the rotation of the Earth — plus a patch of disturbed weather to organize around.",
      "terms": [
        "Coriolis effect",
        "warm sea surface temperature",
        "vertical wind shear",
        "tropical wave",
        "Intertropical Convergence Zone",
        "atmospheric instability"
      ],
      "seeds": [
        "Coriolis effect",
        "warm sea surface temperature"
      ],
      "termInfo": {
        "Coriolis effect": {
          "text": "Because the Earth spins, air moving toward the low-pressure center is deflected sideways — counterclockwise in the Northern Hemisphere, clockwise in the south. Without this deflection there is no circulation, which is why storms rarely form within about 5° of the equator.",
          "links": [
            {
              "href": "wiki:Coriolis effect"
            }
          ]
        },
        "warm sea surface temperature": {
          "text": "Ocean water of roughly 27 °C (81 °F) or warmer through a deep layer is the fuel threshold: it evaporates fast enough to feed a storm, and cyclones weaken quickly over cooler water.",
          "links": [
            {
              "href": "wiki:Sea surface temperature"
            }
          ]
        },
        "vertical wind shear": {
          "text": "The change of wind speed or direction with height. Strong shear tears a developing storm apart by blowing its warm core away from its rainfall; young cyclones need quiet upper winds.",
          "links": [
            {
              "href": "wiki:Wind shear"
            }
          ]
        },
        "tropical wave": {
          "text": "A ripple of low pressure moving westward off Africa on the easterly trade winds — the pre-existing disturbance that gives a future hurricane its organizing center. Dozens form each season; only a few become storms.",
          "links": [
            {
              "href": "wiki:Tropical wave"
            }
          ]
        },
        "Intertropical Convergence Zone": {
          "text": "The permanent belt near the equator where trade winds from both hemispheres collide and force air upward, seeding thunderstorm clusters — the nursery most tropical cyclones are born in.",
          "links": [
            {
              "href": "wiki:Intertropical Convergence Zone"
            }
          ]
        },
        "atmospheric instability": {
          "text": "Air that keeps rising once nudged, because it is warmer than its surroundings. Instability builds the towering thunderstorms whose condensation powers the storm.",
          "links": [
            {
              "href": "wiki:Atmospheric instability"
            }
          ]
        }
      },
      "info": "Six environmental conditions must line up before a disturbance can become a storm; remove any one and it stays an ordinary cluster of tropical showers."
    },
    {
      "id": "heat-engine",
      "name": "The Heat Engine",
      "color": "blue",
      "fact": "A tropical cyclone runs on the ocean: evaporation lifts moisture aloft, condensation releases latent heat that powers the wind, and inward-spiraling air tightens the spin.",
      "terms": [
        "latent heat",
        "conservation of angular momentum",
        "warm core",
        "maximum potential intensity"
      ],
      "seeds": [
        "latent heat",
        "conservation of angular momentum"
      ],
      "termInfo": {
        "latent heat": {
          "text": "Energy stored when water evaporates and released when the vapor condenses. A hurricane's winds are ultimately powered by this release aloft in its thunderstorms — the single most important energy conversion in the storm.",
          "links": [
            {
              "href": "wiki:Latent heat"
            }
          ]
        },
        "conservation of angular momentum": {
          "text": "As air spirals inward toward the center, its rotation speeds up the way a skater speeds up by pulling in their arms — turning a gentle tropical swirl into destructive winds.",
          "links": [
            {
              "href": "wiki:Conservation of angular momentum"
            }
          ]
        },
        "warm core": "The storm's center is warmer than its surroundings through much of the atmosphere — the thermal fingerprint of condensation heating, and the reason a tropical cyclone weakens without ocean fuel.",
        "maximum potential intensity": {
          "text": "The theoretical speed limit a storm cannot exceed in its environment, set mainly by how warm the water beneath it is and how winds change with height. Real storms fall short of it most of the time.",
          "links": [
            {
              "href": "wiki:Maximum potential intensity"
            }
          ]
        }
      },
      "info": "The storm is a machine for turning warm-ocean evaporation into wind; this cluster names its parts and its speed limit."
    },
    {
      "id": "radial-anatomy",
      "name": "Radial Anatomy",
      "color": "amber",
      "fact": "From orbit or radar, a mature storm is built in rings: a calm, clear eye at the center, a violent eyewall ringing it, and spiral rainbands reaching outward for hundreds of miles.",
      "terms": [
        "eye",
        "eyewall",
        "rainband",
        "upper-level outflow",
        "central dense overcast"
      ],
      "seeds": [
        "eye",
        "eyewall"
      ],
      "termInfo": {
        "eye": {
          "text": "The eerily calm, often cloud-free center, typically 20–50 km across, where air sinks and warms. Its calm is deceptive: it is ringed by the worst winds in the storm.",
          "links": [
            {
              "href": "wiki:Eye (cyclone)"
            }
          ]
        },
        "eyewall": {
          "text": "The ring of towering thunderstorms hugging the eye, where the strongest winds and heaviest rain of the entire storm are found.",
          "links": [
            {
              "href": "wiki:Eyewall"
            }
          ]
        },
        "rainband": {
          "text": "Spiral bands of showers and thunderstorms trailing outward from the core for hundreds of miles — the arms that give a storm its familiar satellite look. Bands can spawn brief tornadoes far from the center.",
          "links": [
            {
              "href": "wiki:Rainband"
            }
          ]
        },
        "upper-level outflow": {
          "text": "High-altitude winds that carry spent air away from the storm's top like an exhaust system; efficient outflow lets the engine inhale more air at the surface and keeps it strengthening.",
          "links": [
            {
              "href": "wiki:Outflow (meteorology)"
            }
          ]
        },
        "central dense overcast": {
          "text": "The thick, solid shield of high cloud around the eye that hides the inner core from satellites — the CDO that makes a mature storm look like a packed white disc from orbit.",
          "links": [
            {
              "href": "wiki:Central dense overcast"
            }
          ]
        }
      },
      "info": "On radar or satellite, a mature cyclone reads as rings: calm center, violent ring, spiral arms."
    },
    {
      "id": "intensity-career",
      "name": "The Intensity Career",
      "color": "magenta",
      "fact": "Strength is a career of official stages and turning points — depression to tropical storm to hurricane, episodes of rapid strengthening, inner-core shuffles, and a final change of identity or decay.",
      "terms": [
        "hurricane",
        "tropical storm",
        "tropical depression",
        "rapid intensification",
        "eyewall replacement cycle",
        "extratropical transition"
      ],
      "seeds": [
        "hurricane",
        "tropical storm"
      ],
      "termInfo": {
        "tropical depression": "The first official stage: a closed circulation with sustained winds up to 38 mph, numbered rather than named (for example, Tropical Depression Nine).",
        "tropical storm": "The stage at 39–73 mph sustained winds, when the system earns a name from the rotating annual list — and when its winds first become genuinely dangerous.",
        "hurricane": {
          "text": "The same rotating storm at 74 mph or stronger. It is called a hurricane in the Atlantic and eastern Pacific, a typhoon in the northwest Pacific, and simply a tropical cyclone around India and Australia — one phenomenon, regional names.",
          "links": [
            {
              "href": "wiki:Tropical cyclone"
            }
          ]
        },
        "rapid intensification": {
          "text": "An increase of at least roughly 35 mph in maximum sustained winds within 24 hours. It is the forecaster's nightmare because it often happens just before landfall and is hard to predict.",
          "links": [
            {
              "href": "wiki:Rapid intensification"
            }
          ]
        },
        "eyewall replacement cycle": {
          "text": "An outer ring of thunderstorms strangles the inner eyewall, which collapses and is replaced. Winds briefly weaken, then can rebound stronger with a larger, more dangerous wind field.",
          "links": [
            {
              "href": "wiki:Eyewall replacement cycle"
            }
          ]
        },
        "extratropical transition": "The tropical chapter's other exit: a poleward storm merges with mid-latitude weather systems, keeping — often widening — its wind field while losing its warm core and symmetric shape."
      },
      "info": "Strength has an official vocabulary: stages to pass through, processes that raise or reshuffle it, and two ways the tropical story ends."
    }
  ],
  "bridges": [
    {
      "id": "warm-ocean-fuel",
      "term": "warm ocean fuel",
      "clusters": [
        0,
        1
      ],
      "fact": "Genesis and engine share one fuel gauge: only where sea surface temperatures reach roughly 27 °C can evaporation feed the latent-heat engine, and a storm fades when it leaves that warm water behind.",
      "info": "A label for the shared constraint, not a formal term: both clusters are describing one relationship — the ocean's warmth is simultaneously the entry requirement and the running fuel.",
      "termRole": "connector",
      "idealTerms": [
        "warm sea surface temperature",
        "latent heat"
      ]
    },
    {
      "id": "eye-subsidence",
      "term": "eye subsidence",
      "clusters": [
        2,
        1
      ],
      "fact": "Latent heat released in the eyewall forces air to sink gently over the center; that subsidence warms, dries, and clears the eye — the engine building the most famous feature of the storm.",
      "info": "The mechanism link: this bridge is how the engine's heating shows up as a physical structure — condensation aloft forces gentle sinking at the center.",
      "termRole": "connector",
      "idealTerms": [
        "eye",
        "latent heat"
      ]
    },
    {
      "id": "inner-core-reorganization",
      "term": "inner-core reorganization",
      "clusters": [
        2,
        3
      ],
      "fact": "In an eyewall replacement cycle, an outer ring of storms chokes off the inner eyewall; the old eyewall collapses and is replaced, winds briefly weaken, and the storm often rebounds stronger.",
      "info": "The event link: this bridge names the process by which anatomy and intensity change together during an eyewall replacement cycle.",
      "termRole": "connector",
      "idealTerms": [
        "eyewall",
        "eyewall replacement cycle"
      ]
    }
  ],
  "lenses": [
    {
      "id": "energy-currency",
      "prompt": "Every process on this board — genesis, wind, even the clear eye — traces back to one energy conversion. Which term names it?",
      "explanation": "Evaporation stores energy and condensation aloft releases it as latent heat: it warms the core, lowers the surface pressure, and drives the winds. Warm water matters only because it feeds evaporation, and the eye is clear because that same heating forces gentle sinking at the center.",
      "targets": [
        "latent heat"
      ],
      "reasons": {
        "latent heat": "The release of latent heat in condensation is the engine behind genesis, wind speed, the warm core, and the subsidence that clears the eye."
      }
    },
    {
      "id": "spin-at-two-scales",
      "prompt": "Two terms here describe the same spin-up physics at different scales — one deflects moving air because the Earth turns, the other tightens the storm's own circulation as air spirals inward. Which two?",
      "explanation": "The Coriolis effect gives the incipient disturbance its sideways deflection (and keeps storms away from the equator); conservation of angular momentum then spins that slow swirl into eyewall winds as air converges. Same physics at two scales — and neither is the energy source, which is latent heat.",
      "targets": [
        "Coriolis effect",
        "conservation of angular momentum"
      ],
      "reasons": {
        "Coriolis effect": "Supplies the deflecting rotation a disturbance needs to begin circulating at all.",
        "conservation of angular momentum": "Concentrates that rotation into destructive winds as air spirals into a smaller radius."
      }
    },
    {
      "id": "official-stages",
      "prompt": "Which of these are official stage names the storm itself is called, rather than processes that change its strength or identity?",
      "explanation": "Tropical depression, tropical storm, and hurricane are the rungs of the official ladder. Rapid intensification and the eyewall replacement cycle are changes of strength, and extratropical transition is a change of identity — none of them is a name the storm carries at a given moment.",
      "targets": [
        "tropical depression",
        "tropical storm",
        "hurricane"
      ],
      "reasons": {
        "tropical depression": "The first named rung: winds up to 38 mph.",
        "tropical storm": "The middle rung: 39–73 mph, when the storm gets its name.",
        "hurricane": "The top rung: 74 mph or stronger (called a typhoon in the northwest Pacific)."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "tropical-cyclone-threat",
        "reason": "Track and hazard clusters assume the anatomy and lifecycle vocabulary built on this first board."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The storm as a machine",
    "summary": "Why hurricanes need strict admission requirements, and how a warm ocean becomes a 150 mph wind.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every year, around eighty named tropical cyclones form over the world's warm seas — storms known regionally as hurricanes, typhoons, or simply cyclones. They are not freak accidents but heat engines with strict admission requirements: water warm enough to keep evaporating, moist air, gentle winds aloft, and a nudge of rotation from the spinning Earth. Where any ingredient is missing, a tropical disturbance stays an ordinary cluster of showers.\r\n\r\nWhen the requirements are met, the storm assembles itself in rings around a calm center while its winds climb through official stages with names and thresholds. Follow one storm through a full career and the satellite photograph starts to make sense: why the eye is clear, why the worst weather hugs it, and why a storm can strengthen, reshuffle its core, or transform into something else rather than simply blow itself out."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)"
      }
    ]
  }
});
