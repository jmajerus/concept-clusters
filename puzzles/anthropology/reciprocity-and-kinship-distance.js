// Generated from content/puzzles/reciprocity-and-kinship-distance.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "reciprocity-and-kinship-distance",
  "title": "Reciprocity and Kinship Distance",
  "category": "Anthropology",
  "info": {
    "text": "Marshall Sahlins argued that non-market giving is structured by kinship distance: the closer the relationship, the less anyone keeps accounts, and the farther the relationship, the more each party tries to come out ahead.",
    "link": "wiki:Reciprocity (cultural anthropology)",
    "citations": [
      {
        "title": "Stone Age Economics",
        "author": "Marshall Sahlins",
        "publisher": "Aldine-Atherton",
        "year": "1972",
        "pages": "185–204"
      }
    ]
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "evolution-of-cooperation",
        "reason": "That puzzle treats reciprocity as a strategy among anonymous players. This one treats it as a kinship-moral continuum of giving -- same everyday word, different lesson."
      }
    ]
  },
  "lenses": [
    {
      "id": "who-the-giving-is-with",
      "prompt": "Which terms name who the giving or taking is with, rather than a practice, a mechanism, or the distance scale itself?",
      "explanation": "Sahlins indexes the typology by social position: close kin at the near pole, exchange partners in the middle, and strangers at the far pole. Food sharing, the Kula ring, haggling, and raiding are things people do; vague obligation, equivalent return, and something for nothing describe how return is treated; kinship distance is the scale that orders those positions.",
      "targets": [
        "close kin",
        "exchange partner",
        "strangers"
      ]
    }
  ],
  "clusters": [
    {
      "id": "generalized-reciprocity",
      "name": "Generalized Reciprocity",
      "color": "teal",
      "fact": "Sahlins described generalized reciprocity as putatively altruistic giving in which the material match is repressed: among close kin, especially in household food sharing, the obligation to return is left vague in time, quantity, and quality, and a failure to reciprocate does not stop the giving.",
      "terms": [
        "food sharing",
        "close kin",
        "vague obligation"
      ],
      "seeds": [
        "food sharing",
        "close kin"
      ],
      "termInfo": {
        "food sharing": {
          "text": "The everyday movement of food inside a household or camp, treated as a social duty rather than as a matchable transaction."
        },
        "close kin": {
          "text": "The people nearest in the kinship field -- typically household and lineage intimates -- among whom Sahlins located this mode of giving."
        },
        "vague obligation": {
          "text": "A return may come someday, in some form, or not in any matched way -- and the relationship does not turn on tallying it."
        }
      },
      "info": {
        "citations": [
          {
            "title": "Stone Age Economics",
            "author": "Marshall Sahlins",
            "publisher": "Aldine-Atherton",
            "year": "1972",
            "pages": "193–194"
          }
        ]
      }
    },
    {
      "id": "balanced-reciprocity",
      "name": "Balanced Reciprocity",
      "color": "blue",
      "fact": "Balanced reciprocity is exchange between parties who remain distinct and expect a customary equivalent: the material match is reckoned, and the classic ethnographic case is the Kula ring, in which a partner is owed a counterpart valuable of matching rank.",
      "terms": [
        "Kula ring",
        "equivalent return",
        "exchange partner"
      ],
      "seeds": [
        "Kula ring",
        "equivalent return"
      ],
      "termInfo": {
        "Kula ring": {
          "text": "A ceremonial circuit of shell necklaces and armbands among island communities of the Massim archipelago, recorded by Malinowski, in which a partner is owed a counterpart valuable rather than an open-ended favor.",
          "link": "wiki:Kula ring",
          "citations": [
            {
              "title": "Argonauts of the Western Pacific",
              "author": "Bronisław Malinowski",
              "publisher": "Routledge & Kegan Paul",
              "year": "1922"
            }
          ]
        },
        "equivalent return": {
          "text": "A counter-gift or counter-payment meant to match what was given, in kind or in customary value, so that neither side remains openly indebted."
        },
        "exchange partner": {
          "text": "A lasting counterpart in dyadic exchange -- not a household intimate, not a stranger to be fleeced -- with whom equivalence is the point of the relationship."
        }
      },
      "info": {
        "citations": [
          {
            "title": "Stone Age Economics",
            "author": "Marshall Sahlins",
            "publisher": "Aldine-Atherton",
            "year": "1972",
            "pages": "194–195"
          }
        ]
      }
    },
    {
      "id": "negative-reciprocity",
      "name": "Negative Reciprocity",
      "color": "amber",
      "fact": "Negative reciprocity is the attempt to get something for nothing with impunity -- the most impersonal extreme, from haggling to raiding -- typical of dealings with strangers and other outsiders beyond the moral reach of kinship.",
      "terms": [
        "haggling",
        "raiding",
        "something for nothing",
        "strangers"
      ],
      "seeds": [
        "haggling",
        "raiding"
      ],
      "termInfo": {
        "haggling": {
          "text": "Hard bargaining in which each side tries to win a material advantage, rather than to match a customary equivalent or to leave the return unreckoned."
        },
        "raiding": {
          "text": "Taking goods by force from people treated as outsiders or enemies, the violent pole of trying to gain without a fair return."
        },
        "something for nothing": {
          "text": "Sahlins' compressed definition of this mode: gain sought with impunity, without a morally binding return."
        },
        "strangers": {
          "text": "People outside the kinship-moral field, with whom Sahlins located impersonal, self-interested taking rather than sharing or matched exchange."
        }
      },
      "info": {
        "citations": [
          {
            "title": "Stone Age Economics",
            "author": "Marshall Sahlins",
            "publisher": "Aldine-Atherton",
            "year": "1972",
            "pages": "195"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-kinship-distance",
      "term": "kinship distance",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Sahlins argued that the three modes are a continuum of kinship distance, not a random typology: generalized reciprocity inside the household-kin group, balanced reciprocity among more distant community partners, and negative reciprocity with strangers and enemies.",
      "termRole": "reference",
      "relationKind": "continuity",
      "info": {
        "text": "In societies organized primarily by kinship, moral obligation tracks how close someone stands in that field: near kin are not supposed to keep accounts; strangers sit outside the ethic of matching gifts.",
        "link": "wiki:Reciprocity (cultural anthropology)",
        "citations": [
          {
            "title": "Stone Age Economics",
            "author": "Marshall Sahlins",
            "publisher": "Aldine-Atherton",
            "year": "1972",
            "pages": "196–201"
          }
        ]
      },
      "idealTerms": [
        "close kin",
        "exchange partner",
        "strangers"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Grok",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "xAI",
      "date": "2026-08-20"
    },
    {
      "system": "Grok",
      "scope": "lenses",
      "role": "drafted",
      "provider": "xAI",
      "date": "2026-08-20"
    }
  ]
});
