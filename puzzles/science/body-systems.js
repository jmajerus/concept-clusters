// Generated from content/puzzles/body-systems.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "body-systems",
  "title": "Human body systems",
  "category": "science",
  "clusters": [
    {
      "id": "circulatory",
      "name": "Circulatory",
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
          "links": [
            {
              "href": "wiki:Heart"
            }
          ]
        },
        "blood vessels": {
          "links": [
            {
              "href": "wiki:Blood vessel"
            }
          ]
        },
        "pulse": {
          "links": [
            {
              "href": "wiki:Pulse"
            }
          ]
        },
        "red blood cells": {
          "text": "The blood cells that carry oxygen from the lungs to the rest of the body.",
          "links": [
            {
              "href": "wiki:Red blood cell"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Circulatory system"
          }
        ]
      }
    },
    {
      "id": "respiratory",
      "name": "Respiratory",
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
          "links": [
            {
              "href": "wiki:Lung"
            }
          ]
        },
        "alveoli": {
          "links": [
            {
              "href": "wiki:Pulmonary alveolus"
            }
          ]
        },
        "diaphragm": {
          "text": "The dome-shaped muscle beneath the lungs that contracts to pull air in.",
          "links": [
            {
              "href": "wiki:Thoracic diaphragm"
            }
          ]
        },
        "trachea": {
          "text": "The windpipe — the tube that carries air between the throat and the lungs.",
          "links": [
            {
              "href": "wiki:Trachea"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Respiratory system"
          }
        ]
      }
    },
    {
      "id": "digestive",
      "name": "Digestive",
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
          "links": [
            {
              "href": "wiki:Stomach"
            }
          ]
        },
        "enzymes": {
          "links": [
            {
              "href": "wiki:Enzyme"
            }
          ]
        },
        "intestines": {
          "links": [
            {
              "href": "wiki:Gastrointestinal tract"
            }
          ]
        },
        "esophagus": {
          "text": "The muscular tube that carries swallowed food from the throat to the stomach.",
          "links": [
            {
              "href": "wiki:Esophagus"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Digestive system"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "oxygen",
      "term": "oxygen",
      "clusters": [
        0,
        1
      ],
      "fact": "Oxygen bridges the two: the lungs load it into the blood, and the heart pumps it everywhere the body needs it.",
      "info": {
        "links": [
          {
            "href": "wiki:Oxygen"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "heart",
        "lungs"
      ]
    },
    {
      "id": "nutrients",
      "term": "nutrients",
      "clusters": [
        0,
        2
      ],
      "fact": "Nutrients bridge the two: digestion breaks food down, and circulation carries the nutrients to every cell.",
      "info": {
        "links": [
          {
            "href": "wiki:Nutrient"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "blood vessels",
        "intestines"
      ]
    }
  ]
});
