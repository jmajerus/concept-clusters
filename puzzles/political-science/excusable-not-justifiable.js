// Generated from content/puzzles/excusable-not-justifiable.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "excusable-not-justifiable",
  "title": "Excusable, Not Justifiable",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Philosophy"
  ],
  "tags": [
    "just war theory",
    "ethics"
  ],
  "info": {
    "text": "From Augustine's grief-stricken permission through Aquinas's threefold test to Michael Walzer's modern reckoning with dirty hands — the tradition that decides when a war may be fought, and why even a rightly fought one is never quite justified.",
    "link": "wiki:Just war theory"
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "moral-disengagement-and-moral-inversion",
        "reason": "See the same move from justification to mere excuse enacted at the level of individual conscience, rather than doctrine."
      },
      {
        "id": "on-killing",
        "reason": "Grossman's research on the psychological cost of killing shows, from the inside, exactly what this doctrine's excuse is excusing."
      }
    ]
  },
  "lenses": [
    {
      "id": "constraint-or-permission",
      "prompt": "Which of these concepts function as a constraint on how or whether war is fought, rather than as grounds that permit it?",
      "explanation": "Just cause and sovereign authority establish who may fight and for what — they grant permission. Right intention rules out the wrong motives for exercising that permission; Aquinas's own caution that the criteria are necessary but not sufficient refuses to let the checklist become a green light; and discrimination and proportionality limit what force may do once fighting has begun. None of the four expands what war is allowed to accomplish — each only narrows it.",
      "targets": [
        "right intention",
        "necessary, not sufficient",
        "discrimination (noncombatant immunity)",
        "proportionality"
      ],
      "reasons": {
        "necessary, not sufficient": "Aquinas's own caution against treating the three conditions as a green light rather than a floor.",
        "right intention": "It doesn't grant permission to fight; it restricts why one may fight, ruling out hatred or domination as motives."
      }
    },
    {
      "id": "the-excuse-side",
      "prompt": "Which concepts sit on the excuse side of the justification/excuse divide, marking a wrong that is conceded and only mitigated, rather than denied outright?",
      "explanation": "A justification claims an act was never wrong at all. Each of these instead marks a place where wrongdoing is conceded and, at best, mitigated: excuse names the category itself; moral residue is the leftover guilt a genuine justification would never produce; dirty hands is Walzer's term for a leader who did the necessary thing and remains rightly guilty for it; and supreme emergency is the crisis exception under which even the wartime rules bend — a tragic concession, not a right the doctrine grants.",
      "targets": [
        "excuse",
        "moral residue",
        "dirty hands",
        "supreme emergency"
      ],
      "reasons": {
        "supreme emergency": "Walzer frames it as an exception the rules bend under extremity, not a license the doctrine grants — the grammar of excuse, not justification."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Before You Begin: Justification, Excuse, and the Ethics of War",
    "summary": "Two defenses that both end in acquittal but mean very different things, and the two-stage, two-part history of the doctrine that decides when war is permitted.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "## Two Ways to Escape Blame\n\nTake two people who each broke a law, and neither is punished for it.\n\nThe first breaks into an empty mountain cabin during a sudden blizzard, to survive the night. Breaking and entering is a crime — but the law calls this one **justified**: given the emergency, breaking in wasn't wrong at all.\n\nThe second helps move stolen property because kidnappers are holding their child and have threatened to kill the child if they refuse. The act itself stays a crime — the law doesn't pretend otherwise — but the law calls the second person's conduct **excused**: wrong, but not something they can fairly be blamed for, given what they faced.\n\nA justification says: *this was the right thing to do.* An excuse says: *this was wrong, but understandable, given the circumstances.*\n\nThis puzzle asks which category war belongs in — even a war fought by every rule the tradition has ever laid down.\n\n## A Doctrine Built in Two Stages, Then Split in Two Halves\n\nFor over a thousand years, thinkers in the Christian West wrestled with a hard question: can a tradition built on loving one's enemies ever permit killing them? An early answer treated war as a terrible last resort — never something to celebrate, only something to grieve, undertaken reluctantly and aimed at nothing but restoring the peace it disturbed.\n\nA few centuries later, a more systematic thinker took that reluctant, case-by-case wisdom and turned it into something closer to a checklist: explicit conditions that had to be satisfied before a war could even be considered permissible. That systematizing move is what let \"just war\" become a *doctrine* — teachable, checkable, arguable — rather than only a private moral instinct. But satisfying a checklist to *start* a war turned out to be only half the problem.\n\nOnce fighting actually begins, a separate set of questions takes over: who may be targeted, and how much force is too much? And modern theorists — writing in the shadow of total war, terrorism, and weapons that can erase whole cities — have had to reckon with a harder question still: what happens when the survival of an entire community seems to require breaking even these wartime rules? Is there ever a case where the rules themselves admit they might bend — and if a leader bends them, what is left over, morally, once the emergency has passed?\n\n## Before You Start\n\nAs you sort these terms, keep the justification/excuse distinction from the opening in mind. Ask of each concept: does this grant *permission* to fight, or does it only *limit* how that permission may be used once granted? And by the end, ask yourself the puzzle's real question: after every criterion is satisfied and every limit observed, has a war earned the word *just* — or only the harder, more honest word *excusable*?"
    },
    "sources": [
      {
        "label": "Stanford Encyclopedia of Philosophy: The Problem of Dirty Hands",
        "href": "https://plato.stanford.edu/entries/dirty-hands/"
      },
      {
        "label": "ICRC: What are jus ad bellum and jus in bello?",
        "href": "https://www.icrc.org/en/document/what-are-jus-ad-bellum-and-jus-bello-0"
      }
    ]
  },
  "clusters": [
    {
      "id": "augustines-permission",
      "name": "Augustine's Reluctant Permission",
      "color": "teal",
      "fact": "Augustine treated war as a grief-stricken concession to a fallen world — permissible only for a just cause and waged with right intention, but never a good in itself, since its only legitimate aim was to restore the very peace it interrupted.",
      "terms": [
        "just cause",
        "right intention",
        "peace as the aim"
      ],
      "seeds": [
        "just cause",
        "right intention"
      ],
      "termInfo": {
        "just cause": {
          "text": "A wrong already suffered or credibly threatened — without it, a war has no moral standing to begin at all.",
          "link": "wiki:Just war theory"
        },
        "peace as the aim": {
          "text": "For Augustine, peace was the only legitimate object of war — even a rightly fought war is measured by whether it aims at, and ends in, the peace it disrupted."
        },
        "right intention": {
          "text": "The requirement that a warmaker be motivated by correcting the wrong and restoring peace, not by hatred, cruelty, or the pleasure of domination."
        }
      },
      "info": {
        "text": "Augustine of Hippo's early Christian argument that war, though never good in itself, could be reluctantly permitted as a response to wrongdoing.",
        "link": "wiki:Augustine of Hippo"
      }
    },
    {
      "id": "aquinas-systematizes",
      "name": "Aquinas's Threefold Test",
      "color": "olive",
      "fact": "Aquinas folded Augustine's scattered judgments into three explicit conditions in the Summa Theologica — legitimate authority, just cause, and right intention — but insisted that meeting all three made a war permissible to begin, not automatically righteous in how it was then fought.",
      "terms": [
        "sovereign authority",
        "the Summa Theologica",
        "necessary, not sufficient"
      ],
      "seeds": [
        "sovereign authority",
        "the Summa Theologica"
      ],
      "termInfo": {
        "necessary, not sufficient": {
          "text": "Aquinas's own caution: satisfying all three conditions makes a war permissible to begin — not automatically righteous in how it then unfolds."
        },
        "sovereign authority": {
          "text": "Aquinas's addition that only a legitimate public ruler, not a private person, may declare war — the criterion that distinguishes war from private vengeance."
        },
        "the Summa Theologica": {
          "text": "Aquinas's systematic work of theology; its brief treatment of war became the classical statement of the doctrine.",
          "link": "wiki:Summa Theologica"
        }
      },
      "info": {
        "text": "Thomas Aquinas's 13th-century systematization of just war doctrine into a checkable, three-part test.",
        "link": "wiki:Thomas Aquinas"
      }
    },
    {
      "id": "the-wartime-half",
      "name": "The Wartime Half",
      "color": "amber",
      "fact": "Even a war cleared to begin must still be fought rightly: discrimination protects those who are not combatants, and proportionality limits force to what the legitimate aim actually requires — the tradition's second, harder half, tested hardest exactly when a community's survival feels imminently threatened.",
      "terms": [
        "discrimination (noncombatant immunity)",
        "proportionality",
        "supreme emergency"
      ],
      "seeds": [
        "discrimination (noncombatant immunity)",
        "proportionality"
      ],
      "termInfo": {
        "discrimination (noncombatant immunity)": {
          "text": "The requirement to distinguish combatants from civilians and direct force only at the former.",
          "link": "wiki:Distinction (law)"
        },
        "proportionality": {
          "text": "The requirement that harm caused not be excessive relative to the military advantage it secures.",
          "link": "wiki:Proportionality (International Humanitarian Law)"
        },
        "supreme emergency": {
          "text": "Michael Walzer's term for the rare crisis in which a community's survival is so imminently threatened that even these wartime limits come under pressure to bend.",
          "link": "wiki:Supreme emergency"
        }
      },
      "info": {
        "text": "Jus in bello, the branch of just war doctrine governing conduct once a war is already underway, distinct from whether it may be fought at all.",
        "link": "wiki:Jus in bello"
      }
    },
    {
      "id": "the-ethics-of-excuse",
      "name": "The Ethics of Excuse",
      "color": "magenta",
      "fact": "A justification claims an act was never wrong; an excuse concedes the act stays wrong but holds the actor less blameworthy for committing it under the circumstances that forced their hand — and on this reading, no war, however carefully fought, ever graduates out of the second category into the first.",
      "terms": [
        "justification",
        "excuse",
        "moral residue"
      ],
      "seeds": [
        "justification",
        "excuse"
      ],
      "termInfo": {
        "excuse": {
          "text": "A defense holding that an act remains wrong, but the actor is less blameworthy for committing it given the circumstances that forced their hand.",
          "link": "wiki:Excuse"
        },
        "justification": {
          "text": "A defense holding that an act, though normally wrong, was actually permissible given the circumstances — the actor did nothing wrong at all.",
          "link": "wiki:Justification (jurisprudence)"
        },
        "moral residue": {
          "text": "The leftover sense of guilt or loss that persists even after the best available choice was made — the tell that marks an excuse rather than a justification, since a true justification would leave nothing to regret."
        }
      },
      "info": {
        "text": "The distinction, drawn from moral and legal theory, between an act that was rightly done and an act that was wrongly done but forgivably so.",
        "link": "wiki:Justification and excuse"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-sorrowful-duty",
      "term": "sorrowful duty",
      "clusters": [
        0,
        3
      ],
      "fact": "Augustine already described a justly waged war in the language of grief and reluctant duty rather than triumph or right — the vocabulary the ethics-of-excuse reading picks up on directly, sixteen centuries later.",
      "relationKind": "continuity",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "bridge-jus-in-bello",
      "term": "jus in bello",
      "clusters": [
        1,
        2
      ],
      "fact": "Aquinas's threefold test asks only whether a war may be fought at all; jus in bello, developed out of that same premise by later scholastics and modern theorists, asks how, once underway, it may be fought.",
      "relationKind": "foundation",
      "info": {
        "link": "wiki:Jus in bello"
      }
    },
    {
      "id": "bridge-dirty-hands",
      "term": "dirty hands",
      "clusters": [
        2,
        3
      ],
      "fact": "When a 'supreme emergency' forces a leader to override the wartime limits, Walzer's dirty-hands problem names the guilt that remains — exactly the moral residue the ethics-of-excuse framework insists a genuine justification could never leave behind.",
      "relationKind": "dynamic",
      "info": {
        "text": "Michael Walzer's account of the political leader who does the necessary wrong thing and remains rightly guilty for having done it.",
        "link": "wiki:Problem of dirty hands"
      },
      "idealTerms": [
        "supreme emergency",
        "moral residue"
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
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-13"
    },
    {
      "system": "Claude",
      "scope": "learningIntroduction",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-13"
    }
  ]
});
