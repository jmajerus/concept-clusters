// Generated from content/puzzles/how-the-internet-moves-a-message.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "how-the-internet-moves-a-message",
  "title": "How the Internet Moves a Message",
  "category": "computer-science",
  "subcategories": {
    "computer-science": "networks-security"
  },
  "info": {
    "text": "How the Internet protocol suite delivers a message: layered responsibilities, packets that share the wire, hop-by-hop routing, the choice between TCP and UDP, and the name service that turns words into addresses.",
    "links": [
      {
        "href": "wiki:Internet protocol suite",
        "label": "Internet protocol suite (Wikipedia)"
      }
    ],
    "citations": [
      {
        "title": "Requirements for Internet Hosts — Communication Layers (RFC 1122)",
        "author": "R. Braden, ed.",
        "publisher": "IETF",
        "year": "1989",
        "url": "https://www.rfc-editor.org/info/rfc1122/"
      },
      {
        "title": "Domain Names — Implementation and Specification (RFC 1035)",
        "author": "P. Mockapetris",
        "publisher": "IETF",
        "year": "1987",
        "url": "https://www.rfc-editor.org/info/rfc1035/"
      }
    ]
  },
  "clusters": [
    {
      "id": "protocol-layers",
      "name": "The four-layer stack",
      "color": "teal",
      "fact": "Delivery is organized as a stack of concerns, each solving one problem and serving the layer above: applications create the data, transport moves it host-to-host, the internet layer routes it across networks, and the link layer carries it across one local hop.",
      "terms": [
        "application layer",
        "transport layer",
        "internet layer",
        "link layer"
      ],
      "seeds": [
        "application layer",
        "transport layer"
      ],
      "termInfo": {
        "application layer": {
          "text": "Where processes create user data and speak application protocols — HTTP for the web, DNS for names — treating everything below as a pipe.",
          "links": [
            {
              "href": "wiki:Application layer"
            }
          ]
        },
        "internet layer": {
          "text": "Gives every host an IP address and exchanges datagrams across network boundaries — the layer that makes many networks one Internet.",
          "links": [
            {
              "href": "wiki:Internet layer"
            }
          ]
        },
        "link layer": {
          "text": "Carries packets across one local link — the hop between machines that reach each other without a router.",
          "links": [
            {
              "href": "wiki:Link layer"
            }
          ]
        },
        "transport layer": {
          "text": "Moves data host-to-host and adds ports so the right program receives it; offers TCP's reliable pipe or UDP's quick dash.",
          "links": [
            {
              "href": "wiki:Transport layer"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Internet protocol suite"
          }
        ]
      }
    },
    {
      "id": "packet-switching",
      "name": "Chop, share, forward",
      "color": "blue",
      "fact": "Messages travel as packets — a header plus a payload — that share links on demand, are buffered and re-sent at every intermediate node, and are delivered best-effort: the network promises nothing.",
      "terms": [
        "packet",
        "packet switching",
        "store-and-forward",
        "best-effort delivery",
        "statistical multiplexing"
      ],
      "seeds": [
        "packet",
        "packet switching"
      ],
      "termInfo": {
        "best-effort delivery": {
          "text": "The network's only promise: it will try. Lost, duplicated, or reordered packets are the hosts' problem.",
          "links": [
            {
              "href": "wiki:Best-effort delivery"
            }
          ]
        },
        "packet": {
          "text": "A short formatted message: a header that says where it is going, a payload that carries the data.",
          "links": [
            {
              "href": "wiki:Network packet"
            }
          ]
        },
        "packet switching": {
          "text": "Grouping data into packets that share links on demand, instead of reserving a circuit for each conversation.",
          "links": [
            {
              "href": "wiki:Packet switching"
            }
          ]
        },
        "statistical multiplexing": {
          "text": "Sharing a link by demand: capacity goes to whoever has packets waiting, so a silent conversation costs nothing.",
          "links": [
            {
              "href": "wiki:Statistical time-division multiplexing"
            }
          ]
        },
        "store-and-forward": {
          "text": "Each intermediate node receives, buffers, queues, and retransmits the packet — no bit flows end to end without being handed on.",
          "links": [
            {
              "href": "wiki:Store and forward"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Packet switching"
          }
        ]
      }
    },
    {
      "id": "addressing-routing",
      "name": "Finding the way",
      "color": "amber",
      "fact": "Every packet carries a destination IP address. Routers read it, consult their routing tables, and forward the packet one hop closer to a network that knows the destination more specifically.",
      "terms": [
        "IP address",
        "router",
        "routing table",
        "hop"
      ],
      "seeds": [
        "IP address",
        "router"
      ],
      "termInfo": {
        "IP address": {
          "text": "The numeric label — 32 bits in IPv4, 128 in IPv6 — that names a host's interface on the Internet.",
          "links": [
            {
              "href": "wiki:IP address"
            }
          ]
        },
        "hop": {
          "text": "One pass through an intermediate node; hop count is one way routers measure a route's cost.",
          "links": [
            {
              "href": "wiki:Hop (computer networking)"
            }
          ]
        },
        "router": {
          "text": "A device that forwards packets between networks, reading each header and sending the packet one hop closer.",
          "links": [
            {
              "href": "wiki:Router (computing)"
            }
          ]
        },
        "routing table": {
          "text": "The router's map: destinations with a best next hop each, set by hand or learned from routing protocols.",
          "links": [
            {
              "href": "wiki:Routing table"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Routing"
          }
        ]
      }
    },
    {
      "id": "transport-bargains",
      "name": "Reliable pipe or quick dash",
      "color": "magenta",
      "fact": "Transport offers a choice of service: TCP spends a handshake, sequence numbers, and retransmission to build a dependable ordered byte stream, while UDP just sends and favors time over accuracy. A port number says which program on the machine receives the data.",
      "terms": [
        "TCP",
        "UDP",
        "three-way handshake",
        "retransmission",
        "port number"
      ],
      "seeds": [
        "TCP",
        "UDP"
      ],
      "termInfo": {
        "TCP": {
          "text": "The connection-oriented transport: it spends setup and bookkeeping to hand applications an ordered, reliable byte stream.",
          "links": [
            {
              "href": "wiki:Transmission Control Protocol"
            }
          ]
        },
        "UDP": {
          "text": "The connectionless transport: no handshake, no retransmission, no ordering — datagrams out the door, fast and fallible.",
          "links": [
            {
              "href": "wiki:User Datagram Protocol"
            }
          ]
        },
        "port number": {
          "text": "A 16-bit number in the transport header saying which program gets the data — 80 for a web server, 53 for DNS.",
          "links": [
            {
              "href": "wiki:Port (computer networking)"
            }
          ]
        },
        "retransmission": {
          "text": "TCP's repair for a silent network: if the acknowledgment timer expires, the data goes out again.",
          "links": [
            {
              "href": "wiki:Retransmission (data networks)"
            }
          ]
        },
        "three-way handshake": {
          "text": "SYN, SYN-ACK, ACK: the exchange that opens a TCP connection and agrees starting sequence numbers before any data flows.",
          "links": [
            {
              "href": "wiki:Handshake"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Transmission Control Protocol"
          },
          {
            "href": "wiki:User Datagram Protocol"
          }
        ]
      }
    },
    {
      "id": "name-resolution",
      "name": "Names before numbers",
      "color": "olive",
      "fact": "Before anything can be addressed, the human-friendly domain name must be resolved into an IP address by a hierarchy of resolvers and name servers answering from resource records.",
      "terms": [
        "domain name",
        "DNS resolver",
        "name server",
        "resource record"
      ],
      "seeds": [
        "domain name",
        "DNS resolver"
      ],
      "termInfo": {
        "DNS resolver": {
          "text": "The client-side agent that takes a name, queries the hierarchy on the user's behalf, and returns the address — usually from cache.",
          "links": [
            {
              "href": "wiki:Domain Name System"
            }
          ]
        },
        "domain name": {
          "text": "The human-readable name — www.example.com — read right to left from the top-level domain down through subdomains.",
          "links": [
            {
              "href": "wiki:Domain name"
            }
          ]
        },
        "name server": {
          "text": "A server that answers name queries: root servers refer queries onward; authoritative servers hold a zone's actual records.",
          "links": [
            {
              "href": "wiki:Name server"
            }
          ]
        },
        "resource record": {
          "text": "One entry in the DNS database: a name, a type (A for address, MX for mail, NS for delegation), a value, and a TTL.",
          "links": [
            {
              "href": "wiki:Domain Name System"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Domain Name System"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "encapsulation",
      "term": "encapsulation",
      "clusters": [
        0,
        1
      ],
      "fact": "Descending the stack, each layer wraps the layer below's unit in its own header: application data becomes a transport segment's payload, the segment rides inside an IP packet, and the packet is framed onto the wire — so the packet a router forwards is the layered stack made physical.",
      "relationKind": "dynamic",
      "idealTerms": [
        null,
        "packet"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "hop-by-hop-forwarding",
      "term": "the forwarding decision",
      "clusters": [
        1,
        2
      ],
      "fact": "Store-and-forward exists so each router can read the destination address in the packet header, look it up in its routing table, and pass the packet one hop closer — packet switching and routing are one mechanism seen from two sides.",
      "relationKind": "dynamic",
      "idealTerms": [
        "store-and-forward",
        "routing table"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "end-to-end-reliability",
      "term": "end-to-end reliability",
      "clusters": [
        1,
        3
      ],
      "fact": "The network deliberately offers only best-effort delivery; per the end-to-end principle, repairing the difference is the hosts' job — which is why TCP spends acknowledgments and retransmissions at the edges.",
      "relationKind": "dynamic",
      "idealTerms": [
        "best-effort delivery",
        "retransmission"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 3
      }
    },
    {
      "id": "socket",
      "term": "socket",
      "clusters": [
        2,
        3
      ],
      "fact": "The IP address delivers a packet to the right machine; the port number in the transport header delivers it to the right program on that machine — together they name one end of a conversation.",
      "relationKind": "foundation",
      "idealTerms": [
        "IP address",
        "port number"
      ]
    },
    {
      "id": "dns-lookup",
      "term": "DNS lookup",
      "clusters": [
        4,
        2
      ],
      "fact": "Before any packet can carry a destination address, something must turn the domain name a user typed into an IP address; resolvers and name servers exist to answer exactly that question.",
      "relationKind": "dynamic",
      "idealTerms": [
        "DNS resolver",
        "IP address"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 2
      }
    }
  ],
  "lenses": [
    {
      "id": "layer-names",
      "prompt": "Which of these concepts name one of the four layers of the TCP/IP suite — rather than a protocol, a mechanism, or an address?",
      "explanation": "The suite (RFC 1122) names four abstraction layers. Every other concept on this board lives inside those layers — protocols like TCP and UDP, mechanisms like packet switching, addresses and records — but only these four name the layers themselves.",
      "targets": [
        "application layer",
        "transport layer",
        "internet layer",
        "link layer"
      ],
      "reasons": {
        "application layer": "Where processes create user data and speak application protocols; the top of the stack.",
        "internet layer": "The layer that addresses hosts and exchanges datagrams across network boundaries.",
        "link layer": "The layer that carries packets across one local link, the scope of a single hop.",
        "transport layer": "The host-to-host layer that adds ports and offers the choice between TCP and UDP."
      }
    },
    {
      "id": "tcp-only-machinery",
      "prompt": "Which concepts are machinery that only TCP runs — and UDP never touches?",
      "explanation": "UDP is connectionless: it sends datagrams with no setup and no repair, favoring time over accuracy. Only TCP spends a three-way handshake to open a conversation, and only TCP retransmits when an acknowledgment never arrives. A port number is shared by both protocols, so it does not answer; TCP itself is the bargain, not a piece of its machinery.",
      "targets": [
        "three-way handshake",
        "retransmission"
      ],
      "reasons": {
        "retransmission": "UDP never resends; TCP keeps a timer per unacknowledged data and sends it again.",
        "three-way handshake": "UDP has no connection to set up; TCP exchanges SYN, SYN-ACK, ACK before any data flows."
      }
    },
    {
      "id": "across-the-interior",
      "prompt": "Follow one packet across the network's interior: which concepts name the node it meets, the span between nodes, the choice made there, and the buffering that makes it possible?",
      "explanation": "Packets cross the interior one hop at a time: each router receives, buffers, and re-queues the packet — store-and-forward — and performs the forwarding decision, choosing the next hop toward the destination. The routing table is what gets consulted, not the choice itself; the IP address is what gets read; the packet is the traveler, not the meeting.",
      "targets": [
        "router",
        "hop",
        "the forwarding decision",
        "store-and-forward"
      ],
      "reasons": {
        "hop": "The single pass through an intermediate node — the unit of the journey.",
        "router": "The intermediate node every packet meets on the way.",
        "store-and-forward": "The receive-buffer-queue-resend cycle that makes handing on possible.",
        "the forwarding decision": "Reading the destination and choosing the best next hop from the routing table — the work the stop exists for."
      }
    },
    {
      "id": "name-to-program",
      "prompt": "From the name a user types to the program that receives the data: which concepts form that chain, in order?",
      "explanation": "A resolver takes the domain name and queries the hierarchy until a name server answers with the IP address; later, the port number in the transport header says which program on that machine receives the data. The lookup is the whole journey, not a stop on it; resource records are what get read, not links in the chain; TCP and its handshake carry the bytes only after both endpoints are already known.",
      "targets": [
        "domain name",
        "DNS resolver",
        "name server",
        "IP address",
        "port number"
      ],
      "reasons": {
        "DNS resolver": "The client-side agent that initiates and sequences the queries on the user's behalf.",
        "IP address": "What the chain produces — the machine-readable destination the rest of the suite needs.",
        "domain name": "What the user types — the human-readable start of the chain.",
        "name server": "The server in the hierarchy that answers, or refers the query closer to an authoritative answer.",
        "port number": "The last hop: which program on the destination machine gets the data."
      }
    },
    {
      "id": "shared-wire",
      "prompt": "Which concepts explain how one shared cable carries many conversations at once, without reserving capacity for any of them?",
      "explanation": "Chopping messages into packets is what lets traffic interleave: the link goes to whoever has a packet ready, and a silent conversation costs nothing — that is statistical multiplexing. Port numbers finish the job at the ends, sorting interleaved arrivals back into their separate conversations. Store-and-forward is about how far a packet moves, not how the wire is shared; best-effort delivery is a promise level, not a sharing scheme.",
      "targets": [
        "packet switching",
        "statistical multiplexing",
        "packet",
        "port number"
      ],
      "reasons": {
        "packet": "The small unit whose brevity lets conversations interleave instead of taking turns.",
        "packet switching": "The umbrella technique: data grouped into packets that share links on demand.",
        "port number": "Endpoint demultiplexing: sorting one machine's interleaved arrivals back into per-conversation channels.",
        "statistical multiplexing": "Capacity allocated by demand — the formal name for sharing without reservation."
      }
    },
    {
      "id": "three-translations",
      "prompt": "Moving one message takes three translations between different kinds of names. Which concepts name them?",
      "explanation": "A domain name, spoken by humans, must become an IP address, spoken by routers — the DNS lookup. The address must become a program — the socket, address plus port. And the application's continuous data must become forwardable units — encapsulation, headers nested around payloads. The forwarding decision translates nothing; it chooses a path among addresses it already understands. Retransmission repairs rather than translates.",
      "targets": [
        "DNS lookup",
        "socket",
        "encapsulation"
      ],
      "reasons": {
        "DNS lookup": "Human-readable name to machine-readable address — the translation everything downstream depends on.",
        "encapsulation": "Application data to nested, forwardable units — each layer's unit becoming the payload of the next.",
        "socket": "Machine to program — the address-plus-port endpoint that finishes the delivery."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "locks-and-keys-cryptography",
        "reason": "The session keys TCP carries and the cipher suites protecting them are this board's toolbox: what encryption actually is, and how strangers agree on keys over the network built here."
      },
      {
        "id": "trust-on-the-wire-tls-pki",
        "reason": "TLS is this delivery system with trust layered on: the handshake, certificates, and chains of authority run on the packet journey explained here."
      },
      {
        "id": "attack-and-defense-networks",
        "reason": "Attacks are failures aimed at this system — floods overwhelm delivery, interception rides the wires — and the layered defenses answer them."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "The greatest coordination machine",
    "summary": "How a typed name becomes delivered data: layers, packets, routing, the transport choice, and the name system that starts it all.",
    "estimatedMinutes": 4,
    "content": {
      "mediaType": "text/markdown",
      "text": "Type an address, press Enter, and half a second later a page appears. Nothing about that is automatic. The Internet is not one machine; it is thousands of independently owned networks that have agreed on a division of labor — a small set of public rules called the Internet protocol suite, or TCP/IP.\r\n\r\nThe division is into layers. Each layer has one job and treats the layer below as a service. Applications create meaning — a web request, a mail message. The transport layer carries data between programs on two machines. The internet layer carries it across whatever networks lie in between, using IP addresses. The link layer carries it across one physical cable or radio hop. As a message descends, each layer wraps it in its own header — a letter slipped into successively larger envelopes, each addressed to the next kind of handler.\r\n\r\nNobody reserves a wire for your download. The message is chopped into packets — small envelopes that interleave with everyone else's on the same fibers — and every router along the way buffers and re-sends them, consulting its routing table to pick the next hop toward the destination address. The network's only promise is best-effort: it tries, and that is all it promises.\r\n\r\nTwo more choices complete the picture. Because the network promises so little, applications pick a transport bargain. TCP does the patient work — a three-way handshake to open the conversation, sequence numbers, acknowledgments, retransmission — to manufacture an ordered, reliable stream at the edges. UDP just sends, which is the right bargain when fresh beats perfect, as in a live call. And before any packet exists, there are names: people type domain names, and the Domain Name System — a hierarchy of resolvers and name servers — turns each name into the IP address everything else needs.\r\n\r\n> **Reflection:** Next time a page loads slowly, which link in this chain do you suspect — the name lookup, the handshake, or a packet that had to be sent twice?"
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
      "puzzleId": "how-the-internet-moves-a-message",
      "puzzleRevision": "fnv1a32:0bdd17ab",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:application layer": {
          "x": 131.13,
          "y": 373.74
        },
        "term:transport layer": {
          "x": 106.97,
          "y": 262.33
        },
        "term:internet layer": {
          "x": 130.03,
          "y": 128.85
        },
        "term:link layer": {
          "x": 261.18,
          "y": 81.7
        },
        "term:packet": {
          "x": 226.63,
          "y": 488.11
        },
        "term:packet switching": {
          "x": 286.7,
          "y": 677.08
        },
        "term:store-and-forward": {
          "x": 449.22,
          "y": 420.36
        },
        "term:best-effort delivery": {
          "x": 465.85,
          "y": 642.44
        },
        "term:statistical multiplexing": {
          "x": 165.38,
          "y": 593.9
        },
        "term:IP address": {
          "x": 631.95,
          "y": 182.59
        },
        "term:router": {
          "x": 491.44,
          "y": 22
        },
        "term:routing table": {
          "x": 419.91,
          "y": 83.85
        },
        "term:hop": {
          "x": 655.83,
          "y": 22
        },
        "term:TCP": {
          "x": 922.68,
          "y": 615.49
        },
        "term:UDP": {
          "x": 801,
          "y": 671.12
        },
        "term:three-way handshake": {
          "x": 659.93,
          "y": 637.37
        },
        "term:retransmission": {
          "x": 664.24,
          "y": 411.76
        },
        "term:port number": {
          "x": 808.45,
          "y": 386.89
        },
        "term:domain name": {
          "x": 907.54,
          "y": 132.13
        },
        "term:DNS resolver": {
          "x": 800.78,
          "y": 178.67
        },
        "term:name server": {
          "x": 993.8,
          "y": 214.41
        },
        "term:resource record": {
          "x": 978.94,
          "y": 372.68
        },
        "term:encapsulation": {
          "x": 305.88,
          "y": 383.82
        },
        "term:the forwarding decision": {
          "x": 484.06,
          "y": 263.07
        },
        "term:end-to-end reliability": {
          "x": 588.1,
          "y": 522.84
        },
        "term:socket": {
          "x": 696.23,
          "y": 288.91
        },
        "term:DNS lookup": {
          "x": 754.01,
          "y": 103.33
        },
        "cluster:0": {
          "x": 291.86,
          "y": 230.85
        },
        "cluster:1": {
          "x": 366.34,
          "y": 539.3
        },
        "cluster:2": {
          "x": 600.61,
          "y": 90.29
        },
        "cluster:3": {
          "x": 792.94,
          "y": 547.8
        },
        "cluster:4": {
          "x": 934.56,
          "y": 286.12
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T18:25:08.278Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "how-the-internet-moves-a-message",
      "puzzleRevision": "fnv1a32:0bdd17ab",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:application layer": {
          "x": 625.57,
          "y": 41.86,
          "pinned": true
        },
        "term:transport layer": {
          "x": 535.36,
          "y": 118,
          "pinned": true
        },
        "term:internet layer": {
          "x": 431.04,
          "y": 45.83,
          "pinned": true
        },
        "term:link layer": {
          "x": 796.59,
          "y": 48.81,
          "pinned": true
        },
        "term:packet": {
          "x": 789.26,
          "y": 238.63,
          "pinned": true
        },
        "term:packet switching": {
          "x": 899.02,
          "y": 178.33,
          "pinned": true
        },
        "term:store-and-forward": {
          "x": 740.29,
          "y": 351.34,
          "pinned": true
        },
        "term:best-effort delivery": {
          "x": 601.98,
          "y": 239.56,
          "pinned": true
        },
        "term:statistical multiplexing": {
          "x": 937.84,
          "y": 291.85,
          "pinned": true
        },
        "term:IP address": {
          "x": 663.15,
          "y": 554.81,
          "pinned": true
        },
        "term:router": {
          "x": 733.61,
          "y": 486.81,
          "pinned": true
        },
        "term:routing table": {
          "x": 786.88,
          "y": 622.88,
          "pinned": true
        },
        "term:hop": {
          "x": 690.48,
          "y": 673.11,
          "pinned": true
        },
        "term:TCP": {
          "x": 325.29,
          "y": 560.02,
          "pinned": true
        },
        "term:UDP": {
          "x": 416.56,
          "y": 659.21,
          "pinned": true
        },
        "term:three-way handshake": {
          "x": 257.06,
          "y": 653.25,
          "pinned": true
        },
        "term:retransmission": {
          "x": 145.2,
          "y": 587.69,
          "pinned": true
        },
        "term:port number": {
          "x": 447.07,
          "y": 576.75,
          "pinned": true
        },
        "term:domain name": {
          "x": 388.22,
          "y": 454.37,
          "pinned": true
        },
        "term:DNS resolver": {
          "x": 429.32,
          "y": 349.08,
          "pinned": true
        },
        "term:name server": {
          "x": 304.76,
          "y": 320.19,
          "pinned": true
        },
        "term:resource record": {
          "x": 266.37,
          "y": 403.24,
          "pinned": true
        },
        "term:encapsulation": {
          "x": 691.36,
          "y": 150,
          "pinned": true
        },
        "term:the forwarding decision": {
          "x": 925.17,
          "y": 481.44,
          "pinned": true
        },
        "term:end-to-end reliability": {
          "x": 146.92,
          "y": 240.25,
          "pinned": true
        },
        "term:socket": {
          "x": 570.9,
          "y": 636.84,
          "pinned": true
        },
        "term:DNS lookup": {
          "x": 583.3,
          "y": 439.57,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5050.15,
        "score": 5050.149512408546
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T18:50:19.373Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "how-the-internet-moves-a-message",
      "puzzleRevision": "fnv1a32:0bdd17ab",
      "board": {
        "width": 1100,
        "height": 710
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 409.34,
          "y": 116.92,
          "pinned": true
        },
        "cluster:1": {
          "x": 841.74,
          "y": 266.93,
          "pinned": true
        },
        "cluster:2": {
          "x": 775.63,
          "y": 592.99,
          "pinned": true
        },
        "cluster:3": {
          "x": 440.53,
          "y": 453.01,
          "pinned": true
        },
        "cluster:4": {
          "x": 166.15,
          "y": 308.92,
          "pinned": true
        }
      },
      "bridges": {
        "term:encapsulation": {
          "x": 632.78,
          "y": 144.05,
          "pinned": true
        },
        "term:the forwarding decision": {
          "x": 979.77,
          "y": 480.45,
          "pinned": true
        },
        "term:end-to-end reliability": {
          "x": 562.9,
          "y": 284.92,
          "pinned": true
        },
        "term:socket": {
          "x": 621.53,
          "y": 437.29,
          "pinned": true
        },
        "term:DNS lookup": {
          "x": 63.08,
          "y": 622.25,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "application layer",
          "transport layer",
          "internet layer",
          "link layer"
        ],
        "cluster:1": [
          "packet",
          "packet switching",
          "store-and-forward",
          "best-effort delivery",
          "statistical multiplexing"
        ],
        "cluster:2": [
          "IP address",
          "router",
          "routing table",
          "hop"
        ],
        "cluster:3": [
          "TCP",
          "UDP",
          "three-way handshake",
          "retransmission",
          "port number"
        ],
        "cluster:4": [
          "domain name",
          "DNS resolver",
          "name server",
          "resource record"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "internet layer",
          "application layer",
          "transport layer",
          "link layer"
        ],
        "cluster:1": [
          "packet",
          "statistical multiplexing",
          "best-effort delivery",
          "store-and-forward",
          "packet switching"
        ],
        "cluster:2": [
          "router",
          "routing table",
          "IP address",
          "hop"
        ],
        "cluster:3": [
          "UDP",
          "retransmission",
          "three-way handshake",
          "port number",
          "TCP"
        ],
        "cluster:4": [
          "domain name",
          "resource record",
          "DNS resolver",
          "name server"
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
        "totalLength": 2303.506025757365
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T18:52:52.257Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-16T18:50:32.972Z",
    "lensFlowTrace": true
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
