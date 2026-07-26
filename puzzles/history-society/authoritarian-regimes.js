// Concept Clusters puzzle: 20th-century authoritarian regimes
// Category: History & Society
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "authoritarian-regimes",
  "title": "20th-century authoritarian regimes",
  "category": "History & Society",
  "clusters": [
    {
      "name": "Fascist Italy",
      "info": {
        "link": "wiki:Fascist Italy"
      },
      "color": "green",
      "fact": "Mussolini's Fascist Italy fused ultranationalism with a single-party corporatist state and militarist expansion into Ethiopia, providing a template later regimes adapted.",
      "terms": [
        "Blackshirts",
        "Il Duce",
        "March on Rome"
      ],
      "seeds": [
        "Blackshirts",
        "Il Duce"
      ],
      "termInfo": {
        "Blackshirts": {
          "link": "wiki:Blackshirts"
        },
        "Il Duce": {
          "link": "wiki:Duce"
        },
        "March on Rome": {
          "link": "wiki:March on Rome"
        }
      }
    },
    {
      "name": "Nazi Germany",
      "info": {
        "link": "wiki:Nazi Germany"
      },
      "color": "blue",
      "fact": "Nazi Germany combined totalitarian control with a racial ideology that justified genocide and aggressive territorial conquest.",
      "terms": [
        "Gestapo",
        "Führer",
        "Nuremberg Laws"
      ],
      "seeds": [
        "Gestapo",
        "Führer"
      ],
      "termInfo": {
        "Gestapo": {
          "link": "wiki:Gestapo"
        },
        "Führer": {
          "link": "wiki:Führer"
        },
        "Nuremberg Laws": {
          "link": "wiki:Nuremberg Laws"
        }
      }
    },
    {
      "name": "Stalinist USSR",
      "info": {
        "link": "wiki:History of the Soviet Union (1927–1953)"
      },
      "color": "amber",
      "fact": "Stalin's USSR used forced collectivization, mass terror, and state control over science itself to remake Soviet society by command.",
      "terms": [
        "Gulag",
        "Five-Year Plan",
        "Lysenkoism",
        "Vozhd"
      ],
      "seeds": [
        "Gulag",
        "Five-Year Plan"
      ],
      "termInfo": {
        "Gulag": {
          "link": "wiki:Gulag"
        },
        "Five-Year Plan": {
          "link": "wiki:Five-year plan"
        },
        "Lysenkoism": {
          "link": "wiki:Lysenkoism"
        },
        "Vozhd": {
          "text": "Russian for \"leader\" or \"boss\" — the informal title of near-absolute authority that grew around Stalin.",
          "link": "wiki:Vozhd"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "propaganda",
      "clusters": [
        0,
        1
      ],
      "relationKind": "cross-cutting",
      "fact": "Propaganda bridges the two: both regimes built cults of personality and mass rallies to manufacture unanimous public support.",
      "idealTerms": [
        "Il Duce",
        "Führer"
      ],
      "info": {
        "link": "wiki:Propaganda"
      }
    },
    {
      "term": "secret police",
      "clusters": [
        1,
        2
      ],
      "relationKind": "cross-cutting",
      "fact": "Secret police bridge the two: the Gestapo and NKVD each gave the state power to surveil, arrest, and eliminate anyone deemed disloyal, without independent oversight.",
      "idealTerms": [
        "Gestapo",
        null
      ],
      "info": {
        "link": "wiki:Secret police"
      }
    },
    {
      "term": "personality cult",
      "clusters": [
        0,
        2
      ],
      "relationKind": "cross-cutting",
      "fact": "Personality cult bridges the two: Mussolini's cult of Il Duce and Stalin's cult of the Vozhd (\"Leader\") both used relentless propaganda, portraiture, and mythologized leadership to secure loyalty beyond formal institutions — Stalin's outlasted Mussolini's by decades.",
      "idealTerms": [
        "Il Duce",
        "Vozhd"
      ],
      "info": {
        "link": "wiki:Cult of personality"
      }
    }
  ]
};
