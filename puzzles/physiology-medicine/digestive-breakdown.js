// Generated from content/puzzles/digestive-breakdown.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "digestive-breakdown",
  "title": "Digestion: breakdown",
  "category": "physiology-medicine",
  "info": {
    "text": "Before the body can use food, it must be moved, mixed, and chemically dismantled. This board teaches how muscles propel and mix contents while acid, bile, and enzymes break them into absorbable pieces.",
    "citations": [
      {
        "title": "23.2 Digestive System Processes and Regulation - Anatomy and Physiology 2e | OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-2-digestive-system-processes-and-regulation"
      },
      {
        "title": "Digestive Enzymes - The Exocrine Pancreas - NCBI Bookshelf",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK54127/"
      }
    ]
  },
  "clusters": [
    {
      "id": "move-and-mix",
      "name": "Move and mix",
      "color": "teal",
      "fact": "Muscles propel food and mix it with juices: chewing and swallowing start the journey, peristalsis pushes contents along, segmentation sloshes them back and forth, the stomach churns, and indigestible remainder leaves by defecation.",
      "terms": [
        "chewing",
        "swallowing",
        "peristalsis",
        "segmentation",
        "stomach churning",
        "defecation"
      ],
      "seeds": [
        "chewing",
        "swallowing"
      ],
      "termInfo": {
        "chewing": "Teeth cut and grind food while saliva moistens it, forming a bolus ready for swallowing.",
        "swallowing": "Tongue and throat muscles push the bolus past the airway into the esophagus.",
        "peristalsis": "Waves of smooth-muscle contraction push contents steadily along the tract.",
        "segmentation": "Alternate squeezing of neighboring intestinal segments sloshes contents back and forth to mix them.",
        "stomach churning": "Stomach muscle contractions mix food with acid and pepsin, turning it into chyme.",
        "defecation": "Leftover indigestible material is expelled through the rectum and anus."
      },
      "info": {
        "text": "Propulsion moves food forward; mixing motions buy juices the time and surface they need to act.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-2-digestive-system-processes-and-regulation",
            "label": "OpenStax: digestive processes and regulation"
          }
        ]
      }
    },
    {
      "id": "break-down-chemically",
      "name": "Break down chemically",
      "color": "blue",
      "fact": "Acid and enzymes dismantle food into absorbable pieces: salivary amylase starts on starch, hydrochloric acid and pepsin start on protein, pancreatic lipase and bile handle fat, and bicarbonate neutralizes stomach acid for the intestine.",
      "terms": [
        "pepsin",
        "bile",
        "salivary amylase",
        "hydrochloric acid",
        "pancreatic lipase",
        "bicarbonate"
      ],
      "seeds": [
        "pepsin",
        "bile"
      ],
      "termInfo": {
        "pepsin": "Stomach enzyme that begins digesting protein by cleaving chains in acid.",
        "bile": "Liver-made secretion that emulsifies fat into droplets for lipase to digest.",
        "salivary amylase": "Saliva enzyme that begins breaking starch into smaller sugars.",
        "hydrochloric acid": "Stomach acid that denatures protein and activates pepsin.",
        "pancreatic lipase": "Pancreatic enzyme that digests fat into fatty acids in the small intestine.",
        "bicarbonate": "Pancreatic secretion that neutralizes stomach acid entering the duodenum."
      },
      "info": {
        "text": "Each secretion attacks one nutrient class; together they finish what teeth and muscles start.",
        "links": [
          {
            "href": "https://www.ncbi.nlm.nih.gov/books/NBK54127/",
            "label": "NCBI Bookshelf: digestive enzymes"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "chyme-formation",
      "term": "chyme",
      "clusters": [
        0,
        1
      ],
      "fact": "Churning mixes food with acid and pepsin to make chyme, the soupy mixture the stomach delivers to the small intestine."
    }
  ],
  "lenses": [
    {
      "id": "mixers-not-movers",
      "prompt": "Food must be mixed with digestive juices, not just pushed forward. Which two actions do the mixing without moving food along the tract?",
      "explanation": "Segmentation sloshes contents back and forth and stomach churning stirs food with acid and pepsin. Peristalsis and swallowing propel, chewing starts breakdown in the mouth, and defecation eliminates.",
      "targets": [
        "segmentation",
        "stomach churning"
      ],
      "reasons": {
        "segmentation": "Alternating contractions of neighboring segments mix chyme without net forward movement.",
        "stomach churning": "Muscular churning stirs food with acid and pepsin to form chyme."
      }
    },
    {
      "id": "protein-and-fat-openers",
      "prompt": "Which enzyme begins breaking protein apart in the stomach, and which liver-made secretion breaks fat into droplets for enzymes to attack?",
      "explanation": "Pepsin cleaves protein chains in stomach acid; bile emulsifies fat so lipase can digest it. Amylase starts on starch, hydrochloric acid sets the scene without cleaving anything, lipase is pancreatic rather than liver-made, and bicarbonate neutralizes acid.",
      "targets": [
        "pepsin",
        "bile"
      ],
      "reasons": {
        "pepsin": "The stomach's protein-cleaving enzyme, activated by acid.",
        "bile": "The liver-made emulsifier that prepares fat for lipase."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "digestive-absorption-control",
        "reason": "Continue to absorption and regulation: how digested subunits enter the body and how the gut times secretion and motility."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Before food can feed you",
    "summary": "Why meals must be moved, mixed, and dismantled before nutrients can reach your cells.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Everything you eat arrives in pieces too big for blood to carry. Before any nutrient reaches your cells, your gut must turn meals into molecules: pushing food along, churning it with acid, and clipping proteins, starches, and fats into fragments small enough to absorb.\r\n\r\nThis lesson follows that breakdown step by step, starting with the muscular motions that move and mix, then the acid, bile, and enzymes that do the chemical dismantling."
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
