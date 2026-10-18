// Generated from content/puzzles/grading-muscle-force.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "grading-muscle-force",
  "title": "Grading muscle force",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "muscle"
  },
  "info": {
    "text": "The same muscle can hold a teacup or lift a suitcase. The nervous system sets force by how often and how many motor units fire; the muscle's length and speed set what each can deliver.",
    "links": [
      {
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-4-nervous-system-control-of-muscle-tension"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., chapter 6",
        "author": "John E. Hall, Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021"
      },
      {
        "title": "Anatomy and Physiology 2e, §10.4 Nervous System Control of Muscle Tension",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-4-nervous-system-control-of-muscle-tension"
      },
      {
        "title": "Relation between size of neurons and their susceptibility to discharge",
        "author": "Elwood Henneman",
        "publisher": "Science 126:1345–1347",
        "year": "1957",
        "url": "https://pubmed.ncbi.nlm.nih.gov/13495469/"
      },
      {
        "title": "The heat of shortening and the dynamic constants of muscle",
        "author": "A. V. Hill",
        "publisher": "Proceedings of the Royal Society B 126:136–195",
        "year": "1938",
        "url": "https://doi.org/10.1098/rspb.1938.0050"
      },
      {
        "title": "When active muscles lengthen: properties and consequences of eccentric contractions",
        "author": "S. L. Lindstedt, P. C. LaStayo, T. E. Reich",
        "publisher": "News in Physiological Sciences 16:256–261",
        "year": "2001",
        "url": "https://pubmed.ncbi.nlm.nih.gov/11719600/"
      }
    ]
  },
  "clusters": [
    {
      "id": "twitch-and-summation",
      "name": "Twitch and summation",
      "color": "teal",
      "fact": "A single action potential produces a muscle twitch, too brief to reach full force. Firing again before the fiber relaxes adds the new twitch onto the last one, a frequency summation; at high enough rates the twitches fuse into tetanus, the fiber's maximal sustained force. After rest, the first few twitches grow progressively stronger, the staircase effect called treppe.",
      "terms": [
        "muscle twitch",
        "tetanus",
        "frequency summation",
        "treppe"
      ],
      "seeds": [
        "muscle twitch",
        "tetanus"
      ],
      "termInfo": {
        "frequency summation": "Guyton's term; many courses call it wave summation. Each new action potential arrives while calcium is still elevated, so the twitches add.",
        "muscle twitch": "The single brief contraction and relaxation that follows one action potential.",
        "tetanus": {
          "text": "Fused, sustained contraction at high firing rates. Below the fusion rate, force ripples (unfused or incomplete tetanus). Unrelated to the tetanus infection, which is named for the spasms it causes.",
          "links": [
            {
              "href": "wiki:Tetanic contraction"
            }
          ]
        },
        "treppe": {
          "text": "German for 'staircase': rising twitch strength over the first stimuli after rest, attributed to calcium building up in the cytosol.",
          "links": [
            {
              "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-4-nervous-system-control-of-muscle-tension"
            }
          ]
        }
      },
      "info": {
        "text": "Grading force by how often a motor unit fires.",
        "links": [
          {
            "href": "wiki:Tetanic contraction"
          }
        ]
      }
    },
    {
      "id": "motor-unit-recruitment",
      "name": "Motor-unit recruitment",
      "color": "blue",
      "fact": "The nervous system also grades force by how many motor units it activates. Recruitment follows the size principle: small motor neurons, each driving a few slow fibers, fire first, and larger units join as demand rises. Muscles for fine control have a low innervation ratio, with few fibers per neuron, and even at rest a low level of unit activity maintains muscle tone.",
      "terms": [
        "motor unit recruitment",
        "size principle",
        "innervation ratio",
        "muscle tone"
      ],
      "seeds": [
        "motor unit recruitment",
        "size principle"
      ],
      "termInfo": {
        "innervation ratio": "The number of muscle fibers one motor neuron supplies: as few as a handful in eye muscles, hundreds or more in large limb muscles.",
        "motor unit recruitment": {
          "text": "Activating additional motor units to raise force. Guyton calls it multiple fiber summation.",
          "links": [
            {
              "href": "wiki:Motor unit recruitment"
            }
          ]
        },
        "muscle tone": {
          "text": "The slight resting tension of a muscle, kept up by a low rate of motor-unit firing.",
          "links": [
            {
              "href": "wiki:Muscle tone"
            }
          ]
        },
        "size principle": {
          "text": "Henneman's finding that motor neurons are recruited in order of size, smallest first, so small forces are graded finely and large units are held in reserve.",
          "links": [
            {
              "href": "wiki:Henneman's size principle"
            }
          ]
        }
      },
      "info": {
        "text": "Grading force by how many motor units fire.",
        "links": [
          {
            "href": "wiki:Motor unit recruitment"
          }
        ]
      }
    },
    {
      "id": "length-tension",
      "name": "Length–tension",
      "color": "amber",
      "fact": "Active force depends on sarcomere length because it depends on filament overlap. At optimal length, about 2.0–2.2 µm, every myosin head can reach actin. Stretched further, overlap and force fall; shortened further, the filaments collide and force falls too. Stretching a resting muscle meets passive tension from its elastic structures.",
      "terms": [
        "optimal length",
        "filament overlap",
        "passive tension"
      ],
      "seeds": [
        "optimal length",
        "filament overlap"
      ],
      "termInfo": {
        "filament overlap": "How far thin filaments extend among the myosin heads; force tracks the number of heads that can reach actin.",
        "optimal length": "The sarcomere length at which active force is greatest, about 2.0–2.2 µm in human skeletal muscle.",
        "passive tension": {
          "text": "Force from stretching elastic structures in a relaxed muscle, chiefly the giant protein titin; it rises steeply beyond optimal length.",
          "links": [
            {
              "href": "wiki:Titin"
            }
          ]
        }
      },
      "info": {
        "text": "How a fiber's starting length sets the force it can develop.",
        "links": [
          {
            "href": "wiki:Sliding filament theory"
          }
        ]
      }
    },
    {
      "id": "load-and-speed",
      "name": "Load and speed",
      "color": "magenta",
      "fact": "The heavier the load, the more slowly a muscle shortens. Afterload is the load the muscle meets once it starts to contract; with none, it shortens at its maximal shortening velocity, set by the speed of its myosin ATPase. Power output, force times velocity, peaks at intermediate loads of about a third of maximal force.",
      "terms": [
        "afterload",
        "maximal shortening velocity",
        "power output"
      ],
      "seeds": [
        "afterload",
        "maximal shortening velocity"
      ],
      "termInfo": {
        "afterload": "The load a muscle must move once it starts to contract; it decides how fast, and whether, the muscle shortens.",
        "maximal shortening velocity": "The speed of shortening against zero load, highest in fast fibers whose myosin splits ATP fastest.",
        "power output": "Force multiplied by shortening velocity. It falls to zero at both ends of the curve and peaks near a third of maximal force and a third of maximal velocity."
      },
      "info": {
        "text": "Why heavy loads move slowly and light ones quickly.",
        "links": [
          {
            "href": "wiki:Hill's muscle model"
          }
        ]
      }
    },
    {
      "id": "contraction-types",
      "name": "Contraction types",
      "color": "olive",
      "fact": "In an isometric contraction the muscle develops force without changing length, because the load matches the force it can develop. In a concentric contraction it shortens while moving a load; in an eccentric contraction it lengthens while still active, braking a load heavier than its force, as in lowering a weight or walking downhill.",
      "terms": [
        "isometric contraction",
        "concentric contraction",
        "eccentric contraction"
      ],
      "seeds": [
        "isometric contraction",
        "concentric contraction"
      ],
      "termInfo": {
        "concentric contraction": "Active shortening while moving a load. Guyton's isotonic contraction covers both concentric and eccentric movement under a constant load.",
        "eccentric contraction": {
          "text": "Active lengthening under a load the muscle cannot overcome. It produces the most force per active fiber at the lowest energy cost, and unaccustomed eccentric work causes delayed-onset soreness.",
          "links": [
            {
              "href": "https://pubmed.ncbi.nlm.nih.gov/11719600/"
            }
          ]
        },
        "isometric contraction": "Force without a change in muscle length, as in holding a weight still."
      },
      "info": {
        "text": "Holding, shortening, and braking.",
        "links": [
          {
            "href": "wiki:Muscle contraction"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "asynchronous-firing",
      "term": "asynchronous firing",
      "clusters": [
        0,
        1
      ],
      "fact": "Different motor units fire out of step, so their twitches overlap in time. Whole-muscle force stays smooth even when each unit fires below its fusion rate for tetanus, and the recruited units can take turns, delaying fatigue.",
      "info": "Guyton calls it asynchronous summation of motor units.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "tetanus",
        "motor unit recruitment"
      ]
    },
    {
      "id": "preload",
      "term": "preload",
      "clusters": [
        2,
        3
      ],
      "fact": "Preload is the load that stretches a muscle before it contracts, setting where its fibers start on the length–tension curve. Afterload is the load met once shortening begins. In the heart, preload is end-diastolic filling, the basis of the Frank–Starling mechanism.",
      "info": "The Frank–Starling mechanism is the heart's length–tension relationship; see Regulating arterial pressure.",
      "idealTerms": [
        null,
        "afterload"
      ]
    },
    {
      "id": "force-velocity-relationship",
      "term": "force–velocity relationship",
      "clusters": [
        3,
        4
      ],
      "fact": "The force–velocity relationship is one curve across all three contraction types. As the load rises, shortening slows; when the load matches maximal force, velocity reaches zero and the contraction is isometric; when the load exceeds it, the active muscle is pulled out while still resisting and develops more force than its isometric maximum.",
      "info": {
        "text": "Described quantitatively by A. V. Hill in 1938; eccentric force can reach roughly one and a half times the isometric maximum.",
        "links": [
          {
            "href": "wiki:Hill's muscle model"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "maximal shortening velocity",
        "isometric contraction"
      ]
    }
  ],
  "lenses": [
    {
      "id": "two-ways-to-grade",
      "prompt": "Which two mechanisms let the nervous system raise a muscle's force?",
      "explanation": "Force rises when each motor unit fires faster or when more units fire. Tetanus is where faster firing ends up, the size principle sets recruitment's order, and asynchronous firing smooths the result.",
      "targets": [
        "frequency summation",
        "motor unit recruitment"
      ],
      "reasons": {
        "frequency summation": "Faster firing adds twitches together.",
        "motor unit recruitment": "More active units add their fibers' force."
      }
    },
    {
      "id": "one-action-potential",
      "prompt": "What does a single action potential produce in a skeletal muscle fiber?",
      "explanation": "One action potential gives one brief contraction and relaxation, well below the force the fiber can reach.",
      "targets": [
        "muscle twitch"
      ],
      "reasons": {
        "muscle twitch": "The response to one action potential."
      }
    },
    {
      "id": "fused-twitches",
      "prompt": "Which response appears when a motor unit fires so fast that its twitches fuse?",
      "explanation": "At high rates calcium never falls between action potentials, so contraction becomes smooth and sustained at the fiber's maximal force.",
      "targets": [
        "tetanus"
      ],
      "reasons": {
        "tetanus": "Fused twitches at high firing rates."
      }
    },
    {
      "id": "staircase",
      "prompt": "Which effect makes the first few twitches after rest grow progressively stronger?",
      "explanation": "Treppe is usually attributed to calcium accumulating with each stimulus; it is distinct from summation because each twitch still relaxes fully.",
      "targets": [
        "treppe"
      ],
      "reasons": {
        "treppe": "The staircase rise in twitch strength."
      }
    },
    {
      "id": "recruitment-order",
      "prompt": "Which rule sets the order in which motor units join as demand rises?",
      "explanation": "Small motor neurons reach threshold first, so the small, fatigue-resistant units carry light work and large, powerful units join only for heavy efforts.",
      "targets": [
        "size principle"
      ],
      "reasons": {
        "size principle": "Recruitment proceeds from smallest to largest units."
      }
    },
    {
      "id": "fine-control",
      "prompt": "Why can the eye's muscles make finer adjustments than the thigh's?",
      "explanation": "Each eye-muscle motor neuron supplies only a few fibers, so adding one unit changes force by a tiny step; thigh units supply hundreds of fibers each.",
      "targets": [
        "innervation ratio"
      ],
      "reasons": {
        "innervation ratio": "Fewer fibers per neuron means smaller force steps."
      }
    },
    {
      "id": "resting-firmness",
      "prompt": "Which concept names the slight tension a resting muscle keeps?",
      "explanation": "A low rate of motor-unit firing keeps resting muscle slightly taut, ready for action and steadying posture.",
      "targets": [
        "muscle tone"
      ],
      "reasons": {
        "muscle tone": "Resting tension from low-level unit activity."
      }
    },
    {
      "id": "smooth-pull",
      "prompt": "Why does a muscle pull smoothly even when each of its units fires too slowly to fuse?",
      "explanation": "Units fire out of step, so the dips in one unit's force are filled by the peaks of others.",
      "targets": [
        "asynchronous firing"
      ],
      "reasons": {
        "asynchronous firing": "Out-of-step units overlap to smooth total force."
      }
    },
    {
      "id": "overstretched",
      "prompt": "Why does a sarcomere stretched beyond its optimal length develop less active force?",
      "explanation": "Stretching pulls the thin filaments away from the myosin heads, so fewer heads can attach. Passive tension rises with stretch, but it is not active force.",
      "targets": [
        "filament overlap"
      ],
      "reasons": {
        "filament overlap": "Less overlap leaves fewer heads able to pull."
      }
    },
    {
      "id": "peak-length",
      "prompt": "At which sarcomere length does active force peak?",
      "explanation": "Around 2.0–2.2 µm every myosin head can reach actin and the filaments do not yet collide.",
      "targets": [
        "optimal length"
      ],
      "reasons": {
        "optimal length": "The length of maximal overlap without collision."
      }
    },
    {
      "id": "relaxed-stretch",
      "prompt": "What resists stretching a muscle that is not contracting?",
      "explanation": "Elastic structures, chiefly titin, resist stretch even with no cross-bridges attached.",
      "targets": [
        "passive tension"
      ],
      "reasons": {
        "passive tension": "Elastic resistance of the relaxed muscle."
      }
    },
    {
      "id": "two-loads",
      "prompt": "Which concepts name the loads on a muscle before and after it begins to contract?",
      "explanation": "Preload stretches the muscle beforehand and sets its starting length; afterload is what it must move once it contracts.",
      "targets": [
        "preload",
        "afterload"
      ],
      "reasons": {
        "afterload": "The load met once contraction begins.",
        "preload": "The load that sets length before contraction."
      }
    },
    {
      "id": "no-load",
      "prompt": "How fast does a muscle shorten when it moves no load at all?",
      "explanation": "With zero afterload, speed is limited only by how fast the cross-bridges cycle.",
      "targets": [
        "maximal shortening velocity"
      ],
      "reasons": {
        "maximal shortening velocity": "Shortening speed at zero load."
      }
    },
    {
      "id": "peak-power",
      "prompt": "Which quantity peaks at intermediate loads instead of at the heaviest or lightest?",
      "explanation": "At the heaviest load the muscle does not move, and at zero load it exerts no force; their product is greatest in between.",
      "targets": [
        "power output"
      ],
      "reasons": {
        "power output": "Force times velocity, highest at intermediate loads."
      }
    },
    {
      "id": "lifting",
      "prompt": "Which contraction lifts a weight?",
      "explanation": "Lifting requires the muscle to shorten while moving its load.",
      "targets": [
        "concentric contraction"
      ],
      "reasons": {
        "concentric contraction": "Active shortening against a load."
      }
    },
    {
      "id": "load-meets-force",
      "prompt": "In which contractions does the muscle fail to shorten because the load matches or exceeds its force?",
      "explanation": "A matching load holds the muscle at constant length; a heavier load pulls it longer while it still resists.",
      "targets": [
        "isometric contraction",
        "eccentric contraction"
      ],
      "reasons": {
        "eccentric contraction": "The load exceeds the force, so the muscle lengthens.",
        "isometric contraction": "The load equals the force, so length holds."
      }
    },
    {
      "id": "lowering-beats-lifting",
      "prompt": "Which concepts explain why a muscle can resist more while lowering a weight than it could ever lift?",
      "explanation": "The force–velocity curve continues past zero velocity: an actively lengthening muscle develops more force than its isometric maximum.",
      "targets": [
        "force–velocity relationship",
        "eccentric contraction"
      ],
      "reasons": {
        "eccentric contraction": "Lowering a weight is active lengthening.",
        "force–velocity relationship": "Force keeps rising as velocity turns negative."
      }
    },
    {
      "id": "heaviest-hold",
      "prompt": "Which conditions together let a muscle hold its heaviest possible load in place?",
      "explanation": "Maximal holding force needs every unit active, each firing fast enough to fuse, with sarcomeres at optimal length and no shortening to slow the cross-bridges.",
      "targets": [
        "tetanus",
        "motor unit recruitment",
        "optimal length",
        "isometric contraction"
      ],
      "reasons": {
        "isometric contraction": "Zero velocity, the peak of the force–velocity curve for a muscle that is not lengthening.",
        "motor unit recruitment": "Every motor unit active.",
        "optimal length": "Every myosin head able to reach actin.",
        "tetanus": "Each fiber at its maximal fused force."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "muscular-system",
        "reason": "Start with the overview of the motor unit, the fiber types that the size principle recruits in order, and fatigue."
      },
      {
        "id": "excitation-contraction-coupling",
        "reason": "See the calcium transient and cross-bridge cycle that each twitch is made of."
      },
      {
        "id": "regulating-arterial-pressure",
        "reason": "See the length–tension relationship at work in the heart as the Frank–Starling mechanism.",
        "via": [
          "preload"
        ]
      },
      {
        "id": "meeting-the-demands-of-exercise",
        "reason": "See how training changes muscle and fuel use over weeks."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How much and how fast",
    "summary": "How the nervous system grades a muscle's force by firing rate and recruitment, and how length and speed limit what the muscle can deliver.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Picking up a paper clip and picking up a suitcase use the same muscles. Each skeletal fiber obeys an all-or-none action potential, so the gradation must come from somewhere else: from how the nervous system fires its motor units, and from the mechanical conditions the muscle is working under.\r\n\r\n## Firing rate: from twitch to tetanus\r\n\r\nOne action potential produces a **muscle twitch**, a brief contraction and relaxation that reaches only part of the fiber's possible force. If the next action potential arrives before the fiber has relaxed, the new twitch builds on the old one. Guyton calls this **frequency summation** (many courses say wave summation). Fire fast enough and the twitches fuse into **tetanus**, a smooth, sustained contraction at the fiber's maximal force, because calcium never has time to fall between action potentials. A rested muscle also shows **treppe**, a staircase in which the first several twitches grow stronger even though each relaxes completely.\r\n\r\n## Recruitment: how many units fire\r\n\r\nThe second control is **motor unit recruitment**: activating more motor units, each a motor neuron and the fibers it supplies. Recruitment follows the **size principle**, described by Elwood Henneman in 1957. Small motor neurons, which supply a few slow, fatigue-resistant fibers, reach threshold first; larger units with many powerful fibers join only as demand climbs. Gentle tasks are therefore graded in fine steps, and large units stay in reserve.\r\n\r\nHow fine those steps are depends on the **innervation ratio**, the number of fibers per motor neuron. Muscles that move the eye have only a few fibers per unit; large limb muscles have hundreds or more. Even at rest, a low level of unit activity keeps a muscle slightly taut, its **muscle tone**.\r\n\r\nThe two controls work together through **asynchronous firing**. Different units fire out of step, so their twitches overlap and total force is smooth even when no single unit is firing fast enough for tetanus. Units can also take turns, which delays fatigue.\r\n\r\n## Length: the length–tension relationship\r\n\r\nA fiber's force also depends on how stretched it is when it contracts, because force depends on **filament overlap**, how many myosin heads can reach actin. At **optimal length**, about 2.0 to 2.2 micrometers per sarcomere, overlap is complete and force is greatest. Stretched further, the filaments pull apart and force falls; shortened further, they collide and force falls again. A relaxed muscle that is stretched still pushes back with **passive tension**, mostly from the giant elastic protein titin.\r\n\r\nThe load that stretches a muscle before it contracts is its **preload**, and it sets where on this curve the fibers start. In the heart, preload is the blood filling the ventricle, and the same length–tension relationship becomes the Frank–Starling mechanism.\r\n\r\n## Speed: the force–velocity relationship\r\n\r\nThe load a muscle must move once it contracts is its **afterload**. The heavier the afterload, the slower the shortening. With no load at all the muscle shortens at its **maximal shortening velocity**, set by how fast its myosin splits ATP. **Power output**, force times velocity, is zero at both extremes and peaks at intermediate loads, roughly a third of maximal force.\r\n\r\nA. V. Hill described this **force–velocity relationship** in 1938, and it runs continuously through three kinds of contraction. In a **concentric contraction** the muscle shortens while moving its load, as in lifting a weight. When the load matches the muscle's force, it develops force without shortening: an **isometric contraction**. When the load is heavier still, the active muscle is pulled longer while it resists, an **eccentric contraction**, as in lowering a weight or walking downhill. Eccentric contractions produce more force than the isometric maximum at a lower energy cost, and unaccustomed eccentric work is what causes delayed-onset muscle soreness."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
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
      "puzzleId": "grading-muscle-force",
      "puzzleRevision": "fnv1a32:9d03fa08",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:muscle twitch": {
          "x": 411.64,
          "y": 300.82,
          "pinned": false
        },
        "term:tetanus": {
          "x": 333.7,
          "y": 221.81,
          "pinned": false
        },
        "term:frequency summation": {
          "x": 445.67,
          "y": 155.97,
          "pinned": false
        },
        "term:treppe": {
          "x": 512.81,
          "y": 263.47,
          "pinned": false
        },
        "term:motor unit recruitment": {
          "x": 258.18,
          "y": 339.46,
          "pinned": false
        },
        "term:size principle": {
          "x": 109.65,
          "y": 276.29,
          "pinned": false
        },
        "term:innervation ratio": {
          "x": 211.21,
          "y": 503.72,
          "pinned": false
        },
        "term:muscle tone": {
          "x": 119.96,
          "y": 402.61,
          "pinned": false
        },
        "term:optimal length": {
          "x": 646.27,
          "y": 530.39,
          "pinned": false
        },
        "term:filament overlap": {
          "x": 781.47,
          "y": 485.4,
          "pinned": false
        },
        "term:passive tension": {
          "x": 746.81,
          "y": 626.86,
          "pinned": false
        },
        "term:afterload": {
          "x": 487.39,
          "y": 627,
          "pinned": false
        },
        "term:maximal shortening velocity": {
          "x": 455.24,
          "y": 469.26,
          "pinned": false
        },
        "term:power output": {
          "x": 373.53,
          "y": 619.3,
          "pinned": false
        },
        "term:isometric contraction": {
          "x": 837.91,
          "y": 330.84,
          "pinned": false
        },
        "term:concentric contraction": {
          "x": 738.52,
          "y": 176.62,
          "pinned": false
        },
        "term:eccentric contraction": {
          "x": 921.85,
          "y": 171.3,
          "pinned": false
        },
        "term:asynchronous firing": {
          "x": 215.71,
          "y": 167.48,
          "pinned": false
        },
        "term:preload": {
          "x": 585.79,
          "y": 627,
          "pinned": false
        },
        "term:force–velocity relationship": {
          "x": 639.99,
          "y": 353.36,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3468.56,
        "score": 3468.5567572873747
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-18T01:44:31.634Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "grading-muscle-force",
      "puzzleRevision": "fnv1a32:9d03fa08",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 869.71,
          "y": 275.62,
          "pinned": false
        },
        "cluster:1": {
          "x": 730.41,
          "y": 483.22,
          "pinned": false
        },
        "cluster:2": {
          "x": 140.29,
          "y": 275.62,
          "pinned": false
        },
        "cluster:3": {
          "x": 279.59,
          "y": 483.22,
          "pinned": false
        },
        "cluster:4": {
          "x": 505,
          "y": 147.32,
          "pinned": false
        }
      },
      "bridges": {
        "term:asynchronous firing": {
          "x": 925.71,
          "y": 431.47,
          "pinned": false
        },
        "term:preload": {
          "x": 113.86,
          "y": 419.22,
          "pinned": false
        },
        "term:force–velocity relationship": {
          "x": 344.26,
          "y": 335.17,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "muscle twitch",
          "tetanus",
          "frequency summation",
          "treppe"
        ],
        "cluster:1": [
          "motor unit recruitment",
          "size principle",
          "innervation ratio",
          "muscle tone"
        ],
        "cluster:2": [
          "optimal length",
          "filament overlap",
          "passive tension"
        ],
        "cluster:3": [
          "afterload",
          "maximal shortening velocity",
          "power output"
        ],
        "cluster:4": [
          "isometric contraction",
          "concentric contraction",
          "eccentric contraction"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "treppe",
          "frequency summation",
          "muscle twitch",
          "tetanus"
        ],
        "cluster:1": [
          "size principle",
          "motor unit recruitment",
          "innervation ratio",
          "muscle tone"
        ],
        "cluster:2": [
          "optimal length",
          "filament overlap",
          "passive tension"
        ],
        "cluster:3": [
          "afterload",
          "maximal shortening velocity",
          "power output"
        ],
        "cluster:4": [
          "eccentric contraction",
          "concentric contraction",
          "isometric contraction"
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
        "totalLength": 710.725123840062
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-18T01:44:32.596Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "grading-muscle-force",
      "puzzleRevision": "fnv1a32:9d03fa08",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:muscle twitch": {
          "x": 398.05,
          "y": 628
        },
        "term:tetanus": {
          "x": 428.46,
          "y": 515.09
        },
        "term:frequency summation": {
          "x": 161.23,
          "y": 628
        },
        "term:treppe": {
          "x": 159.41,
          "y": 497.62
        },
        "term:motor unit recruitment": {
          "x": 514.19,
          "y": 400.85
        },
        "term:size principle": {
          "x": 855.18,
          "y": 482.76
        },
        "term:innervation ratio": {
          "x": 821.81,
          "y": 628
        },
        "term:muscle tone": {
          "x": 681.84,
          "y": 628
        },
        "term:optimal length": {
          "x": 794.67,
          "y": 60.59
        },
        "term:filament overlap": {
          "x": 857.71,
          "y": 192.78
        },
        "term:passive tension": {
          "x": 877.08,
          "y": 341.2
        },
        "term:afterload": {
          "x": 642.99,
          "y": 216.88
        },
        "term:maximal shortening velocity": {
          "x": 479.53,
          "y": 192.65
        },
        "term:power output": {
          "x": 512.22,
          "y": 22
        },
        "term:isometric contraction": {
          "x": 337.74,
          "y": 338.03
        },
        "term:concentric contraction": {
          "x": 120.56,
          "y": 308.85
        },
        "term:eccentric contraction": {
          "x": 92.49,
          "y": 121.83
        },
        "term:asynchronous firing": {
          "x": 543.61,
          "y": 581.44
        },
        "term:preload": {
          "x": 724.69,
          "y": 155.71
        },
        "term:force–velocity relationship": {
          "x": 337.43,
          "y": 22
        },
        "cluster:0": {
          "x": 292.36,
          "y": 513.27
        },
        "cluster:1": {
          "x": 690.03,
          "y": 474.03
        },
        "cluster:2": {
          "x": 743.26,
          "y": 289.87
        },
        "cluster:3": {
          "x": 627.59,
          "y": 88.4
        },
        "cluster:4": {
          "x": 249.61,
          "y": 191.03
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-18T01:44:33.571Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "auto",
    "savedAt": "2026-10-18T01:44:30.560Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
