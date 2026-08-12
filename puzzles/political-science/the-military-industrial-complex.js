// Generated from content/puzzles/the-military-industrial-complex.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-military-industrial-complex",
  "title": "The Military-Industrial Complex",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "History & Society"
  ],
  "tags": [
    "speech",
    "war"
  ],
  "info": {
    "text": "Dwight Eisenhower's warning that a permanent alliance between the armed forces and the arms industry -- and a parallel one between government funding and scientific research -- could quietly acquire more influence over American life than any citizen ever voted for.",
    "link": "wiki:Dwight D. Eisenhower's farewell address",
    "citations": [
      {
        "title": "Farewell Address to the Nation",
        "author": "Eisenhower, Dwight D.",
        "year": "1961"
      }
    ]
  },
  "relatedPuzzles": {
    "entries": [
      {
        "id": "power-without-a-center",
        "via": [
          "power",
          "institutions"
        ],
        "reason": "Eisenhower names a specific, growing danger with an address and a warning label; Foucault argues modern power has no such single address at all -- reading them together raises the real question of where, if anywhere, power like this can still be located and resisted."
      }
    ]
  },
  "lenses": [
    {
      "id": "a-historical-break",
      "prompt": "Which concepts does Eisenhower explicitly frame as historically new -- a genuine break from America's past -- rather than a timeless virtue or an old, recurring danger?",
      "explanation": "Eisenhower's speech turns on a claim about historical rupture: for most of American history the country kept no standing arms industry and no permanent military establishment on this scale, and it's specifically this novelty -- not war, industry, or science in the abstract -- that he says demands a new kind of vigilance. Balance and an alert citizenry, by contrast, are old civic virtues he's calling back into service, not new threats.",
      "targets": [
        "permanent armaments industry",
        "defense spending",
        "military-industrial complex",
        "total influence",
        "scientific-technological elite"
      ]
    },
    {
      "id": "the-proposed-remedy",
      "prompt": "Which concepts name the safeguard Eisenhower proposes, rather than a danger he warns against?",
      "explanation": "Balance and an alert citizenry are the same proposed remedy operating at two scales -- a general civic virtue, and a specific act of restraint aimed at meshing the machinery of defense with peaceful goals. Neither is a description of a danger; both are what Eisenhower asks of the people who have to live with one.",
      "targets": [
        "alert and knowledgeable citizenry",
        "balance",
        "proper meshing"
      ]
    }
  ],
  "clusters": [
    {
      "id": "an-industry-new-to-america",
      "name": "An Industry New to America",
      "color": "olive",
      "fact": "Eisenhower opens by noting something historically new: before this era, the United States kept no permanent armaments industry, relying instead on wartime improvisation -- converting civilian 'makers of plowshares' into makers of swords as needed -- but the Cold War, he argues, no longer permits that improvisation, so a standing arms industry and a new scale of defense spending have become permanent fixtures of American life.",
      "terms": [
        "permanent armaments industry",
        "wartime improvisation",
        "defense spending"
      ],
      "seeds": [
        "permanent armaments industry",
        "wartime improvisation"
      ],
      "info": {
        "text": "Eisenhower's premise: for most of American history the country had no standing arms industry, but the Cold War made a permanent one seem unavoidable.",
        "link": "wiki:Arms industry"
      }
    },
    {
      "id": "military-industrial-complex",
      "name": "The Military-Industrial Complex",
      "color": "magenta",
      "fact": "Eisenhower names the conjunction of an immense military establishment and a large arms industry the military-industrial complex, warns that government must guard against its unwarranted influence, and describes its total influence -- economic, political, even spiritual -- as already felt in every city, every statehouse, and every federal office; the potential for a disastrous rise of misplaced power, he says, exists and will persist.",
      "terms": [
        "military-industrial complex",
        "unwarranted influence",
        "misplaced power",
        "total influence"
      ],
      "seeds": [
        "military-industrial complex",
        "unwarranted influence"
      ],
      "termInfo": {
        "military-industrial complex": {
          "text": "Eisenhower's own term for the conjunction of an immense military establishment and a large, permanent arms industry -- and the specific danger of unchecked influence that conjunction creates.",
          "link": "wiki:Military–industrial complex"
        }
      },
      "info": {
        "text": "Eisenhower's central warning: an alliance between the armed forces and the arms industry has become powerful enough to be felt, in his words, in every city, every statehouse, and every federal office.",
        "link": "wiki:Military–industrial complex"
      }
    },
    {
      "id": "the-scientific-technological-elite",
      "name": "The Scientific-Technological Elite",
      "color": "teal",
      "fact": "Eisenhower pairs his famous warning about arms and industry with a second, less-quoted one: as research grows costlier and increasingly funded by the federal government, the solitary inventor tinkering alone gives way to organized task forces of scientists, a government contract risks substituting for a researcher's own intellectual curiosity, and public policy itself risks becoming captive to a scientific-technological elite.",
      "terms": [
        "scientific-technological elite",
        "federal research funding",
        "solitary inventor"
      ],
      "seeds": [
        "scientific-technological elite",
        "federal research funding"
      ],
      "termInfo": {
        "scientific-technological elite": {
          "text": "Eisenhower's own phrase for a class of scientists and technical experts whose influence over government research funding could let them capture public policy, much as arms manufacturers might capture defense policy.",
          "link": "wiki:Technocracy"
        }
      },
      "info": {
        "text": "Eisenhower's second, less-quoted warning: that as scientific research becomes centralized and government-funded, public policy risks capture by a new kind of elite, just as surely as it risks capture by arms manufacturers."
      }
    },
    {
      "id": "balance-and-the-citizens-check",
      "name": "Balance and the Citizen's Check",
      "color": "brown",
      "fact": "Eisenhower's remedy for both dangers is the same: balance -- between the private and public economy, the necessary and the merely desirable, the present moment and the future -- upheld by an alert and knowledgeable citizenry, since mortgaging the future to serve the present risks the next generation's political and spiritual inheritance along with its material one.",
      "terms": [
        "alert and knowledgeable citizenry",
        "balance",
        "mortgaging the future"
      ],
      "seeds": [
        "alert and knowledgeable citizenry",
        "balance"
      ],
      "termInfo": {
        "mortgaging the future": {
          "text": "Spending or risking the next generation's resources and freedoms to solve today's problems -- Eisenhower's warning that balance must hold across time, not just among competing programs.",
          "link": "wiki:Intergenerational equity"
        }
      },
      "info": {
        "text": "Eisenhower's proposed safeguard against both dangers: a citizenry alert enough to demand balance, including balance across time."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-immense-military-establishment",
      "term": "immense military establishment",
      "clusters": [
        0,
        1
      ],
      "fact": "The permanent armaments industry Eisenhower calls historically new pairs with an equally new, permanent military establishment to form the conjunction he names the military-industrial complex -- neither the industry nor the establishment alone is the danger he's naming; it's their combination.",
      "relationKind": "foundation",
      "idealTerms": [
        "permanent armaments industry",
        "military-industrial complex"
      ]
    },
    {
      "id": "bridge-the-technological-revolution",
      "term": "the technological revolution",
      "clusters": [
        1,
        2
      ],
      "fact": "Eisenhower ties both of his warnings to one shared root: a technological revolution in defense research is what gave the military-industrial complex its modern scale, and that same revolution is what now risks letting a scientific-technological elite capture public policy in turn.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "scientific-technological elite"
      ]
    },
    {
      "id": "bridge-proper-meshing",
      "term": "proper meshing",
      "clusters": [
        3,
        1
      ],
      "fact": "Eisenhower's proposed check on the military-industrial complex is civic rather than institutional: only an alert and knowledgeable citizenry, he argues, can compel the proper meshing of the huge industrial and military machinery of defense with the nation's peaceful methods and goals.",
      "relationKind": "dynamic",
      "idealTerms": [
        "alert and knowledgeable citizenry",
        "unwarranted influence"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
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
