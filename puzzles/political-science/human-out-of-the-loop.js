// Generated from content/puzzles/human-out-of-the-loop.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "human-out-of-the-loop",
  "title": "Human Out of the Loop",
  "category": "Political Science",
  "large": true,
  "info": {
    "text": "Algorithmic targeting compresses the kill chain into machine time, erodes the human checkpoints meant to catch error, and lets a doctrine of clean, riskless precision go unexamined even as it fails on its own terms."
  },
  "clusters": [
    {
      "id": "automated-kill-chain",
      "name": "The Automated Kill Chain",
      "color": "teal",
      "fact": "Scharre's central concern and Russell's Slaughterbots scenario converge on the same mechanism: compressing the find-fix-track-target-engage-assess cycle into machine time is what makes removing a human from the loop operationally attractive, not a side effect of it.",
      "terms": [
        "Sensor Fusion",
        "Target Recognition",
        "Algorithmic Combat Speed",
        "Facial-Recognition Targeting",
        "Micro-Drone Swarms"
      ],
      "seeds": [
        "Sensor Fusion",
        "Target Recognition"
      ],
      "termInfo": {
        "Algorithmic Combat Speed": {
          "text": "Compressing Boyd's observe-orient-decide-act decision cycle to act faster than an opponent -- the tempo argument automation is meant to win.",
          "link": "wiki:OODA loop"
        },
        "Facial-Recognition Targeting": {
          "text": "Matching a face captured by a sensor against a database, used here as the identification method in the Slaughterbots scenario.",
          "link": "wiki:Facial recognition system"
        },
        "Micro-Drone Swarms": {
          "text": "Coordinated, low-cost aerial units operating collectively -- the delivery mechanism Slaughterbots dramatizes for autonomous targeting at scale.",
          "link": "wiki:Swarm robotics"
        },
        "Sensor Fusion": {
          "text": "Combining data from multiple sensors so the resulting picture carries less uncertainty than any single sensor alone.",
          "link": "wiki:Sensor fusion"
        },
        "Target Recognition": {
          "text": "The technical process of classifying a sensed object as a valid target, whether by a human operator or an algorithm.",
          "link": "wiki:Automatic target recognition"
        }
      },
      "info": {
        "text": "The military targeting cycle -- find, fix, track, target, engage, assess -- that automation compresses from a human deliberation into machine time.",
        "link": "wiki:Kill chain (military)"
      }
    },
    {
      "id": "responsibility-gap",
      "name": "The Responsibility Gap",
      "color": "amber",
      "fact": "Sparrow's responsibility gap names a real structural failure: when a lethal decision is distributed across programmers, commanders, and machine behavior no one fully predicted, existing legal and moral frameworks for assigning blame stop finding a clear target.",
      "terms": [
        "Chain of Command",
        "Meaningful Human Control",
        "Algorithmic Decision-Making",
        "Programmer Liability",
        "War Crime Attribution"
      ],
      "seeds": [
        "Chain of Command",
        "Meaningful Human Control"
      ],
      "termInfo": {
        "Algorithmic Decision-Making": {
          "text": "The use of data, machines, and algorithms to make decisions with varying degrees of human oversight, across contexts from public administration to targeting.",
          "link": "wiki:Automated decision-making"
        },
        "Chain of Command": {
          "text": "The line of authority and responsibility along which orders and accountability pass within a military organization.",
          "link": "wiki:Command hierarchy"
        },
        "Meaningful Human Control": {
          "text": "Santoni de Sio and van den Hoven's principle that humans, not algorithms, should remain in control of -- and morally responsible for -- lethal decisions.",
          "link": "https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2018.00015/full"
        },
        "Programmer Liability": {
          "text": "One specific proposed locus of the responsibility gap: whether the person who wrote a targeting system's code can be held accountable for what it later does in combat. Human Rights Watch and Harvard's International Human Rights Clinic found programmers, manufacturers, and military personnel could all escape liability.",
          "link": "https://hls.harvard.edu/today/human-rights-clinic-releases-report-accountability-killer-robots"
        },
        "War Crime Attribution": {
          "text": "The legal process of establishing individual responsibility for a violation of the laws of war -- the process a responsibility gap disrupts.",
          "link": "wiki:War crime"
        }
      },
      "info": {
        "text": "The philosophical and legal problem of assigning blame when a lethal decision emerges from distributed human-machine systems no single actor fully controlled.",
        "link": "https://arxiv.org/pdf/2604.20868"
      }
    },
    {
      "id": "riskless-war-illusion",
      "name": "The Riskless War Illusion",
      "color": "blue",
      "fact": "Military law (Rogers), security-studies critiques of the Revolution in Military Affairs, and peace studies (Omar, citing the Stanford/NYU 'Living Under Drones' findings) converge independently on the same verdict: the promise of clean, riskless precision does not survive contact with what these weapons actually do in populated areas.",
      "terms": [
        "Surgical Strike",
        "Zero-Casualty Warfare",
        "Precision-Guided Munitions",
        "Circular Error Probable",
        "Collateral Damage"
      ],
      "seeds": [
        "Surgical Strike",
        "Zero-Casualty Warfare"
      ],
      "termInfo": {
        "Circular Error Probable": {
          "text": "A weapon system's precision, measured as the radius expected to contain half of all shots fired at a target.",
          "link": "wiki:Circular error probable"
        },
        "Collateral Damage": {
          "text": "Incidental harm to people or property not the intended target of an attack.",
          "link": "wiki:Collateral damage"
        },
        "Precision-Guided Munitions": {
          "text": "Weapons using guidance systems -- GPS, laser, or infrared -- to strike a designated target with far less margin of error than unguided munitions.",
          "link": "wiki:Precision-guided munition"
        },
        "Surgical Strike": {
          "text": "A military attack intended to damage only a specific target with minimal collateral damage.",
          "link": "wiki:Surgical strike"
        },
        "Zero-Casualty Warfare": {
          "text": "A.P.V. Rogers' own term for the doctrine of minimizing military and civilian casualties through precision technology and legal restraint.",
          "link": "https://international-review.icrc.org/sites/default/files/S1560775500075453a.pdf"
        }
      },
      "info": {
        "text": "Whether precision targeting and a doctrine of 'zero-casualty' warfare deliver on their own promise of clean, low-risk conflict.",
        "link": "https://international-review.icrc.org/sites/default/files/S1560775500075453a.pdf"
      }
    }
  ],
  "bridges": [
    {
      "id": "target-verification",
      "term": "Target Verification",
      "clusters": [
        2,
        1
      ],
      "fact": "Rogers treats target verification as the safeguard that makes precision claims legally meaningful; as verification is delegated to sensors and algorithms, the accountability that verification was supposed to anchor goes with it.",
      "info": {
        "text": "The legal requirement, discussed at length by Rogers, to confirm a target is a legitimate military objective before an attack -- the human judgment automation is displacing.",
        "link": "https://international-review.icrc.org/sites/default/files/S1560775500075453a.pdf"
      },
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 1
      }
    },
    {
      "id": "human-in-the-loop",
      "term": "Human-in-the-Loop",
      "clusters": [
        0,
        1
      ],
      "fact": "Removing meaningful human judgment from the kill chain isn't a parallel problem to the responsibility gap -- it's what produces it. Every stage automated out of human hands is a stage no longer anchoring accountability to a person.",
      "info": {
        "text": "Design and policy language for keeping a human decision-maker inside an otherwise automated process.",
        "link": "wiki:Human-in-the-loop"
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Algorithmic Combat Speed",
        "Chain of Command"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "signature-strike",
      "term": "Signature Strike",
      "clusters": [
        0,
        2
      ],
      "fact": "A signature strike targets a pattern of behavior rather than a confirmed identity -- the automated kill chain's own logic of speed and pattern-matching, applied exactly where it collides with the individualized verification a precision claim requires.",
      "info": {
        "text": "A strike where the target's identity is unknown but their observed 'pattern of life' is taken to indicate involvement in militant activity.",
        "link": "https://www.thebureauinvestigates.com/explainers/glossary-of-drone-warfare"
      },
      "relationKind": "contrast",
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "targeting-technology-components",
      "prompt": "Which concepts name a specific technical component or process inside an automated targeting system, rather than the broader effect that component produces?",
      "explanation": "These four name discrete pieces of the targeting pipeline. Excluding Algorithmic Combat Speed keeps the lens on the components themselves, not on the emergent effect of chaining them together.",
      "targets": [
        "Sensor Fusion",
        "Target Recognition",
        "Facial-Recognition Targeting",
        "Micro-Drone Swarms"
      ],
      "reasons": {
        "Facial-Recognition Targeting": "A concrete identification method built into the pipeline, drawn directly from the Slaughterbots scenario.",
        "Micro-Drone Swarms": "A deployed hardware/software system, not a resulting capability.",
        "Sensor Fusion": "Combines multiple sensor inputs into a single targeting picture -- a data-processing component, not the decision it feeds.",
        "Target Recognition": "The specific software function that classifies a sensed object as a valid target."
      }
    },
    {
      "id": "safeguards-under-pressure",
      "prompt": "Which concepts name a checkpoint, actor, or practice meant to catch a targeting error before lethal force is used -- the safeguards this puzzle's own bridges show eroding as speed and automation increase?",
      "explanation": "Each of these names a point where human judgment was meant to intervene before harm occurred. The automated-kill-chain to responsibility-gap bridge (Human-in-the-Loop) and the riskless-war-illusion to responsibility-gap bridge (Target Verification) each trace how increasing speed and automation erode a specific safeguard rather than removing accountability all at once.",
      "targets": [
        "Target Verification",
        "Human-in-the-Loop",
        "Meaningful Human Control",
        "Chain of Command"
      ],
      "reasons": {
        "Chain of Command": "The traditional structure that target verification and meaningful human control were meant to run through.",
        "Human-in-the-Loop": "This bridge's subject; names exactly the safeguard combat speed pressures out.",
        "Meaningful Human Control": "Russell's own standard for the oversight a lethal decision is supposed to require.",
        "Target Verification": "Rogers' own procedural safeguard, explicitly this bridge's subject."
      }
    },
    {
      "id": "the-broken-promise",
      "prompt": "Which concepts name a specific reassurance about safety or control that this puzzle's own evidence shows failing to hold?",
      "explanation": "Precision, safety, and oversight are each promised by name here -- and each is shown breaking down elsewhere on this board: the Riskless War Illusion cluster undercuts the first two, the Responsibility Gap cluster and both of its bridges undercut the rest. The lens deliberately draws a fifth target, Target Verification, alongside the other four, because this puzzle's own bridge facts already name its erosion as part of the same pattern -- leaving it out to match a round number would have been the wrong reason to exclude it.",
      "targets": [
        "Surgical Strike",
        "Zero-Casualty Warfare",
        "Meaningful Human Control",
        "Human-in-the-Loop",
        "Target Verification"
      ],
      "reasons": {
        "Human-in-the-Loop": "Names the safeguard that Target Verification's erosion, and this bridge itself, show breaking down.",
        "Meaningful Human Control": "Promises oversight that this puzzle's own accountability terms show eroding.",
        "Surgical Strike": "Promises precision that Circular Error Probable and Collateral Damage undercut.",
        "Target Verification": "Rogers' own safeguard; the B-C bridge shows exactly how its erosion breaks the promise of legally meaningful precision.",
        "Zero-Casualty Warfare": "Names the doctrine this puzzle's own sourcing (Rogers, Kahn, Omar) shows failing in practice."
      }
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "date": "2026-08-15"
    }
  ]
});
