// Generated from content/puzzles/how-language-models-generate-text.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "how-language-models-generate-text",
  "title": "How language models generate text",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "artificial-intelligence"
  },
  "large": true,
  "tags": [
    "artificial intelligence",
    "generative AI",
    "language models"
  ],
  "info": {
    "text": "A language model does not write a whole response at once: it represents text as tokens, transforms their context through attention, and repeatedly chooses a possible next token.",
    "links": [
      {
        "href": "wiki:Large language model"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-representing-text",
      "name": "Representing text",
      "color": "teal",
      "fact": "A tokenizer divides text into tokens, embeddings turn token identities into learned vectors, and a context window limits how much of the sequence can influence the current prediction.",
      "terms": [
        "tokenizer",
        "token",
        "embedding",
        "context window"
      ],
      "seeds": [
        "tokenizer",
        "token"
      ],
      "termInfo": {
        "tokenizer": {
          "text": "The component and rule set that converts text to token identifiers and back again.",
          "links": [
            {
              "href": "wiki:Natural language processing"
            }
          ]
        },
        "token": {
          "text": "A vocabulary unit processed by the model, often a word, word piece, character, or byte sequence.",
          "links": [
            {
              "href": "wiki:Lexical analysis"
            }
          ]
        },
        "embedding": {
          "text": "A learned numerical vector used to represent a token or other discrete item.",
          "links": [
            {
              "href": "wiki:Word embedding"
            }
          ]
        },
        "context window": {
          "text": "The bounded amount of preceding and current sequence information available for one model computation.",
          "links": [
            {
              "href": "wiki:Large language model"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-computing-attention",
      "name": "Computing attention",
      "color": "blue",
      "fact": "Self-attention compares each position's query with other positions' keys, turns those matches into attention weights, and uses the weights to combine value vectors into contextual representations.",
      "terms": [
        "query vector",
        "key vector",
        "value vector",
        "attention weight"
      ],
      "seeds": [
        "query vector",
        "key vector"
      ],
      "termInfo": {
        "query vector": {
          "text": "A learned projection representing what the current position is seeking from other positions.",
          "links": [
            {
              "href": "wiki:Attention (machine learning)"
            }
          ]
        },
        "key vector": {
          "text": "A learned projection compared with a query to help determine relevance.",
          "links": [
            {
              "href": "wiki:Attention (machine learning)"
            }
          ]
        },
        "value vector": {
          "text": "A learned projection carrying the information combined by attention weights.",
          "links": [
            {
              "href": "wiki:Attention (machine learning)"
            }
          ]
        },
        "attention weight": {
          "text": "A normalized score controlling how much one position's value contributes to another position's representation.",
          "links": [
            {
              "href": "wiki:Attention (machine learning)"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-scoring-the-next-token",
      "name": "Scoring the next token",
      "color": "amber",
      "fact": "For next-token prediction, the model assigns a logit to each vocabulary item and softmax converts those scores into a probability distribution.",
      "terms": [
        "vocabulary",
        "logits",
        "softmax",
        "next-token prediction"
      ],
      "seeds": [
        "logits",
        "next-token prediction"
      ],
      "termInfo": {
        "vocabulary": {
          "text": "The finite inventory of token identifiers among which the model assigns next-token scores.",
          "links": [
            {
              "href": "wiki:Language model"
            }
          ]
        },
        "logits": {
          "text": "Unnormalized output scores, one for each possible vocabulary token.",
          "links": [
            {
              "href": "wiki:Logit"
            }
          ]
        },
        "softmax": {
          "text": "A function that converts a collection of scores into nonnegative probabilities summing to one.",
          "links": [
            {
              "href": "wiki:Softmax function"
            }
          ]
        },
        "next-token prediction": {
          "text": "Estimating a probability distribution for the token that follows the current sequence.",
          "links": [
            {
              "href": "wiki:Language model"
            }
          ]
        }
      }
    },
    {
      "id": "cluster-decoding-a-continuation",
      "name": "Decoding a continuation",
      "color": "magenta",
      "fact": "A decoding strategy turns the probability distribution into an emitted token: it may take the highest score or sample, while controls such as temperature reshape the choice.",
      "terms": [
        "greedy decoding",
        "sampling",
        "temperature"
      ],
      "seeds": [
        "sampling",
        "temperature"
      ],
      "termInfo": {
        "greedy decoding": {
          "text": "Choosing the highest-probability token at each generation step.",
          "links": [
            {
              "href": "wiki:Greedy algorithm"
            }
          ]
        },
        "sampling": {
          "text": "Selecting a token stochastically from a probability distribution, often after applying decoding controls.",
          "links": [
            {
              "href": "wiki:Sampling (statistics)"
            }
          ]
        },
        "temperature": {
          "text": "A decoding control that rescales logits before softmax, changing how concentrated the resulting distribution is.",
          "links": [
            {
              "href": "wiki:Softmax function"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-positional-encoding",
      "term": "positional encoding",
      "clusters": [
        0,
        1
      ],
      "fact": "Because attention alone does not inherently say which token came first, positional information is added to token representations so attention can use sequence order.",
      "info": {
        "text": "Numerical information added or applied to representations so a transformer can distinguish token positions.",
        "links": [
          {
            "href": "wiki:Transformer (deep learning architecture)"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "embedding",
        "query vector"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-transformer",
      "term": "transformer",
      "clusters": [
        1,
        2
      ],
      "fact": "A transformer stacks attention and feedforward computations to build contextual representations; a language-model output layer then turns the final representations into next-token scores.",
      "info": {
        "text": "A neural-network architecture built around attention, residual connections, normalization, and position-wise feedforward computation.",
        "links": [
          {
            "href": "wiki:Transformer (deep learning architecture)"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "attention weight",
        "logits"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-autoregressive-loop",
      "term": "autoregressive loop",
      "clusters": [
        0,
        2,
        3
      ],
      "fact": "After a token is chosen, it is appended to the represented sequence and becomes part of the context used to predict the following token; generation is this loop repeated many times.",
      "info": {
        "text": "A generation process that feeds previous outputs back in as inputs for the next prediction.",
        "links": [
          {
            "href": "wiki:Autoregressive model"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "context window",
        "next-token prediction",
        "sampling"
      ]
    }
  ],
  "lenses": [
    {
      "id": "turning-text-into-model-input",
      "prompt": "Which concepts help turn ordered text into numerical input the model can process?",
      "explanation": "A tokenizer splits text into tokens, embeddings turn those token identities into vectors, positional encoding carries order, and the context window limits how much of that represented sequence can be processed at once.",
      "targets": [
        "tokenizer",
        "token",
        "embedding",
        "context window",
        "positional encoding"
      ],
      "reasons": {
        "tokenizer": "It applies the rule that divides text into vocabulary units.",
        "token": "It is the discrete unit assigned an identity for model input.",
        "embedding": "It maps a token identity to a learned vector.",
        "context window": "It bounds the sequence available as input for the current prediction.",
        "positional encoding": "It adds information about where each token occurs in the sequence."
      }
    },
    {
      "id": "producing-a-choice",
      "prompt": "Which concepts participate directly in turning the current representation into a choice among possible next tokens?",
      "explanation": "Attention weights combine value vectors into contextual representations; the output computation turns those representations into logits, softmax turns logits into probabilities, and a decoding rule samples or selects a token.",
      "targets": [
        "attention weight",
        "value vector",
        "logits",
        "softmax",
        "sampling",
        "greedy decoding"
      ],
      "reasons": {
        "attention weight": "It controls how much a value vector contributes to a contextual representation.",
        "value vector": "It carries the information combined according to attention weights.",
        "logits": "They are the unnormalized scores assigned to vocabulary choices.",
        "softmax": "It converts those scores into a probability distribution.",
        "sampling": "It chooses a token stochastically from the adjusted distribution.",
        "greedy decoding": "It deterministically chooses the highest-scoring available token."
      }
    },
    {
      "id": "repeated-during-generation",
      "prompt": "In sampling-based decoding, which concepts are revisited each time another token is generated?",
      "explanation": "At each sampling step, the available context is processed again, attention weights and output scores are computed, probabilities are formed, one token is sampled, and the expanded sequence becomes input to the next step.",
      "targets": [
        "context window",
        "attention weight",
        "logits",
        "softmax",
        "sampling",
        "autoregressive loop"
      ],
      "reasons": {
        "context window": "The prompt plus generated tokens are reconsidered within the model's length limit.",
        "attention weight": "Attention relationships are computed for the current sequence.",
        "logits": "A fresh set of next-token scores is produced.",
        "softmax": "Those scores become a fresh probability distribution.",
        "sampling": "A decoding choice is made for the current step.",
        "autoregressive loop": "It feeds the chosen token back into the sequence and repeats the process."
      }
    },
    {
      "id": "decoding-is-a-policy",
      "prompt": "Which concepts show that model scores and the policy used to emit text are related but not identical?",
      "explanation": "Logits and softmax describe the model's next-token distribution. Greedy decoding, sampling, and temperature determine how that distribution is used, while the autoregressive loop repeats the selected policy over time.",
      "targets": [
        "logits",
        "softmax",
        "greedy decoding",
        "sampling",
        "temperature",
        "autoregressive loop"
      ],
      "reasons": {
        "logits": "They are scores produced by the model before a decoding policy is applied.",
        "softmax": "It converts scores into the distribution consumed by decoding.",
        "greedy decoding": "It selects the highest-probability token deterministically.",
        "sampling": "It makes a stochastic selection from a distribution.",
        "temperature": "It reshapes the distribution before selection without retraining the model.",
        "autoregressive loop": "It repeatedly applies the model and decoding policy to an expanding sequence."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Connect token generation to the broader learning workflow and the neural computations underneath it."
    },
    "entries": [
      {
        "id": "learning-from-examples",
        "reason": "Return to the general distinction between fitting on training data and evaluating behavior on held-out examples."
      },
      {
        "id": "neural-networks-layer-by-layer",
        "reason": "Unpack the forward computations and learned parameters that transformer layers are built from."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
