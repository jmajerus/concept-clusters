// Generated from content/puzzles/biostatistics-design-measures-inference.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "biostatistics-design-measures-inference",
  "title": "Biostatistics: Designing Studies and Measuring Risk",
  "category": "public-health",
  "subcategories": {
    "public-health": "biostatistics"
  },
  "large": true,
  "info": {
    "text": "Biostatistics connects the question a study asks to the population observed, the outcome frequency measured, the comparison made, and the uncertainty reported. Keeping those layers distinct helps prevent a numerical result from being mistaken for a causal or universal claim.",
    "citations": [
      {
        "title": "Field Epidemiology Manual: Design, Conduct, Analyze, and Interpret Field Investigations",
        "publisher": "Centers for Disease Control and Prevention",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/design-conduct-analyze-field-studies.html"
      },
      {
        "title": "Field Epidemiology Manual: Analyze and Interpret Data",
        "publisher": "Centers for Disease Control and Prevention",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html"
      },
      {
        "title": "E9(R1) Statistical Principles for Clinical Trials: Addendum on Estimands and Sensitivity Analysis",
        "publisher": "U.S. Food and Drug Administration / ICH",
        "url": "https://www.fda.gov/media/148473/download"
      }
    ]
  },
  "clusters": [
    {
      "id": "study-designs-and-populations",
      "name": "Study designs and populations",
      "color": "teal",
      "fact": "Study design determines what a biomedical observation can answer: cross-sectional studies describe a population at one time, cohorts follow groups with different exposure histories, case-control studies begin with outcome status, and randomized controlled trials assign an intervention. Target and source populations state whom the result is meant to describe and where participants come from.",
      "terms": [
        "target population",
        "source population",
        "cross-sectional study",
        "case-control study",
        "cohort study",
        "randomized controlled trial"
      ],
      "seeds": [
        "cohort study",
        "randomized controlled trial"
      ],
      "termInfo": {
        "target population": "The full group the study aims to describe or about which it intends to make an inference.",
        "source population": "The population from which eligible participants are actually drawn for the study.",
        "cross-sectional study": "A study that measures exposure and outcome at one time or period, without follow-up to establish temporal order.",
        "case-control study": "A study that selects people by outcome status and compares their prior exposures, often efficiently for rare outcomes.",
        "cohort study": "A study that begins with exposure or group status and observes outcomes over time, using new-case occurrence for comparison.",
        "randomized controlled trial": "An experiment in which participants are randomly assigned to intervention groups and their outcomes are compared."
      },
      "info": {
        "links": [
          {
            "href": "https://www.cdc.gov/field-epi-manual/php/chapters/design-conduct-analyze-field-studies.html",
            "label": "CDC: analytic study designs"
          }
        ]
      }
    },
    {
      "id": "frequencies-risks-and-associations",
      "name": "Frequencies, risks, and associations",
      "color": "blue",
      "fact": "Prevalence describes existing cases, while incidence describes new cases over time. Risk is the probability of an outcome over a specified period; a rate uses person-time. Differences and ratios then compare outcome frequency between groups: risk difference and risk ratio are natural for cohort comparisons, while odds ratio is often used for case-control data.",
      "terms": [
        "prevalence",
        "incidence",
        "risk",
        "rate",
        "risk difference",
        "risk ratio",
        "odds ratio"
      ],
      "seeds": [
        "prevalence",
        "risk"
      ],
      "termInfo": {
        "prevalence": "The proportion of a population with a condition at a specified time or during a specified period.",
        "incidence": "The occurrence of new cases in a population at risk during a specified time period.",
        "risk": "The probability that an individual experiences an outcome during a defined period.",
        "rate": "The occurrence of events per unit of person-time, allowing unequal amounts of time at risk to contribute.",
        "risk difference": "The risk in one group minus the risk in another, expressing an absolute difference in outcome probability.",
        "risk ratio": "The risk in one group divided by the risk in another, expressing a relative comparison.",
        "odds ratio": "The odds of an outcome in one group divided by the odds in another, commonly used in case-control analyses."
      },
      "info": {
        "links": [
          {
            "href": "https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html",
            "label": "CDC: measures of association and uncertainty"
          }
        ]
      }
    },
    {
      "id": "uncertainty-and-evidence",
      "name": "Uncertainty and evidence",
      "color": "amber",
      "fact": "Every sample-based result varies from study to study. Standard error and confidence interval describe precision; the null hypothesis and p-value frame a test against a specified chance model; Type I and Type II errors name opposite decision mistakes; and power describes the ability to detect an effect when one exists. Statistical significance alone does not establish validity or importance.",
      "terms": [
        "standard error",
        "confidence interval",
        "null hypothesis",
        "p-value",
        "Type I error",
        "Type II error",
        "power"
      ],
      "seeds": [
        "confidence interval",
        "power"
      ],
      "termInfo": {
        "standard error": "An estimate of how much a sample-based estimate would vary across repeated samples under the same design.",
        "confidence interval": "An interval produced by a stated method to show the values compatible with the estimate and its sampling uncertainty.",
        "null hypothesis": "The reference claim, often no association or effect, against which the observed data are evaluated.",
        "p-value": "The probability, under the null model and analysis plan, of data at least as extreme as those observed.",
        "Type I error": "Rejecting the null hypothesis when it is true, a false-positive decision.",
        "Type II error": "Failing to reject the null hypothesis when a specified effect exists, a false-negative decision.",
        "power": "The probability that a test detects a specified effect at the chosen threshold and sample size."
      },
      "info": {
        "links": [
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK223325/",
            "label": "NCBI: statistical and clinical-trials glossary"
          },
          {
            "href": "https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html",
            "label": "CDC: interpreting association and confidence intervals"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "estimand",
      "term": "estimand",
      "clusters": [
        0,
        2
      ],
      "fact": "An estimand states in detail what a study is trying to learn: the population, outcome variable, treatment or exposure comparison, and population-level summary. Defining that target before analysis keeps the design and the uncertainty statement aimed at the same scientific question.",
      "info": {
        "text": "The target of estimation that gives a scientific question a precise population-level meaning.",
        "links": [
          {
            "href": "https://www.fda.gov/media/148473/download",
            "label": "FDA/ICH E9(R1): estimands"
          }
        ]
      },
      "conceptId": "estimand",
      "relationKind": "foundation",
      "idealTerms": [
        "target population",
        "confidence interval"
      ]
    },
    {
      "id": "point-estimate",
      "term": "point estimate",
      "clusters": [
        1,
        2
      ],
      "fact": "A prevalence, risk, or association measure gives a single best value—the point estimate. A confidence interval adds the range of values compatible with the sample, so magnitude and precision are read together rather than treating one number as certainty.",
      "info": {
        "text": "The single-number summary of a sample-based quantity, interpreted alongside its uncertainty.",
        "links": [
          {
            "href": "https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html",
            "label": "CDC: measures and confidence intervals"
          }
        ]
      },
      "conceptId": "point-estimate",
      "idealTerms": [
        "risk ratio",
        "confidence interval"
      ]
    }
  ],
  "lenses": [
    {
      "id": "design-sets-the-question",
      "prompt": "Which designs organize evidence by how exposure and outcome are related in time?",
      "explanation": "Design is not a label added after analysis. A cross-sectional study samples a moment, a case-control study starts from outcome status, a cohort follows groups defined before the outcome, and a randomized controlled trial assigns the intervention. Target and source populations tell us whom the result is meant to describe and where participants came from.",
      "targets": [
        "cross-sectional study",
        "case-control study",
        "cohort study",
        "randomized controlled trial"
      ],
      "reasons": {
        "cross-sectional study": "Exposure and outcome are observed at one time or period, so the design gives a snapshot rather than follow-up order.",
        "case-control study": "Participants are selected by outcome status and their earlier exposure histories are compared.",
        "cohort study": "Groups are defined by exposure or another starting characteristic and then observed for outcomes.",
        "randomized controlled trial": "The investigator assigns the intervention before outcomes are observed, using randomization to create the comparison."
      }
    },
    {
      "id": "name-the-frequency-before-the-comparison",
      "prompt": "Which measures describe how often an outcome occurs before comparing groups?",
      "explanation": "Prevalence describes existing cases, incidence counts new cases, risk is a probability over a defined period, and rate uses person-time. Risk difference, risk ratio, and odds ratio compare groups, so they answer a later question.",
      "targets": [
        "prevalence",
        "incidence",
        "risk",
        "rate"
      ],
      "reasons": {
        "prevalence": "It describes the share of a population that has a condition at a specified time or period.",
        "incidence": "It describes new cases arising among people at risk during follow-up.",
        "risk": "It expresses the probability of an outcome for an individual over a defined period.",
        "rate": "It expresses event occurrence per unit of person-time rather than as a simple proportion."
      }
    },
    {
      "id": "compare-outcome-frequency",
      "prompt": "Which measures compare outcome frequency between two groups?",
      "explanation": "These are association measures, not raw frequencies: risk difference is an absolute gap, risk ratio is a relative comparison, and odds ratio compares odds. The appropriate choice depends on the design and the quantity the scientific question asks for.",
      "targets": [
        "risk difference",
        "risk ratio",
        "odds ratio"
      ],
      "reasons": {
        "risk difference": "It subtracts one group’s risk from the other’s to show an absolute contrast.",
        "risk ratio": "It divides one group’s risk by the other’s to show a relative contrast.",
        "odds ratio": "It compares odds between groups and is especially common when a study samples by outcome."
      }
    },
    {
      "id": "describe-precision",
      "prompt": "Which concepts describe precision around an estimate?",
      "explanation": "Standard error describes how much an estimate would vary across repeated samples; a confidence interval turns that uncertainty into a range reported with the estimate. Precision does not by itself correct bias in the design or measurement.",
      "targets": [
        "standard error",
        "confidence interval"
      ],
      "reasons": {
        "standard error": "It summarizes the expected sampling variation of an estimate.",
        "confidence interval": "It reports a range generated by a stated method to display sampling uncertainty around the estimate."
      }
    },
    {
      "id": "testing-decisions-have-risks",
      "prompt": "Which terms belong to a hypothesis-testing decision framework?",
      "explanation": "The null supplies the reference claim, the p-value measures how surprising the data are under it, Type I and Type II errors name opposite decision mistakes, and power is the chance of detecting a specified effect. None of these proves that a result is important or unbiased.",
      "targets": [
        "null hypothesis",
        "p-value",
        "Type I error",
        "Type II error",
        "power"
      ],
      "reasons": {
        "null hypothesis": "It supplies the reference claim against which the data are evaluated.",
        "p-value": "It quantifies how unusual the observed data would be if that reference claim and model held.",
        "Type I error": "It is the false-positive mistake of rejecting a true null hypothesis.",
        "Type II error": "It is the false-negative mistake of failing to detect a specified effect.",
        "power": "It is the probability of detecting a specified effect under the chosen testing conditions."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "biostatistics-validity-models-diagnostics",
        "reason": "Continue from measured associations and uncertainty to validity, outcome-specific models, and diagnostic performance."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From observations to defensible claims",
    "summary": "Align study design, population, outcome measure, comparison, and uncertainty before interpreting a biomedical result.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Biostatistics turns observations from people into claims that can survive scrutiny. The first question is what was observed and under what design: a population at one time, new events over follow-up, groups compared by exposure, or an assigned intervention. The population a study aims to describe matters as much as the people enrolled.\r\n\r\nThen keep three questions separate: how common an outcome is, how two groups differ, and how much uncertainty surrounds the estimate. A carefully defined target, an appropriate measure, and an honest account of precision make a result easier to interpret—and make its limits visible."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (GPT-5.6 Luna)",
        "reasoning": "max"
      }
    ]
  }
});
