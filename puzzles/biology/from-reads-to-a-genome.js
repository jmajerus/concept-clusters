// Concept Clusters puzzle: from laboratory DNA measurements to an annotated genome.

export default {
  id: "from-reads-to-a-genome",
  title: "From reads to a genome",
  category: "Biology",
  subcategories: { Biology: "genomics" },
  tags: ["biology", "genomics", "DNA sequencing", "bioinformatics"],
  info: {
    text: "Sequencers usually measure fragments, not an intact chromosome from end to end. Reconstructing a useful genome therefore joins sample preparation and base calling to computational assembly, quality evidence, and biological annotation.",
    link: "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Fact-Sheet",
    citations: [
      {
        title: "DNA Sequencing Fact Sheet",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Fact-Sheet"
      },
      {
        title: "Long-Read DNA Sequencing",
        author: "National Human Genome Research Institute",
        url: "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing"
      },
      {
        title: "The NCBI Genome assembly data model",
        author: "National Center for Biotechnology Information",
        url: "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/"
      }
    ]
  },
  relatedPuzzles: {
    info: { text: "Place the sequencing workflow between molecular biology and the downstream interpretation of differences." },
    entries: [
      { id: "from-dna-to-gene-expression", reason: "Review what genomic sequences encode and how cells selectively use them." },
      { id: "reading-genetic-variation", reason: "Use reads and reference sequences to reason about genomic differences." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "measured-versus-inferred",
      prompt: "Which concepts are direct or near-direct instrument outputs, and which are computational reconstructions built from them?",
      targets: ["base calling", "base quality", "sequencing read", "contig", "scaffold", "genome assembly"],
      explanation: "Base calls and their quality scores form sequencing reads. Contigs, scaffolds, and the assembly are inferred by combining evidence across many reads.",
      reasons: {
        "base calling": "It converts the instrument signal into proposed nucleotide identities.",
        "base quality": "It expresses confidence in an individual proposed base call.",
        "sequencing read": "It is the fragmentary sequence record produced by the sequencing workflow.",
        contig: "It is a continuous consensus sequence reconstructed from overlapping evidence.",
        scaffold: "It orders and orients contigs while allowing unresolved gaps.",
        "genome assembly": "It is the larger reconstruction assembled from sequence evidence."
      }
    },
    {
      id: "why-more-data-can-help",
      prompt: "Which concepts explain why repeated and longer observations can make reconstruction more reliable?",
      targets: ["long read", "read overlap", "coverage", "consensus sequence", "scaffold"],
      explanation: "Overlaps and repeated coverage support a consensus, while long reads can span repeats that short fragments may not place uniquely.",
      reasons: {
        "long read": "A longer fragment can bridge sequence contexts separated by a repeat.",
        "read overlap": "Shared sequence provides evidence that fragments belong together.",
        coverage: "Repeated observations provide redundancy for consensus and confidence.",
        "consensus sequence": "It combines evidence across reads rather than trusting one measurement alone.",
        scaffold: "Longer-range evidence helps order and orient contigs across unresolved sequence."
      }
    },
    {
      id: "sequence-is-not-interpretation",
      prompt: "Which concepts turn reconstructed letters into hypotheses about biological structure or function?",
      targets: ["gene model", "repeat annotation", "functional annotation", "genome browser"],
      explanation: "An assembly supplies coordinates and sequence. Annotation predicts or records features and functions, while a genome browser lets evidence layers be inspected together.",
      reasons: {
        "gene model": "It proposes the exon, transcript, and coding structure of a gene.",
        "repeat annotation": "It marks repeated sequence families and their locations.",
        "functional annotation": "It associates a genomic feature with evidence about biological role.",
        "genome browser": "It displays sequence, annotations, and evidence tracks in their genomic context."
      }
    }
  ],
  clusters: [
    {
      name: "Generating fragmentary measurements",
      color: "teal",
      fact: "DNA is prepared as a sequencing library; an instrument detects signals, base calling translates them into letters, and quality scores record uncertainty.",
      terms: ["library preparation", "sequencing instrument", "base calling", "base quality"],
      seeds: ["library preparation", "base calling"],
      termInfo: {
        "library preparation": { text: "Preparing DNA fragments, often with platform-specific adapters, so they can be sequenced.", link: "wiki:DNA sequencing#Basic methods" },
        "sequencing instrument": { text: "A platform that measures physical or chemical signals associated with nucleotide sequence.", link: "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Fact-Sheet" },
        "base calling": { text: "The computational conversion of instrument signals into proposed nucleotide bases.", link: "wiki:Base calling" },
        "base quality": { text: "A score expressing estimated confidence in a nucleotide call, commonly represented on a Phred scale.", link: "wiki:Phred quality score" }
      }
    },
    {
      name: "Reconstructing longer sequence",
      color: "blue",
      fact: "Assembly algorithms use overlaps and other linking evidence to form continuous contigs, order them into scaffolds, and estimate a consensus sequence despite repeats and gaps.",
      terms: ["read overlap", "contig", "scaffold", "consensus sequence"],
      seeds: ["read overlap", "contig"],
      termInfo: {
        "read overlap": { text: "A matching sequence shared by reads that can support their placement relative to one another.", link: "wiki:Sequence assembly" },
        contig: { text: "A continuous assembled sequence with no internal gaps in its consensus representation.", link: "wiki:Contig" },
        scaffold: { text: "An ordered and oriented set of contigs whose intervening sequence may remain unresolved.", link: "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/" },
        "consensus sequence": { text: "A sequence estimate formed by combining evidence from multiple aligned or overlapping observations.", link: "wiki:Consensus sequence" }
      }
    },
    {
      name: "Annotating biological features",
      color: "amber",
      fact: "Annotation adds hypotheses and evidence about genes, repeats, and function to assembled coordinates; a genome browser presents those layers without making them identical to the sequence itself.",
      terms: ["gene model", "repeat annotation", "functional annotation", "genome browser"],
      seeds: ["gene model", "functional annotation"],
      termInfo: {
        "gene model": { text: "A representation of a gene's predicted or supported exon, transcript, and coding structure on an assembly.", link: "wiki:Gene prediction" },
        "repeat annotation": { text: "The identification and classification of repeated sequence elements in an assembled genome.", link: "wiki:Interspersed repeat" },
        "functional annotation": { text: "Associating genes or other features with evidence about products, roles, pathways, or homology.", link: "wiki:Genome annotation" },
        "genome browser": { text: "An interface for viewing sequence coordinates together with annotations and experimental evidence tracks.", link: "wiki:Genome browser" }
      }
    }
  ],
  bridges: [
    {
      term: "sequencing read",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "A sequencing read is the fragmentary sequence record passed from signal interpretation into alignment or assembly.",
      idealTerms: ["base calling", "read overlap"],
      direction: { kind: "through", from: 0, to: 1 },
      info: { text: "A nucleotide sequence inferred from one DNA fragment or molecule during a sequencing run.", link: "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing" }
    },
    {
      term: "coverage",
      clusters: [0, 1],
      relationKind: "evaluation",
      fact: "Coverage measures how much sequence evidence supports genomic positions; adequate depth helps distinguish a reproducible consensus from isolated measurement error.",
      idealTerms: ["base quality", "consensus sequence"],
      info: { text: "The amount of sequencing data covering a nucleotide or genome, often summarized as average depth.", link: "https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data" }
    },
    {
      term: "long read",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "Long-read technologies generate longer fragments that can span repeats and reduce ambiguity during assembly, though read length is only one dimension of data quality.",
      idealTerms: ["sequencing instrument", "scaffold"],
      info: { text: "A sequencing read thousands to hundreds of thousands of nucleotides long, depending on the technology and experiment.", link: "https://www.genome.gov/genetics-glossary/Long-Read-DNA-Sequencing" }
    },
    {
      term: "genome assembly",
      clusters: [1, 2],
      relationKind: "foundation",
      fact: "The assembly provides the sequence and coordinate framework on which gene, repeat, and functional annotations are placed.",
      idealTerms: ["scaffold", "gene model"],
      direction: { kind: "through", from: 1, to: 2 },
      info: { text: "A representation of an organism's genome reconstructed from sequence data, at contig, scaffold, chromosome, or complete-genome level.", link: "https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/data-model/" }
    }
  ]
};
