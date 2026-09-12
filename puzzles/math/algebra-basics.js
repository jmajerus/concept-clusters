// Generated from content/puzzles/algebra-basics.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "algebra-basics",
  "title": "Algebra basics",
  "category": "math",
  "clusters": [
    {
      "id": "variables",
      "name": "Variables",
      "color": "teal",
      "fact": "Variables are symbols that stand in for unknown or changing quantities.",
      "terms": [
        "unknown",
        "coefficient",
        "term",
        "expression"
      ],
      "seeds": [
        "unknown",
        "coefficient"
      ],
      "termInfo": {
        "unknown": {
          "text": "The letter or symbol standing for the value an equation is solved to find.",
          "links": [
            {
              "href": "wiki:Equation"
            }
          ]
        },
        "coefficient": {
          "links": [
            {
              "href": "wiki:Coefficient"
            }
          ]
        },
        "term": {
          "text": "A single piece of an algebraic expression, like 3x or 7 — one part of what's added or subtracted together.",
          "links": [
            {
              "href": "wiki:Monomial"
            }
          ]
        },
        "expression": {
          "text": "A combination of numbers, variables, and operations — unlike an equation, it has no equals sign.",
          "links": [
            {
              "href": "wiki:Expression (mathematics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Variable (mathematics)"
          }
        ]
      }
    },
    {
      "id": "equations",
      "name": "Equations",
      "color": "blue",
      "fact": "Equations state that two expressions are equal, and stay balanced under the same operation on both sides.",
      "terms": [
        "balance",
        "inverse operation",
        "solution"
      ],
      "seeds": [
        "balance",
        "inverse operation"
      ],
      "termInfo": {
        "balance": {
          "text": "The idea that both sides of an equation must stay equal — whatever you do to one side, you must do to the other.",
          "links": [
            {
              "href": "wiki:Equation"
            }
          ]
        },
        "inverse operation": {
          "links": [
            {
              "href": "wiki:Inverse function"
            }
          ]
        },
        "solution": {
          "text": "The value (or values) that make an equation true when substituted in.",
          "links": [
            {
              "href": "wiki:Solution set"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Equation"
          }
        ]
      }
    },
    {
      "id": "functions",
      "name": "Functions",
      "color": "amber",
      "fact": "Functions map every input to exactly one output, describing how one quantity depends on another.",
      "terms": [
        "input",
        "output",
        "domain",
        "range"
      ],
      "seeds": [
        "input",
        "output"
      ],
      "termInfo": {
        "input": {
          "text": "The value fed into a function — the independent variable, which the output then depends on.",
          "links": [
            {
              "href": "wiki:Dependent and independent variables"
            }
          ]
        },
        "output": {
          "text": "The value a function produces from a given input — the dependent variable, since it depends on what's fed in.",
          "links": [
            {
              "href": "wiki:Dependent and independent variables"
            }
          ]
        },
        "domain": {
          "text": "The full set of inputs a function is allowed to take.",
          "links": [
            {
              "href": "wiki:Domain of a function"
            }
          ]
        },
        "range": {
          "text": "The full set of outputs a function can produce, pairing with domain (its set of allowed inputs).",
          "links": [
            {
              "href": "wiki:Range of a function"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Function (mathematics)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "solving-for-x",
      "term": "solving for x",
      "clusters": [
        0,
        1
      ],
      "fact": "Solving for x bridges the two: it's the act of isolating a variable by keeping an equation balanced.",
      "info": {
        "text": "The general process of isolating an unknown by applying the same operation to both sides of an equation.",
        "links": [
          {
            "href": "wiki:Equation solving"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "unknown",
        "inverse operation"
      ]
    },
    {
      "id": "graph",
      "term": "graph",
      "clusters": [
        1,
        2
      ],
      "fact": "A graph bridges the two: it's the visual picture of both an equation's solutions and a function's input-output pairs.",
      "info": {
        "text": "The visual plot of a function's input-output pairs on a coordinate plane.",
        "links": [
          {
            "href": "wiki:Graph of a function"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "solution",
        null
      ]
    }
  ]
});
