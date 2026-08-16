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
      ]
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
        "Diffusion of Responsibility",
        "War Crime Attribution"
      ],
      "seeds": [
        "Chain of Command",
        "Meaningful Human Control"
      ]
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
      ]
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
      "explanation": "Precision, safety, and oversight are each promised by name here -- and each is shown breaking down elsewhere on this board: the Riskless War Illusion cluster undercuts the first two, the Responsibility Gap cluster and its bridges undercut the second two. The lens crosses two clusters and a bridge to reveal one pattern underneath three separately named failures.",
      "targets": [
        "Surgical Strike",
        "Zero-Casualty Warfare",
        "Meaningful Human Control",
        "Human-in-the-Loop"
      ],
      "reasons": {
        "Human-in-the-Loop": "Names the safeguard that Target Verification's erosion, and this bridge itself, show breaking down.",
        "Meaningful Human Control": "Promises oversight that Diffusion of Responsibility shows eroding.",
        "Surgical Strike": "Promises precision that Circular Error Probable and Collateral Damage undercut.",
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
