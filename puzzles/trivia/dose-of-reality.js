// Concept Clusters puzzle: Dose of Reality
// Trivia uses an author-forced pre-solve: the three clusters are context
// for the fallacy-identification questions, not a sorting challenge in
// their own right (see the other puzzles in this directory for the same
// pattern). Lives under category "Trivia" for the same reason those
// do -- general, unverified-recall knowledge rather than independently
// cited content the way this project's other puzzles cite a source via
// info.link. Spot-check before treating this as citable.

export default {
  id: "dose-of-reality",
  title: "Dose of Reality",
  category: "Trivia",
  large: true,
  preSolve: true,
  info: {
    text: "Separate biological facts from viral internet rabbit holes using immunology and diagnostic media literacy."
  },
  clusters: [
    {
      name: "Principles of Vaccine Immunity",
      color: "teal",
      fact: "Vaccines introduce safe, attenuated, or synthetic antigens to train the adaptive immune system to produce targeted antibodies and memory cells without causing severe disease.",
      terms: [
        "Adaptive Immune Memory",
        "Antigen Recognition",
        "Herd Immunity Threshold",
        "Antibody Response",
        "Pathogen Attenuation"
      ],
      seeds: ["Adaptive Immune Memory", "Antigen Recognition"]
    },
    {
      name: "Regulatory Safety & Clinical Testing",
      color: "blue",
      fact: "Vaccine authorization requires rigorous multi-phase randomized trials followed by continuous population-level surveillance to detect rare adverse reactions.",
      terms: [
        "Multi-Phase Clinical Trials",
        "Post-Market Pharmacovigilance",
        "Adverse Event Reporting",
        "Institutional Review Boards",
        "Placebo-Controlled Efficacy"
      ],
      seeds: ["Multi-Phase Clinical Trials", "Post-Market Pharmacovigilance"]
    },
    {
      name: "Disinformation & Fallacy Mechanics",
      color: "amber",
      fact: "Anti-vaccine campaigns frequently exploit cognitive biases by presenting unverified personal stories, treating temporal sequence as causation, or misrepresenting raw reporting databases.",
      terms: [
        "Correlation-Causation Confusion",
        "Anecdotal Fallacy",
        "Cherry-Picked Data",
        "Appeal to Nature",
        "Passive System Misinterpretation"
      ],
      seeds: ["Correlation-Causation Confusion", "Anecdotal Fallacy"]
    }
  ],
  // A 0-1-2 chain, same shape as film-classics: translating individual
  // biological immunity into population-level metrics (0-1), then how
  // those same monitoring systems get misread by disinformation (1-2).
  bridges: [
    {
      term: "Population Risk Reduction",
      clusters: [0, 1],
      fact: "Translates individual biological immunity into community-wide disease suppression monitored by trial safety metrics."
    },
    {
      term: "Surveillance Data Misuse",
      clusters: [1, 2],
      fact: "Highlights how open, passive safety databases (e.g., VAERS) are improperly cited as proof of side effects rather than unverified signals.",
      termRole: "connector",
      info: {
        text: "The specific error this puzzle names: citing an open, passive safety database like VAERS as proof of side effects, when it only records unverified signals."
      }
    }
  ],
  lensMode: "quiz",
  lenses: [
    {
      id: "correlation-causation-confusion",
      prompt: "A viral post asserts that a vaccine caused a medical condition simply because someone developed symptoms two days after their shot. Which logical flaw is being committed?",
      options: [
        {
          id: "correlation-causation-confusion",
          label: "Correlation-Causation Confusion",
          targets: ["Correlation-Causation Confusion"],
          correct: true
        },
        { id: "confirmation-bias", label: "Confirmation Bias", targets: [] },
        { id: "survivorship-bias", label: "Survivorship Bias", targets: [] },
        {
          id: "orbital-laser",
          label: "Targeted Orbital Space Laser Calibration",
          targets: []
        }
      ],
      explanation: "Event sequence alone does not establish causation. Health events naturally occur at baseline rates in any population; proving a link requires controlled comparison between vaccinated and unvaccinated cohorts."
    },
    {
      id: "passive-system-misinterpretation",
      prompt: "Unverified, crowd-sourced reports in open surveillance systems (like VAERS) are frequently cited in blogs as \"proven vaccine fatalities.\" What is the primary data literacy error?",
      options: [
        { id: "selection-bias", label: "Selection Bias", targets: [] },
        {
          id: "passive-system-misinterpretation",
          label: "Passive System Misinterpretation",
          targets: ["Passive System Misinterpretation"],
          correct: true
        },
        { id: "ecological-fallacy", label: "Ecological Fallacy", targets: [] },
        {
          id: "lizard-person-microchip",
          label: "Subliminal Lizard-Person Microchip Activation",
          targets: []
        }
      ],
      explanation: "Passive surveillance systems accept raw, unvetted public submissions to spot early statistical anomalies. They explicitly state they are not curated logs of confirmed injuries."
    },
    {
      id: "appeal-to-nature",
      prompt: "An article argues that contracting a disease naturally is inherently superior and safer than vaccination because \"nature knows best,\" ignoring historical mortality rates. Which fallacy is this?",
      options: [
        { id: "moralistic-fallacy", label: "Moralistic Fallacy", targets: [] },
        { id: "appeal-to-tradition", label: "Appeal to Tradition", targets: [] },
        {
          id: "appeal-to-nature",
          label: "Appeal to Nature",
          targets: ["Appeal to Nature"],
          correct: true
        },
        {
          id: "illuminati-clone",
          label: "Secret Illuminati Lookalike Clone Replacement",
          targets: []
        }
      ],
      explanation: "Wild pathogens (like smallpox, polio, or measles) carry severe risks of death and permanent organ damage. \"Natural\" does not mean safe, and vaccines provide targeted immunity without wild infection hazards."
    }
  ]
};
