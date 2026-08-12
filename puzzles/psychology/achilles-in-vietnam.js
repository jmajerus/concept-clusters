// Generated from content/puzzles/achilles-in-vietnam.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "achilles-in-vietnam",
  "title": "Achilles in Vietnam",
  "category": "Psychology",
  "categories": [
    "Psychology",
    "History & Society"
  ],
  "large": true,
  "tags": [
    "book",
    "war"
  ],
  "info": {
    "citations": [
      {
        "author": "Shay, Jonathan",
        "publisher": "Atheneum",
        "title": "Achilles in Vietnam: Combat Trauma and the Undoing of Character",
        "year": "1994"
      }
    ],
    "link": "wiki:Moral injury",
    "text": "Jonathan Shay's argument, built from Vietnam veterans' testimony read against Homer's Iliad, that the deepest wound of combat is not fear but the betrayal of a soldier's sense of what's right by those who hold legitimate authority over him."
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "exit-voice-and-loyalty",
        "via": [
          "betrayal",
          "loyalty"
        ],
        "reason": "Shay's soldier can't simply exit a combat unit when authority betrays him; Hirschman's framework for what people do when exit is costly or impossible -- voice, or a loyalty that curdles into something else -- names the trap Shay's veterans are caught inside."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "The injury and the cure turn out to share the same scale: what breaks in 'Shrinkage of the Moral Horizon' is a bond between people, and what Shay proposes to rebuild in 'Healing and Griefwork' is also a bond between people -- a community able to hold a veteran's story. Neither is a purely private, internal event.",
      "id": "the-relational-axis",
      "prompt": "Which concepts describe the state of a soldier's bonds and relationships with other people, rather than something happening inside one person's own mind?",
      "targets": [
        "special comrade",
        "moral horizon",
        "unit cohesion",
        "communalization"
      ]
    },
    {
      "explanation": "These six concepts track what combat trauma changes inside one person -- an emotional state, a physiological fury, a philosophical claim about responsibility, a damaged capacity -- distinct from the interpersonal bonds the first lens isolates. Shay's book insists both scales matter: an injury that starts inside a moral community ends up doing its lasting damage inside one mind.",
      "id": "the-interior-axis",
      "prompt": "Which concepts describe something that happens within a single soldier's own mind and body, rather than in the bonds between him and other people?",
      "targets": [
        "indignant rage",
        "berserk state",
        "loss of restraint",
        "moral luck",
        "loss of trust",
        "social withdrawal"
      ]
    }
  ],
  "clusters": [
    {
      "id": "betrayal-of-whats-right",
      "name": "Betrayal of What's Right",
      "color": "magenta",
      "fact": "Shay defines moral injury as a betrayal of themis -- the Homeric Greek word for 'what's right,' the customary moral order a fighting unit lives inside -- and insists the betrayer must hold legitimate authority over the soldier for the wound to be moral rather than merely tragic; Agamemnon's seizure of Achilles' rightfully won prize provokes not the berserk fury to come, but a colder, more dignified indignant rage.",
      "terms": [
        "themis",
        "legitimate authority",
        "indignant rage"
      ],
      "seeds": [
        "themis",
        "legitimate authority"
      ],
      "termInfo": {
        "indignant rage": {
          "text": "Shay's preferred translation of the Homeric word usually rendered 'wrath' -- a controlled, dignity-driven anger at being wronged by a legitimate authority, distinct from the uncontrolled fury of the berserk state to come."
        },
        "themis": {
          "link": "wiki:Themis",
          "text": "The Homeric Greek word for custom, or 'what's right' -- the shared, unwritten standard of proper conduct that binds a fighting unit together."
        }
      },
      "info": {
        "link": "wiki:Moral injury",
        "text": "The book's central diagnostic claim: a wound Shay calls moral injury, which requires someone holding legitimate authority to betray a fighting unit's shared sense of what's right."
      }
    },
    {
      "id": "shrinkage-of-the-moral-horizon",
      "name": "Shrinkage of the Moral Horizon",
      "color": "teal",
      "fact": "Once betrayed, a soldier's circle of trust and care shrinks from the whole army down to a handful of special comrades who alone remain reliable; when one of them dies, especially where military culture forbids visible mourning, the resulting interrupted grief becomes fuel for what follows.",
      "terms": [
        "special comrade",
        "moral horizon",
        "interrupted grief"
      ],
      "seeds": [
        "special comrade",
        "moral horizon"
      ],
      "termInfo": {
        "interrupted grief": {
          "text": "Mourning for a dead comrade that combat culture prevents a soldier from completing -- grief with nowhere sanctioned to go."
        }
      },
      "info": {
        "text": "How a soldier's sense of who is worth protecting and mourning narrows, under the pressure of betrayal and combat, down to a small circle of trusted comrades."
      }
    },
    {
      "id": "the-berserk-state",
      "name": "The Berserk State",
      "color": "brown",
      "fact": "Grief for a special comrade can curdle into a berserk state -- a documented, almost trance-like fury in which fear disappears and restraint collapses -- and Achilles' days-long desecration of Hector's corpse is Shay's paradigm case of the dishonoring of the enemy that so often follows.",
      "terms": [
        "berserk state",
        "loss of restraint",
        "dishonoring the enemy"
      ],
      "seeds": [
        "berserk state",
        "loss of restraint"
      ],
      "termInfo": {
        "berserk state": {
          "text": "A documented, extreme combat state -- an almost trance-like fury in which fear, exhaustion, and restraint fall away -- that Shay finds equally in Homer's Achilles and in his Vietnam veteran patients."
        },
        "dishonoring the enemy": {
          "text": "Treating a defeated enemy's body with deliberate contempt -- refusing burial, mutilating the corpse -- rather than the minimal respect a soldier's own side would expect in death."
        },
        "loss of restraint": {
          "text": "The disappearance, in the berserk state, of the normal inner checks that distinguish a disciplined combatant from an indiscriminate killer."
        }
      },
      "info": {
        "text": "The extreme combat state at the center of both Homer's Iliad and Shay's Vietnam veteran patients' testimony: total fury, loss of restraint, and indifference to one's own survival."
      }
    },
    {
      "id": "the-undoing-of-character",
      "name": "The Undoing of Character",
      "color": "cyan",
      "fact": "Once character has been undone by combat, the capacity for basic social trust often does not return on its own; Shay borrows philosophers' term moral luck to insist that whether a particular soldier's character held or broke depended heavily on circumstances no one controls, not on some soldiers simply being better people.",
      "terms": [
        "loss of trust",
        "moral luck",
        "social withdrawal"
      ],
      "seeds": [
        "loss of trust",
        "moral luck"
      ],
      "termInfo": {
        "moral luck": {
          "link": "wiki:Moral luck",
          "text": "The philosophical claim, associated with Bernard Williams and Thomas Nagel, that circumstances beyond a person's control can affect how we judge them morally -- Shay applies it to insist that surviving combat with one's character intact is partly a matter of luck, not virtue."
        }
      },
      "info": {
        "text": "The lasting damage combat trauma does to a person's basic capacity for trust and connection -- the book's subtitle names this its central concern."
      }
    },
    {
      "id": "healing-and-griefwork",
      "name": "Healing and Griefwork",
      "color": "amber",
      "fact": "Shay's proposed path back runs through communalization -- telling the story of what happened to a community able to hear and accept it without turning away -- and through griefwork, an officially sanctioned mourning for the dead that Vietnam-era individual rotation policies made especially difficult to complete; stable, long-serving units with strong unit cohesion make both more possible.",
      "terms": [
        "communalization",
        "griefwork",
        "unit cohesion"
      ],
      "seeds": [
        "communalization",
        "griefwork"
      ],
      "termInfo": {
        "griefwork": {
          "link": "wiki:Mourning and Melancholia",
          "text": "Freud's term for the psychological labor of mourning a loss, which Shay argues combat units and military institutions must officially sanction and make time for, not merely permit."
        },
        "unit cohesion": {
          "link": "wiki:Unit cohesion",
          "text": "The bonding that keeps a military unit reliable under stress; Shay blames Vietnam-era individual, rather than unit, rotation policies for breaking exactly the cohesion that helps protect against moral injury."
        }
      },
      "info": {
        "text": "Shay's proposed path back from moral injury: officially sanctioned mourning, and a community able to hear a veteran's story without flinching from it."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-moral-community",
      "term": "moral community",
      "clusters": [
        0,
        1
      ],
      "fact": "Shay's argument opens by insisting an army is fundamentally a moral community, not just a fighting force; betrayal by legitimate authority breaks that wider community, and what's left of trust re-forms at the smaller scale of a soldier's special comrades.",
      "relationKind": "dynamic",
      "idealTerms": [
        "themis",
        "special comrade"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-complicated-grief",
      "term": "complicated grief",
      "clusters": [
        1,
        2
      ],
      "fact": "When mourning for a special comrade is blocked and has nowhere sanctioned to go, that unresolved loss -- clinically documented today as complicated grief -- doesn't simply fade; in Shay's account it curdles instead into the fury of the berserk state.",
      "relationKind": "dynamic",
      "idealTerms": [
        "interrupted grief",
        "berserk state"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-bearing-witness",
      "term": "bearing witness",
      "clusters": [
        3,
        4
      ],
      "fact": "Recovery, in Shay's account, isn't spontaneous: it requires someone able to bear witness to a veteran's story without flinching or rushing to judge it -- exactly the capacity that unanswered social withdrawal forecloses.",
      "relationKind": "dynamic",
      "idealTerms": [
        "social withdrawal",
        "communalization"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-12",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    }
  ]
});
