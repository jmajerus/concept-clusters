// Generated from content/puzzles/the-webs-bargain.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-webs-bargain",
  "title": "The Web's Bargain",
  "category": "science-technology-society",
  "categories": [
    "science-technology-society",
    "computer-science"
  ],
  "subcategories": {
    "computer-science": "computing-and-society",
    "science-technology-society": "technology-work-control"
  },
  "info": {
    "text": "Why software moved into the browser, who gained control and convenience, which costs were transferred to users, and which native powers were displaced.",
    "links": [
      {
        "href": "wiki:Web application"
      }
    ]
  },
  "clusters": [
    {
      "id": "promises-of-the-universal-web",
      "name": "Promises of the universal web",
      "color": "teal",
      "fact": "Web development was presented as a universal solution: one application could reach many systems immediately without conventional installation or separate distribution for each platform.",
      "terms": [
        "runs anywhere",
        "no installation",
        "one codebase",
        "instant updates"
      ],
      "seeds": [
        "runs anywhere",
        "no installation"
      ],
      "termInfo": {
        "runs anywhere": {
          "text": "The promise that standards-based browser software can reach many operating systems and devices through one broadly available runtime.",
          "links": [
            {
              "href": "wiki:Cross-platform software"
            }
          ]
        },
        "no installation": {
          "text": "Launching an application from a URL without a conventional operating-system installation process.",
          "links": [
            {
              "href": "wiki:Web application"
            }
          ]
        },
        "one codebase": {
          "text": "Maintaining one primary implementation intended to serve several platforms rather than separate native applications for each.",
          "links": [
            {
              "href": "wiki:Codebase"
            }
          ]
        },
        "instant updates": {
          "text": "Replacing the version served to users centrally, without waiting for each user to install a separate update package.",
          "links": [
            {
              "href": "wiki:Software update"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Web application"
          }
        ]
      }
    },
    {
      "id": "organizational-rewards",
      "name": "Organizational rewards",
      "color": "blue",
      "fact": "Browser delivery gives software providers unusual control over deployment, version replacement, observation, monetization, and the continued availability of features.",
      "terms": [
        "centralized deployment",
        "forced version replacement",
        "usage telemetry",
        "subscription enforcement"
      ],
      "seeds": [
        "centralized deployment",
        "usage telemetry"
      ],
      "termInfo": {
        "centralized deployment": {
          "text": "Publishing and operating one served application so release decisions remain concentrated in the provider's infrastructure.",
          "links": [
            {
              "href": "wiki:Software deployment"
            }
          ]
        },
        "forced version replacement": {
          "text": "Making a newly served version the only ordinarily available version, whether or not a user preferred the one it replaced.",
          "links": [
            {
              "href": "wiki:Software versioning"
            }
          ]
        },
        "usage telemetry": {
          "text": "Collection of operational and behavioral data about how software is used.",
          "links": [
            {
              "href": "wiki:Telemetry"
            }
          ]
        },
        "subscription enforcement": {
          "text": "Conditioning continued software access on an active account, license check, or recurring payment.",
          "links": [
            {
              "href": "wiki:Software as a service"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Software as a service"
          }
        ]
      }
    },
    {
      "id": "costs-transferred-to-users",
      "name": "Costs transferred to users",
      "color": "amber",
      "fact": "Savings in distribution and platform-specific development can reappear as connectivity requirements, latency, resource use, and interfaces shaped around browser constraints rather than the work itself.",
      "terms": [
        "network dependence",
        "input latency",
        "memory overhead",
        "interface inconsistency"
      ],
      "seeds": [
        "network dependence",
        "input latency"
      ],
      "termInfo": {
        "network dependence": {
          "text": "Reliance on a continuing connection or remote service for ordinary access, synchronization, authorization, or computation.",
          "links": [
            {
              "href": "wiki:Network service"
            }
          ]
        },
        "input latency": {
          "text": "The delay between a user's action and the visible or audible response of the system.",
          "links": [
            {
              "href": "wiki:Input lag"
            }
          ]
        },
        "memory overhead": {
          "text": "Memory consumed by runtimes, frameworks, duplicated representations, and supporting machinery beyond the application's core data and logic.",
          "links": [
            {
              "href": "wiki:Memory footprint"
            }
          ]
        },
        "interface inconsistency": {
          "text": "Variation in controls, shortcuts, focus behavior, accessibility, and interaction conventions across custom web interfaces.",
          "links": [
            {
              "href": "wiki:Usability"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Usability"
          }
        ]
      }
    },
    {
      "id": "native-powers-displaced",
      "name": "Native powers displaced",
      "color": "magenta",
      "fact": "Native applications can treat the computer as an autonomous working environment, with persistent local state, long-running processes, specialized hardware access, and versions the user may retain.",
      "terms": [
        "durable local files",
        "sustained background work",
        "direct hardware integration",
        "user-controlled versions"
      ],
      "seeds": [
        "durable local files",
        "direct hardware integration"
      ],
      "termInfo": {
        "durable local files": {
          "text": "Files held under ordinary user and operating-system control rather than existing primarily as browser cache or remote service state.",
          "links": [
            {
              "href": "wiki:File system"
            }
          ]
        },
        "sustained background work": {
          "text": "Long-running rendering, encoding, indexing, analysis, or automation expected to continue under operating-system scheduling.",
          "links": [
            {
              "href": "wiki:Background process"
            }
          ]
        },
        "direct hardware integration": {
          "text": "Application use of specialized graphics, storage, input, audio, video, or control hardware through native operating-system and vendor interfaces.",
          "links": [
            {
              "href": "wiki:Device driver"
            }
          ]
        },
        "user-controlled versions": {
          "text": "The practical ability to retain and run a chosen installed version instead of accepting every provider-side replacement.",
          "links": [
            {
              "href": "wiki:Software versioning"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Desktop application"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "institutional-convenience",
      "term": "institutional convenience",
      "clusters": [
        0,
        1
      ],
      "fact": "Claims about universal access also aligned with an institutional desire to deploy, maintain, measure, and govern one centrally controlled application rather than many installed copies.",
      "info": {
        "text": "A technical arrangement whose most dependable efficiencies accrue to the organization operating the system.",
        "links": [
          {
            "href": "wiki:Centralization"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "one codebase",
        "centralized deployment"
      ]
    },
    {
      "id": "cost-shifting",
      "term": "cost shifting",
      "clusters": [
        1,
        2
      ],
      "fact": "Complexity removed from deployment and vendor support may reappear as user waiting, connectivity requirements, greater local resource use, reduced reliability, or less capable interaction.",
      "info": {
        "text": "Moving a burden from the party that chooses or benefits from a system to another party that must absorb its consequences.",
        "links": [
          {
            "href": "wiki:Externality"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "centralized deployment",
        "network dependence"
      ]
    },
    {
      "id": "lowest-common-denominator",
      "term": "lowest common denominator",
      "clusters": [
        0,
        3
      ],
      "fact": "Targeting a common browser environment broadens reach partly by declining to depend on the specialized capabilities, conventions, and guarantees of any one operating system.",
      "info": {
        "text": "A shared baseline chosen for broad compatibility even when individual platforms can support richer or more specialized capabilities.",
        "links": [
          {
            "href": "wiki:Cross-platform software"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "runs anywhere",
        "direct hardware integration"
      ]
    }
  ],
  "lenses": [
    {
      "id": "direct-organizational-benefit",
      "prompt": "Which concepts deliver their most direct and dependable benefit to the organization operating the software?",
      "explanation": "These choices may benefit some users too, but their most predictable gains accrue to the organization that develops, deploys, measures, monetizes, or governs the service.",
      "targets": [
        "one codebase",
        "instant updates",
        "centralized deployment",
        "forced version replacement",
        "usage telemetry",
        "subscription enforcement"
      ],
      "reasons": {
        "one codebase": "Maintaining one browser-oriented implementation can reduce the operator's platform-specific development burden.",
        "instant updates": "The operator can replace the served application without coordinating a separate installation on every machine.",
        "centralized deployment": "Release and rollback decisions remain concentrated in the provider's deployment system.",
        "forced version replacement": "The provider can make an older working version unavailable simply by ceasing to serve it.",
        "usage telemetry": "The operator can observe behavior across a centrally mediated service.",
        "subscription enforcement": "Continued access can be tied directly to account and payment status."
      }
    },
    {
      "id": "user-sovereignty",
      "prompt": "Which concepts directly affect whether users can retain versions, data, access, or privacy without continuing provider permission?",
      "explanation": "User sovereignty depends not only on what software can do, but on whether users can keep a working version, retain authoritative local data, work without a provider connection, and avoid compulsory observation or payment.",
      "targets": [
        "forced version replacement",
        "usage telemetry",
        "subscription enforcement",
        "network dependence",
        "durable local files",
        "user-controlled versions"
      ],
      "reasons": {
        "forced version replacement": "It removes the user's practical ability to remain on a preferred working version.",
        "usage telemetry": "It affects whether ordinary use can remain private from the service operator.",
        "subscription enforcement": "It makes continued use contingent on an ongoing provider relationship.",
        "network dependence": "It can make access to one's work contingent on service availability and authorization.",
        "durable local files": "Authoritative local files can remain accessible independently of a service account.",
        "user-controlled versions": "Installed versions can sometimes be retained until the user chooses to replace them."
      }
    },
    {
      "id": "not-merely-immaturity",
      "prompt": "Which concepts name user-facing burdens or native capabilities whose absence persists for architectural reasons?",
      "explanation": "Better browsers and APIs can reduce these problems, but each also reflects architectural priorities: remote service dependence, layered execution, generic cross-platform interfaces, browser lifecycle control, and mediated hardware access.",
      "targets": [
        "network dependence",
        "input latency",
        "memory overhead",
        "interface inconsistency",
        "sustained background work",
        "direct hardware integration"
      ],
      "reasons": {
        "network dependence": "A service-centered architecture can remain network-dependent even after its implementation matures.",
        "input latency": "Additional rendering and event layers can matter in dense, time-sensitive interaction.",
        "memory overhead": "A general browser runtime and framework stack consume resources beyond the application's own domain logic.",
        "interface inconsistency": "Generic web controls and custom design systems do not automatically inherit one coherent desktop interaction model.",
        "sustained background work": "Browser lifecycle rules remain different from an installed application's ordinary expectation of long-running execution.",
        "direct hardware integration": "Security mediation and standardized APIs deliberately limit direct dependence on specialized local devices."
      }
    },
    {
      "id": "possession-or-service",
      "prompt": "Which concepts most clearly distinguish software retained as a local possession from software continuously supplied as a service?",
      "explanation": "The contrast is not merely technical. Service delivery concentrates deployment, version, payment, and availability decisions with the provider, while locally retained software and files can preserve a larger sphere of user control.",
      "targets": [
        "centralized deployment",
        "forced version replacement",
        "subscription enforcement",
        "network dependence",
        "durable local files",
        "user-controlled versions"
      ],
      "reasons": {
        "centralized deployment": "The provider determines which implementation is currently supplied.",
        "forced version replacement": "The served version can replace the prior one without the user retaining the old application.",
        "subscription enforcement": "Use remains conditional on an ongoing service relationship.",
        "network dependence": "The provider's infrastructure can remain part of ordinary execution.",
        "durable local files": "Locally controlled files can outlast a particular service or account.",
        "user-controlled versions": "A retained executable can preserve a chosen working state of the application."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Compare the web's canonical justification with its institutional and occupational consequences."
    },
    "entries": [
      {
        "id": "the-programmers-bargain",
        "reason": "See how the same migration changed programmers' tools, attention, expertise, and day-to-day work.",
        "via": [
          "cost shifting",
          "lost leverage",
          "frameworks"
        ]
      },
      {
        "id": "the-web-canon",
        "reason": "Return to the standard account of reach, security, and progressive platform capability that this puzzle complicates.",
        "via": [
          "distribution",
          "security boundary",
          "web APIs"
        ]
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "the-webs-bargain",
      "puzzleRevision": "fnv1a32:23bf3632",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:runs anywhere": {
          "x": 291.34,
          "y": 193.17,
          "pinned": false
        },
        "term:no installation": {
          "x": 187.39,
          "y": 105.17,
          "pinned": false
        },
        "term:one codebase": {
          "x": 276.97,
          "y": 319.09,
          "pinned": false
        },
        "term:instant updates": {
          "x": 165.8,
          "y": 246.01,
          "pinned": false
        },
        "term:centralized deployment": {
          "x": 601.38,
          "y": 440.34,
          "pinned": false
        },
        "term:forced version replacement": {
          "x": 797.81,
          "y": 407.31,
          "pinned": false
        },
        "term:usage telemetry": {
          "x": 544.9,
          "y": 594.9,
          "pinned": false
        },
        "term:subscription enforcement": {
          "x": 715.73,
          "y": 595.69,
          "pinned": false
        },
        "term:network dependence": {
          "x": 311.98,
          "y": 457.22,
          "pinned": false
        },
        "term:input latency": {
          "x": 358.62,
          "y": 595.2,
          "pinned": false
        },
        "term:memory overhead": {
          "x": 169.99,
          "y": 403.13,
          "pinned": false
        },
        "term:interface inconsistency": {
          "x": 189.32,
          "y": 585.02,
          "pinned": false
        },
        "term:durable local files": {
          "x": 684.12,
          "y": 255.39,
          "pinned": false
        },
        "term:sustained background work": {
          "x": 729.98,
          "y": 59.25,
          "pinned": false
        },
        "term:direct hardware integration": {
          "x": 532.6,
          "y": 136.02,
          "pinned": false
        },
        "term:user-controlled versions": {
          "x": 862.4,
          "y": 212.23,
          "pinned": false
        },
        "term:institutional convenience": {
          "x": 441.32,
          "y": 327.14,
          "pinned": false
        },
        "term:cost shifting": {
          "x": 452.74,
          "y": 494.63,
          "pinned": false
        },
        "term:lowest common denominator": {
          "x": 346.54,
          "y": 34.82,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3691.54,
        "score": 3691.5419818078976
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:32:08.876Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-webs-bargain",
      "puzzleRevision": "fnv1a32:23bf3632",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 231.79,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 564.21,
          "pinned": false
        },
        "cluster:2": {
          "x": 254.65,
          "y": 398,
          "pinned": false
        },
        "cluster:3": {
          "x": 795.35,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:institutional convenience": {
          "x": 499.13,
          "y": 387.28,
          "pinned": false
        },
        "term:cost shifting": {
          "x": 316.29,
          "y": 554.64,
          "pinned": false
        },
        "term:lowest common denominator": {
          "x": 756.34,
          "y": 218.73,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "runs anywhere",
          "no installation",
          "one codebase",
          "instant updates"
        ],
        "cluster:1": [
          "centralized deployment",
          "forced version replacement",
          "usage telemetry",
          "subscription enforcement"
        ],
        "cluster:2": [
          "network dependence",
          "input latency",
          "memory overhead",
          "interface inconsistency"
        ],
        "cluster:3": [
          "durable local files",
          "sustained background work",
          "direct hardware integration",
          "user-controlled versions"
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
        "totalLength": 314.26059107252433
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:32:10.905Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-webs-bargain",
      "puzzleRevision": "fnv1a32:23bf3632",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:runs anywhere": {
          "x": 558.15,
          "y": 186.35
        },
        "term:no installation": {
          "x": 457.09,
          "y": 122.66
        },
        "term:one codebase": {
          "x": 809.81,
          "y": 22
        },
        "term:instant updates": {
          "x": 452.29,
          "y": 22
        },
        "term:centralized deployment": {
          "x": 436.03,
          "y": 277.92
        },
        "term:forced version replacement": {
          "x": 858.1,
          "y": 550.52
        },
        "term:usage telemetry": {
          "x": 619.1,
          "y": 287.44
        },
        "term:subscription enforcement": {
          "x": 864.4,
          "y": 339.15
        },
        "term:network dependence": {
          "x": 542.53,
          "y": 462.38
        },
        "term:input latency": {
          "x": 392.84,
          "y": 480.04
        },
        "term:memory overhead": {
          "x": 75.71,
          "y": 598
        },
        "term:interface inconsistency": {
          "x": 465.57,
          "y": 598
        },
        "term:durable local files": {
          "x": 263.81,
          "y": 412.9
        },
        "term:sustained background work": {
          "x": 98.75,
          "y": 37.56
        },
        "term:direct hardware integration": {
          "x": 320.76,
          "y": 231.25
        },
        "term:user-controlled versions": {
          "x": 95.6,
          "y": 451.38
        },
        "term:institutional convenience": {
          "x": 718.85,
          "y": 218.41
        },
        "term:cost shifting": {
          "x": 438.09,
          "y": 361.66
        },
        "term:lowest common denominator": {
          "x": 279.09,
          "y": 122.66
        },
        "cluster:0": {
          "x": 644.35,
          "y": 22
        },
        "cluster:1": {
          "x": 704.61,
          "y": 415.65
        },
        "cluster:2": {
          "x": 259.25,
          "y": 598
        },
        "cluster:3": {
          "x": 111.07,
          "y": 239.49
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T00:32:13.576Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:32:06.912Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
