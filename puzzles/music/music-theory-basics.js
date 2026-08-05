// Generated from content/puzzles/music-theory-basics.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "music-theory-basics",
  "title": "Music theory basics",
  "category": "Music",
  "info": {
    "link": "wiki:Music theory",
    "text": "The three things music theory keeps track of at once: when a sound happens, how high it is, and what it sounds like alongside other notes."
  },
  "lenses": [
    {
      "explanation": "Notation writes some of these down directly and leaves the rest to be worked out. A performer reads the marks on the page, then infers the pulse, the distances, and the chords from them.",
      "id": "written-on-the-page",
      "prompt": "Which concepts are printed in standard staff notation as their own mark or sign?",
      "reasons": {
        "note": "The written notehead and stem are the marks everything else on the staff is arranged around.",
        "rest": "Each duration of silence has its own distinct written sign.",
        "sharp": "The ♯ symbol, placed in the key signature or beside a single note.",
        "tempo": "Printed above the staff as a word or a metronome mark.",
        "time signature": "Printed as two stacked numbers at the start of the staff."
      },
      "targets": [
        "time signature",
        "tempo",
        "rest",
        "sharp",
        "note"
      ]
    },
    {
      "explanation": "These three are measurements, not things. A major scale and a triad are made out of such distances, and a root is one of the pitches being measured from — but none of them is itself a distance.",
      "id": "distance-in-pitch",
      "prompt": "Which concepts name a distance between two pitches, rather than a pitch, a chord, or a collection?",
      "reasons": {
        "half step": "The smallest distance Western tuning measures.",
        "interval": "The general name for any such distance, whether played in sequence or stacked.",
        "octave": "The distance at which pitch names start over — twelve half steps."
      },
      "targets": [
        "octave",
        "half step",
        "interval"
      ]
    },
    {
      "explanation": "Each domain here settles on one thing to count from. Time is counted in beats, pitch distance in half steps, and a chord's other tones are measured from its root. Notice that the octave was a distance in the previous round but is not the counting unit — the half step is, and the octave is twelve of them.",
      "id": "reference-units",
      "prompt": "Which concepts are the reference unit that other quantities on this board are counted in or measured from?",
      "reasons": {
        "beat": "Tempo, time signature, and note durations are all expressed in beats.",
        "half step": "Every larger interval is counted as a number of half steps.",
        "root": "The third and fifth of a triad are named by their distance above it."
      },
      "targets": [
        "beat",
        "half step",
        "root"
      ]
    },
    {
      "explanation": "Music theory keeps reusing one move: take a small unit and build a structure out of it. Beats group into a measure, half and whole steps stack into a scale, intervals stack into a triad, and chords follow one another into a progression. The same relationship appears in all three areas of this board.",
      "id": "built-from-parts",
      "prompt": "Which concepts name a whole assembled from smaller parts, rather than a single measurement or mark?",
      "reasons": {
        "chord progression": "Several chords assembled into an ordered sequence.",
        "major scale": "Seven pitches assembled by a fixed sequence of half and whole steps.",
        "time signature": "Declares how individual beats are grouped into each measure.",
        "triad": "Three pitches assembled by stacking intervals."
      },
      "targets": [
        "time signature",
        "major scale",
        "triad",
        "chord progression"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-rhythm",
      "name": "Rhythm and meter",
      "color": "teal",
      "fact": "Rhythm organizes music in time: a steady beat, grouped into measures by a time signature, played at a speed called the tempo — with rests measured just as carefully as sound.",
      "terms": [
        "beat",
        "time signature",
        "tempo",
        "rest"
      ],
      "seeds": [
        "beat",
        "time signature"
      ],
      "termInfo": {
        "beat": {
          "link": "wiki:Beat (music)",
          "text": "The steady pulse you tap your foot to — the unit everything else in the music is counted against."
        },
        "rest": {
          "link": "wiki:Rest (music)",
          "text": "A measured silence — written and counted exactly like a note, but played by not playing."
        },
        "tempo": {
          "link": "wiki:Tempo",
          "text": "How fast the beats go by, usually given in beats per minute or by an Italian word like allegro."
        },
        "time signature": {
          "link": "wiki:Time signature",
          "text": "The pair of numbers at the start of a piece saying how many beats fill each measure, and which note value counts as one beat."
        }
      },
      "info": {
        "link": "wiki:Rhythm",
        "text": "How music is organized in time."
      }
    },
    {
      "id": "cluster-pitch",
      "name": "Pitch and scales",
      "color": "blue",
      "fact": "Pitch is how high or low a sound is. A scale is a ladder of pitches: the major scale climbs by a fixed pattern of half steps and whole steps, and after an octave the note names begin again.",
      "terms": [
        "octave",
        "half step",
        "major scale",
        "sharp"
      ],
      "seeds": [
        "octave",
        "major scale"
      ],
      "termInfo": {
        "half step": {
          "link": "wiki:Semitone",
          "text": "The smallest distance between two pitches in standard Western tuning — adjacent keys on a piano, black or white."
        },
        "major scale": {
          "link": "wiki:Major scale",
          "text": "The familiar do-re-mi ladder of seven pitches, built from one particular pattern of half and whole steps."
        },
        "octave": {
          "link": "wiki:Octave",
          "text": "The distance at which a pitch repeats itself — the higher note sounds like the same note, only higher."
        },
        "sharp": {
          "link": "wiki:Sharp (music)",
          "text": "The symbol that raises a written note by one half step; its opposite, the flat, lowers it."
        }
      },
      "info": {
        "link": "wiki:Pitch (music)",
        "text": "How high or low a sound is, and how those levels get organized into ladders."
      }
    },
    {
      "id": "cluster-harmony",
      "name": "Harmony and chords",
      "color": "amber",
      "fact": "Harmony is what happens when pitches sound at the same time: three stacked pitches make a triad, the pitch it is built from is the root, and chords moving in sequence make a progression.",
      "terms": [
        "triad",
        "root",
        "chord progression"
      ],
      "seeds": [
        "triad",
        "chord progression"
      ],
      "termInfo": {
        "chord progression": {
          "link": "wiki:Chord progression",
          "text": "A sequence of chords played one after another, which is what gives a passage its sense of moving somewhere."
        },
        "root": {
          "link": "wiki:Root (chord)",
          "text": "The pitch a chord is built up from, and the one the chord is named after."
        },
        "triad": {
          "link": "wiki:Triad (music)",
          "text": "Three pitches sounded together, stacked in thirds — the basic chord of Western music."
        }
      },
      "info": {
        "link": "wiki:Harmony",
        "text": "What happens when several pitches sound at the same time."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-note",
      "term": "note",
      "clusters": [
        0,
        1
      ],
      "fact": "A single written note does two jobs at once: where it sits on the staff says how high to play it, and its shape says how many beats to hold it. That is why one symbol belongs to rhythm and to pitch equally.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Note (music)",
        "text": "The basic written symbol of Western music, carrying a pitch and a duration together."
      },
      "idealTerms": [
        "beat",
        null
      ]
    },
    {
      "id": "bridge-interval",
      "term": "interval",
      "clusters": [
        1,
        2
      ],
      "fact": "An interval is the distance between two pitches. Play those distances one after another and you get a scale; stack them on top of each other instead and you get a chord — the same measurement, read horizontally or vertically.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Interval (music)",
        "text": "The distance in pitch between two notes, counted in half steps or by name (a third, a fifth, an octave)."
      },
      "idealTerms": [
        "half step",
        "triad"
      ]
    }
  ]
});
