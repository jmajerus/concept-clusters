// Generated from content/puzzles/out-of-the-spotlight.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "out-of-the-spotlight",
  "title": "Out of the Spotlight",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "History & Society"
  ],
  "info": {
    "text": "Bayard Rustin, raised Quaker, the chief organizer behind the 1963 March on Washington and the man who brought Gandhian nonviolence into the American civil rights movement, whose Communist youth, wartime draft resistance, and open homosexuality were repeatedly turned into weapons to keep him out of the movement's own spotlight.",
    "link": "wiki:Bayard Rustin"
  },
  "lenses": [
    {
      "id": "what-he-did",
      "prompt": "Which of these are specific actions Rustin chose to take, rather than something that happened to him or was said about him?",
      "explanation": "Refusing to report for military service, launching the Journey of Reconciliation, and organizing the March on Washington are all things Rustin actively did -- decisions and actions he chose and carried out -- rather than things that happened to him or accusations made against him by someone else.",
      "targets": [
        "refusing to report",
        "the Journey of Reconciliation",
        "the March on Washington"
      ],
      "reasons": {
        "refusing to report": "A deliberate choice to refuse military service, not something imposed on him.",
        "the Journey of Reconciliation": "A direct action he and George Houser designed and carried out to test a Supreme Court ruling.",
        "the March on Washington": "The demonstration he built, logistical detail by logistical detail, over months of organizing."
      }
    },
    {
      "id": "what-was-done-to-him",
      "prompt": "Which of these were imposed on Rustin by others, rather than something he chose or did himself?",
      "explanation": "Powell's threat, the 1953 morals charge, and credit not given were all imposed on Rustin by others, not choices he made: an arrest used against him, a congressman's threat that forced his resignation, and a march where his own central role was deliberately kept out of the spotlight even as it succeeded.",
      "targets": [
        "Powell's threat",
        "the 1953 morals charge",
        "credit not given"
      ],
      "reasons": {
        "Powell's threat": "A threat made against him by someone else, not something he chose or did.",
        "credit not given": "The public visibility Randolph received instead of Rustin, a consequence of others' choices, not his own.",
        "the 1953 morals charge": "An arrest and prosecution imposed on him by the state."
      }
    }
  ],
  "clusters": [
    {
      "id": "building-nonviolent-practice",
      "name": "Building Nonviolent Practice",
      "color": "teal",
      "fact": "Rustin's nonviolent method was assembled, not inherited whole: refusing to report for WWII military service earned him 28 months in a federal penitentiary, where he organized a Free India Committee and read deeply in Krishnalal Shridharani's War Without Violence. Released in 1946, he and George Houser tested a Supreme Court desegregation ruling directly with the 1947 Journey of Reconciliation, an early rehearsal for the Freedom Rides fourteen years later.",
      "terms": [
        "refusing to report",
        "the Journey of Reconciliation",
        "War Without Violence",
        "the Free India Committee"
      ],
      "seeds": [
        "refusing to report",
        "the Journey of Reconciliation"
      ],
      "termInfo": {
        "refusing to report": {
          "link": "wiki:Conscientious objector"
        }
      },
      "info": {
        "text": "Rustin's two-decade apprenticeship in nonviolent direct action, built through prison organizing, close study of Gandhian theory, and a direct 1947 test of interstate bus desegregation.",
        "link": "wiki:Journey of Reconciliation"
      }
    },
    {
      "id": "organizing-the-march",
      "name": "Organizing the March",
      "color": "olive",
      "fact": "In 1963 Randolph tapped Rustin, by then a twenty-year veteran organizer, to build the March on Washington from the ground up: transportation, sound, marshals, permits, sanitation, all coordinated with such meticulous logistics that colleagues later said he seemed to be everywhere on the march at once, turning it into the biggest demonstration the country had yet seen.",
      "terms": [
        "A. Philip Randolph",
        "the March on Washington",
        "meticulous logistics",
        "the biggest demonstration yet"
      ],
      "seeds": [
        "A. Philip Randolph",
        "the March on Washington"
      ],
      "termInfo": {
        "A. Philip Randolph": {
          "link": "wiki:A. Philip Randolph"
        }
      },
      "info": {
        "text": "Rustin's organizational masterpiece: building the largest demonstration the country had yet seen in under two months, at Randolph's direct request.",
        "link": "wiki:March on Washington for Jobs and Freedom"
      }
    },
    {
      "id": "visibility-and-its-costs",
      "name": "Visibility and Its Costs",
      "color": "magenta",
      "fact": "Rustin's biography kept being turned into ammunition against the movement he helped build: a youthful stint in the Young Communist League, broken off once it prioritized the Soviet Union over civil rights, an arrest on a 1953 morals charge, and Congressman Adam Clayton Powell's 1960 threat to falsely claim Rustin and King were lovers -- which got Rustin forced to resign from the SCLC -- became separate reasons for the same result: keeping the movement's most effective organizer out of its own spotlight.",
      "terms": [
        "the 1953 morals charge",
        "forced to resign",
        "Powell's threat",
        "Thurmond's floor speech",
        "the Young Communist League"
      ],
      "seeds": [
        "the 1953 morals charge",
        "forced to resign"
      ],
      "info": {
        "text": "The recurring cost of Rustin's visibility: his sexuality, his broken-off Communist youth, and the political attacks both repeatedly enabled, even from within the movement he helped lead.",
        "link": "wiki:Bayard Rustin"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-one-attack-three-facts",
      "term": "one attack, three facts",
      "clusters": [
        0,
        2
      ],
      "fact": "When Strom Thurmond rose on the Senate floor to call Rustin 'a homosexual, a draft-dodger, and a member of the Communist Party,' he fused three separate, otherwise unconnected facts about Rustin's life -- his wartime refusal to report for service, his sexuality, and his broken-off youth in the Young Communist League -- into a single calculated smear, aimed less at Rustin's actual biography than at discrediting the march he had just built.",
      "relationKind": "cross-cutting"
    },
    {
      "id": "bridge-twenty-years-of-practice",
      "term": "twenty years of practice",
      "clusters": [
        0,
        1
      ],
      "fact": "The march's meticulous logistics were not improvised: Rustin brought twenty years of organizing craft to it, going back through the Journey of Reconciliation to the prison organizing that came even before that -- practical experience accumulated over two decades before it was ever put to use on the biggest stage of his career.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-credit-not-given",
      "term": "credit not given",
      "clusters": [
        2,
        1
      ],
      "fact": "Even at his career's high point, the same vulnerabilities shaped how the march itself was staged: Randolph, not Rustin, received the public credit and visibility, a direct consequence of the Communist past, morals charge, and Powell's threat that had already forced Rustin out of the spotlight once before.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
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
