// Generated from content/puzzles/acid-base-balance.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "acid-base-balance",
  "title": "Acid–base balance",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "renal"
  },
  "info": {
    "text": "Blood pH depends on the ratio of bicarbonate to dissolved CO₂. Buffers absorb a disturbance at once, the lungs adjust CO₂ within minutes, and the kidneys adjust bicarbonate over days while removing the acids that cannot be exhaled.",
    "links": [
      {
        "href": "wiki:Acid–base homeostasis"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology (14th ed.), ch. 31: Acid–Base Regulation",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2020"
      },
      {
        "title": "Anatomy and Physiology 2e, §26.4 Acid-Base Balance",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-4-acid-base-balance"
      },
      {
        "title": "Anatomy and Physiology 2e, §26.5 Disorders of Acid-Base Balance",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-5-disorders-of-acid-base-balance"
      }
    ]
  },
  "clusters": [
    {
      "id": "chemical-buffering",
      "name": "Chemical buffering",
      "color": "teal",
      "fact": "Buffers bind or release hydrogen ions within a fraction of a second, but they only hold an acid load until the lungs or kidneys remove it. The bicarbonate buffer system dominates the extracellular fluid even though its pK of 6.1 lies well below normal pH, because both of its members are regulated: the lungs set CO₂ and the kidneys set bicarbonate. The Henderson-Hasselbalch equation shows that pH follows the ratio of bicarbonate to dissolved CO₂, about 20 to 1 at pH 7.4. Phosphate and proteins, hemoglobin among them, do most of the buffering inside cells.",
      "terms": [
        "bicarbonate buffer system",
        "Henderson-Hasselbalch equation",
        "phosphate buffer system",
        "protein buffers"
      ],
      "seeds": [
        "bicarbonate buffer system",
        "Henderson-Hasselbalch equation"
      ],
      "termInfo": {
        "Henderson-Hasselbalch equation": {
          "text": "For blood, pH = 6.1 + log([HCO₃⁻] / 0.03 × PCO₂). It ties pH to the ratio of bicarbonate, set by the kidneys, to dissolved CO₂, set by the lungs.",
          "links": [
            {
              "href": "wiki:Henderson–Hasselbalch equation"
            }
          ]
        },
        "bicarbonate buffer system": {
          "text": "Bicarbonate paired with carbonic acid, which stays in equilibrium with dissolved CO₂; the main buffer of plasma and interstitial fluid.",
          "links": [
            {
              "href": "wiki:Bicarbonate buffer system"
            }
          ]
        },
        "phosphate buffer system": "Dihydrogen and monohydrogen phosphate, with a pK of 6.8; important inside cells and in tubular fluid, where phosphate is concentrated.",
        "protein buffers": "Proteins carry groups that bind and release hydrogen ions; inside cells, and as hemoglobin in red cells, they supply most of the body's buffering power."
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-4-acid-base-balance"
          }
        ]
      }
    },
    {
      "id": "excreting-fixed-acid",
      "name": "Excreting fixed acid",
      "color": "blue",
      "fact": "Protein metabolism produces sulfuric and phosphoric acids, about 80 milliequivalents a day, that cannot be exhaled, so only the kidney removes them. Urine pH cannot fall much below 4.5, so the kidney excretes hydrogen ion bound to urinary buffers: some on filtered phosphate as titratable acid, and more as ammonium made from glutamine, the route the kidney can raise severalfold in chronic acidosis. Type A intercalated cells pump hydrogen ion into the collecting duct, and net acid excretion is ammonium plus titratable acid, minus any bicarbonate lost in the urine.",
      "terms": [
        "net acid excretion",
        "ammonium excretion",
        "titratable acid",
        "type A intercalated cell"
      ],
      "seeds": [
        "net acid excretion",
        "ammonium excretion"
      ],
      "termInfo": {
        "ammonium excretion": "Proximal tubule cells break down glutamine into ammonium, which goes into the urine, and bicarbonate, which goes into the blood; in the collecting duct, secreted hydrogen ion also traps ammonia as ammonium.",
        "net acid excretion": "The kidney's daily acid output: ammonium plus titratable acid, minus urinary bicarbonate. In balance it equals the fixed acid the body makes each day.",
        "titratable acid": {
          "text": "Hydrogen ion excreted bound to filtered buffers, mainly phosphate, and measured by titrating urine back to pH 7.4; its amount is limited by how much phosphate is filtered.",
          "links": [
            {
              "href": "wiki:Titratable acid"
            }
          ]
        },
        "type A intercalated cell": "A collecting-duct cell that secretes hydrogen ion with ATP-driven pumps, lowering urine pH to about 4.5; type B cells do the reverse and secrete bicarbonate in alkalosis."
      }
    },
    {
      "id": "acid-base-disorders",
      "name": "Acid–base disorders",
      "color": "amber",
      "fact": "Arterial pH is held between 7.35 and 7.45. A metabolic disorder begins with a change in bicarbonate: it falls when acid is added or bicarbonate is lost, and rises when acid is lost or base is added. A respiratory disorder begins with a change in PCO₂: it rises when breathing fails to clear CO₂ and falls with hyperventilation. The anion gap, sodium minus chloride and bicarbonate, divides metabolic acidosis into cases of added acid, where the gap widens, and cases of bicarbonate loss, where chloride takes bicarbonate's place and the gap stays normal.",
      "terms": [
        "metabolic acidosis",
        "respiratory acidosis",
        "metabolic alkalosis",
        "respiratory alkalosis",
        "anion gap"
      ],
      "seeds": [
        "metabolic acidosis",
        "respiratory acidosis"
      ],
      "termInfo": {
        "anion gap": {
          "text": "Plasma sodium minus chloride and bicarbonate, normally about 8 to 16 mEq/L; it stands for the anions not routinely measured.",
          "links": [
            {
              "href": "wiki:Anion gap"
            }
          ]
        },
        "metabolic acidosis": {
          "text": "Low pH from a primary fall in bicarbonate, as in diabetic ketoacidosis, lactic acidosis, kidney failure, or diarrhea.",
          "links": [
            {
              "href": "wiki:Metabolic acidosis"
            }
          ]
        },
        "metabolic alkalosis": {
          "text": "High pH from a primary rise in bicarbonate, most often from vomiting stomach acid or from diuretics.",
          "links": [
            {
              "href": "wiki:Metabolic alkalosis"
            }
          ]
        },
        "respiratory acidosis": {
          "text": "Low pH from a primary rise in PCO₂, when lung disease or depressed breathing leaves CO₂ unexhaled.",
          "links": [
            {
              "href": "wiki:Respiratory acidosis"
            }
          ]
        },
        "respiratory alkalosis": {
          "text": "High pH from a primary fall in PCO₂, caused by hyperventilation, as with anxiety or a rapid ascent to high altitude.",
          "links": [
            {
              "href": "wiki:Respiratory alkalosis"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/26-5-disorders-of-acid-base-balance"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "new-bicarbonate",
      "term": "new bicarbonate",
      "clusters": [
        1,
        0
      ],
      "fact": "Buffering a fixed acid uses up bicarbonate, and reclaiming filtered bicarbonate only keeps what was already there. Each hydrogen ion the kidney excretes as titratable acid or ammonium adds one new bicarbonate to the blood, restoring the buffer the acid consumed.",
      "info": "Bicarbonate made by tubule cells and added to the blood, as distinct from filtered bicarbonate reclaimed from the tubule.",
      "relationKind": "dynamic",
      "idealTerms": [
        "ammonium excretion",
        "bicarbonate buffer system"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "respiratory-compensation",
      "term": "respiratory compensation",
      "clusters": [
        2,
        0
      ],
      "fact": "In a metabolic disorder the lungs move PCO₂ in the same direction as bicarbonate, pulling the ratio in the Henderson-Hasselbalch equation back toward 20 to 1. Faster, deeper breathing in metabolic acidosis begins within minutes but only partly restores pH, and slower breathing in metabolic alkalosis is limited because it also lowers blood oxygen.",
      "info": "The lungs' adjustment of PCO₂ to offset a metabolic disturbance.",
      "relationKind": "dynamic",
      "idealTerms": [
        "metabolic acidosis",
        "Henderson-Hasselbalch equation"
      ]
    },
    {
      "id": "renal-compensation",
      "term": "renal compensation",
      "clusters": [
        2,
        1
      ],
      "fact": "In a respiratory disorder the kidney moves bicarbonate in the same direction as PCO₂. In respiratory acidosis it raises net acid excretion, chiefly as ammonium, adding new bicarbonate to the blood; in respiratory alkalosis it excretes bicarbonate. The response takes three to five days to develop fully.",
      "info": "The kidney's adjustment of acid excretion to offset a respiratory disturbance.",
      "relationKind": "dynamic",
      "idealTerms": [
        "respiratory acidosis",
        "net acid excretion"
      ]
    }
  ],
  "lenses": [
    {
      "id": "sources-of-new-bicarbonate",
      "prompt": "Which parts of net acid excretion each return a new bicarbonate to the blood?",
      "explanation": "Reclaiming filtered bicarbonate adds nothing new; it only prevents a loss. Bicarbonate that escapes into the urine counts against net acid excretion rather than toward it.",
      "targets": [
        "titratable acid",
        "ammonium excretion"
      ],
      "reasons": {
        "ammonium excretion": "Breaking down glutamine yields ammonium for the urine and bicarbonate for the blood, one for one.",
        "titratable acid": "Each hydrogen ion carried out on phosphate was made in a tubule cell alongside a bicarbonate that went to the blood."
      }
    },
    {
      "id": "vomiting",
      "prompt": "Which disorder does prolonged vomiting of stomach acid cause?",
      "explanation": "The primary change is in bicarbonate, so the disorder is metabolic. The loss of fluid and chloride then leads the kidney to keep reclaiming bicarbonate, which sustains the alkalosis.",
      "targets": [
        "metabolic alkalosis"
      ],
      "reasons": {
        "metabolic alkalosis": "Losing hydrochloric acid leaves behind the bicarbonate the stomach's cells made alongside it, raising plasma bicarbonate."
      }
    },
    {
      "id": "slow-compensation",
      "prompt": "Which compensation takes days to develop fully?",
      "explanation": "Respiratory compensation changes PCO₂ within minutes. The kidney's change in bicarbonate is slower, but it can be sustained for as long as the respiratory disorder lasts.",
      "targets": [
        "renal compensation"
      ],
      "reasons": {
        "renal compensation": "Raising ammonium production and net acid excretion takes three to five days."
      }
    },
    {
      "id": "anion-gap-sorting",
      "prompt": "Which measurement separates diabetic ketoacidosis from diarrhea as a cause of acidosis?",
      "explanation": "Both cause metabolic acidosis with low bicarbonate, so pH and PCO₂ alone cannot tell them apart. The gap shows whether an acid was added or a base was lost.",
      "targets": [
        "anion gap"
      ],
      "reasons": {
        "anion gap": "Ketoacids add unmeasured anions and widen the gap; diarrhea loses bicarbonate, chloride takes its place, and the gap stays normal."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "buffers-and-titration",
        "reason": "The chemistry behind this lesson: how a weak acid and its conjugate base resist a change in pH, and where the Henderson-Hasselbalch equation comes from.",
        "via": [
          "Henderson-Hasselbalch equation"
        ]
      },
      {
        "id": "how-the-kidney-forms-urine",
        "reason": "Introduces the hydrogen ion and ammonium secretion, and the bicarbonate reclaiming, that this lesson builds into net acid excretion."
      },
      {
        "id": "gas-exchange-and-transport",
        "reason": "Shows how red cells turn CO₂ into bicarbonate for transport, the chemistry that links breathing to blood pH."
      },
      {
        "id": "control-of-breathing",
        "reason": "Explains the chemoreceptor reflex that drives respiratory compensation, including the deep, rapid breathing of severe metabolic acidosis."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body defends its pH",
    "summary": "Buffers, lungs, and kidneys each hold blood pH in a narrow range, working on different timescales, and only the kidneys can remove the acids that cannot be exhaled.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Blood pH stays between 7.35 and 7.45, a narrow range given how much acid the body makes. Every day metabolism produces large amounts of CO₂, which forms carbonic acid in water, and about 80 milliequivalents of acids that cannot be exhaled, mostly sulfuric and phosphoric acid from protein. Three defenses keep pH in range. Chemical buffers act in seconds. The lungs adjust CO₂ within minutes. The kidneys adjust bicarbonate over hours to days, and only the kidneys can remove the nonvolatile, or fixed, acids.\r\n\r\n## Buffering\r\n\r\nA buffer is a weak acid and its partner base that together take up or release hydrogen ions, damping a change in pH. The bicarbonate buffer system, bicarbonate paired with carbonic acid and dissolved CO₂, is the main buffer outside cells. Inside cells, the phosphate buffer system and protein buffers, including hemoglobin in red cells, do most of the work.\r\n\r\nThe Henderson-Hasselbalch equation, applied to blood, shows why bicarbonate matters most:\r\n\r\npH = 6.1 + log([HCO₃⁻] / (0.03 × PCO₂))\r\n\r\nWith bicarbonate at 24 mEq/L and PCO₂ at 40 mm Hg, the ratio is 20 to 1 and pH is 7.4. A pK of 6.1 is far from 7.4, which would make bicarbonate a weak buffer in a sealed flask. In the body both of its members are regulated: the lungs set PCO₂ and the kidneys set bicarbonate. Because pH depends on their ratio, a change in either can be offset by a change in the other.\r\n\r\nBuffers only hold an acid load. A fixed acid buffered by bicarbonate becomes CO₂, which the lungs exhale, but the bicarbonate it used up is gone until the kidney replaces it.\r\n\r\n## Excreting fixed acid\r\n\r\nThe kidney first reclaims nearly all the bicarbonate it filters, which removes no acid. Removing acid requires hydrogen ion to leave in the urine, and urine pH cannot fall much below 4.5, so free hydrogen ion carries almost none away. The kidney excretes it on urinary buffers instead.\r\n\r\nSome hydrogen ion is carried on filtered phosphate and leaves as titratable acid, measured by titrating urine back to pH 7.4. Filtered phosphate is limited, so this route cannot rise much. The larger route is ammonium excretion. Proximal tubule cells break down glutamine into ammonium, which goes into the urine, and bicarbonate, which goes into the blood. In the collecting duct, type A intercalated cells pump hydrogen ion into the lumen, where it traps ammonia as ammonium and binds the remaining phosphate. In chronic acidosis the kidney can raise ammonium excretion severalfold.\r\n\r\nEach hydrogen ion excreted this way returns new bicarbonate to the blood, replacing what buffering consumed. Net acid excretion adds ammonium and titratable acid and subtracts any bicarbonate lost in the urine; in balance it matches the fixed acid made each day.\r\n\r\n## Disorders and compensation\r\n\r\nAn acid–base disorder is named for the direction of pH and the variable that changed first. Metabolic acidosis begins with a fall in bicarbonate, from an added acid such as the ketoacids of diabetic ketoacidosis or from bicarbonate lost in diarrhea. Metabolic alkalosis begins with a rise in bicarbonate, most often from vomiting stomach acid. Respiratory acidosis begins with a rise in PCO₂ when breathing fails to clear CO₂, and respiratory alkalosis with a fall in PCO₂ from hyperventilation.\r\n\r\nThe anion gap, sodium minus chloride and bicarbonate, helps sort metabolic acidosis. An added acid brings unmeasured anions with it and widens the gap. Bicarbonate lost in diarrhea is replaced by chloride, and the gap stays normal.\r\n\r\nCompensation moves the other member of the ratio in the same direction as the primary change. In respiratory compensation for a metabolic disorder, the lungs change PCO₂: faster, deeper breathing in metabolic acidosis lowers it within minutes. The correction is only partial, and it is weaker against alkalosis, because slowing breathing also lowers blood oxygen. In renal compensation for a respiratory disorder, the kidney changes bicarbonate, raising net acid excretion in respiratory acidosis or excreting bicarbonate in respiratory alkalosis. It takes three to five days to develop fully. Neither form of compensation removes the underlying cause."
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
    "lensFlowTrace": true
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "acid-base-balance",
      "puzzleRevision": "fnv1a32:12493bf8",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:bicarbonate buffer system": {
          "x": 624.82,
          "y": 161.01
        },
        "term:Henderson-Hasselbalch equation": {
          "x": 248.02,
          "y": 241.17
        },
        "term:phosphate buffer system": {
          "x": 277.55,
          "y": 22
        },
        "term:protein buffers": {
          "x": 522.68,
          "y": 22
        },
        "term:net acid excretion": {
          "x": 649.68,
          "y": 598
        },
        "term:ammonium excretion": {
          "x": 778.28,
          "y": 289.05
        },
        "term:titratable acid": {
          "x": 892.75,
          "y": 419.48
        },
        "term:type A intercalated cell": {
          "x": 864.4,
          "y": 598
        },
        "term:metabolic acidosis": {
          "x": 340.72,
          "y": 452.74
        },
        "term:respiratory acidosis": {
          "x": 434.97,
          "y": 598
        },
        "term:metabolic alkalosis": {
          "x": 260.8,
          "y": 598
        },
        "term:respiratory alkalosis": {
          "x": 86.15,
          "y": 598
        },
        "term:anion gap": {
          "x": 48.35,
          "y": 380.74
        },
        "term:new bicarbonate": {
          "x": 624.49,
          "y": 368.89
        },
        "term:respiratory compensation": {
          "x": 458.43,
          "y": 312.31
        },
        "term:renal compensation": {
          "x": 549.43,
          "y": 471.96
        },
        "cluster:0": {
          "x": 419.83,
          "y": 132.34
        },
        "cluster:1": {
          "x": 739.74,
          "y": 457.2
        },
        "cluster:2": {
          "x": 172.67,
          "y": 444.41
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-11T16:26:27.144Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "acid-base-balance",
      "puzzleRevision": "fnv1a32:12493bf8",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:bicarbonate buffer system": {
          "x": 815.32,
          "y": 294.72,
          "pinned": false
        },
        "term:Henderson-Hasselbalch equation": {
          "x": 605.78,
          "y": 223.74,
          "pinned": false
        },
        "term:phosphate buffer system": {
          "x": 743.21,
          "y": 58.49,
          "pinned": false
        },
        "term:protein buffers": {
          "x": 890.75,
          "y": 137.98,
          "pinned": false
        },
        "term:net acid excretion": {
          "x": 512.52,
          "y": 399.76,
          "pinned": false
        },
        "term:ammonium excretion": {
          "x": 673.51,
          "y": 411.08,
          "pinned": false
        },
        "term:titratable acid": {
          "x": 649.69,
          "y": 561.15,
          "pinned": false
        },
        "term:type A intercalated cell": {
          "x": 479.58,
          "y": 577.02,
          "pinned": false
        },
        "term:metabolic acidosis": {
          "x": 229.97,
          "y": 345.39,
          "pinned": false
        },
        "term:respiratory acidosis": {
          "x": 203.5,
          "y": 510.98,
          "pinned": false
        },
        "term:metabolic alkalosis": {
          "x": 82.08,
          "y": 273.26,
          "pinned": false
        },
        "term:respiratory alkalosis": {
          "x": 225.41,
          "y": 174.61,
          "pinned": false
        },
        "term:anion gap": {
          "x": 111.63,
          "y": 406.21,
          "pinned": false
        },
        "term:new bicarbonate": {
          "x": 814.1,
          "y": 468.72,
          "pinned": false
        },
        "term:respiratory compensation": {
          "x": 391.78,
          "y": 265.85,
          "pinned": false
        },
        "term:renal compensation": {
          "x": 357.42,
          "y": 444.42,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3435.56,
        "score": 3435.5612580105403
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T15:08:27.139Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "acid-base-balance",
      "puzzleRevision": "fnv1a32:12493bf8",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 201.55,
          "y": 218.73,
          "pinned": true
        },
        "cluster:1": {
          "x": 469.98,
          "y": 443.38,
          "pinned": true
        },
        "cluster:2": {
          "x": 769.47,
          "y": 273.85,
          "pinned": true
        }
      },
      "bridges": {
        "term:new bicarbonate": {
          "x": 245.19,
          "y": 458.71,
          "pinned": true
        },
        "term:respiratory compensation": {
          "x": 482,
          "y": 190.78,
          "pinned": true
        },
        "term:renal compensation": {
          "x": 514.04,
          "y": 252.93,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "bicarbonate buffer system",
          "Henderson-Hasselbalch equation",
          "phosphate buffer system",
          "protein buffers"
        ],
        "cluster:1": [
          "net acid excretion",
          "ammonium excretion",
          "titratable acid",
          "type A intercalated cell"
        ],
        "cluster:2": [
          "metabolic acidosis",
          "respiratory acidosis",
          "metabolic alkalosis",
          "respiratory alkalosis",
          "anion gap"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "phosphate buffer system",
          "Henderson-Hasselbalch equation",
          "bicarbonate buffer system",
          "protein buffers"
        ],
        "cluster:1": [
          "net acid excretion",
          "type A intercalated cell",
          "ammonium excretion",
          "titratable acid"
        ],
        "cluster:2": [
          "metabolic acidosis",
          "metabolic alkalosis",
          "respiratory alkalosis",
          "respiratory acidosis",
          "anion gap"
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
        "totalLength": 1073.6685348794417
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T16:26:11.683Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
