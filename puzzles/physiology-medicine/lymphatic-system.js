// Generated from content/puzzles/lymphatic-system.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "lymphatic-system",
  "title": "The Lymphatic System: Drainage, Surveillance, and Return",
  "category": "physiology-medicine",
  "info": {
    "text": "Tissue fluid constantly leaks from blood, and intestinal lacteals absorb dietary fats. The lymphatic system collects both as lymph, screens them in lymphoid organs, and returns them to venous blood.",
    "citations": [
      {
        "title": "OpenStax Anatomy and Physiology — 21.1 Anatomy of the Lymphatic and Immune Systems",
        "url": "https://openstax.org/books/anatomy-and-physiology/pages/21-1-anatomy-of-the-lymphatic-and-immune-systems"
      },
      {
        "title": "Frontiers in Physiology — The Role of Lymphatic Vascular Function in Metabolic Disorders",
        "url": "https://frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.00404/full"
      },
      {
        "title": "OpenStax Anatomy and Physiology — 21.3 The Adaptive Immune Response",
        "url": "https://openstax.org/books/anatomy-and-physiology/pages/21-3-the-adaptive-immune-response-t-lymphocytes-and-their-functional-types"
      }
    ]
  },
  "clusters": [
    {
      "id": "lymphoid-organs",
      "name": "Lymphoid organs",
      "color": "teal",
      "fact": "Lymphoid organs and tissues house lymphocytes and filter lymph, so immune responses start where lymph is screened.",
      "terms": [
        "lymph nodes",
        "spleen",
        "thymus",
        "tonsils",
        "Peyer's patches",
        "bone marrow"
      ],
      "seeds": [
        "lymph nodes",
        "spleen"
      ],
      "termInfo": {
        "lymph nodes": {
          "text": "Small encapsulated filters along lymphatic vessels where macrophages and lymphocytes screen passing lymph for antigen.",
          "links": [
            {
              "href": "wiki:Lymph node"
            }
          ]
        },
        "spleen": {
          "text": "Lymphoid organ that screens blood rather than lymph, mounting responses to blood-borne antigen.",
          "links": [
            {
              "href": "wiki:Spleen"
            }
          ]
        },
        "thymus": {
          "text": "Primary lymphoid organ where T cells mature; largest and most active in childhood.",
          "links": [
            {
              "href": "wiki:Thymus"
            }
          ]
        },
        "tonsils": {
          "text": "Mucosa-associated lymphoid tissue guarding the throat, screening inhaled and swallowed material.",
          "links": [
            {
              "href": "wiki:Tonsil"
            }
          ]
        },
        "Peyer's patches": "Lymphoid follicles in the small-intestine wall that sample antigen from the gut lumen.",
        "bone marrow": {
          "text": "Primary lymphoid organ where lymphocytes are generated and B cells mature.",
          "links": [
            {
              "href": "wiki:Bone marrow"
            }
          ]
        }
      }
    },
    {
      "id": "lymph-return-route",
      "name": "Lymph return route",
      "color": "blue",
      "fact": "Lymphatic capillaries collect leaked fluid and intestinal chyle into vessels and two ducts that empty into the subclavian veins.",
      "terms": [
        "thoracic duct",
        "lymphatic vessels",
        "right lymphatic duct",
        "lymphatic capillaries"
      ],
      "seeds": [
        "thoracic duct",
        "lymphatic vessels"
      ],
      "termInfo": {
        "thoracic duct": {
          "text": "The body's largest lymphatic vessel, draining most of the body into the left subclavian vein.",
          "links": [
            {
              "href": "wiki:Thoracic duct"
            }
          ]
        },
        "lymphatic vessels": {
          "text": "Valved vessels with muscular walls that propel collected lymph toward the lymphatic ducts.",
          "links": [
            {
              "href": "wiki:Lymphatic vessel"
            }
          ]
        },
        "right lymphatic duct": {
          "text": "Short duct draining lymph from the upper-right quadrant of the body into the right subclavian vein.",
          "links": [
            {
              "href": "wiki:Right lymphatic duct"
            }
          ]
        },
        "lymphatic capillaries": "Blind-ended, highly permeable vessels that admit interstitial fluid, solutes, and immune cells."
      }
    },
    {
      "id": "fluid-and-lipid-cargo",
      "name": "Fluid and lipid cargo",
      "color": "amber",
      "fact": "Tissue fluid constantly leaks from blood and intestinal lacteals absorb fats as chylomicrons; without lymphatic return that fluid stays trapped as edema.",
      "terms": [
        "lymph",
        "interstitial fluid",
        "edema",
        "lacteals",
        "chylomicrons"
      ],
      "seeds": [
        "lymph",
        "edema"
      ],
      "termInfo": {
        "lymph": {
          "text": "The fluid inside lymphatic vessels: recovered interstitial fluid plus immune cells and, after meals, absorbed fats.",
          "links": [
            {
              "href": "wiki:Lymph"
            }
          ]
        },
        "interstitial fluid": {
          "text": "Fluid bathing tissue cells, formed from blood plasma leaking across capillary walls.",
          "links": [
            {
              "href": "wiki:Interstitial fluid"
            }
          ]
        },
        "edema": {
          "text": "Swelling from interstitial fluid that lymphatic return failed to recover.",
          "links": [
            {
              "href": "wiki:Edema"
            }
          ]
        },
        "lacteals": {
          "text": "Lymphatic capillaries in intestinal villi that absorb dietary fats into lymph.",
          "links": [
            {
              "href": "wiki:Lacteal"
            }
          ]
        },
        "chylomicrons": {
          "text": "Lipoprotein particles that carry absorbed dietary fat through lymph toward the blood.",
          "links": [
            {
              "href": "wiki:Chylomicron"
            }
          ]
        }
      }
    },
    {
      "id": "surveillance-cells",
      "name": "Surveillance cells",
      "color": "magenta",
      "fact": "Lymphocytes, macrophages, and dendritic cells patrol lymph and present what they find, turning drainage into immune surveillance.",
      "terms": [
        "lymphocytes",
        "macrophages",
        "dendritic cells"
      ],
      "seeds": [
        "lymphocytes",
        "macrophages"
      ],
      "termInfo": {
        "lymphocytes": {
          "text": "Immune cells that recognize specific antigen and mount responses inside lymphoid organs.",
          "links": [
            {
              "href": "wiki:Lymphocyte"
            }
          ]
        },
        "macrophages": {
          "text": "Phagocytes stationed in tissues and nodes that engulf debris and present antigen.",
          "links": [
            {
              "href": "wiki:Macrophage"
            }
          ]
        },
        "dendritic cells": {
          "text": "Migratory antigen-presenting cells that carry cargo from tissues to lymph nodes.",
          "links": [
            {
              "href": "wiki:Dendritic cell"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "subclavian-veins",
      "term": "subclavian veins",
      "clusters": [
        1,
        2
      ],
      "fact": "Both lymphatic ducts return collected lymph — watery interstitial fluid and fatty chyle from lacteals — to blood at the subclavian veins; that return is what prevents edema.",
      "info": "The venous endpoint where the lymphatic return route delivers its fluid and lipid cargo back to blood.",
      "idealTerms": [
        "thoracic duct",
        "lymph"
      ]
    },
    {
      "id": "antigen-presentation",
      "term": "antigen presentation",
      "clusters": [
        0,
        3
      ],
      "fact": "Dendritic cells and macrophages present lymph-borne antigen to lymphocytes inside lymphoid organs such as lymph nodes.",
      "info": "The handoff where cargo carried into lymphoid tissue becomes a signal lymphocytes can respond to.",
      "idealTerms": [
        "lymph nodes",
        "dendritic cells"
      ]
    }
  ],
  "lenses": [
    {
      "id": "where-lymph-is-screened",
      "prompt": "Which organs screen lymph or blood for antigen?",
      "explanation": "Nodes, spleen, tonsils, and Peyer's patches all screen what flows through them; thymus and bone marrow generate and mature cells rather than screening flow.",
      "targets": [
        "lymph nodes",
        "spleen",
        "tonsils",
        "Peyer's patches"
      ],
      "reasons": {
        "lymph nodes": "They filter lymph passing along lymphatic vessels.",
        "spleen": "It screens blood rather than lymph, as the blood-side counterpart.",
        "tonsils": "They screen material entering through the throat.",
        "Peyer's patches": "They sample antigen from the gut lumen."
      }
    },
    {
      "id": "fat-from-gut-to-blood",
      "prompt": "Which concepts handle dietary fat at its uptake, packaging, and delivery to blood?",
      "explanation": "Lacteals take up fats from the gut wall, chylomicrons package them for transport, and the thoracic duct delivers that fatty lymph to venous blood; lymph itself is the general medium, not a fat-specific stage.",
      "targets": [
        "lacteals",
        "chylomicrons",
        "thoracic duct"
      ],
      "reasons": {
        "lacteals": "They take up dietary fats from intestinal villi into lymph.",
        "chylomicrons": "They are the particles that package absorbed fat for transport through lymph.",
        "thoracic duct": "It delivers chyle-rich lymph into the subclavian vein."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Lymph: the body's return line and its checkpoint",
    "content": {
      "mediaType": "text/markdown",
      "text": "Blood capillaries leak. Every day, roughly 20 liters of plasma filter out into the spaces between cells; blood vessels reabsorb most of it, but about three liters are left behind. The lymphatic system is the second drain that collects that surplus, which is why it is best understood as plumbing before it is immunity. When the drain fails, the fluid stays and tissue swells as edema.\r\n\r\nThe same network does a second job. Dietary fat takes a different route from other nutrients: after a meal, it enters lymphatic vessels in the intestinal wall and travels as particles called chylomicrons. Everything collected, tissue fluid and dietary fat alike, is called lymph. It flows one way through ever larger valved vessels into two ducts, which empty into the veins beneath the collarbones and return it to the blood.\r\n\r\nBecause all of that fluid passes through a few chokepoints on its way back, the body uses the route as a checkpoint. Lymph filters through nodes, and blood through the spleen. Other lymphoid tissues guard the throat and gut, while the thymus and bone marrow produce and train the cells that do the screening. Immune cells such as dendritic cells and macrophages carry samples of what they have found into these organs, where lymphocytes decide whether to respond.\r\n\r\nThe result is one system with three linked purposes: draining leaked fluid, carrying dietary fat, and screening everything that passes through for threats."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Muse Code (Spark 1.3)"
      },
      {
        "name": "Claude Code (Claude Sonnet 5.5)",
        "reasoning": "high"
      }
    ]
  },
  "dateCreated": "2026-10-02",
  "dateModified": "2026-10-03"
});
