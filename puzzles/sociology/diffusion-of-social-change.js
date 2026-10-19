// Generated from content/puzzles/diffusion-of-social-change.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "diffusion-of-social-change",
  "title": "How New Ideas Spread Through Society",
  "category": "sociology",
  "categories": [
    "sociology"
  ],
  "subcategories": {
    "sociology": "social-change"
  },
  "info": {
    "text": "Diffusion describes how ideas and practices move through social systems over time. Prospective adopters interpret the innovation, encounter it through communication channels, and decide whether to adopt, adapt, reject, or later discontinue it.",
    "citations": [
      {
        "title": "Diffusion of Innovations, 5th Edition",
        "author": "Everett M. Rogers",
        "publisher": "Free Press / Simon & Schuster",
        "year": "2003",
        "url": "https://www.simonandschuster.com/books/Diffusion-of-Innovations-5th-Edition/Everett-M-Rogers/9780743222099"
      },
      {
        "title": "Diffusion of Innovations in Service Organizations: Systematic Review and Recommendations",
        "author": "Trisha Greenhalgh, Robert Macfarlane, Fraser Bate, and Olivia Kyriakidou",
        "publisher": "The Milbank Quarterly",
        "year": "2004",
        "pages": "581-629",
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/j.0887-378X.2004.00325.x/full"
      }
    ]
  },
  "clusters": [
    {
      "id": "perceived-innovation-attributes",
      "name": "Perceived Innovation Attributes",
      "color": "teal",
      "fact": "Prospective adopters judge an innovation through its perceived relative advantage, fit with values and routines, complexity, ability to be tried, and visibility of results. These attributes help explain adoption but work in context; perceived advantage alone cannot guarantee acceptance.",
      "terms": [
        "relative advantage",
        "compatibility",
        "complexity",
        "trialability",
        "observability"
      ],
      "seeds": [
        "relative advantage",
        "compatibility"
      ],
      "termInfo": {
        "relative advantage": "How much better a prospective adopter believes an innovation is than the practice it might replace; the comparison depends on needs and context.",
        "compatibility": "How well an innovation appears to fit existing values, experiences, needs, and routines.",
        "complexity": "How difficult an innovation is perceived to understand or use.",
        "trialability": "Whether people can experiment with an innovation on a limited basis before fully adopting it.",
        "observability": "How visible an innovation's results are to others, allowing them to discuss or evaluate it."
      }
    },
    {
      "id": "innovation-decision-process",
      "name": "Innovation-Decision Process",
      "color": "blue",
      "fact": "Rogers's model describes a usual path from knowledge to persuasion, decision, implementation, and confirmation. People can adopt or reject an innovation, revisit a choice, discontinue use, or move through activities in a different order; the stages are a guide, not a fixed law.",
      "terms": [
        "knowledge",
        "confirmation",
        "persuasion",
        "decision",
        "implementation"
      ],
      "seeds": [
        "knowledge",
        "confirmation"
      ],
      "termInfo": {
        "knowledge": "A person learns that an innovation exists and gains some understanding of how it works.",
        "persuasion": "A person develops an attitude toward an innovation and evaluates whether it seems worthwhile.",
        "decision": "The person chooses to adopt or reject the innovation after considering it.",
        "implementation": "The person puts an adopted innovation into use, sometimes adapting it to local needs.",
        "confirmation": "The person seeks or evaluates further information after the choice and may continue, change, or discontinue use."
      }
    },
    {
      "id": "relative-adopter-timing",
      "name": "Relative Timing of Adoption",
      "color": "amber",
      "fact": "The familiar adopter categories compare how early or late members of a social system adopt a particular innovation. They summarize relative timing, not permanent personality types, moral worth, or a universal pattern for every idea.",
      "terms": [
        "innovators",
        "laggards",
        "early adopters",
        "early majority",
        "late majority"
      ],
      "seeds": [
        "innovators",
        "laggards"
      ],
      "termInfo": {
        "innovators": "The conventional category for people who adopt particularly early relative to others in a social system.",
        "early adopters": "A category for people who adopt earlier than the majority of members in a social system.",
        "early majority": "A category for people who adopt before the later part of the social system has adopted.",
        "late majority": "A category for people who adopt after a substantial share of the system has already adopted.",
        "laggards": "Rogers's conventional label for the relatively latest adopters in a particular system; it describes timing, not a personal defect."
      }
    },
    {
      "id": "channels-and-social-setting",
      "name": "Channels and Social Setting",
      "color": "magenta",
      "fact": "Diffusion unfolds through communication among members of a social system. Mass media can make people aware of an innovation, while interpersonal channels often shape evaluation; opinion leaders influence peers and change agents intentionally promote change. Local networks and norms can enable or inhibit spread.",
      "terms": [
        "communication channel",
        "social system",
        "mass media channel",
        "interpersonal channel",
        "opinion leader",
        "change agent"
      ],
      "seeds": [
        "communication channel",
        "social system"
      ],
      "termInfo": {
        "communication channel": "A means through which information about an innovation moves from one person to another.",
        "mass media channel": "A broad communication route, such as radio or a newspaper, that can create awareness among many people.",
        "interpersonal channel": "Communication through social contact, where peers can discuss an innovation and evaluate it in context.",
        "opinion leader": "A person whose views influence others in a social system, often because peers see that person as credible or representative.",
        "change agent": "A person who intentionally promotes an innovation or planned change to a group or community.",
        "social system": "The interconnected members, norms, and relationships within which an innovation is communicated and adopted."
      }
    }
  ],
  "bridges": [
    {
      "id": "rate-of-adoption",
      "term": "rate of adoption",
      "clusters": [
        0,
        2
      ],
      "fact": "The rate of adoption describes how adoption accumulates over time within a social system. Perceived attributes can help explain its speed, while adopter categories describe relative positions in that spread; the shape and pace vary by innovation and setting.",
      "relationKind": "dynamic",
      "idealTerms": [
        "compatibility",
        "early majority"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "reinvention",
      "term": "reinvention",
      "clusters": [
        0,
        1
      ],
      "fact": "Reinvention is the modification of an innovation by users during adoption and implementation. Adaptation can improve fit with local needs, so diffusion does not always mean that every adopter copies an unchanged original.",
      "relationKind": "dynamic",
      "idealTerms": [
        "compatibility",
        "implementation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "interpersonal-influence",
      "term": "interpersonal influence",
      "clusters": [
        3,
        1
      ],
      "fact": "Interpersonal influence occurs when communication with peers or opinion leaders shapes how a person evaluates an innovation and decides whether to adopt it. Its effect depends on trust, perceived fit, and local norms.",
      "relationKind": "dynamic",
      "idealTerms": [
        "interpersonal channel",
        "persuasion"
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
      "id": "attributes-of-use",
      "prompt": "Which attributes describe perceived difficulty, the chance to try something on a limited basis, and the visibility of its results?",
      "explanation": "These are distinct perceived attributes: complexity concerns difficulty, trialability permits limited experimentation, and observability makes results visible to others.",
      "targets": [
        "complexity",
        "trialability",
        "observability"
      ],
      "reasons": {
        "complexity": "Describes perceived difficulty in understanding or using an innovation.",
        "trialability": "Describes whether people can test an innovation before fully adopting it.",
        "observability": "Describes whether others can see the results."
      }
    },
    {
      "id": "choice-use-reconsideration",
      "prompt": "Which stage marks choosing adoption or rejection, which puts the idea into practice, and which re-evaluates the choice afterward?",
      "explanation": "The decision stage is the choice, implementation is actual use, and confirmation is later evaluation. A person can still change course or discontinue use.",
      "targets": [
        "decision",
        "implementation",
        "confirmation"
      ],
      "reasons": {
        "decision": "Marks the choice to adopt or reject.",
        "implementation": "Puts an adopted innovation into practice.",
        "confirmation": "Reconsiders the choice with later experience or information."
      }
    },
    {
      "id": "relative-adoption-timing",
      "prompt": "Which categories describe intermediate positions between the earliest adopters and the relatively latest adopters?",
      "explanation": "These categories compare timing within one social system. Their labels do not rank people's intelligence, character, or worth.",
      "targets": [
        "early adopters",
        "early majority",
        "late majority"
      ],
      "reasons": {
        "early adopters": "Adopt earlier than most other members of the system.",
        "early majority": "Adopt before the later portion of the system.",
        "late majority": "Adopt after a substantial share has already adopted."
      }
    },
    {
      "id": "communication-channel-roles",
      "prompt": "Which channel can reach many people to create awareness, and which relies on person-to-person exchange for discussion and evaluation?",
      "explanation": "Mass media can spread initial awareness broadly; interpersonal channels let people discuss meaning and evaluate an innovation through social relationships. The roles can overlap and depend on context.",
      "targets": [
        "mass media channel",
        "interpersonal channel"
      ],
      "reasons": {
        "mass media channel": "Carries information broadly and can create awareness.",
        "interpersonal channel": "Lets people exchange views and evaluate an innovation with others."
      }
    },
    {
      "id": "influence-and-promotion",
      "prompt": "Which role influences peers within a social system, and which intentionally promotes an innovation?",
      "explanation": "An opinion leader can shape peers' views through credibility or standing. A change agent has an intentional role in promoting planned change; a person may sometimes occupy both roles.",
      "targets": [
        "opinion leader",
        "change agent"
      ],
      "reasons": {
        "opinion leader": "Influences other members of a social system.",
        "change agent": "Intentionally promotes an innovation or planned change."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "info": {
      "text": "Collective actors can mobilize change, ideas and practices can spread through social ties, and institutions can then absorb or resist new arrangements."
    },
    "entries": [
      {
        "id": "gradual-institutional-change",
        "reason": "Continue to the ways formal rules and institutional routines shift gradually after ideas and practices circulate."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From first awareness to wider adoption",
    "summary": "Learn how perceived fit, communication, decisions, and local context shape whether an idea spreads.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Diffusion is the spread of an idea, practice, or object that people perceive as new. The innovation need not be newly invented: it is new to the people considering it. Diffusion happens through communication channels over time within a social system, so adoption depends on social relationships and local meanings as well as the idea itself.\n\n## Why an innovation seems adoptable\n\nPeople judge a possible change in relation to their existing practices and needs. Relative advantage asks whether it seems better than an alternative; compatibility asks whether it fits values and routines. Complexity concerns perceived difficulty. Trialability lets someone experiment on a limited scale, while observability makes results visible to others. These attributes help explain adoption, but no simple checklist guarantees that an innovation will spread. A practice with clear benefits can still conflict with norms or daily constraints.\n\nConsider a school deciding whether to use a new timetable. Staff may see advantages for student learning, but ask whether it fits bus schedules and family routines, whether it is hard to administer, whether a small pilot is possible, and whether results can be seen. These judgments can differ across schools and groups. Users may also adapt the timetable during implementation; Rogers calls this reinvention. Local adaptation can improve fit, although the resulting practice may differ from the original proposal.\n\n## How people decide\n\nA common model traces an innovation-decision process through knowledge, persuasion, decision, implementation, and confirmation. A person first learns about the innovation, then evaluates it, chooses to adopt or reject, puts an adopted idea into use, and later reviews the choice. This is a useful outline, not a rule that everyone follows in exactly the same order. People can revisit earlier judgments, reject an idea, or discontinue it after trying it.\n\n## When people adopt\n\nAdopter categories compare relative timing within a social system: innovators, early adopters, early majority, late majority, and laggards. The names can sound like personality judgments, but they describe when people adopt one particular innovation relative to others in that setting. They do not imply that early is always wise or late is always resistant. The rate of adoption varies; a familiar S-shaped curve appears in many diffusion accounts, but it is not a law for every innovation or community.\n\n## How ideas travel\n\nMass media can make many people aware of an idea. Interpersonal conversations often matter when people ask whether it fits their circumstances and what other users experienced. Opinion leaders influence peers within a social system; change agents deliberately promote an innovation. Their roles are different even when a person sometimes occupies both. Trust, networks, and local norms shape whose information matters and whether an idea is accepted.\n\nDiffusion is therefore more than a message sent from an inventor to passive recipients. People interpret, discuss, adapt, adopt, reject, and sometimes abandon an innovation. Its spread can change social practices, but adoption is not automatically beneficial: consequences depend on what spreads, for whom, and under what conditions."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (gpt-6-luna)",
        "reasoning": "max"
      }
    ]
  },
  "language": "en"
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "diffusion-of-social-change",
      "puzzleRevision": "fnv1a32:45f6ef6d",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:relative advantage": {
          "x": 548.87,
          "y": 158.44,
          "pinned": false
        },
        "term:compatibility": {
          "x": 426.28,
          "y": 237.08,
          "pinned": false
        },
        "term:complexity": {
          "x": 535.34,
          "y": 23,
          "pinned": false
        },
        "term:trialability": {
          "x": 690.32,
          "y": 175.66,
          "pinned": false
        },
        "term:observability": {
          "x": 651.43,
          "y": 55.04,
          "pinned": false
        },
        "term:knowledge": {
          "x": 218.6,
          "y": 457.09,
          "pinned": false
        },
        "term:confirmation": {
          "x": 259.75,
          "y": 563.56,
          "pinned": false
        },
        "term:persuasion": {
          "x": 326.01,
          "y": 466.78,
          "pinned": false
        },
        "term:decision": {
          "x": 152.67,
          "y": 534.32,
          "pinned": false
        },
        "term:implementation": {
          "x": 278.58,
          "y": 352.65,
          "pinned": false
        },
        "term:innovators": {
          "x": 195.53,
          "y": 261.11,
          "pinned": false
        },
        "term:laggards": {
          "x": 97.93,
          "y": 223.23,
          "pinned": false
        },
        "term:early adopters": {
          "x": 100.8,
          "y": 340.49,
          "pinned": false
        },
        "term:early majority": {
          "x": 300.02,
          "y": 195.11,
          "pinned": false
        },
        "term:late majority": {
          "x": 178.06,
          "y": 141.94,
          "pinned": false
        },
        "term:communication channel": {
          "x": 684.82,
          "y": 450.09,
          "pinned": false
        },
        "term:social system": {
          "x": 733.99,
          "y": 597,
          "pinned": false
        },
        "term:mass media channel": {
          "x": 829.19,
          "y": 358.75,
          "pinned": false
        },
        "term:interpersonal channel": {
          "x": 551,
          "y": 329.27,
          "pinned": false
        },
        "term:opinion leader": {
          "x": 832.29,
          "y": 507.51,
          "pinned": false
        },
        "term:change agent": {
          "x": 699.88,
          "y": 298.89,
          "pinned": false
        },
        "term:rate of adoption": {
          "x": 405.49,
          "y": 99.29,
          "pinned": false
        },
        "term:reinvention": {
          "x": 405.17,
          "y": 358.87,
          "pinned": false
        },
        "term:interpersonal influence": {
          "x": 474.41,
          "y": 499.43,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3692.59,
        "score": 3692.5860321754258
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:42:35.114Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "diffusion-of-social-change",
      "puzzleRevision": "fnv1a32:45f6ef6d",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480,
          "y": 168.69,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 467.31,
          "pinned": false
        },
        "cluster:2": {
          "x": 808.5,
          "y": 318,
          "pinned": false
        },
        "cluster:3": {
          "x": 151.5,
          "y": 318,
          "pinned": false
        }
      },
      "bridges": {
        "term:rate of adoption": {
          "x": 717.79,
          "y": 169.81,
          "pinned": false
        },
        "term:reinvention": {
          "x": 584,
          "y": 318,
          "pinned": false
        },
        "term:interpersonal influence": {
          "x": 219.58,
          "y": 488.82,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "relative advantage",
          "compatibility",
          "complexity",
          "trialability",
          "observability"
        ],
        "cluster:1": [
          "knowledge",
          "confirmation",
          "persuasion",
          "decision",
          "implementation"
        ],
        "cluster:2": [
          "innovators",
          "laggards",
          "early adopters",
          "early majority",
          "late majority"
        ],
        "cluster:3": [
          "communication channel",
          "social system",
          "mass media channel",
          "interpersonal channel",
          "opinion leader",
          "change agent"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "trialability",
          "observability",
          "relative advantage",
          "compatibility",
          "complexity"
        ],
        "cluster:1": [
          "knowledge",
          "implementation",
          "persuasion",
          "confirmation",
          "decision"
        ],
        "cluster:2": [
          "innovators",
          "early majority",
          "early adopters",
          "late majority",
          "laggards"
        ],
        "cluster:3": [
          "social system",
          "mass media channel",
          "communication channel",
          "interpersonal channel",
          "opinion leader",
          "change agent"
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
        "totalLength": 910.678384225561
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:42:35.836Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "diffusion-of-social-change",
      "puzzleRevision": "fnv1a32:45f6ef6d",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:relative advantage": {
          "x": 908.3,
          "y": 101.94
        },
        "term:compatibility": {
          "x": 568.39,
          "y": 289.5
        },
        "term:complexity": {
          "x": 931.23,
          "y": 240.47
        },
        "term:trialability": {
          "x": 927.2,
          "y": 361.55
        },
        "term:observability": {
          "x": 886.56,
          "y": 483.09
        },
        "term:knowledge": {
          "x": 816.22,
          "y": 580.88
        },
        "term:confirmation": {
          "x": 927.2,
          "y": 613
        },
        "term:persuasion": {
          "x": 518.01,
          "y": 525.54
        },
        "term:decision": {
          "x": 488.85,
          "y": 613
        },
        "term:implementation": {
          "x": 613.63,
          "y": 440.64
        },
        "term:innovators": {
          "x": 263.15,
          "y": 39.35
        },
        "term:laggards": {
          "x": 371.82,
          "y": 37
        },
        "term:early adopters": {
          "x": 491.96,
          "y": 37
        },
        "term:early majority": {
          "x": 615.49,
          "y": 142.92
        },
        "term:late majority": {
          "x": 627.85,
          "y": 37
        },
        "term:communication channel": {
          "x": 167.34,
          "y": 530.18
        },
        "term:social system": {
          "x": 85.95,
          "y": 394.63
        },
        "term:mass media channel": {
          "x": 101.7,
          "y": 233.27
        },
        "term:interpersonal channel": {
          "x": 452.69,
          "y": 393.41
        },
        "term:opinion leader": {
          "x": 139.66,
          "y": 86.31
        },
        "term:change agent": {
          "x": 242.08,
          "y": 172.3
        },
        "term:rate of adoption": {
          "x": 692.53,
          "y": 217.83
        },
        "term:reinvention": {
          "x": 758.98,
          "y": 479.37
        },
        "term:interpersonal influence": {
          "x": 355.95,
          "y": 557.72
        },
        "cluster:0": {
          "x": 758.48,
          "y": 295.23
        },
        "cluster:1": {
          "x": 654.9,
          "y": 613
        },
        "cluster:2": {
          "x": 415.68,
          "y": 193.17
        },
        "cluster:3": {
          "x": 254.49,
          "y": 346.75
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-19T08:32:51.871Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-19T08:32:53.862Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
