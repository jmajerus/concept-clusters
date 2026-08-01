// Concept Clusters puzzle: Counted and modeled
// Essay-derived catalogue: Vectors — How Health Misinformation Kills
// Source: Piece 6, "The Body Count"
// https://blog.majerus.us/vectors-6-the-body-count/
//
// All four clusters carry field-consensus membership; the source's own
// contribution — that an accounting owes its reader the evidentiary status
// of every figure in it — is carried by the bridge facts and the lenses.
// No specific mortality figure appears here: the puzzle teaches how a number
// earns the claim it is used to make, not what any particular number was.

export default {
  "id": "counted-and-modeled",
  "title": "Counted and modeled",
  "category": "Media & Information Literacy",
  "large": true,
  "info": {
    "text": "Four ways of establishing how many — direct counts, estimates that correct for what counting missed, attribution from individual records, and projections of what would have happened otherwise. Each answers a different question, and an accounting that blurs them discredits itself.",
    "link": "wiki:Statistical inference",
    "extraLink": "https://blog.majerus.us/vectors-6-the-body-count/"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Compare how different fields establish what happened, and how claims are tested once established."
    },
    "entries": [
      {
        "id": "evidence-and-inference-across-disciplines",
        "via": [
          "corroboration",
          "provenance"
        ],
        "reason": "Move from how one discipline grades its own evidence to how science, history, law, and journalism grade theirs differently."
      },
      {
        "id": "data-probability",
        "via": [
          "sample",
          "distribution"
        ],
        "reason": "Revisit the statistical machinery — sampling, distribution, likelihood — underneath every estimate on this map."
      },
      {
        "id": "when-correction-fails",
        "via": [
          "contradictory evidence"
        ],
        "reason": "Follow what happens after a figure is well established and still not received."
      }
    ]
  },
  "lenses": [
    {
      "id": "where-the-assumption-enters",
      "prompt": "Which concepts depend on an assumption that can either be stated plainly or left unstated?",
      "targets": [
        "expected baseline",
        "case ascertainment",
        "counterfactual scenario",
        "modeling assumption",
        "attributable fraction"
      ],
      "explanation": "Every step away from a direct count introduces an assumption. The discipline is not avoiding assumptions — no useful account of a large event can be built from certificates alone — but declaring them, so a reader can locate where a figure is carrying weight it was not built to carry.",
      "reasons": {
        "expected baseline": "What would have happened anyway is never observed; it is constructed from prior years and a choice about which ones.",
        "case ascertainment": "How completely cases were captured must be estimated, and the estimate governs every correction built on it.",
        "counterfactual scenario": "The comparison world does not exist and cannot be measured, only specified.",
        "modeling assumption": "The stated inputs a projection runs on, and the place where a reader should look first.",
        "attributable fraction": "Requires both an observed outcome and a specified alternative, so it inherits the assumptions of the alternative."
      }
    },
    {
      "id": "what-a-floor-means",
      "prompt": "Which concepts describe a deliberate limit that makes an estimate smaller than the truth it points at?",
      "targets": [
        "bounded time window",
        "underreporting",
        "confidence interval",
        "excess mortality"
      ],
      "explanation": "A conservative estimate is not a cautious guess at the middle. It is a figure built so that the real value is very unlikely to be lower — by excluding periods, by excluding cases that could not be confirmed, by reporting the range rather than the point. Read as a best guess, a floor understates. Read as a floor, it is the strongest kind of number an argument can rest on.",
      "reasons": {
        "bounded time window": "Restricting the period excludes real events outside it, pushing the total down by design.",
        "underreporting": "Cases that were never recorded cannot enter a count, so the count begins below the truth.",
        "confidence interval": "Reporting a range rather than a single value shows where the estimate is firm and where it is not.",
        "excess mortality": "Built to capture deaths that direct certification missed, and therefore usually larger than the official count."
      }
    }
  ],
  "clusters": [
    {
      "name": "Directly counted",
      "color": "teal",
      "fact": "A counted event is one with a record attached — a certificate, a confirmed test, a registry entry. Its strength is that it happened. Its limit is that it can only see what someone recorded.",
      "terms": [
        "death certificate",
        "laboratory-confirmed case",
        "notifiable disease report",
        "vital statistics"
      ],
      "seeds": [
        "death certificate",
        "laboratory-confirmed case"
      ],
      "termInfo": {
        "death certificate": "The official document recording a death and the cause assigned to it by a certifying clinician.",
        "laboratory-confirmed case": "An event established by a test result rather than by clinical judgment or self-report.",
        "notifiable disease report": "A case a clinician or laboratory is legally required to report to a public health authority.",
        "vital statistics": {
          "text": "The systematic civil registration of births, deaths, and causes of death.",
          "link": "wiki:Public records"
        }
      },
      "info": {
        "link": "wiki:Primary source"
      }
    },
    {
      "name": "Estimated from incomplete counts",
      "color": "blue",
      "fact": "Where recording is known to be incomplete, the gap itself is estimated — which requires a model of what complete recording would have produced, and therefore a stated assumption.",
      "terms": [
        "expected baseline",
        "underreporting",
        "case ascertainment",
        "surveillance gap"
      ],
      "seeds": [
        "expected baseline",
        "underreporting"
      ],
      "termInfo": {
        "expected baseline": "The number of events that would have been expected in a period absent the event under study, derived from historical trend.",
        "underreporting": "The shortfall between events that occurred and events that entered the record.",
        "case ascertainment": "The proportion of true cases a surveillance system actually detects and records.",
        "surveillance gap": "A population, region, or period a monitoring system does not effectively cover."
      },
      "info": {
        "link": "wiki:Statistical inference"
      }
    },
    {
      "name": "Attributed from individual records",
      "color": "amber",
      "fact": "Linking individual outcomes to individual exposures answers a question no aggregate can: not how many events occurred, but how many occurred in one group and not the other.",
      "terms": [
        "cohort comparison",
        "record linkage",
        "confidence interval",
        "bounded time window"
      ],
      "seeds": [
        "cohort comparison",
        "confidence interval"
      ],
      "termInfo": {
        "cohort comparison": "Following two groups that differ in one exposure and comparing what happens to each.",
        "record linkage": "Joining separate datasets about the same individuals so that exposure and outcome can be examined together.",
        "confidence interval": "The range within which a true value is expected to lie, reported alongside the estimate itself.",
        "bounded time window": "An explicitly stated start and end date, outside which the study makes no claim at all."
      },
      "info": {
        "link": "wiki:Scientific control"
      }
    },
    {
      "name": "Projected under a counterfactual",
      "color": "magenta",
      "fact": "A projection answers a question no count can reach — what would have happened otherwise — and pays for that reach with assumptions it is obliged to declare.",
      "terms": [
        "counterfactual scenario",
        "modeling assumption",
        "scenario projection",
        "sensitivity analysis"
      ],
      "seeds": [
        "counterfactual scenario",
        "modeling assumption"
      ],
      "termInfo": {
        "counterfactual scenario": "A specified alternative world used as the comparison against which an effect is measured.",
        "modeling assumption": "An input a model requires but cannot observe, chosen and stated by the people who built it.",
        "scenario projection": "An estimate of what a specified set of conditions would produce, as distinct from a record of what did happen.",
        "sensitivity analysis": "Systematically varying assumptions to show how much the result depends on each one."
      },
      "info": {
        "link": "wiki:Scientific method"
      }
    }
  ],
  "bridges": [
    {
      "term": "excess mortality",
      "conceptId": "excess-mortality",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Excess mortality is computed from counted deaths but exists only relative to a modeled baseline. It is the point at which a count becomes an estimate — which is why it usually exceeds the official tally, and why it belongs to neither category alone.",
      "idealTerms": [
        "vital statistics",
        "expected baseline"
      ],
      "info": {
        "text": "The difference between deaths actually observed in a period and the deaths that would have been expected without the event under study."
      }
    },
    {
      "term": "attributable fraction",
      "conceptId": "attributable-fraction",
      "clusters": [
        1,
        2
      ],
      "relationKind": "evaluation",
      "fact": "An attributable fraction needs both an observed outcome and a specified alternative. The figure is meaningless without saying which of the two is doing more of the work — and conflating a share attributed from records with a total projected from a scenario is the most common way a consequence argument discredits itself.",
      "idealTerms": [
        "case ascertainment",
        "cohort comparison"
      ],
      "info": {
        "text": "The proportion of outcomes in a population that can be ascribed to a particular exposure rather than to background risk."
      }
    },
    {
      "term": "declared method",
      "conceptId": "declared-method",
      "clusters": [
        2,
        3
      ],
      "relationKind": "foundation",
      "fact": "An attribution study and a scenario projection rest on the same foundation: a method stated in advance. Without it a reader cannot tell where the estimate could be wrong, and is left taking the figure on trust — which is the one thing a number is supposed to make unnecessary.",
      "idealTerms": [
        "bounded time window",
        "modeling assumption"
      ],
      "info": {
        "text": "The published account of how an estimate was produced, which is what makes it checkable by someone who did not produce it.",
        "link": "wiki:Scientific method"
      }
    }
  ]
};
