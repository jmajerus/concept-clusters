// Concept Clusters puzzle: Theories of knowledge
// Category: Philosophy & Social Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "epistemology-schools",
  "title": "Theories of knowledge",
  "category": "Philosophy & Social Science",
  "clusters": [
    {
      "name": "Rationalism",
      "info": {
        "link": "wiki:Rationalism"
      },
      "color": "green",
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
          "link": "wiki:Innatism"
        },
        "cogito ergo sum": {
          "text": "Latin for \"I think, therefore I am\" — Descartes' foundational certainty: even radical doubt proves a doubting mind exists.",
          "link": "wiki:Cogito, ergo sum"
        },
        "Descartes": {
          "link": "wiki:René Descartes"
        }
      }
    },
    {
      "name": "Empiricism",
      "info": {
        "link": "wiki:Empiricism"
      },
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
          "link": "wiki:Tabula rasa"
        },
        "sense-data": {
          "link": "wiki:Sense data"
        },
        "Locke": {
          "text": "The English philosopher who argued the mind begins as a blank slate, with all ideas built from experience.",
          "link": "wiki:John Locke"
        }
      }
    },
    {
      "name": "Existentialism",
      "info": {
        "link": "wiki:Existentialism"
      },
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
          "link": "wiki:Existentialism"
        },
        "authenticity": {
          "text": "Living according to values and choices genuinely your own, rather than ones imposed by society or conformity.",
          "link": "wiki:Authenticity (philosophy)"
        },
        "Sartre": {
          "link": "wiki:Jean-Paul Sartre"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "a priori knowledge",
      "clusters": [
        0,
        1
      ],
      "fact": "A priori knowledge bridges the two: rationalists insist some truths can be known independent of experience, while empiricists insist every idea ultimately traces back to something first sensed.",
      "idealTerms": [
        "innate ideas",
        "sense-data"
      ],
      "info": {
        "link": "wiki:A priori and a posteriori"
      }
    },
    {
      "term": "human nature",
      "clusters": [
        0,
        2
      ],
      "fact": "Human nature bridges the two: rationalists like Descartes assumed a fixed rational essence common to all humans, while existentialists deny any such fixed nature — for Sartre, existence precedes essence, so we define ourselves through our choices instead of discovering a nature already given.",
      "idealTerms": [
        "innate ideas",
        "radical freedom"
      ],
      "info": {
        "link": "wiki:Human nature"
      }
    }
  ]
};
