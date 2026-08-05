// Generated from content/puzzles/game-theory-basics.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "game-theory-basics",
  "title": "Game theory basics",
  "category": "Math",
  "info": {
    "link": "wiki:Game theory",
    "text": "How to describe a strategic situation precisely enough to predict what rational players will actually do -- once, or over and over."
  },
  "lenses": [
    {
      "explanation": "A strategy, its payoff, whether the game is zero-sum, and whether it has perfect information are all facts about the game's structure, fixed before anyone tries to solve it. Rationality belongs here too: it isn't a fact about the game, but it's the assumption every solution concept needs in place before it can even be applied.",
      "id": "the-rules-of-the-game",
      "prompt": "Which concepts describe the game's structure, or the assumption needed to solve it, rather than a conclusion about how it will be played?",
      "reasons": {
        "payoff": "What each combination of strategies pays out, fixed by the rules of the game itself.",
        "perfect information": "A property of what players can see, not a conclusion about what they'll do.",
        "rationality": "The assumption every solution concept needs in place before it can even be applied.",
        "strategy": "A player's plan, defined before any equilibrium is found.",
        "zero-sum game": "A property of how the payoffs are structured, not a way of solving for them."
      },
      "targets": [
        "strategy",
        "payoff",
        "zero-sum game",
        "perfect information",
        "rationality"
      ]
    },
    {
      "explanation": "A dominant strategy, a best response, a Nash equilibrium, and a mixed strategy are all ways of solving a game as a one-shot encounter -- and the prisoner's dilemma is the canonical one-shot game they're used to solve. Whether repeating that game changes the answer is the subject of the next round.",
      "id": "solved-once",
      "prompt": "Which concepts are used to solve a single round of a game, including the single-round game they're most famously applied to?",
      "reasons": {
        "Nash equilibrium": "A stable outcome for a single round, once every player is playing a best response.",
        "best response": "The best reply to one specific set of choices, evaluated for a single round.",
        "dominant strategy": "The best strategy regardless of what the other player does, evaluated for a single round.",
        "mixed strategy": "A way to solve a single round when no pure choice is safely best.",
        "prisoner's dilemma": "The single-round game whose dominant-strategy solution is famously worse for both players than cooperating would be."
      },
      "targets": [
        "dominant strategy",
        "best response",
        "Nash equilibrium",
        "mixed strategy",
        "prisoner's dilemma"
      ]
    },
    {
      "explanation": "A repeated game gives players a future to protect; tit for tat is a strategy built entirely around that future; a cooperative game lets players make binding agreements instead of choosing in isolation; and cooperation itself is the outcome all three are aimed at. The prisoner's dilemma is deliberately left out of this round -- it's the one-shot, no-cooperation baseline these concepts are a response to.",
      "id": "playing-it-again",
      "prompt": "Which concepts only make sense once a game is repeated, or once players can make agreements outside a single round?",
      "reasons": {
        "cooperation": "The outcome that repetition and binding agreements make possible.",
        "cooperative game": "Lets players make binding agreements instead of choosing in isolation.",
        "repeated game": "Gives players a future they can be rewarded or punished in.",
        "tit for tat": "A strategy that only works because the game repeats."
      },
      "targets": [
        "repeated game",
        "cooperative game",
        "tit for tat",
        "cooperation"
      ]
    },
    {
      "explanation": "Every other concept in 'Describing a game' exists to eventually determine someone's payoff. Every other solution concept in 'Solving a game' is either a route to a Nash equilibrium -- a best response or a mixed strategy -- or a special case of one, a dominant strategy. And cooperation is the outcome that repeated games, cooperative games, and tit for tat are all built to make possible.",
      "id": "the-anchor-concept",
      "prompt": "Which concept is the central idea that the rest of its area either defines, builds toward, or is measured against?",
      "reasons": {
        "Nash equilibrium": "A dominant strategy is a special case of it, and a best response or mixed strategy is how you find it.",
        "cooperation": "Repeated games, cooperative games, and tit for tat are all built to make this possible.",
        "payoff": "Every other concept in this area exists to eventually determine someone's payoff."
      },
      "targets": [
        "payoff",
        "Nash equilibrium",
        "cooperation"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-describing-a-game",
      "name": "Describing a game",
      "color": "teal",
      "fact": "Before a game can be solved, it has to be described: who's playing, what strategies they can choose, what each combination of choices pays out, whether the players see everything as it happens, and whether one player's gain is exactly another's loss.",
      "terms": [
        "strategy",
        "payoff",
        "zero-sum game",
        "perfect information"
      ],
      "seeds": [
        "strategy",
        "zero-sum game"
      ],
      "termInfo": {
        "payoff": {
          "link": "wiki:Normal-form game",
          "text": "What a player actually gets -- money, points, years in prison -- for one particular combination of everyone's choices."
        },
        "perfect information": {
          "link": "wiki:Perfect information",
          "text": "A game where every player can see everything that's happened so far before making their next move."
        },
        "strategy": {
          "link": "wiki:Strategy (game theory)",
          "text": "A complete plan for what a player will do in every situation that might come up in the game."
        },
        "zero-sum game": {
          "link": "wiki:Zero-sum game",
          "text": "A game where one player's gain is exactly balanced by another's loss, so the payoffs always add up to zero."
        }
      }
    },
    {
      "id": "cluster-solving-a-game",
      "name": "Solving a game",
      "color": "blue",
      "fact": "Solving a game means predicting how rational players will actually play it: a dominant strategy wins no matter what anyone else does, a best response is the smartest reply to a specific opponent, a Nash equilibrium is where everyone is playing a best response to everyone else, and a mixed strategy solves it by randomizing when no single choice is safely best.",
      "terms": [
        "dominant strategy",
        "best response",
        "Nash equilibrium",
        "mixed strategy"
      ],
      "seeds": [
        "Nash equilibrium",
        "dominant strategy"
      ],
      "termInfo": {
        "Nash equilibrium": {
          "link": "wiki:Nash equilibrium",
          "text": "A set of strategies, one per player, where no one can do better by switching, given what everyone else is doing."
        },
        "best response": {
          "link": "wiki:Best response",
          "text": "The strategy that gives a player the best result against one specific set of choices by everyone else."
        },
        "dominant strategy": {
          "link": "wiki:Strategic dominance",
          "text": "A strategy that gives a player their best result no matter what any other player does."
        },
        "mixed strategy": {
          "link": "wiki:Mixed strategy",
          "text": "Choosing randomly among several strategies according to fixed probabilities, rather than committing to just one."
        }
      }
    },
    {
      "id": "cluster-playing-again-and-again",
      "name": "Playing again and again",
      "color": "amber",
      "fact": "Some games get played only once, like the prisoner's dilemma; others repeat, which changes everything, since players in a repeated game can reward or punish each other over time, cooperative games let them make binding agreements up front, and a strategy like tit for tat shows how cooperation can win even among purely self-interested players.",
      "terms": [
        "repeated game",
        "cooperative game",
        "prisoner's dilemma",
        "tit for tat"
      ],
      "seeds": [
        "prisoner's dilemma",
        "repeated game"
      ],
      "termInfo": {
        "cooperative game": {
          "link": "wiki:Cooperative game theory",
          "text": "A game where players can make binding agreements with each other before choosing their strategies."
        },
        "prisoner's dilemma": {
          "link": "wiki:Prisoner's dilemma",
          "text": "A single-round game where each player's dominant strategy is to betray the other, even though mutual cooperation would leave them both better off."
        },
        "repeated game": {
          "link": "wiki:Repeated game",
          "text": "The same game played over multiple rounds, where past choices can shape what happens next."
        },
        "tit for tat": {
          "link": "wiki:Tit for tat",
          "text": "A repeated-game strategy that starts by cooperating, then simply copies whatever the other player did last round."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-rationality",
      "term": "rationality",
      "clusters": [
        0,
        1
      ],
      "fact": "Solving a game for a Nash equilibrium or a dominant strategy assumes something about the players first: that each one is rational, always choosing whichever strategy maximizes their own payoff given what everyone else is doing.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Rational choice theory",
        "text": "The assumption that a player always chooses the action that maximizes their own expected payoff."
      },
      "idealTerms": [
        "payoff",
        "best response"
      ]
    },
    {
      "id": "bridge-cooperation",
      "term": "cooperation",
      "clusters": [
        1,
        2
      ],
      "fact": "Defecting is each player's dominant strategy in a single round of the prisoner's dilemma, even though mutual cooperation would pay both more. Once the game repeats, cooperation can become the stable equilibrium instead, because a player who defects today can be punished tomorrow.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Cooperation",
        "text": "Working toward a shared or mutual benefit, which game theory treats as something that has to be explained, not assumed."
      },
      "idealTerms": [
        "dominant strategy",
        "prisoner's dilemma"
      ]
    }
  ]
});
