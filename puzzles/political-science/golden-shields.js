// Generated from content/puzzles/golden-shields.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "golden-shields",
  "title": "Golden Shields",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science"
  ],
  "subcategories": {
    "peace-conflict-studies": "war-militarism",
    "political-science": "political-institutions-regimes"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "How executive-branch legal opinions manufactured impunity for a two-tier system of detention, acknowledged military prisons and secret CIA ones, and for the torture carried out in both.",
    "citations": [
      {
        "title": "The Dark Side: The Inside Story of How the War on Terror Turned Into a War on American Ideals",
        "author": "Mayer, Jane",
        "publisher": "Doubleday",
        "year": "2008"
      },
      {
        "title": "The Terror Presidency: Law and Judgment Inside the Bush Administration",
        "author": "Goldsmith, Jack",
        "publisher": "W. W. Norton",
        "year": "2007"
      },
      {
        "title": "Inquiry into the Treatment of Detainees in U.S. Custody",
        "author": "U.S. Senate Committee on Armed Services",
        "year": "2008"
      }
    ]
  },
  "clusters": [
    {
      "id": "legal-machinery",
      "name": "The Legal Machinery",
      "color": "teal",
      "fact": "Executive branch lawyers redefined torture in a formal legal opinion and argued that the president's power as commander in chief overrode the statutes forbidding it.",
      "terms": [
        "Bybee Memo",
        "Office of Legal Counsel",
        "John Yoo",
        "Unitary Executive Theory"
      ],
      "seeds": [
        "Bybee Memo",
        "Office of Legal Counsel"
      ],
      "termInfo": {
        "Bybee Memo": {
          "text": "The August 2002 Justice Department opinion, drafted by John Yoo and signed by Jay Bybee, that narrowed the legal definition of torture.",
          "links": [
            {
              "href": "wiki:Torture Memos"
            }
          ]
        },
        "John Yoo": {
          "text": "The Office of Legal Counsel attorney who drafted the memos authorizing coercive interrogation.",
          "links": [
            {
              "href": "wiki:John Yoo"
            }
          ]
        },
        "Office of Legal Counsel": {
          "text": "The Justice Department office whose legal opinions are treated as binding on the rest of the executive branch.",
          "links": [
            {
              "href": "wiki:Office of Legal Counsel"
            }
          ]
        },
        "Unitary Executive Theory": {
          "text": "The doctrine that the president holds essentially unchecked control over the executive branch, invoked to argue that statutes could not limit how the president directed interrogations.",
          "links": [
            {
              "href": "wiki:Unitary executive theory"
            }
          ]
        }
      }
    },
    {
      "id": "acknowledged-prisons",
      "name": "The Acknowledged Prisons",
      "color": "amber",
      "fact": "The military's prisons were officially acknowledged: prisoners were registered, the Red Cross visited, and from 2004 the courts could reach at least Guantanamo. Acknowledgment did not prevent abuse inside them.",
      "terms": [
        "Guantanamo Bay Detention Camp",
        "Abu Ghraib",
        "Red Cross Access",
        "Combatant Status Review Tribunals"
      ],
      "seeds": [
        "Guantanamo Bay Detention Camp",
        "Abu Ghraib"
      ],
      "termInfo": {
        "Abu Ghraib": {
          "text": "The U.S. military prison in Iraq where photographs published in 2004 showed prisoners stripped, held in stress positions, and threatened with dogs. Army investigations found military intelligence personnel involved alongside the military police.",
          "links": [
            {
              "href": "wiki:Abu Ghraib torture and prisoner abuse"
            }
          ]
        },
        "Combatant Status Review Tribunals": {
          "text": "Military hearings the Pentagon set up in 2004, after the Supreme Court allowed Guantanamo prisoners to challenge their detention, to decide whether each prisoner was properly held as an enemy combatant.",
          "links": [
            {
              "href": "wiki:Combatant Status Review Tribunal"
            }
          ]
        },
        "Guantanamo Bay Detention Camp": {
          "text": "The U.S. military prison at Guantanamo Bay, Cuba, opened in January 2002 and chosen partly because its offshore status was argued to place it outside domestic legal jurisdiction.",
          "links": [
            {
              "href": "wiki:Guantanamo Bay detention camp"
            }
          ]
        },
        "Red Cross Access": {
          "text": "Registration of prisoners and confidential visits by the International Committee of the Red Cross, the ordinary outside check on how prisoners of war and other detainees are treated. The Red Cross visited Guantanamo from 2002, and its reports from Iraq documented abuse before the Abu Ghraib photographs became public.",
          "links": [
            {
              "href": "wiki:International Committee of the Red Cross"
            }
          ]
        }
      }
    },
    {
      "id": "secret-prisons",
      "name": "The Secret Prisons",
      "color": "magenta",
      "fact": "The CIA held prisoners in a separate system that was never acknowledged while it operated: no registration, no Red Cross, and no court that could reach it.",
      "terms": [
        "CIA Black Sites",
        "Extraordinary Rendition",
        "Incommunicado Detention"
      ],
      "seeds": [
        "CIA Black Sites",
        "Extraordinary Rendition"
      ],
      "termInfo": {
        "CIA Black Sites": {
          "text": "Secret CIA-operated prisons located outside the United States, used from 2002 to hold detainees beyond the reach of any court. The CIA's detention authority came from a presidential finding signed in September 2001.",
          "links": [
            {
              "href": "wiki:Black site"
            }
          ]
        },
        "Extraordinary Rendition": {
          "text": "The covert transfer of a detainee to another country's custody, circumventing extradition law and often enabling torture by proxy.",
          "links": [
            {
              "href": "wiki:Extraordinary rendition"
            }
          ]
        },
        "Incommunicado Detention": {
          "text": "Holding a detainee with no outside contact and no acknowledgment of their whereabouts -- the same mechanism international law treats as enforced disappearance.",
          "links": [
            {
              "href": "wiki:Enforced disappearance"
            }
          ]
        }
      }
    },
    {
      "id": "interrogation-program",
      "name": "The Interrogation Program",
      "color": "blue",
      "fact": "The program's techniques were reverse-engineered from military training designed to help soldiers resist torture, then repurposed as memo-authorized methods for extracting confessions from detainees.",
      "terms": [
        "Enhanced Interrogation Techniques",
        "Waterboarding",
        "Walling",
        "SERE Program",
        "Sleep Deprivation"
      ],
      "seeds": [
        "Enhanced Interrogation Techniques",
        "Waterboarding"
      ],
      "termInfo": {
        "Enhanced Interrogation Techniques": {
          "text": "The euphemism for the CIA's memo-authorized set of coercive methods, including waterboarding, walling, and prolonged sleep deprivation.",
          "links": [
            {
              "href": "wiki:Enhanced interrogation techniques"
            }
          ]
        },
        "SERE Program": {
          "text": "Military training designed to help personnel resist interrogation if captured; its techniques were reverse-engineered for offensive use against detainees.",
          "links": [
            {
              "href": "wiki:Survival, Evasion, Resistance and Escape"
            }
          ]
        },
        "Sleep Deprivation": {
          "text": "Prolonged forced wakefulness, authorized for up to 180 hours at a time as an interrogation technique.",
          "links": [
            {
              "href": "wiki:Sleep deprivation"
            }
          ]
        },
        "Walling": {
          "text": "A technique in which a detainee's neck is encircled by a collar and used to slam them against a wall.",
          "links": [
            {
              "href": "wiki:Walling"
            }
          ]
        },
        "Waterboarding": {
          "text": "A technique simulating drowning, the most publicly notorious of the authorized methods.",
          "links": [
            {
              "href": "wiki:Waterboarding"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "unlawful-enemy-combatant",
      "term": "Unlawful Enemy Combatant",
      "clusters": [
        0,
        1
      ],
      "fact": "The administration's determination that captured al-Qaeda and Taliban fighters were unlawful enemy combatants, outside the Geneva Conventions' protections, supplied the legal basis for holding them in military custody without charge or prisoner-of-war status; the 2004 tribunals at Guantanamo existed to rule on that same status.",
      "info": {
        "text": "A legal classification placing a detainee outside the categories that would guarantee Geneva Convention protections or judicial review.",
        "links": [
          {
            "href": "wiki:Unlawful combatant"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "Combatant Status Review Tribunals"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "golden-shield",
      "term": "Golden Shield",
      "clusters": [
        0,
        3
      ],
      "fact": "The Office of Legal Counsel's opinions served as advance legal cover that CIA interrogators relied on before using the authorized techniques, so that officers could act without facing prosecution under the torture statute.",
      "info": {
        "text": "Jack Goldsmith's phrase, in The Terror Presidency, for how agencies regarded a formal Office of Legal Counsel opinion: as protection in advance for anyone who acted within it. Goldsmith headed the office from late 2003 and withdrew the Bybee memo in 2004.",
        "links": [
          {
            "href": "wiki:Torture Memos"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Bybee Memo",
        "Enhanced Interrogation Techniques"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "ghost-detainees",
      "term": "Ghost Detainees",
      "clusters": [
        2,
        1
      ],
      "fact": "CIA prisoners were held inside military prisons, Abu Ghraib among them, without being registered, and were moved or hidden when the Red Cross visited -- secret detention operating inside the prisons that were supposed to be open to inspection.",
      "info": {
        "text": "A detainee held off official registries and hidden from the Red Cross, specifically to keep their interrogation outside any accountability structure.",
        "links": [
          {
            "href": "wiki:Ghost detainee"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "Red Cross Access"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "high-value-detainees",
      "term": "High-Value Detainees",
      "clusters": [
        2,
        1
      ],
      "fact": "In September 2006 President Bush publicly acknowledged the CIA detention program and transferred fourteen of its prisoners from the black sites to Guantanamo, where the Red Cross was able to see them for the first time.",
      "info": {
        "text": "The CIA's term for the senior al-Qaeda suspects it held longest in its secret prisons, fourteen of whom were moved to Guantanamo in 2006.",
        "links": [
          {
            "href": "wiki:High-value detainee"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "CIA Black Sites",
        "Guantanamo Bay Detention Camp"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "torture",
      "term": "Torture",
      "clusters": [
        1,
        2,
        3
      ],
      "fact": "What the memos defined away was done in both kinds of prison. CIA interrogators waterboarded prisoners at black sites; at Abu Ghraib, techniques Rumsfeld had approved for Guantanamo in December 2002, carried to Iraq by Guantanamo's commander in 2003, were used on prisoners. A 2008 Senate Armed Services Committee report found the abuse was not simply the work of a few soldiers acting on their own.",
      "info": {
        "text": "Severe physical or mental pain or suffering deliberately inflicted on a person in custody, prohibited absolutely by the Convention against Torture and by U.S. law. Enhanced interrogation techniques was the program's name for it.",
        "links": [
          {
            "href": "wiki:Torture"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "Abu Ghraib",
        "CIA Black Sites",
        "Enhanced Interrogation Techniques"
      ]
    }
  ],
  "lenses": [
    {
      "id": "concealment-from-oversight",
      "prompt": "Which concepts kept prisoners hidden from the Red Cross?",
      "explanation": "Secret prisons abroad, transfers into other countries' custody, detention with no outside contact, and prisoners kept off the rolls even inside military prisons: each removed a prisoner from the one outside check that ordinarily reaches anyone held in wartime. Guantanamo, for all its other purposes, was visited by the Red Cross from 2002.",
      "targets": [
        "CIA Black Sites",
        "Extraordinary Rendition",
        "Incommunicado Detention",
        "Ghost Detainees"
      ]
    },
    {
      "id": "crossing-the-line",
      "prompt": "Which concepts describe CIA prisoners inside military custody?",
      "explanation": "Ghost detainees were CIA prisoners hidden inside military prisons, off the books and away from the Red Cross. The high-value detainees crossed the same line in the opposite spirit: in 2006 they were moved into Guantanamo openly, and the Red Cross reached them for the first time. One crossing kept the secret; the other ended it.",
      "targets": [
        "Ghost Detainees",
        "High-Value Detainees"
      ]
    },
    {
      "id": "memo-to-method",
      "prompt": "Which specific techniques did the Office of Legal Counsel approve for CIA interrogators in August 2002?",
      "explanation": "A companion opinion issued the same month as the Bybee memo, addressed to the CIA, approved a list of named techniques, these three among them. Enhanced interrogation techniques is the program's euphemism for the whole list, not a method on it.",
      "targets": [
        "Waterboarding",
        "Walling",
        "Sleep Deprivation"
      ]
    },
    {
      "id": "where-the-methods-came-from",
      "prompt": "Which concept names the training the interrogation methods were adapted from?",
      "explanation": "SERE training exposes U.S. service members to the abuse an enemy that ignored the Geneva Conventions might inflict, so they can learn to endure it. The program turned that catalogue of an enemy's conduct into its own methods.",
      "targets": [
        "SERE Program"
      ]
    },
    {
      "id": "the-word-avoided",
      "prompt": "Which concept names what the program's euphemism stood for?",
      "explanation": "The memos' work was to keep this word from applying. It applies anyway, in the secret prisons and the acknowledged ones alike.",
      "targets": [
        "Torture"
      ]
    },
    {
      "id": "permissiveness-cascade",
      "prompt": "Which concepts carried a decision by senior officials into what was done to prisoners far from Washington?",
      "explanation": "A classification decided in Washington let prisoners be held outside the Geneva Conventions; a legal opinion let interrogators act without fear of prosecution; and techniques a defense secretary approved for Guantanamo reached a prison in Iraq. Each carried a decision made at the top into a cell somewhere else, which is why responsibility for what happened there does not stop with the people in the room.",
      "targets": [
        "Unlawful Enemy Combatant",
        "Golden Shield",
        "Abu Ghraib"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Permission Written in Advance",
    "summary": "How legal opinions written after September 11 turned a decision to use coercion into something officers could treat as lawful before they acted.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "## What a legal opinion is for\r\n\r\nOrdinarily a government lawyer's opinion describes the law: here is what a statute forbids, here is where the line falls. In the months after September 11, 2001, lawyers in the U.S. executive branch wrote opinions that ran the other way. The decision to use coercion on prisoners came first. The opinions were written so that the people carrying it out could treat it as lawful before they began.\r\n\r\nWhich office wrote them mattered. The Justice Department's Office of Legal Counsel issues opinions that the rest of the executive branch treats as binding. In August 2002 it produced what is now called the Bybee memo, drafted by John Yoo and signed by Jay Bybee. It defined torture so narrowly that only pain on the scale of organ failure or death would count. It also argued, drawing on the unitary executive theory, that statutes against torture could not restrict the president's power as commander in chief to direct interrogations.\r\n\r\n## Two kinds of prison\r\n\r\nA narrow definition protects an interrogator only if the prisoner's own protections are gone too. Early in 2002 the administration decided that captured al-Qaeda and Taliban fighters were unlawful enemy combatants, a status it argued put them outside the Geneva Conventions.\r\n\r\nThe military prison at Guantanamo Bay opened that January, chosen partly because the administration argued U.S. courts could not reach it. It was still an acknowledged prison: prisoners were registered, and the International Committee of the Red Cross, whose visits are the ordinary check on how prisoners are treated, began visiting that year. The CIA built a second system with none of that. From 2002 it ran black sites, secret prisons in other countries, and moved people between them, or into the hands of foreign governments known to torture, by extraordinary rendition. Its prisoners were held incommunicado, with no contact with family or lawyers and no acknowledgment that they were held at all. International law calls that enforced disappearance.\r\n\r\nThe two systems were not sealed off from each other. CIA prisoners were sometimes kept inside military prisons without being registered, ghost detainees moved out of sight when the Red Cross came. In 2004 the Supreme Court rejected the Guantanamo argument and allowed prisoners there to challenge their detention in federal court, and the Pentagon set up combatant status review tribunals to rule on each prisoner's status. The black sites had been running for two years by then, and nothing in that ruling reached them. Only in September 2006 did President Bush acknowledge the CIA program and move fourteen of its high-value detainees to Guantanamo, where the Red Cross saw them for the first time.\r\n\r\n## Where the methods came from\r\n\r\nThe program called its methods enhanced interrogation techniques. The plain word for them is torture. They included waterboarding, which simulates drowning; walling, in which a collar around the neck is used to slam a prisoner into a wall; and sleep deprivation authorized for up to 180 hours. None of them was devised for the program. They came from SERE, the military's Survival, Evasion, Resistance and Escape training, which exposes service members to what an enemy that ignored the Geneva Conventions might do to them, so they can learn to endure it. Methods the U.S. military had studied as the conduct of lawless captors became methods the United States used.\r\n\r\n## The shield, and where the methods traveled\r\n\r\nCIA officers wanted the opinions in hand before they acted. Jack Goldsmith, who took over the Office of Legal Counsel in late 2003 and withdrew the Bybee memo the following year, later described how agencies regarded opinions like these: as golden shields, protection in advance for anyone who acted within them. The shield held. In 2009 the Justice Department announced it would not prosecute officers who had relied in good faith on the department's own legal guidance.\r\n\r\nThe methods also traveled into the acknowledged prisons. In December 2002 Defense Secretary Donald Rumsfeld approved harsher techniques for Guantanamo, several drawn from the same SERE training. In 2003 Guantanamo's commander was sent to Iraq to bring its practices with him, and that September the U.S. command in Iraq issued an interrogation policy that drew on them. At Abu Ghraib, photographs published in 2004 showed prisoners stripped, held in stress positions, and threatened with dogs. A 2008 Senate Armed Services Committee report found that this was not simply the work of a few soldiers acting on their own: those techniques reached Iraq only after senior officials had approved them elsewhere. Being acknowledged had not protected anyone.\r\n\r\nEach link in this chain could point to another. The interrogators had a legal opinion. The lawyers could say they had only given advice. The officials who asked for that advice had the lawyers' word. When every participant can name someone else who made it permissible, where does the responsibility go?"
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      },
      {
        "name": "Claude (Opus 5)",
        "model": "Claude Opus 5"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:e4168234",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Bybee Memo": {
          "x": 677.56,
          "y": 124.8,
          "pinned": false
        },
        "term:Office of Legal Counsel": {
          "x": 790.25,
          "y": 23,
          "pinned": false
        },
        "term:John Yoo": {
          "x": 633.09,
          "y": 30.03,
          "pinned": false
        },
        "term:Unitary Executive Theory": {
          "x": 825.34,
          "y": 215.81,
          "pinned": false
        },
        "term:Guantanamo Bay Detention Camp": {
          "x": 659.87,
          "y": 591.93,
          "pinned": true
        },
        "term:Abu Ghraib": {
          "x": 598.05,
          "y": 426.19,
          "pinned": false
        },
        "term:Red Cross Access": {
          "x": 403.99,
          "y": 591.99,
          "pinned": true
        },
        "term:Combatant Status Review Tribunals": {
          "x": 782.94,
          "y": 446.52,
          "pinned": false
        },
        "term:CIA Black Sites": {
          "x": 309.91,
          "y": 381.98,
          "pinned": false
        },
        "term:Extraordinary Rendition": {
          "x": 117.73,
          "y": 472.42,
          "pinned": false
        },
        "term:Incommunicado Detention": {
          "x": 171.53,
          "y": 287.19,
          "pinned": false
        },
        "term:Enhanced Interrogation Techniques": {
          "x": 375.64,
          "y": 193.96,
          "pinned": false
        },
        "term:Waterboarding": {
          "x": 477.11,
          "y": 26.47,
          "pinned": false
        },
        "term:Walling": {
          "x": 366.32,
          "y": 23,
          "pinned": false
        },
        "term:SERE Program": {
          "x": 147.95,
          "y": 130.71,
          "pinned": false
        },
        "term:Sleep Deprivation": {
          "x": 243.03,
          "y": 28.84,
          "pinned": false
        },
        "term:Unlawful Enemy Combatant": {
          "x": 634.81,
          "y": 273.82,
          "pinned": false
        },
        "term:Golden Shield": {
          "x": 526.13,
          "y": 115.69,
          "pinned": true
        },
        "term:Ghost Detainees": {
          "x": 278.27,
          "y": 520.92,
          "pinned": false
        },
        "term:High-Value Detainees": {
          "x": 456.91,
          "y": 446.02,
          "pinned": false
        },
        "term:Torture": {
          "x": 496.43,
          "y": 318.98,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4905.17,
        "score": 4905.165514720557
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T07:58:01.738Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:e4168234",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 796.86,
          "y": 503.77,
          "pinned": true
        },
        "cluster:1": {
          "x": 438.25,
          "y": 473.7,
          "pinned": true
        },
        "cluster:2": {
          "x": 163.92,
          "y": 182.35,
          "pinned": true
        },
        "cluster:3": {
          "x": 826.28,
          "y": 188.1,
          "pinned": false
        }
      },
      "bridges": {
        "term:Unlawful Enemy Combatant": {
          "x": 672.32,
          "y": 357.05,
          "pinned": true
        },
        "term:Golden Shield": {
          "x": 947.89,
          "y": 371.12,
          "pinned": true
        },
        "term:Ghost Detainees": {
          "x": 100.79,
          "y": 397.54,
          "pinned": true
        },
        "term:High-Value Detainees": {
          "x": 333.19,
          "y": 300.35,
          "pinned": true
        },
        "term:Torture": {
          "x": 571.01,
          "y": 278.9,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Bybee Memo",
          "Office of Legal Counsel",
          "John Yoo",
          "Unitary Executive Theory"
        ],
        "cluster:1": [
          "Guantanamo Bay Detention Camp",
          "Abu Ghraib",
          "Red Cross Access",
          "Combatant Status Review Tribunals"
        ],
        "cluster:2": [
          "CIA Black Sites",
          "Extraordinary Rendition",
          "Incommunicado Detention"
        ],
        "cluster:3": [
          "Enhanced Interrogation Techniques",
          "Waterboarding",
          "Walling",
          "SERE Program",
          "Sleep Deprivation"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Bybee Memo",
          "Unitary Executive Theory",
          "Office of Legal Counsel",
          "John Yoo"
        ],
        "cluster:1": [
          "Abu Ghraib",
          "Guantanamo Bay Detention Camp",
          "Combatant Status Review Tribunals",
          "Red Cross Access"
        ],
        "cluster:2": [
          "Incommunicado Detention",
          "Extraordinary Rendition",
          "CIA Black Sites"
        ],
        "cluster:3": [
          "Walling",
          "Waterboarding",
          "Enhanced Interrogation Techniques",
          "Sleep Deprivation",
          "SERE Program"
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
        "edgeNodeIntersections": 0,
        "totalLength": 1922.6482455547982
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-19T08:03:04.188Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "golden-shields",
      "puzzleRevision": "fnv1a32:e4168234",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:Bybee Memo": {
          "x": 676.92,
          "y": 150.75
        },
        "term:Office of Legal Counsel": {
          "x": 892.55,
          "y": 206.82
        },
        "term:John Yoo": {
          "x": 904.73,
          "y": 52.16
        },
        "term:Unitary Executive Theory": {
          "x": 693.52,
          "y": 50.03
        },
        "term:Guantanamo Bay Detention Camp": {
          "x": 553.03,
          "y": 483.73
        },
        "term:Abu Ghraib": {
          "x": 520.65,
          "y": 331.15
        },
        "term:Red Cross Access": {
          "x": 833.43,
          "y": 454.84
        },
        "term:Combatant Status Review Tribunals": {
          "x": 770.7,
          "y": 326.42
        },
        "term:CIA Black Sites": {
          "x": 139.35,
          "y": 366.48
        },
        "term:Extraordinary Rendition": {
          "x": 321.49,
          "y": 597.96
        },
        "term:Incommunicado Detention": {
          "x": 125.09,
          "y": 597.69
        },
        "term:Enhanced Interrogation Techniques": {
          "x": 303.71,
          "y": 173.12
        },
        "term:Waterboarding": {
          "x": 278.66,
          "y": 41.01
        },
        "term:Walling": {
          "x": 422.53,
          "y": 45.02
        },
        "term:SERE Program": {
          "x": 93.82,
          "y": 157.01
        },
        "term:Sleep Deprivation": {
          "x": 110.58,
          "y": 41.01
        },
        "term:Unlawful Enemy Combatant": {
          "x": 651.82,
          "y": 235.43
        },
        "term:Golden Shield": {
          "x": 522.05,
          "y": 101.55
        },
        "term:Ghost Detainees": {
          "x": 491.54,
          "y": 597.6
        },
        "term:High-Value Detainees": {
          "x": 372.28,
          "y": 391.39
        },
        "term:Torture": {
          "x": 306.55,
          "y": 258.26
        },
        "cluster:0": {
          "x": 835.24,
          "y": 128.19
        },
        "cluster:1": {
          "x": 631.37,
          "y": 420.17
        },
        "cluster:2": {
          "x": 208.4,
          "y": 478.72
        },
        "cluster:3": {
          "x": 236.42,
          "y": 105.04
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T08:04:06.760Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-19T08:01:29.138Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
