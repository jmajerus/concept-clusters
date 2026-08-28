// Generated from content/puzzles/from-features-to-metabolic-meaning.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "from-features-to-metabolic-meaning",
  "title": "From Features to Metabolic Meaning",
  "category": "Biology",
  "subcategories": { "Biology": "multiomics" },
  "tags": [
    "biology",
    "metabolomics",
    "metabolite identification",
    "metabolic flux"
  ],
  "level": "intermediate",
  "info": {
    "text": "A metabolomic feature is not automatically a named compound, and a concentration difference is not automatically a change in pathway flux. Strong interpretation keeps identification confidence and the limits of static abundance measurements visible.",
    "links": [
      {
        "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3772505/",
        "label": "Metabolomics Standards Initiative reporting standards"
      }
    ],
    "citations": [
      {
        "title": "Proposed minimum reporting standards for chemical analysis: Chemical Analysis Working Group (CAWG), Metabolomics Standards Initiative (MSI)",
        "author": "Lloyd W. Sumner et al.",
        "publisher": "Metabolomics",
        "year": "2007",
        "pages": "211–221",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3772505/"
      },
      {
        "title": "Mass spectrometry-based metabolomics: a guide for annotation, quantification and best reporting practices",
        "author": "Saleh Alseekh et al.",
        "publisher": "Nature Methods",
        "year": "2021",
        "pages": "747–756",
        "url": "https://www.nature.com/articles/s41592-021-01197-1.pdf"
      },
      {
        "title": "Metabolomics and Isotope Tracing",
        "author": "Cholsoon Jang, Li Chen, and Joshua D. Rabinowitz",
        "publisher": "Cell",
        "year": "2018",
        "pages": "822–837",
        "url": "https://pubmed.ncbi.nlm.nih.gov/29727671/"
      }
    ]
  },
  "clusters": [
    {
      "id": "observe-a-feature",
      "name": "Observe a chemical feature",
      "color": "teal",
      "fact": "A mass-to-charge ratio and isotope pattern describe an ion, retention time records when it elutes, and a tandem mass spectrum records fragments; together they provide complementary evidence rather than an automatic identity.",
      "terms": [
        "mass-to-charge ratio",
        "retention time",
        "isotope pattern",
        "tandem mass spectrum"
      ],
      "seeds": [
        "mass-to-charge ratio",
        "retention time"
      ],
      "termInfo": {
        "mass-to-charge ratio": {
          "text": "The measured ratio of an ion’s mass to its electric charge, commonly written m/z."
        },
        "retention time": {
          "text": "The time between sample injection and a compound’s detection after chromatographic separation."
        },
        "isotope pattern": {
          "text": "The relative signals of ions that differ in isotopic composition, which can constrain elemental composition and identity."
        },
        "tandem mass spectrum": {
          "text": "A pattern of product ions produced by fragmenting a selected precursor ion, providing structural evidence for annotation."
        }
      },
      "info": {
        "text": "Mass spectrometry and chromatography produce feature-level observations. Combining independent properties narrows possible identities but does not by itself guarantee one.",
        "links": [
          {
            "href": "https://www.nature.com/articles/s41592-021-01197-1.pdf",
            "label": "Annotation and reporting guide"
          }
        ]
      }
    },
    {
      "id": "support-an-identity",
      "name": "Support a metabolite identity",
      "color": "blue",
      "fact": "A spectral-library match proposes an identity, an authentic standard can test it under comparable conditions, and annotation confidence communicates how strongly the evidence supports the named compound.",
      "terms": [
        "spectral library",
        "authentic standard",
        "annotation confidence"
      ],
      "seeds": [
        "spectral library",
        "authentic standard"
      ],
      "termInfo": {
        "spectral library": {
          "text": "A reference collection of spectra used to compare an observed fragmentation pattern with patterns from known or previously annotated compounds."
        },
        "authentic standard": {
          "text": "A verified sample of a known compound analyzed to compare properties such as retention time and fragmentation with an unknown feature."
        },
        "annotation confidence": {
          "text": "An explicit statement of how strongly available evidence supports a proposed metabolite identity."
        }
      },
      "info": {
        "text": "Identification confidence rises when observed properties agree with reference data and, most strongly, with an authentic compound analyzed under comparable conditions.",
        "links": [
          {
            "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3772505/",
            "label": "MSI chemical-analysis standards"
          }
        ]
      }
    },
    {
      "id": "infer-metabolic-activity",
      "name": "Distinguish amount from pathway activity",
      "color": "amber",
      "fact": "Metabolite concentration and pool size describe amount, whereas isotopologue patterns can reveal molecular origin and help constrain metabolic flux and pathway activity.",
      "terms": [
        "metabolite concentration",
        "pool size",
        "isotopologue",
        "metabolic flux",
        "pathway activity"
      ],
      "seeds": [
        "metabolite concentration",
        "metabolic flux"
      ],
      "termInfo": {
        "metabolite concentration": {
          "text": "The amount of a metabolite per defined volume, mass, cell number, or other reference quantity."
        },
        "pool size": {
          "text": "The total amount of a metabolite present in a defined compartment or system at a particular time."
        },
        "isotopologue": {
          "text": "A molecular form that differs only in isotopic composition, such as the number of carbon-13 atoms it contains."
        },
        "metabolic flux": {
          "text": "The rate at which material moves through a metabolic reaction or pathway."
        },
        "pathway activity": {
          "text": "The extent to which a metabolic pathway is operating, which depends on reaction flow rather than metabolite abundance alone."
        }
      },
      "info": {
        "text": "A metabolite can accumulate because production increased, consumption slowed, or both. Tracer-derived labeling adds information needed to reason about pathway flow.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/29727671/",
            "label": "Metabolomics and isotope tracing"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "annotation-uncertainty",
      "term": "annotation uncertainty",
      "clusters": [
        1,
        2
      ],
      "fact": "Annotation uncertainty propagates into biological interpretation: pathway claims cannot be more compound-specific than the evidence supporting the metabolite identities.",
      "info": {
        "text": "This connector marks a limit on interpretation: uncertain compound names make downstream pathway assignments uncertain too."
      },
      "termRole": "connector",
      "relationKind": "evaluation",
      "idealTerms": [
        "annotation confidence",
        "pathway activity"
      ]
    }
  ],
  "lenses": [
    {
      "id": "evidence-beyond-precursor-mass",
      "prompt": "Which terms add identity evidence through separation behavior, fragmentation, or comparison with a physical reference compound?",
      "explanation": "Retention time records chromatographic behavior, a tandem mass spectrum records fragmentation, and an authentic standard supplies directly comparable reference material.",
      "targets": [
        "retention time",
        "tandem mass spectrum",
        "authentic standard"
      ],
      "reasons": {
        "retention time": "It adds separation behavior under a defined method.",
        "tandem mass spectrum": "It adds a compound-related fragmentation pattern.",
        "authentic standard": "It supplies verified material for direct comparison under comparable conditions."
      }
    },
    {
      "id": "amount-without-rate",
      "prompt": "Which two terms describe how much metabolite is present without directly measuring how fast reactions are running?",
      "explanation": "Concentration and pool size describe static amount. Neither alone reveals production and consumption rates.",
      "targets": [
        "metabolite concentration",
        "pool size"
      ],
      "reasons": {
        "metabolite concentration": "It expresses amount relative to a defined reference such as volume or mass.",
        "pool size": "It expresses the total amount present in the defined system or compartment."
      }
    },
    {
      "id": "from-labeling-to-flow",
      "prompt": "Which terms carry interpretation from isotope labeling toward claims about metabolic flow?",
      "explanation": "An isotopologue records labeled molecular composition, metabolic flux describes reaction rate, and pathway activity summarizes operation of the connected reactions.",
      "targets": [
        "isotopologue",
        "metabolic flux",
        "pathway activity"
      ],
      "reasons": {
        "isotopologue": "Its labeling pattern provides evidence about molecular origin and pathway use.",
        "metabolic flux": "It names the rate of material flow through reactions.",
        "pathway activity": "It interprets how strongly a connected set of reactions is operating."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "info": {
      "text": "Follow metabolomics from experimental scope and sample measurement to defensible compound identities and biological claims about metabolic activity."
    },
    "entries": [
      {
        "id": "measuring-the-metabolome",
        "reason": "Return to the experimental choices and sample controls that determine which metabolomic features can be observed."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Why a peak is not yet a pathway",
    "summary": "Metabolomic interpretation has two separate inference steps: assigning a chemical identity and deciding what its abundance or labeling says about metabolism.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Analytical instruments first produce features: combinations of mass, chromatographic behavior, isotope pattern, and fragmentation. Several compounds can share some of those properties. Naming a metabolite therefore requires converging evidence, and the confidence of that name should remain visible when the result is mapped to biology.\n\nA second distinction separates amount from activity. Concentration and pool size describe how much metabolite is present, but that amount reflects both production and consumption. Stable-isotope labeling can reveal where atoms came from and help constrain metabolic flux—the rate of material moving through reactions. Reliable pathway claims depend on both sound chemical identification and measurements suited to dynamic inference."
    },
    "links": [
      {
        "href": "https://pubmed.ncbi.nlm.nih.gov/29727671/",
        "label": "Metabolomics and isotope tracing"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (GPT-5.6 Sol)",
        "model": "gpt-5.6-sol"
      }
    ]
  }
});
