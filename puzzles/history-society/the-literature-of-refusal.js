// Generated from content/puzzles/the-literature-of-refusal.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-literature-of-refusal",
  "title": "The Literature of Refusal",
  "category": "History & Society",
  "categories": [
    "History & Society",
    "Political Science"
  ],
  "tags": [
    "book",
    "war",
    "poetry"
  ],
  "info": {
    "text": "A landscape of the written case against war -- profiteering pamphlets, front-line poetry, absurdist satire, and firsthand testimony -- spanning more than a century of writers who refused to let war's violence go unnamed."
  },
  "lenses": [
    {
      "id": "the-reframing-phrase",
      "prompt": "Which of these are remembered above all for a single blunt phrase that reframes how war gets talked about, rather than for a sustained story?",
      "explanation": "Butler didn't argue that war has costs -- he renamed it a 'racket.' Engelbrecht and Hanighen didn't just document the arms trade -- they renamed its dealers 'merchants of death.' Bourne compressed wartime state power into a single paradox: 'war is the health of the state.' And Owen's whole poem builds toward one verdict on patriotic rhetoric -- 'the old Lie.' Each of these is remembered less for its narrative than for the line that did the unmasking.",
      "targets": [
        "War Is a Racket",
        "Merchants of Death",
        "War is the health of the State",
        "Dulce et Decorum Est"
      ]
    },
    {
      "id": "the-system-that-wont-answer",
      "prompt": "Which of these turn on a system that cannot or will not actually respond to a legitimate claim -- answering not with truth, but with paradox, absurdity, or a diagnosis?",
      "explanation": "Bourne argues this is structural: a state at war cannot afford to let dissent be heard as a political claim at all. Sassoon's own case proves it -- the army didn't answer his argument, it declared him unfit for duty instead. Heller names the same trap directly: Catch-22 is a rule that makes its own contradiction airtight. And Švejk's endless, guileless compliance works precisely because the military bureaucracy has no way to process someone who never breaks a rule while accomplishing nothing -- it can only spin, not respond.",
      "targets": [
        "War is the health of the State",
        "Catch-22",
        "The Good Soldier Švejk",
        "A Soldier's Declaration"
      ]
    }
  ],
  "clusters": [
    {
      "id": "profit-and-power",
      "name": "Profit and Power",
      "color": "olive",
      "fact": "These three don't just criticize war -- they follow the money and the power. Butler names the corporations that profited from the war he fought in; Engelbrecht and Hanighen's expose of the international arms trade helped provoke a Senate investigation into it; and Bourne argues the deepest profit isn't financial at all, but the vast, temporary power a state seizes over its own citizens once it declares war.",
      "terms": [
        "War Is a Racket",
        "War is the health of the State",
        "Merchants of Death"
      ],
      "seeds": [
        "War Is a Racket",
        "War is the health of the State"
      ],
      "termInfo": {
        "Merchants of Death": {
          "text": "A 1934 investigative book on the international arms trade that helped provoke the Senate's Nye Committee hearings into WWI munitions profits.",
          "link": "https://mises.org/books/merchantsofdeath.pdf"
        },
        "War Is a Racket": {
          "text": "Smedley Butler's 1935 pamphlet, written by a retired Marine Corps major general and two-time Medal of Honor recipient.",
          "link": "wiki:War Is a Racket"
        },
        "War is the health of the State": {
          "text": "The opening line of Randolph Bourne's unfinished 1918 essay 'The State,' written as wartime laws criminalized public dissent.",
          "link": "https://www.marxists.org/archive/bourne/1918/war-is-the-health-of-the-state.html"
        }
      }
    },
    {
      "id": "the-bodys-testimony",
      "name": "The Body's Testimony",
      "color": "brown",
      "fact": "Trumbo, Owen, and Remarque each refuse to let the reader stay at a comfortable distance from what a shell actually does to a human body -- Owen wrote his poem from a hospital bed for shell shock, and Remarque's novel is now so closely identified with the war's physical horror that its title has become shorthand for trench warfare itself.",
      "terms": [
        "All Quiet on the Western Front",
        "Johnny Got His Gun",
        "Dulce et Decorum Est"
      ],
      "seeds": [
        "All Quiet on the Western Front",
        "Johnny Got His Gun"
      ],
      "termInfo": {
        "All Quiet on the Western Front": {
          "text": "Erich Maria Remarque's 1929 novel of German soldiers on the WWI front, drawn from his own service.",
          "link": "wiki:All Quiet on the Western Front"
        },
        "Dulce et Decorum Est": {
          "text": "Wilfred Owen's 1917 poem, drafted at Craiglockhart War Hospital, describing a gas attack in unflinching physical detail.",
          "link": "wiki:Dulce et Decorum est"
        },
        "Johnny Got His Gun": {
          "text": "Dalton Trumbo's 1939 novel, narrated by a WWI soldier who has lost his arms, legs, and entire face to a shell blast.",
          "link": "wiki:Johnny Got His Gun"
        }
      }
    },
    {
      "id": "the-absurdist-indictment",
      "name": "The Absurdist Indictment",
      "color": "magenta",
      "fact": "Heller and Vonnegut are both working in a tradition Hašek established decades earlier: instead of describing war's horror directly, all three make its bureaucratic logic look so insane that description becomes unnecessary -- the institution indicts itself.",
      "terms": [
        "Catch-22",
        "Slaughterhouse-Five",
        "The Good Soldier Švejk"
      ],
      "seeds": [
        "Catch-22",
        "Slaughterhouse-Five"
      ],
      "termInfo": {
        "Catch-22": {
          "text": "Joseph Heller's 1961 satirical novel, drawn from his own service as a WWII bombardier.",
          "link": "wiki:Catch-22"
        },
        "Slaughterhouse-Five": {
          "text": "Kurt Vonnegut's 1969 novel, built from his own experience as a POW who survived the firebombing of Dresden.",
          "link": "wiki:Slaughterhouse-Five"
        },
        "The Good Soldier Švejk": {
          "text": "Jaroslav Hašek's unfinished 1921-1923 Czech satire, following a soldier whose relentless, guileless incompetence quietly sabotages the Austro-Hungarian war machine.",
          "link": "wiki:The Good Soldier Švejk"
        }
      }
    },
    {
      "id": "grief-and-the-long-return",
      "name": "Grief and the Long Return",
      "color": "blue",
      "fact": "None of these three is a battlefield account written in the moment -- O'Brien and Brittain are both reconstructing loss from years of distance, and Sassoon's declaration wasn't published as literature at all, but as an active-duty officer's public act of defiance, for which the military's answer was to declare him mentally unfit rather than hear his argument.",
      "terms": [
        "The Things They Carried",
        "Testament of Youth",
        "A Soldier's Declaration"
      ],
      "seeds": [
        "The Things They Carried",
        "Testament of Youth"
      ],
      "termInfo": {
        "A Soldier's Declaration": {
          "text": "Siegfried Sassoon's 1917 public letter refusing to return to combat, read into the record of the House of Commons.",
          "link": "https://ww1.nam.ac.uk/stories/captain-siegfried-sassoon/"
        },
        "Testament of Youth": {
          "text": "Vera Brittain's 1933 memoir of serving as a nurse through WWI, in which she lost her fiance, brother, and closest friends.",
          "link": "wiki:Testament of Youth"
        },
        "The Things They Carried": {
          "text": "Tim O'Brien's 1990 collection of linked, semi-fictionalized stories drawn from his own service in Vietnam.",
          "link": "wiki:The Things They Carried"
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-craiglockhart",
      "term": "Craiglockhart",
      "clusters": [
        3,
        1
      ],
      "fact": "Owen drafted and revised 'Dulce et Decorum Est' at Craiglockhart War Hospital, where he was being treated for shell shock -- and where he met fellow patient Siegfried Sassoon, already a decorated officer and published poet, who mentored him and helped sharpen the poem's fury.",
      "termRole": "reference",
      "relationKind": "dynamic",
      "info": {
        "text": "The Scottish military hospital for shell-shocked officers where Sassoon and Owen met.",
        "link": "wiki:Craiglockhart"
      },
      "idealTerms": [
        "A Soldier's Declaration",
        "Dulce et Decorum Est"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 1
      }
    },
    {
      "id": "bridge-shell-shock",
      "term": "shell shock",
      "clusters": [
        0,
        3
      ],
      "fact": "Bourne argues a wartime state cannot afford to let dissent be heard as a political argument -- and Sassoon's case shows exactly that mechanism at work: rather than court-martial a decorated officer for refusing to fight, a medical board declared him unfit for duty due to shell shock, converting a political claim into a medical one instead of answering it.",
      "termRole": "reference",
      "relationKind": "dynamic",
      "info": {
        "text": "The WWI-era term for the psychological trauma of combat, and the diagnosis a military medical board used to explain away Sassoon's protest.",
        "link": "wiki:Shell shock"
      },
      "idealTerms": [
        "War is the health of the State",
        "A Soldier's Declaration"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "edited",
      "provider": "Anthropic",
      "date": "2026-08-13"
    }
  ]
});
