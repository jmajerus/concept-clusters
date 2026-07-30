// Concept Clusters puzzle: Performance creates meaning
// Large size: 16 cluster terms + 3 bridge terms = 19 nodes.
// Matrix design: production-layer clusters + interpretive lenses.

export default {
  "id": "performance-creates-meaning",
  "title": "Performance creates meaning",
  "category": "Humanities",
  "large": true,
  "info": {
    "text": "A theatrical performance creates meaning through interaction among the written work, embodied choices, design, and an audience responding in shared time and space.",
    "link": "wiki:Theatre"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Compare how meaning is produced and interpreted in written, visual, symbolic, and performed works.",
      "link": "wiki:Performing arts"
    },
    "entries": [
      {
        "id": "interpreting-a-text",
        "via": [
          "dialogue",
          "subtext",
          "interpretation"
        ],
        "reason": "Begin with textual evidence, then examine how actors and designers realize or transform its possibilities in performance."
      },
      {
        "id": "reading-a-painting",
        "via": [
          "composition",
          "visual attention"
        ],
        "reason": "Compare a fixed visual composition with the changing visual emphasis created through staging, movement, and light."
      },
      {
        "id": "myth-ritual-and-symbol",
        "via": [
          "convention",
          "shared attention"
        ],
        "reason": "Explore how repeated forms, symbols, and communal participation shape meaning beyond literal words."
      }
    ]
  },
  "lenses": [
    {
      "id": "meaning-without-spoken-dialogue",
      "prompt": "Which concepts can communicate theatrical meaning to an audience without adding spoken dialogue?",
      "targets": [
        "gesture",
        "blocking",
        "lighting",
        "costume",
        "set design",
        "sound design"
      ],
      "explanation": "Bodies, spatial arrangement, light, clothing, scenery, and sound can establish relationships, mood, status, setting, rhythm, and emphasis without changing the spoken text.",
      "reasons": {
        "gesture": "Movement and expression can communicate intention, emotion, status, or relationship.",
        "blocking": "Where performers stand and move creates spatial relationships and visual emphasis.",
        "lighting": "Light can isolate, reveal, conceal, redirect attention, or establish atmosphere.",
        "costume": "Clothing and appearance communicate period, role, status, affiliation, and transformation.",
        "set design": "The scenic environment suggests place, scale, constraint, symbolism, and social world.",
        "sound design": "Music, ambience, silence, and effects shape setting, tension, rhythm, and expectation."
      }
    },
    {
      "id": "moment-to-moment-emphasis",
      "prompt": "Which concepts can alter moment-to-moment emphasis during a performance without changing the written script?",
      "targets": [
        "vocal delivery",
        "blocking",
        "pacing",
        "lighting",
        "sound design",
        "interpretation"
      ],
      "explanation": "Delivery, movement, tempo, technical cues, and interpretive choices can make the same written scene feel comic, threatening, intimate, distant, urgent, or reflective.",
      "reasons": {
        "vocal delivery": "Stress, pitch, volume, pause, and tone change how a line is heard.",
        "blocking": "Movement and position determine who is visually dominant or isolated at a given moment.",
        "pacing": "The timing of speech, action, and silence changes tension and emphasis.",
        "lighting": "A lighting cue can shift focus or transform the emotional temperature of a scene.",
        "sound design": "A sound or silence can prepare, punctuate, interrupt, or reframe an action.",
        "interpretation": "Performers and directors choose among plausible meanings and organize the production around them."
      }
    },
    {
      "id": "focusing-audience-attention",
      "prompt": "Which concepts can focus an audience's attention on a particular performer, action, or stage moment?",
      "targets": [
        "blocking",
        "pacing",
        "lighting",
        "sound design",
        "shared attention"
      ],
      "explanation": "Spatial composition, timing, light, sound, and the audience's collective orientation can concentrate attention on one part of a complex live event.",
      "reasons": {
        "blocking": "Position and movement can bring a performer or action into visual prominence.",
        "pacing": "A pause, acceleration, or delayed action can make a moment stand out.",
        "lighting": "Brightness, contrast, direction, and cue timing guide the eye.",
        "sound design": "A cue or change in sonic texture can redirect listening and anticipation.",
        "shared attention": "The audience's awareness of attending together helps create a common focus."
      }
    },
    {
      "id": "audience-meaning-making",
      "prompt": "Which concepts directly involve an audience's prior knowledge, attention, response, or interpretation?",
      "targets": [
        "dramatic irony",
        "audience expectation",
        "shared attention",
        "interpretation",
        "applause",
        "theatrical convention"
      ],
      "explanation": "Audiences bring expectations and knowledge, attend collectively, interpret what they perceive, and sometimes respond audibly. Conventions make many stage signs intelligible before any explicit explanation.",
      "reasons": {
        "dramatic irony": "It depends on the audience knowing something that one or more characters do not.",
        "audience expectation": "Genre, publicity, culture, and prior experience shape what spectators anticipate.",
        "shared attention": "Live spectators know that others are attending to the event with them.",
        "interpretation": "Meaning is completed through the audience's inferences, judgments, and emotional responses.",
        "applause": "Applause is a visible and audible audience response that can affect the live event.",
        "theatrical convention": "A learned convention allows audiences to recognize what a stylized action or device signifies."
      }
    },
    {
      "id": "repeated-performance-roles",
      "prompt": "Which concepts appeared in more than one of the preceding performance lenses?",
      "targets": [
        "blocking",
        "pacing",
        "lighting",
        "sound design",
        "shared attention",
        "interpretation"
      ],
      "explanation": "These concepts perform several jobs at once: they shape meaning, control emphasis, organize attention, and connect production choices with audience experience.",
      "reasons": {
        "blocking": "It communicated without dialogue, altered emphasis, and focused attention.",
        "pacing": "It altered emphasis and focused attention.",
        "lighting": "It communicated visually, altered emphasis, and focused attention.",
        "sound design": "It communicated without dialogue, altered emphasis, and focused attention.",
        "shared attention": "It focused the room and also belonged to audience meaning-making.",
        "interpretation": "It guided production choices and described the audience's construction of meaning."
      }
    }
  ],
  "clusters": [
    {
      "name": "Written work",
      "color": "green",
      "fact": "A dramatic text supplies words, actions, structure, and information, but it usually leaves many choices of tone, movement, design, emphasis, and interpretation unresolved.",
      "terms": [
        "dialogue",
        "stage directions",
        "plot",
        "dramatic irony"
      ],
      "seeds": [
        "dialogue",
        "stage directions"
      ],
      "termInfo": {
        "dialogue": {
          "text": "Spoken exchange among characters through which action, conflict, information, and relationship are developed.",
          "link": "wiki:Dialogue"
        },
        "stage directions": {
          "text": "Written instructions or indications concerning action, movement, setting, expression, or technical events in a script.",
          "link": "wiki:Blocking (stage)"
        },
        "plot": {
          "text": "The arranged sequence and causal pattern of events in a dramatic work.",
          "link": "wiki:Plot (narrative)"
        },
        "dramatic irony": {
          "text": "A situation in which the audience knows information that one or more characters lack.",
          "link": "wiki:Dramatic irony"
        }
      },
      "info": {
        "link": "wiki:Drama"
      }
    },
    {
      "name": "Embodied performance",
      "color": "blue",
      "fact": "Actors make a text present through bodies and voices: gesture, delivery, placement, and timing turn written possibilities into particular relationships and actions.",
      "terms": [
        "gesture",
        "vocal delivery",
        "blocking",
        "pacing"
      ],
      "seeds": [
        "gesture",
        "blocking"
      ],
      "termInfo": {
        "gesture": {
          "text": "A movement or bodily expression that communicates action, emotion, intention, relationship, or social meaning.",
          "link": "wiki:Gesture"
        },
        "vocal delivery": {
          "text": "The use of volume, pitch, pace, stress, articulation, and tone in speaking a role.",
          "link": "wiki:Paralanguage"
        },
        "blocking": {
          "text": "The planned positions and movements of performers within the performance space.",
          "link": "wiki:Blocking (stage)"
        },
        "pacing": {
          "text": "The experienced speed and rhythm of dialogue, action, pause, and transition in a performance.",
          "link": "wiki:Tempo"
        }
      },
      "info": {
        "link": "wiki:Acting"
      }
    },
    {
      "name": "Design and staging",
      "color": "amber",
      "fact": "Lighting, costume, scenery, and sound organize the sensory world of a production, guiding attention and making historical, emotional, social, and symbolic claims.",
      "terms": [
        "lighting",
        "costume",
        "set design",
        "sound design"
      ],
      "seeds": [
        "lighting",
        "costume"
      ],
      "termInfo": {
        "lighting": {
          "text": "The design and control of illumination, visibility, color, contrast, focus, and cue timing in performance.",
          "link": "wiki:Stage lighting"
        },
        "costume": {
          "text": "Clothing and appearance designed or selected to help establish character, period, status, movement, and visual composition.",
          "link": "wiki:Costume design"
        },
        "set design": {
          "text": "The creation of scenery and spatial environments for a theatrical production.",
          "link": "wiki:Scenic design"
        },
        "sound design": {
          "text": "The planning and realization of music, ambience, effects, amplification, and silence for a production.",
          "link": "wiki:Sound design"
        }
      },
      "info": {
        "link": "wiki:Stagecraft"
      }
    },
    {
      "name": "Audience and reception",
      "color": "rose",
      "fact": "A performance unfolds for spectators whose expectations, collective attention, interpretations, and responses help make each live event socially and aesthetically distinct.",
      "terms": [
        "audience expectation",
        "shared attention",
        "interpretation",
        "applause"
      ],
      "seeds": [
        "interpretation",
        "applause"
      ],
      "termInfo": {
        "audience expectation": {
          "text": "What spectators anticipate because of genre, publicity, prior knowledge, culture, and earlier experience.",
          "link": "wiki:Audience"
        },
        "shared attention": {
          "text": "A condition in which spectators attend to the same unfolding event while also being aware of one another's presence and responses.",
          "link": "wiki:Audience"
        },
        "interpretation": {
          "text": "The process of constructing meaning from the production's words, actions, designs, conventions, and context.",
          "link": "wiki:Reception theory"
        },
        "applause": {
          "text": "Clapping or another collective response used to express approval, recognition, or participation in a live event.",
          "link": "wiki:Applause"
        }
      },
      "info": {
        "link": "wiki:Audience"
      }
    }
  ],
  "bridges": [
    {
      "term": "subtext",
      "clusters": [
        0,
        1
      ],
      "relationKind": "evaluation",
      "fact": "Subtext connects the written work with embodied performance because actors and directors infer unspoken motives, tensions, and implications, then express them through voice, gesture, timing, and action.",
      "idealTerms": [
        "dialogue",
        "vocal delivery"
      ],
      "info": {
        "text": "Meaning implied beneath or beyond the literal words and explicit action of a scene.",
        "link": "wiki:Subtext"
      }
    },
    {
      "term": "mise-en-scène",
      "clusters": [
        1,
        2
      ],
      "relationKind": "foundation",
      "fact": "Mise-en-scène connects performance with design by organizing bodies, movement, scenery, costume, lighting, and other visible or audible elements into one staged composition.",
      "idealTerms": [
        "blocking",
        null
      ],
      "info": {
        "text": "The arrangement of performers, setting, lighting, costume, movement, and related elements within a staged scene.",
        "link": "wiki:Mise-en-scène"
      }
    },
    {
      "term": "theatrical convention",
      "clusters": [
        0,
        3
      ],
      "relationKind": "cross-cutting",
      "fact": "A theatrical convention connects the work with its audience because a shared rule or familiar device lets spectators understand stylized actions, narration, staging, or direct address without literal realism.",
      "info": {
        "text": "A learned practice or device that performers and audiences recognize as meaningful within theatre.",
        "link": "wiki:Theatre"
      }
    }
  ]
};
