// Generated from content/puzzles/earthquakes-shaking.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "earthquakes-shaking",
  "title": "Earthquakes II: From Waves to Damage",
  "category": "geology",
  "large": true,
  "info": {
    "text": "This board follows an earthquake's radiated energy outward: the wave families it becomes, how magnitude and intensity size it, how foreshock-mainshock-aftershock sequences unfold, and the ground hazards that turn shaking into damage.",
    "links": [
      {
        "href": "https://www.usgs.gov/glossary/earthquake-hazards-program",
        "label": "USGS Earthquake Hazards Program glossary"
      }
    ],
    "citations": [
      {
        "title": "Seismic wave",
        "publisher": "Encyclopaedia Britannica",
        "url": "https://www.britannica.com/science/seismic-wave"
      },
      {
        "title": "Earthquake Hazards Program glossary",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/glossary/earthquake-hazards-program"
      },
      {
        "title": "The Severity of an Earthquake",
        "publisher": "U.S. Geological Survey",
        "url": "https://pubs.usgs.gov/gip/earthq4/severitygip.html"
      },
      {
        "title": "Foreshocks, aftershocks - what's the difference?",
        "publisher": "U.S. Geological Survey",
        "url": "https://www.usgs.gov/faqs/foreshocks-aftershocks-whats-difference"
      }
    ]
  },
  "clusters": [
    {
      "id": "wave-families",
      "name": "How radiated energy travels",
      "color": "teal",
      "fact": "The sudden slip radiates four principal wave types in two families: body waves that travel through the Earth's interior, and surface waves that roll along it.",
      "terms": [
        "P-wave",
        "S-wave",
        "Love wave",
        "Rayleigh wave",
        "body wave",
        "surface wave",
        "attenuation"
      ],
      "seeds": [
        "P-wave",
        "S-wave"
      ],
      "termInfo": {
        "Love wave": {
          "text": "The faster surface wave: horizontal side-to-side shaking perpendicular to the direction of travel. Named for the seismologist A.E.H. Love."
        },
        "P-wave": {
          "text": "The primary (compressional) body wave: rock moves back and forth along the travel direction, like a slinky. Fastest of all seismic waves -- always first to arrive."
        },
        "Rayleigh wave": {
          "text": "A surface wave that rolls the ground in ellipses, like ocean swells. Slowest of the four, and it spreads out the most in time on a seismogram."
        },
        "S-wave": {
          "text": "The secondary (shear) body wave: rock moves perpendicular to the travel direction. Slower than P -- and unable to pass through liquid."
        },
        "attenuation": {
          "text": "The fading of wave amplitude with distance from the source -- the reason a faraway earthquake shakes less."
        },
        "body wave": {
          "text": "A wave that travels through the Earth's interior rather than along its surface. P and S waves are the two kinds."
        },
        "surface wave": {
          "text": "A wave that travels along the Earth's surface. Love and Rayleigh waves -- often the most destructive, because that is where we live."
        }
      },
      "info": {
        "text": "P-waves compress and stretch rock in the travel direction and arrive first; S-waves shear rock sideways and cannot cross liquid. Love waves shake the surface side to side; Rayleigh waves roll it in ellipses. Amplitude fades with distance -- attenuation."
      }
    },
    {
      "id": "magnitude-intensity",
      "name": "Sizing: magnitude versus intensity",
      "color": "blue",
      "fact": "One earthquake, two kinds of number: a single instrument-measured magnitude for the energy released at the source, and many intensity values that vary place to place with the observed effects.",
      "terms": [
        "Richter scale",
        "moment magnitude",
        "Modified Mercalli intensity",
        "isoseismal line"
      ],
      "seeds": [
        "Richter scale",
        "Modified Mercalli intensity"
      ],
      "termInfo": {
        "Modified Mercalli intensity": {
          "text": "A 12-level (I-XII) ranking of observed effects at a place -- felt reports, moved furniture, collapsed buildings. It varies from site to site for the same earthquake."
        },
        "isoseismal line": {
          "text": "A contour bounding points of equal intensity for one earthquake. Together they map how effects spread across the whole felt area."
        },
        "moment magnitude": {
          "text": "The scale devised for more precise study of great earthquakes; it is the magnitude number now reported for most significant events."
        },
        "Richter scale": {
          "text": "The 1935 magnitude scale: a logarithmic read of wave amplitude on a seismograph. Each whole step is ten times the amplitude and roughly 31 times the energy."
        }
      },
      "info": {
        "text": "The Richter scale reads wave amplitude on a seismograph -- each whole step is about ten times the amplitude and roughly 31 times the energy. Moment magnitude supersedes it for great earthquakes. Mercalli intensity (Roman numerals I-XII) describes effects at a place; it has no mathematical basis."
      }
    },
    {
      "id": "sequences",
      "name": "Foreshock, mainshock, aftershock",
      "color": "amber",
      "fact": "An earthquake is rarely alone: every shock is a foreshock, a mainshock, or an aftershock -- but only in retrospect. The biggest one is the mainshock by definition.",
      "terms": [
        "foreshock",
        "mainshock",
        "aftershock",
        "earthquake swarm"
      ],
      "seeds": [
        "aftershock",
        "foreshock"
      ],
      "termInfo": {
        "aftershock": {
          "text": "A smaller earthquake in the days to years after a mainshock, within 1-2 fault lengths -- minor readjustments along the portion of fault that slipped."
        },
        "earthquake swarm": {
          "text": "A run of earthquakes with no single dominant mainshock -- frequent in some volcanic regions, unlike an ordinary mainshock-aftershock sequence."
        },
        "foreshock": {
          "text": "A smaller quake that precedes the largest one in the same area -- identifiable only after the bigger shock happens."
        },
        "mainshock": {
          "text": "The largest shock of a sequence. The label is relative: it is the mainshock only because everything near it, before and after, is smaller."
        }
      },
      "info": {
        "text": "A foreshock cannot be identified until a larger quake follows it. Aftershocks are smaller events within 1-2 fault lengths of the mainshock, decaying in frequency over days to years. A swarm is a run of quakes with no dominant mainshock."
      }
    },
    {
      "id": "ground-hazards",
      "name": "What shaking does to the ground",
      "color": "magenta",
      "fact": "Waves become damage where site conditions let them: saturated sand loses its strength, slopes let go, and vertical seafloor motion can send a wave across an ocean.",
      "terms": [
        "liquefaction",
        "landslide",
        "tsunami",
        "amplification"
      ],
      "seeds": [
        "liquefaction",
        "tsunami"
      ],
      "termInfo": {
        "amplification": {
          "text": "Soft sediments and basin shapes focus and magnify shaking -- the same earthquake shakes soft ground harder than the bedrock next door."
        },
        "landslide": {
          "text": "Earthquake shaking moving surface material down a slope -- among the most damaging effects in mountainous terrain, and it can bury entire neighborhoods."
        },
        "liquefaction": {
          "text": "Shaking turns water-saturated sediment temporarily into a fluid -- like wet beach sand underfoot -- so the ground loses its strength and anything on it can tilt or sink."
        },
        "tsunami": {
          "text": "A sea wave set off when a great subduction quake displaces the seafloor vertically -- small at sea, destructive at the coast, crossing entire ocean basins."
        }
      },
      "info": {
        "text": "Liquefaction: water-saturated sediment temporarily loses strength and behaves like a fluid under shaking. Amplification: soft sediments and basin geometry can multiply shaking relative to nearby bedrock. Landslides move slope material; tsunamis race across whole ocean basins."
      }
    }
  ],
  "bridges": [
    {
      "id": "the-seismogram",
      "term": "the seismogram",
      "clusters": [
        0,
        1
      ],
      "fact": "Magnitude is computed from wave amplitudes recorded on calibrated seismographs, and the P-minus-S arrival interval estimates distance to the epicenter -- the waves are the raw signal the scales read.",
      "info": {
        "text": "Same recording, two uses: amplitude sizes the event, and the timing between arrivals locates it."
      }
    },
    {
      "id": "ground-motion",
      "term": "ground motion at the site",
      "clusters": [
        0,
        3
      ],
      "fact": "What a site feels is the wave field filtered by distance and local sediment: amplification can turn one magnitude into wildly different shaking, and that shaking -- not the magnitude number -- triggers liquefaction and slides.",
      "info": {
        "text": "This is why a moderate quake on soft bay mud can out-damage a larger one on granite."
      }
    },
    {
      "id": "intensity-maps",
      "term": "intensity maps of damage",
      "clusters": [
        1,
        3
      ],
      "fact": "Modified Mercalli values and isoseismal lines record where effects concentrate -- generally at maximum near the epicenter -- turning felt damage into a map that complements the single magnitude number.",
      "info": {
        "text": "Isoseismal maps also size historic quakes that happened before seismographs existed, from reported effects alone."
      }
    }
  ],
  "lenses": [
    {
      "id": "two-numbers-newsdesk",
      "prompt": "A news desk has room for one number ('how big was it?') and one description of what people experienced ('how bad was it where you were?'). Which two terms from this board serve those two jobs today?",
      "explanation": "One earthquake, one magnitude, many intensities: magnitude measures energy at the source, intensity measures effects at your location. The Richter scale is the historical amplitude read that moment magnitude has superseded in reporting, amplification explains why intensity varies site to site, and an isoseismal map is drawn afterward from the intensity reports.",
      "targets": [
        "moment magnitude",
        "Modified Mercalli intensity"
      ],
      "reasons": {
        "Modified Mercalli intensity": "The effects-based description that varies from place to place -- what people actually experienced where they were.",
        "moment magnitude": "The single instrument-derived size number now reported for significant events -- one per earthquake."
      }
    },
    {
      "id": "retrospective-labels",
      "prompt": "A magnitude 4.8 shock strikes near a city; three days later the same fault segment produces a 6.9, followed by a decaying run of smaller shocks. Which terms describe the three parts of this story?",
      "explanation": "None of the three labels is known in advance; each is assigned by comparison with the biggest shock. That is also why this is not a swarm -- a swarm has no single dominant mainshock.",
      "targets": [
        "foreshock",
        "mainshock",
        "aftershock"
      ],
      "reasons": {
        "aftershock": "The decaying run of smaller shocks -- minor readjustments along the portion of fault that slipped.",
        "foreshock": "The 4.8 -- a foreshock only in retrospect, once the larger quake followed it.",
        "mainshock": "The 6.9 -- the largest shock of the sequence, which is what makes it the mainshock by definition."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "earthquakes-cause",
        "reason": "Play first: Earthquakes I explains what breaks and why; this board assumes the rupture has happened and follows its radiated energy outward."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "After the slip: following the energy",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "An earthquake does not end when the fault stops moving. The energy released at the hypocenter travels outward as waves -- some squeezing rock like a slinky, some shearing it sideways, some rolling the ground surface itself -- and everything people experience comes from those waves arriving.\n\nThis lesson follows that energy the way a seismologist does: how the waves themselves are classified, how instruments turn them into magnitude numbers while people turn them into intensity reports, how one shock becomes a sequence of smaller ones, and how the shaking finds the ground's weak spots -- wet sand, steep slopes, soft basins -- and makes them fail."
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
