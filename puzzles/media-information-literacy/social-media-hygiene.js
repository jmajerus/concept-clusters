// Concept Clusters puzzle: Social media hygiene
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Supplemental destinations reviewed July 2026.

export default {
  "id": "social-media-hygiene",
  "title": "Social media hygiene",
  "category": "Media & Information Literacy",
  "clusters": [
    {
      "name": "Manipulative sharing cues",
      "color": "green",
      "fact": "Some posts pressure people to react or repost before reflecting, using emotional urgency, engagement bait, unattributed copying or shame about refusing to share.",
      "terms": [
        "emotional urgency",
        "engagement traps",
        "copy-and-paste posts",
        "share-shaming"
      ],
      "seeds": [
        "emotional urgency",
        "copy-and-paste posts"
      ],
      "termInfo": {
        "emotional urgency": {
          "text": "Language designed to trigger an immediate emotional reaction and make pausing for verification feel unnecessary or disloyal.",
          "link": "wiki:Appeal to emotion",
          "extraLink": "https://newslit.org/news-and-research/should-you-share-it/"
        },
        "engagement traps": {
          "text": "Posts constructed mainly to provoke clicks, likes, comments or shares, often so an account can increase reach or profit from attention.",
          "link": "wiki:Clickbait",
          "extraLink": "https://newslit.org/news-and-research/what-is-engagement-bait/"
        },
        "copy-and-paste posts": {
          "text": "Blocks of text repeatedly reposted without a stable link to an author, publication, date or original context.",
          "link": "wiki:Copypasta",
          "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
        },
        "share-shaming": {
          "text": "Pressuring readers to repost by implying that sharing proves they care, while declining to share suggests indifference or disloyalty.",
          "link": "wiki:Guilt trip",
          "extraLink": "https://blog.majerus.us/media-hygiene-a-quick-guide/"
        }
      },
      "info": {
        "link": "wiki:Media literacy",
        "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
      }
    },
    {
      "name": "Check the claim",
      "color": "blue",
      "fact": "Verification means tracing a claim to its origin and checking whether its quoted experts, images and words are authentic and represented accurately.",
      "terms": [
        "original source",
        "authority claims",
        "reverse image search",
        "quote search"
      ],
      "seeds": [
        "original source",
        "reverse image search"
      ],
      "termInfo": {
        "original source": {
          "text": "The earliest available document, post, recording, image or firsthand account from which a circulating claim was derived.",
          "link": "wiki:Primary source",
          "extraLink": "https://newslit.org/news-and-research/the-sift-dangerous-memes-ai-pikachu/"
        },
        "authority claims": {
          "text": "Assertions that a person or organization should be believed because of a title, credential or reputation; the identity, relevant expertise and supporting evidence still need checking.",
          "link": "wiki:Argument from authority",
          "extraLink": "https://guides.library.cornell.edu/english1183ac23/evaluate"
        },
        "reverse image search": {
          "text": "Searching with an image rather than keywords to locate earlier uses, related versions and the image’s original context.",
          "link": "wiki:Reverse image search",
          "extraLink": "https://newslit.org/news-and-research/reverse-image-search/"
        },
        "quote search": {
          "text": "Searching distinctive quoted words to locate earlier appearances, fuller context, or evidence that the quotation was altered or misattributed.",
          "link": "wiki:Quotation mark",
          "extraLink": "https://newslit.org/news-and-research/eight-tips-to-google-like-a-pro/"
        }
      },
      "info": {
        "link": "wiki:Fact-checking",
        "extraLink": "https://newslit.org/news-and-research/fact-check-it/"
      }
    },
    {
      "name": "Judge trust wisely",
      "color": "amber",
      "fact": "Trusting the person who shared something is not the same as trusting the information itself; evidence, relevant expertise, transparency and accountability matter more than familiarity or polished presentation.",
      "terms": [
        "relational trust",
        "informational trust",
        "institutional sources",
        "story polish"
      ],
      "seeds": [
        "relational trust",
        "informational trust"
      ],
      "termInfo": {
        "relational trust": {
          "text": "Confidence that grows from familiarity, affection, shared identity or a history with the person who shared the information.",
          "link": "wiki:Trust (social science)",
          "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
        },
        "informational trust": {
          "text": "Confidence in a claim that is earned through evidence, relevant expertise, transparent sourcing and willingness to correct errors.",
          "link": "wiki:Information quality",
          "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
        },
        "institutional sources": {
          "text": "Trusted institutional sources: organizations that produce information through established standards, specialized expertise and accountable processes; they are not infallible, but their methods can be examined.",
          "link": "wiki:Institution",
          "extraLink": "https://guides.library.cornell.edu/english1183ac23/evaluate"
        },
        "story polish": {
          "text": "Professional design, fluent narration or emotional storytelling that can make a claim feel credible without supplying reliable evidence.",
          "link": "wiki:Transportation theory (psychology)",
          "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
        }
      },
      "info": {
        "link": "wiki:Trust (social science)",
        "extraLink": "https://blog.majerus.us/p/media-hygiene-a-quick-guide"
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
      "fact": "Provenance bridges sharing cues and verification: copy-and-paste posts often erase where a claim originated, while tracing the original source restores the context needed to evaluate it.",
      "idealTerms": [
        "copy-and-paste posts",
        "original source"
      ],
      "info": {
        "text": "The documented origin and transmission history of an item or claim—where it came from, who handled it and how it reached its current form.",
        "link": "wiki:Provenance",
        "extraLink": "https://newslit.org/news-and-research/eight-tips-to-google-like-a-pro/"
      }
    },
    {
      "term": "source credibility",
      "clusters": [
        1,
        2
      ],
      "fact": "Source credibility bridges verification and trust: relevant expertise, evidence, transparency and accountability justify informational trust, while confidence or familiarity alone do not.",
      "idealTerms": [
        "authority claims",
        "informational trust"
      ],
      "info": {
        "text": "The degree to which a source merits belief based on qualities such as expertise, trustworthiness, evidence, transparency and accountability.",
        "link": "wiki:Source credibility",
        "extraLink": "https://guides.library.cornell.edu/english1183ac23/evaluate"
      }
    }
  ]
};
