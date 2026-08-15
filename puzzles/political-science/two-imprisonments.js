// Generated from content/puzzles/two-imprisonments.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "two-imprisonments",
  "title": "Two Imprisonments",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "History & Society"
  ],
  "info": {
    "text": "Eugene V. Debs, railroad-union organizer turned five-time Socialist Party presidential candidate, whose politics were forged twice over in a federal prison cell -- first by the Pullman strike's defeat, and later by his own conviction for opposing the First World War.",
    "link": "wiki:Eugene V. Debs"
  },
  "lenses": [
    {
      "id": "dateable-events",
      "prompt": "Which of these are specific, dateable events, rather than an idea or a political position?",
      "explanation": "The Pullman boycott, the Red Special, and the Canton speech are all specific, dateable events rather than abstract positions: a nationwide railroad boycott in the summer of 1894, a campaign train touring the country in 1908, and a single anti-war speech delivered in Canton, Ohio in June 1918 that became the basis for a federal indictment.",
      "targets": [
        "the Pullman boycott",
        "the Red Special",
        "the Canton speech"
      ],
      "reasons": {
        "the Canton speech": "A single anti-war speech, delivered in Canton, Ohio on June 16, 1918.",
        "the Pullman boycott": "A nationwide railroad boycott running from May to July of 1894.",
        "the Red Special": "A campaign train that toured the country during the 1908 presidential race."
      }
    },
    {
      "id": "made-in-prison",
      "prompt": "Which of these directly involved Debs being imprisoned by the federal government?",
      "explanation": "The federal injunction and the Espionage Act are the two legal instruments that put Debs behind bars, in 1894 and 1918 respectively -- and prison conversion names what happened during the first of those two terms: reading Marx in the Woodstock jail is where his socialism actually began. All three trace back to the same fact of his life: everything that made Debs a national figure, he built or discovered while, or because, the state had him locked up.",
      "targets": [
        "the federal injunction",
        "prison conversion",
        "the Espionage Act"
      ],
      "reasons": {
        "prison conversion": "What happened during his first term: reading Marx in the Woodstock jail is where his socialism actually began.",
        "the Espionage Act": "The law used to convict and imprison him a second time, in 1918.",
        "the federal injunction": "The legal basis for his first imprisonment, after the Pullman strike."
      }
    }
  ],
  "clusters": [
    {
      "id": "industrial-unionism",
      "name": "Industrial Unionism",
      "color": "brown",
      "fact": "Debs founded the American Railway Union in 1893 on a new premise: organize every worker on the railroad together, regardless of craft, rather than splitting them into separate unions by trade. When Pullman workers -- paid less by the same company that also collected their rent as their landlord -- struck in 1894, the ARU backed them with a nationwide boycott of Pullman cars, until a federal injunction and the troops sent to enforce it broke the strike and put Debs in jail.",
      "terms": [
        "industrial unionism",
        "the Pullman boycott",
        "the American Railway Union",
        "the federal injunction"
      ],
      "seeds": [
        "industrial unionism",
        "the Pullman boycott"
      ],
      "termInfo": {
        "the American Railway Union": {
          "link": "wiki:American Railway Union"
        },
        "the federal injunction": {
          "link": "wiki:In re Debs"
        }
      },
      "info": {
        "text": "Debs's organizing innovation and its defeat: uniting all railroad workers into one union rather than dividing them by craft, tested and broken in the 1894 Pullman boycott.",
        "link": "wiki:Pullman Strike"
      }
    },
    {
      "id": "becoming-a-socialist",
      "name": "Becoming a Socialist",
      "color": "teal",
      "fact": "Debs's socialism was born, by his own account, in a jail cell: reading Marx during his six months in the Woodstock jail after the Pullman strike collapsed converted him from a trade unionist into a socialist, and he spent the following decades touring the country -- including aboard his own campaign train, the Red Special -- arguing that class struggle was not a betrayal of American values but their fulfillment.",
      "terms": [
        "class struggle",
        "the Socialist Party of America",
        "prison conversion",
        "the Red Special"
      ],
      "seeds": [
        "class struggle",
        "the Socialist Party of America"
      ],
      "info": {
        "text": "Debs's conversion to socialism during his first imprisonment, and his subsequent decades building the Socialist Party of America into the country's most visible socialist movement.",
        "link": "wiki:Socialist Party of America"
      }
    },
    {
      "id": "prison-campaigns",
      "name": "Prison Campaigns",
      "color": "magenta",
      "fact": "In June 1918, Debs told a crowd in Canton, Ohio that the First World War was an imperialist war fought by workers on behalf of rival capitalist powers -- and was indicted under the Espionage Act for it. He ran for president one more time in 1920, campaigning, and eventually running, from prison, and still won nearly a million votes.",
      "terms": [
        "the Canton speech",
        "the Espionage Act",
        "an imperialist war",
        "running from prison"
      ],
      "seeds": [
        "the Canton speech",
        "the Espionage Act"
      ],
      "termInfo": {
        "the Espionage Act": {
          "link": "wiki:Espionage Act of 1917"
        }
      },
      "info": {
        "text": "Debs's second imprisonment, for a single anti-war speech, and the presidential campaign he ran from behind bars in 1920 -- his fifth and last.",
        "link": "wiki:Debs v. United States"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-limits-of-the-strike",
      "term": "the limits of the strike",
      "clusters": [
        0,
        1
      ],
      "fact": "The Pullman strike's defeat is what actually produced Debs's socialism: watching the government side unmistakably with the company -- an injunction, then federal troops -- convinced him in his jail cell that organizing workers industry by industry could never be enough on its own, and that the fight had to become explicitly political.",
      "relationKind": "dynamic",
      "idealTerms": [
        "the Pullman boycott",
        "prison conversion"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-capitalism-s-war",
      "term": "capitalism's war",
      "clusters": [
        1,
        2
      ],
      "fact": "Debs's socialism supplied the lens for his anti-war stand: if class struggle, not national loyalty, was the deeper truth of politics, then a war fought by workers on behalf of rival capitalist powers could only be read as an imperialist war -- exactly the argument that got him convicted a second time.",
      "relationKind": "dynamic",
      "idealTerms": [
        "class struggle",
        "an imperialist war"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-the-state-s-answer",
      "term": "the state's answer",
      "clusters": [
        0,
        2
      ],
      "fact": "Both convictions share the same shape: in 1894 the federal government intervened on the side of a company against its own striking workers, and in 1918 it did the same on the side of a war against a man who refused to support it -- Debs's own two imprisonments make the same argument, twenty-four years apart, about whose interests the state actually protects when it comes down to it.",
      "relationKind": "cross-cutting"
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
