// Generated from content/puzzles/the-reconversion.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-reconversion",
  "title": "The Reconversion",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "History & Society"
  ],
  "info": {
    "text": "A.J. Muste -- Dutch-American minister, Lawrence strike organizer, and for a time the leader of an actual Trotskyist party -- until a 1936 religious reconversion sent him back to Christian pacifism for good, and into three more decades leading the Fellowship of Reconciliation, training Bayard Rustin's generation in nonviolent direct action, and traveling to Hanoi at eighty-one to try to end the Vietnam War.",
    "link": "wiki:A. J. Muste"
  },
  "lenses": [
    {
      "id": "institutions-not-events",
      "prompt": "Which of these are organizations Muste helped found or lead, rather than a single event or personal experience?",
      "explanation": "The Fellowship of Reconciliation, the American Workers Party, and the Spring Mobilization Committee were all organizations Muste helped found or lead, spanning three completely different phases and ideologies of his career -- Christian pacifist, Marxist revolutionary, and antiwar coalition-builder -- proof that institution-building, not any single ideology, was the real constant in his working life.",
      "targets": [
        "the Fellowship of Reconciliation",
        "the American Workers Party",
        "the Spring Mobilization Committee"
      ],
      "reasons": {
        "the American Workers Party": "The Marxist party Muste led before its 1934 merger with the Trotskyists.",
        "the Fellowship of Reconciliation": "Co-founded in 1915 as a young pacifist minister, and later led as its executive director from 1940.",
        "the Spring Mobilization Committee": "The antiwar coalition he chaired at the very end of his life, organizing against the Vietnam War."
      }
    },
    {
      "id": "personal-turning-points",
      "prompt": "Which of these mark a moment where Muste's own convictions visibly changed his course, rather than an organization he built?",
      "explanation": "A forced resignation, a religious reconversion, and the Hanoi trip mark three moments where Muste's own convictions visibly changed his course, rather than an organization he was busy building: losing his pulpit over pacifism in WWI, breaking from Trotskyism back to Christian nonviolence in 1936, and, at eighty-one, traveling into a wartime capital to see whether personal diplomacy could still do what marches and speeches hadn't.",
      "targets": [
        "a forced resignation",
        "a religious reconversion",
        "the Hanoi trip"
      ],
      "reasons": {
        "a forced resignation": "Losing his pulpit over pacifism during WWI, which sent him toward the labor movement instead of the church.",
        "a religious reconversion": "A 1936 experience in Europe that ended his Marxist period and returned him to Christian pacifism for good.",
        "the Hanoi trip": "At eighty-one, traveling into a wartime capital to see whether personal diplomacy could do what marches and speeches hadn't."
      }
    }
  ],
  "clusters": [
    {
      "id": "from-pulpit-to-picket-line",
      "name": "From Pulpit to Picket Line",
      "color": "teal",
      "fact": "Muste helped found the Fellowship of Reconciliation in 1915 as a young pacifist minister; two years later, when the United States entered the war, his refusal to abandon that same pacifism cost him his Massachusetts pulpit. In 1919 he found himself elected executive secretary of the strike committee during a bitter Lawrence textile strike, beaten by police on the picket line, and from there spent over a decade directing Brookwood Labor College, training organizers for the industrial-union movement.",
      "terms": [
        "the Lawrence strike",
        "a forced resignation",
        "the Fellowship of Reconciliation",
        "Brookwood Labor College"
      ],
      "seeds": [
        "the Lawrence strike",
        "a forced resignation"
      ],
      "termInfo": {
        "the Fellowship of Reconciliation": {
          "link": "wiki:Fellowship of Reconciliation"
        }
      },
      "info": {
        "text": "Muste's first political conversion: from a Massachusetts pulpit lost over WWI pacifism, into a decade of labor organizing and union education.",
        "link": "wiki:A. J. Muste"
      }
    },
    {
      "id": "the-trotskyist-interlude",
      "name": "The Trotskyist Interlude",
      "color": "brown",
      "fact": "By 1933 Muste was leading the American Workers Party, nicknamed the Musteites, which merged with the Trotskyists the following year, briefly making him the leader of an actual Trotskyist party. He helped introduce the sit-down strike to American labor at Akron's 1936 Goodyear strike, and then, while traveling in Europe that same year, underwent a religious reconversion that sent him back to Christian pacifism for the rest of his life.",
      "terms": [
        "the American Workers Party",
        "a religious reconversion",
        "the sit-down strike",
        "Musteites"
      ],
      "seeds": [
        "the American Workers Party",
        "a religious reconversion"
      ],
      "info": {
        "text": "Muste's decade as a revolutionary Marxist, culminating in his brief leadership of an actual Trotskyist party -- and the sudden 1936 religious experience that ended it for good.",
        "link": "wiki:American Workers Party"
      }
    },
    {
      "id": "elder-of-the-movement",
      "name": "Elder of the Movement",
      "color": "magenta",
      "fact": "Muste spent his last three decades rebuilding the very movement he had once left behind: executive director of the Fellowship of Reconciliation from 1940, author of Nonviolence in an Aggressive World that same year, and mentor to the generation -- Bayard Rustin among them -- who carried nonviolent direct action into the civil rights movement. At eighty-one, chairing the new Spring Mobilization Committee to End the War in Vietnam, he traveled to Hanoi to meet North Vietnamese leaders directly; he died within months of returning.",
      "terms": [
        "training a new generation",
        "the Hanoi trip",
        "Nonviolence in an Aggressive World",
        "the Spring Mobilization Committee"
      ],
      "seeds": [
        "training a new generation",
        "the Hanoi trip"
      ],
      "info": {
        "text": "Muste's final three decades: rebuilding the Fellowship of Reconciliation, mentoring the activists who carried nonviolent direct action into the civil rights movement, and organizing against the Vietnam War until his death.",
        "link": "wiki:A. J. Muste",
        "citations": [
          {
            "title": "Nonviolence in an Aggressive World",
            "author": "A. J. Muste",
            "publisher": "Harper & Brothers",
            "year": "1940"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-further-left",
      "term": "further left",
      "clusters": [
        0,
        1
      ],
      "fact": "Lawrence taught Muste that mass, disciplined labor action could actually win; when the broader labor movement kept losing through the 1920s against entrenched capital, that same conviction pushed him further left still, from labor organizing and Brookwood's classrooms toward full revolutionary Marxism and, eventually, leadership of an actual Trotskyist party.",
      "relationKind": "dynamic",
      "termRole": "connector",
      "idealTerms": [
        "the Lawrence strike",
        "the American Workers Party"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      },
      "info": {
        "text": "What pushed Muste's own trajectory from labor organizing toward full revolutionary Marxism: the same conviction that mass, disciplined action could win, tested against a decade of losses."
      }
    },
    {
      "id": "bridge-what-came-back",
      "term": "what came back",
      "clusters": [
        1,
        2
      ],
      "fact": "The 1936 reconversion was not a brief detour: everything Muste did for the next three decades -- rebuilding the Fellowship of Reconciliation, training Rustin's generation in nonviolent direct action, and traveling to Hanoi at eighty-one to try to end a war -- flowed directly from the pacifism he recommitted to that year and never left again.",
      "relationKind": "dynamic",
      "termRole": "connector",
      "idealTerms": [
        "a religious reconversion",
        "training a new generation"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      },
      "info": {
        "text": "The 1936 reconversion wasn't a brief detour -- everything Muste did for the next three decades flowed directly from the pacifism he recommitted to that year."
      }
    },
    {
      "id": "bridge-the-same-fellowship-decades-later",
      "term": "the same fellowship, decades later",
      "clusters": [
        0,
        2
      ],
      "fact": "Muste helped found the Fellowship of Reconciliation in 1915, well before his own pacifism cost him his pulpit; two decades, one full Marxist detour, and one religious reconversion later, he came back to lead that very same organization as its executive director, and used it to train the activists who would carry nonviolent direct action into the civil rights movement.",
      "relationKind": "continuity",
      "termRole": "connector",
      "idealTerms": [
        "the Fellowship of Reconciliation",
        "training a new generation"
      ],
      "info": {
        "text": "Muste helped found the Fellowship of Reconciliation in 1915; two decades, a Marxist detour, and a religious reconversion later, he came back to lead that very same organization."
      }
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-12"
    }
  ]
});
