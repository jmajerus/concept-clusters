// Generated from content/puzzles/the-quiet-rebellion.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-quiet-rebellion",
  "title": "The Quiet Rebellion",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science",
    "history-society"
  ],
  "subcategories": {
    "peace-conflict-studies": "nonviolence-civil-resistance"
  },
  "info": {
    "text": "Mulford Q. Sibley, University of Minnesota political theorist, Quaker conscientious objector, and self-described democratic socialist, whose 611-page history of political thought running from Plato to Marx was itself evidence that his McCarthy-era arguments for pacifism, civil disobedience, and utopian thought as serious political theory came from someone who commanded the whole tradition, not from someone speaking outside it.",
    "links": [
      {
        "href": "wiki:Mulford Q. Sibley"
      }
    ],
    "citations": [
      {
        "title": "Political Ideas and Ideologies: A History of Political Thought",
        "author": "Mulford Q. Sibley",
        "publisher": "Harper & Row",
        "year": "1970"
      },
      {
        "title": "The Political Theories of Modern Pacifism: An Analysis and Criticism",
        "author": "Mulford Q. Sibley",
        "publisher": "Pacifist Research Bureau",
        "year": "1944"
      },
      {
        "title": "Conscription of Conscience: The American State and the Conscientious Objector, 1940-1947",
        "author": "Mulford Q. Sibley and Philip E. Jacob",
        "publisher": "Cornell University Press",
        "year": "1952"
      },
      {
        "title": "The Obligation to Disobey: Conscience and the Law",
        "author": "Mulford Q. Sibley",
        "publisher": "Council on Religion and International Affairs",
        "year": "1970"
      }
    ]
  },
  "clusters": [
    {
      "id": "kinds-of-pacifism",
      "name": "Kinds of Pacifism",
      "color": "teal",
      "fact": "Sibley's own scholarly project treated pacifism not as one position but a family of political theories: religious pacifism grounds refusal in a theological conviction -- his own tradition's peace testimony among them, alongside traditions as different as Hindu pacifism -- while political pacifism argues against violence on strategic, not devotional, grounds: that nonviolence simply works better.",
      "terms": [
        "religious pacifism",
        "political pacifism",
        "the peace testimony",
        "Hindu pacifism"
      ],
      "seeds": [
        "religious pacifism",
        "political pacifism"
      ],
      "termInfo": {
        "the peace testimony": {
          "links": [
            {
              "href": "wiki:Testimony of peace"
            }
          ]
        }
      },
      "info": {
        "text": "Sibley's scholarly typology of twentieth-century pacifism, distinguishing traditions grounded in religious conviction from a separate, strategically-argued political pacifism.",
        "links": [
          {
            "href": "wiki:Mulford Q. Sibley"
          }
        ]
      }
    },
    {
      "id": "the-state-and-the-objector",
      "name": "The State and the Objector",
      "color": "brown",
      "fact": "Sibley's own WWII record supplied the raw material for Conscription of Conscience, his study with Philip Jacob of how the American state actually sorted its objectors: some accepted noncombatant service inside the military itself, some performed alternative civilian service instead, and a further, smaller group refused to cooperate with the whole apparatus at all and went to prison rather than accept any state-assigned alternative.",
      "terms": [
        "conscientious objector",
        "alternative civilian service",
        "noncombatant service",
        "absolutist refusal"
      ],
      "seeds": [
        "conscientious objector",
        "alternative civilian service"
      ],
      "info": {
        "text": "The real, unequal tracks the WWII draft system actually sorted objectors into, documented by Sibley's own study of the American state's machinery for conscientious objection.",
        "links": [
          {
            "href": "wiki:Conscientious objector"
          }
        ]
      }
    },
    {
      "id": "conscience-law-and-the-academy",
      "name": "Conscience, Law, and the Academy",
      "color": "magenta",
      "fact": "Sibley's own career put these commitments on public display at the University of Minnesota: he argued conscience could create a positive obligation to disobey unjust law, not just a private excuse from it, wore a red tie as an open declaration of his own democratic socialism, taught utopian political thought as a serious rather than merely wishful genre, and as faculty advisor to the Student Peace Union became the subject of an actual, if ultimately unsuccessful, legislative investigation into communist influence on campus.",
      "terms": [
        "the obligation to disobey",
        "democratic socialism",
        "utopian political thought",
        "the Student Peace Union"
      ],
      "seeds": [
        "the obligation to disobey",
        "democratic socialism"
      ],
      "info": {
        "text": "Sibley's own career-long insistence that conscience, utopian thinking, and open democratic-socialist commitment all belonged inside, not outside, serious political life and a university's own faculty.",
        "links": [
          {
            "href": "wiki:Mulford Q. Sibley"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-how-far-to-go",
      "term": "how far to go",
      "clusters": [
        0,
        1
      ],
      "fact": "Sibley's own typology maps onto real choices, not just abstract stances: absolutist refusal -- rejecting the state's alternative-service compromise altogether -- tends to track an uncompromising religious pacifism, while accepting alternative civilian service can just as easily reflect a political pacifist's calculation about what nonviolent cooperation can still accomplish within a system one otherwise rejects.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-beyond-compliance",
      "term": "beyond compliance",
      "clusters": [
        2,
        1
      ],
      "fact": "Absolutist refusal is what the obligation to disobey looks like in practice: for Sibley, conscience was not simply a private excuse allowing quiet noncompliance with an unjust law, but a positive duty to resist -- publicly, and at real cost, exactly as the objectors who chose prison over any accommodation did.",
      "relationKind": "dynamic",
      "idealTerms": [
        "the obligation to disobey",
        "absolutist refusal"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "bridge-taken-seriously",
      "term": "taken seriously",
      "clusters": [
        0,
        2
      ],
      "fact": "The same intellectual move runs through both projects: just as Sibley insisted pacifism was a family of real political theories rather than a naive impulse to dismiss, he taught utopian political thought as a genuine, serious mode of theorizing about what politics could be, rather than a wishful genre unworthy of a political scientist's attention.",
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "unconditional-regardless-of-outcome",
      "prompt": "Which of these hold regardless of whether they actually work, rather than being justified by a calculation about political effectiveness?",
      "explanation": "Religious pacifism, absolutist refusal, and the obligation to disobey all share the same shape: each holds regardless of whether it works. Religious pacifism grounds refusal in theological conviction rather than a calculation about outcomes; absolutist refusal rejects even a workable compromise -- alternative service -- because compromise itself was the problem; and the obligation to disobey names conscience as a duty binding a person whether or not disobedience actually changes the law.",
      "targets": [
        "religious pacifism",
        "absolutist refusal",
        "the obligation to disobey"
      ],
      "reasons": {
        "absolutist refusal": "Rejects even a workable compromise, because compromising with an unjust system was itself the problem.",
        "religious pacifism": "Grounded in theological conviction rather than a claim about what actually reduces violence in the world.",
        "the obligation to disobey": "A duty that binds a person whether or not their disobedience actually succeeds in changing anything."
      }
    },
    {
      "id": "dismissed-as-impractical",
      "prompt": "Which of these were widely dismissed by mainstream political science as naive or impractical -- a dismissal Sibley spent his career arguing against?",
      "explanation": "Utopian political thought, political pacifism, and absolutist refusal all carried the same reputation in mid-century American political science: unserious, unrealistic, unworthy of the same rigorous analysis given to statecraft or strategy. Sibley -- writing during the McCarthy era, when even holding these positions was professionally risky -- treated all three as real political theory and real political choices, deserving exactly that rigor rather than dismissal.",
      "targets": [
        "utopian political thought",
        "political pacifism",
        "absolutist refusal"
      ],
      "reasons": {
        "absolutist refusal": "Commonly dismissed as a quixotic gesture that changes nothing.",
        "political pacifism": "Commonly dismissed as naive about what force can actually accomplish.",
        "utopian political thought": "Commonly dismissed as wishful thinking rather than serious political theorizing."
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
      "puzzleId": "the-quiet-rebellion",
      "puzzleRevision": "fnv1a32:1ab74b48",
      "board": {
        "width": 640,
        "height": 460
      },
      "nodes": {
        "term:religious pacifism": {
          "x": 456.09,
          "y": 177.92,
          "pinned": false
        },
        "term:political pacifism": {
          "x": 561.3,
          "y": 107.49,
          "pinned": false
        },
        "term:the peace testimony": {
          "x": 558.15,
          "y": 270.22,
          "pinned": false
        },
        "term:Hindu pacifism": {
          "x": 508.83,
          "y": 23,
          "pinned": false
        },
        "term:conscientious objector": {
          "x": 263.51,
          "y": 65.43,
          "pinned": false
        },
        "term:alternative civilian service": {
          "x": 114.99,
          "y": 171.38,
          "pinned": false
        },
        "term:noncombatant service": {
          "x": 85,
          "y": 23,
          "pinned": false
        },
        "term:absolutist refusal": {
          "x": 305.55,
          "y": 131.43,
          "pinned": false
        },
        "term:the obligation to disobey": {
          "x": 278.5,
          "y": 309.22,
          "pinned": false
        },
        "term:democratic socialism": {
          "x": 555,
          "y": 437,
          "pinned": false
        },
        "term:utopian political thought": {
          "x": 156.24,
          "y": 437,
          "pinned": false
        },
        "term:the Student Peace Union": {
          "x": 383.24,
          "y": 437,
          "pinned": false
        },
        "term:how far to go": {
          "x": 380.14,
          "y": 23,
          "pinned": false
        },
        "term:beyond compliance": {
          "x": 75.55,
          "y": 341.38,
          "pinned": false
        },
        "term:taken seriously": {
          "x": 451.71,
          "y": 327.27,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3269.45,
        "score": 3269.453124874271
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:21:14.192Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-quiet-rebellion",
      "puzzleRevision": "fnv1a32:1ab74b48",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 480,
          "y": 200.65,
          "pinned": false
        },
        "cluster:1": {
          "x": 710.7,
          "y": 376.68,
          "pinned": false
        },
        "cluster:2": {
          "x": 249.3,
          "y": 376.68,
          "pinned": false
        }
      },
      "bridges": {
        "term:how far to go": {
          "x": 668.89,
          "y": 215.12,
          "pinned": false
        },
        "term:beyond compliance": {
          "x": 480,
          "y": 376.68,
          "pinned": false
        },
        "term:taken seriously": {
          "x": 268.48,
          "y": 192.5,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "religious pacifism",
          "political pacifism",
          "the peace testimony",
          "Hindu pacifism"
        ],
        "cluster:1": [
          "conscientious objector",
          "alternative civilian service",
          "noncombatant service",
          "absolutist refusal"
        ],
        "cluster:2": [
          "the obligation to disobey",
          "democratic socialism",
          "utopian political thought",
          "the Student Peace Union"
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
        "totalLength": 416.1123747277932
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:21:17.681Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-quiet-rebellion",
      "puzzleRevision": "fnv1a32:1ab74b48",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:religious pacifism": {
          "x": 368.96,
          "y": 598
        },
        "term:political pacifism": {
          "x": 132.07,
          "y": 598
        },
        "term:the peace testimony": {
          "x": 79.85,
          "y": 439.9
        },
        "term:Hindu pacifism": {
          "x": 202.77,
          "y": 346.91
        },
        "term:conscientious objector": {
          "x": 100.48,
          "y": 216.83
        },
        "term:alternative civilian service": {
          "x": 174.87,
          "y": 22
        },
        "term:noncombatant service": {
          "x": 379.37,
          "y": 22
        },
        "term:absolutist refusal": {
          "x": 500.94,
          "y": 140.17
        },
        "term:the obligation to disobey": {
          "x": 687.98,
          "y": 152.48
        },
        "term:democratic socialism": {
          "x": 845.34,
          "y": 285.38
        },
        "term:utopian political thought": {
          "x": 861.25,
          "y": 478.46
        },
        "term:the Student Peace Union": {
          "x": 699.47,
          "y": 598
        },
        "term:how far to go": {
          "x": 338.37,
          "y": 372.51
        },
        "term:beyond compliance": {
          "x": 464,
          "y": 298
        },
        "term:taken seriously": {
          "x": 461.16,
          "y": 450.83
        },
        "cluster:0": {
          "x": 249.72,
          "y": 488.52
        },
        "cluster:1": {
          "x": 304.25,
          "y": 200.93
        },
        "cluster:2": {
          "x": 652.16,
          "y": 381.16
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:21:20.519Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:21:11.100Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
