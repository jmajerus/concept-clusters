// Concept Clusters puzzle: Choice Under Influence
// Dark Patterns sequence drafted July 2026 from deceptive.design.

export default {
  id: "choice-under-influence",
  title: "Choice Under Influence",
  category: "Computer Science",
  subcategories: { "Computer Science": "computing-and-society" },
  large: true,
  info: {
    text:
      "How interface presentation, defaults, wording, and emotional framing can steer people away from choices that reflect their own goals. The source uses deceptive patterns for practices also widely known as dark patterns.",
    link: "https://deceptive.design/book/contents/part-1/",
    extraLink: "https://deceptive.design/types/"
  },
  lenses: [
    {
      id: "preselection",
      prompt: "Which concepts form the dominant signature of the Preselection dark pattern?",
      targets: [
        "preselected default",
        "default effect",
        "limited attention",
        "impaired autonomy"
      ],
      explanation:
        "Preselection chooses an option before the user acts and relies on the default effect, together with the chance that the choice will not be noticed or reconsidered. The result may be a formally reversible selection that was never meaningfully chosen.",
      reasons: {
        "preselected default": "The business has already selected the option it wants the user to retain.",
        "default effect": "People tend to accept an existing selection rather than actively replace it.",
        "limited attention": "A preselected option only works unnoticed when people do not inspect every control and consequence.",
        "impaired autonomy": "The resulting action may reflect the business's initial choice more than the user's own intention."
      }
    },
    {
      id: "trick-wording",
      prompt: "Which concepts form the dominant signature of the Trick Wording dark pattern?",
      targets: [
        "ambiguous wording",
        "scan reading",
        "expectation matching",
        "unwanted consent",
        "impaired autonomy"
      ],
      explanation:
        "Trick Wording makes language appear to mean what a hurried reader expects while its actual effect points elsewhere. Ambiguity, scan-reading, and familiar verbal expectations can therefore produce agreement the person did not understand or intend.",
      reasons: {
        "ambiguous wording": "The action is described through language that is confusing, reversible, or easy to misread.",
        "scan reading": "The pattern takes advantage of the ordinary habit of reading online text selectively rather than word by word.",
        "expectation matching": "The wording is shaped to resemble the instruction or option the user expects to encounter.",
        "unwanted consent": "The misleading language can cause the person to accept communication, data use, or another condition they meant to refuse.",
        "impaired autonomy": "The visible selection does not reliably express an informed understanding of the choice."
      }
    },
    {
      id: "visual-interference",
      prompt: "Which concepts form the dominant signature of the Visual Interference dark pattern?",
      targets: [
        "visual prominence",
        "low contrast",
        "obscured alternative",
        "limited attention",
        "perceptual steering",
        "impaired autonomy"
      ],
      explanation:
        "Visual Interference uses prominence, contrast, placement, or clutter to make the business's preferred action easy to perceive and an alternative difficult to find or interpret. The choice may remain technically present while becoming practically unequal.",
      reasons: {
        "visual prominence": "Size, color, position, or emphasis can make one action dominate the page.",
        "low contrast": "Important information or a refusal option can be made difficult to notice or read.",
        "obscured alternative": "A meaningful option is hidden, disguised, or placed where users are unlikely to expect it.",
        "limited attention": "The pattern depends on people allocating attention selectively in a visually complex environment.",
        "perceptual steering": "Visual design actively directs notice and interpretation toward the business's preferred choice.",
        "impaired autonomy": "A nominally available alternative may no longer support a genuinely informed decision."
      }
    },
    {
      id: "confirmshaming",
      prompt: "Which concepts form the dominant signature of the Confirmshaming dark pattern?",
      targets: [
        "loaded refusal",
        "self-image pressure",
        "manufactured consent",
        "impaired autonomy"
      ],
      explanation:
        "Confirmshaming turns an ordinary refusal into a negative statement about the user's values, intelligence, generosity, or self-image. The person is pushed toward compliance not by new reasons, but by the emotional cost attached to saying no.",
      reasons: {
        "loaded refusal": "The decline option is worded as a belittling, guilt-inducing, or socially undesirable statement.",
        "self-image pressure": "The interface threatens how the person wishes to see themselves or be seen by others.",
        "manufactured consent": "Agreement is made easier by artificially increasing the emotional cost of refusal.",
        "impaired autonomy": "The decision is steered by shame or guilt rather than the person's considered purposes."
      }
    },
    {
      id: "disguised-ads",
      prompt: "Which concepts form the dominant signature of the Disguised Ads dark pattern?",
      targets: [
        "familiar interface cues",
        "expectation matching",
        "perceptual steering",
        "mistaken click"
      ],
      explanation:
        "Disguised Ads borrow the appearance of native content or interface controls so that users act on the wrong interpretation. Familiar cues and visual steering convert an expected navigation or download action into an advertising click with possible commercial consequences.",
      reasons: {
        "familiar interface cues": "The advertisement imitates a download button, navigation control, related item, or other trusted interface element.",
        "expectation matching": "Its appearance is designed to fit what the person expects the genuine control or content to look like.",
        "perceptual steering": "Presentation directs attention toward the disguised commercial element.",
        "mistaken click": "The user activates the advertisement while believing they selected something else."
      }
    }
  ],
  clusters: [
    {
      name: "Perceptual presentation",
      color: "teal",
      fact:
        "Visual hierarchy, contrast, familiar interface cues, and ordinary scan-reading habits shape which options are noticed and what a control appears to mean.",
      terms: [
        "visual prominence",
        "low contrast",
        "familiar interface cues",
        "scan reading"
      ],
      seeds: ["visual prominence", "low contrast"],
      termInfo: {
        "visual prominence": {
          text: "The use of size, color, position, spacing, or emphasis to make one element command attention before others.",
          link: "https://deceptive.design/types/visual-interference/"
        },
        "low contrast": {
          text: "A small visual difference between text or controls and their background, making important information harder to notice or read.",
          link: "https://deceptive.design/types/visual-interference/"
        },
        "familiar interface cues": {
          text: "Visual forms that users already interpret as controls or native content, such as download buttons, navigation links, or related articles.",
          link: "https://deceptive.design/types/disguised-ads/"
        },
        "scan reading": {
          text: "The ordinary online reading strategy of sampling headings, labels, and prominent words rather than closely reading every sentence.",
          link: "https://deceptive.design/types/trick-wording/"
        }
      },
      info: {
        link: "https://deceptive.design/types/visual-interference/"
      }
    },
    {
      name: "Choice framing",
      color: "blue",
      fact:
        "A business can steer a formally available choice by selecting the default, obscuring an alternative, using ambiguous language, or attaching an emotional judgment to refusal.",
      terms: [
        "preselected default",
        "obscured alternative",
        "ambiguous wording",
        "loaded refusal"
      ],
      seeds: ["preselected default", "ambiguous wording"],
      termInfo: {
        "preselected default": {
          text: "An option chosen in advance by the business so that accepting it requires no additional action from the user.",
          link: "https://deceptive.design/types/preselection/"
        },
        "obscured alternative": {
          text: "A meaningful option that remains technically present but is hidden, deemphasized, disguised, or placed where it is difficult to find.",
          link: "https://deceptive.design/types/visual-interference/"
        },
        "ambiguous wording": {
          text: "Language whose apparent or expected meaning differs from the action it actually authorizes.",
          link: "https://deceptive.design/types/trick-wording/"
        },
        "loaded refusal": {
          text: "A decline option written to express guilt, foolishness, selfishness, or another negative judgment about the person choosing it.",
          link: "https://deceptive.design/types/confirmshaming/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-16/"
      }
    },
    {
      name: "Human heuristics",
      color: "amber",
      fact:
        "People reasonably rely on defaults, selective attention, familiar conventions, and self-image to navigate complex interfaces; manipulation converts those coping strategies into leverage.",
      terms: [
        "default effect",
        "limited attention",
        "expectation matching",
        "self-image pressure"
      ],
      seeds: ["default effect", "limited attention"],
      termInfo: {
        "default effect": {
          text: "The tendency to retain an option that has already been selected rather than expend effort replacing it.",
          link: "https://deceptive.design/types/preselection/"
        },
        "limited attention": {
          text: "The practical inability to inspect every word, control, consequence, and competing signal in a complex interface.",
          link: "https://deceptive.design/book/contents/part-1/"
        },
        "expectation matching": {
          text: "The habit of interpreting a familiar-looking label or control according to its usual meaning and role.",
          link: "https://deceptive.design/types/trick-wording/"
        },
        "self-image pressure": {
          text: "Influence that works by threatening how a person wishes to understand or present their own character and values.",
          link: "https://deceptive.design/types/confirmshaming/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-13/"
      }
    },
    {
      name: "Choice consequences",
      color: "magenta",
      fact:
        "When interface steering produces an action that conflicts with the person's purposes, a visible click may conceal mistaken action, unwanted consent, unintended spending, or impaired autonomy.",
      terms: [
        "mistaken click",
        "unwanted consent",
        "unintended purchase",
        "impaired autonomy"
      ],
      seeds: ["unwanted consent", "impaired autonomy"],
      termInfo: {
        "mistaken click": {
          text: "Activating an element under a false understanding of what it is or what it will do.",
          link: "https://deceptive.design/types/disguised-ads/"
        },
        "unwanted consent": {
          text: "An apparent agreement to communication, data use, or another condition that the person meant to decline or did not understand.",
          link: "https://deceptive.design/book/contents/part-1/"
        },
        "unintended purchase": {
          text: "A commercial transaction or added charge that does not reflect what the person set out to buy.",
          link: "https://deceptive.design/types/preselection/"
        },
        "impaired autonomy": {
          text: "Reduced ability to understand available choices and act according to one's own goals rather than an external steering objective.",
          link: "https://deceptive.design/book/contents/part-1/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/part-1/"
      }
    }
  ],
  bridges: [
    {
      term: "perceptual steering",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact:
        "Hierarchy, contrast, placement, and familiar visual cues can make the business's preferred option feel obvious while another option becomes easy to miss or misinterpret.",
      idealTerms: ["visual prominence", "obscured alternative"],
      info: {
        text: "The deliberate direction of attention and interpretation through visual presentation.",
        link: "https://deceptive.design/types/visual-interference/"
      }
    },
    {
      term: "exploited heuristics",
      clusters: [2, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 1
      },
      fact:
        "Defaults, selective attention, expectations, and self-image are ordinary ways of coping with complexity; choice framing becomes manipulative when it deliberately turns them against the person's own goals.",
      info: {
        text: "Normal mental shortcuts and coping strategies treated as opportunities for behavioral control.",
        link: "https://deceptive.design/book/contents/chapter-13/"
      }
    },
    {
      term: "manufactured consent",
      clusters: [1, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 1,
        to: 3
      },
      fact:
        "A technically available choice is not meaningfully autonomous when presentation or wording materially steers a person into agreement they did not understand or intend.",
      info: {
        text: "Apparent agreement produced by steering the conditions of choice rather than supporting informed, voluntary decision-making.",
        link: "https://deceptive.design/book/contents/part-1/"
      }
    }
  ]
};
