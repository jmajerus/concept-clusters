// Generated from content/puzzles/the-military-industrial-complex.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-military-industrial-complex",
  "title": "The Military-Industrial Complex",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "history-society"
  ],
  "subcategories": {
    "peace-conflict-studies": "war-militarism",
    "political-science": "public-policy"
  },
  "tags": [
    "speech",
    "war"
  ],
  "info": {
    "text": "Dwight Eisenhower's warning that a permanent alliance between the armed forces and the arms industry -- and a parallel one between government funding and scientific research -- could quietly acquire more influence over American life than any citizen ever voted for.",
    "links": [
      {
        "href": "wiki:Dwight D. Eisenhower's farewell address"
      }
    ],
    "citations": [
      {
        "title": "Farewell Address to the Nation",
        "author": "Eisenhower, Dwight D.",
        "year": "1961"
      }
    ]
  },
  "clusters": [
    {
      "id": "an-industry-new-to-america",
      "name": "An Industry New to America",
      "color": "olive",
      "fact": "Eisenhower opens by noting something historically new: before this era, the United States kept no permanent armaments industry, relying instead on wartime improvisation -- converting civilian 'makers of plowshares' into makers of swords as needed -- but the Cold War, he argues, no longer permits that improvisation, so a standing arms industry and a new scale of defense spending have become permanent fixtures of American life.",
      "terms": [
        "permanent armaments industry",
        "wartime improvisation",
        "defense spending"
      ],
      "seeds": [
        "permanent armaments industry",
        "wartime improvisation"
      ],
      "info": {
        "text": "Eisenhower's premise: for most of American history the country had no standing arms industry, but the Cold War made a permanent one seem unavoidable.",
        "links": [
          {
            "href": "wiki:Arms industry"
          }
        ]
      }
    },
    {
      "id": "military-industrial-complex",
      "name": "The Military-Industrial Complex",
      "color": "magenta",
      "fact": "Eisenhower names the conjunction of an immense military establishment and a large arms industry the military-industrial complex, warns that government must guard against its unwarranted influence, and describes its total influence -- economic, political, even spiritual -- as already felt in every city, every statehouse, and every federal office; the potential for a disastrous rise of misplaced power, he says, exists and will persist.",
      "terms": [
        "military-industrial complex",
        "unwarranted influence",
        "misplaced power",
        "total influence"
      ],
      "seeds": [
        "military-industrial complex",
        "unwarranted influence"
      ],
      "termInfo": {
        "military-industrial complex": {
          "text": "Eisenhower's own term for the conjunction of an immense military establishment and a large, permanent arms industry -- and the specific danger of unchecked influence that conjunction creates.",
          "links": [
            {
              "href": "wiki:Military–industrial complex"
            }
          ]
        }
      },
      "info": {
        "text": "Eisenhower's central warning: an alliance between the armed forces and the arms industry has become powerful enough to be felt, in his words, in every city, every statehouse, and every federal office.",
        "links": [
          {
            "href": "wiki:Military–industrial complex"
          }
        ]
      }
    },
    {
      "id": "the-scientific-technological-elite",
      "name": "The Scientific-Technological Elite",
      "color": "teal",
      "fact": "Eisenhower pairs his famous warning about arms and industry with a second, less-quoted one: as research grows costlier and increasingly funded by the federal government, the solitary inventor tinkering alone gives way to organized task forces of scientists, a government contract risks substituting for a researcher's own intellectual curiosity, and public policy itself risks becoming captive to a scientific-technological elite.",
      "terms": [
        "scientific-technological elite",
        "federal research funding",
        "solitary inventor"
      ],
      "seeds": [
        "scientific-technological elite",
        "federal research funding"
      ],
      "termInfo": {
        "scientific-technological elite": {
          "text": "Eisenhower's own phrase for a class of scientists and technical experts whose influence over government research funding could let them capture public policy, much as arms manufacturers might capture defense policy.",
          "links": [
            {
              "href": "wiki:Technocracy"
            }
          ]
        }
      },
      "info": {
        "text": "Eisenhower's second, less-quoted warning: that as scientific research becomes centralized and government-funded, public policy risks capture by a new kind of elite, just as surely as it risks capture by arms manufacturers."
      }
    },
    {
      "id": "balance-and-the-citizens-check",
      "name": "Balance and the Citizen's Check",
      "color": "brown",
      "fact": "Eisenhower's remedy for both dangers is the same: balance -- between the private and public economy, the necessary and the merely desirable, the present moment and the future -- upheld by an alert and knowledgeable citizenry, since mortgaging the future to serve the present risks the next generation's political and spiritual inheritance along with its material one.",
      "terms": [
        "alert and knowledgeable citizenry",
        "balance",
        "mortgaging the future"
      ],
      "seeds": [
        "alert and knowledgeable citizenry",
        "balance"
      ],
      "termInfo": {
        "mortgaging the future": {
          "text": "Spending or risking the next generation's resources and freedoms to solve today's problems -- Eisenhower's warning that balance must hold across time, not just among competing programs.",
          "links": [
            {
              "href": "wiki:Intergenerational equity"
            }
          ]
        }
      },
      "info": {
        "text": "Eisenhower's proposed safeguard against both dangers: a citizenry alert enough to demand balance, including balance across time."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-immense-military-establishment",
      "term": "immense military establishment",
      "clusters": [
        0,
        1
      ],
      "fact": "The permanent armaments industry Eisenhower calls historically new pairs with an equally new, permanent military establishment to form the conjunction he names the military-industrial complex -- neither the industry nor the establishment alone is the danger he's naming; it's their combination.",
      "relationKind": "foundation",
      "idealTerms": [
        "permanent armaments industry",
        "military-industrial complex"
      ]
    },
    {
      "id": "bridge-the-technological-revolution",
      "term": "the technological revolution",
      "clusters": [
        1,
        2
      ],
      "fact": "Eisenhower ties both of his warnings to one shared root: a technological revolution in defense research is what gave the military-industrial complex its modern scale, and that same revolution is what now risks letting a scientific-technological elite capture public policy in turn.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "scientific-technological elite"
      ]
    },
    {
      "id": "bridge-proper-meshing",
      "term": "proper meshing",
      "clusters": [
        3,
        1
      ],
      "fact": "Eisenhower's proposed check on the military-industrial complex is civic rather than institutional: only an alert and knowledgeable citizenry, he argues, can compel the proper meshing of the huge industrial and military machinery of defense with the nation's peaceful methods and goals.",
      "relationKind": "dynamic",
      "idealTerms": [
        "alert and knowledgeable citizenry",
        "unwarranted influence"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    }
  ],
  "lenses": [
    {
      "id": "a-historical-break",
      "prompt": "Which concepts does Eisenhower explicitly frame as historically new -- a genuine break from America's past -- rather than a timeless virtue or an old, recurring danger?",
      "explanation": "Eisenhower's speech turns on a claim about historical rupture: for most of American history the country kept no standing arms industry and no permanent military establishment on this scale, and it's specifically this novelty -- not war, industry, or science in the abstract -- that he says demands a new kind of vigilance. Balance and an alert citizenry, by contrast, are old civic virtues he's calling back into service, not new threats.",
      "targets": [
        "permanent armaments industry",
        "defense spending",
        "military-industrial complex",
        "total influence",
        "scientific-technological elite"
      ]
    },
    {
      "id": "the-proposed-remedy",
      "prompt": "Which concepts name the safeguard Eisenhower proposes, rather than a danger he warns against?",
      "explanation": "Balance and an alert citizenry are the same proposed remedy operating at two scales -- a general civic virtue, and a specific act of restraint aimed at meshing the machinery of defense with peaceful goals. Neither is a description of a danger; both are what Eisenhower asks of the people who have to live with one.",
      "targets": [
        "alert and knowledgeable citizenry",
        "balance",
        "proper meshing"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-without-a-center",
        "reason": "Eisenhower names a specific, growing danger with an address and a warning label; Foucault argues modern power has no such single address at all -- reading them together raises the real question of where, if anywhere, power like this can still be located and resisted.",
        "via": [
          "power",
          "institutions"
        ]
      }
    ]
  },
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
      "puzzleId": "the-military-industrial-complex",
      "puzzleRevision": "fnv1a32:de73baed",
      "board": {
        "width": 700,
        "height": 510
      },
      "nodes": {
        "term:permanent armaments industry": {
          "x": 386.6,
          "y": 23,
          "pinned": false
        },
        "term:wartime improvisation": {
          "x": 611.85,
          "y": 23,
          "pinned": false
        },
        "term:defense spending": {
          "x": 247.64,
          "y": 65.43,
          "pinned": false
        },
        "term:military-industrial complex": {
          "x": 592.95,
          "y": 373.24,
          "pinned": false
        },
        "term:unwarranted influence": {
          "x": 424.95,
          "y": 320.88,
          "pinned": false
        },
        "term:misplaced power": {
          "x": 630.75,
          "y": 227.28,
          "pinned": false
        },
        "term:total influence": {
          "x": 630.75,
          "y": 487,
          "pinned": false
        },
        "term:scientific-technological elite": {
          "x": 245.13,
          "y": 417.29,
          "pinned": false
        },
        "term:federal research funding": {
          "x": 97.6,
          "y": 487,
          "pinned": false
        },
        "term:solitary inventor": {
          "x": 75.55,
          "y": 351.79,
          "pinned": false
        },
        "term:alert and knowledgeable citizenry": {
          "x": 168.66,
          "y": 183.38,
          "pinned": false
        },
        "term:balance": {
          "x": 44.05,
          "y": 234.83,
          "pinned": false
        },
        "term:mortgaging the future": {
          "x": 88.15,
          "y": 23,
          "pinned": false
        },
        "term:immense military establishment": {
          "x": 547.56,
          "y": 155.48,
          "pinned": false
        },
        "term:the technological revolution": {
          "x": 450.92,
          "y": 487,
          "pinned": false
        },
        "term:proper meshing": {
          "x": 361.98,
          "y": 174.89,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3358.25,
        "score": 3358.2521202594344
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:28:13.492Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-military-industrial-complex",
      "puzzleRevision": "fnv1a32:de73baed",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 170.6,
          "y": 348,
          "pinned": false
        },
        "cluster:1": {
          "x": 530,
          "y": 178.99,
          "pinned": false
        },
        "cluster:2": {
          "x": 889.4,
          "y": 348,
          "pinned": false
        },
        "cluster:3": {
          "x": 530,
          "y": 517.01,
          "pinned": false
        }
      },
      "bridges": {
        "term:immense military establishment": {
          "x": 254.13,
          "y": 167.33,
          "pinned": false
        },
        "term:the technological revolution": {
          "x": 805.87,
          "y": 167.33,
          "pinned": false
        },
        "term:proper meshing": {
          "x": 666,
          "y": 348,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "permanent armaments industry",
          "wartime improvisation",
          "defense spending"
        ],
        "cluster:1": [
          "military-industrial complex",
          "unwarranted influence",
          "misplaced power",
          "total influence"
        ],
        "cluster:2": [
          "scientific-technological elite",
          "federal research funding",
          "solitary inventor"
        ],
        "cluster:3": [
          "alert and knowledgeable citizenry",
          "balance",
          "mortgaging the future"
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
        "totalLength": 491.5366720785428
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:28:15.890Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-military-industrial-complex",
      "puzzleRevision": "fnv1a32:de73baed",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:permanent armaments industry": {
          "x": 771,
          "y": 22
        },
        "term:wartime improvisation": {
          "x": 225.12,
          "y": 22
        },
        "term:defense spending": {
          "x": 581.36,
          "y": 22
        },
        "term:military-industrial complex": {
          "x": 952.05,
          "y": 155.38
        },
        "term:unwarranted influence": {
          "x": 604.51,
          "y": 407.61
        },
        "term:misplaced power": {
          "x": 992.75,
          "y": 332.07
        },
        "term:total influence": {
          "x": 957.15,
          "y": 471.66
        },
        "term:scientific-technological elite": {
          "x": 736.05,
          "y": 574.38
        },
        "term:federal research funding": {
          "x": 533.5,
          "y": 658
        },
        "term:solitary inventor": {
          "x": 97.38,
          "y": 658
        },
        "term:alert and knowledgeable citizenry": {
          "x": 395.9,
          "y": 320.04
        },
        "term:balance": {
          "x": 42.05,
          "y": 277.12
        },
        "term:mortgaging the future": {
          "x": 144.22,
          "y": 185.87
        },
        "term:immense military establishment": {
          "x": 613.41,
          "y": 196.36
        },
        "term:the technological revolution": {
          "x": 951.8,
          "y": 658
        },
        "term:proper meshing": {
          "x": 475.99,
          "y": 502.67
        },
        "cluster:0": {
          "x": 415.01,
          "y": 83.04
        },
        "cluster:1": {
          "x": 809.29,
          "y": 342.1
        },
        "cluster:2": {
          "x": 304.19,
          "y": 611.17
        },
        "cluster:3": {
          "x": 156.29,
          "y": 401.3
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:28:18.382Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "auto",
    "savedAt": "2026-10-08T01:28:10.510Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
