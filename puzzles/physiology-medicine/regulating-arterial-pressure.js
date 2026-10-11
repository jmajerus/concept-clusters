// Generated from content/puzzles/regulating-arterial-pressure.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "regulating-arterial-pressure",
  "title": "Regulating arterial pressure",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cardiovascular"
  },
  "info": {
    "text": "Mean arterial pressure is set by how much blood the heart pumps and how hard the arterioles resist it. A fast nervous reflex and slower kidney-driven controls adjust both to hold pressure steady.",
    "links": [
      {
        "href": "wiki:Blood pressure"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology (14th ed.)",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2020"
      },
      {
        "title": "Blood pressure control: special role of the kidneys and body fluids",
        "author": "Arthur C. Guyton",
        "publisher": "Science",
        "year": "1991",
        "url": "https://pubmed.ncbi.nlm.nih.gov/2063193/"
      },
      {
        "title": "Cardiac output",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Cardiac_output"
      },
      {
        "title": "Vascular resistance",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Vascular_resistance"
      },
      {
        "title": "Baroreflex",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Baroreflex"
      },
      {
        "title": "Renin–angiotensin system",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Renin%E2%80%93angiotensin_system"
      }
    ]
  },
  "clusters": [
    {
      "id": "cardiac-output",
      "name": "Cardiac output",
      "color": "teal",
      "fact": "Cardiac output is heart rate multiplied by stroke volume. Stroke volume grows with preload, the end-of-filling stretch set largely by venous return, through the Frank–Starling mechanism; it also grows with contractility and shrinks as afterload, the pressure the ventricle must eject against, increases.",
      "terms": [
        "heart rate",
        "preload",
        "afterload",
        "contractility",
        "venous return",
        "Frank–Starling mechanism"
      ],
      "seeds": [
        "heart rate",
        "preload"
      ],
      "termInfo": {
        "Frank–Starling mechanism": {
          "text": "The heart's built-in response to stretch: fuller ventricles contract more forcefully and eject a larger stroke volume.",
          "links": [
            {
              "href": "wiki:Frank–Starling law"
            }
          ]
        },
        "afterload": {
          "text": "The load the ventricle must overcome to eject blood, closely tied to the pressure in the aorta.",
          "links": [
            {
              "href": "wiki:Afterload"
            }
          ]
        },
        "contractility": {
          "text": "The heart muscle's intrinsic strength of contraction at a given stretch, raised by sympathetic stimulation.",
          "links": [
            {
              "href": "wiki:Contractility"
            }
          ]
        },
        "heart rate": {
          "text": "Heartbeats per minute; one of the two factors whose product is cardiac output.",
          "links": [
            {
              "href": "wiki:Heart rate"
            }
          ]
        },
        "preload": {
          "text": "The stretch of ventricular muscle at the end of filling, usually indexed by end-diastolic volume.",
          "links": [
            {
              "href": "wiki:Preload (cardiology)"
            }
          ]
        },
        "venous return": {
          "text": "The rate at which blood flows back to the heart through the veins; at steady state it equals cardiac output.",
          "links": [
            {
              "href": "wiki:Venous return"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cardiac output"
          }
        ]
      }
    },
    {
      "id": "peripheral-resistance",
      "name": "Peripheral resistance",
      "color": "blue",
      "fact": "Resistance to flow through the systemic circulation is set mainly by the arterioles. Poiseuille's law shows why: resistance rises with blood viscosity and vessel length but falls with the fourth power of vessel radius, so small changes in arteriolar diameter produce large changes in resistance.",
      "terms": [
        "arterioles",
        "vessel radius",
        "blood viscosity",
        "vessel length",
        "Poiseuille's law"
      ],
      "seeds": [
        "arterioles",
        "vessel radius"
      ],
      "termInfo": {
        "Poiseuille's law": {
          "text": "The relation for steady flow through a tube: resistance is proportional to viscosity times length, divided by the radius raised to the fourth power.",
          "links": [
            {
              "href": "wiki:Hagen–Poiseuille equation"
            }
          ]
        },
        "arterioles": {
          "text": "Small muscular arteries whose smooth muscle sets most of the body's vascular resistance; physiologists call them resistance vessels.",
          "links": [
            {
              "href": "wiki:Arteriole"
            }
          ]
        },
        "blood viscosity": {
          "text": "Blood's internal friction, determined mostly by the proportion of red cells, the hematocrit.",
          "links": [
            {
              "href": "wiki:Hemorheology"
            }
          ]
        },
        "vessel length": "Longer vessels resist flow more, but vessel length stays essentially fixed in an adult, so the body never uses it to regulate pressure.",
        "vessel radius": "The dominant variable in resistance: halving a vessel's radius raises its resistance about sixteenfold."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Vascular resistance"
          }
        ]
      }
    },
    {
      "id": "baroreceptor-reflex",
      "name": "Baroreceptor reflex",
      "color": "amber",
      "fact": "Stretch receptors in the carotid sinus and aortic arch fire faster as arterial pressure rises. Within seconds the medullary cardiovascular center responds by increasing vagal outflow and reducing sympathetic outflow, and it reverses that pattern when pressure falls. The reflex buffers moment-to-moment swings, but over a few days it resets to whatever pressure persists.",
      "terms": [
        "carotid sinus",
        "sympathetic outflow",
        "aortic arch",
        "medullary cardiovascular center",
        "vagal outflow"
      ],
      "seeds": [
        "carotid sinus",
        "sympathetic outflow"
      ],
      "termInfo": {
        "aortic arch": {
          "text": "The curve of the aorta above the heart, a second baroreceptor site whose signals travel in the vagus nerve.",
          "links": [
            {
              "href": "wiki:Baroreceptor"
            }
          ]
        },
        "carotid sinus": {
          "text": "A widening at the base of the internal carotid artery whose wall holds stretch-sensitive baroreceptors; its signals travel in the glossopharyngeal nerve.",
          "links": [
            {
              "href": "wiki:Carotid sinus"
            }
          ]
        },
        "medullary cardiovascular center": {
          "text": "The network in the brainstem's medulla that integrates baroreceptor input and sets autonomic output to the heart and vessels.",
          "links": [
            {
              "href": "wiki:Cardiovascular centre"
            }
          ]
        },
        "sympathetic outflow": {
          "text": "Sympathetic nerve activity to the heart and blood vessels, which raises heart rate, contractility, and arteriolar tone.",
          "links": [
            {
              "href": "wiki:Sympathetic nervous system"
            }
          ]
        },
        "vagal outflow": {
          "text": "Parasympathetic activity carried to the heart by the vagus nerve, which slows the heart rate.",
          "links": [
            {
              "href": "wiki:Vagus nerve"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Baroreflex"
          }
        ]
      }
    },
    {
      "id": "volume-control",
      "name": "Long-term volume control",
      "color": "magenta",
      "fact": "Over hours to days, arterial pressure depends on how much salt and water the kidneys keep. Reduced kidney perfusion releases renin, which ultimately raises aldosterone and sodium retention; antidiuretic hormone retains water; atrial natriuretic peptide, released when the atria are stretched, promotes sodium loss; and pressure natriuresis lets the kidneys excrete more salt and water whenever arterial pressure rises.",
      "terms": [
        "renin",
        "aldosterone",
        "antidiuretic hormone",
        "atrial natriuretic peptide",
        "pressure natriuresis"
      ],
      "seeds": [
        "renin",
        "aldosterone"
      ],
      "termInfo": {
        "aldosterone": {
          "text": "An adrenal-cortex hormone that makes the kidney retain sodium, and with it water.",
          "links": [
            {
              "href": "wiki:Aldosterone"
            }
          ]
        },
        "antidiuretic hormone": {
          "text": "Also called vasopressin; released by the posterior pituitary when plasma grows concentrated or blood volume falls, it makes the kidney retain water.",
          "links": [
            {
              "href": "wiki:Vasopressin"
            }
          ]
        },
        "atrial natriuretic peptide": {
          "text": "A hormone released by stretched atrial muscle that promotes sodium and water excretion and relaxes blood vessels.",
          "links": [
            {
              "href": "wiki:Atrial natriuretic peptide"
            }
          ]
        },
        "pressure natriuresis": {
          "text": "The kidney's direct response to higher arterial pressure: it excretes more sodium and water, shrinking blood volume back toward its set level.",
          "links": [
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/2063193/",
              "label": "Guyton, \"Blood pressure control: special role of the kidneys and body fluids\" (Science, 1991)"
            }
          ]
        },
        "renin": {
          "text": "An enzyme released by the kidney's juxtaglomerular cells when renal perfusion pressure or sodium delivery falls, or when sympathetic nerves stimulate them.",
          "links": [
            {
              "href": "wiki:Renin"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Renin–angiotensin system"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "mean-arterial-pressure",
      "term": "mean arterial pressure",
      "clusters": [
        0,
        1
      ],
      "fact": "Mean arterial pressure is approximately cardiac output multiplied by total peripheral resistance, so any lasting change in pressure must come through one factor or the other.",
      "info": {
        "text": "The average pressure in the arteries over one heartbeat, the quantity the body's pressure controls defend.",
        "links": [
          {
            "href": "wiki:Mean arterial pressure"
          }
        ]
      }
    },
    {
      "id": "sinoatrial-node",
      "term": "sinoatrial node",
      "clusters": [
        2,
        0
      ],
      "fact": "The sinoatrial node is where the baroreceptor reflex adjusts heart rate: sympathetic norepinephrine speeds its pacemaker firing, and vagal acetylcholine slows it.",
      "info": {
        "text": "The heart's natural pacemaker, a patch of specialized muscle in the wall of the right atrium.",
        "links": [
          {
            "href": "wiki:Sinoatrial node"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "heart rate"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "norepinephrine",
      "term": "norepinephrine",
      "clusters": [
        2,
        1
      ],
      "fact": "Norepinephrine released from sympathetic nerve endings acts on α1-adrenergic receptors in arteriolar smooth muscle, constricting the vessels and raising peripheral resistance.",
      "info": {
        "text": "The main neurotransmitter released by sympathetic nerves onto the heart and blood vessels.",
        "links": [
          {
            "href": "wiki:Norepinephrine"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "sympathetic outflow",
        "arterioles"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "angiotensin-ii",
      "term": "angiotensin II",
      "clusters": [
        3,
        1
      ],
      "fact": "Renin starts the cascade that produces angiotensin II, which constricts arterioles directly and also stimulates aldosterone release, so one hormone raises pressure through resistance and through salt retention at once.",
      "info": {
        "text": "A peptide hormone formed when angiotensin-converting enzyme, found mostly in the lungs, cleaves angiotensin I.",
        "links": [
          {
            "href": "wiki:Angiotensin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "renin",
        "arterioles"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    },
    {
      "id": "blood-volume",
      "term": "blood volume",
      "clusters": [
        3,
        0
      ],
      "fact": "Retaining salt and water expands blood volume, which increases venous return and preload and so raises cardiac output; losing salt and water does the reverse.",
      "info": {
        "text": "The total volume of plasma and cells in the circulation, about five liters in an adult.",
        "links": [
          {
            "href": "wiki:Blood volume"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "venous return"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "stroke-volume-variables",
      "prompt": "Which three variables directly set stroke volume?",
      "explanation": "Stroke volume rises with preload and contractility and falls with afterload. Heart rate is the other factor of cardiac output and leaves stroke volume as it is; venous return acts only through preload; the Frank–Starling mechanism is the way preload works.",
      "targets": [
        "preload",
        "afterload",
        "contractility"
      ],
      "reasons": {
        "afterload": "A higher pressure to eject against leaves less blood ejected per beat.",
        "contractility": "A stronger contraction at the same stretch empties the ventricle further.",
        "preload": "More stretch at the end of filling produces a stronger contraction and a larger ejection."
      }
    },
    {
      "id": "sympathetic-targets",
      "prompt": "Which structures do sympathetic nerves act on to raise arterial pressure?",
      "explanation": "Sympathetic nerves raise pressure through both factors at once: faster pacemaker firing adds output, and narrower arterioles add resistance. The carotid sinus and aortic arch are sensors feeding the reflex, and the medullary center is where the sympathetic command begins.",
      "targets": [
        "sinoatrial node",
        "arterioles"
      ],
      "reasons": {
        "arterioles": "Norepinephrine constricts arteriolar smooth muscle, raising peripheral resistance.",
        "sinoatrial node": "Norepinephrine speeds the pacemaker, raising heart rate and cardiac output."
      }
    },
    {
      "id": "shedding-salt-and-water",
      "prompt": "Which controls lower arterial pressure by shedding salt and water?",
      "explanation": "Both reduce blood volume when it runs high. Renin, aldosterone, and antidiuretic hormone push the opposite way, retaining salt or water to raise volume and pressure.",
      "targets": [
        "atrial natriuretic peptide",
        "pressure natriuresis"
      ],
      "reasons": {
        "atrial natriuretic peptide": "Stretched atria release it when volume is high, and it makes the kidney excrete sodium and water.",
        "pressure natriuresis": "Higher arterial pressure itself drives the kidney to excrete more sodium and water."
      }
    },
    {
      "id": "arteriolar-constriction",
      "prompt": "Which quantities rise as soon as the arterioles constrict?",
      "explanation": "Narrowing the arterioles shrinks vessel radius and raises resistance, so pressure climbs. The same climb raises afterload, which on its own trims stroke volume, so output and resistance are coupled rather than fully independent levers.",
      "targets": [
        "mean arterial pressure",
        "afterload"
      ],
      "reasons": {
        "afterload": "The left ventricle now ejects against a higher aortic pressure.",
        "mean arterial pressure": "With cardiac output unchanged, higher resistance means higher pressure."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body sets and defends arterial pressure",
    "summary": "How cardiac output and peripheral resistance set mean arterial pressure, and how fast nerves and slow kidneys hold it steady.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Arterial pressure is under constant correction. Standing up, exercising, losing blood, or eating a salty meal all push it away from its usual level, and several control systems pull it back. This lesson explains what determines mean arterial pressure and how the body defends it, over seconds and over days.\r\n\r\n## The governing relation\r\n\r\n**Mean arterial pressure** is the average pressure in the large arteries across one heartbeat. It is approximately the product of two quantities: how much blood the heart pumps per minute (**cardiac output**) and how strongly the systemic vessels resist that flow (**total peripheral resistance**). Every lasting change in pressure works through one of those two factors.\r\n\r\n## What sets cardiac output\r\n\r\nCardiac output equals **heart rate** times stroke volume, the amount each ventricle ejects per beat. Three variables set stroke volume. **Preload** is the stretch of the ventricle at the end of filling; through the **Frank–Starling mechanism**, a fuller ventricle contracts more forcefully. Preload depends largely on **venous return**, the flow of blood back to the heart through the veins. **Contractility** is the muscle's strength of contraction at a given stretch, and sympathetic stimulation increases it. **Afterload** is the pressure the ventricle must push against to eject blood; raising it trims stroke volume.\r\n\r\n## What sets peripheral resistance\r\n\r\n**Poiseuille's law** describes steady flow through a tube: resistance rises in proportion to **blood viscosity** and **vessel length** and falls with the fourth power of **vessel radius**. Viscosity changes slowly with the fraction of blood made up of red cells, and vessel length is fixed in an adult, so radius is the working lever. The **arterioles**, small arteries wrapped in smooth muscle, account for most systemic resistance. Halving an arteriole's radius raises its resistance about sixteenfold.\r\n\r\n## Fast control: the baroreceptor reflex\r\n\r\nStretch receptors in the **carotid sinus** and the **aortic arch** fire in proportion to arterial pressure. Their signals reach the **medullary cardiovascular center** in the brainstem, which adjusts two outputs in opposite directions. When pressure falls, **sympathetic outflow** rises and **vagal outflow** falls. Both changes speed the **sinoatrial node**, the heart's pacemaker. Sympathetic nerves also strengthen contraction and release **norepinephrine** onto arteriolar smooth muscle, constricting those vessels and raising resistance. A rise in pressure produces the opposite pattern.\r\n\r\nThe reflex acts within seconds, but over a few days it resets to whatever pressure persists. It buffers sudden swings; it cannot by itself fix the long-term level.\r\n\r\n## Slow control: blood volume and the kidneys\r\n\r\nOver hours to days, pressure follows **blood volume**, and blood volume follows how much salt and water the kidneys keep. When kidney perfusion falls, the kidney releases **renin**, an enzyme that starts the cascade producing **angiotensin II**. Angiotensin II constricts arterioles directly and stimulates release of **aldosterone**, which makes the kidney retain sodium and, with it, water. **Antidiuretic hormone**, also called vasopressin, makes the kidney retain water.\r\n\r\nTwo mechanisms push the other way. **Atrial natriuretic peptide** is released when excess volume stretches the atria, and it promotes sodium and water loss. **Pressure natriuresis** is the kidney's direct tendency to excrete more salt and water as arterial pressure rises. Added volume raises venous return and preload, and so cardiac output; lost volume lowers them.\r\n\r\n## How the pieces fit\r\n\r\nEvery control acts through the same two factors. The reflex changes heart rate, contractility, and arteriolar radius within seconds. The kidneys change blood volume, which feeds cardiac output, while angiotensin II also tightens the arterioles. Because the reflex resets and the kidneys' salt-and-water balance keeps correcting until pressure returns to its set level, the account developed by Arthur Guyton, and taught in most physiology textbooks, treats the kidneys as the long-term setter of arterial pressure."
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
  },
  "board": {
    "lensFlowTrace": true
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "regulating-arterial-pressure",
      "puzzleRevision": "fnv1a32:422b3f7b",
      "board": {
        "width": 1070,
        "height": 690
      },
      "nodes": {
        "term:heart rate": {
          "x": 115.69,
          "y": 187.71
        },
        "term:preload": {
          "x": 269.31,
          "y": 110.7
        },
        "term:afterload": {
          "x": 288.83,
          "y": 34.01
        },
        "term:contractility": {
          "x": 471.19,
          "y": 35.01
        },
        "term:venous return": {
          "x": 435.93,
          "y": 186.78
        },
        "term:Frank–Starling mechanism": {
          "x": 655.68,
          "y": 32.01
        },
        "term:arterioles": {
          "x": 799.53,
          "y": 281.45
        },
        "term:vessel radius": {
          "x": 776.76,
          "y": 75.07
        },
        "term:blood viscosity": {
          "x": 992.53,
          "y": 238.48
        },
        "term:vessel length": {
          "x": 932.98,
          "y": 77.3
        },
        "term:Poiseuille's law": {
          "x": 942.44,
          "y": 306.47
        },
        "term:carotid sinus": {
          "x": 420.46,
          "y": 546.38
        },
        "term:sympathetic outflow": {
          "x": 757.34,
          "y": 561.13
        },
        "term:aortic arch": {
          "x": 557.04,
          "y": 503.07
        },
        "term:medullary cardiovascular center": {
          "x": 747.61,
          "y": 656.99
        },
        "term:vagal outflow": {
          "x": 707.32,
          "y": 507.38
        },
        "term:renin": {
          "x": 569.21,
          "y": 343.09
        },
        "term:aldosterone": {
          "x": 362.39,
          "y": 270.25
        },
        "term:antidiuretic hormone": {
          "x": 248.16,
          "y": 442.66
        },
        "term:atrial natriuretic peptide": {
          "x": 470.5,
          "y": 442.76
        },
        "term:pressure natriuresis": {
          "x": 239.79,
          "y": 312.51
        },
        "term:mean arterial pressure": {
          "x": 693.32,
          "y": 228.81
        },
        "term:sinoatrial node": {
          "x": 117.42,
          "y": 604.63
        },
        "term:norepinephrine": {
          "x": 986.48,
          "y": 488.16
        },
        "term:angiotensin II": {
          "x": 709.4,
          "y": 396.49
        },
        "term:blood volume": {
          "x": 538.6,
          "y": 270.26
        },
        "cluster:0": {
          "x": 524.98,
          "y": 119.11
        },
        "cluster:1": {
          "x": 854.27,
          "y": 150.12
        },
        "cluster:2": {
          "x": 561.99,
          "y": 605.63
        },
        "cluster:3": {
          "x": 395.92,
          "y": 375.09
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-09T20:21:55.627Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "regulating-arterial-pressure",
      "puzzleRevision": "fnv1a32:422b3f7b",
      "board": {
        "width": 1170,
        "height": 870
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 612.95,
          "y": 647.83,
          "pinned": true
        },
        "cluster:1": {
          "x": 591.98,
          "y": 196.24,
          "pinned": true
        },
        "cluster:2": {
          "x": 240.66,
          "y": 437.01,
          "pinned": true
        },
        "cluster:3": {
          "x": 950.31,
          "y": 351.16,
          "pinned": true
        }
      },
      "bridges": {
        "term:mean arterial pressure": {
          "x": 603.97,
          "y": 445,
          "pinned": true
        },
        "term:sinoatrial node": {
          "x": 364.75,
          "y": 640.92,
          "pinned": true
        },
        "term:norepinephrine": {
          "x": 361.75,
          "y": 256.06,
          "pinned": true
        },
        "term:angiotensin II": {
          "x": 682.55,
          "y": 368.78,
          "pinned": true
        },
        "term:blood volume": {
          "x": 921.05,
          "y": 579.02,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "heart rate",
          "preload",
          "afterload",
          "contractility",
          "venous return",
          "Frank–Starling mechanism"
        ],
        "cluster:1": [
          "arterioles",
          "vessel radius",
          "blood viscosity",
          "vessel length",
          "Poiseuille's law"
        ],
        "cluster:2": [
          "carotid sinus",
          "sympathetic outflow",
          "aortic arch",
          "medullary cardiovascular center",
          "vagal outflow"
        ],
        "cluster:3": [
          "renin",
          "aldosterone",
          "antidiuretic hormone",
          "atrial natriuretic peptide",
          "pressure natriuresis"
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
        "totalLength": 1500.4195912026194
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T20:29:33.040Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "regulating-arterial-pressure",
      "puzzleRevision": "fnv1a32:422b3f7b",
      "board": {
        "width": 1070,
        "height": 690
      },
      "nodes": {
        "term:heart rate": {
          "x": 368.71,
          "y": 553.55,
          "pinned": true
        },
        "term:preload": {
          "x": 255.92,
          "y": 498.09,
          "pinned": true
        },
        "term:afterload": {
          "x": 543.4,
          "y": 662,
          "pinned": true
        },
        "term:contractility": {
          "x": 402.01,
          "y": 660.99,
          "pinned": true
        },
        "term:venous return": {
          "x": 523.68,
          "y": 562.46,
          "pinned": true
        },
        "term:Frank–Starling mechanism": {
          "x": 240.59,
          "y": 639.85,
          "pinned": true
        },
        "term:arterioles": {
          "x": 635.59,
          "y": 239.61,
          "pinned": true
        },
        "term:vessel radius": {
          "x": 771.73,
          "y": 188.83,
          "pinned": true
        },
        "term:blood viscosity": {
          "x": 537.24,
          "y": 159.1,
          "pinned": false
        },
        "term:vessel length": {
          "x": 738.95,
          "y": 123.47,
          "pinned": true
        },
        "term:Poiseuille's law": {
          "x": 635.62,
          "y": 66.97,
          "pinned": true
        },
        "term:carotid sinus": {
          "x": 341.1,
          "y": 303.63,
          "pinned": false
        },
        "term:sympathetic outflow": {
          "x": 381.81,
          "y": 160.51,
          "pinned": false
        },
        "term:aortic arch": {
          "x": 251.95,
          "y": 392.69,
          "pinned": true
        },
        "term:medullary cardiovascular center": {
          "x": 155.09,
          "y": 228.5,
          "pinned": true
        },
        "term:vagal outflow": {
          "x": 241.85,
          "y": 108.87,
          "pinned": true
        },
        "term:renin": {
          "x": 800.7,
          "y": 377.88,
          "pinned": false
        },
        "term:aldosterone": {
          "x": 693.12,
          "y": 461.44,
          "pinned": true
        },
        "term:antidiuretic hormone": {
          "x": 871.65,
          "y": 267.05,
          "pinned": true
        },
        "term:atrial natriuretic peptide": {
          "x": 940.78,
          "y": 417.75,
          "pinned": false
        },
        "term:pressure natriuresis": {
          "x": 873.25,
          "y": 535.89,
          "pinned": true
        },
        "term:mean arterial pressure": {
          "x": 562.15,
          "y": 416.64,
          "pinned": false
        },
        "term:sinoatrial node": {
          "x": 397.95,
          "y": 427.39,
          "pinned": false
        },
        "term:norepinephrine": {
          "x": 472.44,
          "y": 282.46,
          "pinned": false
        },
        "term:angiotensin II": {
          "x": 696.89,
          "y": 327.6,
          "pinned": true
        },
        "term:blood volume": {
          "x": 716.2,
          "y": 563.78,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4825.65,
        "score": 4825.646983318994
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T20:26:31.121Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-09T20:17:37.329Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
