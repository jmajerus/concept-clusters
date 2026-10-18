// Generated from content/puzzles/trust-on-the-wire-tls-pki.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "trust-on-the-wire-tls-pki",
  "title": "Trust on the Wire — TLS, Certificates, and Chains of Authority",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "networks-security"
  },
  "info": {
    "text": "How an HTTPS connection proves identity: the negotiated TLS session, the certificate binding a name to a key, the authorities that vouch for it, the chain from leaf to trusted root, and revocation when a credential must be withdrawn.",
    "links": [
      {
        "href": "wiki:Transport Layer Security",
        "label": "Transport Layer Security (Wikipedia)"
      }
    ],
    "citations": [
      {
        "title": "The Transport Layer Security (TLS) Protocol Version 1.3 (RFC 8446)",
        "author": "E. Rescorla",
        "publisher": "IETF",
        "year": "2018",
        "url": "https://www.rfc-editor.org/info/rfc8446/"
      },
      {
        "title": "Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile (RFC 5280)",
        "author": "D. Cooper et al.",
        "publisher": "IETF",
        "year": "2008",
        "url": "https://www.rfc-editor.org/info/rfc5280/"
      }
    ]
  },
  "clusters": [
    {
      "id": "negotiated-session",
      "name": "The negotiated session",
      "color": "teal",
      "fact": "Before any data flows, client and server run the TLS handshake: they agree on a cipher suite, the server proves who it is, and from then on the record layer encrypts and integrity-checks everything. Plain TCP delivers bytes; TLS delivers them privately, intact, and to a proven party.",
      "terms": [
        "TLS handshake",
        "cipher suite",
        "record layer"
      ],
      "seeds": [
        "TLS handshake",
        "cipher suite"
      ],
      "termInfo": {
        "TLS handshake": {
          "text": "The opening ceremony of a TLS connection: negotiate algorithms, present the certificate, agree keys — before any data is protected.",
          "links": [
            {
              "href": "wiki:Transport Layer Security"
            }
          ]
        },
        "cipher suite": {
          "text": "The named combination of algorithms — key exchange, signature, encryption, hash — that the two sides agree to use.",
          "links": [
            {
              "href": "wiki:Cipher suite"
            }
          ]
        },
        "record layer": {
          "text": "The TLS machinery that fragments, encrypts, and integrity-checks every message once the handshake is done.",
          "links": [
            {
              "href": "wiki:Transport Layer Security"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Transport Layer Security"
          }
        ]
      }
    },
    {
      "id": "the-certificate",
      "name": "A name bound to a key",
      "color": "blue",
      "fact": "The credential: an X.509 document binding a hostname or identity to a public key, naming the authority that issued it, listing exactly which names it is good for, and stating the dates it is valid.",
      "terms": [
        "public key certificate",
        "X.509",
        "subject alternative name",
        "validity period"
      ],
      "seeds": [
        "public key certificate",
        "X.509"
      ],
      "termInfo": {
        "X.509": {
          "text": "The standard format for public key certificates on the web and in most public-key infrastructure.",
          "links": [
            {
              "href": "wiki:X.509"
            }
          ]
        },
        "public key certificate": {
          "text": "An electronic document proving that a public key belongs to its named holder.",
          "links": [
            {
              "href": "wiki:Public key certificate"
            }
          ]
        },
        "subject alternative name": {
          "text": "The certificate field listing exactly which DNS names, IP addresses, or emails the certificate is good for; the old commonName field is deprecated.",
          "links": [
            {
              "href": "wiki:Public key certificate"
            }
          ]
        },
        "validity period": {
          "text": "The Not Before / Not After dates between which the certificate may be trusted.",
          "links": [
            {
              "href": "wiki:Public key certificate"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Public key certificate"
          }
        ]
      }
    },
    {
      "id": "the-authorities",
      "name": "The authorities who vouch",
      "color": "amber",
      "fact": "Certificate authorities check that an applicant really controls the domain, then sign the credential. Roots sit pre-trusted in browser and OS trust stores, kept offline; intermediates do the day-to-day signing.",
      "terms": [
        "certificate authority",
        "domain validation",
        "root certificate",
        "intermediate certificate",
        "trust store"
      ],
      "seeds": [
        "certificate authority",
        "root certificate"
      ],
      "termInfo": {
        "certificate authority": {
          "text": "An entity that verifies identity or domain control, then stores, signs, and issues certificates.",
          "links": [
            {
              "href": "wiki:Certificate authority"
            }
          ]
        },
        "domain validation": {
          "text": "The CA's pre-issuance check that the applicant really controls the domain — via email, DNS, or an HTTP token.",
          "links": [
            {
              "href": "wiki:Domain-validated certificate"
            }
          ]
        },
        "intermediate certificate": {
          "text": "A certificate signed by a root (or another intermediate) that signs the certificates below it, keeping the root offline.",
          "links": [
            {
              "href": "wiki:Certificate authority"
            }
          ]
        },
        "root certificate": {
          "text": "The self-signed trust anchor at the top of a chain — pre-installed on devices, usually kept offline.",
          "links": [
            {
              "href": "wiki:Root certificate"
            }
          ]
        },
        "trust store": {
          "text": "The browser or operating system's collection of pre-trusted root certificates.",
          "links": [
            {
              "href": "wiki:Root certificate"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Certificate authority"
          }
        ]
      }
    },
    {
      "id": "the-chain",
      "name": "From leaf to root",
      "color": "magenta",
      "fact": "The server presents its end-entity certificate plus the intermediates; path validation walks signature by signature upward until it reaches a root the device already trusts. One failed link and the whole chain falls.",
      "terms": [
        "chain of trust",
        "path validation",
        "end-entity certificate"
      ],
      "seeds": [
        "chain of trust",
        "end-entity certificate"
      ],
      "termInfo": {
        "chain of trust": {
          "text": "The signature path from the end-entity certificate up to a root.",
          "links": [
            {
              "href": "wiki:Chain of trust"
            }
          ]
        },
        "end-entity certificate": {
          "text": "The leaf: the certificate issued to a server or person, valid only because of what signed it.",
          "links": [
            {
              "href": "wiki:Public key certificate"
            }
          ]
        },
        "path validation": {
          "text": "The client's walk up the chain — checking each signature and validity window — until a trusted root is reached.",
          "links": [
            {
              "href": "wiki:Certification path validation algorithm"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Chain of trust"
          }
        ]
      }
    },
    {
      "id": "revocation",
      "name": "Taking it back",
      "color": "olive",
      "fact": "A certificate lost or mis-issued before expiry must be publicly disavowed: through the authority's signed revocation list, through online per-certificate queries, or by the server stapling fresh status to its own handshake. If vouching cannot be undone, a stolen credential works until it expires.",
      "terms": [
        "certificate revocation list",
        "OCSP",
        "OCSP stapling"
      ],
      "seeds": [
        "certificate revocation list",
        "OCSP"
      ],
      "termInfo": {
        "OCSP": {
          "text": "The Online Certificate Status Protocol: a small per-certificate query, at the cost of latency, privacy, and responder availability.",
          "links": [
            {
              "href": "wiki:Online Certificate Status Protocol"
            }
          ]
        },
        "OCSP stapling": {
          "text": "The server delivers a cached, CA-signed status response alongside its certificate, saving the client a separate query.",
          "links": [
            {
              "href": "wiki:OCSP stapling"
            }
          ]
        },
        "certificate revocation list": {
          "text": "The CA's signed list of certificates revoked before expiry — complete but heavy, so browsers rarely fetch whole lists.",
          "links": [
            {
              "href": "wiki:Certificate revocation list"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Certificate revocation"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "presented-proof",
      "term": "the presented certificate",
      "clusters": [
        0,
        1
      ],
      "fact": "Early in the handshake the server presents its certificate — name, issuing authority, public key — and the client validates it before any application data is protected; identity is a handshake step, not an afterthought.",
      "relationKind": "dynamic",
      "idealTerms": [
        "TLS handshake",
        "public key certificate"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "inherited-validity",
      "term": "inherited validity",
      "clusters": [
        1,
        3
      ],
      "fact": "A leaf certificate is trusted only because its signer is trusted, all the way up; that borrowed validity is why path validation exists and why one broken link untrusts everything below it.",
      "relationKind": "foundation",
      "idealTerms": [
        null,
        "path validation"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "anchored-at-the-root",
      "term": "anchored at the root",
      "clusters": [
        2,
        3
      ],
      "fact": "Verification walks upward from the leaf until it reaches a root certificate already sitting in the device's trust store — the pre-installed, self-signed anchor where all downward trust begins.",
      "relationKind": "dynamic",
      "idealTerms": [
        "root certificate",
        "path validation"
      ],
      "direction": {
        "kind": "through",
        "from": 3,
        "to": 2
      }
    },
    {
      "id": "the-issuers-undo",
      "term": "the issuer's undo",
      "clusters": [
        2,
        4
      ],
      "fact": "Only the authority that issued a certificate can credibly disavow it: revocation lists and OCSP responses are the CA's own signed statements that a credential it vouched for no longer holds.",
      "relationKind": "dynamic",
      "idealTerms": [
        "certificate authority",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 4
      }
    },
    {
      "id": "stapled-status",
      "term": "stapled status",
      "clusters": [
        0,
        4
      ],
      "fact": "OCSP stapling tucks a fresh, CA-signed revocation status into the handshake itself, so the client checks the credential's standing as part of the connection it was about to make anyway.",
      "relationKind": "dynamic",
      "idealTerms": [
        "TLS handshake",
        "OCSP stapling"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 0
      }
    }
  ],
  "lenses": [
    {
      "id": "who-signs-whom",
      "prompt": "Which concepts can be the signer of another certificate?",
      "explanation": "Certificates do not sign themselves into existence. A root — or an intermediate it delegated to — signs intermediates; intermediates sign end-entity certificates; and all of that signing is done by certificate authorities: the organizations whose keys put the signatures on the documents. An end-entity certificate never signs another certificate — it is the leaf.",
      "targets": [
        "root certificate",
        "intermediate certificate",
        "certificate authority"
      ],
      "reasons": {
        "certificate authority": "The organization whose keys perform the signing at every level.",
        "intermediate certificate": "Signs end-entity (and sometimes other intermediate) certificates below it.",
        "root certificate": "Signs intermediates — and itself, as the anchor of the whole structure."
      }
    },
    {
      "id": "after-the-padlock",
      "prompt": "After the padlock appears, which concepts are responsible for protecting the traffic?",
      "explanation": "Once the handshake finishes, the negotiated cipher suite names the algorithms that do the protecting, and the record layer applies them to every message — fragmenting, encrypting, and integrity-checking as data flows. The handshake's own work is over; certificates proved identity before any of this started.",
      "targets": [
        "cipher suite",
        "record layer"
      ],
      "reasons": {
        "cipher suite": "The agreed set of algorithms doing the actual encrypting and checking.",
        "record layer": "The machinery that applies them to every message, in both directions."
      }
    },
    {
      "id": "the-road-to-trust",
      "prompt": "Which concepts name the stops on the road from a website's credential to a reason to trust it?",
      "explanation": "Trust travels a specific road: the end-entity certificate is covered by an intermediate, the intermediate by a root, and path validation is the walk that checks every signature along it. The destination is the trust store — the pre-installed collection of roots — and the chain of trust is the name of the whole road, not a stop on it. X.509 is the document format common to every stop, and the presented certificate is the arrival event, not the road.",
      "targets": [
        "end-entity certificate",
        "intermediate certificate",
        "path validation",
        "root certificate",
        "trust store"
      ],
      "reasons": {
        "end-entity certificate": "The leaf where the walk starts — the site's own credential.",
        "intermediate certificate": "The middle link that keeps roots offline while they stay useful.",
        "path validation": "The walk itself: checking each signature upward, in order.",
        "root certificate": "The anchor the walk is looking for.",
        "trust store": "Where the anchor must already live for the walk to succeed."
      }
    },
    {
      "id": "authority-only-work",
      "prompt": "Which concepts describe work only the certificate authority performs?",
      "explanation": "Three jobs belong to the authority alone. Domain validation happens before issuing — the CA must check the applicant really controls the name. And the undo is also the issuer's: revocation lists are the CA's signed disavowals, and OCSP responses come from its responder. Path validation is the client's work, the trust store is curated by browser and OS vendors, and stapling is the server's move.",
      "targets": [
        "domain validation",
        "certificate revocation list",
        "OCSP"
      ],
      "reasons": {
        "OCSP": "The CA's responder answers the status queries.",
        "certificate revocation list": "The CA signs and publishes the list of what it is taking back.",
        "domain validation": "Only the issuer runs the check that the applicant controls the name."
      }
    },
    {
      "id": "server-side-moves",
      "prompt": "Which concepts describe moves the server makes, rather than the browser?",
      "explanation": "Two of the moves are the server's: presenting its certificate — with the chain behind it — at the start of the handshake, and stapling a fresh, CA-signed OCSP response to that same handshake so the client never has to ask separately. Checking the chain is the browser's work, and the trust store belongs to the device.",
      "targets": [
        "the presented certificate",
        "OCSP stapling"
      ],
      "reasons": {
        "OCSP stapling": "The server attaches the status response itself.",
        "the presented certificate": "Presentation is the server's opening move in the handshake."
      }
    },
    {
      "id": "aftermath-of-misissuance",
      "prompt": "An authority is caught issuing a certificate for a domain it had no right to. Which concepts does the cleanup touch?",
      "explanation": "When a CA mis-issues, the cleanup runs through the machinery: the fraudulent certificates are revoked — listed or queried via OCSP — and if the failure is grave, browser vendors remove the root from the trust store entirely, ending that authority's power to vouch at all. Path validation is not part of the cleanup; it is the mechanism that will fail once the root is gone.",
      "targets": [
        "certificate authority",
        "certificate revocation list",
        "OCSP",
        "root certificate",
        "trust store"
      ],
      "reasons": {
        "certificate authority": "The failed voucher, whose future statements are now in question.",
        "certificate revocation list": "The signed disavowal of the fraudulent certificates.",
        "OCSP": "The live query that now reports those certificates as revoked.",
        "root certificate": "What browser vendors may remove in the extreme case.",
        "trust store": "Where that removal happens — the anchor's home."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "locks-and-keys-cryptography",
        "reason": "Every certificate signature, handshake key, and hashed digest is applied cryptography: that board's signatures, key exchange, and hashing are the raw materials TLS binds into identity."
      },
      {
        "id": "how-the-internet-moves-a-message",
        "reason": "TLS negotiates on top of the delivery system: the TCP transport, ports, and packet journey this board takes for granted."
      },
      {
        "id": "attack-and-defense-networks",
        "reason": "The man-in-the-middle attack is what certificates and chains were built to stop — this board is one layered defense in that security map."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Who vouches for the vouching?",
    "summary": "How HTTPS turns math into identity: certificates, the authorities who vouch, the chain from leaf to root, and what happens when trust must be withdrawn.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Your browser and a far-away server have never met. Before they exchange a single secret, the server must prove it is really the site it claims to be — because encryption without identity just builds a private tunnel to whoever happens to be standing there.\r\n\r\nThe proof is a document. A public key certificate binds a name — example.com — to a public key, in a standard format called X.509. It states who issued it, exactly which names it covers (the subject alternative name), and the validity period: the dates between which it may be trusted.\r\n\r\nBut why believe the issuer? This is the elegant part: trust is chained. The site's certificate — the end-entity, or leaf — is signed by an intermediate, which is signed by a root: a self-signed certificate already installed in your browser or operating system's trust store. Those roots, run by organizations called certificate authorities, are the pre-trusted starting points of the web. Before a CA signs anything it runs domain validation — some check that the applicant really controls the name — and after signing, it stands behind the credential: if a key leaks or a certificate was mis-issued, the CA revokes it through signed revocation lists or online status queries.\r\n\r\nThe TLS handshake is where all of this plays out at connection speed. Client and server negotiate a cipher suite — which algorithms will protect the session — the server presents its certificate and the chain behind it, the browser walks the chain up to a root it already trusts, and only then does the record layer start encrypting and integrity-checking every piece of application data.\r\n\r\nTrust at this scale also fails at this scale: when an authority mis-issues badly, browsers do not just warn — they remove its root from the trust store entirely, and its word stops meaning anything.\r\n\r\n> **Reflection:** Which link in this chain do you verify yourself when a padlock appears — and which do you delegate to others?"
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
      "puzzleId": "trust-on-the-wire-tls-pki",
      "puzzleRevision": "fnv1a32:bd0217ff",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:TLS handshake": {
          "x": 511.67,
          "y": 493.43,
          "pinned": false
        },
        "term:cipher suite": {
          "x": 544.29,
          "y": 615.93,
          "pinned": false
        },
        "term:record layer": {
          "x": 424.51,
          "y": 585.53,
          "pinned": false
        },
        "term:public key certificate": {
          "x": 231.05,
          "y": 284.09,
          "pinned": false
        },
        "term:X.509": {
          "x": 118.92,
          "y": 212.47,
          "pinned": false
        },
        "term:subject alternative name": {
          "x": 152.78,
          "y": 460.39,
          "pinned": false
        },
        "term:validity period": {
          "x": 69.25,
          "y": 311.57,
          "pinned": false
        },
        "term:certificate authority": {
          "x": 769.98,
          "y": 288.41,
          "pinned": false
        },
        "term:domain validation": {
          "x": 620.99,
          "y": 211.52,
          "pinned": false
        },
        "term:root certificate": {
          "x": 623.93,
          "y": 364.2,
          "pinned": false
        },
        "term:intermediate certificate": {
          "x": 757.83,
          "y": 99.04,
          "pinned": false
        },
        "term:trust store": {
          "x": 885.71,
          "y": 192.21,
          "pinned": false
        },
        "term:chain of trust": {
          "x": 494.45,
          "y": 139.39,
          "pinned": false
        },
        "term:path validation": {
          "x": 363.09,
          "y": 186,
          "pinned": false
        },
        "term:end-entity certificate": {
          "x": 382.94,
          "y": 23,
          "pinned": false
        },
        "term:certificate revocation list": {
          "x": 902.72,
          "y": 503.07,
          "pinned": false
        },
        "term:OCSP": {
          "x": 975.4,
          "y": 627,
          "pinned": false
        },
        "term:OCSP stapling": {
          "x": 740.31,
          "y": 440.69,
          "pinned": false
        },
        "term:the presented certificate": {
          "x": 353.77,
          "y": 436.97,
          "pinned": false
        },
        "term:inherited validity": {
          "x": 231.52,
          "y": 110.06,
          "pinned": false
        },
        "term:anchored at the root": {
          "x": 478.64,
          "y": 294.09,
          "pinned": false
        },
        "term:the issuer's undo": {
          "x": 934.45,
          "y": 319.25,
          "pinned": false
        },
        "term:stapled status": {
          "x": 640.09,
          "y": 528.21,
          "pinned": false
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4392.73,
        "score": 4392.728788970927
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-17T06:23:08.363Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "trust-on-the-wire-tls-pki",
      "puzzleRevision": "fnv1a32:bd0217ff",
      "board": {
        "width": 1010,
        "height": 650
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 734.69,
          "y": 509.49,
          "pinned": true
        },
        "cluster:1": {
          "x": 317.39,
          "y": 496.47,
          "pinned": true
        },
        "cluster:2": {
          "x": 505,
          "y": 147.05,
          "pinned": false
        },
        "cluster:3": {
          "x": 117.94,
          "y": 253.5,
          "pinned": true
        },
        "cluster:4": {
          "x": 875.03,
          "y": 275.54,
          "pinned": false
        }
      },
      "bridges": {
        "term:the presented certificate": {
          "x": 522.03,
          "y": 402.28,
          "pinned": true
        },
        "term:inherited validity": {
          "x": 79.99,
          "y": 431.53,
          "pinned": false
        },
        "term:anchored at the root": {
          "x": 261.93,
          "y": 92.66,
          "pinned": true
        },
        "term:the issuer's undo": {
          "x": 749.85,
          "y": 100.18,
          "pinned": true
        },
        "term:stapled status": {
          "x": 928.01,
          "y": 441.55,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "TLS handshake",
          "cipher suite",
          "record layer"
        ],
        "cluster:1": [
          "public key certificate",
          "X.509",
          "subject alternative name",
          "validity period"
        ],
        "cluster:2": [
          "certificate authority",
          "domain validation",
          "root certificate",
          "intermediate certificate",
          "trust store"
        ],
        "cluster:3": [
          "chain of trust",
          "path validation",
          "end-entity certificate"
        ],
        "cluster:4": [
          "certificate revocation list",
          "OCSP",
          "OCSP stapling"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "record layer",
          "TLS handshake",
          "cipher suite"
        ],
        "cluster:1": [
          "validity period",
          "subject alternative name",
          "public key certificate",
          "X.509"
        ],
        "cluster:2": [
          "root certificate",
          "certificate authority",
          "intermediate certificate",
          "domain validation",
          "trust store"
        ],
        "cluster:3": [
          "chain of trust",
          "end-entity certificate",
          "path validation"
        ],
        "cluster:4": [
          "OCSP",
          "certificate revocation list",
          "OCSP stapling"
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
        "totalLength": 1518.6939413720743
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T07:06:49.583Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "trust-on-the-wire-tls-pki",
      "puzzleRevision": "fnv1a32:bd0217ff",
      "board": {
        "width": 1010,
        "height": 650
      },
      "nodes": {
        "term:TLS handshake": {
          "x": 646.36,
          "y": 457.08
        },
        "term:cipher suite": {
          "x": 952.2,
          "y": 492.61
        },
        "term:record layer": {
          "x": 900.31,
          "y": 628
        },
        "term:public key certificate": {
          "x": 485.5,
          "y": 443.14
        },
        "term:X.509": {
          "x": 502.21,
          "y": 628
        },
        "term:subject alternative name": {
          "x": 181.64,
          "y": 628
        },
        "term:validity period": {
          "x": 67.25,
          "y": 504.08
        },
        "term:certificate authority": {
          "x": 701.59,
          "y": 174.29
        },
        "term:domain validation": {
          "x": 404.8,
          "y": 22
        },
        "term:root certificate": {
          "x": 301.75,
          "y": 133.49
        },
        "term:intermediate certificate": {
          "x": 585.52,
          "y": 22
        },
        "term:trust store": {
          "x": 746,
          "y": 22
        },
        "term:chain of trust": {
          "x": 64.1,
          "y": 311.67
        },
        "term:path validation": {
          "x": 318.95,
          "y": 465.99
        },
        "term:end-entity certificate": {
          "x": 145.95,
          "y": 46.84
        },
        "term:certificate revocation list": {
          "x": 904.95,
          "y": 78.67
        },
        "term:OCSP": {
          "x": 949.46,
          "y": 283.9
        },
        "term:OCSP stapling": {
          "x": 898.02,
          "y": 375.87
        },
        "term:the presented certificate": {
          "x": 644.37,
          "y": 628
        },
        "term:inherited validity": {
          "x": 177.1,
          "y": 401.66
        },
        "term:anchored at the root": {
          "x": 317.59,
          "y": 304.6
        },
        "term:the issuer's undo": {
          "x": 604.97,
          "y": 316.87
        },
        "term:stapled status": {
          "x": 749.4,
          "y": 348.45
        },
        "cluster:0": {
          "x": 800.82,
          "y": 505.15
        },
        "cluster:1": {
          "x": 375.3,
          "y": 620.92
        },
        "cluster:2": {
          "x": 473.16,
          "y": 189.3
        },
        "cluster:3": {
          "x": 172.47,
          "y": 219.63
        },
        "cluster:4": {
          "x": 847.08,
          "y": 248.48
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "auto",
      "savedAt": "2026-10-17T06:23:10.343Z"
    }
  },
  "board": {
    "sizeFactor": 1.05,
    "source": "author",
    "savedAt": "2026-10-17T07:06:11.758Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
