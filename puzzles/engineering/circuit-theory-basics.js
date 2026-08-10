// Concept Clusters puzzle: Circuit theory basics

// A compact introduction to the quantities, elements, laws, and connection
// patterns used to analyze elementary electric circuits.

export default {
  id: "circuit-theory-basics",
  title: "Circuit Theory Basics",
  category: "Engineering",
  subcategories: {
    Engineering: "electronics"
  },
  tags: ["electronics", "circuits"],
  large: true,
  info: {
    text: "Basic circuit analysis relates electrical quantities to component behavior, then uses network laws and connection patterns to solve for unknown voltages and currents.",
    link: "wiki:Electrical network"
  },
  relatedPuzzles: {
    info: {
      text: "Continue from the electrical ideas inside a circuit to the programmable devices that control embedded systems."
    },
    entries: [
      {
        id: "microcontroller-families",
        reason: "Compare several major microcontroller families after reviewing the circuit quantities and laws that surround every MCU on a board."
      },
      {
        id: "microcontroller-applications",
        reason: "See how programmable devices use circuit inputs and outputs to measure, control, communicate, and interact with people."
      }
    ]
  },
  lenses: [
    {
      id: "energy-path",
      prompt: "Which concepts trace how a circuit supplies, transfers, stores, or dissipates energy?",
      targets: [
        "voltage source",
        "electric power",
        "resistor",
        "capacitor",
        "inductor",
        "power dissipation"
      ],
      explanation: "A source can deliver electrical energy, power measures its transfer rate, capacitors and inductors store it in fields, and resistors irreversibly convert part of it to heat. This energy view cuts across the quantities and component clusters.",
      reasons: {
        "voltage source": "It can supply electrical energy by maintaining a potential difference that drives current.",
        "electric power": "It measures the rate at which energy is delivered to or absorbed by an element.",
        "resistor": "It converts electrical energy into heat rather than storing it for later return.",
        "capacitor": "It stores recoverable energy in an electric field.",
        "inductor": "It stores recoverable energy in a magnetic field.",
        "power dissipation": "It names the irreversible energy-conversion role most strongly associated with resistance."
      }
    },
    {
      id: "topology-constrains-quantities",
      prompt: "Which concepts show how circuit connections constrain voltages and currents before any arithmetic begins?",
      targets: [
        "current",
        "voltage",
        "Kirchhoff's current law",
        "Kirchhoff's voltage law",
        "series connection",
        "parallel connection"
      ],
      explanation: "Topology creates equalities and conservation equations: series elements share current, parallel elements share voltage, current balances at nodes, and voltage balances around loops. Recognizing those constraints is the structural step in circuit analysis.",
      reasons: {
        "current": "A single unbranched series path forces the same current through each element on it.",
        "voltage": "Elements connected across the same two nodes must have the same voltage.",
        "Kirchhoff's current law": "It turns the way branches meet into an equation balancing their currents.",
        "Kirchhoff's voltage law": "It turns a closed path into an equation balancing voltage rises and drops.",
        "series connection": "Its unbranched topology creates a shared-current constraint.",
        "parallel connection": "Its shared-node topology creates a shared-voltage constraint."
      }
    },
    {
      id: "reduce-a-resistor-network",
      prompt: "Which concepts let you replace a resistor network with a simpler voltage-current relationship?",
      targets: [
        "resistance",
        "Ohm's law",
        "series connection",
        "parallel connection",
        "equivalent resistance"
      ],
      explanation: "Ohm's law defines each resistor's voltage-current relationship, while series and parallel rules combine those relationships into one equivalent resistance. The reduced network preserves what the rest of the circuit sees at its terminals.",
      reasons: {
        "resistance": "It is the parameter retained when a resistor network is reduced to one element.",
        "Ohm's law": "It supplies the voltage-current relation that both the original and equivalent networks must obey.",
        "series connection": "Series resistances combine by direct addition.",
        "parallel connection": "Parallel resistances combine by adding their reciprocals, or equivalently their conductances.",
        "equivalent resistance": "It is the single value that reproduces the original network's terminal behavior."
      }
    }
  ],
  clusters: [
    {
      name: "Electrical quantities",
      color: "teal",
      fact: "Voltage is energy per unit charge, current is charge flow per unit time, resistance relates voltage to current, and electric power measures the rate at which a circuit transfers energy.",
      terms: [
        "voltage",
        "current",
        "resistance",
        "electric power"
      ],
      seeds: [
        "voltage",
        "current"
      ],
      termInfo: {
        voltage: "Electric potential difference: the change in potential energy per unit charge between two points.",
        current: "The rate at which electric charge passes through a surface or circuit element.",
        resistance: "A measure of how strongly an element opposes electric current; for an ohmic element, R = V/I.",
        "electric power": {
          text: "The rate of electrical energy transfer; for a circuit element, P = VI under the passive sign convention.",
          link: "wiki:Electric power"
        }
      },
      info: {
        link: "wiki:Electricity"
      }
    },
    {
      name: "Common circuit elements",
      color: "blue",
      fact: "A resistor dissipates energy, a capacitor stores energy in an electric field, an inductor stores energy in a magnetic field, and an ideal voltage source maintains a specified potential difference.",
      terms: [
        "resistor",
        "capacitor",
        "inductor",
        "voltage source"
      ],
      seeds: [
        "resistor",
        "capacitor"
      ],
      termInfo: {
        resistor: "A two-terminal element whose defining electrical quantity is resistance.",
        capacitor: "An element that stores separated electric charge and energy in an electric field.",
        inductor: "An element that stores energy in the magnetic field produced by its current.",
        "voltage source": "An active element that maintains a voltage between its terminals, ideally independent of the current drawn."
      },
      info: {
        link: "wiki:Electronic component"
      }
    },
    {
      name: "Analysis laws and conventions",
      color: "amber",
      fact: "Ohm's law describes an ideal resistor, Kirchhoff's laws constrain currents at nodes and voltages around loops, and the passive sign convention keeps the direction of energy transfer consistent.",
      terms: [
        "Ohm's law",
        "Kirchhoff's current law",
        "Kirchhoff's voltage law",
        "passive sign convention"
      ],
      seeds: [
        "Ohm's law",
        "Kirchhoff's current law"
      ],
      termInfo: {
        "Ohm's law": "For an ideal resistor, voltage equals current times resistance: V = IR.",
        "Kirchhoff's current law": "The algebraic sum of currents at a node is zero, expressing conservation of charge.",
        "Kirchhoff's voltage law": "The algebraic sum of voltage rises and drops around a closed loop is zero.",
        "passive sign convention": {
          text: "A reference convention in which current entering an element's positive-voltage terminal gives positive absorbed power.",
          link: "wiki:Passive sign convention"
        }
      },
      info: {
        link: "wiki:Kirchhoff's circuit laws"
      }
    },
    {
      name: "Connections and reductions",
      color: "magenta",
      fact: "Series elements share one current path and parallel elements share the same two nodes; those patterns produce voltage dividers, current dividers, and simpler equivalent circuits.",
      terms: [
        "series connection",
        "parallel connection",
        "voltage divider",
        "current divider"
      ],
      seeds: [
        "series connection",
        "parallel connection"
      ],
      termInfo: {
        "series connection": "A connection in which elements lie on a single unbranched path and therefore carry the same current.",
        "parallel connection": "A connection in which elements share the same pair of nodes and therefore have the same voltage.",
        "voltage divider": "A series network whose total voltage is divided among its elements in proportion to their resistances or impedances.",
        "current divider": "A parallel network whose total current splits among branches according to their conductances or admittances."
      },
      info: {
        link: "wiki:Series and parallel circuits"
      }
    }
  ],
  bridges: [
    {
      term: "power dissipation",
      clusters: [0, 1],
      relationKind: "dynamic",
      fact: "Power dissipation connects circuit quantities to physical components: a resistor converts electrical energy into heat at a rate that can be written as VI, I²R, or V²/R.",
      idealTerms: [
        "electric power",
        "resistor"
      ],
      info: {
        text: "The conversion of electrical energy into heat or another nonrecoverable form inside a component.",
        link: "wiki:Joule heating"
      }
    },
    {
      term: "node",
      clusters: [2, 3],
      relationKind: "foundation",
      fact: "A node connects analysis laws to circuit topology: Kirchhoff's current law is written at a node, and elements in parallel are defined by sharing the same two nodes.",
      idealTerms: [
        "Kirchhoff's current law",
        "parallel connection"
      ],
      info: {
        text: "A set of directly connected points that all share the same electric potential in an ideal circuit model.",
        link: "wiki:Node (circuits)"
      }
    },
    {
      term: "equivalent resistance",
      clusters: [1, 3],
      relationKind: "foundation",
      fact: "Equivalent resistance replaces a resistor network with one resistor that presents the same terminal voltage-current relationship; series resistances add, while parallel conductances add.",
      idealTerms: [
        "resistor",
        null
      ],
      info: {
        text: "The resistance of a single resistor that would behave like a larger network when viewed from the same two terminals.",
        link: "wiki:Series and parallel circuits"
      }
    }
  ]
};
