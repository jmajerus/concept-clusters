// Concept Clusters puzzle: Climate and livelihoods across regions
// Large size: 16 cluster terms + 3 bridge terms = 19 nodes.
// Geography starter puzzle drafted July 2026.

export default {
  "id": "climate-and-livelihoods",
  "title": "Climate and livelihoods across regions",
  "category": "Geography",
  "large": true,
  "info": {
    "text": "Regional patterns emerge from relationships among climate, ecosystems, livelihoods, and human adaptations; no single feature defines an entire region.",
    "link": "wiki:Regional geography"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Compare regional environments and livelihoods with other ways people organize life and resources.",
      "link": "wiki:Regional geography"
    },
    "entries": [
      {
        "id": "ancient-civilizations",
        "via": [
          "water management",
          "land use"
        ],
        "reason": "Examine how water, farming, and settlement supported early societies in particular regional environments."
      },
      {
        "id": "economic-systems",
        "via": [
          "livelihoods",
          "land use"
        ],
        "reason": "Contrast geographically situated livelihoods with systems that organize ownership, exchange, and public provision."
      }
    ]
  },
  "lenses": [
    {
      "id": "mediterranean-dry-summer-landscapes",
      "prompt": "Which concepts on this board combine to characterize Mediterranean dry-summer agro-pastoral landscapes?",
      "targets": [
        "dry-summer climate",
        "sclerophyll vegetation",
        "olive cultivation",
        "terraced farming",
        "irrigation",
        "transhumance"
      ],
      "explanation": "Many Mediterranean landscapes combine dry summers, drought-adapted vegetation, olive cultivation, terraced and irrigated fields, and seasonal livestock movement. These are representative relationships, not a claim that every place or livelihood around the basin is alike.",
      "reasons": {
        "dry-summer climate": "Dry summers and wetter winters create a distinctive seasonal water regime around much of the basin.",
        "sclerophyll vegetation": "Small, hard evergreen leaves help many characteristic plants limit summer water loss.",
        "olive cultivation": "Olive growing has shaped Mediterranean landscapes, economies, and foodways for millennia.",
        "terraced farming": "Terraces make steep slopes cultivable and help manage soil and runoff.",
        "irrigation": "Managed water supplements rainfall during the long dry growing season.",
        "transhumance": "Seasonal movement between pastures is a longstanding part of Mediterranean agro-pastoral landscapes."
      }
    },
    {
      "id": "south-asian-monsoon-rice-landscapes",
      "prompt": "Which concepts on this board combine to characterize monsoon environments and rice-growing landscapes in South Asia?",
      "targets": [
        "seasonal monsoon",
        "monsoon forest",
        "wet-rice agriculture",
        "terraced farming",
        "irrigation"
      ],
      "explanation": "Across parts of South Asia, monsoon seasonality shapes forests and farming calendars, while terraces, irrigation, and other forms of water management support rice cultivation across varied terrain and rainfall conditions. Like Mediterranean farming landscapes, these systems may use terraces and irrigation, but within a very different seasonal rainfall regime.",
      "reasons": {
        "seasonal monsoon": "A strongly seasonal circulation supplies much of the region's annual rainfall.",
        "monsoon forest": "Seasonal tropical forests reflect alternating wet and dry periods associated with monsoon climates.",
        "wet-rice agriculture": "Bundled or flooded fields are a prominent agricultural landscape in South Asian plains and valleys.",
        "terraced farming": "Terraces extend cultivation onto slopes and can retain soil and water.",
        "irrigation": "Irrigation supplements variable rainfall and supports crop timing beyond a single rain event."
      }
    },
    {
      "id": "sahelian-mobile-pastoralism",
      "prompt": "Which concepts combine to characterize mobile livestock livelihoods in the Sahel's semiarid environment?",
      "targets": [
        "variable semiarid rainfall",
        "Sahelian savanna",
        "mobile pastoralism",
        "transhumance",
        "seasonality"
      ],
      "explanation": "In the Sahel, rainfall and pasture vary strongly by season and location. Mobile pastoralism and transhumance allow some herding communities to follow changing water and forage resources across savanna and steppe landscapes.",
      "reasons": {
        "variable semiarid rainfall": "Rain is limited, highly seasonal, and uneven across both years and locations.",
        "Sahelian savanna": "Grass, shrubs, and scattered drought-tolerant trees provide spatially and seasonally changing forage.",
        "mobile pastoralism": "Moving livestock helps herders use resources that are too variable for continuous grazing in one place.",
        "transhumance": "Herds follow recurring seasonal routes between complementary pasture and water sources.",
        "seasonality": "The timing of rain, vegetation growth, and dry periods structures movement and grazing decisions."
      }
    },
    {
      "id": "arctic-tundra-livelihoods",
      "prompt": "Which concepts combine to characterize tundra livelihoods and construction in Arctic permafrost regions?",
      "targets": [
        "permafrost",
        "Arctic tundra",
        "reindeer herding",
        "elevated foundations",
        "seasonality"
      ],
      "explanation": "Across parts of the Arctic, permafrost and tundra shape construction, while extreme seasonality structures ecological cycles and land-based livelihoods such as reindeer herding. Like Sahelian pastoral livelihoods, these systems respond to strong seasonality, but under very different thermal, ecological, and cultural conditions. These practices belong to particular northern peoples and places, not to every Arctic community.",
      "reasons": {
        "permafrost": "Permanently frozen ground affects drainage, vegetation, travel, and the stability of infrastructure.",
        "Arctic tundra": "Treeless tundra vegetation provides the regional ecological setting for many northern land-based activities.",
        "reindeer herding": "Several Indigenous and other northern communities maintain livelihoods and cultures centered on managed reindeer herds.",
        "elevated foundations": "Raising a heated building above frozen ground can reduce heat transfer and allow cold air to circulate underneath.",
        "seasonality": "Large annual changes in light, temperature, snow, and vegetation organize travel, grazing, and other activities."
      }
    },
    {
      "id": "shared-regional-features",
      "prompt": "Which concepts appeared in more than one of the preceding regional profiles?",
      "targets": [
        "terraced farming",
        "irrigation",
        "transhumance",
        "seasonality"
      ],
      "explanation": "These features recur across different regional profiles. Their shared appearance does not make the regions alike; it shows that similar practices or seasonal patterns can arise within different environmental and cultural systems.",
      "reasons": {
        "terraced farming": "Terracing appeared in both the Mediterranean and South Asian profiles.",
        "irrigation": "Managed crop water appeared in both dry-summer Mediterranean and monsoon-linked South Asian farming systems.",
        "transhumance": "Seasonal livestock movement appeared in both Mediterranean and Sahelian agro-pastoral settings.",
        "seasonality": "Strong annual cycles appeared in both Sahelian pastoral life and Arctic ecological and livelihood patterns."
      }
    }
  ],
  "clusters": [
    {
      "name": "Climate and ground conditions",
      "color": "teal",
      "fact": "Regional climate and ground conditions differ in average temperature and precipitation, in when water arrives, how variable it is, and whether the ground remains frozen.",
      "terms": [
        "dry-summer climate",
        "seasonal monsoon",
        "variable semiarid rainfall",
        "permafrost"
      ],
      "seeds": [
        "seasonal monsoon",
        "permafrost"
      ],
      "termInfo": {
        "dry-summer climate": {
          "text": "A climate with dry summers and wetter cool seasons, characteristic of much of the Mediterranean Basin and several comparable regions elsewhere.",
          "link": "wiki:Mediterranean climate"
        },
        "seasonal monsoon": {
          "text": "A seasonal circulation pattern whose shifting winds produce strongly contrasting wet and dry periods.",
          "link": "wiki:Monsoon of South Asia"
        },
        "variable semiarid rainfall": {
          "text": "Limited rainfall concentrated in a short season and varying substantially from year to year and place to place.",
          "link": "wiki:Sahel"
        },
        "permafrost": {
          "text": "Ground that remains at or below freezing for at least two consecutive years.",
          "link": "wiki:Permafrost"
        }
      },
      "info": {
        "link": "wiki:Climate classification"
      }
    },
    {
      "name": "Vegetation and ecosystems",
      "color": "blue",
      "fact": "Vegetation reflects regional combinations of heat, water, soils, disturbance, and seasonality rather than climate alone.",
      "terms": [
        "sclerophyll vegetation",
        "monsoon forest",
        "Sahelian savanna",
        "Arctic tundra"
      ],
      "seeds": [
        "monsoon forest",
        "Arctic tundra"
      ],
      "termInfo": {
        "sclerophyll vegetation": {
          "text": "Evergreen vegetation with small, hard, often thick leaves that reduce water loss during seasonal drought.",
          "link": "wiki:Sclerophyll"
        },
        "monsoon forest": {
          "text": "A seasonal tropical forest in which many trees lose leaves during the dry part of the monsoon cycle.",
          "link": "wiki:Seasonal tropical forest"
        },
        "Sahelian savanna": {
          "text": "The semiarid transition of grasses, shrubs, and drought-tolerant trees between the Sahara and wetter savannas to the south.",
          "link": "wiki:Sahel"
        },
        "Arctic tundra": {
          "text": "A cold, largely treeless biome of low-growing plants across northern continental lands and islands.",
          "link": "wiki:Tundra"
        }
      },
      "info": {
        "link": "wiki:Biome"
      }
    },
    {
      "name": "Livelihoods",
      "color": "amber",
      "fact": "Livelihoods respond to environmental opportunities and constraints, but they are also shaped by culture, history, technology, markets, and political institutions.",
      "terms": [
        "olive cultivation",
        "wet-rice agriculture",
        "mobile pastoralism",
        "reindeer herding"
      ],
      "seeds": [
        "wet-rice agriculture",
        "reindeer herding"
      ],
      "termInfo": {
        "olive cultivation": {
          "text": "The growing of olive trees for fruit and oil, a practice deeply embedded in Mediterranean landscapes and foodways.",
          "link": "wiki:Olive"
        },
        "wet-rice agriculture": {
          "text": "Rice cultivation in bunded, irrigated, rain-fed, or seasonally flooded fields where water is managed around the crop.",
          "link": "wiki:Paddy field"
        },
        "mobile pastoralism": {
          "text": "Livestock keeping in which herds move to make use of changing pasture and water resources.",
          "link": "wiki:Pastoralism"
        },
        "reindeer herding": {
          "text": "The management of semi-domesticated reindeer by several Indigenous and other northern communities across the circumpolar North.",
          "link": "wiki:Reindeer herding"
        }
      },
      "info": {
        "link": "wiki:Livelihood"
      }
    },
    {
      "name": "Adaptations and practices",
      "color": "magenta",
      "fact": "People reshape and move through environments using accumulated knowledge, infrastructure, and institutions—from terraces and irrigation networks to seasonal routes and cold-region engineering.",
      "terms": [
        "terraced farming",
        "irrigation",
        "transhumance",
        "elevated foundations"
      ],
      "seeds": [
        "terraced farming",
        "irrigation"
      ],
      "termInfo": {
        "terraced farming": {
          "text": "Cultivation on level steps constructed across slopes to retain soil, manage runoff, and create workable fields.",
          "link": "wiki:Terrace (earthworks)"
        },
        "irrigation": {
          "text": "The managed application of water to crops through channels, pipes, pumps, reservoirs, or other systems.",
          "link": "wiki:Irrigation"
        },
        "transhumance": {
          "text": "The recurring seasonal movement of livestock between complementary grazing areas.",
          "link": "wiki:Transhumance"
        },
        "elevated foundations": {
          "text": "Building supports that raise a structure above frozen ground so outside air can circulate and reduce heat transfer into permafrost.",
          "link": "wiki:Permafrost"
        }
      },
      "info": {
        "link": "wiki:Human ecology"
      }
    }
  ],
  "bridges": [
    {
      "term": "seasonality",
      "clusters": [
        0,
        1
      ],
      "relationKind": "cross-cutting",
      "fact": "Seasonality links climate and ecosystems because recurring annual changes in rain, temperature, snow, and daylight structure plant growth and ecological activity.",
      "info": {
        "text": "Regular variation over the year in environmental conditions and biological or human activity.",
        "link": "wiki:Seasonality"
      }
    },
    {
      "term": "water management",
      "clusters": [
        0,
        3
      ],
      "relationKind": "dynamic",
      "fact": "Water management connects climate with adaptation by storing, redirecting, draining, or sharing water whose natural supply may be seasonal, scarce, or variable.",
      "idealTerms": [
        null,
        "irrigation"
      ],
      "info": {
        "text": "The planning and operation of systems that allocate, store, move, drain, or protect water.",
        "link": "wiki:Water resource management"
      }
    },
    {
      "term": "land use",
      "clusters": [
        1,
        2,
        3
      ],
      "relationKind": "dynamic",
      "fact": "Land use links ecosystems, livelihoods, and adaptation because farming, grazing, settlement, and infrastructure both depend upon and transform regional landscapes.",
      "info": {
        "text": "The purposes and practices through which people occupy, manage, and transform land.",
        "link": "wiki:Land use"
      }
    }
  ]
};
