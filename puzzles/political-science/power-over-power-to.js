// Generated from content/puzzles/power-over-power-to.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "power-over-power-to",
  "title": "Power Over, Power To",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Psychology"
  ],
  "tags": [
    "book"
  ],
  "info": {
    "text": "Erich Fromm's argument that \"power\" names two unrelated things easily mistaken for each other -- and his separate account of what actually makes an authority legitimate, exploitative, or invisible.",
    "citations": [
      {
        "title": "Escape from Freedom",
        "author": "Erich Fromm",
        "publisher": "Farrar & Rinehart",
        "year": "1941"
      },
      {
        "title": "Man for Himself: An Inquiry into the Psychology of Ethics",
        "author": "Erich Fromm",
        "publisher": "Rinehart & Company",
        "year": "1947"
      }
    ]
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-authority-and-the-state",
        "via": [
          "legitimacy",
          "obedience"
        ],
        "reason": "Compare Weber's legitimacy-based authority and French and Raven's five power bases against Fromm's own two-part reading of power, and his separate account of what makes an authority rational, irrational, or anonymous."
      }
    ]
  },
  "lenses": [
    {
      "id": "needs-feeding",
      "prompt": "Which of these must be continually re-secured through another person's submission, rather than being a stable possession?",
      "explanation": "None of these can simply be achieved and then held. Domination has to keep dominating; sadism has to keep controlling to relieve the isolation it covers for; irrational authority has to keep extracting submission or it collapses. Power to, by contrast, is a capacity a person actually has, whether or not anyone else is involved at all.",
      "targets": [
        "domination",
        "sadism",
        "irrational authority"
      ],
      "reasons": {
        "domination": "Requires an ongoing relationship of control, not a one-time achievement.",
        "irrational authority": "Survives only by continually extracting submission; it has no independent basis.",
        "sadism": "The underlying isolation it defends against returns the moment control lapses."
      }
    },
    {
      "id": "aimed-at-independence",
      "prompt": "Which of these are meant to leave a person more capable and independent, rather than more dependent on someone else?",
      "explanation": "Rational authority is unusual among the forms of authority here because it is designed to shrink: a good teacher's authority over a student is supposed to diminish as the student's own competence grows, which is exactly the direction productiveness and self-realization already point on their own -- toward a person's own capacities, not toward continued reliance on someone else.",
      "targets": [
        "rational authority",
        "productiveness",
        "self-realization"
      ],
      "reasons": {
        "productiveness": "The exercise of a person's own faculties, not a transaction with anyone else.",
        "rational authority": "Explicitly meant to diminish as the other person's own competence grows.",
        "self-realization": "Growth in one's own capacity, independent of anyone else's submission or authority."
      }
    }
  ],
  "clusters": [
    {
      "id": "power-to",
      "name": "Power To",
      "color": "teal",
      "fact": "Fromm insisted that power names two entirely different things easily confused with each other. Power to do something -- the capacity to act, to realize one's own faculties, what he called productiveness -- has nothing to do with dominating anyone else. It is potency and mastery in the sense of ability, not control, and it doesn't require another person's submission to exist at all.",
      "terms": [
        "potency",
        "mastery",
        "productiveness",
        "self-realization"
      ],
      "seeds": [
        "potency",
        "mastery"
      ],
      "termInfo": {
        "productiveness": "Fromm's term, from Man for Himself, for the healthy exercise of a person's own faculties -- thinking, loving, working -- as ends in themselves, not as transactions with anyone else.",
        "self-realization": "Growth in a person's own capacities, independent of anyone else's submission, authority, or control."
      },
      "info": {
        "text": "Power as capacity and ability -- what a person can actually do, exercised for its own sake rather than over anyone else."
      }
    },
    {
      "id": "power-over",
      "name": "Power Over",
      "color": "amber",
      "fact": "The other sense of power, domination over another person, Fromm traced to weakness rather than strength: the drive to dominate substitutes for a genuine selfhood someone lacks, a way of escaping the anxiety of being a separate, isolated individual by fusing with -- and controlling -- someone else instead. Sadism, in his account, is this same escape for aloneness carried to its most destructive form.",
      "terms": [
        "domination",
        "exploitation",
        "sadism",
        "flight from aloneness"
      ],
      "seeds": [
        "domination",
        "exploitation"
      ],
      "termInfo": {
        "flight from aloneness": "Fromm's claim, from Escape from Freedom, that the drive to dominate is rooted in weakness, not strength -- an attempt to escape the anxiety of individual separateness by fusing with and controlling another person.",
        "sadism": "For Fromm, the most destructive form the flight from aloneness can take: needing another person's submission not incidentally but as the whole point."
      },
      "info": {
        "text": "Power as domination -- control over another person, which Fromm read as compensation for a lack rather than an expression of real strength."
      }
    },
    {
      "id": "kinds-of-authority",
      "name": "Kinds of Authority",
      "color": "blue",
      "fact": "Fromm distinguished authority by what sustains it. Rational authority rests on demonstrated competence, holds between people who remain fundamentally equal, and is supposed to diminish as the less experienced party grows -- a teacher's authority over a student, ideally. Irrational authority requires the other person's submission to survive at all, exploits rather than develops them, and has to be continually fed. Anonymous authority is the newest and hardest to resist: no one gives an order, and unspoken conformity to what everyone else is already doing enforces itself instead.",
      "terms": [
        "rational authority",
        "irrational authority",
        "anonymous authority",
        "conformity"
      ],
      "seeds": [
        "rational authority",
        "irrational authority"
      ],
      "termInfo": {
        "anonymous authority": {
          "text": "Authority with no visible source -- no person, office, or law giving an order -- exercised instead through unspoken pressure to conform to what everyone else already seems to be doing or believing.",
          "link": "wiki:Erich Fromm"
        },
        "conformity": "The outcome anonymous authority produces: adjustment to the group not because anyone commanded it, but because standing apart starts to feel unthinkable.",
        "irrational authority": {
          "link": "wiki:Traditional authority"
        },
        "rational authority": {
          "link": "wiki:Rational-legal authority"
        }
      },
      "info": {
        "text": "Fromm's classification of authority by what actually sustains obedience to it -- competence, extracted submission, or invisible conformity."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-competence",
      "term": "competence",
      "clusters": [
        0,
        2
      ],
      "fact": "Rational authority is legitimate specifically because it rests on the same thing as power to: real, demonstrated mastery. A teacher's authority over a student is rational exactly to the extent it tracks actual competence, and is supposed to dissolve as the student's own mastery catches up.",
      "relationKind": "foundation",
      "idealTerms": [
        "mastery",
        "rational authority"
      ]
    },
    {
      "id": "bridge-submission",
      "term": "submission",
      "clusters": [
        1,
        2
      ],
      "fact": "Irrational authority and domination are, for Fromm, close to the same phenomenon seen from two sides: an irrational authority survives only by continually extracting submission, and a drive to dominate needs someone submitting to it just as continually. Neither is a stable possession; both must be constantly re-secured.",
      "relationKind": "foundation",
      "idealTerms": [
        "domination",
        "irrational authority"
      ]
    },
    {
      "id": "bridge-freedom",
      "term": "freedom",
      "clusters": [
        0,
        1
      ],
      "fact": "These are not two points on one scale but opposite responses to the same condition: power to is what free, developed capacity actually looks like, while power over is what Fromm argued people reach for specifically to escape the anxiety of being free and separate in the first place.",
      "relationKind": "contrast",
      "idealTerms": [
        "self-realization",
        "flight from aloneness"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-09"
    },
    {
      "system": "Claude",
      "scope": "lenses",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-09"
    }
  ]
});
