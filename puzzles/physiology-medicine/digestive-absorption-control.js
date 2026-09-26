// Generated from content/puzzles/digestive-absorption-control.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "digestive-absorption-control",
  "title": "Digestion: absorption and control",
  "category": "physiology-medicine",
  "info": {
    "text": "Digestion ends with delivery and timing. This board teaches how nutrients cross into blood or lymph, and how gut hormones and nerves schedule secretions, motility, and hunger.",
    "citations": [
      {
        "title": "23.7 Chemical Digestion and Absorption: A Closer Look - Anatomy and Physiology | OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology/pages/23-7-chemical-digestion-and-absorption-a-closer-look"
      },
      {
        "title": "Role of GI Hormones on Gut Mucosal Growth - Regulation of Gastrointestinal Mucosal Growth - NCBI Bookshelf",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK54093/"
      }
    ]
  },
  "clusters": [
    {
      "id": "absorb-and-carry",
      "name": "Absorb and carry away",
      "color": "teal",
      "fact": "The small intestine absorbs finished digestion: brush-border enzymes work on villi and microvilli, nutrients enter blood through the hepatic portal vein, and fats ride chylomicrons through lacteals into lymph.",
      "terms": [
        "villi",
        "lacteal",
        "microvilli",
        "hepatic portal vein",
        "chylomicron",
        "brush-border enzymes"
      ],
      "seeds": [
        "villi",
        "lacteal"
      ],
      "termInfo": {
        "villi": "Finger-like projections whose capillaries pick up water-soluble nutrients.",
        "lacteal": "The lymph vessel inside each villus that carries absorbed fats away.",
        "microvilli": "Microscopic bristles on absorptive cells that multiply surface area.",
        "hepatic portal vein": "Vein carrying nutrient-rich blood from the intestines to the liver.",
        "chylomicron": "Protein-fat parcel that ferries lipids through lymph into blood.",
        "brush-border enzymes": "Enzymes on absorptive-cell surfaces that finish digesting sugars and peptides."
      },
      "info": {
        "text": "Blood takes most nutrients to the liver first; fats take the lymphatic detour.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology/pages/23-7-chemical-digestion-and-absorption-a-closer-look",
            "label": "OpenStax: chemical digestion and absorption"
          }
        ]
      }
    },
    {
      "id": "sense-and-regulate",
      "name": "Sense and regulate",
      "color": "blue",
      "fact": "Gut hormones and nerves time digestion: gastrin, secretin, and cholecystokinin trigger secretions, ghrelin signals hunger, and the vagus nerve and enteric nervous system coordinate the tract.",
      "terms": [
        "ghrelin",
        "vagus nerve",
        "gastrin",
        "secretin",
        "cholecystokinin",
        "enteric nervous system"
      ],
      "seeds": [
        "ghrelin",
        "vagus nerve"
      ],
      "termInfo": {
        "ghrelin": "Stomach hormone that signals hunger to the brain.",
        "vagus nerve": "Parasympathetic nerve linking brain and gut, driving rest-and-digest activity.",
        "gastrin": "Hormone that prompts the stomach to release acid and maintain its lining.",
        "secretin": "Hormone that prompts the pancreas to release neutralizing bicarbonate.",
        "cholecystokinin": "Hormone that prompts bile release and pancreatic enzymes, and signals fullness.",
        "enteric nervous system": "The gut's own nerve network coordinating local secretion and movement."
      },
      "info": {
        "text": "Hormones carry slow meal-scale orders; nerves carry fast local ones.",
        "links": [
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK54093/",
            "label": "NCBI Bookshelf: GI hormones"
          }
        ]
      }
    }
  ],
  "bridges": [],
  "lenses": [
    {
      "id": "fat-detour",
      "prompt": "Most nutrients leave the intestine in blood, but fats take a lymphatic detour. Which two terms are that detour?",
      "explanation": "Chylomicrons ferry lipids through lacteals into lymph. The hepatic portal vein is the blood road instead; villi and microvilli are the uptake surface rather than the road; brush-border enzymes finish digestion.",
      "targets": [
        "lacteal",
        "chylomicron"
      ],
      "reasons": {
        "lacteal": "The lymph vessel that drains fats away from each villus.",
        "chylomicron": "The parcel that carries lipids through lymph to blood."
      }
    },
    {
      "id": "hunger-and-fullness",
      "prompt": "One signal starts meals and another helps end them. Which two hormones are hunger and fullness?",
      "explanation": "Ghrelin from the stomach tells the brain it is time to eat; cholecystokinin helps signal fullness. Gastrin and secretin order digestive juices rather than appetite; the vagus nerve and enteric nervous system are nerves, not hormones.",
      "targets": [
        "ghrelin",
        "cholecystokinin"
      ],
      "reasons": {
        "ghrelin": "The stomach's hunger signal to the brain.",
        "cholecystokinin": "The intestinal signal that helps end the meal."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "digestive-breakdown",
        "reason": "Start with breakdown: how food is moved, mixed, and chemically dismantled before it can be absorbed."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "After breakdown comes delivery",
    "summary": "How nutrients cross the gut wall into the body, and how hormones and nerves time the whole sequence.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Breaking food into fragments is only half the job. Those fragments still sit inside the gut tube, technically outside the body, until they cross the intestinal wall into blood or lymph. Meanwhile the whole sequence has to be timed: juices must arrive when food does, and hunger must switch off when enough is enough.\r\n\r\nThis lesson follows those final steps: the structures that absorb and carry nutrients away, and the hormones and nerves that conduct the timing."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)",
        "reasoning": "high"
      }
    ]
  }
});
