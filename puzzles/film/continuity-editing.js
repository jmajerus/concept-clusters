// Generated from content/puzzles/continuity-editing.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "continuity-editing",
  "title": "Continuity editing",
  "category": "Film",
  "info": {
    "text": "Classical continuity cutting keeps a scene readable: who sits where, what a look is aimed at, and which interchangeable angles the editor can cut among without the space flipping.",
    "link": "wiki:Continuity editing",
    "citations": [
      {
        "title": "Continuity editing",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Continuity_editing"
      },
      {
        "title": "Film Art: An Introduction",
        "author": "David Bordwell and Kristin Thompson",
        "publisher": "McGraw-Hill",
        "year": "2006"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-spatial-continuity",
      "name": "Spatial continuity",
      "color": "teal",
      "fact": "Spatial continuity keeps the viewer's map of a scene stable: the 180-degree rule holds the camera on one side of an imaginary axis so screen direction -- who sits left, who looks right -- does not flip, and crossing the line is the named mistake of cutting to the other side.",
      "terms": [
        "180-degree rule",
        "screen direction",
        "crossing the line"
      ],
      "seeds": [
        "180-degree rule",
        "screen direction"
      ],
      "termInfo": {
        "180-degree rule": {
          "text": "Keep the camera on one side of an imaginary axis between two subjects so their left-right positions stay consistent from shot to shot.",
          "link": "wiki:180-degree rule"
        },
        "screen direction": {
          "text": "The left/right way people and motion read on the screen -- the property the 180-degree rule is there to protect.",
          "link": "wiki:Screen direction"
        },
        "crossing the line": {
          "text": "Cutting to the opposite side of the axis, which swaps who sits left and who sits right and can make a conversation look like both people face the same way."
        }
      },
      "info": {
        "citations": [
          {
            "title": "180-degree rule",
            "publisher": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/180-degree_rule"
          }
        ]
      }
    },
    {
      "id": "cluster-matching-across-the-cut",
      "name": "Matching across the cut",
      "color": "blue",
      "fact": "A cut can pass unnoticed when something already underway continues through it: a match on action picks up a motion in progress, an eyeline match follows a look to what is being seen, and a POV shot goes further by occupying the looker's optical place.",
      "terms": [
        "match on action",
        "eyeline match",
        "POV shot"
      ],
      "seeds": [
        "match on action",
        "eyeline match"
      ],
      "termInfo": {
        "match on action": {
          "text": "A cut that continues a physical motion already in progress -- an arm mid-swing, a door mid-open -- so the splice feels like one action rather than two shots."
        },
        "eyeline match": {
          "text": "A shot of someone looking off-screen followed by a shot of what they are looking at, so the audience infers the gaze even though both were never in the same frame.",
          "link": "wiki:Eyeline match"
        },
        "POV shot": {
          "text": "A subjective camera that shows the scene as a character sees it, rather than cutting to the object of the look from an observer's angle.",
          "link": "wiki:Point-of-view shot"
        }
      }
    },
    {
      "id": "cluster-scene-coverage",
      "name": "Scene coverage",
      "color": "amber",
      "fact": "Coverage is the set of interchangeable angles a scene is broken into: a master shot holds the whole action in view, shot-reverse-shot alternates opposing singles for a conversation, an over-the-shoulder shot keeps the listener's shoulder in the foreground, and an insert reframes a detail already present in the master.",
      "terms": [
        "master shot",
        "shot-reverse-shot",
        "over-the-shoulder shot",
        "insert shot"
      ],
      "seeds": [
        "master shot",
        "shot-reverse-shot"
      ],
      "termInfo": {
        "master shot": {
          "text": "A recording of the entire scene from an angle that keeps all the players in view -- the wide backbone other angles are cut against.",
          "link": "wiki:Master shot"
        },
        "shot-reverse-shot": {
          "text": "Alternating shots of two people looking toward each other, usually in conversation, so the viewer reads them as facing one another across the cut.",
          "link": "wiki:Shot reverse shot"
        },
        "over-the-shoulder shot": {
          "text": "A closer angle framed past the near person's shoulder and head, used in pairs so each speaker is seen from the other's side of the conversation.",
          "link": "wiki:Over-the-shoulder shot"
        },
        "insert shot": {
          "text": "A closer view of a detail already covered in the master -- a clock, a letter, a hand on an object -- reframed so the editor can point at it without leaving the scene.",
          "link": "wiki:Insert (filmmaking)"
        }
      },
      "info": {
        "link": "wiki:Camera coverage",
        "citations": [
          {
            "title": "Camera coverage",
            "publisher": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Camera_coverage"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-establishing-shot",
      "term": "establishing shot",
      "clusters": [
        0,
        2
      ],
      "fact": "An establishing shot orients the scene's geography -- who and what belong where -- and typically opens coverage as the wide from which closer angles will be cut.",
      "info": {
        "text": "Usually a long or extreme-long shot at the start of a scene that shows where the rest of the action takes place; a master can do double duty as one, but an establishing shot can also be an exterior that never appears in the coverage of the room.",
        "link": "wiki:Establishing shot"
      },
      "termRole": "reference",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "master shot"
      ]
    }
  ],
  "lenses": [
    {
      "id": "keep-left-and-right",
      "prompt": "Which concepts name the rule that keeps left and right from flipping, the property that rule protects, or the named mistake of breaking it?",
      "explanation": "The 180-degree rule is the constraint, screen direction is the left/right map it protects, and crossing the line is the named cut that breaks it. An establishing shot can show the room, but it does not name the rule, the property, or the mistake.",
      "targets": [
        "180-degree rule",
        "screen direction",
        "crossing the line"
      ],
      "reasons": {
        "180-degree rule": "Names the constraint: stay on one side of the axis so left and right do not swap.",
        "screen direction": "Names the left/right reading the rule is there to keep consistent.",
        "crossing the line": "Names the mistake of cutting to the other side of the axis."
      }
    },
    {
      "id": "continue-through-the-splice",
      "prompt": "Which concepts are named for continuing something already in progress across a single cut: a physical motion, a gaze to its object, or the camera occupying the looker's eyes?",
      "explanation": "Match on action continues a motion already underway, an eyeline match continues a look to what is being seen, and a POV shot continues that look by occupying the looker's optical place. Shot-reverse-shot is a pair of camera setups for conversation, not a name for what continues through one splice.",
      "targets": [
        "match on action",
        "eyeline match",
        "POV shot"
      ],
      "reasons": {
        "match on action": "Named for picking up a physical motion in progress on the far side of the cut.",
        "eyeline match": "Named for following a gaze to its object across a single splice.",
        "POV shot": "Named for occupying the looker's eyes rather than showing the object from an observer's angle."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Where this cutting grammar sits in a broader survey of film form, and how sound can carry continuity across a picture cut."
    },
    "entries": [
      {
        "id": "film-theory-basics",
        "reason": "The visual survey of cinematography, editing, and narrative is the wider map; this puzzle is the classical cutting grammar inside that editing layer.",
        "via": [
          "editing"
        ]
      },
      {
        "id": "sound-design-in-film",
        "reason": "A J cut lets the next scene's sound arrive before its picture -- continuity carried by the soundtrack across a picture splice.",
        "via": [
          "J cut"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "optional",
    "title": "Invisible cutting",
    "summary": "Classical continuity treats the cut as something the audience should not notice, unlike montage, which collides shots to generate a new idea.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Most commercial films are cut so the audience can follow the story without noticing the splices. That tradition treats the cut as a way to keep space and action readable, rather than as a collision meant to generate a new association the pictures did not have separately.\n\nThis puzzle is about the grammar of that \"invisible\" style -- how a scene stays spatially and temporally followable even though the camera keeps jumping."
    },
    "citations": [
      {
        "title": "Continuity editing",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Continuity_editing"
      }
    ],
    "revision": 1
  },
  "generativeAssistance": [
    {
      "system": "Cursor Grok 4.6",
      "scope": "puzzle",
      "role": "drafted"
    },
    {
      "system": "Cursor Grok 4.6",
      "scope": "lenses",
      "role": "drafted"
    }
  ]
});
