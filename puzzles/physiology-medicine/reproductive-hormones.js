// Generated from content/puzzles/reproductive-hormones.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "reproductive-hormones",
  "title": "Reproductive hormones",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "endocrine-reproductive"
  },
  "info": {
    "text": "One pulsatile command drives two different gonadal programs plus pregnancy support: FSH and LH order the testes and ovaries, feedback closes every loop, and one loop flips positive to trigger ovulation.",
    "links": [
      {
        "href": "wiki:Reproductive system"
      }
    ],
    "citations": [
      {
        "title": "Sex Steroid Hormones: HPG Axis (Introduction to Neuroscience)",
        "publisher": "Michigan State University",
        "url": "https://openbooks.lib.msu.edu/introneuroscience1/chapter/hpg-axis/"
      },
      {
        "title": "Reproductive physiology: feedback control (PCOL 260)",
        "publisher": "West Virginia University",
        "url": "http://www2.hsc.wvu.edu/som/physio/classes/pcol260/pdf/23-reproductive.pdf"
      },
      {
        "title": "The Role of Placental Hormones in Mediating Maternal Adaptations",
        "publisher": "Frontiers in Physiology",
        "url": "https://www.frontiersin.org/articles/10.3389/fphys.2018.01091/full"
      }
    ]
  },
  "clusters": [
    {
      "id": "hpg-command",
      "name": "HPG command",
      "color": "teal",
      "fact": "Pulsatile GnRH from the hypothalamus sets pituitary output of FSH and LH, the two gonadotropins that drive both testes and ovaries.",
      "terms": [
        "follicle-stimulating hormone",
        "luteinizing hormone",
        "gonadotropin-releasing hormone",
        "anterior pituitary"
      ],
      "seeds": [
        "follicle-stimulating hormone",
        "luteinizing hormone"
      ],
      "termInfo": {
        "follicle-stimulating hormone": {
          "text": "A pituitary gonadotropin driving sperm nursing in testes and follicle growth in ovaries.",
          "links": [
            {
              "href": "wiki:Follicle-stimulating hormone"
            }
          ]
        },
        "luteinizing hormone": {
          "text": "A pituitary gonadotropin driving testosterone release and, in surge form, ovulation.",
          "links": [
            {
              "href": "wiki:Luteinizing hormone"
            }
          ]
        },
        "gonadotropin-releasing hormone": {
          "text": "The hypothalamic timing signal, released in pulses that set pituitary FSH and LH output.",
          "links": [
            {
              "href": "wiki:Gonadotropin-releasing hormone"
            }
          ]
        },
        "anterior pituitary": {
          "text": "The pituitary lobe releasing FSH and LH on hypothalamic orders.",
          "links": [
            {
              "href": "wiki:Anterior pituitary"
            }
          ]
        }
      },
      "info": {
        "text": "Pulsatile hypothalamic orders that drive both gonads.",
        "links": [
          {
            "href": "wiki:Hypothalamus"
          }
        ]
      }
    },
    {
      "id": "testicular-program",
      "name": "Testicular androgen program",
      "color": "blue",
      "fact": "Leydig cells make testosterone for male development while Sertoli cells nurse continuous sperm production under FSH.",
      "terms": [
        "testes",
        "testosterone",
        "sperm production",
        "Leydig cells",
        "Sertoli cells"
      ],
      "seeds": [
        "testes",
        "testosterone"
      ],
      "termInfo": {
        "testes": {
          "text": "The male gonads: testosterone factories that also produce sperm continuously.",
          "links": [
            {
              "href": "wiki:Testicle"
            }
          ]
        },
        "testosterone": {
          "text": "The main androgen: builds male development and sustains sperm production.",
          "links": [
            {
              "href": "wiki:Testosterone"
            }
          ]
        },
        "sperm production": {
          "text": "Continuous sperm formation nursed by Sertoli cells under FSH.",
          "links": [
            {
              "href": "wiki:Spermatogenesis"
            }
          ]
        },
        "Leydig cells": {
          "text": "Testicular cells making testosterone under LH drive.",
          "links": [
            {
              "href": "wiki:Leydig cell"
            }
          ]
        },
        "Sertoli cells": {
          "text": "Nurse cells of the seminiferous tubules supporting developing sperm.",
          "links": [
            {
              "href": "wiki:Sertoli cell"
            }
          ]
        }
      },
      "info": {
        "text": "Steady androgen output and continuous sperm production.",
        "links": [
          {
            "href": "wiki:Testicle"
          }
        ]
      }
    },
    {
      "id": "ovarian-program",
      "name": "Ovarian cycle program",
      "color": "amber",
      "fact": "Each cycle grows a follicle, releases an egg at ovulation, and converts the remnant into a progesterone-making corpus luteum; without pregnancy the lining sheds as menstruation.",
      "terms": [
        "ovaries",
        "estrogen",
        "progesterone",
        "ovarian follicle",
        "ovulation",
        "corpus luteum",
        "menstruation"
      ],
      "seeds": [
        "ovaries",
        "estrogen"
      ],
      "termInfo": {
        "ovaries": {
          "text": "The female gonads: cyclic estrogen and progesterone source and egg reserve.",
          "links": [
            {
              "href": "wiki:Ovary"
            }
          ]
        },
        "estrogen": {
          "text": "The main female steroid: grows the follicle and lining, and at peak flips feedback positive.",
          "links": [
            {
              "href": "wiki:Estrogen"
            }
          ]
        },
        "progesterone": {
          "text": "The luteal and pregnancy steroid holding the uterine lining steady.",
          "links": [
            {
              "href": "wiki:Progesterone"
            }
          ]
        },
        "ovarian follicle": {
          "text": "The egg plus its nursing cells, maturing toward ovulation.",
          "links": [
            {
              "href": "wiki:Ovarian follicle"
            }
          ]
        },
        "ovulation": {
          "text": "Follicle rupture releasing the egg, triggered by the LH surge.",
          "links": [
            {
              "href": "wiki:Ovulation"
            }
          ]
        },
        "corpus luteum": {
          "text": "The follicle's remnant converted into a temporary progesterone gland.",
          "links": [
            {
              "href": "wiki:Corpus luteum"
            }
          ]
        },
        "menstruation": {
          "text": "Shedding of the lining when no pregnancy rescues the corpus luteum.",
          "links": [
            {
              "href": "wiki:Menstruation"
            }
          ]
        }
      },
      "info": {
        "text": "The cyclic program from follicle to ovulation to menses.",
        "links": [
          {
            "href": "wiki:Ovary"
          }
        ]
      }
    },
    {
      "id": "pregnancy-support",
      "name": "Pregnancy support program",
      "color": "magenta",
      "fact": "After conception the placenta takes over steroid production while prolactin and oxytocin prepare birth and lactation.",
      "terms": [
        "placenta",
        "prolactin",
        "oxytocin",
        "lactation"
      ],
      "seeds": [
        "placenta",
        "prolactin"
      ],
      "termInfo": {
        "placenta": {
          "text": "The temporary organ taking over steroid production for pregnancy.",
          "links": [
            {
              "href": "wiki:Placenta"
            }
          ]
        },
        "prolactin": {
          "text": "The pituitary hormone preparing milk production.",
          "links": [
            {
              "href": "wiki:Prolactin"
            }
          ]
        },
        "oxytocin": {
          "text": "The hypothalamic hormone driving birth contractions and milk release.",
          "links": [
            {
              "href": "wiki:Oxytocin"
            }
          ]
        },
        "lactation": {
          "text": "Milk production and release after birth.",
          "links": [
            {
              "href": "wiki:Lactation"
            }
          ]
        }
      },
      "info": {
        "text": "Rescue, takeover, birth, and milk after conception.",
        "links": [
          {
            "href": "wiki:Placenta"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "term": "gonadotropins",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Gonadotropins link command to both gonads because the same pituitary FSH and LH drive testosterone and sperm production in the testes and follicle growth and ovulation in the ovaries.",
      "info": {
        "text": "The pituitary hormones FSH and LH that drive both gonads.",
        "links": [
          {
            "href": "wiki:Gonadotropin"
          }
        ]
      }
    },
    {
      "term": "human chorionic gonadotropin",
      "clusters": [
        2,
        3
      ],
      "fact": "Human chorionic gonadotropin links the cycle to pregnancy because the embryo signal rescues the corpus luteum, holding progesterone up until the placenta takes over.",
      "info": {
        "text": "The embryo signal rescuing the corpus luteum until the placenta takes over.",
        "links": [
          {
            "href": "wiki:Human chorionic gonadotropin"
          }
        ]
      },
      "idealTerms": [
        "corpus luteum",
        "placenta"
      ]
    }
  ],
  "lenses": [
    {
      "id": "pituitary-orders-to-gonads",
      "prompt": "Which concepts are pituitary hormones sent to drive the gonads?",
      "explanation": "FSH and LH are the orders; gonadotropins names what they jointly are.",
      "targets": [
        "follicle-stimulating hormone",
        "luteinizing hormone",
        "gonadotropins"
      ],
      "reasons": {
        "follicle-stimulating hormone": "The pituitary releases it to drive follicle growth and sperm nursing.",
        "luteinizing hormone": "The pituitary releases it to drive testosterone release and ovulation.",
        "gonadotropins": "The collective name for the pituitary's gonad-driving orders."
      }
    },
    {
      "id": "ovulation-trigger",
      "prompt": "Which concepts drive the ovulation trigger, where feedback flips positive?",
      "explanation": "Rising estrogen sparks the LH surge that ruptures the follicle: the system's one positive-feedback moment.",
      "targets": [
        "estrogen",
        "luteinizing hormone",
        "ovulation"
      ],
      "reasons": {
        "estrogen": "At peak it flips from brake to trigger, sparking the surge.",
        "luteinizing hormone": "Released in surge form, it is the trigger itself.",
        "ovulation": "The event the surge causes: follicle rupture and egg release."
      }
    },
    {
      "id": "cycle-into-pregnancy",
      "prompt": "Which concepts carry the cycle across into pregnancy?",
      "explanation": "An embryo signal rescues the corpus luteum, progesterone holds, and the placenta takes over production.",
      "targets": [
        "human chorionic gonadotropin",
        "corpus luteum",
        "placenta",
        "progesterone"
      ],
      "reasons": {
        "human chorionic gonadotropin": "The embryo signal that rescues the corpus luteum.",
        "corpus luteum": "Rescued, it keeps making progesterone past its usual lifespan.",
        "placenta": "It takes over steroid production for the pregnancy's duration.",
        "progesterone": "The held hormone both structures serve in turn."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "The HPG axis parallels the thyroid and adrenal axes: pituitary orders driving peripheral glands under feedback."
    },
    "entries": [
      {
        "id": "endocrine-command-and-pace",
        "reason": "Compare gonadotropin orders (FSH, LH) with the thyroid and adrenal tropic orders (TSH, ACTH)."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "One command, two programs",
    "summary": "How one pulsatile command drives male, female, and pregnancy programs under feedback.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Reproduction runs on the same command architecture as the thyroid and adrenal axes: a hypothalamic releasing signal, pituitary orders, peripheral glands, and feedback. What makes it different is rhythm. The male program runs steady while the female program cycles, and pregnancy adds a temporary third gland that rewrites the plan mid-course.\r\n\r\nWatch for the command chain first, then for the one place the usual feedback logic inverts: a rising hormone that triggers more release instead of less."
    },
    "links": [
      {
        "href": "https://openbooks.lib.msu.edu/introneuroscience1/chapter/hpg-axis/",
        "label": "MSU: the HPG axis"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "reproductive-hormones",
      "puzzleRevision": "fnv1a32:8eeba1a7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:follicle-stimulating hormone": {
          "x": 474.83,
          "y": 305.31,
          "pinned": true
        },
        "term:luteinizing hormone": {
          "x": 514.66,
          "y": 121.66,
          "pinned": false
        },
        "term:gonadotropin-releasing hormone": {
          "x": 332.91,
          "y": 210.58,
          "pinned": false
        },
        "term:anterior pituitary": {
          "x": 367.57,
          "y": 406.73,
          "pinned": false
        },
        "term:testes": {
          "x": 751.97,
          "y": 189.09,
          "pinned": false
        },
        "term:testosterone": {
          "x": 852.77,
          "y": 217.36,
          "pinned": false
        },
        "term:sperm production": {
          "x": 810.99,
          "y": 87.73,
          "pinned": false
        },
        "term:Leydig cells": {
          "x": 647.58,
          "y": 181.19,
          "pinned": false
        },
        "term:Sertoli cells": {
          "x": 674.97,
          "y": 57.45,
          "pinned": false
        },
        "term:ovaries": {
          "x": 826.74,
          "y": 419.13,
          "pinned": false
        },
        "term:estrogen": {
          "x": 821.97,
          "y": 324.01,
          "pinned": false
        },
        "term:progesterone": {
          "x": 718.94,
          "y": 416.29,
          "pinned": false
        },
        "term:ovarian follicle": {
          "x": 912.6,
          "y": 503.6,
          "pinned": false
        },
        "term:ovulation": {
          "x": 785.96,
          "y": 508.68,
          "pinned": false
        },
        "term:corpus luteum": {
          "x": 661.36,
          "y": 496.7,
          "pinned": true
        },
        "term:menstruation": {
          "x": 923.92,
          "y": 367.87,
          "pinned": false
        },
        "term:placenta": {
          "x": 301.9,
          "y": 518.81,
          "pinned": false
        },
        "term:prolactin": {
          "x": 227.58,
          "y": 446.42,
          "pinned": true
        },
        "term:oxytocin": {
          "x": 221.27,
          "y": 575.2,
          "pinned": false
        },
        "term:lactation": {
          "x": 342.13,
          "y": 612,
          "pinned": false
        },
        "term:gonadotropins": {
          "x": 708.1,
          "y": 290.68,
          "pinned": true
        },
        "term:human chorionic gonadotropin": {
          "x": 495.11,
          "y": 551.46,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3385.26,
        "score": 3385.264646267707
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:38:50.370Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "reproductive-hormones",
      "puzzleRevision": "fnv1a32:8eeba1a7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 182.21,
          "y": 300.94,
          "pinned": true
        },
        "cluster:1": {
          "x": 510.01,
          "y": 140.3,
          "pinned": true
        },
        "cluster:2": {
          "x": 570.13,
          "y": 475.6,
          "pinned": true
        },
        "cluster:3": {
          "x": 849.84,
          "y": 307.95,
          "pinned": true
        }
      },
      "bridges": {
        "term:gonadotropins": {
          "x": 416.8,
          "y": 307.13,
          "pinned": false
        },
        "term:human chorionic gonadotropin": {
          "x": 869.02,
          "y": 513.49,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "follicle-stimulating hormone",
          "luteinizing hormone",
          "gonadotropin-releasing hormone",
          "anterior pituitary"
        ],
        "cluster:1": [
          "testes",
          "testosterone",
          "sperm production",
          "Leydig cells",
          "Sertoli cells"
        ],
        "cluster:2": [
          "ovaries",
          "estrogen",
          "progesterone",
          "ovarian follicle",
          "ovulation",
          "corpus luteum",
          "menstruation"
        ],
        "cluster:3": [
          "placenta",
          "prolactin",
          "oxytocin",
          "lactation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "luteinizing hormone",
          "gonadotropin-releasing hormone",
          "follicle-stimulating hormone",
          "anterior pituitary"
        ],
        "cluster:1": [
          "testes",
          "Leydig cells",
          "sperm production",
          "Sertoli cells",
          "testosterone"
        ],
        "cluster:2": [
          "ovaries",
          "ovulation",
          "progesterone",
          "ovarian follicle",
          "corpus luteum",
          "menstruation",
          "estrogen"
        ],
        "cluster:3": [
          "oxytocin",
          "prolactin",
          "lactation",
          "placenta"
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
        "totalLength": 615.4333028029299
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-11T17:38:26.468Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "reproductive-hormones",
      "puzzleRevision": "fnv1a32:8eeba1a7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:follicle-stimulating hormone": {
          "x": 738.62,
          "y": 80.09
        },
        "term:luteinizing hormone": {
          "x": 820.02,
          "y": 153.03
        },
        "term:gonadotropin-releasing hormone": {
          "x": 501.94,
          "y": 206.52
        },
        "term:anterior pituitary": {
          "x": 525.69,
          "y": 89.11
        },
        "term:testes": {
          "x": 946.1,
          "y": 210.18
        },
        "term:testosterone": {
          "x": 927.2,
          "y": 447.91
        },
        "term:sperm production": {
          "x": 786.49,
          "y": 565.02
        },
        "term:Leydig cells": {
          "x": 927.2,
          "y": 311.93
        },
        "term:Sertoli cells": {
          "x": 924.05,
          "y": 580.08
        },
        "term:ovaries": {
          "x": 504.95,
          "y": 613
        },
        "term:estrogen": {
          "x": 274.84,
          "y": 613
        },
        "term:progesterone": {
          "x": 393.87,
          "y": 613
        },
        "term:ovarian follicle": {
          "x": 551.32,
          "y": 395.63
        },
        "term:ovulation": {
          "x": 351.45,
          "y": 539.14
        },
        "term:corpus luteum": {
          "x": 407.75,
          "y": 457.4
        },
        "term:menstruation": {
          "x": 454.46,
          "y": 354.35
        },
        "term:placenta": {
          "x": 239.47,
          "y": 241.17
        },
        "term:prolactin": {
          "x": 76.43,
          "y": 195.8
        },
        "term:oxytocin": {
          "x": 163.45,
          "y": 78.09
        },
        "term:lactation": {
          "x": 128.77,
          "y": 293.85
        },
        "term:gonadotropins": {
          "x": 649.31,
          "y": 441.39
        },
        "term:human chorionic gonadotropin": {
          "x": 229.83,
          "y": 380.52
        },
        "cluster:0": {
          "x": 702.96,
          "y": 212.75
        },
        "cluster:1": {
          "x": 779.2,
          "y": 372.14
        },
        "cluster:2": {
          "x": 495.84,
          "y": 523.29
        },
        "cluster:3": {
          "x": 239.04,
          "y": 171.17
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-11T17:38:30.254Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-11T17:38:21.054Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
