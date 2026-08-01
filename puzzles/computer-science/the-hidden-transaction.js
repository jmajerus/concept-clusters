// Concept Clusters puzzle: The Hidden Transaction
// Dark Patterns sequence drafted July 2026 from deceptive.design.

export default {
  id: "the-hidden-transaction",
  title: "The Hidden Transaction",
  category: "Computer Science",
  large: true,
  info: {
    text:
      "How a transaction can appear to offer one product, price, or payment arrangement while relevant costs, add-ons, or recurring obligations remain hidden until after the user has committed. This puzzle examines the Sneaking family of dark patterns.",
    link: "https://deceptive.design/book/contents/chapter-14/",
    extraLink: "https://deceptive.design/types/sneaking/"
  },
  lenses: [
    {
      id: "sneaking",
      prompt: "Which concepts form the shared signature of the Sneaking dark-pattern family?",
      targets: [
        "sneaking",
        "time invested",
        "stored payment method",
        "financial loss"
      ],
      explanation:
        "Sneaking withholds or delays information that would materially affect a transaction. Once the user has invested effort or supplied a payment method, the concealed term can become an actual charge or obligation that the person would not otherwise have chosen.",
      reasons: {
        sneaking: "The visible offer leads into a transaction whose pertinent terms are hidden, delayed, or silently applied.",
        "time invested": "Late disclosure gains leverage after the person has already spent effort completing the transaction.",
        "stored payment method": "Existing payment authority can convert an undisclosed term into a charge without another deliberate purchasing decision.",
        "financial loss": "The family produces concrete harm when hidden fees, add-ons, or subscriptions cost the person money."
      }
    },
    {
      id: "hidden-costs",
      prompt: "Which concepts form the dominant signature of the Hidden Costs dark pattern?",
      targets: [
        "advertised price",
        "delayed disclosure",
        "checkout progress",
        "time invested",
        "unexpected fee",
        "financial loss"
      ],
      explanation:
        "Hidden Costs advertise an incomplete price and reveal additional fees only after the user has progressed through checkout. The delayed disclosure makes abandoning the transaction more costly in time and effort, increasing the chance that the person will accept the higher total.",
      reasons: {
        "advertised price": "The initial price attracts the user while omitting charges that materially change the total.",
        "delayed disclosure": "Additional costs are withheld until a late stage of the purchasing journey.",
        "checkout progress": "The user reaches the fee only after completing several transaction steps.",
        "time invested": "Starting again elsewhere would require discarding work already spent on the purchase.",
        "unexpected fee": "The final amount includes a charge that was not made salient when the offer was evaluated.",
        "financial loss": "The user may spend more than they would have under complete up-front pricing."
      }
    },
    {
      id: "sneak-into-basket",
      prompt: "Which concepts form the dominant signature of the Sneak into Basket dark pattern?",
      targets: [
        "chosen product",
        "undisclosed add-on",
        "checkout progress",
        "unwanted item",
        "financial loss"
      ],
      explanation:
        "Sneak into Basket preserves the appearance that the user is buying a chosen product while an additional item or service is inserted without an explicit request. Unless the user notices and removes it during checkout, the basket no longer represents what they intended to purchase.",
      reasons: {
        "chosen product": "The user begins with a specific item they actually meant to buy.",
        "undisclosed add-on": "Another product or service is inserted without an affirmative request.",
        "checkout progress": "The added item may become visible only when the user reviews or completes the basket.",
        "unwanted item": "The completed order contains something the user did not select.",
        "financial loss": "The extra item increases the amount charged."
      }
    },
    {
      id: "hidden-subscription",
      prompt: "Which concepts form the dominant signature of the Hidden Subscription dark pattern?",
      targets: [
        "one-off expectation",
        "obscured recurring terms",
        "silent enrollment",
        "stored payment method",
        "missing notification",
        "recurring charge"
      ],
      explanation:
        "Hidden Subscription makes a one-time action appear complete while quietly creating an ongoing payment obligation. Stored payment authority and absent reminders allow recurring charges to continue without a fresh, informed decision each billing period.",
      reasons: {
        "one-off expectation": "The user believes the transaction or action creates only a single charge or commitment.",
        "obscured recurring terms": "The ongoing billing condition is hidden, poorly disclosed, or detached from the action that triggers it.",
        "silent enrollment": "The interface creates the subscription without a clear, explicit enrollment decision.",
        "stored payment method": "The provider can collect later payments without asking the user to authorize each one.",
        "missing notification": "The service avoids reminders that might reveal the continuing obligation and prompt cancellation.",
        "recurring charge": "The hidden term results in repeated payments rather than the one-off transaction the user expected."
      }
    }
  ],
  clusters: [
    {
      name: "Visible offer",
      color: "teal",
      fact:
        "People form a working model of a transaction from the visible price, the item they selected, and the payment arrangement presented at the point of choice.",
      terms: [
        "advertised price",
        "chosen product",
        "one-off expectation",
        "free trial"
      ],
      seeds: ["advertised price", "chosen product"],
      termInfo: {
        "advertised price": {
          text: "The price made salient when the user first evaluates whether to begin a purchase.",
          link: "https://deceptive.design/types/hidden-costs/"
        },
        "chosen product": {
          text: "The item or service the user deliberately selected before any undisclosed addition altered the transaction.",
          link: "https://deceptive.design/types/sneaking/"
        },
        "one-off expectation": {
          text: "The user's understanding that an action creates a single payment or commitment rather than an ongoing subscription.",
          link: "https://deceptive.design/types/hidden-subscription/"
        },
        "free trial": {
          text: "Temporary access offered without an immediate service fee, sometimes while collecting payment details for later billing.",
          link: "https://deceptive.design/types/hidden-subscription/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-14/"
      }
    },
    {
      name: "Concealed terms",
      color: "blue",
      fact:
        "Sneaking changes the meaning of a transaction by hiding, delaying, or silently applying information that would matter to an informed choice.",
      terms: [
        "delayed disclosure",
        "undisclosed add-on",
        "obscured recurring terms",
        "silent enrollment"
      ],
      seeds: ["delayed disclosure", "undisclosed add-on"],
      termInfo: {
        "delayed disclosure": {
          text: "Withholding a material cost or condition until the user is well into the transaction.",
          link: "https://deceptive.design/types/hidden-costs/"
        },
        "undisclosed add-on": {
          text: "An additional product, service, donation, or protection plan inserted without the user's explicit request.",
          link: "https://deceptive.design/types/sneaking/"
        },
        "obscured recurring terms": {
          text: "Subscription language hidden, deemphasized, or separated from the action that creates the recurring obligation.",
          link: "https://deceptive.design/types/hidden-subscription/"
        },
        "silent enrollment": {
          text: "Creating a subscription or payment plan without a clear interface moment in which the user knowingly chooses to enroll.",
          link: "https://deceptive.design/types/hidden-subscription/"
        }
      },
      info: {
        link: "https://deceptive.design/types/sneaking/"
      }
    },
    {
      name: "Leverage after entry",
      color: "amber",
      fact:
        "Concealment becomes more effective after the user has invested effort, progressed through checkout, supplied payment authority, or stopped receiving information that would reveal later charges.",
      terms: [
        "checkout progress",
        "time invested",
        "stored payment method",
        "missing notification"
      ],
      seeds: ["checkout progress", "time invested"],
      termInfo: {
        "checkout progress": {
          text: "The sequence of forms, selections, account steps, and confirmations already completed before a hidden term appears.",
          link: "https://deceptive.design/types/hidden-costs/"
        },
        "time invested": {
          text: "The effort already spent locating, configuring, and preparing a purchase, which makes abandoning it and starting over less attractive.",
          link: "https://deceptive.design/types/hidden-costs/"
        },
        "stored payment method": {
          text: "Payment credentials retained by the provider so later charges can occur without a new entry of card or account details.",
          link: "https://deceptive.design/types/hidden-subscription/"
        },
        "missing notification": {
          text: "The absence of a clear reminder, receipt, or warning that would draw attention to a continuing subscription or newly incurred charge.",
          link: "https://deceptive.design/types/hidden-subscription/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-14/"
      }
    },
    {
      name: "Unchosen consequences",
      color: "magenta",
      fact:
        "The hidden information becomes materially harmful when the user pays an unexpected fee, receives an unwanted add-on, or remains subject to recurring charges they did not knowingly accept.",
      terms: [
        "unexpected fee",
        "unwanted item",
        "recurring charge",
        "financial loss"
      ],
      seeds: ["unexpected fee", "recurring charge"],
      termInfo: {
        "unexpected fee": {
          text: "A charge added after the user evaluated an earlier, incomplete price.",
          link: "https://deceptive.design/types/hidden-costs/"
        },
        "unwanted item": {
          text: "A product or service included in an order even though the user did not affirmatively choose it.",
          link: "https://deceptive.design/types/sneaking/"
        },
        "recurring charge": {
          text: "A payment collected repeatedly under an ongoing obligation rather than as a single transaction.",
          link: "https://deceptive.design/types/hidden-subscription/"
        },
        "financial loss": {
          text: "Money spent because the user acted on incomplete or misleading transaction information.",
          link: "https://deceptive.design/book/contents/chapter-22/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-22/"
      }
    }
  ],
  bridges: [
    {
      term: "sneaking",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact:
        "The visible offer draws the user into a transaction whose pertinent costs, additions, or recurring obligations are hidden, delayed, or silently applied.",
      idealTerms: ["advertised price", "delayed disclosure"],
      info: {
        text: "Withholding or obscuring information relevant to a transaction so the user acts on false or incomplete premises.",
        link: "https://deceptive.design/types/sneaking/"
      }
    },
    {
      term: "commitment leverage",
      clusters: [1, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 1,
        to: 2
      },
      fact:
        "A concealed term gains practical force when disclosure is delayed until the user has completed several steps, invested time, or supplied a payment method that can be charged later.",
      idealTerms: ["delayed disclosure", "time invested"],
      info: {
        text: "Using a person's prior effort or established payment authority to increase the chance that an undisclosed condition will be accepted or remain unnoticed.",
        link: "https://deceptive.design/types/hidden-costs/"
      }
    },
    {
      term: "unintended transaction",
      clusters: [2, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 3
      },
      fact:
        "Checkout investment, stored payment authority, and absent notifications allow hidden terms to become actual fees, unwanted purchases, or continuing charges.",
      idealTerms: ["stored payment method", "recurring charge"],
      info: {
        text: "A charge, purchase, or continuing obligation that does not reflect the transaction the person understood themselves to be authorizing.",
        link: "https://deceptive.design/book/contents/chapter-22/"
      }
    }
  ]
};
