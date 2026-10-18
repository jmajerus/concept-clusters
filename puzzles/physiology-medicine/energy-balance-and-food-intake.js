// Generated from content/puzzles/energy-balance-and-food-intake.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "energy-balance-and-food-intake",
  "title": "Energy balance and food intake",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "integrative"
  },
  "info": {
    "text": "How the brain, gut, fat tissue, and pancreas together match food intake to energy spent, and why body fat is defended against both gain and loss.",
    "links": [
      {
        "href": "wiki:Energy homeostasis"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed.",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021",
        "pages": "ch. 72–73"
      },
      {
        "title": "Central nervous system control of food intake",
        "author": "Michael W. Schwartz, Stephen C. Woods, Daniel Porte Jr., Randy J. Seeley, Denis G. Baskin",
        "publisher": "Nature 404(6778)",
        "year": "2000",
        "pages": "661-671",
        "url": "https://pubmed.ncbi.nlm.nih.gov/10766253/"
      },
      {
        "title": "Adaptive thermogenesis in humans",
        "author": "Michael Rosenbaum, Rudolph L. Leibel",
        "publisher": "International Journal of Obesity 34, suppl. 1",
        "year": "2010",
        "pages": "S47-S55",
        "url": "https://pubmed.ncbi.nlm.nih.gov/20935667/"
      },
      {
        "title": "Clinical spectrum of obesity and mutations in the melanocortin 4 receptor gene",
        "author": "I. Sadaf Farooqi et al.",
        "publisher": "New England Journal of Medicine 348(12)",
        "year": "2003",
        "pages": "1085-1095",
        "url": "https://pubmed.ncbi.nlm.nih.gov/12646665/"
      }
    ]
  },
  "clusters": [
    {
      "id": "appetite-circuit",
      "name": "Hypothalamic appetite circuit",
      "color": "teal",
      "fact": "In the arcuate nucleus, two opposed sets of neurons read the body's fuel signals. POMC neurons release α-MSH, which acts on melanocortin-4 receptors to curb eating and raise energy use; NPY/AgRP neurons drive eating and block those same receptors. The lateral hypothalamus is the feeding center whose loss abolishes hunger.",
      "terms": [
        "arcuate nucleus",
        "POMC neurons",
        "NPY/AgRP neurons",
        "melanocortin-4 receptor",
        "lateral hypothalamus"
      ],
      "seeds": [
        "arcuate nucleus",
        "POMC neurons"
      ],
      "termInfo": {
        "NPY/AgRP neurons": {
          "text": "Arcuate neurons that release neuropeptide Y and agouti-related peptide, stimulating eating and blocking melanocortin-4 receptors.",
          "links": [
            {
              "href": "wiki:Agouti-related peptide"
            }
          ]
        },
        "POMC neurons": {
          "text": "Arcuate neurons that make pro-opiomelanocortin and release α-MSH from it, reducing food intake and raising energy expenditure.",
          "links": [
            {
              "href": "wiki:Proopiomelanocortin"
            }
          ]
        },
        "arcuate nucleus": {
          "text": "A hypothalamic nucleus at the base of the brain, where circulating fuel signals reach the two opposed populations of appetite neurons.",
          "links": [
            {
              "href": "wiki:Arcuate nucleus (hypothalamus)"
            }
          ]
        },
        "lateral hypothalamus": {
          "text": "Guyton's feeding center: stimulating it provokes eating, and destroying it abolishes the desire for food.",
          "links": [
            {
              "href": "wiki:Lateral hypothalamus"
            }
          ]
        },
        "melanocortin-4 receptor": {
          "text": "MC4R, the receptor on downstream hypothalamic neurons through which α-MSH curbs eating; AgRP blocks it.",
          "links": [
            {
              "href": "wiki:Melanocortin 4 receptor"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/12646665/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/10766253/"
          }
        ]
      }
    },
    {
      "id": "meal-signals",
      "name": "Meal signals",
      "color": "blue",
      "fact": "Signals from the gut regulate each meal. Ghrelin from the stomach rises before meals and stimulates hunger. Once food arrives, stretch of the stomach and hormones from the intestine, cholecystokinin, peptide YY, and GLP-1, produce satiety and bring the meal to an end.",
      "terms": [
        "ghrelin",
        "cholecystokinin",
        "peptide YY",
        "GLP-1",
        "gastric distension"
      ],
      "seeds": [
        "ghrelin",
        "cholecystokinin"
      ],
      "termInfo": {
        "GLP-1": {
          "text": "Glucagon-like peptide-1, released by the intestine after a meal; it slows stomach emptying, curbs appetite, and boosts insulin release.",
          "links": [
            {
              "href": "wiki:Glucagon-like peptide-1"
            }
          ]
        },
        "cholecystokinin": {
          "text": "CCK, released by the upper small intestine in response to fat and protein; it signals satiety mainly through the vagus nerve.",
          "links": [
            {
              "href": "wiki:Cholecystokinin"
            }
          ]
        },
        "gastric distension": "Stretch of the stomach wall as food fills it, sensed by stretch receptors and reported to the brainstem; it ends a meal regardless of the food's calories.",
        "ghrelin": {
          "text": "A hormone released mainly by the empty stomach; its level climbs before meals, falls after eating, and stimulates hunger through NPY/AgRP neurons.",
          "links": [
            {
              "href": "wiki:Ghrelin"
            }
          ]
        },
        "peptide YY": {
          "text": "A hormone released by the lower intestine after a meal, in proportion to the calories eaten, that reduces appetite.",
          "links": [
            {
              "href": "wiki:Peptide YY"
            }
          ]
        }
      }
    },
    {
      "id": "adiposity-signals",
      "name": "Adiposity signals",
      "color": "amber",
      "fact": "Fat tissue releases leptin in proportion to its mass, and insulin rises with body fat as well. Both reach the arcuate nucleus as long-term signals of stored energy. In most obesity, leptin is high but the brain responds to it poorly.",
      "terms": [
        "leptin",
        "insulin",
        "leptin resistance"
      ],
      "seeds": [
        "leptin",
        "insulin"
      ],
      "termInfo": {
        "insulin": {
          "text": "Besides its role in glucose control, insulin circulates in proportion to body fat and acts on the arcuate nucleus much as leptin does.",
          "links": [
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/10766253/"
            }
          ]
        },
        "leptin": {
          "text": "A hormone secreted by fat cells in proportion to fat mass; it stimulates POMC neurons and inhibits NPY/AgRP neurons.",
          "links": [
            {
              "href": "wiki:Leptin"
            }
          ]
        },
        "leptin resistance": "A blunted brain response to leptin, so high levels fail to curb appetite; it is typical of common obesity, which extra leptin does not treat."
      }
    },
    {
      "id": "energy-expenditure",
      "name": "Energy expenditure",
      "color": "magenta",
      "fact": "Daily energy expenditure has three parts. The basal metabolic rate is the largest share in a sedentary adult; physical activity is the most variable; and digesting and storing each meal adds a smaller amount, the thermic effect of food.",
      "terms": [
        "basal metabolic rate",
        "physical activity",
        "thermic effect of food"
      ],
      "seeds": [
        "basal metabolic rate",
        "physical activity"
      ],
      "termInfo": {
        "basal metabolic rate": {
          "text": "The energy used at complete rest to keep the body's cells working, about 60 to 70 percent of daily expenditure in a sedentary adult.",
          "links": [
            {
              "href": "wiki:Basal metabolic rate"
            }
          ]
        },
        "physical activity": "Energy spent on movement, from walking and fidgeting to exercise; the most variable part of daily expenditure.",
        "thermic effect of food": {
          "text": "The rise in energy use for several hours after a meal, as food is digested, absorbed, and stored; about 10 percent of daily expenditure. Guyton calls it the specific dynamic action of food.",
          "links": [
            {
              "href": "wiki:Specific dynamic action"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "lipostatic-feedback",
      "term": "lipostatic feedback",
      "clusters": [
        2,
        0
      ],
      "fact": "Leptin and insulin rise with fat mass and act on the arcuate nucleus, stimulating POMC neurons and inhibiting NPY/AgRP neurons, so eating falls as fat accumulates and rises as it is lost. The circuit's control of intake in turn sets fat mass, closing the loop.",
      "info": "Long-term feedback that holds body fat near a defended level; the idea goes back to Gordon Kennedy's lipostatic hypothesis of 1953.",
      "relationKind": "dynamic",
      "idealTerms": [
        "leptin",
        "arcuate nucleus"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    },
    {
      "id": "vagal-afferents",
      "term": "vagal afferents",
      "clusters": [
        1,
        0
      ],
      "fact": "Sensory fibers of the vagus nerve carry stomach stretch and the satiety signal of cholecystokinin to the brainstem, which relays them to the hypothalamus to end the meal.",
      "info": {
        "text": "Sensory fibers in the vagus nerve that report on the state of the gut to the brainstem.",
        "links": [
          {
            "href": "wiki:Vagus nerve"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "gastric distension",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "adaptive-thermogenesis",
      "term": "adaptive thermogenesis",
      "clusters": [
        2,
        3
      ],
      "fact": "As fat stores shrink during weight loss, leptin falls and energy expenditure drops by more than the loss of tissue can explain, slowing further loss and favoring regain.",
      "info": {
        "text": "A change in energy expenditure beyond what changes in body size predict; after weight loss it lowers expenditure.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/20935667/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "leptin",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "energy-balance",
      "term": "energy balance",
      "clusters": [
        0,
        2,
        3
      ],
      "fact": "Body fat changes only when the energy taken in differs from the energy spent: the appetite circuit sets intake, the expenditure components set output, and the difference is stored as fat or drawn from it.",
      "info": {
        "text": "The relation between energy intake and energy expenditure; any lasting surplus or deficit changes the body's stored energy.",
        "links": [
          {
            "href": "wiki:Energy homeostasis"
          }
        ]
      },
      "idealTerms": [
        null,
        "leptin",
        "basal metabolic rate"
      ]
    }
  ],
  "lenses": [
    {
      "id": "drives-to-eat",
      "prompt": "Which signals stimulate eating?",
      "explanation": "Hunger has a gut signal, ghrelin, and hypothalamic machinery that answers it. The other signals on the board end a meal or report how much fuel is stored.",
      "targets": [
        "NPY/AgRP neurons",
        "lateral hypothalamus",
        "ghrelin"
      ],
      "reasons": {
        "NPY/AgRP neurons": "Their peptides drive feeding and block the melanocortin-4 receptor.",
        "ghrelin": "Rising before meals, it activates NPY/AgRP neurons and brings on hunger.",
        "lateral hypothalamus": "Stimulating this feeding center provokes eating."
      }
    },
    {
      "id": "leptin-target",
      "prompt": "Which neurons does leptin activate to suppress eating?",
      "explanation": "Leptin works on both arcuate populations at once: it excites POMC neurons and inhibits NPY/AgRP neurons, pushing the balance toward eating less.",
      "targets": [
        "POMC neurons"
      ],
      "reasons": {
        "POMC neurons": "Leptin excites them, and the α-MSH they release acts on melanocortin-4 receptors to curb eating."
      }
    },
    {
      "id": "ending-a-meal",
      "prompt": "Which gut hormones help bring a meal to an end?",
      "explanation": "Ghrelin rises before meals and works the other way. Stomach stretch also ends a meal, as a mechanical signal carried by nerves.",
      "targets": [
        "cholecystokinin",
        "peptide YY",
        "GLP-1"
      ],
      "reasons": {
        "GLP-1": "It slows stomach emptying and curbs appetite.",
        "cholecystokinin": "Fat and protein in the upper intestine release it, and it signals fullness through the vagus nerve.",
        "peptide YY": "The lower intestine releases it in proportion to the calories eaten."
      }
    },
    {
      "id": "drug-mimic",
      "prompt": "Which hormone do weight-loss drugs such as semaglutide mimic?",
      "explanation": "A meal's own GLP-1 is cleared within minutes. A long-acting drug that activates its receptor around the clock keeps appetite low and stomach emptying slow.",
      "targets": [
        "GLP-1"
      ],
      "reasons": {
        "GLP-1": "Semaglutide activates GLP-1 receptors, but lasts far longer than the natural hormone."
      }
    },
    {
      "id": "stretch-to-brain",
      "prompt": "Which nerve fibers carry stomach stretch to the brainstem?",
      "explanation": "The brainstem relays these signals to the hypothalamus. Cutting the vagal sensory fibers blunts much of cholecystokinin's satiety effect.",
      "targets": [
        "vagal afferents"
      ],
      "reasons": {
        "vagal afferents": "Sensory fibers of the vagus nerve report stretch and cholecystokinin's signal from the gut."
      }
    },
    {
      "id": "second-adiposity-signal",
      "prompt": "Which pancreatic hormone also tells the hypothalamus how large the fat stores are?",
      "explanation": "Insulin carries two messages: after a meal it directs fuel into storage, and over the long term its level tracks how much fuel is already stored.",
      "targets": [
        "insulin"
      ],
      "reasons": {
        "insulin": "Its level rises with body fat, and it acts on the arcuate nucleus much as leptin does."
      }
    },
    {
      "id": "long-term-loop",
      "prompt": "Which loop ties long-term food intake to the size of the fat stores?",
      "explanation": "Because the loop closes, body fat is defended in both directions: a meal skipped or a feast eaten is largely made up within days.",
      "targets": [
        "lipostatic feedback"
      ],
      "reasons": {
        "lipostatic feedback": "Fat sets leptin and insulin, these signals set appetite, and appetite in turn sets fat."
      }
    },
    {
      "id": "leptin-fails",
      "prompt": "Which condition explains why extra leptin fails to curb appetite in most obesity?",
      "explanation": "Leptin injections help only the rare people who cannot make leptin at all; in common obesity the signal is present but poorly heard.",
      "targets": [
        "leptin resistance"
      ],
      "reasons": {
        "leptin resistance": "Leptin is already high in common obesity, but the brain responds to it weakly."
      }
    },
    {
      "id": "single-gene-obesity",
      "prompt": "Loss of which receptor is the most common single-gene cause of severe obesity?",
      "explanation": "Farooqi and colleagues found these mutations in about 6 percent of people with severe obesity beginning in childhood.",
      "targets": [
        "melanocortin-4 receptor"
      ],
      "reasons": {
        "melanocortin-4 receptor": "Without working receptors, α-MSH cannot curb eating, so hunger persists despite ample fat stores."
      }
    },
    {
      "id": "meal-cost",
      "prompt": "Which part of daily energy expenditure rises after each meal?",
      "explanation": "It is the smallest of the three parts, about a tenth of daily expenditure; protein raises it more than fat or carbohydrate does.",
      "targets": [
        "thermic effect of food"
      ],
      "reasons": {
        "thermic effect of food": "Digesting, absorbing, and storing food raises energy use for several hours."
      }
    },
    {
      "id": "weight-loss-slows",
      "prompt": "Which response slows weight loss as fat stores shrink?",
      "explanation": "The same intake that produced weight loss early in a diet produces less later, because the body is now spending less. This is a large part of why lost weight is often regained.",
      "targets": [
        "adaptive thermogenesis"
      ],
      "reasons": {
        "adaptive thermogenesis": "Falling leptin lowers energy expenditure beyond what the smaller body explains."
      }
    },
    {
      "id": "when-fat-changes",
      "prompt": "Which principle says body fat changes only when intake and expenditure differ?",
      "explanation": "Every other concept on the board acts on one side of this relation or the other: the appetite circuit and meal signals on intake, the expenditure components on output, and the adiposity signals on both.",
      "targets": [
        "energy balance"
      ],
      "reasons": {
        "energy balance": "Any lasting difference between energy taken in and energy spent is stored as fat or drawn from it."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "setting-and-defending-core-temperature",
        "reason": "See the other variable held near a set point by the hypothalamus, with brown fat and thyroid hormone as effectors."
      },
      {
        "id": "hypothalamic-pituitary-axes",
        "reason": "Follow thyroid hormone, which sets much of the basal metabolic rate counted here."
      },
      {
        "id": "meeting-the-demands-of-exercise",
        "reason": "See what physical activity costs, and how training shifts the fuel it burns."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body balances energy",
    "summary": "How the hypothalamus reads signals from the gut and from fat to set food intake, how the body spends energy, and why body fat is defended.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Over a year an adult may eat close to a million kilocalories, yet body weight often changes by only a kilogram or two. Small mismatches between intake and use would add up quickly, so something must be matching them. The brain, gut, fat tissue, and pancreas share that work.\r\n\r\n## The principle\r\n\r\nThe body obeys **energy balance**: stored energy, mostly fat, changes only when the energy taken in differs from the energy spent. Everything else in this lesson acts on one side of that relation or the other.\r\n\r\n## The appetite circuit\r\n\r\nThe control center lies in the hypothalamus. In the **arcuate nucleus**, at the base of the brain, two opposed groups of neurons read the body's fuel signals. **POMC neurons** release α-MSH, which acts on the **melanocortin-4 receptor** to reduce eating and raise energy use. **NPY/AgRP neurons** do the reverse: they drive eating, and their AgRP blocks the melanocortin-4 receptor. The **lateral hypothalamus**, which Guyton calls the feeding center, provokes eating when stimulated; destroying it abolishes the desire for food.\r\n\r\n## Signals from each meal\r\n\r\nThe gut regulates each meal. **Ghrelin**, released mainly by the empty stomach, rises before meals and stimulates hunger through the NPY/AgRP neurons. Once food arrives, signals of fullness take over. **Gastric distension**, the stretch of the stomach wall, and **cholecystokinin**, released by the upper intestine in response to fat and protein, are carried to the brainstem by **vagal afferents**, the sensory fibers of the vagus nerve. Further along, the intestine releases **peptide YY** in proportion to the calories eaten, and **GLP-1**, which slows stomach emptying and curbs appetite. Drugs such as semaglutide mimic GLP-1, but last far longer.\r\n\r\n## Signals from stored fat\r\n\r\nMeal signals end a meal but do not decide how much fat the body carries. That is the job of long-term signals. Fat cells release **leptin** in proportion to fat mass, and **insulin** also circulates in proportion to body fat. Both act on the arcuate nucleus, exciting POMC neurons and inhibiting NPY/AgRP neurons. The result is **lipostatic feedback**: as fat accumulates, eating falls, and as fat is lost, eating rises, while the circuit's control of eating in turn sets how much fat there is.\r\n\r\nThis loop explains why leptin seemed at first a promising treatment for obesity, and why it disappointed. People who cannot make leptin at all are severely obese and respond dramatically to it, but they are very rare. In common obesity, leptin is already high, and the brain responds to it weakly, a state called **leptin resistance**. Mutations in the melanocortin-4 receptor are the most common single-gene cause of severe obesity.\r\n\r\n## Energy spent\r\n\r\nDaily energy expenditure has three parts. The **basal metabolic rate**, the energy used at complete rest, is the largest share in a sedentary adult, about 60 to 70 percent. **Physical activity**, from fidgeting to exercise, is the most variable. The **thermic effect of food**, the energy used to digest, absorb, and store a meal, adds about 10 percent.\r\n\r\nExpenditure does not stay fixed when weight changes. As fat stores shrink, leptin falls and expenditure drops by more than the smaller body can explain. This **adaptive thermogenesis** slows further weight loss and favors regain, and it is one reason body fat is defended so effectively against loss."
    }
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
      "puzzleId": "energy-balance-and-food-intake",
      "puzzleRevision": "fnv1a32:404b5bfb",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:arcuate nucleus": {
          "x": 544.04,
          "y": 306.04
        },
        "term:POMC neurons": {
          "x": 724.88,
          "y": 72.07
        },
        "term:NPY/AgRP neurons": {
          "x": 539.42,
          "y": 51.31
        },
        "term:melanocortin-4 receptor": {
          "x": 793.38,
          "y": 139.31
        },
        "term:lateral hypothalamus": {
          "x": 346.51,
          "y": 89.34
        },
        "term:ghrelin": {
          "x": 911.89,
          "y": 476.73
        },
        "term:cholecystokinin": {
          "x": 908.73,
          "y": 311.69
        },
        "term:peptide YY": {
          "x": 742.06,
          "y": 289.37
        },
        "term:GLP-1": {
          "x": 815.66,
          "y": 226.69
        },
        "term:gastric distension": {
          "x": 752.72,
          "y": 479.53
        },
        "term:leptin": {
          "x": 362.96,
          "y": 517.35
        },
        "term:insulin": {
          "x": 282.8,
          "y": 599.97
        },
        "term:leptin resistance": {
          "x": 613.9,
          "y": 603.98
        },
        "term:basal metabolic rate": {
          "x": 306.73,
          "y": 207.11
        },
        "term:physical activity": {
          "x": 92.59,
          "y": 238.54
        },
        "term:thermic effect of food": {
          "x": 144.19,
          "y": 142.85
        },
        "term:lipostatic feedback": {
          "x": 545.18,
          "y": 482.63
        },
        "term:vagal afferents": {
          "x": 671.23,
          "y": 367.03
        },
        "term:adaptive thermogenesis": {
          "x": 196.46,
          "y": 439.45
        },
        "term:energy balance": {
          "x": 369.43,
          "y": 364.29
        },
        "cluster:0": {
          "x": 552.7,
          "y": 173.8
        },
        "cluster:1": {
          "x": 820.29,
          "y": 386.11
        },
        "cluster:2": {
          "x": 438.7,
          "y": 604.05
        },
        "cluster:3": {
          "x": 198.12,
          "y": 321.93
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T15:39:47.773Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "energy-balance-and-food-intake",
      "puzzleRevision": "fnv1a32:404b5bfb",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:arcuate nucleus": {
          "x": 735.77,
          "y": 383.31,
          "pinned": false
        },
        "term:POMC neurons": {
          "x": 921.44,
          "y": 364.13,
          "pinned": true
        },
        "term:NPY/AgRP neurons": {
          "x": 633.94,
          "y": 494.07,
          "pinned": true
        },
        "term:melanocortin-4 receptor": {
          "x": 779.04,
          "y": 545.32,
          "pinned": false
        },
        "term:lateral hypothalamus": {
          "x": 906.98,
          "y": 461.65,
          "pinned": true
        },
        "term:ghrelin": {
          "x": 187.63,
          "y": 338.15,
          "pinned": true
        },
        "term:cholecystokinin": {
          "x": 155.82,
          "y": 429.59,
          "pinned": true
        },
        "term:peptide YY": {
          "x": 164.16,
          "y": 239.4,
          "pinned": true
        },
        "term:GLP-1": {
          "x": 81.02,
          "y": 313.84,
          "pinned": true
        },
        "term:gastric distension": {
          "x": 320.09,
          "y": 386.86,
          "pinned": true
        },
        "term:leptin": {
          "x": 764.02,
          "y": 148.75,
          "pinned": true
        },
        "term:insulin": {
          "x": 756.63,
          "y": 58.96,
          "pinned": true
        },
        "term:leptin resistance": {
          "x": 882.74,
          "y": 89.97,
          "pinned": true
        },
        "term:basal metabolic rate": {
          "x": 450.09,
          "y": 269.3,
          "pinned": true
        },
        "term:physical activity": {
          "x": 324.69,
          "y": 202.8,
          "pinned": true
        },
        "term:thermic effect of food": {
          "x": 425.02,
          "y": 134.09,
          "pinned": true
        },
        "term:lipostatic feedback": {
          "x": 872.69,
          "y": 269.77,
          "pinned": true
        },
        "term:vagal afferents": {
          "x": 485.23,
          "y": 448.47,
          "pinned": true
        },
        "term:adaptive thermogenesis": {
          "x": 597.49,
          "y": 92.11,
          "pinned": true
        },
        "term:energy balance": {
          "x": 699.39,
          "y": 264.22,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3847.65,
        "score": 3847.6492865523155
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T04:18:37.042Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "energy-balance-and-food-intake",
      "puzzleRevision": "fnv1a32:404b5bfb",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 493.98,
          "y": 153.47,
          "pinned": true
        },
        "cluster:1": {
          "x": 208.22,
          "y": 333,
          "pinned": false
        },
        "cluster:2": {
          "x": 453.9,
          "y": 517.54,
          "pinned": true
        },
        "cluster:3": {
          "x": 851.88,
          "y": 335,
          "pinned": true
        }
      },
      "bridges": {
        "term:lipostatic feedback": {
          "x": 432.94,
          "y": 362.85,
          "pinned": false
        },
        "term:vagal afferents": {
          "x": 270.05,
          "y": 131.62,
          "pinned": true
        },
        "term:adaptive thermogenesis": {
          "x": 731.94,
          "y": 507.33,
          "pinned": true
        },
        "term:energy balance": {
          "x": 627.28,
          "y": 355.86,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "arcuate nucleus",
          "POMC neurons",
          "NPY/AgRP neurons",
          "melanocortin-4 receptor",
          "lateral hypothalamus"
        ],
        "cluster:1": [
          "ghrelin",
          "cholecystokinin",
          "peptide YY",
          "GLP-1",
          "gastric distension"
        ],
        "cluster:2": [
          "leptin",
          "insulin",
          "leptin resistance"
        ],
        "cluster:3": [
          "basal metabolic rate",
          "physical activity",
          "thermic effect of food"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "POMC neurons",
          "NPY/AgRP neurons",
          "melanocortin-4 receptor",
          "lateral hypothalamus",
          "arcuate nucleus"
        ],
        "cluster:1": [
          "GLP-1",
          "peptide YY",
          "gastric distension",
          "cholecystokinin",
          "ghrelin"
        ],
        "cluster:2": [
          "leptin",
          "leptin resistance",
          "insulin"
        ],
        "cluster:3": [
          "physical activity",
          "thermic effect of food",
          "basal metabolic rate"
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
        "totalLength": 1292.7214566613652
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T04:19:20.452Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-15T04:19:29.271Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
