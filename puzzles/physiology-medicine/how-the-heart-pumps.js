// Generated from content/puzzles/how-the-heart-pumps.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "how-the-heart-pumps",
  "title": "The cardiac cycle",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cardiovascular"
  },
  "info": {
    "text": "One heartbeat traced through the left ventricle: the pressure-driven phases of the cycle, the volumes they move, the valves that bound them, and the sounds those valves make.",
    "links": [
      {
        "href": "wiki:Cardiac cycle"
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
        "title": "Anatomy and Physiology 2e — 19.3 Cardiac Cycle",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-3-cardiac-cycle"
      }
    ]
  },
  "clusters": [
    {
      "id": "cycle-phases",
      "name": "Phases of the cycle",
      "color": "teal",
      "fact": "Ventricular systole opens with isovolumic contraction and continues as ejection. Diastole opens with isovolumic relaxation, moves into rapid filling, and ends as atrial contraction tops up the ventricle.",
      "terms": [
        "ejection",
        "rapid filling",
        "isovolumic contraction",
        "isovolumic relaxation",
        "atrial contraction"
      ],
      "seeds": [
        "ejection",
        "rapid filling"
      ],
      "termInfo": {
        "atrial contraction": "The atria's contraction at the very end of diastole, adding roughly the last 20 percent of ventricular filling; sometimes called the atrial kick.",
        "ejection": "The phase when the outlet valves stand open and blood leaves the ventricle; about 70 percent of the stroke leaves in its first third.",
        "isovolumic contraction": {
          "text": "The opening phase of systole: the ventricle contracts and its pressure climbs steeply while its volume stays fixed. Also called isovolumetric contraction.",
          "links": [
            {
              "href": "wiki:Isovolumetric contraction"
            }
          ]
        },
        "isovolumic relaxation": {
          "text": "The opening phase of diastole: the ventricle relaxes and its pressure falls steeply while its volume stays fixed. Also called isovolumetric relaxation.",
          "links": [
            {
              "href": "wiki:Isovolumic relaxation time"
            }
          ]
        },
        "rapid filling": "The first third of diastole, when blood that collected in the atria during systole rushes into the ventricle."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cardiac cycle"
          }
        ]
      }
    },
    {
      "id": "ventricular-volumes",
      "name": "Ventricular volumes",
      "color": "amber",
      "fact": "The ventricle finishes filling at its end-diastolic volume, ejects a stroke volume, and keeps an end-systolic volume. Ejection fraction is the share of the end-diastolic volume ejected, about 60 percent at rest.",
      "terms": [
        "end-diastolic volume",
        "stroke volume",
        "end-systolic volume",
        "ejection fraction"
      ],
      "seeds": [
        "end-diastolic volume",
        "stroke volume"
      ],
      "termInfo": {
        "ejection fraction": {
          "text": "The share of the filled ventricle's blood that leaves in one beat, normally about 60 percent; the standard clinical measure of how fully the ventricle empties.",
          "links": [
            {
              "href": "wiki:Ejection fraction"
            }
          ]
        },
        "end-diastolic volume": {
          "text": "The blood in the ventricle at the end of filling, about 110–120 mL at rest; it is the usual index of preload.",
          "links": [
            {
              "href": "wiki:End-diastolic volume"
            }
          ]
        },
        "end-systolic volume": {
          "text": "The blood left in the ventricle after ejection, about 40–50 mL at rest.",
          "links": [
            {
              "href": "wiki:End-systolic volume"
            }
          ]
        },
        "stroke volume": "The blood ejected in one beat, about 70 mL at rest: end-diastolic volume minus end-systolic volume."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Stroke volume"
          }
        ]
      }
    },
    {
      "id": "heart-valves",
      "name": "Heart valves",
      "color": "blue",
      "fact": "Atrioventricular valves guard the ventricle's inlets and semilunar valves its outlets. All of them open and close passively with pressure, while papillary muscles keep the atrioventricular leaflets from bulging back into the atria during contraction.",
      "terms": [
        "atrioventricular valves",
        "semilunar valves",
        "papillary muscles"
      ],
      "seeds": [
        "atrioventricular valves",
        "semilunar valves"
      ],
      "termInfo": {
        "atrioventricular valves": {
          "text": "The mitral valve on the left and the tricuspid valve on the right, between each atrium and its ventricle.",
          "links": [
            {
              "href": "wiki:Mitral valve"
            }
          ]
        },
        "papillary muscles": {
          "text": "Muscles projecting from the ventricular wall, tethered to the atrioventricular leaflets by the chordae tendineae. They contract along with the ventricle but play no part in closing the valve.",
          "links": [
            {
              "href": "wiki:Papillary muscle"
            }
          ]
        },
        "semilunar valves": {
          "text": "The aortic and pulmonary valves at the ventricular outlets; their small openings make blood leave at high velocity.",
          "links": [
            {
              "href": "wiki:Aortic valve"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Heart valve"
          }
        ]
      }
    },
    {
      "id": "heart-sounds",
      "name": "Heart sounds",
      "color": "magenta",
      "fact": "The first and second heart sounds come from closure of the atrioventricular and semilunar valves. The fainter third and fourth sounds belong to the ventricle's filling: the inrush of rapid filling and the push of atrial contraction.",
      "terms": [
        "first heart sound",
        "second heart sound",
        "third heart sound",
        "fourth heart sound"
      ],
      "seeds": [
        "first heart sound",
        "second heart sound"
      ],
      "termInfo": {
        "first heart sound": "The low, slightly longer “lub” heard as ventricular contraction begins.",
        "fourth heart sound": {
          "text": "A faint sound just before the first heart sound, as the atria contract. It is usually too weak to hear with a stethoscope, so an audible one generally points to a stiff ventricle.",
          "links": [
            {
              "href": "wiki:Fourth heart sound"
            }
          ]
        },
        "second heart sound": "The sharper “dub” heard as ejection ends.",
        "third heart sound": {
          "text": "A faint, low sound early in diastole as inrushing blood sets the ventricular walls vibrating. It can be normal in children and young adults; later in life it can signal heart failure.",
          "links": [
            {
              "href": "wiki:Third heart sound"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Heart sounds"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "pressure-gradient",
      "term": "pressure gradient",
      "clusters": [
        0,
        2
      ],
      "fact": "Every boundary between phases is a valve opening or closing as the pressure gradient across it reverses. During the two isovolumic phases, the gradients hold both valve sets shut at once.",
      "info": {
        "text": "A difference in pressure that moves blood from the higher-pressure side to the lower.",
        "links": [
          {
            "href": "wiki:Pressure gradient"
          }
        ]
      },
      "relationKind": "dynamic"
    },
    {
      "id": "valve-closure",
      "term": "valve closure",
      "clusters": [
        2,
        3
      ],
      "fact": "Closure of the atrioventricular valves produces the first heart sound, and closure of the semilunar valves the second: the taut leaflets and the blood around them vibrate as each set snaps shut.",
      "info": "The moment a valve's leaflets meet and seal; the heart's main sounds come from the vibration that follows.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "pressure-volume-loop",
      "term": "pressure–volume loop",
      "clusters": [
        0,
        1
      ],
      "fact": "Plotting ventricular pressure against volume through one beat traces a closed loop: the isovolumic phases are its vertical sides, ejection its top, and filling its bottom, and its width is the stroke volume.",
      "info": {
        "text": "A graph of left ventricular pressure against volume over one beat; Guyton calls it the volume–pressure diagram.",
        "links": [
          {
            "href": "wiki:Pressure–volume loop analysis in cardiology"
          }
        ]
      },
      "idealTerms": [
        null,
        "stroke volume"
      ]
    }
  ],
  "lenses": [
    {
      "id": "ejection-fraction-ratio",
      "prompt": "Which volumes does ejection fraction compare?",
      "explanation": "Ejection fraction is stroke volume divided by end-diastolic volume: the share of the filled ventricle's blood that leaves in one beat. End-systolic volume is the remainder left behind.",
      "targets": [
        "stroke volume",
        "end-diastolic volume"
      ],
      "reasons": {
        "end-diastolic volume": "The denominator: the blood present when contraction begins.",
        "stroke volume": "The numerator: the blood ejected in one beat."
      }
    },
    {
      "id": "filling-phases",
      "prompt": "Which phases add blood to the ventricle?",
      "explanation": "Blood enters only while the atrioventricular valves stand open, first in a passive rush and then with the atria's final push. Ejection removes blood, and the two isovolumic phases hold volume fixed.",
      "targets": [
        "rapid filling",
        "atrial contraction"
      ],
      "reasons": {
        "atrial contraction": "The atria contract at the end of diastole and push in the last of the filling.",
        "rapid filling": "Blood stored in the atria during systole pours in as the atrioventricular valves open."
      }
    },
    {
      "id": "every-valve-closed",
      "prompt": "Which phases pass with every valve closed?",
      "explanation": "A ventricle can change its pressure without changing its volume only while no valve is open. That fixed volume is what gives these two phases their name.",
      "targets": [
        "isovolumic contraction",
        "isovolumic relaxation"
      ],
      "reasons": {
        "isovolumic contraction": "Rising pressure has closed the atrioventricular valves but has yet to open the semilunar valves.",
        "isovolumic relaxation": "Falling pressure has closed the semilunar valves but has yet to open the atrioventricular valves."
      }
    },
    {
      "id": "filling-sounds",
      "prompt": "Which heart sounds belong to ventricular filling?",
      "explanation": "The first and second sounds mark valve closures as systole begins and as ejection ends. The third and fourth come from blood entering the ventricle.",
      "targets": [
        "third heart sound",
        "fourth heart sound"
      ],
      "reasons": {
        "fourth heart sound": "Atrial contraction drives the last of the filling into the ventricle.",
        "third heart sound": "Inrushing blood during rapid filling sets the ventricular walls vibrating."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "regulating-arterial-pressure",
        "reason": "See what sets the stroke volume ejected here, and how heart rate turns it into cardiac output."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One heartbeat, start to finish",
    "summary": "How pressure, valves, volume, and sound change together as the left ventricle fills and empties in one beat.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Each heartbeat repeats the same sequence of events, and every event follows from pressure. Blood moves from higher pressure to lower, the valves open and close passively as those pressures cross, and the sounds heard through a stethoscope come from the valves closing. This lesson follows the left ventricle through one beat.\r\n\r\n## Pressure drives the valves\r\n\r\nThe heart's valves have no muscle of their own. Each one opens when the **pressure gradient** across it pushes blood forward and closes when that gradient reverses. The **atrioventricular valves** (the mitral valve on the left, the tricuspid on the right) sit between the atria and the ventricles. The **semilunar valves** (the aortic and pulmonary valves) guard the exits into the great arteries. When the ventricle contracts, the **papillary muscles** in its wall contract with it. Through cords tethered to the atrioventricular leaflets, they keep those leaflets from bulging back into the atria; closing the valve is left to pressure.\r\n\r\n## The phases\r\n\r\nVentricular contraction, or systole, begins with **isovolumic contraction**. Ventricular pressure rises above atrial pressure and closes the atrioventricular valves, but it has yet to pass aortic pressure, so the semilunar valves stay shut too. With every valve closed, the ventricle squeezes a fixed volume of blood and its pressure climbs steeply. Once that pressure exceeds aortic pressure, the aortic valve opens and **ejection** begins; most of the stroke leaves in the first third of this phase.\r\n\r\nRelaxation, or diastole, mirrors this. As ventricular pressure falls below aortic pressure, the aortic valve closes, and **isovolumic relaxation** follows with both valve sets shut again. When ventricular pressure drops below atrial pressure, the mitral valve opens and **rapid filling** carries in the blood that collected in the atria during systole. Inflow slows through mid-diastole, and **atrial contraction** at the end adds roughly the last 20 percent.\r\n\r\n## The volumes\r\n\r\nThe blood in the ventricle at the end of filling is the **end-diastolic volume**, about 110 to 120 mL in a resting adult. Ejection removes the **stroke volume**, about 70 mL, and leaves an **end-systolic volume** of about 40 to 50 mL. The **ejection fraction** is stroke volume divided by end-diastolic volume, normally about 60 percent.\r\n\r\nPlotting ventricular pressure against ventricular volume through one beat traces a closed **pressure–volume loop**. Its two vertical sides are the isovolumic phases, its top is ejection, and its bottom is filling. The loop's width is the stroke volume.\r\n\r\n## The sounds\r\n\r\n**Valve closure** produces the heart's main sounds: the taut leaflets and the blood around them vibrate as each valve set snaps shut. The **first heart sound** marks closure of the atrioventricular valves as systole begins, and the **second heart sound** marks closure of the semilunar valves as ejection ends. Two fainter sounds belong to filling. The **third heart sound** comes early in diastole, as inrushing blood sets the ventricular walls vibrating; it can be normal in children and young adults, while later in life it can signal heart failure. The **fourth heart sound** accompanies atrial contraction. It is usually too weak to hear with a stethoscope, so an audible one generally points to a stiff ventricle."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      },
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
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "how-the-heart-pumps",
      "puzzleRevision": "fnv1a32:6e365316",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:ejection": {
          "x": 735.34,
          "y": 136.88,
          "pinned": true
        },
        "term:rapid filling": {
          "x": 747.77,
          "y": 275.01,
          "pinned": true
        },
        "term:isovolumic contraction": {
          "x": 825.79,
          "y": 57.08,
          "pinned": false
        },
        "term:isovolumic relaxation": {
          "x": 883.47,
          "y": 210.45,
          "pinned": true
        },
        "term:atrial contraction": {
          "x": 654.8,
          "y": 24.92,
          "pinned": false
        },
        "term:end-diastolic volume": {
          "x": 532.24,
          "y": 530.03,
          "pinned": true
        },
        "term:stroke volume": {
          "x": 479.81,
          "y": 422.53,
          "pinned": true
        },
        "term:end-systolic volume": {
          "x": 647.96,
          "y": 611.7,
          "pinned": true
        },
        "term:ejection fraction": {
          "x": 671.72,
          "y": 471.43,
          "pinned": false
        },
        "term:atrioventricular valves": {
          "x": 425.87,
          "y": 233.06,
          "pinned": false
        },
        "term:semilunar valves": {
          "x": 472.34,
          "y": 68.64,
          "pinned": false
        },
        "term:papillary muscles": {
          "x": 322.39,
          "y": 93.15,
          "pinned": false
        },
        "term:first heart sound": {
          "x": 306.54,
          "y": 359.7,
          "pinned": false
        },
        "term:second heart sound": {
          "x": 194.11,
          "y": 471.08,
          "pinned": false
        },
        "term:third heart sound": {
          "x": 157.38,
          "y": 317.16,
          "pinned": false
        },
        "term:fourth heart sound": {
          "x": 329.25,
          "y": 520.8,
          "pinned": true
        },
        "term:pressure gradient": {
          "x": 587.27,
          "y": 168.04,
          "pinned": false
        },
        "term:valve closure": {
          "x": 220.67,
          "y": 212.45,
          "pinned": true
        },
        "term:pressure–volume loop": {
          "x": 583.48,
          "y": 332.54,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3470.48,
        "score": 3470.47629848601
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T01:55:23.246Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "how-the-heart-pumps",
      "puzzleRevision": "fnv1a32:6e365316",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 542.02,
          "y": 160.32,
          "pinned": true
        },
        "cluster:1": {
          "x": 210.27,
          "y": 343.99,
          "pinned": true
        },
        "cluster:2": {
          "x": 530,
          "y": 498.61,
          "pinned": false
        },
        "cluster:3": {
          "x": 874.78,
          "y": 314.94,
          "pinned": true
        }
      },
      "bridges": {
        "term:pressure gradient": {
          "x": 530,
          "y": 348,
          "pinned": false
        },
        "term:valve closure": {
          "x": 760.29,
          "y": 503.38,
          "pinned": true
        },
        "term:pressure–volume loop": {
          "x": 301.1,
          "y": 148.06,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "ejection",
          "rapid filling",
          "isovolumic contraction",
          "isovolumic relaxation",
          "atrial contraction"
        ],
        "cluster:1": [
          "end-diastolic volume",
          "stroke volume",
          "end-systolic volume",
          "ejection fraction"
        ],
        "cluster:2": [
          "atrioventricular valves",
          "semilunar valves",
          "papillary muscles"
        ],
        "cluster:3": [
          "first heart sound",
          "second heart sound",
          "third heart sound",
          "fourth heart sound"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "ejection",
          "atrial contraction",
          "isovolumic contraction",
          "isovolumic relaxation",
          "rapid filling"
        ],
        "cluster:1": [
          "stroke volume",
          "end-diastolic volume",
          "end-systolic volume",
          "ejection fraction"
        ],
        "cluster:2": [
          "semilunar valves",
          "atrioventricular valves",
          "papillary muscles"
        ],
        "cluster:3": [
          "first heart sound",
          "second heart sound",
          "fourth heart sound",
          "third heart sound"
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
        "totalLength": 597.6603920570919
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T01:57:58.291Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "how-the-heart-pumps",
      "puzzleRevision": "fnv1a32:6e365316",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:ejection": {
          "x": 751.18,
          "y": 55.95
        },
        "term:rapid filling": {
          "x": 324.03,
          "y": 138.22
        },
        "term:isovolumic contraction": {
          "x": 207.43,
          "y": 71.04
        },
        "term:isovolumic relaxation": {
          "x": 423.4,
          "y": 52
        },
        "term:atrial contraction": {
          "x": 598.6,
          "y": 52
        },
        "term:end-diastolic volume": {
          "x": 458.05,
          "y": 323.88
        },
        "term:stroke volume": {
          "x": 701.58,
          "y": 308.71
        },
        "term:end-systolic volume": {
          "x": 553.64,
          "y": 392.53
        },
        "term:ejection fraction": {
          "x": 465.58,
          "y": 193.62
        },
        "term:atrioventricular valves": {
          "x": 935.29,
          "y": 556.86
        },
        "term:semilunar valves": {
          "x": 625.55,
          "y": 525.81
        },
        "term:papillary muscles": {
          "x": 737.73,
          "y": 595.94
        },
        "term:first heart sound": {
          "x": 252.32,
          "y": 506.3
        },
        "term:second heart sound": {
          "x": 112.48,
          "y": 455.63
        },
        "term:third heart sound": {
          "x": 123.55,
          "y": 356.9
        },
        "term:fourth heart sound": {
          "x": 148.47,
          "y": 242.61
        },
        "term:pressure gradient": {
          "x": 876.24,
          "y": 153.21
        },
        "term:valve closure": {
          "x": 381.48,
          "y": 451.97
        },
        "term:pressure–volume loop": {
          "x": 692.26,
          "y": 211.48
        },
        "cluster:0": {
          "x": 554.37,
          "y": 120.21
        },
        "cluster:1": {
          "x": 555.02,
          "y": 267.62
        },
        "cluster:2": {
          "x": 890.47,
          "y": 450.86
        },
        "cluster:3": {
          "x": 278.52,
          "y": 320.84
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T01:55:28.964Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-14T01:52:39.312Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
