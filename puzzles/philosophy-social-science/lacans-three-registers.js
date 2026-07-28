// Concept Clusters puzzle: Lacan's three registers
// Category: Philosophy & Social Science
// Experimental feature: one ternary bridge (Borromean knot)

export default {
  id: "lacans-three-registers",
  title: "Lacan's three registers",
  category: "Philosophy & Social Science",
  large: true,
  info: {
    text: "How Lacanian thought relates image, language, and what resists symbolization.",
    link: "wiki:Jacques Lacan"
  },
  clusters: [
    {
      name: "The Imaginary",
      color: "green",
      fact: "The Imaginary organizes the ego through images and identifications that promise unity while also producing alienation and rivalry.",
      terms: [
        "mirror stage",
        "specular image",
        "ideal ego",
        "bodily unity",
        "rivalry"
      ],
      seeds: ["mirror stage", "ideal ego"],
      info: { link: "wiki:The Imaginary (psychoanalysis)" },
      termInfo: {
        "mirror stage": {
          text: "The moment an infant recognizes its reflection as one coordinated whole, forming an idealized body-image ahead of its actual motor control.",
          link: "wiki:Mirror stage"
        },
        "specular image": {
          text: "The reflected image — in a mirror, or in another person — that gives an infant its first sense of a unified self, the raw material imaginary identification is built from.",
          link: "wiki:The Imaginary (psychoanalysis)"
        },
        "ideal ego": {
          text: "The idealized self-image formed through imaginary identification: who I picture myself to be, based on that first unified reflection.",
          link: "wiki:The Imaginary (psychoanalysis)"
        },
        "bodily unity": {
          text: "The sense of the body as one coordinated whole — an achievement that arrives first as an image, well ahead of an infant's actual motor control.",
          link: "wiki:Body image"
        },
        "rivalry": {
          text: "The aggressive edge built into imaginary identification: an identifying image is both 'me' and a separate other, making it a rival as much as a self.",
          link: "wiki:The Imaginary (psychoanalysis)"
        }
      }
    },
    {
      name: "The Symbolic",
      color: "blue",
      fact: "The Symbolic is the order of language, law, and social structure in which signifiers position the speaking subject.",
      terms: [
        "signifier",
        "big Other",
        "symbolic law",
        "ego ideal",
        "Name-of-the-Father"
      ],
      seeds: ["signifier", "big Other"],
      info: { link: "wiki:The Symbolic" },
      termInfo: {
        "signifier": {
          text: "A word, sound, or mark that stands for a concept through its relation to other signifiers, not by a direct link to the thing itself — the basic unit the Symbolic order is built from.",
          link: "wiki:Signified and signifier"
        },
        "big Other": {
          text: "The structure of language and social convention itself, related to as though it were a single entity the subject speaks to and is judged by — not any actual person.",
          link: "wiki:Big Other"
        },
        "symbolic law": {
          text: "The rules and prohibitions, encoded in language and social convention, that fix a subject's place among others.",
          link: "wiki:The Symbolic"
        },
        "ego ideal": {
          text: "The symbolic position from which a subject imagines being watched and judged — who I feel I should be, defined by language and approval rather than by my own reflection.",
          link: "wiki:Ego ideal"
        },
        "Name-of-the-Father": {
          text: "Lacan's term for the paternal function that enforces symbolic law and separates the child from imaginary fusion with the mother, opening the way into language.",
          link: "wiki:Name of the Father"
        }
      }
    },
    {
      name: "The Real",
      color: "amber",
      fact: "The Real names what cannot be fully absorbed into image or language, appearing as impossibility, rupture, contingency, and excessive enjoyment.",
      terms: [
        "impossibility",
        "resistance to symbolization",
        "jouissance",
        "traumatic encounter",
        "contingency"
      ],
      seeds: ["impossibility", "jouissance"],
      info: { link: "wiki:The Real" },
      termInfo: {
        "impossibility": {
          text: "Lacan's own shorthand for the Real: what can never be fully captured in language or pictured as a coherent image.",
          link: "wiki:The Real"
        },
        "resistance to symbolization": {
          text: "Whatever a chain of signifiers fails to capture — the leftover that language can circle around but never fully absorb.",
          link: "wiki:The Real"
        },
        "jouissance": {
          // Deliberately hedged rather than flattened into one confident
          // definition -- its meaning genuinely shifts across Lacan's own
          // seminars (from an early transgressive excess to later work
          // tying it to the Real and objet a), so a tidy one-liner risks
          // quietly picking a side in a live scholarly disagreement. See
          // the same restraint in this cluster's own `fact`.
          text: "A notoriously hard-to-translate term, often left in French: an excess of satisfaction beyond ordinary pleasure, closely tied to the Real. Its precise sense shifted across Lacan's own seminars — no single line does it justice.",
          link: "wiki:Jouissance"
        },
        "traumatic encounter": {
          text: "A sudden rupture where the Real breaks through — an event that expectation and habit hadn't prepared for.",
          link: "wiki:The Real"
        },
        "contingency": {
          text: "Something that happens by chance rather than necessity — one of the ways the Real shows up: not fate or meaning, but sheer accident.",
          link: "wiki:The Real"
        }
      }
    }
  ],
  bridges: [
    {
      term: "identification",
      clusters: [0, 1],
      relationKind: "contrast",
      fact: "Imaginary identification forms the ego through an image and the ideal ego; Symbolic identification locates the subject through signifiers and the ego ideal.",
      idealTerms: ["ideal ego", "ego ideal"],
      info: { link: "wiki:Identification (psychology)" }
    },
    {
      term: "symbolization",
      clusters: [1, 2],
      relationKind: "contrast",
      fact: "The Symbolic makes experience articulable through signifiers, while the Real marks the point where symbolization encounters impossibility.",
      idealTerms: ["signifier", "resistance to symbolization"],
      info: { link: "wiki:Jacques Lacan" }
    },
    {
      term: "the body",
      clusters: [0, 2],
      relationKind: "cross-cutting",
      fact: "The Imaginary presents the body as a coherent image, while the Real appears in bodily jouissance and disruptions that exceed that image.",
      idealTerms: ["bodily unity", "jouissance"],
      info: { link: "wiki:Jacques Lacan" }
    },
    {
      term: "Borromean knot",
      clusters: [0, 1, 2],
      fact: "In Lacan's later topology, the three registers are linked like Borromean rings: severing any one releases the other two, so the relation belongs to the three-part structure rather than to any isolated pair.",
      info: {
        text: "A three-way bridge: the relation only exists as the joint organization of all three registers.",
        link: "wiki:Borromean rings"
      }
    }
  ]
};
