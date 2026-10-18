// Generated from content/puzzles/as-soon-as-made-ready.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "as-soon-as-made-ready",
  "title": "As Soon As Made Ready",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "history-society"
  ],
  "subcategories": {
    "peace-conflict-studies": "war-militarism"
  },
  "info": {
    "text": "The Hiroshima bombing was a unique horror unleashed on the world. This puzzle doesn't condone massive civilian casualty counts as being the only possible way to end the war. It examines a narrower, documented question: the standing military order that authorized Nagasaki without any renewed presidential decision -- and a historiographical dispute that has run for decades, still unresolved, over whether atomic weapons needed to be used against Japanese cities at all.",
    "citations": [
      {
        "title": "Racing the Enemy: Stalin, Truman, and the Surrender of Japan",
        "author": "Hasegawa, Tsuyoshi",
        "publisher": "Belknap Press",
        "year": "2005"
      }
    ]
  },
  "clusters": [
    {
      "id": "standing-order",
      "name": "The Standing Order",
      "color": "teal",
      "fact": "A single written order, signed not by the President but by an Army officer acting on his behalf, authorized 'additional bombs' to be delivered 'as soon as made ready' -- requiring no further decision for each city bombed.",
      "terms": [
        "Leslie Groves",
        "509th Composite Group",
        "Handy Directive",
        "Thomas Handy"
      ],
      "seeds": [
        "Leslie Groves",
        "509th Composite Group"
      ],
      "termInfo": {
        "509th Composite Group": {
          "text": "The U.S. Army Air Forces unit that carried out both atomic bombings, operating under the same standing order for each.",
          "links": [
            {
              "href": "wiki:509th Composite Group"
            }
          ]
        },
        "Handy Directive": {
          "text": "The July 25, 1945 order authorizing 'additional bombs' to be delivered 'as soon as made ready by the project staff,' with no further approval required.",
          "links": [
            {
              "href": "wiki:Order from General Thomas Handy to General Carl Spaatz authorizing the dropping of the first atomic bomb"
            }
          ]
        },
        "Leslie Groves": {
          "text": "The general who directed the Manhattan Project and drafted the order authorizing the bombings.",
          "links": [
            {
              "href": "wiki:Leslie Groves"
            }
          ]
        },
        "Thomas Handy": {
          "text": "The Acting Army Chief of Staff who signed the bombing order -- not Truman, whose name appears nowhere on it.",
          "links": [
            {
              "href": "wiki:Thomas T. Handy"
            }
          ]
        }
      }
    },
    {
      "id": "compressed-timeline",
      "name": "The Compressed Timeline",
      "color": "amber",
      "fact": "The interval between the two bombings was compressed by weather forecasting rather than deliberation: the mission was moved up from its original date, and the crew diverted from its primary target only when cloud cover obscured it over the city. An estimated 40,000 people were killed instantly when the bomb fell on Nagasaki instead, with the death toll reaching roughly 70,000 by the end of the year.",
      "terms": [
        "Kokura",
        "Fat Man",
        "Three-Day Interval",
        "Hibakusha"
      ],
      "seeds": [
        "Kokura",
        "Fat Man"
      ],
      "termInfo": {
        "Fat Man": {
          "text": "The plutonium implosion-type bomb dropped on Nagasaki, killing tens of thousands of civilians within its first day. Because its design differed from Hiroshima's, those deaths also gave the U.S. its first evidence of how a second, untested bomb design would perform against a city full of people.",
          "links": [
            {
              "href": "wiki:Fat Man"
            }
          ]
        },
        "Hibakusha": {
          "text": "Japanese for 'bomb-affected person' -- survivors of the bombings who carried lifelong injuries, radiation-linked illness, and, for decades, social discrimination in Japan.",
          "links": [
            {
              "href": "wiki:Hibakusha"
            }
          ]
        },
        "Kokura": {
          "text": "The primary target for the second bomb; the crew diverted to Nagasaki only after cloud cover obscured the city on the morning of the mission.",
          "links": [
            {
              "href": "wiki:Kokura"
            }
          ]
        },
        "Three-Day Interval": {
          "text": "The gap between Hiroshima and Nagasaki -- originally planned longer, compressed by a forecast of worsening weather.",
          "links": [
            {
              "href": "wiki:Atomic bombings of Hiroshima and Nagasaki"
            }
          ]
        }
      }
    },
    {
      "id": "historiographical-dispute",
      "name": "The Historiographical Dispute",
      "color": "blue",
      "fact": "Historians still dispute why Japan surrendered when it did: some point to the bombs themselves, others to the Soviet Union's entry into the war, and others to intercepted Japanese military communications showing genuine resistance to surrender even after both bombs fell.",
      "terms": [
        "Soviet Entry into the Pacific War",
        "Big Six",
        "MAGIC Intercepts",
        "Kyujo Incident"
      ],
      "seeds": [
        "Soviet Entry into the Pacific War",
        "Big Six"
      ],
      "termInfo": {
        "Big Six": {
          "text": "The informal name for Japan's Supreme Council for the Direction of the War, still deadlocked over surrender terms after both bombs fell.",
          "links": [
            {
              "href": "wiki:Supreme War Council (Japan)"
            }
          ]
        },
        "Kyujo Incident": {
          "text": "A failed coup by Army officers on the night of August 14-15, 1945, attempting to seize the Imperial Palace and prevent the surrender broadcast.",
          "links": [
            {
              "href": "wiki:Kyūjō incident"
            }
          ]
        },
        "MAGIC Intercepts": {
          "text": "Decoded Japanese military communications that traditionalist historians cite as evidence Japan's military leadership had not genuinely reconciled itself to surrender.",
          "links": [
            {
              "href": "wiki:Magic (cryptography)"
            }
          ]
        },
        "Soviet Entry into the Pacific War": {
          "text": "The Soviet Union's declaration of war and invasion of Japanese-held territory, which some historians argue was the decisive factor in ending the war, not the bombs.",
          "links": [
            {
              "href": "wiki:Soviet–Japanese War (1945)"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "truman-s-august-10-intervention",
      "term": "Truman's August 10 Intervention",
      "clusters": [
        0,
        1
      ],
      "fact": "Only after Nagasaki did Truman personally assert control, ordering that no further atomic bomb be dropped without his explicit authorization -- revealing that the standing order, not a presidential decision, had governed the timeline up to that point.",
      "info": {
        "text": "On August 10, 1945, one day after Nagasaki, Truman ordered that no further atomic bomb be dropped without his explicit authorization -- the first personal decision he made regarding either bombing.",
        "links": [
          {
            "href": "wiki:Atomic bombings of Hiroshima and Nagasaki"
          }
        ]
      },
      "relationKind": "dynamic"
    },
    {
      "id": "verification-delay",
      "term": "Verification Delay",
      "clusters": [
        1,
        2
      ],
      "fact": "Japan's own scientific confirmation that Hiroshima was an atomic weapon did not reach military command until August 10th -- a full day after Nagasaki was already bombed -- meaning the government lacked even confirmed technical verification of the first attack when the second one occurred.",
      "info": {
        "text": "Physicist Yoshio Nishina's investigating team confirmed to military command that Hiroshima had been hit by an atomic weapon -- on August 10th, a day after Nagasaki was already destroyed.",
        "links": [
          {
            "href": "wiki:Yoshio Nishina"
          }
        ]
      },
      "relationKind": "evaluation",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "the-august-9-convergence",
      "term": "The August 9 Convergence",
      "clusters": [
        2,
        0
      ],
      "fact": "The Soviet invasion of Manchuria and the Nagasaki bombing landed within hours of each other -- a convergence produced by a pre-set military order running on its own schedule, not by a coordinated presidential response to Soviet entry.",
      "info": {
        "text": "Hasegawa's central argument: the near-simultaneous timing of Nagasaki and the Soviet invasion was coincidence, not coordination, which is exactly what makes isolating either as 'the' cause of surrender so difficult.",
        "links": [
          {
            "href": "wiki:Soviet invasion of Manchuria"
          }
        ]
      },
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "the-missing-decision-point",
      "prompt": "Which concepts show a moment when a deliberate decision could have been made, but wasn't?",
      "explanation": "None of these represents a choice made in response to new information as it arrived. The order was blanket-authorized before Hiroshima was even dropped; Truman only asserted control after Nagasaki; Japan's own confirmation of Hiroshima arrived after Nagasaki was already gone; and the Soviet declaration landed within hours of the bombing by coincidence of a pre-set schedule, not by design. At every point where a decision could have been reconsidered, none was. That's the question this puzzle is actually built around: not whether atomic weapons should have been used against Japan at all, but whether the second one specifically -- authorized automatically, on a compressed timeline, without renewed deliberation -- represented anyone's actual choice.",
      "targets": [
        "Handy Directive",
        "Truman's August 10 Intervention",
        "Verification Delay",
        "The August 9 Convergence"
      ]
    },
    {
      "id": "evidence-for-necessity",
      "prompt": "Which concepts are the strongest evidence of sustained, genuine resistance to surrender within Japan's military leadership?",
      "explanation": "These span different moments and don't depend on Japan having confirmed what kind of weapon was used. Traditionalist historians read the MAGIC intercepts as evidence that Japan's peace feelers toward Moscow, sent well before either bomb fell, stopped short of any real offer of unconditional surrender. The Big Six were still deadlocked on August 9th, the day of Nagasaki -- before Japan's own scientists had even confirmed Hiroshima was an atomic weapon. And hardline officers attempted a coup on August 14th-15th, after the Emperor himself had already decided to surrender. Together these show some resistance had persisted independent of when, or whether, leadership had confirmed what had happened. Historians weigh this evidence very differently, and it speaks to whether atomic bombing was necessary to end the war at all -- a broader question than whether the second bombing specifically was necessary.",
      "targets": [
        "MAGIC Intercepts",
        "Big Six",
        "Kyujo Incident"
      ]
    },
    {
      "id": "coincidence-or-cause",
      "prompt": "Which concepts illustrate why the near-simultaneous timing of events in early August 1945 makes it hard to isolate a single cause of Japan's surrender?",
      "explanation": "The Nagasaki bombing, the Soviet invasion of Manchuria, and Japan's own compressed, weather-driven timeline all converged within about 72 hours of each other. That convergence is exactly what makes a clean causal claim -- 'the bomb ended the war' or 'Soviet entry ended the war' -- difficult to sustain with confidence.",
      "targets": [
        "Soviet Entry into the Pacific War",
        "The August 9 Convergence",
        "Three-Day Interval",
        "Kokura"
      ]
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "as-soon-as-made-ready",
      "puzzleRevision": "fnv1a32:d8b61788",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:Leslie Groves": {
          "x": 399.3,
          "y": 108.97,
          "pinned": false
        },
        "term:509th Composite Group": {
          "x": 88.15,
          "y": 133.64,
          "pinned": false
        },
        "term:Handy Directive": {
          "x": 190.74,
          "y": 23,
          "pinned": false
        },
        "term:Thomas Handy": {
          "x": 323.64,
          "y": 23,
          "pinned": false
        },
        "term:Kokura": {
          "x": 174.47,
          "y": 372.07,
          "pinned": false
        },
        "term:Fat Man": {
          "x": 141.7,
          "y": 437,
          "pinned": false
        },
        "term:Three-Day Interval": {
          "x": 78.7,
          "y": 303.73,
          "pinned": false
        },
        "term:Hibakusha": {
          "x": 50.35,
          "y": 433.57,
          "pinned": false
        },
        "term:Soviet Entry into the Pacific War": {
          "x": 514.05,
          "y": 261.24,
          "pinned": false
        },
        "term:Big Six": {
          "x": 595.95,
          "y": 128.56,
          "pinned": false
        },
        "term:MAGIC Intercepts": {
          "x": 430.13,
          "y": 437,
          "pinned": false
        },
        "term:Kyujo Incident": {
          "x": 573.9,
          "y": 437,
          "pinned": false
        },
        "term:Truman's August 10 Intervention": {
          "x": 266.47,
          "y": 238.04,
          "pinned": false
        },
        "term:Verification Delay": {
          "x": 275.08,
          "y": 437,
          "pinned": false
        },
        "term:The August 9 Convergence": {
          "x": 534.21,
          "y": 23,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3221.51,
        "score": 3221.505487381187
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:33:30.105Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "as-soon-as-made-ready",
      "puzzleRevision": "fnv1a32:d8b61788",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 718.07,
          "y": 381.68,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 190.63,
          "pinned": false
        },
        "cluster:2": {
          "x": 241.93,
          "y": 381.68,
          "pinned": false
        }
      },
      "bridges": {
        "term:Truman's August 10 Intervention": {
          "x": 695.12,
          "y": 246.36,
          "pinned": false
        },
        "term:Verification Delay": {
          "x": 287.43,
          "y": 212.62,
          "pinned": false
        },
        "term:The August 9 Convergence": {
          "x": 508,
          "y": 381.68,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Leslie Groves",
          "509th Composite Group",
          "Handy Directive",
          "Thomas Handy"
        ],
        "cluster:1": [
          "Kokura",
          "Fat Man",
          "Three-Day Interval",
          "Hibakusha"
        ],
        "cluster:2": [
          "Soviet Entry into the Pacific War",
          "Big Six",
          "MAGIC Intercepts",
          "Kyujo Incident"
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
        "totalLength": 498.4835082374716
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:33:33.139Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "as-soon-as-made-ready",
      "puzzleRevision": "fnv1a32:d8b61788",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Leslie Groves": {
          "x": 352.49,
          "y": 598
        },
        "term:509th Composite Group": {
          "x": 167.38,
          "y": 598
        },
        "term:Handy Directive": {
          "x": 128.3,
          "y": 438.34
        },
        "term:Thomas Handy": {
          "x": 57.8,
          "y": 324.22
        },
        "term:Kokura": {
          "x": 104.98,
          "y": 154.43
        },
        "term:Fat Man": {
          "x": 181.72,
          "y": 102.13
        },
        "term:Three-Day Interval": {
          "x": 284.96,
          "y": 22
        },
        "term:Hibakusha": {
          "x": 421.71,
          "y": 22
        },
        "term:Soviet Entry into the Pacific War": {
          "x": 836.05,
          "y": 259.44
        },
        "term:Big Six": {
          "x": 837.78,
          "y": 442.17
        },
        "term:MAGIC Intercepts": {
          "x": 782.79,
          "y": 553.81
        },
        "term:Kyujo Incident": {
          "x": 644.11,
          "y": 598
        },
        "term:Truman's August 10 Intervention": {
          "x": 230.74,
          "y": 266.65
        },
        "term:Verification Delay": {
          "x": 599.97,
          "y": 221.76
        },
        "term:The August 9 Convergence": {
          "x": 433.84,
          "y": 364.25
        },
        "cluster:0": {
          "x": 281.2,
          "y": 466.96
        },
        "cluster:1": {
          "x": 428.02,
          "y": 164.57
        },
        "cluster:2": {
          "x": 646.17,
          "y": 416.44
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:33:35.686Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:33:27.199Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
