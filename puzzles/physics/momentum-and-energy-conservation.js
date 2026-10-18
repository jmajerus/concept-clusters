// Generated from content/puzzles/momentum-and-energy-conservation.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "momentum-and-energy-conservation",
  "title": "What Stays Constant — Momentum and Energy",
  "category": "physics",
  "subcategories": {
    "physics": "mechanics"
  },
  "info": {
    "text": "Forces tell you how an interaction unfolds moment to moment; conservation tells you how it must end. Momentum — mass times velocity, direction included — is conserved in every interaction of a closed system, and total energy is never created or destroyed; which crashes keep kinetic energy as well, and which dissipate it into heat and sound, separates elastic from inelastic collisions — and explosions run the whole story backwards.",
    "links": [
      {
        "href": "wiki:Momentum"
      },
      {
        "href": "wiki:Conservation of energy"
      },
      {
        "href": "wiki:Elastic collision"
      }
    ],
    "citations": [
      {
        "title": "The Feynman Lectures on Physics, Vol. 1",
        "author": "Richard P. Feynman",
        "publisher": "Addison-Wesley",
        "year": "1963",
        "url": "https://www.feynmanlectures.caltech.edu/"
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
      "id": "momentum-ledger",
      "name": "Momentum and its bookkeeping",
      "color": "teal",
      "fact": "Momentum — mass times velocity, direction built in — is the quantity of motion. For a closed system one pure bookkeeping rule holds no matter how messy the internal forces get: the total momentum never changes, which is why the system's center of mass sails on at constant velocity through every internal crash.",
      "terms": [
        "momentum",
        "conservation of momentum",
        "impulse",
        "closed system",
        "center of mass"
      ],
      "seeds": [
        "momentum",
        "conservation of momentum"
      ],
      "termInfo": {
        "center of mass": "The system's weighted average position, which moves as if all the mass were a single particle feeling only outside forces: however the parts collide, it coasts on at constant velocity.",
        "closed system": "A collection of bodies with nothing getting in or out — no outside force to spoil the books. The condition under which conservation of momentum holds exactly.",
        "conservation of momentum": "The bookkeeping rule no interaction has ever broken: add up every body's momentum in a closed system, and the total before equals the total after — the internal forces cancel in pairs.",
        "impulse": "Force accumulated over the time it acts: J = FΔt, exactly the momentum change it delivers. The same change from a gentle push held long or a hard shove held brief.",
        "momentum": "Mass times velocity, with the velocity's direction built in: p = mv. The quantity of motion that interactions redistribute but a closed system never loses."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Momentum"
          }
        ]
      }
    },
    {
      "id": "energy-transformations",
      "name": "Energy and its transformations",
      "color": "blue",
      "fact": "Energy changes form without vanishing: work — force applied along a distance — converts it between motion and storage, as when a raised weight banks potential energy. Total energy is conserved, but mechanical energy is conservation with a catch: dissipation leaks it into heat and sound, where it stops being useful for pushing things around.",
      "terms": [
        "potential energy",
        "work",
        "conservation of energy",
        "dissipation"
      ],
      "seeds": [
        "potential energy",
        "work"
      ],
      "termInfo": {
        "conservation of energy": "Energy is never created or destroyed, only converted among forms. The total always balances; the catch is what happens to the useful, mechanical share.",
        "dissipation": "The leak: mechanical energy turning into heat and sound through friction, deformation, and drag — conserved as energy in total, but no longer able to push anything around.",
        "potential energy": "Energy stored by configuration — a raised weight, a compressed spring — ready to become motion: the deposit that gravity or elasticity can draw on later.",
        "work": "Force applied along a distance: W = Fd when they point the same way. The currency of energy conversion — positive work banks energy into a body, negative work draws it out."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Conservation of energy"
          }
        ]
      }
    },
    {
      "id": "the-crash-tells-you",
      "name": "The crash tells you",
      "color": "amber",
      "fact": "Interactions divide into kinds by what survives: in an elastic collision the bodies rebound and kinetic energy survives along with the momentum; in an inelastic one deformation eats kinetic energy; when bodies stick together — perfectly inelastic — the loss is as large as the conservation laws allow. The coefficient of restitution grades every bounce between the extremes, from 1 to 0.",
      "terms": [
        "elastic collision",
        "inelastic collision",
        "perfectly inelastic collision",
        "coefficient of restitution"
      ],
      "seeds": [
        "elastic collision",
        "inelastic collision"
      ],
      "termInfo": {
        "coefficient of restitution": "The bounce, graded: the ratio of separation speed to approach speed along the line of impact — 1 for perfectly elastic, 0 for perfectly sticky.",
        "elastic collision": "A collision whose deformation fully springs back: the bodies rebound, and kinetic energy survives the encounter along with the momentum. Billiard balls come close; colliding atoms manage it exactly.",
        "inelastic collision": "The everyday crash: some deformation stays, and part of the kinetic energy dissipates into heat and sound even as momentum is conserved exactly.",
        "perfectly inelastic collision": "The sticking extreme: the bodies leave as one, keeping the momentum and losing the largest share of kinetic energy the conservation laws allow."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Elastic collision"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "kinetic-energy",
      "term": "kinetic energy",
      "clusters": [
        1,
        2
      ],
      "fact": "Momentum survives every crash; kinetic energy is the discriminating quantity — it survives only the elastic ones, and in the rest it dissipates into heat and sound, which is why the wreckage tells you which conservation law held.",
      "info": "Watch this quantity, not momentum, to tell collision kinds apart: it is the only thing a crash consumes.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "conservation of energy",
        "elastic collision"
      ]
    },
    {
      "id": "explosion",
      "term": "explosion",
      "clusters": [
        0,
        2
      ],
      "fact": "A collision run in reverse: an explosion conserves momentum exactly as strictly as any crash, while kinetic energy increases — drawn out of stored potential energy. The same ledger, read backwards.",
      "info": "The mirror interaction: everything the momentum lesson says still holds; only the kinetic-energy sign flips.",
      "relationKind": "contrast",
      "idealTerms": [
        "conservation of momentum",
        "perfectly inelastic collision"
      ]
    }
  ],
  "lenses": [
    {
      "id": "cannon-recoil",
      "prompt": "A cannon fires: the ball speeds forward and the cannon kicks back, but much more slowly. Which concepts account for the recoil being slower than the ball?",
      "explanation": "Impulse would name the charge's force-time push, not the balance of the recoils; the closed system is the condition of the accounting, and the center of mass never moves at all in this shot — the slow backward drift of the heavy cannon against the fast ball is exactly equal and opposite momentum.",
      "targets": [
        "momentum",
        "conservation of momentum"
      ],
      "reasons": {
        "conservation of momentum": "The system's total was zero before the shot and stays zero after: ball and cannon carry equal, opposite momenta.",
        "momentum": "Mass times velocity with direction: the ball's large mv forward equals the cannon's mv backward, so the heavy body must move slowly."
      }
    },
    {
      "id": "pendulum-in-the-lab",
      "prompt": "A textbook pendulum swings forever, but a real one in a laboratory eventually stops. Which concepts name the difference between the two books?",
      "explanation": "Work and potential energy name conversions and storage of energy that is still mechanical; the pendulum's loss is precisely the share that stops being either — the difference between the textbook's ideal and the lab's drag and squeak.",
      "targets": [
        "conservation of energy",
        "dissipation"
      ],
      "reasons": {
        "conservation of energy": "The textbook's rule: total energy is never created or destroyed, only converted.",
        "dissipation": "The lab's leak: mechanical energy draining into heat and sound at the pivot and in the air until the swing dies."
      }
    },
    {
      "id": "clay-and-steel",
      "prompt": "Two lumps of clay collide and stick as one; two hardened steel bearings collide and rebound with barely any loss. Which concepts pin down these extremes of the same scale?",
      "explanation": "The two extremes and the number that grades between them. 'Inelastic collision' names the broad middle ground of everyday crashes, and momentum is the quantity all of these scenarios conserve equally — neither pins either end.",
      "targets": [
        "perfectly inelastic collision",
        "elastic collision",
        "coefficient of restitution"
      ],
      "reasons": {
        "coefficient of restitution": "The grader itself: e = 0 for the sticky clay, e approaching 1 for the ringing steel — the scale's units.",
        "elastic collision": "The bearings' end: rebound with kinetic energy fully surviving alongside momentum.",
        "perfectly inelastic collision": "The clay's end: one body leaves the impact, with the largest kinetic-energy loss the laws allow."
      }
    },
    {
      "id": "the-film-backwards",
      "prompt": "In which interaction do the momentum books balance exactly as in a crash, but the kinetic-energy ledger run the other way?",
      "explanation": "In every collision kinetic energy falls — bouncy ones keep it, crashing ones dissipate it. The explosion alone gains kinetic energy, drawn from stored potential energy, while the momentum books balance exactly as in any crash; elastic collision keeps energy but never adds it.",
      "targets": [
        "explosion"
      ],
      "reasons": {
        "explosion": "One body becoming many: momentum conserved, kinetic energy increasing from storage — the crash with time reversed."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "forces-and-newtons-laws",
        "reason": "The foundation underneath: force, mass, and acceleration are exactly what these conservation ledgers tally between."
      },
      {
        "id": "gravity-and-orbits",
        "reason": "The ledgers written across the sky: orbits and escape velocity are momentum and energy accounts kept by gravity itself."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The books always balance",
    "summary": "Momentum and energy are the ledgers an interaction cannot cook: what survives a crash tells you what kind of crash it was.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "## Two ledgers that cannot be cooked\r\n\r\nMomentum is mass times velocity, direction built in — the quantity of motion. For a closed system, one pure bookkeeping rule holds through every push, crash, and blast: the total never changes. Internal forces cancel in pairs, so the system's center of mass coasts on regardless of the drama inside. Impulse is how a force delivers momentum — a gentle push held long or a hard kick held brief, FΔt either way.\r\n\r\n## The energy books, with a catch\r\n\r\nEnergy keeps a different set of books. Work — force applied along a distance — moves energy between motion and storage: kinetic to potential and back as a weight rises and falls or a spring coils and releases. Total energy is never created or destroyed; the catch is that the mechanical share, the part that can still push things around, leaks. Dissipation turns it into heat and sound, where it still exists but no longer does useful work.\r\n\r\n## Reading the wreckage\r\n\r\nPut the ledgers side by side at a collision. Momentum always balances. Kinetic energy is the discriminating column: it survives the bouncy, elastic collisions; in inelastic crashes some dissipates; when bodies stick — the perfectly inelastic extreme — the loss is as large as allowed, and the coefficient of restitution grades the bounce from 1 to 0. Run the film backwards and you have an explosion: momentum conserved exactly, kinetic energy grown from storage. Stop tracking the force frame by frame; read the ledgers instead — what survives tells you what happened."
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
      "puzzleId": "momentum-and-energy-conservation",
      "puzzleRevision": "fnv1a32:e0044f0a",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:momentum": {
          "x": 573.01,
          "y": 483.8,
          "pinned": false
        },
        "term:conservation of momentum": {
          "x": 721.7,
          "y": 478.12,
          "pinned": false
        },
        "term:impulse": {
          "x": 603.2,
          "y": 393.5,
          "pinned": false
        },
        "term:closed system": {
          "x": 459.54,
          "y": 496.18,
          "pinned": false
        },
        "term:center of mass": {
          "x": 603.47,
          "y": 597,
          "pinned": false
        },
        "term:potential energy": {
          "x": 177.02,
          "y": 203.13,
          "pinned": false
        },
        "term:work": {
          "x": 249.24,
          "y": 118.85,
          "pinned": false
        },
        "term:conservation of energy": {
          "x": 227.34,
          "y": 363.1,
          "pinned": false
        },
        "term:dissipation": {
          "x": 88.16,
          "y": 302.16,
          "pinned": false
        },
        "term:elastic collision": {
          "x": 512.33,
          "y": 309.7,
          "pinned": false
        },
        "term:inelastic collision": {
          "x": 536.48,
          "y": 150.1,
          "pinned": false
        },
        "term:perfectly inelastic collision": {
          "x": 699.77,
          "y": 264.17,
          "pinned": false
        },
        "term:coefficient of restitution": {
          "x": 357.1,
          "y": 211.96,
          "pinned": false
        },
        "term:kinetic energy": {
          "x": 387.32,
          "y": 384.44,
          "pinned": false
        },
        "term:explosion": {
          "x": 829.24,
          "y": 370.77,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2472.78,
        "score": 2472.7770281068683
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:07:35.476Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "momentum-and-energy-conservation",
      "puzzleRevision": "fnv1a32:e0044f0a",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 256.51,
          "y": 256.7,
          "pinned": false
        },
        "cluster:1": {
          "x": 480,
          "y": 440.61,
          "pinned": false
        },
        "cluster:2": {
          "x": 703.49,
          "y": 256.7,
          "pinned": false
        }
      },
      "bridges": {
        "term:kinetic energy": {
          "x": 665.29,
          "y": 422.19,
          "pinned": false
        },
        "term:explosion": {
          "x": 460.2,
          "y": 236.9,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "momentum",
          "conservation of momentum",
          "impulse",
          "closed system",
          "center of mass"
        ],
        "cluster:1": [
          "potential energy",
          "work",
          "conservation of energy",
          "dissipation"
        ],
        "cluster:2": [
          "elastic collision",
          "inelastic collision",
          "perfectly inelastic collision",
          "coefficient of restitution"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "impulse",
          "closed system",
          "conservation of momentum",
          "center of mass",
          "momentum"
        ],
        "cluster:1": [
          "dissipation",
          "potential energy",
          "conservation of energy",
          "work"
        ],
        "cluster:2": [
          "inelastic collision",
          "perfectly inelastic collision",
          "coefficient of restitution",
          "elastic collision"
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
        "totalLength": 450.3466446496474
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:07:36.366Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "momentum-and-energy-conservation",
      "puzzleRevision": "fnv1a32:e0044f0a",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:momentum": {
          "x": 580.24,
          "y": 22
        },
        "term:conservation of momentum": {
          "x": 444.6,
          "y": 112.55
        },
        "term:impulse": {
          "x": 684.9,
          "y": 22
        },
        "term:closed system": {
          "x": 792.2,
          "y": 58.02
        },
        "term:center of mass": {
          "x": 835.25,
          "y": 188.18
        },
        "term:potential energy": {
          "x": 889.6,
          "y": 341.56
        },
        "term:work": {
          "x": 813.12,
          "y": 518.09
        },
        "term:conservation of energy": {
          "x": 574.6,
          "y": 576.93
        },
        "term:dissipation": {
          "x": 730.39,
          "y": 582.41
        },
        "term:elastic collision": {
          "x": 419.83,
          "y": 496.1
        },
        "term:inelastic collision": {
          "x": 121.91,
          "y": 598
        },
        "term:perfectly inelastic collision": {
          "x": 340.06,
          "y": 305.06
        },
        "term:coefficient of restitution": {
          "x": 101.9,
          "y": 370.82
        },
        "term:kinetic energy": {
          "x": 513.76,
          "y": 380.17
        },
        "term:explosion": {
          "x": 504.26,
          "y": 256.33
        },
        "cluster:0": {
          "x": 651.55,
          "y": 174.38
        },
        "cluster:1": {
          "x": 702.89,
          "y": 403.4
        },
        "cluster:2": {
          "x": 254.9,
          "y": 489.5
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-17T07:07:37.647Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-17T07:07:33.800Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
