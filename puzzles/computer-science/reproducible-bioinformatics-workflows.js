// Concept Clusters puzzle: making multi-step biological analyses reproducible.

export default {
  id: "reproducible-bioinformatics-workflows",
  title: "Reproducible bioinformatics workflows",
  category: "Computer Science",
  categories: ["Computer Science", "Biology"],
  subcategories: { "Computer Science": "bioinformatics", Biology: "bioinformatics" },
  tags: ["bioinformatics", "workflows", "reproducibility", "provenance"],
  large: true,
  info: {
    text: "A script that ran once is not yet a reproducible analysis. Reproduction depends on identified inputs, explicit parameters, versioned software and reference data, recorded execution, validated outputs, and enough provenance to explain every result.",
    citations: [
      { title: "Why create workflows?", author: "EMBL-EBI Training", url: "https://www.ebi.ac.uk/training/online/courses/workflows-combining-tools-for-data-analysis/why-create-workflows/" },
      { title: "Creating tools for workflows", author: "EMBL-EBI Training", url: "https://www.ebi.ac.uk/training/online/courses/workflows-combining-tools-for-data-analysis/getting-data-from-resource-name/" }
    ]
  },
  relatedPuzzles: {
    info: { text: "Use reproducibility to connect biological records with sequence-analysis decisions." },
    entries: [
      { id: "when-biology-becomes-data", reason: "See why identifiers, schemas, and metadata are prerequisites for traceable inputs." },
      { id: "aligning-biological-sequences", reason: "Apply versioned databases, scoring parameters, and recorded outputs to sequence search." },
      { id: "from-reads-to-a-genome", reason: "Follow a representative multi-stage genomics analysis from raw reads through annotation." }
    ]
  },
  generativeAssistance: [
    { system: "Codex", provider: "OpenAI", scope: "puzzle", role: "drafted", date: "2026-08-09" }
  ],
  lenses: [
    {
      id: "what-must-be-fixed",
      prompt: "Which concepts identify the data and computational choices needed to repeat the same analysis?",
      targets: ["input manifest", "parameter set", "reference dataset", "dependency version", "environment lockfile", "container image"],
      explanation: "Inputs, parameters, references, dependencies, and runtime environments must all be identifiable before a run starts -- an environment lockfile and a container image are two different ways of pinning that runtime.",
      reasons: {
        "input manifest": "It enumerates the samples and files entering a run.",
        "parameter set": "It records choices that can alter tool behavior and results.",
        "reference dataset": "Its exact release or build can change coordinates and annotations.",
        "dependency version": "Different software releases can implement different behavior.",
        "environment lockfile": "It resolves requested dependencies to exact versions before a run starts.",
        "container image": "It packages a defined execution environment more completely than a tool name alone."
      }
    },
    {
      id: "automation-is-not-reproducibility",
      prompt: "Which concepts show why merely automating commands is insufficient for reproducibility?",
      targets: ["workflow definition", "dependency version", "run log", "checksum", "provenance", "quality-control checkpoint"],
      explanation: "Automation specifies steps, but reproduction also needs the software and data identities, execution record, integrity checks, lineage, and explicit criteria that determine whether a run is acceptable.",
      reasons: {
        "workflow definition": "It describes the dependency graph and commands but may not pin everything they use.",
        "dependency version": "Unpinned software can make the same commands behave differently.",
        "run log": "It records what actually happened rather than only what was intended.",
        checksum: "It detects silent substitution or corruption of an artifact.",
        provenance: "It connects each output to the inputs and transformations that produced it.",
        "quality-control checkpoint": "It makes acceptance criteria part of the process rather than an undocumented judgment."
      }
    },
    {
      id: "debugging-a-different-result",
      prompt: "Which concepts help locate why two nominally identical runs produced different outputs?",
      targets: ["parameter set", "reference dataset", "dependency version", "compute resource", "run log", "checksum"],
      explanation: "Differences can arise from parameters, reference releases, software, resource-dependent execution, or failures visible in logs; a checksum can confirm whether the runs' inputs were actually identical bytes in the first place.",
      reasons: {
        "parameter set": "It reveals configuration differences between runs.",
        "reference dataset": "It identifies changes in external biological knowledge or coordinates.",
        "dependency version": "It exposes implementation changes.",
        "compute resource": "Threads, memory, hardware, or distributed scheduling can affect some tools.",
        "run log": "It reveals warnings, retries, failures, and executed commands.",
        checksum: "It confirms or rules out the simplest explanation: that the two runs did not actually share identical inputs."
      }
    },
    {
      id: "declared-versus-observed-run",
      prompt: "Which concepts distinguish what an analysis was instructed to do from the record of what it actually produced?",
      targets: ["input manifest", "parameter set", "workflow definition", "run log", "intermediate artifact", "results manifest"],
      explanation: "Manifests, parameters, and workflow definitions declare intended inputs and work. Logs and artifacts record the realized execution, while the results manifest identifies the outputs that actually emerged.",
      reasons: {
        "input manifest": "It declares the samples and files intended to enter a run.",
        "parameter set": "It declares the configuration intended to govern tool behavior.",
        "workflow definition": "It declares tasks and their dependency structure.",
        "run log": "It records execution events, warnings, and failures that actually occurred.",
        "intermediate artifact": "It is tangible evidence produced during execution.",
        "results manifest": "It inventories the outputs associated with the completed run."
      }
    }
  ],
  clusters: [
    {
      name: "Defining an analysis",
      color: "teal",
      fact: "A reproducible analysis begins with an explicit input manifest, parameter set, reference dataset, and quality-control criteria rather than relying on filenames and remembered defaults.",
      terms: ["input manifest", "parameter set", "reference dataset", "quality-control checkpoint"],
      seeds: ["input manifest", "parameter set"],
      termInfo: {
        "input manifest": { text: "A structured inventory connecting sample identifiers with the files and attributes supplied to a run.", link: "wiki:Manifest file" },
        "parameter set": { text: "The explicit configuration values and thresholds supplied to tools in an analysis.", link: "wiki:Parameter (computer programming)" },
        "reference dataset": { text: "A versioned external sequence, annotation, or database used as a comparison or interpretation resource.", link: "wiki:Reference genome" },
        "quality-control checkpoint": { text: "A defined test and acceptance rule applied before downstream analysis proceeds or results are accepted.", link: "wiki:Quality control" }
      }
    },
    {
      name: "Fixing the software environment",
      color: "blue",
      fact: "Pinned dependency versions and environment lockfiles identify software, while a versioned container image captures a fuller runtime environment.",
      terms: ["dependency version", "environment lockfile", "container image"],
      seeds: ["dependency version", "container image"],
      termInfo: {
        "dependency version": { text: "The precise release or revision of a tool or library required by an analysis.", link: "wiki:Software versioning" },
        "environment lockfile": { text: "A machine-readable record that resolves requested software dependencies to exact versions or artifacts.", link: "wiki:Package manager" },
        "container image": { text: "A versioned package of filesystem and runtime dependencies used to create consistent execution environments.", link: "wiki:Containerization (computing)" }
      }
    },
    {
      name: "Orchestrating execution",
      color: "cyan",
      fact: "A workflow definition connects tasks; task dependencies establish order, resource declarations expose computational needs, and retry policy defines how selected failures are handled.",
      terms: ["workflow definition", "task dependency", "compute resource", "retry policy"],
      seeds: ["workflow definition", "task dependency"],
      termInfo: {
        "workflow definition": { text: "A machine-readable description of analysis tasks, dependencies, inputs, outputs, and execution rules.", link: "wiki:Scientific workflow system" },
        "task dependency": { text: "A declared relationship requiring one task or its outputs to be ready before another task can run.", link: "wiki:Dependency graph" },
        "compute resource": { text: "Declared CPU, memory, storage, accelerator, or scheduling requirements for a task.", link: "wiki:Computational resource" },
        "retry policy": { text: "A rule specifying which failed tasks may be attempted again, how often, and under what conditions.", link: "wiki:Fault tolerance" }
      }
    },
    {
      name: "Recording what happened",
      color: "amber",
      fact: "Run logs record execution, checksums verify artifact identity, intermediate outputs support diagnosis, and a results manifest identifies the products delivered by a particular run.",
      terms: ["run log", "checksum", "intermediate artifact", "results manifest"],
      seeds: ["run log", "checksum"],
      termInfo: {
        "run log": { text: "A timestamped record of commands, status, warnings, errors, and other events from an execution.", link: "wiki:Logging (computing)" },
        checksum: { text: "A digest calculated from data and used to detect whether an artifact's bytes differ.", link: "wiki:Checksum" },
        "intermediate artifact": { text: "A file or dataset produced between final endpoints that can support caching, inspection, and fault diagnosis.", link: "wiki:Intermediate representation" },
        "results manifest": { text: "A structured inventory of the outputs, identifiers, and integrity information associated with a completed run.", link: "wiki:Manifest file" }
      }
    }
  ],
  bridges: [
    {
      term: "workflow engine",
      clusters: [0, 1, 2],
      relationKind: "dynamic",
      fact: "A workflow engine interprets the declared analysis graph, schedules ready tasks, passes identified inputs and parameters, and manages failures or retries on available resources.",
      idealTerms: ["input manifest", "container image", "workflow definition"],
      info: { text: "Software that resolves task dependencies and coordinates execution of a computational workflow.", link: "wiki:Workflow management system" }
    },
    {
      term: "version control",
      clusters: [0, 1, 2],
      relationKind: "continuity",
      fact: "Version control connects analysis intent to implementation history by preserving changes to workflow definitions, configuration, and supporting code—though large data artifacts need separate versioning strategies.",
      idealTerms: ["parameter set", "dependency version", "workflow definition"],
      info: { text: "A system for recording and identifying changes to files such as code, workflow definitions, and configuration.", link: "wiki:Version control" }
    },
    {
      term: "provenance",
      clusters: [0, 1, 3],
      relationKind: "cross-cutting",
      fact: "Provenance joins declared inputs and parameters, the software and environment actually executed, and the artifacts produced into an inspectable lineage for each result.",
      idealTerms: ["reference dataset", "dependency version", "results manifest"],
      info: { text: "Structured lineage describing the entities, activities, software, and relationships that produced a data result.", link: "wiki:Data lineage" }
    }
  ]
};
