// Generated from content/puzzles/what-public-health-does.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "what-public-health-does",
  "title": "What Public Health Does",
  "category": "public-health",
  "large": true,
  "info": {
    "text": "Public health protects communities by observing patterns, preventing harm, improving shared conditions, and coordinating responses when threats emerge.",
    "links": [
      {
        "href": "wiki:Public health"
      }
    ]
  },
  "clusters": [
    {
      "id": "understand-population-health",
      "name": "Understand population health",
      "color": "teal",
      "fact": "Public health combines reports, measurements, surveys, laboratory evidence, and vital records to identify patterns affecting communities rather than relying on isolated cases alone.",
      "terms": [
        "case reports",
        "disease rates",
        "health surveys",
        "laboratory results",
        "mortality records"
      ],
      "seeds": [
        "disease rates",
        "health surveys"
      ],
      "termInfo": {
        "case reports": {
          "text": "Reports describing identified cases of a disease or other health event.",
          "links": [
            {
              "href": "wiki:Case report"
            }
          ]
        },
        "disease rates": {
          "text": "Measures that relate the number of health events to the size of the population in which they occur.",
          "links": [
            {
              "href": "wiki:Incidence (epidemiology)"
            }
          ]
        },
        "health surveys": {
          "text": "Structured collection of health information from a sample or population.",
          "links": [
            {
              "href": "wiki:Health survey"
            }
          ]
        },
        "laboratory results": {
          "text": "Findings from tests used to detect pathogens, exposures, or other biological evidence.",
          "links": [
            {
              "href": "wiki:Medical laboratory"
            }
          ]
        },
        "mortality records": {
          "text": "Records of deaths and their reported causes, used to study population patterns over time.",
          "links": [
            {
              "href": "wiki:Mortality rate"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Public health surveillance"
          }
        ]
      }
    },
    {
      "id": "prevent-illness-and-injury",
      "name": "Prevent illness and injury",
      "color": "blue",
      "fact": "Prevention reduces the chance that harm will occur, detects problems early, and lowers their consequences before treatment becomes the only remaining option.",
      "terms": [
        "vaccination",
        "screening",
        "safer workplaces",
        "nutrition programs",
        "injury prevention"
      ],
      "seeds": [
        "vaccination",
        "screening"
      ],
      "termInfo": {
        "vaccination": {
          "text": "The administration of a vaccine to help the immune system prevent or reduce disease.",
          "links": [
            {
              "href": "wiki:Vaccination"
            }
          ]
        },
        "screening": {
          "text": "Testing people without recognized symptoms to identify possible disease or risk early.",
          "links": [
            {
              "href": "wiki:Screening (medicine)"
            }
          ]
        },
        "safer workplaces": {
          "text": "Policies, engineering controls, training, and standards that reduce occupational illness and injury.",
          "links": [
            {
              "href": "wiki:Occupational safety and health"
            }
          ]
        },
        "nutrition programs": {
          "text": "Organized efforts that improve access to adequate food or support healthier dietary patterns.",
          "links": [
            {
              "href": "wiki:Public health nutrition"
            }
          ]
        },
        "injury prevention": {
          "text": "Measures designed to reduce the likelihood or severity of injuries.",
          "links": [
            {
              "href": "wiki:Injury prevention"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Preventive healthcare"
          }
        ]
      }
    },
    {
      "id": "protect-shared-environments",
      "name": "Protect shared environments",
      "color": "amber",
      "fact": "Many public-health protections work upstream by making water, food, air, workplaces, and other shared surroundings safer for everyone who depends on them.",
      "terms": [
        "clean water",
        "food safety",
        "air quality",
        "sanitation",
        "hazard regulation"
      ],
      "seeds": [
        "clean water",
        "food safety"
      ],
      "termInfo": {
        "clean water": {
          "text": "Water protected from contaminants through source protection, treatment, testing, and safe distribution.",
          "links": [
            {
              "href": "wiki:Drinking water"
            }
          ]
        },
        "food safety": {
          "text": "Practices and controls that prevent foodborne illness and contamination.",
          "links": [
            {
              "href": "wiki:Food safety"
            }
          ]
        },
        "air quality": {
          "text": "The condition of outdoor or indoor air as shaped by pollutants and other exposures.",
          "links": [
            {
              "href": "wiki:Air quality"
            }
          ]
        },
        "sanitation": {
          "text": "Systems and practices for safely managing waste and maintaining hygienic conditions.",
          "links": [
            {
              "href": "wiki:Sanitation"
            }
          ]
        },
        "hazard regulation": {
          "text": "Rules and enforcement intended to limit exposure to conditions or substances that can cause harm.",
          "links": [
            {
              "href": "wiki:Environmental health"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Environmental health"
          }
        ]
      }
    },
    {
      "id": "prepare-and-respond",
      "name": "Prepare and respond",
      "color": "magenta",
      "fact": "Public-health response connects preparation, investigation, communication, logistics, and coordinated action so emerging threats can be contained and communities supported.",
      "terms": [
        "emergency planning",
        "outbreak investigation",
        "contact tracing",
        "public communication",
        "resource coordination"
      ],
      "seeds": [
        "emergency planning",
        "outbreak investigation"
      ],
      "termInfo": {
        "emergency planning": {
          "text": "Advance preparation for roles, resources, communication, and operations during a health emergency.",
          "links": [
            {
              "href": "wiki:Public health emergency preparedness"
            }
          ]
        },
        "outbreak investigation": {
          "text": "The systematic effort to determine whether an outbreak exists, identify its source and spread, and guide control measures.",
          "links": [
            {
              "href": "wiki:Disease outbreak"
            }
          ]
        },
        "contact tracing": {
          "text": "Identifying and notifying people who may have been exposed to an infectious disease.",
          "links": [
            {
              "href": "wiki:Contact tracing"
            }
          ]
        },
        "public communication": {
          "text": "Sharing timely, understandable information about risks, evidence, and recommended actions.",
          "links": [
            {
              "href": "wiki:Risk communication"
            }
          ]
        },
        "resource coordination": {
          "text": "Organizing personnel, supplies, facilities, and partnerships so a response can reach affected communities.",
          "links": [
            {
              "href": "wiki:Emergency management"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Public health emergency"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "surveillance",
      "term": "surveillance",
      "clusters": [
        0,
        3
      ],
      "fact": "Surveillance turns continuing observation into actionable knowledge: reports and measurements are collected and interpreted so emerging threats can be detected, responses directed, and results evaluated.",
      "info": {
        "text": "The ongoing, systematic collection, analysis, interpretation, and sharing of health data for public-health action.",
        "links": [
          {
            "href": "wiki:Public health surveillance"
          }
        ]
      },
      "conceptId": "public-health-surveillance",
      "relationKind": "dynamic",
      "idealTerms": [
        "disease rates",
        "outbreak investigation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "risk-reduction",
      "term": "risk reduction",
      "clusters": [
        1,
        2
      ],
      "fact": "Public health reduces risk through both targeted preventive services and changes to shared environments, recognizing that health depends on more than individual choices or medical treatment.",
      "info": {
        "text": "Measures that lower the probability or expected severity of harm.",
        "links": [
          {
            "href": "wiki:Risk reduction"
          }
        ]
      },
      "conceptId": "risk-reduction",
      "relationKind": "foundation",
      "idealTerms": [
        "injury prevention",
        "hazard regulation"
      ]
    },
    {
      "id": "evidence-based-action",
      "term": "evidence-based action",
      "clusters": [
        0,
        1
      ],
      "fact": "Evidence-based action uses population observations and research to choose preventive measures, while continuing to test whether those measures are effective, proportionate, and responsive to new evidence.",
      "info": {
        "text": "Using the best available evidence, together with context and professional judgment, to guide and evaluate public-health decisions.",
        "links": [
          {
            "href": "wiki:Evidence-based practice"
          }
        ]
      },
      "conceptId": "evidence-based-action",
      "relationKind": "dynamic",
      "idealTerms": [
        "laboratory results",
        "screening"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "population-wide-action",
      "prompt": "Which concepts operate mainly at the level of communities or populations rather than one patient at a time?",
      "explanation": "These concepts reveal population patterns or change the conditions, information, and protections shared by many people at once.",
      "targets": [
        "disease rates",
        "health surveys",
        "clean water",
        "air quality",
        "public communication"
      ],
      "reasons": {
        "disease rates": "They summarize how often illness occurs across a defined population.",
        "health surveys": "They gather information from groups to reveal needs and disparities that individual encounters may miss.",
        "clean water": "It protects everyone who depends on a shared water system.",
        "air quality": "It describes a shared environmental exposure rather than one person's diagnosis.",
        "public communication": "It gives a population timely information for coordinated protective action."
      }
    },
    {
      "id": "prevention-is-easy-to-miss",
      "prompt": "Which protections may become least visible when they are working well?",
      "explanation": "Successful prevention often appears as an event that never happens: an infection avoided, an injury prevented, an exposure removed, or a response made ready before a crisis.",
      "targets": [
        "vaccination",
        "safer workplaces",
        "clean water",
        "food safety",
        "emergency planning"
      ],
      "reasons": {
        "vaccination": "Its success includes infections and complications that never occur.",
        "safer workplaces": "Effective safeguards prevent injuries that would otherwise make the danger visible.",
        "clean water": "Reliable treatment makes waterborne disease unusual enough to be forgotten.",
        "food safety": "Routine inspection and controls prevent outbreaks before consumers notice a problem.",
        "emergency planning": "Preparation is most successful when a later response looks orderly rather than improvised."
      }
    },
    {
      "id": "information-for-action",
      "prompt": "Which concepts primarily produce or communicate information used to guide public-health decisions?",
      "explanation": "Public health depends on information moving in both directions: observations are assembled into population knowledge, and findings are communicated so institutions and communities can act.",
      "targets": [
        "case reports",
        "disease rates",
        "health surveys",
        "laboratory results",
        "mortality records",
        "public communication"
      ],
      "reasons": {
        "case reports": "They provide observations about identified illnesses or health events.",
        "disease rates": "They turn counts into comparable measures across populations and time.",
        "health surveys": "They reveal experiences, behaviors, and conditions that clinical records alone cannot show.",
        "laboratory results": "They help identify pathogens, exposures, and biological evidence.",
        "mortality records": "They reveal patterns in causes of death across places, groups, and time.",
        "public communication": "It translates findings and recommendations into information people can use."
      }
    }
  ]
});
