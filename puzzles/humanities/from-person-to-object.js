// Generated from content/puzzles/from-person-to-object.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "from-person-to-object",
  "title": "From person to object",
  "category": "humanities",
  "large": true,
  "info": {
    "text": "How a person can be compressed into a function, category, or threat—and how voice, particularity, recognition, and moral imagination resist that reduction.",
    "links": [
      {
        "href": "wiki:Objectification"
      }
    ]
  },
  "clusters": [
    {
      "id": "functional-reduction",
      "name": "Functional reduction",
      "color": "teal",
      "fact": "Functional categories help organize work and knowledge, but they become objectifying when the role, market profile, case, or risk designation is allowed to stand in for the whole person.",
      "terms": [
        "labor unit",
        "case type",
        "market segment",
        "security risk"
      ],
      "seeds": [
        "labor unit",
        "market segment"
      ],
      "termInfo": {
        "labor unit": {
          "text": "A representation of a worker chiefly in terms of available or productive labor.",
          "links": [
            {
              "href": "wiki:Workforce"
            }
          ]
        },
        "case type": {
          "text": "A predefined class used to group matters that share administrative or procedural features.",
          "links": [
            {
              "href": "wiki:Classification"
            }
          ]
        },
        "market segment": {
          "text": "A group of potential consumers treated as sharing characteristics relevant to marketing.",
          "links": [
            {
              "href": "wiki:Market segmentation"
            }
          ]
        },
        "security risk": {
          "text": "A person, condition, or event evaluated primarily by the danger it may pose.",
          "links": [
            {
              "href": "wiki:Risk assessment"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Objectification"
          }
        ]
      }
    },
    {
      "id": "erasure-of-subjectivity",
      "name": "Erasure of subjectivity",
      "color": "blue",
      "fact": "Subjectivity is erased when a person's testimony, agency, emotional experience, identity, or distinctiveness is treated as irrelevant to how they may be understood or treated.",
      "terms": [
        "silenced testimony",
        "denied agency",
        "emotional dismissal",
        "presumed interchangeability"
      ],
      "seeds": [
        "denied agency",
        "emotional dismissal"
      ],
      "termInfo": {
        "silenced testimony": {
          "text": "A person's account is prevented, ignored, or made unable to influence judgment.",
          "links": [
            {
              "href": "wiki:Testimony"
            }
          ]
        },
        "denied agency": {
          "text": "Failure to regard a person as capable of intention, choice, and meaningful action.",
          "links": [
            {
              "href": "wiki:Agency (philosophy)"
            }
          ]
        },
        "emotional dismissal": {
          "text": "Rejection or minimization of another person's reported emotional experience.",
          "links": [
            {
              "href": "wiki:Emotional validation"
            }
          ]
        },
        "presumed interchangeability": {
          "text": "The assumption that one person can replace another without loss of morally relevant individuality.",
          "links": [
            {
              "href": "wiki:Fungibility"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Subjectivity"
          }
        ]
      }
    },
    {
      "id": "withdrawal-of-moral-regard",
      "name": "Withdrawal of moral regard",
      "color": "amber",
      "fact": "Moral regard is withdrawn when dignity becomes conditional, people are placed outside ordinary protection, blame is assigned by group membership, or cruelty becomes familiar enough to escape notice.",
      "terms": [
        "conditional dignity",
        "moral exclusion",
        "collective blame",
        "normalized cruelty"
      ],
      "seeds": [
        "moral exclusion",
        "collective blame"
      ],
      "termInfo": {
        "conditional dignity": {
          "text": "The treatment of human worth as something that can be earned, forfeited, or withheld.",
          "links": [
            {
              "href": "wiki:Dignity"
            }
          ]
        },
        "moral exclusion": {
          "text": "Placement of people outside the boundary within which ordinary moral rules and protections are understood to apply.",
          "links": [
            {
              "href": "wiki:Moral exclusion"
            }
          ]
        },
        "collective blame": {
          "text": "Assignment of responsibility to members of a group for acts they did not individually commit.",
          "links": [
            {
              "href": "wiki:Collective responsibility"
            }
          ]
        },
        "normalized cruelty": {
          "text": "Cruel treatment made familiar, expected, or socially ordinary through repetition and acceptance.",
          "links": [
            {
              "href": "wiki:Cruelty"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Moral exclusion"
          }
        ]
      }
    },
    {
      "id": "restoring-personhood",
      "name": "Restoring personhood",
      "color": "magenta",
      "fact": "Personhood is restored through attention to biography, first-person voice, reciprocal recognition, and moral imagination that makes the other's experience relevant to judgment.",
      "terms": [
        "particular biography",
        "first-person voice",
        "reciprocal recognition",
        "moral imagination"
      ],
      "seeds": [
        "first-person voice",
        "moral imagination"
      ],
      "termInfo": {
        "particular biography": {
          "text": "The concrete history and circumstances that make a person's life irreducible to a general category.",
          "links": [
            {
              "href": "wiki:Biography"
            }
          ]
        },
        "first-person voice": {
          "text": "A person's account of experience expressed from their own standpoint.",
          "links": [
            {
              "href": "wiki:First-person narrative"
            }
          ]
        },
        "reciprocal recognition": {
          "text": "Mutual acknowledgment of each participant as a subject with standing, agency, and claims upon the other.",
          "links": [
            {
              "href": "wiki:Recognition (sociology)"
            }
          ]
        },
        "moral imagination": {
          "text": "The capacity to envision the human meaning and possible consequences of action beyond one's immediate standpoint.",
          "links": [
            {
              "href": "wiki:Imagination"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Recognition (sociology)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "i-it-relation",
      "term": "I–It relation",
      "clusters": [
        0,
        1
      ],
      "fact": "An I–It relation connects functional reduction with erased subjectivity by approaching the other chiefly as an object to use, classify, manage, or experience rather than as a participant in mutual relation.",
      "info": {
        "text": "Martin Buber's term for relating to something or someone as an object of use or experience rather than as a Thou encountered in mutual relation.",
        "links": [
          {
            "href": "wiki:I and Thou"
          }
        ]
      },
      "conceptId": "i-it-relation",
      "relationKind": "dynamic",
      "idealTerms": [
        "labor unit",
        "presumed interchangeability"
      ]
    },
    {
      "id": "dehumanization",
      "term": "dehumanization",
      "clusters": [
        1,
        2
      ],
      "fact": "Dehumanization connects erased subjectivity with withdrawn moral regard: when people are denied agency, feeling, individuality, or full humanness, exclusion and cruelty become easier to justify.",
      "info": {
        "text": "The denial or diminishment of human qualities, individuality, or moral standing.",
        "links": [
          {
            "href": "wiki:Dehumanization"
          }
        ]
      },
      "conceptId": "dehumanization",
      "relationKind": "dynamic",
      "idealTerms": [
        "denied agency",
        "moral exclusion"
      ]
    },
    {
      "id": "recognition",
      "term": "recognition",
      "clusters": [
        2,
        3
      ],
      "fact": "Recognition marks the boundary between withdrawal and restoration: exclusion denies a person's standing within the moral community, while reciprocal recognition receives the other as a particular subject with dignity and voice.",
      "info": {
        "text": "Acknowledgment of another person's standing, identity, claims, or achievements within a social relationship.",
        "links": [
          {
            "href": "wiki:Recognition (sociology)"
          }
        ]
      },
      "conceptId": "recognition",
      "relationKind": "contrast",
      "idealTerms": [
        "conditional dignity",
        "reciprocal recognition"
      ]
    }
  ],
  "lenses": [
    {
      "id": "compressing-the-person",
      "prompt": "Which concepts compress a person into a function, category, risk, or replaceable instance?",
      "explanation": "Reduction can occur through administrative, economic, or security categories and through assumptions that individual identity or experience makes no meaningful difference.",
      "targets": [
        "labor unit",
        "case type",
        "market segment",
        "security risk",
        "presumed interchangeability"
      ],
      "reasons": {
        "labor unit": "The person is represented primarily by productive capacity.",
        "case type": "Particular circumstances are absorbed into a predefined administrative class.",
        "market segment": "A person becomes an instance of a consumer profile.",
        "security risk": "A person is interpreted chiefly through a projected danger.",
        "presumed interchangeability": "One person is treated as substitutable for another without morally relevant loss."
      }
    },
    {
      "id": "denying-subjectivity",
      "prompt": "Which concepts deny or disregard a person's voice, agency, experience, or individual responsibility?",
      "explanation": "Subjectivity is denied when testimony is not heard, agency and feeling are discounted, responsibility is assigned by group identity, or the other is approached as an object rather than a participant in relationship.",
      "targets": [
        "silenced testimony",
        "denied agency",
        "emotional dismissal",
        "collective blame",
        "I–It relation",
        "dehumanization"
      ],
      "reasons": {
        "silenced testimony": "The person's own account is prevented from entering judgment.",
        "denied agency": "The person is not treated as capable of intention, choice, or self-direction.",
        "emotional dismissal": "The person's lived experience is rejected as irrelevant or irrational.",
        "collective blame": "Responsibility is assigned through membership rather than individual action.",
        "I–It relation": "The other is approached as an object to use, classify, or experience.",
        "dehumanization": "Human qualities and moral standing are denied or diminished."
      }
    },
    {
      "id": "restoring-personhood",
      "prompt": "Which concepts restore attention to a person as a particular subject with voice, history, dignity, and agency?",
      "explanation": "Restoring personhood requires more than avoiding insults: it means receiving a person's own voice, attending to biography and circumstance, recognizing mutual standing, and imagining consequences from beyond one's immediate viewpoint.",
      "targets": [
        "particular biography",
        "first-person voice",
        "reciprocal recognition",
        "moral imagination",
        "recognition"
      ],
      "reasons": {
        "particular biography": "A concrete life history resists reduction to a generic type.",
        "first-person voice": "The person can describe experience in their own terms.",
        "reciprocal recognition": "Each participant acknowledges the other as a subject with standing.",
        "moral imagination": "Another person's experience and possible future become morally vivid.",
        "recognition": "The other's status as a person within the moral community is affirmed."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Follow objectification into broader diagnostic pathways, then examine practices that restore recognition and human regard."
    },
    "entries": [
      {
        "id": "distortion-and-magnification",
        "reason": "Place reduction of the person within a wider framework of epistemic and moral distortion.",
        "via": [
          "abstraction",
          "moral exclusion"
        ]
      },
      {
        "id": "moral-disengagement-and-moral-inversion",
        "reason": "Distinguish treating people as less morally relevant from the mechanisms that excuse or celebrate harmful conduct.",
        "via": [
          "dehumanization",
          "moral orientation"
        ]
      },
      {
        "id": "restorative-patterns",
        "reason": "Move from reduction and exclusion toward practices that preserve dignity, voice, particularity, and relationship.",
        "via": [
          "recognition",
          "moral imagination"
        ]
      }
    ]
  }
});
