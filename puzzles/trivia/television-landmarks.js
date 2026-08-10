// Concept Clusters puzzle: Television Landmarks
// Trivia uses an author-forced pre-solve: the four programme families are
// context for the questions, not a sorting challenge in their own right.

export default {
  id: "television-landmarks",
  title: "Television Landmarks",
  category: "Trivia",
  large: true,
  preSolve: true,
  info: {
    text: "Four familiar strands of television history, followed by questions about the innovations hiding behind the programmes.",
    citations: [
      {
        title: "The Flintstones",
        publisher: "Television Academy Interviews",
        url: "https://interviews.televisionacademy.com/shows/flintstones-the"
      },
      {
        title: "Columbo",
        publisher: "Television Academy Interviews",
        url: "https://interviews.televisionacademy.com/shows/columbo"
      },
      {
        title: "A Brief History of the Teleprompter",
        author: "Jimmy Stamp",
        publisher: "Smithsonian Magazine",
        year: "2012",
        url: "https://www.smithsonianmag.com/history/a-brief-history-of-the-teleprompter-88039053/"
      }
    ]
  },
  clusters: [
    {
      name: "Situation Comedy",
      color: "teal",
      fact: "The television sitcom repeatedly reinvents a durable setup: recurring characters negotiating family, friendship, and work within a familiar place.",
      terms: [
        "I Love Lucy",
        "The Mary Tyler Moore Show",
        "Cheers",
        "The Office (U.S.)"
      ],
      seeds: ["I Love Lucy", "Cheers"]
    },
    {
      name: "Science Fiction",
      color: "blue",
      fact: "Television science fiction turns speculative ideas into continuing worlds, giving audiences time to live with their social and technological consequences.",
      terms: [
        "Star Trek",
        "The X-Files",
        "Battlestar Galactica",
        "Stranger Things"
      ],
      seeds: ["Star Trek", "The X-Files"]
    },
    {
      name: "Crime & Mystery",
      color: "amber",
      fact: "Crime television ranges from self-contained puzzles to serialized portraits of institutions, investigators, victims, and offenders.",
      terms: [
        "Columbo",
        "Twin Peaks",
        "The Wire",
        "True Detective"
      ],
      seeds: ["Columbo", "The Wire"]
    },
    {
      name: "Animation",
      color: "magenta",
      fact: "Television animation grew from economical limited-animation production into a medium for family comedy, superhero drama, satire, and serialized fantasy.",
      terms: [
        "The Flintstones",
        "The Simpsons",
        "Batman: The Animated Series",
        "Avatar: The Last Airbender"
      ],
      seeds: ["The Flintstones", "The Simpsons"]
    }
  ],
  bridges: [],
  lensMode: "quiz",
  lenses: [
    {
      id: "in-camera-teleprompter",
      prompt: "The producer of which series patented an in-camera teleprompter that let performers read while looking toward the audience?",
      options: [
        {
          id: "i-love-lucy",
          label: "I Love Lucy",
          targets: ["I Love Lucy"],
          correct: true
        },
        {
          id: "star-trek",
          label: "Star Trek",
          targets: ["Star Trek"]
        },
        {
          id: "the-wire",
          label: "The Wire",
          targets: ["The Wire"]
        },
        {
          id: "the-simpsons",
          label: "The Simpsons",
          targets: ["The Simpsons"]
        }
      ],
      explanation:
        "Jess Oppenheimer, producer of I Love Lucy, patented an in-camera teleprompter that projected text in front of the lens, allowing performers to appear to look directly toward viewers."
    },
    {
      id: "inverted-detective-story",
      prompt: "Which mystery series usually shows the crime and culprit first, turning 'Who did it?' into 'How will the detective prove it?'",
      options: [
        {
          id: "columbo",
          label: "Columbo",
          targets: ["Columbo"],
          correct: true
        },
        {
          id: "twin-peaks",
          label: "Twin Peaks",
          targets: ["Twin Peaks"]
        },
        {
          id: "the-x-files",
          label: "The X-Files",
          targets: ["The X-Files"]
        },
        {
          id: "true-detective",
          label: "True Detective",
          targets: ["True Detective"]
        }
      ],
      explanation:
        "Columbo made the inverted detective story its signature. The audience watches the murder and cover-up, then follows Lieutenant Columbo as he finds the discrepancy that exposes the culprit."
    },
    {
      id: "first-prime-time-animation",
      prompt: "Which programme was the first animated situation comedy made for American prime-time television?",
      options: [
        {
          id: "the-flintstones",
          label: "The Flintstones",
          targets: ["The Flintstones"],
          correct: true
        },
        {
          id: "the-simpsons-animation",
          label: "The Simpsons",
          targets: ["The Simpsons"]
        },
        {
          id: "batman-tas",
          label: "Batman: The Animated Series",
          targets: ["Batman: The Animated Series"]
        },
        {
          id: "avatar",
          label: "Avatar: The Last Airbender",
          targets: ["Avatar: The Last Airbender"]
        }
      ],
      explanation:
        "The Flintstones premiered on ABC in 1960 as the first animated situation comedy produced for prime time, demonstrating that television animation could attract a broad evening audience."
    }
  ]
};
