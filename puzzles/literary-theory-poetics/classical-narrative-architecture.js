// Generated from content/puzzles/classical-narrative-architecture.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "classical-narrative-architecture",
  "title": "Classical narrative architecture",
  "category": "Literary Theory & Poetics",
  "large": true,
  "info": {
    "text": "Aristotelian dramatic mechanics, Homeric epic conventions, and monomythic hero arcs offer three durable ways of describing how classical narratives are built.",
    "link": "wiki:Poetics (Aristotle)",
    "seeAlso": [
      {
        "label": "Stanford Encyclopedia: Aristotle's Rhetoric",
        "href": "https://plato.stanford.edu/entries/aristotle-rhetoric/"
      },
      {
        "label": "Perseus Digital Library",
        "href": "http://www.perseus.tufts.edu/hopper/"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-aristotelian-dramatic-poetics",
      "name": "Aristotelian dramatic poetics",
      "color": "teal",
      "fact": "Aristotle's Poetics treats tragedy as a unified imitation of an action that moves through recognition and reversal toward pity, fear, and emotional purgation.",
      "terms": [
        "anagnorisis",
        "catharsis",
        "hamartia",
        "peripeteia",
        "classical unities",
        "hubris"
      ],
      "seeds": [
        "anagnorisis",
        "catharsis"
      ],
      "termInfo": {
        "anagnorisis": {
          "text": "A critical discovery or recognition that changes what the protagonist understands about identity, situation, or past action.",
          "link": "wiki:Anagnorisis"
        },
        "catharsis": {
          "text": "The emotional purgation or clarification that tragedy is said to produce through pity and fear.",
          "link": "wiki:Catharsis"
        },
        "hamartia": {
          "text": "A tragic error or flaw in judgment that helps bring about the protagonist's downfall.",
          "link": "wiki:Hamartia"
        },
        "peripeteia": {
          "text": "A sudden reversal of the protagonist's fortunes within the plotted action.",
          "link": "wiki:Peripeteia"
        },
        "classical unities": {
          "text": "Later neoclassical constraints—often of action, time, and place—derived from readings of Aristotelian dramatic coherence.",
          "link": "wiki:Classical unities"
        },
        "hubris": {
          "text": "Excessive pride or defiance that oversteps human limits and invites catastrophic correction.",
          "link": "wiki:Hubris"
        }
      },
      "info": {
        "link": "wiki:Poetics (Aristotle)"
      }
    },
    {
      "id": "cluster-homeric-epic-conventions",
      "name": "Homeric epic conventions",
      "color": "blue",
      "fact": "Classical epic uses elevated register, formulaic oral technique, and structural openings that place the audience inside a long heroic history already underway.",
      "terms": [
        "in medias res",
        "invocation of the Muse",
        "dactylic hexameter",
        "formulaic epithets",
        "Telemachy",
        "epic catalog"
      ],
      "seeds": [
        "in medias res",
        "invocation of the Muse"
      ],
      "termInfo": {
        "in medias res": {
          "text": "Beginning a narrative in the middle of the action rather than at chronological origin.",
          "link": "wiki:In medias res"
        },
        "invocation of the Muse": {
          "text": "An opening appeal to a Muse for memory, authority, and the telling of the tale.",
          "link": "wiki:Invocation (poetry)"
        },
        "dactylic hexameter": {
          "text": "The six-foot metrical line conventional to Greek and Latin epic verse.",
          "link": "wiki:Dactylic hexameter"
        },
        "formulaic epithets": {
          "text": "Repeated characterizing phrases that aid oral composition and recognition (for example, \"swift-footed Achilles\").",
          "link": "wiki:Epithet"
        },
        "Telemachy": {
          "text": "The early Odyssey books centered on Telemachus's search, which frame Odysseus's larger return.",
          "link": "wiki:Telemachy"
        },
        "epic catalog": {
          "text": "A formal list of warriors, ships, places, or peoples that expands the epic's world and authority.",
          "link": "wiki:Catalogue of Ships"
        }
      },
      "info": {
        "link": "wiki:Epic poetry"
      }
    },
    {
      "id": "cluster-monomythic-archetypal-journey",
      "name": "Monomythic hero arc",
      "color": "amber",
      "fact": "Joseph Campbell's monomyth describes a recurring pattern in which a hero leaves the ordinary world, undergoes initiation, and returns transformed.",
      "terms": [
        "call to adventure",
        "crossing the threshold",
        "meeting with the mentor",
        "belly of the whale",
        "apotheosis",
        "ultimate boon"
      ],
      "seeds": [
        "call to adventure",
        "crossing the threshold"
      ],
      "termInfo": {
        "call to adventure": {
          "text": "The summons that draws the hero out of ordinary life toward a larger ordeal.",
          "link": "wiki:Hero's journey"
        },
        "crossing the threshold": {
          "text": "The passage from the familiar world into the zone of adventure and danger.",
          "link": "wiki:Hero's journey"
        },
        "meeting with the mentor": {
          "text": "An encounter that supplies guidance, tools, or courage for the journey ahead.",
          "link": "wiki:Hero's journey"
        },
        "belly of the whale": {
          "text": "A stage of enclosure or apparent annihilation from which the hero's transformation proceeds.",
          "link": "wiki:Hero's journey"
        },
        "apotheosis": {
          "text": "A climax of elevation or insight in which the hero attains a higher state of being or understanding.",
          "link": "wiki:Apotheosis"
        },
        "ultimate boon": {
          "text": "The decisive gift, knowledge, or prize won in the special world and brought back for others.",
          "link": "wiki:Hero's journey"
        }
      },
      "info": {
        "link": "wiki:Hero's journey"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-katabasis",
      "term": "katabasis",
      "clusters": [
        1,
        2
      ],
      "fact": "A descent to the underworld—such as Odysseus's or Aeneas's—is a central epic ordeal that also matches the monomyth's abyss of death and rebirth.",
      "info": {
        "text": "A narrative descent into the underworld or an equivalent realm of death and counsel.",
        "link": "wiki:Katabasis"
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "in medias res",
        "belly of the whale"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-dramatic-irony",
      "term": "dramatic irony",
      "clusters": [
        0,
        1
      ],
      "fact": "Audiences often know a divine fate or impending catastrophe before the tragic protagonist or epic hero does, so knowledge itself becomes part of the narrative design.",
      "info": {
        "text": "A gap between what the audience knows and what a character understands.",
        "link": "wiki:Irony#Dramatic irony"
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "anagnorisis",
        "invocation of the Muse"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-fatalistic-prophecy",
      "term": "fatalistic prophecy",
      "clusters": [
        0,
        2
      ],
      "fact": "Prophecy can both catalyze Aristotelian hamartia—as in Oedipus—and force a monomythic hero across the threshold into ordeal.",
      "info": {
        "text": "A foretelling that binds characters to a fate they struggle to escape or fulfill.",
        "link": "wiki:Prophecy"
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "hamartia",
        "call to adventure"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "tragic-engine",
      "prompt": "Which concepts belong to the usual Aristotelian machinery of tragic error, reversal, recognition, and audience effect?",
      "explanation": "Hamartia and hubris prepare the fall; peripeteia and anagnorisis turn the action; catharsis names the pity-and-fear effect on the audience. Classical unities belong more to later reception than to this core engine.",
      "targets": [
        "hamartia",
        "hubris",
        "peripeteia",
        "anagnorisis",
        "catharsis"
      ],
      "reasons": {
        "hamartia": "The tragic error or misjudgment through which disaster becomes intelligible.",
        "hubris": "Overreaching pride that helps invite catastrophic correction.",
        "peripeteia": "A sudden reversal of the protagonist's fortunes.",
        "anagnorisis": "A critical recognition that reinterprets identity or prior action.",
        "catharsis": "The clarifying emotional effect tragedy is said to produce in its audience."
      }
    },
    {
      "id": "epic-craft-and-framing",
      "prompt": "Which concepts are specifically about how a classical epic begins?",
      "explanation": "An invocation claims divine authority for the telling, and in medias res places the audience inside action already underway. Hexameter, epithets, catalogs, and the Telemachy belong to ongoing epic craft or to an Odyssey-specific subplot, not to that opening machinery. The work is the exclusion: this is no longer a recitation of the whole Homeric cluster.",
      "targets": [
        "invocation of the Muse",
        "in medias res"
      ],
      "reasons": {
        "invocation of the Muse": "Claims divine authority for memory and telling at the poem's start.",
        "in medias res": "Begins the poem in the midst of action already underway."
      }
    },
    {
      "id": "threshold-and-ordeal",
      "prompt": "Which concepts mark a summons into danger, a passage into ordeal, or a deepening of peril that can appear across tragic, epic, and monomythic storytelling?",
      "explanation": "Call, threshold, and the belly of the whale are monomyth stages of entry and ordeal; katabasis is the epic underworld intensifier of that same depth; prophecy often forces the crossing; and peripeteia is tragedy's sudden turn into peril. This is the board's natural cross-cut: not whole traditions, but shared shapes of being pulled into danger.",
      "targets": [
        "call to adventure",
        "crossing the threshold",
        "belly of the whale",
        "katabasis",
        "fatalistic prophecy",
        "peripeteia"
      ],
      "reasons": {
        "call to adventure": "The summons that draws a hero out of ordinary life toward larger stakes.",
        "crossing the threshold": "The passage from the familiar world into the zone of adventure.",
        "belly of the whale": "Enclosure or symbolic death at the heart of initiation.",
        "katabasis": "Underworld descent as an intensified form of ordeal.",
        "fatalistic prophecy": "A foretelling that presses characters toward danger they struggle to escape or fulfill.",
        "peripeteia": "Tragedy's sudden reversal into a worsened fortune."
      }
    }
  ],
  "generativeAssistance": [
    {
      "system": "Gemini",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Google",
      "date": "2026-08-07"
    },
    {
      "system": "Cursor",
      "scope": "puzzle",
      "role": "edited",
      "provider": "Anysphere",
      "date": "2026-08-07"
    },
    {
      "system": "Cursor",
      "scope": "lenses",
      "role": "edited",
      "provider": "Anysphere",
      "date": "2026-08-21"
    }
  ]
});
