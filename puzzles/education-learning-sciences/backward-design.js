// Generated from content/puzzles/backward-design.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "backward-design",
  "title": "Backward Design — Planning From the Proof Backward",
  "category": "education-learning-sciences",
  "subcategories": {
    "education-learning-sciences": "instructional-design"
  },
  "info": {
    "text": "Backward design — the method at the center of Wiggins and McTighe's Understanding by Design framework — plans a course in reverse: fix the results learners should keep (Stage 1), decide what would count as proof (Stage 2), and only then plan instruction (Stage 3). This puzzle teaches the framework's own vocabulary, its three-stage machinery, the acquisition–meaning–transfer goal triad that justifies it, and the failure modes — the twin sins — it exists to correct.",
    "citations": [
      {
        "title": "Understanding by Design (2nd ed.)",
        "author": "Grant Wiggins and Jay McTighe",
        "publisher": "ASCD",
        "year": "2005"
      },
      {
        "title": "Put Understanding First",
        "author": "Grant Wiggins and Jay McTighe",
        "publisher": "ASCD Educational Leadership 65(8)",
        "year": "2008",
        "url": "https://www.ascd.org/el/articles/put-understanding-first"
      },
      {
        "title": "Understanding by Design",
        "author": "Ryan S. Bowen",
        "publisher": "Vanderbilt University Center for Teaching (archived)",
        "year": "2017",
        "url": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/"
      },
      {
        "title": "Backward design",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Backward_design"
      },
      {
        "title": "Understanding by Design",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Understanding_by_Design"
      }
    ]
  },
  "clusters": [
    {
      "id": "planning-direction",
      "name": "The Planning Direction",
      "color": "teal",
      "fact": "Backward design plans in reverse: fix the results first, then the evidence, then the teaching. Forward design — the classroom habit it names — starts from textbooks and beloved activities and hopes results follow.",
      "terms": [
        "backward design",
        "forward design"
      ],
      "seeds": [
        "backward design"
      ],
      "termInfo": {
        "backward design": {
          "text": "The method Wiggins and McTighe named at the center of Understanding by Design: plan results, then evidence, then instruction — in that order. 'Backwards planning' is an informal synonym for the same move.",
          "links": [
            {
              "href": "wiki:Backward design"
            }
          ]
        },
        "forward design": {
          "text": "The habitual sequence backward design opposes: pick the textbook or beloved activities first, then write the assessments, and hope the intended results follow.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017)"
            }
          ]
        }
      },
      "info": {
        "text": "The framework's core move is a reversal of the habitual planning order; the contrast between the two directions organizes everything else on this board.",
        "links": [
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Understanding by Design — Vanderbilt CFT (archived)"
          }
        ]
      }
    },
    {
      "id": "desired-results",
      "name": "Stage 1 — Desired Results",
      "color": "blue",
      "fact": "Stage 1 decides what learners should retain: big ideas stated as enduring understandings, pursued through essential questions, and prioritized through a filter from worth-being-familiar-with up through important-to-know-and-do.",
      "terms": [
        "big ideas",
        "enduring understandings",
        "essential questions",
        "knowledge worth being familiar with",
        "important to know and do"
      ],
      "seeds": [
        "big ideas",
        "enduring understandings"
      ],
      "termInfo": {
        "big ideas": {
          "text": "The conceptual anchor a course is organized around — a concept, theme, or principle like 'adaptation' or 'supply and demand'. An enduring understanding is a big idea stated in full-sentence form.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage One"
            }
          ]
        },
        "enduring understandings": {
          "text": "Full-sentence statements of what students should keep after the course ends — 'Students will understand that…' — the top priority of Stage 1's filter.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage One"
            }
          ]
        },
        "essential questions": {
          "text": "Open questions — 'Students will keep considering…' — that guide learners toward a big idea without handing them a settled answer; Stage 1 pairs them with the understandings.",
          "links": [
            {
              "href": "wiki:Understanding by Design"
            }
          ]
        },
        "important to know and do": {
          "text": "The middle ring of Stage 1's prioritization filter: knowledge and skills that are prerequisite to the enduring understandings — important, but not the destination.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage One"
            }
          ]
        },
        "knowledge worth being familiar with": {
          "text": "The outer ring of Stage 1's filter: content that deserves exposure, not mastery. Naming it keeps the filter honest about what can be skipped.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage One"
            }
          ]
        }
      },
      "info": {
        "text": "Stage 1 pairs every 'Students will understand that…' statement with open questions that keep learners considering it, and filters all candidate content by how long it must last.",
        "links": [
          {
            "href": "wiki:Understanding by Design"
          },
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Stage One — Identify Desired Results (archived)"
          }
        ]
      }
    },
    {
      "id": "acceptable-evidence",
      "name": "Stage 2 — Acceptable Evidence",
      "color": "amber",
      "fact": "Stage 2 decides, before any teaching is planned, what would count as proof that the desired results occurred — typically a culminating performance task that asks learners to apply their learning authentically.",
      "terms": [
        "performance task",
        "authentic assessment",
        "acceptable evidence"
      ],
      "seeds": [
        "performance task",
        "authentic assessment"
      ],
      "termInfo": {
        "acceptable evidence": {
          "text": "Stage 2's criterion: what would count as proof that the desired results occurred, specified before teaching begins. It is the standard, of which tasks are instances.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage Two"
            }
          ]
        },
        "authentic assessment": {
          "text": "The quality bar for acceptable evidence: tasks mirroring how the learning is actually used beyond school, rather than proxies for recall.",
          "links": [
            {
              "href": "wiki:Authentic assessment"
            }
          ]
        },
        "performance task": {
          "text": "The assessment form UbD centers on: a realistic, often culminating task that requires learners to apply their understanding, not just recite it.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage Two"
            }
          ]
        }
      },
      "info": {
        "text": "Assessment here is designed, not improvised: the designer specifies the proof before choosing instruction, which is what makes the later lessons accountable to a fixed target.",
        "links": [
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Stage Two — Determine Acceptable Evidence (archived)"
          }
        ]
      }
    },
    {
      "id": "learning-plan",
      "name": "Stage 3 — The Learning Plan",
      "color": "magenta",
      "fact": "Only in Stage 3, with results and evidence fixed, does the design turn to instruction: the learning experiences and enabling knowledge and skills students will need, sequenced by the WHERE elements — hook and hold them, equip and experience, rethink and rehearse, evaluate (Wiggins & McTighe).",
      "terms": [
        "learning experiences",
        "enabling knowledge and skills",
        "hook problem"
      ],
      "seeds": [
        "learning experiences",
        "enabling knowledge and skills"
      ],
      "termInfo": {
        "enabling knowledge and skills": {
          "text": "The facts, concepts, and skills students need in order to succeed on the performance tasks — the 'equip' of the WHERE sequence, identified only after the tasks exist.",
          "links": [
            {
              "href": "wiki:Backward design"
            }
          ]
        },
        "hook problem": {
          "text": "The 'H' of the WHERE sequence: an opening problem situation that hooks learners' interest and holds it — problem first, explanation second.",
          "links": [
            {
              "href": "wiki:Backward design"
            }
          ]
        },
        "learning experiences": {
          "text": "Stage 3's instruction: the activities and sequences students actually go through — chosen last, for their fit to the fixed evidence.",
          "links": [
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017), Stage Three"
            }
          ]
        }
      },
      "info": {
        "text": "The learning plan is last by design: activities are selected and sequenced for their fit to the evidence, replacing the textbook-and-activities-first habit. The W-H-E-R-E mnemonic summarizes Wiggins and McTighe's elements of a good learning plan.",
        "links": [
          {
            "href": "wiki:Backward design"
          }
        ]
      }
    },
    {
      "id": "goal-triad",
      "name": "The Goal Triad",
      "color": "olive",
      "fact": "Schooling's long-term aims form a triad: acquisition of facts and skills as the entry tier, meaning made of content in the middle, and transfer — applying learning to novel situations — as the finish line.",
      "terms": [
        "meaning making",
        "transfer",
        "acquisition"
      ],
      "seeds": [
        "meaning making",
        "transfer"
      ],
      "termInfo": {
        "acquisition": {
          "text": "The triad's entry tier: discrete facts and skills. Necessary as a doorway, but schooling errs — in Wiggins and McTighe's diagnosis — when it treats acquisition as the goal.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            }
          ]
        },
        "meaning making": {
          "text": "The triad's middle tier: learners actively constructing understanding of content, connecting it to what they know, rather than only receiving it.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            }
          ]
        },
        "transfer": {
          "text": "The triad's finish line and the long-term aim of schooling: applying learning to novel situations that were never rehearsed.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            }
          ]
        }
      },
      "info": {
        "text": "Wiggins and McTighe's 'Put Understanding First' argues schooling inverts this triad: it treats acquisition as the goal when it is only the doorway. Learning for understanding is the umbrella these three tiers operationalize.",
        "links": [
          {
            "href": "https://www.ascd.org/el/articles/put-understanding-first",
            "label": "Wiggins & McTighe (2008), Put Understanding First — ASCD Educational Leadership 65(8)"
          }
        ]
      }
    },
    {
      "id": "failure-modes",
      "name": "The Failure Modes",
      "color": "brown",
      "fact": "The diagnoses this design order corrects: coverage — marching through content for its own sake — and activity focus — engaging hands with no learning target — the 'twin sins' of design, plus letting the textbook stand in for the syllabus.",
      "terms": [
        "activity focus",
        "coverage",
        "textbook as syllabus"
      ],
      "seeds": [
        "activity focus",
        "coverage"
      ],
      "termInfo": {
        "activity focus": {
          "text": "The second twin sin: designing engaging, hands-on activities with no explicit learning target behind them — 'mere homage' to doing.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            },
            {
              "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
              "label": "Bowen (2017)"
            }
          ]
        },
        "coverage": {
          "text": "The first twin sin: teaching by marching through content for its own sake, measuring success by what was presented rather than what was kept.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            }
          ]
        },
        "textbook as syllabus": {
          "text": "The habit of letting the textbook's sequence stand in for curricular goals; the book should serve as a resource, not as the syllabus.",
          "links": [
            {
              "href": "https://www.ascd.org/el/articles/put-understanding-first",
              "label": "Wiggins & McTighe (2008)"
            }
          ]
        }
      },
      "info": {
        "text": "Each failure mode is a planning order gone wrong, not a personality flaw: content-first, activity-first, or textbook-first designs all skip the question of what learners should keep.",
        "links": [
          {
            "href": "https://www.ascd.org/el/articles/put-understanding-first",
            "label": "Wiggins & McTighe (2008), Put Understanding First — ASCD Educational Leadership 65(8)"
          },
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Understanding by Design (archived)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "results-before-methods",
      "term": "results before methods",
      "clusters": [
        0,
        3
      ],
      "fact": "The point of reversing the order: the best designs derive backward from the learnings sought, so the learning plan exists only to serve results fixed in advance — not to fill the calendar or the textbook.",
      "info": {
        "links": [
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Understanding by Design (archived)"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "backward design",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "how-will-i-know",
      "term": "how will I know?",
      "clusters": [
        1,
        2
      ],
      "fact": "Stage 2's guiding question — 'How will I know if students have achieved the desired results? What will I accept as evidence of student understanding?' — is asked only after Stage 1 has fixed those results.",
      "info": {
        "links": [
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Stage Two (archived)"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "enduring understandings",
        "acceptable evidence"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "alignment",
      "term": "alignment",
      "clusters": [
        2,
        3
      ],
      "fact": "Because evidence is fixed first, every learning experience is chosen for its fit to that evidence — instruction drives students toward exactly what the assessment demands, and off-target busywork becomes visible as such.",
      "info": {
        "links": [
          {
            "href": "wiki:Backward design"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "acceptable evidence",
        "learning experiences"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "recall-application-gap",
      "term": "the recall–application gap",
      "clusters": [
        3,
        4
      ],
      "fact": "A student who acquired the content but flounders on an unfamiliar application problem shows 'not a failure of coverage but a failure of transfer' — so the learning plan must be built for application, not recall alone.",
      "info": {
        "links": [
          {
            "href": "https://www.ascd.org/el/articles/put-understanding-first",
            "label": "Wiggins & McTighe (2008), Put Understanding First"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "learning experiences",
        "transfer"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "durability",
      "term": "durability",
      "clusters": [
        1,
        4
      ],
      "fact": "Enduring understandings are selected precisely because big ideas transfer: meaning made of a big idea is what lets a learner answer questions that were never scripted.",
      "info": {
        "links": [
          {
            "href": "https://web.archive.org/web/20240104180643/https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/",
            "label": "Bowen (2017), Stage One (archived)"
          },
          {
            "href": "https://www.ascd.org/el/articles/put-understanding-first",
            "label": "Wiggins & McTighe (2008), Put Understanding First"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "enduring understandings",
        "transfer"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 1
      }
    },
    {
      "id": "forward-design-habit",
      "term": "the forward-design habit",
      "clusters": [
        0,
        4
      ],
      "fact": "Starting with activities and textbooks feels productive, but the habit yields acquisition without transfer — familiar recall that collapses the moment a problem looks unfamiliar.",
      "info": {
        "links": [
          {
            "href": "wiki:Understanding by Design"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "forward design",
        "acquisition"
      ]
    }
  ],
  "lenses": [
    {
      "id": "stage1-filter",
      "prompt": "Stage 1's prioritization filter sorts candidate content into three rings, and only the top ring earns the title of enduring. Which two terms name the lower rings — content that matters but is not the destination?",
      "explanation": "Stage 1's filter runs from worth being familiar with (exposure) up through important to know and do (prerequisites) to enduring understandings (retention). The big ideas and essential questions are not rings in the filter — they are what the top ring states and the open questions learners carry toward it.",
      "label": "The Stage 1 filter",
      "targets": [
        "knowledge worth being familiar with",
        "important to know and do"
      ],
      "reasons": {
        "important to know and do": "the middle ring — prerequisite knowledge and skills, important but not the destination",
        "knowledge worth being familiar with": "the outer ring — exposure, not mastery"
      }
    },
    {
      "id": "stage-order",
      "prompt": "A designer has written the enduring understandings and is itching to plan some engaging lessons. In this framework's order, what must be specified before any instruction is planned?",
      "explanation": "The framework's core discipline is the order: results (Stage 1), then acceptable evidence (Stage 2), then the learning plan (Stage 3). Evidence is specified before teaching so that every lesson is accountable to a fixed proof. The performance task is the signature form that evidence takes — an instance of the criterion, not the criterion itself.",
      "label": "The design order",
      "targets": [
        "acceptable evidence"
      ],
      "reasons": {
        "acceptable evidence": "Stage 2's product — the proof fixed in advance that Stage 3 instruction must serve"
      }
    },
    {
      "id": "triad-extremes",
      "prompt": "Within the goal triad, which two terms sit at opposite ends of the ladder — the entry tier that schooling overemphasizes, and the finish line it too rarely reaches?",
      "explanation": "Acquisition is the doorway — facts and skills; transfer is the finish line — novel application. Meaning making sits deliberately in the middle of the ladder: essential, but neither end.",
      "label": "Entry and finish",
      "targets": [
        "acquisition",
        "transfer"
      ],
      "reasons": {
        "acquisition": "the entry tier — necessary, but schooling errs when it treats it as the goal",
        "transfer": "the finish line — applying learning to situations never rehearsed"
      }
    },
    {
      "id": "twin-sins",
      "prompt": "Wiggins and McTighe's 'twin sins' of instructional design both mistake a means for an end. Which two terms name the pair?",
      "explanation": "Coverage marches through content for its own sake; activity focus engages hands with no learning target. 'Textbook as syllabus' is a related habit — outsourcing goals to a book's sequence — but the named twin sins are the first two.",
      "label": "The twin sins",
      "targets": [
        "coverage",
        "activity focus"
      ],
      "reasons": {
        "activity focus": "the second twin sin — engaging hands with no learning target",
        "coverage": "the first twin sin — marching through content for its own sake"
      }
    },
    {
      "id": "quiz-then-transfer",
      "prompt": "A student aces the unit's recall quiz, then flounders on a genuinely new application problem. Which term names the diagnosis — and which goal-triad tier was never really built?",
      "explanation": "Wiggins and McTighe's own diagnosis: the quiz score shows recall was present, the transfer-task failure shows 'not a failure of coverage but a failure of transfer.' The missing tier is the finish line — transfer — while acquisition was abundantly built.",
      "label": "Reading the signature",
      "targets": [
        "the recall–application gap",
        "transfer"
      ],
      "reasons": {
        "the recall–application gap": "the diagnosis — acquired content that collapses on unfamiliar application",
        "transfer": "the missing tier — the finish line the plan never served"
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "assessment-for-learning",
        "reason": "Stage 2 fixes the acceptable evidence in advance; this board checks learning live against it — the planning proof and the during-teaching evidence loop are the two halves of accountable teaching."
      },
      {
        "id": "how-learning-sticks",
        "reason": "The learning science behind the design choices: transfer — the goal triad's finish line that backward design plans toward — is exactly the durable, schema-carrying learning the sibling board explains."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Planning Backward",
    "summary": "Why backward design reverses the planning order — and what each of its three stages fixes.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Planning a course usually starts in the middle: open the textbook, line up the chapters, plan some engaging lessons, and write the test the night before it is due. Grant Wiggins and Jay McTighe named that habit forward design and argued it is backwards in the wrong way. Their alternative, backward design — the method at the center of their Understanding by Design framework — plans in reverse: decide first what learners should keep, then what would count as proof, and only then what to actually do in class.\r\n\r\n## Why: the goal triad\r\n\r\nThe reversal exists to serve a claim about purpose. Schooling's long-term aims form a triad. At the entry tier sits acquisition — facts and discrete skills, necessary but never the destination. In the middle sits meaning making — learners actively constructing understanding of the content rather than just receiving it. At the finish line sits transfer — the ability to apply learning to situations that were never rehearsed. In their 2008 essay \"Put Understanding First,\" Wiggins and McTighe argue that most schooling works this ladder from the bottom and stops at acquisition, treating the doorway as the destination. Learning for understanding is the umbrella the whole triad operationalizes.\r\n\r\n## How: the three stages\r\n\r\nStage 1 identifies desired results. Designers name the big ideas worth keeping — stated in full as enduring understandings of the form \"Students will understand that…\" — and pair them with essential questions, open questions learners keep considering rather than answer and shelve. Stage 1 is also a filter: some content is only worth being familiar with, some is important to know and do, and only a small remainder qualifies as enduring.\r\n\r\nStage 2 determines acceptable evidence: what would count as proof that the desired results were achieved. The signature form is the performance task — a realistic problem that asks learners to apply their learning authentically, the way it is used beyond school.\r\n\r\nStage 3, and only Stage 3, plans instruction: the learning experiences and the enabling knowledge and skills students will need to succeed on that evidence. Wiggins and McTighe summarize the qualities of a good plan with the mnemonic WHERE: know Where you are headed and why; Hook and hold learners with a genuinely problematic opening — the hook problem; Equip them through Experience and Explore; invite Rethink and Rehearse; and let them Evaluate their own progress.\r\n\r\n## What goes wrong without it\r\n\r\nThe framework is a diagnosis as much as a method. Its twin sins are coverage — marching through content for its own sake — and activity focus — hands-on engagement with no learning target behind it. A third habit lets the textbook stand in for the syllabus, outsourcing the goals to a book's table of contents. Each skips the same question: what should learners keep? The cost has a recognizable signature: a student who aces the recall quiz but flounders on a genuinely new problem shows not a failure of coverage but a failure of transfer. The everyday virtue that prevents it is alignment — every activity chosen for its fit to evidence fixed in advance."
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
      "puzzleId": "backward-design",
      "puzzleRevision": "fnv1a32:c4c29f6f",
      "board": {
        "width": 1160,
        "height": 740
      },
      "nodes": {
        "term:backward design": {
          "x": 1092.75,
          "y": 102.01,
          "pinned": true
        },
        "term:forward design": {
          "x": 1095.9,
          "y": 196.88,
          "pinned": true
        },
        "term:big ideas": {
          "x": 377.6,
          "y": 560.82,
          "pinned": true
        },
        "term:enduring understandings": {
          "x": 507.83,
          "y": 459.75,
          "pinned": true
        },
        "term:essential questions": {
          "x": 673.98,
          "y": 692.6,
          "pinned": true
        },
        "term:knowledge worth being familiar with": {
          "x": 228.09,
          "y": 684.83,
          "pinned": true
        },
        "term:important to know and do": {
          "x": 480,
          "y": 689.61,
          "pinned": true
        },
        "term:performance task": {
          "x": 97,
          "y": 436.19,
          "pinned": true
        },
        "term:authentic assessment": {
          "x": 195.68,
          "y": 522.02,
          "pinned": true
        },
        "term:acceptable evidence": {
          "x": 163.28,
          "y": 360.66,
          "pinned": true
        },
        "term:learning experiences": {
          "x": 703.29,
          "y": 285.17,
          "pinned": true
        },
        "term:enabling knowledge and skills": {
          "x": 619.44,
          "y": 174.66,
          "pinned": true
        },
        "term:hook problem": {
          "x": 803.51,
          "y": 121.49,
          "pinned": true
        },
        "term:meaning making": {
          "x": 1003.59,
          "y": 544.91,
          "pinned": true
        },
        "term:transfer": {
          "x": 831.28,
          "y": 685.9,
          "pinned": false
        },
        "term:acquisition": {
          "x": 1082.88,
          "y": 470.48,
          "pinned": true
        },
        "term:activity focus": {
          "x": 362.05,
          "y": 28.75,
          "pinned": false
        },
        "term:coverage": {
          "x": 432.49,
          "y": 131.96,
          "pinned": false
        },
        "term:textbook as syllabus": {
          "x": 207.53,
          "y": 80.87,
          "pinned": false
        },
        "term:results before methods": {
          "x": 877.98,
          "y": 217.25,
          "pinned": false
        },
        "term:how will I know?": {
          "x": 364.56,
          "y": 365.76,
          "pinned": true
        },
        "term:alignment": {
          "x": 448.23,
          "y": 239.87,
          "pinned": false
        },
        "term:the recall–application gap": {
          "x": 790.04,
          "y": 396.05,
          "pinned": true
        },
        "term:durability": {
          "x": 632.41,
          "y": 578.68,
          "pinned": true
        },
        "term:the forward-design habit": {
          "x": 1005.18,
          "y": 372.66,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5433.04,
        "score": 5433.036110616339
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-18T10:42:22.924Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "backward-design",
      "puzzleRevision": "fnv1a32:c4c29f6f",
      "board": {
        "width": 1160,
        "height": 740
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 582,
          "y": 383.09,
          "pinned": true
        },
        "cluster:1": {
          "x": 904.91,
          "y": 562.65,
          "pinned": true
        },
        "cluster:2": {
          "x": 322.37,
          "y": 583.23,
          "pinned": true
        },
        "cluster:3": {
          "x": 393.83,
          "y": 169.57,
          "pinned": false
        },
        "cluster:4": {
          "x": 931.74,
          "y": 146.01,
          "pinned": true
        },
        "cluster:5": {
          "x": 141.16,
          "y": 357.96,
          "pinned": false
        }
      },
      "bridges": {
        "term:results before methods": {
          "x": 676.13,
          "y": 225.34,
          "pinned": true
        },
        "term:how will I know?": {
          "x": 585.3,
          "y": 568.66,
          "pinned": true
        },
        "term:alignment": {
          "x": 323.81,
          "y": 404.75,
          "pinned": false
        },
        "term:the recall–application gap": {
          "x": 685.4,
          "y": 100.41,
          "pinned": true
        },
        "term:durability": {
          "x": 1075.37,
          "y": 274.97,
          "pinned": true
        },
        "term:the forward-design habit": {
          "x": 855.18,
          "y": 337.92,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "backward design",
          "forward design"
        ],
        "cluster:1": [
          "big ideas",
          "enduring understandings",
          "essential questions",
          "knowledge worth being familiar with",
          "important to know and do"
        ],
        "cluster:2": [
          "performance task",
          "authentic assessment",
          "acceptable evidence"
        ],
        "cluster:3": [
          "learning experiences",
          "enabling knowledge and skills",
          "hook problem"
        ],
        "cluster:4": [
          "meaning making",
          "transfer",
          "acquisition"
        ],
        "cluster:5": [
          "activity focus",
          "coverage",
          "textbook as syllabus"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "backward design",
          "forward design"
        ],
        "cluster:1": [
          "essential questions",
          "enduring understandings",
          "knowledge worth being familiar with",
          "important to know and do",
          "big ideas"
        ],
        "cluster:2": [
          "acceptable evidence",
          "authentic assessment",
          "performance task"
        ],
        "cluster:3": [
          "hook problem",
          "enabling knowledge and skills",
          "learning experiences"
        ],
        "cluster:4": [
          "transfer",
          "meaning making",
          "acquisition"
        ],
        "cluster:5": [
          "coverage",
          "textbook as syllabus",
          "activity focus"
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
        "edgeNodeIntersections": 0,
        "totalLength": 2327.8250589051927
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-18T10:40:52.822Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "backward-design",
      "puzzleRevision": "fnv1a32:c4c29f6f",
      "board": {
        "width": 1160,
        "height": 740
      },
      "nodes": {
        "term:backward design": {
          "x": 989.05,
          "y": 213.13
        },
        "term:forward design": {
          "x": 782.87,
          "y": 175.62
        },
        "term:big ideas": {
          "x": 338,
          "y": 633.34
        },
        "term:enduring understandings": {
          "x": 463.03,
          "y": 349.96
        },
        "term:essential questions": {
          "x": 252.27,
          "y": 706.1
        },
        "term:knowledge worth being familiar with": {
          "x": 130.25,
          "y": 595.45
        },
        "term:important to know and do": {
          "x": 107.92,
          "y": 356.95
        },
        "term:performance task": {
          "x": 809.51,
          "y": 708.09
        },
        "term:authentic assessment": {
          "x": 421.74,
          "y": 712.05
        },
        "term:acceptable evidence": {
          "x": 586.12,
          "y": 484.24
        },
        "term:learning experiences": {
          "x": 759.86,
          "y": 477.75
        },
        "term:enabling knowledge and skills": {
          "x": 1031.8,
          "y": 396.38
        },
        "term:hook problem": {
          "x": 1083.36,
          "y": 506.35
        },
        "term:meaning making": {
          "x": 147.23,
          "y": 189.42
        },
        "term:transfer": {
          "x": 332.77,
          "y": 230.93
        },
        "term:acquisition": {
          "x": 302.35,
          "y": 37.61
        },
        "term:activity focus": {
          "x": 472.1,
          "y": 29.93
        },
        "term:coverage": {
          "x": 595.38,
          "y": 29.93
        },
        "term:textbook as syllabus": {
          "x": 739.35,
          "y": 29.93
        },
        "term:results before methods": {
          "x": 865.84,
          "y": 326.96
        },
        "term:how will I know?": {
          "x": 457.15,
          "y": 580.39
        },
        "term:alignment": {
          "x": 779.59,
          "y": 598.48
        },
        "term:the recall–application gap": {
          "x": 663.74,
          "y": 307.2
        },
        "term:durability": {
          "x": 261.5,
          "y": 322.01
        },
        "term:the forward-design habit": {
          "x": 450.64,
          "y": 152.27
        },
        "cluster:0": {
          "x": 913.56,
          "y": 63.83
        },
        "cluster:1": {
          "x": 308.43,
          "y": 477.32
        },
        "cluster:2": {
          "x": 625.71,
          "y": 650.6
        },
        "cluster:3": {
          "x": 971.44,
          "y": 567
        },
        "cluster:4": {
          "x": 278.24,
          "y": 139.56
        },
        "cluster:5": {
          "x": 629.4,
          "y": 122.95
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-18T10:41:33.908Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-18T10:42:33.604Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
