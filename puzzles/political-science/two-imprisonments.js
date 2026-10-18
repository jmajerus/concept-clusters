// Generated from content/puzzles/two-imprisonments.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "two-imprisonments",
  "title": "Two Imprisonments",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "history-society"
  ],
  "subcategories": {
    "peace-conflict-studies": "nonviolence-civil-resistance",
    "political-science": "political-behavior"
  },
  "info": {
    "text": "Eugene V. Debs, railroad-union organizer turned five-time Socialist Party presidential candidate, whose politics were forged twice over in a federal prison cell -- first by the Pullman strike's defeat, and later by his own conviction for opposing the First World War.",
    "links": [
      {
        "href": "wiki:Eugene V. Debs"
      }
    ]
  },
  "clusters": [
    {
      "id": "industrial-unionism",
      "name": "Industrial Unionism",
      "color": "brown",
      "fact": "Debs founded the American Railway Union in 1893 on a new premise: organize every worker on the railroad together, regardless of craft, rather than splitting them into separate unions by trade. When Pullman workers -- paid less by the same company that also collected their rent as their landlord -- struck in 1894, the ARU backed them with a nationwide boycott of Pullman cars, until a federal injunction and the troops sent to enforce it broke the strike and put Debs in jail.",
      "terms": [
        "industrial unionism",
        "the Pullman boycott",
        "the American Railway Union",
        "the federal injunction"
      ],
      "seeds": [
        "industrial unionism",
        "the Pullman boycott"
      ],
      "termInfo": {
        "the American Railway Union": {
          "links": [
            {
              "href": "wiki:American Railway Union"
            }
          ]
        },
        "the federal injunction": {
          "links": [
            {
              "href": "wiki:In re Debs"
            }
          ]
        }
      },
      "info": {
        "text": "Debs's organizing innovation and its defeat: uniting all railroad workers into one union rather than dividing them by craft, tested and broken in the 1894 Pullman boycott.",
        "links": [
          {
            "href": "wiki:Pullman Strike"
          }
        ]
      }
    },
    {
      "id": "becoming-a-socialist",
      "name": "Becoming a Socialist",
      "color": "teal",
      "fact": "Debs's socialism was born, by his own account, in a jail cell: reading Marx during his six months in the Woodstock jail after the Pullman strike collapsed converted him from a trade unionist into a socialist, and he spent the following decades touring the country -- including aboard his own campaign train, the Red Special -- arguing that class struggle was not a betrayal of American values but their fulfillment.",
      "terms": [
        "class struggle",
        "the Socialist Party of America",
        "prison conversion",
        "the Red Special"
      ],
      "seeds": [
        "class struggle",
        "the Socialist Party of America"
      ],
      "info": {
        "text": "Debs's conversion to socialism during his first imprisonment, and his subsequent decades building the Socialist Party of America into the country's most visible socialist movement.",
        "links": [
          {
            "href": "wiki:Socialist Party of America"
          }
        ]
      }
    },
    {
      "id": "prison-campaigns",
      "name": "Prison Campaigns",
      "color": "magenta",
      "fact": "In June 1918, Debs told a crowd in Canton, Ohio that the First World War was an imperialist war fought by workers on behalf of rival capitalist powers -- and was indicted under the Espionage Act for it. He ran for president one more time in 1920, campaigning, and eventually running, from prison, and still won nearly a million votes.",
      "terms": [
        "the Canton speech",
        "the Espionage Act",
        "an imperialist war",
        "running from prison"
      ],
      "seeds": [
        "the Canton speech",
        "the Espionage Act"
      ],
      "termInfo": {
        "the Espionage Act": {
          "links": [
            {
              "href": "wiki:Espionage Act of 1917"
            }
          ]
        }
      },
      "info": {
        "text": "Debs's second imprisonment, for a single anti-war speech, and the presidential campaign he ran from behind bars in 1920 -- his fifth and last.",
        "links": [
          {
            "href": "wiki:Debs v. United States"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-limits-of-the-strike",
      "term": "the limits of the strike",
      "clusters": [
        0,
        1
      ],
      "fact": "The Pullman strike's defeat is what actually produced Debs's socialism: watching the government side unmistakably with the company -- an injunction, then federal troops -- convinced him in his jail cell that organizing workers industry by industry could never be enough on its own, and that the fight had to become explicitly political.",
      "relationKind": "dynamic",
      "idealTerms": [
        "the Pullman boycott",
        "prison conversion"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-capitalism-s-war",
      "term": "capitalism's war",
      "clusters": [
        1,
        2
      ],
      "fact": "Debs's socialism supplied the lens for his anti-war stand: if class struggle, not national loyalty, was the deeper truth of politics, then a war fought by workers on behalf of rival capitalist powers could only be read as an imperialist war -- exactly the argument that got him convicted a second time.",
      "relationKind": "dynamic",
      "idealTerms": [
        "class struggle",
        "an imperialist war"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-the-state-s-answer",
      "term": "the state's answer",
      "clusters": [
        0,
        2
      ],
      "fact": "Both convictions share the same shape: in 1894 the federal government intervened on the side of a company against its own striking workers, and in 1918 it did the same on the side of a war against a man who refused to support it -- Debs's own two imprisonments make the same argument, twenty-four years apart, about whose interests the state actually protects when it comes down to it.",
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "dateable-events",
      "prompt": "Which of these are specific, dateable events, rather than an idea or a political position?",
      "explanation": "The Pullman boycott, the Red Special, and the Canton speech are all specific, dateable events rather than abstract positions: a nationwide railroad boycott in the summer of 1894, a campaign train touring the country in 1908, and a single anti-war speech delivered in Canton, Ohio in June 1918 that became the basis for a federal indictment.",
      "targets": [
        "the Pullman boycott",
        "the Red Special",
        "the Canton speech"
      ],
      "reasons": {
        "the Canton speech": "A single anti-war speech, delivered in Canton, Ohio on June 16, 1918.",
        "the Pullman boycott": "A nationwide railroad boycott running from May to July of 1894.",
        "the Red Special": "A campaign train that toured the country during the 1908 presidential race."
      }
    },
    {
      "id": "made-in-prison",
      "prompt": "Which of these directly involved Debs being imprisoned by the federal government?",
      "explanation": "The federal injunction and the Espionage Act are the two legal instruments that put Debs behind bars, in 1894 and 1918 respectively -- and prison conversion names what happened during the first of those two terms: reading Marx in the Woodstock jail is where his socialism actually began. All three trace back to the same fact of his life: everything that made Debs a national figure, he built or discovered while, or because, the state had him locked up.",
      "targets": [
        "the federal injunction",
        "prison conversion",
        "the Espionage Act"
      ],
      "reasons": {
        "prison conversion": "What happened during his first term: reading Marx in the Woodstock jail is where his socialism actually began.",
        "the Espionage Act": "The law used to convict and imprison him a second time, in 1918.",
        "the federal injunction": "The legal basis for his first imprisonment, after the Pullman strike."
      }
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
      "puzzleId": "two-imprisonments",
      "puzzleRevision": "fnv1a32:35d604ea",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:industrial unionism": {
          "x": 409.06,
          "y": 378.76,
          "pinned": false
        },
        "term:the Pullman boycott": {
          "x": 414.37,
          "y": 125.37,
          "pinned": false
        },
        "term:the American Railway Union": {
          "x": 536.1,
          "y": 252.86,
          "pinned": false
        },
        "term:the federal injunction": {
          "x": 548.7,
          "y": 437,
          "pinned": false
        },
        "term:class struggle": {
          "x": 266.49,
          "y": 115.08,
          "pinned": false
        },
        "term:the Socialist Party of America": {
          "x": 118.33,
          "y": 23,
          "pinned": false
        },
        "term:prison conversion": {
          "x": 329.46,
          "y": 23,
          "pinned": false
        },
        "term:the Red Special": {
          "x": 69.25,
          "y": 161.97,
          "pinned": false
        },
        "term:the Canton speech": {
          "x": 192.8,
          "y": 352.48,
          "pinned": false
        },
        "term:the Espionage Act": {
          "x": 75.55,
          "y": 306.68,
          "pinned": false
        },
        "term:an imperialist war": {
          "x": 311.45,
          "y": 250.83,
          "pinned": false
        },
        "term:running from prison": {
          "x": 81.85,
          "y": 437,
          "pinned": false
        },
        "term:the limits of the strike": {
          "x": 542.4,
          "y": 23,
          "pinned": false
        },
        "term:capitalism's war": {
          "x": 159.51,
          "y": 205.21,
          "pinned": false
        },
        "term:the state's answer": {
          "x": 282.18,
          "y": 437,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2985.71,
        "score": 2985.705065262953
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:22:04.554Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "two-imprisonments",
      "puzzleRevision": "fnv1a32:35d604ea",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 720.21,
          "y": 375.56,
          "pinned": false
        },
        "cluster:1": {
          "x": 239.79,
          "y": 375.56,
          "pinned": false
        },
        "cluster:2": {
          "x": 480,
          "y": 202.87,
          "pinned": false
        }
      },
      "bridges": {
        "term:the limits of the strike": {
          "x": 480,
          "y": 426.56,
          "pinned": false
        },
        "term:capitalism's war": {
          "x": 263.73,
          "y": 193.05,
          "pinned": false
        },
        "term:the state's answer": {
          "x": 696.27,
          "y": 193.05,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "industrial unionism",
          "the Pullman boycott",
          "the American Railway Union",
          "the federal injunction"
        ],
        "cluster:1": [
          "class struggle",
          "the Socialist Party of America",
          "prison conversion",
          "the Red Special"
        ],
        "cluster:2": [
          "the Canton speech",
          "the Espionage Act",
          "an imperialist war",
          "running from prison"
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
        "totalLength": 470.6479164285266
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:22:07.450Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "two-imprisonments",
      "puzzleRevision": "fnv1a32:35d604ea",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:industrial unionism": {
          "x": 857,
          "y": 345.96
        },
        "term:the Pullman boycott": {
          "x": 529.07,
          "y": 393.33
        },
        "term:the American Railway Union": {
          "x": 858.1,
          "y": 539.48
        },
        "term:the federal injunction": {
          "x": 664.74,
          "y": 598
        },
        "term:class struggle": {
          "x": 269.82,
          "y": 197.95
        },
        "term:the Socialist Party of America": {
          "x": 206.76,
          "y": 560.68
        },
        "term:prison conversion": {
          "x": 365.3,
          "y": 439.05
        },
        "term:the Red Special": {
          "x": 75.32,
          "y": 418.3
        },
        "term:the Canton speech": {
          "x": 521.16,
          "y": 22
        },
        "term:the Espionage Act": {
          "x": 781.55,
          "y": 22
        },
        "term:an imperialist war": {
          "x": 507.11,
          "y": 180.58
        },
        "term:running from prison": {
          "x": 798.12,
          "y": 184.78
        },
        "term:the limits of the strike": {
          "x": 468.39,
          "y": 587.36
        },
        "term:capitalism's war": {
          "x": 387.25,
          "y": 285.04
        },
        "term:the state's answer": {
          "x": 649.4,
          "y": 264.15
        },
        "cluster:0": {
          "x": 703.96,
          "y": 423.42
        },
        "cluster:1": {
          "x": 222.43,
          "y": 349.85
        },
        "cluster:2": {
          "x": 651.05,
          "y": 105.51
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:22:10.569Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:22:01.708Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
