// Generated from content/puzzles/maintaining-homeostasis.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "maintaining-homeostasis",
  "title": "Maintaining homeostasis",
  "category": "physiology-medicine",
  "info": {
    "text": "How the body monitors internal conditions, compares them with workable ranges, and coordinates responses that limit deviations.",
    "links": [
      {
        "href": "wiki:Homeostasis"
      },
      {
        "href": "https://my.clevelandclinic.org/health/articles/homeostasis"
      }
    ]
  },
  "clusters": [
    {
      "id": "monitoring-conditions",
      "name": "Monitoring conditions",
      "color": "teal",
      "fact": "Homeostatic control begins when a receptor detects a stimulus—a change in a regulated variable—and converts information about it into a sensory signal.",
      "terms": [
        "regulated variable",
        "stimulus",
        "receptor",
        "sensory signal"
      ],
      "seeds": [
        "stimulus",
        "receptor"
      ],
      "termInfo": {
        "regulated variable": {
          "text": "A measurable internal condition, such as temperature, blood glucose or carbon dioxide, that regulatory mechanisms keep within workable limits.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "stimulus": {
          "text": "A detectable change in the internal or external environment that can begin a regulatory response.",
          "links": [
            {
              "href": "wiki:Stimulus (physiology)"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "receptor": {
          "text": "The sensing component that detects a relevant change and converts it into information the regulatory system can use.",
          "links": [
            {
              "href": "wiki:Sensory system"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
            }
          ]
        },
        "sensory signal": {
          "text": "Information about the direction and size of a detected change, carried toward the system that coordinates a response.",
          "links": [
            {
              "href": "wiki:Afferent nerve fiber"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sensory system"
          },
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
          }
        ]
      }
    },
    {
      "id": "comparing-with-a-target",
      "name": "Comparing with a target",
      "color": "blue",
      "fact": "A control center integrates incoming information, compares the regulated variable with a set point or acceptable range, and determines whether a corrective response is needed.",
      "terms": [
        "control center",
        "set point",
        "normal range",
        "integration"
      ],
      "seeds": [
        "control center",
        "set point"
      ],
      "termInfo": {
        "control center": {
          "text": "The coordinating part of a regulatory system that evaluates input and determines an appropriate response; the hypothalamus serves this role in many homeostatic processes.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://my.clevelandclinic.org/health/body/22566-hypothalamus"
            }
          ]
        },
        "set point": {
          "text": "A target or reference value around which a variable is regulated; some physiological set points can shift with time or circumstances.",
          "links": [
            {
              "href": "wiki:Setpoint (control system)"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "normal range": {
          "text": "An acceptable band of values rather than one perfectly fixed number; healthy regulation allows limited variation within that band.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "integration": {
          "text": "The combining and interpretation of incoming information so the regulatory system can choose the direction and strength of its response.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Homeostasis"
          },
          {
            "href": "https://my.clevelandclinic.org/health/body/22566-hypothalamus"
          }
        ]
      }
    },
    {
      "id": "producing-a-correction",
      "name": "Producing a correction",
      "color": "amber",
      "fact": "An output signal activates an effector, whose physiological response moves the regulated variable toward dynamic balance rather than holding it perfectly constant.",
      "terms": [
        "output signal",
        "effector",
        "physiological response",
        "dynamic equilibrium"
      ],
      "seeds": [
        "effector",
        "physiological response"
      ],
      "termInfo": {
        "output signal": {
          "text": "A neural or hormonal instruction sent from a control center toward the tissue that will carry out the response.",
          "links": [
            {
              "href": "wiki:Efferent nerve fiber"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
            }
          ]
        },
        "effector": {
          "text": "A muscle, gland, organ or other target whose altered activity changes the regulated variable.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "physiological response": {
          "text": "The functional change produced by an effector, such as sweating, changing ventilation or altering hormone release.",
          "links": [
            {
              "href": "wiki:Physiology"
            },
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
            }
          ]
        },
        "dynamic equilibrium": {
          "text": "Relative internal stability maintained through continual adjustment, not through the complete absence of change.",
          "links": [
            {
              "href": "wiki:Homeostasis"
            },
            {
              "href": "https://my.clevelandclinic.org/health/articles/homeostasis"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Homeostasis"
          },
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "afferent-pathway",
      "term": "afferent pathway",
      "clusters": [
        0,
        1
      ],
      "fact": "An afferent pathway bridges monitoring and comparison by carrying sensory information from a receptor toward a control center.",
      "info": {
        "text": "A route that carries sensory information inward toward a coordinating part of the nervous or regulatory system.",
        "links": [
          {
            "href": "wiki:Afferent nerve fiber"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "receptor",
        "control center"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "efferent-pathway",
      "term": "efferent pathway",
      "clusters": [
        1,
        2
      ],
      "fact": "An efferent pathway bridges comparison and correction by carrying an output command away from a control center toward an effector.",
      "info": {
        "text": "A route that carries instructions outward from a coordinating center to muscles, glands or other effectors.",
        "links": [
          {
            "href": "wiki:Efferent nerve fiber"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK559138/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "control center",
        "effector"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "negative-feedback",
      "term": "negative feedback",
      "clusters": [
        2,
        0
      ],
      "fact": "Negative feedback closes the loop: an effector response opposes the original deviation, so receptors detect less need for continued correction as the regulated variable moves back toward its workable range.",
      "info": {
        "text": "A regulatory relationship in which a response reduces the change that triggered it, limiting deviation rather than reinforcing it.",
        "links": [
          {
            "href": "wiki:Negative feedback"
          },
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-5-homeostasis"
          }
        ]
      },
      "conceptId": "negative-feedback",
      "relationKind": "dynamic",
      "idealTerms": [
        "physiological response",
        "regulated variable"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "See how homeostatic control appears in specific body systems."
    },
    "entries": [
      {
        "id": "integumentary-system",
        "reason": "Apply feedback control to sweating, skin blood flow and the regulation of body temperature.",
        "via": [
          "temperature regulation",
          "negative feedback"
        ]
      },
      {
        "id": "breathing-gas-exchange",
        "reason": "See how changes in breathing help keep oxygen, carbon dioxide and acid-base conditions within workable ranges.",
        "via": [
          "blood gases",
          "negative feedback"
        ]
      }
    ]
  }
});
