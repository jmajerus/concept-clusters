// Generated from content/puzzles/religion-ritual-practice.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "religion-ritual-practice",
  "title": "What Bodies Do With Belief: Passage, Time, Practice, and Place",
  "category": "religion",
  "subcategories": {
    "religion": "ritual-and-practice"
  },
  "large": true,
  "info": {
    "text": "How religions live in bodies and calendars: the rites that carry people across life thresholds, the holy intervals that break ordinary time, the physical practices of devotion, and the places kept to hold the holy.",
    "citations": [
      {
        "title": "Rite of passage -- Britannica on van Gennep's separation, transition, and reincorporation",
        "url": "https://www.britannica.com/topic/rite-of-passage"
      },
      {
        "title": "Sacred Time and Myths -- Eliade on festivals interrupting profane duration",
        "url": "http://www.columbia.edu/itc/religion/f2001/edit/docs/Eliade1.html"
      },
      {
        "title": "Shrine -- Wikipedia on shrines, altars, and venerated figures and objects",
        "url": "https://en.wikipedia.org/wiki/Shrine"
      }
    ]
  },
  "clusters": [
    {
      "id": "passages",
      "name": "Passages",
      "color": "teal",
      "fact": "Religions move people across life thresholds with rites of entry, union, and farewell.",
      "terms": [
        "baptism",
        "bar mitzvah",
        "funeral rite",
        "marriage rite"
      ],
      "seeds": [
        "baptism",
        "funeral rite"
      ],
      "termInfo": {
        "baptism": {
          "text": "Entry by water: the Christian rite of initiation into the faith."
        },
        "bar mitzvah": {
          "text": "A Jewish coming-of-age rite marking religious majority (bat mitzvah for girls)."
        },
        "funeral rite": {
          "text": "Farewell performed: the rite carrying the dead out of the community of the living."
        },
        "marriage rite": {
          "text": "Union witnessed: the rite binding two people before community and divine."
        }
      }
    },
    {
      "id": "sacred-time",
      "name": "Sacred Time",
      "color": "blue",
      "fact": "Religions break ordinary time into returning holy intervals of rest, restraint, and celebration.",
      "terms": [
        "fasting",
        "festival",
        "liturgy",
        "sabbath"
      ],
      "seeds": [
        "festival",
        "sabbath"
      ],
      "termInfo": {
        "fasting": {
          "text": "Holy restraint: abstaining from food to mark sacred time."
        },
        "festival": {
          "text": "A returning holy day or season that reactualizes a founding event."
        },
        "liturgy": {
          "text": "The ordered words and actions of public worship."
        },
        "sabbath": {
          "text": "The seventh day kept apart from work for rest and worship."
        }
      }
    },
    {
      "id": "bodied-practice",
      "name": "Bodied Practice",
      "color": "amber",
      "fact": "Believers enact devotion with their bodies and goods: addressing, lowering, journeying, giving, and eating by rule.",
      "terms": [
        "alms",
        "dietary law",
        "pilgrimage",
        "prayer",
        "prostration"
      ],
      "seeds": [
        "pilgrimage",
        "prayer"
      ],
      "termInfo": {
        "alms": {
          "text": "Goods given to the poor as a religious duty."
        },
        "dietary law": {
          "text": "Rules bounding what, when, and with whom believers eat."
        },
        "pilgrimage": {
          "text": "Journey on foot to a holy place as an act of devotion."
        },
        "prayer": {
          "text": "Address: words or silence directed to the divine."
        },
        "prostration": {
          "text": "Lowering the body to the ground in submission before the holy."
        }
      }
    },
    {
      "id": "holy-places",
      "name": "Holy Places",
      "color": "magenta",
      "fact": "Practice gathers at marked places built or set apart to hold the holy and its traces.",
      "terms": [
        "altar",
        "icon",
        "relic",
        "shrine",
        "temple"
      ],
      "seeds": [
        "shrine",
        "temple"
      ],
      "termInfo": {
        "altar": {
          "text": "The table of offering: where gifts are given to the holy."
        },
        "icon": {
          "text": "A holy image venerated as a window onto its subject."
        },
        "relic": {
          "text": "A bodily trace of a saint, kept and venerated."
        },
        "shrine": {
          "text": "A place dedicated to a holy figure, holding objects or traces for veneration."
        },
        "temple": {
          "text": "A house of worship and divine presence."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "hajj",
      "term": "hajj",
      "clusters": [
        2,
        3
      ],
      "fact": "The hajj is five days of prescribed bodily rites -- circling, standing, walking -- culminating at one built shrine, the Kaaba.",
      "termRole": "reference"
    },
    {
      "id": "temple-feast",
      "term": "temple feast",
      "clusters": [
        3,
        1
      ],
      "fact": "Feasts unfold at shrines on set calendar days; the gathering keeps sacred time at a sacred place.",
      "termRole": "reference"
    }
  ],
  "lenses": [
    {
      "id": "the-farewell",
      "prompt": "Which rite carries someone out of the community rather than into a new status?",
      "explanation": "Baptism, bar mitzvah, and marriage install people into new statuses; only the funeral rite carries someone out of the community of the living.",
      "targets": [
        "funeral rite"
      ],
      "reasons": {
        "funeral rite": "The farewell that releases the dead from the living community."
      }
    },
    {
      "id": "holy-restraint",
      "prompt": "Which two practices honor the holy by restraint -- by what believers refuse?",
      "explanation": "Fasting and dietary law honor the holy by refusal -- by food declined or bounded. Prayer, prostration, pilgrimage, and alms are doings and givings, while sabbath, festival, and liturgy are kept times and celebrations rather than restraints.",
      "targets": [
        "dietary law",
        "fasting"
      ],
      "reasons": {
        "dietary law": "Everyday eating bounded by rule.",
        "fasting": "Food declined to mark sacred time."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "The structure of passage and its lived instances: rites-of-passage teaches van Gennep's three phases, this board the baptisms, funerals, holy times, practices, and places around them."
    },
    "entries": [
      {
        "id": "rites-of-passage",
        "reason": "Learn van Gennep's three-phase structure of passage first; this board shows the instance rites and the wider practice around them."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "content": {
      "mediaType": "text/markdown",
      "text": "Religion is usually described as belief, but it is practiced with knees, stomachs, feet, and calendars. Long before anyone states a doctrine, they have already been washed, fed by rule, walked to a shrine, and taught which days are different.\n\nFour patterns carry that life across traditions: rites that move people over life's thresholds, times set apart as holy, bodily disciplines of devotion, and places kept to hold it all."
    }
  }
});
