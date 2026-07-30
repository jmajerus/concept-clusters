// Concept Clusters puzzle: River basins and human life
// Large size: 16 cluster terms + 3 bridge terms = 19 nodes.
// Matrix design: thematic clusters + basin-profile lenses.

export default {
  "id": "river-basins-and-human-life",
  "title": "River basins and human life",
  "category": "Geography",
  "large": true,
  "info": {
    "text": "River basins connect headwaters, tributaries, floodplains, and deltas with livelihoods, hazards, infrastructure, and cooperation across an entire drainage system.",
    "link": "wiki:Drainage basin"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Explore how regional environments shape livelihoods, settlement, and the management of shared resources.",
      "link": "wiki:Human geography"
    },
    "entries": [
      {
        "id": "climate-and-livelihoods",
        "via": [
          "water management",
          "land use"
        ],
        "reason": "Compare river-basin profiles with broader regional relationships among climate, ecosystems, livelihoods, and adaptation."
      },
      {
        "id": "ancient-civilizations",
        "via": [
          "irrigation",
          "floodplains"
        ],
        "reason": "Examine how river environments and water management supported several early urban societies."
      }
    ]
  },
  "lenses": [
    {
      "id": "nile-basin-profile",
      "prompt": "Which concepts describe the Nile Basin's headwaters-to-delta system, irrigation, hydropower, and international water-sharing?",
      "targets": [
        "headwaters",
        "delta",
        "irrigation",
        "hydropower",
        "water-sharing agreement",
        "transboundary river"
      ],
      "explanation": "The Nile links distant headwaters to a heavily cultivated delta, supports large irrigation and hydropower systems, and crosses national borders that make water-sharing agreements and disputes central to basin governance.",
      "reasons": {
        "headwaters": "The Nile system begins in multiple headwater regions, including the Ethiopian Highlands and the African Great Lakes region.",
        "delta": "The river reaches the Mediterranean through the Nile Delta, a densely settled and cultivated lowland.",
        "irrigation": "Nile water has long supported irrigated agriculture in otherwise dry environments.",
        "hydropower": "Large dams use the river's flow and stored water to generate electricity.",
        "water-sharing agreement": "States in the basin negotiate how shared water should be allocated and managed.",
        "transboundary river": "The Nile and its tributaries cross or border multiple countries."
      }
    },
    {
      "id": "mekong-basin-profile",
      "prompt": "Which concepts describe the Mekong Basin's tributary-and-delta system, flood pulse, fisheries, dams, and international coordination?",
      "targets": [
        "tributary network",
        "delta",
        "inland fisheries",
        "seasonal flooding",
        "dam operation",
        "transboundary river"
      ],
      "explanation": "The Mekong's tributaries and seasonal flood pulse support a major inland fishery and a productive delta, while dam operation and the river's international course create basin-wide coordination challenges.",
      "reasons": {
        "tributary network": "Tributaries gather water from a large and environmentally varied basin.",
        "delta": "The Mekong Delta is a low-lying agricultural and settlement region at the river's mouth.",
        "inland fisheries": "Fish migrations and floodplain habitats support one of the world's important inland fisheries.",
        "seasonal flooding": "Annual high water connects channels, wetlands, and floodplains and helps drive ecological productivity.",
        "dam operation": "Reservoir releases and water levels can affect flow timing, sediment, fisheries, and downstream users.",
        "transboundary river": "The Mekong crosses or borders several Southeast Asian countries."
      }
    },
    {
      "id": "mississippi-basin-profile",
      "prompt": "Which concepts describe the Mississippi Basin's tributary-floodplain system, navigation, bank erosion, zoning, and flood control?",
      "targets": [
        "tributary network",
        "floodplain",
        "navigation",
        "bank erosion",
        "floodplain zoning",
        "flood control"
      ],
      "explanation": "The Mississippi integrates a vast tributary network and broad floodplains with commercial navigation, while bank erosion and flood risk are managed through engineering, land-use rules, and emergency planning.",
      "reasons": {
        "tributary network": "Major tributaries gather runoff from a large portion of the central United States.",
        "floodplain": "Broad floodplains store floodwater, support ecosystems and agriculture, and also expose settlements to risk.",
        "navigation": "A maintained channel and lock-and-dam systems support extensive inland shipping.",
        "bank erosion": "Moving water can remove riverbank material and threaten land, infrastructure, and navigation channels.",
        "floodplain zoning": "Land-use rules can limit or shape development in areas exposed to flooding.",
        "flood control": "Levees, spillways, reservoirs, forecasting, and emergency measures are used to reduce flood impacts."
      }
    },
    {
      "id": "ganges-brahmaputra-basin-profile",
      "prompt": "Which concepts describe the Ganges–Brahmaputra Basin's transboundary headwaters-to-delta system, flood regime, farming, and pollution pressures?",
      "targets": [
        "headwaters",
        "delta",
        "irrigation",
        "seasonal flooding",
        "water pollution",
        "transboundary river"
      ],
      "explanation": "Himalayan and plateau headwaters feed a vast international river system whose monsoon floods, irrigation networks, densely settled delta, and water-quality pressures link upstream and downstream communities.",
      "reasons": {
        "headwaters": "Major tributaries rise in the Himalayas and adjoining highlands.",
        "delta": "The rivers form the extensive Ganges–Brahmaputra–Meghna delta before reaching the Bay of Bengal.",
        "irrigation": "River water supports intensive agriculture across large parts of the basin.",
        "seasonal flooding": "Monsoon rainfall and snowmelt produce recurring floods that can replenish soils while also causing severe damage.",
        "water pollution": "Urban wastewater, industry, agriculture, and solid waste place heavy pressure on water quality in parts of the basin.",
        "transboundary river": "The river system links several countries and requires decisions with upstream and downstream consequences."
      }
    },
    {
      "id": "nile-ganges-shared-profile",
      "prompt": "Which concepts appeared in both the Nile and Ganges–Brahmaputra basin profiles?",
      "targets": [
        "headwaters",
        "delta",
        "irrigation",
        "transboundary river"
      ],
      "explanation": "Both profiles follow large international rivers from distant headwaters to densely used deltas and emphasize irrigation and transboundary governance, even though their climates, flood regimes, histories, and institutions differ.",
      "reasons": {
        "headwaters": "Both systems gather water from headwater regions far from their deltas.",
        "delta": "Both terminate in major, densely settled deltas.",
        "irrigation": "Both support extensive irrigated agriculture.",
        "transboundary river": "Both cross national boundaries and connect decisions made in several states."
      }
    }
  ],
  "clusters": [
    {
      "name": "River system",
      "color": "teal",
      "fact": "A basin works as a connected system: headwaters and tributaries gather water, floodplains exchange water and sediment with the channel, and deltas form where rivers meet standing water.",
      "terms": [
        "headwaters",
        "tributary network",
        "floodplain",
        "delta"
      ],
      "seeds": [
        "headwaters",
        "delta"
      ],
      "termInfo": {
        "headwaters": {
          "text": "The upper streams and source areas where a river system begins.",
          "link": "wiki:River source"
        },
        "tributary network": {
          "text": "The branching system of smaller rivers and streams that feed a main channel.",
          "link": "wiki:Tributary"
        },
        "floodplain": {
          "text": "Low land beside a river that is built by sediment and periodically occupied by floodwater.",
          "link": "wiki:Floodplain"
        },
        "delta": {
          "text": "A depositional landform built where a river divides and releases sediment near its mouth.",
          "link": "wiki:River delta"
        }
      },
      "info": {
        "link": "wiki:Drainage basin"
      }
    },
    {
      "name": "Human uses",
      "color": "blue",
      "fact": "River water and channels support agriculture, transport, electricity generation, and fisheries, but one use can change the flows and habitats on which another depends.",
      "terms": [
        "irrigation",
        "navigation",
        "hydropower",
        "inland fisheries"
      ],
      "seeds": [
        "irrigation",
        "navigation"
      ],
      "termInfo": {
        "irrigation": {
          "text": "The managed application of water to crops through canals, pumps, pipes, reservoirs, or other systems.",
          "link": "wiki:Irrigation"
        },
        "navigation": {
          "text": "The use and maintenance of rivers and connected waterways for moving people and goods.",
          "link": "wiki:Inland waterway"
        },
        "hydropower": {
          "text": "Electricity generated by converting the energy of moving or stored water.",
          "link": "wiki:Hydroelectricity"
        },
        "inland fisheries": {
          "text": "The capture or cultivation of fish and other aquatic organisms in rivers, lakes, reservoirs, and floodplains.",
          "link": "wiki:Fishery"
        }
      },
      "info": {
        "link": "wiki:Water resources"
      }
    },
    {
      "name": "Hazards and pressures",
      "color": "amber",
      "fact": "River basins redistribute both benefits and risks: floods, drought, erosion, and pollution can originate in one place and affect communities or ecosystems far downstream.",
      "terms": [
        "seasonal flooding",
        "drought",
        "bank erosion",
        "water pollution"
      ],
      "seeds": [
        "seasonal flooding",
        "drought"
      ],
      "termInfo": {
        "seasonal flooding": {
          "text": "Recurring high water associated with a basin's annual rainfall, snowmelt, or monsoon cycle.",
          "link": "wiki:Flood"
        },
        "drought": {
          "text": "A prolonged shortage of water relative to normal conditions and human or ecological needs.",
          "link": "wiki:Drought"
        },
        "bank erosion": {
          "text": "The removal of soil or sediment from a riverbank by flowing water, waves, weathering, or mass movement.",
          "link": "wiki:Erosion"
        },
        "water pollution": {
          "text": "Contamination or degradation that makes water harmful to organisms or less suitable for human uses.",
          "link": "wiki:Water pollution"
        }
      },
      "info": {
        "link": "wiki:River engineering"
      }
    },
    {
      "name": "Governance and response",
      "color": "magenta",
      "fact": "Managing a basin requires decisions about infrastructure, land use, emergencies, water allocation, and upstream-downstream effects rather than treating each river reach in isolation.",
      "terms": [
        "dam operation",
        "water-sharing agreement",
        "floodplain zoning",
        "watershed management"
      ],
      "seeds": [
        "dam operation",
        "watershed management"
      ],
      "termInfo": {
        "dam operation": {
          "text": "The rules and decisions used to store and release reservoir water for purposes such as power, water supply, ecology, and flood reduction.",
          "link": "wiki:Dam"
        },
        "water-sharing agreement": {
          "text": "A formal arrangement for allocating, coordinating, or protecting water shared by jurisdictions or countries.",
          "link": "wiki:Water politics"
        },
        "floodplain zoning": {
          "text": "Land-use regulation that limits or conditions development according to flood exposure.",
          "link": "wiki:Flood control"
        },
        "watershed management": {
          "text": "Coordinated stewardship of land, water, ecosystems, and human activities across a drainage area.",
          "link": "wiki:Watershed management"
        }
      },
      "info": {
        "link": "wiki:Integrated water resources management"
      }
    }
  ],
  "bridges": [
    {
      "term": "reservoir",
      "clusters": [
        1,
        3
      ],
      "relationKind": "dynamic",
      "fact": "A reservoir connects river uses with governance because storing and releasing water can provide hydropower, irrigation, navigation support, and water supply while changing downstream flow and habitat.",
      "idealTerms": [
        "hydropower",
        "dam operation"
      ],
      "info": {
        "text": "A natural or artificial body of stored water, often managed through a dam.",
        "link": "wiki:Reservoir"
      }
    },
    {
      "term": "flood control",
      "clusters": [
        2,
        3
      ],
      "relationKind": "dynamic",
      "fact": "Flood control connects basin hazards with public choices through levees, reservoirs, spillways, forecasting, land-use rules, and emergency action.",
      "idealTerms": [
        "seasonal flooding",
        "floodplain zoning"
      ],
      "info": {
        "text": "Measures intended to reduce the likelihood or consequences of damaging floods.",
        "link": "wiki:Flood control"
      }
    },
    {
      "term": "transboundary river",
      "clusters": [
        0,
        3
      ],
      "relationKind": "foundation",
      "fact": "A transboundary river connects the physical basin with governance because water, sediment, ecosystems, and infrastructure effects cross political borders.",
      "idealTerms": [
        null,
        "water-sharing agreement"
      ],
      "info": {
        "text": "A river that crosses or forms a boundary between political jurisdictions, especially sovereign states.",
        "link": "wiki:Transboundary river"
      }
    }
  ]
};
