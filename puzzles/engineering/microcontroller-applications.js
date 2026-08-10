// Concept Clusters puzzle: Microcontroller applications

// Rather than sorting end products that often span several domains, this
// puzzle groups the recurring responsibilities microcontrollers perform
// inside embedded products.

export default {
  id: "microcontroller-applications",
  title: "Microcontroller Applications",
  category: "Engineering",
  subcategories: {
    Engineering: "electronics"
  },
  tags: ["electronics", "embedded systems", "microcontrollers"],
  large: true,
  info: {
    text: "Across appliances, instruments, vehicles, and connected devices, microcontrollers repeatedly perform four kinds of work: measure inputs, control physical processes, manage human interfaces, and exchange or retain data.",
    link: "wiki:Embedded system"
  },
  relatedPuzzles: {
    info: {
      text: "Place these embedded responsibilities between the circuit behavior underneath them and the microcontroller portfolios used to implement them."
    },
    entries: [
      {
        id: "circuit-theory-basics",
        reason: "Review the voltage, current, component, and network ideas behind sensor inputs and actuator outputs."
      },
      {
        id: "microcontroller-families",
        reason: "Compare the AVR, PIC, MSP430, and STM32 portfolios that can implement these recurring embedded-system jobs."
      }
    ]
  },
  lenses: [
    {
      id: "sense-decide-act",
      prompt: "Which concepts form a physical signal path from measurement through decision to actuation?",
      targets: [
        "ADC sampling",
        "calibration",
        "threshold detection",
        "feedback control",
        "PWM output",
        "motor commutation"
      ],
      explanation: "An embedded control path samples a physical signal, corrects or interprets the measurement, makes a control decision, and drives an output. PWM and motor commutation are common ways the digital decision becomes physical action.",
      reasons: {
        "ADC sampling": "It converts an analog measurement into numeric input for firmware.",
        "calibration": "It relates raw samples to trustworthy physical values.",
        "threshold detection": "It turns a measurement into a discrete condition that can trigger a decision.",
        "feedback control": "It decides how the output should change in response to measured behavior.",
        "PWM output": "It translates a commanded level into a timed digital waveform for a power stage or load.",
        "motor commutation": "It applies the output sequence needed to produce controlled motor torque and motion."
      }
    },
    {
      id: "time-and-state",
      prompt: "Which concepts depend on firmware responding in the right order and at the right time?",
      targets: [
        "sensor polling",
        "safety interlock",
        "key scanning",
        "display multiplexing",
        "timer interrupt",
        "finite-state machine"
      ],
      explanation: "Embedded correctness is temporal as well as logical. Inputs must be checked often enough, displays refreshed regularly, unsafe transitions blocked, and system modes advanced in a deliberate order; timers and state machines provide the recurring structure.",
      reasons: {
        "sensor polling": "Polling works only when firmware revisits the sensor at a suitable interval.",
        "safety interlock": "It must prevent or force a transition before an unsafe action proceeds.",
        "key scanning": "Rows and columns must be driven and sampled in a defined sequence.",
        "display multiplexing": "Segments or digits must be refreshed rapidly and repeatedly to appear continuously lit.",
        "timer interrupt": "It gives periodic work a predictable execution point.",
        "finite-state machine": "It makes the permitted order of modes and transitions explicit."
      }
    },
    {
      id: "from-sample-to-record",
      prompt: "Which concepts help turn a sampled value into data that can be exchanged or retained?",
      targets: [
        "ADC sampling",
        "UART framing",
        "I2C transactions",
        "CAN messaging",
        "nonvolatile data logging",
        "telemetry"
      ],
      explanation: "A measurement becomes useful beyond the MCU when firmware packages it according to an interface or bus protocol, transmits it as telemetry, or writes it to nonvolatile storage. The exact route changes, but representation and persistence are always designed rather than automatic.",
      reasons: {
        "ADC sampling": "It creates the initial digital representation of an analog signal.",
        "UART framing": "It packages bytes with timing and framing information for asynchronous serial transfer.",
        "I2C transactions": "They organize addressed reads and writes between devices on a shared board-level bus.",
        "CAN messaging": "It packages data into prioritized messages for a robust shared network.",
        "nonvolatile data logging": "It preserves selected data after power is removed.",
        "telemetry": "It gives the measurement a destination beyond the local device."
      }
    }
  ],
  clusters: [
    {
      name: "Sensing and measurement",
      color: "teal",
      fact: "A microcontroller turns physical conditions into usable data by scheduling sensor reads, converting analog signals, calibrating raw values, and detecting conditions that matter to the application.",
      terms: [
        "ADC sampling",
        "sensor polling",
        "calibration",
        "threshold detection"
      ],
      seeds: [
        "ADC sampling",
        "sensor polling"
      ],
      termInfo: {
        "ADC sampling": {
          text: "Capturing an analog voltage at a chosen time and converting it to a digital number.",
          link: "wiki:Analog-to-digital converter"
        },
        "sensor polling": {
          text: "Having firmware check a sensor repeatedly instead of waiting for the sensor to signal an event.",
          link: "wiki:Polling (computer science)"
        },
        calibration: {
          text: "Comparing measurements with a reference so systematic offset, gain, or scale errors can be corrected.",
          link: "wiki:Calibration"
        },
        "threshold detection": {
          text: "Recognizing when a measured value crosses a boundary that changes the system's response.",
          link: "wiki:Thresholding (signal processing)"
        }
      },
      info: {
        link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/sensing/overview.html"
      }
    },
    {
      name: "Real-time control",
      color: "blue",
      fact: "Control firmware must observe deadlines as well as compute correct values: it updates outputs, sequences motor phases, closes feedback loops, and blocks actions that violate safety conditions.",
      terms: [
        "PWM output",
        "motor commutation",
        "feedback control",
        "safety interlock"
      ],
      seeds: [
        "PWM output",
        "feedback control"
      ],
      termInfo: {
        "PWM output": {
          text: "A digital pulse train whose duty cycle controls average power delivered through suitable external circuitry.",
          link: "wiki:Pulse-width modulation"
        },
        "motor commutation": {
          text: "Energizing motor windings in the sequence required to maintain torque and rotation.",
          link: "wiki:Brushless DC electric motor"
        },
        "feedback control": {
          text: "Adjusting an output according to the difference between desired and measured behavior.",
          link: "wiki:Control theory"
        },
        "safety interlock": {
          text: "A condition or mechanism that prevents an action unless the system is in an allowed state.",
          link: "wiki:Interlock (engineering)"
        }
      },
      info: {
        link: "https://www.ti.com/technologies/motor-control.html"
      }
    },
    {
      name: "Human-machine interface",
      color: "amber",
      fact: "Small MCUs often create an entire user interface by scanning shared input lines, refreshing displays a piece at a time, measuring touch capacitance, and producing simple audible feedback.",
      terms: [
        "key scanning",
        "display multiplexing",
        "capacitive touch",
        "audible alert"
      ],
      seeds: [
        "key scanning",
        "capacitive touch"
      ],
      termInfo: {
        "key scanning": {
          text: "Driving and reading a matrix of rows and columns to identify a pressed key with fewer I/O pins.",
          link: "wiki:Keyboard matrix circuit"
        },
        "display multiplexing": {
          text: "Refreshing display digits or segments in rapid succession so they appear continuously illuminated.",
          link: "wiki:Multiplexed display"
        },
        "capacitive touch": {
          text: "Detecting a finger by measuring the change it produces in an electrode's capacitance.",
          link: "wiki:Capacitive sensing"
        },
        "audible alert": {
          text: "A tone or sound pattern generated to report a state, warning, or completed action.",
          link: "wiki:Buzzer"
        }
      },
      info: {
        link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/sensing/overview.html"
      }
    },
    {
      name: "Communication and persistence",
      color: "magenta",
      fact: "Embedded data becomes useful elsewhere only when firmware follows an interface protocol or deliberately stores it: UART, I2C, and CAN solve different communication problems, while nonvolatile logs survive power loss.",
      terms: [
        "UART framing",
        "I2C transactions",
        "CAN messaging",
        "nonvolatile data logging"
      ],
      seeds: [
        "UART framing",
        "CAN messaging"
      ],
      termInfo: {
        "UART framing": {
          text: "Adding start, data, optional parity, and stop bits so asynchronous serial receivers can recognize each transmitted character.",
          link: "wiki:Universal asynchronous receiver-transmitter"
        },
        "I2C transactions": {
          text: "Addressed reads or writes performed over I2C's shared clock and data lines.",
          link: "wiki:I²C"
        },
        "CAN messaging": {
          text: "Exchanging prioritized, error-checked messages on a shared Controller Area Network bus.",
          link: "wiki:CAN bus"
        },
        "nonvolatile data logging": {
          text: "Recording selected measurements or events in memory that retains them without power.",
          link: "wiki:Data logger"
        }
      },
      info: {
        link: "wiki:Serial communication"
      }
    }
  ],
  bridges: [
    {
      term: "timer interrupt",
      clusters: [0, 1, 2],
      relationKind: "dynamic",
      fact: "A timer interrupt gives sensing, control, and interface work a shared time base: it can trigger periodic samples, schedule control-loop updates, and refresh a multiplexed display at stable intervals.",
      idealTerms: [
        "ADC sampling",
        "feedback control",
        "display multiplexing"
      ],
      info: {
        text: "A request for CPU attention generated when a hardware timer reaches a configured event or count.",
        link: "wiki:Interrupt"
      }
    },
    {
      term: "finite-state machine",
      clusters: [1, 2],
      relationKind: "foundation",
      fact: "A finite-state machine connects control with interaction by making modes and permitted transitions explicit—for example, allowing a user command to start motion only from an idle and safe state.",
      idealTerms: [
        "safety interlock",
        "key scanning"
      ],
      info: {
        text: "A model of behavior as a finite set of states, events that trigger transitions, and actions associated with them.",
        link: "wiki:Finite-state machine"
      }
    },
    {
      term: "telemetry",
      clusters: [0, 3],
      relationKind: "dynamic",
      fact: "Telemetry connects sensing with communication and persistence by turning measurements into records or messages that can be monitored beyond the device that captured them.",
      idealTerms: [
        "calibration",
        "nonvolatile data logging"
      ],
      info: {
        text: "The automated measurement and transmission of data from a local or remote device to another system for monitoring.",
        link: "wiki:Telemetry"
      }
    }
  ]
};
