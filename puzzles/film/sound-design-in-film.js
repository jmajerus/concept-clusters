// Generated from content/puzzles/sound-design-in-film.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "sound-design-in-film",
  "title": "Sound design in film",
  "category": "Film",
  "info": {
    "link": "wiki:Sound design",
    "text": "A film's soundtrack is built in layers -- what the characters could hear, what only the audience hears, and the craft that shapes both into a mix."
  },
  "relatedPuzzles": {
    "info": {
      "text": "Where the sound layer connects to the rest of film craft, and to the musical fundamentals underneath a score."
    },
    "entries": [
      {
        "id": "film-theory-basics",
        "via": [
          "editing",
          "narrative"
        ],
        "reason": "See how the visual survey of cinematography, editing, and narrative pairs with the sound layer this puzzle adds."
      },
      {
        "id": "music-theory-basics",
        "via": [
          "leitmotif",
          "harmony"
        ],
        "reason": "A film score draws on the same building blocks of harmony and melody covered there -- see where a leitmotif actually comes from."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "Dialogue and ambient sound are usually captured live on set, and sync sound names exactly that practice -- recording kept and used as-is, in contrast to sound built afterward like foley or replaced afterward like ADR.",
      "id": "captured-during-production",
      "prompt": "Which concepts are sound captured or preserved live while filming, rather than added or replaced afterward?",
      "reasons": {
        "ambient sound": "A location's background noise is normally captured live along with everything else.",
        "dialogue": "Actors' lines are normally recorded live during the take.",
        "sync sound": "Names the practice of keeping live-recorded sound, in sync, in the final mix."
      },
      "targets": [
        "dialogue",
        "ambient sound",
        "sync sound"
      ]
    },
    {
      "explanation": "ADR replaces a recorded performance, sound mixing reshapes the balance among everything already gathered, and a needle drop replaces an original score with something that already existed -- all three operate on sound that's already there, rather than naming a category of sound.",
      "id": "reshaping-after-the-fact",
      "prompt": "Which concepts are techniques for reshaping or replacing sound that already exists, rather than a type of sound itself?",
      "reasons": {
        "ADR": "Re-records dialogue that already exists to replace what was captured on set.",
        "needle drop": "Replaces an original score with a pre-existing recording.",
        "sound mixing": "Reshapes the balance among sound elements that are already recorded."
      },
      "targets": [
        "ADR",
        "sound mixing",
        "needle drop"
      ]
    },
    {
      "explanation": "Metadiegetic sound exists only inside one character's head -- diegetic to them, non-diegetic to everyone else. Silence isn't a placement within either category at all; it's the deliberate absence of both. And a needle drop's status depends entirely on how a scene stages it -- the same licensed song can play from a diegetic radio or float in as pure non-diegetic commentary.",
      "id": "blurring-the-source",
      "prompt": "Which concepts involve a sound whose place in -- or out of -- the story world isn't a clean either/or?",
      "reasons": {
        "metadiegetic sound": "Diegetic to the one character imagining or remembering it, non-diegetic to everyone else in the scene.",
        "needle drop": "Can function diegetically or non-diegetically depending entirely on how a scene stages it.",
        "silence": "A deliberate absence of sound altogether, not a placement within either category."
      },
      "targets": [
        "metadiegetic sound",
        "silence",
        "needle drop"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-diegetic-sound",
      "name": "Diegetic sound",
      "color": "teal",
      "fact": "Diegetic sound is anything the characters themselves could plausibly hear: dialogue between them, the footsteps and clatter built afterward through foley, the hum of a location's ambient sound, and music that has a source inside the scene itself.",
      "terms": [
        "dialogue",
        "foley",
        "ambient sound",
        "source music"
      ],
      "seeds": [
        "dialogue",
        "ambient sound"
      ],
      "termInfo": {
        "ambient sound": {
          "link": "wiki:Background noise",
          "text": "The hum, traffic, or chatter that fills a location, usually captured live along with dialogue."
        },
        "dialogue": {
          "link": "wiki:Dialogue",
          "text": "Spoken exchange between characters -- the most familiar kind of diegetic sound."
        },
        "foley": {
          "link": "wiki:Foley (sound design)",
          "text": "Everyday sound effects -- footsteps, cloth, breaking glass -- recreated and added in post-production rather than captured live."
        },
        "source music": {
          "link": "wiki:Diegetic music",
          "text": "Music with a source inside the scene itself -- a radio playing, a band performing -- also called diegetic music."
        }
      },
      "info": {
        "link": "wiki:Diegesis"
      }
    },
    {
      "id": "cluster-non-diegetic-sound",
      "name": "Non-diegetic sound",
      "color": "blue",
      "fact": "Non-diegetic sound reaches only the audience, never the characters: an orchestral score, a narrator's voice-over no one in the scene can hear, and a leitmotif that returns each time to cue a character or idea before a single word is spoken.",
      "terms": [
        "score",
        "voice-over narration",
        "leitmotif"
      ],
      "seeds": [
        "score",
        "voice-over narration"
      ],
      "termInfo": {
        "leitmotif": {
          "link": "wiki:Leitmotif",
          "text": "A short, recurring musical phrase tied to a character, place, or idea, returning each time it matters."
        },
        "score": {
          "link": "wiki:Film score",
          "text": "Original music composed for the film, heard by the audience but not by the characters."
        },
        "voice-over narration": {
          "link": "wiki:Voice-over",
          "text": "A narrating voice laid over the picture, addressing the audience from outside the story world."
        }
      },
      "info": {
        "link": "wiki:Diegesis"
      }
    },
    {
      "id": "cluster-sound-editing-and-design",
      "name": "Sound editing and design",
      "color": "amber",
      "fact": "Sound editing and design shapes everything that ends up in the mix: a J cut lets the next scene's sound arrive before its picture does, ADR replaces dialogue after the fact when the set recording won't work, sound mixing balances every layer together, and sometimes the most powerful choice is silence.",
      "terms": [
        "J cut",
        "ADR",
        "sound mixing",
        "silence"
      ],
      "seeds": [
        "sound mixing",
        "silence"
      ],
      "termInfo": {
        "ADR": {
          "link": "wiki:Automated dialogue replacement",
          "text": "Automated Dialogue Replacement -- re-recording an actor's lines in a studio to replace dialogue that couldn't be used from the set."
        },
        "J cut": {
          "link": "wiki:J cut",
          "text": "An edit where the next scene's audio starts before its picture does, leading the viewer into the cut by ear first."
        },
        "silence": {
          "text": "The deliberate absence of sound, used as a choice rather than a default."
        },
        "sound mixing": {
          "link": "wiki:Sound design",
          "text": "Balancing every layer of dialogue, effects, and music into the finished soundtrack."
        }
      },
      "info": {
        "link": "wiki:Sound design"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-metadiegetic-sound",
      "term": "metadiegetic sound",
      "clusters": [
        0,
        1
      ],
      "fact": "Metadiegetic sound exists only inside one character's mind -- heard by no one else in the scene, yet audible to the film's audience the way non-diegetic sound is.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Diegesis",
        "text": "Sound, often music, presented as a character's internal experience -- imagined, remembered, or hallucinated, rather than truly heard by anyone in the scene."
      },
      "idealTerms": [
        null,
        null
      ]
    },
    {
      "id": "bridge-sync-sound",
      "term": "sync sound",
      "clusters": [
        0,
        2
      ],
      "fact": "Sync sound is dialogue recorded live on set and kept in the final mix -- the direct alternative to replacing it later with ADR.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Sync sound",
        "text": "Sound recorded at the same time as the picture, synchronized to it exactly."
      },
      "idealTerms": [
        "dialogue",
        "ADR"
      ]
    },
    {
      "id": "bridge-needle-drop",
      "term": "needle drop",
      "clusters": [
        1,
        2
      ],
      "fact": "A needle drop swaps an original score for a licensed, pre-existing recording -- a choice made during the mix, in place of composing new music.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Needle drop",
        "text": "The use of a pre-existing, licensed recording as a film's music instead of an original composition."
      },
      "idealTerms": [
        "score",
        "sound mixing"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    }
  ],
  "generativeAssistance": [
    {
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    },
    {
      "role": "drafted",
      "scope": "lenses",
      "system": "Claude"
    }
  ]
});
