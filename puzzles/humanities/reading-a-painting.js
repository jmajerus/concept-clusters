// Concept Clusters puzzle: Reading a painting
// Standard size: 12 cluster terms + 3 bridge terms = 15 nodes.
// Humanities starter set drafted July 2026.

export default {
  "id": "reading-a-painting",
  "title": "Reading a painting",
  "category": "Humanities",
  "info": {
    "text": "Visual analysis asks how a painting's elements and composition guide attention, and how its historical setting shapes what those choices may mean.",
    "link": "wiki:Art history"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Continue from visual analysis into textual interpretation and symbolic traditions."
    },
    "entries": [
      {
        "id": "interpreting-a-text",
        "via": [
          "interpretation",
          "evidence"
        ],
        "reason": "Compare visual analysis with the way close reading builds an interpretation from details in a text."
      },
      {
        "id": "myth-ritual-and-symbol",
        "via": [
          "iconography",
          "sacred image"
        ],
        "reason": "Follow symbolic images into the myths, rituals, and traditions that can give them cultural meaning."
      }
    ]
  },
  "clusters": [
    {
      "name": "Visual elements",
      "color": "teal",
      "fact": "Line, color, light and shadow, and texture are basic visual resources through which a painting creates form, mood, emphasis, and surface.",
      "terms": [
        "line",
        "color",
        "light and shadow",
        "texture"
      ],
      "seeds": [
        "line",
        "color"
      ],
      "termInfo": {
        "line": {
          "text": "An actual or implied path that can define edges, suggest movement, divide space, or direct the viewer's eye.",
          "link": "wiki:Line (graphics)"
        },
        "color": {
          "text": "Hue, value, and intensity used to distinguish forms, create contrasts, establish mood, or carry associations.",
          "link": "wiki:Color theory"
        },
        "light and shadow": {
          "text": "Variations in brightness that model form, create depth, establish atmosphere, or emphasize selected areas.",
          "link": "wiki:Chiaroscuro"
        },
        "texture": {
          "text": "The actual or depicted surface quality of a work, such as smoothness, roughness, thickness, or visible brushwork.",
          "link": "wiki:Texture (visual arts)"
        }
      },
      "info": {
        "link": "wiki:Elements of art"
      }
    },
    {
      "name": "Composition",
      "color": "blue",
      "fact": "Composition organizes a painting's parts through focal points, balance, scale, and perspective, shaping the order in which viewers notice and relate them.",
      "terms": [
        "focal point",
        "balance",
        "scale",
        "perspective"
      ],
      "seeds": [
        "focal point",
        "perspective"
      ],
      "termInfo": {
        "focal point": {
          "text": "The area designed to attract attention first or most strongly within the composition.",
          "link": "wiki:Composition (visual arts)"
        },
        "balance": {
          "text": "The distribution of visual weight across a composition, whether symmetrical, asymmetrical, or deliberately unstable.",
          "link": "wiki:Composition (visual arts)"
        },
        "scale": {
          "text": "The relative size of figures, objects, and spaces, which can suggest depth, importance, intimacy, or monumentality.",
          "link": "wiki:Scale (ratio)"
        },
        "perspective": {
          "text": "A system for representing spatial depth and viewpoint on a flat surface.",
          "link": "wiki:Perspective (graphical)"
        }
      },
      "info": {
        "link": "wiki:Composition (visual arts)"
      }
    },
    {
      "name": "Historical setting",
      "color": "amber",
      "fact": "A painting's subject, intended audience, original location, and historical moment help explain why it was made and how its first viewers may have understood it.",
      "terms": [
        "subject",
        "intended audience",
        "original location",
        "historical moment"
      ],
      "seeds": [
        "subject",
        "historical moment"
      ],
      "termInfo": {
        "subject": {
          "text": "The person, event, story, place, or idea represented in the painting.",
          "link": "wiki:Iconography"
        },
        "intended audience": {
          "text": "The viewers for whom the work was made or displayed, whose expectations can shape its form and message.",
          "link": "wiki:Audience"
        },
        "original location": {
          "text": "The architectural, devotional, civic, domestic, or commercial setting for which the painting was first made or displayed.",
          "link": "wiki:Art history"
        },
        "historical moment": {
          "text": "The political, religious, economic, and cultural conditions present when the work was produced.",
          "link": "wiki:Art history"
        }
      },
      "info": {
        "link": "wiki:Art history"
      }
    }
  ],
  "bridges": [
    {
      "term": "visual hierarchy",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Visual hierarchy uses contrasts in color, light, line, size, and placement to direct attention and establish an order of importance within the composition.",
      "idealTerms": [
        "light and shadow",
        "focal point"
      ],
      "info": {
        "text": "The perceived order of importance created when some visual elements stand out more strongly than others.",
        "link": "wiki:Visual hierarchy"
      }
    },
    {
      "term": "iconography",
      "clusters": [
        0,
        2
      ],
      "relationKind": "evaluation",
      "fact": "Iconography interprets depicted subjects, attributes, gestures, and symbols by comparing visible details with the cultural traditions and historical setting that made them meaningful.",
      "idealTerms": [
        null,
        "subject"
      ],
      "info": {
        "text": "The identification and interpretation of subjects, symbols, and conventional details in images.",
        "link": "wiki:Iconography"
      }
    },
    {
      "term": "patronage",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Patronage can shape a painting's scale, format, subject, audience, and original location because commissioners often influence what is made and where it will be seen.",
      "idealTerms": [
        "scale",
        "original location"
      ],
      "info": {
        "text": "Support or commissioning provided by a person or institution that enables and may influence the production of art.",
        "link": "wiki:Patronage"
      }
    }
  ]
};
