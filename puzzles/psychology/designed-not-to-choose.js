// Generated from content/puzzles/designed-not-to-choose.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "designed-not-to-choose",
  "title": "Designed not to choose",
  "category": "psychology",
  "categories": [
    "psychology",
    "business-organizations"
  ],
  "subcategories": {
    "psychology": "psychoanalysis"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Isabel Menzies Lyth's study of a nursing service under strain, and the discovery that an institution can restructure itself -- without anyone deciding to -- so that the anxiety which would otherwise force a choice gets absorbed by the structure before any single person has to make one.",
    "citations": [
      {
        "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
        "author": "Isabel E. P. Menzies",
        "publisher": "Human Relations, vol. 13",
        "year": "1960",
        "pages": "pp. 95-121"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-underneath",
      "name": "The anxiety underneath",
      "color": "teal",
      "fact": "Menzies Lyth drew on Melanie Klein's account of infantile anxiety to explain what she found: close, repeated contact with suffering and death stirs feelings of a violence and intensity most adult life never requires anyone to face. The individual mind has its own old defenses against this -- splitting the frightening into pieces, projecting it outward, denying it is happening at all. None of this is unique to nursing. Nursing simply requires it constantly, of everyone, at once.",
      "terms": [
        "primitive anxiety",
        "projection",
        "splitting"
      ],
      "seeds": [
        "primitive anxiety",
        "projection"
      ],
      "termInfo": {
        "primitive anxiety": {
          "text": "Fear of a violence and intensity Menzies Lyth traced to infancy -- ordinarily long outgrown, but reawakened by sustained closeness to suffering and death."
        },
        "projection": {
          "text": "Placing an unbearable feeling outside the self, onto someone else, so it can be managed from a safer distance. An individual defense, operating in one mind at a time."
        },
        "splitting": {
          "text": "Dividing something too threatening to hold as one whole into separate, more bearable pieces. Klein's term for an infant defense that persists, in adult form, well into later life."
        }
      },
      "info": "The primitive, Kleinian-rooted anxiety that intimate contact with suffering and death stirs up, and the individual mind's own old defenses against feeling the whole of it."
    },
    {
      "id": "cluster-defence",
      "name": "The social defence system",
      "color": "blue",
      "fact": "Menzies Lyth was careful about what she was and was not claiming: an institution does not have a psyche of its own. What she found instead was something stranger -- impersonal structures, existing independently of whoever currently holds a given post, that let each new occupant lean on the same defenses the last one did. Task lists, checklists, and clinical distance were not chosen by any nurse in particular. They were simply what the role already came with.",
      "terms": [
        "ritual task performance",
        "depersonalization",
        "checks and counter-checks",
        "task splitting"
      ],
      "seeds": [
        "ritual task performance",
        "depersonalization"
      ],
      "termInfo": {
        "checks and counter-checks": {
          "text": "Having a second, sometimes a third, person verify a decision already made. Reads as diligence. Functions as diffusion: once several people have glanced at the same chart, no one of them carries it alone."
        },
        "depersonalization": {
          "text": "Reducing a patient to their condition or bed number rather than engaging them as a person -- distance achieved through language, applied automatically, by everyone, without any single decision to be unkind."
        },
        "ritual task performance": {
          "text": "Following a fixed procedure exactly, in fixed order, regardless of the particular patient in front of you. Removes the need to exercise judgment, and with it, the anxiety of having judged."
        },
        "task splitting": {
          "text": "Dividing the total care one patient needs into separate tasks, carried out by different nurses, so that no single nurse holds the whole relationship -- or the whole of what it costs to hold it."
        }
      },
      "info": "The impersonal, structural defenses built into the role itself -- inherited by whoever fills it, chosen by no one currently in it."
    },
    {
      "id": "cluster-cost",
      "name": "The cost of the defence",
      "color": "amber",
      "fact": "None of this made the anxiety go away. Menzies Lyth's central, uncomfortable finding was that these defenses generated a further layer of anxiety on top of the original -- guilt, doubt, and frustration about a system nobody could quite explain or defend -- and that the more the system leaned on ritual, the more rigid and harder to change it became. The hospital she studied was, by its own senior staff's account, edging toward a genuine breakdown in its ability to train anyone at all.",
      "terms": [
        "secondary anxiety",
        "diffusion of responsibility",
        "rigidity"
      ],
      "seeds": [
        "secondary anxiety",
        "diffusion of responsibility"
      ],
      "termInfo": {
        "diffusion of responsibility": {
          "text": "Spreading a decision across enough people, or enough procedure, that no single person has to carry the full weight of having made it."
        },
        "rigidity": {
          "text": "The system's tendency to become less adaptable over time, not more -- since any change threatens to strip away defenses everyone has come, unconsciously, to depend on."
        },
        "secondary anxiety": {
          "text": "Anxiety produced by the defenses themselves -- guilt, doubt, and frustration at a system nobody chose and nobody can quite justify -- layered on top of whatever anxiety the defenses were meant to relieve."
        }
      },
      "info": "What the defenses actually produced, measured against what they were meant to produce: not less anxiety, but a system generating more of it, and getting more rigid as it did."
    },
    {
      "id": "cluster-containment",
      "name": "What containment would require",
      "color": "magenta",
      "fact": "Menzies Lyth pushed back, later in her career, against a popular misreading of her own paper -- that the fix was better staff support, helping nurses cope with a role that stayed exactly as it was. She wanted the opposite: containment, in Bion's sense, meant a role redesigned to actually hold the anxiety it provoked, rather than one where anxiety was quietly denied and the people in it were asked to manage on their own.",
      "terms": [
        "containment",
        "redesigning the role",
        "acknowledging the anxiety"
      ],
      "seeds": [
        "containment",
        "redesigning the role"
      ],
      "termInfo": {
        "acknowledging the anxiety": {
          "text": "Treating the anxiety as a real and reasonable response to a real situation, rather than something a properly professional nurse should not be feeling."
        },
        "containment": {
          "text": "Bion's term, which Menzies Lyth adopted: an environment structured to actually hold and metabolize anxiety, rather than one that requires it to be denied in order to function."
        },
        "redesigning the role": {
          "text": "Changing the structure of the job itself -- what a nurse's task actually is -- rather than asking the people already in it to cope better with a design nobody chose."
        }
      },
      "info": "What Menzies Lyth argued would actually help, against the popular misreading of her own work as an argument for better staff support."
    }
  ],
  "bridges": [
    {
      "id": "bridge-institutionalized-splitting",
      "term": "institutionalized splitting",
      "clusters": [
        0,
        1
      ],
      "fact": "Splitting starts as something one mind does under pressure -- dividing an unbearable whole into safer, smaller pieces. Menzies Lyth's finding was that the identical move gets built into the institution itself: nursing care is carved into discrete tasks, so that no single nurse holds the whole of any one patient's suffering. Nobody chose this on any given morning. Whoever takes the job inherits the split already made.",
      "info": {
        "text": "The same defensive move -- dividing a threatening whole into manageable pieces -- appearing first in one mind, then built into the structure everyone inherits."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "splitting",
        "task splitting"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-kidney-in-bed-14",
      "term": "the kidney in bed 14",
      "clusters": [
        0,
        1
      ],
      "fact": "Calling a patient by their condition rather than their name is not a failure of compassion. Sustained, undefended contact with another person's suffering and mortality is not something most people can do indefinitely at close range. Shrinking the person down to something smaller and more manageable is what makes staying in the room possible at all -- at a cost measured in exactly what got shrunk.",
      "info": {
        "text": "How unmanageable anxiety about another person's suffering gets handled by making that person smaller -- a condition, a bed number, a task."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "primitive anxiety",
        "depersonalization"
      ]
    },
    {
      "id": "bridge-exit-of-the-capable",
      "term": "exit of the capable",
      "clusters": [
        2,
        3
      ],
      "fact": "Menzies Lyth's report notes, almost in passing, that the most mature nurses -- the ones least willing to let ritual numb what they felt -- were disproportionately the ones who left. That is the one functional response available to someone inside a structure nobody with her position has the power to redesign. Containment would have made staying survivable. Absent it, leaving was the only form the choice could take.",
      "info": {
        "text": "What the most capable people actually did, in the absence of any structural alternative: they left."
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "diffusion of responsibility",
        "redesigning the role"
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
      "id": "nobody-chose",
      "prompt": "Which of these operate below the level of any single person's decision -- inherited by whoever holds the role, rather than chosen by them?",
      "explanation": "Menzies Lyth was careful on this exact point: a social defence is not a psychic defense at large scale. It is something impersonal, built into the role, inherited by whoever fills it rather than chosen by them. These operate below the level of any individual decision. Projection is the excluded case, and the distinction is the one she insisted on -- it is something one particular mind does, not a structure everyone entering the role finds already in place.",
      "targets": [
        "depersonalization",
        "checks and counter-checks",
        "task splitting",
        "diffusion of responsibility",
        "rigidity"
      ],
      "reasons": {
        "checks and counter-checks": "A structure applied to everyone, regardless of who is checking whom.",
        "depersonalization": "Language everyone in the role ends up using, without anyone having decided to.",
        "diffusion of responsibility": "Achieved by the structure itself, not by any one person's choice to share the weight.",
        "rigidity": "A property the whole system acquires over time, not a decision anyone in it makes.",
        "task splitting": "The task list is handed to a new nurse on day one, made by nobody currently doing the work."
      }
    },
    {
      "id": "meant-to-relieve",
      "prompt": "Which of these are things the system does in order to relieve anxiety, rather than a consequence of having done them?",
      "explanation": "Everything Menzies Lyth catalogued here was doing a job: managing anxiety that would otherwise be unbearable to sit with, hour after hour. That the job came at a cost does not mean it wasn't a job. Rigidity is the excluded case, and the distinction matters: it is what these defenses left behind over time, not a further defense anyone deployed on purpose.",
      "targets": [
        "ritual task performance",
        "depersonalization",
        "task splitting",
        "diffusion of responsibility"
      ],
      "reasons": {
        "depersonalization": "Makes repeated contact with suffering bearable by shrinking who is suffering.",
        "diffusion of responsibility": "The direct aim, not merely a side effect: nobody carries a life-or-death judgment alone.",
        "ritual task performance": "Removes the anxiety of judgment by removing the need to judge.",
        "task splitting": "No nurse holds the whole of any one patient's decline, so no nurse holds the whole of what it costs to witness it."
      }
    },
    {
      "id": "the-structure-not-the-person",
      "prompt": "Which of these are about changing the structure itself, rather than something an individual within it could do alone?",
      "explanation": "Menzies Lyth's argument, against her own paper's most common misreading, was that the fix could not be asking worn-down people to cope better with a design nobody chose. It had to be the design itself. Exit of the capable is the excluded case on purpose: leaving is exactly the individual response available when the structure does not change. It is the alternative to redesign, not a form of it -- and it is what the most capable people actually did, absent any other route.",
      "targets": [
        "containment",
        "redesigning the role",
        "acknowledging the anxiety",
        "task splitting"
      ],
      "reasons": {
        "acknowledging the anxiety": "A stance the organisation takes toward what the role provokes, not a coping skill for the person in it.",
        "containment": "An environment built to hold anxiety, which no single nurse can build around herself alone.",
        "redesigning the role": "Names the structural target directly: the job, not the person doing it.",
        "task splitting": "Undoing it is a redesign decision -- restoring whole-patient care is not something one nurse can grant herself."
      }
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "designed-not-to-choose",
      "puzzleRevision": "fnv1a32:9f686583",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:primitive anxiety": {
          "x": 108.04,
          "y": 194.86,
          "pinned": false
        },
        "term:projection": {
          "x": 53.5,
          "y": 278.6,
          "pinned": false
        },
        "term:splitting": {
          "x": 50.35,
          "y": 129.24,
          "pinned": false
        },
        "term:ritual task performance": {
          "x": 344.88,
          "y": 23,
          "pinned": false
        },
        "term:depersonalization": {
          "x": 382.51,
          "y": 168.18,
          "pinned": false
        },
        "term:checks and counter-checks": {
          "x": 539.25,
          "y": 23,
          "pinned": false
        },
        "term:task splitting": {
          "x": 237.38,
          "y": 119.41,
          "pinned": false
        },
        "term:secondary anxiety": {
          "x": 113.39,
          "y": 356.69,
          "pinned": false
        },
        "term:diffusion of responsibility": {
          "x": 266.99,
          "y": 437,
          "pinned": false
        },
        "term:rigidity": {
          "x": 47.2,
          "y": 437,
          "pinned": false
        },
        "term:containment": {
          "x": 583.35,
          "y": 362.08,
          "pinned": false
        },
        "term:redesigning the role": {
          "x": 412.66,
          "y": 332.32,
          "pinned": false
        },
        "term:acknowledging the anxiety": {
          "x": 539.25,
          "y": 211.96,
          "pinned": false
        },
        "term:institutionalized splitting": {
          "x": 107.05,
          "y": 23,
          "pinned": false
        },
        "term:the kidney in bed 14": {
          "x": 251.97,
          "y": 269.95,
          "pinned": false
        },
        "term:exit of the capable": {
          "x": 517.76,
          "y": 437,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 2889.2,
        "score": 2889.1958477387575
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:13:07.678Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "designed-not-to-choose",
      "puzzleRevision": "fnv1a32:9f686583",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 155.58,
          "y": 354.59,
          "pinned": false
        },
        "cluster:1": {
          "x": 393.07,
          "y": 181.44,
          "pinned": false
        },
        "cluster:2": {
          "x": 804.42,
          "y": 281.41,
          "pinned": false
        },
        "cluster:3": {
          "x": 566.93,
          "y": 454.56,
          "pinned": false
        }
      },
      "bridges": {
        "term:institutionalized splitting": {
          "x": 119.11,
          "y": 203.72,
          "pinned": false
        },
        "term:the kidney in bed 14": {
          "x": 370.49,
          "y": 364.18,
          "pinned": false
        },
        "term:exit of the capable": {
          "x": 781.84,
          "y": 464.15,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "primitive anxiety",
          "projection",
          "splitting"
        ],
        "cluster:1": [
          "ritual task performance",
          "depersonalization",
          "checks and counter-checks",
          "task splitting"
        ],
        "cluster:2": [
          "secondary anxiety",
          "diffusion of responsibility",
          "rigidity"
        ],
        "cluster:3": [
          "containment",
          "redesigning the role",
          "acknowledging the anxiety"
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
        "totalLength": 433.39940918637103
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:13:10.362Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "designed-not-to-choose",
      "puzzleRevision": "fnv1a32:9f686583",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:primitive anxiety": {
          "x": 235.54,
          "y": 115.15
        },
        "term:projection": {
          "x": 326.88,
          "y": 22
        },
        "term:splitting": {
          "x": 424.56,
          "y": 112.38
        },
        "term:ritual task performance": {
          "x": 867.55,
          "y": 379.33
        },
        "term:depersonalization": {
          "x": 599.97,
          "y": 331.86
        },
        "term:checks and counter-checks": {
          "x": 715.23,
          "y": 483.14
        },
        "term:task splitting": {
          "x": 895.9,
          "y": 128.32
        },
        "term:secondary anxiety": {
          "x": 434.76,
          "y": 226.81
        },
        "term:diffusion of responsibility": {
          "x": 511.27,
          "y": 598
        },
        "term:rigidity": {
          "x": 551.98,
          "y": 443.71
        },
        "term:containment": {
          "x": 54.65,
          "y": 453.82
        },
        "term:redesigning the role": {
          "x": 83,
          "y": 598
        },
        "term:acknowledging the anxiety": {
          "x": 98.75,
          "y": 290.51
        },
        "term:institutionalized splitting": {
          "x": 715.44,
          "y": 22
        },
        "term:the kidney in bed 14": {
          "x": 574.5,
          "y": 167.68
        },
        "term:exit of the capable": {
          "x": 277.84,
          "y": 533.33
        },
        "cluster:0": {
          "x": 482.94,
          "y": 22
        },
        "cluster:1": {
          "x": 755.32,
          "y": 233.37
        },
        "cluster:2": {
          "x": 437.47,
          "y": 401.12
        },
        "cluster:3": {
          "x": 228.21,
          "y": 475.02
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:13:13.042Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:13:05.376Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
