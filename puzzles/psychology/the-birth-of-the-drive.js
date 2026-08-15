// Generated from content/puzzles/the-birth-of-the-drive.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-birth-of-the-drive",
  "title": "The Birth of the Drive",
  "category": "Psychology",
  "categories": ["Psychology", "Philosophy"],
  "large": true,
  "tags": [
    "catalogue:wholeness-and-its-discontents"
  ],
  "info": {
    "link": "wiki:Sigmund Freud",
    "text": "Freud's earliest mapping of the psyche: where a wish lives, how much force it carries, and what happens to it when the ego will not let it through."
  },
  "lenses": [
    {
      "explanation": "Before the ego intervenes, mental life is just force looking for discharge: primary process has no logic or timing, a wish presses for satisfaction, and unbound energy is precisely the excitation that has not yet been stabilized into anything a defense can manage.",
      "id": "raw-impulses",
      "prompt": "Which concepts describe unmediated force -- desire or energy before any defense, delay, or disguise has acted on it?",
      "reasons": {
        "bound vs. unbound energy": "Unbound is the state this lens is about: free-floating excitation that has not yet been harnessed into structure.",
        "drive impulse (Trieb)": "The physiological pressure at the root of the whole system, before it has a target or a disguise.",
        "primary process thought": "The mode of thinking with no contradiction, negation, or linear time -- pure demand, not yet organized.",
        "unconscious wish": "What primary process actually wants -- the raw content the rest of the apparatus has to manage."
      },
      "targets": [
        "primary process thought",
        "drive impulse (Trieb)",
        "unconscious wish",
        "bound vs. unbound energy"
      ]
    },
    {
      "explanation": "Condensation and displacement are how a forbidden wish disguises itself on the way up; compromise formation and symptom conversion are what that disguise looks like once it has actually broken through. Same operation, read from two ends of the trip.",
      "id": "disguises-and-conversions",
      "prompt": "Which concepts are mechanisms that let an unacceptable idea change its appearance to get past a defense?",
      "reasons": {
        "compromise formation": "The finished disguise: a symptom, slip, or neurosis that half-expresses and half-hides the same wish.",
        "dynamic displacement": "Emotional weight moved off the real target and onto something safe enough to pass the censor.",
        "psychic condensation": "Several ideas fused into one image, so no single element looks dangerous enough to block.",
        "symptom conversion": "The disguise taken to the body -- psychological conflict rewritten as physical complaint."
      },
      "targets": [
        "psychic condensation",
        "dynamic displacement",
        "compromise formation",
        "symptom conversion"
      ]
    },
    {
      "explanation": "Each of these is a gate rather than a content: the pleasure principle sets what a drive demands, the reality principle delays that demand until it can be safely met, the preconscious filter decides what may become conscious, and counter-cathexis is the standing cost of keeping a gate shut.",
      "id": "governing-thresholds",
      "prompt": "Which concepts act as a boundary or regulator, controlling how much psychic energy is allowed to move and where?",
      "reasons": {
        "counter-cathexis": "Energy permanently spent holding a boundary closed -- a threshold with an ongoing price.",
        "pleasure principle": "The rule that unconscious life follows by default: seek discharge now, regardless of consequence.",
        "preconscious filter": "The checkpoint an idea must clear before it can reach consciousness at all.",
        "the reality principle": "The developmental override that makes the pleasure principle wait for a workable moment."
      },
      "targets": [
        "pleasure principle",
        "the reality principle",
        "preconscious filter",
        "counter-cathexis"
      ]
    }
  ],
  "learningIntroduction": {
    "content": {
      "mediaType": "text/markdown",
      "text": "# A mind not fully its own\n\nFor most of Western philosophy, the conscious mind was assumed to be transparent to itself -- reason in charge, choice legible to the chooser. Sigmund Freud's earliest theoretical writing proposed something stranger: that the conscious ego is a thin crust over a much larger, turbulent system it does not control and cannot fully see.\n\nEarly psychoanalysis approaches that system from three angles at once, and this puzzle asks you to hold all three in view together.\n\n## Where does a thought live?\n\nFreud's first spatial model divides the mind into Conscious, Preconscious, and Unconscious layers. Down in the unconscious, thinking follows rules that would look like nonsense anywhere else: two ideas can merge into one symbol, intense feeling can jump from a dangerous target onto a harmless one, and there is no contradiction, no negation, and no clock. An idea has to clear a filter before it is even eligible to become conscious at all.\n\n## How much force is behind it?\n\nA separate, quantitative view treats the mind as a system of energy rather than a place. Desire is not just an idea -- it is a quantity of pressure seeking release, and psychic life is largely the story of that pressure moving, accumulating, and being spent. Some of it stays wild and unstable, demanding instant discharge. Some of it gets bound into structure and put to steadier use. Development is largely what happens when a system built for instant discharge is forced to tolerate delay.\n\n## What happens when it's blocked?\n\nWhen a demand for discharge threatens conscious stability, the mind can simply refuse it entry. But blocked energy is not destroyed -- it keeps pressing, and holding it down costs something ongoing rather than free. Under enough pressure, an alarm fires, and the blocked material finds another way through: disguised, distorted, half-hidden and half-expressed, in a form the conscious mind can tolerate without recognizing what it actually is.\n\n## A question to hold onto\n\nThree separate vocabularies -- *where*, *how much*, and *how managed* -- turn out to describe one continuous process, not three different topics. As you organize the terms in this puzzle, ask yourself: at which point does an idea actually stop being \"raw,\" and start being something the mind has already reshaped to make bearable?\n\n> **Reflection:** If a repressed impulse always finds *some* way back through, what does that suggest about the difference between resolving a conflict and merely disguising it well?\n"
    },
    "estimatedMinutes": 4,
    "requirement": "recommended",
    "revision": 1,
    "summary": "Distinguish where a thought lives, how much force it carries, and what happens to it under pressure, before organizing the drive-theory vocabulary in this puzzle.",
    "title": "A Mind Not Fully Its Own"
  },
  "clusters": [
    {
      "id": "topographical-mind-primary-process",
      "name": "Topographical Mind & Primary Process",
      "color": "teal",
      "fact": "Freud's first spatial model splits mental life into Conscious, Preconscious, and Unconscious systems. Down in the unconscious, thought runs on primary process: no contradiction, no negation, no linear time -- just condensation and displacement moving a wish toward disguised expression.",
      "terms": [
        "primary process thought",
        "pleasure principle",
        "psychic condensation",
        "dynamic displacement",
        "unconscious wish",
        "preconscious filter"
      ],
      "seeds": [
        "primary process thought",
        "pleasure principle"
      ],
      "termInfo": {
        "dynamic displacement": {
          "text": "Emotional charge shifted off a dangerous idea and onto a neutral one, so the neutral idea carries feeling that does not belong to it."
        },
        "pleasure principle": {
          "link": "wiki:Pleasure principle (psychology)",
          "text": "The default rule of unconscious life -- seek discharge and avoid unpleasure immediately, with no regard for consequence."
        },
        "preconscious filter": {
          "text": "The checkpoint between the unconscious and consciousness: material has to clear it before it can be thought about directly."
        },
        "primary process thought": {
          "link": "wiki:Primary and secondary processes",
          "text": "The unconscious's own mode of thinking: images and ideas can merge, substitute for each other, and ignore time or contradiction entirely."
        },
        "psychic condensation": {
          "text": "Several memories, wishes, or figures compressed into a single symbol or image, the way one dream figure can stand in for several people at once."
        },
        "unconscious wish": {
          "text": "The actual desire driving primary process -- the content everything else in this puzzle exists to manage or disguise."
        }
      },
      "info": {
        "link": "wiki:Psychoanalysis"
      }
    },
    {
      "id": "economic-model-drive-dynamics",
      "name": "Economic Model & Drive Dynamics",
      "color": "blue",
      "fact": "Freud's economic model treats the psyche as a quantity of force rather than a place: drives generate tension that seeks discharge, and psychic life is largely the story of that tension moving, binding, and being spent.",
      "terms": [
        "libidinal cathexis",
        "erogenous zone",
        "bound vs. unbound energy",
        "drive impulse (Trieb)",
        "primary narcissism",
        "economic equilibrium"
      ],
      "seeds": [
        "libidinal cathexis",
        "erogenous zone"
      ],
      "termInfo": {
        "bound vs. unbound energy": {
          "text": "Unbound energy is free-floating and unstable, seeking instant release; bound energy has been harnessed by psychic structure to do stable work."
        },
        "drive impulse (Trieb)": {
          "link": "wiki:Drive theory",
          "text": "The physiological pressure at the root of desire -- a demand made on the mind by the body."
        },
        "economic equilibrium": {
          "text": "The psyche's default goal in this model: keep internal excitation as low and stable as it can manage."
        },
        "erogenous zone": {
          "link": "wiki:Erogenous zone",
          "text": "A bodily site where drive tension characteristically localizes and seeks discharge."
        },
        "libidinal cathexis": {
          "link": "wiki:Cathexis",
          "text": "The investment of psychic energy in an object, person, or idea -- what it means, in this model, to want something."
        },
        "primary narcissism": {
          "link": "wiki:Narcissism",
          "text": "The infantile state before self and world are distinguished, when energy circulates without a fixed external object."
        }
      },
      "info": {
        "link": "wiki:Metapsychology"
      }
    },
    {
      "id": "repression-symptom-formation",
      "name": "Repression & Symptom Formation",
      "color": "amber",
      "fact": "A drive impulse that threatens conscious stability gets repressed -- but repressed energy cannot be destroyed, only held down at a cost, and it inevitably returns in a disguised, distorted form.",
      "terms": [
        "primary repression",
        "return of the repressed",
        "compromise formation",
        "reaction formation",
        "symptom conversion",
        "counter-cathexis"
      ],
      "seeds": [
        "primary repression",
        "return of the repressed"
      ],
      "termInfo": {
        "compromise formation": {
          "text": "A neurosis, slip, or symptom that grants a forbidden wish partial, distorted satisfaction while still disguising it."
        },
        "counter-cathexis": {
          "text": "Active psychic energy spent purely to hold a repressed impulse below awareness -- the standing cost of a maintained defense."
        },
        "primary repression": {
          "link": "wiki:Repression (psychoanalysis)",
          "text": "The original barring of an unacceptable impulse from ever reaching consciousness in the first place."
        },
        "reaction formation": {
          "link": "wiki:Reaction formation",
          "text": "Converting an unacceptable impulse into its exact opposite conscious attitude -- unacknowledged hostility becomes hyper-vigilant kindness."
        },
        "return of the repressed": {
          "link": "wiki:Return of the repressed",
          "text": "The rule that repressed material does not simply disappear -- it re-emerges, disguised, as symptom, slip, or dream."
        },
        "symptom conversion": {
          "link": "wiki:Conversion disorder",
          "text": "Psychological conflict translated directly into a physical, bodily complaint."
        }
      },
      "info": {
        "text": "How the mind manages an impulse it will not allow into consciousness -- and what happens when that management fails."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-the-reality-principle",
      "term": "the reality principle",
      "clusters": [
        0,
        1
      ],
      "fact": "Development forces primary process to compromise: the demand for immediate discharge under the pleasure principle is delayed and reshaped by external reality until the psyche can tolerate holding tension toward a stable equilibrium instead of releasing it at once.",
      "relationKind": "dynamic",
      "info": {
        "link": "wiki:Reality principle"
      },
      "idealTerms": [
        "pleasure principle",
        "economic equilibrium"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "bridge-subconscious-displacement",
      "term": "subconscious displacement",
      "clusters": [
        0,
        2
      ],
      "fact": "The same displacement that lets primary process substitute one symbol for another is what allows a repressed wish to sneak past the censor by attaching itself to an innocent stand-in -- condensation and displacement are the actual machinery a compromise formation is built from.",
      "relationKind": "dynamic",
      "idealTerms": [
        "dynamic displacement",
        "compromise formation"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    },
    {
      "id": "bridge-energy-neutralization",
      "term": "energy neutralization",
      "clusters": [
        1,
        2
      ],
      "fact": "Holding a drive below awareness is not free: the ego has to convert some of its own bound energy into counter-cathexis, a permanent expenditure that keeps a repressed impulse pinned down at the cost of energy the rest of the psyche cannot use.",
      "relationKind": "dynamic",
      "idealTerms": [
        "bound vs. unbound energy",
        "counter-cathexis"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Google",
      "role": "drafted",
      "scope": "learningIntroduction",
      "system": "Gemini"
    },
    {
      "date": "2026-08-07",
      "provider": "Anthropic",
      "role": "edited",
      "scope": "puzzle",
      "system": "Claude"
    }
  ]
});
