// Generated from content/puzzles/anemia-classification-clinical.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "anemia-classification-clinical",
  "title": "Sorting Anemia by Cell Size and Marrow Response",
  "category": "medicine",
  "subcategories": {
    "medicine": "hematology"
  },
  "info": {
    "text": "Anemia is classified twice at the bedside: by red-cell size on the complete blood count, then by the reticulocyte count's answer to whether the marrow can still produce. This board teaches that two-step logic — microcytic, macrocytic, and normocytic classes, the production-versus-destruction split within normal size, and the look-alikes that iron studies separate.",
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/Anemia",
        "label": "Anemia (Wikipedia)"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Macrocytic_anemia",
        "label": "Macrocytic anemia (Wikipedia)"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Reticulocyte",
        "label": "Reticulocyte (Wikipedia)"
      },
      {
        "href": "https://en.wikipedia.org/wiki/Hemolytic_anemia",
        "label": "Hemolytic anemia (Wikipedia)"
      }
    ],
    "citations": [
      {
        "title": "Anemia",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Anemia"
      },
      {
        "title": "Macrocytic anemia",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Macrocytic_anemia"
      },
      {
        "title": "Reticulocyte",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Reticulocyte"
      },
      {
        "title": "Hemolytic anemia",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Hemolytic_anemia"
      },
      {
        "title": "Sideroblastic anemia",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Sideroblastic_anemia"
      },
      {
        "title": "Lead poisoning",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Lead_poisoning"
      }
    ]
  },
  "clusters": [
    {
      "id": "microcytic",
      "name": "Microcytic — the hemoglobin supply failed",
      "color": "teal",
      "fact": "Cells smaller than 80 fL mean hemoglobin build is constrained: absent iron stores, a globin-gene defect, or blocked heme synthesis — iron studies and the smear separate them.",
      "terms": [
        "Iron deficiency anemia",
        "Beta-thalassemia trait",
        "Sideroblastic anemia",
        "Lead poisoning"
      ],
      "seeds": [
        "Iron deficiency anemia",
        "Beta-thalassemia trait"
      ],
      "termInfo": {
        "Beta-thalassemia trait": {
          "text": "A globin-gene mutation keeps cells small while iron stays normal. Classic tell: microcytic cells with a normal or high red-cell count and normal ferritin — iron therapy helps no one here.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Thalassemia",
              "label": "Thalassemia"
            }
          ]
        },
        "Iron deficiency anemia": {
          "text": "The most common anemia worldwide: iron stores are exhausted (low ferritin, high transferrin), so cells come out small and pale. Find and treat the source of loss — often menstrual or gut bleeding — and replete iron.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Iron-deficiency_anemia",
              "label": "Iron-deficiency anemia"
            }
          ]
        },
        "Lead poisoning": {
          "text": "Lead inhibits the heme enzymes ALAD and ferrochelatase; the smear shows microcytic cells with coarse basophilic stippling. Anemia appears at blood lead levels above about 50 µg/dL.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Lead_poisoning",
              "label": "Lead poisoning"
            }
          ]
        },
        "Sideroblastic anemia": {
          "text": "Ringed sideroblasts — iron-loaded mitochondria ringing the nucleus — mark defective heme synthesis: iron is available but cannot be incorporated into hemoglobin.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Sideroblastic_anemia",
              "label": "Sideroblastic anemia"
            }
          ]
        }
      },
      "info": {
        "text": "Mean corpuscular volume below 80 fL. The count prints the size; the workup finds which supply failed.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Anemia",
            "label": "Anemia — microcytic class"
          }
        ]
      }
    },
    {
      "id": "macrocytic",
      "name": "Macrocytic — big cells, two mechanisms",
      "color": "blue",
      "fact": "Cells larger than 100 fL split into megaloblastic causes that impair DNA synthesis (B12 or folate deficiency) and non-megaloblastic causes (alcohol, liver disease, hypothyroidism, myelodysplastic syndrome).",
      "terms": [
        "Pernicious anemia (B12 deficiency)",
        "Chronic alcohol use",
        "Folate deficiency",
        "Liver disease",
        "Hypothyroidism",
        "Myelodysplastic syndrome"
      ],
      "seeds": [
        "Pernicious anemia (B12 deficiency)",
        "Chronic alcohol use"
      ],
      "termInfo": {
        "Chronic alcohol use": "Alcohol is directly toxic to the marrow and suppresses folate; the macrocytosis is round-cell (non-megaloblastic) and improves with abstinence.",
        "Folate deficiency": {
          "text": "The other megaloblastic anemia: the same large oval cells and hypersegmented neutrophils, but no nerve damage. Common in pregnancy and alcohol use disorder.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Folate_deficiency",
              "label": "Folate deficiency"
            }
          ]
        },
        "Hypothyroidism": {
          "text": "A non-megaloblastic macrocytosis, often with mild anemia, that resolves when thyroid hormone is replaced.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Hypothyroidism",
              "label": "Hypothyroidism"
            }
          ]
        },
        "Liver disease": {
          "text": "Damaged liver alters red-cell membrane lipids; cells enlarge (and show target forms) without any marrow failure.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Liver_disease",
              "label": "Liver disease"
            }
          ]
        },
        "Myelodysplastic syndrome": {
          "text": "A clonal marrow disorder of older adults: ineffective blood production, macrocytic cells, and a risk of progression to acute myeloid leukemia.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Myelodysplastic_syndrome",
              "label": "Myelodysplastic syndrome"
            }
          ]
        },
        "Pernicious anemia (B12 deficiency)": {
          "text": "Autoimmune loss of parietal cells starves the body of intrinsic factor and B12; DNA synthesis stalls, and cells come out large and oval with hypersegmented neutrophils. B12 deficiency also damages nerves — replace B12 before folate.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Pernicious_anemia",
              "label": "Pernicious anemia"
            }
          ]
        }
      },
      "info": {
        "text": "Mean corpuscular volume above 100 fL. Asking 'megaloblastic or not?' splits the workup in two.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Macrocytic_anemia",
            "label": "Macrocytic anemia — causes"
          }
        ]
      }
    },
    {
      "id": "hypoproliferative",
      "name": "Normocytic, low reticulocytes — the marrow isn't making cells",
      "color": "amber",
      "fact": "Normal-sized cells with an inadequate reticulocyte response mean the marrow is not producing: inflammation blocking iron mobilization, erythropoietin deficiency in kidney disease, or marrow failure itself.",
      "terms": [
        "Anemia of chronic kidney disease",
        "Aplastic anemia",
        "Anemia of chronic inflammation"
      ],
      "seeds": [
        "Anemia of chronic kidney disease",
        "Aplastic anemia"
      ],
      "termInfo": {
        "Anemia of chronic inflammation": {
          "text": "Inflammation raises hepcidin, trapping iron in stores: ferritin normal-to-high, transferrin saturation low. Usually normocytic, occasionally microcytic — treat the underlying disease.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Anemia_of_chronic_disease",
              "label": "Anemia of chronic disease"
            }
          ]
        },
        "Anemia of chronic kidney disease": {
          "text": "Failing kidneys stop making erythropoietin, the hormone that tells the marrow to produce; reticulocytes fall toward zero. Erythropoiesis-stimulating agents replace the missing signal.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Chronic_kidney_disease",
              "label": "Chronic kidney disease — anemia"
            }
          ]
        },
        "Aplastic anemia": {
          "text": "The marrow itself fails — pancytopenia with an empty, fatty marrow. Often immune-mediated; severe cases need transplant or immunosuppression.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Aplastic_anemia",
              "label": "Aplastic anemia"
            }
          ]
        }
      },
      "info": {
        "text": "MCV 80–100 fL with a low reticulocyte count: the factory, not the cells, is the problem.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Reticulocyte",
            "label": "Reticulocyte — interpretation"
          }
        ]
      }
    },
    {
      "id": "hemolytic",
      "name": "Hemolytic — destroyed faster than made",
      "color": "magenta",
      "fact": "Mostly normocytic anemia with a high reticulocyte count means the marrow is compensating for accelerated red-cell destruction — membrane, hemoglobin, enzyme, or immune causes.",
      "terms": [
        "Sickle cell disease",
        "G6PD deficiency",
        "Hereditary spherocytosis",
        "Autoimmune hemolytic anemia"
      ],
      "seeds": [
        "Sickle cell disease",
        "G6PD deficiency"
      ],
      "termInfo": {
        "Autoimmune hemolytic anemia": {
          "text": "Antibodies mark red cells for destruction; the direct antiglobulin (Coombs) test is positive. Warm antibodies respond to steroids; cold antibodies do not.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Autoimmune_hemolytic_anemia",
              "label": "Autoimmune hemolytic anemia"
            }
          ]
        },
        "G6PD deficiency": {
          "text": "An X-linked enzyme defect: oxidizing drugs, fava beans, or infection overwhelm the cell's antioxidant shield, causing sudden episodic hemolysis with bite cells on the smear.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Glucose-6-phosphate_dehydrogenase_deficiency",
              "label": "G6PD deficiency"
            }
          ]
        },
        "Hereditary spherocytosis": {
          "text": "A membrane-protein defect rounds cells into spherules that the spleen trims and destroys; family history and the blood film clinch it.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Hereditary_spherocytosis",
              "label": "Hereditary spherocytosis"
            }
          ]
        },
        "Sickle cell disease": {
          "text": "A hemoglobin mutation that polymerizes at low oxygen, sickling cells into fragile crescents: painful vaso-occlusive crises and chronic hemolysis.",
          "links": [
            {
              "href": "https://en.wikipedia.org/wiki/Sickle_cell_disease",
              "label": "Sickle cell disease"
            }
          ]
        }
      },
      "info": {
        "text": "Destruction outpaces production; the count falls while the marrow races — reticulocytes climb, haptoglobin drops.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Hemolytic_anemia",
            "label": "Hemolytic anemia — causes and diagnosis"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-reticulocyte",
      "term": "Reticulocyte count",
      "clusters": [
        2,
        3
      ],
      "fact": "A low count means the marrow cannot respond — chronic kidney disease or aplastic anemia; a high count means the marrow is compensating for accelerated destruction, the signature of hemolysis.",
      "info": {
        "text": "Immature red cells released by the marrow; their count is the bedside readout of marrow response.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Reticulocyte",
            "label": "Reticulocyte"
          }
        ]
      },
      "relationKind": "contrast"
    },
    {
      "id": "bridge-functional-iron",
      "term": "Functional iron deficiency",
      "clusters": [
        0,
        2
      ],
      "fact": "In chronic inflammation, hepcidin blocks iron mobilization: ferritin runs high while transferrin saturation falls, so anemia of chronic inflammation can shade microcytic — iron studies, not cell size, separate it from true iron deficiency.",
      "info": {
        "text": "Iron is present in stores but unavailable for hemoglobin because inflammation raises hepcidin.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Anemia",
            "label": "Anemia — functional iron deficiency"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "Iron deficiency anemia",
        "Anemia of chronic inflammation"
      ]
    },
    {
      "id": "bridge-retic-mcv",
      "term": "Reticulocytosis raises the MCV",
      "clusters": [
        1,
        3
      ],
      "fact": "Young reticulocytes are larger than mature red cells, so brisk hemolysis can itself produce a non-megaloblastic macrocytosis — big cells with a high reticulocyte count, not a B12 or folate problem.",
      "info": {
        "text": "Rapid red-cell turnover releases young, oversized cells that inflate the measured MCV.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Macrocytic_anemia",
            "label": "Macrocytic anemia — non-megaloblastic"
          }
        ]
      },
      "relationKind": "cross-cutting"
    },
    {
      "id": "bridge-hemoglobin-defects",
      "term": "Hemoglobin production defects",
      "clusters": [
        0,
        3
      ],
      "fact": "Thalassemia is a globin-chain defect that both shrinks red cells and, in severe forms, destroys them — one disease appearing in two textbook classes.",
      "info": {
        "text": "Defective globin chains both starve cells of hemoglobin (small cells) and shorten their survival.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Hemolytic_anemia",
            "label": "Hemolytic anemia — defects in hemoglobin production"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "Beta-thalassemia trait",
        null
      ]
    }
  ],
  "lenses": [
    {
      "id": "lens-high-retic",
      "prompt": "Which anemias present with a HIGH reticulocyte count — a marrow racing to replace cells that are being destroyed faster than they can be made?",
      "explanation": "Every anemia in the destruction class shows it; none of the production-failure or deficiency causes can — their problem is supply, not loss.",
      "targets": [
        "Autoimmune hemolytic anemia",
        "G6PD deficiency",
        "Hereditary spherocytosis",
        "Sickle cell disease"
      ],
      "reasons": {
        "Autoimmune hemolytic anemia": "Antibody-mediated destruction with an intact marrow: reticulocytes climb.",
        "G6PD deficiency": "Episodic oxidative hemolysis; the marrow responds briskly during episodes.",
        "Hereditary spherocytosis": "Chronic splenic destruction met by constant marrow compensation.",
        "Sickle cell disease": "Shortened cell survival drives a chronically elevated count."
      }
    },
    {
      "id": "lens-retic-floor",
      "prompt": "Which anemia sits nearest a reticulocyte count of zero because the hormone that tells the marrow to produce has gone missing?",
      "explanation": "Aplastic anemia also runs a count near zero, but there the factory is destroyed — hormone replacement cannot help. The hormonal story belongs to the kidney alone.",
      "targets": [
        "Anemia of chronic kidney disease"
      ],
      "reasons": {
        "Anemia of chronic kidney disease": "Erythropoietin is made by the kidney; its loss silences the production signal."
      }
    },
    {
      "id": "lens-ferritin",
      "prompt": "Ferritin separates which two anemias on this board — one starved of iron, one unable to release it?",
      "explanation": "Ferritin is the pivot: low in true deficiency, high in inflammation — the same smear with opposite iron pictures. Thalassemia involves no iron-release failure at all, and the marrow-failure anemias are not iron-starved.",
      "targets": [
        "Anemia of chronic inflammation",
        "Iron deficiency anemia"
      ],
      "reasons": {
        "Anemia of chronic inflammation": "Hepcidin blocks iron mobilization: ferritin normal or high, transferrin saturation low.",
        "Iron deficiency anemia": "Stores are exhausted: ferritin low, transferrin high."
      }
    },
    {
      "id": "lens-sideroblastic",
      "prompt": "Iron is available but cannot be incorporated into hemoglobin, leaving iron-loaded ringed sideroblasts in the marrow — which anemia?",
      "explanation": "Lead poisons the same pathway differently — enzyme inhibition with basophilic stippling and no true ring sideroblasts — which is why the smear and marrow, not just cell size, finish the workup.",
      "targets": [
        "Sideroblastic anemia"
      ],
      "reasons": {
        "Sideroblastic anemia": "Defective heme synthesis strands iron in mitochondria ringing the nucleus."
      }
    },
    {
      "id": "lens-b12",
      "prompt": "Which macrocytic anemia also threatens the nervous system — the reason B12 is replaced before folate?",
      "explanation": "B12 deficiency damages myelin; folate replacement alone can let neurologic injury progress. Alcohol, liver disease, hypothyroidism, and myelodysplastic syndrome do not attack nerves.",
      "targets": [
        "Pernicious anemia (B12 deficiency)"
      ],
      "reasons": {
        "Pernicious anemia (B12 deficiency)": "Autoimmune loss of intrinsic factor causes B12 deficiency, which damages myelin as well as DNA synthesis."
      }
    },
    {
      "id": "lens-intrinsic-defects",
      "prompt": "Which two hemolytic anemias are inherited defects of the cell itself — its membrane or its metabolism — rather than of its hemoglobin or its immune handling?",
      "explanation": "All four are destruction, but the mechanisms split two ways: intrinsic structural defects (membrane, enzyme) versus a hemoglobin mutation (sickle) versus an acquired immune attack (autoimmune).",
      "targets": [
        "G6PD deficiency",
        "Hereditary spherocytosis"
      ],
      "reasons": {
        "G6PD deficiency": "Inherited loss of the antioxidant enzyme shield — a metabolism defect.",
        "Hereditary spherocytosis": "Inherited membrane-skeleton loss — a structural defect of the cell wall."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": false,
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Two numbers tell the anemia story",
    "summary": "How the two numbers on every anemia workup — red-cell size and reticulocyte count — sort the causes into classes.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Anemia means fewer red blood cells — or less hemoglobin inside them — than the body needs: blood carries less oxygen, and fatigue, pallor, and breathlessness follow. Clinicians classify it with two numbers that appear on every workup.\r\n\r\nThe first is the mean corpuscular volume (MCV) — the average size of a red cell. Normal is 80–100 femtoliters. Cells smaller than 80 are microcytic: something constrains the hemoglobin that plumps them up. The usual suspects are exhausted iron stores (iron deficiency anemia), a globin-gene defect that thins hemoglobin without touching iron (beta-thalassemia trait), and blocked heme synthesis — iron present but unusable — in sideroblastic anemia, and in lead poisoning, which inhibits the heme enzymes and leaves coarse basophilic stippling on the smear.\r\n\r\nCells over 100 fL are macrocytic, and the split that matters is megaloblastic versus not. Megaloblastic causes impair DNA synthesis, so cells mature into large ovals with hypersegmented neutrophils: vitamin B12 deficiency and folate deficiency. Pernicious anemia is the autoimmune form of B12 loss — parietal cells stop making intrinsic factor — and it is the urgent one, because B12 deficiency also damages nerves; replacing folate alone can let that injury march on. Non-megaloblastic macrocytosis runs through chronic alcohol use (direct marrow toxicity plus folate suppression), liver disease (membrane lipids changed), hypothyroidism, and myelodysplastic syndrome, a clonal marrow disorder of older adults that can progress to acute leukemia.\r\n\r\nBetween 80 and 100 the anemia is normocytic, and the second number takes over: the reticulocyte count — immature red cells freshly released by the marrow. A high count means the marrow is healthy and cells are being destroyed faster than they can be replaced: hemolysis. Sickle cell disease polymerizes hemoglobin and fragilizes cells; hereditary spherocytosis strips membrane proteins so the spleen trims the cells round; G6PD deficiency leaves cells without an antioxidant shield, so oxidizing drugs or fava beans trigger sudden hemolysis; autoimmune hemolytic anemia is antibody-mediated destruction, positive on the Coombs test. A low reticulocyte count means the marrow cannot answer. Inflammation raises hepcidin and locks iron away (anemia of chronic inflammation); kidneys that fail stop making erythropoietin, the production signal (anemia of chronic kidney disease); or the factory itself is destroyed (aplastic anemia).\r\n\r\nTwo cross-currents keep the classes honest. Brisk hemolysis floods the blood with oversized young reticulocytes and can inflate the MCV — big cells with a high count are not a vitamin problem. And in chronic inflammation iron is present but locked away — functional iron deficiency — so the count can shade microcytic; ferritin and transferrin saturation, not cell size, tell true starvation from blocked release."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
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
      "puzzleId": "anemia-classification-clinical",
      "puzzleRevision": "fnv1a32:b8c5a848",
      "board": {
        "width": 1200,
        "height": 780
      },
      "nodes": {
        "term:Iron deficiency anemia": {
          "x": 1085.87,
          "y": 142.63
        },
        "term:Beta-thalassemia trait": {
          "x": 562.56,
          "y": 146.5
        },
        "term:Sideroblastic anemia": {
          "x": 787.19,
          "y": 143.89
        },
        "term:Lead poisoning": {
          "x": 982.07,
          "y": 72.99
        },
        "term:Pernicious anemia (B12 deficiency)": {
          "x": 532.03,
          "y": 480.5
        },
        "term:Chronic alcohol use": {
          "x": 939.88,
          "y": 480.07
        },
        "term:Folate deficiency": {
          "x": 724.14,
          "y": 577.87
        },
        "term:Liver disease": {
          "x": 876.44,
          "y": 288.95
        },
        "term:Hypothyroidism": {
          "x": 906.48,
          "y": 579.85
        },
        "term:Myelodysplastic syndrome": {
          "x": 942.01,
          "y": 373.95
        },
        "term:Anemia of chronic kidney disease": {
          "x": 226.39,
          "y": 710.98
        },
        "term:Aplastic anemia": {
          "x": 409.99,
          "y": 548.73
        },
        "term:Anemia of chronic inflammation": {
          "x": 568.46,
          "y": 719.34
        },
        "term:Sickle cell disease": {
          "x": 120.05,
          "y": 190.52
        },
        "term:G6PD deficiency": {
          "x": 113.41,
          "y": 323.05
        },
        "term:Hereditary spherocytosis": {
          "x": 165.6,
          "y": 72
        },
        "term:Autoimmune hemolytic anemia": {
          "x": 139.82,
          "y": 424.91
        },
        "term:Reticulocyte count": {
          "x": 353.33,
          "y": 371.15
        },
        "term:Functional iron deficiency": {
          "x": 1088.05,
          "y": 719.97
        },
        "term:Reticulocytosis raises the MCV": {
          "x": 623.9,
          "y": 250.69
        },
        "term:Hemoglobin production defects": {
          "x": 417.83,
          "y": 75.34
        },
        "cluster:0": {
          "x": 727.31,
          "y": 72
        },
        "cluster:1": {
          "x": 620.87,
          "y": 363.61
        },
        "cluster:2": {
          "x": 289.57,
          "y": 626.39
        },
        "cluster:3": {
          "x": 305,
          "y": 245
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T23:13:26.551Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "anemia-classification-clinical",
      "puzzleRevision": "fnv1a32:b8c5a848",
      "board": {
        "width": 1200,
        "height": 780
      },
      "nodes": {
        "term:Iron deficiency anemia": {
          "x": 312.55,
          "y": 503.16,
          "pinned": false
        },
        "term:Beta-thalassemia trait": {
          "x": 353.91,
          "y": 685.11,
          "pinned": false
        },
        "term:Sideroblastic anemia": {
          "x": 133.11,
          "y": 485.8,
          "pinned": false
        },
        "term:Lead poisoning": {
          "x": 204.8,
          "y": 623.33,
          "pinned": false
        },
        "term:Pernicious anemia (B12 deficiency)": {
          "x": 840.6,
          "y": 230.85,
          "pinned": false
        },
        "term:Chronic alcohol use": {
          "x": 681.33,
          "y": 86.5,
          "pinned": false
        },
        "term:Folate deficiency": {
          "x": 829.49,
          "y": 23,
          "pinned": false
        },
        "term:Liver disease": {
          "x": 1032.14,
          "y": 188.97,
          "pinned": false
        },
        "term:Hypothyroidism": {
          "x": 965.86,
          "y": 73.62,
          "pinned": false
        },
        "term:Myelodysplastic syndrome": {
          "x": 1036.05,
          "y": 353.46,
          "pinned": false
        },
        "term:Anemia of chronic kidney disease": {
          "x": 548.95,
          "y": 247.77,
          "pinned": false
        },
        "term:Aplastic anemia": {
          "x": 516.57,
          "y": 54.41,
          "pinned": false
        },
        "term:Anemia of chronic inflammation": {
          "x": 339.83,
          "y": 123.43,
          "pinned": false
        },
        "term:Sickle cell disease": {
          "x": 705.31,
          "y": 612.21,
          "pinned": false
        },
        "term:G6PD deficiency": {
          "x": 760.29,
          "y": 757,
          "pinned": false
        },
        "term:Hereditary spherocytosis": {
          "x": 589.48,
          "y": 754.46,
          "pinned": false
        },
        "term:Autoimmune hemolytic anemia": {
          "x": 929.8,
          "y": 695.82,
          "pinned": false
        },
        "term:Reticulocyte count": {
          "x": 660.06,
          "y": 420.65,
          "pinned": false
        },
        "term:Functional iron deficiency": {
          "x": 232.77,
          "y": 320.64,
          "pinned": false
        },
        "term:Reticulocytosis raises the MCV": {
          "x": 858.29,
          "y": 479.8,
          "pinned": false
        },
        "term:Hemoglobin production defects": {
          "x": 515.2,
          "y": 552.76,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5034.54,
        "score": 5034.5396508131025
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:13:45.333Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "anemia-classification-clinical",
      "puzzleRevision": "fnv1a32:b8c5a848",
      "board": {
        "width": 1200,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 1010.65,
          "y": 379.13,
          "pinned": true
        },
        "cluster:1": {
          "x": 226.11,
          "y": 398,
          "pinned": false
        },
        "cluster:2": {
          "x": 600,
          "y": 605.66,
          "pinned": true
        },
        "cluster:3": {
          "x": 626.82,
          "y": 186.37,
          "pinned": true
        }
      },
      "bridges": {
        "term:Reticulocyte count": {
          "x": 514.64,
          "y": 405.88,
          "pinned": true
        },
        "term:Functional iron deficiency": {
          "x": 860.49,
          "y": 567.92,
          "pinned": false
        },
        "term:Reticulocytosis raises the MCV": {
          "x": 345.47,
          "y": 219.14,
          "pinned": true
        },
        "term:Hemoglobin production defects": {
          "x": 713.41,
          "y": 375.16,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Iron deficiency anemia",
          "Beta-thalassemia trait",
          "Sideroblastic anemia",
          "Lead poisoning"
        ],
        "cluster:1": [
          "Pernicious anemia (B12 deficiency)",
          "Chronic alcohol use",
          "Folate deficiency",
          "Liver disease",
          "Hypothyroidism",
          "Myelodysplastic syndrome"
        ],
        "cluster:2": [
          "Anemia of chronic kidney disease",
          "Aplastic anemia",
          "Anemia of chronic inflammation"
        ],
        "cluster:3": [
          "Sickle cell disease",
          "G6PD deficiency",
          "Hereditary spherocytosis",
          "Autoimmune hemolytic anemia"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Sideroblastic anemia",
          "Beta-thalassemia trait",
          "Iron deficiency anemia",
          "Lead poisoning"
        ],
        "cluster:1": [
          "Hypothyroidism",
          "Chronic alcohol use",
          "Pernicious anemia (B12 deficiency)",
          "Myelodysplastic syndrome",
          "Folate deficiency",
          "Liver disease"
        ],
        "cluster:2": [
          "Aplastic anemia",
          "Anemia of chronic kidney disease",
          "Anemia of chronic inflammation"
        ],
        "cluster:3": [
          "Sickle cell disease",
          "Autoimmune hemolytic anemia",
          "Hereditary spherocytosis",
          "G6PD deficiency"
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
        "totalLength": 1069.3504966271878
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:14:31.720Z"
    }
  },
  "board": {
    "sizeFactor": 1.25,
    "source": "author",
    "savedAt": "2026-10-15T23:13:25.707Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
