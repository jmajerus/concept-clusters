// Generated from content/puzzles/manufacturing-consent.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "manufacturing-consent",
  "title": "Manufacturing Consent",
  "category": "Media & Information Literacy",
  "categories": [
    "Media & Information Literacy",
    "Political Science"
  ],
  "large": true,
  "tags": [
    "book"
  ],
  "info": {
    "text": "Herman and Chomsky's argument that a free press still filters the news it prints -- not through censorship, but through ownership, markets, sourcing, and fear.",
    "link": "wiki:Manufacturing Consent"
  },
  "clusters": [
    {
      "id": "five-filters",
      "name": "The Five Filters",
      "color": "amber",
      "fact": "Herman and Chomsky's five filters -- ownership concentration, advertiser dependence, reliance on elite sourcing, organized flak, and a shifting fear ideology -- need no conspiracy to work; each pushes independently toward the same result, filtering out what powerful interests would find inconvenient before a story ever reaches print.",
      "terms": [
        "ownership concentration",
        "advertising dependence",
        "elite sourcing",
        "flak discipline",
        "fear ideology"
      ],
      "seeds": [
        "ownership concentration",
        "advertising dependence"
      ],
      "termInfo": {
        "elite sourcing": "Reliance on government and corporate spokespeople as the cheapest, most 'objective'-seeming source of daily quotes, which quietly hands those institutions the power to set a story's frame.",
        "flak discipline": "Organized complaints, lawsuits, and pressure campaigns -- from advertisers, press councils, or political operations -- that make publishing an inconvenient story costly enough to discourage doing it again."
      },
      "info": {
        "text": "Herman and Chomsky's account of how ownership, markets, and access to power quietly filter which stories become news at all.",
        "link": "wiki:Propaganda model"
      }
    },
    {
      "id": "worthy-and-unworthy-victims",
      "name": "Worthy and Unworthy Victims",
      "color": "brown",
      "fact": "The same murder reads as an atrocity or a footnote depending on who committed it: priests killed in Communist Poland became worthy victims commanding sustained outrage, while priests killed by US-backed forces in Latin America became unworthy ones -- an ally's bloodbath framed as constructive where an enemy's was nefarious.",
      "terms": [
        "worthy victims",
        "unworthy victims",
        "constructive bloodbaths",
        "nefarious bloodbaths"
      ],
      "seeds": [
        "worthy victims",
        "unworthy victims"
      ],
      "termInfo": {
        "constructive bloodbaths": {
          "text": "Mass killing that serves the interests of the reporting country's own government, and is accordingly minimized, justified, or left uninvestigated.",
          "link": "wiki:Counter-Revolutionary Violence: Bloodbaths in Fact & Propaganda"
        },
        "nefarious bloodbaths": {
          "text": "Mass killing carried out by an official enemy, reported with extensive documentation, moral outrage, and sustained follow-up coverage.",
          "link": "wiki:Counter-Revolutionary Violence: Bloodbaths in Fact & Propaganda"
        },
        "unworthy victims": {
          "text": "Victims of one's own government or its allies, whose suffering is reported briefly, without names, and without follow-up.",
          "link": "wiki:Manufacturing Consent"
        },
        "worthy victims": {
          "text": "Victims of officially designated enemies, whose suffering the press documents in named, humanized, sustained detail.",
          "link": "wiki:Manufacturing Consent"
        }
      },
      "info": {
        "text": "How the same act of violence reads as an atrocity or a footnote depending on whether it was committed by an enemy state or by one's own government and its allies.",
        "link": "wiki:Manufacturing Consent"
      }
    },
    {
      "id": "manufacturing-consent-the-idea",
      "name": "Manufacturing Consent, the Idea",
      "color": "blue",
      "fact": "Decades before Chomsky and Herman, Walter Lippmann named the manufacture of consent and Edward Bernays called it the engineering of consent: the shared premise was that a bewildered herd cannot govern itself directly, so a specialized class must administer a spectator democracy on its behalf.",
      "terms": [
        "manufacture of consent",
        "engineering of consent",
        "spectator democracy",
        "bewildered herd"
      ],
      "seeds": [
        "manufacture of consent",
        "engineering of consent"
      ],
      "termInfo": {
        "bewildered herd": {
          "text": "Lippmann's name for the general public: too numerous, distracted, and locally focused to grasp common interests directly, and therefore requiring managers.",
          "link": "wiki:Public Opinion (book)"
        },
        "engineering of consent": {
          "text": "Edward Bernays's term for the professional, psychology-informed practice of manufacturing public support -- the discipline that became modern public relations.",
          "link": "wiki:The Engineering of Consent"
        },
        "manufacture of consent": {
          "text": "Walter Lippmann's 1922 phrase for the deliberate shaping of public opinion by a specialized class, offered as a necessary feature of modern democracy rather than a corruption of it.",
          "link": "wiki:Public Opinion (book)"
        },
        "spectator democracy": "A democracy in which ordinary citizens periodically ratify decisions made elsewhere, rather than participating directly in making them."
      },
      "info": {
        "text": "The decades-older theory that mass democracy requires an elite class to manage public opinion on the public's behalf -- the premise Chomsky and Herman's filters mechanize.",
        "link": "wiki:Public Opinion (book)"
      }
    },
    {
      "id": "contesting-the-model",
      "name": "Contesting the Model",
      "color": "teal",
      "fact": "Critics press the propaganda model on two fronts: a structural analysis is not automatically a testable one, and treating audiences as passive filter-output ignores the audience agency real readers exercise -- but Chomsky and Herman's own answer is that the filters demonstrate their power precisely by adapting their target across eras rather than disappearing.",
      "terms": [
        "structural analysis",
        "audience agency",
        "testability critique",
        "filter adaptation"
      ],
      "seeds": [
        "structural analysis",
        "audience agency"
      ],
      "termInfo": {
        "audience agency": "The observation that the model traces what reaches an audience but says comparatively little about how skeptically, selectively, or resistantly that audience actually receives it.",
        "filter adaptation": "The claim that a filter's specific target changes with history -- anticommunism giving way to terrorism, for instance -- while its underlying function stays the same.",
        "structural analysis": "Chomsky and Herman's own description of their model: filters operate through ordinary market incentive, not through a secret editorial meeting or a coordinated plot.",
        "testability critique": "The objection that the model's predictions about coverage are often stated loosely enough that almost any outcome can be read as confirming it."
      },
      "info": {
        "text": "How later scholars have pushed back on, refined, and tested Herman and Chomsky's model in the decades since 1988.",
        "link": "wiki:Propaganda model"
      }
    }
  ],
  "bridges": [
    {
      "term": "selective indignation",
      "clusters": [
        0,
        1
      ],
      "fact": "The five filters do not operate in the abstract: applied to news about political killing, they consistently produce more sustained outrage for victims of enemy states than for victims of one's own government and its allies.",
      "termRole": "connector",
      "relationKind": "dynamic",
      "idealTerms": [
        "fear ideology",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "term": "necessary illusions",
      "clusters": [
        2,
        0
      ],
      "fact": "Chomsky's own phrase for the fabricated beliefs a formally free society still needs names exactly what the five filters mechanically produce, decades after Lippmann first described their necessity.",
      "info": {
        "text": "Chomsky's 1989 book extending the propaganda model's five filters into detailed case studies.",
        "link": "wiki:Necessary Illusions"
      },
      "termRole": "reference",
      "relationKind": "continuity",
      "idealTerms": [
        "manufacture of consent",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "term": "the war on terror",
      "clusters": [
        0,
        3
      ],
      "fact": "When the Cold War ended, critics asked whether the fifth filter would disappear with it; instead the same fear-based mechanism reappeared with a new named enemy, exactly the adaptive persistence defenders of the model point to as evidence of a structural cause rather than an ideological one.",
      "info": {
        "text": "The post-9/11 U.S.-led campaign that many media scholars cite as the clearest post-Cold-War instance of the fifth filter's target updating.",
        "link": "wiki:War on terror"
      },
      "termRole": "reference",
      "relationKind": "continuity",
      "idealTerms": [
        "fear ideology",
        "filter adaptation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "institutional-mechanisms",
      "prompt": "Which concepts describe a market or institutional structure that shapes what becomes news, rather than a symbolic or ideological control mechanism?",
      "explanation": "These four filters work through ordinary market incentive -- who owns the outlet, who pays for it, whose information is cheapest to use, and who can make dissent costly -- rather than through appeals to shared belief or fear.",
      "targets": [
        "ownership concentration",
        "advertising dependence",
        "elite sourcing",
        "flak discipline"
      ]
    },
    {
      "id": "worthy-and-unworthy",
      "prompt": "Which concepts function by sorting people, victims, or threats into two opposed camps of legitimacy?",
      "explanation": "The model's binaries are not limited to victims: naming a common enemy performs the identical sorting work, marking some suffering as worth outrage and other suffering as beneath notice.",
      "targets": [
        "worthy victims",
        "unworthy victims",
        "fear ideology",
        "the war on terror"
      ]
    },
    {
      "id": "elite-theory-to-mechanism",
      "prompt": "Which concepts trace a throughline from the original theory of elite-managed consent to its modern defense as an adaptive, structural mechanism?",
      "explanation": "Lippmann's claim that the public is a bewildered herd requiring a spectator democracy is the same premise Chomsky later renamed necessary illusions and that today's defenders describe as a structural analysis rather than a conspiracy -- one idea extended across sixty years and two authors.",
      "targets": [
        "bewildered herd",
        "spectator democracy",
        "necessary illusions",
        "structural analysis"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "hegemony-and-consent",
        "reason": "Compare Gramsci's theory of how consent to power is won through culture and common sense against the propaganda model's more mechanical, market-driven account of the same outcome."
      }
    ]
  },
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-15"
    }
  ]
});
