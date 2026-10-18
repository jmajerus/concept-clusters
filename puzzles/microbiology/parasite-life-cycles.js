// Generated from content/puzzles/parasite-life-cycles.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "parasite-life-cycles",
  "title": "Two Hosts and a Costume Change — How Parasites Move Between Bodies",
  "category": "microbiology",
  "subcategories": {
    "microbiology": "parasitology"
  },
  "info": {
    "text": "How parasites organize their lives around other bodies: the three body plans parasitology sorts first, the roles hosts play in a complex life cycle, the costume changes between feeding and survival forms, and the classic routes between hosts — with malaria's famous inversion along the way.",
    "links": [
      {
        "href": "wiki:Parasitology"
      }
    ],
    "citations": [
      {
        "title": "Parasitism",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Parasitism"
      },
      {
        "title": "Giardia duodenalis",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Giardia_duodenalis"
      },
      {
        "title": "Plasmodium falciparum",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Plasmodium_falciparum"
      }
    ]
  },
  "clusters": [
    {
      "id": "body-plans",
      "name": "Parasite body plans",
      "color": "teal",
      "fact": "The first sort any parasitologist makes is by body plan: single cell, worm, or something that lives on the outside — each plan forces a different style of life cycle.",
      "terms": [
        "protozoan",
        "helminth",
        "ectoparasite"
      ],
      "seeds": [
        "protozoan",
        "ectoparasite"
      ],
      "termInfo": {
        "ectoparasite": {
          "text": "Lives on the outside: lice, mites, ticks, fleas. It feeds on the host but is exposed to grooming and medicine, so its life cycle keeps eggs and juveniles off-host.",
          "links": [
            {
              "href": "wiki:Parasitism"
            }
          ]
        },
        "helminth": {
          "text": "A parasitic worm: trematode flukes, cestode tapeworms, nematode roundworms. Multicellular and egg-laying — often too big for antibodies to kill, so the immune system settles for walling them off.",
          "links": [
            {
              "href": "wiki:Parasitic worm"
            }
          ]
        },
        "protozoan": {
          "text": "A single-celled eukaryotic parasite — Plasmodium (malaria), Trypanosoma (sleeping sickness), Entamoeba (amoebic dysentery), Giardia. Small enough to live inside cells or in the gut lumen.",
          "links": [
            {
              "href": "wiki:Protozoa"
            }
          ]
        }
      },
      "info": {
        "text": "Parasitologists sort first by organism: protozoa are single-celled eukaryotes, helminths are worms — flukes, tapeworms, roundworms — and ectoparasites live on the outside. Most are extreme host specialists.",
        "links": [
          {
            "href": "wiki:Parasitism"
          }
        ]
      }
    },
    {
      "id": "host-roles",
      "name": "Roles in the life cycle",
      "color": "blue",
      "fact": "A complex life cycle assigns roles: one host hosts the sex, another hosts the multiplication, one population keeps the parasite simmering between outbreaks, and one merely ferries it along.",
      "terms": [
        "definitive host",
        "intermediate host",
        "reservoir",
        "vector"
      ],
      "seeds": [
        "vector",
        "definitive host"
      ],
      "termInfo": {
        "definitive host": {
          "text": "The host where the parasite reproduces sexually — the primary host. For malaria it is the mosquito, not the human; for the beef tapeworm it is the human.",
          "links": [
            {
              "href": "wiki:Host (biology)"
            }
          ]
        },
        "intermediate host": {
          "text": "Holds the juvenile stages, which often multiply asexually and encyst: the snail in a fluke's cycle, the cow carrying tapeworm larvae, the human carrying malaria.",
          "links": [
            {
              "href": "wiki:Host (biology)"
            }
          ]
        },
        "reservoir": {
          "text": "The population — often wild or domestic animals — where the parasite lives permanently and from which human outbreaks are seeded: deer and mice for the Lyme spirochete.",
          "links": [
            {
              "href": "wiki:Natural reservoir"
            }
          ]
        },
        "vector": {
          "text": "The living carrier that ferries a parasite between hosts — the Anopheles mosquito for malaria, Ixodes ticks for Lyme. A biological vector hosts the parasite for part of its cycle; a mechanical one just carries it.",
          "links": [
            {
              "href": "wiki:Disease vector"
            }
          ]
        }
      },
      "info": {
        "text": "Complex cycles cast hosts in roles: the definitive host hosts the sexual phase, the intermediate host hosts growth and multiplication, a reservoir population keeps the parasite endemic, and a vector ferries it between them.",
        "links": [
          {
            "href": "wiki:Parasitism"
          }
        ]
      }
    },
    {
      "id": "forms",
      "name": "Active and survival forms",
      "color": "amber",
      "fact": "Parasites change costumes as they move: a delicate feeding form inside the host, an armored shell for the journey outside, and juvenile forms built to find the next body.",
      "terms": [
        "trophozoite",
        "cyst",
        "larva",
        "cercaria"
      ],
      "seeds": [
        "cyst",
        "larva"
      ],
      "termInfo": {
        "cercaria": {
          "text": "The free-swimming fluke larva, shed by the thousands from a snail. Schistosome cercariae paddle through fresh water and penetrate human skin directly — enzymes, not mouthparts; the tail is shed on entry.",
          "links": [
            {
              "href": "wiki:Cercaria"
            }
          ]
        },
        "cyst": {
          "text": "The environmentally stable form: a rigid two-layered wall, metabolism nearly stopped, viable for months in cold water and resistant to chlorine. Cysts are what feces deliver to the next water supply.",
          "links": [
            {
              "href": "wiki:Giardia duodenalis"
            }
          ]
        },
        "larva": {
          "text": "The juvenile worm form, often unrecognizable next to the adult: hookworm larvae hatch in soil and hunt bare feet; tapeworm larvae wait encysted in muscle as \"measly beef\".",
          "links": [
            {
              "href": "wiki:Larva"
            }
          ]
        },
        "trophozoite": {
          "text": "The active, feeding, multiplying protozoan form — Giardia's flagellated pear, clinging to the gut lining with its adhesive disc. Delicate: it dies within minutes outside the host.",
          "links": [
            {
              "href": "wiki:Trophozoite"
            }
          ]
        }
      },
      "info": {
        "text": "Every stage of a complex cycle is built for a different job: feed and multiply inside one host, survive the outside world, then find the next body — often in a completely different shape.",
        "links": [
          {
            "href": "wiki:Parasitism"
          }
        ]
      }
    },
    {
      "id": "routes",
      "name": "Routes between hosts",
      "color": "magenta",
      "fact": "Getting to the next host is the whole game, and there are three classic routes: leave in feces and be swallowed, ride a biting carrier, or be eaten along with the next host's meal.",
      "terms": [
        "fecal-oral",
        "vector-borne",
        "trophic transmission"
      ],
      "seeds": [
        "fecal-oral",
        "vector-borne"
      ],
      "termInfo": {
        "fecal-oral": {
          "text": "Out with the feces, in with the food or water — the route of Giardia, Entamoeba, and every sanitation failure. It rewards armored cysts and heavy shedding: up to a billion Giardia cysts a day.",
          "links": [
            {
              "href": "wiki:Fecal–oral route"
            }
          ]
        },
        "trophic transmission": {
          "text": "Be eaten: tapeworm larvae wait in beef or pork muscle, fluke metacercariae cling to water plants, and the cycle completes when the definitive host swallows its meal — and its parasite.",
          "links": [
            {
              "href": "wiki:Parasitism"
            }
          ]
        },
        "vector-borne": {
          "text": "Ride a biting carrier: malaria's sporozoites travel in Anopheles saliva, Lyme's spirochetes in tick saliva. The vector's biting schedule becomes the parasite's travel schedule.",
          "links": [
            {
              "href": "wiki:Disease vector"
            }
          ]
        }
      },
      "info": {
        "text": "Transmission is the whole game: a parasite that cannot reach the next host is dead on arrival. Each classic route selects for a different survival strategy.",
        "links": [
          {
            "href": "wiki:Parasitism"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "definitive-vector",
      "term": "the definitive vector",
      "clusters": [
        1,
        3
      ],
      "fact": "Malaria inverts the intuition: the mosquito that merely seems to 'transmit' the parasite is actually its definitive host — sexual reproduction happens in the insect — and the suffering human is only the intermediate host.",
      "info": {
        "text": "The inversion is easier to remember than the rule: define the definitive host by where sex happens, not by which host suffers — for malaria the answer is the insect.",
        "links": [
          {
            "href": "wiki:Plasmodium falciparum"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "definitive host",
        "vector-borne"
      ]
    },
    {
      "id": "survival-armor",
      "term": "survival armor",
      "clusters": [
        2,
        3
      ],
      "fact": "The cyst is the ticket for the fecal-oral ride: armored against chlorine, stomach acid, and months of cold water, Giardia cysts wait in untreated water for the next throat to swallow them — trophozoites could never make the trip.",
      "info": {
        "text": "Cyst walls resist chlorination and ozonolysis, which is why Giardia sneaks through municipal water treatment; boiling, not chlorine, is the field answer.",
        "links": [
          {
            "href": "wiki:Giardia duodenalis"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "cyst",
        "fecal-oral"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "amplification",
      "term": "amplification",
      "clusters": [
        1,
        2
      ],
      "fact": "Intermediate hosts are multiplier stages: one Plasmodium sporozoite becomes some ninety thousand merozoites in a human liver, and one fluke miracidium becomes thousands of cercariae in a snail — asexual replication on an industrial scale.",
      "info": {
        "text": "Amplification is why one infected snail on a shoreline can seed a whole outbreak — and why the infectious dose of some parasites is a single organism.",
        "links": [
          {
            "href": "wiki:Parasitism"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "intermediate host",
        "cercaria"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "ectoparasite-vector",
      "term": "riders that carry riders",
      "clusters": [
        0,
        3
      ],
      "fact": "Ectoparasites often work both sides of a route: the tick that feeds on you is an ectoparasite in its own right — and the vector that delivers Borrelia, the Lyme spirochete, from a deer reservoir.",
      "info": {
        "text": "Ticks are consummate double agents: three life stages, three hosts, and the ability to keep Borrelia circulating between deer and mice whether or not a human ever gets bitten.",
        "links": [
          {
            "href": "wiki:Ixodes"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "ectoparasite",
        "vector-borne"
      ]
    }
  ],
  "lenses": [
    {
      "id": "inside-or-outside",
      "prompt": "Which body plan lives on the host's surface rather than inside it?",
      "explanation": "Ectoparasites — lice, mites, ticks, fleas — live on the surface. Protozoa and helminths both live inside the host, in cells, gut, blood, or tissue.",
      "targets": [
        "ectoparasite"
      ],
      "reasons": {
        "ectoparasite": "The outside dweller — exposed to grooming, preening, and topical medicine."
      }
    },
    {
      "id": "stage-casting",
      "prompt": "Which two stages belong to protozoa rather than to worms?",
      "explanation": "Trophozoite and cyst are the two protozoan costumes — feeding form and armored form. Larva and cercaria are worm juveniles; no protozoan has them.",
      "targets": [
        "trophozoite",
        "cyst"
      ],
      "reasons": {
        "cyst": "The protozoan's armored travel form.",
        "trophozoite": "The protozoan's active feeding form."
      }
    },
    {
      "id": "who-hosts-sex",
      "prompt": "In which role does the parasite reproduce sexually?",
      "explanation": "The definitive host is defined by sex — sexual reproduction happens there and nowhere else. The intermediate host gets only multiplication; the vector gets transport.",
      "targets": [
        "definitive host"
      ],
      "reasons": {
        "definitive host": "Sex happens here — that is the definition, not a side effect."
      }
    },
    {
      "id": "mosquito-role",
      "prompt": "Which two roles does the female Anopheles mosquito play in the malaria cycle?",
      "explanation": "The female Anopheles mosquito is both: the vector that ferries sporozoites in saliva, and — because fertilization happens in her gut — the malaria parasite's definitive host.",
      "targets": [
        "vector",
        "definitive host"
      ],
      "reasons": {
        "definitive host": "Sexual reproduction happens in her gut.",
        "vector": "She ferries sporozoites from human to human in her saliva."
      }
    },
    {
      "id": "free-swimmer",
      "prompt": "Which stage swims free in fresh water and penetrates a host's skin directly?",
      "explanation": "The cercaria is the swimmer — shed in thousands from a snail, it paddles through fresh water and penetrates skin directly, shedding its tail on entry. Larvae wait or hunt; they do not swim.",
      "targets": [
        "cercaria"
      ],
      "reasons": {
        "cercaria": "The fluke's fork-tailed swimmer — the schistosome's skin-piercing stage."
      }
    },
    {
      "id": "route-sorting",
      "prompt": "Which route ends when the next host eats its meal — and its parasite — along with it?",
      "explanation": "Trophic transmission completes the cycle by meal: tapeworm larvae in muscle, fluke metacercariae on water plants. The fecal-oral and vector-borne routes reach the host by swallowing water or being bitten instead.",
      "targets": [
        "trophic transmission"
      ],
      "reasons": {
        "trophic transmission": "Transmission by being eaten — the food chain is the vehicle."
      }
    },
    {
      "id": "amplification-meeting",
      "prompt": "Which pairing meets inside the snail: the host role where fluke larvae multiply, and the free-swimming stage it sheds?",
      "explanation": "The intermediate host is the multiplier stage: one miracidium becomes thousands of cercariae inside the snail, which then sheds them into fresh water. No other host role multiplies the parasite this way, and no other stage is shed by the thousand.",
      "targets": [
        "intermediate host",
        "cercaria"
      ],
      "reasons": {
        "cercaria": "The product of that multiplication — shed by the thousand.",
        "intermediate host": "Where asexual multiplication happens — the snail's role in the fluke cycle."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "bacterial-architectures",
        "reason": "This board's tick bridge delivers Borrelia — the spirochete whose internal-flagella swimming that board teaches; pair them to see the parasite and its passenger in one picture."
      },
      {
        "id": "virus-build-and-takeover",
        "reason": "Batch sibling: viruses are the ultimate minimal parasites; this board shows the opposite extreme — complex life cycles with multiple hosts and costume changes."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "A parasite lives by spending someone else's body. The ones with the most complicated lives — protozoa like the malaria parasite, worms like tapeworms and flukes, and surface-dwellers like ticks — pass through several hosts and several body forms in a single lifetime, and each change of host demands a change of costume.\r\n\r\nThe roles in such a life cycle are precise. The definitive host is where the parasite reproduces sexually; the intermediate host hosts growth and often enormous asexual multiplication. A reservoir population — usually wild animals — keeps the parasite simmering between human outbreaks, and a vector, usually a biting insect or tick, ferries it between bodies.\r\n\r\nThe costume changes track the journey. A trophozoite is the active, feeding protozoan form, delicate and useless outside its host. A cyst is the same organism sealed behind a rigid wall, metabolism nearly stopped, able to survive chlorine, stomach acid, and months in cold water. Worms alternate adults, eggs, and larvae; flukes add a free-swimming cercaria that sheds its tail the moment it penetrates skin.\r\n\r\nPut the pieces together and famous cycles become readable. Malaria's mosquito is not a syringe but the parasite's definitive host — sex happens in the insect — while the human liver and blood stages are a multiplication factory. Giardia spreads by the fecal-oral route because its cyst is the one form that survives the trip. The tapeworm needs no armor at all: its larvae simply wait, encysted in meat, for the definitive host to eat its dinner."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
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
    "star": {
      "schemaVersion": 1,
      "puzzleId": "parasite-life-cycles",
      "puzzleRevision": "fnv1a32:7a5da757",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:protozoan": {
          "x": 791.71,
          "y": 31.93
        },
        "term:helminth": {
          "x": 851.16,
          "y": 121.01
        },
        "term:ectoparasite": {
          "x": 616.4,
          "y": 49.42
        },
        "term:definitive host": {
          "x": 630.57,
          "y": 237.48
        },
        "term:intermediate host": {
          "x": 702.1,
          "y": 379.06
        },
        "term:reservoir": {
          "x": 844.51,
          "y": 217.65
        },
        "term:vector": {
          "x": 877.23,
          "y": 384.8
        },
        "term:trophozoite": {
          "x": 621.62,
          "y": 594.99
        },
        "term:cyst": {
          "x": 421,
          "y": 450.62
        },
        "term:larva": {
          "x": 294.31,
          "y": 598
        },
        "term:cercaria": {
          "x": 571.04,
          "y": 490.57
        },
        "term:fecal-oral": {
          "x": 245.16,
          "y": 305.26
        },
        "term:vector-borne": {
          "x": 330.2,
          "y": 226.15
        },
        "term:trophic transmission": {
          "x": 111.06,
          "y": 227.7
        },
        "term:the definitive vector": {
          "x": 483.55,
          "y": 352.86
        },
        "term:survival armor": {
          "x": 238.55,
          "y": 496.78
        },
        "term:amplification": {
          "x": 754.37,
          "y": 506.09
        },
        "term:riders that carry riders": {
          "x": 452.77,
          "y": 137.65
        },
        "cluster:0": {
          "x": 694.47,
          "y": 133.02
        },
        "cluster:1": {
          "x": 796.53,
          "y": 302.57
        },
        "cluster:2": {
          "x": 443.92,
          "y": 553.41
        },
        "cluster:3": {
          "x": 185.97,
          "y": 103.01
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T22:16:43.120Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "parasite-life-cycles",
      "puzzleRevision": "fnv1a32:7a5da757",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480.51,
          "y": 493.37,
          "pinned": true
        },
        "cluster:1": {
          "x": 157.82,
          "y": 330.03,
          "pinned": true
        },
        "cluster:2": {
          "x": 478,
          "y": 123.83,
          "pinned": true
        },
        "cluster:3": {
          "x": 826,
          "y": 294.29,
          "pinned": true
        }
      },
      "bridges": {
        "term:the definitive vector": {
          "x": 447.72,
          "y": 340.39,
          "pinned": true
        },
        "term:survival armor": {
          "x": 581.45,
          "y": 279.16,
          "pinned": true
        },
        "term:amplification": {
          "x": 305.52,
          "y": 192.42,
          "pinned": false
        },
        "term:riders that carry riders": {
          "x": 704.69,
          "y": 441.6,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "protozoan",
          "helminth",
          "ectoparasite"
        ],
        "cluster:1": [
          "definitive host",
          "intermediate host",
          "reservoir",
          "vector"
        ],
        "cluster:2": [
          "trophozoite",
          "cyst",
          "larva",
          "cercaria"
        ],
        "cluster:3": [
          "fecal-oral",
          "vector-borne",
          "trophic transmission"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "helminth",
          "ectoparasite",
          "protozoan"
        ],
        "cluster:1": [
          "reservoir",
          "intermediate host",
          "definitive host",
          "vector"
        ],
        "cluster:2": [
          "larva",
          "cercaria",
          "trophozoite",
          "cyst"
        ],
        "cluster:3": [
          "fecal-oral",
          "trophic transmission",
          "vector-borne"
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
        "totalLength": 1493.5595713832518
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T22:18:59.868Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "parasite-life-cycles",
      "puzzleRevision": "fnv1a32:7a5da757",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:protozoan": {
          "x": 870.98,
          "y": 258.28,
          "pinned": false
        },
        "term:helminth": {
          "x": 843.71,
          "y": 160.46,
          "pinned": false
        },
        "term:ectoparasite": {
          "x": 759.68,
          "y": 232.97,
          "pinned": false
        },
        "term:definitive host": {
          "x": 428.07,
          "y": 119.61,
          "pinned": false
        },
        "term:intermediate host": {
          "x": 282.15,
          "y": 148.69,
          "pinned": false
        },
        "term:reservoir": {
          "x": 249.45,
          "y": 23,
          "pinned": false
        },
        "term:vector": {
          "x": 342.27,
          "y": 44.33,
          "pinned": false
        },
        "term:trophozoite": {
          "x": 150.86,
          "y": 426.8,
          "pinned": false
        },
        "term:cyst": {
          "x": 235.35,
          "y": 470.76,
          "pinned": false
        },
        "term:larva": {
          "x": 178.16,
          "y": 521.34,
          "pinned": false
        },
        "term:cercaria": {
          "x": 250.84,
          "y": 386.38,
          "pinned": false
        },
        "term:fecal-oral": {
          "x": 446.06,
          "y": 525.94,
          "pinned": false
        },
        "term:vector-borne": {
          "x": 503.52,
          "y": 423.68,
          "pinned": false
        },
        "term:trophic transmission": {
          "x": 587.01,
          "y": 546.84,
          "pinned": false
        },
        "term:the definitive vector": {
          "x": 469.98,
          "y": 275.47,
          "pinned": false
        },
        "term:survival armor": {
          "x": 339.76,
          "y": 462.88,
          "pinned": false
        },
        "term:amplification": {
          "x": 219.41,
          "y": 276.64,
          "pinned": false
        },
        "term:riders that carry riders": {
          "x": 645.65,
          "y": 347.2,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2605.73,
        "score": 2605.7318801000147
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T22:18:55.018Z"
    }
  },
  "board": {
    "lensFlowTrace": true,
    "source": "author",
    "savedAt": "2026-10-15T22:16:41.331Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
