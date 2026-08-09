// Generated from content/puzzles/how-couples-get-stuck.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "how-couples-get-stuck",
  "title": "How couples get stuck",
  "category": "Psychology",
  "categories": ["Psychology", "Sociology"],
  "large": true,
  "tags": [
    "book"
  ],
  "info": {
    "citations": [
      {
        "author": "John Gottman and Julie Schwartz Gottman",
        "publisher": "Harmony",
        "title": "Fight Right: How Successful Couples Turn Conflict into Connection",
        "year": "2024"
      }
    ],
    "link": "https://www.gottman.com/about/research/couples/",
    "text": "The Gottmans' account of how two people fall into a cycle of reciprocated attack and defence, and what gets them out. Their widely quoted divorce-prediction accuracy has been criticised for being fitted to outcomes already known rather than tested on fresh couples; the interaction patterns themselves are the durable part of the work."
  },
  "lenses": [
    {
      "explanation": "The Gottmans wired couples for heart rate while they argued, and the physiological record explained things the transcript could not. These three are one sequence in the body rather than three separate behaviours: the state, what it looks like from outside, and the only response that addresses it. Defensiveness is excluded deliberately -- it usually accompanies high arousal, but it is a move made in the conversation and can be made perfectly calmly.",
      "id": "in-the-body",
      "prompt": "Which concepts describe something happening in the body rather than in what is being said?",
      "reasons": {
        "flooding": "The state itself: heart rate and stress hormones past the point of usefulness.",
        "physiological self-soothing": "The only counter here that addresses the body rather than the argument.",
        "stonewalling": "Reads as refusal from outside; from inside it is usually a system that has stopped taking input."
      },
      "targets": [
        "stonewalling",
        "flooding",
        "physiological self-soothing"
      ]
    },
    {
      "explanation": "Some of what shapes a fight was in the room before it started and will still be there afterwards. Recognising which parts those are changes what counts as progress: you cannot resolve a style or a dream, only accommodate it. The solvable problem is the excluded case and the contrast is the whole point of the round -- it is the one thing here that a good conversation can genuinely finish off.",
      "id": "what-outlasts-the-fight",
      "prompt": "Which concepts will still be true about this couple after this particular argument ends?",
      "reasons": {
        "conflict-avoiding": "A style traced to childhood and treated as close to unchangeable.",
        "dreams within conflict": "An aspiration bound up in someone's identity, not a position they adopted for this argument.",
        "perpetual problem": "Rooted in a durable difference, so it survives any agreement reached today.",
        "validating": "A style traced to childhood and treated as close to unchangeable.",
        "volatile": "A style traced to childhood and treated as close to unchangeable."
      },
      "targets": [
        "conflict-avoiding",
        "validating",
        "volatile",
        "perpetual problem",
        "dreams within conflict"
      ]
    },
    {
      "explanation": "A cycle of reciprocated attack has two separate points of intervention, and confusing them wastes the good advice. Everything here works on a fight already running. Two exclusions carry the lesson: a gentle start-up governs how an exchange opens and is no use at all ten minutes in, and a culture of appreciation is built in small amounts between fights, not deployed during one.",
      "id": "mid-fight",
      "prompt": "Which concepts describe something you can do partway through a fight that is already going badly?",
      "reasons": {
        "dreams within conflict": "Asking what the other person is really defending is what turns a deadlock back into a conversation.",
        "physiological self-soothing": "Stops an exchange that has already passed the point where anything is landing.",
        "taking responsibility": "Answers a complaint already made, and breaks the counter-attack loop."
      },
      "targets": [
        "taking responsibility",
        "physiological self-soothing",
        "dreams within conflict"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-styles",
      "name": "How this couple fights",
      "color": "teal",
      "fact": "These three are all stable ways of fighting, not a ranking. What causes trouble is the mismatch: pair someone who wants to talk everything through with someone who would rather let it go, and each reads the other's normal behaviour as the problem. The Gottmans trace where a person's style came from -- usually a household they watched as a child -- and treat it as close to unchangeable, which means the work is accommodation rather than conversion.",
      "terms": [
        "conflict-avoiding",
        "validating",
        "volatile"
      ],
      "seeds": [
        "conflict-avoiding",
        "volatile"
      ],
      "termInfo": {
        "conflict-avoiding": {
          "link": "https://www.gottman.com/blog/the-5-couple-types/",
          "text": "Partners who skirt around differences and agree to disagree, on the view that raising it would cost more than living with it."
        },
        "validating": {
          "link": "https://www.gottman.com/blog/the-5-couple-types/",
          "text": "Partners who work through disagreements calmly and at length, listening and showing they have understood before pressing their own case."
        },
        "volatile": {
          "link": "https://www.gottman.com/blog/the-5-couple-types/",
          "text": "Partners who argue loudly, often, and with real heat -- and whose intense negativity is balanced by equally intense affection."
        }
      },
      "info": {
        "link": "https://www.gottman.com/blog/the-5-couple-types/",
        "text": "The stable ways of handling disagreement that couples bring in with them, before any particular fight starts."
      }
    },
    {
      "id": "cluster-horsemen",
      "name": "The four horsemen",
      "color": "blue",
      "fact": "These arrive in a cascade rather than at random. An attack on character invites disdain, disdain invites counter-attack, and when counter-attacking settles nothing, one partner stops responding at all. Each person's worst move cues the other's, which is what makes the sequence so hard to interrupt from inside it. Piling on every old grievance the moment a new one surfaces is what keeps the cascade fed once it starts.",
      "terms": [
        "criticism",
        "defensiveness",
        "contempt",
        "stonewalling",
        "kitchen sinking"
      ],
      "seeds": [
        "criticism",
        "defensiveness"
      ],
      "termInfo": {
        "contempt": {
          "link": "https://www.gottman.com/blog/the-four-horsemen-contempt/",
          "text": "Speaking from a position of moral superiority: sarcasm, name-calling, mockery, an eye-roll. The Gottmans single this one out as the most destructive of the four."
        },
        "criticism": {
          "link": "https://www.gottman.com/blog/what-is-criticism-the-four-horsemen/",
          "text": "Attacking the person rather than naming the thing they did. A complaint is about a specific behaviour; criticism is about who they are."
        },
        "defensiveness": {
          "link": "https://www.gottman.com/blog/the-four-horsemen-defensiveness/",
          "text": "Warding off a perceived attack through righteous indignation or innocent victimhood. In practice it says the problem isn't me, it's you."
        },
        "kitchen sinking": {
          "citations": [
            {
              "author": "John Gottman and Julie Schwartz Gottman",
              "publisher": "Harmony",
              "title": "Fight Right: How Successful Couples Turn Conflict into Connection",
              "year": "2024"
            }
          ],
          "text": "Bringing every old grievance into a fight about one new thing, until the original issue is buried under all the others and nothing gets addressed."
        },
        "stonewalling": {
          "link": "https://www.gottman.com/blog/the-four-horsemen-stonewalling/",
          "text": "Withdrawing from the conversation completely and no longer responding. It usually looks like indifference and usually isn't."
        }
      },
      "info": {
        "link": "https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/",
        "text": "The four ways of responding the Gottmans found most reliably present in couples who later separated, and a fifth habit that keeps the cascade going once it starts."
      }
    },
    {
      "id": "cluster-antidotes",
      "name": "The antidotes",
      "color": "amber",
      "fact": "Each horseman has a specific counter, and none of them amounts to being nicer. Say what you feel and what you need instead of what is wrong with them. Accept whatever part of a complaint is accurate, even a small part. Build enough ordinary goodwill that a bad moment doesn't define the whole. And when your body is past the point of taking anything in, stop -- for at least twenty minutes, because that is roughly how long it takes to come down. One more habit heads off kitchen sinking specifically: sorting what is actually negotiable from what isn't, before arguing either.",
      "terms": [
        "gentle start-up",
        "taking responsibility",
        "culture of appreciation",
        "physiological self-soothing",
        "the bagel method"
      ],
      "seeds": [
        "gentle start-up",
        "taking responsibility"
      ],
      "termInfo": {
        "culture of appreciation": {
          "link": "https://www.gottman.com/blog/marriage-not-big-thing-million-little-things/",
          "text": "Regularly expressed gratitude, affection and respect, accumulated in small amounts, which buys a relationship a buffer against bad moments. The counter to contempt."
        },
        "gentle start-up": {
          "link": "https://www.gottman.com/blog/softening-startup/",
          "text": "Opening with what you feel and what you need, rather than with a verdict on the other person. The counter to criticism."
        },
        "physiological self-soothing": {
          "link": "https://www.gottman.com/blog/the-four-horsemen-the-antidotes/",
          "text": "Calling a timeout and genuinely calming down -- not rehearsing your case -- before returning to the conversation. The counter to stonewalling."
        },
        "taking responsibility": {
          "link": "https://www.gottman.com/blog/the-four-horsemen-the-antidotes/",
          "text": "Accepting your share of the problem, even if only part of it, rather than warding off the whole complaint. The counter to defensiveness."
        },
        "the bagel method": {
          "citations": [
            {
              "author": "John Gottman and Julie Schwartz Gottman",
              "publisher": "Harmony",
              "title": "Fight Right: How Successful Couples Turn Conflict into Connection",
              "year": "2024"
            }
          ],
          "text": "Splitting an issue into a non-negotiable core, the part neither of you will give up, and a negotiable edge around it, the part that can actually be traded. Naming which is which before arguing is what keeps kitchen sinking from having anywhere to attach."
        }
      },
      "info": {
        "link": "https://www.gottman.com/blog/the-four-horsemen-the-antidotes/",
        "text": "The specific counter for each of the four horsemen, plus a habit for keeping a single disagreement from turning into every disagreement."
      }
    },
    {
      "id": "cluster-underneath",
      "name": "What the fight is really about",
      "color": "magenta",
      "fact": "Gottman's estimate is that around two thirds of what couples argue about is never going to be settled, because it comes from durable differences in personality and need rather than from a situation. Sorting which kind you are in matters more than arguing well, because applying the wrong method is what does the damage: negotiating a difference that cannot be negotiated teaches both people that the other is unreasonable.",
      "terms": [
        "solvable problem",
        "perpetual problem",
        "dreams within conflict"
      ],
      "seeds": [
        "solvable problem",
        "perpetual problem"
      ],
      "termInfo": {
        "dreams within conflict": {
          "link": "https://foreverfamilies.byu.edu/moving-from-gridlock-to-dialogue",
          "text": "The hope or aspiration bound up in someone's position, which is usually what a rigid stance is actually defending. A practical demand for a house may be a dream of independence."
        },
        "perpetual problem": {
          "link": "https://foreverfamilies.byu.edu/solving-your-solvable-problems",
          "text": "A disagreement rooted in a lasting difference of personality or need, which will still be there in ten years whatever is agreed today."
        },
        "solvable problem": {
          "link": "https://foreverfamilies.byu.edu/solving-your-solvable-problems",
          "text": "A disagreement about a specific situation, with no deeper meaning behind either position, which a workable compromise can genuinely end."
        }
      },
      "info": {
        "link": "https://foreverfamilies.byu.edu/solving-your-solvable-problems",
        "text": "What the argument is actually made of, underneath whatever set it off this time."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-attack-defend",
      "term": "attack-defend mode",
      "clusters": [
        0,
        1
      ],
      "fact": "Whatever style two people start from, a fight can tip into a stance where each is defending a position and looking for an opening. The Gottmans' point about it is blunt: from inside attack-defend there is no communication, no understanding, and no forward motion. It is not a stage on the way to resolving anything. It is the state in which resolving becomes impossible, and mismatched styles reach it fastest, because each partner's ordinary way of fighting reads to the other as an opening move.",
      "relationKind": "dynamic",
      "info": {
        "citations": [
          {
            "author": "John Gottman and Julie Schwartz Gottman",
            "publisher": "Harmony",
            "title": "Fight Right: How Successful Couples Turn Conflict into Connection",
            "year": "2024"
          }
        ],
        "text": "The win-or-lose stance in which both partners are defending positions and looking for openings, rather than trying to understand each other."
      },
      "idealTerms": [
        null,
        "defensiveness"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-flooding",
      "term": "flooding",
      "clusters": [
        1,
        2
      ],
      "fact": "In one of the Gottmans' studies, couples were stopped fifteen minutes into an argument and asked to read magazines while the equipment was supposedly adjusted. When they resumed, their heart rates had dropped and the conversation went better. Nobody had learned a technique. Their bodies had simply calmed down, which turns out to be a precondition for the rest of it rather than a nice extra.",
      "relationKind": "dynamic",
      "info": {
        "link": "https://www.gottman.com/blog/making-sure-emotional-flooding-doesnt-capsize-your-relationship/",
        "text": "Being emotionally overwhelmed during conflict, with heart rate and stress hormones rising past the point where a person can take much in."
      },
      "idealTerms": [
        "stonewalling",
        "physiological self-soothing"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-gridlock",
      "term": "gridlock",
      "clusters": [
        3,
        1
      ],
      "fact": "A difference that cannot be settled is survivable. What is not survivable is returning to it so many times without movement that the positions harden and each side starts explaining the deadlock by what is wrong with the other person. Gottman's advice for these is not to solve them but to declaw them -- to take the pain out so the subject can be raised without injury.",
      "relationKind": "dynamic",
      "info": {
        "link": "https://foreverfamilies.byu.edu/moving-from-gridlock-to-dialogue",
        "text": "A perpetual problem returned to so often without movement that the positions have hardened into judgements about the other person."
      },
      "idealTerms": [
        "perpetual problem",
        "contempt"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    }
  ]
});
