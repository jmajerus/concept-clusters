// Generated from content/puzzles/locks-and-keys-cryptography.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "locks-and-keys-cryptography",
  "title": "Locks and Keys — How Cryptography Hides and Proves",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "networks-security"
  },
  "info": {
    "text": "How cryptography hides and proves: symmetric ciphers for speed, key pairs for strangers, one-way hashes for fingerprints, digital signatures for proof of origin, and key exchange to agree on secrets in public.",
    "links": [
      {
        "href": "wiki:Cryptography",
        "label": "Cryptography (Wikipedia)"
      }
    ],
    "citations": [
      {
        "title": "New Directions in Cryptography",
        "author": "Whitfield Diffie and Martin E. Hellman",
        "publisher": "IEEE Transactions on Information Theory, vol. IT-22, no. 6",
        "year": "1976",
        "url": "https://ee.stanford.edu/~hellman/publications/24.pdf"
      },
      {
        "title": "Advanced Encryption Standard (AES) — FIPS PUB 197",
        "author": "National Institute of Standards and Technology",
        "publisher": "NIST",
        "year": "2001",
        "url": "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf"
      }
    ]
  },
  "clusters": [
    {
      "id": "symmetric-keys",
      "name": "One shared key, fast",
      "color": "teal",
      "fact": "One secret key both scrambles and unscrambles. Symmetric ciphers are fast enough to encrypt everything — as block ciphers working on fixed-size chunks or stream ciphers one byte at a time — but both parties must already hold the same key.",
      "terms": [
        "AES",
        "symmetric-key algorithm",
        "block cipher",
        "stream cipher"
      ],
      "seeds": [
        "AES",
        "symmetric-key algorithm"
      ],
      "termInfo": {
        "AES": {
          "text": "The NIST-standard block cipher since 2001: 128-bit blocks, key sizes of 128/192/256 bits — the world's default bulk encryption.",
          "links": [
            {
              "href": "wiki:Advanced Encryption Standard"
            }
          ]
        },
        "block cipher": {
          "text": "Encrypts a fixed number of bits as one unit (AES uses 128-bit blocks), padding the message up to fit.",
          "links": [
            {
              "href": "wiki:Block cipher"
            }
          ]
        },
        "stream cipher": {
          "text": "Encrypts digits — typically bytes — one at a time; ChaCha20 is a modern example.",
          "links": [
            {
              "href": "wiki:Stream cipher"
            }
          ]
        },
        "symmetric-key algorithm": {
          "text": "Encryption where the same secret key encrypts and decrypts — also called secret-key or shared-key encryption.",
          "links": [
            {
              "href": "wiki:Symmetric-key algorithm"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Symmetric-key algorithm"
          }
        ]
      }
    },
    {
      "id": "public-keys",
      "name": "Two opposite keys",
      "color": "blue",
      "fact": "Two related keys, generated together: publish one, hoard the other. Anyone can lock a message to you with the public key; only your private key opens it — no pre-shared secret needed, at a heavy computational price.",
      "terms": [
        "public key",
        "private key",
        "public-key cryptography",
        "key pair",
        "RSA"
      ],
      "seeds": [
        "public key",
        "private key"
      ],
      "termInfo": {
        "RSA": {
          "text": "The 1977 public-key scheme of Rivest, Shamir, and Adleman, built on the difficulty of factoring large numbers.",
          "links": [
            {
              "href": "wiki:RSA cryptosystem"
            }
          ]
        },
        "key pair": {
          "text": "Two mathematically related keys from one-way functions; security rests entirely on the private half staying secret.",
          "links": [
            {
              "href": "wiki:Public-key cryptography"
            }
          ]
        },
        "private key": {
          "text": "The hoarded half: it alone decrypts what was addressed to you — or computes your signatures.",
          "links": [
            {
              "href": "wiki:Public-key cryptography"
            }
          ]
        },
        "public key": {
          "text": "The shareable half: anyone may use it to encrypt a message to you or to check your signature.",
          "links": [
            {
              "href": "wiki:Public-key cryptography"
            }
          ]
        },
        "public-key cryptography": {
          "text": "Asymmetric encryption from related key pairs — published by Diffie and Hellman in 1976, with classified British work predating it by years.",
          "links": [
            {
              "href": "wiki:Public-key cryptography"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Public-key cryptography"
          }
        ]
      }
    },
    {
      "id": "hashing",
      "name": "No key, no undo",
      "color": "amber",
      "fact": "No keys at all: a one-way function presses any input into a fixed-size digest — quick to compute, infeasible to reverse, and delicately sensitive, so that changing one character changes the digest beyond recognition.",
      "terms": [
        "cryptographic hash function",
        "digest",
        "collision resistance",
        "SHA-2"
      ],
      "seeds": [
        "cryptographic hash function",
        "digest"
      ],
      "termInfo": {
        "SHA-2": {
          "text": "The secure hash family from 2001 (SHA-256, SHA-512) still in wide use; MD5 and SHA-1 are broken and retired for security work.",
          "links": [
            {
              "href": "wiki:SHA-2"
            }
          ]
        },
        "collision resistance": {
          "text": "Infeasibility of finding any two inputs with the same digest — the birthday paradox makes it worth about half the digest's bits.",
          "links": [
            {
              "href": "wiki:Collision resistance"
            }
          ]
        },
        "cryptographic hash function": {
          "text": "Maps arbitrary input to a fixed-size digest — quick to compute, infeasible to reverse.",
          "links": [
            {
              "href": "wiki:Cryptographic hash function"
            }
          ]
        },
        "digest": {
          "text": "The fixed-size output of a hash: a fingerprint of the input where any change shows.",
          "links": [
            {
              "href": "wiki:Cryptographic hash function"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cryptographic hash function"
          }
        ]
      }
    },
    {
      "id": "signatures",
      "name": "Proving instead of hiding",
      "color": "magenta",
      "fact": "Proof of origin: the signer's private key computes a signature that anyone can check with the public key. The message cannot be forged, cannot be altered unnoticed, and the signer cannot later deny having signed it.",
      "terms": [
        "digital signature",
        "authentication",
        "non-repudiation"
      ],
      "seeds": [
        "digital signature",
        "authentication"
      ],
      "termInfo": {
        "authentication": {
          "text": "Verification that a message really came from the holder of the signing key.",
          "links": [
            {
              "href": "wiki:Authentication"
            }
          ]
        },
        "digital signature": {
          "text": "A value computed with the private key over a message's digest, verifiable by anyone holding the public key.",
          "links": [
            {
              "href": "wiki:Digital signature"
            }
          ]
        },
        "non-repudiation": {
          "text": "The signer cannot later deny having signed — a guarantee signatures give that encryption alone does not.",
          "links": [
            {
              "href": "wiki:Non-repudiation"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Digital signature"
          }
        ]
      }
    },
    {
      "id": "key-exchange",
      "name": "Agreeing in public",
      "color": "olive",
      "fact": "A ceremony for strangers: two parties exchange public numbers and each computes the same secret that no eavesdropper can — a fresh shared key, made anew for each conversation.",
      "terms": [
        "Diffie–Hellman key exchange",
        "shared secret",
        "session key",
        "forward secrecy"
      ],
      "seeds": [
        "Diffie–Hellman key exchange",
        "shared secret"
      ],
      "termInfo": {
        "Diffie–Hellman key exchange": {
          "text": "The 1976 ceremony: public numbers plus each side's private choice compute to the same secret on both ends.",
          "links": [
            {
              "href": "wiki:Diffie–Hellman key exchange"
            }
          ]
        },
        "forward secrecy": {
          "text": "The property that a later compromise of long-term keys cannot reveal past sessions that used ephemeral keys.",
          "links": [
            {
              "href": "wiki:Forward secrecy"
            }
          ]
        },
        "session key": {
          "text": "A fresh symmetric key generated per conversation, so one broken key never unlocks yesterday's traffic.",
          "links": [
            {
              "href": "wiki:Session key"
            }
          ]
        },
        "shared secret": {
          "text": "The identical secret both parties derive — while an eavesdropper who saw every exchanged message cannot compute it.",
          "links": [
            {
              "href": "wiki:Shared secret"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Diffie–Hellman key exchange"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "hybrid-cryptosystem",
      "term": "hybrid cryptosystem",
      "clusters": [
        1,
        0
      ],
      "fact": "Asymmetric math is far heavier than symmetric, so real systems (TLS, SSH, PGP) work in two moves: public-key machinery agrees on a fresh session key, then symmetric encryption carries all the actual data.",
      "relationKind": "dynamic",
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 0
      }
    },
    {
      "id": "signed-digest",
      "term": "the signed digest",
      "clusters": [
        2,
        3
      ],
      "fact": "Nobody signs a whole message: a hash function first presses it down to a short digest, and the signature covers that — faster to compute, and bound to every bit, so any alteration breaks the check.",
      "relationKind": "dynamic",
      "idealTerms": [
        "digest",
        "digital signature"
      ],
      "direction": {
        "kind": "through",
        "from": 2,
        "to": 3
      }
    },
    {
      "id": "keys-in-reverse",
      "term": "keys in reverse",
      "clusters": [
        1,
        3
      ],
      "fact": "Encryption runs the key pair one way — public key locks, private key opens. Signatures run it backwards: the private key computes the proof, the public key checks it. One key pair, two opposite services: hiding and proving.",
      "relationKind": "contrast",
      "idealTerms": [
        "private key",
        "digital signature"
      ]
    },
    {
      "id": "exchange-feeds-workhorse",
      "term": "exchange feeds the workhorse",
      "clusters": [
        4,
        0
      ],
      "fact": "Diffie–Hellman's whole output is a symmetric key: two strangers agree on a fresh shared secret in public, and that secret becomes the session key the fast symmetric cipher uses from then on.",
      "relationKind": "dynamic",
      "idealTerms": [
        "shared secret",
        null
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 0
      }
    },
    {
      "id": "authenticated-exchange",
      "term": "authenticated exchange",
      "clusters": [
        4,
        3
      ],
      "fact": "Bare Diffie–Hellman authenticates nobody — a man-in-the-middle can run the ceremony twice and sit in between. Signing the exchange is what proves the stranger on the other end is the right stranger.",
      "relationKind": "dynamic",
      "idealTerms": [
        "Diffie–Hellman key exchange",
        "digital signature"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    }
  ],
  "lenses": [
    {
      "id": "prove-not-hide",
      "prompt": "Which concepts exist to prove things to others, rather than to keep them secret?",
      "explanation": "Everything on the board that hides — ciphers, keys, session secrets — serves secrecy. Only the signature machinery exists to prove things to others: that a message came from a particular key holder (authentication), and that the signer cannot later deny it (non-repudiation). The digital signature is the mechanism those guarantees rest on; the digest helps bind it, but proves nothing about who sent it.",
      "targets": [
        "digital signature",
        "authentication",
        "non-repudiation"
      ],
      "reasons": {
        "authentication": "The guarantee that a message came from the holder of the private key.",
        "digital signature": "The mechanism of proof: private-key computation, public-key verification.",
        "non-repudiation": "The guarantee that the signer cannot later deny having signed."
      }
    },
    {
      "id": "no-keys-needed",
      "prompt": "Which concepts work with no secret key at all?",
      "explanation": "Hashing is the board's only unkeyed tool: a one-way function anyone can run, producing a digest that reveals nothing reversible. Ciphers need keys, key pairs need two, Diffie–Hellman manufactures secrets, and signatures require a private key — none of them work without one. The aha is that tamper-detection needs no secret at all.",
      "targets": [
        "cryptographic hash function",
        "digest",
        "collision resistance",
        "SHA-2"
      ],
      "reasons": {
        "SHA-2": "A hash family, not a cipher — anyone can compute it, no key involved.",
        "collision resistance": "A property of unkeyed hash functions, not of keyed algorithms.",
        "cryptographic hash function": "One-way by design; a key would make it a MAC, not a hash.",
        "digest": "The output anyone can recompute and compare — no secret required."
      }
    },
    {
      "id": "who-carries-the-bulk",
      "prompt": "In a real system like TLS, which concepts carry the bulk of the actual data?",
      "explanation": "Once the asymmetric setup is over, everything heavy goes symmetric: a block cipher like AES grinds the bulk data in fixed chunks, a stream cipher eats it byte by byte, all under the fresh session key that was just agreed. RSA and the Diffie–Hellman exchange have finished their part; the hybrid cryptosystem names the whole two-move scheme, not the carrier.",
      "targets": [
        "symmetric-key algorithm",
        "AES",
        "block cipher",
        "stream cipher",
        "session key"
      ],
      "reasons": {
        "AES": "The standard bulk cipher once the connection is up.",
        "block cipher": "The fixed-chunk work pattern of bulk encryption.",
        "session key": "The fresh symmetric key the bulk cipher actually uses.",
        "stream cipher": "The byte-at-a-time alternative for bulk encryption.",
        "symmetric-key algorithm": "The fast family that does all the heavy lifting."
      }
    },
    {
      "id": "the-crown-jewel",
      "prompt": "Which single key, if stolen, lets an attacker both read messages meant for you and forge your signature?",
      "explanation": "Both services funnel through the private key: steal it and the attacker can decrypt everything addressed to you (the encryption direction) and compute signatures you never made (the reverse direction). A stolen public key breaks nothing; a stolen session key exposes one conversation but cannot forge the past. The private key is the single point where hiding and proving both live.",
      "targets": [
        "private key"
      ],
      "reasons": {
        "private key": "The only key that decrypts incoming AND computes outgoing signatures — both directions run through it."
      }
    },
    {
      "id": "why-tapping-fails-tomorrow",
      "prompt": "Which concepts explain why recording every conversation still leaves future traffic safe — and yesterday's unreadable after a later key theft?",
      "explanation": "Fresh keys per conversation are the whole story: Diffie–Hellman agrees a new shared secret each time, the session key exists only for that one conversation, and forward secrecy is the property that even stealing every long-term key later cannot unscramble yesterday's recorded traffic. AES runs under whatever key it is given — it provides no freshness by itself.",
      "targets": [
        "Diffie–Hellman key exchange",
        "session key",
        "forward secrecy"
      ],
      "reasons": {
        "Diffie–Hellman key exchange": "The ceremony that can agree a brand-new secret each time, in public.",
        "forward secrecy": "The property that past sessions stay sealed even against a later long-term-key compromise.",
        "session key": "Made per conversation and then discarded — there is no master key to steal for the past."
      }
    },
    {
      "id": "two-tool-recipes",
      "prompt": "Which concepts are each a recipe that combines two of the board's tools into one mechanism?",
      "explanation": "Three of the board's bridges are recipes, each combining two tools into one move: the hybrid cryptosystem (public-key setup plus symmetric bulk), the signed digest (hashing pressed into signature service), and the authenticated exchange (Diffie–Hellman plus a signature to name the stranger). Keys in reverse is not a recipe — it is one tool run backwards — and the exchange-feeding story is the plumbing that makes the hybrid recipe possible.",
      "targets": [
        "hybrid cryptosystem",
        "the signed digest",
        "authenticated exchange",
        "exchange feeds the workhorse"
      ],
      "reasons": {
        "authenticated exchange": "Diffie–Hellman agreement bound with a signature.",
        "exchange feeds the workhorse": "The exchange's output handed to the symmetric cipher as its session key.",
        "hybrid cryptosystem": "Public-key setup wrapped around symmetric bulk encryption.",
        "the signed digest": "A hash of the message fed to the signature algorithm."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "how-the-internet-moves-a-message",
        "reason": "The session keys and cipher suites agreed here travel over the packet-switched delivery system explained on that board — this is what rides, that is what carries."
      },
      {
        "id": "trust-on-the-wire-tls-pki",
        "reason": "TLS is this board's toolbox assembled into a system: the hybrid cryptosystem, signed digests, and authenticated exchanges given certificates, authorities, and chains."
      },
      {
        "id": "attack-and-defense-networks",
        "reason": "The attacks that break encryption in practice steal keys and trick people — the security map shows what the toolbox is protecting and where it fails."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Hiding and proving",
    "summary": "The four tools of applied cryptography — shared keys, key pairs, one-way hashes, signatures — and the recipes that bind them.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Cryptography answers two different questions. Hiding: how do two people converse so eavesdroppers learn nothing? Proving: how does a stranger convince everyone that a message is genuine? Different tools answer each question, and modern security is their composition.\r\n\r\nFor hiding at scale, the workhorse is the symmetric cipher: both sides hold the same secret key — the same key encrypts and decrypts — and algorithms like AES scramble data fast enough to encrypt everything. The catch is the beginning: how do two strangers get the same key without meeting first? Public-key cryptography breaks that deadlock with a pair of mathematically related keys. Publish one; hoard the other. Anyone can lock a message to you with the public key that only your private key opens.\r\n\r\nHash functions are stranger and simpler: no keys at all. A one-way function presses any input — a file, a password, an entire operating-system download — into a fixed-size digest. It runs in microseconds, nobody can reverse it, and changing one character changes the digest beyond recognition, which is how downloads detect corruption and tampering.\r\n\r\nThe quiet surprise is that the key pair runs in reverse to answer the proving question. A digital signature is computed with the private key over a digest of the message, and anyone can check it with the public key: the message provably came from the key's holder, arrived unaltered, and the signer cannot later deny it.\r\n\r\nReal systems braid all of this together. Diffie–Hellman key exchange lets two strangers compute a shared secret in public; that secret becomes a fresh session key for a fast symmetric cipher; signatures on the exchange prove the stranger is the right stranger. The recipes recur so reliably they have names — the hybrid cryptosystem, the signed digest — and they are what every secure connection you open today actually runs.\r\n\r\n> **Reflection:** If your private key leaked tomorrow, which of these would break immediately — and which would still hold?"
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
    "star": {
      "schemaVersion": 1,
      "puzzleId": "locks-and-keys-cryptography",
      "puzzleRevision": "fnv1a32:4ace23f3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:AES": {
          "x": 417.76,
          "y": 654.32
        },
        "term:symmetric-key algorithm": {
          "x": 247.92,
          "y": 658
        },
        "term:block cipher": {
          "x": 105.15,
          "y": 609.54
        },
        "term:stream cipher": {
          "x": 142.3,
          "y": 533.19
        },
        "term:public key": {
          "x": 245.59,
          "y": 432.69
        },
        "term:private key": {
          "x": 396.17,
          "y": 234.6
        },
        "term:public-key cryptography": {
          "x": 146.04,
          "y": 368.07
        },
        "term:key pair": {
          "x": 45.2,
          "y": 262.51
        },
        "term:RSA": {
          "x": 132.85,
          "y": 177
        },
        "term:cryptographic hash function": {
          "x": 189.21,
          "y": 85.83
        },
        "term:digest": {
          "x": 500.5,
          "y": 189.4
        },
        "term:collision resistance": {
          "x": 282.1,
          "y": 22
        },
        "term:SHA-2": {
          "x": 409.82,
          "y": 22
        },
        "term:digital signature": {
          "x": 659.04,
          "y": 193.25
        },
        "term:authentication": {
          "x": 939.47,
          "y": 87.18
        },
        "term:non-repudiation": {
          "x": 939.87,
          "y": 213.5
        },
        "term:Diffie–Hellman key exchange": {
          "x": 679.06,
          "y": 374.75
        },
        "term:shared secret": {
          "x": 512.78,
          "y": 442.65
        },
        "term:session key": {
          "x": 918.86,
          "y": 576.68
        },
        "term:forward secrecy": {
          "x": 766.68,
          "y": 564.82
        },
        "term:hybrid cryptosystem": {
          "x": 344.88,
          "y": 368.58
        },
        "term:the signed digest": {
          "x": 589.91,
          "y": 79.04
        },
        "term:keys in reverse": {
          "x": 509.22,
          "y": 303.06
        },
        "term:exchange feeds the workhorse": {
          "x": 578.87,
          "y": 610.28
        },
        "term:authenticated exchange": {
          "x": 908.23,
          "y": 371.8
        },
        "cluster:0": {
          "x": 389.19,
          "y": 537.4
        },
        "cluster:1": {
          "x": 256.58,
          "y": 229.11
        },
        "cluster:2": {
          "x": 423.8,
          "y": 104.13
        },
        "cluster:3": {
          "x": 851.03,
          "y": 149.95
        },
        "cluster:4": {
          "x": 748.96,
          "y": 477.78
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T18:56:20.759Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "locks-and-keys-cryptography",
      "puzzleRevision": "fnv1a32:4ace23f3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "nodes": {
        "term:AES": {
          "x": 566.89,
          "y": 110.39,
          "pinned": false
        },
        "term:symmetric-key algorithm": {
          "x": 561.98,
          "y": 22,
          "pinned": false
        },
        "term:block cipher": {
          "x": 691.46,
          "y": 108.93,
          "pinned": true
        },
        "term:stream cipher": {
          "x": 731.17,
          "y": 22,
          "pinned": false
        },
        "term:public key": {
          "x": 706.92,
          "y": 325.56,
          "pinned": false
        },
        "term:private key": {
          "x": 599.24,
          "y": 382.82,
          "pinned": false
        },
        "term:public-key cryptography": {
          "x": 882.95,
          "y": 293.8,
          "pinned": true
        },
        "term:key pair": {
          "x": 733.52,
          "y": 208.89,
          "pinned": true
        },
        "term:RSA": {
          "x": 851.42,
          "y": 211.02,
          "pinned": true
        },
        "term:cryptographic hash function": {
          "x": 819.78,
          "y": 482.87,
          "pinned": true
        },
        "term:digest": {
          "x": 661.19,
          "y": 560.31,
          "pinned": true
        },
        "term:collision resistance": {
          "x": 759.43,
          "y": 622.93,
          "pinned": true
        },
        "term:SHA-2": {
          "x": 895.96,
          "y": 607.68,
          "pinned": true
        },
        "term:digital signature": {
          "x": 404.85,
          "y": 577.39,
          "pinned": true
        },
        "term:authentication": {
          "x": 418.46,
          "y": 435.96,
          "pinned": false
        },
        "term:non-repudiation": {
          "x": 274.33,
          "y": 658,
          "pinned": false
        },
        "term:Diffie–Hellman key exchange": {
          "x": 244.1,
          "y": 284.74,
          "pinned": false
        },
        "term:shared secret": {
          "x": 189.14,
          "y": 98.12,
          "pinned": true
        },
        "term:session key": {
          "x": 68.87,
          "y": 296.57,
          "pinned": false
        },
        "term:forward secrecy": {
          "x": 100.93,
          "y": 162.49,
          "pinned": false
        },
        "term:hybrid cryptosystem": {
          "x": 592.53,
          "y": 232.71,
          "pinned": false
        },
        "term:the signed digest": {
          "x": 530.39,
          "y": 658,
          "pinned": false
        },
        "term:keys in reverse": {
          "x": 553.94,
          "y": 496.75,
          "pinned": true
        },
        "term:exchange feeds the workhorse": {
          "x": 383.98,
          "y": 161.11,
          "pinned": true
        },
        "term:authenticated exchange": {
          "x": 238.47,
          "y": 494.38,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4724.41,
        "score": 4724.414699173996
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T18:57:39.758Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "locks-and-keys-cryptography",
      "puzzleRevision": "fnv1a32:4ace23f3",
      "board": {
        "width": 1060,
        "height": 680
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 566.07,
          "y": 121.75,
          "pinned": true
        },
        "cluster:1": {
          "x": 873.74,
          "y": 283.44,
          "pinned": true
        },
        "cluster:2": {
          "x": 734.25,
          "y": 551.24,
          "pinned": true
        },
        "cluster:3": {
          "x": 379.85,
          "y": 517.17,
          "pinned": true
        },
        "cluster:4": {
          "x": 148.18,
          "y": 321.51,
          "pinned": true
        }
      },
      "bridges": {
        "term:hybrid cryptosystem": {
          "x": 550.45,
          "y": 304.85,
          "pinned": true
        },
        "term:the signed digest": {
          "x": 526.38,
          "y": 656,
          "pinned": true
        },
        "term:keys in reverse": {
          "x": 541.92,
          "y": 382.54,
          "pinned": true
        },
        "term:exchange feeds the workhorse": {
          "x": 304.83,
          "y": 102,
          "pinned": true
        },
        "term:authenticated exchange": {
          "x": 130.26,
          "y": 504.39,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "AES",
          "symmetric-key algorithm",
          "block cipher",
          "stream cipher"
        ],
        "cluster:1": [
          "public key",
          "private key",
          "public-key cryptography",
          "key pair",
          "RSA"
        ],
        "cluster:2": [
          "cryptographic hash function",
          "digest",
          "collision resistance",
          "SHA-2"
        ],
        "cluster:3": [
          "digital signature",
          "authentication",
          "non-repudiation"
        ],
        "cluster:4": [
          "Diffie–Hellman key exchange",
          "shared secret",
          "session key",
          "forward secrecy"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "block cipher",
          "symmetric-key algorithm",
          "stream cipher",
          "AES"
        ],
        "cluster:1": [
          "RSA",
          "public key",
          "public-key cryptography",
          "private key",
          "key pair"
        ],
        "cluster:2": [
          "digest",
          "cryptographic hash function",
          "collision resistance",
          "SHA-2"
        ],
        "cluster:3": [
          "authentication",
          "digital signature",
          "non-repudiation"
        ],
        "cluster:4": [
          "shared secret",
          "Diffie–Hellman key exchange",
          "forward secrecy",
          "session key"
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
        "totalLength": 1858.213997951273
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T18:59:36.195Z"
    }
  },
  "board": {
    "sizeFactor": 1.1,
    "source": "author",
    "savedAt": "2026-10-16T18:56:23.942Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
