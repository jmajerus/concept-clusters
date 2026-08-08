// Generated from content/puzzles/the-uses-of-hierarchy.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-uses-of-hierarchy",
  "title": "The Uses of Hierarchy",
  "category": "Business & Organizations",
  "categories": [
    "Business & Organizations",
    "Philosophy & Social Science"
  ],
  "tags": [
    "book"
  ],
  "info": {
    "link": "wiki:Elliott Jaques",
    "text": "Elliott Jaques's two-part, self-contradicting account of organizational hierarchy: an unconscious defence against primitive anxiety in his early work, and a rational allocation of authority to task complexity in his later work -- which he came to insist was the whole explanation."
  },
  "lenses": [
    {
      "explanation": "Jaques treated both halves of his career as evidence for a similar underlying claim: people carry accurate registrations of their situation that run ahead of any formal account of it -- dread they can't fully name in the 1955 paper, fair pay they can't fully justify in the later one -- well before any system puts a label on it.",
      "id": "unconscious-sense",
      "prompt": "Which concepts describe something people register accurately without being able to explain how they know it?",
      "reasons": {
        "depressive anxiety": "Felt long before anyone names its institutional source.",
        "felt-fair pay": "Jaques found employees could rank pay fairness accurately by intuition alone, without being told the underlying formula.",
        "persecutory anxiety": "Felt long before anyone names its institutional source."
      },
      "targets": [
        "persecutory anxiety",
        "depressive anxiety",
        "felt-fair pay"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-social-defence",
      "name": "Social Defence",
      "color": "teal",
      "fact": "In 1955, Jaques argued that institutions do double duty: alongside their stated task, members unconsciously use them to manage primitive anxiety inherited from early psychic life -- splitting the world into good and bad, and projecting the unbearable parts of themselves into roles, rituals, and structures, so that persecutory anxiety (fear of attack) and depressive anxiety (fear of one's own destructiveness) become collective problems instead of private ones.",
      "terms": [
        "persecutory anxiety",
        "depressive anxiety",
        "splitting",
        "projection",
        "institutionalized ritual"
      ],
      "seeds": [
        "splitting",
        "projection"
      ],
      "termInfo": {
        "depressive anxiety": "The Kleinian fear that one's own aggression has damaged, or will damage, someone one also loves and depends on -- distinct from persecutory anxiety's fear of being attacked.",
        "institutionalized ritual": "A routine, procedure, or fixed way of doing a task that persists because it manages anxiety, whether or not it's the most efficient way to get the task done.",
        "persecutory anxiety": "The Kleinian fear of attack from a bad, threatening object -- in Jaques's application, a dread institutions can structure themselves to absorb on their members' behalf."
      },
      "info": {
        "citations": [
          {
            "author": "Elliott Jaques",
            "pages": "478-498",
            "publisher": "In M. Klein, P. Heimann, and R. Money-Kyrle (eds.), New Directions in Psycho-Analysis, Tavistock Publications",
            "title": "Social Systems as a Defence against Persecutory and Depressive Anxiety",
            "year": "1955"
          }
        ],
        "text": "The claim, argued in 1955 and later renounced by its own author, that institutions unconsciously help their members manage primitive anxiety."
      }
    },
    {
      "id": "cluster-requisite-hierarchy",
      "name": "Requisite Hierarchy",
      "color": "amber",
      "fact": "Decades later, Jaques argued the same hierarchy could be built on an entirely rational footing: matching each level of authority to the actual complexity of the work -- measurable, he claimed, by the longest span of time a person operates on their own judgment before a superior can assess the outcome -- and to accountability that actually matches the authority granted. Get the number of levels right, he found, and pay that people intuitively feel is fair follows almost automatically.",
      "terms": [
        "felt-fair pay",
        "levels of work complexity",
        "time-span of discretion",
        "matched authority and accountability",
        "manager-once-removed"
      ],
      "seeds": [
        "felt-fair pay",
        "levels of work complexity"
      ],
      "termInfo": {
        "manager-once-removed": "A manager's own manager, assigned a specific check on that manager's hiring, promotion, and assessment decisions -- a second, more distant judgment meant to counteract any one manager's bias.",
        "matched authority and accountability": "Jaques's requirement that a role's formal authority and the accountability it's held to be set at the same level -- holding someone accountable for outcomes they lack the authority to control produces mistrust rather than performance, in his account.",
        "time-span of discretion": "The longest period a role-holder works on their own judgment before a superior can assess whether the outcome was acceptable -- Jaques's proposed objective measure of how complex a role actually is."
      },
      "info": {
        "citations": [
          {
            "author": "Elliott Jaques",
            "publisher": "Cason Hall & Co.",
            "title": "Requisite Organization: The CEO's Guide to Creative Structure and Leadership",
            "year": "1989"
          }
        ],
        "link": "wiki:Requisite organization",
        "text": "Jaques's later claim that the number of hierarchical levels an organization needs is an objective, measurable fact about the complexity of its work, not a matter of taste or tradition."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-hierarchy",
      "term": "hierarchy",
      "clusters": [
        0,
        1
      ],
      "fact": "Jaques didn't just leave these two accounts in tension -- he later renounced the first one outright, arguing in 1995 that structural design fully explains what he had once attributed to unconscious defence, and that psychoanalytic readings of organizations were actively unhelpful. This board holds both claims rather than resolving them: the same hierarchy, built to his own later specification, can still be doing anxiety-management work its designer came to insist wasn't real.",
      "relationKind": "contrast",
      "info": {
        "citations": [
          {
            "author": "Elliott Jaques",
            "pages": "343-349",
            "publisher": "Human Relations, 48",
            "title": "Why the Psychoanalytic Approach to Understanding Organizations Is Dysfunctional",
            "year": "1995"
          }
        ],
        "text": "The single structure both accounts are describing -- read by early Jaques as a shared defence, and by later Jaques as a rational allocation of authority to complexity."
      },
      "idealTerms": [
        null,
        "levels of work complexity"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-08",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    },
    {
      "date": "2026-08-08",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "lenses",
      "system": "Claude"
    }
  ]
});
