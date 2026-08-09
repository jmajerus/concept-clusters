// Concept Clusters puzzle: token-by-token language-model generation.

export default {
  id: "how-language-models-generate-text",
  title: "How language models generate text",
  category: "Computer Science",
  subcategories: {
    "Computer Science": "artificial-intelligence"
  },
  tags: ["artificial intelligence", "generative AI", "language models"],
  info: {
    text: "A language model does not write a whole response at once: it represents text as tokens, transforms their context through attention, and repeatedly chooses a possible next token.",
    link: "wiki:Large language model"
  },
  relatedPuzzles: {
    info: {
      text: "Connect token generation to the broader learning workflow and the neural computations underneath it."
    },
    entries: [
      {
        id: "learning-from-examples",
        reason: "Return to the general distinction between fitting on training data and evaluating behavior on held-out examples."
      },
      {
        id: "neural-networks-layer-by-layer",
        reason: "Unpack the forward computations and learned parameters that transformer layers are built from."
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
      id: "turning-text-into-model-input",
      prompt: "Which concepts help turn ordered text into numerical input the model can process?",
      targets: ["tokenizer", "token", "embedding", "context window", "positional encoding"],
      explanation: "A tokenizer splits text into tokens, embeddings turn those token identities into vectors, positional encoding carries order, and the context window limits how much of that represented sequence can be processed at once.",
      reasons: {
        tokenizer: "It applies the rule that divides text into vocabulary units.",
        token: "It is the discrete unit assigned an identity for model input.",
        embedding: "It maps a token identity to a learned vector.",
        "context window": "It bounds the sequence available as input for the current prediction.",
        "positional encoding": "It adds information about where each token occurs in the sequence."
      }
    },
    {
      id: "producing-a-choice",
      prompt: "Which concepts participate directly in turning the current representation into a choice among possible next tokens?",
      targets: ["attention weight", "value vector", "logits", "softmax", "sampling", "next-token prediction"],
      explanation: "Attention weights combine value vectors into contextual representations; the output computation turns those representations into logits, softmax turns logits into probabilities, and a decoding rule samples or selects the next-token prediction.",
      reasons: {
        "attention weight": "It controls how much a value vector contributes to a contextual representation.",
        "value vector": "It carries the information combined according to attention weights.",
        logits: "They are the unnormalized scores assigned to vocabulary choices.",
        softmax: "It converts those scores into a probability distribution.",
        sampling: "It chooses a token according to a decoding rule and the distribution.",
        "next-token prediction": "It is the immediate task that the whole choice process serves."
      }
    },
    {
      id: "repeated-during-generation",
      prompt: "Which concepts are revisited each time another token is generated?",
      targets: ["context window", "attention weight", "logits", "softmax", "sampling", "autoregressive loop"],
      explanation: "At each step, the available context is processed again, attention weights and output scores are computed, probabilities are formed, one token is selected, and the expanded sequence becomes input to the next step.",
      reasons: {
        "context window": "The prompt plus generated tokens are reconsidered within the model's length limit.",
        "attention weight": "Attention relationships are computed for the current sequence.",
        logits: "A fresh set of next-token scores is produced.",
        softmax: "Those scores become a fresh probability distribution.",
        sampling: "A decoding choice is made for the current step.",
        "autoregressive loop": "It feeds the chosen token back into the sequence and repeats the process."
      }
    }
  ],
  clusters: [
    {
      name: "Representing text",
      color: "teal",
      fact: "A tokenizer divides text into tokens, embeddings turn token identities into learned vectors, and a context window limits how much of the sequence can influence the current prediction.",
      terms: ["tokenizer", "token", "embedding", "context window"],
      seeds: ["tokenizer", "token"],
      termInfo: {
        tokenizer: {
          text: "The component and rule set that converts text to token identifiers and back again.",
          link: "wiki:Natural language processing"
        },
        token: {
          text: "A vocabulary unit processed by the model, often a word, word piece, character, or byte sequence.",
          link: "wiki:Lexical analysis"
        },
        embedding: {
          text: "A learned numerical vector used to represent a token or other discrete item.",
          link: "wiki:Word embedding"
        },
        "context window": {
          text: "The bounded amount of preceding and current sequence information available for one model computation.",
          link: "wiki:Large language model"
        }
      }
    },
    {
      name: "Computing attention",
      color: "blue",
      fact: "Self-attention compares each position's query with other positions' keys, turns those matches into attention weights, and uses the weights to combine value vectors into contextual representations.",
      terms: ["query vector", "key vector", "value vector", "attention weight"],
      seeds: ["query vector", "key vector"],
      termInfo: {
        "query vector": {
          text: "A learned projection representing what the current position is seeking from other positions.",
          link: "wiki:Attention (machine learning)"
        },
        "key vector": {
          text: "A learned projection compared with a query to help determine relevance.",
          link: "wiki:Attention (machine learning)"
        },
        "value vector": {
          text: "A learned projection carrying the information combined by attention weights.",
          link: "wiki:Attention (machine learning)"
        },
        "attention weight": {
          text: "A normalized score controlling how much one position's value contributes to another position's representation.",
          link: "wiki:Attention (machine learning)"
        }
      }
    },
    {
      name: "Choosing the next token",
      color: "amber",
      fact: "For next-token prediction, the model assigns logits to vocabulary items, softmax converts them into probabilities, and a decoding method may sample one token before the process repeats.",
      terms: ["logits", "softmax", "next-token prediction", "sampling"],
      seeds: ["next-token prediction", "sampling"],
      termInfo: {
        logits: {
          text: "Unnormalized output scores, one for each possible vocabulary token.",
          link: "wiki:Logit"
        },
        softmax: {
          text: "A function that converts a collection of scores into nonnegative probabilities summing to one.",
          link: "wiki:Softmax function"
        },
        "next-token prediction": {
          text: "Estimating a probability distribution for the token that follows the current sequence.",
          link: "wiki:Language model"
        },
        sampling: {
          text: "Selecting a token from a probability distribution, often after applying decoding controls.",
          link: "wiki:Sampling (statistics)"
        }
      }
    }
  ],
  bridges: [
    {
      term: "positional encoding",
      clusters: [0, 1],
      relationKind: "foundation",
      fact: "Because attention alone does not inherently say which token came first, positional information is added to token representations so attention can use sequence order.",
      idealTerms: ["embedding", "query vector"],
      direction: { kind: "through", from: 0, to: 1 },
      info: {
        text: "Numerical information added or applied to representations so a transformer can distinguish token positions.",
        link: "wiki:Transformer (deep learning architecture)"
      }
    },
    {
      term: "transformer",
      clusters: [1, 2],
      relationKind: "foundation",
      fact: "A transformer stacks attention and feedforward computations to build contextual representations; a language-model output layer then turns the final representations into next-token scores.",
      idealTerms: ["attention weight", "logits"],
      direction: { kind: "through", from: 1, to: 2 },
      info: {
        text: "A neural-network architecture built around attention, residual connections, normalization, and position-wise feedforward computation.",
        link: "wiki:Transformer (deep learning architecture)"
      }
    },
    {
      term: "autoregressive loop",
      clusters: [0, 2],
      relationKind: "dynamic",
      fact: "After a token is chosen, it is appended to the represented sequence and becomes part of the context used to predict the following token; generation is this loop repeated many times.",
      idealTerms: ["context window", "sampling"],
      direction: { kind: "through", from: 2, to: 0 },
      info: {
        text: "A generation process that feeds previous outputs back in as inputs for the next prediction.",
        link: "wiki:Autoregressive model"
      }
    }
  ]
};
