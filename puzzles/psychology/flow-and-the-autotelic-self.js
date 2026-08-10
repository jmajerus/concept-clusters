// Generated from content/puzzles/flow-and-the-autotelic-self.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "flow-and-the-autotelic-self",
  "title": "Flow and the Autotelic Self",
  "category": "Psychology",
  "tags": [
    "book"
  ],
  "info": {
    "text": "Mihaly Csikszentmihalyi's model of the mental state people enter when a task's demands and their own skill are closely matched, and attention becomes fully absorbed by the activity itself.",
    "link": "wiki:Flow (psychology)",
    "citations": [
      {
        "title": "Flow: The Psychology of Optimal Experience",
        "author": "Csikszentmihalyi, Mihaly",
        "publisher": "Harper & Row",
        "year": "1990"
      }
    ]
  },
  "lenses": [
    {
      "id": "producing-the-autotelic-quality",
      "prompt": "Which concepts describe what makes an activity self-rewarding -- whether the conditions that set it up or the trait it eventually produces -- rather than what the experience feels like once you're already absorbed in it?",
      "explanation": "These six concepts trace one causal line: the four conditions on the left of the model set up the possibility of an autotelic activity, and repeated practice at creating those conditions is what Csikszentmihalyi calls an autotelic personality. The four terms in 'The Flow Experience' cluster describe something different -- not what produces the reward, but what it feels like once you're already inside it.",
      "targets": [
        "challenge-skill balance",
        "clear goals",
        "immediate feedback",
        "merging of action and awareness",
        "autotelic activity",
        "autotelic personality"
      ],
      "reasons": {
        "autotelic activity": "This bridge concept names the causal link directly: well-structured conditions turn ordinary effort into something rewarding for its own sake.",
        "autotelic personality": "This is what happens when a person learns to produce autotelic conditions deliberately and repeatedly, not a one-time feeling."
      }
    }
  ],
  "clusters": [
    {
      "id": "conditions-for-flow",
      "name": "Conditions for Flow",
      "color": "magenta",
      "fact": "Csikszentmihalyi found flow depended on a specific set of conditions: a challenge just within reach of one's skill, goals clear enough to act on moment by moment, feedback immediate enough to adjust in real time, and a merging of action and awareness so complete that the activity and the person doing it become hard to separate.",
      "terms": [
        "challenge-skill balance",
        "clear goals",
        "immediate feedback",
        "merging of action and awareness"
      ],
      "seeds": [
        "challenge-skill balance",
        "clear goals"
      ],
      "info": {
        "text": "The specific circumstances Csikszentmihalyi identified as reliably producing a flow state.",
        "link": "wiki:Flow (psychology)"
      }
    },
    {
      "id": "the-flow-experience",
      "name": "The Flow Experience",
      "color": "olive",
      "fact": "Once flow conditions are met, the experience itself has a recognizable shape: self-consciousness disappears, time speeds up or slows down unpredictably, a paradoxical sense of control emerges even over uncertain outcomes, and concentration that would normally take effort starts to feel effortless.",
      "terms": [
        "loss of self-consciousness",
        "transformation of time",
        "sense of control",
        "effortless concentration"
      ],
      "seeds": [
        "loss of self-consciousness",
        "transformation of time"
      ],
      "info": {
        "text": "What flow actually feels like from the inside, as distinct from the conditions that produce it.",
        "link": "wiki:Flow (psychology)"
      }
    },
    {
      "id": "psychic-energy-and-the-autotelic-self",
      "name": "Psychic Energy and the Autotelic Self",
      "color": "cyan",
      "fact": "Csikszentmihalyi treated attention itself as a limited energy that can be invested well or squandered: psychic entropy is the disordered, divided attention of ordinary anxious life, negentropy is attention gathered into one order, and an autotelic personality is someone who has learned to produce that order deliberately, in almost any activity.",
      "terms": [
        "psychic entropy",
        "attention as psychic energy",
        "negentropy",
        "autotelic personality"
      ],
      "seeds": [
        "psychic entropy",
        "attention as psychic energy"
      ],
      "info": {
        "text": "Csikszentmihalyi's broader theoretical claim about attention as a finite resource, underlying the flow model itself.",
        "link": "wiki:Flow (psychology)"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-autotelic-activity",
      "term": "autotelic activity",
      "clusters": [
        0,
        2
      ],
      "fact": "When conditions like challenge-skill balance, clear goals, and immediate feedback are present, ordinary effortful activity becomes self-rewarding -- Csikszentmihalyi calls this quality autotelic, and argues that people who cultivate an autotelic personality learn to create these conditions for themselves even in mundane tasks.",
      "relationKind": "dynamic",
      "idealTerms": [
        "challenge-skill balance",
        "autotelic personality"
      ]
    },
    {
      "id": "bridge-ordered-attention",
      "term": "ordered attention",
      "clusters": [
        1,
        2
      ],
      "fact": "Csikszentmihalyi frames flow as psychic negentropy: when attention is fully and continuously invested in one task rather than divided, the ordinary background chatter of self-monitoring falls away -- producing exactly the loss of self-consciousness and altered time sense reported during flow.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "psychic entropy"
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
