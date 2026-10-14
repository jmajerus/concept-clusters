// Generated from content/puzzles/hypothalamic-pituitary-axes.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "hypothalamic-pituitary-axes",
  "title": "Hypothalamic–pituitary axes",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "endocrine-reproductive"
  },
  "info": {
    "text": "The hypothalamus commands the anterior pituitary through portal blood, and three hormone chains follow: thyroid, adrenal cortex, and growth, each held near its set level by negative feedback.",
    "links": [
      {
        "href": "wiki:Neuroendocrinology"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed.",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "pages": "ch. 75–78"
      },
      {
        "title": "Anatomy and Physiology 2e, §17.3 The Pituitary Gland and Hypothalamus",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-3-the-pituitary-gland-and-hypothalamus"
      }
    ]
  },
  "clusters": [
    {
      "id": "hypothalamic-pituitary-control",
      "name": "Hypothalamic–pituitary control",
      "color": "teal",
      "fact": "The hypothalamus sends releasing and inhibiting hormones down the hypophyseal portal system to the anterior pituitary, whose tropic hormones drive peripheral glands; their end hormones return as negative feedback on both levels.",
      "terms": [
        "hypothalamus",
        "anterior pituitary",
        "hypophyseal portal system",
        "posterior pituitary",
        "tropic hormones",
        "negative feedback"
      ],
      "seeds": [
        "hypothalamus",
        "anterior pituitary"
      ],
      "termInfo": {
        "anterior pituitary": {
          "text": "The glandular lobe that secretes TSH, ACTH, GH, FSH, LH, and prolactin on hypothalamic orders.",
          "links": [
            {
              "href": "wiki:Anterior pituitary"
            }
          ]
        },
        "hypophyseal portal system": {
          "text": "Two capillary beds in series that carry hypothalamic hormones straight to the anterior pituitary at high concentration.",
          "links": [
            {
              "href": "wiki:Hypophyseal portal system"
            }
          ]
        },
        "hypothalamus": {
          "text": "The brain region whose neurosecretory cells issue the releasing and inhibiting hormones that command the anterior pituitary.",
          "links": [
            {
              "href": "wiki:Hypothalamus"
            }
          ]
        },
        "negative feedback": {
          "text": "End hormones inhibit hypothalamic and pituitary release, holding each axis near its set level.",
          "links": [
            {
              "href": "wiki:Negative feedback"
            }
          ]
        },
        "posterior pituitary": {
          "text": "The neural lobe: hypothalamic nerve endings release ADH and oxytocin here directly, with no portal step.",
          "links": [
            {
              "href": "wiki:Posterior pituitary"
            }
          ]
        },
        "tropic hormones": {
          "text": "Pituitary hormones whose target is another endocrine gland, such as TSH, ACTH, FSH, and LH.",
          "links": [
            {
              "href": "wiki:Tropic hormone"
            }
          ]
        }
      },
      "info": {
        "text": "The command structure every anterior-pituitary axis shares.",
        "links": [
          {
            "href": "wiki:Pituitary gland"
          }
        ]
      }
    },
    {
      "id": "thyroid-axis",
      "name": "Thyroid axis",
      "color": "blue",
      "fact": "TRH drives pituitary TSH, which makes the thyroid trap iodide and release mostly thyroxine; tissues convert it to the more active triiodothyronine, which raises the basal metabolic rate.",
      "terms": [
        "thyroid-stimulating hormone",
        "thyroxine",
        "thyrotropin-releasing hormone",
        "triiodothyronine",
        "iodide trapping",
        "basal metabolic rate"
      ],
      "seeds": [
        "thyroid-stimulating hormone",
        "thyroxine"
      ],
      "termInfo": {
        "basal metabolic rate": {
          "text": "Resting energy use; thyroid hormone raises it by increasing metabolism in nearly every tissue.",
          "links": [
            {
              "href": "wiki:Basal metabolic rate"
            }
          ]
        },
        "iodide trapping": {
          "text": "Active uptake of iodide into thyroid cells by the sodium–iodide symporter, the first step of hormone synthesis.",
          "links": [
            {
              "href": "wiki:Sodium/iodide cotransporter"
            }
          ]
        },
        "thyroid-stimulating hormone": {
          "text": "The pituitary tropic hormone (thyrotropin) that drives every step of thyroid hormone synthesis and release.",
          "links": [
            {
              "href": "wiki:Thyroid-stimulating hormone"
            }
          ]
        },
        "thyrotropin-releasing hormone": {
          "text": "The hypothalamic hormone that stimulates TSH release from the anterior pituitary.",
          "links": [
            {
              "href": "wiki:Thyrotropin-releasing hormone"
            }
          ]
        },
        "thyroxine": {
          "text": "T4, the thyroid's main secretory product: a long-lived prohormone carried mostly on plasma proteins and stored on thyroglobulin.",
          "links": [
            {
              "href": "wiki:Thyroxine"
            }
          ]
        },
        "triiodothyronine": {
          "text": "T3, the more potent form, made mostly by removing one iodine from T4 in peripheral tissues.",
          "links": [
            {
              "href": "wiki:Triiodothyronine"
            }
          ]
        }
      },
      "info": {
        "text": "The chain that sets the body's metabolic pace.",
        "links": [
          {
            "href": "wiki:Hypothalamic–pituitary–thyroid axis"
          }
        ]
      }
    },
    {
      "id": "adrenocortical-axis",
      "name": "Adrenocortical axis",
      "color": "amber",
      "fact": "CRH drives pituitary ACTH, which makes the adrenal cortex secrete cortisol in a daily rhythm that peaks in the early morning; cortisol drives gluconeogenesis and restrains inflammation.",
      "terms": [
        "adrenocorticotropic hormone",
        "cortisol",
        "corticotropin-releasing hormone",
        "adrenal cortex",
        "gluconeogenesis",
        "anti-inflammatory effect"
      ],
      "seeds": [
        "adrenocorticotropic hormone",
        "cortisol"
      ],
      "termInfo": {
        "adrenal cortex": {
          "text": "The outer adrenal layer. ACTH drives its cortisol-secreting zone; aldosterone, from the outermost zone, answers mainly to angiotensin II and potassium.",
          "links": [
            {
              "href": "wiki:Adrenal cortex"
            }
          ]
        },
        "adrenocorticotropic hormone": {
          "text": "The pituitary tropic hormone (corticotropin) that drives cortisol secretion by the adrenal cortex.",
          "links": [
            {
              "href": "wiki:Adrenocorticotropic hormone"
            }
          ]
        },
        "anti-inflammatory effect": {
          "text": "Cortisol's suppression of inflammatory mediators and immune responses, the basis of glucocorticoid drugs.",
          "links": [
            {
              "href": "wiki:Glucocorticoid"
            }
          ]
        },
        "corticotropin-releasing hormone": {
          "text": "The hypothalamic hormone that stimulates ACTH release; stress and the daily rhythm both raise it.",
          "links": [
            {
              "href": "wiki:Corticotropin-releasing hormone"
            }
          ]
        },
        "cortisol": {
          "text": "The main glucocorticoid: mobilizes fuel, raises blood glucose, and restrains inflammation.",
          "links": [
            {
              "href": "wiki:Cortisol"
            }
          ]
        },
        "gluconeogenesis": {
          "text": "New glucose made by the liver from amino acids and glycerol; stimulating it is cortisol's hallmark metabolic action.",
          "links": [
            {
              "href": "wiki:Gluconeogenesis"
            }
          ]
        }
      },
      "info": {
        "text": "The chain that mobilizes fuel and restrains inflammation.",
        "links": [
          {
            "href": "wiki:Hypothalamic–pituitary–adrenal axis"
          }
        ]
      }
    },
    {
      "id": "growth-axis",
      "name": "Growth axis",
      "color": "magenta",
      "fact": "GHRH sets pulses of growth hormone, largest early in deep sleep; GH makes the liver release IGF-1, which drives cartilage growth at the epiphyseal plates.",
      "terms": [
        "growth hormone",
        "insulin-like growth factor 1",
        "growth hormone–releasing hormone",
        "epiphyseal growth plates"
      ],
      "seeds": [
        "growth hormone",
        "insulin-like growth factor 1"
      ],
      "termInfo": {
        "epiphyseal growth plates": {
          "text": "Cartilage plates near the ends of long bones, where chondrocyte growth lengthens bone until the plates close after puberty.",
          "links": [
            {
              "href": "wiki:Epiphyseal plate"
            }
          ]
        },
        "growth hormone": {
          "text": "The anterior pituitary hormone (somatotropin) that promotes growth and shifts fuel use from glucose toward fat.",
          "links": [
            {
              "href": "wiki:Growth hormone"
            }
          ]
        },
        "growth hormone–releasing hormone": {
          "text": "The hypothalamic hormone that stimulates growth hormone release.",
          "links": [
            {
              "href": "wiki:Growth hormone–releasing hormone"
            }
          ]
        },
        "insulin-like growth factor 1": {
          "text": "IGF-1 (somatomedin C): made mainly by the liver under GH, it carries most of GH's growth-promoting effect.",
          "links": [
            {
              "href": "wiki:Insulin-like growth factor 1"
            }
          ]
        }
      },
      "info": {
        "text": "The chain that lengthens bone and builds tissue.",
        "links": [
          {
            "href": "wiki:Growth hormone"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "somatostatin",
      "term": "somatostatin",
      "clusters": [
        1,
        3
      ],
      "fact": "Somatostatin links the thyroid and growth axes because the same hypothalamic inhibiting hormone holds back pituitary release of both TSH and growth hormone.",
      "info": {
        "text": "The hypothalamic inhibiting hormone that restrains GH and TSH release.",
        "links": [
          {
            "href": "wiki:Somatostatin"
          }
        ]
      },
      "idealTerms": [
        "thyroid-stimulating hormone",
        "growth hormone"
      ]
    },
    {
      "id": "insulin-resistance",
      "term": "insulin resistance",
      "clusters": [
        2,
        3
      ],
      "fact": "Insulin resistance links the adrenocortical and growth axes because cortisol and growth hormone both reduce tissue glucose uptake, so an excess of either raises blood glucose.",
      "info": {
        "text": "Reduced tissue response to insulin, induced by both cortisol and growth hormone.",
        "links": [
          {
            "href": "wiki:Insulin resistance"
          }
        ]
      },
      "idealTerms": [
        "cortisol",
        "growth hormone"
      ]
    }
  ],
  "lenses": [
    {
      "id": "portal-signals",
      "prompt": "Which hormones does the hypothalamus send to the pituitary through portal blood?",
      "explanation": "Each axis begins with a hypothalamic signal carried in portal blood; somatostatin is the inhibiting one among them.",
      "targets": [
        "thyrotropin-releasing hormone",
        "corticotropin-releasing hormone",
        "growth hormone–releasing hormone",
        "somatostatin"
      ],
      "reasons": {
        "corticotropin-releasing hormone": "It travels the portal vessels to stimulate ACTH release.",
        "growth hormone–releasing hormone": "It travels the portal vessels to stimulate GH release.",
        "somatostatin": "It travels the same route to inhibit GH and TSH release.",
        "thyrotropin-releasing hormone": "It travels the portal vessels to stimulate TSH release."
      }
    },
    {
      "id": "end-hormone-actions",
      "prompt": "Which concepts name an end hormone's action on body tissues?",
      "explanation": "These are what the axes exist to produce: the effects thyroid hormone, cortisol, and growth hormone have once they reach their targets, as distinct from the chain of signals that releases them.",
      "targets": [
        "basal metabolic rate",
        "gluconeogenesis",
        "anti-inflammatory effect",
        "insulin resistance"
      ],
      "reasons": {
        "anti-inflammatory effect": "Cortisol suppresses inflammatory mediators and immune responses.",
        "basal metabolic rate": "Thyroid hormone raises resting energy use in nearly every tissue.",
        "gluconeogenesis": "Cortisol drives the liver to make new glucose.",
        "insulin resistance": "Cortisol and growth hormone both blunt tissue glucose uptake."
      }
    },
    {
      "id": "gh-to-bone",
      "prompt": "Which concepts carry growth hormone's effect to lengthening bone?",
      "explanation": "Growth hormone acts on bone mostly indirectly: it makes the liver release IGF-1, and IGF-1 drives cartilage growth at the plates until they close.",
      "targets": [
        "insulin-like growth factor 1",
        "epiphyseal growth plates"
      ],
      "reasons": {
        "epiphyseal growth plates": "The cartilage where IGF-1-driven growth actually lengthens bone.",
        "insulin-like growth factor 1": "The liver releases it under GH, and it carries most of GH's growth-promoting effect."
      }
    },
    {
      "id": "thyroid-failure",
      "prompt": "Which concepts rise when the thyroid gland fails?",
      "explanation": "With little thyroid hormone left to apply negative feedback, the upstream signals climb; a high TSH is the standard sign of primary hypothyroidism.",
      "targets": [
        "thyroid-stimulating hormone",
        "thyrotropin-releasing hormone"
      ],
      "reasons": {
        "thyroid-stimulating hormone": "The pituitary loses its feedback brake and raises TSH output.",
        "thyrotropin-releasing hormone": "The hypothalamus also loses its feedback brake and raises TRH output."
      }
    },
    {
      "id": "steroid-suppression",
      "prompt": "Which concepts explain adrenal suppression during long-term steroid therapy?",
      "explanation": "A synthetic glucocorticoid feeds back like cortisol, silencing CRH and ACTH; without ACTH the adrenal cortex atrophies and cannot respond if the drug is stopped abruptly.",
      "targets": [
        "negative feedback",
        "corticotropin-releasing hormone",
        "adrenocorticotropic hormone",
        "adrenal cortex"
      ],
      "reasons": {
        "adrenal cortex": "Deprived of ACTH, it shrinks and loses its capacity to secrete cortisol.",
        "adrenocorticotropic hormone": "Its release falls, removing the cortex's trophic drive.",
        "corticotropin-releasing hormone": "Its release falls under the drug's feedback.",
        "negative feedback": "The drug acts on the hypothalamus and pituitary as cortisol would."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "reproductive-hormones",
        "reason": "Follow the fourth anterior-pituitary chain: GnRH, FSH, and LH driving the gonads."
      },
      {
        "id": "setting-and-defending-core-temperature",
        "reason": "See thyroid hormone at work as one of the effectors that raise heat production."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One command structure, three hormone chains",
    "summary": "How the hypothalamus and anterior pituitary run the thyroid, adrenocortical, and growth axes under feedback.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "The hypothalamus controls much of the endocrine system through the pituitary gland, which hangs just beneath it. The two halves of the pituitary are reached differently. The posterior pituitary is neural tissue: hypothalamic nerve endings release ADH and oxytocin there directly. The anterior pituitary is a gland, reached through the hypophyseal portal system, a short vascular link that carries hypothalamic releasing and inhibiting hormones to it at high concentration. In response, the anterior pituitary secretes tropic hormones, whose targets are other endocrine glands.\r\n\r\nThree such axes follow the same pattern. In the thyroid axis, thyrotropin-releasing hormone (TRH) prompts the pituitary to release thyroid-stimulating hormone (TSH). TSH drives iodide trapping and the release of thyroxine (T4), which tissues convert to the more potent triiodothyronine (T3); together they raise the basal metabolic rate. In the adrenocortical axis, corticotropin-releasing hormone (CRH) prompts adrenocorticotropic hormone (ACTH), which makes the adrenal cortex secrete cortisol. Cortisol stimulates gluconeogenesis and has a strong anti-inflammatory effect. In the growth axis, growth hormone–releasing hormone (GHRH) prompts growth hormone, which acts largely through insulin-like growth factor 1 (IGF-1) from the liver to lengthen bone at the epiphyseal growth plates.\r\n\r\nEach axis is held near its set level by negative feedback: the end hormone inhibits release at both the hypothalamus and the pituitary. The axes also share parts. Somatostatin, a hypothalamic inhibiting hormone, restrains both growth hormone and TSH. Cortisol and growth hormone both cause insulin resistance, so an excess of either raises blood glucose."
    },
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-3-the-pituitary-gland-and-hypothalamus",
        "label": "OpenStax: the pituitary gland and hypothalamus"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5.5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "hypothalamic-pituitary-axes",
      "puzzleRevision": "fnv1a32:a4e6305c",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:hypothalamus": {
          "x": 390.13,
          "y": 42.96
        },
        "term:anterior pituitary": {
          "x": 514.56,
          "y": 282.38
        },
        "term:hypophyseal portal system": {
          "x": 729.38,
          "y": 54.17
        },
        "term:posterior pituitary": {
          "x": 350.49,
          "y": 255.41
        },
        "term:tropic hormones": {
          "x": 548.58,
          "y": 46.93
        },
        "term:negative feedback": {
          "x": 313.53,
          "y": 118.35
        },
        "term:thyroid-stimulating hormone": {
          "x": 824.66,
          "y": 298.82
        },
        "term:thyroxine": {
          "x": 959.34,
          "y": 122.25
        },
        "term:thyrotropin-releasing hormone": {
          "x": 980.56,
          "y": 572.11
        },
        "term:triiodothyronine": {
          "x": 838.84,
          "y": 174.93
        },
        "term:iodide trapping": {
          "x": 885.23,
          "y": 484.95
        },
        "term:basal metabolic rate": {
          "x": 817.52,
          "y": 385.02
        },
        "term:adrenocorticotropic hormone": {
          "x": 470.59,
          "y": 668.99
        },
        "term:cortisol": {
          "x": 693.89,
          "y": 571.11
        },
        "term:corticotropin-releasing hormone": {
          "x": 207.19,
          "y": 666.99
        },
        "term:adrenal cortex": {
          "x": 512.15,
          "y": 463.6
        },
        "term:gluconeogenesis": {
          "x": 343.12,
          "y": 463.96
        },
        "term:anti-inflammatory effect": {
          "x": 697.31,
          "y": 665.99
        },
        "term:growth hormone": {
          "x": 607.79,
          "y": 366.53
        },
        "term:insulin-like growth factor 1": {
          "x": 170.28,
          "y": 201.32
        },
        "term:growth hormone–releasing hormone": {
          "x": 150.82,
          "y": 515.31
        },
        "term:epiphyseal growth plates": {
          "x": 104.72,
          "y": 329.57
        },
        "term:somatostatin": {
          "x": 666.91,
          "y": 225.62
        },
        "term:insulin resistance": {
          "x": 693.91,
          "y": 464.11
        },
        "cluster:0": {
          "x": 490.85,
          "y": 180.42
        },
        "cluster:1": {
          "x": 1022.2,
          "y": 316.06
        },
        "cluster:2": {
          "x": 468.47,
          "y": 534.61
        },
        "cluster:3": {
          "x": 256.11,
          "y": 387.64
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T03:48:05.249Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "hypothalamic-pituitary-axes",
      "puzzleRevision": "fnv1a32:a4e6305c",
      "board": {
        "width": 1100,
        "height": 710
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 550.99,
          "y": 546.37,
          "pinned": true
        },
        "cluster:1": {
          "x": 215.13,
          "y": 363,
          "pinned": false
        },
        "cluster:2": {
          "x": 884.87,
          "y": 363,
          "pinned": false
        },
        "cluster:3": {
          "x": 569.86,
          "y": 197.5,
          "pinned": true
        }
      },
      "bridges": {
        "term:somatostatin": {
          "x": 342.77,
          "y": 184.17,
          "pinned": false
        },
        "term:insulin resistance": {
          "x": 797.28,
          "y": 151.63,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "hypothalamus",
          "anterior pituitary",
          "hypophyseal portal system",
          "posterior pituitary",
          "tropic hormones",
          "negative feedback"
        ],
        "cluster:1": [
          "thyroid-stimulating hormone",
          "thyroxine",
          "thyrotropin-releasing hormone",
          "triiodothyronine",
          "iodide trapping",
          "basal metabolic rate"
        ],
        "cluster:2": [
          "adrenocorticotropic hormone",
          "cortisol",
          "corticotropin-releasing hormone",
          "adrenal cortex",
          "gluconeogenesis",
          "anti-inflammatory effect"
        ],
        "cluster:3": [
          "growth hormone",
          "insulin-like growth factor 1",
          "growth hormone–releasing hormone",
          "epiphyseal growth plates"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "tropic hormones",
          "anterior pituitary",
          "hypophyseal portal system",
          "posterior pituitary",
          "negative feedback",
          "hypothalamus"
        ],
        "cluster:1": [
          "iodide trapping",
          "thyroid-stimulating hormone",
          "thyrotropin-releasing hormone",
          "basal metabolic rate",
          "triiodothyronine",
          "thyroxine"
        ],
        "cluster:2": [
          "cortisol",
          "anti-inflammatory effect",
          "corticotropin-releasing hormone",
          "adrenocorticotropic hormone",
          "gluconeogenesis",
          "adrenal cortex"
        ],
        "cluster:3": [
          "growth hormone",
          "growth hormone–releasing hormone",
          "insulin-like growth factor 1",
          "epiphyseal growth plates"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 599.2912708236454
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T03:51:23.694Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "hypothalamic-pituitary-axes",
      "puzzleRevision": "fnv1a32:a4e6305c",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:hypothalamus": {
          "x": 885.3,
          "y": 190,
          "pinned": false
        },
        "term:anterior pituitary": {
          "x": 765.6,
          "y": 112.7,
          "pinned": false
        },
        "term:hypophyseal portal system": {
          "x": 930.17,
          "y": 31.69,
          "pinned": false
        },
        "term:posterior pituitary": {
          "x": 956.51,
          "y": 331.64,
          "pinned": false
        },
        "term:tropic hormones": {
          "x": 776.68,
          "y": 261.67,
          "pinned": true
        },
        "term:negative feedback": {
          "x": 1024.45,
          "y": 185.3,
          "pinned": false
        },
        "term:thyroid-stimulating hormone": {
          "x": 406.28,
          "y": 247.12,
          "pinned": false
        },
        "term:thyroxine": {
          "x": 565.82,
          "y": 271.54,
          "pinned": false
        },
        "term:thyrotropin-releasing hormone": {
          "x": 429.62,
          "y": 60.73,
          "pinned": true
        },
        "term:triiodothyronine": {
          "x": 562.11,
          "y": 144.87,
          "pinned": false
        },
        "term:iodide trapping": {
          "x": 244.54,
          "y": 94.91,
          "pinned": false
        },
        "term:basal metabolic rate": {
          "x": 181.46,
          "y": 216.63,
          "pinned": true
        },
        "term:adrenocorticotropic hormone": {
          "x": 671.51,
          "y": 456.03,
          "pinned": true
        },
        "term:cortisol": {
          "x": 516.78,
          "y": 360.38,
          "pinned": false
        },
        "term:corticotropin-releasing hormone": {
          "x": 684.61,
          "y": 626.76,
          "pinned": true
        },
        "term:adrenal cortex": {
          "x": 692.42,
          "y": 348.93,
          "pinned": true
        },
        "term:gluconeogenesis": {
          "x": 536.62,
          "y": 536.36,
          "pinned": false
        },
        "term:anti-inflammatory effect": {
          "x": 886.4,
          "y": 554.53,
          "pinned": true
        },
        "term:growth hormone": {
          "x": 242.88,
          "y": 525.12,
          "pinned": true
        },
        "term:insulin-like growth factor 1": {
          "x": 117.81,
          "y": 425.85,
          "pinned": false
        },
        "term:growth hormone–releasing hormone": {
          "x": 165.47,
          "y": 658.02,
          "pinned": false
        },
        "term:epiphyseal growth plates": {
          "x": 379.76,
          "y": 603.82,
          "pinned": true
        },
        "term:somatostatin": {
          "x": 291.74,
          "y": 373.88,
          "pinned": false
        },
        "term:insulin resistance": {
          "x": 416.65,
          "y": 443.11,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4343.84,
        "score": 4343.84230732815
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T03:51:26.450Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-14T03:47:42.960Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
