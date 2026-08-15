// Generated from content/puzzles/models-of-the-divided-mind.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "models-of-the-divided-mind",
  "title": "Models of the Divided Mind",
  "category": "Psychology",
  "categories": ["Psychology", "Philosophy"],
  "large": true,
  "tags": [
    "catalogue:wholeness-and-its-discontents"
  ],
  "info": {
    "link": "wiki:Psychoanalysis",
    "text": "Four traditions look at the same fact -- that a person is not unified inside themselves -- and draw four incompatible conclusions about what to do with it: manage it, integrate it, embrace it, or sell a cure for it."
  },
  "relatedPuzzles": {
    "info": {
      "text": "Wholeness and Its Discontents: how the promise of a unified self keeps breaking down, from early psychoanalysis to consumer culture, and what becomes possible when division is treated as a condition rather than a defect."
    },
    "entries": [
      {
        "id": "lacans-three-registers",
        "via": [
          "lacan"
        ],
        "reason": "For the Lacanian scaffolding underneath McGowan's critique here -- the Imaginary, the Symbolic, and the Real -- play the dedicated Lacan puzzle."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "Three different traditions, one shared observation: the unconscious does not simply obey conscious intention. It repeats a pattern nobody chose, attributes a hidden trait to someone else, flips a rigid attitude into its opposite, or wrecks an opportunity the ego consciously wanted -- across Freud, Jung, and McGowan alike, the self is not fully in charge of itself.",
      "id": "unconscious-sabotage",
      "prompt": "Which concepts are involuntary unconscious forces that undermine the ego's conscious control or self-image -- not chosen, and not fully seen by the person having them?",
      "reasons": {
        "enantiodromia": "Jung's involuntary reversal of an overextended attitude into its own opposite.",
        "radical self-sabotage": "McGowan's reading of self-sabotage as unconscious refusal, not simple malfunction.",
        "repetition compulsion": "Freud's name for an involuntary drive to repeat a disruptive pattern, against conscious wish.",
        "shadow projection": "Jung's unconscious attribution of one's own rejected traits onto someone else."
      },
      "targets": [
        "repetition compulsion",
        "shadow projection",
        "enantiodromia",
        "radical self-sabotage"
      ]
    },
    {
      "explanation": "A defense mechanism, a social mask, and a market promise are three scales of the same move: manage the appearance of unity rather than resolve the underlying split. Only capitalist ideology, in this comparison, tries to sell the cover story as a product.",
      "id": "mechanisms-of-cohesion-and-masking",
      "prompt": "Which concepts are strategies or structures -- individual, social, or commercial -- built to cover over internal division and present an appearance of wholeness?",
      "reasons": {
        "authenticity trap": "Even 'being yourself' gets packaged as a performance to maintain, under this pressure.",
        "compulsory harmony": "The cultural enforcement of that myth -- dissatisfaction reframed as personal failure.",
        "ego defense mechanism": "Freud's clinical version: an individual strategy for reducing anxiety by managing appearance to oneself.",
        "myth of total wholeness": "Capitalist ideology's foundational promise: that complete psychological unity is achievable at all.",
        "persona mask": "Jung's social version: a curated front presented to the world."
      },
      "targets": [
        "ego defense mechanism",
        "persona mask",
        "myth of total wholeness",
        "compulsory harmony",
        "authenticity trap"
      ]
    },
    {
      "explanation": "Four traditions, four incompatible finish lines: Freud's best case is manageable ordinary misery, Jung's is integration through confronting the shadow, McGowan's is embracing the split as freedom rather than curing it, and capitalist ideology's is a purchased identity that promises what none of the other three think is actually available.",
      "id": "horizons-of-subjectivity",
      "prompt": "Which concepts name each tradition's own answer to the question: what should a person do about their internal division?",
      "reasons": {
        "common unhappiness": "Freud's famously modest goal: not cure, but the transformation of neurotic misery into ordinary, bearable unhappiness.",
        "consumer identity": "Capitalist ideology's substitute goal: an identity assembled and maintained through purchase and performance.",
        "embracing incompleteness": "McGowan's goal: treating the split itself as the site of freedom, not a problem awaiting resolution.",
        "individuation process": "Jung's goal: integrating the shadow to become a more complete, if never simple, self."
      },
      "targets": [
        "common unhappiness",
        "individuation process",
        "embracing incompleteness",
        "consumer identity"
      ]
    }
  ],
  "learningIntroduction": {
    "content": {
      "mediaType": "text/markdown",
      "text": "# Four answers to the same fact\n\nEvery framework in this puzzle agrees on one starting observation: a person is not simply unified inside themselves. Where they disagree, sharply, is what follows from that.\n\n## The same crack, read four ways\n\nClassical psychoanalysis reads the crack as a functional problem. The mind is a negotiation between competing internal demands, and therapy's job is not to end the negotiation but to make its outcome livable -- to trade debilitating conflict for something closer to ordinary difficulty.\n\nA second tradition reads the same crack as an opportunity rather than a wound. What has been pushed out of a person's self-image does not have to stay pushed out; confronting it, deliberately, is treated as the actual engine of psychological growth rather than a threat to be managed.\n\nA third tradition goes further still, arguing that the crack is not a personal problem at all -- it is the basic condition of being a subject who uses language and lives among others. On this view, treating the split as curable is itself a mistake, and what looks like self-defeating behavior can be read as a kind of refusal: an unconscious resistance to demands for total, seamless conformity.\n\n## When the crack becomes a product\n\nA fourth force in this comparison is not a school of psychology but an economic system, and it takes a very different approach from all three: it does not try to manage the crack, integrate it, or reinterpret it politically. It sells a promise to close it -- through the right purchase, the right lifestyle, the right curated presentation of who you are.\n\n## A question to hold onto\n\nThree of these four traditions, for all their disagreement, share a quiet assumption: that total, permanent psychological unity is not actually on the table. As you compare all four across one board, notice which one treats that assumption as false -- and what it is selling instead.\n\n> **Reflection:** If \"common unhappiness,\" \"integration,\" and \"embracing incompleteness\" are three different answers to the same problem, what would it mean for a fourth party to claim it has actually solved that problem?\n"
    },
    "estimatedMinutes": 5,
    "requirement": "recommended",
    "revision": 1,
    "summary": "See how Freud, Jung, McGowan, and capitalist ideology each treat the same starting observation -- that the self is not unified -- before comparing all four on one board.",
    "title": "Four Answers to the Same Fact"
  },
  "clusters": [
    {
      "id": "freudian-structural-metapsychology",
      "name": "Freudian Structural Metapsychology",
      "color": "teal",
      "fact": "Freud maps the psyche as a functional battleground between id, ego, and superego, where clinical success means transforming debilitating neurosis into ordinary, manageable everyday unhappiness -- not curing the division, just making it livable.",
      "terms": [
        "id-ego-superego friction",
        "repetition compulsion",
        "ego defense mechanism",
        "common unhappiness",
        "repressed guilt"
      ],
      "seeds": [
        "id-ego-superego friction",
        "repetition compulsion"
      ],
      "termInfo": {
        "common unhappiness": {
          "text": "Freud's own modest description of the best achievable outcome of therapy: ordinary misery in place of neurotic suffering."
        },
        "ego defense mechanism": {
          "text": "A strategy the ego uses to reduce anxiety generated by the friction between id, superego, and reality."
        },
        "id-ego-superego friction": {
          "link": "wiki:Id, ego and super-ego",
          "text": "Freud's structural model of the mind as three agencies in permanent, unresolved negotiation."
        },
        "repetition compulsion": {
          "link": "wiki:Repetition compulsion",
          "text": "An involuntary drive to repeat a disruptive or traumatic pattern, resistant to conscious intention."
        },
        "repressed guilt": {
          "text": "Superego-generated guilt kept out of conscious awareness, one of the frictions the ego has to manage."
        }
      },
      "info": {
        "link": "wiki:Sigmund Freud"
      }
    },
    {
      "id": "jungian-analytical-psychology",
      "name": "Jungian Analytical Psychology",
      "color": "blue",
      "fact": "Jung reframes internal division as a teleological process rather than a pathology: self-realization requires integrating the shadow the persona has rejected, not exiling or repressing it.",
      "terms": [
        "shadow projection",
        "individuation process",
        "persona mask",
        "enantiodromia",
        "archetypal unconscious"
      ],
      "seeds": [
        "shadow projection",
        "individuation process"
      ],
      "termInfo": {
        "archetypal unconscious": {
          "link": "wiki:Collective unconscious",
          "text": "The deeper, inherited layer of the psyche Jung held to underlie any one person's individual unconscious."
        },
        "enantiodromia": {
          "link": "wiki:Enantiodromia",
          "text": "An overextended conscious attitude suddenly reverses into its own opposite."
        },
        "individuation process": {
          "link": "wiki:Individuation",
          "text": "Jung's lifelong movement toward psychological wholeness through confronting, not repressing, split-off material."
        },
        "persona mask": {
          "link": "wiki:Persona (analytical psychology)",
          "text": "The curated social front the ego presents to the world."
        },
        "shadow projection": {
          "text": "Unconsciously attributing one's own rejected traits to someone else."
        }
      },
      "info": {
        "link": "wiki:Carl Jung"
      }
    },
    {
      "id": "mcgowan-s-lacanian-hegelian-critique",
      "name": "McGowan's Lacanian-Hegelian Critique",
      "color": "amber",
      "fact": "Drawing on Lacan and Hegel, McGowan reframes psychic division from a clinical problem into an ontological one: division is the very foundation of subjectivity, and what looks like self-sabotage is often unconscious resistance to demands for seamless conformity.",
      "terms": [
        "ontological split",
        "structural alienation",
        "radical self-sabotage",
        "ideological refusal",
        "embracing incompleteness"
      ],
      "seeds": [
        "ontological split",
        "structural alienation"
      ],
      "termInfo": {
        "embracing incompleteness": {
          "text": "McGowan's proposed goal, replacing the pursuit of inner peace: accept the split as the site of freedom rather than something to resolve."
        },
        "ideological refusal": {
          "text": "The political reading of self-sabotage: a subconscious protest against demands for total social harmony."
        },
        "ontological split": {
          "text": "McGowan's core claim: division is not a malfunction of subjectivity, it is what subjectivity is structurally built from."
        },
        "radical self-sabotage": {
          "text": "Self-defeating action reinterpreted not as clinical failure but as an unconscious refusal of imposed conformity."
        },
        "structural alienation": {
          "text": "Where traditional psychology treats alienation as a pain to be cured, McGowan treats it as an inescapable condition."
        }
      },
      "info": {
        "link": "wiki:Todd McGowan"
      }
    },
    {
      "id": "capitalist-ideology-commodity-fantasy",
      "name": "Capitalist Ideology & Commodity Fantasy",
      "color": "magenta",
      "fact": "Capitalism exploits the individual's internal division by promising that the right purchase, status, or curated lifestyle can patch the void and deliver complete psychological wholeness -- a promise none of the other three traditions think is achievable at all.",
      "terms": [
        "myth of total wholeness",
        "commodity cure",
        "compulsory harmony",
        "authenticity trap",
        "consumer identity"
      ],
      "seeds": [
        "myth of total wholeness",
        "commodity cure"
      ],
      "termInfo": {
        "authenticity trap": {
          "text": "The pressure to perform self-actualization through curated presentation -- so even 'being yourself' becomes a product."
        },
        "commodity cure": {
          "text": "The specific mechanism: persuading someone that a purchase, status marker, or lifestyle choice will patch the internal rift."
        },
        "compulsory harmony": {
          "text": "A cultural demand for constant positivity that reframes internal conflict or dissatisfaction as personal failure."
        },
        "consumer identity": {
          "text": "An identity substantially built and maintained through purchase and performance rather than interior integration."
        },
        "myth of total wholeness": {
          "text": "The foundational promise capitalist ideology sells: that complete inner unity is achievable, and buyable."
        }
      },
      "info": {
        "text": "The promise that the right purchase can close a gap that Freud, Jung, and McGowan all -- in very different ways -- think cannot simply be closed."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-divided-subject",
      "term": "the divided subject",
      "clusters": [
        0,
        2
      ],
      "fact": "Freud and McGowan share a starting move neither Jung nor consumer culture makes: both reject the Enlightenment ideal of a unified, rational mind, placing fundamental internal conflict at the very core of human subjectivity rather than at its edges.",
      "relationKind": "foundation",
      "idealTerms": [
        "id-ego-superego friction",
        "ontological split"
      ]
    },
    {
      "id": "bridge-the-subconscious-depth",
      "term": "the subconscious depth",
      "clusters": [
        0,
        1
      ],
      "fact": "Before they part ways on what to do about it, Freud and Jung ground their theories in the same basic claim: dynamic unconscious forces actively distort and direct conscious intention, whether or not the person is aware of it happening.",
      "relationKind": "foundation",
      "termRole": "connector",
      "idealTerms": [
        "repetition compulsion",
        "shadow projection"
      ],
      "info": {
        "text": "What Freud and Jung share before they part ways on what to do about it: dynamic unconscious forces actively distort and direct conscious intention."
      }
    },
    {
      "id": "bridge-the-social-mask",
      "term": "the social mask",
      "clusters": [
        1,
        3
      ],
      "fact": "Capitalist culture takes Jung's persona and puts it to work commercially, encouraging individuals to confuse a curated, performative front with their true self while banishing whatever the market finds undesirable.",
      "relationKind": "dynamic",
      "termRole": "connector",
      "idealTerms": [
        "persona mask",
        "authenticity trap"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      },
      "info": {
        "text": "Capitalist culture takes Jung's persona commercial: encouraging people to confuse a curated, performative front with their true self."
      }
    },
    {
      "id": "bridge-refusal-of-fulfillment",
      "term": "refusal of fulfillment",
      "clusters": [
        2,
        3
      ],
      "fact": "Unconscious self-sabotage, on McGowan's reading, acts as a standing protest against capitalism's central promise -- that buying into the system will eventually deliver the total satisfaction the myth of wholeness keeps dangling.",
      "relationKind": "dynamic",
      "termRole": "connector",
      "idealTerms": [
        "radical self-sabotage",
        "myth of total wholeness"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      },
      "info": {
        "text": "On McGowan's reading, unconscious self-sabotage is a standing protest against capitalism's central promise that buying in will eventually deliver total satisfaction."
      }
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "learningIntroduction",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Anthropic",
      "role": "edited",
      "scope": "puzzle",
      "system": "Claude"
    }
  ]
});
