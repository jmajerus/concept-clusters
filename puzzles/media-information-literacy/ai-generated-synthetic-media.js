// Generated from content/puzzles/ai-generated-synthetic-media.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "ai-generated-synthetic-media",
  "title": "AI-generated and synthetic media",
  "category": "media-information-literacy",
  "clusters": [
    {
      "id": "synthetic-media-forms",
      "name": "Synthetic media forms",
      "color": "teal",
      "fact": "Synthetic media can imitate people or events through generated video, cloned voices, generated images and fabricated documents.",
      "terms": [
        "deepfake video",
        "cloned voice",
        "generated image",
        "fabricated document"
      ],
      "seeds": [
        "deepfake video",
        "cloned voice"
      ],
      "termInfo": {
        "deepfake video": {
          "text": "Video generated or altered to make a person appear to say or do something that did not occur.",
          "links": [
            {
              "href": "wiki:Deepfake"
            },
            {
              "href": "https://ai-challenges.nist.gov/forensics"
            }
          ]
        },
        "cloned voice": {
          "text": "Synthetic speech made to imitate a particular person's vocal characteristics, sometimes from only a short sample.",
          "links": [
            {
              "href": "wiki:Audio deepfake"
            },
            {
              "href": "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes"
            }
          ]
        },
        "generated image": {
          "text": "An image produced by a generative model from a prompt or other inputs rather than captured directly by a camera.",
          "links": [
            {
              "href": "wiki:Text-to-image model"
            },
            {
              "href": "https://contentcredentials.org/"
            }
          ]
        },
        "fabricated document": {
          "text": "A document made to look authentic even though its text, appearance, signatures or claimed origin are invented or altered.",
          "links": [
            {
              "href": "wiki:Forgery"
            },
            {
              "href": "https://contentcredentials.org/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Synthetic media"
          },
          {
            "href": "https://ai-challenges.nist.gov/forensics"
          }
        ]
      }
    },
    {
      "id": "provenance-signals",
      "name": "Provenance signals",
      "color": "blue",
      "fact": "Technical provenance signals can record how media was created or edited and whether that record has been altered.",
      "terms": [
        "Content Credentials",
        "metadata",
        "digital signature",
        "edit history"
      ],
      "seeds": [
        "Content Credentials",
        "digital signature"
      ],
      "termInfo": {
        "Content Credentials": {
          "text": "A C2PA-based record attached or linked to media that can describe its origin, edits and use of generative AI.",
          "links": [
            {
              "href": "wiki:Content Credentials"
            },
            {
              "href": "https://contentcredentials.org/"
            }
          ]
        },
        "metadata": {
          "text": "Structured information about a file, such as creation details, device data, software actions or descriptive fields.",
          "links": [
            {
              "href": "wiki:Metadata"
            },
            {
              "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
            }
          ]
        },
        "digital signature": {
          "text": "A cryptographic mechanism used to verify that signed provenance data has not been changed and came from the stated signer.",
          "links": [
            {
              "href": "wiki:Digital signature"
            },
            {
              "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
            }
          ]
        },
        "edit history": {
          "text": "A record of changes made to an asset over time, including tools or processes used when that information is captured.",
          "links": [
            {
              "href": "wiki:Version control"
            },
            {
              "href": "https://contentcredentials.org/"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Content Credentials"
          },
          {
            "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
          }
        ]
      }
    },
    {
      "id": "human-verification",
      "name": "Human verification",
      "color": "amber",
      "fact": "Technical signals help, but people still need to check the original publisher, seek independent corroboration, use a known contact channel and consult forensic analysis.",
      "terms": [
        "original publisher",
        "independent corroboration",
        "known-channel check",
        "forensic analysis"
      ],
      "seeds": [
        "original publisher",
        "independent corroboration"
      ],
      "termInfo": {
        "original publisher": {
          "text": "The verified organization or account that first released the media and can confirm whether the circulating item belongs to its output.",
          "links": [
            {
              "href": "wiki:Publishing"
            },
            {
              "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
            }
          ]
        },
        "independent corroboration": {
          "text": "Evidence from other reliable sources that supports or contradicts the event, identity or claim depicted in the media.",
          "links": [
            {
              "href": "wiki:Corroborating evidence"
            },
            {
              "href": "https://www.reuters.com/fact-check/about/"
            }
          ]
        },
        "known-channel check": {
          "text": "Contacting a person or organization through a phone number, account or website already known to be genuine instead of trusting the channel that delivered the suspicious media.",
          "links": [
            {
              "href": "wiki:Authentication"
            },
            {
              "href": "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes"
            }
          ]
        },
        "forensic analysis": {
          "text": "Systematic examination of digital media for manipulation traces, inconsistencies or technical evidence about how it was produced.",
          "links": [
            {
              "href": "wiki:Digital forensics"
            },
            {
              "href": "https://ai-challenges.nist.gov/forensics"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Fact-checking"
          },
          {
            "href": "https://www.reuters.com/fact-check/about/"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "provenance",
      "term": "provenance",
      "clusters": [
        0,
        1
      ],
      "fact": "Provenance bridges synthetic media and technical signals: it records facts about an asset's origin and history, including whether it was generated, captured or edited.",
      "info": {
        "text": "The recorded origin and history of digital content, including how it was created, modified and published.",
        "links": [
          {
            "href": "wiki:Provenance"
          },
          {
            "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
          }
        ]
      },
      "conceptId": "provenance",
      "relationKind": "evaluation",
      "idealTerms": [
        "generated image",
        "Content Credentials"
      ]
    },
    {
      "id": "authentication",
      "term": "authentication",
      "clusters": [
        1,
        2
      ],
      "fact": "Authentication bridges provenance signals and human verification: signatures and credentials can confirm a technical record, while people must still decide whether the signer, publisher and underlying claim deserve trust.",
      "info": {
        "text": "The process of checking that an identity, source or digital record is genuine and has not been substituted or tampered with.",
        "links": [
          {
            "href": "wiki:Authentication"
          },
          {
            "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
          }
        ]
      },
      "relationKind": "evaluation",
      "idealTerms": [
        "digital signature",
        "original publisher"
      ]
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "quotations-and-attribution",
        "reason": "Compare attribution of words with authentication of synthetic images, audio, video and documents.",
        "via": [
          "provenance",
          "authentication"
        ]
      }
    ]
  }
});
