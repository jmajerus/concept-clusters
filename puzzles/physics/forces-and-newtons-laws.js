// Generated from content/puzzles/forces-and-newtons-laws.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "forces-and-newtons-laws",
  "title": "Forces and Newton's Laws — Motion Needs No Cause",
  "category": "physics",
  "subcategories": {
    "physics": "mechanics"
  },
  "info": {
    "text": "Forces are not properties a moving thing carries but interactions between bodies, and Newton's three laws form one system for accounting for them: motion persists without any cause, a nonzero net force produces acceleration in proportion to mass, and every push is one half of an equal and opposite pair. The lesson this board teaches: stop asking what keeps a thing moving, and ask what the net force is.",
    "links": [
      {
        "href": "wiki:Inertia"
      },
      {
        "href": "wiki:Newton's laws of motion"
      },
      {
        "href": "https://www.physicsclassroom.com/tutorial/newtons-laws/newtons-third-law/newtons-third-law"
      }
    ],
    "citations": [
      {
        "title": "Philosophiæ Naturalis Principia Mathematica",
        "author": "Isaac Newton",
        "year": "1687"
      },
      {
        "title": "University Physics, Volume 1",
        "author": "OpenStax",
        "publisher": "OpenStax",
        "year": "2016",
        "url": "https://openstax.org/details/books/university-physics-volume-1"
      }
    ]
  },
  "clusters": [
    {
      "id": "motion-without-cause",
      "name": "Motion without a cause",
      "color": "teal",
      "fact": "Newton's first law: a body's velocity changes only when a net force acts on it, so motion itself needs no explanation. The slowing and stopping we see everywhere is friction and drag at work — which is why a skydiver, once drag grows to balance weight, coasts down at a constant terminal velocity.",
      "terms": [
        "inertia",
        "balanced forces",
        "friction",
        "inertial reference frame",
        "terminal velocity"
      ],
      "seeds": [
        "inertia",
        "balanced forces"
      ],
      "termInfo": {
        "balanced forces": "Forces that cancel exactly: their vector sum is zero, so the motion does not change. A book on a table has gravity and the table's push in balance.",
        "friction": "The force between surfaces that opposes their sliding — the hidden stopper behind the mistaken belief that moving things need a push to keep moving.",
        "inertia": "A body's resistance to any change in its velocity: the reason coasting things keep coasting and resting things stay put. Galileo glimpsed it; Newton made it his first law.",
        "inertial reference frame": "A frame of reference in which the first law holds — one that is not accelerating. Newton's laws are true in these frames and only in them.",
        "terminal velocity": "The constant speed a falling body settles at once drag has grown to balance weight: zero net force, so no more acceleration."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Inertia"
          }
        ]
      }
    },
    {
      "id": "machinery-of-change",
      "name": "The machinery of change",
      "color": "blue",
      "fact": "Newton's second law makes 'force' into bookkeeping: add every push and pull as vectors into one net force, divide by the body's mass, and the result is the acceleration. The unit this arithmetic carries — the newton — is the force that gives a one-kilogram mass an acceleration of one metre per second per second.",
      "terms": [
        "acceleration",
        "mass",
        "newton (unit)"
      ],
      "seeds": [
        "acceleration",
        "mass"
      ],
      "termInfo": {
        "acceleration": "The rate of change of velocity — speeding up, slowing down, or turning. What any nonzero net force produces, in proportion to that force and in inverse proportion to the mass.",
        "mass": "The quantity of inertia in a body: the m in F = ma, saying how hard the body's velocity is to change. Not its weight — mass is the same on the Moon.",
        "newton (unit)": "The SI unit of force, 1 N = 1 kg·m/s²: the push that gives a one-kilogram mass an acceleration of one metre per second per second — roughly the weight of a small apple."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Newton's laws of motion"
          }
        ]
      }
    },
    {
      "id": "forces-are-interactions",
      "name": "Forces come in pairs",
      "color": "amber",
      "fact": "Newton's third law: every force is one end of an interaction between two bodies, equal in magnitude and opposite in direction. A rocket's thrust pushes exhaust backward to be pushed forward; a rifle's recoil is the paired half of the bullet's launch; the floor's normal force and a rope's tension are quiet pairs holding everyday life up.",
      "terms": [
        "thrust",
        "recoil",
        "normal force",
        "tension",
        "action–reaction pair"
      ],
      "seeds": [
        "thrust",
        "recoil"
      ],
      "termInfo": {
        "action–reaction pair": "The two halves of one interaction: A pushes B exactly as hard and exactly oppositely as B pushes A, at the same instant — and on two different bodies.",
        "normal force": "A surface's perpendicular push against whatever presses on it — your chair pushing up on you right now. The surface's half of the contact interaction.",
        "recoil": "The backward jolt a launcher gets when it hurls something forward: the paired half of the projectile's launch, felt by the rifle rather than the bullet.",
        "tension": "The pull a rope, cable, or string transmits along its length — the paired stretch between whatever it connects.",
        "thrust": "Forward force produced by throwing mass backward: a rocket pushes exhaust out one end, and the exhaust pushes the rocket forward — a third-law pair at work."
      },
      "info": {
        "links": [
          {
            "href": "https://www.physicsclassroom.com/tutorial/newtons-laws/newtons-third-law/newtons-third-law"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "net-force",
      "term": "net force",
      "clusters": [
        0,
        1
      ],
      "fact": "The same vector sum reads both laws: add up the forces and find zero, and velocity stays constant — 'balanced forces' is just another name for zero net force. Find anything left over and it equals mass times acceleration.",
      "info": "The one number that decides everything: the vector sum of all forces acting on a body. Zero means the first law; anything left over means the second.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "balanced forces",
        "acceleration"
      ]
    },
    {
      "id": "free-body-diagram",
      "term": "free-body diagram",
      "clusters": [
        1,
        2
      ],
      "fact": "One diagram per body: draw an arrow for every pusher so the sum can enter F = ma — and because an action–reaction pair's two halves act on two different bodies, they can never share a diagram.",
      "info": "The bookkeeper's tool: one sketch per body, an arrow for every force acting on that body. If two arrows on the same diagram claim to be a third-law pair, a mistake has already been made — the pair's halves act on two different bodies.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "action–reaction pair"
      ]
    }
  ],
  "lenses": [
    {
      "id": "already-zero",
      "prompt": "Which concepts name a situation in which every force has already cancelled — so nothing about the motion will change?",
      "explanation": "Inertia is the tendency that makes such situations possible, not a situation itself; friction and mass are participants in changing motion; and net force is the very quantity that reads zero here, not a situation the zero produces.",
      "targets": [
        "balanced forces",
        "terminal velocity"
      ],
      "reasons": {
        "balanced forces": "The cancellation itself, stated as a condition: vector sum zero, so the motion carries on unchanged.",
        "terminal velocity": "Drag has grown to balance weight; from there the fall proceeds at constant speed."
      }
    },
    {
      "id": "building-the-newton",
      "prompt": "Which two quantities combine to define the unit in which every force is measured — the newton?",
      "explanation": "The newton itself is the unit being defined, and net force is the quantity the unit measures — neither is a component of the definition, which is exactly 1 N = 1 kg·m/s².",
      "targets": [
        "mass",
        "acceleration"
      ],
      "reasons": {
        "acceleration": "Metres per second per second: the response a force of one newton buys per kilogram.",
        "mass": "Kilograms: one newton is the force that gives one kilogram one unit of acceleration."
      }
    },
    {
      "id": "holding-things-still",
      "prompt": "Which concepts name forces that hold things up or fasten them in place while nothing moves?",
      "explanation": "Thrust and recoil belong to things in motion — exhaust expelled, projectiles launched — and the action–reaction pair names the relation between two forces rather than any one holding force.",
      "targets": [
        "normal force",
        "tension"
      ],
      "reasons": {
        "normal force": "The chair's steady upward push on you: a stationary surface's half of the contact interaction.",
        "tension": "The rope's steady pull suspending the lamp — fastening without moving."
      }
    },
    {
      "id": "the-hinge",
      "prompt": "Which single concept reads both of the first two laws at once — zero and nothing changes, anything left over and the body accelerates?",
      "explanation": "Balanced forces and acceleration each describe one side only; the net force is the quantity whose value selects which law you are reading.",
      "targets": [
        "net force"
      ],
      "reasons": {
        "net force": "The vector sum itself: its zero case is the first law, its nonzero case the second."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "momentum-and-energy-conservation",
        "reason": "The conservation arc's next lesson: these three laws describe interactions frame by frame; momentum and energy are the ledgers that survive them unchanged."
      },
      {
        "id": "gravity-and-orbits",
        "reason": "The unification payoff: this board's laws plus one inverse-square force hold the Moon in its fall — an orbit as perpetual free fall."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Motion needs no cause",
    "summary": "Newton's three laws as one accounting system: inertia, F = ma, and the paired pushes behind every force.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "## The question Newton flipped\r\n\r\nEveryday experience insists that moving things stop unless something keeps pushing them. Newton's first law reverses the burden: a body's velocity changes only when a net force acts on it. Motion itself needs no cause — changes in motion do. What hides the law from common sense is friction, the force between surfaces that quietly slows everything we see. Set yourself in an inertial reference frame — one that is not accelerating — and coasting simply never ends. Inertia names this stubbornness: a quantity a body has, not a condition it needs.\r\n\r\n## The bookkeeping\r\n\r\nWhen pushes and pulls do not cancel, the leftover is the net force, and it produces acceleration in proportion: F = ma. Mass is the m — the body's inertia, measured in kilograms — and acceleration is the response. The unit of force falls straight out of that arithmetic: one newton is what it takes to push one kilogram to one metre per second per second, roughly the weight of a small apple. To put the law to work, accountants of motion draw a free-body diagram: one sketch per body, an arrow for every force acting on that body, and a sum at the end.\r\n\r\n## Every push has a partner\r\n\r\nThe third law says every force is one end of an interaction: A pushes B exactly as hard, exactly oppositely, at the same instant. The rocket's thrust is the exhaust shoved backward; the rifle's recoil is the bullet flung forward. The floor's normal force holds you up; a rope's tension holds the lamp. Because each pair's halves act on two different bodies, the two arrows of a pair never share one free-body diagram. So stop asking what keeps a thing moving. Ask what the net force is — and which paired push every force in your answer is one half of."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      },
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "forces-and-newtons-laws",
      "puzzleRevision": "fnv1a32:333c86c8",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:inertia": {
          "x": 392.92,
          "y": 167.3,
          "pinned": false
        },
        "term:balanced forces": {
          "x": 424.82,
          "y": 54.44,
          "pinned": false
        },
        "term:friction": {
          "x": 447.87,
          "y": 245.1,
          "pinned": false
        },
        "term:inertial reference frame": {
          "x": 303.85,
          "y": 282.53,
          "pinned": false
        },
        "term:terminal velocity": {
          "x": 285.38,
          "y": 106.35,
          "pinned": false
        },
        "term:acceleration": {
          "x": 630.42,
          "y": 147.05,
          "pinned": false
        },
        "term:mass": {
          "x": 727.77,
          "y": 132.74,
          "pinned": false
        },
        "term:newton (unit)": {
          "x": 722.5,
          "y": 234.15,
          "pinned": false
        },
        "term:thrust": {
          "x": 383.31,
          "y": 488.26,
          "pinned": false
        },
        "term:recoil": {
          "x": 358.83,
          "y": 570.49,
          "pinned": false
        },
        "term:normal force": {
          "x": 462.61,
          "y": 556.62,
          "pinned": false
        },
        "term:tension": {
          "x": 296.39,
          "y": 507.14,
          "pinned": false
        },
        "term:action–reaction pair": {
          "x": 486.84,
          "y": 409.82,
          "pinned": false
        },
        "term:net force": {
          "x": 547.63,
          "y": 68.46,
          "pinned": false
        },
        "term:free-body diagram": {
          "x": 587.45,
          "y": 279.61,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 1959.39,
        "score": 1959.393165485895
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:06:32.146Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "forces-and-newtons-laws",
      "puzzleRevision": "fnv1a32:333c86c8",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 726.14,
          "y": 248.72,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 456.55,
          "pinned": false
        },
        "cluster:2": {
          "x": 233.86,
          "y": 248.72,
          "pinned": false
        }
      },
      "bridges": {
        "term:net force": {
          "x": 577.2,
          "y": 341.92,
          "pinned": false
        },
        "term:free-body diagram": {
          "x": 428.99,
          "y": 322.79,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "inertia",
          "balanced forces",
          "friction",
          "inertial reference frame",
          "terminal velocity"
        ],
        "cluster:1": [
          "acceleration",
          "mass",
          "newton (unit)"
        ],
        "cluster:2": [
          "thrust",
          "recoil",
          "normal force",
          "tension",
          "action–reaction pair"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "friction",
          "terminal velocity",
          "inertial reference frame",
          "balanced forces",
          "inertia"
        ],
        "cluster:1": [
          "acceleration",
          "newton (unit)",
          "mass"
        ],
        "cluster:2": [
          "thrust",
          "tension",
          "action–reaction pair",
          "normal force",
          "recoil"
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
        "totalLength": 379.54377949363123
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:06:32.846Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "forces-and-newtons-laws",
      "puzzleRevision": "fnv1a32:333c86c8",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:inertia": {
          "x": 303.26,
          "y": 545.12
        },
        "term:balanced forces": {
          "x": 419.68,
          "y": 511.37
        },
        "term:friction": {
          "x": 210.87,
          "y": 581.12
        },
        "term:inertial reference frame": {
          "x": 107.59,
          "y": 468.49
        },
        "term:terminal velocity": {
          "x": 154.43,
          "y": 293.4
        },
        "term:acceleration": {
          "x": 541.19,
          "y": 447.93
        },
        "term:mass": {
          "x": 828,
          "y": 440.04
        },
        "term:newton (unit)": {
          "x": 755.46,
          "y": 555.8
        },
        "term:thrust": {
          "x": 331.63,
          "y": 26.99
        },
        "term:recoil": {
          "x": 421.18,
          "y": 22
        },
        "term:normal force": {
          "x": 530.2,
          "y": 22
        },
        "term:tension": {
          "x": 642.26,
          "y": 22
        },
        "term:action–reaction pair": {
          "x": 626.82,
          "y": 156.17
        },
        "term:net force": {
          "x": 440.98,
          "y": 385.67
        },
        "term:free-body diagram": {
          "x": 547.14,
          "y": 304.54
        },
        "cluster:0": {
          "x": 292.36,
          "y": 400.73
        },
        "cluster:1": {
          "x": 696.57,
          "y": 401.26
        },
        "cluster:2": {
          "x": 448.74,
          "y": 151.37
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-17T07:06:33.719Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-17T07:06:31.349Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
