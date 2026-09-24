// Generated from content/puzzles/octopus-play-adjudication.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "octopus-play-adjudication",
  "title": "Is It Really Play? The Octopus Play Verdict",
  "category": "zoology",
  "info": {
    "text": "Two octopuses can do the same thing for different reasons: curiosity, habit-breaking, or play. This lesson covers how researchers tell play apart — the explicit criteria a behavior must meet, the conditions that suppress it, and why the verdict matters for how we keep and judge captive octopuses.",
    "links": [
      {
        "href": "https://doi.org/10.12966/abc.05.01.2014",
        "label": "Burghardt 2014"
      },
      {
        "href": "https://doi.org/10.1037/0735-7036.120.3.184",
        "label": "Kuba et al. 2006"
      },
      {
        "href": "https://doi.org/10.1371/journal.pone.0326379",
        "label": "Jarmoluk & Pelled 2025"
      }
    ],
    "citations": [
      {
        "title": "A Brief Glimpse at the Long Evolutionary History of Play",
        "author": "Burghardt, G. M.",
        "year": "2014",
        "pages": "1(1)",
        "url": "https://doi.org/10.12966/abc.05.01.2014"
      },
      {
        "title": "When do octopuses play? Effects of repeated testing, object type, age, and food deprivation on object play in Octopus vulgaris",
        "author": "Kuba, M. J., Byrne, R. A., Meisel, D. V. & Mather, J. A.",
        "year": "2006",
        "pages": "120(3), 184 ff.",
        "url": "https://doi.org/10.1037/0735-7036.120.3.184"
      },
      {
        "title": "Evidence of play behavior in captive California two-spot octopuses, Octopus bimaculoides",
        "author": "Jarmoluk, K. & Pelled, G.",
        "year": "2025",
        "pages": "20(7), e0326379",
        "url": "https://doi.org/10.1371/journal.pone.0326379"
      }
    ]
  },
  "clusters": [
    {
      "id": "play-criteria",
      "name": "Is it really play? — the criteria",
      "color": "teal",
      "fact": "Researchers do not call a behavior play because it looks playful: it must meet explicit criteria — not fully functional in context, spontaneous, repeated but not stereotyped, in a fed, healthy, unstressed animal.",
      "terms": [
        "not fully functional",
        "repeated but not stereotyped",
        "spontaneous and voluntary",
        "relaxed field (fed, healthy, unstressed)"
      ],
      "seeds": [
        "not fully functional",
        "repeated but not stereotyped"
      ],
      "termInfo": {
        "not fully functional": {
          "text": "The behavior is incomplete or out of context compared with its functional form — a water jet aimed at a toy, not at prey or an escape route.",
          "links": [
            {
              "href": "https://doi.org/10.12966/abc.05.01.2014",
              "label": "Burghardt 2014"
            }
          ]
        },
        "relaxed field (fed, healthy, unstressed)": {
          "text": "Play is only expected from an animal with no urgent needs — the 'relaxed field' criterion that makes hunger and stress the classic confounds.",
          "links": [
            {
              "href": "https://doi.org/10.12966/abc.05.01.2014",
              "label": "Burghardt 2014"
            }
          ]
        },
        "repeated but not stereotyped": {
          "text": "Play recurs but stays variable; rigid, stereotyped repetition would point to an abnormal behavior instead.",
          "links": [
            {
              "href": "https://doi.org/10.12966/abc.05.01.2014",
              "label": "Burghardt 2014"
            }
          ]
        },
        "spontaneous and voluntary": {
          "text": "The animal does it unprompted and can stop — not shaped by a trainer or compelled by deprivation.",
          "links": [
            {
              "href": "https://doi.org/10.12966/abc.05.01.2014",
              "label": "Burghardt 2014"
            }
          ]
        }
      },
      "info": {
        "text": "These are Burghardt's five-criteria bar, summarized to four ideas; Kuba et al. scored 'play-like' (level 3) versus 'play' (level 4) against it.",
        "links": [
          {
            "href": "https://doi.org/10.12966/abc.05.01.2014",
            "label": "Burghardt 2014"
          },
          {
            "href": "https://doi.org/10.1037/0735-7036.120.3.184",
            "label": "Kuba et al. 2006"
          }
        ]
      }
    },
    {
      "id": "variation",
      "name": "Who plays, and when",
      "color": "blue",
      "fact": "Play is patchy, not a species trait: only some individuals ever show it, and its appearance shifts with object type, age, repeated testing, and hunger.",
      "terms": [
        "individual differences in playfulness",
        "food deprivation suppresses play",
        "object type (floating beats static)",
        "age effects"
      ],
      "seeds": [
        "individual differences in playfulness",
        "food deprivation suppresses play"
      ],
      "termInfo": {
        "age effects": {
          "text": "Play-like interaction changed with age in the 2006 study, so life stage is a variable to control, not noise.",
          "links": [
            {
              "href": "https://doi.org/10.1037/0735-7036.120.3.184",
              "label": "Kuba et al. 2006"
            }
          ]
        },
        "food deprivation suppresses play": {
          "text": "Hunger reduced play in the 2006 experiments — so a negative result can reflect the animal's state, not its ability.",
          "links": [
            {
              "href": "https://doi.org/10.1037/0735-7036.120.3.184",
              "label": "Kuba et al. 2006"
            }
          ]
        },
        "individual differences in playfulness": {
          "text": "Only some octopuses ever played: 2 of 8 in 1999 and 9 of 14 in 2006. Capacity may be species-wide; expression is individual.",
          "links": [
            {
              "href": "https://doi.org/10.1037/0735-7036.120.3.184",
              "label": "Kuba et al. 2006"
            }
          ]
        },
        "object type (floating beats static)": {
          "text": "Objects that float or respond to water jets invite play; static objects rarely do — object choice is part of the experimental design.",
          "links": [
            {
              "href": "https://doi.org/10.1037/0735-7036.120.3.184",
              "label": "Kuba et al. 2006"
            }
          ]
        }
      },
      "info": {
        "text": "The 2006 study manipulated repeated testing, object type, age, and food deprivation — the variables this cluster names.",
        "links": [
          {
            "href": "https://doi.org/10.1037/0735-7036.120.3.184",
            "label": "Kuba et al. 2006"
          }
        ]
      }
    },
    {
      "id": "stakes",
      "name": "Why it matters",
      "color": "amber",
      "fact": "Documented play is read as evidence about cognitive flexibility and positive affective states, and it shapes enrichment and welfare practice for captive cephalopods.",
      "terms": [
        "cognitive flexibility",
        "environmental enrichment",
        "positive affect",
        "captive cephalopod welfare"
      ],
      "seeds": [
        "cognitive flexibility",
        "environmental enrichment"
      ],
      "termInfo": {
        "captive cephalopod welfare": {
          "text": "Documented play supports welfare arguments for captive cephalopods — enrichment practice, tank design, and how keeping them is justified.",
          "links": [
            {
              "href": "https://doi.org/10.1371/journal.pone.0326379",
              "label": "Jarmoluk & Pelled 2025"
            }
          ]
        },
        "cognitive flexibility": {
          "text": "Play is read as evidence that an animal can remix behavior without immediate payoff — a marker of flexible cognition in an invertebrate.",
          "links": [
            {
              "href": "https://doi.org/10.1371/journal.pone.0326379",
              "label": "Jarmoluk & Pelled 2025"
            }
          ]
        },
        "environmental enrichment": {
          "text": "Objects that invite exploration and play are standard enrichment, judged partly by whether they draw playful contact.",
          "links": [
            {
              "href": "https://doi.org/10.1371/journal.pone.0326379",
              "label": "Jarmoluk & Pelled 2025"
            }
          ]
        },
        "positive affect": {
          "text": "Play increases with positive affect and is read back as a sign of it — one of the few windows onto octopus mood.",
          "links": [
            {
              "href": "https://doi.org/10.1371/journal.pone.0326379",
              "label": "Jarmoluk & Pelled 2025"
            }
          ]
        }
      },
      "info": {
        "text": "The 2025 California two-spot study frames play through affect and welfare — the newest chapter of the argument.",
        "links": [
          {
            "href": "https://doi.org/10.1371/journal.pone.0326379",
            "label": "Jarmoluk & Pelled 2025"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "unmet-criteria",
      "term": "when the criteria aren't met",
      "clusters": [
        0,
        1
      ],
      "fact": "Hunger, stress, the wrong object, or the wrong age can suppress play without disproving the capacity — which is why a negative result under uncontrolled conditions is weak evidence.",
      "info": {
        "text": "The relaxed-field criterion pairs with the measured effects of food deprivation, object type, age, and repeated testing.",
        "links": [
          {
            "href": "https://doi.org/10.12966/abc.05.01.2014",
            "label": "Burghardt 2014, Anim. Behav. Cogn."
          },
          {
            "href": "https://doi.org/10.1037/0735-7036.120.3.184",
            "label": "Kuba et al. 2006, J. Comp. Psychol. 120(3)"
          }
        ]
      }
    },
    {
      "id": "welfare-signal",
      "term": "patchy play as a welfare signal",
      "clusters": [
        1,
        2
      ],
      "fact": "Because play appears only in some individuals and only under good conditions, its presence is read as a sign of positive affect and used to judge enrichment in captive octopuses (Jarmoluk & Pelled 2025).",
      "info": {
        "text": "Jarmoluk & Pelled document object play in captive California two-spot octopuses and frame it through affect and welfare.",
        "links": [
          {
            "href": "https://doi.org/10.1371/journal.pone.0326379",
            "label": "Jarmoluk & Pelled 2025, PLOS One 20(7)"
          }
        ]
      },
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "criteria-vs-findings",
      "prompt": "Which of these are the bar a behavior must clear to count as play at all — rather than a finding about when the bar is met?",
      "explanation": "These four ideas are the definitional bar; everything else on the table is a finding about when the bar happens to be met.",
      "targets": [
        "not fully functional",
        "repeated but not stereotyped",
        "spontaneous and voluntary",
        "relaxed field (fed, healthy, unstressed)"
      ],
      "reasons": {
        "not fully functional": "The behavior must be incomplete or out of context.",
        "relaxed field (fed, healthy, unstressed)": "No urgent needs — the precondition for expecting play.",
        "repeated but not stereotyped": "It recurs, but stays variable.",
        "spontaneous and voluntary": "Unprompted, and the animal can stop."
      }
    },
    {
      "id": "hunger-two-sides",
      "prompt": "Hunger appears on both sides of the play verdict. Which two terms name its two roles — the criterion it can violate, and the finding it produced?",
      "explanation": "Hunger is both a criterion violation and a measured effect: that double role is exactly why negative results under uncontrolled conditions prove little.",
      "targets": [
        "relaxed field (fed, healthy, unstressed)",
        "food deprivation suppresses play"
      ],
      "reasons": {
        "food deprivation suppresses play": "The measured finding from the 2006 experiments.",
        "relaxed field (fed, healthy, unstressed)": "The criterion hunger violates: no urgent needs."
      }
    },
    {
      "id": "not-a-species-trait",
      "prompt": "Which finding most directly blocks calling play a species trait — same species, same objects, but only some individuals ever played?",
      "explanation": "Only some individuals ever played — 2 of 8 in 1999 and 9 of 14 in 2006 — so expression is individual even if capacity is species-wide.",
      "targets": [
        "individual differences in playfulness"
      ],
      "reasons": {
        "individual differences in playfulness": "Patchy expression across individuals is the direct counterexample."
      }
    },
    {
      "id": "what-verdict-is-for",
      "prompt": "Which two terms name what a play verdict gets read as — the capacity it evidences and the state it reflects?",
      "explanation": "A documented play verdict is evidence of flexible cognition and a window onto positive affective states — the reasons the verdict is worth fighting about.",
      "targets": [
        "cognitive flexibility",
        "positive affect"
      ],
      "reasons": {
        "cognitive flexibility": "Remixing behavior without payoff suggests flexible cognition.",
        "positive affect": "Play both reflects and increases positive states."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Board 1 follows what an octopus actually does with a new object — taste it, study it, lose interest, and sometimes play. Board 2 asks how researchers know that last step is really play: the explicit criteria, the conditions that suppress it, and why the verdict matters for cognition and welfare."
    },
    "entries": [
      {
        "id": "octopus-play-stages",
        "reason": "Start here: board 1 follows what the octopus actually does with a new object — the behavior this board adjudicates."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Play is a verdict, not a look",
    "summary": "Why scientists need explicit criteria — and controlled conditions — before calling what an octopus does 'play', and what the verdict is used for once earned.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "When an octopus repeatedly jetted a pill bottle back across its tank, researchers faced a problem: the behavior looked like play, and animal behavior has a long history of overreading animals — projecting our own playfulness onto instinct. The solution was a checklist.\n\nGordon Burghardt's criteria ask a behavior to earn the word: incomplete or exaggerated relative to its functional form, spontaneous and voluntary, repeated but not stereotyped, and performed by an animal that is fed, healthy, and unstressed. Common octopuses batting Lego pieces cleared that bar in 2006 — some of them: nine of fourteen, under particular conditions. The strictness cuts the other way too. A hungry octopus that ignores its toys has not been shown unable to play. This lesson is about the verdict and its fine print — and about what a documented play verdict is then used for, from reading octopus mood to judging whether captive animals are truly doing well."
    },
    "links": [
      {
        "href": "https://doi.org/10.12966/abc.05.01.2014",
        "label": "Burghardt 2014, Anim. Behav. Cogn."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode"
      }
    ]
  }
});
