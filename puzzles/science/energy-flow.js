// Concept Clusters puzzle: Energy flow in living systems
// Category: Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "energy-flow",
  "title": "Energy flow in living systems",
  "category": "Science",
  "clusters": [
    {
      "name": "Photosynthesis",
      "info": {
        "link": "wiki:Photosynthesis"
      },
      "color": "green",
      "fact": "Plants turn sunlight, water, and carbon dioxide into food.",
      "terms": [
        "sunlight",
        "chlorophyll",
        "carbon dioxide"
      ],
      "seeds": [
        "sunlight",
        "chlorophyll"
      ],
      "termInfo": {
        "sunlight": {
          "link": "wiki:Sunlight"
        },
        "chlorophyll": {
          "text": "The green pigment in plant cells that absorbs light energy to power photosynthesis.",
          "link": "wiki:Chlorophyll"
        },
        "carbon dioxide": {
          "link": "wiki:Carbon dioxide"
        }
      }
    },
    {
      "name": "Cellular respiration",
      "info": {
        "link": "wiki:Cellular respiration"
      },
      "color": "blue",
      "fact": "Cells break down food to release usable energy as ATP.",
      "terms": [
        "mitochondria",
        "ATP",
        "aerobic",
        "glucose"
      ],
      "seeds": [
        "mitochondria",
        "ATP"
      ],
      "termInfo": {
        "mitochondria": {
          "text": "The organelle where cellular respiration happens — often called the cell's powerhouse.",
          "link": "wiki:Mitochondrion"
        },
        "ATP": {
          "text": "Adenosine triphosphate: the molecule cells use to store and spend usable energy.",
          "link": "wiki:Adenosine triphosphate"
        },
        "aerobic": {
          "text": "Respiration that requires oxygen — most cellular respiration in animals and plants works this way.",
          "link": "wiki:Cellular respiration"
        },
        "glucose": {
          "text": "The simple sugar cells break down during respiration to release usable energy.",
          "link": "wiki:Glucose"
        }
      }
    },
    {
      "name": "Ecosystems",
      "info": {
        "link": "wiki:Ecosystem"
      },
      "color": "amber",
      "fact": "Energy flows through ecosystems along food chains.",
      "terms": [
        "food chain",
        "consumers",
        "decomposers",
        "trophic level"
      ],
      "seeds": [
        "food chain",
        "consumers"
      ],
      "termInfo": {
        "food chain": {
          "link": "wiki:Food chain"
        },
        "consumers": {
          "link": "wiki:Consumer (food chain)"
        },
        "decomposers": {
          "link": "wiki:Decomposer"
        },
        "trophic level": {
          "text": "An organism's position in a food chain — producers, then the consumers that eat them, and so on up the chain.",
          "link": "wiki:Trophic level"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "oxygen",
      "clusters": [
        0,
        1
      ],
      "fact": "Oxygen bridges the two: photosynthesis releases it, respiration consumes it.",
      "idealTerms": [
        "chlorophyll",
        "aerobic"
      ],
      "info": {
        "text": "A gas made of two bonded oxygen atoms (O2) — a waste product of photosynthesis and a required input for aerobic respiration.",
        "link": "wiki:Oxygen"
      }
    },
    {
      "term": "producers",
      "clusters": [
        0,
        2
      ],
      "fact": "Producers bridge the two: organisms that photosynthesize form the base of every ecosystem.",
      "info": {
        "text": "An organism that makes its own food from light or chemical energy, rather than eating other organisms — the base of every food chain.",
        "link": "wiki:Autotroph"
      }
    }
  ]
};
