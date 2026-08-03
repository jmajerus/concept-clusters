// Generated from content/puzzles/what-a-test-result-means.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "what-a-test-result-means",
  "title": "What a Test Result Means",
  "category": "Public Health",
  "large": true,
  "info": {
    "link": "wiki:Screening (medicine)",
    "text": "A test result is not a diagnosis: what it implies depends on how the test performs, who was tested, and what happens after the result arrives."
  },
  "relatedPuzzles": {
    "info": {
      "text": "These Public Health puzzles examine how populations are observed, how evidence is judged, and how action follows from uncertain information."
    },
    "entries": [
      {
        "id": "from-evidence-to-action",
        "via": [
          "weight of evidence"
        ],
        "reason": "See how a single uncertain measurement fits into the larger process of comparing evidence and choosing an intervention."
      },
      {
        "id": "what-public-health-does",
        "via": [
          "surveillance"
        ],
        "reason": "Place screening within the broader work of detecting problems early and protecting populations."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "All of these are probabilities, and confusion between them is the central difficulty of testing. They differ in what is held fixed: sensitivity and specificity condition on whether the person has the condition, predictive values condition on what the test said, and prevalence and pre-test probability describe likelihood before any result exists.",
      "id": "conditional-probability",
      "prompt": "Which concepts state how likely something is, given that something else is already known or assumed?",
      "reasons": {
        "negative predictive value": "The probability that the condition is absent, given a negative result.",
        "positive predictive value": "The probability that the condition is present, given a positive result.",
        "pre-test probability": "The likelihood that the condition is present before the result is known.",
        "prevalence": "The proportion of a defined population that has the condition at a given time.",
        "sensitivity": "The probability that the test is positive, given that the condition is present.",
        "specificity": "The probability that the test is negative, given that the condition is absent."
      },
      "targets": [
        "sensitivity",
        "specificity",
        "prevalence",
        "positive predictive value",
        "negative predictive value",
        "pre-test probability"
      ]
    }
  ],
  "learningIntroduction": {
    "content": {
      "mediaType": "text/markdown",
      "text": "# Two Different Questions\n\nWhen a test comes back positive, it is tempting to treat the result as an answer. It is better understood as evidence that shifts a probability.\n\nTwo questions are easy to blur together, and keeping them apart is most of the work in this puzzle.\n\n## What does this test do?\n\nThe first question is answered by studying the test against cases where the truth is already known. It asks: among people who genuinely have the condition, how often does the test detect it? Among people who genuinely do not, how often does it correctly stay negative?\n\nThese are properties of the instrument. They do not change when the test is carried to a different clinic or a different country.\n\n## What does this result mean for this person?\n\nThe second question is the one a patient actually asks: given that my result is positive, how likely is it that I have the condition?\n\nThis is a different question, because it conditions on the result rather than on the truth. And its answer depends on something the test knows nothing about: how common the condition is among the people being tested.\n\nA test with excellent properties, applied to a population where the condition is rare, will still produce many positive results that are wrong. Not because the test failed, but because there were far more people without the condition available to be misclassified.\n\n## Testing does not end with the result\n\nA result sets other things in motion: further tests to confirm it, treatment decisions, and sometimes the detection of conditions that would never have caused harm if left alone.\n\nThese consequences are part of what a testing program means, not a footnote to it.\n\n---\n\nAs you begin, keep asking of each term: is this a fact about the test, a fact about the people being tested, a fact about what a result implies, or a fact about what happens next?\n"
    },
    "estimatedMinutes": 4,
    "requirement": "recommended",
    "revision": 1,
    "summary": "Separate what a test does from what a result tells you, so the puzzle's four groups stay distinct.",
    "title": "Before You Begin"
  },
  "clusters": [
    {
      "id": "cluster-how-the-test-performs",
      "name": "How the test performs",
      "color": "teal",
      "fact": "Sensitivity, specificity, and reliability are measured by comparing a test against a reference standard in people whose true condition is already known, so they describe the instrument rather than any particular patient.",
      "terms": [
        "sensitivity",
        "specificity",
        "reference standard",
        "reliability"
      ],
      "seeds": [
        "sensitivity",
        "specificity"
      ],
      "termInfo": {
        "reference standard": {
          "text": "The best available means of establishing whether the condition is truly present, against which a test is compared."
        },
        "reliability": {
          "text": "How consistently a test produces the same result when repeated under the same conditions."
        },
        "sensitivity": {
          "link": "wiki:Sensitivity and specificity",
          "text": "How often a test correctly identifies people who do have the condition."
        },
        "specificity": {
          "text": "How often a test correctly identifies people who do not have the condition."
        }
      },
      "info": {
        "link": "wiki:Sensitivity and specificity"
      }
    },
    {
      "id": "cluster-who-is-being-tested",
      "name": "Who is being tested",
      "color": "blue",
      "fact": "The same test carries different weight in different populations: how common a condition is among the people being tested changes what any individual result can support.",
      "terms": [
        "prevalence",
        "risk group",
        "base rate",
        "asymptomatic population"
      ],
      "seeds": [
        "prevalence",
        "risk group"
      ],
      "termInfo": {
        "asymptomatic population": {
          "text": "People tested despite having no symptoms, which is the usual situation in screening."
        },
        "base rate": {
          "text": "How common something is before any particular evidence is considered."
        },
        "prevalence": {
          "link": "wiki:Prevalence",
          "text": "The proportion of a population that has a condition at a given time."
        },
        "risk group": {
          "text": "A subset of people whose characteristics make the condition more likely than in the general population."
        }
      },
      "info": {
        "link": "wiki:Prevalence"
      }
    },
    {
      "id": "cluster-what-a-result-implies",
      "name": "What a result implies",
      "color": "amber",
      "fact": "Predictive values answer the question a tested person actually asks, and unlike sensitivity and specificity they change whenever the condition becomes more or less common among those tested.",
      "terms": [
        "false positive",
        "false negative",
        "positive predictive value",
        "negative predictive value"
      ],
      "seeds": [
        "false positive",
        "false negative"
      ],
      "termInfo": {
        "false negative": {
          "text": "A negative result in someone who does have the condition."
        },
        "false positive": {
          "text": "A positive result in someone who does not have the condition."
        },
        "negative predictive value": {
          "text": "Among those who test negative, the proportion who actually do not have the condition."
        },
        "positive predictive value": {
          "link": "wiki:Positive and negative predictive values",
          "text": "Among those who test positive, the proportion who actually have the condition."
        }
      }
    },
    {
      "id": "cluster-what-follows-from-testing",
      "name": "What follows from testing",
      "color": "magenta",
      "fact": "A testing program is judged by what it sets in motion, including confirmatory work, treatment that may not have been needed, and apparent survival gains that reflect earlier detection rather than longer life.",
      "terms": [
        "confirmatory testing",
        "overdiagnosis",
        "overtreatment",
        "lead-time bias"
      ],
      "seeds": [
        "confirmatory testing",
        "overdiagnosis"
      ],
      "termInfo": {
        "confirmatory testing": {
          "text": "Further investigation used to establish whether an initial result holds up."
        },
        "lead-time bias": {
          "text": "Apparent longer survival that comes only from diagnosing a condition earlier, not from changing its course."
        },
        "overdiagnosis": {
          "link": "wiki:Overdiagnosis",
          "text": "Correctly detecting a condition that would never have caused symptoms or harm during the person's life."
        },
        "overtreatment": {
          "text": "Treatment given for a condition whose detection brought no benefit to the person treated."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-pre-test-probability",
      "term": "pre-test probability",
      "clusters": [
        1,
        2
      ],
      "fact": "Pre-test probability is what carries the population into the individual result: the more common the condition is among those tested, the more a positive result can support, which is why an unchanged test yields a lower positive predictive value in a low-prevalence group.",
      "conceptId": "pre-test-probability",
      "relationKind": "dynamic",
      "info": {
        "text": "The likelihood that a person has the condition before their test result is known."
      },
      "idealTerms": [
        "prevalence",
        "positive predictive value"
      ]
    },
    {
      "id": "bridge-likelihood-ratio",
      "term": "likelihood ratio",
      "clusters": [
        0,
        2
      ],
      "fact": "A likelihood ratio is built entirely from sensitivity and specificity, yet its work is done on the other side of the loop: it converts what was already believed about a person into what should be believed after the result, which is how a fixed test property becomes a changed prediction.",
      "conceptId": "likelihood-ratio",
      "relationKind": "dynamic",
      "info": {
        "text": "How much more likely a given result is in someone with the condition than in someone without it."
      },
      "idealTerms": [
        "sensitivity",
        "positive predictive value"
      ]
    },
    {
      "id": "bridge-screening-threshold",
      "term": "screening threshold",
      "clusters": [
        0,
        3
      ],
      "fact": "Where the threshold is set decides the trade the program makes: a more inclusive cutoff raises sensitivity while lowering specificity, sending more people to confirmatory testing and detecting more conditions that would never have caused harm.",
      "conceptId": "screening-threshold",
      "relationKind": "dynamic",
      "info": {
        "text": "The cutoff at which a measured value is treated as a positive result."
      },
      "idealTerms": [
        "specificity",
        "confirmatory testing"
      ]
    }
  ]
});
