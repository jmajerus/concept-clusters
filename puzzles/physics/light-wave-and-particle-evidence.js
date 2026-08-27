// Generated from content/puzzles/light-wave-and-particle-evidence.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "light-wave-and-particle-evidence",
  "title": "Light: wave and particle evidence",
  "category": "Physics",
  "large": true,
  "info": {
    "text": "Classical wave and particle models make different predictions. Light needs both descriptions: interference and diffraction reveal phase-sensitive wave behavior, while photoelectric and Compton experiments reveal discrete transfers of energy and momentum.",
    "citations": [
      {
        "title": "16.5 Interference of Waves",
        "author": "William Moebs, Samuel J. Ling, and Jeff Sanny",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves"
      },
      {
        "title": "6.6 Wave-Particle Duality",
        "author": "Samuel J. Ling and Jeff Sanny",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality"
      },
      {
        "title": "The Feynman Lectures on Physics, Vol. I, Ch. 37: Quantum Behavior",
        "author": "Richard P. Feynman",
        "publisher": "California Institute of Technology",
        "url": "https://www.feynmanlectures.caltech.edu/I_37.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "wave-patterns",
      "name": "Wave patterns",
      "color": "teal",
      "fact": "A classical wave is described by frequency and amplitude, while phase and superposition determine whether overlapping waves reinforce, cancel, or form interference and diffraction patterns.",
      "terms": [
        "frequency",
        "amplitude",
        "phase",
        "superposition",
        "interference",
        "diffraction"
      ],
      "seeds": [
        "frequency",
        "amplitude"
      ],
      "termInfo": {
        "frequency": {
          "text": "The number of wave cycles passing a point per unit time, measured in hertz."
        },
        "amplitude": {
          "text": "The maximum size of a wave’s oscillation. Wave intensity commonly depends on the square of amplitude."
        },
        "phase": {
          "text": "A wave’s position within its cycle. Relative phase determines whether overlapping waves reinforce or cancel."
        },
        "superposition": {
          "text": "The rule that overlapping wave disturbances add to produce a resultant wave."
        },
        "interference": {
          "text": "The reinforcement or cancellation produced when superposed waves have particular phase relationships."
        },
        "diffraction": {
          "text": "The spreading of a wave around an obstacle or through an opening, especially when the opening is comparable to its wavelength."
        }
      },
      "info": {
        "text": "Quantities and rules for distributed disturbances whose overlapping contributions can reinforce or cancel.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves",
            "label": "OpenStax wave interference"
          }
        ]
      }
    },
    {
      "id": "particle-model",
      "name": "Particle model",
      "color": "blue",
      "fact": "A classical point particle occupies a position, follows a trajectory, and changes its motion through localized interactions such as collisions.",
      "terms": [
        "position",
        "collision",
        "trajectory",
        "point particle"
      ],
      "seeds": [
        "position",
        "collision"
      ],
      "termInfo": {
        "position": {
          "text": "The coordinates locating a particle at a particular time in a classical description."
        },
        "collision": {
          "text": "A localized interaction in which particles exchange energy and momentum."
        },
        "trajectory": {
          "text": "The continuous path traced by a classical particle’s position over time."
        },
        "point particle": {
          "text": "An idealized object with no spatial extent, concentrating properties such as mass or charge at one position."
        }
      },
      "info": {
        "text": "The classical ideal of a localized object following a definite path through interactions."
      }
    },
    {
      "id": "light-evidence",
      "name": "Evidence from light",
      "color": "amber",
      "fact": "Young’s double-slit experiment and Maxwell’s electromagnetic wave theory establish light’s wave behavior, while the photoelectric effect, its threshold frequency, and Compton scattering require energy and momentum carried by photons.",
      "terms": [
        "photon",
        "photoelectric effect",
        "electromagnetic wave",
        "Young double-slit experiment",
        "threshold frequency",
        "Compton scattering"
      ],
      "seeds": [
        "photon",
        "photoelectric effect"
      ],
      "termInfo": {
        "photon": {
          "text": "A quantum of electromagnetic radiation with energy E = hf and momentum p = h/λ."
        },
        "photoelectric effect": {
          "text": "The emission of electrons from a material struck by light; electron energy depends on light frequency rather than intensity alone."
        },
        "electromagnetic wave": {
          "text": "A propagating pattern of coupled electric and magnetic fields, the classical wave description of light."
        },
        "Young double-slit experiment": {
          "text": "Light passing through two slits produces alternating bright and dark fringes characteristic of interference."
        },
        "threshold frequency": {
          "text": "The minimum light frequency required to eject electrons from a given material, regardless of how intense lower-frequency light is."
        },
        "Compton scattering": {
          "text": "X-rays scattered by electrons change wavelength as expected from a collision conserving photon energy and momentum."
        }
      },
      "info": {
        "text": "Experiments that make either a wave-only or particle-only classical account of light incomplete.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality",
            "label": "OpenStax wave-particle duality"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "interference-pattern",
      "term": "interference pattern",
      "clusters": [
        0,
        2
      ],
      "fact": "Phase-sensitive superposition predicts the bright and dark fringes produced when light passes through Young’s two slits.",
      "info": {
        "text": "A spatial distribution of alternating maxima and minima produced by constructive and destructive interference.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves",
            "label": "Interference patterns"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "foundation",
      "idealTerms": [
        "interference",
        "Young double-slit experiment"
      ]
    },
    {
      "id": "discrete-transfer",
      "term": "discrete transfer",
      "clusters": [
        1,
        2
      ],
      "fact": "The photoelectric and Compton effects treat light–matter interaction as localized transfers of energy and momentum carried by photons.",
      "info": {
        "text": "One localized interaction exchanges a photon-sized amount of energy and momentum rather than drawing continuously from a classical wave."
      },
      "termRole": "connector",
      "relationKind": "foundation",
      "idealTerms": [
        "collision",
        "photon"
      ]
    }
  ],
  "lenses": [
    {
      "id": "rule-and-result",
      "prompt": "Which terms name the rule for adding overlapping waves and the resulting reinforcement or cancellation?",
      "explanation": "Superposition is the addition rule; interference is the reinforcement or cancellation that results. Phase controls which result occurs but is neither the rule nor the result.",
      "targets": [
        "superposition",
        "interference"
      ],
      "reasons": {
        "superposition": "It is the rule that adds overlapping wave contributions.",
        "interference": "It is the observable reinforcement or cancellation produced by that addition."
      }
    },
    {
      "id": "wave-only-fails",
      "prompt": "Which observations specifically contradict a classical wave-only account of light’s energy transfer?",
      "explanation": "The photoelectric effect includes a threshold frequency and links emitted-electron energy to light frequency, while Compton scattering behaves like a photon–electron collision. Young’s experiment and electromagnetic-wave theory instead support the wave description.",
      "targets": [
        "photoelectric effect",
        "threshold frequency",
        "Compton scattering"
      ],
      "reasons": {
        "photoelectric effect": "Its immediate, frequency-dependent electron emission requires quantized light energy.",
        "threshold frequency": "Below this frequency, greater classical intensity still cannot eject electrons.",
        "Compton scattering": "Its wavelength shift follows energy-and-momentum conservation for photon collisions."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Why light needs two descriptions",
    "summary": "Relate classical wave and particle predictions to the experiments that reveal light’s quantum behavior.",
    "estimatedMinutes": 1,
    "content": {
      "mediaType": "text/markdown",
      "text": "Physicists distinguish models by the predictions they make. A classical wave spreads, overlaps, and produces interference or diffraction; a classical particle follows a localized path and exchanges energy and momentum in collisions.\n\nLight does not fit either classical picture by itself. Interference reveals phase-sensitive wave behavior, while photoelectric and Compton experiments reveal energy and momentum transferred in photon-sized amounts. The learning objective is to connect each description to the evidence it explains—and to recognize where that description alone fails."
    }
  },
  "generativeAssistance": [
    {
      "system": "Codex (gpt-5.6-sol)",
      "scope": "puzzle",
      "role": "edited",
      "provider": "OpenAI",
      "date": "2026-08-27"
    },
    {
      "system": "Cursor",
      "scope": "puzzle",
      "role": "edited",
      "provider": "Cursor",
      "date": "2026-08-26"
    },
    {
      "system": "Codex (gpt-5.6-sol)",
      "scope": "learningIntroduction",
      "role": "edited",
      "provider": "OpenAI",
      "date": "2026-08-27"
    }
  ],
  "provenance": {
    "collaboration": "aiPrimary",
    "contributors": [
      {
        "name": "Codex (gpt-5.6-sol)"
      },
      {
        "name": "Cursor"
      },
      {
        "name": "John Majerus"
      }
    ]
  }
});
