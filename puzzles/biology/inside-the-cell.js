// Concept Clusters puzzle: Inside the cell

export default {
  id: "inside-the-cell",
  title: "Inside the cell",
  category: "Biology",
  large: true,
  subcategories: { Biology: "foundations" },
  tags: ["biology", "cells", "organelles", "membranes"],
  info: {
    text: "A eukaryotic cell is not a bag of interchangeable parts: membranes regulate exchange, genetic information is selectively used, and organelles divide production, transport, energy conversion, and recycling into coordinated compartments.",
    link: "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
    citations: [
      {
        title: "Eukaryotic Cells",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
      },
      {
        title: "Passive Transport",
        author: "Mary Ann Clark, Matthew Douglas, and Jung Choi",
        publisher: "OpenStax",
        year: "2018",
        url: "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Continue from cell organization to cell reproduction or follow the information used to build proteins." },
    entries: [
      { id: "cell-division-and-inheritance", reason: "See how cells copy and distribute chromosomes." },
      { id: "from-dna-to-gene-expression", reason: "Follow genomic information through transcription and translation." },
      { id: "energy-flow", reason: "Connect mitochondria and ATP with organismal and ecosystem energy flow." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-11" }
  ],
  lenses: [
    {
      id: "membrane-bound-compartments",
      prompt: "Which concepts are membrane-bound compartments within a eukaryotic cell?",
      targets: ["nucleus", "rough endoplasmic reticulum", "Golgi apparatus", "mitochondrion", "lysosome", "peroxisome"],
      explanation: "The nucleus, endoplasmic reticulum, Golgi, mitochondria, and lysosomes each enclose a specialized internal environment. Ribosomes and the cytoskeleton are cellular structures but are not membrane-bound organelles."
    },
    {
      id: "moving-materials",
      prompt: "Which concepts directly help move selected substances across the cell boundary or between internal compartments?",
      targets: ["channel protein", "concentration gradient", "Golgi apparatus", "vesicle", "active transport"],
      explanation: "Channels can permit movement down a concentration gradient, active transport can move substances against one, and Golgi-derived vesicles carry materials between compartments or toward the membrane."
    },
    {
      id: "information-to-protein",
      prompt: "Which concepts trace cellular information from stored DNA toward a protein that can be processed and delivered?",
      targets: ["chromosome", "transcription", "ribosome", "rough endoplasmic reticulum", "protein"],
      explanation: "Chromosomal DNA is transcribed, ribosomes translate the resulting message, and proteins entering the endomembrane system are synthesized by ribosomes associated with the rough ER for further processing and transport."
    }
  ],
  clusters: [
    {
      name: "Boundary and exchange",
      color: "teal",
      fact: "The plasma membrane is a selectively permeable phospholipid bilayer whose channels and receptors regulate movement and communication across the cell boundary.",
      info: { link: "wiki:Cell membrane" },
      terms: ["plasma membrane", "phospholipid bilayer", "channel protein", "concentration gradient", "membrane receptor"],
      seeds: ["plasma membrane", "channel protein"]
    },
    {
      name: "Information and control",
      color: "blue",
      fact: "The nucleus houses chromosomes, while transcription selectively copies genomic information into RNA for use elsewhere in the cell.",
      info: { link: "wiki:Cell nucleus" },
      terms: ["nucleus", "chromosome", "transcription", "RNA"],
      seeds: ["nucleus", "chromosome"]
    },
    {
      name: "Building and delivery",
      color: "amber",
      fact: "Ribosomes synthesize proteins; rough ER, smooth ER, and the Golgi divide protein processing, lipid synthesis, modification, and routing among compartments.",
      info: { link: "wiki:Endomembrane system" },
      terms: ["ribosome", "rough endoplasmic reticulum", "smooth endoplasmic reticulum", "Golgi apparatus", "protein modification"],
      seeds: ["ribosome", "Golgi apparatus"]
    },
    {
      name: "Recycling and structure",
      color: "magenta",
      fact: "Lysosomes digest selected material, peroxisomes carry out specialized oxidative reactions, and the cytoskeleton supports cell shape and internal movement.",
      info: { link: "wiki:Organelle" },
      terms: ["lysosome", "peroxisome", "cytoskeleton"],
      seeds: ["lysosome", "cytoskeleton"]
    },
    {
      name: "Energy transformation",
      color: "olive",
      fact: "Mitochondria use cellular respiration to generate much of a eukaryotic cell's ATP; chloroplasts in plants and algae capture light energy into chemical form.",
      info: { link: "wiki:Bioenergetics" },
      terms: ["mitochondrion", "ATP", "chloroplast"],
      seeds: ["mitochondrion", "ATP"]
    }
  ],
  bridges: [
    {
      term: "active transport",
      clusters: [0, 4],
      relationKind: "dynamic",
      fact: "Active transport couples selective membrane movement to cellular energy, allowing substances to move against an electrochemical gradient.",
      idealTerms: ["concentration gradient", "ATP"],
      info: { link: "wiki:Active transport" }
    },
    {
      term: "protein",
      clusters: [1, 2],
      relationKind: "dynamic",
      fact: "Information copied from chromosomes guides protein synthesis, after which cellular machinery can fold, modify, and deliver the product.",
      idealTerms: ["transcription", "ribosome"],
      info: { link: "wiki:Protein" }
    },
    {
      term: "vesicle",
      clusters: [0, 2],
      relationKind: "dynamic",
      fact: "Membrane-bound vesicles transport cargo within the endomembrane system and can fuse with the plasma membrane to release or receive material.",
      idealTerms: ["plasma membrane", "Golgi apparatus"],
      info: { link: "wiki:Vesicle (biology and chemistry)" }
    }
  ]
};
