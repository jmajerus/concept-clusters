// Generated from content/puzzles/ai-generated-synthetic-media.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "ai-generated-synthetic-media",
  "title": "AI-generated and synthetic media",
  "category": "media-information-literacy",
  "subcategories": {
    "media-information-literacy": "verification-fact-checking"
  },
  "info": {
    "citations": [
      {
        "title": "C2PA Explainer (specification 2.4)",
        "url": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
      },
      {
        "title": "Content Credentials",
        "url": "https://contentcredentials.org/"
      },
      {
        "title": "NIST AI Challenges: Forensics",
        "url": "https://ai-challenges.nist.gov/forensics"
      },
      {
        "title": "FTC: Scammers use AI to enhance their family emergency schemes",
        "url": "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes"
      },
      {
        "title": "About Reuters Fact Check",
        "url": "https://www.reuters.com/fact-check/about/"
      },
      {
        "title": "Liar's dividend",
        "url": "https://en.wikipedia.org/wiki/Liar%27s_dividend"
      }
    ]
  },
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
      "id": "detection-signals",
      "name": "Detection signals",
      "color": "magenta",
      "fact": "Detection signals are read from the media itself, through an embedded watermark, a classifier's estimate or expert examination, so they can work without a record attached by the creator, but they can also be wrong or removed.",
      "terms": [
        "AI-content detector",
        "invisible watermark",
        "forensic analysis"
      ],
      "seeds": [
        "AI-content detector",
        "forensic analysis"
      ],
      "termInfo": {
        "AI-content detector": {
          "text": "Software that estimates whether media or text was produced by a generative model, giving a probability rather than proof.",
          "links": [
            {
              "href": "wiki:Artificial intelligence content detection"
            },
            {
              "href": "https://ai-challenges.nist.gov/forensics"
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
        },
        "invisible watermark": {
          "text": "A signal embedded in the pixels or audio of generated media that people cannot perceive but software can look for, and that can survive some copying.",
          "links": [
            {
              "href": "wiki:Digital watermarking"
            },
            {
              "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "https://ai-challenges.nist.gov/forensics"
          }
        ]
      }
    },
    {
      "id": "human-verification",
      "name": "Human verification",
      "color": "amber",
      "fact": "Technical signals help, but people still need to check the original publisher, seek independent corroboration and use a known contact channel.",
      "terms": [
        "original publisher",
        "independent corroboration",
        "known-channel check"
      ],
      "seeds": [
        "original publisher",
        "independent corroboration"
      ],
      "termInfo": {
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
        "original publisher": {
          "text": "The verified organization or account that first released the media and can confirm whether the circulating item belongs to its output.",
          "links": [
            {
              "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
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
      "id": "origin-evidence",
      "term": "origin evidence",
      "clusters": [
        1,
        2
      ],
      "fact": "Origin evidence bridges provenance and detection: a signed record is declared by the creating tool and can be stripped when metadata is lost, while a watermark or detector reads the content itself and can fail in different situations, so neither replaces the other.",
      "info": {
        "text": "Evidence about whether, and by what tool, media was generated, whether declared alongside the file or inferred from it.",
        "links": [
          {
            "href": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "Content Credentials",
        "invisible watermark"
      ]
    },
    {
      "id": "authentication",
      "term": "authentication",
      "clusters": [
        1,
        3
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
  },
  "learningIntroduction": {
    "requirement": "optional",
    "summary": "When convincing fakes are cheap, appearance proves little. This lesson separates the kinds of evidence that still help, and why none of them works alone.",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Generative tools can now produce convincing video, cloned voices, images and documents. A realistic look is no longer evidence that something happened, so the useful question changes from \"does this look real?\" to \"what kind of evidence do I have, and how can it fail?\"\n\n## Three kinds of evidence\n\nThe first kind is a **recorded origin**. A creating tool or publisher can attach a signed record of how an asset was made and edited. A valid signature shows who signed and that the record has not been altered. It does not show that the content is true, and the record can be missing or stripped when a file is re-saved or re-shared.\n\nThe second kind is **inferred from the content itself**: an imperceptible watermark, a classifier's estimate, or expert forensic examination. These work without the creator's cooperation, but they give probabilities, not proof. Watermarks can be degraded, detectors make mistakes in both directions, and they fail in different situations than a signed record does. That difference is why one does not replace the other.\n\nThe third kind is **human checking of the claim and its source**: finding who first published the item, seeing whether independent reliable sources report the same event, and confirming a request through a phone number or account already known to be genuine. These checks work even when no tool can classify the file, and they are what turn technical signals into a decision about trust.\n\n## Why it matters beyond catching fakes\n\nCheap fabrication has a second effect. Once people know convincing fakes exist, genuine recordings can be dismissed as fake. This is called the *liar's dividend*. Documented origin and independent corroboration therefore matter twice: they expose fabrications, and they let authentic material be believed."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      },
      {
        "name": "Claude Code"
      }
    ]
  },
  "dateCreated": "2026-10-02",
  "dateModified": "2026-10-02"
});
