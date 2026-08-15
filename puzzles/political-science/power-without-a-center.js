// Generated from content/puzzles/power-without-a-center.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "power-without-a-center",
  "title": "Power Without a Center",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Philosophy"
  ],
  "subcategories": {
    "Philosophy": "political-philosophy"
  },
  "info": {
    "text": "Michel Foucault's account of power as a decentered, productive network rather than a possession held by a sovereign, a class, or a state -- and of resistance as sharing that same dispersed, centerless shape.",
    "link": "wiki:Michel Foucault"
  },
  "lenses": [
    {
      "id": "decentered-by-design",
      "prompt": "Which of these describe something with no single center or locus, distributed instead across a dispersed network?",
      "explanation": "A net-like organization and capillary power both describe power's own lack of any single seat -- it does not radiate down from one point but reaches, thread-like, into the smallest interactions everywhere at once. No single locus of revolt says the same thing about resistance: exactly because power has this shape, nothing that opposes it can be gathered into one place either.",
      "targets": [
        "a net-like organization",
        "no single locus of revolt",
        "capillary power"
      ],
      "reasons": {
        "a net-like organization": "Power's own shape: threads reaching everywhere rather than radiating from one point.",
        "capillary power": "The fine-grained reach that follows from having no single center: power gets everywhere because it starts nowhere in particular.",
        "no single locus of revolt": "The same absence of a center, applied to resistance instead of power."
      }
    },
    {
      "id": "what-power-generates",
      "prompt": "Which of these describe something power actively creates, rather than something it simply prohibits or takes away?",
      "explanation": "Productive power and regimes of truth both name something power builds rather than merely forbids: it does not just say no, it manufactures the accepted categories, identities, and truths a society lives by. Capillary power names the reach that makes this possible -- productive power is not a single factory turning out truths from above, it is generated at the smallest, most local points throughout the whole network.",
      "targets": [
        "productive power",
        "regimes of truth",
        "capillary power"
      ],
      "reasons": {
        "capillary power": "The local, small-scale reach through which productive power is actually generated, rather than imposed from above.",
        "productive power": "The core claim: power's main business is manufacturing categories, identities, and truths, not just forbidding things.",
        "regimes of truth": "What productive power actually generates: the accepted, sayable truths a given society lives by."
      }
    }
  ],
  "clusters": [
    {
      "id": "not-a-possession",
      "name": "Not a Possession",
      "color": "teal",
      "fact": "Foucault flatly rejects a whole tradition of thinking about power as a possession -- something a sovereign, a class, or a state simply holds, appropriates, or transfers like a piece of wealth. Power is instead exercised through a net-like organization with no single center, reaching capillary-style into the smallest interactions rather than radiating down from one sovereign point.",
      "terms": [
        "exercised, not possessed",
        "no single center",
        "a net-like organization",
        "capillary power"
      ],
      "seeds": [
        "exercised, not possessed",
        "no single center"
      ],
      "info": {
        "text": "Foucault's rejection of power as a possession held by a sovereign, class, or state -- power instead functions as a decentered network with no single point of origin.",
        "link": "wiki:The History of Sexuality"
      }
    },
    {
      "id": "power-produces",
      "name": "Power Produces",
      "color": "magenta",
      "fact": "Foucault's second major break: power is not fundamentally repressive, a force that only says no. It produces -- it produces knowledge, identities, and the very categories through which people understand themselves, which is exactly what his coinage power/knowledge is meant to capture: the two are not opposed, they constitute each other, generating the regimes of truth and discourse that decide what even counts as a sayable, knowable claim in the first place.",
      "terms": [
        "productive power",
        "power/knowledge",
        "regimes of truth",
        "discourse"
      ],
      "seeds": [
        "productive power",
        "power/knowledge"
      ],
      "info": {
        "text": "Foucault's argument that power is productive rather than purely repressive: it generates knowledge, identities, and the accepted categories of truth, rather than only prohibiting or forbidding.",
        "link": "wiki:The History of Sexuality"
      }
    },
    {
      "id": "resistance-without-a-center",
      "name": "Resistance Without a Center",
      "color": "cyan",
      "fact": "Resistance gets the same treatment as power itself: Foucault insists that wherever there is power, there is resistance, and that this resistance is never external to power but its constant, odd term -- not one organized opposition (there is, he says, no single locus of great Refusal) but a swarm of mobile, plural points of resistance scattered through the same net-like field power itself occupies.",
      "terms": [
        "points of resistance",
        "coextensive with power",
        "no single locus of revolt",
        "the odd term"
      ],
      "seeds": [
        "points of resistance",
        "coextensive with power"
      ],
      "info": {
        "text": "Foucault's claim that resistance shares power's own decentered structure: never a single organized opposition, but a plurality of mobile points scattered throughout the same network power occupies.",
        "link": "wiki:The History of Sexuality"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-same-shape",
      "term": "the same shape",
      "clusters": [
        0,
        2
      ],
      "fact": "Foucault gives resistance the exact same structure he gives power: just as power has no single center but forms a dense net, the many points of resistance scattered through that net form an equally decentered, dispersed pattern -- there is no more a single seat of resistance than there is a single seat of power.",
      "relationKind": "cross-cutting",
      "termRole": "connector",
      "idealTerms": [
        "no single center",
        "no single locus of revolt"
      ],
      "info": {
        "text": "Foucault gives resistance the exact same structure he gives power: no single center, but a dense, dispersed net of many points."
      }
    },
    {
      "id": "bridge-immanent",
      "term": "immanent",
      "clusters": [
        0,
        1
      ],
      "fact": "Power's productiveness and its lack of any single center are the same fact seen from two angles: because power is not a possession radiating from one point, it has to work by being immanent in the ordinary relationships -- knowledge, discourse, the professions, the family -- that it also, in the same move, actively produces.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-strategic-codification",
      "term": "strategic codification",
      "clusters": [
        1,
        2
      ],
      "fact": "Discourse and resistance turn out to be the same kind of material for Foucault: just as a regime of truth is assembled from many small, locally produced claims rather than handed down whole, a revolution becomes possible only through what he calls the strategic codification of many small, dispersed points of resistance into something coordinated.",
      "relationKind": "cross-cutting",
      "termRole": "connector",
      "idealTerms": [
        "discourse",
        "points of resistance"
      ],
      "info": {
        "text": "Foucault's term for how a revolution becomes possible: assembling many small, dispersed points of resistance into something coordinated, the same way a regime of truth is built from many small claims."
      }
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
