// Generated from content/puzzles/dissonance-and-its-treatment.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "dissonance-and-its-treatment",
  "title": "Dissonance and its treatment",
  "category": "Music",
  "large": true,
  "info": {
    "text": "Dissonance is classified by common-practice interval theory, handled by two different contrapuntal families (the suspension figure and embellishing tones), and separately explained by scale-degree tendency within harmonic function -- three different frameworks for one word.",
    "links": [
      {
        "href": "https://openmusictheory.github.io/intervals.html",
        "label": "Intervals and dyads"
      },
      {
        "href": "https://openmusictheory.github.io/fourthSpecies.html",
        "label": "Fourth-species counterpoint"
      },
      {
        "href": "https://openmusictheory.github.io/embellishingTones.html",
        "label": "Embellishing tones"
      },
      {
        "href": "https://openmusictheory.github.io/tendencyTonesFunctionalDissonances.html",
        "label": "Tendency tones and functional dissonances"
      }
    ],
    "citations": [
      {
        "title": "Intervals and dyads",
        "publisher": "Open Music Theory / Hybrid Pedagogy Publishing",
        "year": "2022",
        "url": "https://openmusictheory.github.io/intervals.html"
      },
      {
        "title": "Composing a fourth-species counterpoint",
        "publisher": "Open Music Theory / Hybrid Pedagogy Publishing",
        "year": "2022",
        "url": "https://openmusictheory.github.io/fourthSpecies.html"
      },
      {
        "title": "Embellishing tones",
        "publisher": "Open Music Theory / Hybrid Pedagogy Publishing",
        "year": "2022",
        "url": "https://openmusictheory.github.io/embellishingTones.html"
      },
      {
        "title": "Tendency tones and functional harmonic dissonances",
        "publisher": "Open Music Theory / Hybrid Pedagogy Publishing",
        "year": "2022",
        "url": "https://openmusictheory.github.io/tendencyTonesFunctionalDissonances.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "dissonant-intervals",
      "name": "Dissonant intervals",
      "color": "amber",
      "fact": "In common-practice tonal theory, seconds, sevenths, and the tritone are dissonant interval classes: each requires resolution or restricted use as a harmonic simultaneity, though stepwise melodic motion built from seconds is unrestricted.",
      "terms": [
        "tritone",
        "minor second",
        "major second",
        "minor seventh",
        "major seventh"
      ],
      "seeds": [
        "tritone",
        "minor second"
      ],
      "termInfo": {
        "tritone": {
          "text": "A six-semitone span, written as an augmented fourth or diminished fifth; both spellings are dissonant in common-practice theory."
        },
        "minor second": {
          "text": "A one-semitone interval. As a harmonic interval it is dissonant, even though stepwise melodic motion can be smooth."
        },
        "major second": {
          "text": "A two-semitone interval. Strict voice-leading treats the simultaneous interval as dissonant while allowing it melodically as a step."
        },
        "minor seventh": {
          "text": "A ten-semitone interval and a dissonance in strict harmonic voice-leading; its context determines how it is introduced and resolved."
        },
        "major seventh": {
          "text": "An eleven-semitone interval, the most dissonant of the sevenths; in tonal harmony it typically resolves by step, often upward to the octave or tonic."
        }
      },
      "info": {
        "text": "Traditional harmonic interval classes whose use is constrained in strict voice-leading.",
        "links": [
          {
            "href": "https://openmusictheory.github.io/intervals.html",
            "label": "Interval classification"
          }
        ]
      }
    },
    {
      "id": "suspension-figure",
      "name": "The suspension figure",
      "color": "magenta",
      "fact": "A suspension is a three-stage figure: a note first sounds consonantly (preparation), is held over into a new harmony where it becomes dissonant (suspension), then resolves by step down into a consonance (resolution).",
      "terms": [
        "suspension",
        "resolution",
        "preparation"
      ],
      "seeds": [
        "suspension",
        "resolution"
      ],
      "termInfo": {
        "suspension": {
          "text": "A prepared note held or tied into a stronger beat, where the other voice changes and turns it into an accented dissonance."
        },
        "resolution": {
          "text": "The motion that releases a dissonance into an allowed consonance; a standard suspension resolves downward by step."
        },
        "preparation": {
          "text": "The consonant occurrence of a note before it is held into the dissonant suspension."
        }
      },
      "info": {
        "text": "How one dissonant note is prepared, sustained, and resolved.",
        "links": [
          {
            "href": "https://openmusictheory.github.io/fourthSpecies.html",
            "label": "Suspensions in counterpoint"
          }
        ]
      }
    },
    {
      "id": "embellishing-tones",
      "name": "Embellishing tones",
      "color": "cyan",
      "fact": "Passing tones, neighbor tones, appoggiaturas, and anticipations are melodic dissonances entered and left by step (or, for the appoggiatura, approached by leap) -- none of them needs the preparation a suspension requires.",
      "terms": [
        "passing tone",
        "neighbor tone",
        "appoggiatura",
        "anticipation"
      ],
      "seeds": [
        "passing tone",
        "neighbor tone"
      ],
      "termInfo": {
        "passing tone": {
          "text": "A non-chord tone approached and left by step in the same direction, filling the space between two chord tones a third apart."
        },
        "neighbor tone": {
          "text": "A non-chord tone that steps away from a chord tone and back to the same chord tone, decorating it without changing the underlying harmony."
        },
        "appoggiatura": {
          "text": "An accented non-chord tone usually approached by leap and resolved by step, 'leaning' into the harmony before settling."
        },
        "anticipation": {
          "text": "A note from the upcoming harmony sounded early, against the current harmony, then held or repeated once that harmony arrives."
        }
      },
      "info": {
        "text": "Ways a dissonant tone enters and leaves melodically, without preparation.",
        "links": [
          {
            "href": "https://openmusictheory.github.io/embellishingTones.html",
            "label": "Embellishing tones"
          }
        ]
      }
    },
    {
      "id": "tendency-tones",
      "name": "Tendency tones",
      "color": "brown",
      "fact": "Tendency tones lean toward specific resolutions based on scale-degree identity and harmonic function, not interval classification alone: the leading tone characteristically rises to the tonic and the lowered sixth characteristically falls to the dominant, though voice-leading can complicate or transfer that pull.",
      "terms": [
        "tendency tone",
        "leading tone",
        "lowered sixth",
        "step inertia",
        "dissonance transfer"
      ],
      "seeds": [
        "tendency tone",
        "leading tone"
      ],
      "termInfo": {
        "tendency tone": {
          "text": "A pitch class that leans toward resolving to a particular neighboring pitch class more than others, independent of whether the interval itself is classified consonant or dissonant."
        },
        "leading tone": {
          "text": "Scale-degree 7 (ti); in dominant-functioning harmony it characteristically resolves up by step to the tonic."
        },
        "lowered sixth": {
          "text": "Scale-degree 6 lowered a half step (le); it characteristically resolves down by step to the dominant, largely independent of harmonic context."
        },
        "step inertia": {
          "text": "A principle by which continuing stepwise motion, often descending, can diminish or override a tendency tone's usual pull, letting it move somewhere other than its expected resolution."
        },
        "dissonance transfer": {
          "text": "Moving a functional dissonance from the voice that introduced it to a different voice before it resolves, rather than resolving it in the voice where it appeared."
        }
      },
      "info": {
        "text": "Dissonance explained by scale-degree pull within harmonic function -- a third framework alongside interval classification and note-to-note counterpoint.",
        "links": [
          {
            "href": "https://openmusictheory.github.io/tendencyTonesFunctionalDissonances.html",
            "label": "Tendency tones and functional dissonances"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "term": "resolution tendency",
      "clusters": [
        0,
        1
      ],
      "fact": "The tritone is defined as much by its resolution tendency as its size -- in a dominant seventh it resolves outward to a sixth or inward to a third, the same resolution logic the suspension figure formalizes as a dissonance's required last stage.",
      "info": {
        "text": "Ties the single most famous resolving dissonance to the general theory of tendency-tone resolution.",
        "links": [
          {
            "href": "https://openmusictheory.github.io/tendencyTonesFunctionalDissonances.html",
            "label": "Tendency tones and functional dissonances"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "dynamic",
      "idealTerms": [
        "tritone",
        "resolution"
      ]
    },
    {
      "term": "stepwise fill",
      "clusters": [
        0,
        2
      ],
      "fact": "A passing tone fills the gap between two chord tones a third apart using exactly the stepwise, second-sized motion that names this interval class.",
      "info": {
        "text": "The interval is the motion that defines the tone type, not a coincidence of naming."
      },
      "termRole": "connector",
      "relationKind": "foundation",
      "idealTerms": [
        "major second",
        "passing tone"
      ]
    },
    {
      "term": "unprepared entry",
      "clusters": [
        1,
        2
      ],
      "fact": "A suspension's dissonance must be prepared -- consonant on the prior beat, then held over. A neighbor tone needs no such preparation, stepping away from and back to the same chord tone.",
      "info": {
        "text": "States the exact line that justified splitting these into two clusters instead of one."
      },
      "termRole": "connector",
      "relationKind": "contrast",
      "idealTerms": [
        "preparation",
        "neighbor tone"
      ]
    },
    {
      "term": "shared half step",
      "clusters": [
        0,
        3
      ],
      "fact": "The leading tone's upward pull to the tonic is a minor second in diatonic contexts -- the same half-step interval classified dissonant when treated as a harmonic simultaneity, here explained by scale-degree tendency instead of interval size alone.",
      "info": {
        "text": "The same physical half-step, explained by two different frameworks."
      },
      "termRole": "connector",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "minor second",
        "leading tone"
      ]
    },
    {
      "term": "resolution site",
      "clusters": [
        1,
        3
      ],
      "fact": "A suspension holds one voice's dissonance to a fixed resolution in that same voice. Dissonance transfer instead moves the unresolved tension to a different voice before it resolves -- two different answers to when and where a dissonance actually resolves.",
      "info": {
        "text": "Contrasts a fixed single-voice resolution with a resolution that moves between voices."
      },
      "termRole": "connector",
      "relationKind": "contrast",
      "idealTerms": [
        "suspension",
        "dissonance transfer"
      ]
    }
  ],
  "lenses": [
    {
      "id": "suspension-figure",
      "prompt": "Which terms name the three stages of a standard dissonant suspension figure?",
      "explanation": "Preparation, suspension, and resolution are successive parts of one figure. A passing tone or neighbor tone is a different contrapuntal use of dissonance, entered without any preparation at all.",
      "targets": [
        "preparation",
        "suspension",
        "resolution"
      ],
      "reasons": {
        "preparation": "The note first sounds consonantly.",
        "suspension": "That note is held while the other voice changes, creating the dissonance.",
        "resolution": "The suspended note then moves down by step to a consonance."
      }
    },
    {
      "id": "tritone-resolution-logic",
      "prompt": "Which terms tie the tritone's instability to how a dissonance is formally resolved?",
      "explanation": "The tritone is defined by needing resolution -- outward to a sixth or inward to a third -- the same resolution concept the suspension figure formalizes as a dissonant note's final stage. The bridge names that shared logic.",
      "targets": [
        "tritone",
        "resolution",
        "resolution tendency"
      ],
      "reasons": {
        "tritone": "The dissonant interval most defined by its resolution requirement.",
        "resolution": "The suspension-figure stage that releases any prepared dissonance.",
        "resolution tendency": "The bridge concept naming why these two terms connect."
      }
    },
    {
      "id": "tendency-vs-interval",
      "prompt": "Which terms show the same half-step explained by two different frameworks -- scale-degree tendency and interval classification?",
      "explanation": "The leading tone's rise to the tonic and the interval 'minor second' both describe the same acoustic half-step -- one from scale-degree function, the other from harmonic classification. The bridge names why they connect.",
      "targets": [
        "leading tone",
        "minor second",
        "shared half step"
      ],
      "reasons": {
        "leading tone": "The scale-degree account of this half-step's pull.",
        "minor second": "The interval-classification account of the same half-step.",
        "shared half step": "The bridge concept naming why these two terms describe one motion."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "consonance",
        "reason": "Start with what makes an interval or sound consonant before seeing how dissonance is classified and handled."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "optional",
    "content": {
      "mediaType": "text/markdown",
      "text": "Two different systems classify and handle dissonance in tonal music. Interval theory sorts certain intervals -- seconds, sevenths, the tritone -- into a dissonant class, defined by how restricted or resolved they must be. Separately, species counterpoint describes how a dissonant note actually gets into and out of the music: a suspension holds a prepared note over into dissonance and resolves it by step, while a family of embellishing tones -- passing tones, neighbor tones, appoggiaturas, anticipations -- introduce dissonance melodically, by step or leap, without any preparation at all. A third framework explains dissonance by scale-degree tendency instead: certain pitches lean toward a particular resolution because of their role in the prevailing harmony, independent of interval size or contrapuntal preparation."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Sonnet 5)"
      }
    ],
    "reasoning": "high"
  }
});
