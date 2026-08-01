// Concept Clusters puzzle: Restoring Honest Choice
// Dark Patterns sequence drafted August 2026 from professional computing
// ethics, business education, organizational safeguards, and consumer policy.

export default {
  id: "restoring-honest-choice",
  title: "Restoring Honest Choice",
  category: "Business & Organizations",
  categories: ["Business & Organizations", "Computer Science"],
  large: true,
  info: {
    text:
      "How professional commitments, ethical formation, organizational safeguards, and public accountability can work together to protect honest choice. The puzzle treats these remedies as complementary layers rather than interchangeable solutions.",
    link: "https://www.acm.org/code-of-ethics",
    linkLabel: "ACM Code of Ethics",
    seeAlso: [
      {
        href: "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule",
        label: "FTC negative-option rule"
      },
      {
        href: "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement",
        label: "FTC enforcement"
      },
      {
        href: "https://www.aacsb.edu/educators/global-standards",
        label: "AACSB business-education standards"
      }
    ]
  },
  lenses: [
    {
      id: "acm-code-in-practice",
      prompt: "Which concepts translate the ACM Code of Ethics into responsibilities relevant to dark patterns?",
      targets: [
        "public good",
        "avoid harm",
        "honesty and trustworthiness",
        "respect for privacy",
        "impact and risk evaluation",
        "professional obligation"
      ],
      explanation:
        "The ACM Code asks computing professionals to consider the public good, avoid harm, act honestly, respect privacy, and evaluate systems and their impacts thoroughly. Professional obligation connects those commitments to concrete organizational practices rather than leaving them as personal aspirations.",
      reasons: {
        "public good": "The interests of people affected by a system belong inside the definition of professional success.",
        "avoid harm": "Manipulative design can impose financial, psychological, privacy, time, and autonomy harms even when it improves a business metric.",
        "honesty and trustworthiness": "Interfaces should represent choices, prices, consequences, and conditions without concealment or strategic ambiguity.",
        "respect for privacy": "Consent and data collection should not be obtained through coercion, obstruction, or misleading defaults.",
        "impact and risk evaluation": "Professionals should assess foreseeable effects on users and society before and after deployment.",
        "professional obligation": "Ethical commitments must shape review, escalation, and design decisions within the organization."
      }
    },
    {
      id: "ethics-before-launch",
      prompt: "Which concepts help ethical judgment affect a product before manipulative design becomes routine?",
      targets: [
        "stakeholder analysis",
        "case-based reasoning",
        "ethics review",
        "autonomy testing",
        "protected dissent",
        "institutionalized restraint"
      ],
      explanation:
        "Ethics becomes preventive when people learn to recognize recurring conflicts, examine who bears costs and benefits, test whether choices remain understandable and voluntary, and have protected channels for raising concerns before launch. Institutionalized restraint turns that judgment into repeatable organizational practice.",
      reasons: {
        "stakeholder analysis": "It identifies affected people whose interests may be absent from the chosen performance metric.",
        "case-based reasoning": "Concrete cases help professionals recognize recurring mechanisms, rationalizations, and consequences.",
        "ethics review": "A structured checkpoint can surface concerns before a design becomes an operational default.",
        "autonomy testing": "Testing asks whether people can understand, refuse, revise, or exit without disproportionate pressure or friction.",
        "protected dissent": "Workers need credible protection when professional judgment conflicts with an assigned target or approved design.",
        "institutionalized restraint": "Education matters most when organizations give ethical judgment procedures, authority, and durable support."
      }
    },
    {
      id: "regulatory-backstop",
      prompt: "Which concepts form the public accountability backstop when voluntary safeguards fail?",
      targets: [
        "FTC enforcement",
        "clear disclosure",
        "cancellation parity",
        "statutory protection",
        "independent oversight",
        "enforceable floor"
      ],
      explanation:
        "Public accountability supplies a minimum enforceable floor where market incentives or internal safeguards are insufficient. Enforcement, disclosure duties, fair cancellation, legislation, and independent review can deter practices, provide remedies, and make basic protections less dependent on voluntary restraint.",
      reasons: {
        "FTC enforcement": "The agency can investigate and act against unfair or deceptive practices under its legal authorities.",
        "clear disclosure": "Material terms should be presented plainly and before a person is committed or charged.",
        "cancellation parity": "Ending a service should not be made substantially harder than entering it through avoidable procedural friction.",
        "statutory protection": "Legislatures can establish rights, duties, remedies, and enforcement authority beyond voluntary codes.",
        "independent oversight": "External review reduces reliance on the organization judging its own incentives and conduct.",
        "enforceable floor": "Law and regulation establish minimum protections even where professional or organizational ethics fail."
      }
    },
    {
      id: "complementary-layers",
      prompt: "Which concepts show why no single remedy can restore honest choice by itself?",
      targets: [
        "public good",
        "professional identity",
        "incentive redesign",
        "FTC enforcement",
        "professional obligation",
        "enforceable floor"
      ],
      explanation:
        "Honest choice depends on reinforcing layers. Ethical commitments orient judgment; education shapes professional identity; incentive redesign changes what organizations reward; professional obligation turns values into action; and enforcement supplies a floor when internal restraint fails. Removing any layer leaves predictable gaps for the others to carry.",
      reasons: {
        "public good": "A substantive ethical aim is needed to judge whether optimization serves or exploits affected people.",
        "professional identity": "People must understand ethical judgment as part of competent professional practice, not an optional personal concern.",
        "incentive redesign": "Workers cannot reliably protect users when rewards and penalties consistently favor manipulation.",
        "FTC enforcement": "External authority is needed where firms ignore harms, complaints, or voluntary commitments.",
        "professional obligation": "Values require a pathway into actual product and governance decisions.",
        "enforceable floor": "Minimum protections cannot depend entirely on the goodwill or courage of individual actors."
      }
    }
  ],
  clusters: [
    {
      name: "Professional commitments",
      color: "teal",
      fact:
        "Professional ethics asks computing practitioners and leaders to define success through human well-being, avoidance of harm, honesty, privacy, and careful evaluation of impacts, not solely through technical performance or business metrics.",
      terms: [
        "public good",
        "avoid harm",
        "honesty and trustworthiness",
        "respect for privacy",
        "impact and risk evaluation"
      ],
      seeds: ["public good", "avoid harm"],
      termInfo: {
        "public good": {
          text: "The ACM Code places the public good at the center of computing work and treats all people as stakeholders in computing.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "avoid harm": {
          text: "A professional duty to prevent or mitigate significant unjust consequences arising from computing systems and decisions.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "honesty and trustworthiness": {
          text: "The duty to represent systems, capabilities, incentives, terms, and limitations without deception or misleading omission.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "respect for privacy": {
          text: "The duty to understand and protect privacy rights, use personal information for legitimate ends, and support informed consent.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "impact and risk evaluation": {
          text: "Comprehensive assessment of a system's foreseeable benefits, harms, limitations, and effects on people and society.",
          link: "https://www.acm.org/code-of-ethics"
        }
      },
      info: {
        link: "https://www.acm.org/code-of-ethics",
        linkLabel: "ACM Code of Ethics"
      }
    },
    {
      name: "Education and formation",
      color: "blue",
      fact:
        "Education can build the concepts, habits, and professional identity needed to recognize manipulation, analyze stakeholders, reason from cases, and treat ethical judgment as part of competent practice.",
      terms: [
        "business ethics",
        "computing ethics",
        "stakeholder analysis",
        "case-based reasoning",
        "professional identity"
      ],
      seeds: ["business ethics", "stakeholder analysis"],
      termInfo: {
        "business ethics": {
          text: "Study of the responsibilities, values, institutions, and conflicts that shape business decisions and their effects on stakeholders and society.",
          link: "https://www.aacsb.edu/educators/global-standards"
        },
        "computing ethics": {
          text: "Study and practice of ethical responsibility in the design, development, deployment, governance, and use of computing systems.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "stakeholder analysis": {
          text: "Identifying who affects or is affected by a decision, what interests and risks they carry, and whose interests may be omitted from the chosen metric.",
          link: "https://www.aacsb.edu/educators/global-standards"
        },
        "case-based reasoning": {
          text: "Learning through concrete situations that reveal competing duties, incentives, rationalizations, consequences, and possible interventions.",
          link: "https://www.aacsb.edu/educators/global-standards"
        },
        "professional identity": {
          text: "A person's understanding that ethical judgment, public responsibility, and willingness to raise concerns belong to competent professional work.",
          link: "https://www.acm.org/code-of-ethics"
        }
      },
      info: {
        text: "AACSB's 2026 standards emphasize ethical judgment, responsible use of technology, human judgment, and societal impact across business curricula.",
        link: "https://www.aacsb.edu/educators/global-standards",
        linkLabel: "AACSB global standards"
      }
    },
    {
      name: "Organizational safeguards",
      color: "amber",
      fact:
        "Organizations make ethical restraint credible by changing incentives, reviewing high-risk designs, testing the integrity of choices, escalating complaints, and protecting people who challenge harmful objectives or practices.",
      terms: [
        "ethics review",
        "incentive redesign",
        "autonomy testing",
        "complaint escalation",
        "protected dissent"
      ],
      seeds: ["ethics review", "protected dissent"],
      termInfo: {
        "ethics review": {
          text: "A structured examination of foreseeable impacts, stakeholder interests, conflicts, alternatives, and safeguards before or during deployment.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "incentive redesign": {
          text: "Changing targets, rewards, evaluation criteria, and decision rights so that protecting users is not punished as failure to optimize.",
          link: "https://www.acm.org/code-of-ethics"
        },
        "autonomy testing": {
          text: "A proposed design practice that tests whether people can understand, refuse, revise, and exit a choice without misleading pressure or disproportionate friction.",
          link: "https://www.ftc.gov/reports/bringing-dark-patterns-light"
        },
        "complaint escalation": {
          text: "A process that treats recurring objections and harms as evidence requiring review by people with authority to change the product or policy.",
          link: "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement"
        },
        "protected dissent": {
          text: "Credible permission and protection for workers to question, refuse, or escalate practices that conflict with professional or public responsibilities.",
          link: "https://www.acm.org/code-of-ethics"
        }
      },
      info: {
        link: "https://www.acm.org/code-of-ethics",
        linkLabel: "ACM Code of Ethics",
        seeAlso: [
          {
            href: "https://www.ftc.gov/reports/bringing-dark-patterns-light",
            label: "FTC dark-patterns report"
          }
        ]
      }
    },
    {
      name: "Public accountability",
      color: "magenta",
      fact:
        "Public institutions establish minimum protections through enforcement, disclosure requirements, fair cancellation expectations, legislation, and independent oversight when voluntary or internal safeguards prove inadequate.",
      terms: [
        "FTC enforcement",
        "clear disclosure",
        "cancellation parity",
        "statutory protection",
        "independent oversight"
      ],
      seeds: ["FTC enforcement", "clear disclosure"],
      termInfo: {
        "FTC enforcement": {
          text: "Investigation and legal action by the Federal Trade Commission against practices within its authority that are unfair, deceptive, or otherwise unlawful.",
          link: "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement"
        },
        "clear disclosure": {
          text: "Presentation of material terms in language, timing, and visual form that people can reasonably notice and understand before committing.",
          link: "https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule"
        },
        "cancellation parity": {
          text: "A policy and design principle that ending a recurring relationship should not be made substantially more difficult than entering it.",
          link: "https://www.ftc.gov/policy/public-comments/rule-concerning-use-prenotification-negative-option-plans-2"
        },
        "statutory protection": {
          text: "Rights, duties, remedies, and enforcement powers established through legislation rather than left solely to voluntary practice.",
          link: "https://www.ftc.gov/legal-library/browse/statutes"
        },
        "independent oversight": {
          text: "Review by institutions outside the immediate product and incentive chain, such as regulators, courts, auditors, or consumer-protection bodies.",
          link: "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection"
        }
      },
      info: {
        text: "The FTC continues to use enforcement and rulemaking processes to address unfair or deceptive negative-option practices, including difficult cancellation and inadequate consent or disclosure.",
        link: "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule",
        linkLabel: "FTC negative-option rule",
        seeAlso: [
          {
            href: "https://www.ftc.gov/about-ftc/bureaus-offices/bureau-consumer-protection/our-divisions/division-enforcement",
            label: "FTC enforcement"
          },
          {
            href: "https://www.ftc.gov/legal-library/browse/statutes",
            label: "FTC-administered statutes"
          }
        ]
      }
    }
  ],
  bridges: [
    {
      term: "professional obligation",
      clusters: [0, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 2
      },
      fact:
        "Professional commitments become effective when they shape organizational review, incentives, testing, escalation, and the authority to refuse or revise harmful designs.",
      idealTerms: ["impact and risk evaluation", "ethics review"],
      info: {
        text: "The movement from ethical principle to concrete professional and organizational action.",
        link: "https://www.acm.org/code-of-ethics"
      }
    },
    {
      term: "institutionalized restraint",
      clusters: [1, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 1,
        to: 2
      },
      fact:
        "Ethical education has durable effect when organizations supply procedures, incentives, authority, and protection that allow trained judgment to influence real decisions.",
      idealTerms: ["professional identity", "protected dissent"],
      info: {
        text: "Restraint made repeatable and supported through organizational structures rather than left to isolated individual courage.",
        link: "https://www.aacsb.edu/educators/global-standards"
      }
    },
    {
      term: "enforceable floor",
      clusters: [3, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 3,
        to: 2
      },
      fact:
        "Law, regulation, and external oversight establish minimum expectations that organizations must translate into policies, review processes, escalation routes, and product requirements.",
      idealTerms: ["statutory protection", "ethics review"],
      info: {
        text: "A minimum level of protection that does not depend solely on voluntary ethics or internal business judgment.",
        link: "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule"
      }
    }
  ]
};
