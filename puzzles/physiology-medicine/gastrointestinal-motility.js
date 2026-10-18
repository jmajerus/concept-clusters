// Generated from content/puzzles/gastrointestinal-motility.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "gastrointestinal-motility",
  "title": "Gastrointestinal motility",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "gastrointestinal"
  },
  "info": {
    "text": "How the gut wall times, coordinates, and shapes its contractions, from swallowing to defecation.",
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 63–64",
        "author": "John E. Hall, Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021"
      },
      {
        "title": "Interstitial cells of Cajal as pacemakers in the gastrointestinal tract",
        "author": "Kenton M. Sanders, Sang Don Koh, Sean M. Ward",
        "publisher": "Annual Review of Physiology 68",
        "year": "2006",
        "pages": "307–343",
        "url": "https://pubmed.ncbi.nlm.nih.gov/16460275/"
      },
      {
        "title": "The enteric nervous system and neurogastroenterology",
        "author": "John B. Furness",
        "publisher": "Nature Reviews Gastroenterology & Hepatology 9(5)",
        "year": "2012",
        "pages": "286–294",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22392290/"
      },
      {
        "title": "Interstitial cells of Cajal: clinical relevance in pediatric gastrointestinal motility disorders",
        "author": "Florian Friedmacher, Udo Rolle",
        "publisher": "Pediatric Surgery International 39",
        "year": "2023",
        "pages": "188",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10133055/"
      },
      {
        "title": "23.3 The Mouth, Pharynx, and Esophagus — Anatomy and Physiology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus"
      },
      {
        "title": "23.4 The Stomach — Anatomy and Physiology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach"
      },
      {
        "title": "23.5 The Small and Large Intestines — Anatomy and Physiology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines"
      }
    ]
  },
  "clusters": [
    {
      "id": "electrical-rhythm",
      "name": "Electrical rhythm",
      "color": "teal",
      "fact": "Interstitial cells of Cajal generate slow waves, rhythmic swings in membrane potential that spread through the electrically coupled smooth muscle. Slow waves set when contraction can happen; spike potentials firing at their peaks let calcium in and trigger it.",
      "terms": [
        "slow waves",
        "interstitial cells of Cajal",
        "spike potentials"
      ],
      "seeds": [
        "slow waves",
        "interstitial cells of Cajal"
      ],
      "termInfo": {
        "interstitial cells of Cajal": {
          "text": "Pacemaker cells woven among the smooth muscle layers that generate and propagate slow waves.",
          "links": [
            {
              "href": "wiki:Interstitial cell of Cajal"
            }
          ]
        },
        "slow waves": {
          "text": "Rhythmic depolarizations of the gut wall, about 3 per minute in the stomach and up to 12 in the duodenum. Mostly they set timing rather than cause contraction themselves.",
          "links": [
            {
              "href": "wiki:Slow-wave potential"
            }
          ]
        },
        "spike potentials": "True action potentials fired at slow-wave peaks when the membrane is depolarized enough; calcium enters through them and the muscle contracts."
      },
      "info": {
        "text": "Gut smooth muscle works as an electrical syncytium: gap junctions let one rhythm spread through a whole sheet of cells.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/16460275/",
            "label": "Sanders et al.: ICC as pacemakers"
          }
        ]
      }
    },
    {
      "id": "enteric-nerves",
      "name": "Enteric nervous system",
      "color": "blue",
      "fact": "The myenteric plexus, between the muscle layers, governs movement; the submucosal plexus governs local secretion, absorption, and blood flow. Enteric motor neurons excite the muscle with acetylcholine and relax it with nitric oxide.",
      "terms": [
        "myenteric plexus",
        "submucosal plexus",
        "acetylcholine",
        "nitric oxide"
      ],
      "seeds": [
        "myenteric plexus",
        "submucosal plexus"
      ],
      "termInfo": {
        "acetylcholine": "Main excitatory transmitter of enteric motor neurons; it depolarizes the muscle and raises spike firing.",
        "myenteric plexus": {
          "text": "Nerve network between the circular and longitudinal muscle (Auerbach's plexus) that controls gut movement.",
          "links": [
            {
              "href": "wiki:Myenteric plexus"
            }
          ]
        },
        "nitric oxide": "Main inhibitory transmitter of enteric motor neurons, released with vasoactive intestinal peptide (VIP); it relaxes the muscle.",
        "submucosal plexus": {
          "text": "Nerve network in the submucosa (Meissner's plexus) that controls local secretion, absorption, and blood flow.",
          "links": [
            {
              "href": "wiki:Submucosal plexus"
            }
          ]
        }
      },
      "info": {
        "text": "The gut's own nervous system can run its reflexes even when cut off from the brain; sympathetic and parasympathetic nerves only adjust it.",
        "links": [
          {
            "href": "https://pubmed.ncbi.nlm.nih.gov/22392290/",
            "label": "Furness: the enteric nervous system"
          }
        ]
      }
    },
    {
      "id": "swallowing",
      "name": "Swallowing",
      "color": "amber",
      "fact": "In the pharyngeal stage, a brainstem reflex seals the airway and opens the upper esophageal sphincter. Primary peristalsis carries the bolus down the esophagus, secondary peristalsis clears whatever remains, and the lower esophageal sphincter opens to admit it and otherwise stays closed against reflux.",
      "terms": [
        "upper esophageal sphincter",
        "lower esophageal sphincter",
        "pharyngeal stage",
        "primary peristalsis",
        "secondary peristalsis"
      ],
      "seeds": [
        "upper esophageal sphincter",
        "lower esophageal sphincter"
      ],
      "termInfo": {
        "lower esophageal sphincter": "Tonically closed ring at the stomach end of the esophagus (the gastroesophageal sphincter) that relaxes ahead of each swallow.",
        "pharyngeal stage": "Involuntary stage coordinated by the brainstem swallowing center: the palate and epiglottis seal the airways and the upper sphincter opens.",
        "primary peristalsis": "The esophageal wave that continues the swallow begun in the pharynx, reaching the stomach in about 8 to 10 seconds.",
        "secondary peristalsis": "A new wave set off by distension when food is left in the esophagus after the primary wave passes.",
        "upper esophageal sphincter": "Ring of muscle at the top of the esophagus that relaxes during the pharyngeal stage and closes behind the bolus."
      },
      "info": {
        "text": "Swallowing starts voluntarily in the mouth; from the pharynx on it runs as an automatic reflex.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus",
            "label": "OpenStax: mouth, pharynx, and esophagus"
          }
        ]
      }
    },
    {
      "id": "gastric-mixing-emptying",
      "name": "Gastric mixing and emptying",
      "color": "magenta",
      "fact": "Mixing waves sweep toward the antrum and grind food with gastric juice into chyme. The narrow pyloric sphincter passes only a few milliliters with each contraction, so most antral contents are driven back by retropulsion, and the strength of the antral contractions, the pyloric pump, sets the rate of emptying.",
      "terms": [
        "pyloric sphincter",
        "mixing waves",
        "pyloric pump",
        "retropulsion"
      ],
      "seeds": [
        "pyloric sphincter",
        "mixing waves"
      ],
      "termInfo": {
        "mixing waves": "Weak constrictor waves, driven by the gastric slow waves about every 20 seconds, that move from the body toward the antrum.",
        "pyloric pump": "Intense antral peristalsis that forces chyme through the pylorus; its strength is the main control on emptying.",
        "pyloric sphincter": {
          "text": "Thick ring of circular muscle at the stomach outlet; partly open, it lets fluid through but holds back solids until they are ground fine.",
          "links": [
            {
              "href": "wiki:Pylorus"
            }
          ]
        },
        "retropulsion": "Antral contents squirted back toward the stomach body when a contraction meets the closing pylorus, which mixes them further."
      },
      "info": {
        "text": "The stomach body stores, the antrum grinds, and the pylorus meters chyme into the duodenum.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach",
            "label": "OpenStax: the stomach"
          }
        ]
      }
    },
    {
      "id": "small-intestine",
      "name": "Small intestine",
      "color": "olive",
      "fact": "Segmentation contractions chop chyme, mix it with digestive juices, and press it against the absorbing mucosa, while weak peristaltic waves move it slowly onward. Intense irritation instead provokes a peristaltic rush that sweeps contents into the colon.",
      "terms": [
        "segmentation",
        "peristaltic rush"
      ],
      "seeds": [
        "segmentation"
      ],
      "termInfo": {
        "peristaltic rush": "Powerful, fast peristalsis set off by strong irritation of the mucosa, as in infectious diarrhea; it clears the intestine within minutes.",
        "segmentation": {
          "text": "Alternating rings of contraction that divide the intestine into segments and mix its contents rather than push them.",
          "links": [
            {
              "href": "wiki:Segmentation contractions"
            }
          ]
        }
      },
      "info": {
        "text": "Chyme takes three to five hours to travel from the pylorus to the ileocecal valve.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines",
            "label": "OpenStax: the small and large intestines"
          }
        ]
      }
    },
    {
      "id": "colon-defecation",
      "name": "Colon and defecation",
      "color": "brown",
      "fact": "Haustrations knead and slowly roll colonic contents so the colon can absorb water. A few times a day, mass movements push feces into the rectum and start the defecation reflex; the involuntary internal anal sphincter relaxes, and the voluntary external anal sphincter decides whether defecation proceeds.",
      "terms": [
        "haustrations",
        "mass movements",
        "defecation reflex",
        "internal anal sphincter",
        "external anal sphincter"
      ],
      "seeds": [
        "haustrations",
        "mass movements"
      ],
      "termInfo": {
        "defecation reflex": {
          "text": "Rectal distension triggers a weak intrinsic reflex, greatly strengthened by a parasympathetic loop through the sacral spinal cord.",
          "links": [
            {
              "href": "wiki:Defecation"
            }
          ]
        },
        "external anal sphincter": {
          "text": "Striated-muscle ring under voluntary control through the pudendal nerve.",
          "links": [
            {
              "href": "wiki:External anal sphincter"
            }
          ]
        },
        "haustrations": {
          "text": "Sac-like bulges formed by combined circular and longitudinal contractions; they knead contents and roll them slowly forward.",
          "links": [
            {
              "href": "wiki:Haustrum (anatomy)"
            }
          ]
        },
        "internal anal sphincter": {
          "text": "Smooth-muscle ring that relaxes reflexively when the rectum fills.",
          "links": [
            {
              "href": "wiki:Internal anal sphincter"
            }
          ]
        },
        "mass movements": "Strong peristaltic surges, one to three times a day, that drive feces along much of the colon into the rectum."
      },
      "info": {
        "text": "Most colonic movement is slow mixing; propulsion comes in a few strong surges a day.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines",
            "label": "OpenStax: the small and large intestines"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "slow-wave-frequency-gradient",
      "term": "slow-wave frequency gradient",
      "clusters": [
        0,
        4
      ],
      "fact": "Slow-wave frequency falls from about 12 per minute in the duodenum to about 8 or 9 in the terminal ileum. Segmentation follows that rhythm, so upstream segments contract more often and the mixing drifts chyme toward the colon.",
      "info": "The slow-wave rate is the ceiling on how often any segment can contract.",
      "relationKind": "dynamic",
      "idealTerms": [
        "slow waves",
        "segmentation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 4
      }
    },
    {
      "id": "peristaltic-reflex",
      "term": "peristaltic reflex",
      "clusters": [
        1,
        4
      ],
      "fact": "Stretch from a bolus makes the myenteric plexus contract the wall behind it and relax the wall ahead of it, so the bolus moves forward. The intestine works this way even after its extrinsic nerves are cut.",
      "info": {
        "text": "Also called the law of the gut. The same reflex drives peristalsis in the esophagus and colon.",
        "links": [
          {
            "href": "wiki:Peristalsis"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "myenteric plexus",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 4
      }
    },
    {
      "id": "receptive-relaxation",
      "term": "receptive relaxation",
      "clusters": [
        2,
        3
      ],
      "fact": "As a swallow begins, a vagovagal reflex relaxes the lower esophageal sphincter and the stomach ahead of the bolus, so the stomach can fill with a meal without its pressure rising.",
      "info": "Also called gastric accommodation. Guyton also uses the phrase for the relaxation ahead of any peristaltic wave.",
      "relationKind": "dynamic",
      "idealTerms": [
        "lower esophageal sphincter",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "enterogastric-reflex",
      "term": "enterogastric reflex",
      "clusters": [
        4,
        3
      ],
      "fact": "Distension, acid, fat, protein breakdown products, or hypertonic chyme in the duodenum weaken the pyloric pump and tighten the pylorus, so the stomach empties only as fast as the intestine can process its chyme.",
      "info": "Hormones add a second brake: cholecystokinin released by fat in the duodenum also slows emptying.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "pyloric pump"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "migrating-motor-complex",
      "term": "migrating motor complex",
      "clusters": [
        3,
        4
      ],
      "fact": "Between meals, a band of intense contraction starts in the stomach about every 90 minutes and travels the length of the small intestine, sweeping out undigested solids and bacteria. A meal interrupts it.",
      "info": {
        "text": "Each cycle is triggered by motilin, a hormone from the upper small intestine.",
        "links": [
          {
            "href": "wiki:Migrating motor complex"
          }
        ]
      },
      "relationKind": "continuity",
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 4
      }
    },
    {
      "id": "ileocecal-valve",
      "term": "ileocecal valve",
      "clusters": [
        4,
        5
      ],
      "fact": "The valve and its sphincter let ileal contents into the cecum and block backflow from the colon. Pressure from the ileal side opens it; distension of the cecum tightens it.",
      "info": {
        "text": "After a meal the gastroileal reflex relaxes the sphincter and speeds ileal emptying.",
        "links": [
          {
            "href": "wiki:Ileocecal valve"
          }
        ]
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "bidirectional"
      }
    },
    {
      "id": "gastrocolic-reflex",
      "term": "gastrocolic reflex",
      "clusters": [
        3,
        5
      ],
      "fact": "Filling of the stomach sets off mass movements in the colon through autonomic nerves, which is why the urge to defecate often follows a meal.",
      "info": {
        "text": "A duodenocolic reflex from the duodenum does the same.",
        "links": [
          {
            "href": "wiki:Gastrocolic reflex"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "mass movements"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 5
      }
    }
  ],
  "lenses": [
    {
      "id": "pacemaker-cells",
      "prompt": "Which cells generate the gut's slow waves?",
      "explanation": "Smooth muscle cells follow the rhythm through gap junctions; the interstitial cells of Cajal generate it. Losing these cells disturbs motility in disorders such as gastroparesis.",
      "targets": [
        "interstitial cells of Cajal"
      ],
      "reasons": {
        "interstitial cells of Cajal": "They are the gut's pacemakers, setting and spreading the slow-wave rhythm."
      }
    },
    {
      "id": "calcium-entry",
      "prompt": "Which electrical events, firing at slow-wave peaks, admit the calcium that triggers contraction?",
      "explanation": "Slow waves mostly set the timing. Contraction follows the spike potentials that fire when a slow-wave peak crosses threshold, and nerve and hormone signals decide how many fire.",
      "targets": [
        "spike potentials"
      ],
      "reasons": {
        "spike potentials": "Their channels let calcium into the muscle, and the calcium sets off contraction."
      }
    },
    {
      "id": "enteric-transmitters",
      "prompt": "Which transmitters do enteric motor neurons release onto gut smooth muscle?",
      "explanation": "Coordinated gut movement is built from these two commands, contract here and relax there. Acetylcholine contracts the wall behind a bolus; nitric oxide relaxes the wall ahead of it and opens the smooth-muscle sphincters.",
      "targets": [
        "acetylcholine",
        "nitric oxide"
      ],
      "reasons": {
        "acetylcholine": "The excitatory transmitter: it depolarizes the muscle and raises spike firing.",
        "nitric oxide": "The inhibitory transmitter, released with VIP: it relaxes the muscle."
      }
    },
    {
      "id": "law-of-the-gut",
      "prompt": "Which reflex, sometimes called the law of the gut, contracts the wall behind a bolus and relaxes it ahead?",
      "explanation": "The peristaltic reflex is local: it runs within the gut wall even when extrinsic nerves are cut.",
      "targets": [
        "peristaltic reflex"
      ],
      "reasons": {
        "peristaltic reflex": "Stretch from the bolus sets off contraction above and relaxation below through the myenteric plexus."
      }
    },
    {
      "id": "esophageal-waves",
      "prompt": "Which waves carry a bolus down the esophagus?",
      "explanation": "The primary wave is part of the swallow itself and usually suffices. Secondary peristalsis is the backup, triggered by whatever the first wave failed to clear.",
      "targets": [
        "primary peristalsis",
        "secondary peristalsis"
      ],
      "reasons": {
        "primary peristalsis": "The wave that continues the swallow begun in the pharynx.",
        "secondary peristalsis": "A new wave set off by distension when food is left behind after the primary wave."
      }
    },
    {
      "id": "striated-sphincters",
      "prompt": "Which sphincters are made of striated muscle?",
      "explanation": "The gut begins and ends in skeletal muscle. The lower esophageal, pyloric, ileocecal, and internal anal sphincters are smooth muscle run by the enteric and autonomic nerves. Of the two striated sphincters, only the external anal sphincter can be held closed by choice; the upper esophageal sphincter opens by reflex.",
      "targets": [
        "upper esophageal sphincter",
        "external anal sphincter"
      ],
      "reasons": {
        "external anal sphincter": "Skeletal muscle at the end of the tract, under voluntary control through the pudendal nerve.",
        "upper esophageal sphincter": "Skeletal muscle at the top of the esophagus, opened by the brainstem swallowing reflex."
      }
    },
    {
      "id": "mixing-not-moving",
      "prompt": "Which movements mainly mix contents rather than move them along?",
      "explanation": "Each region pairs a mixing movement with a propulsive one: the pyloric pump empties the stomach, peristalsis moves chyme through the small intestine, and mass movements drive feces into the rectum. Mixing serves digestion and absorption, so it occupies most of the time food spends in the gut.",
      "targets": [
        "mixing waves",
        "retropulsion",
        "segmentation",
        "haustrations"
      ],
      "reasons": {
        "haustrations": "Sac-like bulges that knead colonic contents against the absorbing wall.",
        "mixing waves": "Weak constrictor waves that grind food with gastric juice into chyme.",
        "retropulsion": "The backward jet that returns most antral chyme to the stomach body for further grinding.",
        "segmentation": "Alternating rings of contraction that chop and mix chyme with digestive juices."
      }
    },
    {
      "id": "segmentation-drift",
      "prompt": "Which term explains why segmentation slowly drifts chyme toward the colon?",
      "explanation": "Segmentation itself mixes rather than propels, but its rate follows the local slow-wave frequency, which falls along the intestine.",
      "targets": [
        "slow-wave frequency gradient"
      ],
      "reasons": {
        "slow-wave frequency gradient": "Upper segments contract more often than lower ones, so the mixing has a downstream bias."
      }
    },
    {
      "id": "duodenal-brake",
      "prompt": "Which nervous reflex slows gastric emptying when acid or fat reaches the duodenum?",
      "explanation": "The reflex runs through the enteric plexuses, sympathetic ganglia, and the vagus. Cholecystokinin adds a hormonal brake on emptying when fat arrives.",
      "targets": [
        "enterogastric reflex"
      ],
      "reasons": {
        "enterogastric reflex": "Duodenal signals weaken the pyloric pump and tighten the pylorus."
      }
    },
    {
      "id": "organ-to-organ",
      "prompt": "Which reflexes let a stimulus in one organ change motility in a different organ?",
      "explanation": "These reflexes coordinate the tract as a whole, traveling through the vagus or autonomic ganglia. The peristaltic reflex and secondary peristalsis act where the stimulus is, and the defecation reflex acts within the rectum and anal canal it is triggered from.",
      "targets": [
        "receptive relaxation",
        "enterogastric reflex",
        "gastrocolic reflex"
      ],
      "reasons": {
        "enterogastric reflex": "Chyme in the duodenum slows the stomach's emptying.",
        "gastrocolic reflex": "Filling of the stomach sets off mass movements in the colon.",
        "receptive relaxation": "A swallow relaxes the stomach before food reaches it."
      }
    },
    {
      "id": "fasting-sweep",
      "prompt": "Which fasting pattern sweeps undigested solids out of the stomach and down the small intestine?",
      "explanation": "Motilin triggers each cycle and a meal stops it. A peristaltic rush also clears the intestine, but it is a response to irritation, not a fasting rhythm.",
      "targets": [
        "migrating motor complex"
      ],
      "reasons": {
        "migrating motor complex": "About every 90 minutes between meals, a band of strong contraction travels from the stomach through the small intestine."
      }
    },
    {
      "id": "backflow-barrier",
      "prompt": "Which structure keeps colonic contents from flowing back into the ileum?",
      "explanation": "Cecal distension tightens the ileocecal sphincter, protecting the small intestine from colonic contents and bacteria.",
      "targets": [
        "ileocecal valve"
      ],
      "reasons": {
        "ileocecal valve": "Its lips and sphincter close when pressure builds on the colon side."
      }
    },
    {
      "id": "hirschsprung",
      "prompt": "Which nerve networks are absent from the narrowed segment of colon in Hirschsprung disease?",
      "explanation": "Enteric neurons fail to colonize the distal colon during development. The aganglionic segment acts as a functional obstruction, and the colon above it distends.",
      "targets": [
        "myenteric plexus",
        "submucosal plexus"
      ],
      "reasons": {
        "myenteric plexus": "Without it, the segment cannot relax and propagate peristalsis, so it stays contracted.",
        "submucosal plexus": "Hirschsprung disease is a congenital absence of ganglion cells from both plexuses."
      }
    },
    {
      "id": "failed-relaxation",
      "prompt": "Which sphincters fail to relax when the inhibitory neurons serving them are lost?",
      "explanation": "Both are smooth-muscle sphincters kept tonically closed and opened by nitric-oxide neurons. The striated upper esophageal and external anal sphincters are run by somatic nerves instead, so these diseases spare them.",
      "targets": [
        "lower esophageal sphincter",
        "internal anal sphincter"
      ],
      "reasons": {
        "internal anal sphincter": "In Hirschsprung disease it no longer relaxes when the rectum fills; that missing reflex is a diagnostic sign.",
        "lower esophageal sphincter": "In achalasia it stays closed when a swallow arrives, so food backs up in the esophagus."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "the-autonomic-nervous-system",
        "reason": "See the extrinsic nerves that adjust the gut's own nervous system, including the vagus behind receptive relaxation."
      },
      {
        "id": "gastric-acid-secretion",
        "reason": "Follow the same meal through the stomach's chemistry, where duodenal hormones that slow emptying also brake acid secretion."
      },
      {
        "id": "digestive-breakdown",
        "reason": "Step back to the introductory survey of how the gut moves, mixes, and dismantles food."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the gut moves",
    "summary": "The electrical rhythm, enteric nerves, and motor patterns that move food from mouth to rectum.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "From the throat to the rectum, food is moved by the smooth muscle of the gut wall. Each region shapes its contractions to its job: the esophagus transports, the stomach stores, grinds, and meters, the small intestine mixes for digestion and absorption, and the colon holds contents while it absorbs water. Underneath all of it are two shared systems, an electrical rhythm built into the muscle and a nervous system built into the wall.\r\n\r\n## Electrical rhythm\r\n\r\nGut smooth muscle is never fully at rest. Interstitial cells of Cajal, pacemaker cells woven among the muscle layers, generate slow waves: rhythmic swings in membrane potential that spread through the muscle, which is electrically coupled by gap junctions. Slow waves run at about 3 per minute in the stomach and up to 12 per minute in the duodenum. In most of the gut they do not cause contraction by themselves. When a slow-wave peak carries the membrane past threshold, spike potentials fire, calcium enters, and the muscle contracts. Slow waves therefore set when contraction can happen, and nerves and hormones decide how strongly it does, by moving the membrane toward or away from threshold.\r\n\r\n## The enteric nervous system\r\n\r\nThe gut wall holds its own nervous system, with two networks. The myenteric plexus, between the circular and longitudinal muscle, governs movement. The submucosal plexus governs local secretion, absorption, and blood flow. Enteric motor neurons excite the muscle with acetylcholine and relax it with nitric oxide, released together with vasoactive intestinal peptide. Sympathetic and parasympathetic nerves adjust this system, but it can run its reflexes on its own. The most important is the peristaltic reflex, sometimes called the law of the gut: stretch from a bolus makes the wall contract behind it and relax ahead of it, so the bolus moves forward.\r\n\r\n## Swallowing\r\n\r\nSwallowing begins voluntarily as the tongue pushes food back. The pharyngeal stage is an involuntary reflex coordinated by the brainstem: the palate and epiglottis seal the airways, and the upper esophageal sphincter opens. Primary peristalsis continues the swallow down the esophagus. If food remains, the distension sets off secondary peristalsis to clear it. At the bottom, the lower esophageal sphincter stays tonically closed against reflux but relaxes ahead of each swallow. In achalasia, inhibitory myenteric neurons are lost and this sphincter fails to relax.\r\n\r\n## The stomach\r\n\r\nAs a swallow begins, receptive relaxation, a vagovagal reflex, relaxes the stomach so it can fill with a meal without its pressure rising. Weak mixing waves then sweep toward the antrum, grinding food with gastric juice into chyme. The pyloric sphincter at the outlet passes only a few milliliters with each contraction, so most of the antral contents are driven back toward the stomach body by retropulsion, which mixes them further. The strength of the antral contractions, called the pyloric pump, sets the rate of emptying. Feedback from the duodenum holds that rate in check. Through the enterogastric reflex, distension, acid, fat, and protein breakdown products in the duodenum weaken the pyloric pump and tighten the pylorus, and cholecystokinin adds a hormonal brake. The stomach thus empties only as fast as the intestine can handle its chyme.\r\n\r\n## The small intestine\r\n\r\nThe small intestine mostly mixes. Segmentation contractions divide it into short segments that relax and contract in alternation, chopping chyme, mixing it with digestive juices, and pressing it against the absorbing surface. Weak peristaltic waves move it slowly onward, taking three to five hours from pylorus to colon. A slow-wave frequency gradient gives the mixing a direction: slow waves run at about 12 per minute in the duodenum and 8 or 9 in the terminal ileum, so upstream segments contract more often and chyme drifts downstream. Strong irritation of the lining, as in infectious diarrhea, provokes a peristaltic rush that sweeps contents into the colon within minutes.\r\n\r\nBetween meals the pattern changes. About every 90 minutes, the migrating motor complex sends a band of intense contraction from the stomach down the length of the small intestine, sweeping out undigested solids and bacteria. Each cycle is triggered by the hormone motilin, and eating interrupts it. At the far end, the ileocecal valve lets ileal contents into the colon and blocks backflow; pressure from the ileum opens it, and distension of the cecum tightens it.\r\n\r\n## The colon and defecation\r\n\r\nIn the colon, haustrations knead contents in sac-like bulges and roll them slowly forward while water is absorbed. Propulsion comes in a few strong surges a day: mass movements push feces along much of the colon into the rectum. A meal often triggers them through the gastrocolic reflex, which is why the urge to defecate commonly follows breakfast. Rectal filling sets off the defecation reflex, a weak intrinsic reflex amplified by a parasympathetic loop through the sacral spinal cord. The internal anal sphincter, smooth muscle, relaxes on its own; the external anal sphincter, striated muscle under voluntary control, decides whether defecation proceeds. In Hirschsprung disease, both enteric plexuses are missing from a stretch of distal colon, which then stays contracted and blocks the passage of feces."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "gastrointestinal-motility",
      "puzzleRevision": "fnv1a32:77f75b8f",
      "board": {
        "width": 1270,
        "height": 830
      },
      "nodes": {
        "term:slow waves": {
          "x": 495.16,
          "y": 95.44
        },
        "term:interstitial cells of Cajal": {
          "x": 550.51,
          "y": 25.89
        },
        "term:spike potentials": {
          "x": 752.58,
          "y": 33.88
        },
        "term:myenteric plexus": {
          "x": 974.42,
          "y": 278.78
        },
        "term:submucosal plexus": {
          "x": 872.76,
          "y": 114.71
        },
        "term:acetylcholine": {
          "x": 1138.31,
          "y": 169.27
        },
        "term:nitric oxide": {
          "x": 1059.07,
          "y": 100.89
        },
        "term:upper esophageal sphincter": {
          "x": 1150.28,
          "y": 393.53
        },
        "term:lower esophageal sphincter": {
          "x": 1063.7,
          "y": 634.92
        },
        "term:pharyngeal stage": {
          "x": 952.68,
          "y": 409.98
        },
        "term:primary peristalsis": {
          "x": 935.65,
          "y": 530.75
        },
        "term:secondary peristalsis": {
          "x": 1183.85,
          "y": 560.71
        },
        "term:pyloric sphincter": {
          "x": 632.29,
          "y": 800.14
        },
        "term:mixing waves": {
          "x": 771.68,
          "y": 574.27
        },
        "term:pyloric pump": {
          "x": 642.87,
          "y": 600.7
        },
        "term:retropulsion": {
          "x": 847.09,
          "y": 632.32
        },
        "term:segmentation": {
          "x": 514.72,
          "y": 326.3
        },
        "term:peristaltic rush": {
          "x": 337.38,
          "y": 510.86
        },
        "term:haustrations": {
          "x": 57.8,
          "y": 179.69
        },
        "term:mass movements": {
          "x": 176.21,
          "y": 422.96
        },
        "term:defecation reflex": {
          "x": 336.53,
          "y": 165.13
        },
        "term:internal anal sphincter": {
          "x": 92.45,
          "y": 342.23
        },
        "term:external anal sphincter": {
          "x": 158.53,
          "y": 113.99
        },
        "term:slow-wave frequency gradient": {
          "x": 634.17,
          "y": 222.7
        },
        "term:peristaltic reflex": {
          "x": 773.16,
          "y": 347.06
        },
        "term:receptive relaxation": {
          "x": 913.18,
          "y": 799.25
        },
        "term:enterogastric reflex": {
          "x": 667.3,
          "y": 490.24
        },
        "term:migrating motor complex": {
          "x": 441.68,
          "y": 632.26
        },
        "term:ileocecal valve": {
          "x": 326.51,
          "y": 358.45
        },
        "term:gastrocolic reflex": {
          "x": 282.64,
          "y": 790.91
        },
        "cluster:0": {
          "x": 680.44,
          "y": 134.76
        },
        "cluster:1": {
          "x": 960.15,
          "y": 213.16
        },
        "cluster:2": {
          "x": 1071.75,
          "y": 474.68
        },
        "cluster:3": {
          "x": 720.61,
          "y": 715.69
        },
        "cluster:4": {
          "x": 501.96,
          "y": 413.5
        },
        "cluster:5": {
          "x": 236.47,
          "y": 260.19
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T21:13:32.894Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "gastrointestinal-motility",
      "puzzleRevision": "fnv1a32:77f75b8f",
      "board": {
        "width": 1270,
        "height": 830
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 248.71,
          "y": 463.99,
          "pinned": true
        },
        "cluster:1": {
          "x": 648.38,
          "y": 291.14,
          "pinned": true
        },
        "cluster:2": {
          "x": 292.45,
          "y": 174.08,
          "pinned": true
        },
        "cluster:3": {
          "x": 1017.1,
          "y": 225.07,
          "pinned": true
        },
        "cluster:4": {
          "x": 544.54,
          "y": 670.86,
          "pinned": true
        },
        "cluster:5": {
          "x": 1050.62,
          "y": 649.81,
          "pinned": true
        }
      },
      "bridges": {
        "term:slow-wave frequency gradient": {
          "x": 244.9,
          "y": 679.55,
          "pinned": true
        },
        "term:peristaltic reflex": {
          "x": 483.35,
          "y": 463.53,
          "pinned": true
        },
        "term:receptive relaxation": {
          "x": 664.3,
          "y": 89.9,
          "pinned": true
        },
        "term:enterogastric reflex": {
          "x": 863.01,
          "y": 530.94,
          "pinned": true
        },
        "term:migrating motor complex": {
          "x": 728.61,
          "y": 465.52,
          "pinned": true
        },
        "term:ileocecal valve": {
          "x": 768.35,
          "y": 752.01,
          "pinned": true
        },
        "term:gastrocolic reflex": {
          "x": 1138.95,
          "y": 436.81,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "slow waves",
          "interstitial cells of Cajal",
          "spike potentials"
        ],
        "cluster:1": [
          "myenteric plexus",
          "submucosal plexus",
          "acetylcholine",
          "nitric oxide"
        ],
        "cluster:2": [
          "upper esophageal sphincter",
          "lower esophageal sphincter",
          "pharyngeal stage",
          "primary peristalsis",
          "secondary peristalsis"
        ],
        "cluster:3": [
          "pyloric sphincter",
          "mixing waves",
          "pyloric pump",
          "retropulsion"
        ],
        "cluster:4": [
          "segmentation",
          "peristaltic rush"
        ],
        "cluster:5": [
          "haustrations",
          "mass movements",
          "defecation reflex",
          "internal anal sphincter",
          "external anal sphincter"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "spike potentials",
          "interstitial cells of Cajal",
          "slow waves"
        ],
        "cluster:1": [
          "acetylcholine",
          "submucosal plexus",
          "myenteric plexus",
          "nitric oxide"
        ],
        "cluster:2": [
          "pharyngeal stage",
          "secondary peristalsis",
          "upper esophageal sphincter",
          "lower esophageal sphincter",
          "primary peristalsis"
        ],
        "cluster:3": [
          "retropulsion",
          "pyloric sphincter",
          "mixing waves",
          "pyloric pump"
        ],
        "cluster:4": [
          "segmentation",
          "peristaltic rush"
        ],
        "cluster:5": [
          "mass movements",
          "external anal sphincter",
          "internal anal sphincter",
          "defecation reflex",
          "haustrations"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 2829.4211674149255
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T21:12:38.808Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "gastrointestinal-motility",
      "puzzleRevision": "fnv1a32:77f75b8f",
      "board": {
        "width": 1270,
        "height": 830
      },
      "nodes": {
        "term:slow waves": {
          "x": 726.13,
          "y": 227.23,
          "pinned": true
        },
        "term:interstitial cells of Cajal": {
          "x": 624.35,
          "y": 136.01,
          "pinned": false
        },
        "term:spike potentials": {
          "x": 806.55,
          "y": 114.73,
          "pinned": false
        },
        "term:myenteric plexus": {
          "x": 934.96,
          "y": 218.23,
          "pinned": true
        },
        "term:submucosal plexus": {
          "x": 1031,
          "y": 151.55,
          "pinned": true
        },
        "term:acetylcholine": {
          "x": 920.11,
          "y": 349.56,
          "pinned": true
        },
        "term:nitric oxide": {
          "x": 1029.43,
          "y": 295.1,
          "pinned": true
        },
        "term:upper esophageal sphincter": {
          "x": 1168.1,
          "y": 527.64,
          "pinned": true
        },
        "term:lower esophageal sphincter": {
          "x": 978.92,
          "y": 596.76,
          "pinned": true
        },
        "term:pharyngeal stage": {
          "x": 1163.91,
          "y": 375.08,
          "pinned": false
        },
        "term:primary peristalsis": {
          "x": 1018.15,
          "y": 436.68,
          "pinned": false
        },
        "term:secondary peristalsis": {
          "x": 1151.96,
          "y": 685.03,
          "pinned": true
        },
        "term:pyloric sphincter": {
          "x": 573.03,
          "y": 798.09,
          "pinned": true
        },
        "term:mixing waves": {
          "x": 730.19,
          "y": 797.1,
          "pinned": true
        },
        "term:pyloric pump": {
          "x": 632.41,
          "y": 685.17,
          "pinned": false
        },
        "term:retropulsion": {
          "x": 415.77,
          "y": 794.13,
          "pinned": true
        },
        "term:segmentation": {
          "x": 504.22,
          "y": 495.3,
          "pinned": true
        },
        "term:peristaltic rush": {
          "x": 344.7,
          "y": 548.84,
          "pinned": false
        },
        "term:haustrations": {
          "x": 257.79,
          "y": 290.1,
          "pinned": true
        },
        "term:mass movements": {
          "x": 197.42,
          "y": 422.02,
          "pinned": true
        },
        "term:defecation reflex": {
          "x": 423.61,
          "y": 187.19,
          "pinned": true
        },
        "term:internal anal sphincter": {
          "x": 93.66,
          "y": 289.27,
          "pinned": true
        },
        "term:external anal sphincter": {
          "x": 226.69,
          "y": 155.32,
          "pinned": true
        },
        "term:slow-wave frequency gradient": {
          "x": 562.29,
          "y": 317.5,
          "pinned": true
        },
        "term:peristaltic reflex": {
          "x": 731.64,
          "y": 416.48,
          "pinned": false
        },
        "term:receptive relaxation": {
          "x": 781.09,
          "y": 679.56,
          "pinned": false
        },
        "term:enterogastric reflex": {
          "x": 729.23,
          "y": 541.3,
          "pinned": true
        },
        "term:migrating motor complex": {
          "x": 476.65,
          "y": 657.38,
          "pinned": false
        },
        "term:ileocecal valve": {
          "x": 378.6,
          "y": 404.15,
          "pinned": false
        },
        "term:gastrocolic reflex": {
          "x": 304.41,
          "y": 698.76,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6338.86,
        "score": 6338.8636679219235
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T21:20:44.858Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-15T21:01:50.806Z",
    "bridgePreconnect": true,
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
