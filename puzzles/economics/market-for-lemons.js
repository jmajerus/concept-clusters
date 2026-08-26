// Generated from content/puzzles/market-for-lemons.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "market-for-lemons",
  "title": "The Market for Lemons",
  "category": "Economics",
  "categories": [
    "Economics"
  ],
  "large": true,
  "info": {
    "text": "How asymmetric private information disrupts markets before and after contracts are signed, and how signaling and screening can restore equilibrium.",
    "links": [
      {
        "href": "wiki:The Market for \\\"Lemons\\\"",
        "label": "The Market for 'Lemons'"
      }
    ],
    "citations": [
      {
        "title": "The Market for 'Lemons': Quality Uncertainty and the Market Mechanism",
        "author": "George A. Akerlof",
        "publisher": "The Quarterly Journal of Economics, 84(3)",
        "year": "1970",
        "pages": "488-500",
        "url": "https://doi.org/10.2307/1879431"
      },
      {
        "title": "Job Market Signaling",
        "author": "Michael Spence",
        "publisher": "The Quarterly Journal of Economics, 87(3)",
        "year": "1973",
        "pages": "355-374",
        "url": "https://doi.org/10.2307/1882010"
      },
      {
        "title": "Equilibrium in Competitive Insurance Markets: An Essay on the Economics of Imperfect Information",
        "author": "Michael Rothschild and Joseph Stiglitz",
        "publisher": "The Quarterly Journal of Economics, 90(4)",
        "year": "1976",
        "pages": "629-649",
        "url": "https://doi.org/10.2307/1885326"
      }
    ]
  },
  "clusters": [
    {
      "id": "adverse-selection",
      "name": "Adverse Selection Continuum",
      "color": "teal",
      "fact": "George Akerlof's seminal 1970 paper demonstrated that when sellers have private information about a used car's hidden quality, buyers lower their offer price to average quality. This price drop drives out high-quality sellers, leading to a death spiral where only low-quality \\\"lemons\\\" remain.",
      "terms": [
        "lemons problem",
        "hidden quality",
        "adverse selection",
        "market collapse"
      ],
      "seeds": [
        "lemons problem",
        "hidden quality"
      ],
      "info": {
        "text": "George Akerlof's Nobel Prize-winning research on how pre-transaction information asymmetry causes good products to be driven out by bad ones.",
        "links": [
          "wiki:The Market for \\\"Lemons\\\""
        ]
      }
    },
    {
      "id": "signaling",
      "name": "Market Signaling Mechanism",
      "color": "blue",
      "fact": "Michael Spence (1973) showed that informed parties can overcome adverse selection by using costly signals. For a signal to be credible, it must be significantly more expensive or difficult for low-quality actors to acquire, such as completing a demanding educational degree.",
      "terms": [
        "costly signaling",
        "credible signal",
        "conspicuous education",
        "warranties"
      ],
      "seeds": [
        "costly signaling",
        "credible signal"
      ],
      "info": {
        "text": "Michael Spence's theory of job market signaling, where costly actions transmit private qualities.",
        "links": [
          "wiki:Signaling_(economics)"
        ]
      }
    },
    {
      "id": "screening",
      "name": "Market Screening Protocol",
      "color": "amber",
      "fact": "Joseph Stiglitz and Michael Rothschild (1976) showed that uninformed parties can resolve asymmetry by screening: offering a menu of self-selecting contracts. In insurance, high-risk buyers choose low-deductible/high-premium plans, while low-risk buyers choose high deductibles to prove their low risk.",
      "terms": [
        "screening mechanisms",
        "self-selection",
        "deductibles",
        "probationary periods"
      ],
      "seeds": [
        "screening mechanisms",
        "self-selection"
      ],
      "info": {
        "text": "Joseph Stiglitz's work on screening, where the uninformed party designs contracts that incentivize private types to self-reveal.",
        "links": [
          "wiki:Screening_(economics)"
        ]
      }
    },
    {
      "id": "moral-hazard",
      "name": "Moral Hazard Governance",
      "color": "magenta",
      "fact": "Kenneth Arrow (1963) highlighted that after a contract is signed, asymmetric information can lead to moral hazard. Because insurance or insulation protects them from risk, individuals have less incentive to avoid bad outcomes, committing hidden actions that increase overall risk.",
      "terms": [
        "hidden action",
        "principal-agent problem",
        "risk insulation",
        "incentive misalignment"
      ],
      "seeds": [
        "hidden action",
        "principal-agent problem"
      ],
      "info": {
        "text": "The economics of post-transaction behavior modification under risk protection and asymmetric monitoring.",
        "links": [
          "wiki:Moral_hazard"
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-asymmetry-types",
      "term": "private information",
      "clusters": [
        0,
        3
      ],
      "fact": "Both adverse selection and moral hazard are market failures born of private information. They are distinguished by temporal sequence and observability: adverse selection is pre-transaction hidden quality, whereas moral hazard is post-transaction hidden action.",
      "info": {
        "text": "A foundational concept describing any scenario where one party to a transaction has more or better information than the other."
      },
      "termRole": "connector",
      "relationKind": "contrast",
      "idealTerms": [
        "hidden quality",
        "hidden action"
      ],
      "direction": {
        "kind": "undirected"
      }
    },
    {
      "id": "bridge-remedies",
      "term": "information revelation",
      "clusters": [
        1,
        2
      ],
      "fact": "Signaling and screening are the dual informational remedies to adverse selection. Signaling is initiated by the informed party using a costly signal, while screening is initiated by the uninformed party using self-selecting menus.",
      "info": {
        "text": "Strategic techniques designed to elicit or transmit private information to restore market function."
      },
      "termRole": "connector",
      "relationKind": "continuity",
      "idealTerms": [
        "costly signaling",
        "screening mechanisms"
      ],
      "direction": {
        "kind": "undirected"
      }
    }
  ],
  "lenses": [
    {
      "id": "concrete-remedies",
      "prompt": "Which concepts represent concrete, real-world contracts, mechanisms, or decisions used to mitigate information asymmetries?",
      "explanation": "These four represent direct, real-world mechanisms: 'warranties' and 'conspicuous education' are costly signaling devices used by informed sellers and workers; 'deductibles' and 'probationary periods' are screening contracts offered by insurance companies and employers to sort buyers and employees.",
      "color": "teal",
      "targets": [
        "warranties",
        "conspicuous education",
        "deductibles",
        "probationary periods"
      ],
      "reasons": {
        "warranties": "A physical contract covering repairs, credibly signaling high quality.",
        "conspicuous education": "A degree completed to signal high ability to potential employers.",
        "probationary periods": "A trial period used by employers to screen worker productivity.",
        "deductibles": "An insurance term offering lower premiums to low-risk buyers in exchange for high deductibles."
      }
    },
    {
      "id": "post-transaction-asymmetry",
      "prompt": "Which concepts specifically address or represent information asymmetry that exists AFTER a transaction is finalized?",
      "explanation": "Moral hazard represents post-transaction asymmetry, where behavioral incentives change after risk insulation is established. All terms in the other three clusters describe pre-transaction states, signals, or screenings designed to resolve asymmetries before a contract is signed.",
      "color": "blue",
      "targets": [
        "hidden action",
        "principal-agent problem",
        "risk insulation",
        "incentive misalignment"
      ],
      "reasons": {
        "incentive misalignment": "The post-transaction divergence of actor incentives.",
        "hidden action": "The unobserved post-transaction action that drives moral hazard.",
        "risk insulation": "The post-transaction buffer that alters incentives.",
        "principal-agent problem": "The post-transaction governance challenge of aligning interests."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Asymmetric Information: Lemons, Signals, and Hazards",
    "summary": "Learn how hidden quality and hidden actions disrupt markets, and how signaling and screening restore balance.",
    "estimatedMinutes": 5,
    "credit": "By Gemini 1.5 Pro",
    "content": {
      "mediaType": "text/markdown",
      "text": "In a perfect economic market, buyers and sellers possess the same information. In the real world, however, information is almost always asymmetric: one party knows more than the other. This simple friction can destroy entire industries. If buyers cannot verify the quality of a used car, they will only pay an average price, causing high-quality sellers to withdraw and leaving only 'lemons' behind.\n\nTo prevent market collapse, economics offers elegant remedies. Sellers can use costly, hard-to-fake 'signals' (like warranties or expensive education) to credibly prove their quality. Buyers can design 'screening' mechanisms (like insurance deductibles or job probationary periods) that force sellers to self-select and reveal their true type.\n\nFinally, the problem doesn't end when a contract is signed. Once insulated from risk, individuals may engage in hidden, riskier actions—a post-transaction challenge known as moral hazard. Understanding these forces helps us design better institutions, contracts, and social policies."
    }
  },
  "generativeAssistance": [
    {
      "system": "Gemini 1.5 Pro",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Google",
      "date": "2026-08-24"
    },
    {
      "system": "Gemini CLI",
      "scope": "puzzle",
      "role": "edited",
      "provider": "Google",
      "date": "2026-08-26"
    },
    {
      "system": "Gemini CLI",
      "scope": "learningIntroduction",
      "role": "edited",
      "provider": "Google",
      "date": "2026-08-26"
    }
  ]
});
