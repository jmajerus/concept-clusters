// Generated from content/puzzles/evolution-of-cooperation.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "evolution-of-cooperation",
  "title": "The evolution of cooperation",
  "category": "Philosophy & Social Science",
  "large": true,
  "tags": [
    "book"
  ],
  "info": {
    "link": "wiki:The Evolution of Cooperation",
    "text": "How cooperation can get started among players who have no reason to trust each other, no way to make promises, and no authority to enforce anything."
  },
  "lenses": [
    {
      "explanation": "Each of these pushes toward defection from a different direction: the payoff table, the logic of a single round, the calendar, and the wrong comparison. The sucker's payoff is deliberately excluded — it is the cost of being exploited, which produces fear rather than temptation, and fear alone does not tell you to move first.",
      "id": "reasons-to-defect",
      "prompt": "Which concepts give a player a positive reason to defect on this move, rather than a reason to fear being defected on?",
      "reasons": {
        "dominant strategy": "In one round, defection scores better regardless of the other player's move.",
        "envy": "Wanting to out-score your partner specifically, rather than score well overall, argues for defecting on someone doing fine.",
        "known last round": "With no future left to protect, the final move has nothing holding it in place.",
        "temptation payoff": "The largest payoff in the table is collected by defecting against a cooperator."
      },
      "targets": [
        "temptation payoff",
        "dominant strategy",
        "known last round",
        "envy"
      ]
    },
    {
      "explanation": "A tournament run without noise hides an entire failure mode. Once moves can be garbled, the cause, the amplifier, the consequence, and the two partial remedies all live on this board — and note that the amplifier and one of the remedies are the same trait tuned differently. Niceness is excluded: it governs the opening move, before there is any signal to misread.",
      "id": "when-a-move-is-misread",
      "prompt": "Which concepts are directly concerned with a move being misread, mistaken, or hard to interpret?",
      "reasons": {
        "clarity": "Being legible reduces how often your moves are misread in the first place.",
        "echo effect": "What a single misread move becomes once both sides answer in kind.",
        "forgiveness": "Returning to cooperation is what actually breaks an echo already running.",
        "misperception": "The originating error: a move received as something other than what was sent.",
        "provocability": "Immediate retaliation is what turns one misread move into a sustained run."
      },
      "targets": [
        "misperception",
        "echo effect",
        "clarity",
        "forgiveness",
        "provocability"
      ]
    },
    {
      "explanation": "This is the book's central claim: cooperation does not require a central authority, a contract, or even trust — only repeated contact and a rule simple enough to be read from behavior alone. Evolutionary stability is excluded on purpose, and the distinction matters: it explains why a cooperative population resists invasion once it exists, not how it got started with none.",
      "id": "without-an-enforcer",
      "prompt": "Which concepts help explain how cooperation could arise among players who cannot communicate, promise, or enforce anything?",
      "reasons": {
        "clustering": "A minority of reciprocators can gain a foothold without converting anyone first.",
        "live and let live": "Enemy soldiers with every official incentive to shoot arrived at restraint with no agreement at all.",
        "shadow of the future": "Expected repetition is the one condition that has to hold; nothing else on this list works without it.",
        "territoriality": "Interacting only with neighbors supplies the repetition that a random population would not.",
        "tit for tat": "A rule readable purely from behavior needs no communication to be understood."
      },
      "targets": [
        "live and let live",
        "clustering",
        "territoriality",
        "tit for tat",
        "shadow of the future"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-dilemma",
      "name": "The one-shot dilemma",
      "color": "teal",
      "fact": "Played once, the dilemma has a clean answer: whatever the other side does, you score better by defecting. Both sides reason identically, both defect, and both end up worse off than if they had cooperated. That result is what everything else here is trying to escape.",
      "terms": [
        "prisoner's dilemma",
        "dominant strategy",
        "temptation payoff",
        "sucker's payoff"
      ],
      "seeds": [
        "prisoner's dilemma",
        "dominant strategy"
      ],
      "termInfo": {
        "dominant strategy": {
          "link": "wiki:Strategic dominance",
          "text": "A move that scores better than the alternative no matter what the other player does — which, in a single round of this game, is defection."
        },
        "prisoner's dilemma": {
          "link": "wiki:Prisoner's dilemma",
          "text": "The standard two-player setup where each side chooses to cooperate or defect, and mutual defection pays both less than mutual cooperation would have."
        },
        "sucker's payoff": {
          "link": "wiki:Prisoner's dilemma",
          "text": "What you are left holding after cooperating with someone who defected: the smallest of the four payoffs, and the reason cooperation feels risky."
        },
        "temptation payoff": {
          "link": "wiki:Prisoner's dilemma",
          "text": "What you collect by defecting against someone who cooperated: the largest of the four payoffs, and the reason defection tempts."
        }
      },
      "info": {
        "link": "wiki:Prisoner's dilemma",
        "text": "The situation where each side's individually best move leaves both sides worse off than another pair of moves would have."
      }
    },
    {
      "id": "cluster-strategy",
      "name": "What made a strategy score well",
      "color": "blue",
      "fact": "Across both of Axelrod's tournaments the high scorers shared a shape: never the first to defect, quick to drop a grudge once the other side came back, and simple enough that an opponent could work out what they were doing. None of them ever beat a single opponent head to head.",
      "terms": [
        "niceness",
        "forgiveness",
        "clarity"
      ],
      "seeds": [
        "niceness",
        "forgiveness"
      ],
      "termInfo": {
        "clarity": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "Being simple enough that the other player can work out your rule and see that cooperating with you pays. An unreadable strategy invites being treated as unresponsive."
        },
        "forgiveness": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "Returning to cooperation once the other side does, rather than punishing indefinitely for a defection already answered."
        },
        "niceness": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "Never being the first to defect. Every high-scoring entry in both of Axelrod's tournaments had this property; every low-scoring one lacked it."
        }
      },
      "info": {
        "link": "wiki:The Evolution of Cooperation",
        "text": "The traits that separated the high-scoring entries from the low-scoring ones when strategies were played against each other in bulk."
      }
    },
    {
      "id": "cluster-breakdown",
      "name": "How cooperation unravels",
      "color": "amber",
      "fact": "None of this requires malice. A garbled move, a deadline both sides can see, or the urge to beat your partner rather than the field is enough to turn a working relationship into a long run of mutual punishment that neither side chose.",
      "terms": [
        "echo effect",
        "misperception",
        "known last round",
        "envy"
      ],
      "seeds": [
        "misperception",
        "envy"
      ],
      "termInfo": {
        "echo effect": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "One defection copied back and forth, so a single move reverberates through many rounds of alternating retaliation."
        },
        "envy": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "Measuring your score against your partner's rather than against the whole field. The comparison is what makes players defect their way to a worse absolute result."
        },
        "known last round": {
          "link": "wiki:Backward induction",
          "text": "When both sides know exactly when the relationship ends, there is no future left to protect on the final move — and that reasoning walks backwards through every earlier move too."
        },
        "misperception": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "A move received as something other than what was sent — noise, error, or a signal read wrong."
        }
      },
      "info": {
        "link": "wiki:The Evolution of Cooperation",
        "text": "The ways a working relationship comes apart without either side deciding to end it."
      }
    },
    {
      "id": "cluster-spread",
      "name": "How cooperation takes hold",
      "color": "magenta",
      "fact": "Cooperation does not need everyone to convert at once. A small group of reciprocators that mostly meets itself can outscore a surrounding world of defectors — and once established, that pattern is very hard for defectors to break back into.",
      "terms": [
        "clustering",
        "evolutionary stability",
        "territoriality",
        "live and let live"
      ],
      "seeds": [
        "live and let live",
        "evolutionary stability"
      ],
      "termInfo": {
        "clustering": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "A small group of reciprocators interacting mostly with each other can outscore a defecting majority, even while heavily outnumbered."
        },
        "evolutionary stability": {
          "link": "wiki:Evolutionarily stable strategy",
          "text": "Once a reciprocating population is established, a small group of defectors entering it cannot do better than the natives, so it cannot take over."
        },
        "live and let live": {
          "link": "wiki:Live and let live (World War I)",
          "text": "The tacit restraint that grew up between opposing trenches in the First World War, where units facing the same enemy day after day quietly stopped trying to kill each other."
        },
        "territoriality": {
          "link": "wiki:The Evolution of Cooperation",
          "text": "When players interact only with immediate neighbors rather than with everyone at random, cooperation can hold ground it could not hold in a fully mixed population."
        }
      },
      "info": {
        "link": "wiki:The Evolution of Cooperation",
        "text": "How a cooperative pattern gets a foothold in a population that does not already have one, and then keeps it."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-tit-for-tat",
      "term": "tit for tat",
      "clusters": [
        1,
        3
      ],
      "fact": "Anatol Rapoport's winning entry was the shortest one submitted: cooperate on the first move, then copy whatever the other player just did. The same four-line rule that topped the tournament is also what lets a handful of neighbors get cooperation started in a world that has none.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Tit for tat",
        "text": "Cooperate on the first move, then repeat whatever the other player did last."
      },
      "idealTerms": [
        null,
        "clustering"
      ]
    },
    {
      "id": "bridge-provocability",
      "term": "provocability",
      "clusters": [
        1,
        2
      ],
      "fact": "Answering a defection immediately is what keeps a cooperative strategy from being farmed by exploiters — a nice rule without it is simply prey. Unchanged, it is also the mechanism that converts one garbled move into a long alternating run of retaliation neither side wanted.",
      "relationKind": "contrast",
      "info": {
        "link": "wiki:The Evolution of Cooperation",
        "text": "Retaliating promptly for a defection rather than absorbing it."
      },
      "idealTerms": [
        "niceness",
        "echo effect"
      ]
    },
    {
      "id": "bridge-shadow",
      "term": "shadow of the future",
      "clusters": [
        0,
        3
      ],
      "fact": "How much the next encounter matters is what decides whether the single-round logic applies at all. Stretch the expected relationship long enough and the move that wins one round stops being the move that wins — which is the opening cooperation needs to establish itself.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:The Evolution of Cooperation",
        "text": "Axelrod's term for how heavily the prospect of future encounters with the same player weighs on the present one."
      },
      "idealTerms": [
        "dominant strategy",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    }
  ]
});
