import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  id: "from-evidence-to-action",
  title: "From Evidence to Action",
  category: "Public Health",
  large: true,
  info: {
    text: "Public-health decisions move through a revisable cycle: observe what is happening, compare explanations, choose an intervention, and evaluate what follows.",
    link: "wiki:Evidence-based medicine"
  },
  relatedPuzzles: {
    info: {
      text: "These introductory Public Health puzzles connect the work public health performs with the reasoning process that guides it."
    },
    entries: [
      {
        id: "what-public-health-does",
        via: ["public-health-surveillance", "evidence-based-action"],
        reason: "Return to the broader map of surveillance, prevention, environmental protection, and coordinated response."
      }
    ]
  },
  learningIntroduction: {
    requirement: "recommended",
    title: "Reasoning from Evidence",
    summary: "Distinguish observations, explanations, and revisable decisions before organizing the public-health concepts in this puzzle.",
    estimatedMinutes: 4,
    revision: 1,
    content: {
      src: "./from-evidence-to-action.intro.md",
      mediaType: "text/markdown"
    }
  },
  lenses: [
    {
      id: "reveals-but-does-not-explain",
      prompt: "Which concepts can reveal that a health pattern exists without, by themselves, proving what caused it?",
      targets: [
        "case counts",
        "hospital reports",
        "wastewater sampling",
        "trend"
      ],
      explanation: "Descriptive observations can show that something is changing, but causal explanation usually requires comparison, alternative hypotheses, and attention to bias and confounding.",
      reasons: {
        "case counts": "They show how many recognized cases were recorded, not why the change occurred.",
        "hospital reports": "They reveal burdens seen in care settings but may not represent everyone in the population.",
        "wastewater sampling": "It can reveal changing community-level signals without identifying every case or causal factor.",
        "trend": "A pattern over time is an observation that still requires explanation."
      }
    },
    {
      id: "can-change-with-new-evidence",
      prompt: "Which concepts may appropriately change as evidence accumulates?",
      targets: [
        "risk factor",
        "public advisory",
        "effectiveness",
        "adverse events",
        "updated guidance"
      ],
      explanation: "Revising an estimate, recommendation, or interpretation can be evidence that a system is learning. The important questions are what changed, why, and whether the revision follows the evidence.",
      reasons: {
        "risk factor": "Its estimated importance can change as studies improve or populations differ.",
        "public advisory": "Recommendations may be revised as circumstances and evidence change.",
        "effectiveness": "Real-world performance estimates become more precise as follow-up data accumulate.",
        "adverse events": "Initial reports require continuing investigation to distinguish coincidence, signal, and cause.",
        "updated guidance": "Its purpose is to incorporate new evidence or changed conditions."
      }
    },
    {
      id: "requires-comparison",
      prompt: "Which concepts depend on comparing groups, conditions, or time periods?",
      targets: [
        "incidence",
        "control group",
        "effectiveness",
        "unintended effects"
      ],
      explanation: "Comparison helps separate what happened after an intervention from what would likely have happened without it, while also revealing differences across groups and time.",
      reasons: {
        "incidence": "It relates new events to a population and period so rates can be compared.",
        "control group": "It supplies a reference condition for judging what changed under an intervention.",
        "effectiveness": "It is assessed by comparing outcomes under real-world use with an appropriate alternative.",
        "unintended effects": "They become visible by comparing expected and observed outcomes across settings or groups."
      }
    },
    {
      id: "correction-built-in",
      prompt: "Which concepts help public health detect mistakes, limits, or changing conditions after action begins?",
      targets: [
        "follow-up data",
        "adverse events",
        "unintended effects",
        "updated guidance",
        "feedback loop"
      ],
      explanation: "A corrigible system keeps observing after acting. It looks for benefits, harms, surprises, and changed conditions, then revises its decisions rather than treating the first answer as final.",
      reasons: {
        "follow-up data": "They show what happened after implementation over a longer period.",
        "adverse events": "They provide possible safety signals that require investigation.",
        "unintended effects": "They reveal consequences that were not part of the intended result.",
        "updated guidance": "It turns new findings into revised recommendations.",
        "feedback loop": "It returns observed results to the decision process so later action can improve."
      }
    }
  ],
  clusters: [
    {
      name: "Observe",
      color: "teal",
      fact: "Public-health inquiry begins by assembling observations from different sources, because no single stream captures every case, exposure, behavior, or outcome.",
      terms: [
        "case counts",
        "laboratory testing",
        "population surveys",
        "hospital reports",
        "wastewater sampling"
      ],
      seeds: [
        "case counts",
        "laboratory testing"
      ],
      termInfo: {
        "case counts": {
          text: "The number of recognized cases recorded within a defined population and period.",
          link: "wiki:Disease surveillance"
        },
        "laboratory testing": {
          text: "Testing specimens or samples for biological, chemical, or other evidence relevant to health.",
          link: "wiki:Medical laboratory"
        },
        "population surveys": {
          text: "Structured collection of information from a sample or population about health, behavior, or conditions.",
          link: "wiki:Survey methodology"
        },
        "hospital reports": {
          text: "Information from hospitals about diagnoses, admissions, capacity, and patient outcomes.",
          link: "wiki:Health information management"
        },
        "wastewater sampling": {
          text: "Testing sewage for biological or chemical markers that can reveal population-level trends.",
          link: "wiki:Wastewater-based epidemiology"
        }
      },
      info: {
        link: "wiki:Public health surveillance"
      }
    },
    {
      name: "Compare and explain",
      color: "blue",
      fact: "Evidence becomes more informative when observations are made comparable, alternative explanations are tested, and factors that can distort an apparent relationship are considered.",
      terms: [
        "incidence",
        "control group",
        "risk factor",
        "trend",
        "confounding"
      ],
      seeds: [
        "incidence",
        "risk factor"
      ],
      termInfo: {
        "incidence": {
          text: "The occurrence of new cases or events in a population during a specified period.",
          link: "wiki:Incidence (epidemiology)"
        },
        "control group": {
          text: "A comparison group that does not receive the intervention being evaluated, or receives a different condition.",
          link: "wiki:Treatment and control groups"
        },
        "risk factor": {
          text: "A characteristic or exposure associated with a higher probability of a health outcome.",
          link: "wiki:Risk factor"
        },
        "trend": {
          text: "A sustained pattern of increase, decrease, or change observed across time or groups.",
          link: "wiki:Trend estimation"
        },
        "confounding": {
          text: "Distortion that occurs when another factor is associated with both the suspected cause and the observed outcome.",
          link: "wiki:Confounding"
        }
      },
      info: {
        link: "wiki:Epidemiology"
      }
    },
    {
      name: "Choose an intervention",
      color: "amber",
      fact: "Choosing an intervention requires more than identifying a problem: decision-makers must consider expected benefit, feasibility, proportionality, available resources, and the people affected.",
      terms: [
        "vaccination campaign",
        "safety standard",
        "public advisory",
        "screening program",
        "environmental control"
      ],
      seeds: [
        "vaccination campaign",
        "safety standard"
      ],
      termInfo: {
        "vaccination campaign": {
          text: "An organized effort to make vaccination available and increase protection in a target population.",
          link: "wiki:Vaccination policy"
        },
        "safety standard": {
          text: "A defined requirement intended to reduce exposure, injury, or other preventable harm.",
          link: "wiki:Safety standards"
        },
        "public advisory": {
          text: "An official communication describing a health risk and recommended protective action.",
          link: "wiki:Risk communication"
        },
        "screening program": {
          text: "An organized effort to identify possible disease or risk in people without recognized symptoms.",
          link: "wiki:Screening (medicine)"
        },
        "environmental control": {
          text: "A change to physical or shared conditions intended to reduce exposure to a health hazard.",
          link: "wiki:Environmental health"
        }
      },
      info: {
        link: "wiki:Public health intervention"
      }
    },
    {
      name: "Evaluate and revise",
      color: "magenta",
      fact: "Public-health action remains provisional: benefits, harms, implementation problems, and changed conditions are monitored so guidance can be confirmed, refined, or replaced.",
      terms: [
        "effectiveness",
        "adverse events",
        "follow-up data",
        "unintended effects",
        "updated guidance"
      ],
      seeds: [
        "effectiveness",
        "follow-up data"
      ],
      termInfo: {
        "effectiveness": {
          text: "How well an intervention produces its intended benefit under real-world conditions.",
          link: "wiki:Effectiveness"
        },
        "adverse events": {
          text: "Unfavorable health events occurring after an intervention, whether or not the intervention caused them.",
          link: "wiki:Adverse event"
        },
        "follow-up data": {
          text: "Information collected after an intervention to assess later outcomes and continuing effects.",
          link: "wiki:Follow-up study"
        },
        "unintended effects": {
          text: "Consequences of an intervention that were not among its intended results.",
          link: "wiki:Unintended consequences"
        },
        "updated guidance": {
          text: "Recommendations revised in response to new evidence, changed conditions, or improved understanding.",
          link: "wiki:Clinical practice guideline"
        }
      },
      info: {
        link: "wiki:Program evaluation"
      }
    }
  ],
  bridges: [
    {
      term: "epidemiology",
      conceptId: "epidemiology",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact: "Epidemiology turns observations into comparable population patterns and tests explanations for how health events are distributed and what may influence them.",
      idealTerms: [
        "population surveys",
        "incidence"
      ],
      info: {
        text: "The study of the distribution and determinants of health-related events in populations, and the application of that study to health problems.",
        link: "wiki:Epidemiology"
      }
    },
    {
      term: "weight of evidence",
      conceptId: "weight-of-evidence",
      clusters: [1, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 1,
        to: 2
      },
      fact: "The weight of evidence integrates the quality, consistency, relevance, and limitations of multiple findings so action does not depend on one anecdote, study, or statistic.",
      idealTerms: [
        "confounding",
        "public advisory"
      ],
      info: {
        text: "A judgment based on the combined strength and limitations of the available evidence rather than any single result.",
        link: "wiki:Scientific evidence"
      }
    },
    {
      term: "feedback loop",
      conceptId: "evidence-based-action",
      clusters: [2, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 3
      },
      fact: "A feedback loop makes action corrigible: an intervention produces new observations about benefit, harm, and implementation, which return to the decision process and shape what happens next.",
      idealTerms: [
        "screening program",
        "follow-up data"
      ],
      info: {
        text: "A process in which the observed results of an action are returned as information for later decisions.",
        link: "wiki:Feedback"
      }
    }
  ]
});
