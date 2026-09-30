// Generated from content/puzzles/chirality-labels-and-light.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "chirality-labels-and-light",
  "title": "Naming and Measuring Handedness: R/S Labels, Polarized Light, and Cancellation",
  "category": "chemistry",
  "subcategories": {
    "chemistry": "organic-chemistry"
  },
  "info": {
    "text": "The same handedness has two independent namings: the (R)/(S) configuration each stereocenter carries, and the direction a sample rotates plane-polarized light. This board teaches both systems and the cancellation payoffs — why meso compounds and racemic mixtures read zero, and how resolution and racemization move a substance between the mixed and resolved states.",
    "citations": [
      {
        "title": "5.5: Sequence Rules for Specifying Configuration — Organic Chemistry (Morsch et al.)",
        "author": "Steven Farmer, Ekta Patel, Ifemayowa Aworanti, Dietmar Kennepohl, Zachary Sharrett, Layne Morsch, Krista Cunningham",
        "publisher": "Chemistry LibreTexts",
        "year": "2023",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.05%3A_Sequence_Rules_for_Specifying_Configuration"
      },
      {
        "title": "5.3: Optical Activity — Organic Chemistry (Morsch et al.)",
        "author": "Steven Farmer, Dietmar Kennepohl, Zachary Sharrett, Krista Cunningham, Tim Soderberg",
        "publisher": "Chemistry LibreTexts",
        "year": "2023",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.03%3A_Optical_Activity"
      },
      {
        "title": "5.7: Meso Compounds — Organic Chemistry (Morsch et al.)",
        "publisher": "Chemistry LibreTexts",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.07%3A_Meso_Compounds"
      },
      {
        "title": "5.8: Racemic Mixtures and the Resolution of Enantiomers — Organic Chemistry (Morsch et al.)",
        "publisher": "Chemistry LibreTexts",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.08%3A_Racemic_Mixtures_and_the_Resolution_of_Enantiomers"
      }
    ]
  },
  "clusters": [
    {
      "id": "configuration-labels",
      "name": "Absolute configuration labels",
      "color": "teal",
      "fact": "Each stereocenter gets its own label: rank the four substituents by the CIP priority rules (higher atomic number wins; walk chains to the first point of difference; multiple bonds count as duplicates), point the lowest-priority group away, and read the 1→2→3 arc — clockwise is (R) (rectus), counterclockwise is (S) (sinister). Together the labels give the molecule's absolute configuration, e.g. (2R,4S)-….",
      "terms": [
        "(R) configuration",
        "(S) configuration",
        "CIP priority rules",
        "absolute configuration"
      ],
      "seeds": [
        "(R) configuration",
        "(S) configuration"
      ],
      "termInfo": {
        "(R) configuration": "A stereocenter whose 1→2→3 priority arc runs clockwise with the lowest-priority group pointing away — from Latin rectus, right.",
        "(S) configuration": "A stereocenter whose 1→2→3 priority arc runs counterclockwise with the lowest-priority group pointing away — from Latin sinister, left.",
        "CIP priority rules": "Rank the four substituents: higher atomic number wins; ties walk the chains to the first point of difference; multiple bonds count as duplicate atoms (an alkene carbon counts as two C's).",
        "absolute configuration": "The actual three-dimensional arrangement at every stereocenter, written as the (R)/(S) list in the name — e.g. (2R,4S)-…; one list, one unambiguous enantiomer."
      }
    },
    {
      "id": "polarimetry",
      "name": "Polarimetry observations",
      "color": "blue",
      "fact": "A polarimeter sends plane-polarized light through a sample: an optically active compound rotates the plane — clockwise is dextrorotatory (+), counterclockwise is levorotatory (−) — and the observed angle divided by path length and concentration gives the specific rotation [α]D, a reproducible constant for each pure enantiomer.",
      "terms": [
        "plane-polarized light",
        "polarimeter",
        "optically active",
        "dextrorotatory (+)",
        "levorotatory (−)",
        "specific rotation"
      ],
      "seeds": [
        "plane-polarized light",
        "polarimeter"
      ],
      "termInfo": {
        "plane-polarized light": "Ordinary light passed through a polarizer so its waves oscillate in a single plane — the probe that chiral samples visibly twist.",
        "polarimeter": "The instrument: light source, fixed polarizer, sample tube, rotatable analyzer, detector; you turn the analyzer until light gets through and read off the angle.",
        "optically active": "A sample that rotates plane-polarized light at all — true of every pure enantiomer, never of achiral substances like water or hexane.",
        "dextrorotatory (+)": "Rotates light clockwise as seen by the detector; written (+) or d — Latin dexter, right. Says nothing about the R/S label.",
        "levorotatory (−)": "Rotates light counterclockwise; written (−) or l — Latin laevus, left. The enantiomer of a (+) compound is always (−) by the same magnitude.",
        "specific rotation": "The observed angle corrected for cell length and concentration, [α]D = α/(l·c), usually at 20 °C with sodium-D light — a reproducible constant identifying each pure enantiomer."
      }
    },
    {
      "id": "cancellation",
      "name": "Chirality cancellation and its undoing",
      "color": "amber",
      "fact": "Rotation can vanish two ways: a meso compound cancels internally (its halves mirror each other across a plane of symmetry), and a racemic mixture — 50:50 enantiomers — cancels mutually. Resolution separates a racemate into pure enantiomers; racemization folds a pure enantiomer back to 50:50.",
      "terms": [
        "meso compound",
        "racemic mixture",
        "resolution",
        "racemization"
      ],
      "seeds": [
        "meso compound",
        "racemic mixture"
      ],
      "termInfo": {
        "meso compound": "An achiral molecule that nonetheless contains stereocenters: its halves mirror each other across an internal plane, cancelling internally — tartaric acid's (R,S) form is the classic.",
        "racemic mixture": "A 50:50 mixture of both enantiomers, written (±); equal-and-opposite rotations cancel, so it is optically inactive despite containing chiral molecules.",
        "resolution": "Separating a racemate into its pure enantiomers — classically by converting them into diastereomers with an enantiopure reagent, since diastereomers have different physical properties.",
        "racemization": "The opposite conversion: a pure enantiomer transformed into its 50:50 racemate — often the unwanted result of a reaction passing through a planar intermediate."
      }
    }
  ],
  "bridges": [
    {
      "id": "inactivity-by-cancellation",
      "term": "optical inactivity by cancellation",
      "clusters": [
        1,
        2
      ],
      "fact": "Both achiral-looking cases read zero in the polarimeter for the same reason — rotations cancel: a meso molecule's mirror-image halves cancel internally, and a racemic mixture's equal-and-opposite enantiomers cancel mutually. Resolution undoes the mixture; symmetry cannot be undone.",
      "info": "Zero rotation proves cancellation, not absence of stereocenters — ask whether the cancellation is internal (one molecule) or mutual (a mixture)."
    },
    {
      "id": "configuration-vs-rotation-sign",
      "term": "configuration vs rotation sign",
      "clusters": [
        0,
        1
      ],
      "fact": "The (R)/(S) label and the (+)/(−) rotation sign are independent namings of the same enantiomer: an (R) compound may be dextrorotatory or levorotatory, so neither can predict the other without a polarimetry experiment or the literature.",
      "info": "The classic trap: rectus ('right') is not dextro- ('right-turning light'); one names configuration, the other names a measured behavior."
    }
  ],
  "lenses": [
    {
      "id": "label-one-center",
      "prompt": "A single stereocenter can carry exactly one of which two labels?",
      "explanation": "With priorities ranked by the CIP rules and the lowest group pointed away, the 1→2→3 arc reads clockwise (R) or counterclockwise (S) — nothing else is possible; and a center bearing two identical substituents gets no label at all.",
      "targets": [
        "(R) configuration",
        "(S) configuration"
      ]
    },
    {
      "id": "direction-and-size",
      "prompt": "Which terms name the direction of a light rotation or its standardized size?",
      "explanation": "Dextro/levo name the direction (+ clockwise, − counterclockwise) and specific rotation standardizes the size as [α]D. 'Optically active' only says the sample rotates light at all, and the polarimeter is the instrument, not the reading.",
      "targets": [
        "dextrorotatory (+)",
        "levorotatory (−)",
        "specific rotation"
      ]
    },
    {
      "id": "zero-rotation-cases",
      "prompt": "Which terms describe a situation or process whose net light rotation is exactly zero?",
      "explanation": "A meso compound cancels internally across its mirror plane, a racemic mixture cancels mutually, and racemization produces exactly that cancelling 50:50 mixture. Resolution is the trap answer — it is the process that breaks the cancellation, so its product does rotate.",
      "targets": [
        "meso compound",
        "racemic mixture",
        "racemization"
      ]
    },
    {
      "id": "mirror-twin-deductions",
      "prompt": "Enantiomer A is (R) and rotates light (−). Which two facts follow for its mirror twin B — no experiment needed?",
      "explanation": "B inverts every stereocenter, so A's (R) becomes (S); and equal-but-opposite rotation flips the sign, so (−) becomes (+). Each deduction is independent — in general no rule connects R to +, which is exactly why both systems exist.",
      "targets": [
        "(S) configuration",
        "dextrorotatory (+)"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "chirality-isomer-classes",
        "reason": "Play first: board one classifies the isomer pairs and locates handedness with the mirror test that this board's labels and measurements presuppose."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Two names for one handedness",
    "summary": "Naming configuration, measuring rotation, and why either can read zero.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Handedness matters only when it meets something else that is handed, so chemists need two things: a way to say which mirror-image form they mean, and a way to see the difference in a sample. The naming ranks the four substituents at each tetrahedral center, points the lowest-priority group away, and reads the remaining arc as R or S — a label pure thought can assign from a drawing. The seeing uses plane-polarized light, which a chiral sample rotates by a measurable angle recorded as (+) or (−).\r\n\r\nThe two systems are independent: the label at a center does not predict the direction of rotation, and (R) compounds of one kind turn light clockwise while (R) compounds of another turn it counterclockwise. Rotation is a property of samples as much as of molecules — a perfectly balanced 50:50 mixture reads zero, and so does a single molecule whose own halves mirror each other. The objective: assign and read configuration labels, interpret a polarimeter reading, and account for every way a rotation can vanish."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
