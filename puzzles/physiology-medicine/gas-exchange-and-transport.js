// Generated from content/puzzles/gas-exchange-and-transport.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "gas-exchange-and-transport",
  "title": "Gas exchange and transport",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "respiratory"
  },
  "info": {
    "text": "Oxygen crosses from the alveoli into the blood by diffusion, and how much reaches the arteries depends on how well air and blood are matched across the lung. Hemoglobin carries the oxygen to the tissues and releases it there; carbon dioxide makes the return trip mostly as bicarbonate, and each gas's carriage shifts the other's.",
    "links": [
      {
        "href": "wiki:Gas exchange"
      }
    ],
    "citations": [
      {
        "title": "West's Respiratory Physiology: The Essentials, 11th ed., chs. 3–6 (diffusion, blood flow, ventilation–perfusion relationships, and gas transport by the blood)",
        "author": "John B. West and Andrew M. Luks",
        "publisher": "Wolters Kluwer",
        "year": "2020",
        "url": "https://shop.lww.com/West-s-Respiratory-Physiology/p/9781975139186"
      },
      {
        "title": "Ventilation/perfusion ratio",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Ventilation/perfusion_ratio"
      },
      {
        "title": "Oxygen–hemoglobin dissociation curve",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Oxygen%E2%80%93hemoglobin_dissociation_curve"
      }
    ]
  },
  "clusters": [
    {
      "id": "diffusion",
      "name": "Diffusion",
      "color": "teal",
      "fact": "Oxygen and carbon dioxide cross the thin wall between alveolus and capillary by passive diffusion. At rest, blood takes up its full load of oxygen within the first third of its time in the capillary.",
      "terms": [
        "Fick's law",
        "blood–gas barrier",
        "capillary transit time",
        "perfusion limitation",
        "diffusion limitation"
      ],
      "seeds": [
        "Fick's law",
        "blood–gas barrier"
      ],
      "termInfo": {
        "Fick's law": {
          "text": "The rate at which a gas diffuses through a sheet of tissue rises with its area and the partial-pressure difference across it, and falls with its thickness.",
          "links": [
            {
              "href": "wiki:Fick's laws of diffusion"
            }
          ]
        },
        "blood–gas barrier": {
          "text": "The alveolar wall, capillary wall, and the thin layer between them: less than half a micrometer thick in places, spread over 50 to 100 square meters.",
          "links": [
            {
              "href": "wiki:Blood–air barrier"
            }
          ]
        },
        "capillary transit time": "The time a red cell spends in a pulmonary capillary, about three-quarters of a second at rest and shorter in heavy exercise.",
        "diffusion limitation": "Gas transfer limited by the barrier itself, because blood leaves the capillary before equilibrating. Oxygen uptake becomes diffusion-limited when the barrier thickens or in exercise at high altitude.",
        "perfusion limitation": "The counterpart of diffusion limitation: the gas finishes crossing the barrier early in the capillary, so only more blood flow can raise its transfer. Oxygen uptake is normally perfusion-limited."
      }
    },
    {
      "id": "matching",
      "name": "Matching air to blood",
      "color": "blue",
      "fact": "Each part of the lung must receive air and blood in proportion. Gravity, disease, and a local reflex all affect that balance, and wherever it fails, arterial oxygen falls.",
      "terms": [
        "V/Q mismatch",
        "shunt",
        "hypoxic pulmonary vasoconstriction",
        "West zones"
      ],
      "seeds": [
        "V/Q mismatch",
        "shunt"
      ],
      "termInfo": {
        "V/Q mismatch": "Imbalance between ventilation (V) and blood flow (Q) in parts of the lung: units with too little air pass on poorly oxygenated blood, and units with too little blood waste their air.",
        "West zones": {
          "text": "Three regions of the upright lung in which the relative sizes of pulmonary arterial, alveolar, and venous pressure set how much blood flows; flow rises from apex to base.",
          "links": [
            {
              "href": "wiki:Zones of the lung"
            }
          ]
        },
        "hypoxic pulmonary vasoconstriction": {
          "text": "Constriction of small pulmonary arteries where alveolar oxygen is low, diverting blood toward better-ventilated regions.",
          "links": [
            {
              "href": "wiki:Hypoxic pulmonary vasoconstriction"
            }
          ]
        },
        "shunt": {
          "text": "Blood that reaches the arterial side without passing any ventilated alveolus, the extreme case of a low ventilation-to-blood-flow ratio.",
          "links": [
            {
              "href": "wiki:Pulmonary shunt"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Ventilation/perfusion ratio"
          }
        ]
      }
    },
    {
      "id": "oxygen-carriage",
      "name": "Oxygen carriage",
      "color": "amber",
      "fact": "Nearly all oxygen in blood rides on hemoglobin. Its S-shaped binding curve loads oxygen almost fully in the lungs and releases it over the steep middle range where tissues work.",
      "terms": [
        "hemoglobin",
        "oxygen–hemoglobin dissociation curve",
        "P₅₀",
        "2,3-BPG",
        "fetal hemoglobin"
      ],
      "seeds": [
        "hemoglobin",
        "oxygen–hemoglobin dissociation curve"
      ],
      "termInfo": {
        "2,3-BPG": {
          "text": "2,3-Bisphosphoglycerate, made by red cells; it lowers hemoglobin's oxygen affinity, and its level rises in chronic hypoxia, at altitude, and in anemia.",
          "links": [
            {
              "href": "wiki:2,3-Bisphosphoglyceric acid"
            }
          ]
        },
        "P₅₀": {
          "text": "The oxygen pressure at which hemoglobin is half saturated, about 27 mmHg in adult blood; a higher value means lower affinity.",
          "links": [
            {
              "href": "wiki:P50 (pressure)"
            }
          ]
        },
        "fetal hemoglobin": {
          "text": "The hemoglobin of the fetus, which binds 2,3-BPG weakly and so holds oxygen more tightly than adult hemoglobin.",
          "links": [
            {
              "href": "wiki:Fetal hemoglobin"
            }
          ]
        },
        "hemoglobin": {
          "text": "The protein in red cells whose four binding sites each carry one oxygen molecule; binding at one site makes binding at the others easier.",
          "links": [
            {
              "href": "wiki:Hemoglobin"
            }
          ]
        },
        "oxygen–hemoglobin dissociation curve": {
          "text": "The S-shaped plot of hemoglobin saturation against oxygen pressure: flat at the top, steep in the middle.",
          "links": [
            {
              "href": "wiki:Oxygen–hemoglobin dissociation curve"
            }
          ]
        }
      }
    },
    {
      "id": "co2-carriage",
      "name": "Carbon dioxide carriage",
      "color": "magenta",
      "fact": "Most carbon dioxide travels in blood as bicarbonate formed inside red cells; smaller shares ride on proteins or dissolve in plasma. In the lungs each step runs in reverse.",
      "terms": [
        "bicarbonate",
        "carbonic anhydrase",
        "chloride shift",
        "carbamino compounds"
      ],
      "seeds": [
        "bicarbonate",
        "carbonic anhydrase"
      ],
      "termInfo": {
        "bicarbonate": {
          "text": "The ion that carries most of the blood's carbon dioxide, formed in red cells and carried mainly in plasma.",
          "links": [
            {
              "href": "wiki:Bicarbonate"
            }
          ]
        },
        "carbamino compounds": {
          "text": "Carbon dioxide bound directly to the amino groups of proteins, chiefly the globin of hemoglobin.",
          "links": [
            {
              "href": "wiki:Carbaminohemoglobin"
            }
          ]
        },
        "carbonic anhydrase": {
          "text": "The red-cell enzyme that speeds the reaction of carbon dioxide with water to form carbonic acid, which dissociates into hydrogen ions and bicarbonate.",
          "links": [
            {
              "href": "wiki:Carbonic anhydrase"
            }
          ]
        },
        "chloride shift": {
          "text": "The exchange of bicarbonate leaving the red cell for chloride entering it, which keeps bicarbonate formation going.",
          "links": [
            {
              "href": "wiki:Chloride shift"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "a-a-gradient",
      "term": "A–a gradient",
      "clusters": [
        0,
        1
      ],
      "fact": "The gap between alveolar and arterial oxygen pressure widens when diffusion is limited and when air and blood are mismatched, including shunt; hypoventilation and thin air lower both pressures together and leave it normal.",
      "info": {
        "text": "Alveolar minus arterial oxygen pressure; in a young adult it is normally under about 15 mmHg.",
        "links": [
          {
            "href": "wiki:Alveolar–arterial gradient"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "diffusion limitation",
        "V/Q mismatch"
      ]
    },
    {
      "id": "carbon-monoxide",
      "term": "carbon monoxide",
      "clusters": [
        0,
        2
      ],
      "fact": "Hemoglobin binds carbon monoxide about 240 times as avidly as oxygen, so its partial pressure in blood stays near zero and its uptake is limited only by the barrier; that makes it the test gas for diffusing capacity. The same binding displaces oxygen and shifts the curve to the left.",
      "info": {
        "text": "A gas whose uptake measures the lung's diffusing capacity, and which in larger amounts blocks oxygen carriage.",
        "links": [
          {
            "href": "wiki:Diffusing capacity for carbon monoxide"
          },
          {
            "href": "wiki:Carbon monoxide poisoning"
          }
        ]
      },
      "idealTerms": [
        "diffusion limitation",
        "hemoglobin"
      ]
    },
    {
      "id": "supplemental-oxygen",
      "term": "supplemental oxygen",
      "clusters": [
        1,
        2
      ],
      "fact": "Breathing extra oxygen corrects the low arterial oxygen of V/Q mismatch but helps a shunt little: shunted blood never meets the added oxygen, and blood from well-ventilated alveoli is already on the flat top of the dissociation curve.",
      "info": {
        "text": "Inspired air enriched with oxygen, whose effect on arterial oxygen distinguishes shunt from V/Q mismatch.",
        "links": [
          {
            "href": "wiki:Oxygen therapy"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "shunt",
        "oxygen–hemoglobin dissociation curve"
      ]
    },
    {
      "id": "bohr-effect",
      "term": "Bohr effect",
      "clusters": [
        3,
        2
      ],
      "fact": "Carbon dioxide and hydrogen ions lower hemoglobin's affinity for oxygen and shift the dissociation curve to the right, so oxygen is released most readily in active tissues, where carbon dioxide is high.",
      "info": {
        "text": "The fall in hemoglobin's oxygen affinity caused by carbon dioxide and acid.",
        "links": [
          {
            "href": "wiki:Bohr effect"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "oxygen–hemoglobin dissociation curve"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "haldane-effect",
      "term": "Haldane effect",
      "clusters": [
        2,
        3
      ],
      "fact": "Hemoglobin that has released its oxygen binds more carbon dioxide and hydrogen ions, so blood takes up carbon dioxide readily in the tissues and gives it up in the lungs as it is oxygenated.",
      "info": {
        "text": "The rise in blood's carbon dioxide capacity when hemoglobin is deoxygenated.",
        "links": [
          {
            "href": "wiki:Haldane effect"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "hemoglobin",
        "carbamino compounds"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "right-shift",
      "prompt": "What shifts the oxygen–hemoglobin dissociation curve to the right?",
      "explanation": "A right shift raises the P₅₀: hemoglobin holds oxygen less tightly and releases more of it to the tissues. A rise in temperature has the same effect.",
      "targets": [
        "Bohr effect",
        "2,3-BPG"
      ],
      "reasons": {
        "2,3-BPG": "It binds deoxygenated hemoglobin and stabilizes its low-affinity form.",
        "Bohr effect": "Carbon dioxide and hydrogen ions lower hemoglobin's oxygen affinity."
      }
    },
    {
      "id": "higher-affinity",
      "prompt": "What raises hemoglobin's affinity for oxygen?",
      "explanation": "Higher affinity shifts the curve to the left and lowers the P₅₀. For the fetus that is an advantage, drawing oxygen across the placenta; with carbon monoxide it compounds the harm, since the oxygen still carried is released less readily.",
      "targets": [
        "fetal hemoglobin",
        "carbon monoxide"
      ],
      "reasons": {
        "carbon monoxide": "Bound to some sites, it makes the remaining sites hold their oxygen more tightly.",
        "fetal hemoglobin": "It binds 2,3-BPG weakly, so its curve lies to the left of the adult curve."
      }
    },
    {
      "id": "bicarbonate-formation",
      "prompt": "What keeps red cells converting carbon dioxide to bicarbonate in the tissues?",
      "explanation": "Removing both products, bicarbonate to the plasma and hydrogen ions to hemoglobin, keeps the reaction running. Carbamino compounds are a separate route that bypasses bicarbonate.",
      "targets": [
        "carbonic anhydrase",
        "chloride shift",
        "hemoglobin",
        "Haldane effect"
      ],
      "reasons": {
        "Haldane effect": "Hemoglobin that has released its oxygen takes up hydrogen ions more readily, so the buffering is strongest in the tissues.",
        "carbonic anhydrase": "It catalyzes the reaction of carbon dioxide with water, which is slow without it.",
        "chloride shift": "It moves bicarbonate out of the cell as it forms, so the product does not build up.",
        "hemoglobin": "It takes up the hydrogen ions the reaction releases."
      }
    },
    {
      "id": "aa-measure",
      "prompt": "Which measure tells hypoventilation apart from a gas-exchange defect as the cause of low arterial oxygen?",
      "explanation": "Arterial oxygen alone cannot say where the problem lies. Comparing it with the alveolar value shows whether oxygen is being lost between alveolus and artery.",
      "targets": [
        "A–a gradient"
      ],
      "reasons": {
        "A–a gradient": "Hypoventilation lowers alveolar and arterial oxygen together and leaves it normal; a gas-exchange defect widens it."
      }
    },
    {
      "id": "widened-gradient",
      "prompt": "Which causes of low arterial oxygen widen the A–a gradient?",
      "explanation": "Hypoventilation and the thin air of high altitude lower alveolar oxygen first, so arterial oxygen falls with it and the gradient stays normal. Carbon monoxide lowers the oxygen content of blood while leaving arterial oxygen pressure normal.",
      "targets": [
        "diffusion limitation",
        "shunt",
        "V/Q mismatch"
      ],
      "reasons": {
        "V/Q mismatch": "Poorly ventilated units pass on blood with low oxygen, and well-ventilated units cannot make up for it.",
        "diffusion limitation": "Blood leaves the capillary before its oxygen reaches the alveolar level.",
        "shunt": "Blood bypasses ventilated alveoli entirely and mixes into arterial blood."
      }
    },
    {
      "id": "shunt-test",
      "prompt": "Which intervention's effect separates a shunt from V/Q mismatch?",
      "explanation": "Shunted blood never meets the added oxygen, and blood from well-ventilated alveoli is already on the flat top of the dissociation curve, so a shunt resists correction.",
      "targets": [
        "supplemental oxygen"
      ],
      "reasons": {
        "supplemental oxygen": "It raises arterial oxygen in V/Q mismatch but barely changes it in a large shunt."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From alveolus to tissue",
    "summary": "How oxygen crosses into the blood, why air and blood must be matched across the lung, how hemoglobin carries and releases oxygen, and how carbon dioxide returns.",
    "estimatedMinutes": 9,
    "content": {
      "mediaType": "text/markdown",
      "text": "A breath that reaches the alveoli has done only part of the work of respiration. Oxygen still has to cross into the blood, the blood has to flow past the alveoli that are receiving air, and the oxygen has to be carried to the tissues and released there. Carbon dioxide makes the same journey in reverse.\r\n\r\nThe aim of this lesson is to let you follow oxygen from the alveolus to the tissues, and carbon dioxide back, and to explain why arterial oxygen falls when a step fails.\r\n\r\n## Diffusion\r\n\r\nOxygen and carbon dioxide cross the lung by passive diffusion. By **Fick's law**, the rate at which a gas crosses a sheet of tissue rises with the sheet's area and the partial-pressure difference across it, and falls with its thickness. The **blood–gas barrier** suits this: less than half a micrometer thick in places, and spread over 50 to 100 square meters.\r\n\r\nA red cell spends about three-quarters of a second in a pulmonary capillary at rest, its **capillary transit time**, and its oxygen normally reaches the alveolar level within the first third of that time. Oxygen uptake is therefore normally under **perfusion limitation**: it is set by how much blood flows past, because each portion of blood equilibrates long before it leaves. When the barrier thickens, as in pulmonary fibrosis, or when exercise at high altitude shortens the transit time while the driving pressure is low, the blood may leave before it equilibrates, and oxygen transfer falls under **diffusion limitation**.\r\n\r\n**Carbon monoxide** shows diffusion limitation in its purest form. Hemoglobin binds it about 240 times as avidly as oxygen, so its partial pressure in the blood stays near zero and its uptake is limited only by the barrier. Breathing a small, safe concentration of it is the standard way to measure the lung's diffusing capacity.\r\n\r\n## Matching air to blood\r\n\r\nDiffusion works only where air and blood meet in proportion. In a region with **V/Q mismatch**, ventilation (V) and blood flow (Q) are out of balance: units with too little air pass on poorly oxygenated blood, and units with too little blood waste their air. A **shunt** is the extreme case, blood that reaches the arterial side without passing any ventilated alveolus at all.\r\n\r\nThe lung limits mismatch with **hypoxic pulmonary vasoconstriction**: small pulmonary arteries constrict where alveolar oxygen is low, diverting blood toward better-ventilated regions. When hypoxia is widespread, as at high altitude, the same response constricts vessels throughout the lung and raises pulmonary arterial pressure.\r\n\r\nGravity creates some mismatch even in healthy lungs. In an upright person, blood flow rises steeply from apex to base, and the **West zones** describe how pulmonary arterial, alveolar, and venous pressures govern that flow at each level. Ventilation also rises toward the base, but less steeply, so the ratio of ventilation to blood flow is highest at the apex and lowest at the base.\r\n\r\nThe **A–a gradient**, the difference between alveolar and arterial oxygen pressure, measures how well these steps are working; in a young adult it is under about 15 mmHg. Diffusion limitation, shunt, and V/Q mismatch all widen it. Hypoventilation and thin air lower arterial oxygen too, but they lower alveolar oxygen equally, so the gradient stays normal.\r\n\r\n## Oxygen carriage\r\n\r\nLittle oxygen dissolves in plasma; nearly all of it rides on **hemoglobin**, whose four binding sites each hold one oxygen molecule. Binding at one site makes binding at the others easier, which gives the **oxygen–hemoglobin dissociation curve** its S shape. Its flat top keeps arterial blood nearly saturated even if alveolar oxygen falls somewhat; its steep middle lets tissues draw off large amounts of oxygen for a small fall in pressure. The **P₅₀**, the oxygen pressure at which hemoglobin is half saturated, about 27 mmHg, marks where the curve sits.\r\n\r\nThe flat top also explains why **supplemental oxygen** corrects V/Q mismatch but helps a shunt very little. Raising inspired oxygen lifts the oxygen in poorly ventilated units, but shunted blood never meets that oxygen, and blood from well-ventilated units is already nearly saturated and can take up little more.\r\n\r\nSeveral factors move the curve. **2,3-BPG**, made by red cells, lowers hemoglobin's oxygen affinity and shifts the curve to the right; its level rises in chronic hypoxia, at altitude, and in anemia. **Fetal hemoglobin** binds 2,3-BPG weakly, so its affinity is higher and its curve lies to the left, letting the fetus draw oxygen from the mother's blood. Carbon monoxide both occupies binding sites and shifts the curve of the remaining sites to the left, so the oxygen still carried is released less readily.\r\n\r\n## Carbon dioxide carriage\r\n\r\nCarbon dioxide travels three ways: dissolved in plasma, bound to proteins as **carbamino compounds**, chiefly on hemoglobin, and, above all, as **bicarbonate**. Inside red cells, **carbonic anhydrase** speeds the reaction of carbon dioxide with water to form carbonic acid, which dissociates into hydrogen ions and bicarbonate. The bicarbonate leaves the cell in exchange for chloride, the **chloride shift**, while hemoglobin takes up the hydrogen ions. In the lungs every step runs in reverse.\r\n\r\n## Each gas eases the other's transport\r\n\r\nThe two transport systems are coupled. In the **Bohr effect**, carbon dioxide and hydrogen ions lower hemoglobin's affinity for oxygen and shift the curve to the right, so oxygen is released most readily in active tissues, where carbon dioxide is high. In the **Haldane effect**, hemoglobin that has released its oxygen binds more carbon dioxide and hydrogen ions, so blood takes up carbon dioxide readily in the tissues and gives it up in the lungs as it is oxygenated.\r\n\r\n## Further reading\r\n\r\nThe standard concise account is in John B. West and Andrew M. Luks, *West's Respiratory Physiology: The Essentials*, chapters 3 through 6, which cover diffusion, blood flow, ventilation–perfusion relationships, and gas transport by the blood."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "gas-exchange-and-transport",
      "puzzleRevision": "fnv1a32:703ddb1b",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Fick's law": {
          "x": 238.58,
          "y": 51.06
        },
        "term:blood–gas barrier": {
          "x": 382.45,
          "y": 35.03
        },
        "term:capillary transit time": {
          "x": 302.85,
          "y": 183.74
        },
        "term:perfusion limitation": {
          "x": 215.46,
          "y": 115.87
        },
        "term:diffusion limitation": {
          "x": 561.35,
          "y": 35.03
        },
        "term:V/Q mismatch": {
          "x": 816.02,
          "y": 32.02
        },
        "term:shunt": {
          "x": 889.18,
          "y": 231.86
        },
        "term:hypoxic pulmonary vasoconstriction": {
          "x": 722.58,
          "y": 293.61
        },
        "term:West zones": {
          "x": 717.35,
          "y": 213.72
        },
        "term:hemoglobin": {
          "x": 524.38,
          "y": 357.44
        },
        "term:oxygen–hemoglobin dissociation curve": {
          "x": 576.29,
          "y": 584.97
        },
        "term:P₅₀": {
          "x": 671.35,
          "y": 523.75
        },
        "term:2,3-BPG": {
          "x": 761.01,
          "y": 491.88
        },
        "term:fetal hemoglobin": {
          "x": 766.84,
          "y": 403.18
        },
        "term:bicarbonate": {
          "x": 116.42,
          "y": 515.44
        },
        "term:carbonic anhydrase": {
          "x": 89.73,
          "y": 369.53
        },
        "term:chloride shift": {
          "x": 206.13,
          "y": 287.11
        },
        "term:carbamino compounds": {
          "x": 335.79,
          "y": 366.04
        },
        "term:A–a gradient": {
          "x": 645.56,
          "y": 148.41
        },
        "term:carbon monoxide": {
          "x": 454.83,
          "y": 237.43
        },
        "term:supplemental oxygen": {
          "x": 835.54,
          "y": 583.97
        },
        "term:Bohr effect": {
          "x": 336.23,
          "y": 583.97
        },
        "term:Haldane effect": {
          "x": 424.44,
          "y": 478.89
        },
        "cluster:0": {
          "x": 439.97,
          "y": 110.86
        },
        "cluster:1": {
          "x": 863.83,
          "y": 149.19
        },
        "cluster:2": {
          "x": 639.89,
          "y": 464.64
        },
        "cluster:3": {
          "x": 209.65,
          "y": 433.39
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-10T03:42:37.665Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "gas-exchange-and-transport",
      "puzzleRevision": "fnv1a32:703ddb1b",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 598.53,
          "y": 500.02,
          "pinned": true
        },
        "cluster:1": {
          "x": 163.29,
          "y": 348,
          "pinned": false
        },
        "cluster:2": {
          "x": 563.79,
          "y": 168.14,
          "pinned": true
        },
        "cluster:3": {
          "x": 916.38,
          "y": 431.72,
          "pinned": true
        }
      },
      "bridges": {
        "term:A–a gradient": {
          "x": 366.44,
          "y": 417.76,
          "pinned": false
        },
        "term:carbon monoxide": {
          "x": 421.85,
          "y": 339.98,
          "pinned": true
        },
        "term:supplemental oxygen": {
          "x": 210.77,
          "y": 95.75,
          "pinned": true
        },
        "term:Bohr effect": {
          "x": 840.82,
          "y": 208.76,
          "pinned": true
        },
        "term:Haldane effect": {
          "x": 714.35,
          "y": 334.09,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Fick's law",
          "blood–gas barrier",
          "capillary transit time",
          "perfusion limitation",
          "diffusion limitation"
        ],
        "cluster:1": [
          "V/Q mismatch",
          "shunt",
          "hypoxic pulmonary vasoconstriction",
          "West zones"
        ],
        "cluster:2": [
          "hemoglobin",
          "oxygen–hemoglobin dissociation curve",
          "P₅₀",
          "2,3-BPG",
          "fetal hemoglobin"
        ],
        "cluster:3": [
          "bicarbonate",
          "carbonic anhydrase",
          "chloride shift",
          "carbamino compounds"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 1640.094242892139
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T03:49:12.874Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "gas-exchange-and-transport",
      "puzzleRevision": "fnv1a32:703ddb1b",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:Fick's law": {
          "x": 224.41,
          "y": 512.42,
          "pinned": false
        },
        "term:blood–gas barrier": {
          "x": 324.67,
          "y": 599.87,
          "pinned": false
        },
        "term:capillary transit time": {
          "x": 134.34,
          "y": 610.67,
          "pinned": true
        },
        "term:perfusion limitation": {
          "x": 97.02,
          "y": 473.94,
          "pinned": true
        },
        "term:diffusion limitation": {
          "x": 217.41,
          "y": 370.1,
          "pinned": false
        },
        "term:V/Q mismatch": {
          "x": 470.59,
          "y": 524.02,
          "pinned": true
        },
        "term:shunt": {
          "x": 586.24,
          "y": 446.26,
          "pinned": true
        },
        "term:hypoxic pulmonary vasoconstriction": {
          "x": 689.15,
          "y": 562.89,
          "pinned": true
        },
        "term:West zones": {
          "x": 505.3,
          "y": 614.91,
          "pinned": true
        },
        "term:hemoglobin": {
          "x": 296.21,
          "y": 44.04,
          "pinned": true
        },
        "term:oxygen–hemoglobin dissociation curve": {
          "x": 422.03,
          "y": 185.91,
          "pinned": true
        },
        "term:P₅₀": {
          "x": 480.53,
          "y": 37.03,
          "pinned": true
        },
        "term:2,3-BPG": {
          "x": 153.11,
          "y": 114.08,
          "pinned": true
        },
        "term:fetal hemoglobin": {
          "x": 137.26,
          "y": 41.87,
          "pinned": true
        },
        "term:bicarbonate": {
          "x": 695.06,
          "y": 297.7,
          "pinned": true
        },
        "term:carbonic anhydrase": {
          "x": 855.29,
          "y": 291.13,
          "pinned": true
        },
        "term:chloride shift": {
          "x": 748.76,
          "y": 382.15,
          "pinned": true
        },
        "term:carbamino compounds": {
          "x": 717.74,
          "y": 196.14,
          "pinned": true
        },
        "term:A–a gradient": {
          "x": 335.27,
          "y": 460.92,
          "pinned": false
        },
        "term:carbon monoxide": {
          "x": 171.36,
          "y": 218.71,
          "pinned": false
        },
        "term:supplemental oxygen": {
          "x": 459.55,
          "y": 379.5,
          "pinned": false
        },
        "term:Bohr effect": {
          "x": 542.14,
          "y": 270.03,
          "pinned": true
        },
        "term:Haldane effect": {
          "x": 575.16,
          "y": 104.04,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4448.37,
        "score": 4448.36729557967
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T03:51:13.859Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-10T03:47:50.270Z",
    "bridgePreconnect": true,
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
