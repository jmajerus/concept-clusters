// Generated from content/puzzles/gravity-and-orbits.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "gravity-and-orbits",
  "title": "The Fall That Misses — Gravity and Orbits",
  "category": "physics",
  "subcategories": {
    "physics": "mechanics"
  },
  "info": {
    "text": "Newton's unification in one lesson: a single inverse-square law pulls the apple and holds the Moon. Weight is gravity's local pull on you; an orbit is free fall that keeps missing the ground; weightlessness is the absence of a floor, not of gravity. Kepler's empirical ledger of ellipses, equal areas, and harmonic periods turns out to be what the law predicts — the Moon test showed it, and every satellite parked over one meridian still lives off the consequence.",
    "links": [
      {
        "href": "wiki:Newton's law of universal gravitation"
      },
      {
        "href": "wiki:Kepler's laws of planetary motion"
      },
      {
        "href": "wiki:Weightlessness"
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
      "id": "one-law-two-worlds",
      "name": "One law for apple and Moon",
      "color": "teal",
      "fact": "Gravity is not a property of heavy things near Earth but universal attraction between every pair of masses, weakening with the square of their separation. Weight is the Earth's pull on you — one local reading of a field that fills space, whose steep gradient across an extended body is what raises ocean tides.",
      "terms": [
        "universal gravitation",
        "weight",
        "inverse-square law",
        "gravitational field",
        "tidal force"
      ],
      "seeds": [
        "weight",
        "universal gravitation"
      ],
      "termInfo": {
        "gravitational field": "The map of the pull: the force per kilogram a body would feel at each point in space. Earth's field points inward everywhere, strongest near the surface and thinning with altitude.",
        "inverse-square law": "Gravity's distance rule: double the separation and the pull drops to a quarter — the dilution of the field as it spreads through ever-larger spheres of space.",
        "tidal force": "The difference in gravity across an extended body: near side pulled harder than far side, and stretched as a result. The Moon's gradient raises the ocean's bulges; a steeper one would pull a daredevil apart.",
        "universal gravitation": "Every pair of masses attracts along the line joining them, with a force proportional to both masses. One law for apples, Moons, and galaxies — the unification the Principia announced.",
        "weight": "The gravitational force on a body: its mass times the local field strength. A reading of where you are, not what you are — on the Moon the same mass weighs a sixth as much."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Newton's law of universal gravitation"
          }
        ]
      }
    },
    {
      "id": "falling-that-misses",
      "name": "Falling that keeps missing",
      "color": "blue",
      "fact": "An orbit is continuous free fall: fire Newton's cannonball ever faster and at one speed it falls toward Earth at exactly the rate the ground curves away, and thereafter keeps missing. A station's crew feel weightless not because gravity is absent up there — it is nearly as strong as at the surface — but because nothing is pushing back.",
      "terms": [
        "orbit",
        "escape velocity",
        "free fall",
        "weightlessness",
        "centripetal acceleration"
      ],
      "seeds": [
        "orbit",
        "escape velocity"
      ],
      "termInfo": {
        "centripetal acceleration": "The inward acceleration of any curved path — v²/r for a circle. For an orbit, gravity IS that acceleration: the fall that keeps the satellite turning instead of flying off straight.",
        "escape velocity": "The launch speed that outruns gravity entirely — about 11.2 km/s from Earth's surface. Below it, the fall returns or circles; above it, the departing body never comes back.",
        "free fall": "Motion under gravity alone, nothing pushing back. Everything falling together — elevator, station, crew — floats as one, whatever the local strength of the field.",
        "orbit": "The path of a body in continuous free fall around another: sideways motion fast enough that the fall curves around the primary rather than meeting the ground.",
        "weightlessness": "The sensation of having no weight: not the absence of gravity but the absence of a floor. Free fall removes the push you feel as weight while gravity keeps working exactly as before."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Weightlessness"
          }
        ]
      }
    },
    {
      "id": "planets-ledger",
      "name": "The planets' ledger",
      "color": "amber",
      "fact": "Kepler distilled the observations into three rules with no theory of why: planets move in ellipses with the Sun at one focus, sweep equal areas in equal times, and keep periods that grow with the three-halves power of their mean distance. An astronomer could keep the books completely without knowing what enforced them.",
      "terms": [
        "Kepler's laws",
        "ellipse",
        "equal areas in equal times",
        "harmonic law"
      ],
      "seeds": [
        "Kepler's laws",
        "ellipse"
      ],
      "termInfo": {
        "Kepler's laws": "The three empirical rules of planetary motion, distilled from Tycho Brahe's observations: elliptical paths, equal areas in equal times, periods set by distance. Held for decades before anyone knew why.",
        "ellipse": "The orbit's true shape: a stretched circle with two foci, the Sun seated at one. A circle is the special case; planets drift slightly nearer and farther along theirs.",
        "equal areas in equal times": "The speed rule across the orbit: the line from Sun to planet sweeps the same area every hour, so a planet runs fastest when closest. Kepler's second law — later read as angular momentum quietly keeping books.",
        "harmonic law": "The period-distance rule: the square of a planet's orbital period grows with the cube of its mean distance. Kepler's third — the ledger that lets one measurement predict the other."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Kepler's laws of planetary motion"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "moon-test",
      "term": "Moon test",
      "clusters": [
        0,
        2
      ],
      "fact": "Newton's demonstration that the Moon is the apple's sibling: scale the apple's fall out to lunar distance by the inverse-square rule and the predicted fall matches the Moon's measured path — the unification that made Kepler's empirical rules consequences of one universal law.",
      "info": "The calculation to cite whenever anyone asks how we know the law reaches the sky: one fall, scaled, claiming two worlds.",
      "relationKind": "dynamic",
      "idealTerms": [
        "inverse-square law",
        "Kepler's laws"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "geostationary-orbit",
      "term": "geostationary orbit",
      "clusters": [
        1,
        2
      ],
      "fact": "The parking spot about 42,164 km from Earth's center, where the harmonic law's period-distance ledger meets free fall: the unique radius at which an orbit's period equals Earth's rotation, so the satellite hangs over one meridian forever.",
      "info": "Where the period ledger meets the free fall: choose the period, and the radius is no longer optional.",
      "relationKind": "dynamic",
      "idealTerms": [
        "free fall",
        "harmonic law"
      ],
      "direction": {
        "kind": "inward"
      }
    }
  ],
  "lenses": [
    {
      "id": "the-pulling-pattern",
      "prompt": "The Moon pulls the ocean beneath it into bulges. Which concepts supply that pulling pattern — how the pull varies across a body and with distance?",
      "explanation": "Weight names one body's total reading and universal gravitation names the attraction generally — neither supplies the variation across a body that the bulges need. The field's map, its distance falloff, and the gradient they produce are the working concepts.",
      "targets": [
        "gravitational field",
        "inverse-square law",
        "tidal force"
      ],
      "reasons": {
        "gravitational field": "The pattern itself: the pull per kilogram at each point, stronger near, weaker far.",
        "inverse-square law": "The falloff rule that makes the far-side pull differ from the near-side pull at all.",
        "tidal force": "The differential outcome: the stretch produced by the unequal pulls."
      }
    },
    {
      "id": "floating-crew",
      "prompt": "The space station's altitude barely weakens Earth's pull, yet the crew float through the cabin. Which concepts explain the floating?",
      "explanation": "Orbit names the path being traced, not why anyone floats; centripetal acceleration is the curvature of that fall; and escape velocity is the story of leaving, not of floating — the floating is falling, with the floor gone.",
      "targets": [
        "free fall",
        "weightlessness"
      ],
      "reasons": {
        "free fall": "The station and crew fall together, so nothing pushes on anyone — they float as one.",
        "weightlessness": "The sensation itself: no floor, no push, while gravity stays nearly full strength."
      }
    },
    {
      "id": "cannon-decision",
      "prompt": "Fire Newton's cannon faster and faster up the mountain. Which concepts decide whether the ball ends as a satellite or leaves Earth forever?",
      "explanation": "Orbit names the outcome rather than the decider; free fall happens at every speed; and weightlessness belongs to the passengers, not the ballistics. The decision rests on whether gravity's inward bend can still close the path.",
      "targets": [
        "centripetal acceleration",
        "escape velocity"
      ],
      "reasons": {
        "centripetal acceleration": "Below the threshold, gravity bends the fall into a closed curve — that is what makes an orbit.",
        "escape velocity": "The threshold itself: past it the fall never catches up, and the ball departs for good."
      }
    },
    {
      "id": "locked-parking-spot",
      "prompt": "Engineers wanted satellites that hang over one meridian forever. Which concepts fix where such a place can be — and why there is exactly one?",
      "explanation": "Orbit and free fall say the satellite can circle, but not where it must be; equal areas governs speed along an orbit, not period against radius. The parking spot is the harmonic law's consequence turned into an address.",
      "targets": [
        "harmonic law",
        "geostationary orbit"
      ],
      "reasons": {
        "geostationary orbit": "The spot itself: the unique radius where a 24-hour period matches Earth's rotation.",
        "harmonic law": "The ledger: period and radius are locked together, so choosing the period fixes the distance."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "forces-and-newtons-laws",
        "reason": "The machinery underneath: gravity supplies the inward pull, inertia keeps the fall missing — this board's laws running the whole show."
      },
      {
        "id": "momentum-and-energy-conservation",
        "reason": "The ledgers in the sky: escape velocity and orbital periods are energy and momentum accounts read at planetary scale."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The apple and the Moon",
    "summary": "One inverse-square law for orchard and heavens: weight as local pull, orbits as endless falling, and Kepler's ledger as derived consequence.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "## One law, two worlds\r\n\r\nBefore Newton, the heavens and the orchard ran on different rules. Universal gravitation ended the split: every pair of masses attracts along the line between them, with a pull that thins by the inverse square of the separation — double the distance, a quarter the force. Weight is just your local reading of that field: the Earth's pull on your mass, worth a sixth as much on the Moon. And because the pull fades across anything extended, the Moon tugs the ocean's near side harder than its far side — the tidal force that piles up the sea.\r\n\r\n## Falling that keeps missing\r\n\r\nNow imagine Newton's cannon on a mountain, firing ever faster. Slower shots fall to the ground; at one speed the ball falls exactly as fast as the ground curves away, and it never lands. That is an orbit: continuous free fall, with sideways motion enough to keep missing. Gravity supplies the inward, centripetal acceleration the whole way round. The station's crew float not because gravity is off duty up there — it is nearly as strong as at the surface — but because everything falls together and nothing pushes back: weightlessness is the absence of a floor. Fire faster still and the fall stops closing: past escape velocity, about 11.2 kilometres per second, the ball leaves forever.\r\n\r\n## The ledger Kepler kept, the law Newton found\r\n\r\nDecades before Newton, Kepler had written the planets' books from Tycho's observations: ellipses with the Sun at one focus, equal areas in equal times, and periods locked to distance by the harmonic law — pure bookkeeping, no theory. Newton's Moon test made the two worlds one: scale the apple's fall out to the Moon by the inverse-square rule and the predicted fall lands exactly on the Moon's path. Kepler's ledger turned out to be what the law demands. The consequence still runs the skies: pick a period and the radius is decided for you — which is why every satellite parked over one meridian hangs at the same altitude, where the books and the falling agree."
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
        "name": "ZCode"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "gravity-and-orbits",
      "puzzleRevision": "fnv1a32:9e4f6620",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:universal gravitation": {
          "x": 609.92,
          "y": 533.45,
          "pinned": false
        },
        "term:weight": {
          "x": 737.51,
          "y": 495.76,
          "pinned": false
        },
        "term:inverse-square law": {
          "x": 689.11,
          "y": 382.05,
          "pinned": false
        },
        "term:gravitational field": {
          "x": 846.29,
          "y": 430.72,
          "pinned": false
        },
        "term:tidal force": {
          "x": 744.47,
          "y": 597,
          "pinned": false
        },
        "term:orbit": {
          "x": 283.54,
          "y": 218.51,
          "pinned": false
        },
        "term:escape velocity": {
          "x": 192.49,
          "y": 155.05,
          "pinned": false
        },
        "term:free fall": {
          "x": 342.24,
          "y": 289.48,
          "pinned": false
        },
        "term:weightlessness": {
          "x": 327.35,
          "y": 119.97,
          "pinned": false
        },
        "term:centripetal acceleration": {
          "x": 194.72,
          "y": 325.87,
          "pinned": false
        },
        "term:Kepler's laws": {
          "x": 459.07,
          "y": 300,
          "pinned": false
        },
        "term:ellipse": {
          "x": 406.44,
          "y": 202.27,
          "pinned": false
        },
        "term:equal areas in equal times": {
          "x": 551.22,
          "y": 156.14,
          "pinned": false
        },
        "term:harmonic law": {
          "x": 519.12,
          "y": 411.61,
          "pinned": false
        },
        "term:Moon test": {
          "x": 575.7,
          "y": 312.49,
          "pinned": false
        },
        "term:geostationary orbit": {
          "x": 373.83,
          "y": 421.96,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2230.9,
        "score": 2230.902525210196
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:08:33.482Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "gravity-and-orbits",
      "puzzleRevision": "fnv1a32:9e4f6620",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 696.17,
          "y": 261.07,
          "pinned": false
        },
        "cluster:1": {
          "x": 263.83,
          "y": 261.07,
          "pinned": false
        },
        "cluster:2": {
          "x": 480,
          "y": 431.86,
          "pinned": false
        }
      },
      "bridges": {
        "term:Moon test": {
          "x": 514.55,
          "y": 272.92,
          "pinned": false
        },
        "term:geostationary orbit": {
          "x": 275.75,
          "y": 442.63,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "universal gravitation",
          "weight",
          "inverse-square law",
          "gravitational field",
          "tidal force"
        ],
        "cluster:1": [
          "orbit",
          "escape velocity",
          "free fall",
          "weightlessness",
          "centripetal acceleration"
        ],
        "cluster:2": [
          "Kepler's laws",
          "ellipse",
          "equal areas in equal times",
          "harmonic law"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "tidal force",
          "gravitational field",
          "universal gravitation",
          "inverse-square law",
          "weight"
        ],
        "cluster:1": [
          "orbit",
          "weightlessness",
          "centripetal acceleration",
          "escape velocity",
          "free fall"
        ],
        "cluster:2": [
          "Kepler's laws",
          "equal areas in equal times",
          "harmonic law",
          "ellipse"
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
        "totalLength": 436.6534656142477
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T07:08:34.285Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "gravity-and-orbits",
      "puzzleRevision": "fnv1a32:9e4f6620",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:universal gravitation": {
          "x": 274.3,
          "y": 598
        },
        "term:weight": {
          "x": 138.04,
          "y": 586.28
        },
        "term:inverse-square law": {
          "x": 438.51,
          "y": 536.75
        },
        "term:gravitational field": {
          "x": 117.12,
          "y": 457.24
        },
        "term:tidal force": {
          "x": 158.02,
          "y": 316.62
        },
        "term:orbit": {
          "x": 168.33,
          "y": 214.97
        },
        "term:escape velocity": {
          "x": 145.48,
          "y": 102.26
        },
        "term:free fall": {
          "x": 433.69,
          "y": 298.5
        },
        "term:weightlessness": {
          "x": 261.98,
          "y": 22
        },
        "term:centripetal acceleration": {
          "x": 441.55,
          "y": 22
        },
        "term:Kepler's laws": {
          "x": 569.58,
          "y": 464.48
        },
        "term:ellipse": {
          "x": 827.6,
          "y": 429.26
        },
        "term:equal areas in equal times": {
          "x": 753.48,
          "y": 566.58
        },
        "term:harmonic law": {
          "x": 561.09,
          "y": 334.03
        },
        "term:Moon test": {
          "x": 465.24,
          "y": 402.53
        },
        "term:geostationary orbit": {
          "x": 522.2,
          "y": 189.73
        },
        "cluster:0": {
          "x": 302.98,
          "y": 402.95
        },
        "cluster:1": {
          "x": 315.37,
          "y": 187.51
        },
        "cluster:2": {
          "x": 703.4,
          "y": 379.48
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-17T07:08:35.222Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "author",
    "savedAt": "2026-10-17T08:24:15.378Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
