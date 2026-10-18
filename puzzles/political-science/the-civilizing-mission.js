// Generated from content/puzzles/the-civilizing-mission.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "the-civilizing-mission",
  "title": "The Civilizing Mission",
  "category": "political-science",
  "categories": [
    "political-science",
    "philosophy"
  ],
  "subcategories": {
    "philosophy": "political-philosophy",
    "political-science": "international-relations"
  },
  "info": {
    "text": "Liberal thought has long paired a strong doctrine of self-determination with an equally strong exception for peoples judged not yet ready to exercise it -- a hierarchy inherited across Mill's writing, democratic peace theory, formal colonial ideology, and today's humanitarian intervention doctrine.",
    "links": [
      {
        "href": "wiki:Civilizing mission"
      }
    ],
    "citations": [
      {
        "title": "The Question of Intervention: John Stuart Mill and the Responsibility to Protect",
        "author": "Doyle, Michael W.",
        "publisher": "Yale University Press",
        "year": "2015"
      },
      {
        "title": "The Standard of 'Civilization' in International Society",
        "author": "Gong, Gerrit W.",
        "publisher": "Clarendon Press",
        "year": "1984"
      },
      {
        "title": "Losing 'the Force'? The 'Dark Side' of Democratization after Iraq",
        "author": "Whitehead, Laurence",
        "publisher": "Democratization",
        "year": "2009"
      }
    ]
  },
  "clusters": [
    {
      "id": "mills-civilizational-threshold",
      "name": "Mill's Civilizational Threshold",
      "color": "teal",
      "fact": "Mill confined the ordinary rules of international morality to relations among 'civilized nations'; he judged 'barbarians' incapable of the reciprocity those rules presuppose, leaving what he called 'legitimate despotism' -- aimed at their improvement -- as the only rule he thought fit to govern them.",
      "terms": [
        "barbarians",
        "civilized nations",
        "reciprocity",
        "legitimate despotism"
      ],
      "seeds": [
        "barbarians",
        "civilized nations"
      ],
      "termInfo": {
        "barbarians": {
          "text": "Mill's term for peoples he judged not yet capable of the mutual obligations 'civilized' states owed one another -- and therefore, he argued, not owed the protections of ordinary international morality."
        },
        "civilized nations": {
          "text": "Mill's category for states capable of reciprocal obligation -- for him, essentially Christian Europe -- among whom alone he thought the ordinary rules of non-intervention should apply."
        },
        "legitimate despotism": {
          "text": "Mill's paradoxical claim: rule without consent could still be rightful, provided its genuine aim was to prepare the governed for eventual self-government."
        },
        "reciprocity": {
          "text": "The expectation that international obligations are mutual, returned in kind -- which Mill argued 'barbarian' peoples could not be counted on to honor.",
          "links": [
            {
              "href": "wiki:Reciprocity (international relations)"
            }
          ]
        }
      },
      "info": {
        "text": "John Stuart Mill's 1859 defense of non-intervention among 'civilized' states -- paired with an explicit exception for peoples he judged not yet fit to claim it.",
        "links": [
          {
            "href": "wiki:A Few Words on Non-Intervention"
          }
        ]
      }
    },
    {
      "id": "democratic-peace-theory",
      "name": "Democratic Peace Theory",
      "color": "blue",
      "fact": "Kant's 'perpetual peace' inspired the general claim that democracies are peaceful, but researchers split it in two: the well-supported 'dyadic' finding that democracies rarely fight each other, and the shakier 'monadic' claim that democracies act peacefully toward everyone -- a claim the evidence does not actually support.",
      "terms": [
        "perpetual peace",
        "democratic peace",
        "monadic peace",
        "dyadic peace"
      ],
      "seeds": [
        "perpetual peace",
        "democratic peace"
      ],
      "termInfo": {
        "democratic peace": {
          "text": "The empirical claim that democracies behave more peacefully than other states, especially toward one another.",
          "links": [
            {
              "href": "wiki:Democratic peace theory"
            }
          ]
        },
        "dyadic peace": {
          "text": "The better-supported version of the claim: that democracies rarely, if ever, go to war against other democracies specifically."
        },
        "monadic peace": {
          "text": "The weaker, largely unsupported version of the claim: that democracies are less prone to war regardless of their opponent's regime type."
        },
        "perpetual peace": {
          "text": "Kant's 1795 essay proposing that republics, joined in a voluntary federation, could gradually make war between them obsolete.",
          "links": [
            {
              "href": "wiki:Perpetual Peace: A Philosophical Sketch"
            }
          ]
        }
      },
      "info": {
        "text": "The empirical and philosophical claim that representative government makes states more peaceful -- and the contested question of what that claim licenses toward states that are not democracies.",
        "links": [
          {
            "href": "wiki:Democratic peace theory"
          }
        ]
      }
    },
    {
      "id": "mission-civilisatrice",
      "name": "Mission Civilisatrice",
      "color": "amber",
      "fact": "France's mission civilisatrice, championed by Jules Ferry, framed conquest as a moral duty to elevate 'backward' peoples through assimilation into French language, law, and religion; Kipling's 'white man's burden' cast the same duty in Anglo-American terms.",
      "terms": [
        "mission civilisatrice",
        "white man's burden",
        "assimilation",
        "Jules Ferry"
      ],
      "seeds": [
        "mission civilisatrice",
        "white man's burden"
      ],
      "termInfo": {
        "Jules Ferry": {
          "text": "The French statesman who most forcefully argued, before the National Assembly, that 'superior races' had a duty to civilize 'inferior' ones.",
          "links": [
            {
              "href": "wiki:Jules Ferry"
            }
          ]
        },
        "assimilation": {
          "text": "The French colonial policy premised on the idea that colonized peoples could, in principle, become French by adopting French language and culture -- a promise mostly withheld in practice."
        },
        "mission civilisatrice": {
          "text": "The Third Republic's official rationale for empire: that France had a duty to spread civilization, not merely to acquire territory.",
          "links": [
            {
              "href": "wiki:Civilizing mission"
            }
          ]
        },
        "white man's burden": {
          "text": "Rudyard Kipling's 1899 poem urging the United States to take up the paternalistic 'burden' of ruling the Philippines, casting the same civilizing logic in Anglo-American dress.",
          "links": [
            {
              "href": "wiki:The White Man's Burden"
            }
          ]
        }
      },
      "info": {
        "text": "The 19th-century doctrine that colonial conquest was, at bottom, a service performed for the people being conquered.",
        "links": [
          {
            "href": "wiki:Civilizing mission"
          }
        ]
      }
    },
    {
      "id": "responsibility-to-protect",
      "name": "Responsibility to Protect",
      "color": "magenta",
      "fact": "The 2001 ICISS report reconceived sovereignty as a responsibility rather than a license, obligating outside states to act -- the 'third pillar' -- when a government manifestly fails to protect its own population from mass atrocity crimes.",
      "terms": [
        "responsibility to protect",
        "mass atrocity crimes",
        "sovereignty as responsibility",
        "third pillar"
      ],
      "seeds": [
        "responsibility to protect",
        "mass atrocity crimes"
      ],
      "termInfo": {
        "mass atrocity crimes": {
          "text": "The four crimes R2P names as triggering the international community's responsibility: genocide, war crimes, ethnic cleansing, and crimes against humanity.",
          "links": [
            {
              "href": "wiki:Atrocity crimes"
            }
          ]
        },
        "responsibility to protect": {
          "text": "The international norm, endorsed at the UN's 2005 World Summit, that sovereignty carries an obligation to protect a state's own population -- and that the obligation passes to the international community if a government fails it.",
          "links": [
            {
              "href": "wiki:Responsibility to protect"
            }
          ]
        },
        "sovereignty as responsibility": {
          "text": "The conceptual move at R2P's core: redefining sovereignty itself as a duty owed to a state's population, rather than a shield against outside judgment."
        },
        "third pillar": {
          "text": "R2P's final tier: the international community's readiness to respond with timely and decisive collective action once a state has manifestly failed its population."
        }
      },
      "info": {
        "text": "The doctrine that sovereignty obligates a state to protect its own population, and passes to the wider world when that state manifestly fails.",
        "links": [
          {
            "href": "wiki:Responsibility to protect"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "standard-of-civilization",
      "term": "standard of civilization",
      "clusters": [
        0,
        1
      ],
      "fact": "Nineteenth-century international law formalized Mill's civilized/barbarian line into actual legal doctrine: only 'civilized' states received full sovereign equality, while others faced unequal treaties and extraterritorial jurisdiction -- the same underlying move, sorting states into a zone of full reciprocity and everyone else, that reappears a century later in democratic peace theory's empirical 'zone of peace.'",
      "info": {
        "text": "The 19th-century legal doctrine that only 'civilized' states received full sovereign equality under international law -- while others faced unequal treaties and extraterritorial jurisdiction.",
        "links": [
          {
            "href": "wiki:Unequal treaties"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "civilized nations",
        "dyadic peace"
      ]
    },
    {
      "id": "sacred-trust-of-civilisation",
      "term": "sacred trust of civilisation",
      "clusters": [
        2,
        3
      ],
      "fact": "The League of Nations' 1919 Mandate System recast conquest as a 'sacred trust of civilisation,' obligating 'advanced nations' to prepare supposedly unready peoples for self-rule -- language R2P's architects effectively revisited eight decades later when they redefined sovereignty itself as a responsibility rather than a possession.",
      "info": {
        "text": "Article 22 of the League Covenant's legal formula for mandate rule -- a direct historical link between colonial tutelage and today's language of sovereignty-as-duty.",
        "links": [
          {
            "href": "wiki:League of Nations mandate"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "mission civilisatrice",
        "sovereignty as responsibility"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "coercive-democratization",
      "term": "coercive democratization",
      "clusters": [
        1,
        2
      ],
      "fact": "When the 'monadic' claim that democracies act peacefully toward everyone proved empirically false, democratic peace reasoning was redeployed to justify coercive democratization -- installing government by force -- echoing the civilizing mission's confidence that outside rule could rightly remake another people's institutions.",
      "info": {
        "text": "Political scientist Laurence Whitehead's term for imposing democratic government on another country through military force -- a project vulnerable to the objection Mill himself raised: a people 'liberated by foreign arms without their own cooperation' rarely keeps that freedom.",
        "links": [
          {
            "href": "wiki:Democracy promotion by the United States"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "monadic peace",
        "assimilation"
      ]
    }
  ],
  "lenses": [
    {
      "id": "named-justifications",
      "prompt": "Which concepts are the specific conceptual move a framework uses to claim that outside control of another people isn't really domination?",
      "explanation": "Each of these is the specific banner a framework raises to explain why outside control serves the ruled people, or was never really imposed on them at all: 'legitimate despotism' claims temporary tutelage toward eventual self-rule, 'monadic peace' claimed a proven peacefulness later redeployed to license force, 'mission civilisatrice' and 'white man's burden' name the same colonial claim of civilizing duty in French and Anglo-American dress, and 'sovereignty as responsibility' claims that a state's sovereignty was never actually violated, only exercised on its behalf. 'Responsibility to protect' names the resulting doctrine as a whole, not this specific rhetorical move -- the same distinction that keeps 'dyadic peace,' the well-supported half of democratic peace theory, off this list.",
      "targets": [
        "legitimate despotism",
        "monadic peace",
        "mission civilisatrice",
        "white man's burden",
        "sovereignty as responsibility"
      ],
      "reasons": {
        "monadic peace": "Its empirical failure as a description of actual behavior became, ironically, its later use as a license: if peaceful conduct toward everyone couldn't be assumed, force could still be justified as a way of producing it.",
        "sovereignty as responsibility": "R2P's architects deliberately avoided claiming a 'right to intervene' and instead redefined sovereignty itself, so that action taken after a state fails its population isn't framed as violating sovereignty at all."
      }
    },
    {
      "id": "theory-meets-practice",
      "prompt": "Which concepts mark the specific point where a framework's stated aim ran into its most documented practical failure or internal tension?",
      "explanation": "Each names the place where theory met resistance: Mill's own 'legitimate despotism' is a paradox critics have never stopped pressing -- rule without consent, justified by consent's eventual arrival; 'monadic peace' is the specific claim about democracies that evidence never actually supported; French 'assimilation' promised citizenship it mostly withheld; and the 'third pillar' -- collective action once a state has failed its people -- is the piece of R2P member states have proven least willing to actually invoke.",
      "targets": [
        "legitimate despotism",
        "monadic peace",
        "assimilation",
        "third pillar"
      ],
      "reasons": {
        "assimilation": "Citizenship and rights under assimilation went in practice to a small educated elite, while the promise of eventually 'becoming French' was withheld from most colonized people.",
        "third pillar": "Pillars one and two -- a state's own responsibility, and international assistance -- draw broad agreement; pillar three's collective action has been invoked rarely and unevenly, making it R2P's most contested element."
      }
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Naming Domination as Duty",
    "summary": "Four very different frameworks, one recurring shape: a claim about who can't yet govern themselves, paired with a claim about what duty that creates in others.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "## A recurring shape\n\nAcross very different eras, thinkers and institutions have faced the same problem: how to justify one people governing another without simply admitting to domination for its own sake.\n\nJohn Stuart Mill, the philosopher of liberty and self-government, carved out an explicit exception to his own principles when he wrote about relations between nations. Decades later, the empirical claim that democracies are unusually peaceful became, in some hands, an argument for spreading democracy by force. Meanwhile, European empires -- and later, international law itself -- developed their own vocabulary for explaining why outside rule over a population was compatible with, or even required by, that population's own welfare.\n\nThis puzzle asks you to notice the shape shared by these otherwise very different arguments: each pairs a claim about who is capable of self-government with a claim about what duty that incapacity creates in others.\n\n### A question to hold onto\n\nWhat would have to be true about a people, or a state, before outside intervention in its affairs stopped needing any justification like these at all?"
    },
    "links": [
      {
        "href": "https://en.wikipedia.org/wiki/A_Few_Words_on_Non-Intervention",
        "label": "Mill, \"A Few Words on Non-Intervention\" (1859)"
      },
      {
        "href": "https://www.globalr2p.org/resources/the-responsibility-to-protect-report-of-the-international-commission-on-intervention-and-state-sovereignty-2001/",
        "label": "The Responsibility to Protect: Report of the ICISS (2001)"
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "the-civilizing-mission",
      "puzzleRevision": "fnv1a32:101aa837",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:barbarians": {
          "x": 802.16,
          "y": 172.42,
          "pinned": false
        },
        "term:civilized nations": {
          "x": 672.01,
          "y": 200.05,
          "pinned": false
        },
        "term:reciprocity": {
          "x": 874.57,
          "y": 84.19,
          "pinned": false
        },
        "term:legitimate despotism": {
          "x": 733.63,
          "y": 47.48,
          "pinned": false
        },
        "term:perpetual peace": {
          "x": 687.8,
          "y": 460.22,
          "pinned": false
        },
        "term:democratic peace": {
          "x": 737.71,
          "y": 597,
          "pinned": false
        },
        "term:monadic peace": {
          "x": 630.92,
          "y": 336.49,
          "pinned": false
        },
        "term:dyadic peace": {
          "x": 818.12,
          "y": 487.12,
          "pinned": false
        },
        "term:mission civilisatrice": {
          "x": 305.04,
          "y": 204.97,
          "pinned": false
        },
        "term:white man's burden": {
          "x": 299.52,
          "y": 34.22,
          "pinned": false
        },
        "term:assimilation": {
          "x": 421.67,
          "y": 107.58,
          "pinned": false
        },
        "term:Jules Ferry": {
          "x": 186.24,
          "y": 115.34,
          "pinned": false
        },
        "term:responsibility to protect": {
          "x": 180.2,
          "y": 597,
          "pinned": false
        },
        "term:mass atrocity crimes": {
          "x": 369.96,
          "y": 597,
          "pinned": false
        },
        "term:sovereignty as responsibility": {
          "x": 292.59,
          "y": 410.09,
          "pinned": false
        },
        "term:third pillar": {
          "x": 118.78,
          "y": 444.36,
          "pinned": false
        },
        "term:standard of civilization": {
          "x": 795.21,
          "y": 327.35,
          "pinned": false
        },
        "term:sacred trust of civilisation": {
          "x": 113.38,
          "y": 269.88,
          "pinned": false
        },
        "term:coercive democratization": {
          "x": 488.17,
          "y": 254.65,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3582.19,
        "score": 3582.187709284929
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:30:10.474Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "the-civilizing-mission",
      "puzzleRevision": "fnv1a32:101aa837",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 797.93,
          "y": 398,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 235.87,
          "pinned": false
        },
        "cluster:2": {
          "x": 525,
          "y": 560.13,
          "pinned": false
        },
        "cluster:3": {
          "x": 252.07,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:standard of civilization": {
          "x": 757.63,
          "y": 220.77,
          "pinned": false
        },
        "term:sacred trust of civilisation": {
          "x": 269.74,
          "y": 597.86,
          "pinned": false
        },
        "term:coercive democratization": {
          "x": 525,
          "y": 398,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "barbarians",
          "civilized nations",
          "reciprocity",
          "legitimate despotism"
        ],
        "cluster:1": [
          "perpetual peace",
          "democratic peace",
          "monadic peace",
          "dyadic peace"
        ],
        "cluster:2": [
          "mission civilisatrice",
          "white man's burden",
          "assimilation",
          "Jules Ferry"
        ],
        "cluster:3": [
          "responsibility to protect",
          "mass atrocity crimes",
          "sovereignty as responsibility",
          "third pillar"
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
        "totalLength": 390.156878365952
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T01:30:13.067Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "the-civilizing-mission",
      "puzzleRevision": "fnv1a32:101aa837",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:barbarians": {
          "x": 864.52,
          "y": 75.39
        },
        "term:civilized nations": {
          "x": 651.45,
          "y": 385.32
        },
        "term:reciprocity": {
          "x": 905.35,
          "y": 297.69
        },
        "term:legitimate despotism": {
          "x": 877,
          "y": 425.13
        },
        "term:perpetual peace": {
          "x": 612.57,
          "y": 598
        },
        "term:democratic peace": {
          "x": 258.85,
          "y": 598
        },
        "term:monadic peace": {
          "x": 329.65,
          "y": 494.18
        },
        "term:dyadic peace": {
          "x": 583.94,
          "y": 505.13
        },
        "term:mission civilisatrice": {
          "x": 318.07,
          "y": 22
        },
        "term:white man's burden": {
          "x": 486.09,
          "y": 22
        },
        "term:assimilation": {
          "x": 574.18,
          "y": 266.95
        },
        "term:Jules Ferry": {
          "x": 732.31,
          "y": 22
        },
        "term:responsibility to protect": {
          "x": 98.75,
          "y": 537.06
        },
        "term:mass atrocity crimes": {
          "x": 83,
          "y": 345.33
        },
        "term:sovereignty as responsibility": {
          "x": 171.07,
          "y": 139.88
        },
        "term:third pillar": {
          "x": 57.8,
          "y": 209.87
        },
        "term:standard of civilization": {
          "x": 777.87,
          "y": 583.88
        },
        "term:sacred trust of civilisation": {
          "x": 416.72,
          "y": 180.46
        },
        "term:coercive democratization": {
          "x": 465.91,
          "y": 391.04
        },
        "cluster:0": {
          "x": 785.79,
          "y": 237.6
        },
        "cluster:1": {
          "x": 445.41,
          "y": 598
        },
        "cluster:2": {
          "x": 609.56,
          "y": 113.05
        },
        "cluster:3": {
          "x": 266.02,
          "y": 339.84
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-08T01:30:15.757Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T01:30:08.099Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
