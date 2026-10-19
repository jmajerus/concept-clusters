// Generated from content/puzzles/how-learning-sticks.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "how-learning-sticks",
  "title": "How Learning Sticks — Memory, Load, and Practice",
  "category": "education-learning-sciences",
  "subcategories": {
    "education-learning-sciences": "learning-sciences"
  },
  "info": {
    "text": "Cognitive science has measured how learning actually works, and the findings routinely contradict what studying feels like. This puzzle teaches the memory architecture (working memory, long-term memory, schema), Sweller's cognitive-load budget, the retrieval-versus-restudy finding and its satellite effects, the scheduling results (spacing, cramming, interleaving, the forgetting curve), Bjork's desirable difficulties and the two memory strengths that explain them, and near and far transfer — the outcome all of it serves.",
    "citations": [
      {
        "title": "Memory: A Contribution to Experimental Psychology (Über das Gedächtnis)",
        "author": "Hermann Ebbinghaus",
        "publisher": "Dover (English ed. 1913)",
        "year": "1885"
      },
      {
        "title": "The Magical Number Seven, Plus or Minus Two",
        "author": "George A. Miller",
        "publisher": "Psychological Review 63(2)",
        "year": "1956"
      },
      {
        "title": "Cognitive load during problem solving",
        "author": "John Sweller",
        "publisher": "Cognitive Science 12",
        "year": "1988"
      },
      {
        "title": "Test-enhanced learning: Taking memory tests improves long-term retention",
        "author": "Henry L. Roediger and Jeffrey D. Karpicke",
        "publisher": "Psychological Science 17(3)",
        "year": "2006"
      },
      {
        "title": "Distributed practice in verbal recall tasks: A review and quantitative synthesis",
        "author": "Nicholas J. Cepeda et al.",
        "publisher": "Psychological Bulletin 132(3)",
        "year": "2006"
      },
      {
        "title": "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning",
        "author": "Robert A. Bjork and Elizabeth L. Bjork",
        "publisher": "Psychology and the Real World",
        "year": "2011"
      },
      {
        "title": "Improving students' learning with effective learning techniques",
        "author": "John Dunlosky et al.",
        "publisher": "Psychological Science in the Public Interest 14(1)",
        "year": "2013"
      },
      {
        "title": "Testing effect",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Testing_effect"
      },
      {
        "title": "Cognitive load",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Cognitive_load"
      },
      {
        "title": "Spacing effect",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Spacing_effect"
      },
      {
        "title": "Transfer of learning",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Transfer_of_learning"
      }
    ]
  },
  "clusters": [
    {
      "id": "memory-architecture",
      "name": "The Memory Architecture",
      "color": "teal",
      "fact": "Working memory — 'extremely limited in both capacity and duration' — is the gateway through which learning must pass into the vast long-term store; schema, organized knowledge built in long-term memory, is what grows the gateway's effective capacity over time.",
      "terms": [
        "long-term memory",
        "working memory",
        "schema"
      ],
      "seeds": [
        "long-term memory",
        "working memory"
      ],
      "termInfo": {
        "long-term memory": {
          "text": "The vast permanent store working memory feeds; in the classic gateway model, declarative knowledge enters it after being attended to and processed in working memory.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        },
        "schema": {
          "text": "An organized knowledge structure in long-term memory. Simon and Chase's 'chunk' names the same organizing act — and schemas are why experts feel less load than novices and carry their skill to new problems.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        },
        "working memory": {
          "text": "The limited workspace where conscious processing happens — 'extremely limited in both capacity and duration.' Miller (1956) put its span near 'seven units, plus or minus two.'",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        }
      },
      "info": {
        "text": "Miller (1956) put working memory near 'seven units, plus or minus two'; Simon and Chase (1973) coined 'chunk' for the organizing act — 'this chunking is also described as schema construction.' Experts feel less load than novices because their schemas do more of the work.",
        "links": [
          {
            "href": "wiki:Cognitive load"
          }
        ]
      }
    },
    {
      "id": "cognitive-load",
      "name": "The Load Budget",
      "color": "blue",
      "fact": "Sweller's cognitive load theory (late 1980s) treats the effort used in working memory as a budget with three named parts: the topic's inherent difficulty, the waste caused by how material is presented, and the effort put into building permanent knowledge.",
      "terms": [
        "cognitive load",
        "intrinsic load",
        "extraneous load",
        "germane load"
      ],
      "seeds": [
        "cognitive load",
        "intrinsic load"
      ],
      "termInfo": {
        "cognitive load": {
          "text": "The effort being used in the working memory. Sweller developed the theory in the late 1980s out of problem-solving research, to guide how material is presented so the budget goes to learning.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        },
        "extraneous load": {
          "text": "Load 'generated by the manner in which information is presented to learners and is under the control of instructional designers' — the named target of presentation effects like split-attention.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        },
        "germane load": {
          "text": "'The work put into creating a permanent store of knowledge' — effort spent building schemas rather than fighting the presentation or the topic's difficulty.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        },
        "intrinsic load": {
          "text": "'The inherent level of difficulty associated with a specific instructional topic' — irreducible, but manageable by teaching subschemas in isolation and combining them later.",
          "links": [
            {
              "href": "wiki:Cognitive load"
            }
          ]
        }
      },
      "info": {
        "text": "Intrinsic load is 'the inherent level of difficulty associated with a specific instructional topic'; extraneous load is 'generated by the manner in which information is presented to learners and is under the control of instructional designers'; germane load is 'the work put into creating a permanent store of knowledge.' The triad's additivity has been questioned — they may circularly influence each other.",
        "links": [
          {
            "href": "wiki:Cognitive load"
          }
        ]
      }
    },
    {
      "id": "retrieval",
      "name": "Retrieval Beats Restudy",
      "color": "amber",
      "fact": "Long-term memory is increased when part of the learning period is devoted to retrieving information from memory: restudied material shows higher recall immediately, but retrieved material wins as time passes — and even failed retrieval attempts help.",
      "terms": [
        "retrieval practice",
        "rereading",
        "forward testing effect",
        "generation effect"
      ],
      "seeds": [
        "retrieval practice",
        "rereading"
      ],
      "termInfo": {
        "forward testing effect": {
          "text": "Testing on old material boosts learning of the NEW material that follows — retrieval warms up the machinery rather than merely spending it.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "generation effect": {
          "text": "Self-generating an answer beats reading one — and even failed retrieval attempts help, provided feedback follows.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "rereading": {
          "text": "The restudy strategy retrieval practice beats: restudied material shows higher recall immediately — which is exactly why rereading feels effective — and the advantage reverses as time passes.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "retrieval practice": {
          "text": "Devoting learning time to pulling information out of memory instead of putting it in again — the finding behind the testing effect (also called active recall, practice testing, or test-enhanced learning). Low-stakes quizzing tracks better grades and pass rates (Sotola & Crede 2021).",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        }
      },
      "info": {
        "text": "First documented empirically by Edwina Abbott in 1909; C. A. Mace (1932) summarized it: 'Active repetition is very much more effective than passive repetition.' The finding is also called the testing effect, active recall, practice testing, or test-enhanced learning. Testing old material even helps learning of new material (the forward testing effect).",
        "links": [
          {
            "href": "wiki:Testing effect"
          }
        ]
      }
    },
    {
      "id": "time-and-forgetting",
      "name": "Time and Forgetting",
      "color": "magenta",
      "fact": "The schedule of study matters as much as its content: learning is more effective when study sessions are spaced out than massed into cramming, the forgetting curve erodes unreviewed material, and mixing problem types teaches more than blocking them by kind.",
      "terms": [
        "cramming",
        "spacing effect",
        "forgetting curve",
        "interleaving"
      ],
      "seeds": [
        "cramming",
        "spacing effect"
      ],
      "termInfo": {
        "cramming": {
          "text": "Massed presentation — the default before exams and the loser: spaced practice outperformed massed 'in 259 out of 271 cases' (Cepeda et al. 2006).",
          "links": [
            {
              "href": "wiki:Spacing effect"
            }
          ]
        },
        "forgetting curve": {
          "text": "Ebbinghaus's picture of memory's decay — the reason unreviewed material disappears and spaced retrieval works at all.",
          "links": [
            {
              "href": "wiki:Forgetting curve"
            }
          ]
        },
        "interleaving": {
          "text": "Mixing problem types instead of blocking them by kind. Rohrer's mixed-practice students were 'vastly superior' to grouped peers — and crucially learned WHEN to apply each formula.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "spacing effect": {
          "text": "'Learning is more effective when study sessions are spaced out' — Ebbinghaus's 1885 finding, the phenomenon behind the distributed-practice schedule. Bahrick found 13 sessions 56 days apart matched 26 sessions 14 days apart.",
          "links": [
            {
              "href": "wiki:Spacing effect"
            }
          ]
        }
      },
      "info": {
        "text": "Ebbinghaus identified the effect in 1885: 'active recall with increasing time intervals reduces the probability of forgetting.' Cepeda et al. found spaced practice won 'in 259 out of 271 cases'; Bahrick found 13 sessions 56 days apart matched 26 sessions 14 days apart. Rohrer's mixed-practice math students were 'vastly superior' — and learned when to apply each formula.",
        "links": [
          {
            "href": "wiki:Spacing effect"
          }
        ]
      }
    },
    {
      "id": "desirable-difficulty",
      "name": "Difficulty That Helps",
      "color": "olive",
      "fact": "Bjork's inversion of the felt-quality rule: conditions that make practice harder can make memory stronger, because storage strength and retrieval strength are different currencies — fluent restudy feels like learning while building little retrieval strength.",
      "terms": [
        "desirable difficulty",
        "retrieval strength",
        "storage strength"
      ],
      "seeds": [
        "desirable difficulty",
        "retrieval strength"
      ],
      "termInfo": {
        "desirable difficulty": {
          "text": "Bjork's name for conditions that make practice harder in ways that strengthen memory — retrieval, spacing, interleaving — against the felt-quality rule that easy means learned.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "retrieval strength": {
          "text": "How readily a memory comes to mind right now — the currency restudy inflates fast, which is why fluency feels like learning. Bjork and Bjork's new theory of disuse distinguishes it from storage strength.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        },
        "storage strength": {
          "text": "How well a memory is woven in, regardless of current access — the deep currency that keeps old skills from fading. The two strengths can move in opposite directions.",
          "links": [
            {
              "href": "wiki:Testing effect"
            }
          ]
        }
      },
      "info": {
        "text": "The retrieval effort hypothesis: 'difficult but successful retrievals are better for memory than easier successful retrievals.' Bjork and Bjork's new theory of disuse supplies the storage-strength/retrieval-strength distinction that explains why the easy, fluent option is often the weak one.",
        "links": [
          {
            "href": "wiki:Testing effect"
          }
        ]
      }
    },
    {
      "id": "transfer",
      "name": "Transfer Beyond the Original Context",
      "color": "brown",
      "fact": "Transfer of learning is applying what was learned to new situations — near transfer to similar contexts is common; far transfer to dissimilar ones is rare and precious — and it is the outcome every other finding on this board secretly serves.",
      "terms": [
        "near transfer",
        "transfer",
        "far transfer"
      ],
      "seeds": [
        "near transfer",
        "transfer"
      ],
      "termInfo": {
        "far transfer": {
          "text": "Transfer to a dissimilar context — rare, precious, and the honest test of whether principles, not just procedures, were learned.",
          "links": [
            {
              "href": "wiki:Transfer of learning"
            }
          ]
        },
        "near transfer": {
          "text": "Transfer to a similar context — a learned procedure applied to a look-alike problem; the common, well-documented kind.",
          "links": [
            {
              "href": "wiki:Transfer of learning"
            }
          ]
        },
        "transfer": {
          "text": "Applying what was learned to new situations — the outcome every other finding on this subject quietly serves, studied since Thorndike and Woodworth's 1901 'identical elements' work.",
          "links": [
            {
              "href": "wiki:Transfer of learning"
            }
          ]
        }
      },
      "info": {
        "text": "The study of transfer goes back to Thorndike and Woodworth's 1901 'identical elements' tradition: what carries between contexts is what they share — which is why organized, principled knowledge travels better than isolated drills.",
        "links": [
          {
            "href": "wiki:Transfer of learning"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "the-working-memory-bottleneck",
      "term": "the working-memory bottleneck",
      "clusters": [
        0,
        1
      ],
      "fact": "Cognitive load is defined as the effort used in working memory, so the architecture's narrow gateway is what makes load worth budgeting — and schema construction is the escape route: organized knowledge ameliorates load.",
      "info": {
        "links": [
          {
            "href": "wiki:Cognitive load"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "working memory",
        "cognitive load"
      ]
    },
    {
      "id": "retrieval-changes-storage",
      "term": "retrieval changes storage",
      "clusters": [
        0,
        2
      ],
      "fact": "Retrieval is not read-only: testing builds multiple retrieval routes for memory and lasting inter-item connections, so the act of pulling knowledge through the architecture modifies what the architecture stores.",
      "info": {
        "links": [
          {
            "href": "wiki:Testing effect"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "long-term memory",
        "retrieval practice"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "effort-that-pays",
      "term": "effort that pays",
      "clusters": [
        2,
        4
      ],
      "fact": "The retrieval effort hypothesis — difficult but successful retrievals are better for memory than easier successful retrievals — makes retrieval the paradigm desirable difficulty, with storage and retrieval strength explaining why easy fluency can fool the learner.",
      "info": {
        "links": [
          {
            "href": "wiki:Testing effect"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "retrieval practice",
        "desirable difficulty"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 2
      }
    },
    {
      "id": "spacing-amplifies-retrieval",
      "term": "spacing amplifies retrieval",
      "clusters": [
        2,
        3
      ],
      "fact": "Spaced repetition amplifies the testing effect, with greater gains when testing is delayed — and without spaced retrievals, the forgetting curve quietly reclaims the material.",
      "info": {
        "links": [
          {
            "href": "wiki:Testing effect"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "retrieval practice",
        "spacing effect"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "interleaving-is-desirable-difficulty",
      "term": "interleaving is a desirable difficulty",
      "clusters": [
        3,
        4
      ],
      "fact": "Mixed practice feels worse and performs vastly better than blocked practice — and it teaches when to apply each method, the signature of a difficulty that is desirable.",
      "info": {
        "links": [
          {
            "href": "wiki:Spacing effect"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "interleaving",
        "desirable difficulty"
      ]
    },
    {
      "id": "schemas-carry-transfer",
      "term": "schemas carry transfer",
      "clusters": [
        0,
        5
      ],
      "fact": "Transfer rides on organized knowledge: schemas and their subschemas let experts see new problems as versions of known ones, which is why schema construction, not bare repetition, is the route to portable skill.",
      "info": {
        "links": [
          {
            "href": "wiki:Transfer of learning"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "schema",
        "transfer"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 5
      }
    }
  ],
  "lenses": [
    {
      "id": "the-designers-share",
      "prompt": "Sweller's theory names three parts of the working-memory budget. Which one is entirely under the instructional designer's control — the waste the presentation itself adds?",
      "explanation": "Extraneous load is the part generated by how material is presented — fully under the instructional designer's control. Intrinsic load belongs to the topic itself, and germane load is the learner's own schema-building effort.",
      "label": "The designer's share",
      "targets": [
        "extraneous load"
      ],
      "reasons": {
        "extraneous load": "generated by the manner of presentation — designer-controlled"
      }
    },
    {
      "id": "tonight-versus-june",
      "prompt": "Which two terms name the strategies whose ranking REVERSES as time passes — one winning the quiz tonight, the other the exam in June?",
      "explanation": "Rereading wins the quiz tonight — restudied words show higher recall immediately — but retrieval practice wins the exam in June, as the advantage reverses with delay. That time course is exactly why the weaker-feeling method is the stronger one.",
      "label": "Tonight versus June",
      "targets": [
        "rereading",
        "retrieval practice"
      ],
      "reasons": {
        "rereading": "the restudy strategy — immediate advantage that fades",
        "retrieval practice": "the retrieving strategy — slower now, durable later"
      }
    },
    {
      "id": "the-two-currencies",
      "prompt": "A student reviews notes until everything feels familiar, then stops. Which two terms name the currency that now feels full and the one actually left short?",
      "explanation": "Restudy inflates retrieval strength — the memory comes to mind readily right now, which is the feeling of knowing. What it fails to build is storage strength — how well the knowledge is woven in for the long term. The two currencies can move in opposite directions.",
      "label": "The two currencies",
      "targets": [
        "retrieval strength",
        "storage strength"
      ],
      "reasons": {
        "retrieval strength": "current accessibility — inflated fast by restudy, hence the feeling of knowing",
        "storage strength": "how well the memory is woven in — what restudy leaves short"
      }
    },
    {
      "id": "ebbinghaus-double",
      "prompt": "Which two terms name findings the field owes to a single 1885 experimenter — one a picture of decay, the other a discovery about schedules?",
      "explanation": "Both come from the same experimenter: Ebbinghaus identified the spacing effect in 1885 — active recall with increasing time intervals reduces forgetting — and mapped the forgetting curve, the decay that makes spacing necessary. Interleaving is Rohrer's; cramming is the rival schedule, not a finding.",
      "label": "One experimenter, two findings",
      "targets": [
        "spacing effect",
        "forgetting curve"
      ],
      "reasons": {
        "forgetting curve": "Ebbinghaus's decay picture",
        "spacing effect": "Ebbinghaus's schedule discovery — spaced beats massed"
      }
    },
    {
      "id": "what-travels",
      "prompt": "Every finding on this subject serves one outcome — learning that shows up somewhere other than where it was taught. Which term names that outcome, and which names the knowledge structure that makes it possible?",
      "explanation": "Transfer is the outcome — learning that shows up somewhere other than where it happened — and schema is what makes it possible: organized knowledge lets experts see new problems as versions of known ones. Bare facts in long-term memory do not travel; organized ones do.",
      "label": "What travels",
      "targets": [
        "transfer",
        "schema"
      ],
      "reasons": {
        "schema": "organized knowledge — what lets learning travel to new problems",
        "transfer": "the outcome — applying learning beyond the original context"
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "backward-design",
        "reason": "The design framework that turns this science into courses: backward design plans for transfer — the finish line this board's findings quietly serve — and sequences retrieval-friendly practice in Stage 3."
      },
      {
        "id": "assessment-for-learning",
        "reason": "The classroom expression of the science: hinge questions and exit tickets are retrieval practice with a shape, and the formative loop is what makes feedback actable."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How Learning Sticks",
    "summary": "The memory architecture, the load budget, retrieval versus restudy, desirable difficulties, and transfer — what cognitive science says makes learning last.",
    "estimatedMinutes": 5,
    "content": {
      "mediaType": "text/markdown",
      "text": "Cognitive science has spent more than a century measuring how learning actually works, and its findings routinely contradict what studying feels like. This lesson walks those findings: the memory architecture that constrains everything, the load budget that decides whether material teaches or overwhelms, the practice methods that build durable memory, the schedules and difficulties that feel worse and work better, and the outcome that makes it all matter — transfer.\r\n\r\n## The architecture and its budget\r\n\r\nEverything converges on working memory: the workspace where conscious processing happens, 'extremely limited in both capacity and duration.' Whatever is attended to there can pass into long-term memory, the vast permanent store. Working memory's effective capacity grows when knowledge is organized into schemas — structured bundles that let experts take in whole patterns where novices must hold pieces. John Sweller built cognitive load theory on that bottleneck: the effort used in working memory splits into intrinsic load (the topic's inherent difficulty), extraneous load (waste created by how material is presented — entirely under the designer's control), and germane load (the work put into creating a permanent store of knowledge). Good presentation is mostly extraneous-load management.\r\n\r\n## What builds memory\r\n\r\nThe most robust prescription in the field is retrieval practice: devoting part of learning time to pulling knowledge out of memory rather than putting it in again. The finding is over a century old — first documented in 1909 — and consistently strange: restudied material shows higher recall immediately, but retrieved material wins as time passes. Even failed retrieval attempts help (the generation effect), and testing old material boosts learning of the new (the forward testing effect).\r\n\r\nScheduling multiplies it. The spacing effect — Ebbinghaus, 1885 — says spaced sessions beat massed cramming: spaced practice won in 259 of 271 comparisons in Cepeda's review, and Bahrick found 13 sessions 56 days apart matched 26 sessions 14 days apart. Meanwhile the forgetting curve erodes whatever nothing retrieves. Mixing problem types — interleaving — outperforms blocking by kind, and, importantly, teaches when to apply each method.\r\n\r\n## Why harder can be better\r\n\r\nRobert Bjork's name for the pattern is desirable difficulties, and the theory explaining them distinguishes two currencies: retrieval strength — how readily a memory comes to mind right now — and storage strength — how well it is woven in. Rereading inflates retrieval strength fast, which is exactly why it feels effective. The methods that feel worse build the currency that lasts.\r\n\r\n## Where it lands\r\n\r\nThe point of all of it is transfer: applying learning to situations beyond the one where it happened. Near transfer, to similar contexts, is common; far transfer is rare and precious. What carries between contexts is organized knowledge — schemas — which is why schema construction, not bare exposure, is the destination of every good practice decision in this lesson."
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
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "how-learning-sticks",
      "puzzleRevision": "fnv1a32:c815e6cc",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:long-term memory": {
          "x": 517.11,
          "y": 128.66,
          "pinned": false
        },
        "term:working memory": {
          "x": 644.64,
          "y": 65.09,
          "pinned": false
        },
        "term:schema": {
          "x": 437.46,
          "y": 43,
          "pinned": false
        },
        "term:cognitive load": {
          "x": 907.7,
          "y": 282.74,
          "pinned": false
        },
        "term:intrinsic load": {
          "x": 951.98,
          "y": 411.53,
          "pinned": false
        },
        "term:extraneous load": {
          "x": 997.57,
          "y": 176.26,
          "pinned": false
        },
        "term:germane load": {
          "x": 1034.44,
          "y": 311.17,
          "pinned": false
        },
        "term:retrieval practice": {
          "x": 281.41,
          "y": 403.33,
          "pinned": false
        },
        "term:rereading": {
          "x": 227.8,
          "y": 281.57,
          "pinned": false
        },
        "term:forward testing effect": {
          "x": 163.93,
          "y": 531.68,
          "pinned": false
        },
        "term:generation effect": {
          "x": 127.97,
          "y": 364.67,
          "pinned": false
        },
        "term:cramming": {
          "x": 598.39,
          "y": 605.08,
          "pinned": false
        },
        "term:spacing effect": {
          "x": 527,
          "y": 512.2,
          "pinned": false
        },
        "term:forgetting curve": {
          "x": 508.46,
          "y": 689.97,
          "pinned": false
        },
        "term:interleaving": {
          "x": 659.04,
          "y": 697,
          "pinned": false
        },
        "term:desirable difficulty": {
          "x": 600.06,
          "y": 312.81,
          "pinned": true
        },
        "term:retrieval strength": {
          "x": 646.14,
          "y": 214.68,
          "pinned": false
        },
        "term:storage strength": {
          "x": 767.98,
          "y": 310.63,
          "pinned": false
        },
        "term:near transfer": {
          "x": 150.43,
          "y": 100.49,
          "pinned": false
        },
        "term:transfer": {
          "x": 234.14,
          "y": 179.65,
          "pinned": false
        },
        "term:far transfer": {
          "x": 128.48,
          "y": 225.32,
          "pinned": false
        },
        "term:the working-memory bottleneck": {
          "x": 818.99,
          "y": 122.17,
          "pinned": false
        },
        "term:retrieval changes storage": {
          "x": 375.94,
          "y": 235.66,
          "pinned": false
        },
        "term:effort that pays": {
          "x": 436.5,
          "y": 402.14,
          "pinned": false
        },
        "term:spacing amplifies retrieval": {
          "x": 361.5,
          "y": 575.36,
          "pinned": false
        },
        "term:interleaving is a desirable difficulty": {
          "x": 775.48,
          "y": 528.6,
          "pinned": true
        },
        "term:schemas carry transfer": {
          "x": 301.76,
          "y": 54.2,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4958.28,
        "score": 4958.277343555459
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-18T09:59:16.233Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "how-learning-sticks",
      "puzzleRevision": "fnv1a32:c815e6cc",
      "board": {
        "width": 1150,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 363.81,
          "y": 559.07,
          "pinned": true
        },
        "cluster:1": {
          "x": 150.63,
          "y": 378,
          "pinned": false
        },
        "cluster:2": {
          "x": 360.82,
          "y": 180.99,
          "pinned": true
        },
        "cluster:3": {
          "x": 856.94,
          "y": 146.12,
          "pinned": true
        },
        "cluster:4": {
          "x": 997.65,
          "y": 425.95,
          "pinned": true
        },
        "cluster:5": {
          "x": 787.19,
          "y": 550.1,
          "pinned": false
        }
      },
      "bridges": {
        "term:the working-memory bottleneck": {
          "x": 135.26,
          "y": 629.22,
          "pinned": true
        },
        "term:retrieval changes storage": {
          "x": 426.78,
          "y": 359.09,
          "pinned": true
        },
        "term:effort that pays": {
          "x": 617.56,
          "y": 427.56,
          "pinned": true
        },
        "term:spacing amplifies retrieval": {
          "x": 601.9,
          "y": 76.74,
          "pinned": true
        },
        "term:interleaving is a desirable difficulty": {
          "x": 735.08,
          "y": 323.36,
          "pinned": true
        },
        "term:schemas carry transfer": {
          "x": 578.99,
          "y": 605.9,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "long-term memory",
          "working memory",
          "schema"
        ],
        "cluster:1": [
          "cognitive load",
          "intrinsic load",
          "extraneous load",
          "germane load"
        ],
        "cluster:2": [
          "retrieval practice",
          "rereading",
          "forward testing effect",
          "generation effect"
        ],
        "cluster:3": [
          "cramming",
          "spacing effect",
          "forgetting curve",
          "interleaving"
        ],
        "cluster:4": [
          "desirable difficulty",
          "retrieval strength",
          "storage strength"
        ],
        "cluster:5": [
          "near transfer",
          "transfer",
          "far transfer"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "working memory",
          "long-term memory",
          "schema"
        ],
        "cluster:1": [
          "germane load",
          "extraneous load",
          "intrinsic load",
          "cognitive load"
        ],
        "cluster:2": [
          "generation effect",
          "forward testing effect",
          "retrieval practice",
          "rereading"
        ],
        "cluster:3": [
          "cramming",
          "forgetting curve",
          "spacing effect",
          "interleaving"
        ],
        "cluster:4": [
          "storage strength",
          "desirable difficulty",
          "retrieval strength"
        ],
        "cluster:5": [
          "transfer",
          "near transfer",
          "far transfer"
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
        "totalLength": 2508.8203447518117
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-18T09:57:29.249Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "how-learning-sticks",
      "puzzleRevision": "fnv1a32:c815e6cc",
      "board": {
        "width": 1150,
        "height": 740
      },
      "nodes": {
        "term:long-term memory": {
          "x": 435.5,
          "y": 186.76
        },
        "term:working memory": {
          "x": 654.25,
          "y": 158.83
        },
        "term:schema": {
          "x": 552.53,
          "y": 133.56
        },
        "term:cognitive load": {
          "x": 1001.99,
          "y": 122.45
        },
        "term:intrinsic load": {
          "x": 1060.9,
          "y": 202.32
        },
        "term:extraneous load": {
          "x": 801.59,
          "y": 128.25
        },
        "term:germane load": {
          "x": 962.97,
          "y": 253.54
        },
        "term:retrieval practice": {
          "x": 393.53,
          "y": 392.15
        },
        "term:rereading": {
          "x": 708.57,
          "y": 430.66
        },
        "term:forward testing effect": {
          "x": 818.42,
          "y": 361.33
        },
        "term:generation effect": {
          "x": 728.6,
          "y": 315.22
        },
        "term:cramming": {
          "x": 920.22,
          "y": 590.64
        },
        "term:spacing effect": {
          "x": 1040.42,
          "y": 563.53
        },
        "term:forgetting curve": {
          "x": 753.64,
          "y": 620.31
        },
        "term:interleaving": {
          "x": 1067.18,
          "y": 698
        },
        "term:desirable difficulty": {
          "x": 409.95,
          "y": 615.93
        },
        "term:retrieval strength": {
          "x": 240.59,
          "y": 698
        },
        "term:storage strength": {
          "x": 106.18,
          "y": 609.66
        },
        "term:near transfer": {
          "x": 85.95,
          "y": 80.89
        },
        "term:transfer": {
          "x": 244.94,
          "y": 116.41
        },
        "term:far transfer": {
          "x": 156.59,
          "y": 42
        },
        "term:the working-memory bottleneck": {
          "x": 700.96,
          "y": 63.5
        },
        "term:retrieval changes storage": {
          "x": 456.92,
          "y": 295.07
        },
        "term:effort that pays": {
          "x": 415.49,
          "y": 516.27
        },
        "term:spacing amplifies retrieval": {
          "x": 757.46,
          "y": 524.89
        },
        "term:interleaving is a desirable difficulty": {
          "x": 620.84,
          "y": 698
        },
        "term:schemas carry transfer": {
          "x": 484.19,
          "y": 42
        },
        "cluster:0": {
          "x": 612.85,
          "y": 229.23
        },
        "cluster:1": {
          "x": 850.13,
          "y": 178.68
        },
        "cluster:2": {
          "x": 601.51,
          "y": 367.98
        },
        "cluster:3": {
          "x": 917.99,
          "y": 660.6
        },
        "cluster:4": {
          "x": 234.17,
          "y": 535.31
        },
        "cluster:5": {
          "x": 158.4,
          "y": 222.35
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-18T09:58:27.735Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-18T09:56:56.225Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
