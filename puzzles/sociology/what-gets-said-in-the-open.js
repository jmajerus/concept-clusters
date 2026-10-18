// Generated from content/puzzles/what-gets-said-in-the-open.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "what-gets-said-in-the-open",
  "title": "What gets said in the open",
  "category": "sociology",
  "subcategories": {
    "sociology": "institutions-organizations"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Amy Edmondson's account of what makes it possible to speak up to power directly, rather than around it -- the sanctioned channel that survives, when it survives, only because someone built it on purpose.",
    "citations": [
      {
        "title": "The Fearless Organization: Creating Psychological Safety in the Workplace for Learning, Innovation, and Growth",
        "author": "Amy C. Edmondson",
        "publisher": "John Wiley & Sons",
        "year": "2018"
      },
      {
        "title": "Psychological Safety and Learning Behavior in Work Teams",
        "author": "Amy C. Edmondson",
        "publisher": "Administrative Science Quarterly, 44(2)",
        "year": "1999",
        "pages": "pp. 350-383"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-what-it-is",
      "name": "What psychological safety actually is",
      "color": "teal",
      "fact": "Edmondson's original definition, from 1999, is precise and worth holding onto exactly: a shared belief that the environment is safe for interpersonal risk-taking. Not that the environment is pleasant. Not that people are nice to each other. Specifically that a person who speaks up -- with a question, an objection, an admission of error -- will not be embarrassed, rejected, or punished for it. Absent that belief, the default is not neutral. It is to fit in and go along.",
      "terms": [
        "psychological safety",
        "interpersonal risk",
        "fitting in and going along"
      ],
      "seeds": [
        "psychological safety",
        "interpersonal risk"
      ],
      "termInfo": {
        "fitting in and going along": {
          "text": "The default human instinct, absent any belief that speaking up is safe -- conform, stay quiet, let it pass. Not a personal failing. What most people do most of the time without safety."
        },
        "interpersonal risk": {
          "text": "What a person exposes themselves to by speaking up -- being wrong in front of others, being seen as difficult, being the one who slowed things down."
        },
        "psychological safety": {
          "text": "A shared belief that the environment is safe for interpersonal risk-taking. A team-level climate, not an individual trait or a manager's personality."
        }
      },
      "info": "Edmondson's precise, original definition of psychological safety, distinguished sharply from comfort, niceness, or the mere absence of conflict."
    },
    {
      "id": "cluster-two-axes",
      "name": "Safety alone isn't the goal",
      "color": "blue",
      "fact": "Edmondson's key correction to a common misreading of her own work: psychological safety alone is not the goal. Cross it against how high the standards are, and four distinct climates fall out. Safety with low standards just produces comfort. High standards with no safety produces anxiety. Neither produces what an organization actually needs, which sits in the fourth quadrant, where both are high at once.",
      "terms": [
        "the learning zone",
        "the comfort zone",
        "the anxiety zone",
        "the apathy zone"
      ],
      "seeds": [
        "the learning zone",
        "the comfort zone"
      ],
      "termInfo": {
        "the anxiety zone": {
          "text": "High standards, low safety: people know exactly what's expected and are afraid to admit when they can't meet it, or when something is wrong."
        },
        "the apathy zone": {
          "text": "Low safety, low standards: nobody is pushed and nobody feels safe enough to push back either. The quietest and least productive of the four."
        },
        "the comfort zone": {
          "text": "High safety, low standards: pleasant, low-conflict, and not actually asking much of anyone. Often mistaken for the goal, because it feels like success."
        },
        "the learning zone": {
          "text": "High safety and high standards together: the one climate where people take the interpersonal risk of speaking up specifically because something real is at stake."
        }
      },
      "info": "The two-axis framework crossing psychological safety against standards, and the four distinct climates that result."
    },
    {
      "id": "cluster-cost",
      "name": "The cost of silence",
      "color": "amber",
      "fact": "One of Edmondson's central cases: a neonatal nurse who sensed something was wrong with a premature infant, and the gap between noticing and acting on it. The pattern generalizes far past medicine. A failure counts as avoidable, in her account, specifically when someone in the room already knew -- and the thing that stood between knowing and speaking was never information. It was whether speaking felt survivable.",
      "terms": [
        "avoidable failure",
        "the 85 percent finding",
        "dangerous silence"
      ],
      "seeds": [
        "avoidable failure",
        "the 85 percent finding"
      ],
      "termInfo": {
        "avoidable failure": {
          "text": "A failure where someone in the room already had the information that would have prevented it, and didn't say so."
        },
        "dangerous silence": {
          "text": "Not the absence of conflict -- the absence of the specific piece of information that would have changed the outcome, withheld because raising it felt too costly."
        },
        "the 85 percent finding": {
          "text": "Edmondson and James Detert's research finding that the large majority of employees have withheld something important from their manager out of fear of the consequences of speaking up."
        }
      },
      "info": "What happens in the absence of psychological safety -- not a vague cultural cost, but specific, documented failures traceable to someone who knew and didn't say."
    },
    {
      "id": "cluster-building",
      "name": "Building it deliberately",
      "color": "magenta",
      "fact": "Edmondson is emphatic that none of this is a matter of temperament -- neither a leader's warmth nor a team's personality produces it reliably. It is built through specific, repeatable moves: naming the stakes and uncertainty honestly rather than projecting false confidence, actively asking rather than waiting to be told, and then handling whatever gets said back in a way that makes it worth doing again.",
      "terms": [
        "framing the work",
        "inviting participation",
        "responding productively"
      ],
      "seeds": [
        "framing the work",
        "inviting participation"
      ],
      "termInfo": {
        "framing the work": {
          "text": "Naming the stakes and the real uncertainty up front, rather than projecting false confidence that makes any later doubt look like a failure to keep up."
        },
        "inviting participation": {
          "text": "Actively asking -- specific, curious questions, not a general open door -- rather than waiting for people to volunteer what they're afraid to raise unprompted."
        },
        "responding productively": {
          "text": "How a leader handles whatever gets said back: with genuine attention, not visible irritation, regardless of whether the answer was welcome."
        }
      },
      "info": "The deliberate, repeatable moves Edmondson argues actually build psychological safety -- not a matter of temperament or team chemistry."
    }
  ],
  "bridges": [
    {
      "id": "bridge-what-silence-costs",
      "term": "what silence costs",
      "clusters": [
        0,
        2
      ],
      "fact": "Every interpersonal risk not taken is a piece of information that stays with whoever noticed it. Edmondson's research with James Detert found that the overwhelming majority of employees have sat on something important rather than raise it, out of fear of the consequences. None of that information was wrong to withhold, individually -- each choice made sense from inside it. The failures it adds up to are the part that doesn't.",
      "info": {
        "text": "How risk not taken, one reasonable decision at a time, accumulates into failures that were, in principle, avoidable."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "interpersonal risk",
        "avoidable failure"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-the-moment-after",
      "term": "the moment after",
      "clusters": [
        0,
        3
      ],
      "fact": "Psychological safety is not established once and then simply present. It is confirmed or quietly withdrawn every time someone actually takes the risk and finds out what happens next. Respond well, even to a wrong answer or an inconvenient question, and the belief holds. Punish it, even mildly, even unintentionally, and the next person who was watching learns the real rule.",
      "info": {
        "text": "The point where psychological safety is actually tested -- not when it's declared, but in how a leader reacts the moment someone uses it."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "psychological safety",
        "responding productively"
      ]
    },
    {
      "id": "bridge-building-toward-learning",
      "term": "building toward the learning zone",
      "clusters": [
        1,
        3
      ],
      "fact": "Safety by itself does not aim anywhere in particular -- a team can feel entirely safe and still coast. What framing the stakes and actively inviting contribution are actually building toward is not comfort. It is the learning zone specifically: safety paired with standards still held high enough that the safety gets used for something.",
      "info": {
        "text": "What the deliberate work of building safety is actually aimed at -- not comfort, but a zone where safety and high standards operate together."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "the learning zone",
        "framing the work"
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
      "id": "when-safety-is-missing",
      "prompt": "Which of these are what happens when psychological safety is missing, rather than what safety itself is?",
      "explanation": "These are what shows up in the room, or in the record, when the belief that speaking up is safe isn't there. The comfort zone is the excluded case on purpose: it has safety, just not standards, so it is not an instance of safety being absent -- it is what safety looks like when nothing is actually being asked of it.",
      "targets": [
        "the anxiety zone",
        "the apathy zone",
        "avoidable failure",
        "dangerous silence",
        "the 85 percent finding"
      ],
      "reasons": {
        "avoidable failure": "The concrete result of information that stayed unsaid.",
        "dangerous silence": "The absence itself, named directly.",
        "the 85 percent finding": "The measured scale of how often silence wins out over speaking.",
        "the anxiety zone": "High standards with nowhere safe to admit falling short of them.",
        "the apathy zone": "Neither safety nor standards -- nothing pushing anyone toward either."
      }
    },
    {
      "id": "the-climate-not-the-moment",
      "prompt": "Which of these describe an ongoing climate, rather than a single event or decision inside it?",
      "explanation": "These describe an ambient condition -- how a team or organization tends to feel, most of the time, independent of any single exchange. Avoidable failure is the excluded case: it is what a specific climate produces in a specific instance, not a description of the climate itself.",
      "targets": [
        "psychological safety",
        "the learning zone",
        "the comfort zone",
        "the anxiety zone",
        "the apathy zone"
      ],
      "reasons": {
        "psychological safety": "A shared, standing belief about the environment, not a one-time judgment.",
        "the anxiety zone": "A climate people operate inside continuously, not a single bad moment in it.",
        "the apathy zone": "Equally a standing condition, not a single lapse.",
        "the comfort zone": "Describes how the room generally feels, not what happened in it once.",
        "the learning zone": "The target climate itself, sustained rather than achieved once."
      }
    },
    {
      "id": "before-the-risk",
      "prompt": "Which of these exist before anyone has actually taken the risk of speaking up?",
      "explanation": "Edmondson's own sequence separates what happens before someone takes the risk of speaking from what happens after. These operate on the front end -- setting the conditions under which speaking up looks worth attempting at all. Responding productively is the excluded case, and necessarily so: it cannot happen until after someone has already spoken, which is exactly the distinction the round is testing.",
      "targets": [
        "psychological safety",
        "framing the work",
        "inviting participation"
      ],
      "reasons": {
        "framing the work": "Sets the stakes before any specific risk has been taken.",
        "inviting participation": "An invitation issued before anyone has answered it.",
        "psychological safety": "The standing belief already in place, prior to any one instance of testing it."
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
      "puzzleId": "what-gets-said-in-the-open",
      "puzzleRevision": "fnv1a32:15632d0b",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:psychological safety": {
          "x": 159.41,
          "y": 145.05,
          "pinned": false
        },
        "term:interpersonal risk": {
          "x": 78.7,
          "y": 23,
          "pinned": false
        },
        "term:fitting in and going along": {
          "x": 264.36,
          "y": 59,
          "pinned": false
        },
        "term:the learning zone": {
          "x": 191.26,
          "y": 302.97,
          "pinned": false
        },
        "term:the comfort zone": {
          "x": 72.4,
          "y": 205.1,
          "pinned": false
        },
        "term:the anxiety zone": {
          "x": 72.4,
          "y": 437,
          "pinned": false
        },
        "term:the apathy zone": {
          "x": 69.25,
          "y": 348.25,
          "pinned": false
        },
        "term:avoidable failure": {
          "x": 364.3,
          "y": 142.3,
          "pinned": false
        },
        "term:the 85 percent finding": {
          "x": 548.7,
          "y": 161.35,
          "pinned": false
        },
        "term:dangerous silence": {
          "x": 564.45,
          "y": 65.43,
          "pinned": false
        },
        "term:framing the work": {
          "x": 469.84,
          "y": 437,
          "pinned": false
        },
        "term:inviting participation": {
          "x": 548.7,
          "y": 373.89,
          "pinned": false
        },
        "term:responding productively": {
          "x": 431.44,
          "y": 301.69,
          "pinned": false
        },
        "term:what silence costs": {
          "x": 449.29,
          "y": 23,
          "pinned": false
        },
        "term:the moment after": {
          "x": 266.74,
          "y": 255.47,
          "pinned": false
        },
        "term:building toward the learning zone": {
          "x": 268.46,
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
        "totalLength": 3171.58,
        "score": 3171.5811882663643
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:11:08.019Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "what-gets-said-in-the-open",
      "puzzleRevision": "fnv1a32:15632d0b",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480,
          "y": 465.85,
          "pinned": false
        },
        "cluster:1": {
          "x": 142.06,
          "y": 318,
          "pinned": false
        },
        "cluster:2": {
          "x": 817.94,
          "y": 318,
          "pinned": false
        },
        "cluster:3": {
          "x": 480,
          "y": 170.15,
          "pinned": false
        }
      },
      "bridges": {
        "term:what silence costs": {
          "x": 722.51,
          "y": 465.46,
          "pinned": false
        },
        "term:the moment after": {
          "x": 344,
          "y": 318,
          "pinned": false
        },
        "term:building toward the learning zone": {
          "x": 214.86,
          "y": 147.91,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "psychological safety",
          "interpersonal risk",
          "fitting in and going along"
        ],
        "cluster:1": [
          "the learning zone",
          "the comfort zone",
          "the anxiety zone",
          "the apathy zone"
        ],
        "cluster:2": [
          "avoidable failure",
          "the 85 percent finding",
          "dangerous silence"
        ],
        "cluster:3": [
          "framing the work",
          "inviting participation",
          "responding productively"
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
        "totalLength": 485.41155422106186
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:11:10.643Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "what-gets-said-in-the-open",
      "puzzleRevision": "fnv1a32:15632d0b",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:psychological safety": {
          "x": 574.49,
          "y": 345.87
        },
        "term:interpersonal risk": {
          "x": 679.94,
          "y": 179.31
        },
        "term:fitting in and going along": {
          "x": 858.1,
          "y": 120.56
        },
        "term:the learning zone": {
          "x": 426.87,
          "y": 453.09
        },
        "term:the comfort zone": {
          "x": 889.6,
          "y": 558.65
        },
        "term:the anxiety zone": {
          "x": 765.5,
          "y": 598
        },
        "term:the apathy zone": {
          "x": 415.99,
          "y": 598
        },
        "term:avoidable failure": {
          "x": 521.92,
          "y": 185.55
        },
        "term:the 85 percent finding": {
          "x": 220.31,
          "y": 22
        },
        "term:dangerous silence": {
          "x": 530.04,
          "y": 22
        },
        "term:framing the work": {
          "x": 281.84,
          "y": 403.31
        },
        "term:inviting participation": {
          "x": 89.3,
          "y": 148.62
        },
        "term:responding productively": {
          "x": 255.78,
          "y": 230.24
        },
        "term:what silence costs": {
          "x": 692.01,
          "y": 22
        },
        "term:the moment after": {
          "x": 416.25,
          "y": 299.81
        },
        "term:building toward the learning zone": {
          "x": 213.33,
          "y": 597.03
        },
        "cluster:0": {
          "x": 805.3,
          "y": 364.95
        },
        "cluster:1": {
          "x": 589.42,
          "y": 545.33
        },
        "cluster:2": {
          "x": 383.29,
          "y": 96.7
        },
        "cluster:3": {
          "x": 105.97,
          "y": 373.51
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:11:13.904Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:11:04.732Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
