// Concept Clusters puzzle: Algebra basics
// Category: Math
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "algebra-basics",
  "title": "Algebra basics",
  "category": "Math",
  "clusters": [
    {
      "name": "Variables",
      "info": {
        "link": "wiki:Variable (mathematics)"
      },
      "color": "green",
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
          "link": "wiki:Equation"
        },
        "coefficient": {
          "link": "wiki:Coefficient"
        },
        "term": {
          "text": "A single piece of an algebraic expression, like 3x or 7 — one part of what's added or subtracted together.",
          "link": "wiki:Monomial"
        },
        "expression": {
          "text": "A combination of numbers, variables, and operations — unlike an equation, it has no equals sign.",
          "link": "wiki:Expression (mathematics)"
        }
      }
    },
    {
      "name": "Equations",
      "info": {
        "link": "wiki:Equation"
      },
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
          "link": "wiki:Equation"
        },
        "inverse operation": {
          "link": "wiki:Inverse function"
        },
        "solution": {
          "text": "The value (or values) that make an equation true when substituted in.",
          "link": "wiki:Solution set"
        }
      }
    },
    {
      "name": "Functions",
      "info": {
        "link": "wiki:Function (mathematics)"
      },
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
          "link": "wiki:Dependent and independent variables"
        },
        "output": {
          "text": "The value a function produces from a given input — the dependent variable, since it depends on what's fed in.",
          "link": "wiki:Dependent and independent variables"
        },
        "domain": {
          "text": "The full set of inputs a function is allowed to take.",
          "link": "wiki:Domain of a function"
        },
        "range": {
          "text": "The full set of outputs a function can produce, pairing with domain (its set of allowed inputs).",
          "link": "wiki:Range of a function"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "solving for x",
      "clusters": [
        0,
        1
      ],
      "fact": "Solving for x bridges the two: it's the act of isolating a variable by keeping an equation balanced.",
      "idealTerms": [
        "unknown",
        "inverse operation"
      ],
      "info": {
        "text": "The general process of isolating an unknown by applying the same operation to both sides of an equation.",
        "link": "wiki:Equation solving"
      }
    },
    {
      "term": "graph",
      "clusters": [
        1,
        2
      ],
      "fact": "A graph bridges the two: it's the visual picture of both an equation's solutions and a function's input-output pairs.",
      "idealTerms": [
        "solution",
        null
      ],
      "info": {
        "text": "The visual plot of a function's input-output pairs on a coordinate plane.",
        "link": "wiki:Graph of a function"
      }
    }
  ]
};
