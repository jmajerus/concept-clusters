// Concept Clusters puzzle: Human body systems
// Category: Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "body-systems",
  "title": "Human body systems",
  "category": "Science",
  "clusters": [
    {
      "name": "Circulatory",
      "info": {
        "link": "wiki:Circulatory system"
      },
      "color": "teal",
      "fact": "The circulatory system pumps blood carrying oxygen and nutrients to every cell.",
      "terms": [
        "heart",
        "blood vessels",
        "pulse",
        "red blood cells"
      ],
      "seeds": [
        "heart",
        "blood vessels"
      ],
      "termInfo": {
        "heart": {
          "link": "wiki:Heart"
        },
        "blood vessels": {
          "link": "wiki:Blood vessel"
        },
        "pulse": {
          "link": "wiki:Pulse"
        },
        "red blood cells": {
          "text": "The blood cells that carry oxygen from the lungs to the rest of the body.",
          "link": "wiki:Red blood cell"
        }
      }
    },
    {
      "name": "Respiratory",
      "info": {
        "link": "wiki:Respiratory system"
      },
      "color": "blue",
      "fact": "The respiratory system exchanges oxygen and carbon dioxide between the air and the blood.",
      "terms": [
        "lungs",
        "alveoli",
        "diaphragm",
        "trachea"
      ],
      "seeds": [
        "lungs",
        "alveoli"
      ],
      "termInfo": {
        "lungs": {
          "link": "wiki:Lung"
        },
        "alveoli": {
          "link": "wiki:Pulmonary alveolus"
        },
        "diaphragm": {
          "text": "The dome-shaped muscle beneath the lungs that contracts to pull air in.",
          "link": "wiki:Thoracic diaphragm"
        },
        "trachea": {
          "text": "The windpipe — the tube that carries air between the throat and the lungs.",
          "link": "wiki:Trachea"
        }
      }
    },
    {
      "name": "Digestive",
      "info": {
        "link": "wiki:Digestive system"
      },
      "color": "amber",
      "fact": "The digestive system breaks food into nutrients the body can absorb and use.",
      "terms": [
        "stomach",
        "enzymes",
        "intestines",
        "esophagus"
      ],
      "seeds": [
        "stomach",
        "enzymes"
      ],
      "termInfo": {
        "stomach": {
          "link": "wiki:Stomach"
        },
        "enzymes": {
          "link": "wiki:Enzyme"
        },
        "intestines": {
          "link": "wiki:Gastrointestinal tract"
        },
        "esophagus": {
          "text": "The muscular tube that carries swallowed food from the throat to the stomach.",
          "link": "wiki:Esophagus"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "oxygen",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Oxygen bridges the two: the lungs load it into the blood, and the heart pumps it everywhere the body needs it.",
      "idealTerms": [
        "heart",
        "lungs"
      ],
      "info": {
        "link": "wiki:Oxygen"
      }
    },
    {
      "term": "nutrients",
      "clusters": [
        0,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Nutrients bridge the two: digestion breaks food down, and circulation carries the nutrients to every cell.",
      "idealTerms": [
        "blood vessels",
        "intestines"
      ],
      "info": {
        "link": "wiki:Nutrient"
      }
    }
  ]
};
