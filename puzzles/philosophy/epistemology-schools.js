// Generated from content/puzzles/epistemology-schools.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "epistemology-schools",
  "title": "Theories of knowledge",
  "category": "philosophy",
  "clusters": [
    {
      "id": "rationalism",
      "name": "Rationalism",
      "color": "teal",
      "fact": "Rationalism holds that reason alone, independent of the senses, can access certain truths — for Descartes, even one's own existence.",
      "terms": [
        "innate ideas",
        "cogito ergo sum",
        "Descartes"
      ],
      "seeds": [
        "innate ideas",
        "cogito ergo sum"
      ],
      "termInfo": {
        "innate ideas": {
          "links": [
            {
              "href": "wiki:Innatism"
            }
          ]
        },
        "cogito ergo sum": {
          "text": "Latin for \"I think, therefore I am\" — Descartes' foundational certainty: even radical doubt proves a doubting mind exists.",
          "links": [
            {
              "href": "wiki:Cogito, ergo sum"
            }
          ]
        },
        "Descartes": {
          "links": [
            {
              "href": "wiki:René Descartes"
            }
          ]
        }
      },
      "info": {
        "text": "A philosophical position holding that reason, rather than sensory experience, is the primary source of some of our most fundamental knowledge.",
        "links": [
          {
            "href": "wiki:Rationalism"
          }
        ]
      }
    },
    {
      "id": "empiricism",
      "name": "Empiricism",
      "color": "blue",
      "fact": "Empiricism holds that all knowledge comes from sensory experience; the mind begins as a blank slate with nothing innate.",
      "terms": [
        "tabula rasa",
        "sense-data",
        "Locke"
      ],
      "seeds": [
        "tabula rasa",
        "sense-data"
      ],
      "termInfo": {
        "tabula rasa": {
          "text": "Latin for \"blank slate\" — Locke's idea that the mind starts empty, with all knowledge built up from experience.",
          "links": [
            {
              "href": "wiki:Tabula rasa"
            }
          ]
        },
        "sense-data": {
          "links": [
            {
              "href": "wiki:Sense data"
            }
          ]
        },
        "Locke": {
          "text": "The English philosopher who argued the mind begins as a blank slate, with all ideas built from experience.",
          "links": [
            {
              "href": "wiki:John Locke"
            }
          ]
        }
      },
      "info": {
        "text": "A philosophical position holding that all knowledge is ultimately grounded in what we perceive through our senses, rather than anything present in the mind from birth.",
        "links": [
          {
            "href": "wiki:Empiricism"
          }
        ]
      }
    },
    {
      "id": "existentialism",
      "name": "Existentialism",
      "color": "amber",
      "fact": "Existentialism holds that humans have no fixed nature or purpose — we are radically free, and must create meaning through our own choices.",
      "terms": [
        "radical freedom",
        "authenticity",
        "Sartre"
      ],
      "seeds": [
        "radical freedom",
        "authenticity"
      ],
      "termInfo": {
        "radical freedom": {
          "text": "Sartre's claim that we have no fixed nature to fall back on — we are \"condemned to be free,\" fully responsible for defining ourselves through our choices.",
          "links": [
            {
              "href": "wiki:Existentialism"
            }
          ]
        },
        "authenticity": {
          "text": "Living according to values and choices genuinely your own, rather than ones imposed by society or conformity.",
          "links": [
            {
              "href": "wiki:Authenticity (philosophy)"
            }
          ]
        },
        "Sartre": {
          "links": [
            {
              "href": "wiki:Jean-Paul Sartre"
            }
          ]
        }
      },
      "info": {
        "text": "A philosophical position holding that people are not born with a fixed purpose or nature, and so must define who they are through the choices they actually make.",
        "links": [
          {
            "href": "wiki:Existentialism"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "a-priori-knowledge",
      "term": "a priori knowledge",
      "clusters": [
        0,
        1
      ],
      "fact": "A priori knowledge bridges the two: rationalists insist some truths can be known independent of experience, while empiricists insist every idea ultimately traces back to something first sensed.",
      "info": {
        "links": [
          {
            "href": "wiki:A priori and a posteriori"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "innate ideas",
        "sense-data"
      ]
    },
    {
      "id": "human-nature",
      "term": "human nature",
      "clusters": [
        0,
        2
      ],
      "fact": "Human nature bridges the two: rationalists like Descartes assumed a fixed rational essence common to all humans, while existentialists deny any such fixed nature — for Sartre, existence precedes essence, so we define ourselves through our choices instead of discovering a nature already given.",
      "info": {
        "links": [
          {
            "href": "wiki:Human nature"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "innate ideas",
        "radical freedom"
      ]
    }
  ]
});
