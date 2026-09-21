// Generated from content/puzzles/flower-pollination-fruit.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "flower-pollination-fruit",
  "title": "How Flowers Work",
  "category": "botany",
  "large": true,
  "info": {
    "text": "After the parts are built, the work starts: moving pollen by wind or animal courier, double fertilization inside the ovule, and the packaging of seed and fruit — while real flowers vary the template by dropping whorls and splitting the sexes.",
    "links": [
      {
        "href": "https://openstax.org/books/biology-2e/pages/32-2-pollination-and-fertilization",
        "label": "OpenStax Biology 2e — Pollination and Fertilization"
      },
      {
        "href": "https://openstax.org/books/biology-2e/pages/32-1-reproductive-development-and-structure",
        "label": "OpenStax Biology 2e — Reproductive Development and Structure"
      }
    ],
    "citations": [
      {
        "title": "Biology 2e, §32.2 Pollination and Fertilization",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/32-2-pollination-and-fertilization"
      },
      {
        "title": "Biology 2e, §32.1 Reproductive Development and Structure",
        "publisher": "OpenStax",
        "year": "2018",
        "url": "https://openstax.org/books/biology-2e/pages/32-1-reproductive-development-and-structure"
      },
      {
        "title": "Flower",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Flower"
      }
    ]
  },
  "clusters": [
    {
      "id": "pollination",
      "name": "Moving the pollen",
      "color": "teal",
      "fact": "Getting pollen from anther to stigma is the flower's logistics problem: the wind does it blind and in bulk, while animals do it for a reward. Colors, scent, and ultraviolet nectar guides advertise; nectar pays; and a cross trip mixes genes where a self trip merely copies one plant.",
      "terms": [
        "nectar",
        "wind pollination",
        "nectar guide",
        "cross-pollination",
        "self-pollination",
        "pollinator syndrome"
      ],
      "seeds": [
        "nectar",
        "wind pollination"
      ],
      "termInfo": {
        "cross-pollination": "Delivery to a different plant of the same species — the genetically mixing outcome that most flower architecture quietly works to arrange.",
        "nectar": "A sugary fluid made by nectaries and paid out to animal couriers — the flower compensates its pollinators for the delivery service.",
        "nectar guide": "Petal markings, often in ultraviolet light humans cannot see, that steer a visiting insect toward the nectar — runway markings for pollinators.",
        "pollinator syndrome": "The bundle of traits — color, scent, shape, reward, bloom time — that matches a flower to one kind of courier, like tubular red blooms for hummingbirds or pale night-scent for moths.",
        "self-pollination": "Pollen fertilizing its own flower or plant — a reliable fallback when no courier arrives, but it copies the parent plant instead of mixing genes.",
        "wind pollination": "Letting the breeze do the delivering: no scent, no rewards, no show — just vast clouds of light pollen. Grasses, oaks, and many trees travel this way."
      },
      "info": "The flower's outreach program: every term here is about pollen's journey, or what the flower offers to arrange it."
    },
    {
      "id": "fruit-seed",
      "name": "After fertilization",
      "color": "blue",
      "fact": "Once pollen lands, the grain grows a pollen tube down to an ovule and releases two sperm — one joins the egg, the other starts the endosperm that will feed the embryo. The ovule becomes a seed; the ovary around it swells into a fruit.",
      "terms": [
        "seed",
        "fruit",
        "pollen tube",
        "double fertilization",
        "endosperm",
        "embryo"
      ],
      "seeds": [
        "seed",
        "fruit"
      ],
      "termInfo": {
        "double fertilization": "The flowering-plant signature: one sperm joins the egg while a second starts the endosperm — two fusions in a single event.",
        "embryo": "The tiny young plant inside the seed, resting beside its food supply until conditions say grow.",
        "endosperm": "The food-store tissue born from the second fusion — it nourishes the embryo, and it is the part of a wheat kernel or a coconut that we eat.",
        "fruit": "The ripened ovary: it carries, protects, and often advertises the seeds, recruiting animals to disperse them.",
        "pollen tube": "The tunnel a pollen grain grows down through the style to reach an ovule, carrying its two sperm — the pollen's own delivery infrastructure.",
        "seed": "The ovule after fertilization — embryo plus food supply in a tough coat, built to wait out winter, drought, or distance."
      },
      "info": "The payoff sequence: everything after a compatible grain lands — delivery, fusion, packaging."
    },
    {
      "id": "variation",
      "name": "Variations on the template",
      "color": "amber",
      "fact": "The textbook flower is a template, not a rule: lose a whorl and the flower is incomplete; carry both sexes and it is perfect; split the sexes across flowers and the plant becomes monoecious or dioecious.",
      "terms": [
        "complete flower",
        "imperfect flower",
        "perfect flower",
        "monoecious",
        "dioecious",
        "incomplete flower"
      ],
      "seeds": [
        "complete flower",
        "imperfect flower"
      ],
      "termInfo": {
        "complete flower": "A flower with all four whorls present — sepals, petals, stamens, and carpels. Lilies and roses qualify.",
        "dioecious": "'Two houses': male and female flowers on different plants. Hollies work this way — only females make berries, and a male must be planted nearby.",
        "imperfect flower": "A flower with one sex only — stamens alone or carpels alone — so it cannot fertilize itself.",
        "incomplete flower": "A flower missing at least one whorl. Grass flowers skip the showy parts entirely: wind needs no billboard.",
        "monoecious": "'One house': a plant bearing separate male and female flowers. Corn is the classic — pollen-shedding tassels above, seed-bearing ears below.",
        "perfect flower": "A flower carrying both sexes — stamens and carpels in the same blossom. 'Perfect' here means bisexual, not flawless."
      },
      "info": "How real flowers bend the four-whorl template: by which whorls are present, and by where the sexes sit."
    }
  ],
  "bridges": [
    {
      "term": "Outcrossing by design",
      "clusters": [
        0,
        2
      ],
      "fact": "Splitting the sexes across flowers and plants, and favoring cross-pollination, are the same strategy at two scales: architecture that blocks self-fertilization keeps genes mixing.",
      "info": "Self-fertilization is the default to guard against, and flowers evolve separation tricks at every scale — release timing, organ positioning, or splitting the sexes across flowers and whole plants."
    }
  ],
  "lenses": [
    {
      "id": "reward-and-runway",
      "prompt": "Which two terms name, respectively, the payment a visiting animal collects and the markings that point the way to it?",
      "explanation": "Nectar is the reward; nectar guides are the runway markings pointing to it — often in ultraviolet only insects can see. Wind pollination offers neither payment nor signpost, and a pollinator syndrome is the whole matching scheme, not one piece of it.",
      "color": "amber",
      "targets": [
        "nectar",
        "nectar guide"
      ],
      "reasons": {
        "nectar": "The sugary payment the courier collects.",
        "nectar guide": "The visible-or-ultraviolet markings that steer visitors to the payment."
      }
    },
    {
      "id": "two-sperm-two-products",
      "prompt": "Double fertilization means two fusions with two products: which pair names the products themselves?",
      "explanation": "One sperm fertilizes the egg, producing the embryo; the second starts the endosperm, the tissue that feeds it. The seed and fruit are the packaging those products end up in, and the pollen tube is the delivery route, not a product.",
      "color": "cyan",
      "targets": [
        "embryo",
        "endosperm"
      ],
      "reasons": {
        "embryo": "From the sperm-and-egg fusion — the young plant itself.",
        "endosperm": "From the second fusion — the food supply that nourishes the young plant."
      }
    },
    {
      "id": "blocking-selfing",
      "prompt": "Which two terms describe arrangements that make self-fertilization impossible, rather than merely unlikely?",
      "explanation": "An imperfect flower lacks one sex entirely, and a dioecious plant splits the sexes across individuals — in both cases selfing is architecturally impossible. Monoecious plants separate the flowers but keep them on one plant, so pollen can still drift between them: selfing becomes unlikely, not impossible. Self-pollination is the outcome those architectures exist to prevent.",
      "color": "magenta",
      "targets": [
        "imperfect flower",
        "dioecious"
      ],
      "reasons": {
        "dioecious": "One sex per plant, so no individual holds both sexes at all.",
        "imperfect flower": "One sex per flower, so no stigma ever sits beneath its own anther."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "flower-anatomy",
        "reason": "Start here if the flower's parts are new — this board follows that machinery through pollination, fertilization, and fruit."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The delivery, the fusion, the package",
    "summary": "Pollination is only delivery: what happens after the pollen lands — and how real flowers vary the plan.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Pollination is only the delivery. Once a compatible grain lands on a receptive stigma, it grows its own tunnel down to an ovule and releases two sperm — and the fusions that follow start both a new plant and the tissue that will feed it. What was the ovule becomes a seed; what was the ovary becomes a fruit, often recruiting animals to carry the next generation away.\r\n\r\nAround this machinery, flowers have evolved wildly different strategies: some entrust their pollen to the wind and skip the spectacle entirely, while others pay couriers in nectar and advertise in colors humans cannot even see. The template bends further still — whole whorls dropped, sexes split across flowers and across plants — so the vocabulary of flower reproduction is really a vocabulary of transport, fusion, and variation."
    },
    "links": [
      {
        "href": "https://openstax.org/books/biology-2e/pages/32-2-pollination-and-fertilization",
        "label": "OpenStax Biology 2e — Pollination and Fertilization"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
