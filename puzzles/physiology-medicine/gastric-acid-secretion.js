// Generated from content/puzzles/gastric-acid-secretion.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "gastric-acid-secretion",
  "title": "Gastric acid secretion",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "gastrointestinal"
  },
  "info": {
    "text": "The stomach's parietal cells concentrate hydrogen ions about a million-fold above blood. How they do it, what turns them on and off, and how a meal sequences those signals.",
    "citations": [
      {
        "title": "The Physiology of the Gastric Parietal Cell",
        "author": "Amy C. Engevik, Izumi Kaji, James R. Goldenring",
        "publisher": "Physiological Reviews 100(2)",
        "year": "2020",
        "pages": "573–602",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7327232/"
      },
      {
        "title": "Functional anatomy and physiology of gastric secretion",
        "author": "Mitchell L. Schubert",
        "publisher": "Current Opinion in Gastroenterology 31(6)",
        "year": "2015",
        "pages": "479–485",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26376477/"
      },
      {
        "title": "23.4 The Stomach — Anatomy and Physiology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach"
      }
    ]
  },
  "clusters": [
    {
      "id": "pumping-acid",
      "name": "Pumping acid",
      "color": "teal",
      "fact": "Inside the parietal cell, carbonic anhydrase supplies hydrogen ions and the proton pump trades them for potassium at the apical membrane. Potassium recycles back out, chloride follows through apical channels to make HCl, and a basolateral chloride–bicarbonate exchanger supplies that chloride while sending bicarbonate into the blood as the alkaline tide. Stimulation fuses pump-laden tubulovesicles into the secretory canaliculus.",
      "terms": [
        "proton pump",
        "carbonic anhydrase",
        "apical chloride channel",
        "potassium recycling",
        "chloride–bicarbonate exchanger",
        "tubulovesicle fusion",
        "alkaline tide"
      ],
      "seeds": [
        "proton pump",
        "carbonic anhydrase"
      ],
      "termInfo": {
        "alkaline tide": {
          "text": "The rise in blood and urine bicarbonate after a meal, mirroring the acid the stomach secretes.",
          "links": [
            {
              "href": "wiki:Alkaline tide"
            }
          ]
        },
        "apical chloride channel": "Lets chloride leave the parietal cell into the lumen alongside secreted hydrogen ions, so the product is hydrochloric acid.",
        "carbonic anhydrase": {
          "text": "Enzyme that combines CO₂ and water into carbonic acid, which splits into the H⁺ the cell secretes and HCO₃⁻.",
          "links": [
            {
              "href": "wiki:Carbonic anhydrase"
            }
          ]
        },
        "chloride–bicarbonate exchanger": "Basolateral transporter that brings chloride in from the blood and sends bicarbonate out.",
        "potassium recycling": "Apical potassium channels return K⁺ to the lumen so the proton pump always has potassium to exchange.",
        "proton pump": {
          "text": "The H⁺/K⁺-ATPase: an ATP-driven pump that moves hydrogen ions into the gland lumen in exchange for potassium.",
          "links": [
            {
              "href": "wiki:Hydrogen potassium ATPase"
            }
          ]
        },
        "tubulovesicle fusion": "Stimulation moves stored pump-carrying vesicles into the apical membrane, expanding the secretory canaliculus."
      },
      "info": {
        "text": "Acid secretion is a transport problem: one H⁺ out, one HCO₃⁻ into blood, with K⁺ and Cl⁻ cycling to keep the books balanced.",
        "links": [
          {
            "href": "wiki:Parietal cell",
            "label": "Wikipedia: parietal cell"
          }
        ]
      }
    },
    {
      "id": "switching-on",
      "name": "Switching acid on",
      "color": "blue",
      "fact": "Three stimulants drive the parietal cell: gastrin from antral G cells, histamine from enterochromaffin-like (ECL) cells, and acetylcholine from vagal and enteric neurons. They act through the CCK2, H2, and M3 receptors. Vagal neurons also release gastrin-releasing peptide onto G cells.",
      "terms": [
        "gastrin",
        "histamine",
        "acetylcholine",
        "gastrin-releasing peptide",
        "H2 receptor",
        "CCK2 receptor",
        "M3 receptor"
      ],
      "seeds": [
        "gastrin",
        "histamine"
      ],
      "termInfo": {
        "CCK2 receptor": {
          "text": "The gastrin receptor, on ECL cells and parietal cells (also called the CCKB receptor).",
          "links": [
            {
              "href": "wiki:Cholecystokinin B receptor"
            }
          ]
        },
        "H2 receptor": {
          "text": "The histamine receptor on parietal cells; it raises cAMP.",
          "links": [
            {
              "href": "wiki:Histamine H2 receptor"
            }
          ]
        },
        "M3 receptor": {
          "text": "The muscarinic acetylcholine receptor on parietal cells.",
          "links": [
            {
              "href": "wiki:Muscarinic acetylcholine receptor M3"
            }
          ]
        },
        "acetylcholine": "Neurotransmitter from vagal and enteric nerve endings that acts directly on parietal cells.",
        "gastrin": {
          "text": "Hormone from G cells in the antrum; its main acid effect is driving ECL cells to release histamine.",
          "links": [
            {
              "href": "wiki:Gastrin"
            }
          ]
        },
        "gastrin-releasing peptide": {
          "text": "Neurotransmitter from vagal nerve endings that makes G cells release gastrin.",
          "links": [
            {
              "href": "wiki:Gastrin-releasing peptide"
            }
          ]
        },
        "histamine": {
          "text": "Paracrine stimulant released by ECL cells beside the parietal cells.",
          "links": [
            {
              "href": "wiki:Enterochromaffin-like cell"
            }
          ]
        }
      },
      "info": {
        "text": "Gastrin works mostly indirectly, by making ECL cells release histamine next to the parietal cells.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/26376477/",
            "label": "Schubert: physiology of gastric secretion"
          }
        ]
      }
    },
    {
      "id": "applying-brakes",
      "name": "Applying the brakes",
      "color": "amber",
      "fact": "Somatostatin from D cells is the main paracrine brake, restraining G cells, ECL cells, and parietal cells. From the duodenum, secretin, cholecystokinin, and GLP-1 slow acid once chyme leaves the stomach, and prostaglandin E2 damps parietal-cell cAMP while protecting the mucosa.",
      "terms": [
        "somatostatin",
        "secretin",
        "cholecystokinin",
        "prostaglandin E2",
        "GLP-1"
      ],
      "seeds": [
        "somatostatin",
        "secretin"
      ],
      "termInfo": {
        "GLP-1": {
          "text": "Glucagon-like peptide-1, an intestinal hormone that slows gastric acid secretion and emptying.",
          "links": [
            {
              "href": "wiki:Glucagon-like peptide-1"
            }
          ]
        },
        "cholecystokinin": {
          "text": "Duodenal hormone released by fat and protein; it inhibits acid largely by stimulating D-cell somatostatin.",
          "links": [
            {
              "href": "wiki:Cholecystokinin"
            }
          ]
        },
        "prostaglandin E2": {
          "text": "Local lipid messenger that lowers parietal-cell cAMP and supports the mucus–bicarbonate barrier.",
          "links": [
            {
              "href": "wiki:Prostaglandin E2"
            }
          ]
        },
        "secretin": {
          "text": "Duodenal hormone released when acid enters the intestine; it curbs gastrin and acid.",
          "links": [
            {
              "href": "wiki:Secretin"
            }
          ]
        },
        "somatostatin": {
          "text": "Released by D cells in the stomach; it inhibits gastrin, histamine, and acid release.",
          "links": [
            {
              "href": "wiki:Somatostatin"
            }
          ]
        }
      },
      "info": {
        "text": "Inhibitors arriving from the intestine were once grouped under the name enterogastrones.",
        "links": [
          {
            "href": "wiki:Enterogastrone",
            "label": "Wikipedia: enterogastrone"
          }
        ]
      }
    },
    {
      "id": "meal-phases",
      "name": "Phases of a meal",
      "color": "magenta",
      "fact": "Acid secretion follows the meal: a cephalic phase triggered by the sight and smell of food, a gastric phase driven by stomach distension and dietary peptides, and an intestinal phase that briefly stimulates and then mostly inhibits. The gastric phase supplies the largest share of a meal's acid.",
      "terms": [
        "cephalic phase",
        "gastric phase",
        "intestinal phase",
        "sight and smell of food",
        "stomach distension",
        "dietary peptides"
      ],
      "seeds": [
        "cephalic phase",
        "gastric phase"
      ],
      "termInfo": {
        "cephalic phase": "Acid secretion that begins before food arrives, signalled from the brain.",
        "dietary peptides": "Protein fragments and amino acids in the stomach that trigger gastrin release during the gastric phase.",
        "gastric phase": "Acid secretion while food is in the stomach; the largest share of a meal's acid.",
        "intestinal phase": "Secretion governed from the duodenum; a brief boost, then mainly inhibition.",
        "sight and smell of food": "Sensory cues (with taste, chewing, and thought) that start the cephalic phase.",
        "stomach distension": "Stretch of the stomach wall that triggers reflexes boosting the gastric phase."
      },
      "info": {
        "text": "Each phase is named for where its stimulus is sensed: the head, the stomach, or the intestine.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach",
            "label": "OpenStax: the stomach"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "vagus-nerve",
      "term": "vagus nerve",
      "clusters": [
        3,
        1
      ],
      "fact": "The vagus nerve carries the cephalic phase to the stomach, releasing acetylcholine onto parietal cells and gastrin-releasing peptide onto G cells.",
      "info": {
        "text": "Cutting the vagus (vagotomy) abolishes the cephalic phase.",
        "links": [
          {
            "href": "wiki:Vagus nerve"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "cephalic phase",
        "acetylcholine"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    },
    {
      "id": "second-messengers",
      "term": "second messengers",
      "clusters": [
        1,
        0
      ],
      "fact": "Histamine raises cAMP while gastrin and acetylcholine raise calcium; both pathways drive tubulovesicle fusion, and acting together they produce more acid than their sum (potentiation).",
      "info": {
        "text": "Potentiation is why blocking histamine also blunts the response to gastrin and acetylcholine.",
        "links": [
          {
            "href": "wiki:Second messenger system"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "tubulovesicle fusion"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "low-antral-ph",
      "term": "low antral pH",
      "clusters": [
        0,
        2
      ],
      "fact": "When secreted acid drops antral pH low, D cells release somatostatin, which shuts down gastrin release: acid limits its own secretion.",
      "info": {
        "text": "This negative feedback ends the gastric phase as the stomach acidifies.",
        "links": [
          {
            "href": "wiki:Delta cell"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "somatostatin"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "chyme-in-duodenum",
      "term": "chyme in the duodenum",
      "clusters": [
        3,
        2
      ],
      "fact": "Acid, fat, and protein reaching the duodenum release secretin and cholecystokinin, turning the intestinal phase mainly inhibitory.",
      "info": {
        "text": "The intestine thus paces acid output to what it can neutralize.",
        "links": [
          {
            "href": "wiki:Duodenum"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "intestinal phase",
        "secretin"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "calcium-stimulants",
      "prompt": "Which two stimulants act on the parietal cell by raising intracellular calcium?",
      "explanation": "Gastrin (through CCK2 receptors) and acetylcholine (through M3 receptors) both raise calcium. Histamine works through cAMP via H2 receptors, and gastrin-releasing peptide acts on G cells instead of parietal cells.",
      "targets": [
        "gastrin",
        "acetylcholine"
      ],
      "reasons": {
        "acetylcholine": "Its M3 receptor raises calcium in the parietal cell.",
        "gastrin": "Its CCK2 receptor raises calcium in the parietal cell."
      }
    },
    {
      "id": "acid-restrains-itself",
      "prompt": "Within the stomach itself, which two terms make acid restrain its own secretion?",
      "explanation": "As acid lowers antral pH, D cells release somatostatin, which shuts off gastrin. Secretin and cholecystokinin also restrain acid, but they are released from the duodenum once chyme leaves the stomach.",
      "targets": [
        "low antral pH",
        "somatostatin"
      ],
      "reasons": {
        "low antral pH": "The signal: secreted acid acidifying the antrum.",
        "somatostatin": "The response: D cells' paracrine brake on gastrin release."
      }
    },
    {
      "id": "drug-targets",
      "prompt": "Which two terms are the targets of the two main classes of acid-suppressing drugs?",
      "explanation": "Proton pump inhibitors such as omeprazole block the H⁺/K⁺-ATPase itself, the final step whatever the stimulus. H2 blockers such as famotidine block histamine's receptor, and through potentiation they also blunt gastrin and acetylcholine.",
      "targets": [
        "proton pump",
        "H2 receptor"
      ],
      "reasons": {
        "H2 receptor": "H2 blockers remove histamine's drive on the parietal cell.",
        "proton pump": "Proton pump inhibitors block the final step of acid secretion."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "digestive-absorption-control",
        "reason": "Step back to the survey of gut regulation, where gastrin, secretin, cholecystokinin, and the vagus nerve appear alongside hunger signals and absorption."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the stomach makes acid",
    "summary": "How parietal cells concentrate acid, what switches them on and off, and how a meal sequences the signals.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Gastric juice can reach a pH near 1, a hydrogen-ion concentration roughly a million times that of blood. That acid denatures proteins, activates pepsin, and kills swallowed microbes. It is made by parietal cells in the glands of the stomach's body and fundus, and making it is a problem of moving ions against a steep gradient.\r\n\r\n## Making the acid\r\n\r\nInside each parietal cell, carbonic anhydrase combines carbon dioxide and water into carbonic acid, which splits into a hydrogen ion and bicarbonate. The proton pump, the H⁺/K⁺-ATPase, spends ATP to push each hydrogen ion into the gland lumen in exchange for a potassium ion. Potassium recycling through apical potassium channels keeps the pump supplied, and an apical chloride channel lets chloride follow the hydrogen ions, so the product is hydrochloric acid. On the blood side, a chloride–bicarbonate exchanger brings that chloride in and sends the leftover bicarbonate into the circulation; after a meal this alkaline tide measurably raises blood and urine bicarbonate. A resting parietal cell stores most of its pumps in internal tubulovesicles. Stimulation triggers tubulovesicle fusion with the apical membrane, expanding the secretory canaliculus and multiplying the cell's output.\r\n\r\n## Switching acid on\r\n\r\nThree stimulants act on the parietal cell. Acetylcholine comes from vagal and enteric nerve endings and acts on M3 receptors. Gastrin is a hormone from G cells in the antrum; it acts on CCK2 receptors, mostly on neighboring enterochromaffin-like (ECL) cells, which respond by releasing histamine. Histamine then acts on the parietal cell's H2 receptor. Vagal nerves also release gastrin-releasing peptide onto G cells, adding gastrin to their direct signal.\r\n\r\nThese stimulants converge through second messengers. Histamine raises cAMP; gastrin and acetylcholine raise intracellular calcium. Both pathways drive tubulovesicle fusion, and together they produce more acid than the sum of each alone. This potentiation explains why blocking histamine also blunts the response to the other two. The two main classes of acid-suppressing drugs exploit this machinery: H2 blockers such as famotidine block the H2 receptor, and proton pump inhibitors such as omeprazole block the pump itself.\r\n\r\n## Applying the brakes\r\n\r\nSomatostatin, released by D cells, is the stomach's main brake. It restrains G cells, ECL cells, and parietal cells. Acid regulates itself through this route: low antral pH stimulates D cells, so as the stomach acidifies, somatostatin rises and gastrin falls. Prostaglandin E2 lowers parietal-cell cAMP and also strengthens the protective mucus and bicarbonate layer. Hormones from the intestine add further brakes. Secretin, released when acid enters the duodenum, curbs gastrin and acid; cholecystokinin, released by fat and protein, restrains acid largely by stimulating somatostatin; and GLP-1 slows both acid secretion and gastric emptying.\r\n\r\n## Phases of a meal\r\n\r\nPhysiologists divide a meal's acid secretion into three phases, named for where the stimulus is sensed. The cephalic phase starts before food arrives: the sight and smell of food, along with taste and chewing, signal the brain, and the vagus nerve carries that signal to the stomach. The gastric phase, which produces the largest share of acid, begins when food arrives. Stomach distension triggers local and vagal reflexes, and dietary peptides and amino acids stimulate G cells to release gastrin. The intestinal phase begins as chyme in the duodenum delivers acid, fat, and protein. After a brief stimulatory effect, the duodenum mainly inhibits through secretin and cholecystokinin, pacing acid output to what the intestine can neutralize."
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
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "gastric-acid-secretion",
      "puzzleRevision": "fnv1a32:a9c368c7",
      "board": {
        "width": 1120,
        "height": 730
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 453.92,
          "y": 208.44,
          "pinned": true
        },
        "cluster:1": {
          "x": 927.8,
          "y": 233.52,
          "pinned": true
        },
        "cluster:2": {
          "x": 198.16,
          "y": 546.27,
          "pinned": true
        },
        "cluster:3": {
          "x": 772.56,
          "y": 551.72,
          "pinned": true
        }
      },
      "bridges": {
        "term:vagus nerve": {
          "x": 655.46,
          "y": 344.18,
          "pinned": true
        },
        "term:second messengers": {
          "x": 702.24,
          "y": 62.79,
          "pinned": true
        },
        "term:low antral pH": {
          "x": 470.1,
          "y": 496.57,
          "pinned": true
        },
        "term:chyme in the duodenum": {
          "x": 466.58,
          "y": 685.4,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "proton pump",
          "carbonic anhydrase",
          "apical chloride channel",
          "potassium recycling",
          "chloride–bicarbonate exchanger",
          "tubulovesicle fusion",
          "alkaline tide"
        ],
        "cluster:1": [
          "gastrin",
          "histamine",
          "acetylcholine",
          "gastrin-releasing peptide",
          "H2 receptor",
          "CCK2 receptor",
          "M3 receptor"
        ],
        "cluster:2": [
          "somatostatin",
          "secretin",
          "cholecystokinin",
          "prostaglandin E2",
          "GLP-1"
        ],
        "cluster:3": [
          "cephalic phase",
          "gastric phase",
          "intestinal phase",
          "sight and smell of food",
          "stomach distension",
          "dietary peptides"
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
        "totalLength": 1500.5067086409076
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T21:29:28.350Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "gastric-acid-secretion",
      "puzzleRevision": "fnv1a32:a9c368c7",
      "board": {
        "width": 1120,
        "height": 730
      },
      "nodes": {
        "term:proton pump": {
          "x": 289.7,
          "y": 87.5
        },
        "term:carbonic anhydrase": {
          "x": 733.2,
          "y": 58.77
        },
        "term:apical chloride channel": {
          "x": 505.76,
          "y": 220.89
        },
        "term:potassium recycling": {
          "x": 564.06,
          "y": 29.95
        },
        "term:chloride–bicarbonate exchanger": {
          "x": 347.34,
          "y": 168.99
        },
        "term:tubulovesicle fusion": {
          "x": 644.24,
          "y": 171.03
        },
        "term:alkaline tide": {
          "x": 412.63,
          "y": 30.94
        },
        "term:gastrin": {
          "x": 954.17,
          "y": 249.39
        },
        "term:histamine": {
          "x": 954.07,
          "y": 345.51
        },
        "term:acetylcholine": {
          "x": 651.78,
          "y": 333.44
        },
        "term:gastrin-releasing peptide": {
          "x": 822.19,
          "y": 534.42
        },
        "term:H2 receptor": {
          "x": 698.59,
          "y": 456.24
        },
        "term:CCK2 receptor": {
          "x": 847.56,
          "y": 207.76
        },
        "term:M3 receptor": {
          "x": 923.26,
          "y": 470.93
        },
        "term:somatostatin": {
          "x": 1030.3,
          "y": 628.21
        },
        "term:secretin": {
          "x": 450.26,
          "y": 615.61
        },
        "term:cholecystokinin": {
          "x": 775.25,
          "y": 662.38
        },
        "term:prostaglandin E2": {
          "x": 502.51,
          "y": 695.08
        },
        "term:GLP-1": {
          "x": 634.28,
          "y": 693.09
        },
        "term:cephalic phase": {
          "x": 411,
          "y": 344.03
        },
        "term:gastric phase": {
          "x": 348.25,
          "y": 277.52
        },
        "term:intestinal phase": {
          "x": 287.01,
          "y": 390.45
        },
        "term:sight and smell of food": {
          "x": 117.29,
          "y": 204.94
        },
        "term:stomach distension": {
          "x": 210.92,
          "y": 474.86
        },
        "term:dietary peptides": {
          "x": 91.01,
          "y": 408.02
        },
        "term:vagus nerve": {
          "x": 532.23,
          "y": 421.7
        },
        "term:second messengers": {
          "x": 728.93,
          "y": 258.73
        },
        "term:low antral pH": {
          "x": 1024.13,
          "y": 120.99
        },
        "term:chyme in the duodenum": {
          "x": 389.35,
          "y": 520.59
        },
        "cluster:0": {
          "x": 499.96,
          "y": 108.06
        },
        "cluster:1": {
          "x": 827.34,
          "y": 403.44
        },
        "cluster:2": {
          "x": 615.69,
          "y": 590.94
        },
        "cluster:3": {
          "x": 138.71,
          "y": 282.83
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-09T21:29:23.839Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "gastric-acid-secretion",
      "puzzleRevision": "fnv1a32:a9c368c7",
      "board": {
        "width": 1120,
        "height": 730
      },
      "nodes": {
        "term:proton pump": {
          "x": 937.58,
          "y": 492.96,
          "pinned": false
        },
        "term:carbonic anhydrase": {
          "x": 813.39,
          "y": 380.19,
          "pinned": true
        },
        "term:apical chloride channel": {
          "x": 1017.97,
          "y": 364.13,
          "pinned": true
        },
        "term:potassium recycling": {
          "x": 810.05,
          "y": 556.38,
          "pinned": false
        },
        "term:chloride–bicarbonate exchanger": {
          "x": 956.51,
          "y": 634.57,
          "pinned": true
        },
        "term:tubulovesicle fusion": {
          "x": 688.24,
          "y": 436.57,
          "pinned": false
        },
        "term:alkaline tide": {
          "x": 1045.12,
          "y": 540.86,
          "pinned": true
        },
        "term:gastrin": {
          "x": 508.58,
          "y": 599.16,
          "pinned": true
        },
        "term:histamine": {
          "x": 595.8,
          "y": 513.79,
          "pinned": true
        },
        "term:acetylcholine": {
          "x": 505.2,
          "y": 458,
          "pinned": true
        },
        "term:gastrin-releasing peptide": {
          "x": 355.26,
          "y": 680.49,
          "pinned": true
        },
        "term:H2 receptor": {
          "x": 337.49,
          "y": 589.93,
          "pinned": true
        },
        "term:CCK2 receptor": {
          "x": 557.17,
          "y": 681.16,
          "pinned": true
        },
        "term:M3 receptor": {
          "x": 407.99,
          "y": 527.05,
          "pinned": true
        },
        "term:somatostatin": {
          "x": 716.38,
          "y": 212.02,
          "pinned": true
        },
        "term:secretin": {
          "x": 644.09,
          "y": 293.29,
          "pinned": true
        },
        "term:cholecystokinin": {
          "x": 633.78,
          "y": 123.41,
          "pinned": true
        },
        "term:prostaglandin E2": {
          "x": 858.37,
          "y": 144.01,
          "pinned": true
        },
        "term:GLP-1": {
          "x": 768.15,
          "y": 88.97,
          "pinned": true
        },
        "term:cephalic phase": {
          "x": 239.7,
          "y": 296.63,
          "pinned": false
        },
        "term:gastric phase": {
          "x": 123.41,
          "y": 368.57,
          "pinned": false
        },
        "term:intestinal phase": {
          "x": 395.35,
          "y": 273.13,
          "pinned": true
        },
        "term:sight and smell of food": {
          "x": 100.56,
          "y": 208.81,
          "pinned": false
        },
        "term:stomach distension": {
          "x": 267.83,
          "y": 150.51,
          "pinned": false
        },
        "term:dietary peptides": {
          "x": 222.72,
          "y": 435.1,
          "pinned": true
        },
        "term:vagus nerve": {
          "x": 359.45,
          "y": 375.06,
          "pinned": true
        },
        "term:second messengers": {
          "x": 665.93,
          "y": 598.5,
          "pinned": true
        },
        "term:low antral pH": {
          "x": 893.08,
          "y": 266.81,
          "pinned": true
        },
        "term:chyme in the duodenum": {
          "x": 516.05,
          "y": 190.2,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4966.61,
        "score": 4966.612712204747
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T21:29:20.840Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-09T21:20:29.669Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
