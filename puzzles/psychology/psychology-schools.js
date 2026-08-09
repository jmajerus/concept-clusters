// Generated from content/puzzles/psychology-schools.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "psychology-schools",
  "title": "Schools of psychology",
  "category": "Psychology",
  "clusters": [
    {
      "id": "cluster-behaviorism",
      "name": "Behaviorism",
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
        "Pavlov": {
          "link": "wiki:Ivan Pavlov",
          "text": "The Russian physiologist whose experiments with dogs discovered classical conditioning."
        },
        "conditioning": {
          "link": "wiki:Classical conditioning",
          "text": "Learning to associate a neutral stimulus with one that already triggers a response — Pavlov's dogs learning to salivate at a bell."
        },
        "operant conditioning": {
          "link": "wiki:Operant conditioning",
          "text": "Skinner's principle that behavior is shaped by its consequences — reinforced actions repeat, punished ones fade."
        },
        "reinforcement": {
          "link": "wiki:Reinforcement"
        }
      },
      "info": {
        "link": "wiki:Behaviorism",
        "text": "A school of psychology that explains behavior purely through its observable causes and effects, treating what can be measured from the outside as the proper subject of study — not inner thoughts or feelings."
      }
    },
    {
      "id": "cluster-psychoanalysis",
      "name": "Psychoanalysis",
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
        "Freud": {
          "link": "wiki:Sigmund Freud"
        },
        "ego": {
          "link": "wiki:Id, ego and superego",
          "text": "In Freud's model, the rational part of the mind that mediates between the id's impulses and reality's demands."
        },
        "id": {
          "link": "wiki:Id, ego and superego",
          "text": "In Freud's model, the primitive part of the mind driven by instinct and desire, with no regard for consequences."
        },
        "repression": {
          "link": "wiki:Repression (psychoanalysis)",
          "text": "Freud's term for unconsciously pushing a distressing thought or desire out of awareness."
        }
      },
      "info": {
        "link": "wiki:Psychoanalysis",
        "text": "A school of psychology that treats behavior as shaped by hidden inner conflicts and drives a person isn't consciously aware of."
      }
    },
    {
      "id": "cluster-humanistic-psychology",
      "name": "Humanistic psychology",
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
        "Maslow": {
          "link": "wiki:Abraham Maslow",
          "text": "The psychologist who proposed the hierarchy of needs and the concept of self-actualization."
        },
        "hierarchy of needs": {
          "link": "wiki:Maslow's hierarchy of needs"
        },
        "self-actualization": {
          "link": "wiki:Self-actualization"
        }
      },
      "info": {
        "link": "wiki:Humanistic psychology",
        "text": "A school of psychology that emphasizes personal growth and each person's active role in shaping their own development, rather than being wholly shaped by outside forces."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-determinism",
      "term": "determinism",
      "clusters": [
        0,
        1
      ],
      "fact": "Determinism bridges the two: behaviorism explains action as shaped by external conditioning, and psychoanalysis explains it as driven by unconscious forces — both deny that people simply choose freely.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Determinism"
      },
      "idealTerms": [
        "conditioning",
        "id"
      ]
    },
    {
      "id": "bridge-the-unconscious",
      "term": "the unconscious",
      "clusters": [
        1,
        2
      ],
      "fact": "The unconscious bridges the two: psychoanalysis built its entire model on hidden unconscious drives, while humanistic psychology arose specifically to reject that determinism in favor of conscious self-direction.",
      "relationKind": "contrast",
      "info": {
        "link": "wiki:Unconscious mind"
      },
      "idealTerms": [
        "id",
        null
      ]
    }
  ]
});
