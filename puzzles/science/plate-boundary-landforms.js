// Generated from content/puzzles/plate-boundary-landforms.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "plate-boundary-landforms",
  "title": "Where Plates Meet",
  "category": "Science",
  "large": true,
  "clusters": [
    {
      "id": "divergent",
      "name": "Divergent boundaries",
      "color": "teal",
      "fact": "At divergent boundaries, plates move apart and rising mantle melts as pressure falls, supplying magma that forms new crust.",
      "terms": [
        "Mid-Atlantic Ridge",
        "rift valley",
        "seafloor spreading",
        "basaltic crust"
      ],
      "seeds": [
        "Mid-Atlantic Ridge",
        "rift valley"
      ],
      "termInfo": {
        "Mid-Atlantic Ridge": {
          "link": "wiki:Mid-Atlantic Ridge"
        },
        "rift valley": {
          "link": "wiki:Rift valley"
        },
        "seafloor spreading": {
          "link": "wiki:Seafloor spreading"
        },
        "basaltic crust": {
          "text": "The mafic oceanic crust produced as magma cools at a spreading center.",
          "link": "wiki:Oceanic crust"
        }
      },
      "info": {
        "link": "wiki:Divergent boundary",
        "citations": [
          {
            "title": "Understanding plate motions",
            "publisher": "U.S. Geological Survey",
            "url": "https://pubs.usgs.gov/gip/dynamic/understanding.html"
          }
        ]
      }
    },
    {
      "id": "subduction",
      "name": "Subduction zones",
      "color": "blue",
      "fact": "At a subduction zone, dense oceanic lithosphere bends beneath another plate, forming a trench, an inclined earthquake zone, and commonly a volcanic arc.",
      "terms": [
        "Mariana Trench",
        "volcanic arc",
        "Wadati-Benioff zone",
        "accretionary wedge"
      ],
      "seeds": [
        "Mariana Trench",
        "volcanic arc"
      ],
      "termInfo": {
        "Mariana Trench": {
          "link": "wiki:Mariana Trench"
        },
        "volcanic arc": {
          "link": "wiki:Volcanic arc"
        },
        "Wadati-Benioff zone": {
          "text": "The dipping plane of earthquake foci that traces a descending slab.",
          "link": "wiki:Wadati-Benioff zone"
        },
        "accretionary wedge": {
          "text": "Sediment scraped from the descending plate and piled onto the overriding plate.",
          "link": "wiki:Accretionary wedge"
        }
      },
      "info": {
        "link": "wiki:Subduction",
        "citations": [
          {
            "title": "This Dynamic Planet",
            "publisher": "U.S. Geological Survey",
            "url": "https://pubs.usgs.gov/pdf/planet.pdf"
          }
        ]
      }
    },
    {
      "id": "collision",
      "name": "Continental collision",
      "color": "amber",
      "fact": "When two buoyant continental plates converge, neither readily sinks; the crust shortens, thickens, and rises into mountain belts and high plateaus.",
      "terms": [
        "Himalayas",
        "Tibetan Plateau",
        "suture zone",
        "fold-and-thrust belt"
      ],
      "seeds": [
        "Himalayas",
        "Tibetan Plateau"
      ],
      "termInfo": {
        "Himalayas": {
          "link": "wiki:Himalayas"
        },
        "Tibetan Plateau": {
          "link": "wiki:Tibetan Plateau"
        },
        "suture zone": {
          "text": "The deformed belt marking where two formerly separate continental blocks joined.",
          "link": "wiki:Suture (geology)"
        },
        "fold-and-thrust belt": {
          "text": "A zone where compression folds rock layers and stacks them along thrust faults.",
          "link": "wiki:Fold and thrust belt"
        }
      },
      "info": {
        "link": "wiki:Continental collision",
        "citations": [
          {
            "title": "The Himalayas: Two continents collide",
            "publisher": "U.S. Geological Survey",
            "url": "https://pubs.usgs.gov/gip/dynamic/himalaya.html"
          }
        ]
      }
    },
    {
      "id": "transform",
      "name": "Transform boundaries",
      "color": "magenta",
      "fact": "At transform boundaries, plates slide horizontally past one another, concentrating lateral displacement along strike-slip fault zones without creating or consuming crust.",
      "terms": [
        "San Andreas Fault",
        "strike-slip fault",
        "offset streams",
        "linear valleys"
      ],
      "seeds": [
        "San Andreas Fault",
        "strike-slip fault"
      ],
      "termInfo": {
        "San Andreas Fault": {
          "link": "wiki:San Andreas Fault"
        },
        "strike-slip fault": {
          "link": "wiki:Strike-slip tectonics"
        },
        "offset streams": {
          "text": "Channels displaced sideways where repeated fault motion cuts across their courses."
        },
        "linear valleys": {
          "text": "Straight valleys produced where erosion follows fractured and sheared rock along a fault zone."
        }
      },
      "info": {
        "link": "wiki:Transform fault",
        "citations": [
          {
            "title": "Understanding plate motions",
            "publisher": "U.S. Geological Survey",
            "url": "https://pubs.usgs.gov/gip/dynamic/understanding.html"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "oceanic-lithosphere",
      "term": "oceanic lithosphere",
      "clusters": [
        0,
        1
      ],
      "fact": "Oceanic lithosphere links the two boundaries: it is created and carried away from spreading ridges, then bends downward and is recycled at subduction zones.",
      "info": {
        "link": "wiki:Oceanic lithosphere",
        "citations": [
          {
            "title": "Understanding plate motions",
            "publisher": "U.S. Geological Survey",
            "url": "https://pubs.usgs.gov/gip/dynamic/understanding.html"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "seafloor spreading",
        "Mariana Trench"
      ]
    }
  ],
  "lenses": [
    {
      "id": "volcanic-activity",
      "prompt": "Which concepts directly involve magma creating volcanic rock or landforms?",
      "explanation": "The Mid-Atlantic Ridge is a volcanic spreading center; seafloor spreading adds magma that cools into new crust; basaltic crust is that volcanic product; and volcanic arcs form where subduction promotes melting beneath the overriding plate.",
      "label": "Volcanic activity",
      "targets": [
        "Mid-Atlantic Ridge",
        "seafloor spreading",
        "basaltic crust",
        "volcanic arc"
      ]
    },
    {
      "id": "earthquake-activity",
      "prompt": "Which concepts explicitly identify a fault or a zone defined by earthquake activity?",
      "explanation": "The Wadati-Benioff zone is defined by its dipping plane of earthquake foci; the San Andreas Fault is an active plate-boundary fault; and strike-slip fault names the lateral fault type whose sudden slip produces earthquakes.",
      "label": "Earthquake activity",
      "targets": [
        "Wadati-Benioff zone",
        "San Andreas Fault",
        "strike-slip fault"
      ]
    }
  ]
});
