// Concept Clusters puzzle: ergonomics as a programming-language design constraint.

export default {
  id: "designing-for-programmer-ergonomics",
  title: "Designing for programmer ergonomics",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "programming-languages"
  },
  tags: ["programming languages", "language research", "developer experience"],
  large: true,
  info: {
    text: "Language ergonomics is not the absence of complexity but a decision about where complexity lives: in source code, compiler inference, diagnostics, tools, runtime machinery, or explicit escape hatches.",
    link: "wiki:Programming language design",
    citations: [
      {
        title: "Rust's language ergonomics initiative",
        author: "Aaron Turon",
        year: "2017",
        url: "https://blog.rust-lang.org/2017/03/02/lang-ergonomics/"
      },
      {
        title: "Compiler Errors for Humans",
        author: "Evan Czaplicki",
        year: "2015",
        url: "https://elm-lang.org/news/compiler-errors-for-humans"
      },
      {
        title: "Friendly",
        author: "The Roc project",
        url: "https://www.roc-lang.org/friendly"
      },
      {
        title: "The big idea",
        author: "The Unison project",
        url: "https://www.unison-lang.org/docs/the-big-idea/"
      }
    ]
  },
  relatedPuzzles: {
    info: {
      text: "Place ergonomics beside the language mechanisms, research directions, and production concerns that constrain it."
    },
    entries: [
      {
        id: "language-design-choices",
        reason: "Compare the underlying choices about types, execution, and memory whose costs an ergonomic design must expose or absorb."
      },
      {
        id: "research-languages-and-future-directions",
        reason: "See how experimental effects and type systems try to increase guarantees without surrendering usability."
      },
      {
        id: "from-research-language-to-production",
        reason: "Follow ergonomic ideas into the tooling, compatibility, and ecosystem work required for durable adoption."
      },
      {
        id: "where-failures-stop",
        reason: "Study error-handling ergonomics separately, from typed errors and propagation to containment and degraded operation."
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
      id: "staying-in-flow",
      prompt: "Which concepts most directly shorten the write-check-correct feedback loop?",
      targets: ["source-aware diagnostics", "error localization", "fast incremental build", "editor integration", "Elm", "Roc"],
      explanation: "Flow improves when checks return quickly, point to the relevant source, explain the local problem, and appear where code is being edited. Elm treats compiler output as user experience; Roc explicitly targets fast feedback as part of friendliness.",
      reasons: {
        "source-aware diagnostics": "They explain a failure in the vocabulary and structure of the source program.",
        "error localization": "It directs attention to the code that is most likely responsible.",
        "fast incremental build": "It reduces the pause between a change and useful feedback.",
        "editor integration": "It moves language-aware feedback into the primary working surface.",
        Elm: "Elm deliberately treats compiler messages as assistance for the programmer.",
        Roc: "Roc makes both friendliness and fast feedback explicit design goals."
      }
    },
    {
      id: "complexity-moved-not-erased",
      prompt: "Which concepts illustrate different places a language can put complexity that programmers would otherwise manage themselves?",
      targets: ["local type inference", "canonical formatter", "structured refactoring", "borrow checking", "automatic memory management", "effect inference"],
      explanation: "Inference can remove annotations, formatting can become automatic, refactoring can become structural, a borrow checker can prove resource rules, memory management can move into generated/runtime machinery, and effect inference can recover behavior without spelling out every detail.",
      reasons: {
        "local type inference": "The compiler reconstructs nearby type information instead of requiring repetitive annotations.",
        "canonical formatter": "A tool owns routine layout decisions instead of each author negotiating them.",
        "structured refactoring": "The codebase model tracks semantic change instead of relying only on textual edits.",
        "borrow checking": "Static rules and analysis replace some manual memory reasoning, while still requiring the programmer to satisfy the model.",
        "automatic memory management": "Allocation lifetimes move into compiler-generated or runtime mechanisms.",
        "effect inference": "The checker derives some behavioral information rather than demanding every effect annotation."
      }
    },
    {
      id: "ergonomic-language-experiments",
      prompt: "Which concepts are languages that make a distinctive developer-experience tradeoff on this board?",
      targets: ["Elm", "Roc", "Unison"],
      explanation: "Elm emphasizes compilers as assistants, Roc makes friendliness and fast feedback design goals, and Unison changes the representation of a codebase to enable structured refactoring and content-based identity.",
      reasons: {
        Elm: "Its bridge joins a deliberately constrained language surface with human-centered compiler feedback.",
        Roc: "Its three-way bridge joins predictable syntax, rapid feedback, and automatic memory management.",
        Unison: "Its bridge joins interactive guidance with a codebase designed around semantic rather than merely textual change."
      }
    },
    {
      id: "costs-that-remain-visible",
      prompt: "Which concepts preserve an explicit boundary or demand even in an ergonomics-oriented design?",
      targets: ["predictable name resolution", "borrow checking", "unsafe escape hatch", "content-addressed definitions"],
      explanation: "Ergonomic systems still expose commitments: predictable naming restricts dynamism, borrow checking rejects some programs until ownership is clarified, unsafe escape hatches mark obligations the checker cannot prove, and content addressing changes familiar file-and-name workflows.",
      reasons: {
        "predictable name resolution": "Predictability is purchased by limiting or clarifying mechanisms that can change what a name means.",
        "borrow checking": "Safety comes with constraints that programmers must learn and satisfy.",
        "unsafe escape hatch": "Leaving the verified subset transfers a clearly marked proof burden back to the programmer.",
        "content-addressed definitions": "Stable semantic identity enables new workflows but replaces assumptions built around mutable text files."
      }
    }
  ],
  clusters: [
    {
      name: "Readable by default",
      color: "teal",
      fact: "A readable surface reduces interpretation overhead through a small syntax, local inference, immutable values, and predictable rules for what each name denotes.",
      terms: ["minimal syntax", "local type inference", "immutable values", "predictable name resolution"],
      seeds: ["minimal syntax", "local type inference"],
      termInfo: {
        "minimal syntax": {
          text: "A deliberately limited collection of grammatical forms and special cases that must be learned and recognized.",
          link: "wiki:Syntax (programming languages)"
        },
        "local type inference": {
          text: "Deducing types from a bounded nearby context so routine annotations can be omitted without making distant code determine the answer.",
          link: "wiki:Type inference"
        },
        "immutable values": {
          text: "Bindings or data that cannot be changed after construction, reducing the number of state transitions a reader must consider.",
          link: "wiki:Immutable object"
        },
        "predictable name resolution": {
          text: "Rules designed to make it straightforward to determine which definition a written name refers to.",
          link: "wiki:Name resolution (programming languages)"
        }
      }
    },
    {
      name: "Guided by feedback",
      color: "blue",
      fact: "A compiler feels collaborative when it responds quickly, identifies the relevant source, explains errors in programmer-facing terms, and brings those results directly into the editor.",
      terms: ["source-aware diagnostics", "error localization", "fast incremental build", "editor integration"],
      seeds: ["source-aware diagnostics", "fast incremental build"],
      termInfo: {
        "source-aware diagnostics": {
          text: "Messages that preserve source names and context while explaining what the checker expected and observed.",
          link: "wiki:Compiler"
        },
        "error localization": {
          text: "Identifying the source region or earlier cause most responsible for a failure while suppressing misleading cascades.",
          link: "wiki:Syntax error"
        },
        "fast incremental build": {
          text: "Rechecking and rebuilding only what a change affects so feedback returns with little perceptible delay.",
          link: "wiki:Incremental compiler"
        },
        "editor integration": {
          text: "Language-aware completion, navigation, explanations, and diagnostics presented inside an editing environment.",
          link: "wiki:Language Server Protocol"
        }
      }
    },
    {
      name: "Designed for change",
      color: "amber",
      fact: "Ergonomics extends beyond writing a line: formatters settle style, package tools coordinate reuse, structured refactoring records semantic replacements, and content addressing separates identity from names.",
      terms: ["canonical formatter", "integrated package manager", "structured refactoring", "content-addressed definitions"],
      seeds: ["canonical formatter", "integrated package manager"],
      termInfo: {
        "canonical formatter": {
          text: "A standard tool that chooses a consistent source layout, minimizing manual style decisions and formatting-only disputes.",
          link: "wiki:Prettyprint"
        },
        "integrated package manager": {
          text: "A language-associated workflow for resolving, obtaining, building, and publishing dependencies.",
          link: "wiki:Package manager"
        },
        "structured refactoring": {
          text: "A change represented in terms of definitions and references rather than an unstructured sequence of text replacements.",
          link: "wiki:Code refactoring"
        },
        "content-addressed definitions": {
          text: "Definitions identified by a hash of their structure, with human-readable names stored separately from semantic identity.",
          link: "https://www.unison-lang.org/docs/the-big-idea/"
        }
      }
    },
    {
      name: "Choosing who carries the burden",
      color: "magenta",
      fact: "Safety and performance costs can be assigned differently: a borrow checker makes ownership constraints static, automatic memory management hides most lifetime decisions, effect inference reconstructs behavior, and an unsafe escape hatch marks where proof returns to the programmer.",
      terms: ["borrow checking", "automatic memory management", "effect inference", "unsafe escape hatch"],
      seeds: ["borrow checking", "automatic memory management"],
      termInfo: {
        "borrow checking": {
          text: "Static checking that references obey an ownership and aliasing discipline intended to prevent invalid memory access.",
          link: "wiki:Borrow checker"
        },
        "automatic memory management": {
          text: "Compiler-generated or runtime machinery that reclaims storage without requiring ordinary application code to free each allocation manually.",
          link: "wiki:Memory management"
        },
        "effect inference": {
          text: "Deriving some or all of a computation's effect information from its implementation and the operations it calls.",
          link: "wiki:Effect system"
        },
        "unsafe escape hatch": {
          text: "An explicitly marked region that permits operations outside ordinary static guarantees and transfers their safety obligations to the programmer.",
          link: "wiki:Unsafe code"
        }
      }
    }
  ],
  bridges: [
    {
      term: "Elm",
      clusters: [0, 1],
      relationKind: "cross-cutting",
      fact: "Elm couples a constrained functional language with a compiler designed as an assistant: inference keeps routine types concise, while human-centered messages localize mismatches, add context, and avoid cascades.",
      idealTerms: ["local type inference", "source-aware diagnostics"],
      info: {
        text: "A functional language for web applications known for a constrained design and deliberately helpful compiler feedback.",
        link: "https://elm-lang.org/"
      }
    },
    {
      term: "Roc",
      clusters: [0, 1, 3],
      relationKind: "cross-cutting",
      fact: "Roc explicitly defines friendliness across syntax, semantics, and tools, targets fast feedback loops, and chooses automatic memory management while pursuing performance through static analysis and platform-specific strategies.",
      idealTerms: ["predictable name resolution", "fast incremental build", "automatic memory management"],
      info: {
        text: "A functional language project that makes friendliness, fast feedback, and automatic memory management explicit design goals.",
        link: "https://www.roc-lang.org/friendly",
        extraLink: "https://www.roc-lang.org/fast"
      }
    },
    {
      term: "Unison",
      clusters: [1, 2],
      relationKind: "cross-cutting",
      fact: "Unison stores definitions by content rather than treating files and names as their identity; its codebase manager uses that structure for type-directed interaction, nonbreaking renames, dependency management, and structured refactoring sessions.",
      idealTerms: ["editor integration", "content-addressed definitions"],
      info: {
        text: "A functional language and codebase system built around content-addressed definitions and tool-mediated workflows.",
        link: "https://www.unison-lang.org/docs/the-big-idea/"
      }
    }
  ]
};
