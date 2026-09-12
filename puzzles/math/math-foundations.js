// Generated from content/puzzles/math-foundations.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "math-foundations",
  "title": "Math foundations",
  "category": "math",
  "clusters": [
    {
      "id": "number-systems",
      "name": "Number systems",
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
          "links": [
            {
              "href": "wiki:Integer"
            }
          ]
        },
        "fractions": {
          "links": [
            {
              "href": "wiki:Fraction"
            }
          ]
        },
        "decimals": {
          "links": [
            {
              "href": "wiki:Decimal"
            }
          ]
        },
        "negative numbers": {
          "text": "Numbers less than zero, extending the number line in the opposite direction from positive numbers.",
          "links": [
            {
              "href": "wiki:Negative number"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Number"
          }
        ]
      }
    },
    {
      "id": "geometry",
      "name": "Geometry",
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
          "links": [
            {
              "href": "wiki:Angle"
            }
          ]
        },
        "polygons": {
          "links": [
            {
              "href": "wiki:Polygon"
            }
          ]
        },
        "circles": {
          "links": [
            {
              "href": "wiki:Circle"
            }
          ]
        },
        "symmetry": {
          "text": "A shape's property of looking the same after being reflected, rotated, or otherwise transformed.",
          "links": [
            {
              "href": "wiki:Symmetry"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Geometry"
          }
        ]
      }
    },
    {
      "id": "measurement",
      "name": "Measurement",
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
          "links": [
            {
              "href": "wiki:Length"
            }
          ]
        },
        "mass": {
          "links": [
            {
              "href": "wiki:Mass"
            }
          ]
        },
        "time": {
          "links": [
            {
              "href": "wiki:Time"
            }
          ]
        },
        "volume": {
          "text": "The amount of three-dimensional space a shape or object occupies.",
          "links": [
            {
              "href": "wiki:Volume"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Measurement"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "pi",
      "term": "pi",
      "clusters": [
        0,
        1
      ],
      "fact": "Pi bridges the two: an irrational number that defines every circle.",
      "info": {
        "links": [
          {
            "href": "wiki:Pi"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "circles"
      ]
    },
    {
      "id": "area",
      "term": "area",
      "clusters": [
        1,
        2
      ],
      "fact": "Area bridges the two: measuring the space inside a shape links geometry to measurement.",
      "info": {
        "links": [
          {
            "href": "wiki:Area"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "length"
      ]
    }
  ]
});
