// Concept Clusters puzzle: the basic machine-learning workflow.

export default {
  id: "learning-from-examples",
  title: "Learning from examples",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "artificial-intelligence"
  },
  tags: ["artificial intelligence", "machine learning"],
  info: {
    text: "A machine-learning system turns examples into adjustable parameters, then has to prove that what it learned works on data it did not train on.",
    link: "wiki:Machine learning"
  },
  relatedPuzzles: {
    info: {
      text: "Continue from the overall learning workflow into the mechanics of neural networks and language models."
    },
    entries: [
      {
        id: "neural-networks-layer-by-layer",
        reason: "See how one important family of models carries out fitting with layers, gradients, and backpropagation."
      },
      {
        id: "how-language-models-generate-text",
        reason: "Follow the same ideas into a system trained to predict and generate sequences of tokens."
      }
    ]
  },
  generativeAssistance: [
    {
      system: "Codex",
      provider: "OpenAI",
      scope: "puzzle",
      role: "drafted",
      date: "2026-08-09"
    }
  ],
  lenses: [
    {
      id: "defined-before-fitting",
      prompt: "Which concepts must be defined or assembled before fitting can begin?",
      targets: ["example", "feature", "label", "model", "loss function", "hyperparameter"],
      explanation: "Learning needs examples, a representation in features, target labels when supervision is used, a model to adjust, a loss that states what counts as error, and hyperparameters chosen around training rather than learned by it -- all settled before fitting starts.",
      reasons: {
        example: "Examples are the individual cases from which the system learns.",
        feature: "Features determine what information from each example the model can use.",
        label: "In supervised learning, labels supply the target answer.",
        model: "A model supplies the adjustable form that will be fitted.",
        "loss function": "The loss function defines the error that fitting will try to reduce.",
        hyperparameter: "A hyperparameter such as a learning rate is chosen before fitting begins, not produced by it."
      }
    },
    {
      id: "separating-data-roles",
      prompt: "Which concepts explain why training, model selection, and final evaluation need clearly separated data roles?",
      targets: ["training set", "validation set", "test set", "overfitting", "data leakage"],
      explanation: "Parameters are fitted on training data, validation data guides development choices, and test data supports a final estimate. Overfitting shows why training success is insufficient, while leakage shows what goes wrong when the boundaries are breached.",
      reasons: {
        "training set": "It is the data legitimately used to fit ordinary model parameters.",
        "validation set": "It informs choices around training without becoming parameter-fitting data.",
        "test set": "It is reserved for an independent final check.",
        overfitting: "It is the failure that held-out evaluation is meant to reveal.",
        "data leakage": "It names the contamination that makes a held-out estimate misleading."
      }
    },
    {
      id: "human-design-choices",
      prompt: "Which concepts encode choices made by the people building the learning system, rather than values learned directly as model parameters?",
      targets: ["feature", "label", "loss function", "evaluation metric", "hyperparameter"],
      explanation: "Builders decide how examples are represented, what targets mean, which errors training should penalize, how success will be reported, and which external training settings to try.",
      reasons: {
        feature: "People and preprocessing pipelines decide what measurements become usable inputs.",
        label: "A labeling rule defines the target the system is asked to reproduce.",
        "loss function": "The training objective expresses a design choice about which mistakes matter.",
        "evaluation metric": "The reported metric expresses a choice about what successful behavior means.",
        hyperparameter: "A hyperparameter is selected around training rather than learned as an ordinary model parameter."
      }
    }
  ],
  clusters: [
    {
      name: "Training data",
      color: "teal",
      fact: "Learning begins with a training set made of examples: features describe what the model may use, while labels provide the target answer in supervised learning.",
      terms: ["example", "feature", "label", "training set"],
      seeds: ["feature", "label"],
      termInfo: {
        example: {
          text: "One case presented to a learning system, usually as an input and sometimes with a target output.",
          link: "wiki:Training data"
        },
        feature: {
          text: "A measurable input property used to represent an example to a model.",
          link: "wiki:Feature (machine learning)"
        },
        label: {
          text: "The target category or value attached to an example for supervised learning.",
          link: "wiki:Labeled data"
        },
        "training set": {
          text: "The examples used to fit a model's parameters.",
          link: "wiki:Training, validation, and test data sets"
        }
      }
    },
    {
      name: "Fitting a model",
      color: "blue",
      fact: "Training adjusts a model's parameters to reduce a loss function; gradient descent is one family of methods for finding parameter changes that lower that error.",
      terms: ["model", "parameter", "loss function", "gradient descent"],
      seeds: ["model", "loss function"],
      termInfo: {
        model: {
          text: "A mathematical or computational structure that maps inputs to predictions.",
          link: "wiki:Statistical model"
        },
        parameter: {
          text: "A value inside a model that is adjusted from data during training.",
          link: "wiki:Parameter (statistics)"
        },
        "loss function": {
          text: "A numerical measure of prediction error that training attempts to minimize.",
          link: "wiki:Loss function"
        },
        "gradient descent": {
          text: "An optimization method that repeatedly changes parameters in a direction that reduces loss.",
          link: "wiki:Gradient descent"
        }
      }
    },
    {
      name: "Checking generalization",
      color: "amber",
      fact: "A useful model must generalize beyond its training examples: validation data guides choices, test data supports a final estimate, and an evaluation metric reveals whether apparent learning is really overfitting.",
      terms: ["validation set", "test set", "evaluation metric", "overfitting"],
      seeds: ["test set", "overfitting"],
      termInfo: {
        "validation set": {
          text: "Held-out data used during development to compare choices without fitting ordinary model parameters on it.",
          link: "wiki:Training, validation, and test data sets"
        },
        "test set": {
          text: "Data reserved for estimating final performance after development choices have been made.",
          link: "wiki:Training, validation, and test data sets"
        },
        "evaluation metric": {
          text: "A measure, such as accuracy or mean squared error, used to summarize model performance.",
          link: "wiki:Evaluation of machine learning models"
        },
        overfitting: {
          text: "Learning the training data's peculiarities so closely that performance suffers on new examples.",
          link: "wiki:Overfitting"
        }
      }
    }
  ],
  bridges: [
    {
      term: "supervised learning",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "Supervised learning connects labeled examples to fitting: the model predicts from features, compares each prediction with its label, and adjusts parameters to reduce the resulting loss.",
      idealTerms: ["label", "loss function"],
      direction: { kind: "through", from: 0, to: 1 },
      info: {
        text: "Learning a mapping from inputs to known target outputs supplied in labeled examples.",
        link: "wiki:Supervised learning"
      }
    },
    {
      term: "hyperparameter",
      clusters: [1, 2],
      relationKind: "evaluation",
      fact: "A hyperparameter controls training or model structure but is not fitted like an ordinary parameter; developers commonly compare hyperparameter choices using validation performance.",
      idealTerms: ["parameter", "validation set"],
      direction: { kind: "through", from: 2, to: 1 },
      info: {
        text: "A setting chosen around training, such as a learning rate or model depth, rather than learned as an ordinary parameter.",
        link: "wiki:Hyperparameter (machine learning)"
      }
    },
    {
      term: "data leakage",
      clusters: [0, 2],
      relationKind: "contrast",
      fact: "Data leakage breaks the boundary between learning and evaluation: information unavailable in real use, or reserved for validation or testing, slips into training and makes performance look better than it is.",
      idealTerms: ["training set", "test set"],
      direction: { kind: "through", from: 2, to: 0 },
      info: {
        text: "Improper use of information during model development that would not legitimately be available when predictions are made.",
        link: "wiki:Leakage (machine learning)"
      }
    }
  ]
};
