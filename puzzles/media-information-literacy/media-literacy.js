// Concept Clusters puzzle: Misinformation & media literacy
// Category: Media & Information Literacy
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "media-literacy",
  "title": "Misinformation & media literacy",
  "category": "Media & Information Literacy",
  "clusters": [
    {
      "name": "Types of false information",
      "info": {
        "link": "wiki:Misinformation"
      },
      "color": "green",
      "fact": "False information falls into three types by intent and harm: misinformation is false but spread without intent to deceive, disinformation is deliberately fabricated to mislead, and malinformation is genuine information shared to cause harm.",
      "terms": [
        "misinformation",
        "disinformation",
        "malinformation"
      ],
      "seeds": [
        "misinformation",
        "disinformation"
      ],
      "termInfo": {
        "misinformation": {
          "text": "False information spread without knowing — or intending — that it's false.",
          "link": "wiki:Misinformation",
          "extraLink": "https://www.poynter.org/mediawise/is-this-legit-digital-media-literacy-101/misinformation-red-flags/"
        },
        "disinformation": {
          "link": "wiki:Disinformation"
        },
        "malinformation": {
          "link": "wiki:Malinformation"
        }
      }
    },
    {
      "name": "Verification practices",
      "info": {
        "link": "wiki:Fact-checking"
      },
      "color": "blue",
      "fact": "Verifying a claim means checking it against the original evidence: fact-checking tests a specific claim, a primary source is the original record itself, and lateral reading means leaving a site to check other sources rather than digging deeper within it.",
      "terms": [
        "fact-checking",
        "lateral reading",
        "primary source"
      ],
      "seeds": [
        "fact-checking",
        "primary source"
      ],
      "termInfo": {
        "fact-checking": {
          "text": "Testing a specific factual claim against evidence — what professional fact-checkers do, and what any reader can do informally.",
          "link": "wiki:Fact-checking",
          "extraLink": "https://www.poynter.org/mediawise/is-this-legit-digital-media-literacy-101/fact-checking-101/"
        },
        "lateral reading": {
          "text": "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
          "link": "wiki:Media literacy",
          "extraLink": "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/"
        },
        "primary source": {
          "text": "The original record of something — a document, a photo, an eyewitness account — rather than someone else's account of it.",
          "link": "wiki:Primary source",
          "extraLink": "https://www.poynter.org/mediawise/misinformation-resilience-toolkit-libraries/what-makes-a-source-reputable/"
        }
      }
    },
    {
      "name": "Cognitive & social dynamics",
      "info": {
        "link": "wiki:Misinformation"
      },
      "color": "amber",
      "fact": "People don't just receive false information passively: confirmation bias makes us favor claims that fit what we already believe, echo chambers repeatedly reinforce those same beliefs, and conspiracy theories offer an appealingly simple explanation that resists correction.",
      "terms": [
        "confirmation bias",
        "echo chamber",
        "conspiracy theory"
      ],
      "seeds": [
        "confirmation bias",
        "echo chamber"
      ],
      "termInfo": {
        "confirmation bias": {
          "link": "wiki:Confirmation bias"
        },
        "echo chamber": {
          "text": "An information environment where you mostly encounter views that already match your own, reinforcing them rather than testing them.",
          "link": "wiki:Echo chamber",
          "extraLink": "https://www.poynter.org/tfcn/2023/echo-chambers-how-theyre-created-and-how-to-avoid-them/"
        },
        "conspiracy theory": {
          "link": "wiki:Conspiracy theory"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "algorithmic amplification",
      "clusters": [
        0,
        2
      ],
      "fact": "Algorithmic amplification bridges the two: platforms rank content by engagement, and false information — especially the kind that triggers strong emotion — often spreads faster than accurate information, feeding directly into echo chambers.",
      "idealTerms": [
        null,
        "echo chamber"
      ],
      "info": {
        "link": "wiki:Algorithmic amplification"
      }
    },
    {
      "term": "gatekeeping",
      "clusters": [
        1,
        2
      ],
      "fact": "Gatekeeping bridges the two: traditional editorial fact-checking acted as a gate before publication, and social media's removal of that gate is part of why echo chambers and conspiracy theories now spread largely unchecked.",
      "idealTerms": [
        "fact-checking",
        null
      ],
      "info": {
        "text": "The traditional role of editors deciding what gets published — increasingly shared with, or replaced by, the algorithms that decide what gets shown.",
        "link": "wiki:Gatekeeper",
        "extraLink": "https://www.poynter.org/ethics-trust/2020/when-journalism-and-silicon-valley-collide/"
      }
    }
  ]
};
