// Concept Clusters puzzle: active directions explored by research languages.

export default {
  id: "research-languages-and-future-directions",
  title: "Research languages and future directions",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "programming-languages"
  },
  tags: ["programming languages", "language research", "type systems"],
  info: {
    text: "Research languages make possible futures concrete: effects can become part of a function's type, types can state program properties, and resource use can be checked rather than merely documented.",
    link: "wiki:Programming language theory",
    citations: [
      {
        title: "The Koka Programming Language",
        author: "Daan Leijen and contributors",
        url: "https://koka-lang.github.io/koka/doc/book.html"
      },
      {
        title: "Proof-Oriented Programming in F*",
        author: "The F* project",
        url: "https://fstar-lang.org/tutorial/book/intro.html"
      },
      {
        title: "The Granule Project",
        author: "The Granule project",
        url: "https://granule-project.github.io/"
      }
    ]
  },
  relatedPuzzles: {
    info: {
      text: "Move between today's broad language-design choices, experimental directions, and the work required to make those ideas durable."
    },
    entries: [
      {
        id: "language-design-choices",
        reason: "Review the established choices about types, execution, and memory that current languages package differently."
      },
      {
        id: "from-research-language-to-production",
        reason: "Follow a promising language idea beyond the prototype into tooling, interoperability, and compatibility."
      },
      {
        id: "designing-for-programmer-ergonomics",
        reason: "Examine research languages that treat readability, feedback, and low-friction change as first-class design constraints."
      },
      {
        id: "where-failures-stop",
        reason: "Compare typed error propagation with effects, handlers, supervision, and explicit containment boundaries."
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
      id: "behavior-in-the-type",
      prompt: "Which concepts let a type describe more than the ordinary shape of an input or result?",
      targets: ["effect type", "dependent type", "refinement type", "linear type", "graded type", "usage multiplicity"],
      explanation: "These systems enrich types with behavior: possible effects, values a type depends on, logical predicates, single-use constraints, quantitative grades, or an explicit count of permitted uses.",
      reasons: {
        "effect type": "It records what a computation may do in addition to what value it returns.",
        "dependent type": "It allows a type to mention and vary with a value.",
        "refinement type": "It restricts a type with a logical property.",
        "linear type": "It constrains how a value may be consumed.",
        "graded type": "It annotates a type with quantitative or ordered information.",
        "usage multiplicity": "It states how many times, or in what mode, a value may be used."
      }
    },
    {
      id: "static-boundaries",
      prompt: "Which concepts can move a class of behavioral mistakes from runtime into static checking?",
      targets: ["effect type", "totality checking", "refinement type", "linear type", "capability", "proof obligation"],
      explanation: "A checker can reject undeclared effects, unproved refinements, non-total definitions, invalid resource use, or code lacking a required capability—but only for properties represented in the language's static model.",
      reasons: {
        "effect type": "It can expose effects that would otherwise remain implicit in a call graph.",
        "totality checking": "It asks the checker to establish that a definition covers its cases and terminates under the language's rules.",
        "refinement type": "Its predicate becomes a condition that must be established statically or discharged by a solver.",
        "linear type": "It can reject duplicating, dropping, or reusing a linear resource incorrectly.",
        capability: "Requiring a capability value can make missing authority a type error.",
        "proof obligation": "It names the proposition that remains to be justified before a program is accepted."
      }
    },
    {
      id: "research-language-exemplars",
      prompt: "Which concepts on the board are concrete research languages rather than type-system mechanisms?",
      targets: ["Koka", "F*", "Granule"],
      explanation: "Koka, F*, and Granule are implemented languages used to explore these directions. Each bridge touches two clusters because research systems often combine several ideas rather than testing one in isolation.",
      reasons: {
        Koka: "Koka combines effect types and handlers with resource-aware implementation work.",
        "F*": "F* combines dependent and refinement types with a typed account of computational effects.",
        Granule: "Granule combines indexed and dependent ideas with linear and graded resource reasoning."
      }
    }
  ],
  clusters: [
    {
      name: "Making effects explicit",
      color: "teal",
      fact: "Effect systems extend a function's signature with what it may do, while algebraic effects and handlers separate requesting an operation from deciding how that operation behaves.",
      terms: ["effect type", "algebraic effect", "effect handler", "effect polymorphism"],
      seeds: ["effect type", "effect handler"],
      termInfo: {
        "effect type": {
          text: "A type-level description of computational behavior such as state, exceptions, nondeterminism, or input and output.",
          link: "wiki:Effect system"
        },
        "algebraic effect": {
          text: "An abstract operation a computation may request without fixing its interpretation at the request site.",
          link: "wiki:Effect system"
        },
        "effect handler": {
          text: "A construct that supplies meanings for effect operations and may control whether and how a suspended computation resumes.",
          link: "wiki:Effect system"
        },
        "effect polymorphism": {
          text: "The ability to write code generic over some of the effects its callers or arguments may perform.",
          link: "wiki:Effect system"
        }
      },
      info: {
        text: "Koka and Eff are purpose-built examples; OCaml also exposes effect handlers, though its manual distinguishes them from statically effect-safe systems.",
        link: "https://www.eff-lang.org/",
        extraLink: "https://ocaml.org/manual/5.5/effects.html"
      }
    },
    {
      name: "Types as specifications",
      color: "blue",
      fact: "Dependent and refinement types can state relationships between values and results; totality checking and proof obligations turn some of those statements into claims the implementation must justify.",
      terms: ["dependent type", "refinement type", "totality checking", "proof obligation"],
      seeds: ["dependent type", "refinement type"],
      termInfo: {
        "dependent type": {
          text: "A type that can depend on a value, such as a vector type indexed by its length.",
          link: "wiki:Dependent type"
        },
        "refinement type": {
          text: "A base type restricted to values satisfying a stated predicate.",
          link: "wiki:Refinement type"
        },
        "totality checking": {
          text: "Static analysis intended to establish that a definition handles all cases and terminates under the checker's model.",
          link: "wiki:Total functional programming"
        },
        "proof obligation": {
          text: "A proposition generated by a specification or verifier that must be proved for checking to succeed.",
          link: "wiki:Verification condition"
        }
      },
      info: {
        text: "Idris pursues dependently typed general-purpose programming, while F* combines dependent refinements, effects, proofs, and automated verification.",
        link: "https://idris2.readthedocs.io/en/stable/tutorial/introduction.html",
        extraLink: "https://fstar-lang.org/tutorial/book/intro.html"
      }
    },
    {
      name: "Accounting for resources",
      color: "amber",
      fact: "Linear and graded types make usage part of static reasoning: a value may need to be consumed exactly once, carry a quantitative grade, or serve as an explicit capability granting authority.",
      terms: ["linear type", "graded type", "capability", "usage multiplicity"],
      seeds: ["linear type", "capability"],
      termInfo: {
        "linear type": {
          text: "A type whose values must follow a restricted usage discipline, classically exactly once.",
          link: "wiki:Substructural type system"
        },
        "graded type": {
          text: "A type carrying an annotation that tracks a quantity or ordered property such as use count, cost, privacy, or dependency.",
          link: "https://granule-project.github.io/granule.html"
        },
        capability: {
          text: "An explicit, transferable value representing authority to access a resource or perform an operation.",
          link: "wiki:Capability-based security"
        },
        "usage multiplicity": {
          text: "A type-level indication of whether a bound value is unused, used once, or available without a linear restriction.",
          link: "https://idris2.readthedocs.io/en/latest/app/linear.html"
        }
      },
      info: {
        text: "Granule studies graded and linear types; Austral applies linear types to memory, resources, and capability-based security.",
        link: "https://granule-project.github.io/",
        extraLink: "https://austral-lang.org/"
      }
    }
  ],
  bridges: [
    {
      term: "Koka",
      clusters: [0, 2],
      relationKind: "cross-cutting",
      fact: "Koka is a research language centered on effect types and handlers, while its Perceus reference-counting and reuse analyses also explore how functional programs can manage memory efficiently.",
      idealTerms: ["effect handler", "linear type"],
      info: {
        text: "A strongly typed functional-style research language exploring effect typing, handlers, and resource-aware implementation techniques.",
        link: "https://koka-lang.github.io/koka/doc/book.html"
      }
    },
    {
      term: "F*",
      clusters: [0, 1],
      relationKind: "cross-cutting",
      fact: "F* joins proof-oriented dependent and refinement types with a typed treatment of effects, so specifications can describe both returned values and the computations that produce them.",
      idealTerms: ["effect type", "refinement type"],
      info: {
        text: "A proof-oriented programming language, compiler, proof assistant, and verification engine with dependent refinements and effects.",
        link: "https://fstar-lang.org/"
      }
    },
    {
      term: "Granule",
      clusters: [1, 2],
      relationKind: "cross-cutting",
      fact: "Granule combines indexed typing with linear and graded modalities so types can describe not only what a program computes, but intensional properties such as how data and resources are used.",
      idealTerms: ["dependent type", "graded type"],
      info: {
        text: "A research language and project exploring graded, linear, and indexed types for fine-grained reasoning about program behavior.",
        link: "https://granule-project.github.io/"
      }
    }
  ]
};
