// Generated from content/puzzles/media-literacy.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "media-literacy",
  "title": "Misinformation & media literacy",
  "category": "media-information-literacy",
  "subcategories": {
    "media-information-literacy": "verification-fact-checking"
  },
  "clusters": [
    {
      "id": "types-of-false-information",
      "name": "Types of false information",
      "color": "teal",
      "fact": "False information is classified by intent and harm: misinformation is false but spread without intent to deceive, disinformation is deliberately fabricated to mislead, and malinformation is genuine information shared to cause harm. It also arrives in recognizable formats, such as imposter content that borrows a trusted source's identity and deepfakes that fabricate or manipulate audio and video.",
      "terms": [
        "misinformation",
        "disinformation",
        "malinformation",
        "imposter content",
        "deepfake"
      ],
      "seeds": [
        "misinformation",
        "disinformation"
      ],
      "termInfo": {
        "misinformation": {
          "text": "False information spread without knowing — or intending — that it's false.",
          "links": [
            {
              "href": "wiki:Misinformation"
            },
            {
              "href": "https://www.poynter.org/mediawise/is-this-legit-digital-media-literacy-101/misinformation-red-flags/"
            }
          ]
        },
        "disinformation": {
          "links": [
            {
              "href": "wiki:Disinformation"
            }
          ]
        },
        "malinformation": {
          "links": [
            {
              "href": "wiki:Malinformation"
            }
          ]
        },
        "imposter content": "Content that impersonates a genuine source — a lookalike account, a borrowed logo, a forged byline — to lend a false claim someone else's credibility.",
        "deepfake": {
          "text": "Synthetic or altered audio, video, or images that make it look as though someone said or did something they did not.",
          "links": [
            {
              "href": "wiki:Deepfake"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Misinformation"
          }
        ]
      }
    },
    {
      "id": "verification-practices",
      "name": "Verification practices",
      "color": "blue",
      "fact": "Verifying a claim means checking it against the original evidence: fact-checking tests a specific claim, a primary source is the original record itself, lateral reading means leaving a site to check other sources rather than digging deeper within it, and a reverse image search traces a picture back to where it first appeared.",
      "terms": [
        "fact-checking",
        "lateral reading",
        "primary source",
        "reverse image search"
      ],
      "seeds": [
        "fact-checking",
        "primary source"
      ],
      "termInfo": {
        "fact-checking": {
          "text": "Testing a specific factual claim against evidence — what professional fact-checkers do, and what any reader can do informally.",
          "links": [
            {
              "href": "wiki:Fact-checking"
            },
            {
              "href": "https://www.poynter.org/mediawise/is-this-legit-digital-media-literacy-101/fact-checking-101/"
            }
          ]
        },
        "lateral reading": {
          "text": "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
          "links": [
            {
              "href": "wiki:Media literacy"
            },
            {
              "href": "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/"
            }
          ]
        },
        "primary source": {
          "text": "The original record of something — a document, a photo, an eyewitness account — rather than someone else's account of it.",
          "links": [
            {
              "href": "wiki:Primary source"
            },
            {
              "href": "https://www.poynter.org/mediawise/misinformation-resilience-toolkit-libraries/what-makes-a-source-reputable/"
            }
          ]
        },
        "reverse image search": {
          "text": "Uploading a picture to a search engine to find where else it appeared and when — a quick way to catch a real photo reused with a false caption.",
          "links": [
            {
              "href": "wiki:Reverse image search"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Fact-checking"
          }
        ]
      }
    },
    {
      "id": "cognitive-social-dynamics",
      "name": "Cognitive & social dynamics",
      "color": "amber",
      "fact": "People don't just receive false information passively: confirmation bias makes us favor claims that fit what we already believe, echo chambers repeatedly reinforce those same beliefs, conspiracy theories offer an appealingly simple explanation that resists correction, mere repetition makes a claim feel truer (the illusory truth effect), and a debunked claim keeps shaping judgment even after the correction (the continued influence effect).",
      "terms": [
        "confirmation bias",
        "echo chamber",
        "conspiracy theory",
        "illusory truth effect",
        "continued influence effect"
      ],
      "seeds": [
        "confirmation bias",
        "echo chamber"
      ],
      "termInfo": {
        "confirmation bias": {
          "links": [
            {
              "href": "wiki:Confirmation bias"
            }
          ]
        },
        "echo chamber": {
          "text": "An information environment where you mostly encounter views that already match your own, reinforcing them rather than testing them.",
          "links": [
            {
              "href": "wiki:Echo chamber"
            },
            {
              "href": "https://www.poynter.org/tfcn/2023/echo-chambers-how-theyre-created-and-how-to-avoid-them/"
            }
          ]
        },
        "conspiracy theory": {
          "links": [
            {
              "href": "wiki:Conspiracy theory"
            }
          ]
        },
        "illusory truth effect": {
          "text": "The tendency to rate a statement as more likely true simply because it has been heard before, whether or not it is accurate.",
          "links": [
            {
              "href": "wiki:Illusory truth effect"
            }
          ]
        },
        "continued influence effect": {
          "text": "The tendency for a false claim to keep shaping beliefs and reasoning even after a credible correction has been accepted.",
          "links": [
            {
              "href": "wiki:Continued influence effect"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Misinformation"
          }
        ]
      }
    },
    {
      "id": "platforms-and-incentives",
      "name": "Platforms & incentives",
      "color": "magenta",
      "fact": "Information reaches readers through systems with their own incentives: the attention economy rewards whatever holds eyes, algorithmic amplification ranks content by engagement, gatekeeping was the traditional editorial gate before publication, and content moderation is the platforms' after-the-fact filtering that now partly stands in for it.",
      "terms": [
        "algorithmic amplification",
        "content moderation",
        "gatekeeping",
        "attention economy"
      ],
      "seeds": [
        "algorithmic amplification",
        "content moderation"
      ],
      "termInfo": {
        "algorithmic amplification": {
          "text": "Platform ranking systems that give some content far wider reach than it would earn on its own, usually by predicting what will draw engagement.",
          "links": [
            {
              "href": "wiki:Algorithmic amplification"
            }
          ]
        },
        "content moderation": {
          "text": "A platform's review of posts after they are published, removing, labeling, or demoting content under its own rules.",
          "links": [
            {
              "href": "wiki:Content moderation"
            }
          ]
        },
        "gatekeeping": {
          "text": "The traditional role of editors deciding what gets published — increasingly shared with, or replaced by, the algorithms that decide what gets shown.",
          "links": [
            {
              "href": "wiki:Gatekeeper"
            },
            {
              "href": "https://www.poynter.org/ethics-trust/2020/when-journalism-and-silicon-valley-collide/"
            }
          ]
        },
        "attention economy": {
          "text": "An economy in which human attention is the scarce resource, so platforms compete to capture and hold it.",
          "links": [
            {
              "href": "wiki:Attention economy"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Attention economy"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "virality",
      "term": "virality",
      "clusters": [
        0,
        3
      ],
      "fact": "Virality bridges the two: platforms rank content by engagement, and false information — especially the kind that triggers strong emotion — often spreads faster than accurate information.",
      "info": {
        "text": "How quickly something spreads through shares and reshares, regardless of whether it is true.",
        "links": [
          {
            "href": "wiki:Viral phenomenon"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "algorithmic amplification"
      ]
    },
    {
      "id": "filter-bubble",
      "term": "filter bubble",
      "clusters": [
        3,
        2
      ],
      "fact": "Filter bubbles bridge the two: personalization algorithms show people more of what they already engage with, feeding directly into echo chambers.",
      "info": {
        "text": "An information environment shaped by algorithmic personalization rather than by the reader's own choices — distinct from an echo chamber, which is self-selected.",
        "links": [
          {
            "href": "wiki:Filter bubble"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "algorithmic amplification",
        "echo chamber"
      ]
    },
    {
      "id": "prebunking",
      "term": "prebunking",
      "clusters": [
        2,
        1
      ],
      "fact": "Prebunking bridges the two: because corrections only partly undo a false claim once it has landed, inoculation research teaches people verification habits and manipulation techniques beforehand, so the claim meets resistance on arrival.",
      "info": {
        "text": "Inoculating people against misinformation by teaching a manipulation technique or a verification habit before they meet the real thing.",
        "links": [
          {
            "href": "wiki:Inoculation theory"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "continued influence effect",
        null
      ]
    }
  ],
  "lenses": [
    {
      "id": "authenticity-not-accuracy",
      "prompt": "Which concepts concern whether an image, video, or account is what it claims to be, rather than whether what it says is true?",
      "explanation": "An imposter account, a deepfake, and a reverse image search all turn on whether the thing in front of you is genuine, which is a separate question from whether its claims hold up, and the one fact-checking tests.",
      "targets": [
        "imposter content",
        "deepfake",
        "reverse image search"
      ],
      "reasons": {
        "imposter content": "The account or logo is forged, so the question is who is really speaking, not whether the claim is accurate.",
        "deepfake": "The footage itself is fabricated or altered, so the question is whether the event ever happened on camera.",
        "reverse image search": "It traces where a picture came from and when, which tests the picture's provenance rather than its caption's claims."
      }
    },
    {
      "id": "thinking-habits",
      "prompt": "Which concepts are built-in tendencies of ordinary reasoning, rather than an information environment or a belief system?",
      "explanation": "Confirmation bias, the illusory truth effect, and the continued influence effect operate in anyone's thinking regardless of what they read; an echo chamber is a setting people end up in, and a conspiracy theory is a body of belief.",
      "targets": [
        "confirmation bias",
        "illusory truth effect",
        "continued influence effect"
      ],
      "reasons": {
        "confirmation bias": "A habit of favoring claims that fit what you already believe, present before any particular source is chosen.",
        "illusory truth effect": "Repetition alone makes a claim feel truer, a quirk of how familiarity is processed.",
        "continued influence effect": "A false claim keeps shaping reasoning after the correction, a limit of how beliefs get revised."
      }
    },
    {
      "id": "platform-decisions",
      "prompt": "Which concepts are decisions made by publishers or platforms about what readers get to see, rather than behaviors of the readers themselves?",
      "explanation": "An editor's gate, a ranking system, and a moderation team each decide what reaches an audience; the attention economy describes the incentive behind those decisions rather than being one.",
      "targets": [
        "gatekeeping",
        "algorithmic amplification",
        "content moderation"
      ],
      "reasons": {
        "gatekeeping": "Editors decide before publication what is worth publishing.",
        "algorithmic amplification": "A ranking system decides which posts get far wider reach than they would earn on their own.",
        "content moderation": "A platform decides after publication what to remove, label, or demote."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "optional",
    "title": "Before You Begin: Misinformation & Media Literacy",
    "summary": "Why false information is several different problems, what makes it spread, what it has cost, and the habits that help a reader resist it.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "## Misinformation and media literacy\r\n\r\n\"Fake news\" makes false information sound like a single problem. It is several: a false claim passed along by someone who believes it, a lie crafted to mislead, and a true fact used to cause harm each call for a different response. Researchers classify them by intent and by harm, because what a person meant to do changes what a fair response looks like.\r\n\r\nWhether a claim spreads depends on more than whether it is true. Ordinary reasoning favors what fits existing beliefs and what has been heard before. Platforms decide what readers see with rankings built to hold attention. The editorial gate that once stood before publication is largely gone, and moderation after the fact is uneven and often arrives late.\r\n\r\nThe stakes are not abstract. A Brown University analysis found that nearly a third of all U.S. COVID-19 deaths, some 319,000, were among unvaccinated adults after vaccines opened to all. Vaccine scientist Peter Hotez estimates that about 200,000 Americans died in the Delta and early Omicron waves because they refused vaccines, and attributes that refusal to a politically driven anti-vaccine misinformation ecosystem.\r\n\r\nMedia literacy is the set of habits that works against those pressures: checking a claim against original evidence, leaving a page to see what others say about it, and recognizing a manipulation technique before meeting it.\r\n\r\n**Before you start:** the last time you shared something online, what, if anything, did you check first?"
    },
    "links": [
      {
        "href": "https://www.poynter.org/mediawise/is-this-legit-digital-media-literacy-101/misinformation-red-flags/",
        "label": "Poynter MediaWise: Misinformation red flags"
      },
      {
        "href": "https://www.npr.org/2022/05/16/1099070400/how-vaccine-misinformation-made-the-covid-19-death-toll-worse",
        "label": "NPR: How vaccine misinformation made the COVID-19 death toll worse"
      },
      {
        "href": "https://www.cidrap.umn.edu/anti-science/deadly-societal-force-qa-author-dr-peter-hotez-anti-science-movement",
        "label": "CIDRAP: Q&A with Peter Hotez on the anti-science movement"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Sonnet 5)"
      },
      {
        "name": "Claude Code (Claude Sonnet 5.5)",
        "reasoning": "high"
      }
    ]
  },
  "dateCreated": "2026-10-02",
  "dateModified": "2026-10-02"
});
