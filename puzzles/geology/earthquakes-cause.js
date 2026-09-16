// Generated from content/puzzles/earthquakes-cause.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "earthquakes-cause",
  "title": "Earthquakes I: Why the Ground Breaks",
  "category": "geology",
  "large": true,
  "info": {
    "text": "This board teaches the vocabulary of the earthquake itself: where rupture begins inside a fault, which way the crust breaks under different stresses, and what science can -- and cannot -- promise about the next event.",
    "links": [
      {
        "href": "https://www.usgs.gov/programs/earthquake-hazards/learn-about-earthquake-hazards",
        "label": "USGS: Learn about earthquake hazards"
      }
    ],
    "citations": [
      {
        "title": "Earthquake Hazards Program glossary",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/glossary/earthquake-hazards-program"
      },
      {
        "title": "Fault",
        "publisher": "Encyclopaedia Britannica",
        "url": "https://www.britannica.com/science/fault-geology"
      },
      {
        "title": "Can you predict earthquakes?",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/faqs/can-you-predict-earthquakes"
      },
      {
        "title": "What is the difference between earthquake early warning, earthquake forecasts, earthquake probabilities, and earthquake prediction?",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/faqs/what-difference-between-earthquake-early-warning-earthquake-forecasts-earthquake-probabilities"
      },
      {
        "title": "What is an earthquake and what causes them to happen?",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/faqs/what-earthquake-and-what-causes-them-happen"
      }
    ]
  },
  "clusters": [
    {
      "id": "rupture-anatomy",
      "name": "Where rupture begins",
      "color": "teal",
      "fact": "An earthquake starts at a point inside the Earth where stuck rock finally lets go. These terms locate that point, the surface spot above it, and the sticking patches that set the clock.",
      "terms": [
        "epicenter",
        "hypocenter",
        "fault plane",
        "asperity",
        "locked fault",
        "fault creep",
        "focal depth"
      ],
      "seeds": [
        "epicenter",
        "hypocenter"
      ],
      "termInfo": {
        "asperity": "A stuck patch on a fault surface. Rupture usually begins at an asperity, at the moment stress finally overcomes its friction.",
        "epicenter": "The point on the Earth's surface directly above where rupture begins. News reports name it first, but the action starts kilometers below.",
        "fault creep": "Slow, more-or-less continuous slip on a fault. Creeping segments let strain trickle away, so they tend not to produce large earthquakes.",
        "fault plane": "The flat surface along which the two sides of a fault slip. The hypocenter is a point on it, and the surface trace of that plane is the fault line.",
        "focal depth": "How deep the hypocenter sits -- anywhere from the surface to about 800 km. Shaking weakens with depth and distance, and deep quakes are much less likely to spawn aftershock sequences.",
        "hypocenter": "The point within the Earth where rupture starts -- also called the focus. The epicenter is its projection onto the surface.",
        "locked fault": "A fault that is not slipping because friction beats the shear stress across it. It stores strain -- sometimes for centuries -- until an earthquake releases it."
      },
      "info": "The hypocenter (focus) is where rupture begins in the crust; the epicenter is the point on the surface directly above it. Asperities are the stuck patches where rupture usually starts; faults that creep never lock up long enough to store great earthquakes."
    },
    {
      "id": "fault-types",
      "name": "Fault types and stress regimes",
      "color": "blue",
      "fact": "How the crust is loaded picks the fault: pull it apart and the hanging wall drops, squeeze it and the hanging wall rides up, shear it and the blocks slide sideways past each other.",
      "terms": [
        "normal fault",
        "thrust fault",
        "strike-slip fault",
        "subduction zone",
        "Benioff zone",
        "blind thrust fault",
        "graben"
      ],
      "seeds": [
        "strike-slip fault",
        "subduction zone"
      ],
      "termInfo": {
        "Benioff zone": "The dipping plane of earthquakes that a downgoing oceanic slab traces, from the trench to hundreds of kilometers deep.",
        "blind thrust fault": "A thrust fault that does not rupture all the way to the surface, leaving no visible trace on the ground. The hazard hides.",
        "graben": "A crustal block dropped down between two parallel normal faults -- the valley floor of a rift.",
        "normal fault": "A dip-slip fault on which the hanging wall slides down relative to the footwall -- the crust is being pulled apart. Rift valleys are lines of them.",
        "strike-slip fault": "A near-vertical fault whose blocks slide horizontally past each other, like the San Andreas. Stand on the fault: if the far side moves left it is left-lateral; right, right-lateral.",
        "subduction zone": "A plate boundary where an oceanic plate dives beneath another. Its great thrust faults produce the planet's largest earthquakes.",
        "thrust fault": "A low-angle dip-slip fault on which the hanging wall is pushed up over the footwall -- the crust is being squeezed short. Subduction megathrusts are the largest of them."
      },
      "info": "Normal faults bound rift valleys where crust lengthens; thrust faults build mountain belts and the great subduction-zone megathrusts where crust shortens; strike-slip faults like the San Andreas shear sideways. A Benioff zone is the dipping plane of quakes a downgoing slab traces."
    },
    {
      "id": "anticipation",
      "name": "Prediction, forecast, early warning",
      "color": "amber",
      "fact": "No one has ever predicted an earthquake's date, place, and size. What science offers is probability over years (forecasts) and seconds of warning after shaking has already begun.",
      "terms": [
        "earthquake prediction",
        "earthquake forecast",
        "earthquake early warning",
        "seismic gap"
      ],
      "seeds": [
        "earthquake prediction",
        "earthquake early warning"
      ],
      "termInfo": {
        "earthquake early warning": "An alert issued after an earthquake has started, computed from fast P-wave detections and racing the slower damaging shaking. Seconds, not days.",
        "earthquake forecast": "A probability statement -- the chance of an earthquake of some size in a region over some years. The honest alternative to prediction.",
        "earthquake prediction": "A statement of an earthquake's date, location, and magnitude. No scientist has ever delivered one, and USGS does not expect it in the foreseeable future.",
        "seismic gap": "A quiet, locked stretch of an otherwise active fault -- storing strain, and historically where large earthquakes have refilled the gap."
      },
      "info": "A prediction must state time, place, and magnitude -- and nobody can. Forecasts give probabilities instead; early warning is a notification issued only after an earthquake has started. A seismic gap is a quiet, locked stretch of fault storing strain."
    }
  ],
  "bridges": [
    {
      "id": "sudden-slip",
      "term": "sudden slip on a fault",
      "clusters": [
        0,
        1
      ],
      "fact": "One event, two vocabularies: an earthquake is sudden slip on a fault. The fault type says which way the blocks lurched; the rupture anatomy says where the slip started and what was stuck before it.",
      "info": "Patch scale meets boundary scale: the asperities and locked segments of a rupture live on a fault whose type -- normal, thrust, or strike-slip -- was set by how the plate boundary loads it."
    }
  ],
  "lenses": [
    {
      "id": "san-andreas-behaviors",
      "prompt": "Along the San Andreas Fault, some segments slip almost continuously in tiny shocks while nearby segments sit stuck for centuries before a great rupture. Which terms describe these behaviors -- and the boundary type that makes it all possible?",
      "explanation": "One fault, three of this board's terms: the strike-slip boundary itself, creeping release where it slides freely, and locked storage where it does not. Scale keeps the exclusions honest -- an asperity is a stuck patch within one rupture, not a segment's long-term behavior, and a seismic gap describes where earthquakes are absent, not how the fault slips.",
      "targets": [
        "strike-slip fault",
        "fault creep",
        "locked fault"
      ],
      "reasons": {
        "fault creep": "Segments that adapt to the motion by constant slip produce many tiny shocks and few big ones.",
        "locked fault": "Where creep is absent, friction holds the blocks and strain builds for hundreds of years before releasing.",
        "strike-slip fault": "The Pacific Plate grinds northwestward past the North American Plate -- transform-boundary shear along a near-vertical fault."
      }
    },
    {
      "id": "what-science-promises",
      "prompt": "USGS states that neither it nor any other scientists have ever predicted a major earthquake. Which of these can seismology actually deliver today?",
      "explanation": "A prediction must state time, place, and magnitude, and nobody can deliver that. What exists is probabilistic forecasting and post-onset warning -- both real, neither a prediction. A seismic gap is a fact about a fault's history, not a product anyone can issue.",
      "targets": [
        "earthquake forecast",
        "earthquake early warning"
      ],
      "reasons": {
        "earthquake early warning": "Seconds of notice, computed only after an earthquake has already started, racing the slower damaging shaking.",
        "earthquake forecast": "Probabilities over years for a region -- the honest substitute for prediction."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "earthquakes-shaking",
        "reason": "This board ends where rupture suddenly releases stored strain; Earthquakes II picks up that release as radiated energy and follows it to the shaking people feel and the failures it causes."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The stuck spring: what an earthquake really is",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Most of what you know about earthquakes is the last second of a much slower story. Tectonic plates grind past each other at about the speed your fingernails grow, and along a fault the rock simply sticks. For years, sometimes for centuries, the stuck patch bends the rock around it and stores elastic strain like a wound spring.\r\n\r\nAn earthquake is the instant the spring wins. Rock snaps loose, the stored strain radiates away as shaking, and the fault readies its next argument. This lesson builds the vocabulary of that instant: where rupture begins and what was stuck before it let go, which way the crust breaks under different kinds of loading, and the honest line between what seismology can forecast and what it must admit it cannot predict."
    },
    "links": [
      {
        "href": "https://www.usgs.gov/faqs/can-you-predict-earthquakes",
        "label": "USGS: Can you predict earthquakes?"
      }
    ]
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
