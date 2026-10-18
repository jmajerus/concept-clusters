// Generated from content/puzzles/making-and-recycling-red-blood-cells.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "making-and-recycling-red-blood-cells",
  "title": "Making and recycling red blood cells",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "blood-hemostasis"
  },
  "info": {
    "text": "Red blood cells are made in the marrow on a signal from the kidney, built from iron, vitamin B₁₂, and folic acid, and removed after about 120 days, when their iron is recovered and their heme becomes bilirubin.",
    "links": [
      {
        "href": "wiki:Erythropoiesis"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 33, \"Red Blood Cells, Anemia, and Polycythemia\"",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "url": "https://www.eu.elsevierhealth.com/guyton-and-hall-textbook-of-medical-physiology-9780323640060.html"
      },
      {
        "title": "Identification of erythroferrone as an erythroid regulator of iron metabolism",
        "author": "Léon Kautz, Grace Jung, Erika V. Valore, Stefano Rivella, Elizabeta Nemeth, and Tomas Ganz",
        "publisher": "Nature Genetics 46(7): 678–684",
        "year": "2014",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24880340/"
      },
      {
        "title": "Hepcidin regulates cellular iron efflux by binding to ferroportin and inducing its internalization",
        "author": "Elizabeta Nemeth, Marie S. Tuttle, Julie Powelson, Michael B. Vaughn, Adriana Donovan, Diane McVey Ward, Tomas Ganz, and Jerry Kaplan",
        "publisher": "Science 306(5704): 2090–2093",
        "year": "2004",
        "url": "https://pubmed.ncbi.nlm.nih.gov/15514116/"
      }
    ]
  },
  "clusters": [
    {
      "id": "regulating-production",
      "name": "Regulating production",
      "color": "teal",
      "fact": "When tissue oxygen falls, hypoxia-inducible factor in kidney cells switches on erythropoietin, which drives committed descendants of hematopoietic stem cells through the proerythroblast stage; within about five days the marrow is releasing extra reticulocytes, which mature into red cells in the blood within a day or two.",
      "terms": [
        "erythropoietin",
        "reticulocyte",
        "hypoxia-inducible factor",
        "hematopoietic stem cell",
        "proerythroblast"
      ],
      "seeds": [
        "erythropoietin",
        "reticulocyte"
      ],
      "termInfo": {
        "erythropoietin": {
          "text": "A hormone made mainly by the kidneys in response to low oxygen; it stimulates the marrow to produce red cells. Failing kidneys make too little of it.",
          "links": [
            {
              "href": "wiki:Erythropoietin"
            }
          ]
        },
        "hematopoietic stem cell": {
          "text": "A self-renewing marrow cell that gives rise to every kind of blood cell; Guyton calls it the pluripotential hematopoietic stem cell.",
          "links": [
            {
              "href": "wiki:Hematopoietic stem cell"
            }
          ]
        },
        "hypoxia-inducible factor": {
          "text": "A transcription factor that is destroyed when oxygen is plentiful and accumulates when it is scarce; in kidney cells it turns on the erythropoietin gene.",
          "links": [
            {
              "href": "wiki:Hypoxia-inducible factor"
            }
          ]
        },
        "proerythroblast": {
          "text": "The first recognizable cell of the red-cell line; through several divisions and erythroblast stages it fills with hemoglobin and finally ejects its nucleus.",
          "links": [
            {
              "href": "wiki:Erythropoiesis"
            }
          ]
        },
        "reticulocyte": {
          "text": "A young red cell that has lost its nucleus but still holds remnants of ribosomes; it enters the blood from the marrow and matures in a day or two, so a rising count shows the marrow is responding.",
          "links": [
            {
              "href": "wiki:Reticulocyte"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Erythropoiesis"
          }
        ]
      }
    },
    {
      "id": "iron-handling",
      "name": "Iron handling",
      "color": "blue",
      "fact": "Duodenal cells take up dietary iron through divalent metal transporter 1; transferrin carries iron in plasma to cells that display transferrin receptors, ferritin holds the surplus with hemosiderin forming when stores grow large, and the liver hormone hepcidin sets how much iron reaches the plasma.",
      "terms": [
        "transferrin",
        "ferritin",
        "hepcidin",
        "divalent metal transporter 1",
        "hemosiderin",
        "transferrin receptor"
      ],
      "seeds": [
        "transferrin",
        "ferritin"
      ],
      "termInfo": {
        "divalent metal transporter 1": {
          "text": "DMT1, the transporter on the gut-facing surface of duodenal cells that takes up ferrous iron after duodenal cytochrome b reduces it; developing red cells also use it to free iron from endosomes.",
          "links": [
            {
              "href": "wiki:Natural resistance-associated macrophage protein 2",
              "label": "Divalent metal transporter 1 (NRAMP2)"
            }
          ]
        },
        "ferritin": {
          "text": "The main iron-storage protein inside cells, especially in liver cells and macrophages; the small amount in plasma tracks the size of the body's stores.",
          "links": [
            {
              "href": "wiki:Ferritin"
            }
          ]
        },
        "hemosiderin": {
          "text": "An insoluble iron–protein aggregate that forms in cells when stores exceed what ferritin can hold.",
          "links": [
            {
              "href": "wiki:Hemosiderin"
            }
          ]
        },
        "hepcidin": {
          "text": "A hormone made by the liver that limits iron entry into plasma; it rises with iron excess and inflammation and falls when the marrow needs iron.",
          "links": [
            {
              "href": "wiki:Hepcidin"
            }
          ]
        },
        "transferrin": {
          "text": "The plasma protein that carries iron to the tissues; Guyton describes iron joining apotransferrin to form it.",
          "links": [
            {
              "href": "wiki:Transferrin"
            }
          ]
        },
        "transferrin receptor": {
          "text": "A receptor that binds iron-loaded transferrin and brings it into the cell by endocytosis; developing red cells carry more of it than any other cell.",
          "links": [
            {
              "href": "wiki:Transferrin receptor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Human iron metabolism"
          }
        ]
      }
    },
    {
      "id": "maturation-factors",
      "name": "Maturation factors",
      "color": "amber",
      "fact": "Vitamin B₁₂ and folic acid are both needed to make thymidine triphosphate, one of the building blocks of DNA; B₁₂ can be absorbed only after binding intrinsic factor from the stomach, and the complex is taken up in the terminal ileum.",
      "terms": [
        "vitamin B₁₂",
        "folic acid",
        "intrinsic factor",
        "terminal ileum",
        "thymidine triphosphate"
      ],
      "seeds": [
        "vitamin B₁₂",
        "folic acid"
      ],
      "termInfo": {
        "folic acid": {
          "text": "Also called folate; found in green vegetables, fruit, and liver. Body stores last only a few months.",
          "links": [
            {
              "href": "wiki:Folate"
            }
          ]
        },
        "intrinsic factor": {
          "text": "A glycoprotein secreted by the stomach's parietal cells; it binds vitamin B₁₂, shields it from digestion, and carries it to its absorption site.",
          "links": [
            {
              "href": "wiki:Intrinsic factor"
            }
          ]
        },
        "terminal ileum": {
          "text": "The last part of the small intestine, where receptors take up the intrinsic factor–B₁₂ complex.",
          "links": [
            {
              "href": "wiki:Ileum"
            }
          ]
        },
        "thymidine triphosphate": {
          "text": "A nucleotide used only in DNA; making it requires a folate-derived methyl group, and B₁₂ keeps folate in its usable form.",
          "links": [
            {
              "href": "wiki:Thymidine triphosphate"
            }
          ]
        },
        "vitamin B₁₂": {
          "text": "Cobalamin, obtained from animal foods. The liver stores enough to last several years, so a deficiency develops slowly.",
          "links": [
            {
              "href": "wiki:Vitamin B12"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Vitamin B12"
          }
        ]
      }
    },
    {
      "id": "destruction-and-recycling",
      "name": "Destruction and recycling",
      "color": "magenta",
      "fact": "Lacking a nucleus and mitochondria, a red cell cannot renew its membrane, so after about 120 days it grows rigid and ruptures in the narrow passages of the spleen; tissue macrophages engulf it, and heme oxygenase opens its heme into biliverdin, which is reduced to bilirubin.",
      "terms": [
        "spleen",
        "bilirubin",
        "120-day lifespan",
        "tissue macrophages",
        "heme oxygenase",
        "biliverdin"
      ],
      "seeds": [
        "spleen",
        "bilirubin"
      ],
      "termInfo": {
        "120-day lifespan": "The usual survival of a red cell in the circulation; about 1 percent of the red cell mass must be replaced each day.",
        "bilirubin": {
          "text": "A yellow pigment from heme breakdown; carried on albumin to the liver, it is conjugated and excreted in bile. When it builds up, skin and eyes turn yellow (jaundice).",
          "links": [
            {
              "href": "wiki:Bilirubin"
            }
          ]
        },
        "biliverdin": {
          "text": "A green pigment, the first product of heme breakdown; biliverdin reductase converts it to bilirubin.",
          "links": [
            {
              "href": "wiki:Biliverdin"
            }
          ]
        },
        "heme oxygenase": {
          "text": "The macrophage enzyme that opens the heme ring, releasing iron and carbon monoxide and forming biliverdin.",
          "links": [
            {
              "href": "wiki:Heme oxygenase"
            }
          ]
        },
        "spleen": {
          "text": "An organ whose red pulp forces red cells through gaps only a few micrometers wide; aging, rigid cells rupture there.",
          "links": [
            {
              "href": "wiki:Spleen"
            }
          ]
        },
        "tissue macrophages": {
          "text": "Phagocytes in the spleen, liver (Kupffer cells), and bone marrow that engulf old red cells and recover their iron.",
          "links": [
            {
              "href": "wiki:Macrophage"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Red blood cell"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "erythroferrone",
      "term": "erythroferrone",
      "clusters": [
        0,
        1
      ],
      "fact": "Erythroblasts stimulated by erythropoietin release erythroferrone, which suppresses hepcidin in the liver, so gut absorption and release from stores rise to supply the marrow's added demand.",
      "info": {
        "text": "A hormone made by developing red cells, identified in 2014, that links the pace of red-cell production to the supply of iron.",
        "links": [
          {
            "href": "wiki:Erythroferrone"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/24880340/",
            "label": "Kautz et al. 2014"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "erythropoietin",
        "hepcidin"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "hemoglobin-synthesis",
      "term": "hemoglobin synthesis",
      "clusters": [
        1,
        0
      ],
      "fact": "Developing red cells take in transferrin-bound iron through transferrin receptors and insert it into protoporphyrin to form heme, which joins globin chains; when iron runs short, hemoglobin synthesis lags and the cells come out small and pale.",
      "info": {
        "text": "The building of hemoglobin inside erythroblasts and reticulocytes, which needs a steady supply of iron for heme.",
        "links": [
          {
            "href": "wiki:Hemoglobin"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "transferrin receptor",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "megaloblasts",
      "term": "megaloblasts",
      "clusters": [
        2,
        0
      ],
      "fact": "Without enough vitamin B₁₂ or folic acid to make thymidine triphosphate, DNA synthesis falls behind the growth of the cytoplasm, so erythroblasts become oversized and divide less; many die in the marrow, and those released are large, fragile cells.",
      "info": {
        "text": "Abnormally large red-cell precursors that form when DNA synthesis is impaired; Guyton describes the result as maturation failure.",
        "links": [
          {
            "href": "wiki:Megaloblastic anemia"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "thymidine triphosphate",
        "proerythroblast"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "ferroportin",
      "term": "ferroportin",
      "clusters": [
        3,
        1
      ],
      "fact": "Macrophages export the iron recovered from old red cells through ferroportin, the same exporter that releases absorbed iron from gut cells; hepcidin binds ferroportin and causes its destruction, trapping iron in both kinds of cell.",
      "info": {
        "text": "The only known cellular iron exporter. Recycling from old red cells supplies most of the iron the marrow uses each day; absorption only replaces losses.",
        "links": [
          {
            "href": "wiki:Ferroportin"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/15514116/",
            "label": "Nemeth et al. 2004"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "tissue macrophages",
        "hepcidin"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "low-oxygen-signal",
      "prompt": "Which molecules carry the low-oxygen signal from kidney to marrow?",
      "explanation": "The kidney acts as the oxygen sensor because its oxygen supply tracks the blood's carrying capacity. Erythroferrone is also a production-linked signal, but it travels from marrow to liver to adjust the iron supply.",
      "targets": [
        "hypoxia-inducible factor",
        "erythropoietin"
      ],
      "reasons": {
        "erythropoietin": "The hormone that travels in blood to the marrow and drives red-cell production.",
        "hypoxia-inducible factor": "It accumulates in kidney cells when oxygen falls and switches on the erythropoietin gene."
      }
    },
    {
      "id": "healthy-lineage",
      "prompt": "Which cells mark the stages from marrow stem cell to circulating red cell in healthy marrow?",
      "explanation": "Between the proerythroblast and the reticulocyte come several erythroblast stages that fill with hemoglobin. Megaloblasts are the abnormal precursors of a marrow short of DNA building blocks.",
      "targets": [
        "hematopoietic stem cell",
        "proerythroblast",
        "reticulocyte"
      ],
      "reasons": {
        "hematopoietic stem cell": "The self-renewing source of every blood cell line.",
        "proerythroblast": "The first cell committed recognizably to the red-cell line.",
        "reticulocyte": "The last stage, released into the blood after the nucleus is ejected."
      }
    },
    {
      "id": "iron-delivery",
      "prompt": "Which molecules deliver iron to a developing red cell?",
      "explanation": "Once inside, the iron leaves the endosome through divalent metal transporter 1 and is built into heme during hemoglobin synthesis.",
      "targets": [
        "transferrin",
        "transferrin receptor"
      ],
      "reasons": {
        "transferrin": "It carries iron through the plasma to the marrow.",
        "transferrin receptor": "It binds iron-loaded transferrin and brings it into the erythroblast by endocytosis."
      }
    },
    {
      "id": "membrane-transporters",
      "prompt": "Which proteins pass iron directly across a cell membrane?",
      "explanation": "The transferrin receptor also brings iron into cells, but it does so by taking up a whole iron-loaded protein in a vesicle rather than moving iron through a channel.",
      "targets": [
        "divalent metal transporter 1",
        "ferroportin"
      ],
      "reasons": {
        "divalent metal transporter 1": "It moves ferrous iron into duodenal cells and out of endosomes in erythroblasts.",
        "ferroportin": "It exports iron out of gut cells and macrophages into plasma."
      }
    },
    {
      "id": "iron-storage",
      "prompt": "Which molecules store iron inside cells?",
      "explanation": "Transferrin also binds iron, but it carries iron through the plasma rather than holding it in reserve inside cells.",
      "targets": [
        "ferritin",
        "hemosiderin"
      ],
      "reasons": {
        "ferritin": "The main soluble storage protein, ready to release iron when it is needed.",
        "hemosiderin": "An insoluble aggregate that forms when stores outgrow ferritin."
      }
    },
    {
      "id": "inflammation-iron-trap",
      "prompt": "Which two molecules bind when inflammation traps iron in macrophages?",
      "explanation": "The iron stays in stores, so ferritin is normal or high while too little reaches the marrow. This is the mechanism behind anemia of chronic inflammation.",
      "targets": [
        "hepcidin",
        "ferroportin"
      ],
      "reasons": {
        "ferroportin": "Hepcidin binds it and causes its destruction, so macrophages can no longer export recycled iron.",
        "hepcidin": "Inflammation raises its production by the liver."
      }
    },
    {
      "id": "marrow-iron-signal",
      "prompt": "Which marrow signal lowers hepcidin after blood loss?",
      "explanation": "Erythropoietin starts the response, but it comes from the kidney and acts on the marrow; erythroferrone is the marrow's own message to the liver.",
      "targets": [
        "erythroferrone"
      ],
      "reasons": {
        "erythroferrone": "Erythroblasts release it under erythropoietin stimulation, and it suppresses hepcidin in the liver."
      }
    },
    {
      "id": "iron-shortage",
      "prompt": "Which step in red-cell production fails when iron runs short?",
      "explanation": "The cells keep dividing while hemoglobin lags, so they leave the marrow small and pale. Ferritin falls well before this, as stores are used up.",
      "targets": [
        "hemoglobin synthesis"
      ],
      "reasons": {
        "hemoglobin synthesis": "Without iron for heme, erythroblasts cannot fill with hemoglobin."
      }
    },
    {
      "id": "b12-absorption",
      "prompt": "What does vitamin B₁₂ need to be absorbed from the gut?",
      "explanation": "Loss of parietal cells, as in pernicious anemia, or removal of the ileum blocks absorption. Because the liver stores years of B₁₂, the deficiency shows up long afterward.",
      "targets": [
        "intrinsic factor",
        "terminal ileum"
      ],
      "reasons": {
        "intrinsic factor": "It binds B₁₂ and protects it on the way through the intestine.",
        "terminal ileum": "Only here do receptors take up the intrinsic factor–B₁₂ complex."
      }
    },
    {
      "id": "dna-building-block",
      "prompt": "Which nutrients are needed to make thymidine triphosphate?",
      "explanation": "Because both feed the same step, a lack of either one produces the same marrow picture. B₁₂ deficiency also damages nerves, which folate deficiency does not.",
      "targets": [
        "vitamin B₁₂",
        "folic acid"
      ],
      "reasons": {
        "folic acid": "It supplies the methyl group that turns a uracil nucleotide into thymidine.",
        "vitamin B₁₂": "It keeps folate in the form that can donate a methyl group."
      }
    },
    {
      "id": "b12-marrow-defect",
      "prompt": "Which terms describe what goes wrong in a marrow short of vitamin B₁₂?",
      "explanation": "Intrinsic factor and the terminal ileum can be the cause of a deficiency, but the defect inside the marrow is the slowed DNA synthesis. Fewer reticulocytes reach the blood as a result.",
      "targets": [
        "thymidine triphosphate",
        "megaloblasts"
      ],
      "reasons": {
        "megaloblasts": "Precursors grow large without dividing normally, and many die before release.",
        "thymidine triphosphate": "Its supply falls, so DNA synthesis slows."
      }
    },
    {
      "id": "removing-old-cells",
      "prompt": "Which structures remove aging red cells from the blood?",
      "explanation": "The 120-day lifespan sets the pace of this removal; the spleen and macrophages carry it out.",
      "targets": [
        "spleen",
        "tissue macrophages"
      ],
      "reasons": {
        "spleen": "Its narrow red-pulp passages trap and rupture rigid old cells.",
        "tissue macrophages": "They engulf the fragments in the spleen, liver, and marrow."
      }
    },
    {
      "id": "heme-breakdown",
      "prompt": "Which enzyme and pigments mark the breakdown of heme?",
      "explanation": "The iron released at the first step leaves the macrophage through ferroportin and returns to transferrin. When red cells are destroyed faster than the liver clears bilirubin, jaundice results.",
      "targets": [
        "heme oxygenase",
        "biliverdin",
        "bilirubin"
      ],
      "reasons": {
        "bilirubin": "The yellow pigment biliverdin is reduced to, carried to the liver for excretion.",
        "biliverdin": "The green pigment the ring becomes.",
        "heme oxygenase": "It opens the heme ring and frees its iron."
      }
    },
    {
      "id": "slow-onset",
      "prompt": "Which term explains why anemia takes weeks to appear after the marrow suddenly fails?",
      "explanation": "Reticulocytes disappear from the blood within days, which is the earliest sign; the red cell count itself declines slowly.",
      "targets": [
        "120-day lifespan"
      ],
      "reasons": {
        "120-day lifespan": "Red cells already in circulation keep working for up to four months, so the count falls by only about 1 percent a day."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "gas-exchange-and-transport",
        "reason": "Follow the hemoglobin built here into the blood, where it loads oxygen in the lungs and unloads it in the tissues.",
        "via": [
          "hemoglobin synthesis"
        ]
      },
      {
        "id": "digestion-and-absorption-of-nutrients",
        "reason": "See how the same small intestine absorbs sugars, proteins, and fats alongside iron and vitamin B₁₂.",
        "via": [
          "terminal ileum"
        ]
      },
      {
        "id": "anemia-classification-clinical",
        "reason": "Take each failure of production, supply, or survival to the bedside, where anemias are sorted by cell size and marrow response.",
        "via": [
          "megaloblasts",
          "reticulocyte"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How red blood cells are made and recycled",
    "summary": "How the kidney sets red-cell production, how iron, vitamin B₁₂, and folic acid supply it, and how old cells are removed and their iron reused.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "An adult carries about 25 trillion red blood cells, and each one survives roughly four months. To keep the count steady, the bone marrow must replace about 1 percent of them every day. This lesson follows that cycle: how the body decides how many red cells to make, what raw materials it needs, and how it removes old cells while saving their iron.\r\n\r\nThe subject divides into four parts. Production is regulated by a hormone that responds to oxygen. Iron, the key ingredient of hemoglobin, is absorbed, carried, and stored under tight control. Two vitamins, B₁₂ and folic acid, are needed for the cells to divide. And old cells are destroyed in a way that recovers nearly all of their iron.\r\n\r\n## Regulating production\r\n\r\nThe main regulator of red-cell production is tissue oxygen. When oxygen delivery falls, as at high altitude, after blood loss, or in lung disease, a transcription factor called **hypoxia-inducible factor** stops being broken down and builds up in kidney cells. It switches on the gene for **erythropoietin**, a hormone that travels in the blood to the bone marrow. Because the kidney makes about 90 percent of the body's erythropoietin, people with chronic kidney disease often become anemic.\r\n\r\nIn the marrow, every blood cell descends from a **hematopoietic stem cell**. Erythropoietin drives cells committed to the red-cell line through a sequence of stages. The first recognizable one is the **proerythroblast**. Over several divisions its descendants shrink, fill with hemoglobin, and finally eject their nucleus. The cell that enters the blood is a **reticulocyte**, a young red cell that still holds remnants of ribosomes and matures within a day or two. Within about five days of a rise in erythropoietin, reticulocyte numbers in the blood climb, which makes the reticulocyte count a direct readout of the marrow's response.\r\n\r\n## Iron handling\r\n\r\nEach hemoglobin molecule holds four iron atoms, and most of the body's iron sits in red cells. Iron is valuable but also toxic when free, so it is almost always bound to a protein.\r\n\r\nDietary iron is absorbed in the duodenum. After a surface enzyme reduces it, **divalent metal transporter 1** carries ferrous iron into the gut cell. In the plasma, iron travels bound to **transferrin**. Cells that need iron display the **transferrin receptor**, which binds iron-loaded transferrin and pulls it inside by endocytosis. Developing red cells carry more of these receptors than any other cell. Surplus iron is kept in **ferritin**, the main storage protein in liver cells and macrophages; when stores grow very large, some of it forms an insoluble aggregate called **hemosiderin**.\r\n\r\nThe body has no regulated way to excrete iron, so it controls how much enters the plasma. The liver hormone **hepcidin** sets that level. When iron is plentiful or inflammation is present, hepcidin rises and iron entry falls. When the marrow needs iron, hepcidin falls.\r\n\r\nThe exit route that hepcidin controls is **ferroportin**, the only known iron exporter. Ferroportin releases absorbed iron from gut cells into the plasma, and it releases recycled iron from macrophages. Hepcidin binds ferroportin and causes the cell to destroy it, trapping iron inside. This explains why chronic inflammation causes anemia even when stores are full: the iron is present but cannot reach the marrow.\r\n\r\nThe marrow can also send its own message to the liver. Erythroblasts stimulated by erythropoietin release **erythroferrone**, a hormone identified in 2014 by Léon Kautz, Tomas Ganz, and colleagues. Erythroferrone suppresses hepcidin, so more iron is absorbed and released from stores to meet the added demand after bleeding or at altitude.\r\n\r\nInside the developing red cell, iron is inserted into a ring called protoporphyrin to make heme, and four heme groups join globin chains. When iron runs short, **hemoglobin synthesis** lags behind cell division, and the cells leave the marrow small and pale. Ferritin falls well before this happens, as stores are drawn down.\r\n\r\n## Maturation factors\r\n\r\nRed-cell precursors divide rapidly, so they depend heavily on DNA synthesis. Two vitamins are needed to make **thymidine triphosphate**, the nucleotide used only in DNA. **Folic acid**, also called folate, supplies the methyl group that forms thymidine. **Vitamin B₁₂** keeps folate in its usable form, so a lack of either vitamin stalls the same step.\r\n\r\nB₁₂ has an unusual absorption route. The stomach's parietal cells secrete **intrinsic factor**, a glycoprotein that binds B₁₂ and protects it from digestion. Receptors in the **terminal ileum**, the last part of the small intestine, take up the combined complex. Destruction of the parietal cells, as in pernicious anemia, or surgical removal of the ileum blocks absorption. Because the liver stores several years' worth of B₁₂, the deficiency appears long after absorption stops. Folate stores last only a few months.\r\n\r\nWhen DNA synthesis slows, the cytoplasm keeps growing while the nucleus lags behind. The precursors become **megaloblasts**: oversized cells that divide less often. Many die in the marrow, and those that reach the blood are large and fragile. B₁₂ deficiency also damages nerves, which folate deficiency does not.\r\n\r\n## Destruction and recycling\r\n\r\nA mature red cell has no nucleus and no mitochondria, so it cannot renew its proteins or membrane. Its **120-day lifespan** ends as the membrane grows rigid. Old cells rupture while squeezing through the narrow passages of the **spleen**. **Tissue macrophages** in the spleen, liver, and marrow engulf the remains.\r\n\r\nInside the macrophage, the globin is broken down into amino acids, and **heme oxygenase** opens the heme ring, releasing its iron. The ring becomes **biliverdin**, a green pigment, which is then reduced to **bilirubin**, a yellow one. Bilirubin travels on albumin to the liver, which conjugates it and excretes it in bile. When red cells are destroyed faster than the liver can clear bilirubin, it builds up and turns the skin and eyes yellow.\r\n\r\nThe freed iron leaves the macrophage through ferroportin and binds to transferrin again. This recycling supplies most of the iron the marrow uses each day; dietary absorption only replaces the small amounts lost. Because the red cells already circulating last for months, a sudden failure of the marrow shows up first as a disappearance of reticulocytes, while anemia develops over weeks.\r\n\r\n## Further reading\r\n\r\nThe standard textbook account is chapter 33, \"Red Blood Cells, Anemia, and Polycythemia,\" in John E. Hall and Michael E. Hall, *Guyton and Hall Textbook of Medical Physiology*. Two research papers set out the modern view of iron control: Elizabeta Nemeth and colleagues (2004) showed that hepcidin works by destroying ferroportin, and Léon Kautz and colleagues (2014) identified erythroferrone as the marrow's signal to the liver."
    },
    "links": [
      {
        "href": "wiki:Erythropoiesis"
      },
      {
        "href": "wiki:Human iron metabolism"
      }
    ]
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
      "puzzleId": "making-and-recycling-red-blood-cells",
      "puzzleRevision": "fnv1a32:87acbe45",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:erythropoietin": {
          "x": 760.71,
          "y": 265.26
        },
        "term:reticulocyte": {
          "x": 941.18,
          "y": 207.15
        },
        "term:hypoxia-inducible factor": {
          "x": 1051.26,
          "y": 338.09
        },
        "term:hematopoietic stem cell": {
          "x": 1025.11,
          "y": 439.28
        },
        "term:proerythroblast": {
          "x": 882.58,
          "y": 514.71
        },
        "term:transferrin": {
          "x": 226.02,
          "y": 509.99
        },
        "term:ferritin": {
          "x": 128.72,
          "y": 450.12
        },
        "term:hepcidin": {
          "x": 436.4,
          "y": 328.08
        },
        "term:divalent metal transporter 1": {
          "x": 108.2,
          "y": 300.07
        },
        "term:hemosiderin": {
          "x": 184.08,
          "y": 210.94
        },
        "term:transferrin receptor": {
          "x": 377.19,
          "y": 475.82
        },
        "term:vitamin B₁₂": {
          "x": 708.82,
          "y": 669.34
        },
        "term:folic acid": {
          "x": 572.44,
          "y": 690.19
        },
        "term:intrinsic factor": {
          "x": 428.62,
          "y": 690.19
        },
        "term:terminal ileum": {
          "x": 301.38,
          "y": 650.48
        },
        "term:thymidine triphosphate": {
          "x": 706.66,
          "y": 590.53
        },
        "term:spleen": {
          "x": 413.79,
          "y": 94.69
        },
        "term:bilirubin": {
          "x": 498.75,
          "y": 37.89
        },
        "term:120-day lifespan": {
          "x": 650.27,
          "y": 31.93
        },
        "term:tissue macrophages": {
          "x": 406.2,
          "y": 150.31
        },
        "term:heme oxygenase": {
          "x": 822.14,
          "y": 52.79
        },
        "term:biliverdin": {
          "x": 872.31,
          "y": 138.1
        },
        "term:erythroferrone": {
          "x": 573.8,
          "y": 228.74
        },
        "term:hemoglobin synthesis": {
          "x": 602.95,
          "y": 400.54
        },
        "term:megaloblasts": {
          "x": 699.15,
          "y": 480.23
        },
        "term:ferroportin": {
          "x": 312.82,
          "y": 251.47
        },
        "cluster:0": {
          "x": 857.52,
          "y": 338.74
        },
        "cluster:1": {
          "x": 272.9,
          "y": 372.67
        },
        "cluster:2": {
          "x": 496.66,
          "y": 576.86
        },
        "cluster:3": {
          "x": 678.32,
          "y": 132.98
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T23:42:12.050Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "making-and-recycling-red-blood-cells",
      "puzzleRevision": "fnv1a32:87acbe45",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:erythropoietin": {
          "x": 524.6,
          "y": 165.58,
          "pinned": false
        },
        "term:reticulocyte": {
          "x": 550.39,
          "y": 38.25,
          "pinned": false
        },
        "term:hypoxia-inducible factor": {
          "x": 391.08,
          "y": 64.1,
          "pinned": false
        },
        "term:hematopoietic stem cell": {
          "x": 389.94,
          "y": 260.14,
          "pinned": false
        },
        "term:proerythroblast": {
          "x": 655.99,
          "y": 119.15,
          "pinned": false
        },
        "term:transferrin": {
          "x": 566.36,
          "y": 573.14,
          "pinned": false
        },
        "term:ferritin": {
          "x": 572.49,
          "y": 682.91,
          "pinned": false
        },
        "term:hepcidin": {
          "x": 512.81,
          "y": 479.53,
          "pinned": false
        },
        "term:divalent metal transporter 1": {
          "x": 726.15,
          "y": 633.57,
          "pinned": false
        },
        "term:hemosiderin": {
          "x": 472.24,
          "y": 643.15,
          "pinned": false
        },
        "term:transferrin receptor": {
          "x": 646.03,
          "y": 451.21,
          "pinned": false
        },
        "term:vitamin B₁₂": {
          "x": 955.51,
          "y": 106.18,
          "pinned": false
        },
        "term:folic acid": {
          "x": 1043.66,
          "y": 33.67,
          "pinned": false
        },
        "term:intrinsic factor": {
          "x": 1077.6,
          "y": 159.05,
          "pinned": false
        },
        "term:terminal ileum": {
          "x": 958.16,
          "y": 236.76,
          "pinned": false
        },
        "term:thymidine triphosphate": {
          "x": 814.61,
          "y": 163.02,
          "pinned": false
        },
        "term:spleen": {
          "x": 169.41,
          "y": 464.7,
          "pinned": false
        },
        "term:bilirubin": {
          "x": 77.33,
          "y": 489.07,
          "pinned": false
        },
        "term:120-day lifespan": {
          "x": 163.66,
          "y": 581.86,
          "pinned": false
        },
        "term:tissue macrophages": {
          "x": 289.98,
          "y": 491.88,
          "pinned": false
        },
        "term:heme oxygenase": {
          "x": 216.05,
          "y": 362.76,
          "pinned": false
        },
        "term:biliverdin": {
          "x": 94.05,
          "y": 382.53,
          "pinned": false
        },
        "term:erythroferrone": {
          "x": 518.87,
          "y": 362.39,
          "pinned": false
        },
        "term:hemoglobin synthesis": {
          "x": 648.49,
          "y": 277.22,
          "pinned": false
        },
        "term:megaloblasts": {
          "x": 748.92,
          "y": 36.9,
          "pinned": true
        },
        "term:ferroportin": {
          "x": 421.73,
          "y": 537.28,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3960.28,
        "score": 3960.2773085547756
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:42:35.044Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "making-and-recycling-red-blood-cells",
      "puzzleRevision": "fnv1a32:87acbe45",
      "board": {
        "width": 1150,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 575,
          "y": 163.42,
          "pinned": true
        },
        "cluster:1": {
          "x": 592.88,
          "y": 573.71,
          "pinned": true
        },
        "cluster:2": {
          "x": 956.15,
          "y": 378,
          "pinned": false
        },
        "cluster:3": {
          "x": 193.85,
          "y": 378,
          "pinned": false
        }
      },
      "bridges": {
        "term:erythroferrone": {
          "x": 537.47,
          "y": 361.07,
          "pinned": true
        },
        "term:hemoglobin synthesis": {
          "x": 697.52,
          "y": 393.93,
          "pinned": true
        },
        "term:megaloblasts": {
          "x": 776.29,
          "y": 309.49,
          "pinned": false
        },
        "term:ferroportin": {
          "x": 425.68,
          "y": 408.28,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "erythropoietin",
          "reticulocyte",
          "hypoxia-inducible factor",
          "hematopoietic stem cell",
          "proerythroblast"
        ],
        "cluster:1": [
          "transferrin",
          "ferritin",
          "hepcidin",
          "divalent metal transporter 1",
          "hemosiderin",
          "transferrin receptor"
        ],
        "cluster:2": [
          "vitamin B₁₂",
          "folic acid",
          "intrinsic factor",
          "terminal ileum",
          "thymidine triphosphate"
        ],
        "cluster:3": [
          "spleen",
          "bilirubin",
          "120-day lifespan",
          "tissue macrophages",
          "heme oxygenase",
          "biliverdin"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "reticulocyte",
          "hematopoietic stem cell",
          "hypoxia-inducible factor",
          "proerythroblast",
          "erythropoietin"
        ],
        "cluster:1": [
          "hepcidin",
          "transferrin receptor",
          "divalent metal transporter 1",
          "hemosiderin",
          "transferrin",
          "ferritin"
        ],
        "cluster:2": [
          "folic acid",
          "terminal ileum",
          "thymidine triphosphate",
          "intrinsic factor",
          "vitamin B₁₂"
        ],
        "cluster:3": [
          "bilirubin",
          "heme oxygenase",
          "tissue macrophages",
          "120-day lifespan",
          "biliverdin",
          "spleen"
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
        "totalLength": 1077.7099423465693
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:43:15.381Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-15T23:41:00.543Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
