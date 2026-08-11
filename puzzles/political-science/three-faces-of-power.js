// Generated from content/puzzles/three-faces-of-power.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "three-faces-of-power",
  "title": "Three Faces of Power",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Sociology"
  ],
  "info": {
    "text": "Steven Lukes' argument that power operates in three progressively less visible ways -- through decisions actually made, through control of which issues ever reach a decision, and through the shaping of what people want in the first place.",
    "link": "wiki:Steven Lukes"
  },
  "lenses": [
    {
      "id": "still-needs-a-conflict",
      "prompt": "Which of these still require some form of an actual or potential conflict of interest -- even a hidden one -- rather than being compatible with harmony and consent all the way down?",
      "explanation": "The one- and two-dimensional views never actually let go of conflict: Dahl's decision-making needs conflict to be observable, and Bachrach and Baratz's non-decision-making and mobilization of bias still presuppose a real, if suppressed, grievance sitting underneath the surface. Only Lukes' third dimension breaks with this entirely, allowing power to operate so completely that no conflict -- observable or latent -- exists to find.",
      "targets": [
        "observable conflict",
        "non-decision-making",
        "mobilization of bias"
      ],
      "reasons": {
        "mobilization of bias": "A community's norms may suppress a grievance, but the grievance is still there, underneath, to be suppressed.",
        "non-decision-making": "Still presupposes a real grievance that power works to keep off the agenda.",
        "observable conflict": "The first face's entire method depends on conflict being visible enough to study."
      }
    },
    {
      "id": "power-without-a-grievance",
      "prompt": "Which of these describe power operating so completely that the dominated party may not experience anything they would recognize as a grievance at all?",
      "explanation": "This is the heart of Lukes' radical claim, and its biggest controversy: real interests names something a person can be argued to have even if they do not recognize or want it, and shaping preferences and ideology both name mechanisms sophisticated enough to make sure the gap between those real interests and what someone actually wants never even registers as a grievance to begin with.",
      "targets": [
        "shaping preferences",
        "real interests",
        "ideology"
      ],
      "reasons": {
        "ideology": "The same mechanism Gramsci described: a worldview so thoroughly absorbed it no longer feels like anyone's particular interest.",
        "real interests": "A standard for judging domination that does not depend on the dominated party's own felt preferences.",
        "shaping preferences": "The mechanism itself: power exercised by forming what someone wants, rather than overriding what they already want."
      }
    }
  ],
  "clusters": [
    {
      "id": "decision-making-power",
      "name": "The First Face: Decision-Making",
      "color": "teal",
      "fact": "Robert Dahl's pluralist starting point: study power by watching concrete decisions where people's preferences visibly conflict, then simply ask who prevails. If there is no observable conflict, on this view, there is little reason to think anyone has power at all.",
      "terms": [
        "decision-making",
        "observable conflict",
        "who prevails",
        "policy preferences"
      ],
      "seeds": [
        "decision-making",
        "observable conflict"
      ],
      "info": {
        "text": "The pluralist, behavioral starting point for studying power: watch actual decisions, and infer power from who gets their way when preferences visibly conflict.",
        "link": "wiki:Robert Dahl"
      }
    },
    {
      "id": "non-decision-making-power",
      "name": "The Second Face: Non-Decision-Making",
      "color": "brown",
      "fact": "Bachrach and Baratz argued Dahl missed an entire second face: power exercised before any decision is ever made, by controlling which issues even reach the agenda. A community's whole set of institutional norms and procedures -- its mobilization of bias -- can keep a grievance from ever becoming a visible decision at all.",
      "terms": [
        "agenda-setting",
        "non-decision-making",
        "mobilization of bias"
      ],
      "seeds": [
        "agenda-setting",
        "non-decision-making"
      ],
      "info": {
        "text": "The second face of power: controlling which grievances ever reach the point of decision, rather than winning once they get there.",
        "citations": [
          {
            "title": "Power and Poverty: Theory and Practice",
            "author": "Peter Bachrach and Morton S. Baratz",
            "publisher": "Oxford University Press",
            "year": "1970"
          }
        ]
      }
    },
    {
      "id": "shaping-wants",
      "name": "The Third Face: Shaping Wants",
      "color": "magenta",
      "fact": "Lukes' own radical addition: the most effective form of power prevents conflict from arising in the first place, by shaping what people believe, want, or think is even possible -- so thoroughly that they may actively consent to arrangements that work against their own real interests, the same ideological mechanism Gramsci had already described.",
      "terms": [
        "shaping preferences",
        "latent conflict",
        "real interests"
      ],
      "seeds": [
        "shaping preferences",
        "latent conflict"
      ],
      "info": {
        "text": "Lukes' third and most radical face of power: shaping people's own wants and beliefs so thoroughly that no conflict, latent or otherwise, is left for anyone to notice.",
        "citations": [
          {
            "title": "Power: A Radical View",
            "author": "Steven Lukes",
            "publisher": "Palgrave Macmillan",
            "year": "2005"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-which-issues-arrive",
      "term": "which issues arrive",
      "clusters": [
        1,
        0
      ],
      "fact": "The two views share a decision-centered core: both still look for a conflict of interest, whether at the moment of decision itself or earlier, when non-decision-making determines which issues arrive on the agenda at all. Lukes calls this the second view's chief limitation -- it is only a qualified critique of the first, since it still requires a conflict someone could, in principle, observe.",
      "relationKind": "dynamic",
      "idealTerms": [
        "non-decision-making",
        "decision-making"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "bridge-ideology",
      "term": "ideology",
      "clusters": [
        1,
        2
      ],
      "fact": "Lukes' third dimension absorbs and radicalizes the second: mobilization of bias does not just keep issues off the agenda, it can shape people's very perceptions and preferences so effectively that the grievance never becomes a latent conflict in the first place -- the same ideological mechanism Gramsci had already described as manufacturing consent.",
      "relationKind": "dynamic",
      "idealTerms": [
        "mobilization of bias",
        "shaping preferences"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-invisibility",
      "term": "invisibility",
      "clusters": [
        0,
        2
      ],
      "fact": "Here is the sharpest disagreement in the whole debate: the one-dimensional view assumes that if there is no observable conflict, there is no reason to think power is at work, while Lukes insists the most complete form of power leaves no observable conflict whatsoever -- and may not even require the dominated party's own awareness that it exists.",
      "relationKind": "contrast"
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-11"
    }
  ]
});
