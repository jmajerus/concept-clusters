// Generated from content/puzzles/digestion-and-absorption-of-nutrients.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "digestion-and-absorption-of-nutrients",
  "title": "Digestion and absorption of nutrients",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "gastrointestinal"
  },
  "info": {
    "text": "How carbohydrate, protein, and fat are dismantled in the small intestine and carried across its lining, and how salt and water follow.",
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 65–66",
        "author": "John E. Hall, Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021"
      },
      {
        "title": "Biology of human sodium glucose transporters",
        "author": "Ernest M. Wright, Donald D. F. Loo, Bruce A. Hirayama",
        "publisher": "Physiological Reviews 91(2)",
        "year": "2011",
        "pages": "733–794",
        "url": "https://pubmed.ncbi.nlm.nih.gov/21527736/"
      },
      {
        "title": "Intestinal lipid absorption",
        "author": "Jahangir Iqbal, M. Mahmood Hussain",
        "publisher": "American Journal of Physiology – Endocrinology and Metabolism 296(6)",
        "year": "2009",
        "pages": "E1183–E1194",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2692399/"
      },
      {
        "title": "Digestive Enzymes — The Exocrine Pancreas",
        "publisher": "NCBI Bookshelf",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK54127/"
      },
      {
        "title": "23.7 Chemical Digestion and Absorption: A Closer Look — Anatomy and Physiology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look"
      }
    ]
  },
  "clusters": [
    {
      "id": "carbohydrates",
      "name": "Carbohydrates",
      "color": "teal",
      "fact": "Pancreatic amylase breaks starch into short sugar chains, and enzymes on the intestinal surface such as lactase finish the job, leaving glucose, galactose, and fructose. SGLT1 carries glucose and galactose into the cell, GLUT5 carries fructose, and GLUT2 releases all three into the blood.",
      "terms": [
        "pancreatic amylase",
        "lactase",
        "SGLT1",
        "GLUT5",
        "GLUT2"
      ],
      "seeds": [
        "pancreatic amylase",
        "lactase"
      ],
      "termInfo": {
        "GLUT2": {
          "text": "Facilitated-diffusion carrier on the blood-facing membrane that lets glucose, galactose, and fructose out into the capillaries.",
          "links": [
            {
              "href": "wiki:GLUT2"
            }
          ]
        },
        "GLUT5": {
          "text": "Facilitated-diffusion carrier on the lumen-facing membrane that takes up fructose.",
          "links": [
            {
              "href": "wiki:GLUT5"
            }
          ]
        },
        "SGLT1": {
          "text": "Sodium–glucose cotransporter on the lumen-facing membrane: it pulls glucose or galactose into the cell together with two sodium ions.",
          "links": [
            {
              "href": "wiki:Sodium/glucose cotransporter 1"
            }
          ]
        },
        "lactase": {
          "text": "Membrane-bound enzyme that splits lactose into glucose and galactose. Sucrase-isomaltase and maltase do the same for sucrose, maltose, and starch fragments.",
          "links": [
            {
              "href": "wiki:Lactase"
            }
          ]
        },
        "pancreatic amylase": {
          "text": "Enzyme that splits starch into maltose, maltotriose, and short branched fragments (α-limit dextrins). Salivary amylase starts the same work in the mouth.",
          "links": [
            {
              "href": "wiki:Alpha-amylase"
            }
          ]
        }
      },
      "info": {
        "text": "Only single sugars can be absorbed, so every starch and disaccharide must be split first.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/21527736/",
            "label": "Wright et al.: sodium glucose transporters"
          }
        ]
      }
    },
    {
      "id": "proteins",
      "name": "Proteins",
      "color": "blue",
      "fact": "Pepsin begins protein digestion in the stomach. In the duodenum, enterokinase activates trypsin, and pancreatic proteases cut proteins into peptides, carboxypeptidase trimming from one end. Aminopeptidases on the intestinal surface shorten them further, and PepT1 absorbs the resulting di- and tripeptides.",
      "terms": [
        "pepsin",
        "trypsin",
        "enterokinase",
        "carboxypeptidase",
        "aminopeptidases",
        "PepT1"
      ],
      "seeds": [
        "pepsin",
        "trypsin"
      ],
      "termInfo": {
        "PepT1": "Proton-coupled transporter that absorbs di- and tripeptides; free amino acids enter instead through sodium-coupled carriers.",
        "aminopeptidases": {
          "text": "Membrane-bound enzymes on the intestinal surface that remove amino acids from the amino end of peptides.",
          "links": [
            {
              "href": "wiki:Aminopeptidase"
            }
          ]
        },
        "carboxypeptidase": {
          "text": "Pancreatic protease that removes amino acids one at a time from the carboxyl end of a peptide.",
          "links": [
            {
              "href": "wiki:Carboxypeptidase"
            }
          ]
        },
        "enterokinase": {
          "text": "Enzyme on the duodenal surface (also called enteropeptidase) that converts trypsinogen into active trypsin.",
          "links": [
            {
              "href": "wiki:Enteropeptidase"
            }
          ]
        },
        "pepsin": {
          "text": "Stomach protease, activated from pepsinogen by acid; it handles roughly a tenth to a fifth of protein digestion and stops working once bicarbonate neutralizes the chyme.",
          "links": [
            {
              "href": "wiki:Pepsin"
            }
          ]
        },
        "trypsin": {
          "text": "Pancreatic protease that cuts inside protein chains. Chymotrypsin and elastase are its partners.",
          "links": [
            {
              "href": "wiki:Trypsin"
            }
          ]
        }
      },
      "info": {
        "text": "Proteins leave the gut as amino acids and small peptides; most peptides are split to amino acids inside the cell before reaching the blood.",
        "links": [
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK54127/",
            "label": "NCBI Bookshelf: pancreatic digestive enzymes"
          }
        ]
      }
    },
    {
      "id": "fats",
      "name": "Fats",
      "color": "amber",
      "fact": "Bile salts break fat into small droplets, and pancreatic lipase, anchored to the droplet surface by colipase, splits triglycerides into fatty acids and monoglycerides. Micelles ferry those products to the cell, which rebuilds triglycerides and exports them in chylomicrons. Bile salts themselves are reabsorbed in the ileum and reused through the enterohepatic circulation.",
      "terms": [
        "pancreatic lipase",
        "bile salts",
        "colipase",
        "micelles",
        "chylomicrons",
        "enterohepatic circulation"
      ],
      "seeds": [
        "pancreatic lipase",
        "bile salts"
      ],
      "termInfo": {
        "bile salts": {
          "text": "Detergent molecules made by the liver from cholesterol; they emulsify fat and form micelles.",
          "links": [
            {
              "href": "wiki:Bile acid"
            }
          ]
        },
        "chylomicrons": {
          "text": "Lipoprotein particles in which the intestinal cell exports rebuilt triglycerides; too large for capillaries, they enter lacteals and travel in lymph.",
          "links": [
            {
              "href": "wiki:Chylomicron"
            }
          ]
        },
        "colipase": {
          "text": "Small pancreatic protein that anchors lipase to the bile-coated surface of fat droplets, where lipase could not otherwise work.",
          "links": [
            {
              "href": "wiki:Colipase"
            }
          ]
        },
        "enterohepatic circulation": {
          "text": "Recycling of bile salts: reabsorbed in the terminal ileum, returned to the liver in portal blood, and secreted again several times a day.",
          "links": [
            {
              "href": "wiki:Enterohepatic circulation"
            }
          ]
        },
        "micelles": {
          "text": "Tiny bile-salt clusters that carry fatty acids, monoglycerides, cholesterol, and fat-soluble vitamins to the absorbing surface.",
          "links": [
            {
              "href": "wiki:Micelle"
            }
          ]
        },
        "pancreatic lipase": {
          "text": "The main fat-digesting enzyme: it splits triglycerides into free fatty acids and 2-monoglycerides. Phospholipase A₂ and cholesterol esterase handle the other dietary lipids.",
          "links": [
            {
              "href": "wiki:Pancreatic lipase family"
            }
          ]
        }
      },
      "info": {
        "text": "Fat is insoluble in the watery lumen, so every step of its handling is a solution to that problem.",
        "links": [
          {
            "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2692399/",
            "label": "Iqbal and Hussain: intestinal lipid absorption"
          }
        ]
      }
    },
    {
      "id": "salt-and-water",
      "name": "Salt and water",
      "color": "magenta",
      "fact": "The sodium–potassium pump on the blood side keeps the cell's sodium low, so sodium enters from the lumen, partly through the sodium–hydrogen exchanger. Water follows the absorbed salt by osmosis, and in the colon aldosterone increases sodium absorption.",
      "terms": [
        "sodium–potassium pump",
        "osmosis",
        "sodium–hydrogen exchanger",
        "aldosterone"
      ],
      "seeds": [
        "sodium–potassium pump",
        "osmosis"
      ],
      "termInfo": {
        "aldosterone": {
          "text": "Adrenal hormone that increases sodium absorption, and potassium secretion, in the colon.",
          "links": [
            {
              "href": "wiki:Aldosterone"
            }
          ]
        },
        "osmosis": "Water moving across the lining toward the side with more dissolved particles, following absorbed sodium and nutrients.",
        "sodium–hydrogen exchanger": "Lumen-facing transporter (NHE3) that brings sodium into the cell in exchange for a hydrogen ion.",
        "sodium–potassium pump": {
          "text": "ATP-driven pump on the blood-facing membrane that exports sodium from the intestinal cell, keeping its interior low in sodium.",
          "links": [
            {
              "href": "wiki:Sodium–potassium pump"
            }
          ]
        }
      },
      "info": {
        "text": "The gut absorbs about 8 to 9 liters of water a day, most of it in the small intestine; no transporter moves water directly.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look",
            "label": "OpenStax: chemical digestion and absorption"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "brush-border",
      "term": "brush border",
      "clusters": [
        0,
        1
      ],
      "fact": "The final splitting of both sugars and peptides happens on the brush border, the microvillus surface of the intestinal cells, where membrane-bound enzymes sit beside the transporters that take up their products.",
      "info": {
        "text": "Lactase, sucrase, aminopeptidases, and enterokinase are all brush-border enzymes.",
        "links": [
          {
            "href": "wiki:Brush border"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "lactase",
        "aminopeptidases"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "zymogen-activation",
      "term": "zymogen activation",
      "clusters": [
        1,
        2
      ],
      "fact": "Trypsin, once activated by enterokinase, activates the other pancreatic precursors, including procolipase. Fat digestion therefore depends on the protein-digesting cascade.",
      "info": "Secreting enzymes as inactive zymogens keeps the pancreas from digesting itself.",
      "relationKind": "dynamic",
      "idealTerms": [
        "trypsin",
        "colipase"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "sodium-gradient",
      "term": "sodium gradient",
      "clusters": [
        3,
        0,
        1
      ],
      "fact": "The sodium–potassium pump keeps the intestinal cell low in sodium, and nutrient uptake spends that gradient: SGLT1 brings sodium in with glucose, sodium-coupled carriers bring in amino acids, and PepT1 runs on the protons the sodium–hydrogen exchanger exports.",
      "info": {
        "text": "Built by one ATP-driven pump and spent by many cotransporters: secondary active transport.",
        "links": [
          {
            "href": "wiki:Active transport"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "sodium–potassium pump",
        "SGLT1",
        null
      ]
    },
    {
      "id": "osmotic-diarrhea",
      "term": "osmotic diarrhea",
      "clusters": [
        0,
        3
      ],
      "fact": "Sugar left undigested, as lactose is without lactase, stays in the lumen and holds water there by osmosis; the extra water reaches the colon as diarrhea.",
      "info": {
        "text": "Colonic bacteria ferment the unabsorbed sugar, adding gas and bloating.",
        "links": [
          {
            "href": "wiki:Lactose intolerance"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "lactase",
        "osmosis"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "final-digestion-site",
      "prompt": "Where does the final step of carbohydrate and protein digestion take place?",
      "explanation": "Luminal enzymes such as amylase and trypsin leave fragments too large to absorb; the brush border completes the job at the cell surface.",
      "targets": [
        "brush border"
      ],
      "reasons": {
        "brush border": "Its membrane-bound enzymes finish splitting sugars and peptides right beside the transporters that absorb them."
      }
    },
    {
      "id": "anchored-enzymes",
      "prompt": "Which enzymes are anchored in the intestinal cell membrane rather than secreted?",
      "explanation": "Pancreatic amylase, trypsin, carboxypeptidase, and lipase are secreted into the lumen; pepsin is secreted by the stomach. The brush-border enzymes stay attached to the cells that absorb their products.",
      "targets": [
        "lactase",
        "enterokinase",
        "aminopeptidases"
      ],
      "reasons": {
        "aminopeptidases": "They trim peptides on the brush border.",
        "enterokinase": "It sits on the duodenal brush border, where it activates trypsin.",
        "lactase": "It splits lactose on the brush border."
      }
    },
    {
      "id": "inactive-precursors",
      "prompt": "Which digestive proteins are secreted in an inactive form?",
      "explanation": "Protein-cutting enzymes, and the colipase that depends on them, are kept inactive until they reach the lumen so they cannot digest the cells that make them. Pancreatic amylase and lipase are secreted already active.",
      "targets": [
        "pepsin",
        "trypsin",
        "carboxypeptidase",
        "colipase"
      ],
      "reasons": {
        "carboxypeptidase": "Secreted as procarboxypeptidase and activated by trypsin.",
        "colipase": "Secreted as procolipase and activated by trypsin.",
        "pepsin": "Secreted as pepsinogen and activated by stomach acid.",
        "trypsin": "Secreted as trypsinogen and activated by enterokinase."
      }
    },
    {
      "id": "switching-on",
      "prompt": "Which terms name the steps that activate the pancreatic zymogens in the duodenum?",
      "explanation": "A brush-border enzyme triggers one pancreatic enzyme, which then activates the rest. Carboxypeptidase and colipase are among the precursors switched on, not the switches.",
      "targets": [
        "enterokinase",
        "trypsin",
        "zymogen activation"
      ],
      "reasons": {
        "enterokinase": "It starts the cascade by converting trypsinogen into trypsin.",
        "trypsin": "Once active, it activates more trypsinogen and the other precursors.",
        "zymogen activation": "The cascade itself, which reaches procolipase and so fat digestion."
      }
    },
    {
      "id": "sugar-entry",
      "prompt": "Which transporters carry sugars into the intestinal cell from the lumen?",
      "explanation": "Entry uses two carriers on the lumen-facing membrane; exit uses a third. GLUT2 releases all three sugars into the blood from the cell's other side.",
      "targets": [
        "SGLT1",
        "GLUT5"
      ],
      "reasons": {
        "GLUT5": "It brings in fructose by facilitated diffusion.",
        "SGLT1": "It brings in glucose and galactose together with sodium."
      }
    },
    {
      "id": "blood-side",
      "prompt": "Which transporters sit on the blood-facing membrane of the intestinal cell?",
      "explanation": "Absorption is a two-membrane journey. SGLT1, GLUT5, PepT1, and the sodium–hydrogen exchanger face the lumen.",
      "targets": [
        "GLUT2",
        "sodium–potassium pump"
      ],
      "reasons": {
        "GLUT2": "It releases absorbed sugars into the capillaries.",
        "sodium–potassium pump": "It exports sodium into the tissue fluid, keeping the cell's sodium low."
      }
    },
    {
      "id": "sodium-driven-entry",
      "prompt": "Which lumen-facing transporters are driven directly by the sodium gradient?",
      "explanation": "PepT1 runs on a proton gradient instead, which the sodium–hydrogen exchanger helps create, so it depends on sodium only indirectly. GLUT5 needs no gradient at all.",
      "targets": [
        "SGLT1",
        "sodium–hydrogen exchanger"
      ],
      "reasons": {
        "SGLT1": "Sodium flowing into the cell pulls glucose in against its gradient.",
        "sodium–hydrogen exchanger": "Sodium flowing in drives a hydrogen ion out."
      }
    },
    {
      "id": "peptide-uptake",
      "prompt": "Which transporter absorbs di- and tripeptides?",
      "explanation": "Much of dietary protein is absorbed as short peptides rather than free amino acids; enzymes inside the cell then split them before they enter the blood.",
      "targets": [
        "PepT1"
      ],
      "reasons": {
        "PepT1": "It carries small peptides into the cell together with hydrogen ions."
      }
    },
    {
      "id": "fat-route",
      "prompt": "Which terms carry the products of fat digestion from the lumen into lymph?",
      "explanation": "Lipase and colipase produce the fat products but do not move them. Chylomicrons are too large for capillaries, so fat reaches the blood by way of the lymph.",
      "targets": [
        "bile salts",
        "micelles",
        "chylomicrons"
      ],
      "reasons": {
        "bile salts": "They form the micelles that dissolve the fat products.",
        "chylomicrons": "The cell packages rebuilt fat into them for export into lacteals.",
        "micelles": "They ferry fatty acids and monoglycerides across the watery layer to the cell."
      }
    },
    {
      "id": "ileal-resection",
      "prompt": "Removing the terminal ileum causes fat malabsorption by breaking which loop?",
      "explanation": "The liver cannot make bile salts fast enough to replace a broken recycling loop, so micelle formation and fat absorption fail.",
      "targets": [
        "enterohepatic circulation"
      ],
      "reasons": {
        "enterohepatic circulation": "Without the ileum, bile salts are lost in the stool instead of returning to the liver."
      }
    },
    {
      "id": "colonic-sodium",
      "prompt": "Which hormone increases sodium absorption by the colon?",
      "explanation": "Aldosterone's main target is the kidney, but the colon responds the same way, which matters most when the body is short of salt.",
      "targets": [
        "aldosterone"
      ],
      "reasons": {
        "aldosterone": "It raises sodium absorption and potassium secretion in the colon, as it does in the kidney."
      }
    },
    {
      "id": "pancreatic-failure",
      "prompt": "Which digestive secretions are lost when the exocrine pancreas fails?",
      "explanation": "Fat digestion fails most visibly, producing fatty stools. Pepsin comes from the stomach, bile salts from the liver, and the brush-border enzymes from the intestine, so those survive.",
      "targets": [
        "pancreatic amylase",
        "trypsin",
        "carboxypeptidase",
        "pancreatic lipase",
        "colipase"
      ],
      "reasons": {
        "carboxypeptidase": "The pancreatic exopeptidase.",
        "colipase": "Lipase's anchor on fat droplets.",
        "pancreatic amylase": "The main starch-digesting enzyme.",
        "pancreatic lipase": "The main fat-digesting enzyme.",
        "trypsin": "The main protease and the activator of the other precursors."
      }
    },
    {
      "id": "oral-rehydration",
      "prompt": "Which terms carry the effect of glucose in oral rehydration solution through to water absorption?",
      "explanation": "Oral rehydration works in cholera because the toxin drives chloride secretion but leaves glucose-coupled sodium absorption intact. The sodium–hydrogen exchanger is not part of the glucose effect.",
      "targets": [
        "SGLT1",
        "sodium gradient",
        "sodium–potassium pump",
        "osmosis"
      ],
      "reasons": {
        "SGLT1": "Glucose lets it bring sodium into the cell.",
        "osmosis": "Water follows the absorbed sodium and glucose.",
        "sodium gradient": "The low sodium inside the cell is what drives SGLT1.",
        "sodium–potassium pump": "It moves the absorbed sodium out into the tissue fluid and keeps the gradient going."
      }
    },
    {
      "id": "lactose-intolerance",
      "prompt": "Which two terms explain the diarrhea of lactose intolerance?",
      "explanation": "Lactase activity declines after weaning in most of the world's adults. Unabsorbed lactose keeps water in the gut and is fermented by colonic bacteria.",
      "targets": [
        "lactase",
        "osmotic diarrhea"
      ],
      "reasons": {
        "lactase": "Too little of it leaves lactose undigested.",
        "osmotic diarrhea": "The undigested lactose holds water in the lumen."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "membranes-set-cell-conditions",
        "reason": "See how the sodium–potassium pump builds the sodium gradient that SGLT1 and the other intestinal transporters spend."
      },
      {
        "id": "lymphatic-system",
        "reason": "Follow chylomicrons out of the lacteals and through the lymph to the blood."
      },
      {
        "id": "gastrointestinal-motility",
        "reason": "See the mixing movements that bring chyme into contact with these enzymes and transporters."
      },
      {
        "id": "digestive-absorption-control",
        "reason": "Step back to the introductory survey of absorption and the hormones that time digestion."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From food to blood",
    "summary": "How carbohydrate, protein, and fat are split into absorbable pieces and carried across the intestinal lining, with salt and water following.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Food cannot enter the body until it has been broken into molecules small enough to cross the intestinal lining: single sugars, amino acids and small peptides, fatty acids and monoglycerides. Most of that breakdown, and nearly all absorption, happens in the small intestine. Each nutrient class has its own enzymes and transporters, but they share two features. The final splitting happens on the brush border, the microvillus surface of the intestinal cells, where membrane-bound enzymes sit beside the transporters that take up their products. And absorption is a two-membrane journey: into the cell from the lumen, then out of the cell into blood or lymph.\r\n\r\n## Carbohydrates\r\n\r\nPancreatic amylase splits starch into short chains of two or three glucose units and small branched fragments. Brush-border enzymes finish the job. Lactase splits lactose into glucose and galactose, and sucrase-isomaltase and maltase handle sucrose, maltose, and the starch fragments. Only single sugars can be absorbed. SGLT1, on the lumen-facing membrane, pulls glucose and galactose into the cell together with sodium. GLUT5 takes up fructose by facilitated diffusion. GLUT2, on the blood-facing membrane, lets all three sugars out into the capillaries.\r\n\r\nWhen lactase is lacking, as in most adults worldwide, lactose stays in the lumen. Its molecules hold water there by osmosis, producing osmotic diarrhea, and colonic bacteria ferment it into gas.\r\n\r\n## Proteins\r\n\r\nPepsin, activated from pepsinogen by stomach acid, begins protein digestion. Pancreatic proteases do most of the work, and they are secreted as inactive precursors so they cannot digest the pancreas. In the duodenum, enterokinase, a brush-border enzyme, converts trypsinogen into trypsin. Trypsin then activates the remaining precursors in a cascade of zymogen activation. Trypsin and its partners cut inside protein chains, and carboxypeptidase removes amino acids one at a time from the carboxyl end. On the brush border, aminopeptidases trim peptides from the other end. The products enter the cell as free amino acids, through sodium-coupled carriers, and as di- and tripeptides through PepT1. Most of these peptides are split to amino acids inside the cell before reaching the blood.\r\n\r\n## Fats\r\n\r\nFat does not dissolve in the watery lumen. Bile salts, detergent molecules made by the liver, break it into small droplets. Pancreatic lipase splits triglycerides into fatty acids and monoglycerides, but bile salts coating the droplets would block it; colipase, activated from procolipase by trypsin, anchors lipase to the droplet surface. Fat digestion therefore depends on the protein-digesting cascade. Bile salts then gather the fat products into micelles, which also carry cholesterol and fat-soluble vitamins, and ferry them to the absorbing surface. Inside the cell, the products are rebuilt into triglycerides and packaged into chylomicrons. These particles are too large for capillaries, so they enter the lacteals and travel in lymph. The bile salts are reabsorbed in the terminal ileum and return to the liver in portal blood, an enterohepatic circulation that reuses the same pool several times a day.\r\n\r\n## Salt and water\r\n\r\nThe sodium–potassium pump on the blood-facing membrane keeps the inside of the intestinal cell low in sodium. That sodium gradient powers much of nutrient uptake. SGLT1 spends it directly to bring in glucose, sodium-coupled carriers bring in amino acids, and the sodium–hydrogen exchanger trades incoming sodium for hydrogen ions, building the proton gradient that PepT1 uses. The pump then moves the absorbed sodium out into the tissue fluid. No transporter moves water. Water follows the absorbed salt and nutrients by osmosis, about 8 to 9 liters a day. In the colon, aldosterone increases sodium absorption, as it does in the kidney.\r\n\r\nThis coupling is why oral rehydration solution contains glucose as well as salt. In cholera, the toxin drives chloride and water secretion into the gut, but SGLT1 still works, so glucose carries sodium into the cells and water follows. The treatment saves many lives each year."
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
      "puzzleId": "digestion-and-absorption-of-nutrients",
      "puzzleRevision": "fnv1a32:be6cfb5e",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:pancreatic amylase": {
          "x": 812.65,
          "y": 197.45
        },
        "term:lactase": {
          "x": 667.7,
          "y": 45.04
        },
        "term:SGLT1": {
          "x": 459.94,
          "y": 195.74
        },
        "term:GLUT5": {
          "x": 762.7,
          "y": 135.24
        },
        "term:GLUT2": {
          "x": 573.17,
          "y": 124.75
        },
        "term:pepsin": {
          "x": 994.05,
          "y": 439.45
        },
        "term:trypsin": {
          "x": 873.17,
          "y": 589.87
        },
        "term:enterokinase": {
          "x": 744.4,
          "y": 421.45
        },
        "term:carboxypeptidase": {
          "x": 968.56,
          "y": 522.45
        },
        "term:aminopeptidases": {
          "x": 951.67,
          "y": 263.06
        },
        "term:PepT1": {
          "x": 818.51,
          "y": 491.43
        },
        "term:pancreatic lipase": {
          "x": 594.36,
          "y": 621.93
        },
        "term:bile salts": {
          "x": 437.9,
          "y": 644.98
        },
        "term:colipase": {
          "x": 540.74,
          "y": 536.83
        },
        "term:micelles": {
          "x": 391.17,
          "y": 500.72
        },
        "term:chylomicrons": {
          "x": 167.8,
          "y": 523.6
        },
        "term:enterohepatic circulation": {
          "x": 230.33,
          "y": 628.92
        },
        "term:sodium–potassium pump": {
          "x": 485.53,
          "y": 375.22
        },
        "term:osmosis": {
          "x": 353.33,
          "y": 261.15
        },
        "term:sodium–hydrogen exchanger": {
          "x": 190.12,
          "y": 269.93
        },
        "term:aldosterone": {
          "x": 128.41,
          "y": 354.67
        },
        "term:brush border": {
          "x": 945.65,
          "y": 113.98
        },
        "term:zymogen activation": {
          "x": 705.64,
          "y": 527.66
        },
        "term:sodium gradient": {
          "x": 659.83,
          "y": 305.2
        },
        "term:osmotic diarrhea": {
          "x": 354.42,
          "y": 82.24
        },
        "cluster:0": {
          "x": 632.08,
          "y": 193.54
        },
        "cluster:1": {
          "x": 862.83,
          "y": 358.99
        },
        "cluster:2": {
          "x": 310.12,
          "y": 557.65
        },
        "cluster:3": {
          "x": 288.42,
          "y": 405.66
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T23:20:16.720Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "digestion-and-absorption-of-nutrients",
      "puzzleRevision": "fnv1a32:be6cfb5e",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:pancreatic amylase": {
          "x": 542.6,
          "y": 517.34,
          "pinned": true
        },
        "term:lactase": {
          "x": 442.67,
          "y": 599.89,
          "pinned": true
        },
        "term:SGLT1": {
          "x": 520.24,
          "y": 427.99,
          "pinned": false
        },
        "term:GLUT5": {
          "x": 687.95,
          "y": 499.7,
          "pinned": true
        },
        "term:GLUT2": {
          "x": 618,
          "y": 434,
          "pinned": true
        },
        "term:pepsin": {
          "x": 552.61,
          "y": 139.95,
          "pinned": false
        },
        "term:trypsin": {
          "x": 452.15,
          "y": 99.16,
          "pinned": false
        },
        "term:enterokinase": {
          "x": 652.15,
          "y": 107.49,
          "pinned": false
        },
        "term:carboxypeptidase": {
          "x": 545.39,
          "y": 23,
          "pinned": false
        },
        "term:aminopeptidases": {
          "x": 467.09,
          "y": 215.5,
          "pinned": false
        },
        "term:PepT1": {
          "x": 634.68,
          "y": 200.71,
          "pinned": true
        },
        "term:pancreatic lipase": {
          "x": 325.3,
          "y": 392.44,
          "pinned": false
        },
        "term:bile salts": {
          "x": 348.33,
          "y": 523.47,
          "pinned": false
        },
        "term:colipase": {
          "x": 359.94,
          "y": 270.52,
          "pinned": false
        },
        "term:micelles": {
          "x": 215.45,
          "y": 275.6,
          "pinned": true
        },
        "term:chylomicrons": {
          "x": 233.91,
          "y": 497.65,
          "pinned": false
        },
        "term:enterohepatic circulation": {
          "x": 148.52,
          "y": 357,
          "pinned": false
        },
        "term:sodium–potassium pump": {
          "x": 777.17,
          "y": 246.12,
          "pinned": true
        },
        "term:osmosis": {
          "x": 746.98,
          "y": 378.49,
          "pinned": false
        },
        "term:sodium–hydrogen exchanger": {
          "x": 892.93,
          "y": 349.56,
          "pinned": false
        },
        "term:aldosterone": {
          "x": 921.05,
          "y": 198.69,
          "pinned": true
        },
        "term:brush border": {
          "x": 449.42,
          "y": 351.21,
          "pinned": true
        },
        "term:zymogen activation": {
          "x": 333.35,
          "y": 143.37,
          "pinned": false
        },
        "term:sodium gradient": {
          "x": 584.19,
          "y": 307.76,
          "pinned": false
        },
        "term:osmotic diarrhea": {
          "x": 789.42,
          "y": 599.23,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4439.58,
        "score": 4439.578766629847
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:21:11.682Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "digestion-and-absorption-of-nutrients",
      "puzzleRevision": "fnv1a32:be6cfb5e",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 530,
          "y": 148.8,
          "pinned": false
        },
        "cluster:1": {
          "x": 907.54,
          "y": 326.96,
          "pinned": true
        },
        "cluster:2": {
          "x": 471.89,
          "y": 523.15,
          "pinned": true
        },
        "cluster:3": {
          "x": 169.49,
          "y": 310.93,
          "pinned": true
        }
      },
      "bridges": {
        "term:brush border": {
          "x": 819.13,
          "y": 122.77,
          "pinned": true
        },
        "term:zymogen activation": {
          "x": 747.14,
          "y": 525.1,
          "pinned": true
        },
        "term:sodium gradient": {
          "x": 528.08,
          "y": 339.82,
          "pinned": true
        },
        "term:osmotic diarrhea": {
          "x": 245.38,
          "y": 105.29,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "pancreatic amylase",
          "lactase",
          "SGLT1",
          "GLUT5",
          "GLUT2"
        ],
        "cluster:1": [
          "pepsin",
          "trypsin",
          "enterokinase",
          "carboxypeptidase",
          "aminopeptidases",
          "PepT1"
        ],
        "cluster:2": [
          "pancreatic lipase",
          "bile salts",
          "colipase",
          "micelles",
          "chylomicrons",
          "enterohepatic circulation"
        ],
        "cluster:3": [
          "sodium–potassium pump",
          "osmosis",
          "sodium–hydrogen exchanger",
          "aldosterone"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "GLUT5",
          "pancreatic amylase",
          "lactase",
          "GLUT2",
          "SGLT1"
        ],
        "cluster:1": [
          "pepsin",
          "aminopeptidases",
          "carboxypeptidase",
          "enterokinase",
          "trypsin",
          "PepT1"
        ],
        "cluster:2": [
          "colipase",
          "chylomicrons",
          "enterohepatic circulation",
          "pancreatic lipase",
          "bile salts",
          "micelles"
        ],
        "cluster:3": [
          "osmosis",
          "sodium–potassium pump",
          "sodium–hydrogen exchanger",
          "aldosterone"
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
        "totalLength": 1841.5785135808983
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:22:24.377Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-15T23:20:19.532Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
