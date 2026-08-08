// Generated from content/puzzles/designed-not-to-choose.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "designed-not-to-choose",
  "title": "Designed not to choose",
  "category": "Philosophy & Social Science",
  "tags": [
    "book"
  ],
  "info": {
    "citations": [
      {
        "author": "Isabel E. P. Menzies",
        "pages": "pp. 95-121",
        "publisher": "Human Relations, vol. 13",
        "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
        "year": "1960"
      }
    ],
    "text": "Isabel Menzies Lyth's study of a nursing service under strain, and the discovery that an institution can restructure itself -- without anyone deciding to -- so that the anxiety which would otherwise force a choice gets absorbed by the structure before any single person has to make one."
  },
  "lenses": [
    {
      "explanation": "Menzies Lyth was careful on this exact point: a social defence is not a psychic defense at large scale. It is something impersonal, built into the role, inherited by whoever fills it rather than chosen by them. These operate below the level of any individual decision. Projection is the excluded case, and the distinction is the one she insisted on -- it is something one particular mind does, not a structure everyone entering the role finds already in place.",
      "id": "nobody-chose",
      "prompt": "Which of these operate below the level of any single person's decision -- inherited by whoever holds the role, rather than chosen by them?",
      "reasons": {
        "checks and counter-checks": "A structure applied to everyone, regardless of who is checking whom.",
        "depersonalization": "Language everyone in the role ends up using, without anyone having decided to.",
        "diffusion of responsibility": "Achieved by the structure itself, not by any one person's choice to share the weight.",
        "rigidity": "A property the whole system acquires over time, not a decision anyone in it makes.",
        "task splitting": "The task list is handed to a new nurse on day one, made by nobody currently doing the work."
      },
      "targets": [
        "depersonalization",
        "checks and counter-checks",
        "task splitting",
        "diffusion of responsibility",
        "rigidity"
      ]
    },
    {
      "explanation": "Everything Menzies Lyth catalogued here was doing a job: managing anxiety that would otherwise be unbearable to sit with, hour after hour. That the job came at a cost does not mean it wasn't a job. Rigidity is the excluded case, and the distinction matters: it is what these defenses left behind over time, not a further defense anyone deployed on purpose.",
      "id": "meant-to-relieve",
      "prompt": "Which of these are things the system does in order to relieve anxiety, rather than a consequence of having done them?",
      "reasons": {
        "depersonalization": "Makes repeated contact with suffering bearable by shrinking who is suffering.",
        "diffusion of responsibility": "The direct aim, not merely a side effect: nobody carries a life-or-death judgment alone.",
        "ritual task performance": "Removes the anxiety of judgment by removing the need to judge.",
        "task splitting": "No nurse holds the whole of any one patient's decline, so no nurse holds the whole of what it costs to witness it."
      },
      "targets": [
        "ritual task performance",
        "depersonalization",
        "task splitting",
        "diffusion of responsibility"
      ]
    },
    {
      "explanation": "Menzies Lyth's argument, against her own paper's most common misreading, was that the fix could not be asking worn-down people to cope better with a design nobody chose. It had to be the design itself. Exit of the capable is the excluded case on purpose: leaving is exactly the individual response available when the structure does not change. It is the alternative to redesign, not a form of it -- and it is what the most capable people actually did, absent any other route.",
      "id": "the-structure-not-the-person",
      "prompt": "Which of these are about changing the structure itself, rather than something an individual within it could do alone?",
      "reasons": {
        "acknowledging the anxiety": "A stance the organisation takes toward what the role provokes, not a coping skill for the person in it.",
        "containment": "An environment built to hold anxiety, which no single nurse can build around herself alone.",
        "redesigning the role": "Names the structural target directly: the job, not the person doing it.",
        "task splitting": "Undoing it is a redesign decision -- restoring whole-patient care is not something one nurse can grant herself."
      },
      "targets": [
        "containment",
        "redesigning the role",
        "acknowledging the anxiety",
        "task splitting"
      ]
    }
  ],
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
      "info": {
        "citations": [
          {
            "author": "Isabel E. P. Menzies",
            "pages": "pp. 95-121",
            "publisher": "Human Relations, vol. 13",
            "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
            "year": "1960"
          }
        ],
        "text": "The primitive, Kleinian-rooted anxiety that intimate contact with suffering and death stirs up, and the individual mind's own old defenses against feeling the whole of it."
      }
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
      "info": {
        "citations": [
          {
            "author": "Isabel E. P. Menzies",
            "pages": "pp. 95-121",
            "publisher": "Human Relations, vol. 13",
            "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
            "year": "1960"
          }
        ],
        "text": "The impersonal, structural defenses built into the role itself -- inherited by whoever fills it, chosen by no one currently in it."
      }
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
      "info": {
        "citations": [
          {
            "author": "Isabel E. P. Menzies",
            "pages": "pp. 95-121",
            "publisher": "Human Relations, vol. 13",
            "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
            "year": "1960"
          }
        ],
        "text": "What the defenses actually produced, measured against what they were meant to produce: not less anxiety, but a system generating more of it, and getting more rigid as it did."
      }
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
      "info": {
        "citations": [
          {
            "author": "Isabel E. P. Menzies",
            "pages": "pp. 95-121",
            "publisher": "Human Relations, vol. 13",
            "title": "A Case Study in the Functioning of Social Systems as a Defence against Anxiety: A Report on a Study of the Nursing Service of a General Hospital",
            "year": "1960"
          }
        ],
        "text": "What Menzies Lyth argued would actually help, against the popular misreading of her own work as an argument for better staff support."
      }
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
      "relationKind": "dynamic",
      "info": {
        "text": "The same defensive move -- dividing a threatening whole into manageable pieces -- appearing first in one mind, then built into the structure everyone inherits."
      },
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
      "relationKind": "dynamic",
      "info": {
        "text": "How unmanageable anxiety about another person's suffering gets handled by making that person smaller -- a condition, a bed number, a task."
      },
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
      "relationKind": "dynamic",
      "info": {
        "text": "What the most capable people actually did, in the absence of any structural alternative: they left."
      },
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
  ]
});
