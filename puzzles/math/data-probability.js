// Concept Clusters puzzle: Data & probability
// Category: Math
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "data-probability",
  "title": "Data & probability",
  "category": "Math",
  "clusters": [
    {
      "name": "Statistics",
      "info": {
        "link": "wiki:Statistics"
      },
      "color": "green",
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
          "link": "wiki:Mean"
        },
        "median": {
          "link": "wiki:Median"
        },
        "range": {
          "text": "The difference between the highest and lowest values in a data set.",
          "link": "wiki:Range (statistics)"
        },
        "mode": {
          "text": "The value that appears most often in a data set.",
          "link": "wiki:Mode (statistics)"
        }
      }
    },
    {
      "name": "Probability",
      "info": {
        "link": "wiki:Probability"
      },
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
          "link": "wiki:Outcome (probability)"
        },
        "event": {
          "text": "A set of one or more outcomes — \"rolling an even number\" is an event made up of three individual outcomes.",
          "link": "wiki:Event (probability theory)"
        },
        "sample space": {
          "text": "The full set of every possible outcome of an experiment or event.",
          "link": "wiki:Sample space"
        },
        "likelihood": {
          "link": "wiki:Likelihood function"
        }
      }
    },
    {
      "name": "Graphs & charts",
      "info": {
        "link": "wiki:Chart"
      },
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
          "link": "wiki:Bar chart"
        },
        "histogram": {
          "link": "wiki:Histogram"
        },
        "scatter plot": {
          "link": "wiki:Scatter plot"
        },
        "line graph": {
          "text": "A chart connecting data points with a line, typically used to show change over time.",
          "link": "wiki:Line chart"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "sample",
      "clusters": [
        0,
        1
      ],
      "fact": "Sample bridges the two: statistics describes a sample, and probability predicts how well it represents the whole population.",
      "info": {
        "text": "A subset drawn from a larger population, used to make inferences about the whole.",
        "link": "wiki:Sampling (statistics)"
      }
    },
    {
      "term": "distribution",
      "clusters": [
        1,
        2
      ],
      "fact": "Distribution bridges the two: it's a probability idea that's almost always shown as a graph, like a histogram's shape.",
      "idealTerms": [
        "likelihood",
        "histogram"
      ],
      "info": {
        "text": "A description of how likely each possible outcome is.",
        "link": "wiki:Probability distribution"
      }
    }
  ]
};
