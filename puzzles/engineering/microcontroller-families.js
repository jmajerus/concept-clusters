// Concept Clusters puzzle: Microcontroller families

// The terms use recognizable family and series prefixes rather than
// individual orderable part numbers, so the grouping remains useful as
// particular devices enter and leave production.

export default {
  id: "microcontroller-families",
  title: "Microcontroller Families",
  category: "Engineering",
  subcategories: {
    Engineering: "electronics"
  },
  tags: ["electronics", "embedded systems", "microcontrollers"],
  large: true,
  info: {
    text: "Microcontroller family names identify related processor cores, memories, peripherals, tools, and migration paths—but similarly named portfolios can still span several architectures and performance levels.",
    link: "wiki:Microcontroller"
  },
  relatedPuzzles: {
    info: {
      text: "Connect programmable embedded devices back to the circuit concepts used to power, protect, and interface them."
    },
    entries: [
      {
        id: "circuit-theory-basics",
        reason: "Review the quantities, components, and laws that determine how a microcontroller interacts electrically with the rest of a circuit."
      },
      {
        id: "microcontroller-applications",
        reason: "Move from identifying MCU portfolios to the sensing, control, interface, and communication jobs their peripherals and firmware perform."
      }
    ]
  },
  lenses: [
    {
      id: "pic-spans-word-sizes",
      prompt: "Which concepts show why the PIC name alone does not identify one processor word size or core architecture?",
      targets: [
        "PIC16",
        "PIC24",
        "PIC32",
        "8-bit core",
        "16-bit core",
        "Arm Cortex-M"
      ],
      explanation: "PIC is a portfolio name rather than one CPU architecture. PIC16 belongs to its 8-bit range, PIC24 is 16-bit, and PIC32 includes multiple 32-bit branches—including PIC32C devices built around Arm Cortex-M cores.",
      reasons: {
        "PIC16": "It represents an 8-bit branch of the PIC portfolio.",
        "PIC24": "It represents the portfolio's general-purpose 16-bit branch.",
        "PIC32": "It identifies 32-bit PIC families rather than a single implementation of one core.",
        "8-bit core": "It connects PIC16 and PIC18 to the processor width they use.",
        "16-bit core": "It distinguishes PIC24 from the 8-bit PIC branches.",
        "Arm Cortex-M": "It identifies the architecture used by PIC32C, one branch within the wider PIC32 name."
      }
    },
    {
      id: "cortex-m-portfolios",
      prompt: "Which concepts form the puzzle's comparison between 32-bit portfolios that include Arm Cortex-M devices?",
      targets: [
        "PIC32",
        "STM32F",
        "STM32G",
        "STM32H",
        "STM32L",
        "Arm Cortex-M"
      ],
      explanation: "STM32 families are organized around Arm Cortex-M cores across mainstream, performance, and low-power series. PIC32 is broader: its PIC32C branch uses Cortex-M, while other PIC32 families use different 32-bit architectures. The shared bridge therefore signals overlap, not interchangeability.",
      reasons: {
        "PIC32": "Its PIC32C branch supplies the PIC side of the Cortex-M comparison.",
        "STM32F": "It is a broad, established group of Cortex-M-based STM32 series.",
        "STM32G": "It represents mainstream and mixed-signal Cortex-M STM32 devices.",
        "STM32H": "It represents the high-performance end of the Cortex-M-based STM32 range.",
        "STM32L": "It represents low-power Cortex-M STM32 devices.",
        "Arm Cortex-M": "It is the shared processor-core family that makes the cross-portfolio comparison possible."
      }
    },
    {
      id: "suffix-signals-specialization",
      prompt: "Which family labels use their suffix to signal a particular memory technology or application emphasis?",
      targets: [
        "AVR EA",
        "MSP430FR",
        "MSP430i",
        "STM32H",
        "STM32L"
      ],
      explanation: "Family suffixes often compress a design priority into the part name: AVR EA emphasizes analog sensing, MSP430FR identifies FRAM, MSP430i targets sensing and metrology, STM32H emphasizes high performance, and STM32L emphasizes low power. The exact feature set still depends on the individual device.",
      reasons: {
        "AVR EA": "The EA family is positioned around integrated analog sensing and real-time control.",
        "MSP430FR": "FR identifies MSP430 devices whose nonvolatile memory is FRAM rather than Flash.",
        "MSP430i": "The i series is associated with sensing and metrology-oriented mixed-signal peripherals.",
        "STM32H": "H identifies STM32's high-performance series grouping.",
        "STM32L": "L identifies STM32's ultra-low-power series grouping."
      }
    }
  ],
  clusters: [
    {
      name: "AVR families",
      color: "teal",
      fact: "AVR is Microchip's code-efficient 8-bit MCU architecture; the familiar ATtiny and ATmega lines now sit beside newer AVR Dx and analog-focused AVR EA families.",
      terms: [
        "ATtiny",
        "ATmega",
        "AVR Dx",
        "AVR EA"
      ],
      seeds: [
        "ATtiny",
        "ATmega"
      ],
      termInfo: {
        ATtiny: {
          text: "A group of compact 8-bit AVR microcontrollers intended for designs with modest memory and pin-count needs.",
          link: "https://www.microchip.com/en-us/products/microcontrollers/8-bit-mcus/avr-mcus"
        },
        ATmega: {
          text: "A widely used group of 8-bit AVR microcontrollers, including devices associated with early Arduino boards.",
          link: "https://www.microchip.com/en-us/products/microcontrollers/8-bit-mcus/avr-mcus"
        },
        "AVR Dx": {
          text: "A newer set of AVR families whose letter identifies the series, such as DA, DB, DD, or DU.",
          link: "https://www.microchip.com/en-us/application-notes/an3731"
        },
        "AVR EA": {
          text: "An AVR family emphasizing integrated analog sensing and real-time control peripherals.",
          link: "https://www.microchip.com/en-us/products/microcontrollers/8-bit-mcus/avr-mcus/avr-ea"
        }
      },
      info: {
        link: "https://www.microchip.com/en-us/products/microcontrollers/8-bit-mcus/avr-mcus"
      }
    },
    {
      name: "PIC families",
      color: "blue",
      fact: "The PIC name covers a broad Microchip portfolio: PIC16 and PIC18 are 8-bit families, PIC24 is 16-bit, and PIC32 extends the line into several 32-bit architectures.",
      terms: [
        "PIC16",
        "PIC18",
        "PIC24",
        "PIC32"
      ],
      seeds: [
        "PIC16",
        "PIC18"
      ],
      termInfo: {
        PIC16: {
          text: "A large group of 8-bit PIC microcontrollers traditionally associated with Microchip's mid-range cores.",
          link: "https://developerhelp.microchip.com/xwiki/bin/view/products/mcu-mpu/8bit-pic/"
        },
        PIC18: {
          text: "Microchip's high-performance 8-bit PIC family, designed with a larger instruction word and richer device options than earlier PIC cores.",
          link: "https://developerhelp.microchip.com/xwiki/bin/view/products/mcu-mpu/8bit-pic/"
        },
        PIC24: {
          text: "A family of general-purpose 16-bit PIC microcontrollers.",
          link: "https://www.microchip.com/en-us/products/microcontrollers/16-bit-mcus"
        },
        PIC32: {
          text: "A 32-bit PIC portfolio that includes both MIPS-based families and Arm Cortex-M-based PIC32C families.",
          link: "https://www.microchip.com/en-us/products/microcontrollers/32-bit-mcus"
        }
      },
      info: {
        link: "https://www.microchip.com/en-us/products/microcontrollers/pic-mcus"
      }
    },
    {
      name: "MSP430 families",
      color: "amber",
      fact: "Texas Instruments' MSP430 platform is built around 16-bit, ultra-low-power mixed-signal MCUs; its series names distinguish memory technology and peripheral or application focus.",
      terms: [
        "MSP430G",
        "MSP430F",
        "MSP430FR",
        "MSP430i"
      ],
      seeds: [
        "MSP430G",
        "MSP430FR"
      ],
      termInfo: {
        MSP430G: {
          text: "A value-oriented MSP430 series familiar from early LaunchPad development kits.",
          link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/low-power/overview.html"
        },
        MSP430F: {
          text: "Flash-memory MSP430 devices spanning general-purpose and application-specific configurations.",
          link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/low-power/overview.html"
        },
        MSP430FR: {
          text: "MSP430 devices that use nonvolatile ferroelectric RAM (FRAM) instead of Flash for program and data storage.",
          link: "https://www.ti.com/lit/an/slaa649g/slaa649g.pdf"
        },
        MSP430i: {
          text: "An MSP430 series oriented toward sensing and metrology, including devices with high-resolution sigma-delta converters.",
          link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/sensing/overview.html"
        }
      },
      info: {
        link: "https://www.ti.com/product-category/microcontrollers-processors/mcus/low-power/overview.html"
      }
    },
    {
      name: "STM32 families",
      color: "magenta",
      fact: "STMicroelectronics organizes its 32-bit Arm Cortex-M MCU portfolio by series: STM32F is broad and established, STM32G is mainstream, STM32H emphasizes performance, and STM32L emphasizes low power.",
      terms: [
        "STM32F",
        "STM32G",
        "STM32H",
        "STM32L"
      ],
      seeds: [
        "STM32F",
        "STM32L"
      ],
      termInfo: {
        STM32F: {
          text: "A broad set of STM32 series ranging from entry-level to high-performance general-purpose MCUs.",
          link: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html"
        },
        STM32G: {
          text: "Mainstream STM32 series that include economical general-purpose and mixed-signal control devices.",
          link: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html"
        },
        STM32H: {
          text: "High-performance STM32 series designed for compute-intensive real-time embedded applications.",
          link: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html"
        },
        STM32L: {
          text: "Ultra-low-power STM32 series designed for energy-constrained embedded products.",
          link: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html"
        }
      },
      info: {
        link: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html"
      }
    }
  ],
  bridges: [
    {
      term: "8-bit core",
      clusters: [0, 1],
      relationKind: "cross-cutting",
      fact: "An 8-bit core connects the AVR and PIC portfolios: current AVR MCUs use 8-bit AVR cores, while PIC16 and PIC18 are two major 8-bit branches of the wider PIC name.",
      info: {
        text: "A processor core whose native data path and general-purpose operations are organized primarily around eight-bit values.",
        link: "https://www.microchip.com/en-us/products/microcontrollers/8-bit-mcus"
      }
    },
    {
      term: "16-bit core",
      clusters: [1, 2],
      relationKind: "cross-cutting",
      fact: "A 16-bit core connects PIC24 with MSP430: PIC24 is the 16-bit branch of the PIC portfolio, while the MSP430 platform is defined around a 16-bit architecture.",
      idealTerms: [
        "PIC24",
        null
      ],
      info: {
        text: "A processor core designed to operate natively on sixteen-bit data values and registers.",
        link: "wiki:16-bit computing"
      }
    },
    {
      term: "Arm Cortex-M",
      clusters: [1, 3],
      relationKind: "cross-cutting",
      fact: "Arm Cortex-M connects the two 32-bit portfolios: PIC32C families use Cortex-M cores, while the STM32 MCU range is built around multiple Cortex-M core generations.",
      idealTerms: [
        "PIC32",
        null
      ],
      info: {
        text: "Arm's family of processor cores designed for deeply embedded, real-time microcontroller applications.",
        link: "https://www.arm.com/products/silicon-ip-cpu/cortex-m"
      }
    }
  ]
};
