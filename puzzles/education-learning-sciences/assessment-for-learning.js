// Generated from content/puzzles/assessment-for-learning.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "assessment-for-learning",
  "title": "Checking Learning While It Happens — Formative Assessment",
  "category": "education-learning-sciences",
  "subcategories": {
    "education-learning-sciences": "assessment"
  },
  "info": {
    "text": "Formative assessment is the practice of checking learning while it happens — eliciting evidence from every student, reading it against shared criteria, and using it to decide the next steps before the lesson moves on. This puzzle teaches the purpose cut that names the practice (diagnostic, formative, summative), Dylan Wiliam's five key strategies for doing it, the feedback findings that separate helpful from harmful responses, and the student ownership that closes the loop.",
    "citations": [
      {
        "title": "Assessment and Classroom Learning",
        "author": "Paul Black and Dylan Wiliam",
        "publisher": "Assessment in Education: Principles, Policy & Practice 5(1)",
        "year": "1998"
      },
      {
        "title": "Five \"Key Strategies\" for Effective Formative Assessment",
        "author": "Dylan Wiliam and Marnie Thompson",
        "publisher": "NCTM Research Brief",
        "year": "2007"
      },
      {
        "title": "Embedded Formative Assessment",
        "author": "Dylan Wiliam",
        "publisher": "Solution Tree Press",
        "year": "2011"
      },
      {
        "title": "Enhancing and undermining intrinsic motivation: The effects of task-involving and ego-involving evaluation",
        "author": "Ruth Butler",
        "publisher": "British Journal of Educational Psychology 58",
        "year": "1988"
      },
      {
        "title": "The effects of feedback interventions on performance",
        "author": "Avraham Kluger and Angelo DeNisi",
        "publisher": "Psychological Bulletin 119(2)",
        "year": "1996"
      },
      {
        "title": "Wait-time and rewards as instructional variables",
        "author": "Mary Budd Rowe",
        "publisher": "Journal of Research in Science Teaching 11(2)",
        "year": "1974"
      },
      {
        "title": "Formative assessment",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Formative_assessment"
      }
    ]
  },
  "clusters": [
    {
      "id": "purpose-cut",
      "name": "The Purpose Cut",
      "color": "teal",
      "fact": "Assessment takes its name from the decision it serves: diagnostic assessment finds starting points before instruction, formative assessment adjusts learning while it is underway, and summative assessment judges outcomes at the end. The same instrument can serve any of the three — what makes an assessment formative is that its evidence changes what happens next.",
      "terms": [
        "formative assessment",
        "summative assessment",
        "diagnostic assessment"
      ],
      "seeds": [
        "formative assessment",
        "summative assessment"
      ],
      "termInfo": {
        "diagnostic assessment": {
          "text": "Assessment before instruction to find starting points — prior knowledge and misconceptions — so teaching can be planned from where learners actually are rather than from the syllabus.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "formative assessment": {
          "text": "Assessment whose evidence is elicited, interpreted, and used to decide next steps while learning is underway — Black and Wiliam's definition, and the function the reform movement renamed 'assessment for learning'.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "summative assessment": {
          "text": "Assessment at the end of a unit or course, judging outcomes for reporting, certification, and accountability — renamed 'assessment of learning' by the reform movement.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        }
      },
      "info": {
        "text": "Scriven coined the formative/summative pair in 1967 for curriculum evaluation; Bloom carried it to students a year later. 'Assessment for learning' and 'assessment of learning' are the reform-movement renames of the same two functions.",
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      }
    },
    {
      "id": "intentions-and-criteria",
      "name": "Shared Intentions & Criteria",
      "color": "blue",
      "fact": "The first of Wiliam's five key strategies: learners need to know where they are headed — the learning intention — and what quality looks like — success criteria, often carried by a rubric — with exemplars of other students' work making the standard visible rather than guessed at.",
      "terms": [
        "rubric",
        "success criteria",
        "learning intentions",
        "exemplars"
      ],
      "seeds": [
        "rubric",
        "success criteria"
      ],
      "termInfo": {
        "exemplars": {
          "text": "Samples of other students' work that make the standard visible; comparing strong and weak exemplars trains judgment better than any description can.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "learning intentions": {
          "text": "The lesson's target in learner-friendly language — what students should learn, not just what they will do. Wiliam's first strategy begins by clarifying and sharing them.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "rubric": {
          "text": "A criteria grid describing quality at levels of performance, so teacher and learners can judge work against the same standard.",
          "links": [
            {
              "href": "wiki:Rubric (academic)"
            }
          ]
        },
        "success criteria": {
          "text": "What counts as quality for this task — 'what a good one looks like' — shared before work begins so students can steer toward it.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        }
      },
      "info": {
        "text": "In White and Frederiksen's study, classes that reflected on what counted as quality work cut the achievement gap between higher- and lower-achieving students — the criteria themselves did the teaching.",
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      }
    },
    {
      "id": "eliciting-evidence",
      "name": "Eliciting Evidence From Everyone",
      "color": "amber",
      "fact": "The second strategy: engineering discussions and tasks that make every student's thinking visible — planned hinge questions that decide which way the lesson branches, exit tickets that capture the day's residue, wait time that lets thinking finish, and no hands up, so that volunteering stops deciding who gets to think.",
      "terms": [
        "exit ticket",
        "no hands up",
        "hinge question",
        "wait time"
      ],
      "seeds": [
        "exit ticket",
        "no hands up"
      ],
      "termInfo": {
        "exit ticket": {
          "text": "A short end-of-lesson task every student hands in — the day's residue in the teacher's hands before the next lesson is planned.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "hinge question": {
          "text": "A planned question at the point where the lesson must branch: all correct — move on; some — discuss; most wrong — reteach. Wiliam's name for the question the whole lesson leans on.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "no hands up": {
          "text": "Replacing volunteering with the teacher choosing the respondent, so that raising a hand stops deciding who thinks. Often paired with think-pair-share to make answering safe.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "wait time": {
          "text": "The pause after a question before taking answers. Rowe (1974) found extending it from about one second to three or more brought longer answers, more volunteers, and fewer failures to respond.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        }
      },
      "info": {
        "text": "Rowe (1974) found that extending teacher wait time from about one second to three or more produced longer answers, more voluntary contributions, and fewer failures to respond.",
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      }
    },
    {
      "id": "feedback-that-moves-learning",
      "name": "Feedback That Moves Learning Forward",
      "color": "magenta",
      "fact": "The third strategy: feedback which can and will be acted upon. The documented contrasts are stark — comment-only marking beats grades because students ignore comments whenever a grade is present, and ego-involving feedback that judges the person can do measurable harm (Kluger & DeNisi found many feedback interventions worsen performance).",
      "terms": [
        "comment-only marking",
        "feedback that moves learners forward",
        "ego-involving feedback"
      ],
      "seeds": [
        "comment-only marking",
        "feedback that moves learners forward"
      ],
      "termInfo": {
        "comment-only marking": {
          "text": "The marking policy Butler's finding implies: students shown comments alongside grades ignore the comments, so comments alone serve learning better than grades-plus-comments.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "ego-involving feedback": {
          "text": "Feedback that judges the person ('you're so clever') rather than the task. Kluger and DeNisi tied the harmful interventions to ego-involvement, which undermines intrinsic motivation.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "feedback that moves learners forward": {
          "text": "Wiliam's third strategy: feedback which can and will be acted upon — what to improve and how. Kluger and DeNisi found over a third of feedback interventions lowered performance, so actionability is not optional.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        }
      },
      "info": {
        "text": "The most effective feedback tells learners both what needs improving and how to go about improving it — praise and person-judgments rank among the least effective.",
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      }
    },
    {
      "id": "students-as-owners",
      "name": "Students as Owners",
      "color": "olive",
      "fact": "The fourth and fifth strategies: students as instructional resources for one another and as owners of their own learning — peer assessment, self-assessment against criteria, and Earl's name for the function when the assessing itself is the learning: assessment as learning.",
      "terms": [
        "peer assessment",
        "self-assessment",
        "assessment as learning"
      ],
      "seeds": [
        "peer assessment",
        "self-assessment"
      ],
      "termInfo": {
        "assessment as learning": {
          "text": "Earl's third purpose: when students assess themselves and each other, the assessing IS the learning — metacognition practiced, not tested.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "peer assessment": {
          "text": "Students applying criteria to one another's work — becoming instructional resources for each other; explaining work against criteria deepens the explainer's learning too.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        },
        "self-assessment": {
          "text": "Students judging their own work against criteria — the owner's habit. The point is not perfect accuracy but the judgment it trains for every learning decision after school.",
          "links": [
            {
              "href": "wiki:Formative assessment"
            }
          ]
        }
      },
      "info": {
        "text": "Peer assessment deepens the peer's own learning — evaluating someone else's work against criteria is a master-class in the criteria — while self-assessment trains the judgment every learner needs after schooling ends.",
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "evidence-needs-a-target",
      "term": "evidence needs a target",
      "clusters": [
        1,
        2
      ],
      "fact": "Hinge questions and exit tickets only inform teaching when answers are read against shared success criteria; evidence gathered without a visible target is just noise with a tally.",
      "info": {
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "success criteria",
        "hinge question"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "the-branching-decision",
      "term": "the branching decision",
      "clusters": [
        2,
        3
      ],
      "fact": "The hinge logic in miniature: all correct — move on; some — discuss; most wrong — reteach. Elicited evidence becomes feedback about next steps, not a score, which is the whole point of asking.",
      "info": {
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "hinge question",
        "feedback that moves learners forward"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "feedback-works-when-used",
      "term": "feedback works only when it is used",
      "clusters": [
        3,
        4
      ],
      "fact": "Strategy 3's phrase is 'feedback which can and will be acted upon' — and acting on it is strategies 4 and 5: students applying feedback to one another's work and revising their own.",
      "info": {
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "feedback that moves learners forward",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 4
      }
    },
    {
      "id": "criteria-make-self-assessment-possible",
      "term": "criteria make self-assessment possible",
      "clusters": [
        4,
        1
      ],
      "fact": "Students self-assess against criteria lists and judge exemplars by the same standards the teacher uses — shared intentions are what make peer and self-assessment more than guesses.",
      "info": {
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "self-assessment",
        "success criteria"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 4
      }
    },
    {
      "id": "use-makes-it-formative",
      "term": "use makes it formative",
      "clusters": [
        0,
        3
      ],
      "fact": "For Scriven and Bloom an assessment is only formative if it is used to alter the decisions that follow — the same quiz is formative or summative depending on what happens next.",
      "info": {
        "links": [
          {
            "href": "wiki:Formative assessment"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "formative assessment",
        "feedback that moves learners forward"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "after-teaching-begins",
      "prompt": "Two of the three assessment purposes sit entirely after teaching has begun — one steering it, one judging it. Which two?",
      "explanation": "Diagnostic assessment runs before instruction to find starting points; formative assessment steers learning while it is underway; summative assessment judges outcomes at the end. Only the diagnostic form belongs to the time before teaching.",
      "label": "Purposes on the clock",
      "targets": [
        "formative assessment",
        "summative assessment"
      ],
      "reasons": {
        "formative assessment": "steers learning while it is underway",
        "summative assessment": "judges outcomes at the end"
      }
    },
    {
      "id": "making-quality-visible",
      "prompt": "Students cannot steer toward a standard they have never seen. Which three terms name ways of making the quality standard visible to learners?",
      "explanation": "The rubric carries the success criteria in grid form, exemplars show the standard in real work, and the criteria themselves say what counts as quality. Learning intentions name where students are headed — the destination, not the quality bar.",
      "label": "Making quality visible",
      "targets": [
        "rubric",
        "success criteria",
        "exemplars"
      ],
      "reasons": {
        "exemplars": "real samples of others' work showing the standard",
        "rubric": "the criteria grid describing quality at levels",
        "success criteria": "the explicit statement of what counts as quality"
      }
    },
    {
      "id": "planned-checkpoints",
      "prompt": "Two of the eliciting techniques are planned before the lesson — one to branch it, one to close it — rather than improvised in the moment. Which two?",
      "explanation": "Hinge questions are planned for the point where the lesson must branch; exit tickets are the planned end-of-lesson check. Wait time and no hands up are in-the-moment practices — how you handle the seconds around any answer, not planned checkpoints.",
      "label": "Planned, not improvised",
      "targets": [
        "hinge question",
        "exit ticket"
      ],
      "reasons": {
        "exit ticket": "the planned close — every student's residue before the next lesson",
        "hinge question": "the planned branch point — the question the lesson leans on"
      }
    },
    {
      "id": "two-fates-of-feedback",
      "prompt": "Which two terms sit at the opposite extremes of feedback's one consequential divide — the kind that changes next steps, and the kind that judges the person?",
      "explanation": "Feedback that moves learners forward tells students what to improve and how — the actionable kind Wiliam's strategy demands. Ego-involving feedback judges the person, and Kluger and DeNisi found such judgment-centered interventions can lower performance. Comment-only marking is a marking policy on the actionable side, not one of the two styles.",
      "label": "The two fates of feedback",
      "targets": [
        "feedback that moves learners forward",
        "ego-involving feedback"
      ],
      "reasons": {
        "ego-involving feedback": "the person-judging extreme — documented to do harm",
        "feedback that moves learners forward": "the actionable extreme — what to improve and how"
      }
    },
    {
      "id": "the-missed-turn",
      "prompt": "A teacher gives a quiz, marks it, hands back scores, and moves to the next chapter. Which two terms name what her quiz failed to become?",
      "explanation": "Handing back scores and moving on fails both cuts at once: the evidence was never used to change anything, so the quiz was not formative (it merely became summative), and no feedback was generated — only a record. Use is what makes an assessment formative; actionability is what makes its results feedback.",
      "label": "The missed turn",
      "targets": [
        "formative assessment",
        "feedback that moves learners forward"
      ],
      "reasons": {
        "feedback that moves learners forward": "no actionable next steps were produced or acted on — only a score",
        "formative assessment": "the evidence never changed any decision that followed"
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "backward-design",
        "reason": "The planning half of the same evidence story: Stage 2 fixes acceptable evidence before teaching; this board is the live loop that gathers and uses evidence during teaching."
      },
      {
        "id": "how-learning-sticks",
        "reason": "Why the loop works: retrieval practice is the most robust finding in the learning sciences, and hinge questions and exit tickets are retrieval practice with a classroom shape."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Checking Learning While It Happens",
    "summary": "What makes assessment formative, Wiliam's five strategies, and the loop that turns evidence into next steps.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Assessment is usually pictured at the end: the test, the grade, the report. Formative assessment moves it into the middle of learning. For Scriven, who coined the formative/summative pair in 1967, and Bloom, who carried it to classrooms, an assessment is only formative if its evidence changes the decisions that follow — the same quiz is formative or summative depending on what the teacher does next. Black and Wiliam's 1998 review of over 250 studies found that doing this well produces some of the largest learning gains of any educational intervention.\r\n\r\n## The teacher's five moves\r\n\r\nDylan Wiliam's five key strategies organize the practice. First, share the learning intentions and success criteria — often as a rubric — and show exemplars of other students' work, so the standard is visible instead of guessed at. Second, engineer discussions and tasks that elicit evidence from every student, not just the volunteers: planned hinge questions at points where the lesson must branch, exit tickets that collect the day's residue, longer wait time — Rowe found three seconds beats one — and no hands up, so the teacher chooses who answers.\r\n\r\nThird, give feedback which can and will be acted upon. Butler's experiments showed that students who received comments alongside grades ignored the comments; comment-only marking serves learning better than grades do. And feedback that judges the person — the ego-involving kind — can do harm: Kluger and DeNisi found over a third of feedback interventions lowered performance. Fourth and fifth, hand the assessing over: peer assessment makes students instructional resources for one another, and self-assessment against criteria makes them owners of their own learning — what Lorna Earl calls assessment as learning, where the assessing is itself the lesson.\r\n\r\n## The loop\r\n\r\nThe five moves form a cycle. Criteria make questions meaningful; questions produce evidence; evidence becomes feedback; feedback is used by students on their own and each other's work — which only works because the criteria were shared in the first place. Running in minutes rather than weeks, this is what Black and Wiliam called short-cycle formative assessment, and it is why the strongest gains come from checking learning while it happens, not after."
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
      "puzzleId": "assessment-for-learning",
      "puzzleRevision": "fnv1a32:ca2cffd4",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:formative assessment": {
          "x": 674.4,
          "y": 544.28,
          "pinned": false
        },
        "term:summative assessment": {
          "x": 805.93,
          "y": 658.17,
          "pinned": false
        },
        "term:diagnostic assessment": {
          "x": 841.17,
          "y": 484.56,
          "pinned": false
        },
        "term:rubric": {
          "x": 642.54,
          "y": 102.8,
          "pinned": false
        },
        "term:success criteria": {
          "x": 702.84,
          "y": 203.4,
          "pinned": false
        },
        "term:learning intentions": {
          "x": 740.94,
          "y": 23,
          "pinned": false
        },
        "term:exemplars": {
          "x": 579.96,
          "y": 30.98,
          "pinned": false
        },
        "term:exit ticket": {
          "x": 940.75,
          "y": 316.42,
          "pinned": false
        },
        "term:no hands up": {
          "x": 1016.85,
          "y": 227.16,
          "pinned": false
        },
        "term:hinge question": {
          "x": 814.6,
          "y": 328.56,
          "pinned": false
        },
        "term:wait time": {
          "x": 969.93,
          "y": 423.51,
          "pinned": false
        },
        "term:comment-only marking": {
          "x": 367.35,
          "y": 687,
          "pinned": false
        },
        "term:feedback that moves learners forward": {
          "x": 458.73,
          "y": 482.25,
          "pinned": false
        },
        "term:ego-involving feedback": {
          "x": 239,
          "y": 560.55,
          "pinned": false
        },
        "term:peer assessment": {
          "x": 277.69,
          "y": 132.88,
          "pinned": false
        },
        "term:self-assessment": {
          "x": 367.47,
          "y": 23,
          "pinned": false
        },
        "term:assessment as learning": {
          "x": 113.23,
          "y": 137.73,
          "pinned": false
        },
        "term:evidence needs a target": {
          "x": 871.14,
          "y": 174.03,
          "pinned": false
        },
        "term:the branching decision": {
          "x": 657.33,
          "y": 364.81,
          "pinned": false
        },
        "term:feedback works only when it is used": {
          "x": 231.68,
          "y": 333.12,
          "pinned": false
        },
        "term:criteria make self-assessment possible": {
          "x": 484.76,
          "y": 202.36,
          "pinned": false
        },
        "term:use makes it formative": {
          "x": 564.54,
          "y": 687,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4578.47,
        "score": 4578.471159429222
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-18T08:44:03.199Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "assessment-for-learning",
      "puzzleRevision": "fnv1a32:ca2cffd4",
      "board": {
        "width": 1100,
        "height": 710
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 296.4,
          "y": 531.6,
          "pinned": false
        },
        "cluster:1": {
          "x": 550,
          "y": 154.6,
          "pinned": false
        },
        "cluster:2": {
          "x": 139.66,
          "y": 298.6,
          "pinned": false
        },
        "cluster:3": {
          "x": 803.6,
          "y": 531.6,
          "pinned": false
        },
        "cluster:4": {
          "x": 960.34,
          "y": 298.6,
          "pinned": false
        }
      },
      "bridges": {
        "term:evidence needs a target": {
          "x": 344.83,
          "y": 226.6,
          "pinned": false
        },
        "term:the branching decision": {
          "x": 508.4,
          "y": 451.87,
          "pinned": false
        },
        "term:feedback works only when it is used": {
          "x": 726.76,
          "y": 350.81,
          "pinned": false
        },
        "term:criteria make self-assessment possible": {
          "x": 681.63,
          "y": 300.14,
          "pinned": false
        },
        "term:use makes it formative": {
          "x": 524.13,
          "y": 542.31,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "formative assessment",
          "summative assessment",
          "diagnostic assessment"
        ],
        "cluster:1": [
          "rubric",
          "success criteria",
          "learning intentions",
          "exemplars"
        ],
        "cluster:2": [
          "exit ticket",
          "no hands up",
          "hinge question",
          "wait time"
        ],
        "cluster:3": [
          "comment-only marking",
          "feedback that moves learners forward",
          "ego-involving feedback"
        ],
        "cluster:4": [
          "peer assessment",
          "self-assessment",
          "assessment as learning"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "summative assessment",
          "diagnostic assessment",
          "formative assessment"
        ],
        "cluster:1": [
          "exemplars",
          "learning intentions",
          "success criteria",
          "rubric"
        ],
        "cluster:2": [
          "exit ticket",
          "no hands up",
          "hinge question",
          "wait time"
        ],
        "cluster:3": [
          "comment-only marking",
          "feedback that moves learners forward",
          "ego-involving feedback"
        ],
        "cluster:4": [
          "self-assessment",
          "assessment as learning",
          "peer assessment"
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
        "totalLength": 1837.5091417833726
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-18T08:44:03.910Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "assessment-for-learning",
      "puzzleRevision": "fnv1a32:ca2cffd4",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:formative assessment": {
          "x": 572.15,
          "y": 150.99
        },
        "term:summative assessment": {
          "x": 657.62,
          "y": 22
        },
        "term:diagnostic assessment": {
          "x": 838.04,
          "y": 22
        },
        "term:rubric": {
          "x": 1022.69,
          "y": 568.3
        },
        "term:success criteria": {
          "x": 720.26,
          "y": 468.83
        },
        "term:learning intentions": {
          "x": 1004.27,
          "y": 663.18
        },
        "term:exemplars": {
          "x": 804.24,
          "y": 666.16
        },
        "term:exit ticket": {
          "x": 990.72,
          "y": 22
        },
        "term:no hands up": {
          "x": 1045.35,
          "y": 110.61
        },
        "term:hinge question": {
          "x": 888.19,
          "y": 323.25
        },
        "term:wait time": {
          "x": 1051.65,
          "y": 290.8
        },
        "term:comment-only marking": {
          "x": 83,
          "y": 273.74
        },
        "term:feedback that moves learners forward": {
          "x": 368.56,
          "y": 270.63
        },
        "term:ego-involving feedback": {
          "x": 89.3,
          "y": 22
        },
        "term:peer assessment": {
          "x": 339.42,
          "y": 673.11
        },
        "term:self-assessment": {
          "x": 512.11,
          "y": 475.88
        },
        "term:assessment as learning": {
          "x": 168.55,
          "y": 616.52
        },
        "term:evidence needs a target": {
          "x": 967.84,
          "y": 429.11
        },
        "term:the branching decision": {
          "x": 683.24,
          "y": 292.96
        },
        "term:feedback works only when it is used": {
          "x": 197.06,
          "y": 464.27
        },
        "term:criteria make self-assessment possible": {
          "x": 582.76,
          "y": 632.4
        },
        "term:use makes it formative": {
          "x": 467.76,
          "y": 63.7
        },
        "cluster:0": {
          "x": 751.87,
          "y": 143.62
        },
        "cluster:1": {
          "x": 865.32,
          "y": 582.44
        },
        "cluster:2": {
          "x": 914.41,
          "y": 221.22
        },
        "cluster:3": {
          "x": 258.29,
          "y": 133.45
        },
        "cluster:4": {
          "x": 396.41,
          "y": 552.01
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-18T10:01:35.874Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "auto",
    "savedAt": "2026-10-18T08:44:02.510Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
