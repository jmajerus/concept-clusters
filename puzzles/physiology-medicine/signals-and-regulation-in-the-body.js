// Concept Clusters puzzle: Signals and regulation in the body
// Standard size: 12 cluster terms + 3 bridge terms = 15 nodes.
// Matrix design: signaling-system clusters + functional lenses.

export default {
  "id": "signals-and-regulation-in-the-body",
  "title": "Signals and regulation in the body",
  "category": "Physiology & Medicine",
  "info": {
    "text": "Nervous, endocrine, and immune systems use distinct signals and pathways, yet all depend on selective recognition, communication, and regulated cellular responses.",
    "link": "wiki:Cell signaling"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Connect cellular communication with whole-body feedback, transport, and physiological regulation.",
      "link": "wiki:Homeostasis"
    },
    "entries": [
      {
        "id": "maintaining-homeostasis",
        "via": [
          "feedback loop",
          "receptor"
        ],
        "reason": "Place signaling molecules and receptors inside the larger control loops that maintain internal conditions."
      },
      {
        "id": "body-systems",
        "via": [
          "communication",
          "regulation"
        ],
        "reason": "Relate cellular messages to the nervous, endocrine, immune, and circulatory systems that coordinate the body."
      },
      {
        "id": "breathing-gas-exchange",
        "via": [
          "bloodstream",
          "target cell"
        ],
        "reason": "Compare chemical signaling through blood with the transport and exchange of respiratory gases."
      }
    ]
  },
  "lenses": [
    {
      "id": "chemical-messengers",
      "prompt": "Which concepts are chemical messengers released by cells to influence other cells?",
      "targets": [
        "neurotransmitter",
        "hormone",
        "cytokine"
      ],
      "explanation": "Neurotransmitters, hormones, and cytokines are chemical messages, but they differ in source, distance, timing, targets, and physiological context.",
      "reasons": {
        "neurotransmitter": "A neuron releases it to signal across a synapse or to a nearby target cell.",
        "hormone": "An endocrine cell releases it to act on target cells, often after transport through blood.",
        "cytokine": "Many cells, especially immune cells, release cytokines to coordinate local or systemic responses."
      }
    },
    {
      "id": "selective-recognition",
      "prompt": "Which concepts directly depend on selective molecular recognition by a receptor or antigen-binding site?",
      "targets": [
        "neurotransmitter",
        "hormone",
        "cytokine",
        "antibody",
        "target cell",
        "receptor"
      ],
      "explanation": "Signals affect only cells able to recognize them, while antibodies use binding sites to recognize antigens. Selectivity comes from molecular fit and receptor or binding-site expression.",
      "reasons": {
        "neurotransmitter": "It changes a receiving cell only if an appropriate receptor recognizes it.",
        "hormone": "A circulating hormone affects target cells that express a compatible receptor.",
        "cytokine": "Cytokine effects depend on receptor expression and downstream signaling in the responding cell.",
        "antibody": "Its antigen-binding region recognizes particular molecular structures.",
        "target cell": "A cell is a target because it has the machinery, often including a receptor, needed to respond.",
        "receptor": "Selective binding is the receptor's central role in receiving a signal."
      }
    },
    {
      "id": "circulating-through-blood",
      "prompt": "Which concepts can normally circulate through the bloodstream as signals, immune molecules, or immune cells?",
      "targets": [
        "hormone",
        "cytokine",
        "antibody",
        "lymphocyte"
      ],
      "explanation": "Blood distributes endocrine signals and also carries immune signaling molecules, antibodies, and mobile immune cells between tissues.",
      "reasons": {
        "hormone": "Many hormones reach distant target cells through the circulation.",
        "cytokine": "Some cytokines enter the circulation and contribute to systemic responses.",
        "antibody": "Secreted antibodies circulate in blood and other body fluids.",
        "lymphocyte": "Lymphocytes move through blood, lymph, and tissues as part of immune surveillance and response."
      }
    },
    {
      "id": "amplifying-responses",
      "prompt": "Which concepts can participate in cascades that multiply a signal or expand the responding cell population?",
      "targets": [
        "hormone",
        "cytokine",
        "lymphocyte",
        "feedback loop",
        "signal amplification"
      ],
      "explanation": "Hormone cascades, cytokine networks, lymphocyte proliferation, feedback, and intracellular signaling can turn a small initiating event into a much larger physiological response.",
      "reasons": {
        "hormone": "One hormone can trigger secretion of another or activate many target cells.",
        "cytokine": "Cytokines can recruit and activate additional cells and induce further signaling.",
        "lymphocyte": "Antigen-activated lymphocytes can proliferate into a larger clone of responsive cells.",
        "feedback loop": "Positive feedback can reinforce an initiating signal, while negative feedback eventually limits it.",
        "signal amplification": "Amplification explicitly multiplies downstream activity from a smaller input."
      }
    },
    {
      "id": "repeated-communication-roles",
      "prompt": "Which concepts appeared in more than one of the preceding communication lenses?",
      "targets": [
        "neurotransmitter",
        "hormone",
        "cytokine",
        "antibody",
        "lymphocyte"
      ],
      "explanation": "These concepts occupy more than one communication role: some are both messengers and receptor-dependent signals, while immune molecules and cells also circulate or amplify responses.",
      "reasons": {
        "neurotransmitter": "It appeared as both a chemical messenger and a receptor-dependent signal.",
        "hormone": "It appeared as a messenger, receptor-dependent signal, circulating molecule, and participant in amplification.",
        "cytokine": "It appeared as a messenger, receptor-dependent signal, circulating molecule, and participant in amplification.",
        "antibody": "It appeared in selective molecular recognition and circulation.",
        "lymphocyte": "It appeared in circulation and amplification through clonal expansion."
      }
    }
  ],
  "clusters": [
    {
      "name": "Nervous signaling",
      "color": "green",
      "fact": "Neurons transmit electrical changes along their membranes and use neurotransmitters at synapses to influence nearby neurons, muscles, or glands rapidly and selectively.",
      "terms": [
        "neuron",
        "action potential",
        "synapse",
        "neurotransmitter"
      ],
      "seeds": [
        "neuron",
        "synapse"
      ],
      "termInfo": {
        "neuron": {
          "text": "A specialized cell that receives, processes, and transmits information through electrical and chemical signals.",
          "link": "wiki:Neuron"
        },
        "action potential": {
          "text": "A rapid, self-propagating change in membrane voltage used to carry information along excitable cells.",
          "link": "wiki:Action potential"
        },
        "synapse": {
          "text": "A junction where a neuron communicates with another cell, usually through a chemical transmitter or direct electrical coupling.",
          "link": "wiki:Synapse"
        },
        "neurotransmitter": {
          "text": "A chemical released by a neuron that binds receptors on a nearby target cell.",
          "link": "wiki:Neurotransmitter"
        }
      },
      "info": {
        "link": "wiki:Nervous system"
      }
    },
    {
      "name": "Endocrine signaling",
      "color": "blue",
      "fact": "Endocrine cells secrete hormones that travel through extracellular fluid and often blood, but only target cells with suitable receptors and response machinery react.",
      "terms": [
        "endocrine gland",
        "hormone",
        "bloodstream",
        "target cell"
      ],
      "seeds": [
        "endocrine gland",
        "hormone"
      ],
      "termInfo": {
        "endocrine gland": {
          "text": "A ductless gland that releases hormones into surrounding fluid and the circulation.",
          "link": "wiki:Endocrine gland"
        },
        "hormone": {
          "text": "A signaling molecule produced by cells or glands that regulates activity in target cells.",
          "link": "wiki:Hormone"
        },
        "bloodstream": {
          "text": "The circulating blood through which many hormones, immune molecules, nutrients, and cells are transported.",
          "link": "wiki:Blood"
        },
        "target cell": {
          "text": "A cell able to respond to a particular signal because it expresses the relevant receptor and downstream machinery.",
          "link": "wiki:Cell signaling"
        }
      },
      "info": {
        "link": "wiki:Endocrine system"
      }
    },
    {
      "name": "Immune signaling",
      "color": "amber",
      "fact": "Immune responses depend on recognition and communication among antigen-presenting cells, lymphocytes, cytokines, and antibodies rather than on any one cell acting alone.",
      "terms": [
        "antigen-presenting cell",
        "cytokine",
        "antibody",
        "lymphocyte"
      ],
      "seeds": [
        "antibody",
        "lymphocyte"
      ],
      "termInfo": {
        "antigen-presenting cell": {
          "text": "A cell that processes antigens and displays fragments to T lymphocytes through major histocompatibility molecules.",
          "link": "wiki:Antigen-presenting cell"
        },
        "cytokine": {
          "text": "A small signaling protein used to coordinate immune, inflammatory, and other cellular responses.",
          "link": "wiki:Cytokine"
        },
        "antibody": {
          "text": "A protein produced by B-cell descendants that binds specific antigens and helps neutralize or mark targets.",
          "link": "wiki:Antibody"
        },
        "lymphocyte": {
          "text": "A white blood cell, such as a B cell or T cell, with central roles in adaptive immunity.",
          "link": "wiki:Lymphocyte"
        }
      },
      "info": {
        "link": "wiki:Immune system"
      }
    }
  ],
  "bridges": [
    {
      "term": "receptor",
      "clusters": [
        0,
        1,
        2
      ],
      "relationKind": "foundation",
      "fact": "Receptors link nervous, endocrine, and immune signaling because cells must recognize a neurotransmitter, hormone, cytokine, antigen, or related cue before they can produce a specific response.",
      "info": {
        "text": "A protein or molecular structure that selectively binds a signal and initiates or alters a cellular response.",
        "link": "wiki:Receptor (biochemistry)"
      }
    },
    {
      "term": "feedback loop",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "Feedback loops connect nervous and endocrine regulation because neural and hormonal outputs can be increased or inhibited according to the conditions and signals they help create.",
      "info": {
        "text": "A control structure in which the output of a process influences the process's subsequent activity.",
        "link": "wiki:Feedback"
      }
    },
    {
      "term": "signal amplification",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Signal amplification connects endocrine and immune responses because receptor cascades, hormone sequences, cytokine networks, and cell proliferation can magnify a small initiating signal.",
      "info": {
        "text": "The multiplication of a biological signal through a cascade in which one activated component influences many downstream components.",
        "link": "wiki:Signal transduction"
      }
    }
  ]
};
