// Concept Clusters puzzle: Democracy through history
// Category: History & Society
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "democracy-history",
  "title": "Democracy through history",
  "category": "History & Society",
  "clusters": [
    {
      "name": "Ancient Athens",
      "info": {
        "link": "wiki:Classical Athens"
      },
      "color": "green",
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
          "link": "wiki:Agora"
        },
        "citizens": {
          "link": "wiki:Citizenship"
        },
        "assembly": {
          "text": "The Athenian citizens' assembly — the body where eligible citizens voted directly on laws.",
          "link": "wiki:Ecclesia (ancient Greece)"
        },
        "ostracism": {
          "text": "A vote Athenians could hold to exile a citizen for ten years, without trial, if they were seen as a threat to democracy.",
          "link": "wiki:Ostracism"
        }
      }
    },
    {
      "name": "Roman Republic",
      "info": {
        "link": "wiki:Roman Republic"
      },
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
          "link": "wiki:Roman Senate"
        },
        "consuls": {
          "link": "wiki:Roman consul"
        },
        "tribunes": {
          "link": "wiki:Tribune"
        },
        "plebeians": {
          "text": "Rome's common citizens, whose long struggle for political power against the patrician elite shaped the Republic's institutions.",
          "link": "wiki:Plebeians"
        }
      }
    },
    {
      "name": "Modern democracy",
      "info": {
        "link": "wiki:Liberal democracy"
      },
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
          "link": "wiki:Election"
        },
        "constitution": {
          "link": "wiki:Constitution"
        },
        "rights": {
          "link": "wiki:Rights"
        },
        "separation of powers": {
          "text": "Dividing government into independent branches so no single one holds unchecked authority.",
          "link": "wiki:Separation of powers"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "veto",
      "clusters": [
        1,
        2
      ],
      "fact": "Veto bridges the two: Roman tribunes invented it to block unjust laws; modern governments still use it as a check on power.",
      "idealTerms": [
        "tribunes",
        "constitution"
      ],
      "info": {
        "link": "wiki:Veto"
      }
    },
    {
      "term": "civic duty",
      "clusters": [
        0,
        2
      ],
      "fact": "Civic duty bridges the two: the Athenian ideal that citizens must participate runs directly to modern expectations of voters and jurors.",
      "idealTerms": [
        "citizens",
        "elections"
      ],
      "info": {
        "link": "wiki:Civic engagement"
      }
    }
  ]
};
