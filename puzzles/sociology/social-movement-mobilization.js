// Generated from content/puzzles/social-movement-mobilization.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "social-movement-mobilization",
  "title": "How Social Movements Mobilize",
  "category": "sociology",
  "subcategories": {
    "sociology": "social-change"
  },
  "info": {
    "text": "Social movements sustain public campaigns through organizing, shared interpretations, and collective claim-making, while political context shapes the openings and constraints they face.",
    "citations": [
      {
        "title": "Resource Mobilization Theory and the Study of Social Movements",
        "author": "J. Craig Jenkins",
        "publisher": "Annual Review of Sociology",
        "year": "1983",
        "pages": "527-553",
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev.so.09.080183.002523"
      },
      {
        "title": "Introduction: Opportunities, Mobilizing Structures, and Framing Processes",
        "author": "Doug McAdam, John D. McCarthy, and Mayer N. Zald",
        "publisher": "Cambridge University Press",
        "year": "1996",
        "pages": "1-20",
        "url": "https://www.cambridge.org/core/books/abs/comparative-perspectives-on-social-movements/introduction-opportunities-mobilizing-structures-and-framing-processes-toward-a-synthetic-comparative-perspective-on-social-movements/B99CB038F6DEB73CD42DAEE0065AFB69"
      },
      {
        "title": "Framing Processes and Social Movements: An Overview and Assessment",
        "author": "Robert D. Benford and David A. Snow",
        "publisher": "Annual Review of Sociology",
        "year": "2000",
        "pages": "611-639",
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev.soc.26.1.611"
      },
      {
        "title": "Protest and Political Opportunities",
        "author": "David S. Meyer",
        "publisher": "Annual Review of Sociology",
        "year": "2004",
        "pages": "125-145",
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev.soc.30.012703.110545"
      },
      {
        "title": "Mobilizing Structures and Contentious Politics",
        "author": "Sidney Tarrow",
        "publisher": "Cambridge University Press",
        "year": "1998",
        "pages": "123-138",
        "url": "https://www.cambridge.org/core/books/abs/power-in-movement/mobilizing-structures-and-contentious-politics/0976B577118EF138D07B3503AE339417"
      },
      {
        "title": "Movimentos sociais como política (Social Movements as Politics)",
        "author": "Charles Tilly",
        "publisher": "Revista Brasileira de Ciência Política",
        "year": "2010",
        "pages": "133-160",
        "url": "https://periodicos.unb.br/index.php/rbcp/article/view/1677"
      }
    ]
  },
  "clusters": [
    {
      "id": "mobilizing-structures",
      "name": "Mobilizing Structures",
      "color": "teal",
      "fact": "Mobilizing structures are the networks and organizations through which participants coordinate, recruit, and sustain action; resource mobilization studies how movements acquire and combine the means to act. Formal organizations are one option, not a prerequisite.",
      "terms": [
        "social movement organization",
        "grassroots network",
        "mobilizing structures",
        "resource mobilization",
        "recruitment network",
        "free-rider problem"
      ],
      "seeds": [
        "social movement organization",
        "grassroots network"
      ],
      "termInfo": {
        "mobilizing structures": "The networks and organizations through which people coordinate collective action; they can be formal or informal.",
        "resource mobilization": "A perspective that studies how movements acquire and coordinate the resources needed for collective action, beyond the presence of grievance alone.",
        "social movement organization": "A formal organization that pursues movement goals; it is one possible part of a movement, not the movement as a whole.",
        "grassroots network": "Locally rooted and often informal ties through which participants communicate, organize, and recruit.",
        "recruitment network": "Existing social ties that help people learn about a movement and consider participating.",
        "free-rider problem": "The collective-action problem in which someone can benefit from a shared outcome without contributing; selective incentives are one debated response."
      },
      "info": "Resources matter, but organized action can travel through formal organizations, local groups, and informal ties."
    },
    {
      "id": "political-opportunities",
      "name": "Political Opportunities",
      "color": "blue",
      "fact": "A political opportunity structure describes aspects of the context that shape movement openings or constraints: allies or divisions among elites, access to decision-making, and repression. Scholars disagree about the best indicators, so these factors do not predict success mechanically.",
      "terms": [
        "elite allies",
        "state repression",
        "political opportunity structure",
        "elite divisions",
        "institutional access"
      ],
      "seeds": [
        "elite allies",
        "state repression"
      ],
      "termInfo": {
        "political opportunity structure": "A framework for analyzing how political context shapes the openings and constraints movements face; scholars disagree about which features belong in it.",
        "elite allies": "Powerful insiders willing to support a movement's claims or help them gain access.",
        "elite divisions": "Visible splits among decision-makers that can create openings for challengers, depending on the setting.",
        "institutional access": "Routes through which claimants can influence formal decisions, such as hearings, parties, courts, or officials.",
        "state repression": "Use or threat of state coercion to restrict protest or organization; it can deter or reshape mobilization."
      }
    },
    {
      "id": "collective-action-framing",
      "name": "Collective-Action Framing",
      "color": "amber",
      "fact": "Collective-action framing gives a movement's account of what is wrong, what should be done, and why people should act; a shared identity and perceived fit with an audience can make that account meaningful.",
      "terms": [
        "diagnostic framing",
        "collective identity",
        "prognostic framing",
        "motivational framing",
        "frame resonance"
      ],
      "seeds": [
        "diagnostic framing",
        "collective identity"
      ],
      "termInfo": {
        "diagnostic framing": "Identifies a problem and offers an account of what or who produced it.",
        "prognostic framing": "Proposes a response, strategy, or solution to the diagnosed problem.",
        "motivational framing": "Gives people a reason or call to take action.",
        "collective identity": "A shared sense of who “we” are among participants or the people a movement claims to represent.",
        "frame resonance": "The perceived credibility and relevance of a movement's framing to an audience; resonance varies across groups and contexts."
      }
    },
    {
      "id": "public-claim-making",
      "name": "Public Claim-Making",
      "color": "magenta",
      "fact": "Repertoires of contention are historically situated forms of collective claim-making. A petition drive, public demonstration, or boycott can make a claim visible; WUNC displays describe how participants publicly represent worthiness, unity, numbers, and commitment.",
      "terms": [
        "petition drive",
        "public demonstration",
        "repertoire of contention",
        "boycott",
        "WUNC display"
      ],
      "seeds": [
        "petition drive",
        "public demonstration"
      ],
      "termInfo": {
        "repertoire of contention": "The historically and politically situated forms of public collective claim-making that people know and use.",
        "petition drive": "A coordinated effort to gather signatures and present a collective request or demand.",
        "public demonstration": "A visible gathering that presents support, opposition, or a claim before an audience.",
        "boycott": "A coordinated refusal to buy, use, or participate as a way of applying pressure.",
        "WUNC display": "A public display of worthiness, unity, numbers, and commitment; an analytic description, not a score that predicts success."
      },
      "info": "A movement's repertoire is learned and context-bound, not a universal menu of tactics."
    }
  ],
  "bridges": [
    {
      "id": "frame-alignment",
      "term": "frame alignment",
      "clusters": [
        2,
        0
      ],
      "fact": "Frame alignment links a movement's claims to potential participants' experiences, values, or identities. It can support resonance and connect interpretive work with the recruitment networks and organizations that carry action.",
      "info": "A linking process between a movement's interpretive frame and the concerns or identities of potential participants.",
      "relationKind": "dynamic",
      "idealTerms": [
        "collective identity",
        "recruitment network"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "social-movement-campaign",
      "term": "social movement campaign",
      "clusters": [
        0,
        3
      ],
      "fact": "A social movement campaign is a sustained public effort to make collective demands; it links mobilizing structures to a changing sequence of public claim-making performances rather than one isolated event.",
      "relationKind": "dynamic",
      "idealTerms": [
        "resource mobilization",
        "repertoire of contention"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 3
      }
    },
    {
      "id": "contentious-politics",
      "term": "contentious politics",
      "clusters": [
        1,
        3
      ],
      "fact": "Contentious politics is collective claim-making involving authorities or other power holders. Political access, allies, divisions, and repression shape its available forms and risks, while contention may also alter the context.",
      "info": "Collective claims and responses that involve authorities or other power holders, often outside routine political channels.",
      "relationKind": "dynamic",
      "idealTerms": [
        "political opportunity structure",
        "public demonstration"
      ],
      "direction": {
        "kind": "bidirectional"
      }
    }
  ],
  "lenses": [
    {
      "id": "framing-tasks",
      "prompt": "Which framing tasks respectively name a problem, propose a response, and urge participation?",
      "explanation": "Diagnostic framing identifies the problem and assigns responsibility; prognostic framing proposes a response; motivational framing gives people a reason to act. These tasks often appear together in real movement communication.",
      "targets": [
        "diagnostic framing",
        "prognostic framing",
        "motivational framing"
      ],
      "reasons": {
        "diagnostic framing": "Names the problem and how it arose.",
        "prognostic framing": "Proposes a strategy or solution.",
        "motivational framing": "Calls people to take action."
      }
    },
    {
      "id": "concrete-repertoire-actions",
      "prompt": "Which terms name concrete repertoire actions: gathering signatures, assembling publicly, or refusing to buy or participate?",
      "explanation": "Petitions, demonstrations, and boycotts are recognizable action forms. A repertoire is the wider context-bound set that movements draw from, while WUNC describes public signals rather than a specific tactic.",
      "targets": [
        "petition drive",
        "public demonstration",
        "boycott"
      ],
      "reasons": {
        "petition drive": "It gathers signatures around a shared request or demand.",
        "public demonstration": "It assembles participants visibly before an audience.",
        "boycott": "It withdraws participation or purchases to apply pressure."
      }
    },
    {
      "id": "political-context",
      "prompt": "Which terms name specific political openings: backing from an insider, divisions among decision-makers, or a route into a formal decision?",
      "explanation": "These are concrete, possible openings: elite allies can support claims, divisions may weaken opposition, and institutional access supplies a formal route. Political opportunity structure is the wider framework; state repression is a constraint. None guarantees success.",
      "targets": [
        "elite allies",
        "elite divisions",
        "institutional access"
      ],
      "reasons": {
        "elite allies": "Support from powerful insiders can help a claim gain traction.",
        "elite divisions": "Splits among decision-makers can create a contingent opening.",
        "institutional access": "It gives claimants a route to formal decision points."
      }
    },
    {
      "id": "signals-of-support",
      "prompt": "Which term refers specifically to public displays of worthiness, unity, numbers, and commitment?",
      "explanation": "WUNC names a way to analyze how participants publicly present themselves and their support. It does not guarantee that audiences will agree or that a movement will succeed.",
      "targets": [
        "WUNC display"
      ],
      "reasons": {
        "WUNC display": "The four letters stand for worthiness, unity, numbers, and commitment."
      }
    },
    {
      "id": "from-frame-to-participation",
      "prompt": "Which concepts connect a movement's message to a shared identity, audience fit, and the ties through which people may join?",
      "explanation": "Frame alignment is the linking process; collective identity describes a shared “we”; frame resonance is the perceived fit of a message; and recruitment networks are ties that can carry an invitation to participate. None alone guarantees recruitment.",
      "targets": [
        "frame alignment",
        "collective identity",
        "frame resonance",
        "recruitment network"
      ],
      "reasons": {
        "frame alignment": "It links movement claims with potential participants' concerns or identities.",
        "collective identity": "It gives participants a shared sense of “we.”",
        "frame resonance": "It describes perceived audience fit or credibility.",
        "recruitment network": "It names the ties through which people hear about participation."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "diffusion-of-social-change",
        "reason": "See how practices and ideas can travel through social networks beyond the organizations that first promoted them."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "From grievances to collective action",
    "summary": "Learn how organizing, political context, shared meaning, and public action shape the way social movements form and continue.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Social movements are sustained campaigns in which people make shared claims in public. A protest event can be part of one, but a gathering alone does not tell us how participants coordinate, what their claims mean, or how they continue after the day ends. Sociologists study the organizations, networks, ideas, and political conditions that shape collective action.\r\n\r\n## Organizing and resources\r\n\r\nDiscontent by itself does not explain when people coordinate. Mobilizing structures include formal organizations and informal networks that help participants communicate, recruit, and sustain activity. Resource mobilization asks how a movement obtains and coordinates what it needs to act. The free-rider problem points to a difficulty in collective action: people may benefit from a shared result without contributing. Selective incentives are one possible response, but movements also rely on relationships, solidarity, and shared commitment. Formal organization can help; it is not always necessary and may sometimes make action more routine or less disruptive.\r\n\r\n## Political context\r\n\r\nMovements act within political settings that shape what can be attempted. Allies among decision-makers, divisions among elites, and access to institutions can open routes for claims. State repression can raise costs, deter participation, or redirect action. Scholars disagree about how to define and measure political opportunity, and the evidence does not support a simple rule that more openness always produces success.\r\n\r\n## Framing and identity\r\n\r\nCollective-action framing gives a movement's account of a problem, a proposed response, and a reason to act. These are often called diagnostic, prognostic, and motivational framing. A movement's interpretation may connect with people's existing values and experiences, while collective identity gives participants a shared sense of “we.” Frame alignment describes the linking process; frame resonance describes whether an audience experiences a frame as credible or relevant. These ideas can help explain recruitment and commitment, but messages do not operate apart from resources or political context.\r\n\r\n## Public claims over time\r\n\r\nMovements use repertoires of contention: recognizable forms of public claim-making, such as petitions, demonstrations, and boycotts. Repertoires vary across historical and political settings rather than forming a universal menu. Charles Tilly describes movements through sustained campaigns, repertoires, and public displays of worthiness, unity, numbers, and commitment—the elements often abbreviated as WUNC. This is an analytic account of how movements present themselves, not a score that predicts which ones will succeed.\r\n\r\nThese mechanisms interact without forming one required sequence. A frame can help people recognize a shared concern; networks can carry an invitation; political conditions can shape tactics; and public action can alter the context it meets. The same grievance may yield different kinds of organizing, or no sustained movement at all."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex (GPT-6 Luna)",
        "reasoning": "max"
      }
    ]
  },
  "language": "en"
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "social-movement-mobilization",
      "puzzleRevision": "fnv1a32:e37978f7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:social movement organization": {
          "x": 746.52,
          "y": 198.95,
          "pinned": false
        },
        "term:grassroots network": {
          "x": 931.3,
          "y": 143.73,
          "pinned": false
        },
        "term:mobilizing structures": {
          "x": 916.37,
          "y": 313.9,
          "pinned": false
        },
        "term:resource mobilization": {
          "x": 600.01,
          "y": 338.5,
          "pinned": false
        },
        "term:recruitment network": {
          "x": 660.18,
          "y": 23,
          "pinned": false
        },
        "term:free-rider problem": {
          "x": 824.72,
          "y": 23,
          "pinned": false
        },
        "term:elite allies": {
          "x": 704.9,
          "y": 497.08,
          "pinned": false
        },
        "term:state repression": {
          "x": 744.97,
          "y": 627,
          "pinned": false
        },
        "term:political opportunity structure": {
          "x": 551.26,
          "y": 597.21,
          "pinned": false
        },
        "term:elite divisions": {
          "x": 769.57,
          "y": 380.91,
          "pinned": false
        },
        "term:institutional access": {
          "x": 858.06,
          "y": 512.09,
          "pinned": false
        },
        "term:diagnostic framing": {
          "x": 304.68,
          "y": 242.65,
          "pinned": false
        },
        "term:collective identity": {
          "x": 467.38,
          "y": 218.04,
          "pinned": false
        },
        "term:prognostic framing": {
          "x": 361.94,
          "y": 91.73,
          "pinned": false
        },
        "term:motivational framing": {
          "x": 195.88,
          "y": 115.03,
          "pinned": false
        },
        "term:frame resonance": {
          "x": 154.85,
          "y": 267.86,
          "pinned": false
        },
        "term:petition drive": {
          "x": 68.1,
          "y": 491.8,
          "pinned": false
        },
        "term:public demonstration": {
          "x": 175.52,
          "y": 605.8,
          "pinned": false
        },
        "term:repertoire of contention": {
          "x": 221.91,
          "y": 425,
          "pinned": false
        },
        "term:boycott": {
          "x": 44.05,
          "y": 603.14,
          "pinned": false
        },
        "term:WUNC display": {
          "x": 60.9,
          "y": 362.1,
          "pinned": false
        },
        "term:frame alignment": {
          "x": 512.27,
          "y": 69.59,
          "pinned": false
        },
        "term:social movement campaign": {
          "x": 418.84,
          "y": 394.94,
          "pinned": false
        },
        "term:contentious politics": {
          "x": 344.95,
          "y": 566.28,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4540.48,
        "score": 4540.483955524445
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:40:58.334Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "social-movement-mobilization",
      "puzzleRevision": "fnv1a32:e37978f7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 457.78,
          "y": 178.57,
          "pinned": false
        },
        "cluster:1": {
          "x": 552.22,
          "y": 487.43,
          "pinned": false
        },
        "cluster:2": {
          "x": 146.3,
          "y": 353.33,
          "pinned": false
        },
        "cluster:3": {
          "x": 863.7,
          "y": 312.67,
          "pinned": false
        }
      },
      "bridges": {
        "term:frame alignment": {
          "x": 354.08,
          "y": 391.6,
          "pinned": false
        },
        "term:social movement campaign": {
          "x": 712.79,
          "y": 119.97,
          "pinned": false
        },
        "term:contentious politics": {
          "x": 781.5,
          "y": 473.59,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "social movement organization",
          "grassroots network",
          "mobilizing structures",
          "resource mobilization",
          "recruitment network",
          "free-rider problem"
        ],
        "cluster:1": [
          "elite allies",
          "state repression",
          "political opportunity structure",
          "elite divisions",
          "institutional access"
        ],
        "cluster:2": [
          "diagnostic framing",
          "collective identity",
          "prognostic framing",
          "motivational framing",
          "frame resonance"
        ],
        "cluster:3": [
          "petition drive",
          "public demonstration",
          "repertoire of contention",
          "boycott",
          "WUNC display"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "grassroots network",
          "mobilizing structures",
          "social movement organization",
          "resource mobilization",
          "recruitment network",
          "free-rider problem"
        ],
        "cluster:1": [
          "elite allies",
          "state repression",
          "political opportunity structure",
          "institutional access",
          "elite divisions"
        ],
        "cluster:2": [
          "frame resonance",
          "prognostic framing",
          "motivational framing",
          "collective identity",
          "diagnostic framing"
        ],
        "cluster:3": [
          "WUNC display",
          "repertoire of contention",
          "public demonstration",
          "petition drive",
          "boycott"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 915.9270982403025
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-19T03:40:59.156Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "social-movement-mobilization",
      "puzzleRevision": "fnv1a32:e37978f7",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:social movement organization": {
          "x": 897.38,
          "y": 22
        },
        "term:grassroots network": {
          "x": 933.3,
          "y": 208.13
        },
        "term:mobilizing structures": {
          "x": 923.85,
          "y": 380.53
        },
        "term:resource mobilization": {
          "x": 650.81,
          "y": 452.1
        },
        "term:recruitment network": {
          "x": 739.18,
          "y": 139.02
        },
        "term:free-rider problem": {
          "x": 815.09,
          "y": 497.35
        },
        "term:elite allies": {
          "x": 952.2,
          "y": 536.61
        },
        "term:state repression": {
          "x": 871.68,
          "y": 628
        },
        "term:political opportunity structure": {
          "x": 439.26,
          "y": 448.88
        },
        "term:elite divisions": {
          "x": 530.28,
          "y": 583
        },
        "term:institutional access": {
          "x": 374.22,
          "y": 628
        },
        "term:diagnostic framing": {
          "x": 81.33,
          "y": 333.55
        },
        "term:collective identity": {
          "x": 519.98,
          "y": 99.14
        },
        "term:prognostic framing": {
          "x": 76.7,
          "y": 171.23
        },
        "term:motivational framing": {
          "x": 83,
          "y": 22
        },
        "term:frame resonance": {
          "x": 400.67,
          "y": 22
        },
        "term:petition drive": {
          "x": 92.75,
          "y": 477.93
        },
        "term:public demonstration": {
          "x": 83,
          "y": 628
        },
        "term:repertoire of contention": {
          "x": 384.68,
          "y": 230.71
        },
        "term:boycott": {
          "x": 42.05,
          "y": 427.77
        },
        "term:WUNC display": {
          "x": 207.44,
          "y": 271.13
        },
        "term:frame alignment": {
          "x": 648.81,
          "y": 22
        },
        "term:social movement campaign": {
          "x": 581.71,
          "y": 274.19
        },
        "term:contentious politics": {
          "x": 234.01,
          "y": 549.06
        },
        "cluster:0": {
          "x": 771.45,
          "y": 313.41
        },
        "cluster:1": {
          "x": 697.77,
          "y": 628
        },
        "cluster:2": {
          "x": 242.64,
          "y": 80.5
        },
        "cluster:3": {
          "x": 244.92,
          "y": 374.55
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-19T03:41:00.000Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-19T08:07:07.394Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
