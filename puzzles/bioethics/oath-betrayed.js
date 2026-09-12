// Generated from content/puzzles/oath-betrayed.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "oath-betrayed",
  "title": "Oath Betrayed",
  "category": "bioethics",
  "categories": [
    "bioethics",
    "political-science"
  ],
  "tags": [
    "book"
  ],
  "info": {
    "text": "How a decades-old, unambiguous written prohibition on physician participation in torture went unenforced when CIA-affiliated physicians monitored detainees' responses to calibrate interrogation technique — and why medicine's failure looks structurally different from psychology's.",
    "citations": [
      {
        "title": "Oath Betrayed: America's Torture Doctors",
        "author": "Miles, Steven H.",
        "publisher": "University of California Press",
        "year": "2009"
      },
      {
        "title": "Experiments in Torture: Evidence of Human Subject Research and Experimentation in the 'Enhanced' Interrogation Program",
        "author": "Physicians for Human Rights",
        "year": "2010",
        "url": "https://phr.org/our-work/resources/experiments-in-torture/"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-written-line",
      "name": "The Written Line",
      "color": "teal",
      "fact": "Medicine entered the war-on-terror interrogation context with a written, pre-existing, unambiguous prohibition already in place: the 1975 World Medical Association Declaration of Tokyo barred physician participation in torture or degrading treatment regardless of victim, circumstance, or the urgency claimed by authority — and the AMA's own ethics code incorporated the same bar.",
      "terms": [
        "Declaration of Tokyo",
        "Nuremberg Code",
        "AMA Code of Ethics",
        "Prohibition on Participation"
      ],
      "seeds": [
        "Declaration of Tokyo",
        "Nuremberg Code"
      ],
      "termInfo": {
        "AMA Code of Ethics": {
          "text": "The American Medical Association's own ethics code, which incorporates the prohibition against physician participation in torture and specifically bars physicians from using their skills to facilitate interrogation in ways that harm detainees.",
          "links": [
            {
              "href": "wiki:AMA Code of Medical Ethics"
            }
          ]
        },
        "Declaration of Tokyo": {
          "text": "The 1975 World Medical Association policy barring physicians from participating in, facilitating, or being present at torture or cruel, inhuman, or degrading treatment of any prisoner or detainee — regardless of their offense, the beliefs they hold, or any motive invoked by the detaining authority.",
          "links": [
            {
              "href": "https://www.wma.net/policies-post/wma-declaration-of-tokyo-guidelines-for-physicians-concerning-torture-and-other-cruel-inhuman-or-degrading-treatment-or-punishment-in-relation-to-detention-and-imprisonment/"
            }
          ]
        },
        "Nuremberg Code": {
          "text": "The 1947 standards for ethical human experimentation established in response to Nazi medical atrocities, requiring voluntary informed consent and prohibiting research that causes suffering unnecessary for the purpose — the origin of the lineage the Declaration of Tokyo would extend.",
          "links": [
            {
              "href": "wiki:Nuremberg Code"
            }
          ]
        },
        "Prohibition on Participation": "The specific prohibition's reach: not just administering torture, but being present, facilitating, monitoring, providing medical support that enables continued treatment, or applying professional knowledge to the interrogation process."
      },
      "info": {
        "text": "The formal prohibitions on physician participation in torture and cruel, degrading, or inhuman treatment, established well before the war-on-terror interrogation program began.",
        "links": [
          {
            "href": "https://www.wma.net/policies-post/wma-declaration-of-tokyo-guidelines-for-physicians-concerning-torture-and-other-cruel-inhuman-or-degrading-treatment-or-punishment-in-relation-to-detention-and-imprisonment/"
          }
        ]
      }
    },
    {
      "id": "the-enforcement-failure",
      "name": "The Enforcement Failure",
      "color": "amber",
      "fact": "Physicians for Human Rights documented that CIA-affiliated physicians and psychologists monitored detainees' physiological responses to waterboarding and calibrated technique accordingly — a direct Nuremberg Code violation in PHR's framing, because measuring harm to refine a method is human subject research. The mechanism that should have acted on the Declaration of Tokyo's clear bar never did, partly because the relevant actors were CIA employees or contractors rather than AMA members, placing them outside the body whose code they were violating.",
      "terms": [
        "Physiological Monitoring",
        "Experiments in Torture",
        "No Enforcement Mechanism",
        "Non-Member Shield"
      ],
      "seeds": [
        "Physiological Monitoring",
        "Experiments in Torture"
      ],
      "termInfo": {
        "Experiments in Torture": {
          "text": "Physicians for Human Rights' 2010 report finding that the CIA's medical monitoring of detainees during enhanced interrogation amounted to human subject research conducted without consent — a Nuremberg Code violation — and calling for a federal investigation.",
          "links": [
            {
              "href": "https://phr.org/our-work/resources/experiments-in-torture/"
            }
          ]
        },
        "No Enforcement Mechanism": {
          "text": "Unlike a permissive or ambiguous professional code, medicine's prohibition was clear from 1975. What was absent was any mechanism with both jurisdiction and will to enforce it against CIA-affiliated practitioners — the question of who could actually discipline them was structurally unresolved.",
          "links": [
            {
              "href": "wiki:Physicians for Human Rights"
            }
          ]
        },
        "Non-Member Shield": {
          "text": "CIA physicians and contracted psychologists were not necessarily AMA members, placing them outside the organization whose code prohibited their conduct — a professional accountability gap that made formal discipline unavailable through the most obvious channel.",
          "links": [
            {
              "href": "wiki:American Medical Association"
            }
          ]
        },
        "Physiological Monitoring": {
          "text": "CIA physicians and psychologists monitoring detainees' physical responses to waterboarding — tracking pulse, blood oxygen, and distress markers — to determine when a session should stop and how technique might be adjusted. PHR frames this as measuring the effects of harm to optimize a method, which meets the definition of human subject research.",
          "links": [
            {
              "href": "https://phr.org/our-work/resources/experiments-in-torture/"
            }
          ]
        }
      },
      "info": {
        "text": "The gap between a written prohibition and a functioning enforcement mechanism — and how the specific structural features of CIA-affiliated medical practice made accountability unavailable through normal professional channels.",
        "links": [
          {
            "href": "https://phr.org/our-work/resources/experiments-in-torture/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "calibration-as-research",
      "term": "calibration as research",
      "clusters": [
        0,
        1
      ],
      "fact": "Monitoring a detainee's physiological responses to refine an interrogation method is not passive medical oversight — it is using professional knowledge to optimize harm, which PHR identifies as the specific act that makes physician participation a Nuremberg Code violation, not merely a Declaration of Tokyo violation.",
      "info": "The framing PHR uses to connect active physiological monitoring to the Nuremberg Code: measuring harm to adjust technique crosses from participation into human subject research.",
      "termRole": "connector",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "unambiguous-before-the-fact",
      "prompt": "Which concepts were part of a clear, written prohibition in place before 2001?",
      "explanation": "All three were established before any war-on-terror interrogation began — the Declaration of Tokyo in 1975, the Nuremberg Code in 1947, the AMA's own code incorporating the same prohibition years earlier. This is medicine's structural difference from psychology: the rule existed, was unambiguous, and needed no post-hoc construction. The question was never what the code said — it was who would enforce it and against whom.",
      "targets": [
        "Declaration of Tokyo",
        "Nuremberg Code",
        "AMA Code of Ethics"
      ],
      "reasons": {
        "AMA Code of Ethics": "The AMA's own code incorporated the same prohibition independently of the WMA, giving medicine two written bars, not one.",
        "Declaration of Tokyo": "Issued in 1975, it predates the war on terror by twenty-six years and left no ambiguity about presence, facilitation, or monitoring.",
        "Nuremberg Code": "Established in 1947 in direct response to Nazi medical experimentation, it is the founding document of the lineage the Declaration of Tokyo extends."
      }
    },
    {
      "id": "jurisdiction-gap",
      "prompt": "Which concepts identify a structural reason why normal professional accountability could not reach the physicians who violated the prohibition?",
      "explanation": "The prohibition was clear; what was absent was any enforcement body with both jurisdiction and will. The non-member technicality meant the most obvious channel — AMA discipline — was procedurally unavailable. And because calibration-as-research went unacknowledged as such, even Nuremberg-based research ethics oversight was never invoked.",
      "targets": [
        "No Enforcement Mechanism",
        "Non-Member Shield",
        "calibration as research"
      ],
      "reasons": {
        "No Enforcement Mechanism": "A clear prohibition without an enforcement body with jurisdiction is not a functioning prohibition — it names a wrong without a mechanism to sanction it.",
        "Non-Member Shield": "The AMA cannot discipline physicians who are not members; CIA-affiliated practitioners fell outside that jurisdiction by structure, not accident.",
        "calibration as research": "Framing active monitoring as passive medical oversight kept it outside the research ethics review process that the Nuremberg Code's lineage requires."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "safe-legal-ethical-effective",
        "reason": "Compare medicine's problem — a clear rule with no enforcement — against psychology's: a captured rule-making process that rewrote the standard before enforcement could ever be needed.",
        "via": [
          "No Enforcement Mechanism",
          "Physiological Monitoring"
        ]
      },
      {
        "id": "golden-shields",
        "reason": "The legal machinery that authorized the interrogation program created the context in which both psychology's captured ethics and medicine's unenforced prohibition operated.",
        "via": [
          "Physiological Monitoring",
          "calibration as research"
        ]
      },
      {
        "id": "the-nazi-doctors",
        "reason": "The Nuremberg Code exists because of what the Nazi doctors did — the same lineage medicine's written prohibition belongs to.",
        "via": [
          "Nuremberg Code"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Before You Begin: The Rule That Was Never Unclear",
    "summary": "Context on how medicine's professional prohibition on participating in torture differs structurally from psychology's experience with the same interrogation program.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "## The rule medicine already had\r\n\r\nIn 1975 — long before any post-9/11 interrogation debate — the World Medical Association issued the Declaration of Tokyo: physicians may not participate in, facilitate, or be present at torture or cruel, degrading, or inhuman treatment of any prisoner, regardless of the offense alleged or the urgency claimed by the detaining authority. The American Medical Association's own ethics code said the same thing.\r\n\r\nThis prohibition was not ambiguous, not contested, and not new when the war on terror began. Medicine's failure in the CIA interrogation program was therefore a different kind of failure than psychology's: not a captured rule-making process, not an ethics code quietly rewritten — but an unambiguous written bar, and nobody enforced it.\r\n\r\nIn 2010, Physicians for Human Rights documented what CIA-affiliated physicians had actually done: monitored detainees' physiological responses to waterboarding to determine when to stop and how to adjust technique. PHR's framing was precise — this is not passive medical presence, it is using professional knowledge to optimize harm, which is human subject research conducted without consent and without ethical review. PHR called it a Nuremberg Code violation.\r\n\r\nThe Nuremberg Code exists because of what physicians did in Nazi concentration camps. The Declaration of Tokyo is part of that same lineage of international medicine trying to bind itself against repetition.\r\n\r\n**Before you start:** if a prohibition is clear, pre-existing, and violated — what does it mean that no one was disciplined?"
    },
    "links": [
      {
        "href": "https://phr.org/our-work/resources/experiments-in-torture/",
        "label": "PHR: Experiments in Torture (2010 report)"
      },
      {
        "href": "https://www.wma.net/policies-post/wma-declaration-of-tokyo-guidelines-for-physicians-concerning-torture-and-other-cruel-inhuman-or-degrading-treatment-or-punishment-in-relation-to-detention-and-imprisonment/",
        "label": "World Medical Association: Declaration of Tokyo"
      }
    ],
    "revision": 1
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Sonnet 4.6)",
        "model": "Claude Sonnet 4.6",
        "reasoning": "high"
      }
    ]
  }
});
