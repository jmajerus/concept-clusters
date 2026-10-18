// Generated from content/puzzles/rules-of-chance.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "rules-of-chance",
  "title": "The Rules of Chance — How Probability Models Uncertainty",
  "category": "math",
  "subcategories": {
    "math": "probability-statistics"
  },
  "info": {
    "text": "Chance has grammar. This board organizes the rules of probability into five moves — set up the outcome space, combine events, condition on what you learn, count the possibilities, and check what the long run owes the model.",
    "links": [
      {
        "href": "wiki:Probability"
      }
    ],
    "citations": [
      {
        "title": "Introductory Statistics, ch. 3: Probability Topics (key terms)",
        "author": "Barbara Illowsky and Susan Dean",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introductory-statistics/pages/3-key-terms"
      },
      {
        "title": "Conditional probability",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Conditional_probability"
      },
      {
        "title": "Combination",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Combination"
      },
      {
        "title": "Expected value",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Expected_value"
      }
    ]
  },
  "clusters": [
    {
      "id": "stage",
      "name": "The stage: outcome sets",
      "color": "teal",
      "fact": "Probability begins by turning a situation into a set: a planned trial, the results it can produce, the set of all of them, and any subset worth asking about.",
      "terms": [
        "outcome",
        "event",
        "experiment",
        "sample space"
      ],
      "seeds": [
        "outcome",
        "event"
      ],
      "termInfo": {
        "event": {
          "text": "A subset of the sample space — any collection of outcomes worth a question, like 'drew a face card'. An event occurs when the realized outcome is one of its members.",
          "links": [
            {
              "href": "wiki:Event (probability theory)"
            }
          ]
        },
        "experiment": {
          "text": "A planned activity carried out under controlled conditions — drawing a card, rolling two dice. The thing the probabilities are about.",
          "links": [
            {
              "href": "wiki:Experiment (probability theory)"
            }
          ]
        },
        "outcome": {
          "text": "A particular result of an experiment — one card, one roll. The atoms of the sample space.",
          "links": [
            {
              "href": "wiki:Outcome (probability)"
            }
          ]
        },
        "sample space": {
          "text": "The set of all possible outcomes of an experiment: the 52 cards, the 36 sums of two dice. Everything probability counts lives here.",
          "links": [
            {
              "href": "wiki:Sample space"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Probability space"
          }
        ]
      }
    },
    {
      "id": "combining",
      "name": "Combining events",
      "color": "blue",
      "fact": "Events combine like sets — in both at once, in either, in the one's absence — and the addition rule turns those combinations into probability arithmetic.",
      "terms": [
        "union",
        "mutually exclusive",
        "intersection",
        "complement",
        "addition rule"
      ],
      "seeds": [
        "union",
        "mutually exclusive"
      ],
      "termInfo": {
        "addition rule": {
          "text": "P(A or B) = P(A) + P(B) − P(A and B): add the separate probabilities, subtract the double-counted overlap. For mutually exclusive events the overlap is empty and the subtraction disappears.",
          "links": [
            {
              "href": "wiki:Inclusion–exclusion principle"
            }
          ]
        },
        "complement": {
          "text": "Everything in the sample space that is not A; P(Aᶜ) = 1 − P(A).",
          "links": [
            {
              "href": "wiki:Complement (set theory)"
            }
          ]
        },
        "intersection": {
          "text": "The 'and' event: an outcome is in A ∩ B only if it is in both at once.",
          "links": [
            {
              "href": "wiki:Intersection (set theory)"
            }
          ]
        },
        "mutually exclusive": {
          "text": "Events that cannot co-occur: P(A ∩ B) = 0. A card cannot be both a heart and a spade.",
          "links": [
            {
              "href": "wiki:Mutual exclusivity"
            }
          ]
        },
        "union": {
          "text": "The 'or' event: an outcome is in A ∪ B if it is in A, in B, or in both.",
          "links": [
            {
              "href": "wiki:Union (set theory)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Probability axioms"
          }
        ]
      }
    },
    {
      "id": "conditioning",
      "name": "Conditioning on knowledge",
      "color": "amber",
      "fact": "Information changes probabilities: learning that B happened re-sizes the chance of A — or leaves it exactly where it was, which is its own discovery.",
      "terms": [
        "conditional probability",
        "independence",
        "multiplication rule",
        "Bayes' theorem"
      ],
      "seeds": [
        "conditional probability",
        "independence"
      ],
      "termInfo": {
        "Bayes' theorem": {
          "text": "The rule that reverses conditioning: it computes P(B|A) — the chance of the cause given the effect — from P(A|B) and the base rates.",
          "links": [
            {
              "href": "wiki:Bayes' theorem"
            }
          ]
        },
        "conditional probability": {
          "text": "The probability of A once B is known to have happened, written P(A|B): with B as the new sample space, A's share of it.",
          "links": [
            {
              "href": "wiki:Conditional probability"
            }
          ]
        },
        "independence": {
          "text": "Knowing one event happened leaves the other's probability unchanged: P(A|B) = P(A). The events influence each other not at all.",
          "links": [
            {
              "href": "wiki:Independence (probability theory)"
            }
          ]
        },
        "multiplication rule": {
          "text": "P(A and B) = P(A) · P(B|A); for independent events it collapses to P(A) · P(B).",
          "links": [
            {
              "href": "wiki:Conditional probability"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Conditional probability"
          }
        ]
      }
    },
    {
      "id": "counting",
      "name": "Counting the outcomes",
      "color": "magenta",
      "fact": "When every outcome carries the same weight, probability collapses to counting — and order is what decides which counting tool you need.",
      "terms": [
        "factorial",
        "permutation",
        "combination",
        "equally likely"
      ],
      "seeds": [
        "factorial",
        "permutation"
      ],
      "termInfo": {
        "combination": {
          "text": "A selection of r of n items where order does not matter: C(n,r) = n!/(r!(n−r)!). A two-person committee is the same committee however you announce it.",
          "links": [
            {
              "href": "wiki:Combination"
            }
          ]
        },
        "equally likely": {
          "text": "The condition under which probability is pure counting: when every outcome carries the same weight, P(A) = outcomes in A ÷ total outcomes.",
          "links": [
            {
              "href": "https://openstax.org/books/introductory-statistics/pages/3-key-terms",
              "label": "OpenStax, Introductory Statistics ch. 3 key terms"
            }
          ]
        },
        "factorial": {
          "text": "n! counts the arrangements of n items — 4! = 24 ways to order four books on a shelf. The raw material of the other counting tools.",
          "links": [
            {
              "href": "wiki:Factorial"
            }
          ]
        },
        "permutation": {
          "text": "An ordered selection of r of n items: P(n,r) = n!/(n−r)!. President-then-treasurer differs from treasurer-then-president.",
          "links": [
            {
              "href": "wiki:Permutation"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Combination"
          }
        ]
      }
    },
    {
      "id": "long-run",
      "name": "The long run",
      "color": "olive",
      "fact": "One roll is luck; the model still predicts the average of many rolls in advance — and the law of large numbers says the prediction comes true.",
      "terms": [
        "expected value",
        "law of large numbers"
      ],
      "seeds": [
        "expected value"
      ],
      "termInfo": {
        "expected value": {
          "text": "The probability-weighted average of the outcomes: each value times its probability, summed. A fair die's is 3.5 — a value no single roll can produce.",
          "links": [
            {
              "href": "wiki:Expected value"
            }
          ]
        },
        "law of large numbers": {
          "text": "The average of many independent repetitions of the same experiment converges to the expected value — the theorem that lets the long run be planned for.",
          "links": [
            {
              "href": "wiki:Law of large numbers"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Expected value"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "influence",
      "term": "influence",
      "clusters": [
        1,
        2
      ],
      "fact": "Mutually exclusive is about co-occurrence — the two events cannot happen together. Independence is about influence — one event does not change the other's probability. Exclusive events with positive probability are never independent: learning B happened drives P(A|B) to zero.",
      "info": {
        "links": [
          {
            "href": "wiki:Independence (probability theory)"
          }
        ]
      },
      "relationKind": "contrast"
    },
    {
      "id": "reduced-sample-space",
      "term": "reduced sample space",
      "clusters": [
        2,
        0
      ],
      "fact": "To compute P(A|B), throw away every outcome outside B: B becomes the new sample space, and A's conditional probability is just A's share of it.",
      "info": {
        "links": [
          {
            "href": "wiki:Conditional probability"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "classical-probability",
      "term": "classical probability",
      "clusters": [
        3,
        0
      ],
      "fact": "When outcomes are equally likely, no experiment needs running: P(A) = favorable outcomes ÷ total outcomes — and the counting tools exist to evaluate that fraction for sample spaces like 52-card decks.",
      "info": {
        "links": [
          {
            "href": "wiki:Probability"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "replacement",
      "term": "replacement",
      "clusters": [
        3,
        2
      ],
      "fact": "Draw a card with replacement and the deck never changes, so each draw is independent of the last. Draw without replacement and the pool shrinks — every draw is now conditional on what left the deck.",
      "info": {
        "text": "OpenStax defines both sampling modes: with replacement, a member may be picked again; without replacement, only once.",
        "links": [
          {
            "href": "https://openstax.org/books/introductory-statistics/pages/3-key-terms",
            "label": "OpenStax, Introductory Statistics ch. 3 (sampling with and without replacement)"
          }
        ]
      },
      "relationKind": "dynamic"
    },
    {
      "id": "weighted-average",
      "term": "weighted average",
      "clusters": [
        4,
        0
      ],
      "fact": "The expected value weights every outcome of the sample space by its probability and adds: the fair die's is (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = 3.5 — a value no single roll can ever produce.",
      "info": {
        "links": [
          {
            "href": "wiki:Expected value"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "convergence",
      "term": "convergence",
      "clusters": [
        4,
        2
      ],
      "fact": "The law of large numbers is stated for independent repetitions of the same experiment: as the trials accumulate, the running average converges to the expected value — which is why casinos and insurers can plan on it.",
      "info": {
        "links": [
          {
            "href": "wiki:Law of large numbers"
          }
        ]
      },
      "relationKind": "foundation"
    }
  ],
  "lenses": [
    {
      "id": "deck-or-subset",
      "prompt": "One term names the full set of 52 possible cards in a deck draw; the other names 'drawing a face card' — a subset of that set worth asking about. Which two terms?",
      "explanation": "The 52 possible cards are the sample space — the full set of outcomes. 'Drawing a face card' selects 8 of them, which makes it an event: a subset worth a question. A single card would be an outcome, but the prompt names the whole set and a subset of it.",
      "targets": [
        "sample space",
        "event"
      ],
      "reasons": {
        "event": "'drew a face card' collects 8 outcomes into one question — a subset of the sample space",
        "sample space": "all 52 possible cards form the set every draw is measured against"
      }
    },
    {
      "id": "heart-and-spade",
      "prompt": "Draw one card. Which term describes the relationship between 'the card is a heart' and 'the card is a spade' — they cannot both be true of the same draw?",
      "explanation": "A card cannot be both a heart and a spade: the two events cannot co-occur, which is exactly mutually exclusive. They are emphatically not independent — knowing the card is a heart drives 'spade' to zero, the exclusive-vs-independent contrast on the influence bridge.",
      "targets": [
        "mutually exclusive"
      ],
      "reasons": {
        "mutually exclusive": "P(heart and spade) = 0 — one draw cannot land in both"
      }
    },
    {
      "id": "heart-or-face",
      "prompt": "To compute P(heart or face card) you add the two separate probabilities and subtract a correction. Which two terms name, respectively, the 'or' event itself and that rule?",
      "explanation": "'Heart or face card' is the union of the two events, and the addition rule is what computes its probability — add the separate probabilities, subtract the overlap the addition counted twice.",
      "targets": [
        "union",
        "addition rule"
      ],
      "reasons": {
        "addition rule": "P(A or B) = P(A) + P(B) − P(A and B) is exactly that add-then-subtract",
        "union": "the 'or' event — outcomes in either set"
      }
    },
    {
      "id": "committee-vs-titles",
      "prompt": "A 10-person club once picks a president and a treasurer, and later just picks a 2-person committee. Which two terms are the counting tools for those two tasks, in order?",
      "explanation": "President-then-treasurer is an ordered selection — a permutation, nPr. A two-person committee is order-free — a combination, nCr. The factorial is the building block inside both formulas, not the tool for either task.",
      "targets": [
        "permutation",
        "combination"
      ],
      "reasons": {
        "combination": "the committee ignores order — C(10,2)",
        "permutation": "the two titles are ordered — P(10,2)"
      }
    },
    {
      "id": "second-draw",
      "prompt": "You draw twice from a deck without returning the first card. Which term names the kind of probability you compute for the second draw once you know what the first was?",
      "explanation": "Without replacement the pool shrinks, so the second draw's probability must be computed given what the first was — a conditional probability. With replacement the draws would be independent; and the question asks forward, not the backward calculation Bayes' theorem performs.",
      "targets": [
        "conditional probability"
      ],
      "reasons": {
        "conditional probability": "P(second | first) re-sizes the pool exactly as conditioning requires"
      }
    },
    {
      "id": "casino-plan",
      "prompt": "Thousands of plays later, a player's average per game approaches the number the model predicted. Which two terms name that predicted number and the theorem that says the average really gets there?",
      "explanation": "The expected value is the probability-weighted average the game is worth per play; the law of large numbers is the theorem that the running average of many independent plays actually converges there. One predicts, the other guarantees.",
      "targets": [
        "expected value",
        "law of large numbers"
      ],
      "reasons": {
        "expected value": "the probability-weighted average of the outcomes — the model's prediction",
        "law of large numbers": "independent repetitions converge to that expectation"
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "summarizing-data",
        "reason": "Start of the statistics arc: describing a data set before modeling the chance underneath it."
      },
      {
        "id": "from-sample-to-population",
        "reason": "Next in the arc: how the rules of chance become the machinery of statistical inference."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The Rules of Chance",
    "summary": "Probability has strict rules: name the outcome space, combine events, update on what you learn, count what's equally likely, and hold the long run to the model's prediction.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Probability is the mathematics of not knowing — and it turns out that not-knowing has strict rules. This lesson walks them in the order you'd meet them: first the setup that names what could happen, then the rules for combining and updating, the counting tricks that make the numbers computable, and finally what the long run owes the model.\r\n\r\n## Naming what could happen\r\n\r\nEvery probabilistic story starts with an experiment — a planned activity under controlled conditions, like drawing a card or rolling two dice. Its outcomes are the individual results it can produce, the sample space is the set of every possible outcome, and an event is any subset of that set worth asking about — 'drew a face card' names eight of the 52 outcomes. All the machinery of probability is spoken in this set vocabulary.\r\n\r\n## Combining events\r\n\r\nBecause events are sets, they combine like sets. The union of two events is the 'or' event: outcomes in either. The intersection is the 'and' event: outcomes in both at once. The complement flips an event over: everything in the sample space that is not A. The addition rule converts these combinations into arithmetic: P(A or B) = P(A) + P(B) − P(A and B) — the subtraction removes the outcomes the addition counted twice. One special relationship gets its own name: events that cannot co-occur are mutually exclusive, and for them the intersection is empty, so the addition rule loses its subtraction term.\r\n\r\n## Updating with knowledge\r\n\r\nReal questions rarely start from scratch. Conditional probability re-sizes the question once something is known: P(A|B) treats B as the entire new sample space and asks what share of it A occupies. When knowing B doesn't move P(A) at all — when P(A|B) = P(A) — the events are independent, each irrelevant to the other. The multiplication rule runs the same idea forward: the probability that both A and B occur is P(A) times P(B|A), which collapses to P(A)·P(B) exactly when the two are independent. Bayes' theorem runs conditioning backward, letting you infer the probability of a cause from an observed effect.\r\n\r\n## Counting when everything is equally likely\r\n\r\nIf every outcome in the sample space is equally likely, probability needs no long-run data at all: P(A) is just the number of outcomes in A divided by the number in the sample space. All the work moves into counting, and order is the hinge. A factorial counts the arrangements of a whole set. A permutation counts ordered selections — president-then-treasurer differs from treasurer-then-president. A combination counts selections where order doesn't matter — a two-person committee is the same committee either way. Draw with replacement and every trial faces the same unchanged pool; draw without replacement and each draw shifts the pool, which is exactly what makes later draws conditional on earlier ones.\r\n\r\n## The long run\r\n\r\nOne roll is luck, but a probability model predicts something about many rolls. The expected value is the probability-weighted average of the outcomes: a fair die's is 3.5, though no single roll can produce it. The law of large numbers says why anyone should care: the average of many independent repetitions converges to the expected value. That bridge between a model on paper and what actually accumulates is why probability is useful to casinos, insurers, and anyone who must plan under uncertainty."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "rules-of-chance",
      "puzzleRevision": "fnv1a32:627612fd",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:outcome": {
          "x": 692.93,
          "y": 52
        },
        "term:event": {
          "x": 854.74,
          "y": 52
        },
        "term:experiment": {
          "x": 908.5,
          "y": 110.21
        },
        "term:sample space": {
          "x": 860.38,
          "y": 280.23
        },
        "term:union": {
          "x": 222.59,
          "y": 352.32
        },
        "term:mutually exclusive": {
          "x": 126.7,
          "y": 317.36
        },
        "term:intersection": {
          "x": 107.8,
          "y": 172.83
        },
        "term:complement": {
          "x": 142.87,
          "y": 70.78
        },
        "term:addition rule": {
          "x": 266.9,
          "y": 70.19
        },
        "term:conditional probability": {
          "x": 446.91,
          "y": 598
        },
        "term:independence": {
          "x": 285.09,
          "y": 598
        },
        "term:multiplication rule": {
          "x": 135.39,
          "y": 598
        },
        "term:Bayes' theorem": {
          "x": 157.59,
          "y": 459.4
        },
        "term:factorial": {
          "x": 830.74,
          "y": 400.57
        },
        "term:permutation": {
          "x": 881.31,
          "y": 504.19
        },
        "term:combination": {
          "x": 833.38,
          "y": 598
        },
        "term:equally likely": {
          "x": 638.76,
          "y": 598
        },
        "term:expected value": {
          "x": 398.19,
          "y": 52
        },
        "term:law of large numbers": {
          "x": 557.58,
          "y": 52
        },
        "term:influence": {
          "x": 300.02,
          "y": 295.87
        },
        "term:reduced sample space": {
          "x": 526.04,
          "y": 357
        },
        "term:classical probability": {
          "x": 703.58,
          "y": 324.01
        },
        "term:replacement": {
          "x": 558.6,
          "y": 502.63
        },
        "term:weighted average": {
          "x": 593.34,
          "y": 197
        },
        "term:convergence": {
          "x": 425.42,
          "y": 261.37
        },
        "cluster:0": {
          "x": 768.99,
          "y": 145.53
        },
        "cluster:1": {
          "x": 212.66,
          "y": 201.97
        },
        "cluster:2": {
          "x": 332.26,
          "y": 449.77
        },
        "cluster:3": {
          "x": 728.79,
          "y": 505.83
        },
        "cluster:4": {
          "x": 460.53,
          "y": 152.38
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 3
      },
      "source": "author",
      "savedAt": "2026-10-17T03:27:35.830Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "rules-of-chance",
      "puzzleRevision": "fnv1a32:627612fd",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 216.42,
          "y": 206.93,
          "pinned": true
        },
        "cluster:1": {
          "x": 875.27,
          "y": 273.22,
          "pinned": true
        },
        "cluster:2": {
          "x": 682.93,
          "y": 511.92,
          "pinned": true
        },
        "cluster:3": {
          "x": 283.99,
          "y": 504.91,
          "pinned": true
        },
        "cluster:4": {
          "x": 627.52,
          "y": 155.82,
          "pinned": true
        }
      },
      "bridges": {
        "term:influence": {
          "x": 885.19,
          "y": 517.31,
          "pinned": true
        },
        "term:reduced sample space": {
          "x": 429.85,
          "y": 287.86,
          "pinned": true
        },
        "term:classical probability": {
          "x": 170.52,
          "y": 359.08,
          "pinned": true
        },
        "term:replacement": {
          "x": 491.47,
          "y": 579.78,
          "pinned": true
        },
        "term:weighted average": {
          "x": 400.96,
          "y": 74.76,
          "pinned": true
        },
        "term:convergence": {
          "x": 620.81,
          "y": 312.47,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "outcome",
          "event",
          "experiment",
          "sample space"
        ],
        "cluster:1": [
          "union",
          "mutually exclusive",
          "intersection",
          "complement",
          "addition rule"
        ],
        "cluster:2": [
          "conditional probability",
          "independence",
          "multiplication rule",
          "Bayes' theorem"
        ],
        "cluster:3": [
          "factorial",
          "permutation",
          "combination",
          "equally likely"
        ],
        "cluster:4": [
          "expected value",
          "law of large numbers"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "outcome",
          "sample space",
          "experiment",
          "event"
        ],
        "cluster:1": [
          "union",
          "intersection",
          "mutually exclusive",
          "addition rule",
          "complement"
        ],
        "cluster:2": [
          "Bayes' theorem",
          "conditional probability",
          "multiplication rule",
          "independence"
        ],
        "cluster:3": [
          "combination",
          "equally likely",
          "permutation",
          "factorial"
        ],
        "cluster:4": [
          "law of large numbers",
          "expected value"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 1316.5596857394248
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T03:27:31.623Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "rules-of-chance",
      "puzzleRevision": "fnv1a32:627612fd",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:outcome": {
          "x": 701.21,
          "y": 372.61,
          "pinned": false
        },
        "term:event": {
          "x": 785.44,
          "y": 356.38,
          "pinned": false
        },
        "term:experiment": {
          "x": 870.85,
          "y": 398.55,
          "pinned": false
        },
        "term:sample space": {
          "x": 768.91,
          "y": 456.57,
          "pinned": false
        },
        "term:union": {
          "x": 160.62,
          "y": 535.91,
          "pinned": false
        },
        "term:mutually exclusive": {
          "x": 152.07,
          "y": 415.77,
          "pinned": false
        },
        "term:intersection": {
          "x": 59.8,
          "y": 524.31,
          "pinned": false
        },
        "term:complement": {
          "x": 158.78,
          "y": 608.25,
          "pinned": true
        },
        "term:addition rule": {
          "x": 262.29,
          "y": 510.98,
          "pinned": false
        },
        "term:conditional probability": {
          "x": 392.81,
          "y": 273.94,
          "pinned": false
        },
        "term:independence": {
          "x": 275.91,
          "y": 167.25,
          "pinned": false
        },
        "term:multiplication rule": {
          "x": 401.69,
          "y": 93.84,
          "pinned": false
        },
        "term:Bayes' theorem": {
          "x": 228.88,
          "y": 288.32,
          "pinned": false
        },
        "term:factorial": {
          "x": 481.51,
          "y": 518.76,
          "pinned": false
        },
        "term:permutation": {
          "x": 479.93,
          "y": 407.78,
          "pinned": false
        },
        "term:combination": {
          "x": 552.03,
          "y": 590.93,
          "pinned": true
        },
        "term:equally likely": {
          "x": 383.12,
          "y": 588.22,
          "pinned": false
        },
        "term:expected value": {
          "x": 654.98,
          "y": 145.76,
          "pinned": true
        },
        "term:law of large numbers": {
          "x": 817.51,
          "y": 97.86,
          "pinned": true
        },
        "term:influence": {
          "x": 283.59,
          "y": 395.63,
          "pinned": false
        },
        "term:reduced sample space": {
          "x": 585.32,
          "y": 307.25,
          "pinned": false
        },
        "term:classical probability": {
          "x": 618.96,
          "y": 481.18,
          "pinned": false
        },
        "term:replacement": {
          "x": 374.54,
          "y": 459.26,
          "pinned": false
        },
        "term:weighted average": {
          "x": 737.29,
          "y": 252.9,
          "pinned": false
        },
        "term:convergence": {
          "x": 515.7,
          "y": 179.32,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4068.93,
        "score": 4068.930832658915
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-17T03:28:11.789Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-17T03:26:56.870Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
