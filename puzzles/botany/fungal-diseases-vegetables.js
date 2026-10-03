// Generated from content/puzzles/fungal-diseases-vegetables.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "fungal-diseases-vegetables",
  "title": "Fungal Diseases on Vegetables",
  "category": "botany",
  "subcategories": {
    "botany": "horticulture"
  },
  "info": {
    "text": "Six families of fungal and fungal-like disease strike the vegetable garden in different places and in different ways — foliage, xylem, seedling stems, fruit — and each family's biology dictates its management: dry leaves, clean ground, resistant varieties, gentle handling.",
    "citations": [
      {
        "title": "Alternaria solani",
        "url": "https://en.wikipedia.org/wiki/Alternaria_solani"
      },
      {
        "title": "Erysiphaceae (powdery mildews)",
        "url": "https://en.wikipedia.org/wiki/Erysiphaceae"
      },
      {
        "title": "Downy mildew",
        "url": "https://en.wikipedia.org/wiki/Downy_mildew"
      },
      {
        "title": "Fusarium wilt",
        "url": "https://en.wikipedia.org/wiki/Fusarium_wilt"
      },
      {
        "title": "Verticillium wilt",
        "url": "https://en.wikipedia.org/wiki/Verticillium_wilt"
      },
      {
        "title": "Damping off",
        "url": "https://en.wikipedia.org/wiki/Damping_off"
      },
      {
        "title": "Botrytis cinerea",
        "url": "https://en.wikipedia.org/wiki/Botrytis_cinerea"
      },
      {
        "title": "Corn smut",
        "url": "https://en.wikipedia.org/wiki/Corn_smut"
      },
      {
        "title": "Rust (fungus)",
        "url": "https://en.wikipedia.org/wiki/Rust_(fungus)"
      },
      {
        "title": "List of tomato diseases",
        "url": "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
      },
      {
        "title": "Oomycete",
        "url": "https://en.wikipedia.org/wiki/Oomycete"
      }
    ]
  },
  "clusters": [
    {
      "id": "foliage-blights",
      "name": "Foliage Spotter-Blighters",
      "color": "teal",
      "fact": "Necrotrophs that kill patches of leaf tissue and feed on the dead cells; spores splash from overwintering debris and germinate only on wetted leaves, so dry foliage, airflow, mulch, and end-of-season cleanup starve the epidemic.",
      "terms": [
        "early blight",
        "late blight",
        "Septoria leaf spot",
        "gray leaf spot",
        "anthracnose"
      ],
      "seeds": [
        "early blight",
        "late blight"
      ],
      "termInfo": {
        "early blight": {
          "text": "Alternaria solani (and A. tomatophila), a necrotrophic ascomycete of tomato and potato: brown 'bullseye' lesions up to about 1.3 cm that start on the oldest leaves, plus collar rot on seedlings and fruit spots. Spores germinate only on wetted leaves and overwinter in crop debris; manage with drip irrigation, mulch, airflow, and a 3-year break from solanaceous crops.",
          "links": [
            "https://en.wikipedia.org/wiki/Alternaria_solani"
          ]
        },
        "late blight": {
          "text": "Phytophthora infestans — an oomycete water mold, not a true fungus, and the pathogen of the Irish Great Famine. Sporangia release swimming zoospores in cool, wet weather and epidemics can destroy a crop in days. The name pairs with early blight, but the two organisms live in different kingdoms.",
          "links": [
            "https://en.wikipedia.org/wiki/Oomycete",
            "https://en.wikipedia.org/wiki/Alternaria_solani"
          ]
        },
        "Septoria leaf spot": {
          "text": "Septoria lycopersici on tomato: many small circular spots with dark borders and pale gray centers, beginning on the lowest leaves and moving upward; spreads by splash from infected debris.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        },
        "gray leaf spot": {
          "text": "Stemphylium species on tomato: small brown-gray spots that coalesce, yellow, and defoliate the lower canopy.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        },
        "anthracnose": {
          "text": "Colletotrichum species (chiefly C. coccodes on tomato): sunken, circular, water-soaked craters on ripe fruit — the classic 'ripe rot' that worsens after harvest.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        }
      },
      "info": {
        "text": "Field key: lesion size, shape, and which leaves go first — bullseye rings mean early blight, many tiny bordered spots mean Septoria, sunken fruit craters mean anthracnose.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Alternaria_solani",
            "label": "Early blight (Alternaria solani)"
          },
          {
            "href": "https://en.wikipedia.org/wiki/List_of_tomato_diseases",
            "label": "Tomato disease roster"
          }
        ]
      }
    },
    {
      "id": "mildews",
      "name": "The Two Mildews",
      "color": "blue",
      "fact": "Look-alike names, opposite lives: powdery mildew is a true fungus that whitens leaf surfaces in dry weather with humid air, while downy mildew is an oomycete water mold — yellow angular patches above, grey-purple down below — that runs on cool, wet weather.",
      "terms": [
        "powdery mildew",
        "downy mildew"
      ],
      "seeds": [
        "powdery mildew"
      ],
      "termInfo": {
        "powdery mildew": {
          "text": "Erysiphaceae ascomycetes — obligate biotrophs whose superficial white mycelium and chained conidia coat leaf surfaces. Unlike most fungi they favor dry leaves in still, humid air; each species is highly host-specific (Podosphaera on cucurbits, Leveillula on tomato and pepper).",
          "links": [
            "https://en.wikipedia.org/wiki/Erysiphaceae"
          ]
        },
        "downy mildew": {
          "text": "Peronosporaceae — oomycete water molds and obligate parasites, not true fungi. Angular yellow patches above, grey-purple downy sporulation beneath; cool nights with long dew periods drive outbreaks (cucurbit downy mildew, spinach Peronospora effusa, basil P. belbahrii).",
          "links": [
            "https://en.wikipedia.org/wiki/Downy_mildew",
            "https://en.wikipedia.org/wiki/Erysiphaceae"
          ]
        }
      },
      "info": {
        "text": "Diagnose by leaf side, color, and weather: a white surface coating in dry weather is powdery mildew; angular yellow patches above with grey-purple felt below after cool, wet nights is downy mildew.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Erysiphaceae",
            "label": "Powdery mildews (Erysiphaceae)"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Downy_mildew",
            "label": "Downy mildew"
          }
        ]
      }
    },
    {
      "id": "vascular-wilts",
      "name": "Vascular Wilts",
      "color": "amber",
      "fact": "Soil-borne fungi slip in through roots and live inside the xylem, clogging water flow so the plant wilts far above the cause; resting spores that persist for years make clean ground and resistant varieties the honest levers.",
      "terms": [
        "Fusarium wilt",
        "Verticillium wilt"
      ],
      "seeds": [
        "Fusarium wilt"
      ],
      "termInfo": {
        "Fusarium wilt": {
          "text": "Fusarium oxysporum formae speciales enter through root tips and live in the xylem, clogging vessels until the plant wilts and dies. Chlamydospores persist in soil for years, so resistant varieties — not rotation — are the main control. Warm soils favor it, and symptoms often begin on one side of the plant.",
          "links": [
            "https://en.wikipedia.org/wiki/Fusarium_wilt"
          ]
        },
        "Verticillium wilt": {
          "text": "Verticillium dahliae and V. albo-atrum: one-sided wilting, stunting, and internal vascular browning across 350+ host species. Microsclerotia survive 10–15 years in soil and tolerate cold better than Fusarium; rotation, resistant varieties, and fumigation are the levers.",
          "links": [
            "https://en.wikipedia.org/wiki/Verticillium_wilt"
          ]
        }
      },
      "info": {
        "text": "Cut the stem: internal browning of the water-conducting ring confirms a vascular wilt long before the whole plant collapses.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Fusarium_wilt",
            "label": "Fusarium wilt"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Verticillium_wilt",
            "label": "Verticillium wilt"
          }
        ]
      }
    },
    {
      "id": "seedling-rots",
      "name": "Below-the-Soil-Line Killers",
      "color": "magenta",
      "fact": "In wet, cool soil and dirty media, Pythium, Rhizoctonia, and relatives kill seeds and seedlings at or below the soil line before the crop starts; sterile medium, drainage, and airflow prevent what a spray arrives too late to cure.",
      "terms": [
        "damping-off",
        "southern blight",
        "black root rot"
      ],
      "seeds": [
        "damping-off",
        "southern blight"
      ],
      "termInfo": {
        "damping-off": {
          "text": "The seedling-killing syndrome with several culprits — Pythium and Phytophthora (oomycetes), Rhizoctonia and Fusarium (true fungi) — most prevalent in wet, cool conditions: seeds rot before emergence or seedlings collapse in circular patches at the soil line. Sterile medium, drainage, airflow, and removing dead seedlings prevent it.",
          "links": [
            "https://en.wikipedia.org/wiki/Damping_off"
          ]
        },
        "southern blight": {
          "text": "Sclerotium rolfsii, a soil-borne fungus causing crown and stem rot with white fan-like mycelium and mustard-seed sclerotia; named for its warm-climate range and listed among damping-off organisms.",
          "links": [
            "https://en.wikipedia.org/wiki/Damping_off"
          ]
        },
        "black root rot": {
          "text": "Thielaviopsis basicola: blackened, stunted root systems and weak top growth; one of the damping-off causal organisms and on the tomato disease roster.",
          "links": [
            "https://en.wikipedia.org/wiki/Damping_off"
          ]
        }
      },
      "info": {
        "text": "Prevention lives in the tray: sterile medium, drainage, airflow, and removing collapsed seedlings beat any rescue spray.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Damping_off",
            "label": "Damping off"
          }
        ]
      }
    },
    {
      "id": "fruit-rots",
      "name": "Fruit and Soft-Tissue Rotters",
      "color": "olive",
      "fact": "Wound-entry necrotrophs finish the crop from the greenhouse to the storage shelf, invading bruises, cuts, and dying tissue; ventilation, gentle handling, and culling rotten fruit do more than field sprays.",
      "terms": [
        "gray mold",
        "white mold",
        "Rhizopus rot",
        "sour rot"
      ],
      "seeds": [
        "gray mold",
        "white mold"
      ],
      "termInfo": {
        "gray mold": {
          "text": "Botrytis cinerea, the necrotroph behind 'grey mould': soft rot entering through wounds, dying petals, and senescent tissue of 200+ hosts — greenhouse tomatoes, strawberries, lettuce, beans. Grey velvety conidial masses follow; sclerotia overwinter. Ventilation, spacing, nitrogen discipline, and sanitation are the controls.",
          "links": [
            "https://en.wikipedia.org/wiki/Botrytis_cinerea"
          ]
        },
        "white mold": {
          "text": "Sclerotinia sclerotiorum (and S. minor): water-soaked lesions followed by white fluffy mold and hard black sclerotia that persist in soil; a standard tomato-roster disease and a major problem in beans and lettuce.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        },
        "Rhizopus rot": {
          "text": "Rhizopus stolonifer — the black bread mold — mushy soft rot of wounded fruit, sprouting whiskery stalks tipped with black sporangia; on the tomato fungal roster and a classic transit and storage rot.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        },
        "sour rot": {
          "text": "Geotrichum candidum: yeasty, dripping sour rot of overripe or wounded fruit with a vinegar smell; on the tomato fungal roster.",
          "links": [
            "https://en.wikipedia.org/wiki/List_of_tomato_diseases"
          ]
        }
      },
      "info": {
        "text": "Rots follow wounds and dying tissue from greenhouse to shelf — handling, ventilation, and culling are the controls.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Botrytis_cinerea",
            "label": "Gray mold (Botrytis cinerea)"
          },
          {
            "href": "https://en.wikipedia.org/wiki/List_of_tomato_diseases",
            "label": "Tomato disease roster"
          }
        ]
      }
    },
    {
      "id": "rusts-smuts",
      "name": "Rusts and Smuts",
      "color": "brown",
      "fact": "Obligate biotrophs that keep the host alive while massing spores — rust pustules, smut galls — and stay tightly host-specific; resistant varieties and clearing debris do the work no common fungicide finishes.",
      "terms": [
        "corn smut",
        "bean rust",
        "common corn rust"
      ],
      "seeds": [
        "corn smut",
        "bean rust"
      ],
      "termInfo": {
        "corn smut": {
          "text": "Ustilago maydis (now Mycosarcoma maydis), a basidiomycete biotroph: silvery galls on any above-ground corn part that burst to release blackish teliospores, which overwinter in soil and debris. No common fungicide controls it — rotate, avoid wounding, and plant resistant cultivars. Immature galls are the Mexican delicacy huitlacoche.",
          "links": [
            "https://en.wikipedia.org/wiki/Corn_smut"
          ]
        },
        "bean rust": {
          "text": "Uromyces appendiculatus on common bean: cinnamon-brown rust pustules powdering the leaves; an obligate biotroph that cannot complete its life without living host tissue.",
          "links": [
            "https://en.wikipedia.org/wiki/Rust_(fungus)"
          ]
        },
        "common corn rust": {
          "text": "Puccinia sorghi on corn: cinnamon-orange pustules mostly on leaves; an obligate, host-specific biotroph — rotation works because the rust dies without its living host.",
          "links": [
            "https://en.wikipedia.org/wiki/Rust_(fungus)"
          ]
        }
      },
      "info": {
        "text": "Look for massed colored spores: rust pustules powder leaves; smut galls swell and split. Both keep the host alive while they feed.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Rust_(fungus)",
            "label": "Rust fungi (Pucciniales)"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Corn_smut",
            "label": "Corn smut"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "free-water-windows",
      "term": "free water",
      "clusters": [
        0,
        1,
        3
      ],
      "fact": "Free water sorts these diseases: early blight spores cannot infect a perfectly dry leaf, downy mildew spreads through long dew periods, and Pythium zoospores swim through wet soil — while powdery mildew alone prefers dry leaves in still, humid air.",
      "info": {
        "text": "Oomycetes swim in free water as zoospores; many true fungi germinate only after a leaf is wetted — moisture timing picks the disease.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Oomycete",
            "label": "Oomycete zoospores"
          }
        ]
      },
      "relationKind": "cross-cutting"
    },
    {
      "id": "resting-spores",
      "term": "resting spores",
      "clusters": [
        2,
        3
      ],
      "fact": "Thick-walled resting spores wait years in bare ground — Fusarium chlamydospores and Verticillium microsclerotia for a decade or more — and the same soil longevity keeps seedling beds and media risky long after a sick crop is gone, which is why rotation alone rarely cures wilt ground.",
      "info": {
        "text": "Documented survival: Verticillium microsclerotia 10–15 years; Fusarium is most commonly recovered from soil as chlamydospores.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Verticillium_wilt",
            "label": "Verticillium microsclerotia"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Fusarium_wilt",
            "label": "Fusarium chlamydospores"
          }
        ]
      },
      "relationKind": "continuity"
    },
    {
      "id": "obligate-biotrophs",
      "term": "obligate biotrophs",
      "clusters": [
        1,
        5
      ],
      "fact": "Powdery mildews, rusts, and smuts all need living tissue — haustoria feeding inside alive cells — and each specializes on narrow hosts and races, so breeding resistant varieties outlasts any spray.",
      "info": {
        "text": "Obligate biotrophs feed through haustoria inside living cells and many cannot be grown in culture at all.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Rust_(fungus)",
            "label": "Rusts as obligate biotrophs"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Erysiphaceae",
            "label": "Powdery mildews as obligate biotrophs"
          }
        ]
      },
      "relationKind": "continuity"
    },
    {
      "id": "sanitation",
      "term": "sanitation",
      "clusters": [
        0,
        4
      ],
      "fact": "One cleanup breaks two cycles: spotter-blighters overwinter as spores in crop debris, while gray mold sclerotia and Rhizopus ride dying tissue, wounds, and culls — so removing debris and discarding rotten fruit starves next season's inoculum.",
      "info": {
        "text": "Early blight overwinters in crop residues; gray mold survives as sclerotia and mycelium on dead tissue — fall cleanup removes both inoculum sources at once.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Alternaria_solani",
            "label": "Debris cleanup for early blight"
          },
          {
            "href": "https://en.wikipedia.org/wiki/Botrytis_cinerea",
            "label": "Sanitation against gray mold"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "water-molds-among-us",
      "prompt": "Two of the leaf diseases on this board are caused by water molds rather than true fungi — which pair?",
      "explanation": "Late blight is Phytophthora infestans and downy mildew is a Peronosporaceae oomycete — both water molds, closer to brown algae than to mushrooms. Their fungal-looking foliage peers (early blight, Septoria, powdery mildew) are true fungi. Damping-off's Pythium is also an oomycete, but it strikes seedlings below the soil line, not leaves.",
      "targets": [
        "late blight",
        "downy mildew"
      ],
      "reasons": {
        "late blight": "Phytophthora infestans is an oomycete — cellulose walls, diploid vegetative nuclei, swimming zoospores.",
        "downy mildew": "Peronosporaceae are obligate oomycete parasites with zoosporic relatives; 'mildew' is a look, not a kinship."
      }
    },
    {
      "id": "misleading-names",
      "prompt": "Which pair of diseases shows that common names can mislead — the 'early' one typically starting on a plant's oldest leaves, the 'late' one famous for sudden cool-wet epidemics?",
      "explanation": "Despite its name, early blight (Alternaria solani) usually appears first on older, lower leaves; late blight (Phytophthora infestans) earns its name from season-ending cool-wet outbreaks. The names suggest a pair, but the organisms even belong to different kingdoms.",
      "targets": [
        "early blight",
        "late blight"
      ]
    },
    {
      "id": "cool-wet-diagnosis",
      "prompt": "After a week of cool, wet nights, a cucurbit leaf shows angular yellow patches on top and a grey-purple felt beneath. Which mildew is this?",
      "explanation": "Downy mildews (Peronosporaceae oomycetes) sporulate on the leaf underside during cool, wet weather; powdery mildew (a true ascomycete) makes a white surface coating in dry weather with humid, still air. Angular, vein-bounded patches above with felt below is the downy signature.",
      "targets": [
        "downy mildew"
      ]
    },
    {
      "id": "xylem-hijackers",
      "prompt": "A tomato wilts on one side, and the cut stem shows brown streaks in the water-conducting ring. Which of the two wilts survives a decade or more in soil as microsclerotia?",
      "explanation": "Verticillium dahliae forms microsclerotia documented viable for 10–15 years and tolerates cool soils; Fusarium wilt persists as chlamydospores but favors warm soils. Both hijack the xylem — the browned ring is the giveaway that the cause is underground.",
      "targets": [
        "Verticillium wilt"
      ]
    },
    {
      "id": "seed-tray-collapse",
      "prompt": "Seedlings fall over in circular patches in a cold, wet tray. Which disease strikes before the crop even starts?",
      "explanation": "Damping-off kills germinating seeds and young seedlings at or below the soil line in wet, cool conditions — a syndrome caused by Pythium, Phytophthora, Rhizoctonia, and Fusarium. Black root rot and southern blight strike older plants' roots and crowns; sterile medium and drainage prevent this one.",
      "targets": [
        "damping-off"
      ]
    },
    {
      "id": "wound-followers",
      "prompt": "Strawberries and greenhouse tomatoes turn grey and velvety where petals died or fruit was bruised. Which rot is this?",
      "explanation": "Botrytis cinerea, grey mould, is a necrotroph that needs wounds or dying tissue; its sclerotia overwinter and humid, still air finishes the crop. Rhizopus rot also enters wounds but shows whiskery black sporangia; sour rot smells of vinegar; white mold makes white fluff with hard black sclerotia.",
      "targets": [
        "gray mold"
      ]
    },
    {
      "id": "bread-mold-whiskers",
      "prompt": "Which of these storage rots is caused by the black bread mold, sprouting whisker-like stalks tipped with black sporangia on wounded fruit?",
      "explanation": "Rhizopus stolonifer raises coarse stalks bearing black sporangia on soft, mushy fruit. Gray mold is grey and velvety, sour rot is yeasty and dripping, and white mold produces white fluff with sclerotia.",
      "targets": [
        "Rhizopus rot"
      ]
    },
    {
      "id": "living-hosts-only",
      "prompt": "Which five diseases on this board are caused by obligate biotrophs — pathogens that cannot complete their lives without living host tissue?",
      "explanation": "Mildews, rusts, and smuts farm living tissue through haustoria and specialize on narrow hosts and races, which is why resistant varieties are the durable control. The blights, spots, and rots are killers-and-feeders instead; late blight comes closest to the biotroph habit but is a hemibiotroph that eventually kills what it feeds on.",
      "targets": [
        "powdery mildew",
        "downy mildew",
        "bean rust",
        "common corn rust",
        "corn smut"
      ],
      "reasons": {
        "powdery mildew": "Erysiphaceae are obligate biotrophs with haustoria inside living cells.",
        "downy mildew": "Peronosporaceae are obligate parasites of living plants.",
        "bean rust": "Uromyces appendiculatus cannot live without living bean tissue.",
        "common corn rust": "Puccinia sorghi dies without its living host, which is why rotation works.",
        "corn smut": "Ustilago maydis is a biotrophic basidiomycete keeping kernels alive as galls."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Reading a Sick Vegetable Plant",
    "summary": "One page on why the place a disease strikes — leaves, water pipes, seedling stems, fruit — reveals both its identity and its cure.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "A fungal disease rarely announces its name. It announces its address. Where a plant fails — on the leaves, inside the water-conducting stem tissue, at the seedling's soil line, or in the fruit — is the single best clue to which disease family is at work, because each family lives a different kind of life.\n\nThree lessons in pathogen biology organize almost everything. First, most foliar killers cannot start without water: their spores sit on a leaf until it is wetted, then germinate — which is why drip irrigation, morning watering, spacing for airflow, and mulch prevent more disease than any spray. Second, some pathogens hide where you cannot see them: wilt fungi slip in through roots and live inside the xylem, the plant's water pipes, so the visible symptom sits far from the cause, and thick-walled resting spores can wait a decade or more in bare ground. Third, a few pathogens refuse to kill: the biotrophs — mildews, rusts, smuts — keep their host alive and farm it, so tightly host-specific that breeding resistant varieties outlasts every fungicide.\n\nOne caution runs under the whole subject: 'fungal' is a habit of speech as much as a claim of kinship. The water molds — late blight, downy mildew, Pythium seedling rot — look and behave like fungi and are managed alongside them, but they belong to a different branch of life entirely, closer to brown algae than to mushrooms. Knowing which kingdom the enemy lives in matters, because it changes which fungicide classes work at all.\n\nLearn the addresses and the behaviors, and the management follows: keep leaves dry for the splash-borne blights, outlast the soil-persisters with clean ground and resistance, breed for the biotrophs, and handle gently against the rots that enter by wound."
    },
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Oomycete",
        "label": "Oomycetes: the water molds"
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
  },
  "dateCreated": "2026-10-02",
  "dateModified": "2026-10-02"
});
