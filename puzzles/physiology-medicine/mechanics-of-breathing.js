// Generated from content/puzzles/mechanics-of-breathing.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "mechanics-of-breathing",
  "title": "Mechanics of breathing",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "respiratory"
  },
  "info": {
    "text": "Air moves into and out of the lungs only when a pressure difference drives it. The lung's elastic recoil and the airways' resistance set how much effort each breath takes, and the share of each breath that reaches the alveoli sets how much of that effort does useful work.",
    "links": [
      {
        "href": "wiki:Respiration (physiology)"
      }
    ],
    "citations": [
      {
        "title": "West's Respiratory Physiology: The Essentials, 11th ed., ch. 2, \"Ventilation,\" and ch. 7, \"Mechanics of Breathing\"",
        "author": "John B. West and Andrew M. Luks",
        "publisher": "Wolters Kluwer",
        "year": "2020",
        "url": "https://shop.lww.com/West-s-Respiratory-Physiology/p/9781975139186"
      },
      {
        "title": "Lung compliance",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Lung_compliance"
      },
      {
        "title": "Airway resistance",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Airway_resistance"
      },
      {
        "title": "Lung volumes and capacities",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Lung_volumes_and_capacities"
      },
      {
        "title": "Dead space (physiology)",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Dead_space_(physiology)"
      }
    ]
  },
  "clusters": [
    {
      "id": "pressure-gradients",
      "name": "Pressure gradients",
      "color": "teal",
      "fact": "Air flows only from higher to lower pressure. Enlarging the chest lowers alveolar pressure below atmospheric and air flows in, while the pleural space between lung and chest wall stays below atmospheric throughout quiet breathing.",
      "terms": [
        "intrapleural pressure",
        "alveolar pressure",
        "transpulmonary pressure",
        "Boyle's law"
      ],
      "seeds": [
        "intrapleural pressure",
        "alveolar pressure"
      ],
      "termInfo": {
        "Boyle's law": {
          "text": "At constant temperature, the pressure of a gas varies inversely with its volume, so enlarging the chest lowers the pressure of the air inside it.",
          "links": [
            {
              "href": "wiki:Boyle's law"
            }
          ]
        },
        "alveolar pressure": "Pressure of the air inside the alveoli. It falls slightly below atmospheric during inspiration and rises above it during expiration, and that difference drives airflow.",
        "intrapleural pressure": {
          "text": "Pressure in the thin fluid layer between the lung and the chest wall; about −5 cmH₂O at rest, because the lung pulls inward while the chest wall pulls outward.",
          "links": [
            {
              "href": "wiki:Intrapleural pressure"
            }
          ]
        },
        "transpulmonary pressure": {
          "text": "Alveolar pressure minus intrapleural pressure: the pressure difference across the lung wall that holds the lung distended.",
          "links": [
            {
              "href": "wiki:Transpulmonary pressure"
            }
          ]
        }
      }
    },
    {
      "id": "elastic-recoil",
      "name": "Elastic recoil",
      "color": "blue",
      "fact": "The lung tends to recoil inward, partly from elastic fibers in its tissue and largely from surface tension in the liquid lining its alveoli, which surfactant lowers. The chest wall tends to spring outward.",
      "terms": [
        "lung compliance",
        "surfactant",
        "surface tension",
        "law of Laplace",
        "chest wall recoil"
      ],
      "seeds": [
        "lung compliance",
        "surfactant"
      ],
      "termInfo": {
        "chest wall recoil": "The chest wall's tendency to spring outward, opposing the lung's inward pull.",
        "law of Laplace": {
          "text": "The pressure inside a bubble equals twice its surface tension divided by its radius, so at equal tension a small alveolus would empty into a larger one.",
          "links": [
            {
              "href": "wiki:Young–Laplace equation"
            }
          ]
        },
        "lung compliance": {
          "text": "The change in lung volume per unit change in transpulmonary pressure. A scarred lung, as in pulmonary fibrosis, has low compliance; a lung that has lost elastic tissue, as in emphysema, has high compliance.",
          "links": [
            {
              "href": "wiki:Lung compliance"
            }
          ]
        },
        "surface tension": {
          "text": "The inward pull at the surface of the liquid lining the alveoli, which accounts for much of the lung's recoil.",
          "links": [
            {
              "href": "wiki:Surface tension"
            }
          ]
        },
        "surfactant": {
          "text": "A phospholipid-rich film secreted by type II alveolar cells. It lowers surface tension, makes the lung easier to inflate, and keeps small alveoli open; premature infants who lack it develop respiratory distress syndrome.",
          "links": [
            {
              "href": "wiki:Pulmonary surfactant"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Elastic recoil"
          }
        ]
      }
    },
    {
      "id": "airway-resistance",
      "name": "Airway resistance",
      "color": "amber",
      "fact": "Resistance to airflow rises steeply as airways narrow. Most of it lies in the medium-sized bronchi; the smallest airways are so numerous, and so fully arranged in parallel, that together they add little.",
      "terms": [
        "Poiseuille's law",
        "bronchial smooth muscle",
        "medium-sized bronchi",
        "radial traction"
      ],
      "seeds": [
        "Poiseuille's law",
        "bronchial smooth muscle"
      ],
      "termInfo": {
        "Poiseuille's law": {
          "text": "For smooth flow through a tube, resistance varies inversely with the fourth power of the radius: halving an airway's radius raises its resistance sixteenfold.",
          "links": [
            {
              "href": "wiki:Hagen–Poiseuille equation"
            }
          ]
        },
        "bronchial smooth muscle": {
          "text": "Muscle in the airway walls. Vagal stimulation contracts it and narrows the airways; β₂-adrenergic stimulation relaxes it. Its excessive contraction is a hallmark of asthma.",
          "links": [
            {
              "href": "wiki:Bronchoconstriction"
            }
          ]
        },
        "medium-sized bronchi": "The airways down to about the seventh generation of branching, where most airway resistance lies; bronchioles narrower than 2 mm contribute less than a fifth of the total.",
        "radial traction": "The pull of surrounding lung tissue on the airway walls, which holds airways open. It strengthens as the lung inflates, so airway resistance falls at high lung volumes."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Airway resistance"
          }
        ]
      }
    },
    {
      "id": "lung-volumes",
      "name": "Lung volumes",
      "color": "magenta",
      "fact": "The air in the lungs divides into standard volumes. A spirometer records only air that moves in or out, so the volume that always stays behind, and every capacity that includes it, must be measured another way.",
      "terms": [
        "residual volume",
        "vital capacity",
        "total lung capacity",
        "expiratory reserve volume",
        "spirometry"
      ],
      "seeds": [
        "residual volume",
        "vital capacity"
      ],
      "termInfo": {
        "expiratory reserve volume": "The additional air that can be forced out after a normal, quiet exhalation.",
        "residual volume": "The air left in the lungs after the most forceful possible exhalation, about 1.2 liters in a young adult. It is never breathed out, so spirometry cannot measure it.",
        "spirometry": {
          "text": "Measurement of how much air is breathed in and out, and how fast, using a spirometer.",
          "links": [
            {
              "href": "wiki:Spirometry"
            }
          ]
        },
        "total lung capacity": "The volume of air in the lungs after the deepest possible inhalation: vital capacity plus residual volume.",
        "vital capacity": {
          "text": "The largest volume that can be exhaled after the deepest possible inhalation.",
          "links": [
            {
              "href": "wiki:Vital capacity"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Lung volumes and capacities"
          }
        ]
      }
    },
    {
      "id": "ventilation",
      "name": "Ventilation",
      "color": "olive",
      "fact": "Part of every breath only fills the conducting airways. Alveolar ventilation, the fresh air that reaches gas-exchanging alveoli each minute, is the share of minute ventilation that sets arterial carbon dioxide.",
      "terms": [
        "minute ventilation",
        "alveolar ventilation",
        "anatomic dead space",
        "physiologic dead space"
      ],
      "seeds": [
        "minute ventilation",
        "alveolar ventilation"
      ],
      "termInfo": {
        "alveolar ventilation": "The volume of fresh air reaching the alveoli each minute: tidal volume minus dead space, times breathing rate.",
        "anatomic dead space": "The part of each breath that only fills the conducting airways, from nose and mouth to the terminal bronchioles: about 150 mL in an adult, taking no part in gas exchange.",
        "minute ventilation": {
          "text": "The total volume of air breathed per minute: tidal volume times breathing rate, about 7.5 liters at rest.",
          "links": [
            {
              "href": "wiki:Minute ventilation"
            }
          ]
        },
        "physiologic dead space": "All of each breath that exchanges no gas: the anatomic dead space plus any alveoli that are ventilated but not perfused. In healthy lungs it is close to the anatomic value."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Dead space (physiology)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "pneumothorax",
      "term": "pneumothorax",
      "clusters": [
        0,
        1
      ],
      "fact": "When air enters the pleural space through a chest wound or a ruptured lung surface, intrapleural pressure rises to atmospheric; uncoupled, the lung recoils inward and collapses while the chest wall springs outward.",
      "info": {
        "text": "Air in the pleural space, which uncouples the lung from the chest wall.",
        "links": [
          {
            "href": "wiki:Pneumothorax"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "intrapleural pressure",
        "chest wall recoil"
      ]
    },
    {
      "id": "functional-residual-capacity",
      "term": "functional residual capacity",
      "clusters": [
        1,
        3
      ],
      "fact": "At the end of a quiet exhalation the lung's inward recoil exactly balances the chest wall's outward recoil; the lung volume at that balance point is the functional residual capacity, the residual volume plus the expiratory reserve volume.",
      "info": {
        "text": "The volume of air in the lungs at the end of a normal, passive exhalation, about 2.5 liters in an adult.",
        "links": [
          {
            "href": "wiki:Functional residual capacity"
          }
        ]
      },
      "idealTerms": [
        "chest wall recoil",
        null
      ]
    },
    {
      "id": "work-of-breathing",
      "term": "work of breathing",
      "clusters": [
        1,
        2
      ],
      "fact": "Breathing does work against two loads: elastic recoil, which grows with the size of each breath, and airway resistance, which grows with the speed of airflow. Stiff lungs favor rapid, shallow breaths; narrowed airways favor slow, deep ones.",
      "info": {
        "text": "The energy spent moving the lungs and chest wall; at rest it takes only a small fraction of the body's oxygen consumption.",
        "links": [
          {
            "href": "wiki:Work of breathing"
          }
        ]
      },
      "relationKind": "cross-cutting"
    },
    {
      "id": "dynamic-airway-compression",
      "term": "dynamic airway compression",
      "clusters": [
        0,
        2
      ],
      "fact": "In a forced exhalation, intrapleural pressure rises above atmospheric and squeezes the airways from outside, so beyond a moderate effort, pushing harder does not empty the lungs faster.",
      "info": "Narrowing of the airways by surrounding pleural pressure during forced expiration, which caps maximal expiratory flow.",
      "relationKind": "dynamic",
      "idealTerms": [
        "intrapleural pressure",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "fev1-fvc-ratio",
      "term": "FEV₁/FVC ratio",
      "clusters": [
        2,
        3
      ],
      "fact": "Spirometry measures the fraction of a forced vital capacity exhaled in the first second. When airway resistance rises, as in asthma or chronic obstructive pulmonary disease, the ratio falls; a value below 0.7 is the usual spirometric sign of airflow obstruction.",
      "info": {
        "text": "Forced expiratory volume in one second divided by forced vital capacity.",
        "links": [
          {
            "href": "wiki:FEV1/FVC ratio"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        null,
        "spirometry"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "tidal-volume",
      "term": "tidal volume",
      "clusters": [
        3,
        4
      ],
      "fact": "Tidal volume is both a lung volume and the size of each breath. The anatomic dead space is subtracted from every breath, so alveolar ventilation equals tidal volume minus dead space, times breathing rate.",
      "info": {
        "text": "The volume of air moved in a normal resting breath, about 500 mL in an adult.",
        "links": [
          {
            "href": "wiki:Tidal volume"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "anatomic dead space"
      ]
    }
  ],
  "lenses": [
    {
      "id": "never-exhaled",
      "prompt": "Which volumes contain air that no exhalation can expel?",
      "explanation": "A spirometer records only air that moves, so it cannot measure these three. They are measured by gas dilution or body plethysmography instead.",
      "targets": [
        "residual volume",
        "total lung capacity",
        "functional residual capacity"
      ],
      "reasons": {
        "functional residual capacity": "It is the expiratory reserve volume plus the residual volume.",
        "residual volume": "It is the air that remains after the most forceful exhalation possible.",
        "total lung capacity": "It is the vital capacity plus the residual volume."
      }
    },
    {
      "id": "unstable-alveoli",
      "prompt": "What explains the tendency of small alveoli to empty into larger ones?",
      "explanation": "Surfactant prevents this. It lowers surface tension, and lowers it most as an alveolus shrinks, so small alveoli stay open beside large ones.",
      "targets": [
        "surface tension",
        "law of Laplace"
      ],
      "reasons": {
        "law of Laplace": "At equal tension, the pressure inside a bubble rises as its radius falls, so a smaller alveolus has the higher pressure.",
        "surface tension": "It pulls each alveolar surface inward, raising the pressure inside the alveolus."
      }
    },
    {
      "id": "airway-caliber",
      "prompt": "Which mechanisms change airway caliber from breath to breath?",
      "explanation": "Poiseuille's law states how radius sets resistance, and the medium-sized bronchi are where most resistance lies; neither changes from breath to breath. Intrapleural pressure acts on the airways through dynamic compression. Muscle tone, lung volume, and expiratory effort are what vary.",
      "targets": [
        "bronchial smooth muscle",
        "radial traction",
        "dynamic airway compression"
      ],
      "reasons": {
        "bronchial smooth muscle": "Its contraction under vagal stimulation narrows the airways, and β₂-adrenergic stimulation relaxes it.",
        "dynamic airway compression": "Positive intrapleural pressure in a forced exhalation squeezes the airways from outside.",
        "radial traction": "Its pull on the airway walls strengthens as the lung inflates, widening the airways at high lung volumes."
      }
    },
    {
      "id": "rapid-shallow",
      "prompt": "Which quantities fall when the same minute ventilation is taken as rapid, shallow breaths?",
      "explanation": "The anatomic dead space stays the same size, so it takes a larger share of each smaller breath. Less fresh air reaches the alveoli, and arterial carbon dioxide rises. The work of breathing shifts from elastic toward resistive work rather than simply falling.",
      "targets": [
        "tidal volume",
        "alveolar ventilation"
      ],
      "reasons": {
        "alveolar ventilation": "The anatomic dead space is subtracted from every breath, so more breaths waste more of the same minute's air.",
        "tidal volume": "Each breath is smaller, since more breaths share the same total."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How air is moved",
    "summary": "What creates the pressure differences that move air, what the lungs and airways resist with, how lung volumes are divided and measured, and how much of each breath reaches the alveoli.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "Air enters and leaves the lungs about a dozen times a minute, and it moves only when a pressure difference drives it. Each breath has to overcome two loads: the elastic recoil of the lungs and chest wall, and the resistance of the airways. And only part of each breath reaches the alveoli, where gas is exchanged.\r\n\r\nThe aim of this lesson is to let you explain what each breath costs and how much of it does useful work.\r\n\r\n## Pressure drives airflow\r\n\r\nThe lungs cannot expand themselves. The diaphragm and rib muscles enlarge the chest, and by **Boyle's law** the pressure of a gas falls as its volume rises. During inspiration the **alveolar pressure**, the pressure of the air inside the alveoli, drops a little below atmospheric and air flows in; during quiet expiration it rises slightly above atmospheric and air flows out.\r\n\r\nThe lungs and chest wall are coupled by a thin film of fluid in the pleural space. The lung pulls inward and the chest wall pulls outward, so the **intrapleural pressure** in that space sits below atmospheric, about −5 cmH₂O at rest. The difference between alveolar and intrapleural pressure, the **transpulmonary pressure**, holds the lung distended. If air enters the pleural space, through a chest wound or a ruptured lung surface, that coupling is lost: in a **pneumothorax** the lung recoils inward and collapses while the chest wall springs outward.\r\n\r\n## Elastic recoil\r\n\r\n**Lung compliance** measures how easily the lung inflates: the change in volume for a given change in transpulmonary pressure. A scarred lung, as in pulmonary fibrosis, has low compliance; a lung that has lost its elastic tissue, as in emphysema, has high compliance and recoils weakly.\r\n\r\nPart of the lung's recoil comes from elastic fibers, and much of it from **surface tension** in the thin liquid layer lining the alveoli. The **law of Laplace** states that the pressure inside a bubble equals twice its surface tension divided by its radius, so at equal tension a small alveolus would empty into a larger one. **Surfactant**, a phospholipid film secreted by type II alveolar cells, keeps this from happening. It lowers surface tension, and lowers it most as an alveolus shrinks, which stabilizes small alveoli and makes the lung easier to inflate. Premature infants who have not yet produced enough of it develop respiratory distress syndrome.\r\n\r\nThe chest wall is elastic too. Left to itself it would spring outward, and **chest wall recoil** opposes the lung's inward pull. At the end of a quiet exhalation the two recoils exactly balance, and the lung volume at that point is the **functional residual capacity**.\r\n\r\n## Airway resistance\r\n\r\nAirflow also meets resistance. By **Poiseuille's law**, the resistance of a tube to smooth flow varies inversely with the fourth power of its radius: halve an airway's radius and its resistance rises sixteenfold. The narrowest airways are so numerous, and so fully arranged in parallel, that their combined resistance is small. Most resistance lies in the **medium-sized bronchi**, down to about the seventh generation of branching.\r\n\r\nAirway caliber changes from moment to moment. **Bronchial smooth muscle** in the airway walls contracts under vagal stimulation and relaxes under β₂-adrenergic stimulation; its excessive contraction is a hallmark of asthma. **Radial traction**, the pull of the surrounding lung tissue on the airway walls, holds the airways open and grows stronger as the lung inflates, so resistance falls at high lung volumes. In a forced exhalation, intrapleural pressure rises above atmospheric and squeezes the airways from outside. This **dynamic airway compression** caps expiratory flow: beyond a moderate effort, pushing harder does not empty the lungs faster.\r\n\r\nThe cost of overcoming both loads is the **work of breathing**. Elastic work grows with the size of each breath and resistive work with the speed of airflow, so people with stiff lungs tend to take rapid, shallow breaths, and people with narrowed airways slow, deep ones.\r\n\r\n## Lung volumes\r\n\r\nThe air in the lungs is divided into standard volumes. A normal resting breath is the **tidal volume**, about 500 mL. After a quiet exhalation more air can still be forced out, the **expiratory reserve volume**, and even after the most forceful exhalation the **residual volume** remains. The largest breath that can be exhaled after a full inhalation is the **vital capacity**, and the volume of air in the lungs after a full inhalation is the **total lung capacity**.\r\n\r\n**Spirometry** measures the air that moves in and out, and how fast it moves. It cannot measure the residual volume or any capacity that includes it, such as the functional residual capacity and total lung capacity; those require gas-dilution methods or body plethysmography. Spirometry does measure the **FEV₁/FVC ratio**, the fraction of a forced vital capacity exhaled in the first second. When airway resistance rises, as in asthma or chronic obstructive pulmonary disease, this ratio falls.\r\n\r\n## Ventilation and dead space\r\n\r\n**Minute ventilation** is the total air breathed per minute, tidal volume times breathing rate. Only part of it is useful. Each breath first fills the conducting airways, the **anatomic dead space** of about 150 mL, where no gas exchange takes place. The **physiologic dead space** adds any alveoli that are ventilated but not perfused; in healthy lungs it is close to the anatomic value. What remains is the **alveolar ventilation**, the fresh air reaching gas-exchanging alveoli each minute, and alveolar ventilation is what sets the level of carbon dioxide in arterial blood.\r\n\r\nBecause the dead space is subtracted from every breath, the pattern of breathing matters. The same minute ventilation taken as rapid, shallow breaths spends a larger share of each breath on dead space and leaves less alveolar ventilation.\r\n\r\n## Further reading\r\n\r\nThe standard concise account is in John B. West and Andrew M. Luks, *West's Respiratory Physiology: The Essentials*: chapter 2, \"Ventilation,\" and chapter 7, \"Mechanics of Breathing.\""
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
      "puzzleId": "mechanics-of-breathing",
      "puzzleRevision": "fnv1a32:aa2b0961",
      "board": {
        "width": 1080,
        "height": 690
      },
      "nodes": {
        "term:intrapleural pressure": {
          "x": 733.36,
          "y": 361.19
        },
        "term:alveolar pressure": {
          "x": 934.24,
          "y": 59.05
        },
        "term:transpulmonary pressure": {
          "x": 974.61,
          "y": 215.63
        },
        "term:Boyle's law": {
          "x": 851.67,
          "y": 267.51
        },
        "term:lung compliance": {
          "x": 871.4,
          "y": 425.47
        },
        "term:surfactant": {
          "x": 886.76,
          "y": 496.07
        },
        "term:surface tension": {
          "x": 571.47,
          "y": 564.48
        },
        "term:law of Laplace": {
          "x": 736.13,
          "y": 571.45
        },
        "term:chest wall recoil": {
          "x": 932.79,
          "y": 603.3
        },
        "term:Poiseuille's law": {
          "x": 314.72,
          "y": 167.78
        },
        "term:bronchial smooth muscle": {
          "x": 389.04,
          "y": 40.91
        },
        "term:medium-sized bronchi": {
          "x": 572.08,
          "y": 30.96
        },
        "term:radial traction": {
          "x": 747.35,
          "y": 57.83
        },
        "term:residual volume": {
          "x": 511.45,
          "y": 488.83
        },
        "term:vital capacity": {
          "x": 361.73,
          "y": 655.06
        },
        "term:total lung capacity": {
          "x": 189.72,
          "y": 653.07
        },
        "term:expiratory reserve volume": {
          "x": 136.58,
          "y": 556.48
        },
        "term:spirometry": {
          "x": 388.35,
          "y": 440.35
        },
        "term:minute ventilation": {
          "x": 94.01,
          "y": 342.39
        },
        "term:alveolar ventilation": {
          "x": 93.95,
          "y": 149.68
        },
        "term:anatomic dead space": {
          "x": 268.21,
          "y": 337.97
        },
        "term:physiologic dead space": {
          "x": 211,
          "y": 97.65
        },
        "term:pneumothorax": {
          "x": 1007.01,
          "y": 358.91
        },
        "term:functional residual capacity": {
          "x": 613.17,
          "y": 649.99
        },
        "term:work of breathing": {
          "x": 505.95,
          "y": 385.7
        },
        "term:dynamic airway compression": {
          "x": 643.78,
          "y": 240.75
        },
        "term:FEV₁/FVC ratio": {
          "x": 388.52,
          "y": 263.91
        },
        "term:tidal volume": {
          "x": 236.56,
          "y": 465.62
        },
        "cluster:0": {
          "x": 826.71,
          "y": 125.5
        },
        "cluster:1": {
          "x": 729.93,
          "y": 476.45
        },
        "cluster:2": {
          "x": 495.81,
          "y": 158.96
        },
        "cluster:3": {
          "x": 354.77,
          "y": 559.29
        },
        "cluster:4": {
          "x": 175.41,
          "y": 251.32
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-09T23:31:28.356Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "mechanics-of-breathing",
      "puzzleRevision": "fnv1a32:aa2b0961",
      "board": {
        "width": 1080,
        "height": 690
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 933.05,
          "y": 288.68,
          "pinned": false
        },
        "cluster:1": {
          "x": 540,
          "y": 144.86,
          "pinned": false
        },
        "cluster:2": {
          "x": 767.91,
          "y": 542.29,
          "pinned": true
        },
        "cluster:3": {
          "x": 146.95,
          "y": 288.68,
          "pinned": false
        },
        "cluster:4": {
          "x": 356.35,
          "y": 533.43,
          "pinned": true
        }
      },
      "bridges": {
        "term:pneumothorax": {
          "x": 736.52,
          "y": 216.77,
          "pinned": false
        },
        "term:functional residual capacity": {
          "x": 291.43,
          "y": 91.13,
          "pinned": false
        },
        "term:work of breathing": {
          "x": 555.91,
          "y": 355.02,
          "pinned": true
        },
        "term:dynamic airway compression": {
          "x": 689.59,
          "y": 307.48,
          "pinned": true
        },
        "term:FEV₁/FVC ratio": {
          "x": 373.31,
          "y": 352.96,
          "pinned": true
        },
        "term:tidal volume": {
          "x": 95.53,
          "y": 538.05,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "intrapleural pressure",
          "alveolar pressure",
          "transpulmonary pressure",
          "Boyle's law"
        ],
        "cluster:1": [
          "lung compliance",
          "surfactant",
          "surface tension",
          "law of Laplace",
          "chest wall recoil"
        ],
        "cluster:2": [
          "Poiseuille's law",
          "bronchial smooth muscle",
          "medium-sized bronchi",
          "radial traction"
        ],
        "cluster:3": [
          "residual volume",
          "vital capacity",
          "total lung capacity",
          "expiratory reserve volume",
          "spirometry"
        ],
        "cluster:4": [
          "minute ventilation",
          "alveolar ventilation",
          "anatomic dead space",
          "physiologic dead space"
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
        "totalLength": 2002.7215421565559
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T23:31:19.249Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "mechanics-of-breathing",
      "puzzleRevision": "fnv1a32:aa2b0961",
      "board": {
        "width": 1080,
        "height": 690
      },
      "nodes": {
        "term:intrapleural pressure": {
          "x": 744.84,
          "y": 341.16,
          "pinned": true
        },
        "term:alveolar pressure": {
          "x": 874.74,
          "y": 282.81,
          "pinned": true
        },
        "term:transpulmonary pressure": {
          "x": 869.09,
          "y": 401.35,
          "pinned": true
        },
        "term:Boyle's law": {
          "x": 712.78,
          "y": 261.5,
          "pinned": true
        },
        "term:lung compliance": {
          "x": 985.13,
          "y": 214.38,
          "pinned": true
        },
        "term:surfactant": {
          "x": 1023.71,
          "y": 71.65,
          "pinned": true
        },
        "term:surface tension": {
          "x": 877.56,
          "y": 56.84,
          "pinned": true
        },
        "term:law of Laplace": {
          "x": 794.53,
          "y": 133.27,
          "pinned": true
        },
        "term:chest wall recoil": {
          "x": 525.98,
          "y": 206.19,
          "pinned": true
        },
        "term:Poiseuille's law": {
          "x": 562.59,
          "y": 537.57,
          "pinned": true
        },
        "term:bronchial smooth muscle": {
          "x": 654.98,
          "y": 632.28,
          "pinned": true
        },
        "term:medium-sized bronchi": {
          "x": 438.69,
          "y": 632.72,
          "pinned": true
        },
        "term:radial traction": {
          "x": 411.04,
          "y": 489.73,
          "pinned": true
        },
        "term:residual volume": {
          "x": 263.14,
          "y": 154.26,
          "pinned": false
        },
        "term:vital capacity": {
          "x": 308.56,
          "y": 23,
          "pinned": false
        },
        "term:total lung capacity": {
          "x": 157.4,
          "y": 60.65,
          "pinned": true
        },
        "term:expiratory reserve volume": {
          "x": 125.64,
          "y": 217.4,
          "pinned": true
        },
        "term:spirometry": {
          "x": 330.95,
          "y": 261.39,
          "pinned": false
        },
        "term:minute ventilation": {
          "x": 196.31,
          "y": 566.95,
          "pinned": true
        },
        "term:alveolar ventilation": {
          "x": 252.51,
          "y": 632.16,
          "pinned": true
        },
        "term:anatomic dead space": {
          "x": 252.51,
          "y": 426.46,
          "pinned": true
        },
        "term:physiologic dead space": {
          "x": 122.34,
          "y": 487.9,
          "pinned": true
        },
        "term:pneumothorax": {
          "x": 587.77,
          "y": 312.37,
          "pinned": true
        },
        "term:functional residual capacity": {
          "x": 461.84,
          "y": 96.5,
          "pinned": true
        },
        "term:work of breathing": {
          "x": 982.59,
          "y": 529.46,
          "pinned": true
        },
        "term:dynamic airway compression": {
          "x": 739.19,
          "y": 462.81,
          "pinned": true
        },
        "term:FEV₁/FVC ratio": {
          "x": 436.09,
          "y": 388.76,
          "pinned": true
        },
        "term:tidal volume": {
          "x": 228.49,
          "y": 318.52,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5674.36,
        "score": 5674.358071835985
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T23:31:33.043Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-09T23:19:04.648Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
