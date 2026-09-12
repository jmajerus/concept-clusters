// Generated from content/puzzles/sociology-paradigms.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "sociology-paradigms",
  "title": "Sociological paradigms",
  "category": "sociology",
  "clusters": [
    {
      "id": "structural-functionalism",
      "name": "Structural functionalism",
      "color": "teal",
      "fact": "Structural functionalism sees society as a system of interdependent parts that work together to maintain stability and cohesion.",
      "terms": [
        "social cohesion",
        "manifest function",
        "latent function"
      ],
      "seeds": [
        "social cohesion",
        "manifest function"
      ],
      "termInfo": {
        "social cohesion": {
          "links": [
            {
              "href": "wiki:Group cohesiveness"
            }
          ]
        },
        "manifest function": {
          "text": "Merton's term for a social practice's intended, recognized purpose — contrasted with its latent, unintended effects.",
          "links": [
            {
              "href": "wiki:Manifest and latent functions and dysfunctions"
            }
          ]
        },
        "latent function": {
          "links": [
            {
              "href": "wiki:Manifest and latent functions and dysfunctions"
            }
          ]
        }
      },
      "info": {
        "text": "A perspective in sociology that treats society as a system of interdependent parts, each contributing to the stability of the whole — much like organs in a body.",
        "links": [
          {
            "href": "wiki:Structural functionalism"
          }
        ]
      }
    },
    {
      "id": "conflict-theory",
      "name": "Conflict theory",
      "color": "blue",
      "fact": "Conflict theory sees society as an arena of competition, where groups struggle over scarce resources and power.",
      "terms": [
        "class struggle",
        "power",
        "inequality",
        "false consciousness"
      ],
      "seeds": [
        "class struggle",
        "power"
      ],
      "termInfo": {
        "class struggle": {
          "links": [
            {
              "href": "wiki:Class struggle"
            }
          ]
        },
        "power": {
          "text": "The ability to influence or control the behavior of others — who holds it is conflict theory's central question.",
          "links": [
            {
              "href": "wiki:Power (social and political)"
            }
          ]
        },
        "inequality": {
          "text": "Unequal access to resources, opportunities, and rewards across groups in a society.",
          "links": [
            {
              "href": "wiki:Social inequality"
            }
          ]
        },
        "false consciousness": {
          "text": "A Marxist concept: a mindset where people fail to recognize the inequality and exploitation built into their own social class position.",
          "links": [
            {
              "href": "wiki:False consciousness"
            }
          ]
        }
      },
      "info": {
        "text": "A perspective in sociology that views society as an ongoing contest between groups with different levels of resources, status, and influence.",
        "links": [
          {
            "href": "wiki:Conflict theories"
          }
        ]
      }
    },
    {
      "id": "symbolic-interactionism",
      "name": "Symbolic interactionism",
      "color": "amber",
      "fact": "Symbolic interactionism studies how individuals create meaning through everyday symbols and face-to-face interaction.",
      "terms": [
        "meaning-making",
        "symbols",
        "micro-level interaction",
        "dramaturgy"
      ],
      "seeds": [
        "meaning-making",
        "symbols"
      ],
      "termInfo": {
        "meaning-making": {
          "links": [
            {
              "href": "wiki:Meaning-making"
            }
          ]
        },
        "symbols": {
          "links": [
            {
              "href": "wiki:Symbol"
            }
          ]
        },
        "dramaturgy": {
          "text": "Goffman's idea that everyday social life resembles a theatrical performance, with people managing the impression they give others.",
          "links": [
            {
              "href": "wiki:Dramaturgy (sociology)"
            }
          ]
        },
        "micro-level interaction": {
          "text": "Face-to-face, everyday interaction between individuals — the small scale symbolic interactionism studies, as opposed to whole institutions or societies.",
          "links": [
            {
              "href": "wiki:Microsociology"
            }
          ]
        }
      },
      "info": {
        "text": "A perspective in sociology that focuses on how individuals build shared understanding through everyday interaction and the cues they exchange.",
        "links": [
          {
            "href": "wiki:Symbolic interactionism"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "socialization",
      "term": "socialization",
      "clusters": [
        0,
        1
      ],
      "fact": "Socialization bridges the two: functionalists see it as teaching shared norms that hold society together, while conflict theorists see the same process as reproducing existing inequality across generations.",
      "info": {
        "links": [
          {
            "href": "wiki:Socialization"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "social cohesion",
        "inequality"
      ]
    },
    {
      "id": "deviance",
      "term": "deviance",
      "clusters": [
        1,
        2
      ],
      "fact": "Deviance bridges the two: conflict theorists see who gets labeled deviant as a reflection of who holds power, while interactionists focus on how that labeling itself, through everyday interaction, shapes a person's identity.",
      "info": {
        "text": "Behavior that violates a society's norms — sociologists study who gets labeled deviant, and why, rather than treating the label as neutral.",
        "links": [
          {
            "href": "wiki:Deviance (sociology)"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "power",
        "meaning-making"
      ]
    }
  ]
});
