// Generated from content/puzzles/blood-groups-and-transfusion.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "blood-groups-and-transfusion",
  "title": "Blood groups and transfusion",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "blood-hemostasis"
  },
  "info": {
    "text": "Antigens on red cells and the antibodies that react with them decide whether blood can be safely shared, why a mismatch destroys red cells, and how an Rh-negative mother's immune response can harm a later child.",
    "links": [
      {
        "href": "wiki:Blood type"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 36, \"Blood Types; Transfusion; Tissue and Organ Transplantation\"",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "url": "https://www.eu.elsevierhealth.com/guyton-and-hall-textbook-of-medical-physiology-9780323640060.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "abo-system",
      "name": "ABO system",
      "color": "teal",
      "fact": "Enzymes add one sugar to the H antigen to make the A or B antigen on red cells, and in the first months of life each person forms antibodies against whichever of A and B their own cells lack.",
      "terms": [
        "A antigen",
        "B antigen",
        "H antigen",
        "anti-A antibodies",
        "anti-B antibodies"
      ],
      "seeds": [
        "A antigen",
        "B antigen"
      ],
      "termInfo": {
        "A antigen": {
          "text": "A sugar chain on the red-cell surface, made when an enzyme adds N-acetylgalactosamine to the H antigen; present in types A and AB. Guyton calls it the type A agglutinogen.",
          "links": [
            {
              "href": "wiki:ABO blood group system"
            }
          ]
        },
        "B antigen": {
          "text": "A sugar chain made when an enzyme adds galactose to the H antigen; present in types B and AB.",
          "links": [
            {
              "href": "wiki:ABO blood group system"
            }
          ]
        },
        "H antigen": {
          "text": "The precursor sugar chain on which A and B are built. Type O cells carry it unmodified and in the largest amount; the rare Bombay phenotype lacks it entirely.",
          "links": [
            {
              "href": "wiki:Hh blood group"
            }
          ]
        },
        "anti-A antibodies": {
          "text": "Antibodies present in the plasma of type B and type O people. They appear without any exposure to foreign blood, probably in response to similar sugars on gut bacteria and food, and are mostly IgM. Guyton calls them agglutinins.",
          "links": [
            {
              "href": "wiki:ABO blood group system"
            }
          ]
        },
        "anti-B antibodies": {
          "text": "Antibodies present in the plasma of type A and type O people, formed in the same way as anti-A.",
          "links": [
            {
              "href": "wiki:ABO blood group system"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:ABO blood group system"
          }
        ]
      }
    },
    {
      "id": "rh-system",
      "name": "Rh system",
      "color": "blue",
      "fact": "Red cells carrying the D antigen are Rh-positive; an Rh-negative person has no anti-D antibodies until sensitization by Rh-positive cells, from a transfusion or a pregnancy, leads the immune system to make them over the following months.",
      "terms": [
        "D antigen",
        "Rh-negative",
        "anti-D antibodies",
        "sensitization"
      ],
      "seeds": [
        "D antigen",
        "Rh-negative"
      ],
      "termInfo": {
        "D antigen": {
          "text": "A red-cell membrane protein, the most immunogenic of the Rh antigens; its presence defines Rh-positive blood. Guyton also lists the weaker C, E, c, and e antigens.",
          "links": [
            {
              "href": "wiki:Rh blood group system"
            }
          ]
        },
        "Rh-negative": {
          "text": "Lacking the D antigen. About 15 percent of white people are Rh-negative, and fewer in most other populations.",
          "links": [
            {
              "href": "wiki:Rh blood group system"
            }
          ]
        },
        "anti-D antibodies": {
          "text": "IgG antibodies against the D antigen, formed only after an Rh-negative person is exposed to Rh-positive cells.",
          "links": [
            {
              "href": "wiki:Rh blood group system"
            }
          ]
        },
        "sensitization": "The first immune response to a foreign red-cell antigen. Anti-D antibodies rise slowly, peaking two to four months after exposure, so the first exposure itself rarely causes harm; it primes the next one."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Rh blood group system"
          }
        ]
      }
    },
    {
      "id": "compatibility-testing",
      "name": "Compatibility testing",
      "color": "amber",
      "fact": "Before a routine transfusion, blood typing identifies the patient's ABO and Rh groups, an antibody screen tests the patient's plasma for other red-cell antibodies, and a crossmatch mixes that plasma with the chosen donor cells; the direct antiglobulin test instead looks for antibody already bound to a patient's own cells.",
      "terms": [
        "blood typing",
        "crossmatch",
        "antibody screen",
        "direct antiglobulin test"
      ],
      "seeds": [
        "blood typing",
        "crossmatch"
      ],
      "termInfo": {
        "antibody screen": {
          "text": "Testing the patient's plasma against type O reagent cells that carry the common minor antigens, such as Kell, Duffy, and Kidd, to find antibodies left by earlier transfusions or pregnancies.",
          "links": [
            {
              "href": "wiki:Blood compatibility testing"
            }
          ]
        },
        "blood typing": {
          "text": "Mixing a patient's red cells with anti-A, anti-B, and anti-D reagents, and the patient's plasma with known A and B cells, to read the ABO and Rh groups from which mixtures clump.",
          "links": [
            {
              "href": "wiki:Blood type"
            }
          ]
        },
        "crossmatch": {
          "text": "A final check that mixes the recipient's plasma with cells from the actual donor unit; clumping or lysis means the unit must not be given.",
          "links": [
            {
              "href": "wiki:Cross-matching"
            }
          ]
        },
        "direct antiglobulin test": {
          "text": "Also called the direct Coombs test. An anti-human-antibody reagent is added to the patient's own washed red cells; clumping shows that antibody or complement already coats them, as in a hemolytic reaction or hemolytic disease of the newborn.",
          "links": [
            {
              "href": "wiki:Coombs test"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Blood compatibility testing"
          }
        ]
      }
    },
    {
      "id": "transfusion-reactions",
      "name": "Transfusion reactions",
      "color": "magenta",
      "fact": "An ABO mismatch destroys donor cells inside the vessels within minutes, spilling hemoglobin into plasma and urine and endangering the kidneys; a reaction against Rh or minor antigens usually comes days later, as antibody-coated cells are removed in the spleen.",
      "terms": [
        "acute hemolytic reaction",
        "delayed hemolytic reaction",
        "extravascular hemolysis",
        "hemoglobinuria",
        "acute kidney injury"
      ],
      "seeds": [
        "acute hemolytic reaction",
        "delayed hemolytic reaction"
      ],
      "termInfo": {
        "acute hemolytic reaction": {
          "text": "Rapid destruction of transfused red cells by preexisting antibodies, almost always from ABO-incompatible blood given in error; fever, chills, back pain, low blood pressure, and dark urine follow within minutes to hours.",
          "links": [
            {
              "href": "wiki:Acute hemolytic transfusion reaction"
            }
          ]
        },
        "acute kidney injury": {
          "text": "A sudden fall in kidney function. Guyton calls it acute kidney shutdown and traces it to renal vasoconstriction, low blood pressure, and hemoglobin precipitating in the tubules.",
          "links": [
            {
              "href": "wiki:Acute kidney injury"
            }
          ]
        },
        "delayed hemolytic reaction": {
          "text": "Destruction of transfused cells three to fourteen days after transfusion, when an antibody too weak to detect beforehand rises again; it usually causes falling hemoglobin and jaundice rather than shock.",
          "links": [
            {
              "href": "wiki:Delayed hemolytic transfusion reaction"
            }
          ]
        },
        "extravascular hemolysis": {
          "text": "Removal of antibody-coated red cells by macrophages in the spleen and liver rather than lysis in the bloodstream; their heme becomes bilirubin.",
          "links": [
            {
              "href": "wiki:Hemolysis"
            }
          ]
        },
        "hemoglobinuria": {
          "text": "Hemoglobin in the urine. When cells burst in the bloodstream, free hemoglobin overwhelms the plasma protein haptoglobin that normally binds it, is filtered by the kidneys, and turns the urine red-brown.",
          "links": [
            {
              "href": "wiki:Hemoglobinuria"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Blood transfusion"
          }
        ]
      }
    },
    {
      "id": "hemolytic-disease-of-the-newborn",
      "name": "Hemolytic disease of the newborn",
      "color": "olive",
      "fact": "When an Rh-negative mother has been sensitized by an earlier Rh-positive baby, her anti-D antibodies attack the red cells of the next Rh-positive fetus, causing anemia that can lead to heart failure before birth and dangerous bilirubin levels after it.",
      "terms": [
        "hemolytic disease of the newborn",
        "exchange transfusion",
        "fetomaternal hemorrhage",
        "hydrops fetalis",
        "kernicterus"
      ],
      "seeds": [
        "hemolytic disease of the newborn",
        "exchange transfusion"
      ],
      "termInfo": {
        "exchange transfusion": {
          "text": "Gradually replacing a newborn's blood with Rh-negative donor blood, which removes antibody-coated cells and bilirubin at once. Intrauterine transfusion and phototherapy now handle many cases.",
          "links": [
            {
              "href": "wiki:Exchange transfusion"
            }
          ]
        },
        "fetomaternal hemorrhage": {
          "text": "Passage of fetal red cells into the mother's circulation, most of it at delivery but also with miscarriage, abdominal trauma, or invasive procedures.",
          "links": [
            {
              "href": "wiki:Fetal-maternal haemorrhage"
            }
          ]
        },
        "hemolytic disease of the newborn": {
          "text": "Destruction of fetal red cells by maternal antibodies. Guyton calls it erythroblastosis fetalis, after the immature red cells the stressed fetal marrow releases; the newer name hemolytic disease of the fetus and newborn (HDFN) reflects that it begins before birth.",
          "links": [
            {
              "href": "wiki:Hemolytic disease of the newborn"
            }
          ]
        },
        "hydrops fetalis": {
          "text": "Severe fluid accumulation in the fetus, from heart failure caused by profound anemia.",
          "links": [
            {
              "href": "wiki:Hydrops fetalis"
            }
          ]
        },
        "kernicterus": {
          "text": "Brain damage from unconjugated bilirubin deposited in the basal ganglia. Before birth the placenta clears the bilirubin; after birth the newborn liver cannot keep up.",
          "links": [
            {
              "href": "wiki:Bilirubin encephalopathy",
              "label": "Kernicterus (bilirubin encephalopathy)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Hemolytic disease of the newborn"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "complement-activation",
      "term": "complement activation",
      "clusters": [
        0,
        3
      ],
      "fact": "Anti-A and anti-B antibodies are mostly IgM, which binds many antigens at once and triggers the complement cascade; complement punches holes in the donor cells' membranes, so an ABO mismatch bursts cells inside the vessels.",
      "info": {
        "text": "A cascade of plasma proteins that antibodies can trigger; its end product, the membrane attack complex, lyses the coated cell.",
        "links": [
          {
            "href": "wiki:Complement system"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "anti-A antibodies",
        "acute hemolytic reaction"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "agglutination",
      "term": "agglutination",
      "clusters": [
        2,
        3
      ],
      "fact": "Because each antibody can bind antigens on two or more cells, matching antibody makes red cells clump; a typing test reads that clumping in a tube, and the same clumping in the vessels begins a mismatched transfusion's damage.",
      "info": {
        "text": "The clumping of red cells bridged by antibody; it gives the older terms agglutinogen and agglutinin their names.",
        "links": [
          {
            "href": "wiki:Agglutination (biology)"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "blood typing",
        "acute hemolytic reaction"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "anamnestic-response",
      "term": "anamnestic response",
      "clusters": [
        1,
        3
      ],
      "fact": "A person sensitized long ago may carry too little antibody to detect, but a new exposure to the antigen brings a rapid, much larger secondary response within days, destroying the transfused cells in a delayed reaction.",
      "info": {
        "text": "The faster, stronger antibody response of immune memory on a second exposure to an antigen.",
        "links": [
          {
            "href": "wiki:Immunological memory"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "sensitization",
        "delayed hemolytic reaction"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "igg-antibodies",
      "term": "IgG antibodies",
      "clusters": [
        1,
        4
      ],
      "fact": "Anti-D antibodies are IgG, the only antibody class actively carried across the placenta, so a sensitized mother's antibodies reach the fetus; ABO antibodies are mostly IgM and stay in her circulation, which is why ABO incompatibility in pregnancy is usually mild.",
      "info": {
        "text": "The smaller, single-unit antibody class that dominates secondary responses and is transported across the placenta.",
        "links": [
          {
            "href": "wiki:Immunoglobulin G"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "anti-D antibodies",
        "hemolytic disease of the newborn"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 4
      }
    },
    {
      "id": "rh-immune-globulin",
      "term": "Rh immune globulin",
      "clusters": [
        4,
        1
      ],
      "fact": "Giving an Rh-negative mother anti-D antibodies during pregnancy and within 72 hours after an Rh-positive birth keeps the fetal cells that entered her blood from sensitizing her, so later pregnancies are spared.",
      "info": {
        "text": "A preparation of anti-D antibody, also called anti-D immunoglobulin. How it blocks sensitization is still debated: it may clear fetal cells before the immune system responds, or suppress the antibody-forming cells directly.",
        "links": [
          {
            "href": "wiki:Rho(D) immune globulin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "fetomaternal hemorrhage",
        "sensitization"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "sugar-antigens",
      "prompt": "Which antigens are made by adding a sugar to the H antigen?",
      "explanation": "A person with both enzymes is type AB; one with neither is type O and keeps the H antigen unchanged. The D antigen is a membrane protein, made by a separate gene.",
      "targets": [
        "A antigen",
        "B antigen"
      ],
      "reasons": {
        "A antigen": "An inherited enzyme adds N-acetylgalactosamine to the H antigen.",
        "B antigen": "A slightly different enzyme adds galactose instead."
      }
    },
    {
      "id": "universal-donor-cells",
      "prompt": "Which terms describe the red cells of a type O, Rh-negative donor?",
      "explanation": "With no A, B, or D antigen, these cells give the recipient's antibodies nothing to attack, which is why O-negative red cells are used in emergencies before typing is done. The donor's plasma still holds anti-A and anti-B, which is one reason red cells are given separately from plasma.",
      "targets": [
        "H antigen",
        "Rh-negative"
      ],
      "reasons": {
        "H antigen": "Type O cells carry the H antigen unmodified, with no A or B added.",
        "Rh-negative": "The cells lack the D antigen."
      }
    },
    {
      "id": "type-o-plasma",
      "prompt": "Which antibodies are present in the plasma of a type O person?",
      "explanation": "These antibodies appear in early infancy without any transfusion. Anti-D is different: an Rh-negative person forms it only after sensitization.",
      "targets": [
        "anti-A antibodies",
        "anti-B antibodies"
      ],
      "reasons": {
        "anti-A antibodies": "Type O cells lack the A antigen, so the body forms antibodies against it.",
        "anti-B antibodies": "They lack the B antigen as well."
      }
    },
    {
      "id": "donor-must-lack",
      "prompt": "Which antigens must donor red cells lack for a type A, Rh-negative recipient?",
      "explanation": "The A antigen is safe because it matches the recipient's own cells, and the H antigen is on everyone's cells. Type A or type O, Rh-negative cells are both suitable.",
      "targets": [
        "B antigen",
        "D antigen"
      ],
      "reasons": {
        "B antigen": "The recipient's plasma already contains anti-B antibodies.",
        "D antigen": "An Rh-negative recipient exposed to D could be sensitized, endangering future transfusions and pregnancies."
      }
    },
    {
      "id": "first-rh-exposure",
      "prompt": "Which terms describe an Rh-negative person's first response to Rh-positive cells?",
      "explanation": "Because the antibodies come too late to destroy the first cells, the first exposure is usually harmless. The danger lies in the next exposure, when immune memory produces a fast, strong response.",
      "targets": [
        "sensitization",
        "anti-D antibodies"
      ],
      "reasons": {
        "anti-D antibodies": "These are the product of that response, rising over two to four months.",
        "sensitization": "The immune system first meets the D antigen and begins a slow primary response."
      }
    },
    {
      "id": "pretransfusion-tests",
      "prompt": "Which tests are run before a routine red-cell transfusion?",
      "explanation": "The direct antiglobulin test is not part of routine selection; it is used when hemolysis is suspected, to check whether antibody already coats the patient's own cells.",
      "targets": [
        "blood typing",
        "antibody screen",
        "crossmatch"
      ],
      "reasons": {
        "antibody screen": "It looks for antibodies against minor antigens left by earlier exposures.",
        "blood typing": "It identifies the patient's ABO and Rh groups.",
        "crossmatch": "It confirms that the chosen donor unit does not react with the patient's plasma."
      }
    },
    {
      "id": "what-typing-reads",
      "prompt": "Which event does a blood-typing test detect?",
      "explanation": "Clumping with anti-A reagent means the cells carry the A antigen; no clumping with anti-D means they are Rh-negative.",
      "targets": [
        "agglutination"
      ],
      "reasons": {
        "agglutination": "Red cells that carry a matching antigen clump when the reagent antibody bridges them."
      }
    },
    {
      "id": "coated-cells",
      "prompt": "Which test detects antibody already bound to a patient's own red cells?",
      "explanation": "The antibody screen and crossmatch both test the patient's plasma for free antibody. The direct test looks at the cells, so it confirms a hemolytic transfusion reaction or hemolytic disease of the newborn.",
      "targets": [
        "direct antiglobulin test"
      ],
      "reasons": {
        "direct antiglobulin test": "An anti-human-antibody reagent makes antibody-coated cells clump."
      }
    },
    {
      "id": "minutes-after-mismatch",
      "prompt": "Which reaction follows within minutes when ABO-incompatible blood is transfused?",
      "explanation": "No sensitization is needed because ABO antibodies are always present. Most such reactions come from clerical errors in labeling or identifying the patient.",
      "targets": [
        "acute hemolytic reaction"
      ],
      "reasons": {
        "acute hemolytic reaction": "Preexisting anti-A or anti-B antibodies attack the donor cells at once."
      }
    },
    {
      "id": "lysis-in-vessels",
      "prompt": "Which process bursts mismatched red cells inside the blood vessels?",
      "explanation": "Agglutination clumps the cells but does not open them. Antibodies that do not activate complement strongly, as in most Rh reactions, lead instead to removal in the spleen.",
      "targets": [
        "complement activation"
      ],
      "reasons": {
        "complement activation": "IgM anti-A and anti-B trigger the complement cascade, whose membrane attack complex lyses the cells."
      }
    },
    {
      "id": "kidney-threat",
      "prompt": "Which consequences of a hemolytic reaction involve the kidneys?",
      "explanation": "Both follow intravascular hemolysis. Extravascular hemolysis releases little free hemoglobin, so it spares the kidneys and shows up mainly as jaundice.",
      "targets": [
        "hemoglobinuria",
        "acute kidney injury"
      ],
      "reasons": {
        "acute kidney injury": "Low blood pressure, renal vasoconstriction, and hemoglobin precipitating in the tubules can stop kidney function.",
        "hemoglobinuria": "Free hemoglobin is filtered into the urine once haptoglobin is saturated."
      }
    },
    {
      "id": "delayed-reaction",
      "prompt": "Which terms describe a hemolytic reaction that begins days after transfusion in a previously sensitized patient?",
      "explanation": "The antibody screen can miss these antibodies because they had fallen below detectable levels. Rh antigens and minor antigens such as Kidd, Kell, and Duffy are the usual targets.",
      "targets": [
        "delayed hemolytic reaction",
        "anamnestic response",
        "extravascular hemolysis"
      ],
      "reasons": {
        "anamnestic response": "Immune memory raises an undetectable antibody to a high level within days.",
        "delayed hemolytic reaction": "The reaction itself, three to fourteen days after transfusion.",
        "extravascular hemolysis": "The IgG-coated cells are removed by macrophages, mostly in the spleen."
      }
    },
    {
      "id": "placental-crossing",
      "prompt": "Which antibody class crosses the placenta?",
      "explanation": "This protects the newborn with the mother's antibodies against infection, and it is also what lets anti-D reach the fetus. ABO antibodies are mostly IgM, so ABO incompatibility in pregnancy is usually mild.",
      "targets": [
        "IgG antibodies"
      ],
      "reasons": {
        "IgG antibodies": "The placenta actively transports IgG from mother to fetus."
      }
    },
    {
      "id": "sensitizing-event",
      "prompt": "Which event usually sensitizes an Rh-negative mother to the D antigen?",
      "explanation": "Because most of the bleeding happens at delivery, the first Rh-positive baby is rarely affected. The antibodies formed afterward threaten the next one.",
      "targets": [
        "fetomaternal hemorrhage"
      ],
      "reasons": {
        "fetomaternal hemorrhage": "Rh-positive fetal cells enter her circulation, most often at delivery."
      }
    },
    {
      "id": "prevention",
      "prompt": "What prevents an Rh-negative mother from becoming sensitized?",
      "explanation": "It must be given before sensitization; once a mother is making her own anti-D, it no longer helps. Its introduction in the 1960s made severe Rh disease rare where it is available.",
      "targets": [
        "Rh immune globulin"
      ],
      "reasons": {
        "Rh immune globulin": "Anti-D given during pregnancy and after delivery keeps the fetal cells from triggering her own response."
      }
    },
    {
      "id": "before-birth",
      "prompt": "Which terms describe what severe Rh disease does to a fetus before birth?",
      "explanation": "Before birth the placenta clears the bilirubin from the destroyed cells, so the danger in the womb is anemia. Bilirubin becomes the danger only after birth.",
      "targets": [
        "hemolytic disease of the newborn",
        "hydrops fetalis"
      ],
      "reasons": {
        "hemolytic disease of the newborn": "Maternal anti-D destroys fetal red cells, causing anemia that begins in the womb.",
        "hydrops fetalis": "Profound anemia leads to heart failure and widespread fluid accumulation."
      }
    },
    {
      "id": "after-birth",
      "prompt": "Which terms concern the bilirubin danger to a newborn with Rh disease?",
      "explanation": "The transfused blood is Rh-negative, so the mother's remaining anti-D has nothing to attack while the baby's own Rh-positive cells are gradually replaced.",
      "targets": [
        "kernicterus",
        "exchange transfusion"
      ],
      "reasons": {
        "exchange transfusion": "Replacing the baby's blood removes bilirubin along with antibody-coated cells.",
        "kernicterus": "Bilirubin the newborn liver cannot clear deposits in the brain."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "making-and-recycling-red-blood-cells",
        "reason": "See how the spleen and its macrophages remove red cells and turn their heme into bilirubin, the same route that clears antibody-coated cells after a mismatch.",
        "via": [
          "extravascular hemolysis",
          "kernicterus"
        ]
      },
      {
        "id": "anemia-classification-clinical",
        "reason": "Meet the direct antiglobulin test again at the bedside, where it identifies autoimmune destruction among the hemolytic anemias.",
        "via": [
          "direct antiglobulin test"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Why blood must be matched",
    "summary": "How ABO and Rh antigens and antibodies decide whether blood can be shared, how a mismatch destroys red cells, and how Rh disease of the newborn arises and is prevented.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "Red blood cells carry molecules on their surface that differ from person to person. When blood from one person enters another, the recipient's antibodies may recognize those molecules as foreign and destroy the donated cells. Two systems matter most: the ABO system and the Rh system. This lesson explains how each works, how blood is tested before a transfusion, what happens when a mismatch occurs, and how the same principles explain a disease of unborn and newborn children.\r\n\r\nPhysiologists call the surface molecules antigens and the molecules that react with them antibodies. Guyton's textbook uses the older terms agglutinogens and agglutinins, from the clumping, or agglutination, that a matching antigen and antibody produce.\r\n\r\n## The ABO system\r\n\r\nThe ABO antigens are short chains of sugar. Everyone makes a base chain called the **H antigen**. Inherited enzymes can add one more sugar to it: one enzyme makes the **A antigen**, and another makes the **B antigen**. A person with the first enzyme is type A, with the second type B, with both type AB, and with neither type O. Type O cells keep the H antigen unchanged.\r\n\r\nWhat makes the ABO system dangerous is that its antibodies are present without any transfusion. Within the first months of life, each person forms antibodies against whichever of A and B their own cells lack, probably in response to similar sugars on gut bacteria and food. A type A person has **anti-B antibodies**, a type B person has **anti-A antibodies**, and a type O person has both. A type AB person has neither.\r\n\r\n## The Rh system\r\n\r\nThe Rh system works differently. Its most important antigen, the **D antigen**, is a protein in the red-cell membrane. People whose cells carry it are Rh-positive; those who lack it are **Rh-negative**.\r\n\r\nAn Rh-negative person has no antibodies against D at birth. They form only after **sensitization**: exposure to Rh-positive cells, through a transfusion or a pregnancy. **Anti-D antibodies** then rise slowly over two to four months. The first exposure usually causes no harm, because the antibodies arrive too late to destroy the cells that triggered them. The danger comes with a later exposure.\r\n\r\n## Testing before a transfusion\r\n\r\nThree tests usually precede a red-cell transfusion. **Blood typing** mixes the patient's red cells with reagents containing anti-A, anti-B, and anti-D, and the patient's plasma with known A and B cells; the pattern of **agglutination** shows the ABO and Rh groups. An **antibody screen** tests the patient's plasma against reagent cells that carry less common antigens, such as Kell, Duffy, and Kidd, to find antibodies left by earlier transfusions or pregnancies. Finally, a **crossmatch** mixes the patient's plasma with cells from the actual donor unit.\r\n\r\nA fourth test answers a different question. The **direct antiglobulin test**, also called the direct Coombs test, examines the patient's own red cells for antibody already attached to them. It confirms that a reaction or a newborn's disease is caused by antibody.\r\n\r\nWhen there is no time for testing, type O, Rh-negative red cells are given, because they carry no A, B, or D antigen for the recipient's antibodies to attack.\r\n\r\n## Transfusion reactions\r\n\r\nAn **acute hemolytic reaction** follows the transfusion of ABO-incompatible blood, almost always because of an error in labeling or identifying the patient. The recipient's anti-A or anti-B antibodies are mostly of the IgM class, a large antibody with ten binding sites. IgM bridges donor cells into clumps, and it also sets off **complement activation**: a cascade of plasma proteins that ends by punching holes in the cell membrane. The donor cells burst inside the vessels within minutes, causing fever, chills, back pain, and falling blood pressure.\r\n\r\nWhen many cells burst, their hemoglobin overwhelms haptoglobin, the plasma protein that normally binds it. The free hemoglobin is filtered by the kidneys and colors the urine red-brown, a sign called **hemoglobinuria**. The kidneys themselves are at risk. Guyton describes acute kidney shutdown, now called **acute kidney injury**, caused by low blood pressure, constriction of renal vessels, and hemoglobin precipitating in the tubules.\r\n\r\nA **delayed hemolytic reaction** happens three to fourteen days after a transfusion. It occurs in a person who was sensitized long ago, by an earlier transfusion or a pregnancy, but whose antibody has fallen too low for the screen to detect. The new transfusion triggers an **anamnestic response**: immune memory produces a large amount of antibody within days. These antibodies are mostly IgG, which activates complement weakly, so the coated cells are removed by macrophages in the spleen and liver. This **extravascular hemolysis** releases little free hemoglobin; its main sign is jaundice, as the cells' heme becomes bilirubin.\r\n\r\n## Hemolytic disease of the newborn\r\n\r\nThe Rh system also explains a disease of pregnancy. When an Rh-negative mother carries an Rh-positive fetus, some fetal cells enter her circulation, mostly at delivery. This **fetomaternal hemorrhage** can sensitize her. Her first Rh-positive child is usually unaffected, because sensitization takes months.\r\n\r\nIn a later Rh-positive pregnancy, her anti-D antibodies cause harm because they are **IgG antibodies**, the only class the placenta carries from mother to fetus. They coat the fetal red cells, which are destroyed. The result is **hemolytic disease of the newborn**, which Guyton calls erythroblastosis fetalis. ABO antibodies are mostly IgM and stay in the mother's circulation, so ABO incompatibility in pregnancy is usually mild.\r\n\r\nBefore birth, the danger is anemia. The placenta clears the bilirubin, but severe anemia can cause heart failure and widespread swelling, a condition called **hydrops fetalis**. After birth, the newborn liver cannot clear bilirubin fast enough. It can deposit in the brain and cause permanent damage known as **kernicterus**. The classic treatment is an **exchange transfusion**, which gradually replaces the baby's blood with Rh-negative blood, removing both bilirubin and antibody-coated cells. Intrauterine transfusion and phototherapy now handle many cases.\r\n\r\nThe disease is now largely preventable. **Rh immune globulin**, a preparation of anti-D antibody, is given to Rh-negative mothers during pregnancy and within 72 hours after an Rh-positive birth. It keeps the fetal cells in the mother's blood from sensitizing her. How it works is still debated, but it must be given before the mother makes her own anti-D.\r\n\r\n## Further reading\r\n\r\nThe standard textbook account is chapter 36, \"Blood Types; Transfusion; Tissue and Organ Transplantation,\" in John E. Hall and Michael E. Hall, *Guyton and Hall Textbook of Medical Physiology*."
    },
    "links": [
      {
        "href": "wiki:Blood type"
      },
      {
        "href": "wiki:Hemolytic disease of the newborn"
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
      "puzzleId": "blood-groups-and-transfusion",
      "puzzleRevision": "fnv1a32:d019a018",
      "board": {
        "width": 1110,
        "height": 730
      },
      "nodes": {
        "term:A antigen": {
          "x": 417.89,
          "y": 708
        },
        "term:B antigen": {
          "x": 311.86,
          "y": 708
        },
        "term:H antigen": {
          "x": 203.46,
          "y": 708
        },
        "term:anti-A antibodies": {
          "x": 435.48,
          "y": 591.17
        },
        "term:anti-B antibodies": {
          "x": 115.55,
          "y": 616.03
        },
        "term:D antigen": {
          "x": 101.65,
          "y": 518.73
        },
        "term:Rh-negative": {
          "x": 75.56,
          "y": 444.29
        },
        "term:anti-D antibodies": {
          "x": 244.47,
          "y": 442.63
        },
        "term:sensitization": {
          "x": 404.53,
          "y": 443.23
        },
        "term:blood typing": {
          "x": 894.71,
          "y": 585.56
        },
        "term:crossmatch": {
          "x": 1001.27,
          "y": 642.83
        },
        "term:antibody screen": {
          "x": 879.27,
          "y": 704.02
        },
        "term:direct antiglobulin test": {
          "x": 636.86,
          "y": 698.04
        },
        "term:acute hemolytic reaction": {
          "x": 754.84,
          "y": 402.77
        },
        "term:delayed hemolytic reaction": {
          "x": 710.18,
          "y": 223.79
        },
        "term:extravascular hemolysis": {
          "x": 921.2,
          "y": 147.76
        },
        "term:hemoglobinuria": {
          "x": 1034.95,
          "y": 210.43
        },
        "term:acute kidney injury": {
          "x": 1019.2,
          "y": 359.94
        },
        "term:hemolytic disease of the newborn": {
          "x": 280.48,
          "y": 124.46
        },
        "term:exchange transfusion": {
          "x": 288.02,
          "y": 33.95
        },
        "term:fetomaternal hemorrhage": {
          "x": 531.6,
          "y": 125.42
        },
        "term:hydrops fetalis": {
          "x": 801.73,
          "y": 33.95
        },
        "term:kernicterus": {
          "x": 738.14,
          "y": 100.97
        },
        "term:complement activation": {
          "x": 617.33,
          "y": 516.57
        },
        "term:agglutination": {
          "x": 927.66,
          "y": 474.43
        },
        "term:anamnestic response": {
          "x": 527.77,
          "y": 354.95
        },
        "term:IgG antibodies": {
          "x": 149.52,
          "y": 314.69
        },
        "term:Rh immune globulin": {
          "x": 326.07,
          "y": 315.97
        },
        "cluster:0": {
          "x": 251.73,
          "y": 616.26
        },
        "cluster:1": {
          "x": 321.75,
          "y": 529.05
        },
        "cluster:2": {
          "x": 746.55,
          "y": 627.87
        },
        "cluster:3": {
          "x": 880.65,
          "y": 282.93
        },
        "cluster:4": {
          "x": 549.25,
          "y": 33.95
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T03:14:22.067Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "blood-groups-and-transfusion",
      "puzzleRevision": "fnv1a32:d019a018",
      "board": {
        "width": 1110,
        "height": 730
      },
      "nodes": {
        "term:A antigen": {
          "x": 869.12,
          "y": 264.4,
          "pinned": false
        },
        "term:B antigen": {
          "x": 954.92,
          "y": 204.41,
          "pinned": false
        },
        "term:H antigen": {
          "x": 963.97,
          "y": 308.7,
          "pinned": false
        },
        "term:anti-A antibodies": {
          "x": 739.83,
          "y": 251.95,
          "pinned": false
        },
        "term:anti-B antibodies": {
          "x": 843.9,
          "y": 136.97,
          "pinned": false
        },
        "term:D antigen": {
          "x": 386,
          "y": 597.44,
          "pinned": false
        },
        "term:Rh-negative": {
          "x": 368.74,
          "y": 707,
          "pinned": false
        },
        "term:anti-D antibodies": {
          "x": 504.94,
          "y": 706.86,
          "pinned": false
        },
        "term:sensitization": {
          "x": 498.58,
          "y": 564.52,
          "pinned": false
        },
        "term:blood typing": {
          "x": 252.13,
          "y": 418.66,
          "pinned": false
        },
        "term:crossmatch": {
          "x": 156.1,
          "y": 486.04,
          "pinned": false
        },
        "term:antibody screen": {
          "x": 264.87,
          "y": 551.1,
          "pinned": false
        },
        "term:direct antiglobulin test": {
          "x": 112.87,
          "y": 337.09,
          "pinned": false
        },
        "term:acute hemolytic reaction": {
          "x": 413.17,
          "y": 157.99,
          "pinned": false
        },
        "term:delayed hemolytic reaction": {
          "x": 527.24,
          "y": 328.91,
          "pinned": false
        },
        "term:extravascular hemolysis": {
          "x": 270.83,
          "y": 23.19,
          "pinned": false
        },
        "term:hemoglobinuria": {
          "x": 512.4,
          "y": 23,
          "pinned": false
        },
        "term:acute kidney injury": {
          "x": 234.56,
          "y": 199.81,
          "pinned": false
        },
        "term:hemolytic disease of the newborn": {
          "x": 838.79,
          "y": 631.4,
          "pinned": false
        },
        "term:exchange transfusion": {
          "x": 941.69,
          "y": 446.26,
          "pinned": false
        },
        "term:fetomaternal hemorrhage": {
          "x": 759.51,
          "y": 424.83,
          "pinned": false
        },
        "term:hydrops fetalis": {
          "x": 1027.75,
          "y": 579.06,
          "pinned": false
        },
        "term:kernicterus": {
          "x": 1005.88,
          "y": 707,
          "pinned": false
        },
        "term:complement activation": {
          "x": 606.86,
          "y": 149.77,
          "pinned": false
        },
        "term:agglutination": {
          "x": 339.62,
          "y": 305.19,
          "pinned": false
        },
        "term:anamnestic response": {
          "x": 391.36,
          "y": 461.36,
          "pinned": false
        },
        "term:IgG antibodies": {
          "x": 661.33,
          "y": 707,
          "pinned": false
        },
        "term:Rh immune globulin": {
          "x": 644.12,
          "y": 559.25,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5266.02,
        "score": 5266.021097441212
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-17T03:14:25.669Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "blood-groups-and-transfusion",
      "puzzleRevision": "fnv1a32:d019a018",
      "board": {
        "width": 1110,
        "height": 730
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 181.88,
          "y": 491.21,
          "pinned": true
        },
        "cluster:1": {
          "x": 604.49,
          "y": 173.27,
          "pinned": true
        },
        "cluster:2": {
          "x": 156.93,
          "y": 176.74,
          "pinned": true
        },
        "cluster:3": {
          "x": 652.59,
          "y": 527,
          "pinned": true
        },
        "cluster:4": {
          "x": 948.08,
          "y": 393.86,
          "pinned": true
        }
      },
      "bridges": {
        "term:complement activation": {
          "x": 333.61,
          "y": 619.11,
          "pinned": true
        },
        "term:agglutination": {
          "x": 314.88,
          "y": 333.23,
          "pinned": true
        },
        "term:anamnestic response": {
          "x": 467.04,
          "y": 329.07,
          "pinned": true
        },
        "term:IgG antibodies": {
          "x": 823.78,
          "y": 190.12,
          "pinned": true
        },
        "term:Rh immune globulin": {
          "x": 906.46,
          "y": 140.76,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "A antigen",
          "B antigen",
          "H antigen",
          "anti-A antibodies",
          "anti-B antibodies"
        ],
        "cluster:1": [
          "D antigen",
          "Rh-negative",
          "anti-D antibodies",
          "sensitization"
        ],
        "cluster:2": [
          "blood typing",
          "crossmatch",
          "antibody screen",
          "direct antiglobulin test"
        ],
        "cluster:3": [
          "acute hemolytic reaction",
          "delayed hemolytic reaction",
          "extravascular hemolysis",
          "hemoglobinuria",
          "acute kidney injury"
        ],
        "cluster:4": [
          "hemolytic disease of the newborn",
          "exchange transfusion",
          "fetomaternal hemorrhage",
          "hydrops fetalis",
          "kernicterus"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "B antigen",
          "H antigen",
          "anti-B antibodies",
          "anti-A antibodies",
          "A antigen"
        ],
        "cluster:1": [
          "Rh-negative",
          "sensitization",
          "anti-D antibodies",
          "D antigen"
        ],
        "cluster:2": [
          "blood typing",
          "direct antiglobulin test",
          "antibody screen",
          "crossmatch"
        ],
        "cluster:3": [
          "acute kidney injury",
          "delayed hemolytic reaction",
          "acute hemolytic reaction",
          "extravascular hemolysis",
          "hemoglobinuria"
        ],
        "cluster:4": [
          "hydrops fetalis",
          "fetomaternal hemorrhage",
          "hemolytic disease of the newborn",
          "exchange transfusion",
          "kernicterus"
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
        "totalLength": 2122.688243674025
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T03:14:06.183Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-17T03:14:14.469Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
