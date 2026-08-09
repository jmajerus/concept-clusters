// Generated from content/puzzles/the-manufactured-desire.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-manufactured-desire",
  "title": "The Manufactured Desire",
  "category": "Philosophy",
  "categories": ["Philosophy", "Sociology"],
  "subcategories": { "Philosophy": "political-philosophy" },
  "large": true,
  "tags": [
    "catalogue:wholeness-and-its-discontents"
  ],
  "info": {
    "link": "wiki:Critical theory",
    "text": "How the Frankfurt School, Situationism, and structural Marxism each describe modern capitalism turning private psychological anxiety into a permanent engine of consumption."
  },
  "lenses": [
    {
      "explanation": "A minor stylistic variant, a performed sincerity, a lifestyle assembled from signals, and a copy that has stopped referring to any original are four different technologies for the same illusion: that a standardized offering is actually a personal, authentic choice.",
      "id": "illusion-of-choice-and-uniqueness",
      "prompt": "Which concepts describe a mechanism for making standardized, mass-produced offerings feel deeply personal and authentic to the person choosing them?",
      "reasons": {
        "curated lifestyle": "A personality assembled and displayed as a coherent, purchasable aesthetic.",
        "performative authenticity": "Authenticity itself, packaged as something to be visibly performed rather than simply lived.",
        "pseudo-individualization": "Cosmetic variation added to standardized products specifically to manufacture a sense of unique choice.",
        "simulacra and simulation": "The point where the copy of a thing becomes more convincing, and more consumed, than any original it once referred to."
      },
      "targets": [
        "pseudo-individualization",
        "performative authenticity",
        "curated lifestyle",
        "simulacra and simulation"
      ]
    },
    {
      "explanation": "Scale is the tell here: these aren't personal coping strategies, they're the machinery operating above the individual -- an industry standardizing culture, a spectacle replacing lived experience with image, an apparatus of institutions shaping belief, a moment of being addressed and accepting the address, and a logic of efficiency governing all of it.",
      "id": "systemic-control-mechanisms",
      "prompt": "Which concepts are institutional or structural forces that organize a whole society toward passive compliance, rather than techniques an individual notices themselves using?",
      "reasons": {
        "culture industry": "Adorno and Horkheimer's name for entertainment and media organized on factory logic.",
        "ideological state apparatus": "Althusser's institutions -- schools, media, family -- that shape belief without direct coercion.",
        "instrumental rationality": "The efficiency-first logic the culture industry runs on, reducing culture to calculation.",
        "interpellation": "The specific moment ideology 'hails' an individual into a subject position, and the individual answers to it.",
        "society of the spectacle": "Debord's claim that mediated image has displaced direct lived and social relationship."
      },
      "targets": [
        "culture industry",
        "society of the spectacle",
        "ideological state apparatus",
        "interpellation",
        "instrumental rationality"
      ]
    },
    {
      "explanation": "Each of these promises relief for a void it did not create but profits from keeping open: a manufactured desire standing in for a real one, prestige purchased rather than felt, even memory and connection repackaged as purchasable content, and negative feeling itself rebranded as a personal defect with a commercial fix.",
      "id": "simulated-solutions-for-internal-voids",
      "prompt": "Which concepts are market-generated substitutes offered specifically to patch psychological alienation or dissatisfaction?",
      "reasons": {
        "commodification of experience": "Even memory, travel, and relationship converted into displayable, purchasable content.",
        "compulsory positivity": "A cultural mandate that recasts existential doubt or dissatisfaction as an attitude problem, sellable back as a wellness product.",
        "false needs": "Desires manufactured by advertising and social pressure that promise relief while leaving the underlying void untouched.",
        "sign-value": "Status and identity purchased through what an object signals, not what it does."
      },
      "targets": [
        "false needs",
        "sign-value",
        "commodification of experience",
        "compulsory positivity"
      ]
    }
  ],
  "learningIntroduction": {
    "content": {
      "mediaType": "text/markdown",
      "text": "# Selling a cure for a wound it needs open\n\nHaving watched Freud map the drive and Jung confront the shadow, a different question opens up: what happens when an entire economic system gets access to that same internal void -- and finds a way to profit from it?\n\n## An industry for culture itself\n\nWriting in the mid-twentieth century, two critical theorists argued that art and entertainment had been absorbed into factory logic: cultural products designed to reach the widest possible audience with the least possible friction. To keep audiences from noticing how uniform the results actually were, the system leans on a specific trick -- small, cosmetic variation dressed up as personal choice, so a mass-produced object can still feel like *your* object.\n\n## When the image outruns the thing\n\nA later generation of theorists tracked what happens as this logic keeps developing. Commodities stop being valued mainly for what they do, and start being valued for what they signal -- status, identity, belonging. Eventually the signals detach from anything they were originally standing in for, and the image itself becomes more persuasive, and more consumed, than whatever reality it was supposed to represent.\n\n## Being addressed, and answering\n\nA third strand asks how any of this gets a person to go along willingly. Institutions -- media, schools, advertising, family -- do not usually need force. They address a person as a particular kind of subject (\"as a successful professional,\" \"as a conscious consumer\"), and the person, recognizing the address, answers to it and starts acting accordingly. In a media environment built for constant self-presentation, that address increasingly asks for a curated, positive, marketable self -- and treats anything short of that as a personal failing rather than a reasonable reaction to real conditions.\n\n## A question to hold onto\n\nNone of these three traditions claim capitalism invented human anxiety. Their shared claim is narrower and, in a way, more unsettling: that a real internal void gets identified, and then kept carefully open, because keeping it open is what keeps the whole system in business.\n\n> **Reflection:** If a felt need can be manufactured, how would you go about telling a manufactured need apart from a need that simply, and independently, happens to exist?\n"
    },
    "estimatedMinutes": 5,
    "requirement": "recommended",
    "revision": 1,
    "summary": "See how three strands of critical theory each describe capitalism converting psychological anxiety into consumption, before organizing their vocabulary in this puzzle.",
    "title": "Selling a Cure for a Wound It Needs Open"
  },
  "clusters": [
    {
      "id": "culture-industry-mass-standardization",
      "name": "Culture Industry & Mass Standardization",
      "color": "teal",
      "fact": "Adorno and Horkheimer describe an industrial capitalism that produces standardized cultural goods on factory logic, while offering just enough cosmetic variation to make mass-produced sameness feel like personal choice.",
      "terms": [
        "culture industry",
        "pseudo-individualization",
        "mass standardization",
        "false needs",
        "instrumental rationality"
      ],
      "seeds": [
        "culture industry",
        "pseudo-individualization"
      ],
      "termInfo": {
        "culture industry": {
          "link": "wiki:Culture industry",
          "text": "Adorno and Horkheimer's term for art, media, and entertainment produced and distributed on the logic of a factory."
        },
        "false needs": {
          "text": "Desires manufactured by advertising and social pressure that promise psychological relief but leave the underlying void untouched."
        },
        "instrumental rationality": {
          "link": "wiki:Instrumental and value rationality",
          "text": "A logic that reduces everything, including culture, to efficiency and calculation toward profit."
        },
        "mass standardization": {
          "text": "The underlying condition pseudo-individualization is designed to disguise: cultural goods produced to predictable, repeatable formulas."
        },
        "pseudo-individualization": {
          "text": "Minor, cosmetic variation added to standardized products so mass sameness can be experienced as personal choice."
        }
      },
      "info": {
        "link": "wiki:Culture industry"
      }
    },
    {
      "id": "spectacular-society-hyperreal-commodities",
      "name": "Spectacular Society & Hyperreal Commodities",
      "color": "blue",
      "fact": "Debord and Baudrillard track a mutation in late capitalism: commodities stop being valued for use or exchange and start circulating as pure image and sign, until the image itself becomes more convincing than whatever it was supposed to represent.",
      "terms": [
        "society of the spectacle",
        "sign-value",
        "simulacra and simulation",
        "hyperreality",
        "commodification of experience"
      ],
      "seeds": [
        "society of the spectacle",
        "sign-value"
      ],
      "termInfo": {
        "commodification of experience": {
          "text": "Even memory, travel, and relationship converted into displayable, purchasable content."
        },
        "hyperreality": {
          "link": "wiki:Hyperreality",
          "text": "A condition where media representations and models feel more real, and more meaningful, than the physical reality they were drawn from."
        },
        "sign-value": {
          "text": "Baudrillard's term for value derived from what an object signals about status or identity, distinct from its use or exchange value."
        },
        "simulacra and simulation": {
          "link": "wiki:Simulacra and Simulation",
          "text": "The point where a copy of something no longer refers to any original, and circulates as more convincing than reality itself."
        },
        "society of the spectacle": {
          "link": "wiki:The Society of the Spectacle",
          "text": "Debord's claim that authentic social relationship has been replaced by a mediated collection of images."
        }
      },
      "info": {
        "link": "wiki:Jean Baudrillard"
      }
    },
    {
      "id": "ideological-apparatus-performative-authenticity",
      "name": "Ideological Apparatus & Performative Authenticity",
      "color": "amber",
      "fact": "Althusser's structural account of how institutions shape belief without direct force extends naturally into digital capitalism, where the same 'hailing' becomes a demand to build a marketable, positive, curated self.",
      "terms": [
        "ideological state apparatus",
        "interpellation",
        "performative authenticity",
        "curated lifestyle",
        "compulsory positivity"
      ],
      "seeds": [
        "ideological state apparatus",
        "interpellation"
      ],
      "termInfo": {
        "compulsory positivity": {
          "text": "A cultural doctrine that reframes doubt, dissatisfaction, or structural complaint as a personal attitude defect."
        },
        "curated lifestyle": {
          "text": "Personality, hobbies, and emotional life reshaped into a coherent, purchasable, displayable identity."
        },
        "ideological state apparatus": {
          "link": "wiki:Ideology and Ideological State Apparatuses",
          "text": "Althusser's term for institutions -- schools, media, family, religion -- that shape belief and behavior without physical coercion."
        },
        "interpellation": {
          "link": "wiki:Interpellation (philosophy)",
          "text": "The moment ideology addresses, or 'hails,' an individual as a specific kind of subject, and the individual recognizes and accepts that address."
        },
        "performative authenticity": {
          "text": "Authenticity itself pressured into becoming something visibly performed and maintained, rather than simply lived."
        }
      },
      "info": {
        "link": "wiki:Louis Althusser"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-manufactured-solace",
      "term": "manufactured solace",
      "clusters": [
        0,
        2
      ],
      "fact": "Standardized media and structural ideology offer the same basic service through different channels: pre-packaged emotional comfort designed to soothe systemic anxiety before it turns into genuine protest.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "false needs",
        "compulsory positivity"
      ]
    },
    {
      "id": "bridge-substitution-of-image-for-need",
      "term": "substitution of image for need",
      "clusters": [
        0,
        1
      ],
      "fact": "The culture industry's standardized products evolve, under Debord and Baudrillard's later diagnosis, from goods with real use into purely symbolic spectacles -- manufactured desire is what makes the leap into image-as-satisfaction possible in the first place.",
      "relationKind": "dynamic",
      "idealTerms": [
        "false needs",
        "sign-value"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-commodified-subjectivity",
      "term": "commodified subjectivity",
      "clusters": [
        1,
        2
      ],
      "fact": "When symbolic codes and structural ideology combine, identity itself becomes a market product: interpellation supplies the subject position, and the sign economy supplies what that position has to be seen buying.",
      "relationKind": "dynamic",
      "idealTerms": [
        "hyperreality",
        "curated lifestyle"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "learningIntroduction",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Anthropic",
      "role": "edited",
      "scope": "puzzle",
      "system": "Claude"
    }
  ]
});
