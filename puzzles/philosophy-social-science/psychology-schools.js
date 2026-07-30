// Concept Clusters puzzle: Schools of psychology
// Category: Philosophy & Social Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "psychology-schools",
  "title": "Schools of psychology",
  "category": "Philosophy & Social Science",
  "clusters": [
    {
      "name": "Behaviorism",
      "info": {
        "text": "A school of psychology that explains behavior purely through its observable causes and effects, treating what can be measured from the outside as the proper subject of study — not inner thoughts or feelings.",
        "link": "wiki:Behaviorism"
      },
      "color": "teal",
      "fact": "Behaviorism studies only observable behavior, explaining it through conditioning and reinforcement rather than inner mental states.",
      "terms": [
        "conditioning",
        "reinforcement",
        "Pavlov",
        "operant conditioning"
      ],
      "seeds": [
        "conditioning",
        "reinforcement"
      ],
      "termInfo": {
        "conditioning": {
          "text": "Learning to associate a neutral stimulus with one that already triggers a response — Pavlov's dogs learning to salivate at a bell.",
          "link": "wiki:Classical conditioning"
        },
        "Pavlov": {
          "text": "The Russian physiologist whose experiments with dogs discovered classical conditioning.",
          "link": "wiki:Ivan Pavlov"
        },
        "operant conditioning": {
          "text": "Skinner's principle that behavior is shaped by its consequences — reinforced actions repeat, punished ones fade.",
          "link": "wiki:Operant conditioning"
        },
        "reinforcement": {
          "link": "wiki:Reinforcement"
        }
      }
    },
    {
      "name": "Psychoanalysis",
      "info": {
        "text": "A school of psychology that treats behavior as shaped by hidden inner conflicts and drives a person isn't consciously aware of.",
        "link": "wiki:Psychoanalysis"
      },
      "color": "blue",
      "fact": "Psychoanalysis holds that unconscious drives and conflicts, often repressed, shape behavior without a person's awareness.",
      "terms": [
        "id",
        "repression",
        "Freud",
        "ego"
      ],
      "seeds": [
        "id",
        "repression"
      ],
      "termInfo": {
        "id": {
          "text": "In Freud's model, the primitive part of the mind driven by instinct and desire, with no regard for consequences.",
          "link": "wiki:Id, ego and superego"
        },
        "repression": {
          "text": "Freud's term for unconsciously pushing a distressing thought or desire out of awareness.",
          "link": "wiki:Repression (psychoanalysis)"
        },
        "ego": {
          "text": "In Freud's model, the rational part of the mind that mediates between the id's impulses and reality's demands.",
          "link": "wiki:Id, ego and superego"
        },
        "Freud": {
          "link": "wiki:Sigmund Freud"
        }
      }
    },
    {
      "name": "Humanistic psychology",
      "info": {
        "text": "A school of psychology that emphasizes personal growth and each person's active role in shaping their own development, rather than being wholly shaped by outside forces.",
        "link": "wiki:Humanistic psychology"
      },
      "color": "amber",
      "fact": "Humanistic psychology focuses on conscious growth toward self-actualization, treating people as active authors of their own development.",
      "terms": [
        "self-actualization",
        "hierarchy of needs",
        "Maslow"
      ],
      "seeds": [
        "self-actualization",
        "hierarchy of needs"
      ],
      "termInfo": {
        "self-actualization": {
          "link": "wiki:Self-actualization"
        },
        "hierarchy of needs": {
          "link": "wiki:Maslow's hierarchy of needs"
        },
        "Maslow": {
          "text": "The psychologist who proposed the hierarchy of needs and the concept of self-actualization.",
          "link": "wiki:Abraham Maslow"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "determinism",
      "clusters": [
        0,
        1
      ],
      "relationKind": "cross-cutting",
      "fact": "Determinism bridges the two: behaviorism explains action as shaped by external conditioning, and psychoanalysis explains it as driven by unconscious forces — both deny that people simply choose freely.",
      "idealTerms": [
        "conditioning",
        "id"
      ],
      "info": {
        "link": "wiki:Determinism"
      }
    },
    {
      "term": "the unconscious",
      "clusters": [
        1,
        2
      ],
      "relationKind": "contrast",
      "fact": "The unconscious bridges the two: psychoanalysis built its entire model on hidden unconscious drives, while humanistic psychology arose specifically to reject that determinism in favor of conscious self-direction.",
      "idealTerms": [
        "id",
        null
      ],
      "info": {
        "link": "wiki:Unconscious mind"
      }
    }
  ]
};
