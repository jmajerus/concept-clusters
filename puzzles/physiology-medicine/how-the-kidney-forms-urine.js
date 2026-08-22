// Generated from content/puzzles/how-the-kidney-forms-urine.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "how-the-kidney-forms-urine",
  "title": "How the kidney forms urine",
  "category": "Physiology & Medicine",
  "info": {
    "text": "Urine is not simply filtered blood. The kidney first forms a large volume of filtrate, then revises that fluid by taking useful substances back into the blood and adding selected acids and wastes.",
    "link": "wiki:Renal physiology",
    "extraLink": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation",
    "citations": [
      {
        "title": "Anatomy and Physiology 2e, §25.5 Physiology of Urine Formation",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation"
      },
      {
        "title": "Anatomy and Physiology 2e, §25.6 Tubular Reabsorption",
        "author": "J. Gordon Betts, Kelly A. Young, James A. Wise, Eddie Johnson, Brandon Poe, Dean H. Kruse, Oksana Korol, Jody E. Johnson, Mark Womble, Peter DeSaix",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      }
    ]
  },
  "clusters": [
    {
      "id": "glomerular-filtration",
      "name": "Glomerular filtration",
      "color": "teal",
      "fact": "The glomerulus and its podocytes filter blood into Bowman's capsule, forming a protein-poor filtrate whose volume per minute is the glomerular filtration rate.",
      "terms": [
        "glomerulus",
        "filtrate",
        "Bowman's capsule",
        "podocyte",
        "glomerular filtration rate"
      ],
      "seeds": [
        "glomerulus",
        "filtrate"
      ],
      "termInfo": {
        "Bowman's capsule": {
          "text": "The cup-shaped chamber that collects filtrate around the glomerulus and empties into the renal tubule.",
          "link": "wiki:Bowman's capsule"
        },
        "filtrate": {
          "text": "The protein-poor fluid formed when water and small solutes leave glomerular blood and enter Bowman's space."
        },
        "glomerular filtration rate": {
          "text": "The volume of filtrate formed by the kidneys per unit time, a standard measure of filtration function.",
          "link": "wiki:Glomerular filtration rate"
        },
        "glomerulus": {
          "text": "The capillary tuft at the start of a nephron where plasma is forced through a filter into the surrounding capsule.",
          "link": "wiki:Glomerulus (kidney)"
        },
        "podocyte": {
          "text": "A specialized epithelial cell whose foot processes wrap glomerular capillaries and help form the slits of the filter.",
          "link": "wiki:Podocyte"
        }
      },
      "info": {
        "link": "wiki:Ultrafiltration (kidney)",
        "extraLink": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation"
      }
    },
    {
      "id": "tubular-reabsorption",
      "name": "Tubular reabsorption",
      "color": "blue",
      "fact": "Reabsorption claims back filtered glucose and sodium from the tubular fluid into the blood, so urine is not simply a dump of everything the glomerulus let through.",
      "terms": [
        "reabsorption",
        "glucose",
        "sodium"
      ],
      "seeds": [
        "reabsorption",
        "glucose"
      ],
      "termInfo": {
        "glucose": {
          "text": "A filtered nutrient that a healthy tubule reabsorbs almost completely, which is why urine is normally glucose-free."
        },
        "reabsorption": {
          "text": "Recovery of water and solutes from tubular fluid back into the circulation, rather than letting them leave as urine."
        },
        "sodium": {
          "text": "The ion whose active recovery from tubular fluid drives much of the cotransport that reclaims glucose and other solutes."
        }
      },
      "info": {
        "link": "wiki:Reabsorption",
        "extraLink": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      }
    },
    {
      "id": "tubular-secretion",
      "name": "Tubular secretion",
      "color": "amber",
      "fact": "Secretion transports hydrogen ion and ammonium from blood into the tubular fluid, letting the kidney excrete acid and some wastes beyond what filtration already delivered.",
      "terms": [
        "secretion",
        "hydrogen ion",
        "ammonium"
      ],
      "seeds": [
        "secretion",
        "hydrogen ion"
      ],
      "termInfo": {
        "ammonium": {
          "text": "An acid form of nitrogen (NH4+) secreted into the tubule so net acid can leave in the urine."
        },
        "hydrogen ion": {
          "text": "A proton secreted into tubular fluid as part of the kidney's control of acid–base balance."
        },
        "secretion": {
          "text": "Transport of selected substances from surrounding blood into the tubular lumen, the opposite direction from reabsorption."
        }
      },
      "info": {
        "text": "Tubular secretion adds selected acids, wastes, and some drugs to the forming urine from the blood around the tubule.",
        "extraLink": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      }
    }
  ],
  "bridges": [
    {
      "id": "nephron",
      "term": "nephron",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A nephron produces urine by filtering plasma at its glomerulus, then reabsorbing and secreting along the same tubule; dropping any of those operations would change what the urine contains.",
      "info": {
        "text": "The kidney's functional unit: a renal corpuscle plus a tubule that revises filtrate into urine.",
        "link": "wiki:Nephron"
      },
      "termRole": "reference",
      "relationKind": "foundation",
      "idealTerms": [
        "glomerulus",
        "reabsorption",
        "secretion"
      ]
    },
    {
      "id": "peritubular-capillary",
      "term": "peritubular capillary",
      "clusters": [
        1,
        2
      ],
      "fact": "Peritubular capillaries receive the fluid and solutes reabsorption recovers, and they are also the blood source for the hydrogen ion and ammonium that secretion adds to the tubule.",
      "info": {
        "text": "The capillary network around the cortical tubules, downstream of the glomerulus, where the tubule and blood exchange in both directions.",
        "link": "wiki:Peritubular capillaries"
      },
      "termRole": "reference",
      "relationKind": "dynamic",
      "idealTerms": [
        "reabsorption",
        "secretion"
      ]
    }
  ],
  "lenses": [
    {
      "id": "from-blood-into-tubule",
      "prompt": "Which concepts deliver material from blood into tubular fluid?",
      "explanation": "Filtration and secretion both deliver material from blood into the forming urine; reabsorption is the opposite direction. The grouping is the lesson: urine is not only what the glomerulus let through.",
      "targets": [
        "glomerulus",
        "secretion"
      ],
      "reasons": {
        "glomerulus": "It is the capillary tuft that forces plasma into Bowman's space as filtrate.",
        "secretion": "It transports selected substances from surrounding blood into the tubular lumen."
      }
    },
    {
      "id": "across-the-tubule-wall",
      "prompt": "Which concepts are solutes the tubule moves across its wall?",
      "explanation": "Glucose and sodium are reclaimed from the lumen back to blood; hydrogen ion and ammonium are added from blood into the lumen. Same wall, opposite jobs — that is why urine is a revised filtrate.",
      "targets": [
        "glucose",
        "sodium",
        "hydrogen ion",
        "ammonium"
      ],
      "reasons": {
        "ammonium": "Tubular cells secrete it into the lumen so net acid can leave in the urine.",
        "glucose": "The tubule reabsorbs it from the lumen back into blood, almost completely.",
        "hydrogen ion": "The tubule secretes this proton from surrounding blood into the lumen.",
        "sodium": "The tubule actively recovers it from the lumen; that sodium gradient drives much of the other reabsorption."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Place urine formation next to the pressure, acid–base, and feedback systems it depends on.",
      "link": "wiki:Homeostasis"
    },
    "entries": [
      {
        "id": "how-the-heart-pumps",
        "reason": "Glomerular filtration is driven by arterial hydrostatic pressure, so cardiac pumping is a precondition for forming filtrate.",
        "via": [
          "glomerulus",
          "glomerular filtration rate"
        ]
      },
      {
        "id": "maintaining-homeostasis",
        "reason": "Reabsorbing sodium and secreting hydrogen ion are how the kidney acts as an effector for volume, osmolarity, and pH.",
        "via": [
          "reabsorption",
          "sodium",
          "hydrogen ion"
        ]
      },
      {
        "id": "breathing-gas-exchange",
        "reason": "The lungs expire carbon dioxide while the kidney secretes hydrogen ion; both revise acid–base balance.",
        "via": [
          "hydrogen ion"
        ]
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Urine is revised filtrate",
    "summary": "The kidney does not skim wastes in one step: it filters a large volume of plasma, then revises that fluid by reclaiming useful solutes and adding selected acids.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "A common picture of the kidney is that it simply skims wastes out of blood. The actual sequence is stranger, and more expensive: the kidney first filters a huge volume of plasma, then spends most of its work putting useful material back.\n\nThat first fluid, the filtrate, is close to plasma minus cells and large proteins. Glucose, sodium, and water are in it. So are wastes. If that mixture left the body unchanged, you would lose your nutrients and your circulating volume in a matter of hours. The tubule therefore revises the fluid twice over: it reclaims what the body still needs, and it adds a few selected items — notably acid — that filtration alone would not clear fast enough.\n\nThe vocabulary in this puzzle is the names of those operations, the filter that starts them, and the substances that move in each direction. The point is not to memorize a kidney diagram. It is to see why urine is a revised filtrate rather than a simple extract of blood.\n\n**Before you start:** if a substance appears in urine, did the kidney fail to keep it, or did it deliberately put it there?"
    },
    "sources": [
      {
        "label": "OpenStax Anatomy and Physiology 2e: Physiology of Urine Formation",
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation"
      },
      {
        "label": "OpenStax Anatomy and Physiology 2e: Tubular Reabsorption",
        "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption"
      },
      {
        "label": "Renal physiology (Wikipedia)",
        "href": "https://en.wikipedia.org/wiki/Renal_physiology"
      }
    ]
  },
  "generativeAssistance": [
    {
      "system": "Cursor Grok 4.6",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Cursor",
      "date": "2026-08-21"
    },
    {
      "system": "Cursor Grok 4.6",
      "scope": "lenses",
      "role": "drafted",
      "provider": "Cursor",
      "date": "2026-08-21"
    },
    {
      "system": "Cursor Grok 4.6",
      "scope": "learningIntroduction",
      "role": "drafted",
      "provider": "Cursor",
      "date": "2026-08-21"
    }
  ]
});
