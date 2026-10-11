// Generated from content/puzzles/solar-system-outer.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "solar-system-outer",
  "title": "The Solar System: Giants, Dwarfs, and Leftovers",
  "category": "astronomy",
  "subcategories": {
    "astronomy": "solar-system"
  },
  "info": {
    "text": "What the giant planets are made of, what makes a dwarf planet a dwarf, where the leftover debris is stored, and why some moons are geologically alive - the solar system from the asteroid belt outward, as the output of one sorting mechanism.",
    "citations": [
      {
        "title": "Solar System",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Solar_System"
      },
      {
        "title": "Dwarf planet",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Dwarf_planet"
      }
    ]
  },
  "clusters": [
    {
      "id": "gas-giants",
      "name": "Gas giants",
      "color": "teal",
      "fact": "The two giants nearest the frost line grew fast enough to swallow huge hydrogen-helium envelopes: Jupiter and Saturn hold more than 90 percent of the planets' combined mass.",
      "terms": [
        "Jupiter",
        "Saturn"
      ],
      "seeds": [
        "Jupiter"
      ],
      "termInfo": {
        "Jupiter": {
          "text": "The largest planet - more than twice the mass of every other planet combined - with dozens of moons and the Great Red Spot, a storm wider than Earth that has been watched for at least 190 years and is slowly shrinking.",
          "links": [
            {
              "href": "wiki:Jupiter"
            }
          ]
        },
        "Saturn": {
          "text": "Mostly hydrogen and helium around a small core, famous for rings of ice and rock; the planet is less dense than water.",
          "links": [
            {
              "href": "wiki:Saturn"
            }
          ]
        }
      }
    },
    {
      "id": "ice-giants",
      "name": "Ice giants",
      "color": "blue",
      "fact": "Uranus and Neptune are smaller giants built more from water, ammonia, and methane ices than from captured gas - and Uranus rolls around the Sun tipped nearly on its side.",
      "terms": [
        "Uranus",
        "Neptune"
      ],
      "seeds": [
        "Uranus"
      ],
      "termInfo": {
        "Uranus": {
          "text": "An ice giant tipped about 98 degrees - most likely by one or more ancient giant impacts - so it spins almost in its orbital plane and each pole gets 42 years of sunlight, then 42 years of dark. The first planet found by telescope (William Herschel, 1781).",
          "links": [
            {
              "href": "wiki:Uranus"
            }
          ]
        },
        "Neptune": {
          "text": "The farthest planet, with the fastest winds in the solar system - supersonic gusts above 2,000 km/h - and more heat leaking out than it receives from the Sun.",
          "links": [
            {
              "href": "wiki:Neptune"
            }
          ]
        }
      }
    },
    {
      "id": "dwarfs",
      "name": "Dwarf planets",
      "color": "amber",
      "fact": "Round under their own gravity but sharing their orbital neighborhoods with debris: Pluto, Eris, Ceres, and Haumea are worlds in shape, not in orbital dominance.",
      "terms": [
        "Pluto",
        "Ceres",
        "Eris",
        "Haumea"
      ],
      "seeds": [
        "Pluto",
        "Ceres"
      ],
      "termInfo": {
        "Pluto": {
          "text": "The archetype dwarf planet: round, cratered, with mountains of water ice and a moon (Charon) half its own size - but locked in 3:2 resonance with Neptune and sharing its zone with Kuiper-belt debris.",
          "links": [
            {
              "href": "wiki:Pluto"
            }
          ]
        },
        "Ceres": {
          "text": "The largest object in the asteroid belt and the only dwarf planet inside Neptune's orbit - round, rich in water ice, and counted as a planet for about half a century after its 1801 discovery.",
          "links": [
            {
              "href": "wiki:Ceres (dwarf planet)"
            }
          ]
        },
        "Eris": {
          "text": "The scattered-disc world whose 2005 discovery forced the planet-definition debate: slightly more massive than Pluto, on a steeply tilted, stretched orbit that carries it far beyond Pluto's.",
          "links": [
            {
              "href": "wiki:Eris (dwarf planet)"
            }
          ]
        },
        "Haumea": {
          "text": "A dwarf planet spinning so fast it is stretched egg-shaped, with a ring and two moons of its own.",
          "links": [
            {
              "href": "wiki:Haumea"
            }
          ]
        }
      }
    },
    {
      "id": "reservoirs",
      "name": "Small-body reservoirs",
      "color": "magenta",
      "fact": "Leftover planetesimals that never became planets: the asteroid belt inside the giants, the Kuiper Belt beyond Neptune, the distant Oort cloud - with comets as their icy visitors.",
      "terms": [
        "asteroid belt",
        "Kuiper Belt",
        "Oort cloud",
        "comets"
      ],
      "seeds": [
        "asteroid belt",
        "Kuiper Belt"
      ],
      "termInfo": {
        "asteroid belt": {
          "text": "Millions of rocky bodies between Mars and Jupiter - the makings of a planet that Jupiter's gravity never allowed to assemble.",
          "links": [
            {
              "href": "wiki:Asteroid belt"
            }
          ]
        },
        "Kuiper Belt": {
          "text": "The icy doughnut beyond Neptune: a reservoir of frozen leftovers, home to several dwarf planets, with the more scattered disc stretching past its outer edge.",
          "links": [
            {
              "href": "wiki:Kuiper belt"
            }
          ]
        },
        "Oort cloud": {
          "text": "A vast shell of icy bodies reaching perhaps a light-year out - the source of long-period comets that fall in from every direction.",
          "links": [
            {
              "href": "wiki:Oort cloud"
            }
          ]
        },
        "comets": {
          "text": "Icy small bodies that grow glowing comas and tails when sunlight boils their ices near the Sun; a comet's tail always points away from the Sun, no matter which way it travels.",
          "links": [
            {
              "href": "wiki:Comet"
            }
          ]
        }
      }
    },
    {
      "id": "moons",
      "name": "Moons as worlds",
      "color": "olive",
      "fact": "The largest moons are worlds in their own right: Titan with its thick atmosphere, Europa and Enceladus with hidden oceans, Io with constant volcanoes, Triton orbiting backwards.",
      "terms": [
        "Titan",
        "Europa",
        "Io",
        "Enceladus",
        "Triton"
      ],
      "seeds": [
        "Titan",
        "Europa"
      ],
      "termInfo": {
        "Titan": {
          "text": "Saturn's largest moon, with a dense nitrogen atmosphere and lakes of liquid methane - the only moon with weather and rain.",
          "links": [
            {
              "href": "wiki:Titan (moon)"
            }
          ]
        },
        "Europa": {
          "text": "Jupiter's smooth ice-clad moon; a global saltwater ocean hides beneath the ice, making it a prime target in the search for life.",
          "links": [
            {
              "href": "wiki:Europa (moon)"
            }
          ]
        },
        "Io": {
          "text": "The most volcanic body in the solar system, kneaded by Jupiter's tides until parts of its interior melt and erupt.",
          "links": [
            {
              "href": "wiki:Io (moon)"
            }
          ]
        },
        "Enceladus": {
          "text": "A small icy moon of Saturn whose south-polar geysers spray ocean water directly into space - sampled in flight by the Cassini spacecraft.",
          "links": [
            {
              "href": "wiki:Enceladus"
            }
          ]
        },
        "Triton": {
          "text": "Neptune's large moon orbits backwards; its surface vents nitrogen geysers, and tidal forces are slowly dragging it toward eventual destruction.",
          "links": [
            {
              "href": "wiki:Triton (moon)"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "jupiter-stirring",
      "term": "orbital resonance",
      "clusters": [
        0,
        3
      ],
      "fact": "Jupiter's resonances carve gaps in the asteroid belt and stir its planetesimals into collisions too fast to merge, so they could never assemble into a planet.",
      "info": "Objects in resonance repeat a simple orbital ratio - like 2:1 - so the same alignments recur and small tugs add up.",
      "idealTerms": [
        "Jupiter",
        "asteroid belt"
      ]
    },
    {
      "id": "round-worlds",
      "term": "clearing the neighborhood",
      "clusters": [
        2,
        3
      ],
      "fact": "Ceres rides inside the asteroid belt, Pluto and Haumea among Kuiper-belt debris, and Eris in the scattered disc beyond: round enough to be worlds, too small to clear their paths.",
      "info": "The IAU test a planet passes and a dwarf planet fails: gravitationally dominating its orbital zone by sweeping up or scattering the debris around it."
    },
    {
      "id": "tidal-heating",
      "term": "tidal heating",
      "clusters": [
        0,
        4
      ],
      "fact": "Flexing by Jupiter and Saturn kneads their big moons from the inside, powering volcanoes on Io and keeping oceans liquid inside Europa and Enceladus.",
      "info": "The same tidal tug that raises ocean tides on Earth, but strong enough to warm a moon's interior."
    },
    {
      "id": "capture",
      "term": "capture",
      "clusters": [
        3,
        4
      ],
      "fact": "Triton circles Neptune backwards - the signature of a captured Kuiper-belt object rather than a moon born in place around its planet.",
      "info": "A backwards (retrograde) orbit is hard to explain any other way: co-formed moons almost always orbit in the disk's direction.",
      "idealTerms": [
        "Kuiper Belt",
        "Triton"
      ]
    }
  ],
  "lenses": [
    {
      "id": "hidden-oceans",
      "prompt": "Which two moons are known to hide global oceans - one beneath smooth ice, one spraying its ocean into space?",
      "explanation": "Tidal flexing from their giant planets keeps both oceans liquid: Europa's lies under its ice shell, Enceladus vents its own through south-polar geysers. Titan probably hides a subsurface ocean too, but its surface is shrouded rather than smooth and nothing sprays out; its visible lakes are methane. Triton's possible ocean is still speculative.",
      "targets": [
        "Europa",
        "Enceladus"
      ],
      "reasons": {
        "Europa": "A global saltwater ocean lies beneath its ice shell, kept liquid by tidal heating.",
        "Enceladus": "South-polar geysers spray its ocean water directly into space, sampled by Cassini."
      }
    },
    {
      "id": "oriented-wrong",
      "prompt": "Which two worlds are oriented wrong - one tipped nearly on its side, one circling its planet backwards?",
      "explanation": "Uranus spins at about 98 degrees, most likely knocked over by a giant impact; Triton's retrograde orbit marks it as a captured Kuiper-belt object. No other world on this board is known for its orientation.",
      "targets": [
        "Uranus",
        "Triton"
      ],
      "reasons": {
        "Uranus": "It rolls almost in its orbital plane - the system's biggest knock.",
        "Triton": "Its backwards orbit is the signature of capture, not co-formation."
      }
    },
    {
      "id": "beyond-neptune",
      "prompt": "Which dwarf planets orbit the Sun beyond Neptune?",
      "explanation": "Pluto and Haumea live in the Kuiper Belt and Eris in the scattered disc beyond it. Ceres is the exception: the one dwarf planet inside Neptune's orbit, in the asteroid belt between Mars and Jupiter. Triton probably began as a trans-Neptunian world, but it now orbits Neptune as a moon.",
      "targets": [
        "Pluto",
        "Eris",
        "Haumea"
      ],
      "reasons": {
        "Pluto": "A Kuiper-belt world in 3:2 resonance with Neptune.",
        "Eris": "Out in the scattered disc, beyond the Kuiper Belt.",
        "Haumea": "A fast-spinning Kuiper-belt resident."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "solar-system-inner",
        "reason": "Play first: the frost-line and formation rules from board one explain why the outer system looks the way this board shows."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "optional",
    "title": "Beyond the frost line",
    "summary": "Where the outer solar system came from, and why its worlds look the way they do.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Past a line roughly three times farther from the Sun than Earth, the young solar nebula was cold enough for water, ammonia, and methane to freeze. That change in chemistry decided everything about the outer solar system: icy grains piled into cores big enough to grab enormous atmospheres of hydrogen and helium, building the giants, while smaller leftovers stayed frozen in belts and clouds.\r\n\r\nThe worlds out there are stranger than cold copies of the inner planets: giants with no surface to stand on, dwarf planets sharing their orbits with debris, and moons with atmospheres, buried oceans, and volcanoes of their own. Tides, resonances, and one dramatic capture keep them active five billion kilometers from the Sun's warmth."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "high"
      },
      {
        "name": "Claude Code (Claude Opus 5)",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "solar-system-outer",
      "puzzleRevision": "fnv1a32:8bb669fb",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Jupiter": {
          "x": 547.47,
          "y": 412.07,
          "pinned": false
        },
        "term:Saturn": {
          "x": 623.86,
          "y": 457.63,
          "pinned": false
        },
        "term:Uranus": {
          "x": 719.37,
          "y": 410.15,
          "pinned": true
        },
        "term:Neptune": {
          "x": 808.14,
          "y": 456.48,
          "pinned": true
        },
        "term:Pluto": {
          "x": 509.02,
          "y": 95.3,
          "pinned": false
        },
        "term:Ceres": {
          "x": 542.05,
          "y": 23,
          "pinned": false
        },
        "term:Eris": {
          "x": 585.34,
          "y": 93.63,
          "pinned": false
        },
        "term:Haumea": {
          "x": 552.08,
          "y": 165.84,
          "pinned": false
        },
        "term:asteroid belt": {
          "x": 275.89,
          "y": 298.29,
          "pinned": false
        },
        "term:Kuiper Belt": {
          "x": 136.25,
          "y": 324.24,
          "pinned": true
        },
        "term:Oort cloud": {
          "x": 193.32,
          "y": 213.9,
          "pinned": true
        },
        "term:comets": {
          "x": 421.13,
          "y": 255.33,
          "pinned": true
        },
        "term:Titan": {
          "x": 350.99,
          "y": 467.01,
          "pinned": false
        },
        "term:Europa": {
          "x": 285.1,
          "y": 516.91,
          "pinned": false
        },
        "term:Io": {
          "x": 245.48,
          "y": 455.37,
          "pinned": false
        },
        "term:Enceladus": {
          "x": 371.6,
          "y": 556.77,
          "pinned": false
        },
        "term:Triton": {
          "x": 297.57,
          "y": 403.94,
          "pinned": false
        },
        "term:orbital resonance": {
          "x": 403.08,
          "y": 361.42,
          "pinned": true
        },
        "term:clearing the neighborhood": {
          "x": 393.54,
          "y": 178.79,
          "pinned": false
        },
        "term:tidal heating": {
          "x": 467.05,
          "y": 488.59,
          "pinned": false
        },
        "term:capture": {
          "x": 210.12,
          "y": 387.7,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2527.42,
        "score": 2527.42215493546
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:10:48.883Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "solar-system-outer",
      "puzzleRevision": "fnv1a32:8bb669fb",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 696.2,
          "y": 545.6,
          "pinned": false
        },
        "cluster:1": {
          "x": 353.8,
          "y": 545.6,
          "pinned": false
        },
        "cluster:2": {
          "x": 247.99,
          "y": 341.62,
          "pinned": false
        },
        "cluster:3": {
          "x": 525,
          "y": 215.55,
          "pinned": false
        },
        "cluster:4": {
          "x": 802.01,
          "y": 341.62,
          "pinned": false
        }
      },
      "bridges": {
        "term:orbital resonance": {
          "x": 529.42,
          "y": 430.93,
          "pinned": true
        },
        "term:clearing the neighborhood": {
          "x": 258.54,
          "y": 176.94,
          "pinned": true
        },
        "term:tidal heating": {
          "x": 866.5,
          "y": 545.54,
          "pinned": true
        },
        "term:capture": {
          "x": 716.37,
          "y": 175.84,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Jupiter",
          "Saturn"
        ],
        "cluster:1": [
          "Uranus",
          "Neptune"
        ],
        "cluster:2": [
          "Pluto",
          "Ceres",
          "Eris",
          "Haumea"
        ],
        "cluster:3": [
          "asteroid belt",
          "Kuiper Belt",
          "Oort cloud",
          "comets"
        ],
        "cluster:4": [
          "Titan",
          "Europa",
          "Io",
          "Enceladus",
          "Triton"
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
        "totalLength": 762.7109748869461
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:09:11.186Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "solar-system-outer",
      "puzzleRevision": "fnv1a32:8bb669fb",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:Jupiter": {
          "x": 394.25,
          "y": 555.13
        },
        "term:Saturn": {
          "x": 276.4,
          "y": 590.29
        },
        "term:Uranus": {
          "x": 782.39,
          "y": 154.94
        },
        "term:Neptune": {
          "x": 815.78,
          "y": 257.76
        },
        "term:Pluto": {
          "x": 351.81,
          "y": 22
        },
        "term:Ceres": {
          "x": 435.31,
          "y": 22
        },
        "term:Eris": {
          "x": 520.81,
          "y": 22
        },
        "term:Haumea": {
          "x": 604.31,
          "y": 22
        },
        "term:asteroid belt": {
          "x": 507.44,
          "y": 574.41
        },
        "term:Kuiper Belt": {
          "x": 521.27,
          "y": 395.49
        },
        "term:Oort cloud": {
          "x": 718.97,
          "y": 598
        },
        "term:comets": {
          "x": 616.57,
          "y": 598
        },
        "term:Titan": {
          "x": 179.56,
          "y": 354.76
        },
        "term:Europa": {
          "x": 143.69,
          "y": 275.91
        },
        "term:Io": {
          "x": 123.48,
          "y": 201.41
        },
        "term:Enceladus": {
          "x": 184.45,
          "y": 139.84
        },
        "term:Triton": {
          "x": 275.35,
          "y": 100.02
        },
        "term:orbital resonance": {
          "x": 449.53,
          "y": 439.85
        },
        "term:clearing the neighborhood": {
          "x": 543.29,
          "y": 280.26
        },
        "term:tidal heating": {
          "x": 288.04,
          "y": 360.95
        },
        "term:capture": {
          "x": 396.82,
          "y": 246.01
        },
        "cluster:0": {
          "x": 318.92,
          "y": 481.49
        },
        "cluster:1": {
          "x": 700.47,
          "y": 240.05
        },
        "cluster:2": {
          "x": 481.94,
          "y": 119.9
        },
        "cluster:3": {
          "x": 619.84,
          "y": 461.66
        },
        "cluster:4": {
          "x": 283.79,
          "y": 220.88
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T20:11:21.166Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T02:19:56.497Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
