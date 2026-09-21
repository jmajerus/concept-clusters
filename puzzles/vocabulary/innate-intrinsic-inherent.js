// Generated from content/puzzles/innate-intrinsic-inherent.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "innate-intrinsic-inherent",
  "title": "Already There? Innate, Intrinsic, Inherent",
  "category": "vocabulary",
  "puzzleKind": "vocabulary-context",
  "info": {
    "text": "Every word on this board denies that anyone added the property — the question each sentence answers is how it got there: present at birth in a living being, or belonging to the thing's own constitution. Context, register, and grammatical frame decide which word fits.",
    "citations": [
      {
        "title": "Innate — 'Choose the Right Synonym' (innate, inborn, inbred, congenital, hereditary mean not acquired after birth)",
        "author": "Merriam-Webster.com Dictionary",
        "publisher": "Merriam-Webster",
        "year": "2026",
        "url": "https://www.merriam-webster.com/dictionary/innate"
      },
      {
        "title": "Intrinsic — 'belonging to the essential nature or constitution of a thing'",
        "author": "Merriam-Webster.com Dictionary",
        "publisher": "Merriam-Webster",
        "year": "2026",
        "url": "https://www.merriam-webster.com/dictionary/intrinsic"
      },
      {
        "title": "Inherent — 'belonging to the basic nature of something or someone'; 'stuck in something else so firmly that they can't be separated'",
        "author": "Merriam-Webster.com Dictionary",
        "publisher": "Merriam-Webster",
        "year": "2026",
        "url": "https://www.merriam-webster.com/dictionary/inherent"
      },
      {
        "title": "Congenital — 'existing at or dating from birth'",
        "author": "Merriam-Webster.com Dictionary",
        "publisher": "Merriam-Webster",
        "year": "2026",
        "url": "https://www.merriam-webster.com/dictionary/congenital"
      }
    ]
  },
  "clusters": [
    {
      "id": "already-present",
      "name": "Already Present",
      "color": "teal",
      "fact": "Each adjective says a property was never added to its holder — it was present at birth in a living being, or belongs to the thing's own constitution.",
      "terms": [
        "innate",
        "intrinsic",
        "inborn",
        "congenital",
        "inherent"
      ],
      "seeds": [
        "innate",
        "intrinsic"
      ],
      "termInfo": {
        "innate": "Present in an individual from birth or belonging to their essential nature — the everyday default for untaught qualities: an innate sense of fair play, innate behavior. Merriam-Webster: 'existing in, belonging to, or determined by factors present in an individual from birth'.",
        "intrinsic": "Belonging to the essential nature or constitution of a thing, occurring as a natural part of it: intrinsic value, intrinsic motivation, the intrinsic brightness of a star. Its frame is 'intrinsic to' — intrinsic to the design.",
        "inborn": "Innate's birth twin: a quality actually present at birth, or so marked and deep-seated that it seems so — her inborn love of nature. It stays with qualities and tendencies, not structural defects.",
        "congenital": "The clinical member: existing at or dating from birth, especially conditions acquired in the womb — congenital heart defect, congenital deafness. Figurative use exists ('a congenital liar') but sounds literary or humorous.",
        "inherent": "'Stuck in' the constitution of a thing so firmly the two can't be separated: risks inherent in the venture, problems inherent in the design. Its frame is 'inherent in', and 'inherent risk' is a fixed term."
      }
    },
    {
      "id": "added-from-outside",
      "name": "Added From Outside",
      "color": "blue",
      "fact": "Each adjective places the property outside the holder's own makeup — it comes from elsewhere, and nothing in the thing itself requires it.",
      "terms": [
        "extrinsic",
        "external",
        "foreign"
      ],
      "seeds": [
        "extrinsic",
        "external"
      ],
      "termInfo": {
        "extrinsic": "Not belonging to the essential nature of a thing — it comes from outside: extrinsic motivation, extrinsic value; the standard antonym of intrinsic.",
        "external": "On or from the outside of a thing rather than within it — external pressure, an external cause; the opposite of internal.",
        "foreign": "Not belonging naturally to the thing it is found in — a foreign object, a feeling foreign to her nature."
      }
    }
  ],
  "bridges": [],
  "lenses": [
    {
      "id": "untaught-behavior",
      "prompt": "Spiderlings weave perfect webs on their very first try, with no adult to teach them; the behavior is ______ , not learned.",
      "explanation": "The cue is the learned-behavior opposition: in biology, the untaught kind is innate behavior — the fixed term. Inborn is the plausible neighbor, but it stays with qualities and tendencies (an inborn love of music), not behavior; intrinsic and inherent describe a thing's constitution and don't pair with behavior at all.",
      "targets": [
        "innate"
      ],
      "reasons": {
        "innate": "Merriam-Webster's own example is 'innate behavior' — present in the individual from birth, determined without learning; it is the fixed opposite of learned behavior."
      }
    },
    {
      "id": "for-its-own-sake",
      "prompt": "Psychologists warn that paying children to read can crowd out ______ motivation — the desire to read for its own sake.",
      "explanation": "The cue is the external-reward contrast: motivation that belongs to the activity itself is intrinsic motivation, the fixed term alongside intrinsic value. The birth words are about beings, not activities — nothing here was born; and inherent's home is risk, flaw, and property talk ('risks inherent in the venture'), not reward.",
      "targets": [
        "intrinsic"
      ],
      "reasons": {
        "intrinsic": "The cue is the for-its-own-sake frame: what belongs to the activity's own nature is intrinsic — 'intrinsic motivation', 'intrinsic value', or 'intrinsic to the game'."
      }
    },
    {
      "id": "in-the-constitution",
      "prompt": "The weakness wasn't introduced by shoddy construction; it was ______ in the bridge's design from the start.",
      "explanation": "For a flaw that belongs to the plan itself, '______ in the design' is inherent's fixed pattern (inherent risk; problems inherent in the design). Intrinsic is the nearest neighbor, not an unrelated word: it means the same essence-belonging, but it wants 'to' (intrinsic to the design) and lives with value and motivation. The birth words are for beings, not blueprints — nothing was born here.",
      "targets": [
        "inherent"
      ],
      "reasons": {
        "inherent": "The cue is preposition plus collocation: weakness or danger 'in' a plan or venture selects inherent — 'stuck in' the constitution of the thing, in Merriam-Webster's image."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": true,
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "default"
      }
    ]
  }
});
