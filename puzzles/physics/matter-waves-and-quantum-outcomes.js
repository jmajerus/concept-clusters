// Generated from content/puzzles/matter-waves-and-quantum-outcomes.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "matter-waves-and-quantum-outcomes",
  "title": "Matter waves and quantum outcomes",
  "category": "Physics",
  "large": true,
  "info": {
    "text": "Quantum matter does not behave like a miniature classical wave or particle. Momentum determines a de Broglie wavelength, amplitudes interfere to set probabilities, and experiments still record individual localized outcomes.",
    "links": [
      {
        "href": "https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves",
        "label": "De Broglie’s matter waves"
      },
      {
        "href": "https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality",
        "label": "Wave-particle duality"
      },
      {
        "href": "https://www.feynmanlectures.caltech.edu/III_02.html",
        "label": "Feynman: Wave and particle viewpoints"
      }
    ],
    "citations": [
      {
        "title": "6.5 De Broglie’s Matter Waves",
        "author": "Samuel J. Ling and Jeff Sanny",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves"
      },
      {
        "title": "6.6 Wave-Particle Duality",
        "author": "Samuel J. Ling and Jeff Sanny",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality"
      },
      {
        "title": "The Feynman Lectures on Physics, Vol. III, Ch. 2: The Relation of Wave and Particle Viewpoints",
        "author": "Richard P. Feynman",
        "publisher": "California Institute of Technology",
        "url": "https://www.feynmanlectures.caltech.edu/III_02.html"
      }
    ]
  },
  "clusters": [
    {
      "id": "wave-momentum-link",
      "name": "Wave–momentum link",
      "color": "teal",
      "fact": "The de Broglie relation pairs a particle’s momentum with a wavelength, while a wave packet combines wavelengths into a state that is more localized in space.",
      "terms": [
        "wavelength",
        "momentum",
        "de Broglie relation",
        "wave packet"
      ],
      "seeds": [
        "wavelength",
        "momentum"
      ],
      "termInfo": {
        "wavelength": {
          "text": "The spatial period of a wave. For matter waves it is inversely proportional to particle momentum."
        },
        "momentum": {
          "text": "A quantity of motion denoted p. In the de Broglie relation, greater momentum means a shorter wavelength."
        },
        "de Broglie relation": {
          "text": "The relation λ = h/p, connecting a particle’s momentum to its matter-wave wavelength."
        },
        "wave packet": {
          "text": "A localized combination of component waves with different wavelengths and momenta rather than one infinitely extended wave."
        }
      },
      "info": {
        "text": "The quantitative translation between a particle’s motion and the spatial scale of its quantum wave behavior.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves",
            "label": "OpenStax matter waves"
          }
        ]
      }
    },
    {
      "id": "matter-wave-evidence",
      "name": "Matter-wave evidence",
      "color": "blue",
      "fact": "Davisson–Germer diffraction, single-electron interference, and electron microscopy reveal wave structure in electrons even though each measurement produces a localized detection.",
      "terms": [
        "electron diffraction",
        "electron microscope",
        "Davisson–Germer experiment",
        "single-electron interference",
        "localized detection"
      ],
      "seeds": [
        "electron diffraction",
        "electron microscope"
      ],
      "termInfo": {
        "electron diffraction": {
          "text": "The production of wave-like diffraction patterns when electrons scatter from a crystal or pass through an aperture."
        },
        "electron microscope": {
          "text": "An imaging instrument that exploits electrons’ very short de Broglie wavelengths to resolve details smaller than light microscopy can."
        },
        "Davisson–Germer experiment": {
          "text": "The 1927 nickel-crystal scattering experiment whose electron diffraction peaks confirmed de Broglie’s matter-wave prediction."
        },
        "single-electron interference": {
          "text": "An interference pattern that accumulates even when electrons traverse the apparatus one at a time."
        },
        "localized detection": {
          "text": "Each electron is recorded as one event at a particular detector location, not as a fraction spread across the screen."
        }
      },
      "info": {
        "text": "Experiments and applications in which electron wavelengths produce patterns while detectors register individual events.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality",
            "label": "OpenStax wave-particle evidence"
          }
        ]
      }
    },
    {
      "id": "quantum-amplitudes",
      "name": "Quantum amplitudes",
      "color": "amber",
      "fact": "A wavefunction supplies probability amplitudes whose absolute squares, through the Born rule, give probabilities for possible measurement outcomes.",
      "terms": [
        "wavefunction",
        "probability amplitude",
        "Born rule"
      ],
      "seeds": [
        "wavefunction",
        "probability amplitude"
      ],
      "termInfo": {
        "wavefunction": {
          "text": "A complex-valued representation of a quantum state that supplies amplitudes for possible measurement results."
        },
        "probability amplitude": {
          "text": "A complex number assigned to a possible alternative; amplitudes add before their magnitudes are squared."
        },
        "Born rule": {
          "text": "The rule that converts a quantum amplitude into a probability by taking its absolute square."
        }
      },
      "info": {
        "text": "The mathematical chain from a quantum state to probabilities for measurable outcomes.",
        "links": [
          {
            "href": "https://www.feynmanlectures.caltech.edu/III_02.html",
            "label": "Feynman on probability amplitudes"
          }
        ]
      }
    },
    {
      "id": "measurement-limits",
      "name": "Measurement limits",
      "color": "magenta",
      "fact": "The uncertainty principle, complementarity, and measurement context show why mutually exclusive experimental arrangements reveal different aspects rather than one hidden classical trajectory.",
      "terms": [
        "uncertainty principle",
        "complementarity",
        "measurement context"
      ],
      "seeds": [
        "uncertainty principle",
        "complementarity"
      ],
      "termInfo": {
        "uncertainty principle": {
          "text": "The quantum limit ΔxΔp ≥ ℏ/2 on jointly sharp position and momentum, not merely a flaw in measuring instruments."
        },
        "complementarity": {
          "text": "The principle that mutually exclusive experimental arrangements can reveal different, jointly necessary aspects of a quantum system."
        },
        "measurement context": {
          "text": "The complete experimental setup that determines which alternatives are distinguishable and therefore whether interference can occur."
        }
      },
      "info": {
        "text": "Principles limiting which classical-style properties can be made jointly definite or revealed in one experimental arrangement.",
        "links": [
          {
            "href": "https://www.feynmanlectures.caltech.edu/III_02.html",
            "label": "Feynman on wave and particle viewpoints"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "diffraction-pattern",
      "term": "diffraction pattern",
      "clusters": [
        0,
        1
      ],
      "fact": "The wavelength predicted from electron momentum sets the spacing of the diffraction pattern observed in crystal-scattering experiments.",
      "info": {
        "text": "A structured distribution of electron detections whose spacing depends on de Broglie wavelength.",
        "links": [
          {
            "href": "https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves",
            "label": "Electron diffraction"
          }
        ]
      },
      "termRole": "reference",
      "relationKind": "foundation",
      "idealTerms": [
        "de Broglie relation",
        "electron diffraction"
      ]
    },
    {
      "id": "amplitudes-to-outcomes",
      "term": "amplitudes to outcomes",
      "clusters": [
        2,
        1,
        3
      ],
      "fact": "Probability amplitudes combine according to the available experimental alternatives; the Born rule converts them into outcome probabilities, and individual results remain localized detections.",
      "info": {
        "text": "The local chain is amplitude addition, probability calculation, then one registered detector result under a specified setup."
      },
      "termRole": "connector",
      "relationKind": "cross-cutting",
      "idealTerms": [
        "probability amplitude",
        "localized detection",
        "measurement context"
      ]
    }
  ],
  "lenses": [
    {
      "id": "de-broglie-equation",
      "prompt": "Which terms appear directly in the de Broglie relation λ = h/p?",
      "explanation": "The relation pairs wavelength λ with momentum p. The de Broglie relation names that equation; a wave packet is built from multiple component wavelengths but is not itself a symbol in λ = h/p.",
      "targets": [
        "wavelength",
        "momentum",
        "de Broglie relation"
      ],
      "reasons": {
        "wavelength": "It is λ, the wave scale predicted by the equation.",
        "momentum": "It is p, the particle quantity inversely related to wavelength.",
        "de Broglie relation": "It is the name of λ = h/p."
      }
    },
    {
      "id": "amplitude-to-probability",
      "prompt": "Which terms trace the quantum chain from a state description to an individual detector event?",
      "explanation": "A wavefunction supplies probability amplitudes, and the Born rule turns their magnitudes into outcome probabilities. A localized detection is then one recorded event sampled from that probability distribution.",
      "targets": [
        "wavefunction",
        "probability amplitude",
        "Born rule",
        "localized detection"
      ],
      "reasons": {
        "wavefunction": "It represents the quantum state and supplies amplitudes for possible outcomes.",
        "probability amplitude": "It is the complex quantity assigned to an alternative.",
        "Born rule": "It converts amplitude magnitudes into probabilities.",
        "localized detection": "It is the individual detector event drawn from the predicted distribution."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From matter waves to measurements",
    "summary": "Connect de Broglie matter-wave evidence to the quantum chain from amplitudes and probabilities to localized outcomes.",
    "estimatedMinutes": 1,
    "content": {
      "mediaType": "text/markdown",
      "text": "De Broglie’s proposal assigns a wavelength λ = h/p to matter, so electrons can diffract and interfere even when they arrive at a detector one at a time. This does not mean an electron is simply a tiny classical wave: its quantum state supplies amplitudes for possible outcomes.\n\nThose amplitudes combine according to the experimental arrangement, and the Born rule turns their magnitudes into probabilities. Measurement then records one localized result. The learning objective is to connect matter-wave evidence with the quantum chain from state, through amplitude and probability, to an observed event."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (gpt-5.6-sol)"
      },
      {
        "name": "Cursor"
      }
    ]
  }
});
