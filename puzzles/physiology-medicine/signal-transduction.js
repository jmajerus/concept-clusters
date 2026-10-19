// Generated from content/puzzles/signal-transduction.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "signal-transduction",
  "title": "Signal transduction",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "cellular-membrane"
  },
  "info": {
    "text": "Most signals never enter the cell. Surface receptors turn a binding event into G-protein switches, second messengers, and kinase cascades; hormones that do enter act on genes directly.",
    "links": [
      {
        "href": "wiki:Signal transduction"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 75 Introduction to Endocrinology",
        "author": "John E. Hall, Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021"
      },
      {
        "title": "Medical Physiology, 3rd ed., ch. 3 Signal Transduction",
        "author": "Walter F. Boron, Emile L. Boulpaep",
        "publisher": "Elsevier",
        "year": "2017"
      },
      {
        "title": "Anatomy and Physiology 2e, §17.2 Hormones",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones"
      },
      {
        "title": "Transduction of receptor signals by β-arrestins",
        "author": "Robert J. Lefkowitz, Sudha K. Shenoy",
        "publisher": "Science 308(5721)",
        "year": "2005",
        "pages": "512–517",
        "url": "https://pubmed.ncbi.nlm.nih.gov/15845844/"
      }
    ]
  },
  "clusters": [
    {
      "id": "g-protein-switch",
      "name": "G-protein switch",
      "color": "teal",
      "fact": "A G protein–coupled receptor activates a heterotrimeric G protein by making its α subunit swap GDP for GTP. The α subunit and the freed βγ subunits then act on their effectors until the α subunit's own GTPase activity hydrolyzes the GTP and switches it off.",
      "terms": [
        "G protein–coupled receptor",
        "heterotrimeric G protein",
        "GTP–GDP exchange",
        "GTPase activity",
        "βγ subunits"
      ],
      "seeds": [
        "G protein–coupled receptor",
        "heterotrimeric G protein"
      ],
      "termInfo": {
        "G protein–coupled receptor": {
          "text": "A seven-pass membrane receptor that, once its ligand binds, activates a G protein inside the cell; the largest receptor family and a target of many drugs.",
          "links": [
            {
              "href": "wiki:G protein-coupled receptor"
            }
          ]
        },
        "GTPase activity": {
          "text": "The α subunit's built-in ability to hydrolyze its own GTP to GDP, a timer that ends each activation within seconds.",
          "links": [
            {
              "href": "wiki:GTPase"
            }
          ]
        },
        "GTP–GDP exchange": {
          "text": "The activating step: the ligand-bound receptor makes the α subunit release GDP and bind GTP, so it separates from βγ.",
          "links": [
            {
              "href": "wiki:Guanine nucleotide exchange factor"
            }
          ]
        },
        "heterotrimeric G protein": {
          "text": "A three-part switch (α, β, and γ subunits) on the inner face of the membrane; the nucleotide bound to α decides whether it is on or off.",
          "links": [
            {
              "href": "wiki:Heterotrimeric G protein"
            }
          ]
        },
        "βγ subunits": {
          "text": "The β and γ subunits, which stay together and signal on their own once released; in the heart they open potassium channels that slow the pacemaker.",
          "links": [
            {
              "href": "wiki:G beta-gamma complex"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:G protein"
          }
        ]
      }
    },
    {
      "id": "camp-pathway",
      "name": "The cAMP pathway",
      "color": "blue",
      "fact": "Adenylyl cyclase converts ATP into cyclic AMP, which activates protein kinase A to phosphorylate the cell's target proteins. Phosphodiesterase breaks cAMP down, setting how long the signal lasts.",
      "terms": [
        "adenylyl cyclase",
        "cyclic AMP",
        "protein kinase A",
        "phosphodiesterase"
      ],
      "seeds": [
        "adenylyl cyclase",
        "cyclic AMP"
      ],
      "termInfo": {
        "adenylyl cyclase": {
          "text": "The membrane enzyme that makes cAMP from ATP; Gs stimulates it and Gi inhibits it.",
          "links": [
            {
              "href": "wiki:Adenylyl cyclase"
            }
          ]
        },
        "cyclic AMP": {
          "text": "Cyclic adenosine monophosphate (cAMP), the second messenger adenylyl cyclase makes; it activates protein kinase A.",
          "links": [
            {
              "href": "wiki:Cyclic adenosine monophosphate"
            }
          ]
        },
        "phosphodiesterase": {
          "text": "The enzyme that hydrolyzes cAMP (and, in other forms, cGMP), ending the signal; caffeine and theophylline inhibit it.",
          "links": [
            {
              "href": "wiki:Phosphodiesterase"
            }
          ]
        },
        "protein kinase A": {
          "text": "The cAMP-dependent kinase: cAMP frees its catalytic subunits, which phosphorylate enzymes, channels, and transcription factors. Protein phosphatases later remove those phosphates.",
          "links": [
            {
              "href": "wiki:Protein kinase A"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cyclic adenosine monophosphate"
          }
        ]
      }
    },
    {
      "id": "phospholipid-calcium-pathway",
      "name": "The phospholipid–calcium pathway",
      "color": "amber",
      "fact": "Phospholipase C splits the membrane lipid PIP₂ into two messengers. IP₃ diffuses to the endoplasmic reticulum and releases stored calcium, which binds calmodulin; diacylglycerol stays in the membrane and, with that calcium, activates protein kinase C.",
      "terms": [
        "phospholipase C",
        "IP₃",
        "diacylglycerol",
        "protein kinase C",
        "calmodulin"
      ],
      "seeds": [
        "phospholipase C",
        "IP₃"
      ],
      "termInfo": {
        "IP₃": {
          "text": "Inositol trisphosphate, a water-soluble messenger that opens IP₃-receptor calcium channels in the endoplasmic reticulum.",
          "links": [
            {
              "href": "wiki:Inositol trisphosphate"
            }
          ]
        },
        "calmodulin": {
          "text": "A calcium-binding protein that, loaded with four Ca²⁺, activates kinases and other enzymes: the way many cells read a calcium rise.",
          "links": [
            {
              "href": "wiki:Calmodulin"
            }
          ]
        },
        "diacylglycerol": {
          "text": "DAG, the lipid half of PIP₂, which stays in the membrane and recruits protein kinase C.",
          "links": [
            {
              "href": "wiki:Diglyceride"
            }
          ]
        },
        "phospholipase C": {
          "text": "The membrane enzyme, activated by Gq, that cleaves PIP₂ into IP₃ and diacylglycerol.",
          "links": [
            {
              "href": "wiki:Phospholipase C"
            }
          ]
        },
        "protein kinase C": {
          "text": "A kinase activated by diacylglycerol and calcium together; it moves to the membrane and phosphorylates targets there.",
          "links": [
            {
              "href": "wiki:Protein kinase C"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Phosphatidylinositol 4,5-bisphosphate"
          }
        ]
      }
    },
    {
      "id": "enzyme-linked-receptors",
      "name": "Enzyme-linked receptors",
      "color": "magenta",
      "fact": "Some receptors are enzymes or recruit them. A receptor tyrosine kinase pairs up when its ligand binds and each half phosphorylates the other (autophosphorylation), creating docking sites that launch the MAP kinase cascade. Cytokine-type receptors borrow associated JAK kinases instead, which activate STAT proteins.",
      "terms": [
        "receptor tyrosine kinase",
        "autophosphorylation",
        "MAP kinase cascade",
        "JAK–STAT pathway"
      ],
      "seeds": [
        "receptor tyrosine kinase",
        "autophosphorylation"
      ],
      "termInfo": {
        "JAK–STAT pathway": {
          "text": "The route for receptors with no enzyme of their own (leptin, growth hormone, many cytokines): associated JAK kinases phosphorylate STAT proteins, which move to the nucleus.",
          "links": [
            {
              "href": "wiki:JAK-STAT signaling pathway"
            }
          ]
        },
        "MAP kinase cascade": {
          "text": "A chain of three kinases, each phosphorylating the next, that carries growth signals from Ras to transcription factors in the nucleus.",
          "links": [
            {
              "href": "wiki:MAPK/ERK pathway"
            }
          ]
        },
        "autophosphorylation": {
          "text": "The activating step for a tyrosine-kinase receptor: each half phosphorylates tyrosines on the other, which then serve as docking sites for signaling proteins.",
          "links": [
            {
              "href": "wiki:Autophosphorylation"
            }
          ]
        },
        "receptor tyrosine kinase": {
          "text": "A receptor whose intracellular domain is a tyrosine kinase, used by insulin and most growth factors. Guanylyl cyclase receptors, such as the receptor for atrial natriuretic peptide, are another enzyme-linked class that makes cGMP.",
          "links": [
            {
              "href": "wiki:Receptor tyrosine kinase"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Enzyme-linked receptor"
          }
        ]
      }
    },
    {
      "id": "intracellular-receptors",
      "name": "Intracellular receptors",
      "color": "olive",
      "fact": "Steroid and thyroid hormones enter their target cells and bind receptors inside. The hormone–receptor complex binds a hormone response element in DNA and changes transcription of nearby genes, so effects take hours to appear and outlast the hormone.",
      "terms": [
        "intracellular receptor",
        "hormone response element",
        "steroid hormone",
        "thyroid hormone"
      ],
      "seeds": [
        "intracellular receptor",
        "hormone response element"
      ],
      "termInfo": {
        "hormone response element": {
          "text": "A short DNA sequence near a gene where a specific hormone–receptor complex binds to raise or lower that gene's transcription.",
          "links": [
            {
              "href": "wiki:Response element"
            }
          ]
        },
        "intracellular receptor": {
          "text": "A receptor in the cytoplasm or nucleus (also called a nuclear receptor) that binds a hormone inside the cell and then acts on DNA directly.",
          "links": [
            {
              "href": "wiki:Nuclear receptor"
            }
          ]
        },
        "steroid hormone": {
          "text": "A cholesterol-derived hormone, such as cortisol, aldosterone, or estradiol, lipid-soluble enough to diffuse through the plasma membrane.",
          "links": [
            {
              "href": "wiki:Steroid hormone"
            }
          ]
        },
        "thyroid hormone": {
          "text": "T₃ and T₄; carried into cells by membrane transporters, T₃ binds receptors already sitting on DNA in the nucleus.",
          "links": [
            {
              "href": "wiki:Thyroid hormones"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones"
          }
        ]
      }
    },
    {
      "id": "adjusting-receptor-sensitivity",
      "name": "Adjusting receptor sensitivity",
      "color": "brown",
      "fact": "Sustained stimulation makes cells less responsive: within minutes active receptors are uncoupled from their G proteins (desensitization), and over hours to days they are removed from the surface (downregulation). Too little stimulation does the reverse and adds receptors (upregulation).",
      "terms": [
        "receptor desensitization",
        "receptor downregulation",
        "receptor upregulation"
      ],
      "seeds": [
        "receptor desensitization",
        "receptor downregulation"
      ],
      "termInfo": {
        "receptor desensitization": {
          "text": "A fast, reversible loss of response: kinases phosphorylate the active receptor, and β-arrestin then blocks its access to G proteins.",
          "links": [
            {
              "href": "wiki:Tachyphylaxis"
            }
          ]
        },
        "receptor downregulation": {
          "text": "A fall in receptor number, as receptors are internalized and degraded or made more slowly, after prolonged high exposure to a signal.",
          "links": [
            {
              "href": "wiki:Downregulation and upregulation"
            }
          ]
        },
        "receptor upregulation": "A rise in receptor number after prolonged low exposure, as when a tissue that loses its nerve supply becomes supersensitive to its transmitter."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Downregulation and upregulation"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "gs",
      "term": "Gs",
      "clusters": [
        0,
        1
      ],
      "fact": "Gs is the stimulatory G protein: its GTP-bound α subunit switches adenylyl cyclase on, so receptors such as the β-adrenergic, glucagon, and ADH (V₂) receptors raise cAMP.",
      "info": {
        "text": "The s stands for stimulatory.",
        "links": [
          {
            "href": "wiki:Gs alpha subunit"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "heterotrimeric G protein",
        "adenylyl cyclase"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "gi",
      "term": "Gi",
      "clusters": [
        0,
        1
      ],
      "fact": "Gi is the inhibitory G protein: its α subunit switches adenylyl cyclase off and lowers cAMP, while its released βγ subunits act separately, as at the heart's M₂ muscarinic receptors. α₂-adrenergic receptors also signal through Gi.",
      "info": {
        "text": "The i stands for inhibitory.",
        "links": [
          {
            "href": "wiki:Gi alpha subunit"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "βγ subunits",
        "adenylyl cyclase"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "gq",
      "term": "Gq",
      "clusters": [
        0,
        2
      ],
      "fact": "Gq couples receptors such as α₁-adrenergic, M₃ muscarinic, and the gastrin receptor to phospholipase C, so their signal arrives as IP₃, calcium, and diacylglycerol.",
      "info": {
        "text": "Gq is the usual route by which a receptor raises intracellular calcium.",
        "links": [
          {
            "href": "wiki:Gq alpha subunit"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "heterotrimeric G protein",
        "phospholipase C"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "second-messenger",
      "term": "second messenger",
      "clusters": [
        1,
        2
      ],
      "fact": "cAMP, IP₃, diacylglycerol, and calcium are second messengers: small molecules made or released inside the cell after a receptor activates. Each reaches many target enzymes, which multiplies the signal, and different receptors can converge on the same messengers.",
      "info": {
        "text": "The hormone or transmitter is the first messenger; the second carries its signal through the cell.",
        "links": [
          {
            "href": "wiki:Second messenger system"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "cyclic AMP",
        "IP₃"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "ras",
      "term": "Ras",
      "clusters": [
        0,
        3
      ],
      "fact": "Ras is a small, single-subunit G protein that an activated tyrosine-kinase receptor turns on by GTP–GDP exchange. Like the α subunit of a heterotrimeric G protein, it stays active only until its own GTPase activity hydrolyzes the GTP; mutations that block that hydrolysis lock growth signaling on in many cancers.",
      "info": {
        "text": "The same GTP timer, used by a different receptor class.",
        "links": [
          {
            "href": "wiki:Ras GTPase"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "GTPase activity",
        "MAP kinase cascade"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "transcription-factor",
      "term": "transcription factor",
      "clusters": [
        4,
        3
      ],
      "fact": "Both routes end at gene control: an intracellular receptor is itself a transcription factor, while the MAP kinase cascade and the JAK–STAT pathway activate transcription factors (STATs are one) that carry a surface signal into the nucleus.",
      "info": {
        "text": "Protein kinase A reaches genes the same way, by phosphorylating the transcription factor CREB.",
        "links": [
          {
            "href": "wiki:Transcription factor"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "intracellular receptor",
        "JAK–STAT pathway"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "beta-arrestin",
      "term": "β-arrestin",
      "clusters": [
        5,
        0
      ],
      "fact": "β-arrestin binds G protein–coupled receptors that kinases have phosphorylated after activation, blocking their access to G proteins and tagging them for removal from the membrane. It links fast desensitization to later downregulation.",
      "info": {
        "text": "Uncouples the receptor first, then pulls it into the cell.",
        "links": [
          {
            "href": "wiki:Arrestin"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "receptor desensitization",
        "G protein–coupled receptor"
      ],
      "direction": {
        "kind": "through",
        "from": 5,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "single-kinases",
      "prompt": "Which concepts name a single protein kinase?",
      "explanation": "Protein kinases A and C and the receptor tyrosine kinase each phosphorylate proteins themselves. The MAP kinase cascade is a chain of three kinases, the JAK–STAT pathway pairs a kinase with its substrate, and the cyclases and phospholipase C make messengers rather than phosphorylating anything.",
      "targets": [
        "protein kinase A",
        "protein kinase C",
        "receptor tyrosine kinase"
      ],
      "reasons": {
        "protein kinase A": "The kinase that cAMP activates.",
        "protein kinase C": "The kinase that diacylglycerol and calcium activate together.",
        "receptor tyrosine kinase": "A receptor whose own intracellular domain is a kinase."
      }
    },
    {
      "id": "gtp-switches",
      "prompt": "Which proteins are switched on by binding GTP?",
      "explanation": "Every G protein, large or small, is on while it holds GTP and off once it hydrolyzes it to GDP. Gi counts too: switching it on is what lets it inhibit. The βγ subunits signal after release but do not bind GTP, and GTPase activity is the timer, not a switch.",
      "targets": [
        "heterotrimeric G protein",
        "Gs",
        "Gi",
        "Gq",
        "Ras"
      ],
      "reasons": {
        "Gi": "Also switched on by GTP, even though its effect on adenylyl cyclase is inhibitory.",
        "Gq": "A heterotrimeric G protein, active while its α subunit holds GTP.",
        "Gs": "A heterotrimeric G protein, active while its α subunit holds GTP.",
        "Ras": "A small G protein that obeys the same GTP timer.",
        "heterotrimeric G protein": "Its α subunit is active while it holds GTP."
      }
    },
    {
      "id": "small-messengers",
      "prompt": "Which concepts are small messengers produced inside the cell after a receptor activates?",
      "explanation": "cAMP, IP₃, and diacylglycerol are second messengers; calcium released by IP₃ is another. Calmodulin and the kinases are proteins that read these messengers, not messengers themselves.",
      "targets": [
        "second messenger",
        "cyclic AMP",
        "IP₃",
        "diacylglycerol"
      ],
      "reasons": {
        "IP₃": "Cut from PIP₂ by phospholipase C; it diffuses to the endoplasmic reticulum.",
        "cyclic AMP": "Made by adenylyl cyclase.",
        "diacylglycerol": "The other product of PIP₂, staying in the membrane.",
        "second messenger": "The name for the whole class."
      }
    },
    {
      "id": "surface-receptors",
      "prompt": "Which receptor types sit in the plasma membrane?",
      "explanation": "Both bind water-soluble signals at the surface. Intracellular receptors wait in the cytoplasm or nucleus for hormones that can enter the cell.",
      "targets": [
        "G protein–coupled receptor",
        "receptor tyrosine kinase"
      ],
      "reasons": {
        "G protein–coupled receptor": "It crosses the membrane seven times and acts on G proteins inside.",
        "receptor tyrosine kinase": "Its ligand binds outside and its kinase works inside."
      }
    },
    {
      "id": "gtp-gdp",
      "prompt": "What happens to a G protein the moment its receptor binds a ligand?",
      "explanation": "The ligand-bound receptor acts as an exchange factor: the α subunit gives up GDP, takes up GTP, and separates from βγ, and both parts are now active.",
      "targets": [
        "GTP–GDP exchange"
      ],
      "reasons": {
        "GTP–GDP exchange": "The receptor makes the α subunit release GDP and bind GTP."
      }
    },
    {
      "id": "epinephrine-heart",
      "prompt": "Epinephrine binds β₁ receptors on heart muscle. Which specific molecules carry its signal from the G protein to the kinase?",
      "explanation": "The chain runs Gs → adenylyl cyclase → cAMP → protein kinase A, which phosphorylates calcium-handling proteins so the heart beats harder. Heterotrimeric G protein and second messenger are the general classes Gs and cAMP belong to.",
      "targets": [
        "Gs",
        "adenylyl cyclase",
        "cyclic AMP",
        "protein kinase A"
      ],
      "reasons": {
        "Gs": "β₁ receptors activate the stimulatory G protein.",
        "adenylyl cyclase": "Gs switches it on.",
        "cyclic AMP": "The messenger adenylyl cyclase makes.",
        "protein kinase A": "cAMP activates it; it phosphorylates calcium channels and other targets."
      }
    },
    {
      "id": "cholera-toxin",
      "prompt": "Cholera toxin modifies Gs so it cannot turn itself off. Which property does it disable?",
      "explanation": "With GTP hydrolysis blocked, Gs stimulates adenylyl cyclase without stopping. Intestinal cells fill with cAMP and secrete chloride and water: the diarrhea of cholera.",
      "targets": [
        "GTPase activity"
      ],
      "reasons": {
        "GTPase activity": "Without it, Gs keeps its GTP and stays on."
      }
    },
    {
      "id": "caffeine",
      "prompt": "Caffeine and theophylline make a cAMP signal last longer. Which enzyme do they inhibit?",
      "explanation": "Phosphodiesterase sets how long cAMP lasts. Inhibiting it prolongs whatever the receptor started, which is one reason theophylline relaxes airway smooth muscle.",
      "targets": [
        "phosphodiesterase"
      ],
      "reasons": {
        "phosphodiesterase": "It breaks cAMP down; blocking it lets cAMP accumulate."
      }
    },
    {
      "id": "alpha1-calcium",
      "prompt": "Norepinephrine at α₁ receptors raises calcium in vascular smooth muscle. Which specific molecules carry that signal from the G protein to the calcium sensor?",
      "explanation": "The chain runs Gq → phospholipase C → IP₃ → calcium → calmodulin. Diacylglycerol is made in the same step but branches off to protein kinase C rather than carrying the calcium signal.",
      "targets": [
        "Gq",
        "phospholipase C",
        "IP₃",
        "calmodulin"
      ],
      "reasons": {
        "Gq": "α₁ receptors couple to Gq.",
        "IP₃": "It releases calcium from the sarcoplasmic reticulum.",
        "calmodulin": "The protein that binds the released calcium.",
        "phospholipase C": "Gq switches it on."
      }
    },
    {
      "id": "membrane-arm",
      "prompt": "After phospholipase C splits PIP₂, which two concepts act together at the membrane?",
      "explanation": "IP₃ leaves for the endoplasmic reticulum; diacylglycerol stays behind and recruits protein kinase C, which also needs the calcium IP₃ releases.",
      "targets": [
        "diacylglycerol",
        "protein kinase C"
      ],
      "reasons": {
        "diacylglycerol": "The lipid product that stays in the membrane.",
        "protein kinase C": "It moves to the membrane to meet diacylglycerol."
      }
    },
    {
      "id": "insulin-growth",
      "prompt": "Insulin binds its receptor. Which concepts trace the growth-signaling route from that receptor to the nucleus?",
      "explanation": "Receptor tyrosine kinase → autophosphorylation → Ras → MAP kinase cascade → transcription factors. Insulin's metabolic effects run through a separate branch from the same docking sites; growth factors use this route as their main one.",
      "targets": [
        "receptor tyrosine kinase",
        "autophosphorylation",
        "Ras",
        "MAP kinase cascade",
        "transcription factor"
      ],
      "reasons": {
        "MAP kinase cascade": "Three kinases carrying the signal inward.",
        "Ras": "The small G protein switched on from those docking sites.",
        "autophosphorylation": "Its two halves phosphorylate each other, creating docking sites.",
        "receptor tyrosine kinase": "The insulin receptor is one.",
        "transcription factor": "The cascade's final targets in the nucleus."
      }
    },
    {
      "id": "no-own-enzyme",
      "prompt": "Leptin and growth hormone bind receptors that have no enzyme of their own. Which route do they use?",
      "explanation": "These receptors recruit JAK kinases, which phosphorylate STATs; the STATs travel to the nucleus as transcription factors.",
      "targets": [
        "JAK–STAT pathway"
      ],
      "reasons": {
        "JAK–STAT pathway": "Their receptors borrow associated JAK kinases, which activate STAT proteins."
      }
    },
    {
      "id": "cortisol-delay",
      "prompt": "Cortisol's effects on a cell take hours to appear. Which concepts does it act through on its way to changing gene expression?",
      "explanation": "The delay comes from making new proteins: the receptor must reach DNA, change transcription, and the new messenger RNA must be translated. Steroid hormone is what cortisol is, not a step it acts through.",
      "targets": [
        "intracellular receptor",
        "hormone response element",
        "transcription factor"
      ],
      "reasons": {
        "hormone response element": "The DNA sequence the hormone–receptor complex binds.",
        "intracellular receptor": "Cortisol binds it inside the cell.",
        "transcription factor": "What the hormone–receptor complex is: a protein that controls when genes are read."
      }
    },
    {
      "id": "inside-the-cell",
      "prompt": "Which hormone types act on receptors inside their target cells?",
      "explanation": "Both reach intracellular receptors, though by different routes: steroids diffuse across the membrane, while thyroid hormone needs membrane transporters.",
      "targets": [
        "steroid hormone",
        "thyroid hormone"
      ],
      "reasons": {
        "steroid hormone": "Lipid-soluble enough to diffuse through the membrane.",
        "thyroid hormone": "Carried in by transporters to receptors in the nucleus."
      }
    },
    {
      "id": "inhaler-tolerance",
      "prompt": "Repeated puffs of a β₂-agonist inhaler lose some effect within minutes. Which concepts describe that fast loss?",
      "explanation": "Kinases phosphorylate the active receptor and β-arrestin uncouples it from Gs within minutes. Downregulation, the loss of receptors themselves, takes hours to days.",
      "targets": [
        "receptor desensitization",
        "β-arrestin"
      ],
      "reasons": {
        "receptor desensitization": "The fast, reversible loss of response.",
        "β-arrestin": "It binds the phosphorylated receptor and blocks its G protein."
      }
    },
    {
      "id": "receptor-number",
      "prompt": "Which concepts name a change in the number of receptors a cell displays?",
      "explanation": "Desensitization leaves receptors in place but uncoupled; β-arrestin starts their removal, but the change in number itself is downregulation. Upregulation is the mirror image.",
      "targets": [
        "receptor downregulation",
        "receptor upregulation"
      ],
      "reasons": {
        "receptor downregulation": "Fewer receptors after prolonged high exposure.",
        "receptor upregulation": "More receptors after prolonged low exposure, as after denervation."
      }
    },
    {
      "id": "vagal-slowing",
      "prompt": "Acetylcholine at the heart's M₂ receptors opens potassium channels that slow the pacemaker. Which two concepts deliver that signal?",
      "explanation": "Gi's α subunit lowers cAMP, but the potassium current that slows the heart comes from its βγ subunits binding the channel directly, with no second messenger in between.",
      "targets": [
        "Gi",
        "βγ subunits"
      ],
      "reasons": {
        "Gi": "M₂ receptors couple to the inhibitory G protein.",
        "βγ subunits": "Released from Gi, they open the potassium channels directly."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "membranes-set-cell-conditions",
        "reason": "Start with the membrane itself: the transporters and ion gradients these signals act on."
      },
      {
        "id": "signals-and-regulation-in-the-body",
        "reason": "Step back to the survey of nervous, endocrine, and immune signals that these receptors receive.",
        "via": [
          "G protein–coupled receptor",
          "second messenger"
        ]
      },
      {
        "id": "gastric-acid-secretion",
        "reason": "See cAMP and calcium pathways converge in one cell: histamine, gastrin, and acetylcholine potentiating acid secretion.",
        "via": [
          "second messenger",
          "Gq"
        ]
      },
      {
        "id": "the-autonomic-nervous-system",
        "reason": "See the receptor subtypes behind sympathetic and parasympathetic effects, each coupled to Gs, Gi, or Gq.",
        "via": [
          "Gs",
          "Gi",
          "Gq"
        ]
      },
      {
        "id": "hypothalamic-pituitary-axes",
        "reason": "Follow thyroid hormone and cortisol from their control axes to the intracellular receptors they act on.",
        "via": [
          "thyroid hormone",
          "steroid hormone"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From receptor to response",
    "summary": "How surface receptors relay a signal through G proteins, second messengers, and kinases, and how hormones that enter the cell act on genes directly.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "A hormone or transmitter that cannot enter a cell has to deliver its message at the surface. Signal transduction is the chain of events that turns that binding into a change inside: an enzyme switched on, a channel opened, a gene read. The fastest receptors are themselves ion channels and belong with neurons and synapses. This lesson follows the slower routes, where a receptor hands the signal to a relay of proteins and small molecules.\r\n\r\n## The G-protein switch\r\n\r\nThe largest receptor family is the **G protein–coupled receptor**, a protein that crosses the membrane seven times. Inside, it acts on a **heterotrimeric G protein**, a switch built from α, β, and γ subunits. At rest the α subunit holds GDP. When a ligand binds, the receptor triggers **GTP–GDP exchange**: the α subunit releases GDP, binds GTP, and separates from the **βγ subunits**. Both parts now act on effector proteins. The switch has a built-in timer. The α subunit's own **GTPase activity** hydrolyzes the GTP back to GDP within seconds, and the subunits reassemble.\r\n\r\nThree families of α subunit decide where the signal goes. **Gs** stimulates adenylyl cyclase. **Gi** inhibits it, and its released βγ subunits open potassium channels in the heart, which is how acetylcholine at M₂ receptors slows the pacemaker. **Gq** activates phospholipase C.\r\n\r\n## Second messengers\r\n\r\nNeither enzyme carries the message far itself. Each makes a **second messenger**, a small molecule that spreads through the cell and reaches many targets. One receptor activates many G proteins, each enzyme makes many messenger molecules, and each kinase phosphorylates many proteins, so the signal is amplified at every step.\r\n\r\n**Adenylyl cyclase** converts ATP to **cyclic AMP** (cAMP), which activates **protein kinase A**. Protein kinase A phosphorylates enzymes, channels, and transcription factors. **Phosphodiesterase** breaks cAMP down and so sets how long the signal lasts; caffeine and theophylline inhibit it.\r\n\r\n**Phospholipase C** splits the membrane lipid PIP₂ into two messengers. **IP₃** diffuses to the endoplasmic reticulum and opens its calcium channels. The released calcium binds **calmodulin**, which activates kinases and other enzymes. **Diacylglycerol** stays in the membrane, where, with calcium, it activates **protein kinase C**.\r\n\r\n## Enzyme-linked receptors\r\n\r\nOther receptors are enzymes themselves. A **receptor tyrosine kinase**, the receptor for insulin and most growth factors, pairs up when its ligand binds, and each half phosphorylates the other. This **autophosphorylation** creates docking sites for signaling proteins. Through them the receptor activates **Ras**, a small, single-subunit G protein that runs on the same GTP timer as the heterotrimeric kind. Ras starts the **MAP kinase cascade**, three kinases in a row that carry growth signals to the nucleus. Mutant Ras that cannot hydrolyze its GTP leaves that signal on and is common in cancer.\r\n\r\nReceptors for leptin, growth hormone, and many cytokines have no enzyme of their own. They borrow associated JAK kinases, which phosphorylate STAT proteins: the **JAK–STAT pathway**. A further class, the guanylyl cyclase receptors such as the receptor for atrial natriuretic peptide, makes cGMP.\r\n\r\n## Receptors inside the cell\r\n\r\n**Steroid hormones** such as cortisol and aldosterone diffuse through the plasma membrane; **thyroid hormone** is carried in by transporters. Both reach an **intracellular receptor** (also called a nuclear receptor). The hormone–receptor complex binds a **hormone response element**, a short DNA sequence near the genes it controls, and raises or lowers their transcription. New proteins take time to make, so these hormones act over hours, and their effects outlast the hormone.\r\n\r\nThat makes the intracellular receptor a **transcription factor**, a protein that controls when genes are read. Surface receptors reach genes too: the MAP kinase cascade activates transcription factors, STATs are transcription factors, and protein kinase A phosphorylates one called CREB.\r\n\r\n## Adjusting receptor sensitivity\r\n\r\nCells tune how strongly they respond. Within minutes of heavy stimulation, kinases phosphorylate the active receptor and **β-arrestin** binds it, blocking its access to G proteins. This **receptor desensitization** is why repeated puffs of a β₂-agonist inhaler lose some effect. β-arrestin also pulls receptors into the cell, and over hours to days prolonged exposure lowers receptor numbers: **receptor downregulation**. Too little stimulation does the opposite. A tissue that loses its nerve supply adds receptors (**receptor upregulation**) and becomes supersensitive to its transmitter."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "signal-transduction",
      "puzzleRevision": "fnv1a32:5408edc1",
      "board": {
        "width": 1300,
        "height": 830
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 783.91,
          "y": 169.19,
          "pinned": false
        },
        "cluster:1": {
          "x": 1149.78,
          "y": 354.99,
          "pinned": false
        },
        "cluster:2": {
          "x": 1015.86,
          "y": 608.8,
          "pinned": true
        },
        "cluster:3": {
          "x": 516.09,
          "y": 676.81,
          "pinned": false
        },
        "cluster:4": {
          "x": 150.22,
          "y": 491.01,
          "pinned": false
        },
        "cluster:5": {
          "x": 284.14,
          "y": 237.2,
          "pinned": false
        }
      },
      "bridges": {
        "term:Gs": {
          "x": 1003.62,
          "y": 225.32,
          "pinned": false
        },
        "term:Gi": {
          "x": 1006.64,
          "y": 166.01,
          "pinned": false
        },
        "term:Gq": {
          "x": 851.85,
          "y": 408.9,
          "pinned": false
        },
        "term:second messenger": {
          "x": 957.17,
          "y": 429.85,
          "pinned": false
        },
        "term:Ras": {
          "x": 650,
          "y": 371,
          "pinned": false
        },
        "term:transcription factor": {
          "x": 353.05,
          "y": 535.87,
          "pinned": false
        },
        "term:β-arrestin": {
          "x": 541.3,
          "y": 228.56,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "G protein–coupled receptor",
          "heterotrimeric G protein",
          "GTP–GDP exchange",
          "GTPase activity",
          "βγ subunits"
        ],
        "cluster:1": [
          "adenylyl cyclase",
          "cyclic AMP",
          "protein kinase A",
          "phosphodiesterase"
        ],
        "cluster:2": [
          "phospholipase C",
          "IP₃",
          "diacylglycerol",
          "protein kinase C",
          "calmodulin"
        ],
        "cluster:3": [
          "receptor tyrosine kinase",
          "autophosphorylation",
          "MAP kinase cascade",
          "JAK–STAT pathway"
        ],
        "cluster:4": [
          "intracellular receptor",
          "hormone response element",
          "steroid hormone",
          "thyroid hormone"
        ],
        "cluster:5": [
          "receptor desensitization",
          "receptor downregulation",
          "receptor upregulation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "βγ subunits",
          "G protein–coupled receptor",
          "heterotrimeric G protein",
          "GTP–GDP exchange",
          "GTPase activity"
        ],
        "cluster:1": [
          "adenylyl cyclase",
          "phosphodiesterase",
          "cyclic AMP",
          "protein kinase A"
        ],
        "cluster:2": [
          "IP₃",
          "diacylglycerol",
          "protein kinase C",
          "phospholipase C",
          "calmodulin"
        ],
        "cluster:3": [
          "MAP kinase cascade",
          "receptor tyrosine kinase",
          "autophosphorylation",
          "JAK–STAT pathway"
        ],
        "cluster:4": [
          "thyroid hormone",
          "hormone response element",
          "intracellular receptor",
          "steroid hormone"
        ],
        "cluster:5": [
          "receptor upregulation",
          "receptor desensitization",
          "receptor downregulation"
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
        "edgeNodeIntersections": 0,
        "totalLength": 2430.8949733532004
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-19T02:24:22.300Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "signal-transduction",
      "puzzleRevision": "fnv1a32:5408edc1",
      "board": {
        "width": 1300,
        "height": 830
      },
      "nodes": {
        "term:G protein–coupled receptor": {
          "x": 426.06,
          "y": 314.9
        },
        "term:heterotrimeric G protein": {
          "x": 733.12,
          "y": 164.57
        },
        "term:GTP–GDP exchange": {
          "x": 516.97,
          "y": 99.12
        },
        "term:GTPase activity": {
          "x": 633.64,
          "y": 289.27
        },
        "term:βγ subunits": {
          "x": 718.08,
          "y": 84.12
        },
        "term:adenylyl cyclase": {
          "x": 961.49,
          "y": 319.1
        },
        "term:cyclic AMP": {
          "x": 1122.35,
          "y": 297.28
        },
        "term:protein kinase A": {
          "x": 1183.22,
          "y": 159.98
        },
        "term:phosphodiesterase": {
          "x": 1055.64,
          "y": 96.05
        },
        "term:phospholipase C": {
          "x": 864.38,
          "y": 548.51
        },
        "term:IP₃": {
          "x": 1064.46,
          "y": 504.98
        },
        "term:diacylglycerol": {
          "x": 1182.63,
          "y": 534.79
        },
        "term:protein kinase C": {
          "x": 1076.49,
          "y": 717.45
        },
        "term:calmodulin": {
          "x": 946.19,
          "y": 475.44
        },
        "term:receptor tyrosine kinase": {
          "x": 791.02,
          "y": 660.34
        },
        "term:autophosphorylation": {
          "x": 754.64,
          "y": 741.91
        },
        "term:MAP kinase cascade": {
          "x": 628.48,
          "y": 517.7
        },
        "term:JAK–STAT pathway": {
          "x": 582.27,
          "y": 709.6
        },
        "term:intracellular receptor": {
          "x": 392.6,
          "y": 650.25
        },
        "term:hormone response element": {
          "x": 198.62,
          "y": 728.82
        },
        "term:steroid hormone": {
          "x": 358.22,
          "y": 467.06
        },
        "term:thyroid hormone": {
          "x": 142.81,
          "y": 474.16
        },
        "term:receptor desensitization": {
          "x": 259.67,
          "y": 29.97
        },
        "term:receptor downregulation": {
          "x": 124.25,
          "y": 136.32
        },
        "term:receptor upregulation": {
          "x": 117.95,
          "y": 324.43
        },
        "term:Gs": {
          "x": 856.68,
          "y": 236.61
        },
        "term:Gi": {
          "x": 863.79,
          "y": 122.44
        },
        "term:Gq": {
          "x": 782.34,
          "y": 363.53
        },
        "term:second messenger": {
          "x": 1085.77,
          "y": 401.24
        },
        "term:Ras": {
          "x": 637.49,
          "y": 402.95
        },
        "term:transcription factor": {
          "x": 387.54,
          "y": 779.18
        },
        "term:β-arrestin": {
          "x": 403.71,
          "y": 175.12
        },
        "cluster:0": {
          "x": 546.83,
          "y": 200.44
        },
        "cluster:1": {
          "x": 1021.21,
          "y": 196.97
        },
        "cluster:2": {
          "x": 1058.6,
          "y": 613.3
        },
        "cluster:3": {
          "x": 610.17,
          "y": 605.65
        },
        "cluster:4": {
          "x": 246.12,
          "y": 580.44
        },
        "cluster:5": {
          "x": 219.67,
          "y": 224.12
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T02:24:29.291Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "signal-transduction",
      "puzzleRevision": "fnv1a32:5408edc1",
      "board": {
        "width": 1300,
        "height": 830
      },
      "nodes": {
        "term:G protein–coupled receptor": {
          "x": 625.03,
          "y": 159.02,
          "pinned": true
        },
        "term:heterotrimeric G protein": {
          "x": 776.22,
          "y": 275.41,
          "pinned": false
        },
        "term:GTP–GDP exchange": {
          "x": 602.59,
          "y": 26.97,
          "pinned": true
        },
        "term:GTPase activity": {
          "x": 597.74,
          "y": 285.15,
          "pinned": false
        },
        "term:βγ subunits": {
          "x": 765.06,
          "y": 26.97,
          "pinned": true
        },
        "term:adenylyl cyclase": {
          "x": 964.61,
          "y": 138.19,
          "pinned": true
        },
        "term:cyclic AMP": {
          "x": 983,
          "y": 250.56,
          "pinned": true
        },
        "term:protein kinase A": {
          "x": 1126.26,
          "y": 210.4,
          "pinned": true
        },
        "term:phosphodiesterase": {
          "x": 1103.39,
          "y": 53.11,
          "pinned": true
        },
        "term:phospholipase C": {
          "x": 889.69,
          "y": 498.48,
          "pinned": true
        },
        "term:IP₃": {
          "x": 1064.45,
          "y": 458.31,
          "pinned": true
        },
        "term:diacylglycerol": {
          "x": 1033.54,
          "y": 633.98,
          "pinned": true
        },
        "term:protein kinase C": {
          "x": 867.2,
          "y": 616.09,
          "pinned": true
        },
        "term:calmodulin": {
          "x": 1058.02,
          "y": 544.45,
          "pinned": true
        },
        "term:receptor tyrosine kinase": {
          "x": 706.73,
          "y": 705.86,
          "pinned": true
        },
        "term:autophosphorylation": {
          "x": 848.6,
          "y": 789.12,
          "pinned": true
        },
        "term:MAP kinase cascade": {
          "x": 686.32,
          "y": 592.36,
          "pinned": true
        },
        "term:JAK–STAT pathway": {
          "x": 563.65,
          "y": 795.08,
          "pinned": true
        },
        "term:intracellular receptor": {
          "x": 429.97,
          "y": 541.34,
          "pinned": true
        },
        "term:hormone response element": {
          "x": 233.45,
          "y": 627.3,
          "pinned": true
        },
        "term:steroid hormone": {
          "x": 450.92,
          "y": 389.29,
          "pinned": true
        },
        "term:thyroid hormone": {
          "x": 257.67,
          "y": 455.48,
          "pinned": true
        },
        "term:receptor desensitization": {
          "x": 352.09,
          "y": 201.84,
          "pinned": true
        },
        "term:receptor downregulation": {
          "x": 201.68,
          "y": 100.26,
          "pinned": true
        },
        "term:receptor upregulation": {
          "x": 242,
          "y": 299.8,
          "pinned": true
        },
        "term:Gs": {
          "x": 826.26,
          "y": 183.71,
          "pinned": true
        },
        "term:Gi": {
          "x": 883.06,
          "y": 58.13,
          "pinned": true
        },
        "term:Gq": {
          "x": 794.82,
          "y": 393.11,
          "pinned": true
        },
        "term:second messenger": {
          "x": 1035.18,
          "y": 358.42,
          "pinned": true
        },
        "term:Ras": {
          "x": 635.07,
          "y": 431.16,
          "pinned": false
        },
        "term:transcription factor": {
          "x": 438.49,
          "y": 668.82,
          "pinned": true
        },
        "term:β-arrestin": {
          "x": 441.86,
          "y": 51.39,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6137.74,
        "score": 6137.738757690044
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T02:24:40.866Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-18T21:19:05.847Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
