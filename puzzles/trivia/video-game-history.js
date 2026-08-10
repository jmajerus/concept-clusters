// Concept Clusters puzzle: Video Game History
// Platform and era groupings establish a quick visual timeline; the
// pre-solved quiz asks about the creative history within it.

export default {
  id: "video-game-history",
  title: "Video Game History",
  category: "Trivia",
  large: true,
  preSolve: true,
  info: {
    text: "Four chapters in video game history, from coin-operated breakthroughs to modern console worlds.",
    citations: [
      {
        title: "Donkey Kong",
        publisher: "The Strong National Museum of Play",
        year: "2021",
        url: "https://www.museumofplay.org/games/donkey-kong/"
      },
      {
        title: "Myst",
        publisher: "The Strong National Museum of Play",
        year: "2024",
        url: "https://www.museumofplay.org/games/myst/"
      },
      {
        title: "Space Invaders",
        publisher: "The Strong National Museum of Play",
        year: "2021",
        url: "https://www.museumofplay.org/games/space-invaders/"
      }
    ]
  },
  clusters: [
    {
      name: "Arcade Breakthroughs",
      color: "teal",
      fact: "Arcade hits taught a mass audience the grammar of real-time play: simple controls, escalating challenge, high scores, and instantly recognizable characters.",
      terms: [
        "Space Invaders",
        "Pac-Man",
        "Donkey Kong",
        "Street Fighter II"
      ],
      seeds: ["Space Invaders", "Pac-Man"]
    },
    {
      name: "Nintendo Adventures",
      color: "blue",
      fact: "Nintendo's home-console series made exploration, character movement, and secrets central to long-lived game worlds.",
      terms: [
        "Super Mario Bros.",
        "The Legend of Zelda",
        "Metroid",
        "Pokémon Red and Blue"
      ],
      seeds: ["Super Mario Bros.", "The Legend of Zelda"]
    },
    {
      name: "Computer Game Landmarks",
      color: "amber",
      fact: "Personal computers supported distinctive forms of play, including simulation, environmental puzzles, fast first-person action, and real-time strategy.",
      terms: [
        "SimCity",
        "Myst",
        "Doom",
        "StarCraft"
      ],
      seeds: ["SimCity", "Doom"]
    },
    {
      name: "Modern Console Worlds",
      color: "magenta",
      fact: "Twenty-first-century console blockbusters expanded cinematic storytelling, online multiplayer, motion control, and freely explorable cities.",
      terms: [
        "Grand Theft Auto III",
        "Halo: Combat Evolved",
        "Wii Sports",
        "The Last of Us"
      ],
      seeds: ["Grand Theft Auto III", "Halo: Combat Evolved"]
    }
  ],
  bridges: [],
  lensMode: "quiz",
  lenses: [
    {
      id: "jumpman",
      prompt: "Which game introduced the character later known as Mario, while he was still called Jumpman?",
      options: [
        {
          id: "donkey-kong",
          label: "Donkey Kong",
          targets: ["Donkey Kong"],
          correct: true
        },
        {
          id: "pac-man",
          label: "Pac-Man",
          targets: ["Pac-Man"]
        },
        {
          id: "super-mario-bros",
          label: "Super Mario Bros.",
          targets: ["Super Mario Bros."]
        },
        {
          id: "street-fighter-ii",
          label: "Street Fighter II",
          targets: ["Street Fighter II"]
        }
      ],
      explanation:
        "Shigeru Miyamoto created Donkey Kong in 1981. Its hero was initially called Jumpman; Nintendo of America later named him Mario."
    },
    {
      id: "miller-brothers",
      prompt: "Which atmospheric puzzle game was created by brothers Robyn and Rand Miller?",
      options: [
        {
          id: "myst",
          label: "Myst",
          targets: ["Myst"],
          correct: true
        },
        {
          id: "simcity",
          label: "SimCity",
          targets: ["SimCity"]
        },
        {
          id: "doom",
          label: "Doom",
          targets: ["Doom"]
        },
        {
          id: "starcraft",
          label: "StarCraft",
          targets: ["StarCraft"]
        }
      ],
      explanation:
        "Robyn and Rand Miller created Myst at Cyan. Its exploratory island worlds, embedded puzzles, rendered imagery, and use of CD-ROM helped it reach audiences beyond established computer-game players."
    },
    {
      id: "japan-1978",
      prompt: "Which displayed game was designed by Tomohiro Nishikado and released in Japan in 1978?",
      options: [
        {
          id: "space-invaders",
          label: "Space Invaders",
          targets: ["Space Invaders"],
          correct: true
        },
        {
          id: "pac-man-1978",
          label: "Pac-Man",
          targets: ["Pac-Man"]
        },
        {
          id: "donkey-kong-1978",
          label: "Donkey Kong",
          targets: ["Donkey Kong"]
        },
        {
          id: "street-fighter-1978",
          label: "Street Fighter II",
          targets: ["Street Fighter II"]
        }
      ],
      explanation:
        "Taito released Tomohiro Nishikado's Space Invaders in Japan in 1978. Its runaway success helped propel video games into mainstream popular culture."
    }
  ]
};
