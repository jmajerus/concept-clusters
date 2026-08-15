// Generated from content/puzzles/the-scaffold-and-the-timetable.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-scaffold-and-the-timetable",
  "title": "The Scaffold and the Timetable",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Philosophy"
  ],
  "subcategories": {
    "Philosophy": "political-philosophy"
  },
  "info": {
    "text": "Michel Foucault's account of the shift from sovereign power's spectacular violence on the body to disciplinary power's quiet, constant arrangement of time, space, and observation -- illustrated by the two scenes he sets side by side at the start of Discipline and Punish.",
    "link": "wiki:Discipline and Punish"
  },
  "lenses": [
    {
      "id": "mechanisms-of-visibility",
      "prompt": "Which of these work specifically by putting a subject under actual or potential observation, rather than by physically marking or restraining their body?",
      "explanation": "Discipline's real innovation over the scaffold isn't gentleness, it's a different mechanism entirely: instead of marking a body once in public, it arranges people so they can always potentially be seen. Hierarchical observation formalizes who watches whom, the panopticon's visibility makes that watching structurally permanent even without an actual watcher, and self-surveillance is what happens once a person internalizes the possibility of being watched and starts policing themselves in the watcher's absence.",
      "targets": [
        "hierarchical observation",
        "visibility",
        "self-surveillance"
      ],
      "reasons": {
        "hierarchical observation": "Arranges people so that a superior can always potentially see what a subordinate is doing.",
        "self-surveillance": "What a subject does once they have internalized the possibility of being watched, whether or not anyone actually is.",
        "visibility": "The panopticon's core architectural trick: the watched can never confirm whether they are actually being watched."
      }
    },
    {
      "id": "effects-not-mechanisms",
      "prompt": "Which of these name what a subject becomes as a result of a given form of power, rather than the technique used to produce that result?",
      "explanation": "The condemned body, docile bodies, and self-surveillance are all end states rather than tools: public torture produces a body publicly marked and broken as proof of the sovereign's power, discipline as a whole aims at docile bodies -- obedient and useful without needing constant force -- and self-surveillance is what a disciplined subject actually does once the panopticon's visibility has done its work.",
      "targets": [
        "the condemned body",
        "docile bodies",
        "self-surveillance"
      ],
      "reasons": {
        "docile bodies": "What discipline as a whole aims at: bodies made obedient and useful without needing constant force.",
        "self-surveillance": "What a disciplined subject actually does, once external observation has been internalized.",
        "the condemned body": "What sovereign punishment produces: a body publicly marked and broken as proof of the sovereign's power."
      }
    }
  ],
  "clusters": [
    {
      "id": "the-scaffold",
      "name": "The Scaffold",
      "color": "brown",
      "fact": "Foucault opens Discipline and Punish with the 1757 public execution of Damiens: publicly staged, deliberately excessive violence on the body of the condemned, meant to be witnessed by a crowd as living proof of the sovereign's power to destroy whoever defied it.",
      "terms": [
        "public torture",
        "the spectacle of punishment",
        "the sovereign's vengeance",
        "the condemned body"
      ],
      "seeds": [
        "public torture",
        "the spectacle of punishment"
      ],
      "info": {
        "text": "The pre-modern regime of punishment Foucault uses to open his history: violent, public, and staged as a reassertion of the sovereign's own power rather than a calculated correction of the offender.",
        "link": "wiki:Discipline and Punish"
      }
    },
    {
      "id": "the-timetable",
      "name": "The Timetable",
      "color": "olive",
      "fact": "Eighty years after Damiens, Foucault sets a very different document beside it: a plain timetable regulating a young prisoner's day hour by hour. Discipline works through techniques like this one: hierarchical observation arranges people so they can always potentially be watched, normalizing judgment measures them against a norm rather than a law, and the examination fuses both into a documented, comparable record of who someone is.",
      "terms": [
        "the timetable",
        "hierarchical observation",
        "normalizing judgment",
        "the examination"
      ],
      "seeds": [
        "the timetable",
        "hierarchical observation"
      ],
      "info": {
        "text": "The disciplinary techniques Foucault identifies as replacing spectacular punishment: fine-grained control of time, space, and activity, aimed at producing a certain kind of person rather than simply displaying a punishment.",
        "link": "wiki:Discipline and Punish"
      }
    },
    {
      "id": "the-panopticon",
      "name": "The Panopticon",
      "color": "cyan",
      "fact": "Bentham's unbuilt prison design became Foucault's diagram for how discipline actually works: a central tower makes every cell permanently visible while the watcher stays unseen, so the person being watched can never confirm whether anyone is actually looking -- and eventually starts supervising themselves, producing exactly what discipline is after: a docile body, obedient and useful without needing constant force at all.",
      "terms": [
        "the panopticon",
        "visibility",
        "self-surveillance",
        "docile bodies"
      ],
      "seeds": [
        "the panopticon",
        "visibility"
      ],
      "info": {
        "text": "Bentham's architectural design, taken up by Foucault as the general model of disciplinary power: permanent visibility that eventually makes external enforcement unnecessary.",
        "link": "wiki:Panopticon"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-economy-of-power",
      "term": "economy of power",
      "clusters": [
        0,
        1
      ],
      "fact": "Foucault frames the whole shift as a change in the economy of power rather than a softening of it: the goal moves from punishing spectacularly but occasionally to correcting constantly and universally, inserting the power to control more deeply into the social body even as its visible violence disappears.",
      "relationKind": "contrast"
    },
    {
      "id": "bridge-internalization",
      "term": "internalization",
      "clusters": [
        2,
        1
      ],
      "fact": "The panopticon is what makes hierarchical observation cheap: instead of needing an actual supervisor watching at all times, permanent visibility lets the mere possibility of being watched do the work, until the watched person internalizes it and keeps applying normalizing judgment to themselves even when no one is there.",
      "relationKind": "dynamic",
      "idealTerms": [
        "visibility",
        "hierarchical observation"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "bridge-who-is-seen",
      "term": "who is seen",
      "clusters": [
        0,
        2
      ],
      "fact": "The scaffold makes the sovereign's power spectacularly visible while the crowd watching it remains an anonymous mass; the panopticon inverts this completely, making the watched person permanently and individually visible while the observer -- who may not even be present -- becomes invisible and unverifiable.",
      "relationKind": "contrast"
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-11"
    }
  ]
});
