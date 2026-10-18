// Generated from content/puzzles/attack-and-defense-networks.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "attack-and-defense-networks",
  "title": "Attack Surface and Defense in Depth",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "networks-security"
  },
  "info": {
    "text": "How security is organized: the three promises — confidentiality, integrity, availability — the attacks on machines and on people that break them, and the layered controls that keep them anyway.",
    "links": [
      {
        "href": "wiki:Computer security",
        "label": "Computer security (Wikipedia)"
      }
    ],
    "citations": [
      {
        "title": "An Introduction to Information Security (NIST Special Publication 800-12 Rev. 1)",
        "author": "Pauline Bowen, Joan Hash, Stephen Wilson",
        "publisher": "NIST",
        "year": "2017",
        "url": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-12r1.pdf"
      }
    ]
  },
  "clusters": [
    {
      "id": "three-promises",
      "name": "The three promises",
      "color": "teal",
      "fact": "Security's three promises: information stays secret (confidentiality), stays accurate and complete (integrity), and stays reachable when needed (availability). Every attack breaks one; every control keeps one.",
      "terms": [
        "confidentiality",
        "availability",
        "integrity"
      ],
      "seeds": [
        "confidentiality",
        "availability"
      ],
      "termInfo": {
        "availability": {
          "text": "Information and systems are reachable when needed — exactly what denial-of-service attacks go after.",
          "links": [
            {
              "href": "wiki:Information security"
            }
          ]
        },
        "confidentiality": {
          "text": "Information is not made available or disclosed to unauthorized individuals, entities, or processes.",
          "links": [
            {
              "href": "wiki:Information security"
            }
          ]
        },
        "integrity": {
          "text": "Data keeps its accuracy and completeness — nothing altered in unauthorized or undetected ways.",
          "links": [
            {
              "href": "wiki:Information security"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Information security"
          }
        ]
      }
    },
    {
      "id": "machine-attacks",
      "name": "Attacks on machines",
      "color": "blue",
      "fact": "Attacks whose target is code, protocol, or infrastructure: intercepting traffic, injecting commands, flooding services past capacity, and extorting with encryption — often at botnet scale, from thousands of conscripted devices.",
      "terms": [
        "denial-of-service attack",
        "ransomware",
        "man-in-the-middle attack",
        "SQL injection",
        "botnet"
      ],
      "seeds": [
        "denial-of-service attack",
        "ransomware"
      ],
      "termInfo": {
        "SQL injection": {
          "text": "Malicious SQL typed into an input field and executed by the database behind the site — dumping, tampering with, or destroying data.",
          "links": [
            {
              "href": "wiki:SQL injection"
            }
          ]
        },
        "botnet": {
          "text": "A network of compromised devices, conscripted to send spam, mine cryptocurrency, or wage flooding attacks together.",
          "links": [
            {
              "href": "wiki:Botnet"
            }
          ]
        },
        "denial-of-service attack": {
          "text": "Flooding a system with more requests than it can handle, until legitimate users are locked out.",
          "links": [
            {
              "href": "wiki:Denial-of-service attack"
            }
          ]
        },
        "man-in-the-middle attack": {
          "text": "The attacker secretly relays — and can alter — the traffic between two parties who believe they are talking directly.",
          "links": [
            {
              "href": "wiki:Man-in-the-middle attack"
            }
          ]
        },
        "ransomware": {
          "text": "Malware that encrypts or destroys the victim's data and demands payment for its return.",
          "links": [
            {
              "href": "wiki:Ransomware"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cyberattack"
          }
        ]
      }
    },
    {
      "id": "human-attacks",
      "name": "Attacks on people",
      "color": "amber",
      "fact": "Attacks whose entry point is a mind: deceptive messages that harvest credentials, manufactured scenarios that impersonate authority — psychological pressure doing what no exploit can.",
      "terms": [
        "phishing",
        "social engineering",
        "pretexting"
      ],
      "seeds": [
        "phishing",
        "social engineering"
      ],
      "termInfo": {
        "phishing": {
          "text": "Deceptive messages — mail, texts, fake sites — that trick people into revealing credentials or sensitive data.",
          "links": [
            {
              "href": "wiki:Phishing"
            }
          ]
        },
        "pretexting": {
          "text": "An invented scenario, researched and rehearsed, used to impersonate someone legitimate until the victim cooperates.",
          "links": [
            {
              "href": "wiki:Pretexting"
            }
          ]
        },
        "social engineering": {
          "text": "Psychological pressure that exploits human biases to make someone act or divulge — the family phishing belongs to.",
          "links": [
            {
              "href": "wiki:Social engineering (security)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Social engineering (security)"
          }
        ]
      }
    },
    {
      "id": "layered-defenses",
      "name": "Layered defenses",
      "color": "magenta",
      "fact": "Controls stacked so any single failure is caught by the next: filter the perimeter, harden the credential, close the known hole, contain the blast radius, and always keep a way back.",
      "terms": [
        "firewall",
        "backup",
        "multi-factor authentication",
        "software patch",
        "principle of least privilege"
      ],
      "seeds": [
        "firewall",
        "backup"
      ],
      "termInfo": {
        "backup": {
          "text": "A kept copy of data, offline or immutable, that turns 'everything is encrypted' into 'restore and continue.'",
          "links": [
            {
              "href": "wiki:Backup"
            }
          ]
        },
        "firewall": {
          "text": "A filter on network traffic that allows or blocks by rules — the classic perimeter control.",
          "links": [
            {
              "href": "wiki:Firewall (computing)"
            }
          ]
        },
        "multi-factor authentication": {
          "text": "Login requires something more than the password — a code, a key, a fingerprint — so a phished password alone opens nothing.",
          "links": [
            {
              "href": "wiki:Multi-factor authentication"
            }
          ]
        },
        "principle of least privilege": {
          "text": "Every account and process gets the minimum access it needs — so a compromised login holds less to steal.",
          "links": [
            {
              "href": "wiki:Principle of least privilege"
            }
          ]
        },
        "software patch": {
          "text": "An update that closes a known vulnerability — the hole an attacker would have used is simply gone.",
          "links": [
            {
              "href": "wiki:Patch (computing)"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Defense in depth (computing)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "broken-promise",
      "term": "the broken promise",
      "clusters": [
        0,
        1
      ],
      "fact": "Every technical attack is one of the three promises lost: interception betrays confidentiality, injection betrays confidentiality and integrity at once, and flooding or encrypting-for-extortion betrays availability.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "borrowed-authority",
      "term": "the borrowed authority",
      "clusters": [
        0,
        2
      ],
      "fact": "Attacks on people break promises without breaking anything technical: the phished credentials are real and the authorized actions genuine — confidentiality fails because a person was convinced, not because a lock failed.",
      "relationKind": "dynamic",
      "idealTerms": [
        "confidentiality",
        "phishing"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 0
      }
    },
    {
      "id": "controls-keep-promises",
      "term": "controls keep promises",
      "clusters": [
        0,
        3
      ],
      "fact": "Each control exists to hold a specific promise: backups restore availability after the worst day, patches close the holes integrity attacks exploit, and firewalls with MFA guard what gets in and who counts as authorized.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 0
      }
    },
    {
      "id": "no-single-wall",
      "term": "no single wall",
      "clusters": [
        1,
        3
      ],
      "fact": "Defense in depth exists because technical attacks arrive at different layers: a firewall cannot filter malicious SQL inside an allowed request, so holes get patched, blast radius is contained by least privilege, and backups answer ransomware.",
      "relationKind": "dynamic",
      "idealTerms": [
        "SQL injection",
        "software patch"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "human-channel",
      "term": "the human channel",
      "clusters": [
        2,
        3
      ],
      "fact": "No wall stops a persuaded person, so the controls move to the person's own channel: MFA makes a phished password alone worthless, and least privilege bounds what any borrowed authority can do.",
      "relationKind": "dynamic",
      "idealTerms": [
        "phishing",
        "multi-factor authentication"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "one-attack-two-promises",
      "prompt": "An attacker silently reads the traffic between a user and a site — and quietly alters some of it. Which promises has this one attack broken?",
      "explanation": "Interception is confidentiality lost — someone unauthorized read the traffic. Quietly altering it adds integrity loss: the data no longer arrives accurate and complete. Availability is untouched here — the service still works, which is exactly what makes the attack so hard to notice.",
      "targets": [
        "confidentiality",
        "integrity"
      ],
      "reasons": {
        "confidentiality": "Unauthorized eyes saw data that was promised secret.",
        "integrity": "Data arrived altered — no longer accurate and complete."
      }
    },
    {
      "id": "no-exploit-needed",
      "prompt": "Which attacks could be attempted by someone with no software exploit at all — just patience and a convincing story?",
      "explanation": "The human-attack family needs no exploit at all: a persuasive message (phishing), the broader craft of psychological pressure (social engineering), or a researched, rehearsed false identity (pretexting). The machine attacks all begin by breaking software or protocols; these begin by convincing a person.",
      "targets": [
        "phishing",
        "social engineering",
        "pretexting"
      ],
      "reasons": {
        "phishing": "A message and a fake destination — no code required.",
        "pretexting": "A phone voice and a fabricated scenario.",
        "social engineering": "The whole craft of persuading people instead of breaking programs."
      }
    },
    {
      "id": "prevention-posture",
      "prompt": "Which controls shrink the damage an attacker can do before any attack even starts?",
      "explanation": "Prevention is a posture, built before anything happens: the firewall filters what can reach the interior, the patch removes the hole an exploit would need, least privilege shrinks what any account can touch, and MFA makes a bare password insufficient at the door. The backup prevents nothing — its day is later.",
      "targets": [
        "firewall",
        "multi-factor authentication",
        "software patch",
        "principle of least privilege"
      ],
      "reasons": {
        "firewall": "Decides what can reach the interior, every day, in advance.",
        "multi-factor authentication": "Makes a stolen password alone insufficient at the door.",
        "principle of least privilege": "Caps what any account can touch, so compromise starts small.",
        "software patch": "Deletes the vulnerability before an attacker finds it."
      }
    },
    {
      "id": "the-way-back",
      "prompt": "Ransomware has already encrypted the file server. Which control is the answer now?",
      "explanation": "Everything else on the control list is prevention — walls, holes closed, doors hardened. Only the backup answers the attack that already succeeded: with an offline or immutable copy, 'everything is encrypted' becomes 'restore and continue.' That is why defense in depth ends in a way back.",
      "targets": [
        "backup"
      ],
      "reasons": {
        "backup": "The only control whose job starts after prevention has failed — restore instead of pay."
      }
    },
    {
      "id": "the-intercepted-password",
      "prompt": "An attacker has learned a user's password. Which controls still stand between them and the data?",
      "explanation": "A stolen password meets two remaining walls. Multi-factor authentication stops it at the login — the password alone is now insufficient. If the attacker gets in anyway, least privilege caps what that account can reach, so the data exposed is bounded. A firewall never enters the story: the attacker is logging in legitimately, from inside.",
      "targets": [
        "multi-factor authentication",
        "principle of least privilege"
      ],
      "reasons": {
        "multi-factor authentication": "The second factor is something the attacker does not have.",
        "principle of least privilege": "Whatever the account can reach, that is all the attacker gets."
      }
    },
    {
      "id": "the-ransomware-arc",
      "prompt": "A phished invoice led to ransomware that encrypted the file server. Which concepts belong to how it entered and what it did?",
      "explanation": "The arc runs through the human-attack family into the machine: the phished invoice was social engineering — phishing in particular — and the payload was ransomware encrypting the server. Botnets, interception, and injection play no part in this story, and the backup answers only what comes next.",
      "targets": [
        "phishing",
        "social engineering",
        "ransomware"
      ],
      "reasons": {
        "phishing": "The deceptive message itself — the entry.",
        "ransomware": "The payload that encrypted the server — what it did.",
        "social engineering": "The family the entry belongs to: persuasion, not exploitation."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-the-internet-moves-a-message",
        "reason": "The attacks here are aimed at the delivery system: floods overwhelm its forwarding and interception rides its wires — knowing the machinery shows where it can break."
      },
      {
        "id": "locks-and-keys-cryptography",
        "reason": "The toolbox behind several controls: what multi-factor guarantees mean, how encryption protects data, and why stolen credential hashes can be tested offline."
      },
      {
        "id": "trust-on-the-wire-tls-pki",
        "reason": "Certificates and chain validation are the layered defense against exactly this board's man-in-the-middle attack — trust machinery as a security control."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Promises, enemies, and layered answers",
    "summary": "Security as the CIA triad: the attacks on machines and on people that break the promises, and the layered controls that keep them.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every secure system makes three promises. Information stays secret — confidentiality. Information stays accurate and complete — integrity. And the system stays available when it is needed. Those three words are the oldest framework in security, and they are a map of everything else: every attack is one of the promises broken, and every defense is one of them kept.\r\n\r\nThe enemies come in two kinds, split by their target. Attacks on machines exploit what software and networks do automatically: a man-in-the-middle secretly reads and alters traffic that two parties believe is private; SQL injection smuggles database commands into a web form's input; a denial-of-service attack floods a service past what it can handle — often from a botnet of thousands of conscripted devices; and ransomware encrypts a victim's own files and demands payment for their return.\r\n\r\nAttacks on people skip all of that. Phishing sends a message that impersonates someone trustworthy. Pretexting builds an entire invented scenario to borrow authority. The victim, not the software, opens the door — and the credentials they surrender are real.\r\n\r\nDefenses answer in layers — defense in depth — because no single wall holds. Firewalls filter what reaches the interior. Software patches close known holes before anyone finds them. Multi-factor authentication makes a stolen password alone worthless. The principle of least privilege means that whatever an attacker does get, they get less of. And backups are the answer for the day a control fails anyway: everything else is prevention, but a backup is recovery.\r\n\r\nThe quiet lesson is the pairing. Technical attacks meet technical walls; attacks on people are answered where the person is — making the phished credential insufficient and the borrowed authority small. Security is not a product. It is three promises, defended in layers, against enemies who only need you to be wrong once.\r\n\r\n> **Reflection:** Which of the three promises does a service you use every day defend best — and which would you bet is softest?"
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "attack-and-defense-networks",
      "puzzleRevision": "fnv1a32:984726c7",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:confidentiality": {
          "x": 568.62,
          "y": 470.15,
          "pinned": false
        },
        "term:availability": {
          "x": 607.28,
          "y": 597,
          "pinned": false
        },
        "term:integrity": {
          "x": 474.14,
          "y": 549.84,
          "pinned": false
        },
        "term:denial-of-service attack": {
          "x": 269.98,
          "y": 312.39,
          "pinned": false
        },
        "term:ransomware": {
          "x": 120.98,
          "y": 269.32,
          "pinned": false
        },
        "term:man-in-the-middle attack": {
          "x": 104.7,
          "y": 423.55,
          "pinned": false
        },
        "term:SQL injection": {
          "x": 188.39,
          "y": 169.5,
          "pinned": false
        },
        "term:botnet": {
          "x": 244.24,
          "y": 452.54,
          "pinned": false
        },
        "term:phishing": {
          "x": 773.3,
          "y": 203.15,
          "pinned": false
        },
        "term:social engineering": {
          "x": 850.66,
          "y": 307.5,
          "pinned": false
        },
        "term:pretexting": {
          "x": 880.69,
          "y": 174.65,
          "pinned": false
        },
        "term:firewall": {
          "x": 465.39,
          "y": 183.04,
          "pinned": false
        },
        "term:backup": {
          "x": 390.97,
          "y": 237.18,
          "pinned": false
        },
        "term:multi-factor authentication": {
          "x": 621.62,
          "y": 158.02,
          "pinned": false
        },
        "term:software patch": {
          "x": 320.24,
          "y": 151.65,
          "pinned": false
        },
        "term:principle of least privilege": {
          "x": 446.44,
          "y": 23,
          "pinned": false
        },
        "term:the broken promise": {
          "x": 383.23,
          "y": 452.7,
          "pinned": false
        },
        "term:the borrowed authority": {
          "x": 682.21,
          "y": 351.08,
          "pinned": false
        },
        "term:controls keep promises": {
          "x": 497.75,
          "y": 321.7,
          "pinned": false
        },
        "term:no single wall": {
          "x": 235.46,
          "y": 45.05,
          "pinned": false
        },
        "term:the human channel": {
          "x": 789.9,
          "y": 77.39,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 3822.49,
        "score": 3822.4895998607717
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:26:22.356Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "attack-and-defense-networks",
      "puzzleRevision": "fnv1a32:984726c7",
      "board": {
        "width": 960,
        "height": 620
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 436.27,
          "y": 174.27,
          "pinned": false
        },
        "cluster:1": {
          "x": 812.12,
          "y": 299.08,
          "pinned": false
        },
        "cluster:2": {
          "x": 147.88,
          "y": 336.92,
          "pinned": false
        },
        "cluster:3": {
          "x": 523.73,
          "y": 461.73,
          "pinned": false
        }
      },
      "bridges": {
        "term:the broken promise": {
          "x": 613.48,
          "y": 210.8,
          "pinned": false
        },
        "term:the borrowed authority": {
          "x": 236.92,
          "y": 200.44,
          "pinned": false
        },
        "term:controls keep promises": {
          "x": 431.96,
          "y": 298.1,
          "pinned": false
        },
        "term:no single wall": {
          "x": 741.46,
          "y": 453.94,
          "pinned": false
        },
        "term:the human channel": {
          "x": 309.93,
          "y": 410.04,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "confidentiality",
          "availability",
          "integrity"
        ],
        "cluster:1": [
          "denial-of-service attack",
          "ransomware",
          "man-in-the-middle attack",
          "SQL injection",
          "botnet"
        ],
        "cluster:2": [
          "phishing",
          "social engineering",
          "pretexting"
        ],
        "cluster:3": [
          "firewall",
          "backup",
          "multi-factor authentication",
          "software patch",
          "principle of least privilege"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "availability",
          "confidentiality",
          "integrity"
        ],
        "cluster:1": [
          "ransomware",
          "denial-of-service attack",
          "man-in-the-middle attack",
          "SQL injection",
          "botnet"
        ],
        "cluster:2": [
          "phishing",
          "social engineering",
          "pretexting"
        ],
        "cluster:3": [
          "backup",
          "software patch",
          "principle of least privilege",
          "multi-factor authentication",
          "firewall"
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
        "totalLength": 1105.6093129959247
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:26:23.448Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "attack-and-defense-networks",
      "puzzleRevision": "fnv1a32:984726c7",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:confidentiality": {
          "x": 658.46,
          "y": 255.53
        },
        "term:availability": {
          "x": 902.2,
          "y": 215.34
        },
        "term:integrity": {
          "x": 863.74,
          "y": 435.42
        },
        "term:denial-of-service attack": {
          "x": 685.5,
          "y": 594.24
        },
        "term:ransomware": {
          "x": 528.44,
          "y": 598
        },
        "term:man-in-the-middle attack": {
          "x": 369.2,
          "y": 598
        },
        "term:SQL injection": {
          "x": 375.42,
          "y": 430.21
        },
        "term:botnet": {
          "x": 220.98,
          "y": 598
        },
        "term:phishing": {
          "x": 484.26,
          "y": 156.72
        },
        "term:social engineering": {
          "x": 407.47,
          "y": 22
        },
        "term:pretexting": {
          "x": 691.28,
          "y": 22
        },
        "term:firewall": {
          "x": 110.37,
          "y": 508.85
        },
        "term:backup": {
          "x": 38.9,
          "y": 294.07
        },
        "term:multi-factor authentication": {
          "x": 326.03,
          "y": 190.81
        },
        "term:software patch": {
          "x": 230.79,
          "y": 495.87
        },
        "term:principle of least privilege": {
          "x": 108.2,
          "y": 152.62
        },
        "term:the broken promise": {
          "x": 671.23,
          "y": 410.6
        },
        "term:the borrowed authority": {
          "x": 775.8,
          "y": 135.58
        },
        "term:controls keep promises": {
          "x": 499.13,
          "y": 301.74
        },
        "term:no single wall": {
          "x": 260.08,
          "y": 358.47
        },
        "term:the human channel": {
          "x": 245.49,
          "y": 22
        },
        "cluster:0": {
          "x": 803.64,
          "y": 312.15
        },
        "cluster:1": {
          "x": 518.54,
          "y": 481.85
        },
        "cluster:2": {
          "x": 563.55,
          "y": 57.87
        },
        "cluster:3": {
          "x": 170.43,
          "y": 286.37
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-17T06:26:24.618Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "author",
    "savedAt": "2026-10-17T06:33:03.921Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
