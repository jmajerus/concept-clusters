// Concept Clusters puzzle: AI-generated and synthetic media
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Includes relatedPuzzles navigation metadata and a shared provenance conceptId.

export default {
  "id": "ai-generated-synthetic-media",
  "title": "AI-generated and synthetic media",
  "category": "Media & Information Literacy",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "quotations-and-attribution",
        "via": [
          "provenance",
          "authentication"
        ],
        "reason": "Compare attribution of words with authentication of synthetic images, audio, video and documents."
      }
    ]
  },
  "clusters": [
    {
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
          "link": "wiki:Deepfake",
          "extraLink": "https://ai-challenges.nist.gov/forensics"
        },
        "cloned voice": {
          "text": "Synthetic speech made to imitate a particular person's vocal characteristics, sometimes from only a short sample.",
          "link": "wiki:Audio deepfake",
          "extraLink": "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes"
        },
        "generated image": {
          "text": "An image produced by a generative model from a prompt or other inputs rather than captured directly by a camera.",
          "link": "wiki:Text-to-image model",
          "extraLink": "https://contentcredentials.org/"
        },
        "fabricated document": {
          "text": "A document made to look authentic even though its text, appearance, signatures or claimed origin are invented or altered.",
          "link": "wiki:Forgery",
          "extraLink": "https://contentcredentials.org/"
        }
      },
      "info": {
        "link": "wiki:Synthetic media",
        "extraLink": "https://ai-challenges.nist.gov/forensics"
      }
    },
    {
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
          "link": "wiki:Content Credentials",
          "extraLink": "https://contentcredentials.org/"
        },
        "metadata": {
          "text": "Structured information about a file, such as creation details, device data, software actions or descriptive fields.",
          "link": "wiki:Metadata",
          "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
        },
        "digital signature": {
          "text": "A cryptographic mechanism used to verify that signed provenance data has not been changed and came from the stated signer.",
          "link": "wiki:Digital signature",
          "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
        },
        "edit history": {
          "text": "A record of changes made to an asset over time, including tools or processes used when that information is captured.",
          "link": "wiki:Version control",
          "extraLink": "https://contentcredentials.org/"
        }
      },
      "info": {
        "link": "wiki:Content Credentials",
        "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
      }
    },
    {
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
          "link": "wiki:Publishing",
          "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
        },
        "independent corroboration": {
          "text": "Evidence from other reliable sources that supports or contradicts the event, identity or claim depicted in the media.",
          "link": "wiki:Corroborating evidence",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        },
        "known-channel check": {
          "text": "Contacting a person or organization through a phone number, account or website already known to be genuine instead of trusting the channel that delivered the suspicious media.",
          "link": "wiki:Authentication",
          "extraLink": "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes"
        },
        "forensic analysis": {
          "text": "Systematic examination of digital media for manipulation traces, inconsistencies or technical evidence about how it was produced.",
          "link": "wiki:Digital forensics",
          "extraLink": "https://ai-challenges.nist.gov/forensics"
        }
      },
      "info": {
        "link": "wiki:Fact-checking",
        "extraLink": "https://www.reuters.com/fact-check/about/"
      }
    }
  ],
  "bridges": [
    {
      "term": "provenance",
      "conceptId": "provenance",
      "clusters": [
        0,
        1
      ],
      "relationKind": "evaluation",
      "fact": "Provenance bridges synthetic media and technical signals: it records facts about an asset's origin and history, including whether it was generated, captured or edited.",
      "idealTerms": [
        "generated image",
        "Content Credentials"
      ],
      "info": {
        "text": "The recorded origin and history of digital content, including how it was created, modified and published.",
        "link": "wiki:Provenance",
        "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
      }
    },
    {
      "term": "authentication",
      "clusters": [
        1,
        2
      ],
      "relationKind": "evaluation",
      "fact": "Authentication bridges provenance signals and human verification: signatures and credentials can confirm a technical record, while people must still decide whether the signer, publisher and underlying claim deserve trust.",
      "idealTerms": [
        "digital signature",
        "original publisher"
      ],
      "info": {
        "text": "The process of checking that an identity, source or digital record is genuine and has not been substituted or tampered with.",
        "link": "wiki:Authentication",
        "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
      }
    }
  ]
};
