// Generated from content/puzzles/inside-the-cell.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "inside-the-cell",
  "title": "Inside the cell",
  "category": "biology",
  "subcategories": {
    "biology": "foundations"
  },
  "large": true,
  "tags": [
    "biology",
    "cells",
    "organelles",
    "membranes"
  ],
  "info": {
    "text": "A eukaryotic cell is not a bag of interchangeable parts: membranes regulate exchange, genetic information is selectively used, and organelles divide production, transport, energy conversion, and recycling into coordinated compartments.",
    "citations": [
      {
        "title": "Eukaryotic Cells",
        "author": "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
      },
      {
        "title": "Passive Transport",
        "author": "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-boundary-and-exchange",
      "name": "Boundary and exchange",
      "color": "teal",
      "fact": "The plasma membrane is a selectively permeable phospholipid bilayer whose channels and receptors regulate movement and communication across the cell boundary.",
      "terms": [
        "plasma membrane",
        "phospholipid bilayer",
        "channel protein",
        "concentration gradient",
        "membrane receptor"
      ],
      "seeds": [
        "plasma membrane",
        "channel protein"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Cell membrane"
          }
        ]
      }
    },
    {
      "id": "cluster-information-and-control",
      "name": "Information and control",
      "color": "blue",
      "fact": "The nucleus houses chromosomes, while transcription selectively copies genomic information into RNA for use elsewhere in the cell.",
      "terms": [
        "nucleus",
        "chromosome",
        "transcription",
        "RNA"
      ],
      "seeds": [
        "nucleus",
        "chromosome"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Cell nucleus"
          }
        ]
      }
    },
    {
      "id": "cluster-building-and-delivery",
      "name": "Building and delivery",
      "color": "amber",
      "fact": "Ribosomes synthesize proteins; rough ER, smooth ER, and the Golgi divide protein processing, lipid synthesis, modification, and routing among compartments.",
      "terms": [
        "ribosome",
        "rough endoplasmic reticulum",
        "smooth endoplasmic reticulum",
        "Golgi apparatus",
        "protein modification"
      ],
      "seeds": [
        "ribosome",
        "Golgi apparatus"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Endomembrane system"
          }
        ]
      }
    },
    {
      "id": "cluster-recycling-and-structure",
      "name": "Recycling and structure",
      "color": "magenta",
      "fact": "Lysosomes digest selected material, peroxisomes carry out specialized oxidative reactions, and the cytoskeleton supports cell shape and internal movement.",
      "terms": [
        "lysosome",
        "peroxisome",
        "cytoskeleton"
      ],
      "seeds": [
        "lysosome",
        "cytoskeleton"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Organelle"
          }
        ]
      }
    },
    {
      "id": "cluster-energy-transformation",
      "name": "Energy transformation",
      "color": "olive",
      "fact": "Mitochondria use cellular respiration to generate much of a eukaryotic cell's ATP; chloroplasts in plants and algae capture light energy into chemical form.",
      "terms": [
        "mitochondrion",
        "ATP",
        "chloroplast"
      ],
      "seeds": [
        "mitochondrion",
        "ATP"
      ],
      "info": {
        "links": [
          {
            "href": "wiki:Bioenergetics"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-active-transport",
      "term": "active transport",
      "clusters": [
        0,
        4
      ],
      "fact": "Active transport couples selective membrane movement to cellular energy, allowing substances to move against an electrochemical gradient.",
      "info": {
        "links": [
          {
            "href": "wiki:Active transport"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "concentration gradient",
        "ATP"
      ]
    },
    {
      "id": "bridge-protein",
      "term": "protein",
      "clusters": [
        1,
        2
      ],
      "fact": "Information copied from chromosomes guides protein synthesis, after which cellular machinery can fold, modify, and deliver the product.",
      "info": {
        "links": [
          {
            "href": "wiki:Protein"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "transcription",
        "ribosome"
      ]
    },
    {
      "id": "bridge-vesicle",
      "term": "vesicle",
      "clusters": [
        0,
        2
      ],
      "fact": "Membrane-bound vesicles transport cargo within the endomembrane system and can fuse with the plasma membrane to release or receive material.",
      "info": {
        "links": [
          {
            "href": "wiki:Vesicle (biology and chemistry)"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "plasma membrane",
        "Golgi apparatus"
      ]
    }
  ],
  "lenses": [
    {
      "id": "membrane-bound-compartments",
      "prompt": "Which concepts are membrane-bound compartments within a eukaryotic cell?",
      "explanation": "The nucleus, endoplasmic reticulum, Golgi, mitochondria, and lysosomes each enclose a specialized internal environment. Ribosomes and the cytoskeleton are cellular structures but are not membrane-bound organelles.",
      "targets": [
        "nucleus",
        "rough endoplasmic reticulum",
        "Golgi apparatus",
        "mitochondrion",
        "lysosome",
        "peroxisome"
      ]
    },
    {
      "id": "moving-materials",
      "prompt": "Which concepts directly help move selected substances across the cell boundary or between internal compartments?",
      "explanation": "Channels can permit movement down a concentration gradient, active transport can move substances against one, and Golgi-derived vesicles carry materials between compartments or toward the membrane.",
      "targets": [
        "channel protein",
        "concentration gradient",
        "Golgi apparatus",
        "vesicle",
        "active transport"
      ]
    },
    {
      "id": "information-to-protein",
      "prompt": "Which concepts trace cellular information from stored DNA toward a protein that can be processed and delivered?",
      "explanation": "Chromosomal DNA is transcribed, ribosomes translate the resulting message, and proteins entering the endomembrane system are synthesized by ribosomes associated with the rough ER for further processing and transport.",
      "targets": [
        "chromosome",
        "transcription",
        "ribosome",
        "rough endoplasmic reticulum",
        "protein"
      ]
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Continue from cell organization to cell reproduction or follow the information used to build proteins."
    },
    "entries": [
      {
        "id": "cell-division-and-inheritance",
        "reason": "See how cells copy and distribute chromosomes."
      },
      {
        "id": "from-dna-to-gene-expression",
        "reason": "Follow genomic information through transcription and translation."
      },
      {
        "id": "energy-flow",
        "reason": "Connect mitochondria and ATP with organismal and ecosystem energy flow."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
