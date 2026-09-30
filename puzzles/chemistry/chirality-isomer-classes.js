// Generated from content/puzzles/chirality-isomer-classes.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "chirality-isomer-classes",
  "title": "Mirror Images First: Classifying Isomer Pairs and Finding Chirality",
  "category": "chemistry",
  "subcategories": {
    "chemistry": "organic-chemistry"
  },
  "info": {
    "text": "Same formula, same bonds, different substance: the comparison flowchart that classifies any same-formula pair — identical, conformers, constitutional isomers, stereoisomers — and the mirror test that divides stereoisomer pairs into enantiomers and their non-mirror relatives, anchored in the structural features (chirality center, plane of symmetry) that decide whether a reflection is a different molecule at all.",
    "citations": [
      {
        "title": "5.9: A Review of Isomerism — Organic Chemistry (Morsch et al.)",
        "author": "Steven Farmer, Dietmar Kennepohl, Zachary Sharrett, William Reusch",
        "publisher": "Chemistry LibreTexts",
        "year": "2023",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.09%3A_A_Review_of_Isomerism"
      },
      {
        "title": "5.2: The Reason for Handedness in Molecules – Chirality — Organic Chemistry (Morsch et al.)",
        "publisher": "Chemistry LibreTexts",
        "url": "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(Morsch_et_al.)/05%3A_Stereochemistry_at_Tetrahedral_Centers/5.02%3A_The_Reason_for_Handedness_in_Molecules_-_Chirality"
      }
    ]
  },
  "clusters": [
    {
      "id": "isomer-verdicts",
      "name": "Isomer comparison verdicts",
      "color": "teal",
      "fact": "Two molecules with the same molecular formula are compared, not classified alone: superimposable means identical; different only by rotation about a single bond means conformers; different connectivity means constitutional isomers; same connections but different 3-D arrangement means stereoisomers.",
      "terms": [
        "constitutional isomers",
        "identical compounds",
        "conformers",
        "stereoisomers"
      ],
      "seeds": [
        "constitutional isomers",
        "identical compounds"
      ],
      "termInfo": {
        "identical compounds": "Same formula, same connectivity, superimposable in 3-D — two drawings of one compound, not a pair of isomers.",
        "constitutional isomers": "Same formula, different atom-to-atom connections (1-propanol vs 2-propanol); interconverting them requires breaking and reforming bonds, so they have distinct properties.",
        "conformers": "Arrangements interconverted by rotation about C–C single bonds, like the staggered runs of pentane — nothing breaks, so conformers are one compound seen at different moments.",
        "stereoisomers": "Same connectivity, different 3-D arrangement — the verdict that hands a pair to the mirror test and the enantiomer/diastereomer division."
      }
    },
    {
      "id": "stereoisomer-pairs",
      "name": "Stereoisomer pair classes",
      "color": "blue",
      "fact": "Stereoisomer pairs sort by geometry: non-superimposable mirror images are enantiomers; stereoisomers that are not mirror images are diastereomers; diastereomers differing at exactly one of several stereocenters are epimers; and a rigid double bond gives cis–trans (geometric) pairs.",
      "terms": [
        "enantiomers",
        "diastereomers",
        "epimers",
        "cis–trans (geometric) isomers"
      ],
      "seeds": [
        "enantiomers",
        "diastereomers"
      ],
      "termInfo": {
        "enantiomers": "Non-superimposable mirror images — left- and right-handed versions of one structure; nearly identical physical properties, differing in the direction they rotate polarized light.",
        "diastereomers": "Stereoisomers that are not mirror images; unlike enantiomers they have different melting points, boiling points, and densities — which is what makes them separable in the lab.",
        "epimers": "Diastereomers differing at exactly one stereocenter of several; every epimer is a diastereomer, but most diastereomers are not epimers.",
        "cis–trans (geometric) isomers": "Stereoisomers fixed by a double bond (or ring) that cannot rotate: cis places the two reference groups on the same side, trans on opposite sides."
      }
    },
    {
      "id": "handedness-structure",
      "name": "Where handedness lives",
      "color": "amber",
      "fact": "Handedness is structural: a tetrahedral carbon bonded to four different groups is a chirality center, and an internal plane of symmetry makes a molecule superimposable on its own mirror image — achiral.",
      "terms": [
        "chirality center",
        "plane of symmetry",
        "achiral"
      ],
      "seeds": [
        "chirality center",
        "plane of symmetry"
      ],
      "termInfo": {
        "chirality center": "A tetrahedral atom — usually carbon — bonded to four different groups; the structural feature that gives a molecule a handedness its mirror image cannot match.",
        "plane of symmetry": "An internal mirror plane splitting a molecule into two reflected halves; its presence makes the whole molecule superimposable on its reflection.",
        "achiral": "Superimposable on its own mirror image — the molecule and its reflection are the same thing, so no enantiomer exists."
      }
    }
  ],
  "bridges": [
    {
      "id": "same-connectivity-different-space",
      "term": "same connectivity, different arrangement",
      "clusters": [
        0,
        1
      ],
      "fact": "When a comparison passes the connectivity check — same formula, same bonds, different 3-D arrangement — the verdict is stereoisomers, the class that then subdivides into enantiomers, diastereomers, epimers, and cis–trans pairs.",
      "info": "Run the comparison in order: identical first, then conformer, then constitutional; stereoisomer is the last verdict, and it hands the pair to the geometric sort."
    },
    {
      "id": "mirror-image-test",
      "term": "non-superimposable mirror image",
      "clusters": [
        1,
        2
      ],
      "fact": "The mirror test separates stereoisomer pairs: a chiral structure (no plane of symmetry) has a non-superimposable mirror image — its enantiomer — while a plane of symmetry makes the reflection superimposable, i.e. the same achiral compound.",
      "info": "No labels or instruments are needed for this test: imagine the reflection, rotate it mentally — superimposable means one compound; anything else is a handed pair."
    }
  ],
  "lenses": [
    {
      "id": "connectivity-untouched",
      "prompt": "Connectivity untouched: which comparison verdicts describe pairs with exactly the same atom-to-atom connections?",
      "explanation": "Constitutional isomers are the one verdict that requires breaking and reforming bonds. Identical compounds and conformers keep every connection — conformers by mere rotation about single bonds — and stereoisomers keep connectivity while differing in 3-D arrangement.",
      "targets": [
        "identical compounds",
        "conformers",
        "stereoisomers"
      ]
    },
    {
      "id": "not-mirror-twins",
      "prompt": "Which of these pair classes are stereoisomers that are NOT mirror images of each other?",
      "explanation": "Only enantiomers are mirror-image pairs. Every other class here is defined as not-a-mirror-image: diastereomers differ at some but not all stereocenters, epimers at exactly one, and cis–trans pairs are locked on opposite sides of a double bond.",
      "targets": [
        "diastereomers",
        "epimers",
        "cis–trans (geometric) isomers"
      ]
    },
    {
      "id": "coincides-with-its-reflection",
      "prompt": "Which terms describe a single molecule that is superimposable on its own mirror image?",
      "explanation": "An internal plane of symmetry forces superimposability, and such a molecule is achiral. A chirality center does the opposite — it creates a handedness no rotation can match, which is why the reflection of a chiral molecule is a different compound.",
      "targets": [
        "plane of symmetry",
        "achiral"
      ]
    },
    {
      "id": "one-center-differences",
      "prompt": "Which pair class is defined by differing at exactly one stereocenter while matching at all the others?",
      "explanation": "Epimers are the one-center subgroup of the diastereomers: diastereomers in general may differ at any number of centers, and enantiomers must differ at every one of them.",
      "targets": [
        "epimers"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "chirality-labels-and-light",
        "reason": "Applies the two naming-and-measurement systems to the relationships classified on board one, and resolves what board one's achiral-looking observations (meso, racemic) were hiding."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Same formula, different substance",
    "summary": "Why molecular handedness matters, and the habit this lesson trains.",
    "content": {
      "mediaType": "text/markdown",
      "text": "Two molecules can share every atom and every bond and still be different substances, because the same connections can be assembled in different three-dimensional arrangements. Organic chemistry meets this constantly: the mirror-image forms of one structure — like your two hands — can smell different (carvone from caraway vs from spearmint) and behave differently in the body, because enzymes and receptors are themselves handed and accept only the matching form.\r\n\r\nThe habit this lesson trains: given any two molecules with the same formula, decide exactly how they relate. Check whether they are truly identical, whether mere rotation about a single bond interconverts them, whether their atom-to-atom connections differ, or whether — with identical connections — they differ only in spatial arrangement. For that last case, the mirror test does the decisive work: a structure that is not superimposable on its own reflection comes in left- and right-handed versions, and an internal plane of symmetry is the tell that a molecule coincides with its reflection."
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
