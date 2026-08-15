// Generated from content/puzzles/power-authority-and-the-state.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "power-authority-and-the-state",
  "title": "Power, Authority, and the State",
  "category": "Political Science",
  "large": true,
  "info": {
    "text": "The concepts political scientists use to describe what a state is, why people obey it, and where its right to rule is said to come from.",
    "link": "wiki:Political science"
  },
  "clusters": [
    {
      "id": "elements-of-a-state",
      "name": "Elements of a State",
      "color": "teal",
      "fact": "The Montevideo Convention (1933) named these four qualifications as the customary definition of statehood in international law: a state need not be recognized by anyone else to legally exist.",
      "terms": [
        "defined territory",
        "permanent population",
        "effective government",
        "capacity for foreign relations"
      ],
      "seeds": [
        "defined territory",
        "permanent population"
      ],
      "info": {
        "text": "The traditional legal checklist for what counts as a state, first codified for the Americas in 1933 and now treated as customary international law.",
        "link": "wiki:Montevideo Convention"
      }
    },
    {
      "id": "webers-types-of-legitimate-authority",
      "name": "Weber's Types of Legitimate Authority",
      "color": "blue",
      "fact": "Max Weber argued that durable rule needs more than force -- it needs a claim that obedience is right -- and found three different grounds on which people accept a ruler's claim as legitimate.",
      "terms": [
        "traditional authority",
        "charismatic authority",
        "rational-legal authority"
      ],
      "seeds": [
        "traditional authority",
        "charismatic authority"
      ],
      "termInfo": {
        "charismatic authority": {
          "link": "wiki:Charismatic authority"
        },
        "rational-legal authority": {
          "link": "wiki:Rational-legal authority"
        },
        "traditional authority": {
          "link": "wiki:Traditional authority"
        }
      },
      "info": {
        "text": "Sociologist Max Weber's three-part answer to why people obey political authority at all, rather than simply submitting to superior force.",
        "link": "wiki:Tripartite classification of authority"
      }
    },
    {
      "id": "french-and-ravens-bases-of-power",
      "name": "French and Raven's Bases of Power",
      "color": "amber",
      "fact": "Social psychologists John French and Bertram Raven catalogued five distinct sources from which one person's power over another can come -- from the ability to punish to simple admiration.",
      "terms": [
        "coercive power",
        "reward power",
        "legitimate power",
        "expert power",
        "referent power"
      ],
      "seeds": [
        "coercive power",
        "reward power"
      ],
      "info": {
        "text": "A 1959 taxonomy from social psychology naming the different resources that let one person influence another, independent of whether that influence is legitimate.",
        "link": "wiki:French and Raven's bases of power"
      }
    },
    {
      "id": "sovereignty",
      "name": "Sovereignty",
      "color": "magenta",
      "fact": "Sovereignty is supreme authority over a territory, but the claim splits in two directions: control over what happens inside a state's own borders, and recognition of that state's independence by everyone outside them.",
      "terms": [
        "internal sovereignty",
        "external sovereignty",
        "popular sovereignty"
      ],
      "seeds": [
        "internal sovereignty",
        "external sovereignty"
      ],
      "termInfo": {
        "popular sovereignty": {
          "link": "wiki:Popular sovereignty"
        }
      },
      "info": {
        "text": "Supreme, independent authority over a territory -- the core claim every state makes, both toward its own population and toward the rest of the world.",
        "link": "wiki:Sovereignty"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-legitimacy",
      "term": "legitimacy",
      "clusters": [
        0,
        1
      ],
      "fact": "An 'effective government' is not just one that controls territory by force; Weber's point is that lasting effectiveness rests on some claim to legitimacy, whichever of the three grounds it draws on.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Political legitimacy"
      },
      "idealTerms": [
        "effective government",
        null
      ]
    },
    {
      "id": "bridge-recognition",
      "term": "recognition",
      "clusters": [
        0,
        3
      ],
      "fact": "A state's real capacity for foreign relations depends on other states granting diplomatic recognition of its external sovereignty -- sovereignty claimed at home only becomes sovereignty exercised abroad once others acknowledge it.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Diplomatic recognition"
      },
      "idealTerms": [
        "capacity for foreign relations",
        "external sovereignty"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 0
      }
    },
    {
      "id": "bridge-obedience",
      "term": "obedience",
      "clusters": [
        1,
        2
      ],
      "fact": "Both frameworks classify why someone complies with another's power: Weber sorts the specific claims to legitimacy that make obedience feel right, while French and Raven catalogue power's sources more broadly, including ones -- like coercion -- that need no legitimacy at all.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Obedience (human behavior)"
      },
      "idealTerms": [
        null,
        "legitimate power"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-09"
    }
  ]
});
