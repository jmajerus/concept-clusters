// Concept Clusters puzzle: Popular Music Milestones
// The decades are supplied up front so that the quiz can concentrate on
// production credits and cultural milestones rather than date sorting.

export default {
  id: "popular-music-milestones",
  title: "Popular Music Milestones",
  category: "Trivia",
  large: true,
  preSolve: true,
  info: {
    text: "Landmark albums across five decades, with questions about the people, prizes, and breakthroughs behind them.",
    citations: [
      {
        title: "Michael Jackson's GRAMMY Night 'Thriller': 30 Years Later",
        publisher: "Recording Academy",
        year: "2014",
        url: "https://www.grammy.com/news/30-years-later-michael-jacksons-thrilling-grammy-night/"
      },
      {
        title: "Lauryn Hill Becomes First Rap Artist To Win Album Of The Year",
        publisher: "Recording Academy",
        year: "2022",
        url: "https://www.grammy.com/news/lauryn-hill-album-year-win-miseducation-grammy-rewind-video-speech/"
      },
      {
        title: "DAMN., by Kendrick Lamar",
        publisher: "The Pulitzer Prizes",
        year: "2018",
        url: "https://www.pulitzer.org/winners/kendrick-lamar"
      },
      {
        title: "For The Record: Joni Mitchell's Emotive 1971 Masterpiece, 'Blue'",
        publisher: "Recording Academy",
        year: "2020",
        url: "https://www.grammy.com/news/record-joni-mitchells-emotive-1971-masterpiece-blue/"
      },
      {
        title: "Janet Jackson's 'Rhythm Nation 1814': For The Record",
        publisher: "Recording Academy",
        url: "https://www.grammy.com/news/janet-jacksons-rhythm-nation-1814-record/"
      }
    ]
  },
  clusters: [
    {
      name: "1970s",
      color: "teal",
      fact: "The album era made sustained listening central to popular music, while singer-songwriters, soul auteurs, and glam performers widened what a unified record could express.",
      terms: [
        "What's Going On",
        "Blue",
        "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
        "Songs in the Key of Life"
      ],
      seeds: ["What's Going On", "Blue"]
    },
    {
      name: "1980s",
      color: "blue",
      fact: "Blockbuster albums in the 1980s joined studio craft, star personas, music video, and global distribution into multimedia popular culture.",
      terms: [
        "Thriller",
        "Purple Rain",
        "Like a Prayer",
        "Janet Jackson's Rhythm Nation 1814"
      ],
      seeds: ["Thriller", "Purple Rain"]
    },
    {
      name: "1990s",
      color: "amber",
      fact: "Alternative rock, hip-hop, neo-soul, and electronic experimentation all moved toward the commercial and critical center during the 1990s.",
      terms: [
        "Nevermind",
        "The Chronic",
        "The Miseducation of Lauryn Hill",
        "OK Computer"
      ],
      seeds: ["Nevermind", "The Miseducation of Lauryn Hill"]
    },
    {
      name: "2000s & 2010s",
      color: "magenta",
      fact: "In the download and streaming eras, the album persisted as a form for intricate production, personal narrative, and large-scale cultural statements.",
      terms: [
        "The Blueprint",
        "Back to Black",
        "Lemonade",
        "DAMN."
      ],
      seeds: ["Back to Black", "Lemonade"]
    }
  ],
  bridges: [],
  lensMode: "quiz",
  lenses: [
    {
      id: "quincy-jones-production",
      prompt: "Which album was co-produced by Quincy Jones, who shared its Producer of the Year GRAMMY with the album's artist?",
      options: [
        {
          id: "thriller",
          label: "Michael Jackson — Thriller",
          targets: ["Thriller"],
          correct: true
        },
        {
          id: "whats-going-on-production",
          label: "Marvin Gaye — What's Going On",
          targets: ["What's Going On"]
        },
        {
          id: "nevermind-production",
          label: "Nirvana — Nevermind",
          targets: ["Nevermind"]
        },
        {
          id: "back-to-black-production",
          label: "Amy Winehouse — Back to Black",
          targets: ["Back to Black"]
        }
      ],
      explanation:
        "Michael Jackson and Quincy Jones co-produced Thriller and shared the 1984 GRAMMY for Producer of the Year, Non-Classical. The album also won Album of the Year."
    },
    {
      id: "first-hip-hop-album-of-year",
      prompt: "Which record made its artist the first hip-hop artist to win the GRAMMY for Album of the Year?",
      options: [
        {
          id: "the-miseducation",
          label: "The Miseducation of Lauryn Hill",
          targets: ["The Miseducation of Lauryn Hill"],
          correct: true
        },
        {
          id: "the-chronic",
          label: "The Chronic",
          targets: ["The Chronic"]
        },
        {
          id: "the-blueprint",
          label: "The Blueprint",
          targets: ["The Blueprint"]
        },
        {
          id: "damn-grammy",
          label: "DAMN.",
          targets: ["DAMN."]
        }
      ],
      explanation:
        "Lauryn Hill's 1999 Album of the Year victory for The Miseducation of Lauryn Hill was the first in that category for a hip-hop artist. She won five awards that night."
    },
    {
      id: "pulitzer-music-prize",
      prompt: "Which album won the 2018 Pulitzer Prize for Music?",
      options: [
        {
          id: "damn-pulitzer",
          label: "Kendrick Lamar — DAMN.",
          targets: ["DAMN."],
          correct: true
        },
        {
          id: "songs-in-the-key-of-life-pulitzer",
          label: "Stevie Wonder — Songs in the Key of Life",
          targets: ["Songs in the Key of Life"]
        },
        {
          id: "purple-rain-pulitzer",
          label: "Prince — Purple Rain",
          targets: ["Purple Rain"]
        },
        {
          id: "ok-computer-pulitzer",
          label: "Radiohead — OK Computer",
          targets: ["OK Computer"]
        }
      ],
      explanation:
        "Kendrick Lamar won the 2018 Pulitzer Prize for Music for DAMN. The Pulitzer board described the album as a unified song collection whose stories capture the complexity of modern African American life."
    },
    {
      id: "a-case-of-you",
      prompt: "On which album did Joni Mitchell release the song 'A Case of You'?",
      options: [
        {
          id: "blue-a-case-of-you",
          label: "Blue",
          targets: ["Blue"],
          correct: true
        },
        {
          id: "like-a-prayer-a-case-of-you",
          label: "Like a Prayer",
          targets: ["Like a Prayer"]
        },
        {
          id: "nevermind-a-case-of-you",
          label: "Nevermind",
          targets: ["Nevermind"]
        },
        {
          id: "lemonade-a-case-of-you",
          label: "Lemonade",
          targets: ["Lemonade"]
        }
      ],
      explanation:
        "Joni Mitchell wrote, produced, and recorded 'A Case of You' for Blue, her 1971 album. The song became one of the record's best-known explorations of intimacy and separation."
    },
    {
      id: "seven-top-five-hits",
      prompt: "Which album generated a record-breaking seven top-five hits on the U.S. singles chart?",
      options: [
        {
          id: "rhythm-nation-top-five",
          label: "Janet Jackson's Rhythm Nation 1814",
          targets: ["Janet Jackson's Rhythm Nation 1814"],
          correct: true
        },
        {
          id: "ziggy-stardust-top-five",
          label: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars",
          targets: ["The Rise and Fall of Ziggy Stardust and the Spiders from Mars"]
        },
        {
          id: "the-chronic-top-five",
          label: "The Chronic",
          targets: ["The Chronic"]
        },
        {
          id: "the-blueprint-top-five",
          label: "The Blueprint",
          targets: ["The Blueprint"]
        }
      ],
      explanation:
        "Janet Jackson's Rhythm Nation 1814 produced a record-breaking seven Top 5 hits. The album itself also reached number one on the Billboard 200."
    }
  ]
};
