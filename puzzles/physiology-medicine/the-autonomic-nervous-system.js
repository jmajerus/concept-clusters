// Generated from content/puzzles/the-autonomic-nervous-system.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-autonomic-nervous-system",
  "title": "The autonomic nervous system",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "neurophysiology"
  },
  "info": {
    "text": "The autonomic nervous system runs the heart, smooth muscle, and glands through two divisions built on one plan: a two-neuron chain whose anatomy, transmitters, and receptors decide where and how each division acts.",
    "links": [
      {
        "href": "wiki:Autonomic nervous system"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology (14th ed.)",
        "author": "John E. Hall and Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2020"
      },
      {
        "title": "Anatomy and Physiology 2e — 15.1 Divisions of the Autonomic Nervous System",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/15-1-divisions-of-the-autonomic-nervous-system"
      },
      {
        "title": "Anatomy and Physiology 2e — 15.2 Autonomic Reflexes and Homeostasis",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/15-2-autonomic-reflexes-and-homeostasis"
      }
    ]
  },
  "clusters": [
    {
      "id": "sympathetic-division",
      "name": "Sympathetic division",
      "color": "teal",
      "fact": "Sympathetic preganglionic fibers leave the spinal cord from T1 to L2. Most synapse in the sympathetic chain beside the vertebral column; others continue to prevertebral ganglia near the aorta. Each preganglionic fiber branches to many postganglionic neurons, so the division can fire in mass discharge, the basis of the fight-or-flight response.",
      "terms": [
        "fight-or-flight response",
        "sympathetic chain",
        "thoracolumbar outflow",
        "prevertebral ganglia",
        "mass discharge"
      ],
      "seeds": [
        "fight-or-flight response",
        "sympathetic chain"
      ],
      "termInfo": {
        "fight-or-flight response": {
          "text": "The body-wide response to threat or exertion: faster, stronger heartbeat, higher blood pressure, wider airways, and glucose released into the blood. Guyton calls it the alarm or stress response.",
          "links": [
            {
              "href": "wiki:Fight-or-flight response"
            }
          ]
        },
        "mass discharge": "Firing of large parts of the system at once, possible because one preganglionic fiber branches to many postganglionic neurons, often at several levels.",
        "prevertebral ganglia": {
          "text": "Ganglia in front of the aorta, such as the celiac and mesenteric ganglia, reached by fibers that pass through the chain without synapsing.",
          "links": [
            {
              "href": "wiki:Prevertebral ganglia"
            }
          ]
        },
        "sympathetic chain": {
          "text": "The paired row of ganglia beside the vertebral column, linked into a chain by fibers running up and down between them. Also called the sympathetic trunk.",
          "links": [
            {
              "href": "wiki:Sympathetic trunk"
            }
          ]
        },
        "thoracolumbar outflow": "Preganglionic fibers leaving the spinal cord between the first thoracic and second lumbar segments."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sympathetic nervous system"
          }
        ]
      }
    },
    {
      "id": "parasympathetic-division",
      "name": "Parasympathetic division",
      "color": "blue",
      "fact": "Parasympathetic fibers leave through cranial nerves and the sacral cord, about three-quarters of them in the vagus nerve and the sacral ones in the pelvic splanchnic nerves. Long preganglionic fibers end in terminal ganglia on or in the target organ, so responses tend to be local, together favoring rest-and-digest functions.",
      "terms": [
        "rest-and-digest",
        "vagus nerve",
        "craniosacral outflow",
        "terminal ganglia",
        "pelvic splanchnic nerves"
      ],
      "seeds": [
        "rest-and-digest",
        "vagus nerve"
      ],
      "termInfo": {
        "craniosacral outflow": "Preganglionic fibers leaving through cranial nerves III, VII, IX, and X and the sacral spinal segments.",
        "pelvic splanchnic nerves": {
          "text": "The sacral parasympathetic nerves to the bladder, lower colon, rectum, and genitals. Guyton calls them the pelvic nerves.",
          "links": [
            {
              "href": "wiki:Pelvic splanchnic nerves"
            }
          ]
        },
        "rest-and-digest": "The pattern of feeding and recovery: a slower heart, active gut secretion and movement, and emptying of bladder and bowel.",
        "terminal ganglia": "Small ganglia on or within the wall of the target organ, also called intramural ganglia.",
        "vagus nerve": {
          "text": "Cranial nerve X, which carries about three-quarters of all parasympathetic fibers to the heart, lungs, and abdominal organs.",
          "links": [
            {
              "href": "wiki:Vagus nerve"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Parasympathetic nervous system"
          }
        ]
      }
    },
    {
      "id": "cholinergic-transmission",
      "name": "Cholinergic transmission",
      "color": "amber",
      "fact": "Acetylcholine is released by every preganglionic neuron and by parasympathetic postganglionic neurons. In the ganglia it acts on nicotinic receptors, fast ion channels; on target organs it acts on muscarinic receptors, which work through G proteins and can excite or inhibit.",
      "terms": [
        "acetylcholine",
        "muscarinic receptor",
        "nicotinic receptor"
      ],
      "seeds": [
        "acetylcholine",
        "muscarinic receptor"
      ],
      "termInfo": {
        "acetylcholine": {
          "text": "The transmitter of all preganglionic neurons and of parasympathetic postganglionic neurons.",
          "links": [
            {
              "href": "wiki:Acetylcholine"
            }
          ]
        },
        "muscarinic receptor": {
          "text": "A G-protein-coupled acetylcholine receptor on the organs parasympathetic fibers reach; atropine blocks it.",
          "links": [
            {
              "href": "wiki:Muscarinic acetylcholine receptor"
            }
          ]
        },
        "nicotinic receptor": {
          "text": "An acetylcholine-gated ion channel on every postganglionic neuron and on the secreting cells of the adrenal medulla.",
          "links": [
            {
              "href": "wiki:Nicotinic acetylcholine receptor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cholinergic"
          }
        ]
      }
    },
    {
      "id": "adrenergic-transmission",
      "name": "Adrenergic transmission",
      "color": "magenta",
      "fact": "Most sympathetic postganglionic neurons release norepinephrine, and the adrenal medulla adds circulating epinephrine. The receptor sets the effect: α₁ constricts vessels, α₂ curbs further transmitter release, β₁ speeds and strengthens the heart, and β₂ relaxes airway and vascular smooth muscle.",
      "terms": [
        "norepinephrine",
        "epinephrine",
        "α₁ receptor",
        "α₂ receptor",
        "β₁ receptor",
        "β₂ receptor"
      ],
      "seeds": [
        "norepinephrine",
        "epinephrine"
      ],
      "termInfo": {
        "epinephrine": {
          "text": "The chief hormone of the adrenal medulla, acting on α and β receptors about equally. Also called adrenaline.",
          "links": [
            {
              "href": "wiki:Adrenaline"
            }
          ]
        },
        "norepinephrine": {
          "text": "The transmitter of most sympathetic postganglionic neurons; it acts mainly on α receptors and less on β.",
          "links": [
            {
              "href": "wiki:Norepinephrine"
            }
          ]
        },
        "α₁ receptor": {
          "text": "Contracts smooth muscle in blood vessels, sphincters, and the iris dilator. Guyton writes alpha₁.",
          "links": [
            {
              "href": "wiki:Alpha-1 adrenergic receptor"
            }
          ]
        },
        "α₂ receptor": {
          "text": "Inhibits norepinephrine release from the nerve ending that carries it, and lowers sympathetic outflow from the brainstem.",
          "links": [
            {
              "href": "wiki:Alpha-2 adrenergic receptor"
            }
          ]
        },
        "β₁ receptor": {
          "text": "Raises heart rate and the force of contraction, and triggers renin release in the kidney.",
          "links": [
            {
              "href": "wiki:Beta-1 adrenergic receptor"
            }
          ]
        },
        "β₂ receptor": {
          "text": "Relaxes smooth muscle, widening the airways and dilating vessels in skeletal muscle.",
          "links": [
            {
              "href": "wiki:Beta-2 adrenergic receptor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Adrenergic receptor"
          }
        ]
      }
    },
    {
      "id": "tone-and-reflex-control",
      "name": "Tone and reflex control",
      "color": "olive",
      "fact": "Both divisions fire continuously at a low rate, so a single division can raise or lower an organ's activity. Visceral afferent fibers feed autonomic reflexes integrated in the spinal cord, brainstem, and hypothalamus. An organ that loses its nerve supply develops denervation supersensitivity to circulating transmitter.",
      "terms": [
        "autonomic tone",
        "autonomic reflex",
        "visceral afferent fibers",
        "hypothalamus",
        "denervation supersensitivity"
      ],
      "seeds": [
        "autonomic tone",
        "autonomic reflex"
      ],
      "termInfo": {
        "autonomic reflex": "A reflex whose motor arm is autonomic, such as the baroreceptor reflex or emptying of the bladder.",
        "autonomic tone": "The steady background firing of both divisions, about one-half to two impulses a second, which lets one division adjust an organ up or down.",
        "denervation supersensitivity": "The heightened response of an organ to its transmitter in the weeks after its autonomic nerves are cut, caused mainly by an increase in receptors.",
        "hypothalamus": {
          "text": "The brain region above the brainstem that coordinates autonomic output with temperature, feeding, and emotion.",
          "links": [
            {
              "href": "wiki:Hypothalamus"
            }
          ]
        },
        "visceral afferent fibers": {
          "text": "Sensory fibers that report stretch, pressure, and chemistry from the internal organs to the spinal cord and brainstem: the input side of autonomic reflexes.",
          "links": [
            {
              "href": "wiki:General visceral afferent fiber"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "dual-innervation",
      "term": "dual innervation",
      "clusters": [
        0,
        1
      ],
      "fact": "Most organs receive both sympathetic and parasympathetic fibers, usually with opposing effects, so the balance between the two sets the organ's activity. The vagus nerve slows the heart while sympathetic fibers speed and strengthen it.",
      "info": "Supply of one organ by both autonomic divisions.",
      "relationKind": "contrast",
      "idealTerms": [
        null,
        "vagus nerve"
      ]
    },
    {
      "id": "adrenal-medulla",
      "term": "adrenal medulla",
      "clusters": [
        0,
        3
      ],
      "fact": "The adrenal medulla is a modified sympathetic ganglion. Preganglionic fibers end directly on its chromaffin cells, which release about 80 percent epinephrine and 20 percent norepinephrine into the blood, extending sympathetic effects for minutes to every cell with adrenergic receptors.",
      "info": {
        "text": "The inner part of the adrenal gland, made of chromaffin cells that secrete epinephrine and norepinephrine into the blood.",
        "links": [
          {
            "href": "wiki:Adrenal medulla"
          }
        ]
      },
      "idealTerms": [
        null,
        "epinephrine"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "sweat-glands",
      "term": "sweat glands",
      "clusters": [
        0,
        2
      ],
      "fact": "Sweat glands are sympathetic targets whose postganglionic fibers release acetylcholine onto muscarinic receptors, so atropine blocks sympathetic sweating.",
      "info": {
        "text": "The eccrine glands of the skin, which cool the body by secreting sweat.",
        "links": [
          {
            "href": "wiki:Sweat gland"
          }
        ]
      },
      "idealTerms": [
        null,
        "muscarinic receptor"
      ]
    },
    {
      "id": "ganglionic-transmission",
      "term": "ganglionic transmission",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "In both divisions the preganglionic ending releases acetylcholine onto nicotinic receptors on the postganglionic neuron. Because the ganglionic synapse is shared, a drug that blocks it shuts down sympathetic and parasympathetic output together.",
      "info": {
        "text": "The relay from preganglionic to postganglionic neuron inside an autonomic ganglion.",
        "links": [
          {
            "href": "wiki:Autonomic ganglion"
          }
        ]
      },
      "idealTerms": [
        "sympathetic chain",
        "terminal ganglia",
        "nicotinic receptor"
      ]
    },
    {
      "id": "vagal-tone",
      "term": "vagal tone",
      "clusters": [
        1,
        4
      ],
      "fact": "Continuous vagal firing holds the resting heart near 70 beats a minute, below the roughly 100 a minute the sinoatrial node sets on its own, so withdrawing vagal tone is the heart's quickest way to speed up.",
      "info": {
        "text": "The steady parasympathetic drive the vagus nerve exerts, most familiar at the heart.",
        "links": [
          {
            "href": "wiki:Vagal tone"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "vagus nerve",
        "autonomic tone"
      ]
    }
  ],
  "lenses": [
    {
      "id": "cholinergic-sympathetic-targets",
      "prompt": "Which sympathetic targets are stimulated by acetylcholine?",
      "explanation": "Most sympathetic targets receive norepinephrine from postganglionic fibers. These two receive acetylcholine: sweat glands from cholinergic postganglionic fibers, the adrenal medulla straight from preganglionic ones.",
      "targets": [
        "sweat glands",
        "adrenal medulla"
      ],
      "reasons": {
        "adrenal medulla": "Preganglionic fibers end directly on its chromaffin cells and release acetylcholine onto nicotinic receptors.",
        "sweat glands": "Their sympathetic postganglionic fibers release acetylcholine onto muscarinic receptors."
      }
    },
    {
      "id": "ganglionic-blockade",
      "prompt": "Which concepts does a ganglionic blocking drug act on directly?",
      "explanation": "Drugs such as hexamethonium block nicotinic receptors at the ganglionic synapse, which both divisions share. The adrenal medulla is stimulated through the same receptor, so its secretion falls too.",
      "targets": [
        "nicotinic receptor",
        "ganglionic transmission",
        "adrenal medulla"
      ],
      "reasons": {
        "adrenal medulla": "Its chromaffin cells receive preganglionic acetylcholine through nicotinic receptors, just as postganglionic neurons do.",
        "ganglionic transmission": "The relay it interrupts in both divisions at once.",
        "nicotinic receptor": "The receptor the drug occupies."
      }
    },
    {
      "id": "beta-blocker-airways",
      "prompt": "Which receptor's blockade by a nonselective beta blocker can tighten the airways?",
      "explanation": "A nonselective beta blocker blocks β₁ and β₂ alike. Losing β₂ relaxation of bronchial smooth muscle can provoke bronchospasm in asthma, which is why β₁-selective drugs exist.",
      "targets": [
        "β₂ receptor"
      ],
      "reasons": {
        "β₂ receptor": "It relaxes bronchial smooth muscle, so blocking it leaves constriction unopposed."
      }
    },
    {
      "id": "clonidine",
      "prompt": "Which receptor does clonidine stimulate to lower blood pressure?",
      "explanation": "Clonidine stimulates α₂ receptors in the brainstem, reducing sympathetic outflow to the heart and vessels.",
      "targets": [
        "α₂ receptor"
      ],
      "reasons": {
        "α₂ receptor": "Its activation curbs sympathetic outflow and norepinephrine release."
      }
    },
    {
      "id": "atropine-heart",
      "prompt": "Which concept does atropine abolish to speed the resting heart?",
      "explanation": "Atropine blocks the muscarinic receptors through which acetylcholine from the vagus slows the sinoatrial node. With that steady brake gone, the heart rises toward its intrinsic rate of about 100 a minute.",
      "targets": [
        "vagal tone"
      ],
      "reasons": {
        "vagal tone": "It is the continuous vagal brake that holds the resting rate near 70."
      }
    },
    {
      "id": "transplanted-heart",
      "prompt": "Which concepts make a transplanted heart overrespond to circulating epinephrine?",
      "explanation": "A transplanted heart has no autonomic nerves, so it beats near its intrinsic rate and speeds up during exercise only as adrenal hormones reach it. Its receptors multiply after denervation, amplifying that hormonal drive.",
      "targets": [
        "denervation supersensitivity",
        "β₁ receptor"
      ],
      "reasons": {
        "denervation supersensitivity": "Cut off from its nerves, the heart adds receptors and becomes more sensitive to circulating transmitter.",
        "β₁ receptor": "The receptor through which epinephrine raises the heart's rate and force."
      }
    },
    {
      "id": "whole-body-sympathetic",
      "prompt": "Which concepts let the sympathetic division act on the whole body at once?",
      "explanation": "Divergence in the chain lets one signal fire postganglionic neurons at many levels together, and the adrenal medulla broadcasts the response through the blood to cells with no sympathetic nerve supply.",
      "targets": [
        "mass discharge",
        "sympathetic chain",
        "adrenal medulla"
      ],
      "reasons": {
        "adrenal medulla": "Its hormones carry the response wherever blood flows.",
        "mass discharge": "The division's capacity to fire as a whole.",
        "sympathetic chain": "Preganglionic fibers branch up and down it to many postganglionic neurons."
      }
    },
    {
      "id": "bladder-reflex",
      "prompt": "Which nerve fibers carry the bladder-emptying reflex?",
      "explanation": "Stretch of the filling bladder is reported to the sacral cord, and parasympathetic fibers return to contract the bladder wall. Higher centers can delay or permit the reflex.",
      "targets": [
        "visceral afferent fibers",
        "pelvic splanchnic nerves"
      ],
      "reasons": {
        "pelvic splanchnic nerves": "They carry the parasympathetic motor signal back to contract the bladder.",
        "visceral afferent fibers": "They carry the stretch signal from the bladder wall into the sacral cord."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-neurons-fire-and-signal",
        "reason": "Review the action potential and synaptic release that every autonomic neuron uses."
      },
      {
        "id": "regulating-arterial-pressure",
        "reason": "See sympathetic and vagal output at work in the baroreceptor reflex."
      },
      {
        "id": "rhythmic-excitation-of-the-heart",
        "reason": "Meet the sinoatrial node whose rate vagal and sympathetic fibers adjust."
      },
      {
        "id": "mechanics-of-breathing",
        "reason": "Follow β₂ relaxation and vagal constriction into airway resistance."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The body's automatic controls",
    "summary": "How two autonomic divisions built on one plan reach the organs, which transmitters and receptors set their effects, and how tone and reflexes keep them adjusted.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Your heart speeds when you stand, your pupils narrow in bright light, your gut moves food along, and your bladder fills and empties, all without a decision. The autonomic nervous system directs this work. It is the motor system for heart muscle, smooth muscle, and glands, and it runs on a different plan from the nerves that move the skeleton.\r\n\r\n## Two divisions, one plan\r\n\r\nA skeletal muscle is reached by a single motor neuron running from the spinal cord. An autonomic target is reached by two neurons in series. The first, the preganglionic neuron, has its cell body in the brainstem or spinal cord. The second, the postganglionic neuron, has its cell body in a ganglion outside the central nervous system and sends its fiber on to the organ. The handoff in the ganglion, **ganglionic transmission**, works the same way throughout the system: the preganglionic ending releases acetylcholine onto nicotinic receptors.\r\n\r\nThe two divisions differ in where they leave the central nervous system and where their ganglia sit. Sympathetic fibers emerge only from the thoracic and first lumbar segments of the cord, the **thoracolumbar outflow**. Most end in the **sympathetic chain**, a row of ganglia beside the vertebral column; others pass through it to **prevertebral ganglia** in the abdomen, in front of the aorta. Because these ganglia sit close to the cord, sympathetic preganglionic fibers are short and postganglionic fibers long.\r\n\r\nParasympathetic fibers leave from the brainstem and the sacral cord, the **craniosacral outflow**. About three-quarters of them travel in the **vagus nerve**, which reaches the heart, lungs, and most of the gut. The sacral fibers travel in the **pelvic splanchnic nerves** to the bladder, lower bowel, and genitals. Parasympathetic preganglionic fibers run nearly all the way to their targets and end in **terminal ganglia** on or in the organ wall, so their postganglionic fibers are very short.\r\n\r\n## Broad and local responses\r\n\r\nThe anatomy shapes the response. Each sympathetic preganglionic fiber branches to many postganglionic neurons, often at several levels of the chain, so the division can fire as a whole, in what Guyton calls **mass discharge**. In alarm this produces the **fight-or-flight response**: a faster and stronger heartbeat, higher blood pressure, wider airways, more blood to working muscle, glucose released into the blood, and digestion put on hold. Parasympathetic actions are more discrete, such as slowing the heart, narrowing a pupil, or stimulating gut secretion, and together they favor the **rest-and-digest** work of feeding and recovery.\r\n\r\nMost organs receive both divisions, and their effects usually oppose each other. This **dual innervation** lets either division push an organ in its own direction: the vagus slows the heart, while sympathetic fibers speed and strengthen it.\r\n\r\n## Transmitters and receptors\r\n\r\nEvery preganglionic neuron, and nearly every parasympathetic postganglionic neuron, releases **acetylcholine**. The receptor decides what it does. **Nicotinic receptors** are ligand-gated ion channels that carry the fast handoff in every autonomic ganglion. **Muscarinic receptors** are coupled to G proteins; they sit on the organs that parasympathetic fibers reach and can excite or inhibit depending on the tissue.\r\n\r\nMost sympathetic postganglionic neurons release **norepinephrine** instead, and its effect depends on which adrenergic receptor the target carries. **α₁ receptors** contract smooth muscle in blood vessels and sphincters. **α₂ receptors** on the nerve endings themselves curb further norepinephrine release, and in the brainstem they reduce sympathetic outflow. **β₁ receptors** speed the heart and strengthen its contraction. **β₂ receptors** relax smooth muscle, widening the airways and dilating vessels in skeletal muscle. **Epinephrine** acts on α and β receptors about equally, while norepinephrine acts mainly on α receptors.\r\n\r\nA few sympathetic targets break the pattern. The **sweat glands** receive sympathetic fibers that release acetylcholine onto muscarinic receptors.\r\n\r\n## The adrenal medulla\r\n\r\nThe **adrenal medulla** is a sympathetic ganglion turned gland. Preganglionic fibers end directly on its chromaffin cells, which behave like postganglionic neurons without axons: when stimulated, they release hormone into the blood, about 80 percent epinephrine and 20 percent norepinephrine. The blood clears these hormones slowly, so their effects outlast direct nerve stimulation several times over, and they reach cells that have no sympathetic nerve supply.\r\n\r\n## Tone, reflexes, and central control\r\n\r\nBoth divisions fire continuously at a low rate. This **autonomic tone** lets a single division raise or lower an organ's activity by firing more or less. **Vagal tone** is the clearest example: steady vagal firing holds the resting heart near 70 beats a minute, well below the roughly 100 that the sinoatrial node produces on its own.\r\n\r\nMuch of this firing is adjusted by **autonomic reflexes**. **Visceral afferent fibers** carry information from the organs, such as stretch of the bladder wall, pressure in the arteries, or distension of the gut, to the spinal cord and brainstem, which send autonomic signals back. The bladder empties this way: stretch signals enter the sacral cord, and parasympathetic outflow returns through the pelvic splanchnic nerves to contract the bladder wall. Above the reflex centers, the **hypothalamus** coordinates autonomic output with temperature regulation, feeding, and emotion, and it can launch the whole sympathetic alarm.\r\n\r\nAn organ that loses its autonomic nerve supply adapts. Within a week or two its receptors multiply, and it responds more strongly to circulating transmitter than it did before. This is **denervation supersensitivity**, and it is one reason a transplanted heart, which has no autonomic nerves, still speeds up during exercise as adrenal hormones reach it."
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
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-autonomic-nervous-system",
      "puzzleRevision": "fnv1a32:195ee0f2",
      "board": {
        "width": 1180,
        "height": 770
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 327.3,
          "y": 205.44,
          "pinned": false
        },
        "cluster:1": {
          "x": 852.7,
          "y": 205.44,
          "pinned": false
        },
        "cluster:2": {
          "x": 606.83,
          "y": 587.22,
          "pinned": true
        },
        "cluster:3": {
          "x": 190.68,
          "y": 549.78,
          "pinned": true
        },
        "cluster:4": {
          "x": 1025.95,
          "y": 562.65,
          "pinned": true
        }
      },
      "bridges": {
        "term:dual innervation": {
          "x": 580.66,
          "y": 122.41,
          "pinned": true
        },
        "term:adrenal medulla": {
          "x": 97.71,
          "y": 321.6,
          "pinned": true
        },
        "term:sweat glands": {
          "x": 396.98,
          "y": 428.05,
          "pinned": true
        },
        "term:ganglionic transmission": {
          "x": 616.46,
          "y": 339.95,
          "pinned": true
        },
        "term:vagal tone": {
          "x": 1090.23,
          "y": 258.03,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "fight-or-flight response",
          "sympathetic chain",
          "thoracolumbar outflow",
          "prevertebral ganglia",
          "mass discharge"
        ],
        "cluster:1": [
          "rest-and-digest",
          "vagus nerve",
          "craniosacral outflow",
          "terminal ganglia",
          "pelvic splanchnic nerves"
        ],
        "cluster:2": [
          "acetylcholine",
          "muscarinic receptor",
          "nicotinic receptor"
        ],
        "cluster:3": [
          "norepinephrine",
          "epinephrine",
          "α₁ receptor",
          "α₂ receptor",
          "β₁ receptor",
          "β₂ receptor"
        ],
        "cluster:4": [
          "autonomic tone",
          "autonomic reflex",
          "visceral afferent fibers",
          "hypothalamus",
          "denervation supersensitivity"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "mass discharge",
          "prevertebral ganglia",
          "fight-or-flight response",
          "thoracolumbar outflow",
          "sympathetic chain"
        ],
        "cluster:1": [
          "vagus nerve",
          "craniosacral outflow",
          "pelvic splanchnic nerves",
          "terminal ganglia",
          "rest-and-digest"
        ],
        "cluster:2": [
          "nicotinic receptor",
          "muscarinic receptor",
          "acetylcholine"
        ],
        "cluster:3": [
          "epinephrine",
          "β₂ receptor",
          "norepinephrine",
          "α₂ receptor",
          "β₁ receptor",
          "α₁ receptor"
        ],
        "cluster:4": [
          "autonomic tone",
          "visceral afferent fibers",
          "denervation supersensitivity",
          "autonomic reflex",
          "hypothalamus"
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
        "totalLength": 1991.6937843122562
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T18:50:56.617Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-autonomic-nervous-system",
      "puzzleRevision": "fnv1a32:195ee0f2",
      "board": {
        "width": 1180,
        "height": 770
      },
      "nodes": {
        "term:fight-or-flight response": {
          "x": 301.44,
          "y": 74.47
        },
        "term:sympathetic chain": {
          "x": 658.88,
          "y": 251.15
        },
        "term:thoracolumbar outflow": {
          "x": 459.85,
          "y": 30.91
        },
        "term:prevertebral ganglia": {
          "x": 657.39,
          "y": 29.92
        },
        "term:mass discharge": {
          "x": 784.31,
          "y": 81.4
        },
        "term:rest-and-digest": {
          "x": 1036.32,
          "y": 557.3
        },
        "term:vagus nerve": {
          "x": 667.12,
          "y": 521.26
        },
        "term:craniosacral outflow": {
          "x": 986.58,
          "y": 709.39
        },
        "term:terminal ganglia": {
          "x": 854.56,
          "y": 504.18
        },
        "term:pelvic splanchnic nerves": {
          "x": 751.64,
          "y": 710.38
        },
        "term:acetylcholine": {
          "x": 1062.98,
          "y": 153.48
        },
        "term:muscarinic receptor": {
          "x": 910.41,
          "y": 151.24
        },
        "term:nicotinic receptor": {
          "x": 873.73,
          "y": 291.94
        },
        "term:norepinephrine": {
          "x": 155.29,
          "y": 391.73
        },
        "term:epinephrine": {
          "x": 390.43,
          "y": 253.14
        },
        "term:α₁ receptor": {
          "x": 54.65,
          "y": 314.83
        },
        "term:α₂ receptor": {
          "x": 112.66,
          "y": 235.98
        },
        "term:β₁ receptor": {
          "x": 135.94,
          "y": 137.67
        },
        "term:β₂ receptor": {
          "x": 248.91,
          "y": 185.02
        },
        "term:autonomic tone": {
          "x": 313.77,
          "y": 470.22
        },
        "term:autonomic reflex": {
          "x": 481.9,
          "y": 710.38
        },
        "term:visceral afferent fibers": {
          "x": 290.37,
          "y": 720.28
        },
        "term:hypothalamus": {
          "x": 143.62,
          "y": 665.48
        },
        "term:denervation supersensitivity": {
          "x": 166.64,
          "y": 559.03
        },
        "term:dual innervation": {
          "x": 535.41,
          "y": 374.23
        },
        "term:adrenal medulla": {
          "x": 379.38,
          "y": 156.6
        },
        "term:sweat glands": {
          "x": 740.16,
          "y": 148.76
        },
        "term:ganglionic transmission": {
          "x": 739.14,
          "y": 376.2
        },
        "term:vagal tone": {
          "x": 497.25,
          "y": 474.61
        },
        "cluster:0": {
          "x": 569.15,
          "y": 145.23
        },
        "cluster:1": {
          "x": 829.31,
          "y": 599.79
        },
        "cluster:2": {
          "x": 997.45,
          "y": 222.56
        },
        "cluster:3": {
          "x": 314.82,
          "y": 338.77
        },
        "cluster:4": {
          "x": 400.45,
          "y": 587.21
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-14T19:20:33.469Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "the-autonomic-nervous-system",
      "puzzleRevision": "fnv1a32:195ee0f2",
      "board": {
        "width": 1180,
        "height": 770
      },
      "nodes": {
        "term:fight-or-flight response": {
          "x": 520.76,
          "y": 207.09,
          "pinned": true
        },
        "term:sympathetic chain": {
          "x": 665.47,
          "y": 277.54,
          "pinned": true
        },
        "term:thoracolumbar outflow": {
          "x": 406.06,
          "y": 107.9,
          "pinned": true
        },
        "term:prevertebral ganglia": {
          "x": 567.85,
          "y": 43.66,
          "pinned": false
        },
        "term:mass discharge": {
          "x": 631.08,
          "y": 113.32,
          "pinned": true
        },
        "term:rest-and-digest": {
          "x": 873.41,
          "y": 596.72,
          "pinned": true
        },
        "term:vagus nerve": {
          "x": 725.9,
          "y": 547.59,
          "pinned": true
        },
        "term:craniosacral outflow": {
          "x": 1037.27,
          "y": 528.21,
          "pinned": true
        },
        "term:terminal ganglia": {
          "x": 845.45,
          "y": 475.55,
          "pinned": true
        },
        "term:pelvic splanchnic nerves": {
          "x": 832.86,
          "y": 685.95,
          "pinned": true
        },
        "term:acetylcholine": {
          "x": 1020.23,
          "y": 65.93,
          "pinned": true
        },
        "term:muscarinic receptor": {
          "x": 892.3,
          "y": 117.59,
          "pinned": true
        },
        "term:nicotinic receptor": {
          "x": 997.88,
          "y": 200.18,
          "pinned": true
        },
        "term:norepinephrine": {
          "x": 220.92,
          "y": 171.85,
          "pinned": true
        },
        "term:epinephrine": {
          "x": 304.35,
          "y": 269.96,
          "pinned": true
        },
        "term:α₁ receptor": {
          "x": 201.98,
          "y": 387.66,
          "pinned": true
        },
        "term:α₂ receptor": {
          "x": 117.43,
          "y": 95.84,
          "pinned": true
        },
        "term:β₁ receptor": {
          "x": 104.67,
          "y": 225.86,
          "pinned": true
        },
        "term:β₂ receptor": {
          "x": 103.51,
          "y": 322.33,
          "pinned": true
        },
        "term:autonomic tone": {
          "x": 433.17,
          "y": 596.73,
          "pinned": true
        },
        "term:autonomic reflex": {
          "x": 364.15,
          "y": 504.32,
          "pinned": true
        },
        "term:visceral afferent fibers": {
          "x": 499.91,
          "y": 693.55,
          "pinned": true
        },
        "term:hypothalamus": {
          "x": 262.43,
          "y": 593.2,
          "pinned": true
        },
        "term:denervation supersensitivity": {
          "x": 253.34,
          "y": 697.02,
          "pinned": true
        },
        "term:dual innervation": {
          "x": 608.47,
          "y": 372.31,
          "pinned": true
        },
        "term:adrenal medulla": {
          "x": 423.58,
          "y": 372.84,
          "pinned": true
        },
        "term:sweat glands": {
          "x": 767.48,
          "y": 193.74,
          "pinned": true
        },
        "term:ganglionic transmission": {
          "x": 836.45,
          "y": 371.08,
          "pinned": true
        },
        "term:vagal tone": {
          "x": 561.56,
          "y": 517.18,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5551.94,
        "score": 5551.9443400554155
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-14T19:18:09.558Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-14T18:16:25.597Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
