// Concept Clusters puzzle: detecting and interpreting genomic variation.

export default {
  id: "reading-genetic-variation",
  title: "Reading genetic variation",
  category: "Biology",
  subcategories: { Biology: "genomics" },
  tags: ["biology", "genomics", "genetic variation", "variant interpretation"],
  large: true,
  info: {
    text: "A genomic difference is first described, then supported—or rejected—by sequence evidence, and only then interpreted in population, functional, or clinical context. A variant is not automatically harmful, and a reference sequence is a coordinate system for comparison rather than a universal biological norm.",
    link: "https://www.genome.gov/genetics-glossary/Polymorphism",
    citations: [
      {
        title: "Talking Glossary of Genomic and Genetic Terms",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/genetics-glossary"
      },
      {
        title: "Human Genome Reference Sequence",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/genetics-glossary/human-genome-reference-sequence"
      },
      {
        title: "Genome bioinformatics: resequencing and variant calling",
        author: "EMBL-EBI Training",
        year: "2023",
        url: "https://www.ebi.ac.uk/training/materials/genome-bioinformatics-resequencing-and-variant-calling-materials"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Connect variant interpretation to the molecular processes and sequencing evidence beneath it." },
    entries: [
      { id: "from-dna-to-gene-expression", reason: "See how a sequence change might intersect with regulation, RNA, or protein production." },
      { id: "from-reads-to-a-genome", reason: "Review where the read, alignment, assembly, and reference evidence comes from." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "description-evidence-interpretation",
      prompt: "Which concepts belong primarily to describing a difference, supporting a call, or interpreting its possible significance?",
      targets: ["single-nucleotide variant", "structural variant", "allele depth", "genotype quality", "predicted consequence", "classification"],
      explanation: "Variant types describe sequence differences; depth and quality support an inferred call; consequence, phenotype evidence, and classification interpret what the difference may mean.",
      reasons: {
        "single-nucleotide variant": "It describes a difference at one nucleotide position.",
        "structural variant": "It describes a larger rearrangement or copy-number difference.",
        "allele depth": "It counts read evidence supporting observed alleles.",
        "genotype quality": "It summarizes confidence in the inferred genotype.",
        "predicted consequence": "It estimates how the variant intersects a transcript or protein feature.",
        classification: "It records a conclusion made under an evidence framework."
      }
    },
    {
      id: "not-a-universal-normal",
      prompt: "Which concepts guard against treating one reference or the most common allele as a universal definition of normal?",
      targets: ["reference sequence", "allele frequency", "pangenome", "classification"],
      explanation: "Reference sequence and frequency are comparison tools, not verdicts. Population context affects observed frequency, pangenomes represent broader diversity, and classification requires additional evidence.",
      reasons: {
        "reference sequence": "It provides coordinates and a comparison baseline, not a universal ideal genome.",
        "allele frequency": "Commonness or rarity alone does not establish biological effect.",
        pangenome: "It represents genomic diversity using sequences from many individuals.",
        classification: "A defensible conclusion integrates multiple evidence types rather than reference status alone."
      }
    },
    {
      id: "uncertainty-at-every-stage",
      prompt: "Which concepts make uncertainty visible from read evidence through biological interpretation?",
      targets: ["allele depth", "genotype quality", "variant caller", "predicted consequence", "phenotype evidence", "classification"],
      explanation: "Read support may be uneven, genotype confidence is estimated, callers use models and thresholds, consequences are predictions, phenotype evidence may be incomplete, and classifications can remain uncertain or change with new evidence.",
      reasons: {
        "allele depth": "Limited or imbalanced read support can weaken a call.",
        "genotype quality": "It explicitly scores confidence in a genotype inference.",
        "variant caller": "Its model, filters, and assumptions affect which candidates are reported.",
        "predicted consequence": "It is an annotation-based prediction, not direct proof of effect.",
        "phenotype evidence": "Observed associations may be incomplete, variable, or confounded.",
        classification: "It may be uncertain and is revisable when the evidence changes."
      }
    }
  ],
  clusters: [
    {
      name: "Describing sequence differences",
      color: "teal",
      fact: "Variants range from single-nucleotide substitutions and small insertions or deletions to larger structural changes such as inversions, duplications, and translocations.",
      terms: ["single-nucleotide variant", "insertion", "deletion", "structural variant"],
      seeds: ["single-nucleotide variant", "structural variant"],
      termInfo: {
        "single-nucleotide variant": { text: "A difference at one nucleotide position relative to a comparison sequence.", link: "wiki:Single-nucleotide variant" },
        insertion: { text: "One or more nucleotides present in a sequence relative to the selected reference representation.", link: "https://www.genome.gov/genetics-glossary/Insertion" },
        deletion: { text: "One or more nucleotides absent from a sequence relative to the selected reference representation.", link: "https://www.genome.gov/genetics-glossary/Deletion" },
        "structural variant": { text: "A larger genomic difference, commonly at least 50 bases, such as a deletion, insertion, inversion, duplication, or translocation.", link: "https://www.genome.gov/genetics-glossary/Structural-Variation" }
      }
    },
    {
      name: "Collecting read evidence",
      color: "blue",
      fact: "Reads are aligned to a reference, their mapping confidence is assessed, and allele depth records how many observations support each sequence at a site.",
      terms: ["read alignment", "mapping quality", "allele depth"],
      seeds: ["read alignment", "allele depth"],
      termInfo: {
        "read alignment": { text: "The placement of sequencing reads against a reference representation to identify likely corresponding positions.", link: "wiki:Sequence alignment" },
        "mapping quality": { text: "A Phred-scaled estimate of confidence that a read has been aligned to the correct reference location.", link: "https://samtools.github.io/hts-specs/SAMv1.pdf" },
        "allele depth": { text: "The number of reads at a site supporting each observed allele.", link: "https://samtools.github.io/hts-specs/VCFv4.5.pdf" }
      }
    },
    {
      name: "Inferring and filtering genotypes",
      color: "cyan",
      fact: "A variant caller uses an evidence model to compare possible genotypes, reports confidence, and applies or exposes filters that distinguish usable calls from weak candidates.",
      terms: ["variant caller", "genotype likelihood", "genotype quality", "call filter"],
      seeds: ["variant caller", "genotype quality"],
      termInfo: {
        "variant caller": { text: "Software that uses sequencing evidence and a statistical model to identify candidate variants and often infer genotypes.", link: "https://www.ebi.ac.uk/training/materials/genome-bioinformatics-resequencing-and-variant-calling-materials" },
        "genotype likelihood": { text: "The probability of the observed sequencing evidence under each candidate genotype, expressed directly or on a log scale.", link: "https://samtools.github.io/hts-specs/VCFv4.5.pdf" },
        "genotype quality": { text: "A Phred-scaled estimate of confidence in the genotype assigned to a sample at a site.", link: "https://samtools.github.io/hts-specs/VCFv4.5.pdf" },
        "call filter": { text: "A recorded criterion or model decision used to flag candidate calls that do not meet evidence or quality requirements.", link: "https://samtools.github.io/hts-specs/VCFv4.5.pdf" }
      }
    },
    {
      name: "Interpreting possible significance",
      color: "amber",
      fact: "Interpretation combines population frequency, predicted molecular consequence, phenotype evidence, and an explicit evidence framework; no single ingredient automatically proves pathogenicity.",
      terms: ["allele frequency", "predicted consequence", "phenotype evidence", "classification"],
      seeds: ["allele frequency", "predicted consequence"],
      termInfo: {
        "allele frequency": { text: "The proportion of sampled chromosome copies carrying a particular allele in a population or dataset.", link: "wiki:Allele frequency" },
        "predicted consequence": { text: "An annotation of how a variant may intersect a gene, transcript, regulatory feature, or protein sequence.", link: "https://www.ebi.ac.uk/training/online/courses/ensembl-variant-effect-predictor-vep/" },
        "phenotype evidence": { text: "Observations connecting a genotype with traits, clinical findings, or segregation patterns in individuals or families.", link: "wiki:Phenotype" },
        classification: { text: "A conclusion, such as benign, uncertain, or pathogenic in a clinical setting, assigned according to a defined evidence framework.", link: "https://www.ncbi.nlm.nih.gov/clinvar/docs/clinsig/" }
      }
    }
  ],
  bridges: [
    {
      term: "reference sequence",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "Variant descriptions and read alignments are relative to a specified reference representation, which supplies coordinates and comparison alleles rather than a universal standard of normality.",
      idealTerms: ["deletion", "read alignment"],
      info: { text: "An accepted sequence representation used as a coordinate framework and comparison baseline for genomic analyses.", link: "https://www.genome.gov/genetics-glossary/human-genome-reference-sequence" }
    },
    {
      term: "genotype",
      clusters: [2, 3],
      relationKind: "evaluation",
      fact: "A genotype is inferred from sequence evidence at a locus and then becomes one input to population, trait, or clinical interpretation.",
      idealTerms: ["genotype quality", "phenotype evidence"],
      direction: { kind: "through", from: 2, to: 3 },
      info: { text: "The allele or combination of alleles inferred for an individual at a genomic location.", link: "https://www.genome.gov/genetics-glossary/genotype" }
    },
    {
      term: "variant annotation",
      clusters: [0, 3],
      relationKind: "evaluation",
      fact: "Variant annotation connects a described sequence difference with genes, transcripts, population databases, and predicted consequences, but the annotation itself is not proof of biological effect.",
      idealTerms: ["single-nucleotide variant", "predicted consequence"],
      direction: { kind: "through", from: 0, to: 3 },
      info: { text: "The process of attaching genomic context and evidence, such as affected features or population frequency, to a variant.", link: "wiki:Variant annotation" }
    },
    {
      term: "pangenome",
      clusters: [0, 1, 3],
      relationKind: "cross-cutting",
      fact: "A pangenome represents sequences from many individuals, broadening the reference framework used to detect and interpret genomic diversity.",
      idealTerms: ["structural variant", "read alignment", "allele frequency"],
      info: { text: "A collection of genome sequences from many individuals of the same species, designed to represent broader genomic diversity.", link: "https://www.genome.gov/genetics-glossary/Pangenome" }
    }
  ]
};
