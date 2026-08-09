// Generated from content/puzzles/genre-and-spectatorship.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "genre-and-spectatorship",
  "title": "Genre and spectatorship",
  "category": "Film",
  "info": {
    "link": "wiki:Film theory",
    "text": "How a film gets built from recognizable, repeated pieces, and how a viewer relates to what's on screen once it's playing."
  },
  "relatedPuzzles": {
    "info": {
      "text": "A closer look at two ideas that survey briefly touched -- genre and the viewer's relationship to the story."
    },
    "entries": [
      {
        "id": "film-theory-basics",
        "via": [
          "genre",
          "narrator"
        ],
        "reason": "Return to genre and narrator with a much closer look at how audiences actually read them."
      },
      {
        "id": "lacans-three-registers",
        "via": [
          "the gaze"
        ],
        "reason": "See the Lacanian psychoanalytic framework that the male gaze directly borrows from."
      }
    ]
  },
  "lenses": [
    {
      "explanation": "Iconography, stock characters, and genre hybridity are all part of what a film puts on screen. Star persona is also something external and visible -- brought in by a performer's public history -- rather than a psychological event inside the viewer. All four are perceived, not felt from within.",
      "id": "on-screen-versus-in-mind",
      "prompt": "Which concepts are things a film displays or performs, rather than a response happening inside the audience?",
      "reasons": {
        "hybridity": "A property of how the film itself blends genres.",
        "iconography": "A visible, recognizable image the film puts on screen.",
        "star persona": "An external, public identity a performer brings with them, not an internal viewer response.",
        "stock character": "A recognizable character type the film performs."
      },
      "targets": [
        "iconography",
        "stock character",
        "hybridity",
        "star persona"
      ]
    },
    {
      "explanation": "Identification, suspending disbelief, and being positioned by the camera's gaze are all things that happen to, or in, a viewer. A critical canon is a related but distinct kind of audience-side event -- not one viewer's private experience, but the collective judgment of many viewers and critics over time about which films matter.",
      "id": "audience-side-events",
      "prompt": "Which concepts describe something happening in the audience's mind or in critical reception, rather than in the film's own construction?",
      "reasons": {
        "canon": "The collective judgment of critics and audiences over time, not a feature of any one film.",
        "identification": "A psychological process happening inside a viewer.",
        "male gaze": "Describes how a viewer is positioned, not what the film displays.",
        "suspension of disbelief": "A choice a viewer makes about how to receive the fiction."
      },
      "targets": [
        "identification",
        "suspension of disbelief",
        "male gaze",
        "canon"
      ]
    },
    {
      "explanation": "Typecasting and a paratext both bring something from outside the film itself -- an actor's past roles, a trailer, a director's name -- into how the story is read before it even begins. Star persona is the raw material both draw on: the accumulated public identity a typecast performance leans on, and one of the clearest paratexts a studio can put in a trailer.",
      "id": "outside-forces",
      "prompt": "Which concepts describe an outside force -- a performer's history, a promotional campaign, a director's reputation -- shaping how a film gets read before the story even starts?",
      "reasons": {
        "paratext": "Imports promotional and reputational material from outside the film itself.",
        "star persona": "The underlying public identity that both typecasting and paratext draw on.",
        "typecasting": "Imports an actor's past roles into how a new one is read."
      },
      "targets": [
        "typecasting",
        "paratext",
        "star persona"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-genre-conventions",
      "name": "Genre conventions",
      "color": "teal",
      "fact": "Genres are built from repeated, recognizable pieces: iconography that signals a genre at a glance, conventions audiences expect a story to follow, stock characters like the gunslinger or the femme fatale that recur across films, and hybrid genres that blend more than one set of expectations at once.",
      "terms": [
        "iconography",
        "convention",
        "hybridity",
        "stock character"
      ],
      "seeds": [
        "iconography",
        "convention"
      ],
      "termInfo": {
        "convention": {
          "link": "wiki:Film genre",
          "text": "A structural or narrative pattern audiences have learned to expect a genre's stories to follow."
        },
        "hybridity": {
          "link": "wiki:Film genre",
          "text": "A film blending more than one genre's conventions and expectations at once."
        },
        "iconography": {
          "link": "wiki:Iconography",
          "text": "Recurring visual symbols -- a six-shooter, a flying saucer -- that signal a genre to the audience at a glance."
        },
        "stock character": {
          "link": "wiki:Stock character",
          "text": "A recurring, easily recognized character type, like the gunslinger or the femme fatale."
        }
      },
      "info": {
        "link": "wiki:Film genre"
      }
    },
    {
      "id": "cluster-spectatorship",
      "name": "Spectatorship",
      "color": "blue",
      "fact": "Spectatorship theory studies how a viewer relates to what's on screen: identifying with a character, suspending disbelief in the fiction, being positioned by the camera's gaze, and bringing a star's persona from outside the film into how a role is read.",
      "terms": [
        "identification",
        "suspension of disbelief",
        "male gaze",
        "star persona"
      ],
      "seeds": [
        "identification",
        "suspension of disbelief"
      ],
      "termInfo": {
        "identification": {
          "link": "wiki:Identification (literature)",
          "text": "The process by which a viewer comes to see themselves in, or closely relate to, a character."
        },
        "male gaze": {
          "link": "wiki:Male gaze",
          "text": "Laura Mulvey's term for how mainstream cinema often frames and positions women as objects for a presumed male viewer's look."
        },
        "star persona": {
          "link": "wiki:Movie star",
          "text": "The public identity a performer accumulates across roles and publicity, which audiences bring with them into a new film."
        },
        "suspension of disbelief": {
          "link": "wiki:Suspension of disbelief",
          "text": "A viewer's willingness to accept a fiction's premises rather than question their implausibility."
        }
      },
      "info": {
        "link": "wiki:Film theory"
      }
    },
    {
      "id": "cluster-authorship",
      "name": "Authorship",
      "color": "amber",
      "fact": "Auteur theory treats the director as a film's primary author, tracked through a recognizable directorial signature across their body of work -- a claim complicated by collaborative authorship, since writers, cinematographers, and editors all shape the result, and tangled up with how a critical canon gets built and defended.",
      "terms": [
        "auteur theory",
        "collaborative authorship",
        "directorial signature",
        "canon"
      ],
      "seeds": [
        "auteur theory",
        "directorial signature"
      ],
      "termInfo": {
        "auteur theory": {
          "link": "wiki:Auteur theory",
          "text": "The critical claim that a film's director, not its collaborators, is its primary author."
        },
        "canon": {
          "link": "wiki:Literary canon",
          "text": "The set of works critics and institutions treat as significant enough to study, preserve, and hand down."
        },
        "collaborative authorship": {
          "text": "The counter-observation that writers, cinematographers, editors, and performers all substantially shape a finished film."
        },
        "directorial signature": {
          "text": "A recognizable set of stylistic or thematic choices that recur across one director's body of work."
        }
      },
      "info": {
        "link": "wiki:Auteur theory"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-typecasting",
      "term": "typecasting",
      "clusters": [
        0,
        1
      ],
      "fact": "An actor repeatedly cast as the same stock character becomes typecast -- the audience's memory of past roles starts to shape, or limit, how a new one can be read.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Typecasting (acting)",
        "text": "When an actor becomes so associated with one type of role that audiences and casting directors expect it going forward."
      },
      "idealTerms": [
        "stock character",
        "star persona"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-paratext",
      "term": "paratext",
      "clusters": [
        1,
        2
      ],
      "fact": "A paratext -- a trailer, a poster, a director's public reputation -- frames how a viewer approaches a film before a single frame plays, folding authorship into the very act of spectatorship.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Paratext",
        "text": "The framing material around a work -- titles, trailers, promotional material, a creator's reputation -- that shapes how it's read before or alongside the work itself."
      },
      "idealTerms": [
        "star persona",
        "directorial signature"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "bridge-revisionist-western",
      "term": "revisionist Western",
      "clusters": [
        0,
        2
      ],
      "fact": "A revisionist Western doesn't just work within the genre's stock characters and conventions -- it consciously subverts them, one of the clearest cases of a director's authorial stamp reshaping a genre from inside it.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Revisionist Western",
        "text": "A Western that consciously reworks or subverts the genre's expected conventions as a mark of directorial intent, rather than following them straightforwardly."
      },
      "idealTerms": [
        "stock character",
        "auteur theory"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
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
