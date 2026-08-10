// Concept Clusters puzzle: what turns a language experiment into a durable tool.

export default {
  id: "from-research-language-to-production",
  title: "From research language to production",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "programming-languages"
  },
  tags: ["programming languages", "language research", "software ecosystems"],
  info: {
    text: "A compelling language idea is only the beginning: production adoption also depends on evidence, developer tools, libraries, interoperability, and a credible promise that today's programs will keep working.",
    link: "wiki:Programming language implementation",
    citations: [
      {
        title: "The Koka Programming Language",
        author: "Daan Leijen and contributors",
        url: "https://koka-lang.github.io/koka/doc/book.html"
      },
      {
        title: "Go 1 and the Future of Go Programs",
        author: "The Go project",
        url: "https://go.dev/doc/go1compat"
      },
      {
        title: "What are editions?",
        author: "The Rust project",
        url: "https://doc.rust-lang.org/edition-guide/editions/"
      }
    ]
  },
  relatedPuzzles: {
    info: {
      text: "Compare language design, research exploration, and the engineering needed for sustained use."
    },
    entries: [
      {
        id: "research-languages-and-future-directions",
        reason: "See the effect, specification, and resource ideas that current research languages make concrete."
      },
      {
        id: "language-design-choices",
        reason: "Compare the type, execution, and memory commitments that users eventually experience as a language's design."
      },
      {
        id: "designing-for-programmer-ergonomics",
        reason: "Focus on the syntax, feedback loops, and change-management choices that determine how a language feels in daily use."
      },
      {
        id: "where-failures-stop",
        reason: "See how production readiness depends on tested recovery paths and containment, not only a language's representation of errors."
      }
    ]
  },
  generativeAssistance: [
    {
      system: "Codex",
      provider: "OpenAI",
      scope: "puzzle",
      role: "drafted",
      date: "2026-08-09"
    }
  ],
  lenses: [
    {
      id: "evidence-before-adoption",
      prompt: "Which concepts provide evidence that the language idea is coherent and can actually be implemented?",
      targets: ["formal semantics", "soundness argument", "reference compiler", "benchmark suite", "implementation strategy"],
      explanation: "Semantics and soundness explain the design, a reference compiler makes it executable, benchmarks test important costs, and an implementation strategy connects the claims to a realizable system.",
      reasons: {
        "formal semantics": "It states the language's behavior precisely enough to analyze.",
        "soundness argument": "It connects static rules to the runtime failures they are intended to prevent.",
        "reference compiler": "It demonstrates that programs can be checked and executed.",
        "benchmark suite": "It tests whether the implementation meets relevant performance claims on chosen workloads.",
        "implementation strategy": "It links the abstract design to concrete compilation or runtime techniques."
      }
    },
    {
      id: "lowering-adoption-cost",
      prompt: "Which concepts most directly reduce the effort required for developers and existing projects to adopt a language?",
      targets: ["actionable diagnostics", "language server", "package manager", "foreign-function interface", "migration tooling", "production readiness"],
      explanation: "Developers need help writing and debugging code, obtaining dependencies, calling existing systems, and moving old code forward. Together these capabilities make adoption operational rather than merely interesting.",
      reasons: {
        "actionable diagnostics": "They turn rejection by the compiler into guidance a developer can act on.",
        "language server": "It brings navigation, completion, and feedback into everyday editing.",
        "package manager": "It makes reusable libraries discoverable and installable through a shared workflow.",
        "foreign-function interface": "It allows adoption without rewriting every dependency first.",
        "migration tooling": "It automates part of the move from an older language version or codebase.",
        "production readiness": "This bridge names the point at which the surrounding experience is dependable enough for sustained use."
      }
    },
    {
      id: "keeping-old-code-working",
      prompt: "Which concepts help a language evolve without making every user migrate at once?",
      targets: ["stable specification", "backward compatibility", "versioned editions", "migration tooling", "foreign-function interface"],
      explanation: "A stable specification and compatibility policy protect existing code; versioned editions and migration tools stage intentional change; interoperability lets old and new components continue to cooperate.",
      reasons: {
        "stable specification": "It provides a durable public account of accepted programs and their meaning.",
        "backward compatibility": "It commits maintainers to preserving supported existing code where promised.",
        "versioned editions": "They let projects opt into selected language changes on their own schedule.",
        "migration tooling": "It mechanically updates code for changes that cannot remain invisible.",
        "foreign-function interface": "It allows new language components to remain connected to systems written elsewhere."
      }
    }
  ],
  clusters: [
    {
      name: "Establishing the idea",
      color: "teal",
      fact: "A research language makes an idea inspectable through precise semantics, an argument for its guarantees, a working compiler, and measurements that expose both benefits and costs.",
      terms: ["formal semantics", "soundness argument", "reference compiler", "benchmark suite"],
      seeds: ["reference compiler", "benchmark suite"],
      termInfo: {
        "formal semantics": {
          text: "A mathematical account of how language constructs evaluate or otherwise acquire meaning.",
          link: "wiki:Semantics (computer science)"
        },
        "soundness argument": {
          text: "A proof or structured justification that the static rules imply the guarantees claimed for accepted programs.",
          link: "wiki:Type safety"
        },
        "reference compiler": {
          text: "An implementation that checks and translates the language while serving as a concrete account of its design.",
          link: "wiki:Compiler"
        },
        "benchmark suite": {
          text: "A repeatable collection of programs used to measure selected performance characteristics and regressions.",
          link: "wiki:Benchmark (computing)"
        }
      }
    },
    {
      name: "Supporting developers",
      color: "blue",
      fact: "A language becomes usable day to day when diagnostics explain failures, editor tooling shortens feedback loops, package management connects libraries, and documentation teaches a shared way of working.",
      terms: ["actionable diagnostics", "language server", "package manager", "documentation"],
      seeds: ["language server", "package manager"],
      termInfo: {
        "actionable diagnostics": {
          text: "Compiler or tool messages that identify a problem in context and help the developer choose a repair.",
          link: "wiki:Compiler"
        },
        "language server": {
          text: "A tool process that supplies editors with language-aware features through a standard protocol.",
          link: "wiki:Language Server Protocol"
        },
        "package manager": {
          text: "Tooling and conventions for declaring, resolving, obtaining, and publishing reusable dependencies.",
          link: "wiki:Package manager"
        },
        documentation: {
          text: "Tutorial, reference, and explanatory material that lets users form a reliable model of the language and its tools.",
          link: "wiki:Software documentation"
        }
      }
    },
    {
      name: "Evolving without isolation",
      color: "amber",
      fact: "Production languages must coexist with existing systems and their own past: interoperability connects outside code, while specifications, compatibility policies, editions, and migration tools manage change over time.",
      terms: ["foreign-function interface", "backward compatibility", "versioned editions", "migration tooling"],
      seeds: ["foreign-function interface", "backward compatibility"],
      termInfo: {
        "foreign-function interface": {
          text: "A defined boundary through which code can call routines or exchange data with another language or runtime.",
          link: "wiki:Foreign function interface"
        },
        "backward compatibility": {
          text: "The property or policy that supported older programs continue to work under newer language releases.",
          link: "wiki:Backward compatibility"
        },
        "versioned editions": {
          text: "Opt-in language-version boundaries that let projects adopt selected changes without splitting the wider ecosystem.",
          link: "https://doc.rust-lang.org/edition-guide/editions/"
        },
        "migration tooling": {
          text: "Automated transformations and checks that help update source code for a newer language version or design.",
          link: "wiki:Software modernization"
        }
      }
    }
  ],
  bridges: [
    {
      term: "research prototype",
      clusters: [0, 1],
      relationKind: "continuity",
      fact: "A research prototype needs enough implementation and explanation for others to test the idea, but it may intentionally stop short of stable tooling, comprehensive documentation, and a broad package ecosystem.",
      idealTerms: ["reference compiler", "documentation"],
      direction: { kind: "through", from: 0, to: 1 },
      info: {
        text: "An experimental system built to investigate and communicate a design before production constraints are fully addressed.",
        link: "wiki:Software prototyping"
      }
    },
    {
      term: "production readiness",
      clusters: [1, 2],
      relationKind: "evaluation",
      fact: "Production readiness is an ecosystem property, not a compiler switch: teams need dependable tools and libraries as well as a credible path for integration, upgrades, and long-term maintenance.",
      idealTerms: ["package manager", "backward compatibility"],
      info: {
        text: "The degree to which a language and its surrounding system can support dependable, maintained real-world use.",
        link: "wiki:Software quality"
      }
    },
    {
      term: "implementation strategy",
      clusters: [0, 2],
      relationKind: "cross-cutting",
      fact: "Choosing a runtime, native backend, source translation, or host platform affects both the research claim and the route to adoption because it determines performance tradeoffs and access to existing systems.",
      idealTerms: ["benchmark suite", "foreign-function interface"],
      direction: { kind: "through", from: 0, to: 2 },
      info: {
        text: "The plan for checking and executing the language, including its compiler backend, runtime model, and use of host platforms.",
        link: "wiki:Programming language implementation"
      }
    },
    {
      term: "stable specification",
      clusters: [0, 2],
      relationKind: "continuity",
      fact: "Research semantics can evolve freely while questions remain open; a stable public specification turns that account into a compatibility boundary that implementations and users can rely on.",
      idealTerms: ["formal semantics", "backward compatibility"],
      direction: { kind: "through", from: 0, to: 2 },
      info: {
        text: "A maintained public definition of language syntax and behavior intended to remain a dependable implementation and compatibility target.",
        link: "wiki:Language specification"
      }
    }
  ]
};
