// Generated from content/puzzles/setting-and-defending-core-temperature.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "setting-and-defending-core-temperature",
  "title": "Setting and defending core temperature",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "integrative"
  },
  "info": {
    "text": "How the hypothalamus holds core temperature near a set point by recruiting skin, muscle, fat, glands and circulation, and how fever resets that point.",
    "links": [
      {
        "href": "wiki:Thermoregulation"
      },
      {
        "href": "https://www.ncbi.nlm.nih.gov/books/NBK507838/"
      },
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/24-6-energy-and-heat-balance"
      }
    ],
    "citations": [
      {
        "title": "Physiology, Temperature Regulation",
        "publisher": "StatPearls Publishing (NCBI Bookshelf)",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK507838/"
      },
      {
        "title": "Anatomy and Physiology 2e, section 24.6: Energy and Heat Balance",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/24-6-energy-and-heat-balance"
      },
      {
        "title": "Human temperature regulation under heat stress in health, disease, and injury",
        "author": "Matthew N. Cramer, Daniel Gagnon, Orlando Laitano, Craig G. Crandall",
        "publisher": "Physiological Reviews 102(4)",
        "year": "2022",
        "pages": "1907-1989",
        "url": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
      },
      {
        "title": "Neural Mechanisms of Inflammation-Induced Fever",
        "author": "Anders Blomqvist, David Engblom",
        "publisher": "The Neuroscientist",
        "year": "2018",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6047205/"
      }
    ]
  },
  "clusters": [
    {
      "id": "heat-exchange-routes",
      "name": "Routes of heat exchange",
      "color": "teal",
      "fact": "The body trades heat with its surroundings by radiation, conduction and convection, which follow the temperature difference between skin and environment, and by evaporation, which removes heat whenever water vaporizes from skin or airways.",
      "terms": [
        "radiation",
        "evaporation",
        "conduction",
        "convection"
      ],
      "seeds": [
        "radiation",
        "evaporation"
      ],
      "termInfo": {
        "conduction": {
          "text": "Direct transfer of heat between the skin and an object or medium it touches, such as a cold bench or cold water.",
          "links": [
            {
              "href": "wiki:Thermal conduction"
            }
          ]
        },
        "convection": {
          "text": "Heat carried away by moving air or water that flows past the skin, replacing the warmed layer next to it with cooler fluid.",
          "links": [
            {
              "href": "wiki:Convection (heat transfer)"
            }
          ]
        },
        "evaporation": {
          "text": "Heat absorbed as water changes to vapor on the skin or in the airways; it keeps working even when the surroundings are hotter than the skin.",
          "links": [
            {
              "href": "wiki:Evaporation"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK541107/"
            }
          ]
        },
        "radiation": {
          "text": "Transfer of heat as infrared energy between the skin and surrounding surfaces, without direct contact; the largest route of heat loss for a resting person in a cool room.",
          "links": [
            {
              "href": "wiki:Thermal radiation"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK541107/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Heat transfer"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK541107/"
          }
        ]
      }
    },
    {
      "id": "sensing-and-setting",
      "name": "Sensing and setting temperature",
      "color": "blue",
      "fact": "Thermoreceptors in the skin and deep tissues report temperature to the preoptic area of the hypothalamus, which compares core temperature with a set point and recruits whichever defenses close the gap.",
      "terms": [
        "preoptic area",
        "skin thermoreceptors",
        "core thermoreceptors",
        "set point"
      ],
      "seeds": [
        "preoptic area",
        "skin thermoreceptors"
      ],
      "termInfo": {
        "core thermoreceptors": {
          "text": "Temperature sensors in the hypothalamus, spinal cord and abdominal organs that report the temperature of the body's interior.",
          "links": [
            {
              "href": "wiki:Thermoreceptor"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK499843/"
            }
          ]
        },
        "preoptic area": {
          "text": "Region of the anterior hypothalamus that integrates temperature signals and acts as the body's thermostat.",
          "links": [
            {
              "href": "wiki:Preoptic area"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK499843/"
            }
          ]
        },
        "set point": {
          "text": "The core temperature, normally near 37 °C, that the hypothalamus treats as its target; every thermoregulatory response works to return the body to it.",
          "links": [
            {
              "href": "wiki:Thermoregulation"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK499843/"
            }
          ]
        },
        "skin thermoreceptors": {
          "text": "Nerve endings in the skin that detect warmth and, more abundantly, cold, giving early warning of environmental change before core temperature shifts.",
          "links": [
            {
              "href": "wiki:Thermoreceptor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Hypothalamus"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK499843/"
          }
        ]
      }
    },
    {
      "id": "defending-against-cold",
      "name": "Defending against cold",
      "color": "amber",
      "fact": "When core temperature falls below the set point, skin vessels constrict to conserve heat and hairs stand erect, while skeletal muscle, brown fat and, over weeks, thyroid hormone raise heat production.",
      "terms": [
        "shivering",
        "cutaneous vasoconstriction",
        "piloerection",
        "brown adipose tissue",
        "thyroid hormone"
      ],
      "seeds": [
        "shivering",
        "cutaneous vasoconstriction"
      ],
      "termInfo": {
        "brown adipose tissue": {
          "text": "Fat tissue whose mitochondria release energy as heat rather than ATP, providing nonshivering thermogenesis, most notably in infants.",
          "links": [
            {
              "href": "wiki:Brown adipose tissue"
            }
          ]
        },
        "cutaneous vasoconstriction": {
          "text": "Narrowing of skin blood vessels, which keeps warm blood in the core and lets the skin cool, shrinking the gradient that drives heat loss.",
          "links": [
            {
              "href": "wiki:Vasoconstriction"
            },
            {
              "href": "https://www.ncbi.nlm.nih.gov/books/NBK507838/"
            }
          ]
        },
        "piloerection": {
          "text": "Contraction of tiny muscles that raise body hairs (goose bumps); in furred mammals it traps an insulating air layer, in humans the effect is small.",
          "links": [
            {
              "href": "wiki:Goose bumps"
            }
          ]
        },
        "shivering": {
          "text": "Rapid involuntary contractions of skeletal muscle that turn chemical energy into heat instead of movement.",
          "links": [
            {
              "href": "wiki:Shivering"
            }
          ]
        },
        "thyroid hormone": {
          "text": "Hormone that raises the basal metabolic rate of most tissues; prolonged cold increases its output, slowly raising heat production.",
          "links": [
            {
              "href": "wiki:Thyroid hormones"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Thermogenesis"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK507838/"
          }
        ]
      }
    },
    {
      "id": "defending-against-heat",
      "name": "Defending against heat",
      "color": "magenta",
      "fact": "When core temperature rises above the set point, skin vessels dilate and cardiac output rises to carry core heat to the surface, eccrine glands secrete sweat for evaporative cooling, and repeated heat exposure brings acclimatization that makes these responses earlier and stronger.",
      "terms": [
        "eccrine sweating",
        "cutaneous vasodilation",
        "increased cardiac output",
        "heat acclimatization"
      ],
      "seeds": [
        "eccrine sweating",
        "cutaneous vasodilation"
      ],
      "termInfo": {
        "cutaneous vasodilation": {
          "text": "Widening of skin blood vessels so warm blood from the core reaches the surface, where its heat can be shed.",
          "links": [
            {
              "href": "wiki:Vasodilation"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
            }
          ]
        },
        "eccrine sweating": {
          "text": "Secretion of watery sweat from glands spread over most of the skin, the body's most powerful means of shedding heat.",
          "links": [
            {
              "href": "wiki:Eccrine sweat gland"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
            }
          ]
        },
        "heat acclimatization": {
          "text": "Adaptation over one to two weeks of repeated heat exposure: sweating starts sooner and is more plentiful and less salty, and plasma volume expands.",
          "links": [
            {
              "href": "wiki:Acclimatization"
            },
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
            }
          ]
        },
        "increased cardiac output": {
          "text": "In heat, the heart pumps more blood per minute to supply the dilated skin, which strains circulation when exercise also demands blood for muscle.",
          "links": [
            {
              "href": "wiki:Cardiac output"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Thermoregulation"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
          }
        ]
      }
    },
    {
      "id": "fever",
      "name": "Fever",
      "color": "olive",
      "fact": "In fever, microbial products prompt immune cells to release cytokines; these induce cyclooxygenase-2 in brain blood vessels, and the prostaglandin it makes raises the hypothalamic set point. Antipyretic drugs lower the set point by blocking cyclooxygenase.",
      "terms": [
        "endogenous pyrogens",
        "antipyretics",
        "exogenous pyrogens",
        "cyclooxygenase-2"
      ],
      "seeds": [
        "endogenous pyrogens",
        "antipyretics"
      ],
      "termInfo": {
        "antipyretics": {
          "text": "Fever-reducing drugs such as aspirin, ibuprofen and acetaminophen, which inhibit cyclooxygenase and so let the set point return to normal.",
          "links": [
            {
              "href": "wiki:Antipyretic"
            }
          ]
        },
        "cyclooxygenase-2": {
          "text": "Enzyme induced by cytokines in the cells lining brain blood vessels; it produces the prostaglandin that resets the thermostat.",
          "links": [
            {
              "href": "wiki:Cyclooxygenase-2"
            },
            {
              "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6047205/"
            }
          ]
        },
        "endogenous pyrogens": {
          "text": "Cytokines such as interleukin-1, interleukin-6 and tumor necrosis factor, released by the body's own immune cells, that signal the brain to raise the set point.",
          "links": [
            {
              "href": "wiki:Cytokine"
            },
            {
              "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6047205/"
            }
          ]
        },
        "exogenous pyrogens": {
          "text": "Fever-inducing substances from outside the body, such as bacterial lipopolysaccharide, that trigger immune cells to release cytokines.",
          "links": [
            {
              "href": "wiki:Lipopolysaccharide"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Fever"
          },
          {
            "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6047205/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "humidity",
      "term": "humidity",
      "clusters": [
        0,
        3
      ],
      "fact": "Sweat cools only as it evaporates, and evaporation slows as the surrounding air nears saturation; in hot, humid air, sweat drips away without removing heat, and the strongest heat defense loses its effect.",
      "info": {
        "text": "The amount of water vapor in the air; the closer air is to saturation, the less additional water can evaporate into it.",
        "links": [
          {
            "href": "wiki:Humidity"
          },
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK499843/"
          }
        ]
      },
      "idealTerms": [
        "evaporation",
        "eccrine sweating"
      ]
    },
    {
      "id": "sympathetic-outflow",
      "term": "sympathetic outflow",
      "clusters": [
        1,
        2,
        3
      ],
      "fact": "Sympathetic nerves carry the preoptic area's commands to skin vessels, brown fat and sweat glands, so one efferent pathway drives both the heat-conserving and the heat-dissipating responses.",
      "info": {
        "text": "Signals from the sympathetic division of the autonomic nervous system; unusually, the nerves to sweat glands release acetylcholine rather than norepinephrine.",
        "links": [
          {
            "href": "wiki:Sympathetic nervous system"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "preoptic area",
        "cutaneous vasoconstriction",
        "eccrine sweating"
      ]
    },
    {
      "id": "thermoneutral-zone",
      "term": "thermoneutral zone",
      "clusters": [
        2,
        3
      ],
      "fact": "Across the thermoneutral zone, a band of surrounding temperatures that shifts with clothing, adjusting skin blood flow alone keeps core temperature at its set point; below it heat production rises, and above it sweating begins.",
      "info": {
        "text": "The range of environmental temperatures in which the body needs no extra heat production or sweating to hold its core temperature.",
        "links": [
          {
            "href": "wiki:Thermal neutral zone"
          }
        ]
      },
      "idealTerms": [
        "cutaneous vasoconstriction",
        "cutaneous vasodilation"
      ]
    },
    {
      "id": "prostaglandin-e2",
      "term": "prostaglandin E2",
      "clusters": [
        4,
        1
      ],
      "fact": "Cyclooxygenase-2 in brain blood-vessel cells makes prostaglandin E2, which acts on preoptic neurons to raise the set point; this is the step antipyretics block.",
      "info": {
        "text": "A lipid signaling molecule and the final mediator of fever, acting on EP3 receptors in the preoptic hypothalamus.",
        "links": [
          {
            "href": "wiki:Prostaglandin E2"
          },
          {
            "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6047205/"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "cyclooxygenase-2",
        "set point"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 1
      }
    },
    {
      "id": "chills",
      "term": "chills",
      "clusters": [
        4,
        2
      ],
      "fact": "When the set point jumps, a normal core temperature now registers as too cold: the person feels chilled while vasoconstriction and shivering drive temperature up to the new set point.",
      "info": {
        "text": "The sensation of cold, with shivering and pale skin, felt while a fever is rising.",
        "links": [
          {
            "href": "wiki:Chills"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "shivering"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 2
      }
    },
    {
      "id": "defervescence",
      "term": "defervescence",
      "clusters": [
        4,
        3
      ],
      "fact": "When pyrogens clear or an antipyretic takes effect, the set point drops below the still-elevated core temperature, so flushing and sweating shed the excess heat as the fever breaks.",
      "info": {
        "text": "The falling phase of a fever, when body temperature returns to normal, typically with flushed skin and heavy sweating.",
        "links": [
          {
            "href": "wiki:Fever"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "eccrine sweating"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "hyperthermia",
      "term": "hyperthermia",
      "clusters": [
        3,
        4
      ],
      "fact": "In hyperthermia the set point stays normal while heat gain outruns the heat defenses, as in heat stroke; antipyretics have nothing to reset, so treatment cools the body directly.",
      "info": {
        "text": "A rise in core temperature above the set point caused by heat gain exceeding heat loss; heat stroke is its most dangerous form.",
        "links": [
          {
            "href": "wiki:Hyperthermia"
          },
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/35679471/"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        null,
        "antipyretics"
      ]
    }
  ],
  "lenses": [
    {
      "id": "routes-that-reverse",
      "prompt": "Which routes add heat to the body once the surroundings are hotter than the skin?",
      "explanation": "Radiation, conduction and convection follow the temperature gradient, so they carry heat outward only while the skin is warmer than its surroundings. When the environment is hotter, they deliver heat inward, and evaporation becomes the only route left for shedding heat.",
      "targets": [
        "radiation",
        "conduction",
        "convection"
      ],
      "reasons": {
        "conduction": "Touching anything hotter than the skin passes heat directly into the body.",
        "convection": "Air hotter than the skin warms it as it flows past instead of carrying heat away.",
        "radiation": "Hot surfaces and direct sun radiate more infrared energy to the skin than the skin returns."
      }
    },
    {
      "id": "generating-heat",
      "prompt": "Which responses generate additional heat inside the body?",
      "explanation": "Vasoconstriction and piloerection only slow the loss of heat already present. Heat production rises through muscle contraction, the uncoupled mitochondria of brown fat, and a higher metabolic rate.",
      "targets": [
        "shivering",
        "brown adipose tissue",
        "thyroid hormone",
        "chills"
      ],
      "reasons": {
        "brown adipose tissue": "Its mitochondria release the energy of fuel oxidation directly as heat.",
        "chills": "The shivering of a rising fever produces heat that pushes core temperature up to the new set point.",
        "shivering": "Involuntary muscle contraction converts chemical energy into heat.",
        "thyroid hormone": "It raises the metabolic rate of most tissues, increasing heat output over weeks."
      }
    },
    {
      "id": "fever-signal",
      "prompt": "Which molecules take part in raising the set point during an infection?",
      "explanation": "The fever signal passes from microbe to immune cell to brain blood vessel to hypothalamic neuron. Antipyretics act on this same chain, but by interrupting it.",
      "targets": [
        "exogenous pyrogens",
        "endogenous pyrogens",
        "cyclooxygenase-2",
        "prostaglandin E2"
      ],
      "reasons": {
        "cyclooxygenase-2": "Induced by cytokines in brain blood-vessel cells, it synthesizes the final mediator.",
        "endogenous pyrogens": "Cytokines from those immune cells carry the signal through the blood to the brain.",
        "exogenous pyrogens": "Microbial products such as lipopolysaccharide start the chain by activating immune cells.",
        "prostaglandin E2": "It acts on preoptic neurons, raising the temperature they defend."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body holds its temperature",
    "summary": "A thermostat in the hypothalamus, effectors in skin, muscle, fat and circulation, and the way fever resets the target.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Human core temperature stays near 37 °C across a wide range of environments, even though skin temperature rises and falls with the surroundings. Holding it there is a job no single organ can do. Thermoregulation is a classic example of integrative physiology: the nervous system, skin, skeletal muscle, fat, the heart and blood vessels, endocrine glands and the immune system all take part.\r\n\r\n## Trading heat with the environment\r\n\r\nHeat moves between the body and its surroundings by four physical routes. **Radiation** transfers infrared energy between the skin and nearby surfaces. **Conduction** passes heat directly to whatever the skin touches, and **convection** carries it away in moving air or water. These three follow the temperature difference between skin and surroundings, so they cool the body only while the skin is warmer. **Evaporation** works differently: water absorbs heat as it vaporizes from skin and airways, so it keeps cooling the body even in hot surroundings. Its limit is **humidity**: as air approaches saturation, sweat can no longer evaporate, and drips away without cooling.\r\n\r\n## The thermostat\r\n\r\n**Skin thermoreceptors**, mostly sensitive to cold, give early warning of environmental change, while **core thermoreceptors** in the hypothalamus, spinal cord and abdominal organs report the temperature of the body's interior. The **preoptic area** of the hypothalamus integrates these signals and compares core temperature with a **set point**. When the two differ, it sends commands, largely through **sympathetic outflow** to skin vessels, brown fat and sweat glands, that move temperature back toward the target.\r\n\r\nWithin the **thermoneutral zone**, a band of surrounding temperatures that shifts with clothing, adjusting skin blood flow is enough. Outside it, the body calls on more costly defenses.\r\n\r\n## Defending against cold\r\n\r\n**Cutaneous vasoconstriction** narrows skin vessels, keeping warm blood in the core. **Piloerection** raises body hairs; it insulates furred mammals well but does little for humans. To produce more heat, skeletal muscle begins **shivering**, **brown adipose tissue** burns fuel for heat in place of ATP, and over weeks of cold, **thyroid hormone** raises the body's metabolic rate.\r\n\r\n## Defending against heat\r\n\r\n**Cutaneous vasodilation** opens skin vessels, and **increased cardiac output** delivers core heat to the surface. **Eccrine sweating** supplies water for evaporation, the most powerful cooling route. Over one to two weeks of repeated heat exposure, **heat acclimatization** makes sweating earlier, more plentiful and less salty, and expands plasma volume.\r\n\r\n## Fever: resetting the target\r\n\r\nIn infection, **exogenous pyrogens** such as bacterial lipopolysaccharide stimulate immune cells to release cytokines, the **endogenous pyrogens**. These induce **cyclooxygenase-2** in the cells lining brain blood vessels, which makes **prostaglandin E2**. Acting on preoptic neurons, prostaglandin E2 raises the set point.\r\n\r\nThe effectors themselves are unchanged; only the target moves. When the set point jumps, a normal body temperature now registers as too cold, and **chills** follow: vasoconstriction and shivering drive temperature up to the new level. **Antipyretics** such as aspirin, ibuprofen and acetaminophen block cyclooxygenase and let the set point fall. Then, or when the infection clears, the body is warmer than its target, and **defervescence** follows: flushing and sweating shed the excess heat as the fever breaks.\r\n\r\n**Hyperthermia** is a different condition. The set point stays normal, but heat gain from hot surroundings or hard exercise outruns the heat defenses, as in heat stroke. Since nothing has reset the thermostat, antipyretics do not help; the body has to be cooled directly."
    },
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/24-6-energy-and-heat-balance"
      },
      {
        "href": "https://www.ncbi.nlm.nih.gov/books/NBK507838/"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "medium"
      }
    ]
  },
  "board": {
    "lensFlowTrace": true
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "setting-and-defending-core-temperature",
      "puzzleRevision": "fnv1a32:85f5bacf",
      "board": {
        "width": 1110,
        "height": 720
      },
      "nodes": {
        "term:radiation": {
          "x": 796.63,
          "y": 565.77,
          "pinned": false
        },
        "term:evaporation": {
          "x": 696.25,
          "y": 613.14,
          "pinned": false
        },
        "term:conduction": {
          "x": 903.89,
          "y": 554.63,
          "pinned": false
        },
        "term:convection": {
          "x": 834.12,
          "y": 663.9,
          "pinned": true
        },
        "term:preoptic area": {
          "x": 506.26,
          "y": 290.09,
          "pinned": true
        },
        "term:skin thermoreceptors": {
          "x": 623.58,
          "y": 348.86,
          "pinned": true
        },
        "term:core thermoreceptors": {
          "x": 510.79,
          "y": 212.37,
          "pinned": true
        },
        "term:set point": {
          "x": 659.72,
          "y": 273.34,
          "pinned": true
        },
        "term:shivering": {
          "x": 389.78,
          "y": 145.51,
          "pinned": false
        },
        "term:cutaneous vasoconstriction": {
          "x": 303.1,
          "y": 277.9,
          "pinned": false
        },
        "term:piloerection": {
          "x": 157.37,
          "y": 194.94,
          "pinned": false
        },
        "term:brown adipose tissue": {
          "x": 262.23,
          "y": 89.38,
          "pinned": false
        },
        "term:thyroid hormone": {
          "x": 415.84,
          "y": 31.96,
          "pinned": true
        },
        "term:eccrine sweating": {
          "x": 485.9,
          "y": 527.64,
          "pinned": false
        },
        "term:cutaneous vasodilation": {
          "x": 326.45,
          "y": 475.73,
          "pinned": false
        },
        "term:increased cardiac output": {
          "x": 375.63,
          "y": 662.24,
          "pinned": false
        },
        "term:heat acclimatization": {
          "x": 562.06,
          "y": 669.94,
          "pinned": false
        },
        "term:endogenous pyrogens": {
          "x": 987.94,
          "y": 199.87,
          "pinned": true
        },
        "term:antipyretics": {
          "x": 868.91,
          "y": 401.73,
          "pinned": true
        },
        "term:exogenous pyrogens": {
          "x": 995.21,
          "y": 348.2,
          "pinned": true
        },
        "term:cyclooxygenase-2": {
          "x": 796.94,
          "y": 231.23,
          "pinned": true
        },
        "term:humidity": {
          "x": 608.66,
          "y": 541.97,
          "pinned": false
        },
        "term:sympathetic outflow": {
          "x": 451.9,
          "y": 375.3,
          "pinned": true
        },
        "term:thermoneutral zone": {
          "x": 167.16,
          "y": 405.71,
          "pinned": false
        },
        "term:prostaglandin E2": {
          "x": 674.6,
          "y": 140.21,
          "pinned": true
        },
        "term:chills": {
          "x": 660.31,
          "y": 56.84,
          "pinned": true
        },
        "term:defervescence": {
          "x": 682.58,
          "y": 415.15,
          "pinned": true
        },
        "term:hyperthermia": {
          "x": 757.21,
          "y": 486.34,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6196.44,
        "score": 6196.442247224745
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T18:21:21.037Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "setting-and-defending-core-temperature",
      "puzzleRevision": "fnv1a32:85f5bacf",
      "board": {
        "width": 1110,
        "height": 720
      },
      "nodes": {
        "term:radiation": {
          "x": 305.82,
          "y": 54.49
        },
        "term:evaporation": {
          "x": 129.38,
          "y": 209.97
        },
        "term:conduction": {
          "x": 460.06,
          "y": 49.72
        },
        "term:convection": {
          "x": 144.86,
          "y": 57.42
        },
        "term:preoptic area": {
          "x": 1010.3,
          "y": 672.25
        },
        "term:skin thermoreceptors": {
          "x": 935.63,
          "y": 72.16
        },
        "term:core thermoreceptors": {
          "x": 829.72,
          "y": 220.32
        },
        "term:set point": {
          "x": 730.56,
          "y": 79.34
        },
        "term:shivering": {
          "x": 801.87,
          "y": 382.82
        },
        "term:cutaneous vasoconstriction": {
          "x": 656.6,
          "y": 595.9
        },
        "term:piloerection": {
          "x": 828.6,
          "y": 601.61
        },
        "term:brown adipose tissue": {
          "x": 913.28,
          "y": 548.73
        },
        "term:thyroid hormone": {
          "x": 912.97,
          "y": 429.57
        },
        "term:eccrine sweating": {
          "x": 125.68,
          "y": 670.66
        },
        "term:cutaneous vasodilation": {
          "x": 517.56,
          "y": 515.82
        },
        "term:increased cardiac output": {
          "x": 308.44,
          "y": 484.21
        },
        "term:heat acclimatization": {
          "x": 382.53,
          "y": 633.32
        },
        "term:endogenous pyrogens": {
          "x": 310.06,
          "y": 226.26
        },
        "term:antipyretics": {
          "x": 595.02,
          "y": 351.72
        },
        "term:exogenous pyrogens": {
          "x": 278.38,
          "y": 312
        },
        "term:cyclooxygenase-2": {
          "x": 460.39,
          "y": 229.24
        },
        "term:humidity": {
          "x": 84.65,
          "y": 353.99
        },
        "term:sympathetic outflow": {
          "x": 676.55,
          "y": 673.77
        },
        "term:thermoneutral zone": {
          "x": 653.31,
          "y": 442.89
        },
        "term:prostaglandin E2": {
          "x": 585.89,
          "y": 149.8
        },
        "term:chills": {
          "x": 655.93,
          "y": 264.58
        },
        "term:defervescence": {
          "x": 199.33,
          "y": 408.95
        },
        "term:hyperthermia": {
          "x": 487.07,
          "y": 457.96
        },
        "cluster:0": {
          "x": 295.55,
          "y": 136.14
        },
        "cluster:1": {
          "x": 980.36,
          "y": 154.34
        },
        "cluster:2": {
          "x": 774.7,
          "y": 498.67
        },
        "cluster:3": {
          "x": 310.65,
          "y": 564.64
        },
        "cluster:4": {
          "x": 443.5,
          "y": 351.28
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-09T18:27:15.872Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "setting-and-defending-core-temperature",
      "puzzleRevision": "fnv1a32:85f5bacf",
      "board": {
        "width": 1220,
        "height": 900
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 412.58,
          "y": 426.33,
          "pinned": true
        },
        "cluster:1": {
          "x": 818.24,
          "y": 614.39,
          "pinned": true
        },
        "cluster:2": {
          "x": 219.83,
          "y": 717.37,
          "pinned": true
        },
        "cluster:3": {
          "x": 482.51,
          "y": 151.47,
          "pinned": true
        },
        "cluster:4": {
          "x": 1035.65,
          "y": 151.03,
          "pinned": true
        }
      },
      "bridges": {
        "term:humidity": {
          "x": 255.32,
          "y": 307.78,
          "pinned": true
        },
        "term:sympathetic outflow": {
          "x": 583.24,
          "y": 620.74,
          "pinned": true
        },
        "term:thermoneutral zone": {
          "x": 88.15,
          "y": 342.58,
          "pinned": true
        },
        "term:prostaglandin E2": {
          "x": 908.77,
          "y": 443.24,
          "pinned": true
        },
        "term:chills": {
          "x": 1164.52,
          "y": 789.13,
          "pinned": true
        },
        "term:defervescence": {
          "x": 764.73,
          "y": 104.19,
          "pinned": true
        },
        "term:hyperthermia": {
          "x": 638.69,
          "y": 332.05,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "radiation",
          "evaporation",
          "conduction",
          "convection"
        ],
        "cluster:1": [
          "preoptic area",
          "skin thermoreceptors",
          "core thermoreceptors",
          "set point"
        ],
        "cluster:2": [
          "shivering",
          "cutaneous vasoconstriction",
          "piloerection",
          "brown adipose tissue",
          "thyroid hormone"
        ],
        "cluster:3": [
          "eccrine sweating",
          "cutaneous vasodilation",
          "increased cardiac output",
          "heat acclimatization"
        ],
        "cluster:4": [
          "endogenous pyrogens",
          "antipyretics",
          "exogenous pyrogens",
          "cyclooxygenase-2"
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
        "totalLength": 4582.222529910334
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-09T18:25:14.566Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-09T17:35:18.170Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
