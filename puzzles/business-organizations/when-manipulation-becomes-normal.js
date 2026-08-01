// Concept Clusters puzzle: When Manipulation Becomes Normal
// Dark Patterns sequence drafted July 2026 from organizational sociology,
// behavioral business ethics, consumer policy, and dark-pattern research.

export default {
  id: "when-manipulation-becomes-normal",
  title: "When Manipulation Becomes Normal",
  category: "Business & Organizations",
  large: true,
  info: {
    text:
      "How strategic targets, experimentation, incentives, and organizational routines can turn an initially questionable tactic into standard practice, while distributing responsibility and eroding trust. Normalization of deviance is used here as an organizational lens, not to equate dark patterns with safety disasters.",
    link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop",
    extraLink: "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
  },
  lenses: [
    {
      id: "metric-becomes-mandate",
      prompt: "Which concepts show a business metric becoming an organizational mandate?",
      targets: [
        "conversion target",
        "executive compensation",
        "KPI cascade",
        "winning variant",
        "rapid rollout"
      ],
      explanation:
        "A metric becomes a mandate when leaders define success numerically, attach rewards to it, and cascade it through teams. An experiment that improves the chosen number can then move rapidly from local evidence to an expected operating baseline, even when the measurement omits harm to users.",
      reasons: {
        "conversion target": "A selected outcome becomes the visible definition of success.",
        "executive compensation": "Personal rewards can intensify pressure to achieve the target and protect gains.",
        "KPI cascade": "The strategic objective is translated into subordinate goals for product, design, marketing, and engineering teams.",
        "winning variant": "The design is treated as superior because it performs better on the chosen metric.",
        "rapid rollout": "Once the result is accepted, deployment can outpace broader ethical review or learning from complaints."
      }
    },
    {
      id: "no-immediate-disaster",
      prompt: "Which concepts show how questionable practice can become normal without an immediate crisis?",
      targets: [
        "A/B experiment",
        "winning variant",
        "tolerated complaint rate",
        "successful precedent",
        "ethical fading",
        "normalization of deviance"
      ],
      explanation:
        "A questionable practice may become normalized because each use appears successful and produces no immediately decisive failure. Favorable metrics, survivable complaints, and repeated precedent gradually redefine the practice as ordinary, while its ethical meaning fades behind operational language.",
      reasons: {
        "A/B experiment": "The practice enters as a bounded test rather than an announced change in ethical standards.",
        "winning variant": "Short-term performance supplies evidence for continuing the practice.",
        "tolerated complaint rate": "Complaints are treated as an acceptable operating cost rather than a signal that the design may be wrongful.",
        "successful precedent": "Earlier deployment without decisive sanction makes repetition easier to justify.",
        "ethical fading": "The decision is framed as optimization, growth, or retention, causing its moral dimensions to recede.",
        "normalization of deviance": "Repeated departures from an expected norm become accepted as normal after apparent success."
      }
    },
    {
      id: "distributed-work-unequal-responsibility",
      prompt: "Which concepts show distributed work without equal responsibility?",
      targets: [
        "board oversight",
        "executive compensation",
        "KPI cascade",
        "responsibility diffusion",
        "employee ethical strain",
        "regulatory exposure"
      ],
      explanation:
        "Many people may contribute to a dark pattern, but responsibility is not evenly distributed. Those who set priorities, control incentives, receive the largest benefits, possess broader information, and have greater authority to intervene bear greater responsibility than workers implementing a narrowly assigned task.",
      reasons: {
        "board oversight": "Boards possess governance authority over strategy, risk, executive incentives, and organizational conduct.",
        "executive compensation": "Senior leaders may benefit directly from targets that reward manipulation while shaping the conditions under which others work.",
        "KPI cascade": "Teams inherit goals defined higher in the organization and may have limited power to revise them.",
        "responsibility diffusion": "Divided roles can make each participant feel that final responsibility belongs elsewhere.",
        "employee ethical strain": "Workers may experience conflict between professional judgment, personal values, job security, and assigned objectives.",
        "regulatory exposure": "The organization remains accountable even when the disputed practice emerged through many distributed decisions."
      }
    },
    {
      id: "private-gain-shared-loss",
      prompt: "Which concepts show private gains producing shared losses?",
      targets: [
        "retention target",
        "winning variant",
        "competitor imitation",
        "erosion of trust",
        "customer distrust",
        "market-wide distrust"
      ],
      explanation:
        "One firm can capture the immediate gain from higher retention or conversion while distrust spreads beyond the original interaction. Competitors may imitate the successful tactic, and users may begin treating ordinary interface signals across the market as potentially adversarial.",
      reasons: {
        "retention target": "The provider receives a measurable benefit when more users remain enrolled or engaged.",
        "winning variant": "The local performance gain encourages continued use and provides a model others may copy.",
        "competitor imitation": "A successful tactic can spread as firms try to avoid a perceived competitive disadvantage.",
        "erosion of trust": "Repeated manipulation weakens confidence that businesses will represent choices honestly.",
        "customer distrust": "The originating firm loses credibility with the people it directly affected.",
        "market-wide distrust": "Suspicion can generalize to honest providers and reduce confidence in digital commerce more broadly."
      }
    }
  ],
  clusters: [
    {
      name: "Strategic incentives",
      color: "teal",
      fact:
        "Organizations define what counts as success through targets, rewards, and oversight. Those choices determine which outcomes become visible, whose interests are prioritized, and what pressures flow downward.",
      terms: [
        "conversion target",
        "retention target",
        "data growth target",
        "executive compensation",
        "board oversight"
      ],
      seeds: ["conversion target", "board oversight"],
      termInfo: {
        "conversion target": {
          text: "A goal for increasing the share of users who purchase, subscribe, consent, register, or complete another provider-valued action.",
          link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
        },
        "retention target": {
          text: "A goal for keeping users enrolled, engaged, paying, or active, sometimes without distinguishing willing continuation from persistence produced by friction.",
          link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
        },
        "data growth target": {
          text: "A goal for increasing the volume, scope, or reuse of personal and behavioral data collected from users.",
          link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
        },
        "executive compensation": {
          text: "Pay, bonuses, equity, or advancement linked to organizational performance measures that can intensify pressure to achieve selected outcomes.",
          link: "https://doi.org/10.5465/ambpp.2007.26533588"
        },
        "board oversight": {
          text: "The governing responsibility to supervise strategy, risk, executive incentives, and whether organizational conduct remains consistent with legal and ethical obligations.",
          link: "https://doi.org/10.1023/A:1025992813613"
        }
      },
      info: {
        link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
      }
    },
    {
      name: "Optimization machinery",
      color: "blue",
      fact:
        "Strategic goals become operational through dashboards, experiments, cascading KPIs, and rollout processes that can select effective behavior without asking whether the behavior should be produced.",
      terms: [
        "analytics dashboard",
        "A/B experiment",
        "winning variant",
        "KPI cascade",
        "rapid rollout"
      ],
      seeds: ["analytics dashboard", "A/B experiment"],
      termInfo: {
        "analytics dashboard": {
          text: "A display that makes selected outcomes continuously visible while leaving unmeasured harms or externalities comparatively obscure.",
          link: "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers"
        },
        "A/B experiment": {
          text: "A controlled comparison of interface variants used to determine which version produces more of a selected user behavior.",
          link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
        },
        "winning variant": {
          text: "The version judged superior because it improves the chosen metric, whether or not the evaluation captures autonomy, comprehension, trust, or longer-term harm.",
          link: "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-takes-action-stop-credit-karma-tricking-consumers-allegedly-false-pre-approved-credit-offers"
        },
        "KPI cascade": {
          text: "The translation of high-level targets into linked performance indicators for business units, teams, and individual roles.",
          link: "https://doi.org/10.5465/ambpp.2007.26533588"
        },
        "rapid rollout": {
          text: "Expanding a locally successful design across products, populations, or markets before slower evidence about complaints, trust, or cumulative harm is fully considered.",
          link: "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers"
        }
      },
      info: {
        link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
      }
    },
    {
      name: "Organizational normalization",
      color: "amber",
      fact:
        "Repeated performance gains, survivable complaints, prior precedent, competitor behavior, and divided roles can gradually make a questionable tactic feel routine rather than exceptional.",
      terms: [
        "tolerated complaint rate",
        "successful precedent",
        "ethical fading",
        "competitor imitation",
        "responsibility diffusion"
      ],
      seeds: ["successful precedent", "responsibility diffusion"],
      termInfo: {
        "tolerated complaint rate": {
          text: "A level of user objection treated as an acceptable cost of achieving business targets rather than a reason to reconsider the practice.",
          link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
        },
        "successful precedent": {
          text: "An earlier deployment interpreted as validation because it improved performance and did not trigger a decisive internal, legal, or market response.",
          link: "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
        },
        "ethical fading": {
          text: "A process in which the moral dimensions of a decision recede as the situation is framed primarily in operational, competitive, or financial terms.",
          link: "https://doi.org/10.1023/B:SORE.0000027411.35832.53"
        },
        "competitor imitation": {
          text: "Adoption of a tactic because rival firms use it successfully, making restraint appear commercially disadvantageous or unusually demanding.",
          link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
        },
        "responsibility diffusion": {
          text: "The weakening of felt accountability when strategy, research, design, implementation, approval, and deployment are divided among many people and units.",
          link: "https://doi.org/10.1023/A:1025992813613"
        }
      },
      info: {
        link: "https://doi.org/10.1023/B:SORE.0000027411.35832.53"
      }
    },
    {
      name: "Business and market consequences",
      color: "magenta",
      fact:
        "Manipulative practices can damage relationships inside and outside the firm through customer distrust, employee ethical strain, reputational harm, regulatory exposure, and suspicion that spreads across the wider market.",
      terms: [
        "customer distrust",
        "employee ethical strain",
        "reputational damage",
        "regulatory exposure",
        "market-wide distrust"
      ],
      seeds: ["customer distrust", "employee ethical strain"],
      termInfo: {
        "customer distrust": {
          text: "Reduced confidence that a provider's prices, claims, controls, and disclosures can be relied upon without defensive verification.",
          link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
        },
        "employee ethical strain": {
          text: "Conflict or distress experienced when organizational expectations pressure workers to act against professional judgment or personal ethical commitments.",
          link: "https://pure.psu.edu/en/publications/the-dark-patterns-side-of-ux-design/"
        },
        "reputational damage": {
          text: "Loss of public credibility and goodwill after customers, employees, journalists, or advocates identify manipulative conduct.",
          link: "https://www.oecd.org/en/publications/dark-commercial-patterns_44f5e846-en.html"
        },
        "regulatory exposure": {
          text: "Risk of investigation, orders, redress, penalties, or litigation when manipulative design is judged deceptive, unfair, or otherwise unlawful.",
          link: "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-takes-action-stop-credit-karma-tricking-consumers-allegedly-false-pre-approved-credit-offers"
        },
        "market-wide distrust": {
          text: "Generalized suspicion that burdens honest providers and weakens confidence and competition across digital markets.",
          link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
        }
      },
      info: {
        link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
      }
    }
  ],
  bridges: [
    {
      term: "authorized priorities",
      clusters: [0, 1],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 0,
        to: 1
      },
      fact:
        "Targets, incentives, and governance choices authorize what the optimization system should pursue, determining which user behaviors become experimental objectives and performance evidence.",
      idealTerms: ["conversion target", "A/B experiment"],
      info: {
        text: "Strategic choices translated into operational permission and pressure to optimize selected outcomes.",
        link: "https://www.ftc.gov/news-events/events/2021/04/bringing-dark-patterns-light-ftc-workshop"
      }
    },
    {
      term: "normalization of deviance",
      clusters: [1, 2],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 1,
        to: 2
      },
      fact:
        "When experimental departures from expected standards repeatedly improve metrics without producing an immediately decisive failure, they can become accepted precedent and eventually routine practice.",
      idealTerms: ["winning variant", "successful precedent"],
      info: {
        text: "Diane Vaughan's term for an organizational process in which repeated departures from an expected norm become accepted as normal. Its use here is an analytical transfer, not an equivalence between dark patterns and catastrophic safety failures.",
        link: "https://press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html"
      }
    },
    {
      term: "erosion of trust",
      clusters: [2, 3],
      relationKind: "dynamic",
      direction: {
        kind: "through",
        from: 2,
        to: 3
      },
      fact:
        "As manipulative practices become routine and spread across firms, customers learn to treat ordinary commercial signals as potentially adversarial, weakening confidence in both the provider and the wider market.",
      idealTerms: ["competitor imitation", "market-wide distrust"],
      info: {
        text: "The gradual weakening of confidence that organizations and markets will represent choices honestly and respect people's interests.",
        link: "https://www.oecd.org/en/topics/sub-issues/dark-commercial-patterns.html"
      }
    }
  ]
};
