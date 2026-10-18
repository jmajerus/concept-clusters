// Generated from content/puzzles/from-sample-to-population.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "from-sample-to-population",
  "title": "From Sample to Population — The Logic of Inference",
  "category": "math",
  "subcategories": {
    "math": "probability-statistics"
  },
  "info": {
    "text": "Statistical inference is how a sample earns the right to speak for a population: one law of sample behavior underwrites both ways of going on record — an interval that bets on the truth and a test that puts a claim on trial, with named margins and named mistakes.",
    "links": [
      {
        "href": "wiki:Statistical inference"
      }
    ],
    "citations": [
      {
        "title": "Introductory Statistics, ch. 7: The Central Limit Theorem (key terms)",
        "author": "Barbara Illowsky and Susan Dean",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introductory-statistics/pages/7-key-terms"
      },
      {
        "title": "Introductory Statistics, ch. 8: Confidence Intervals (key terms)",
        "author": "Barbara Illowsky and Susan Dean",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introductory-statistics/pages/8-key-terms"
      },
      {
        "title": "Introductory Statistics, ch. 9: Hypothesis Testing with One Sample (key terms)",
        "author": "Barbara Illowsky and Susan Dean",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introductory-statistics/pages/9-key-terms"
      },
      {
        "title": "Power (statistics)",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Power_(statistics)"
      }
    ]
  },
  "clusters": [
    {
      "id": "worlds",
      "name": "Two worlds",
      "color": "teal",
      "fact": "There is the population you care about and the sample you can actually afford — and each side has its own number for the same question: the parameter and the statistic.",
      "terms": [
        "population",
        "sample",
        "parameter",
        "statistic"
      ],
      "seeds": [
        "population",
        "sample"
      ],
      "termInfo": {
        "parameter": {
          "text": "A number describing the population — the true share, the true mean μ. Almost never observable; always the target.",
          "links": [
            {
              "href": "wiki:Statistical parameter"
            }
          ]
        },
        "population": {
          "text": "Everyone (or everything) the question is really about — every voter, every widget. What you'd measure if measuring everything were possible.",
          "links": [
            {
              "href": "wiki:Statistical population"
            }
          ]
        },
        "sample": {
          "text": "The part of the population actually observed; the 1,200 people polled. Inference's only source of evidence.",
          "links": [
            {
              "href": "wiki:Sampling (statistics)"
            }
          ]
        },
        "statistic": {
          "text": "A number computed from the sample — the poll's 53%, the sample mean x̄. The observable stand-in for its parameter.",
          "links": [
            {
              "href": "wiki:Statistic"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Statistical inference"
          }
        ]
      }
    },
    {
      "id": "sampling-law",
      "name": "The law of sample behavior",
      "color": "blue",
      "fact": "Samples refuse to agree with each other — but their disagreement has a shape, a width, and a guarantee, and that law is what lets one noisy sample speak for everyone.",
      "terms": [
        "sampling distribution",
        "standard error",
        "central limit theorem"
      ],
      "seeds": [
        "central limit theorem",
        "standard error"
      ],
      "termInfo": {
        "central limit theorem": {
          "text": "For large samples, the sampling distribution of the mean is approximately normal — centered on the parameter — whatever shape the population itself has.",
          "links": [
            {
              "href": "wiki:Central limit theorem"
            }
          ]
        },
        "sampling distribution": {
          "text": "The collection of a statistic's values over every possible sample — the pattern repeated polls trace. Where a statistic's behavior lives.",
          "links": [
            {
              "href": "wiki:Sampling distribution"
            }
          ]
        },
        "standard error": {
          "text": "The standard deviation of the sampling distribution — the typical distance a statistic lands from the parameter. It shrinks as samples grow: SE = σ/√n.",
          "links": [
            {
              "href": "wiki:Standard error"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sampling distribution"
          }
        ]
      }
    },
    {
      "id": "estimation",
      "name": "Estimation",
      "color": "amber",
      "fact": "The honest way to answer 'what is the parameter?' is a guess plus its price: one number from the sample, an interval around it, a stated hit rate, and the margin that sets the interval's width.",
      "terms": [
        "point estimate",
        "confidence interval",
        "confidence level",
        "margin of error"
      ],
      "seeds": [
        "confidence interval",
        "margin of error"
      ],
      "termInfo": {
        "confidence interval": {
          "text": "The point estimate plus and minus a margin of error — an interval the method catches the parameter in, sample after sample, at the promised rate.",
          "links": [
            {
              "href": "wiki:Confidence interval"
            }
          ]
        },
        "confidence level": {
          "text": "The promised hit rate: 95% of intervals built this way contain the true parameter. A property of the method, not of any one interval.",
          "links": [
            {
              "href": "wiki:Confidence interval"
            }
          ]
        },
        "margin of error": {
          "text": "The half-width of the interval: a critical value times the standard error. The price of the guess, paid in sampling variability.",
          "links": [
            {
              "href": "wiki:Margin of error"
            }
          ]
        },
        "point estimate": {
          "text": "The single number a sample offers for the parameter — the statistic itself, taken as the best guess.",
          "links": [
            {
              "href": "wiki:Point estimation"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Estimation"
          }
        ]
      }
    },
    {
      "id": "testing",
      "name": "Testing a claim",
      "color": "magenta",
      "fact": "Put a default claim on trial, agree in advance on what counts as evidence against it, and let the sample testify — the machinery that turns a surprising statistic into a decision.",
      "terms": [
        "null hypothesis",
        "alternative hypothesis",
        "p-value",
        "significance level"
      ],
      "seeds": [
        "null hypothesis",
        "p-value"
      ],
      "termInfo": {
        "alternative hypothesis": {
          "text": "The claim the evidence supports if the null is rejected — the researcher's suspicion, stated before the data arrives.",
          "links": [
            {
              "href": "wiki:Statistical hypothesis test"
            }
          ]
        },
        "null hypothesis": {
          "text": "The default claim on trial — no effect, no difference, exactly 50%. It is never proven; the only decisive verdict is rejection.",
          "links": [
            {
              "href": "wiki:Statistical hypothesis test"
            }
          ]
        },
        "p-value": {
          "text": "Assuming the null is true, the probability of a result at least as extreme as the observed one. Small means the sample is hard to explain by luck.",
          "links": [
            {
              "href": "wiki:P-value"
            }
          ]
        },
        "significance level": {
          "text": "The pre-declared threshold α for surprise — commonly 0.05. A p-value below it rejects the null; α is also the type I error rate accepted by decree.",
          "links": [
            {
              "href": "wiki:Statistical significance"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Statistical hypothesis test"
          }
        ]
      }
    },
    {
      "id": "errors",
      "name": "The two mistakes",
      "color": "olive",
      "fact": "A verdict can miss in exactly two directions — convicting the innocent or freeing the guilty — and statistics names both mistakes and the prize for avoiding the second one.",
      "terms": [
        "type I error",
        "type II error",
        "power"
      ],
      "seeds": [
        "type I error",
        "type II error"
      ],
      "termInfo": {
        "power": {
          "text": "The chance the test catches a real effect: 1 − β. It grows with sample size, clearer effects, and a more generous α.",
          "links": [
            {
              "href": "wiki:Power (statistics)"
            }
          ]
        },
        "type I error": {
          "text": "Rejecting a null that was actually true — the false alarm. Its long-run rate is the significance level α.",
          "links": [
            {
              "href": "wiki:Type I and type II errors"
            }
          ]
        },
        "type II error": {
          "text": "Failing to reject a null that was actually false — the missed discovery. Its probability is β.",
          "links": [
            {
              "href": "wiki:Type I and type II errors"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Type I and type II errors"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "inference",
      "term": "inference",
      "clusters": [
        0,
        2,
        3
      ],
      "fact": "Inference is the whole move: the parameter cannot be seen, so the sample's statistic speaks for it — estimation turns a statistic into an interval bet, and testing puts a claim about the parameter on trial before the statistic.",
      "info": {
        "links": [
          {
            "href": "wiki:Statistical inference"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "statistic",
        "confidence interval",
        "null hypothesis"
      ]
    },
    {
      "id": "unbiasedness",
      "term": "unbiasedness",
      "clusters": [
        1,
        0
      ],
      "fact": "Each sample yields its own statistic, but the statistic's sampling distribution is centered on the parameter itself — the mean of all the sample means is μ. That centering is where the sample world touches the population world.",
      "info": {
        "links": [
          {
            "href": "wiki:Bias of an estimator"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "precision",
      "term": "precision",
      "clusters": [
        2,
        1
      ],
      "fact": "A confidence interval is the point estimate plus and minus a critical value times the standard error: the margin of error is sampling variability priced at the chosen confidence — which is why bigger samples buy narrower intervals.",
      "info": {
        "links": [
          {
            "href": "wiki:Margin of error"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "tail-area",
      "term": "tail area",
      "clusters": [
        3,
        1
      ],
      "fact": "The p-value locates this sample's statistic inside the sampling distribution the null hypothesis predicts: the question is how far into the tail a statistic must fall before the null stops being believable.",
      "info": {
        "links": [
          {
            "href": "wiki:P-value"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "verdict",
      "term": "verdict",
      "clusters": [
        4,
        3
      ],
      "fact": "Every test ends in one of two verdicts — reject the null or keep it — and each can be wrong in exactly one way: type I fires at a true claim, type II misses a false one. The significance level is the type I rate set by decree; power is one minus the type II rate.",
      "info": {
        "links": [
          {
            "href": "wiki:Type I and type II errors"
          }
        ]
      },
      "relationKind": "contrast"
    }
  ],
  "lenses": [
    {
      "id": "poll-cast",
      "prompt": "A poll contacts 1,200 voters and reports 53% support. Which two terms name, respectively, everyone the conclusion is about and the 1,200 actually contacted?",
      "explanation": "Every voter in the country is the population — the whole the conclusion is about. The 1,200 actually polled are the sample, inference's only source of evidence.",
      "targets": [
        "population",
        "sample"
      ],
      "reasons": {
        "population": "all voters — the whole the poll exists to speak about",
        "sample": "the 1,200 actually contacted — the observed part"
      }
    },
    {
      "id": "truth-and-standin",
      "prompt": "The true share of all voters who support the measure is one number nobody can see; the poll's 53% is its computed stand-in. Which two terms name them?",
      "explanation": "The true support among all voters is the parameter — a number nobody can observe. The poll's 53% is a statistic, computed from the sample, standing in for it.",
      "targets": [
        "parameter",
        "statistic"
      ],
      "reasons": {
        "parameter": "the population's unobservable true value",
        "statistic": "the 53% — computed from the sample"
      }
    },
    {
      "id": "repeated-polls",
      "prompt": "Pollsters repeat the poll many times, and each poll lands on a slightly different percentage. Which term names the pattern those repeated results trace?",
      "explanation": "Repeat the poll with new samples and each gets its own percentage; the pattern those values trace is the sampling distribution. The standard error measures its width rather than being the pattern, and the central limit theorem supplies its shape.",
      "targets": [
        "sampling distribution"
      ],
      "reasons": {
        "sampling distribution": "the collection of a statistic's values over all possible samples"
      }
    },
    {
      "id": "plus-minus-three",
      "prompt": "The report reads '53%, ±3 points.' Which two terms name the ±3 points and the interval they build around 53%?",
      "explanation": "The ±3 points are the margin of error — the interval's half-width; the interval it builds around 53% is the confidence interval. The point estimate is the 53% itself, not the ±3, and the confidence level is the promise, not the width.",
      "targets": [
        "margin of error",
        "confidence interval"
      ],
      "reasons": {
        "confidence interval": "53% minus 3 to 53% plus 3 — the interval the method stands behind",
        "margin of error": "the ±3 — a critical value times the standard error"
      }
    },
    {
      "id": "skeptics-trial",
      "prompt": "A skeptic assumes the measure truly has exactly 50% support and asks how unlikely a 53% poll would be. Which two terms name the default assumption and the probability of a result at least that surprising under it?",
      "explanation": "The skeptic's working assumption — exactly 50%, nothing special — is the null hypothesis. The probability of a result at least this surprising under that assumption is the p-value. The alternative is the claim waiting if the null loses, and the significance level is the threshold, not the computed probability.",
      "targets": [
        "null hypothesis",
        "p-value"
      ],
      "reasons": {
        "null hypothesis": "the default on trial: no effect, exactly 50%",
        "p-value": "the probability, under the null, of a result at least this extreme"
      }
    },
    {
      "id": "wrong-rejection",
      "prompt": "The test rejects the 50% claim — but suppose the truth really was 50%. Which term names the mistake just made, and which names the long-run chance of making it that was set in advance?",
      "explanation": "Rejecting a null that was actually true is a type I error — the false alarm — and the test's long-run chance of committing it is exactly the significance level α set in advance. The type II error is the opposite miss, and power is its complement.",
      "targets": [
        "type I error",
        "significance level"
      ],
      "reasons": {
        "significance level": "α — the type I rate accepted by decree before the data arrived",
        "type I error": "rejecting a true null — the false alarm"
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "summarizing-data",
        "reason": "Start of the statistics arc: describing a data set before generalizing from it."
      },
      {
        "id": "rules-of-chance",
        "reason": "The middle lesson: the probability rules this inference machinery leans on."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From Sample to Population",
    "summary": "How a sample earns the right to speak for a population: the law of sample behavior underwrites an interval bet on the truth and a trial verdict on a claim, with named margins and named mistakes.",
    "estimatedMinutes": 8,
    "content": {
      "mediaType": "text/markdown",
      "text": "A poll of 1,200 voters says 53%. Nobody polled everyone — so how can the number mean anything? Statistical inference is the answer, and this lesson walks its machinery: the two worlds every number lives in, the law that lets one world speak for the other, and the two ways to put a sample on record — an interval bet and a trial verdict.\r\n\r\n## Two worlds, two numbers\r\n\r\nThe population is everyone — or everything — the question is about; the sample is the part actually observed. Each world has its own number for the same question: the parameter is the population's value, the true share or true mean, and the statistic is the sample's computation of it. The parameter is almost never observable; the statistic is all we ever hold. Everything in this lesson is traffic between those two kinds of number.\r\n\r\n## The law of sample behavior\r\n\r\nDraw a different 1,200 people and the statistic moves — that is sampling variability, and it is not chaos. Imagine every possible sample's statistic laid out: that collection is the sampling distribution, and it has a measurable width called the standard error, which shrinks as samples grow. Its shape is the punchline: the central limit theorem says that for large samples the distribution of sample means is approximately normal — bell-shaped and centered exactly on the parameter — no matter what the population itself looks like. One noisy sample can speak for everyone because the crowd of all possible samples behaves predictably.\r\n\r\n## Estimation: betting an interval\r\n\r\nTo answer 'what is the parameter?', start with the point estimate — the statistic itself, the single best guess. An honest report never stops there: a confidence interval adds and subtracts a margin of error, and the margin is the standard error priced by how sure you demand to be. The confidence level is that promise read across repeated use: intervals built this way catch the true parameter in 95% of samples — not that this particular interval is 95% likely to be right, but that the method hits 95% of the time.\r\n\r\n## Testing a claim\r\n\r\nSometimes the question is not 'what is it?' but 'could this claim be true?'. Hypothesis testing puts a default — the null hypothesis, the claim of no effect, no difference, exactly 50% — on trial, with the alternative hypothesis waiting in case the evidence overturns it. The p-value is the evidence meter: assuming the null is true, it is the probability of a result at least as extreme as the one observed. The significance level, chosen before the data arrives, is the threshold — how surprising a sample must be before the default loses and is rejected.\r\n\r\n## The two mistakes\r\n\r\nAny verdict can miss in two directions. A type I error rejects a null that was actually true — the false alarm. A type II error keeps a null that was actually false — the missed discovery. The significance level is the type I rate accepted by decree, and the mistakes pull against each other: make rejection harder and false alarms fall while missed discoveries rise. The prize for escaping the second mistake has a name — power, the chance a test catches an effect that is really there, which grows with bigger samples and clearer effects.\r\n\r\nThe poll's '53%, ±3 points' is now a whole sentence: a statistic estimating a parameter, a margin of error priced by the standard error, a method that hits 95% of the time — and, if you ran a formal test against 50%, a verdict whose error rates were chosen in advance."
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
      "puzzleId": "from-sample-to-population",
      "puzzleRevision": "fnv1a32:e6059b99",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:population": {
          "x": 372.21,
          "y": 34.26
        },
        "term:sample": {
          "x": 267,
          "y": 22
        },
        "term:parameter": {
          "x": 485.86,
          "y": 22
        },
        "term:statistic": {
          "x": 288.07,
          "y": 113.26
        },
        "term:sampling distribution": {
          "x": 664.49,
          "y": 227.9
        },
        "term:standard error": {
          "x": 676.97,
          "y": 54.76
        },
        "term:central limit theorem": {
          "x": 882.83,
          "y": 113.02
        },
        "term:point estimate": {
          "x": 806.52,
          "y": 427.9
        },
        "term:confidence interval": {
          "x": 546.15,
          "y": 461.58
        },
        "term:confidence level": {
          "x": 627.72,
          "y": 533.81
        },
        "term:margin of error": {
          "x": 773.63,
          "y": 509.3
        },
        "term:null hypothesis": {
          "x": 437.86,
          "y": 401.19
        },
        "term:alternative hypothesis": {
          "x": 145.74,
          "y": 473.79
        },
        "term:p-value": {
          "x": 248.85,
          "y": 386.28
        },
        "term:significance level": {
          "x": 136.75,
          "y": 552.85
        },
        "term:type I error": {
          "x": 90.13,
          "y": 334.59
        },
        "term:type II error": {
          "x": 106.81,
          "y": 200.01
        },
        "term:power": {
          "x": 316.48,
          "y": 204
        },
        "term:inference": {
          "x": 529.11,
          "y": 296.81
        },
        "term:unbiasedness": {
          "x": 571.06,
          "y": 119.63
        },
        "term:precision": {
          "x": 685.33,
          "y": 313.02
        },
        "term:tail area": {
          "x": 898.85,
          "y": 583.91
        },
        "term:verdict": {
          "x": 353.22,
          "y": 285.9
        },
        "cluster:0": {
          "x": 447.23,
          "y": 155.63
        },
        "cluster:1": {
          "x": 891,
          "y": 254.4
        },
        "cluster:2": {
          "x": 679.56,
          "y": 395.75
        },
        "cluster:3": {
          "x": 336.38,
          "y": 590.69
        },
        "cluster:4": {
          "x": 208.77,
          "y": 286.36
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T03:32:02.966Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "from-sample-to-population",
      "puzzleRevision": "fnv1a32:e6059b99",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:population": {
          "x": 726.21,
          "y": 330.8,
          "pinned": true
        },
        "term:sample": {
          "x": 812.36,
          "y": 380.38,
          "pinned": true
        },
        "term:parameter": {
          "x": 631.92,
          "y": 375.75,
          "pinned": true
        },
        "term:statistic": {
          "x": 608.45,
          "y": 270.27,
          "pinned": true
        },
        "term:sampling distribution": {
          "x": 743.47,
          "y": 101.43,
          "pinned": true
        },
        "term:standard error": {
          "x": 908.73,
          "y": 100.57,
          "pinned": true
        },
        "term:central limit theorem": {
          "x": 913.48,
          "y": 192.92,
          "pinned": true
        },
        "term:point estimate": {
          "x": 329.22,
          "y": 112.45,
          "pinned": true
        },
        "term:confidence interval": {
          "x": 198.72,
          "y": 185.26,
          "pinned": true
        },
        "term:confidence level": {
          "x": 155.64,
          "y": 304.55,
          "pinned": true
        },
        "term:margin of error": {
          "x": 174.66,
          "y": 69.34,
          "pinned": true
        },
        "term:null hypothesis": {
          "x": 510.1,
          "y": 445.04,
          "pinned": false
        },
        "term:alternative hypothesis": {
          "x": 648.5,
          "y": 534.04,
          "pinned": false
        },
        "term:p-value": {
          "x": 520.42,
          "y": 588.92,
          "pinned": false
        },
        "term:significance level": {
          "x": 399.91,
          "y": 549.66,
          "pinned": false
        },
        "term:type I error": {
          "x": 292.29,
          "y": 456.26,
          "pinned": false
        },
        "term:type II error": {
          "x": 167.36,
          "y": 434.87,
          "pinned": false
        },
        "term:power": {
          "x": 218.62,
          "y": 526.16,
          "pinned": false
        },
        "term:inference": {
          "x": 407.62,
          "y": 319.07,
          "pinned": true
        },
        "term:unbiasedness": {
          "x": 815.72,
          "y": 262.94,
          "pinned": false
        },
        "term:precision": {
          "x": 432.32,
          "y": 191.31,
          "pinned": true
        },
        "term:tail area": {
          "x": 912.55,
          "y": 444.08,
          "pinned": true
        },
        "term:verdict": {
          "x": 394.88,
          "y": 423.01,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4730.07,
        "score": 4730.067927401705
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T07:01:17.061Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "from-sample-to-population",
      "puzzleRevision": "fnv1a32:e6059b99",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 406.8,
          "y": 115.75,
          "pinned": true
        },
        "cluster:1": {
          "x": 876.27,
          "y": 185.05,
          "pinned": true
        },
        "cluster:2": {
          "x": 598.76,
          "y": 387.68,
          "pinned": true
        },
        "cluster:3": {
          "x": 204.83,
          "y": 478.86,
          "pinned": true
        },
        "cluster:4": {
          "x": 143.75,
          "y": 141.96,
          "pinned": true
        }
      },
      "bridges": {
        "term:inference": {
          "x": 380.81,
          "y": 329.88,
          "pinned": true
        },
        "term:unbiasedness": {
          "x": 589.1,
          "y": 67.53,
          "pinned": true
        },
        "term:precision": {
          "x": 618.2,
          "y": 215.83,
          "pinned": true
        },
        "term:tail area": {
          "x": 696.45,
          "y": 574.89,
          "pinned": true
        },
        "term:verdict": {
          "x": 247.01,
          "y": 269.87,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "population",
          "sample",
          "parameter",
          "statistic"
        ],
        "cluster:1": [
          "sampling distribution",
          "standard error",
          "central limit theorem"
        ],
        "cluster:2": [
          "point estimate",
          "confidence interval",
          "confidence level",
          "margin of error"
        ],
        "cluster:3": [
          "null hypothesis",
          "alternative hypothesis",
          "p-value",
          "significance level"
        ],
        "cluster:4": [
          "type I error",
          "type II error",
          "power"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "sample",
          "population",
          "parameter",
          "statistic"
        ],
        "cluster:1": [
          "standard error",
          "central limit theorem",
          "sampling distribution"
        ],
        "cluster:2": [
          "margin of error",
          "confidence interval",
          "confidence level",
          "point estimate"
        ],
        "cluster:3": [
          "null hypothesis",
          "alternative hypothesis",
          "significance level",
          "p-value"
        ],
        "cluster:4": [
          "power",
          "type II error",
          "type I error"
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
        "totalLength": 1756.2169045790774
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T07:03:27.567Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-17T03:29:38.443Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
