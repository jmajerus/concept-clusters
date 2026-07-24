// Concept Clusters puzzle: Images out of context
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Includes relatedPuzzles navigation metadata and a shared provenance conceptId.

export default {
  "id": "images-out-of-context",
  "title": "Images out of context",
  "category": "Media & Information Literacy",
  "relatedPuzzles": [
    {
      "id": "social-media-hygiene",
      "via": [
        "provenance",
        "reverse image search"
      ],
      "reason": "Apply source-tracing habits specifically to visual media."
    },
    {
      "id": "quotations-and-attribution",
      "via": [
        "provenance",
        "context"
      ],
      "reason": "Continue from visual context to the transmission and attribution of words."
    }
  ],
  "clusters": [
    {
      "name": "Image origins",
      "color": "green",
      "fact": "An image's origin includes who created or first posted it, when it first appeared, and the caption or description attached to that original use.",
      "terms": [
        "original upload",
        "creator",
        "first appearance",
        "original caption"
      ],
      "seeds": [
        "original upload",
        "original caption"
      ],
      "termInfo": {
        "original upload": {
          "text": "The earliest known online posting of an image, before later reposts, screenshots or altered copies obscured where it came from.",
          "link": "wiki:Image sharing",
          "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
        },
        "creator": {
          "text": "The person or organization responsible for making or capturing the image.",
          "link": "wiki:Author",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        },
        "first appearance": {
          "text": "The earliest documented date and place where an image, or a closely matching version, appeared publicly.",
          "link": "wiki:Publication",
          "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
        },
        "original caption": {
          "text": "The descriptive text that accompanied the image in its earliest verified publication.",
          "link": "wiki:Photo caption",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        }
      },
      "info": {
        "link": "wiki:Image sharing",
        "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
      }
    },
    {
      "name": "Context manipulation",
      "color": "blue",
      "fact": "A genuine image can mislead when it is recycled from another event, paired with a false caption, selectively cropped or digitally altered.",
      "terms": [
        "recycled image",
        "false caption",
        "selective crop",
        "digital alteration"
      ],
      "seeds": [
        "false caption",
        "digital alteration"
      ],
      "termInfo": {
        "recycled image": {
          "text": "An older or unrelated image reused as though it depicts a newer event, place or claim.",
          "link": "wiki:Recontextualisation",
          "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
        },
        "false caption": {
          "text": "Text that assigns a genuine image the wrong identity, location, date or event.",
          "link": "wiki:Misinformation",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        },
        "selective crop": {
          "text": "Removing parts of an image in a way that conceals relevant people, objects or surroundings and changes the viewer's interpretation.",
          "link": "wiki:Cropping (image)",
          "extraLink": "https://www.bellingcat.com/resources/how-tos/2017/06/30/advanced-guide-verifying-video-content/"
        },
        "digital alteration": {
          "text": "Changing pixels or combining visual elements so the resulting image depicts something different from the original.",
          "link": "wiki:Photo manipulation",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        }
      },
      "info": {
        "link": "wiki:Photo manipulation",
        "extraLink": "https://www.reuters.com/fact-check/about/"
      }
    },
    {
      "name": "Verification methods",
      "color": "amber",
      "fact": "Visual verification combines reverse search, source comparison, geographic clues and metadata rather than relying on appearance alone.",
      "terms": [
        "reverse image search",
        "source comparison",
        "geolocation clues",
        "file metadata"
      ],
      "seeds": [
        "reverse image search",
        "source comparison"
      ],
      "termInfo": {
        "reverse image search": {
          "text": "Searching with an image to find similar copies, earlier uses and pages that may reveal its original context.",
          "link": "wiki:Reverse image search",
          "extraLink": "https://support.google.com/websearch/answer/1325808?co=GENIE.Platform%3DDesktop&hl=en"
        },
        "source comparison": {
          "text": "Comparing how multiple independent sources present the same image, including their captions, dates and supporting evidence.",
          "link": "wiki:Source criticism",
          "extraLink": "https://www.reuters.com/fact-check/about/"
        },
        "geolocation clues": {
          "text": "Visible landmarks, signs, roads, terrain, weather and other features used to test where an image was made.",
          "link": "wiki:Geolocation",
          "extraLink": "https://www.bellingcat.com/resources/how-tos/2015/07/25/searching-the-earth-essential-geolocation-tools-for-verification/"
        },
        "file metadata": {
          "text": "Data stored with a digital file, such as timestamps, device details or editing information, which may provide clues but can also be removed or changed.",
          "link": "wiki:Metadata",
          "extraLink": "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html"
        }
      },
      "info": {
        "link": "wiki:Fact-checking",
        "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
      }
    }
  ],
  "bridges": [
    {
      "term": "provenance",
      "conceptId": "provenance",
      "clusters": [
        0,
        2
      ],
      "fact": "Provenance bridges image origins and verification: tracing an image's creator, first appearance and original use helps distinguish the source from later reposts or altered versions.",
      "idealTerms": [
        "original upload",
        "reverse image search"
      ],
      "info": {
        "text": "The documented origin and transmission history of an image, including who created it, where it first appeared and how it changed or circulated.",
        "link": "wiki:Provenance",
        "extraLink": "https://support.google.com/websearch/answer/14177408?hl=en"
      }
    },
    {
      "term": "corroboration",
      "clusters": [
        1,
        2
      ],
      "fact": "Corroboration bridges manipulation and verification: comparing an image with independent reporting, records or views of the same event can expose a false caption, crop or alteration.",
      "idealTerms": [
        "false caption",
        "source comparison"
      ],
      "info": {
        "text": "Independent evidence that supports, qualifies or contradicts what an image is claimed to show.",
        "link": "wiki:Corroborating evidence",
        "extraLink": "https://www.reuters.com/fact-check/about/"
      }
    }
  ]
};
