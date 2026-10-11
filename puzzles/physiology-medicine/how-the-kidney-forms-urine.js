// Generated from content/puzzles/how-the-kidney-forms-urine.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "how-the-kidney-forms-urine",
  "title": "How the kidney forms urine",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "renal"
  },
  "info": {
    "text": "Each nephron filters a large volume of plasma, then revises that filtrate by returning useful substances to the blood and secreting acid, potassium, and some drugs into it.",
    "links": [
      {
        "href": "wiki:Renal physiology"
      }
    ],
    "citations": [
      {
        "title": "Anatomy and Physiology 2e, §25.5 Physiology of Urine Formation",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation"
      },
      {
        "title": "Anatomy and Physiology 2e, §25.6 Tubular Reabsorption",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      }
    ]
  },
  "clusters": [
    {
      "id": "glomerular-filtration",
      "name": "Glomerular filtration",
      "color": "teal",
      "fact": "Blood enters the glomerulus through the afferent arteriole, and the net filtration pressure pushes plasma through a filter built with podocytes into Bowman's capsule as protein-poor filtrate; the volume formed per minute is the glomerular filtration rate.",
      "terms": [
        "glomerulus",
        "filtrate",
        "Bowman's capsule",
        "podocyte",
        "glomerular filtration rate",
        "net filtration pressure",
        "afferent arteriole"
      ],
      "seeds": [
        "glomerulus",
        "filtrate"
      ],
      "termInfo": {
        "Bowman's capsule": {
          "text": "The cup-shaped chamber that collects filtrate around the glomerulus and empties into the renal tubule.",
          "links": [
            {
              "href": "wiki:Bowman's capsule"
            }
          ]
        },
        "afferent arteriole": {
          "text": "The small artery that brings blood into the glomerulus; narrowing or widening it lowers or raises glomerular pressure and the filtration rate.",
          "links": [
            {
              "href": "wiki:Afferent arterioles"
            }
          ]
        },
        "filtrate": "The protein-poor fluid formed when water and small solutes leave glomerular blood and enter Bowman's space.",
        "glomerular filtration rate": {
          "text": "The volume of filtrate formed by the kidneys per unit time, a standard measure of filtration function.",
          "links": [
            {
              "href": "wiki:Glomerular filtration rate"
            }
          ]
        },
        "glomerulus": {
          "text": "The capillary tuft at the start of a nephron where plasma is forced through a filter into the surrounding capsule.",
          "links": [
            {
              "href": "wiki:Glomerulus (kidney)"
            }
          ]
        },
        "net filtration pressure": "Glomerular blood pressure pushing fluid out, minus the capsule's fluid pressure and the osmotic pull of blood proteins; this net push sets how much filtrate forms.",
        "podocyte": {
          "text": "A specialized epithelial cell whose foot processes wrap glomerular capillaries and help form the slits of the filter.",
          "links": [
            {
              "href": "wiki:Podocyte"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Ultrafiltration (kidney)"
          },
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation"
          }
        ]
      }
    },
    {
      "id": "tubular-reabsorption",
      "name": "Tubular reabsorption",
      "color": "blue",
      "fact": "Reabsorption returns sodium, water, and glucose from the tubular fluid to the blood: sodium–glucose cotransporters carry glucose in alongside sodium, water follows the reclaimed solutes by osmosis, and each carrier has a transport maximum it cannot exceed.",
      "terms": [
        "glucose",
        "sodium",
        "water",
        "sodium–glucose cotransporter",
        "transport maximum"
      ],
      "seeds": [
        "glucose",
        "sodium"
      ],
      "termInfo": {
        "glucose": "A filtered nutrient that a healthy tubule reabsorbs almost completely, which is why urine is normally glucose-free.",
        "sodium": "The ion whose recovery from tubular fluid powers the cotransport that reclaims glucose and other solutes.",
        "sodium–glucose cotransporter": {
          "text": "A membrane carrier that moves glucose into a tubule cell together with sodium, using sodium's inward flow as its energy source.",
          "links": [
            {
              "href": "wiki:Sodium-glucose transport proteins"
            }
          ]
        },
        "transport maximum": "The highest rate at which the tubule's carriers can reclaim a solute; above it, the excess remains in the tubular fluid.",
        "water": "Reclaimed passively by osmosis, following the sodium and other solutes the tubule returns toward the blood."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Reabsorption"
          },
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
          }
        ]
      }
    },
    {
      "id": "tubular-secretion",
      "name": "Tubular secretion",
      "color": "amber",
      "fact": "Secretion adds hydrogen ion, ammonium, potassium, and drugs such as penicillin to the tubular fluid; tubule cells make the two acid ions themselves, while potassium and penicillin are taken up from the blood side and released into the lumen.",
      "terms": [
        "hydrogen ion",
        "potassium",
        "ammonium",
        "penicillin"
      ],
      "seeds": [
        "hydrogen ion",
        "potassium"
      ],
      "termInfo": {
        "ammonium": "NH4+, made in tubule cells from the amino acid glutamine and secreted into the lumen; excreting it carries acid out in the urine.",
        "hydrogen ion": "A proton generated in tubule cells from carbon dioxide and secreted into tubular fluid, a key part of the kidney's control of acid–base balance.",
        "penicillin": {
          "text": "An antibiotic cleared largely by tubular secretion, so quickly that early doses had to be repeated every few hours.",
          "links": [
            {
              "href": "wiki:Penicillin"
            }
          ]
        },
        "potassium": "Most filtered potassium is reclaimed early in the tubule; the potassium in urine comes mainly from secretion in the later segments."
      },
      "info": {
        "text": "Tubular secretion adds selected acids, wastes, and some drugs to the forming urine from the blood around the tubule.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "nephron",
      "term": "nephron",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A nephron produces urine by filtering plasma at its glomerulus, then reabsorbing and secreting along the same tubule; dropping any of those operations would change what the urine contains.",
      "info": {
        "text": "The kidney's functional unit: a renal corpuscle plus a tubule that revises filtrate into urine.",
        "links": [
          {
            "href": "wiki:Nephron"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "glomerulus",
        null,
        null
      ]
    },
    {
      "id": "efferent-arteriole",
      "term": "efferent arteriole",
      "clusters": [
        0,
        1
      ],
      "fact": "The efferent arteriole carries blood out of the glomerulus into the peritubular capillaries; because filtration removed fluid but left proteins behind, that blood has a high osmotic pull that draws reabsorbed fluid back into the circulation.",
      "info": {
        "text": "The arteriole that carries blood out of the glomerulus and on to the capillaries around the tubule.",
        "links": [
          {
            "href": "wiki:Efferent arteriole"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "glomerulus",
        "water"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "filtered-load",
      "term": "filtered load",
      "clusters": [
        0,
        1
      ],
      "fact": "The filtered load of a solute is the glomerular filtration rate multiplied by its plasma concentration; when that load exceeds the transport maximum of the carriers that reclaim it, the excess stays in the urine.",
      "info": "The amount of a solute filtered per minute: glomerular filtration rate times plasma concentration.",
      "relationKind": "dynamic",
      "idealTerms": [
        "glomerular filtration rate",
        "transport maximum"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "peritubular-capillary",
      "term": "peritubular capillary",
      "clusters": [
        1,
        2
      ],
      "fact": "Peritubular capillaries take up the fluid and solutes reabsorption returns, and the same blood supplies the potassium, penicillin, glutamine, and carbon dioxide that secretion draws on.",
      "info": {
        "text": "The capillary network around the cortical tubules, fed by the efferent arteriole, that receives what reabsorption returns and supplies what secretion adds.",
        "links": [
          {
            "href": "wiki:Peritubular capillaries"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bicarbonate",
      "term": "bicarbonate",
      "clusters": [
        1,
        2
      ],
      "fact": "Secreted hydrogen ion combines with filtered bicarbonate in the lumen, forming carbon dioxide that enters the tubule cell and is rebuilt into bicarbonate for the blood; hydrogen ion secretion is how the tubule reclaims bicarbonate.",
      "info": {
        "text": "The blood's main buffer base, filtered freely and reclaimed almost completely with the help of secreted hydrogen ion.",
        "links": [
          {
            "href": "wiki:Bicarbonate"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "hydrogen ion"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "sodium-potassium-pump",
      "term": "sodium–potassium pump",
      "clusters": [
        1,
        2
      ],
      "fact": "On the blood side of tubule cells, the sodium–potassium pump spends ATP to push sodium out and bring potassium in; the low sodium inside the cell drives sodium reabsorption from the lumen, and the potassium it gathers is what secretion releases into the urine.",
      "info": {
        "text": "The ATP-driven pump that moves three sodium ions out of a cell for every two potassium ions it brings in.",
        "links": [
          {
            "href": "wiki:Sodium–potassium pump"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "sodium",
        "potassium"
      ],
      "direction": {
        "kind": "outward"
      }
    }
  ],
  "lenses": [
    {
      "id": "absent-from-urine",
      "prompt": "Which filtered substances are normally absent from urine?",
      "explanation": "Healthy tubules reclaim nearly all filtered glucose and bicarbonate, so neither normally reaches the urine. Sodium and water are reclaimed in large proportion too, but the kidney lets variable amounts through to adjust the body's salt and water.",
      "targets": [
        "glucose",
        "bicarbonate"
      ],
      "reasons": {
        "bicarbonate": "Secreted hydrogen ion lets the tubule reclaim nearly all of it.",
        "glucose": "Sodium–glucose cotransporters reclaim all of it unless the filtered load exceeds their transport maximum."
      }
    },
    {
      "id": "atp-driven-step",
      "prompt": "Which concept spends ATP to drive sodium-coupled reabsorption?",
      "explanation": "Only the pump uses ATP directly. The sodium–glucose cotransporter spends none of its own; it rides the sodium gradient the pump creates, which makes glucose reabsorption secondary active transport.",
      "targets": [
        "sodium–potassium pump"
      ],
      "reasons": {
        "sodium–potassium pump": "It pushes sodium out of the tubule cell on the blood side, keeping the cell's sodium low so more flows in from the lumen."
      }
    },
    {
      "id": "excreting-acid",
      "prompt": "Which secreted ions let the kidney excrete excess acid?",
      "explanation": "Hydrogen ion and ammonium both carry acid into the urine. Potassium secretion serves potassium balance, and penicillin is a drug the kidney clears.",
      "targets": [
        "hydrogen ion",
        "ammonium"
      ],
      "reasons": {
        "ammonium": "Tubule cells make it from glutamine, and it carries acid out in a form the urine can hold.",
        "hydrogen ion": "Tubule cells generate it from carbon dioxide and pump it into the lumen."
      }
    },
    {
      "id": "transport-maximum",
      "prompt": "Which filtered nutrient spills into urine once its load exceeds the tubule's transport maximum?",
      "explanation": "The filtered load of glucose rises with blood glucose, while the carriers that reclaim it have a fixed transport maximum. Glucose in urine usually means the tubule received more than it could reclaim: a failure to keep, rather than a deliberate secretion.",
      "targets": [
        "glucose"
      ],
      "reasons": {
        "glucose": "Its carriers have a ceiling; when blood glucose is high enough, as in uncontrolled diabetes, the excess stays in the urine."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-the-heart-pumps",
        "reason": "Glomerular filtration is driven by arterial blood pressure, so cardiac pumping is a precondition for forming filtrate.",
        "via": [
          "net filtration pressure",
          "glomerular filtration rate"
        ]
      },
      {
        "id": "maintaining-homeostasis",
        "reason": "Reabsorbing sodium and water and secreting hydrogen ion are how the kidney acts as an effector for volume, osmolarity, and pH.",
        "via": [
          "sodium",
          "water",
          "hydrogen ion"
        ]
      },
      {
        "id": "breathing-gas-exchange",
        "reason": "The lungs expire carbon dioxide while the kidney secretes hydrogen ion and reclaims bicarbonate; both revise acid–base balance.",
        "via": [
          "hydrogen ion",
          "bicarbonate"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Urine is revised filtrate",
    "summary": "The kidney filters a huge volume of plasma, then revises it twice over: reclaiming what the body still needs, and adding acid, potassium, and some drugs.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "The kidney works by extravagance. Each day the two kidneys pull roughly 180 liters of fluid out of the blood, about sixty times the body's entire plasma volume, and then spend most of their effort putting it back. Urine is what remains once that fluid has been revised, twice over.\r\n\r\nThe revising happens in about a million nephrons per kidney. Blood arrives at each one through an afferent arteriole and enters the glomerulus, a knot of capillaries pressed against a filter whose outer layer is woven from the foot processes of podocytes. What passes through collects in Bowman's capsule as filtrate: plasma stripped of its cells and large proteins, still carrying its glucose, sodium, water, and wastes. The force behind it is the net filtration pressure, the blood pressure in the glomerulus minus the push-back from fluid already in the capsule and the osmotic pull of the proteins left behind. Tighten the afferent arteriole and that pressure falls; the volume formed each minute, the glomerular filtration rate, falls with it.\r\n\r\nIf filtrate left the body as it is, you would lose your circulating volume in well under an hour. So the tubule takes it back. On the side of each tubule cell that faces the blood, the sodium–potassium pump spends ATP throwing sodium out, which keeps sodium leaking in from the tubular fluid. Sodium–glucose cotransporters ride that inward leak, carrying glucose along, and water follows the reclaimed solutes by osmosis. Meanwhile the blood that left the glomerulus through the efferent arteriole has been concentrated by filtration, the same proteins in less fluid, and in the peritubular capillaries wrapped around the tubule it pulls the reclaimed fluid home.\r\n\r\nReclaiming has a ceiling. The filtered load of a solute is the filtration rate times its concentration in plasma, and the carriers that recover it have a transport maximum. Raise blood glucose far enough, as in uncontrolled diabetes, and the load overruns the carriers. The surplus stays in the urine.\r\n\r\nSecretion runs the other way, and here the kidney acts with intent. Tubule cells make hydrogen ion from carbon dioxide and ammonium from glutamine, an amino acid drawn from the peritubular blood, and push both into the tubular fluid; this is how the body sheds acid. Some of that hydrogen ion does double duty, meeting filtered bicarbonate in the lumen so the cell can rebuild the bicarbonate and send it back to the blood. The potassium the pump gathered into the cells is released into the later segments of the tubule, and most of the potassium in urine arrives this way. Drugs can be shown out the same door: penicillin was secreted so efficiently that early courses had to be dosed every few hours.\r\n\r\n**Before you start:** if a substance appears in urine, did the kidney fail to keep it, or did it deliberately put it there?"
    },
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation",
        "label": "OpenStax Anatomy and Physiology 2e: Physiology of Urine Formation"
      },
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption",
        "label": "OpenStax Anatomy and Physiology 2e: Tubular Reabsorption"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Renal_physiology",
        "label": "Renal physiology (Wikipedia)"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Cursor Grok 4.6",
        "kind": "generative"
      },
      {
        "name": "Claude"
      }
    ]
  },
  "board": {
    "lensFlowTrace": true,
    "sizeFactor": 1.25
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "how-the-kidney-forms-urine",
      "puzzleRevision": "fnv1a32:fd0e0873",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:glomerulus": {
          "x": 513.76,
          "y": 216.78
        },
        "term:filtrate": {
          "x": 611.57,
          "y": 85.29
        },
        "term:Bowman's capsule": {
          "x": 833.79,
          "y": 132.77
        },
        "term:podocyte": {
          "x": 892.64,
          "y": 200.31
        },
        "term:glomerular filtration rate": {
          "x": 895.42,
          "y": 274.38
        },
        "term:net filtration pressure": {
          "x": 474.89,
          "y": 126.66
        },
        "term:afferent arteriole": {
          "x": 746.29,
          "y": 83.46
        },
        "term:glucose": {
          "x": 915.14,
          "y": 544.45
        },
        "term:sodium": {
          "x": 728.38,
          "y": 645.26
        },
        "term:water": {
          "x": 604.19,
          "y": 352.98
        },
        "term:sodium–glucose cotransporter": {
          "x": 875.07,
          "y": 599.65
        },
        "term:transport maximum": {
          "x": 952.66,
          "y": 461.06
        },
        "term:hydrogen ion": {
          "x": 320.64,
          "y": 590.55
        },
        "term:potassium": {
          "x": 262.78,
          "y": 520.98
        },
        "term:ammonium": {
          "x": 271.3,
          "y": 425.71
        },
        "term:penicillin": {
          "x": 352.69,
          "y": 386.95
        },
        "term:nephron": {
          "x": 512.68,
          "y": 409.83
        },
        "term:efferent arteriole": {
          "x": 760.5,
          "y": 334.4
        },
        "term:filtered load": {
          "x": 999.05,
          "y": 386.43
        },
        "term:peritubular capillary": {
          "x": 515.88,
          "y": 536.53
        },
        "term:bicarbonate": {
          "x": 617.33,
          "y": 589.19
        },
        "term:sodium–potassium pump": {
          "x": 144.01,
          "y": 648.08
        },
        "cluster:0": {
          "x": 664.08,
          "y": 167.49
        },
        "cluster:1": {
          "x": 742.35,
          "y": 430.78
        },
        "cluster:2": {
          "x": 390.57,
          "y": 469.08
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-10T14:09:53.107Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "how-the-kidney-forms-urine",
      "puzzleRevision": "fnv1a32:fd0e0873",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 855.65,
          "y": 473.3,
          "pinned": true
        },
        "cluster:1": {
          "x": 549.69,
          "y": 152.48,
          "pinned": true
        },
        "cluster:2": {
          "x": 153.92,
          "y": 525.93,
          "pinned": true
        }
      },
      "bridges": {
        "term:nephron": {
          "x": 532.53,
          "y": 528.5,
          "pinned": true
        },
        "term:efferent arteriole": {
          "x": 770.57,
          "y": 244.64,
          "pinned": true
        },
        "term:filtered load": {
          "x": 946.22,
          "y": 101.83,
          "pinned": true
        },
        "term:peritubular capillary": {
          "x": 319.74,
          "y": 332.19,
          "pinned": true
        },
        "term:bicarbonate": {
          "x": 444.62,
          "y": 404.19,
          "pinned": true
        },
        "term:sodium–potassium pump": {
          "x": 165.19,
          "y": 195.18,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "glomerulus",
          "filtrate",
          "Bowman's capsule",
          "podocyte",
          "glomerular filtration rate",
          "net filtration pressure",
          "afferent arteriole"
        ],
        "cluster:1": [
          "glucose",
          "sodium",
          "water",
          "sodium–glucose cotransporter",
          "transport maximum"
        ],
        "cluster:2": [
          "hydrogen ion",
          "potassium",
          "ammonium",
          "penicillin"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "podocyte",
          "glomerulus",
          "glomerular filtration rate",
          "net filtration pressure",
          "afferent arteriole",
          "Bowman's capsule",
          "filtrate"
        ],
        "cluster:1": [
          "sodium",
          "transport maximum",
          "sodium–glucose cotransporter",
          "glucose",
          "water"
        ],
        "cluster:2": [
          "potassium",
          "hydrogen ion",
          "penicillin",
          "ammonium"
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
        "totalLength": 3145.941260974483
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T14:06:42.688Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "how-the-kidney-forms-urine",
      "puzzleRevision": "fnv1a32:fd0e0873",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:glomerulus": {
          "x": 735.32,
          "y": 376.41,
          "pinned": true
        },
        "term:filtrate": {
          "x": 911.58,
          "y": 338.56,
          "pinned": true
        },
        "term:Bowman's capsule": {
          "x": 947.03,
          "y": 409.39,
          "pinned": true
        },
        "term:podocyte": {
          "x": 746.22,
          "y": 509.14,
          "pinned": true
        },
        "term:glomerular filtration rate": {
          "x": 709.75,
          "y": 224.97,
          "pinned": true
        },
        "term:net filtration pressure": {
          "x": 917.82,
          "y": 505.9,
          "pinned": true
        },
        "term:afferent arteriole": {
          "x": 865.67,
          "y": 269.17,
          "pinned": true
        },
        "term:glucose": {
          "x": 351.07,
          "y": 317.19,
          "pinned": true
        },
        "term:sodium": {
          "x": 174.4,
          "y": 327.82,
          "pinned": true
        },
        "term:water": {
          "x": 489.7,
          "y": 285.16,
          "pinned": true
        },
        "term:sodium–glucose cotransporter": {
          "x": 251.14,
          "y": 215.27,
          "pinned": true
        },
        "term:transport maximum": {
          "x": 457.52,
          "y": 213.65,
          "pinned": true
        },
        "term:hydrogen ion": {
          "x": 230.85,
          "y": 549.1,
          "pinned": false
        },
        "term:potassium": {
          "x": 126.35,
          "y": 595,
          "pinned": false
        },
        "term:ammonium": {
          "x": 309.31,
          "y": 627.63,
          "pinned": false
        },
        "term:penicillin": {
          "x": 201.5,
          "y": 648.98,
          "pinned": true
        },
        "term:nephron": {
          "x": 565.09,
          "y": 484.42,
          "pinned": true
        },
        "term:efferent arteriole": {
          "x": 557.51,
          "y": 367.42,
          "pinned": true
        },
        "term:filtered load": {
          "x": 559.39,
          "y": 88.17,
          "pinned": false
        },
        "term:peritubular capillary": {
          "x": 366.46,
          "y": 469.73,
          "pinned": true
        },
        "term:bicarbonate": {
          "x": 232.42,
          "y": 410.26,
          "pinned": true
        },
        "term:sodium–potassium pump": {
          "x": 94.17,
          "y": 456.11,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4842.21,
        "score": 4842.207254222254
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T04:10:25.771Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-10T04:09:08.192Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
