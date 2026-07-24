// Concept Clusters puzzle: Breathing and gas exchange
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Mayo Clinic extraLink destinations verified July 23, 2026.

export default {
  id: "breathing-gas-exchange",
  title: "Breathing and gas exchange",
  category: "Physiology & Medicine",
  clusters: [
    {
      name: "Breathing mechanics",
      color: "green",
      fact: "Breathing changes chest volume and pressure to move air: quiet inhalation uses muscle contraction, while quiet exhalation mostly follows elastic recoil.",
      terms: ["diaphragm", "inhalation", "exhalation", "intercostal muscles"],
      seeds: ["diaphragm", "inhalation"],
      termInfo: {
        diaphragm: {
          text: "The dome-shaped muscle beneath the lungs; when it contracts and moves downward, the chest cavity expands and air is drawn in.",
          link: "wiki:Thoracic diaphragm",
          extraLink: "https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-q-and-a-how-belly-breathing-benefits-your-body-mind/"
        },
        inhalation: {
          text: "Breathing in: expansion of the chest lowers pressure inside the lungs, drawing air through the airways.",
          link: "wiki:Inhalation"
        },
        exhalation: {
          text: "Breathing out: at rest, the breathing muscles relax and elastic recoil pushes air from the lungs.",
          link: "wiki:Exhalation"
        },
        "intercostal muscles": {
          text: "Muscles between the ribs that help expand or compress the chest during breathing.",
          link: "wiki:Intercostal muscles"
        }
      },
      info: {
        link: "wiki:Breathing",
        extraLink: "https://www.mayo.edu/research/departments-divisions/department-physiology-biomedical-engineering/research/physiology"
      }
    },
    {
      name: "Alveolar gas exchange",
      color: "blue",
      fact: "Across the thin alveolar-capillary membrane, oxygen diffuses into blood while carbon dioxide diffuses into the alveoli.",
      terms: ["alveoli", "pulmonary capillaries", "diffusion", "partial pressure"],
      seeds: ["alveoli", "diffusion"],
      termInfo: {
        alveoli: {
          text: "Millions of tiny air sacs that provide a large, thin surface where the lungs exchange gases with blood.",
          link: "wiki:Pulmonary alveolus",
          extraLink: "https://www.mayoclinic.org/airways-and-air-sacs-of-the-lungs/img-20008294"
        },
        "pulmonary capillaries": {
          text: "Microscopic blood vessels wrapped around the alveoli, bringing blood close enough for oxygen and carbon dioxide to cross.",
          link: "wiki:Pulmonary circulation",
          extraLink: "https://www.mayoclinic.org/airways-and-air-sacs-of-the-lungs/img-20008294"
        },
        diffusion: {
          text: "The passive movement of gases down a partial-pressure gradient, requiring no direct expenditure of cellular energy.",
          link: "wiki:Diffusion",
          extraLink: "https://www.mayoclinic.org/diseases-conditions/pneumonitis/diagnosis-treatment/drc-20352628"
        },
        "partial pressure": {
          text: "The pressure contributed by one gas in a mixture; differences in oxygen and carbon dioxide partial pressure drive their diffusion.",
          link: "wiki:Partial pressure",
          extraLink: "https://www.mayoclinic.org/symptoms/hypoxemia/basics/definition/sym-20050930"
        }
      },
      info: {
        link: "wiki:Gas exchange",
        extraLink: "https://www.mayoclinic.org/airways-and-air-sacs-of-the-lungs/img-20008294"
      }
    },
    {
      name: "Blood gas transport",
      color: "amber",
      fact: "Most oxygen travels bound to hemoglobin in red blood cells, while most carbon dioxide is converted to bicarbonate and carried in plasma.",
      terms: ["hemoglobin", "red blood cells", "oxygen saturation", "bicarbonate"],
      seeds: ["hemoglobin", "red blood cells"],
      termInfo: {
        hemoglobin: {
          text: "The iron-containing protein in red blood cells that binds oxygen in the lungs and releases it to tissues.",
          link: "wiki:Hemoglobin",
          extraLink: "https://www.mayoclinic.org/tests-procedures/hemoglobin-test/about/pac-20385075"
        },
        "red blood cells": {
          text: "Flexible blood cells packed with hemoglobin, specialized to carry respiratory gases through the circulation.",
          link: "wiki:Red blood cell",
          extraLink: "https://www.mayoclinic.org/diseases-conditions/anemia/symptoms-causes/syc-20351360"
        },
        "oxygen saturation": {
          text: "The percentage of hemoglobin binding sites occupied by oxygen; a pulse oximeter estimates this value noninvasively.",
          link: "wiki:Oxygen saturation (medicine)",
          extraLink: "https://www.mayoclinic.org/symptoms/hypoxemia/basics/definition/sym-20050930"
        },
        bicarbonate: {
          text: "The ion that carries most carbon dioxide through blood plasma after carbon dioxide is converted inside red blood cells.",
          link: "wiki:Bicarbonate",
          extraLink: "https://www.mayocliniclabs.com/test-catalog/overview/876"
        }
      },
      info: {
        link: "wiki:Physics of respiration",
        extraLink: "https://www.mayo.edu/research/labs/human-integrative-physiology-clinical-pharmacology/overview"
      }
    }
  ],
  bridges: [
    {
      term: "ventilation",
      clusters: [0, 1],
      fact: "Ventilation bridges mechanics and exchange: each breath refreshes alveolar air, preserving the pressure gradients that let oxygen and carbon dioxide diffuse.",
      idealTerms: ["inhalation", "alveoli"],
      info: {
        text: "The bulk movement of air into and out of the lungs, continually refreshing the gases available at the alveoli.",
        link: "wiki:Breathing",
        extraLink: "https://www.mayoclinic.org/diseases-conditions/copd/diagnosis-treatment/drc-20353685"
      }
    },
    {
      term: "oxygen",
      clusters: [1, 2],
      fact: "Oxygen bridges exchange and transport: it diffuses from alveoli into pulmonary capillaries, then binds hemoglobin for delivery to tissues.",
      idealTerms: ["diffusion", "hemoglobin"],
      info: {
        text: "A respiratory gas taken up in the lungs and carried mainly by hemoglobin to support aerobic metabolism throughout the body.",
        link: "wiki:Oxygen",
        extraLink: "https://www.mayo.edu/research/labs/human-integrative-physiology-clinical-pharmacology/overview"
      }
    }
  ]
};