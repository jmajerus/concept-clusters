// Generated from content/puzzles/data-science-basics.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "data-science-basics",
  "title": "Data science basics",
  "category": "Data Science",
  "info": {
    "link": "wiki:Data science",
    "text": "The three things every data science project needs, in order: data worth trusting, a clear-eyed summary of what it says, and a model that predicts without fooling itself."
  },
  "lenses": [
    {
      "explanation": "A dataset, its features, its sample, and its missing values are all properties of the data as collected -- before anyone runs a calculation on it. An outlier belongs here too: it's a specific data point you can point to, even though the reason it stands out is a statistical one covered in the next round.",
      "id": "the-raw-data",
      "prompt": "Which concepts describe the raw data itself, or something spotted directly within it, rather than a statistic computed from it?",
      "reasons": {
        "dataset": "The collection of data itself, before anything is calculated from it.",
        "feature": "One measurable property recorded for each observation -- part of the data's raw structure.",
        "missing value": "An absence within the raw data, not a number computed from it.",
        "outlier": "A specific data point that stands out, even though describing how far it stands out takes a statistic.",
        "sample": "The actual subset of data that was collected, as opposed to any number describing it."
      },
      "targets": [
        "dataset",
        "missing value",
        "feature",
        "sample",
        "outlier"
      ]
    },
    {
      "explanation": "Correlation and regression turn observed data into claims about a relationship; a training set is what a model learns that relationship from; and variance and overfitting are both about whether that learned relationship actually holds up on data the model hasn't seen.",
      "id": "built-to-predict",
      "prompt": "Which concepts are about using data to predict or explain something beyond what's already been directly observed?",
      "reasons": {
        "correlation": "A claim about how two variables move together, extending beyond any single observation.",
        "overfitting": "A failure of prediction: matching the training data so closely that new data is predicted badly.",
        "regression": "A fitted relationship used to predict values that weren't directly observed.",
        "training set": "The data a model actually learns its predictive relationship from.",
        "variance": "The instability in a model's predictions that overfitting is a symptom of."
      },
      "targets": [
        "correlation",
        "regression",
        "overfitting",
        "training set",
        "variance"
      ]
    },
    {
      "explanation": "Every other working-with-data concept is a property of, or something found within, the sample. Standard deviation is what outliers are measured against, and what variance itself is built from. And a training set is the one thing a model's parameters actually come from -- everything else about the model is judged by how well it generalizes beyond it.",
      "id": "the-reference-point",
      "prompt": "Which concept is the basic reference point that everything else in its area is compared against or built from?",
      "reasons": {
        "sample": "Every other working-with-data concept is a property of, or something found within, this collected subset.",
        "standard deviation": "Outliers are defined by distance from it, and variance is just its square.",
        "training set": "A model's parameters come only from this; its quality is judged by performance beyond it."
      },
      "targets": [
        "sample",
        "standard deviation",
        "training set"
      ]
    },
    {
      "explanation": "A mean and a median are each one number standing in for the whole dataset's center; a distribution is the whole shape of the data compressed into one describable pattern; and a correlation compresses an entire relationship between two features into a single coefficient. Standard deviation measures spread rather than center or relationship, which is why it's covered in the earlier reference-point round instead.",
      "id": "compressed-to-one-number",
      "prompt": "Which concepts summarize an entire dataset, or the relationship between two of its features, into a single number or shape -- rather than describing one data point or one model?",
      "reasons": {
        "correlation": "The entire relationship between two features compressed into a single coefficient.",
        "distribution": "The entire shape of the data compressed into one describable pattern.",
        "mean": "One number standing in for the center of the entire dataset.",
        "median": "A different single number standing in for the center, chosen to resist a few extreme values."
      },
      "targets": [
        "mean",
        "median",
        "distribution",
        "correlation"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-working-with-data",
      "name": "Working with data",
      "color": "teal",
      "fact": "Before any analysis can happen, data has to be collected into a dataset, checked for missing values, organized into features, and drawn as a sample that's meant to represent something larger.",
      "terms": [
        "dataset",
        "missing value",
        "feature",
        "sample"
      ],
      "seeds": [
        "dataset",
        "feature"
      ],
      "termInfo": {
        "dataset": {
          "link": "wiki:Data set",
          "text": "A collection of data, typically organized so each row is one observation and each column is one variable."
        },
        "feature": {
          "link": "wiki:Feature (machine learning)",
          "text": "An individual measurable property of what's being studied -- one column of the dataset."
        },
        "missing value": {
          "link": "wiki:Missing data",
          "text": "A value that should have been recorded but wasn't, and has to be decided on before any analysis can run."
        },
        "sample": {
          "link": "wiki:Sample (statistics)",
          "text": "The subset of a larger population that was actually collected and is available to analyze."
        }
      }
    },
    {
      "id": "cluster-describing-data",
      "name": "Describing data",
      "color": "blue",
      "fact": "Describing data means summarizing a pile of numbers with a few key figures: where its center sits, using the mean or the median, how spread out it is, using the standard deviation, and the overall shape of that spread, its distribution.",
      "terms": [
        "mean",
        "median",
        "standard deviation",
        "distribution"
      ],
      "seeds": [
        "mean",
        "distribution"
      ],
      "termInfo": {
        "distribution": {
          "link": "wiki:Probability distribution",
          "text": "The overall shape of how values are spread across their possible range."
        },
        "mean": {
          "link": "wiki:Arithmetic mean",
          "text": "The sum of the values divided by how many there are -- the ordinary average."
        },
        "median": {
          "link": "wiki:Median",
          "text": "The middle value when everything is sorted low to high, unmoved by a few extreme values."
        },
        "standard deviation": {
          "link": "wiki:Standard deviation",
          "text": "How far, on average, values typically sit from the mean."
        }
      }
    },
    {
      "id": "cluster-modeling-data",
      "name": "Modeling data",
      "color": "amber",
      "fact": "Modeling data means using it to predict: correlation flags that two things move together, regression fits a line to that relationship, and the model learns from a training set, but only if it doesn't overfit to that training set's particular quirks.",
      "terms": [
        "correlation",
        "regression",
        "overfitting",
        "training set"
      ],
      "seeds": [
        "correlation",
        "regression"
      ],
      "termInfo": {
        "correlation": {
          "link": "wiki:Correlation and dependence",
          "text": "How strongly two variables move together, without saying which one, if either, causes the other."
        },
        "overfitting": {
          "link": "wiki:Overfitting",
          "text": "A model that has matched the noise in its training data so closely that it fails to predict new data well."
        },
        "regression": {
          "link": "wiki:Regression analysis",
          "text": "Fitting a line or curve that predicts one variable from another."
        },
        "training set": {
          "link": "wiki:Training, validation, and test data sets",
          "text": "The portion of the data a model actually learns from, held apart from the data used to judge it."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-outlier",
      "term": "outlier",
      "clusters": [
        0,
        1
      ],
      "fact": "An outlier is spotted by describing the data -- it sits unusually far from the mean, out past where most of the spread is -- but what to do about it is a data-cleaning decision: investigate it, keep it, or remove it.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Outlier",
        "text": "A data point far enough from the rest to prompt a decision: is it real, or is it an error?"
      },
      "idealTerms": [
        "sample",
        "standard deviation"
      ]
    },
    {
      "id": "bridge-variance",
      "term": "variance",
      "clusters": [
        1,
        2
      ],
      "fact": "Variance is the squared version of the same spread standard deviation measures, and it's the exact idea underneath overfitting: a model with high variance has learned the noise in its training set, not just the signal, so its predictions swing wildly depending on which data it happened to see.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Variance",
        "text": "How spread out values are, measured as the average squared distance from the mean."
      },
      "idealTerms": [
        "standard deviation",
        "overfitting"
      ]
    }
  ]
});
