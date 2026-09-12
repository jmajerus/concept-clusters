// Generated from content/puzzles/where-failures-stop.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "where-failures-stop",
  "title": "Where failures stop",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "programming-languages"
  },
  "large": true,
  "tags": [
    "programming languages",
    "error handling",
    "system safety",
    "Rust"
  ],
  "info": {
    "text": "A language can make failure explicit without deciding how a whole system should survive it. Reliable error handling joins typed representation and local recovery to containment boundaries, verification tools, and deliberate degradation policies.",
    "links": [
      {
        "href": "wiki:Exception handling"
      }
    ],
    "citations": [
      {
        "title": "Recoverable Errors with Result",
        "author": "The Rust project",
        "url": "https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html"
      },
      {
        "title": "Cloudflare outage on November 18, 2025",
        "author": "Cloudflare",
        "year": "2025",
        "url": "https://blog.cloudflare.com/18-november-2025-outage/"
      },
      {
        "title": "Redesigning Rust Error Handling",
        "author": "Linkbud Wiki",
        "year": "2025",
        "url": "https://wiki.majerus.us/en/tech/public/redesigning-rust-error-handling"
      },
      {
        "title": "Rust, Error Handling, and the Next Catastrophic Failure",
        "author": "Linkbud Wiki",
        "year": "2025",
        "url": "https://wiki.majerus.us/en/tech/public/rust-error-handling-and-the-next-catastrophic-failure"
      },
      {
        "title": "Clippy Documentation",
        "author": "The Rust project",
        "url": "https://doc.rust-lang.org/clippy/index.html"
      },
      {
        "title": "The Koka Programming Language",
        "author": "Daan Leijen and contributors",
        "url": "https://koka-lang.github.io/koka/doc/book.html"
      },
      {
        "title": "Supervision Principles",
        "author": "The Erlang/OTP project",
        "url": "https://www.erlang.org/docs/27/system/sup_princ.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-representing-and-forwarding-failure",
      "name": "Representing and forwarding failure",
      "color": "teal",
      "fact": "Rust's Result makes anticipated failure explicit; Err carries the error, the question-mark operator returns it early, and From-based conversion adapts it to the enclosing function's error type.",
      "terms": [
        "Result<T, E>",
        "Err value",
        "question-mark operator",
        "error conversion"
      ],
      "seeds": [
        "Result<T, E>",
        "question-mark operator"
      ],
      "termInfo": {
        "Result<T, E>": {
          "text": "Rust's success-or-failure enum, containing either Ok(T) or Err(E).",
          "links": [
            {
              "href": "https://doc.rust-lang.org/core/result/"
            }
          ]
        },
        "Err value": {
          "text": "The Result variant carrying an anticipated failure value rather than a successful output.",
          "links": [
            {
              "href": "https://doc.rust-lang.org/core/result/enum.Result.html"
            }
          ]
        },
        "question-mark operator": {
          "text": "Rust syntax that extracts success or returns a converted error early from the enclosing function.",
          "links": [
            {
              "href": "https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html"
            }
          ]
        },
        "error conversion": {
          "text": "Adapting one error type into another, including the From conversion performed during question-mark propagation.",
          "links": [
            {
              "href": "https://doc.rust-lang.org/std/convert/trait.From.html"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-handling-with-context",
      "name": "Handling with context",
      "color": "blue",
      "fact": "Handling begins when code uses local context to choose rather than merely forward: inspect the error, add diagnostic context, retry under a policy, or return a defined fallback value.",
      "terms": [
        "pattern match",
        "context enrichment",
        "retry policy",
        "fallback value"
      ],
      "seeds": [
        "pattern match",
        "retry policy"
      ],
      "termInfo": {
        "pattern match": {
          "text": "Explicitly branching on success and failure variants so each case can receive different behavior.",
          "links": [
            {
              "href": "wiki:Pattern matching"
            }
          ]
        },
        "context enrichment": {
          "text": "Adding operation, input, or causal information while preserving the underlying error for diagnosis.",
          "links": [
            {
              "href": "wiki:Exception chaining"
            }
          ]
        },
        "retry policy": {
          "text": "Rules for whether, when, and how often to attempt an operation again, usually with limits and backoff.",
          "links": [
            {
              "href": "wiki:Exponential backoff"
            }
          ]
        },
        "fallback value": {
          "text": "A deliberately chosen substitute result used when the preferred operation fails.",
          "links": [
            {
              "href": "wiki:Fault tolerance"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-containing-system-impact",
      "name": "Containing system impact",
      "color": "amber",
      "fact": "System safety depends on blast-radius decisions: recovery boundaries choose responses, supervisors isolate tasks, circuit breakers stop amplification, and degraded modes preserve useful service.",
      "terms": [
        "recovery boundary",
        "task supervision",
        "circuit breaker",
        "degraded mode"
      ],
      "seeds": [
        "recovery boundary",
        "degraded mode"
      ],
      "termInfo": {
        "recovery boundary": {
          "text": "A component boundary with enough context and authority to choose retry, fallback, isolation, rejection, or shutdown.",
          "links": [
            {
              "href": "wiki:Exception handling"
            }
          ]
        },
        "task supervision": {
          "text": "Monitoring isolated workers and applying an explicit restart, stop, or escalation strategy when one terminates.",
          "links": [
            {
              "href": "https://www.erlang.org/docs/27/system/sup_princ.html"
            }
          ]
        },
        "circuit breaker": {
          "text": "Temporarily blocking calls to a failing dependency so repeated attempts do not amplify the outage.",
          "links": [
            {
              "href": "wiki:Circuit breaker design pattern"
            }
          ]
        },
        "degraded mode": {
          "text": "An intentionally reduced operating state that preserves safe or valuable functions when full service is unavailable.",
          "links": [
            {
              "href": "wiki:Graceful degradation"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-hardening-current-systems",
      "name": "Hardening current systems",
      "color": "magenta",
      "fact": "Existing Rust systems can be hardened through scoped lint policy, panic-reachability analysis, injected failures, and restricted profiles that turn safety expectations into repeatable checks.",
      "terms": [
        "deny-unwrap lint",
        "panic-path analysis",
        "fault injection",
        "restricted safety profile"
      ],
      "seeds": [
        "deny-unwrap lint",
        "fault injection"
      ],
      "termInfo": {
        "deny-unwrap lint": {
          "text": "A project rule that rejects unwrap-like calls in selected crates or modules; Clippy already provides an unwrap_used restriction lint.",
          "links": [
            {
              "href": "https://doc.rust-lang.org/clippy/index.html"
            }
          ]
        },
        "panic-path analysis": {
          "text": "Proposed static analysis that traces where panics can originate and which critical tasks or public boundaries they can reach.",
          "links": [
            {
              "href": "wiki:Static program analysis"
            }
          ]
        },
        "fault injection": {
          "text": "Deliberately introducing failures or adverse inputs to verify containment, fallback, and recovery behavior.",
          "links": [
            {
              "href": "wiki:Fault injection"
            }
          ]
        },
        "restricted safety profile": {
          "text": "A project or domain subset that forbids selected constructs and requires stronger analysis, review, and failure tests.",
          "links": [
            {
              "href": "wiki:Coding standard"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-exploring-language-level-alternatives",
      "name": "Exploring language-level alternatives",
      "color": "olive",
      "fact": "Longer-term designs could track failure as an effect, delimit it with handlers or structured regions, and attach checked restart or escalation policies to supervised tasks.",
      "terms": [
        "failure effect",
        "effect handler",
        "structured failure region",
        "typed supervision policy"
      ],
      "seeds": [
        "effect handler",
        "structured failure region"
      ],
      "termInfo": {
        "failure effect": {
          "text": "A type-and-effect annotation recording that a computation may raise or signal specified failures.",
          "links": [
            {
              "href": "wiki:Effect system"
            }
          ]
        },
        "effect handler": {
          "text": "A delimited construct that supplies an interpretation for effect operations and controls how computation resumes.",
          "links": [
            {
              "href": "https://koka-lang.github.io/koka/doc/book.html"
            }
          ]
        },
        "structured failure region": {
          "text": "A proposed lexical or task scope declaring where propagated failure must be handled and what it is allowed to abort.",
          "links": [
            {
              "href": "wiki:Structured programming"
            }
          ]
        },
        "typed supervision policy": {
          "text": "A proposed checked contract stating whether a failed task may restart, disable itself, or escalate to a wider boundary.",
          "links": [
            {
              "href": "https://www.erlang.org/docs/27/system/sup_princ.html"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-unwrap",
      "term": "unwrap",
      "clusters": [
        0,
        2
      ],
      "fact": "Unwrap crosses from representation to containment by converting Err into a panic. Cloudflare's official postmortem identifies that exact transition; how far the panic then travels depends on worker and system boundaries.",
      "info": {
        "text": "A Result method that returns the success value or panics when the value is Err.",
        "links": [
          {
            "href": "https://doc.rust-lang.org/core/result/enum.Result.html#method.unwrap"
          },
          {
            "href": "https://blog.cloudflare.com/18-november-2025-outage/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Err value",
        "recovery boundary"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-failure-policy",
      "term": "failure policy",
      "clusters": [
        1,
        2
      ],
      "fact": "A failure policy joins local evidence to system intent: it decides which errors merit retry or fallback, which component should be isolated, and when reduced service is safer than continued escalation.",
      "info": {
        "text": "An explicit rule mapping classes of failure and operating context to recovery, containment, escalation, or shutdown behavior.",
        "links": [
          {
            "href": "wiki:Fault tolerance"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "retry policy",
        "degraded mode"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-staged-evolution",
      "term": "staged evolution",
      "clusters": [
        2,
        3,
        4
      ],
      "fact": "Improvement need not wait for a redesigned language: containment patterns can be adopted now, tools and profiles can verify them next, and research mechanisms can test which guarantees deserve eventual language support.",
      "info": {
        "text": "A sequence that deploys compatible practices and tooling before committing to more disruptive language-level mechanisms.",
        "links": [
          {
            "href": "wiki:Software evolution"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "recovery boundary",
        "restricted safety profile",
        "structured failure region"
      ]
    }
  ],
  "lenses": [
    {
      "id": "forwarding-is-not-handling",
      "prompt": "Which concepts can carry or translate a failure outward without yet choosing how the system recovers?",
      "explanation": "Result represents success or failure, Err carries the failure, the question-mark operator returns it early, and conversion adapts its type. These mechanisms preserve information for a caller but do not themselves choose retry, fallback, isolation, or degradation.",
      "targets": [
        "Result<T, E>",
        "Err value",
        "question-mark operator",
        "error conversion"
      ],
      "reasons": {
        "Result<T, E>": "It makes anticipated failure part of a return type.",
        "Err value": "It carries the particular failure through ordinary control flow.",
        "question-mark operator": "It concisely returns an encountered error from the current function.",
        "error conversion": "It translates an error into the enclosing function's error type while propagation continues."
      }
    },
    {
      "id": "limiting-the-blast-radius",
      "prompt": "Which concepts express where failure should stop or what limited behavior should follow?",
      "explanation": "Boundaries contain propagation, supervision isolates and restarts work, circuit breakers stop repeated calls, degraded modes preserve selected functions, and proposed language mechanisms could make those scopes and policies checkable.",
      "targets": [
        "recovery boundary",
        "task supervision",
        "circuit breaker",
        "degraded mode",
        "structured failure region",
        "typed supervision policy"
      ],
      "reasons": {
        "recovery boundary": "It is the point with enough context and authority to choose a response.",
        "task supervision": "It confines a worker failure and delegates restart or escalation to another component.",
        "circuit breaker": "It prevents repeated calls from amplifying an already observed downstream failure.",
        "degraded mode": "It preserves a deliberate subset of service rather than collapsing entirely.",
        "structured failure region": "It would delimit the scope within which failure may propagate.",
        "typed supervision policy": "It would make permitted restart, disable, or escalation behavior part of a checked contract."
      }
    },
    {
      "id": "hardening-without-language-changes",
      "prompt": "Which concepts can strengthen failure behavior today without changing Rust's language semantics?",
      "explanation": "Lint policy can ban convenience panics in selected code, analysis can trace panic reachability, fault injection can exercise neglected paths, and a restricted profile can make those practices a domain rule.",
      "targets": [
        "deny-unwrap lint",
        "panic-path analysis",
        "fault injection",
        "restricted safety profile"
      ],
      "reasons": {
        "deny-unwrap lint": "Existing lint controls can reject unwrap-like calls in designated scopes.",
        "panic-path analysis": "Deeper static tooling could map which panic origins reach critical loops and boundaries.",
        "fault injection": "Tests can force bad inputs, timeouts, and partial failures instead of waiting for production to discover them.",
        "restricted safety profile": "A profile can convert selected practices into enforceable project or domain requirements."
      }
    },
    {
      "id": "future-language-directions",
      "prompt": "Which concepts belong to the longer-term language-design space rather than Rust's current error model?",
      "explanation": "Typed effects and handlers already exist in research languages, while structured failure regions and typed supervision policies are proposals. Staged evolution connects these language ideas to nearer-term containment patterns and tooling rather than pretending one redesign arrives all at once.",
      "targets": [
        "failure effect",
        "effect handler",
        "structured failure region",
        "typed supervision policy",
        "staged evolution"
      ],
      "reasons": {
        "failure effect": "It would record possible failure in an effect system rather than only in the returned value type.",
        "effect handler": "It supplies a delimited interpretation for an effect and can separate requesting failure from responding to it.",
        "structured failure region": "It is a proposed construct for declaring the boundary a failure may abort.",
        "typed supervision policy": "It is a proposed checked policy for restart, disable, or escalation behavior.",
        "staged evolution": "This bridge separates deployable hardening now from experimental language evolution later."
      }
    },
    {
      "id": "reading-the-outage-chain",
      "prompt": "Which concepts help distinguish the Cloudflare incident's concrete Rust path from the recovery mechanisms that might have reduced its impact?",
      "explanation": "The official postmortem identifies an Err converted to a panic by unwrap. The wider design questions concern where that panic or error should have been contained, whether reduced service was possible, and whether tests and explicit policy had exercised the oversized configuration path.",
      "targets": [
        "Err value",
        "unwrap",
        "recovery boundary",
        "degraded mode",
        "fault injection",
        "failure policy"
      ],
      "reasons": {
        "Err value": "The fallible operation produced the error state represented by Result.",
        "unwrap": "The postmortem identifies unwrap as the conversion from Err to panic.",
        "recovery boundary": "A boundary could decide whether failure disables a feature, request, worker, or larger service.",
        "degraded mode": "The old and new proxy paths demonstrated different reduced or failed behaviors under the same trigger.",
        "fault injection": "Forcing oversized configuration data is the kind of adverse-path test that can expose the chain before deployment.",
        "failure policy": "A policy must decide which response is appropriate; the error type cannot choose it alone."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Connect failure handling to language ergonomics, experimental effect systems, and production engineering."
    },
    "entries": [
      {
        "id": "designing-for-programmer-ergonomics",
        "reason": "Return to the broader question of where a language places complexity in syntax, feedback, tools, and runtime behavior."
      },
      {
        "id": "research-languages-and-future-directions",
        "reason": "Explore effect types and handlers as an active alternative design space for representing and delimiting computational behavior."
      },
      {
        "id": "from-research-language-to-production",
        "reason": "See why production readiness also requires stable tooling, compatibility, and evidence that failure paths work in practice."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
