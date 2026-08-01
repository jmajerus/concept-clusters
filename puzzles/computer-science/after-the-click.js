// Concept Clusters puzzle: After the Click
// Dark Patterns sequence drafted July 2026 from HCI, consumer psychology,
// and research on the psychosocial aftermath of deception.

export default {
  id: "after-the-click",
  title: "After the Click",
  category: "Computer Science",
  large: true,
  info: {
    text:
      "How recognizing that a digital choice was engineered can transform an unwanted outcome into regret, self-blame, perceived betrayal, and lasting defensive behavior. Research on fraud victimization is used cautiously to illuminate deception-related aftermath, not to equate every dark pattern with fraud.",
    link: "https://doi.org/10.1145/3479516",
    extraLink: "https://doi.org/10.3389/fpsyg.2026.1805536"
  },
  lenses: [
    {
      id: "post-deception-regret",
      prompt: "Which concepts distinguish post-deception regret from ordinary buyer's remorse?",
      targets: [
        "manipulation recognized",
        "intention mismatch",
        "retrospective reappraisal",
        "decision regret",
        "rumination"
      ],
      explanation:
        "Ordinary buyer's remorse can follow an honest purchase. Post-deception regret begins when the person reinterprets the decision after recognizing that the interface helped produce an action inconsistent with their intention. The mind may repeatedly revisit the moment in search of what was missed and what should have happened instead.",
      reasons: {
        "manipulation recognized": "The later emotion is tied to discovering that the choice environment was deliberately engineered rather than merely disappointing.",
        "intention mismatch": "The recorded click or purchase does not accurately express what the person understood or wanted.",
        "retrospective reappraisal": "New information changes the meaning assigned to the earlier decision.",
        "decision regret": "The person compares the actual outcome with the choice they believe they would have made under fairer conditions.",
        rumination: "The interaction may be mentally replayed in an effort to locate the missed cue or prevent repetition."
      }
    },
    {
      id: "blaming-the-target",
      prompt: "Which concepts show responsibility being internalized by the person who was manipulated?",
      targets: [
        "manipulation recognized",
        "self-blame",
        "shame or humiliation",
        "loss of self-trust",
        "defensive vigilance"
      ],
      explanation:
        "Deceptive design can shift responsibility psychologically from the institution that engineered the choice to the person whose ordinary attention, trust, or decision limits were exploited. The person may interpret successful manipulation as evidence of personal foolishness and become less confident in future decisions.",
      reasons: {
        "manipulation recognized": "The person understands that the outcome was produced through influence rather than a simple accidental error.",
        "self-blame": "Responsibility is directed inward through thoughts such as 'I should have noticed.'",
        "shame or humiliation": "A specific mistake becomes a negative judgment about the self as foolish, careless, or easily exploited.",
        "loss of self-trust": "Confidence in one's own judgment declines after the experience.",
        "defensive vigilance": "Future interactions demand extra checking because ordinary confidence no longer feels sufficient."
      }
    },
    {
      id: "perceived-betrayal",
      prompt: "Which concepts form the dominant signature of perceived betrayal after deceptive design?",
      targets: [
        "concealed condition discovered",
        "violated trust",
        "anger",
        "perceived betrayal",
        "credibility loss"
      ],
      explanation:
        "Betrayal differs from simple dissatisfaction because the business is understood to have used a relationship of expected honesty against the person. Discovering a concealed condition can therefore produce anger and a broader judgment that the business's claims and interface signals are no longer credible.",
      reasons: {
        "concealed condition discovered": "The person learns that material information was withheld, obscured, or delayed.",
        "violated trust": "The discovery reveals that ordinary reliance on the business's presentation was used as leverage.",
        anger: "The emotional response is directed toward an actor perceived to have imposed the harm intentionally or unfairly.",
        "perceived betrayal": "The business is judged to have violated an expectation of honest dealing.",
        "credibility loss": "Future claims from the business are treated as less believable because prior signals proved unreliable."
      }
    },
    {
      id: "trust-tax",
      prompt: "Which concepts show how one deceptive encounter can burden later digital participation?",
      targets: [
        "credibility loss",
        "trust tax",
        "defensive vigilance",
        "avoidance",
        "trust erosion",
        "reduced participation"
      ],
      explanation:
        "Once deception becomes plausible, future interactions require additional verification, suspicion, and contingency planning. The person may avoid businesses, abandon useful services, or participate less fully. These costs persist even when later interfaces are honest.",
      reasons: {
        "credibility loss": "The original business can no longer rely on ordinary confidence in its representations.",
        "trust tax": "Additional effort must be spent verifying signals that once could be accepted provisionally.",
        "defensive vigilance": "The person approaches later interfaces expecting possible manipulation.",
        avoidance: "Avoiding a business or category becomes a way to reduce exposure to another deceptive encounter.",
        "trust erosion": "Confidence declines not only in one message but in the relationship that made reliance possible.",
        "reduced participation": "The person may withdraw from useful transactions or services because the perceived cost of engagement has risen."
      }
    }
  ],
  clusters: [
    {
      name: "Recognition and reappraisal",
      color: "teal",
      fact:
        "The psychological aftermath begins when a result, condition, or fabricated signal reveals that the person's recorded action did not faithfully express the choice they believed they were making.",
      terms: [
        "unexpected outcome",
        "concealed condition discovered",
        "fabricated signal exposed",
        "manipulation recognized",
        "intention mismatch"
      ],
      seeds: ["unexpected outcome", "manipulation recognized"],
      termInfo: {
        "unexpected outcome": {
          text: "A charge, enrollment, disclosure, purchase, or other result that differs materially from what the person expected the action to produce.",
          link: "https://doi.org/10.1145/3479516"
        },
        "concealed condition discovered": {
          text: "Later awareness of a fee, recurring term, data practice, or restriction that was not adequately visible when the choice was made.",
          link: "https://doi.org/10.1145/3479516"
        },
        "fabricated signal exposed": {
          text: "Discovery that a countdown, scarcity claim, testimonial, activity notice, or other persuasive cue was false or materially misleading.",
          link: "https://doi.org/10.1145/3461778.3462086"
        },
        "manipulation recognized": {
          text: "Understanding that the interface was designed to steer behavior in a way that served the business and conflicted with the person's own purposes.",
          link: "https://doi.org/10.1145/3461778.3462086"
        },
        "intention mismatch": {
          text: "A gap between the action registered by the system and the outcome the person knowingly meant to authorize.",
          link: "https://doi.org/10.1145/3479516"
        }
      },
      info: {
        link: "https://doi.org/10.1145/3461778.3462086"
      }
    },
    {
      name: "Self-directed aftermath",
      color: "blue",
      fact:
        "Recognition may be turned inward as regret, repeated mental replay, self-blame, humiliation, or reduced confidence in one's own ability to make safe decisions.",
      terms: [
        "decision regret",
        "self-blame",
        "shame or humiliation",
        "rumination",
        "loss of self-trust"
      ],
      seeds: ["decision regret", "self-blame"],
      termInfo: {
        "decision regret": {
          text: "A painful comparison between the actual outcome and the choice the person believes they would have made with clearer or fairer information.",
          link: "https://doi.org/10.1086/339925"
        },
        "self-blame": {
          text: "Attributing the harmful outcome to one's own failure to notice, understand, resist, or verify the deceptive presentation.",
          link: "https://doi.org/10.1177/0146167210393532"
        },
        "shame or humiliation": {
          text: "A negative judgment about the self, such as feeling foolish, gullible, careless, or exposed, rather than only regretting a particular action.",
          link: "https://doi.org/10.3389/fpsyg.2026.1805536"
        },
        rumination: {
          text: "Repeatedly replaying the interaction, missed cue, or alternative decision after the immediate event has ended.",
          link: "https://doi.org/10.3389/fpsyg.2026.1805536"
        },
        "loss of self-trust": {
          text: "Reduced confidence in one's own judgment and ability to recognize or resist manipulation in future decisions.",
          link: "https://doi.org/10.1177/0146167210393532"
        }
      },
      info: {
        link: "https://doi.org/10.3389/fpsyg.2026.1805536"
      }
    },
    {
      name: "Response toward the business",
      color: "amber",
      fact:
        "The same recognition may be directed outward as anger, perceived betrayal, lost credibility, complaint, departure, or an effort to warn other people.",
      terms: [
        "anger",
        "perceived betrayal",
        "credibility loss",
        "complaint or exit",
        "warning others"
      ],
      seeds: ["perceived betrayal", "credibility loss"],
      termInfo: {
        anger: {
          text: "An emotional response to being treated unfairly or intentionally steered into an unwanted outcome.",
          link: "https://doi.org/10.3389/fpsyg.2026.1805536"
        },
        "perceived betrayal": {
          text: "The judgment that a business exploited an expectation of honesty, fair dealing, or care for the user's interests.",
          link: "https://doi.org/10.3389/fpsyg.2026.1805536"
        },
        "credibility loss": {
          text: "Reduced willingness to accept the business's future prices, claims, recommendations, or interface signals as trustworthy.",
          link: "https://doi.org/10.1007/978-3-030-77750-0_10"
        },
        "complaint or exit": {
          text: "Seeking redress, cancelling, switching businesses, or ending the relationship after the manipulation is recognized.",
          link: "https://doi.org/10.1145/3479516"
        },
        "warning others": {
          text: "Sharing the experience so that other people can recognize the tactic, avoid the business, or protect themselves.",
          link: "https://doi.org/10.1145/3479516"
        }
      },
      info: {
        link: "https://doi.org/10.1007/978-3-030-77750-0_10"
      }
    },
    {
      name: "Lasting adaptation",
      color: "magenta",
      fact:
        "A deceptive encounter can change future behavior: people inspect more, assume greater risk, avoid businesses, generalize suspicion, or participate less in services they might otherwise use.",
      terms: [
        "defensive vigilance",
        "avoidance",
        "generalized suspicion",
        "trust erosion",
        "reduced participation"
      ],
      seeds: ["defensive vigilance", "trust erosion"],
      termInfo: {
        "defensive vigilance": {
          text: "Increased checking, verification, and monitoring motivated by the expectation that an interface may conceal or distort something important.",
          link: "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
        },
        avoidance: {
          text: "Reducing contact with a business, platform, transaction type, or digital service to prevent another manipulative encounter.",
          link: "https://doi.org/10.1177/0146167210393532"
        },
        "generalized suspicion": {
          text: "Extending distrust from the original business or tactic to other interface signals and organizations that may be honest.",
          link: "https://doi.org/10.1177/0146167210393532"
        },
        "trust erosion": {
          text: "A gradual weakening of confidence that businesses and interfaces will present choices honestly and respect the person's intentions.",
          link: "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
        },
        "reduced participation": {
          text: "Withdrawing from useful transactions, services, or forms of digital engagement because vigilance and perceived risk have become too costly.",
          link: "https://doi.org/10.3389/fpsyg.2026.1805536"
        }
      },
      info: {
        link: "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
      }
    }
  ],
  bridges: [
    {
      term: "retrospective reappraisal",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact:
        "Once manipulation or intention mismatch is recognized, the person reinterprets the earlier choice in light of information that was absent, hidden, or misunderstood at the time.",
      idealTerms: ["manipulation recognized", "decision regret"],
      info: {
        text: "Revising the meaning of a past decision after learning something that changes how the action and responsibility are understood.",
        link: "https://doi.org/10.1086/339925"
      }
    },
    {
      term: "violated trust",
      clusters: [0, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 2
      },
      fact:
        "Discovery becomes betrayal when the person concludes that ordinary reliance on the business's presentation was deliberately used to produce an unwanted outcome.",
      idealTerms: ["concealed condition discovered", "perceived betrayal"],
      info: {
        text: "The realization that an expectation of honest dealing was not merely disappointed but used as leverage.",
        link: "https://doi.org/10.3389/fpsyg.2026.1805536"
      }
    },
    {
      term: "trust tax",
      clusters: [2, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 3
      },
      fact:
        "Lost credibility in one encounter increases the verification, suspicion, and avoidance required in later interactions, imposing costs even when the next interface is honest.",
      idealTerms: ["credibility loss", "defensive vigilance"],
      info: {
        text: "The additional time, attention, and lost opportunity created when trust can no longer function as a reasonable starting assumption.",
        link: "https://www.usenix.org/conference/soups2024/presentation/kojima-poster"
      }
    }
  ]
};
