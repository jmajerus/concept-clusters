// Concept Clusters puzzle: Film Classics
// Prototype for the "quiz" lensMode and for preSolve (see docs/Concept
// Lenses.md, "Quiz lenses" and "Author-forced pre-solve"). Lives under
// category "Trivia", not "Film": the facts here (cast/director credits)
// are drawn from general film-history knowledge, not independently
// verified against a primary source the way this project's other puzzles
// cite one via info.link -- deliberately no wiki: links here until that
// verification happens. Spot-check before treating this as real, citable
// content. That unverified-recall character is exactly what "Trivia"
// means as a category, rather than a gap to fix.

export default {
  id: "film-classics",
  title: "Film Classics",
  category: "Trivia",
  large: true,
  // Demonstrates preSolve: the genre sort here is a foregone conclusion
  // once the films are named, so the trivia question is the actual point
  // -- see the doc section above for why this stays a rare, explicit
  // exception rather than a default.
  preSolve: true,
  info: {
    text: "Four genres that defined classic Hollywood, told through representative films from each."
  },
  clusters: [
    {
      name: "Film Noir",
      color: "teal",
      fact: "Film noir used high-contrast lighting, morally ambiguous leads, and fatalistic plots to dramatize postwar anxiety.",
      terms: [
        "The Maltese Falcon",
        "Double Indemnity",
        "The Big Sleep",
        "Sunset Boulevard"
      ],
      seeds: ["The Maltese Falcon", "Double Indemnity"]
    },
    {
      name: "Western",
      color: "blue",
      fact: "The classic Western dramatized westward expansion as heroic order emerging from lawlessness -- a mythology film criticism has long scrutinized for minimizing the era's real violence against Native peoples, sometimes by the genre's own most celebrated films.",
      terms: [
        "Stagecoach",
        "High Noon",
        "Red River",
        "The Searchers"
      ],
      seeds: ["Stagecoach", "High Noon"],
      termInfo: {
        "The Searchers": {
          text: "Widely read by film scholars as interrogating the racial obsession it depicts through Ethan Edwards rather than simply endorsing it -- though the genre around it has just as often done the opposite."
        }
      }
    },
    {
      name: "Screwball Comedy",
      color: "amber",
      fact: "Screwball comedies paired fast, overlapping dialogue with class-crossing romance and reversed gender expectations.",
      terms: [
        "It Happened One Night",
        "Bringing Up Baby",
        "Ball of Fire",
        "The Philadelphia Story"
      ],
      seeds: ["It Happened One Night", "Bringing Up Baby"]
    },
    {
      name: "Musical",
      color: "magenta",
      fact: "The Golden Age musical integrated song and dance directly into the story rather than staging them as separate numbers.",
      terms: [
        "The Wizard of Oz",
        "Meet Me in St. Louis",
        "Singin' in the Rain",
        "An American in Paris"
      ],
      seeds: ["The Wizard of Oz", "Singin' in the Rain"]
    }
  ],
  // The two genuine bridges form a 0-1-2 chain. Musical intentionally
  // remains a separate graph component: there is no third relationship
  // here worth manufacturing solely to make the topology connected.
  // Cluster indices are sequential rather than skipping over a cluster
  // because Circle mode can arrange this shape especially cleanly. See
  // tests/bridge-optional.mjs for the cross-mode disconnected-layout
  // regression.
  bridges: [
    {
      term: "Howard Hawks",
      clusters: [1, 2],
      relationKind: "dynamic",
      fact: "One director working comfortably across genres: Howard Hawks made a defining Western and a defining screwball comedy within the same decade.",
      idealTerms: ["Red River", "Ball of Fire"],
      info: {
        text: "A director whose filmography spans genres most contemporaries specialized within, including Red River and Ball of Fire."
      }
    }
  ],
  // A preSolve puzzle skips clustering entirely, so lenses are the whole
  // game, not a bonus round after one -- three rounds here, ordered so the
  // third deliberately contradicts an answer the second just established
  // (Wayne wins "most in one genre" but loses "spans the most genres"),
  // rather than three unrelated trivia questions in a row.
  lensMode: "quiz",
  lenses: [
    {
      id: "director-not-shown",
      prompt: "Which of the following directors did not direct any film shown above?",
      options: [
        {
          id: "howard-hawks",
          label: "Howard Hawks",
          targets: ["Ball of Fire", "Red River"]
        },
        {
          id: "john-ford",
          label: "John Ford",
          targets: ["Stagecoach", "The Searchers"]
        },
        {
          id: "billy-wilder",
          label: "Billy Wilder",
          targets: ["Double Indemnity", "Sunset Boulevard"]
        },
        {
          id: "dorothy-arzner",
          label: "Dorothy Arzner",
          targets: [],
          correct: true
        }
      ],
      explanation:
        "Howard Hawks directed Ball of Fire and Red River, John Ford directed Stagecoach and The Searchers, and Billy Wilder directed Double Indemnity and Sunset Boulevard -- all real credits among the films shown. Dorothy Arzner, the most prominent woman directing in the Hollywood studio system through the 1930s (Christopher Strong, Dance, Girl, Dance, and others), directed none of these -- her studio-era career largely wound down before this board's titles were made."
    },
    {
      id: "most-single-genre-appearances",
      prompt: "Which of the following actors appears in the most films from a single genre shown above?",
      options: [
        {
          id: "john-wayne-single",
          label: "John Wayne",
          targets: ["Stagecoach", "Red River", "The Searchers"],
          correct: true
        },
        {
          id: "katharine-hepburn-single",
          label: "Katharine Hepburn",
          targets: ["Bringing Up Baby", "The Philadelphia Story"]
        },
        {
          id: "judy-garland-single",
          label: "Judy Garland",
          targets: ["The Wizard of Oz", "Meet Me in St. Louis"]
        },
        {
          id: "humphrey-bogart-single",
          label: "Humphrey Bogart",
          targets: ["The Maltese Falcon", "The Big Sleep"]
        }
      ],
      explanation:
        "John Wayne appears in three Westerns here -- Stagecoach, Red River, and The Searchers -- more single-genre appearances than any other option's two."
    },
    {
      id: "most-genre-spanning-actor",
      prompt: "Which of the following actors appears in films from the most different genres shown above?",
      options: [
        {
          id: "gary-cooper",
          label: "Gary Cooper",
          targets: ["Ball of Fire", "High Noon"],
          correct: true
        },
        {
          id: "john-wayne",
          label: "John Wayne",
          targets: ["Stagecoach", "Red River", "The Searchers"]
        },
        {
          id: "katharine-hepburn",
          label: "Katharine Hepburn",
          targets: ["Bringing Up Baby", "The Philadelphia Story"]
        },
        {
          id: "judy-garland",
          label: "Judy Garland",
          targets: ["The Wizard of Oz", "Meet Me in St. Louis"]
        }
      ],
      explanation:
        "Gary Cooper starred in Ball of Fire (Screwball Comedy) and High Noon (Western) -- two genres. Every other option has more total film appearances within a single genre, but none spans a second one: John Wayne has three Westerns, Hepburn two screwball comedies, Garland two musicals."
    }
  ]
};
