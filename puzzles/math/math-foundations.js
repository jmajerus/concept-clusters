// Concept Clusters puzzle: Math foundations
// Category: Math
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "math-foundations",
  "title": "Math foundations",
  "category": "Math",
  "clusters": [
    {
      "name": "Number systems",
      "info": {
        "link": "wiki:Number"
      },
      "color": "teal",
      "fact": "Integers, fractions, and decimals are different ways of writing quantity.",
      "terms": [
        "integers",
        "fractions",
        "decimals",
        "negative numbers"
      ],
      "seeds": [
        "integers",
        "fractions"
      ],
      "termInfo": {
        "integers": {
          "link": "wiki:Integer"
        },
        "fractions": {
          "link": "wiki:Fraction"
        },
        "decimals": {
          "link": "wiki:Decimal"
        },
        "negative numbers": {
          "text": "Numbers less than zero, extending the number line in the opposite direction from positive numbers.",
          "link": "wiki:Negative number"
        }
      }
    },
    {
      "name": "Geometry",
      "info": {
        "link": "wiki:Geometry"
      },
      "color": "blue",
      "fact": "Geometry studies shapes and the space they occupy.",
      "terms": [
        "angles",
        "polygons",
        "circles",
        "symmetry"
      ],
      "seeds": [
        "angles",
        "polygons"
      ],
      "termInfo": {
        "angles": {
          "text": "The figure formed by two rays sharing an endpoint, measured by how much one would need to rotate to meet the other.",
          "link": "wiki:Angle"
        },
        "polygons": {
          "link": "wiki:Polygon"
        },
        "circles": {
          "link": "wiki:Circle"
        },
        "symmetry": {
          "text": "A shape's property of looking the same after being reflected, rotated, or otherwise transformed.",
          "link": "wiki:Symmetry"
        }
      }
    },
    {
      "name": "Measurement",
      "info": {
        "link": "wiki:Measurement"
      },
      "color": "amber",
      "fact": "Measurement assigns numbers to real-world quantities using units.",
      "terms": [
        "length",
        "mass",
        "time",
        "volume"
      ],
      "seeds": [
        "length",
        "mass"
      ],
      "termInfo": {
        "length": {
          "link": "wiki:Length"
        },
        "mass": {
          "link": "wiki:Mass"
        },
        "time": {
          "link": "wiki:Time"
        },
        "volume": {
          "text": "The amount of three-dimensional space a shape or object occupies.",
          "link": "wiki:Volume"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "pi",
      "clusters": [
        0,
        1
      ],
      "relationKind": "foundation",
      "fact": "Pi bridges the two: an irrational number that defines every circle.",
      "idealTerms": [
        null,
        "circles"
      ],
      "info": {
        "link": "wiki:Pi"
      }
    },
    {
      "term": "area",
      "clusters": [
        1,
        2
      ],
      "relationKind": "foundation",
      "fact": "Area bridges the two: measuring the space inside a shape links geometry to measurement.",
      "idealTerms": [
        null,
        "length"
      ],
      "info": {
        "link": "wiki:Area"
      }
    }
  ]
};
