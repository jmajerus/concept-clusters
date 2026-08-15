// Concept Clusters puzzle: algorithms and evidence in biological sequence comparison.

export default {
  id: "aligning-biological-sequences",
  title: "Aligning biological sequences",
  category: "Computer Science",
  categories: ["Computer Science", "Biology"],
  subcategories: { "Computer Science": "bioinformatics", Biology: "bioinformatics" },
  tags: ["bioinformatics", "sequence alignment", "algorithms", "BLAST"],
  info: {
    text: "An alignment is an algorithmically scored correspondence between sequences. Database search makes that comparison scalable, but similarity remains evidence to interpret—not automatic proof of common ancestry, identical function, or biological importance.",
    link: "https://www.ebi.ac.uk/training/online/courses/guide-to-sequence-analysis-tools/introduction",
    citations: [
      { title: "A guide to sequence analysis tools", author: "EMBL-EBI Training", url: "https://www.ebi.ac.uk/training/online/courses/guide-to-sequence-analysis-tools/introduction" },
      { title: "Basic Local Alignment Search Tool", author: "National Center for Biotechnology Information", url: "https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Web&PAGE_TYPE=BlastHomeNew" }
    ]
  },
  relatedPuzzles: {
    info: { text: "Connect alignment algorithms to the records they consume and the workflows that operationalize them." },
    entries: [
      { id: "when-biology-becomes-data", reason: "Understand the sequence formats, identifiers, and context supplied to comparison tools." },
      { id: "reproducible-bioinformatics-workflows", reason: "See how database versions, parameters, and software versions change a repeatable search." },
      { id: "reading-genetic-variation", reason: "Apply alignment as evidence for calling genomic differences." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "what-defines-an-alignment",
      prompt: "Which concepts determine how a candidate alignment is constructed and scored?",
      targets: ["match", "mismatch", "gap penalty", "substitution matrix", "global alignment", "local alignment"],
      explanation: "Matches, mismatches, gaps, and substitution scores define the scoring objective; global and local alignment are the two constructions an algorithm can search for under that objective, spanning the full sequences or only their strongest matching subsections.",
      reasons: {
        match: "It rewards placing compatible sequence symbols together.",
        mismatch: "It assigns a cost or score to unlike symbols.",
        "gap penalty": "It controls the cost of introducing insertions or deletions into an alignment.",
        "substitution matrix": "For proteins, it scores replacements according to observed or modeled interchangeability.",
        "global alignment": "It constructs a correspondence across the full length of both sequences.",
        "local alignment": "It constructs the best matching subsections rather than forcing an end-to-end correspondence."
      }
    },
    {
      id: "speed-versus-guarantee",
      prompt: "Which concepts distinguish exact optimization from shortcuts used to search large databases quickly?",
      targets: ["dynamic programming", "heuristic search", "seed-and-extend", "database", "bit score", "E-value"],
      explanation: "Exact dynamic programming can be costly at database scale. Heuristic seed-and-extend search quickly finds promising regions, after which scores and E-values help rank and assess reported matches.",
      reasons: {
        "dynamic programming": "It can guarantee an optimum under the chosen scoring model for a sequence pair.",
        "heuristic search": "It trades exhaustive guarantees for practical speed.",
        "seed-and-extend": "It begins from short promising matches rather than evaluating every full alignment.",
        database: "Its size makes exhaustive pairwise comparison expensive and also affects expected random matches.",
        "bit score": "It normalizes alignment strength for comparison under a scoring system.",
        "E-value": "It estimates how many matches of comparable score would be expected by chance in the search."
      }
    },
    {
      id: "similarity-is-evidence",
      prompt: "Which concepts help separate observed sequence resemblance from biological conclusions drawn from it?",
      targets: ["percent identity", "E-value", "sequence homology", "substitution matrix", "query", "database"],
      explanation: "Identity and statistical significance describe a comparison under chosen inputs and scoring assumptions. Homology is an evolutionary hypothesis informed by that evidence, not a percentage or a synonym for similarity.",
      reasons: {
        "percent identity": "It reports identical aligned positions but does not by itself establish ancestry or function.",
        "E-value": "It contextualizes a score under a database search model rather than proving biological meaning.",
        "sequence homology": "It is a claim of shared ancestry evaluated from multiple kinds of evidence.",
        "substitution matrix": "Its biological model influences which protein similarities receive high scores.",
        query: "The chosen input determines what relationship is being investigated.",
        database: "Database composition determines which comparisons and background opportunities exist."
      }
    }
  ],
  clusters: [
    {
      name: "Scoring a correspondence",
      color: "teal",
      fact: "An alignment score combines rewards for matches with costs for mismatches and gaps; protein alignments often use substitution matrices to distinguish conservative from unlikely replacements.",
      terms: ["match", "mismatch", "gap penalty", "substitution matrix"],
      seeds: ["match", "gap penalty"],
      termInfo: {
        match: { text: "An aligned pair of identical or otherwise compatible sequence symbols that contributes positively to a score.", link: "wiki:Sequence alignment" },
        mismatch: { text: "An aligned pair of different symbols, assigned a score or penalty by the alignment model.", link: "wiki:Sequence alignment" },
        "gap penalty": { text: "The scoring cost for opening or extending a gap representing an insertion or deletion.", link: "wiki:Gap penalty" },
        "substitution matrix": { text: "A table assigning scores to possible amino-acid or nucleotide substitutions.", link: "wiki:Substitution matrix" }
      }
    },
    {
      name: "Choosing a comparison strategy",
      color: "blue",
      fact: "Global alignment compares sequences end to end, local alignment finds strong subsections, dynamic programming optimizes a defined score, and heuristic search sacrifices exhaustive guarantees for scale.",
      terms: ["global alignment", "local alignment", "dynamic programming", "heuristic search"],
      seeds: ["global alignment", "local alignment"],
      termInfo: {
        "global alignment": { text: "An alignment that seeks a correspondence across the full lengths of both sequences.", link: "wiki:Needleman–Wunsch algorithm" },
        "local alignment": { text: "An alignment that finds the highest-scoring pair of subsequences within longer inputs.", link: "wiki:Smith–Waterman algorithm" },
        "dynamic programming": { text: "An optimization method that solves an alignment by combining solutions to overlapping subproblems.", link: "wiki:Dynamic programming" },
        "heuristic search": { text: "A faster search strategy that prioritizes promising candidates without exhaustively evaluating every possible alignment.", link: "wiki:Heuristic (computer science)" }
      }
    },
    {
      name: "Reading a database search",
      color: "amber",
      fact: "A search compares a query with database sequences and reports alignments using measures such as bit score and E-value; the result depends on both the algorithm and the searched database.",
      terms: ["query", "database", "bit score", "E-value"],
      seeds: ["query", "E-value"],
      termInfo: {
        query: { text: "The nucleotide or protein sequence submitted for comparison against other sequences.", link: "https://www.ncbi.nlm.nih.gov/books/NBK1734/" },
        database: { text: "The selected collection of subject sequences against which a query is searched.", link: "wiki:Biological database" },
        "bit score": { text: "A normalized alignment score that allows comparisons across searches using related scoring systems.", link: "https://www.ncbi.nlm.nih.gov/books/NBK62051/" },
        "E-value": { text: "The number of matches with at least a given score expected by chance under the search model and database size.", link: "https://www.ncbi.nlm.nih.gov/books/NBK62051/" }
      }
    }
  ],
  bridges: [
    {
      term: "percent identity",
      clusters: [0, 2],
      relationKind: "evaluation",
      fact: "Percent identity summarizes exact symbol matches within the reported alignment, but changes with alignment boundaries and does not measure biological function or ancestry by itself.",
      idealTerms: ["match", "bit score"],
      info: { text: "The percentage of aligned positions containing identical symbols, calculated over a specified alignment length.", link: "wiki:Sequence identity" }
    },
    {
      term: "seed-and-extend",
      clusters: [1, 2],
      relationKind: "dynamic",
      fact: "Seed-and-extend bridges heuristic strategy and database search by locating short promising matches before expanding and scoring their surrounding regions.",
      idealTerms: ["heuristic search", "database"],
      direction: { kind: "through", from: 1, to: 2 },
      info: { text: "A search strategy that finds short seed matches and extends the promising ones into longer alignments.", link: "https://www.ncbi.nlm.nih.gov/books/NBK20261/" }
    },
    {
      term: "sequence homology",
      clusters: [0, 1, 2],
      relationKind: "cross-cutting",
      fact: "Homology is shared evolutionary ancestry inferred from evidence that can include alignment, statistical support, domains, structure, and phylogeny; sequences are homologous or not, not a percentage homologous.",
      idealTerms: ["substitution matrix", "local alignment", "E-value"],
      info: { text: "A relationship of common evolutionary ancestry between biological sequences or structures.", link: "wiki:Sequence homology" }
    }
  ]
};
