// Concept Clusters puzzle: Before it crosses
// Essay-derived catalogue: Vectors — How Health Misinformation Kills
// Source: Piece 7, "The Next One"
// https://blog.majerus.us/vectors-7-the-next-one/
//
// Cluster membership is field consensus throughout, drawn from the One Health
// literature the source cites; One Health is credited in the puzzle info rather
// than left implicit. The source's own claim — that degrading detection
// capacity is a decision with a forward cost — is carried by the bridge facts
// and the second lens.

export default {
  "id": "before-it-crosses",
  "title": "Before it crosses",
  "category": "Public Health",
  "large": true,
  "info": {
    "text": "Pandemic prevention as one connected system: the conditions that bring species into contact, the steps by which a pathogen establishes itself in a new host, the means of noticing early, and the standing capacity that has to exist before any of the noticing can happen. The organising principle is One Health — the established position in the field that human, animal, and environmental health cannot usefully be assessed apart from one another.",
    "link": "https://blog.majerus.us/vectors-7-the-next-one/",
    "linkLabel": "Vectors 7: The Next One",
    "seeAlso": [
      { "href": "wiki:Public health", "label": "Public health" },
      { "href": "wiki:Epidemiology", "label": "Epidemiology" }
    ]
  },
  "relatedPuzzles": {
    "info": {
      "text": "Connect spillover risk to the biology of infection and to the institutional conditions under which warnings are or are not acted on."
    },
    "entries": [
      {
        "id": "signals-and-regulation-in-the-body",
        "via": [
          "receptor",
          "signal amplification"
        ],
        "reason": "Look inside the host at the immune signalling a novel pathogen encounters once it has crossed."
      },
      {
        "id": "climate-and-livelihoods",
        "via": [
          "land use",
          "seasonality"
        ],
        "reason": "See the same land-use and climate drivers from the perspective of the people living in the affected regions."
      },
      {
        "id": "when-correction-fails",
        "via": [
          "near miss",
          "recurrence without learning"
        ],
        "reason": "Ask why a near miss so often produces a flurry of concern and then no durable change."
      }
    ]
  },
  "lenses": [
    {
      "id": "acting-before-human-infection",
      "prompt": "Which concepts describe action taken before any person is infected?",
      "targets": [
        "land-use change",
        "wildlife trade",
        "animal reservoir",
        "spillover",
        "primary prevention"
      ],
      "explanation": "Most pandemic policy is response: treat, trace, vaccinate. Primary prevention acts upstream of all of it — at the point where the pathogen is still in the reservoir and the contact that would move it has not yet happened. It is the cheapest intervention available and the one most easily cut, because its successes are events that do not occur.",
      "reasons": {
        "land-use change": "Clearing and converting habitat creates contact zones that did not previously exist.",
        "wildlife trade": "Moving and concentrating live animals manufactures encounters between species that would not otherwise meet.",
        "animal reservoir": "The population a pathogen persists in before any human is involved, and the place upstream monitoring looks.",
        "spillover": "The crossing itself — the moment prevention is trying to stop and detection is trying to catch.",
        "primary prevention": "Acting on the conditions that generate spillover rather than on the outbreak that follows it."
      }
    },
    {
      "id": "what-a-funding-decision-removes",
      "prompt": "Which concepts name capacity that must already exist before a novel pathogen appears, and cannot be assembled once it has?",
      "targets": [
        "field epidemiology",
        "genomic sequencing",
        "laboratory network",
        "coordination agreement",
        "detection window"
      ],
      "explanation": "Detection capacity is not a service that can be purchased during an emergency. Trained epidemiologists, working laboratories, sequencing capability, and the agreements that let findings cross borders all take years to build and can be dismantled in weeks. A decision to stop funding them is not a decision about a budget line; it is a decision about how long the next outbreak runs before anyone knows it has begun.",
      "reasons": {
        "field epidemiology": "Investigators have to be trained, placed, and trusted locally long before there is anything to investigate.",
        "genomic sequencing": "Sequencing capacity near the sample is what turns an unexplained illness into an identified pathogen.",
        "laboratory network": "Distributed laboratories with compatible methods are what allow results to be compared rather than merely collected.",
        "coordination agreement": "Standing agreements determine whether a finding in one country reaches the others in days or in months.",
        "detection window": "The interval between establishment and recognition — the thing all of the above exist to shorten."
      }
    }
  ],
  "clusters": [
    {
      "name": "Conditions that create contact",
      "color": "teal",
      "fact": "Spillover opportunity is manufactured by ordinary economic activity: clearing habitat, concentrating livestock, moving live animals, and shifting the ranges species occupy. More contact means more attempts, and more attempts means more chances for one to succeed.",
      "terms": [
        "land-use change",
        "agricultural intensification",
        "wildlife trade",
        "range shift"
      ],
      "seeds": [
        "land-use change",
        "wildlife trade"
      ],
      "termInfo": {
        "land-use change": "Conversion of habitat for agriculture, settlement, or extraction, creating contact zones between people and wildlife that did not previously exist.",
        "agricultural intensification": "Concentrating animals at high density, which raises both transmission within a herd or flock and exposure among the people working with them.",
        "wildlife trade": "The capture, transport, and sale of live wild animals, bringing species into contact with each other and with humans outside their natural ranges.",
        "range shift": "Movement of animal populations into new territory as climate alters where they can live, producing novel encounters between species."
      },
      "info": {
        "link": "wiki:Ecosystem"
      }
    },
    {
      "name": "How a pathogen establishes itself",
      "color": "blue",
      "fact": "Crossing into a person is common and usually a dead end. What turns a crossing into an outbreak is the acquisition of efficient transmission between people — a threshold, not a gradient.",
      "terms": [
        "animal reservoir",
        "intermediate host",
        "reassortment",
        "sustained transmission"
      ],
      "seeds": [
        "animal reservoir",
        "sustained transmission"
      ],
      "termInfo": {
        "animal reservoir": "A species population in which a pathogen persists over time without causing the die-off that would end it.",
        "intermediate host": "A species in which a pathogen replicates on the way between reservoir and new host, sometimes acquiring the changes that make the next step possible.",
        "reassortment": "Exchange of genetic segments between two viruses infecting the same cell, capable of producing a novel combination in a single step.",
        "sustained transmission": "Continuing person-to-person spread without repeated reintroduction from an animal source."
      },
      "info": {
        "link": "wiki:Virus"
      }
    },
    {
      "name": "Noticing early",
      "color": "amber",
      "fact": "Detection is the one intervention that compresses every other response. The difference between recognizing a novel pathogen early and recognizing it late is not a difference of degree in the response; it is a difference in what response remains possible.",
      "terms": [
        "field epidemiology",
        "genomic sequencing",
        "wastewater monitoring",
        "international reporting"
      ],
      "seeds": [
        "genomic sequencing",
        "field epidemiology"
      ],
      "termInfo": {
        "field epidemiology": "Investigation conducted where an outbreak is occurring, tracing cases and contacts on the ground rather than from aggregate data.",
        "genomic sequencing": "Reading a pathogen's genetic material to identify it, track its changes, and establish how samples relate to one another.",
        "wastewater monitoring": "Sampling sewage to detect pathogen presence across a whole population without requiring anyone to seek care first.",
        "international reporting": "The obligation and the channels by which a country notifies others of an event of potential international concern."
      },
      "info": {
        "link": "wiki:Epidemiology"
      }
    },
    {
      "name": "Capacity that must exist beforehand",
      "color": "magenta",
      "fact": "Every detection method depends on infrastructure that takes years to build: trained people, working laboratories, sustained funding, and agreements that let findings cross borders. None of it can be assembled after the outbreak starts.",
      "terms": [
        "sustained funding",
        "trained workforce",
        "laboratory network",
        "coordination agreement"
      ],
      "seeds": [
        "sustained funding",
        "laboratory network"
      ],
      "termInfo": {
        "sustained funding": "Multi-year support that allows surveillance programmes to retain staff and maintain capability between emergencies.",
        "trained workforce": "Epidemiologists, veterinarians, and laboratory scientists whose training takes years and whose departure is not quickly reversed.",
        "laboratory network": "Distributed laboratories using compatible methods, so that results from different places can be compared rather than merely collected.",
        "coordination agreement": "Standing arrangements between countries and agencies governing how surveillance findings are shared and acted on."
      },
      "info": {
        "link": "wiki:Public health"
      }
    }
  ],
  "bridges": [
    {
      "term": "spillover",
      "conceptId": "spillover",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Spillover is where the ecological conditions meet the biology: contact created by land use and trade supplies the opportunity, and the pathogen's capacity to bind and replicate in a new host determines whether the opportunity is taken.",
      "idealTerms": [
        "wildlife trade",
        "animal reservoir"
      ],
      "info": {
        "text": "The transmission of a pathogen from an animal reservoir into a new host species, including humans.",
        "link": "wiki:Spillover infection"
      }
    },
    {
      "term": "detection window",
      "conceptId": "detection-window",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "The detection window is the interval between a pathogen establishing sustained transmission and anyone recognizing that it has. Surveillance does not change the biology; it changes how much of the biology happens unobserved, and that interval determines which responses are still available.",
      "idealTerms": [
        "sustained transmission",
        "genomic sequencing"
      ],
      "info": {
        "text": "The time between a pathogen becoming transmissible in a population and its recognition by a surveillance system."
      }
    },
    {
      "term": "primary prevention",
      "conceptId": "primary-prevention",
      "clusters": [
        0,
        3
      ],
      "relationKind": "evaluation",
      "fact": "Primary prevention connects the drivers to the budget. Acting on land use, trade, and reservoir monitoring costs a small fraction of responding to the outbreaks they produce — but its returns are events that never happen, which makes it the easiest capacity to cut and the hardest to defend.",
      "idealTerms": [
        "land-use change",
        "sustained funding"
      ],
      "info": {
        "text": "Intervening on the conditions that generate disease emergence, rather than on the outbreak once it has begun.",
        "link": "wiki:Public health"
      }
    }
  ]
};
