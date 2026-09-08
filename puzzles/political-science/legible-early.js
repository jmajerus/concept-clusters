// Generated from content/puzzles/legible-early.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "legible-early",
  "title": "Legible Early",
  "category": "Political Science",
  "tags": [
    "war",
    "genocide"
  ],
  "info": "Gregory Stanton's Ten Stages of Genocide, and the different kinds of obligation -- legal, political, and civic -- to notice them before they turn operational.",
  "clusters": [
    {
      "id": "legible-stages",
      "name": "The Legible Stages",
      "color": "teal",
      "fact": "Stanton's first four stages need no weapons, camp, or plan. A society sorts people into a group -- classification -- attaches a name or symbol to the sorting -- symbolization -- writes the sorting into law or custom -- discrimination -- and strips the target group of the qualities that would make its suffering register as suffering -- dehumanization. Each is visible in ordinary speech, media, and policy, well before anyone organizes anything.",
      "terms": [
        "classification",
        "dehumanization",
        "symbolization",
        "discrimination"
      ],
      "seeds": [
        "classification",
        "dehumanization"
      ],
      "termInfo": {
        "classification": "Dividing people into 'us' and 'them' by ethnicity, race, religion, or nationality -- a sorting every culture does, and one that becomes dangerous only if it feeds the stages that follow.",
        "dehumanization": "One group denies the humanity of another, equating its members with animals, vermin, or disease -- the stage Stanton identifies as what overcomes the ordinary human revulsion against murder.",
        "discrimination": "The dominant group uses law, custom, or political power to deny another group's civil, political, or citizenship rights -- the point where classification stops being a private attitude and becomes public policy.",
        "symbolization": "Attaching a name or a visible marker to the sorting -- an ethnic label, a badge, a required garment -- so the classification can be recognized at a glance."
      },
      "info": {
        "text": "Gregory Stanton's model for the earliest, most socially visible processes that precede genocide -- the stages he argued are legible without a court, a body count, or an organized apparatus having to already exist.",
        "links": [
          {
            "href": "wiki:Ten stages of genocide"
          }
        ]
      }
    },
    {
      "id": "turning-operational",
      "name": "Turning Operational",
      "color": "brown",
      "fact": "Once classification and dehumanization have done their social work, an apparatus can move: militias and special units get built and armed -- organization -- propaganda drives the population into unbridgeable camps -- polarization -- victims get registered, marked, or moved, often under the language of self-defense -- preparation -- rights and property are stripped in earnest -- persecution -- and mass killing is carried out as policy -- extermination, the machinery the earlier stages made possible.",
      "terms": [
        "organization",
        "extermination",
        "polarization",
        "preparation",
        "persecution"
      ],
      "seeds": [
        "organization",
        "extermination"
      ],
      "termInfo": {
        "extermination": "Mass killing carried out as deliberate state or group policy -- legally 'extermination' rather than murder, because by this stage the perpetrators no longer regard their victims as fully human.",
        "organization": "Genocide is always organized -- by states, militias, or gangs -- with special units often trained and armed specifically to carry out killing.",
        "persecution": "Expropriation, forced deportation, and property destruction begin in earnest -- genocidal massacres may already be occurring, still short of the coordinated mass killing to come.",
        "polarization": "Extremists drive groups apart with propaganda and laws discouraging intermarriage or social contact, deliberately eliminating the moderate middle.",
        "preparation": "Victims are identified and separated by ethnic or religious identity and death lists are drawn up, with official action often disguised as security or self-defense."
      },
      "info": {
        "text": "The stages Stanton describes as needing an actual apparatus -- organized personnel, resources, and a plan -- rather than the ordinary social processes of the earlier stages.",
        "links": [
          {
            "href": "wiki:Ten stages of genocide"
          }
        ]
      }
    },
    {
      "id": "whos-watching",
      "name": "Who's Actually Watching",
      "color": "magenta",
      "fact": "No single actor owns the obligation to watch. The international community claims a political responsibility to protect once mass-atrocity risk is clear; early-warning projects turn indicators into a running, public forecast; but none of it moves without someone choosing to be an upstander instead of defaulting to the bystander effect -- the well-documented assumption that surely someone else is already watching.",
      "terms": [
        "the responsibility to protect",
        "the bystander effect",
        "early warning",
        "upstander"
      ],
      "seeds": [
        "the responsibility to protect",
        "the bystander effect"
      ],
      "termInfo": {
        "early warning": {
          "text": "Statistical and expert forecasting of where mass atrocities are most likely to begin -- the US Holocaust Memorial Museum's own project ranks over 160 countries by risk every year, precisely so action doesn't wait for the first killing.",
          "links": [
            {
              "href": "https://main.ushmm.org/genocide-prevention/simon-skjodt-center/work/early-warning-project",
              "label": "USHMM: Early Warning Project"
            }
          ]
        },
        "the bystander effect": {
          "text": "The well-documented tendency for individuals to be less likely to act when others are present, each assuming someone else will -- identified through 1960s social-psychology research into why witnesses to an emergency often do nothing.",
          "links": [
            {
              "href": "wiki:Bystander effect"
            }
          ]
        },
        "the responsibility to protect": {
          "text": "A political commitment endorsed by UN member states at the 2005 World Summit: that the international community shares responsibility to act when a state fails to protect its population from genocide, war crimes, ethnic cleansing, or crimes against humanity.",
          "links": [
            {
              "href": "wiki:Responsibility to protect"
            }
          ]
        },
        "upstander": {
          "text": "Someone who acts on what they notice rather than assuming someone else will -- the deliberate alternative to the bystander default, used in genocide-prevention and civic education alike.",
          "links": [
            {
              "href": "https://en.wiktionary.org/wiki/upstander",
              "label": "Wiktionary: upstander"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "denial",
      "clusters": [
        0,
        1
      ],
      "fact": "Stanton lists denial as the tenth stage, but its groundwork gets laid far earlier: denying that discriminatory laws are discriminatory, or that dehumanizing language is dehumanizing, starts alongside the stages that produce them, and simply continues, in a different register, through and after extermination itself.",
      "info": {
        "text": "Stanton's tenth and final stage: perpetrators deny that the crime occurred, blame the victims, block investigations, and obstruct courts or truth commissions.",
        "links": [
          {
            "href": "wiki:Genocide denial"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "continuity",
      "idealTerms": [
        "dehumanization",
        "extermination"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "term": "Genocide Watch",
      "clusters": [
        0,
        2
      ],
      "fact": "Stanton didn't stop at publishing a model. In 1999 he founded Genocide Watch to run it operationally -- issuing watch, warning, and emergency alerts and ranking country risk against the same stages taught here, turning the claim that genocide is legible early from an academic argument into a standing practice anyone can follow.",
      "info": {
        "text": "A Washington, D.C.-based nonprofit founded by Gregory Stanton in 1999; it coordinates the Alliance Against Genocide and issues country-by-country risk alerts based on Stanton's own stages.",
        "links": [
          {
            "href": "wiki:Genocide Watch"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "early warning"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "term": "the duty to prevent",
      "clusters": [
        1,
        2
      ],
      "fact": "The ICJ's 2007 Bosnia v. Serbia ruling ties a state's own duty to prevent to its awareness of a serious risk of genocide -- a legal trigger that in practice tends to fire only once organization and preparation are already visible. Stanton's own argument for teaching the stages was that citizens, journalists, and scholars don't need to wait that long, or for a court, to start watching.",
      "info": {
        "text": "Established by the International Court of Justice in Bosnia and Herzegovina v. Serbia and Montenegro (2007): a duty of conduct, not of result, requiring states to use all means reasonably available once they know of a serious risk.",
        "links": [
          {
            "href": "https://www.icj-cij.org/node/101888"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "contrast",
      "idealTerms": [
        "organization",
        null
      ]
    }
  ],
  "lenses": [
    {
      "id": "language-not-yet-law",
      "prompt": "Which early-stage concepts operate through naming, symbols, or rhetoric, rather than being written into law or policy the way discrimination explicitly is?",
      "explanation": "Discrimination is the one early stage that's already been formally codified -- law or custom actively denying rights. Classification, symbolization, and dehumanization can all operate purely through language, imagery, and social practice, which is exactly why Stanton argues they're visible before any institution has to act on them.",
      "targets": [
        "classification",
        "symbolization",
        "dehumanization"
      ],
      "reasons": {
        "classification": "Sorting people into 'us' and 'them' is a cognitive and social act -- every culture does it without any law requiring it.",
        "dehumanization": "Dehumanizing language -- comparing a group to vermin or disease -- needs no legal backing to do its work.",
        "symbolization": "A name or symbol is attached through custom and usage, not statute -- discrimination is the stage where the sorting gets written into law."
      }
    },
    {
      "id": "named-and-specific",
      "prompt": "Which concepts are a specific, named organization, doctrine, or legal ruling you could look up on their own, rather than a general stage, mechanism, or psychological pattern?",
      "explanation": "Genocide Watch is a specific organization founded in a specific year; the responsibility to protect is a specific doctrine adopted at a specific UN summit; the duty to prevent is a specific legal holding from a specific ICJ case. Early warning and the bystander effect are real, but they're general practices and patterns you'd find under more than one name in more than one place.",
      "targets": [
        "Genocide Watch",
        "the responsibility to protect",
        "the duty to prevent"
      ],
      "reasons": {
        "Genocide Watch": "A specific nonprofit with its own founder, founding year, and headquarters -- not a general practice.",
        "the duty to prevent": "A specific legal holding from a specific case: the ICJ's 2007 Bosnia v. Serbia ruling.",
        "the responsibility to protect": "A specific doctrine adopted at a specific UN summit in 2005, not just a general appeal to international concern."
      }
    },
    {
      "id": "obligations-not-defaults",
      "prompt": "Which concepts describe an actual obligation, practice, or role aimed at watching for these stages, rather than a stage of the process itself or the default of assuming someone else already has it covered?",
      "explanation": "Each of these names someone actually doing something about what the stages make visible -- a political doctrine, a legal duty, a forecasting practice, a deliberate role, an organization -- rather than a phase genocide moves through, or the bystander effect's default assumption that watching is already someone else's job.",
      "targets": [
        "the responsibility to protect",
        "the duty to prevent",
        "early warning",
        "upstander",
        "Genocide Watch"
      ],
      "reasons": {
        "Genocide Watch": "An organization built specifically to discharge this obligation, not a phase of the process it monitors.",
        "early warning": "A practice of forecasting where risk is rising, not a stage genocide itself passes through.",
        "the duty to prevent": "A legal obligation, not a stage -- and unlike the others here, one that's adjudicated in court rather than practiced voluntarily.",
        "the responsibility to protect": "A political commitment to act, not a description of how genocide unfolds or a reason it might not be stopped.",
        "upstander": "Names the deliberate alternative to the bystander default: someone who notices and acts instead of assuming someone else will."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "the-manufacture-of-compliance",
        "reason": "The obligation to watch runs one direction; this puzzle runs the other -- how the choice to comply, once made, gets easier to make again with each repetition.",
        "via": [
          "choice",
          "moral responsibility"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Watching for the Early Stages",
    "summary": "Why genocide researchers treat the process as legible long before it turns operational, and who actually carries the obligation to notice.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "## A process, not a moment\r\n\r\nGenocide researcher Gregory Stanton spent years studying the Holocaust, the Armenian genocide, and the Cambodian genocide before concluding that each followed a recognizable sequence -- developed as an eight-stage model in 1996 and expanded to ten in 2012. Stanton has since cautioned against reading too much order into the word \"stages\": several typically operate at once, and a later one doesn't wait for an earlier one to finish. What stays constant is the direction of travel. Sorting people into groups, naming that sorting, writing it into law, and stripping a group of the qualities that make its suffering register as suffering all show up in ordinary speech, media, and policy -- well before any organization, militia, or camp exists to act on them.\r\n\r\nThat gap matters, because it's also where the obligation to notice sits. A state carries a real legal duty here, but a narrow one: the International Court of Justice has tied it to a state's own awareness of serious risk, a threshold that in practice tends to be met only once the later, more organized stages are already visible. The international community has endorsed a broader political commitment along similar lines. Neither one is quite what Stanton was arguing for when he first published the stages. His case was that ordinary attention -- a journalist's, a scholar's, a neighbor's -- doesn't need a court's finding or a government's admission to notice the early stages doing their work. It only needs someone willing to look, and willing to act on what they see rather than assume someone else already has it covered.\r\n\r\nAs you work through this, notice which concepts describe something that's already happening, and which describe someone actually responding to it."
    },
    "links": [
      {
        "href": "https://www.genocidewatch.com/tenstages",
        "label": "Genocide Watch: The Ten Stages of Genocide"
      },
      {
        "href": "https://main.ushmm.org/genocide-prevention/simon-skjodt-center/work/early-warning-project",
        "label": "USHMM: Early Warning Project"
      },
      {
        "href": "https://www.icj-cij.org/node/101888",
        "label": "ICJ: Bosnia and Herzegovina v. Serbia and Montenegro (2007)"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Sonnet 5)",
        "model": "Claude Sonnet 5",
        "reasoning": "high"
      }
    ]
  }
});
