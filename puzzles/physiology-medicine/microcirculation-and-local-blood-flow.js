// Generated from content/puzzles/microcirculation-and-local-blood-flow.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "microcirculation-and-local-blood-flow",
  "title": "Microcirculation and local blood flow",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cardiovascular"
  },
  "info": {
    "text": "Each tissue sets its own blood flow to match its needs, and the pressures across capillary walls decide how much of that flow leaks into the tissue and how much returns.",
    "links": [
      {
        "href": "wiki:Microcirculation"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology (14th ed.)",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2020",
        "pages": "ch. 16, 17, 25"
      },
      {
        "title": "Microcirculation",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Microcirculation"
      },
      {
        "title": "Starling equation",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Starling_equation"
      },
      {
        "title": "Autoregulation",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Autoregulation"
      }
    ]
  },
  "clusters": [
    {
      "id": "capillary-filtration",
      "name": "Capillary filtration",
      "color": "teal",
      "fact": "Four Starling forces govern fluid movement across a capillary wall. Capillary pressure and interstitial colloid osmotic pressure move fluid out, and so does interstitial fluid pressure where it is slightly negative, as in loose tissue. Plasma colloid osmotic pressure pulls fluid back in. Their sum is the net filtration pressure, and the filtration coefficient converts it into a rate of flow.",
      "terms": [
        "capillary pressure",
        "plasma colloid osmotic pressure",
        "interstitial fluid pressure",
        "interstitial colloid osmotic pressure",
        "filtration coefficient",
        "net filtration pressure"
      ],
      "seeds": [
        "capillary pressure",
        "plasma colloid osmotic pressure"
      ],
      "termInfo": {
        "capillary pressure": "The blood pressure inside a capillary, which pushes fluid outward; often called capillary hydrostatic pressure. It falls from about 30 mmHg at the arterial end to about 10 mmHg at the venous end.",
        "filtration coefficient": "The rate of fluid flow across the capillary walls for each mmHg of net filtration pressure; it reflects both how permeable the walls are and how much capillary surface is open.",
        "interstitial fluid pressure": "The pressure of the fluid between tissue cells. In loose tissue such as under the skin it is slightly below atmospheric, so it draws fluid outward.",
        "net filtration pressure": "The sum of the outward and inward forces. Over the whole body it is a fraction of a mmHg outward, and the small surplus of filtered fluid returns by the lymph.",
        "plasma colloid osmotic pressure": {
          "text": "The osmotic pull of plasma proteins, chiefly albumin, which cannot easily cross the capillary wall; also called oncotic pressure. At about 28 mmHg it is the main force drawing fluid back into the capillary.",
          "links": [
            {
              "href": "wiki:Oncotic pressure"
            }
          ]
        },
        "interstitial colloid osmotic pressure": "The osmotic pull of the small amount of protein that leaks into the tissue spaces, which draws fluid out of the capillary; Guyton calls it interstitial fluid colloid osmotic pressure."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Starling equation"
          }
        ]
      }
    },
    {
      "id": "metabolic-vasodilators",
      "name": "Metabolic vasodilators",
      "color": "blue",
      "fact": "Working tissue releases substances that relax the smooth muscle of nearby arterioles and precapillary sphincters. The faster the metabolism, or the scarcer the oxygen, the more of them accumulate, so flow rises to match the tissue's needs.",
      "terms": [
        "adenosine",
        "carbon dioxide",
        "potassium ions",
        "hydrogen ions"
      ],
      "seeds": [
        "adenosine",
        "carbon dioxide"
      ],
      "termInfo": {
        "adenosine": {
          "text": "A breakdown product of ATP released when cells run short of oxygen; a leading candidate for the vasodilator that matches coronary flow to the heart's work.",
          "links": [
            {
              "href": "wiki:Adenosine"
            }
          ]
        },
        "carbon dioxide": "A waste product of metabolism that relaxes arteriolar smooth muscle; it is an especially strong vasodilator in the brain.",
        "hydrogen ions": "Accumulate as active tissue produces lactic acid and carbon dioxide; the falling pH dilates arterioles.",
        "potassium ions": "Released from repeatedly contracting muscle and firing neurons; a local rise in potassium relaxes arteriolar smooth muscle."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Vasodilation"
          }
        ]
      }
    },
    {
      "id": "local-flow-responses",
      "name": "Local flow responses",
      "color": "amber",
      "fact": "Tissues adjust their own flow without help from nerves or hormones. Flow rises with metabolic activity and after a period of blocked supply, and it returns toward normal within about a minute when arterial pressure changes. Two mechanisms explain that steadiness: vasodilators wash out or build up, and arteriolar muscle contracts when stretched.",
      "terms": [
        "active hyperemia",
        "reactive hyperemia",
        "autoregulation",
        "myogenic response"
      ],
      "seeds": [
        "active hyperemia",
        "reactive hyperemia"
      ],
      "termInfo": {
        "active hyperemia": {
          "text": "The rise in blood flow that accompanies increased tissue activity, such as in exercising muscle or a secreting gland.",
          "links": [
            {
              "href": "wiki:Hyperaemia"
            }
          ]
        },
        "autoregulation": "A tissue's ability to hold its blood flow nearly constant across a range of arterial pressures, through a metabolic mechanism and a myogenic one.",
        "myogenic response": {
          "text": "The contraction of arteriolar smooth muscle when a rise in pressure stretches it, which narrows the vessel and limits flow; also called the Bayliss effect.",
          "links": [
            {
              "href": "wiki:Myogenic mechanism"
            }
          ]
        },
        "reactive hyperemia": "The surge of blood flow after an artery has been briefly blocked, which roughly repays the oxygen the tissue missed."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Autoregulation"
          }
        ]
      }
    },
    {
      "id": "endothelial-signals",
      "name": "Endothelial signals",
      "color": "magenta",
      "fact": "The cells lining blood vessels release signals that set the tone of the smooth muscle around them. Nitric oxide, released in response to shear stress, raises cyclic GMP in the smooth muscle and relaxes it; endothelin, released when the lining is damaged, constricts.",
      "terms": [
        "nitric oxide",
        "endothelin",
        "shear stress",
        "cyclic GMP"
      ],
      "seeds": [
        "nitric oxide",
        "endothelin"
      ],
      "termInfo": {
        "cyclic GMP": {
          "text": "The second messenger that nitric oxide generates in smooth muscle by activating guanylyl cyclase; it relaxes the muscle.",
          "links": [
            {
              "href": "wiki:Cyclic guanosine monophosphate"
            }
          ]
        },
        "endothelin": {
          "text": "A peptide released by damaged endothelium that is among the most powerful vasoconstrictors known.",
          "links": [
            {
              "href": "wiki:Endothelin"
            }
          ]
        },
        "nitric oxide": {
          "text": "A gas made by endothelial nitric oxide synthase that diffuses into neighboring smooth muscle and relaxes it; first identified as endothelium-derived relaxing factor.",
          "links": [
            {
              "href": "wiki:Nitric oxide"
            }
          ]
        },
        "shear stress": {
          "text": "The drag of flowing blood along the vessel lining; faster flow raises it and prompts the endothelium to release nitric oxide.",
          "links": [
            {
              "href": "wiki:Shear stress"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Endothelium"
          }
        ]
      }
    },
    {
      "id": "safeguards-against-edema",
      "name": "Safeguards against edema",
      "color": "olive",
      "fact": "Interstitial fluid can rise considerably before tissue swells. While interstitial pressure stays negative the tissue spaces are stiff, so a little extra fluid raises their pressure sharply and opposes further filtration, and lymph flow can rise many times over to carry the excess away. Edema appears only once these safeguards are exhausted.",
      "terms": [
        "edema",
        "lymph flow",
        "interstitial compliance"
      ],
      "seeds": [
        "edema",
        "lymph flow"
      ],
      "termInfo": {
        "edema": "Excess fluid in the tissue spaces, felt and seen as swelling.",
        "interstitial compliance": "How much the tissue spaces expand for each rise in their pressure. It is low while that pressure is negative, so added fluid quickly builds a pressure that resists more filtration.",
        "lymph flow": {
          "text": "The return of filtered fluid and leaked protein to the blood through lymphatic vessels; it can increase ten- to fiftyfold when filtration rises.",
          "links": [
            {
              "href": "wiki:Lymph"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Edema"
          }
        ]
      }
    },
    {
      "id": "long-term-flow-control",
      "name": "Long-term flow control",
      "color": "brown",
      "fact": "When a tissue's needs stay above its supply for days to weeks, the vessels themselves change. Oxygen-starved tissue releases growth factors that sprout new capillaries, and when an artery is blocked, small connecting vessels enlarge into new routes around it.",
      "terms": [
        "angiogenesis",
        "VEGF",
        "collateral circulation"
      ],
      "seeds": [
        "angiogenesis",
        "VEGF"
      ],
      "termInfo": {
        "VEGF": {
          "text": "Vascular endothelial growth factor, the best-known signal that oxygen-starved tissue releases to drive new vessel growth.",
          "links": [
            {
              "href": "wiki:Vascular endothelial growth factor"
            }
          ]
        },
        "angiogenesis": "The growth of new blood vessels sprouting from existing ones, which raises the number of capillaries serving a tissue.",
        "collateral circulation": {
          "text": "Alternate routes around a blocked artery, formed as small existing connections enlarge over days to months.",
          "links": [
            {
              "href": "wiki:Collateral circulation"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Angiogenesis"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "precapillary-sphincters",
      "term": "precapillary sphincters",
      "clusters": [
        1,
        2
      ],
      "fact": "Vasodilator metabolites relax the precapillary sphincters and metarterioles, opening more capillaries to flow; in exercising muscle this is a large part of active hyperemia.",
      "info": {
        "text": "Rings of smooth muscle where capillaries branch off metarterioles. They open and close in cycles, a rhythm called vasomotion, and stay open longer as vasodilators build up.",
        "links": [
          {
            "href": "wiki:Precapillary sphincter"
          }
        ]
      },
      "idealTerms": [
        null,
        "active hyperemia"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "flow-mediated-dilation",
      "term": "flow-mediated dilation",
      "clusters": [
        3,
        2
      ],
      "fact": "When the microvessels in active tissue dilate, flow speeds up in the larger arteries feeding them. The higher shear stress releases nitric oxide from their lining, so the feeding arteries dilate too and the extra flow is not throttled upstream.",
      "info": {
        "text": "The widening of an artery in response to increased flow through it, carried out by the endothelium.",
        "links": [
          {
            "href": "wiki:Flow-mediated dilation"
          }
        ]
      },
      "idealTerms": [
        "shear stress",
        "active hyperemia"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    },
    {
      "id": "arteriolar-dilation",
      "term": "arteriolar dilation",
      "clusters": [
        2,
        0
      ],
      "fact": "When local responses dilate the arterioles, less of the arterial pressure is spent upstream of the capillaries, so capillary pressure and filtration rise. That is why exercising muscle visibly swells.",
      "info": "The widening of arterioles as their smooth muscle relaxes, which lowers resistance ahead of the capillaries.",
      "idealTerms": [
        null,
        "capillary pressure"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "protein-washdown",
      "term": "protein washdown",
      "clusters": [
        0,
        4
      ],
      "fact": "When filtration rises, the added fluid dilutes the protein in the tissue spaces and faster lymph flow carries protein away. The interstitial colloid osmotic pressure falls, weakening one of the forces that pulls fluid out.",
      "info": "The lowering of interstitial protein concentration as filtration and lymph flow increase; Guyton's term is washdown of interstitial fluid protein.",
      "idealTerms": [
        "interstitial colloid osmotic pressure",
        "lymph flow"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 0
      }
    },
    {
      "id": "tissue-hypoxia",
      "term": "tissue hypoxia",
      "clusters": [
        1,
        5
      ],
      "fact": "A shortage of oxygen drives both timescales of control. Within seconds it releases vasodilators such as adenosine and relaxes arteriolar muscle directly; over weeks it releases VEGF and grows new vessels.",
      "info": {
        "text": "An oxygen supply that falls short of the tissue's demand.",
        "links": [
          {
            "href": "wiki:Hypoxia (medicine)"
          }
        ]
      },
      "idealTerms": [
        "adenosine",
        "VEGF"
      ]
    }
  ],
  "lenses": [
    {
      "id": "outward-forces",
      "prompt": "Which forces normally move fluid out of the capillary?",
      "explanation": "Plasma colloid osmotic pressure is the one force pulling fluid back in. The outward forces slightly exceed it, and the lymph returns the small surplus.",
      "targets": [
        "capillary pressure",
        "interstitial fluid pressure",
        "interstitial colloid osmotic pressure"
      ],
      "reasons": {
        "capillary pressure": "Blood pressure inside the capillary pushes fluid through its wall.",
        "interstitial colloid osmotic pressure": "Leaked protein in the tissue spaces pulls water toward it.",
        "interstitial fluid pressure": "In loose tissue it is slightly negative, so it draws fluid outward."
      }
    },
    {
      "id": "starvation-edema",
      "prompt": "A fall in which force explains the swelling of severe protein starvation?",
      "explanation": "Liver failure and kidney disease that loses protein in the urine produce edema the same way. Capillary pressure is unchanged; the force holding fluid in the blood is what fails.",
      "targets": [
        "plasma colloid osmotic pressure"
      ],
      "reasons": {
        "plasma colloid osmotic pressure": "With too little albumin in the plasma, the inward pull weakens and fluid stays in the tissues."
      }
    },
    {
      "id": "safeguards-via-forces",
      "prompt": "Which safeguards against edema work by weakening a Starling force that moves fluid out?",
      "explanation": "Lymph flow is the third safeguard, but it works differently: it carries the excess fluid away instead of changing a force across the capillary wall.",
      "targets": [
        "interstitial compliance",
        "protein washdown"
      ],
      "reasons": {
        "interstitial compliance": "Stiff tissue spaces let a little extra fluid raise interstitial pressure sharply, so it stops drawing fluid outward.",
        "protein washdown": "Diluting and removing tissue protein lowers the interstitial colloid osmotic pressure."
      }
    },
    {
      "id": "capillary-recruitment",
      "prompt": "Which structures open more capillaries to flow as vasodilators build up in working muscle?",
      "explanation": "Opening more capillaries raises flow and also shortens the distance oxygen must diffuse to each cell.",
      "targets": [
        "precapillary sphincters"
      ],
      "reasons": {
        "precapillary sphincters": "These rings of smooth muscle relax as metabolites accumulate, letting blood into capillaries that were closed."
      }
    },
    {
      "id": "raising-capillary-pressure",
      "prompt": "Which change in the resistance vessels lets more of the arterial pressure reach the capillaries?",
      "explanation": "This is the link between flow control and fluid balance, and the reason exercising muscle swells.",
      "targets": [
        "arteriolar dilation"
      ],
      "reasons": {
        "arteriolar dilation": "Wider arterioles spend less pressure upstream, so capillary pressure and filtration rise."
      }
    },
    {
      "id": "dilation-upstream",
      "prompt": "Which steps carry dilation from a working tissue up to the artery that feeds it?",
      "explanation": "Metabolic vasodilators act mainly near where they are released, so they cannot reach the larger arteries upstream. The endothelium carries the signal there by sensing the extra flow itself. Endothelin works in the opposite direction.",
      "targets": [
        "shear stress",
        "nitric oxide",
        "cyclic GMP",
        "flow-mediated dilation"
      ],
      "reasons": {
        "cyclic GMP": "Nitric oxide raises cyclic GMP in the artery's smooth muscle, which relaxes it.",
        "flow-mediated dilation": "The result is a wider feeding artery that keeps pace with the tissue's demand.",
        "nitric oxide": "The lining responds to that drag by releasing nitric oxide.",
        "shear stress": "Faster flow through the feeding artery drags harder on its lining."
      }
    },
    {
      "id": "local-constrictors",
      "prompt": "Which local mechanisms narrow arterioles?",
      "explanation": "Nearly every other local signal relaxes vessels. These two narrow them: one guards against too much flow when pressure rises, the other helps limit bleeding when a vessel is injured.",
      "targets": [
        "myogenic response",
        "endothelin"
      ],
      "reasons": {
        "endothelin": "Damaged endothelium releases this peptide, a powerful constrictor.",
        "myogenic response": "Stretched arteriolar muscle contracts, narrowing the vessel when pressure rises."
      }
    },
    {
      "id": "two-timescales",
      "prompt": "Which condition triggers both the release of adenosine and the release of VEGF?",
      "explanation": "The same signal, too little oxygen, drives short-term dilation of existing vessels and long-term growth of new ones.",
      "targets": [
        "tissue hypoxia"
      ],
      "reasons": {
        "tissue hypoxia": "Within seconds it releases vasodilators such as adenosine; over weeks it releases VEGF and grows new vessels."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "lymphatic-system",
        "reason": "Follow the fluid that leaves the capillaries through the lymphatic vessels and back to the blood."
      },
      {
        "id": "regulating-arterial-pressure",
        "reason": "See how nerves and hormones set the arterial pressure that local control then divides among tissues."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How tissues control their own blood flow",
    "summary": "How each tissue matches its blood flow to its needs, and how pressures across the capillary wall balance fluid between blood and tissue.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "The heart and the large arteries set the pressure that drives blood through the body, but each tissue decides how much of that blood it takes. Resting muscle needs little; working muscle may need twenty times as much. The control happens locally, in the smallest arteries and the capillaries, and it works without instructions from the brain.\r\n\r\n## Matching flow to need\r\n\r\nActive tissue releases chemicals that relax the smooth muscle around its arterioles. **Adenosine**, a breakdown product of ATP, is a leading candidate in the heart; **carbon dioxide**, **potassium ions**, and **hydrogen ions** accumulate as cells work. Many of these act on the **precapillary sphincters**, rings of smooth muscle where capillaries branch off, which open more capillaries as the chemicals build up. **Tissue hypoxia**, a shortage of oxygen, also relaxes the vessels directly and releases more of these vasodilators.\r\n\r\nThe results have names. **Active hyperemia** is the rise in flow when a tissue works harder. **Reactive hyperemia** is the surge after an artery has been briefly blocked, which roughly repays the oxygen the tissue missed. **Autoregulation** is a tissue's ability to hold its flow nearly steady when arterial pressure rises or falls. It works through the same chemicals, which wash out when flow is high and build up when it is low, and through the **myogenic response**: arteriolar muscle contracts when higher pressure stretches it.\r\n\r\n## Signals from the vessel lining\r\n\r\nThe endothelium, the single layer of cells lining every vessel, also sets vessel tone. Faster flow drags along its surface, a force called **shear stress**, and the endothelium responds by releasing **nitric oxide**. Nitric oxide diffuses into the surrounding smooth muscle, raises **cyclic GMP**, and relaxes it. This **flow-mediated dilation** lets the larger arteries upstream widen when the small vessels in a working tissue open, so the extra flow is not choked off. Damaged endothelium releases **endothelin**, one of the most powerful vasoconstrictors known.\r\n\r\n## Fluid across the capillary wall\r\n\r\nCapillary walls leak water and small solutes. Four forces, named after the physiologist Ernest Starling, decide the balance. **Capillary pressure** pushes fluid out. **Plasma colloid osmotic pressure**, the pull of proteins that stay in the blood, draws it back in. On the tissue side, the slight negative **interstitial fluid pressure** of loose tissue draws fluid out, as does the **interstitial colloid osmotic pressure** of the little protein that leaks. Their sum is the **net filtration pressure**, and the **filtration coefficient**, set by how leaky and how extensive the capillary surface is, turns it into a flow. Normally a little more fluid leaves than returns.\r\n\r\nLocal control and filtration are linked. **Arteriolar dilation** lets more of the arterial pressure reach the capillaries, raising capillary pressure and filtration, which is why exercising muscle swells.\r\n\r\n## Why tissue rarely swells\r\n\r\nExcess tissue fluid is **edema**, and several safeguards hold it off. While interstitial pressure is negative, the tissue spaces have low **interstitial compliance**: a little extra fluid raises their pressure steeply and opposes more filtration. **Lymph flow** can rise many times over to carry the excess away. And **protein washdown**, the dilution and removal of tissue protein, lowers the osmotic force pulling fluid out. Together these give a safety margin of roughly 17 mmHg.\r\n\r\n## Changes over weeks\r\n\r\nWhen a tissue's need outlasts its supply, the vessels themselves change. Oxygen-starved cells release **VEGF**, vascular endothelial growth factor, which drives **angiogenesis**, the sprouting of new capillaries. When an artery is blocked slowly, small connecting vessels enlarge into **collateral circulation** around the blockage."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "microcirculation-and-local-blood-flow",
      "puzzleRevision": "fnv1a32:ee32a711",
      "board": {
        "width": 1240,
        "height": 800
      },
      "nodes": {
        "term:capillary pressure": {
          "x": 1126.23,
          "y": 113.51
        },
        "term:plasma colloid osmotic pressure": {
          "x": 586.83,
          "y": 29.96
        },
        "term:interstitial fluid pressure": {
          "x": 834.5,
          "y": 29.96
        },
        "term:interstitial colloid osmotic pressure": {
          "x": 407.64,
          "y": 104.19
        },
        "term:filtration coefficient": {
          "x": 463.78,
          "y": 226.97
        },
        "term:net filtration pressure": {
          "x": 1045.27,
          "y": 53.95
        },
        "term:adenosine": {
          "x": 786.6,
          "y": 318.04
        },
        "term:carbon dioxide": {
          "x": 794.74,
          "y": 229.56
        },
        "term:potassium ions": {
          "x": 956.91,
          "y": 198.37
        },
        "term:hydrogen ions": {
          "x": 1035.46,
          "y": 299.96
        },
        "term:active hyperemia": {
          "x": 716.78,
          "y": 520.4
        },
        "term:reactive hyperemia": {
          "x": 945.24,
          "y": 544.22
        },
        "term:autoregulation": {
          "x": 1137.24,
          "y": 645.06
        },
        "term:myogenic response": {
          "x": 1071.21,
          "y": 734.21
        },
        "term:nitric oxide": {
          "x": 440.63,
          "y": 766.06
        },
        "term:endothelin": {
          "x": 564.36,
          "y": 756.11
        },
        "term:shear stress": {
          "x": 666.25,
          "y": 704.37
        },
        "term:cyclic GMP": {
          "x": 316.8,
          "y": 749.14
        },
        "term:edema": {
          "x": 110.19,
          "y": 610.24
        },
        "term:lymph flow": {
          "x": 87.79,
          "y": 506.11
        },
        "term:interstitial compliance": {
          "x": 141.91,
          "y": 706.07
        },
        "term:angiogenesis": {
          "x": 329.19,
          "y": 387.32
        },
        "term:VEGF": {
          "x": 470.34,
          "y": 409.54
        },
        "term:collateral circulation": {
          "x": 272.84,
          "y": 453.11
        },
        "term:precapillary sphincters": {
          "x": 667.19,
          "y": 405.23
        },
        "term:flow-mediated dilation": {
          "x": 701.11,
          "y": 619.76
        },
        "term:arteriolar dilation": {
          "x": 1145.22,
          "y": 472.16
        },
        "term:protein washdown": {
          "x": 156.9,
          "y": 217.17
        },
        "term:tissue hypoxia": {
          "x": 607.02,
          "y": 320.68
        },
        "cluster:0": {
          "x": 602.88,
          "y": 165.43
        },
        "cluster:1": {
          "x": 934.4,
          "y": 386.02
        },
        "cluster:2": {
          "x": 944.53,
          "y": 652.23
        },
        "cluster:3": {
          "x": 417.55,
          "y": 629.67
        },
        "cluster:4": {
          "x": 243,
          "y": 555.58
        },
        "cluster:5": {
          "x": 438.07,
          "y": 507.69
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T02:59:34.147Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "microcirculation-and-local-blood-flow",
      "puzzleRevision": "fnv1a32:ee32a711",
      "board": {
        "width": 1240,
        "height": 800
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 538.3,
          "y": 199.26,
          "pinned": true
        },
        "cluster:1": {
          "x": 804.44,
          "y": 458.87,
          "pinned": true
        },
        "cluster:2": {
          "x": 1058.56,
          "y": 666.92,
          "pinned": true
        },
        "cluster:3": {
          "x": 340.96,
          "y": 660.37,
          "pinned": true
        },
        "cluster:4": {
          "x": 1015.42,
          "y": 114.58,
          "pinned": true
        },
        "cluster:5": {
          "x": 220.26,
          "y": 424.75,
          "pinned": true
        }
      },
      "bridges": {
        "term:precapillary sphincters": {
          "x": 699.6,
          "y": 624.89,
          "pinned": true
        },
        "term:flow-mediated dilation": {
          "x": 681.21,
          "y": 737.19,
          "pinned": true
        },
        "term:arteriolar dilation": {
          "x": 1103.42,
          "y": 289.04,
          "pinned": true
        },
        "term:protein washdown": {
          "x": 792.83,
          "y": 34.05,
          "pinned": true
        },
        "term:tissue hypoxia": {
          "x": 485.61,
          "y": 474.94,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "capillary pressure",
          "plasma colloid osmotic pressure",
          "interstitial fluid pressure",
          "interstitial colloid osmotic pressure",
          "filtration coefficient",
          "net filtration pressure"
        ],
        "cluster:1": [
          "adenosine",
          "carbon dioxide",
          "potassium ions",
          "hydrogen ions"
        ],
        "cluster:2": [
          "active hyperemia",
          "reactive hyperemia",
          "autoregulation",
          "myogenic response"
        ],
        "cluster:3": [
          "nitric oxide",
          "endothelin",
          "shear stress",
          "cyclic GMP"
        ],
        "cluster:4": [
          "edema",
          "lymph flow",
          "interstitial compliance"
        ],
        "cluster:5": [
          "angiogenesis",
          "VEGF",
          "collateral circulation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "filtration coefficient",
          "interstitial fluid pressure",
          "interstitial colloid osmotic pressure",
          "plasma colloid osmotic pressure",
          "net filtration pressure",
          "capillary pressure"
        ],
        "cluster:1": [
          "hydrogen ions",
          "potassium ions",
          "carbon dioxide",
          "adenosine"
        ],
        "cluster:2": [
          "active hyperemia",
          "reactive hyperemia",
          "myogenic response",
          "autoregulation"
        ],
        "cluster:3": [
          "cyclic GMP",
          "shear stress",
          "nitric oxide",
          "endothelin"
        ],
        "cluster:4": [
          "lymph flow",
          "interstitial compliance",
          "edema"
        ],
        "cluster:5": [
          "VEGF",
          "collateral circulation",
          "angiogenesis"
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
        "totalLength": 2670.8709525378904
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-14T03:17:10.683Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "microcirculation-and-local-blood-flow",
      "puzzleRevision": "fnv1a32:ee32a711",
      "board": {
        "width": 1240,
        "height": 800
      },
      "nodes": {
        "term:capillary pressure": {
          "x": 983.92,
          "y": 120.48,
          "pinned": true
        },
        "term:plasma colloid osmotic pressure": {
          "x": 557.97,
          "y": 59.82,
          "pinned": true
        },
        "term:interstitial fluid pressure": {
          "x": 834.5,
          "y": 29.96,
          "pinned": false
        },
        "term:interstitial colloid osmotic pressure": {
          "x": 608.67,
          "y": 141.01,
          "pinned": true
        },
        "term:filtration coefficient": {
          "x": 823.05,
          "y": 201.09,
          "pinned": true
        },
        "term:net filtration pressure": {
          "x": 1045.27,
          "y": 53.95,
          "pinned": false
        },
        "term:adenosine": {
          "x": 699.02,
          "y": 363.82,
          "pinned": true
        },
        "term:carbon dioxide": {
          "x": 609.63,
          "y": 268.37,
          "pinned": true
        },
        "term:potassium ions": {
          "x": 767.82,
          "y": 281.97,
          "pinned": true
        },
        "term:hydrogen ions": {
          "x": 854.33,
          "y": 348.72,
          "pinned": true
        },
        "term:active hyperemia": {
          "x": 789.43,
          "y": 471.64,
          "pinned": true
        },
        "term:reactive hyperemia": {
          "x": 1048.74,
          "y": 476.55,
          "pinned": true
        },
        "term:autoregulation": {
          "x": 1044.69,
          "y": 585.35,
          "pinned": true
        },
        "term:myogenic response": {
          "x": 985.62,
          "y": 682.46,
          "pinned": true
        },
        "term:nitric oxide": {
          "x": 469.49,
          "y": 747.15,
          "pinned": true
        },
        "term:endothelin": {
          "x": 674.83,
          "y": 741.18,
          "pinned": true
        },
        "term:shear stress": {
          "x": 530.9,
          "y": 669.54,
          "pinned": true
        },
        "term:cyclic GMP": {
          "x": 364.57,
          "y": 678.48,
          "pinned": true
        },
        "term:edema": {
          "x": 244.54,
          "y": 319.64,
          "pinned": true
        },
        "term:lymph flow": {
          "x": 121.63,
          "y": 261.29,
          "pinned": true
        },
        "term:interstitial compliance": {
          "x": 132.95,
          "y": 427.41,
          "pinned": true
        },
        "term:angiogenesis": {
          "x": 337.15,
          "y": 455.99,
          "pinned": true
        },
        "term:VEGF": {
          "x": 488.25,
          "y": 347.84,
          "pinned": true
        },
        "term:collateral circulation": {
          "x": 313.64,
          "y": 574.52,
          "pinned": true
        },
        "term:precapillary sphincters": {
          "x": 553.3,
          "y": 586.08,
          "pinned": true
        },
        "term:flow-mediated dilation": {
          "x": 772.76,
          "y": 638.67,
          "pinned": true
        },
        "term:arteriolar dilation": {
          "x": 1103.42,
          "y": 289.04,
          "pinned": false
        },
        "term:protein washdown": {
          "x": 302.2,
          "y": 165.42,
          "pinned": true
        },
        "term:tissue hypoxia": {
          "x": 519.44,
          "y": 437.12,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 7157.17,
        "score": 7157.165994774943
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-14T03:19:43.903Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-14T02:55:34.011Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
