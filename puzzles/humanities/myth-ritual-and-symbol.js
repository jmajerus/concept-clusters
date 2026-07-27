// Concept Clusters puzzle: Myth, ritual, and symbol
// Standard size: 12 cluster terms + 3 bridge terms = 15 nodes.
// Humanities starter set drafted July 2026.

export default {
  "id": "myth-ritual-and-symbol",
  "title": "Myth, ritual, and symbol",
  "category": "Humanities",
  "info": {
    "text": "Myths, rituals, and symbols are distinct cultural forms that often interact, carrying inherited meanings through narrative, performance, objects, images, and places.",
    "link": "wiki:Myth and ritual"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Follow symbolic traditions into visual art and the societies that preserved them."
    },
    "entries": [
      {
        "id": "reading-a-painting",
        "via": [
          "iconography",
          "sacred image"
        ],
        "reason": "Use visual analysis and iconography to examine how inherited symbols appear in works of art."
      },
      {
        "id": "ancient-civilizations",
        "via": [
          "myth",
          "ritual",
          "tradition"
        ],
        "reason": "Place mythic narratives and ritual practices within the institutions and material cultures of ancient societies."
      }
    ]
  },
  "clusters": [
    {
      "name": "Mythic narratives",
      "color": "green",
      "fact": "Myths can narrate origins, overwhelming disasters, culture-shaping deeds, and boundary-crossing tricksters, although each tradition gives these patterns its own meanings.",
      "terms": [
        "creation account",
        "flood story",
        "culture hero",
        "trickster figure"
      ],
      "seeds": [
        "creation account",
        "trickster figure"
      ],
      "termInfo": {
        "creation account": {
          "text": "A sacred or traditional narrative about the origin of the world, a people, an institution, or a central feature of life.",
          "link": "wiki:Creation myth"
        },
        "flood story": {
          "text": "A narrative in which a catastrophic flood destroys or transforms an earlier world, often followed by survival, renewal, or a new social order.",
          "link": "wiki:Flood myth"
        },
        "culture hero": {
          "text": "A mythic figure credited with giving people important practices, institutions, technologies, or forms of knowledge.",
          "link": "wiki:Culture hero"
        },
        "trickster figure": {
          "text": "A boundary-crossing character whose cleverness, rule-breaking, or reversals expose limits and create unexpected change.",
          "link": "wiki:Trickster"
        }
      },
      "info": {
        "link": "wiki:Myth"
      }
    },
    {
      "name": "Ritual practices",
      "color": "blue",
      "fact": "Initiation rites, seasonal festivals, pilgrimages, and offerings organize significant actions in time and space, often linking individuals with a community and its traditions.",
      "terms": [
        "initiation rite",
        "seasonal festival",
        "pilgrimage",
        "offering"
      ],
      "seeds": [
        "initiation rite",
        "pilgrimage"
      ],
      "termInfo": {
        "initiation rite": {
          "text": "A ceremony marking entry into a group, status, role, or new stage of life.",
          "link": "wiki:Rite of passage"
        },
        "seasonal festival": {
          "text": "A recurring communal observance tied to a season, agricultural cycle, sacred calendar, or remembered event.",
          "link": "wiki:Festival"
        },
        "pilgrimage": {
          "text": "A journey to a place regarded as sacred or spiritually significant.",
          "link": "wiki:Pilgrimage"
        },
        "offering": {
          "text": "A gift, substance, object, or act presented in a religious or ceremonial setting.",
          "link": "wiki:Votive offering"
        }
      },
      "info": {
        "link": "wiki:Ritual"
      }
    },
    {
      "name": "Symbolic forms",
      "color": "amber",
      "fact": "Objects, images, places, and gestures can carry meanings that exceed their practical use, making shared values, identities, or sacred realities perceptible.",
      "terms": [
        "sacred object",
        "sacred image",
        "sacred place",
        "ritual gesture"
      ],
      "seeds": [
        "sacred image",
        "sacred place"
      ],
      "termInfo": {
        "sacred object": {
          "text": "An object treated as holy, consecrated, powerful, or closely associated with a sacred person, event, or practice.",
          "link": "wiki:Sacred"
        },
        "sacred image": {
          "text": "A visual representation used to depict, recall, or mediate a sacred being, event, teaching, or presence.",
          "link": "wiki:Religious image"
        },
        "sacred place": {
          "text": "A natural or built location regarded as holy and often associated with worship, pilgrimage, memory, or restricted conduct.",
          "link": "wiki:Sacred space"
        },
        "ritual gesture": {
          "text": "A prescribed movement or bodily action whose shared meaning is established within a ceremonial tradition.",
          "link": "wiki:Gesture"
        }
      },
      "info": {
        "link": "wiki:Symbol"
      }
    }
  ],
  "bridges": [
    {
      "term": "ritual reenactment",
      "clusters": [
        0,
        1
      ],
      "relationKind": "continuity",
      "fact": "A ritual can reenact or commemorate a mythic episode, turning an inherited narrative into a shared performance that carries it into a new generation.",
      "idealTerms": [
        null,
        "seasonal festival"
      ],
      "info": {
        "text": "The ceremonial performance or commemoration of actions associated with a traditional narrative or sacred event.",
        "link": "wiki:Myth and ritual"
      }
    },
    {
      "term": "sacred meaning",
      "clusters": [
        1,
        2
      ],
      "relationKind": "foundation",
      "fact": "Sacred meaning links ritual and symbol: ceremonies give objects, images, places, and gestures a setting in which communities recognize more than their ordinary use.",
      "idealTerms": [
        "offering",
        "sacred object"
      ],
      "info": {
        "text": "Meaning associated with what a community regards as holy, set apart, or connected with ultimate significance.",
        "link": "wiki:Sacred"
      }
    },
    {
      "term": "tradition",
      "clusters": [
        0,
        2
      ],
      "relationKind": "continuity",
      "fact": "Tradition transmits myths and symbolic forms across generations, often preserving recognizable patterns while adapting their expression to new settings.",
      "idealTerms": [
        "culture hero",
        "sacred image"
      ],
      "info": {
        "text": "Inherited beliefs, practices, stories, and forms passed among members of a community over time.",
        "link": "wiki:Tradition"
      }
    }
  ]
};
