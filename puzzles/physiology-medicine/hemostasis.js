// Generated from content/puzzles/hemostasis.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "hemostasis",
  "title": "Hemostasis: how bleeding stops",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "blood-hemostasis"
  },
  "info": {
    "text": "Hemostasis seals a damaged vessel with a platelet plug reinforced by fibrin, while natural anticoagulants confine the clot to the wound and fibrinolysis removes it once the vessel heals.",
    "links": [
      {
        "href": "wiki:Hemostasis"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 37, \"Hemostasis and Blood Coagulation\"",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "url": "https://www.eu.elsevierhealth.com/guyton-and-hall-textbook-of-medical-physiology-9780323640060.html"
      },
      {
        "title": "A cell-based model of hemostasis",
        "author": "Maureen Hoffman and Dougald M. Monroe III",
        "publisher": "Thrombosis and Haemostasis 85(6): 958–965",
        "year": "2001",
        "url": "https://pubmed.ncbi.nlm.nih.gov/11434702/"
      },
      {
        "title": "Coagulation",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Coagulation"
      },
      {
        "title": "Fibrinolysis",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Fibrinolysis"
      }
    ]
  },
  "clusters": [
    {
      "id": "primary-hemostasis",
      "name": "Primary hemostasis",
      "color": "teal",
      "fact": "At an injured vessel, smooth muscle constricts and platelets adhere to exposed collagen, release ADP and thromboxane A2 to recruit more platelets, and link to one another through fibrinogen held by glycoprotein IIb/IIIa, sealing the breach with a loose plug.",
      "terms": [
        "vascular spasm",
        "subendothelial collagen",
        "glycoprotein Ib",
        "ADP",
        "thromboxane A2",
        "glycoprotein IIb/IIIa"
      ],
      "seeds": [
        "vascular spasm",
        "subendothelial collagen"
      ],
      "termInfo": {
        "ADP": {
          "text": "Adenosine diphosphate released from activated platelets; it activates passing platelets through the P2Y12 receptor, the target of clopidogrel.",
          "links": [
            {
              "href": "wiki:Adenosine diphosphate"
            }
          ]
        },
        "glycoprotein IIb/IIIa": {
          "text": "The most abundant platelet receptor; once activated it binds fibrinogen, which links neighboring platelets into an aggregate.",
          "links": [
            {
              "href": "wiki:Glycoprotein IIb/IIIa"
            }
          ]
        },
        "glycoprotein Ib": {
          "text": "The platelet receptor that catches von Willebrand factor on exposed collagen, letting platelets adhere even in fast arterial flow.",
          "links": [
            {
              "href": "wiki:Glycoprotein Ib"
            }
          ]
        },
        "subendothelial collagen": "Connective tissue beneath the vessel lining; injury exposes it to blood, and platelets stick to it directly and through von Willebrand factor.",
        "thromboxane A2": {
          "text": "A lipid signal made by platelet cyclooxygenase-1; it recruits platelets and constricts the vessel. Aspirin blocks its synthesis.",
          "links": [
            {
              "href": "wiki:Thromboxane A2"
            }
          ]
        },
        "vascular spasm": {
          "text": "Constriction of the injured vessel's smooth muscle, which briefly cuts blood flow to the wound.",
          "links": [
            {
              "href": "wiki:Vasoconstriction"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Hemostasis"
          }
        ]
      }
    },
    {
      "id": "coagulation",
      "name": "Coagulation",
      "color": "blue",
      "fact": "Tissue factor exposed at the wound binds factor VIIa to start thrombin generation; on activated platelets the intrinsic tenase and prothrombinase complexes amplify it into a burst, and thrombin turns fibrinogen into fibrin that factor XIIIa cross-links into a stable clot.",
      "terms": [
        "tissue factor",
        "fibrinogen",
        "prothrombin",
        "factor VIIa",
        "intrinsic tenase",
        "prothrombinase",
        "factor XIIIa"
      ],
      "seeds": [
        "tissue factor",
        "fibrinogen"
      ],
      "termInfo": {
        "factor VIIa": {
          "text": "The activated form of factor VII; bound to tissue factor, it activates factors X and IX and so starts coagulation.",
          "links": [
            {
              "href": "wiki:Factor VII"
            }
          ]
        },
        "factor XIIIa": {
          "text": "A transglutaminase activated by thrombin that cross-links fibrin strands, turning a fragile gel into a firm clot.",
          "links": [
            {
              "href": "wiki:Factor XIII"
            }
          ]
        },
        "fibrinogen": {
          "text": "A soluble plasma protein made by the liver; thrombin cleaves it into fibrin, the clot's structural mesh.",
          "links": [
            {
              "href": "wiki:Fibrinogen"
            }
          ]
        },
        "intrinsic tenase": {
          "text": "Factor VIIIa joined to factor IXa on an activated platelet; it activates factor X at a high rate.",
          "links": [
            {
              "href": "wiki:Tenase"
            }
          ]
        },
        "prothrombin": "Factor II, the inactive precursor that the prothrombinase complex converts into thrombin.",
        "prothrombinase": {
          "text": "Factor Va joined to factor Xa on an activated platelet; it converts prothrombin into thrombin.",
          "links": [
            {
              "href": "wiki:Prothrombinase"
            }
          ]
        },
        "tissue factor": {
          "text": "A membrane protein on cells beneath the endothelium; contact with blood after injury starts coagulation.",
          "links": [
            {
              "href": "wiki:Tissue factor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Coagulation"
          }
        ]
      }
    },
    {
      "id": "natural-anticoagulants",
      "name": "Natural anticoagulants",
      "color": "amber",
      "fact": "Plasma and endothelial inhibitors confine clotting to the wound: tissue factor pathway inhibitor shuts down initiation, antithrombin neutralizes thrombin and factor Xa, and thrombomodulin turns thrombin into an activator of protein C, which with protein S destroys factors Va and VIIIa.",
      "terms": [
        "antithrombin",
        "protein C",
        "protein S",
        "thrombomodulin",
        "tissue factor pathway inhibitor"
      ],
      "seeds": [
        "antithrombin",
        "protein C"
      ],
      "termInfo": {
        "antithrombin": {
          "text": "A plasma inhibitor of thrombin and factor Xa; heparan sulfate on the endothelium, and the drug heparin, greatly speed its action.",
          "links": [
            {
              "href": "wiki:Antithrombin"
            }
          ]
        },
        "protein C": {
          "text": "A vitamin K–dependent enzyme precursor; once activated by thrombin bound to thrombomodulin, it destroys factors Va and VIIIa.",
          "links": [
            {
              "href": "wiki:Protein C"
            }
          ]
        },
        "protein S": {
          "text": "A vitamin K–dependent cofactor that helps activated protein C inactivate factors Va and VIIIa.",
          "links": [
            {
              "href": "wiki:Protein S"
            }
          ]
        },
        "thrombomodulin": {
          "text": "An endothelial receptor that binds thrombin and redirects it from clotting fibrinogen to activating protein C.",
          "links": [
            {
              "href": "wiki:Thrombomodulin"
            }
          ]
        },
        "tissue factor pathway inhibitor": {
          "text": "A plasma and endothelial protein that, once a little factor Xa has formed, binds it and shuts down the tissue factor–factor VIIa complex.",
          "links": [
            {
              "href": "wiki:Tissue factor pathway inhibitor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Coagulation#Regulators",
            "label": "Regulators of coagulation"
          }
        ]
      }
    },
    {
      "id": "fibrinolysis",
      "name": "Fibrinolysis",
      "color": "magenta",
      "fact": "Tissue plasminogen activator, bound to fibrin, converts plasminogen into plasmin, which cuts fibrin into fragments such as D-dimer; plasminogen activator inhibitor-1 and α2-antiplasmin keep the process from dissolving clots too early.",
      "terms": [
        "plasmin",
        "tissue plasminogen activator",
        "plasminogen",
        "plasminogen activator inhibitor-1",
        "α2-antiplasmin",
        "D-dimer"
      ],
      "seeds": [
        "plasmin",
        "tissue plasminogen activator"
      ],
      "termInfo": {
        "D-dimer": {
          "text": "A breakdown fragment of cross-linked fibrin; its presence in blood shows that a clot has formed and is being dissolved.",
          "links": [
            {
              "href": "wiki:D-dimer"
            }
          ]
        },
        "plasmin": {
          "text": "The enzyme that cuts fibrin into soluble fragments, dissolving the clot.",
          "links": [
            {
              "href": "wiki:Plasmin"
            }
          ]
        },
        "plasminogen": "The inactive plasma precursor of plasmin; it binds to fibrin and is incorporated into the clot as it forms.",
        "plasminogen activator inhibitor-1": {
          "text": "The main inhibitor of tissue plasminogen activator, made by endothelium and stored in platelets.",
          "links": [
            {
              "href": "wiki:Plasminogen activator inhibitor-1"
            }
          ]
        },
        "tissue plasminogen activator": {
          "text": "An enzyme released by endothelial cells that converts plasminogen into plasmin, working efficiently only when bound to fibrin.",
          "links": [
            {
              "href": "wiki:Tissue-type plasminogen activator"
            }
          ]
        },
        "α2-antiplasmin": {
          "text": "A plasma inhibitor that rapidly inactivates free plasmin; factor XIIIa cross-links it into the clot.",
          "links": [
            {
              "href": "wiki:Alpha 2-antiplasmin"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Fibrinolysis"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "von-willebrand-factor",
      "term": "von Willebrand factor",
      "clusters": [
        0,
        1
      ],
      "fact": "In fast arterial flow, von Willebrand factor tethers platelets to exposed collagen through glycoprotein Ib; in plasma it also carries factor VIII and shields it from clearance, so a lack of it weakens both the platelet plug and the intrinsic tenase.",
      "info": {
        "text": "A large plasma protein made by endothelial cells and megakaryocytes that serves as both an adhesive for platelets and a carrier for factor VIII.",
        "links": [
          {
            "href": "wiki:Von Willebrand factor"
          }
        ]
      },
      "idealTerms": [
        "glycoprotein Ib",
        "intrinsic tenase"
      ]
    },
    {
      "id": "thrombin",
      "term": "thrombin",
      "clusters": [
        1,
        0
      ],
      "fact": "Prothrombinase converts prothrombin into thrombin, which besides cleaving fibrinogen is the most potent platelet activator, acting through protease-activated receptors to draw more platelets into the plug.",
      "info": {
        "text": "The central enzyme of hemostasis, which clots fibrinogen, activates platelets, and amplifies its own production.",
        "links": [
          {
            "href": "wiki:Thrombin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "prothrombinase",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "phosphatidylserine",
      "term": "phosphatidylserine",
      "clusters": [
        0,
        1
      ],
      "fact": "Activated platelets move phosphatidylserine to the outer face of their membranes, where calcium anchors the intrinsic tenase and prothrombinase complexes and speeds thrombin generation by orders of magnitude.",
      "info": {
        "text": "A membrane phospholipid normally kept on the inner face of the cell membrane; exposed on activated platelets, it provides the surface on which clotting factors assemble.",
        "links": [
          {
            "href": "wiki:Phosphatidylserine"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "prothrombinase"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "vitamin-k",
      "term": "vitamin K",
      "clusters": [
        1,
        2
      ],
      "fact": "The liver uses vitamin K to modify prothrombin, factors VII, IX, and X, and proteins C and S so they can bind calcium on cell membranes; warfarin blocks vitamin K recycling, and because protein C falls faster than most clotting factors, starting warfarin can briefly favor clotting.",
      "info": {
        "text": "A fat-soluble vitamin required to activate both clotting factors and the anticoagulant proteins C and S.",
        "links": [
          {
            "href": "wiki:Vitamin K"
          }
        ]
      },
      "idealTerms": [
        "prothrombin",
        "protein C"
      ]
    },
    {
      "id": "fibrin",
      "term": "fibrin",
      "clusters": [
        1,
        3
      ],
      "fact": "Thrombin cleaves fibrinogen into fibrin, which polymerizes into the clot's mesh; that same fibrin binds tissue plasminogen activator and plasminogen together, so the clot carries the means of its own removal.",
      "info": {
        "text": "The insoluble protein strands that form the structural mesh of a blood clot.",
        "links": [
          {
            "href": "wiki:Fibrin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "fibrinogen",
        "tissue plasminogen activator"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "vascular-endothelium",
      "term": "vascular endothelium",
      "clusters": [
        2,
        3
      ],
      "fact": "Healthy endothelium displays thrombomodulin and the heparan sulfate that arms antithrombin, and it secretes tissue plasminogen activator, so the vessel lining both restrains clotting and supplies the trigger for clot removal.",
      "info": {
        "text": "The single layer of cells lining blood vessels; intact, it also releases prostacyclin and nitric oxide that keep platelets from activating.",
        "links": [
          {
            "href": "wiki:Endothelium"
          }
        ]
      },
      "idealTerms": [
        "thrombomodulin",
        "tissue plasminogen activator"
      ]
    }
  ],
  "lenses": [
    {
      "id": "inactive-precursors",
      "prompt": "Which terms name enzymes that circulate in inactive form?",
      "explanation": "Keeping proteases inactive until a wound calls for them is what lets hemostasis switch on locally and fast. Fibrinogen also circulates as a precursor, but fibrin is a structural protein rather than an enzyme. Factor VIIa and factor XIIIa carry the 'a' because they name the already activated enzymes.",
      "targets": [
        "prothrombin",
        "plasminogen",
        "protein C"
      ],
      "reasons": {
        "plasminogen": "Cleaved by tissue plasminogen activator to become plasmin.",
        "protein C": "Cleaved by thrombin bound to thrombomodulin to become activated protein C.",
        "prothrombin": "Cleaved by prothrombinase to become thrombin."
      }
    },
    {
      "id": "platelet-recruiters",
      "prompt": "Which signals does an activated platelet release to recruit more platelets?",
      "explanation": "These two signals make the plug self-amplifying, which is why the two most common antiplatelet drugs target them: aspirin blocks thromboxane A2 synthesis, and clopidogrel blocks the ADP receptor. Von Willebrand factor is an adhesive anchor, and thrombin is made by coagulation rather than released by platelets.",
      "targets": [
        "ADP",
        "thromboxane A2"
      ],
      "reasons": {
        "ADP": "Released from platelet granules; it activates passing platelets through the P2Y12 receptor.",
        "thromboxane A2": "Synthesized by platelet cyclooxygenase-1; it activates nearby platelets and also constricts the vessel."
      }
    },
    {
      "id": "thrombin-binders",
      "prompt": "Which proteins bind thrombin itself to limit clotting?",
      "explanation": "The other inhibitors work at different points. Tissue factor pathway inhibitor shuts down initiation by binding factor Xa and the tissue factor–factor VIIa complex, while proteins C and S destroy the cofactors Va and VIIIa.",
      "targets": [
        "antithrombin",
        "thrombomodulin"
      ],
      "reasons": {
        "antithrombin": "It binds thrombin and inactivates it, a reaction heparan sulfate greatly accelerates.",
        "thrombomodulin": "It binds thrombin on intact endothelium and redirects it from clotting fibrinogen to activating protein C."
      }
    },
    {
      "id": "hemophilia",
      "prompt": "Which enzyme complex loses a component in hemophilia?",
      "explanation": "Tissue factor and factor VIIa still make a little thrombin, but without the intrinsic tenase the platelet surface cannot produce the thrombin burst, so bleeding is severe and often delayed. Von Willebrand disease can lower factor VIII indirectly, by removing its carrier.",
      "targets": [
        "intrinsic tenase"
      ],
      "reasons": {
        "intrinsic tenase": "Hemophilia A lacks factor VIII and hemophilia B lacks factor IX, the two partners in this complex."
      }
    },
    {
      "id": "clot-protectors",
      "prompt": "Which proteins act directly to slow a clot's dissolution?",
      "explanation": "A clot has to last until the vessel heals, so its removal is braked at the activator, at the enzyme, and in the fibrin itself. Thrombomodulin also slows fibrinolysis, but only indirectly, by helping thrombin activate a separate fibrinolysis inhibitor.",
      "targets": [
        "plasminogen activator inhibitor-1",
        "α2-antiplasmin",
        "factor XIIIa"
      ],
      "reasons": {
        "factor XIIIa": "Its cross-links make fibrin harder to cut, and it fixes α2-antiplasmin into the clot.",
        "plasminogen activator inhibitor-1": "It blocks tissue plasminogen activator, so less plasmin is made.",
        "α2-antiplasmin": "It inactivates plasmin itself."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body stops bleeding",
    "summary": "How a platelet plug and a fibrin clot seal an injured vessel, and how inhibitors and fibrinolysis keep the response local and temporary.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "Hemostasis is the set of responses that stop blood loss from a damaged vessel. It has to seal a wound within minutes, yet stay confined so tightly that clotting does not spread through the circulation and block healthy vessels. The aim of this lesson is to let you follow one injury from the first seal to the clot's eventual removal, and to see which molecules start each step, which amplify it, and which hold it in check.\r\n\r\nPhysiologists divide the process into four overlapping parts. **Primary hemostasis** builds a loose plug of platelets. **Coagulation**, sometimes called secondary hemostasis, generates thrombin and reinforces the plug with fibrin. **Natural anticoagulants** keep that reaction from spreading beyond the wound. **Fibrinolysis** dissolves the clot once the vessel has repaired itself. Healthy hemostasis is a balance among all four: too little activity leads to bleeding, and too much leads to thrombosis.\r\n\r\n## Primary hemostasis: the platelet plug\r\n\r\nThe first response is **vascular spasm**, a constriction of the injured vessel's smooth muscle that briefly reduces blood flow to the site. Damage also exposes **subendothelial collagen**, the connective tissue beneath the vessel lining, which circulating blood normally never touches.\r\n\r\nPlatelets stick to that collagen in two ways. Some bind it directly. In fast-flowing arterial blood, though, adhesion depends on **von Willebrand factor**, a large plasma protein that unrolls on exposed collagen and catches platelets through their **glycoprotein Ib** receptors. Von Willebrand factor has a second job: it carries clotting factor VIII through the plasma and protects it from rapid clearance.\r\n\r\nAdhesion activates the platelet. It changes shape and releases **ADP** and **thromboxane A2**, two signals that activate passing platelets and recruit them to the site; thromboxane A2 also constricts the vessel. Aspirin works by blocking thromboxane A2 synthesis, and drugs such as clopidogrel block the platelet's ADP receptor. Activation also switches on **glycoprotein IIb/IIIa**, the most abundant receptor on the platelet surface. In its active form it binds fibrinogen, and because each fibrinogen molecule can hold two platelets, the growing mass aggregates into a plug. That plug can seal a small injury by itself, but it is loose and can wash away.\r\n\r\n## Coagulation: thrombin and fibrin\r\n\r\nCoagulation reinforces the plug. It begins with **tissue factor**, a membrane protein on cells beneath the endothelium. Once injury exposes it to blood, tissue factor binds **factor VIIa**, and the pair activates factors X and IX. This initiation step makes only a small amount of thrombin.\r\n\r\n**Thrombin** is the central enzyme of hemostasis. It is made from an inactive precursor, **prothrombin**. The first trace of thrombin strongly activates platelets, acting through protease-activated receptors on their surface, and it also activates factors V, VIII, and XI. Activated platelets in turn move **phosphatidylserine**, a phospholipid normally kept on the inner face of the membrane, to their outer surface. With calcium as a bridge, clotting factors assemble on that surface into two enzyme complexes. The **intrinsic tenase** complex, factor VIIIa joined to factor IXa, activates factor X; the **prothrombinase** complex, factor Va joined to factor Xa, converts prothrombin into thrombin. Assembled on the platelet membrane, these complexes work orders of magnitude faster than their enzymes alone, and the result is a burst of thrombin.\r\n\r\nThis cell-based model, set out by Maureen Hoffman and Dougald Monroe, explains why platelets and clotting factors depend on each other. It also explains why people with hemophilia A, who lack factor VIII, or hemophilia B, who lack factor IX, bleed severely even though tissue factor and factor VIIa still work: the initial trace of thrombin forms, but the burst on the platelet surface cannot follow.\r\n\r\nThrombin then cleaves **fibrinogen**, a soluble plasma protein, into **fibrin**, whose strands polymerize into a mesh around the platelets. **Factor XIIIa**, also activated by thrombin, cross-links neighboring fibrin strands and turns a fragile gel into a firm, stable clot.\r\n\r\nSeveral of these proteins share a requirement. The liver uses **vitamin K** to modify prothrombin and factors VII, IX, and X so that they can bind calcium and cell membranes. The anticoagulant drug warfarin works by blocking the recycling of vitamin K.\r\n\r\n## Natural anticoagulants: keeping the clot local\r\n\r\nEvery step that amplifies clotting is matched by an inhibitor. **Tissue factor pathway inhibitor** shuts down the tissue factor–factor VIIa complex once a little factor Xa has formed, so initiation stays brief. **Antithrombin**, a plasma protein, neutralizes thrombin and factor Xa; heparin-like molecules on the endothelium speed its action enormously, and the drug heparin works the same way.\r\n\r\nOn intact endothelium, **thrombomodulin** binds any thrombin that escapes the wound and changes what it does: bound thrombin stops clotting fibrinogen and instead activates **protein C**. Activated protein C, helped by its cofactor **protein S**, destroys factors Va and VIIIa and so dismantles the prothrombinase and intrinsic tenase complexes. Proteins C and S also depend on vitamin K. Protein C levels fall faster than those of most clotting factors when warfarin is started, which is why the drug can briefly favor clotting at the beginning of treatment.\r\n\r\nThe **vascular endothelium** holds this system together. Healthy endothelium presents thrombomodulin and heparan sulfate, releases prostacyclin and nitric oxide that keep platelets from activating, and secretes the enzyme that starts clot removal.\r\n\r\n## Fibrinolysis: removing the clot\r\n\r\nA clot is temporary scaffolding. As the vessel heals, endothelial cells release **tissue plasminogen activator** (tPA). It works efficiently only when it and its substrate, **plasminogen**, are both bound to fibrin, so the clot itself concentrates the means of its own removal. Tissue plasminogen activator converts plasminogen into **plasmin**, an enzyme that cuts fibrin into soluble fragments. Because factor XIIIa has cross-linked the fibrin, some fragments keep two linked pieces; these **D-dimer** fragments circulate as a sign that a clot has formed and is being broken down, which is why a D-dimer blood test can help rule out a clot in the legs or lungs.\r\n\r\nFibrinolysis has its own brakes. **Plasminogen activator inhibitor-1** blocks tissue plasminogen activator, and **α2-antiplasmin** inactivates plasmin. Factor XIIIa cross-links α2-antiplasmin into the clot, protecting the fibrin while the wound still needs it.\r\n\r\n## Further reading\r\n\r\nThe standard textbook account is chapter 37, \"Hemostasis and Blood Coagulation,\" in John E. Hall and Michael E. Hall, *Guyton and Hall Textbook of Medical Physiology*. Maureen Hoffman and Dougald M. Monroe, \"A Cell-Based Model of Hemostasis\" (2001), sets out the modern account of how platelets and clotting factors cooperate."
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
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "hemostasis",
      "puzzleRevision": "fnv1a32:4ba7fa43",
      "board": {
        "width": 1040,
        "height": 670
      },
      "nodes": {
        "term:vascular spasm": {
          "x": 563.64,
          "y": 528.69,
          "pinned": false
        },
        "term:subendothelial collagen": {
          "x": 754.28,
          "y": 459.18,
          "pinned": false
        },
        "term:glycoprotein Ib": {
          "x": 490.43,
          "y": 647,
          "pinned": false
        },
        "term:ADP": {
          "x": 662.6,
          "y": 551.06,
          "pinned": false
        },
        "term:thromboxane A2": {
          "x": 630.46,
          "y": 647,
          "pinned": false
        },
        "term:glycoprotein IIb/IIIa": {
          "x": 589.01,
          "y": 372.55,
          "pinned": false
        },
        "term:tissue factor": {
          "x": 157.83,
          "y": 407.23,
          "pinned": false
        },
        "term:fibrinogen": {
          "x": 169.06,
          "y": 284.68,
          "pinned": false
        },
        "term:prothrombin": {
          "x": 265.23,
          "y": 346.14,
          "pinned": false
        },
        "term:factor VIIa": {
          "x": 56.65,
          "y": 477.99,
          "pinned": false
        },
        "term:intrinsic tenase": {
          "x": 159.29,
          "y": 562.47,
          "pinned": false
        },
        "term:prothrombinase": {
          "x": 272.07,
          "y": 475.38,
          "pinned": false
        },
        "term:factor XIIIa": {
          "x": 59.8,
          "y": 327.03,
          "pinned": false
        },
        "term:antithrombin": {
          "x": 686.97,
          "y": 136.57,
          "pinned": false
        },
        "term:protein C": {
          "x": 654.15,
          "y": 245.86,
          "pinned": false
        },
        "term:protein S": {
          "x": 854.57,
          "y": 81.97,
          "pinned": false
        },
        "term:thrombomodulin": {
          "x": 749.65,
          "y": 23,
          "pinned": false
        },
        "term:tissue factor pathway inhibitor": {
          "x": 827.95,
          "y": 253.91,
          "pinned": false
        },
        "term:plasmin": {
          "x": 326.94,
          "y": 135.72,
          "pinned": false
        },
        "term:tissue plasminogen activator": {
          "x": 476.88,
          "y": 186.16,
          "pinned": false
        },
        "term:plasminogen": {
          "x": 281.42,
          "y": 229.98,
          "pinned": false
        },
        "term:plasminogen activator inhibitor-1": {
          "x": 159.46,
          "y": 88.76,
          "pinned": false
        },
        "term:α2-antiplasmin": {
          "x": 344.11,
          "y": 23,
          "pinned": false
        },
        "term:D-dimer": {
          "x": 458.08,
          "y": 29.03,
          "pinned": false
        },
        "term:von Willebrand factor": {
          "x": 302.62,
          "y": 643.31,
          "pinned": false
        },
        "term:thrombin": {
          "x": 359.91,
          "y": 397.67,
          "pinned": false
        },
        "term:phosphatidylserine": {
          "x": 415.49,
          "y": 515.07,
          "pinned": false
        },
        "term:vitamin K": {
          "x": 448.62,
          "y": 348.24,
          "pinned": false
        },
        "term:fibrin": {
          "x": 359.93,
          "y": 294.38,
          "pinned": false
        },
        "term:vascular endothelium": {
          "x": 590.99,
          "y": 23,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5575.01,
        "score": 5575.013725558743
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-09T20:05:40.595Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "hemostasis",
      "puzzleRevision": "fnv1a32:4ba7fa43",
      "board": {
        "width": 1040,
        "height": 670
      },
      "nodes": {
        "term:vascular spasm": {
          "x": 751.59,
          "y": 115.95
        },
        "term:subendothelial collagen": {
          "x": 308.14,
          "y": 120
        },
        "term:glycoprotein Ib": {
          "x": 445.19,
          "y": 22
        },
        "term:ADP": {
          "x": 331.12,
          "y": 37.98
        },
        "term:thromboxane A2": {
          "x": 393.65,
          "y": 223.77
        },
        "term:glycoprotein IIb/IIIa": {
          "x": 615.17,
          "y": 67
        },
        "term:tissue factor": {
          "x": 979.05,
          "y": 108.51
        },
        "term:fibrinogen": {
          "x": 554.5,
          "y": 312.67
        },
        "term:prothrombin": {
          "x": 825.49,
          "y": 404.08
        },
        "term:factor VIIa": {
          "x": 982.35,
          "y": 459.27
        },
        "term:intrinsic tenase": {
          "x": 847.54,
          "y": 215.36
        },
        "term:prothrombinase": {
          "x": 782.81,
          "y": 288.56
        },
        "term:factor XIIIa": {
          "x": 908.26,
          "y": 153.8
        },
        "term:antithrombin": {
          "x": 651.8,
          "y": 391.41
        },
        "term:protein C": {
          "x": 718.74,
          "y": 555.62
        },
        "term:protein S": {
          "x": 495.4,
          "y": 399.04
        },
        "term:thrombomodulin": {
          "x": 513.17,
          "y": 577.15
        },
        "term:tissue factor pathway inhibitor": {
          "x": 644.97,
          "y": 632.02
        },
        "term:plasmin": {
          "x": 114.53,
          "y": 380.04
        },
        "term:tissue plasminogen activator": {
          "x": 207.98,
          "y": 298.88
        },
        "term:plasminogen": {
          "x": 422.19,
          "y": 642.01
        },
        "term:plasminogen activator inhibitor-1": {
          "x": 123.95,
          "y": 519.23
        },
        "term:α2-antiplasmin": {
          "x": 311.42,
          "y": 600.9
        },
        "term:D-dimer": {
          "x": 204.31,
          "y": 636.01
        },
        "term:von Willebrand factor": {
          "x": 836.55,
          "y": 22
        },
        "term:thrombin": {
          "x": 666.57,
          "y": 172.79
        },
        "term:phosphatidylserine": {
          "x": 578.05,
          "y": 243.1
        },
        "term:vitamin K": {
          "x": 804.78,
          "y": 486.16
        },
        "term:fibrin": {
          "x": 369.06,
          "y": 378.89
        },
        "term:vascular endothelium": {
          "x": 426.2,
          "y": 503.83
        },
        "cluster:0": {
          "x": 492.38,
          "y": 151.35
        },
        "cluster:1": {
          "x": 985.35,
          "y": 380.95
        },
        "cluster:2": {
          "x": 599.44,
          "y": 461.93
        },
        "cluster:3": {
          "x": 283.2,
          "y": 458.02
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-09T20:08:58.971Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "hemostasis",
      "puzzleRevision": "fnv1a32:4ba7fa43",
      "board": {
        "width": 1140,
        "height": 840
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 957.15,
          "y": 428,
          "pinned": false
        },
        "cluster:1": {
          "x": 570,
          "y": 640.66,
          "pinned": false
        },
        "cluster:2": {
          "x": 182.85,
          "y": 428,
          "pinned": false
        },
        "cluster:3": {
          "x": 570,
          "y": 215.34,
          "pinned": false
        }
      },
      "bridges": {
        "term:von Willebrand factor": {
          "x": 711.53,
          "y": 408.68,
          "pinned": false
        },
        "term:thrombin": {
          "x": 763.58,
          "y": 482.33,
          "pinned": false
        },
        "term:phosphatidylserine": {
          "x": 837.12,
          "y": 607.87,
          "pinned": false
        },
        "term:vitamin K": {
          "x": 348.42,
          "y": 534.33,
          "pinned": false
        },
        "term:fibrin": {
          "x": 570,
          "y": 428,
          "pinned": false
        },
        "term:vascular endothelium": {
          "x": 416.22,
          "y": 417.75,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "vascular spasm",
          "subendothelial collagen",
          "glycoprotein Ib",
          "ADP",
          "thromboxane A2",
          "glycoprotein IIb/IIIa"
        ],
        "cluster:1": [
          "tissue factor",
          "fibrinogen",
          "prothrombin",
          "factor VIIa",
          "intrinsic tenase",
          "prothrombinase",
          "factor XIIIa"
        ],
        "cluster:2": [
          "antithrombin",
          "protein C",
          "protein S",
          "thrombomodulin",
          "tissue factor pathway inhibitor"
        ],
        "cluster:3": [
          "plasmin",
          "tissue plasminogen activator",
          "plasminogen",
          "plasminogen activator inhibitor-1",
          "α2-antiplasmin",
          "D-dimer"
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
        "totalLength": 1768.5858266774096
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T20:10:37.208Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "author",
    "savedAt": "2026-10-09T20:09:37.153Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
