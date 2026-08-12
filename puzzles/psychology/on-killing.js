// Generated from content/puzzles/on-killing.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "on-killing",
  "title": "On Killing",
  "category": "Psychology",
  "categories": [
    "Psychology",
    "Political Science"
  ],
  "large": true,
  "tags": [
    "book",
    "war"
  ],
  "info": {
    "citations": [
      {
        "author": "Grossman, Dave",
        "publisher": "Back Bay Books",
        "title": "On Killing: The Psychological Cost of Learning to Kill in War and Society",
        "year": "1996"
      }
    ],
    "link": "wiki:On Killing",
    "text": "Dave Grossman's argument that human beings carry a deep, documented resistance to killing their own kind -- and what it costs, psychologically, to train a soldier out of it."
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-and-violence",
        "via": [
          "violence",
          "instrumentality"
        ],
        "reason": "Grossman documents the individual psychology that has to be overridden before violence becomes possible; Arendt asks what violence is for at the political level once that threshold is crossed."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "Each of these is a lever a twentieth-century military could pull on purpose -- a drill, a legitimizing chain of command, or a piece of training technology -- to raise the historically low rate at which soldiers actually fired to kill. Cultural and moral distance can also be cultivated, but they work through belief and narrative, not through a specific training apparatus.",
      "id": "engineered-to-override",
      "prompt": "Which concepts describe a specific method built into modern military training itself -- a drill, a chain of command, or a training technology -- rather than a broader cultural or moral belief that surrounds the war?",
      "reasons": {
        "mechanical distance": "Training simulators recreate the same screen-and-sight remove found in real combat technology, so the conditioned reflex is first practiced on a target, not a person."
      },
      "targets": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "target discrimination",
        "mechanical distance"
      ]
    },
    {
      "explanation": "Distance and technology change how vivid a kill feels in the moment; these four instead work on what it means -- letting a killer locate the moral weight of the act in the enemy's difference, the cause's justice, a superior's order, or a story told afterward, anywhere but in a single unshared choice.",
      "id": "relocating-responsibility",
      "prompt": "Which concepts work by relocating the moral responsibility or justification for a kill onto something other than the killer's own individual choice -- the enemy's supposed otherness, the cause's rightness, a superior's order, or a story told afterward -- rather than simply by making the act feel more distant or less vivid?",
      "reasons": {
        "authorization": "The same displacement Stanley Milgram's obedience experiments demonstrated in a laboratory: moral responsibility migrates to whoever gave the order."
      },
      "targets": [
        "cultural distance",
        "moral distance",
        "authorization",
        "rationalization"
      ]
    }
  ],
  "clusters": [
    {
      "id": "resistance-to-killing",
      "name": "The Resistance to Killing",
      "color": "olive",
      "fact": "Across military history, most participants in close, face-to-face combat did not fire to kill -- an instinctive resistance to killing one's own kind so strong that, like the posturing and submission signals that let animals of the same species fight without dying, much of what looks like combat is aimed at avoiding a kill, not accomplishing one.",
      "terms": [
        "instinctive resistance",
        "posturing",
        "ratio of fire",
        "submission signals"
      ],
      "seeds": [
        "instinctive resistance",
        "posturing"
      ],
      "termInfo": {
        "posturing": {
          "link": "wiki:Agonistic behaviour",
          "text": "Displaying aggression -- size, noise, threat -- without actually attacking, the way many animals, and much of historical hand-to-hand combat, settle contests without a kill."
        },
        "ratio of fire": {
          "text": "S. L. A. Marshall's contested claim that as few as 15 to 20 percent of World War II riflemen in a position to fire on the enemy actually did so."
        }
      },
      "info": {
        "link": "wiki:Agonistic behaviour",
        "text": "The documented reluctance most human beings feel toward killing another person, especially at close range."
      }
    },
    {
      "id": "mechanisms-of-distance",
      "name": "Mechanisms of Distance",
      "color": "blue",
      "fact": "The emotional cost of killing falls as the distance from the victim grows -- whether that distance is physical range, a perceived cultural gulf, a belief in the cause's moral legitimacy, or a scope, screen, or machine standing between the killer and the target.",
      "terms": [
        "physical distance",
        "cultural distance",
        "moral distance",
        "mechanical distance"
      ],
      "seeds": [
        "physical distance",
        "cultural distance"
      ],
      "termInfo": {
        "cultural distance": {
          "link": "wiki:Dehumanization",
          "text": "Framing an enemy as racially, ethnically, or culturally other -- making them feel less like a specific person and more like a category."
        },
        "mechanical distance": {
          "text": "A sight, screen, or intervening machine -- a rifle scope, a bomber's altitude -- that turns a person into a technical target."
        },
        "moral distance": {
          "link": "wiki:Just war theory",
          "text": "A belief that the killing is sanctioned -- required by a just cause, a legitimate authority, or the rules of war -- which can matter as much to a killer's willingness as literal range."
        }
      },
      "info": {
        "text": "How range, perceived cultural difference, belief in a cause's rightness, and intervening technology each let a person put figurative or literal space between themselves and someone they kill."
      }
    },
    {
      "id": "training-to-overcome-resistance",
      "name": "Training to Overcome Resistance",
      "color": "amber",
      "fact": "Twentieth-century militaries replaced static bullseye targets with realistic, human-shaped targets that dropped when hit, drilling soldiers through operant conditioning to fire reflexively; repeated exposure produced desensitization, and a legitimate chain of command gave soldiers authorization to fire without individually weighing each shot.",
      "terms": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "target discrimination"
      ],
      "seeds": [
        "operant conditioning",
        "desensitization"
      ],
      "termInfo": {
        "authorization": {
          "link": "wiki:Milgram experiment",
          "text": "Acting against one's own resistance simply because a legitimate authority gave the order -- the same dynamic Stanley Milgram documented in his obedience experiments."
        },
        "desensitization": {
          "link": "wiki:Desensitization (psychology)",
          "text": "A diminished emotional response to a distressing stimulus after repeated exposure to it."
        },
        "operant conditioning": {
          "link": "wiki:Operant conditioning",
          "text": "Learning a behavior by repeatedly pairing it with a consequence, until the response becomes automatic rather than deliberated."
        },
        "target discrimination": {
          "text": "Training with realistic, human-shaped targets that fall when hit, instead of abstract bullseyes, so the body learns to fire on a human silhouette without conscious deliberation."
        }
      },
      "info": {
        "link": "wiki:Operant conditioning",
        "text": "The specific training techniques twentieth-century militaries developed to raise the historically low rate at which soldiers actually fired on the enemy."
      }
    },
    {
      "id": "the-cost-of-killing",
      "name": "The Cost of Killing",
      "color": "brown",
      "fact": "Grossman traces a predictable emotional sequence after killing -- exhilaration, then guilt, then rationalization and acceptance -- that plays out even in soldiers who believe the killing was justified, and that across a fighting force shows up as psychiatric casualties: breakdowns caused not by wounds but by killing and its aftermath.",
      "terms": [
        "guilt",
        "exhilaration",
        "rationalization",
        "psychiatric casualties"
      ],
      "seeds": [
        "guilt",
        "exhilaration"
      ],
      "termInfo": {
        "guilt": {
          "link": "wiki:Guilt (emotion)",
          "text": "A moral emotion that occurs when a person believes they have violated their own or a shared standard of conduct."
        },
        "psychiatric casualties": {
          "link": "wiki:Psychiatric casualty",
          "text": "Combatants unable to continue fighting because of psychological breakdown rather than physical wounds."
        },
        "rationalization": {
          "link": "wiki:Rationalization (psychology)",
          "text": "Constructing a seemingly logical reason for an act after the fact, to defend against guilt and protect one's own self-image."
        }
      },
      "info": {
        "text": "The emotional and psychological toll that killing exacts on the person who does it, independent of whether the killing was necessary or justified."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-close-combat",
      "term": "close combat",
      "clusters": [
        0,
        1
      ],
      "fact": "Resistance to killing peaks in close, face-to-face combat -- the exact circumstance that growing physical, cultural, moral, and mechanical distance is designed to escape.",
      "relationKind": "dynamic",
      "idealTerms": [
        "instinctive resistance",
        null
      ]
    },
    {
      "id": "bridge-training-simulators",
      "term": "training simulators",
      "clusters": [
        1,
        2
      ],
      "fact": "The same technological remove that creates mechanical distance in real combat is deliberately recreated in training simulators, so a soldier's very first reflexive shots are already fired at a screen, not a person.",
      "relationKind": "foundation",
      "idealTerms": [
        "mechanical distance",
        "operant conditioning"
      ]
    },
    {
      "id": "bridge-rising-firing-rates",
      "term": "rising firing rates",
      "clusters": [
        2,
        3
      ],
      "fact": "As twentieth-century training raised the share of soldiers who would actually fire on the enemy from roughly 15 to 20 percent in World War II to over 90 percent in Vietnam, the rate of psychiatric breakdown rose in step -- suppressing the resistance did not remove its cost, it postponed it.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "psychiatric casualties"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
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
