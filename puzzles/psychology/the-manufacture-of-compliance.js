// Generated from content/puzzles/the-manufacture-of-compliance.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-manufacture-of-compliance",
  "title": "The Manufacture of Compliance",
  "category": "Psychology",
  "categories": [
    "Psychology",
    "History & Society"
  ],
  "tags": [
    "war",
    "genocide"
  ],
  "info": {
    "text": "How an ordinary, non-ideological police unit came to carry out a massacre once ordered -- and how the choice to comply, once made, got easier to make again with each repetition.",
    "links": [
      {
        "href": "wiki:Reserve Police Battalion 101"
      }
    ],
    "citations": [
      {
        "title": "Ordinary Men: Reserve Police Battalion 101 and the Final Solution in Poland",
        "author": "Browning, Christopher R.",
        "publisher": "HarperCollins",
        "year": "1992"
      }
    ]
  },
  "clusters": [
    {
      "id": "ordinary-men",
      "name": "Ordinary Men",
      "color": "brown",
      "fact": "At the battalion's first mass shooting, at Jozefow on July 13, 1942, Major Wilhelm Trapp offered any of his nearly five hundred men who didn't feel up to the task a chance to step out; after a tense pause, one man did, followed by ten or twelve more. Most stayed in the killing squads -- worried, some later admitted, about being seen as a coward by their comrades rather than about the offer itself, which several later claimed not to have heard at all.",
      "terms": [
        "conformity to the group",
        "the option to refuse",
        "career pressure",
        "Reserve Police Battalion 101",
        "the minority who refused"
      ],
      "seeds": [
        "conformity to the group",
        "the option to refuse"
      ],
      "termInfo": {
        "Reserve Police Battalion 101": {
          "text": "A German Order Police unit of reservists -- mostly working-class men in their thirties and forties, many too old for regular military service -- that became a major perpetrator of mass shootings in occupied Poland.",
          "links": [
            {
              "href": "wiki:Reserve Police Battalion 101"
            }
          ]
        },
        "career pressure": {
          "text": "Worry that visible refusal would look like cowardice or damage standing with comrades and superiors -- a concern several men cited as their real reason for shooting, separate from believing the order was justified."
        },
        "conformity to the group": {
          "text": "Pressure to match the behavior of one's comrades rather than stand out -- several men later admitted they took part because they didn't want to be seen as a coward, not because they believed the killing was right.",
          "links": [
            {
              "href": "wiki:Conformity"
            }
          ]
        },
        "the minority who refused": {
          "text": "Roughly a dozen of the nearly five hundred men present at Jozefow stepped forward when given the chance, and faced no punishment for it -- going on to serve the battalion in other roles."
        },
        "the option to refuse": {
          "text": "Major Wilhelm Trapp's explicit offer, before the battalion's first mass shooting, that any man who didn't feel up to it could step out with no threat of punishment -- an offer he did not repeat at later massacres.",
          "links": [
            {
              "href": "wiki:Reserve Police Battalion 101"
            }
          ]
        }
      },
      "info": {
        "text": "A historical case study of an ordinary police unit given an explicit choice about whether to take part in a mass shooting, and what most of its members did with that choice.",
        "links": [
          {
            "href": "wiki:Reserve Police Battalion 101"
          }
        ]
      }
    },
    {
      "id": "the-ratchet",
      "name": "The Ratchet",
      "color": "magenta",
      "fact": "Browning's own conclusion, after tracking the battalion across more than a dozen further actions: most men found each subsequent killing easier to carry out than the one before, not because what they were doing weighed any less, but because the resistance it would have taken to refuse again had already worn down the first time they didn't.",
      "terms": [
        "incremental participation",
        "eroding resistance",
        "escalating commitment",
        "undiminished responsibility"
      ],
      "seeds": [
        "incremental participation",
        "eroding resistance"
      ],
      "termInfo": {
        "eroding resistance": {
          "text": "The capacity to refuse doesn't switch off all at once -- it wears down with each repetition, distinct from the moral weight of what's being done, which doesn't wear down the same way.",
          "links": [
            {
              "href": "wiki:Habituation"
            }
          ]
        },
        "escalating commitment": {
          "text": "The pull to keep justifying what's already been done rather than break with it -- the same sunk-cost logic that makes a course of action harder to walk away from the more one has already invested in it.",
          "links": [
            {
              "href": "wiki:Escalation of commitment"
            }
          ]
        },
        "incremental participation": {
          "text": "Killing became easier as the battalion moved from a single, explicitly announced first order to routine, repeated actions -- each one a little more familiar and procedural than the last, less of a first time.",
          "links": [
            {
              "href": "wiki:Foot-in-the-door technique"
            }
          ]
        },
        "undiminished responsibility": {
          "text": "The claim that moral responsibility for each act does not shrink as participation continues, even though the psychological cost of refusing keeps rising.",
          "links": [
            {
              "href": "wiki:Moral responsibility"
            }
          ]
        }
      },
      "info": {
        "text": "The mechanism by which repeated participation makes further participation easier, independent of whether what's being done becomes any less serious.",
        "links": [
          {
            "href": "wiki:Escalation of commitment"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "term": "moral disengagement",
      "clusters": [
        0,
        1
      ],
      "fact": "Bandura's moral disengagement mechanisms are what let conformity harden into a private, bearable account of one's own conduct -- and each time the same account gets used, it does more than excuse a single act: it wears down the resistance that refusing again would require.",
      "info": {
        "text": "The cognitive process that lets a person violate their own moral standards without feeling like they have.",
        "links": [
          {
            "href": "wiki:Moral disengagement"
          }
        ]
      },
      "conceptId": "moral-disengagement",
      "termRole": "reference",
      "relationKind": "dynamic",
      "idealTerms": [
        "conformity to the group",
        "eroding resistance"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "term": "the persistence of choice",
      "clusters": [
        0,
        1
      ],
      "fact": "The minority acted under the same order, the same offer, and the same absence of punishment as everyone else -- proof that the choice stayed open the entire time, which is exactly what makes it possible to say responsibility never actually diminished, only the willingness to exercise it.",
      "info": {
        "text": "Same order, same offer, same absence of punishment -- for everyone."
      },
      "termRole": "connector",
      "relationKind": "evaluation",
      "idealTerms": [
        "the minority who refused",
        "undiminished responsibility"
      ]
    }
  ],
  "lenses": [
    {
      "id": "the-case-against-no-choice",
      "prompt": "Which concepts stand as evidence that refusing remained genuinely possible throughout, rather than something the situation had already foreclosed?",
      "explanation": "None of these are claims made from outside the case. An offer was actually made, a minority actually took it without punishment, and the claim that responsibility never diminished only holds because both of those are true. Together they rule out the easiest excuse for what the majority did -- that there was no real choice on the table.",
      "targets": [
        "the option to refuse",
        "the minority who refused",
        "undiminished responsibility",
        "the persistence of choice"
      ],
      "reasons": {
        "the option to refuse": "The offer itself is the starting fact the rest of this lens depends on -- it was real, not assumed.",
        "the persistence of choice": "States directly what the minority's example proves: the choice never actually closed."
      }
    },
    {
      "id": "how-compliance-compounds",
      "prompt": "Which concepts describe the specific mechanism by which one act of compliance makes the next one easier, rather than explaining why the first act happened at all?",
      "explanation": "Conformity and career pressure explain why the first shooting happened. These four explain something different: why the second, and the twentieth, came easier -- not because the act weighed less, but because repetition wore down the resistance, reinforced it with sunk-cost logic, and let the same excuse get reused with less effort each time.",
      "targets": [
        "incremental participation",
        "eroding resistance",
        "escalating commitment",
        "moral disengagement"
      ],
      "reasons": {
        "moral disengagement": "The same excusing mechanism, reused, is part of what wears resistance down further with each repetition."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "moral-disengagement-and-moral-inversion",
        "reason": "This puzzle names the mechanism; follow it into Bandura's full framework -- the specific cognitive moves that let people excuse harmful conduct without giving up their own moral standards elsewhere.",
        "via": [
          "moral disengagement"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Before You Begin",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Historians studying the perpetrators of mass atrocity keep running into the same uncomfortable finding: most of the people who carried it out were not exceptional in any obvious sense beforehand. They were reservists, clerks, family men -- ordinary by every available measure except what they went on to do.\n\nThat finding gets misread in two opposite directions. Read one way, it excuses: if almost anyone might have done the same thing in the same circumstances, then perhaps no single person bears full responsibility for what they did. Read the other way, it moralizes: surely there was something different, something worse, about the ones who actually pulled the trigger. Neither reading survives contact with the evidence. Some people, given the exact same order and the exact same chance to step back, did. Most didn't -- and for most of them, each time made the next time a little easier.\n\nAs you work through this, notice what actually kept the choice open, and what happened, inside the people who didn't take it, with every repetition."
    },
    "revision": 1
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
