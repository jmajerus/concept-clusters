// Concept Clusters puzzle: neural-network structure and training.

export default {
  id: "neural-networks-layer-by-layer",
  title: "Neural networks, layer by layer",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "artificial-intelligence"
  },
  tags: ["artificial intelligence", "machine learning", "neural networks"],
  large: true,
  info: {
    text: "A neural network is both a layered computation and a trainable system: signals move forward to make a prediction, while error information moves backward to improve the parameters.",
    link: "wiki:Artificial neural network"
  },
  relatedPuzzles: {
    info: {
      text: "Place neural networks between the general machine-learning workflow and their use inside language models."
    },
    entries: [
      {
        id: "learning-from-examples",
        reason: "Step back to see where neural-network training fits in the larger data, fitting, and evaluation workflow."
      },
      {
        id: "how-language-models-generate-text",
        reason: "See how transformer language models use learned neural computations to predict one token at a time."
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
      id: "forward-information-flow",
      prompt: "Which concepts trace information from the network's entrance to its output?",
      targets: ["input layer", "hidden layer", "output layer", "weighted sum", "bias", "activation function"],
      explanation: "Signals enter at the input layer and pass through hidden layers, where each unit forms a weighted sum, adds a bias, and applies an activation function before the result reaches the output layer.",
      reasons: {
        "input layer": "It receives the represented example.",
        "hidden layer": "It transforms intermediate representations.",
        "output layer": "It produces the network's prediction scores or values.",
        "weighted sum": "It combines incoming signals according to learned connection strengths.",
        bias: "It shifts a unit's combined input before the activation function is applied, the same forward-pass step as the weighted sum.",
        "activation function": "It transforms the combined signal before passing it onward."
      }
    },
    {
      id: "changed-by-the-optimizer",
      prompt: "Which concepts name trainable values that an optimizer can change?",
      targets: ["connection weight", "bias", "parameter"],
      explanation: "Connection weights and biases are the network's ordinary trainable parameters. Gradients tell the optimizer how to change them.",
      reasons: {
        "connection weight": "Its value controls the influence of one incoming connection.",
        bias: "Its value shifts a unit's combined input before activation.",
        parameter: "This bridge is the general name for learned weights and biases."
      }
    },
    {
      id: "training-only-work",
      prompt: "Which concepts are needed to train the network but not to perform an ordinary prediction after training?",
      targets: ["target", "loss", "backpropagation", "gradient", "optimizer", "learning rate"],
      explanation: "Ordinary inference needs the forward computation. Training additionally compares a prediction with a target, measures loss, backpropagates gradients, and applies an optimizer update whose size is influenced by the learning rate.",
      reasons: {
        target: "It supplies the desired output against which a training prediction is compared.",
        loss: "Training needs a scalar objective to say how wrong the prediction was.",
        backpropagation: "It propagates derivative information backward after the forward result is known.",
        gradient: "It gives the local direction of change for each trainable value.",
        optimizer: "It applies an update rule to the parameters.",
        "learning rate": "It controls the scale of an optimizer's parameter updates."
      }
    },
    {
      id: "forward-then-backward",
      prompt: "Which concepts trace one training example from forward computation through the return of update information?",
      targets: ["forward pass", "prediction", "loss", "backpropagation", "gradient", "parameter"],
      explanation: "The forward pass produces a prediction, the loss evaluates it, and backpropagation carries gradient information toward each parameter. This separates the direction of prediction from the direction used to learn.",
      reasons: {
        "forward pass": "It computes the network's output using the current parameters.",
        prediction: "It is the forward result evaluated during training.",
        loss: "It reduces the prediction-target comparison to an objective.",
        backpropagation: "It propagates derivative information backward through the computation.",
        gradient: "It quantifies how each parameter contributed locally to the loss.",
        parameter: "It is the trainable value that the returned update information can change."
      }
    }
  ],
  clusters: [
    {
      name: "Layered architecture",
      color: "teal",
      fact: "A feedforward network receives values at an input layer, transforms them through one or more hidden layers, and produces a result at an output layer; connection weights determine how strongly units influence one another.",
      terms: ["input layer", "hidden layer", "output layer", "connection weight"],
      seeds: ["input layer", "output layer"],
      termInfo: {
        "input layer": {
          text: "The network boundary that receives the numerical representation of an example.",
          link: "wiki:Artificial neural network"
        },
        "hidden layer": {
          text: "A layer between input and output that learns intermediate representations.",
          link: "wiki:Hidden layer"
        },
        "output layer": {
          text: "The final layer that produces prediction values or scores.",
          link: "wiki:Artificial neural network"
        },
        "connection weight": {
          text: "A learned multiplier controlling how strongly one unit's output contributes to another unit.",
          link: "wiki:Weight (artificial neural network)"
        }
      }
    },
    {
      name: "Forward computation",
      color: "blue",
      fact: "During a forward pass, a unit forms a weighted sum, adds a bias, and applies an activation function; repeating that computation across layers turns an input into a prediction.",
      terms: ["weighted sum", "bias", "activation function"],
      seeds: ["weighted sum", "activation function"],
      termInfo: {
        "weighted sum": {
          text: "The sum of incoming values after each has been multiplied by its connection weight.",
          link: "wiki:Linear combination"
        },
        bias: {
          text: "A learned offset added before a unit's activation function is applied.",
          link: "wiki:Bias (machine learning)"
        },
        "activation function": {
          text: "A usually nonlinear transformation applied to a unit's combined input.",
          link: "wiki:Activation function"
        }
      }
    },
    {
      name: "Measuring prediction error",
      color: "amber",
      fact: "A training objective compares the network's prediction with a target and reduces that comparison to a loss whose value says what learning should improve.",
      terms: ["prediction", "target", "loss"],
      seeds: ["target", "loss"],
      termInfo: {
        prediction: {
          text: "The output value or scores produced by the network for an example.",
          link: "wiki:Prediction"
        },
        target: {
          text: "The desired or observed output used to evaluate a training prediction.",
          link: "wiki:Supervised learning"
        },
        loss: {
          text: "A numerical measure of how far a prediction is from the training objective.",
          link: "wiki:Loss function"
        }
      }
    },
    {
      name: "Updating the parameters",
      color: "magenta",
      fact: "Backpropagation computes gradients of the loss, and an optimizer combines those gradients with an update rule and learning rate to change the parameters.",
      terms: ["backpropagation", "gradient", "optimizer", "learning rate"],
      seeds: ["backpropagation", "optimizer"],
      termInfo: {
        backpropagation: {
          text: "An efficient use of the chain rule to calculate how network parameters contributed to loss.",
          link: "wiki:Backpropagation"
        },
        gradient: {
          text: "The collection of derivatives showing how a small change in each parameter would change loss.",
          link: "wiki:Gradient"
        },
        optimizer: {
          text: "An update rule that uses gradients and other state to change trainable parameters.",
          link: "wiki:Stochastic gradient descent"
        },
        "learning rate": {
          text: "A hyperparameter controlling the scale of parameter updates made during optimization.",
          link: "wiki:Learning rate"
        }
      }
    }
  ],
  bridges: [
    {
      term: "neuron",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "A simplified artificial neuron is where architecture becomes computation: it receives weighted connections, adds a bias, applies an activation function, and sends the result to the next layer.",
      idealTerms: ["connection weight", "activation function"],
      direction: { kind: "through", from: 0, to: 1 },
      info: {
        text: "A computational unit that combines inputs and applies an activation function to produce an output.",
        link: "wiki:Artificial neuron"
      }
    },
    {
      term: "parameter",
      clusters: [0, 3],
      relationKind: "dynamic",
      fact: "Connection weights and biases are trainable parameters: the architecture provides places to store them, and learning changes them according to gradients from the loss.",
      idealTerms: ["connection weight", "gradient"],
      direction: { kind: "through", from: 3, to: 0 },
      info: {
        text: "A value inside the network, usually a weight or bias, adjusted during training.",
        link: "wiki:Parameter (statistics)"
      }
    },
    {
      term: "training step",
      clusters: [1, 2, 3],
      relationKind: "dynamic",
      fact: "One training step joins the two directions of work: a forward pass produces a prediction and loss, then backpropagation and the optimizer use that result to update parameters.",
      idealTerms: ["activation function", "loss", "backpropagation"],
      info: {
        text: "One cycle of forward computation, loss measurement, gradient calculation, and parameter updating.",
        link: "wiki:Backpropagation"
      }
    },
    {
      term: "forward pass",
      clusters: [1, 2],
      relationKind: "dynamic",
      fact: "A forward pass turns the current input into a prediction; during training, that prediction then enters the loss calculation against a target.",
      idealTerms: ["activation function", "prediction"],
      direction: { kind: "through", from: 1, to: 2 },
      info: {
        text: "The input-to-output evaluation of a network using its current parameters.",
        link: "wiki:Feedforward neural network"
      }
    }
  ]
};
