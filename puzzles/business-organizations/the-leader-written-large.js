// Generated from content/puzzles/the-leader-written-large.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-leader-written-large",
  "title": "The Leader Written Large",
  "category": "Business & Organizations",
  "categories": [
    "Business & Organizations",
    "Psychology"
  ],
  "large": true,
  "tags": [
    "book"
  ],
  "info": {
    "citations": [
      {
        "author": "Manfred F. R. Kets de Vries and Danny Miller",
        "publisher": "Jossey-Bass",
        "title": "The Neurotic Organization: Diagnosing and Changing Counterproductive Styles of Management",
        "year": "1984"
      }
    ],
    "link": "wiki:Manfred F.R. Kets de Vries",
    "text": "Kets de Vries and Miller's claim that a company's whole structure and culture can come to mirror the neurotic style of the small group of executives, often just one person, running it -- four of the five styles they identified are on this board; the fifth, schizoid, is not."
  },
  "lenses": [
    {
      "explanation": "Kets de Vries and Miller's whole argument depends on there being two levels here, not one: a personal trait in the person at the top, and a structural feature of the whole organization that mirrors it. These four are the personal traits; the rest of the board is what happens to a company once that trait sits at the top of it long enough.",
      "id": "the-leaders-own-mind",
      "prompt": "Which concepts describe the leader's own personality, rather than a structural feature of the organization built around it?",
      "reasons": {
        "need for admiration": "The dramatic leader's own disposition, prior to any centralization of authority built around it.",
        "passivity": "The depressive leader's own disposition, prior to any bureaucratic inertia that comes to match it.",
        "perfectionism": "The compulsive leader's own disposition, prior to any procedure built to enforce it.",
        "suspicion": "The paranoid leader's own disposition, prior to any information system built to justify it."
      },
      "targets": [
        "suspicion",
        "perfectionism",
        "need for admiration",
        "passivity"
      ]
    },
    {
      "explanation": "Each of these is the organizational-level answer to the personal trait in the previous round: centralized control channels the paranoid leader's need to know everything before it happens; ritualized procedure channels the compulsive leader's need to eliminate deviation; overcentralization channels the dramatic leader's need to be the one everyone looks to; and bureaucratic inertia is what's left once the depressive leader's own energy for initiative has already gone. The company builds a structure to carry what one person's psychology can't carry alone.",
      "id": "structure-as-defense",
      "prompt": "Which concepts are structural features of the whole organization that channel the leader's personal trait, rather than the trait itself?",
      "reasons": {
        "bureaucratic inertia": "What continues operating once the depressive leader's own initiative is already gone.",
        "centralized control": "The paranoid leader's vigilance, built into the org chart so it doesn't rest on one person's attention alone.",
        "overcentralization": "The dramatic leader's need to be central, built into how authority is actually distributed.",
        "ritualized procedure": "The compulsive leader's perfectionism, built into procedure so deviation is caught structurally."
      },
      "targets": [
        "centralized control",
        "ritualized procedure",
        "overcentralization",
        "bureaucratic inertia"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-paranoid",
      "name": "The Paranoid Organization",
      "color": "teal",
      "fact": "In the paranoid organization, a suspicious, mistrustful leader who scans constantly for hidden threats and enemies shapes a whole culture in his image: power concentrates at the top so nothing can happen without the leader's awareness, and elaborate information systems exist less to inform strategy than to confirm the leader's hypervigilance was justified all along.",
      "terms": [
        "suspicion",
        "hypervigilance",
        "centralized control",
        "information systems"
      ],
      "seeds": [
        "suspicion",
        "centralized control"
      ],
      "termInfo": {
        "hypervigilance": "Constant scanning for hidden threats, whether or not real evidence of one exists -- the trait the paranoid leader's information systems exist to serve.",
        "information systems": "Elaborate monitoring and reporting structures that function less to inform decisions than to confirm the suspicions that motivated building them in the first place."
      },
      "info": {
        "text": "One of five neurotic organizational styles Kets de Vries and Miller identified, each traced to a corresponding personality pattern in the leader running the firm."
      }
    },
    {
      "id": "cluster-compulsive",
      "name": "The Compulsive Organization",
      "color": "amber",
      "fact": "The compulsive organization mirrors a leader's perfectionism and need for total control: elaborate formal procedures and ritualized evaluation exist to eliminate any outcome the leader hasn't already anticipated, hierarchy hardens into whatever the org chart literally says rather than how work actually gets done, and a fixation on internal order produces tunnel vision toward what's changing outside.",
      "terms": [
        "perfectionism",
        "ritualized procedure",
        "rigid hierarchy",
        "tunnel vision"
      ],
      "seeds": [
        "perfectionism",
        "rigid hierarchy"
      ],
      "termInfo": {
        "ritualized procedure": "Formal evaluation and process followed so exactly that adherence itself, not the outcome, becomes the measure of success.",
        "tunnel vision": "A fixation on internal order and control so consuming that changes in the world outside the organization go unnoticed until they can no longer be ignored."
      },
      "info": {
        "text": "One of five neurotic organizational styles Kets de Vries and Miller identified, each traced to a corresponding personality pattern in the leader running the firm."
      }
    },
    {
      "id": "cluster-dramatic",
      "name": "The Dramatic Organization",
      "color": "magenta",
      "fact": "The dramatic organization forms around a leader whose need for admiration and taste for bold, impulsive risk-taking becomes the organization's whole operating style: authority overcentralizes in a single charismatic figure, and the firm expands in dramatic, unplanned leaps driven more by the leader's appetite for the next big move than by careful analysis.",
      "terms": [
        "need for admiration",
        "impulsive risk-taking",
        "overcentralization",
        "unplanned expansion"
      ],
      "seeds": [
        "need for admiration",
        "impulsive risk-taking"
      ],
      "termInfo": {
        "overcentralization": "Authority collapsed almost entirely into one charismatic figure, leaving the organization structurally dependent on that person's continued presence and energy.",
        "unplanned expansion": "Growth pursued in dramatic leaps driven by a leader's appetite for the next bold move, ahead of the analysis that would normally justify it."
      },
      "info": {
        "text": "One of five neurotic organizational styles Kets de Vries and Miller identified, each traced to a corresponding personality pattern in the leader running the firm."
      }
    },
    {
      "id": "cluster-depressive",
      "name": "The Depressive Organization",
      "color": "blue",
      "fact": "The depressive organization, often left in the wake of a departed founder or dominant leader, settles into passivity and a pervasive loss of confidence: initiative gives way to bureaucratic inertia, and the firm turns insular, more concerned with avoiding further failure than pursuing anything new.",
      "terms": [
        "passivity",
        "loss of confidence",
        "bureaucratic inertia",
        "insularity"
      ],
      "seeds": [
        "passivity",
        "bureaucratic inertia"
      ],
      "termInfo": {
        "insularity": "A turn inward, away from customers, competitors, and any outside source of new direction, in favor of the organization's own familiar and unthreatening routines.",
        "loss of confidence": "A pervasive sense that initiative isn't worth the risk of further failure, which becomes self-fulfilling as it spreads from the leader through the rest of the firm."
      },
      "info": {
        "text": "One of five neurotic organizational styles Kets de Vries and Miller identified, each traced to a corresponding personality pattern in the leader running the firm."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-control",
      "term": "control",
      "clusters": [
        0,
        1
      ],
      "fact": "Both styles produce elaborate control systems, but for different reasons: the paranoid leader needs to detect threats before they strike, while the compulsive leader needs to eliminate any outcome that deviates from a predetermined standard of perfection. Watching for danger and demanding perfection produce nearly identical org charts out of very different fears.",
      "relationKind": "cross-cutting",
      "info": {
        "text": "Heavy organizational control, built for two very different underlying reasons."
      },
      "idealTerms": [
        "hypervigilance",
        "perfectionism"
      ]
    },
    {
      "id": "bridge-impulse",
      "term": "impulse",
      "clusters": [
        1,
        2
      ],
      "fact": "These two styles sit at opposite poles of the same axis: the compulsive organization exists to suppress and channel impulse into predictable procedure, while the dramatic organization exists to act on impulse immediately, with barely any procedure standing between the leader's appetite and the organization's next move.",
      "relationKind": "contrast",
      "info": {
        "text": "What each style does with impulse -- suppress it into procedure, or act on it immediately."
      },
      "idealTerms": [
        "ritualized procedure",
        "impulsive risk-taking"
      ]
    },
    {
      "id": "bridge-energy",
      "term": "energy",
      "clusters": [
        2,
        3
      ],
      "fact": "The dramatic organization's hyperactive energy is rarely sustainable, and depends entirely on one person supplying it. When a dramatic founder leaves, burns out, or is finally removed, the vacuum left behind often settles into exactly the depressive organization's passivity and loss of confidence -- one style's excess becoming the precondition for the other's collapse.",
      "relationKind": "dynamic",
      "info": {
        "text": "How one style's unsustainable excess becomes the precondition for the next style's collapse."
      },
      "idealTerms": [
        "unplanned expansion",
        "loss of confidence"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
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
