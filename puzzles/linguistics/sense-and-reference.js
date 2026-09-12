// Generated from content/puzzles/sense-and-reference.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "sense-and-reference",
  "title": "Sense and Reference",
  "category": "linguistics",
  "large": true,
  "info": {
    "text": "Frege's 1892 distinction between the sign, its sense, and its reference.",
    "links": [
      {
        "href": "wiki:Sense and reference"
      }
    ],
    "citations": [
      {
        "title": "Über Sinn und Bedeutung",
        "author": "Frege, Gottlob",
        "publisher": "Zeitschrift für Philosophie und philosophische Kritik",
        "year": "1892"
      }
    ]
  },
  "clusters": [
    {
      "id": "sense",
      "name": "Sense",
      "color": "teal",
      "fact": "The objective conceptual meaning or mode of presentation of a linguistic sign, which is shareable and determines what the expression refers to.",
      "terms": [
        "intension",
        "Sinn",
        "cognitive significance"
      ],
      "seeds": [
        "intension",
        "Sinn"
      ],
      "termInfo": {
        "Sinn": {
          "text": "The original German term for 'Sense', introduced by Gottlob Frege in 1892 to refer to the objective, shareable meaning of a linguistic expression.",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        },
        "cognitive significance": {
          "text": "The informative value of a term or statement. Statements of identity like 'a = b' (e.g., 'The Morning Star is the Evening Star') have cognitive significance because the terms have different senses, whereas 'a = a' does not.",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        },
        "intension": {
          "text": "The conceptual meaning or connotation of a term (its 'sense'), which determines its extension (reference) across different possible situations.",
          "links": [
            {
              "href": "wiki:Intension"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sense and reference"
          }
        ]
      }
    },
    {
      "id": "reference",
      "name": "Reference",
      "color": "blue",
      "fact": "The actual object, denotation, or truth-value in the real world designated by a linguistic sign.",
      "terms": [
        "extension",
        "Bedeutung",
        "truth-value",
        "The True",
        "The False"
      ],
      "seeds": [
        "extension",
        "Bedeutung"
      ],
      "termInfo": {
        "Bedeutung": {
          "text": "The original German term for 'Reference' or 'meaning' in Frege's essay, pointing to the real-world referent that a term designates.",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        },
        "The False": {
          "text": "One of the two objective logical values that Frege identifies as the reference of a false declarative sentence (German: Das Falsche).",
          "links": [
            {
              "href": "wiki:Truth value"
            }
          ]
        },
        "The True": {
          "text": "One of the two objective logical values that Frege identifies as the reference of a true declarative sentence (German: Das Wahre).",
          "links": [
            {
              "href": "wiki:Truth value"
            }
          ]
        },
        "extension": {
          "text": "The set of actual things in the world to which a concept or term applies (coextensive with Frege's 'Reference').",
          "links": [
            {
              "href": "wiki:Extension (semantics)"
            }
          ]
        },
        "truth-value": {
          "text": "In Frege's semantics, the reference of an entire declarative sentence is its truth-value: either 'The True' or 'The False'.",
          "links": [
            {
              "href": "wiki:Truth value"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sense and reference"
          }
        ]
      }
    },
    {
      "id": "representation",
      "name": "Subjective representation",
      "color": "amber",
      "fact": "The private psychological mental images and personal ideas associated with an expression, which are entirely subjective and vary by individual.",
      "terms": [
        "mental image",
        "Vorstellung",
        "subjective association"
      ],
      "seeds": [
        "mental image",
        "Vorstellung"
      ],
      "termInfo": {
        "Vorstellung": {
          "text": "The original German term for 'Representation' or 'subjective idea'. Frege strongly warns against confusing this private psychological image with objective shareable Sense.",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        },
        "mental image": {
          "text": "A private, internal visualization or sensation associated with a word, unique to each individual observer and inaccessible to others.",
          "links": [
            {
              "href": "wiki:Mental image"
            }
          ]
        },
        "subjective association": {
          "text": "The personal psychological connections a speaker brings to a word, which differ for every individual and carry no logical weight."
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Mental image"
          }
        ]
      }
    },
    {
      "id": "sign",
      "name": "Linguistic sign",
      "color": "magenta",
      "fact": "The physical or symbolic linguistic expression (such as a word, proper name, or sentence) that carries a sense and designates a reference.",
      "terms": [
        "proper name",
        "Zeichen",
        "declarative sentence"
      ],
      "seeds": [
        "proper name",
        "Zeichen"
      ],
      "termInfo": {
        "Zeichen": {
          "text": "The original German term for 'Sign' or 'expression' used by Frege to designate the primary written or spoken linguistic symbol.",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        },
        "declarative sentence": {
          "text": "A grammatical statement that asserts a fact. Frege analyzes its sense as a 'thought' and its reference as a 'truth-value'."
        },
        "proper name": {
          "text": "In Frege's terminology, any singular term, definite description, or name that refers to a specific, unique object (e.g., 'Venus' or 'the Morning Star').",
          "links": [
            {
              "href": "wiki:Sense and reference"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sense and reference"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "mode-of-presentation",
      "term": "mode of presentation",
      "clusters": [
        0,
        3
      ],
      "fact": "The mode of presentation is the specific way in which a linguistic sign expresses its objective sense.",
      "info": {
        "text": "The specific way a linguistic sign presents its referent — why 'the Morning Star' and 'the Evening Star' express different senses even though both designate Venus.",
        "links": [
          {
            "href": "wiki:Sense and reference"
          }
        ]
      },
      "termRole": "reference"
    },
    {
      "id": "identity-statement",
      "term": "informative identity",
      "clusters": [
        0,
        1
      ],
      "fact": "Two signs with different senses can share the same reference, which is what makes an identity statement informative rather than trivial.",
      "info": "The logical form 'a = b', where two expressions with different senses designate the same object — as in 'The Morning Star is the Evening Star'.",
      "termRole": "connector"
    },
    {
      "id": "telescope-analogy",
      "term": "telescope analogy",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Frege compares reference to the actual moon, sense to the telescope's optical image, and representation to the observer's retinal image.",
      "info": "Frege's own illustration of the three-way distinction: the moon (reference), its optical image in the telescope (sense), and the observer's retinal image (private representation).",
      "termRole": "connector"
    },
    {
      "id": "thought",
      "term": "thought",
      "clusters": [
        0,
        2
      ],
      "fact": "The thought is the objective, shareable sense of a declarative sentence — fully public, unlike the private representations each reader brings to it.",
      "info": {
        "text": "Frege's term for the objective, public content expressed by a sentence — the same thought can be grasped by any number of people, making it shareable in a way private representations never are.",
        "links": [
          {
            "href": "wiki:Thought (essay)"
          }
        ]
      },
      "termRole": "reference"
    },
    {
      "id": "indirect-context",
      "term": "indirect context",
      "clusters": [
        0,
        1
      ],
      "fact": "In indirect contexts (like belief reports), words refer not to their customary reference, but to their customary sense, preventing simple substitution.",
      "info": {
        "text": "A linguistic context in which substituting co-referential expressions does not preserve truth — 'believes that Hesperus rises in the morning' cannot be freely replaced by 'believes that Phosphorus rises in the morning'.",
        "links": [
          {
            "href": "wiki:Opaque context"
          }
        ]
      },
      "termRole": "reference"
    }
  ],
  "lenses": [
    {
      "id": "objective-vs-subjective",
      "prompt": "Which concepts in Frege's semantics are objective and publicly shareable?",
      "explanation": "Sinn (Sense), intension, Bedeutung (Reference), extension, and truth-value are objective and public — anyone can grasp the same thought or evaluate the same references. Vorstellungen (Subjective Representations), mental images, and subjective associations are private and vary from person to person.",
      "targets": [
        "Sinn",
        "intension",
        "Bedeutung",
        "extension",
        "truth-value"
      ]
    },
    {
      "id": "private-psychology",
      "prompt": "Which concepts are confined to an individual's private mental life?",
      "explanation": "Vorstellung, mental image, and subjective association are all confined to an individual's private mental life — inaccessible to others and irrelevant to logical analysis. Thought, despite sounding like an inner mental event, is Frege's term for the objective, shareable content expressed by a sentence: the same thought can be grasped by any number of people, making it the opposite of a private representation.",
      "targets": [
        "Vorstellung",
        "mental image",
        "subjective association"
      ],
      "reasons": {
        "Vorstellung": "Frege's term for the private, subjective idea or image that varies from person to person and cannot be directly shared.",
        "mental image": "A private internal visualization unique to one observer — inaccessible to anyone else.",
        "subjective association": "The personal psychological connections a speaker brings to a word, which differ for every individual and carry no logical weight."
      }
    },
    {
      "id": "truth-value-references",
      "prompt": "Which terms designate the reference of an entire declarative sentence in Frege's logic?",
      "explanation": "For Frege, the reference of an entire declarative sentence is its truth-value, which must be either 'The True' or 'The False'.",
      "targets": [
        "truth-value",
        "The True",
        "The False"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Frege's Architecture of Meaning",
    "summary": "An introduction to Gottlob Frege's 1892 semantic breakthrough distinguishing between the signs we use, the thoughts they express, and the objects they represent.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "In 1892, logician and philosopher Gottlob Frege published *\"Über Sinn und Bedeutung\"* (\"On Sense and Reference\"), a foundational essay that launched modern philosophy of language and formal linguistics. Frege set out to solve a simple but profound puzzle about identity: Why is the statement \"The Morning Star is the Morning Star\" trivial, while \"The Morning Star is the Evening Star\" represents a valuable astronomical discovery, given that both \"stars\" refer to the exact same planet (Venus)?\n\nIf the meaning of a word were simply the object it designates (its **Reference** or *Bedeutung*), then both statements would express the exact same trivial fact (Venus = Venus). Frege's solution was to introduce a third, intermediate layer: the **Sense** or *Sinn*. While both proper names point to the same Reference, they do so through different \"modes of presentation\" — one designates Venus as it appears in the morning sky, and the other as it appears in the evening.\n\nCrucially, Frege distinguished both Sense and Reference from **Subjective Representation** (*Vorstellung*). While a representation is a private, psychological mental image unique to an individual's mind, a Sense is fully objective and shareable by any speaker of a language. Through this three-part division, Frege separated public, objective meaning from subjective psychology, laying the groundwork for how sentences express **Thoughts** and how their truth-values are evaluated logically."
    }
  },
  "provenance": {
    "collaboration": "aiPrimary",
    "contributors": [
      {
        "name": "Gemini (3.5 Flash)",
        "model": "Gemini 3.5 Flash"
      },
      {
        "name": "Claude (Sonnet 4.6)",
        "model": "Claude Sonnet 4.6",
        "reasoning": "high"
      },
      {
        "name": "John Majerus"
      }
    ]
  }
});
