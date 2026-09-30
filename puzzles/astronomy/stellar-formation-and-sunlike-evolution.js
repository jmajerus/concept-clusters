// Generated from content/puzzles/stellar-formation-and-sunlike-evolution.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "stellar-formation-and-sunlike-evolution",
  "title": "Star Formation and the Sun-like Path",
  "category": "astronomy",
  "large": true,
  "info": {
    "text": "A star's story begins with gravitational collapse, settles into a long hydrogen-burning equilibrium, and then changes once its core fuel runs out. This board follows the common formation and main-sequence phases into the low- and intermediate-mass path that ends with a planetary nebula and a cooling white dwarf.",
    "citations": [
      {
        "title": "Stars",
        "author": "NASA Science",
        "publisher": "National Aeronautics and Space Administration",
        "url": "https://science.nasa.gov/universe/stars/"
      },
      {
        "title": "The H–R Diagram and the Study of Stellar Evolution",
        "author": "Andrew Fraknoi, David Morrison, and Sidney Wolff",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/astronomy-2e/pages/21-2-the-h-r-diagram-and-the-study-of-stellar-evolution"
      },
      {
        "title": "Evolution from the Main Sequence to Red Giants",
        "author": "Andrew Fraknoi, David Morrison, and Sidney Wolff",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/astronomy-2e/pages/22-1-evolution-from-the-main-sequence-to-red-giants"
      },
      {
        "title": "Further Evolution of Stars",
        "author": "Andrew Fraknoi, David Morrison, and Sidney Wolff",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/astronomy-2e/pages/22-4-further-evolution-of-stars"
      },
      {
        "title": "The Death of Low-Mass Stars",
        "author": "Andrew Fraknoi, David Morrison, and Sidney Wolff",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/astronomy-2e/pages/23-1-the-death-of-low-mass-stars"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-formation",
      "name": "Formation: from cloud to protostar",
      "color": "teal",
      "fact": "Stars begin in cold molecular clouds. Gravity gathers and collapses dense pockets; the infalling material heats into a protostar, often surrounded by an accretion disk and born in a stellar nursery.",
      "terms": [
        "molecular cloud",
        "protostar",
        "gravitational collapse",
        "accretion disk",
        "stellar nursery"
      ],
      "seeds": [
        "molecular cloud",
        "protostar"
      ],
      "termInfo": {
        "molecular cloud": "A cold, dense cloud of gas and dust whose pockets can collapse under gravity and supply the raw material for stars.",
        "protostar": "A contracting young stellar object heated mainly by gravitational collapse before sustained core hydrogen fusion begins.",
        "gravitational collapse": "The inward fall of gas under its own gravity; compression heats the forming star.",
        "accretion disk": "A rotating disk of infalling gas and dust around a forming star; it is part of the birth environment, not a later stellar phase.",
        "stellar nursery": "A star-forming region containing molecular clouds and newly formed stars, often in groups."
      }
    },
    {
      "id": "cluster-main-sequence",
      "name": "Main sequence: fusion in balance",
      "color": "blue",
      "fact": "Once hydrogen fusion begins in the core, its energy supplies pressure that balances gravity: the star settles into hydrostatic equilibrium on the main sequence. Mass controls how rapidly it burns fuel and therefore how long this stable phase lasts.",
      "terms": [
        "main sequence",
        "hydrogen fusion",
        "hydrostatic equilibrium",
        "mass–lifetime relation",
        "hydrogen exhaustion"
      ],
      "seeds": [
        "main sequence",
        "hydrogen fusion"
      ],
      "termInfo": {
        "main sequence": "The long-lived phase in which a star stably fuses hydrogen into helium in its core; the Sun is here.",
        "hydrogen fusion": "Nuclear reactions joining hydrogen nuclei into helium, releasing energy that supports the star.",
        "hydrostatic equilibrium": "The balance between inward gravity and outward pressure from the star's hot interior.",
        "mass–lifetime relation": "More massive stars burn fuel faster, so they are brighter but spend less time on the main sequence.",
        "hydrogen exhaustion": "The depletion of core hydrogen that ends core hydrogen fusion and triggers contraction and expansion into a giant."
      }
    },
    {
      "id": "cluster-sunlike-path",
      "name": "Sun-like stars: giants to a white dwarf",
      "color": "amber",
      "fact": "After core hydrogen runs out, a low- or intermediate-mass star expands into a red giant. Helium ignition and core helium burning briefly restore balance; later shell burning and envelope loss produce a planetary nebula and expose a cooling white dwarf with a carbon–oxygen core.",
      "terms": [
        "red giant",
        "planetary nebula",
        "helium flash",
        "triple-alpha process",
        "core helium burning",
        "asymptotic giant branch",
        "white dwarf"
      ],
      "seeds": [
        "red giant",
        "planetary nebula"
      ],
      "termInfo": {
        "red giant": "A star whose exhausted, contracting core and shell burning drive its outer layers to expand and cool.",
        "planetary nebula": "The glowing shell of gas expelled from a dying low- or intermediate-mass star; despite its name, it is not a planet.",
        "helium flash": "A rapid onset of helium fusion in the degenerate core of a low-mass red giant.",
        "triple-alpha process": "The reaction in which three helium nuclei combine to make carbon at high core temperatures.",
        "core helium burning": "The relatively stable phase in which helium fusion makes carbon and some oxygen in the core.",
        "asymptotic giant branch": "The late giant phase after core helium is exhausted, with hydrogen- and helium-burning shells and strong mass loss.",
        "white dwarf": "The hot, compact carbon–oxygen core left after a Sun-like star sheds its outer layers; it cools without sustained fusion."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-hydrogen-ignition",
      "term": "hydrogen ignition",
      "clusters": [
        0,
        1
      ],
      "fact": "A protostar enters the main sequence when its contracting core becomes hot and dense enough for hydrogen fusion; the released energy then supports the star against gravity.",
      "info": {
        "text": "The arrow marks the one-way handoff from gravitational contraction to a new energy source: hydrogen fusion stabilizes the star and begins its long main-sequence life.",
        "links": [
          {
            "href": "https://science.nasa.gov/universe/stars/"
          }
        ]
      },
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-core-hydrogen-exhaustion",
      "term": "core hydrogen exhaustion",
      "clusters": [
        1,
        2
      ],
      "fact": "When hydrogen fuel is exhausted in the core, central fusion stops, gravity contracts the core, and the outer layers expand and cool into the giant phase.",
      "info": {
        "text": "The arrow marks fuel exhaustion as the trigger for the giant phase: core contraction and shell burning replace stable core hydrogen fusion.",
        "links": [
          {
            "href": "https://openstax.org/books/astronomy-2e/pages/22-1-evolution-from-the-main-sequence-to-red-giants"
          }
        ]
      },
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "from-collapse-to-balance",
      "prompt": "Which concepts together describe the handoff from a contracting protostar to a stable star: the ignition event, the energy-producing process, and the resulting balance?",
      "explanation": "Hydrogen ignition is the event that turns on core fusion; hydrogen fusion is the process releasing the energy; hydrostatic equilibrium is the resulting balance between gravity and pressure. Main sequence names the phase, but not one of the three roles the question asks for.",
      "targets": [
        "hydrogen ignition",
        "hydrogen fusion",
        "hydrostatic equilibrium"
      ],
      "reasons": {
        "hydrogen ignition": "The trigger: the contracting core becomes hot enough for sustained hydrogen fusion.",
        "hydrogen fusion": "The engine: hydrogen nuclei combine into helium and release energy.",
        "hydrostatic equilibrium": "The balance: the released energy provides pressure against gravity."
      }
    },
    {
      "id": "helium-after-hydrogen",
      "prompt": "Which concepts describe helium's role in a Sun-like star's later evolution, rather than its earlier hydrogen-burning phase or its final remnant?",
      "explanation": "A low-mass red giant can begin helium fusion in a rapid helium flash; the triple-alpha process converts helium into carbon, and core helium burning provides a temporary new equilibrium. The red giant is the surrounding stage, while the asymptotic giant branch comes after core helium is exhausted.",
      "targets": [
        "helium flash",
        "triple-alpha process",
        "core helium burning"
      ],
      "reasons": {
        "helium flash": "The rapid onset of helium fusion in a low-mass giant's degenerate core.",
        "triple-alpha process": "The helium-fusion reaction that builds carbon.",
        "core helium burning": "The stable interval in which the core fuses helium into carbon and oxygen."
      }
    },
    {
      "id": "shed-and-survive",
      "prompt": "At the end of the Sun-like path, which two terms distinguish the envelope that leaves from the compact core that remains?",
      "explanation": "A planetary nebula is the expelled outer atmosphere, illuminated by the hot remnant; the white dwarf is the surviving carbon–oxygen core. The two terms describe different outcomes of the same envelope-shedding event.",
      "targets": [
        "planetary nebula",
        "white dwarf"
      ],
      "reasons": {
        "planetary nebula": "The expanding shell of gas lost by the dying star.",
        "white dwarf": "The compact core left behind after the outer layers are gone."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "massive-stars-remnants-and-recycling",
        "reason": "Continue to the massive-star branch, compare the compact remnants it leaves, and see how stellar ejecta seeds later stars."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From gravity to starlight",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Stars are not permanent lights; they are self-gravitating furnaces whose structure changes as their fuel changes. A cold molecular cloud can collapse into a protostar. When its core begins fusing hydrogen, the released energy balances gravity, and the star spends most of its life in a stable hydrogen-burning phase. Mass controls both the rate of fuel use and the pace of change.\r\n\r\nFor a star like the Sun, the end of core hydrogen burning brings giant phases, helium fusion, and the loss of the outer atmosphere. The expelled gas and the surviving compact core are different parts of the same ending: one returns to space, while the other cools as a white dwarf."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (GPT-5.6 Luna)",
        "reasoning": "max"
      }
    ]
  }
});
