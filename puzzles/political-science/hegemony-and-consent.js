// Generated from content/puzzles/hegemony-and-consent.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "hegemony-and-consent",
  "title": "Hegemony and Consent",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Sociology"
  ],
  "info": {
    "text": "Antonio Gramsci's account of how a ruling class secures its dominance mainly by diffusing consent across civil society, with direct coercion held in reserve rather than doing most of the work -- and what contesting that dominance would actually require.",
    "link": "wiki:Antonio Gramsci"
  },
  "lenses": [
    {
      "id": "the-civil-register",
      "prompt": "Which of these operate primarily through civil society's own institutions, rather than through the state's directly coercive apparatus?",
      "explanation": "Civil society, common sense, and organic intellectuals all belong to the register Gramsci distinguished from naked coercion: schools, churches, unions, and the media are where a class's worldview gets diffused and normalized as everyone's shared common sense, with organic intellectuals doing the actual work of articulating and spreading it. None of this requires police or prisons to function -- that is precisely Gramsci's point about how consent, not force, does most of the work in a developed state.",
      "targets": [
        "civil society",
        "common sense",
        "organic intellectuals"
      ],
      "reasons": {
        "civil society": "The institutional half of the integral state that operates through culture and persuasion rather than direct coercion.",
        "common sense": "What a class's worldview becomes once it has been diffused widely enough to feel like plain, unquestionable reality.",
        "organic intellectuals": "The class-specific thinkers who do the actual work of articulating and diffusing that worldview."
      }
    },
    {
      "id": "tools-for-a-challenger",
      "prompt": "Which of these name a strategy or resource available to a class trying to build a new hegemony, not just defend an existing one?",
      "explanation": "Gramsci's vocabulary is symmetric: the same tools that build a ruling class's hegemony -- organic intellectuals doing patient cultural work, contesting the terrain of common sense -- are exactly what a rising class needs to mount a war of position and build a counter-hegemony of its own. Nothing here belongs exclusively to whoever currently holds power.",
      "targets": [
        "war of position",
        "counter-hegemony",
        "organic intellectuals"
      ],
      "reasons": {
        "counter-hegemony": "The explicit goal of that strategy: not seizing the state directly, but building an alternative worldview capable of replacing the ruling one.",
        "organic intellectuals": "The same class-specific thinkers who build any hegemony -- ruling or challenging -- by articulating a class's own worldview.",
        "war of position": "The slow, civil-society-based strategy Gramsci thought a challenger needed wherever an existing hegemony was well dug in."
      }
    }
  ],
  "clusters": [
    {
      "id": "the-integral-state",
      "name": "The Integral State",
      "color": "blue",
      "fact": "Gramsci's own formula was blunt: the state equals political society plus civil society, or hegemony protected by the armour of coercion. Political society is the narrowly coercive apparatus -- army, police, courts, prisons -- while civil society is the vast web of schools, churches, media, and unions where a class's worldview gets lived out as everyone's common sense.",
      "terms": [
        "coercion",
        "consent",
        "political society",
        "civil society"
      ],
      "seeds": [
        "coercion",
        "consent"
      ],
      "info": {
        "text": "Gramsci's expanded definition of the state as coercion and consent working together, rather than the narrower, purely coercive state other theorists describe.",
        "link": "wiki:Antonio Gramsci"
      }
    },
    {
      "id": "winning-consent",
      "name": "Winning Consent",
      "color": "amber",
      "fact": "Hegemony is what happens when a ruling class doesn't just dominate but leads: organic intellectuals -- thinkers who emerge from within a class and articulate its own outlook -- do the patient work of turning that class's particular worldview into everyone's shared common sense, aided by traditional intellectuals who present themselves as neutral even while serving the existing order.",
      "terms": [
        "common sense",
        "organic intellectuals",
        "traditional intellectuals",
        "intellectual and moral leadership"
      ],
      "seeds": [
        "common sense",
        "organic intellectuals"
      ],
      "info": {
        "text": "The cultural mechanism by which a class's own outlook becomes lived, unquestioned reality for everyone else -- Gramsci's answer to why exploited groups so often consent to their own exploitation.",
        "link": "wiki:Cultural hegemony"
      }
    },
    {
      "id": "strategies-of-struggle",
      "name": "Strategies of Struggle",
      "color": "olive",
      "fact": "Gramsci drew a strategic lesson from comparing Russia and Western Europe: where the state dominates and civil society is thin, a frontal war of maneuver can succeed, as in 1917; where civil society is dense and well organized, only a slower war of position -- a sustained struggle for ground within civil society itself -- has any chance, and an old order can absorb a challenge through passive revolution, granting just enough reform to head off deeper change.",
      "terms": [
        "war of position",
        "war of maneuver",
        "passive revolution"
      ],
      "seeds": [
        "war of position",
        "war of maneuver"
      ],
      "info": {
        "text": "Gramsci's strategic vocabulary for how political struggle actually has to be fought, depending on how developed a society's civil society already is.",
        "link": "wiki:Prison Notebooks"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-diffusion",
      "term": "diffusion",
      "clusters": [
        0,
        1
      ],
      "fact": "Civil society is the terrain where consent actually gets manufactured: organic intellectuals do the work of diffusing a class's outlook until it no longer feels like anyone's particular interest, but simply everyone's common sense.",
      "relationKind": "dynamic",
      "idealTerms": [
        "civil society",
        "common sense"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-terrain",
      "term": "terrain",
      "clusters": [
        0,
        2
      ],
      "fact": "Which strategy makes sense depends on the very balance the integral state describes: where political society dominates and civil society is thin, a frontal war of maneuver can work, but where civil society is dense and well-organized, only the slower war of position -- fighting for ground within civil society itself -- has any real chance.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-counter-hegemony",
      "term": "counter-hegemony",
      "clusters": [
        1,
        2
      ],
      "fact": "A war of position is fought with exactly the tools hegemony itself relies on: a rising class builds its own organic intellectuals and contests the terrain of common sense directly, aiming to build a counter-hegemony rather than simply seizing the machinery of the state.",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "organic intellectuals",
        "war of position"
      ]
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
