// Generated from content/puzzles/architecture-moving-through-light.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "architecture-moving-through-light",
  "title": "Moving Through Light: Path and Proportion",
  "category": "architecture",
  "subcategories": {
    "architecture": "form-and-space"
  },
  "info": {
    "text": "How architects choreograph the walk through a building: threading paths that order movement and views, then tuning daylight and measure so each room feels its intended size.",
    "citations": [
      {
        "title": "Enfilade vs Corridor -- Design Encyclopedia on sequential rooms versus dedicated passageways",
        "url": "https://design-encyclopedia.com/?E=461243&I=E"
      },
      {
        "title": "The Pantheon, Rome -- Smarthistory on dome, oculus, and light",
        "url": "https://smarthistory.org/the-pantheon/"
      }
    ]
  },
  "clusters": [
    {
      "id": "circulation-and-sequence",
      "name": "Circulation and Sequence",
      "color": "teal",
      "fact": "Architects order movement and views by threading rooms along axes, corridors, stairs, ramps, enfilades, and promenades.",
      "terms": [
        "axis",
        "corridor",
        "enfilade",
        "promenade",
        "ramp",
        "stair"
      ],
      "seeds": [
        "corridor",
        "stair"
      ],
      "termInfo": {
        "axis": {
          "text": "An organizing straight line that rooms, walls, and vistas align to."
        },
        "corridor": {
          "text": "A dedicated passage serving rooms from the side, so movement stays out of the rooms themselves."
        },
        "enfilade": {
          "text": "Rooms strung door-to-door with aligned openings, so one vista runs through them all."
        },
        "promenade": {
          "text": "A choreographed route sequencing varied spatial events into one walk."
        },
        "ramp": {
          "text": "A sloped path joining levels without steps."
        },
        "stair": {
          "text": "Steps joining levels, pacing ascent into a measured rhythm."
        }
      }
    },
    {
      "id": "light-and-proportion",
      "name": "Light and Proportion",
      "color": "blue",
      "fact": "Openings and measure tune how big a room feels: domes, vaults, bays, clerestories, and oculi meter daylight against proportion.",
      "terms": [
        "bay",
        "clerestory",
        "dome",
        "oculus",
        "proportion",
        "vault"
      ],
      "seeds": [
        "dome",
        "oculus"
      ],
      "termInfo": {
        "bay": {
          "text": "One measured module of a plan or elevation, repeated to order a building."
        },
        "clerestory": {
          "text": "High windows above the roofline bringing daylight deep into a room."
        },
        "dome": {
          "text": "A curved shell spanning a round room, gathering it under one crown."
        },
        "oculus": {
          "text": "A round eye open to the sky at a dome's crown."
        },
        "proportion": {
          "text": "The measured relationship of parts that sets a room's scale."
        },
        "vault": {
          "text": "An arched ceiling spanning between supports."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "pantheon-oculus",
      "term": "Pantheon oculus",
      "clusters": [
        0,
        1
      ],
      "fact": "The Pantheon's oculus crowns the rotunda's processional axis: a single eye of daylight that marks each step of the movement sequence through the room.",
      "termRole": "reference"
    }
  ],
  "lenses": [
    {
      "id": "straight-line-paths",
      "prompt": "Which two paths are defined by a single straight line of sight through the building?",
      "explanation": "An axis is the straight organizing line itself; an enfilade strings rooms so their doorways align on one axis, opening a single vista through them. A corridor serves rooms from the side and may turn, a promenade sequences varied spaces rather than one straight shot, and ramps and stairs change level instead of sighting distance.",
      "targets": [
        "axis",
        "enfilade"
      ],
      "reasons": {
        "axis": "The straight organizing line that vistas and rooms align to.",
        "enfilade": "Aligned doorways collapse several rooms onto one straight vista."
      }
    },
    {
      "id": "daylight-from-above",
      "prompt": "Which two openings admit daylight from above the eye line?",
      "explanation": "A clerestory is a band of high windows above the roofline; an oculus is an eye open to the sky. Domes and vaults are the solid shells around such openings, a bay is a measured module of plan, and proportion relates measures rather than admitting light.",
      "targets": [
        "clerestory",
        "oculus"
      ],
      "reasons": {
        "clerestory": "High windows that throw daylight deep into the room.",
        "oculus": "A sky-eye that drops one shaft of daylight from the crown."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Two boards on how built form shapes space: first carving voids and drawing boundaries, then sequencing movement and tuning light and proportion."
    },
    "entries": [
      {
        "id": "architecture-carving-enclosure",
        "reason": "Start with making enclosed space before moving through it: mass, void, and threshold."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "content": {
      "mediaType": "text/markdown",
      "text": "Great buildings are experienced on foot. Long before a visitor names a style, the plan has already decided how they will arrive, what they will see first, and how daylight will meet them in each room.\n\nTwo ideas run side by side here: the paths that order movement and views, and the openings and measures that tune light and scale. Together they explain why some walks feel inevitable and some rooms feel larger than their footprint."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code"
      }
    ]
  }
});
