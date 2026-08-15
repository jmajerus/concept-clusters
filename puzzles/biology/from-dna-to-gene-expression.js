// Concept Clusters puzzle: how genomic information becomes a cellular product.

export default {
  id: "from-dna-to-gene-expression",
  title: "From DNA to gene expression",
  category: "Biology",
  subcategories: { Biology: "genomics" },
  tags: ["biology", "genomics", "gene expression", "molecular biology"],
  large: true,
  info: {
    text: "A genome is not a simple list of protein recipes. DNA is packaged and regulated; selected regions are transcribed into RNA; and some RNAs are translated into proteins while others act in different cellular roles.",
    link: "https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet",
    citations: [
      {
        title: "Deoxyribonucleic Acid (DNA) Fact Sheet",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet"
      },
      {
        title: "Transcriptome Fact Sheet",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/about-genomics/fact-sheets/Transcriptome-Fact-Sheet"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Continue from biological information to the technologies that read it and the variation those readings reveal." },
    entries: [
      { id: "from-reads-to-a-genome", reason: "See how laboratory measurements and computation reconstruct genomic sequence." },
      { id: "reading-genetic-variation", reason: "Explore how differences from a reference are detected and interpreted." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "stored-versus-expressed",
      prompt: "Which concepts distinguish information stored in a genome from the selective process of using it?",
      targets: ["chromosome", "regulatory sequence", "gene", "gene expression"],
      explanation: "Chromosomes store packaged DNA, while regulatory sequences and promoters help determine which regions are used. Gene expression names the selective process, not merely the presence of a gene.",
      reasons: {
        chromosome: "It packages a long DNA molecule containing many genomic regions.",
        "regulatory sequence": "It can influence when, where, or how strongly a gene is used.",
        gene: "It is a particular genomic region that can be selectively expressed.",
        "gene expression": "It is the regulated use of genomic information to produce functional RNA or protein."
      }
    },
    {
      id: "rna-is-more-than-a-messenger",
      prompt: "Which concepts show that RNA has processing, structural, and regulatory roles—not only a temporary copy of a protein recipe?",
      targets: ["RNA polymerase", "RNA processing", "noncoding RNA", "transfer RNA", "ribosome"],
      explanation: "RNA is synthesized, often processed, and can function without encoding a protein. Transfer RNA and ribosomal RNA are themselves working parts of translation.",
      reasons: {
        "RNA polymerase": "It synthesizes RNA from a DNA template.",
        "RNA processing": "It changes a primary transcript into one or more mature RNA products.",
        "noncoding RNA": "It functions as RNA rather than serving as a protein-coding message.",
        "transfer RNA": "It carries amino acids and matches them to codons during translation.",
        ribosome: "Its RNA-and-protein machinery performs translation."
      }
    },
    {
      id: "following-information-flow",
      prompt: "Which concepts trace the usual path from a DNA region to an amino-acid chain?",
      targets: ["gene", "transcription", "messenger RNA", "ribosome", "translation", "amino acid"],
      explanation: "A gene is transcribed into messenger RNA, which the ribosome reads during translation, joining the corresponding amino acids.",
      reasons: {
        gene: "It is the genomic region whose information is being used.",
        transcription: "It copies information from DNA into RNA.",
        "messenger RNA": "It carries a protein-coding transcript to the translation machinery.",
        ribosome: "It is the machinery that reads messenger RNA and carries out translation.",
        translation: "It converts the nucleotide message into an amino-acid sequence.",
        "amino acid": "It is a building block joined into the emerging protein."
      }
    },
    {
      id: "different-fates-for-rna",
      prompt: "Which concepts show the different paths an RNA transcript can take after it is made?",
      targets: ["primary transcript", "RNA splicing", "mature RNA", "noncoding RNA", "messenger RNA", "translation"],
      explanation: "A primary transcript is spliced into a mature RNA. Some mature RNAs function directly as noncoding RNA, while messenger RNA can instead become the template for translation.",
      reasons: {
        "primary transcript": "It is the initial RNA product before processing is complete.",
        "RNA splicing": "It is the specific processing step that removes introns and joins exons to produce a mature transcript.",
        "mature RNA": "It is the processed molecule ready for a cellular role.",
        "noncoding RNA": "Its functional product remains RNA rather than becoming protein.",
        "messenger RNA": "It carries a coding sequence to the translation machinery.",
        translation: "It is the path by which a coding RNA directs polypeptide synthesis."
      }
    }
  ],
  clusters: [
    {
      name: "Organizing genomic information",
      color: "teal",
      fact: "DNA is packaged into chromosomes, and a genome contains genes alongside regulatory and other noncoding sequences.",
      terms: ["DNA", "chromosome", "regulatory sequence", "noncoding sequence"],
      seeds: ["DNA", "chromosome"],
      termInfo: {
        DNA: { text: "The nucleic-acid molecule whose base sequence stores genomic information in cellular life.", link: "https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet" },
        chromosome: { text: "A packaged DNA molecule, together with associated proteins, that carries genomic information.", link: "https://www.genome.gov/genetics-glossary/Chromosome" },
        "regulatory sequence": { text: "A DNA region that influences when, where, or how strongly a gene is expressed.", link: "wiki:Regulatory sequence" },
        "noncoding sequence": { text: "Genomic DNA that does not encode a protein; many such regions have regulatory, structural, or other functions.", link: "wiki:Non-coding DNA" }
      }
    },
    {
      name: "Transcribing DNA",
      color: "blue",
      fact: "RNA polymerase binds with the help of promoter and regulatory context, then transcribes a DNA template into a primary RNA transcript.",
      terms: ["promoter", "RNA polymerase", "transcription"],
      seeds: ["promoter", "transcription"],
      termInfo: {
        promoter: { text: "A regulatory DNA region where the transcription machinery assembles to begin transcription.", link: "https://www.genome.gov/genetics-glossary/Promoter" },
        "RNA polymerase": { text: "An enzyme that builds an RNA strand using DNA as its template.", link: "wiki:RNA polymerase" },
        transcription: { text: "The synthesis of an RNA molecule from a DNA template.", link: "https://www.genome.gov/genetics-glossary/Transcription" }
      }
    },
    {
      name: "Processing and using RNA",
      color: "cyan",
      fact: "A primary transcript may be capped, cleaved, and spliced into a mature RNA; some mature RNAs carry protein-coding messages, while others function without translation.",
      terms: ["primary transcript", "RNA processing", "RNA splicing", "mature RNA", "noncoding RNA"],
      seeds: ["RNA processing", "noncoding RNA"],
      termInfo: {
        "primary transcript": { text: "The initial RNA product copied from DNA before any post-transcriptional processing is completed.", link: "wiki:Primary transcript" },
        "RNA processing": { text: "Changes to a primary RNA transcript, such as capping, splicing, or cleavage, that help produce mature RNA.", link: "wiki:Post-transcriptional modification" },
        "RNA splicing": { text: "The removal of introns and joining of selected exons in an RNA transcript.", link: "https://www.genome.gov/genetics-glossary/RNA-Splicing" },
        "mature RNA": { text: "An RNA molecule after the processing steps needed for its cellular role have been completed.", link: "wiki:Post-transcriptional modification" },
        "noncoding RNA": { text: "An RNA molecule whose functional product is RNA rather than a translated protein.", link: "wiki:Non-coding RNA" }
      }
    },
    {
      name: "Building a protein",
      color: "amber",
      fact: "A ribosome reads codons during translation while transfer RNAs deliver amino acids, producing a chain that can fold into a protein.",
      terms: ["ribosome", "codon", "transfer RNA", "amino acid"],
      seeds: ["ribosome", "codon"],
      termInfo: {
        ribosome: { text: "The RNA-and-protein cellular machine that reads messenger RNA and synthesizes a polypeptide.", link: "https://www.genome.gov/genetics-glossary/Ribosome" },
        codon: { text: "A three-nucleotide unit in a coding sequence that specifies an amino acid or a stop signal.", link: "https://www.genome.gov/genetics-glossary/Codon" },
        "transfer RNA": { text: "An adaptor RNA that pairs an anticodon with a corresponding amino acid during translation.", link: "wiki:Transfer RNA" },
        "amino acid": { text: "One of the molecular building blocks joined into polypeptide chains.", link: "https://www.genome.gov/genetics-glossary/Amino-Acids" }
      }
    }
  ],
  bridges: [
    {
      term: "gene",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "A gene bridges stored sequence and RNA production: it is a genomic region whose expression produces a functional RNA, sometimes one that is later translated.",
      idealTerms: ["regulatory sequence", "transcription"],
      info: { text: "A basic unit of inheritance comprising a DNA sequence that contributes to a functional product.", link: "https://www.genome.gov/genetics-glossary/Gene" }
    },
    {
      term: "messenger RNA",
      clusters: [2, 3],
      relationKind: "dynamic",
      fact: "Messenger RNA carries a processed protein-coding transcript from transcription to the ribosome, where its codons are translated.",
      idealTerms: ["RNA processing", "ribosome"],
      direction: { kind: "through", from: 2, to: 3 },
      info: { text: "An RNA transcript whose nucleotide sequence can be translated into a protein.", link: "https://www.genome.gov/genetics-glossary/Messenger-RNA" }
    },
    {
      term: "gene expression",
      clusters: [0, 1, 3],
      relationKind: "dynamic",
      fact: "Gene expression spans regulated access to DNA, transcription and RNA processing, and—when the product is a protein—translation.",
      idealTerms: ["regulatory sequence", "transcription", "ribosome"],
      info: { text: "The regulated process by which information in a gene produces a functional RNA or protein product.", link: "https://www.genome.gov/genetics-glossary/Gene-Expression" }
    },
    {
      term: "translation",
      clusters: [2, 3],
      relationKind: "dynamic",
      fact: "Translation connects an RNA message to protein synthesis by decoding its codons into an amino-acid sequence.",
      idealTerms: ["RNA processing", "codon"],
      direction: { kind: "through", from: 2, to: 3 },
      info: { text: "The ribosome-mediated synthesis of a polypeptide using messenger RNA as the template.", link: "https://www.genome.gov/genetics-glossary/Translation" }
    }
  ]
};
