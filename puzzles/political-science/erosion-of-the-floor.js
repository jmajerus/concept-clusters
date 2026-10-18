// Generated from content/puzzles/erosion-of-the-floor.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "erosion-of-the-floor",
  "title": "Erosion of the Floor",
  "category": "peace-conflict-studies",
  "categories": [
    "peace-conflict-studies",
    "political-science"
  ],
  "subcategories": {
    "peace-conflict-studies": "atrocity-genocide",
    "political-science": "international-relations"
  },
  "tags": [
    "war",
    "international law",
    "genocide"
  ],
  "info": {
    "text": "How the core protections against wartime atrocity -- from the Geneva Conventions to the Genocide Convention -- are supposed to work, and the documented patterns by which they're being violated."
  },
  "clusters": [
    {
      "id": "legal-floor",
      "name": "The Legal Floor",
      "color": "teal",
      "fact": "Even wars have rules, says the ICRC -- and these are among the most basic: spare civilians, weigh harm against military gain, take precautions before striking, and never punish a doctor, or a hospital, for treating the wounded.",
      "terms": [
        "distinction",
        "proportionality",
        "precaution in attack",
        "hors de combat",
        "Common Article 3",
        "medical neutrality"
      ],
      "seeds": [
        "distinction",
        "proportionality"
      ],
      "termInfo": {
        "Common Article 3": {
          "text": "The provision common to all four 1949 Geneva Conventions setting minimum protections that apply 'in all circumstances,' including in conflicts not between states.",
          "links": [
            {
              "href": "wiki:Geneva Conventions"
            }
          ]
        },
        "distinction": {
          "text": "The IHL principle requiring parties to a conflict to distinguish combatants and military objects from civilians and civilian objects, and to direct attacks only at the former.",
          "links": [
            {
              "href": "wiki:Distinction (law)"
            }
          ]
        },
        "hors de combat": {
          "text": "A person who is wounded, sick, shipwrecked, captured, or has surrendered, and may not be made the object of attack.",
          "links": [
            {
              "href": "wiki:Hors de combat"
            }
          ]
        },
        "medical neutrality": {
          "text": "The principle that medical personnel, facilities, and transport must not be attacked or interfered with, and that care must be given to anyone who needs it regardless of political or military affiliation.",
          "links": [
            {
              "href": "wiki:Medical neutrality"
            }
          ]
        },
        "precaution in attack": {
          "text": "Additional Protocol I, Article 57: those who plan or decide an attack must take all feasible precautions to verify the target and to minimize incidental civilian harm.",
          "links": [
            {
              "href": "https://www.icrc.org/en/document/conduct-hostilities-challenges-todays-armed-conflicts"
            }
          ]
        },
        "proportionality": {
          "text": "The rule that expected civilian harm from an attack must not be excessive in relation to the concrete military advantage anticipated.",
          "links": [
            {
              "href": "wiki:Proportionality (international humanitarian law)"
            }
          ]
        }
      }
    },
    {
      "id": "patterns-of-erosion",
      "name": "Patterns of Erosion",
      "color": "brown",
      "fact": "Erosion rarely looks like open rejection of the rules: sieges starve instead of shooting, wide-area weapons move the killing indoors, hospitals get struck and their staff detained, and belligerents relabel the same acts as necessity instead of naming them as violations.",
      "terms": [
        "starvation as a method of warfare",
        "explosive weapons in populated areas",
        "selective interpretation",
        "attacks on health care",
        "detention of medical personnel"
      ],
      "seeds": [
        "starvation as a method of warfare",
        "explosive weapons in populated areas"
      ],
      "termInfo": {
        "attacks on health care": {
          "text": "Direct violence against hospitals, clinics, ambulances, and health workers -- tracked in a standardized global dataset that has recorded thousands of verified incidents.",
          "links": [
            {
              "href": "https://extranet.who.int/ssa/Index.aspx",
              "label": "WHO Surveillance System for Attacks on Health Care"
            }
          ]
        },
        "detention of medical personnel": {
          "text": "No one may be punished for carrying out medical duties compatible with medical ethics, or compelled to act against them, regardless of who is being treated.",
          "links": [
            {
              "href": "https://ihl-databases.icrc.org/en/customary-ihl/v1/rule26",
              "label": "ICRC Customary IHL, Rule 26"
            }
          ]
        },
        "explosive weapons in populated areas": {
          "text": "Bombs, rockets, artillery, and similar weapons used in towns and cities -- roughly 90% of their casualties are civilians, and 83 states endorsed a political declaration addressing the practice in 2022.",
          "links": [
            {
              "href": "https://www.unocha.org/explosive-weapons-populated-areas"
            }
          ]
        },
        "selective interpretation": {
          "text": "The ICRC's own phrase for how vague or loophole-ridden legal standards -- in national legislation or in IHL itself -- get read in the narrowest, most self-serving way possible, letting a party technically comply with a rule while defeating its purpose.",
          "links": [
            {
              "href": "https://international-review.icrc.org/articles/how-national-implementation-affects-state-conduct-in-partnered-operations-914",
              "label": "ICRC International Review of the Red Cross"
            }
          ]
        },
        "starvation as a method of warfare": {
          "text": "The deliberate deprivation of civilians of food, water, or other objects essential to survival -- banned outright since 1977, regardless of any claimed military advantage.",
          "links": [
            {
              "href": "https://starvationaccountability.org/wp-content/uploads/2022/11/Factsheet_1_Prohibition_of_Starvation_EN.pdf",
              "label": "Prohibition of starvation factsheet"
            }
          ]
        }
      }
    },
    {
      "id": "the-crime-of-crimes",
      "name": "The Crime of Crimes",
      "color": "olive",
      "fact": "Genocide is legally narrow by design: acts committed with intent to destroy a national, ethnical, racial, or religious group, in whole or in part -- political groups and so-called 'cultural genocide' were both deliberately left out when the Convention was drafted in 1948. Proving that intent, not just documenting the acts, is what separates genocide from every other crime in this puzzle.",
      "terms": [
        "genocide",
        "the Genocide Convention",
        "the duty to prevent",
        "political groups",
        "OHCHR",
        "genocide accusations"
      ],
      "seeds": [
        "genocide",
        "the Genocide Convention"
      ],
      "termInfo": {
        "OHCHR": {
          "text": "The UN's principal human rights office doesn't make legal determinations itself -- it provides expertise, methodology, and secretariat support to the independent Human Rights Council-mandated Commissions of Inquiry that investigate and document patterns that may constitute genocide. The final legal determination remains for a court: the ICJ for a state's responsibility, the ICC or an ad hoc tribunal for an individual's.",
          "links": [
            {
              "href": "https://www.ohchr.org/en/hr-bodies/hrc/co-is",
              "label": "OHCHR: HRC-mandated investigative bodies"
            }
          ]
        },
        "genocide": {
          "text": "The 'crime of crimes': acts committed with intent to destroy, in whole or in part, a national, ethnical, racial, or religious group.",
          "links": [
            {
              "href": "wiki:Genocide"
            }
          ]
        },
        "genocide accusations": {
          "text": "In January 2025, the U.S. determined that RSF militias had committed genocide in Darfur, consistent with an earlier U.S. determination for the same region in 2004. In Gaza, Amnesty International, Human Rights Watch, the UN's Independent International Commission of Inquiry, and the Israeli organizations B'Tselem and Physicians for Human Rights Israel have each concluded the legal threshold has been met; the International Association of Genocide Scholars reached the same conclusion in an August 2025 resolution."
        },
        "political groups": {
          "text": "'Political' groups appeared in the Genocide Convention's early drafts and were removed near the close of debate, chiefly at Soviet insistence, leaving political groups outside the Convention's protection to this day.",
          "links": [
            {
              "href": "https://openyls.law.yale.edu/entities/publication/44dfa504-50e6-4b07-977a-34e736109f81"
            }
          ]
        },
        "the Genocide Convention": {
          "text": "Adopted 9 December 1948, the treaty that first defined genocide as a crime under international law and obligated states to prevent and punish it.",
          "links": [
            {
              "href": "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-prevention-and-punishment-crime-genocide"
            }
          ]
        },
        "the duty to prevent": {
          "text": "Established by the ICJ in its 2007 Bosnia v. Serbia ruling: states must use all means reasonably available to prevent genocide -- a duty of conduct, not a guarantee of result. Serbia was found to have breached this duty over Srebrenica without being found to have committed the genocide itself. Genocide scholars argue the duty depends on watching a process, not waiting for a verdict: Gregory Stanton's widely used Ten Stages of Genocide -- classification, symbolization, discrimination, dehumanization, organization, polarization, preparation, persecution, extermination, denial -- treats genocide as an accumulation with visible warning signs at every stage, not a single moment that either has or hasn't occurred.",
          "links": [
            {
              "href": "https://www.icj-cij.org/node/101888"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "military-necessity",
      "term": "military necessity",
      "clusters": [
        0,
        1
      ],
      "fact": "Attackers often claim a hospital was sheltering fighters, or that patients were being used as human shields -- claims that are rarely verified and are often directly contradicted by the evidence, but that still get repeated as if they settle the question of whether a strike was lawful.",
      "info": {
        "text": "The IHL principle that force must be necessary to achieve a legitimate military purpose -- one of three core limits on the use of force, alongside distinction and proportionality.",
        "links": [
          {
            "href": "wiki:Military necessity"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "medical neutrality",
        "attacks on health care"
      ]
    },
    {
      "id": "intent-to-destroy",
      "term": "intent to destroy",
      "clusters": [
        2,
        1
      ],
      "fact": "The Genocide Convention lists deliberately inflicting conditions of life calculated to destroy a group -- which can include siege and starvation -- as one of five acts that constitute genocide, but only when committed with intent to destroy the group as such. The same act can be a war crime, a crime against humanity, or genocide, depending on what can be proven about who was targeted, how widespread the pattern was, and why it was done.",
      "info": {
        "text": "Known in international criminal law as dolus specialis, or special intent -- the single hardest element of genocide to prove, since it requires evidence of purpose, not just the acts and their consequences.",
        "links": [
          {
            "href": "https://www.un.org/en/genocideprevention/genocide.shtml"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "genocide",
        "starvation as a method of warfare"
      ]
    },
    {
      "id": "crimes-against-humanity",
      "term": "crimes against humanity",
      "clusters": [
        1,
        2
      ],
      "fact": "Most documented atrocity in war doesn't land at either extreme of this puzzle. Crimes against humanity -- murder, extermination, persecution, and other acts committed as part of a widespread or systematic attack on a civilian population -- require no proof of intent to destroy a group, only knowledge of participating in the attack. That's a far lower bar than genocide, and it's why most international prosecutions for mass atrocity are actually brought under this category instead.",
      "info": {
        "text": "Defined in the Rome Statute, Article 7: acts such as murder, extermination, deportation, torture, or persecution, committed as part of a widespread or systematic attack against a civilian population.",
        "links": [
          {
            "href": "https://www.un.org/en/genocideprevention/crimes-against-humanity.shtml"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "explosive weapons in populated areas",
        "genocide"
      ]
    }
  ],
  "lenses": [
    {
      "id": "absolute-prohibitions",
      "prompt": "Which concepts name a protection that holds regardless of any calculation of military advantage -- not a balancing test, but a line that may not be crossed?",
      "explanation": "These four don't ask anyone to weigh costs and benefits -- they simply forbid the conduct outright, including genocide itself, a jus cogens norm with no military-necessity defense. Distinction, proportionality, and medical neutrality's own narrow exception all still involve a judgment call about what's excessive, feasible, or justified; even the duty to prevent genocide is legally a duty of conduct, not an ironclad guarantee.",
      "targets": [
        "Common Article 3",
        "hors de combat",
        "starvation as a method of warfare",
        "genocide"
      ],
      "reasons": {
        "Common Article 3": "Its guarantees apply 'in all circumstances,' independent of reciprocity or battlefield calculation.",
        "genocide": "A jus cogens norm -- no claim of military necessity or state interest can lawfully excuse it.",
        "hors de combat": "Once someone is wounded, captured, or surrendering, no assessment of military advantage can justify attacking them.",
        "starvation as a method of warfare": "This is banned outright as a method, not merely when its harm outweighs its advantage."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Even Wars Have Rules",
    "summary": "What the Geneva Conventions and the Genocide Convention actually require, and how those requirements are being tested.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "## Even wars have rules\n\nThat's not a moral hope -- it's the plain statement the ICRC uses to describe the actual law. The 1949 Geneva Conventions and their Additional Protocols set out specific, concrete obligations for anyone fighting a war: don't attack civilians, weigh harm against military advantage before striking, take precautions, and never turn away the wounded or the doctors who treat them, regardless of which side they're on.\n\nNone of this is abstract. It's tested, by name, in the reporting the ICRC and others publish every year -- hospitals struck, sieges that starve rather than shoot, medical staff detained for treating the wrong patient. Some of these acts are absolute violations, banned outright. Others involve a real judgment call that gets stretched, in practice, to excuse conduct the rule was never meant to allow.\n\nOne category sits apart from the rest: genocide. It isn't a Geneva Conventions concept at all -- it comes from a separate 1948 treaty, and it can happen with or without a war going on. What makes an act genocide isn't its scale or brutality alone; it's proof of intent to destroy a specific group, in whole or in part. The same siege that starves a population can be a war crime, a crime against humanity, or genocide -- the difference is not what happened, but what can be proven about who was targeted, how widespread the pattern was, and why. This isn't a binary between genocide and innocence: crimes against humanity require no proof of group-destruction intent at all, only knowledge of participating in a widespread or systematic attack on civilians, and it's the category under which most mass-atrocity prosecutions actually succeed. Failing to prove genocide's narrow intent element doesn't mean nothing happened -- it usually means a different, more provable crime did.\n\nGenocide accusations aren't only historical, either. In January 2025, the United States determined that RSF militias had committed genocide in Darfur, Sudan, consistent with an earlier U.S. determination for the same region in 2004. In Gaza, Amnesty International, Human Rights Watch, the UN's Independent International Commission of Inquiry, and the Israeli organizations B'Tselem and Physicians for Human Rights Israel have each concluded, based on their own investigations, that the legal threshold has been met; the International Association of Genocide Scholars reached the same conclusion in an August 2025 resolution. Israel denies the accusation. No court has ruled, and South Africa's case against Israel has been before the International Court of Justice since December 2023 -- the kind of case that, on precedent, takes over a decade to resolve. That gap matters: genocide is an accumulation, and a verdict arriving after the accumulation has run its course cannot prevent what it was meant to stop. It's the reason corroborated, on-the-ground investigation carries real weight in real time, independent of whatever a court eventually decides.\n\nHow politically charged this space has become is illustrated by what happened next. In July 2025, the U.S. sanctioned Francesca Albanese, the UN Special Rapporteur on the Palestinian territories who had pressed the ICC to prosecute U.S. and Israeli nationals -- freezing any funds owed to her in the U.S., including royalties from her own book on the subject, and citing the fact that neither the U.S. nor Israel has joined the Rome Statute she was trying to invoke. The sanctions were briefly lifted after a federal judge called them a restriction on her speech, then reimposed about a week later. UN human rights experts called the episode an assault on the human rights system itself. Bringing a genocide case, in other words, is not just a legal question -- it can carry a direct personal and political cost for anyone who tries.\n\nThat accumulation has an actual, mapped shape. Gregory Stanton's Ten Stages of Genocide -- classification, symbolization, discrimination, dehumanization, organization, polarization, preparation, persecution, extermination, denial -- was developed after Stanton found the same escalating pattern across genocide after genocide he studied. The stages aren't a strict sequence; Stanton himself has said several usually operate at once. But the pattern is real, and it's been used by the U.S. State Department and the UN for prediction and prevention ever since. By the time a genocide charge is formally leveled, the accumulation behind it has usually been visible for a long time. Fixating on whether the legal switch has been flipped, while the build-up that preceded it goes comparatively unwatched, is exactly the failure mode atrocity-prevention scholars built this framework to correct.\n\nAs you work through this puzzle, notice which protections are unconditional -- and which ones depend on a claim that might not hold up."
    },
    "links": [
      {
        "href": "https://www.icrc.org/en/law-and-policy/respect-ihl",
        "label": "ICRC: Respect for IHL"
      },
      {
        "href": "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-prevention-and-punishment-crime-genocide",
        "label": "The Genocide Convention (OHCHR)"
      },
      {
        "href": "https://www.genocidewatch.com/tenstages",
        "label": "Genocide Watch: The Ten Stages of Genocide"
      },
      {
        "href": "https://genocidescholars.org/join/",
        "label": "IAGS membership criteria"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "erosion-of-the-floor",
      "puzzleRevision": "fnv1a32:5eb48fc7",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:distinction": {
          "x": 174.03,
          "y": 465.31,
          "pinned": false
        },
        "term:proportionality": {
          "x": 244.79,
          "y": 356.3,
          "pinned": false
        },
        "term:precaution in attack": {
          "x": 85,
          "y": 350.24,
          "pinned": false
        },
        "term:hors de combat": {
          "x": 66.1,
          "y": 529.9,
          "pinned": false
        },
        "term:Common Article 3": {
          "x": 190.33,
          "y": 597,
          "pinned": false
        },
        "term:medical neutrality": {
          "x": 309.26,
          "y": 498.28,
          "pinned": false
        },
        "term:starvation as a method of warfare": {
          "x": 605.13,
          "y": 375.93,
          "pinned": false
        },
        "term:explosive weapons in populated areas": {
          "x": 670.1,
          "y": 118.64,
          "pinned": false
        },
        "term:selective interpretation": {
          "x": 787.08,
          "y": 519.14,
          "pinned": false
        },
        "term:attacks on health care": {
          "x": 610.68,
          "y": 597,
          "pinned": false
        },
        "term:detention of medical personnel": {
          "x": 842.07,
          "y": 308.11,
          "pinned": false
        },
        "term:genocide": {
          "x": 313.51,
          "y": 157.19,
          "pinned": false
        },
        "term:the Genocide Convention": {
          "x": 171.32,
          "y": 188.48,
          "pinned": false
        },
        "term:the duty to prevent": {
          "x": 461.57,
          "y": 23,
          "pinned": false
        },
        "term:political groups": {
          "x": 129.33,
          "y": 23,
          "pinned": false
        },
        "term:OHCHR": {
          "x": 296.83,
          "y": 244.57,
          "pinned": false
        },
        "term:genocide accusations": {
          "x": 290.72,
          "y": 23,
          "pinned": false
        },
        "term:military necessity": {
          "x": 436.68,
          "y": 597,
          "pinned": false
        },
        "term:intent to destroy": {
          "x": 399.74,
          "y": 368.54,
          "pinned": false
        },
        "term:crimes against humanity": {
          "x": 451.85,
          "y": 202.53,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4125.29,
        "score": 4125.285060711927
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:31:04.221Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "erosion-of-the-floor",
      "puzzleRevision": "fnv1a32:5eb48fc7",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 238.75,
          "y": 310.37,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 573.26,
          "pinned": false
        },
        "cluster:2": {
          "x": 811.25,
          "y": 310.37,
          "pinned": false
        }
      },
      "bridges": {
        "term:military necessity": {
          "x": 256.23,
          "y": 493.86,
          "pinned": false
        },
        "term:intent to destroy": {
          "x": 571.96,
          "y": 345.65,
          "pinned": false
        },
        "term:crimes against humanity": {
          "x": 823.34,
          "y": 506.11,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "distinction",
          "proportionality",
          "precaution in attack",
          "hors de combat",
          "Common Article 3",
          "medical neutrality"
        ],
        "cluster:1": [
          "starvation as a method of warfare",
          "explosive weapons in populated areas",
          "selective interpretation",
          "attacks on health care",
          "detention of medical personnel"
        ],
        "cluster:2": [
          "genocide",
          "the Genocide Convention",
          "the duty to prevent",
          "political groups",
          "OHCHR",
          "genocide accusations"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 404.67210379114255
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:31:06.678Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "erosion-of-the-floor",
      "puzzleRevision": "fnv1a32:5eb48fc7",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:distinction": {
          "x": 64.4,
          "y": 97.33
        },
        "term:proportionality": {
          "x": 506.8,
          "y": 139.63
        },
        "term:precaution in attack": {
          "x": 340.23,
          "y": 22
        },
        "term:hors de combat": {
          "x": 177.63,
          "y": 162.71
        },
        "term:Common Article 3": {
          "x": 532.89,
          "y": 22
        },
        "term:medical neutrality": {
          "x": 187.09,
          "y": 202.69
        },
        "term:starvation as a method of warfare": {
          "x": 568.95,
          "y": 590.19
        },
        "term:explosive weapons in populated areas": {
          "x": 520.1,
          "y": 318.14
        },
        "term:selective interpretation": {
          "x": 754.68,
          "y": 413.49
        },
        "term:attacks on health care": {
          "x": 870.7,
          "y": 285.12
        },
        "term:detention of medical personnel": {
          "x": 823.94,
          "y": 598
        },
        "term:genocide": {
          "x": 219.81,
          "y": 380.2
        },
        "term:the Genocide Convention": {
          "x": 92.45,
          "y": 295.37
        },
        "term:the duty to prevent": {
          "x": 79.85,
          "y": 527.22
        },
        "term:political groups": {
          "x": 368.57,
          "y": 598
        },
        "term:OHCHR": {
          "x": 35.75,
          "y": 409
        },
        "term:genocide accusations": {
          "x": 199.65,
          "y": 598
        },
        "term:military necessity": {
          "x": 433.14,
          "y": 257.9
        },
        "term:intent to destroy": {
          "x": 387.51,
          "y": 485.44
        },
        "term:crimes against humanity": {
          "x": 384.32,
          "y": 389.36
        },
        "cluster:0": {
          "x": 319.3,
          "y": 156.62
        },
        "cluster:1": {
          "x": 558.69,
          "y": 376.55
        },
        "cluster:2": {
          "x": 202.96,
          "y": 448.14
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:31:09.481Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:31:01.582Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
