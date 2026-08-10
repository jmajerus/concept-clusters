// Generated from content/puzzles/when-attention-isnt-a-choice.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "when-attention-isnt-a-choice",
  "title": "When Attention Isn't a Choice",
  "category": "Psychology",
  "categories": [
    "Psychology",
    "Economics"
  ],
  "info": {
    "text": "Behavioral economics research showing that scarcity itself depletes the cognitive bandwidth available for attention and self-control -- evidence used to challenge theories that treat attentional discipline as equally available to everyone, regardless of material circumstances.",
    "link": "wiki:Scarcity: Why Having Too Little Means So Much",
    "citations": [
      {
        "title": "Poverty Impedes Cognitive Function",
        "author": "Mani, Anandi, Mullainathan, Sendhil, Shafir, Eldar, and Zhao, Jiaying",
        "publisher": "Science, 341(6149)",
        "year": "2013",
        "pages": "976-980"
      },
      {
        "title": "Scarcity: Why Having Too Little Means So Much",
        "author": "Mullainathan, Sendhil, and Shafir, Eldar",
        "publisher": "Henry Holt and Co.",
        "year": "2013"
      },
      {
        "title": "Review: Flow -- The Psychology of Optimal Experience",
        "author": "Covington, Nick",
        "publisher": "Human Restoration Project",
        "year": "2021",
        "url": "https://www.humanrestorationproject.org/writing/review-flow-the-psychology-of-optimal-experience"
      }
    ]
  },
  "lenses": [
    {
      "id": "observed-not-theorized",
      "prompt": "Which concepts describe something actually measured, felt, or observed in real people, rather than the theoretical construct used to name or explain it?",
      "explanation": "These six are the raw phenomena: real farmers, a real season of scarcity, a measured drop in fluid intelligence, and the felt experience of a mind pulled toward one preoccupation while other tasks slip. 'Cognitive bandwidth' and 'tunneling' are the theoretical vocabulary built to explain these observations -- and the third cluster is a further step removed again, using both to argue against a rival theory.",
      "targets": [
        "sugarcane farmers",
        "pre-harvest scarcity",
        "fluid intelligence",
        "financial preoccupation",
        "narrowed focus",
        "neglected tasks"
      ],
      "reasons": {
        "fluid intelligence": "This is the specific capacity Raven's matrices measured -- an observed drop, not the explanatory construct (cognitive bandwidth) built to account for it.",
        "neglected tasks": "This names what a tunneled person actually failed to do, not the tunneling mechanism itself."
      }
    }
  ],
  "clusters": [
    {
      "id": "the-bandwidth-tax",
      "name": "The Bandwidth Tax",
      "color": "amber",
      "fact": "Testing the same Tamil Nadu sugarcane farmers before and after harvest, Mani, Mullainathan, Shafir, and Zhao found that being poor -- not being a different kind of person -- cost their fluid intelligence, measured with Raven's matrices, an amount comparable to losing a full night's sleep.",
      "terms": [
        "cognitive bandwidth",
        "sugarcane farmers",
        "pre-harvest scarcity",
        "fluid intelligence"
      ],
      "seeds": [
        "cognitive bandwidth",
        "sugarcane farmers"
      ],
      "info": {
        "text": "The 2013 study and the broader research program on scarcity's cognitive costs that grew out of it.",
        "link": "wiki:Scarcity: Why Having Too Little Means So Much"
      }
    },
    {
      "id": "tunneling",
      "name": "Tunneling",
      "color": "blue",
      "fact": "Mullainathan and Shafir describe scarcity as producing a 'tunnel': the pressing shortage captures attention so completely that other obligations and opportunities, however important, fall outside the tunnel's edge and go unattended -- not from carelessness, but because there is no spare bandwidth left to notice them.",
      "terms": [
        "tunneling",
        "financial preoccupation",
        "narrowed focus",
        "neglected tasks"
      ],
      "seeds": [
        "tunneling",
        "financial preoccupation"
      ],
      "info": {
        "text": "The book-length elaboration of the bandwidth-tax finding, extended to time, food, and loneliness as well as money.",
        "link": "wiki:Scarcity: Why Having Too Little Means So Much"
      }
    },
    {
      "id": "limits-of-attentional-control",
      "name": "The Limits of Attentional Control",
      "color": "brown",
      "fact": "Csikszentmihalyi argued that attention is 'ours to do with as we please,' and that psychic entropy is chiefly a failure of discipline. Critics reply that this reverses the arrow he needed: scarcity itself depletes the bandwidth available for that discipline, so two people are never starting the exercise of attentional control from the same place.",
      "terms": [
        "disciplined attention",
        "material conditions",
        "reversed causal arrow",
        "unequal starting bandwidth"
      ],
      "seeds": [
        "disciplined attention",
        "material conditions"
      ],
      "info": {
        "text": "The theory this cluster directly challenges: that attentional discipline is a freely available choice, independent of a person's material circumstances.",
        "link": "wiki:Flow (psychology)"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-finite-bandwidth",
      "term": "finite bandwidth",
      "clusters": [
        0,
        1
      ],
      "fact": "Both concepts describe the same finite resource under strain: the bandwidth tax measures how much cognitive capacity scarcity actually removes, while tunneling describes what the remaining capacity does under pressure -- narrowing around the shortage itself.",
      "relationKind": "foundation",
      "idealTerms": [
        "cognitive bandwidth",
        "tunneling"
      ]
    },
    {
      "id": "bridge-evidence-against-free-attention",
      "term": "evidence against free attention",
      "clusters": [
        0,
        2
      ],
      "fact": "The sugarcane farmer result is the evidence the critique invokes directly: if the same farmer's fluid intelligence and self-control measurably improve after harvest with nothing else in their life changed except money, attentional discipline cannot be the free-standing variable Csikszentmihalyi described -- it is downstream of how much bandwidth scarcity has already taken.",
      "relationKind": "evaluation",
      "idealTerms": [
        "sugarcane farmers",
        "material conditions"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-09"
    }
  ]
});
