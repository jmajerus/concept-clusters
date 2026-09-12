// Generated from content/puzzles/democracy-history.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "democracy-history",
  "title": "Democracy through history",
  "category": "history-society",
  "clusters": [
    {
      "id": "ancient-athens",
      "name": "Ancient Athens",
      "color": "teal",
      "fact": "Athens invented direct democracy, where citizens voted on laws themselves in the assembly.",
      "terms": [
        "agora",
        "citizens",
        "assembly",
        "ostracism"
      ],
      "seeds": [
        "agora",
        "citizens"
      ],
      "termInfo": {
        "agora": {
          "links": [
            {
              "href": "wiki:Agora"
            }
          ]
        },
        "citizens": {
          "links": [
            {
              "href": "wiki:Citizenship"
            }
          ]
        },
        "assembly": {
          "text": "The Athenian citizens' assembly — the body where eligible citizens voted directly on laws.",
          "links": [
            {
              "href": "wiki:Ecclesia (ancient Greece)"
            }
          ]
        },
        "ostracism": {
          "text": "A vote Athenians could hold to exile a citizen for ten years, without trial, if they were seen as a threat to democracy.",
          "links": [
            {
              "href": "wiki:Ostracism"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Classical Athens"
          }
        ]
      }
    },
    {
      "id": "roman-republic",
      "name": "Roman Republic",
      "color": "blue",
      "fact": "Rome pioneered representative government with elected magistrates and a powerful Senate.",
      "terms": [
        "Senate",
        "consuls",
        "tribunes",
        "plebeians"
      ],
      "seeds": [
        "Senate",
        "consuls"
      ],
      "termInfo": {
        "Senate": {
          "links": [
            {
              "href": "wiki:Roman Senate"
            }
          ]
        },
        "consuls": {
          "links": [
            {
              "href": "wiki:Roman consul"
            }
          ]
        },
        "tribunes": {
          "links": [
            {
              "href": "wiki:Tribune"
            }
          ]
        },
        "plebeians": {
          "text": "Rome's common citizens, whose long struggle for political power against the patrician elite shaped the Republic's institutions.",
          "links": [
            {
              "href": "wiki:Plebeians"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Roman Republic"
          }
        ]
      }
    },
    {
      "id": "modern-democracy",
      "name": "Modern democracy",
      "color": "amber",
      "fact": "Modern democracies blend direct and representative elements, protected by written constitutions.",
      "terms": [
        "elections",
        "constitution",
        "rights",
        "separation of powers"
      ],
      "seeds": [
        "elections",
        "constitution"
      ],
      "termInfo": {
        "elections": {
          "links": [
            {
              "href": "wiki:Election"
            }
          ]
        },
        "constitution": {
          "links": [
            {
              "href": "wiki:Constitution"
            }
          ]
        },
        "rights": {
          "links": [
            {
              "href": "wiki:Rights"
            }
          ]
        },
        "separation of powers": {
          "text": "Dividing government into independent branches so no single one holds unchecked authority.",
          "links": [
            {
              "href": "wiki:Separation of powers"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Liberal democracy"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "veto",
      "term": "veto",
      "clusters": [
        1,
        2
      ],
      "fact": "Veto bridges the two: Roman tribunes invented it to block unjust laws; modern governments still use it as a check on power.",
      "info": {
        "links": [
          {
            "href": "wiki:Veto"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "tribunes",
        "constitution"
      ]
    },
    {
      "id": "civic-duty",
      "term": "civic duty",
      "clusters": [
        0,
        2
      ],
      "fact": "Civic duty bridges the two: the Athenian ideal that citizens must participate runs directly to modern expectations of voters and jurors.",
      "info": {
        "links": [
          {
            "href": "wiki:Civic engagement"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "citizens",
        "elections"
      ]
    }
  ]
});
