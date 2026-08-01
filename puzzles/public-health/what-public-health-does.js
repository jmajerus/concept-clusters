export default {
  id: "what-public-health-does",
  title: "What Public Health Does",
  category: "Public Health",
  large: true,
  info: {
    text: "Public health protects communities by observing patterns, preventing harm, improving shared conditions, and coordinating responses when threats emerge.",
    link: "wiki:Public health"
  },
  lenses: [
    {
      id: "population-wide-action",
      prompt: "Which concepts operate mainly at the level of communities or populations rather than one patient at a time?",
      targets: [
        "disease rates",
        "health surveys",
        "clean water",
        "air quality",
        "public communication"
      ],
      explanation: "These concepts reveal population patterns or change the conditions, information, and protections shared by many people at once.",
      reasons: {
        "disease rates": "They summarize how often illness occurs across a defined population.",
        "health surveys": "They gather information from groups to reveal needs and disparities that individual encounters may miss.",
        "clean water": "It protects everyone who depends on a shared water system.",
        "air quality": "It describes a shared environmental exposure rather than one person's diagnosis.",
        "public communication": "It gives a population timely information for coordinated protective action."
      }
    },
    {
      id: "prevention-is-easy-to-miss",
      prompt: "Which protections may become least visible when they are working well?",
      targets: [
        "vaccination",
        "safer workplaces",
        "clean water",
        "food safety",
        "emergency planning"
      ],
      explanation: "Successful prevention often appears as an event that never happens: an infection avoided, an injury prevented, an exposure removed, or a response made ready before a crisis.",
      reasons: {
        "vaccination": "Its success includes infections and complications that never occur.",
        "safer workplaces": "Effective safeguards prevent injuries that would otherwise make the danger visible.",
        "clean water": "Reliable treatment makes waterborne disease unusual enough to be forgotten.",
        "food safety": "Routine inspection and controls prevent outbreaks before consumers notice a problem.",
        "emergency planning": "Preparation is most successful when a later response looks orderly rather than improvised."
      }
    },
    {
      id: "information-for-action",
      prompt: "Which concepts primarily produce or communicate information used to guide public-health decisions?",
      targets: [
        "case reports",
        "disease rates",
        "health surveys",
        "laboratory results",
        "mortality records",
        "public communication"
      ],
      explanation: "Public health depends on information moving in both directions: observations are assembled into population knowledge, and findings are communicated so institutions and communities can act.",
      reasons: {
        "case reports": "They provide observations about identified illnesses or health events.",
        "disease rates": "They turn counts into comparable measures across populations and time.",
        "health surveys": "They reveal experiences, behaviors, and conditions that clinical records alone cannot show.",
        "laboratory results": "They help identify pathogens, exposures, and biological evidence.",
        "mortality records": "They reveal patterns in causes of death across places, groups, and time.",
        "public communication": "It translates findings and recommendations into information people can use."
      }
    }
  ],
  clusters: [
    {
      name: "Understand population health",
      color: "teal",
      fact: "Public health combines reports, measurements, surveys, laboratory evidence, and vital records to identify patterns affecting communities rather than relying on isolated cases alone.",
      terms: [
        "case reports",
        "disease rates",
        "health surveys",
        "laboratory results",
        "mortality records"
      ],
      seeds: [
        "disease rates",
        "health surveys"
      ],
      termInfo: {
        "case reports": {
          text: "Reports describing identified cases of a disease or other health event.",
          link: "wiki:Case report"
        },
        "disease rates": {
          text: "Measures that relate the number of health events to the size of the population in which they occur.",
          link: "wiki:Incidence (epidemiology)"
        },
        "health surveys": {
          text: "Structured collection of health information from a sample or population.",
          link: "wiki:Health survey"
        },
        "laboratory results": {
          text: "Findings from tests used to detect pathogens, exposures, or other biological evidence.",
          link: "wiki:Medical laboratory"
        },
        "mortality records": {
          text: "Records of deaths and their reported causes, used to study population patterns over time.",
          link: "wiki:Mortality rate"
        }
      },
      info: {
        link: "wiki:Public health surveillance"
      }
    },
    {
      name: "Prevent illness and injury",
      color: "blue",
      fact: "Prevention reduces the chance that harm will occur, detects problems early, and lowers their consequences before treatment becomes the only remaining option.",
      terms: [
        "vaccination",
        "screening",
        "safer workplaces",
        "nutrition programs",
        "injury prevention"
      ],
      seeds: [
        "vaccination",
        "screening"
      ],
      termInfo: {
        "vaccination": {
          text: "The administration of a vaccine to help the immune system prevent or reduce disease.",
          link: "wiki:Vaccination"
        },
        "screening": {
          text: "Testing people without recognized symptoms to identify possible disease or risk early.",
          link: "wiki:Screening (medicine)"
        },
        "safer workplaces": {
          text: "Policies, engineering controls, training, and standards that reduce occupational illness and injury.",
          link: "wiki:Occupational safety and health"
        },
        "nutrition programs": {
          text: "Organized efforts that improve access to adequate food or support healthier dietary patterns.",
          link: "wiki:Public health nutrition"
        },
        "injury prevention": {
          text: "Measures designed to reduce the likelihood or severity of injuries.",
          link: "wiki:Injury prevention"
        }
      },
      info: {
        link: "wiki:Preventive healthcare"
      }
    },
    {
      name: "Protect shared environments",
      color: "amber",
      fact: "Many public-health protections work upstream by making water, food, air, workplaces, and other shared surroundings safer for everyone who depends on them.",
      terms: [
        "clean water",
        "food safety",
        "air quality",
        "sanitation",
        "hazard regulation"
      ],
      seeds: [
        "clean water",
        "food safety"
      ],
      termInfo: {
        "clean water": {
          text: "Water protected from contaminants through source protection, treatment, testing, and safe distribution.",
          link: "wiki:Drinking water"
        },
        "food safety": {
          text: "Practices and controls that prevent foodborne illness and contamination.",
          link: "wiki:Food safety"
        },
        "air quality": {
          text: "The condition of outdoor or indoor air as shaped by pollutants and other exposures.",
          link: "wiki:Air quality"
        },
        "sanitation": {
          text: "Systems and practices for safely managing waste and maintaining hygienic conditions.",
          link: "wiki:Sanitation"
        },
        "hazard regulation": {
          text: "Rules and enforcement intended to limit exposure to conditions or substances that can cause harm.",
          link: "wiki:Environmental health"
        }
      },
      info: {
        link: "wiki:Environmental health"
      }
    },
    {
      name: "Prepare and respond",
      color: "magenta",
      fact: "Public-health response connects preparation, investigation, communication, logistics, and coordinated action so emerging threats can be contained and communities supported.",
      terms: [
        "emergency planning",
        "outbreak investigation",
        "contact tracing",
        "public communication",
        "resource coordination"
      ],
      seeds: [
        "emergency planning",
        "outbreak investigation"
      ],
      termInfo: {
        "emergency planning": {
          text: "Advance preparation for roles, resources, communication, and operations during a health emergency.",
          link: "wiki:Public health emergency preparedness"
        },
        "outbreak investigation": {
          text: "The systematic effort to determine whether an outbreak exists, identify its source and spread, and guide control measures.",
          link: "wiki:Disease outbreak"
        },
        "contact tracing": {
          text: "Identifying and notifying people who may have been exposed to an infectious disease.",
          link: "wiki:Contact tracing"
        },
        "public communication": {
          text: "Sharing timely, understandable information about risks, evidence, and recommended actions.",
          link: "wiki:Risk communication"
        },
        "resource coordination": {
          text: "Organizing personnel, supplies, facilities, and partnerships so a response can reach affected communities.",
          link: "wiki:Emergency management"
        }
      },
      info: {
        link: "wiki:Public health emergency"
      }
    }
  ],
  bridges: [
    {
      term: "surveillance",
      conceptId: "public-health-surveillance",
      clusters: [0, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 3
      },
      fact: "Surveillance turns continuing observation into actionable knowledge: reports and measurements are collected and interpreted so emerging threats can be detected, responses directed, and results evaluated.",
      idealTerms: [
        "disease rates",
        "outbreak investigation"
      ],
      info: {
        text: "The ongoing, systematic collection, analysis, interpretation, and sharing of health data for public-health action.",
        link: "wiki:Public health surveillance"
      }
    },
    {
      term: "risk reduction",
      conceptId: "risk-reduction",
      clusters: [1, 2],
      relationKind: "structural",
      fact: "Public health reduces risk through both targeted preventive services and changes to shared environments, recognizing that health depends on more than individual choices or medical treatment.",
      idealTerms: [
        "injury prevention",
        "hazard regulation"
      ],
      info: {
        text: "Measures that lower the probability or expected severity of harm.",
        link: "wiki:Risk reduction"
      }
    },
    {
      term: "evidence-based action",
      conceptId: "evidence-based-action",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact: "Evidence-based action uses population observations and research to choose preventive measures, while continuing to test whether those measures are effective, proportionate, and responsive to new evidence.",
      idealTerms: [
        "laboratory results",
        "screening"
      ],
      info: {
        text: "Using the best available evidence, together with context and professional judgment, to guide and evaluate public-health decisions.",
        link: "wiki:Evidence-based practice"
      }
    }
  ]
};
