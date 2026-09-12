// Generated from content/puzzles/data-probability.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "data-probability",
  "title": "Data & probability",
  "category": "math",
  "clusters": [
    {
      "id": "statistics",
      "name": "Statistics",
      "color": "teal",
      "fact": "Statistics summarizes data using measures like mean, median, and range.",
      "terms": [
        "mean",
        "median",
        "range",
        "mode"
      ],
      "seeds": [
        "mean",
        "median"
      ],
      "termInfo": {
        "mean": {
          "links": [
            {
              "href": "wiki:Mean"
            }
          ]
        },
        "median": {
          "links": [
            {
              "href": "wiki:Median"
            }
          ]
        },
        "range": {
          "text": "The difference between the highest and lowest values in a data set.",
          "links": [
            {
              "href": "wiki:Range (statistics)"
            }
          ]
        },
        "mode": {
          "text": "The value that appears most often in a data set.",
          "links": [
            {
              "href": "wiki:Mode (statistics)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Statistics"
          }
        ]
      }
    },
    {
      "id": "probability",
      "name": "Probability",
      "color": "blue",
      "fact": "Probability measures how likely an event is, from impossible to certain.",
      "terms": [
        "outcome",
        "event",
        "likelihood",
        "sample space"
      ],
      "seeds": [
        "outcome",
        "event"
      ],
      "termInfo": {
        "outcome": {
          "text": "A single possible result of an experiment or trial.",
          "links": [
            {
              "href": "wiki:Outcome (probability)"
            }
          ]
        },
        "event": {
          "text": "A set of one or more outcomes — \"rolling an even number\" is an event made up of three individual outcomes.",
          "links": [
            {
              "href": "wiki:Event (probability theory)"
            }
          ]
        },
        "sample space": {
          "text": "The full set of every possible outcome of an experiment or event.",
          "links": [
            {
              "href": "wiki:Sample space"
            }
          ]
        },
        "likelihood": {
          "links": [
            {
              "href": "wiki:Likelihood function"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Probability"
          }
        ]
      }
    },
    {
      "id": "graphs-charts",
      "name": "Graphs & charts",
      "color": "amber",
      "fact": "Graphs and charts turn raw numbers into a picture that's easier to read at a glance.",
      "terms": [
        "bar chart",
        "histogram",
        "scatter plot",
        "line graph"
      ],
      "seeds": [
        "bar chart",
        "histogram"
      ],
      "termInfo": {
        "bar chart": {
          "links": [
            {
              "href": "wiki:Bar chart"
            }
          ]
        },
        "histogram": {
          "links": [
            {
              "href": "wiki:Histogram"
            }
          ]
        },
        "scatter plot": {
          "links": [
            {
              "href": "wiki:Scatter plot"
            }
          ]
        },
        "line graph": {
          "text": "A chart connecting data points with a line, typically used to show change over time.",
          "links": [
            {
              "href": "wiki:Line chart"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Chart"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "sample",
      "term": "sample",
      "clusters": [
        0,
        1
      ],
      "fact": "Sample bridges the two: statistics describes a sample, and probability predicts how well it represents the whole population.",
      "info": {
        "text": "A subset drawn from a larger population, used to make inferences about the whole.",
        "links": [
          {
            "href": "wiki:Sampling (statistics)"
          }
        ]
      }
    },
    {
      "id": "distribution",
      "term": "distribution",
      "clusters": [
        1,
        2
      ],
      "fact": "Distribution bridges the two: it's a probability idea that's almost always shown as a graph, like a histogram's shape.",
      "info": {
        "text": "A description of how likely each possible outcome is.",
        "links": [
          {
            "href": "wiki:Probability distribution"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "likelihood",
        "histogram"
      ]
    }
  ]
});
