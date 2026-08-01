// Concept Clusters puzzle: Control and Exit
// Dark Patterns sequence drafted July 2026 from deceptive.design.

export default {
  id: "control-and-exit",
  title: "Control and Exit",
  category: "Computer Science",
  large: true,
  info: {
    text:
      "How interfaces make access conditional, refuse to accept a clear no, and create asymmetric paths in which compliance and entry are easy while privacy protection and exit are costly. This puzzle examines Forced Action, Nagging, Obstruction, and Hard to Cancel.",
    link: "https://deceptive.design/types/forced-action/",
    extraLink: "https://deceptive.design/types/obstruction/"
  },
  lenses: [
    {
      id: "forced-action",
      prompt: "Which concepts form the dominant signature of the Forced Action dark pattern?",
      targets: [
        "access desired service",
        "create account",
        "disclose personal data",
        "conditional access",
        "privacy loss",
        "impaired autonomy"
      ],
      explanation:
        "Forced Action makes something the person wants conditional on another action the provider wants. The condition becomes deceptive when it is unexpected, unnecessary, bundled with unrelated consent, or designed to extract data or commitment rather than enable the requested service.",
      reasons: {
        "access desired service": "The person begins with a goal of their own rather than a desire to satisfy the provider's additional demand.",
        "create account": "Registration may be imposed even when the requested task does not inherently require a continuing account relationship.",
        "disclose personal data": "Access can be made conditional on surrendering information beyond what the task reasonably needs.",
        "conditional access": "The desired action is withheld until the user performs the provider-selected exchange.",
        "privacy loss": "The compelled exchange may expose personal information or permit uses the person did not freely choose.",
        "impaired autonomy": "The person's practical choices are narrowed by tying one goal to an unwanted condition."
      }
    },
    {
      id: "nagging",
      prompt: "Which concepts form the dominant signature of the Nagging dark pattern?",
      targets: [
        "decline request",
        "repeated prompt",
        "interrupted task",
        "time and attention loss",
        "fatigue"
      ],
      explanation:
        "Nagging treats a refusal as temporary rather than final. Repeated prompts interrupt the person's actual task and impose a continuing tax on time and attention until giving in seems easier than protecting the original choice.",
      reasons: {
        "decline request": "The person has already indicated that they do not want the requested action or permission.",
        "repeated prompt": "The same request returns because the interface does not provide or respect a durable refusal.",
        "interrupted task": "The provider inserts its own objective into the activity the person was trying to complete.",
        "time and attention loss": "Each interruption consumes cognitive and temporal resources even when the person continues to refuse.",
        fatigue: "Accumulated interruptions can wear down resistance and make compliance feel less costly than continued refusal."
      }
    },
    {
      id: "obstruction",
      prompt: "Which concepts form the dominant signature of the Obstruction dark pattern?",
      targets: [
        "end subscription",
        "hidden cancellation",
        "extra steps",
        "channel switching",
        "resource depletion",
        "time and attention loss"
      ],
      explanation:
        "Obstruction deliberately places hurdles between a person and a goal that conflicts with the provider's interests. Hidden controls, extra steps, and forced movement between channels consume resources and increase the chance that the person will abandon the attempt.",
      reasons: {
        "end subscription": "Cancellation is a user goal whose completion may reduce the provider's revenue or retention metrics.",
        "hidden cancellation": "The route to the desired action is difficult to locate or deliberately deemphasized.",
        "extra steps": "The person must complete more actions than the task reasonably requires.",
        "channel switching": "An online relationship may be made cancellable only by phone, mail, or another less convenient channel.",
        "resource depletion": "The obstacles work by consuming enough effort, patience, or attention to produce abandonment.",
        "time and attention loss": "The person pays a non-financial cost simply to exercise a choice that should remain available."
      }
    },
    {
      id: "hard-to-cancel",
      prompt: "Which concepts form the dominant signature of the Hard to Cancel or Roach Motel pattern?",
      targets: [
        "end subscription",
        "easy enrollment",
        "hidden cancellation",
        "channel switching",
        "forced persistence",
        "asymmetric friction"
      ],
      explanation:
        "Hard to Cancel creates a lifecycle asymmetry: joining takes seconds, while leaving requires searching, repeated confirmations, or movement to a less convenient channel. The resulting persistence reflects imposed friction rather than continuing preference.",
      reasons: {
        "end subscription": "The person is trying to terminate an ongoing service or payment relationship.",
        "easy enrollment": "The provider minimizes effort when the action increases acquisition or recurring revenue.",
        "hidden cancellation": "The exit control is made harder to find than the entry control.",
        "channel switching": "Cancellation may require a phone call, live agent, postal request, or desktop flow even when signup was immediate and online.",
        "forced persistence": "The relationship continues because leaving is burdensome, not because the person affirmatively wishes to remain.",
        "asymmetric friction": "The effort required depends on whether the person's goal serves or conflicts with the provider's interests."
      }
    }
  ],
  clusters: [
    {
      name: "Person's intended action",
      color: "teal",
      fact:
        "People approach an interface with purposes of their own: to use a service, decline a request, protect personal information, or end a relationship they no longer want.",
      terms: [
        "access desired service",
        "use core feature",
        "decline request",
        "end subscription",
        "control personal data"
      ],
      seeds: ["access desired service", "end subscription"],
      termInfo: {
        "access desired service": {
          text: "The product, information, confirmation, or capability the person originally came to obtain.",
          link: "https://deceptive.design/types/forced-action/"
        },
        "use core feature": {
          text: "Performing the central function of a product without being diverted into an unrelated registration, installation, or permission flow.",
          link: "https://deceptive.design/book/contents/chapter-20/"
        },
        "decline request": {
          text: "Refusing a provider's invitation to enable notifications, share data, subscribe, install an app, or take another optional action.",
          link: "https://deceptive.design/types/nagging/"
        },
        "end subscription": {
          text: "Terminating an ongoing service, membership, or recurring-payment relationship.",
          link: "https://deceptive.design/types/hard-to-cancel/"
        },
        "control personal data": {
          text: "Choosing whether personal information is collected, shared, retained, or used for purposes beyond the requested service.",
          link: "https://deceptive.design/book/contents/chapter-20/"
        }
      },
      info: {
        link: "https://deceptive.design/types/"
      }
    },
    {
      name: "Provider-imposed action",
      color: "blue",
      fact:
        "A provider can condition access on registration, disclosure, installation, marketing consent, or payment authority that serves its own interests more than the person's immediate goal.",
      terms: [
        "create account",
        "disclose personal data",
        "install app",
        "accept marketing",
        "provide payment details"
      ],
      seeds: ["create account", "disclose personal data"],
      termInfo: {
        "create account": {
          text: "Registering an ongoing identity and relationship with the provider before completing a task that may not inherently require one.",
          link: "https://deceptive.design/book/contents/chapter-20/"
        },
        "disclose personal data": {
          text: "Supplying contact, identity, location, address-book, behavioral, or other information as a condition of access.",
          link: "https://deceptive.design/types/forced-action/"
        },
        "install app": {
          text: "Downloading dedicated software before receiving information or completing an action that could otherwise be handled through the current channel.",
          link: "https://deceptive.design/types/forced-action/"
        },
        "accept marketing": {
          text: "Agreeing to promotional communication, targeting, or data use as part of a bundled or apparently mandatory step.",
          link: "https://deceptive.design/book/contents/chapter-20/"
        },
        "provide payment details": {
          text: "Supplying a reusable payment method before accessing a trial, document, or service advertised as free or immediately available.",
          link: "https://deceptive.design/types/forced-action/"
        }
      },
      info: {
        link: "https://deceptive.design/types/forced-action/"
      }
    },
    {
      name: "Asymmetric pathways",
      color: "amber",
      fact:
        "Provider-favorable actions are made immediate and prominent, while refusal and exit are interrupted, hidden, lengthened, or displaced into less convenient channels.",
      terms: [
        "repeated prompt",
        "easy enrollment",
        "hidden cancellation",
        "extra steps",
        "channel switching"
      ],
      seeds: ["repeated prompt", "hidden cancellation"],
      termInfo: {
        "repeated prompt": {
          text: "A request that returns after refusal because the interface offers only a temporary dismissal such as 'Not now'.",
          link: "https://deceptive.design/types/nagging/"
        },
        "easy enrollment": {
          text: "A short, prominent, and low-effort path into a subscription, account, permission, or continuing relationship.",
          link: "https://deceptive.design/types/hard-to-cancel/"
        },
        "hidden cancellation": {
          text: "An exit option buried in menus, visually deemphasized, ambiguously labeled, or omitted from the channel where enrollment occurred.",
          link: "https://deceptive.design/types/hard-to-cancel/"
        },
        "extra steps": {
          text: "Additional pages, confirmations, surveys, retention offers, or explanations inserted before the person's goal is allowed to complete.",
          link: "https://deceptive.design/types/obstruction/"
        },
        "channel switching": {
          text: "Requiring the person to move from web or app to telephone, mail, desktop, or live support to complete refusal or exit.",
          link: "https://deceptive.design/types/hard-to-cancel/"
        }
      },
      info: {
        link: "https://deceptive.design/book/contents/chapter-19/"
      }
    },
    {
      name: "Consequences for agency",
      color: "magenta",
      fact:
        "Conditional access, repeated interruption, and obstructed exit consume personal resources and can leave people sharing data, remaining enrolled, or accepting conditions they did not freely choose.",
      terms: [
        "interrupted task",
        "time and attention loss",
        "fatigue",
        "privacy loss",
        "forced persistence",
        "impaired autonomy"
      ],
      seeds: ["time and attention loss", "impaired autonomy"],
      termInfo: {
        "interrupted task": {
          text: "The person's original activity is paused or displaced by a request serving the provider's objective.",
          link: "https://deceptive.design/types/nagging/"
        },
        "time and attention loss": {
          text: "Personal resources consumed by repeated prompts, unnecessary navigation, waiting, searching, or explaining a decision already made.",
          link: "https://deceptive.design/types/nagging/"
        },
        fatigue: {
          text: "Mental and emotional depletion produced by friction, repetition, confusion, or prolonged effort.",
          link: "https://deceptive.design/types/obstruction/"
        },
        "privacy loss": {
          text: "Personal information or permission surrendered because access was conditioned on disclosure rather than supported by freely chosen consent.",
          link: "https://deceptive.design/book/contents/chapter-20/"
        },
        "forced persistence": {
          text: "Continued enrollment, payment, permission, or participation caused by the burden of reversing it rather than a renewed desire to continue.",
          link: "https://deceptive.design/types/hard-to-cancel/"
        },
        "impaired autonomy": {
          text: "Reduced practical ability to pursue one's own goal, maintain a refusal, protect information, or leave an unwanted relationship.",
          link: "https://deceptive.design/book/contents/part-1/"
        }
      },
      info: {
        link: "https://deceptive.design/types/obstruction/"
      }
    }
  ],
  bridges: [
    {
      term: "conditional access",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact:
        "The provider places an additional action between the person and the service or feature they intended to use, turning access into leverage for registration, disclosure, installation, marketing, or payment authority.",
      idealTerms: ["access desired service", "create account"],
      info: {
        text: "Making one desired action contingent on another action selected by the provider.",
        link: "https://deceptive.design/types/forced-action/"
      }
    },
    {
      term: "asymmetric friction",
      clusters: [0, 2],
      relationKind: "contrast",
      direction: {
        kind: "through",
        from: 0,
        to: 2
      },
      fact:
        "The interface changes difficulty according to whose interests an action serves: joining, accepting, and sharing are streamlined, while declining, protecting privacy, and leaving encounter persistence or barriers.",
      idealTerms: ["end subscription", "hidden cancellation"],
      info: {
        text: "Unequal effort deliberately assigned to equivalent choices according to whether they benefit or disadvantage the provider.",
        link: "https://deceptive.design/types/hard-to-cancel/"
      }
    },
    {
      term: "resource depletion",
      clusters: [2, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 3
      },
      fact:
        "Repeated prompts and obstructive pathways consume time, attention, and patience until the person complies, gives up, or remains in a relationship they intended to change.",
      idealTerms: ["extra steps", "fatigue"],
      info: {
        text: "Using friction and interruption to exhaust the resources required to maintain refusal or complete an unwanted but legitimate exit.",
        link: "https://deceptive.design/book/contents/chapter-19/"
      }
    }
  ]
};
