// Generated from content/puzzles/rhythmic-excitation-of-the-heart.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "rhythmic-excitation-of-the-heart",
  "title": "Rhythmic excitation of the heart",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cardiovascular"
  },
  "info": {
    "text": "The heart starts its own beat: pacemaker cells fire on their own, a conduction system carries the impulse through the heart in a fixed order and timing, the muscle answers with a long action potential, and the electrocardiogram records the whole sequence from the skin.",
    "links": [
      {
        "href": "wiki:Cardiac electrophysiology"
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
        "title": "Anatomy and Physiology 2e — 19.2 Cardiac Muscle and Electrical Activity",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity"
      }
    ]
  },
  "clusters": [
    {
      "id": "pacemaker-activity",
      "name": "Pacemaker activity",
      "color": "teal",
      "fact": "Pacemaker cells have no stable resting potential. After each beat the funny current carries sodium inward and drifts the membrane up toward threshold, where calcium channels open and fire the cell. Any tissue with automaticity can set the rhythm, and one that takes over from the sinus node is an ectopic pacemaker.",
      "terms": [
        "pacemaker potential",
        "automaticity",
        "funny current",
        "ectopic pacemaker"
      ],
      "seeds": [
        "pacemaker potential",
        "automaticity"
      ],
      "termInfo": {
        "automaticity": "A cell's ability to fire repeatedly on its own, with no nerve or outside stimulus to trigger it.",
        "ectopic pacemaker": {
          "text": "A site other than the sinus node that sets the heartbeat, either because it fires faster or because the normal impulse fails to reach it.",
          "links": [
            {
              "href": "wiki:Ectopic pacemaker"
            }
          ]
        },
        "funny current": {
          "text": "An inward current, mostly sodium, through channels that open as the membrane repolarizes after a beat; its unusual behavior earned it the name.",
          "links": [
            {
              "href": "wiki:Pacemaker current"
            }
          ]
        },
        "pacemaker potential": {
          "text": "The slow, spontaneous depolarization between beats that carries a pacemaker cell from its most negative voltage, about −60 mV, up to threshold. OpenStax calls it the prepotential.",
          "links": [
            {
              "href": "wiki:Pacemaker potential"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Natural pacemaker"
          }
        ]
      }
    },
    {
      "id": "conduction-pathway",
      "name": "Conduction pathway",
      "color": "blue",
      "fact": "The impulse crosses the atria along the internodal pathways to the AV node, the only electrical route into the ventricles. From there it runs down the bundle of His and the left and right bundle branches, and the Purkinje fibers spread it rapidly through the ventricular walls.",
      "terms": [
        "AV node",
        "Purkinje fibers",
        "internodal pathways",
        "bundle of His",
        "bundle branches"
      ],
      "seeds": [
        "AV node",
        "Purkinje fibers"
      ],
      "termInfo": {
        "AV node": {
          "text": "The atrioventricular node, a small knot of slowly conducting tissue in the wall between the right atrium and ventricle.",
          "links": [
            {
              "href": "wiki:Atrioventricular node"
            }
          ]
        },
        "Purkinje fibers": {
          "text": "Large, fast-conducting fibers beneath the inner lining of the ventricles, carrying the impulse at up to about 4 m/s.",
          "links": [
            {
              "href": "wiki:Purkinje fibers"
            }
          ]
        },
        "bundle branches": {
          "text": "The left and right divisions of the bundle of His, running down either side of the wall between the ventricles.",
          "links": [
            {
              "href": "wiki:Bundle branches"
            }
          ]
        },
        "bundle of His": {
          "text": "The atrioventricular bundle, which leaves the AV node and passes through the fibrous tissue between atria and ventricles. OpenStax calls it the AV bundle.",
          "links": [
            {
              "href": "wiki:Bundle of His"
            }
          ]
        },
        "internodal pathways": "Bands of atrial muscle that carry the impulse from the sinus node to the AV node faster than ordinary atrial muscle does."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cardiac conduction system"
          }
        ]
      }
    },
    {
      "id": "ventricular-action-potential",
      "name": "Ventricular action potential",
      "color": "amber",
      "fact": "Fast sodium channels drive rapid depolarization, as in nerve. Slow calcium entry then holds the membrane depolarized in a plateau lasting about 0.2 second, and the resulting long refractory period outlasts most of the contraction, so a new beat cannot fuse with the last into tetanus.",
      "terms": [
        "rapid depolarization",
        "plateau",
        "fast sodium channels",
        "long refractory period"
      ],
      "seeds": [
        "rapid depolarization",
        "plateau"
      ],
      "termInfo": {
        "fast sodium channels": {
          "text": "Voltage-gated sodium channels that open within a fraction of a millisecond; the ventricular and atrial muscle have them, while the nodal cells largely lack them.",
          "links": [
            {
              "href": "wiki:Sodium channel"
            }
          ]
        },
        "long refractory period": {
          "text": "The interval, about 0.25 to 0.30 second in the ventricle, during which a normal impulse cannot re-excite the muscle.",
          "links": [
            {
              "href": "wiki:Refractory period (physiology)"
            }
          ]
        },
        "plateau": "The long stretch after the upstroke when the membrane stays depolarized, as calcium entry balances potassium loss.",
        "rapid depolarization": "The steep upstroke of the working muscle's action potential, from about −90 mV to slightly positive in a millisecond or two."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cardiac action potential"
          }
        ]
      }
    },
    {
      "id": "electrocardiogram",
      "name": "The electrocardiogram",
      "color": "magenta",
      "fact": "The P wave records atrial depolarization and the QRS complex ventricular depolarization; the T wave records ventricular repolarization. The PR interval runs from the start of atrial depolarization to the start of ventricular depolarization, and the flat ST segment falls while the ventricles are fully depolarized.",
      "terms": [
        "P wave",
        "QRS complex",
        "T wave",
        "PR interval",
        "ST segment"
      ],
      "seeds": [
        "P wave",
        "QRS complex"
      ],
      "termInfo": {
        "P wave": {
          "text": "The small first deflection of each beat on the tracing.",
          "links": [
            {
              "href": "wiki:P wave (electrocardiography)"
            }
          ]
        },
        "PR interval": {
          "text": "The time from the start of the P wave to the start of the QRS complex, normally about 0.16 second.",
          "links": [
            {
              "href": "wiki:PR interval"
            }
          ]
        },
        "QRS complex": {
          "text": "The tall, sharp deflection of each beat, normally lasting under about 0.1 second.",
          "links": [
            {
              "href": "wiki:QRS complex"
            }
          ]
        },
        "ST segment": {
          "text": "The level stretch between the end of the QRS complex and the start of the T wave; it rises or falls when heart muscle is injured or starved of oxygen.",
          "links": [
            {
              "href": "wiki:ST segment"
            }
          ]
        },
        "T wave": {
          "text": "The broad, rounded deflection that closes each beat.",
          "links": [
            {
              "href": "wiki:T wave"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Electrocardiography"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "sinoatrial-node",
      "term": "sinoatrial node",
      "clusters": [
        0,
        1
      ],
      "fact": "The sinoatrial node fires faster than any other tissue with automaticity, about 70 to 80 times a minute at rest, so it sets the rhythm. Sitting in the right atrial wall at the start of the conduction pathway, it sends each impulse across the atria toward the AV node.",
      "info": {
        "text": "The sinus node, a small strip of specialized muscle in the upper wall of the right atrium; the heart's normal pacemaker.",
        "links": [
          {
            "href": "wiki:Sinoatrial node"
          }
        ]
      },
      "idealTerms": [
        "pacemaker potential",
        "internodal pathways"
      ]
    },
    {
      "id": "gap-junctions",
      "term": "gap junctions",
      "clusters": [
        1,
        2
      ],
      "fact": "Gap junctions in the intercalated discs let ions pass directly from one muscle cell to the next, so current from the Purkinje fibers depolarizes neighboring cells to threshold and the action potential spreads through the muscle as if it were one cell.",
      "info": {
        "text": "Protein channels joining neighboring cells; in heart muscle they sit in the intercalated discs that link the cells end to end.",
        "links": [
          {
            "href": "wiki:Gap junction"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Purkinje fibers",
        "rapid depolarization"
      ]
    },
    {
      "id": "av-nodal-delay",
      "term": "AV nodal delay",
      "clusters": [
        1,
        3
      ],
      "fact": "The AV node and the start of the bundle of His hold the impulse back for about 0.1 second, giving the atria time to empty into the ventricles before they contract. That hold makes up most of the PR interval.",
      "info": "The slow passage of the impulse through the AV node, where small fibers with few gap junctions conduct it only a few centimeters per second.",
      "relationKind": "dynamic",
      "idealTerms": [
        "AV node",
        "PR interval"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "qt-interval",
      "term": "QT interval",
      "clusters": [
        2,
        3
      ],
      "fact": "The QT interval runs from the start of the QRS complex to the end of the T wave, so it spans the ventricular action potential from upstroke through plateau to repolarization, about 0.35 second at rest.",
      "info": {
        "text": "The ECG measure of how long the ventricles stay electrically active in one beat; it shortens as heart rate rises.",
        "links": [
          {
            "href": "wiki:QT interval"
          }
        ]
      }
    }
  ],
  "lenses": [
    {
      "id": "depolarization-waves",
      "prompt": "Which ECG waves record depolarization?",
      "explanation": "Depolarization of the atria and then the ventricles produces the P wave and QRS complex. The T wave records the ventricles repolarizing; atrial repolarization is hidden inside the QRS complex.",
      "targets": [
        "P wave",
        "QRS complex"
      ],
      "reasons": {
        "P wave": "The atria depolarizing as the impulse spreads from the sinus node.",
        "QRS complex": "The much larger ventricular mass depolarizing as the Purkinje fibers deliver the impulse."
      }
    },
    {
      "id": "sinus-firing-rate",
      "prompt": "Which concepts set how fast the sinoatrial node fires?",
      "explanation": "The time a pacemaker cell takes to drift from its lowest voltage to threshold decides the interval between beats. A steeper drift means a faster rate, which is why the drug ivabradine, which blocks the funny current, slows the heart.",
      "targets": [
        "pacemaker potential",
        "funny current"
      ],
      "reasons": {
        "funny current": "It supplies most of the inward current that drives the drift.",
        "pacemaker potential": "Its slope sets how soon each cell reaches threshold again."
      }
    },
    {
      "id": "no-tetanus",
      "prompt": "Which features keep heart muscle from summing contractions into tetanus?",
      "explanation": "The plateau holds the membrane depolarized for about 0.2 second, and the membrane cannot fire again until it repolarizes. The resulting refractory period outlasts most of the contraction, so each beat must end before the next can start.",
      "targets": [
        "plateau",
        "long refractory period"
      ],
      "reasons": {
        "long refractory period": "It blocks any new action potential until the muscle has largely relaxed.",
        "plateau": "It keeps the membrane depolarized, and unexcitable, through most of the contraction."
      }
    },
    {
      "id": "first-backup-pacemaker",
      "prompt": "Which structure takes over first if the sinoatrial node falls silent?",
      "explanation": "Automatic tissues form a hierarchy of rates: the AV node fires about 40 to 60 times a minute and the Purkinje fibers about 15 to 40. The fastest remaining site captures the rhythm and becomes the ectopic pacemaker.",
      "targets": [
        "AV node"
      ],
      "reasons": {
        "AV node": "With the sinus node silent, its rate of about 40 to 60 a minute is the fastest left."
      }
    },
    {
      "id": "slowed-av-conduction",
      "prompt": "Which ECG feature lengthens when AV conduction slows?",
      "explanation": "The PR interval measures the trip from atrial depolarization to ventricular depolarization, most of which is spent in the AV node. A PR interval above about 0.20 second is the mark of first-degree heart block.",
      "targets": [
        "PR interval"
      ],
      "reasons": {
        "PR interval": "AV nodal delay makes up most of it, so slower nodal conduction stretches it directly."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-the-heart-pumps",
        "reason": "Follow the beat these signals start: how each wave sets off contraction, valve movement, and filling."
      },
      {
        "id": "regulating-arterial-pressure",
        "reason": "See how sympathetic and vagal nerves speed or slow the sinoatrial node to adjust heart rate."
      },
      {
        "id": "how-neurons-fire-and-signal",
        "reason": "Compare the brief nerve action potential that the heart's long one departs from."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the heart starts and spreads its own beat",
    "summary": "How pacemaker cells fire on their own, how the conduction system times the impulse, why the ventricular action potential is so long, and how the ECG records it all.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "A heart removed from the body keeps beating for a while, because it starts each beat itself. Nerves can speed or slow it, but the signal that triggers contraction begins in the heart's own tissue and travels along its own wiring. This lesson follows one impulse from its origin to its record on the skin.\r\n\r\n## Cells that fire on their own\r\n\r\nMost excitable cells sit at a steady resting voltage until something stimulates them. Pacemaker cells have no such resting state. This property, **automaticity**, comes from the **pacemaker potential**: after each beat the membrane drifts slowly upward from about −60 mV toward threshold. The drift is driven mainly by the **funny current**, an inward flow of sodium through channels that open as the cell repolarizes. When the membrane reaches threshold, calcium channels open and fire the cell, then potassium channels reset it, and the drift begins again.\r\n\r\nSeveral tissues in the heart have automaticity, but they fire at different rates. The **sinoatrial node**, a small strip of specialized muscle in the wall of the right atrium, fires fastest, about 70 to 80 times a minute at rest. Each of its impulses reaches the slower tissues before they can fire on their own, so it sets the rhythm for the whole heart. If another site fires faster, or if the sinus node's impulse is blocked, that site becomes an **ectopic pacemaker** and takes over.\r\n\r\n## The conduction pathway\r\n\r\nThe impulse spreads across the atria and along the **internodal pathways** to the **AV node**, which is normally the only electrical route from atria to ventricles; everywhere else, fibrous tissue insulates the two. The AV node conducts slowly, and this **AV nodal delay** of about 0.1 second lets the atria finish emptying before the ventricles contract. The impulse then passes into the **bundle of His**, divides into the left and right **bundle branches** on either side of the wall between the ventricles, and enters the **Purkinje fibers**. These large fibers conduct several times faster than ordinary heart muscle, so the whole ventricular mass is excited within a few hundredths of a second and contracts together.\r\n\r\nFrom the Purkinje fibers the impulse passes from one muscle cell to the next through **gap junctions**, channels in the intercalated discs that join the cells end to end. Ions flow through them so freely that the muscle behaves electrically as a single unit.\r\n\r\n## The ventricular action potential\r\n\r\nIn the working muscle, **fast sodium channels** open first and produce **rapid depolarization**, the same kind of upstroke a nerve makes. Then the heart departs from nerve. Slow calcium channels open and hold the membrane depolarized in a **plateau** that lasts about 0.2 second, while potassium channels stay largely closed. The calcium that enters during the plateau also helps trigger contraction.\r\n\r\nBecause the membrane cannot fire again until it repolarizes, the plateau gives heart muscle a **long refractory period**, about 0.25 to 0.30 second. That is nearly as long as the contraction itself. Skeletal muscle can be stimulated again before it relaxes, so its twitches can fuse into a sustained contraction called tetanus. Heart muscle cannot, so each beat ends in relaxation and the ventricles can refill.\r\n\r\n## The electrocardiogram\r\n\r\nThe electrical activity of millions of cells is large enough to record from the skin. On the electrocardiogram, the **P wave** records atrial depolarization and the **QRS complex** records ventricular depolarization, which also hides the smaller signal of the atria repolarizing. The **T wave** records ventricular repolarization.\r\n\r\nThe gaps between waves carry information too. The **PR interval**, from the start of the P wave to the start of the QRS complex, is normally about 0.16 second and consists mostly of AV nodal delay, so it lengthens when conduction through the AV node slows. The **ST segment** is the flat stretch while the whole ventricle sits in its plateau, and it shifts when heart muscle is injured. The **QT interval**, from the start of the QRS complex to the end of the T wave, spans the full ventricular action potential, about 0.35 second at rest."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5.5)",
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
      "puzzleId": "rhythmic-excitation-of-the-heart",
      "puzzleRevision": "fnv1a32:ca7d820c",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:pacemaker potential": {
          "x": 622.16,
          "y": 180.8
        },
        "term:automaticity": {
          "x": 351.87,
          "y": 52
        },
        "term:funny current": {
          "x": 554.99,
          "y": 52
        },
        "term:ectopic pacemaker": {
          "x": 725.3,
          "y": 52
        },
        "term:AV node": {
          "x": 711.2,
          "y": 445.83
        },
        "term:Purkinje fibers": {
          "x": 756.01,
          "y": 561.45
        },
        "term:internodal pathways": {
          "x": 790.7,
          "y": 215.95
        },
        "term:bundle of His": {
          "x": 931.34,
          "y": 275.75
        },
        "term:bundle branches": {
          "x": 942.75,
          "y": 482.53
        },
        "term:rapid depolarization": {
          "x": 570.63,
          "y": 594.84
        },
        "term:plateau": {
          "x": 438.16,
          "y": 628
        },
        "term:fast sodium channels": {
          "x": 289.07,
          "y": 624.99
        },
        "term:long refractory period": {
          "x": 139.3,
          "y": 542.67
        },
        "term:P wave": {
          "x": 205.11,
          "y": 457.52
        },
        "term:QRS complex": {
          "x": 114.74,
          "y": 388.57
        },
        "term:T wave": {
          "x": 131.41,
          "y": 275.4
        },
        "term:PR interval": {
          "x": 316.7,
          "y": 191.16
        },
        "term:ST segment": {
          "x": 198.63,
          "y": 187.62
        },
        "term:sinoatrial node": {
          "x": 693.58,
          "y": 312.53
        },
        "term:gap junctions": {
          "x": 600.02,
          "y": 464.47
        },
        "term:AV nodal delay": {
          "x": 514.9,
          "y": 309.23
        },
        "term:QT interval": {
          "x": 421.72,
          "y": 378.96
        },
        "cluster:0": {
          "x": 450.53,
          "y": 139.72
        },
        "cluster:1": {
          "x": 825.24,
          "y": 381.07
        },
        "cluster:2": {
          "x": 416.09,
          "y": 462.48
        },
        "cluster:3": {
          "x": 256.41,
          "y": 331.56
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T02:22:49.036Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "rhythmic-excitation-of-the-heart",
      "puzzleRevision": "fnv1a32:ca7d820c",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 883.63,
          "y": 334.98,
          "pinned": true
        },
        "cluster:1": {
          "x": 530,
          "y": 505.14,
          "pinned": false
        },
        "cluster:2": {
          "x": 169.36,
          "y": 410.12,
          "pinned": true
        },
        "cluster:3": {
          "x": 612.16,
          "y": 140.77,
          "pinned": true
        }
      },
      "bridges": {
        "term:sinoatrial node": {
          "x": 748.59,
          "y": 460.33,
          "pinned": true
        },
        "term:gap junctions": {
          "x": 387.04,
          "y": 346.49,
          "pinned": true
        },
        "term:AV nodal delay": {
          "x": 557.87,
          "y": 322.26,
          "pinned": true
        },
        "term:QT interval": {
          "x": 356.19,
          "y": 269.43,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "pacemaker potential",
          "automaticity",
          "funny current",
          "ectopic pacemaker"
        ],
        "cluster:1": [
          "AV node",
          "Purkinje fibers",
          "internodal pathways",
          "bundle of His",
          "bundle branches"
        ],
        "cluster:2": [
          "rapid depolarization",
          "plateau",
          "fast sodium channels",
          "long refractory period"
        ],
        "cluster:3": [
          "P wave",
          "QRS complex",
          "T wave",
          "PR interval",
          "ST segment"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "funny current",
          "pacemaker potential",
          "ectopic pacemaker",
          "automaticity"
        ],
        "cluster:1": [
          "AV node",
          "Purkinje fibers",
          "internodal pathways",
          "bundle branches",
          "bundle of His"
        ],
        "cluster:2": [
          "rapid depolarization",
          "long refractory period",
          "fast sodium channels",
          "plateau"
        ],
        "cluster:3": [
          "T wave",
          "ST segment",
          "QRS complex",
          "PR interval",
          "P wave"
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
        "totalLength": 1100.026503177626
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T02:25:37.975Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "rhythmic-excitation-of-the-heart",
      "puzzleRevision": "fnv1a32:ca7d820c",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:pacemaker potential": {
          "x": 680.33,
          "y": 267.25,
          "pinned": true
        },
        "term:automaticity": {
          "x": 809.46,
          "y": 157.25,
          "pinned": true
        },
        "term:funny current": {
          "x": 783.37,
          "y": 371.28,
          "pinned": true
        },
        "term:ectopic pacemaker": {
          "x": 861.82,
          "y": 248.71,
          "pinned": true
        },
        "term:AV node": {
          "x": 332.41,
          "y": 151.06,
          "pinned": false
        },
        "term:Purkinje fibers": {
          "x": 440.36,
          "y": 247.75,
          "pinned": true
        },
        "term:internodal pathways": {
          "x": 465.85,
          "y": 89.48,
          "pinned": true
        },
        "term:bundle of His": {
          "x": 310.91,
          "y": 42.18,
          "pinned": false
        },
        "term:bundle branches": {
          "x": 190.65,
          "y": 128.56,
          "pinned": true
        },
        "term:rapid depolarization": {
          "x": 499.61,
          "y": 523,
          "pinned": true
        },
        "term:plateau": {
          "x": 434.01,
          "y": 611.91,
          "pinned": true
        },
        "term:fast sodium channels": {
          "x": 598.15,
          "y": 435.8,
          "pinned": true
        },
        "term:long refractory period": {
          "x": 594.74,
          "y": 611.57,
          "pinned": false
        },
        "term:P wave": {
          "x": 229.43,
          "y": 450.14,
          "pinned": false
        },
        "term:QRS complex": {
          "x": 151.93,
          "y": 542.56,
          "pinned": true
        },
        "term:T wave": {
          "x": 189.88,
          "y": 355.35,
          "pinned": true
        },
        "term:PR interval": {
          "x": 310.05,
          "y": 388.39,
          "pinned": false
        },
        "term:ST segment": {
          "x": 113.67,
          "y": 423.35,
          "pinned": true
        },
        "term:sinoatrial node": {
          "x": 649.35,
          "y": 151.87,
          "pinned": true
        },
        "term:gap junctions": {
          "x": 462.17,
          "y": 368.12,
          "pinned": true
        },
        "term:AV nodal delay": {
          "x": 258.23,
          "y": 258.03,
          "pinned": true
        },
        "term:QT interval": {
          "x": 290.23,
          "y": 537.71,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3588.21,
        "score": 3588.2068206414556
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T02:25:26.877Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-14T02:21:44.209Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
