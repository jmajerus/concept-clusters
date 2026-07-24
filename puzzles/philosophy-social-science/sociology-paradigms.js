// Concept Clusters puzzle: Sociological paradigms
// Category: Philosophy & Social Science
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "sociology-paradigms",
  "title": "Sociological paradigms",
  "category": "Philosophy & Social Science",
  "clusters": [
    {
      "name": "Structural functionalism",
      "info": {
        "link": "wiki:Structural functionalism"
      },
      "color": "green",
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
          "link": "wiki:Group cohesiveness"
        },
        "manifest function": {
          "text": "Merton's term for a social practice's intended, recognized purpose — contrasted with its latent, unintended effects.",
          "link": "wiki:Manifest and latent functions and dysfunctions"
        },
        "latent function": {
          "link": "wiki:Manifest and latent functions and dysfunctions"
        }
      }
    },
    {
      "name": "Conflict theory",
      "info": {
        "link": "wiki:Conflict theories"
      },
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
          "link": "wiki:Class struggle"
        },
        "power": {
          "text": "The ability to influence or control the behavior of others — who holds it is conflict theory's central question.",
          "link": "wiki:Power (social and political)"
        },
        "inequality": {
          "text": "Unequal access to resources, opportunities, and rewards across groups in a society.",
          "link": "wiki:Social inequality"
        },
        "false consciousness": {
          "text": "A Marxist concept: a mindset where people fail to recognize the inequality and exploitation built into their own social class position.",
          "link": "wiki:False consciousness"
        }
      }
    },
    {
      "name": "Symbolic interactionism",
      "info": {
        "link": "wiki:Symbolic interactionism"
      },
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
          "link": "wiki:Meaning-making"
        },
        "symbols": {
          "link": "wiki:Symbol"
        },
        "dramaturgy": {
          "text": "Goffman's idea that everyday social life resembles a theatrical performance, with people managing the impression they give others.",
          "link": "wiki:Dramaturgy (sociology)"
        },
        "micro-level interaction": {
          "text": "Face-to-face, everyday interaction between individuals — the small scale symbolic interactionism studies, as opposed to whole institutions or societies.",
          "link": "wiki:Microsociology"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "socialization",
      "clusters": [
        0,
        1
      ],
      "fact": "Socialization bridges the two: functionalists see it as teaching shared norms that hold society together, while conflict theorists see the same process as reproducing existing inequality across generations.",
      "idealTerms": [
        "social cohesion",
        "inequality"
      ],
      "info": {
        "link": "wiki:Socialization"
      }
    },
    {
      "term": "deviance",
      "clusters": [
        1,
        2
      ],
      "fact": "Deviance bridges the two: conflict theorists see who gets labeled deviant as a reflection of who holds power, while interactionists focus on how that labeling itself, through everyday interaction, shapes a person's identity.",
      "idealTerms": [
        "power",
        "meaning-making"
      ],
      "info": {
        "text": "Behavior that violates a society's norms — sociologists study who gets labeled deviant, and why, rather than treating the label as neutral.",
        "link": "wiki:Deviance (sociology)"
      }
    }
  ]
};
