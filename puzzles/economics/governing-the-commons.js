// Generated from content/puzzles/governing-the-commons.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "governing-the-commons",
  "title": "Governing the commons",
  "category": "economics",
  "categories": [
    "economics",
    "sociology",
    "political-science",
    "peace-conflict-studies"
  ],
  "subcategories": {
    "economics": "political-economy",
    "peace-conflict-studies": "conflict-resolution-peacebuilding",
    "sociology": "institutions-organizations"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Elinor Ostrom's account of how communities sharing a finite resource have governed it for centuries without privatising it and without an outside enforcer -- and the features those arrangements turn out to have in common.",
    "links": [
      {
        "href": "https://www.beyondintractability.org/bksum/ostrom-governing"
      }
    ],
    "citations": [
      {
        "title": "Governing the Commons: The Evolution of Institutions for Collective Action",
        "author": "Ostrom, Elinor",
        "publisher": "Cambridge University Press",
        "year": "1990"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-trap",
      "name": "The trap",
      "color": "teal",
      "fact": "Hardin's herdsmen share a pasture. Each gains the full benefit of adding an animal and bears only a fraction of the cost of overgrazing, so the field is destroyed by people behaving reasonably. The argument is sound. What Ostrom disputed was its application: the pasture in the parable has no members, no rules, and no way to keep anyone out, which is not a commons but an open-access resource. Hardin later said he had meant unmanaged commons. By then the parable had done its work, and the two conclusions drawn from it -- privatise the resource, or hand it to the state -- had hardened into the only options on the table.",
      "terms": [
        "tragedy of the commons",
        "free riding",
        "common-pool resource",
        "open access"
      ],
      "seeds": [
        "tragedy of the commons",
        "free riding"
      ],
      "termInfo": {
        "common-pool resource": {
          "text": "A resource where keeping people out is difficult and one person's use subtracts from what is left -- a fishery, an aquifer, a pasture. The difficulty of exclusion is what makes it a governance problem rather than a property problem."
        },
        "free riding": {
          "text": "Taking the benefit of a shared arrangement while leaving its costs to others. The trouble is less that people do it than that expecting others to do it is reason enough to stop restraining yourself."
        },
        "open access": {
          "text": "A resource with no defined membership and no way to exclude anyone. Hardin's pasture is one of these. Most historical commons were not, which is the substitution the parable quietly makes."
        },
        "tragedy of the commons": {
          "text": "Hardin's 1968 argument that a shared finite resource will be depleted, because each user gains the whole benefit of taking more while bearing only a share of the cost.",
          "links": [
            {
              "href": "https://ostromworkshop.indiana.edu/courses-teaching/teaching-tools/tragedy-commons/index.html"
            }
          ]
        }
      },
      "info": {
        "text": "The argument that a shared resource is destroyed by the ordinary self-interest of the people using it.",
        "links": [
          {
            "href": "https://ostromworkshop.indiana.edu/courses-teaching/teaching-tools/tragedy-commons/index.html"
          }
        ]
      }
    },
    {
      "id": "cluster-rules",
      "name": "Drawing the lines",
      "color": "blue",
      "fact": "Three of Ostrom's principles concern who decides and what they decide. The group has to know its own edges. Its rules have to fit the particular resource rather than a template that worked somewhere else. And -- the one most often absent from schemes designed from outside -- the people living under the rules have to be able to change them. An arrangement failing that third condition tends to fail the second within a few years, because conditions shift and nobody with standing to notice can act on it.",
      "terms": [
        "clearly defined boundaries",
        "congruence with local conditions",
        "collective-choice arrangements"
      ],
      "seeds": [
        "clearly defined boundaries",
        "congruence with local conditions"
      ],
      "termInfo": {
        "clearly defined boundaries": {
          "text": "Who may draw from the resource, and what the resource includes. Without this nobody can tell an authorised use from an unauthorised one, and nothing else on the list can function."
        },
        "collective-choice arrangements": {
          "text": "The people affected by the rules can take part in changing them. Ostrom found this in nearly every long-enduring case and missing from most schemes imposed from outside."
        },
        "congruence with local conditions": {
          "text": "Rules matched to the specific resource -- its seasons, its yields, its geography -- rather than imported from a template."
        }
      },
      "info": {
        "text": "The principles governing who is in the group, what the rules say, and who gets to change them."
      }
    },
    {
      "id": "cluster-enforcement",
      "name": "Making the rules hold",
      "color": "amber",
      "fact": "A rule nobody checks is a suggestion. Ostrom's enduring cases monitored themselves -- the monitors were users, or answerable to users, rather than an inspectorate sent from outside -- and they punished first offences lightly. That last detail is easy to skip past and does a great deal of work: a heavy penalty for a first lapse makes reporting your neighbour so costly that people stop, and the rule dies quietly while still on the books.",
      "terms": [
        "monitoring",
        "graduated sanctions",
        "conflict-resolution mechanisms"
      ],
      "seeds": [
        "monitoring",
        "graduated sanctions"
      ],
      "termInfo": {
        "conflict-resolution mechanisms": {
          "text": "Somewhere cheap and quick to take a dispute. Rules generate disagreements about their application, and without a low-cost forum those disagreements become reasons to abandon the whole arrangement."
        },
        "graduated sanctions": {
          "text": "Penalties starting small and escalating with repetition. A severe first penalty makes people reluctant to report each other, which ends enforcement altogether."
        },
        "monitoring": {
          "text": "Someone actually checks conditions and behaviour -- and that someone is a user, or answerable to users, rather than an outside inspector."
        }
      },
      "info": {
        "text": "The principles that turn a rule on paper into one people actually keep."
      }
    },
    {
      "id": "cluster-outside",
      "name": "The world outside",
      "color": "magenta",
      "fact": "Two of the principles are not about the group at all, but about what surrounds it. Local arrangements need an outside authority that will not overrule them, and Ostrom's cases usually survived because governments left them alone rather than because governments helped. Where a resource is too large for one group, the answer she found was not a bigger authority but layers of smaller ones, each governing what it can actually see.",
      "terms": [
        "recognition of the right to organize",
        "nested enterprises",
        "polycentric governance"
      ],
      "seeds": [
        "recognition of the right to organize",
        "nested enterprises"
      ],
      "termInfo": {
        "nested enterprises": {
          "text": "For larger systems, governance in layers -- small units for local decisions, wider units for whatever crosses their boundaries -- rather than one body over the whole."
        },
        "polycentric governance": {
          "text": "Many overlapping centres of decision-making rather than a single one. Ostrom's later name for what nesting produces, and her answer to the assumption that scale requires centralisation."
        },
        "recognition of the right to organize": {
          "text": "External authorities do not challenge the group's right to make its own rules. Ostrom's cases often needed nothing more from the state than this."
        }
      },
      "info": {
        "text": "What a commons needs from the world beyond it, and what happens when the resource is too big for one group."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-credible-commitment",
      "term": "credible commitment",
      "clusters": [
        0,
        2
      ],
      "fact": "Nobody restrains themselves first if they expect everyone else to take whatever they leave. The obstacle is not selfishness; it is assurance. And assurance is not a feeling people can decide to have -- it is something an arrangement either produces or fails to produce. Monitoring and a schedule of penalties are the machinery that turns a shared promise into one it is reasonable to act on before anyone else has.",
      "info": {
        "text": "The problem of making a promise to restrain yourself believable enough that others will act on it. One of the three core problems Ostrom sets out."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "free riding",
        "monitoring"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-quasi-voluntary",
      "term": "quasi-voluntary compliance",
      "clusters": [
        1,
        2
      ],
      "fact": "People keep rules they had a hand in writing, provided they can see that most others are keeping them too. Neither half works alone. Participation without monitoring produces rules everyone endorses and nobody follows; monitoring without participation produces rules people evade on principle. This is why these two groups of principles are one mechanism rather than two lists.",
      "info": {
        "text": "Following a rule willingly, but conditional on evidence that others are doing the same."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "collective-choice arrangements",
        "graduated sanctions"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-external-authority",
      "term": "external authority",
      "clusters": [
        0,
        3
      ],
      "fact": "Hardin's argument, and the policy tradition that followed it, cast an outside enforcer as the thing that saves a commons. Ostrom's cases point the other way: what they most needed from outside was to be left alone. Not administration -- only non-interference. Where governments intervened by replacing local rules with national ones, arrangements that had run for centuries came apart within a generation.",
      "info": {
        "text": "The state, or any body outside the group of users, and what part it plays in whether a commons survives."
      },
      "relationKind": "contrast",
      "idealTerms": [
        null,
        "recognition of the right to organize"
      ]
    }
  ],
  "lenses": [
    {
      "id": "where-the-line-runs",
      "prompt": "Which of these are about where the line runs -- who counts as a member, and what falls inside the resource?",
      "explanation": "Almost everything else on this board rests on the answer to this one. You cannot monitor a group without knowing who is in it, cannot sanction someone who was never a member, and cannot fit rules to a resource whose extent is undefined. It is also where the parable does its damage: an open-access pasture has no line at all, and generalising from it to commons that do have lines is the substitution Ostrom spent a book undoing. Polycentric governance is the excluded case worth arguing over -- overlapping centres of authority are exactly where lines are least clean, and that is the point of them rather than a defect.",
      "targets": [
        "clearly defined boundaries",
        "common-pool resource",
        "open access",
        "nested enterprises"
      ],
      "reasons": {
        "clearly defined boundaries": "The principle is the line itself: who may draw, and from what.",
        "common-pool resource": "Defined by how hard exclusion is -- which is to say, by how badly the line behaves.",
        "nested enterprises": "Layers of governance are boundaries drawn at more than one scale at once.",
        "open access": "The case where no line exists at all, which is what makes it the parable's setting."
      }
    },
    {
      "id": "believable",
      "prompt": "Which of these exist to make a commitment believable, rather than to decide what the rules should say?",
      "explanation": "Ostrom's account separates two questions that policy discussion usually runs together: what the rules should be, and why anyone would follow them. The second is not answered by better rules. It is answered by arrangements letting each person see that their own restraint is not being farmed -- which is why monitoring by users rather than inspectors matters, and why a light first penalty matters. Congruence with local conditions is the excluded case: it makes rules worth following, which is a different job from making them followed.",
      "targets": [
        "monitoring",
        "graduated sanctions",
        "credible commitment",
        "quasi-voluntary compliance"
      ],
      "reasons": {
        "credible commitment": "Names the problem the other three are solving.",
        "graduated sanctions": "A penalty schedule people will actually apply is what makes the threat real.",
        "monitoring": "A promise nobody can check is not evidence about anything.",
        "quasi-voluntary compliance": "Willing compliance, held in place by seeing others comply."
      }
    },
    {
      "id": "built-not-inherited",
      "prompt": "Which of these deliberately supply something that two people in a long relationship get for nothing?",
      "explanation": "This is what makes Ostrom's problem harder than the two-player version. Two people in a long relationship see each other's moves, can answer a defection proportionately, and carry a shared history that makes repair possible -- all of it free, a by-product of there being two of them. A hundred irrigators sharing a canal have none of it. Every one of those conditions has to be built deliberately, paid for, and maintained, and the design principles are the specification for building them. Congruence with local conditions is excluded because it has no two-player analogue at all: it is about fitting rules to a resource, not to an opponent.",
      "targets": [
        "monitoring",
        "graduated sanctions",
        "conflict-resolution mechanisms",
        "clearly defined boundaries"
      ],
      "reasons": {
        "clearly defined boundaries": "Two people know exactly who they are dealing with; a hundred users of an aquifer do not.",
        "conflict-resolution mechanisms": "A couple can repair in the moment; a group needs somewhere to take it.",
        "graduated sanctions": "Proportionate response, written down in advance because no one's temper can be relied on to be proportionate.",
        "monitoring": "In a two-player game you see every move the other makes. Here someone has to be assigned to look."
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
      "puzzleId": "governing-the-commons",
      "puzzleRevision": "fnv1a32:30a46b72",
      "board": {
        "width": 740,
        "height": 530
      },
      "nodes": {
        "term:tragedy of the commons": {
          "x": 648.7,
          "y": 355.45,
          "pinned": false
        },
        "term:free riding": {
          "x": 485.11,
          "y": 367.32,
          "pinned": false
        },
        "term:common-pool resource": {
          "x": 655,
          "y": 507,
          "pinned": false
        },
        "term:open access": {
          "x": 556.03,
          "y": 453.09,
          "pinned": false
        },
        "term:clearly defined boundaries": {
          "x": 255.97,
          "y": 341.36,
          "pinned": false
        },
        "term:congruence with local conditions": {
          "x": 388.89,
          "y": 507,
          "pinned": false
        },
        "term:collective-choice arrangements": {
          "x": 116.5,
          "y": 507,
          "pinned": false
        },
        "term:monitoring": {
          "x": 408.94,
          "y": 291.94,
          "pinned": false
        },
        "term:graduated sanctions": {
          "x": 153.68,
          "y": 155.31,
          "pinned": false
        },
        "term:conflict-resolution mechanisms": {
          "x": 116.5,
          "y": 23,
          "pinned": false
        },
        "term:recognition of the right to organize": {
          "x": 564.3,
          "y": 23,
          "pinned": false
        },
        "term:nested enterprises": {
          "x": 400.28,
          "y": 157.18,
          "pinned": false
        },
        "term:polycentric governance": {
          "x": 332.46,
          "y": 23,
          "pinned": false
        },
        "term:credible commitment": {
          "x": 540.96,
          "y": 238.28,
          "pinned": false
        },
        "term:quasi-voluntary compliance": {
          "x": 103.9,
          "y": 234.16,
          "pinned": false
        },
        "term:external authority": {
          "x": 661.3,
          "y": 185,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3896.88,
        "score": 3896.880992009682
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:06:45.104Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "governing-the-commons",
      "puzzleRevision": "fnv1a32:30a46b72",
      "board": {
        "width": 1100,
        "height": 710
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 550,
          "y": 186.32,
          "pinned": false
        },
        "cluster:1": {
          "x": 177.86,
          "y": 363,
          "pinned": false
        },
        "cluster:2": {
          "x": 550,
          "y": 539.68,
          "pinned": false
        },
        "cluster:3": {
          "x": 922.14,
          "y": 363,
          "pinned": false
        }
      },
      "bridges": {
        "term:credible commitment": {
          "x": 550,
          "y": 363,
          "pinned": false
        },
        "term:quasi-voluntary compliance": {
          "x": 267.76,
          "y": 547.51,
          "pinned": false
        },
        "term:external authority": {
          "x": 775.87,
          "y": 178.58,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "tragedy of the commons",
          "free riding",
          "common-pool resource",
          "open access"
        ],
        "cluster:1": [
          "clearly defined boundaries",
          "congruence with local conditions",
          "collective-choice arrangements"
        ],
        "cluster:2": [
          "monitoring",
          "graduated sanctions",
          "conflict-resolution mechanisms"
        ],
        "cluster:3": [
          "recognition of the right to organize",
          "nested enterprises",
          "polycentric governance"
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
        "totalLength": 431.9878164557685
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:06:47.376Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "governing-the-commons",
      "puzzleRevision": "fnv1a32:30a46b72",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:tragedy of the commons": {
          "x": 706.02,
          "y": 685.1
        },
        "term:free riding": {
          "x": 462.81,
          "y": 470.79
        },
        "term:common-pool resource": {
          "x": 519.29,
          "y": 688
        },
        "term:open access": {
          "x": 373.97,
          "y": 666.39
        },
        "term:clearly defined boundaries": {
          "x": 206.42,
          "y": 683.43
        },
        "term:congruence with local conditions": {
          "x": 130.51,
          "y": 461.22
        },
        "term:collective-choice arrangements": {
          "x": 344.17,
          "y": 337
        },
        "term:monitoring": {
          "x": 664.79,
          "y": 266.16
        },
        "term:graduated sanctions": {
          "x": 513.19,
          "y": 218.39
        },
        "term:conflict-resolution mechanisms": {
          "x": 479.8,
          "y": 22
        },
        "term:recognition of the right to organize": {
          "x": 786.64,
          "y": 449.06
        },
        "term:nested enterprises": {
          "x": 958.39,
          "y": 241.92
        },
        "term:polycentric governance": {
          "x": 1010.7,
          "y": 409.92
        },
        "term:credible commitment": {
          "x": 572.72,
          "y": 376.61
        },
        "term:quasi-voluntary compliance": {
          "x": 275.48,
          "y": 119.17
        },
        "term:external authority": {
          "x": 585.67,
          "y": 544.66
        },
        "cluster:0": {
          "x": 445.6,
          "y": 580.67
        },
        "cluster:1": {
          "x": 322.87,
          "y": 535.6
        },
        "cluster:2": {
          "x": 667.62,
          "y": 117.01
        },
        "cluster:3": {
          "x": 796.55,
          "y": 230.43
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:06:49.953Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "auto",
    "savedAt": "2026-10-08T01:06:42.776Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
