// Generated from content/puzzles/bacterial-architectures.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "bacterial-architectures",
  "title": "Beyond the Wall — How a Bacterial Cell Is Built, Moves, and Swaps Genes",
  "category": "microbiology",
  "subcategories": {
    "microbiology": "bacteriology"
  },
  "info": {
    "text": "What a bacterial cell looks like and how it works, one step past its famous wall: the shape vocabulary every lab report uses, the appendages that let it swim, stick, and mate, the interior where the genome floats free, and the two tricks — a dormant spore and sideways gene-swapping — that make bacteria the most adaptable cells on Earth.",
    "links": [
      {
        "href": "wiki:Bacterial cell structure"
      }
    ],
    "citations": [
      {
        "title": "Bacteria",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Bacteria"
      },
      {
        "title": "Bacterial cellular morphologies",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Bacterial_cellular_morphologies"
      },
      {
        "title": "Endospore",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Endospore"
      },
      {
        "title": "Bacterial conjugation",
        "publisher": "Wikipedia",
        "year": "2026",
        "url": "https://en.wikipedia.org/wiki/Bacterial_conjugation"
      }
    ]
  },
  "clusters": [
    {
      "id": "shapes",
      "name": "Cell shapes",
      "color": "teal",
      "fact": "Shape is the first thing a microscope report names, and most of these words are just Latin for the silhouette: berry-round, rod, comma, spiral. The two spirals differ most in how they move, not how they look.",
      "terms": [
        "coccus",
        "bacillus",
        "vibrio",
        "spirillum",
        "spirochete"
      ],
      "seeds": [
        "coccus",
        "bacillus"
      ],
      "termInfo": {
        "bacillus": {
          "text": "Rod-shaped, from baculus, \"stick\"; plural bacilli. Escherichia coli is the classic rod. Watch the capital: Bacillus (capital B) is also a genus name — the shape term is lowercase.",
          "links": [
            {
              "href": "wiki:Bacterial cellular morphologies"
            }
          ]
        },
        "coccus": {
          "text": "Spherical, from kokkos, \"berry\"; plural cocci. Arrangement prefixes finish the description: diplococci pair up, streptococci form chains, staphylococci clump like grapes.",
          "links": [
            {
              "href": "wiki:Bacterial cellular morphologies"
            }
          ]
        },
        "spirillum": {
          "text": "A rigid spiral, plural spirilla, that swims with external flagella — a propeller-driven corkscrew. Rigidity is the dividing line from its flexible cousin.",
          "links": [
            {
              "href": "wiki:Spirillum"
            }
          ]
        },
        "spirochete": {
          "text": "A thin, flexible spiral whose flagella run inside the body, in the space between membranes, so rotating them corkscrews the whole cell forward. Treponema pallidum (syphilis) and Borrelia (Lyme disease) are spirochetes.",
          "links": [
            {
              "href": "wiki:Spirochaete"
            }
          ]
        },
        "vibrio": {
          "text": "A curved rod — comma-shaped, from vibrare, \"to quiver\". The cholera bacterium, Vibrio cholerae, carries the name.",
          "links": [
            {
              "href": "wiki:Vibrio"
            }
          ]
        }
      },
      "info": {
        "text": "Shape words come from Latin and Greek roots for the silhouette, and they combine with arrangement prefixes — diplo- (pairs), strepto- (chains), staphylo- (clusters) — to give lab shorthand like \"Gram-positive cocci in chains\".",
        "links": [
          {
            "href": "wiki:Bacterial cellular morphologies"
          }
        ]
      }
    },
    {
      "id": "appendages",
      "name": "Surface appendages",
      "color": "blue",
      "fact": "Everything here reaches out through the wall. One kind rotates like a propeller for swimming, the finest ones glue the cell to a surface, and a special class launches the bacterial version of mating.",
      "terms": [
        "flagellum",
        "pilus",
        "fimbria"
      ],
      "seeds": [
        "flagellum",
        "pilus"
      ],
      "termInfo": {
        "fimbria": {
          "text": "The finest filaments — 2–10 nanometres, plural fimbriae, Latin \"fringe\". Hundreds can stud one cell, letting it colonize a surface or host tissue; the fimbrial type of E. coli largely decides where in the urinary tract it can take hold.",
          "links": [
            {
              "href": "wiki:Pilus"
            }
          ]
        },
        "flagellum": {
          "text": "A rotating helical filament driven by a motor at its base and powered by the cell's electrochemical gradient. Number and placement get their own vocabulary: monotrichous (one), lophotrichous (a tuft), peritrichous (all over).",
          "links": [
            {
              "href": "wiki:Flagellum"
            }
          ]
        },
        "pilus": {
          "text": "A larger surface filament, plural pili. A conjugation or \"sex\" pilus holds donor to recipient during gene transfer; type IV pili can also retract to drag the cell along a surface — twitching motility.",
          "links": [
            {
              "href": "wiki:Pilus"
            }
          ]
        }
      },
      "info": {
        "text": "All three are protein assemblies built on the cell surface, and size plus job separates them: one rotates for swimming, the finest ones glue the cell down, and a special class grips another cell for mating.",
        "links": [
          {
            "href": "wiki:Bacterial cell structure"
          }
        ]
      }
    },
    {
      "id": "interior",
      "name": "Interior contents",
      "color": "amber",
      "fact": "There is no membrane-bound nucleus anywhere in this cell. The genome lives as a loop free in the cytoplasm, and everything here is either information to be copied, machinery that builds protein, or cargo in storage.",
      "terms": [
        "ribosome",
        "plasmid",
        "nucleoid",
        "inclusion body"
      ],
      "seeds": [
        "ribosome",
        "plasmid"
      ],
      "termInfo": {
        "inclusion body": {
          "text": "Storage granules: glycogen, polyphosphate, sulfur, or carbon polymers banked for lean times. Specialized versions give buoyancy (gas vesicles) or navigation (magnetosomes).",
          "links": [
            {
              "href": "wiki:Inclusion bodies"
            }
          ]
        },
        "nucleoid": {
          "text": "The irregular region where the circular chromosome sits — not bounded by any membrane. The DNA is supercoiled and packed with nucleoid-associated proteins.",
          "links": [
            {
              "href": "wiki:Nucleoid"
            }
          ]
        },
        "plasmid": {
          "text": "A small ring of accessory DNA that replicates independently. Plasmids carry bonus genes — antibiotic resistance, virulence factors, new metabolic pathways — and can move between cells, which makes them the cargo of gene transfer.",
          "links": [
            {
              "href": "wiki:Plasmid"
            }
          ]
        },
        "ribosome": {
          "text": "The protein factory. Bacterial ribosomes are 70S — smaller than the 80S kind our own cells use — which is exactly why antibiotics such as streptomycin and tetracycline can shut down bacterial protein synthesis selectively.",
          "links": [
            {
              "href": "wiki:Ribosome"
            }
          ]
        }
      },
      "info": {
        "text": "Bacteria are prokaryotes: no nuclear membrane, no mitochondria, no membrane-bound organelles. The cytoplasm holds DNA, protein-building machinery, and storage granules in one compartment.",
        "links": [
          {
            "href": "wiki:Prokaryote"
          }
        ]
      }
    },
    {
      "id": "dormancy",
      "name": "Dormant survival",
      "color": "magenta",
      "fact": "When nutrients run out, some soil-dwelling bacteria build a seed: metabolically silent, resistant to boiling and most disinfectants, and able to wait years before waking as a working cell again.",
      "terms": [
        "endospore",
        "germination",
        "calcium dipicolinate",
        "sporulation"
      ],
      "seeds": [
        "endospore",
        "germination"
      ],
      "termInfo": {
        "calcium dipicolinate": {
          "text": "Calcium dipicolinate — up to 20% of the spore core's dry weight. It threads between DNA strands and stabilizes them against heat and chemicals, a large part of why endospores survive hours of boiling.",
          "links": [
            {
              "href": "wiki:Dipicolinic acid"
            }
          ]
        },
        "endospore": {
          "text": "A dormant, tough, non-reproductive structure built inside the cell by Bacillus and Clostridium relatives. Where the spore sits in the cell helps identify the species — Clostridium tetani's terminal spore gives it a drumstick shape.",
          "links": [
            {
              "href": "wiki:Endospore"
            }
          ]
        },
        "germination": {
          "text": "The wake-up: activation (often a heat shock), then rehydration, loss of resistance, and outgrowth into a working vegetative cell. Tyndallization sterilizes by triggering germination first, then boiling the vulnerable cells that emerge.",
          "links": [
            {
              "href": "wiki:Tyndallization"
            }
          ]
        },
        "sporulation": {
          "text": "The roughly eight-hour shutdown program: DNA replicates, a septum pinches off a forespore, cortex and coat assemble around it, and the mother cell lyses to release the mature spore. Starvation and quorum sensing set it in motion.",
          "links": [
            {
              "href": "wiki:Endospore"
            }
          ]
        }
      },
      "info": {
        "text": "Starvation, not cold, triggers this program. The cell copies its DNA, builds protective layers inward, and reduces itself to a dehydrated seed that no longer metabolizes — visible in the lab with a Schaeffer–Fulton endospore stain.",
        "links": [
          {
            "href": "wiki:Endospore"
          }
        ]
      }
    },
    {
      "id": "hgt",
      "name": "Trading genes sideways",
      "color": "olive",
      "fact": "Bacteria do not only inherit genes from the cell they split from. These three routes move DNA between neighbors — sometimes across species lines — which is why antibiotic resistance spreads faster than any lineage divides.",
      "terms": [
        "conjugation",
        "transformation",
        "transduction"
      ],
      "seeds": [
        "conjugation",
        "transformation"
      ],
      "termInfo": {
        "conjugation": {
          "text": "Direct DNA transfer through cell-to-cell contact, mediated by a conjugative plasmid and its pilus. The F (fertility) plasmid is the textbook case: an F⁺ donor converts an F⁻ recipient into a donor too — fertility spreads like an infection.",
          "links": [
            {
              "href": "wiki:Bacterial conjugation"
            }
          ]
        },
        "transduction": {
          "text": "A bacteriophage does the ferrying: a phage particle accidentally packs host DNA instead of its own genome and injects it into the next cell it infects.",
          "links": [
            {
              "href": "wiki:Transduction (genetics)"
            }
          ]
        },
        "transformation": {
          "text": "The cell takes up naked DNA from its surroundings — released by dead cells — and recombines it into its own genome. Species that can do it naturally are called competent; laboratory transformation persuades others chemically or electrically.",
          "links": [
            {
              "href": "wiki:Genetic transformation"
            }
          ]
        }
      },
      "info": {
        "text": "Vertical inheritance passes genes from parent cell to daughter. Horizontal (lateral) transfer moves them between living neighbors — sometimes across species lines. All three routes are parasexual: no offspring result, just new genes.",
        "links": [
          {
            "href": "wiki:Horizontal gene transfer"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "flagella-placement",
      "term": "flagella placement",
      "clusters": [
        0,
        1
      ],
      "fact": "Where the motors sit follows the body plan: a rigid spirillum rows with external flagella, while a spirochete corkscrews through viscous fluid on flagella that run inside its flexible body — the same organ, driving swimming two different ways.",
      "info": {
        "text": "Motility specialists classify bacteria by flagella number and placement as carefully as by shape — the two traits together narrow an unknown isolate quickly.",
        "links": [
          {
            "href": "wiki:Bacterial cellular morphologies"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "spirochete",
        "flagellum"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "conjugative-transfer",
      "term": "conjugative transfer",
      "clusters": [
        1,
        2,
        4
      ],
      "fact": "One event, three structures: a pilus draws donor and recipient together, a copy of the plasmid crosses, and the event is conjugation. The recipient becomes a donor itself, which is how resistance genes sweep a population.",
      "info": {
        "text": "Conjugation was discovered by Joshua Lederberg and Edward Tatum in 1946, work that helped launch bacterial genetics.",
        "links": [
          {
            "href": "wiki:Bacterial conjugation"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "pilus",
        "plasmid",
        "conjugation"
      ]
    },
    {
      "id": "spore-core",
      "term": "the spore core",
      "clusters": [
        2,
        3
      ],
      "fact": "An endospore is not offspring but the same cell's interior surviving in miniature: DNA and ribosomes packed into a dehydrated core, held stable by calcium dipicolinate until germination restores a working cell.",
      "info": {
        "text": "The core's water content drops to a quarter to half of a vegetative cell's; that dehydration, more than any single chemical, is what makes the spore heat-resistant.",
        "links": [
          {
            "href": "wiki:Endospore"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "nucleoid",
        "endospore"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "curved-and-spiral",
      "prompt": "Which of these shape terms name curved or spiral silhouettes rather than straight or round ones?",
      "explanation": "The comma, the rigid spiral, and the flexible internal-flagellated spiral are the three curved forms. Coccus is the sphere and bacillus the straight rod — neither curves.",
      "targets": [
        "vibrio",
        "spirillum",
        "spirochete"
      ],
      "reasons": {
        "spirillum": "A rigid spiral that swims on external flagella.",
        "spirochete": "A flexible spiral that corkscrews on internal flagella.",
        "vibrio": "A comma-shaped curve, not a full spiral."
      }
    },
    {
      "id": "inside-out-flagella",
      "prompt": "Which single term names the body whose flagella run inside it rather than outside?",
      "explanation": "The spirochete's flagella sit in the periplasm between its membranes, so rotating them corkscrews the flexible whole body forward — Treponema and Borrelia travel this way. The spirillum rows with external flagella, and the vibrio's flagellum is external too.",
      "targets": [
        "spirochete"
      ],
      "reasons": {
        "spirochete": "Internal periplasmic flagella inside a flexible body — the defining trait."
      }
    },
    {
      "id": "stick-not-swim",
      "prompt": "Which surface structures are built for holding on rather than swimming?",
      "explanation": "Fimbriae glue the cell to a surface or host tissue; pili grip another cell during conjugation, and type IV pili also pull in twitching motility. The flagellum is the swimming organ — it rotates; it does not attach.",
      "targets": [
        "fimbria",
        "pilus"
      ],
      "reasons": {
        "fimbria": "Fine attachment bristles, often in the hundreds.",
        "pilus": "The mating grip — and type IV pili drag in twitching motility."
      }
    },
    {
      "id": "dna-carriers",
      "prompt": "Which interior structures hold genetic information?",
      "explanation": "Both hold DNA: the nucleoid is the main circular chromosome's home, and plasmids are independent accessory rings carrying bonus genes. Ribosomes are RNA-and-protein machinery, and inclusion bodies store small molecules — no genes in either.",
      "targets": [
        "nucleoid",
        "plasmid"
      ],
      "reasons": {
        "nucleoid": "The chromosome lives there, unbounded by membrane.",
        "plasmid": "Independent DNA rings — the cargo of gene transfer."
      }
    },
    {
      "id": "state-versus-process",
      "prompt": "Which dormancy terms name the protected state or its chemistry, rather than a process in time?",
      "explanation": "The endospore is the dormant structure itself, and calcium dipicolinate is the heat-shielding chemistry packed into its core. Sporulation builds the structure and germination leaves it — both are processes in time.",
      "targets": [
        "endospore",
        "calcium dipicolinate"
      ],
      "reasons": {
        "calcium dipicolinate": "The core's heat shield, up to 20% of its dry weight.",
        "endospore": "The structure — not the making of it or the waking from it."
      }
    },
    {
      "id": "without-a-virus",
      "prompt": "Which gene-transfer routes can move DNA between two living cells with no virus involved?",
      "explanation": "Transformation takes up naked DNA released into the environment, and conjugation passes it directly across cell-to-cell contact. Transduction is the odd one out: a bacteriophage carries its cargo.",
      "targets": [
        "transformation",
        "conjugation"
      ],
      "reasons": {
        "conjugation": "Direct contact through a pilus — no carrier.",
        "transformation": "Naked DNA uptake — no carrier at all."
      }
    },
    {
      "id": "contact-required",
      "prompt": "Which two terms describe a partnership that needs direct cell-to-cell contact?",
      "explanation": "Conjugation is contact-transfer, and the pilus is the grip that makes the contact. Fimbriae grip surfaces, not cells, and transformation needs no partner at all.",
      "targets": [
        "pilus",
        "conjugation"
      ],
      "reasons": {
        "conjugation": "Transfer that happens only across direct contact.",
        "pilus": "The grip that draws donor and recipient together."
      }
    },
    {
      "id": "the-sweep",
      "prompt": "Which connection names the event that lets a resistance plasmid cross from one cell into the next?",
      "explanation": "The conjugative-transfer bridge spans three groups at once: a pilus draws the cells together, a plasmid copy crosses, and the event is conjugation — the recipient becomes a donor itself, so resistance sweeps a population fastest by this route.",
      "targets": [
        "conjugative transfer"
      ],
      "reasons": {
        "conjugative transfer": "One event spanning pilus, plasmid, and conjugation."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "why-the-gram-stain-works",
        "reason": "Complementary halves of one cell: that board teaches the two envelope blueprints, the Gram stain that reads them, and wall-targeting antibiotics; this board teaches everything past the wall — shape, appendages, interior, dormancy, and gene exchange."
      },
      {
        "id": "virus-build-and-takeover",
        "reason": "Batch sibling: this board's transduction route is a bacteriophage at work; that board teaches the phage from the virus's side — capsid to lysis."
      },
      {
        "id": "parasite-life-cycles",
        "reason": "Batch sibling: this board's tick bridge delivers Borrelia, the spirochete whose internal-flagella swimming is taught here."
      },
      {
        "id": "fungal-forms-and-habitats",
        "reason": "Batch sibling: the two cell-architecture boards of the arc — walls, shapes, and spores on the prokaryote and eukaryote sides."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Bacteria are cells — complete, self-contained living cells — just very small ones, typically one to five micrometres, and built to a different plan from ours. They have no nucleus and no membrane-bound organelles; their DNA sits free in the cytoplasm. Every structural idea here follows from that simplicity: with less compartmentalization, each structure is a protein assembly doing one job extremely well.\r\n\r\nShape is the first thing anyone reports about a bacterium, and the vocabulary is old, descriptive Latin. A coccus is a sphere, a bacillus a rod, a vibrio a comma-shaped curve, and two kinds of spiral — the rigid spirillum and the flexible spirochete — are separated less by silhouette than by how they swim.\r\n\r\nWhat sticks out from the cell matters as much as the silhouette. A flagellum is a rotating propeller for swimming. Fimbriae are fine bristles that glue the cell to a surface or a host tissue. A pilus is the gripping filament that lets one bacterium hold a neighbor close enough to hand over DNA.\r\n\r\nInside, the inventory is short and dense. The genome sits in the nucleoid as a circular loop. Plasmids are small accessory rings that carry bonus genes such as antibiotic resistance. Ribosomes build proteins. Inclusion bodies store supplies for lean times.\r\n\r\nTwo behaviors make bacteria the most adaptable cells on Earth. Under starvation, Bacillus and Clostridium relatives withdraw into an endospore — a dehydrated, metabolically silent seed that survives boiling, disinfectants, and years of waiting, stabilized by calcium dipicolinate, until germination wakes it. And rather than only inheriting genes from a parent cell, bacteria trade them sideways: transformation takes up naked DNA, transduction lets a virus ferry it, and conjugation passes it directly from cell to cell. Resistance genes ride all three routes, which is why antibiotic resistance spreads faster than any bacterial lineage can divide."
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
      "puzzleId": "bacterial-architectures",
      "puzzleRevision": "fnv1a32:000be036",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:coccus": {
          "x": 150.62,
          "y": 339.26
        },
        "term:bacillus": {
          "x": 82.67,
          "y": 240.83
        },
        "term:vibrio": {
          "x": 119.93,
          "y": 153.86
        },
        "term:spirillum": {
          "x": 216.42,
          "y": 137.96
        },
        "term:spirochete": {
          "x": 317.09,
          "y": 201.3
        },
        "term:flagellum": {
          "x": 456.99,
          "y": 161.64
        },
        "term:pilus": {
          "x": 571.52,
          "y": 170.25
        },
        "term:fimbria": {
          "x": 684.77,
          "y": 22
        },
        "term:ribosome": {
          "x": 852.75,
          "y": 126.09
        },
        "term:plasmid": {
          "x": 639.8,
          "y": 257.78
        },
        "term:nucleoid": {
          "x": 741.88,
          "y": 303.32
        },
        "term:inclusion body": {
          "x": 846.3,
          "y": 260.44
        },
        "term:endospore": {
          "x": 593.28,
          "y": 414.67
        },
        "term:germination": {
          "x": 821.44,
          "y": 498.1
        },
        "term:calcium dipicolinate": {
          "x": 719.4,
          "y": 582.97
        },
        "term:sporulation": {
          "x": 523.94,
          "y": 580.96
        },
        "term:conjugation": {
          "x": 411.34,
          "y": 481.34
        },
        "term:transformation": {
          "x": 306.43,
          "y": 569.94
        },
        "term:transduction": {
          "x": 146.25,
          "y": 578.45
        },
        "term:flagella placement": {
          "x": 357.43,
          "y": 85.41
        },
        "term:conjugative transfer": {
          "x": 472.69,
          "y": 341.4
        },
        "term:the spore core": {
          "x": 766.34,
          "y": 416.73
        },
        "cluster:0": {
          "x": 188.23,
          "y": 246.95
        },
        "cluster:1": {
          "x": 566.1,
          "y": 76.76
        },
        "cluster:2": {
          "x": 751.75,
          "y": 188.88
        },
        "cluster:3": {
          "x": 631.44,
          "y": 501.41
        },
        "cluster:4": {
          "x": 221.1,
          "y": 457.3
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T21:48:07.063Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "bacterial-architectures",
      "puzzleRevision": "fnv1a32:000be036",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 512.07,
          "y": 147.82,
          "pinned": true
        },
        "cluster:1": {
          "x": 825.69,
          "y": 232.95,
          "pinned": true
        },
        "cluster:2": {
          "x": 295.9,
          "y": 494.66,
          "pinned": true
        },
        "cluster:3": {
          "x": 699.54,
          "y": 494.92,
          "pinned": true
        },
        "cluster:4": {
          "x": 153.35,
          "y": 276.04,
          "pinned": true
        }
      },
      "bridges": {
        "term:flagella placement": {
          "x": 713.17,
          "y": 70.38,
          "pinned": true
        },
        "term:conjugative transfer": {
          "x": 504.75,
          "y": 319.35,
          "pinned": true
        },
        "term:the spore core": {
          "x": 506.79,
          "y": 415.73,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "coccus",
          "bacillus",
          "vibrio",
          "spirillum",
          "spirochete"
        ],
        "cluster:1": [
          "flagellum",
          "pilus",
          "fimbria"
        ],
        "cluster:2": [
          "ribosome",
          "plasmid",
          "nucleoid",
          "inclusion body"
        ],
        "cluster:3": [
          "endospore",
          "germination",
          "calcium dipicolinate",
          "sporulation"
        ],
        "cluster:4": [
          "conjugation",
          "transformation",
          "transduction"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "vibrio",
          "bacillus",
          "spirochete",
          "spirillum",
          "coccus"
        ],
        "cluster:1": [
          "fimbria",
          "flagellum",
          "pilus"
        ],
        "cluster:2": [
          "plasmid",
          "nucleoid",
          "inclusion body",
          "ribosome"
        ],
        "cluster:3": [
          "endospore",
          "calcium dipicolinate",
          "sporulation",
          "germination"
        ],
        "cluster:4": [
          "transduction",
          "transformation",
          "conjugation"
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
        "totalLength": 1470.8189362393
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T21:49:21.846Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
