// Generated from content/puzzles/somatic-sensation-and-pain.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "somatic-sensation-and-pain",
  "title": "Somatic sensation and pain",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "neurophysiology"
  },
  "info": {
    "text": "Receptors in the skin and deeper tissues turn touch, temperature, and injury into nerve signals that code what happened, how strongly, and where. Two ascending pathways carry those signals to the cortex, and the nervous system can turn its own pain signals down.",
    "links": [
      {
        "href": "wiki:Somatosensory system"
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
        "title": "Anatomy and Physiology 2e — 14.1 Sensory Perception",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception"
      },
      {
        "title": "Anatomy and Physiology 2e — 14.2 Central Processing",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/14-2-central-processing"
      }
    ]
  },
  "clusters": [
    {
      "id": "somatic-receptors",
      "name": "Somatic receptors",
      "color": "teal",
      "fact": "Encapsulated endings in and under the skin each respond best to a different mechanical stimulus: Meissner's corpuscles to light moving touch, Pacinian corpuscles to vibration, Merkel's discs to steady pressure on a point, and Ruffini's endings to skin stretch. Free nerve endings serve as thermoreceptors for warmth and cold.",
      "terms": [
        "Pacinian corpuscles",
        "Meissner's corpuscles",
        "Merkel's discs",
        "Ruffini's endings",
        "thermoreceptors"
      ],
      "seeds": [
        "Pacinian corpuscles",
        "Meissner's corpuscles"
      ],
      "termInfo": {
        "Meissner's corpuscles": {
          "text": "Encapsulated endings just beneath the hairless skin of the fingertips, lips, and palms that sense light touch and low-frequency vibration. Also called Meissner corpuscles or tactile corpuscles.",
          "links": [
            {
              "href": "wiki:Tactile corpuscle"
            }
          ]
        },
        "Merkel's discs": {
          "text": "Expanded nerve endings under the skin surface that report sustained pressure at one small spot. Also called Merkel discs or Merkel endings.",
          "links": [
            {
              "href": "wiki:Merkel nerve ending"
            }
          ]
        },
        "Pacinian corpuscles": {
          "text": "Onion-like layered capsules deep in the skin and other tissues that respond to vibration and rapid pressure changes. Also called lamellar corpuscles.",
          "links": [
            {
              "href": "wiki:Pacinian corpuscle"
            }
          ]
        },
        "Ruffini's endings": {
          "text": "Encapsulated endings deep in the skin and joint capsules that respond to stretch and sustained deformation. Also called Ruffini endings or bulbous corpuscles.",
          "links": [
            {
              "href": "wiki:Bulbous corpuscle"
            }
          ]
        },
        "thermoreceptors": {
          "text": "Free nerve endings that respond to warmth or to cold, signaling both temperature and its rate of change.",
          "links": [
            {
              "href": "wiki:Thermoreceptor"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Mechanoreceptor"
          }
        ]
      }
    },
    {
      "id": "stimulus-coding",
      "name": "Stimulus coding",
      "color": "blue",
      "fact": "Which fiber fires tells the brain the kind of sensation; how fast it fires, and how many fibers fire, tell it the strength. Receptors that adapt quickly report change, while slowly adapting ones report a steady stimulus. Small, overlapping receptive fields let the brain locate a stimulus and tell two nearby points apart.",
      "terms": [
        "adaptation",
        "receptive field",
        "labeled line principle",
        "two-point discrimination"
      ],
      "seeds": [
        "adaptation",
        "receptive field"
      ],
      "termInfo": {
        "adaptation": {
          "text": "The decline in a receptor's response while a stimulus holds steady. Rapidly adapting (phasic) receptors signal change; slowly adapting (tonic) receptors keep signaling.",
          "links": [
            {
              "href": "wiki:Neural adaptation"
            }
          ]
        },
        "labeled line principle": "Each nerve fiber carries one kind of sensation, so the brain reads the sensation from which fiber is active, whatever actually stimulated it.",
        "receptive field": {
          "text": "The patch of body surface whose stimulation changes the firing of one sensory neuron.",
          "links": [
            {
              "href": "wiki:Receptive field"
            }
          ]
        },
        "two-point discrimination": {
          "text": "The ability to feel two nearby points of contact as two; on the fingertips they can be about 2 mm apart, on the back several centimeters.",
          "links": [
            {
              "href": "wiki:Two-point discrimination"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Sensory neuroscience"
          }
        ]
      }
    },
    {
      "id": "ascending-pathways",
      "name": "Ascending pathways",
      "color": "amber",
      "fact": "Fine touch, vibration, and position sense climb the dorsal columns of the cord, cross to the other side in the medulla, and relay through the thalamus to the primary somatosensory cortex. There each body part has its own area, sized by how densely it is supplied with receptors rather than by its physical size.",
      "terms": [
        "dorsal column–medial lemniscal system",
        "thalamus",
        "primary somatosensory cortex",
        "sensory homunculus",
        "decussation"
      ],
      "seeds": [
        "dorsal column–medial lemniscal system",
        "thalamus"
      ],
      "termInfo": {
        "decussation": {
          "text": "Crossing of nerve fibers from one side of the central nervous system to the other, so each side of the brain receives sensation from the opposite side of the body.",
          "links": [
            {
              "href": "wiki:Decussation"
            }
          ]
        },
        "dorsal column–medial lemniscal system": {
          "text": "The pathway for fine touch, vibration, and position sense, which signals rapidly and precisely. Position sense comes mainly from muscle spindles, with joint and skin receptors adding to it.",
          "links": [
            {
              "href": "wiki:Dorsal column–medial lemniscus pathway"
            }
          ]
        },
        "primary somatosensory cortex": {
          "text": "The strip of cortex just behind the central sulcus where body sensations are first mapped. Guyton calls it somatosensory area I.",
          "links": [
            {
              "href": "wiki:Primary somatosensory cortex"
            }
          ]
        },
        "sensory homunculus": {
          "text": "The body map drawn across the somatosensory cortex, with the lips, face, and hands given far more space than the trunk.",
          "links": [
            {
              "href": "wiki:Cortical homunculus"
            }
          ]
        },
        "thalamus": {
          "text": "The paired relay center above the brainstem through which nearly all sensory signals pass on their way to the cortex.",
          "links": [
            {
              "href": "wiki:Thalamus"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Somatosensory system"
          }
        ]
      }
    },
    {
      "id": "pain-signaling",
      "name": "Pain signaling",
      "color": "magenta",
      "fact": "Sharp, well-localized pain arrives first on thinly myelinated Aδ fibers; dull, burning, aching pain follows on slower unmyelinated C fibers. Pain from an internal organ can be felt in an area of skin, and injured or inflamed tissue becomes more sensitive to pain.",
      "terms": [
        "fast pain",
        "slow pain",
        "Aδ fibers",
        "C fibers",
        "referred pain",
        "hyperalgesia"
      ],
      "seeds": [
        "fast pain",
        "slow pain"
      ],
      "termInfo": {
        "Aδ fibers": {
          "text": "Small, thinly myelinated nerve fibers conducting at about 6 to 30 m/s. Guyton writes type Aδ.",
          "links": [
            {
              "href": "wiki:Group A nerve fiber"
            }
          ]
        },
        "C fibers": {
          "text": "Unmyelinated nerve fibers conducting at about 0.5 to 2 m/s.",
          "links": [
            {
              "href": "wiki:Group C nerve fiber"
            }
          ]
        },
        "fast pain": "Sharp, pricking pain felt within about a tenth of a second of the injury and easily located. Also called acute or first pain.",
        "hyperalgesia": {
          "text": "Heightened sensitivity to pain, as in sunburned or inflamed skin.",
          "links": [
            {
              "href": "wiki:Hyperalgesia"
            }
          ]
        },
        "referred pain": {
          "text": "Pain felt in a part of the body some distance from the tissue that causes it, most often skin served by the same spinal segment as an injured organ.",
          "links": [
            {
              "href": "wiki:Referred pain"
            }
          ]
        },
        "slow pain": "Burning, aching, or throbbing pain that builds over a second or more and is poorly located. Also called chronic or second pain."
      },
      "info": {
        "links": [
          {
            "href": "wiki:Pain"
          }
        ]
      }
    },
    {
      "id": "pain-suppression",
      "name": "Pain suppression",
      "color": "olive",
      "fact": "Guyton's analgesia system runs from the periaqueductal gray of the midbrain to the raphe magnus nucleus in the brainstem, and from there down to the spinal cord. At the cord, neurons release endogenous opioids such as enkephalin, which block incoming pain signals.",
      "terms": [
        "endogenous opioids",
        "periaqueductal gray",
        "raphe magnus nucleus"
      ],
      "seeds": [
        "endogenous opioids",
        "periaqueductal gray"
      ],
      "termInfo": {
        "endogenous opioids": {
          "text": "The body's own morphine-like peptides, including enkephalins, endorphins, and dynorphin.",
          "links": [
            {
              "href": "wiki:Opioid peptide"
            }
          ]
        },
        "periaqueductal gray": {
          "text": "Gray matter around the cerebral aqueduct in the midbrain; stimulating it can abolish severe pain.",
          "links": [
            {
              "href": "wiki:Periaqueductal gray"
            }
          ]
        },
        "raphe magnus nucleus": {
          "text": "A brainstem nucleus that relays the analgesia signal to the spinal cord, mainly using serotonin. Also called the nucleus raphe magnus.",
          "links": [
            {
              "href": "wiki:Nucleus raphe magnus"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "receptor-potential",
      "term": "receptor potential",
      "clusters": [
        0,
        1
      ],
      "fact": "Every receptor turns its stimulus into a receptor potential, a graded change in its membrane voltage. The larger the potential, the faster the attached fiber fires, and the potential's decline under a steady stimulus is adaptation.",
      "info": {
        "text": "The graded depolarization a stimulus produces in a sensory receptor.",
        "links": [
          {
            "href": "wiki:Receptor potential"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "adaptation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "nociceptors",
      "term": "nociceptors",
      "clusters": [
        0,
        3
      ],
      "fact": "Pain receptors are free nerve endings that respond to damaging mechanical, thermal, or chemical stimuli. They adapt little or not at all, so pain persists for as long as the damaging stimulus does.",
      "info": {
        "text": "Receptors that respond to stimuli that damage or threaten to damage tissue.",
        "links": [
          {
            "href": "wiki:Nociceptor"
          }
        ]
      },
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "lateral-inhibition",
      "term": "lateral inhibition",
      "clusters": [
        1,
        2
      ],
      "fact": "At each relay of the dorsal column pathway and in the cortex, the most strongly stimulated neurons suppress their neighbors. This sharpens the edges of the signal and helps the brain tell two nearby points apart.",
      "info": {
        "text": "Suppression of neighboring neurons by the most strongly active ones, which sharpens contrast.",
        "links": [
          {
            "href": "wiki:Lateral inhibition"
          }
        ]
      },
      "idealTerms": [
        "two-point discrimination",
        "dorsal column–medial lemniscal system"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "anterolateral-system",
      "term": "anterolateral system",
      "clusters": [
        2,
        3
      ],
      "fact": "Pain, temperature, and crude touch cross to the opposite side within the spinal cord and climb in its anterolateral columns to the thalamus. It conducts more slowly and maps location less precisely than the dorsal column pathway.",
      "info": {
        "text": "The ascending pathway for pain, temperature, and crude touch, including the spinothalamic tract.",
        "links": [
          {
            "href": "wiki:Spinothalamic tract"
          }
        ]
      },
      "idealTerms": [
        "decussation",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "gate-control-theory",
      "term": "gate control theory",
      "clusters": [
        0,
        4
      ],
      "fact": "Signals from large tactile fibers excite inhibitory neurons in the spinal cord that damp pain transmission, which is why rubbing the skin near an injury eases the pain. Melzack and Wall proposed the idea in 1965.",
      "info": {
        "text": "The theory that touch signals can close a spinal 'gate' on incoming pain signals.",
        "links": [
          {
            "href": "wiki:Gate control theory"
          }
        ]
      },
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 4
      }
    },
    {
      "id": "dorsal-horn",
      "term": "dorsal horn",
      "clusters": [
        3,
        4
      ],
      "fact": "Pain fibers make their first synapse in the dorsal horn of the spinal cord, and the descending analgesia system acts there, where enkephalin from local neurons blocks pain transmission before the signal can ascend.",
      "info": {
        "text": "The rear gray matter of the spinal cord, where sensory fibers enter and synapse.",
        "links": [
          {
            "href": "wiki:Grey columns"
          }
        ]
      },
      "idealTerms": [
        null,
        "endogenous opioids"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "graded-signal",
      "prompt": "Which graded signal sets how fast a sensory fiber fires?",
      "explanation": "Strength is coded twice over: by each fiber's firing rate, which follows its receptor potential, and by how many fibers are recruited.",
      "targets": [
        "receptor potential"
      ],
      "reasons": {
        "receptor potential": "The larger the stimulus, the larger this change in the receptor's membrane voltage, and the faster the attached fiber fires."
      }
    },
    {
      "id": "rapid-adapters",
      "prompt": "Which receptors adapt within a fraction of a second?",
      "explanation": "Rapidly adapting receptors fire at the start and end of a stimulus, so they report vibration and movement across the skin. Merkel's discs and Ruffini's endings adapt slowly and keep reporting steady pressure or stretch.",
      "targets": [
        "Pacinian corpuscles",
        "Meissner's corpuscles"
      ],
      "reasons": {
        "Meissner's corpuscles": "They adapt within a fraction of a second, signaling objects moving across the skin.",
        "Pacinian corpuscles": "Their layered capsule passes on only rapid changes in pressure, so they fall silent within a few hundredths of a second."
      }
    },
    {
      "id": "persistent-pain",
      "prompt": "Which receptors explain why pain lasts as long as the injury does?",
      "explanation": "A touch receptor that fell silent under a steady stimulus would be harmless; a pain receptor that did so would let injury go unnoticed.",
      "targets": [
        "nociceptors"
      ],
      "reasons": {
        "nociceptors": "They adapt little or not at all, so they keep firing while the damaging stimulus continues."
      }
    },
    {
      "id": "double-pain",
      "prompt": "Which concepts account for the two waves of pain from a stubbed toe?",
      "explanation": "Two kinds of fiber carry pain at different speeds. The sharp first pain arrives quickly on Aδ fibers, and the aching second pain follows a second or more later on C fibers.",
      "targets": [
        "fast pain",
        "slow pain",
        "Aδ fibers",
        "C fibers"
      ],
      "reasons": {
        "Aδ fibers": "Thinly myelinated fibers that deliver the first wave quickly.",
        "C fibers": "Unmyelinated fibers that deliver the second wave slowly.",
        "fast pain": "The sharp first wave.",
        "slow pain": "The aching second wave."
      }
    },
    {
      "id": "labeled-line",
      "prompt": "Which concept explains why electrical stimulation of a pain fiber is felt as pain?",
      "explanation": "The brain identifies a sensation by which fiber carries it, not by what triggered the fiber. A pain fiber reports pain whether it is excited by injury, electricity, or pressure.",
      "targets": [
        "labeled line principle"
      ],
      "reasons": {
        "labeled line principle": "Each fiber's destination fixes the sensation it produces."
      }
    },
    {
      "id": "hemisection",
      "prompt": "Which concepts explain why a right-sided cord hemisection removes pain sense on the left?",
      "explanation": "Pain fibers cross within a segment or two of entering the cord, so the right half of the cord carries pain from the left side of the body. Fine touch and position sense cross only in the medulla, so the same injury removes those on the right.",
      "targets": [
        "anterolateral system",
        "decussation"
      ],
      "reasons": {
        "anterolateral system": "The pathway carrying pain up the cord.",
        "decussation": "Its crossing near the level of entry puts left-side pain fibers in the right half of the cord."
      }
    },
    {
      "id": "fingertip-acuity",
      "prompt": "Which central features give the fingertips fine two-point discrimination?",
      "explanation": "Fingertips are packed with receptors that have small receptive fields. Centrally, the hand gets a large share of the cortical map, and lateral inhibition at each relay sharpens the contrast between neighboring points.",
      "targets": [
        "lateral inhibition",
        "sensory homunculus"
      ],
      "reasons": {
        "lateral inhibition": "It suppresses neighboring neurons and sharpens the edges of each touch.",
        "sensory homunculus": "The fingertips claim a large area of the cortical map, giving them many neurons."
      }
    },
    {
      "id": "heart-pain-arm",
      "prompt": "Which concepts explain why the brain misplaces heart pain in the left arm?",
      "explanation": "Pain fibers from the heart enter the same spinal segments as fibers from the skin of the left arm and converge on the same neurons. The brain, used to signals from the skin, attributes the pain to the arm.",
      "targets": [
        "referred pain",
        "dorsal horn"
      ],
      "reasons": {
        "dorsal horn": "Heart and arm fibers converge on shared neurons here.",
        "referred pain": "The name for pain felt away from its source."
      }
    },
    {
      "id": "rubbing",
      "prompt": "Which theory explains why rubbing a bumped elbow eases the pain?",
      "explanation": "Rubbing activates large tactile fibers, which excite inhibitory neurons in the spinal cord that damp the pain signal.",
      "targets": [
        "gate control theory"
      ],
      "reasons": {
        "gate control theory": "Touch signals close the spinal gate on pain transmission."
      }
    },
    {
      "id": "opioid-pathway",
      "prompt": "Which structures form the descending pathway that opioid drugs activate?",
      "explanation": "Morphine acts on opioid receptors along the body's own analgesia system, which runs from the midbrain through the brainstem to the spinal cord, where it blocks pain transmission.",
      "targets": [
        "periaqueductal gray",
        "raphe magnus nucleus",
        "dorsal horn"
      ],
      "reasons": {
        "dorsal horn": "The spinal site where incoming pain transmission is blocked.",
        "periaqueductal gray": "The midbrain origin of the descending pathway.",
        "raphe magnus nucleus": "The brainstem relay that sends the signal down the cord."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-neurons-fire-and-signal",
        "reason": "Review the graded potentials and action potentials that every sensory fiber uses."
      },
      {
        "id": "setting-and-defending-core-temperature",
        "reason": "See skin thermoreceptors serve as sensors in the body's temperature reflexes."
      },
      {
        "id": "the-autonomic-nervous-system",
        "reason": "Meet the visceral afferent fibers whose convergence produces referred pain."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How the body feels touch and pain",
    "summary": "How receptors turn stimuli into signals, how those signals code kind, strength, and place, which pathways carry them to the cortex, and how the nervous system damps pain.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Your skin reports a feather brushing it, a phone vibrating in your pocket, the weight of a pen, the warmth of a cup, and the sting of a cut. Each report starts at a receptor and travels to the brain along a path chosen by what kind of sensation it is.\r\n\r\n## Receptors\r\n\r\nA sensory receptor turns a stimulus into an electrical signal. The stimulus produces a **receptor potential**, a graded change in the receptor's membrane voltage. When it is large enough it triggers action potentials in the attached nerve fiber, and the larger it is, the faster the fiber fires.\r\n\r\nThe skin holds several kinds of mechanical receptor. **Meissner's corpuscles**, just beneath the hairless skin of the fingertips and lips, sense light touch and objects moving across the skin. **Pacinian corpuscles**, deeper down, are wrapped in layers like an onion and respond to vibration. **Merkel's discs** report steady pressure at one small point, and **Ruffini's endings** report stretch of the skin. **Thermoreceptors** are free nerve endings that respond to warmth or to cold. **Nociceptors** are free nerve endings too, but they respond to stimuli that damage tissue, and they are where pain begins.\r\n\r\n## Coding the stimulus\r\n\r\nThe brain cannot see the stimulus; it receives only nerve impulses. It reads the kind of sensation from which fibers are active. This is the **labeled line principle**: a pain fiber reports pain however it is excited.\r\n\r\nStrength is coded by how fast each fiber fires and by how many fibers fire. Time is coded by **adaptation**, the decline in a receptor's response while a stimulus stays steady. Pacinian and Meissner's corpuscles adapt within a fraction of a second, so they signal change; Merkel's discs and Ruffini's endings adapt slowly and keep reporting a steady stimulus. Nociceptors adapt very little, so pain does not fade while the injury continues.\r\n\r\nLocation is coded by the **receptive field**, the patch of skin whose stimulation changes one neuron's firing. Where receptive fields are small and crowded, as on the fingertips, **two-point discrimination** is fine: two points about 2 mm apart can be felt as two. On the back they must be several centimeters apart. **Lateral inhibition** sharpens location further: at each relay, the most strongly stimulated neurons suppress their neighbors, heightening the contrast at the edges of a touch.\r\n\r\n## Two pathways to the cortex\r\n\r\nFine touch, vibration, and position sense travel in the **dorsal column–medial lemniscal system**. Its large fibers climb the dorsal columns of the spinal cord on the same side they entered, synapse in the medulla, and only then cross to the opposite side. Position sense, or proprioception, comes mainly from muscle spindles, with help from joint and skin receptors.\r\n\r\nPain, temperature, and crude touch travel in the **anterolateral system**. Its fibers synapse soon after entering the cord and cross to the opposite side within a segment or two before climbing. Both pathways therefore show **decussation**, crossing to the opposite side, but at different levels. That difference explains a classic injury: damage to one half of the spinal cord removes fine touch and position sense on the same side below the injury, but pain and temperature on the opposite side.\r\n\r\nBoth pathways relay through the **thalamus** to the **primary somatosensory cortex**, a strip of cortex just behind the central sulcus. There the body is mapped as a **sensory homunculus**, in which the lips, face, and hands occupy far more space than the trunk or legs. The more receptors a part has, the larger its share of the map.\r\n\r\n## Pain\r\n\r\nA stubbed toe hurts twice. **Fast pain**, sharp and easy to locate, arrives within about a tenth of a second on thinly myelinated **Aδ fibers**. **Slow pain**, burning or aching and poorly located, follows a second or more later on unmyelinated **C fibers**.\r\n\r\nPain fibers make their first synapse in the **dorsal horn** of the spinal cord. Fibers from an internal organ and from an area of skin often converge on the same dorsal horn neurons, and the brain then attributes the organ's pain to the skin. This is **referred pain**: pain from a heart starved of oxygen is often felt in the left arm and shoulder. Injured or inflamed tissue also becomes more sensitive, a state called **hyperalgesia**, which is why sunburned skin stings under a warm shower.\r\n\r\n## Turning pain down\r\n\r\nThe nervous system can suppress its own pain signals. According to the **gate control theory**, proposed by Melzack and Wall in 1965, signals from large touch fibers excite inhibitory neurons in the dorsal horn that damp pain transmission. Rubbing a bumped elbow helps for this reason.\r\n\r\nThe brain also sends suppression down from above. Guyton calls this the analgesia system. It begins in the **periaqueductal gray** of the midbrain, relays through the **raphe magnus nucleus** in the brainstem, and descends to the dorsal horn. There, local neurons release **endogenous opioids** such as enkephalin, which block pain signals before they can ascend. Morphine relieves pain by acting on the same opioid receptors."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude Code (Claude Opus 5.5)",
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
      "puzzleId": "somatic-sensation-and-pain",
      "puzzleRevision": "fnv1a32:f00fb9b6",
      "board": {
        "width": 1240,
        "height": 800
      },
      "nodes": {
        "term:Pacinian corpuscles": {
          "x": 801.5,
          "y": 32.95
        },
        "term:Meissner's corpuscles": {
          "x": 610.18,
          "y": 35.93
        },
        "term:Merkel's discs": {
          "x": 667.02,
          "y": 292.93
        },
        "term:Ruffini's endings": {
          "x": 560.36,
          "y": 184.24
        },
        "term:thermoreceptors": {
          "x": 806.56,
          "y": 243.95
        },
        "term:adaptation": {
          "x": 962.11,
          "y": 68.8
        },
        "term:receptive field": {
          "x": 1147.96,
          "y": 66.02
        },
        "term:labeled line principle": {
          "x": 1150.7,
          "y": 204.15
        },
        "term:two-point discrimination": {
          "x": 1026.98,
          "y": 271.55
        },
        "term:dorsal column–medial lemniscal system": {
          "x": 818.21,
          "y": 516.26
        },
        "term:thalamus": {
          "x": 588.86,
          "y": 708.32
        },
        "term:primary somatosensory cortex": {
          "x": 788.34,
          "y": 705.9
        },
        "term:sensory homunculus": {
          "x": 860.23,
          "y": 622.75
        },
        "term:decussation": {
          "x": 529.53,
          "y": 516.17
        },
        "term:fast pain": {
          "x": 267.03,
          "y": 541.61
        },
        "term:slow pain": {
          "x": 161.32,
          "y": 524.69
        },
        "term:Aδ fibers": {
          "x": 275.37,
          "y": 396.9
        },
        "term:C fibers": {
          "x": 389.81,
          "y": 560.39
        },
        "term:referred pain": {
          "x": 199.78,
          "y": 458.6
        },
        "term:hyperalgesia": {
          "x": 266.87,
          "y": 622.46
        },
        "term:endogenous opioids": {
          "x": 132.7,
          "y": 196.14
        },
        "term:periaqueductal gray": {
          "x": 170.89,
          "y": 60.4
        },
        "term:raphe magnus nucleus": {
          "x": 361.98,
          "y": 202.19
        },
        "term:receptor potential": {
          "x": 873.1,
          "y": 165.73
        },
        "term:nociceptors": {
          "x": 541.41,
          "y": 324.45
        },
        "term:lateral inhibition": {
          "x": 1006.66,
          "y": 418.39
        },
        "term:anterolateral system": {
          "x": 441.25,
          "y": 655.06
        },
        "term:gate control theory": {
          "x": 444.3,
          "y": 90.44
        },
        "term:dorsal horn": {
          "x": 256.23,
          "y": 275.46
        },
        "cluster:0": {
          "x": 707.5,
          "y": 115.03
        },
        "cluster:1": {
          "x": 1061.41,
          "y": 145.12
        },
        "cluster:2": {
          "x": 617.44,
          "y": 635.35
        },
        "cluster:3": {
          "x": 450.9,
          "y": 427.05
        },
        "cluster:4": {
          "x": 272.24,
          "y": 139.84
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T01:37:43.030Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "somatic-sensation-and-pain",
      "puzzleRevision": "fnv1a32:f00fb9b6",
      "board": {
        "width": 1240,
        "height": 800
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 626.97,
          "y": 180.76,
          "pinned": true
        },
        "cluster:1": {
          "x": 1021.83,
          "y": 159.17,
          "pinned": true
        },
        "cluster:2": {
          "x": 952.31,
          "y": 584.35,
          "pinned": true
        },
        "cluster:3": {
          "x": 470.81,
          "y": 602.26,
          "pinned": true
        },
        "cluster:4": {
          "x": 209.21,
          "y": 309.44,
          "pinned": true
        }
      },
      "bridges": {
        "term:receptor potential": {
          "x": 823.34,
          "y": 298.09,
          "pinned": true
        },
        "term:nociceptors": {
          "x": 515.53,
          "y": 368.23,
          "pinned": true
        },
        "term:lateral inhibition": {
          "x": 1145.99,
          "y": 369.63,
          "pinned": true
        },
        "term:anterolateral system": {
          "x": 736.83,
          "y": 417.21,
          "pinned": true
        },
        "term:gate control theory": {
          "x": 369.67,
          "y": 89.45,
          "pinned": true
        },
        "term:dorsal horn": {
          "x": 225.38,
          "y": 502.36,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Pacinian corpuscles",
          "Meissner's corpuscles",
          "Merkel's discs",
          "Ruffini's endings",
          "thermoreceptors"
        ],
        "cluster:1": [
          "adaptation",
          "receptive field",
          "labeled line principle",
          "two-point discrimination"
        ],
        "cluster:2": [
          "dorsal column–medial lemniscal system",
          "thalamus",
          "primary somatosensory cortex",
          "sensory homunculus",
          "decussation"
        ],
        "cluster:3": [
          "fast pain",
          "slow pain",
          "Aδ fibers",
          "C fibers",
          "referred pain",
          "hyperalgesia"
        ],
        "cluster:4": [
          "endogenous opioids",
          "periaqueductal gray",
          "raphe magnus nucleus"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Merkel's discs",
          "Ruffini's endings",
          "Meissner's corpuscles",
          "Pacinian corpuscles",
          "thermoreceptors"
        ],
        "cluster:1": [
          "receptive field",
          "two-point discrimination",
          "labeled line principle",
          "adaptation"
        ],
        "cluster:2": [
          "decussation",
          "primary somatosensory cortex",
          "dorsal column–medial lemniscal system",
          "sensory homunculus",
          "thalamus"
        ],
        "cluster:3": [
          "slow pain",
          "Aδ fibers",
          "referred pain",
          "hyperalgesia",
          "fast pain",
          "C fibers"
        ],
        "cluster:4": [
          "periaqueductal gray",
          "raphe magnus nucleus",
          "endogenous opioids"
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
        "totalLength": 1878.9016088887597
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T01:37:51.103Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "somatic-sensation-and-pain",
      "puzzleRevision": "fnv1a32:f00fb9b6",
      "board": {
        "width": 1240,
        "height": 800
      },
      "nodes": {
        "term:Pacinian corpuscles": {
          "x": 618.82,
          "y": 222.79,
          "pinned": true
        },
        "term:Meissner's corpuscles": {
          "x": 611.07,
          "y": 65.08,
          "pinned": true
        },
        "term:Merkel's discs": {
          "x": 714.03,
          "y": 123.71,
          "pinned": true
        },
        "term:Ruffini's endings": {
          "x": 426.22,
          "y": 186.74,
          "pinned": true
        },
        "term:thermoreceptors": {
          "x": 493.19,
          "y": 121.06,
          "pinned": true
        },
        "term:adaptation": {
          "x": 960,
          "y": 254.88,
          "pinned": true
        },
        "term:receptive field": {
          "x": 859.59,
          "y": 187.51,
          "pinned": true
        },
        "term:labeled line principle": {
          "x": 1044.12,
          "y": 184.26,
          "pinned": true
        },
        "term:two-point discrimination": {
          "x": 959.02,
          "y": 339.16,
          "pinned": true
        },
        "term:dorsal column–medial lemniscal system": {
          "x": 896.7,
          "y": 550.16,
          "pinned": true
        },
        "term:thalamus": {
          "x": 758.67,
          "y": 666.02,
          "pinned": true
        },
        "term:primary somatosensory cortex": {
          "x": 846.28,
          "y": 728.24,
          "pinned": true
        },
        "term:sensory homunculus": {
          "x": 998.34,
          "y": 665.68,
          "pinned": true
        },
        "term:decussation": {
          "x": 693.6,
          "y": 599.42,
          "pinned": true
        },
        "term:fast pain": {
          "x": 320.8,
          "y": 684.44,
          "pinned": false
        },
        "term:slow pain": {
          "x": 318.98,
          "y": 569.56,
          "pinned": true
        },
        "term:Aδ fibers": {
          "x": 177.33,
          "y": 652.6,
          "pinned": true
        },
        "term:C fibers": {
          "x": 177.57,
          "y": 735.63,
          "pinned": true
        },
        "term:referred pain": {
          "x": 306.3,
          "y": 750.13,
          "pinned": true
        },
        "term:hyperalgesia": {
          "x": 458.05,
          "y": 731.23,
          "pinned": true
        },
        "term:endogenous opioids": {
          "x": 235.49,
          "y": 426.56,
          "pinned": true
        },
        "term:periaqueductal gray": {
          "x": 140.56,
          "y": 343.4,
          "pinned": true
        },
        "term:raphe magnus nucleus": {
          "x": 267.89,
          "y": 290.55,
          "pinned": true
        },
        "term:receptor potential": {
          "x": 720.13,
          "y": 336.47,
          "pinned": true
        },
        "term:nociceptors": {
          "x": 525.54,
          "y": 456.32,
          "pinned": true
        },
        "term:lateral inhibition": {
          "x": 914.06,
          "y": 445.75,
          "pinned": true
        },
        "term:anterolateral system": {
          "x": 525.57,
          "y": 649.85,
          "pinned": true
        },
        "term:gate control theory": {
          "x": 457.72,
          "y": 339.59,
          "pinned": true
        },
        "term:dorsal horn": {
          "x": 183.98,
          "y": 541.9,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5618.23,
        "score": 5618.229592072819
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T01:37:20.391Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-15T01:29:42.524Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
