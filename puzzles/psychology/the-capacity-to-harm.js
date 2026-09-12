// Generated from content/puzzles/the-capacity-to-harm.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-capacity-to-harm",
  "title": "The Capacity to Harm",
  "category": "psychology",
  "categories": [
    "psychology",
    "history-society"
  ],
  "large": true,
  "tags": [
    "war",
    "genocide"
  ],
  "info": {
    "text": "How the human capacity to commit or comply with organized violence gets built — through deliberate training, organic social pressure, seductive cultural myth, and the cognitive machinery that excuses what conscience would otherwise forbid.",
    "citations": [
      {
        "title": "On Killing: The Psychological Cost of Learning to Kill in War and Society",
        "author": "Grossman, Dave",
        "publisher": "Back Bay Books",
        "year": "1996"
      },
      {
        "title": "Ordinary Men: Reserve Police Battalion 101 and the Final Solution in Poland",
        "author": "Browning, Christopher R.",
        "publisher": "HarperCollins",
        "year": "1992"
      },
      {
        "title": "War Is a Force That Gives Us Meaning",
        "author": "Hedges, Chris",
        "publisher": "PublicAffairs",
        "year": "2002"
      },
      {
        "title": "Moral Disengagement: How People Do Harm and Live with Themselves",
        "author": "Bandura, Albert",
        "publisher": "Worth Publishers",
        "year": "2016"
      }
    ]
  },
  "clusters": [
    {
      "id": "the-engineered-override",
      "name": "The Engineered Override",
      "color": "amber",
      "fact": "Twentieth-century militaries systematically raised killing rates by replacing moral deliberation with conditioned reflex: human-shaped targets that dropped when hit drilled the firing response into the body; repeated exposure wore down the emotional cost; a legitimate chain of command supplied the authorization to fire without individual moral weighing.",
      "terms": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "target discrimination",
        "mechanical distance"
      ],
      "seeds": [
        "operant conditioning",
        "desensitization"
      ],
      "termInfo": {
        "authorization": {
          "text": "Acting against one's own resistance because a legitimate authority gave the order — the same dynamic Stanley Milgram documented: moral responsibility migrates to whoever issued the command.",
          "links": [
            {
              "href": "wiki:Milgram experiment"
            }
          ]
        },
        "desensitization": {
          "text": "A diminished emotional response to a distressing stimulus after repeated exposure to it — what replaces visceral resistance in a soldier who has drilled the killing response hundreds of times.",
          "links": [
            {
              "href": "wiki:Desensitization (psychology)"
            }
          ]
        },
        "mechanical distance": {
          "text": "A sight, screen, or intervening machine — a rifle scope, a bomber's altitude, a drone feed — that turns a person into a technical target and reduces the emotional cost of killing.",
          "links": [
            {
              "href": "wiki:Dehumanization"
            }
          ]
        },
        "operant conditioning": {
          "text": "Learning a behavior by repeatedly pairing it with a consequence until the response becomes automatic rather than deliberated — the behavioral foundation of modern military firing training.",
          "links": [
            {
              "href": "wiki:Operant conditioning"
            }
          ]
        },
        "target discrimination": {
          "text": "Training with realistic, human-shaped targets that fall when hit, so the body learns to fire on a human silhouette without conscious deliberation.",
          "links": [
            {
              "href": "wiki:Operant conditioning"
            }
          ]
        }
      },
      "info": {
        "text": "The deliberate training techniques twentieth-century militaries developed to override the historically documented human resistance to killing.",
        "links": [
          {
            "href": "wiki:Operant conditioning"
          }
        ]
      }
    },
    {
      "id": "the-organic-ratchet",
      "name": "The Organic Ratchet",
      "color": "brown",
      "fact": "Browning's finding was not that the men of Reserve Police Battalion 101 were ideologically driven or specially selected — it was that ordinary social pressure and the logic of prior participation did most of the work: once a man had not refused the first time, each subsequent time became easier, not because what was being done weighed less, but because the resistance refusing would have required had already worn down.",
      "terms": [
        "the option to refuse",
        "eroding resistance",
        "conformity to the group",
        "incremental participation",
        "escalating commitment",
        "the minority who refused"
      ],
      "seeds": [
        "the option to refuse",
        "eroding resistance"
      ],
      "termInfo": {
        "conformity to the group": {
          "text": "Pressure to match the behavior of one's comrades rather than stand out — several men later admitted they took part because they didn't want to be seen as a coward, not because they believed the killing was right.",
          "links": [
            {
              "href": "wiki:Conformity"
            }
          ]
        },
        "eroding resistance": {
          "text": "The capacity to refuse doesn't switch off all at once — it wears down with each repetition, independently of the moral weight of what's being done, which doesn't diminish the same way.",
          "links": [
            {
              "href": "wiki:Habituation"
            }
          ]
        },
        "escalating commitment": {
          "text": "The pull to keep justifying what's already been done rather than break with it — the same sunk-cost logic that makes a course of action harder to walk away from the more one has already invested in it.",
          "links": [
            {
              "href": "wiki:Escalation of commitment"
            }
          ]
        },
        "incremental participation": {
          "text": "Each act became more familiar and procedural than the last — less of a first time — as the battalion moved from a single announced order to routine, repeated actions.",
          "links": [
            {
              "href": "wiki:Foot-in-the-door technique"
            }
          ]
        },
        "the minority who refused": {
          "text": "Roughly a dozen of the nearly five hundred men present at Jozefow stepped forward when given the chance and faced no punishment — proof that the choice remained genuinely open.",
          "links": [
            {
              "href": "wiki:Reserve Police Battalion 101"
            }
          ]
        },
        "the option to refuse": {
          "text": "Major Wilhelm Trapp's explicit offer, before the battalion's first mass shooting at Jozefow, that any man who didn't feel up to the task could step out — with no threat of punishment.",
          "links": [
            {
              "href": "wiki:Reserve Police Battalion 101"
            }
          ]
        }
      },
      "info": {
        "text": "The mechanism by which repeated participation makes further participation easier — not through deliberate design, but through the organic logic of social pressure and prior commitment.",
        "links": [
          {
            "href": "wiki:Reserve Police Battalion 101"
          }
        ]
      }
    },
    {
      "id": "the-seductive-pull",
      "name": "The Seductive Pull",
      "color": "olive",
      "fact": "Hedges argues that war does not only have to be imposed — it is also chosen, because it supplies what ordinary life withholds: meaning, belonging, a cause worth dying for, and an intoxicating intensity that functions as a drug. The myth sustains the pull even when the reality is organized murder; nationalism supplies the enemy that makes the cause feel righteous.",
      "terms": [
        "war as a drug",
        "the plague of nationalism",
        "the myth of war",
        "mythmakers",
        "escape from meaninglessness"
      ],
      "seeds": [
        "war as a drug",
        "the plague of nationalism"
      ],
      "termInfo": {
        "escape from meaninglessness": "War's appeal to people who feel their ordinary lives lack purpose — refugees, the disenfranchised, and bored youth in comfortable societies alike are, in Hedges' account, all susceptible to it.",
        "mythmakers": "Hedges' list of who manufactures and sustains the myth: historians, war correspondents, filmmakers, novelists, and the state itself.",
        "the myth of war": {
          "text": "The glorifying story — glory, heroism, sacrifice — that societies construct and sustain around war, making it attractive to imagine and possible to continue.",
          "links": [
            {
              "href": "wiki:Propaganda"
            }
          ]
        },
        "the plague of nationalism": {
          "text": "Hedges' phrase for nationalism's power to unify a society around a shared struggle against a common enemy — a unity strong enough to justify almost any behavior toward that enemy.",
          "links": [
            {
              "href": "wiki:Nationalism"
            }
          ]
        },
        "war as a drug": {
          "text": "Hedges' own description of combat's rush as a potent and often lethal addiction — a substance he says he ingested himself, for years as a war correspondent.",
          "links": [
            {
              "href": "wiki:Addiction"
            }
          ]
        }
      },
      "info": {
        "text": "Hedges' account of what draws people toward war before it starts — the cultural, emotional, and political mechanisms that make organized violence feel meaningful rather than monstrous.",
        "links": [
          {
            "href": "wiki:War Is a Force That Gives Us Meaning"
          }
        ]
      }
    },
    {
      "id": "the-excusing-frame",
      "name": "The Excusing Frame",
      "color": "teal",
      "fact": "Bandura's moral disengagement framework names the cognitive moves that let people commit harmful acts without experiencing themselves as having violated their own moral standards: the harm is reframed as serving a worthy purpose, its language is sanitized, agency is relocated to authority or dispersed across participants, and the target is stripped of the human standing that would make the harm feel real.",
      "terms": [
        "moral justification",
        "dehumanization",
        "euphemistic labeling",
        "obedience defense",
        "divided agency",
        "cultural distance"
      ],
      "seeds": [
        "moral justification",
        "dehumanization"
      ],
      "termInfo": {
        "cultural distance": {
          "text": "Framing an enemy as racially, ethnically, or culturally other — making them feel less like a specific person and more like a category — which reduces the psychological cost of harming them.",
          "links": [
            {
              "href": "wiki:Dehumanization"
            }
          ]
        },
        "dehumanization": {
          "text": "Denial or diminishment of human qualities, individuality, or moral standing — what makes a target feel less like a person and more like a problem to be solved.",
          "links": [
            {
              "href": "wiki:Dehumanization"
            }
          ]
        },
        "divided agency": {
          "text": "Fragmentation of action among people or roles so that no participant experiences the whole outcome as fully their own — the diffusion of responsibility across a chain of command.",
          "links": [
            {
              "href": "wiki:Diffusion of responsibility"
            }
          ]
        },
        "euphemistic labeling": {
          "text": "Use of softened or sanitized language that reduces the apparent severity of conduct — 'neutralizing' instead of killing, 'collateral damage' instead of civilian deaths.",
          "links": [
            {
              "href": "wiki:Euphemism"
            }
          ]
        },
        "moral justification": {
          "text": "Presentation of harmful conduct as serving a worthy, necessary, defensive, or socially beneficial purpose — the reframing that makes an atrocity feel like a duty.",
          "links": [
            {
              "href": "wiki:Moral disengagement"
            }
          ]
        },
        "obedience defense": {
          "text": "A claim that compliance with authority removes or substantially replaces the actor's own responsibility to judge the action — the same displacement Milgram's experiments documented.",
          "links": [
            {
              "href": "wiki:Obedience (human behavior)"
            }
          ]
        }
      },
      "info": {
        "text": "The cognitive mechanisms Bandura identifies that let people commit harmful acts while retaining their self-image as moral beings.",
        "links": [
          {
            "href": "wiki:Moral disengagement"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "othering",
      "term": "othering",
      "clusters": [
        0,
        3
      ],
      "fact": "Both the engineered training mechanisms Grossman describes and the cognitive excusing machinery Bandura names rest on the same prior move: making the target feel less than fully human. Mechanical distance and cultural distance do it through training and perception; dehumanization and moral justification do it through cognition and language. The foundation is identical.",
      "info": {
        "text": "The process of making a person or group feel fundamentally other — less human, less real, less morally considerable — as a precondition for harming them.",
        "links": [
          {
            "href": "wiki:Othering"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "foundation"
    },
    {
      "id": "exhilaration",
      "term": "exhilaration",
      "clusters": [
        2,
        0
      ],
      "fact": "Hedges describes the intoxicating rush of combat as what draws people toward war before it begins; Grossman documents the same exhilaration as the first stage in the psychological cost sequence after a kill. The same experience functions as bait on one side of the threshold and as trap on the other — the seductive pull and the engineered override share this one emotional hinge.",
      "info": "The same intense emotional high that makes war feel meaningful before it starts and extracts its psychological cost once it is underway.",
      "termRole": "connector",
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "active-override",
      "prompt": "Which concepts describe a mechanism that works against an existing resistance — something that has to push past or wear down a prior reluctance to harm?",
      "explanation": "These concepts all share a common structure: there was resistance first, and something worked against it. Military training drills and authorizes past the instinctive reluctance Grossman documents; Browning's ratchet works through repetition and social logic rather than deliberate design. Both are override mechanisms — they assume a prior barrier and describe how it gets crossed. The seductive pull and the excusing frame work differently: one draws people toward the situation before any resistance is engaged; the other provides cognitive cover after the fact.",
      "targets": [
        "operant conditioning",
        "desensitization",
        "authorization",
        "incremental participation",
        "eroding resistance",
        "escalating commitment"
      ],
      "reasons": {
        "authorization": "Authorization works by relocating the felt need to resist — the order substitutes for the soldier's own moral judgment.",
        "desensitization": "Desensitization requires prior sensitivity — it is the process of wearing down an emotional response that was there to begin with.",
        "eroding resistance": "The mechanism is the wearing down itself — resistance doesn't disappear, it gets progressively harder to act on.",
        "escalating commitment": "Prior participation creates a sunk-cost pull that makes refusing now feel like a repudiation of everything already done.",
        "incremental participation": "Each act is a small increment past the resistance the previous act had already partially worn down.",
        "operant conditioning": "Conditioning works precisely because there is an instinctive resistance to override — the drill replaces deliberation with reflex."
      }
    },
    {
      "id": "authority-echo",
      "prompt": "Which concepts relocate moral agency away from the individual actor and onto something external — an order, a group norm, a label, or a diffused chain of command?",
      "explanation": "Grossman's authorization and Bandura's obedience defense are functionally the same move named by two different fields: moral responsibility migrates to whoever issued the command. Conformity to the group does the same thing laterally — responsibility dissolves into the behavior of the crowd. Divided agency disperses it across a chain so no one owns the whole outcome. Euphemistic labeling relocates it onto language itself, making the act feel like an administrative procedure rather than a choice. In each case the individual actor experiences themselves as responding to something external rather than deciding.",
      "targets": [
        "authorization",
        "obedience defense",
        "conformity to the group",
        "divided agency",
        "euphemistic labeling"
      ],
      "reasons": {
        "authorization": "Grossman's term for the same displacement Milgram documented: the order becomes the moral agent, and the actor becomes its instrument.",
        "conformity to the group": "Responsibility disperses laterally — if everyone is doing it, no one individual bears the full weight of the choice.",
        "divided agency": "Fragmentation across roles and participants means no one experiences the whole outcome as their own decision.",
        "euphemistic labeling": "Language does the relocating: when an act is named as a procedure, the actor's felt agency shrinks to match the administrative framing.",
        "obedience defense": "Bandura's term for the identical move: compliance with authority is treated as replacing personal responsibility to judge."
      }
    },
    {
      "id": "draws-toward",
      "prompt": "Which concepts work by pulling a person toward a violent situation before it has started — operating on desire, meaning, or belonging rather than on resistance already engaged?",
      "explanation": "These concepts all operate upstream of the threshold. They are not about overriding a reluctance to harm — they are about making the situation feel desirable, meaningful, or righteous before anyone has yet had to decide whether to pull a trigger. Hedges is the only one of the four authors whose framework belongs here: Grossman, Browning, and Bandura all describe what happens inside a violent situation to people who are already in it. Hedges describes the cultural and emotional machinery that makes people want to enter.",
      "targets": [
        "war as a drug",
        "the myth of war",
        "mythmakers",
        "escape from meaninglessness",
        "the plague of nationalism"
      ],
      "reasons": {
        "escape from meaninglessness": "The appeal to people lacking purpose is an appeal to desire, not an override of resistance — war offers something they feel they are missing.",
        "mythmakers": "Mythmakers are the agents of the pull — historians, correspondents, filmmakers, the state — who sustain the story that makes entry feel meaningful.",
        "the myth of war": "The myth operates before the war, constructing the story that makes it feel glorious rather than murderous.",
        "the plague of nationalism": "Nationalism supplies the cause and the enemy that make entry feel righteous and communal rather than arbitrary and violent.",
        "war as a drug": "The addiction metaphor is precisely about pull — a craving that precedes and motivates entry, not a resistance that gets overridden after the fact."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "on-killing",
        "reason": "Follow Grossman's training mechanisms into their full psychological cost — including what happens after the override succeeds.",
        "via": [
          "operant conditioning",
          "desensitization",
          "authorization"
        ]
      },
      {
        "id": "the-manufacture-of-compliance",
        "reason": "Follow Browning's ratchet into its full case study — the specific history of Reserve Police Battalion 101 and the persistence of choice.",
        "via": [
          "eroding resistance",
          "incremental participation"
        ]
      },
      {
        "id": "moral-disengagement-and-moral-inversion",
        "reason": "Follow Bandura's excusing frame into the complete taxonomy of moral disengagement — including the deeper inversion where cruelty becomes admirable.",
        "via": [
          "moral justification",
          "dehumanization",
          "obedience defense"
        ]
      },
      {
        "id": "war-is-a-force-that-gives-us-meaning",
        "reason": "Follow Hedges' seductive pull into its full argument — including what nationalism does to moral collapse once the war has begun.",
        "via": [
          "the myth of war",
          "war as a drug"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Before You Begin",
    "summary": "Four researchers, four accounts of how ordinary people come to commit or comply with organized violence — training, social pressure, cultural myth, and cognitive excuse, side by side.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Four researchers spent careers on a problem that feels like it should have a simple answer: how do ordinary people come to commit, or comply with, organized violence? The uncomfortable finding, across all four bodies of work, is that extraordinary evil rarely requires extraordinary people.\r\n\r\nDave Grossman documented that human beings carry a deep instinctive resistance to killing their own kind — and catalogued the deliberate training machinery twentieth-century militaries built to override it. Christopher Browning traced how ordinary reservists, given an explicit chance to refuse, mostly didn't — and how each subsequent act became easier not because conscience dissolved but because the resistance refusing would have required had already worn down. Albert Bandura named the cognitive moves that let people commit harmful acts without experiencing themselves as having abandoned their own moral standards. Chris Hedges, drawing on fifteen years as a war correspondent, added something the other three don't account for: before any of those mechanisms engage, war has to be made to feel desirable — and societies are very good at that.\r\n\r\nThese four frameworks are usually taught separately. This puzzle asks what they look like side by side."
    },
    "revision": 1
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Sonnet 4.6)",
        "model": "Claude Sonnet 4.6"
      },
      {
        "name": "Claude Code"
      }
    ]
  }
});
