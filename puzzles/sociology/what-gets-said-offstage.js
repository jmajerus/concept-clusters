// Generated from content/puzzles/what-gets-said-offstage.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "what-gets-said-offstage",
  "title": "What gets said offstage",
  "category": "Sociology",
  "large": true,
  "tags": [
    "book"
  ],
  "info": {
    "text": "James Scott's account of what happens to dissent under conditions where open confrontation is too costly to risk -- from small, deniable acts of everyday resistance to the disguised, half-public forms that let a hidden truth travel further than a name attached to it ever could.",
    "title": "What gets said offstage"
  },
  "lenses": [
    {
      "explanation": "Everything targeted here has a built-in exit: if challenged, the person responsible can credibly claim it meant something else, or that no one in particular said it at all. That deniability is the whole design, not an accident of how these happen to work. Grumbling is the excluded case, and the contrast is exact: it is protected by where it happens rather than by any property of the thing said, which is why it disappears the moment the wrong person is in the room.",
      "id": "deniable",
      "prompt": "Which of these could be said or done in a way that lets the person responsible credibly deny they meant it?",
      "reasons": {
        "anonymity": "Removes the one thing -- a name -- that resistance could be answered to.",
        "euphemism": "Says the sharp thing in words mild enough to disown.",
        "feigned ignorance": "A claim about your own understanding that nobody can climb inside and disprove.",
        "folktale": "Fiction is the disguise; everyone present can hear the target without anyone having said it.",
        "rumor": "No traceable author, so no one to hold to it."
      },
      "targets": [
        "rumor",
        "folktale",
        "anonymity",
        "euphemism",
        "feigned ignorance"
      ]
    },
    {
      "explanation": "Scott's larger claim is that resistance is not primarily a matter of what gets said -- most of it never gets put into words at all. These are things done with the body or the hands rather than argued. Flattery is the excluded case: it looks like behavior but its entire function is verbal, a form of speech that happens to be spoken upward.",
      "id": "acts-not-words",
      "prompt": "Which of these are things a person does, rather than things a person says?",
      "reasons": {
        "deference": "A performance carried out physically -- a posture, a title used, an argument not raised -- more than a spoken claim.",
        "false compliance": "An act that looks like obedience and functions as its opposite.",
        "foot-dragging": "The pace of the work itself is the whole statement.",
        "pilfering": "Taking is a physical act with no verbal content at all.",
        "sabotage": "Damage, arranged to look accidental."
      },
      "targets": [
        "foot-dragging",
        "pilfering",
        "sabotage",
        "deference",
        "false compliance"
      ]
    },
    {
      "explanation": "Deference, flattery, false compliance, and feigned ignorance all exist only because someone with power might be watching -- take the watcher away and each of these has no reason to occur. The hidden transcript is the excluded case, and it names the exact opposite condition: it exists only in the watcher's absence, which is what makes it the one entry here that a powerful audience could never see performed, only ever be told about.",
      "id": "needs-an-audience",
      "prompt": "Which of these exist because power might be watching, rather than because it isn't?",
      "reasons": {
        "deference": "A performance with no point unless someone is present to receive it.",
        "false compliance": "Only functions as resistance if it is being observed as compliance.",
        "feigned ignorance": "A claim made to someone in particular, about what that person believes you understood.",
        "flattery": "Praise offered upward has no target if no one upward is listening.",
        "public transcript": "By definition the record kept where both parties can see each other."
      },
      "targets": [
        "public transcript",
        "deference",
        "flattery",
        "false compliance",
        "feigned ignorance"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-public",
      "name": "Onstage",
      "color": "teal",
      "fact": "The public transcript is the open interaction between the powerful and the less powerful, performed where each can see the other. Scott's point is that almost nobody, on either side, mistakes it for the whole truth. It is a performance both parties know is a performance, kept up because the alternative -- open confrontation -- costs more than either usually wants to pay.",
      "terms": [
        "public transcript",
        "deference",
        "flattery"
      ],
      "seeds": [
        "public transcript",
        "deference"
      ],
      "termInfo": {
        "deference": {
          "text": "The outward performance of respect and submission -- a bow, a title used correctly, an argument not made. It costs little to give and buys a great deal of room underneath it."
        },
        "flattery": {
          "text": "Praise offered upward, whether or not it is felt. One of the cheapest currencies in an unequal relationship, and one of the most demanded."
        },
        "public transcript": {
          "text": "The open, official record of an interaction between the powerful and the less powerful -- what gets said where both can hear it and both know they are being watched."
        }
      },
      "info": {
        "citations": [
          {
            "author": "James C. Scott",
            "publisher": "Yale University Press",
            "title": "Domination and the Arts of Resistance: Hidden Transcripts",
            "year": "1990"
          }
        ],
        "text": "The open, on-record interaction between the powerful and the less powerful, performed for each other rather than felt by either."
      }
    },
    {
      "id": "cluster-hidden",
      "name": "Offstage",
      "color": "blue",
      "fact": "The hidden transcript is what gets said out of sight of power -- among servants in the kitchen, workers after the shift, a family behind a closed door. Scott's finding, against a long tradition that read quiet compliance as consent, was that the hidden transcript is usually sharply at odds with the performance given onstage, and that the gap between the two is not confusion. It is where people actually think.",
      "terms": [
        "hidden transcript",
        "grumbling",
        "fantasy of reversal"
      ],
      "seeds": [
        "hidden transcript",
        "grumbling"
      ],
      "termInfo": {
        "fantasy of reversal": {
          "text": "A story, joke, or daydream in which the current order is turned upside down -- the servant giving the orders, the master doing the fetching. Scott finds these recur across very different unequal relationships."
        },
        "grumbling": {
          "text": "Complaint shared only among trusted equals, safe precisely because the setting itself is what protects it, not anything about how it is phrased."
        },
        "hidden transcript": {
          "text": "What people say about power when the people with power cannot hear it. Often flatly contradicts the public transcript given only minutes before."
        }
      },
      "info": {
        "citations": [
          {
            "author": "James C. Scott",
            "publisher": "Yale University Press",
            "title": "Domination and the Arts of Resistance: Hidden Transcripts",
            "year": "1990"
          }
        ],
        "text": "What gets said out of sight of power, among people who trust each other enough to drop the performance."
      }
    },
    {
      "id": "cluster-weapons",
      "name": "The weapons of the weak",
      "color": "amber",
      "fact": "Scott spent two years in a Malaysian rice-farming village watching what peasants actually did between the revolts that history books record. What he found was a constant, low-grade struggle waged almost entirely below the threshold of anything anyone could be punished for: work done just badly enough, orders misheard just conveniently enough, small thefts that were never quite provable. None of it overturns anything by itself. All of it adds up.",
      "terms": [
        "foot-dragging",
        "false compliance",
        "feigned ignorance",
        "pilfering",
        "sabotage"
      ],
      "seeds": [
        "foot-dragging",
        "false compliance"
      ],
      "termInfo": {
        "false compliance": {
          "text": "Appearing to do what was ordered while quietly not doing it, or doing it in a way guaranteed to fail. Indistinguishable from incompetence unless it happens too consistently to be accidental."
        },
        "feigned ignorance": {
          "text": "Claiming not to have understood an order, a rule, or a consequence. Cheap to deploy and almost impossible to disprove."
        },
        "foot-dragging": {
          "text": "Working slowly enough to blunt an order without ever refusing it outright. The single most common weapon in Scott's account, because it requires no plan and no ally."
        },
        "pilfering": {
          "text": "Small, informal taking -- grain, tools, time -- kept below whatever amount would force an owner to respond directly."
        },
        "sabotage": {
          "text": "Damage disguised as accident: a gate left open, a machine run wrong. The most severe of these weapons, and the one requiring the most caution, because it invites the most severe response if traced."
        }
      },
      "info": {
        "citations": [
          {
            "author": "James C. Scott",
            "pages": "p. xvi",
            "publisher": "Yale University Press",
            "title": "Weapons of the Weak: Everyday Forms of Peasant Resistance",
            "year": "1985"
          }
        ],
        "text": "The small, deniable, everyday acts Scott catalogued among Malaysian peasants -- resistance that never rises to the level of anything anyone could be charged with."
      }
    },
    {
      "id": "cluster-disguise",
      "name": "Getting it said without saying it",
      "color": "magenta",
      "fact": "Between speaking freely offstage and confronting power directly onstage lies a wide middle ground: saying something true in a form that lets everyone involved deny it meant what it plainly meant. Scott calls this the arts of political disguise. It is how the hidden transcript gets some of the way into public view without ever fully leaving cover.",
      "terms": [
        "rumor",
        "folktale",
        "anonymity",
        "euphemism"
      ],
      "seeds": [
        "rumor",
        "folktale"
      ],
      "termInfo": {
        "anonymity": {
          "text": "An unsigned complaint, an unattributed threat, a message with no traceable author. Removes the one thing that would let power respond to the person rather than the point."
        },
        "euphemism": {
          "text": "Saying a milder thing that everyone present understands to mean the sharper thing underneath it. Deniable by design."
        },
        "folktale": {
          "text": "A story about animals, tricksters, or distant kings that everyone present can hear as being about their own situation, while nobody present has to say so."
        },
        "rumor": {
          "text": "A claim with no traceable origin, which is exactly what lets it travel into rooms a signed statement never could."
        }
      },
      "info": {
        "citations": [
          {
            "author": "James C. Scott",
            "publisher": "Yale University Press",
            "title": "Domination and the Arts of Resistance: Hidden Transcripts",
            "year": "1990"
          }
        ],
        "text": "The forms that let something true about power be said where power can hear it, without anyone having to own having said it."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-registers",
      "term": "hidden transcript of practice",
      "clusters": [
        1,
        2
      ],
      "fact": "The hidden transcript is not only spoken. Where grumbling among trusted equals fails to relieve the pressure, or conditions keep worsening, the same refusal tends to migrate from words into small, deniable acts -- a field left half-weeded, a tool that breaks at a convenient moment. Nothing has changed except the register. Underneath, it is the same transcript that was already there.",
      "relationKind": "dynamic",
      "info": {
        "text": "Scott's observation that the hidden transcript exists in two forms -- as speech among trusted equals, and as practice, in acts too small and too deniable to answer for."
      },
      "idealTerms": [
        "grumbling",
        "foot-dragging"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-performed-obedience",
      "term": "performed obedience",
      "clusters": [
        0,
        2
      ],
      "fact": "From the vantage of power, false compliance and genuine deference look identical -- both present as someone doing what they were told. Read from underneath, they are opposites: one is the relationship working as intended, the other is refusal wearing the relationship's clothes. Neither party watching the performance from outside can tell which one they are seeing, which is exactly what makes it usable.",
      "relationKind": "contrast",
      "info": {
        "text": "The point where the public transcript and its subversion become visually identical, and only the outcome tells them apart."
      },
      "idealTerms": [
        "deference",
        "false compliance"
      ]
    },
    {
      "id": "bridge-disguise",
      "term": "political disguise",
      "clusters": [
        1,
        3
      ],
      "fact": "A fantasy of the tables turning, told straight, is dangerous. Told as a story about animals, or a joke, or a rumor with no author, it can be said in the open -- even within earshot of the people it is about -- because it can always be disowned. The content of the hidden transcript survives the trip into public view. What it loses is a name attached to whoever said it.",
      "relationKind": "dynamic",
      "info": {
        "text": "How the content of the hidden transcript gets smuggled into public view, in a form nobody can be made to answer for."
      },
      "idealTerms": [
        "fantasy of reversal",
        "folktale"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    }
  ]
});
