// Concept Clusters puzzle: representing biological observations as reusable data.

export default {
  id: "when-biology-becomes-data",
  title: "When biology becomes data",
  category: "Biology",
  categories: ["Biology", "Computer Science"],
  subcategories: { Biology: "bioinformatics", "Computer Science": "bioinformatics" },
  tags: ["bioinformatics", "biological data", "file formats", "metadata"],
  info: {
    text: "Computational biology begins before an algorithm runs. A specimen and assay must remain connected to encoded measurements, stable identifiers, coordinate conventions, and metadata—or a technically valid file can lose its biological meaning.",
    link: "wiki:Bioinformatics",
    citations: [
      { title: "Exploring biological sequences", author: "EMBL-EBI Training", url: "https://www.ebi.ac.uk/training/events/exploring-biological-sequences/" },
      { title: "Principles of research data management", author: "EMBL-EBI Training", year: "2025", url: "https://www.ebi.ac.uk/training/events/principles-research-data-management/" }
    ]
  },
  relatedPuzzles: {
    info: { text: "Follow structured biological records into sequence comparison and reproducible analysis." },
    entries: [
      { id: "aligning-biological-sequences", reason: "See how algorithms compare encoded nucleotide or protein sequences." },
      { id: "reproducible-bioinformatics-workflows", reason: "Track data, parameters, software, and provenance through a complete analysis." },
      { id: "from-reads-to-a-genome", reason: "Apply formats, coordinates, and metadata to sequencing and assembly." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "measurement-versus-description",
      prompt: "Which concepts distinguish a physical source and measurement process from the data used to describe them?",
      targets: ["specimen", "assay", "nucleotide sequence", "quality score", "metadata", "provenance"],
      explanation: "A specimen is acted on by an assay, which produces measurements such as sequence calls and quality scores. Metadata and provenance describe the biological and procedural setting needed to interpret those measurements.",
      reasons: {
        specimen: "It is the physical biological source from which material is taken.",
        assay: "It is the procedure that produces observations or measurements.",
        "nucleotide sequence": "It is an encoded measurement or inferred molecular sequence.",
        "quality score": "It records estimated confidence in a measurement or call.",
        metadata: "It describes the sample, experiment, and data rather than being the primary measurement.",
        provenance: "It records where data came from and how they were transformed."
      }
    },
    {
      id: "each-format-adds-one-thing",
      prompt: "Which concepts form a sequence of formats that each preserve more than the one before it?",
      targets: ["FASTA", "FASTQ", "SAM/BAM", "VCF"],
      explanation: "Each format keeps what the previous one already recorded and adds exactly one more thing worth preserving: FASTQ keeps FASTA's sequence and adds a per-base quality value, SAM/BAM keeps that and adds where each read aligns, and VCF sets the read-level detail aside to instead record a difference from a reference.",
      reasons: {
        FASTA: "It is the baseline: a named sequence with no quality, alignment, or reference-relative information yet attached.",
        FASTQ: "It adds a per-base quality value on top of everything FASTA already records.",
        "SAM/BAM": "It adds alignment position and mapping information on top of a read's sequence and quality.",
        VCF: "It represents a difference from a reference coordinate, a distinct kind of record that presumes alignment already happened."
      }
    },
    {
      id: "three-ways-to-stay-joinable",
      prompt: "Which concepts keep records connected across files and repositories through exact identity, which do it through consistent vocabulary, and which do it by recording context or history instead?",
      targets: ["accession", "sample identifier", "controlled vocabulary", "metadata", "provenance"],
      explanation: "Accession and sample identifier both link by exact reference, but to different things -- a deposited record versus the biological sample behind it. Controlled vocabulary instead keeps equivalent concepts findable despite different local wording. Metadata and provenance take a third route, supplying the surrounding context and processing history a bare identifier or term can't carry.",
      reasons: {
        accession: "It links by exact reference to a deposited database record.",
        "sample identifier": "It links by exact reference to the biological sample a measurement came from, a different anchor than accession.",
        "controlled vocabulary": "It keeps equivalent concepts findable across sources through shared terms rather than a shared identifier.",
        metadata: "It supplies the searchable biological and experimental context an identifier or term alone doesn't carry.",
        provenance: "It supplies processing history -- a record's origins and transformations -- rather than identity or vocabulary."
      }
    }
  ],
  clusters: [
    {
      name: "From material to measurement",
      color: "teal",
      fact: "A specimen supplies biological material, an assay measures it, sequence calls encode molecular letters, and quality scores retain uncertainty in those calls.",
      terms: ["specimen", "assay", "nucleotide sequence", "quality score"],
      seeds: ["specimen", "assay"],
      termInfo: {
        specimen: { text: "A physical biological sample or portion of an organism used for observation or testing.", link: "wiki:Biological specimen" },
        assay: { text: "A laboratory procedure that measures the presence, amount, activity, or sequence of a biological target.", link: "wiki:Assay" },
        "nucleotide sequence": { text: "An ordered representation of nucleotide bases in DNA or RNA.", link: "wiki:Nucleic acid sequence" },
        "quality score": { text: "A numerical estimate of confidence in a measurement, such as the probability that a sequenced base was called incorrectly.", link: "wiki:Phred quality score" }
      }
    },
    {
      name: "Encoding common sequence records",
      color: "blue",
      fact: "Bioinformatics formats preserve different information: FASTA stores sequences, FASTQ adds qualities, SAM/BAM stores alignments, and VCF records variants against a reference.",
      terms: ["FASTA", "FASTQ", "SAM/BAM", "VCF"],
      seeds: ["FASTA", "FASTQ"],
      termInfo: {
        FASTA: { text: "A text format with a description line followed by nucleotide or amino-acid sequence.", link: "wiki:FASTA format" },
        FASTQ: { text: "A text format that stores each sequencing read together with a corresponding string of base-quality values.", link: "wiki:FASTQ format" },
        "SAM/BAM": { text: "Related text and binary formats for sequence alignments and associated fields.", link: "https://samtools.github.io/hts-specs/SAMv1.pdf" },
        VCF: { text: "A tabular format for genomic variant records, genotypes, filters, and annotations relative to a reference.", link: "https://samtools.github.io/hts-specs/VCFv4.5.pdf" }
      }
    },
    {
      name: "Preserving identity and context",
      color: "amber",
      fact: "Stable accessions, descriptive metadata, controlled vocabularies, and provenance make biological records findable, connectable, and interpretable beyond the laboratory that created them.",
      terms: ["accession", "metadata", "controlled vocabulary", "provenance"],
      seeds: ["accession", "metadata"],
      termInfo: {
        accession: { text: "A stable identifier assigned to a record deposited in a biological data resource.", link: "wiki:Accession number (bioinformatics)" },
        metadata: { text: "Structured information describing a sample, experiment, file, or dataset and the context in which it was produced.", link: "wiki:Metadata" },
        "controlled vocabulary": { text: "An agreed set of terms used consistently so records can be searched and combined across sources.", link: "wiki:Controlled vocabulary" },
        provenance: { text: "A trace of data origins, transformations, software, and decisions leading to a result.", link: "wiki:Data lineage" }
      }
    }
  ],
  bridges: [
    {
      term: "sample identifier",
      clusters: [0, 2],
      relationKind: "foundation",
      fact: "A sample identifier connects encoded measurements and metadata back to the same biological source, provided its scope and assignment remain unambiguous.",
      idealTerms: ["specimen", "metadata"],
      info: { text: "An identifier used to connect data records with the biological sample from which they were derived.", link: "wiki:Sample (material)" }
    },
    {
      term: "coordinate system",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "A coordinate system connects a biological position to its file representation; reference version, indexing convention, and interval boundaries must agree before positions can be safely compared.",
      idealTerms: ["nucleotide sequence", "VCF"],
      info: { text: "The reference and indexing conventions used to identify positions or intervals in a biological sequence.", link: "wiki:Genome coordinate system" }
    },
    {
      term: "schema",
      clusters: [1, 2],
      relationKind: "cross-cutting",
      fact: "A schema makes the fields and relationships in a record explicit, allowing software to validate structure while metadata supplies the domain meaning of those fields.",
      idealTerms: ["SAM/BAM", "controlled vocabulary"],
      info: { text: "A formal description of the fields, types, constraints, and relationships expected in structured data.", link: "wiki:Database schema" }
    }
  ]
};
