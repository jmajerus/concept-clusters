// Generated from content/puzzles/the-groups-other-task.ccpuzzle.json.
// Edit the canonical source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-groups-other-task",
  "title": "The Group's Other Task",
  "category": "Business & Organizations",
  "categories": [
    "Business & Organizations",
    "Psychology"
  ],
  "large": true,
  "tags": [
    "book",
    "psychodynamics"
  ],
  "info": {
    "citations": [
      {
        "author": "W. R. Bion",
        "publisher": "Tavistock Publications",
        "title": "Experiences in Groups: And Other Papers",
        "year": "1961"
      }
    ],
    "link": "https://www.csudh.edu/Assets/csudh-sites/group-relations/documents/recommended-reading/Tavistock%20Primer%20II.pdf",
    "text": "Wilfred Bion's claim that every working group is shadowed by an unconscious one -- reacting to a shared fantasy of rescue, threat, or salvation instead of pursuing its actual task."
  },
  "lenses": [
    {
      "explanation": "Each basic assumption hands the group's actual working capacity to some other figure: dependency to an idealized leader, fight-flight to an enemy that must be fought or fled, and pairing to a leader or idea not yet born. The work group, by contrast, relies on its own reality-tested effort -- it has no such figure to hand things to.",
      "id": "displaced-rescuer",
      "prompt": "Which concepts locate the group's rescue or survival in some figure outside its own working capacity?",
      "reasons": {
        "enemy": "Fight-flight's rescuer, in a sense: survival is secured by defeating or evading this figure rather than by the group's own work.",
        "idealized leader": "Dependency's rescuer: a leader granted powers no real person has.",
        "unborn leader": "Pairing's rescuer: not yet arrived, and valuable partly because it hasn't."
      },
      "targets": [
        "idealized leader",
        "enemy",
        "unborn leader"
      ]
    },
    {
      "explanation": "No real leader can supply the total protection dependency demands, so disappointed groups tend to replace leaders rather than abandon the assumption. No rescuing idea is ever finally born in pairing, so the hope simply resets. And if fight-flight's actual enemy is ever defeated, the group is liable to manufacture a substitute -- a scapegoat -- rather than give up the assumption itself. Each basic assumption is structured to reproduce the conditions for its own return.",
      "id": "self-perpetuating-fantasy",
      "prompt": "Which concepts describe a basic-assumption fantasy that can never actually be fulfilled, so the group keeps returning to the same basic assumption?",
      "reasons": {
        "idealized leader": "Impossible to satisfy, so the group replaces leaders rather than the assumption.",
        "scapegoat": "Manufactured once a real enemy is gone, keeping fight-flight running on nothing actually external.",
        "unborn leader": "Perpetually not-yet-arrived, so hope never has to be tested against an actual arrival."
      },
      "targets": [
        "idealized leader",
        "scapegoat",
        "unborn leader"
      ]
    }
  ],
  "clusters": [
    {
      "id": "cluster-work-group",
      "name": "The Work Group",
      "color": "teal",
      "fact": "Bion's work group is the mode in which a group actually pursues its stated task: members cooperate around a common purpose, test their ideas against outcomes, and revise course when experience contradicts them. It's the group's rational state -- and, in Bion's view, never the whole story, since every real group also carries the unconscious life the rest of this board describes.",
      "terms": [
        "cooperation",
        "reality testing",
        "common purpose",
        "learning from experience"
      ],
      "seeds": [
        "cooperation",
        "reality testing"
      ],
      "termInfo": {
        "reality testing": "Checking a belief or plan against actual outcomes rather than against how satisfying it feels -- the capacity Bion treats as the work group's defining strength."
      },
      "info": {
        "text": "The rational, task-oriented mode of group functioning -- always present alongside, and often crowded out by, the unconscious basic-assumption life this puzzle explores."
      }
    },
    {
      "id": "cluster-dependency",
      "name": "Dependency",
      "color": "amber",
      "fact": "In dependency (baD), the group behaves as though it exists to be sustained and protected by an all-capable leader, growing passive and helpless while investing that leader with a competence no real person can supply. When the leader inevitably fails to deliver, the group doesn't abandon the assumption -- it typically just looks for a new leader to disappoint it the same way.",
      "terms": [
        "dependency",
        "idealized leader",
        "passivity",
        "helplessness"
      ],
      "seeds": [
        "dependency",
        "passivity"
      ],
      "termInfo": {
        "idealized leader": "The figure the group treats as capable of solving everything, regardless of that person's actual skill or authority -- a role assigned by the group's anxiety, not earned by demonstrated competence."
      },
      "info": {
        "text": "The basic assumption in which a group organizes itself around being cared for and rescued by a leader, rather than around its actual task."
      }
    },
    {
      "id": "cluster-fight-flight",
      "name": "Fight-Flight",
      "color": "magenta",
      "fact": "Fight-flight (baF) organizes the group around a threat: attack it or flee it, but either way treat the enemy -- real, exaggerated, or manufactured as a scapegoat when no real one is at hand -- as the reason the group exists. It mobilizes real energy and real cohesion, which is exactly what makes it so easy to mistake for the work group doing its job.",
      "terms": [
        "fight-flight",
        "scapegoat",
        "self-preservation",
        "enemy"
      ],
      "seeds": [
        "fight-flight",
        "scapegoat"
      ],
      "termInfo": {
        "scapegoat": "A member singled out to stand in for the enemy fight-flight needs, produced by the group itself when no real external threat is available to organize around."
      },
      "info": {
        "text": "The basic assumption in which a group organizes itself around a threat to fight or flee, treating self-preservation as its whole reason for existing."
      }
    },
    {
      "id": "cluster-pairing",
      "name": "Pairing",
      "color": "blue",
      "fact": "Pairing (baP) invests hope in two members whose union -- a project, an idea, a romance, it hardly matters which -- will supposedly produce a leader or a solution not yet born. The group settles into an air of expectant optimism, and because the rescuer is always still on the way, it never actually has to reckon with the problem sitting in front of it.",
      "terms": [
        "pairing",
        "unborn leader",
        "hopeful expectation",
        "avoidance of the present"
      ],
      "seeds": [
        "pairing",
        "hopeful expectation"
      ],
      "termInfo": {
        "unborn leader": "The figure or idea pairing expects to arrive and resolve everything -- powerful precisely because it hasn't appeared yet and so can't yet disappoint anyone, unlike a leader dependency has already installed."
      },
      "info": {
        "text": "The basic assumption in which a group invests its hope in a future rescuer or idea not yet arrived, rather than in anything it could act on now."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-leader",
      "term": "leader",
      "clusters": [
        0,
        1
      ],
      "fact": "In the work group, a leader's standing rests on demonstrated skill and stays open to correction; in dependency the group instead grants whichever leader it has god-like power to solve everything, a burden no real person can carry for long.",
      "relationKind": "contrast",
      "info": {
        "text": "Who the group looks to, and on what basis it grants them authority."
      },
      "idealTerms": [
        "reality testing",
        "idealized leader"
      ]
    },
    {
      "id": "bridge-hope",
      "term": "hope",
      "clusters": [
        1,
        3
      ],
      "fact": "Both assumptions organize the group around rescue, but place it at a different point in time: dependency invests hope in a leader already present, while pairing displaces that same hope onto a leader or idea that has not yet arrived.",
      "relationKind": "contrast",
      "info": {
        "text": "What the group is actually counting on to save it, whether or not that figure has shown up yet."
      },
      "idealTerms": [
        "idealized leader",
        "unborn leader"
      ]
    },
    {
      "id": "bridge-action",
      "term": "action",
      "clusters": [
        0,
        2
      ],
      "fact": "Work-group action follows reflection and is corrected by its outcomes; fight-flight produces plenty of activity but none of that reflection, discharging anxiety through attack or retreat rather than thought.",
      "relationKind": "contrast",
      "info": {
        "text": "What the group actually does, and whether that doing is tested against reality or just discharges tension."
      },
      "idealTerms": [
        "learning from experience",
        "self-preservation"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-08",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    },
    {
      "date": "2026-08-08",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "lenses",
      "system": "Claude"
    }
  ]
});
