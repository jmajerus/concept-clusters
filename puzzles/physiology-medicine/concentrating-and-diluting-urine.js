// Generated from content/puzzles/concentrating-and-diluting-urine.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "concentrating-and-diluting-urine",
  "title": "Concentrating and diluting urine",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "renal"
  },
  "info": {
    "text": "The kidney can make urine far more dilute or far more concentrated than plasma. A gradient built in the medulla sets how concentrated urine can become, and a hormone-controlled collecting duct decides how much of that gradient is used.",
    "links": [
      {
        "href": "wiki:Renal physiology"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology (14th ed.), ch. 29: Urine Concentration and Dilution; Regulation of Extracellular Fluid Osmolarity and Sodium Concentration",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2020"
      },
      {
        "title": "Anatomy and Physiology 2e, §25.6 Tubular Reabsorption",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      },
      {
        "title": "Anatomy and Physiology 2e, §26.2 Water Balance",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-2-water-balance"
      }
    ]
  },
  "clusters": [
    {
      "id": "building-the-gradient",
      "name": "Building the medullary gradient",
      "color": "teal",
      "fact": "The thick ascending limb moves sodium and chloride into the medullary interstitium through the Na–K–2Cl cotransporter while staying impermeable to water, and the water-permeable descending limb loses water to that saltier interstitium. Because fluid in the two limbs runs in opposite directions, the modest difference held at each level is multiplied along the loop into a gradient that rises from about 300 mOsm/kg near the cortex to about 1200 at the papillary tip; the long loops of juxtamedullary nephrons reach its deepest part.",
      "terms": [
        "loop of Henle",
        "thick ascending limb",
        "descending limb",
        "Na–K–2Cl cotransporter",
        "juxtamedullary nephron",
        "countercurrent multiplier"
      ],
      "seeds": [
        "loop of Henle",
        "thick ascending limb"
      ],
      "termInfo": {
        "Na–K–2Cl cotransporter": {
          "text": "The luminal carrier of the thick ascending limb that moves one sodium, one potassium, and two chloride ions into the cell together; loop diuretics such as furosemide block it.",
          "links": [
            {
              "href": "wiki:Na–K–Cl cotransporter"
            }
          ]
        },
        "countercurrent multiplier": {
          "text": "The arrangement in which opposite flow in two adjacent limbs multiplies a small side-to-side difference into a large end-to-end gradient; it depends on active salt transport.",
          "links": [
            {
              "href": "wiki:Countercurrent multiplication"
            }
          ]
        },
        "descending limb": {
          "text": "The thin limb of the loop leading down into the medulla; it is permeable to water, so water leaves for the saltier interstitium and the fluid inside grows more concentrated on its way down.",
          "links": [
            {
              "href": "wiki:Descending limb of loop of Henle"
            }
          ]
        },
        "juxtamedullary nephron": "A nephron whose glomerulus lies near the medulla and whose long loop of Henle reaches deep into it; these long loops build the steepest part of the gradient.",
        "loop of Henle": {
          "text": "The hairpin segment of the nephron that dips from the cortex into the medulla and back; its two limbs lie side by side, with fluid flowing in opposite directions.",
          "links": [
            {
              "href": "wiki:Loop of Henle"
            }
          ]
        },
        "thick ascending limb": {
          "text": "The water-tight upper part of the loop's ascending limb, which reabsorbs salt without water; it is often called the diluting segment because the fluid leaving it is more dilute than plasma.",
          "links": [
            {
              "href": "wiki:Ascending limb of loop of Henle"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
          }
        ]
      }
    },
    {
      "id": "preserving-the-gradient",
      "name": "Preserving the gradient",
      "color": "blue",
      "fact": "The vasa recta must carry away the water and salt the loops reabsorb without carrying away the gradient. Countercurrent exchange makes that possible: blood descending into the medulla gains solute and loses water, then returns the solute and regains the water as it climbs back out. Slow medullary blood flow keeps the exchange efficient; faster flow causes medullary washout and weakens the kidney's power to concentrate urine.",
      "terms": [
        "vasa recta",
        "countercurrent exchange",
        "medullary washout"
      ],
      "seeds": [
        "vasa recta",
        "countercurrent exchange"
      ],
      "termInfo": {
        "countercurrent exchange": {
          "text": "Passive transfer between two opposing flows lying side by side; it spends no energy of its own and creates no gradient, but it keeps an existing one from being carried off.",
          "links": [
            {
              "href": "wiki:Countercurrent exchange"
            }
          ]
        },
        "medullary washout": "Loss of the medullary gradient when blood flow through the medulla rises enough to remove solute faster than the loops deposit it.",
        "vasa recta": {
          "text": "Long, straight capillaries that run down beside the loops of Henle and turn back up, supplying the medulla with blood.",
          "links": [
            {
              "href": "wiki:Vasa recta (kidney)"
            }
          ]
        }
      }
    },
    {
      "id": "reclaiming-water",
      "name": "Reclaiming water in the collecting duct",
      "color": "amber",
      "fact": "Antidiuretic hormone binds V2 receptors on the principal cells of the collecting duct. The rise in cyclic AMP that follows moves aquaporin-2 water channels from storage vesicles into the membrane facing the urine, so water leaves the duct for the concentrated medulla around it. With little hormone, the channels are withdrawn and the duct stays nearly impermeable to water.",
      "terms": [
        "collecting duct",
        "aquaporin-2",
        "principal cell",
        "V2 receptor",
        "cyclic AMP"
      ],
      "seeds": [
        "collecting duct",
        "aquaporin-2"
      ],
      "termInfo": {
        "V2 receptor": {
          "text": "The receptor for antidiuretic hormone on collecting-duct cells; inherited defects in it are the most common cause of inherited nephrogenic diabetes insipidus.",
          "links": [
            {
              "href": "wiki:Vasopressin receptor 2"
            }
          ]
        },
        "aquaporin-2": {
          "text": "The water channel that antidiuretic hormone inserts into the urine-facing membrane of collecting-duct cells.",
          "links": [
            {
              "href": "wiki:Aquaporin-2"
            }
          ]
        },
        "collecting duct": {
          "text": "The final stretch of tubule, running from the cortex down through the medulla to the papilla; how much water it gives up decides the concentration of the urine.",
          "links": [
            {
              "href": "wiki:Collecting duct system"
            }
          ]
        },
        "cyclic AMP": {
          "text": "The second messenger made when antidiuretic hormone binds its receptor; it signals the cell to move water channels to its surface.",
          "links": [
            {
              "href": "wiki:Cyclic adenosine monophosphate"
            }
          ]
        },
        "principal cell": "The main cell type lining the collecting duct; it responds to antidiuretic hormone by becoming permeable to water."
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-2-water-balance"
          }
        ]
      }
    },
    {
      "id": "osmoregulation",
      "name": "Osmoregulation",
      "color": "magenta",
      "fact": "Osmoreceptors in the hypothalamus shrink when plasma osmolality rises and swell when it falls. A rise of only a few percent increases firing in the supraoptic nucleus, whose neurons make antidiuretic hormone and release it from their endings in the posterior pituitary; the same rise stimulates thirst. The hormone conserves water already in the body, and thirst brings more in.",
      "terms": [
        "osmoreceptors",
        "thirst",
        "plasma osmolality",
        "supraoptic nucleus",
        "posterior pituitary"
      ],
      "seeds": [
        "osmoreceptors",
        "thirst"
      ],
      "termInfo": {
        "osmoreceptors": {
          "text": "Hypothalamic sensory cells that detect changes in plasma osmolality by shrinking or swelling.",
          "links": [
            {
              "href": "wiki:Osmoreceptor"
            }
          ]
        },
        "plasma osmolality": {
          "text": "The concentration of dissolved particles in plasma, normally held near 290 mOsm/kg; this is the variable the system defends.",
          "links": [
            {
              "href": "wiki:Plasma osmolality"
            }
          ]
        },
        "posterior pituitary": {
          "text": "The lobe of the pituitary that holds the endings of hypothalamic neurons and releases their antidiuretic hormone into the blood; it makes no hormone of its own.",
          "links": [
            {
              "href": "wiki:Posterior pituitary"
            }
          ]
        },
        "supraoptic nucleus": {
          "text": "A cluster of hypothalamic neurons that, with the paraventricular nucleus, make antidiuretic hormone.",
          "links": [
            {
              "href": "wiki:Supraoptic nucleus"
            }
          ]
        },
        "thirst": {
          "text": "The conscious urge to drink, driven mainly by rising plasma osmolality and, less sensitively, by a fall in blood volume.",
          "links": [
            {
              "href": "wiki:Thirst"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "antidiuretic-hormone",
      "term": "antidiuretic hormone",
      "clusters": [
        3,
        2
      ],
      "fact": "Antidiuretic hormone carries the osmoregulatory signal to the kidney: released from the posterior pituitary when plasma osmolality rises, it acts on V2 receptors to make the collecting duct permeable to water, so the urine grows concentrated and the plasma is diluted back toward normal.",
      "info": {
        "text": "Also called vasopressin; a peptide hormone made in the hypothalamus. A large fall in blood volume releases it too, but plasma osmolality is its everyday signal.",
        "links": [
          {
            "href": "wiki:Vasopressin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "posterior pituitary",
        "V2 receptor"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "medullary-osmotic-gradient",
      "term": "medullary osmotic gradient",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "The medullary osmotic gradient is built by the loop of Henle, kept in place by the vasa recta, and used by the collecting duct. Water leaves the duct only until the urine matches the interstitium around it, so the gradient's peak, about 1200 mOsm/kg, sets the most concentrated urine a human kidney can make.",
      "info": "The rise in interstitial osmolality from about 300 mOsm/kg at the border of the cortex to about 1200 at the tip of the papilla.",
      "relationKind": "foundation",
      "idealTerms": [
        "loop of Henle",
        "vasa recta",
        "collecting duct"
      ]
    },
    {
      "id": "urea-recycling",
      "term": "urea recycling",
      "clusters": [
        2,
        0
      ],
      "fact": "Antidiuretic hormone also makes the innermost part of the collecting duct permeable to urea. Urea diffuses into the interstitium, where it supplies 40 to 50 percent of the inner medulla's osmolality during maximal concentration, and part of it re-enters the loop of Henle to return to the duct.",
      "info": "The cycle in which urea leaves the inner medullary collecting duct, adds to the medullary gradient, and re-enters the tubule.",
      "relationKind": "dynamic",
      "idealTerms": [
        "collecting duct",
        "loop of Henle"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "free-water-clearance",
      "term": "free water clearance",
      "clusters": [
        0,
        2
      ],
      "fact": "By removing salt without water, the thick ascending limb leaves solute-free water in the tubule, so fluid reaching the distal tubule is more dilute than plasma. Without antidiuretic hormone the collecting duct lets that water pass, urine osmolality can fall to about 50 mOsm/kg, and free water clearance is positive; with the hormone the water is reclaimed and the clearance turns negative.",
      "info": {
        "text": "The volume of plasma cleared of solute-free water per minute: positive when urine is more dilute than plasma, negative when it is more concentrated.",
        "links": [
          {
            "href": "wiki:Free water clearance"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "thick ascending limb",
        "collecting duct"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "central-diabetes-insipidus",
      "prompt": "Which structures fail to deliver the hormone in central diabetes insipidus?",
      "explanation": "Central diabetes insipidus is a failure of supply. The kidney is normal but receives too little antidiuretic hormone, so the collecting duct stays watertight and large volumes of dilute urine follow. Replacement hormone restores concentrating ability.",
      "targets": [
        "supraoptic nucleus",
        "posterior pituitary"
      ],
      "reasons": {
        "posterior pituitary": "It releases the hormone from the neurons' endings; damage here or to the pituitary stalk cuts off the supply.",
        "supraoptic nucleus": "Its neurons make antidiuretic hormone; when they are destroyed, none is left to release."
      }
    },
    {
      "id": "nephrogenic-diabetes-insipidus",
      "prompt": "Which inherited protein defects cause nephrogenic diabetes insipidus?",
      "explanation": "Nephrogenic diabetes insipidus is a failure of response. Hormone levels are normal or high, but the collecting duct cannot become permeable to water, so replacement hormone does not help. Lithium causes an acquired form by reducing aquaporin-2.",
      "targets": [
        "V2 receptor",
        "aquaporin-2"
      ],
      "reasons": {
        "V2 receptor": "Mutations in its gene account for most inherited cases: the hormone arrives but cannot signal the cell.",
        "aquaporin-2": "Mutations in its gene account for most of the rest: the signal arrives but no working channel reaches the membrane."
      }
    },
    {
      "id": "loop-diuretic-target",
      "prompt": "Which transporter's blockade leaves urine close to the concentration of plasma?",
      "explanation": "Loop diuretics such as furosemide block this cotransporter. The gradient that concentrates urine and the solute-free water that dilutes it both come from the same salt removal, so without it urine can be neither strongly concentrated nor strongly diluted.",
      "targets": [
        "Na–K–2Cl cotransporter"
      ],
      "reasons": {
        "Na–K–2Cl cotransporter": "Blocking it stops salt removal in the thick ascending limb, so the medullary gradient collapses and no dilute fluid is made."
      }
    },
    {
      "id": "concentration-ceiling",
      "prompt": "What sets the highest concentration urine can reach?",
      "explanation": "Antidiuretic hormone decides whether urine approaches that ceiling but cannot raise it. Anything that flattens the gradient, such as medullary washout or a blocked thick ascending limb, lowers the most concentrated urine the kidney can produce.",
      "targets": [
        "medullary osmotic gradient"
      ],
      "reasons": {
        "medullary osmotic gradient": "Water leaves the collecting duct only until the urine matches the interstitium around it, so the gradient's peak is the ceiling."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-the-kidney-forms-urine",
        "reason": "Follows the filtrate from the glomerulus through reabsorption and secretion, up to the point where this lesson sets its final concentration."
      },
      {
        "id": "regulating-arterial-pressure",
        "reason": "Antidiuretic hormone reappears there retaining water to support blood volume, alongside the sodium-balance hormones this lesson leaves aside.",
        "via": [
          "antidiuretic hormone"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the kidney sets urine concentration",
    "summary": "A salt gradient built deep in the kidney sets how concentrated urine can become, and antidiuretic hormone decides how much of that capacity is used.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Plasma osmolality, the concentration of dissolved particles in the blood, stays within a few percent of 290 mOsm/kg whether you drink a liter of water or go a day without. The kidney manages this by changing the concentration of the urine. A healthy human kidney can produce urine as dilute as about 50 mOsm/kg or as concentrated as about 1200, so it can shed excess water or hold water back while still clearing the day's solutes.\r\n\r\n## A gradient in the medulla\r\n\r\nConcentrated urine depends on a gradient in the kidney's inner region, the medulla. The interstitial fluid there rises from about 300 mOsm/kg near the cortex to about 1200 at the tip of the papilla. This medullary osmotic gradient is built by the loop of Henle, the hairpin segment of the nephron that dips into the medulla and returns.\r\n\r\nThe two limbs of the loop behave differently. The descending limb is permeable to water, so water leaves it for the salty interstitium and the fluid inside grows more concentrated on its way down. The thick ascending limb is impermeable to water. Its cells take up sodium, potassium, and chloride from the tubular fluid through the Na–K–2Cl cotransporter and pass sodium and chloride on into the interstitium, leaving the water behind. At any one level, the ascending limb can hold only a modest difference between its fluid and the interstitium. Because fluid flows down one limb and up the other, that small difference is multiplied along the loop's length into the large gradient. This arrangement is the countercurrent multiplier. The long loops of juxtamedullary nephrons, which reach the deepest medulla, build its steepest part.\r\n\r\nUrea supplies much of the rest. When antidiuretic hormone is present, the innermost part of the collecting duct becomes permeable to urea, which diffuses into the interstitium and provides 40 to 50 percent of the inner medulla's osmolality during maximal concentration. Some of that urea re-enters the loop and travels back to the duct, a cycle called urea recycling.\r\n\r\n## Keeping the gradient in place\r\n\r\nThe medulla needs a blood supply, and ordinary capillaries would carry the gradient away. The vasa recta avoid this with the same hairpin shape. Blood flowing down gains solute and loses water; blood flowing back up returns the solute and regains the water. This countercurrent exchange spends no energy and builds no gradient of its own. It removes the water and salt the loops reabsorb while leaving the gradient intact, and it works because medullary blood flow is slow. When flow rises, medullary washout carries solute away and the kidney loses some of its power to concentrate urine.\r\n\r\n## Using the gradient\r\n\r\nThe collecting duct runs from the cortex down through the whole gradient, and its wall decides whether the urine inside is concentrated. Antidiuretic hormone binds V2 receptors on the duct's principal cells and raises cyclic AMP, which moves aquaporin-2 water channels from storage vesicles into the membrane facing the urine. Water then leaves the duct by osmosis until the urine nearly matches the interstitium around it. The peak of the medullary gradient therefore sets the most concentrated urine the kidney can make.\r\n\r\nWithout the hormone, the channels are withdrawn and the duct stays nearly watertight. The dilute fluid leaving the thick ascending limb flows through, and the kidney excretes solute-free water. Free water clearance measures this: the volume of plasma cleared of solute-free water each minute, positive when urine is more dilute than plasma and negative when it is more concentrated. The thick ascending limb is often called the diluting segment, because the salt removal that builds the gradient also makes this dilute fluid.\r\n\r\n## Setting the hormone level\r\n\r\nThe control loop starts with osmoreceptors in the hypothalamus, which shrink as plasma osmolality rises and swell as it falls. A rise of a few percent increases the firing of neurons in the supraoptic nucleus, which make antidiuretic hormone and release it from their endings in the posterior pituitary. The same rise stimulates thirst. The hormone conserves water the body already has, and thirst brings in more. A large drop in blood volume also releases the hormone, but osmolality is its everyday signal.\r\n\r\nTwo disorders separate the halves of this loop. In central diabetes insipidus, the supraoptic neurons or the posterior pituitary fail to deliver the hormone. In nephrogenic diabetes insipidus, the hormone is present but the collecting duct cannot respond, as when the V2 receptor or aquaporin-2 is defective. Both produce large volumes of dilute urine; only the central form responds to replacement hormone."
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
  },
  "board": {
    "bridgePreconnect": true,
    "lensFlowTrace": true
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "concentrating-and-diluting-urine",
      "puzzleRevision": "fnv1a32:cc961c98",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:loop of Henle": {
          "x": 326.47,
          "y": 117.35
        },
        "term:thick ascending limb": {
          "x": 293,
          "y": 480.67
        },
        "term:descending limb": {
          "x": 132.5,
          "y": 443.08
        },
        "term:Na–K–2Cl cotransporter": {
          "x": 100.32,
          "y": 339.25
        },
        "term:juxtamedullary nephron": {
          "x": 104.33,
          "y": 174.77
        },
        "term:countercurrent multiplier": {
          "x": 201.06,
          "y": 57.07
        },
        "term:vasa recta": {
          "x": 680.64,
          "y": 66.09
        },
        "term:countercurrent exchange": {
          "x": 842.88,
          "y": 38.03
        },
        "term:medullary washout": {
          "x": 924.43,
          "y": 114.56
        },
        "term:collecting duct": {
          "x": 572.88,
          "y": 294.28
        },
        "term:aquaporin-2": {
          "x": 811.32,
          "y": 227.81
        },
        "term:principal cell": {
          "x": 934.88,
          "y": 264.62
        },
        "term:V2 receptor": {
          "x": 934.16,
          "y": 527.69
        },
        "term:cyclic AMP": {
          "x": 948.48,
          "y": 423.88
        },
        "term:osmoreceptors": {
          "x": 640.22,
          "y": 619.98
        },
        "term:thirst": {
          "x": 493.87,
          "y": 619.98
        },
        "term:plasma osmolality": {
          "x": 335.96,
          "y": 620.99
        },
        "term:supraoptic nucleus": {
          "x": 172.13,
          "y": 616.98
        },
        "term:posterior pituitary": {
          "x": 610.33,
          "y": 501.36
        },
        "term:antidiuretic hormone": {
          "x": 816.38,
          "y": 597.15
        },
        "term:medullary osmotic gradient": {
          "x": 494.44,
          "y": 29.69
        },
        "term:urea recycling": {
          "x": 429.3,
          "y": 201.6
        },
        "term:free water clearance": {
          "x": 447.14,
          "y": 393.34
        },
        "cluster:0": {
          "x": 276.01,
          "y": 268.22
        },
        "cluster:1": {
          "x": 670.68,
          "y": 156.49
        },
        "cluster:2": {
          "x": 759.93,
          "y": 378.26
        },
        "cluster:3": {
          "x": 433.9,
          "y": 551.49
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-10T03:55:39.129Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "concentrating-and-diluting-urine",
      "puzzleRevision": "fnv1a32:cc961c98",
      "board": {
        "width": 1100,
        "height": 820
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 876.44,
          "y": 396.17,
          "pinned": true
        },
        "cluster:1": {
          "x": 524.9,
          "y": 168.4,
          "pinned": true
        },
        "cluster:2": {
          "x": 545.63,
          "y": 632.68,
          "pinned": true
        },
        "cluster:3": {
          "x": 245.39,
          "y": 384.17,
          "pinned": true
        }
      },
      "bridges": {
        "term:antidiuretic hormone": {
          "x": 317.06,
          "y": 586.33,
          "pinned": false
        },
        "term:medullary osmotic gradient": {
          "x": 551.46,
          "y": 360.87,
          "pinned": true
        },
        "term:urea recycling": {
          "x": 635.86,
          "y": 439.25,
          "pinned": false
        },
        "term:free water clearance": {
          "x": 805.57,
          "y": 608.96,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "loop of Henle",
          "thick ascending limb",
          "descending limb",
          "Na–K–2Cl cotransporter",
          "juxtamedullary nephron",
          "countercurrent multiplier"
        ],
        "cluster:1": [
          "vasa recta",
          "countercurrent exchange",
          "medullary washout"
        ],
        "cluster:2": [
          "collecting duct",
          "aquaporin-2",
          "principal cell",
          "V2 receptor",
          "cyclic AMP"
        ],
        "cluster:3": [
          "osmoreceptors",
          "thirst",
          "plasma osmolality",
          "supraoptic nucleus",
          "posterior pituitary"
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
        "totalLength": 1548.759940644832
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T14:35:18.883Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "concentrating-and-diluting-urine",
      "puzzleRevision": "fnv1a32:cc961c98",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:loop of Henle": {
          "x": 668.74,
          "y": 389.42,
          "pinned": true
        },
        "term:thick ascending limb": {
          "x": 830.17,
          "y": 438.63,
          "pinned": true
        },
        "term:descending limb": {
          "x": 659.92,
          "y": 507.76,
          "pinned": false
        },
        "term:Na–K–2Cl cotransporter": {
          "x": 489.67,
          "y": 447.94,
          "pinned": true
        },
        "term:juxtamedullary nephron": {
          "x": 514.12,
          "y": 580.22,
          "pinned": true
        },
        "term:countercurrent multiplier": {
          "x": 797.53,
          "y": 587.54,
          "pinned": true
        },
        "term:vasa recta": {
          "x": 386.2,
          "y": 291.25,
          "pinned": true
        },
        "term:countercurrent exchange": {
          "x": 289.89,
          "y": 388.89,
          "pinned": true
        },
        "term:medullary washout": {
          "x": 218.34,
          "y": 294.23,
          "pinned": true
        },
        "term:collecting duct": {
          "x": 818.28,
          "y": 148.34,
          "pinned": true
        },
        "term:aquaporin-2": {
          "x": 795.03,
          "y": 39.03,
          "pinned": true
        },
        "term:principal cell": {
          "x": 926.77,
          "y": 41.04,
          "pinned": true
        },
        "term:V2 receptor": {
          "x": 693.92,
          "y": 98.29,
          "pinned": true
        },
        "term:cyclic AMP": {
          "x": 947.48,
          "y": 142.24,
          "pinned": true
        },
        "term:osmoreceptors": {
          "x": 306.4,
          "y": 30.13,
          "pinned": true
        },
        "term:thirst": {
          "x": 423.06,
          "y": 27.01,
          "pinned": true
        },
        "term:plasma osmolality": {
          "x": 202.28,
          "y": 105.31,
          "pinned": true
        },
        "term:supraoptic nucleus": {
          "x": 129.83,
          "y": 31.02,
          "pinned": true
        },
        "term:posterior pituitary": {
          "x": 407.54,
          "y": 144,
          "pinned": true
        },
        "term:antidiuretic hormone": {
          "x": 566.66,
          "y": 31.83,
          "pinned": false
        },
        "term:medullary osmotic gradient": {
          "x": 577.99,
          "y": 221.26,
          "pinned": true
        },
        "term:urea recycling": {
          "x": 743.07,
          "y": 279.02,
          "pinned": true
        },
        "term:free water clearance": {
          "x": 919.99,
          "y": 281.14,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4515.91,
        "score": 4515.909195409925
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-10T03:58:51.704Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-10T03:53:59.978Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
